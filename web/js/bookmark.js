// 책갈피(앱 my_bookmark, 7.6.0부터 DB) 계산. DOM·IndexedDB 없이(테스트하려고).
// 행 모양은 앱 BibleDbAdapter(DB 12)의 my_bookmark 칸 그대로 둔다. 앱 백업과 주고받기(6단계)·동기화를 위해서:
//   { book_id(0~65), chapter_no(1~), verse_no(1~), created_at(epoch ms), updated_at(epoch ms), deleted(0|1) }
// 역본 칸은 없다(앱도 위치만 남긴다). 앱의 _id는 두지 않고 내용 키(book_id, chapter_no, verse_no)로 알아본다
// (앱 bookmarkKey, MERGE_BOOKMARK 키. 한 위치에 한 행)

export { deletedRow } from './readCheck.js'; // 지우기 규칙은 읽음 표시와 같다(삭제 표시만)

const BOOKS = 66;

/**
 * 책갈피 행. 앱 createBookmark(upsert)처럼 같은 위치가 있으면(지운 것 포함) 되살리고,
 * created_at을 지금으로 바꿔 목록 맨 위로 올린다. 앱에서 온 모르는 칸은 남긴다
 */
export function bookmarkRow(prev, book, chapter, verse, now = Date.now()) {
  return {
    ...prev,
    book_id: book,
    chapter_no: chapter,
    verse_no: verse < 1 ? 1 : verse, // 앱 BookmarkStore.add: 절이 없으면 1절
    created_at: now,
    updated_at: now,
    deleted: 0,
  };
}

/**
 * 책갈피 목록(앱 fetchAllBookmarks): 지운 행 빼고 최근 추가한 것부터.
 * 앱은 created_at이 같으면 _id 역순인데 웹에는 _id가 없어 책·장·절 순으로 늘 같은 순서가 되게.
 * 책 순번이 어긋난 행은 건너뛴다(앱 HistoryList.getBookmarks와 같음. 예전 파일에서 옮긴 줄)
 * @returns {{book: number, chapter: number, verse: number, created_at: number}[]}
 */
export function bookmarkList(rows) {
  const items = [];
  for (const r of rows || []) {
    if (r.deleted) continue;
    if (!Number.isInteger(r.book_id) || r.book_id < 0 || r.book_id >= BOOKS) continue;
    if (!Number.isInteger(r.chapter_no) || !Number.isInteger(r.verse_no)) continue;
    items.push({ book: r.book_id, chapter: r.chapter_no, verse: r.verse_no, created_at: r.created_at || 0 });
  }
  items.sort((a, b) => b.created_at - a.created_at
    || a.book - b.book || a.chapter - b.chapter || a.verse - b.verse);
  return items;
}
