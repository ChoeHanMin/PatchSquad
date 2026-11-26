// ---------- 공용 도구 ----------
THREE.ColorManagement.enabled = false; // 색상값을 hex 그대로 사용
const $ = (s) => document.querySelector(s);
const $$ = (s) => Array.from(document.querySelectorAll(s));
const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const lerp = (a, b, t) => a + (b - a) * t;
const smooth = (t) => t * t * (3 - 2 * t);
const easeOut = (t) => 1 - (1 - t) * (1 - t);
function bounceOut(x) {
  const n1 = 7.5625, d1 = 2.75;
  if (x < 1 / d1) return n1 * x * x;
  if (x < 2 / d1) return n1 * (x -= 1.5 / d1) * x + 0.75;
  if (x < 2.5 / d1) return n1 * (x -= 2.25 / d1) * x + 0.9375;
  return n1 * (x -= 2.625 / d1) * x + 0.984375;
}
function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function hashStr(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
let RNG = mulberry32(1);
const rnd = (a = 0, b = 1) => a + (b - a) * RNG();
const rint = (a, b) => Math.floor(rnd(a, b + 1));
const pick = (arr, r = RNG) => arr[Math.floor(r() * arr.length)];
function shuffle(arr, r = RNG) { for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [arr[i], arr[j]] = [arr[j], arr[i]]; } return arr; }

// 저장: 스팀판 데스크톱 앱이면 %APPDATA%\PatchSquad\save.json 파일 하나 (스팀 클라우드가 이 파일을 동기화)
//       브라우저에서 열면 localStorage. 둘 다 막혀 있어도 게임은 진행 (try/catch)
const Store = {
  file: null, // 데스크톱 앱: 파일 내용을 메모리에 들고 있다가 바뀌면 곧 파일에 씀
  _t: 0,
  init() {
    const D = window.bhDesktop;
    if (!D || !D.saveLoad) return;
    try { this.file = D.saveLoad() || {}; } catch (e) { this.file = {}; }
    if (!Object.keys(this.file).length) { // 처음: 예전(v1.0.x) localStorage 저장을 옮겨 옴
      try { for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k && k.startsWith('patchsquad_')) this.file[k.slice(11)] = JSON.parse(localStorage.getItem(k)); } } catch (e) { /* 없음 */ }
      if (Object.keys(this.file).length) this.flush();
    }
    window.addEventListener('beforeunload', () => this.flush());
  },
  flush() { if (!this.file) return; clearTimeout(this._t); try { window.bhDesktop.saveWrite(JSON.stringify(this.file)); } catch (e) { /* 저장 없이 진행 */ } },
  get(k, d) {
    if (this.file) return k in this.file ? JSON.parse(JSON.stringify(this.file[k])) : d;
    try { const v = localStorage.getItem('patchsquad_' + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; }
  },
  set(k, v) {
    if (this.file) { this.file[k] = JSON.parse(JSON.stringify(v)); clearTimeout(this._t); this._t = setTimeout(() => this.flush(), 400); return; }
    try { localStorage.setItem('patchsquad_' + k, JSON.stringify(v)); } catch (e) { /* 저장 없이 진행 */ }
  },
};
Store.init();
// v1.3: 스테이지 4(테스트 서버실)가 새로 들어가서 예전 기록의 물리 구역·보스 번호를 한 칸씩 뒤로
(() => { try { const rec = Store.get('records', null); if (rec && rec.stages && !rec.v13) { const st = rec.stages, n = {}; for (const k of Object.keys(st)) n[+k >= 3 ? +k + 1 : +k] = st[k]; rec.stages = n; rec.v13 = true; Store.set('records', rec); } else if (!rec || !rec.v13) { Store.set('records', Object.assign(rec || {}, { v13: true })); } } catch (e) { /* 무시 */ } })();

// 언어: 한국어(ko) / English(en). 처음엔 시스템 언어를 따르고, 언어/Language 버튼으로 바꾸면 저장 후 다시 불러옴
const LANGS = ['ko', 'en', 'ja', 'zh'];
const LANG = (() => { const v = Store.get('lang', null); if (LANGS.includes(v)) return v; const n = navigator.language || ''; return /^ko/i.test(n) ? 'ko' : /^ja/i.test(n) ? 'ja' : /^zh/i.test(n) ? 'zh' : 'en'; })();
// L(한국어, English, 日本語, 简体中文) — 일본어·중국어가 없으면 영어
const L = (ko, en, ja, zh) => (LANG === 'ko' ? ko : LANG === 'ja' ? (ja ?? en) : LANG === 'zh' ? (zh ?? en) : en);
document.documentElement.lang = LANG;
// 화면 마크업의 글자: data-en / data-ja / data-zh 가 있는 요소는 그 언어일 때 그 내용으로 바꿈
if (LANG !== 'ko') {
  for (const el of document.querySelectorAll('[data-en]')) el.innerHTML = el.dataset[LANG] || el.dataset.en;
  for (const el of document.querySelectorAll('[data-en-aria]')) el.setAttribute('aria-label', el.dataset[LANG + 'Aria'] || el.dataset.enAria);
}

const NOW = new Date();
const MMDD = String(NOW.getMonth() + 1).padStart(2, '0') + String(NOW.getDate()).padStart(2, '0');
const TODAY_KEY = NOW.getFullYear() + '-' + MMDD;
const DAILY_VER = 'v1.' + MMDD;
const DAILY_SEED = hashStr('patchsquad-' + TODAY_KEY);
// 스팀판: 항상 PC 모드 (터치스크린 노트북도 폰 화면으로 바뀌지 않게)
const IS_TOUCH = false;

// PC는 1920×1080 기준 화면을 창 크기에 맞게 통째로 확대·축소 (남는 곳은 검은 여백)
const VIEW = { pc: true, w: 1920, h: 1080, s: 1, ox: 0, oy: 0,
  fit() {
    const app = document.getElementById('app');
    if (!this.pc) { this.w = window.innerWidth; this.h = window.innerHeight; this.s = 1; this.ox = this.oy = 0; if (app) app.style.cssText = ''; return; }
    this.w = 1920; this.h = 1080;
    this.s = Math.min(window.innerWidth / 1920, window.innerHeight / 1080);
    this.ox = (window.innerWidth - 1920 * this.s) / 2; this.oy = (window.innerHeight - 1080 * this.s) / 2;
    if (app) app.style.cssText = `width:1920px;height:1080px;inset:auto;left:0;top:0;transform-origin:0 0;transform:translate(${this.ox}px,${this.oy}px) scale(${this.s})`;
  },
  x(cx) { return (cx - this.ox) / this.s; }, y(cy) { return (cy - this.oy) / this.s; }, // 화면 좌표 → 게임 좌표
  pr() { return Math.min((window.devicePixelRatio || 1) * this.s, 2); }, // 실제로 보이는 크기에 맞춘 해상도
};
if (VIEW.pc) document.body.classList.add('pc');
const settings = Object.assign({ sound: true, sfx: 0.8, music: 0.6, reduceFlash: false, quality: 'auto', sens: 1, cb: false, story: true }, Store.get('settings', {}));
function saveSettings() { Store.set('settings', settings); }
// 스팀 도전 과제: 게임 도전 과제 키 → ACH_키 (예: release → ACH_RELEASE). 데스크톱 앱 + 스팀 실행 중일 때만
function steamAch(key) { try { if (window.bhDesktop && window.bhDesktop.achieve) window.bhDesktop.achieve('ACH_' + String(key).toUpperCase()); } catch (e) { /* 스팀 없음 */ } }
// 예전에 깬 도전 과제도 스팀에 맞춰 줌 (스팀판 이전 기록, 다른 PC에서 깬 기록)
setTimeout(() => { const ch = (Store.get('records', {}).ch) || {}; for (const k of Object.keys(ch)) if (ch[k]) steamAch(k); }, 1500);
// 색약 모드: 빨간 경고(예고 원·돌격 경고·화면 밖 화살표)를 검은 테두리의 호박색으로 + 모양(점선 고리)으로도 구분
const WARN = () => (settings.cb ? '255,196,0' : '255,77,94');

const GRADES = [L('정식 출시', 'Released', '正式リリース', '正式发布'), L('베타', 'Beta', 'ベータ', '测试版'), L('알파', 'Alpha', 'アルファ', '内测版'), L('출시 연기', 'Delayed', 'リリース延期', '延期发布')];
// 저장된 등급은 저장할 때의 언어로 남아 있을 수 있음 → 두 언어 모두에서 순위를 찾음
const GRADES_ALL = [['정식 출시', '베타', '알파', '출시 연기'], ['Released', 'Beta', 'Alpha', 'Delayed'], ['正式リリース', 'ベータ', 'アルファ', 'リリース延期'], ['正式发布', '测试版', '内测版', '延期发布']];
const gradeIdx = (g) => { for (const list of GRADES_ALL) { const i = list.indexOf(g); if (i >= 0) return i; } return -1; };
const gradeName = (g) => { const i = gradeIdx(g); return i >= 0 ? GRADES[i] : g; };
