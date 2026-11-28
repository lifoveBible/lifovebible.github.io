// 동기화가 쓰는 이 브라우저만의 값(IndexedDB `lifove-sync`, 저장소 `kv`). 지금은 기기ID 하나.
// (판 1의 메모 '마지막으로 맞춘 글' memo_base도 여기 있었다. 판 2에서 버전 벡터로 바꿔 버렸고, 남은 값은 기기ID를 읽을 때 지운다)
// 사용자 데이터 DB(lifove-data)와 나눈다: 앱 백업과 주고받는 대상이 아니고(앱이 기기ID를 백업에서 빼는 것과 같은 까닭:
// 다른 기기가 같은 ID를 물려받으면 서로의 드라이브 파일을 덮어쓴다), lifove-data 버전을 올리면 다른 탭이 막힐 수 있어서.
// 사이트 데이터를 지우면 새 ID가 생겨 드라이브에 옛 기기 파일이 남는다(정리 규칙은 앱과 함께 정한다)

import { newDeviceId, isDeviceId } from './drive.js';

const DB_NAME = 'lifove-sync';
const STORE = 'kv';

let dbPromise = null;

function openDb() {
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = () => req.result.createObjectStore(STORE);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    }).catch((e) => {
      dbPromise = null;
      throw e;
    });
  }
  return dbPromise;
}

let idPromise = null;

/**
 * 이 브라우저의 기기ID. 없으면 만들어 둔다(있으면 그대로: 한 트랜잭션에서 읽고 써서 두 탭이 동시에 만들어도 하나).
 * 메모를 쓸 때마다 vv에 찍으므로 한 번 읽은 값을 기억해 둔다
 */
export function deviceId() {
  if (!idPromise) idPromise = readDeviceId().catch((e) => { idPromise = null; throw e; });
  return idPromise;
}

async function readDeviceId() {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    const s = tx.objectStore(STORE);
    let id = null;
    s.get('device_id').onsuccess = (e) => {
      id = e.target.result;
      if (!isDeviceId(id)) {
        id = newDeviceId();
        s.put(id, 'device_id');
      }
    };
    s.delete('memo_base'); // 판 1에서 쓰던 값(버림)
    tx.oncomplete = () => resolve(id);
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error || new Error('aborted'));
  });
}


// ---- 지난번에 합친 다른 기기 파일(바뀐 파일만 받기, sync.js의 cache) ----
// { [드라이브 파일 id]: { key, writtenAt, device? } }. 이 기기 데이터가 그 파일들을 다 안다는 뜻이므로, 이 기기 데이터를
// 통째로 바꾸면(바꾸기 복구) 지운다. 동기화를 끌 때도 지운다(다시 켜면 처음처럼 다 받아 합친다)
const FILES_KEY = 'sync_files';

async function kv(mode, fn) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, mode);
    let out;
    const req = fn(tx.objectStore(STORE));
    if (req) req.onsuccess = () => { out = req.result; };
    tx.oncomplete = () => resolve(out);
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error || new Error('aborted'));
  });
}

export const syncFiles = () => kv('readonly', (s) => s.get(FILES_KEY)).then((m) => m || null);
export const setSyncFiles = (m) => kv('readwrite', (s) => { s.put(m, FILES_KEY); });
export const forgetSyncFiles = () => kv('readwrite', (s) => { s.delete(FILES_KEY); });
