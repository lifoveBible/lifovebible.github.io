// 메모(앱 my_memo) 계산. DOM·IndexedDB 없이(테스트하려고).
// 행 모양은 앱 BibleDbAdapter(DB 12)의 my_memo 칸 그대로 둔다. 앱 백업과 주고받기(6단계)·동기화를 위해서:
//   { memo_book('default' 또는 메모책 uid), book_id(0~65), chapter_no(1~), verse_no(1~), memo, type(1), ver,
//     updated_at(epoch ms), deleted(0|1) }
// 앱의 _id는 두지 않고 내용 키(memo_book, book_id, chapter_no, verse_no)로 알아본다(앱 memoKey, MERGE_MEMO 키.
// 메모는 메모책마다 한 절에 하나). 메모책을 여럿 쓰는 것은 다음 단계라 지금은 늘 기본 메모책

export { deletedRow } from './readCheck.js'; // 지우기 규칙은 읽음 표시와 같다(삭제 표시만)

export const DEFAULT_MEMO_BOOK = 'default'; // 앱 DEFAULT_MEMO_BOOK
export const MEMO_TYPE = 1; // 앱 MemoPanel.write는 늘 1을 넣는다

/**
 * 비운 메모인가. 앱은 빈 문자열만 지운 것으로 보는데(MemoPanel.save), 웹은 빈칸·줄바꿈만 남은 것도 지운다.
 * 앱이 빈 메모를 지우게 된 까닭(빈 ★가 남음)이 빈칸만 있는 메모에도 그대로라서
 */
export function isBlankMemo(text) {
  return typeof text !== 'string' || text.trim() === '';
}

/**
 * 저장할 행. 살아 있는 행이 있으면 앱 updateMemo처럼 메모 글과 고친 시각만 바꾼다(ver·type은 처음 쓴 그대로).
 * 없거나 지운 행이면 앱 createMemo(upsert)처럼 새 값으로 되살린다. 앱에서 온 모르는 칸은 남긴다
 */
export function memoRow(prev, memoBook, book, chapter, verse, text, ver, now = Date.now()) {
  if (prev && !prev.deleted) return { ...prev, memo: text, updated_at: now };
  return {
    ...prev,
    memo_book: memoBook,
    book_id: book,
    chapter_no: chapter,
    verse_no: verse,
    memo: text,
    type: MEMO_TYPE,
    ver,
    updated_at: now,
    deleted: 0,
  };
}

/** 한 장의 행들 → 절 번호 → 메모 글(한 메모책만, 지운 행·빈 메모는 뺀다. 앱 fetchMemosInToChapter) */
export function memoMap(rows, memoBook = DEFAULT_MEMO_BOOK) {
  const map = new Map();
  for (const r of rows || []) {
    if (r.deleted || r.memo_book !== memoBook || !Number.isInteger(r.verse_no)) continue;
    if (typeof r.memo !== 'string' || r.memo === '') continue;
    map.set(r.verse_no, r.memo);
  }
  return map;
}

/**
 * 나의메모목록(앱 MemoList)에 보일 항목. 한 메모책만, 지운 행·빈 메모는 뺀다.
 * 'book'은 책·장·절순(앱 기본 BOOK_ORDER), 'recent'는 고친 시각이 늦은 것부터.
 * 앱 TIMELY_ORDER는 _id 역순(처음 쓴 순서)인데 웹 행에는 _id가 없어서 updated_at을 쓴다(형광펜 목록과 같다)
 */
export function memoList(rows, order = 'book', memoBook = DEFAULT_MEMO_BOOK) {
  const items = [];
  for (const r of rows || []) {
    if (r.deleted || r.memo_book !== memoBook) continue;
    if (!Number.isInteger(r.book_id) || !Number.isInteger(r.chapter_no) || !Number.isInteger(r.verse_no)) continue;
    if (typeof r.memo !== 'string' || r.memo === '') continue;
    items.push({
      book: r.book_id, chapter: r.chapter_no, verse: r.verse_no,
      ver: typeof r.ver === 'string' ? r.ver : '', text: r.memo, updated_at: r.updated_at || 0,
    });
  }
  const byPlace = (a, b) => a.book - b.book || a.chapter - b.chapter || a.verse - b.verse;
  items.sort(order === 'recent' ? (a, b) => b.updated_at - a.updated_at || byPlace(a, b) : byPlace);
  return items;
}

/** 메모 검색어 → 소문자 단어들(앱 MemoFilter.words. 공백으로 나눈다). 빈 검색어면 빈 배열 */
export function memoWords(query) {
  return String(query ?? '').trim().toLowerCase().split(/\s+/).filter(Boolean);
}

/** 단어가 모두 들어 있는가(대소문자 무시, 앱 MemoFilter.matches). 단어가 없으면 true. words는 memoWords의 것 */
export function memoMatches(text, words) {
  const lower = String(text ?? '').toLowerCase();
  return words.every((w) => lower.includes(w));
}

/** 메모 보내기 글(앱 exportMemos): 항목마다 "참조\n메모\n"를 이어 붙인다(앱과 같은 꼴) */
export function memosText(items, refOf) {
  return items.map((it) => `${refOf(it)}\n${it.text}\n`).join('');
}
