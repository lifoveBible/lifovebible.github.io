// 서비스 워커 등록과 "새 버전이 있습니다" 알림.
// 새 버전은 sw.js가 뒤에서 받아 두고 기다린다(waiting). 사용자가 누르면 그때 바꾸고 새로 고친다.

/**
 * @param {() => void} onUpdate 새 버전이 기다리고 있을 때 불린다. 화면은 알림을 보이고,
 *   사용자가 누르면 돌려받은 applyUpdate()를 부른다
 * @returns {{applyUpdate: () => void}}
 */
export function registerServiceWorker(onUpdate) {
  let reg = null;
  let reloading = false;
  const api = {
    applyUpdate() {
      if (!reg?.waiting) { location.reload(); return; }
      reloading = true;
      reg.waiting.postMessage('skipWaiting');
    },
  };
  // https나 localhost에서만 된다. http://192.168.x.x 같은 주소에서는 없이 돈다
  if (!('serviceWorker' in navigator)) return api;

  // 새 서비스 워커가 맡으면 새 파일로 다시 연다. 처음 설치할 때도(clients.claim) 이 사건이 오므로
  // 사용자가 누른 경우에만 새로 고친다
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (reloading) location.reload();
  });

  navigator.serviceWorker.register('sw.js').then((r) => {
    reg = r;
    // 이미 맡은 서비스 워커가 있을 때 새것이 설치되면 새 버전이다(처음 설치는 알리지 않는다)
    const check = () => { if (reg.waiting && navigator.serviceWorker.controller) onUpdate(); };
    check();
    reg.addEventListener('updatefound', () => {
      const sw = reg.installing;
      sw?.addEventListener('statechange', () => { if (sw.state === 'installed') check(); });
    });
    // 홈 화면 앱은 며칠씩 켜 둘 수 있어서, 다시 볼 때마다 새 버전이 있는지 묻는다
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') reg.update().catch(() => {});
    });
  }).catch((e) => console.warn('service worker register failed', e));
  return api;
}
