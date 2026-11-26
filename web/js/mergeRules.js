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
