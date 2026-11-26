// 형광펜 모양(DOM 없음). 앱 HighlightStyle과 같은 값: 배경 칠하기·밑줄·글자색·굵게, 여러 개 고를 수 있고
// 하나도 고르지 않으면 표시가 사라지므로 막는다. 기본은 배경만.
// 웹은 prefs.hlStyle(배열)에 둔다. 앱 설정은 앱 백업 DB에 들어 있지 않아 앱과 주고받지 않는다

export const STYLES = ['bg', 'underline', 'color', 'bold']; // 앱 BACKGROUND, UNDERLINE, TEXT_COLOR, BOLD. 설정 창 차례
export const DEFAULT_STYLE = ['bg'];

/** 저장된 값을 정리: 모르는 값·겹침을 빼고 STYLES 차례로. 비었거나 깨졌으면 기본값(앱 orDefault) */
export function normalizeStyle(list) {
  if (!Array.isArray(list)) return [...DEFAULT_STYLE];
  const s = STYLES.filter((k) => list.includes(k));
  return s.length ? s : [...DEFAULT_STYLE];
}

/**
 * 한 가지를 켜거나 끈다. 마지막 하나를 끄려 하면 그대로 두고 refused(앱 text_highlight_style_need_one)
 * @returns {{style: string[], refused: boolean}}
 */
export function toggleStyle(list, key, on) {
  const now = normalizeStyle(list);
  if (!STYLES.includes(key)) return { style: now, refused: false };
  const next = on ? normalizeStyle([...now, key]) : now.filter((k) => k !== key);
  if (!next.length) return { style: now, refused: true };
  return { style: next, refused: false };
}

/** 문서 뿌리에 붙일 클래스(CSS가 모양마다 따로 입힌다) */
export function styleClasses(list) {
  const s = normalizeStyle(list);
  return STYLES.map((k) => [`hl-${k}`, s.includes(k)]);
}

/**
 * getComputedStyle이 돌려주는 색을 <input type="color">가 받는 #rrggbb로. color-mix 결과는
 * 크롬에서 "color(srgb 0.9 0.8 0.1)", 다른 곳에서는 "rgb(230, 204, 26)"으로 온다. 모르면 null
 */
export function cssColorToHex(v) {
  if (typeof v !== 'string') return null;
  const s = v.trim();
  let rgb = null;
  let m = s.match(/^#([0-9a-f]{6})$/i);
  if (m) return '#' + m[1].toLowerCase();
  m = s.match(/^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)/i);
  if (m) rgb = [m[1], m[2], m[3]].map(Number);
  m = s.match(/^color\(srgb\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)/i);
  if (m) rgb = [m[1], m[2], m[3]].map((x) => Number(x) * 255);
  if (!rgb || rgb.some((x) => !Number.isFinite(x))) return null;
  return '#' + rgb.map((x) => Math.round(Math.min(255, Math.max(0, x))).toString(16).padStart(2, '0')).join('');
}
