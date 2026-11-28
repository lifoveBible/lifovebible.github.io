// 합치기 규칙: 같은 키(같은 절 등)의 행이 두 곳(지금 브라우저와 앱 백업)에 있을 때 어느 쪽을 남길지.
// 앱 MergeRules.java(7.6.0)를 그대로 옮겼다. 앱과 같은 백업을 합치면 같은 결과가 나와야 하고,
// 나중에 동기화(앱 7.7 설계)도 같은 규칙을 쓴다. 테스트도 앱 MergeRulesTest를 옮긴 것(tests/mergeRules.test.js).
//
// - 형광펜·읽음 기록·책갈피·메모책: 나중에 고친 쪽(updated_at)이 이긴다. 삭제도 하나의 고침이다.
//   그래서 백업 뒤에 지운 형광펜은 합쳐도 되살아나지 않는다(앱 결정. 단순 합집합은 지운 것이 계속 살아나서 버림)
// - 메모: 양쪽 다 살아 있는데 글이 다르면 사용자에게 묻는다(충돌). 한쪽만 지웠으면 나중 쪽
// - 시각이 같으면 지금 쪽을 남긴다(쓸데없는 쓰기를 막음)
// - 시각이 없는 옛 백업(DB 버전 8 이하, 앱 7.5.2까지)은 updatedAt = NO_TIME으로 넘긴다. 그러면 지금 기록이 늘 이긴다

/** 시각이 없는 옛 기록. 어떤 기록보다도 오래된 것으로 본다 */
export const NO_TIME = 0;

/** 두 메모를 이어 붙일 때 사이에 넣는 줄 */
export const MEMO_JOINER = '\n\n';

/** 고르는 결과(앱 Choice) */
export const KEEP_LOCAL = 'keep';   // 지금 것을 그대로 둔다
export const TAKE_OTHER = 'take';   // 백업 것으로 바꾸거나 새로 넣는다. 삭제 표시도 그대로 가져온다
export const CONFLICT = 'conflict'; // 사용자에게 묻는다(메모만)

/** 메모 충돌에서 사용자가 고른 것(앱 MemoPick) */
export const PICK_LOCAL = 'local';
export const PICK_OTHER = 'other';
export const PICK_BOTH = 'both';

/**
 * 한 행의 상태(앱 Rec). value는 '같은 내용인가' 비교에만 쓴다: 형광펜은 type, 메모는 글, 나머지는 null.
 * value는 글자로 바꿔 둔다(앱은 getString으로 읽는다. SQLite의 1과 IndexedDB의 1, '1'이 같게)
 * @returns {{updatedAt:number, deleted:boolean, value:(string|null)}}
 */
export function rec(updatedAt, deleted, value = null) {
  return { updatedAt: Number(updatedAt) || NO_TIME, deleted: !!Number(deleted), value: value == null ? null : String(value) };
}

/** 형광펜·읽음 기록·책갈피·메모책. 없는 쪽은 null */
export function latest(local, other) {
  if (!other) return KEEP_LOCAL;
  if (!local) return TAKE_OTHER; // 지운 표시만 있어도 가져온다(동기화 때 삭제가 퍼지도록)
  if (same(local, other)) return KEEP_LOCAL;
  return other.updatedAt > local.updatedAt ? TAKE_OTHER : KEEP_LOCAL;
}

/**
 * 메모. 둘 다 살아 있고 글이 다르면 CONFLICT, 그 밖에는 latest와 같다.
 * 단, 지금 글에 백업 글이 통째로 들어 있으면 묻지 않고 지금 것을 둔다:
 * [둘 다]로 이어 붙인 뒤 같은 백업을 또 합치면 매번 같은 충돌을 묻던 문제(앱 7.6.0 개발 중 발견).
 * 반대(백업 글에 지금 글이 들어 있음)는 계속 묻는다. 백업 뒤에 일부러 줄인 메모일 수 있어서다
 */
export function memo(local, other) {
  if (local && other && !local.deleted && !other.deleted && local.value !== other.value) {
    if (local.value != null && other.value != null && local.value.includes(other.value)) return KEEP_LOCAL;
    return CONFLICT;
  }
  return latest(local, other);
}

/** 메모 충돌에서 고른 대로 남길 글 */
export function resolveMemo(local, other, pick) {
  if (pick === PICK_LOCAL) return local;
  if (pick === PICK_OTHER) return other;
  return joinMemos(local, other);
}

/** 지금 메모 아래에 백업 메모를 붙인다. 이미 들어 있으면(전에 붙였던 경우) 다시 붙이지 않는다 */
export function joinMemos(local, other) {
  const a = local ?? '';
  const b = other ?? '';
  // 자바 String.trim()처럼 빈칸·제어 문자만 본다(JS trim은 전각 빈칸도 지워서 결과가 달라질 수 있음)
  const blank = (s) => s.replace(/^[\u0000- ]+|[\u0000- ]+$/g, '') === '';
  if (blank(b) || a.includes(b)) return a;
  if (blank(a) || b.includes(a)) return b;
  return a + MEMO_JOINER + b;
}

function same(a, b) {
  return a.deleted === b.deleted && (a.deleted || a.value === b.value);
}

// ---- 동기화(앱 7.7, sync-format.md 5·6절) ----
// 복구의 "시각이 같으면 지금 것"을 그대로 쓰면 두 기기가 서로 자기 것을 지켜 영영 맞지 않아서 동기화는 규칙이 따로다.
// 앱 MergeRules의 SyncRec·syncLatest·MemoBase·syncMemo·syncVerOrder를 그대로 옮겼다. 공통 사례는 앱 docs/sync-cases.json

/**
 * 동기화용 한 행(앱 SyncRec). values는 sync-format 3절 표의 '나머지 칸'을 적힌 순서대로 글로 바꾼 것(null은 "")
 * @returns {{updatedAt:number, deleted:boolean, values:string[]}}
 */
export function syncRec(updatedAt, deleted, values = []) {
  return { updatedAt: Number(updatedAt) || NO_TIME, deleted: !!Number(deleted), values: values.map((v) => (v == null ? '' : String(v))) };
}

const valueAt = (r, i) => r.values[i] ?? '';

/**
 * 형광펜·읽음 기록·책갈피·메모책(앱 syncLatest). 늦은 시각이 이긴다(내용이 같아도 늦은 쪽을 가져와 시각까지 맞춘다).
 * 시각이 같으면 ① 지운 쪽 ② '나머지 칸'을 차례로 비교해 큰 쪽(UTF-16 코드 단위: JS <, 자바 compareTo와 같다).
 * 완전히 같으면 KEEP_LOCAL
 */
export function syncLatest(local, other) {
  if (!other) return KEEP_LOCAL;
  if (!local) return TAKE_OTHER;
  if (other.updatedAt !== local.updatedAt) return other.updatedAt > local.updatedAt ? TAKE_OTHER : KEEP_LOCAL;
  if (other.deleted !== local.deleted) return other.deleted ? TAKE_OTHER : KEEP_LOCAL;
  const n = Math.max(local.values.length, other.values.length);
  for (let i = 0; i < n; i++) {
    const a = valueAt(local, i), b = valueAt(other, i);
    if (a !== b) return b > a ? TAKE_OTHER : KEEP_LOCAL;
  }
  return KEEP_LOCAL;
}

// ---- 메모 버전 벡터(sync-format 판 2, 5절) ----
// vv = { 기기ID: 그 기기가 마지막으로 고친 시각(epoch ms) }. 한쪽 vv가 다른 쪽의 모든 항목보다 크거나 같으면 그쪽이
// 다른 쪽 고침을 다 아는 것. 판 1의 '마지막으로 맞춘 글'은 기기가 셋이면 고침을 조용히 잃어서 버렸다

/** 7.7 전 메모의 옛 이력 자리(앱 VV_LEGACY). 기기ID로 쓰지 않는다 */
export const VV_LEGACY = '0';

/** compareVv 결과(앱 VvOrder) */
export const VV_EQUAL = 'EQUAL';
export const VV_LOCAL_NEWER = 'LOCAL_NEWER';
export const VV_OTHER_NEWER = 'OTHER_NEWER';
export const VV_CONCURRENT = 'CONCURRENT';

/** 비었거나 없으면 7.7 전 메모: { "0": updated_at } (앱 effectiveVv) */
export function effectiveVv(vv, updatedAt) {
  const out = { ...(vv || {}) };
  if (!Object.keys(out).length) out[VV_LEGACY] = Number(updatedAt) || NO_TIME;
  return out;
}

/** 이 기기에서 메모를 쓰거나 고치거나 지울 때의 새 vv(앱 stampVv). 시계가 뒤로 가도 이 기기 항목은 늘 커진다 */
export function stampVv(vv, oldUpdatedAt, device, now) {
  const out = effectiveVv(vv, oldUpdatedAt);
  const prev = out[device];
  out[device] = prev != null && prev >= now ? prev + 1 : now;
  return out;
}

/** 항목마다 큰 값(앱 maxVv). 합친 결과의 vv(두 쪽 고침을 모두 안다) */
export function maxVv(a, b) {
  const out = { ...a };
  for (const [k, v] of Object.entries(b)) if (out[k] == null || v > out[k]) out[k] = v;
  return out;
}

/** 두 vv 비교(앱 compareVv). 없는 항목은 가장 작다 */
export function compareVv(local, other) {
  let localAhead = false, otherAhead = false;
  for (const k of new Set([...Object.keys(local), ...Object.keys(other)])) {
    const l = local[k] ?? -Infinity, o = other[k] ?? -Infinity;
    if (l > o) localAhead = true;
    if (o > l) otherAhead = true;
  }
  if (localAhead && otherAhead) return VV_CONCURRENT;
  if (localAhead) return VV_LOCAL_NEWER;
  return otherAhead ? VV_OTHER_NEWER : VV_EQUAL;
}

const sameMemo = (a, b) => a.deleted === b.deleted && (a.deleted || valueAt(a, 0) === valueAt(b, 0));
const onlyLegacy = (vv) => Object.keys(vv).every((k) => k === VV_LEGACY);

/**
 * 동기화의 메모(앱 syncMemo). local·other는 syncRec(values[0]이 메모 글), lvv·ovv는 두 쪽의 vv(비었으면 7.7 전 메모).
 * - 두 쪽 다 7.7 전 메모뿐이면(처음 연결): 복구 규칙 memo()와 같다. 글이 같으면 syncLatest, 한쪽이 지웠는데 시각까지 같으면 지운 쪽
 * - 한쪽 vv가 다른 쪽을 모두 알면 그쪽(시각은 보지 않음: 시계가 틀려도 맞다)
 * - 같은 vv면 syncLatest(같은 고침)
 * - 서로 모르는 고침이 있으면: 글(지운 것 포함)이 같으면 syncLatest, 다르면 CONFLICT
 * 부르는 쪽은 충돌이 아니면 결과 행의 vv를 maxVv(두 쪽 effectiveVv)로 쓰고, 충돌을 고른 결과는 그 위에 이 기기를 stampVv한다
 */
export function syncMemo(local, lvv, other, ovv) {
  if (!other) return KEEP_LOCAL;
  if (!local) return TAKE_OTHER;
  const l = effectiveVv(lvv, local.updatedAt);
  const o = effectiveVv(ovv, other.updatedAt);
  if (onlyLegacy(l) && onlyLegacy(o)) {
    if (sameMemo(local, other)) return syncLatest(local, other);
    const c = memo(rec(local.updatedAt, local.deleted, valueAt(local, 0)), rec(other.updatedAt, other.deleted, valueAt(other, 0)));
    // 복구 규칙은 시각이 같으면 지금 것이라, 지운 쪽과 산 쪽이 같은 시각이면 syncLatest로 정한다
    if (c !== CONFLICT && (local.deleted || other.deleted) && local.updatedAt === other.updatedAt) return syncLatest(local, other);
    return c;
  }
  switch (compareVv(l, o)) {
    case VV_LOCAL_NEWER: return KEEP_LOCAL;
    case VV_OTHER_NEWER: return TAKE_OTHER;
    case VV_EQUAL: return syncLatest(local, other);
    default: return sameMemo(local, other) ? syncLatest(local, other) : CONFLICT;
  }
}

/**
 * 역본 순서(ver_setting)를 목록째 합친다(앱 syncVerOrder, 6절 (가)). 역본 코드를 차례대로 돌려준다.
 * 이기는 목록: 행들의 updated_at 최댓값이 가장 큰 기기, 같으면 기기ID가 큰 쪽(빈 목록은 빼고).
 * 결과: 이긴 목록의 살아 있는 역본을 ver_order(같으면 코드) 순으로, 그 뒤에 이긴 목록에는 살아 있지 않지만
 * 다른 목록에서 살아 있는 역본을 코드 순으로(지우지 않음, 5a)
 * @param lists 기기ID(이 기기 포함) → 그 기기의 행 전체(지운 행 포함) [{ver, ver_order, updated_at, deleted}]
 */
export function syncVerOrder(lists) {
  let winner = null, best = -Infinity;
  for (const [device, rows] of Object.entries(lists)) {
    if (!rows.length) continue;
    const max = rows.reduce((m, r) => Math.max(m, Number(r.updated_at) || 0), -Infinity);
    if (winner === null || max > best || (max === best && device > winner)) {
      winner = device;
      best = max;
    }
  }
  const out = [];
  if (winner === null) return out;
  const win = lists[winner].filter((r) => !Number(r.deleted))
    .sort((a, b) => (a.ver_order !== b.ver_order ? a.ver_order - b.ver_order : a.ver < b.ver ? -1 : a.ver > b.ver ? 1 : 0));
  for (const r of win) if (!out.includes(r.ver)) out.push(r.ver);
  const rest = new Set();
  for (const rows of Object.values(lists)) for (const r of rows) if (!Number(r.deleted) && !out.includes(r.ver)) rest.add(r.ver);
  out.push(...[...rest].sort((a, b) => (a < b ? -1 : a > b ? 1 : 0)));
  return out;
}
