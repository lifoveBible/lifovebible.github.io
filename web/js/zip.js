// 작은 zip 읽기. .lfa 파일(zip)에서 장 파일 하나를 꺼내는 데만 쓴다.
//
// JSZip을 vendor/에 넣을 계획이었지만, 브라우저 내장 DecompressionStream('deflate-raw')로
// 충분해서 직접 짰다. 라이브러리가 하나 줄고, Node(24)에도 같은 API가 있어 테스트할 수 있다.
// 지원: 저장(0)과 deflate(8) 방식. 지원 안 함: zip64, 암호. (.lfa는 2~15MB라 해당 없음)
//
// 크기는 로컬 헤더가 아니라 중앙 디렉터리에서 읽는다. 데이터 디스크립터를 쓰는 zip은
// 로컬 헤더의 크기 칸이 0이기 때문이다.

const EOCD_SIG = 0x06054b50;
const CEN_SIG = 0x02014b50;
const LOC_SIG = 0x04034b50;

/**
 * zip의 목록을 읽는다.
 * @param {ArrayBuffer} buf zip 파일 전체
 * @returns {{name: string, method: number, compSize: number, size: number, offset: number}[]}
 */
export function listZip(buf) {
  const view = new DataView(buf);
  const eocd = findEocd(view);
  const count = view.getUint16(eocd + 10, true);
  let p = view.getUint32(eocd + 16, true); // 중앙 디렉터리 시작
  const decoder = new TextDecoder('utf-8');

  const entries = [];
  for (let i = 0; i < count; i++) {
    if (view.getUint32(p, true) !== CEN_SIG) throw new Error('zip: bad central directory');
    const nameLen = view.getUint16(p + 28, true);
    const extraLen = view.getUint16(p + 30, true);
    const commentLen = view.getUint16(p + 32, true);
    entries.push({
      name: decoder.decode(new Uint8Array(buf, p + 46, nameLen)),
      method: view.getUint16(p + 10, true),
      compSize: view.getUint32(p + 20, true),
      size: view.getUint32(p + 24, true),
      offset: view.getUint32(p + 42, true),
    });
    p += 46 + nameLen + extraLen + commentLen;
  }
  return entries;
}

/**
 * 항목 하나의 내용을 꺼낸다.
 * @param {ArrayBuffer} buf zip 파일 전체
 * @param {{method: number, compSize: number, offset: number}} entry listZip의 항목
 * @returns {Promise<Uint8Array>}
 */
export async function readEntry(buf, entry) {
  const view = new DataView(buf);
  const p = entry.offset;
  if (view.getUint32(p, true) !== LOC_SIG) throw new Error('zip: bad local header');
  const start = p + 30 + view.getUint16(p + 26, true) + view.getUint16(p + 28, true);
  const data = new Uint8Array(buf, start, entry.compSize);

  if (entry.method === 0) return data.slice();
  if (entry.method !== 8) throw new Error('zip: unsupported method ' + entry.method);

  const stream = new Blob([data]).stream().pipeThrough(new DecompressionStream('deflate-raw'));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

// 끝에서부터 EOCD 서명을 찾는다. 뒤에 주석(최대 65535바이트)이 붙을 수 있다.
function findEocd(view) {
  const min = Math.max(0, view.byteLength - 22 - 0xffff);
  for (let p = view.byteLength - 22; p >= min; p--) {
    if (view.getUint32(p, true) === EOCD_SIG) return p;
  }
  throw new Error('zip: not a zip file');
}
