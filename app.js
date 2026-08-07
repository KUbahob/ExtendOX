/* =============================================================================
   ExtendOX — a Tic-Tac-Toe variation played on a board that keeps growing.
   Pure static app: no build step, no dependencies. Just open index.html.
   ============================================================================= */
'use strict';

/* ------------------------------- constants -------------------------------- */
const RED  = '#EA5A47';   // Player X (cross)
const BLUE = '#4472C4';   // Player O (circle)
const BASE_CELL = 62;     // the design cell size — also the maximum zoom-in level
const NOTICE_GAP = 12;    // clearance kept between the board and the bottom note
const MIN_TOUCH = 44;     // below this cell size zoom & drag are offered

/* playing modes — each one sets the win length and its own board-size defaults */
const MODES = {
  fast:    { label: 'Fast',    win: 4, w: 10, h: 10, min: 5 },
  classic: { label: 'Classic', win: 5, w: 15, h: 15, min: 10 },
  pro:     { label: 'Pro',     win: 6, w: 25, h: 25, min: 15 },
};
const MODE_KEYS = Object.keys(MODES);

/* editable number fields */
const NUM = {
  minutes: { key: 'minutes', min: 1, max: 60, def: 5 },
  maxW:    { key: 'maxW',    min: 3, max: 25, def: 10 },
  maxH:    { key: 'maxH',    min: 3, max: 25, def: 10 },
};

const $app = document.getElementById('app');

/* ============================== icons =====================================
   Every path below is taken verbatim from "Mobile Game Design/Icons/*.svg".
   The two-colour icons exist in the folder as a red and a blue file with
   identical geometry, so they are drawn once with `currentColor` and tinted by
   the caller. The three large assets (app mark, wordmark, party popper) are
   used as files from ./icons/.
   Only the chevrons, the caret and the zoom +/- are not in the folder; they are
   drawn in the same 24 px / stroke-2 / round-cap style.
   ========================================================================== */
const svg = (size, vb, body, cls) =>
  `<svg class="${cls || ''}" width="${size}" height="${size}" viewBox="${vb}" fill="none" aria-hidden="true">${body}</svg>`;

const p = (d, w) =>
  `<path d="${d}" stroke="currentColor" stroke-width="${w || 2}" stroke-linecap="round" stroke-linejoin="round"/>`;

/* Several source icons sit slightly off-centre inside their own viewBox (their
   drawn ink is not symmetric about the middle). Shifting the artwork by the
   measured difference centres it in the button without altering the shape. */
const nudge = (dx, dy, body) => `<g transform="translate(${dx} ${dy})">${body}</g>`;

const IC = {
  /* Home.svg */
  home: (s = 24) => svg(s, '0 0 24 24', p(
    'M20 17.3425V11.7945C20 11.2605 20 10.9935 19.935 10.7445C19.8775 10.5244 19.7828 10.3157 19.655 10.1275C19.51 9.9145 19.31 9.7375 18.907 9.3865L14.107 5.1865C13.361 4.5335 12.987 4.2065 12.567 4.0825C12.197 3.9725 11.803 3.9725 11.432 4.0825C11.012 4.2065 10.64 4.5325 9.894 5.1845L5.093 9.3865C4.691 9.7385 4.49 9.9145 4.346 10.1265C4.2178 10.315 4.12276 10.524 4.065 10.7445C4 10.9925 4 11.2605 4 11.7945V17.3425C4 18.2745 4 18.7405 4.152 19.1075C4.2524 19.3502 4.39963 19.5708 4.58528 19.7566C4.77093 19.9424 4.99137 20.0899 5.234 20.1905C5.602 20.3425 6.068 20.3425 7 20.3425C7.932 20.3425 8.398 20.3425 8.766 20.1905C9.00863 20.0899 9.22907 19.9424 9.41472 19.7566C9.60037 19.5708 9.7476 19.3502 9.848 19.1075C10 18.7405 10 18.2745 10 17.3425V16.3425C10 15.8121 10.2107 15.3034 10.5858 14.9283C10.9609 14.5532 11.4696 14.3425 12 14.3425C12.5304 14.3425 13.0391 14.5532 13.4142 14.9283C13.7893 15.3034 14 15.8121 14 16.3425V17.3425C14 18.2745 14 18.7405 14.152 19.1075C14.2524 19.3502 14.3996 19.5708 14.5853 19.7566C14.7709 19.9424 14.9914 20.0899 15.234 20.1905C15.602 20.3425 16.068 20.3425 17 20.3425C17.932 20.3425 18.398 20.3425 18.766 20.1905C19.0086 20.0899 19.2291 19.9424 19.4147 19.7566C19.6004 19.5708 19.7476 19.3502 19.848 19.1075C20 18.7405 20 18.2745 20 17.3425Z')),

  /* Settings.svg */
  sliders: (s = 24) => svg(s, '0 0 24 24', p(
    'M10 18H21M3 18H6M6 18V20M6 18V16M20 12H21M3 12H16M16 12V14M16 12V10M14 6H21M3 6H10M10 6V8M10 6V4')),

  /* Undo.svg */
  undo: (s = 24) => svg(s, '0 0 24 24', nudge(-0.5, 0.5, p(
    'M10 8H5V3M5.291 16.357C6.22285 17.7919 7.59018 18.8902 9.19225 19.4908C10.7943 20.0914 12.5467 20.1625 14.1922 19.6937C15.8376 19.2249 17.2895 18.241 18.3345 16.8863C19.3796 15.5317 19.9628 13.8776 19.9986 12.1671C20.0343 10.4565 19.5208 8.77955 18.5333 7.38238C17.5457 5.9852 16.1363 4.94143 14.5119 4.40429C12.8874 3.86716 11.1336 3.86496 9.50784 4.39802C7.88207 4.93107 6.47002 5.97131 5.479 7.366'))),

  /* ci_bulb.svg */
  bulb: (s = 24) => svg(s, '0 0 24 24', p(
    'M9.00001 21H15M12 3C10.9178 2.99974 9.85562 3.2922 8.92605 3.84639C7.99648 4.40059 7.23412 5.19589 6.7197 6.14805C6.20529 7.10021 5.95799 8.17378 6.00399 9.25503C6.04999 10.3363 6.38758 11.385 6.98101 12.29C7.93501 13.742 8.41101 14.468 8.47401 14.576C9.02401 15.541 8.92301 15.201 8.99201 16.31C9.00001 16.434 9.00001 16.623 9.00001 17C9.00001 17.2652 9.10536 17.5196 9.2929 17.7071C9.48044 17.8946 9.73479 18 10 18H14C14.2652 18 14.5196 17.8946 14.7071 17.7071C14.8947 17.5196 15 17.2652 15 17C15 16.623 15 16.434 15.008 16.31C15.078 15.2 14.975 15.541 15.526 14.576C15.588 14.468 16.066 13.742 17.019 12.289C17.6122 11.384 17.9495 10.3354 17.9954 9.2543C18.0413 8.1732 17.7939 7.09981 17.2795 6.14781C16.7651 5.19581 16.0029 4.40064 15.0735 3.84649C14.1441 3.29235 13.0821 2.99986 12 3Z')),

  /* ci_book-open.svg */
  book: (s = 24) => svg(s, '0 0 24 24', nudge(0, -0.5, p(
    'M12 9.8V20M12 20L11.418 19.128C10.902 18.352 10.643 17.964 10.3 17.682C9.996 17.432 9.643 17.244 9.266 17.13C8.839 17 8.37 17 7.431 17H4.598C4.039 17 3.76 17 3.546 16.891C3.35785 16.7951 3.20487 16.6422 3.109 16.454C3 16.24 3 15.96 3 15.4V6.6C3 6.04 3 5.76 3.109 5.546C3.20487 5.35785 3.35785 5.20487 3.546 5.109C3.76 5 4.04 5 4.6 5H7.2C8.88 5 9.72 5 10.362 5.327C10.9265 5.61462 11.3854 6.07354 11.673 6.638C12 7.28 12 8.12 12 9.8C12 8.12 12 7.28 12.327 6.638C12.6144 6.07369 13.0729 5.61479 13.637 5.327C14.28 5 15.12 5 16.8 5H19.4C19.96 5 20.24 5 20.454 5.109C20.642 5.205 20.794 5.358 20.891 5.546C21 5.76 21 6.04 21 6.6V15.4C21 15.96 21 16.24 20.89 16.454C20.7944 16.642 20.6418 16.795 20.454 16.891C20.241 17 19.961 17 19.402 17H16.569C15.63 17 15.159 17 14.733 17.13C14.3561 17.2444 14.0054 17.4319 13.701 17.682C13.357 17.965 13.096 18.356 12.575 19.137L12 20Z'))),

  /* Red Confetti.svg / Blue Confetti.svg */
  party: (s = 24) => svg(s, '0 0 24 24',
    p('M5.8 11.3L2 22L12.7 18.21M4 3H4.01M22 8H22.01M15 2H15.01M22 20H22.01M22 2L19.76 2.75C19.1224 2.96239 18.5783 3.38964 18.2208 3.95872C17.8633 4.52781 17.7146 5.20339 17.8 5.87C17.9 6.73 17.23 7.5 16.35 7.5H15.97C15.11 7.5 14.37 8.1 14.21 8.94L14 10M22 13L21.18 12.67C20.32 12.33 19.36 12.87 19.2 13.78C19.09 14.48 18.48 15 17.77 15H17M11 2L11.33 2.82C11.67 3.68 11.13 4.64 10.22 4.8C9.52 4.9 9 5.52 9 6.23V7') +
    p('M11 13C12.93 14.93 13.83 17.17 13 18C12.17 18.83 9.92999 17.93 7.99999 16C6.06999 14.07 5.16999 11.83 5.99999 11C6.82999 10.17 9.06999 11.07 11 13Z')),

  /* Add Column Red.svg / Add Column Blue.svg */
  extCol: (s = 24) => svg(s, '0 0 24 24', nudge(1, 0, p(
    'M5 17H8M8 17H11M8 17V14M8 17V20M14 21H15C15.5304 21 16.0391 20.7893 16.4142 20.4142C16.7893 20.0391 17 19.5304 17 19V5C17 4.46957 16.7893 3.96086 16.4142 3.58579C16.0391 3.21071 15.5304 3 15 3H13C12.4696 3 11.9609 3.21071 11.5858 3.58579C11.2107 3.96086 11 4.46957 11 5V11'))),

  /* Add Row Red.svg / Add Row Blue.svg */
  extRow: (s = 24) => svg(s, '0 0 24 24', nudge(0, 1, p(
    'M3 14V15C3 15.5304 3.21071 16.0391 3.58579 16.4142C3.96086 16.7893 4.46957 17 5 17H19C19.5304 17 20.0391 16.7893 20.4142 16.4142C20.7893 16.0391 21 15.5304 21 15V13C21 12.4696 20.7893 11.9609 20.4142 11.5858C20.0391 11.2107 19.5304 11 19 11H13M10 8H7M7 8H4M7 8V5M7 8V11'))),

  /* Group 2.svg (red) / Group 3.svg (blue) */
  extBoth: (s = 28) => svg(s, '0 0 28 28', nudge(-2, -2,
    p('M14 5H25C25.5304 5 26.0349 5.21071 26.41 5.58579C26.7851 5.96086 27 6.46957 27 7V9C27 9.53043 26.7851 10.0391 26.41 10.4142C26.0349 10.7893 25.5304 11 25 11H14') +
    p('M11 8H8M8 8H5M8 8V11M8 8L8 5M5 14L5 25C5 25.5304 5.21071 26.0349 5.58579 26.41C5.96086 26.7851 6.46957 27 7 27H9C9.53043 27 10.0391 26.7851 10.4142 26.41C10.7893 26.0349 11 25.5304 11 25L11 14'))),

  /* Plus.svg */
  plus: (s = 32) => svg(s, '0 0 32 32',
    `<path d="M8 16H16M16 16H24M16 16V24M16 16V8" stroke="#000" stroke-width="2.66667" stroke-linecap="round" stroke-linejoin="round"/>`),

  /* not in the icon folder – drawn to match its style */
  chevL:   (s = 24) => svg(s, '0 0 24 24', nudge(0.5, 0, p('M15 5L8 12L15 19'))),
  chevR:   (s = 24) => svg(s, '0 0 24 24', nudge(-0.5, 0, p('M9 5L16 12L9 19'))),
  caret:   (s = 14) => svg(s, '0 0 24 24', nudge(0, -0.5, p('M6 9.5L12 15.5L18 9.5'))),
  zoomIn:  (s = 22) => svg(s, '0 0 24 24', p('M4 12H12M12 12H20M12 12V20M12 12V4')),
  zoomOut: (s = 22) => svg(s, '0 0 24 24', p('M4 12H20')),
};

/* Big Red Cross.svg / Big Blue Circle.svg — the 48 px playing-field marks */
const markX = (s, pop) => svg(s, '0 0 48 48',
  `<path d="M41.9992 13.3072L35.8661 7L24.5719 18.1928L13.3331 7L7 13.3072L18.3495 24.5L7 35.6928L13.3339 42L24.5727 30.8072L35.8669 42L42 35.6928L30.7612 24.5L41.9992 13.3072Z" fill="${RED}"/>
   <path d="M41.9992 13.3072L35.8661 7L24.5719 18.1928L13.3331 7L7 13.3072L18.3416 24.5L7 35.6928L13.3339 42L24.5727 30.8072L35.8669 42L42 35.6928L30.7612 24.5L41.9992 13.3072Z" stroke="black" stroke-width="1.33333" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>`,
  'glyph' + (pop ? ' pop' : ''));

const markO = (s, pop) => svg(s, '0 0 48 48',
  `<path d="M23.7107 4.27124C13.0333 4.27124 4.37732 12.9266 4.37732 23.6046C4.37732 34.2819 13.0333 42.9379 23.7107 42.9379C34.388 42.9379 43.044 34.2819 43.044 23.6046C43.044 12.9266 34.388 4.27124 23.7107 4.27124ZM23.7107 36.9379C16.3467 36.9379 10.3773 30.9679 10.3773 23.6046C10.3773 16.2412 16.3467 10.2712 23.7107 10.2712C31.0747 10.2712 37.044 16.2406 37.044 23.6046C37.044 30.9686 31.0747 36.9379 23.7107 36.9379Z" fill="${BLUE}"/>
   <path d="M23.8634 43.2914C34.5409 43.2914 43.1967 34.6356 43.1967 23.9581C43.1967 13.2806 34.5409 4.62476 23.8634 4.62476C13.1859 4.62476 4.53003 13.2806 4.53003 23.9581C4.53003 34.6356 13.1859 43.2914 23.8634 43.2914Z" stroke="black" stroke-width="1.33333" stroke-linecap="round" stroke-linejoin="round"/>
   <path d="M23.8634 37.2914C31.2272 37.2914 37.1967 31.3219 37.1967 23.9581C37.1967 16.5943 31.2272 10.6248 23.8634 10.6248C16.4996 10.6248 10.53 16.5943 10.53 23.9581C10.53 31.3219 16.4996 37.2914 23.8634 37.2914Z" stroke="black" stroke-width="1.33333" stroke-linecap="round" stroke-linejoin="round"/>`,
  'glyph' + (pop ? ' pop' : ''));

const mark = (who, s, pop) => (who === 'X' ? markX(s, pop) : markO(s, pop));

/* Small Red Cross.svg / Small Blue Circle.svg — the 24 px interface marks */
const smallX = (s = 24) => svg(s, '0 0 24 24',
  `<path d="M20.9996 6.24369L17.8454 3L12.037 8.75631L6.25702 3L3 6.24369L8.83687 12L3 17.7563L6.25743 21L12.0374 15.2437L17.8458 21L21 17.7563L15.22 12L20.9996 6.24369Z" fill="${RED}"/>
   <path d="M20.9996 6.24369L17.8454 3L12.037 8.75631L6.25702 3L3 6.24369L8.83281 12L3 17.7563L6.25743 21L12.0374 15.2437L17.8458 21L21 17.7563L15.22 12L20.9996 6.24369Z" stroke="black" stroke-width="0.666667" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>`);

const smallO = (s = 24) => svg(s, '0 0 24 24',
  `<path d="M11.8553 2.13574C6.51666 2.13574 2.18866 6.46341 2.18866 11.8024C2.18866 17.1411 6.51666 21.4691 11.8553 21.4691C17.194 21.4691 21.522 17.1411 21.522 11.8024C21.522 6.46341 17.194 2.13574 11.8553 2.13574ZM11.8553 18.4691C8.17333 18.4691 5.18866 15.4841 5.18866 11.8024C5.18866 8.12074 8.17333 5.13574 11.8553 5.13574C15.5373 5.13574 18.522 8.12041 18.522 11.8024C18.522 15.4844 15.5373 18.4691 11.8553 18.4691Z" fill="${BLUE}"/>
   <path d="M11.9317 21.6456C17.2704 21.6456 21.5983 17.3177 21.5983 11.9789C21.5983 6.64017 17.2704 2.31226 11.9317 2.31226C6.59293 2.31226 2.26501 6.64017 2.26501 11.9789C2.26501 17.3177 6.59293 21.6456 11.9317 21.6456Z" stroke="black" stroke-width="0.666667" stroke-linecap="round" stroke-linejoin="round"/>
   <path d="M11.9317 18.6456C15.6136 18.6456 18.5983 15.6608 18.5983 11.9789C18.5983 8.29702 15.6136 5.31226 11.9317 5.31226C8.24978 5.31226 5.26501 8.29702 5.26501 11.9789C5.26501 15.6608 8.24978 18.6456 11.9317 18.6456Z" stroke="black" stroke-width="0.666667" stroke-linecap="round" stroke-linejoin="round"/>`);

const smallMark = (who, s = 24) => (who === 'X' ? smallX(s) : smallO(s));

/* The large assets. build-standalone.ps1 rewrites this object with inline
   data: URIs to produce the single-file build — keep it a plain literal. */
const ASSETS = {
  logo:  'icons/logo.png',
  word:  'icons/Name_Small.svg',
  party: 'icons/noto_party-popper.svg',
};

/* Logo 2.1 with the wordmark below it */
const brandStack = () => `
  <img class="logo-img" src="${ASSETS.logo}" width="98" height="98" alt="">
  <img class="wordmark-img big" src="${ASSETS.word}" width="131" height="28" alt="ExtendOX">`;
const wordmark   = () => `<img class="wordmark-img" src="${ASSETS.word}" width="112" height="24" alt="ExtendOX">`;
const partyBig   = () => `<img class="party-img" src="${ASSETS.party}" width="112" height="112" alt="">`;

/* ================================== state ================================== */
const DEFAULTS = {
  lang: 'en',
  timeLimit: true,
  minutes: 5,
  mode: 'fast',          // fast = 4 to win, classic = 5, pro = 6
  blockCentre: true,     // the first mark may not go in the middle
  unlimited: false,      // no cap on how far the board may grow
  maxW: 10,              // maximum number of columns
  maxH: 10,              // maximum number of rows
  undoOn: true,          // undo button enabled
};

const store = {
  load() { try { return JSON.parse(localStorage.getItem('extendox') || '{}'); } catch { return {}; } },
  save() {
    const keep = {};
    Object.keys(DEFAULTS).forEach(k => keep[k] = S[k]);
    try { localStorage.setItem('extendox', JSON.stringify(keep)); } catch { /* private mode */ }
  }
};

const S = Object.assign({
  screen: 'home',
  stack: [],                                       // navigation history for ←
  game: null,
  dialog: null,                                    // 'end' | 'undoOff' | null
  modeOpen: false, langOpen: false,                // a dropdown is showing
  lastPlaced: null,                                // [r,c] – drives the pop-in animation
}, DEFAULTS, store.load());

/* translation lookup — falls back to English for anything missing */
function t(key, ...args) {
  const v = (T[S.lang] || T.en)[key] ?? T.en[key];
  return typeof v === 'function' ? v(...args) : v;
}
/* the mode labels live in the translations, the numbers in MODES */
const modeLabel = k => t('mode' + k[0].toUpperCase() + k.slice(1));

/* how far the board may grow right now */
const limits = () => S.unlimited
  ? { maxRows: Infinity, maxCols: Infinity }
  : { maxRows: S.maxH, maxCols: S.maxW };

/* marks in a row needed to win, for the mode currently selected */
const winLen = () => MODES[S.mode].win;

function newGame() {
  const secs = S.minutes * 60;
  return {
    winLen: winLen(),       // frozen for the whole match
    rows: 3, cols: 3,
    grid: [[null, null, null], [null, null, null], [null, null, null]],
    turn: 'O',              // Player O opens the game (per the tutorial design)
    pendRow: false,         // owes the board one extra ROW    (a column filled up)
    pendCol: false,         // owes the board one extra COLUMN (a row filled up)
    moveNo: 0,
    over: false, winner: null, reason: null, winLine: null,
    clock: { O: secs, X: secs },
    history: [],
    notice: null, noticeAt: 0,
  };
}

const other   = who => (who === 'X' ? 'O' : 'X');
const colorOf = who => (who === 'X' ? RED : BLUE);
const clamp   = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

/* ------------------------------- game rules -------------------------------- */
const snapshot = g => JSON.stringify({
  rows: g.rows, cols: g.cols, grid: g.grid, turn: g.turn,
  pendRow: g.pendRow, pendCol: g.pendCol, moveNo: g.moveNo,
  over: g.over, winner: g.winner, reason: g.reason, winLine: g.winLine,
});

function canPlace(g, r, c) {
  return !g.over && !g.pendRow && !g.pendCol && !S.dialog && !g.grid[r][c];
}

/* longest run of identical marks through (r,c); null when shorter than g.winLen */
function findWin(g, r, c) {
  const who = g.grid[r][c];
  for (const [dr, dc] of [[0, 1], [1, 0], [1, 1], [1, -1]]) {
    const line = [[r, c]];
    for (const step of [1, -1]) {
      let rr = r + dr * step, cc = c + dc * step;
      while (rr >= 0 && rr < g.rows && cc >= 0 && cc < g.cols && g.grid[rr][cc] === who) {
        step === 1 ? line.push([rr, cc]) : line.unshift([rr, cc]);
        rr += dr * step; cc += dc * step;
      }
    }
    if (line.length >= (g.winLen || 4)) return line;
  }
  return null;
}

const boardFull = g => g.grid.every(row => row.every(Boolean));

function place(r, c) {
  const g = S.game;
  if (!canPlace(g, r, c)) return;

  // "To ensure fairness, the first mark cannot be placed in the middle of the grid!"
  if (S.blockCentre && g.moveNo === 0 && r === 1 && c === 1) {
    setNotice(g, t('centreNotice'));
    return render();
  }

  g.history.push(snapshot(g));
  g.grid[r][c] = g.turn;
  g.moveNo++;
  S.lastPlaced = [r, c];
  g.notice = null;
  resetView();

  const line = findWin(g, r, c);
  if (line) { endGame(g, g.turn, 'line', line); return render(); }

  // a filled COLUMN owes the board a new row, a filled ROW owes it a new column
  let colFull = true; for (let i = 0; i < g.rows; i++) if (!g.grid[i][c]) { colFull = false; break; }
  let rowFull = true; for (let j = 0; j < g.cols; j++) if (!g.grid[r][j]) { rowFull = false; break; }

  const L = limits(), blocked = [];
  if (colFull) { g.rows < L.maxRows ? g.pendRow = true : blocked.push('row'); }
  if (rowFull) { g.cols < L.maxCols ? g.pendCol = true : blocked.push('col'); }
  if (blocked.length) {
    const what = blocked.length === 2 ? t('limBoth') : t(blocked[0] === 'row' ? 'limRow' : 'limCol');
    setNotice(g, t('limitNotice', S.maxW, S.maxH, what));
  }

  if (!g.pendRow && !g.pendCol) finishTurn(g);
  render();
}

function extend(side) {
  const g = S.game;
  if (g.over) return;
  const isRow = side === 'top' || side === 'bottom';
  if (isRow ? !g.pendRow : !g.pendCol) return;

  g.history.push(snapshot(g));
  resetView();
  if (isRow) {
    const fresh = new Array(g.cols).fill(null);
    side === 'top' ? g.grid.unshift(fresh) : g.grid.push(fresh);
    g.rows++; g.pendRow = false;
  } else {
    g.grid.forEach(row => side === 'left' ? row.unshift(null) : row.push(null));
    g.cols++; g.pendCol = false;
  }
  if (!g.pendRow && !g.pendCol) finishTurn(g);
  render();
}

function finishTurn(g) {
  // stalemate: the board is completely full and cannot grow any further
  if (boardFull(g)) return endGame(g, null, 'draw', null);
  g.turn = other(g.turn);
}

function endGame(g, winner, reason, line) {
  g.over = true; g.winner = winner; g.reason = reason; g.winLine = line;
  g.pendRow = g.pendCol = false; g.notice = null;
}

function setNotice(g, text) {
  g.notice = text; g.noticeAt = Date.now();
  const at = g.noticeAt;
  setTimeout(() => { if (S.game === g && g.noticeAt === at) { g.notice = null; render(); } }, 4600);
}

/* Undo steps back one action – a placement or an extension choice.
   Clocks are deliberately not rewound: time spent stays spent. */
function undo() {
  const g = S.game;
  if (!g.history.length) return;
  Object.assign(g, JSON.parse(g.history.pop()));
  S.lastPlaced = null; g.notice = null;
  resetView();
  render();
}

/* --------------------------------- clocks ---------------------------------- */
let clockRef = Date.now();
setInterval(() => {
  const g = S.game;
  const now = Date.now();
  const running = g && S.timeLimit && !g.over && S.screen === 'game' && !S.dialog;
  if (!running) { clockRef = now; return; }
  const before = Math.ceil(g.clock[g.turn]);
  g.clock[g.turn] = Math.max(0, g.clock[g.turn] - (now - clockRef) / 1000);
  clockRef = now;
  if (g.clock[g.turn] <= 0) { endGame(g, other(g.turn), 'time', null); render(); }
  else if (Math.ceil(g.clock[g.turn]) !== before) paintClocks();
}, 200);

const mmss = s => {
  s = Math.max(0, Math.ceil(s));
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
};

function paintClocks() {
  const g = S.game; if (!g) return;
  ['O', 'X'].forEach(who => {
    const el = document.querySelector(`[data-clock="${who}"]`);
    if (!el) return;
    el.textContent = mmss(g.clock[who]);
    el.classList.toggle('active', !g.over && g.turn === who);
    el.classList.toggle('dead', g.clock[who] <= 0);
  });
}

/* ================================ rendering ================================ */
function render() {
  $app.innerHTML = ({
    home: viewHome, game: viewGame, settings: viewSettings,
    tutorial: viewTutorial, imprint: viewImprint,
  })[S.screen]();
  if (S.screen === 'game') layoutBoard();
  placeModeMenu();
}

/* Open a dropdown on whichever side has more room and cap its height so it can
   never run off the screen — the language list is seven rows tall. */
function placeModeMenu() {
  const m = document.querySelector('.selmenu');
  if (!m) return;
  m.classList.remove('up'); m.style.maxHeight = '';
  const chip = m.parentElement.querySelector('.selchip').getBoundingClientRect();
  const a = $app.getBoundingClientRect();
  const below = a.bottom - chip.bottom - 16;
  const above = chip.top - a.top - 16;
  const up = m.scrollHeight > below && above > below;
  m.classList.toggle('up', up);
  m.style.maxHeight = Math.max(110, Math.floor(up ? above : below)) + 'px';
}

/* shared little controls ---------------------------------------------------- */
const toggle = (act, on, label) =>
  `<button class="toggle ${on ? 'on' : ''}" data-act="${act}" aria-label="${label}"><i></i></button>`;

const numField = (name, unit, off) => {
  const spec = NUM[name];
  return `<span class="chip numchip${off ? ' off' : ''}">${off
    ? `<span class="num">∞</span>`
    : `<input class="num" type="text" inputmode="numeric" maxlength="2" data-num="${name}" value="${S[spec.key]}">`
    }<span class="unit">${unit}</span></span>`;
};

const settingRow = (label, control) =>
  `<div class="row"><span class="row-label">${label}</span>${control}</div>`;

/* Playing-mode dropdown, built from the app's own card / list language rather
   than a native <select>, which cannot be styled. */
const dropdown = (which, open, label, hint, keys, nameOf, hintOf, current) => `
  <div class="selwrap">
    <button class="chip selchip${open ? ' open' : ''}" data-act="${which}Menu"
            aria-haspopup="listbox" aria-expanded="${open}" aria-label="${label}">
      <span class="num">${nameOf(current)}</span>
      <span class="unit">${hintOf(current)}</span>
      <span class="caret">${IC.caret(14)}</span>
    </button>
    ${open ? `<div class="selmenu" role="listbox">
      ${keys.map(k => `
        <button role="option" aria-selected="${k === current}"
                class="${k === current ? 'sel' : ''}" data-act="pick${which[0].toUpperCase() + which.slice(1)}" data-key="${k}">
          <span class="name">${nameOf(k)}</span>
          <span class="hint">${hintOf(k)}</span>
        </button>`).join('')}
    </div>` : ''}
  </div>`;

const modeField = () => dropdown('mode', S.modeOpen, t('mode'), '', MODE_KEYS,
  modeLabel, k => t('toWin', MODES[k].win), S.mode);

const langField = () => dropdown('lang', S.langOpen, t('language'), '', LANG_KEYS,
  k => LANGS[k].name, k => LANGS[k].code, S.lang);

/* --------------------------------- home ----------------------------------- */
function viewHome() {
  return `
  <div class="screen screen-home">
    <div class="home-top">
      <button class="iconbtn" data-act="go" data-to="tutorial" aria-label="${t('tutorial')}">${IC.bulb()}</button>
      <button class="iconbtn" data-act="go" data-to="settings" aria-label="${t('settings')}">${IC.sliders()}</button>
    </div>

    <div class="home-brand">${brandStack()}</div>

    <div class="sp" style="flex:1.5"></div>
    <button class="btn-play" data-act="play" style="align-self:center">${t('playNow')}</button>
    <div class="sp" style="flex:1"></div>

    <div class="card settings-card">
      ${settingRow(t('timeLimit'), toggle('toggleTime', S.timeLimit, t('timeLimit')))}
      ${settingRow(t('minutesPerPlayer'), S.timeLimit
        ? numField('minutes', t('minUnit'))
        : `<span class="chip off">-</span>`)}
      ${settingRow(t('mode'), modeField())}
    </div>
    <div class="sp" style="flex:1.9"></div>
  </div>`;
}

/* --------------------------------- game ----------------------------------- */
function indicator() {
  const g = S.game;
  const tint = (col, ic) => `<span class="tint" style="color:${col}">${ic}</span>`;
  if (g.over) {
    if (g.reason === 'draw') return `<span class="emo24">🤝</span>`;
    return tint(colorOf(g.winner), IC.party(24));
  }
  const col = colorOf(g.turn);
  if (g.pendRow && g.pendCol) return tint(col, IC.extBoth(28));
  if (g.pendRow) return tint(col, IC.extRow(24));
  if (g.pendCol) return tint(col, IC.extCol(24));
  return smallMark(g.turn, 24);
}

function announcement() {
  const g = S.game;
  if (!g.over) return '';
  const draw = g.reason === 'draw';
  const who = draw ? t('draw')
    : `${smallMark(g.winner, 24)}<span>${g.reason === 'time' ? t('winsByTime') : t('wins')}</span>`;
  return `
  <div class="announce">
    <div class="party">${draw ? '<span class="emo-draw">🤝</span>' : partyBig()}</div>
    <div class="col">
      <div class="who">${who}</div>
      <button class="btn-play" data-act="play">${t('playAgain')}</button>
    </div>
  </div>`;
}

/* the bright clock is the one whose turn it is; an expired one turns white */
function clockChip(g, who) {
  const cls = [who === 'X' ? 'red' : 'blue'];
  if (!g.over && g.turn === who) cls.push('active');
  if (g.clock[who] <= 0) cls.push('dead');
  return `<span class="clock ${cls.join(' ')}" data-clock="${who}">${mmss(g.clock[who])}</span>`;
}

function viewGame() {
  const g = S.game;
  const home = g.over ? `data-act="go" data-to="home"` : `data-act="askEnd"`;
  const undoOff = !S.undoOn;
  return `
  <div class="screen screen-game">
    <div class="topbar">
      <button class="iconbtn flat" ${home} aria-label="${t('t_home')}">${IC.home(24)}</button>
      ${S.timeLimit ? `<div class="clocks">${clockChip(g, 'O')}${clockChip(g, 'X')}</div>` : wordmark()}
      <button class="iconbtn flat" data-act="go" data-to="settings" aria-label="${t('settings')}">${IC.sliders(24)}</button>
    </div>

    ${announcement()}

    <div class="board-area" id="boardArea"></div>

    ${g.notice ? `<div class="notice">${g.notice}</div>` : ''}

    <div class="bottombar">
      <button class="iconbtn${undoOff ? ' off' : ''}" data-act="undo" aria-label="${t('a_undo')}"
        ${undoOff || g.history.length ? '' : 'disabled'}>${IC.undo(24)}</button>

      <div class="zoombar hidden" id="zoomBar">
        <button data-act="zoom" data-dir="-1" aria-label="${t('a_zoomOut')}">${IC.zoomOut(22)}</button>
        <span class="zsep"></span>
        <button data-act="zoom" data-dir="1" aria-label="${t('a_zoomIn')}">${IC.zoomIn(22)}</button>
      </div>

      <div class="iconbtn" aria-live="polite">${indicator()}</div>
    </div>

    ${dialogHTML()}
  </div>`;
}

function dialogHTML() {
  if (S.dialog === 'end') return `
    <div class="overlay">
      <div class="dialog">
        <p>${t('endQuestion')}</p>
        <div class="acts">
          <button data-act="endGame">${t('endYes')}</button>
          <button class="cancel" data-act="closeDialog">${t('endNo')}</button>
        </div>
      </div>
    </div>`;
  if (S.dialog === 'undoOff') return `
    <div class="overlay">
      <div class="dialog">
        <p>${t('undoOffMsg')}</p>
        <div class="acts">
          <button data-act="go" data-to="settings">${t('goSettings')}</button>
          <button class="cancel" data-act="closeDialog">${t('close')}</button>
        </div>
      </div>
    </div>`;
  return '';
}

/* --------------------------- board sizing & view --------------------------- */
/* The board is always drawn at BASE_CELL and scaled with a CSS transform, so
   zooming and panning never need a re-render.
     view.k  = current scale (geo.kFit … 1)
     geo.kFit = the scale at which the whole board (plus the room reserved for
                the grey extension bars) fits into the board area              */
const view = { k: 0, px: 0, py: 0 };
/* fitW/fitH  – board + the space reserved for the grey bars (drives kFit)
   panW/panH  – what is actually painted right now (drives the pan limits)   */
let geo = { kFit: 1, areaW: 0, areaH: 0, fitW: 0, fitH: 0, panW: 0, panH: 0 };

const resetView = () => { view.k = 0; view.px = 0; view.py = 0; };
/* zoom & drag are only offered once the cells have become too small to tap
   comfortably — on a normal 3 × 3 board nothing changes. */
const zoomable  = () => geo.kFit * BASE_CELL < MIN_TOUCH;

function layoutBoard() {
  const area = document.getElementById('boardArea');
  if (!area) return;
  const g = S.game, L = limits();

  // Room for the two grey bars is reserved on every axis that can still grow,
  // so the board never resizes the moment they pop up.
  const grow  = !g.over;
  const spanC = g.cols + (grow && g.cols < L.maxCols ? 2 : 0);
  const spanR = g.rows + (grow && g.rows < L.maxRows ? 2 : 0);

  // The bottom note is anchored to the screen, so measure how much of the board
  // area it actually covers instead of guessing — its height varies with the
  // wording and the screen width.
  const note = document.querySelector('.notice');
  let slot = 0;
  if (note) slot = Math.max(0, area.getBoundingClientRect().bottom - (note.getBoundingClientRect().top - NOTICE_GAP));
  area.style.paddingBottom = slot ? slot + 'px' : '';

  geo.areaW = area.clientWidth;
  geo.areaH = area.clientHeight - slot;
  geo.fitW = spanC * BASE_CELL;
  geo.fitH = spanR * BASE_CELL;
  geo.panW = (g.cols + (g.pendCol ? 2 : 0)) * BASE_CELL;
  geo.panH = (g.rows + (g.pendRow ? 2 : 0)) * BASE_CELL;
  geo.kFit = Math.min(1, (geo.areaW - 2) / geo.fitW, (geo.areaH - 2) / geo.fitH);

  if (!view.k || view.k < geo.kFit) { view.k = geo.kFit; view.px = view.py = 0; }
  view.k = clamp(view.k, geo.kFit, 1);

  area.innerHTML = boardHTML();
  area.classList.toggle('zoomable', zoomable());
  const zb = document.getElementById('zoomBar');
  if (zb) zb.classList.toggle('hidden', !zoomable());
  applyView();
  S.lastPlaced = null;   // the pop animation plays exactly once
}
addEventListener('resize', () => { if (S.screen === 'game') layoutBoard(); });

function clampPan() {
  const maxX = Math.max(0, (geo.panW * view.k - geo.areaW) / 2);
  const maxY = Math.max(0, (geo.panH * view.k - geo.areaH) / 2);
  view.px = clamp(view.px, -maxX, maxX);
  view.py = clamp(view.py, -maxY, maxY);
}

function applyView() {
  clampPan();
  const b = document.querySelector('.board');
  if (b) b.style.transform = `translate(${view.px}px, ${view.py}px) scale(${view.k})`;
}

/* zoom towards a point q (in board-area coordinates, relative to its centre) */
function zoomTo(k, qx = 0, qy = 0) {
  const k2 = clamp(k, geo.kFit, 1);
  if (k2 === view.k) return;
  const f = k2 / view.k;
  view.px = qx - (qx - view.px) * f;
  view.py = qy - (qy - view.py) * f;
  view.k = k2;
  applyView();
}

function boardHTML() {
  const g = S.game;
  const cell = BASE_CELL, lw = 6, rad = 15;
  const W = g.cols * cell, H = g.rows * cell;
  const faded = g.over || S.dialog;

  let h = `<div class="board${faded ? ' faded' : ''}" style="width:${W}px;height:${H}px">`;

  for (let r = 0; r < g.rows; r++) for (let c = 0; c < g.cols; c++) {
    const v = g.grid[r][c];
    const live = !faded && canPlace(g, r, c);
    const pop = S.lastPlaced && S.lastPlaced[0] === r && S.lastPlaced[1] === c;
    h += `<div class="cell${live ? ' live' : ''}" ${live ? `data-act="place" data-r="${r}" data-c="${c}"` : ''}
            style="left:${c * cell}px;top:${r * cell}px;width:${cell}px;height:${cell}px"
          >${v ? mark(v, cell * .775, pop) : ''}</div>`;
  }
  h += gridLines(g.rows, g.cols, cell, lw, '#000');

  if (!faded) {
    if (g.pendRow) h += strip('top', g.rows, g.cols, cell, lw, rad, true) + strip('bottom', g.rows, g.cols, cell, lw, rad, true);
    if (g.pendCol) h += strip('left', g.rows, g.cols, cell, lw, rad, true) + strip('right', g.rows, g.cols, cell, lw, rad, true);
  }

  if (g.over && g.winLine) {
    const [r0, c0] = g.winLine[0], [r1, c1] = g.winLine[g.winLine.length - 1];
    const x0 = (c0 + .5) * cell, y0 = (r0 + .5) * cell, x1 = (c1 + .5) * cell, y1 = (r1 + .5) * cell;
    const len = Math.hypot(x1 - x0, y1 - y0) || 1, ex = .42 * cell;
    const ux = (x1 - x0) / len * ex, uy = (y1 - y0) / len * ex;
    h += `<svg class="winline" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
            <line x1="${x0 - ux}" y1="${y0 - uy}" x2="${x1 + ux}" y2="${y1 + uy}"
              stroke="${colorOf(g.winner)}" stroke-opacity=".55"
              stroke-width="${cell * .075}" stroke-linecap="round"/></svg>`;
  }
  return h + '</div>';
}

function gridLines(rows, cols, cell, lw, color) {
  const W = cols * cell, H = rows * cell;
  let h = '';
  for (let i = 1; i < cols; i++)
    h += `<div class="gl" style="left:${i * cell - lw / 2}px;top:0;width:${lw}px;height:${H}px;background:${color}"></div>`;
  for (let j = 1; j < rows; j++)
    h += `<div class="gl" style="left:0;top:${j * cell - lw / 2}px;width:${W}px;height:${lw}px;background:${color}"></div>`;
  return h;
}

/* one translucent grey "new row / new column" bar hugging the board.
   The edge that touches the grid stays square; the outer corners are rounded. */
function strip(side, rows, cols, cell, lw, rad, interactive) {
  const W = cols * cell, H = rows * cell;
  const horizontal = side === 'top' || side === 'bottom';        // a new ROW
  const box = horizontal
    ? { l: 0, t: side === 'top' ? -cell : H, w: W, h: cell }
    : { l: side === 'left' ? -cell : W, t: 0, w: cell, h: H };
  const radius = {
    top:    `${rad}px ${rad}px 0 0`,
    bottom: `0 0 ${rad}px ${rad}px`,
    left:   `${rad}px 0 0 ${rad}px`,
    right:  `0 ${rad}px ${rad}px 0`,
  }[side];

  let inner = '';
  if (horizontal) {
    for (let i = 1; i < cols; i++)
      inner += `<div class="gsep" style="left:${i * cell - lw / 2}px;top:0;width:${lw}px;height:${cell}px"></div>`;
    inner += `<div class="gsep" style="left:0;${side === 'top' ? 'bottom' : 'top'}:0;width:${W}px;height:${lw}px"></div>`;
  } else {
    for (let j = 1; j < rows; j++)
      inner += `<div class="gsep" style="top:${j * cell - lw / 2}px;left:0;height:${lw}px;width:${cell}px"></div>`;
    inner += `<div class="gsep" style="top:0;${side === 'left' ? 'right' : 'left'}:0;height:${H}px;width:${lw}px"></div>`;
  }
  return `<div class="ghost" ${interactive ? `data-act="extend" data-side="${side}"` : ''}
      style="left:${box.l}px;top:${box.t}px;width:${box.w}px;height:${box.h}px;border-radius:${radius}">
      ${inner}<div class="gplus">${IC.plus(Math.round(cell * .52))}</div></div>`;
}

/* ------------------------- zoom / pan gestures ----------------------------- */
const gest = { pts: new Map(), mode: null, sx: 0, sy: 0, px: 0, py: 0, k: 1, dist: 0, moved: false };
let swallowClick = false;

const areaCentre = area => {
  const r = area.getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
};

$app.addEventListener('pointerdown', e => {
  const area = e.target.closest('.board-area');
  if (!area || !zoomable()) return;
  gest.pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
  if (gest.pts.size === 1) {
    gest.mode = 'pan'; gest.moved = false;
    gest.sx = e.clientX; gest.sy = e.clientY; gest.px = view.px; gest.py = view.py;
  } else if (gest.pts.size === 2) {
    const [a, b] = [...gest.pts.values()];
    gest.mode = 'pinch'; gest.moved = true;
    gest.dist = Math.hypot(a.x - b.x, a.y - b.y) || 1;
    gest.k = view.k; gest.px = view.px; gest.py = view.py;
  }
  document.querySelector('.board')?.classList.add('nudge');
});

$app.addEventListener('pointermove', e => {
  if (!gest.pts.has(e.pointerId)) return;
  gest.pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
  const area = document.getElementById('boardArea');
  if (!area) return;

  if (gest.mode === 'pan' && gest.pts.size === 1) {
    const dx = e.clientX - gest.sx, dy = e.clientY - gest.sy;
    if (!gest.moved && Math.hypot(dx, dy) < 6) return;
    gest.moved = true;
    view.px = gest.px + dx; view.py = gest.py + dy;
    applyView();
  } else if (gest.mode === 'pinch' && gest.pts.size === 2) {
    const [a, b] = [...gest.pts.values()];
    const d = Math.hypot(a.x - b.x, a.y - b.y) || 1;
    const c = areaCentre(area);
    const qx = (a.x + b.x) / 2 - c.x, qy = (a.y + b.y) / 2 - c.y;
    const k2 = clamp(gest.k * (d / gest.dist), geo.kFit, 1);
    const f = k2 / view.k;
    view.px = qx - (qx - view.px) * f;
    view.py = qy - (qy - view.py) * f;
    view.k = k2;
    applyView();
  }
});

function endGesture(e) {
  if (!gest.pts.has(e.pointerId)) return;
  gest.pts.delete(e.pointerId);
  if (gest.moved) { swallowClick = true; setTimeout(() => swallowClick = false, 0); }
  if (!gest.pts.size) { gest.mode = null; document.querySelector('.board')?.classList.remove('nudge'); }
}
$app.addEventListener('pointerup', endGesture);
$app.addEventListener('pointercancel', endGesture);

$app.addEventListener('wheel', e => {
  const area = e.target.closest('.board-area');
  if (!area || !zoomable()) return;
  e.preventDefault();
  const c = areaCentre(area);
  zoomTo(view.k * Math.exp(-e.deltaY * 0.0016), e.clientX - c.x, e.clientY - c.y);
}, { passive: false });

/* -------------------------------- settings -------------------------------- */
function viewSettings() {
  return `
  <div class="screen scroll">
    <div class="subhead">
      <button class="iconbtn" data-act="back" aria-label="${t('a_back')}">${IC.chevL()}</button>
      <div class="title">${t('settings')}</div>
    </div>

    <div class="card settings-card">
      ${settingRow(t('language'), langField())}
    </div>

    <div class="card settings-card">
      ${settingRow(t('firstMarkOffCentre'), toggle('toggleCentre', S.blockCentre, t('firstMarkOffCentre')))}
      ${settingRow(t('undoButton'), toggle('toggleUndo', S.undoOn, t('undoButton')))}
    </div>

    <div class="card settings-card">
      ${settingRow(t('unlimitedBoard'), toggle('toggleUnlimited', S.unlimited, t('unlimitedBoard')))}
      ${settingRow(t('maxWidth'), numField('maxW', t('cellsUnit'), S.unlimited))}
      ${settingRow(t('maxHeight'), numField('maxH', t('cellsUnit'), S.unlimited))}
    </div>

    <div class="list">
      <button data-act="go" data-to="tutorial">${IC.bulb(22)}<span>${t('tutorial')}</span><span class="sp"></span>${IC.chevR(20)}</button>
      <button data-act="go" data-to="imprint">${IC.book(22)}<span>${t('imprint')}</span><span class="sp"></span>${IC.chevR(20)}</button>
    </div>
  </div>`;
}

/* ----------------------- little boards for the tutorial -------------------- */
function miniBoard(spec, ghost, cell = 32) {
  const rows = spec.length, cols = spec[0].length;
  const lw = Math.max(2, Math.round(cell * .095)), rad = Math.round(cell * .24);
  const W = cols * cell, H = rows * cell;
  let inner = '';
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    const ch = spec[r][c];
    if (ch === 'X' || ch === 'O')
      inner += `<div class="cell" style="left:${c * cell}px;top:${r * cell}px;width:${cell}px;height:${cell}px">${mark(ch, cell * .775)}</div>`;
  }
  inner += gridLines(rows, cols, cell, lw, '#000');
  if (ghost === 'row') inner += strip('top', rows, cols, cell, lw, rad) + strip('bottom', rows, cols, cell, lw, rad);
  if (ghost === 'col') inner += strip('left', rows, cols, cell, lw, rad) + strip('right', rows, cols, cell, lw, rad);
  const mv = ghost === 'row' ? cell : 0, mh = ghost === 'col' ? cell : 0;
  return `<div class="board static" style="width:${W}px;height:${H}px;margin:${mv}px ${mh}px">${inner}</div>`;
}

/* -------------------------------- tutorial -------------------------------- */
function viewTutorial() {
  const START = ['...', '.O.', '...'];
  const COL   = ['O.X', 'O.X', '.OX'];
  const ROW   = ['X..', 'OOO', '..X'];
  const W = winLen();
  const WIN = {
    4: ['O.O.', 'XXXX', 'OO..'],
    5: ['O.O.O', 'XXXXX', 'OO...'],
    6: ['O.O.O.', 'XXXXXX', 'OOO...'],
  }[W];
  const M = MODES[S.mode];
  const modeRow = k => `
    <div class="keyrow">
      <div class="k"><b>${modeLabel(k)}</b></div>
      <div class="t">${t('t_modeWin', MODES[k].win)}${k === S.mode ? ` <b>· ${t('t_selected')}</b>` : ''}</div>
    </div>`;
  const legend = (icons, text) => `<div class="keyrow"><div class="k">${icons}</div><div class="t">${text}</div></div>`;
  const bi = (ic, size) => `<span class="tint" style="color:${BLUE}">${ic(size)}</span><span class="tint" style="color:${RED}">${ic(size)}</span>`;

  return `
  <div class="screen scroll tut">
    <div class="subhead">
      <button class="iconbtn" data-act="back" aria-label="${t('a_back')}">${IC.chevL()}</button>
      <div class="title">${t('tutorial')}</div>
    </div>

    <h3>${t('t_shortH')}</h3>
    <div class="card">${t('t_shortB', W)}</div>

    <h3>${t('t_modesH')}</h3>
    <div class="card">
      ${t('t_modesB')}
      ${MODE_KEYS.map(modeRow).join('')}
      <br>${t('t_modesFoot')}
    </div>

    <h3>${t('t_startH')}</h3>
    <div class="card">${t('t_startB')}<div class="mini">${miniBoard(START)}</div></div>

    <h3>${t('t_heightH')}</h3>
    <div class="card">${t('t_heightB1')}<div class="mini">${miniBoard(COL)}</div></div>
    <div class="card">${t('t_heightB2')}<div class="mini">${miniBoard(COL, 'row')}</div></div>

    <h3>${t('t_widthH')}</h3>
    <div class="card">${t('t_widthB1')}<div class="mini">${miniBoard(ROW)}</div></div>
    <div class="card">${t('t_widthB2')}<div class="mini">${miniBoard(ROW, 'col')}</div></div>

    <h3>${t('t_bothH')}</h3>
    <div class="card">${t('t_bothB')}</div>

    <h3>${t('t_growH')}</h3>
    <div class="card">${t('t_growB', modeLabel(S.mode), M.w, M.h)}</div>

    <h3>${t('t_zoomH')}</h3>
    <div class="card">${t('t_zoomB')}</div>

    <h3>${t('t_winH')}</h3>
    <div class="card">${t('t_winB', W)}<div class="mini">${miniBoard(WIN, null, W > 5 ? 27 : 30)}</div></div>

    <h3>${t('t_topH')}</h3>
    <div class="card">
      ${legend(IC.home(24), t('t_home'))}
      ${legend(IC.sliders(24), t('t_settingsRow'))}
      <div class="keyrow">
        <div class="k stackk"><span class="clock red">10:00</span><span class="clock red active">10:00</span></div>
        <div class="t">${t('t_clock')}</div>
      </div>
    </div>

    <h3>${t('t_bottomH')}</h3>
    <div class="card last">
      ${legend(`<span class="iconbtn mini-btn">${IC.undo(20)}</span>`, t('t_undo'))}
      ${legend('', t('t_right'))}
      ${legend(smallO(24) + smallX(24), t('t_place'))}
      ${legend(`<span class="tint" style="color:${BLUE}">${IC.extRow(24)}</span><span class="tint" style="color:${RED}">${IC.extCol(24)}</span>`, t('t_extend'))}
      ${legend(bi(IC.extBoth, 26), t('t_extendBoth'))}
      ${legend(bi(IC.party, 24), t('t_winner'))}
    </div>
  </div>`;
}

/* -------------------------------- imprint --------------------------------- */
function viewImprint() {
  const sec = (h, b) => `<h4>${h}</h4><p>${b}</p>`;
  return `
  <div class="screen scroll">
    <div class="subhead">
      <button class="iconbtn" data-act="back" aria-label="${t('a_back')}">${IC.chevL()}</button>
      <div class="title">${t('imprint')}</div>
    </div>
    <div class="imprint">
      <p><b>${t('i_provider')}</b><br>Musterfirma<br>Musterstraße 1<br>12345 Musterstadt</p>
      ${sec(t('i_repBy'), 'Max Mustermann')}
      ${sec(t('i_contact'), '+49 (0) 123 44 55 66<br>info@musterfirma.de')}
      ${sec(t('i_vat'), t('i_vatB'))}
      ${sec(t('i_liability'), t('i_liabilityB'))}
      ${sec(t('i_links'), t('i_linksB'))}
      ${sec(t('i_copyright'), t('i_copyrightB'))}
      ${sec(t('i_privacy'), t('i_privacyB'))}
      <p class="ph">${t('i_placeholder')}</p>
    </div>
  </div>`;
}

/* ================================== events ================================= */
$app.addEventListener('click', e => {
  if (swallowClick) return;

  // a tap anywhere outside an open dropdown just closes it
  if ((S.modeOpen || S.langOpen) && !e.target.closest('.selwrap')) {
    S.modeOpen = S.langOpen = false; return render();
  }

  const el = e.target.closest('[data-act]');
  if (!el) return;

  switch (el.dataset.act) {
    case 'modeMenu':    S.modeOpen = !S.modeOpen; S.langOpen = false; break;
    case 'langMenu':    S.langOpen = !S.langOpen; S.modeOpen = false; break;
    case 'pickMode':    applyMode(el.dataset.key); break;
    case 'pickLang':    applyLang(el.dataset.key); break;
    case 'go':          S.stack = el.dataset.to === 'home' ? [] : [...S.stack, S.screen];
                        S.screen = el.dataset.to; S.dialog = null; S.modeOpen = S.langOpen = false; break;
    case 'back':        S.screen = S.stack.pop() || 'home'; break;
    case 'play':        S.game = newGame(); S.stack = []; S.screen = 'game'; S.modeOpen = false;
                        S.dialog = null; S.lastPlaced = null; resetView(); clockRef = Date.now(); break;

    case 'toggleTime':      S.timeLimit   = !S.timeLimit;   store.save(); break;
    case 'toggleCentre':    S.blockCentre = !S.blockCentre; store.save(); break;
    case 'toggleUndo':      S.undoOn      = !S.undoOn;      store.save(); break;
    case 'toggleUnlimited': S.unlimited   = !S.unlimited;   store.save(); break;

    case 'place':       return place(+el.dataset.r, +el.dataset.c);
    case 'extend':      return extend(el.dataset.side);
    case 'zoom':        return zoomTo(view.k * (+el.dataset.dir > 0 ? 1.6 : 1 / 1.6));
    case 'undo':        if (!S.undoOn) { S.dialog = 'undoOff'; break; } return undo();
    case 'askEnd':      S.dialog = 'end'; break;
    case 'closeDialog': S.dialog = null; clockRef = Date.now(); break;
    case 'endGame':     S.dialog = null; S.game = null; S.stack = []; S.screen = 'home'; break;
    default: return;
  }
  render();
});

/* editable number fields ---------------------------------------------------- */
$app.addEventListener('focusin', e => { if (e.target.matches('[data-num]')) e.target.select(); });
$app.addEventListener('input', e => {
  if (!e.target.matches('[data-num]')) return;
  e.target.value = e.target.value.replace(/\D/g, '').slice(0, 2);
});
/* picking a mode also resets the board-size limits and the clock to its defaults */
function applyMode(key) {
  const m = MODES[key] ? key : 'fast';
  S.mode = m;
  S.maxW = MODES[m].w;
  S.maxH = MODES[m].h;
  S.minutes = MODES[m].min;
  S.modeOpen = false;
  store.save();
}

/* language only changes wording — never any rule, size or layout value */
function applyLang(key) {
  S.lang = LANGS[key] ? key : 'en';
  S.langOpen = false;
  document.documentElement.lang = S.lang;
  store.save();
}

$app.addEventListener('change', e => {
  const el = e.target.closest('[data-num]');
  if (!el) return;
  const spec = NUM[el.dataset.num];
  const raw = parseInt(el.value, 10);
  S[spec.key] = clamp(Number.isFinite(raw) ? raw : spec.def, spec.min, spec.max);
  store.save();
  render();
});
$app.addEventListener('keydown', e => {
  if (e.key === 'Enter' && e.target.matches('[data-num]')) { e.preventDefault(); e.target.blur(); }
  if (e.key === 'Escape' && (S.modeOpen || S.langOpen)) { S.modeOpen = S.langOpen = false; render(); }
});

document.documentElement.lang = S.lang;
render();
