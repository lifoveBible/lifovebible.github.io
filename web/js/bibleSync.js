// 역본 파일 동기화(sync-format 6b, 2026-11-28 JC 확정): 서버 목록에 없는 역본(직접 넣은 역본, 유료 역본. 구분하지 않음)을
// 파일째 드라이브 appDataFolder에 올리고, 다른 기기가 올린 것은 받을지 묻는다(자동으로 받지 않음).
// - 이름: 코드마다 하나 `bible-<코드>.lfa`, 옛 형식 `bible-<코드>-<n>.bdf`. 같은 이름이 여럿이면 modifiedTime이 늦은 것
// - 정보: 파일의 appProperties(format, code, name, lang, kind, parts, device, written_at). 목록만으로 무엇이 있는지 안다
// - 같은 코드에 내용이 다르면 넣은 시각이 나중인 쪽이 이긴다. written_at은 '그 파일을 넣은 시각'으로 둔다(올린 시각이 아님):
//   받은 기기는 넣은 시각(addedAt)을 written_at 그대로 두어, 받은 것을 자기가 더 늦게 넣은 것으로 보고 다시 올리지 않게
// - 코드는 대소문자를 가리지 않고 비교한다(서버 목록 korHKJV 등). 이 기기에서 지워도 드라이브 파일은 남는다
// 화면과 토큰은 부르는 쪽(syncUi.js, app.js)이 맡는다. 여기서는 목록 해석, 할 일 정하기, 올리기·받기만

import { checkLfa, checkBdfText, decodeBdf } from './localBible.js';
import { LANG_RE } from './langGuess.js';

export const BIBLE_FORMAT = 1;
const LFA_RE = /^bible-(.+)\.lfa$/;
const BDF_RE = /^bible-(.+)-(\d+)\.bdf$/;
const PROP_BYTES = 124; // appProperties는 키+값이 124바이트를 넘을 수 없다

export const codeKey = (code) => String(code).toLowerCase();

export function bibleFileName(code, kind, part = 1) {
  return kind === 'lfa' ? `bible-${code}.lfa` : `bible-${code}-${part}.bdf`;
}

/** 드라이브 파일 이름 → { code, kind, part } (역본 파일이 아니면 null) */
export function parseBibleName(name) {
  let m = LFA_RE.exec(name);
  if (m) return { code: m[1], kind: 'lfa', part: 1 };
  m = BDF_RE.exec(name);
  if (m) return { code: m[1], kind: 'bdf', part: Number(m[2]) };
  return null;
}

/** appProperties 값이 키와 합쳐 124바이트를 넘지 않게 UTF-8 글자 단위로 자른다(한글은 3바이트) */
export function fitProp(key, value) {
  const max = PROP_BYTES - new TextEncoder().encode(key).length;
  let out = '', used = 0;
  for (const ch of String(value ?? '')) {
    const n = new TextEncoder().encode(ch).length;
    if (used + n > max) break;
    out += ch;
    used += n;
  }
  return out;
}

/**
 * 드라이브 목록 → 코드(소문자)마다 { code, name, lang, kind, parts, device, writtenAt, size, files: [{id, name, part}], extra: [id] }.
 * extra는 같은 이름의 나머지·다른 형식의 옛 파일(올릴 때 지운다). 정보는 appProperties, 없으면 이름에서
 */
export function driveBibles(files) {
  const byName = new Map();
  for (const f of files) {
    const p = parseBibleName(f.name);
    if (!p) continue;
    if (!byName.has(f.name)) byName.set(f.name, []);
    byName.get(f.name).push({ ...f, ...p });
  }
  const time = (f) => Date.parse(f.modifiedTime) || 0;
  const groups = new Map(); // 코드 → kind → { files, extra }
  for (const list of byName.values()) {
    list.sort((a, b) => time(b) - time(a) || (a.id < b.id ? -1 : 1));
    const [f, ...rest] = list;
    const key = codeKey(f.code);
    if (!groups.has(key)) groups.set(key, {});
    const g = groups.get(key);
    g[f.kind] ??= { files: [], extra: [] };
    g[f.kind].files.push(f);
    g[f.kind].extra.push(...rest.map((x) => x.id));
  }
  const out = new Map();
  for (const [key, kinds] of groups) {
    // 한 코드에 lfa와 bdf가 함께 있으면(형식을 바꿔 다시 넣음) 넣은 시각이 늦은 쪽. 다른 쪽은 지울 것
    const entries = Object.entries(kinds).map(([kind, g]) => {
      const props = g.files.find((x) => x.part === 1)?.appProperties || g.files[0].appProperties || {};
      return {
        code: props.code || g.files[0].code,
        name: props.name || '',
        lang: props.lang || '',
        kind,
        parts: Number(props.parts) || g.files.length,
        device: props.device || '',
        writtenAt: Number(props.written_at) || 0,
        format: Number(props.format) || 0,
        size: g.files.reduce((n, x) => n + Math.max(0, Number(x.size) || 0), 0),
        files: g.files.sort((a, b) => a.part - b.part).map(({ id, name, part }) => ({ id, name, part })),
        extra: g.extra,
      };
    }).sort((a, b) => b.writtenAt - a.writtenAt);
    const [best, ...others] = entries;
    for (const o of others) best.extra.push(...o.files.map((x) => x.id), ...o.extra);
    // 조각이 parts만큼 다 올라오지 않은 bdf(올리는 중이거나 끊김)는 받지 않는다(6b 받기 제안 규칙)
    best.complete = best.kind === 'lfa'
      || Array.from({ length: best.parts }, (_, k) => k + 1).every((n) => best.files.some((f) => f.part === n));
    // 모르는 더 새 판은 받지 않는다(목록에는 보이고 지울 수 있다)
    best.newer = best.format > BIBLE_FORMAT;
    out.set(key, best);
  }
  return out;
}

/**
 * 할 일 정하기.
 * @param local 이 기기에 넣은 역본들({code, name, kind, addedAt}, 내용 없이)
 * @param drive driveBibles 결과
 * @param serverCodes 이 기기의 서버 목록 코드들(이것은 올리지 않는다)
 * @param removed { 코드(소문자): 넣은 시각 } 이 기기에서 드라이브의 파일을 지운 역본. 그 뒤에 다시 넣지 않았으면 올리지 않는다
 * @returns { upload: [local 행], offers: [drive 항목 + { replace }] } replace: 이 기기에도 있지만 드라이브 것이 더 늦게 넣은 것
 */
export function planBibles({ local, drive, serverCodes = [], removed = {} }) {
  const server = new Set(serverCodes.map(codeKey));
  const upload = [], offers = [];
  const mine = new Map();
  for (const l of local) {
    const key = codeKey(l.code);
    mine.set(key, l);
    if (server.has(key)) continue;
    const d = drive.get(key);
    const at = Number(l.addedAt) || 0;
    if (removed[key] != null && at <= removed[key]) continue;
    // 덜 올라온 같은 판은 다시 올린다(끊긴 올리기를 마저)
    if (!d || (!d.newer && (at > d.writtenAt || (!d.complete && at >= d.writtenAt)))) upload.push(l);
  }
  // 받기 제안(6b): 이 기기에 없으면 받기, 있으면 드라이브 것이 더 나중에 넣은 것일 때만 바꾸기.
  // 내가 올린 것도 이 기기에 없으면 제안한다(지운 뒤 자기 드라이브 파일로 되찾게). 덜 올라온 bdf는 빼고
  for (const [key, d] of drive) {
    if (d.newer || !d.complete) continue;
    const l = mine.get(key);
    if (!l) offers.push({ ...d, replace: false });
    else if (d.writtenAt > (Number(l.addedAt) || 0)) offers.push({ ...d, replace: true });
  }
  return { upload, offers };
}

/**
 * 지금 역본 파일을 올려도 되나(6b, 2026-11-28 JC: 데이터 요금이 없는 네트워크에서만. 받기는 [받기]를 누를 때라 제한 없음).
 * 웹은 안드로이드 크롬 등에서만 navigator.connection.type을 안다. 모를 때는 JC가 정한 대로: PC는 올리고,
 * 폰·태블릿은 사용자가 직접 동기화할 때(지금 동기화·켜기·띠 누르기)만
 * @param o.connection navigator.connection(없을 수 있음)
 * @param o.mobile 폰·태블릿인가
 * @param o.manual 사용자가 직접 누른 동기화인가
 */
export function canUploadBibles({ connection, mobile, manual }) {
  if (connection?.saveData) return false; // 데이터 절약을 켰다
  const type = connection?.type;
  if (type === 'cellular') return false;
  if (type === 'wifi' || type === 'ethernet') return true;
  return mobile ? !!manual : true;
}

/** 폰·태블릿인가(userAgent로 대강. 데스크톱 모드 아이패드는 터치 점으로) */
export function isMobileDevice(nav = globalThis.navigator) {
  if (nav?.userAgentData?.mobile) return true;
  const ua = nav?.userAgent || '';
  return /Android|iPhone|iPad|iPod|Mobile/i.test(ua) || (/Macintosh/.test(ua) && (nav?.maxTouchPoints || 0) > 1);
}

/**
 * 이미 올라간 역본 파일 중 lang이 빈 것에 이 기기가 아는 언어를 채울 것(sync-format 6c, 앱과 같은 규칙).
 * 내용은 다시 올리지 않는다. 드라이브의 lang이 비었고 이 기기에 그 역본(대소문자 무시)이 있고 언어를 알 때만.
 * 다른 기기가 이미 적은 언어는 덮지 않는다. 모르는 새 판은 건드리지 않는다
 * @returns [{ d, lang }]
 */
export function planLangFills({ local, drive }) {
  const mine = new Map(local.map((l) => [codeKey(l.code), l]));
  const out = [];
  for (const [key, d] of drive) {
    const l = mine.get(key);
    if (d.newer || d.lang || !l?.lang || !LANG_RE.test(l.lang)) continue;
    out.push({ d, lang: l.lang });
  }
  return out;
}

/** 한 역본의 파일들(bdf는 조각 모두)에 lang만 적는다 */
export async function fillBibleLang(drive, d, lang) {
  for (const f of d.files) await drive.setAppProperties(f.id, { lang: fitProp('lang', lang) });
}

/** 같은 제안을 다시 묻지 않으려고 기억하는 표(코드와 넣은 시각) */
export const offerKey = (d) => `${codeKey(d.code)}@${d.writtenAt}`;

const utf8 = (s) => new TextEncoder().encode(s);

/**
 * 한 역본을 올린다. 있던 같은 코드의 파일은 바꾸고(id 그대로), 남는 것(부분 수가 줄었거나 형식이 바뀐 옛 파일, 같은 이름의 나머지)은 지운다
 * @param record 이 기기의 역본 행(내용 포함, localStore.getLocal)
 * @param prev 드라이브에 있던 그 코드의 항목(driveBibles) 또는 없음
 * @param o.lang 서버 목록에 없으니 대개 ''. 알면 넣는다
 */
export async function uploadBible(drive, record, prev, { device, lang = '' }) {
  const parts = record.kind === 'lfa'
    ? [{ part: 1, body: record.data }]
    : Object.keys(record.data).map(Number).sort((a, b) => a - b).map((n) => ({ part: n, body: utf8(record.data[n]) })); // bdf는 UTF-8로(6b)
  const props = {
    format: String(BIBLE_FORMAT),
    code: fitProp('code', record.code),
    name: fitProp('name', record.userName || record.name || ''), // 고친 이름이 있으면 그것(이 칸을 나누기 전과 같게)
    lang: fitProp('lang', record.lang || lang),
    kind: record.kind,
    parts: String(parts.length),
    device,
    written_at: String(Number(record.addedAt) || 0),
  };
  const reuse = new Map((prev && prev.kind === record.kind ? prev.files : []).map((f) => [f.part, f.id]));
  const kept = new Set();
  for (const p of parts) {
    const id = reuse.get(p.part) || null;
    await drive.upload({
      id, name: bibleFileName(record.code, record.kind, p.part), body: p.body,
      mime: record.kind === 'lfa' ? 'application/zip' : 'text/plain; charset=UTF-8', appProperties: props,
    });
    if (id) kept.add(id);
  }
  const stale = prev ? [...prev.files.map((f) => f.id).filter((id) => !kept.has(id)), ...prev.extra] : [];
  for (const id of stale) await drive.remove(id);
  return parts.length;
}

/**
 * 드라이브의 역본을 받아 이 기기에 넣을 행으로 만든다. 넣은 시각은 written_at 그대로(위 머리말).
 * 깨졌으면 { reason }(넣기 검사와 같은 이유)
 */
export async function fetchBible(drive, d) {
  const base = { code: d.code, kind: d.kind, restricted: false, addedAt: d.writtenAt, lang: d.lang || null };
  if (d.kind === 'lfa') {
    const buf = await drive.downloadBytes(d.files[0].id);
    const r = await checkLfa(buf);
    if (!r.ok) return { reason: r.reason };
    return { record: { ...base, name: d.name || r.name, lang: d.lang || r.lang || null, size: buf.byteLength, data: buf } };
  }
  const data = {};
  let size = 0;
  for (const f of d.files) {
    const bytes = new Uint8Array(await drive.downloadBytes(f.id));
    const text = decodeBdf(bytes);
    if (!checkBdfText(text)) return { reason: 'badText' };
    data[f.part] = text;
    size += bytes.length;
  }
  return { record: { ...base, name: d.name || null, size, data } };
}

/** 동기화 화면의 "드라이브에 올린 역본 파일 N개, ○ MB" */
export function driveSummary(drive) {
  let bytes = 0;
  for (const d of drive.values()) bytes += d.size;
  return { count: drive.size, mb: bytes ? Math.max(0.1, Math.round(bytes / 1024 / 102.4) / 10) : 0 }; // 작아도 0 MB로 보이지 않게
}
