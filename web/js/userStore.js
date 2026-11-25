// 사용자 데이터 보관(IndexedDB, 5단계). 지금은 읽음 표시(my_read_check)만.
// 직접 넣은 성경 파일(localStore.js, lifove-files)과 DB를 나눈다: 이쪽은 작고, 앱 백업과 주고받는 대상이다.
// 저장소 이름은 앱 DB의 표 이름을 그대로 쓴다. 메모·형광펜 등을 더할 때 DB 버전을 올리고 저장소를 더한다.
// 규칙(앱 BibleDbAdapter와 같음): 쓰기는 updated_at을 남기고, 지우기는 deleted=1 표시만, 읽을 때 지운 행은 뺀다.
// 행 모양과 계산은 readCheck.js

import { checkedRow, deletedRow, CHECK_TABLE } from './readCheck.js';

const DB_NAME = 'lifove-data';
const READ_CHECK = 'my_read_check';

let dbPromise = null;

function openDb() {
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = () => {
        // 키는 앱 readCheckKey와 같은 내용 키. 같은 장을 두 번 넣어도 한 행이다
        const s = req.result.createObjectStore(READ_CHECK, { keyPath: ['ver', 'book_id', 'chapter_no', 'check_table_id'] });
        s.createIndex('ver', 'ver');
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    }).catch((e) => {
      dbPromise = null; // 다음에 다시 시도
      throw e;
    });
  }
  return dbPromise;
}

/** 한 거래(transaction). fn은 저장소를 받아 일을 걸고, 거래가 끝나면 fn이 돌려준 값을 돌려준다 */
function run(mode, fn) {
  return openDb().then((db) => new Promise((resolve, reject) => {
    const tx = db.transaction(READ_CHECK, mode);
    const out = fn(tx.objectStore(READ_CHECK));
    tx.oncomplete = () => resolve(typeof out === 'function' ? out() : out);
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error || new Error('aborted'));
  }));
}

/** 한 역본의 읽음 행들(지운 것 포함. 거르기는 readSet이 한다) */
export function readChecksOf(ver) {
  return run('readonly', (s) => {
    const req = s.index('ver').getAll(ver);
    return () => req.result;
  });
}

/** 읽음 행이 하나라도 남은 역본 코드들(통계 창에서 지금 없는 역본도 고를 수 있게) */
export function versWithReadChecks() {
  return run('readonly', (s) => {
    const vers = new Set();
    const req = s.openCursor();
    req.onsuccess = () => {
      const c = req.result;
      if (!c) return;
      if (!c.value.deleted) vers.add(c.value.ver);
      c.continue();
    };
    return () => [...vers];
  });
}

/**
 * 여러 역본의 한 장을 읽음/안 읽음으로(앱 createReadCheckForManyVers, deleteReadCheckForManyVers).
 * 한 거래로 해서 일부만 저장되는 일이 없게
 */
export function setReadCheck(vers, book, chapter, checked) {
  const now = Date.now();
  return run('readwrite', (s) => {
    for (const ver of vers) {
      const req = s.get([ver, book, chapter, CHECK_TABLE]);
      req.onsuccess = () => {
        const row = checked ? checkedRow(req.result, ver, book, chapter, now) : deletedRow(req.result, now);
        if (row) s.put(row);
      };
    }
  });
}

/** 한 역본의 읽음 표시를 모두 지운다(앱 deleteAllReadCheckOfOneBibleVer, 읽기통계초기화) */
export function clearReadChecks(ver) {
  const now = Date.now();
  return run('readwrite', (s) => {
    const req = s.index('ver').openCursor(ver);
    req.onsuccess = () => {
      const c = req.result;
      if (!c) return;
      const row = deletedRow(c.value, now);
      if (row) c.update(row);
      c.continue();
    };
  });
}
