// 동기화 한 번(2단계 "지금 동기화"): 받기 → 합치기 → (메모 충돌 묻기) → 올리기 → 정리. sync-format.md 1절의 순서.
// 앱의 시험용 [지금 동기화]와 같은 흐름(앱 3-3, 2026-11-28): 메모 충돌이 남으면 내 data 파일을 올리지 않고,
// 같은 이름 내 파일의 나머지는 올린 뒤 지우고, 180일 넘게 쓰이지 않은 다른 기기 파일은 합친 뒤 지운다
// 드라이브·저장소·화면은 부르는 쪽이 넘긴다(시험에서 가짜 드라이브로 기기 둘을 흉내 내려고).
// 자동 반영(저장 뒤 몇 초 모아 올리기, 열 때·돌아올 때)은 3단계. 그때 "한 번에 하나만 돈다"와
// "올린 뒤 아직 안 올린 변경이 남았으면 한 번 더"를 더한다

import {
  pickFiles, parseDataFile, parseDeviceFile, planSync, buildDataFile, buildDeviceFile, resolvedMemoRow, dataName, deviceName,
} from './syncMerge.js';

/** 6절 (다): 다른 기기의 data-·device- 파일 중 written_at이 이보다 오래된 것은 합친 뒤 지운다 */
export const STALE_MS = 180 * 24 * 60 * 60 * 1000;

/**
 * 바뀐 파일만 받기(동기화 다음 할 일 ②): 파일 목록의 md5Checksum(없으면 수정 시각과 크기)이 지난번에 합친 것과 같으면
 * 받지 않는다. Drive changes.list 대신 이것을 쓴다: 목록은 어차피 매번 받고(내 파일·겹친 파일을 알아야 함),
 * changes.list는 페이지 토큰을 따로 지켜야 해서. 지문을 모르면 null(늘 받는다)
 */
export function fileKey(f) {
  if (f.md5Checksum) return 'md5:' + f.md5Checksum;
  return f.modifiedTime ? `t:${f.modifiedTime}/${f.size}` : null;
}

/**
 * @param o.drive DriveClient(listAppData, download, create, update, remove)
 * @param o.store { mergeWith(plan): 한 거래로 지금 데이터를 읽어 plan(data)의 puts를 쓰고 plan 결과를 돌려줌,
 *                  readAll(), applyResolved([{key, expected, row}]): 지금 행이 expected 그대로일 때만 쓰고 쓴 key들 }
 * @param o.device 이 기기ID
 * @param o.app 웹 버전(파일의 app 칸)
 * @param o.deviceInfo () => { name, position, translations }
 * @param o.askConflicts (conflicts) => Promise<(pick|null)[]> 메모 충돌마다 고른 것(멈추면 null)
 * @param o.log (글) => void
 * @param o.cache { get(): Promise<기억 | null>, set(기억): Promise } 지난번에 합친 다른 기기 파일(바뀐 파일만 받으려고. 없으면 늘 다 받는다).
 *   기억 = { [파일 id]: { key: fileKey, writtenAt, device?: parseDeviceFile 결과 } }. data 파일은 그 내용이 이 기기에
 *   들어갔을 때(메모 충돌 없이 끝났을 때)만 기억한다: 충돌을 남긴 파일을 건너뛰면 다음 동기화에서 다시 묻지 못한다
 * @returns 요약 { taken, conflicts, resolved, left, uploaded, skipped: [{name, why}], removed: [이름], newer, devices, listed }
 *   left: 고르지 않은 메모 충돌 수(있으면 uploaded가 false). devices: 다른 기기의 device 파일(parseDeviceFile 결과,
 *   position이 없는 것도 있다: 앱은 6단계 전까지 넣지 않음). 읽던 곳·역본 제안은 부르는 쪽이 한다
 */
export async function syncOnce({ drive, store, device, app, deviceInfo, askConflicts, log = () => {}, now = Date.now, cache = null }) {
  // 1. 받기. 지난번에 합친 뒤 바뀌지 않은 파일은 받지 않는다(그 내용은 이미 이 기기에 들어 있다)
  const listed = await drive.listAppData();
  const { myData, myDevice, otherData, otherDevice, dupes } = pickFiles(listed, device);
  const files = [], skipped = [], stale = [];
  const old = (writtenAt) => writtenAt > 0 && now() - writtenAt > STALE_MS; // 시각이 없으면 지우지 않는다
  const known = (cache && await cache.get().catch(() => null)) || {};
  const same = (f) => { const k = fileKey(f); return k && known[f.id]?.key === k ? known[f.id] : null; };
  const seenData = {}, seenDevice = {}; // 이번에 알게 된 파일(다음 동기화를 위한 기억)
  let newer = false;
  for (const f of otherData) {
    const was = same(f);
    if (was) {
      seenData[f.id] = was;
      if (old(was.writtenAt)) stale.push(f);
      log(`Unchanged ${f.name}`);
      continue;
    }
    let parsed;
    try {
      parsed = parseDataFile(f.name, await drive.download(f.id));
    } catch (e) {
      parsed = { skip: 'download: ' + (e.message || e) };
    }
    if (parsed.skip) {
      skipped.push({ name: f.name, why: parsed.skip });
      if (parsed.skip === 'newer') newer = true;
      log(`Skipped ${f.name} (${parsed.skip})`);
      continue;
    }
    files.push(parsed);
    if (fileKey(f)) seenData[f.id] = { key: fileKey(f), writtenAt: parsed.writtenAt };
    if (old(parsed.writtenAt)) stale.push(f); // 합친 뒤 지운다(그 기록은 내 파일에 남는다)
    log(`Read ${f.name} (${parsed.client || '?'} ${parsed.app || ''})`);
  }

  // 2. 합치기: 한 거래 안에서 그 순간의 지금 행과 비교해 쓴다(먼저 읽어 둔 것으로 덮어쓰지 않게)
  const plan = await store.mergeWith((local) => planSync(local, files, device));
  const took = Object.entries(plan.taken).filter(([, n]) => n).map(([t, n]) => `${t} ${n}`).join(', ');
  log('Merged: ' + (took || 'nothing new'));

  // 3. 메모 충돌(서로 모르는 고침): [이 기기][다른 기기][둘 다]. 고른 것은 지금 시각으로, vv는 두 쪽의 큰 값 위에
  //    이 기기를 찍어 쓴다(다른 기기가 다시 묻지 않게). 고르지 않은 것(멈춤)은 이 기기 행 그대로라 다음에 다시 묻는다
  let resolved = 0, left = 0;
  if (plan.conflicts.length) {
    log(`Memo conflicts: ${plan.conflicts.length}`);
    const picks = await askConflicts(plan.conflicts);
    const items = [];
    plan.conflicts.forEach((c, i) => {
      const pick = picks[i];
      if (!pick) {
        left++;
        return;
      }
      items.push({ key: c.key, expected: c.local, row: resolvedMemoRow(c.local, c.other, pick, device, now()) });
    });
    // 고르는 동안 다른 탭에서 그 메모를 고쳤으면 쓰지 않는다(다음 동기화에서 다시 판단)
    resolved = (await store.applyResolved(items)).length;
    left += items.length - resolved;
    log(`Resolved ${resolved}, left ${left}`);
  }

  // 4. 올리기: 내 DB 전체로 내 파일을 다시 쓴다. 고르지 않은 메모 충돌이 남았으면 올리지 않는다:
  //    고르기 전에 올리면 다른 기기도 같은 충돌을 묻게 된다(앱과 같다). 고른 뒤 다시 동기화하면 올린다
  const uploaded = left === 0;
  if (uploaded) {
    const data = await store.readAll();
    const text = buildDataFile({ device, app, now: now(), data });
    if (myData) await drive.update(myData.id, text);
    else await drive.create(dataName(device), text);
    log(`Uploaded ${dataName(device)} (${Math.round(text.length / 1024)} KB)`);
  } else {
    log(`Not uploaded ${dataName(device)}: ${left} memo conflict(s) left. Sync again after choosing`);
  }

  const info = deviceInfo();
  const dev = buildDeviceFile({ device, app, now: now(), ...info });
  if (myDevice) await drive.update(myDevice.id, dev);
  else await drive.create(deviceName(device), dev);
  log(`Uploaded ${deviceName(device)}`);

  // 5. 정리: 같은 이름 내 파일의 나머지(2절)는 올린 뒤에 지운다(먼저 지우면 올리다 실패했을 때 남는 것이 없다)
  const removed = [];
  for (const f of dupes) {
    await drive.remove(f.id);
    removed.push(f.name);
    log(`Removed duplicate ${f.name}`);
  }

  // 6. 다른 기기의 device 파일(4절): 합치지 않고 읽기만. 못 읽어도 동기화는 이미 끝났으므로 건너뛰기만 한다
  const devices = [];
  for (const f of otherDevice) {
    let d = same(f)?.device;
    if (!d) {
      try {
        d = parseDeviceFile(f.name, await drive.download(f.id));
      } catch (e) {
        d = { skip: 'download: ' + (e.message || e) };
      }
      if (!d.skip && fileKey(f)) seenDevice[f.id] = { key: fileKey(f), writtenAt: d.writtenAt, device: d };
    } else {
      seenDevice[f.id] = known[f.id];
    }
    if (d.skip) {
      skipped.push({ name: f.name, why: d.skip });
      if (d.skip === 'newer') newer = true;
      log(`Skipped ${f.name} (${d.skip})`);
      continue;
    }
    if (old(d.writtenAt)) {
      stale.push(f); // 오래 쓰이지 않은 기기의 읽던 곳·역본은 제안하지 않는다
      continue;
    }
    devices.push(d);
    const p = d.position;
    log(`Device ${d.name}: ${p ? `book ${p.book_id} ch ${p.chapter_no}:${p.verse_no}` : 'no position'}, ${d.translations.length} translation(s)`);
  }

  // 7. 180일 넘게 쓰이지 않은 다른 기기 파일을 지운다(6절 (다)). data 파일은 그 기록이 내 파일에 들어간 뒤라야
  //    지울 수 있으므로 내 파일을 올렸을 때만. 건너뛴 파일(깨짐·더 새 판)은 합치지 못했으니 지우지 않는다
  for (const f of stale) {
    if (!uploaded && f.name.startsWith('data-')) continue;
    await drive.remove(f.id);
    removed.push(f.name);
    log(`Removed stale ${f.name} (over 180 days)`);
  }
  if (newer) log('Another device has a newer app version. Please update.');

  // 8. 기억: 메모 충돌 없이 끝났으면 이번에 합친 data 파일까지, 아니면 지난번 기억 중 아직 있는 data 파일만(device 파일은
  //    합치지 않으므로 늘 기억해도 된다). 지운 파일은 빠진다
  if (cache) {
    const gone = new Set(removed);
    const next = {};
    const data = uploaded ? seenData
      : Object.fromEntries(otherData.filter((f) => known[f.id] && same(f)).map((f) => [f.id, known[f.id]]));
    for (const f of [...otherData, ...otherDevice]) {
      const e = data[f.id] || seenDevice[f.id];
      if (e && !gone.has(f.name)) next[f.id] = e;
    }
    await cache.set(next).catch((e) => log('Could not remember files: ' + (e.message || e)));
  }

  // listed: 처음 받은 드라이브 목록(역본 파일 bibleSync가 목록을 다시 받지 않게. 역본 파일은 여기서 건드리지 않는다)
  return { taken: plan.taken, conflicts: plan.conflicts.length, resolved, left, uploaded, skipped, removed, newer, devices, listed };
}
