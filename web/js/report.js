// 본문 오류 신고 메일(DOM 없음). 앱 Util.sendVerseErrorReport·sendReportMail과 같은 꼴:
//   제목 "[본문 오류] Lifove Bible - 창세기 1장"
//   본문 안내 문구, 빈 줄 넷, "----------", 고른 절, 빈 줄, "System Information"과 정보 줄
// 앱이 본문을 직접 고치게 하지 않는 까닭(잘못 고친 본문이 퍼질 수 있고 저작권 역본은 고칠 수 없음)은 웹도 같다.
// 앱과 다른 점: 앱은 기기 모델·저장 공간·오류 기록·역본 파일 날짜를 적는다. 웹은 브라우저가 알려 주는 것만
// (User-Agent, 웹 앱 버전, 언어, 역본). 받은 역본 파일의 날짜는 Cache Storage에 남기지 않아 적지 못한다

export const REPORT_TO = 'bible@lifove.net';
// mailto: 주소가 너무 길면 일부 메일 앱이 본문을 자른다(앱 MAX_REPORTED_VERSE_CHARS와 같다)
export const MAX_REPORTED_VERSE_CHARS = 2000;

/**
 * @param {{subject: string, ref: string, guide: string, verses: string, info: [string, string][]}} r
 *   subject 앱 text_verse_error_subject, ref 장 이름(S.ref), guide 안내 문구,
 *   verses 고른 절 글(verseCopy.formatVerses, 없으면 빈 글), info [이름, 값] 줄들
 * @returns {{subject: string, body: string, url: string}}
 */
export function verseErrorMail({ subject, ref, guide, verses, info }) {
  const fullSubject = `${subject} - ${ref}`;
  let v = (verses || '').trim() || ref; // 고른 절이 없으면 장 이름만
  if (v.length > MAX_REPORTED_VERSE_CHARS) v = v.slice(0, MAX_REPORTED_VERSE_CHARS) + '\n…';
  const body = `${guide}\n\n\n\n\n----------\n${v}\n\nSystem Information`
    + info.map(([k, val]) => `\n${k}: ${val}`).join('');
  // mailto 본문의 줄바꿈은 CRLF(RFC 6068). LF만 넣으면 줄을 붙여 버리는 메일 앱이 있다
  const url = `mailto:${REPORT_TO}?subject=${encodeURIComponent(fullSubject)}`
    + `&body=${encodeURIComponent(body.replace(/\n/g, '\r\n'))}`;
  return { subject: fullSubject, body, url };
}
