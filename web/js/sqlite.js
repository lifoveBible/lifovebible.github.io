// sql.js를 처음 쓸 때 한 번만 불러온다(백업 창에서만 쓰므로 앱을 열 때 받지 않게).
// sql.js는 ES 모듈 판이 없어 <script>로 넣고 전역 initSqlJs를 쓴다. 파일은 서비스 워커가 따로 캐시(lifove-vendor)에 둔다

/** sql.js 폴더(index.html 기준). 판을 바꾸면 폴더 이름도 바꾼다(서비스 워커가 같은 경로는 다시 받지 않음) */
export const SQLJS_DIR = 'vendor/sqljs-1.14.2/';

let loading = null;

/** sql.js 모듈(initSqlJs 결과). 실패하면 다음에 다시 시도할 수 있게 비운다 */
export function loadSqlJs() {
  if (!loading) {
    loading = new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = SQLJS_DIR + 'sql-wasm.js';
      s.onload = resolve;
      s.onerror = () => reject(new Error('sql.js load failed'));
      document.head.append(s);
    })
      .then(() => globalThis.initSqlJs({ locateFile: (f) => SQLJS_DIR + f }))
      .catch((e) => { loading = null; throw e; });
  }
  return loading;
}
