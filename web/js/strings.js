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
    pickOneVersion: '다른성경보기', // menu_sel_one_ver
    barBottom: '책·장 바를 아래에 표시', // text_pref_header_bottom에서 "절"을 뺐다(웹에는 절 버튼이 없다)
    viewerSettings: '본문화면설정', // text_title_pref_1
    groupScreen: '화면 구성', // pref_group_screen
    groupColors: '색', // pref_group_colors
    oneColumnHint: '끄면 화면 폭에 맞춰 2단 이상으로 나란히 봅니다. 넓은 화면에서는 여러 역본이 한 줄에 섭니다.',
    showVerName: '역본명 보이기', // 앱은 반대 뜻의 "여백 및 역본명 제거"(text_pref_nomargin_preferences)
    showVerNameHint: '여러 역본을 볼 때 칸마다 역본 이름을 보입니다.',
    fontColor: '글자색', // text_pref_fontcolor
    bgColor: '배경색', // text_pref_bgcolor
    colorPresets: { light: '밝게', dark: '어둡게', sepia: '세피아', green: '연두' },
    colorSample: '태초에 하나님이 천지를 창조하시니라',
    colorReset: '기본 색으로',
    groupNav: '이동과 터치', // pref_group_navigation
    navBar: '이동 버튼 표시', // text_pref_navigation_bar_preference
    navBarHint: '본문 위에 이동 버튼을 보입니다.',
    navPos: '이동 버튼 위치', // 웹에만 있는 설정
    navPositions: {
      'right-middle': '오른쪽 가운데',
      'right-bottom': '오른쪽 아래',
      'left-middle': '왼쪽 가운데',
      'left-bottom': '왼쪽 아래',
    },
    navBarOptions: { // entries_navigation_bar (값은 앱 entryvalues_navigation_bar)
      1: '네비게이션바 숨기기',
      2: '한 화면 이동 버튼',
      3: '장 이동 버튼',
      5: '최근목록 이동 버튼',
      4: '화면 + 장 이동 버튼',
      6: '화면 + 최근목록 이동 버튼',
      7: '장 + 최근목록 이동 버튼',
      8: '화면 + 장 + 최근목록 이동 버튼',
    },
    navUnit: '위·아래 버튼으로 이동', // 앱은 "볼륨키로 이동"(text_pref_volumekey_preference)을 따른다
    navUnits: { verse: '한 절 이동', page: '한 화면(여러절) 이동', chapter: '한 장 이동' }, // entries_volumekey
    navUp: '위로',
    navDown: '아래로',
    navBack: '최근목록 뒤로',
    navForward: '최근목록 앞으로',
    downAgain: '아래 버튼을 한 번 더 누르시면, 다음장으로 이동합니다.', // text_vol_down_next_chapter
    pickOneHint: '받은 역본과 직접 넣은 역본 중 하나를 골라 봅니다.',
    pickVersionsHint: '받은 역본과 직접 넣은 역본입니다. 여러 역본을 고르면 고른 순서대로 나란히 봅니다.',
    oneColumn: '역본대조를 1단으로 보기', // text_pref_multilayout_preference
    ok: '확인', // alert_dialog_ok
    cancel: '취소', // alert_dialog_cancel
    delete: '삭제', // menu_delete
    downloaded: '받음',
    deleteConfirm: (name) => `받아 둔 "${name}"을(를) 지울까요? 다시 읽으려면 성경다운로드에서 다시 받아야 합니다.`,
    menu: '메뉴',
    download: '성경다운로드', // menu_download
    downloadHint: '받을 역본을 고르고 다운로드를 누르세요. 받은 역본은 인터넷 없이도 읽을 수 있고, 역본대조보기에서 고를 수 있습니다.',
    downloadAll: (i, n) => `다운로드 중... (${i}/${n})`,
    downloadDone: '다운로드를 완료하였습니다.',
    downloadFailed: (names) => `받지 못했습니다: ${names}. 인터넷이 연결되어 있는지 확인 후, 다시 시도해 주세요.`, // txt_check_internet 앞부분
    noCache: '이 주소에서는 역본을 받아 둘 수 없어 읽을 때마다 받습니다.',
    moreVersions: '다른 역본 받기 (성경다운로드) ›',
    noVersions: '받은 성경이 없습니다. 성경다운로드에서 읽을 역본을 받으세요.',
    importTitle: '성경 파일 넣기',
    noLocal: '직접 넣은 역본이 없습니다.',
    listOld: '역본 목록을 새로 받지 못해 전에 받은 목록을 보입니다',
    updateReady: '새 버전이 있습니다',
    updateApply: '새로 고침',
    noChapter: '이 역본에는 이 장이 없습니다',
    loadFailed: '본문을 불러오지 못했습니다',
    ref: (book, chapter) => `${book} ${chapter}장`,
    importFiles: '파일 넣기',
    importFolder: '폴더 넣기',
    importHint: '가지고 있는 성경 파일(.lfa, .bdf)을 넣거나 화면 아무 데나 끌어다 놓을 수 있습니다. 앱에서 내보낸 다운로드/LifoveBible/bible 폴더를 그대로 넣어도 됩니다.',
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
    pickOneVersion: 'Single Viewer', // menu_sel_one_ver
    barBottom: 'Book/chapter bar at bottom', // text_pref_header_bottom
    viewerSettings: 'Viewer Settings', // text_title_pref_1
    groupScreen: 'Screen layout', // pref_group_screen
    groupColors: 'Colors', // pref_group_colors
    oneColumnHint: 'When off, versions sit side by side in two or more columns to fit the screen width.',
    showVerName: 'Show version names',
    showVerNameHint: 'Show the version name in each column when reading several versions.',
    fontColor: 'Text color', // text_pref_fontcolor
    bgColor: 'Background color', // text_pref_bgcolor
    colorPresets: { light: 'Light', dark: 'Dark', sepia: 'Sepia', green: 'Green' },
    colorSample: 'In the beginning God created the heaven and the earth.',
    colorReset: 'Default colors',
    groupNav: 'Navigation and touch', // pref_group_navigation
    navBar: 'Show navigation buttons', // text_pref_navigation_bar_preference
    navBarHint: 'Show move buttons over the text.',
    navPos: 'Navigation buttons position',
    navPositions: {
      'right-middle': 'Middle right',
      'right-bottom': 'Bottom right',
      'left-middle': 'Middle left',
      'left-bottom': 'Bottom left',
    },
    navBarOptions: { // entries_navigation_bar
      1: 'Hide Navigation Bar',
      2: 'Only Verse Navigation Bar',
      3: 'Only Chapter Navigation Bar',
      5: 'Only History Navigation Bar',
      4: 'Verse, Chapter Navigation Bar',
      6: 'Verse, History Navigation Bar',
      7: 'Chapter, History Navigation Bar',
      8: 'Verse, Chapter, History Navigation Bar',
    },
    navUnit: 'Move with up/down buttons',
    navUnits: { verse: 'Move One Verse', page: 'Move One Screen(verses)', chapter: 'Move One Chapter' }, // entries_volumekey
    navUp: 'Up',
    navDown: 'Down',
    navBack: 'History back',
    navForward: 'History forward',
    downAgain: 'Press Down again to move to the next chapter.', // text_vol_down_next_chapter
    pickOneHint: 'Choose one of the downloaded or added versions to read.',
    pickVersionsHint: 'Downloaded and added versions. Choose several to read them side by side, in the order you choose them.',
    oneColumn: 'Compare translations in one column',
    ok: 'OK',
    cancel: 'Cancel',
    delete: 'Delete',
    downloaded: 'Downloaded',
    deleteConfirm: (name) => `Delete the downloaded "${name}"? To read it again, download it again.`,
    menu: 'Menu',
    download: 'Download', // menu_download
    downloadHint: 'Choose versions and tap Download. Downloaded versions can be read without the Internet and chosen in the Parallel Viewer.',
    downloadAll: (i, n) => `Downloading... (${i}/${n})`,
    downloadDone: 'Download completed!', // txt_install_result_success
    downloadFailed: (names) => `Could not download: ${names}. Please, check your Internet connection and try again.`,
    noCache: 'This address cannot keep Bible files, so they are downloaded each time you read.',
    moreVersions: 'Get other versions (Download) ›',
    noVersions: 'No Bible downloaded yet. Download a version to read.',
    importTitle: 'Add Bible files',
    noLocal: 'No versions added by you.',
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
