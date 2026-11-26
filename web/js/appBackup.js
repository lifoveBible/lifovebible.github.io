// 앱 백업 파일(SQLite, 앱 BibleDbAdapter DB 버전 12) 만들기와 읽기. DOM·IndexedDB 없이(테스트하려고).
// sql.js(SQL)는 부르는 쪽이 넘긴다(브라우저는 sqlite.js가 불러오고, 테스트는 Node에서 require).
// 표와 칸은 앱과 똑같이 만든다. 앱의 '데이터 복구'(바꾸기·합치기)가 이 파일을 그대로 열 수 있어야 해서다.

import { NO_TIME, rec, latest, memo as memoChoice, TAKE_OTHER, CONFLICT } from './mergeRules.js';

/** 앱 BibleDbAdapter.DATABASE_VERSION. 백업 파일의 user_version */
export const APP_DB_VERSION = 12;

// 앱 BibleDbAdapter의 create 문 그대로(글자 하나 바꾸지 않음). 위젯·역본 설정 표는 웹에 없지만,
// 앱이 여는 DB와 모양이 같도록 빈 표로 만든다
const SCHEMA = [
  'create table if not exists my_underline (_id integer primary key autoincrement, '
    + 'book_id integer not null, chapter_no integer not null,'
    + 'verse_no integer not null, '
    + 'verse_content text not null, type integer not null, ver text not null, updated_at integer not null default 0, deleted integer not null default 0);',
  'create table if not exists my_memo (_id integer primary key autoincrement, '
    + 'book_id integer not null, chapter_no integer not null,'
    + 'verse_no integer not null, '
    + 'memo text not null, type integer not null, ver text not null, updated_at integer not null default 0, deleted integer not null default 0, '
    + "memo_book text not null default 'default');",
  'create table if not exists my_read_check (_id integer primary key autoincrement, '
    + 'book_id integer not null, chapter_no integer not null,'
    + "check_table_id integer not null, ver text not null, check_datetime datetime default (datetime('now','localtime')), updated_at integer not null default 0, deleted integer not null default 0);",
  'create table if not exists widget_list (_id integer primary key autoincrement, '
    + 'widget_id  integer not null,'
    + 'text_color text not null,'
    + 'text_size text not null,'
    + 'background_color text not null,'
    + 'transparency text not null,'
    + 'display_type integer not null,'
    + 'content_display_type integer not null,'
    + 'update_interval integer not null);',
  'create table if not exists widget_verses (_id integer primary key autoincrement, '
    + 'widget_id  integer not null,'
    + 'verse text not null);',
  'create table if not exists ver_setting (_id integer primary key autoincrement, '
    + 'ver text not null, ver_order integer not null,'
    + 'text_color integer not null, updated_at integer not null default 0, deleted integer not null default 0);',
  'create table if not exists my_bookmark (_id integer primary key autoincrement, '
    + 'book_id integer not null, chapter_no integer not null, verse_no integer not null, '
    + 'created_at integer not null default 0'
    + ', updated_at integer not null default 0, deleted integer not null default 0);',
  'create table if not exists memo_book (_id integer primary key autoincrement, '
    + 'uid text not null unique, name text, book_order integer not null default 0, '
    + 'continuous_input integer not null default 0, skip_filled integer not null default 0, '
    + 'next_chapter integer not null default 0, enter_saves integer not null default 0, '
    + 'created_at integer not null default 0, updated_at integer not null default 0, deleted integer not null default 0);',
];
// 앱 DATABASE_INSERT_DEFAULT_MEMO_BOOK. 웹 행을 넣은 뒤에 돌려서, 웹에 기본 메모책 행이 없을 때만 들어간다
const INSERT_DEFAULT_MEMO_BOOK = "insert or ignore into memo_book (uid, book_order) values ('default', 0)";

/**
 * 웹 저장소(= 앱 표)마다 옮기는 칸과 값이 없을 때 넣을 값. 키 칸이 없는 행은 깨진 행이라 넣지 않는다.
 * 기본값은 앱 칸의 not null을 지키려는 것(앱 create 문의 default와 같게, 없는 것은 빈 글·0)
 */
export const TABLES = {
  my_underline: {
    keys: ['ver', 'book_id', 'chapter_no', 'verse_no'],
    cols: { verse_content: '', type: 1, updated_at: 0, deleted: 0 },
  },
  memo_book: {
    keys: ['uid'],
    cols: {
      name: null, book_order: 0, continuous_input: 0, skip_filled: 0, next_chapter: 0, enter_saves: 0,
      created_at: 0, updated_at: 0, deleted: 0,
    },
  },
  my_memo: {
    keys: ['memo_book', 'book_id', 'chapter_no', 'verse_no'],
    cols: { memo: '', type: 1, ver: '', updated_at: 0, deleted: 0 },
  },
  my_read_check: {
    keys: ['ver', 'book_id', 'chapter_no', 'check_table_id'],
    cols: { check_datetime: null, updated_at: 0, deleted: 0 },
  },
  my_bookmark: {
    keys: ['book_id', 'chapter_no', 'verse_no'],
    cols: { created_at: 0, updated_at: 0, deleted: 0 },
  },
};

/** 수동 백업 파일 이름(앱 DataBackup.datedName). 예: lifovebible_backup_20261108_2130.db (기기 시각) */
export function backupName(date = new Date()) {
  const p = (n) => String(n).padStart(2, '0');
  return `lifovebible_backup_${date.getFullYear()}${p(date.getMonth() + 1)}${p(date.getDate())}_`
    + `${p(date.getHours())}${p(date.getMinutes())}.db`;
}

/**
 * 웹 데이터로 앱 백업 파일을 만든다. 지운 표시(deleted=1) 행도 넣는다: 앱 백업도 DB 파일 통째라 지운 행이 들어 있고,
 * 그래야 합칠 때 '지운 것'도 퍼진다(mergeRules.latest).
 * 행은 고친 시각 순서로 넣는다(앱의 _id 순서가 대략 만든·고친 순서와 맞게. 앱 목록의 '최근목록순'이 _id를 본다)
 * @param SQL sql.js 모듈(initSqlJs 결과)
 * @param {Object<string, object[]>} data 저장소 이름 → 행들(userStore.allUserData)
 * @returns {{bytes: Uint8Array, counts: Object<string, number>}} counts는 표마다 넣은 행 수
 */
export function buildBackup(SQL, data) {
  const db = new SQL.Database();
  try {
    db.run('begin');
    for (const s of SCHEMA) db.run(s);
    const counts = {};
    for (const [table, t] of Object.entries(TABLES)) {
      const names = [...t.keys, ...Object.keys(t.cols)];
      const stmt = db.prepare(`insert into ${table} (${names.join(', ')}) values (${names.map(() => '?').join(', ')})`);
      counts[table] = 0;
      const rows = [...(data[table] || [])].sort((a, b) => order(a) - order(b));
      for (const row of rows) {
        if (t.keys.some((k) => row[k] == null)) continue;
        stmt.run(names.map((n) => cell(n in t.cols ? row[n] ?? t.cols[n] : row[n])));
        counts[table]++;
      }
      stmt.free();
    }
    db.run(INSERT_DEFAULT_MEMO_BOOK);
    db.run('commit');
    db.run(`pragma user_version = ${APP_DB_VERSION}`);
    return { bytes: db.export(), counts };
  } finally {
    db.close();
  }
}

function order(row) {
  return Number(row.updated_at ?? row.created_at) || 0;
}

/** sql.js에 넘길 값. 참·거짓은 0/1, 그 밖에 숫자·글·null만(앱 칸에 맞게) */
function cell(v) {
  if (v === undefined) return null;
  if (typeof v === 'boolean') return v ? 1 : 0;
  return v;
}

// ---- 가져오기(복구): 앱 DataBackup.receive·verifyDatabase, BibleDbAdapter.mergeFrom·readRows, 바꾸기 뒤 onUpgrade ----

/** 복구할 수 없는 파일. kind: 'notBackup'(SQLite가 아니거나 앱 표가 없음) | 'newer'(더 새 앱의 백업) | 'damaged' */
export class BackupError extends Error {
  constructor(kind, detail = '') {
    super(`${kind}${detail ? ': ' + detail : ''}`);
    this.kind = kind;
  }
}

// 합치는 차례(앱 mergeFrom과 같게: 메모책이 메모보다 먼저)
const MERGE_ORDER = ['my_underline', 'memo_book', 'my_memo', 'my_read_check', 'my_bookmark'];
// '같은 내용인가' 비교 칸(앱 MergeTable.value)
const VALUE_COL = { my_underline: 'type', my_memo: 'memo' };
// 글자인 키 칸(앱 isTextKey). 나머지 키는 숫자
const TEXT_KEYS = new Set(['ver', 'memo_book', 'uid']);
// 옛 백업에 없는 키 칸과 그때 쓸 값(앱 MERGE_MEMO의 missingKey: DB 9 이하 메모는 기본 메모책)
const MISSING_KEY = { my_memo: ['memo_book', 'default'] };

/**
 * 고른 파일이 온전한 앱 백업인지 보고 연다(앱 receive + verifyDatabase). 이름·확장자는 보지 않는다:
 * 앱 7.4.6 이하 백업은 확장자 없는 'lifovebible'이다. 닫기는 부르는 쪽이(db.close())
 * @returns {{db: object, version: number}}
 */
export function openBackup(SQL, bytes) {
  const head = new TextDecoder().decode(bytes.subarray(0, 15));
  if (bytes.length < 100 || head !== 'SQLite format 3') throw new BackupError('notBackup');
  let db = null;
  try {
    db = new SQL.Database(bytes);
    const version = Number(scalar(db, 'pragma user_version'));
    // 더 새 앱이 만든 백업은 칸 뜻이 바뀌었을 수 있어 읽지 않는다(앱 NewerBackupException)
    if (version > APP_DB_VERSION) throw new BackupError('newer', String(version));
    const check = String(scalar(db, 'pragma quick_check'));
    if (check.toLowerCase() !== 'ok') throw new BackupError('damaged', check);
    // 웹에서 더한 검사: 앱 표가 하나도 없으면 다른 프로그램의 SQLite 파일이다(앱은 '가져올 것 없음'이 된다)
    if (!MERGE_ORDER.some((t) => columnsOf(db, t).size)) throw new BackupError('notBackup', 'no app tables');
    return { db, version };
  } catch (e) {
    db?.close();
    if (e instanceof BackupError) throw e;
    throw new BackupError('damaged', e?.message); // 잘린 파일 등(sql.js가 여는 데 실패)
  }
}

/**
 * 백업의 표들을 읽는다(앱 readRows). 표마다 { hasTime, rows: 키 문자열 → { row, rec, rowId } }. 읽을 수 없는 표는 null
 * (표가 없음: DB 8 이하의 my_bookmark·memo_book. 또는 키 칸이 없음).
 * - 예전 앱은 같은 키에 행이 여럿 생길 수 있었으므로 살아 있는 것, 그다음 나중에 고친 것, 그다음 큰 _id 하나만
 * - updated_at·deleted 칸이 없는 옛 백업(DB 8 이하)은 시각 NO_TIME, 지우지 않음으로 본다(hasTime: false)
 * - row에는 백업에 있는 칸만 담는다(합칠 때 없는 칸은 지금 값을 남기려고. 앱 update도 그렇다)
 */
export function readBackup(db) {
  const out = {};
  for (const table of MERGE_ORDER) {
    const t = TABLES[table];
    const cols = columnsOf(db, table);
    const missing = MISSING_KEY[table];
    if (!cols.size || t.keys.some((k) => !cols.has(k) && k !== missing?.[0])) {
      out[table] = null;
      continue;
    }
    const hasTime = cols.has('updated_at'), hasDeleted = cols.has('deleted');
    const data = Object.keys(t.cols).filter((c) => c !== 'updated_at' && c !== 'deleted' && cols.has(c));
    const rows = new Map();
    const res = db.exec(`select rowid as _rowid_, * from ${table} order by rowid`)[0];
    for (const v of res ? res.values : []) {
      const r = Object.fromEntries(res.columns.map((c, i) => [c.toLowerCase(), v[i]]));
      const row = {};
      for (const k of t.keys) {
        const x = cols.has(k) ? r[k] : missing[1];
        row[k] = x == null ? null : TEXT_KEYS.has(k) ? String(x) : Number(x);
      }
      if (t.keys.some((k) => row[k] == null || Number.isNaN(row[k]))) continue; // 키가 빈 깨진 행
      for (const c of data) row[c] = r[c];
      const value = VALUE_COL[table];
      const item = {
        row,
        rec: rec(hasTime ? r.updated_at : NO_TIME, hasDeleted ? r.deleted : 0, value ? r[value] : null),
        rowId: Number(r._rowid_),
      };
      const key = keyOf(table, row);
      const prev = rows.get(key);
      if (!prev || better(item, prev)) rows.set(key, item);
    }
    out[table] = { hasTime, rows };
  }
  return out;
}

/** 행을 알아보는 키 문자열(앱 readRows의 key) */
export function keyOf(table, row) {
  return TABLES[table].keys.map((k) => row[k]).join('\u0001');
}

/**
 * 합치기 계획(앱 mergeFrom·mergeTable). 지금 데이터는 바꾸지 않고, 쓸 행과 메모 충돌을 돌려준다.
 * - 백업에서 가져오는 행: 지금 행(없으면 기본값) 위에 백업에 있는 칸을 덮고, 시각·삭제 표시는 백업 것.
 *   시각이 없는 옛 백업에서 가져온 행은 '가져온 시각'(now)을 남긴다(0을 남기면 다음 합치기·동기화 때 구별이 안 됨. 앱과 같다)
 * - 메모 충돌은 쓰지 않는다. 화면에서 고른 뒤 쓴다(앱 applyMemoChoice)
 * @param {Object<string, object[]>} local 지금 데이터(userStore.allUserData)
 * @param backup readBackup 결과
 * @returns {{puts: Object<string, object[]>, counts: object, conflicts: object[]}}
 *   counts는 앱 MergeResult처럼 백업 쪽으로 넣거나 바꾼 행 수(삭제 표시를 가져온 것 포함)
 */
export function planMerge(local, backup, now = Date.now()) {
  const puts = {}, conflicts = [];
  const n = {};
  for (const table of MERGE_ORDER) {
    puts[table] = [];
    n[table] = 0;
    const theirs = backup[table];
    if (!theirs) continue;
    const mine = localMap(table, local[table]);
    for (const [key, o] of theirs.rows) {
      const m = mine.get(key);
      const choice = table === 'my_memo' ? memoChoice(m?.rec ?? null, o.rec) : latest(m?.rec ?? null, o.rec);
      if (choice === CONFLICT) {
        conflicts.push({
          memo_book: o.row.memo_book, book_id: o.row.book_id, chapter_no: o.row.chapter_no, verse_no: o.row.verse_no,
          localMemo: m.rec.value, backupMemo: o.rec.value, type: m.row.type, ver: m.row.ver,
        });
        continue;
      }
      if (choice !== TAKE_OTHER) continue;
      puts[table].push({
        ...(m ? m.row : fill(table, {}, now)),
        ...o.row,
        updated_at: o.rec.updatedAt === NO_TIME ? now : o.rec.updatedAt,
        deleted: o.rec.deleted ? 1 : 0,
      });
      n[table]++;
    }
  }
  return {
    puts,
    conflicts,
    counts: {
      underlines: n.my_underline, memos: n.my_memo, readChecks: n.my_read_check, bookmarks: n.my_bookmark,
      memoBooks: n.memo_book,
    },
  };
}

/**
 * 바꾸기 계획: 지금 데이터를 모두 백업으로(앱 restoreFromUri → replaceWith). 저장소마다 넣을 행 전부를 돌려준다.
 * 앱은 백업 파일을 DB 자리에 놓고 열면서 onUpgrade가 옛 구조를 고친다. 웹은 그 고침을 여기서 한다:
 * - 시각이 없는 옛 백업(DB 8 이하): 읽음 기록은 체크한 시각, 나머지는 바꾼 시각(now). 지우지 않음
 * - 메모책 칸이 없는 메모(DB 9 이하): 기본 메모책(readBackup이 넣음). 기본 메모책 행이 없으면 넣는다
 * - 백업에 살아 있는 책갈피가 없으면(앱 7.5.2 이하 백업은 책갈피가 파일이었음) 지금 책갈피를 가져온다(앱 keepBookmarksFrom)
 * - 같은 키가 여럿이던 옛 행은 하나로(readBackup). 웹 저장소는 키마다 행이 하나뿐이라
 * @param defaultMemoBook 기본 메모책 행(memoBook.defaultMemoBookRow())
 */
export function planReplace(local, backup, defaultMemoBook, now = Date.now()) {
  const rows = {};
  for (const table of MERGE_ORDER) {
    const b = backup[table];
    rows[table] = b ? [...b.rows.values()].map(({ row, rec: r }) => fill(table, {
      ...row,
      updated_at: b.hasTime ? r.updatedAt : upgradedTime(table, row, now),
      deleted: r.deleted ? 1 : 0,
    }, now)) : [];
  }
  if (!rows.memo_book.some((r) => r.uid === defaultMemoBook.uid)) rows.memo_book.unshift({ ...defaultMemoBook });

  let kept = 0;
  if (!rows.my_bookmark.some((r) => !r.deleted)) {
    const mine = new Map(rows.my_bookmark.map((r) => [keyOf('my_bookmark', r), r]));
    for (const old of local.my_bookmark || []) {
      if (TABLES.my_bookmark.keys.some((k) => old[k] == null)) continue;
      const key = keyOf('my_bookmark', old);
      const cur = mine.get(key);
      if (latest(cur ? rec(cur.updated_at, cur.deleted) : null, rec(old.updated_at, old.deleted)) !== TAKE_OTHER) continue;
      mine.set(key, { ...old });
      if (!old.deleted) kept++;
    }
    rows.my_bookmark = [...mine.values()];
  }
  const alive = (t) => rows[t].filter((r) => !r.deleted).length;
  return {
    rows,
    keptBookmarks: kept,
    counts: {
      underlines: alive('my_underline'), memos: alive('my_memo'), readChecks: alive('my_read_check'),
      bookmarks: alive('my_bookmark'), memoBooks: alive('memo_book'),
    },
  };
}

/**
 * 앱 onUpgrade(oldVersion < 9)가 넣는 시각. 읽음 기록은 strftime('%s', check_datetime) * 1000,
 * 나머지는 바꾼 시각. strftime('%s')는 기기 시각 글을 UTC로 읽으므로 웹도 UTC로 읽는다(앱과 같은 값이 되게)
 */
function upgradedTime(table, row, now) {
  if (table === 'my_read_check' && typeof row.check_datetime === 'string') {
    const m = row.check_datetime.match(/^(\d{4})-(\d\d)-(\d\d)[ T](\d\d):(\d\d)(?::(\d\d))?/);
    if (m) return Date.UTC(+m[1], m[2] - 1, +m[3], +m[4], +m[5], +(m[6] || 0));
  }
  return now;
}

/**
 * 빠진 칸을 채운다(앱 표의 default와 같게). 읽음 기록의 check_datetime은 칸이 없던 옛 백업(DB 6 이하)이면
 * 앱이 넣을 때처럼 지금 기기 시각
 */
function fill(table, row, now) {
  const out = { ...row };
  for (const [c, v] of Object.entries(TABLES[table].cols)) {
    if (out[c] !== undefined) continue;
    out[c] = c === 'check_datetime' ? localDateTime(new Date(now)) : v;
  }
  return out;
}

function localDateTime(d) {
  const p = (x) => String(x).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
}

/** 지금 데이터를 키 → { row, rec }로. 웹 저장소는 키마다 행이 하나라 겹치지 않는다 */
function localMap(table, rows = []) {
  const value = VALUE_COL[table];
  const map = new Map();
  for (const row of rows) {
    if (TABLES[table].keys.some((k) => row[k] == null)) continue;
    map.set(keyOf(table, row), { row, rec: rec(row.updated_at, row.deleted, value ? row[value] : null) });
  }
  return map;
}

function better(a, b) {
  if (a.rec.deleted !== b.rec.deleted) return !a.rec.deleted;
  if (a.rec.updatedAt !== b.rec.updatedAt) return a.rec.updatedAt > b.rec.updatedAt;
  return a.rowId > b.rowId;
}

function columnsOf(db, table) {
  const r = db.exec(`pragma table_info(${table})`)[0];
  if (!r) return new Set();
  const i = r.columns.indexOf('name');
  return new Set(r.values.map((v) => String(v[i]).toLowerCase()));
}

function scalar(db, sql) {
  return db.exec(sql)[0]?.values[0]?.[0];
}
