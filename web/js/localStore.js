// 직접 넣은 성경 파일 보관(IndexedDB).
// 받은 파일(lfaStore.js, Cache Storage)과 달리 다시 받을 수 없으므로 캐시로 다루지 않는다.
// IndexedDB는 http로 연 주소(다른 PC에서 http://192.168.x.x:8000)에서도 쓸 수 있다(Cache Storage는 안 된다).
// 메모 같은 사용자 데이터(5단계)와는 DB를 나눈다. 크고, 앱 백업과 주고받는 대상도 아니라서.
//
// 한 역본 = 한 행: { code, name, userName, lang, kind: 'lfa'|'bdf', restricted, size, addedAt, data }
//   name: 파일 안 이름(lfa biblename 첫 줄) 또는 드라이브에서 받은 이름. 없으면 null
//   userName: 사용자가 ✎로 정한 이름(이 기기에만). 없으면 null/없음. 화면 이름 차례는 localBible.mergeLocal
//   lang: 언어 코드, ''는 살펴봤지만 모름, 없으면(옛 행) 아직 안 살펴봄(app.js reloadLocal이 채운다)
//   lfa: data는 ArrayBuffer(파일 그대로)
//   bdf: data는 {1: 문자열, ...}. 넣을 때 인코딩을 한 번 풀어 둔다(MS949 판별을 매번 하지 않게)
// Blob 대신 ArrayBuffer를 쓴다. 예전 사파리는 IndexedDB의 Blob을 잘 다루지 못했다.

const DB_NAME = 'lifove-files';
const STORE = 'bibles';

let dbPromise = null;

function openDb() {
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = () => req.result.createObjectStore(STORE, { keyPath: 'code' });
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    }).catch((e) => {
      dbPromise = null; // 다음에 다시 시도
      throw e;
    });
  }
  return dbPromise;
}

function run(mode, fn) {
  return openDb().then((db) => new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, mode);
    const req = fn(tx.objectStore(STORE));
    tx.oncomplete = () => resolve(req?.result);
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error || new Error('aborted'));
  }));
}

/** 넣은 역본 목록(내용 없이). IndexedDB를 못 쓰면 빈 목록 */
export async function listLocal() {
  try {
    const out = [];
    await run('readonly', (s) => {
      // 내용(data)까지 읽지 않으려고 커서로 돌며 필요한 칸만 꺼낸다
      const req = s.openCursor();
      req.onsuccess = () => {
        const c = req.result;
        if (!c) return;
        const { code, name, userName, lang, kind, restricted, size, addedAt } = c.value;
        out.push({ code, name, userName, lang, kind, restricted, size, addedAt });
        c.continue();
      };
      return null;
    });
    return out;
  } catch (e) {
    console.warn('local bibles unavailable', e);
    return [];
  }
}

/** 한 역본(내용 포함). 없으면 undefined */
export function getLocal(code) {
  return run('readonly', (s) => s.get(code));
}

/** 넣는다. 같은 코드가 있으면 바꾼다 */
export function putLocal(record) {
  return run('readwrite', (s) => s.put(record));
}

export function deleteLocal(code) {
  return run('readwrite', (s) => s.delete(code));
}
