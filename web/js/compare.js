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
  const mine = all.filter((g) => g.lang.split('-')[0].toLowerCase() === uiLang);
  return [...mine, ...all.filter((g) => !mine.includes(g))];
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
