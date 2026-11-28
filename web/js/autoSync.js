// 자동 동기화(3단계)의 때 맞추기. DOM·드라이브 없이(시험하려고): 언제 돌지, 한 번에 하나만, 도는 중 바뀌면 끝나고 한 번 더.
// 동기화 자체(sync.js syncOnce)와 토큰·화면은 부르는 쪽(syncUi.js)이 넘긴다.
//
// - 데이터를 고치면 DEBOUNCE_MS 모았다가 한 번(메모를 여러 절 이어 쓸 때 매번 올리지 않게). 화면을 떠나면 모은 것을 바로
// - 열 때·다시 볼 때·인터넷이 돌아올 때 받는다. 단 MIN_INTERVAL_MS 안에 이미 돌았으면 건너뛴다(탭을 자주 오갈 때)
// - 웹은 구글 토큰이 1시간짜리이고 새로 받으려면 사용자가 눌러야 한다(누르지 않은 팝업은 브라우저가 막는다).
//   토큰이 없으면 돌지 않고 'needsTap'을 알린다. 화면은 "누르면 동기화" 띠를 보이고, 누르면 tap()으로 다시
// - 자동으로 돌 때는 메모 충돌을 묻지 않는다(읽는 도중 창이 뜨지 않게): 'conflicts'를 알리고 띠를 눌러야 고른다.
//   고르기 전에는 내 data 파일을 올리지 않는다(sync.js, 앱과 같다)
// 웹은 페이지가 열려 있는 동안만 동기화한다(백그라운드 동기화는 사파리에 없어 기대지 않는다)

export const DEBOUNCE_MS = 3000;
export const MIN_INTERVAL_MS = 60 * 1000;

/**
 * @param o.runSync ({ interactive, reason }) => Promise<결과> syncOnce 한 번. interactive면 메모 충돌을 묻는다.
 *   토큰이 끝나 실패하면 err.status === 401인 오류를 던진다
 * @param o.hasToken () => boolean 지금 쓸 수 있는 토큰이 있는가
 * @param o.onState (state, info) => void  state: 'off' | 'needsTap' | 'running' | 'ok' | 'conflicts'(info: 남은 수) | 'error'(info: 오류)
 * @param o.timers { setTimeout, clearTimeout, now } 시험에서 가짜를 넣으려고
 */
export function createAutoSync({ runSync, hasToken, onState = () => {}, timers = globalThis, debounceMs = DEBOUNCE_MS, minIntervalMs = MIN_INTERVAL_MS }) {
  const now = timers.now ?? (() => Date.now());
  let enabled = false;
  let running = false;
  let again = null; // 도는 중에 또 돌 일이 생기면 그 까닭
  let timer = null; // 데이터를 고친 뒤 모으는 중
  let lastRun = -Infinity;
  let state = 'off';

  const set = (s, info) => {
    state = s;
    onState(s, info);
  };

  async function run(reason, interactive = false) {
    if (!enabled) return null;
    if (running) {
      again = again ?? reason;
      return null;
    }
    if (!hasToken()) {
      set('needsTap');
      return null;
    }
    running = true;
    lastRun = now();
    set('running');
    let result = null;
    try {
      result = await runSync({ interactive, reason });
      if (result?.left) set('conflicts', result.left);
      else set('ok');
    } catch (e) {
      if (e?.status === 401) set('needsTap'); // 토큰이 끝났다: 눌러서 다시 받는다
      else set('error', e); // 인터넷 등. 다음 때(고침·다시 볼 때·온라인)에 다시 돈다
    } finally {
      running = false;
    }
    if (again && enabled) {
      const r = again;
      again = null;
      run(r);
    }
    return result;
  }

  function flush() {
    if (!timer) return;
    timers.clearTimeout(timer);
    timer = null;
    run('changed');
  }

  return {
    get state() { return state; },
    get enabled() { return enabled; },

    /**
     * 켜기(동기화 사용을 켤 때, 또는 켜 둔 채로 열 때). 열 때도 받으므로 바로 한 번 돈다(토큰이 없으면 띠).
     * interactive: 켜는 자리에서 메모 충돌을 바로 묻는다(사용자가 지켜보고 있으므로)
     */
    start({ interactive = false } = {}) {
      enabled = true;
      return run('start', interactive);
    },

    stop() {
      enabled = false;
      again = null;
      if (timer) timers.clearTimeout(timer);
      timer = null;
      set('off');
    },

    /** 사용자 데이터를 고쳤다(동기화가 쓴 것은 빼고). 모았다가 한 번 */
    changed() {
      if (!enabled) return;
      if (timer) timers.clearTimeout(timer);
      timer = timers.setTimeout(() => {
        timer = null;
        run('changed');
      }, debounceMs);
    },

    /** 화면을 다시 볼 때·인터넷이 돌아올 때. 방금 돌았으면 건너뛴다(모아 둔 고침이 있으면 그것부터) */
    visible(reason = 'visible') {
      if (!enabled) return null;
      if (timer) return flush();
      if (state !== 'needsTap' && state !== 'error' && now() - lastRun < minIntervalMs) return null;
      return run(reason);
    },

    /** 화면을 떠난다: 모아 둔 고침을 바로 올린다(닫히기 전에) */
    hidden() {
      if (enabled) flush();
    },

    /** 띠를 눌렀다(토큰을 새로 받은 뒤). 메모 충돌도 이때 묻는다 */
    tap() {
      if (timer) {
        timers.clearTimeout(timer);
        timer = null;
      }
      return run('tap', true);
    },
  };
}
