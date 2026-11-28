// 구글 드라이브 동기화 7.7 1단계(로그인 시험). 드라이브 REST v3를 fetch로 직접 부른다.
// 앱 sync/DriveClient와 같은 호출(about.get, appDataFolder 목록·만들기·덮어쓰기·받기).
// 구글 API 자바스크립트 라이브러리(gapi)는 쓰지 않는다: 크고, 필요한 호출이 몇 개뿐이라.
// 권한은 drive.appdata 하나. appDataFolder는 같은 Cloud 프로젝트의 클라이언트(앱의 Android 클라이언트와
// 이 웹 클라이언트)끼리 공유된다. 동기화 데이터 파일의 형식은 앱 docs/sync-format.md를 따른다(아직 없음)

export const SCOPE = 'https://www.googleapis.com/auth/drive.appdata';
const API = 'https://www.googleapis.com/drive/v3/';
const UPLOAD = 'https://www.googleapis.com/upload/drive/v3/files';
const RESUMABLE_BYTES = 5 * 1024 * 1024; // 이보다 크면 resumable 업로드(sync-format 6b)

/** 드라이브가 400 이상으로 답했을 때. status 401이면 토큰이 끝났다(다시 권한을 받는다) */
export class DriveError extends Error {
  constructor(status, body) {
    super(`HTTP ${status}${body ? ': ' + body.slice(0, 300) : ''}`);
    this.status = status;
  }
}

const enc = encodeURIComponent;

export class DriveClient {
  /**
   * @param token 한 시간짜리 access token(Google Identity Services 토큰 방식. refresh token은 쓰지 않는다)
   * @param fetchFn 시험에서 가짜를 넣으려고
   */
  constructor(token, fetchFn = globalThis.fetch.bind(globalThis)) {
    this.token = token;
    this.fetch = fetchFn;
  }

  async request(method, url, { type, body, headers: more = {} } = {}) {
    const headers = { Authorization: 'Bearer ' + this.token, ...more };
    if (type) headers['Content-Type'] = type;
    const res = await this.fetch(url, { method, headers, body });
    if (!res.ok) throw new DriveError(res.status, await res.text().catch(() => ''));
    return res;
  }

  /** 로그인한 계정의 이메일. 앱과 웹이 다른 계정이면 서로 다른 폴더를 보므로 화면에 보인다 */
  async userEmail() {
    const res = await this.request('GET', API + 'about?fields=' + enc('user(emailAddress)'));
    return (await res.json()).user?.emailAddress || '';
  }

  /**
   * appDataFolder의 모든 파일: [{id, name, modifiedTime, size, md5Checksum, appProperties}] (size는 숫자, 없으면 -1).
   * appProperties는 역본 파일(sync-format 6b)의 정보. 없는 파일도 있다
   * md5Checksum은 내용의 지문(바뀐 파일만 받으려고, sync.fileKey). 드라이브가 주지 않으면 없다
   */
  async listAppData() {
    const out = [];
    let page = '';
    do {
      const url = API + 'files?spaces=appDataFolder&pageSize=100&fields='
        + enc('nextPageToken,files(id,name,modifiedTime,size,md5Checksum,appProperties)') + (page ? '&pageToken=' + enc(page) : '');
      const o = await (await this.request('GET', url)).json();
      for (const f of o.files || []) out.push({ ...f, size: f.size == null ? -1 : Number(f.size) });
      page = o.nextPageToken || '';
    } while (page);
    return out;
  }

  /** appDataFolder에 새 파일을 만들고 id를 돌려준다. 같은 이름이 있어도 드라이브는 하나 더 만든다 */
  async create(name, text, mime = 'application/json') {
    const boundary = 'lifove' + Math.random().toString(16).slice(2) + Date.now().toString(16);
    const meta = JSON.stringify({ name, parents: ['appDataFolder'] });
    const body = `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${meta}\r\n`
      + `--${boundary}\r\nContent-Type: ${mime}\r\n\r\n${text}\r\n--${boundary}--\r\n`;
    const res = await this.request('POST', UPLOAD + '?uploadType=multipart&fields=id',
      { type: `multipart/related; boundary=${boundary}`, body });
    return (await res.json()).id;
  }

  /** 있는 파일의 내용을 바꾼다(fetch는 PATCH를 그대로 보낼 수 있어 앱의 X-HTTP-Method-Override는 필요 없다) */
  async update(id, text, mime = 'application/json') {
    await this.request('PATCH', `${UPLOAD}/${enc(id)}?uploadType=media&fields=id`, { type: mime, body: text });
  }

  /** 파일을 지운다(휴지통을 거치지 않음. appDataFolder 파일은 사용자가 휴지통에서 볼 수도 없다) */
  async remove(id) {
    await this.request('DELETE', `${API}files/${enc(id)}`);
  }

  async download(id) {
    return (await this.request('GET', `${API}files/${enc(id)}?alt=media`)).text();
  }

  /** 내용을 바이트로(역본 파일 .lfa는 zip이라 글로 읽으면 깨진다) */
  async downloadBytes(id) {
    return (await this.request('GET', `${API}files/${enc(id)}?alt=media`)).arrayBuffer();
  }

  /**
   * 역본 파일 올리기(sync-format 6b): 내용과 appProperties를 함께. id가 있으면 그 파일을 바꾸고 없으면 새로 만든다.
   * 5 MB가 넘으면 resumable 업로드(드라이브가 multipart는 작은 파일에만 권함). 만든·바꾼 파일 id를 돌려준다
   * @param body ArrayBuffer 또는 Uint8Array
   */
  async upload({ id = null, name, body, mime = 'application/octet-stream', appProperties = {} }) {
    const bytes = body instanceof Uint8Array ? body : new Uint8Array(body);
    const meta = id ? { name, appProperties } : { name, parents: ['appDataFolder'], appProperties };
    const url = id ? `${UPLOAD}/${enc(id)}` : UPLOAD;
    const method = id ? 'PATCH' : 'POST';
    if (bytes.byteLength > RESUMABLE_BYTES) {
      // 1) 메타데이터로 올릴 자리를 받고(Location) 2) 내용을 한 번에 PUT. 끊기면 처음부터(다음 동기화에서 다시)
      const res = await this.request(method, url + '?uploadType=resumable&fields=id', {
        type: 'application/json; charset=UTF-8', body: JSON.stringify(meta),
        headers: { 'X-Upload-Content-Type': mime, 'X-Upload-Content-Length': String(bytes.byteLength) },
      });
      const at = res.headers.get('Location');
      if (!at) throw new DriveError(0, 'no resumable upload location');
      return (await (await this.request('PUT', at, { type: mime, body: bytes })).json()).id;
    }
    const boundary = 'lifove' + Math.random().toString(16).slice(2) + Date.now().toString(16);
    const head = `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(meta)}\r\n`
      + `--${boundary}\r\nContent-Type: ${mime}\r\n\r\n`;
    const multipart = new Blob([head, bytes, `\r\n--${boundary}--\r\n`]);
    const res = await this.request(method, url + '?uploadType=multipart&fields=id',
      { type: `multipart/related; boundary=${boundary}`, body: multipart });
    return (await res.json()).id;
  }
}

/** 이 기기 ID: 16자리 소문자 hex(앱 SyncDevice와 같은 모양). 한 사용자의 기기 몇 대 사이에서만 겹치지 않으면 된다 */
export function newDeviceId(cryptoObj = globalThis.crypto) {
  const b = cryptoObj.getRandomValues(new Uint8Array(8));
  return Array.from(b, (x) => x.toString(16).padStart(2, '0')).join('');
}

export const isDeviceId = (s) => typeof s === 'string' && /^[0-9a-f]{16}$/.test(s);

/**
 * hello 파일에 넣을 "브라우저 / OS" 요약(앱은 제조사 + 모델). userAgent로 대강만 가른다
 */
export function browserModel(ua = '') {
  const browser = /Edg\//.test(ua) ? 'Edge'
    : /SamsungBrowser\//.test(ua) ? 'Samsung Internet'
      : /Firefox\/|FxiOS\//.test(ua) ? 'Firefox'
        : /Chrome\/|CriOS\//.test(ua) ? 'Chrome'
          : /Safari\//.test(ua) ? 'Safari' : 'Browser';
  const os = /iPhone|iPod/.test(ua) ? 'iOS' : /iPad/.test(ua) ? 'iPadOS'
    : /Android/.test(ua) ? 'Android' : /Windows/.test(ua) ? 'Windows'
      : /Mac OS X|Macintosh/.test(ua) ? 'macOS' : /CrOS/.test(ua) ? 'ChromeOS'
        : /Linux/.test(ua) ? 'Linux' : 'unknown';
  return `${browser} / ${os}`;
}

export const helloName = (device) => `hello-${device}.json`;

/** hello 파일 내용. 칸은 앱 DriveSyncTest와 같다(client만 "web"). 앱처럼 들여쓰기 2칸 */
export function helloContent({ device, model, app, now = Date.now() }) {
  return JSON.stringify({ client: 'web', device, model, app, written_at: now }, null, 2);
}
