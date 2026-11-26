// 사용자 데이터 보관(IndexedDB, 5단계). 읽음 표시(my_read_check), 형광펜(my_underline), 책갈피(my_bookmark), 메모(my_memo),
// 메모책(memo_book).
// 직접 넣은 성경 파일(localStore.js, lifove-files)과 DB를 나눈다: 이쪽은 작고, 앱 백업과 주고받는 대상이다.
// 저장소 이름은 앱 DB의 표 이름을 그대로 쓴다. 메모·형광펜 등을 더할 때 DB 버전을 올리고 저장소를 더한다.
// 규칙(앱 BibleDbAdapter와 같음): 쓰기는 updated_at을 남기고, 지우기는 deleted=1 표시만, 읽을 때 지운 행은 뺀다.
// 행 모양과 계산은 readCheck.js, highlight.js, bookmark.js, memo.js, memoBook.js

import { checkedRow, deletedRow, CHECK_TABLE } from './readCheck.js';
import { highlightRow } from './highlight.js';
import { bookmarkRow } from './bookmark.js';
import { memoRow, isBlankMemo, DEFAULT_MEMO_BOOK } from './memo.js';
import {
  defaultMemoBookRow, newMemoBookRow, renamedMemoBookRow, reorderedMemoBooks, memoBookList, newUid, optionsMemoBookRow,
} from './memoBook.js';

const DB_NAME = 'lifove-data';
const DB_VERSION = 5; // 1: 읽음 표시, 2: 형광펜, 3: 책갈피, 4: 메모, 5: 메모책
const READ_CHECK = 'my_read_check';
const UNDERLINE = 'my_underline';
const BOOKMARK = 'my_bookmark';
const MEMO = 'my_memo';
const MEMO_BOOK = 'memo_book';

let dbPromise = null;
let notice = () => {}; // 화면에 알릴 것(onDbNotice)

/**
 * DB를 열다 생긴 일을 화면에 알린다. 알리지 않으면 DB를 쓰는 기능이 모두 말없이 멈춘다(2026-11-26 사용자 크롬:
 * 다른 탭이 옛 DB를 열어 둬서 버전 올리기가 막혔다)
 *   'blocked': 다른 탭·앱 창이 옛 버전 DB를 놓지 않아 기다리는 중. 그쪽이 닫으면 저절로 이어진다
 *   'opened': 열렸다(막혔던 것이 풀렸다)
 *   'newer': DB가 이 코드보다 새 버전이다. 이 탭이 옛 앱 파일이라 새로 고쳐야 한다
 */
export function onDbNotice(fn) {
  notice = fn;
}

function openDb() {
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      // 예전 버전에서 올라오면 없는 저장소만 더한다(있는 기록은 그대로)
      req.onupgradeneeded = (e) => {
        const db = req.result;
        if (e.oldVersion < 1) {
          // 키는 앱 readCheckKey와 같은 내용 키. 같은 장을 두 번 넣어도 한 행이다
          const s = db.createObjectStore(READ_CHECK, { keyPath: ['ver', 'book_id', 'chapter_no', 'check_table_id'] });
          s.createIndex('ver', 'ver');
        }
        if (e.oldVersion < 2) {
          // 키는 앱 MERGE_UNDERLINE 키(역본·책·장·절). 장을 그릴 때 그 장의 행을 한 번에 읽으려고 책·장 색인
          const s = db.createObjectStore(UNDERLINE, { keyPath: ['ver', 'book_id', 'chapter_no', 'verse_no'] });
          s.createIndex('chapter', ['book_id', 'chapter_no']);
        }
        if (e.oldVersion < 3) {
          // 키는 앱 bookmarkKey(책·장·절. 한 위치에 한 행). 목록은 통째로 읽어 정렬하므로 색인은 두지 않는다
          db.createObjectStore(BOOKMARK, { keyPath: ['book_id', 'chapter_no', 'verse_no'] });
        }
        if (e.oldVersion < 4) {
          // 키는 앱 memoKey(메모책·책·장·절. 메모책마다 한 절에 하나). 장을 그릴 때 그 장의 메모를 읽으려고 책·장 색인
          // (메모책은 memo.memoMap에서 거른다. 한 장의 행은 메모책을 다 합쳐도 몇 개뿐이라)
          const s = db.createObjectStore(MEMO, { keyPath: ['memo_book', 'book_id', 'chapter_no', 'verse_no'] });
          s.createIndex('chapter', ['book_id', 'chapter_no']);
        }
        if (e.oldVersion < 5) {
          // 키는 앱 uid. 앱처럼 기본 메모책 행을 처음부터 넣어 둔다(앱 DATABASE_INSERT_DEFAULT_MEMO_BOOK)
          db.createObjectStore(MEMO_BOOK, { keyPath: 'uid' }).put(defaultMemoBookRow());
        }
      };
      req.onblocked = () => {
        console.warn('lifove-data upgrade blocked by another tab');
        notice('blocked');
      };
      req.onsuccess = () => {
        const db = req.result;
        // 다른 탭이 DB를 올리려 하면 닫아서 막지 않는다(그 탭이 기다리다 멈추지 않게).
        // 올리는 쪽이 새 버전이면 이 탭은 옛 앱 파일이다: 다음 일에서 다시 열어도 VersionError라 새로 고치라고 알린다
        db.onversionchange = (e) => {
          db.close();
          dbPromise = null;
          if (e.newVersion && e.newVersion > DB_VERSION) notice('newer');
        };
        notice('opened');
        resolve(db);
      };
      req.onerror = () => {
        if (req.error?.name === 'VersionError') notice('newer'); // DB가 더 새 버전(다른 탭이 새 앱으로 올렸다)
        reject(req.error);
      };
    }).catch((e) => {
      dbPromise = null; // 다음에 다시 시도
      throw e;
    });
  }
  return dbPromise;
}

/** 한 거래(transaction). fn은 저장소를 받아 일을 걸고, 거래가 끝나면 fn이 돌려준 값을 돌려준다 */
function run(mode, fn, store = READ_CHECK) {
  return openDb().then((db) => new Promise((resolve, reject) => {
    const tx = db.transaction(store, mode);
    const out = fn(tx.objectStore(store));
    tx.oncomplete = () => resolve(typeof out === 'function' ? out() : out);
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error || new Error('aborted'));
  }));
}

/** 여러 저장소를 한 거래로(메모책을 지우면 그 메모도 함께 지우는 것처럼). fn은 거래(tx)를 받는다 */
function runAll(mode, stores, fn) {
  return openDb().then((db) => new Promise((resolve, reject) => {
    const tx = db.transaction(stores, mode);
    const out = fn(tx);
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

/** 한 장의 형광펜 행들(모든 역본, 지운 것 포함. 거르기는 highlightMap이 한다. 앱 fetchUnderlinesInToChapter) */
export function highlightsOfChapter(book, chapter) {
  return run('readonly', (s) => {
    const req = s.index('chapter').getAll([book, chapter]);
    return () => req.result;
  }, UNDERLINE);
}

/**
 * 여러 칸을 칠하거나 지운다(앱 createUnderline, deleteUnderline). 한 거래로.
 * @param {{ver: string, verse: number, text: string}[]} targets highlight.targetsOf 결과
 */
export function setHighlights(book, chapter, targets, on) {
  const now = Date.now();
  return run('readwrite', (s) => {
    for (const t of targets) {
      const req = s.get([t.ver, book, chapter, t.verse]);
      req.onsuccess = () => {
        const prev = req.result;
        // 이미 칠한 칸은 그대로 둔다(앱도 칠한 절은 다시 넣지 않는다. 고친 시각을 바꾸지 않게)
        const row = on
          ? (prev && !prev.deleted ? null : highlightRow(prev, t.ver, book, chapter, t.verse, t.text, now))
          : deletedRow(prev, now);
        if (row) s.put(row);
      };
    }
  }, UNDERLINE);
}

/** 모든 형광펜 행(지운 것 포함. 거르기·정렬은 highlight.highlightList. 앱 fetchAllUnderlines) */
export function allHighlights() {
  return run('readonly', (s) => {
    const req = s.getAll();
    return () => req.result;
  }, UNDERLINE);
}

/** 형광펜 하나를 지운다(삭제 표시만). 나의형광펜목록의 🗑 */
export function deleteHighlight(ver, book, chapter, verse) {
  const now = Date.now();
  return run('readwrite', (s) => {
    const req = s.get([ver, book, chapter, verse]);
    req.onsuccess = () => {
      const row = deletedRow(req.result, now);
      if (row) s.put(row);
    };
  }, UNDERLINE);
}

/** 모든 형광펜을 지운다(앱 deleteAllUnderline, 전체삭제). 행은 deleted=1로 남는다 */
export function clearHighlights() {
  const now = Date.now();
  return run('readwrite', (s) => {
    const req = s.openCursor();
    req.onsuccess = () => {
      const c = req.result;
      if (!c) return;
      const row = deletedRow(c.value, now);
      if (row) c.update(row);
      c.continue();
    };
  }, UNDERLINE);
}

/** 책갈피를 더한다(앱 createBookmark). 같은 위치가 있으면(지운 것 포함) 되살려 목록 맨 위로 */
export function addBookmark(book, chapter, verse) {
  const now = Date.now();
  const key = bookmarkRow(undefined, book, chapter, verse, now);
  return run('readwrite', (s) => {
    const req = s.get([key.book_id, key.chapter_no, key.verse_no]);
    req.onsuccess = () => s.put(bookmarkRow(req.result, book, chapter, verse, now));
  }, BOOKMARK);
}

/** 모든 책갈피 행(지운 것 포함. 거르기·정렬은 bookmark.bookmarkList. 앱 fetchAllBookmarks) */
export function allBookmarks() {
  return run('readonly', (s) => {
    const req = s.getAll();
    return () => req.result;
  }, BOOKMARK);
}

/** 책갈피 하나를 지운다(삭제 표시만. 앱 deleteBookmark) */
export function deleteBookmark(book, chapter, verse) {
  const now = Date.now();
  return run('readwrite', (s) => {
    const req = s.get([book, chapter, verse]);
    req.onsuccess = () => {
      const row = deletedRow(req.result, now);
      if (row) s.put(row);
    };
  }, BOOKMARK);
}

/** 한 장의 메모 행들(모든 메모책, 지운 것 포함. 거르기는 memo.memoMap. 앱 fetchMemosInToChapter) */
export function memosOfChapter(book, chapter) {
  return run('readonly', (s) => {
    const req = s.index('chapter').getAll([book, chapter]);
    return () => req.result;
  }, MEMO);
}

/** 한 절의 메모 행(지운 것이면 null. 앱 fetchMemo) */
export function memoOf(book, chapter, verse, memoBook = DEFAULT_MEMO_BOOK) {
  return run('readonly', (s) => {
    const req = s.get([memoBook, book, chapter, verse]);
    return () => (req.result && !req.result.deleted ? req.result : null);
  }, MEMO);
}

/**
 * 메모를 저장한다(앱 createMemo·updateMemo). 비운 메모면 지운다(앱 MemoPanel.save)
 * @param {string} ver 처음 쓸 때 남길 역본 코드(앱 Util.BibleVer, 주 역본)
 */
export function saveMemo(book, chapter, verse, text, ver, memoBook = DEFAULT_MEMO_BOOK) {
  if (isBlankMemo(text)) return deleteMemo(book, chapter, verse, memoBook);
  const now = Date.now();
  return run('readwrite', (s) => {
    const req = s.get([memoBook, book, chapter, verse]);
    req.onsuccess = () => s.put(memoRow(req.result, memoBook, book, chapter, verse, text, ver, now));
  }, MEMO);
}

/** 메모 하나를 지운다(삭제 표시만. 앱 deleteMemo) */
export function deleteMemo(book, chapter, verse, memoBook = DEFAULT_MEMO_BOOK) {
  const now = Date.now();
  return run('readwrite', (s) => {
    const req = s.get([memoBook, book, chapter, verse]);
    req.onsuccess = () => {
      const row = deletedRow(req.result, now);
      if (row) s.put(row);
    };
  }, MEMO);
}

/** 모든 메모 행(모든 메모책, 지운 것 포함. 거르기·정렬은 memo.memoList. 앱 fetchAllMemos) */
export function allMemos() {
  return run('readonly', (s) => {
    const req = s.getAll();
    return () => req.result;
  }, MEMO);
}

/** 한 메모책의 메모를 모두 지운다(앱 deleteAllMemo(memoBook), 전체삭제). 다른 메모책은 그대로, 행은 deleted=1로 남는다 */
export function clearMemos(memoBook = DEFAULT_MEMO_BOOK) {
  const now = Date.now();
  return run('readwrite', (s) => {
    const req = s.openCursor();
    req.onsuccess = () => {
      const c = req.result;
      if (!c) return;
      if (c.value.memo_book === memoBook) {
        const row = deletedRow(c.value, now);
        if (row) c.update(row);
      }
      c.continue();
    };
  }, MEMO);
}

/** 메모책 행 모두(지운 것 포함. 거르기·정렬은 memoBook.memoBookList. 앱 fetchMemoBooks) */
export function allMemoBooks() {
  return run('readonly', (s) => {
    const req = s.getAll();
    return () => req.result;
  }, MEMO_BOOK);
}

/** 새 메모책을 목록 맨 끝에 만든다(앱 createMemoBook). opts는 입력 방식({ continuous, … }). 새 uid를 돌려준다 */
export function addMemoBook(name, opts = {}) {
  const uid = newUid();
  const now = Date.now();
  return run('readwrite', (s) => {
    const req = s.getAll();
    req.onsuccess = () => s.put(newMemoBookRow(req.result, uid, String(name).trim(), now, opts));
    return uid;
  }, MEMO_BOOK);
}

/**
 * 메모책 이름과 입력 방식을 고친다(앱 updateMemoBook). name이 null이면 이름은 그대로 두고 입력 방식만
 * (앱 updateMemoBookOptions, 입력판의 아이콘). 지운 메모책이면 그대로 둔다(그 사이 다른 곳에서 지웠을 때)
 */
export function updateMemoBook(uid, name, opts = {}) {
  const now = Date.now();
  return run('readwrite', (s) => {
    const req = s.get(uid);
    req.onsuccess = () => {
      if (!req.result || req.result.deleted) return;
      const row = name == null ? req.result : renamedMemoBookRow(req.result, name, now);
      s.put(optionsMemoBookRow(row, opts, now));
    };
  }, MEMO_BOOK);
}

/** 목록 순서를 uids 차례로 다시 매긴다(앱 setMemoBookOrder. 바뀐 행만 쓴다) */
export function setMemoBookOrder(uids) {
  const now = Date.now();
  return run('readwrite', (s) => {
    const req = s.getAll();
    req.onsuccess = () => {
      for (const row of reorderedMemoBooks(memoBookList(req.result), uids, now)) s.put(row);
    };
  }, MEMO_BOOK);
}

/**
 * 메모책과 그 안의 메모를 한 거래로 지운 표시를 한다(앱 deleteMemoBook). 기본 메모책은 지우지 않는다.
 * 메모까지 지우는 까닭은 앱과 같다: 메모책 없이 남은 메모는 어느 화면에도 보이지 않은 채 남는다
 */
export function deleteMemoBook(uid) {
  if (uid === DEFAULT_MEMO_BOOK) return Promise.resolve();
  const now = Date.now();
  return runAll('readwrite', [MEMO, MEMO_BOOK], (tx) => {
    const books = tx.objectStore(MEMO_BOOK);
    const req = books.get(uid);
    req.onsuccess = () => {
      const row = deletedRow(req.result, now);
      if (row) books.put(row);
    };
    const cur = tx.objectStore(MEMO).openCursor();
    cur.onsuccess = () => {
      const c = cur.result;
      if (!c) return;
      if (c.value.memo_book === uid) {
        const row = deletedRow(c.value, now);
        if (row) c.update(row);
      }
      c.continue();
    };
  });
}

// ---- 백업(6단계) ----

/** 백업에 넣는 저장소(= 앱 표) */
export const BACKUP_STORES = [UNDERLINE, MEMO_BOOK, MEMO, READ_CHECK, BOOKMARK];

/** 백업할 모든 행(지운 것 포함), 저장소 이름 → 행들. 한 거래로 읽어 표 사이가 어긋나지 않게 */
export function allUserData() {
  return runAll('readonly', BACKUP_STORES, (tx) => {
    const reqs = BACKUP_STORES.map((name) => [name, tx.objectStore(name).getAll()]);
    return () => Object.fromEntries(reqs.map(([name, req]) => [name, req.result]));
  });
}

/**
 * 백업 합치기에서 가져온 행을 쓴다(appBackup.planMerge의 puts). 한 거래라 중간에 실패하면 하나도 쓰지 않는다
 * (앱 mergeFrom도 트랜잭션이라 실패하면 지금 데이터 그대로)
 */
export function putUserRows(puts) {
  return runAll('readwrite', BACKUP_STORES, (tx) => {
    for (const name of BACKUP_STORES) for (const row of puts[name] || []) tx.objectStore(name).put(row);
  });
}

/** 백업으로 바꾸기(appBackup.planReplace의 rows): 다섯 저장소를 비우고 넣는다. 한 거래라 실패하면 지금 데이터 그대로 */
export function replaceUserRows(rows) {
  return runAll('readwrite', BACKUP_STORES, (tx) => {
    for (const name of BACKUP_STORES) {
      const s = tx.objectStore(name);
      s.clear();
      for (const row of rows[name] || []) s.put(row);
    }
  });
}
