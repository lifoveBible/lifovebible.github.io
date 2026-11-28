// 구글 드라이브 동기화 화면(설정 > 동기화 > 구글 드라이브 동기화)과 자동 동기화 띠.
// 앱 7.7에는 아직 실제 동기화 화면이 없어 웹이 먼저 정했다(2026-11-28). 시험 창(syncTest.js, Run·Sync now·Auto sync)을 바꾼 것.
// - [동기화 사용]을 켜면 계정을 고르게 하고 바로 한 번 동기화한다(메모 충돌은 그 자리에서 묻는다). 그 뒤는 자동(autoSync.js):
//   고치면 3초 모았다가, 열 때·다시 볼 때·온라인일 때. 끄면 자동만 멈춘다(드라이브와 이 기기의 기록은 그대로)
// - 토큰이 없거나(웹앱을 열었을 때) 끝났으면, 또 자동 동기화에서 메모 충돌이 남았으면 화면 위 띠(#syncBand)를 보이고 누르면 그때 받는다·묻는다
// - 켰는지·계정·마지막 동기화 시각은 이 브라우저에만(localStorage lifove.sync). 기기마다 다른 값이라 동기화하지 않는다
//
// 로그인은 Google Identity Services 토큰 방식(google.accounts.oauth2.initTokenClient). 스크립트는 vendor/에 넣을 수
// 없어(구글이 내려받아 두는 것을 허락하지 않고 자주 바뀜) 구글에서 불러온다. 켜 두었거나 창을 열 때만 불러서 평소에는 구글에 닿지 않는다.
// 서비스 워커는 범위 밖 주소라 손대지 않는다. 토큰은 한 시간짜리를 메모리에만 두고 refresh token은 쓰지 않는다(서버가 필요)

import { DriveClient, SCOPE } from './drive.js';
import { deviceId, syncFiles, setSyncFiles, forgetSyncFiles } from './syncStore.js';
import { syncOnce } from './sync.js';
import { mergeSyncData, allSyncData, applyResolvedMemos, onUserDataChanged } from './userStore.js';
import { createAutoSync } from './autoSync.js';
import { listLocal, getLocal } from './localStore.js';
import {
  driveBibles, planBibles, uploadBible, fetchBible, driveSummary, codeKey, canUploadBibles, isMobileDevice, planLangFills, fillBibleLang,
} from './bibleSync.js';

// Cloud Console "Lifove Bible" 프로젝트의 웹 OAuth 클라이언트 ID(공개해도 되는 값). 승인된 자바스크립트 원본:
// https://lifovebible.github.io, http://localhost:8000
const CLIENT_ID = '213803761663-loq75k5d6mse0cbj7lqcipuq0u2mjrkq.apps.googleusercontent.com';
const GIS_SRC = 'https://accounts.google.com/gsi/client';
const STATE_KEY = 'lifove.sync'; // { on, email, at(마지막으로 동기화를 마친 시각) }
const OLD_AUTO_KEY = 'lifove.autoSync'; // 시험 창의 'Auto sync' 체크(2026-11-28). 켜 두었으면 켠 것으로 이어 간다
// 이 기기에서 드라이브의 역본 파일을 지운 역본: { 코드(소문자): 그때의 넣은 시각 }. 그 뒤에 다시 넣기 전에는 올리지 않는다(bibleSync.planBibles)
const REMOVED_KEY = 'lifove.syncBibleRemoved';

function loadRemoved() {
  try { return JSON.parse(localStorage.getItem(REMOVED_KEY)) || {}; } catch { return {}; }
}

function loadState() {
  try {
    const s = JSON.parse(localStorage.getItem(STATE_KEY));
    if (s && typeof s === 'object') return s;
    if (localStorage.getItem(OLD_AUTO_KEY) === '1') return { on: true };
  } catch { /* 못 읽으면 꺼짐 */ }
  return { on: false };
}

let gisPromise = null;
function loadGis() {
  if (globalThis.google?.accounts?.oauth2) return Promise.resolve();
  if (!gisPromise) {
    gisPromise = new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = GIS_SRC;
      s.async = true;
      s.onload = () => resolve();
      s.onerror = () => { gisPromise = null; s.remove(); reject(new Error('could not load ' + GIS_SRC)); };
      document.head.append(s);
    });
  }
  return gisPromise;
}

let token = null; // { value, until }
let tokenIsNew = false; // 새로 받은 토큰이면 다음 동기화에서 계정 이메일을 다시 읽는다
const tokenNow = () => (token && token.until > Date.now() ? token.value : null);

/**
 * 권한 받기. 동의 창(팝업)을 막히지 않게 띄우려면 단추 누름 안에서 바로 불러야 해서 스크립트는 미리 불러 둔다.
 * @param o.select 계정을 고르게 한다(켤 때). 아니면 이미 허락한 계정으로 창 없이 지나간다(prompt: '')
 * @param o.hint 지난번 계정 이메일(여러 계정이 로그인된 브라우저에서 같은 계정으로)
 */
function requestToken({ select = false, hint = '' } = {}) {
  return new Promise((resolve, reject) => {
    const client = google.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: SCOPE,
      callback: (r) => {
        if (r.error) { reject(new Error(r.error + (r.error_description ? ': ' + r.error_description : ''))); return; }
        if (!google.accounts.oauth2.hasGrantedAllScopes(r, SCOPE)) { reject(new Error('drive.appdata not granted')); return; }
        token = { value: r.access_token, until: Date.now() + (Number(r.expires_in) || 3600) * 1000 - 60000 };
        tokenIsNew = true;
        resolve(token.value);
      },
      // 팝업이 막혔거나 사용자가 닫았을 때(callback은 오지 않는다)
      error_callback: (e) => reject(new Error(e?.type || 'popup error')),
    });
    client.requestAccessToken({ prompt: select ? 'select_account' : '', ...(hint && !select ? { login_hint: hint } : {}) });
  });
}

/** 웹 버전: sw.js의 VERSION(앱 파일 내용의 해시). 못 읽으면 'unknown' */
async function webVersion() {
  try {
    const m = /const VERSION = '([0-9a-f]+)'/.exec(await (await fetch('sw.js', { cache: 'no-store' })).text());
    return m ? 'web-' + m[1] : 'unknown';
  } catch {
    return 'unknown';
  }
}

/**
 * @param S 화면 문구(strings.js)
 * @param hooks.deviceInfo () => { name, position, translations }(device 파일)
 * @param hooks.askConflicts (conflicts) => Promise<(pick|null)[]>(메모 고르기 창)
 * @param hooks.changed () => Promise 데이터가 바뀌었을 때 화면을 다시 읽는다
 * @param hooks.suggest (devices) => Promise 다른 기기의 device 파일로 읽던 곳·역본을 제안한다
 * @param hooks.when (epochMs) => string 날짜·시각 글
 * @param hooks.serverCodes () => 서버 목록 코드들(이 역본들은 파일째 올리지 않는다)
 * @param hooks.ask (text, yes, no) => Promise<boolean> 묻는 창
 * @param hooks.suggestBibles (offers, fetchOne) => Promise<string|null> 다른 기기가 올린 역본 받기·바꾸기 제안. 결과 글
 * @param hooks.downloadBibles (list, fetchOne) => Promise<string> 동기화 창 [다운로드]: 받아 넣고 결과 글
 * @param hooks.hasBible (code) => boolean 이 기기에 그 역본(대소문자 무시)을 넣어 두었나
 * @param hooks.otherBooks (memosByBook) => string|null 지금 메모책이 아닌 메모책에 온 메모 "번역 노트 3, 필사 1"
 * @returns { changed } 넣은 역본이 바뀌었을 때 부른다(모았다가 동기화해 올린다)
 */
export function setupSync($, S, hooks) {
  const $box = $('syncBox'), $on = $('syncOn'), $now = $('syncNow'), $log = $('syncLog'), $status = $('syncStatus');
  let state = loadState();
  let lastNewer = false; // 다른 기기의 앱이 더 새 판이라 읽지 못한 파일이 있었다
  let lastBibleError = null; // 역본 파일을 주고받다 난 오류(나머지 동기화는 끝났다)
  let lastSaid = null; // 역본 받기 제안의 결과 글(받았습니다 등)
  let lastOthers = null; // 다른 메모책에 새로 온 메모 안내(앱 text_sync_other_books)
  let driveList = null; // 드라이브의 역본 파일(driveBibles). 이번에 동기화하기 전에는 모른다
  let waitingBibles = 0; // 네트워크 때문에 아직 올리지 못한 역본 수(6b: 데이터 요금이 없는 네트워크에서만)

  const save = () => {
    try {
      localStorage.setItem(STATE_KEY, JSON.stringify(state));
      localStorage.removeItem(OLD_AUTO_KEY);
    } catch { /* 저장 못 해도 이번에는 된다 */ }
  };

  // 기록(접힌 '자세히'). 한 번 동기화한 기록만 둔다. 문제를 알아볼 때 보라고 글은 영어 그대로(앱 logcat과 같은 글)
  let logFresh = true;
  const line = (s) => {
    console.log('[LifoveSync]', s); // 앱 logcat 태그와 같은 이름
    if (logFresh) { $log.textContent = ''; logFresh = false; }
    $log.textContent += s + '\n';
  };

  $('syncTitle').textContent = S.syncTitle;
  $('setSyncLabel').textContent = S.syncTitle;
  $('groupSync').textContent = S.groupSync;
  $('syncAbout').textContent = S.syncAbout;
  $('syncOnLabel').textContent = S.syncOn;
  $('syncOnHint').textContent = S.syncOnHint;
  $('syncWebNote').textContent = S.syncWebNote;
  $('syncLogTitle').textContent = S.syncLogTitle;
  $('syncFilesTitle').textContent = S.syncFilesTitle;
  $('syncFilesHint').textContent = S.syncFilesHint;
  $now.textContent = S.syncNow;
  $('syncDone').textContent = S.close;
  $('syncClose').setAttribute('aria-label', S.close);
  $('syncClose').title = S.close;

  /** 창 아래 결과 줄 */
  function status(text, error = false) {
    $status.textContent = text || '';
    $status.hidden = !text;
    $status.classList.toggle('error', !!error);
  }

  /** 설정 줄의 상태 글과 창의 칸들 */
  function refresh() {
    $('setSyncHint').textContent = state.on ? (state.email ? S.syncRowOn(state.email) : S.syncRowOnNoEmail) : S.syncRowOff;
    $on.checked = !!state.on;
    $('syncAccount').textContent = state.on && state.email ? S.syncAccount(state.email) : '';
    $('syncAccount').hidden = !(state.on && state.email);
    $('syncLast').textContent = state.at ? S.syncLast(hooks.when(state.at)) : S.syncNever;
    $('syncLast').hidden = !state.on;
    $now.disabled = !state.on || auto.state === 'running';
    $('syncFiles').hidden = !state.on;
    drawFiles();
  }

  /** 드라이브에 올린 역본 파일 목록(6b): 수·용량과 지우기 단추 */
  function drawFiles() {
    const $list = $('syncFilesList');
    if (!driveList) {
      $('syncFilesSummary').textContent = S.syncFilesUnknown;
      $list.replaceChildren();
      return;
    }
    const { count, mb } = driveSummary(driveList);
    $('syncFilesSummary').textContent = count ? S.syncFilesSummary(count, mb) : S.syncFilesNone;
    $('syncFilesWaiting').textContent = waitingBibles ? S.syncFilesWaiting(waitingBibles) : '';
    $('syncFilesWaiting').hidden = !waitingBibles;
    $list.replaceChildren(...[...driveList.values()].map((d) => {
      const li = document.createElement('li');
      const name = document.createElement('span');
      name.textContent = `${d.name || d.code} (${d.code}, ${Math.max(0.1, Math.round(d.size / 1024 / 102.4) / 10)} MB)`
        + (d.complete ? '' : ' ' + S.syncFileIncomplete);
      // 받기 제안은 한 판에 한 번만 묻으므로 여기서 언제든 받을 수 있게(6b). 덜 올라온 bdf·모르는 새 판은 받지 않는다
      const get = document.createElement('button');
      get.className = 'icon del';
      get.textContent = '⬇';
      get.title = S.syncGet + ' ' + (d.name || d.code);
      get.setAttribute('aria-label', get.title);
      get.disabled = !d.complete || !!d.newer;
      get.addEventListener('click', () => downloadFromDrive(d, get));
      const del = document.createElement('button');
      del.className = 'icon del';
      del.textContent = '🗑';
      del.title = S.delete + ' ' + (d.name || d.code);
      del.setAttribute('aria-label', del.title);
      del.addEventListener('click', () => removeBible(d, del));
      li.append(name, get, del);
      return li;
    }));
  }

  /** 드라이브의 역본을 받는다. 이 기기에 이미 있으면 드라이브의 것으로 바꾼다고 먼저 묻는다(6b) */
  async function downloadFromDrive(d, $btn) {
    const name = d.name || d.code;
    if (hooks.hasBible(d.code) && !await hooks.ask(S.syncFileReplaceConfirm(name), S.syncReplace, S.close)) return;
    $btn.disabled = true;
    try {
      if (!await ensureToken()) return;
      const drive = new DriveClient(tokenNow());
      status(S.downloading);
      status(await hooks.downloadBibles([d], (x) => fetchBible(drive, x)));
    } catch (e) {
      console.warn('[LifoveSync]', e);
      if (e.status === 401) token = null;
      status(S.syncFailed(e.message || String(e)), true);
    } finally {
      $btn.disabled = false;
    }
  }

  /** 드라이브에서 역본 파일 지우기. 서버에서 받을 수 없는 역본이면 되찾을 길이 없다고 한 번 더 묻는다(6b, JC 결정) */
  async function removeBible(d, $btn) {
    const name = d.name || d.code;
    const onServer = hooks.serverCodes().some((c) => codeKey(c) === codeKey(d.code));
    if (!await hooks.ask(onServer ? S.syncFileDeleteAskPlain(name) : S.syncFileDeleteAsk(name), S.delete, S.close)) return;
    $btn.disabled = true;
    if (!await ensureToken()) { $btn.disabled = false; return; }
    try {
      const drive = new DriveClient(tokenNow());
      const work = async () => { for (const id of [...d.files.map((f) => f.id), ...d.extra]) await drive.remove(id); };
      await (navigator.locks ? navigator.locks.request('lifove-sync', work) : work());
      // 이 기기에 있어도 다시 올리지 않는다(그 뒤에 다시 넣으면 올린다)
      const mine = (await listLocal()).find((l) => codeKey(l.code) === codeKey(d.code));
      const removed = loadRemoved();
      removed[codeKey(d.code)] = Math.max(d.writtenAt, Number(mine?.addedAt) || 0);
      try { localStorage.setItem(REMOVED_KEY, JSON.stringify(removed)); } catch { /* 다음 동기화에서 다시 올라갈 수 있다 */ }
      driveList.delete(codeKey(d.code));
      drawFiles();
      status(S.syncFileDeleted(name));
    } catch (e) {
      console.warn('[LifoveSync]', e);
      if (e.status === 401) token = null;
      status(S.syncFailed(e.message || String(e)), true);
      $btn.disabled = false;
    }
  }

  /**
   * 역본 파일(6b): 서버 목록에 없는 이 기기의 역본을 올리고(없거나 이 기기가 더 나중에 넣었으면), 받을 것(제안)을 돌려준다.
   * 받기는 묻고 나서(자동으로 받지 않음)
   */
  async function syncBibleFiles(drive, listed, device, manual) {
    let list = driveBibles(listed);
    const local = await listLocal();
    const opts = { serverCodes: hooks.serverCodes(), removed: loadRemoved() };
    const plan = planBibles({ local, drive: list, ...opts });
    // 데이터 요금이 없는 네트워크에서만 올린다(6b). 못 올린 것은 다음 동기화에서 다시 본다
    const allowed = canUploadBibles({ connection: navigator.connection, mobile: isMobileDevice(), manual });
    waitingBibles = allowed ? 0 : plan.upload.length;
    if (waitingBibles) line(`Bible files waiting for Wi-Fi: ${plan.upload.map((l) => l.code).join(', ')}`);
    for (const l of allowed ? plan.upload : []) {
      const rec = await getLocal(l.code);
      if (!rec) continue;
      const n = await uploadBible(drive, rec, list.get(codeKey(l.code)), { device });
      line(`Uploaded bible ${l.code} (${n} file(s), ${Math.round((rec.size || 0) / 1024)} KB)`);
    }
    if (allowed && plan.upload.length) list = driveBibles(await drive.listAppData());
    // 이미 올라간 파일의 빈 lang은 내용을 다시 올리지 않고 lang만 채운다(6c, 앱과 같음). 정보만이라 네트워크와 상관없이
    for (const { d, lang } of planLangFills({ local, drive: list })) {
      await fillBibleLang(drive, d, lang);
      d.lang = lang;
      line(`Filled language ${lang} of bible ${d.code}`);
    }
    driveList = list;
    drawFiles();
    const { offers } = planBibles({ local, drive: list, ...opts });
    if (offers.length) line(`Bible files to offer: ${offers.map((o) => o.code + (o.replace ? ' (newer)' : '')).join(', ')}`);
    return offers;
  }

  /**
   * 동기화 한 번(자동 동기화가 부른다). 브라우저 잠금(Web Locks)으로 탭이 여럿이어도 한 번에 하나만.
   * interactive가 아니면 메모 충돌을 묻지 않는다(자동: 띠를 눌러야 고른다)
   */
  async function syncWith(drive, interactive) {
    const work = async () => {
      logFresh = true;
      if (tokenIsNew) {
        // 새 토큰이면 계정을 다시 본다(다른 계정으로 로그인했을 수 있다). 못 읽어도 동기화는 한다
        try {
          const email = await drive.userEmail();
          tokenIsNew = false;
          if (email && email !== state.email) { state.email = email; save(); }
          line('Account ' + email);
        } catch (e) {
          if (e.status === 401) throw e;
          line('Account email: not available: ' + e.message);
        }
      }
      const device = await deviceId(); // 못 읽으면 여기서 멈춘다(임시 기기ID로는 내 파일 이름을 정할 수 없다)
      line('Device ' + device);
      const r = await syncOnce({
        drive, device, app: await webVersion(), log: line,
        deviceInfo: hooks.deviceInfo,
        cache: { get: syncFiles, set: setSyncFiles }, // 바뀐 파일만 받기
        askConflicts: interactive
          ? async (conflicts) => {
            await hooks.changed(); // 받은 메모책 이름이 고르기 창에 보이게
            return hooks.askConflicts(conflicts);
          }
          : async (conflicts) => conflicts.map(() => null),
        store: {
          mergeWith: mergeSyncData,
          readAll: allSyncData,
          applyResolved: applyResolvedMemos,
        },
      });
      line(`Done. Conflicts ${r.conflicts}, resolved ${r.resolved}, left ${r.left}${r.uploaded ? '' : ' (not uploaded)'}, `
        + `skipped ${r.skipped.length}, removed ${r.removed.length}, devices ${r.devices.length}`);
      // 역본 파일은 따로: 실패해도 기록 동기화는 끝났으므로 알리기만 한다(다음 동기화에서 다시)
      r.offers = [];
      lastBibleError = null;
      try {
        r.offers = await syncBibleFiles(drive, r.listed, device, interactive); // 직접 누른 동기화면 interactive
      } catch (e) {
        if (e.status === 401) throw e;
        console.warn('[LifoveSync]', e);
        line('Bible files: ERROR ' + (e.message || e));
        lastBibleError = e;
      }
      await hooks.changed();
      return r;
    };
    return navigator.locks ? navigator.locks.request('lifove-sync', work) : work();
  }

  const auto = createAutoSync({
    hasToken: () => !!tokenNow(),
    onState: show,
    runSync: async ({ interactive, reason }) => {
      const t = tokenNow();
      if (!t) throw Object.assign(new Error('no token'), { status: 401 });
      try {
        const r = await syncWith(new DriveClient(t), interactive);
        state.at = Date.now();
        // 지금 보고 있지 않은 메모책에 온 메모(본문은 지금 메모책만 보여 '메모가 안 온다'고 헷갈리지 않게, 앱 6-2)
        lastOthers = hooks.otherBooks?.(r.memosByBook) || null;
        hooks.synced?.(); // 떠 있는 '오래 백업 안 함' 알림을 내린다
        save();
        lastNewer = !!r.newer;
        // 읽던 곳·역본 제안은 켤 때·열 때·다시 볼 때·눌렀을 때만(고칠 때마다 창이 뜨지 않게)
        if (reason !== 'changed') {
          await hooks.suggest(r.devices);
          const t2 = tokenNow();
          if (r.offers.length && t2) {
            // 결과 글은 끝난 뒤의 '동기화를 마쳤습니다' 밑에 붙인다(여기서 보이면 곧 그 글에 덮인다)
            lastSaid = await hooks.suggestBibles(r.offers, (d) => fetchBible(new DriveClient(t2), d));
          }
        }
        return r;
      } catch (e) {
        console.warn('[LifoveSync]', e);
        line('ERROR: ' + (e.message || e));
        if (e.status === 401) token = null; // 끝난 토큰: 띠를 눌러 다시 받는다
        throw e;
      }
    },
  });

  /** 자동 동기화 상태 → 화면 위 띠와 창의 결과 줄 */
  function show(st, info) {
    const $band = $('syncBand');
    $band.hidden = true;
    if (st === 'needsTap') {
      $('syncBandText').textContent = S.syncPaused;
      $('syncBandBtn').textContent = S.syncResume;
      $band.hidden = false;
      status(S.syncPaused);
    } else if (st === 'conflicts') {
      $('syncBandText').textContent = S.syncConflicts(info);
      $('syncBandBtn').textContent = S.syncChoose;
      $band.hidden = false;
      status(lastOthers ? S.syncLeft(info) + '\n' + S.syncOtherBooks(lastOthers) : S.syncLeft(info));
    } else if (st === 'running') {
      status(S.syncRunning);
    } else if (st === 'ok') {
      const notes = [S.syncDone];
      if (lastNewer) notes.push(S.syncNewer);
      if (lastBibleError) notes.push(S.syncFilesFailed(lastBibleError.message || String(lastBibleError)));
      if (lastOthers) notes.push(S.syncOtherBooks(lastOthers));
      if (lastSaid) notes.push(lastSaid);
      lastSaid = null;
      status(notes.join('\n'), !!lastBibleError);
    } else if (st === 'error') {
      console.warn('[LifoveSync auto]', info);
      status(S.syncFailed(info?.message || String(info)), true);
    }
    refresh();
  }

  /** 토큰이 없으면 받는다(누름 안에서 불러야 팝업이 막히지 않는다). 못 받으면 false */
  async function ensureToken(select = false) {
    if (tokenNow() && !select) return true;
    try {
      await loadGis();
      await requestToken({ select, hint: state.email || '' });
      return true;
    } catch (e) {
      console.warn('[LifoveSync]', e);
      status(S.syncSignInFailed + ' (' + (e.message || e) + ')', true);
      return false;
    }
  }

  $('setSyncOpen').addEventListener('click', () => {
    refresh(); // 결과 줄은 지난 상태 그대로(멈춤·충돌·오류를 창에서도 보게)
    $box.showModal();
    loadGis().catch((e) => console.warn('[LifoveSync]', e)); // 켜기·지금 동기화를 누를 때 바로 팝업이 뜨게 미리
  });
  for (const id of ['syncClose', 'syncDone']) $(id).addEventListener('click', () => $box.close());

  $on.addEventListener('change', async () => {
    if (!$on.checked) {
      auto.stop();
      token = null;
      forgetSyncFiles().catch((e) => console.warn('[LifoveSync]', e)); // 다시 켜면 처음처럼 다 받아 합친다
      driveList = null;
      state = { on: false };
      save();
      refresh();
      status(S.syncOffDone);
      return;
    }
    // 켜기: 계정을 고르게 하고(체크 누름 안이라 팝업이 막히지 않는다) 바로 한 번, 메모 충돌은 그 자리에서 묻는다
    $on.disabled = true;
    const ok = await ensureToken(true);
    $on.disabled = false;
    if (!ok) { $on.checked = false; return; }
    state = { on: true };
    save();
    refresh();
    await auto.start({ interactive: true });
  });

  $now.addEventListener('click', async () => {
    if (!await ensureToken()) return;
    await auto.tap();
  });

  // 띠 누르기: 누름 안에서 바로 토큰을 받는다(팝업이 막히지 않게). 스크립트는 켜 둔 채로 열 때 미리 불러 둔다
  $('syncBandBtn').addEventListener('click', async () => {
    $('syncBand').hidden = true;
    if (!await ensureToken()) { show('needsTap'); return; }
    await auto.tap();
  });

  onUserDataChanged(() => auto.changed());
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') auto.visible();
    else auto.hidden();
  });
  window.addEventListener('online', () => auto.visible('online'));
  refresh();
  // 켜 둔 채로 열었으면: 띠를 눌렀을 때 팝업이 바로 뜨게 스크립트를 미리 불러 두고, 토큰이 없으니 띠를 보인다
  if (state.on) {
    try { if (localStorage.getItem(STATE_KEY) === null) save(); } catch { /* 시험 창 체크에서 옮겨 온 것을 새 키로 */ }
    loadGis().catch((e) => console.warn('[LifoveSync]', e));
    auto.start();
  }
  return {
    changed: () => auto.changed(),
    /** 동기화를 켰을 때 마지막으로 마친 시각(껐으면 0). '오래 백업 안 함' 알림이 본다 */
    lastSyncAt: () => (state.on ? Number(state.at) || 0 : 0),
  };
}
