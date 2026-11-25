// 검색(4단계). 앱 SearchView.java의 규칙을 DOM 없이 옮겼다.
//
// - 검색어 A(필수)와 B(선택). B가 있으면 둘 다 든 절만. 대소문자 무시, 글자 그대로(정규식 아님).
//   앱도 예전에 정규식으로 강조하다가 "?", "(" 를 넣으면 닫힌 적이 있다(TextMatch.java)
// - 찾는 곳은 절 본문만. 줄 앞의 "43Jn 8:1 "은 빼고 본다(약어에 검색어가 걸리지 않게)
// - 범위: 전체, 구약, 신약, 앱의 주제 13개, 책 66권. 순서와 묶음은 앱 스피너와 같다

import { BOOK_COUNT, OT_COUNT } from './books.js';
import { bdfPartOf } from './localBible.js';

const range = (from, to) => Array.from({ length: to - from + 1 }, (_, i) => from + i);

// 앱 bookIndexInTheme(0이 창세기). 앱은 띄엄띄엄인 묶음을 "-48"처럼 음수로 빼 두었는데
// 여기서는 빠진 책을 아예 적지 않았다
export const THEMES = [
  { key: 'moses', books: range(0, 4) }, // 모세오경
  { key: 'hist', books: range(5, 16) }, // 역사서(여호수아-에스더)
  { key: 'poet', books: range(17, 21) }, // 시가서
  { key: 'majProphet', books: range(22, 26) }, // 대선지서
  { key: 'mnrProphet', books: range(27, 38) }, // 소선지서
  { key: 'gospel', books: range(39, 42) }, // 복음서
  { key: 'ntHist', books: [43] }, // 사도행전
  { key: 'paulLetter', books: range(44, 56) }, // 바울서신 전체(로마서-빌레몬서)
  { key: 'genLetter', books: [44, 45, 46, 47, 51, 52] }, // -일반서신(롬,고전/후,갈,살전/후)
  { key: 'prisonLetter', books: [48, 49, 50, 56] }, // -옥중서신(엡,빌,골,몬)
  { key: 'pastorLetter', books: [53, 54, 55] }, // -목회서신(딤전/후,딛)
  { key: 'comLetter', books: range(57, 64) }, // 공동서신(히,약,벧전/후,요한123,유)
  { key: 'rev', books: [65] }, // 예언서(계)
];

/**
 * 범위 값 → 책 목록(0부터). 값은 'all', 'ot', 'nt', 'theme:<key>', 'book:<0~65>'.
 * 모르는 값이면 null
 */
export function booksOfRange(value) {
  if (value === 'all') return range(0, BOOK_COUNT - 1);
  if (value === 'ot') return range(0, OT_COUNT - 1);
  if (value === 'nt') return range(OT_COUNT, BOOK_COUNT - 1);
  const m = /^(theme|book):(.+)$/.exec(value || '');
  if (!m) return null;
  if (m[1] === 'theme') return THEMES.find((t) => t.key === m[2])?.books.slice() ?? null;
  const b = Number(m[2]);
  return Number.isInteger(b) && b >= 0 && b < BOOK_COUNT ? [b] : null;
}

/** 검색어 다듬기: 앞뒤 공백을 빼고 소문자로(앱 doSearch와 같다) */
export function normalizeQuery(a, b) {
  return { a: (a || '').trim().toLowerCase(), b: (b || '').trim().toLowerCase() };
}

/**
 * 검색해도 되는지. 문제 없으면 null, 아니면 'required' | 'tooShort'.
 * 앱 규칙: A는 꼭 있어야 한다. 전체·구약에서 A가 한 글자면 안 된다(결과가 너무 많아서).
 * 다만 B가 있고 A와 다르면 한 글자도 된다. 신약·주제·책 범위에서는 한 글자도 된다
 */
export function checkQuery({ a, b }, rangeValue) {
  if (!a) return 'required';
  if ([...a].length <= 1 && (rangeValue === 'all' || rangeValue === 'ot') && (!b || a === b)) return 'tooShort';
  return null;
}

/**
 * 데이터 한 줄을 { book, chapter, verse, text }로. 본문 줄이 아니면 null.
 * 줄 모양: "<책 두 자리><약어> <장>:<절> <본문>"
 */
export function parseLine(line) {
  const m = /^(\d\d)[^:]*? (\d+):(\d+) (.*)$/.exec(line);
  if (!m) return null;
  return { book: Number(m[1]) - 1, chapter: Number(m[2]), verse: Number(m[3]), text: m[4] };
}

/**
 * 데이터 텍스트 하나(.lfb 한 장 또는 .bdf 한 파일)에서 찾는다.
 * @param {string} text
 * @param {Set<number>} books 범위에 든 책(0부터). .bdf 파일에는 여러 책이 섞여 있어서 거른다
 * @param {{a: string, b: string}} q normalizeQuery 결과
 * @returns {{book, chapter, verse, text}[]}
 */
export function searchText(text, books, q) {
  const out = [];
  // 대부분의 줄은 걸리지 않는다. 먼저 소문자 줄에서 A가 있는지만 보고, 있을 때만 줄을 나눈다
  for (const raw of text.replace(/^﻿/, '').split('\n')) {
    const line = raw.endsWith('\r') ? raw.slice(0, -1) : raw;
    if (!line.toLowerCase().includes(q.a)) continue;
    const v = parseLine(line);
    if (!v || !books.has(v.book)) continue;
    const lower = v.text.toLowerCase();
    if (!lower.includes(q.a)) continue; // 약어·장절에만 걸린 줄
    if (q.b && !lower.includes(q.b)) continue;
    out.push(v);
  }
  return out;
}

/**
 * 역본(LfaFile 또는 BdfSet)에서 범위 안의 텍스트를 차례로 꺼낼 일 목록.
 * .lfa는 장마다 파일이 따로라 장 수만큼, .bdf는 파일 하나에 여러 책이 있어서 파일마다 한 번만 읽는다
 * (책마다 읽으면 같은 파일을 여러 번 훑는다)
 * @returns {{key: string, book: number, read: () => Promise<string|null>}[]}
 *   key는 보관(같은 역본을 다시 검색할 때)용, book은 진행 표시용(그 일의 첫 책)
 */
export function readJobs(source, books) {
  const jobs = [];
  if (source.chapters instanceof Map) {
    // LfaFile: "01_1" → 항목. 장 수가 1189가 아닌 역본이 있어서 있는 장을 다 본다
    const keys = [...source.chapters.keys()].map((k) => k.split('_').map(Number));
    keys.sort((x, y) => x[0] - y[0] || x[1] - y[1]);
    const want = new Set(books.map((b) => b + 1));
    for (const [b1, ch] of keys) {
      if (want.has(b1)) jobs.push({ key: b1 + '_' + ch, book: b1 - 1, read: () => source.chapterText(b1 - 1, ch) });
    }
  } else {
    const seen = new Set();
    for (const b of books) {
      const part = bdfPartOf(b);
      if (seen.has(part)) continue;
      seen.add(part);
      jobs.push({ key: 'part' + part, book: b, read: () => source.chapterText(b) });
    }
  }
  return jobs;
}

/**
 * 강조할 조각. 대소문자 무시로 A와 B가 나오는 곳을 모두 칠한다(겹치면 합친다).
 * @returns {{text: string, hit: boolean}[]}
 */
export function highlightParts(text, words) {
  // 글자마다 소문자로 바꾸며 원래 위치를 기억한다. 'İ'처럼 소문자가 두 글자가 되는 경우가 있어서
  // text.toLowerCase()의 위치를 그대로 쓰면 어긋난다
  let lower = '';
  const at = []; // lower의 각 위치 → text의 위치
  for (let i = 0; i < text.length; i++) {
    const l = text[i].toLowerCase();
    lower += l;
    for (let k = 0; k < l.length; k++) at.push(i);
  }
  at.push(text.length);
  const marks = new Array(text.length).fill(false);
  for (const w of words) {
    if (!w) continue;
    let i = lower.indexOf(w);
    while (i >= 0) {
      for (let p = at[i]; p < at[i + w.length]; p++) marks[p] = true;
      i = lower.indexOf(w, i + w.length);
    }
  }
  const parts = [];
  for (let i = 0; i < text.length; i++) {
    const last = parts[parts.length - 1];
    if (last && last.hit === marks[i]) last.text += text[i];
    else parts.push({ text: text[i], hit: marks[i] });
  }
  return parts;
}

/** 결과 목록을 책 순서로(.bdf는 파일 순서가 책 순서라 이미 맞지만 혹시 몰라) */
export function sortResults(list) {
  return list.sort((x, y) => x.book - y.book || x.chapter - y.chapter || x.verse - y.verse);
}
