// 음성 읽기(TTS)에서 화면과 상관없는 계산. 앱 TtsChapterAudio를 따른다.
//
// 앱과 다른 점: 앱은 장 전체를 음성 파일(wav)로 만들어 재생하지만, 웹은 브라우저의 speechSynthesis로
// 절마다 차례로 읽는다. 파일을 만들 수 없고(브라우저 API가 소리를 파일로 주지 않는다), 절 단위면
// 읽는 절 강조·속도 바꾸기·이어 읽기가 쉽다. 크롬은 긴 글을 한 번에 넘기면 15초쯤에서 끊는 버그가 있어
// 긴 절은 문장 단위로 나눠 넘긴다(splitSpeech).

import { bookNames } from './books.js';

/** 속도 차례(앱: ▶ 단추를 재생 중에 누를 때마다 1.0 → 1.3 → 1.6 → 1.8 → 2.0 → 1.0) */
export const SPEEDS = [1, 1.3, 1.6, 1.8, 2];

export function nextSpeed(rate) {
  const i = SPEEDS.indexOf(rate);
  return SPEEDS[(i + 1) % SPEEDS.length];
}

/** 속도 글(앱 단추 글 "1.0x") */
export const speedLabel = (rate) => (rate || 1).toFixed(1) + 'x';

/** 읽을 글로 다듬는다(앱 clean). 태그, 괄호, 강조 표시를 빼고 공백을 하나로 */
export function cleanForSpeech(text) {
  if (!text) return '';
  return String(text)
    .replace(/<[^>]*>/g, '')
    .replace(/[[\]{}<>*]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// 역본 코드로 언어 추정(앱 localeForVersion). 서버 목록의 언어 칸이 비어 있거나 직접 넣은 역본일 때
const CODE_LANGS = [
  ['ger', 'de'], ['jpn', 'ja'], ['gre', 'el'], ['lat', 'la'], ['heb', 'he'],
  ['rus', 'ru'], ['spn', 'es'], ['fr', 'fr'], ['arabic', 'ar'], ['ity', 'it'],
  ['taga', 'fil'], ['maori', 'mi'], ['thai', 'th'], ['fin', 'fi'], ['dutch', 'nl'],
  ['danish', 'da'], ['idn', 'id'], ['prt', 'pt'], ['turkish', 'tr'],
  ['vietnamese', 'vi'], ['lith', 'lt'],
];

export function langOfCode(code) {
  if (!code) return null;
  const c = code.toLowerCase();
  if (c.startsWith('kor') || c.startsWith('kch')) return 'ko';
  if (c.startsWith('eng') || c === 'hbrtrl') return 'en';
  if (c.startsWith('chu') || c.startsWith('chn') || c.startsWith('ckjv')) {
    return c.includes('simp') || c === 'chnncv' ? 'zh-CN' : 'zh-TW';
  }
  for (const [p, l] of CODE_LANGS) if (c.startsWith(p)) return l;
  return null;
}

/** 본문 글자로 언어 추정(앱 guessLocale). 앞 다섯 절만 본다 */
export function guessLang(texts) {
  let cjk = false;
  for (const t of texts.slice(0, 5)) {
    for (const ch of t) {
      if (/[가-힣ᄀ-ᇿ㄰-㆏]/.test(ch)) return 'ko';
      if (/[぀-ヿ]/.test(ch)) return 'ja';
      if (/[؀-ۿ]/.test(ch)) return 'ar';
      if (/[Ѐ-ӿ]/.test(ch)) return 'ru';
      if (/[Ͱ-Ͽ]/.test(ch)) return 'el';
      if (/[֐-׿]/.test(ch)) return 'he';
      if (/[฀-๿]/.test(ch)) return 'th';
      if (/[一-鿿]/.test(ch)) cjk = true;
    }
  }
  return cjk ? 'zh' : 'en';
}

/** 읽을 언어(앱 resolveLocale): 1) 역본 목록의 언어 칸 2) 역본 코드 3) 본문 글자 */
export function speechLang(listLang, code, texts) {
  return listLang || langOfCode(code) || guessLang(texts);
}

const norm = (tag) => String(tag || '').replace(/_/g, '-').toLowerCase();

/** zh 갈래: 번체(tw)인지 간체(cn)인지. 지역이 없으면 null */
function zhKind(tag) {
  if (/-(tw|hk|mo|hant)\b/.test(tag)) return 'tw';
  if (/-(cn|sg|hans)\b/.test(tag)) return 'cn';
  return null;
}

/**
 * 언어에 맞는 목소리를 고른다. 없으면 null.
 * 지역까지 같으면 먼저(ko-KR, zh-TW), 그다음 같은 언어. 중국어는 번체·간체가 엇갈리지 않게 한다
 * (번체 본문을 간체 목소리로 읽어도 소리는 나지만, 고를 수 있으면 맞는 쪽). 같은 점수면 기기 기본, 그다음
 * 기기 안의 목소리(인터넷 없이 됨)
 */
export function pickVoice(voices, lang) {
  const want = norm(lang);
  const [primary] = want.split('-');
  const alias = (t) => t.replace(/^cmn\b/, 'zh').replace(/^yue\b/, 'zh-hk');
  let best = null, bestScore = 0;
  for (const v of voices || []) {
    const tag = alias(norm(v.lang));
    if (tag.split('-')[0] !== primary) continue;
    let score = 1;
    if (tag === want) score = 4;
    else if (primary === 'zh' && zhKind(want) && zhKind(tag) === zhKind(want)) score = 3;
    else if (primary === 'zh' && zhKind(want) && zhKind(tag) && zhKind(tag) !== zhKind(want)) score = 0.5;
    score += (v.default ? 0.2 : 0) + (v.localService ? 0.1 : 0);
    if (score > bestScore) { best = v; bestScore = score; }
  }
  return best;
}

/**
 * 고른 목소리를 저장할 키(앱 saveVoice는 언어별). 중국어는 번체·간체가 다른 목소리라 나눈다
 */
export function voiceKey(lang) {
  const tag = norm(lang);
  const [primary] = tag.split('-');
  if (primary === 'zh') return zhKind(tag) === 'cn' ? 'zh-cn' : 'zh-tw';
  return primary;
}

/** 이 언어로 쓸 수 있는 목소리(앱 voicesFor: 언어가 같은 것). 기기가 준 차례 그대로 */
export function voicesFor(voices, lang) {
  const [primary] = norm(lang).split('-');
  return (voices || []).filter((v) => norm(v.lang).replace(/^cmn\b/, 'zh').replace(/^yue\b/, 'zh').split('-')[0] === primary);
}

/**
 * 읽을 때 쓸 목소리. 고른 것(voiceURI)이 지금도 있으면 그것, 없으면(지웠거나 다른 기기) pickVoice
 * @param saved prefs.ttsVoices({키: voiceURI})
 */
export function chosenVoice(voices, lang, saved) {
  const uri = saved?.[voiceKey(lang)];
  return (uri && voicesFor(voices, lang).find((v) => v.voiceURI === uri)) || pickVoice(voices, lang);
}

/**
 * 목록에 보일 이름. 기기 이름을 쓰되(앱은 "목소리 1"처럼 번호만: 안드로이드 이름은 알아보기 어려워서),
 * 이름이 비었거나 같은 이름이 여럿이면(안드로이드 크롬은 "한국어 대한민국"이 여럿) 번호를 붙인다.
 * 인터넷이 필요한 목소리는 꼬리표
 */
export function voiceLabels(list, itemName, networkTag) {
  const count = new Map();
  for (const v of list) count.set(v.name, (count.get(v.name) || 0) + 1);
  return list.map((v, i) => {
    let name = v.name ? v.name : itemName(i + 1);
    if (v.name && count.get(v.name) > 1) name += ` (${i + 1})`;
    return v.localService === false ? `${name} · ${networkTag}` : name;
  });
}

/**
 * 장 제목(앱 chapterTitle). 앱처럼 책 이름 목록이 있는 한국어·영어·중국어와 웹에서 더한 프랑스어만. 없으면 null.
 * 앱은 가톨릭 역본(korcath)이면 가톨릭 책 이름을 쓰지만 웹에는 그 목록이 없어 개신교 이름으로 읽는다
 */
export function chapterTitle(lang, book, chapter) {
  const tag = norm(lang);
  const [primary] = tag.split('-');
  if (primary === 'ko') return `${bookNames('ko')[book]} ${chapter}장.`;
  if (primary === 'en') return `${bookNames('en')[book]}, chapter ${chapter}.`;
  // 프랑스어는 앱에 없고 웹에서 더했다(사용자 요청 2026-11-27)
  if (primary === 'fr') return `${bookNames('fr')[book]}, chapitre ${chapter}.`;
  if (primary === 'zh') {
    const names = bookNames(zhKind(tag) === 'cn' ? 'zh-CN' : 'zh');
    return `${names[book]} 第${chapter}章。`;
  }
  return null;
}

/**
 * 긴 글을 max 글자쯤으로 나눈다. 문장 끝(. ! ? 。 등)에서 먼저, 그래도 길면 쉼표·공백에서.
 * 짧은 조각은 앞 조각에 붙여 너무 잘게 끊어 읽지 않게 한다
 */
export function splitSpeech(text, max = 180) {
  if (text.length <= max) return [text];
  const out = [];
  const pieces = text.match(/[^.!?。！？;；]+[.!?。！？;；]*\s*/g) || [text];
  let cur = '';
  const push = (s) => {
    if (cur && (cur + s).length > max) { out.push(cur.trim()); cur = ''; }
    cur += s;
  };
  for (const p of pieces) {
    if (p.length <= max) { push(p); continue; }
    // 한 문장이 너무 길면 쉼표·공백에서
    for (const q of p.match(/[^,，、\s]+[,，、]?\s*/g) || [p]) {
      if (q.length <= max) push(q);
      else for (let i = 0; i < q.length; i += max) push(q.slice(i, i + max)); // 띄어쓰기 없는 긴 글
    }
  }
  if (cur.trim()) out.push(cur.trim());
  return out;
}

/**
 * 읽을 차례. rows는 화면의 줄({verse, cells:[{text, missing}]}), 첫 역본(cells[0])만 읽는다
 * (앱도 대조 보기에서 주 역본만 읽는다). 빠진 절은 건너뛴다. 장 제목은 verse 0
 * @returns {{verse: number, text: string}[]}
 */
export function speechItems(rows, title) {
  const out = [];
  if (title) out.push({ verse: 0, text: title });
  for (const r of rows) {
    const c = r.cells?.[0];
    if (!c || c.missing) continue;
    const t = cleanForSpeech(c.text);
    if (!t) continue;
    for (const part of splitSpeech(t)) out.push({ verse: r.verse, text: part });
  }
  return out;
}
