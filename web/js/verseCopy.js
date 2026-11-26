// 고른 절을 복사·공유할 글로 만든다(DOM 없음). 앱 VerseList.getCheckedVerseText와 같은 꼴:
//   한 역본:   "창세기 1:1 태초에 …"
//   대조 보기: "(개역한글) 창세기 1:1 태초에 …" 다음 줄 "(KJV) 창세기 1:1 In the beginning …"
// 앱은 두 역본까지라 절마다 주 역본·둘째 역본 순서로 적는다. 웹은 역본이 더 많을 수 있어 고른 순서대로 모두 적는다.
// 이 장에 없는 절(missing, "(없음)")은 적지 않는다. 앱은 채운 절도 그대로 적지만 붙여 넣으면 쓸모없는 줄이라서

/**
 * @param {string} bookName 화면 언어의 책 이름
 * @param {number} chapter
 * @param {{verse: number, cells: {text: string, missing?: boolean}[]}[]} rows 고른 절(절 순서대로)
 * @param {string[]} names 역본 이름(cells와 같은 순서). 둘 이상이면 줄 앞에 "(이름) "
 */
export function formatVerses(bookName, chapter, rows, names) {
  const many = names.length > 1;
  const lines = [];
  for (const r of [...rows].sort((a, b) => a.verse - b.verse)) {
    r.cells.forEach((c, i) => {
      if (!c || c.missing) return;
      lines.push(`${many ? `(${names[i]}) ` : ''}${bookName} ${chapter}:${r.verse} ${c.text}`);
    });
  }
  return lines.join('\n');
}

/**
 * 장 전체를 복사·공유할 글로. 앱 VerseList.getWholeChapterText와 같은 꼴:
 *   "창세기 1장 (개역한글)" 빈 줄, 다음부터 한 줄에 "<절> <본문>"
 * 대조 보기는 제목에 역본 이름을 모두 적고, 절마다 역본 순서대로 "(이름) <절> <본문>".
 * 앱과 다른 점: 앱은 제목에 "장"을 박아 두고 주 역본 이름만 적으며, 대조 보기가 아니어도 빈 둘째 줄이 절마다 들어간다.
 * 이 장에 없는 절은 formatVerses처럼 적지 않는다
 * @param {string} title 화면 언어의 장 이름(S.ref, 예: "창세기 1장", "Genesis 1")
 */
export function formatChapter(title, rows, names) {
  const many = names.length > 1;
  const lines = [`${title} (${names.join(', ')})`, ''];
  for (const r of [...rows].sort((a, b) => a.verse - b.verse)) {
    r.cells.forEach((c, i) => {
      if (!c || c.missing) return;
      lines.push(`${many ? `(${names[i]}) ` : ''}${r.verse} ${c.text}`);
    });
  }
  return lines.length > 2 ? lines.join('\n') : '';
}

/** 화면에 보이는 장(한 역본의 readChapter 결과 또는 대조 보기의 alignChapters 결과)을 rows 꼴로 */
export function rowsOfSingle(lines) {
  return lines.map((l) => ({ verse: l.verse, cells: [{ text: l.text, missing: l.missing }] }));
}
