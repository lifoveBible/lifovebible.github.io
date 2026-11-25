// 화면 문구. 지금은 ko/en만 둔다(나머지 언어는 8단계).
// 앱 strings.xml에 있는 문구는 그대로 썼다(주석에 앱 이름). 나머지는 웹에서 새로 만든 문구.

const STRINGS = {
  ko: {
    listLoading: '목록 받는 중…',
    listFailed: '역본 목록을 받지 못했습니다',
    downloading: '다운로드 중...', // text_downloading
    missingVerse: '(없음)', // text_not_exist_verses
    ot: '구약', // text_ot
    nt: '신약', // text_nt
    textSize: '본문 글자 크기', // text_pref_textsize_preferences
    smaller: '작게',
    larger: '크게',
    prev: '이전 장',
    next: '다음 장',
    pickBook: '책 고르기',
    pickChapter: '장 고르기',
    backToBooks: '책 목록',
    close: '닫기',
    version: '역본',
    pickVersions: '역본대조보기', // menu_sel_ver
    pickVersionsHint: '여러 역본을 고르면 나란히 봅니다. 고른 순서대로 놓입니다.',
    oneColumn: '역본대조를 1단으로 보기', // text_pref_multilayout_preference
    ok: '확인', // alert_dialog_ok
    cancel: '취소', // alert_dialog_cancel
    delete: '삭제', // menu_delete
    downloaded: '받음',
    deleteConfirm: (name) => `받아 둔 "${name}" 파일을 지울까요? 다시 고르면 다시 받습니다.`,
    listOld: '역본 목록을 새로 받지 못해 전에 받은 목록을 보입니다',
    updateReady: '새 버전이 있습니다',
    updateApply: '새로 고침',
    noChapter: '이 역본에는 이 장이 없습니다',
    loadFailed: '본문을 불러오지 못했습니다',
    ref: (book, chapter) => `${book} ${chapter}장`,
    importFiles: '파일 넣기',
    importFolder: '폴더 넣기',
    importHint: '가지고 있는 성경 파일(.lfa, .bdf)을 넣거나 화면에 끌어다 놓을 수 있습니다. 앱에서 내보낸 다운로드/LifoveBible/bible 폴더를 그대로 넣어도 됩니다.',
    importing: '넣는 중...',
    imported: (names) => `넣었습니다: ${names}`,
    importFailed: (items) => `넣지 못했습니다: ${items}`,
    importNone: '성경 파일(.lfa, .bdf)을 찾지 못했습니다',
    reasons: {
      notZip: '열 수 없는 파일',
      noChapters: '장 파일이 없음',
      badText: '본문 형식이 다름',
      storeFailed: '저장 실패',
    },
    localGroup: '직접 넣은 역본',
    localBadge: '직접 넣음',
    deleteLocalConfirm: (name) => `직접 넣은 "${name}"을(를) 지울까요? 다시 보려면 파일을 다시 넣어야 합니다.`,
    localMissing: '직접 넣은 파일이 없어졌습니다. 파일을 다시 넣어 주세요',
    dropHere: '여기에 놓으면 성경 파일(.lfa, .bdf)을 넣습니다',
    search: '검색', // label_search
    keywordA: '검색어A', // txt_hint_search
    keywordB: '검색어B', // txt_hint_search2
    searchRange: '검색 범위',
    searchVersion: '검색할 역본',
    themes: '주제별',
    rangeAll: '전체', // text_total
    themeNames: { // text_moses ~ text_rev
      moses: '모세오경(창,출,레,민,신)',
      hist: '역사서(여호수아-에스더)',
      poet: '시가서(욥,시,잠,전,아)',
      majProphet: '대선지서(사,렘,애,겔,단)',
      mnrProphet: '소선지서(호세아-말라기)',
      gospel: '복음서(마,막,눅,요)',
      ntHist: '신약역사서(행)',
      paulLetter: '바울서신전체(로마서-빌레몬서)',
      genLetter: '-일반서신(롬,고전/후,갈,살전/후)',
      prisonLetter: '-옥중서신(엡,빌,골,몬)',
      pastorLetter: '-목회서신(딤전/후,딛)',
      comLetter: '공동서신(히,약,벧전/후,요한123,유)',
      rev: '예언서(계)',
    },
    keywordRequired: '검색어A를 입력하세요.', // text_search_keyword_required
    keywordTooShort: '검색어A에 두 글자 이상 입력하세요.', // text_search_keyword_too_short
    searching: (book) => `검색중입니다. ${book}`, // text_searching
    noResult: '검색 결과가 없습니다.', // text_no_search_result
    found: (n) => `총 ${n}개 절을 찾았습니다.`, // text_total_count + text_found_verses
    searchCanceled: (n) => `검색이 취소 되었습니다. ${n}개 절을 찾았습니다.`, // text_search_canceled
    searchFailed: '검색하지 못했습니다',
    stop: '중지',
    more: (n) => `더 보기 (${n}개 남음)`,
    verseRef: (book, chapter, verse) => `${book} ${chapter}:${verse}`,
  },
  en: {
    listLoading: 'Loading list…',
    listFailed: 'Could not load the Bible list',
    downloading: 'Downloading...',
    missingVerse: '(None)',
    ot: 'Old Testament',
    nt: 'New Testament',
    textSize: 'Text Size',
    smaller: 'Smaller',
    larger: 'Larger',
    prev: 'Previous chapter',
    next: 'Next chapter',
    pickBook: 'Choose a book',
    pickChapter: 'Choose a chapter',
    backToBooks: 'Books',
    close: 'Close',
    version: 'Version',
    pickVersions: 'Parallel Viewer',
    pickVersionsHint: 'Choose several versions to read them side by side, in the order you choose them.',
    oneColumn: 'Compare translations in one column',
    ok: 'OK',
    cancel: 'Cancel',
    delete: 'Delete',
    downloaded: 'Downloaded',
    deleteConfirm: (name) => `Delete the downloaded "${name}"? It will be downloaded again when you choose it.`,
    listOld: 'Could not load the latest list. Showing the list from before',
    updateReady: 'A new version is available',
    updateApply: 'Reload',
    noChapter: 'This chapter is not in this version',
    loadFailed: 'Could not load the text',
    ref: (book, chapter) => `${book} ${chapter}`,
    importFiles: 'Add files',
    importFolder: 'Add folder',
    importHint: 'Add Bible files you have (.lfa, .bdf), or drag them onto the page. You can also add the Download/LifoveBible/bible folder exported from the app.',
    importing: 'Adding...',
    imported: (names) => `Added: ${names}`,
    importFailed: (items) => `Could not add: ${items}`,
    importNone: 'No Bible files (.lfa, .bdf) found',
    reasons: {
      notZip: 'cannot open the file',
      noChapters: 'no chapter files',
      badText: 'unknown text format',
      storeFailed: 'could not save',
    },
    localGroup: 'Added by you',
    localBadge: 'Added',
    deleteLocalConfirm: (name) => `Delete "${name}" that you added? You will need to add the file again to read it.`,
    localMissing: 'The file you added is gone. Please add it again',
    dropHere: 'Drop here to add Bible files (.lfa, .bdf)',
    search: 'Search',
    keywordA: 'Keyword A',
    keywordB: 'Keyword B',
    searchRange: 'Search range',
    searchVersion: 'Version to search',
    themes: 'Groups',
    rangeAll: 'All',
    themeNames: {
      moses: 'Pentateuch',
      hist: 'History',
      poet: 'Wisdom',
      majProphet: 'Major Prophets',
      mnrProphet: 'Minor Prophets',
      gospel: 'Gospels',
      ntHist: 'NT History(Act)',
      paulLetter: "Paul's epistles",
      genLetter: "-Paul's General Epistles",
      prisonLetter: '-Prison epistles',
      pastorLetter: '-Pastoral epistles',
      comLetter: 'General Epistles',
      rev: 'Apocalyptic literature(Rev.)',
    },
    keywordRequired: 'Enter a word in Keyword A.',
    keywordTooShort: 'Enter at least two letters in Keyword A.',
    searching: (book) => `Searching... ${book}`,
    noResult: 'No results!',
    found: (n) => `${n} verses found.`,
    searchCanceled: (n) => `Search canceled. ${n} verses found.`,
    searchFailed: 'Could not search',
    stop: 'Stop',
    more: (n) => `Show more (${n} left)`,
    verseRef: (book, chapter, verse) => `${book} ${chapter}:${verse}`,
  },
};

/** 브라우저 언어로 고른다. 한국어가 아니면 영어 */
export function pickLang(languages) {
  for (const l of languages || []) {
    if (l.toLowerCase().startsWith('ko')) return 'ko';
    if (l.toLowerCase().startsWith('en')) return 'en';
  }
  return 'en';
}

export function stringsFor(lang) {
  return STRINGS[lang] || STRINGS.en;
}
