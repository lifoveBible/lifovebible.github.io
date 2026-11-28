// 역본 대조 보기: 여러 역본의 한 장을 절 번호로 맞춰 줄을 만든다. DOM을 쓰지 않는다.
// 앱의 VerseList.readVerses(MatchedVerses를 만드는 부분)에 해당한다.
//
// 앱 규칙
// - 절 수는 역본마다 다를 수 있으므로 가장 긴 역본에 맞춘다
// - 어떤 역본에 그 절이 없으면 "(없음)"으로 채운다(text_not_exist_verses)
// 웹에서 더한 것
// - 그 장 자체가 없는 역본(enggnt 등 장 수가 1189가 아닌 역본)이나 받지 못한 역본은 null로 받아
//   절마다 "(없음)"으로 채운다. 모든 역본이 null이면 빈 배열(화면에서 "이 장이 없습니다")

/**
 * @param {({verse: number, text: string, missing: boolean}[] | null)[]} chapters 역본 순서대로 readChapter 결과
 * @param {string} missingText 빠진 절 문구
 * @returns {{verse: number, cells: {text: string, missing: boolean}[]}[]}
 */
export function alignChapters(chapters, missingText) {
  let max = 0;
  for (const rows of chapters) if (rows && rows.length > max) max = rows.length;
  const out = [];
  for (let i = 0; i < max; i++) {
    out.push({
      verse: i + 1, // readChapter가 빠진 절을 채워 두었으므로 i번째 줄이 i+1절이다
      cells: chapters.map((rows) => {
        const r = rows?.[i];
        return r ? { text: r.text, missing: r.missing } : { text: missingText, missing: true };
      }),
    });
  }
  return out;
}

/**
 * 역본 고르기 창에서 체크를 바꿀 때 순서를 지킨다. 먼저 고른 것이 앞(첫째가 주 역본)이고,
 * 새로 고른 것은 뒤에 붙는다. 앱은 설정의 역본 순서를 따르지만 웹에는 순서 설정이 아직 없어서
 * 고른 순서를 쓴다.
 * @param {string[]} codes 지금 고른 코드들(순서대로)
 * @param {string} code
 * @param {boolean} checked
 * @returns {string[]}
 */
export function toggleCode(codes, code, checked) {
  const rest = codes.filter((c) => c !== code);
  return checked ? [...rest, code] : rest;
}

/**
 * 역본 목록을 언어로 묶는다. 화면 언어(uiLang)와 같은 언어 묶음을 맨 앞에 두고,
 * 나머지는 서버 목록에서 처음 나온 순서를 지킨다(서버 목록 순서가 곧 앱의 보이는 순서).
 * 언어 코드는 앞부분만 본다(zh-TW와 zh-CN은 다른 묶음, pt-BR은 pt 묶음이 아니라 그대로).
 * @param {{code: string, lang: string}[]} list
 * @param {string} uiLang 'ko' | 'en' ...
 * @returns {{lang: string, items: object[]}[]}
 */
export function groupByLang(list, uiLang) {
  const groups = new Map();
  for (const v of list) {
    const key = v.lang || '';
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(v);
  }
  const all = [...groups].map(([lang, items]) => ({ lang, items }));
  // 화면 언어와 딱 맞는 묶음 → 같은 언어의 다른 지역 → 나머지. 중국어는 화면이 번체(zh)면 zh-TW 등이,
  // 간체(zh-CN)면 zh-CN이 먼저(예전에는 앞부분만 비교해 zh-CN 화면에서 중국어 묶음이 앞에 오지 않았다)
  const ui = uiLang.toLowerCase();
  const uiBase = ui.split('-')[0];
  const rank = (g) => {
    const l = g.lang.toLowerCase();
    if (l === ui || (ui === 'zh' && /^zh-(tw|hk|mo|hant)\b/.test(l))) return 0;
    return l.split('-')[0] === uiBase ? 1 : 2;
  };
  return all.map((g, i) => [rank(g), i, g]).sort((a, b) => a[0] - b[0] || a[1] - b[1]).map((x) => x[2]);
}

/** 위쪽 막대에 보일 역본 이름. 하나면 그 이름, 둘이면 "가 + 나", 셋 이상이면 "가 + 2" */
export function versionsLabel(names) {
  if (names.length <= 1) return names[0] || '';
  if (names.length === 2) return names[0] + ' + ' + names[1];
  return names[0] + ' + ' + (names.length - 1);
}

// ---- 고를 수 있는 역본 ----
// 앱처럼 본문 화면(역본대조보기)에서는 받아 둔 역본과 직접 넣은 역본만 고른다. 받기는 메뉴의 성경다운로드에서.
// (3단계에는 서버 목록 전체를 보이고 고르면 받았다. 앱과 다르고 목록이 길어서 바꿨다)

/** 보관 키(Cache Storage의 req.url)는 브라우저가 고친 꼴이라(공백 → %20 등) 같은 꼴로 바꿔 비교한다 */
function href(url) {
  try { return new URL(url).href; } catch { return url; }
}

/** 받아 둔 역본인가. cached는 cachedUrls() 결과 */
export function isCached(v, cached) {
  return !v.local && (cached.has(v.url) || cached.has(href(v.url)));
}

/**
 * 역본대조보기 창에 보일 역본. 직접 넣은 것, 받아 둔 것, 지금 고른 것(보관본을 브라우저가 지웠어도
 * 읽으면 다시 받으므로 고를 수 있어야 한다).
 * 보관을 못 하는 주소(Cache Storage가 없는 http://192.168.x.x 등)에서는 받은 것을 알 수 없으므로 전체
 * @param {{code: string, url: string, local?: boolean}[]} list 서버+직접 넣은 역본(mergeLocal 결과)
 * @param {Set<string>} cached
 * @param {string[]} selected 지금 고른 코드들
 * @param {boolean} canCache
 */
export function pickableVersions(list, cached, selected, canCache) {
  if (!canCache) return list;
  return list.filter((v) => v.local || isCached(v, cached) || selected.includes(v.code));
}

/**
 * 고른 역본이 없을 때 대신 쓸 역본. 고를 수 있는 것 중 기본 역본, 없으면 그 첫째.
 * 고를 수 있는 것이 없으면 처음 쓰는 사람에게만 기본 역본을 받아 준다(열자마자 읽을 수 있게).
 * 받은 것을 다 지운 사람에게는 다시 받지 않는다(빈 배열 → 화면에서 성경다운로드 안내)
 * @returns {object[]} 0개 또는 1개
 */
export function fallbackVersions(list, cached, canCache, defaultCode, firstRun) {
  const pool = pickableVersions(list, cached, [], canCache);
  if (pool.length && canCache) return [pool.find((v) => v.code === defaultCode) || pool[0]];
  if (!firstRun && canCache) return [];
  // 처음이거나 보관을 못 하는 주소(그때는 pool이 전체 목록)
  return list.length ? [list.find((v) => v.code === defaultCode) || list[0]] : [];
}

// ---- 역본 순서·색(ver_setting, 앱과 동기화) ----
// 앱 Util.getOrderedVerCodeAndTextColor와 같게: ver_setting의 살아 있는 행을 ver_order 순으로, 없는 역본은 그 뒤.
// 웹에는 순서를 바꾸는 화면이 아직 없고, 동기화로 받은 앱의 순서·색을 쓴다

/**
 * ver_setting 행들 → 코드 → { index(0부터 차례), color(CSS 색 또는 null) }. 지운 행은 뺀다.
 * ver_order가 같으면 코드 순(앱 DB 정렬은 ver_order만이라 같을 때 순서가 정해지지 않음. syncVerOrder와 같게)
 * @returns {Map<string, {index: number, color: (string|null)}>}
 */
export function verOrderMap(rows) {
  const alive = (rows || []).filter((r) => r && typeof r.ver === 'string' && !Number(r.deleted))
    .sort((a, b) => (Number(a.ver_order) || 0) - (Number(b.ver_order) || 0) || (a.ver < b.ver ? -1 : a.ver > b.ver ? 1 : 0));
  const out = new Map();
  for (const r of alive) if (!out.has(r.ver)) out.set(r.ver, { index: out.size, color: verColor(r.text_color) });
  return out;
}

/**
 * 역본 목록을 순서대로: 순서가 있는 역본은 그 차례로 앞에, 없는 역본은 원래 순서를 지켜 뒤에(앱과 같다)
 * @param list 역본들({code}) 또는 코드들
 */
export function orderVersions(list, order) {
  const codeOf = (v) => (typeof v === 'string' ? v : v.code);
  return (list || []).map((v, i) => [order?.get(codeOf(v))?.index ?? Infinity, i, v])
    .sort((a, b) => a[0] - b[0] || a[1] - b[1]).map((x) => x[2]);
}

/**
 * 앱 text_color(안드로이드 색 정수, ARGB) → CSS 색. 0이나 없으면 '지정 안 함'(null)
 */
export function verColor(textColor) {
  const n = Number(textColor);
  if (!Number.isInteger(n) || n === 0) return null;
  return '#' + ((n >>> 0) & 0xffffff).toString(16).padStart(6, '0');
}

// ---- 읽히는 글자색(sync-format 4a, 앱 ReadableColor와 같게) ----
// 밝은 배경 기기에서 고른 색이 동기화로 어두운 배경 기기에 오면 안 보이므로, 대비가 3:1 미만이면 기본 글자색으로 보인다.
// 고른 색(ver_setting)은 바꾸지 않고 보일 때만 바꾼다

/** '#rrggbb' → WCAG 2 상대 휘도. 모르는 꼴이면 NaN */
function luminance(hex) {
  const m = /^#([0-9a-f]{6})$/i.exec(hex || '');
  if (!m) return NaN;
  const n = parseInt(m[1], 16);
  const ch = (v) => { const c = v / 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
  return 0.2126 * ch((n >> 16) & 255) + 0.7152 * ch((n >> 8) & 255) + 0.0722 * ch(n & 255);
}

/** 두 색('#rrggbb')의 명암 대비(1~21). 하나라도 모르면 NaN */
export function contrastRatio(a, b) {
  const la = luminance(a), lb = luminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

/**
 * 역본 글자색을 지금 배경에서 쓸지: 대비 3:1 이상이면 그 색, 미만이면 null(기본 글자색).
 * 배경을 모르면(읽지 못함) 고른 색 그대로
 */
export function readableColor(color, bg) {
  if (!color) return null;
  const r = contrastRatio(color, bg);
  return Number.isNaN(r) || r >= 3 ? color : null;
}
