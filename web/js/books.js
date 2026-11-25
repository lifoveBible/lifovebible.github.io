// 성경 66권의 이름과 장 수, 읽는 위치 계산.
// 장 수는 앱 Util.numOfChapters, 이름은 앱 res/values/booknamelist_array.xml의 KOR, ENG를 그대로 옮겼다.
// 위치는 { book: 0~65, chapter: 1~ } 로 다룬다(책은 데이터 파일처럼 0부터가 아니라 화면에 보일 때만 +1).

export const BOOK_COUNT = 66;
export const OT_COUNT = 39; // 창세기~말라기

export const CHAPTERS = [
  50, 40, 27, 36, 34, 24, 21, 4, 31, 24,
  22, 25, 29, 36, 10, 13, 10, 42, 150, 31,
  12, 8, 66, 52, 5, 48, 12, 14, 3, 9,
  1, 4, 7, 3, 3, 3, 2, 14, 4,
  28, 16, 24, 21, 28, 16, 16, 13, 6, 6,
  4, 4, 5, 3, 6, 4, 3, 1, 13, 5,
  5, 3, 5, 1, 1, 1, 22,
];

const NAMES = {
  ko: [
    '창세기', '출애굽기', '레위기', '민수기', '신명기',
    '여호수아', '사사기', '룻기', '사무엘상', '사무엘하',
    '열왕기상', '열왕기하', '역대상', '역대하', '에스라',
    '느헤미야', '에스더', '욥기', '시편', '잠언',
    '전도서', '아가', '이사야', '예레미야', '예레미야 애가',
    '에스겔', '다니엘', '호세아', '요엘', '아모스',
    '오바댜', '요나', '미가', '나훔', '하박국',
    '스바냐', '학개', '스가랴', '말라기',
    '마태복음', '마가복음', '누가복음', '요한복음', '사도행전',
    '로마서', '고린도전서', '고린도후서', '갈라디아서', '에베소서',
    '빌립보서', '골로새서', '데살로니가전서', '데살로니가후서', '디모데전서',
    '디모데후서', '디도서', '빌레몬서', '히브리서', '야고보서',
    '베드로전서', '베드로후서', '요한1서', '요한2서', '요한3서',
    '유다서', '요한계시록',
  ],
  en: [
    'Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy',
    'Joshua', 'Judges', 'Ruth', '1 Samuel', '2 Samuel',
    '1 Kings', '2 Kings', '1 Chronicles', '2 Chronicles', 'Ezra',
    'Nehemiah', 'Esther', 'Job', 'Psalms', 'Proverbs',
    'Ecclesiastes', 'Song of Songs', 'Isaiah', 'Jeremiah', 'Lamentations',
    'Ezekiel', 'Daniel', 'Hosea', 'Joel', 'Amos',
    'Obadiah', 'Jonah', 'Micah', 'Nahum', 'Habakkuk',
    'Zephaniah', 'Haggai', 'Zechariah', 'Malachi',
    'Matthew', 'Mark', 'Luke', 'John', 'Acts',
    'Romans', '1 Corinthians', '2 Corinthians', 'Galatians', 'Ephesians',
    'Philippians', 'Colossians', '1 Thessalo.', '2 Thessalo.', '1 Timothy',
    '2 Timothy', 'Titus', 'Philemon', 'Hebrews', 'James',
    '1 Peter', '2 Peter', '1 John', '2 John', '3 John',
    'Jude', 'Revelation',
  ],
};

/** 책 이름 목록. 없는 언어는 영어 */
export function bookNames(lang) {
  return NAMES[lang] || NAMES.en;
}

/** 올바른 위치인가 */
export function isValidPosition(pos) {
  return pos != null
    && Number.isInteger(pos.book) && pos.book >= 0 && pos.book < BOOK_COUNT
    && Number.isInteger(pos.chapter) && pos.chapter >= 1 && pos.chapter <= CHAPTERS[pos.book];
}

/** 다음 장. 책 끝이면 다음 책 1장, 요한계시록 끝이면 null */
export function nextChapter({ book, chapter }) {
  if (chapter < CHAPTERS[book]) return { book, chapter: chapter + 1 };
  if (book + 1 < BOOK_COUNT) return { book: book + 1, chapter: 1 };
  return null;
}

/** 이전 장. 책 처음이면 앞 책 마지막 장, 창세기 1장이면 null */
export function prevChapter({ book, chapter }) {
  if (chapter > 1) return { book, chapter: chapter - 1 };
  if (book > 0) return { book: book - 1, chapter: CHAPTERS[book - 1] };
  return null;
}

// 주소 뒤 "#43:3"(요한복음 3장)으로 위치를 나타낸다. 책 번호는 데이터 파일처럼 1부터.
// 뒤로 가기 버튼과 링크 공유가 되게 하려고 썼다.

/** "#43:3" → { book: 42, chapter: 3 }. 틀린 값이면 null */
export function parseHash(hash) {
  const m = /^#?(\d{1,2}):(\d{1,3})$/.exec(hash || '');
  if (!m) return null;
  const pos = { book: Number(m[1]) - 1, chapter: Number(m[2]) };
  return isValidPosition(pos) ? pos : null;
}

/** { book: 42, chapter: 3 } → "#43:3" */
export function formatHash({ book, chapter }) {
  return '#' + (book + 1) + ':' + chapter;
}
