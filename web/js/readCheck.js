// 읽음 표시(장 단위)와 성경읽기통계 계산. DOM·IndexedDB 없이(테스트하려고).
// 행 모양은 앱 BibleDbAdapter(DB 12)의 my_read_check 칸 그대로 둔다. 앱 백업과 주고받기(6단계)·동기화를 위해서:
//   { ver, book_id(0~65), chapter_no(1~), check_table_id(1), check_datetime('yyyy-MM-dd HH:mm:ss', 기기 시각),
//     updated_at(epoch ms), deleted(0|1) }
// 앱의 _id(자동 번호)는 두지 않는다. 행은 내용 키(ver, book_id, chapter_no, check_table_id)로 알아본다(앱 readCheckKey)

import { CHAPTERS, OT_COUNT, BOOK_COUNT } from './books.js';

export const CHECK_TABLE = 1; // 앱 Util.DEFAULT_CHECK_TABLE. 앱에도 표가 하나뿐이다

/** 앱 createReadCheck가 넣는 check_datetime 꼴(기기 시각) */
export function localDateTime(date) {
  const p = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${p(date.getMonth() + 1)}-${p(date.getDate())} `
    + `${p(date.getHours())}:${p(date.getMinutes())}:${p(date.getSeconds())}`;
}

/**
 * 읽음으로 표시한 행. 앱 upsert처럼 이미 있는 행(지운 것 포함)이면 그 행을 되살려 고친다.
 * 앱은 다시 체크하면 check_datetime도 새로 넣는다
 */
export function checkedRow(prev, ver, book, chapter, now = Date.now()) {
  return {
    ...prev,
    ver,
    book_id: book,
    chapter_no: chapter,
    check_table_id: CHECK_TABLE,
    check_datetime: localDateTime(new Date(now)),
    updated_at: now,
    deleted: 0,
  };
}

/** 지우기는 삭제 표시만(앱 softDelete). 이미 지운 행이면 그대로 둔다(고친 시각을 바꾸지 않게) */
export function deletedRow(row, now = Date.now()) {
  if (!row || row.deleted) return null;
  return { ...row, deleted: 1, updated_at: now };
}

const keyOf = (book, chapter) => book * 1000 + chapter;

/** 한 역본의 행들 → 읽은 장 모음(지운 행, 범위 밖 행은 뺀다) */
export function readSet(rows) {
  const set = new Set();
  for (const r of rows || []) {
    if (r.deleted) continue;
    const b = r.book_id, c = r.chapter_no;
    if (!Number.isInteger(b) || b < 0 || b >= BOOK_COUNT) continue;
    if (!Number.isInteger(c) || c < 1 || c > CHAPTERS[b]) continue;
    set.add(keyOf(b, c));
  }
  return set;
}

/**
 * 고른 역본 모두에서 읽었는가(앱 setReadCheck: 하나라도 없으면 체크 안 됨).
 * sets는 역본 코드 → readSet. 고른 역본이 없으면 false
 */
export function isRead(sets, codes, book, chapter) {
  if (!codes.length) return false;
  return codes.every((code) => sets.get(code)?.has(keyOf(book, chapter)));
}

/** 한 책에서 고른 역본 모두 읽은 장 번호들(앱 DialogChapterSelectionTable의 체크 색) */
export function readChaptersOf(sets, codes, book) {
  const out = new Set();
  for (let c = 1; c <= CHAPTERS[book]; c++) if (isRead(sets, codes, book, c)) out.add(c);
  return out;
}

/**
 * 앱 ReadCheckTable의 퍼센트: DecimalFormat("#")로 정수. 그 반올림은 HALF_EVEN(0.5는 짝수 쪽)이다
 */
export function percent(read, total) {
  if (!total) return 0;
  const x = (read / total) * 100;
  const f = Math.floor(x);
  if (Math.abs(x - f - 0.5) < 1e-9) return f % 2 === 0 ? f : f + 1;
  return Math.round(x);
}

/**
 * 성경읽기통계(앱 getReadBookList). 한 역본의 읽은 장 모음 → 전체·구약·신약과 66권 각각 { read, total }
 */
export function readStats(set) {
  const books = CHAPTERS.map((total) => ({ read: 0, total }));
  for (const k of set) books[Math.floor(k / 1000)].read++;
  const sum = (from, to) => books.slice(from, to).reduce(
    (a, b) => ({ read: a.read + b.read, total: a.total + b.total }), { read: 0, total: 0 });
  return { all: sum(0, BOOK_COUNT), ot: sum(0, OT_COUNT), nt: sum(OT_COUNT, BOOK_COUNT), books };
}
