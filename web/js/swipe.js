// 본문을 옆으로 밀어 장 넘기기. 앱 VerseList의 손가락 뗄 때 판정(ACTION_UP)과 같은 규칙. DOM을 쓰지 않는다.
// - 앱: 가로로 horizontalDragOffset(30) 넘게, 기울기 |세로/가로| < slopeOffset(0.35)이면 넘긴다.
//   왼쪽으로 밀면 다음 장, 오른쪽으로 밀면 이전 장. 설정 swipe_chapter_preference(기본 켬)
// - 앱의 30은 기기 픽셀이라 실제로는 아주 짧다. 웹은 CSS 픽셀이라 50으로 비슷한 느낌을 맞췄다
// - 화면 가장자리에서 시작한 밀기는 무시한다. iOS 사파리(뒤로/앞으로 가기)와 안드로이드(시스템 뒤로 가기)의
//   가장자리 제스처와 겹치지 않게

export const SWIPE_MIN_DX = 50; // 가로로 이만큼(CSS px) 넘게 움직여야 한다
export const SWIPE_MAX_SLOPE = 0.35; // 앱 slopeOffset
export const SWIPE_EDGE = 24; // 화면 왼쪽·오른쪽 끝에서 이 안쪽으로 시작하면 무시

/**
 * 손가락을 뗐을 때 장을 넘길지 정한다.
 * @param {{x:number,y:number}} start 댄 곳
 * @param {{x:number,y:number}} end 뗀 곳
 * @param {number} width 화면 폭(CSS px)
 * @returns {'next'|'prev'|null}
 */
export function swipeDirection(start, end, width) {
  if (start.x < SWIPE_EDGE || start.x > width - SWIPE_EDGE) return null;
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  if (Math.abs(dx) < SWIPE_MIN_DX) return null;
  if (Math.abs(dy / dx) >= SWIPE_MAX_SLOPE) return null;
  return dx < 0 ? 'next' : 'prev';
}
