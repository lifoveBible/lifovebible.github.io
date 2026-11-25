// 역본 파일(.lfa) 받기와 보관.
// CLAUDE.md 규칙대로 받은 파일은 "다시 받을 수 있는 캐시"로 Cache Storage에 둔다.
// 브라우저가 지울 수 있으므로 없으면 언제든 다시 받는다.
// Cache Storage는 https나 localhost에서만 있다. 없으면 보관 없이 받기만 한다.

const CACHE_NAME = 'lfa-v1';

/**
 * .lfa를 보관본에서 꺼내거나, 없으면 받아서 보관한다.
 * @param {string} url
 * @param {(got: number, total: number) => void} [onProgress] 받는 중일 때만 불린다
 * @returns {Promise<ArrayBuffer>}
 */
export async function getLfa(url, onProgress) {
  const cache = await openCache();
  if (cache) {
    const hit = await cache.match(url);
    if (hit) return hit.arrayBuffer();
  }
  const buf = await download(url, onProgress);
  if (cache) {
    try {
      await cache.put(url, new Response(buf, { headers: { 'Content-Type': 'application/zip' } }));
    } catch (e) {
      // 공간 부족 등. 이번에는 읽을 수 있으니 보관만 포기한다
      console.warn('lfa cache put failed', e);
    }
  }
  return buf;
}

/** 받아 둘 수 있는가. Cache Storage가 없는 주소(http://192.168.x.x 등)에서는 고를 때마다 받는다 */
export async function canCache() {
  return (await openCache()) !== null;
}

/** 보관해 둔 .lfa 주소들. 성경다운로드 창의 "받음" 표시와 역본대조보기 창의 목록에 쓴다 */
export async function cachedUrls() {
  const cache = await openCache();
  if (!cache) return new Set();
  return new Set((await cache.keys()).map((req) => req.url));
}

/** 보관본을 지운다(앱 설정의 역본 삭제에 해당). 다시 읽으려면 성경다운로드에서 받는다 */
export async function deleteLfa(url) {
  const cache = await openCache();
  if (cache) await cache.delete(url);
}

/**
 * 서버 목록에 없는 주소의 보관본을 지운다. 서버 목록에서 역본을 빼면 웹에서는 고를 수 없게 되므로
 * 남은 파일은 자리만 차지한다. 주소가 바뀐 역본의 옛 파일도 여기서 지워진다
 * @param {string[]} keepUrls 서버 목록의 주소들
 */
export async function pruneLfa(keepUrls) {
  const cache = await openCache();
  if (!cache) return;
  // 보관 키(req.url)는 브라우저가 고친 꼴이라(공백 → %20 등) 같은 꼴로 바꿔 비교한다
  const keep = new Set();
  for (const u of keepUrls) { try { keep.add(new URL(u).href); } catch { /* 깨진 주소는 무시 */ } }
  for (const req of await cache.keys()) {
    if (!keep.has(req.url)) await cache.delete(req);
  }
}

async function openCache() {
  if (typeof caches === 'undefined') return null;
  try {
    return await caches.open(CACHE_NAME);
  } catch {
    return null; // 사파리 개인 정보 보호 모드 등
  }
}

/** 받으면서 진행률을 알린다. Content-Length가 없으면 total은 0 */
async function download(url, onProgress) {
  const res = await fetch(url);
  if (!res.ok) throw new Error('HTTP ' + res.status);
  const total = Number(res.headers.get('Content-Length')) || 0;
  const reader = res.body.getReader();
  const chunks = [];
  let got = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    got += value.length;
    onProgress?.(got, total);
  }
  const buf = new Uint8Array(got);
  let p = 0;
  for (const c of chunks) { buf.set(c, p); p += c.length; }
  return buf.buffer;
}
