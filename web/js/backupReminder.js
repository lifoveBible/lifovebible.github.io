// '오래 백업 안 함' 알림을 띄울지 정한다. DOM·저장소 없이(테스트하려고).
// 앱은 본문 화면을 나올 때 다운로드 폴더에 저절로 백업하지만(데이터 자동 백업), 브라우저는 사용자가 누르지 않으면
// 파일을 저장할 수 없다. 그래서 자동 백업 대신 알린다. 웹 기록은 사이트 데이터를 지우면 사라지므로(CLAUDE.md)

export const DAY = 24 * 60 * 60 * 1000;
export const REMIND_DAYS = 7; // 마지막 백업 뒤 이만큼 지나면 알린다(사용자와 정함, 2026-11-26)
export const SNOOZE_DAYS = 7; // [나중에]를 누르면 이만큼 묻지 않는다

/**
 * 알릴 것이 있으면 { days, never }, 없으면 null.
 * - 기록(형광펜·메모·책갈피·읽음·메모책)이 하나도 없으면 알리지 않는다(쓰지 않는 사람을 귀찮게 하지 않게)
 * - 마지막 백업 뒤에 바뀐 기록(지운 것도)이 없으면 알리지 않는다(새로 백업해도 같은 파일이라)
 * - 기준은 마지막 백업 시각, 백업한 적이 없으면 가장 오래된 기록의 시각. 그로부터 REMIND_DAYS가 지나야 한다
 * - [나중에]로 미룬 동안은 알리지 않는다
 * - 구글 드라이브 동기화를 켜 두고 REMIND_DAYS 안에 동기화를 마쳤으면 알리지 않는다(기록이 본인 드라이브에도 있다. 2026-11-28 사용자)
 * 기본 메모책 행은 시각이 0(고친 적 없음)이라 저절로 빠진다
 * @param {Object<string, object[]>} data userStore.allUserData()
 * @param {{lastBackup?: number, snoozeUntil?: number, lastSync?: number}} state lastSync: 동기화를 켰을 때 마지막으로 마친 시각(껐으면 0)
 */
export function backupReminder(data, { lastBackup = 0, snoozeUntil = 0, lastSync = 0 } = {}, now = Date.now()) {
  if (lastSync > 0 && now - lastSync < REMIND_DAYS * DAY) return null;
  let newest = 0, oldest = Infinity, alive = false;
  for (const rows of Object.values(data || {})) {
    for (const r of rows || []) {
      const t = Number(r.updated_at) || 0;
      if (t <= 0) continue;
      if (t > newest) newest = t;
      if (!Number(r.deleted)) {
        alive = true;
        if (t < oldest) oldest = t;
      }
    }
  }
  if (!alive || newest <= lastBackup) return null;
  if (now < snoozeUntil) return null;
  const base = lastBackup || oldest;
  const days = Math.floor((now - base) / DAY);
  if (days < REMIND_DAYS) return null;
  return { days, never: !lastBackup };
}
