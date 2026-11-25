// 본문 위에 떠 있는 이동 버튼(네비게이션 바). 앱 VerseList의 navigationbar_layout에 해당. DOM을 쓰지 않는다.
// - 장 이동(‹ ›), 화면 이동(˄ ˅), 최근목록 이동(↶ ↷) 세 쌍. 어느 것을 보일지는 앱 설정
//   "이동 버튼 표시"(navigation_bar_preference_new)와 같은 값 1~8. 앱 기본은 7(장 + 최근목록)
// - 최근목록: 앱 Util.historyLines처럼 위치 목록(0이 가장 최근, 최대 20개)과 지금 칸(index)

/** 앱 entryvalues_navigation_bar 순서(화면에 보이는 순서). 문구는 strings.js navBarOptions[값] */
export const NAV_OPTIONS = [1, 2, 3, 5, 4, 6, 7, 8];
export const NAV_DEFAULT = 7;

/** 옵션 값 → 보일 버튼 쌍. 모르는 값이면 기본값으로 */
export function navButtons(option) {
  const v = NAV_OPTIONS.includes(option) ? option : NAV_DEFAULT;
  return {
    screen: [2, 4, 6, 8].includes(v), // 한 화면 이동
    chapter: [3, 4, 7, 8].includes(v), // 장 이동
    history: [5, 6, 7, 8].includes(v), // 최근목록 이동
  };
}

/** 이동 버튼 위치(웹에만 있는 설정). 앱은 오른쪽 가운데 고정이지만, PC에서는 손이 아니라 마우스라
 *  오른쪽 아래가 덜 가린다. 화면에 보이는 순서. 문구는 strings.js navPositions[값] */
export const NAV_POSITIONS = ['right-middle', 'right-bottom', 'left-middle', 'left-bottom'];
export const NAV_POSITION_DEFAULT = 'right-bottom';

/** 저장된 위치 값을 검사한다. 모르는 값이면 기본값 */
export const navPosition = (v) => (NAV_POSITIONS.includes(v) ? v : NAV_POSITION_DEFAULT);

/** 위·아래 버튼의 이동 단위. 앱은 "볼륨키로 이동" 설정(한 절, 한 화면, 한 장)을 따른다. 웹에는 볼륨키가 없어 따로 둔다 */
export const NAV_UNITS = ['verse', 'page', 'chapter'];
export const NAV_UNIT_DEFAULT = 'page';

// ---- 최근목록 ----
export const HISTORY_MAX = 20; // 앱 Util.HISTORY_MAX_SIZE

const same = (a, b) => a && b && a.book === b.book && a.chapter === b.chapter;
const clean = (p) => ({ book: p.book, chapter: p.chapter, verse: p.verse || 1 });

/** 저장해 둔 값을 검사한다. 깨졌으면 빈 기록 */
export function loadHistory(raw, isValid) {
  const list = Array.isArray(raw?.list) ? raw.list.filter((p) => p && isValid(p)).map(clean).slice(0, HISTORY_MAX) : [];
  const index = Number.isInteger(raw?.index) && raw.index >= 0 && raw.index < list.length ? raw.index : 0;
  return { list, index };
}

/**
 * 책·장 고르기나 검색 결과로 다른 곳에 갔을 때. 앱처럼
 * - 지금 칸에는 떠나는 곳(읽던 절)을 남기고
 * - 기록 가운데(뒤로 간 상태)에서 갔으면 그보다 최근 것은 지우고
 * - 새 곳을 맨 앞에 넣는다(같은 장이면 넣지 않는다). 최대 20개
 * @param {{list: object[], index: number}} h
 * @param {{book, chapter, verse}} from 떠나는 곳
 * @param {{book, chapter, verse}} to 가는 곳
 */
export function jumpHistory(h, from, to) {
  let list = h.list.slice();
  if (list.length) list[h.index] = clean(from);
  else list = [clean(from)];
  list = list.slice(h.list.length ? h.index : 0);
  if (!same(list[0], to)) list.unshift(clean(to));
  return { list: list.slice(0, HISTORY_MAX), index: 0 };
}

/** 이전 장·다음 장, 브라우저 뒤로 가기처럼 기록 없이 움직였을 때. 지금 칸을 지금 위치로 고친다(앱도 지금 칸을 덮어쓴다) */
export function updateHistory(h, here) {
  if (!h.list.length) return { list: [clean(here)], index: 0 };
  const list = h.list.slice();
  list[h.index] = clean(here);
  return { list, index: h.index };
}

export const canBack = (h) => h.index < h.list.length - 1;
export const canForward = (h) => h.index > 0;

/**
 * 최근목록에서 한 칸 뒤(dir 1, 더 오래된 곳) 또는 앞(dir -1). 지금 칸에는 지금 위치(읽던 절)를 남긴다
 * @returns {{h: object, to: object} | null} 갈 곳이 없으면 null
 */
export function stepHistory(h, here, dir) {
  const index = h.index + dir;
  if (index < 0 || index >= h.list.length) return null;
  const list = h.list.slice();
  list[h.index] = clean(here);
  return { h: { list, index }, to: list[index] };
}
