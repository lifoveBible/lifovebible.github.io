// 서비스 워커: 앱 파일(html·js·css·아이콘)을 버전별 캐시에 둬서 오프라인에서도 열리게 한다.
//
// - 역본 목록(biblelist.txt)과 역본 파일(.lfa)은 건드리지 않는다. 목록은 늘 서버에서 먼저 받아야
//   서버 목록으로 역본을 통제할 수 있고(app.js가 실패하면 저장해 둔 목록을 쓴다),
//   .lfa는 lfaStore.js가 Cache Storage(lfa-v1)에 직접 보관한다
// - 새 버전은 뒤에서 받아 두고 기다린다. 화면이 "새 버전이 있습니다"를 보이고, 사용자가 누르면 바꾼다.
//   읽는 도중에 파일이 바뀌어 옛 js와 새 js가 섞이는 일을 막는다
// - VERSION은 APP_FILES 내용의 해시다. 앱 파일을 고치면 `node tools/stamp-sw.js`로 바꾼다
//   (바꾸지 않으면 브라우저가 새 버전을 알아채지 못한다. tests/sw.test.js가 잊은 것을 잡는다)
// - 모듈 서비스 워커는 파이어폭스 지원이 늦어서 보통 스크립트로 둔다

const VERSION = '85d3a07a266f';
const CACHE = 'lifove-app-' + VERSION;
const CACHE_PREFIX = 'lifove-app-'; // 이 이름으로 시작하는 옛 캐시만 지운다(lfa-v1은 남긴다)

// 이 서비스 워커 위치 기준 경로. 고르는 규칙: index.html, manifest, css/·js/·icons/ 아래 모든 파일
const APP_FILES = [
  'css/app.css',
  'help/en.html',
  'help/ko.html',
  'icons/apple-touch-icon.png',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'icons/icon.svg',
  'icons/maskable-512.png',
  'icons/maskable.svg',
  'icons/touch.svg',
  'index.html',
  'js/app.js',
  'js/biblelist.js',
  'js/books.js',
  'js/chapterLines.js',
  'js/compare.js',
  'js/lfa.js',
  'js/lfaStore.js',
  'js/localBible.js',
  'js/localStore.js',
  'js/navBar.js',
  'js/platform.js',
  'js/pwa.js',
  'js/readCheck.js',
  'js/search.js',
  'js/strings.js',
  'js/swipe.js',
  'js/userStore.js',
  'js/viewColors.js',
  'js/zip.js',
  'manifest.webmanifest',
];

// 개발 중(localhost)에는 서버에서 먼저 받는다. 캐시 먼저면 파일을 고쳐도 새로 고침에 안 보여서 헷갈린다.
// 서버를 끄면 캐시로 열리므로 오프라인 시험은 그대로 된다
const DEV = ['localhost', '127.0.0.1'].includes(self.location.hostname);

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    // cache: 'reload'로 브라우저 HTTP 캐시를 건너뛴다. GitHub Pages는 파일을 10분쯤 캐시하게 해서,
    // 그냥 받으면 새 sw.js와 옛 app.js가 한 캐시에 섞일 수 있다
    await cache.addAll(APP_FILES.map((f) => new Request(f, { cache: 'reload' })));
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    for (const name of await caches.keys()) {
      if (name.startsWith(CACHE_PREFIX) && name !== CACHE) await caches.delete(name);
    }
    // 처음 설치할 때 지금 열린 화면도 바로 맡아서, 새로 고침 없이도 오프라인이 되게 한다
    await self.clients.claim();
  })());
});

self.addEventListener('message', (event) => {
  if (event.data === 'skipWaiting') self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const scope = self.registration.scope; // 예: https://lifovebible.github.io/web/
  // 범위 밖(데이터 서버 /data/ 등)은 손대지 않는다. 같은 사이트라 이 화면의 요청이 여기로 온다
  if (!req.url.startsWith(scope)) return;
  const path = new URL(req.url).pathname.slice(new URL(scope).pathname.length);
  // 위치는 주소 뒤 #책:장이라 서버로 가지 않는다. 화면 주소는 '' 또는 index.html뿐이다
  const key = req.mode === 'navigate' && path === '' ? 'index.html' : path;
  if (!APP_FILES.includes(key)) return;
  event.respondWith(serve(key, req));
});

async function serve(key, req) {
  const cache = await caches.open(CACHE);
  if (DEV) {
    try {
      const res = await fetch(req);
      if (res.ok) await cache.put(key, res.clone());
      return res;
    } catch (e) {
      const hit = await cache.match(key);
      if (hit) return hit;
      throw e;
    }
  }
  const hit = await cache.match(key);
  return hit || fetch(req);
}
