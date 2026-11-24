<!-- 2026-11-25 -->

## 7.5.2 업데이트가 릴리즈 됐습니다.

- 앱 아이콘을 책과 책갈피 모양으로 변경.
- 책갈피·최근목록·나의밑줄목록·나의메모목록·성경읽기통계 화면을 본문 화면과 같은 모양으로 개편 (본문 배경색·글자색·글자 크기를 따름)
- 나의메모목록에 검색 추가: 입력하는 대로 메모 내용과 성경 위치(책 이름 등)에서 찾아 보여 줌
- 나의밑줄목록이 설정한 밑줄 표시 방식(밑줄·형광펜·글자색)대로 보임
- 성경읽기통계에 진행 막대 표시
- 여러 줄로 쓴 메모가 목록에서 첫 줄만 보이던 문제 수정
- 나의메모목록에서 메뉴 버튼 위치 설정이 적용되지 않던 문제 수정
- 자주 묻는 질문(FAQ)을 앱 업데이트 없이 최신 내용으로 받아 옴
- 음성 낭독 알림 아이콘을 펼친 책 모양으로 변경
- 1단 보기에서 Android 8 이상일 때 오디오 알림이 나오지 않던 문제 수정
- 전체화면보기가 켜져 있으면 '상태바/타이틀바 설정'을 비활성화 (Android 11 이상)
- 2단 역본대조에서 음성 낭독(TTS)이 왼쪽 칸의 다른 역본까지 첫 역본 언어로 읽던 문제 수정: 첫 역본만 읽음
- 자동 스크롤: 새 장에서 움직이기 전 기다리는 시간을 줄임 (화면 위쪽 1/3 대신 음성 낭독이 읽는 절을 두는 높이까지 읽을 시간)
- 자동 스크롤 기본 속도를 분당 30줄로 변경 (이미 쓰던 속도는 그대로)
- 자동 스크롤 중 두 손가락으로 글자 크기를 바꾸면 속도(분당 줄 수)가 바뀐 크기에 맞춰짐

## 7.6.0 버전이 Play Store에서 심사중입니다. (12월 초 출시 예정)

- 메모 기능이 대폭 개선됨
  - 메모책을 생성할 수 있어, 필사, 번역 등의 작업이 가능
  - 메모 입력을 관련 절을 보면서 적을 수 있도록 수정
  - 필사, 번역으로 메모를 사용할 경우, 엔터치면 저장하고 다음 절로 바로 이동할 수 있는 옵션 추가
- "밑줄"을 "형광펜"으로 이름 변경(나의형광펜목록 등).
- 데이터 복구 기능 개선 '합치기' 추가(기본): 지금 데이터는 두고 백업에만 있거나 백업 쪽이 더 나중에 고친 기록을 더함. 내용이 다른 메모는 이 폰·백업·둘 다 중에서 고름. '바꾸기'로 복구해도 백업에 책갈피가 없으면 지금 책갈피는 남김. 아주 오래된 버전(7.4.0 이전)에서 만든 백업도 복구되도록 수정. 더 새 버전 앱에서 만든 백업은 지금 데이터를 지키고 업데이트를 안내. 업데이트 직후 데이터 구조를 바꾸기 전에 자동으로 백업
- 절을 길게 누르면 "본문 오류 신고" 추가: 고른 절과 역본 정보를 넣은 메일이 열리고, 어디가 틀렸는지 적어 보낼 수 있음
- 위젯 설정 화면 정리: 보여 줄 구절(무작위/고른 구절)과 모양을 나눠 보여 주고, 아래에 취소·위젯 만들기 버튼. 고른 구절 없이 만들면 알려 줌. 위젯을 누르면 위젯에 보이는 절의 본문 화면이 바로 열림 (예전에는 책 목록)
- 다른 역본의 장 음성도 mp3 폴더에서 재생: mp3/<역본 코드>/01_1.mp3처럼 넣으면 TTS 대신 그 파일을 재생
- 전자책(e-ink) 기기에서 ≡ 메뉴 창이 열려도 항목이 보이지 않던 문제를 고침: ONYX BOOX 등에서는 메뉴를 움직임 없는 목록으로 띄움. 설정 > 메뉴 설정 > 전자책 메뉴에서 켜고 끌 수 있음
- 최근목록, 책갈피, 최근 본 곳(↻)이 화면 맨 위에 보던 절을 기억하도록 수정 (예전에는 한 화면쯤 아래 절로 열림)
- 2단 역본대조에서 검색 결과·최근목록·책갈피를 누르면 엉뚱한 절로 가던 문제 수정
- 검색 수정: 검색어 없이 책 한 권 검색 시 책 전체가 나오던 문제, "?" 같은 기호로 검색하면 앱이 닫히던 문제
- 빠진 절이 연달아 있는 장에서 그 뒤 절들이 한 칸씩 밀려 보이던 문제 수정
- 성경을 받은 직후 다른성경보기·역본대조보기 목록에 새 역본이 나오지 않던 문제를 고침

## Lifove Bible 그동안의 비하인드 스토리

안녕하세요. Lifove Bible 개발자입니다.

본업이 바빠 거의 10년 동안 앱을 업데이트하지 못했습니다. 그사이 안드로이드 버전이 계속 바뀌었지만, 새 버전을 지원하는 작업을 할 시간이 부족했습니다. 저도 작년에 폰을 바꾼 뒤로는 다른 성경 앱을 사용했고요.

그러다 최근 한 분께서 제 개인 이메일로 연락을 주셨고, 또 직장 동료 분들과 'Lifove'라는 제 삶의 키워드에 대해 이야기를 나누다가 Lifove Bible을 쓰지 못해 아쉬워하시는 분들이 계신다는 이야기를 듣게 되었습니다. 마침 나날이 발전하는 AI의 도움을 받으면 버전 문제를 해결할 수 있지 않을까 싶어 시도해 보았는데, Claude AI가 정말 잘 도와주었습니다. 덕분에 문제를 해결하고, 평소에 제가 쓰고 싶었던 기능들도 추가할 수 있었습니다.

막상 업데이트를 올리려고 보니, 구글 개발자 계정이 정지되어 있었고 앱도 구글 정책에 맞지 않아 2년 가까이 배포가 중단된 상태였습니다. 계정 문제를 해결하고, 드디어 새 버전을 출시하게 되었습니다.

앞으로 사용자분들의 건의 사항을 차근차근 확인하며, 시간이 날 때마다 앱을 업데이트하겠습니다. 건의나 문제는 [GitHub 이슈](https://github.com/lifoveBible/lifovebible/issues) 또는 메뉴의 '불편보고/건의'로 알려 주세요.

제가 bible@lifove.net 이메일은 잘 확인 못할 것 같긴한데, 소통하고 싶으신 분들은 언제든지 연락주십시오.

## 신규 주석/관주 데이터 추가

메뉴(≡) > 설정 및 데이터 관리 > 데이터 관리 > 성경 데이터 다운로드에서 다음 영문 주석 및 관주 데이터를 다운로드 받아 역본대조보기를 통해 함께 읽을 수 있습니다.

- Barnes’ Notes (NT)
- Clarke’s Commentary
- Calvin’s Commentaries
- Treasury of Scripture Knowledge
- Geneva Bible Notes (1599)
- Catena Aurea (Aquinas) (Gospels)
- Robertson’s Word Pictures (NT)

## 추가하고 싶은 성경 역본/주석이 있습니까?

bible@lifove.net 이메일 주소로 추가하고 싶은 역본/주석이 무엇인지 알려주십시오. 저작권 문제가 없는 역본만 요청하셔야 합니다. 이메일 보내실 때 [역본/주석 추가] 제목으로 보내주십시오.

## 성경 데이터 라이선스

Lifove Bible에서 다운로드할 수 있는 성경 역본 중 일부는 공개 라이선스로 배포됩니다. 해당 라이선스에 따라 아래 고지를 함께 표시합니다.

### German(Elberfelder) (독일어)

bibelkommentare.de가 다듬은 엘버펠더 성경입니다. 본문의 낱말과 문장부호는 바꾸지 않았고, 각주와 소제목은 넣지 않았으며, 절 번호는 KJV 기준으로 표시했습니다. 원문 고지는 다음과 같습니다.

Copyright © 2019 Verbreitung des christlichen Glaubens e.V. Dieser Bibeltext ist online verfügbar auf [www.bibelkommentare.de](https://www.bibelkommentare.de).

This translation is made available under the [Creative Commons Attribution-NonCommercial-NoDerivatives 4.0 License (CC BY-NC-ND 4.0)](http://creativecommons.org/licenses/by-nc-nd/4.0/).

### Ilocano(ULB) (일로카노어)

Door43 World Missions Community의 일로카노어 성경 "Ti Biblia"(Unlocked Literal Bible)를 Lifove Bible 형식으로 바꾼 것입니다. 소제목과 문단 구분을 빼고, 각주는 괄호로 넣고, 묶어 번역된 절은 "(→ 장:절)"로 표시하고, 절 번호를 KJV 기준으로 맞췄습니다(요한삼서 1:15 → 1:14, 요한계시록 12:18 → 13:1 앞). 이 변경은 원 저작자가 보증한 것이 아닙니다. 원문 고지는 다음과 같습니다.

This text is an adaptation of “Ti Biblia” (Unlocked Literal Bible in the Ilocano language of the Republic of the Philippines).

Copyright © 2019 Door43 World Missions Community (https://door43.org/), from eBible.org.

This adapted text is licensed under the [Creative Commons Attribution-ShareAlike 4.0 International License (CC BY-SA 4.0)](https://creativecommons.org/licenses/by-sa/4.0/).

### Chichewa(Chalero) (치체와어)

Biblica, Inc.의 현대 치체와어 성경을 Lifove Bible 형식으로 바꾼 것입니다. 소제목과 문단 구분을 빼고(시편 표제는 1절 앞에 둠), 표는 한 줄로 풀고, 절 번호를 KJV 기준으로 맞췄습니다(요한삼서 1:15 → 1:14, 요한계시록 12:18 → 13:1 앞). 이 변경은 Biblica, Inc.가 보증한 것이 아닙니다. 원문 고지는 다음과 같습니다.

This text is an adaptation of “Tsekulani Mawu a Mulungu mu Chichewa Chalero” (Open God’s Word in Contemporary Chichewa).

Copyright © 2002, 2016 by Biblica, Inc.
The original work by Biblica, Inc. is available for free at www.biblica.com and open.bible.

This adapted text is licensed under the [Creative Commons Attribution-ShareAlike 4.0 International License (CC BY-SA 4.0)](https://creativecommons.org/licenses/by-sa/4.0/).
