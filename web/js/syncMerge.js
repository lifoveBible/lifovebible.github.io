// 동기화 파일 읽고 쓰기와 합치기(DOM·IndexedDB 없이). 기준은 앱 저장소 docs/sync-format.md(판 1).
// 웹은 그 문서를 따르기만 한다. 문서와 다르게 해야 할 일이 생기면 사용자에게 먼저 말한다(CLAUDE.md).
//
// - 3절 data-<기기ID>.json: 표 전체(지운 행 포함). 표·칸 이름은 앱 DB 그대로, book_id는 0부터(웹 DB도 0부터)
// - 4절 device-<기기ID>.json: 기기 이름, 읽던 곳, 받아 둔 역본 목록
// - 5절 합치기: 나중 updated_at이 이긴다(내용이 같아도 시각을 맞춘다). 시각이 같으면 6절 (나). 메모는 판 2의
//   버전 벡터(my_memo.vv)로 서로 모르는 고침이 있을 때만 묻는다.
//   ver_setting은 6절 (가) 목록째. 5a: 받아 둔 역본으로 행을 거르지 않는다(이 기기에 없는 역본의 기록도 받아 두고 다시 올린다)
// 복구(앱 백업 합치기)는 mergeRules.js의 옛 규칙("시각이 같으면 지금 것") 그대로다. 동기화만 여기 규칙을 쓴다

import {
  KEEP_LOCAL, TAKE_OTHER, CONFLICT, PICK_LOCAL, PICK_OTHER, resolveMemo, syncRec, syncLatest as latestRule, syncMemo,
  syncVerOrder, effectiveVv, maxVv, stampVv,
} from './mergeRules.js';

/** 이 웹이 아는 파일 판(sync-format의 format) */
export const FORMAT = 1;
/** 웹이 맞춘 앱 DB 버전(참고용 db_version 칸) */
export const DB_VERSION = 12;
export const DEFAULT_MEMO_BOOK = 'default';

/** 표마다 키와 '나머지 칸'(sync-format 3절 표의 순서. 6절 (나)의 비교 순서이기도 하다) */
export const SYNC_TABLES = {
  my_underline: { keys: ['ver', 'book_id', 'chapter_no', 'verse_no'], rest: ['verse_content', 'type'] },
  my_memo: { keys: ['memo_book', 'book_id', 'chapter_no', 'verse_no'], rest: ['memo', 'type', 'ver'] },
  memo_book: {
    keys: ['uid'],
    rest: ['name', 'book_order', 'continuous_input', 'skip_filled', 'next_chapter', 'enter_saves', 'created_at'],
  },
  my_read_check: { keys: ['ver', 'book_id', 'chapter_no', 'check_table_id'], rest: ['check_datetime'] },
  ver_setting: { keys: ['ver'], rest: ['ver_order', 'text_color'] },
  my_bookmark: { keys: ['book_id', 'chapter_no', 'verse_no'], rest: ['created_at'] },
};
/** 합치는 차례. 메모책을 메모보다 먼저(5절: 메모가 가리키는 메모책이 먼저 있어야 해서) */
export const SYNC_ORDER = ['memo_book', 'my_memo', 'my_underline', 'my_read_check', 'my_bookmark', 'ver_setting'];

// 글자 칸. 나머지는 정수 칸. null을 그대로 두는 칸(3절: 기본 메모책 name, check_datetime)
const TEXT_COLS = new Set(['ver', 'memo_book', 'uid', 'verse_content', 'memo', 'name', 'check_datetime']);
const NULLABLE = new Set(['name', 'check_datetime']);

/** 행을 알아보는 키(Map 키). JSON이라 숫자 1과 글자 '1'이 섞이지 않는다 */
export function keyOf(table, row) {
  return JSON.stringify(SYNC_TABLES[table].keys.map((k) => row[k]));
}

/**
 * 파일이나 IndexedDB의 행을 표의 칸만 남긴 꼴로(3절 '읽는 쪽이 지킬 것'): 모르는 칸은 버리고, 없는 칸은 DB 기본값
 * (memo_book → "default", 숫자 → 0, 글자 → ""). 키가 없거나 틀린 행은 null(그 행만 건너뛴다)
 */
export function normalizeRow(table, raw) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
  const t = SYNC_TABLES[table];
  const out = {};
  for (const k of t.keys) {
    let v = raw[k];
    if (k === 'memo_book' && v == null) v = DEFAULT_MEMO_BOOK; // 옛 데이터(3절)
    if (v == null) return null;
    if (TEXT_COLS.has(k)) {
      if (typeof v !== 'string') return null;
    } else {
      v = Number(v);
      if (!Number.isInteger(v)) return null;
    }
    out[k] = v;
  }
  for (const c of [...t.rest, 'updated_at', 'deleted']) {
    const v = raw[c];
    if (TEXT_COLS.has(c)) out[c] = v == null ? (NULLABLE.has(c) ? null : '') : String(v);
    else {
      const n = Number(v);
      out[c] = Number.isFinite(n) ? Math.trunc(n) : 0;
    }
  }
  out.deleted = out.deleted === 1 ? 1 : 0;
  if (table === 'my_memo') out.vv = normalizeVv(raw.vv);
  return out;
}

/**
 * 메모 vv(판 2): { 기기ID: epoch ms 정수 }. 파일은 객체, 앱 백업 DB는 JSON 글이라 둘 다 받는다.
 * 없거나 깨졌으면 {}(7.7 전 메모. 비교할 때 effectiveVv가 { "0": updated_at }으로 본다)
 */
export function normalizeVv(v) {
  if (typeof v === 'string') {
    try {
      v = v ? JSON.parse(v) : {};
    } catch {
      return {};
    }
  }
  if (!v || typeof v !== 'object' || Array.isArray(v)) return {};
  const out = {};
  for (const [k, t] of Object.entries(v)) if (k && Number.isInteger(t)) out[k] = t;
  return out;
}

// ---- 파일 이름 ----

const NAME_RE = /^(data|device)-([0-9a-f]{16})\.json$/;
export const dataName = (device) => `data-${device}.json`;
export const deviceName = (device) => `device-${device}.json`;

/**
 * appDataFolder 목록에서 동기화 파일을 고른다(2절). 같은 이름이 둘 이상이면 modifiedTime이 가장 늦은 것.
 * 내 이름의 나머지는 지울 것(dupes)으로, 다른 기기 이름의 나머지는 그 주인이 지우므로 건드리지 않는다
 * @returns {{myData, myDevice, otherData: object[], otherDevice: object[], dupes: object[]}} 파일은 드라이브 목록의 항목 그대로
 */
export function pickFiles(files, me) {
  const byName = new Map();
  for (const f of files) {
    if (!NAME_RE.test(f.name)) continue;
    if (!byName.has(f.name)) byName.set(f.name, []);
    byName.get(f.name).push(f);
  }
  const time = (f) => Date.parse(f.modifiedTime) || 0;
  let myData = null, myDevice = null;
  const otherData = [], otherDevice = [], dupes = [];
  for (const [name, list] of byName) {
    list.sort((a, b) => time(b) - time(a) || (a.id < b.id ? -1 : 1));
    const [kind, device] = NAME_RE.exec(name).slice(1);
    if (device === me) {
      dupes.push(...list.slice(1));
      if (kind === 'data') myData = list[0];
      else myDevice = list[0];
    } else {
      (kind === 'data' ? otherData : otherDevice).push(list[0]);
    }
  }
  return { myData, myDevice, otherData, otherDevice, dupes };
}

// ---- 데이터 파일(3절) ----

/**
 * 다른 기기의 data 파일을 읽는다. 건너뛸 파일이면 { skip: 'broken'|'newer'|'device' }
 * (깨진 JSON·이름과 다른 device는 건너뛰고, format이 더 크면 합치지 않고 업데이트를 알린다)
 * @returns {{device, client, app, writtenAt, tables}|{skip: string}}
 */
export function parseDataFile(name, text) {
  const m = NAME_RE.exec(name);
  if (!m || m[1] !== 'data') return { skip: 'broken' };
  let o;
  try {
    o = JSON.parse(text);
  } catch {
    return { skip: 'broken' };
  }
  if (!o || typeof o !== 'object' || !Number.isInteger(o.format) || !o.tables || typeof o.tables !== 'object') {
    return { skip: 'broken' };
  }
  if (o.format > FORMAT) return { skip: 'newer' };
  if (o.device !== m[2]) return { skip: 'device' };
  const tables = {};
  for (const table of SYNC_ORDER) {
    const rows = Array.isArray(o.tables[table]) ? o.tables[table] : [];
    tables[table] = rows.map((r) => normalizeRow(table, r)).filter(Boolean);
  }
  return { device: o.device, client: o.client, app: o.app, writtenAt: Number(o.written_at) || 0, tables };
}

/** 내 data 파일 글. 표 전체(지운 행 포함), 칸은 키·나머지 칸·updated_at·deleted만(_id나 웹에만 있는 값은 넣지 않는다) */
export function buildDataFile({ device, app, now = Date.now(), data }) {
  const tables = {};
  for (const table of SYNC_ORDER) tables[table] = (data[table] || []).map((r) => normalizeRow(table, r)).filter(Boolean);
  return JSON.stringify({ format: FORMAT, client: 'web', device, app, db_version: DB_VERSION, written_at: now, tables });
}

/**
 * 내 device 파일 글(4절). position은 { ver, book_id(0부터), chapter_no, verse_no, at } 또는 null
 */
export function buildDeviceFile({ device, name, app, now = Date.now(), position = null, translations = [] }) {
  return JSON.stringify({
    format: FORMAT, client: 'web', device, name, app, written_at: now, position, translations: [...new Set(translations)],
  });
}

// ---- 기기 파일 읽기(4절) ----
// 기기 파일은 합치지 않고 각 기기의 최신 상태로만 읽는다. 읽던 곳과 역본 목록은 "제안만" 한다(자동으로 옮기지 않음)

const isInt = (v) => Number.isInteger(v);

/**
 * 다른 기기의 device 파일. 건너뛸 파일이면 { skip }(data 파일과 같은 규칙). 깨진 position은 null로,
 * translations는 글자만 남긴다(파일 하나가 이상해도 동기화 전체를 멈추지 않게)
 * @returns {{device, client, name, app, writtenAt, position: ({ver, book_id, chapter_no, verse_no, at}|null), translations: string[]}|{skip}}
 */
export function parseDeviceFile(fileName, text) {
  const m = NAME_RE.exec(fileName);
  if (!m || m[1] !== 'device') return { skip: 'broken' };
  let o;
  try {
    o = JSON.parse(text);
  } catch {
    return { skip: 'broken' };
  }
  if (!o || typeof o !== 'object' || !isInt(o.format)) return { skip: 'broken' };
  if (o.format > FORMAT) return { skip: 'newer' };
  if (o.device !== m[2]) return { skip: 'device' };
  const p = o.position;
  const position = p && typeof p === 'object' && isInt(p.book_id) && p.book_id >= 0 && p.book_id < 66
    && isInt(p.chapter_no) && p.chapter_no >= 1 && isInt(p.at) && p.at > 0
    ? { ver: typeof p.ver === 'string' ? p.ver : '', book_id: p.book_id, chapter_no: p.chapter_no,
      verse_no: isInt(p.verse_no) && p.verse_no >= 1 ? p.verse_no : 1, at: p.at }
    : null;
  return {
    device: o.device, client: o.client, app: o.app, writtenAt: Number(o.written_at) || 0,
    name: typeof o.name === 'string' && o.name ? o.name : o.device,
    position,
    translations: Array.isArray(o.translations) ? [...new Set(o.translations.filter((c) => typeof c === 'string' && c))] : [],
  };
}

/**
 * "다른 기기에서 읽던 곳으로 갈까요?"(4절, 5a). 다른 기기들 중 가장 늦게 옮긴 읽던 곳이 이 기기에서 마지막으로 옮긴 때와
 * 이미 물어본 때(seenAt)보다 늦고, 지금 장과 다를 때만. 책·장·절만 따라간다(역본은 이 기기의 지금 역본)
 * @param mine { book, chapter, at } 이 기기의 읽던 곳과 옮긴 시각
 * @param seenAt 마지막으로 물어본 제안의 at(같은 제안을 또 묻지 않게)
 * @returns {{device, name, book, chapter, verse, at}|null}
 */
export function suggestPosition(devices, mine, seenAt = 0) {
  let best = null;
  for (const d of devices) {
    const p = d.position;
    if (!p) continue;
    if (!best || p.at > best.p.at || (p.at === best.p.at && d.device > best.d.device)) best = { d, p };
  }
  if (!best || best.p.at <= Math.max(mine.at || 0, seenAt || 0)) return null;
  if (best.p.book_id === mine.book && best.p.chapter_no === mine.chapter) return null;
  return { device: best.d.device, name: best.d.name, book: best.p.book_id, chapter: best.p.chapter_no, verse: best.p.verse_no, at: best.p.at };
}

/**
 * "다른 기기에 있는 역본을 받을까요?"(5a). 다른 기기에는 있고 이 기기에는 없으며, 서버 목록에 있어 받을 수 있는 역본만
 * (직접 넣은 역본·유료 역본은 서버에 없어 6단계 파일째 동기화로). 이미 물어본 코드(seen)는 빼고 서버 목록 순서대로
 * @param have 이 기기에 있는 코드들(받은 것과 직접 넣은 것)
 * @param server 서버 목록의 코드들(차례대로)
 * @returns {string[]}
 */
export function suggestTranslations(devices, have, server, seen = []) {
  const others = new Set(devices.flatMap((d) => d.translations));
  const skip = new Set([...have, ...seen]);
  return [...new Set(server)].filter((c) => others.has(c) && !skip.has(c));
}

// ---- 합치기(5절, 6절) ----
// 규칙 자체는 mergeRules.js의 syncLatest·syncMemo·syncVerOrder(앱 MergeRules를 옮긴 것, 공통 사례 sync-cases.json).
// 여기서는 행을 그 규칙의 꼴(syncRec)로 바꾸고 결과로 쓸 행을 만든다

/** 행 → 규칙의 꼴(앱 SyncRec): 나머지 칸을 3절 표 순서대로 글로 */
export function recOf(table, row) {
  return row ? syncRec(row.updated_at, row.deleted, SYNC_TABLES[table].rest.map((c) => row[c])) : null;
}

/** 형광펜·읽음 기록·책갈피·메모책. 없는 쪽은 null. 늦은 쪽(내용이 같아도 시각을 맞춘다), 같은 시각이면 6절 (나) */
export function syncLatest(table, local, other) {
  return latestRule(recOf(table, local), recOf(table, other));
}

/** 메모의 '글': 지운 메모는 null */
export const memoText = (row) => (!row || row.deleted ? null : row.memo);

/** 메모(판 2 5절, 앱 syncMemo): 두 행의 vv로 판단한다 */
export function memoSync(local, other) {
  return syncMemo(recOf('my_memo', local), local?.vv ?? {}, recOf('my_memo', other), other?.vv ?? {});
}

/** 충돌이 아닐 때 합친 결과의 vv: 두 쪽의 항목별 큰 값(내 것을 그대로 둘 때도 다른 쪽 항목을 더한다) */
export function mergedVv(local, other) {
  if (!local) return other.vv ?? {};
  return maxVv(effectiveVv(local.vv, local.updated_at), effectiveVv(other.vv, other.updated_at));
}

/**
 * 메모 충돌에서 고른 대로 만든 행. 지금 시각을 남기고, vv는 두 쪽의 항목별 큰 값 위에 이 기기를 찍는다
 * (그래야 다른 기기들이 이 결과를 '다 아는 것'으로 보고 다시 묻지 않는다).
 * 지움과 고침이 부딪힌 충돌도 있다: 지운 쪽을 고르면 지운 행, [둘 다]는 살아 있는 글끼리 이어 붙인다
 */
export function resolvedMemoRow(local, other, pick, device, now = Date.now()) {
  const vv = stampVv(mergedVv(local, other), local.updated_at, device, now);
  const gone = (pick === PICK_LOCAL && local.deleted) || (pick === PICK_OTHER && other.deleted);
  if (gone) return { ...local, deleted: 1, updated_at: now, vv };
  return { ...local, memo: resolveMemo(memoText(local), memoText(other), pick) ?? '', deleted: 0, updated_at: now, vv };
}

/**
 * ver_setting(6절 (가)): 목록째. 차례는 syncVerOrder(이 기기 목록과 다른 기기 목록들). 행마다 색 등은 그 역본의
 * 가장 늦은 살아 있는 행에서 가져오고 ver_order만 차례(0부터)로 새로 매긴다(updated_at은 그 행 것 그대로).
 * 어디서나 지워진 역본은 가장 늦은 행(지운 행)을 그대로 둔다
 * @returns {rows|null} 바뀌었으면 새 목록 전체, 그대로면 null
 */
export function mergeVerSetting(localRows, me, files) {
  const lists = { [me]: localRows };
  for (const f of files) if (f.device !== me) lists[f.device] = f.tables.ver_setting || [];
  const order = syncVerOrder(lists);
  const all = Object.entries(lists).flatMap(([device, rows]) => rows.map((row) => ({ device, row })));
  const latestOf = (ver, aliveOnly) => all
    .filter(({ row }) => row.ver === ver && (!aliveOnly || !row.deleted))
    .reduce((a, b) => (!a || b.row.updated_at > a.row.updated_at || (b.row.updated_at === a.row.updated_at && b.device > a.device) ? b : a), null).row;
  const out = order.map((ver, i) => ({ ...latestOf(ver, true), ver_order: i }));
  const vers = [...new Set(all.map(({ row }) => row.ver))].sort();
  for (const ver of vers) if (!order.includes(ver)) out.push({ ...latestOf(ver, false) });
  const key = (rows) => JSON.stringify([...rows].sort((a, b) => (a.ver < b.ver ? -1 : 1)).map((r) => normalizeRow('ver_setting', r)));
  return key(out) === key(localRows) ? null : out;
}

/**
 * 한 번 합치기의 계획. 지금 데이터는 바꾸지 않고, 쓸 행과 메모 충돌을 돌려준다.
 * 다른 기기 파일을 차례로 합치므로 둘째 파일은 첫째를 합친 결과와 비교한다
 * @param local 표 → 지금 행들(정규화한 것)
 * @param files parseDataFile 결과들(건너뛸 것은 뺀 것)
 * @returns {{puts: Object<string, object[]>, conflicts: {key, local, other, device}[], taken: Object<string, number>}}
 */
export function planSync(local, files, me) {
  const puts = {}, taken = {};
  const conflicts = new Map();
  for (const table of SYNC_ORDER) {
    puts[table] = [];
    taken[table] = 0;
    if (table === 'ver_setting') {
      const rows = mergeVerSetting(local.ver_setting || [], me, files);
      if (rows) {
        puts.ver_setting = rows;
        taken.ver_setting = rows.length;
      }
      continue;
    }
    const work = new Map((local[table] || []).map((r) => [keyOf(table, r), r]));
    const changed = new Map();
    for (const f of files) {
      for (const o of f.tables[table] || []) {
        const k = keyOf(table, o);
        const m = work.get(k) ?? null;
        let choice;
        if (table === 'my_memo') {
          const c = conflicts.get(k);
          if (c) {
            // 이미 충돌로 묻기로 한 메모: 다른 기기 쪽은 가장 늦게 고친 글로
            if (o.updated_at > c.other.updated_at) Object.assign(c, { other: o, device: f.device });
            continue;
          }
          choice = memoSync(m, o);
          if (choice === CONFLICT) {
            conflicts.set(k, { key: k, local: m, other: o, device: f.device });
            continue;
          }
          // 내 것을 그대로 두어도 vv에는 다른 쪽 항목을 더한다(그래야 다음에 '다 아는 것'이 된다)
          if (choice === KEEP_LOCAL && m) {
            const vv = mergedVv(m, o);
            if (JSON.stringify(sortVv(vv)) !== JSON.stringify(sortVv(m.vv ?? {}))) {
              const row = { ...m, vv };
              work.set(k, row);
              changed.set(k, row);
            }
            continue;
          }
        } else {
          choice = syncLatest(table, m, o);
        }
        if (choice !== TAKE_OTHER) continue;
        // 지금 행에 웹이 모르는 칸(앱 백업에서 온 것 등)이 있으면 남긴다. 메모 vv는 두 쪽의 항목별 큰 값
        const row = m ? { ...m, ...o } : o;
        if (table === 'my_memo') row.vv = mergedVv(m, o);
        work.set(k, row);
        changed.set(k, row);
      }
    }
    puts[table] = [...changed.values()];
    taken[table] = changed.size;
  }
  return { puts, conflicts: [...conflicts.values()], taken };
}

const sortVv = (vv) => Object.fromEntries(Object.entries(vv).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)));
