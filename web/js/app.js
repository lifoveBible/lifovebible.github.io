// 읽기 화면: 책·장 고르기, 본문, 이전/다음 장, 글자 크기, 마지막 읽은 곳 기억(2단계),
// 역본 고르기와 대조 보기(3단계), 성경 파일 수동 넣기, 검색(4단계).

import { parseBibleList } from './biblelist.js';
import { LfaFile } from './lfa.js';
import { readChapter } from './chapterLines.js';
import {
  CHAPTERS, OT_COUNT, BOOK_COUNT, bookNames, isValidPosition,
  nextChapter, prevChapter, parseHash, formatHash,
} from './books.js';
import { getLfa, cachedUrls, deleteLfa, pruneLfa } from './lfaStore.js';
import { registerServiceWorker } from './pwa.js';
import { alignChapters, toggleCode, groupByLang, versionsLabel } from './compare.js';
import { pickLang, stringsFor } from './strings.js';
import { groupFiles, prepareGroup, openRecord, mergeLocal, classifyName } from './localBible.js';
import { listLocal, getLocal, putLocal, deleteLocal } from './localStore.js';
import {
  THEMES, booksOfRange, normalizeQuery, checkQuery, searchText, readJobs, highlightParts, sortResults,
} from './search.js';

const DATA_ROOT = 'https://lifovebible.github.io/data/';
const PREFS_KEY = 'lifove.reading';
// 받은 biblelist.txt 원문. 오프라인일 때 역본 고르기 창에 쓴다(6KB 남짓)
const LIST_KEY = 'lifove.biblelist';
// 처음 쓸 때 역본. 앱은 받은 역본 중 첫째를 쓰지만 웹은 받은 것이 없으므로 언어로 정한다
const DEFAULT_VERSION = { ko: 'korhrv', en: 'engkjv' };
const FONT_MIN = 14, FONT_MAX = 36, FONT_STEP = 2, FONT_DEFAULT = 18;

const lang = pickLang(navigator.languages || [navigator.language]);
const S = stringsFor(lang);
const NAMES = bookNames(lang);
document.documentElement.lang = lang;

const $ = (id) => document.getElementById(id);
const $versionBtn = $('versionBtn'), $status = $('status'), $verses = $('verses');
const $ref = $('ref'), $prev = $('prev'), $next = $('next');
const $prevTop = $('prevTop'), $nextTop = $('nextTop');
const $picker = $('picker'), $pickerTitle = $('pickerTitle');
const $pickerBody = $('pickerBody'), $pickerBack = $('pickerBack');
const $verPicker = $('verPicker'), $verList = $('verList'), $verOk = $('verOk');
const $verNote = $('verNote'), $oneColumn = $('oneColumn');

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
  try {
    localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
  } catch { /* 저장 못 해도 읽기는 된다 */ }
}

const prefs = loadPrefs();
// prefs: { pos: {book, chapter}, fontSize, versions: [{code, url, name, lang}], oneColumn }

// ---- 상태 ----
let pos = parseHash(location.hash) || (isValidPosition(prefs.pos) ? prefs.pos : { book: 0, chapter: 1 });
let serverList = []; // 서버 역본 목록
let localList = []; // 직접 넣은 역본(내용 없이)
let versionList = []; // 둘을 합친 것(고르기 창에 보임). mergeLocal 참고
const opened = new Map(); // url → LfaFile. 지금 고른 역본만 메모리에 둔다
const opening = new Map(); // url → Promise<LfaFile>. 받는 중(같은 파일을 두 번 받지 않게)
const downloads = new Map(); // url → {name, got, total}. 받는 중 진행률 표시
let renderSeq = 0; // 빠르게 장을 넘길 때 늦게 끝난 옛 결과를 버리려고
let pendingVerse = null; // 검색 결과에서 왔을 때 그린 뒤 보여 줄 절 {book, chapter, verse}

function setStatus(text, isError = false) {
  $status.textContent = text;
  $status.classList.toggle('error', isError);
  $status.hidden = !text;
}

// ---- 문구 채우기 ----
$prev.textContent = '◀ ' + S.prev;
$next.textContent = S.next + ' ▶';
// 파이어폭스 119 전에는 el.ariaLabel 속성이 없어서 setAttribute로 넣는다
function label(el, text) {
  el.title = text;
  el.setAttribute('aria-label', text);
}
label($prevTop, S.prev);
label($nextTop, S.next);
label($('smaller'), S.textSize + ' ' + S.smaller);
label($('larger'), S.textSize + ' ' + S.larger);
$('fontGroup').setAttribute('aria-label', S.textSize);
label($('pickerClose'), S.close);
label($('verClose'), S.close);
$pickerBack.textContent = '◀ ' + S.backToBooks;
$('verTitle').textContent = S.pickVersions;
$('verHint').textContent = S.pickVersionsHint;
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
}

function changeFont(delta) {
  const now = Number.isFinite(prefs.fontSize) ? prefs.fontSize : FONT_DEFAULT;
  prefs.fontSize = Math.min(FONT_MAX, Math.max(FONT_MIN, now + delta));
  savePrefs();
  applyFont();
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
  $verNote.textContent = S.listOld;
  $verNote.hidden = !old;
  // 목록을 못 받았으면 고른 역본 중 서버 것만이라도(보관본이 있으면 읽을 수 있다)
  serverList = list.length ? list : prefs.versions.filter((v) => !v.local);
  // 서버 목록에서 빠진 역본의 받아 둔 파일은 지운다. 새 목록을 받았을 때만(오프라인 목록으로는 지우지 않는다)
  if (!old && list.length) pruneLfa(list.map((v) => v.url)).catch((e) => console.warn('prune failed', e));
  localList = await listLocal();
  versionList = mergeLocal(serverList, localList);
  // 고른 역본을 목록 기준으로 고친다(서버에서 주소·이름이 바뀌었을 수 있다). 목록에서 빠진 것은 뺀다
  syncPrefsVersions();
}

/** 목록(versionList)이 바뀐 뒤 고른 역본을 맞춘다. 없어진 것은 빼고, 다 빠지면 처음 역본 */
function syncPrefsVersions() {
  prefs.versions = prefs.versions.map((v) => versionList.find((x) => x.code === v.code)).filter(Boolean);
  if (!prefs.versions.length && versionList.length) {
    prefs.versions = [versionList.find((v) => v.code === DEFAULT_VERSION[lang]) || versionList[0]];
  }
  savePrefs();
  updateVersionButton();
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

function updateVersionButton() {
  const names = prefs.versions.map((v) => v.name);
  $versionBtn.textContent = (versionsLabel(names) || S.version) + ' ▾';
  label($versionBtn, S.pickVersions + (names.length ? ': ' + names.join(', ') : ''));
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

// ---- 본문 ----
async function render() {
  const seq = ++renderSeq;
  const name = NAMES[pos.book];
  $ref.textContent = S.ref(name, pos.chapter) + ' ▾';
  document.title = S.ref(name, pos.chapter) + ' - Lifove Bible';
  const prev = prevChapter(pos), next = nextChapter(pos);
  $prev.disabled = $prevTop.disabled = !prev;
  $next.disabled = $nextTop.disabled = !next;

  prefs.pos = pos;
  savePrefs();

  const vers = prefs.versions;
  if (!vers.length) return; // 목록을 못 받았다. 오류는 이미 보였다
  // 한 역본이 실패해도 나머지는 보이게 따로따로 기다린다
  const results = await Promise.allSettled(vers.map((v) => chapterRows(v, pos)));
  if (seq !== renderSeq) return;

  const errors = [];
  const chapters = results.map((r, i) => {
    if (r.status === 'fulfilled') return r.value;
    errors.push((vers.length > 1 ? vers[i].name + ': ' : '') + r.reason.message);
    return r.reason.partial?.length ? r.reason.partial : null;
  });

  if (vers.length === 1) {
    $verses.className = '';
    $verses.replaceChildren(...(chapters[0] || []).map(verseItem));
  } else {
    $verses.className = 'compare ' + (prefs.oneColumn ? 'one' : 'two');
    const names = vers.map((v) => v.name);
    $verses.replaceChildren(...alignChapters(chapters, S.missingVerse).map((r) => compareItem(r, names)));
  }

  if (errors.length) setStatus(S.loadFailed + ': ' + errors.join(', '), true);
  else if (!$verses.childElementCount) setStatus(S.noChapter);
  else setStatus('');
  showPendingVerse();
}

/** 검색 결과에서 왔으면 그 절로 스크롤하고 잠깐 칠한다. 아니면 맨 위로 */
function showPendingVerse() {
  const p = pendingVerse;
  pendingVerse = null;
  const li = p && p.book === pos.book && p.chapter === pos.chapter ? $('v' + p.verse) : null;
  if (!li) {
    window.scrollTo(0, 0);
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
  r.cells.forEach((c, i) => {
    const cell = document.createElement('div');
    cell.className = 'cell';
    const vname = document.createElement('span');
    vname.className = 'vname';
    vname.textContent = names[i];
    cell.append(vname, ' ', verseText(c.text, c.missing));
    cells.append(cell);
  });
  li.append(verseNum(r.verse), ' ', cells);
  return li;
}

/** 위치를 바꾼다. 주소 뒤 #책:장을 바꾸면 hashchange에서 그린다(뒤로 가기가 되게) */
function go(newPos) {
  if (!newPos) return;
  const hash = formatHash(newPos);
  if (location.hash === hash) render();
  else location.hash = hash;
}

window.addEventListener('hashchange', () => {
  const p = parseHash(location.hash);
  if (!p) return;
  pos = p;
  render();
});

// ---- 책·장 고르기 ----
function openPicker() {
  $picker.showModal();
  showBooks(); // 열린 뒤에 그려야 지금 책으로 스크롤이 된다
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
}

function pick(p) {
  $picker.close();
  go(p);
}

$ref.addEventListener('click', openPicker);
$pickerBack.addEventListener('click', showBooks);
$('pickerClose').addEventListener('click', () => $picker.close());
// 바깥(배경)을 누르면 닫는다. 대화 상자 안쪽을 누르면 target이 안쪽 요소다
$picker.addEventListener('click', (e) => { if (e.target === $picker) $picker.close(); });

// ---- 역본 고르기 ----
// 앱의 역본대조보기 창처럼 체크 목록. 하나면 그 역본만, 여럿이면 대조 보기.
// 앱은 받아 둔 역본만 보이지만 웹은 서버 목록 전체를 보이고 고르면 받는다(받은 것은 "받음" 표시)
let draft = []; // 창에서 고르는 중인 코드들(순서대로). 확인을 눌러야 적용

async function openVerPicker() {
  draft = prefs.versions.map((v) => v.code);
  showImportNote('');
  $oneColumn.checked = !!prefs.oneColumn;
  $verList.replaceChildren();
  $verPicker.showModal();
  await drawVerList();
}

async function drawVerList() {
  const cached = await cachedUrls();
  const langNames = typeof Intl.DisplayNames === 'function'
    ? new Intl.DisplayNames([lang], { type: 'language' }) : null;
  const langName = (code) => {
    try { return langNames?.of(code) || code; } catch { return code || '?'; }
  };
  const parts = [];
  // 서버에 없는 직접 넣은 역본(언어 '')은 맨 앞 "직접 넣은 역본" 묶음
  const groups = groupByLang(versionList, lang);
  groups.sort((a, b) => (a.lang === '' ? 0 : 1) - (b.lang === '' ? 0 : 1));
  for (const g of groups) {
    const h = document.createElement('h3');
    h.textContent = g.lang === '' ? S.localGroup : langName(g.lang);
    const ul = document.createElement('ul');
    ul.className = 'ver-list';
    for (const v of g.items) ul.append(verRow(v, cached.has(v.url)));
    parts.push(h, ul);
  }
  $verList.replaceChildren(...parts);
  updateDraft();
}

function verRow(v, isCached) {
  const li = document.createElement('li');
  li.dataset.code = v.code;
  const lab = document.createElement('label');
  const box = document.createElement('input');
  box.type = 'checkbox';
  box.checked = draft.includes(v.code);
  box.addEventListener('change', () => {
    draft = toggleCode(draft, v.code, box.checked);
    updateDraft();
  });
  const order = document.createElement('span');
  order.className = 'order';
  const name = document.createElement('span');
  name.className = 'name';
  name.textContent = v.name;
  lab.append(box, order, name);
  li.append(lab);
  if (v.local) {
    const badge = document.createElement('span');
    badge.className = 'badge';
    badge.textContent = S.localBadge;
    const del = document.createElement('button');
    del.className = 'icon del';
    del.textContent = '🗑';
    label(del, S.delete + ' ' + v.name);
    del.addEventListener('click', async () => {
      if (!confirm(S.deleteLocalConfirm(v.name))) return;
      await deleteLocal(v.code);
      const changed = await reloadLocal();
      // 서버에도 있는 역본이면 서버 항목으로 남는다. 없으면 고르던 목록에서도 빠진다
      draft = draft.filter((c) => versionList.some((x) => x.code === c));
      await drawVerList();
      if (changed) render();
    });
    li.append(badge, del);
  } else if (isCached) {
    const badge = document.createElement('span');
    badge.className = 'badge';
    badge.textContent = S.downloaded;
    const del = document.createElement('button');
    del.className = 'icon del';
    del.textContent = '🗑';
    label(del, S.delete + ' ' + v.name);
    del.addEventListener('click', async () => {
      if (!confirm(S.deleteConfirm(v.name))) return;
      await deleteLfa(v.url);
      opened.delete(v.url);
      badge.remove();
      del.remove();
    });
    li.append(badge, del);
  }
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
  updateVersionButton();
  $verses.replaceChildren();
  render();
}

$versionBtn.addEventListener('click', openVerPicker);

// ---- 성경 파일 수동 넣기 ----
// 파일 고르기, 폴더 고르기, 끌어다 놓기 모두 importItems로 모인다.
// 넣기 전에 검사하고(localBible.prepareGroup), IndexedDB에 보관한다(localStore.js)
let importing = false;

function showImportNote(text, isError = false) {
  const note = $('importNote');
  note.textContent = text;
  note.classList.toggle('error', isError);
  note.hidden = !text;
}

/** @param {{path: string, file: File}[]} items */
async function importItems(items) {
  if (importing) return;
  if (!$verPicker.open) await openVerPicker(); // 결과와 넣은 역본을 바로 보이려고
  const { groups } = groupFiles(items);
  if (!groups.length) {
    showImportNote(S.importNone, true);
    return;
  }
  importing = true;
  showImportNote(S.importing);
  const added = [], failed = [];
  try {
    for (const g of groups) {
      const fileLabel = g.kind === 'lfa' ? g.files[0].path.split(/[\\/]/).pop() : g.code + '.bdf';
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
  }
  const changed = await reloadLocal();
  const names = added.map((c) => versionList.find((v) => v.code === c)?.name || c);
  const lines = [];
  if (names.length) lines.push(S.imported(names.join(', ')));
  if (failed.length) lines.push(S.importFailed(failed.join(', ')));
  await drawVerList();
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
function setDropping(on) {
  // 열린 대화 상자(top layer) 위에는 덮개가 올라가지 않으므로 그때는 창 테두리로 보인다
  $drop.hidden = !on || $verPicker.open || $picker.open || $search.open;
  $verPicker.classList.toggle('dropping', on && $verPicker.open);
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
  if ($picker.open) $picker.close();
  if ($search.open) $search.close();
  importItems(await filesFromDrop(e.dataTransfer));
});
$verOk.addEventListener('click', applyVersions);
$('verCancel').addEventListener('click', () => $verPicker.close());
$('verClose').addEventListener('click', () => $verPicker.close());
$verPicker.addEventListener('click', (e) => { if (e.target === $verPicker) $verPicker.close(); });

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
    pendingVerse = { book: r.book, chapter: r.chapter, verse: r.verse };
    go({ book: r.book, chapter: r.chapter });
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

// ---- 이동 ----
$prev.addEventListener('click', () => go(prevChapter(pos)));
$next.addEventListener('click', () => go(nextChapter(pos)));
$prevTop.addEventListener('click', () => go(prevChapter(pos)));
$nextTop.addEventListener('click', () => go(nextChapter(pos)));
$('smaller').addEventListener('click', () => changeFont(-FONT_STEP));
$('larger').addEventListener('click', () => changeFont(FONT_STEP));

document.addEventListener('keydown', (e) => {
  if ($picker.open || $verPicker.open || $search.open || e.altKey || e.ctrlKey || e.metaKey) return;
  // 입력 칸·선택 상자에서는 화살표가 그 안에서 움직인다
  if (e.target instanceof HTMLInputElement || e.target instanceof HTMLSelectElement) return;
  if (e.key === 'ArrowLeft') go(prevChapter(pos));
  else if (e.key === 'ArrowRight') go(nextChapter(pos));
});

// ---- 시작 ----
async function start() {
  // 받은 역본과 (나중의) 사용자 데이터를 브라우저가 함부로 지우지 않게 요청한다
  navigator.storage?.persist?.().catch(() => {});
  applyFont();
  setStatus('');
  updateVersionButton(); // 목록을 받기 전에도 저장해 둔 역본 이름을 보인다
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
