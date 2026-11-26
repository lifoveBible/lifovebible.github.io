// 메모책(앱 memo_book 표, DB v10~12) 계산. DOM·IndexedDB 없이(테스트하려고).
// 행 모양은 앱 칸 그대로(6단계 백업 주고받기·동기화를 위해서):
//   { uid, name(null이면 번역된 기본 이름), book_order, continuous_input, skip_filled, next_chapter, enter_saves,
//     created_at, updated_at, deleted }
// 앱의 _id는 두지 않고 uid(UUID)를 키로 한다(앱도 동기화 때 섞이지 않게 uid로 알아본다).

export { deletedRow } from './readCheck.js'; // 지우기 규칙은 같다(삭제 표시만)
import { DEFAULT_MEMO_BOOK } from './memo.js';

export { DEFAULT_MEMO_BOOK };

/**
 * 기본 메모책 행(앱 DATABASE_INSERT_DEFAULT_MEMO_BOOK). 시각이 0인 까닭은 앱과 같다:
 * '아직 고친 적 없음'이라 다른 기기에서 이름을 바꾼 기본 메모책이 합치기·동기화에서 이기게
 */
export function defaultMemoBookRow() {
  return {
    uid: DEFAULT_MEMO_BOOK, name: null, book_order: 0,
    continuous_input: 0, skip_filled: 0, next_chapter: 0, enter_saves: 0,
    created_at: 0, updated_at: 0, deleted: 0,
  };
}

/** 새 메모책 행(앱 createMemoBook, opts는 입력 방식). 순서는 지운 것까지 포함한 가장 큰 값 + 1(앱 maxMemoBookOrder와 같다) */
export function newMemoBookRow(rows, uid, name, now = Date.now(), opts = {}) {
  let max = 0;
  for (const r of rows || []) if (Number.isInteger(r.book_order) && r.book_order > max) max = r.book_order;
  return optionsMemoBookRow({
    uid, name, book_order: max + 1,
    continuous_input: 0, skip_filled: 0, next_chapter: 0, enter_saves: 0,
    created_at: now, updated_at: now, deleted: 0,
  }, opts, now);
}

/** 이름 고치기(앱 updateMemoBook에서 이름만). 빈 이름은 null(기본 메모책만 비울 수 있다. 화면이 막는다) */
export function renamedMemoBookRow(prev, name, now = Date.now()) {
  const n = String(name ?? '').trim();
  return { ...prev, name: n || null, updated_at: now };
}

/** 화면에 보일 이름(앱 MemoBookList.displayName). 비었으면 번역된 기본 이름 */
export function memoBookName(row, defaultName) {
  return row && typeof row.name === 'string' && row.name !== '' ? row.name : defaultName;
}

/**
 * 지우지 않은 메모책, 목록 순서대로(앱 fetchMemoBooks: book_order, _id).
 * 웹 행에는 _id가 없으므로 같은 순서면 만든 시각, 그다음 uid로(늘 같은 순서가 되게)
 */
export function memoBookList(rows) {
  return (rows || [])
    .filter((r) => r && !r.deleted && typeof r.uid === 'string')
    .sort((a, b) => (a.book_order || 0) - (b.book_order || 0)
      || (a.created_at || 0) - (b.created_at || 0)
      || (a.uid < b.uid ? -1 : a.uid > b.uid ? 1 : 0));
}

/** 지금 메모책(앱 MemoBookList.current). 고른 것이 없어졌으면 기본 메모책 */
export function currentMemoBook(picked, books) {
  if (typeof picked !== 'string' || picked === DEFAULT_MEMO_BOOK) return DEFAULT_MEMO_BOOK;
  return books.some((b) => b.uid === picked) ? picked : DEFAULT_MEMO_BOOK;
}

/**
 * 순서 바꾸기(앱 setMemoBookOrder): uids 차례대로 0, 1, 2…. 값이 바뀌는 행만 돌려준다(그 행만 updated_at을 바꾼다)
 * @param {object[]} books memoBookList의 것
 */
export function reorderedMemoBooks(books, uids, now = Date.now()) {
  const byUid = new Map(books.map((b) => [b.uid, b]));
  const out = [];
  uids.forEach((uid, i) => {
    const b = byUid.get(uid);
    if (b && b.book_order !== i) out.push({ ...b, book_order: i, updated_at: now });
  });
  return out;
}

/** books 안에서 i번째를 dir(-1 위로, 1 아래로)만큼 옮긴 uid 차례. 못 옮기면 null */
export function movedUids(books, i, dir) {
  const j = i + dir;
  if (i < 0 || i >= books.length || j < 0 || j >= books.length) return null;
  const uids = books.map((b) => b.uid);
  [uids[i], uids[j]] = [uids[j], uids[i]];
  return uids;
}

/** 메모책마다 메모 수(앱 countMemos). 지운 행·빈 메모는 세지 않는다(memo.memoList와 같은 기준) */
export function memoCounts(memoRows) {
  const counts = new Map();
  for (const r of memoRows || []) {
    if (r.deleted || typeof r.memo !== 'string' || r.memo === '') continue;
    counts.set(r.memo_book, (counts.get(r.memo_book) || 0) + 1);
  }
  return counts;
}

/**
 * 새 메모책 uid(UUID v4 꼴, 앱 UUID.randomUUID와 같은 모양). crypto.randomUUID는 https·localhost에서만 있어서
 * http://192.168.x.x로 열어도 되게 getRandomValues로 직접 만든다
 * @param {(a: Uint8Array) => Uint8Array} fill 시험에서 바꿔 끼우려고
 */
export function newUid(fill = (a) => crypto.getRandomValues(a)) {
  const b = fill(new Uint8Array(16));
  b[6] = (b[6] & 0x0f) | 0x40;
  b[8] = (b[8] & 0x3f) | 0x80;
  const h = [...b].map((x) => x.toString(16).padStart(2, '0')).join('');
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}

// ---- 입력 방식(앱 MemoInput, 메모책 옵션) ----
// 화면에서 쓰는 이름 → 앱 칸 이름. 차례는 앱 MemoInput.OPT_*와 같다
export const MEMO_OPTIONS = [
  ['continuous', 'continuous_input'], // 저장하면 다음 절로
  ['skipFilled', 'skip_filled'], // 메모 있는 절 건너뛰기(연속 입력일 때만 뜻이 있다)
  ['nextChapter', 'next_chapter'], // 장 끝에서 다음 장으로(연속 입력일 때만)
  ['enterSaves', 'enter_saves'], // 엔터를 누르면 저장
];

/** 행 → { continuous, skipFilled, nextChapter, enterSaves } (0이 아니면 켜짐. 앱 칸은 정수) */
export function memoBookOptions(row) {
  const o = {};
  for (const [k, col] of MEMO_OPTIONS) o[k] = !!(row && row[col]);
  return o;
}

/** 입력 방식만 바꾼 행(앱 updateMemoBookOptions). opts에 없는 옵션은 그대로 */
export function optionsMemoBookRow(prev, opts, now = Date.now()) {
  const row = { ...prev, updated_at: now };
  for (const [k, col] of MEMO_OPTIONS) if (k in opts) row[col] = opts[k] ? 1 : 0;
  return row;
}

/**
 * 연속 입력에서 current 절 다음으로 쓸 절(1부터). 장 안에 없으면 -1(앱 MemoInput.nextVerse).
 * 다음 장의 처음부터 찾을 때는 current = 0
 * @param {Set<number>|Map<number,*>} filled 메모가 있는 절들(skipFilled일 때만 본다)
 */
export function nextMemoVerse(current, verseCount, filled, skipFilled) {
  for (let v = Math.max(0, current) + 1; v <= verseCount; v++) {
    if (!skipFilled || !filled || !filled.has(v)) return v;
  }
  return -1;
}
