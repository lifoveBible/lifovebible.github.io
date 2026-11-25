// 서버의 biblelist.txt 해석. 앱의 Util.getDownloadableList와 같은 규칙을 따른다.
//
// - 첫 줄은 보여 줄 역본 수. 그 뒤 줄이 더 있어도 그 수만큼만 읽는다
//   (서버 파일 끝에 일부러 숨겨 둔 역본이 있다: 빈 줄 뒤의 korktv, swefolk)
// - 한 줄은 "코드,URL,이름,언어". 이름이 없으면 코드를 이름으로 쓴다
// - 앱은 형식이 깨진 줄(빈 줄 등)에서 예외로 읽기를 멈춘다. 여기서도 거기서 멈춘다
// - 서버 파일은 CRLF 줄바꿈이다

/**
 * @param {string} text biblelist.txt 내용
 * @returns {{code: string, url: string, name: string, lang: string}[]}
 */
export function parseBibleList(text) {
  const lines = text.replace(/^﻿/, '').split(/\r?\n/);
  const count = Number.parseInt(lines[0], 10);
  if (!Number.isFinite(count)) throw new Error('biblelist: first line is not a number');

  const out = [];
  for (let i = 1; i < lines.length && out.length < count; i++) {
    const cols = lines[i].split(',');
    if (cols.length < 2 || !cols[0].trim() || !cols[1].trim()) break;
    const code = cols[0].trim();
    out.push({
      code,
      url: cols[1].trim(),
      name: cols.length >= 3 && cols[2].trim() ? cols[2].trim() : code,
      lang: cols.length >= 4 ? cols[3].trim() : '',
    });
  }
  return out;
}
