// 성경 데이터(.lfa 안의 .lfb, .bdf)에서 한 장의 절들을 읽는다.
// 앱의 ChapterLines.java를 옮긴 것이다. 테스트도 ChapterLinesTest를 옮겼다.
//
// 데이터 한 줄은 "책번호+약어 장:절 본문" 모양이다. 예: "43Jn 8:1 ..."
// 책번호는 두 자리(01~66)이고, 줄이 그 두 자리로 시작하는지로 책을 찾는다.
//
// 데이터에 없는 절은 missingText로 채워서 결과의 줄 번호가 절 번호와 맞게 한다
// (앱에서 역본 대조 보기·책갈피가 이것에 기댄다).
//
// 앱과 다른 점: 문자열 목록 대신 {verse, text, missing} 객체를 돌려준다. 역본 표시(prefix)는
// 화면 쪽에서 붙인다.

/**
 * @param {string} text 데이터 파일 전체 내용
 * @param {number} bookIndex 0부터 (창세기 0, 요한계시록 65)
 * @param {number} chapter 1부터
 * @param {string} missingText 빠진 절에 넣을 문구
 * @returns {{verse: number, text: string, missing: boolean}[]}
 *
 * 형식이 깨진 줄(절 번호 뒤에 공백이 없거나 숫자가 아님)에서는 예외를 던진다.
 * 앱처럼 부르는 쪽이 받아서 오류를 알린다. 예외 전까지 읽은 줄은 err.partial에 담는다.
 */
export function readChapter(text, bookIndex, chapter, missingText) {
  const bookKey = bookKeyOf(bookIndex);
  const chapterKey = ' ' + chapter + ':';
  const out = [];

  // 몇몇 파일은 BOM(jpnjct, kornkrv)이나 CRLF(jpnnew)가 섞여 있다
  const lines = text.replace(/^﻿/, '').split(/\r?\n/);

  let inChapter = false;
  let verseIndex = 0; // 지금까지 out에 넣은 절 수
  for (const line of lines) {
    const colon = line.indexOf(':');
    if (line.startsWith(bookKey)
        && line.includes(chapterKey)
        && line.indexOf(chapterKey) < colon + 1) {
      inChapter = true;

      const rest = line.substring(colon + 1); // "절번호 본문"
      const space = rest.indexOf(' ');
      const verse = space < 0 ? NaN : Number(rest.substring(0, space));
      if (space <= 0 || !Number.isInteger(verse)) {
        const err = new Error('bad verse line: ' + line.slice(0, 40));
        err.partial = out;
        throw err;
      }

      // 빠진 절 채우기. 여러 절이 연달아 빠질 수 있다.
      // (앱 7.6.0까지는 if라서 한 절만 채우고, 그 뒤 줄이 절 번호와 어긋났다)
      // 번호가 거꾸로 가거나 같은 절이 또 나오면 채우지 않고 그대로 넣는다.
      while (verse > verseIndex + 1) {
        verseIndex++;
        out.push({ verse: verseIndex, text: missingText, missing: true });
      }

      out.push({ verse, text: rest.substring(space + 1), missing: false });
      verseIndex++;
    } else if (inChapter) {
      break; // 다음 장으로 넘어갔다
    }
  }
  return out;
}

/** 데이터 파일의 책 번호: 0 → "01", 9 → "10" */
export function bookKeyOf(bookIndex) {
  return String(bookIndex + 1).padStart(2, '0');
}
