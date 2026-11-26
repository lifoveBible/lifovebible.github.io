// 성경 66권의 이름과 장 수, 읽는 위치 계산.
// 장 수는 앱 Util.numOfChapters, 이름은 앱 res/values/booknamelist_array.xml의 KOR, ENG, JPN 등을 그대로 옮겼다.
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
  ja: [ // 앱 JPN
    '創世記', '出エジプト記', 'レビ記', '民数記', '申命記',
    'ヨシュア記', '士師記', 'ルツ記', 'サムエル記第一', 'サムエル記第二',
    '列王記第一', '列王記第二', '歴代誌第一', '歴代誌第二', 'エズラ記',
    'ネヘミヤ記', 'エステル記', 'ヨブ記', '詩篇', '箴言',
    '伝道者の書', '雅歌', 'イザヤ書', 'エレミヤ書', '哀歌',
    'エゼキエル書', 'ダニエル書', 'ホセア書', 'ヨエル書', 'アモス書',
    'オバデヤ書', 'ヨナ書', 'ミカ書', 'ナホム書', 'ハバクク書',
    'ゼパニヤ書', 'ハガイ書', 'ゼカリヤ書', 'マラキ書',
    'マタイの福音書', 'マルコの福音書', 'ルカの福音書', 'ヨハネの福音書', '使徒の働き',
    'ローマ人への手紙', 'コリント第一', 'コリント第二', 'ガラテヤ', 'エペソ',
    'ピリピ', 'コロサイ', 'テサロニケ第一', 'テサロニケ第二', 'テモテ第一',
    'テモテ第二', 'テトス', 'ピレモン', 'ヘブル', 'ヤコブ',
    'ペテロ第一', 'ペテロ第二', 'ヨハネ第一', 'ヨハネ第二', 'ヨハネ第三',
    'ユダ', '黙示録',
  ],
  zh: [ // 앱 CHN_TRAD
    '創世記', '出埃及記', '利未記', '民數記', '申命記',
    '約書亞記', '士師記', '路得記', '撒母耳記上', '撒母耳記下',
    '列王紀上', '列王紀下', '歷代志上', '歷代志下', '以斯拉記',
    '尼希米記', '以斯帖記', '約伯記', '詩篇', '箴言',
    '傳道書', '雅歌', '以賽亞書', '耶利米書', '耶利米哀歌',
    '以西結書', '但以理書', '何西阿書', '約珥書', '阿摩司書',
    '俄巴底亞書', '約拿書', '彌迦書', '那鴻書', '哈巴谷書',
    '西番雅書', '哈該書', '撒迦利亞書', '瑪拉基書',
    '馬太福音', '馬可福音', '路加福音', '約翰福音', '使徒行傳',
    '羅馬書', '哥林多前書', '哥林多後書', '加拉太書', '以弗所書',
    '腓立比書', '歌羅西書', '帖撒羅尼迦前書', '帖撒羅尼迦後書', '提摩太前書',
    '提摩太後書', '提多書', '腓利門書', '希伯來書', '雅各書',
    '彼得前書', '彼得後書', '約翰一書', '約翰二書', '約翰三書',
    '猶大書', '啟示錄',
  ],
  'zh-CN': [ // 앱 CHN_SIMP(번체를 t2s로 바꾼 것과 같다. 앱의 '帖撒罗尼迦後书'·'提摩太後书'는 '后'로 맞춤)
    '创世记', '出埃及记', '利未记', '民数记', '申命记',
    '约书亚记', '士师记', '路得记', '撒母耳记上', '撒母耳记下',
    '列王纪上', '列王纪下', '历代志上', '历代志下', '以斯拉记',
    '尼希米记', '以斯帖记', '约伯记', '诗篇', '箴言',
    '传道书', '雅歌', '以赛亚书', '耶利米书', '耶利米哀歌',
    '以西结书', '但以理书', '何西阿书', '约珥书', '阿摩司书',
    '俄巴底亚书', '约拿书', '弥迦书', '那鸿书', '哈巴谷书',
    '西番雅书', '哈该书', '撒迦利亚书', '玛拉基书',
    '马太福音', '马可福音', '路加福音', '约翰福音', '使徒行传',
    '罗马书', '哥林多前书', '哥林多后书', '加拉太书', '以弗所书',
    '腓立比书', '歌罗西书', '帖撒罗尼迦前书', '帖撒罗尼迦后书', '提摩太前书',
    '提摩太后书', '提多书', '腓利门书', '希伯来书', '雅各书',
    '彼得前书', '彼得后书', '约翰一书', '约翰二书', '约翰三书',
    '犹大书', '启示录',
  ],
  es: [ // 앱 SPA
    'Génesis', 'Éxodo', 'Levítico', 'Números', 'Deuteronomio',
    'Josué', 'Jueces', 'Rut', '1 Samuel', '2 Samuel',
    '1 Reyes', '2 Reyes', '1 Crónicas', '2 Crónicas', 'Esdras',
    'Nehemías', 'Ester', 'Job', 'Salmos', 'Proverbios',
    'Eclesiastés', 'Cantares', 'Isaías', 'Jeremías', 'Lamentaciones',
    'Ezequiel', 'Daniel', 'Oseas', 'Joel', 'Amós',
    'Abdías', 'Jonás', 'Miqueas', 'Nahúm', 'Habacuc',
    'Sofonías', 'Hageo', 'Zacarías', 'Malaquías',
    'Mateo', 'Marcos', 'Lucas', 'Juan', 'Hechos',
    'Romanos', '1 Corintios', '2 Corintios', 'Gálatas', 'Efesios',
    'Filipenses', 'Colosenses', '1 Tesal.', '2 Tesal.', '1 Timoteo',
    '2 Timoteo', 'Tito', 'Filemón', 'Hebreos', 'Santiago',
    '1 Pedro', '2 Pedro', '1 Juan', '2 Juan', '3 Juan',
    'Judas', 'Apocalipsis',
  ],
  pt: [ // 앱 POR
    'Gênesis', 'Êxodo', 'Levítico', 'Números', 'Deuteronômio',
    'Josué', 'Juízes', 'Rute', '1 Samuel', '2 Samuel',
    '1 Reis', '2 Reis', '1 Crônicas', '2 Crônicas', 'Esdras',
    'Neemias', 'Ester', 'Jó', 'Salmos', 'Provérbios',
    'Eclesiastes', 'Cânticos', 'Isaías', 'Jeremias', 'Lamentações',
    'Ezequiel', 'Daniel', 'Oseias', 'Joel', 'Amós',
    'Obadias', 'Jonas', 'Miqueias', 'Naum', 'Habacuque',
    'Sofonias', 'Ageu', 'Zacarias', 'Malaquias',
    'Mateus', 'Marcos', 'Lucas', 'João', 'Atos',
    'Romanos', '1 Coríntios', '2 Coríntios', 'Gálatas', 'Efésios',
    'Filipenses', 'Colossenses', '1 Tessal.', '2 Tessal.', '1 Timóteo',
    '2 Timóteo', 'Tito', 'Filemom', 'Hebreus', 'Tiago',
    '1 Pedro', '2 Pedro', '1 João', '2 João', '3 João',
    'Judas', 'Apocalipse',
  ],
  fr: [ // 앱에 프랑스어 목록이 없어 루이 스공(Segond) 성경의 이름을 썼다
    'Genèse', 'Exode', 'Lévitique', 'Nombres', 'Deutéronome',
    'Josué', 'Juges', 'Ruth', '1 Samuel', '2 Samuel',
    '1 Rois', '2 Rois', '1 Chroniques', '2 Chroniques', 'Esdras',
    'Néhémie', 'Esther', 'Job', 'Psaumes', 'Proverbes',
    'Ecclésiaste', 'Cantique', 'Ésaïe', 'Jérémie', 'Lamentations',
    'Ézéchiel', 'Daniel', 'Osée', 'Joël', 'Amos',
    'Abdias', 'Jonas', 'Michée', 'Nahum', 'Habacuc',
    'Sophonie', 'Aggée', 'Zacharie', 'Malachie',
    'Matthieu', 'Marc', 'Luc', 'Jean', 'Actes',
    'Romains', '1 Corinthiens', '2 Corinthiens', 'Galates', 'Éphésiens',
    'Philippiens', 'Colossiens', '1 Thessaloniciens', '2 Thessaloniciens', '1 Timothée',
    '2 Timothée', 'Tite', 'Philémon', 'Hébreux', 'Jacques',
    '1 Pierre', '2 Pierre', '1 Jean', '2 Jean', '3 Jean',
    'Jude', 'Apocalypse',
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
