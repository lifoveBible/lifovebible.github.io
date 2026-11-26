// 형광펜(앱 my_underline, 예전 이름 밑줄) 계산. DOM·IndexedDB 없이(테스트하려고).
// 행 모양은 앱 BibleDbAdapter(DB 12)의 my_underline 칸 그대로 둔다. 앱 백업과 주고받기(6단계)·동기화를 위해서:
//   { ver, book_id(0~65), chapter_no(1~), verse_no(1~), verse_content('<절> <본문>'), type(1),
//     updated_at(epoch ms), deleted(0|1) }
// 앱의 _id는 두지 않는다. 행은 내용 키(ver, book_id, chapter_no, verse_no)로 알아본다(앱 MERGE_UNDERLINE 키)

export { deletedRow } from './readCheck.js'; // 지우기 규칙은 읽음 표시와 같다(삭제 표시만)

export const HIGHLIGHT_TYPE = 1; // 앱 inputSelectedVersesToDB는 늘 1을 넣는다

/**
 * 칠한 행. 앱 createUnderline(upsert)처럼 이미 있는 행(지운 것 포함)이면 되살려 고친다.
 * verse_content는 앱처럼 "절번호 본문"(앱 나의형광펜목록이 첫 빈칸으로 나눠 보인다)
 */
export function highlightRow(prev, ver, book, chapter, verse, text, now = Date.now()) {
  return {
    ...prev,
    ver,
    book_id: book,
    chapter_no: chapter,
    verse_no: verse,
    verse_content: `${verse} ${text}`,
    type: HIGHLIGHT_TYPE,
    updated_at: now,
    deleted: 0,
  };
}

/** 한 장의 행들 → 역본 코드 → 칠한 절 번호 모음(지운 행은 뺀다) */
export function highlightMap(rows) {
  const map = new Map();
  for (const r of rows || []) {
    if (r.deleted || !Number.isInteger(r.verse_no)) continue;
    if (!map.has(r.ver)) map.set(r.ver, new Set());
    map.get(r.ver).add(r.verse_no);
  }
  return map;
}

/**
 * 고른 절에서 형광펜을 칠하거나 지울 칸들. 대조 보기면 보이는 역본 모두(앱은 2단의 두 역본을 함께 칠한다).
 * 이 장에 없는 절(missing)은 뺀다(앱도 둘째 역본 본문이 비었으면 넣지 않는다)
 * @param {{verse: number, cells: {text: string, missing?: boolean}[]}[]} rows 화면에 그린 장
 * @param {Set<number>} selected 고른 절 번호
 * @param {string[]} codes 역본 코드(cells와 같은 순서)
 * @returns {{ver: string, verse: number, text: string}[]}
 */
export function targetsOf(rows, selected, codes) {
  const out = [];
  for (const r of rows) {
    if (!selected.has(r.verse)) continue;
    r.cells.forEach((c, i) => {
      if (c && !c.missing && codes[i]) out.push({ ver: codes[i], verse: r.verse, text: c.text });
    });
  }
  return out;
}

/**
 * 동작 바에 칠하기·지우기 중 무엇을 보일지(앱 onCreateContextMenu: 안 칠한 칸이 있으면 칠하기,
 * 칠한 칸이 있으면 지우기, 섞여 있으면 둘 다)
 */
export function highlightActions(targets, map) {
  let add = false, remove = false;
  for (const t of targets) {
    if (map.get(t.ver)?.has(t.verse)) remove = true;
    else add = true;
  }
  return { add, remove };
}

/**
 * 나의형광펜목록(앱 UnderlineList)에 보일 줄들. 지운 행은 뺀다.
 * order 'recent': 최근에 칠한 것부터(앱은 _id 역순인데 웹에는 _id가 없어 updated_at 역순. 지웠다 다시 칠하면 앞으로 온다),
 * 'book': 책·장·절 순(앱 fetchAllUnderlines의 BOOK_ORDER). 같으면 책·장·절, 역본 코드 순으로 늘 같은 순서가 되게
 * @returns {{ver: string, book: number, chapter: number, verse: number, text: string, updated_at: number}[]}
 */
export function highlightList(rows, order = 'recent') {
  const items = [];
  for (const r of rows || []) {
    if (r.deleted || !Number.isInteger(r.book_id) || !Number.isInteger(r.verse_no)) continue;
    items.push({
      ver: r.ver, book: r.book_id, chapter: r.chapter_no, verse: r.verse_no,
      text: contentText(r.verse_content), updated_at: r.updated_at || 0,
    });
  }
  const byPlace = (a, b) => a.book - b.book || a.chapter - b.chapter || a.verse - b.verse
    || (a.ver < b.ver ? -1 : a.ver > b.ver ? 1 : 0);
  items.sort(order === 'book' ? byPlace : (a, b) => b.updated_at - a.updated_at || byPlace(a, b));
  return items;
}

/** verse_content '<절> <본문>'에서 본문만(앱 UnderlineList처럼 첫 빈칸에서 나눈다. 빈칸이 없으면 통째로) */
export function contentText(content) {
  const s = content == null ? '' : String(content);
  const i = s.indexOf(' ');
  return i > 0 ? s.slice(i + 1) : s;
}

/** 형광펜 보내기 글(앱 exportUnderlines): 보이는 순서대로 "참조 · 역본\n본문"을 빈 줄로 나눈다 */
export function highlightsText(items, refOf) {
  return items.map((it) => `${refOf(it)}\n${it.text}`).join('\n\n');
}
