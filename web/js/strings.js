// 화면 문구. 앱과 같은 7개 언어(ko, en, ja, zh 번체, zh-CN 간체, es, pt)와 웹에만 있는 fr(앱에 없어 en에서 번역).
// 언어마다 키가 모두 같아야 한다(tests/strings.test.js가 확인).
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
    pickVerse: '절 고르기',
    versePos: (now, last) => `${last}절 중 ${now}절`, // 절 단추를 읽어 줄 때
    readCheck: '이 장을 읽음으로 표시',
    checkedAsRead: '읽음으로 표시합니다.', // text_checked_as_read_in_chapter_list
    uncheckedRead: '읽음표시를 해제합니다.', // text_release_as_unread_in_chapter_list
    checkedAllTrans: '선택된 모든 역본을 읽음으로 표시합니다.', // text_checked_all_trans
    uncheckedAllTrans: '선택된 모든 역본의 읽음표시를 해제합니다.', // text_ubchecked_all_trans
    readCheckFailed: '읽음 표시를 저장하지 못했습니다',
    readStats: '성경읽기통계', // menu_read_check_table
    statsTotal: '전체', // text_total
    statsValue: (read, total, pct) => `${read} / ${total}장 · ${pct}%`, // 앱 StatAdapter
    statsReset: '읽기통계초기화', // menu_init_read_check
    statsResetConfirm: (name) => `${name}의 읽음 표시를 모두 지울까요?`,
    statsResetDone: '읽기통계를 초기화 하였습니다.', // text_initiated_reading_statistics
    backToBooks: '책 목록',
    close: '닫기',
    version: '역본',
    pickVersions: '역본대조보기', // menu_sel_ver
    pickOneVersion: '다른성경보기', // menu_sel_one_ver
    barBottom: '책·장·절 바를 아래에 표시', // text_pref_header_bottom
    viewerSettings: '본문화면설정', // text_title_pref_1
    groupScreen: '화면 구성', // pref_group_screen
    groupColors: '글자와 색', // 앱은 pref_group_text(글자)와 pref_group_colors(색)가 따로
    oneColumnHint: '끄면 화면 폭에 맞춰 2단 이상으로 나란히 봅니다. 넓은 화면에서는 여러 역본이 한 줄에 섭니다.',
    showVerName: '역본명 보이기', // 앱은 반대 뜻의 "여백 및 역본명 제거"(text_pref_nomargin_preferences)
    showVerNameHint: '여러 역본을 볼 때 칸마다 역본 이름을 보입니다.',
    fontColor: '글자색', // text_pref_fontcolor
    bgColor: '배경색', // text_pref_bgcolor
    colorPresets: { light: '밝게', dark: '어둡게', sepia: '세피아', green: '연두' },
    colorSample: '태초에 하나님이 천지를 창조하시니라',
    colorReset: '기본 색으로',
    groupHighlight: '형광펜 설정', // text_title_pref_highlight
    hlStyle: '형광펜 모양', // text_pref_underline_preferences
    hlStyleHint: '형광펜을 칠한 절이 어떻게 보일지 고릅니다. 여러 개를 함께 고를 수 있습니다.', // text_pref_underline_preferences_summary
    hlStyles: ['배경 칠하기(형광펜)', '밑줄', '글자색', '굵게'], // entries_highlight_style(highlightStyle.STYLES 차례)
    hlColor: '형광펜 색', // text_pref_highlightcolor
    hlTextColor: '밑줄·글자 색', // text_pref_underlinecolor
    hlNeedOne: '형광펜 모양을 하나 이상 골라 주세요.', // text_highlight_style_need_one
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
    swipeChapter: '옆으로 밀어 장 넘기기', // text_pref_swipe_chapter
    swipeChapterHint: '본문을 왼쪽이나 오른쪽으로 밀면 다음 장이나 이전 장으로 넘어갑니다. 스크롤하다가 장이 넘어가는 일이 잦으면 끄세요.',
    ttsPlay: '현재 장 TTS 듣기', // text_launch_tts_player
    ttsPlayVerse: '고른 절부터 TTS 듣기', // text_launch_tts_player_for_a_verse (앱은 '꾹 누른 절'. 웹은 눌러서 고른 절이라 바꿈)
    ttsSpeed: (rate) => `읽기 속도 ${rate}`, // 읽는 동안 ▶ 단추(속도)를 읽어 줄 때
    ttsPause: '잠시 멈춤',
    ttsResume: '이어 듣기',
    ttsStop: '그만 듣기',
    ttsNoVoice: '이 언어의 목소리가 없습니다. 음성 데이터를 설치해 주세요.', // text_tts_no_voice
    ttsFailed: '이 장의 음성을 만들지 못했습니다.', // text_tts_failed
    groupTts: '음성(TTS) 설정', // text_title_pref_tts
    ttsButton: '오디오 버튼 표시', // text_pref_audio_button
    ttsButtonHint: '본문 화면에 오디오 버튼(▶)을 표시합니다. 끄면 오디오 기능을 사용하지 않습니다.', // text_pref_audio_button_summary (앱은 '본문 화면 위쪽에'. 웹은 바가 아래가 기본이라 뺐다)
    ttsReadCheck: '오디오 성경 자동 읽음 체크', // text_pref_autoaudioreadcheck_preference
    ttsReadCheckHint: '오디오 낭독이 끝난 후 다음 장으로 넘어갈 때, 자동으로 읽음 체크 실행합니다.', // text_pref_autoaudioreadcheck_preference_summary
    ttsVoice: '목소리', // text_pref_tts_voice
    ttsVoiceSummary: (lang, voice) => `현재 성경 언어: ${lang} / ${voice}`, // text_pref_tts_voice_summary
    ttsVoiceDefault: '폰 기본', // text_tts_voice_default
    ttsVoiceNetwork: '인터넷 필요', // text_tts_voice_network
    ttsVoiceItem: (n) => `목소리 ${n}`, // text_tts_voice_item
    ttsInstall: '음성 데이터 설치/관리', // text_pref_tts_install
    ttsInstallHint: '기기에 목소리를 더하는 방법을 봅니다.',
    ttsNoLanguage: '이 언어의 음성 데이터가 폰에 없습니다. 음성 데이터를 설치하시겠습니까?', // text_tts_no_language
    ttsOpenSettings: '음성 설치', // text_tts_open_settings
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
    help: '도움말', // menu_help
    helpFailed: '도움말을 불러오지 못했습니다',
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
    dbBlocked: '다른 탭이나 앱 창에 열린 Lifove Bible을 닫아 주세요. 그래야 메모·형광펜을 쓸 수 있습니다.',
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
    localRename: (name) => `${name} 이름 바꾸기`,
    localRenamePrompt: (name) => `역본 이름을 입력하세요. 비워 두면 원래 이름(${name})으로 보입니다.`,
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
    selCount: (n) => `${n}절 선택`,
    copy: '복사',
    share: '공유',
    copyVerses: '선택한 절 복사', // menu_copy_verse
    shareVerses: '선택한 절 전송', // menu_verse_send
    clearSelection: '선택 해제', // menu_check_clear
    copied: '클립보드에 선택한 절을 복사했습니다.', // text_copied_selected_verses
    copyFailed: '복사하지 못했습니다',
    shareFailed: '공유하지 못했습니다',
    highlight: '형광펜',
    highlightOff: '지우기',
    highlightVerses: '선택한 절 형광펜 칠하기', // menu_verse_underline
    removeHighlight: '선택한 절 형광펜 지우기', // menu_verse_underline_remove
    highlightFailed: '형광펜을 저장하지 못했습니다',
    myHighlights: '나의형광펜목록', // menu_underline_list
    orderRecent: '최근목록순 정렬', // menu_timely_order
    orderBook: '책장절순 정렬', // menu_book_order
    hlEmpty: '형광펜을 칠한 구절이 없습니다.\n본문에서 절을 눌러 고른 뒤 [형광펜]을 누르면 칠할 수 있습니다.', // text_underline_empty를 웹에 맞게
    hlSend: '형광펜 보내기', // menu_underline_send
    hlCopiedAll: '형광펜 목록을 클립보드에 복사했습니다.',
    deleteAll: '전체삭제', // menu_delete_all
    hlDeleteAllConfirm: '정말로 형광펜을 모두 지우시겠습니까?', // text_ask_to_delete_all_my_underlines(위젯 문구는 뺌)
    hlDeletedAll: '모든 형광펜을 지웠습니다.', // text_deleted_all_my_underline
    hlDelete: (ref) => `${ref} 형광펜 지우기`,
    hlDeleteConfirm: (ref) => `${ref}의 형광펜을 지울까요?`,
    hlLoadFailed: '형광펜을 읽지 못했습니다',
    noSuchVersion: (name) => `${name} 역본을 찾을 수 없습니다. 성경다운로드나 성경 파일 넣기로 다시 넣어 주세요.`,
    addBookmark: '책갈피 추가', // menu_add_bookmark
    copyChapter: '장 전체 복사', // menu_copy_chapter
    sendChapter: '장 전체 전송', // menu_chapter_send
    copiedChapter: '클립보드에 장 전체를 복사했습니다.', // text_copied_this_chapter
    reportVerseError: '본문 오류 신고', // menu_report_verse_error
    verseErrorSubject: '[본문 오류] Lifove Bible', // text_verse_error_subject
    verseErrorGuide: '아래 절에서 어느 부분이 틀렸는지, 어떻게 고쳐야 하는지 자세히 적어 주세요. 가능하면 근거(인쇄본 성경과 쪽수 등)도 함께 적어 주세요.', // text_verse_error_guide
    reportMailHint: '메일 앱이 열리지 않으면 bible@lifove.net 으로 보내 주세요.', // text_no_mail_app를 고침(웹은 메일 앱이 열렸는지 알 수 없다)
    bookmarks: '책갈피', // menu_bookmark
    bookmarkAdded: (ref) => `${ref} 책갈피를 성공적으로 저장했습니다!`, // text_bookmark_added에 위치를 붙임
    bookmarkFailed: '책갈피를 저장하지 못했습니다',
    bmEmpty: '저장된 책갈피가 없습니다.\n읽던 곳에서 ☰ → [책갈피 추가]를 누르면 맨 위에 보이는 절을 저장합니다.', // text_no_bookmark를 웹에 맞게
    bmDelete: (ref) => `${ref} 책갈피 지우기`,
    bmDeleteConfirm: (ref) => `${ref} 책갈피를 지울까요?`,
    bmLoadFailed: '책갈피를 읽지 못했습니다',
    memo: '메모',
    memoVerse: '선택한 절 메모', // menu_memo(꾹 누른 절 메모)를 웹에 맞게
    memoOpen: (ref) => `${ref} 메모 보기`,
    save: '저장', // alert_dialog_save
    del: '삭제', // alert_dialog_del
    memoSaveChanges: '바뀐 메모를 저장할까요?', // memo_save_changes
    memoDiscard: '저장 안 함', // memo_discard_changes
    memoDeleteConfirm: '이 메모를 삭제할까요?', // memo_delete_confirm
    memoShow: '메모 보이기', // menu_memo_show
    memoHide: '메모 숨기기', // menu_memo_hide
    memoFailed: '메모를 저장하지 못했습니다',
    memoLoadFailed: '메모를 읽지 못했습니다',
    myMemos: '나의메모목록', // menu_memo_list
    myMemoList: '나의메모목록', // text_my_memo_list
    mlEmpty: '메모가 없습니다.\n본문에서 절을 눌러 고른 뒤 [메모]를 누르면 메모를 남길 수 있습니다.', // text_memo_empty를 웹에 맞게
    mlSearchHint: '메모 검색', // text_memo_search_hint
    mlSearchNone: '찾는 메모가 없습니다.', // text_memo_search_none
    mlSearchClear: '검색어 지우기', // text_memo_search_clear
    mlSend: '메모보내기(백업)', // menu_memo_backup
    mlCopiedAll: '메모 목록을 클립보드에 복사했습니다.',
    mlDeleteAllConfirm: '정말로 전체 메모를 삭제 하시겠습니까?', // text_ask_to_delete_all_my_memos
    mlDeletedAll: '모든 메모를 삭제 하였습니다.', // text_deleted_all_my_memo
    mlDelete: (ref) => `${ref} 메모 지우기`,
    mlDeleteConfirm: (ref) => `${ref}의 메모를 지울까요?`,
    groupMemo: '메모', // pref_group_memo
    memoBooks: '메모책', // text_memo_books
    memoBooksHint: '메모책을 추가하거나 이름·순서·입력 방식을 바꿉니다', // text_memo_books_summary
    memoOptions: ['저장하면 다음 절로', '메모 있는 절 건너뛰기', '장 끝에서 다음 장으로', '엔터를 누르면 저장'], // text_memo_book_continuous, _skip_filled, _next_chapter, _enter_saves(memoBook.MEMO_OPTIONS 차례)
    memoOptionOn: (name) => `${name}: 켜짐`, // text_memo_option_on
    memoOptionOff: (name) => `${name}: 꺼짐`, // text_memo_option_off
    memoNoNextVerse: '이 장에는 더 쓸 절이 없습니다', // text_memo_no_next_verse
    memoBookDefault: '기본 메모책', // text_memo_book_default
    memoBookAdd: '+ 메모책 추가', // text_memo_book_add
    memoBookNew: '새 메모책', // text_memo_book_new
    memoBookName: '이름', // text_memo_book_name
    memoBookManage: '메모책 관리', // text_memo_book_manage
    memoBookCount: (n) => `메모 ${n}개`, // text_memo_book_count
    memoBookMoveUp: (name) => `${name} 위로 옮기기`, // text_memo_book_move_up
    memoBookMoveDown: (name) => `${name} 아래로 옮기기`, // text_memo_book_move_down
    memoBookDelete: (name) => `${name} 삭제`,
    memoBookDeleteConfirm: (name, n) => `“${name}” 메모책을 지울까요? 이 메모책의 메모 ${n}개도 모두 지워집니다.`, // text_memo_book_delete_confirm
    memoBookDeleteConfirmEmpty: (name) => `“${name}” 메모책을 지울까요?`, // text_memo_book_delete_confirm_empty
    memoBookPick: '메모책 바꾸기',
    memoBookFailed: '메모책을 저장하지 못했습니다',
    backupMenu: '데이터 관리', // text_title_pref_3(앱 설정의 데이터 관리 묶음). 동기화·백업·복구를 한 창에(2026-11-28)
    backupSaveTitle: '데이터 백업', // menu_db_backup
    backupSaveHint: '나의 형광펜, 메모, 읽기통계 데이터를 모두 백업합니다. 책갈피와 메모책도 들어갑니다. 안드로이드 앱과 같은 백업 파일(.db)이라 앱의 설정 > 데이터 복구로도 열 수 있습니다.', // text_pref_db_backup_summary에 웹 설명을 붙임
    backupRun: '백업 실행', // menu_db_backup_run
    backupInProgress: '데이터를 백업 중입니다...', // text_backup_in_progress
    backupSaved: (name) => `데이터를 성공적으로 백업 하였습니다.\n파일: ${name} (브라우저의 다운로드 폴더)`, // text_backup_successfully + text_backup_location
    backupFailed: '데이터 백업에 실패하였습니다.', // text_backup_failed
    backupLast: (when) => `마지막 백업: ${when}`,
    backupNever: '아직 백업한 적이 없습니다.',
    backupMoveHint: '백업 파일은 다른 기기에서도 쓸 수 있습니다. 메일, 메신저, 클라우드 드라이브 등으로 파일을 옮긴 뒤 안드로이드 폰·태블릿의 Lifove Bible 앱에서는 설정 > 데이터 복구, 다른 기기나 브라우저의 웹 버전에서는 아래 [복구 실행]으로 그 파일을 고르면 형광펜, 메모 등을 이어서 쓸 수 있습니다.', // 다른 기기의 앱·웹에서 복구해 이어 쓰기(사용자 요청 2026-11-26)
    backupNoticeTitle: '꼭 읽어 주세요: 기록 보관 안내',
    backupNotice1: '형광펜, 메모, 책갈피, 읽기 기록은 이 기기의 이 브라우저 안에만 저장되며, 서버에는 따로 보관되지 않습니다. 브라우저의 사이트 데이터를 지우거나, 저장 공간이 부족하거나, 기기나 브라우저를 바꾸면 기록이 사라질 수 있고, 사라진 기록은 되살릴 방법이 없습니다. 아이폰·아이패드의 사파리는 홈 화면에 추가하지 않은 채 7일 넘게 열지 않으면 기록을 지울 수도 있습니다.',
    backupNotice2: '소중한 기록을 잃지 않도록 정기적으로 백업해 주시고, 받은 백업 파일은 PC나 클라우드 드라이브처럼 안전한 곳에 함께 보관해 주세요. 백업한 지 7일이 지나면 화면 위에 알려 드립니다.',
    backupNoticeSync: '구글 드라이브 동기화(☰ → 데이터 관리 맨 위)를 켜면 기록이 본인의 구글 드라이브에도 저장되어 다른 기기에서도 이어서 쓸 수 있습니다. 동기화를 켜 두고 7일 안에 동기화되었으면 백업 알림은 띄우지 않습니다. 그래도 백업 파일을 함께 보관해 두시면 더 안전합니다.', // 동기화를 켜면(2026-11-28 사용자 승인, 기록 보관 안내에 더함)
    backupNotice3: '백업과 백업 파일 보관은 사용자께서 직접 관리해 주셔야 합니다. 백업하지 않아 사라진 기록은 저희가 되돌려 드릴 수 없으며, 그 책임은 사용자께 있다는 점을 너그러이 양해해 주시기 바랍니다.',
    reminderNever: '아직 백업하지 않은 기록이 있습니다. 기록이 사라지지 않도록 백업해 주세요.',
    reminderDays: (n) => `마지막 백업 후 ${n}일이 지났습니다. 기록이 사라지지 않도록 백업해 주세요.`,
    reminderBackup: '백업',
    reminderLater: '나중에',
    restoreTitle: '데이터 복구', // menu_db_restore
    restoreHint: '백업한 나의 형광펜, 메모, 읽기통계 데이터를 복구 합니다. 안드로이드 앱의 백업 파일(다운로드/LifoveBible 폴더의 lifovebible_backup_….db, lifovebible_autobackup.db, 옛 버전의 lifovebible)도 고를 수 있습니다.', // text_pref_db_restore_summary에 웹 설명을 붙임
    restoreRun: '복구 실행', // menu_db_restore_run
    restoreMerge: ['합치기 (추천)', '지금 데이터는 그대로 두고, 백업에만 있거나 백업 쪽이 더 나중에 고친 기록을 더합니다. 내용이 다른 메모는 하나씩 고릅니다.'], // restore_mode_merge
    restoreReplace: ['바꾸기', '지금 데이터를 지우고 백업으로 바꿉니다. 백업에 책갈피가 없으면 지금 책갈피는 남깁니다.'], // restore_mode_replace에서 위젯 문장을 뺌
    restoreInProgress: '데이터를 복구 중입니다...', // text_restore_in_progress
    restoreDone: '데이터를 성공적으로 복구 하였습니다.', // text_restore_successfully
    restoreFailed: '데이터 복구에 실패하였습니다.', // text_restore_failed
    restoreNotBackup: 'Lifove Bible 백업 파일이 아닙니다. 지금 데이터는 바뀌지 않았습니다.',
    restoreNewer: '더 새로운 버전의 Lifove Bible에서 만든 백업입니다. 웹 버전이 업데이트된 뒤 다시 시도해 주세요. 지금 데이터는 바뀌지 않았습니다.', // text_restore_newer_backup을 웹에 맞게
    mergeDone: (u, m, r, b) => `백업을 합쳤습니다.\n백업에서 가져온 것: 형광펜 ${u}개, 메모 ${m}개, 읽기 기록 ${r}개, 책갈피 ${b}개`, // restore_merge_done
    mergeNothing: '백업에서 더 가져올 기록이 없습니다. 지금 데이터가 이미 최신입니다.', // restore_merge_nothing
    mergeConflicts: (n) => `이 기기와 백업의 내용이 다른 메모가 ${n}개 있습니다. 하나씩 골라 주세요.`, // restore_merge_conflicts(이 폰 → 이 기기)
    conflictTitle: (i, n) => `메모 고르기 (${i}/${n})`, // memo_conflict_title
    conflictLocal: '이 기기', // memo_conflict_local(이 폰)
    conflictBackup: '백업', // memo_conflict_backup
    conflictOther: '다른 기기', // 웹에서 먼저: 동기화 메모 충돌(앱 7.7 동기화 화면 문구가 생기면 맞춘다)
    conflictDeleted: '(지움)', // memo_conflict_deleted(앱 7.7)
    conflictStoppedSync: '고르지 않은 메모는 일단 이 기기 것을 그대로 두었습니다. 다음 동기화 때 다시 묻습니다.', // memo_conflict_stopped_sync
    syncOtherBooks: (list) => `다른 메모책에 새로 온 메모가 있습니다: ${list}. 메모 목록에서 메모책을 바꿔 보세요.`, // text_sync_other_books
    // 구글 드라이브 동기화 화면(syncUi.js). 앱 7.7에 아직 화면이 없어 웹에서 먼저(2026-11-28)
    groupSync: '동기화',
    syncTitle: '구글 드라이브 동기화',
    syncRowOff: '꺼짐',
    syncRowOn: (email) => `켜짐 · ${email}`,
    syncRowOnNoEmail: '켜짐',
    syncAbout: '형광펜, 메모, 메모책, 책갈피, 읽기 기록, 역본 순서를 내 구글 드라이브에 저장해 다른 기기와 맞춥니다. 안드로이드 앱(7.7 이상)과 다른 브라우저의 웹 버전에서도 같은 구글 계정으로 켜 두면 이어서 쓸 수 있습니다. 드라이브에서는 이 앱 전용 폴더만 쓰며, 내 드라이브의 다른 파일은 보지 않습니다.',
    syncOn: '동기화 사용',
    syncOnHint: '켜면 구글 계정을 고르고, 이 브라우저의 기록과 드라이브의 기록을 합칩니다.',
    syncAccount: (email) => `계정: ${email}`,
    syncLast: (when) => `마지막 동기화: ${when}`,
    syncNever: '아직 동기화하지 않았습니다.',
    syncNow: '지금 동기화', // text_drive_sync_now
    syncRunning: '동기화 중…',
    syncDone: '동기화를 마쳤습니다.',
    syncNewer: '다른 기기의 앱이 더 새 버전이라 그 기록 일부를 읽지 못했습니다. 웹 버전이 업데이트되면 다시 맞춥니다.',
    syncLeft: (n) => `아직 고르지 않은 메모가 ${n}개 있습니다. 다 고르기 전에는 이 기기의 기록을 올리지 않습니다.`,
    syncFailed: (msg) => `동기화하지 못했습니다. 인터넷 연결을 확인해 주세요. (${msg})`,
    syncSignInFailed: '구글 로그인을 하지 못했습니다. 팝업이 막히지 않았는지 확인해 주세요.',
    syncOffDone: '동기화를 껐습니다. 드라이브와 이 기기의 기록은 그대로 있습니다.',
    syncWebNote: '웹 버전에서는 구글 로그인이 1시간 동안만 유지됩니다. 웹을 열 때와 1시간이 지난 뒤에는 화면 위에 뜨는 [동기화]를 한 번 눌러 주세요. 그 뒤로는 기록을 고칠 때마다 저절로 맞춥니다.',
    syncLogTitle: '자세히(동기화 기록)',
    syncPaused: '구글 드라이브 동기화가 멈춰 있습니다.',
    syncResume: '동기화',
    syncConflicts: (n) => `동기화한 메모 ${n}개가 서로 다릅니다.`,
    syncChoose: '고르기',
    // 역본 파일 동기화(sync-format 6b). 웹에서 먼저(2026-11-28)
    syncFilesTitle: '드라이브에 올린 역본 파일',
    syncFilesHint: '서버에서 받을 수 없는 역본(직접 넣은 역본, 유료 역본)은 파일째 드라이브에 올려 다른 기기에서도 받을 수 있게 합니다. 드라이브 저장 용량을 차지합니다. 이 기기에서 역본을 지워도 드라이브의 파일은 남습니다.',
    syncFilesSummary: (n, mb) => `역본 ${n}개, ${mb} MB`,
    syncFilesNone: '드라이브에 올린 역본 파일이 없습니다.',
    syncFilesUnknown: '동기화하면 보입니다.',
    syncFileDeleteAsk: (name) => `${name}: 드라이브에서 지우면 다른 기기에서 이 역본을 다시 받을 수 없습니다. 지울까요?`,
    syncFileDeleteAskPlain: (name) => `${name} 파일을 드라이브에서 지울까요?`,
    syncFileDeleted: (name) => `${name} 파일을 드라이브에서 지웠습니다.`,
    syncFilesAsk: (names) => `다른 기기에서 올린 역본 파일을 이 기기에도 받을까요?\n${names}`,
    syncFileReplaceAsk: (name) => `다른 기기에서 더 나중에 넣은 ${name} 파일이 드라이브에 있습니다. 이 기기의 파일을 그것으로 바꿀까요?`,
    syncGet: '받기',
    syncReplace: '바꾸기',
    syncFilesFailed: (msg) => `역본 파일을 주고받지 못했습니다. (${msg})`,
    syncFilesWaiting: (n) => `아직 올리지 않은 역본 ${n}개는 와이파이처럼 데이터 요금이 없는 네트워크에서 올립니다. 폰에서는 [지금 동기화]를 누르면 바로 올립니다(모바일 데이터로 알려진 때는 빼고).`, // 6b: 데이터 요금이 없는 네트워크에서만 올림(모르면 PC는 올리고 폰은 직접 누를 때만, 2026-11-28 JC)
    syncFileReplaceConfirm: (name) => `${name}: 이 기기에 이미 있습니다. 받으면 드라이브의 것으로 바꿉니다. 받을까요?`, // 6b 동기화 창의 [다운로드](2026-11-28 앱 7-4)
    syncFileIncomplete: '(아직 다 올라오지 않음)',
    syncPositionAsk: (device, ref) => `${device}에서 읽던 곳은 ${ref}입니다. 이동할까요?`, // 웹에서 먼저: 동기화 읽던 곳 제안(sync-format 4절)
    syncGo: '이동',
    syncVersionsAsk: (names) => `다른 기기에 있는 역본을 이 기기에도 받을까요?
${names}`, // 웹에서 먼저: 동기화 역본 제안(5a)
    conflictBoth: '둘 다', // memo_conflict_both
    conflictApplyRest: (n) => `남은 ${n}개에도 같게 적용`, // memo_conflict_apply_rest
    conflictDone: '메모 고르기를 마쳤습니다.', // memo_conflict_done
    conflictStopped: '고르지 않은 메모는 이 기기 것을 그대로 두었습니다.', // memo_conflict_stopped
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
    pickVerse: 'Choose a verse',
    versePos: (now, last) => `Verse ${now} of ${last}`,
    readCheck: 'Mark this chapter as read',
    checkedAsRead: 'Checked as Read.', // text_checked_as_read_in_chapter_list
    uncheckedRead: 'Uncheck the Read mark.', // text_release_as_unread_in_chapter_list
    checkedAllTrans: 'Check the selected trans. as Read', // text_checked_all_trans
    uncheckedAllTrans: "Uncheck the selected trans.'s Read mark", // text_ubchecked_all_trans
    readCheckFailed: 'Could not save the read mark',
    readStats: 'Read Statistics', // menu_read_check_table
    statsTotal: 'All', // text_total
    statsValue: (read, total, pct) => `${read} / ${total} · ${pct}%`, // 앱 text_chapter가 영어는 빈 문자열
    statsReset: 'Reset reading checks', // menu_init_read_check
    statsResetConfirm: (name) => `Clear all read marks of ${name}?`,
    statsResetDone: 'Reset read statistics', // text_initiated_reading_statistics
    backToBooks: 'Books',
    close: 'Close',
    version: 'Version',
    pickVersions: 'Parallel Viewer',
    pickOneVersion: 'Single Viewer', // menu_sel_one_ver
    barBottom: 'Book/chapter bar at bottom', // text_pref_header_bottom
    viewerSettings: 'Viewer Settings', // text_title_pref_1
    groupScreen: 'Screen layout', // pref_group_screen
    groupColors: 'Text and colors', // app: pref_group_text + pref_group_colors
    oneColumnHint: 'When off, versions sit side by side in two or more columns to fit the screen width.',
    showVerName: 'Show version names',
    showVerNameHint: 'Show the version name in each column when reading several versions.',
    fontColor: 'Text color', // text_pref_fontcolor
    bgColor: 'Background color', // text_pref_bgcolor
    colorPresets: { light: 'Light', dark: 'Dark', sepia: 'Sepia', green: 'Green' },
    colorSample: 'In the beginning God created the heaven and the earth.',
    colorReset: 'Default colors',
    groupHighlight: 'Highlight Settings', // text_title_pref_highlight
    hlStyle: 'Highlight style', // text_pref_underline_preferences
    hlStyleHint: 'Choose how highlighted verses look. You can pick more than one.', // text_pref_underline_preferences_summary
    hlStyles: ['Highlighter background', 'Underline', 'Text color', 'Bold'], // entries_highlight_style(highlightStyle.STYLES 차례)
    hlColor: 'Highlighter color', // text_pref_highlightcolor
    hlTextColor: 'Underline/text color', // text_pref_underlinecolor
    hlNeedOne: 'Pick at least one highlight style.', // text_highlight_style_need_one
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
    swipeChapter: 'Swipe to change chapters', // text_pref_swipe_chapter
    swipeChapterHint: 'Swipe the text left or right to go to the next or previous chapter. Turn off if chapters change when you only meant to scroll.',
    ttsPlay: 'Read a chapter (TTS)', // text_launch_tts_player
    ttsPlayVerse: 'Read from the selected verse (TTS)', // text_launch_tts_player_for_a_verse를 고침
    ttsSpeed: (rate) => `Speech speed ${rate}`,
    ttsPause: 'Pause',
    ttsResume: 'Resume',
    ttsStop: 'Stop',
    ttsNoVoice: 'No voice for this language. Please install voice data.', // text_tts_no_voice
    ttsFailed: 'Could not create speech for this chapter.', // text_tts_failed
    groupTts: 'Speech (TTS) Settings', // text_title_pref_tts
    ttsButton: 'Show audio button', // text_pref_audio_button
    ttsButtonHint: 'Show the audio button (▶) in the Bible viewer. Turn off if you don\'t use audio.', // text_pref_audio_button_summary
    ttsReadCheck: 'Audio Bible Read Check', // text_pref_autoaudioreadcheck_preference
    ttsReadCheckHint: 'Automatically check the chapter as read when finished reading the chapter by Audio Bible', // text_pref_autoaudioreadcheck_preference_summary
    ttsVoice: 'Voice', // text_pref_tts_voice
    ttsVoiceSummary: (lang, voice) => `Current Bible language: ${lang} / ${voice}`, // text_pref_tts_voice_summary
    ttsVoiceDefault: 'Phone default', // text_tts_voice_default
    ttsVoiceNetwork: 'needs internet', // text_tts_voice_network
    ttsVoiceItem: (n) => `Voice ${n}`, // text_tts_voice_item
    ttsInstall: 'Install/manage voice data', // text_pref_tts_install
    ttsInstallHint: 'See how to add voices to your device.',
    ttsNoLanguage: 'No text-to-speech voice for this language on your phone. Install voice data?', // text_tts_no_language
    ttsOpenSettings: 'Install voice', // text_tts_open_settings
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
    help: 'Help', // menu_help
    helpFailed: 'Could not load help',
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
    dbBlocked: 'Close Lifove Bible in other tabs or app windows to use memos and highlights.',
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
    localRename: (name) => `Rename ${name}`,
    localRenamePrompt: (name) => `Enter a name for this Bible version. Leave it empty to show the original name (${name}).`,
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
    selCount: (n) => (n === 1 ? '1 verse' : `${n} verses`),
    copy: 'Copy',
    share: 'Share',
    copyVerses: 'Copy the selected verse(s)', // menu_copy_verse
    shareVerses: 'Send the selected verse(s)', // menu_verse_send
    clearSelection: 'Un-check the selected verse(s)', // menu_check_clear
    copied: 'Copied the selected verse(s)', // text_copied_selected_verses
    copyFailed: 'Could not copy',
    shareFailed: 'Could not share',
    highlight: 'Highlight',
    highlightOff: 'Remove',
    highlightVerses: 'Highlight the selected verse(s)', // menu_verse_underline
    removeHighlight: 'Remove the highlight', // menu_verse_underline_remove
    highlightFailed: 'Could not save the highlight',
    myHighlights: 'My Highlight', // menu_underline_list
    orderRecent: 'Recent Order', // menu_timely_order
    orderBook: 'Name Order', // menu_book_order
    hlEmpty: 'No highlighted verses yet.\nTap verses in the reading screen to select them, then press [Highlight].', // text_underline_empty, adapted
    hlSend: 'Send Highlights', // menu_underline_send
    hlCopiedAll: 'Copied the highlight list',
    deleteAll: 'Delete All', // menu_delete_all
    hlDeleteAllConfirm: 'Do you really want to delete all your highlights?', // text_ask_to_delete_all_my_underlines
    hlDeletedAll: 'Deleted all my highlights!', // text_deleted_all_my_underline
    hlDelete: (ref) => `Remove highlight on ${ref}`,
    hlDeleteConfirm: (ref) => `Remove the highlight on ${ref}?`,
    hlLoadFailed: 'Could not read the highlights',
    noSuchVersion: (name) => `${name} is not available. Download or import it again.`,
    addBookmark: 'Add Bookmark', // menu_add_bookmark
    copyChapter: 'Copy a chapter', // menu_copy_chapter
    sendChapter: 'Send the chapter', // menu_chapter_send
    copiedChapter: 'Copied this chapter', // text_copied_this_chapter
    reportVerseError: 'Report Text Error', // menu_report_verse_error
    verseErrorSubject: '[Text error] Lifove Bible', // text_verse_error_subject
    verseErrorGuide: 'Please describe below which part of the verse is wrong and what it should be. If you can, also tell us your source (e.g., a printed Bible and its page).', // text_verse_error_guide
    reportMailHint: 'If no email app opens, please send your report to bible@lifove.net.', // text_no_mail_app를 고침(웹은 메일 앱이 열렸는지 알 수 없다)
    bookmarks: 'Bookmark', // menu_bookmark
    bookmarkAdded: (ref) => `Bookmark saved successfully! (${ref})`, // text_bookmark_added with the place
    bookmarkFailed: 'Could not save the bookmark',
    bmEmpty: 'No bookmarks\nPress ☰ → [Add Bookmark] while reading to save the verse at the top of the screen.', // text_no_bookmark, adapted
    bmDelete: (ref) => `Delete bookmark ${ref}`,
    bmDeleteConfirm: (ref) => `Delete the bookmark ${ref}?`,
    bmLoadFailed: 'Could not read the bookmarks',
    memo: 'Memo',
    memoVerse: 'Write/show a memo', // menu_memo
    memoOpen: (ref) => `Show the memo on ${ref}`,
    save: 'Save', // alert_dialog_save
    del: 'Delete', // alert_dialog_del
    memoSaveChanges: 'Save your changes to this memo?', // memo_save_changes
    memoDiscard: "Don't save", // memo_discard_changes
    memoDeleteConfirm: 'Delete this memo?', // memo_delete_confirm
    memoShow: 'Show memos', // menu_memo_show
    memoHide: 'Hide memos', // menu_memo_hide
    memoFailed: 'Could not save the memo',
    memoLoadFailed: 'Could not read the memo',
    myMemos: 'My Memos', // menu_memo_list
    myMemoList: 'My Memo', // text_my_memo_list
    mlEmpty: 'No memos yet.\nTap a verse in the reading screen to select it, then press [Memo] to add a memo.', // text_memo_empty, adapted
    mlSearchHint: 'Search memos', // text_memo_search_hint
    mlSearchNone: 'No memos match your search.', // text_memo_search_none
    mlSearchClear: 'Clear search', // text_memo_search_clear
    mlSend: 'Send Memos', // menu_memo_backup
    mlCopiedAll: 'Copied the memo list',
    mlDeleteAllConfirm: 'Do you really want to delete all your memos?', // text_ask_to_delete_all_my_memos
    mlDeletedAll: 'Deleted all my memos!', // text_deleted_all_my_memo
    mlDelete: (ref) => `Delete the memo on ${ref}`,
    mlDeleteConfirm: (ref) => `Delete the memo on ${ref}?`,
    groupMemo: 'Memos', // pref_group_memo
    memoBooks: 'Memo books', // text_memo_books
    memoBooksHint: 'Add memo books, or change their names, order and how you write in them', // text_memo_books_summary
    memoOptions: ['Go to the next verse after saving', 'Skip verses that already have a memo', 'At the end of a chapter, go to the next chapter', 'Save with the Enter key'], // text_memo_book_continuous, _skip_filled, _next_chapter, _enter_saves
    memoOptionOn: (name) => `${name}: on`, // text_memo_option_on
    memoOptionOff: (name) => `${name}: off`, // text_memo_option_off
    memoNoNextVerse: 'No more verses to write in this chapter', // text_memo_no_next_verse
    memoBookDefault: 'Default memo book', // text_memo_book_default
    memoBookAdd: '+ Add memo book', // text_memo_book_add
    memoBookNew: 'New memo book', // text_memo_book_new
    memoBookName: 'Name', // text_memo_book_name
    memoBookManage: 'Manage memo books', // text_memo_book_manage
    memoBookCount: (n) => `Memos: ${n}`, // text_memo_book_count
    memoBookMoveUp: (name) => `Move ${name} up`, // text_memo_book_move_up
    memoBookMoveDown: (name) => `Move ${name} down`, // text_memo_book_move_down
    memoBookDelete: (name) => `Delete ${name}`,
    memoBookDeleteConfirm: (name, n) => `Delete the memo book “${name}”? All ${n} memos in it will be deleted too.`, // text_memo_book_delete_confirm
    memoBookDeleteConfirmEmpty: (name) => `Delete the memo book “${name}”?`, // text_memo_book_delete_confirm_empty
    memoBookPick: 'Change memo book',
    memoBookFailed: 'Could not save the memo book',
    backupMenu: 'Data Management', // text_title_pref_3(앱 설정의 데이터 관리 묶음). 동기화·백업·복구를 한 창에(2026-11-28)
    backupSaveTitle: 'Data Backup', // menu_db_backup
    backupSaveHint: 'Backup My Highlight, My Memo, and Read Statistics. Bookmarks and memo books are included. The file is the same backup file (.db) as the Android app, so you can open it in the app under Settings > Restore Data.', // text_pref_db_backup_summary + web note
    backupRun: 'Proceed Backup', // menu_db_backup_run
    backupInProgress: 'Backup in progress...', // text_backup_in_progress
    backupSaved: (name) => `Backup completed.\nFile: ${name} (your browser's download folder)`, // text_backup_successfully + text_backup_location
    backupFailed: 'Backup failed!', // text_backup_failed
    backupLast: (when) => `Last backup: ${when}`,
    backupNever: 'You have not made a backup yet.',
    backupMoveHint: 'You can use the backup file on other devices too. Move the file by email, messenger, cloud drive, or similar, then pick it in the Lifove Bible app on an Android phone or tablet (Settings > Restore Data), or in the web version on another device or browser ([Proceed Restore] below), to keep using your highlights, memos, and more.', // 다른 기기의 앱·웹에서 복구해 이어 쓰기(사용자 요청 2026-11-26)
    backupNoticeTitle: 'Please read: keeping your records',
    backupNotice1: 'Your highlights, memos, bookmarks, and reading records are stored only in this browser on this device; they are not kept on our server. They can be lost if you clear the browser\'s site data, the device runs low on storage, or you change devices or browsers, and lost records cannot be recovered. Safari on iPhone and iPad may also delete them if the site is not added to the Home Screen and is not opened for more than 7 days.',
    backupNotice2: 'To keep your records safe, please back up regularly and keep the backup files in a safe place such as a computer or a cloud drive. If 7 days pass since your last backup, a reminder appears at the top of the screen.',
    backupNoticeSync: 'If you turn on Google Drive sync (at the top of ☰ → Data Management), your records are also saved in your own Google Drive and you can continue on your other devices. While sync is on and has run within the last 7 days, the backup reminder does not appear. Keeping backup files as well is still safer.',
    backupNotice3: 'Making backups and keeping the files is up to you. We cannot restore records that were lost without a backup, and we kindly ask for your understanding that this responsibility rests with you.',
    reminderNever: 'Some of your records have not been backed up yet. Please back up so they are not lost.',
    reminderDays: (n) => `It has been ${n} days since your last backup. Please back up so your records are not lost.`,
    reminderBackup: 'Back up',
    reminderLater: 'Later',
    restoreTitle: 'Restore Data', // menu_db_restore
    restoreHint: 'Restore backup data. You can also pick a backup file from the Android app (lifovebible_backup_….db or lifovebible_autobackup.db in Download/LifoveBible, or lifovebible from older versions).', // text_pref_db_restore_summary + web note
    restoreRun: 'Proceed Restore', // menu_db_restore_run
    restoreMerge: ['Merge (recommended)', 'Keep your current data and add what is only in the backup or was changed later there. You choose for memos that differ.'], // restore_mode_merge
    restoreReplace: ['Replace', 'Delete your current data and use the backup instead. Your bookmarks stay if the backup has none.'], // restore_mode_replace without the widget sentence
    restoreInProgress: 'Data restoration in progress...', // text_restore_in_progress
    restoreDone: 'Data restoration completed', // text_restore_successfully
    restoreFailed: 'Data restoration failed!', // text_restore_failed
    restoreNotBackup: 'This is not a Lifove Bible backup file. Your current data was not changed.',
    restoreNewer: 'This backup was made by a newer version of Lifove Bible. Try again after the web version is updated. Your current data was not changed.', // text_restore_newer_backup for the web
    mergeDone: (u, m, r, b) => `Backup merged.\nTaken from the backup: ${u} highlight(s), ${m} memo(s), ${r} reading record(s), ${b} bookmark(s).`, // restore_merge_done
    mergeNothing: 'Nothing new in the backup. Your current data is already up to date.', // restore_merge_nothing
    mergeConflicts: (n) => `${n} memo(s) differ between this device and the backup. Choose for each one.`, // restore_merge_conflicts (phone → device)
    conflictTitle: (i, n) => `Choose a memo (${i}/${n})`, // memo_conflict_title
    conflictLocal: 'This device', // memo_conflict_local (This phone)
    conflictBackup: 'Backup', // memo_conflict_backup
    conflictOther: 'Other device', // sync memo conflict (web first)
    conflictDeleted: '(deleted)', // memo_conflict_deleted(앱 7.7)
    conflictStoppedSync: 'Memos you did not choose keep this device\'s version for now. You will be asked again at the next sync.', // memo_conflict_stopped_sync
    syncOtherBooks: (list) => `New memos arrived in other memo books: ${list}. Switch the memo book in My Memo to see them.`, // text_sync_other_books
    groupSync: 'Sync',
    syncTitle: 'Google Drive sync',
    syncRowOff: 'Off',
    syncRowOn: (email) => `On · ${email}`,
    syncRowOnNoEmail: 'On',
    syncAbout: 'Saves your highlights, memos, memo books, bookmarks, reading records, and translation order to your Google Drive and keeps them the same on your other devices. Turn it on with the same Google account in the Android app (7.7 or later) and in the web version on other browsers to continue where you left off. Only a folder for this app is used on your Drive; other files on your Drive are not read.',
    syncOn: 'Use sync',
    syncOnHint: 'When you turn it on, choose a Google account. The records in this browser and on your Drive are merged.',
    syncAccount: (email) => `Account: ${email}`,
    syncLast: (when) => `Last sync: ${when}`,
    syncNever: 'Not synced yet.',
    syncNow: 'Sync now', // text_drive_sync_now
    syncRunning: 'Syncing…',
    syncDone: 'Sync finished.',
    syncNewer: 'Some records from another device could not be read because its app is a newer version. They will be synced after the web version is updated.',
    syncLeft: (n) => `${n} memo(s) still need your choice. Records from this device are not uploaded until you choose them all.`,
    syncFailed: (msg) => `Could not sync. Please check your internet connection. (${msg})`,
    syncSignInFailed: 'Could not sign in to Google. Please check that pop-ups are not blocked.',
    syncOffDone: 'Sync is off. The records on your Drive and on this device stay as they are.',
    syncWebNote: 'In the web version, Google sign-in lasts only one hour. When you open the web version, and after an hour has passed, tap [Sync] at the top of the screen once. After that, changes are synced automatically.',
    syncLogTitle: 'Details (sync log)',
    syncPaused: 'Google Drive sync is paused.',
    syncResume: 'Sync',
    syncConflicts: (n) => `${n} synced memo(s) differ.`,
    syncChoose: 'Choose',
    syncFilesTitle: 'Version files on your Drive',
    syncFilesHint: 'Versions that cannot be downloaded from the server (versions you added yourself, paid versions) are uploaded to your Drive as files so your other devices can download them too. They use your Drive storage. Deleting a version on this device does not delete its file on your Drive.',
    syncFilesSummary: (n, mb) => `${n} version(s), ${mb} MB`,
    syncFilesNone: 'No version files on your Drive.',
    syncFilesUnknown: 'Shown after syncing.',
    syncFileDeleteAsk: (name) => `${name}: if you delete it from your Drive, your other devices cannot download this version again. Delete it?`,
    syncFileDeleteAskPlain: (name) => `Delete the ${name} file from your Drive?`,
    syncFileDeleted: (name) => `Deleted the ${name} file from your Drive.`,
    syncFilesAsk: (names) => `Download the version files uploaded from your other devices to this device too?\n${names}`,
    syncFileReplaceAsk: (name) => `Your Drive has a ${name} file that was added later on another device. Replace the file on this device with it?`,
    syncGet: 'Download',
    syncReplace: 'Replace',
    syncFilesFailed: (msg) => `Could not sync the version files. (${msg})`,
    syncFilesWaiting: (n) => `${n} version(s) not uploaded yet will be uploaded on a network without data charges, such as Wi-Fi. On a phone, tapping [Sync now] uploads them right away (unless you are known to be on mobile data).`,
    syncFileReplaceConfirm: (name) => `${name} is already on this device. Downloading replaces it with the one on your Drive. Download it?`,
    syncFileIncomplete: '(not fully uploaded yet)',
    syncPositionAsk: (device, ref) => `You were reading ${ref} on ${device}. Go there?`,
    syncGo: 'Go',
    syncVersionsAsk: (names) => `Download the versions you have on your other devices?
${names}`,
    conflictBoth: 'Both', // memo_conflict_both
    conflictApplyRest: (n) => `Do the same for the remaining ${n}`, // memo_conflict_apply_rest
    conflictDone: 'Finished choosing memos.', // memo_conflict_done
    conflictStopped: "Memos you did not choose keep this device's version.", // memo_conflict_stopped
  },
  // 일본어. 앱 values-ja의 문구를 그대로 쓰고(형광펜은 앱처럼 '線', 목록은 'マイライン'), 앱에 없는 웹 문구는 새로 옮겼다
  ja: {
    listLoading: '一覧を読み込み中…',
    listFailed: '聖書の一覧を読み込めませんでした',
    downloading: 'ダウンロード中…', // text_downloading
    missingVerse: '(なし)', // text_not_exist_verses
    ot: '旧約', // text_ot
    nt: '新約', // text_nt
    textSize: '文字の大きさ', // text_pref_textsize_preferences
    smaller: '小さく',
    larger: '大きく',
    prev: '前の章',
    next: '次の章',
    pickBook: '書を選ぶ',
    pickChapter: '章を選ぶ',
    pickVerse: '節を選ぶ',
    versePos: (now, last) => `${last}節中 ${now}節`,
    readCheck: 'この章を既読にする',
    checkedAsRead: '既読にしました。', // text_checked_as_read_in_chapter_list
    uncheckedRead: '既読を外しました。', // text_release_as_unread_in_chapter_list
    checkedAllTrans: '選んだ訳で既読にする', // text_checked_all_trans
    uncheckedAllTrans: '選んだ訳の既読を外す', // text_ubchecked_all_trans
    readCheckFailed: '既読を保存できませんでした',
    readStats: '通読の統計', // menu_read_check_table
    statsTotal: '全体', // text_total
    statsValue: (read, total, pct) => `${read} / ${total}章 · ${pct}%`, // text_chapter
    statsReset: '既読の記録をリセット', // menu_init_read_check
    statsResetConfirm: (name) => `${name}の既読をすべて消しますか?`,
    statsResetDone: '通読の統計をリセットしました', // text_initiated_reading_statistics
    backToBooks: '書の一覧',
    close: '閉じる',
    version: '訳',
    pickVersions: '訳を比較', // menu_sel_ver
    pickOneVersion: '聖書を選ぶ', // menu_sel_one_ver
    barBottom: '書・章バーを下に表示', // text_pref_header_bottom
    viewerSettings: '本文の設定', // text_title_pref_1
    groupScreen: '画面の構成', // pref_group_screen
    groupColors: '文字と色', // pref_group_text + pref_group_colors
    oneColumnHint: 'オフにすると、画面の幅に合わせて2列以上で並べて表示します。広い画面では複数の訳が1行に並びます。',
    showVerName: '訳名を表示', // 앱은 반대 뜻의 text_pref_nomargin_preferences
    showVerNameHint: '複数の訳を表示するとき、列ごとに訳名を表示します。',
    fontColor: '文字の色', // text_pref_fontcolor
    bgColor: '背景の色', // text_pref_bgcolor
    colorPresets: { light: '明るい', dark: '暗い', sepia: 'セピア', green: '黄緑' },
    colorSample: '初めに、神が天と地を創造した。',
    colorReset: '標準の色に戻す',
    groupHighlight: 'マイラインの設定', // text_title_pref_highlight
    hlStyle: '線の種類', // text_pref_underline_preferences
    hlStyleHint: '線を引いた節の見た目を選びます。複数選べます。', // text_pref_underline_preferences_summary
    hlStyles: ['マーカー(背景)', '下線', '文字の色', '太字'], // entries_highlight_style(highlightStyle.STYLES 차례)
    hlColor: 'マーカーの色', // text_pref_highlightcolor
    hlTextColor: '下線・文字の色', // text_pref_underlinecolor
    hlNeedOne: '線の種類を1つ以上選んでください。', // text_highlight_style_need_one
    groupNav: '移動とタッチ', // pref_group_navigation
    navBar: '移動ボタンを表示', // text_pref_navigation_bar_preference
    navBarHint: '本文の上に移動ボタンを表示します。',
    navPos: '移動ボタンの位置',
    navPositions: {
      'right-middle': '右の中央',
      'right-bottom': '右下',
      'left-middle': '左の中央',
      'left-bottom': '左下',
    },
    navBarOptions: { // entries_navigation_bar
      1: 'ナビゲーションバーを隠す',
      2: '節の移動のみ',
      3: '章の移動のみ',
      5: '履歴の移動のみ',
      4: '節と章',
      6: '節と履歴',
      7: '章と履歴',
      8: '節・章・履歴',
    },
    navUnit: '上下ボタンで移動', // text_pref_volumekey_preference를 웹에 맞게
    navUnits: { verse: '1節ずつ移動', page: '1画面ずつ移動', chapter: '1章ずつ移動' }, // entries_volumekey
    swipeChapter: 'スワイプで章を移動', // text_pref_swipe_chapter
    swipeChapterHint: '本文を左右にスワイプすると、次の章や前の章に移動します。スクロール中に章が変わってしまうことが多ければ、オフにしてください。',
    ttsPlay: '章を読み上げる', // text_launch_tts_player
    ttsPlayVerse: '選んだ節から読み上げる', // text_launch_tts_player_for_a_verse를 고침
    ttsSpeed: (rate) => `読み上げ速度 ${rate}`,
    ttsPause: '一時停止',
    ttsResume: '再開',
    ttsStop: '停止',
    ttsNoVoice: 'この言語の声がありません。音声データをインストールしてください。', // text_tts_no_voice
    ttsFailed: 'この章の音声を作成できませんでした。', // text_tts_failed
    groupTts: '読み上げ(TTS)の設定', // text_title_pref_tts
    ttsButton: '音声ボタンを表示', // text_pref_audio_button
    ttsButtonHint: '本文画面に音声ボタン(▶)を表示します。音声を使わない場合はオフにしてください。', // text_pref_audio_button_summary
    ttsReadCheck: '音声で既読にする', // text_pref_autoaudioreadcheck_preference
    ttsReadCheckHint: 'オーディオ聖書が章を読み終えると、その章を既読にします', // text_pref_autoaudioreadcheck_preference_summary
    ttsVoice: '声', // text_pref_tts_voice
    ttsVoiceSummary: (lang, voice) => `今の聖書の言語: ${lang} / ${voice}`, // text_pref_tts_voice_summary
    ttsVoiceDefault: '端末の既定', // text_tts_voice_default
    ttsVoiceNetwork: 'インターネットが必要', // text_tts_voice_network
    ttsVoiceItem: (n) => `声 ${n}`, // text_tts_voice_item
    ttsInstall: '音声データのインストール/管理', // text_pref_tts_install
    ttsInstallHint: '端末に声を追加する方法を見ます。',
    ttsNoLanguage: 'この言語の読み上げ音声が端末にありません。音声データをインストールしますか?', // text_tts_no_language
    ttsOpenSettings: '音声をインストール', // text_tts_open_settings
    navUp: '上へ',
    navDown: '下へ',
    navBack: '履歴を戻る',
    navForward: '履歴を進む',
    downAgain: '下キーを押すと次の章に移動します。', // text_vol_down_next_chapter
    pickOneHint: 'ダウンロードした訳と自分で追加した訳から一つ選んで読みます。',
    pickVersionsHint: 'ダウンロードした訳と自分で追加した訳です。複数選ぶと、選んだ順に並べて表示します。',
    oneColumn: '1列で訳を比較', // text_pref_multilayout_preference
    ok: 'OK', // alert_dialog_ok
    cancel: 'キャンセル', // alert_dialog_cancel
    delete: '削除', // menu_delete
    downloaded: 'ダウンロード済み',
    deleteConfirm: (name) => `ダウンロードした「${name}」を削除しますか?もう一度読むには、ダウンロードし直す必要があります。`,
    menu: 'メニュー',
    help: 'ヘルプ', // menu_help
    helpFailed: 'ヘルプを読み込めませんでした',
    download: 'ダウンロード', // menu_download
    downloadHint: 'ダウンロードする訳を選んで[ダウンロード]を押してください。ダウンロードした訳はインターネットなしでも読め、[訳を比較]で選べます。',
    downloadAll: (i, n) => `ダウンロード中… (${i}/${n})`,
    downloadDone: 'ダウンロードが完了しました。', // txt_install_result_success
    downloadFailed: (names) => `ダウンロードできませんでした: ${names}。インターネット接続を確認して、もう一度お試しください。`, // txt_check_internet 앞부분
    noCache: 'このアドレスでは聖書を保存できないため、読むたびにダウンロードします。',
    moreVersions: 'ほかの訳を入手(ダウンロード) ›',
    noVersions: 'ダウンロードした聖書がありません。[ダウンロード]で読む訳をダウンロードしてください。',
    importTitle: '聖書ファイルの追加',
    noLocal: '自分で追加した訳はありません。',
    listOld: '最新の一覧を読み込めなかったため、以前の一覧を表示しています',
    updateReady: '新しいバージョンがあります',
    updateApply: '再読み込み',
    dbBlocked: 'ほかのタブやアプリのウィンドウで開いているLifove Bibleを閉じてください。閉じるとメモや線を使えます。',
    noChapter: 'この訳にはこの章がありません',
    loadFailed: '本文を読み込めませんでした',
    ref: (book, chapter) => `${book} ${chapter}章`,
    importFiles: 'ファイルを追加',
    importFolder: 'フォルダを追加',
    importHint: 'お持ちの聖書ファイル(.lfa, .bdf)を追加するか、画面のどこかにドラッグしてください。アプリから書き出したDownload/LifoveBible/bibleフォルダをそのまま追加することもできます。',
    importing: '追加中…',
    imported: (names) => `追加しました: ${names}`,
    importFailed: (items) => `追加できませんでした: ${items}`,
    importNone: '聖書ファイル(.lfa, .bdf)が見つかりませんでした',
    reasons: {
      notZip: '開けないファイル',
      noChapters: '章のファイルがない',
      badText: '本文の形式が違う',
      storeFailed: '保存に失敗',
    },
    localGroup: '自分で追加した訳',
    localBadge: '追加',
    deleteLocalConfirm: (name) => `自分で追加した「${name}」を削除しますか?もう一度読むには、ファイルを追加し直す必要があります。`,
    localRename: (name) => `${name}の名前を変更`,
    localRenamePrompt: (name) => `この聖書の名前を入力してください。空欄にすると元の名前(${name})で表示されます。`,
    localMissing: '追加したファイルがなくなりました。もう一度追加してください',
    dropHere: 'ここにドロップすると聖書ファイル(.lfa, .bdf)を追加します',
    search: '検索', // label_search
    keywordA: 'キーワードA', // txt_hint_search
    keywordB: 'キーワードB', // txt_hint_search2
    searchRange: '検索範囲',
    searchVersion: '検索する訳',
    themes: 'テーマ別',
    rangeAll: '全体', // text_total
    themeNames: { // text_moses ~ text_rev
      moses: 'モーセ五書',
      hist: '歴史書',
      poet: '詩歌書',
      majProphet: '大預言書',
      mnrProphet: '小預言書',
      gospel: '福音書',
      ntHist: '新約の歴史書(使徒)',
      paulLetter: 'パウロ書簡',
      genLetter: '-パウロの一般書簡',
      prisonLetter: '-獄中書簡',
      pastorLetter: '-牧会書簡',
      comLetter: '公同書簡',
      rev: '預言書(黙示録)',
    },
    keywordRequired: 'キーワードAを入力してください。', // text_search_keyword_required
    keywordTooShort: 'キーワードAに2文字以上入力してください。', // text_search_keyword_too_short
    searching: (book) => `検索中… ${book}`, // text_searching
    noResult: '結果がありません。', // text_no_search_result
    found: (n) => `合計 ${n}節が見つかりました。`, // text_total_count + text_found_verses
    searchCanceled: (n) => `検索を中止しました。${n}節が見つかりました。`, // text_search_canceled
    searchFailed: '検索できませんでした',
    stop: '中止',
    more: (n) => `もっと見る(残り${n}件)`,
    verseRef: (book, chapter, verse) => `${book} ${chapter}:${verse}`,
    selCount: (n) => `${n}節`, // '1節を選択'은 360px 동작 바에서 잘렸다
    copy: 'コピー',
    share: '共有',
    copyVerses: '選んだ節をコピー', // menu_copy_verse
    shareVerses: '選んだ節を送る', // menu_verse_send
    clearSelection: '節の選択を解除', // menu_check_clear
    copied: '選んだ節をコピーしました', // text_copied_selected_verses
    copyFailed: 'コピーできませんでした',
    shareFailed: '共有できませんでした',
    highlight: '線を引く',
    highlightOff: '消す',
    highlightVerses: '選んだ節に線を引く', // menu_verse_underline
    removeHighlight: '線を消す', // menu_verse_underline_remove
    highlightFailed: '線を保存できませんでした',
    myHighlights: 'マイライン', // menu_underline_list
    orderRecent: '新しい順', // menu_timely_order
    orderBook: '書名順', // menu_book_order
    hlEmpty: 'まだ線を引いた節がありません。\n本文画面で節をタップして選び、[線を引く]を押すと線を引けます。', // text_underline_empty를 웹에 맞게
    hlSend: '線を送る', // menu_underline_send
    hlCopiedAll: '線の一覧をクリップボードにコピーしました。',
    deleteAll: 'すべて削除', // menu_delete_all
    hlDeleteAllConfirm: '本当に線をすべて削除しますか?', // text_ask_to_delete_all_my_underlines(위젯 문구는 뺌)
    hlDeletedAll: '線をすべて削除しました。', // text_deleted_all_my_underline
    hlDelete: (ref) => `${ref}の線を消す`,
    hlDeleteConfirm: (ref) => `${ref}の線を消しますか?`,
    hlLoadFailed: '線を読み込めませんでした',
    noSuchVersion: (name) => `${name}が見つかりません。[ダウンロード]か[聖書ファイルの追加]でもう一度追加してください。`,
    addBookmark: 'しおりを追加', // menu_add_bookmark
    copyChapter: 'この章をコピー', // menu_copy_chapter
    sendChapter: 'この章を送る', // menu_chapter_send
    copiedChapter: 'この章をコピーしました', // text_copied_this_chapter
    reportVerseError: '本文の誤りを報告', // menu_report_verse_error
    verseErrorSubject: '[本文の誤り] Lifove Bible', // text_verse_error_subject
    verseErrorGuide: '下の節のどの部分が誤っていて、どう直すべきかを詳しくご記入ください。可能であれば、根拠(印刷版の聖書とページなど)もお書きください。', // text_verse_error_guide
    reportMailHint: 'メールアプリが開かない場合は、bible@lifove.net までお送りください。', // text_no_mail_app를 고침(웹은 메일 앱이 열렸는지 알 수 없다)
    bookmarks: 'しおり', // menu_bookmark
    bookmarkAdded: (ref) => `しおりを保存しました。(${ref})`, // text_bookmark_added에 위치를 붙임
    bookmarkFailed: 'しおりを保存できませんでした',
    bmEmpty: 'しおりはありません\n読んでいる所で ☰ → [しおりを追加] を押すと、画面のいちばん上の節を保存します。', // text_no_bookmark를 웹에 맞게
    bmDelete: (ref) => `${ref}のしおりを削除`,
    bmDeleteConfirm: (ref) => `${ref}のしおりを削除しますか?`,
    bmLoadFailed: 'しおりを読み込めませんでした',
    memo: 'メモ',
    memoVerse: 'メモを書く/見る', // menu_memo
    memoOpen: (ref) => `${ref}のメモを見る`,
    save: '保存', // alert_dialog_save
    del: '削除', // alert_dialog_del
    memoSaveChanges: '変更したメモを保存しますか?', // memo_save_changes
    memoDiscard: '保存しない', // memo_discard_changes
    memoDeleteConfirm: 'このメモを削除しますか?', // memo_delete_confirm
    memoShow: 'メモを表示', // menu_memo_show
    memoHide: 'メモを隠す', // menu_memo_hide
    memoFailed: 'メモを保存できませんでした',
    memoLoadFailed: 'メモを読み込めませんでした',
    myMemos: 'マイメモ', // menu_memo_list
    myMemoList: 'マイメモ', // text_my_memo_list
    mlEmpty: 'まだメモがありません。\n本文画面で節をタップして選び、[メモ]を押すとメモを書けます。', // text_memo_empty를 웹에 맞게
    mlSearchHint: 'メモを検索', // text_memo_search_hint
    mlSearchNone: '該当するメモはありません。', // text_memo_search_none
    mlSearchClear: '検索をクリア', // text_memo_search_clear
    mlSend: 'メモを送る', // menu_memo_backup
    mlCopiedAll: 'メモの一覧をクリップボードにコピーしました。',
    mlDeleteAllConfirm: '本当にメモをすべて削除しますか?', // text_ask_to_delete_all_my_memos
    mlDeletedAll: 'メモをすべて削除しました。', // text_deleted_all_my_memo
    mlDelete: (ref) => `${ref}のメモを削除`,
    mlDeleteConfirm: (ref) => `${ref}のメモを削除しますか?`,
    groupMemo: 'メモ', // pref_group_memo
    memoBooks: 'メモ帳', // text_memo_books
    memoBooksHint: 'メモ帳の追加、名前・順番・入力方法の変更', // text_memo_books_summary
    memoOptions: ['保存したら次の節へ', 'メモのある節を飛ばす', '章の終わりで次の章へ', 'Enterキーで保存'], // text_memo_book_continuous, _skip_filled, _next_chapter, _enter_saves
    memoOptionOn: (name) => `${name}: オン`, // text_memo_option_on
    memoOptionOff: (name) => `${name}: オフ`, // text_memo_option_off
    memoNoNextVerse: 'この章には書く節がもうありません', // text_memo_no_next_verse
    memoBookDefault: '標準のメモ帳', // text_memo_book_default
    memoBookAdd: '+ メモ帳を追加', // text_memo_book_add
    memoBookNew: '新しいメモ帳', // text_memo_book_new
    memoBookName: '名前', // text_memo_book_name
    memoBookManage: 'メモ帳の管理', // text_memo_book_manage
    memoBookCount: (n) => `メモ ${n}件`, // text_memo_book_count
    memoBookMoveUp: (name) => `${name}を上へ移動`, // text_memo_book_move_up
    memoBookMoveDown: (name) => `${name}を下へ移動`, // text_memo_book_move_down
    memoBookDelete: (name) => `${name}を削除`,
    memoBookDeleteConfirm: (name, n) => `メモ帳「${name}」を削除しますか？このメモ帳のメモ${n}件もすべて削除されます。`, // text_memo_book_delete_confirm
    memoBookDeleteConfirmEmpty: (name) => `メモ帳「${name}」を削除しますか？`, // text_memo_book_delete_confirm_empty
    memoBookPick: 'メモ帳を切り替え',
    memoBookFailed: 'メモ帳を保存できませんでした',
    backupMenu: 'データ管理', // text_title_pref_3(앱 설정의 데이터 관리 묶음). 동기화·백업·복구를 한 창에(2026-11-28)
    backupSaveTitle: 'データのバックアップ', // menu_db_backup
    backupSaveHint: 'マイライン、マイメモ、通読の統計をバックアップします。しおりとメモ帳も含まれます。Androidアプリと同じバックアップファイル(.db)なので、アプリの[設定] > [データの復元]でも開けます。', // text_pref_db_backup_summary에 웹 설명을 붙임
    backupRun: 'バックアップする', // menu_db_backup_run
    backupInProgress: 'バックアップしています…', // text_backup_in_progress
    backupSaved: (name) => `バックアップが完了しました。\n保存先: ${name}(ブラウザのダウンロードフォルダ)`, // text_backup_successfully + text_backup_location
    backupFailed: 'バックアップに失敗しました。', // text_backup_failed
    backupLast: (when) => `最後のバックアップ: ${when}`,
    backupNever: 'まだバックアップしたことがありません。',
    backupMoveHint: 'バックアップファイルはほかの端末でも使えます。メール、メッセンジャー、クラウドドライブなどでファイルを移し、AndroidスマートフォンやタブレットのLifove Bibleアプリでは[設定] > [データの復元]、ほかの端末やブラウザのウェブ版では下の[復元する]でそのファイルを選ぶと、線やメモなどを引き続き使えます。', // 다른 기기의 앱·웹에서 복구해 이어 쓰기(사용자 요청 2026-11-26)
    // 기록 보관 안내·책임 안내(backupNotice1~3)는 사용자와 정한 문구. 뜻을 바꾸지 않고 정중하게 옮겼다
    backupNoticeTitle: '必ずお読みください: 記録の保管について',
    backupNotice1: '線、メモ、しおり、既読の記録は、この端末のこのブラウザの中にだけ保存され、サーバーには保管されません。ブラウザのサイトデータを消したり、保存容量が足りなくなったり、端末やブラウザを替えたりすると記録が失われることがあり、失われた記録を元に戻す方法はありません。iPhone・iPadのSafariでは、ホーム画面に追加しないまま7日以上開かないと、記録が削除されることもあります。',
    backupNotice2: '大切な記録を失わないよう、定期的にバックアップし、バックアップファイルはパソコンやクラウドドライブなど安全な場所にあわせて保管してください。最後のバックアップから7日が過ぎると、画面の上でお知らせします。',
    backupNoticeSync: 'Googleドライブ同期(☰ → データ管理の一番上)をオンにすると、記録はご自分のGoogleドライブにも保存され、ほかの端末でも続けて使えます。同期をオンにして7日以内に同期されていれば、バックアップのお知らせは表示しません。それでもバックアップファイルも一緒に保管しておくと、より安全です。',
    backupNotice3: 'バックアップとバックアップファイルの保管は、ご自身で管理していただく必要があります。バックアップしなかったために失われた記録を私たちが元に戻すことはできず、その責任はご利用者様にあることを、どうかご了承ください。',
    reminderNever: 'まだバックアップしていない記録があります。記録が失われないようバックアップしてください。',
    reminderDays: (n) => `最後のバックアップから${n}日が過ぎました。記録が失われないようバックアップしてください。`,
    reminderBackup: 'バックアップ',
    reminderLater: 'あとで',
    restoreTitle: 'データの復元', // menu_db_restore
    restoreHint: 'バックアップを復元します。Androidアプリのバックアップファイル(Download/LifoveBibleフォルダのlifovebible_backup_….db、lifovebible_autobackup.db、旧バージョンのlifovebible)も選べます。', // text_pref_db_restore_summary에 웹 설명을 붙임
    restoreRun: '復元する', // menu_db_restore_run
    restoreMerge: ['統合(おすすめ)', '今のデータはそのままにして、バックアップにだけある記録や、バックアップのほうが後で変更した記録を加えます。内容が違うメモは一つずつ選びます。'], // restore_mode_merge
    restoreReplace: ['置き換え', '今のデータを消してバックアップに置き換えます。バックアップにしおりがなければ、今のしおりは残ります。'], // restore_mode_replace에서 위젯 문장을 뺌
    restoreInProgress: 'データを復元しています…', // text_restore_in_progress
    restoreDone: 'データの復元が完了しました', // text_restore_successfully
    restoreFailed: 'データの復元に失敗しました。', // text_restore_failed
    restoreNotBackup: 'Lifove Bibleのバックアップファイルではありません。今のデータは変更されていません。',
    restoreNewer: 'このバックアップは新しいバージョンのLifove Bibleで作成されました。ウェブ版が更新されてからもう一度お試しください。今のデータは変更されていません。', // text_restore_newer_backup을 웹에 맞게
    mergeDone: (u, m, r, b) => `バックアップを統合しました。\nバックアップから取り込んだもの: 線${u}個、メモ${m}個、既読の記録${r}個、しおり${b}個`, // restore_merge_done(앱의 マーカー를 線으로 맞춤)
    mergeNothing: 'バックアップに新しい記録はありません。今のデータは最新です。', // restore_merge_nothing
    mergeConflicts: (n) => `この端末とバックアップで内容が違うメモが${n}個あります。一つずつ選んでください。`, // restore_merge_conflicts(スマートフォン → 端末)
    conflictTitle: (i, n) => `メモを選ぶ (${i}/${n})`, // memo_conflict_title
    conflictLocal: 'この端末', // memo_conflict_local(このスマホ)
    conflictBackup: 'バックアップ', // memo_conflict_backup
    conflictOther: '他の端末', // sync memo conflict (web first)
    conflictDeleted: '(削除済み)', // memo_conflict_deleted(앱 7.7)
    conflictStoppedSync: '選ばなかったメモは、ひとまずこの端末のものをそのまま残しました。次の同期でもう一度確認します。', // memo_conflict_stopped_sync
    syncOtherBooks: (list) => `他のメモ帳に新しいメモが届きました：${list}。メモの一覧でメモ帳を切り替えてご覧ください。`, // text_sync_other_books
    groupSync: '同期',
    syncTitle: 'Googleドライブ同期',
    syncRowOff: 'オフ',
    syncRowOn: (email) => `オン · ${email}`,
    syncRowOnNoEmail: 'オン',
    syncAbout: '線、メモ、メモ帳、しおり、既読の記録、訳の順番を自分のGoogleドライブに保存し、ほかの端末とそろえます。Androidアプリ(7.7以降)やほかのブラウザのウェブ版でも同じGoogleアカウントでオンにすると、続けて使えます。ドライブではこのアプリ専用のフォルダだけを使い、ドライブのほかのファイルは見ません。',
    syncOn: '同期を使う',
    syncOnHint: 'オンにするとGoogleアカウントを選び、このブラウザの記録とドライブの記録をまとめます。',
    syncAccount: (email) => `アカウント: ${email}`,
    syncLast: (when) => `最後の同期: ${when}`,
    syncNever: 'まだ同期していません。',
    syncNow: '今すぐ同期',
    syncRunning: '同期中…',
    syncDone: '同期が終わりました。',
    syncNewer: 'ほかの端末のアプリが新しいバージョンのため、その記録の一部を読めませんでした。ウェブ版が更新されたら、またそろえます。',
    syncLeft: (n) => `まだ選んでいないメモが${n}件あります。すべて選ぶまで、この端末の記録はアップロードしません。`,
    syncFailed: (msg) => `同期できませんでした。インターネット接続を確認してください。(${msg})`,
    syncSignInFailed: 'Googleにログインできませんでした。ポップアップがブロックされていないか確認してください。',
    syncOffDone: '同期をオフにしました。ドライブとこの端末の記録はそのまま残ります。',
    syncWebNote: 'ウェブ版ではGoogleのログインが1時間しか続きません。ウェブ版を開いたときと1時間たった後は、画面の上に出る[同期]を一度押してください。その後は、記録を変えるたびに自動でそろえます。',
    syncLogTitle: '詳しく(同期の記録)',
    syncPaused: 'Googleドライブ同期が止まっています。',
    syncResume: '同期',
    syncConflicts: (n) => `同期したメモ${n}件の内容が違います。`,
    syncChoose: '選ぶ',
    syncFilesTitle: 'ドライブに保存した訳のファイル',
    syncFilesHint: 'サーバーからダウンロードできない訳(自分で入れた訳、有料の訳)は、ファイルごとドライブに保存し、ほかの端末でもダウンロードできるようにします。ドライブの保存容量を使います。この端末で訳を削除しても、ドライブのファイルは残ります。',
    syncFilesSummary: (n, mb) => `訳${n}件、${mb} MB`,
    syncFilesNone: 'ドライブに保存した訳のファイルはありません。',
    syncFilesUnknown: '同期すると表示されます。',
    syncFileDeleteAsk: (name) => `${name}: ドライブから削除すると、ほかの端末でこの訳を再びダウンロードできなくなります。削除しますか?`,
    syncFileDeleteAskPlain: (name) => `${name}のファイルをドライブから削除しますか?`,
    syncFileDeleted: (name) => `${name}のファイルをドライブから削除しました。`,
    syncFilesAsk: (names) => `ほかの端末から保存された訳のファイルを、この端末にもダウンロードしますか?\n${names}`,
    syncFileReplaceAsk: (name) => `ほかの端末で後から入れた${name}のファイルがドライブにあります。この端末のファイルをそれに置き換えますか?`,
    syncGet: 'ダウンロード',
    syncReplace: '置き換える',
    syncFilesFailed: (msg) => `訳のファイルを同期できませんでした。(${msg})`,
    syncFilesWaiting: (n) => `まだアップロードしていない訳${n}件は、Wi-Fiなどデータ料金のかからないネットワークでアップロードします。スマートフォンでは[今すぐ同期]を押すとすぐにアップロードします(モバイルデータとわかっているときを除く)。`,
    syncFileReplaceConfirm: (name) => `${name}はこの端末にすでにあります。ダウンロードするとドライブのものに置き換えます。ダウンロードしますか?`,
    syncFileIncomplete: '(まだすべてアップロードされていません)',
    syncPositionAsk: (device, ref) => `${device}で読んでいた所は${ref}です。移動しますか？`,
    syncGo: '移動',
    syncVersionsAsk: (names) => `他の端末にある訳をこの端末にもダウンロードしますか？
${names}`,
    conflictBoth: '両方', // memo_conflict_both
    conflictApplyRest: (n) => `残りの${n}個にも同じように適用`, // memo_conflict_apply_rest
    conflictDone: 'メモの選択が終わりました。', // memo_conflict_done
    conflictStopped: '選ばなかったメモは、この端末のものをそのまま残しました。', // memo_conflict_stopped
  },
  // 번체 중국어. 앱 values-zh의 문구를 그대로 쓰고(형광펜은 앱처럼 '精選'), 앱에 없는 웹 문구는 새로 옮겼다.
  // 간체(zh-CN)는 이 블록에서 OpenCC t2s로 만든다
  zh: {
    listLoading: '正在載入清單…',
    listFailed: '無法載入聖經清單',
    downloading: '下載中……', // text_downloading
    missingVerse: '（沒有）', // text_not_exist_verses
    ot: '舊約', // text_ot
    nt: '新約', // text_nt
    textSize: '文字大小', // text_pref_textsize_preferences
    smaller: '縮小',
    larger: '放大',
    prev: '上一章',
    next: '下一章',
    pickBook: '選擇書卷',
    pickChapter: '選擇章',
    pickVerse: '選擇節',
    versePos: (now, last) => `共 ${last} 節中的第 ${now} 節`,
    readCheck: '將本章標記為已閱讀',
    checkedAsRead: '標記為已閱讀。', // text_checked_as_read_in_chapter_list
    uncheckedRead: '取消閱讀標記。', // text_release_as_unread_in_chapter_list
    checkedAllTrans: '標示本譯本為已閱讀', // text_checked_all_trans
    uncheckedAllTrans: '取消標示本譯本的閱讀標記', // text_ubchecked_all_trans
    readCheckFailed: '無法儲存閱讀標記',
    readStats: '閱讀統計', // menu_read_check_table
    statsTotal: '全部', // text_total
    statsValue: (read, total, pct) => `${read} / ${total} 章 · ${pct}%`,
    statsReset: '重設閱讀檢查', // menu_init_read_check
    statsResetConfirm: (name) => `要清除「${name}」的所有閱讀標記嗎？`,
    statsResetDone: '重設閱讀統計', // text_initiated_reading_statistics
    backToBooks: '書卷',
    close: '關閉',
    version: '譯本',
    pickVersions: '並列檢視', // menu_sel_ver
    pickOneVersion: '單一檢視', // menu_sel_one_ver
    barBottom: '書卷/章列置於下方', // text_pref_header_bottom
    viewerSettings: '閱讀器設定', // text_title_pref_1
    groupScreen: '畫面配置', // pref_group_screen
    groupColors: '文字與顏色', // pref_group_text + pref_group_colors
    oneColumnHint: '關閉時，會依畫面寬度分成兩欄以上並排顯示。在寬螢幕上，多個譯本會排在同一列。',
    showVerName: '顯示譯本名稱', // 앱은 반대 뜻의 text_pref_nomargin_preferences
    showVerNameHint: '同時閱讀多個譯本時，在每一欄顯示譯本名稱。',
    fontColor: '文字顏色', // text_pref_fontcolor
    bgColor: '背景顏色', // text_pref_bgcolor
    colorPresets: { light: '淺色', dark: '深色', sepia: '復古', green: '淺綠' },
    colorSample: '起初，神創造天地。',
    colorReset: '恢復預設顏色',
    groupHighlight: '精選設定', // text_title_pref_highlight
    hlStyle: '精選標示方式', // text_pref_underline_preferences
    hlStyleHint: '選擇精選經節的顯示方式，可以複選。', // text_pref_underline_preferences_summary
    hlStyles: ['螢光筆背景', '底線', '文字顏色', '粗體'], // entries_highlight_style(highlightStyle.STYLES 차례)
    hlColor: '螢光筆顏色', // text_pref_highlightcolor
    hlTextColor: '底線/文字顏色', // text_pref_underlinecolor
    hlNeedOne: '請至少選擇一種精選標示方式。', // text_highlight_style_need_one
    groupNav: '移動與觸控', // pref_group_navigation
    navBar: '顯示移動按鈕', // text_pref_navigation_bar_preference
    navBarHint: '在經文上方顯示移動按鈕。',
    navPos: '移動按鈕位置',
    navPositions: {
      'right-middle': '右側中間',
      'right-bottom': '右下',
      'left-middle': '左側中間',
      'left-bottom': '左下',
    },
    navBarOptions: { // entries_navigation_bar(앱 zh에는 1~4만 있어 나머지는 새로 옮김)
      1: '隱藏導航欄',
      2: '只有經節的導航欄',
      3: '只有本章的導航欄',
      5: '只有歷史的導航欄',
      4: '本章與經節的導航欄',
      6: '經節與歷史的導航欄',
      7: '本章與歷史的導航欄',
      8: '經節、本章與歷史的導航欄',
    },
    navUnit: '用上下按鈕移動', // text_pref_volumekey_preference를 웹에 맞게
    navUnits: { verse: '移動1節', page: '移動1畫面', chapter: '移動1章' }, // entries_volumekey
    swipeChapter: '左右滑動換章', // text_pref_swipe_chapter
    swipeChapterHint: '將經文向左或向右滑動，即可前往下一章或上一章。若捲動時常常不小心換章，請關閉此功能。',
    ttsPlay: '朗讀本章（語音）', // text_launch_tts_player
    ttsPlayVerse: '從選取的經節開始朗讀（語音）', // text_launch_tts_player_for_a_verse를 고침
    ttsSpeed: (rate) => `朗讀速度 ${rate}`,
    ttsPause: '暫停',
    ttsResume: '繼續朗讀',
    ttsStop: '停止朗讀',
    ttsNoVoice: '沒有這個語言的聲音，請安裝語音資料。', // text_tts_no_voice
    ttsFailed: '無法產生本章的語音。', // text_tts_failed
    groupTts: '語音（TTS）設定', // text_title_pref_tts
    ttsButton: '顯示音訊按鈕', // text_pref_audio_button
    ttsButtonHint: '在閱讀器中顯示音訊按鈕（▶）。不使用音訊時可以關閉。', // text_pref_audio_button_summary
    ttsReadCheck: '有聲聖經閱讀標記', // text_pref_autoaudioreadcheck_preference
    ttsReadCheckHint: '有聲聖經讀完一章時，自動將該章標記為已讀', // text_pref_autoaudioreadcheck_preference_summary
    ttsVoice: '聲音', // text_pref_tts_voice
    ttsVoiceSummary: (lang, voice) => `目前聖經語言：${lang} / ${voice}`, // text_pref_tts_voice_summary
    ttsVoiceDefault: '手機預設', // text_tts_voice_default
    ttsVoiceNetwork: '需要網路', // text_tts_voice_network
    ttsVoiceItem: (n) => `聲音 ${n}`, // text_tts_voice_item
    ttsInstall: '安裝/管理語音資料', // text_pref_tts_install
    ttsInstallHint: '查看如何在裝置上新增聲音。',
    ttsNoLanguage: '手機上沒有這個語言的朗讀語音。要安裝語音資料嗎？', // text_tts_no_language
    ttsOpenSettings: '安裝語音', // text_tts_open_settings
    navUp: '向上',
    navDown: '向下',
    navBack: '歷史上一筆',
    navForward: '歷史下一筆',
    downAgain: '請按下鍵，然後你便可以前往下一章。', // text_vol_down_next_chapter
    pickOneHint: '從已下載的譯本和自行加入的譯本中選一個來閱讀。',
    pickVersionsHint: '已下載的譯本和自行加入的譯本。選擇多個時，會依選擇的順序並排顯示。',
    oneColumn: '單欄並列檢視', // text_pref_multilayout_preference
    ok: '完成', // alert_dialog_ok
    cancel: '取消', // alert_dialog_cancel
    delete: '刪除', // menu_delete
    downloaded: '已下載',
    deleteConfirm: (name) => `要刪除已下載的「${name}」嗎？若要再次閱讀，需要重新下載。`,
    menu: '選單',
    help: '求助', // menu_help
    helpFailed: '無法載入求助內容',
    download: '下載', // menu_download
    downloadHint: '選擇要下載的譯本後按「下載」。已下載的譯本不需網路也能閱讀，並可在「並列檢視」中選擇。',
    downloadAll: (i, n) => `下載中……（${i}/${n}）`,
    downloadDone: '下載完成。', // txt_install_result_success는 앱 메뉴 안내라 앞부분만 뜻으로
    downloadFailed: (names) => `無法下載：${names}。請檢查你的互聯網連線並再次嘗試。`, // txt_check_internet 앞부분
    noCache: '此網址無法保存聖經檔案，因此每次閱讀時都會重新下載。',
    moreVersions: '取得其他譯本（下載）›',
    noVersions: '還沒有下載任何聖經。請在「下載」中下載要閱讀的譯本。',
    importTitle: '加入聖經檔案',
    noLocal: '沒有自行加入的譯本。',
    listOld: '無法載入最新清單，顯示之前的清單',
    updateReady: '有新版本',
    updateApply: '重新載入',
    dbBlocked: '請關閉其他分頁或 App 視窗中開啟的 Lifove Bible，才能使用備忘和精選。',
    noChapter: '此譯本沒有這一章',
    loadFailed: '無法載入經文',
    ref: (book, chapter) => `${book} ${chapter}章`,
    importFiles: '加入檔案',
    importFolder: '加入資料夾',
    importHint: '加入你擁有的聖經檔案（.lfa、.bdf），或將檔案拖曳到畫面上。也可以直接加入從 App 匯出的 Download/LifoveBible/bible 資料夾。',
    importing: '加入中……',
    imported: (names) => `已加入：${names}`,
    importFailed: (items) => `無法加入：${items}`,
    importNone: '找不到聖經檔案（.lfa、.bdf）',
    reasons: {
      notZip: '無法開啟的檔案',
      noChapters: '沒有章的檔案',
      badText: '經文格式不同',
      storeFailed: '儲存失敗',
    },
    localGroup: '自行加入的譯本',
    localBadge: '自行加入',
    deleteLocalConfirm: (name) => `要刪除自行加入的「${name}」嗎？若要再次閱讀，需要重新加入檔案。`,
    localRename: (name) => `重新命名${name}`,
    localRenamePrompt: (name) => `請輸入這本聖經的名稱。留空則顯示原來的名稱(${name})。`,
    localMissing: '你加入的檔案已不存在。請重新加入',
    dropHere: '放在這裡即可加入聖經檔案（.lfa、.bdf）',
    search: '搜尋', // label_search
    keywordA: '關鍵字A', // txt_hint_search
    keywordB: '關鍵字B', // txt_hint_search2
    searchRange: '搜尋範圍',
    searchVersion: '要搜尋的譯本',
    themes: '分類',
    rangeAll: '全部', // text_total
    themeNames: { // text_moses ~ text_rev
      moses: '摩西五經',
      hist: '歷史書',
      poet: '智慧書',
      majProphet: '大先知書',
      mnrProphet: '小先知書',
      gospel: '福音書',
      ntHist: '新約歷史書（徒）',
      paulLetter: '保羅書信',
      genLetter: '─保羅一般書信',
      prisonLetter: '─監獄書信',
      pastorLetter: '─牧養書信',
      comLetter: '一般書信',
      rev: '啟示書（啟）',
    },
    keywordRequired: '請輸入關鍵字A。', // text_search_keyword_required
    keywordTooShort: '請在關鍵字A輸入兩個字以上。', // text_search_keyword_too_short
    searching: (book) => `搜尋中…… ${book}`, // text_searching
    noResult: '沒有結果！', // text_no_search_result
    found: (n) => `總數 ${n} 節經文被找到。`, // text_total_count + text_found_verses
    searchCanceled: (n) => `搜尋取消。找到 ${n} 節經文。`, // text_search_canceled
    searchFailed: '無法搜尋',
    stop: '停止',
    more: (n) => `顯示更多（還有 ${n} 筆）`,
    verseRef: (book, chapter, verse) => `${book} ${chapter}:${verse}`,
    selCount: (n) => `已選 ${n} 節`,
    copy: '複製',
    share: '分享',
    copyVerses: '複製所選經節', // menu_copy_verse
    shareVerses: '傳送所選經節', // menu_verse_send
    clearSelection: '取消選取所選經節', // menu_check_clear
    copied: '已複製選取的經節', // text_copied_selected_verses
    copyFailed: '無法複製',
    shareFailed: '無法分享',
    highlight: '精選',
    highlightOff: '取消',
    highlightVerses: '精選所選經節', // menu_verse_underline
    removeHighlight: '取消精選', // menu_verse_underline_remove
    highlightFailed: '無法儲存精選',
    myHighlights: '我的精選', // menu_underline_list
    orderRecent: '最近的排序', // menu_timely_order
    orderBook: '名稱排序', // menu_book_order
    hlEmpty: '還沒有精選的經節。\n在閱讀畫面點選經節後，按「精選」即可加入精選。', // text_underline_empty를 웹에 맞게
    hlSend: '傳送精選', // menu_underline_send
    hlCopiedAll: '已將精選清單複製到剪貼簿。',
    deleteAll: '全部刪除', // menu_delete_all
    hlDeleteAllConfirm: '你真的要刪除你所有的精選？', // text_ask_to_delete_all_my_underlines(위젯 문구는 뺌)
    hlDeletedAll: '已刪除所有我的精選！', // text_deleted_all_my_underline
    hlDelete: (ref) => `取消 ${ref} 的精選`,
    hlDeleteConfirm: (ref) => `要取消 ${ref} 的精選嗎？`,
    hlLoadFailed: '無法讀取精選',
    noSuchVersion: (name) => `找不到譯本「${name}」。請透過「下載」或「加入聖經檔案」重新加入。`,
    addBookmark: '加入書籤', // menu_add_bookmark
    copyChapter: '複製本章', // menu_copy_chapter
    sendChapter: '傳送本章', // menu_chapter_send
    copiedChapter: '已複製本章', // text_copied_this_chapter (앱은 메뉴와 같은 '複製本章')
    reportVerseError: '回報經文錯誤', // menu_report_verse_error
    verseErrorSubject: '[經文錯誤] 靈愛聖經', // text_verse_error_subject
    verseErrorGuide: '請在下方詳細寫明經節哪個部分有誤，以及應如何修正。若可以，也請附上依據（例如紙本聖經及頁數）。', // text_verse_error_guide
    reportMailHint: '若沒有開啟電子郵件 App，請將回報寄到 bible@lifove.net。', // text_no_mail_app를 고침(웹은 메일 앱이 열렸는지 알 수 없다)
    bookmarks: '書籤', // menu_bookmark
    bookmarkAdded: (ref) => `儲存書籤成功！（${ref}）`, // text_bookmark_added에 위치를 붙임
    bookmarkFailed: '無法儲存書籤',
    bmEmpty: '沒有書籤\n閱讀時按 ☰ →「加入書籤」，即可儲存畫面最上方的經節。', // text_no_bookmark를 웹에 맞게
    bmDelete: (ref) => `刪除書籤 ${ref}`,
    bmDeleteConfirm: (ref) => `要刪除書籤 ${ref} 嗎？`,
    bmLoadFailed: '無法讀取書籤',
    memo: '備忘',
    memoVerse: '新增備忘', // menu_memo
    memoOpen: (ref) => `查看 ${ref} 的備忘`,
    save: '儲存', // alert_dialog_save
    del: '刪除', // alert_dialog_del
    memoSaveChanges: '要儲存備忘的修改嗎？', // memo_save_changes
    memoDiscard: '不儲存', // memo_discard_changes
    memoDeleteConfirm: '要刪除這個備忘嗎？', // memo_delete_confirm
    memoShow: '顯示備忘', // menu_memo_show
    memoHide: '隱藏備忘', // menu_memo_hide
    memoFailed: '無法儲存備忘',
    memoLoadFailed: '無法讀取備忘',
    myMemos: '我的備忘', // menu_memo_list
    myMemoList: '我的備忘', // text_my_memo_list
    mlEmpty: '還沒有備忘。\n在閱讀畫面點選經節後，按「備忘」即可新增備忘。', // text_memo_empty를 웹에 맞게
    mlSearchHint: '搜尋備忘', // text_memo_search_hint
    mlSearchNone: '沒有符合搜尋的備忘。', // text_memo_search_none
    mlSearchClear: '清除搜尋', // text_memo_search_clear
    mlSend: '傳送備忘', // menu_memo_backup
    mlCopiedAll: '已將備忘清單複製到剪貼簿。',
    mlDeleteAllConfirm: '你真的要刪除你所有的備忘？', // text_ask_to_delete_all_my_memos
    mlDeletedAll: '已刪除所有我的備忘！', // text_deleted_all_my_memo
    mlDelete: (ref) => `刪除 ${ref} 的備忘`,
    mlDeleteConfirm: (ref) => `要刪除 ${ref} 的備忘嗎？`,
    groupMemo: '備忘', // pref_group_memo
    memoBooks: '備忘冊', // text_memo_books
    memoBooksHint: '新增備忘冊，或變更名稱、順序與輸入方式', // text_memo_books_summary
    memoOptions: ['儲存後跳到下一節', '略過已有備忘的經節', '章末時跳到下一章', '按 Enter 鍵儲存'], // text_memo_book_continuous, _skip_filled, _next_chapter, _enter_saves
    memoOptionOn: (name) => `${name}：開啟`, // text_memo_option_on
    memoOptionOff: (name) => `${name}：關閉`, // text_memo_option_off
    memoNoNextVerse: '這一章已沒有可寫的經節', // text_memo_no_next_verse
    memoBookDefault: '預設備忘冊', // text_memo_book_default
    memoBookAdd: '+ 新增備忘冊', // text_memo_book_add
    memoBookNew: '新備忘冊', // text_memo_book_new
    memoBookName: '名稱', // text_memo_book_name
    memoBookManage: '管理備忘冊', // text_memo_book_manage
    memoBookCount: (n) => `備忘 ${n} 則`, // text_memo_book_count
    memoBookMoveUp: (name) => `將「${name}」上移`, // text_memo_book_move_up
    memoBookMoveDown: (name) => `將「${name}」下移`, // text_memo_book_move_down
    memoBookDelete: (name) => `刪除「${name}」`,
    memoBookDeleteConfirm: (name, n) => `要刪除備忘冊「${name}」嗎？其中的 ${n} 則備忘也會全部刪除。`, // text_memo_book_delete_confirm
    memoBookDeleteConfirmEmpty: (name) => `要刪除備忘冊「${name}」嗎？`, // text_memo_book_delete_confirm_empty
    memoBookPick: '切換備忘冊',
    memoBookFailed: '無法儲存備忘冊',
    backupMenu: '資料管理', // text_title_pref_3(앱 설정의 데이터 관리 묶음). 동기화·백업·복구를 한 창에(2026-11-28)
    backupSaveTitle: '資料備份', // menu_db_backup
    backupSaveHint: '備份我的精選、我的備忘及閱讀統計。書籤和備忘冊也會一併備份。這是與 Android App 相同的備份檔（.db），也可以在 App 的「設定 > 恢復資料」中開啟。', // text_pref_db_backup_summary에 웹 설명을 붙임
    backupRun: '進行備份', // menu_db_backup_run
    backupInProgress: '備份進行中……', // text_backup_in_progress
    backupSaved: (name) => `備份完成。\n已儲存至：${name}（瀏覽器的下載資料夾）`, // text_backup_successfully + text_backup_location
    backupFailed: '備份失敗！', // text_backup_failed
    backupLast: (when) => `上次備份：${when}`,
    backupNever: '尚未備份過。',
    backupMoveHint: '備份檔也可以在其他裝置上使用。透過電子郵件、通訊軟體、雲端硬碟等方式移動檔案後，在 Android 手機或平板的 Lifove Bible App 中到「設定 > 恢復資料」，或在其他裝置或瀏覽器的網頁版中按下方的「進行恢復」，選擇該檔案，即可繼續使用精選、備忘等紀錄。', // 다른 기기의 앱·웹에서 복구해 이어 쓰기(사용자 요청 2026-11-26)
    // 기록 보관 안내·책임 안내(backupNotice1~3)는 사용자와 정한 문구. 뜻을 바꾸지 않고 정중하게 옮겼다
    backupNoticeTitle: '請務必閱讀：紀錄保存須知',
    backupNotice1: '精選、備忘、書籤和閱讀紀錄只儲存在這部裝置的這個瀏覽器中，不會另外保存在伺服器上。若清除瀏覽器的網站資料、儲存空間不足，或更換裝置或瀏覽器，紀錄可能會遺失，而遺失的紀錄無法復原。iPhone、iPad 的 Safari 若未加入主畫面，且超過 7 天沒有開啟，也可能會刪除紀錄。',
    backupNotice2: '為了避免遺失寶貴的紀錄，請定期備份，並將備份檔一併保存在電腦或雲端硬碟等安全的地方。距離上次備份超過 7 天時，會在畫面上方提醒您。',
    backupNoticeSync: '開啟 Google 雲端硬碟同步（☰ → 資料管理的最上方）後，紀錄也會儲存在您自己的 Google 雲端硬碟中，可以在其他裝置上接著使用。開啟同步且 7 天內完成過同步時，不會顯示備份提醒。不過，同時保存備份檔案會更安全。',
    backupNotice3: '備份及備份檔的保存需要由您自行管理。因未備份而遺失的紀錄，我們無法為您復原，此責任由使用者自行承擔，敬請見諒。',
    reminderNever: '還有尚未備份的紀錄。為了避免紀錄遺失，請進行備份。',
    reminderDays: (n) => `距離上次備份已經 ${n} 天了。為了避免紀錄遺失，請進行備份。`,
    reminderBackup: '備份',
    reminderLater: '稍後',
    restoreTitle: '恢復資料', // menu_db_restore
    restoreHint: '恢復已備份的資料。也可以選擇 Android App 的備份檔（Download/LifoveBible 資料夾中的 lifovebible_backup_….db、lifovebible_autobackup.db，或舊版本的 lifovebible）。', // text_pref_db_restore_summary에 웹 설명을 붙임
    restoreRun: '進行恢復', // menu_db_restore_run
    restoreMerge: ['合併（建議）', '保留目前的資料，加入只在備份中、或在備份中較晚修改的紀錄。內容不同的備忘會逐一讓你選擇。'], // restore_mode_merge
    restoreReplace: ['取代', '刪除目前的資料，改用備份。備份中沒有書籤時，會保留目前的書籤。'], // restore_mode_replace에서 위젯 문장을 뺌
    restoreInProgress: '資料恢復進行中……', // text_restore_in_progress
    restoreDone: '資料恢復完成。', // text_restore_successfully
    restoreFailed: '資料恢復失敗！', // text_restore_failed
    restoreNotBackup: '這不是 Lifove Bible 的備份檔。目前的資料沒有變更。',
    restoreNewer: '這個備份是由較新版本的 Lifove Bible 建立的。請在網頁版更新後再試一次。目前的資料沒有變更。', // text_restore_newer_backup을 웹에 맞게
    mergeDone: (u, m, r, b) => `已合併備份。\n從備份取得：精選 ${u} 個、備忘 ${m} 個、閱讀紀錄 ${r} 個、書籤 ${b} 個`, // restore_merge_done
    mergeNothing: '備份中沒有新的紀錄。目前的資料已是最新。', // restore_merge_nothing
    mergeConflicts: (n) => `這部裝置和備份中有 ${n} 個內容不同的備忘。請逐一選擇。`, // restore_merge_conflicts(這支手機 → 這部裝置)
    conflictTitle: (i, n) => `選擇備忘（${i}/${n}）`, // memo_conflict_title
    conflictLocal: '這部裝置', // memo_conflict_local(這支手機)
    conflictBackup: '備份', // memo_conflict_backup
    conflictOther: '其他裝置', // sync memo conflict (web first)
    conflictDeleted: '（已刪除）', // memo_conflict_deleted(앱 7.7)
    conflictStoppedSync: '未選擇的備忘暫時保留這個裝置的內容，下次同步時會再詢問。', // memo_conflict_stopped_sync
    syncOtherBooks: (list) => `其他備忘冊有新的備忘：${list}。請在備忘列表中切換備忘冊查看。`, // text_sync_other_books
    groupSync: '同步',
    syncTitle: 'Google 雲端硬碟同步',
    syncRowOff: '關閉',
    syncRowOn: (email) => `開啟 · ${email}`,
    syncRowOnNoEmail: '開啟',
    syncAbout: '將精選、備忘、備忘冊、書籤、閱讀紀錄和譯本順序儲存到您的 Google 雲端硬碟，並與其他裝置保持一致。在 Android 應用程式（7.7 以上）和其他瀏覽器的網頁版中，以同一個 Google 帳戶開啟後，即可接著使用。雲端硬碟中只使用本應用程式專用的資料夾，不會讀取您雲端硬碟中的其他檔案。',
    syncOn: '使用同步',
    syncOnHint: '開啟時請選擇 Google 帳戶，這個瀏覽器的紀錄和雲端硬碟的紀錄會合併。',
    syncAccount: (email) => `帳戶：${email}`,
    syncLast: (when) => `上次同步：${when}`,
    syncNever: '尚未同步。',
    syncNow: '立即同步',
    syncRunning: '同步中…',
    syncDone: '同步完成。',
    syncNewer: '其他裝置的應用程式版本較新，因此有部分紀錄無法讀取。網頁版更新後會再同步。',
    syncLeft: (n) => `還有 ${n} 則備忘尚未選擇。全部選擇之前，不會上傳這部裝置的紀錄。`,
    syncFailed: (msg) => `無法同步。請檢查網路連線。（${msg}）`,
    syncSignInFailed: '無法登入 Google。請確認彈出式視窗未被封鎖。',
    syncOffDone: '已關閉同步。雲端硬碟和這部裝置的紀錄都會保留。',
    syncWebNote: '網頁版的 Google 登入只能維持 1 小時。開啟網頁版時以及超過 1 小時後，請按一下畫面上方出現的 [同步]。之後每次修改紀錄都會自動同步。',
    syncLogTitle: '詳細資料（同步紀錄）',
    syncPaused: 'Google 雲端硬碟同步已暫停。',
    syncResume: '同步',
    syncConflicts: (n) => `有 ${n} 則同步的備忘內容不同。`,
    syncChoose: '選擇',
    syncFilesTitle: '雲端硬碟中的譯本檔案',
    syncFilesHint: '無法從伺服器下載的譯本（自行加入的譯本、付費譯本）會以檔案上傳到雲端硬碟，讓其他裝置也能下載。這會佔用雲端硬碟的儲存空間。在這部裝置上刪除譯本，雲端硬碟中的檔案仍會保留。',
    syncFilesSummary: (n, mb) => `譯本 ${n} 個，${mb} MB`,
    syncFilesNone: '雲端硬碟中沒有譯本檔案。',
    syncFilesUnknown: '同步後會顯示。',
    syncFileDeleteAsk: (name) => `${name}：從雲端硬碟刪除後，其他裝置將無法再下載這個譯本。要刪除嗎？`,
    syncFileDeleteAskPlain: (name) => `要從雲端硬碟刪除 ${name} 檔案嗎？`,
    syncFileDeleted: (name) => `已從雲端硬碟刪除 ${name} 檔案。`,
    syncFilesAsk: (names) => `要將其他裝置上傳的譯本檔案也下載到這部裝置嗎？\n${names}`,
    syncFileReplaceAsk: (name) => `雲端硬碟中有其他裝置較晚加入的 ${name} 檔案。要用它取代這部裝置的檔案嗎？`,
    syncGet: '下載',
    syncReplace: '取代',
    syncFilesFailed: (msg) => `無法同步譯本檔案。（${msg}）`,
    syncFilesWaiting: (n) => `尚未上傳的 ${n} 個譯本，會在 Wi-Fi 等不產生數據費用的網路上上傳。在手機上按 [立即同步] 會立刻上傳（已知使用行動數據時除外）。`,
    syncFileReplaceConfirm: (name) => `這部裝置已有 ${name}。下載後會以雲端硬碟中的檔案取代。要下載嗎？`,
    syncFileIncomplete: '（尚未完整上傳）',
    syncPositionAsk: (device, ref) => `在${device}上讀到${ref}。要前往嗎？`,
    syncGo: '前往',
    syncVersionsAsk: (names) => `要在此裝置下載其他裝置上的譯本嗎？
${names}`,
    conflictBoth: '兩者都要', // memo_conflict_both
    conflictApplyRest: (n) => `剩下的 ${n} 個也同樣處理`, // memo_conflict_apply_rest
    conflictDone: '備忘選擇完成。', // memo_conflict_done
    conflictStopped: '未選擇的備忘保留這部裝置的內容。', // memo_conflict_stopped
  },
  // 간체 중국어. 위 zh(번체) 블록을 OpenCC t2s로 바꿨다. 앱 values-zh-rCN도 번체를 글자만 바꾼 것이라 용어(设定, 资料, 检视, 储存)가 같다.
  // 번체를 고치면 여기도 같이 고친다
  'zh-CN': {
    listLoading: '正在载入清单…',
    listFailed: '无法载入圣经清单',
    downloading: '下载中……', // text_downloading
    missingVerse: '（没有）', // text_not_exist_verses
    ot: '旧约', // text_ot
    nt: '新约', // text_nt
    textSize: '文字大小', // text_pref_textsize_preferences
    smaller: '缩小',
    larger: '放大',
    prev: '上一章',
    next: '下一章',
    pickBook: '选择书卷',
    pickChapter: '选择章',
    pickVerse: '选择节',
    versePos: (now, last) => `共 ${last} 节中的第 ${now} 节`,
    readCheck: '将本章标记为已阅读',
    checkedAsRead: '标记为已阅读。', // text_checked_as_read_in_chapter_list
    uncheckedRead: '取消阅读标记。', // text_release_as_unread_in_chapter_list
    checkedAllTrans: '标示本译本为已阅读', // text_checked_all_trans
    uncheckedAllTrans: '取消标示本译本的阅读标记', // text_ubchecked_all_trans
    readCheckFailed: '无法储存阅读标记',
    readStats: '阅读统计', // menu_read_check_table
    statsTotal: '全部', // text_total
    statsValue: (read, total, pct) => `${read} / ${total} 章 · ${pct}%`,
    statsReset: '重设阅读检查', // menu_init_read_check
    statsResetConfirm: (name) => `要清除「${name}」的所有阅读标记吗？`,
    statsResetDone: '重设阅读统计', // text_initiated_reading_statistics
    backToBooks: '书卷',
    close: '关闭',
    version: '译本',
    pickVersions: '并列检视', // menu_sel_ver
    pickOneVersion: '单一检视', // menu_sel_one_ver
    barBottom: '书卷/章列置于下方', // text_pref_header_bottom
    viewerSettings: '阅读器设定', // text_title_pref_1
    groupScreen: '画面配置', // pref_group_screen
    groupColors: '文字与颜色', // pref_group_text + pref_group_colors
    oneColumnHint: '关闭时，会依画面宽度分成两栏以上并排显示。在宽萤幕上，多个译本会排在同一列。',
    showVerName: '显示译本名称', // 앱은 반대 뜻의 text_pref_nomargin_preferences
    showVerNameHint: '同时阅读多个译本时，在每一栏显示译本名称。',
    fontColor: '文字颜色', // text_pref_fontcolor
    bgColor: '背景颜色', // text_pref_bgcolor
    colorPresets: { light: '浅色', dark: '深色', sepia: '复古', green: '浅绿' },
    colorSample: '起初，神创造天地。',
    colorReset: '恢复预设颜色',
    groupHighlight: '精选设定', // text_title_pref_highlight
    hlStyle: '精选标示方式', // text_pref_underline_preferences
    hlStyleHint: '选择精选经节的显示方式，可以复选。', // text_pref_underline_preferences_summary
    hlStyles: ['萤光笔背景', '底线', '文字颜色', '粗体'], // entries_highlight_style(highlightStyle.STYLES 차례)
    hlColor: '萤光笔颜色', // text_pref_highlightcolor
    hlTextColor: '底线/文字颜色', // text_pref_underlinecolor
    hlNeedOne: '请至少选择一种精选标示方式。', // text_highlight_style_need_one
    groupNav: '移动与触控', // pref_group_navigation
    navBar: '显示移动按钮', // text_pref_navigation_bar_preference
    navBarHint: '在经文上方显示移动按钮。',
    navPos: '移动按钮位置',
    navPositions: {
      'right-middle': '右侧中间',
      'right-bottom': '右下',
      'left-middle': '左侧中间',
      'left-bottom': '左下',
    },
    navBarOptions: { // entries_navigation_bar(앱 zh에는 1~4만 있어 나머지는 새로 옮김)
      1: '隐藏导航栏',
      2: '只有经节的导航栏',
      3: '只有本章的导航栏',
      5: '只有历史的导航栏',
      4: '本章与经节的导航栏',
      6: '经节与历史的导航栏',
      7: '本章与历史的导航栏',
      8: '经节、本章与历史的导航栏',
    },
    navUnit: '用上下按钮移动', // text_pref_volumekey_preference를 웹에 맞게
    navUnits: { verse: '移动1节', page: '移动1画面', chapter: '移动1章' }, // entries_volumekey
    swipeChapter: '左右滑动换章', // text_pref_swipe_chapter
    swipeChapterHint: '将经文向左或向右滑动，即可前往下一章或上一章。若卷动时常常不小心换章，请关闭此功能。',
    ttsPlay: '朗读本章（语音）', // text_launch_tts_player
    ttsPlayVerse: '从选取的经节开始朗读（语音）', // text_launch_tts_player_for_a_verse를 고침
    ttsSpeed: (rate) => `朗读速度 ${rate}`,
    ttsPause: '暂停',
    ttsResume: '继续朗读',
    ttsStop: '停止朗读',
    ttsNoVoice: '没有这个语言的声音，请安装语音资料。', // text_tts_no_voice
    ttsFailed: '无法产生本章的语音。', // text_tts_failed
    groupTts: '语音（TTS）设定', // text_title_pref_tts
    ttsButton: '显示音讯按钮', // text_pref_audio_button
    ttsButtonHint: '在阅读器中显示音讯按钮（▶）。不使用音讯时可以关闭。', // text_pref_audio_button_summary
    ttsReadCheck: '有声圣经阅读标记', // text_pref_autoaudioreadcheck_preference
    ttsReadCheckHint: '有声圣经读完一章时，自动将该章标记为已读', // text_pref_autoaudioreadcheck_preference_summary
    ttsVoice: '声音', // text_pref_tts_voice
    ttsVoiceSummary: (lang, voice) => `目前圣经语言：${lang} / ${voice}`, // text_pref_tts_voice_summary
    ttsVoiceDefault: '手机预设', // text_tts_voice_default
    ttsVoiceNetwork: '需要网路', // text_tts_voice_network
    ttsVoiceItem: (n) => `声音 ${n}`, // text_tts_voice_item
    ttsInstall: '安装/管理语音资料', // text_pref_tts_install
    ttsInstallHint: '查看如何在装置上新增声音。',
    ttsNoLanguage: '手机上没有这个语言的朗读语音。要安装语音资料吗？', // text_tts_no_language
    ttsOpenSettings: '安装语音', // text_tts_open_settings
    navUp: '向上',
    navDown: '向下',
    navBack: '历史上一笔',
    navForward: '历史下一笔',
    downAgain: '请按下键，然后你便可以前往下一章。', // text_vol_down_next_chapter
    pickOneHint: '从已下载的译本和自行加入的译本中选一个来阅读。',
    pickVersionsHint: '已下载的译本和自行加入的译本。选择多个时，会依选择的顺序并排显示。',
    oneColumn: '单栏并列检视', // text_pref_multilayout_preference
    ok: '完成', // alert_dialog_ok
    cancel: '取消', // alert_dialog_cancel
    delete: '删除', // menu_delete
    downloaded: '已下载',
    deleteConfirm: (name) => `要删除已下载的「${name}」吗？若要再次阅读，需要重新下载。`,
    menu: '选单',
    help: '求助', // menu_help
    helpFailed: '无法载入求助内容',
    download: '下载', // menu_download
    downloadHint: '选择要下载的译本后按「下载」。已下载的译本不需网路也能阅读，并可在「并列检视」中选择。',
    downloadAll: (i, n) => `下载中……（${i}/${n}）`,
    downloadDone: '下载完成。', // txt_install_result_success는 앱 메뉴 안내라 앞부분만 뜻으로
    downloadFailed: (names) => `无法下载：${names}。请检查你的互联网连线并再次尝试。`, // txt_check_internet 앞부분
    noCache: '此网址无法保存圣经档案，因此每次阅读时都会重新下载。',
    moreVersions: '取得其他译本（下载）›',
    noVersions: '还没有下载任何圣经。请在「下载」中下载要阅读的译本。',
    importTitle: '加入圣经档案',
    noLocal: '没有自行加入的译本。',
    listOld: '无法载入最新清单，显示之前的清单',
    updateReady: '有新版本',
    updateApply: '重新载入',
    dbBlocked: '请关闭其他分页或 App 视窗中开启的 Lifove Bible，才能使用备忘和精选。',
    noChapter: '此译本没有这一章',
    loadFailed: '无法载入经文',
    ref: (book, chapter) => `${book} ${chapter}章`,
    importFiles: '加入档案',
    importFolder: '加入资料夹',
    importHint: '加入你拥有的圣经档案（.lfa、.bdf），或将档案拖曳到画面上。也可以直接加入从 App 汇出的 Download/LifoveBible/bible 资料夹。',
    importing: '加入中……',
    imported: (names) => `已加入：${names}`,
    importFailed: (items) => `无法加入：${items}`,
    importNone: '找不到圣经档案（.lfa、.bdf）',
    reasons: {
      notZip: '无法开启的档案',
      noChapters: '没有章的档案',
      badText: '经文格式不同',
      storeFailed: '储存失败',
    },
    localGroup: '自行加入的译本',
    localBadge: '自行加入',
    deleteLocalConfirm: (name) => `要删除自行加入的「${name}」吗？若要再次阅读，需要重新加入档案。`,
    localRename: (name) => `重新命名${name}`,
    localRenamePrompt: (name) => `请输入这本圣经的名称。留空则显示原来的名称(${name})。`,
    localMissing: '你加入的档案已不存在。请重新加入',
    dropHere: '放在这里即可加入圣经档案（.lfa、.bdf）',
    search: '搜寻', // label_search
    keywordA: '关键字A', // txt_hint_search
    keywordB: '关键字B', // txt_hint_search2
    searchRange: '搜寻范围',
    searchVersion: '要搜寻的译本',
    themes: '分类',
    rangeAll: '全部', // text_total
    themeNames: { // text_moses ~ text_rev
      moses: '摩西五经',
      hist: '历史书',
      poet: '智慧书',
      majProphet: '大先知书',
      mnrProphet: '小先知书',
      gospel: '福音书',
      ntHist: '新约历史书（徒）',
      paulLetter: '保罗书信',
      genLetter: '─保罗一般书信',
      prisonLetter: '─监狱书信',
      pastorLetter: '─牧养书信',
      comLetter: '一般书信',
      rev: '启示书（启）',
    },
    keywordRequired: '请输入关键字A。', // text_search_keyword_required
    keywordTooShort: '请在关键字A输入两个字以上。', // text_search_keyword_too_short
    searching: (book) => `搜寻中…… ${book}`, // text_searching
    noResult: '没有结果！', // text_no_search_result
    found: (n) => `总数 ${n} 节经文被找到。`, // text_total_count + text_found_verses
    searchCanceled: (n) => `搜寻取消。找到 ${n} 节经文。`, // text_search_canceled
    searchFailed: '无法搜寻',
    stop: '停止',
    more: (n) => `显示更多（还有 ${n} 笔）`,
    verseRef: (book, chapter, verse) => `${book} ${chapter}:${verse}`,
    selCount: (n) => `已选 ${n} 节`,
    copy: '复制',
    share: '分享',
    copyVerses: '复制所选经节', // menu_copy_verse
    shareVerses: '传送所选经节', // menu_verse_send
    clearSelection: '取消选取所选经节', // menu_check_clear
    copied: '已复制选取的经节', // text_copied_selected_verses
    copyFailed: '无法复制',
    shareFailed: '无法分享',
    highlight: '精选',
    highlightOff: '取消',
    highlightVerses: '精选所选经节', // menu_verse_underline
    removeHighlight: '取消精选', // menu_verse_underline_remove
    highlightFailed: '无法储存精选',
    myHighlights: '我的精选', // menu_underline_list
    orderRecent: '最近的排序', // menu_timely_order
    orderBook: '名称排序', // menu_book_order
    hlEmpty: '还没有精选的经节。\n在阅读画面点选经节后，按「精选」即可加入精选。', // text_underline_empty를 웹에 맞게
    hlSend: '传送精选', // menu_underline_send
    hlCopiedAll: '已将精选清单复制到剪贴簿。',
    deleteAll: '全部删除', // menu_delete_all
    hlDeleteAllConfirm: '你真的要删除你所有的精选？', // text_ask_to_delete_all_my_underlines(위젯 문구는 뺌)
    hlDeletedAll: '已删除所有我的精选！', // text_deleted_all_my_underline
    hlDelete: (ref) => `取消 ${ref} 的精选`,
    hlDeleteConfirm: (ref) => `要取消 ${ref} 的精选吗？`,
    hlLoadFailed: '无法读取精选',
    noSuchVersion: (name) => `找不到译本「${name}」。请透过「下载」或「加入圣经档案」重新加入。`,
    addBookmark: '加入书签', // menu_add_bookmark
    copyChapter: '复制本章', // menu_copy_chapter
    sendChapter: '传送本章', // menu_chapter_send
    copiedChapter: '已复制本章', // text_copied_this_chapter (앱은 메뉴와 같은 '复制本章')
    reportVerseError: '回报经文错误', // menu_report_verse_error
    verseErrorSubject: '[经文错误] 灵爱圣经', // text_verse_error_subject
    verseErrorGuide: '请在下方详细写明经节哪个部分有误，以及应如何修正。若可以，也请附上依据（例如纸本圣经及页数）。', // text_verse_error_guide
    reportMailHint: '若没有开启电子邮件 App，请将回报寄到 bible@lifove.net。', // text_no_mail_app를 고침(웹은 메일 앱이 열렸는지 알 수 없다)
    bookmarks: '书签', // menu_bookmark
    bookmarkAdded: (ref) => `储存书签成功！（${ref}）`, // text_bookmark_added에 위치를 붙임
    bookmarkFailed: '无法储存书签',
    bmEmpty: '没有书签\n阅读时按 ☰ →「加入书签」，即可储存画面最上方的经节。', // text_no_bookmark를 웹에 맞게
    bmDelete: (ref) => `删除书签 ${ref}`,
    bmDeleteConfirm: (ref) => `要删除书签 ${ref} 吗？`,
    bmLoadFailed: '无法读取书签',
    memo: '备忘',
    memoVerse: '新增备忘', // menu_memo
    memoOpen: (ref) => `查看 ${ref} 的备忘`,
    save: '储存', // alert_dialog_save
    del: '删除', // alert_dialog_del
    memoSaveChanges: '要储存备忘的修改吗？', // memo_save_changes
    memoDiscard: '不储存', // memo_discard_changes
    memoDeleteConfirm: '要删除这个备忘吗？', // memo_delete_confirm
    memoShow: '显示备忘', // menu_memo_show
    memoHide: '隐藏备忘', // menu_memo_hide
    memoFailed: '无法储存备忘',
    memoLoadFailed: '无法读取备忘',
    myMemos: '我的备忘', // menu_memo_list
    myMemoList: '我的备忘', // text_my_memo_list
    mlEmpty: '还没有备忘。\n在阅读画面点选经节后，按「备忘」即可新增备忘。', // text_memo_empty를 웹에 맞게
    mlSearchHint: '搜寻备忘', // text_memo_search_hint
    mlSearchNone: '没有符合搜寻的备忘。', // text_memo_search_none
    mlSearchClear: '清除搜寻', // text_memo_search_clear
    mlSend: '传送备忘', // menu_memo_backup
    mlCopiedAll: '已将备忘清单复制到剪贴簿。',
    mlDeleteAllConfirm: '你真的要删除你所有的备忘？', // text_ask_to_delete_all_my_memos
    mlDeletedAll: '已删除所有我的备忘！', // text_deleted_all_my_memo
    mlDelete: (ref) => `删除 ${ref} 的备忘`,
    mlDeleteConfirm: (ref) => `要删除 ${ref} 的备忘吗？`,
    groupMemo: '备忘', // pref_group_memo
    memoBooks: '备忘册', // text_memo_books
    memoBooksHint: '新增备忘册，或变更名称、顺序与输入方式', // text_memo_books_summary
    memoOptions: ['储存后跳到下一节', '略过已有备忘的经节', '章末时跳到下一章', '按 Enter 键储存'], // text_memo_book_continuous, _skip_filled, _next_chapter, _enter_saves
    memoOptionOn: (name) => `${name}：开启`, // text_memo_option_on
    memoOptionOff: (name) => `${name}：关闭`, // text_memo_option_off
    memoNoNextVerse: '这一章已没有可写的经节', // text_memo_no_next_verse
    memoBookDefault: '预设备忘册', // text_memo_book_default
    memoBookAdd: '+ 新增备忘册', // text_memo_book_add
    memoBookNew: '新备忘册', // text_memo_book_new
    memoBookName: '名称', // text_memo_book_name
    memoBookManage: '管理备忘册', // text_memo_book_manage
    memoBookCount: (n) => `备忘 ${n} 则`, // text_memo_book_count
    memoBookMoveUp: (name) => `将「${name}」上移`, // text_memo_book_move_up
    memoBookMoveDown: (name) => `将「${name}」下移`, // text_memo_book_move_down
    memoBookDelete: (name) => `删除「${name}」`,
    memoBookDeleteConfirm: (name, n) => `要删除备忘册「${name}」吗？其中的 ${n} 则备忘也会全部删除。`, // text_memo_book_delete_confirm
    memoBookDeleteConfirmEmpty: (name) => `要删除备忘册「${name}」吗？`, // text_memo_book_delete_confirm_empty
    memoBookPick: '切换备忘册',
    memoBookFailed: '无法储存备忘册',
    backupMenu: '资料管理', // text_title_pref_3(앱 설정의 데이터 관리 묶음). 동기화·백업·복구를 한 창에(2026-11-28)
    backupSaveTitle: '资料备份', // menu_db_backup
    backupSaveHint: '备份我的精选、我的备忘及阅读统计。书签和备忘册也会一并备份。这是与 Android App 相同的备份档（.db），也可以在 App 的「设定 > 恢复资料」中开启。', // text_pref_db_backup_summary에 웹 설명을 붙임
    backupRun: '进行备份', // menu_db_backup_run
    backupInProgress: '备份进行中……', // text_backup_in_progress
    backupSaved: (name) => `备份完成。\n已储存至：${name}（浏览器的下载资料夹）`, // text_backup_successfully + text_backup_location
    backupFailed: '备份失败！', // text_backup_failed
    backupLast: (when) => `上次备份：${when}`,
    backupNever: '尚未备份过。',
    backupMoveHint: '备份档也可以在其他装置上使用。透过电子邮件、通讯软体、云端硬碟等方式移动档案后，在 Android 手机或平板的 Lifove Bible App 中到「设定 > 恢复资料」，或在其他装置或浏览器的网页版中按下方的「进行恢复」，选择该档案，即可继续使用精选、备忘等纪录。', // 다른 기기의 앱·웹에서 복구해 이어 쓰기(사용자 요청 2026-11-26)
    // 기록 보관 안내·책임 안내(backupNotice1~3)는 사용자와 정한 문구. 뜻을 바꾸지 않고 정중하게 옮겼다
    backupNoticeTitle: '请务必阅读：纪录保存须知',
    backupNotice1: '精选、备忘、书签和阅读纪录只储存在这部装置的这个浏览器中，不会另外保存在伺服器上。若清除浏览器的网站资料、储存空间不足，或更换装置或浏览器，纪录可能会遗失，而遗失的纪录无法复原。iPhone、iPad 的 Safari 若未加入主画面，且超过 7 天没有开启，也可能会删除纪录。',
    backupNotice2: '为了避免遗失宝贵的纪录，请定期备份，并将备份档一并保存在电脑或云端硬碟等安全的地方。距离上次备份超过 7 天时，会在画面上方提醒您。',
    backupNoticeSync: '开启 Google 云端硬碟同步（☰ → 资料管理的最上方）后，纪录也会储存在您自己的 Google 云端硬碟中，可以在其他装置上接著使用。开启同步且 7 天内完成过同步时，不会显示备份提醒。不过，同时保存备份档案会更安全。',
    backupNotice3: '备份及备份档的保存需要由您自行管理。因未备份而遗失的纪录，我们无法为您复原，此责任由使用者自行承担，敬请见谅。',
    reminderNever: '还有尚未备份的纪录。为了避免纪录遗失，请进行备份。',
    reminderDays: (n) => `距离上次备份已经 ${n} 天了。为了避免纪录遗失，请进行备份。`,
    reminderBackup: '备份',
    reminderLater: '稍后',
    restoreTitle: '恢复资料', // menu_db_restore
    restoreHint: '恢复已备份的资料。也可以选择 Android App 的备份档（Download/LifoveBible 资料夹中的 lifovebible_backup_….db、lifovebible_autobackup.db，或旧版本的 lifovebible）。', // text_pref_db_restore_summary에 웹 설명을 붙임
    restoreRun: '进行恢复', // menu_db_restore_run
    restoreMerge: ['合并（建议）', '保留目前的资料，加入只在备份中、或在备份中较晚修改的纪录。内容不同的备忘会逐一让你选择。'], // restore_mode_merge
    restoreReplace: ['取代', '删除目前的资料，改用备份。备份中没有书签时，会保留目前的书签。'], // restore_mode_replace에서 위젯 문장을 뺌
    restoreInProgress: '资料恢复进行中……', // text_restore_in_progress
    restoreDone: '资料恢复完成。', // text_restore_successfully
    restoreFailed: '资料恢复失败！', // text_restore_failed
    restoreNotBackup: '这不是 Lifove Bible 的备份档。目前的资料没有变更。',
    restoreNewer: '这个备份是由较新版本的 Lifove Bible 建立的。请在网页版更新后再试一次。目前的资料没有变更。', // text_restore_newer_backup을 웹에 맞게
    mergeDone: (u, m, r, b) => `已合并备份。\n从备份取得：精选 ${u} 个、备忘 ${m} 个、阅读纪录 ${r} 个、书签 ${b} 个`, // restore_merge_done
    mergeNothing: '备份中没有新的纪录。目前的资料已是最新。', // restore_merge_nothing
    mergeConflicts: (n) => `这部装置和备份中有 ${n} 个内容不同的备忘。请逐一选择。`, // restore_merge_conflicts(這支手機 → 這部裝置)
    conflictTitle: (i, n) => `选择备忘（${i}/${n}）`, // memo_conflict_title
    conflictLocal: '这部装置', // memo_conflict_local(這支手機)
    conflictBackup: '备份', // memo_conflict_backup
    conflictOther: '其他装置', // sync memo conflict (web first)
    conflictDeleted: '（已删除）', // memo_conflict_deleted(앱 7.7)
    conflictStoppedSync: '未选择的备忘暂时保留这个装置的内容，下次同步时会再询问。', // memo_conflict_stopped_sync
    syncOtherBooks: (list) => `其他备忘册有新的备忘：${list}。请在备忘列表中切换备忘册查看。`, // text_sync_other_books
    groupSync: '同步',
    syncTitle: 'Google 云端硬碟同步',
    syncRowOff: '关闭',
    syncRowOn: (email) => `开启 · ${email}`,
    syncRowOnNoEmail: '开启',
    syncAbout: '将精选、备忘、备忘册、书签、阅读纪录和译本顺序储存到您的 Google 云端硬碟，并与其他装置保持一致。在 Android 应用程式（7.7 以上）和其他浏览器的网页版中，以同一个 Google 帐户开启后，即可接著使用。云端硬碟中只使用本应用程式专用的资料夹，不会读取您云端硬碟中的其他档案。',
    syncOn: '使用同步',
    syncOnHint: '开启时请选择 Google 帐户，这个浏览器的纪录和云端硬碟的纪录会合并。',
    syncAccount: (email) => `帐户：${email}`,
    syncLast: (when) => `上次同步：${when}`,
    syncNever: '尚未同步。',
    syncNow: '立即同步',
    syncRunning: '同步中…',
    syncDone: '同步完成。',
    syncNewer: '其他装置的应用程式版本较新，因此有部分纪录无法读取。网页版更新后会再同步。',
    syncLeft: (n) => `还有 ${n} 则备忘尚未选择。全部选择之前，不会上传这部装置的纪录。`,
    syncFailed: (msg) => `无法同步。请检查网路连线。（${msg}）`,
    syncSignInFailed: '无法登入 Google。请确认弹出式视窗未被封锁。',
    syncOffDone: '已关闭同步。云端硬碟和这部装置的纪录都会保留。',
    syncWebNote: '网页版的 Google 登入只能维持 1 小时。开启网页版时以及超过 1 小时后，请按一下画面上方出现的 [同步]。之后每次修改纪录都会自动同步。',
    syncLogTitle: '详细资料（同步纪录）',
    syncPaused: 'Google 云端硬碟同步已暂停。',
    syncResume: '同步',
    syncConflicts: (n) => `有 ${n} 则同步的备忘内容不同。`,
    syncChoose: '选择',
    syncFilesTitle: '云端硬碟中的译本档案',
    syncFilesHint: '无法从伺服器下载的译本（自行加入的译本、付费译本）会以档案上传到云端硬碟，让其他装置也能下载。这会占用云端硬碟的储存空间。在这部装置上删除译本，云端硬碟中的档案仍会保留。',
    syncFilesSummary: (n, mb) => `译本 ${n} 个，${mb} MB`,
    syncFilesNone: '云端硬碟中没有译本档案。',
    syncFilesUnknown: '同步后会显示。',
    syncFileDeleteAsk: (name) => `${name}：从云端硬碟删除后，其他装置将无法再下载这个译本。要删除吗？`,
    syncFileDeleteAskPlain: (name) => `要从云端硬碟删除 ${name} 档案吗？`,
    syncFileDeleted: (name) => `已从云端硬碟删除 ${name} 档案。`,
    syncFilesAsk: (names) => `要将其他装置上传的译本档案也下载到这部装置吗？\n${names}`,
    syncFileReplaceAsk: (name) => `云端硬碟中有其他装置较晚加入的 ${name} 档案。要用它取代这部装置的档案吗？`,
    syncGet: '下载',
    syncReplace: '取代',
    syncFilesFailed: (msg) => `无法同步译本档案。（${msg}）`,
    syncFilesWaiting: (n) => `尚未上传的 ${n} 个译本，会在 Wi-Fi 等不产生数据费用的网路上上传。在手机上按 [立即同步] 会立刻上传（已知使用行动数据时除外）。`,
    syncFileReplaceConfirm: (name) => `这部装置已有 ${name}。下载后会以云端硬碟中的档案取代。要下载吗？`,
    syncFileIncomplete: '（尚未完整上传）',
    syncPositionAsk: (device, ref) => `在${device}上读到${ref}。要前往吗？`,
    syncGo: '前往',
    syncVersionsAsk: (names) => `要在此装置下载其他装置上的译本吗？
${names}`,
    conflictBoth: '两者都要', // memo_conflict_both
    conflictApplyRest: (n) => `剩下的 ${n} 个也同样处理`, // memo_conflict_apply_rest
    conflictDone: '备忘选择完成。', // memo_conflict_done
    conflictStopped: '未选择的备忘保留这部装置的内容。', // memo_conflict_stopped
  },
  // 스페인어. 앱 values-es의 문구를 그대로 쓰고(앱처럼 tú), 앱에 없는 웹 문구는 새로 옮겼다
  es: {
    listLoading: 'Cargando la lista…',
    listFailed: 'No se pudo cargar la lista de Biblias',
    downloading: 'Descargando...', // text_downloading
    missingVerse: '(Ninguno)', // text_not_exist_verses
    ot: 'Antiguo Testamento', // 앱 text_ot는 'AT'
    nt: 'Nuevo Testamento', // 앱 text_nt는 'NT'
    textSize: 'Tamaño del texto', // text_pref_textsize_preferences
    smaller: 'Más pequeño',
    larger: 'Más grande',
    prev: 'Capítulo anterior',
    next: 'Capítulo siguiente',
    pickBook: 'Elegir libro',
    pickChapter: 'Elegir capítulo',
    pickVerse: 'Elegir versículo',
    versePos: (now, last) => `Versículo ${now} de ${last}`,
    readCheck: 'Marcar este capítulo como leído',
    checkedAsRead: 'Marcado como leído.', // text_checked_as_read_in_chapter_list
    uncheckedRead: 'Marca de lectura quitada.', // text_release_as_unread_in_chapter_list
    checkedAllTrans: 'Marcar como leído en las versiones seleccionadas', // text_checked_all_trans
    uncheckedAllTrans: 'Quitar la marca de lectura de las versiones seleccionadas', // text_ubchecked_all_trans
    readCheckFailed: 'No se pudo guardar la marca de lectura',
    readStats: 'Estadísticas de lectura', // menu_read_check_table
    statsTotal: 'Todo', // text_total
    statsValue: (read, total, pct) => `${read} / ${total} · ${pct}%`,
    statsReset: 'Reiniciar marcas de lectura', // menu_init_read_check
    statsResetConfirm: (name) => `¿Borrar todas las marcas de lectura de ${name}?`,
    statsResetDone: 'Estadísticas de lectura reiniciadas', // text_initiated_reading_statistics
    backToBooks: 'Libros',
    close: 'Cerrar',
    version: 'Versión',
    pickVersions: 'Comparar versiones', // menu_sel_ver
    pickOneVersion: 'Elegir Biblia', // menu_sel_one_ver
    barBottom: 'Barra de libro/capítulo abajo', // text_pref_header_bottom
    viewerSettings: 'Ajustes del lector', // text_title_pref_1
    groupScreen: 'Diseño de pantalla', // pref_group_screen
    groupColors: 'Texto y colores', // pref_group_text + pref_group_colors
    oneColumnHint: 'Si está desactivado, las versiones se muestran lado a lado en dos o más columnas según el ancho de la pantalla.',
    showVerName: 'Mostrar nombre de la versión', // 앱은 반대 뜻의 text_pref_nomargin_preferences
    showVerNameHint: 'Muestra el nombre de la versión en cada columna al leer varias versiones.',
    fontColor: 'Color del texto', // text_pref_fontcolor
    bgColor: 'Color de fondo', // text_pref_bgcolor
    colorPresets: { light: 'Claro', dark: 'Oscuro', sepia: 'Sepia', green: 'Verde' },
    colorSample: 'En el principio creó Dios los cielos y la tierra.',
    colorReset: 'Colores predeterminados',
    groupHighlight: 'Ajustes de resaltados', // text_title_pref_highlight
    hlStyle: 'Tipo de resaltado', // text_pref_underline_preferences
    hlStyleHint: 'Elige cómo se ven los versículos resaltados. Puedes elegir más de uno.', // text_pref_underline_preferences_summary
    hlStyles: ['Fondo de resaltador', 'Subrayado', 'Color del texto', 'Negrita'], // entries_highlight_style(highlightStyle.STYLES 차례)
    hlColor: 'Color del resaltador', // text_pref_highlightcolor
    hlTextColor: 'Color del subrayado/texto', // text_pref_underlinecolor
    hlNeedOne: 'Elige al menos un tipo de resaltado.', // text_highlight_style_need_one
    groupNav: 'Navegación y toque', // pref_group_navigation
    navBar: 'Mostrar botones de navegación', // text_pref_navigation_bar_preference
    navBarHint: 'Muestra botones para moverte sobre el texto.',
    navPos: 'Posición de los botones de navegación',
    navPositions: {
      'right-middle': 'Derecha, centro',
      'right-bottom': 'Derecha, abajo',
      'left-middle': 'Izquierda, centro',
      'left-bottom': 'Izquierda, abajo',
    },
    navBarOptions: { // entries_navigation_bar
      1: 'Ocultar barra de navegación',
      2: 'Solo por versículo',
      3: 'Solo por capítulo',
      5: 'Solo por historial',
      4: 'Versículo y capítulo',
      6: 'Versículo e historial',
      7: 'Capítulo e historial',
      8: 'Versículo, capítulo e historial',
    },
    navUnit: 'Moverse con los botones arriba/abajo', // text_pref_volumekey_preference를 웹에 맞게
    navUnits: { verse: 'Mover un versículo', page: 'Mover una pantalla', chapter: 'Mover un capítulo' }, // entries_volumekey
    swipeChapter: 'Deslizar para cambiar de capítulo', // text_pref_swipe_chapter
    swipeChapterHint: 'Desliza el texto a la izquierda o a la derecha para ir al capítulo siguiente o anterior. Desactívalo si el capítulo cambia cuando solo querías desplazarte.',
    ttsPlay: 'Leer el capítulo (voz)', // text_launch_tts_player
    ttsPlayVerse: 'Leer desde el versículo elegido (voz)', // text_launch_tts_player_for_a_verse를 고침
    ttsSpeed: (rate) => `Velocidad de lectura ${rate}`,
    ttsPause: 'Pausa',
    ttsResume: 'Reanudar',
    ttsStop: 'Detener',
    ttsNoVoice: 'No hay voz para este idioma. Instala los datos de voz.', // text_tts_no_voice
    ttsFailed: 'No se pudo crear la voz de este capítulo.', // text_tts_failed
    groupTts: 'Ajustes de voz (TTS)', // text_title_pref_tts
    ttsButton: 'Mostrar botón de audio', // text_pref_audio_button
    ttsButtonHint: 'Muestra el botón de audio (▶) en el lector. Desactívalo si no usas audio.', // text_pref_audio_button_summary
    ttsReadCheck: 'Marcar lectura con audio', // text_pref_autoaudioreadcheck_preference
    ttsReadCheckHint: 'Marca el capítulo como leído cuando el audio de la Biblia termina el capítulo', // text_pref_autoaudioreadcheck_preference_summary
    ttsVoice: 'Voz', // text_pref_tts_voice
    ttsVoiceSummary: (lang, voice) => `Idioma de la Biblia actual: ${lang} / ${voice}`, // text_pref_tts_voice_summary
    ttsVoiceDefault: 'Predeterminada del teléfono', // text_tts_voice_default
    ttsVoiceNetwork: 'requiere internet', // text_tts_voice_network
    ttsVoiceItem: (n) => `Voz ${n}`, // text_tts_voice_item
    ttsInstall: 'Instalar/gestionar datos de voz', // text_pref_tts_install
    ttsInstallHint: 'Mira cómo añadir voces a tu dispositivo.',
    ttsNoLanguage: 'No hay voz de lectura para este idioma en tu teléfono. ¿Instalar datos de voz?', // text_tts_no_language
    ttsOpenSettings: 'Instalar voz', // text_tts_open_settings
    navUp: 'Arriba',
    navDown: 'Abajo',
    navBack: 'Atrás en el historial',
    navForward: 'Adelante en el historial',
    downAgain: 'Pulsa la tecla de bajar para ir al siguiente capítulo.', // text_vol_down_next_chapter
    pickOneHint: 'Elige una de las versiones descargadas o añadidas para leer.',
    pickVersionsHint: 'Versiones descargadas y añadidas. Elige varias para leerlas lado a lado, en el orden en que las elijas.',
    oneColumn: 'Comparar en una columna', // text_pref_multilayout_preference
    ok: 'Aceptar', // alert_dialog_ok
    cancel: 'Cancelar', // alert_dialog_cancel
    delete: 'Eliminar', // menu_delete
    downloaded: 'Descargada',
    deleteConfirm: (name) => `¿Eliminar la versión descargada «${name}»? Para volver a leerla, tendrás que descargarla de nuevo.`,
    menu: 'Menú',
    help: 'Ayuda', // menu_help
    helpFailed: 'No se pudo cargar la ayuda',
    download: 'Descargar', // menu_download
    downloadHint: 'Elige las versiones y pulsa Descargar. Las versiones descargadas se pueden leer sin internet y elegir en Comparar versiones.',
    downloadAll: (i, n) => `Descargando... (${i}/${n})`,
    downloadDone: '¡Descarga completada!', // txt_install_result_success
    downloadFailed: (names) => `No se pudo descargar: ${names}. Comprueba tu conexión a internet y vuelve a intentarlo.`, // txt_check_internet 앞부분
    noCache: 'Esta dirección no puede guardar archivos de la Biblia, así que se descargan cada vez que lees.',
    moreVersions: 'Obtener otras versiones (Descargar) ›',
    noVersions: 'Aún no has descargado ninguna Biblia. Descarga una versión para leer.',
    importTitle: 'Añadir archivos de la Biblia',
    noLocal: 'No has añadido ninguna versión.',
    listOld: 'No se pudo cargar la lista más reciente. Se muestra la lista anterior',
    updateReady: 'Hay una nueva versión',
    updateApply: 'Recargar',
    dbBlocked: 'Cierra Lifove Bible en otras pestañas o ventanas de la aplicación para usar las notas y los resaltados.',
    noChapter: 'Este capítulo no está en esta versión',
    loadFailed: 'No se pudo cargar el texto',
    ref: (book, chapter) => `${book} ${chapter}`,
    importFiles: 'Añadir archivos',
    importFolder: 'Añadir carpeta',
    importHint: 'Añade los archivos de la Biblia que tengas (.lfa, .bdf) o arrástralos a la página. También puedes añadir la carpeta Download/LifoveBible/bible exportada desde la aplicación.',
    importing: 'Añadiendo...',
    imported: (names) => `Añadido: ${names}`,
    importFailed: (items) => `No se pudo añadir: ${items}`,
    importNone: 'No se encontraron archivos de la Biblia (.lfa, .bdf)',
    reasons: {
      notZip: 'no se puede abrir el archivo',
      noChapters: 'no hay archivos de capítulos',
      badText: 'formato de texto desconocido',
      storeFailed: 'no se pudo guardar',
    },
    localGroup: 'Añadidas por ti',
    localBadge: 'Añadida',
    deleteLocalConfirm: (name) => `¿Eliminar «${name}», que añadiste tú? Para volver a leerla, tendrás que añadir el archivo de nuevo.`,
    localRename: (name) => `Cambiar el nombre de ${name}`,
    localRenamePrompt: (name) => `Escribe un nombre para esta versión de la Biblia. Si lo dejas vacío, se mostrará el nombre original (${name}).`,
    localMissing: 'El archivo que añadiste ya no está. Vuelve a añadirlo',
    dropHere: 'Suelta aquí para añadir archivos de la Biblia (.lfa, .bdf)',
    search: 'Buscar', // label_search
    keywordA: 'Palabra A', // txt_hint_search
    keywordB: 'Palabra B', // txt_hint_search2
    searchRange: 'Rango de búsqueda',
    searchVersion: 'Versión en la que buscar',
    themes: 'Grupos',
    rangeAll: 'Todo', // text_total
    themeNames: { // text_moses ~ text_rev
      moses: 'Pentateuco',
      hist: 'Históricos',
      poet: 'Poéticos',
      majProphet: 'Profetas mayores',
      mnrProphet: 'Profetas menores',
      gospel: 'Evangelios',
      ntHist: 'Histórico del NT (Hechos)',
      paulLetter: 'Cartas de Pablo',
      genLetter: '-Cartas generales de Pablo',
      prisonLetter: '-Cartas de la prisión',
      pastorLetter: '-Cartas pastorales',
      comLetter: 'Cartas generales',
      rev: 'Profecía (Apocalipsis)',
    },
    keywordRequired: 'Escribe una palabra en Palabra A.', // text_search_keyword_required
    keywordTooShort: 'Escribe al menos dos letras en Palabra A.', // text_search_keyword_too_short
    searching: (book) => `Buscando... ${book}`, // text_searching
    noResult: '¡Sin resultados!', // text_no_search_result
    found: (n) => `Total: ${n} versículos encontrados.`, // text_total_count + text_found_verses
    searchCanceled: (n) => `Búsqueda cancelada. ${n} versículos encontrados.`, // text_search_canceled
    searchFailed: 'No se pudo buscar',
    stop: 'Detener',
    more: (n) => `Ver más (quedan ${n})`,
    verseRef: (book, chapter, verse) => `${book} ${chapter}:${verse}`,
    selCount: (n) => (n === 1 ? '1 versículo' : `${n} versículos`),
    copy: 'Copiar',
    share: 'Compartir',
    copyVerses: 'Copiar versículo(s) seleccionado(s)', // menu_copy_verse
    shareVerses: 'Enviar versículo(s) seleccionado(s)', // menu_verse_send
    clearSelection: 'Deseleccionar versículo(s)', // menu_check_clear
    copied: 'Versículo(s) seleccionado(s) copiado(s)', // text_copied_selected_verses
    copyFailed: 'No se pudo copiar',
    shareFailed: 'No se pudo compartir',
    highlight: 'Resaltar',
    highlightOff: 'Quitar',
    highlightVerses: 'Resaltar versículo(s) seleccionado(s)', // menu_verse_underline
    removeHighlight: 'Quitar el resaltado', // menu_verse_underline_remove
    highlightFailed: 'No se pudo guardar el resaltado',
    myHighlights: 'Mis resaltados', // menu_underline_list
    orderRecent: 'Más recientes', // menu_timely_order
    orderBook: 'Orden de los libros', // menu_book_order
    hlEmpty: 'Aún no hay versículos resaltados.\nToca versículos en la pantalla de lectura para seleccionarlos y pulsa [Resaltar].', // text_underline_empty를 웹에 맞게
    hlSend: 'Enviar resaltados', // menu_underline_send
    hlCopiedAll: 'Lista de resaltados copiada',
    deleteAll: 'Eliminar todo', // menu_delete_all
    hlDeleteAllConfirm: '¿Seguro que quieres eliminar todos tus resaltados?', // text_ask_to_delete_all_my_underlines(위젯 문구는 뺌)
    hlDeletedAll: '¡Se eliminaron todos los resaltados!', // text_deleted_all_my_underline
    hlDelete: (ref) => `Quitar el resaltado de ${ref}`,
    hlDeleteConfirm: (ref) => `¿Quitar el resaltado de ${ref}?`,
    hlLoadFailed: 'No se pudieron leer los resaltados',
    noSuchVersion: (name) => `${name} no está disponible. Descárgala o añádela de nuevo.`,
    addBookmark: 'Añadir marcador', // menu_add_bookmark
    copyChapter: 'Copiar el capítulo', // menu_copy_chapter
    sendChapter: 'Enviar el capítulo', // menu_chapter_send
    copiedChapter: 'Capítulo copiado', // text_copied_this_chapter
    reportVerseError: 'Informar error en el texto', // menu_report_verse_error
    verseErrorSubject: '[Error en el texto] Lifove Bible', // text_verse_error_subject
    verseErrorGuide: 'Describa abajo qué parte del versículo está mal y cómo debería ser. Si es posible, indique también la fuente (por ejemplo, una Biblia impresa y la página).', // text_verse_error_guide
    reportMailHint: 'Si no se abre ninguna aplicación de correo, envía tu informe a bible@lifove.net.', // text_no_mail_app를 고침(웹은 메일 앱이 열렸는지 알 수 없다)
    bookmarks: 'Marcadores', // menu_bookmark
    bookmarkAdded: (ref) => `¡Marcador guardado! (${ref})`, // text_bookmark_added에 위치를 붙임
    bookmarkFailed: 'No se pudo guardar el marcador',
    bmEmpty: 'No hay marcadores\nMientras lees, pulsa ☰ → [Añadir marcador] para guardar el versículo de arriba de la pantalla.', // text_no_bookmark를 웹에 맞게
    bmDelete: (ref) => `Eliminar el marcador ${ref}`,
    bmDeleteConfirm: (ref) => `¿Eliminar el marcador ${ref}?`,
    bmLoadFailed: 'No se pudieron leer los marcadores',
    memo: 'Nota',
    memoVerse: 'Escribir/ver nota', // menu_memo
    memoOpen: (ref) => `Ver la nota de ${ref}`,
    save: 'Guardar', // alert_dialog_save
    del: 'Eliminar', // alert_dialog_del
    memoSaveChanges: '¿Guardar los cambios de esta nota?', // memo_save_changes
    memoDiscard: 'No guardar', // memo_discard_changes
    memoDeleteConfirm: '¿Eliminar esta nota?', // memo_delete_confirm
    memoShow: 'Mostrar notas', // menu_memo_show
    memoHide: 'Ocultar notas', // menu_memo_hide
    memoFailed: 'No se pudo guardar la nota',
    memoLoadFailed: 'No se pudo leer la nota',
    myMemos: 'Mis notas', // menu_memo_list
    myMemoList: 'Mis notas', // text_my_memo_list
    mlEmpty: 'Aún no hay notas.\nToca un versículo en la pantalla de lectura para seleccionarlo y pulsa [Nota] para añadir una nota.', // text_memo_empty를 웹에 맞게
    mlSearchHint: 'Buscar notas', // text_memo_search_hint
    mlSearchNone: 'Ninguna nota coincide con la búsqueda.', // text_memo_search_none
    mlSearchClear: 'Borrar búsqueda', // text_memo_search_clear
    mlSend: 'Enviar notas', // menu_memo_backup
    mlCopiedAll: 'Lista de notas copiada',
    mlDeleteAllConfirm: '¿Seguro que quieres eliminar todas tus notas?', // text_ask_to_delete_all_my_memos
    mlDeletedAll: '¡Se eliminaron todas las notas!', // text_deleted_all_my_memo
    mlDelete: (ref) => `Eliminar la nota de ${ref}`,
    mlDeleteConfirm: (ref) => `¿Eliminar la nota de ${ref}?`,
    groupMemo: 'Notas', // pref_group_memo
    memoBooks: 'Cuadernos de notas', // text_memo_books
    memoBooksHint: 'Añade cuadernos de notas o cambia su nombre, su orden y la forma de escribir', // text_memo_books_summary
    memoOptions: ['Ir al siguiente versículo al guardar', 'Saltar versículos que ya tienen nota', 'Al final del capítulo, pasar al siguiente', 'Guardar con la tecla Intro'], // text_memo_book_continuous, _skip_filled, _next_chapter, _enter_saves
    memoOptionOn: (name) => `${name}: activado`, // text_memo_option_on
    memoOptionOff: (name) => `${name}: desactivado`, // text_memo_option_off
    memoNoNextVerse: 'No quedan versículos por escribir en este capítulo', // text_memo_no_next_verse
    memoBookDefault: 'Cuaderno predeterminado', // text_memo_book_default
    memoBookAdd: '+ Añadir cuaderno', // text_memo_book_add
    memoBookNew: 'Nuevo cuaderno de notas', // text_memo_book_new
    memoBookName: 'Nombre', // text_memo_book_name
    memoBookManage: 'Administrar cuadernos', // text_memo_book_manage
    memoBookCount: (n) => `Notas: ${n}`, // text_memo_book_count
    memoBookMoveUp: (name) => `Subir ${name}`, // text_memo_book_move_up
    memoBookMoveDown: (name) => `Bajar ${name}`, // text_memo_book_move_down
    memoBookDelete: (name) => `Eliminar ${name}`,
    memoBookDeleteConfirm: (name, n) => `¿Eliminar el cuaderno “${name}”? También se eliminarán sus ${n} notas.`, // text_memo_book_delete_confirm
    memoBookDeleteConfirmEmpty: (name) => `¿Eliminar el cuaderno “${name}”?`, // text_memo_book_delete_confirm_empty
    memoBookPick: 'Cambiar de cuaderno',
    memoBookFailed: 'No se pudo guardar el cuaderno',
    backupMenu: 'Gestión de datos', // text_title_pref_3(앱 설정의 데이터 관리 묶음). 동기화·백업·복구를 한 창에(2026-11-28)
    backupSaveTitle: 'Copia de seguridad', // menu_db_backup
    backupSaveHint: 'Copia Mis resaltados, Mis notas y Estadísticas de lectura. También incluye los marcadores y los cuadernos de notas. Es el mismo archivo de copia (.db) que el de la aplicación de Android, así que puedes abrirlo en la aplicación en Ajustes > Restaurar datos.', // text_pref_db_backup_summary에 웹 설명을 붙임
    backupRun: 'Hacer copia', // menu_db_backup_run
    backupInProgress: 'Haciendo copia de seguridad...', // text_backup_in_progress
    backupSaved: (name) => `Copia de seguridad completada.\nGuardado en: ${name} (la carpeta de descargas del navegador)`, // text_backup_successfully + text_backup_location
    backupFailed: '¡Error en la copia de seguridad!', // text_backup_failed
    backupLast: (when) => `Última copia: ${when}`,
    backupNever: 'Todavía no has hecho ninguna copia de seguridad.',
    backupMoveHint: 'También puedes usar el archivo de copia en otros dispositivos. Pásalo por correo, mensajería, una unidad en la nube o similar y elígelo en la aplicación Lifove Bible de un teléfono o tableta Android (Ajustes > Restaurar datos), o en la versión web de otro dispositivo o navegador ([Restaurar] más abajo), para seguir usando tus resaltados, notas y demás.', // 다른 기기의 앱·웹에서 복구해 이어 쓰기
    // 기록 보관 안내·책임 안내(backupNotice1~3)는 사용자와 정한 문구. 뜻을 바꾸지 않고 정중하게(여기만 usted) 옮겼다
    backupNoticeTitle: 'Lea esto, por favor: cómo conservar sus registros',
    backupNotice1: 'Sus resaltados, notas, marcadores y registros de lectura se guardan solo en este navegador de este dispositivo; no se conservan en nuestro servidor. Pueden perderse si borra los datos del sitio del navegador, si el dispositivo se queda sin espacio o si cambia de dispositivo o de navegador, y los registros perdidos no se pueden recuperar. Safari en iPhone y iPad también puede borrarlos si el sitio no se ha añadido a la pantalla de inicio y no se abre durante más de 7 días.',
    backupNotice2: 'Para no perder sus registros, haga copias de seguridad con regularidad y guarde los archivos en un lugar seguro, como una computadora o una unidad en la nube. Si pasan 7 días desde la última copia, aparecerá un aviso en la parte superior de la pantalla.',
    backupNoticeSync: 'Si activa la sincronización con Google Drive (arriba en ☰ → Gestión de datos), sus registros también se guardan en su propio Google Drive y puede seguir usándolos en sus otros dispositivos. Mientras la sincronización esté activada y se haya realizado en los últimos 7 días, no aparecerá el aviso de copia de seguridad. Aun así, es más seguro conservar también los archivos de copia de seguridad.',
    backupNotice3: 'Hacer las copias y guardar los archivos queda a su cargo. No podemos recuperar los registros que se pierdan sin una copia, y le pedimos amablemente que comprenda que esta responsabilidad es suya.',
    reminderNever: 'Algunos de tus registros todavía no tienen copia. Haz una copia para no perderlos.',
    reminderDays: (n) => `Han pasado ${n} días desde tu última copia. Haz una copia para no perder tus registros.`,
    reminderBackup: 'Hacer copia',
    reminderLater: 'Más tarde',
    restoreTitle: 'Restaurar datos', // menu_db_restore
    restoreHint: 'Restaura una copia de seguridad. También puedes elegir un archivo de copia de la aplicación de Android (lifovebible_backup_….db o lifovebible_autobackup.db en Download/LifoveBible, o lifovebible de versiones antiguas).', // text_pref_db_restore_summary에 웹 설명을 붙임
    restoreRun: 'Restaurar', // menu_db_restore_run
    restoreMerge: ['Combinar (recomendado)', 'Conserva tus datos actuales y añade lo que solo está en la copia o se cambió después en ella. Eliges tú las notas que sean distintas.'], // restore_mode_merge
    restoreReplace: ['Reemplazar', 'Borra tus datos actuales y usa la copia en su lugar. Tus marcadores se conservan si la copia no tiene ninguno.'], // restore_mode_replace에서 위젯 문장을 뺌
    restoreInProgress: 'Restaurando datos...', // text_restore_in_progress
    restoreDone: 'Restauración de datos completada', // text_restore_successfully
    restoreFailed: '¡Error al restaurar los datos!', // text_restore_failed
    restoreNotBackup: 'No es un archivo de copia de Lifove Bible. Tus datos actuales no se cambiaron.',
    restoreNewer: 'Esta copia la hizo una versión más nueva de Lifove Bible. Inténtalo de nuevo cuando se actualice la versión web. Tus datos actuales no se cambiaron.', // text_restore_newer_backup을 웹에 맞게
    mergeDone: (u, m, r, b) => `Copia combinada.\nTomado de la copia: ${u} resaltado(s), ${m} nota(s), ${r} marca(s) de lectura, ${b} marcador(es).`, // restore_merge_done
    mergeNothing: 'No hay nada nuevo en la copia. Tus datos actuales ya están al día.', // restore_merge_nothing
    mergeConflicts: (n) => `${n} nota(s) son distintas en este dispositivo y en la copia. Elige cada una.`, // restore_merge_conflicts(teléfono → dispositivo)
    conflictTitle: (i, n) => `Elegir nota (${i}/${n})`, // memo_conflict_title
    conflictLocal: 'Este dispositivo', // memo_conflict_local(Este teléfono)
    conflictBackup: 'Copia', // memo_conflict_backup
    conflictOther: 'Otro dispositivo', // sync memo conflict (web first)
    conflictDeleted: '(eliminada)', // memo_conflict_deleted(앱 7.7)
    conflictStoppedSync: 'Las notas que no elegiste conservan por ahora la versión de este dispositivo. Se te preguntará de nuevo en la próxima sincronización.', // memo_conflict_stopped_sync
    syncOtherBooks: (list) => `Llegaron notas nuevas a otros cuadernos de notas: ${list}. Cambia el cuaderno en la lista de notas para verlas.`, // text_sync_other_books
    groupSync: 'Sincronización',
    syncTitle: 'Sincronización con Google Drive',
    syncRowOff: 'Desactivada',
    syncRowOn: (email) => `Activada · ${email}`,
    syncRowOnNoEmail: 'Activada',
    syncAbout: 'Guarda tus resaltados, notas, cuadernos de notas, marcadores, registros de lectura y el orden de las versiones en tu Google Drive y los mantiene iguales en tus otros dispositivos. Actívala con la misma cuenta de Google en la app de Android (7.7 o posterior) y en la versión web de otros navegadores para seguir donde lo dejaste. En Drive solo se usa una carpeta propia de esta app; no se leen los demás archivos de tu Drive.',
    syncOn: 'Usar sincronización',
    syncOnHint: 'Al activarla, elige una cuenta de Google. Los registros de este navegador y los de tu Drive se combinan.',
    syncAccount: (email) => `Cuenta: ${email}`,
    syncLast: (when) => `Última sincronización: ${when}`,
    syncNever: 'Aún no se ha sincronizado.',
    syncNow: 'Sincronizar ahora',
    syncRunning: 'Sincronizando…',
    syncDone: 'Sincronización terminada.',
    syncNewer: 'No se pudieron leer algunos registros de otro dispositivo porque su app es una versión más reciente. Se sincronizarán cuando se actualice la versión web.',
    syncLeft: (n) => `Aún tienes ${n} nota(s) por elegir. Los registros de este dispositivo no se suben hasta que las elijas todas.`,
    syncFailed: (msg) => `No se pudo sincronizar. Comprueba tu conexión a internet. (${msg})`,
    syncSignInFailed: 'No se pudo iniciar sesión en Google. Comprueba que las ventanas emergentes no estén bloqueadas.',
    syncOffDone: 'Sincronización desactivada. Los registros de tu Drive y de este dispositivo se mantienen.',
    syncWebNote: 'En la versión web, la sesión de Google dura solo una hora. Al abrir la versión web y después de una hora, toca una vez [Sincronizar] en la parte superior de la pantalla. Después, los cambios se sincronizan automáticamente.',
    syncLogTitle: 'Detalles (registro de sincronización)',
    syncPaused: 'La sincronización con Google Drive está en pausa.',
    syncResume: 'Sincronizar',
    syncConflicts: (n) => `${n} nota(s) sincronizada(s) son distintas.`,
    syncChoose: 'Elegir',
    syncFilesTitle: 'Archivos de versiones en tu Drive',
    syncFilesHint: 'Las versiones que no se pueden descargar del servidor (las que agregaste tú, las de pago) se suben a tu Drive como archivos para que tus otros dispositivos también puedan descargarlas. Ocupan espacio de tu Drive. Si eliminas una versión en este dispositivo, su archivo sigue en tu Drive.',
    syncFilesSummary: (n, mb) => `${n} versión(es), ${mb} MB`,
    syncFilesNone: 'No hay archivos de versiones en tu Drive.',
    syncFilesUnknown: 'Se muestra después de sincronizar.',
    syncFileDeleteAsk: (name) => `${name}: si lo eliminas de tu Drive, tus otros dispositivos no podrán volver a descargar esta versión. ¿Eliminarlo?`,
    syncFileDeleteAskPlain: (name) => `¿Eliminar el archivo ${name} de tu Drive?`,
    syncFileDeleted: (name) => `Se eliminó el archivo ${name} de tu Drive.`,
    syncFilesAsk: (names) => `¿Descargar también en este dispositivo los archivos de versiones subidos desde tus otros dispositivos?\n${names}`,
    syncFileReplaceAsk: (name) => `Tu Drive tiene un archivo ${name} agregado más tarde en otro dispositivo. ¿Reemplazar con él el archivo de este dispositivo?`,
    syncGet: 'Descargar',
    syncReplace: 'Reemplazar',
    syncFilesFailed: (msg) => `No se pudieron sincronizar los archivos de versiones. (${msg})`,
    syncFilesWaiting: (n) => `${n} versión(es) aún sin subir se subirán en una red sin cargos de datos, como Wi-Fi. En un teléfono, al tocar [Sincronizar ahora] se suben enseguida (salvo si se sabe que usas datos móviles).`,
    syncFileReplaceConfirm: (name) => `${name} ya está en este dispositivo. Al descargarlo se reemplaza por el de tu Drive. ¿Descargarlo?`,
    syncFileIncomplete: '(aún no se ha subido por completo)',
    syncPositionAsk: (device, ref) => `En ${device} estabas leyendo ${ref}. ¿Ir allí?`,
    syncGo: 'Ir',
    syncVersionsAsk: (names) => `¿Descargar en este dispositivo las versiones que tienes en otros dispositivos?
${names}`,
    conflictBoth: 'Ambas', // memo_conflict_both
    conflictApplyRest: (n) => `Hacer lo mismo con las ${n} restantes`, // memo_conflict_apply_rest
    conflictDone: 'Terminaste de elegir las notas.', // memo_conflict_done
    conflictStopped: 'Las notas que no elegiste conservan la versión de este dispositivo.', // memo_conflict_stopped
  },
  // 포르투갈어(브라질). 앱 values-pt의 문구를 그대로 쓰고(앱처럼 você), 앱에 없는 웹 문구는 새로 옮겼다
  pt: {
    listLoading: 'Carregando a lista…',
    listFailed: 'Não foi possível carregar a lista de Bíblias',
    downloading: 'Baixando...', // text_downloading
    missingVerse: '(Nenhum)', // text_not_exist_verses
    ot: 'Antigo Testamento', // 앱 text_ot는 'AT'
    nt: 'Novo Testamento', // 앱 text_nt는 'NT'
    textSize: 'Tamanho do texto', // text_pref_textsize_preferences
    smaller: 'Menor',
    larger: 'Maior',
    prev: 'Capítulo anterior',
    next: 'Próximo capítulo',
    pickBook: 'Escolher livro',
    pickChapter: 'Escolher capítulo',
    pickVerse: 'Escolher versículo',
    versePos: (now, last) => `Versículo ${now} de ${last}`,
    readCheck: 'Marcar este capítulo como lido',
    checkedAsRead: 'Marcado como lido.', // text_checked_as_read_in_chapter_list
    uncheckedRead: 'Marca de leitura removida.', // text_release_as_unread_in_chapter_list
    checkedAllTrans: 'Marcar como lido nas traduções selecionadas', // text_checked_all_trans
    uncheckedAllTrans: 'Desmarcar leitura nas traduções selecionadas', // text_ubchecked_all_trans
    readCheckFailed: 'Não foi possível salvar a marca de leitura',
    readStats: 'Estatísticas de leitura', // menu_read_check_table
    statsTotal: 'Tudo', // text_total
    statsValue: (read, total, pct) => `${read} / ${total} · ${pct}%`,
    statsReset: 'Zerar marcas de leitura', // menu_init_read_check
    statsResetConfirm: (name) => `Apagar todas as marcas de leitura de ${name}?`,
    statsResetDone: 'Estatísticas de leitura zeradas', // text_initiated_reading_statistics
    backToBooks: 'Livros',
    close: 'Fechar',
    version: 'Tradução',
    pickVersions: 'Comparar traduções', // menu_sel_ver
    pickOneVersion: 'Escolher Bíblia', // menu_sel_one_ver
    barBottom: 'Barra de livro/capítulo embaixo', // text_pref_header_bottom
    viewerSettings: 'Configurações do leitor', // text_title_pref_1
    groupScreen: 'Layout da tela', // pref_group_screen
    groupColors: 'Texto e cores', // pref_group_text + pref_group_colors
    oneColumnHint: 'Quando desativado, as traduções ficam lado a lado em duas ou mais colunas, conforme a largura da tela.',
    showVerName: 'Mostrar nome da tradução', // 앱은 반대 뜻의 text_pref_nomargin_preferences
    showVerNameHint: 'Mostra o nome da tradução em cada coluna ao ler várias traduções.',
    fontColor: 'Cor do texto', // text_pref_fontcolor
    bgColor: 'Cor de fundo', // text_pref_bgcolor
    colorPresets: { light: 'Claro', dark: 'Escuro', sepia: 'Sépia', green: 'Verde' },
    colorSample: 'No princípio criou Deus os céus e a terra.',
    colorReset: 'Cores padrão',
    groupHighlight: 'Configurações de destaques', // text_title_pref_highlight
    hlStyle: 'Tipo de destaque', // text_pref_underline_preferences
    hlStyleHint: 'Escolha como os versículos destacados aparecem. Você pode escolher mais de um.', // text_pref_underline_preferences_summary
    hlStyles: ['Fundo de marca-texto', 'Sublinhado', 'Cor do texto', 'Negrito'], // entries_highlight_style(highlightStyle.STYLES 차례)
    hlColor: 'Cor do marca-texto', // text_pref_highlightcolor
    hlTextColor: 'Cor do sublinhado/texto', // text_pref_underlinecolor
    hlNeedOne: 'Escolha pelo menos um tipo de destaque.', // text_highlight_style_need_one
    groupNav: 'Navegação e toque', // pref_group_navigation
    navBar: 'Mostrar botões de navegação', // text_pref_navigation_bar_preference
    navBarHint: 'Mostra botões para se mover sobre o texto.',
    navPos: 'Posição dos botões de navegação',
    navPositions: {
      'right-middle': 'Direita, no meio',
      'right-bottom': 'Direita, embaixo',
      'left-middle': 'Esquerda, no meio',
      'left-bottom': 'Esquerda, embaixo',
    },
    navBarOptions: { // entries_navigation_bar
      1: 'Ocultar barra de navegação',
      2: 'Só navegação por versículo',
      3: 'Só navegação por capítulo',
      5: 'Só navegação pelo histórico',
      4: 'Versículo e capítulo',
      6: 'Versículo e histórico',
      7: 'Capítulo e histórico',
      8: 'Versículo, capítulo e histórico',
    },
    navUnit: 'Mover com os botões para cima/baixo', // text_pref_volumekey_preference를 웹에 맞게
    navUnits: { verse: 'Mover um versículo', page: 'Mover uma tela', chapter: 'Mover um capítulo' }, // entries_volumekey
    swipeChapter: 'Deslizar para mudar de capítulo', // text_pref_swipe_chapter
    swipeChapterHint: 'Deslize o texto para a esquerda ou para a direita para ir ao próximo capítulo ou ao anterior. Desative se o capítulo mudar quando você só queria rolar.',
    ttsPlay: 'Ler o capítulo (voz)', // text_launch_tts_player
    ttsPlayVerse: 'Ler a partir do versículo escolhido (voz)', // text_launch_tts_player_for_a_verse를 고침
    ttsSpeed: (rate) => `Velocidade de leitura ${rate}`,
    ttsPause: 'Pausar',
    ttsResume: 'Continuar',
    ttsStop: 'Parar',
    ttsNoVoice: 'Não há voz para este idioma. Instale os dados de voz.', // text_tts_no_voice
    ttsFailed: 'Não foi possível criar a voz deste capítulo.', // text_tts_failed
    groupTts: 'Configurações de voz (TTS)', // text_title_pref_tts
    ttsButton: 'Mostrar botão de áudio', // text_pref_audio_button
    ttsButtonHint: 'Mostra o botão de áudio (▶) no leitor. Desative se você não usa áudio.', // text_pref_audio_button_summary
    ttsReadCheck: 'Marcar leitura com áudio', // text_pref_autoaudioreadcheck_preference
    ttsReadCheckHint: 'Marca o capítulo como lido quando o áudio da Bíblia termina o capítulo', // text_pref_autoaudioreadcheck_preference_summary
    ttsVoice: 'Voz', // text_pref_tts_voice
    ttsVoiceSummary: (lang, voice) => `Idioma da Bíblia atual: ${lang} / ${voice}`, // text_pref_tts_voice_summary
    ttsVoiceDefault: 'Padrão do celular', // text_tts_voice_default
    ttsVoiceNetwork: 'requer internet', // text_tts_voice_network
    ttsVoiceItem: (n) => `Voz ${n}`, // text_tts_voice_item
    ttsInstall: 'Instalar/gerenciar dados de voz', // text_pref_tts_install
    ttsInstallHint: 'Veja como adicionar vozes ao seu aparelho.',
    ttsNoLanguage: 'Não há voz de leitura para este idioma no seu celular. Instalar dados de voz?', // text_tts_no_language
    ttsOpenSettings: 'Instalar voz', // text_tts_open_settings
    navUp: 'Para cima',
    navDown: 'Para baixo',
    navBack: 'Voltar no histórico',
    navForward: 'Avançar no histórico',
    downAgain: 'Pressione a tecla para baixo para ir ao próximo capítulo.', // text_vol_down_next_chapter
    pickOneHint: 'Escolha uma das traduções baixadas ou adicionadas para ler.',
    pickVersionsHint: 'Traduções baixadas e adicionadas. Escolha várias para lê-las lado a lado, na ordem em que você as escolher.',
    oneColumn: 'Comparar em uma coluna', // text_pref_multilayout_preference
    ok: 'OK', // alert_dialog_ok
    cancel: 'Cancelar', // alert_dialog_cancel
    delete: 'Excluir', // menu_delete
    downloaded: 'Baixada',
    deleteConfirm: (name) => `Excluir a tradução baixada “${name}”? Para ler de novo, será preciso baixá-la outra vez.`,
    menu: 'Menu',
    help: 'Ajuda', // menu_help
    helpFailed: 'Não foi possível carregar a ajuda',
    download: 'Baixar', // menu_download
    downloadHint: 'Escolha as traduções e toque em Baixar. As traduções baixadas podem ser lidas sem internet e escolhidas em Comparar traduções.',
    downloadAll: (i, n) => `Baixando... (${i}/${n})`,
    downloadDone: 'Download concluído!', // txt_install_result_success
    downloadFailed: (names) => `Não foi possível baixar: ${names}. Verifique sua conexão com a internet e tente novamente.`, // txt_check_internet 앞부분
    noCache: 'Este endereço não pode guardar arquivos da Bíblia, então eles são baixados toda vez que você lê.',
    moreVersions: 'Obter outras traduções (Baixar) ›',
    noVersions: 'Nenhuma Bíblia baixada ainda. Baixe uma tradução para ler.',
    importTitle: 'Adicionar arquivos da Bíblia',
    noLocal: 'Você não adicionou nenhuma tradução.',
    listOld: 'Não foi possível carregar a lista mais recente. Mostrando a lista anterior',
    updateReady: 'Há uma nova versão',
    updateApply: 'Recarregar',
    dbBlocked: 'Feche o Lifove Bible em outras abas ou janelas do aplicativo para usar as notas e os destaques.',
    noChapter: 'Este capítulo não está nesta tradução',
    loadFailed: 'Não foi possível carregar o texto',
    ref: (book, chapter) => `${book} ${chapter}`,
    importFiles: 'Adicionar arquivos',
    importFolder: 'Adicionar pasta',
    importHint: 'Adicione os arquivos da Bíblia que você tem (.lfa, .bdf) ou arraste-os para a página. Também é possível adicionar a pasta Download/LifoveBible/bible exportada do aplicativo.',
    importing: 'Adicionando...',
    imported: (names) => `Adicionado: ${names}`,
    importFailed: (items) => `Não foi possível adicionar: ${items}`,
    importNone: 'Nenhum arquivo da Bíblia (.lfa, .bdf) encontrado',
    reasons: {
      notZip: 'não é possível abrir o arquivo',
      noChapters: 'sem arquivos de capítulos',
      badText: 'formato de texto desconhecido',
      storeFailed: 'não foi possível salvar',
    },
    localGroup: 'Adicionadas por você',
    localBadge: 'Adicionada',
    deleteLocalConfirm: (name) => `Excluir “${name}”, que você adicionou? Para ler de novo, será preciso adicionar o arquivo outra vez.`,
    localRename: (name) => `Renomear ${name}`,
    localRenamePrompt: (name) => `Digite um nome para esta versão da Bíblia. Se deixar vazio, aparecerá o nome original (${name}).`,
    localMissing: 'O arquivo que você adicionou não está mais disponível. Adicione-o novamente',
    dropHere: 'Solte aqui para adicionar arquivos da Bíblia (.lfa, .bdf)',
    search: 'Pesquisar', // label_search
    keywordA: 'Palavra A', // txt_hint_search
    keywordB: 'Palavra B', // txt_hint_search2
    searchRange: 'Intervalo da pesquisa',
    searchVersion: 'Tradução para pesquisar',
    themes: 'Grupos',
    rangeAll: 'Tudo', // text_total
    themeNames: { // text_moses ~ text_rev
      moses: 'Pentateuco',
      hist: 'Históricos',
      poet: 'Poéticos',
      majProphet: 'Profetas maiores',
      mnrProphet: 'Profetas menores',
      gospel: 'Evangelhos',
      ntHist: 'Histórico do NT (Atos)',
      paulLetter: 'Cartas de Paulo',
      genLetter: '-Cartas gerais de Paulo',
      prisonLetter: '-Cartas da prisão',
      pastorLetter: '-Cartas pastorais',
      comLetter: 'Cartas gerais',
      rev: 'Profecia (Apocalipse)',
    },
    keywordRequired: 'Digite uma palavra em Palavra A.', // text_search_keyword_required
    keywordTooShort: 'Digite pelo menos duas letras em Palavra A.', // text_search_keyword_too_short
    searching: (book) => `Pesquisando... ${book}`, // text_searching
    noResult: 'Nenhum resultado!', // text_no_search_result
    found: (n) => `Total: ${n} versículos encontrados.`, // text_total_count + text_found_verses
    searchCanceled: (n) => `Pesquisa cancelada. ${n} versículos encontrados.`, // text_search_canceled
    searchFailed: 'Não foi possível pesquisar',
    stop: 'Parar',
    more: (n) => `Mostrar mais (faltam ${n})`,
    verseRef: (book, chapter, verse) => `${book} ${chapter}:${verse}`,
    selCount: (n) => (n === 1 ? '1 versículo' : `${n} versículos`),
    copy: 'Copiar',
    share: 'Enviar', // 'Compartilhar'은 360px 동작 바에서 절 수를 0px로 밀어냈다. 앱 menu_verse_send도 'Enviar'
    copyVerses: 'Copiar versículo(s) selecionado(s)', // menu_copy_verse
    shareVerses: 'Enviar versículo(s) selecionado(s)', // menu_verse_send
    clearSelection: 'Desmarcar versículo(s) selecionado(s)', // menu_check_clear
    copied: 'Versículo(s) selecionado(s) copiado(s)', // text_copied_selected_verses
    copyFailed: 'Não foi possível copiar',
    shareFailed: 'Não foi possível compartilhar',
    highlight: 'Destacar',
    highlightOff: 'Remover',
    highlightVerses: 'Destacar versículo(s) selecionado(s)', // menu_verse_underline
    removeHighlight: 'Remover destaque', // menu_verse_underline_remove
    highlightFailed: 'Não foi possível salvar o destaque',
    myHighlights: 'Meus destaques', // menu_underline_list
    orderRecent: 'Mais recentes', // menu_timely_order
    orderBook: 'Ordem dos livros', // menu_book_order
    hlEmpty: 'Ainda não há versículos destacados.\nToque nos versículos na tela de leitura para selecioná-los e depois em [Destacar].', // text_underline_empty를 웹에 맞게
    hlSend: 'Enviar destaques', // menu_underline_send
    hlCopiedAll: 'Lista de destaques copiada',
    deleteAll: 'Excluir tudo', // menu_delete_all
    hlDeleteAllConfirm: 'Deseja mesmo excluir todos os seus destaques?', // text_ask_to_delete_all_my_underlines(위젯 문구는 뺌)
    hlDeletedAll: 'Todos os destaques foram excluídos!', // text_deleted_all_my_underline
    hlDelete: (ref) => `Remover o destaque de ${ref}`,
    hlDeleteConfirm: (ref) => `Remover o destaque de ${ref}?`,
    hlLoadFailed: 'Não foi possível ler os destaques',
    noSuchVersion: (name) => `${name} não está disponível. Baixe ou adicione de novo.`,
    addBookmark: 'Adicionar marcador', // menu_add_bookmark
    copyChapter: 'Copiar o capítulo', // menu_copy_chapter
    sendChapter: 'Enviar o capítulo', // menu_chapter_send
    copiedChapter: 'Capítulo copiado', // text_copied_this_chapter
    reportVerseError: 'Relatar erro no texto', // menu_report_verse_error
    verseErrorSubject: '[Erro no texto] Lifove Bible', // text_verse_error_subject
    verseErrorGuide: 'Descreva abaixo qual parte do versículo está errada e como deveria ser. Se possível, informe também a fonte (por exemplo, uma Bíblia impressa e a página).', // text_verse_error_guide
    reportMailHint: 'Se nenhum aplicativo de e-mail abrir, envie seu relato para bible@lifove.net.', // text_no_mail_app를 고침(웹은 메일 앱이 열렸는지 알 수 없다)
    bookmarks: 'Marcadores', // menu_bookmark
    bookmarkAdded: (ref) => `Marcador salvo! (${ref})`, // text_bookmark_added에 위치를 붙임
    bookmarkFailed: 'Não foi possível salvar o marcador',
    bmEmpty: 'Nenhum marcador\nDurante a leitura, toque em ☰ → [Adicionar marcador] para salvar o versículo do topo da tela.', // text_no_bookmark를 웹에 맞게
    bmDelete: (ref) => `Excluir o marcador ${ref}`,
    bmDeleteConfirm: (ref) => `Excluir o marcador ${ref}?`,
    bmLoadFailed: 'Não foi possível ler os marcadores',
    memo: 'Nota',
    memoVerse: 'Escrever/ver nota', // menu_memo
    memoOpen: (ref) => `Ver a nota de ${ref}`,
    save: 'Salvar', // alert_dialog_save
    del: 'Excluir', // alert_dialog_del
    memoSaveChanges: 'Salvar as alterações desta nota?', // memo_save_changes
    memoDiscard: 'Não salvar', // memo_discard_changes
    memoDeleteConfirm: 'Excluir esta nota?', // memo_delete_confirm
    memoShow: 'Mostrar notas', // menu_memo_show
    memoHide: 'Ocultar notas', // menu_memo_hide
    memoFailed: 'Não foi possível salvar a nota',
    memoLoadFailed: 'Não foi possível ler a nota',
    myMemos: 'Minhas notas', // menu_memo_list
    myMemoList: 'Minhas notas', // text_my_memo_list
    mlEmpty: 'Ainda não há notas.\nToque em um versículo na tela de leitura para selecioná-lo e depois em [Nota] para adicionar uma nota.', // text_memo_empty를 웹에 맞게
    mlSearchHint: 'Pesquisar notas', // text_memo_search_hint
    mlSearchNone: 'Nenhuma nota corresponde à pesquisa.', // text_memo_search_none
    mlSearchClear: 'Limpar pesquisa', // text_memo_search_clear
    mlSend: 'Enviar notas', // menu_memo_backup
    mlCopiedAll: 'Lista de notas copiada',
    mlDeleteAllConfirm: 'Deseja mesmo excluir todas as suas notas?', // text_ask_to_delete_all_my_memos
    mlDeletedAll: 'Todas as notas foram excluídas!', // text_deleted_all_my_memo
    mlDelete: (ref) => `Excluir a nota de ${ref}`,
    mlDeleteConfirm: (ref) => `Excluir a nota de ${ref}?`,
    groupMemo: 'Notas', // pref_group_memo
    memoBooks: 'Cadernos de notas', // text_memo_books
    memoBooksHint: 'Adicione cadernos de notas ou mude o nome, a ordem e o modo de escrever', // text_memo_books_summary
    memoOptions: ['Ir para o próximo versículo ao salvar', 'Pular versículos que já têm nota', 'No fim do capítulo, ir para o próximo', 'Salvar com a tecla Enter'], // text_memo_book_continuous, _skip_filled, _next_chapter, _enter_saves
    memoOptionOn: (name) => `${name}: ativado`, // text_memo_option_on
    memoOptionOff: (name) => `${name}: desativado`, // text_memo_option_off
    memoNoNextVerse: 'Não há mais versículos para escrever neste capítulo', // text_memo_no_next_verse
    memoBookDefault: 'Caderno padrão', // text_memo_book_default
    memoBookAdd: '+ Adicionar caderno', // text_memo_book_add
    memoBookNew: 'Novo caderno de notas', // text_memo_book_new
    memoBookName: 'Nome', // text_memo_book_name
    memoBookManage: 'Gerenciar cadernos', // text_memo_book_manage
    memoBookCount: (n) => `Notas: ${n}`, // text_memo_book_count
    memoBookMoveUp: (name) => `Mover ${name} para cima`, // text_memo_book_move_up
    memoBookMoveDown: (name) => `Mover ${name} para baixo`, // text_memo_book_move_down
    memoBookDelete: (name) => `Excluir ${name}`,
    memoBookDeleteConfirm: (name, n) => `Excluir o caderno “${name}”? As ${n} notas dele também serão excluídas.`, // text_memo_book_delete_confirm
    memoBookDeleteConfirmEmpty: (name) => `Excluir o caderno “${name}”?`, // text_memo_book_delete_confirm_empty
    memoBookPick: 'Trocar de caderno',
    memoBookFailed: 'Não foi possível salvar o caderno',
    backupMenu: 'Gerenciamento de dados', // text_title_pref_3(앱 설정의 데이터 관리 묶음). 동기화·백업·복구를 한 창에(2026-11-28)
    backupSaveTitle: 'Backup de dados', // menu_db_backup
    backupSaveHint: 'Faz backup de Meus destaques, Minhas notas e Estatísticas de leitura. Marcadores e cadernos de notas também entram. É o mesmo arquivo de backup (.db) do aplicativo Android, então você pode abri-lo no aplicativo em Configurações > Restaurar dados.', // text_pref_db_backup_summary에 웹 설명을 붙임
    backupRun: 'Fazer backup', // menu_db_backup_run
    backupInProgress: 'Fazendo backup...', // text_backup_in_progress
    backupSaved: (name) => `Backup concluído.\nSalvo em: ${name} (a pasta de downloads do navegador)`, // text_backup_successfully + text_backup_location
    backupFailed: 'Falha no backup!', // text_backup_failed
    backupLast: (when) => `Último backup: ${when}`,
    backupNever: 'Você ainda não fez nenhum backup.',
    backupMoveHint: 'Você também pode usar o arquivo de backup em outros dispositivos. Passe o arquivo por e-mail, mensageiro, armazenamento na nuvem ou algo parecido e escolha-o no aplicativo Lifove Bible de um celular ou tablet Android (Configurações > Restaurar dados) ou na versão web de outro dispositivo ou navegador ([Restaurar] abaixo) para continuar usando seus destaques, notas e mais.', // 다른 기기의 앱·웹에서 복구해 이어 쓰기
    // 기록 보관 안내·책임 안내(backupNotice1~3)는 사용자와 정한 문구. 뜻을 바꾸지 않고 정중하게 옮겼다
    backupNoticeTitle: 'Leia, por favor: como guardar seus registros',
    backupNotice1: 'Seus destaques, notas, marcadores e registros de leitura ficam salvos apenas neste navegador, neste dispositivo; eles não são guardados em nosso servidor. Eles podem se perder se você apagar os dados do site no navegador, se o dispositivo ficar sem espaço ou se você trocar de dispositivo ou de navegador, e os registros perdidos não podem ser recuperados. O Safari no iPhone e no iPad também pode apagá-los se o site não tiver sido adicionado à Tela de Início e não for aberto por mais de 7 dias.',
    backupNotice2: 'Para não perder seus registros, faça backup regularmente e guarde os arquivos em um lugar seguro, como um computador ou um armazenamento na nuvem. Se passarem 7 dias desde o último backup, um aviso aparecerá no topo da tela.',
    backupNoticeSync: 'Se você ativar a sincronização com o Google Drive (no alto de ☰ → Gerenciamento de dados), seus registros também ficam salvos no seu próprio Google Drive e você pode continuar nos seus outros dispositivos. Enquanto a sincronização estiver ativada e tiver sido feita nos últimos 7 dias, o aviso de backup não aparece. Mesmo assim, guardar também os arquivos de backup é mais seguro.',
    backupNotice3: 'Fazer os backups e guardar os arquivos fica sob sua responsabilidade. Não podemos recuperar registros perdidos sem backup e pedimos, gentilmente, sua compreensão de que essa responsabilidade é sua.',
    reminderNever: 'Alguns dos seus registros ainda não têm backup. Faça um backup para não perdê-los.',
    reminderDays: (n) => `Já se passaram ${n} dias desde o seu último backup. Faça um backup para não perder seus registros.`,
    reminderBackup: 'Fazer backup',
    reminderLater: 'Mais tarde',
    restoreTitle: 'Restaurar dados', // menu_db_restore
    restoreHint: 'Restaura um backup. Você também pode escolher um arquivo de backup do aplicativo Android (lifovebible_backup_….db ou lifovebible_autobackup.db em Download/LifoveBible, ou lifovebible de versões antigas).', // text_pref_db_restore_summary에 웹 설명을 붙임
    restoreRun: 'Restaurar', // menu_db_restore_run
    restoreMerge: ['Mesclar (recomendado)', 'Mantém seus dados atuais e acrescenta o que só está no backup ou foi alterado depois nele. Você escolhe as notas que forem diferentes.'], // restore_mode_merge
    restoreReplace: ['Substituir', 'Apaga seus dados atuais e usa o backup no lugar. Seus marcadores ficam se o backup não tiver nenhum.'], // restore_mode_replace에서 위젯 문장을 뺌
    restoreInProgress: 'Restaurando dados...', // text_restore_in_progress
    restoreDone: 'Restauração de dados concluída', // text_restore_successfully
    restoreFailed: 'Falha na restauração dos dados!', // text_restore_failed
    restoreNotBackup: 'Este não é um arquivo de backup do Lifove Bible. Seus dados atuais não foram alterados.',
    restoreNewer: 'Este backup foi feito por uma versão mais nova do Lifove Bible. Tente novamente depois que a versão web for atualizada. Seus dados atuais não foram alterados.', // text_restore_newer_backup을 웹에 맞게
    mergeDone: (u, m, r, b) => `Backup mesclado.\nTrazido do backup: ${u} destaque(s), ${m} nota(s), ${r} marca(s) de leitura, ${b} marcador(es).`, // restore_merge_done
    mergeNothing: 'Não há nada novo no backup. Seus dados atuais já estão em dia.', // restore_merge_nothing
    mergeConflicts: (n) => `${n} nota(s) estão diferentes entre este dispositivo e o backup. Escolha cada uma.`, // restore_merge_conflicts(celular → dispositivo)
    conflictTitle: (i, n) => `Escolher nota (${i}/${n})`, // memo_conflict_title
    conflictLocal: 'Este dispositivo', // memo_conflict_local(Este celular)
    conflictBackup: 'Backup', // memo_conflict_backup
    conflictOther: 'Outro dispositivo', // sync memo conflict (web first)
    conflictDeleted: '(excluída)', // memo_conflict_deleted(앱 7.7)
    conflictStoppedSync: 'As notas que você não escolheu ficam por enquanto com a versão deste aparelho. Vamos perguntar de novo na próxima sincronização.', // memo_conflict_stopped_sync
    syncOtherBooks: (list) => `Chegaram notas novas em outros cadernos de notas: ${list}. Troque o caderno na lista de notas para vê-las.`, // text_sync_other_books
    groupSync: 'Sincronização',
    syncTitle: 'Sincronização com o Google Drive',
    syncRowOff: 'Desativada',
    syncRowOn: (email) => `Ativada · ${email}`,
    syncRowOnNoEmail: 'Ativada',
    syncAbout: 'Salva seus destaques, notas, cadernos de notas, marcadores, registros de leitura e a ordem das traduções no seu Google Drive e os mantém iguais nos seus outros dispositivos. Ative com a mesma conta do Google no app para Android (7.7 ou posterior) e na versão web em outros navegadores para continuar de onde parou. No Drive, é usada apenas uma pasta própria deste app; os outros arquivos do seu Drive não são lidos.',
    syncOn: 'Usar sincronização',
    syncOnHint: 'Ao ativar, escolha uma conta do Google. Os registros deste navegador e os do seu Drive são combinados.',
    syncAccount: (email) => `Conta: ${email}`,
    syncLast: (when) => `Última sincronização: ${when}`,
    syncNever: 'Ainda não sincronizado.',
    syncNow: 'Sincronizar agora',
    syncRunning: 'Sincronizando…',
    syncDone: 'Sincronização concluída.',
    syncNewer: 'Não foi possível ler alguns registros de outro dispositivo porque o app dele é uma versão mais nova. Eles serão sincronizados depois que a versão web for atualizada.',
    syncLeft: (n) => `Ainda há ${n} nota(s) para escolher. Os registros deste dispositivo só são enviados depois que você escolher todas.`,
    syncFailed: (msg) => `Não foi possível sincronizar. Verifique sua conexão com a internet. (${msg})`,
    syncSignInFailed: 'Não foi possível entrar no Google. Verifique se os pop-ups não estão bloqueados.',
    syncOffDone: 'Sincronização desativada. Os registros no seu Drive e neste dispositivo continuam como estão.',
    syncWebNote: 'Na versão web, o login do Google dura só uma hora. Ao abrir a versão web e depois de uma hora, toque uma vez em [Sincronizar] no alto da tela. Depois disso, as alterações são sincronizadas automaticamente.',
    syncLogTitle: 'Detalhes (registro da sincronização)',
    syncPaused: 'A sincronização com o Google Drive está pausada.',
    syncResume: 'Sincronizar',
    syncConflicts: (n) => `${n} nota(s) sincronizada(s) estão diferentes.`,
    syncChoose: 'Escolher',
    syncFilesTitle: 'Arquivos de traduções no seu Drive',
    syncFilesHint: 'As traduções que não podem ser baixadas do servidor (as que você adicionou, as pagas) são enviadas ao seu Drive como arquivos para que seus outros dispositivos também possam baixá-las. Elas ocupam espaço no seu Drive. Excluir uma tradução neste dispositivo não exclui o arquivo dela no seu Drive.',
    syncFilesSummary: (n, mb) => `${n} tradução(ões), ${mb} MB`,
    syncFilesNone: 'Não há arquivos de traduções no seu Drive.',
    syncFilesUnknown: 'Aparece depois de sincronizar.',
    syncFileDeleteAsk: (name) => `${name}: se você excluir do seu Drive, seus outros dispositivos não poderão baixar esta tradução de novo. Excluir?`,
    syncFileDeleteAskPlain: (name) => `Excluir o arquivo ${name} do seu Drive?`,
    syncFileDeleted: (name) => `O arquivo ${name} foi excluído do seu Drive.`,
    syncFilesAsk: (names) => `Baixar também neste dispositivo os arquivos de traduções enviados dos seus outros dispositivos?\n${names}`,
    syncFileReplaceAsk: (name) => `Seu Drive tem um arquivo ${name} adicionado depois em outro dispositivo. Substituir o arquivo deste dispositivo por ele?`,
    syncGet: 'Baixar',
    syncReplace: 'Substituir',
    syncFilesFailed: (msg) => `Não foi possível sincronizar os arquivos de traduções. (${msg})`,
    syncFilesWaiting: (n) => `${n} tradução(ões) ainda não enviada(s) será(ão) enviada(s) em uma rede sem cobrança de dados, como Wi-Fi. No celular, tocar em [Sincronizar agora] envia na hora (exceto quando se sabe que você está usando dados móveis).`,
    syncFileReplaceConfirm: (name) => `${name} já está neste dispositivo. Ao baixar, ele será substituído pelo do seu Drive. Baixar?`,
    syncFileIncomplete: '(ainda não enviado por completo)',
    syncPositionAsk: (device, ref) => `Em ${device} você estava lendo ${ref}. Ir para lá?`,
    syncGo: 'Ir',
    syncVersionsAsk: (names) => `Baixar neste dispositivo as traduções que você tem em outros dispositivos?
${names}`,
    conflictBoth: 'Ambas', // memo_conflict_both
    conflictApplyRest: (n) => `Fazer o mesmo com as ${n} restantes`, // memo_conflict_apply_rest
    conflictDone: 'Escolha das notas concluída.', // memo_conflict_done
    conflictStopped: 'As notas que você não escolheu ficaram com a versão deste dispositivo.', // memo_conflict_stopped
  },
  // 프랑스어: 앱에 values-fr가 없어 위 en 블록을 새로 번역했다(2026-11-27). 키 주석의 앱 이름은 en 블록 참고.
  // ? ! : 앞은 프랑스어 띄어쓰기대로 줄바꿈 없는 공백( )이라 그 앞에서 줄이 끊기지 않는다. 존댓말(vous)
  fr: {
    listLoading: 'Chargement de la liste…',
    listFailed: 'Impossible de charger la liste des Bibles',
    downloading: 'Téléchargement...',
    missingVerse: '(Aucun)',
    ot: 'Ancien Testament',
    nt: 'Nouveau Testament',
    textSize: 'Taille du texte',
    smaller: 'Plus petit',
    larger: 'Plus grand',
    prev: 'Chapitre précédent',
    next: 'Chapitre suivant',
    pickBook: 'Choisir un livre',
    pickChapter: 'Choisir un chapitre',
    pickVerse: 'Choisir un verset',
    versePos: (now, last) => `Verset ${now} sur ${last}`,
    readCheck: 'Marquer ce chapitre comme lu',
    checkedAsRead: 'Marqué comme lu.',
    uncheckedRead: 'Marque de lecture retirée.',
    checkedAllTrans: 'Marquer comme lu dans les versions choisies',
    uncheckedAllTrans: 'Retirer la marque de lecture des versions choisies',
    readCheckFailed: "Impossible d'enregistrer la marque de lecture",
    readStats: 'Statistiques de lecture',
    statsTotal: 'Tout',
    statsValue: (read, total, pct) => `${read} / ${total} · ${pct} %`,
    statsReset: 'Réinitialiser les lectures',
    statsResetConfirm: (name) => `Effacer toutes les marques de lecture de ${name} ?`,
    statsResetDone: 'Statistiques de lecture réinitialisées',
    backToBooks: 'Livres',
    close: 'Fermer',
    version: 'Version',
    pickVersions: 'Lecture parallèle',
    pickOneVersion: 'Lecture simple',
    barBottom: 'Barre livre/chapitre en bas',
    viewerSettings: 'Réglages de lecture',
    groupScreen: "Disposition de l'écran",
    groupColors: 'Texte et couleurs',
    oneColumnHint: "Désactivé, les versions sont placées côte à côte sur deux colonnes ou plus selon la largeur de l'écran.",
    showVerName: 'Afficher le nom des versions',
    showVerNameHint: 'Afficher le nom de la version dans chaque colonne quand vous lisez plusieurs versions.',
    fontColor: 'Couleur du texte',
    bgColor: 'Couleur du fond',
    colorPresets: { light: 'Clair', dark: 'Sombre', sepia: 'Sépia', green: 'Vert' },
    colorSample: 'Au commencement, Dieu créa les cieux et la terre.',
    colorReset: 'Couleurs par défaut',
    groupHighlight: 'Réglages du surlignage',
    hlStyle: 'Style du surlignage',
    hlStyleHint: "Choisissez l'apparence des versets surlignés. Vous pouvez en choisir plusieurs.",
    hlStyles: ['Fond surligné', 'Souligné', 'Couleur du texte', 'Gras'],
    hlColor: 'Couleur du surligneur',
    hlTextColor: 'Couleur du soulignement/texte',
    hlNeedOne: 'Choisissez au moins un style de surlignage.',
    groupNav: 'Navigation et toucher',
    navBar: 'Afficher les boutons de navigation',
    navBarHint: 'Afficher des boutons de déplacement sur le texte.',
    navPos: 'Position des boutons de navigation',
    navPositions: {
      'right-middle': 'Milieu à droite',
      'right-bottom': 'En bas à droite',
      'left-middle': 'Milieu à gauche',
      'left-bottom': 'En bas à gauche',
    },
    navBarOptions: {
      1: 'Masquer la barre de navigation',
      2: 'Versets seulement',
      3: 'Chapitres seulement',
      5: 'Historique seulement',
      4: 'Versets, chapitres',
      6: 'Versets, historique',
      7: 'Chapitres, historique',
      8: 'Versets, chapitres, historique',
    },
    navUnit: 'Déplacement avec haut/bas',
    navUnits: { verse: "D'un verset", page: "D'un écran (versets)", chapter: "D'un chapitre" },
    swipeChapter: 'Balayer pour changer de chapitre',
    swipeChapterHint: "Balayez le texte vers la gauche ou la droite pour aller au chapitre suivant ou précédent. Désactivez si le chapitre change alors que vous vouliez seulement faire défiler.",
    ttsPlay: 'Lire un chapitre (TTS)',
    ttsPlayVerse: 'Lire à partir du verset choisi (TTS)',
    ttsSpeed: (rate) => `Vitesse de lecture ${rate}`,
    ttsPause: 'Pause',
    ttsResume: 'Reprendre',
    ttsStop: 'Arrêter',
    ttsNoVoice: "Aucune voix pour cette langue. Veuillez installer des données vocales.",
    ttsFailed: 'Impossible de lire ce chapitre à voix haute.',
    groupTts: 'Réglages de la lecture (TTS)',
    ttsButton: 'Afficher le bouton audio',
    ttsButtonHint: "Afficher le bouton audio (▶) dans l'écran de lecture. Désactivez-le si vous n'utilisez pas l'audio.",
    ttsReadCheck: 'Marquer comme lu après écoute',
    ttsReadCheckHint: "Marquer automatiquement le chapitre comme lu quand sa lecture audio est terminée",
    ttsVoice: 'Voix',
    ttsVoiceSummary: (lang, voice) => `Langue de la Bible actuelle : ${lang} / ${voice}`,
    ttsVoiceDefault: "Voix par défaut de l'appareil",
    ttsVoiceNetwork: 'Internet requis',
    ttsVoiceItem: (n) => `Voix ${n}`,
    ttsInstall: 'Installer/gérer les voix',
    ttsInstallHint: 'Voir comment ajouter des voix à votre appareil.',
    ttsNoLanguage: "Aucune voix de synthèse pour cette langue sur votre appareil. Installer des données vocales ?",
    ttsOpenSettings: 'Installer une voix',
    navUp: 'Haut',
    navDown: 'Bas',
    navBack: 'Historique précédent',
    navForward: 'Historique suivant',
    downAgain: 'Appuyez encore sur Bas pour passer au chapitre suivant.',
    pickOneHint: 'Choisissez une des versions téléchargées ou ajoutées pour la lire.',
    pickVersionsHint: "Versions téléchargées et ajoutées. Choisissez-en plusieurs pour les lire côte à côte, dans l'ordre où vous les choisissez.",
    oneColumn: 'Comparer les versions sur une colonne',
    ok: 'OK',
    cancel: 'Annuler',
    delete: 'Supprimer',
    downloaded: 'Téléchargée',
    deleteConfirm: (name) => `Supprimer « ${name} » téléchargée ? Pour la relire, il faudra la télécharger de nouveau.`,
    menu: 'Menu',
    help: 'Aide',
    helpFailed: "Impossible de charger l'aide",
    download: 'Télécharger',
    downloadHint: 'Choisissez des versions et touchez Télécharger. Les versions téléchargées se lisent sans Internet et se choisissent dans la Lecture parallèle.',
    downloadAll: (i, n) => `Téléchargement... (${i}/${n})`,
    downloadDone: 'Téléchargement terminé !',
    downloadFailed: (names) => `Échec du téléchargement : ${names}. Vérifiez votre connexion Internet et réessayez.`,
    noCache: 'Cette adresse ne peut pas conserver les fichiers de la Bible ; ils sont téléchargés à chaque lecture.',
    moreVersions: "Obtenir d'autres versions (Télécharger) ›",
    noVersions: 'Aucune Bible téléchargée. Téléchargez une version pour lire.',
    importTitle: 'Ajouter des fichiers de Bible',
    noLocal: 'Aucune version ajoutée par vous.',
    listOld: "Impossible de charger la dernière liste. Voici la liste précédente",
    updateReady: 'Une nouvelle version est disponible',
    updateApply: 'Recharger',
    dbBlocked: "Fermez Lifove Bible dans les autres onglets ou fenêtres pour utiliser les notes et le surlignage.",
    noChapter: "Ce chapitre n'existe pas dans cette version",
    loadFailed: 'Impossible de charger le texte',
    ref: (book, chapter) => `${book} ${chapter}`,
    importFiles: 'Ajouter des fichiers',
    importFolder: 'Ajouter un dossier',
    importHint: "Ajoutez les fichiers de Bible que vous avez (.lfa, .bdf), ou glissez-les sur la page. Vous pouvez aussi ajouter le dossier Download/LifoveBible/bible exporté de l'application.",
    importing: 'Ajout...',
    imported: (names) => `Ajouté : ${names}`,
    importFailed: (items) => `Impossible d'ajouter : ${items}`,
    importNone: 'Aucun fichier de Bible (.lfa, .bdf) trouvé',
    reasons: {
      notZip: "impossible d'ouvrir le fichier",
      noChapters: 'aucun fichier de chapitre',
      badText: 'format de texte inconnu',
      storeFailed: "impossible d'enregistrer",
    },
    localGroup: 'Ajoutées par vous',
    localBadge: 'Ajoutée',
    deleteLocalConfirm: (name) => `Supprimer « ${name} » que vous avez ajoutée ? Pour la relire, il faudra ajouter le fichier de nouveau.`,
    localRename: (name) => `Renommer ${name}`,
    localRenamePrompt: (name) => `Saisissez un nom pour cette version de la Bible. Laissez vide pour afficher le nom d'origine (${name}).`,
    localMissing: "Le fichier ajouté n'est plus là. Veuillez l'ajouter de nouveau",
    dropHere: 'Déposez ici pour ajouter des fichiers de Bible (.lfa, .bdf)',
    search: 'Rechercher',
    keywordA: 'Mot-clé A',
    keywordB: 'Mot-clé B',
    searchRange: 'Étendue',
    searchVersion: 'Version à rechercher',
    themes: 'Groupes',
    rangeAll: 'Tout',
    themeNames: {
      moses: 'Pentateuque',
      hist: 'Livres historiques',
      poet: 'Livres poétiques',
      majProphet: 'Grands prophètes',
      mnrProphet: 'Petits prophètes',
      gospel: 'Évangiles',
      ntHist: 'Histoire du NT (Actes)',
      paulLetter: 'Épîtres de Paul',
      genLetter: '-Épîtres générales de Paul',
      prisonLetter: '-Épîtres de la captivité',
      pastorLetter: '-Épîtres pastorales',
      comLetter: 'Épîtres générales',
      rev: 'Apocalyptique (Ap.)',
    },
    keywordRequired: 'Saisissez un mot dans Mot-clé A.',
    keywordTooShort: 'Saisissez au moins deux lettres dans Mot-clé A.',
    searching: (book) => `Recherche... ${book}`,
    noResult: 'Aucun résultat !',
    found: (n) => (n === 1 ? '1 verset trouvé.' : `${n} versets trouvés.`),
    searchCanceled: (n) => `Recherche annulée. ${n} verset(s) trouvé(s).`,
    searchFailed: 'Impossible de rechercher',
    stop: 'Arrêter',
    more: (n) => `Afficher plus (encore ${n})`,
    verseRef: (book, chapter, verse) => `${book} ${chapter}:${verse}`,
    selCount: (n) => (n === 1 ? '1 verset' : `${n} versets`),
    copy: 'Copier',
    share: 'Partager',
    copyVerses: 'Copier le(s) verset(s) choisi(s)',
    shareVerses: 'Envoyer le(s) verset(s) choisi(s)',
    clearSelection: 'Désélectionner le(s) verset(s)',
    copied: 'Verset(s) choisi(s) copié(s)',
    copyFailed: 'Impossible de copier',
    shareFailed: 'Impossible de partager',
    highlight: 'Surligner',
    highlightOff: 'Retirer',
    highlightVerses: 'Surligner le(s) verset(s) choisi(s)',
    removeHighlight: 'Retirer le surlignage',
    highlightFailed: "Impossible d'enregistrer le surlignage",
    myHighlights: 'Mes surlignages',
    orderRecent: 'Par date',
    orderBook: 'Par livre',
    hlEmpty: "Aucun verset surligné.\nTouchez des versets dans l'écran de lecture pour les choisir, puis appuyez sur [Surligner].",
    hlSend: 'Envoyer les surlignages',
    hlCopiedAll: 'Liste des surlignages copiée',
    deleteAll: 'Tout supprimer',
    hlDeleteAllConfirm: 'Voulez-vous vraiment supprimer tous vos surlignages ?',
    hlDeletedAll: 'Tous vos surlignages ont été supprimés !',
    hlDelete: (ref) => `Retirer le surlignage de ${ref}`,
    hlDeleteConfirm: (ref) => `Retirer le surlignage de ${ref} ?`,
    hlLoadFailed: 'Impossible de lire les surlignages',
    noSuchVersion: (name) => `${name} n'est pas disponible. Téléchargez-la ou ajoutez-la de nouveau.`,
    addBookmark: 'Ajouter un signet',
    copyChapter: 'Copier le chapitre',
    sendChapter: 'Envoyer le chapitre',
    copiedChapter: 'Chapitre copié',
    reportVerseError: 'Signaler une erreur de texte',
    verseErrorSubject: '[Erreur de texte] Lifove Bible',
    verseErrorGuide: "Décrivez ci-dessous quelle partie du verset est fausse et ce qu'elle devrait être. Si possible, indiquez aussi votre source (par exemple une Bible imprimée et sa page).",
    reportMailHint: "Si aucune application de messagerie ne s'ouvre, envoyez votre signalement à bible@lifove.net.",
    bookmarks: 'Signets',
    bookmarkAdded: (ref) => `Signet enregistré ! (${ref})`,
    bookmarkFailed: "Impossible d'enregistrer le signet",
    bmEmpty: "Aucun signet\nPendant la lecture, appuyez sur ☰ → [Ajouter un signet] pour enregistrer le verset en haut de l'écran.",
    bmDelete: (ref) => `Supprimer le signet ${ref}`,
    bmDeleteConfirm: (ref) => `Supprimer le signet ${ref} ?`,
    bmLoadFailed: 'Impossible de lire les signets',
    memo: 'Note',
    memoVerse: 'Écrire/afficher une note',
    memoOpen: (ref) => `Afficher la note de ${ref}`,
    save: 'Enregistrer',
    del: 'Supprimer',
    memoSaveChanges: 'Enregistrer les modifications de cette note ?',
    memoDiscard: 'Ne pas enregistrer',
    memoDeleteConfirm: 'Supprimer cette note ?',
    memoShow: 'Afficher les notes',
    memoHide: 'Masquer les notes',
    memoFailed: "Impossible d'enregistrer la note",
    memoLoadFailed: 'Impossible de lire la note',
    myMemos: 'Mes notes',
    myMemoList: 'Mes notes',
    mlEmpty: "Aucune note.\nTouchez un verset dans l'écran de lecture pour le choisir, puis appuyez sur [Note] pour ajouter une note.",
    mlSearchHint: 'Rechercher dans les notes',
    mlSearchNone: 'Aucune note ne correspond à votre recherche.',
    mlSearchClear: 'Effacer la recherche',
    mlSend: 'Envoyer les notes',
    mlCopiedAll: 'Liste des notes copiée',
    mlDeleteAllConfirm: 'Voulez-vous vraiment supprimer toutes vos notes ?',
    mlDeletedAll: 'Toutes vos notes ont été supprimées !',
    mlDelete: (ref) => `Supprimer la note de ${ref}`,
    mlDeleteConfirm: (ref) => `Supprimer la note de ${ref} ?`,
    groupMemo: 'Notes',
    memoBooks: 'Carnets de notes',
    memoBooksHint: "Ajoutez des carnets, ou changez leur nom, leur ordre et la façon d'y écrire",
    memoOptions: ["Passer au verset suivant après l'enregistrement", 'Sauter les versets qui ont déjà une note', 'À la fin du chapitre, passer au chapitre suivant', 'Enregistrer avec la touche Entrée'],
    memoOptionOn: (name) => `${name} : activé`,
    memoOptionOff: (name) => `${name} : désactivé`,
    memoNoNextVerse: 'Plus de verset où écrire dans ce chapitre',
    memoBookDefault: 'Carnet par défaut',
    memoBookAdd: '+ Ajouter un carnet',
    memoBookNew: 'Nouveau carnet',
    memoBookName: 'Nom',
    memoBookManage: 'Gérer les carnets',
    memoBookCount: (n) => `Notes : ${n}`,
    memoBookMoveUp: (name) => `Monter ${name}`,
    memoBookMoveDown: (name) => `Descendre ${name}`,
    memoBookDelete: (name) => `Supprimer ${name}`,
    memoBookDeleteConfirm: (name, n) => `Supprimer le carnet « ${name} » ? Ses ${n} notes seront aussi supprimées.`,
    memoBookDeleteConfirmEmpty: (name) => `Supprimer le carnet « ${name} » ?`,
    memoBookPick: 'Changer de carnet',
    memoBookFailed: "Impossible d'enregistrer le carnet",
    backupMenu: 'Gestion des données', // text_title_pref_3(앱 설정의 데이터 관리 묶음). 동기화·백업·복구를 한 창에(2026-11-28)
    backupSaveTitle: 'Sauvegarde des données',
    backupSaveHint: "Sauvegarde Mes surlignages, Mes notes et les Statistiques de lecture. Les signets et les carnets sont inclus. C'est le même fichier de sauvegarde (.db) que l'application Android : vous pouvez l'ouvrir dans l'application sous Réglages > Restaurer les données.",
    backupRun: 'Lancer la sauvegarde',
    backupInProgress: 'Sauvegarde en cours...',
    backupSaved: (name) => `Sauvegarde terminée.\nFichier : ${name} (dossier de téléchargement du navigateur)`,
    backupFailed: 'Échec de la sauvegarde !',
    backupLast: (when) => `Dernière sauvegarde : ${when}`,
    backupNever: "Vous n'avez encore fait aucune sauvegarde.",
    backupMoveHint: "Le fichier de sauvegarde s'utilise aussi sur d'autres appareils. Transférez-le par e-mail, messagerie, stockage en ligne ou autre, puis choisissez-le dans l'application Lifove Bible sur un téléphone ou une tablette Android (Réglages > Restaurer les données), ou dans la version web sur un autre appareil ou navigateur ([Lancer la restauration] ci-dessous), pour continuer à utiliser vos surlignages, vos notes et le reste.",
    backupNoticeTitle: 'À lire : conservation de vos données',
    backupNotice1: "Vos surlignages, notes, signets et lectures sont enregistrés uniquement dans ce navigateur, sur cet appareil ; ils ne sont pas conservés sur notre serveur. Ils peuvent être perdus si vous effacez les données du site dans le navigateur, si l'appareil manque d'espace, ou si vous changez d'appareil ou de navigateur, et les données perdues ne peuvent pas être récupérées. Sur iPhone et iPad, Safari peut aussi les supprimer si le site n'est pas ajouté à l'écran d'accueil et n'est pas ouvert pendant plus de 7 jours.",
    backupNotice2: "Pour protéger vos données, veuillez faire des sauvegardes régulièrement et garder les fichiers en lieu sûr, par exemple sur un ordinateur ou un stockage en ligne. Si 7 jours passent depuis votre dernière sauvegarde, un rappel apparaît en haut de l'écran.",
    backupNoticeSync: 'Si vous activez la synchronisation Google Drive (en haut de ☰ → Gestion des données), vos données sont aussi enregistrées dans votre propre Google Drive et vous pouvez continuer sur vos autres appareils. Tant que la synchronisation est activée et a eu lieu au cours des 7 derniers jours, le rappel de sauvegarde ne s\'affiche pas. Conserver aussi des fichiers de sauvegarde reste toutefois plus sûr.',
    backupNotice3: "La sauvegarde et la conservation des fichiers relèvent de votre responsabilité. Nous ne pouvons pas restaurer des données perdues sans sauvegarde, et nous vous remercions de bien vouloir comprendre que cette responsabilité vous incombe.",
    reminderNever: "Certaines de vos données n'ont pas encore été sauvegardées. Veuillez faire une sauvegarde pour ne pas les perdre.",
    reminderDays: (n) => `${n} jours se sont écoulés depuis votre dernière sauvegarde. Veuillez faire une sauvegarde pour ne pas perdre vos données.`,
    reminderBackup: 'Sauvegarder',
    reminderLater: 'Plus tard',
    restoreTitle: 'Restaurer les données',
    restoreHint: "Restaurer une sauvegarde. Vous pouvez aussi choisir un fichier de sauvegarde de l'application Android (lifovebible_backup_….db ou lifovebible_autobackup.db dans Download/LifoveBible, ou lifovebible des anciennes versions).",
    restoreRun: 'Lancer la restauration',
    restoreMerge: ['Fusionner (recommandé)', "Garder vos données actuelles et ajouter ce qui n'existe que dans la sauvegarde ou y a été modifié plus tard. Vous choisissez pour les notes qui diffèrent."],
    restoreReplace: ['Remplacer', "Supprimer vos données actuelles et utiliser la sauvegarde à la place. Vos signets sont gardés si la sauvegarde n'en contient pas."],
    restoreInProgress: 'Restauration des données en cours...',
    restoreDone: 'Restauration des données terminée',
    restoreFailed: 'Échec de la restauration des données !',
    restoreNotBackup: "Ce n'est pas un fichier de sauvegarde Lifove Bible. Vos données actuelles n'ont pas été modifiées.",
    restoreNewer: "Cette sauvegarde a été faite par une version plus récente de Lifove Bible. Réessayez après la mise à jour de la version web. Vos données actuelles n'ont pas été modifiées.",
    mergeDone: (u, m, r, b) => `Sauvegarde fusionnée.\nRepris de la sauvegarde : ${u} surlignage(s), ${m} note(s), ${r} lecture(s), ${b} signet(s).`,
    mergeNothing: 'Rien de nouveau dans la sauvegarde. Vos données actuelles sont déjà à jour.',
    mergeConflicts: (n) => `${n} note(s) diffèrent entre cet appareil et la sauvegarde. Choisissez pour chacune.`,
    conflictTitle: (i, n) => `Choisir une note (${i}/${n})`,
    conflictLocal: 'Cet appareil',
    conflictBackup: 'Sauvegarde',
    conflictOther: 'Autre appareil', // sync memo conflict (web first)
    conflictDeleted: '(supprimée)', // memo_conflict_deleted(앱 7.7)
    conflictStoppedSync: 'Les notes que vous n\'avez pas choisies gardent pour l\'instant la version de cet appareil. La question vous sera reposée à la prochaine synchronisation.', // memo_conflict_stopped_sync
    syncOtherBooks: (list) => `De nouvelles notes sont arrivées dans d'autres carnets de notes : ${list}. Changez de carnet dans la liste des notes pour les voir.`, // text_sync_other_books
    groupSync: 'Synchronisation',
    syncTitle: 'Synchronisation Google Drive',
    syncRowOff: 'Désactivée',
    syncRowOn: (email) => `Activée · ${email}`,
    syncRowOnNoEmail: 'Activée',
    syncAbout: 'Enregistre vos surlignages, notes, carnets de notes, signets, lectures et l\'ordre des versions dans votre Google Drive et les garde identiques sur vos autres appareils. Activez-la avec le même compte Google dans l\'application Android (7.7 ou ultérieure) et dans la version web sur d\'autres navigateurs pour reprendre là où vous vous êtes arrêté. Seul un dossier réservé à cette application est utilisé dans votre Drive ; les autres fichiers de votre Drive ne sont pas lus.',
    syncOn: 'Utiliser la synchronisation',
    syncOnHint: 'En l\'activant, choisissez un compte Google. Les données de ce navigateur et celles de votre Drive sont fusionnées.',
    syncAccount: (email) => `Compte : ${email}`,
    syncLast: (when) => `Dernière synchronisation : ${when}`,
    syncNever: 'Pas encore synchronisé.',
    syncNow: 'Synchroniser maintenant',
    syncRunning: 'Synchronisation…',
    syncDone: 'Synchronisation terminée.',
    syncNewer: 'Certaines données d\'un autre appareil n\'ont pas pu être lues, car son application est plus récente. Elles seront synchronisées après la mise à jour de la version web.',
    syncLeft: (n) => `Il reste ${n} note(s) à choisir. Les données de cet appareil ne sont pas envoyées tant que vous ne les avez pas toutes choisies.`,
    syncFailed: (msg) => `Échec de la synchronisation. Vérifiez votre connexion Internet. (${msg})`,
    syncSignInFailed: 'Impossible de se connecter à Google. Vérifiez que les fenêtres pop-up ne sont pas bloquées.',
    syncOffDone: 'Synchronisation désactivée. Les données de votre Drive et de cet appareil restent telles quelles.',
    syncWebNote: 'Dans la version web, la connexion Google ne dure qu\'une heure. À l\'ouverture de la version web et au bout d\'une heure, touchez une fois [Synchroniser] en haut de l\'écran. Ensuite, les modifications sont synchronisées automatiquement.',
    syncLogTitle: 'Détails (journal de synchronisation)',
    syncPaused: 'La synchronisation Google Drive est en pause.',
    syncResume: 'Synchroniser',
    syncConflicts: (n) => `${n} note(s) synchronisée(s) diffèrent.`,
    syncChoose: 'Choisir',
    syncFilesTitle: 'Fichiers de versions dans votre Drive',
    syncFilesHint: 'Les versions qui ne peuvent pas être téléchargées depuis le serveur (celles que vous avez ajoutées vous-même, les versions payantes) sont envoyées dans votre Drive sous forme de fichiers pour que vos autres appareils puissent aussi les télécharger. Elles occupent de l\'espace dans votre Drive. Supprimer une version sur cet appareil ne supprime pas son fichier dans votre Drive.',
    syncFilesSummary: (n, mb) => `${n} version(s), ${mb} Mo`,
    syncFilesNone: 'Aucun fichier de version dans votre Drive.',
    syncFilesUnknown: 'Affiché après la synchronisation.',
    syncFileDeleteAsk: (name) => `${name} : si vous le supprimez de votre Drive, vos autres appareils ne pourront plus télécharger cette version. Le supprimer ?`,
    syncFileDeleteAskPlain: (name) => `Supprimer le fichier ${name} de votre Drive ?`,
    syncFileDeleted: (name) => `Le fichier ${name} a été supprimé de votre Drive.`,
    syncFilesAsk: (names) => `Télécharger aussi sur cet appareil les fichiers de versions envoyés depuis vos autres appareils ?\n${names}`,
    syncFileReplaceAsk: (name) => `Votre Drive contient un fichier ${name} ajouté plus tard sur un autre appareil. Remplacer le fichier de cet appareil par celui-ci ?`,
    syncGet: 'Télécharger',
    syncReplace: 'Remplacer',
    syncFilesFailed: (msg) => `Impossible de synchroniser les fichiers de versions. (${msg})`,
    syncFilesWaiting: (n) => `${n} version(s) pas encore envoyée(s) le sera/seront sur un réseau sans frais de données, comme le Wi-Fi. Sur un téléphone, toucher [Synchroniser maintenant] les envoie tout de suite (sauf si l'on sait que vous utilisez les données mobiles).`,
    syncFileReplaceConfirm: (name) => `${name} est déjà sur cet appareil. Le télécharger le remplace par celui de votre Drive. Le télécharger ?`,
    syncFileIncomplete: '(pas encore entièrement envoyé)',
    syncPositionAsk: (device, ref) => `Sur ${device}, vous lisiez ${ref}. Y aller ?`,
    syncGo: 'Y aller',
    syncVersionsAsk: (names) => `Télécharger sur cet appareil les versions présentes sur vos autres appareils ?
${names}`,
    conflictBoth: 'Les deux',
    conflictApplyRest: (n) => `Faire de même pour les ${n} restantes`,
    conflictDone: 'Choix des notes terminé.',
    conflictStopped: "Les notes que vous n'avez pas choisies gardent la version de cet appareil.",
  },
};

/** 문구가 있는 언어 코드들 */
export const LANGS = Object.keys(STRINGS);

/** 브라우저 언어 하나를 우리 언어 코드로. 중국어는 번체(zh: 대만·홍콩·마카오·Hant)와 간체(zh-CN: 나머지)로 나눈다 */
function langCode(tag) {
  const t = String(tag || '').toLowerCase().replace(/_/g, '-');
  const base = t.split('-')[0];
  if (base === 'zh') return /-(hant|tw|hk|mo)\b/.test(t) ? 'zh' : 'zh-CN';
  return base;
}

/** 브라우저 언어 차례대로 문구가 있는 첫 언어를 고른다. 없으면 영어 */
export function pickLang(languages) {
  for (const l of languages || []) {
    const code = langCode(l);
    if (STRINGS[code]) return code;
  }
  return 'en';
}

export function stringsFor(lang) {
  return STRINGS[lang] || STRINGS.en;
}
