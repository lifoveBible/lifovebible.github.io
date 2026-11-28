// 성경 파일 수동 넣기: 파일 이름 해석, .bdf 읽기, 넣기 전 검사, 서버 목록과 합치기. DOM을 쓰지 않는다.
//
// 넣을 수 있는 것(앱 Util.getBibleCodes, LegacyImporter와 같은 이름 규칙)
// - <코드>.lfa : zip. 서버에서 받는 것과 같다
// - <코드>1.bdf ~ <코드>7.bdf : 예전 형식. 책 범위로 7개로 나뉜 텍스트(bdfPartOf 참고)
// - 앱의 BibleExport가 내보낸 "다운로드/LifoveBible/bible/" 폴더. 그 안 restrict/*.lfa는 저작권 역본
// 파일 이름에 versicle, hymns가 들어간 것은 앱처럼 건너뛴다(성경이 아닌 부가 데이터).
//
// 검사는 앱 DownloadCheck의 역할을 한다. 앱은 크기만 보지만(받다 끊긴 파일 거르기),
// 여기서는 사용자가 아무 파일이나 넣을 수 있으므로 열어서 장 파일과 본문 줄 형식까지 본다.

import { LfaFile } from './lfa.js';
import { readEntry } from './zip.js';
import { readChapter } from './chapterLines.js';
import { parseBibleName, guessBibleLang } from './langGuess.js';
import { officialName } from './versionNames.js';

const LFA_NAME = /^(.+)\.lfa$/i;
const BDF_NAME = /^(.+?)([1-7])\.bdf$/i;
// 본문 한 줄: "01Gen 1:1 ..." (책번호 두 자리, 약어, 장:절, 본문)
const VERSE_LINE = /^\d\d\S* \d+:\d+ /;

/**
 * 파일 하나의 이름(경로 포함 가능)을 해석한다. 성경 파일이 아니면 null.
 * 코드는 소문자로 바꾼다. 앱도 받을 때 소문자로 저장하고(AddBibleData), 서버 목록 코드도 소문자다.
 * @param {string} path "bible/restrict/kornkrv.lfa" 또는 "korhrv1.bdf"
 * @returns {{kind: 'lfa'|'bdf', code: string, part?: number, restricted: boolean} | null}
 */
export function classifyName(path) {
  const parts = path.split(/[\\/]/);
  const name = parts[parts.length - 1];
  if (/versicle|hymns/i.test(name)) return null;
  const restricted = parts.slice(0, -1).some((p) => p.toLowerCase() === 'restrict');
  let m = LFA_NAME.exec(name);
  if (m) return { kind: 'lfa', code: m[1].toLowerCase(), restricted };
  m = BDF_NAME.exec(name);
  if (m) return { kind: 'bdf', code: m[1].toLowerCase(), part: Number(m[2]), restricted };
  return null;
}

/**
 * .bdf 몇 번 파일에 그 책이 있는가. 앱 VerseList의 fileindex와 같다.
 * 1: 창~민(0~3), 2: 신~삼하(4~9), 3: 왕상~에(10~16), 4: 욥~아(17~22),
 * 5: 사~말(23~38), 6: 마~요(39~42), 7: 행~계(43~65)
 */
export function bdfPartOf(bookIndex) {
  if (bookIndex < 4) return 1;
  if (bookIndex < 10) return 2;
  if (bookIndex < 17) return 3;
  if (bookIndex < 23) return 4;
  if (bookIndex < 39) return 5;
  if (bookIndex < 43) return 6;
  return 7;
}

/**
 * .bdf 내용을 문자열로. 앱은 MS949, UTF-8, UTF-16, ISO-8859-7(그리스어) 중에서 고른다.
 * 여기서는 순서를 바꿔 UTF-8을 엄격하게 먼저 시험한다. UTF-8 한글은 MS949로도 "읽히는" 경우가
 * 많아서 MS949를 먼저 보면 깨진 글자가 나온다. 거꾸로 MS949 한글이 올바른 UTF-8일 일은 거의 없다.
 * 브라우저의 'euc-kr' 디코더는 표준상 MS949(windows-949) 전체를 읽는다.
 * @param {Uint8Array} bytes
 * @returns {string}
 */
export function decodeBdf(bytes) {
  if (bytes[0] === 0xff && bytes[1] === 0xfe) return new TextDecoder('utf-16le').decode(bytes);
  if (bytes[0] === 0xfe && bytes[1] === 0xff) return new TextDecoder('utf-16be').decode(bytes);
  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(bytes);
  } catch { /* 다음 인코딩 */ }
  try {
    const text = new TextDecoder('euc-kr', { fatal: true }).decode(bytes);
    if (mostlyHangul(text)) return text;
  } catch { /* 다음 인코딩 */ }
  return new TextDecoder('iso-8859-7').decode(bytes);
}

// 그리스어(ISO-8859-7) 바이트도 MS949로는 대개 오류 없이 읽힌다(한자 섞인 엉뚱한 글자가 된다).
// 그래서 MS949로 읽은 글자 중 한글 음절이 절반을 넘을 때만 MS949로 본다.
function mostlyHangul(text) {
  let other = 0, hangul = 0;
  for (const ch of text) {
    const c = ch.codePointAt(0);
    if (c < 0x80) continue;
    if (c >= 0xac00 && c <= 0xd7a3) hangul++;
    else other++;
  }
  return hangul > other;
}

/** .bdf 7개(일부만 있어도 된다)로 된 역본. LfaFile과 같은 chapterText를 가진다 */
export class BdfSet {
  /** @param {Record<number, string>} texts 파일 번호(1~7) → 내용 */
  constructor(texts) {
    this.texts = texts;
  }

  /** 그 책이 든 파일 전체를 돌려준다. readChapter가 그 안에서 장을 찾는다. 파일이 없으면 null */
  async chapterText(bookIndex) {
    return this.texts[bdfPartOf(bookIndex)] ?? null;
  }
}

/**
 * .lfa 검사. 문제가 없으면 역본 이름(lfa 안 biblename 첫 줄, 없으면 null)과 언어(둘째 줄의 언어 코드, 없으면 null)를 돌려준다.
 * 둘째 줄은 LfaConverter가 넣는다(2026-11-28). 앱은 첫 줄만 이름으로 읽어 둘째 줄이 있어도 깨지지 않는다
 * @param {ArrayBuffer} buf
 * @returns {Promise<{ok: true, name: string|null, lang: string|null} | {ok: false, reason: 'notZip'|'noChapters'|'badText'}>}
 */
export async function checkLfa(buf) {
  let lfa;
  try {
    lfa = new LfaFile(buf);
  } catch {
    return { ok: false, reason: 'notZip' };
  }
  if (!lfa.chapters.size) return { ok: false, reason: 'noChapters' };
  // 창세기 1장이 없는 역본(신약만 있는 것)도 있으므로 처음 나오는 장 파일로 본다
  const [key] = lfa.chapters.keys();
  const [book, chapter] = key.split('_').map(Number);
  try {
    const text = await lfa.chapterText(book - 1, chapter);
    if (!readChapter(text, book - 1, chapter, '').some((r) => !r.missing)) {
      return { ok: false, reason: 'badText' };
    }
  } catch {
    return { ok: false, reason: 'badText' }; // 압축이 깨졌거나 줄 형식이 다르다
  }
  let name = null, lang = null;
  const entry = lfa.entries.find((e) => e.name === 'biblename');
  if (entry) {
    try {
      ({ name, lang } = parseBibleName(new TextDecoder().decode(await readEntry(buf, entry))));
    } catch { /* 이름이 없으면 코드로 보인다 */ }
  }
  return { ok: true, name, lang };
}

/** .bdf 내용 검사: 비어 있지 않은 첫 줄이 본문 줄 형식인가 */
export function checkBdfText(text) {
  const first = text.replace(/^﻿/, '').split(/\r?\n/).find((l) => l.trim());
  return !!first && VERSE_LINE.test(first);
}

/**
 * 고른 파일들을 역본별로 묶는다. 성경 파일이 아닌 것은 skipped(이름만).
 * 같은 역본의 .bdf 조각은 하나로 모은다. .lfa와 .bdf가 둘 다 있으면 .lfa를 쓴다(앱도 .lfa를 우선해 읽는다)
 * @template F
 * @param {{path: string, file: F}[]} files
 * @returns {{groups: {code: string, kind: 'lfa'|'bdf', restricted: boolean, files: {part?: number, path: string, file: F}[]}[], skipped: string[]}}
 */
export function groupFiles(files) {
  const byCode = new Map();
  const skipped = [];
  for (const f of files) {
    const c = classifyName(f.path);
    if (!c) {
      skipped.push(f.path);
      continue;
    }
    let g = byCode.get(c.code);
    if (!g || (g.kind === 'bdf' && c.kind === 'lfa')) {
      g = { code: c.code, kind: c.kind, restricted: c.restricted, files: [] };
      byCode.set(c.code, g);
    } else if (g.kind === 'lfa' && c.kind === 'bdf') {
      continue;
    }
    if (c.kind === 'lfa') g.files = [{ path: f.path, file: f.file }]; // 같은 .lfa가 두 번이면 나중 것
    else g.files = [...g.files.filter((x) => x.part !== c.part), { part: c.part, path: f.path, file: f.file }];
    g.restricted ||= c.restricted;
  }
  return { groups: [...byCode.values()], skipped };
}

/**
 * 서버 역본 목록과 직접 넣은 역본을 합친다.
 * - 코드가 같으면 서버 항목의 언어를 쓰고 넣은 파일로 읽는다(받지 않아도 된다)
 * - 서버에 없는 것은 언어 ''(화면에서 "직접 넣은 역본" 묶음)로 붙인다
 * 이름 차례(2026-11-28 사용자): ✎로 고친 이름 > 서버 목록(biblelist.txt) 이름 > 파일 안 이름(biblename)
 *   > 정식 이름 표(versionNames.js: biblelist와 앱 arrays.xml) > 코드.
 *   표가 biblename보다 뒤인 까닭: 사용자가 만든 lfa의 이름이 더 맞을 수 있어서. 표는 이름 없는 파일(bdf 등)을 채운다
 * 넣은 역본의 url은 'local:<코드>'다. 받은 파일 보관(Cache Storage)과 겹치지 않게 하려고.
 * @param {{code: string, url: string, name: string, lang: string}[]} server
 * @param {{code: string, name: string|null, userName?: string|null}[]} local
 * @param {string} [uiLang] 화면 언어(정식 이름의 한국어판을 고르려고)
 */
export function mergeLocal(server, local, uiLang) {
  const byCode = new Map(local.map((l) => [l.code, l]));
  const out = server.map((v) => {
    const l = byCode.get(v.code);
    return l ? { ...v, name: l.userName || v.name, url: localUrl(v.code), local: true } : v;
  });
  for (const l of local) {
    if (!server.some((v) => v.code === l.code)) {
      const name = l.userName || l.name || officialName(l.code, uiLang) || l.code;
      out.push({ code: l.code, url: localUrl(l.code), name, lang: l.lang || '', local: true }); // 언어를 모르면 '직접 넣은 역본' 묶음
    }
  }
  return out;
}

export function localUrl(code) {
  return 'local:' + code;
}

/**
 * 묶음 하나(groupFiles 결과)를 검사하고 보관할 행으로 만든다. 문제가 있으면 {reason}.
 * 파일은 arrayBuffer()가 있는 것(브라우저 File, Node의 Blob)
 * @returns {Promise<{record: object} | {reason: string}>}
 */
export async function prepareGroup(g) {
  if (g.kind === 'lfa') {
    const buf = await g.files[0].file.arrayBuffer();
    const r = await checkLfa(buf);
    if (!r.ok) return { reason: r.reason };
    return { record: { code: g.code, name: r.name, lang: r.lang, kind: 'lfa', restricted: g.restricted, size: buf.byteLength, data: buf } };
  }
  const data = {};
  let size = 0;
  for (const f of g.files) {
    const bytes = new Uint8Array(await f.file.arrayBuffer());
    const text = decodeBdf(bytes);
    if (!checkBdfText(text)) return { reason: 'badText' };
    data[f.part] = text;
    size += bytes.length;
  }
  return { record: { code: g.code, name: null, lang: null, kind: 'bdf', restricted: g.restricted, size, data } };
}

/** 보관한 행으로 읽기용 객체를 만든다(LfaFile 또는 BdfSet). 둘 다 chapterText(book, chapter)가 있다 */
export function openRecord(record) {
  return record.kind === 'lfa' ? new LfaFile(record.data) : new BdfSet(record.data);
}

// 언어를 볼 장: 창세기 1장, 마태복음 1장, 시편 23편, 요한복음 1장(신약만 있는 역본도 있어서 여럿)
const LANG_SAMPLE = [[0, 1], [39, 1], [18, 23], [42, 1]];

/**
 * 넣은 역본 행의 언어(langGuess 차례: biblename 둘째 줄 → 코드 → 글자 → 낱말). 모르면 null
 */
export async function detectLang(record) {
  let fromName = null;
  if (record.kind === 'lfa') {
    const r = await checkLfa(record.data);
    if (r.ok) fromName = r.lang;
  }
  const src = openRecord(record);
  const texts = [];
  for (const [b, c] of LANG_SAMPLE) {
    try { texts.push(await src.chapterText(b, c)); } catch { /* 없는 장 */ }
  }
  return guessBibleLang({ fromName, code: record.code, texts });
}
