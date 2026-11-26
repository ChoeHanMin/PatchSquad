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

// localStorage는 막혀 있을 수 있음 → 항상 try/catch
const Store = {
  get(k, d) { try { const v = localStorage.getItem('patchsquad_' + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem('patchsquad_' + k, JSON.stringify(v)); } catch (e) { /* 저장 없이 진행 */ } },
};

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
const settings = Object.assign({ sound: true, sfx: 0.8, music: 0.6, reduceFlash: false, quality: 'auto' }, Store.get('settings', {}));
function saveSettings() { Store.set('settings', settings); }

const GRADES = ['정식 출시', '베타', '알파', '출시 연기'];
