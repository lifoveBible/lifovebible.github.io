// 서버 목록(biblelist)에 없는 역본(직접 넣은 역본, 드라이브에서 받은 역본)의 언어 정하기(2026-11-28 JC 결정).
// 차례: ① lfa biblename 둘째 줄(LfaConverter가 넣는 언어 코드) ② 역본 코드 앞부분(tts.langOfCode, 앱과 같은 표)
// ③ 글자 종류(한글·가나·키릴…) ④ 로마자면 자주 나오는 낱말. 모르면 null(화면에서는 '직접 넣은 역본' 묶음, 음성은 예전 추정).
// 앱과 웹 모두 biblename은 첫 줄만 이름으로 읽으므로 둘째 줄을 넣어도 옛 앱이 깨지지 않는다.
// 정한 언어는 역본 고르기 묶음, 음성 읽기 목소리, 본문 lang, 드라이브 appProperties lang(sync-format 6b)에 쓴다

import { langOfCode } from './tts.js';

/** biblelist.txt 넷째 칸과 같은 꼴의 언어 코드(BCP 47: ko, zh-TW, pt-BR, ms …) */
export const LANG_RE = /^[a-z]{2,3}(-[A-Za-z0-9]{2,8})*$/;

/** biblename 내용 → { name, lang }. 둘째 줄이 언어 코드 꼴이 아니면 lang은 null */
export function parseBibleName(text) {
  const lines = String(text || '').replace(/^﻿/, '').split(/\r?\n/).map((l) => l.trim());
  const lang = lines[1] && LANG_RE.test(lines[1]) ? lines[1] : null;
  return { name: lines[0] || null, lang };
}

// ---- ③ 글자 종류 ----
const SCRIPTS = [
  [/[가-힣ᄀ-ᇿ㄰-㆏]/, 'ko'], [/[぀-ヿ]/, 'ja'], [/[؀-ۿ]/, 'ar'], [/[Ѐ-ӿ]/, 'ru'], [/[Ͱ-Ͽ]/, 'el'],
  [/[֐-׿]/, 'he'], [/[฀-๿]/, 'th'], [/[ऀ-ॿ]/, 'hi'], [/[ಀ-೿]/, 'kn'], [/[஀-௿]/, 'ta'], [/[က-႟]/, 'my'],
  [/[ሀ-፿]/, 'am'], [/[Ⴀ-ჿ]/, 'ka'], [/[԰-֏]/, 'hy'],
];
// 번체와 간체에서 모양이 다른 흔한 글자(성경 본문에 자주 나옴)
const TRAD = '們說這為與來對國們個時們會從後裡麼見聽讓門長東車馬鳥魚書無開關愛';
const SIMP = '们说这为与来对国们个时们会从后里么见听让门长东车马鸟鱼书无开关爱';

/** 그 언어만 쓰는 글자가 있으면 그 언어. 한자만 있으면 번체·간체를 세어 zh-TW / zh-CN. 로마자뿐이면 null */
export function scriptLang(text) {
  let han = 0, trad = 0, simp = 0;
  for (const ch of text) {
    for (const [re, lang] of SCRIPTS) if (re.test(ch)) return lang;
    if (/[一-鿿]/.test(ch)) {
      han++;
      if (TRAD.includes(ch)) trad++;
      else if (SIMP.includes(ch)) simp++;
    }
  }
  if (han < 10) return null;
  return simp > trad ? 'zh-CN' : 'zh-TW';
}

// ---- ④ 로마자 언어: 성경 본문에 자주 나오는 낱말 ----
// 다른 언어와 겹치는 낱말(de, a, e …)도 있지만 묶음 전체의 비율로 견주면 가려진다
const WORDS = {
  en: 'the and of to that in he shall unto for his lord they be is not with them which was',
  es: 'y el los las que del por su al se no les como para con dios señor',
  pt: 'e o os as que do da dos não em para com seu sua ele deus senhor',
  fr: 'et le la les des du que il qui ne pas est sur dans dieu seigneur',
  de: 'und der die das sie er nicht ich zu den ein mit von ist gott herr',
  it: 'e il che la non per gli si del le dio signore egli della',
  nl: 'en de het van een zij hij niet dat die te met zijn god heere',
  sv: 'och att han det som de är en på för till med icke gud herren',
  fi: 'ja hän että se on ei niin kuin oli he jumala herra',
  la: 'et in non est ad qui cum ut eius quod dominus deus autem',
  fil: 'ang at ng sa mga si na kay ay ako siya diyos panginoon',
  vi: 'và của là không người đức chúa các ta những trong',
  tr: 've bir bu için da de ne o tanrı rab',
  ms: 'dan yang itu ini dengan akan kepada tidak ia mereka tuhan allah',
};
const SETS = Object.fromEntries(Object.entries(WORDS).map(([l, w]) => [l, new Set(w.split(' '))]));

/** 로마자 본문의 언어. 확실하지 않으면 null. 말레이어·인도네시아어는 kerana / karena 같은 낱말로 가른다 */
export function wordLang(text) {
  const words = text.toLowerCase().match(/[\p{L}']+/gu) || [];
  if (words.length < 30) return null;
  const score = {};
  for (const [lang, set] of Object.entries(SETS)) score[lang] = words.filter((w) => set.has(w)).length / words.length;
  const [[best, top], [, second]] = Object.entries(score).sort((a, b) => b[1] - a[1]);
  if (top < 0.12 || top < second * 1.3) return null; // 어느 쪽도 뚜렷하지 않다
  if (best !== 'ms') return best;
  const count = (list) => words.filter((w) => list.includes(w)).length;
  const id = count(['karena', 'bahwa', 'sekarang', 'kalian', 'dapat']);
  const ms = count(['kerana', 'bahawa', 'sekarang', 'iaitu', 'baginda', 'sahaja', 'daripada']);
  return id > ms ? 'id' : 'ms';
}

/**
 * 역본 하나의 언어. ① biblename 둘째 줄(fromName) ② 코드 ③ 글자 ④ 낱말. 모르면 null
 * @param texts 본문 몇 장의 글(절 머리 "43Jn 8:1 "는 떼어도 안 떼어도 된다)
 */
export function guessBibleLang({ fromName = null, code = '', texts = [] }) {
  if (fromName && LANG_RE.test(fromName)) return fromName;
  const byCode = langOfCode(code);
  if (byCode) return byCode;
  const text = texts.join('\n').replace(/^\d{2}\S*\s+\d+:\d+\s*/gm, '').slice(0, 20000);
  return scriptLang(text) || wordLang(text);
}
