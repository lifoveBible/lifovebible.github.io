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
  alignChapters, toggleCode, groupByLang, isCached, pickableVersions, fallbackVersions,
} from './compare.js';
import { pickLang, stringsFor } from './strings.js';
import { PRESETS, validColor, presetOf } from './viewColors.js';
import {
  NAV_OPTIONS, NAV_DEFAULT, navButtons, NAV_UNITS, NAV_UNIT_DEFAULT, NAV_POSITIONS, navPosition,
  loadHistory, jumpHistory, updateHistory, stepHistory, canBack, canForward,
} from './navBar.js';
import { swipeDirection } from './swipe.js';
import { groupFiles, prepareGroup, openRecord, mergeLocal, classifyName } from './localBible.js';
import { listLocal, getLocal, putLocal, deleteLocal } from './localStore.js';
import { readSet, isRead, readChaptersOf, readStats, percent } from './readCheck.js';
import { readChecksOf, versWithReadChecks, setReadCheck, clearReadChecks } from './userStore.js';
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
const DEFAULT_VERSION = { ko: 'korhrv', en: 'engkjv' };
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
//          swipeChapter(옆으로 밀어 장 넘기기. 없으면 켬) }
// started: 역본을 한 번이라도 골랐다. 처음 쓰는 사람에게만 기본 역본을 받아 주려고(syncPrefsVersions).
// 시작할 때 한 번만 보면 첫 방문에서 다 지웠을 때 또 받아 버려서 그때그때 본다

// ---- 상태 ----
let pos = parseHash(location.hash) || (isValidPosition(prefs.pos) ? prefs.pos : { book: 0, chapter: 1 });
let serverList = []; // 서버 역본 목록
let localList = []; // 직접 넣은 역본(내용 없이)
let versionList = []; // 둘을 합친 것. mergeLocal 참고
let cachedSet = new Set(); // 받아 둔 .lfa 주소(refreshCached)
let cacheOk = true; // 받아 둘 수 있는 주소인가(Cache Storage)
let listOld = false; // 서버 목록을 새로 받지 못해 전에 받은 목록을 쓰는 중
const opened = new Map(); // url → LfaFile. 지금 고른 역본만 메모리에 둔다
const opening = new Map(); // url → Promise<LfaFile>. 받는 중(같은 파일을 두 번 받지 않게)
const downloads = new Map(); // url → {name, got, total}. 받는 중 진행률 표시
let renderSeq = 0; // 빠르게 장을 넘길 때 늦게 끝난 옛 결과를 버리려고
let pendingVerse = null; // 검색 결과에서 왔을 때 그린 뒤 보여 줄 절 {book, chapter, verse}
let slideDir = null; // 'next'|'prev'. 이전/다음 장으로 왔으면 그린 뒤 그쪽에서 들어오게(playSlide)

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
  prefs.versions = prefs.versions.map((v) => versionList.find((x) => x.code === v.code)).filter(Boolean);
  if (!prefs.versions.length) {
    prefs.versions = fallbackVersions(versionList, cachedSet, cacheOk, DEFAULT_VERSION[lang], !prefs.started);
  }
  savePrefs();
}

/** 넣거나 지운 뒤 목록을 다시 만든다. 지금 보는 역본의 읽을 곳이 바뀌었으면 true(다시 그려야 함) */
async function reloadLocal() {
  localList = await listLocal();
  versionList = mergeLocal(serverList, localList);
  // 같은 코드라도 넣은 파일 ↔ 서버 파일로 url이 바뀐다. 열어 둔 것은 다시 연다(보관본에서 금방 열린다)
  opened.clear();
  const before = prefs.versions.map((v) => v.url).join();
  syncPrefsVersions();
  return before !== prefs.versions.map((v) => v.url).join();
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
  const name = NAMES[pos.book];
  $ref.textContent = name;
  $chapterBtn.textContent = pos.chapter; // 앱처럼 숫자만("장"을 붙이면 폰 폭에서 책 이름 칸이 좁아진다)
  fitRef();
  document.title = S.ref(name, pos.chapter) + ' - Lifove Bible';

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
  if (vers.length === 1) {
    $verses.className = '';
    $verses.replaceChildren(...(chapters[0] || []).map(verseItem));
  } else {
    $verses.className = 'compare ' + (prefs.oneColumn ? 'one' : 'two');
    const names = vers.map((v) => v.name);
    $verses.replaceChildren(...alignChapters(chapters, S.missingVerse).map((r) => compareItem(r, names)));
  }
  playSlide(slide);

  if (errors.length) setStatus(S.loadFailed + ': ' + errors.join(', '), true);
  else if (!$verses.childElementCount) setStatus(S.noChapter);
  else setStatus('');
  showPendingVerse();
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
  li.scrollIntoView({ block: 'center' });
  li.classList.remove('flash');
  void li.offsetWidth; // 같은 절을 또 눌러도 다시 칠해지게
  li.classList.add('flash');
}

function verseNum(verse) {
  const num = document.createElement('span');
  num.className = 'num';
  num.textContent = verse;
  return num;
}

function verseText(text, missing) {
  const body = document.createElement('span');
  if (missing) body.className = 'missing';
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
function compareItem(r, names) {
  const li = document.createElement('li');
  li.id = 'v' + r.verse;
  const cells = document.createElement('div');
  cells.className = 'cells';
  // 절 번호는 역본 칸마다 붙인다(사용자 요청). 여러 단에서 오른쪽·아래 칸도 몇 절인지 바로 보이게.
  // 칸 안에서 번호와 본문을 나눠(단일 보기와 같게) 본문이 여러 줄이어도 번호 밑으로 들어가지 않는다
  r.cells.forEach((c, i) => {
    const cell = document.createElement('div');
    cell.className = 'cell';
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
}
applyView();

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

function openSettings() {
  $('setBarBottom').checked = !prefs.barTop;
  $('setOneColumn').checked = !!prefs.oneColumn;
  $('setVerName').checked = !!prefs.showVerName;
  $('setNavBar').value = String(NAV_OPTIONS.includes(prefs.navBar) ? prefs.navBar : NAV_DEFAULT);
  $('setNavUnit').value = NAV_UNITS.includes(prefs.navUnit) ? prefs.navUnit : NAV_UNIT_DEFAULT;
  $('setNavPos').value = navPosition(prefs.navPos);
  $('setSwipe').checked = prefs.swipeChapter !== false;
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

// ---- 메뉴 ----
// 앱의 옵션 메뉴처럼 오른쪽 위 ☰. 받기·넣기는 여기서만 한다(본문 화면의 역본 고르기는 받은 것만)
function openMenu() {
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
$('menuSettings').addEventListener('click', fromMenu(openSettings));
$('menuOneVersion').addEventListener('click', fromMenu(() => openVerPicker('one')));
$('menuVersions').addEventListener('click', fromMenu(() => openVerPicker('multi')));
$('menuStats').addEventListener('click', fromMenu(openStats));
$('menuSearch').addEventListener('click', fromMenu(openSearch));
$('menuHelp').addEventListener('click', fromMenu(openHelp));
// 메뉴 밖(배경)을 누르면 닫는다
$menu.addEventListener('click', (e) => { if (e.target === $menu) $menu.close(); });

// ---- 도움말 ----
// 내용은 help/<언어>.html(우리 파일이라 innerHTML로 넣는다). 앱 파일로 캐시되어 오프라인에서도 열린다.
// 한 번 넣으면 다시 받지 않는다(펼친 항목도 그대로 둔다)
const $helpBox = $('helpBox'), $helpBody = $('helpBody');
let helpLoaded = false;

async function openHelp() {
  $helpBox.showModal();
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
  const list = pickableVersions(versionList, cachedSet, prefs.versions.map((v) => v.code), cacheOk);
  $verList.replaceChildren(...groupedList(list, verRow));
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

/** 고른 순서 번호(둘 이상일 때만)와 확인 버튼 */
function updateDraft() {
  for (const li of $verList.querySelectorAll('li')) {
    const i = draft.indexOf(li.dataset.code);
    li.querySelector('.order').textContent = draft.length > 1 && i >= 0 ? i + 1 : '';
  }
  $verOk.disabled = !draft.length; // 앱처럼 하나는 꼭 골라야 한다
}

function applyVersions() {
  const chosen = draft.map((c) => versionList.find((v) => v.code === c)).filter(Boolean);
  if (!chosen.length) return;
  prefs.versions = chosen;
  prefs.oneColumn = $oneColumn.checked;
  savePrefs();
  // 고르지 않은 역본은 메모리에서 내린다(파일 하나가 2~15MB)
  for (const url of [...opened.keys()]) {
    if (!chosen.some((v) => v.url === url)) opened.delete(url);
  }
  $verPicker.close();
  $verses.replaceChildren();
  render();
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

async function openDownload() {
  if (!dlRun) {
    dlChecked = new Set();
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
  return prefs.barTop ? { top: r.bottom, bottom: innerHeight } : { top: 0, bottom: r.top };
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
function jumpTo(p, verse) {
  saveHistory(jumpHistory(hist, here(), { ...p, verse: verse || 1 }));
  if (verse) pendingVerse = { book: p.book, chapter: p.chapter, verse, flash: true };
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
  // 입력 칸·선택 상자에서는 화살표가 그 안에서 움직인다
  if (e.target instanceof HTMLInputElement || e.target instanceof HTMLSelectElement) return;
  if (e.key === 'ArrowLeft') goChapter('prev');
  else if (e.key === 'ArrowRight') goChapter('next');
});

// ---- 시작 ----
async function start() {
  // 받은 역본과 (나중의) 사용자 데이터를 브라우저가 함부로 지우지 않게 요청한다
  navigator.storage?.persist?.().catch(() => {});
  applyFont();
  setStatus('');
  await loadVersionList();
  if (location.hash !== formatHash(pos)) history.replaceState(null, '', formatHash(pos));
  render();
}

// ---- 설치·업데이트 ----
const sw = registerServiceWorker(() => {
  $('updateText').textContent = S.updateReady;
  $('updateBtn').textContent = S.updateApply;
  $('updateBar').hidden = false;
});
$('updateBtn').addEventListener('click', () => sw.applyUpdate());

start();
