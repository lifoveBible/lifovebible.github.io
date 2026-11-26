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
    backupMenu: '데이터 백업·복구', // menu_db_backup + menu_db_restore
    backupSaveTitle: '데이터 백업', // menu_db_backup
    backupSaveHint: '나의 형광펜, 메모, 읽기통계 데이터를 모두 백업합니다. 책갈피와 메모책도 들어갑니다. 안드로이드 앱과 같은 백업 파일(.db)이라 앱의 설정 > 데이터 복구로도 열 수 있습니다.', // text_pref_db_backup_summary에 웹 설명을 붙임
    backupRun: '백업 실행', // menu_db_backup_run
    backupInProgress: '데이터를 백업 중입니다...', // text_backup_in_progress
    backupSaved: (name) => `데이터를 성공적으로 백업 하였습니다.\n파일: ${name} (브라우저의 다운로드 폴더)`, // text_backup_successfully + text_backup_location
    backupFailed: '데이터 백업에 실패하였습니다.', // text_backup_failed
    backupLast: (when) => `마지막 백업: ${when}`,
    backupNever: '아직 백업한 적이 없습니다.',
    backupNoticeTitle: '꼭 읽어 주세요: 기록 보관 안내',
    backupNotice1: '형광펜, 메모, 책갈피, 읽기 기록은 이 기기의 이 브라우저 안에만 저장되며, 서버에는 따로 보관되지 않습니다. 브라우저의 사이트 데이터를 지우거나, 저장 공간이 부족하거나, 기기나 브라우저를 바꾸면 기록이 사라질 수 있고, 사라진 기록은 되살릴 방법이 없습니다. 아이폰·아이패드의 사파리는 홈 화면에 추가하지 않은 채 7일 넘게 열지 않으면 기록을 지울 수도 있습니다.',
    backupNotice2: '소중한 기록을 잃지 않도록 정기적으로 백업해 주시고, 받은 백업 파일은 PC나 클라우드 드라이브처럼 안전한 곳에 함께 보관해 주세요. 백업한 지 7일이 지나면 화면 위에 알려 드립니다.',
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
    backupMenu: 'Backup & Restore', // menu_db_backup + menu_db_restore
    backupSaveTitle: 'Data Backup', // menu_db_backup
    backupSaveHint: 'Backup My Highlight, My Memo, and Read Statistics. Bookmarks and memo books are included. The file is the same backup file (.db) as the Android app, so you can open it in the app under Settings > Restore Data.', // text_pref_db_backup_summary + web note
    backupRun: 'Proceed Backup', // menu_db_backup_run
    backupInProgress: 'Backup in progress...', // text_backup_in_progress
    backupSaved: (name) => `Backup completed.\nFile: ${name} (your browser's download folder)`, // text_backup_successfully + text_backup_location
    backupFailed: 'Backup failed!', // text_backup_failed
    backupLast: (when) => `Last backup: ${when}`,
    backupNever: 'You have not made a backup yet.',
    backupNoticeTitle: 'Please read: keeping your records',
    backupNotice1: 'Your highlights, memos, bookmarks, and reading records are stored only in this browser on this device; they are not kept on our server. They can be lost if you clear the browser\'s site data, the device runs low on storage, or you change devices or browsers, and lost records cannot be recovered. Safari on iPhone and iPad may also delete them if the site is not added to the Home Screen and is not opened for more than 7 days.',
    backupNotice2: 'To keep your records safe, please back up regularly and keep the backup files in a safe place such as a computer or a cloud drive. If 7 days pass since your last backup, a reminder appears at the top of the screen.',
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
    conflictBoth: 'Both', // memo_conflict_both
    conflictApplyRest: (n) => `Do the same for the remaining ${n}`, // memo_conflict_apply_rest
    conflictDone: 'Finished choosing memos.', // memo_conflict_done
    conflictStopped: "Memos you did not choose keep this device's version.", // memo_conflict_stopped
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
