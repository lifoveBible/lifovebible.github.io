// 본문화면 글자색·배경색(앱 설정 fontcolor, bgcolor). DOM을 쓰지 않는다.
// 앱은 색·채도·명도 대화 상자로 고르지만 웹은 브라우저의 색 고르기(<input type="color">)와 빠른 선택 몇 가지.
// 고르지 않았으면(null) 밝은/어두운 테마의 기본 색을 따른다

/** 빠른 선택. 이름은 strings.js의 colorPresets[key] */
export const PRESETS = [
  { key: 'light', fg: '#222222', bg: '#ffffff' },
  { key: 'dark', fg: '#e6e6e6', bg: '#121212' },
  { key: 'sepia', fg: '#5b4636', bg: '#f4ecd8' },
  { key: 'green', fg: '#1f3b1f', bg: '#e2efda' },
];

/** '#rrggbb'만 받는다(소문자로). 저장된 값이 깨졌으면 null(기본 색) */
export function validColor(c) {
  return typeof c === 'string' && /^#[0-9a-f]{6}$/i.test(c) ? c.toLowerCase() : null;
}

/** 지금 색이 빠른 선택 중 어느 것인가(없으면 null). 고른 단추를 표시하려고 */
export function presetOf(fg, bg) {
  const f = validColor(fg), b = validColor(bg);
  return PRESETS.find((p) => p.fg === f && p.bg === b)?.key ?? null;
}
