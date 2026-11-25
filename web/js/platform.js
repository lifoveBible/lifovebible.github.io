// 도움말의 "설치하는 법"에서 지금 기기에 맞는 항목을 펼쳐 두려고 기기 종류를 어림한다.
// 틀려도 다른 항목을 눌러 열면 되므로 대강만 가른다.

/**
 * @param {string} ua navigator.userAgent
 * @param {number} maxTouchPoints navigator.maxTouchPoints
 * @returns {'ios'|'android'|'desktop'}
 */
export function detectPlatform(ua = '', maxTouchPoints = 0) {
  if (/iPhone|iPod|iPad/.test(ua)) return 'ios';
  // 아이패드 사파리(iPadOS 13+)는 기본으로 맥처럼 "Macintosh"라고 알린다. 맥에는 터치가 없으므로 터치로 가른다
  if (/Macintosh/.test(ua) && maxTouchPoints > 1) return 'ios';
  if (/Android/.test(ua)) return 'android';
  return 'desktop';
}

/** 설치한 앱(홈 화면, 앱 창)으로 열었는지. 아이폰 옛 사파리는 navigator.standalone만 있다 */
export function isStandalone(win) {
  return !!(win.matchMedia?.('(display-mode: standalone)').matches || win.navigator?.standalone);
}
