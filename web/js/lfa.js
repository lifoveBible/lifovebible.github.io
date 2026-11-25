// .lfa(역본 zip) 다루기. 안에 장마다 "<접두어><책번호 두 자리>_<장>.lfb" 파일이 있다.
//
// 접두어는 역본 코드와 같다고 보면 안 된다. 서버 파일을 훑어보니
//   korhkjv → korHKJV.lfa 안에 korHKJV01_1.lfb, engkjv → ENGKJV01_1.lfb
// 처럼 대소문자가 다르다. 그래서 이름 끝의 "<책>_<장>.lfb"만 보고 찾는다.
// 그 밖의 항목(biblename: 역본 이름 한 줄, LICENSE.txt)은 장 파일이 아니므로 건너뛴다.

import { listZip, readEntry } from './zip.js';
import { bookKeyOf } from './chapterLines.js';

const CHAPTER_ENTRY = /(\d\d)_(\d+)\.lfb$/i;

/**
 * zip 목록에서 장 파일 찾기표를 만든다.
 * @param {{name: string}[]} entries listZip 결과
 * @returns {Map<string, object>} "01_1" → 항목
 */
export function indexChapters(entries) {
  const map = new Map();
  for (const e of entries) {
    const m = CHAPTER_ENTRY.exec(e.name);
    if (m) map.set(m[1] + '_' + Number(m[2]), e);
  }
  return map;
}

/** 열어 둔 .lfa 하나 */
export class LfaFile {
  /** @param {ArrayBuffer} buf */
  constructor(buf) {
    this.buf = buf;
    this.entries = listZip(buf);
    this.chapters = indexChapters(this.entries);
  }

  /** 그 장이 파일에 있는가 */
  has(bookIndex, chapter) {
    return this.chapters.has(bookKeyOf(bookIndex) + '_' + chapter);
  }

  /**
   * 장 파일 내용(UTF-8 텍스트). 없으면 null.
   * 서버 파일은 모두 UTF-8이다(2026-11 훑어봄). 예전 .bdf의 MS949는 수동 넣기 단계에서 다룬다.
   */
  async chapterText(bookIndex, chapter) {
    const e = this.chapters.get(bookKeyOf(bookIndex) + '_' + chapter);
    if (!e) return null;
    return new TextDecoder('utf-8').decode(await readEntry(this.buf, e));
  }
}
