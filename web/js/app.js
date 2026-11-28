// 읽기 화면: 책·장·절 고르기, 본문, 이전/다음 장, 글자 크기(본문화면설정), 마지막 읽은 곳 기억(2단계),
// 역본 고르기와 대조 보기(3단계), 성경 파일 수동 넣기, 검색(4단계),
// 앱처럼 ☰ 메뉴 → 성경다운로드·성경 파일 넣기. 역본대조보기에서는 받은 것과 넣은 것만 고른다.

import { parseBibleList } from './biblelist.js';
import { LfaFile } from './lfa.js';
import { readChapter } from './chapterLines.js';
import {
  CHAPTERS, OT_COUNT, BOOK_COUNT, bookNames, isValidPosition,
  nextChapter, prevChapter, parseHash, formatHash,
} from './books.js';
import { getLfa, cachedUrls, deleteLfa, pruneLfa, canCache } from './lfaStore.js';
import { registerServiceWorker } from './pwa.js';
import { detectPlatform, isStandalone } from './platform.js';
import {
  alignChapters, toggleCode, groupByLang, isCached, pickableVersions, fallbackVersions, verOrderMap, orderVersions,
  readableColor,
} from './compare.js';
import { pickLang, stringsFor } from './strings.js';
import { PRESETS, validColor, presetOf } from './viewColors.js';
import {
  NAV_OPTIONS, NAV_DEFAULT, navButtons, NAV_UNITS, NAV_UNIT_DEFAULT, NAV_POSITIONS, navPosition,
  loadHistory, jumpHistory, updateHistory, stepHistory, canBack, canForward,
} from './navBar.js';
import { swipeDirection } from './swipe.js';
import { groupFiles, prepareGroup, openRecord, mergeLocal, classifyName, detectLang } from './localBible.js';
import { listLocal, getLocal, putLocal, deleteLocal } from './localStore.js';
import { offerKey, codeKey } from './bibleSync.js';
import { formatChapter, formatVerses, rowsOfSingle } from './verseCopy.js';
import { verseErrorMail } from './report.js';
import { STYLES, normalizeStyle, toggleStyle, styleClasses, cssColorToHex } from './highlightStyle.js';
import { readSet, isRead, readChaptersOf, readStats, percent } from './readCheck.js';
import {
  readChecksOf, versWithReadChecks, setReadCheck, clearReadChecks, highlightsOfChapter, setHighlights,
  allHighlights, deleteHighlight, clearHighlights, addBookmark, allBookmarks, deleteBookmark,
  memosOfChapter, saveMemo, savePickedMemo, deleteMemo, allMemos, clearMemos,
  allMemoBooks, addMemoBook, updateMemoBook, setMemoBookOrder, deleteMemoBook, onDbNotice, allUserData,
  putUserRows, replaceUserRows, allVerSettings,
} from './userStore.js';
import { buildBackup, backupName, openBackup, readBackup, planMerge, planReplace } from './appBackup.js';
import { resolveMemo, PICK_LOCAL, PICK_OTHER, PICK_BOTH } from './mergeRules.js';
import { backupReminder, DAY, SNOOZE_DAYS } from './backupReminder.js';
import { loadSqlJs } from './sqlite.js';
import { setupSync } from './syncUi.js';
import { forgetSyncFiles } from './syncStore.js';
import { browserModel } from './drive.js';
import { suggestPosition, suggestTranslations } from './syncMerge.js';
import { highlightMap, targetsOf, highlightActions, highlightList, highlightsText } from './highlight.js';
import { bookmarkList } from './bookmark.js';
import {
  SPEEDS, nextSpeed, speedLabel, speechLang, speechItems, chapterTitle, pickVoice, cleanForSpeech,
  voiceKey, voicesFor, chosenVoice, voiceLabels, utterLang,
} from './tts.js';
import { memoMap, isBlankMemo, memoList, memoWords, memoMatches, memosText } from './memo.js';
import {
  defaultMemoBookRow, memoBookList, memoBookName, currentMemoBook, movedUids, memoCounts, DEFAULT_MEMO_BOOK,
  MEMO_OPTIONS, memoBookOptions, nextMemoVerse,
} from './memoBook.js';
import {
  THEMES, booksOfRange, normalizeQuery, checkQuery, searchText, readJobs, highlightParts, sortResults,
} from './search.js';

const DATA_ROOT = 'https://lifovebible.github.io/data/';
const PREFS_KEY = 'lifove.reading';
// 받은 biblelist.txt 원문. 오프라인일 때 역본 고르기 창에 쓴다(6KB 남짓)
const LIST_KEY = 'lifove.biblelist';
// 최근목록(이동 버튼 ↶ ↷). 앱은 history.txt에 둔다. 화면 설정(prefs)과 따로 두어 자주 쓰여도 작게
const HISTORY_KEY = 'lifove.history';
// 처음 쓸 때 역본. 앱은 받은 역본 중 첫째를 쓰지만 웹은 받은 것이 없으므로 언어로 정한다
// 처음 열 때 고르는 역본. 일본어는 口語訳, 번체·간체는 和合本, 스페인어는 Reina-Valera 1909, 포르투갈어는 prtaa(앱에는 언어별 기본 역본이 없어 웹에서 정함)
const DEFAULT_VERSION = { ko: 'korhrv', en: 'engkjv', ja: 'jpnjct', zh: 'chuni', 'zh-CN': 'chunisimp', es: 'spnrei', pt: 'prtaa', fr: 'frsegond' };
const FONT_MIN = 14, FONT_MAX = 36, FONT_STEP = 2, FONT_DEFAULT = 18;

const lang = pickLang(navigator.languages || [navigator.language]);
const S = stringsFor(lang);
const NAMES = bookNames(lang);
document.documentElement.lang = lang;

const $ = (id) => document.getElementById(id);
const $status = $('status'), $verses = $('verses');
// 장 이동은 오른쪽 가운데 이동 버튼(‹ ›)과 키보드 ←/→. 바의 ◀ ▶와 본문 끝 이전/다음 장 단추는 앱처럼 없앴다.
// 바에는 앱처럼 책·장·절 단추를 따로 둔다(처음에는 "책 장 ▾" 한 단추였다)
const $ref = $('bookBtn'), $chapterBtn = $('chapterBtn'), $verseBtn = $('verseBtn');
const $main = document.querySelector('main');
const $picker = $('picker'), $pickerTitle = $('pickerTitle');
const $pickerBody = $('pickerBody'), $pickerBack = $('pickerBack');
const $verPicker = $('verPicker'), $verList = $('verList'), $verOk = $('verOk');
const $oneColumn = $('oneColumn');
const $menu = $('menu'), $dlBox = $('dlBox'), $dlList = $('dlList'), $dlGo = $('dlGo');
const $importBox = $('importBox');

// ---- 설정 ----
// 읽는 위치·글자 크기·역본은 화면 설정이라 localStorage에 둔다. 앱의 SharedPreferences에 해당.
// (메모·읽음 기록 같은 사용자 데이터는 5단계에서 IndexedDB로)

function loadPrefs() {
  let p;
  try {
    p = JSON.parse(localStorage.getItem(PREFS_KEY)) || {};
  } catch {
    p = {}; // 저장소를 못 쓰는 브라우저(개인 정보 보호 모드 등)
  }
  // 2단계는 역본 하나(version)만 저장했다. 3단계부터 여러 개(versions, 첫째가 주 역본)
  if (!Array.isArray(p.versions)) p.versions = p.version ? [p.version] : [];
  delete p.version;
  return p;
}

function savePrefs() {
  // 역본을 한 번이라도 골랐으면 처음 쓰는 사람이 아니다(다 지워도 기본 역본을 다시 받지 않게)
  if (prefs.versions.length) prefs.started = true;
  try {
    localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
  } catch { /* 저장 못 해도 읽기는 된다 */ }
}

const prefs = loadPrefs();
// prefs: { pos: {book, chapter}, fontSize, versions: [{code, url, name, lang}], oneColumn, started, barTop,
//          showVerName, fontColor, bgColor, navBar(앱 값 1~8), navUnit('verse'|'page'|'chapter'),
//          navPos('right-middle'|'right-bottom'|'left-middle'|'left-bottom', 웹에만. 기본 오른쪽 아래),
//          swipeChapter(옆으로 밀어 장 넘기기. 없으면 켬), memoShown, memoBook(지금 메모책 uid. 없으면 기본),
//          hlStyle(형광펜 모양 배열, highlightStyle.STYLES), hlColor(형광펜 색), hlTextColor(밑줄·글자 색),
//          posAt(읽던 장을 옮긴 시각, 동기화 device 파일), syncPosSeen·syncVersSeen·syncFilesSeen(이미 물어본 동기화 제안. syncFilesSeen은 역본 파일의 "코드@넣은 시각") }
// started: 역본을 한 번이라도 골랐다. 처음 쓰는 사람에게만 기본 역본을 받아 주려고(syncPrefsVersions).
// 시작할 때 한 번만 보면 첫 방문에서 다 지웠을 때 또 받아 버려서 그때그때 본다

// ---- 상태 ----
let pos = parseHash(location.hash) || (isValidPosition(prefs.pos) ? prefs.pos : { book: 0, chapter: 1 });
let serverList = []; // 서버 역본 목록
let localList = []; // 직접 넣은 역본(내용 없이)
let versionList = []; // 둘을 합친 것. mergeLocal 참고
let cachedSet = new Set(); // 받아 둔 .lfa 주소(refreshCached)
let cacheOk = true; // 받아 둘 수 있는 주소인가(Cache Storage)
// 역본 순서·색(ver_setting, 동기화로 받은 앱 설정): 코드 → { index, color }. 비었으면 웹의 예전 순서(고른 순서, 언어 묶음)
let verOrder = new Map();
let listOld = false; // 서버 목록을 새로 받지 못해 전에 받은 목록을 쓰는 중
const opened = new Map(); // url → LfaFile. 지금 고른 역본만 메모리에 둔다
const opening = new Map(); // url → Promise<LfaFile>. 받는 중(같은 파일을 두 번 받지 않게)
const downloads = new Map(); // url → {name, got, total}. 받는 중 진행률 표시
let renderSeq = 0; // 빠르게 장을 넘길 때 늦게 끝난 옛 결과를 버리려고
let pendingVerse = null; // 검색 결과에서 왔을 때 그린 뒤 보여 줄 절 {book, chapter, verse}
let slideDir = null; // 'next'|'prev'. 이전/다음 장으로 왔으면 그린 뒤 그쪽에서 들어오게(playSlide)
// 화면에 그린 장(복사·공유할 글을 만들 때). rows는 verseCopy.formatVerses 꼴, names는 역본 이름
let shown = { rows: [], names: [] };
const selected = new Set(); // 고른 절 번호. 장을 다시 그리면 비운다
let marks = new Map(); // 지금 장의 형광펜: 역본 코드 → 칠한 절 번호(highlight.highlightMap)
let marksSeq = 0; // 늦게 끝난 옛 장의 형광펜 읽기를 버리려고

function setStatus(text, isError = false) {
  $status.textContent = text;
  $status.classList.toggle('error', isError);
  $status.hidden = !text;
}

// ---- 문구 채우기 ----
// 파이어폭스 119 전에는 el.ariaLabel 속성이 없어서 setAttribute로 넣는다
function label(el, text) {
  el.title = text;
  el.setAttribute('aria-label', text);
}
label($('smaller'), S.textSize + ' ' + S.smaller);
label($('larger'), S.textSize + ' ' + S.larger);
$('fontGroup').setAttribute('aria-label', S.textSize);
$('fontSizeLabel').textContent = S.textSize;
label($ref, S.pickBook);
label($chapterBtn, S.pickChapter);
label($('pickerClose'), S.close);
label($('verClose'), S.close);
$pickerBack.textContent = '◀ ' + S.backToBooks;
label($('menuBtn'), S.menu);
$('menuDownload').textContent = S.download;
$('menuImport').textContent = S.importTitle;
$('menuVersions').textContent = S.pickVersions;
$('menuOneVersion').textContent = S.pickOneVersion;
$('menuSettings').textContent = S.viewerSettings;
$('menuSearch').textContent = S.search;
$('menuHelp').textContent = S.help;
$('helpTitle').textContent = S.help;
label($('helpClose'), S.close);
$('dlTitle').textContent = S.download;
$('dlHint').textContent = S.downloadHint;
label($('dlClose'), S.close);
$('dlCancel').textContent = S.close;
$dlGo.textContent = S.download;
$('importTitle').textContent = S.importTitle;
label($('importClose'), S.close);
$('localTitle').textContent = S.localGroup;
$('localEmpty').textContent = S.noLocal;
$('verDownload').textContent = S.moreVersions;
$('verEmpty').textContent = S.noVersions;
$('emptyDownload').textContent = S.download;
$('oneColumnLabel').textContent = S.oneColumn;
$verOk.textContent = S.ok;
$('importFilesBtn').textContent = S.importFiles;
$('importFolderBtn').textContent = S.importFolder;
$('importHint').textContent = S.importHint;
$('dropText').textContent = S.dropHere;
$('verCancel').textContent = S.cancel;
label($('searchBtn'), S.search);
label($('searchClose'), S.close);
$('searchTitle').textContent = S.search;
$('searchGo').textContent = S.search;
$('searchStop').textContent = S.stop;
$('qA').placeholder = S.keywordA;
$('qB').placeholder = S.keywordB;
label($('qA'), S.keywordA);
label($('qB'), S.keywordB);
label($('searchRange'), S.searchRange);
label($('searchVer'), S.searchVersion);

// ---- 글자 크기 ----
function applyFont() {
  const size = Number.isFinite(prefs.fontSize) ? prefs.fontSize : FONT_DEFAULT;
  document.documentElement.style.setProperty('--verse-size', size + 'px');
  $('smaller').disabled = size <= FONT_MIN;
  $('larger').disabled = size >= FONT_MAX;
  $('fontSizeNow').textContent = size; // 본문화면설정의 글자 크기 칸. 미리보기 글도 --verse-size를 따른다
}

function changeFont(delta) {
  const now = Number.isFinite(prefs.fontSize) ? prefs.fontSize : FONT_DEFAULT;
  prefs.fontSize = Math.min(FONT_MAX, Math.max(FONT_MIN, now + delta));
  savePrefs();
  applyFont();
  queueVerseBtn(); // 글자 크기가 바뀌면 맨 위 절도 바뀔 수 있다
}

// ---- 역본 ----
async function loadVersionList() {
  let text = null, old = false;
  try {
    const res = await fetch(DATA_ROOT + 'biblelist.txt', { cache: 'no-cache' });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    text = await res.text();
    parseBibleList(text); // 깨진 목록은 저장하지 않는다(여기서 예외)
    try { localStorage.setItem(LIST_KEY, text); } catch { /* 없어도 된다 */ }
  } catch (e) {
    // 오프라인이면 전에 받아 둔 목록. 그것도 없으면 고른 역본만(보관본이 있으면 읽을 수 있다)
    try { text = localStorage.getItem(LIST_KEY); } catch { text = null; }
    old = true;
    if (!text && !prefs.versions.length) setStatus(S.listFailed + ': ' + e.message, true);
  }
  let list = [];
  try { list = text ? parseBibleList(text) : []; } catch { list = []; }
  listOld = old;
  // 목록을 못 받았으면 고른 역본 중 서버 것만이라도(보관본이 있으면 읽을 수 있다)
  serverList = list.length ? list : prefs.versions.filter((v) => !v.local);
  // 서버 목록에서 빠진 역본의 받아 둔 파일은 지운다. 새 목록을 받았을 때만(오프라인 목록으로는 지우지 않는다)
  if (!old && list.length) pruneLfa(list.map((v) => v.url)).catch((e) => console.warn('prune failed', e));
  localList = await listLocal();
  await fillLocalLangs(); // 언어 기능 전에 넣은 역본은 처음 한 번 살펴본다
  versionList = mergeLocal(serverList, localList);
  cacheOk = await canCache();
  await refreshCached();
  // 고른 역본을 목록 기준으로 고친다(서버에서 주소·이름이 바뀌었을 수 있다). 목록에서 빠진 것은 뺀다
  syncPrefsVersions();
}

async function refreshCached() {
  cachedSet = await cachedUrls();
}

/**
 * 목록(versionList)이나 받은 것(cachedSet)이 바뀐 뒤 고른 역본을 맞춘다. 없어진 것은 빼고,
 * 다 빠지면 받은 것 중 하나(처음 쓰는 사람이면 기본 역본을 받는다. compare.fallbackVersions)
 */
function syncPrefsVersions() {
  prefs.versions = orderVersions(prefs.versions.map((v) => versionList.find((x) => x.code === v.code)).filter(Boolean), verOrder);
  if (!prefs.versions.length) {
    prefs.versions = fallbackVersions(versionList, cachedSet, cacheOk, DEFAULT_VERSION[lang], !prefs.started);
  }
  savePrefs();
}

/** 넣거나 지운 뒤 목록을 다시 만든다. 지금 보는 역본의 읽을 곳이 바뀌었으면 true(다시 그려야 함) */
async function reloadLocal() {
  localList = await listLocal();
  await fillLocalLangs();
  versionList = mergeLocal(serverList, localList);
  // 같은 코드라도 넣은 파일 ↔ 서버 파일로 url이 바뀐다. 열어 둔 것은 다시 연다(보관본에서 금방 열린다)
  opened.clear();
  const before = prefs.versions.map((v) => v.url).join();
  syncPrefsVersions();
  return before !== prefs.versions.map((v) => v.url).join();
}

/**
 * 언어를 아직 살펴보지 않은 넣은 역본(언어 기능 전에 넣었거나 드라이브에서 언어 없이 받은 것)의 언어를 한 번 정해 저장한다.
 * 모르면 ''로 저장해 다시 살펴보지 않는다. 넣은 시각(addedAt)은 그대로라 동기화가 다시 올리지 않는다
 */
async function fillLocalLangs() {
  for (const l of localList) {
    if (l.lang != null) continue;
    try {
      const rec = await getLocal(l.code);
      if (!rec) continue;
      rec.lang = (await detectLang(rec).catch(() => null)) || '';
      await putLocal(rec);
      l.lang = rec.lang;
    } catch (e) {
      console.warn('language check failed', l.code, e);
    }
  }
}

/** 역본 파일을 연다. 처음이면 받는다(진행률 표시) */
async function openVersion(v) {
  const done = opened.get(v.url);
  if (done) return done;
  let promise = opening.get(v.url);
  if (!promise) {
    const load = v.local
      // 직접 넣은 파일은 다시 받을 수 없다. 브라우저가 지웠으면 다시 넣어 달라고 한다
      ? getLocal(v.code).then((rec) => {
        if (!rec) throw new Error(S.localMissing);
        return openRecord(rec);
      })
      : getLfa(v.url, (got, total) => {
        downloads.set(v.url, { name: v.name, got, total });
        showDownloads();
      }).then((buf) => new LfaFile(buf));
    promise = load.finally(() => {
      opening.delete(v.url);
      downloads.delete(v.url);
    });
    opening.set(v.url, promise);
  }
  const lfa = await promise;
  // 받는 사이 역본 고르기를 바꿨으면 메모리에 남기지 않는다
  if (prefs.versions.some((x) => x.url === v.url)) opened.set(v.url, lfa);
  return lfa;
}

/** 받는 중인 역본들의 진행률. 여러 역본을 처음 고르면 한꺼번에 받는다 */
function showDownloads() {
  if (!downloads.size) return;
  const parts = [...downloads.values()].map(({ name, got, total }) => {
    const amount = total ? `${Math.floor((got / total) * 100)}% (${mb(got)} / ${mb(total)})` : mb(got);
    return downloads.size > 1 ? `${name} ${amount}` : amount;
  });
  setStatus(S.downloading + ' ' + parts.join(' · '));
}

function mb(bytes) {
  return (bytes / 1024 / 1024).toFixed(1) + 'MB';
}

/** 한 역본의 장. 그 장이 없으면 null. 형식이 깨진 줄이 있으면 예외(e.partial에 앞부분) */
async function chapterRows(v, p) {
  const lfa = await openVersion(v);
  const text = await lfa.chapterText(p.book, p.chapter);
  if (text == null) return null; // 장 수가 1189가 아닌 역본이 있다(enggnt, grestg, latvul)
  return readChapter(text, p.book, p.chapter, S.missingVerse);
}

/**
 * 책 장 이름이 칸보다 길면 글자를 조금씩 줄여 다 보이게 한다. 폰 폭(360px)에서 바가 한 줄이라
 * "데살로니가전서 5장"이 30px쯤 모자라다. 줄임표(…)로 자르면 무슨 책인지 알기 어려워서
 */
function fitRef() {
  $ref.style.fontSize = '';
  let size = parseFloat(getComputedStyle($ref).fontSize);
  while ($ref.scrollWidth > $ref.clientWidth && size > 12) {
    size -= 1;
    $ref.style.fontSize = size + 'px';
  }
}
window.addEventListener('resize', fitRef);

// ---- 본문 ----
async function render() {
  const seq = ++renderSeq;
  const slide = slideDir; // 이번 그리기에만 쓴다(뒤로 가기 등 다른 길로 그릴 때는 움직이지 않게)
  slideDir = null;
  clearSelection(); // 다른 장(또는 다른 역본)에서 고른 절이 남지 않게
  shown = { rows: [], names: [], codes: [] };
  marks = new Map();
  memos = new Map();
  const name = NAMES[pos.book];
  $ref.textContent = name;
  $chapterBtn.textContent = pos.chapter; // 앱처럼 숫자만("장"을 붙이면 폰 폭에서 책 이름 칸이 좁아진다)
  fitRef();
  document.title = S.ref(name, pos.chapter) + ' - Lifove Bible';

  // 읽던 곳이 바뀐 시각(동기화 device 파일의 position.at. 다른 기기가 "여기로 갈까요?"를 제안할 때 쓴다)
  if (prefs.pos?.book !== pos.book || prefs.pos?.chapter !== pos.chapter) prefs.posAt = Date.now();
  prefs.pos = pos;
  savePrefs();
  // 장이 바뀌었으면 최근목록의 지금 칸을 고친다(이전/다음 장, 브라우저 뒤로 가기). 앱도 장 이동은 새 칸을 만들지 않는다
  const cur = hist.list[hist.index];
  if (!cur || cur.book !== pos.book || cur.chapter !== pos.chapter) {
    saveHistory(updateHistory(hist, { ...pos, verse: pendingVerse?.verse || 1 }));
  }
  cameToLast = false;
  updateSideNav();
  updateReadCheck();

  const vers = prefs.versions;
  // 받은 역본을 다 지웠으면 성경다운로드로 안내. 목록을 못 받았으면 오류는 이미 보였다
  $('emptyBox').hidden = vers.length > 0 || !versionList.length;
  if (!vers.length) {
    $verses.replaceChildren();
    updateVerseBtn();
    if (versionList.length) setStatus(S.noVersions);
    ttsAfterRender();
    return;
  }
  // 한 역본이 실패해도 나머지는 보이게 따로따로 기다린다
  const results = await Promise.allSettled(vers.map((v) => chapterRows(v, pos)));
  if (seq !== renderSeq) return;

  const errors = [];
  const chapters = results.map((r, i) => {
    if (r.status === 'fulfilled') return r.value;
    errors.push((vers.length > 1 ? vers[i].name + ': ' : '') + r.reason.message);
    return r.reason.partial?.length ? r.reason.partial : null;
  });

  // 여러 단 대조 보기는 본문 폭 제한을 풀고 역본 수만큼 넓힌다(CSS main.wide, --nver)
  const wide = vers.length > 1 && !prefs.oneColumn;
  $main.classList.toggle('wide', wide);
  $main.style.setProperty('--nver', vers.length);
  // 본문 언어를 lang으로 알린다. 일본어·중국어는 CSS가 줄바꿈 규칙을 바꾸고(keep-all이면 쉼표에서만 끊긴다), 글꼴도 맞는 것을 고른다
  if (vers.length === 1 && vers[0].lang) $verses.lang = vers[0].lang;
  else $verses.removeAttribute('lang');
  if (vers.length === 1) {
    $verses.className = '';
    $verses.replaceChildren(...(chapters[0] || []).map(verseItem));
    shown = { rows: rowsOfSingle(chapters[0] || []), names: [vers[0].name], codes: [vers[0].code] };
  } else {
    $verses.className = 'compare ' + (prefs.oneColumn ? 'one' : 'two');
    const names = vers.map((v) => v.name);
    const rows = alignChapters(chapters, S.missingVerse);
    $verses.replaceChildren(...rows.map((r) => compareItem(r, names, vers.map((v) => v.lang))));
    shown = { rows, names, codes: vers.map((v) => v.code) };
  }
  colorVerses();
  loadHighlights();
  loadMemos();
  playSlide(slide);

  if (errors.length) setStatus(S.loadFailed + ': ' + errors.join(', '), true);
  else if (!$verses.childElementCount) setStatus(S.noChapter);
  else setStatus('');
  showPendingVerse();
  ttsAfterRender(); // 맨 위로 스크롤한 뒤에(읽는 절로 스크롤한 것이 덮이지 않게)
  updateVerseBtn(); // 스크롤이 그대로(맨 위)면 scroll 이벤트가 오지 않아서 직접
}

/**
 * 절 단추: 맨 위에 보이는 절과 마지막 절 번호(앱 getVersePositionInfo). 어디까지 읽었고 얼마나 남았는지 보이게.
 * 대조 보기도 한 절이 한 줄(li)이라 줄 수가 절 수다(앱은 단 수로 나눠 셈한다)
 */
function updateVerseBtn() {
  const last = $verses.childElementCount;
  const now = last ? Number(firstVisible()?.id.slice(1)) || 1 : 0;
  $('verseNow').textContent = last ? now : '-';
  $('verseLast').textContent = last ? last : '';
  $verseBtn.disabled = !last;
  label($verseBtn, last ? S.pickVerse + ' (' + S.versePos(now, last) + ')' : S.pickVerse);
}
// 스크롤할 때마다 세지 않고 화면을 그릴 때 한 번만
let verseBtnFrame = 0;
const queueVerseBtn = () => {
  if (!verseBtnFrame) verseBtnFrame = requestAnimationFrame(() => { verseBtnFrame = 0; updateVerseBtn(); });
};
window.addEventListener('scroll', queueVerseBtn, { passive: true });
window.addEventListener('resize', queueVerseBtn);

/**
 * 검색 결과에서 왔으면 그 절로 스크롤하고 잠깐 칠한다(flash). 최근목록에서 왔으면 읽던 절을 맨 위에.
 * 아니면 맨 위로
 */
function showPendingVerse() {
  const p = pendingVerse;
  pendingVerse = null;
  const li = p && p.book === pos.book && p.chapter === pos.chapter ? $('v' + p.verse) : null;
  if (!li) {
    window.scrollTo(0, 0);
    return;
  }
  if (!p.flash) {
    if (p.verse > 1) scrollToTop(li);
    else window.scrollTo(0, 0);
    return;
  }
  // 책갈피는 저장할 때 맨 위 절이었으므로 맨 위로(읽던 자리 그대로). 검색 결과 등은 눈에 띄게 가운데로
  if (p.top) scrollToTop(li);
  else li.scrollIntoView({ block: 'center' });
  li.classList.remove('flash');
  void li.offsetWidth; // 같은 절을 또 눌러도 다시 칠해지게
  li.classList.add('flash');
}

/**
 * 역본별 글자색(ver_setting.text_color, 앱 VerseAdapter의 gVerTextColor). 지정한 역본만 절(대조 보기는 그 칸)에 색을 준다.
 * 칸에 주므로 형광펜의 글자색(.text의 클래스)이 그 위에서 이긴다
 */
function colorVerses() {
  // 지금 배경과 대비가 3:1 미만인 색은 기본 글자색으로(sync-format 4a). 배경은 body(--page-bg)에서 읽는다
  const bg = cssColorToHex(getComputedStyle(document.body).backgroundColor);
  const colors = (shown.codes || []).map((c) => readableColor(verOrder.get(c)?.color, bg) || '');
  if (colors.length === 1) {
    for (const li of $verses.children) li.style.color = colors[0];
    return;
  }
  for (const li of $verses.children) {
    li.querySelectorAll('.cell').forEach((cell, i) => { cell.style.color = colors[i] || ''; });
  }
}

function verseNum(verse) {
  const num = document.createElement('span');
  num.className = 'num';
  num.textContent = verse;
  return num;
}

function verseText(text, missing) {
  const body = document.createElement('span');
  body.className = missing ? 'text missing' : 'text'; // .text: 형광펜을 칠할 곳(paintHighlights)
  body.textContent = text; // 본문은 textContent로만 넣는다(HTML로 해석하지 않음)
  return body;
}

function verseItem(r) {
  const li = document.createElement('li');
  li.id = 'v' + r.verse;
  li.append(verseNum(r.verse), ' ', verseText(r.text, r.missing));
  return li;
}

/**
 * 대조 보기 한 절. 앱처럼 역본마다 이름을 붙인다.
 * 2단이면 역본을 둘씩 나란히(앱의 VerseAdapterTwoParallel), 1단이면 위아래로. 배치는 CSS가 한다
 */
function compareItem(r, names, langs) {
  const li = document.createElement('li');
  li.id = 'v' + r.verse;
  const cells = document.createElement('div');
  cells.className = 'cells';
  // 절 번호는 역본 칸마다 붙인다(사용자 요청). 여러 단에서 오른쪽·아래 칸도 몇 절인지 바로 보이게.
  // 칸 안에서 번호와 본문을 나눠(단일 보기와 같게) 본문이 여러 줄이어도 번호 밑으로 들어가지 않는다
  r.cells.forEach((c, i) => {
    const cell = document.createElement('div');
    cell.className = 'cell';
    if (langs[i]) cell.lang = langs[i];
    const vname = document.createElement('span');
    vname.className = 'vname';
    vname.textContent = names[i];
    const body = document.createElement('span');
    body.append(vname, ' ', verseText(c.text, c.missing));
    cell.append(verseNum(r.verse), ' ', body);
    cells.append(cell);
  });
  li.append(cells);
  return li;
}

// ---- 절 고르기 ----
// 앱처럼 절을 누르면 고름 표시가 되고 다시 누르면 풀린다(여러 절). 앱은 절을 꾹 눌러 메뉴를 띄우지만
// 웹은 꾹 누르기가 글자 고르기·브라우저 메뉴와 겹쳐서, 하나라도 고르면 책·장 바 옆에 동작 바(#selBar)를 보인다.
// 형광펜·메모도 이 바에 붙일 예정
const $selBar = $('selBar');
$('selCopy').textContent = S.copy;
$('selShare').textContent = S.share;
label($('selCopy'), S.copyVerses);
label($('selShare'), S.shareVerses);
label($('selClear'), S.clearSelection);
$('selShare').hidden = typeof navigator.share !== 'function'; // PC 파이어폭스 등은 공유가 없다

$verses.addEventListener('click', (e) => {
  // 끌어서 글자를 고른 뒤 손을 뗀 것이면 절 고르기가 아니다
  if (!window.getSelection()?.isCollapsed) return;
  const li = e.target.closest('#verses > li');
  if (!li) return;
  const verse = Number(li.id.slice(1));
  if (e.target.closest('.memo-star')) { // 숨긴 메모의 ★: 고르지 않고 입력판(앱 메모 아이콘)
    openMemo(verse);
    return;
  }
  if (selected.has(verse)) selected.delete(verse);
  else selected.add(verse);
  li.classList.toggle('selected', selected.has(verse));
  updateSelBar();
});

function updateSelBar() {
  const n = selected.size;
  $selBar.hidden = !n;
  showTtsBtn(); // 절을 고르면 ▶는 '고른 절부터 듣기'

  if (!n) return;
  const can = highlightActions(targetsOf(shown.rows, selected, shown.codes), marks);
  $('selHl').hidden = !can.add;
  $('selHlOff').hidden = !can.remove;
  $('selMemo').hidden = n !== 1; // 메모는 한 절에 하나라 한 절만 골랐을 때
  // 단추가 다 보인 뒤 잰다. 폰 폭에서 단추 글이 긴 언어(스페인어 등)는 "1 versículo"가 "1.."로 잘려서,
  // 다 들어가지 않으면 숫자만 보인다(전체 문구는 title·aria-label로)
  const $count = $('selCount');
  const full = S.selCount(n);
  $count.textContent = full;
  $count.title = full;
  $count.setAttribute('aria-label', full);
  if ($count.scrollWidth > $count.clientWidth) $count.textContent = String(n);
}

function clearSelection() {
  selected.clear();
  for (const li of $verses.querySelectorAll('li.selected')) li.classList.remove('selected');
  updateSelBar();
}

function selectedText() {
  const rows = shown.rows.filter((r) => selected.has(r.verse));
  return formatVerses(NAMES[pos.book], pos.chapter, rows, shown.names);
}

/** 클립보드에 넣는다. navigator.clipboard는 https·localhost에서만 있어서, 없으면 예전 방법(execCommand) */
async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return;
  } catch { /* 아래 예전 방법으로 */ }
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.setAttribute('readonly', '');
  ta.style.position = 'fixed';
  ta.style.opacity = '0';
  document.body.append(ta);
  ta.select();
  const ok = document.execCommand('copy');
  ta.remove();
  if (!ok) throw new Error('copy failed');
}

$('selCopy').addEventListener('click', async () => {
  const text = selectedText();
  if (!text) return;
  try {
    await copyText(text);
    showToast(S.copied); // 앱은 복사한 뒤에도 고른 채로 둔다
  } catch (e) {
    console.warn(e);
    showToast(S.copyFailed);
  }
});
$('selShare').addEventListener('click', async () => {
  const text = selectedText();
  if (!text) return;
  try {
    await navigator.share({ text });
  } catch (e) {
    if (e.name !== 'AbortError') { // 공유 창을 그냥 닫은 것은 알리지 않는다
      console.warn(e);
      showToast(S.shareFailed);
    }
  }
});
$('selClear').addEventListener('click', clearSelection);

// 장 전체 복사·전송(☰ 메뉴). 대조 보기면 보이는 역본 모두
$('menuCopyChapter').textContent = S.copyChapter;
$('menuSendChapter').textContent = S.sendChapter;
$('menuSendChapter').hidden = typeof navigator.share !== 'function';

const chapterText = () => formatChapter(S.ref(NAMES[pos.book], pos.chapter), shown.rows, shown.names);

async function copyChapter() {
  const text = chapterText();
  if (!text) return;
  try {
    await copyText(text);
    showToast(S.copiedChapter);
  } catch (e) {
    console.warn(e);
    showToast(S.copyFailed);
  }
}
async function sendChapter() {
  const text = chapterText();
  if (!text) return;
  try {
    await navigator.share({ text });
  } catch (e) {
    if (e.name !== 'AbortError') {
      console.warn(e);
      showToast(S.shareFailed);
    }
  }
}

// ---- 본문 오류 신고(☰ 메뉴) ----
// 앱 Util.sendVerseErrorReport. 메일 앱을 mailto로 연다. 웹은 메일 앱이 열렸는지 알 수 없어서(PC에 메일 앱이 없으면
// 아무 일도 안 일어난다) 늘 주소 안내를 알림으로 띄운다
$('menuReportError').textContent = S.reportVerseError;

async function reportVerseError() {
  let web = '?';
  try { // 웹 앱 버전 = 서비스 워커 캐시 이름(lifove-app-<VERSION>). 새 버전이 기다리는 중이면 둘
    web = (await caches.keys()).filter((k) => k.startsWith('lifove-app-')).map((k) => k.slice(11)).join(', ') || '?';
  } catch { /* Cache Storage가 없는 주소 */ }
  const vers = prefs.versions.map((v) => v.code + (v.local ? ' (local)' : '')).join(', ');
  const mail = verseErrorMail({
    subject: S.verseErrorSubject,
    ref: S.ref(NAMES[pos.book], pos.chapter),
    guide: S.verseErrorGuide,
    verses: selected.size ? selectedText() : '',
    info: [['Browser', navigator.userAgent], ['Lifove Bible Web version', web], ['Language', lang], ['Bibles', vers]],
  });
  const a = document.createElement('a');
  a.href = mail.url;
  a.click();
  showToast(S.reportMailHint);
}

// ---- 형광펜 ----
// 앱 my_underline. 역본마다 따로 칠한다. 대조 보기에서 칠하면 보이는 역본 모두에(앱은 2단의 두 역본에) 칠한다.
// 칠한 절의 본문(.text)에 .hl을 붙이고, 모양·색은 본문화면설정의 형광펜 묶음(applyView가 뿌리에 클래스)을 CSS가 입힌다
$('selHl').textContent = S.highlight;
$('selHlOff').textContent = S.highlightOff;
label($('selHl'), S.highlightVerses);
label($('selHlOff'), S.removeHighlight);

/** 지금 장의 형광펜을 읽어 칠한다. IndexedDB를 못 쓰면(개인 정보 보호 모드 등) 칠하지 않고 넘어간다 */
async function loadHighlights() {
  const seq = ++marksSeq;
  const at = { book: pos.book, chapter: pos.chapter };
  let map = new Map();
  try {
    map = highlightMap(await highlightsOfChapter(at.book, at.chapter));
  } catch (e) {
    console.warn('highlights unavailable', e);
  }
  if (seq !== marksSeq || at.book !== pos.book || at.chapter !== pos.chapter) return;
  marks = map;
  paintHighlights();
  updateSelBar();
}

/** 절마다 역본 칸(.text, 역본 순서)에 칠한 표시를 맞춘다 */
function paintHighlights() {
  for (const li of $verses.children) {
    const verse = Number(li.id.slice(1));
    li.querySelectorAll('.text').forEach((el, i) => {
      el.classList.toggle('hl', !el.classList.contains('missing') && !!marks.get(shown.codes[i])?.has(verse));
    });
  }
}

async function changeHighlights(on) {
  const targets = targetsOf(shown.rows, selected, shown.codes);
  if (!targets.length) return;
  try {
    await setHighlights(pos.book, pos.chapter, targets, on);
  } catch (e) {
    console.warn(e);
    showToast(S.highlightFailed);
    return;
  }
  // 칠한 뒤 고름을 푼다. 고름 표시에 가려 칠한 색이 잘 보이지 않아서
  clearSelection();
  loadHighlights();
}
$('selHl').addEventListener('click', () => changeHighlights(true));
$('selHlOff').addEventListener('click', () => changeHighlights(false));
// 동작 바 높이를 --sel-h로 알린다(아래쪽 이동 버튼·알림이 가리지 않게). 숨기면 0
new ResizeObserver(([e]) => {
  document.documentElement.style.setProperty('--sel-h',`${Math.ceil(e.borderBoxSize?.[0]?.blockSize ?? e.target.offsetHeight)}px`);
}).observe($selBar);

// ---- 메모 ----
// 앱 my_memo. 지금 메모책의 메모만 보인다. 절 아래에 메모 글을 작게 보인다(앱 directmemo_preferences, 기본 켬).
// 숨기면 본문 앞에 ★만(앱과 같다), ★를 누르면 입력판. 쓰기는 화면 아래에 붙는 입력판(앱 MemoPanel).
// 입력 방식(저장하면 다음 절로 등)은 메모책마다(앱 MemoInput, 메모책 설정). 입력판 제목 줄 아이콘으로 둘을 바로 바꾼다
const $memoPanel = $('memoPanel'), $memoText = $('memoText'), $memoAsk = $('memoAsk');
let memos = new Map(); // 지금 장의 메모: 절 번호 → 글(memo.memoMap)
let memosSeq = 0; // 늦게 끝난 옛 장의 메모 읽기를 버리려고
// 입력판이 가리키는 절 {book, chapter, verse, original(읽어 온 글), exists, ver}. 닫혀 있으면 null.
// 열어 둔 채 다른 장으로 가도 그 절을 그대로 가리킨다(제목에 위치가 보인다. 앱도 저장은 처음 절에 한다)
let memoAt = null;
let memoAskNext = null; // 저장을 묻는 동안 미뤄 둔 일
let memoPinUntil = 0; // 이때까지는 입력판·키보드 높이가 바뀌면 절을 다시 맞춘다(앱 MemoPanel.pin)
let memoAskOnCancel = null; // 저장을 묻다가 취소했을 때 할 일(메모책 바꾸기를 되돌리기)
// 메모책(앱 memo_book). 고른 메모책은 기기마다 다르므로 앱처럼 DB가 아니라 화면 설정(prefs.memoBook)에 둔다
// (DB에 두면 동기화 때 다른 기기의 선택을 덮어쓴다. 앱 MemoBookList.PREF_CURRENT)
let memoBooks = [defaultMemoBookRow()]; // 지운 것 뺀 메모책, 목록 순서(memoBook.memoBookList)
let memoBook = DEFAULT_MEMO_BOOK; // 지금 메모책 uid
let memoBooksReady = null; // 메모책 목록 읽기(처음 한 번은 loadMemos가 기다린다)
let memoWaiters = []; // 어느 장의 메모를 다 읽으면 부를 것들(waitMemos)
$('selMemo').textContent = S.memo;
label($('selMemo'), S.memoVerse);
$('memoSave').textContent = S.save;
$('memoClose').textContent = S.close;
$('memoDel').textContent = S.del;
$('memoAskText').textContent = S.memoSaveChanges;
$('memoAskSave').textContent = S.save;
$('memoAskDiscard').textContent = S.memoDiscard;
$('memoAskCancel').textContent = S.cancel;

const memoShown = () => prefs.memoShown !== false;

/** 메모책 목록을 다시 읽고 지금 메모책을 맞춘다. 고른 메모책이 없어졌으면 기본으로(앱 MemoBookList.current) */
function refreshMemoBooks() {
  memoBooksReady = (async () => {
    let rows = [];
    try {
      rows = await allMemoBooks();
    } catch (e) {
      console.warn('memo books unavailable', e);
    }
    // 기본 메모책 행은 DB를 만들 때 넣지만, 혹시 없어도(앱 백업으로 바꾸기 등) 늘 보이게
    if (!rows.some((r) => r.uid === DEFAULT_MEMO_BOOK && !r.deleted)) rows = [defaultMemoBookRow(), ...rows];
    memoBooks = memoBookList(rows);
    memoBook = currentMemoBook(prefs.memoBook, memoBooks);
    if (prefs.memoBook && prefs.memoBook !== memoBook) {
      delete prefs.memoBook;
      savePrefs();
    }
  })();
  return memoBooksReady;
}

/** 메모책 uid → 보일 이름(이름이 없으면 번역된 기본 이름. 앱 MemoBookList.displayName) */
const memoBookTitle = (uid) => memoBookName(memoBooks.find((b) => b.uid === uid), S.memoBookDefault);

/** 지금 메모책을 바꿔 남긴다(앱 MemoBookList.setCurrent) */
function setMemoBook(uid) {
  memoBook = uid;
  if (uid === DEFAULT_MEMO_BOOK) delete prefs.memoBook;
  else prefs.memoBook = uid;
  savePrefs();
}

/** 지금 장의 메모를 읽어 보인다. IndexedDB를 못 쓰면 보이지 않고 넘어간다 */
async function loadMemos() {
  const seq = ++memosSeq;
  const at = { book: pos.book, chapter: pos.chapter };
  let map = new Map();
  try {
    await (memoBooksReady || refreshMemoBooks());
    map = memoMap(await memosOfChapter(at.book, at.chapter), memoBook);
  } catch (e) {
    console.warn('memos unavailable', e);
  }
  if (seq !== memosSeq || at.book !== pos.book || at.chapter !== pos.chapter) return;
  memos = map;
  paintMemos();
  memoWaiters = memoWaiters.filter((w) => {
    if (w.book !== at.book || w.chapter !== at.chapter) return true;
    w.resolve(true);
    return false;
  });
}

/** 그 장을 그리고 메모까지 읽으면 true. 못 그리면(파일 오류 등) 몇 초 뒤 false */
function waitMemos(book, chapter) {
  return new Promise((resolve) => {
    const w = { book, chapter, resolve };
    memoWaiters.push(w);
    setTimeout(() => {
      memoWaiters = memoWaiters.filter((x) => x !== w);
      resolve(false);
    }, 8000);
  });
}

/**
 * 절마다 메모를 맞춘다. 보이기면 절 끝에 메모 글(.memo), 숨기기면 본문 앞에 ★(.memo-star).
 * 대조 보기는 앱처럼 한 절에 한 번(첫 역본 칸에 ★, 메모 글은 절 맨 아래)
 */
function paintMemos() {
  const shownMode = memoShown();
  for (const li of $verses.children) {
    li.querySelector(':scope > .memo')?.remove();
    li.querySelector('.memo-star')?.remove();
    const verse = Number(li.id.slice(1));
    const text = memos.get(verse);
    if (text == null) continue;
    if (shownMode) {
      const m = document.createElement('div');
      m.className = 'memo';
      m.textContent = text; // 사용자 글도 textContent로만
      li.append(m);
    } else {
      const star = document.createElement('button');
      star.type = 'button';
      star.className = 'memo-star';
      star.textContent = '★';
      label(star, S.memoOpen(S.verseRef(NAMES[pos.book], pos.chapter, verse)));
      // 단일 보기의 li는 번호·본문 두 칸 격자라 칸을 늘리지 않게 본문(.text) 안 맨 앞에 넣는다
      li.querySelector('.text')?.prepend(star, ' ');
    }
  }
}

/** 메모 보이기/숨기기(앱 toggleMemoDisplay). 앱처럼 설정으로 남는다 */
function toggleMemos() {
  prefs.memoShown = !memoShown();
  savePrefs();
  paintMemos();
}

/** 지금 장의 한 절에 대한 입력판을 연다. 키보드가 뜨도록 기다리지 않고 바로(이미 읽어 둔 memos를 쓴다) */
function openMemo(verse) {
  if (memoAt) {
    if (memoAt.book === pos.book && memoAt.chapter === pos.chapter && memoAt.verse === verse) {
      $memoText.focus(); // 같은 절이면 그대로 두고 다시 맞추기만
      pinMemo();
      return;
    }
    closeMemoOrAsk(() => openMemo(verse)); // 다른 절: 쓰던 것부터 정리
    return;
  }
  memoAt = memoTarget(verse, memoBook);
  bindMemoPanel();
}

/**
 * 지금 장의 한 절을 가리키는 입력판 상태(이미 읽어 둔 memos를 쓴다). 입력 방식은 메모책에서 읽는다
 * (연속 입력으로 다음 절에 갈 때도 다시 읽는다. 앱 moveTo → load)
 */
function memoTarget(verse, book) {
  const original = memos.get(verse) ?? '';
  return {
    book: pos.book, chapter: pos.chapter, verse, original, exists: memos.has(verse), ver: prefs.versions[0]?.code || '',
    memoBook: book, // 열 때의 메모책. 저장·삭제는 여기에
    opts: memoBookOptions(memoBooks.find((b) => b.uid === book)),
  };
}

/** memoAt을 입력판에 보인다(처음 열 때와 연속 입력으로 옮길 때. 앱 bind) */
function bindMemoPanel() {
  const original = memoAt.original;
  showMemoTitle();
  showMemoOptions();
  $memoText.value = original;
  $('memoDel').hidden = !memoAt.exists; // 지울 메모가 있을 때만
  $memoPanel.hidden = false;
  $memoText.focus();
  $memoText.setSelectionRange(original.length, original.length); // 이어 쓰기 쉽게 커서를 끝으로
  $memoText.scrollTop = $memoText.scrollHeight;
  pinMemo();
}

// 입력 방식 아이콘(앱 ic_memo_*_on/off를 옮긴 것, 24×24). 차례는 MEMO_OPTIONS. 동그라미는 [cx, cy, r(켜짐), r(꺼짐)]
const OPTION_ICONS = [
  { lines: ['M12,4 L12,19', 'M6,13 L12,19 L18,13'] },
  { lines: ['M3.5,17 C4.5,7 15.5,6 19,14.5', 'M14.5,13 L19,15 L21.5,10.5'], dot: [12, 20.2, 1.8, 1.44] },
  { lines: ['M3,12 L16,12', 'M11,7 L16,12 L11,17', 'M20.5,5 L20.5,19'] },
  { lines: ['M19,5 L19,13 L6,13', 'M10,9 L6,13 L10,17'] },
];

/** 입력 방식 아이콘 SVG. 켜짐은 굵은 선(2.6), 꺼짐은 가는 선(1.5)에 조금 흐리게(앱 optionIcon과 같다) */
function memoOptionIcon(i, on) {
  const NS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('aria-hidden', 'true');
  svg.classList.add('opt-icon');
  if (!on) svg.classList.add('off');
  for (const d of OPTION_ICONS[i].lines) {
    const path = document.createElementNS(NS, 'path');
    path.setAttribute('d', d);
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke', 'currentColor');
    path.setAttribute('stroke-width', on ? '2.6' : '1.5');
    path.setAttribute('stroke-linecap', 'round');
    path.setAttribute('stroke-linejoin', 'round');
    svg.append(path);
  }
  const dot = OPTION_ICONS[i].dot;
  if (dot) {
    const c = document.createElementNS(NS, 'circle');
    c.setAttribute('cx', dot[0]);
    c.setAttribute('cy', dot[1]);
    c.setAttribute('r', on ? dot[2] : dot[3]);
    c.setAttribute('fill', 'currentColor');
    svg.append(c);
  }
  return svg;
}

// 입력판에서 바로 바꾸는 옵션은 둘뿐: 저장하면 다음 절로(0), 엔터를 누르면 저장(3). 건너뛰기·다음 장은 세부 설정이라
// 메모책 고치기 창에서만(앱 PANEL_OPTIONS. 제목 줄이 붐비고 헷갈려서 앱도 줄였다)
const PANEL_OPTIONS = [0, 3];

/** 입력판의 아이콘 모양과 엔터 방식을 지금 옵션에 맞춘다(앱 bindOptions, applyEnter) */
function showMemoOptions() {
  for (const i of PANEL_OPTIONS) {
    const btn = $('memoOpt' + i);
    const on = memoAt.opts[MEMO_OPTIONS[i][0]];
    btn.replaceChildren(memoOptionIcon(i, on));
    btn.setAttribute('aria-pressed', String(on));
    label(btn, S.memoOptions[i]);
  }
  // 엔터 저장이면 폰 키보드의 엔터 자리에 다음(연속 입력)·완료가 오게. 글 칸은 여러 줄 그대로(긴 글은 줄을 넘겨 보인다)
  if (memoAt.opts.enterSaves) $memoText.enterKeyHint = memoAt.opts.continuous ? 'next' : 'done';
  else $memoText.removeAttribute('enterkeyhint');
}

/** 아이콘을 누르면 그 옵션을 바꿔 메모책에 바로 저장하고 "~: 켜짐/꺼짐"을 알린다(앱 toggleOption) */
async function toggleMemoOption(i) {
  const a = memoAt;
  if (!a) return;
  const key = MEMO_OPTIONS[i][0];
  const on = !a.opts[key];
  a.opts = { ...a.opts, [key]: on };
  showMemoOptions();
  showToast(on ? S.memoOptionOn(S.memoOptions[i]) : S.memoOptionOff(S.memoOptions[i]));
  try {
    // 이 입력판의 메모책에. 그 사이 다른 곳에서 지웠으면 저장되지 않고 이 입력판에만 남는다(앱과 같다)
    await updateMemoBook(a.memoBook, null, { [key]: on });
    await refreshMemoBooks();
  } catch (e) {
    console.warn(e);
    showToast(S.memoBookFailed);
  }
}
for (const i of PANEL_OPTIONS) {
  const btn = $('memoOpt' + i);
  // 눌러도 글 칸의 초점(폰 키보드)이 빠지지 않게
  btn.addEventListener('pointerdown', (e) => e.preventDefault());
  btn.addEventListener('click', () => toggleMemoOption(i));
}

const memoChanged = () => !!memoAt && $memoText.value !== memoAt.original;

/**
 * 입력판 제목. 메모책이 둘 이상이면 "참조 · 메모책 ▾"로 보이고 눌러서 바꾼다. 하나뿐이면 참조만
 * (메모책을 쓰지 않는 사람에게 군더더기가 되지 않게. 앱 MemoPanel.bind)
 */
function showMemoTitle() {
  if (!memoAt) return;
  const ref = S.verseRef(NAMES[memoAt.book], memoAt.chapter, memoAt.verse);
  const many = memoBooks.length > 1;
  const t = $('memoTitle');
  t.textContent = many ? `${ref} · ${memoBookTitle(memoAt.memoBook)} ▾` : ref;
  t.disabled = !many;
  t.title = many ? S.memoBookPick : '';
}

function closeMemo() {
  memoAt = null;
  $memoPanel.hidden = true;
  $memoText.blur();
}

/** 바뀐 게 없으면 닫고, 있으면 저장 / 저장 안 함 / 취소를 묻는다. 닫히면 next, 취소하면 onCancel */
function closeMemoOrAsk(next, onCancel) {
  if (!memoChanged()) {
    closeMemo();
    next?.();
    return;
  }
  memoAskNext = next || null;
  memoAskOnCancel = onCancel || null;
  $memoAsk.showModal();
  $('memoAskSave').focus();
}

/** 저장한다. 바뀐 게 없으면 쓰지 않고(updated_at을 괜히 바꾸지 않게) 닫는다. 비웠으면 지운다. 실패하면 false */
async function saveMemoPanel() {
  const a = memoAt;
  if (!a) return true;
  const text = $memoText.value;
  if (text !== a.original && (a.exists || !isBlankMemo(text))) {
    try {
      await saveMemo(a.book, a.chapter, a.verse, text, a.ver, a.memoBook);
    } catch (e) {
      console.warn(e);
      showToast(S.memoFailed);
      return false;
    }
  }
  if (memoAt === a) closeMemo();
  if (a.book === pos.book && a.chapter === pos.chapter) loadMemos();
  return true;
}

/**
 * [저장] 단추, Ctrl+Enter, 엔터 저장. 연속 입력이 켜진 메모책이면 저장한 뒤 입력판을 닫지 않고 다음 절로 옮긴다
 * (앱 saveAndGoOn). 저장을 묻는 창의 [저장](closeMemoOrAsk)은 넘어가지 않는다: 떠나려는 것이므로
 */
async function saveAndGoOn() {
  const a = memoAt;
  if (!a) return;
  const text = $memoText.value;
  const sameChapter = a.book === pos.book && a.chapter === pos.chapter;
  // 바뀐 게 없으면 쓰지 않는다. 연속 입력이면 그냥 다음 절로(필사 중 빈 절을 넘길 때)
  if (text === a.original) {
    if (a.opts.continuous && sameChapter) goToNextVerse(a);
    else closeMemo();
    return;
  }
  // 비운 채 저장(=지우기)이거나 입력판을 연 채 다른 장으로 넘어갔으면 예전처럼 저장하고 닫는다
  if (!a.opts.continuous || isBlankMemo(text) || !sameChapter) {
    await saveMemoPanel();
    return;
  }
  try {
    await saveMemo(a.book, a.chapter, a.verse, text, a.ver, a.memoBook);
  } catch (e) {
    console.warn(e);
    showToast(S.memoFailed);
    return;
  }
  if (memoAt !== a) return;
  // 다시 읽지 않고 본문에 바로 보인다(다음 절을 고를 때 건너뛰기가 이 절을 알게)
  if (a.memoBook === memoBook && a.book === pos.book && a.chapter === pos.chapter) {
    memos.set(a.verse, text);
    paintMemos();
  }
  a.original = text;
  goToNextVerse(a);
}

/** 다음에 쓸 절로 옮긴다. 장 끝이면 옵션에 따라 다음 장으로, 아니면 닫고 알린다(앱 goToNext) */
async function goToNextVerse(a) {
  const filled = a.memoBook === memoBook ? memos : null; // 지금 장의 메모(이 메모책)
  let next = nextMemoVerse(a.verse, $verses.childElementCount, filled, a.opts.skipFilled);
  if (next > 0) {
    moveMemoTo(a, next);
    return;
  }
  const to = nextChapter(pos);
  if (a.opts.nextChapter && to) {
    const loaded = waitMemos(to.book, to.chapter);
    goChapter('next');
    if (await loaded && memoAt === a) {
      next = nextMemoVerse(0, $verses.childElementCount, a.memoBook === memoBook ? memos : null, a.opts.skipFilled);
      if (next > 0) {
        moveMemoTo(a, next);
        return;
      }
    }
  }
  if (memoAt === a) closeMemo();
  showToast(S.memoNoNextVerse);
}

/** 열린 입력판을 그대로 둔 채 지금 장의 다른 절로(닫았다 열면 폰 키보드가 내려갔다 올라와 깜빡인다) */
function moveMemoTo(a, verse) {
  if (memoAt !== a) return;
  memoAt = memoTarget(verse, a.memoBook);
  bindMemoPanel();
}

async function deleteMemoPanel() {
  const a = memoAt;
  if (!a || !confirm(S.memoDeleteConfirm)) return; // 취소하면 입력판으로 돌아간다
  try {
    await deleteMemo(a.book, a.chapter, a.verse, a.memoBook);
  } catch (e) {
    console.warn(e);
    showToast(S.memoFailed);
    return;
  }
  if (memoAt === a) closeMemo();
  if (a.book === pos.book && a.chapter === pos.chapter) loadMemos();
}

$('selMemo').addEventListener('click', () => {
  const verse = [...selected][0];
  if (!verse) return;
  clearSelection(); // 고름 표시가 남으면 입력판 위의 절이 가려 보인다
  openMemo(verse);
});
$('memoSave').addEventListener('click', saveAndGoOn);
$('memoClose').addEventListener('click', () => closeMemoOrAsk());
$('memoDel').addEventListener('click', deleteMemoPanel);
let memoShiftDown = false; // 엔터 저장에서 Shift+엔터는 줄바꿈으로 두려고(폰 키보드는 keydown이 오지 않아 beforeinput에서 본다)
$memoText.addEventListener('keydown', (e) => {
  memoShiftDown = e.shiftKey;
  if (e.key === 'Escape') {
    e.preventDefault();
    closeMemoOrAsk();
  } else if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { // PC: Ctrl+Enter로 저장
    e.preventDefault();
    saveAndGoOn();
  } else if (e.key === 'Enter' && !e.shiftKey && !e.isComposing && memoAt?.opts.enterSaves) {
    // 한글 조합 중 엔터(isComposing)는 글자를 끝내는 것이라 저장으로 치지 않는다
    e.preventDefault();
    saveAndGoOn();
  }
});
$memoText.addEventListener('keyup', (e) => { memoShiftDown = e.shiftKey; });
// 폰 키보드는 엔터를 keydown(229)으로 알려 주지 않는 일이 많아서 줄바꿈을 넣으려는 순간에 막는다.
// 여러 줄을 붙여 넣는 것(insertFromPaste)은 그대로 둔다: 앱도 붙여 넣은 줄바꿈은 남는다
$memoText.addEventListener('beforeinput', (e) => {
  if (!memoAt?.opts.enterSaves || memoShiftDown) return;
  if (e.inputType !== 'insertLineBreak' && e.inputType !== 'insertParagraph') return;
  e.preventDefault();
  saveAndGoOn();
});
$memoText.addEventListener('focus', pinMemo);

$('memoAskSave').addEventListener('click', async () => {
  memoAskOnCancel = null;
  $memoAsk.close();
  const next = memoAskNext;
  memoAskNext = null;
  if (await saveMemoPanel()) next?.();
});
$('memoAskDiscard').addEventListener('click', () => {
  memoAskOnCancel = null;
  $memoAsk.close();
  const next = memoAskNext;
  memoAskNext = null;
  closeMemo();
  next?.();
});
$('memoAskCancel').addEventListener('click', () => $memoAsk.close());
// 취소나 Esc: 미뤄 둔 일은 버리고 계속 쓴다
$memoAsk.addEventListener('close', () => {
  memoAskNext = null;
  const cancel = memoAskOnCancel;
  memoAskOnCancel = null;
  cancel?.();
  if (memoAt) $memoText.focus();
});
// 입력판 제목을 눌러 메모책 바꾸기(앱 MemoPanel.switchBook). 쓰던 것을 정리한 뒤 새 메모책으로 같은 절을 다시 연다.
// 다른 장으로 넘어간 뒤면 그 절이 화면에 없으니 닫기만 한다. 저장을 묻다가 취소하면 메모책도 되돌린다
$('memoTitle').addEventListener('click', () => {
  const a = memoAt;
  if (!a) return;
  pickMemoBook(() => {
    const sameChapter = () => a.book === pos.book && a.chapter === pos.chapter;
    closeMemoOrAsk(async () => {
      await loadMemos();
      if (!memoAt && sameChapter()) openMemo(a.verse);
    }, () => setMemoBook(a.memoBook));
  });
});
// 쓰던 메모가 있는데 탭을 닫거나 다른 주소로 가면 브라우저가 묻게
window.addEventListener('beforeunload', (e) => {
  if (memoChanged()) e.preventDefault();
});

/**
 * 입력판을 열거나 키보드가 오르내리는 동안 잠깐(1.5초) 높이가 바뀔 때마다 절을 입력판 바로 위에 맞춘다.
 * 그 뒤로는 사용자가 앞뒤 절을 보려고 스크롤한 자리를 건드리지 않는다(앱 MemoPanel.watch와 같은 생각)
 */
function pinMemo() {
  memoPinUntil = performance.now() + 1500;
  requestAnimationFrame(revealMemoVerse);
}

/** 입력판의 절이 지금 장에 있으면 보이는 곳(바·동작 바·입력판을 뺀 곳)에 들어오게. 절이 길면 처음을 맞춘다 */
function revealMemoVerse() {
  if (!memoAt || memoAt.book !== pos.book || memoAt.chapter !== pos.chapter) return;
  const li = $('v' + memoAt.verse);
  if (!li) return;
  const area = viewArea();
  const r = li.getBoundingClientRect();
  if (r.bottom > area.bottom) window.scrollBy(0, Math.min(r.bottom - area.bottom + 4, r.top - area.top));
  else if (r.top < area.top) window.scrollBy(0, r.top - area.top);
}

// 입력판 높이를 --memo-h로 알린다(동작 바·이동 버튼·알림을 그 위로, 마지막 절이 가리지 않게). 숨기면 0
new ResizeObserver(([e]) => {
  document.documentElement.style.setProperty('--memo-h', `${Math.ceil(e.borderBoxSize?.[0]?.blockSize ?? e.target.offsetHeight)}px`);
  if (performance.now() < memoPinUntil) requestAnimationFrame(revealMemoVerse);
}).observe($memoPanel);

// 화면 키보드. 안드로이드 크롬은 viewport의 interactive-widget=resizes-content로 화면이 줄어 따로 할 일이 없다.
// 아이폰 사파리는 화면이 줄지 않고 키보드가 아래를 덮어서, 덮인 높이(--kb)만큼 입력판을 올린다
if (window.visualViewport) {
  const vv = window.visualViewport;
  const fitKeyboard = () => {
    const kb = Math.max(0, Math.round(innerHeight - vv.height - vv.offsetTop));
    document.documentElement.style.setProperty('--kb', `${kb}px`);
    document.documentElement.classList.toggle('kb-open', kb > 80); // 키보드가 떴으면 아래쪽 책·장 바는 키보드에 덮이므로 입력판을 키보드에 붙인다
    if (performance.now() < memoPinUntil) requestAnimationFrame(revealMemoVerse);
  };
  vv.addEventListener('resize', fitKeyboard);
  vv.addEventListener('scroll', fitKeyboard);
}

/** 위치를 바꾼다. 주소 뒤 #책:장을 바꾸면 hashchange에서 그린다(뒤로 가기가 되게) */
function go(newPos) {
  if (!newPos) return;
  const hash = formatHash(newPos);
  if (location.hash === hash) render();
  else location.hash = hash;
}

/** 이전/다음 장(‹ › 버튼, ←/→ 키, 위·아래 버튼, 옆으로 밀기). 앱처럼 새 장이 그쪽에서 미끄러져 들어온다 */
function goChapter(dir) {
  const to = dir === 'next' ? nextChapter(pos) : prevChapter(pos);
  if (!to) return;
  slideDir = dir;
  go(to);
}

/** 그린 뒤 본문을 옆에서 들어오게 한다(앱 slide_left_in/slide_right_in). 움직임 줄이기 설정이면 CSS에서 끈다 */
function playSlide(dir) {
  $verses.classList.remove('slide-next', 'slide-prev');
  if (!dir) return;
  void $verses.offsetWidth; // 같은 쪽으로 연달아 넘겨도 다시 움직이게
  $verses.classList.add('slide-' + dir);
}

// ---- 옆으로 밀어 장 넘기기 ----
// 손가락을 뗄 때 한 번만 판정한다(앱과 같게). passive로 받아 세로 스크롤은 건드리지 않는다.
// 손가락을 따라 화면이 끌려오게 하는 방식은 코드가 커지고 세로 스크롤과 부딪혀서 쓰지 않았다.
// 터치만 본다. 마우스 끌기는 글자 선택이고 PC에는 ←/→ 키와 ‹ › 버튼이 있다
let touchStart = null;
$main.addEventListener('touchstart', (e) => {
  // 두 손가락(확대)이면 이번 터치는 장을 넘기지 않는다
  touchStart = e.touches.length === 1 ? { x: e.touches[0].clientX, y: e.touches[0].clientY } : null;
}, { passive: true });
$main.addEventListener('touchcancel', () => { touchStart = null; }, { passive: true });
$main.addEventListener('touchend', (e) => {
  const start = touchStart;
  touchStart = null;
  if (!start || e.touches.length || prefs.swipeChapter === false) return;
  // 길게 눌러 글자를 고르는 중이거나, 화면을 확대해서 옆으로 움직여 보는 중이면 넘기지 않는다
  if (!window.getSelection()?.isCollapsed) return;
  if ((window.visualViewport?.scale ?? 1) > 1.01) return;
  const t = e.changedTouches[0];
  const dir = swipeDirection(start, { x: t.clientX, y: t.clientY }, window.innerWidth);
  if (dir) goChapter(dir);
}, { passive: true });

window.addEventListener('hashchange', () => {
  const p = parseHash(location.hash);
  if (!p) return;
  pos = p;
  render();
});

// ---- 책·장·절 고르기 ----
// 앱처럼 단추마다 따로 연다. 책 → (장이 여럿이면) 장, 장 단추는 지금 책의 장(◀ 책 목록으로 갈 수 있다), 절 단추는 지금 장의 절
function openPicker(show) {
  $picker.showModal();
  show(); // 열린 뒤에 그려야 지금 책·절로 스크롤이 된다
}

/**
 * 가장 긴 낱말이 단추 폭에 안 들어가는 책 단추는 글자를 줄인다(.long).
 * 프랑스어 Deutéronome·Thessaloniciens가 좁은 폰에서 "Deutéronom/e"처럼 글자 중간에 끊겼다.
 * CSS hyphens: auto는 사전이 없는 브라우저(Windows 크롬 등)에서 먹지 않았고, 책 이름에 보이지 않는
 * 하이픈을 넣으면 복사·검색·음성 읽기 글에 섞여 버렸다. 창이 열린 뒤 부르므로 폭을 잴 수 있다.
 * 일본어·중국어는 글자 사이에서 줄이 바뀌는 게 보통이라 그대로 둔다
 */
function fitLongBookNames(buttons) {
  if (lang === 'ja' || lang.startsWith('zh')) return;
  const ctx = document.createElement('canvas').getContext('2d');
  for (const btn of buttons) {
    const cs = getComputedStyle(btn);
    const room = btn.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
    ctx.font = `${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
    const widest = Math.max(...btn.textContent.split(/\s+/).map((w) => ctx.measureText(w).width));
    if (room > 0 && widest > room) btn.classList.add('long');
  }
}

function showBooks() {
  $pickerTitle.textContent = S.pickBook;
  $pickerBack.hidden = true;
  const section = (title, from, to) => {
    const h = document.createElement('h3');
    h.textContent = title;
    const grid = document.createElement('div');
    grid.className = 'grid books';
    for (let b = from; b < to; b++) {
      const btn = document.createElement('button');
      btn.textContent = NAMES[b];
      if (b === pos.book) btn.className = 'current';
      btn.addEventListener('click', () => {
        // 한 장짜리 책(오바댜, 빌레몬서, 요한2·3서, 유다서)은 바로 연다
        if (CHAPTERS[b] === 1) pick({ book: b, chapter: 1 });
        else showChapters(b);
      });
      grid.append(btn);
    }
    return [h, grid];
  };
  $pickerBody.replaceChildren(...section(S.ot, 0, OT_COUNT), ...section(S.nt, OT_COUNT, BOOK_COUNT));
  fitLongBookNames($pickerBody.querySelectorAll('.grid.books button'));
  $pickerBody.scrollTop = 0;
  $pickerBody.querySelector('.current')?.scrollIntoView({ block: 'center' });
}

function showChapters(book) {
  $pickerTitle.textContent = NAMES[book];
  $pickerBack.hidden = false;
  const grid = document.createElement('div');
  grid.className = 'grid chapters';
  for (let c = 1; c <= CHAPTERS[book]; c++) {
    const btn = document.createElement('button');
    btn.textContent = c;
    if (book === pos.book && c === pos.chapter) btn.className = 'current';
    btn.addEventListener('click', () => pick({ book, chapter: c }));
    grid.append(btn);
  }
  $pickerBody.replaceChildren(grid);
  $pickerBody.scrollTop = 0;
  // 고른 역본 모두 읽은 장은 앱(DialogChapterSelectionTable)처럼 체크 색으로
  const codes = prefs.versions.map((v) => v.code);
  loadReadSets(codes).then((sets) => {
    const read = readChaptersOf(sets, codes, book);
    for (const btn of grid.children) {
      if (read.has(Number(btn.textContent))) {
        btn.classList.add('read');
        label(btn, S.ref(NAMES[book], btn.textContent) + ' ✓');
      }
    }
  }).catch((e) => console.warn('read checks unavailable', e));
}

function pick(p) {
  $picker.close();
  jumpTo(p);
}

/** 지금 장의 절 번호. 누르면 그 절을 맨 위로(앱 DialogVerseSelectionTable). 같은 장이라 최근목록은 그대로 */
function showVerses() {
  $pickerTitle.textContent = S.pickVerse;
  $pickerBack.hidden = true;
  const now = firstVisible();
  const grid = document.createElement('div');
  grid.className = 'grid chapters';
  for (const li of $verses.children) {
    const btn = document.createElement('button');
    btn.textContent = li.id.slice(1);
    if (li === now) btn.className = 'current';
    btn.addEventListener('click', () => {
      $picker.close();
      if (li === $verses.firstElementChild) window.scrollTo(0, 0);
      else scrollToTop(li);
      updateVerseBtn();
    });
    grid.append(btn);
  }
  $pickerBody.replaceChildren(grid);
  $pickerBody.scrollTop = 0;
  $pickerBody.querySelector('.current')?.scrollIntoView({ block: 'center' });
}

$ref.addEventListener('click', () => openPicker(showBooks));
$chapterBtn.addEventListener('click', () => openPicker(() => showChapters(pos.book)));
$verseBtn.addEventListener('click', () => openPicker(showVerses));
$pickerBack.addEventListener('click', showBooks);
$('pickerClose').addEventListener('click', () => $picker.close());
// 바깥(배경)을 누르면 닫는다. 대화 상자 안쪽을 누르면 target이 안쪽 요소다
$picker.addEventListener('click', (e) => { if (e.target === $picker) $picker.close(); });

// ---- 읽음 표시 ----
// 앱 VerseList의 read_check: 바의 체크 상자로 지금 장을 읽음으로. 대조 보기면 고른 역본 모두에(앱도 그렇다),
// 모두 읽었을 때만 체크된 채로 보인다. 저장은 IndexedDB(userStore.js), 계산은 readCheck.js.
// 앱의 "자동 읽음 체크"(autoreadcheck_preference, 기본 끔)는 아직 옮기지 않았다
const $readCheck = $('readCheck');
const readSets = new Map(); // 역본 코드 → 읽은 장 모음. 처음 쓸 때 IndexedDB에서 읽어 두고, 고치면 지워서 다시 읽는다
let readSeq = 0; // 장을 빠르게 넘길 때 늦게 끝난 옛 결과로 체크 상자를 바꾸지 않게
label($readCheck, S.readCheck);

async function loadReadSets(codes) {
  await Promise.all(codes.filter((c) => !readSets.has(c)).map(async (c) => {
    readSets.set(c, readSet(await readChecksOf(c)));
  }));
  return readSets;
}

/** 체크 상자를 지금 장·고른 역본에 맞춘다(앱 setReadCheck) */
async function updateReadCheck() {
  const seq = ++readSeq;
  const codes = prefs.versions.map((v) => v.code);
  $readCheck.disabled = !codes.length;
  let read = false;
  try {
    read = isRead(await loadReadSets(codes), codes, pos.book, pos.chapter);
  } catch (e) {
    console.warn('read checks unavailable', e); // IndexedDB를 못 쓰는 브라우저(개인 정보 보호 모드 등)
  }
  if (seq === readSeq) $readCheck.checked = read;
}

$readCheck.addEventListener('change', async () => {
  ++readSeq; // 저장 중에 끝난 다른 updateReadCheck가 체크를 되돌리지 않게
  const codes = prefs.versions.map((v) => v.code);
  const checked = $readCheck.checked;
  try {
    await setReadCheck(codes, pos.book, pos.chapter, checked);
    for (const c of codes) readSets.delete(c);
    if (codes.length > 1) showToast(checked ? S.checkedAllTrans : S.uncheckedAllTrans);
    else showToast(checked ? S.checkedAsRead : S.uncheckedRead);
  } catch (e) {
    console.warn(e);
    showToast(S.readCheckFailed);
  }
  updateReadCheck();
});

// ---- 음성 읽기(TTS) ----
// 앱 VerseList의 오디오(▶ 단추, AudioControlBar, 읽는 절 따라가기, 장 끝에서 다음 장)를 따른다.
// 브라우저 speechSynthesis로 절마다 읽는다(계산은 tts.js). 멈춤은 pause() 대신 cancel()하고 그 조각부터
// 다시 읽는다: 안드로이드 크롬은 pause()가 듣지 않거나 resume() 뒤 소리가 안 나는 일이 있어서
const synth = window.speechSynthesis;
const $ttsBtn = $('ttsBtn'), $ttsBar = $('ttsBar'), $ttsPause = $('ttsPause');
let tts = null; // 읽는 중이면 {items, i, book, chapter, lang, voice, paused}
let ttsGen = 0; // 읽기 차례. 멈추거나 다시 읽으면 올려서 옛 조각의 onend·onerror를 버린다
let ttsGoing = null; // 다음 장으로 넘어가는 중이면 그 위치. 그 장을 그린 뒤 이어 읽는다(ttsAfterRender)
let ttsTouched = 0; // 사용자가 화면을 만진 때. 5초 동안은 읽는 절을 따라가지 않는다(앱 followCurrentVerse)
let ttsVoices = synth ? synth.getVoices() : []; // 크롬은 처음에 비어 있다가 voiceschanged로 온다
let wakeLock = null;
if (synth) synth.addEventListener?.('voiceschanged', () => { ttsVoices = synth.getVoices(); });
const ttsRate = () => (SPEEDS.includes(prefs.ttsRate) ? prefs.ttsRate : 1);

label($('ttsPrev'), S.prev);
label($('ttsNext'), S.next);
label($('ttsStop'), S.ttsStop);

function showTtsBtn() {
  $ttsBtn.hidden = !synth || prefs.ttsButton === false;
  if (tts) {
    $ttsBtn.textContent = speedLabel(ttsRate());
    label($ttsBtn, S.ttsSpeed(speedLabel(ttsRate())));
  } else {
    $ttsBtn.textContent = '▶︎';
    label($ttsBtn, selected.size ? S.ttsPlayVerse : S.ttsPlay);
  }
  $ttsBtn.classList.toggle('from-verse', !tts && selected.size > 0);
  $ttsBar.hidden = !tts;
  if (tts) {
    $ttsPause.textContent = tts.paused ? '▶︎' : '❚❚';
    label($ttsPause, tts.paused ? S.ttsResume : S.ttsPause);
  }
}

/** 지금 장의 읽을 차례. 대조 보기면 첫 역본만(앱과 같다) */
function ttsChapter() {
  const lang = ttsLangNow();
  return { items: speechItems(shown.rows, chapterTitle(lang, pos.book, pos.chapter)), lang, book: pos.book, chapter: pos.chapter };
}

/** 지금 성경(첫 역본)을 읽을 언어 */
function ttsLangNow() {
  const v = prefs.versions[0];
  return speechLang(v?.lang, v?.code, shown.rows.slice(0, 5).map((r) => r.cells?.[0]?.text || ''));
}

function ttsStart() {
  const ch = ttsChapter();
  if (!ch.items.length) return;
  ttsVoices = synth.getVoices(); // 목소리를 새로 설치했는데 voiceschanged가 오지 않는 브라우저도 있어서
  const voice = chosenVoice(ttsVoices, ch.lang, prefs.ttsVoices);
  // 목소리 목록이 왔는데 이 언어가 없으면 앱처럼 '음성 데이터를 설치하시겠습니까?'(목소리 창에서 설치 안내로).
  // 목록이 비어 있으면(아직 안 왔거나 알려 주지 않는 브라우저) lang만 주고 해 본다
  if (ttsVoices.length && !voice) {
    openVoiceBox(true);
    return;
  }
  // 절을 골랐으면 그 절(여럿이면 맨 앞)부터. 앱의 '꾹 누른 절 TTS 듣기'. 장 제목은 건너뛴다
  const from = selected.size ? Math.min(...selected) : 0;
  const i = from ? ch.items.findIndex((it) => it.verse >= from) : 0;
  if (i < 0) return; // 고른 절부터 끝까지 읽을 것이 없다(빠진 절만)
  tts = { ...ch, i, voice, paused: false };
  if (from) clearSelection();
  showTtsBtn();
  ttsWake(true);
  ttsSpeak();
}

function ttsSpeak() {
  const gen = ++ttsGen;
  synth.cancel();
  const it = tts.items[tts.i];
  ttsMark(it.verse);
  const u = new SpeechSynthesisUtterance(it.text);
  u.lang = utterLang(tts.lang, tts.voice); // 고른 목소리의 언어로(안드로이드 크롬은 voice보다 lang을 따름)
  if (tts.voice) u.voice = tts.voice;
  u.rate = ttsRate();
  u.onend = () => { if (gen === ttsGen) ttsAdvance(); };
  u.onerror = (e) => {
    if (gen !== ttsGen || e.error === 'interrupted' || e.error === 'canceled') return;
    console.warn('speech error', e.error);
    showToast(S.ttsFailed);
    ttsStop();
  };
  synth.speak(u);
}

function ttsAdvance() {
  tts.i++;
  if (tts.i < tts.items.length) ttsSpeak();
  else ttsChapterDone();
}

/** 장을 다 읽었다(앱 onCompletion): 설정이면 읽음 표시, 다음 장으로 넘어가 이어 읽는다. 요한계시록 끝이면 멈춤 */
async function ttsChapterDone() {
  const { book, chapter } = tts;
  if (prefs.ttsReadCheck) {
    const codes = prefs.versions.map((v) => v.code);
    try {
      await setReadCheck(codes, book, chapter, true);
      for (const c of codes) readSets.delete(c);
    } catch (e) {
      console.warn(e);
    }
    updateReadCheck();
  }
  if (!tts) return; // 읽음 표시를 저장하는 사이에 멈췄으면
  ttsMove('next');
}

/** 읽으면서 이전/다음 장으로(재생 줄 ‹ ›, 장 끝). 그 장을 그린 뒤 처음부터 읽는다 */
function ttsMove(dir) {
  const to = dir === 'next' ? nextChapter(tts) : prevChapter(tts);
  if (!to) {
    ttsStop();
    return;
  }
  ++ttsGen;
  synth.cancel();
  ttsGoing = to;
  slideDir = dir; // goChapter처럼 새 장이 그쪽에서 들어오게
  go(to);
}

/**
 * 장을 그린 뒤(render 끝). 넘어가던 장이면 이어 읽고, 읽는 중에 사용자가 다른 장으로 옮겼으면 멈춘다
 * (앱 audioReset: 장을 옮기면 재생을 멈춘다). 같은 장을 다시 그렸으면(역본 바꾸기 등) 그 절 강조만 다시
 */
function ttsAfterRender() {
  if (!tts) return;
  const going = ttsGoing;
  ttsGoing = null;
  if (going && going.book === pos.book && going.chapter === pos.chapter) {
    const ch = ttsChapter();
    if (!ch.items.length) { // 이 장이 없는 역본(신약만 있는 역본 등)
      ttsStop();
      return;
    }
    Object.assign(tts, ch, { i: 0, paused: false, voice: chosenVoice(ttsVoices, ch.lang, prefs.ttsVoices) || tts.voice });
    showTtsBtn();
    ttsWake(true);
    ttsSpeak();
  } else if (tts.book === pos.book && tts.chapter === pos.chapter) {
    ttsMark(tts.items[tts.i]?.verse);
  } else {
    ttsStop();
  }
}

function ttsPauseToggle() {
  if (!tts) return;
  tts.paused = !tts.paused;
  if (tts.paused) {
    ++ttsGen;
    synth.cancel();
  } else {
    ttsSpeak(); // 멈춘 조각부터 다시
  }
  ttsWake(!tts.paused);
  showTtsBtn();
}

function ttsStop() {
  ++ttsGen;
  ttsGoing = null;
  if (synth) synth.cancel();
  tts = null;
  ttsMark(null);
  ttsWake(false);
  showTtsBtn();
}

/** 읽는 절을 칠하고, 보이지 않으면 맨 위로 스크롤한다. 장 제목(0)이면 칠하지 않는다 */
function ttsMark(verse) {
  $verses.querySelector('li.tts-now')?.classList.remove('tts-now');
  if (!verse) return;
  const li = $('v' + verse);
  if (!li) return;
  li.classList.add('tts-now');
  if (Date.now() - ttsTouched < 5000) return;
  const r = li.getBoundingClientRect(), area = viewArea();
  if (r.top < area.top || r.bottom > area.bottom) scrollToTop(li);
}

/** 읽는 동안 화면이 꺼지지 않게(꺼지면 브라우저가 읽기를 멈춘다). 지원하지 않거나 거절되면 그냥 둔다 */
async function ttsWake(on) {
  try {
    if (on && !wakeLock && navigator.wakeLock && document.visibilityState === 'visible') {
      wakeLock = await navigator.wakeLock.request('screen');
      wakeLock.addEventListener('release', () => { wakeLock = null; });
    } else if (!on && wakeLock) {
      await wakeLock.release();
      wakeLock = null;
    }
  } catch (e) {
    console.warn('wake lock', e);
  }
}

// 다른 앱에 다녀오면 화면 켜짐을 다시 잡고(보이지 않으면 저절로 풀린다), 브라우저가 읽기를 멈췄으면 그 조각부터 다시
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState !== 'visible' || !tts || tts.paused || ttsGoing) return;
  ttsWake(true);
  if (!synth.speaking && !synth.pending) ttsSpeak();
});
// 본문을 만지거나 굴릴 때만 센다(▶·재생 줄 단추를 누른 것은 빼려고)
const ttsTouch = () => { ttsTouched = Date.now(); };
$main.addEventListener('touchstart', ttsTouch, { passive: true });
window.addEventListener('wheel', ttsTouch, { passive: true });

// 앱처럼 읽지 않을 때는 시작, 읽는 동안에는 속도 바꾸기. 바꾼 속도는 다음에도 쓴다(앱은 멈추면 1.0x로 돌아간다)
$ttsBtn.addEventListener('click', () => {
  if (!tts) {
    ttsStart();
    return;
  }
  prefs.ttsRate = nextSpeed(ttsRate());
  savePrefs();
  showTtsBtn();
  if (!tts.paused && !ttsGoing) ttsSpeak(); // 읽던 조각을 새 속도로 다시
});
$ttsPause.addEventListener('click', ttsPauseToggle);
$('ttsStop').addEventListener('click', ttsStop);
$('ttsPrev').addEventListener('click', () => tts && ttsMove('prev'));
$('ttsNext').addEventListener('click', () => tts && ttsMove('next'));
window.addEventListener('pagehide', () => synth?.cancel()); // 페이지를 떠난 뒤에도 읽지 않게
showTtsBtn();

// ---- 목소리 고르기(앱 Settings.showVoiceList) ----
// 언어별로 voiceURI를 prefs.ttsVoices에 남긴다(앱 saveVoice). 비우면 '폰 기본'(pickVoice가 고름).
// 앱 설정은 앱 백업에 없어서 앱과 주고받지 않는다
const $voiceBox = $('voiceBox'), $voiceList = $('voiceList');
let voicePick = null; // 창이 열려 있으면 {lang, picked: voiceURI|'', missing}
const sampleTexts = new Map(); // 역본 코드 → 창세기 1:1(미리 듣기, 앱 sampleText)
$('voiceTitle').textContent = S.ttsVoice;
$('voiceInstall').textContent = S.ttsOpenSettings;
$('voiceCancel').textContent = S.cancel;
$('voiceOk').textContent = S.ok;

/** 설정 줄과 창에 보일 "현재 성경 언어: 한국어 / 폰 기본"(앱 updateVoiceSummary) */
function voiceSummary(lang) {
  const list = voicesFor(ttsVoices, lang);
  const uri = prefs.ttsVoices?.[voiceKey(lang)];
  const i = list.findIndex((v) => v.voiceURI === uri);
  const name = i < 0 ? S.ttsVoiceDefault : voiceLabels(list, S.ttsVoiceItem, S.ttsVoiceNetwork)[i];
  return S.ttsVoiceSummary(langNameOf()(lang), name);
}

/** @param fromPlay ▶를 눌렀는데 목소리가 없을 때(앱 text_tts_no_language: 설치하시겠습니까?) */
function openVoiceBox(fromPlay = false) {
  const lang = ttsLangNow();
  ttsVoices = synth.getVoices();
  if (tts && !tts.paused) ttsPauseToggle(); // 미리 듣기가 읽던 것을 끊으므로 멈춰 둔다
  const uri = prefs.ttsVoices?.[voiceKey(lang)] || '';
  voicePick = { lang, fromPlay, picked: voicesFor(ttsVoices, lang).some((v) => v.voiceURI === uri) ? uri : '' };
  drawVoiceList();
  $voiceBox.showModal();
}

function drawVoiceList() {
  const { lang, fromPlay, picked } = voicePick;
  const list = voicesFor(ttsVoices, lang);
  const none = !list.length;
  $('voiceNote').textContent = none ? (fromPlay ? S.ttsNoLanguage : S.ttsNoVoice) : voiceSummary(lang);
  $('voiceOk').hidden = none;
  const labels = voiceLabels(list, S.ttsVoiceItem, S.ttsVoiceNetwork);
  const row = (uri, text, voice) => {
    const l = document.createElement('label');
    l.className = 'check';
    const r = document.createElement('input');
    r.type = 'radio';
    r.name = 'voicePick';
    r.checked = uri === voicePick.picked;
    // 다시 눌러도 또 들려주게 change가 아니라 click
    r.addEventListener('click', () => {
      voicePick.picked = uri;
      voiceSample(lang, voice || pickVoice(ttsVoices, lang));
    });
    l.append(r, text);
    return l;
  };
  $voiceList.replaceChildren(...(none ? [] : [row('', S.ttsVoiceDefault, null), ...list.map((v, i) => row(v.voiceURI, labels[i], v))]));
  $voiceList.hidden = none;
  // 고른 목소리가 목록에서 없어졌으면 '폰 기본'으로
  if (picked && !list.some((v) => v.voiceURI === picked)) voicePick.picked = '';
}

/** 미리 듣기: 지금 역본의 창세기 1:1. 못 읽으면 장 제목, 그것도 없으면 언어 이름 */
async function voiceSample(lang, voice) {
  const v = prefs.versions[0];
  let text = v && sampleTexts.get(v.code);
  if (!text) {
    try {
      const rows = await chapterRows(v, { book: 0, chapter: 1 });
      text = cleanForSpeech(rows?.find((r) => !r.missing)?.text);
    } catch (e) {
      console.warn(e);
    }
    text ||= chapterTitle(lang, 0, 1) || langNameOf()(lang);
    if (v) sampleTexts.set(v.code, text);
  }
  if (!$voiceBox.open) return;
  ++ttsGen; // 멈춰 둔 읽기의 옛 조각이 이어지지 않게
  synth.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = utterLang(lang, voice);
  if (voice) u.voice = voice;
  u.rate = ttsRate();
  synth.speak(u);
}

$('voiceOk').addEventListener('click', () => {
  const key = voiceKey(voicePick.lang);
  const saved = { ...prefs.ttsVoices };
  if (voicePick.picked) saved[key] = voicePick.picked;
  else delete saved[key];
  prefs.ttsVoices = saved;
  savePrefs();
  if (tts && voiceKey(tts.lang) === key) tts.voice = chosenVoice(ttsVoices, tts.lang, saved); // 이어 읽을 때부터
  $('setTtsVoiceHint').textContent = voiceSummary(voicePick.lang);
  $voiceBox.close();
});
$('voiceCancel').addEventListener('click', () => $voiceBox.close());
$('voiceInstall').addEventListener('click', () => {
  $voiceBox.close();
  openHelp('helpVoices');
});
$voiceBox.addEventListener('click', (e) => { if (e.target === $voiceBox) $voiceBox.close(); });
// 미리 듣기를 멈춘다. 읽던 것은 창을 열 때 멈춰 두었으므로 재생 줄의 ▶로 이어 듣는다
$voiceBox.addEventListener('close', () => {
  synth.cancel();
  voicePick = null;
});
// 목소리 목록이 늦게 오거나(크롬) 바뀌면 창을 다시 그린다
if (synth) synth.addEventListener?.('voiceschanged', () => { if (voicePick) drawVoiceList(); });

// ---- 책갈피 ----
// 앱 BookmarkStore·HistoryList. 역본과 상관없이 위치(책·장·절)만 남긴다. 추가는 맨 위에 보이는 절(앱 topVerseNumber)
const $bmBox = $('bmBox'), $bmList = $('bmList');
$('menuAddBookmark').textContent = S.addBookmark;
$('menuBookmarks').textContent = S.bookmarks;
$('bmTitle').textContent = S.bookmarks;
label($('bmClose'), S.close);
$('bmEmpty').textContent = S.bmEmpty;

const bmRef = (it) => S.verseRef(NAMES[it.book], it.chapter, it.verse);

async function saveBookmark() {
  const at = here();
  try {
    await addBookmark(at.book, at.chapter, at.verse);
    showToast(S.bookmarkAdded(bmRef({ book: at.book, chapter: at.chapter, verse: at.verse })));
  } catch (e) {
    console.warn(e);
    showToast(S.bookmarkFailed);
  }
}

function bmNote(text, error = false) {
  const note = $('bmNote');
  note.textContent = text;
  note.classList.toggle('error', error);
  note.hidden = !text;
}

function openBookmarks() {
  bmNote('');
  $bmList.replaceChildren();
  $bmBox.showModal();
  drawBookmarks();
}

async function drawBookmarks() {
  let rows = [];
  try {
    rows = await allBookmarks();
  } catch (e) {
    console.warn('bookmarks unavailable', e);
    bmNote(S.bmLoadFailed, true);
  }
  const items = bookmarkList(rows);
  $('bmCount').textContent = items.length;
  $('bmEmpty').hidden = items.length > 0;
  $bmList.replaceChildren(...items.map(bmItem));
}

/** 한 줄: 참조(앱처럼 위치만). 누르면 그 절로, 오른쪽 🗑 */
function bmItem(it) {
  const li = document.createElement('li');
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'go';
  const ref = document.createElement('span');
  ref.className = 'sref';
  ref.textContent = bmRef(it);
  btn.append(ref);
  btn.addEventListener('click', () => {
    $bmBox.close();
    jumpTo({ book: it.book, chapter: it.chapter }, it.verse, true);
  });
  const del = document.createElement('button');
  del.type = 'button';
  del.className = 'icon del';
  del.textContent = '🗑';
  label(del, S.bmDelete(bmRef(it)));
  del.addEventListener('click', async () => {
    // 앱은 꾹 눌러 나오는 메뉴로 지우지만 웹은 단추라 잘못 누르기 쉬워서 묻는다
    if (!confirm(S.bmDeleteConfirm(bmRef(it)))) return;
    try {
      await deleteBookmark(it.book, it.chapter, it.verse);
    } catch (e) {
      console.warn(e);
      bmNote(S.bookmarkFailed, true);
      return;
    }
    drawBookmarks();
  });
  li.append(btn, del);
  return li;
}

$('bmClose').addEventListener('click', () => $bmBox.close());
$bmBox.addEventListener('click', (e) => { if (e.target === $bmBox) $bmBox.close(); });

// ---- 나의형광펜목록 ----
// 앱 UnderlineList. 모든 역본의 형광펜을 한 목록으로. 정렬은 창을 열 때마다 최근목록순(앱도 화면을 새로 열면 최근순)
const $hlBox = $('hlBox'), $hlList = $('hlList'), $hlOrder = $('hlOrder');
let hlItems = [];
$('menuHighlights').textContent = S.myHighlights;
$('hlTitle').textContent = S.myHighlights;
label($('hlClose'), S.close);
$('hlSend').textContent = S.hlSend;
$('hlDeleteAll').textContent = S.deleteAll;
$('hlEmpty').textContent = S.hlEmpty;

function hlNote(text, error = false) {
  const note = $('hlNote');
  note.textContent = text;
  note.classList.toggle('error', error);
  note.hidden = !text;
}

const verName = (code) => versionList.find((v) => v.code === code)?.name || code;
const hlRef = (it) => `${S.verseRef(NAMES[it.book], it.chapter, it.verse)} · ${verName(it.ver)}`;

async function openHighlights() {
  hlNote('');
  // option()은 아래쪽 const라 처음 열 때 채운다(맨 위에서 부르면 아직 없다)
  if (!$hlOrder.options.length) $hlOrder.append(option('recent', S.orderRecent), option('book', S.orderBook));
  $hlOrder.value = 'recent';
  $hlList.replaceChildren();
  $hlBox.showModal();
  drawHighlights();
}

async function drawHighlights() {
  const order = $hlOrder.value;
  let rows = [];
  try {
    rows = await allHighlights();
  } catch (e) {
    console.warn('highlights unavailable', e);
    hlNote(S.hlLoadFailed, true);
  }
  if ($hlOrder.value !== order) return; // 그 사이 정렬을 바꿨다
  hlItems = highlightList(rows, order);
  $('hlCount').textContent = hlItems.length;
  $('hlEmpty').hidden = hlItems.length > 0;
  $('hlSend').disabled = !hlItems.length; // 앱도 없으면 보내기 메뉴를 숨긴다
  $('hlDeleteAll').disabled = !hlItems.length;
  $hlList.replaceChildren(...hlItems.map(hlItem));
}

/** 한 줄: 참조 · 역본, 아래 칠한 본문(앱 RefListAdapter). 오른쪽 🗑 */
function hlItem(it) {
  const li = document.createElement('li');
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'go';
  const ref = document.createElement('span');
  ref.className = 'sref';
  ref.textContent = hlRef(it);
  const body = document.createElement('span');
  body.className = 'htext';
  body.textContent = it.text; // 글자로만(HTML로 해석하지 않음)
  btn.append(ref, body);
  btn.addEventListener('click', () => goHighlight(it));
  const del = document.createElement('button');
  del.type = 'button';
  del.className = 'icon del';
  del.textContent = '🗑';
  label(del, S.hlDelete(S.verseRef(NAMES[it.book], it.chapter, it.verse)));
  del.addEventListener('click', async () => {
    // 앱은 꾹 눌러 삭제(확인 없음)지만 웹은 단추라 잘못 누르기 쉬워서 묻는다
    if (!confirm(S.hlDeleteConfirm(hlRef(it)))) return;
    try {
      await deleteHighlight(it.ver, it.book, it.chapter, it.verse);
    } catch (e) {
      console.warn(e);
      hlNote(S.highlightFailed, true);
      return;
    }
    drawHighlights();
    loadHighlights(); // 지금 장에 있던 것이면 본문에서도 지운다
  });
  li.append(btn, del);
  return li;
}

/**
 * 그 절로 간다. 그 역본을 지금 보고 있으면 그대로, 아니면 앱처럼 그 역본 하나로 바꾼다
 * (앱은 늘 그 역본 하나로 바꾸지만, 대조 보기 중에 보던 역본이면 대조를 풀 까닭이 없어서)
 */
function goHighlight(it) {
  if (!showVersionOf(it.ver)) {
    hlNote(S.noSuchVersion(verName(it.ver)), true);
    return;
  }
  $hlBox.close();
  jumpTo({ book: it.book, chapter: it.chapter }, it.verse);
}

/** 그 역본을 보고 있지 않으면 그 역본 하나로 바꾼다. 역본 목록에 없으면 false(역본이 비었으면 그대로 true) */
function showVersionOf(ver) {
  if (!ver || prefs.versions.some((v) => v.code === ver)) return true;
  const v = versionList.find((x) => x.code === ver);
  if (!v) return false;
  useVersions([v]);
  return true;
}

/** 목록 보내기. 앱은 공유 또는 텍스트 파일로 저장. 웹은 공유가 있으면 공유, 없으면 클립보드(결과는 note로) */
async function sendListText(text, note, copiedMsg) {
  if (typeof navigator.share === 'function') {
    try {
      await navigator.share({ text });
      return;
    } catch (e) {
      if (e.name === 'AbortError') return; // 공유 창을 그냥 닫았다
      console.warn(e);
    }
  }
  try {
    await copyText(text);
    note(copiedMsg);
  } catch (e) {
    console.warn(e);
    note(S.copyFailed, true);
  }
}

$hlOrder.addEventListener('change', drawHighlights);
$('hlSend').addEventListener('click', () => {
  if (hlItems.length) sendListText(highlightsText(hlItems, hlRef), hlNote, S.hlCopiedAll);
});
$('hlDeleteAll').addEventListener('click', async () => {
  if (!hlItems.length || !confirm(S.hlDeleteAllConfirm)) return;
  try {
    await clearHighlights();
  } catch (e) {
    console.warn(e);
    hlNote(S.highlightFailed, true);
    return;
  }
  await drawHighlights();
  hlNote(S.hlDeletedAll);
  loadHighlights();
});
$('hlClose').addEventListener('click', () => $hlBox.close());
$hlBox.addEventListener('click', (e) => { if (e.target === $hlBox) $hlBox.close(); });

// ---- 나의메모목록 ----
// 앱 MemoList. 지금 메모책의 메모를 한 목록으로. 정렬은 창을 열 때마다 책장절순(앱 기본), 검색은 입력하는 대로 거른다
// (앱 MemoFilter: 띄어 쓴 단어가 모두 참조·역본·메모 어딘가에 있으면). 메모는 3줄까지만 보이고 누르면 그 절로
const $mlBox = $('mlBox'), $mlList = $('mlList'), $mlOrder = $('mlOrder'), $mlSearch = $('mlSearch');
const ML_PAGE = 300; // 한 번에 그리는 수. 모든 절에 메모를 쓰면 3만 개가 넘어서(앱 MemoList 주석)
let mlAll = []; // 지금 메모책의 모든 메모(정렬됨). 보내기·전체삭제는 검색과 상관없이 이것(앱과 같다)
let mlShown = []; // 검색으로 걸러진 것
let mlWords = [];
let mlDrawn = 0;
let mlBook = DEFAULT_MEMO_BOOK; // 목록에 보이는 메모책(지우기·전체삭제는 여기에)
$('menuMemoList').textContent = S.myMemos;
label($('mlClose'), S.close);
$mlSearch.placeholder = S.mlSearchHint;
label($mlSearch, S.mlSearchHint);
label($('mlSearchClear'), S.mlSearchClear);
$('mlSend').textContent = S.mlSend;
$('mlDeleteAll').textContent = S.deleteAll;

function mlNote(text, error = false) {
  const note = $('mlNote');
  note.textContent = text;
  note.classList.toggle('error', error);
  note.hidden = !text;
}

const mlPlace = (it) => S.verseRef(NAMES[it.book], it.chapter, it.verse);
const mlRef = (it) => (it.ver ? `${mlPlace(it)} · ${verName(it.ver)}` : mlPlace(it));

function openMemoList() {
  // 입력판에 쓰던 메모가 있으면 먼저 정리한다(목록에서 지운 메모를 입력판이 되살리지 않게)
  if (memoAt) {
    closeMemoOrAsk(openMemoList);
    return;
  }
  mlNote('');
  if (!$mlOrder.options.length) $mlOrder.append(option('book', S.orderBook), option('recent', S.orderRecent));
  $mlOrder.value = 'book';
  $mlSearch.value = ''; // 앱도 화면을 새로 열면 검색어가 없다
  $('mlSearchClear').hidden = true;
  $mlList.replaceChildren();
  $('mlEmpty').hidden = true;
  $('mlCount').textContent = '';
  showMlTitle();
  $mlBox.showModal();
  drawMemoList();
}

/**
 * 메모책이 둘 이상이면 제목 자리에 지금 메모책 이름을 보이고 눌러서 바꾼다. 하나뿐이면 예전 제목 그대로
 * (입력판 제목과 같은 규칙. 앱 MemoList.updateHeader)
 */
function showMlTitle() {
  const many = memoBooks.length > 1;
  const t = $('mlTitle');
  t.textContent = many ? `${memoBookTitle(memoBook)} ▾` : S.myMemoList;
  t.disabled = !many;
  t.title = many ? S.memoBookPick : '';
}

async function drawMemoList() {
  const order = $mlOrder.value;
  await (memoBooksReady || refreshMemoBooks());
  const book = memoBook;
  let rows = [];
  try {
    rows = await allMemos();
  } catch (e) {
    console.warn('memos unavailable', e);
    mlNote(S.memoLoadFailed, true);
  }
  if ($mlOrder.value !== order || memoBook !== book) return; // 그 사이 정렬이나 메모책을 바꿨다
  mlBook = book;
  showMlTitle();
  mlAll = memoList(rows, order, book);
  $('mlSend').disabled = !mlAll.length; // 앱도 없으면 보내기 메뉴를 숨긴다
  $('mlDeleteAll').disabled = !mlAll.length;
  filterMemoList();
}

/** 검색어로 걸러 처음부터 다시 그린다. 개수는 검색 중이면 '찾은 수 / 전체'(앱 updateHeader) */
function filterMemoList() {
  mlWords = memoWords($mlSearch.value);
  mlShown = mlWords.length ? mlAll.filter((it) => memoMatches(`${mlRef(it)}\n${it.text}`, mlWords)) : mlAll;
  $('mlCount').textContent = mlWords.length ? `${mlShown.length} / ${mlAll.length}` : mlAll.length;
  $('mlEmpty').textContent = mlAll.length ? S.mlSearchNone : S.mlEmpty;
  $('mlEmpty').hidden = mlShown.length > 0;
  $mlList.replaceChildren();
  $mlList.scrollTop = 0;
  mlDrawn = 0;
  showMoreMemos();
}

function showMoreMemos() {
  $mlList.querySelector(':scope > .more')?.remove();
  const more = mlShown.slice(mlDrawn, mlDrawn + ML_PAGE);
  $mlList.append(...more.map(mlItem));
  mlDrawn += more.length;
  const left = mlShown.length - mlDrawn;
  if (left > 0) {
    const li = document.createElement('li');
    li.className = 'more';
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = S.more(left);
    btn.addEventListener('click', showMoreMemos);
    li.append(btn);
    $mlList.append(li);
  }
}

/** 찾은 단어를 <mark>로 칠한 글(글자로만 넣는다. HTML로 해석하지 않음) */
function markedText(el, text, words) {
  if (!words.length) {
    el.textContent = text;
    return;
  }
  for (const part of highlightParts(text, words)) {
    if (part.hit) {
      const mark = document.createElement('mark');
      mark.textContent = part.text;
      el.append(mark);
    } else {
      el.append(part.text);
    }
  }
}

/** 한 줄: 참조 · 역본, 아래 메모(3줄까지, 앱 MEMO_MAX_LINES). 오른쪽 🗑 */
function mlItem(it) {
  const li = document.createElement('li');
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'go';
  const ref = document.createElement('span');
  ref.className = 'sref';
  markedText(ref, mlRef(it), mlWords);
  const body = document.createElement('span');
  body.className = 'mtext';
  markedText(body, it.text, mlWords);
  btn.append(ref, body);
  btn.addEventListener('click', () => {
    // 앱처럼 메모를 쓴 역본으로 간다. 그 역본이 없어졌으면 지금 보던 역본에서 그 절로(메모는 절에 붙은 것이라)
    showVersionOf(it.ver);
    $mlBox.close();
    jumpTo({ book: it.book, chapter: it.chapter }, it.verse);
  });
  const del = document.createElement('button');
  del.type = 'button';
  del.className = 'icon del';
  del.textContent = '🗑';
  label(del, S.mlDelete(mlPlace(it)));
  del.addEventListener('click', async () => {
    // 앱은 꾹 눌러 지우는 메뉴가 있지만 동작하지 않는다. 웹은 형광펜 목록처럼 단추로, 잘못 누르기 쉬워서 묻는다
    if (!confirm(S.mlDeleteConfirm(mlPlace(it)))) return;
    try {
      await deleteMemo(it.book, it.chapter, it.verse, mlBook);
    } catch (e) {
      console.warn(e);
      mlNote(S.memoFailed, true);
      return;
    }
    // 다시 읽지 않고 빼기만 한다(그려 둔 자리와 스크롤을 그대로 두려고)
    mlAll = mlAll.filter((x) => x !== it);
    mlShown = mlShown.filter((x) => x !== it);
    mlDrawn--;
    li.remove();
    $('mlCount').textContent = mlWords.length ? `${mlShown.length} / ${mlAll.length}` : mlAll.length;
    $('mlEmpty').textContent = mlAll.length ? S.mlSearchNone : S.mlEmpty;
    $('mlEmpty').hidden = mlShown.length > 0;
    $('mlSend').disabled = !mlAll.length;
    $('mlDeleteAll').disabled = !mlAll.length;
    loadMemos(); // 지금 장에 있던 것이면 본문에서도 지운다
  });
  li.append(btn, del);
  return li;
}

$mlOrder.addEventListener('change', drawMemoList);
$mlSearch.addEventListener('input', () => {
  $('mlSearchClear').hidden = !$mlSearch.value;
  filterMemoList();
});
// 키보드의 검색(Enter): 이미 걸러져 있으니 키보드만 내린다(앱과 같다)
$mlSearch.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    $mlSearch.blur();
  }
});
$('mlSearchClear').addEventListener('click', () => {
  $mlSearch.value = '';
  $('mlSearchClear').hidden = true;
  filterMemoList();
  $mlSearch.focus();
});
// 검색 중이면 Esc(뒤로)는 먼저 검색어를 지운다(앱 onBackPressed)
$mlBox.addEventListener('cancel', (e) => {
  if (!$mlSearch.value) return;
  e.preventDefault();
  $mlSearch.value = '';
  $('mlSearchClear').hidden = true;
  filterMemoList();
});
$('mlSend').addEventListener('click', () => {
  if (mlAll.length) sendListText(memosText(mlAll, mlPlace), mlNote, S.mlCopiedAll);
});
$('mlDeleteAll').addEventListener('click', async () => {
  if (!mlAll.length || !confirm(S.mlDeleteAllConfirm)) return;
  try {
    await clearMemos(mlBook); // 지금 메모책만(앱 deleteAllMemo(memoBook))
  } catch (e) {
    console.warn(e);
    mlNote(S.memoFailed, true);
    return;
  }
  await drawMemoList();
  mlNote(S.mlDeletedAll);
  loadMemos();
});
$('mlClose').addEventListener('click', () => $mlBox.close());
$mlBox.addEventListener('click', (e) => { if (e.target === $mlBox) $mlBox.close(); });

// 목록 제목을 눌러 메모책 바꾸기(앱 MemoList: MemoBookList.pick(this, this::fillList))
$('mlTitle').addEventListener('click', () => pickMemoBook(() => {
  drawMemoList();
  loadMemos();
}));

// ---- 메모책 ----
// 앱 MemoBookList(7.6.0). 고르기(입력판·나의메모목록 제목)와 관리(추가, 이름 고치기, 순서, 삭제).
// 앱은 설정 > 메모 설정 > 메모책에서 관리하는데, 웹은 본문화면설정 아래 "메모" 묶음과 고르기 창의 [메모책 관리]에서.
const $mbPick = $('mbPick'), $mbBox = $('mbBox'), $mbList = $('mbList'), $mbEdit = $('mbEdit'), $mbName = $('mbName');
let mbPicked = null; // 고르기 창에서 다른 메모책을 골랐을 때 할 일
let mbEditing = null; // 고치는 메모책 { row(새로 만들면 null), count }
$('mbPickTitle').textContent = S.memoBooks;
$('mbPickManage').textContent = S.memoBookManage;
$('mbPickCancel').textContent = S.cancel;
$('mbTitle').textContent = S.memoBooks;
label($('mbClose'), S.close);
$('mbEditCancel').textContent = S.cancel;
$('mbEditSave').textContent = S.save;
$('mbEditDel').textContent = S.del;
label($mbName, S.memoBookName);
$('groupMemo').textContent = S.groupMemo;
$('setMemoBooksLabel').textContent = S.memoBooks;
$('setMemoBooksHint').textContent = S.memoBooksHint;

function mbNote(text, error = false) {
  const note = $('mbNote');
  note.textContent = text;
  note.classList.toggle('error', error);
  note.hidden = !text;
}

/** 메모책 고르기(앱 MemoBookList.pick). 다른 것을 고르면 지금 메모책을 바꾸고 onPicked. 같은 것이면 닫기만 */
function pickMemoBook(onPicked) {
  mbPicked = onPicked;
  $('mbPickList').replaceChildren(...memoBooks.map((b) => {
    const l = document.createElement('label');
    l.className = 'check';
    const r = document.createElement('input');
    r.type = 'radio';
    r.name = 'mbPick';
    r.checked = b.uid === memoBook;
    // change는 이미 고른 것을 다시 누르면 오지 않아서 click으로(그때도 닫히게)
    r.addEventListener('click', () => {
      const f = mbPicked;
      mbPicked = null;
      $mbPick.close();
      if (b.uid === memoBook) return;
      setMemoBook(b.uid);
      f?.();
    });
    l.append(r, memoBookTitle(b.uid));
    return l;
  }));
  $mbPick.showModal();
  $mbPick.querySelector('input:checked')?.focus();
}
$('mbPickCancel').addEventListener('click', () => $mbPick.close());
$mbPick.addEventListener('close', () => { mbPicked = null; });
$mbPick.addEventListener('click', (e) => { if (e.target === $mbPick) $mbPick.close(); });
$('mbPickManage').addEventListener('click', () => {
  $mbPick.close();
  openMemoBooks();
});

/** 메모책 관리 창. 입력판에 쓰던 메모가 있으면 먼저 정리한다(그 메모책을 지우거나 이름이 바뀌어도 꼬이지 않게) */
function openMemoBooks() {
  if (memoAt) {
    closeMemoOrAsk(openMemoBooks);
    return;
  }
  mbNote('');
  $mbList.replaceChildren();
  $mbBox.showModal();
  drawMemoBooks();
}

async function drawMemoBooks() {
  await refreshMemoBooks();
  let counts = new Map();
  try {
    counts = memoCounts(await allMemos());
  } catch (e) {
    console.warn('memos unavailable', e);
    mbNote(S.memoLoadFailed, true);
  }
  const add = document.createElement('li');
  const addBtn = document.createElement('button');
  addBtn.type = 'button';
  addBtn.className = 'go add';
  addBtn.textContent = S.memoBookAdd;
  addBtn.addEventListener('click', () => openMemoBookEdit(null, 0));
  add.append(addBtn);
  $mbList.replaceChildren(...memoBooks.map((b, i) => mbItem(b, i, counts.get(b.uid) || 0)), add);
}

/** 한 줄: 이름과 메모 수(누르면 고치기), ↑ ↓, 🗑(기본 메모책은 지울 수 없어 자리만 둔다) */
function mbItem(b, i, count) {
  const name = memoBookTitle(b.uid);
  const li = document.createElement('li');
  const go = document.createElement('button');
  go.type = 'button';
  go.className = 'go';
  const n = document.createElement('span');
  n.className = 'mname';
  n.textContent = name;
  const sum = document.createElement('span');
  sum.className = 'msum';
  sum.textContent = memoBookSummary(b, count);
  go.append(n, sum);
  go.addEventListener('click', () => openMemoBookEdit(b, count));
  const icon = (text, aria, enabled, fn) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'icon';
    btn.textContent = text;
    label(btn, aria);
    btn.disabled = !enabled;
    btn.addEventListener('click', fn);
    return btn;
  };
  li.append(go,
    icon('↑', S.memoBookMoveUp(name), i > 0, () => moveMemoBook(i, -1)),
    icon('↓', S.memoBookMoveDown(name), i < memoBooks.length - 1, () => moveMemoBook(i, 1)),
    icon('🗑', S.memoBookDelete(name), b.uid !== DEFAULT_MEMO_BOOK, () => confirmDeleteMemoBook(b, count)));
  return li;
}

/** 이름 아래 설명: 메모 수와 켜 둔 입력 방식(앱 summaryOf. 건너뛰기·다음 장은 연속 입력이 켜졌을 때만) */
function memoBookSummary(b, count) {
  const o = memoBookOptions(b);
  const parts = [S.memoBookCount(count)];
  if (o.continuous) {
    parts.push(S.memoOptions[0]);
    if (o.skipFilled) parts.push(S.memoOptions[1]);
    if (o.nextChapter) parts.push(S.memoOptions[2]);
  }
  if (o.enterSaves) parts.push(S.memoOptions[3]);
  return parts.join(' · ');
}

/** 메모책이 바뀐 뒤: 관리 창, 본문의 메모, 열려 있는 나의메모목록을 다시 */
async function afterMemoBooksChanged() {
  await drawMemoBooks();
  loadMemos();
  if ($mlBox.open) drawMemoList();
}

async function moveMemoBook(i, dir) {
  const uids = movedUids(memoBooks, i, dir);
  if (!uids) return;
  try {
    await setMemoBookOrder(uids);
  } catch (e) {
    console.warn(e);
    mbNote(S.memoBookFailed, true);
    return;
  }
  await afterMemoBooksChanged();
  // 옮긴 줄의 같은 단추에 초점을 두어 거듭 누를 수 있게(맨 끝에 닿아 꺼졌으면 반대쪽)
  const row = $mbList.children[i + dir];
  const btns = row?.querySelectorAll('.icon');
  if (btns) (btns[dir < 0 ? 0 : 1].disabled ? btns[dir < 0 ? 1 : 0] : btns[dir < 0 ? 0 : 1]).focus();
}

/** 메모책을 지우면 그 메모도 모두 지운 표시가 된다(앱 deleteMemoBook). 그래서 한 번 더 묻는다 */
async function confirmDeleteMemoBook(b, count) {
  const name = memoBookTitle(b.uid);
  if (!confirm(count > 0 ? S.memoBookDeleteConfirm(name, count) : S.memoBookDeleteConfirmEmpty(name))) return false;
  try {
    await deleteMemoBook(b.uid);
  } catch (e) {
    console.warn(e);
    mbNote(S.memoBookFailed, true);
    return false;
  }
  await afterMemoBooksChanged(); // 지운 것이 지금 메모책이었으면 refreshMemoBooks가 기본으로 되돌린다
  return true;
}

/** 추가(row가 null)와 고치기를 같이 하는 창(앱 showEditDialog: 이름과 입력 방식) */
function openMemoBookEdit(row, count) {
  mbEditing = { row, count };
  const isDefault = row?.uid === DEFAULT_MEMO_BOOK;
  $('mbEditTitle').textContent = row ? memoBookTitle(row.uid) : S.memoBookNew;
  $mbName.value = row?.name || '';
  // 기본 메모책은 비워 두면 번역된 기본 이름이 보인다(언어를 바꿔도 따라감). 그래서 힌트로 보여 준다(앱과 같다)
  $mbName.placeholder = isDefault ? S.memoBookDefault : S.memoBookName;
  $('mbEditDel').hidden = !row || isDefault;
  const opts = memoBookOptions(row);
  mbOptInputs.forEach((input, i) => { input.checked = opts[MEMO_OPTIONS[i][0]]; });
  showMbOpts();
  updateMbSave();
  $mbEdit.showModal();
  $mbName.focus();
}

// 입력 방식 체크 4개(앱 showEditDialog). 이름 뒤에 그 옵션의 아이콘, 체크하면 굵게(입력판 제목 줄과 같은 모양)
const mbOptInputs = MEMO_OPTIONS.map((_, i) => {
  const l = document.createElement('label');
  l.className = 'check';
  const input = document.createElement('input');
  input.type = 'checkbox';
  const icon = document.createElement('span');
  icon.className = 'opt-slot';
  l.append(input, S.memoOptions[i], icon);
  $('mbOpts').append(l);
  input.addEventListener('change', showMbOpts);
  return input;
});

/** 아이콘 굵기와, 연속 입력이 꺼졌을 때 건너뛰기·다음 장을 끄기(체크 값은 남겨 다시 켤 때 그대로. 앱과 같다) */
function showMbOpts() {
  const continuous = mbOptInputs[0].checked;
  mbOptInputs.forEach((input, i) => {
    if (i === 1 || i === 2) input.disabled = !continuous;
    input.parentElement.querySelector('.opt-slot').replaceChildren(memoOptionIcon(i, input.checked));
  });
}

/** 고치기 창의 체크 → { continuous, skipFilled, nextChapter, enterSaves } */
const mbOptValues = () => Object.fromEntries(MEMO_OPTIONS.map(([k], i) => [k, mbOptInputs[i].checked]));

/** 만든 메모책은 이름이 있어야 저장된다: 이름 없는 메모책 여럿은 목록에서 구별할 수 없다(앱과 같다) */
function updateMbSave() {
  const isDefault = mbEditing?.row?.uid === DEFAULT_MEMO_BOOK;
  $('mbEditSave').disabled = !isDefault && !$mbName.value.trim();
}

$mbName.addEventListener('input', updateMbSave);
// 엔터로도 저장(폼 제출). 저장 단추가 꺼져 있으면 브라우저가 제출하지 않는다
$('mbEditForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const ed = mbEditing;
  if (!ed || $('mbEditSave').disabled) return;
  const name = $mbName.value.trim();
  const opts = mbOptValues();
  $mbEdit.close();
  try {
    if (ed.row) await updateMemoBook(ed.row.uid, name, opts);
    else await addMemoBook(name, opts);
  } catch (err) {
    console.warn(err);
    mbNote(S.memoBookFailed, true);
    return;
  }
  await afterMemoBooksChanged();
});
$('mbEditCancel').addEventListener('click', () => $mbEdit.close());
$('mbEditDel').addEventListener('click', async () => {
  const ed = mbEditing;
  if (!ed?.row) return;
  $mbEdit.close();
  await confirmDeleteMemoBook(ed.row, ed.count);
});
$mbEdit.addEventListener('close', () => { mbEditing = null; });
$('mbClose').addEventListener('click', () => $mbBox.close());
$mbBox.addEventListener('click', (e) => { if (e.target === $mbBox) $mbBox.close(); });
$('setMemoBooks').addEventListener('click', openMemoBooks);
// 구글 드라이브 동기화(설정 맨 아래 > 동기화, syncUi.js). syncApi.changed(): 넣은 역본이 바뀌었다(파일째 올리려고)
const syncApi = setupSync($, S, {
  deviceInfo: syncDeviceInfo, askConflicts: askSyncConflicts, changed: () => reloadUserData(), suggest: syncSuggest,
  when: (at) => new Date(at).toLocaleString(lang, { dateStyle: 'medium', timeStyle: 'short' }),
  serverCodes: () => serverList.map((v) => v.code),
  ask: (text, yes, no) => askSync(text, yes, no),
  suggestBibles: syncSuggestBibles,
  downloadBibles: (list, fetchOne) => downloadBibles(list, fetchOne),
  hasBible: (code) => localList.some((l) => codeKey(l.code) === codeKey(code)),
  // 동기화를 마쳤으면 '오래 백업 안 함' 알림은 필요 없다(기록이 드라이브에도 있다). 새 버전·DB 막힘 알림은 그대로
  synced: () => { if (updateBarKind === 'backup') hideUpdateBar(); },
});

// ---- 성경읽기통계 ----
// 앱 ReadCheckTable: 역본 하나를 골라 전체·구약·신약과 66권의 읽은 장 수·퍼센트·막대. 앱처럼 받아 둔 역본에서 고르고,
// 지운 역본이라도 읽음 기록이 남아 있으면 목록에 넣는다(기록은 역본 파일과 따로 남으므로). 책을 누르면 그 책의 장 고르기
const $statsBox = $('statsBox'), $statsVer = $('statsVer'), $statsList = $('statsList');
$('menuStats').textContent = S.readStats;
$('statsTitle').textContent = S.readStats;
label($('statsClose'), S.close);
label($statsVer, S.version);
$('statsDone').textContent = S.close;
$('statsReset').textContent = S.statsReset;

async function openStats() {
  $('statsNote').hidden = true;
  $statsVer.replaceChildren();
  $statsList.replaceChildren();
  $statsBox.showModal();
  await refreshCached();
  let withData = [];
  try {
    withData = await versWithReadChecks();
  } catch (e) {
    console.warn('read checks unavailable', e);
  }
  const list = pickableVersions(versionList, cachedSet, prefs.versions.map((v) => v.code), cacheOk);
  for (const code of withData) {
    if (!list.some((v) => v.code === code)) list.push(versionList.find((v) => v.code === code) || { code, name: code });
  }
  $statsVer.replaceChildren(...list.map((v) => option(v.code, v.name)));
  $statsVer.value = prefs.versions[0]?.code || list[0]?.code || '';
  $statsVer.disabled = !list.length;
  drawStats();
}

async function drawStats() {
  const code = $statsVer.value;
  $('statsReset').disabled = !code;
  let set = new Set();
  if (code) {
    try {
      set = (await loadReadSets([code])).get(code);
    } catch (e) {
      console.warn('read checks unavailable', e);
    }
    if ($statsVer.value !== code) return; // 그 사이 다른 역본을 골랐다
  }
  const st = readStats(set);
  $('statsAll').textContent = percent(st.all.read, st.all.total) + '%';
  $statsList.replaceChildren(
    statRow(S.statsTotal, st.all), statRow(S.ot, st.ot), statRow(S.nt, st.nt),
    ...st.books.map((b, i) => statRow(NAMES[i], b, i)),
  );
}

/** 한 줄: 이름과 "읽은 장 / 전체 · %" + 막대(앱 read_check_table_item). 다 읽으면 읽음 색, 읽는 중이면 읽는 중 색 */
function statRow(name, { read, total }, book) {
  const li = document.createElement('li');
  const row = document.createElement(book === undefined ? 'div' : 'button');
  row.className = book === undefined ? 'stat summary' : 'stat';
  const top = document.createElement('span');
  top.className = 'stat-top';
  const n = document.createElement('span');
  n.className = 'stat-name';
  n.textContent = name;
  const v = document.createElement('span');
  v.className = 'stat-value';
  v.textContent = S.statsValue(read, total, percent(read, total));
  top.append(n, v);
  const bar = document.createElement('span');
  bar.className = 'stat-bar';
  const fill = document.createElement('span');
  fill.className = read >= total && total > 0 ? 'done' : '';
  fill.style.width = (total ? (read / total) * 100 : 0) + '%';
  bar.append(fill);
  row.append(top, bar);
  if (book !== undefined) {
    row.addEventListener('click', () => {
      $statsBox.close();
      openPicker(() => showChapters(book));
    });
  }
  li.append(row);
  return li;
}

$statsVer.addEventListener('change', () => {
  $('statsNote').hidden = true;
  drawStats();
});
$('statsReset').addEventListener('click', async () => {
  const code = $statsVer.value;
  if (!code || !confirm(S.statsResetConfirm($statsVer.selectedOptions[0]?.textContent || code))) return;
  const note = $('statsNote');
  try {
    await clearReadChecks(code);
    readSets.delete(code);
    note.textContent = S.statsResetDone;
    note.classList.remove('error');
  } catch (e) {
    console.warn(e);
    note.textContent = S.readCheckFailed;
    note.classList.add('error');
  }
  note.hidden = false;
  drawStats();
  updateReadCheck();
});
$('statsClose').addEventListener('click', () => $statsBox.close());
$('statsDone').addEventListener('click', () => $statsBox.close());
$statsBox.addEventListener('click', (e) => { if (e.target === $statsBox) $statsBox.close(); });

// ---- 본문화면설정 ----
// 앱 설정의 "본문화면설정"(화면 구성, 색) 중 웹에 맞는 것. 앱처럼 바꾸면 바로 적용하고 저장한다.
// - 책·장 바를 아래에 표시(header_bottom_preference, 새로 설치하면 켜짐): 아래가 기본. 2단계부터 위쪽이었지만
//   앱과 같게 모두 아래로 시작한다(barTop이 true일 때만 위). 처음에는 메뉴에 바로 두었다가 앱처럼 여기로 옮겼다
// - 역본대조를 1단으로 보기: 역본대조보기 창의 체크와 같은 값
// - 역본명 보이기: 앱의 "여백 및 역본명 제거"(기본 켜짐)의 반대. 그래서 기본은 숨김
// - 글자색·배경색: 본문 화면만(바·창은 테마 색). 고르지 않았으면 테마(밝게/어둡게)를 따른다
const root = document.documentElement;

function applyView() {
  root.classList.toggle('bar-top', !!prefs.barTop);
  root.classList.toggle('show-vname', !!prefs.showVerName);
  const fg = validColor(prefs.fontColor), bg = validColor(prefs.bgColor);
  if (fg) root.style.setProperty('--page-fg', fg); else root.style.removeProperty('--page-fg');
  if (bg) root.style.setProperty('--page-bg', bg); else root.style.removeProperty('--page-bg');
  // 형광펜 모양·색. 고르지 않은 색은 CSS가 바탕색에 맞춰 섞는다(css "형광펜")
  for (const [cls, on] of styleClasses(prefs.hlStyle)) root.classList.toggle(cls, on);
  const hb = validColor(prefs.hlColor), hf = validColor(prefs.hlTextColor);
  if (hb) root.style.setProperty('--hl-bg', hb); else root.style.removeProperty('--hl-bg');
  if (hf) root.style.setProperty('--hl-fg', hf); else root.style.removeProperty('--hl-fg');
  colorVerses(); // 배경이 바뀌면 역본 글자색이 읽히는지 다시 본다
}
applyView();
// 배경을 고르지 않았으면 테마(밝게/어둡게)를 따르므로, 기기 테마가 바뀔 때도 다시 본다
matchMedia('(prefers-color-scheme: dark)').addEventListener('change', colorVerses);

$('settingsTitle').textContent = S.viewerSettings;
label($('settingsClose'), S.close);
$('groupScreen').textContent = S.groupScreen;
$('groupColors').textContent = S.groupColors;
$('setBarBottomLabel').textContent = S.barBottom;
$('setOneColumnLabel').textContent = S.oneColumn;
$('setOneColumnHint').textContent = S.oneColumnHint;
$('setVerNameLabel').textContent = S.showVerName;
$('setVerNameHint').textContent = S.showVerNameHint;
$('fontColorLabel').textContent = S.fontColor;
$('bgColorLabel').textContent = S.bgColor;
$('colorSample').textContent = S.colorSample;
$('colorReset').textContent = S.colorReset;
$('colorPresets').replaceChildren(...PRESETS.map((p) => {
  const b = document.createElement('button');
  b.dataset.key = p.key;
  b.textContent = S.colorPresets[p.key];
  b.style.color = p.fg; // 단추 자체가 그 색의 견본
  b.style.background = p.bg;
  b.addEventListener('click', () => setColors(p.fg, p.bg));
  return b;
}));

// 형광펜 설정. 앱은 고르지 않은 채 끄려 하면 알림(Toast)이지만 웹 창은 알림을 가리므로 묶음 안에 문구로
$('groupHighlight').textContent = S.groupHighlight;
$('hlStyleLabel').textContent = S.hlStyle;
$('hlStyleHint').textContent = S.hlStyleHint;
$('hlColorLabel').textContent = S.hlColor;
$('hlTextColorLabel').textContent = S.hlTextColor;
$('hlNeedOne').textContent = S.hlNeedOne;
$('hlSample').textContent = S.colorSample;
$('hlReset').textContent = S.colorReset;
$('hlStyles').replaceChildren(...STYLES.map((key, i) => {
  const l = document.createElement('label');
  l.className = 'setting';
  const c = document.createElement('input');
  c.type = 'checkbox';
  c.dataset.key = key;
  c.addEventListener('change', () => {
    const { style, refused } = toggleStyle(prefs.hlStyle, key, c.checked);
    $('hlNeedOne').hidden = !refused;
    prefs.hlStyle = style;
    savePrefs();
    applyView();
    showHighlightInputs();
  });
  const t = document.createElement('span');
  t.textContent = S.hlStyles[i];
  l.append(c, ' ', t);
  return l;
}));

/** 체크와 색 칸. 고르지 않은 색은 견본에 지금 보이는 색(CSS가 섞은 색)을 읽어 넣는다 */
function showHighlightInputs() {
  const style = normalizeStyle(prefs.hlStyle);
  for (const c of $('hlStyles').querySelectorAll('input')) c.checked = style.includes(c.dataset.key);
  // 모양을 꺼 둔 색도 고를 수 있게, 잠깐 모든 모양을 켠 견본에서 읽는다
  const sample = $('hlSample');
  const off = STYLES.filter((k) => !style.includes(k)).map((k) => `hl-${k}`);
  root.classList.add(...off);
  const cs = getComputedStyle(sample);
  const bgNow = cssColorToHex(cs.backgroundColor), fgNow = cssColorToHex(cs.color);
  root.classList.remove(...off);
  $('hlColor').value = validColor(prefs.hlColor) || bgNow || '#ffe066';
  $('hlTextColor').value = validColor(prefs.hlTextColor) || fgNow || '#ebc83d';
}

$('hlColor').addEventListener('input', (e) => {
  prefs.hlColor = e.target.value;
  savePrefs();
  applyView();
});
$('hlTextColor').addEventListener('input', (e) => {
  prefs.hlTextColor = e.target.value;
  savePrefs();
  applyView();
});
$('hlReset').addEventListener('click', () => {
  delete prefs.hlColor;
  delete prefs.hlTextColor;
  savePrefs();
  applyView();
  showHighlightInputs();
});

function openSettings() {
  $('hlNeedOne').hidden = true;
  $('setBarBottom').checked = !prefs.barTop;
  $('setOneColumn').checked = !!prefs.oneColumn;
  $('setVerName').checked = !!prefs.showVerName;
  $('setNavBar').value = String(NAV_OPTIONS.includes(prefs.navBar) ? prefs.navBar : NAV_DEFAULT);
  $('setNavUnit').value = NAV_UNITS.includes(prefs.navUnit) ? prefs.navUnit : NAV_UNIT_DEFAULT;
  $('setNavPos').value = navPosition(prefs.navPos);
  $('setSwipe').checked = prefs.swipeChapter !== false;
  $('setTtsBtn').checked = prefs.ttsButton !== false;
  $('setTtsRead').checked = !!prefs.ttsReadCheck;
  if (synth) $('setTtsVoiceHint').textContent = voiceSummary(ttsLangNow());
  showColorInputs();
  $('settingsBox').showModal();
}

/** 색 칸에는 지금 보이는 색(고르지 않았으면 테마 색)을 넣는다. <input type="color">는 #rrggbb만 받는다 */
function showColorInputs() {
  const cs = getComputedStyle(root);
  const now = (name, saved) => validColor(saved) || toHex(cs.getPropertyValue(name)) || '#000000';
  $('fontColor').value = now('--fg', prefs.fontColor);
  $('bgColor').value = now('--bg', prefs.bgColor);
  const cur = presetOf(prefs.fontColor, prefs.bgColor);
  for (const b of $('colorPresets').children) b.classList.toggle('current', b.dataset.key === cur);
  showHighlightInputs(); // 형광펜 기본 색은 배경·글자색에 섞으므로 함께 바뀐다
}

/** CSS 변수에 쓴 #fff 같은 값을 #ffffff로 */
function toHex(v) {
  const m = v.trim().match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (!m) return null;
  const h = m[1].length === 3 ? [...m[1]].map((c) => c + c).join('') : m[1];
  return '#' + h.toLowerCase();
}

function setColors(fg, bg) {
  prefs.fontColor = fg;
  prefs.bgColor = bg;
  savePrefs();
  applyView();
  showColorInputs();
}

$('setBarBottom').addEventListener('change', (e) => {
  prefs.barTop = !e.target.checked;
  savePrefs();
  applyView();
});
$('setOneColumn').addEventListener('change', (e) => {
  prefs.oneColumn = e.target.checked;
  savePrefs();
  if (prefs.versions.length > 1) render(); // 대조 보기일 때만 모양이 바뀐다
});
$('setVerName').addEventListener('change', (e) => {
  prefs.showVerName = e.target.checked;
  savePrefs();
  applyView(); // 역본명은 늘 그려 두고 CSS로 숨긴다(다시 그릴 필요 없음)
});
// input은 고르는 동안 계속 온다(바로 보이게). 한쪽만 바꿔도 다른 쪽은 지금 보이는 색으로 함께 저장한다
$('fontColor').addEventListener('input', (e) => setColors(e.target.value, $('bgColor').value));
$('bgColor').addEventListener('input', (e) => setColors($('fontColor').value, e.target.value));
$('colorReset').addEventListener('click', () => {
  delete prefs.fontColor;
  delete prefs.bgColor;
  savePrefs();
  applyView();
  showColorInputs();
});
$('settingsClose').addEventListener('click', () => $('settingsBox').close());
$('settingsBox').addEventListener('click', (e) => { if (e.target === $('settingsBox')) $('settingsBox').close(); });

// ---- 데이터 관리(동기화 줄, 데이터 백업·복구) ----
// 앱의 설정 > 데이터 백업 / 데이터 복구. 웹에는 설정 화면이 따로 없어 ☰ 메뉴에서 한 창으로 연다.
// 파일은 앱과 같은 SQLite(DB 12, appBackup.js)라 앱에서 바로 복구할 수 있다. sql.js는 이 창에서만 불러온다
const $backupBox = $('backupBox'), $backupNote = $('backupNote');
$('menuBackup').textContent = S.backupMenu;
$('backupTitle').textContent = S.backupMenu;
label($('backupClose'), S.close);
$('backupDone').textContent = S.close;
$('backupSaveTitle').textContent = S.backupSaveTitle;
$('backupSaveHint').textContent = S.backupSaveHint;
$('backupRun').textContent = S.backupRun;
$('backupMoveHint').textContent = S.backupMoveHint;
$('backupNoticeTitle').textContent = S.backupNoticeTitle;
$('backupNotice1').textContent = S.backupNotice1;
$('backupNotice2').textContent = S.backupNotice2;
$('backupNoticeSync').textContent = S.backupNoticeSync;
$('backupNotice3').textContent = S.backupNotice3;

// 마지막 백업 시각과 [나중에]로 미룬 때. 화면 설정처럼 localStorage에 둔다(사이트 데이터를 지우면 기록과 함께 사라지므로
// 따로 둘 까닭이 없다). { at: 마지막 백업 ms, snooze: 이때까지 묻지 않음 ms }
const BACKUP_KEY = 'lifove.backup';
function backupState() {
  try {
    return JSON.parse(localStorage.getItem(BACKUP_KEY)) || {};
  } catch {
    return {};
  }
}
function saveBackupState(patch) {
  try {
    localStorage.setItem(BACKUP_KEY, JSON.stringify({ ...backupState(), ...patch }));
  } catch {
    // 저장하지 못해도 백업 자체는 됐다. 알림이 조금 일찍 다시 뜰 뿐
  }
}

function showBackupLast() {
  const at = backupState().at;
  $('backupLast').textContent = at
    ? S.backupLast(new Date(at).toLocaleString(lang, { dateStyle: 'medium', timeStyle: 'short' }))
    : S.backupNever;
}

function openBackupBox() {
  backupNote('');
  showBackupLast();
  $backupBox.showModal();
  loadSqlJs().catch(() => {}); // 미리 불러 둔다(누를 때 기다리지 않게). 실패는 누를 때 알린다
}

function backupNote(text, error = false) {
  $backupNote.textContent = text;
  $backupNote.hidden = !text;
  $backupNote.classList.toggle('error', error);
}

/** 파일을 내려받게 한다. 브라우저는 사용자가 누른 동작 안에서만 저장할 수 있다 */
function saveFile(bytes, name) {
  const url = URL.createObjectURL(new Blob([bytes], { type: 'application/octet-stream' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 60_000); // 바로 풀면 일부 브라우저가 받기 전에 끊는다
}

$('backupRun').addEventListener('click', async () => {
  const btn = $('backupRun');
  btn.disabled = true;
  backupNote(S.backupInProgress);
  try {
    const [SQL, data] = await Promise.all([loadSqlJs(), allUserData()]);
    const name = backupName();
    saveFile(buildBackup(SQL, data).bytes, name);
    backupNote(S.backupSaved(name));
    saveBackupState({ at: Date.now() });
    showBackupLast();
    if (updateBarKind === 'backup') hideUpdateBar();
  } catch (e) {
    console.error(e);
    backupNote(S.backupFailed, true);
  } finally {
    btn.disabled = false;
  }
});
$('backupClose').addEventListener('click', () => $backupBox.close());
$('backupDone').addEventListener('click', () => $backupBox.close());
$backupBox.addEventListener('click', (e) => { if (e.target === $backupBox) $backupBox.close(); });

// 데이터 복구(앱 Settings의 복구: 파일 고르기 → 합치기(추천)/바꾸기 → 요약 → 메모 고르기).
// 계산은 appBackup.js(openBackup·readBackup·planMerge·planReplace), 쓰기는 한 거래(putUserRows·replaceUserRows)라
// 중간에 실패하면 지금 데이터는 그대로다
const $restoreAsk = $('restoreAsk'), $restoreResult = $('restoreResult'), $conflictBox = $('conflictBox');
$('restoreTitle').textContent = S.restoreTitle;
$('restoreHint').textContent = S.restoreHint;
$('restoreRun').textContent = S.restoreRun;
$('restoreAskTitle').textContent = S.restoreTitle;
$('restoreCancel').textContent = S.cancel;
$('restoreGo').textContent = S.restoreRun;
$('restoreResultOk').textContent = S.ok;
for (const [id, [name, text]] of [['restoreMerge', S.restoreMerge], ['restoreReplace', S.restoreReplace]]) {
  const b = document.createElement('b');
  b.textContent = name; // 이름은 굵게, 설명은 그 아래(앱 restoreModeLabel)
  $(id).replaceChildren(b, text);
}
$('conflictLocalHead').textContent = S.conflictLocal;
$('conflictBackupHead').textContent = S.conflictBackup;
$('conflictPickLocal').textContent = S.conflictLocal;
$('conflictPickBackup').textContent = S.conflictBackup;
$('conflictPickBoth').textContent = S.conflictBoth;

let restoreFile = null; // 고른 파일(방식을 고르는 동안)

$('restoreRun').addEventListener('click', () => {
  $('restoreFile').value = ''; // 같은 파일을 또 골라도 change가 오게
  $('restoreFile').click();
});

$('restoreFile').addEventListener('change', () => {
  restoreFile = $('restoreFile').files[0] || null;
  if (!restoreFile) return;
  $('restoreAskFile').textContent = restoreFile.name;
  $restoreAsk.querySelector('input[value="merge"]').checked = true; // 늘 추천(합치기)부터
  $restoreAsk.showModal();
});

$('restoreCancel').addEventListener('click', () => $restoreAsk.close());
$('restoreGo').addEventListener('click', () => {
  const merge = $restoreAsk.querySelector('input[name="restoreMode"]:checked')?.value !== 'replace';
  $restoreAsk.close();
  runRestore(restoreFile, merge);
});

/** 백업을 합치거나 바꾸고, 결과를 보인 뒤 메모 고르기로(앱 runRestore) */
async function runRestore(file, merge) {
  if (!file) return;
  for (const id of ['backupRun', 'restoreRun']) $(id).disabled = true;
  backupNote(S.restoreInProgress);
  let message, conflicts = [];
  try {
    const [SQL, bytes] = await Promise.all([loadSqlJs(), file.arrayBuffer().then((b) => new Uint8Array(b))]);
    const { db } = openBackup(SQL, bytes);
    let tables;
    try {
      tables = readBackup(db);
    } finally {
      db.close();
    }
    const local = await allUserData();
    if (merge) {
      const plan = planMerge(local, tables);
      await putUserRows(plan.puts);
      message = mergeSummary(plan);
      conflicts = plan.conflicts;
    } else {
      await replaceUserRows(planReplace(local, tables, defaultMemoBookRow()).rows);
      // 이 기기 데이터를 통째로 바꿨으니 동기화가 '이미 합친 파일'로 기억한 것도 버린다(다음 동기화에서 다시 다 받아 합친다)
      await forgetSyncFiles().catch((e) => console.warn('[LifoveSync]', e));
      message = S.restoreDone;
    }
  } catch (e) {
    if (!e?.kind) console.error(e); // BackupError(백업 아님·새 버전·깨짐)는 알리기만
    // 지금 데이터는 그대로(쓰기는 한 거래, 파일 검사는 쓰기 전)
    message = e?.kind === 'newer' ? S.restoreNewer : e?.kind === 'notBackup' ? S.restoreNotBackup : S.restoreFailed;
  } finally {
    restoreFile = null;
    for (const id of ['backupRun', 'restoreRun']) $(id).disabled = false;
    backupNote('');
  }
  await reloadUserData();
  // 요약을 읽은 뒤 확인을 누르면 메모 고르기로(앱처럼)
  $('restoreResultText').textContent = message;
  $restoreResult.onclose = () => startConflicts(conflicts);
  $restoreResult.showModal();
}

/** 합친 결과 요약(앱 mergeSummary). 가져온 수는 백업 쪽으로 넣거나 바꾼 행(지운 표시 포함) */
function mergeSummary({ counts: c, conflicts }) {
  let s = c.underlines + c.memos + c.readChecks + c.bookmarks === 0
    ? S.mergeNothing : S.mergeDone(c.underlines, c.memos, c.readChecks, c.bookmarks);
  if (conflicts.length) s += '\n\n' + S.mergeConflicts(conflicts.length);
  return s;
}

/**
 * 동기화 device 파일(sync-format 4절)에 넣을 것. 읽던 곳은 책·장까지만 기억하므로 절은 1.
 * 받아 둔 역본은 서버에서 받은 것과 직접 넣은 것 모두(코드만)
 */
function syncDeviceInfo() {
  const v = prefs.versions[0];
  const p = prefs.pos;
  return {
    name: browserModel(navigator.userAgent),
    position: v && isValidPosition(p) ? { ver: v.code, book_id: p.book, chapter_no: p.chapter, verse_no: 1, at: prefs.posAt || 0 } : null,
    translations: versionList.filter((x) => x.local || cachedSet.has(x.url)).map((x) => x.code),
  };
}

/** 동기화 제안 창: 예면 true, 아니오·Esc면 false */
function askSync(text, yes, no) {
  const $box = $('syncAsk');
  $('syncAskText').textContent = text;
  $('syncAskYes').textContent = yes;
  $('syncAskNo').textContent = no;
  return new Promise((resolve) => {
    let answer = false;
    $('syncAskYes').onclick = () => { answer = true; $box.close(); };
    $('syncAskNo').onclick = () => $box.close();
    $box.onclose = () => resolve(answer);
    $box.showModal();
  });
}

/**
 * 동기화 뒤 다른 기기의 device 파일로 제안한다(sync-format 4절·5a. 제안만, 자동으로 옮기지 않음).
 * 같은 제안을 동기화할 때마다 묻지 않게, 물어본 읽던 곳의 시각(prefs.syncPosSeen)과 역본 코드(prefs.syncVersSeen)를 남긴다.
 * 답이 예면 시험 창과 설정 창을 닫고 그리로 간다
 */
async function syncSuggest(devices) {
  const closeSettings = () => { for (const id of ['syncBox', 'backupBox', 'settingsBox']) if ($(id).open) $(id).close(); };
  // 읽던 곳: 책·장·절만 따라가고 역본은 이 기기의 지금 역본
  const p = suggestPosition(devices, { book: pos.book, chapter: pos.chapter, at: prefs.posAt || 0 }, prefs.syncPosSeen || 0);
  if (p && isValidPosition({ book: p.book, chapter: p.chapter })) {
    prefs.syncPosSeen = p.at;
    savePrefs();
    if (await askSync(S.syncPositionAsk(p.name, S.verseRef(NAMES[p.book], p.chapter, p.verse)), S.syncGo, S.close)) {
      closeSettings();
      jumpTo({ book: p.book, chapter: p.chapter }, p.verse, true);
    }
  }
  // 역본: 서버에서 받을 수 있는 것만. 받은 것을 알 수 없는 주소(http://192.168.x.x, 보관 못 함)에서는 묻지 않는다
  if (!cacheOk) return;
  const have = versionList.filter((x) => x.local || cachedSet.has(x.url)).map((x) => x.code);
  const codes = suggestTranslations(devices, have, serverList.map((v) => v.code), prefs.syncVersSeen || []);
  if (!codes.length) return;
  prefs.syncVersSeen = [...(prefs.syncVersSeen || []), ...codes];
  savePrefs();
  const names = codes.map((c) => versionList.find((v) => v.code === c)?.name || c).join(', ');
  if (await askSync(S.syncVersionsAsk(names), S.download, S.close)) {
    closeSettings();
    openDownload(codes);
  }
}

/**
 * 다른 기기가 드라이브에 올린 역본 파일(sync-format 6b)을 받을지 묻는다. 자동으로 받지 않는다(수 MB, 데이터 요금).
 * 없는 역본은 한 번에 묻고, 이 기기에도 있지만 다른 기기가 더 나중에 넣은 것은 하나씩 바꿀지 묻는다.
 * 같은 제안(코드와 넣은 시각)은 다시 묻지 않는다(prefs.syncFilesSeen). 결과 글을 돌려준다(동기화 창 아래 줄)
 * @param fetchOne (항목) => Promise<{record}|{reason}> 드라이브에서 받아 넣을 행으로
 */
async function syncSuggestBibles(offers, fetchOne) {
  const seen = new Set(prefs.syncFilesSeen || []);
  const fresh = offers.filter((d) => !seen.has(offerKey(d)));
  if (!fresh.length) return null;
  prefs.syncFilesSeen = [...seen, ...fresh.map(offerKey)].slice(-200);
  savePrefs();
  const nameOf = (d) => d.name || d.code;
  const want = [];
  const adds = fresh.filter((d) => !d.replace);
  if (adds.length && await askSync(S.syncFilesAsk(adds.map(nameOf).join(', ')), S.syncGet, S.close)) want.push(...adds);
  for (const d of fresh.filter((x) => x.replace)) {
    if (await askSync(S.syncFileReplaceAsk(nameOf(d)), S.syncReplace, S.close)) want.push(d);
  }
  if (!want.length) return null;
  return downloadBibles(want, fetchOne);
}

/**
 * 드라이브의 역본을 받아 넣는다(받기 제안과 동기화 창의 [다운로드]가 같이 쓴다). 결과 글을 돌려준다
 * @param fetchOne (항목) => Promise<{record}|{reason}>
 */
async function downloadBibles(want, fetchOne) {
  const nameOf = (d) => d.name || d.code;
  showToast(S.downloading);
  const got = [], failed = [];
  for (const d of want) {
    try {
      const r = await fetchOne(d);
      if (r.reason) {
        failed.push(`${nameOf(d)} (${S.reasons[r.reason] || r.reason})`);
        continue;
      }
      // 대소문자만 다른 코드로 이미 넣어 두었으면 이 기기의 코드 그대로(고른 역본·기록이 그 코드를 쓴다)
      const old = localList.find((l) => codeKey(l.code) === codeKey(d.code));
      if (old) r.record.code = old.code;
      await putLocal(r.record);
      got.push(nameOf(d));
    } catch (e) {
      console.warn('[LifoveSync]', e);
      failed.push(`${nameOf(d)} (${e.message || e})`);
    }
  }
  const changed = await reloadLocal();
  if ($importBox.open) drawLocalList();
  if (changed) render();
  const lines = [];
  if (got.length) lines.push(S.imported(got.join(', ')));
  if (failed.length) lines.push(S.importFailed(failed.join(', ')));
  showToast(lines.join('\n'));
  return lines.join('\n');
}

/** 복구·동기화 뒤 화면의 형광펜·메모·읽음·메모책을 다시 읽는다 */
async function reloadUserData() {
  if (await loadVerOrder()) {
    const before = prefs.versions.map((v) => v.code).join();
    prefs.versions = orderVersions(prefs.versions, verOrder);
    savePrefs();
    if (before !== prefs.versions.map((v) => v.code).join()) render();
    else colorVerses(); // 차례는 같고 색만 바뀜
  }
  await refreshMemoBooks();
  loadHighlights();
  loadMemos();
  updateReadCheck();
}

$('restoreResultOk').addEventListener('click', () => $restoreResult.close());

// 메모 고르기(앱 MemoConflictDialogs). 고르지 않고 닫으면(Esc) 남은 것은 이 기기 메모 그대로다:
// 합치기는 충돌 메모를 쓰지 않았으므로 안전하다. 결과 알림은 백업 창 아래 줄에(모달 창이 #toast를 가려서)
let conflictList = [], conflictAt = 0;
// 동기화가 연 메모 고르기: { picks, resolve }. 고른 것을 쓰지 않고 sync.js에 돌려준다(쓰기는 sync.js가 한 거래로)
let conflictSync = null;

/**
 * 동기화의 메모 충돌을 묻는다: [이 기기][다른 기기][둘 다]. 충돌마다 고른 것(멈추면 null)을 돌려준다
 * @param conflicts syncMerge.planSync의 conflicts
 */
function askSyncConflicts(conflicts) {
  return new Promise((resolve) => {
    conflictSync = { picks: conflicts.map(() => null), resolve };
    for (const id of ['conflictBackupHead', 'conflictPickBackup']) $(id).textContent = S.conflictOther;
    startConflicts(conflicts.map(({ local, other }) => ({
      memo_book: local.memo_book, book_id: local.book_id, chapter_no: local.chapter_no, verse_no: local.verse_no,
      // 지움과 고침이 부딪힌 충돌도 있다(sync-format 5절): 지운 쪽은 '(지운 메모)'로 보인다
      localMemo: local.deleted ? S.conflictDeleted : local.memo, backupMemo: other.deleted ? S.conflictDeleted : other.memo,
    })));
  });
}

function endSyncConflicts() {
  for (const id of ['conflictBackupHead', 'conflictPickBackup']) $(id).textContent = S.conflictBackup;
  const done = conflictSync;
  conflictSync = null;
  conflictList = [];
  done.resolve(done.picks);
}

function startConflicts(list) {
  conflictList = list;
  conflictAt = 0;
  if (list.length) showConflict();
}

function showConflict() {
  const c = conflictList[conflictAt];
  const n = conflictList.length;
  $('conflictTitle').textContent = S.conflictTitle(conflictAt + 1, n);
  const ref = S.verseRef(NAMES[c.book_id] ?? c.book_id + 1, c.chapter_no, c.verse_no);
  // 메모책이 둘 이상이면 어느 메모책인지도(같은 절이 메모책마다 따로 충돌할 수 있어서. 앱과 같다)
  $('conflictRef').textContent = memoBooks.length > 1 ? `${ref} · ${memoBookTitle(c.memo_book)}` : ref;
  $('conflictLocal').textContent = c.localMemo ?? '';
  $('conflictBackup').textContent = c.backupMemo ?? '';
  const rest = n - conflictAt - 1;
  $('conflictRestRow').hidden = rest < 1;
  $('conflictRest').checked = false;
  $('conflictRestText').textContent = S.conflictApplyRest(rest);
  $conflictBox.querySelector('.conflict-body').scrollTop = 0;
  if (!$conflictBox.open) $conflictBox.showModal();
}

/** 고른 것을 쓰고 다음으로. '남은 것에도'면 남은 것 모두(앱 choose) */
async function pickConflict(pick) {
  const end = $('conflictRest').checked ? conflictList.length : conflictAt + 1;
  if (conflictSync) {
    for (let k = conflictAt; k < end; k++) conflictSync.picks[k] = pick;
    conflictAt = end;
    if (conflictAt < conflictList.length) {
      showConflict();
      return;
    }
    $conflictBox.close();
    endSyncConflicts();
    return;
  }
  try {
    for (let k = conflictAt; k < end; k++) {
      const c = conflictList[k];
      const text = resolveMemo(c.localMemo, c.backupMemo, pick);
      if (text == null) continue;
      // [이 기기]로 글이 그대로여도 쓴다: vv에 백업 쪽 항목을 합치고 이 기기를 찍는다(앱 applyMemoChoice, 판 2)
      await savePickedMemo(c, text);
    }
  } catch (e) {
    console.error(e);
    conflictList = [];
    $conflictBox.close();
    backupNote(S.restoreFailed, true);
    loadMemos();
    return;
  }
  conflictAt = end;
  if (conflictAt < conflictList.length) {
    showConflict();
    return;
  }
  conflictList = [];
  $conflictBox.close();
  backupNote(S.conflictDone);
  loadMemos();
}

$('conflictPickLocal').addEventListener('click', () => pickConflict(PICK_LOCAL));
$('conflictPickBackup').addEventListener('click', () => pickConflict(PICK_OTHER));
$('conflictPickBoth').addEventListener('click', () => pickConflict(PICK_BOTH));
// Esc로 닫으면 멈춤(앱 setOnCancelListener). 바깥 누르기로는 닫지 않는다(앱 setCanceledOnTouchOutside(false))
$conflictBox.addEventListener('cancel', () => {
  if (conflictSync) {
    endSyncConflicts(); // 남은 것은 고르지 않음(null): 이 기기 글 그대로, 다음 동기화에서 다시 묻는다
    return;
  }
  if (!conflictList.length) return;
  conflictList = [];
  backupNote(S.conflictStopped);
});

// ---- 메뉴 ----
// 앱의 옵션 메뉴처럼 오른쪽 위 ☰. 받기·넣기는 여기서만 한다(본문 화면의 역본 고르기는 받은 것만)
function openMenu() {
  // 메모 보이기/숨기기는 장에 메모가 있을 때만(앱 onPrepareOptionsMenu)
  $('menuMemoToggle').hidden = !memos.size;
  $('menuMemoToggle').textContent = memoShown() ? S.memoHide : S.memoShow;
  $menu.showModal();
  $menu.querySelector('button')?.focus();
}

/** 메뉴를 닫고 고른 창을 연다 */
function fromMenu(open) {
  return () => {
    $menu.close();
    open();
  };
}

$('menuBtn').addEventListener('click', openMenu);
$('menuDownload').addEventListener('click', fromMenu(openDownload));
$('menuImport').addEventListener('click', fromMenu(openImport));
$('menuBackup').addEventListener('click', fromMenu(openBackupBox));
$('menuSettings').addEventListener('click', fromMenu(openSettings));
$('menuOneVersion').addEventListener('click', fromMenu(() => openVerPicker('one')));
$('menuVersions').addEventListener('click', fromMenu(() => openVerPicker('multi')));
$('menuStats').addEventListener('click', fromMenu(openStats));
$('menuHighlights').addEventListener('click', fromMenu(openHighlights));
$('menuMemoList').addEventListener('click', fromMenu(openMemoList));
$('menuMemoToggle').addEventListener('click', fromMenu(toggleMemos));
$('menuAddBookmark').addEventListener('click', fromMenu(saveBookmark));
$('menuCopyChapter').addEventListener('click', fromMenu(copyChapter));
$('menuSendChapter').addEventListener('click', fromMenu(sendChapter));
$('menuReportError').addEventListener('click', fromMenu(reportVerseError));
$('menuBookmarks').addEventListener('click', fromMenu(openBookmarks));
$('menuSearch').addEventListener('click', fromMenu(openSearch));
$('menuHelp').addEventListener('click', fromMenu(openHelp));
// 메뉴 밖(배경)을 누르면 닫는다
$menu.addEventListener('click', (e) => { if (e.target === $menu) $menu.close(); });

// ---- 도움말 ----
// 내용은 help/<언어>.html(우리 파일이라 innerHTML로 넣는다). 앱 파일로 캐시되어 오프라인에서도 열린다.
// 한 번 넣으면 다시 받지 않는다(펼친 항목도 그대로 둔다)
const $helpBox = $('helpBox'), $helpBody = $('helpBody');
let helpLoaded = false;

/** @param section 도움말 안의 절 id(예 'helpVoices'). 주면 그 절로 스크롤한다 */
async function openHelp(section) {
  $helpBox.showModal();
  await loadHelp();
  const target = typeof section === 'string' && $helpBody.querySelector('#' + section);
  if (target) target.scrollIntoView({ block: 'start' });
}

async function loadHelp() {
  if (helpLoaded) return;
  try {
    const res = await fetch(`help/${lang}.html`);
    if (!res.ok) throw new Error(res.status);
    $helpBody.innerHTML = await res.text();
    helpLoaded = true;
  } catch {
    $helpBody.textContent = S.helpFailed;
    return;
  }
  // 설치하는 법은 지금 기기 항목만 펼쳐 둔다. 이미 설치한 앱이면 그렇다고 알린다
  const platform = detectPlatform(navigator.userAgent, navigator.maxTouchPoints);
  for (const d of $helpBody.querySelectorAll('details[data-platform]')) d.open = d.dataset.platform === platform;
  if (isStandalone(window)) for (const p of $helpBody.querySelectorAll('[data-installed]')) p.hidden = false;
  $helpBody.scrollTop = 0;
}

$('helpClose').addEventListener('click', () => $helpBox.close());
$helpBox.addEventListener('click', (e) => { if (e.target === $helpBox) $helpBox.close(); });

/** 묶음 제목에 쓸 언어 이름 */
function langNameOf() {
  const names = typeof Intl.DisplayNames === 'function'
    ? new Intl.DisplayNames([lang], { type: 'language' }) : null;
  return (code) => {
    try { return names?.of(code) || code; } catch { return code || '?'; }
  };
}

/** 언어별로 묶은 목록(h3 + ul). 직접 넣은 역본 묶음(언어 '')은 맨 앞 */
function groupedList(list, rowOf) {
  const langName = langNameOf();
  const groups = groupByLang(list, lang);
  groups.sort((a, b) => (a.lang === '' ? 0 : 1) - (b.lang === '' ? 0 : 1));
  const parts = [];
  for (const g of groups) {
    const h = document.createElement('h3');
    h.textContent = g.lang === '' ? S.localGroup : langName(g.lang);
    const ul = document.createElement('ul');
    ul.className = 'ver-list';
    for (const v of g.items) ul.append(rowOf(v));
    parts.push(h, ul);
  }
  return parts;
}

function badgeEl(text) {
  const badge = document.createElement('span');
  badge.className = 'badge';
  badge.textContent = text;
  return badge;
}

function deleteButton(name, onClick) {
  const del = document.createElement('button');
  del.className = 'icon del';
  del.textContent = '🗑';
  label(del, S.delete + ' ' + name);
  del.addEventListener('click', onClick);
  return del;
}

/** 이름만 있는 줄(체크 상자 없음). 체크 상자 자리만큼 비워 이름 위치를 맞춘다 */
function nameLabel(v) {
  const lab = document.createElement('label');
  const pad = document.createElement('span');
  pad.className = 'pad';
  const name = document.createElement('span');
  name.className = 'name';
  name.textContent = v.name;
  lab.append(pad, name);
  return lab;
}

/** 지금 고른 역본에서 빼고, 다 빠지면 다른 받은 역본으로. 화면을 다시 그린다 */
function dropFromSelection(code) {
  if (!prefs.versions.some((v) => v.code === code)) return;
  prefs.versions = prefs.versions.filter((v) => v.code !== code);
  syncPrefsVersions();
  render();
}

// ---- 역본 고르기 ----
// 앱처럼 메뉴에서 두 가지로 연다. 다른성경보기('one')는 라디오로 하나, 역본대조보기('multi')는 체크 목록
// (하나면 그 역본만, 여럿이면 대조 보기). 앱의 다른성경보기는 마지막에 하나 고른 역본을 따로 기억하지만
// 웹은 지금 주 역본(첫째)을 고른 채로 연다.
// 앱처럼 받아 둔 역본과 직접 넣은 역본만 보인다(compare.pickableVersions). 받기는 성경다운로드에서
let draft = []; // 창에서 고르는 중인 코드들(순서대로). 확인을 눌러야 적용
let verMode = 'multi';

async function openVerPicker(mode) {
  verMode = mode;
  const one = mode === 'one';
  $('verTitle').textContent = one ? S.pickOneVersion : S.pickVersions;
  $('verHint').textContent = one ? S.pickOneHint : S.pickVersionsHint;
  $oneColumn.closest('label').hidden = one; // 1단/2단은 대조 보기에만
  draft = one ? prefs.versions.slice(0, 1).map((v) => v.code) : prefs.versions.map((v) => v.code);
  $oneColumn.checked = !!prefs.oneColumn;
  $verList.replaceChildren();
  $verPicker.showModal();
  await refreshCached();
  drawVerList();
}

function drawVerList() {
  const list = orderVersions(pickableVersions(versionList, cachedSet, prefs.versions.map((v) => v.code), cacheOk), verOrder);
  // 역본 순서가 있으면(앱에서 정한 순서를 동기화로 받음) 앱처럼 한 목록으로 그 순서대로. 없으면 언어별 묶음
  if (verOrder.size) {
    const ul = document.createElement('ul');
    ul.className = 'ver-list';
    ul.append(...list.map(verRow));
    $verList.replaceChildren(ul);
  } else {
    $verList.replaceChildren(...groupedList(list, verRow));
  }
  $('verEmpty').hidden = list.length > 0;
  updateDraft();
}

function verRow(v) {
  const li = document.createElement('li');
  li.dataset.code = v.code;
  const lab = document.createElement('label');
  const box = document.createElement('input');
  box.type = verMode === 'one' ? 'radio' : 'checkbox';
  box.name = 'ver';
  box.checked = draft.includes(v.code);
  box.addEventListener('change', () => {
    draft = verMode === 'one' ? [v.code] : toggleCode(draft, v.code, box.checked);
    updateDraft();
  });
  const order = document.createElement('span');
  order.className = 'order';
  const name = document.createElement('span');
  name.className = 'name';
  name.textContent = v.name;
  lab.append(box, order, name);
  li.append(lab);
  if (v.local) li.append(badgeEl(S.localBadge));
  return li;
}

/** 대조 보기에서 몇째 단인지(둘 이상일 때만)와 확인 버튼. 역본 순서가 있으면 그 순서, 없으면 고른 순서 */
function updateDraft() {
  const cols = orderVersions(draft, verOrder);
  for (const li of $verList.querySelectorAll('li')) {
    const i = cols.indexOf(li.dataset.code);
    li.querySelector('.order').textContent = draft.length > 1 && i >= 0 ? i + 1 : '';
  }
  $verOk.disabled = !draft.length; // 앱처럼 하나는 꼭 골라야 한다
}

function applyVersions() {
  const chosen = orderVersions(draft, verOrder).map((c) => versionList.find((v) => v.code === c)).filter(Boolean);
  if (!chosen.length) return;
  prefs.oneColumn = $oneColumn.checked;
  useVersions(chosen);
  $verPicker.close();
  render();
}

/** 고른 역본을 바꾼다(그리기는 부르는 쪽이). 역본대조보기·다른성경보기·나의형광펜목록에서 */
function useVersions(chosen) {
  prefs.versions = chosen;
  savePrefs();
  // 고르지 않은 역본은 메모리에서 내린다(파일 하나가 2~15MB)
  for (const url of [...opened.keys()]) {
    if (!chosen.some((v) => v.url === url)) opened.delete(url);
  }
  $verses.replaceChildren();
}

$verOk.addEventListener('click', applyVersions);
$('verCancel').addEventListener('click', () => $verPicker.close());
$('verClose').addEventListener('click', () => $verPicker.close());
$verPicker.addEventListener('click', (e) => { if (e.target === $verPicker) $verPicker.close(); });
$('verDownload').addEventListener('click', () => {
  $verPicker.close();
  openDownload();
});

// ---- 성경다운로드 ----
// 앱의 AddBibleData처럼 받을 역본을 체크해서 한꺼번에 받는다(하나씩 차례로). 받은 역본은 "받음"과 지우기.
// 창을 닫아도 받기는 계속되고, 다시 열면 진행 상태가 보인다
let dlChecked = new Set(); // 체크한 코드
let dlRun = null; // 받는 중이면 { codes, done, failed, now: {name, got, total} }
let dlResult = ''; // 마지막 받기 결과 문구

/** @param preselect 처음부터 체크해 둘 코드(동기화의 "없는 역본을 받을까요?"에서 예) */
async function openDownload(preselect = []) {
  if (!dlRun) {
    dlChecked = new Set(Array.isArray(preselect) ? preselect : []);
    dlResult = '';
  }
  $dlList.replaceChildren();
  $dlBox.showModal();
  await refreshCached();
  drawDownload();
}

function drawDownload() {
  // 서버 목록만(서버에 없는 직접 넣은 역본은 성경 파일 넣기 창에)
  const server = versionList.filter((v) => !v.local || serverList.some((x) => x.code === v.code));
  $dlList.replaceChildren(...groupedList(server, dlRow));
  const note = [listOld ? S.listOld : '', cacheOk ? '' : S.noCache].filter(Boolean).join('\n');
  $('dlNote').textContent = note;
  $('dlNote').hidden = !note;
  updateDownloadFoot();
}

function dlRow(v) {
  const li = document.createElement('li');
  if (v.local) {
    // 같은 코드의 파일을 직접 넣었다. 그 파일로 읽으므로 받지 않는다
    li.append(nameLabel(v), badgeEl(S.localBadge));
  } else if (cacheOk && isCached(v, cachedSet)) {
    li.append(nameLabel(v), badgeEl(S.downloaded), deleteButton(v.name, async () => {
      if (!confirm(S.deleteConfirm(v.name))) return;
      await deleteLfa(v.url);
      opened.delete(v.url);
      await refreshCached();
      drawDownload();
      dropFromSelection(v.code);
    }));
  } else {
    const lab = document.createElement('label');
    const box = document.createElement('input');
    box.type = 'checkbox';
    box.checked = dlChecked.has(v.code) || !!dlRun?.codes.includes(v.code);
    box.disabled = !!dlRun;
    box.addEventListener('change', () => {
      if (box.checked) dlChecked.add(v.code);
      else dlChecked.delete(v.code);
      updateDownloadFoot();
    });
    const name = document.createElement('span');
    name.className = 'name';
    name.textContent = v.name;
    lab.append(box, name);
    li.append(lab);
  }
  return li;
}

function updateDownloadFoot() {
  $dlGo.disabled = !!dlRun || !dlChecked.size;
  const st = $('dlStatus');
  if (dlRun) {
    const n = dlRun.now;
    const amount = !n ? '' : n.total
      ? `${n.name} ${Math.floor((n.got / n.total) * 100)}% (${mb(n.got)} / ${mb(n.total)})`
      : `${n.name} ${mb(n.got)}`;
    st.textContent = S.downloadAll(dlRun.done + 1, dlRun.codes.length) + ' ' + amount;
    st.classList.remove('error');
  } else {
    st.textContent = dlResult;
    st.classList.toggle('error', dlResult !== '' && dlResult !== S.downloadDone);
  }
  st.hidden = !st.textContent;
}

async function runDownload() {
  if (dlRun || !dlChecked.size) return;
  // 목록 순서대로 받는다
  const todo = versionList.filter((v) => dlChecked.has(v.code) && !v.local);
  dlRun = { codes: todo.map((v) => v.code), done: 0, failed: [], now: null };
  dlChecked = new Set();
  dlResult = '';
  drawDownload();
  for (const v of todo) {
    dlRun.now = { name: v.name, got: 0, total: 0 };
    updateDownloadFoot();
    try {
      // 본문 화면이 같은 역본을 받는 중이면 그것을 기다린다(두 번 받지 않게)
      if (opening.has(v.url)) await opening.get(v.url);
      else {
        await getLfa(v.url, (got, total) => {
          dlRun.now = { name: v.name, got, total };
          updateDownloadFoot();
        });
      }
    } catch (e) {
      console.warn('download failed', v.code, e);
      dlRun.failed.push(v.name);
    }
    dlRun.done++;
  }
  const failed = dlRun.failed;
  dlRun = null;
  dlResult = failed.length ? S.downloadFailed(failed.join(', ')) : S.downloadDone;
  await refreshCached();
  if ($dlBox.open) drawDownload();
  // 읽을 역본이 없던 사람이면 받은 역본으로 바로 본다
  if (!prefs.versions.length) {
    syncPrefsVersions();
    render();
  }
}

$dlGo.addEventListener('click', runDownload);
$('dlCancel').addEventListener('click', () => $dlBox.close());
$('dlClose').addEventListener('click', () => $dlBox.close());
$dlBox.addEventListener('click', (e) => { if (e.target === $dlBox) $dlBox.close(); });
$('emptyDownload').addEventListener('click', openDownload);

// ---- 성경 파일 넣기 ----
// 파일 고르기, 폴더 고르기, 끌어다 놓기 모두 importItems로 모인다.
// 넣기 전에 검사하고(localBible.prepareGroup), IndexedDB에 보관한다(localStore.js)
let importing = false;

function openImport() {
  showImportNote('');
  drawLocalList();
  $importBox.showModal();
}

function drawLocalList() {
  const list = versionList.filter((v) => v.local);
  $('localList').replaceChildren(...list.map((v) => {
    const li = document.createElement('li');
    li.append(nameLabel(v), deleteButton(v.name, async () => {
      if (!confirm(S.deleteLocalConfirm(v.name))) return;
      // 드라이브에 올린 파일은 남는다(6b). 지운 역본은 다음 동기화에서 "받을까요?"로 다시 물을 수 있다(자기 드라이브 파일로 되찾게, 앱과 같음)
      await deleteLocal(v.code);
      // 서버에도 있는 역본이면 서버 역본으로 돌아간다. 받아 두지 않았으면 고른 역본에서 뺀다
      const changed = await reloadLocal();
      const back = versionList.find((x) => x.code === v.code);
      if (!back || !pickableVersions([back], cachedSet, [], cacheOk).length) dropFromSelection(v.code);
      else if (changed) render();
      drawLocalList();
    }));
    return li;
  }));
  $('localEmpty').hidden = list.length > 0;
}

function showImportNote(text, isError = false) {
  const note = $('importNote');
  note.textContent = text;
  note.classList.toggle('error', isError);
  note.hidden = !text;
}

/** @param {{path: string, file: File}[]} items */
async function importItems(items) {
  if (importing) return;
  if (!$importBox.open) openImport(); // 결과와 넣은 역본을 바로 보이려고
  const { groups } = groupFiles(items);
  if (!groups.length) {
    showImportNote(S.importNone, true);
    return;
  }
  importing = true;
  $('importProgress').hidden = false;
  const added = [], failed = [];
  try {
    for (const [i, g] of groups.entries()) {
      const fileLabel = g.kind === 'lfa' ? g.files[0].path.split(/[\\/]/).pop() : g.code + '.bdf';
      showImportNote(groups.length > 1 ? `${S.importing} (${i + 1}/${groups.length})` : S.importing);
      try {
        const r = await prepareGroup(g);
        if (r.reason) {
          failed.push(`${fileLabel} (${S.reasons[r.reason]})`);
          continue;
        }
        r.record.addedAt = Date.now();
        // 언어: biblename 둘째 줄 → 코드 → 본문(langGuess). 모르면 ''(살펴봤지만 모름)
        if (!r.record.lang) r.record.lang = (await detectLang(r.record).catch(() => null)) || '';
        await putLocal(r.record);
        added.push(g.code);
      } catch (e) {
        console.warn('import failed', fileLabel, e);
        failed.push(`${fileLabel} (${S.reasons.storeFailed})`);
      }
    }
  } finally {
    importing = false;
    $('importProgress').hidden = true;
  }
  let changed = await reloadLocal();
  if (added.length) syncApi.changed(); // 서버에 없는 역본이면 동기화가 파일째 올린다(6b)
  // 읽을 역본이 없던 사람이면 넣은 역본으로 바로 본다
  if (!prefs.versions.length && added.length) {
    prefs.versions = [versionList.find((v) => v.code === added[0])].filter(Boolean);
    savePrefs();
    changed = true;
  }
  const names = added.map((c) => versionList.find((v) => v.code === c)?.name || c);
  const lines = [];
  if (names.length) lines.push(S.imported(names.join(', ')));
  if (failed.length) lines.push(S.importFailed(failed.join(', ')));
  drawLocalList();
  showImportNote(lines.join('\n'), !names.length);
  if (changed) render();
}

function fromInput(input) {
  const items = [...input.files].map((f) => ({ path: f.webkitRelativePath || f.name, file: f }));
  input.value = ''; // 같은 파일을 다시 골라도 change가 나게
  importItems(items);
}

$('importFilesBtn').addEventListener('click', () => $('importFiles').click());
$('importFolderBtn').addEventListener('click', () => $('importFolder').click());
$('importFiles').addEventListener('change', (e) => fromInput(e.target));
$('importFolder').addEventListener('change', (e) => fromInput(e.target));
$('importClose').addEventListener('click', () => $importBox.close());
$importBox.addEventListener('click', (e) => { if (e.target === $importBox) $importBox.close(); });

/** 끌어다 놓은 것에서 파일을 모은다. 폴더면 안으로 들어간다(앱이 내보낸 bible 폴더째 놓을 수 있게) */
async function filesFromDrop(dt) {
  // items는 drop 처리 중에만 쓸 수 있으므로 await 전에 entry를 꺼내 둔다
  const entries = [...dt.items].map((i) => i.webkitGetAsEntry?.()).filter(Boolean);
  if (!entries.length) return [...dt.files].map((f) => ({ path: f.name, file: f }));
  const out = [];
  const walk = async (entry, dir) => {
    const path = dir + entry.name;
    if (entry.isFile) {
      // 성경 파일만 연다. 폴더에 mp3 같은 큰 파일이 많아도 건드리지 않게
      if (classifyName(path)) out.push({ path, file: await new Promise((ok, fail) => entry.file(ok, fail)) });
    } else if (entry.isDirectory) {
      const reader = entry.createReader();
      // readEntries는 한 번에 100개 정도씩만 준다. 빈 배열이 나올 때까지 부른다
      for (;;) {
        const batch = await new Promise((ok, fail) => reader.readEntries(ok, fail));
        if (!batch.length) break;
        for (const e of batch) await walk(e, path + '/');
      }
    }
  };
  for (const e of entries) await walk(e, '');
  return out;
}

const $drop = $('dropOverlay');
const hasFiles = (e) => [...(e.dataTransfer?.types || [])].includes('Files');
/** 열린 대화 상자(메뉴·창)가 있는가 */
const anyDialogOpen = () => !!document.querySelector('dialog[open]');
function setDropping(on) {
  // 열린 대화 상자(top layer) 위에는 덮개가 올라가지 않으므로 그때는 넣기 창 테두리로 보인다
  $drop.hidden = !on || anyDialogOpen();
  $importBox.classList.toggle('dropping', on && $importBox.open);
}
document.addEventListener('dragover', (e) => {
  if (!hasFiles(e)) return;
  e.preventDefault(); // 이것이 있어야 drop이 온다(없으면 브라우저가 파일을 열어 버린다)
  e.dataTransfer.dropEffect = 'copy';
  setDropping(true);
});
document.addEventListener('dragleave', (e) => {
  if (!e.relatedTarget) setDropping(false); // 창 밖으로 나갔다
});
document.addEventListener('drop', async (e) => {
  if (!hasFiles(e)) return;
  e.preventDefault();
  setDropping(false);
  // 넣기 창 말고 다른 창은 닫는다(넣은 결과를 넣기 창에 보인다)
  for (const d of document.querySelectorAll('dialog[open]')) if (d !== $importBox) d.close();
  importItems(await filesFromDrop(e.dataTransfer));
});

// ---- 검색 ----
// 앱 SearchView처럼 검색어 A·B와 범위로 찾는다. 규칙(검색어 검사, 찾기, 강조)은 search.js.
// 앱은 결과를 나눠 이어서 찾지만 웹은 범위 전체를 한 번에 찾고, 중지 버튼을 둔다.
// 결과는 창을 닫아도 남겨서, 절로 갔다가 다시 열면 이어서 볼 수 있다(앱에서 뒤로 가기와 같게)
const $search = $('searchBox'), $searchResults = $('searchResults');
const $searchStatus = $('searchStatus'), $searchStop = $('searchStop'), $searchMore = $('searchMore');
const PAGE = 300; // 결과를 한 번에 그리는 수. "the"처럼 수만 절이 걸리면 한꺼번에 그리기가 느리다
let searchRun = null; // 찾는 중이면 { stop: false }
let searchDone = null; // 마지막 결과 { results, words, shown }
// 같은 역본을 다시 찾을 때 압축을 또 풀지 않게, 마지막으로 찾은 역본의 텍스트를 둔다(역본 하나에 5MB 남짓)
let searchCache = { source: null, texts: new Map() };

function buildRangeOptions() {
  const opt = (value, text) => {
    const o = document.createElement('option');
    o.value = value;
    o.textContent = text;
    return o;
  };
  const group = (title, options) => {
    const g = document.createElement('optgroup');
    g.label = title;
    g.append(...options);
    return g;
  };
  const books = (from, to) => NAMES.slice(from, to).map((n, i) => opt('book:' + (from + i), n));
  $('searchRange').append(
    opt('all', S.rangeAll), opt('ot', S.ot), opt('nt', S.nt),
    group(S.themes, THEMES.map((t) => opt('theme:' + t.key, S.themeNames[t.key]))),
    group(S.ot, books(0, OT_COUNT)),
    group(S.nt, books(OT_COUNT, BOOK_COUNT)),
  );
}
buildRangeOptions();

function openSearch() {
  // 검색할 역본은 지금 고른 역본 중에서(앱은 주 역본만). 하나면 상자를 숨긴다
  const sel = $('searchVer');
  const keep = sel.value;
  sel.replaceChildren(...prefs.versions.map((v) => {
    const o = document.createElement('option');
    o.value = v.url;
    o.textContent = v.name;
    return o;
  }));
  if (prefs.versions.some((v) => v.url === keep)) sel.value = keep;
  sel.hidden = prefs.versions.length < 2;
  // 앱 기본값처럼 처음에는 지금 읽는 책을 범위로. 한 번 찾은 뒤에는 그 범위를 그대로 둔다
  if (!searchDone && !searchRun) $('searchRange').value = 'book:' + pos.book;
  $search.showModal();
  if (!searchDone) $('qA').focus();
}

function setSearchStatus(text, isError = false) {
  $searchStatus.textContent = text;
  $searchStatus.classList.toggle('error', isError);
}

async function runSearch() {
  if (searchRun) return;
  const q = normalizeQuery($('qA').value, $('qB').value);
  const rangeValue = $('searchRange').value;
  const problem = checkQuery(q, rangeValue);
  if (problem) {
    setSearchStatus(problem === 'required' ? S.keywordRequired : S.keywordTooShort, true);
    $('qA').focus();
    return;
  }
  const v = prefs.versions.find((x) => x.url === $('searchVer').value) || prefs.versions[0];
  if (!v) return;
  const books = booksOfRange(rangeValue);
  const run = { stop: false };
  searchRun = run;
  searchDone = null;
  $searchResults.replaceChildren();
  $searchMore.hidden = true;
  $searchStop.hidden = false;
  $('searchGo').disabled = true;
  const results = [];
  let failed = null;
  try {
    setSearchStatus(S.searching(''));
    const source = await openVersion(v); // 처음이면 받는다(진행률은 읽기 화면 상태 줄에)
    if (searchCache.source !== source) searchCache = { source, texts: new Map() };
    const bookSet = new Set(books);
    let lastBook = -1, sinceYield = 0;
    for (const job of readJobs(source, books)) {
      if (run.stop) break;
      if (job.book !== lastBook) {
        lastBook = job.book;
        setSearchStatus(S.searching(NAMES[job.book]));
      }
      let text = searchCache.texts.get(job.key);
      if (text === undefined) {
        text = await job.read();
        searchCache.texts.set(job.key, text);
      } else if (++sinceYield % 100 === 0) {
        // 보관한 텍스트만 찾으면 기다릴 일이 없어 화면이 멈춘다. 가끔 쉬어 준다
        await new Promise((ok) => setTimeout(ok));
      }
      if (text) results.push(...searchText(text, bookSet, q));
    }
  } catch (e) {
    console.warn('search failed', e);
    failed = e;
  } finally {
    searchRun = null;
    $searchStop.hidden = true;
    $('searchGo').disabled = false;
  }
  sortResults(results);
  searchDone = { results, words: [q.a, q.b].filter(Boolean), shown: 0 };
  if (failed) setSearchStatus(S.searchFailed + ': ' + failed.message, true);
  else if (run.stop) setSearchStatus(S.searchCanceled(results.length));
  else setSearchStatus(results.length ? S.found(results.length) : S.noResult);
  showMoreResults();
}

/** 결과를 PAGE개씩 더 그린다 */
function showMoreResults() {
  const d = searchDone;
  if (!d) return;
  const more = d.results.slice(d.shown, d.shown + PAGE);
  $searchResults.append(...more.map((r) => resultItem(r, d.words)));
  d.shown += more.length;
  const left = d.results.length - d.shown;
  $searchMore.hidden = left <= 0;
  $searchMore.textContent = S.more(left);
}

function resultItem(r, words) {
  const li = document.createElement('li');
  const btn = document.createElement('button');
  btn.type = 'button';
  const ref = document.createElement('span');
  ref.className = 'sref';
  ref.textContent = S.verseRef(NAMES[r.book], r.chapter, r.verse);
  const body = document.createElement('span');
  for (const part of highlightParts(r.text, words)) {
    if (part.hit) {
      const mark = document.createElement('mark');
      mark.textContent = part.text;
      body.append(mark);
    } else {
      body.append(part.text); // 글자로만 넣는다(HTML로 해석하지 않음)
    }
  }
  btn.append(ref, ' ', body);
  btn.addEventListener('click', () => {
    $search.close();
    jumpTo({ book: r.book, chapter: r.chapter }, r.verse);
  });
  li.append(btn);
  return li;
}

$('searchBtn').addEventListener('click', openSearch);
$('searchForm').addEventListener('submit', (e) => {
  e.preventDefault();
  runSearch();
});
$searchStop.addEventListener('click', () => { if (searchRun) searchRun.stop = true; });
$searchMore.addEventListener('click', showMoreResults);
$('searchClose').addEventListener('click', () => $search.close());
$search.addEventListener('click', (e) => { if (e.target === $search) $search.close(); });

// ---- 이동 버튼(화면 가운데 오른쪽)과 최근목록 ----
// 앱 VerseList의 navigationbar_layout. 장 ‹ ›는 이전/다음 장, 화면 ˄ ˅는 movingUP/movingDown,
// 최근목록 ↶ ↷는 moveToPrevHistory/moveToNextHistory와 같게 움직인다. 계산은 navBar.js
let hist = loadHistory(readJSON(HISTORY_KEY), isValidPosition);
let cameToLast = false; // 마지막 절이 보이는 데서 아래를 눌렀다. 한 번 더 누르면 다음 장(앱 mCameToLast)
const $sideNav = $('sideNav');

function readJSON(key) {
  try { return JSON.parse(localStorage.getItem(key)); } catch { return null; }
}

function saveHistory(h) {
  hist = h;
  try { localStorage.setItem(HISTORY_KEY, JSON.stringify(h)); } catch { /* 저장 못 해도 이번에는 된다 */ }
}

/** 본문이 보이는 세로 범위(책·장 바를 뺀 곳). 바는 위나 아래에 붙어 있다 */
function viewArea() {
  const r = document.querySelector('.bar').getBoundingClientRect();
  const area = prefs.barTop ? { top: r.bottom, bottom: innerHeight } : { top: 0, bottom: r.top };
  // 떠 있는 메모 입력판·동작 바가 가리는 곳도 뺀다
  for (const el of [$('memoPanel'), $('selBar')]) {
    if (el.hidden) continue;
    const b = el.getBoundingClientRect();
    if (b.top > area.top + 1) area.bottom = Math.min(area.bottom, b.top);
    else area.top = Math.max(area.top, b.bottom); // 바가 위쪽이면 동작 바는 바 아래에 붙는다
  }
  return area;
}

/** 절을 보이는 곳 맨 위에 맞춘다 */
function scrollToTop(li) {
  window.scrollBy(0, li.getBoundingClientRect().top - viewArea().top);
}

/** 맨 위에 보이는 절(조금이라도 보이는 첫 절) */
function firstVisible(area = viewArea()) {
  return [...$verses.children].find((li) => li.getBoundingClientRect().bottom > area.top + 1) || null;
}

/** 지금 읽는 곳(맨 위 절). 최근목록에 남긴다 */
function here() {
  const li = firstVisible();
  return { ...pos, verse: li ? Number(li.id.slice(1)) || 1 : 1 };
}

/** 책·장 고르기, 검색 결과처럼 다른 곳으로 갈 때. 최근목록에 새 칸을 만든다 */
function jumpTo(p, verse, top = false) {
  saveHistory(jumpHistory(hist, here(), { ...p, verse: verse || 1 }));
  if (verse) pendingVerse = { book: p.book, chapter: p.chapter, verse, flash: true, top };
  go(p);
}

function stepTo(dir) {
  const r = stepHistory(hist, here(), dir);
  if (!r) return;
  saveHistory(r.h);
  pendingVerse = { ...r.to, flash: false };
  go({ book: r.to.book, chapter: r.to.chapter });
}

/** 위 버튼(앱 movingUP). 맨 위거나 한 장 단위면 이전 장 */
function moveUp() {
  cameToLast = false;
  const unit = NAV_UNITS.includes(prefs.navUnit) ? prefs.navUnit : NAV_UNIT_DEFAULT;
  const area = viewArea();
  const first = $verses.firstElementChild;
  const atTop = !first || window.scrollY <= 0 || first.getBoundingClientRect().top >= area.top - 1;
  if (unit === 'chapter' || atTop) {
    goChapter('prev');
    return;
  }
  const fv = firstVisible(area);
  if (unit === 'verse') {
    // 맨 위 절이 걸쳐 있으면 그 절의 처음으로, 아니면 앞 절로
    if (fv.getBoundingClientRect().top < area.top - 1) scrollToTop(fv);
    else if (fv.previousElementSibling) scrollToTop(fv.previousElementSibling);
    return;
  }
  window.scrollBy(0, -(area.bottom - area.top));
  // 맨 위에 걸친 절이 잘려 보이면 다음 절이 맨 위에 오도록(앱과 같게)
  const nf = firstVisible();
  if (nf && nf.getBoundingClientRect().top < viewArea().top - 1 && nf.nextElementSibling && window.scrollY > 0) {
    scrollToTop(nf.nextElementSibling);
  }
}

/** 아래 버튼(앱 movingDown). 마지막 절이 보이는 데서 누르면 알리고, 한 번 더 누르면 다음 장 */
function moveDown() {
  const unit = NAV_UNITS.includes(prefs.navUnit) ? prefs.navUnit : NAV_UNIT_DEFAULT;
  if (cameToLast || unit === 'chapter') {
    cameToLast = false;
    $('toast').hidden = true; // 다음 장에서는 "한 번 더" 알림이 남지 않게
    goChapter('next');
    return;
  }
  const items = [...$verses.children];
  if (!items.length) {
    goChapter('next');
    return;
  }
  const area = viewArea();
  const lastShown = items[items.length - 1].getBoundingClientRect().top < area.bottom;
  if (unit === 'verse') {
    const next = firstVisible(area)?.nextElementSibling;
    if (next) scrollToTop(next);
  } else {
    // 보이는 마지막 절을 맨 위로. 그 절이 이미 맨 위면(아주 긴 절) 한 화면만큼
    const lv = items.filter((li) => li.getBoundingClientRect().top < area.bottom).pop();
    if (lv && lv.getBoundingClientRect().top > area.top + 1) scrollToTop(lv);
    else window.scrollBy(0, area.bottom - area.top);
  }
  if (lastShown && nextChapter(pos)) {
    cameToLast = true;
    showToast(S.downAgain);
  }
}

let toastTimer = 0;
function showToast(text) {
  const t = $('toast');
  t.textContent = text;
  t.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { t.hidden = true; }, 2000);
}

/** 설정에 따라 버튼 쌍을 보이고, 갈 곳이 없는 버튼은 자리만 남기고 숨긴다 */
function updateSideNav() {
  const show = navButtons(prefs.navBar ?? NAV_DEFAULT);
  $sideNav.hidden = !show.screen && !show.chapter && !show.history;
  $sideNav.dataset.pos = navPosition(prefs.navPos);
  root.classList.toggle('nav-left', $sideNav.dataset.pos.startsWith('left')); // 넓은 대조 보기가 비울 쪽
  for (const b of $sideNav.children) b.classList.toggle('off', !show[b.dataset.group]);
  $('navPrevCh').classList.toggle('none', !prevChapter(pos));
  $('navNextCh').classList.toggle('none', !nextChapter(pos));
  $('navBack').classList.toggle('none', !canBack(hist));
  $('navForward').classList.toggle('none', !canForward(hist));
}

label($('navPrevCh'), S.prev);
label($('navNextCh'), S.next);
label($('navUp'), S.navUp);
label($('navDown'), S.navDown);
label($('navBack'), S.navBack);
label($('navForward'), S.navForward);
$('navPrevCh').addEventListener('click', () => goChapter('prev'));
$('navNextCh').addEventListener('click', () => goChapter('next'));
$('navUp').addEventListener('click', moveUp);
$('navDown').addEventListener('click', moveDown);
$('navBack').addEventListener('click', () => stepTo(1));
$('navForward').addEventListener('click', () => stepTo(-1));

// 본문화면설정의 "이동과 터치"
$('groupNav').textContent = S.groupNav;
$('navBarLabel').textContent = S.navBar;
$('navBarHint').textContent = S.navBarHint;
$('navUnitLabel').textContent = S.navUnit;
$('navPosLabel').textContent = S.navPos;
const option = (value, text) => {
  const o = document.createElement('option');
  o.value = value;
  o.textContent = text;
  return o;
};
$('setNavBar').append(...NAV_OPTIONS.map((v) => option(v, S.navBarOptions[v])));
$('setNavUnit').append(...NAV_UNITS.map((u) => option(u, S.navUnits[u])));
$('setNavBar').addEventListener('change', (e) => {
  prefs.navBar = Number(e.target.value);
  savePrefs();
  updateSideNav();
});
$('setNavUnit').addEventListener('change', (e) => {
  prefs.navUnit = e.target.value;
  savePrefs();
});
// 앱 swipe_chapter_preference(기본 켬). 저장 값이 없으면 켬
$('setSwipeLabel').textContent = S.swipeChapter;
$('setSwipeHint').textContent = S.swipeChapterHint;
$('setSwipe').addEventListener('change', (e) => {
  prefs.swipeChapter = e.target.checked;
  savePrefs();
});
// 음성(TTS) 설정. 앱 audio_button_preference(기본 켬), autoaudioreadcheck_preference(기본 끔).
// 브라우저에 음성 읽기가 없으면 묶음째 숨긴다
$('groupTts').textContent = S.groupTts;
$('setTtsBtnLabel').textContent = S.ttsButton;
$('setTtsBtnHint').textContent = S.ttsButtonHint;
$('setTtsReadLabel').textContent = S.ttsReadCheck;
$('setTtsReadHint').textContent = S.ttsReadCheckHint;
$('setTtsVoiceLabel').textContent = S.ttsVoice;
$('setTtsInstallLabel').textContent = S.ttsInstall;
$('setTtsInstallHint').textContent = S.ttsInstallHint;
$('setTtsVoice').addEventListener('click', () => openVoiceBox());
$('setTtsInstall').addEventListener('click', () => openHelp('helpVoices'));
if (!synth) {
  for (const id of ['groupTts', 'setTtsBtn', 'setTtsRead']) $(id).closest('h3, label').hidden = true;
  $('setTtsVoice').hidden = $('setTtsInstall').hidden = true;
}
$('setTtsBtn').addEventListener('change', (e) => {
  prefs.ttsButton = e.target.checked;
  savePrefs();
  if (!e.target.checked) ttsStop(); // 앱: 끄면 오디오 기능을 쓰지 않는다
  showTtsBtn();
});
$('setTtsRead').addEventListener('change', (e) => {
  prefs.ttsReadCheck = e.target.checked;
  savePrefs();
});
$('setNavPos').append(...NAV_POSITIONS.map((p) => option(p, S.navPositions[p])));
$('setNavPos').addEventListener('change', (e) => {
  prefs.navPos = e.target.value;
  savePrefs();
  updateSideNav();
});
updateSideNav();
// 아래쪽 이동 버튼이 책·장 바에 가리지 않게 바 높이를 --bar-h로 알린다(폭에 따라 한 줄/두 줄로 바뀐다)
new ResizeObserver(([e]) => {
  root.style.setProperty('--bar-h', `${Math.ceil(e.borderBoxSize?.[0]?.blockSize ?? e.target.offsetHeight)}px`);
}).observe(document.querySelector('.bar'));

// ---- 글자 크기(본문화면설정) ----
$('smaller').addEventListener('click', () => changeFont(-FONT_STEP));
$('larger').addEventListener('click', () => changeFont(FONT_STEP));

document.addEventListener('keydown', (e) => {
  if (anyDialogOpen() || e.altKey || e.ctrlKey || e.metaKey) return;
  if (e.key === 'Escape' && selected.size) {
    clearSelection();
    return;
  }
  // 입력 칸·선택 상자에서는 화살표가 그 안에서 움직인다
  if (e.target instanceof HTMLInputElement || e.target instanceof HTMLSelectElement
    || e.target instanceof HTMLTextAreaElement) return;
  if (e.key === 'ArrowLeft') goChapter('prev');
  else if (e.key === 'ArrowRight') goChapter('next');
});

// ---- 시작 ----
async function start() {
  // 받은 역본과 (나중의) 사용자 데이터를 브라우저가 함부로 지우지 않게 요청한다
  navigator.storage?.persist?.().catch(() => {});
  applyFont();
  setStatus('');
  await loadVerOrder();
  await loadVersionList();
  if (location.hash !== formatHash(pos)) history.replaceState(null, '', formatHash(pos));
  render();
}

/**
 * 역본 순서·색을 읽는다(ver_setting). 앱 Util.getOrderedVerCodeAndTextColor처럼 대조 보기의 단 차례, 역본 고르기 목록,
 * 역본별 글자색에 쓴다. 바뀌었으면 true(다시 그려야 함). DB를 못 읽으면 예전 순서 그대로
 */
async function loadVerOrder() {
  let rows = [];
  try {
    rows = await allVerSettings();
  } catch (e) {
    console.warn('ver_setting unavailable', e);
  }
  const next = verOrderMap(rows);
  const key = (m) => JSON.stringify([...m]);
  const changed = key(next) !== key(verOrder);
  verOrder = next;
  return changed;
}

// ---- 설치·업데이트 ----
// 위쪽 알림 바에 지금 보이는 것: 'update'(새 버전) | 'blocked'(다른 탭이 DB를 잡고 있음) | 'backup'(오래 백업 안 함).
// 백업 알림은 가장 낮다: 다른 알림을 덮지 않고, 다른 알림이 오면 비킨다(새로 고침·탭 닫기가 먼저라서)
let updateBarKind = null;

function showUpdateBar(kind, text) {
  updateBarKind = kind;
  $('updateText').textContent = kind === 'blocked' ? S.dbBlocked : kind === 'backup' ? text : S.updateReady;
  $('updateBtn').textContent = kind === 'backup' ? S.reminderBackup : S.updateApply;
  $('updateBtn').hidden = kind === 'blocked'; // 막힘은 다른 탭을 닫으면 저절로 풀린다. 누를 것이 없다
  $('updateLater').textContent = S.reminderLater;
  $('updateLater').hidden = kind !== 'backup';
  $('updateBar').hidden = false;
}

function hideUpdateBar() {
  updateBarKind = null;
  $('updateBar').hidden = true;
}

const sw = registerServiceWorker(() => showUpdateBar('update'));
$('updateBtn').addEventListener('click', () => {
  if (updateBarKind === 'backup') openBackupBox();
  else sw.applyUpdate();
});
$('updateLater').addEventListener('click', () => {
  saveBackupState({ snooze: Date.now() + SNOOZE_DAYS * DAY });
  hideUpdateBar();
});

/** 오래 백업하지 않았으면 위쪽에 알린다(backupReminder). 앱을 열 때 한 번, 화면을 그린 뒤 조금 있다가 */
async function checkBackupReminder() {
  if (updateBarKind) return;
  try {
    const due = backupReminder(await allUserData(), {
      lastBackup: backupState().at, snoozeUntil: backupState().snooze, lastSync: syncApi.lastSyncAt(),
    });
    if (due && !updateBarKind) showUpdateBar('backup', due.never ? S.reminderNever : S.reminderDays(due.days));
  } catch (e) {
    console.warn('backup reminder', e); // DB가 막힌 경우 등. 그 알림이 따로 뜬다
  }
}

// 개인 데이터 DB를 열다 생긴 일(userStore.onDbNotice). 새 버전 알림이 떠 있으면 그것을 덮지 않는다(새로 고치면 다 풀리므로)
onDbNotice((kind) => {
  if (kind === 'newer') showUpdateBar('update');
  else if (kind === 'blocked' && updateBarKind !== 'update') showUpdateBar('blocked');
  else if (kind === 'opened' && updateBarKind === 'blocked') {
    hideUpdateBar();
    loadHighlights(); // 기다리던 사이 그린 장은 메모·형광펜 없이 그려졌을 수 있다
    loadMemos();
    updateReadCheck();
  }
});

start();
setTimeout(checkBackupReminder, 3000);
