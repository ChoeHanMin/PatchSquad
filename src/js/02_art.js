// ---------- 코드로 그리는 픽셀 아트 ----------
const GLYPH = {
  '{': ['.##', '.#.', '##.', '.#.', '.##'],
  '}': ['##.', '.#.', '.##', '.#.', '##.'],
  ';': ['...', '.#.', '...', '.#.', '#..'],
  '?': ['##.', '..#', '.#.', '...', '.#.'],
  '4': ['#.#', '#.#', '###', '..#', '..#'],
  '0': ['###', '#.#', '#.#', '#.#', '###'],
  '!': ['#', '#', '#', '.', '#'],
  '~': ['.....', '.#.#.', '#.#.#', '.#.#.', '.....'], // ∞
};
function drawGlyphs(g, str, cx, cy, color) {
  const rows = str.split('').map((c) => GLYPH[c]);
  const w = rows.reduce((s, r) => s + r[0].length, 0) + rows.length - 1;
  let x = Math.round(cx - w / 2);
  const y = Math.round(cy - 2.5);
  g.fillStyle = color;
  for (const r of rows) {
    for (let j = 0; j < 5; j++) for (let i = 0; i < r[j].length; i++) if (r[j][i] === '#') g.fillRect(x + i, y + j, 1, 1);
    x += r[0].length + 1;
  }
}
function pixLine(g, x0, y0, x1, y1) {
  const dx = Math.abs(x1 - x0), dy = Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
  let err = dx - dy;
  for (let n = 0; n < 40; n++) {
    g.fillRect(x0, y0, 1, 1);
    if (x0 === x1 && y0 === y1) break;
    const e2 = 2 * err;
    if (e2 > -dy) { err -= dy; x0 += sx; }
    if (e2 < dx) { err += dx; y0 += sy; }
  }
}
const BUGSTYLE = {
  basic: { body: '#FF4D5E', dark: '#7a1824', eye: '#FFD34D', sym: '{}', symc: '#2a070c', rx: 7, ry: 6, legs: 3 },
  clone: { body: '#FFD34D', dark: '#8a6a10', eye: '#FF4D5E', sym: ';;', symc: '#3a2a00', rx: 7, ry: 6, legs: 3 },
  mini: { body: '#FFD34D', dark: '#8a6a10', eye: '#FF4D5E', sym: ';', symc: '#3a2a00', rx: 6, ry: 5, legs: 2 },
  ghost: { body: '#BFF6FF', dark: '#4a8a99', eye: '#FF4D5E', sym: '?', symc: '#12383f', rx: 7, ry: 6, legs: 3 },
  e404: { body: '#FF8A3D', dark: '#7a3210', eye: '#FFD34D', sym: '404', symc: '#2a0a00', rx: 8, ry: 6, legs: 3 },
  loop: { body: '#E05BFF', dark: '#5a1a70', eye: '#FFD34D', sym: '~', symc: '#25062e', rx: 7, ry: 7, legs: 2 },
  throw: { body: '#FF6B3D', dark: '#7a2410', eye: '#FFD34D', sym: '!', symc: '#2a0700', rx: 7, ry: 6, legs: 3 },
};
function bugCanvas(type, frame) {
  const st = BUGSTYLE[type];
  const c = document.createElement('canvas'); c.width = c.height = 24;
  const g = c.getContext('2d');
  const cx = 12, cy = 13;
  // 다리
  g.fillStyle = st.dark;
  for (const s of [-1, 1]) {
    for (let k = 0; k < st.legs; k++) {
      const y0 = cy - 3 + k * 3 + (st.legs === 2 ? 1 : 0);
      const wig = ((frame + k) % 2) ? 1 : -1;
      const x0 = cx + s * (st.rx - 1), kx = cx + s * (st.rx + 2), fx = cx + s * (st.rx + 4);
      pixLine(g, x0, y0, kx, y0 - 2 + wig);
      pixLine(g, kx, y0 - 2 + wig, fx, y0 + 2 + (k - 1));
    }
  }
  // 몸통
  for (let y = 0; y < 24; y++) for (let x = 0; x < 24; x++) {
    const d = ((x + 0.5 - cx) / st.rx) ** 2 + ((y + 0.5 - cy) / st.ry) ** 2;
    if (d <= 1) {
      const edge = ((x + 0.5 - cx) / (st.rx - 1.2)) ** 2 + ((y + 0.5 - cy) / (st.ry - 1.2)) ** 2 > 1;
      g.fillStyle = edge ? st.dark : st.body;
      g.fillRect(x, y, 1, 1);
    }
  }
  // 하이라이트
  g.fillStyle = 'rgba(255,255,255,.55)';
  g.fillRect(cx - 3, cy - st.ry + 2, 2, 1);
  // 눈 + 더듬이
  g.fillStyle = st.eye;
  g.fillRect(cx - 4, cy - st.ry + 1, 2, 2); g.fillRect(cx + 2, cy - st.ry + 1, 2, 2);
  g.fillStyle = st.dark;
  const ay = frame ? 0 : 1;
  pixLine(g, cx - 2, cy - st.ry, cx - 4, cy - st.ry - 3 + ay);
  pixLine(g, cx + 2, cy - st.ry, cx + 4, cy - st.ry - 3 + ay);
  // 오류 기호
  drawGlyphs(g, st.sym, cx, cy + 1.5, st.symc);
  return c;
}
function texFromCanvas(c, nearest = true) {
  const t = new THREE.CanvasTexture(c);
  if (nearest) { t.magFilter = THREE.NearestFilter; t.minFilter = THREE.NearestFilter; t.generateMipmaps = false; }
  return t;
}
const TEX = {};
function buildTextures() {
  for (const k of Object.keys(BUGSTYLE)) {
    TEX[k] = [texFromCanvas(bugCanvas(k, 0)), texFromCanvas(bugCanvas(k, 1))];
    // assets/ 그림이 있으면 그걸로 교체 (작은 복제는 없으면 복제 버그 그림 사용)
    const url = ASSETS[ASSET_KEY[k]] || (k === 'mini' && ASSETS.bug_clone);
    if (url) {
      const t = new THREE.Texture();
      t.magFilter = THREE.NearestFilter; t.minFilter = THREE.LinearFilter; t.generateMipmaps = false;
      const img = new Image();
      img.onload = () => { t.image = img; t.needsUpdate = true; };
      img.src = url;
      TEX[k] = [t, t];
      TEX[k].asset = true;
    }
  }
  // 핫픽스 아이템 (assets/item_hotfix.png 있으면 교체)
  TEX.hotfix = [texFromCanvas(hotfixCanvas(0)), texFromCanvas(hotfixCanvas(1))];
  if (ASSETS.item_hotfix) {
    const t = new THREE.Texture(); t.magFilter = THREE.NearestFilter; t.minFilter = THREE.LinearFilter; t.generateMipmaps = false;
    const img = new Image(); img.onload = () => { t.image = img; t.needsUpdate = true; }; img.src = ASSETS.item_hotfix;
    TEX.hotfix = [t, t];
  }
  // 적 탄: 관통 미사일(3D) · 에러 패킷(화면)
  TEX.missile = [texFromCanvas(missileCanvas(0)), texFromCanvas(missileCanvas(1))];
  if (ASSETS.proj_missile) TEX.missile = [assetTex(ASSETS.proj_missile), null]; if (!TEX.missile[1]) TEX.missile[1] = TEX.missile[0];
  IMG.packet = ASSETS.proj_packet ? imgOf(ASSETS.proj_packet) : packetCanvas();
  // 분대 얼굴 (assets/portrait_*.png 있으면 교체)
  IMG.portrait = SQUAD_LOOK.map((s, i) => (ASSETS['portrait_' + s.key] ? imgOf(ASSETS['portrait_' + s.key]) : portraitCanvas(s)));
  IMG.char = SQUAD_LOOK.map((s, i) => (ASSETS['char_' + s.key] ? imgOf(ASSETS['char_' + s.key]) : charCanvas(s, i)));
  // 자세: 기본 / 움찔(공격이 날아올 때) / 고통(맞았을 때). 없으면 기본 그림 사용
  IMG.pose = SQUAD_LOOK.map((s, i) => ({
    base: IMG.char[i],
    flinch: ASSETS['char_' + s.key + '_flinch'] ? imgOf(ASSETS['char_' + s.key + '_flinch']) : IMG.char[i],
    run: ASSETS['char_' + s.key + '_run'] ? imgOf(ASSETS['char_' + s.key + '_run']) : null,
    run2: ASSETS['char_' + s.key + '_run2'] ? imgOf(ASSETS['char_' + s.key + '_run2']) : null,
    hurt: ASSETS['char_' + s.key + '_hurt'] ? imgOf(ASSETS['char_' + s.key + '_hurt']) : IMG.char[i],
  }));
  // 무한루프 껍질 링
  {
    const c = document.createElement('canvas'); c.width = c.height = 40; const g = c.getContext('2d');
    for (let a = 0; a < 64; a++) {
      const th = (a / 64) * Math.PI * 2;
      g.fillStyle = a % 4 < 2 ? '#d9c2ff' : '#6B6F68';
      g.fillRect(Math.round(20 + Math.cos(th) * 18) - 1, Math.round(20 + Math.sin(th) * 18) - 1, 2, 2);
    }
    TEX.ring = texFromCanvas(c);
  }
  // 빛나는 지점
  {
    const c = document.createElement('canvas'); c.width = c.height = 16; const g = c.getContext('2d');
    const gr = g.createRadialGradient(8, 8, 0, 8, 8, 8);
    gr.addColorStop(0, 'rgba(255,255,220,1)'); gr.addColorStop(0.35, 'rgba(255,211,77,.9)'); gr.addColorStop(1, 'rgba(255,211,77,0)');
    g.fillStyle = gr; g.fillRect(0, 0, 16, 16);
    TEX.glow = texFromCanvas(c, false);
  }
  // 데코용 픽셀 노이즈 질감
  {
    const c = document.createElement('canvas'); c.width = c.height = 16; const g = c.getContext('2d');
    const r = mulberry32(99);
    for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) {
      const v = Math.floor(190 + r() * 65);
      g.fillStyle = `rgb(${v},${v},${v})`; g.fillRect(x, y, 1, 1);
    }
    g.fillStyle = 'rgba(0,0,0,.18)'; g.fillRect(0, 0, 16, 1); g.fillRect(0, 0, 1, 16);
    TEX.pix = texFromCanvas(c); TEX.pix.wrapS = TEX.pix.wrapT = THREE.RepeatWrapping;
  }
  // 창문 질감 (도시)
  {
    const c = document.createElement('canvas'); c.width = 16; c.height = 32; const g = c.getContext('2d');
    g.fillStyle = '#fff'; g.fillRect(0, 0, 16, 32);
    const r = mulberry32(7);
    for (let y = 2; y < 32; y += 4) for (let x = 2; x < 16; x += 4) { g.fillStyle = r() < 0.5 ? '#9a9a9a' : '#5a5a5a'; g.fillRect(x, y, 2, 2); }
    TEX.win = texFromCanvas(c); TEX.win.wrapS = TEX.win.wrapT = THREE.RepeatWrapping;
  }
}
// 보스 코드 줄 텍스처
function codeCanvas(text, mode, head) {
  const c = document.createElement('canvas'); c.width = 512; c.height = head ? 128 : 80;
  const g = c.getContext('2d');
  const pal = {
    norm: ['rgba(18,22,18,.92)', '#9aa096', '#3a3f37'],
    err: ['rgba(70,8,16,.95)', '#FF6B7A', '#FF4D5E'],
    fake: ['rgba(46,16,20,.9)', '#a85a63', '#5a2a30'],
    fixed: ['rgba(10,40,14,.95)', '#9CFF7A', '#C6F432'],
  }[mode];
  g.fillStyle = pal[0]; g.fillRect(0, 0, c.width, c.height);
  g.strokeStyle = pal[2]; g.lineWidth = 6; g.strokeRect(3, 3, c.width - 6, c.height - 6);
  g.fillStyle = pal[1];
  g.font = (head ? 'bold 56px ' : 'bold 30px ') + 'ui-monospace, Menlo, Consolas, monospace';
  g.textBaseline = 'middle';
  g.fillText(text, 18, c.height / 2 + 2, c.width - 30);
  if (mode === 'err') { // 물결 밑줄
    g.strokeStyle = '#FFD34D'; g.lineWidth = 3; g.beginPath();
    for (let x = 18; x < 490; x += 8) g.lineTo(x, c.height - 14 + ((x / 8) % 2 ? -4 : 0));
    g.stroke();
  }
  const t = new THREE.CanvasTexture(c); t.minFilter = THREE.LinearFilter; t.generateMipmaps = false;
  return t;
}
function hotfixCanvas(frame) { // 초록 패치 패키지 (+)
  const c = document.createElement('canvas'); c.width = c.height = 24; const g = c.getContext('2d');
  g.fillStyle = '#10140c'; g.fillRect(3, 4, 18, 17);
  g.fillStyle = frame ? '#E6FF7A' : '#C6F432'; g.fillRect(4, 5, 16, 15);
  g.fillStyle = '#8fb81e'; g.fillRect(4, 17, 16, 3); g.fillRect(17, 5, 3, 15);
  g.fillStyle = '#ffffff'; g.fillRect(7, 5, 8, 4);
  g.fillStyle = '#10140c'; g.fillRect(11, 6, 2, 2);
  g.fillStyle = '#1f5a1a'; g.fillRect(10, 10, 4, 8); g.fillRect(8, 12, 8, 4); // +
  g.fillStyle = '#ffffff'; g.fillRect(11, 11, 2, 6); g.fillRect(9, 13, 6, 2);
  if (frame) { g.fillStyle = '#ffffff'; g.fillRect(1, 2, 2, 2); g.fillRect(21, 1, 2, 2); g.fillRect(22, 20, 2, 2); }
  return c;
}
// 패치 건 (오른쪽을 향함, 32×14 픽셀). assets/gun.png 있으면 교체
function gunCanvas(stripe) {
  const c = document.createElement('canvas'); c.width = 34; c.height = 16; const g = c.getContext('2d');
  const R = (x, y, w, h, col) => { g.fillStyle = col; g.fillRect(x, y, w, h); };
  // 외곽선
  R(4, 2, 22, 10, '#0a0c09'); R(24, 4, 10, 6, '#0a0c09'); R(3, 9, 9, 7, '#0a0c09');
  // 손잡이 · 몸통 · 총열
  R(4, 10, 7, 6, '#2a2f28');
  R(5, 3, 20, 8, '#3a4037'); R(5, 3, 20, 1, '#5a6156');
  R(25, 5, 8, 4, '#6B6F68'); R(25, 5, 8, 1, '#8a9084');
  R(31, 5, 2, 4, stripe); // 총구
  R(6, 7, 18, 1, stripe); // 줄
  R(8, 4, 7, 2, '#0f2a10'); R(9, 4, 1, 1, stripe); R(11, 5, 1, 1, stripe); R(13, 4, 1, 1, stripe); // 작은 화면
  R(18, 4, 2, 2, '#FF4D5E');
  return c;
}
const ASSET_KEY = { basic: 'bug_basic', clone: 'bug_clone', mini: 'bug_mini', ghost: 'bug_ghost', e404: 'bug_404', loop: 'bug_loop', throw: 'bug_throw' };
function bugImgCanvas(type) { // DOM용 (크래시 화면)
  const url = ASSETS[ASSET_KEY[type]];
  if (url) { const img = new Image(); img.src = url; img.className = 'asset'; return img; }
  const src = bugCanvas(type, 0);
  const c = document.createElement('canvas'); c.width = c.height = 24;
  c.getContext('2d').drawImage(src, 0, 0);
  return c;
}

function findMuzzle(img) {
  const c = document.createElement('canvas'), n = 96;
  c.width = n; c.height = Math.max(1, Math.round(n * img.naturalHeight / img.naturalWidth));
  const g = c.getContext('2d'); g.drawImage(img, 0, 0, c.width, c.height);
  let best = null, bd = 1e9;
  try {
    const d = g.getImageData(0, 0, c.width, c.height).data;
    for (let y = 0; y < c.height; y++) for (let x = 0; x < c.width; x++) {
      if (d[(y * c.width + x) * 4 + 3] > 128 && x + y < bd) { bd = x + y; best = { x: (x + 1.5) / c.width, y: (y + 1.5) / c.height }; }
    }
  } catch (e) { /* 읽기 실패 시 기본값 */ }
  return best || { x: 0.12, y: 0.12 };
}

const _hot = new WeakMap();
function hotTint(img) { // 과열된 총: 빨갛게 달아오른 색을 한 번만 만들어 둠
  let c = _hot.get(img);
  if (c) return c;
  c = document.createElement('canvas'); c.width = img.naturalWidth || img.width; c.height = img.naturalHeight || img.height;
  const g = c.getContext('2d'); g.drawImage(img, 0, 0);
  g.globalCompositeOperation = 'source-atop';
  const gr = g.createLinearGradient(0, 0, c.width, c.height);
  gr.addColorStop(0, 'rgba(255,240,120,.9)'); gr.addColorStop(0.35, 'rgba(255,90,30,.85)'); gr.addColorStop(0.62, 'rgba(200,40,20,.35)'); gr.addColorStop(0.78, 'rgba(160,20,20,0)'); // 손(오른쪽 아래)은 그대로
  g.fillStyle = gr; g.fillRect(0, 0, c.width, c.height);
  _hot.set(img, c);
  return c;
}

const IMG = {};
function imgOf(url) { const im = new Image(); im.src = url; return im; }
function assetTex(url) {
  const t = new THREE.Texture(); t.magFilter = THREE.NearestFilter; t.minFilter = THREE.LinearFilter; t.generateMipmaps = false;
  const im = new Image(); im.onload = () => { t.image = im; t.needsUpdate = true; }; im.src = url;
  return t;
}
function missileCanvas(frame) { // 보라색 무한루프 미사일, 정면에서 날아오는 모습
  const c = document.createElement('canvas'); c.width = c.height = 24; const g = c.getContext('2d');
  const P = (x, y, w, h, col) => { g.fillStyle = col; g.fillRect(x, y, w, h); };
  // 불꽃 (뒤쪽, 둥글게 번짐)
  P(4, 4, 16, 16, frame ? 'rgba(255,211,77,.55)' : 'rgba(255,138,61,.45)');
  P(6, 6, 12, 12, frame ? '#FFD34D' : '#FF8A3D');
  // 탄두
  P(7, 7, 10, 10, '#25062e'); P(8, 8, 8, 8, '#E05BFF'); P(9, 9, 3, 2, '#f4c8ff');
  drawGlyphs(g, '~', 12, 12.5, '#25062e');
  return c;
}
function packetCanvas() { // 빨간 봉투 모양 에러 패킷
  const c = document.createElement('canvas'); c.width = 20; c.height = 14; const g = c.getContext('2d');
  g.fillStyle = '#2a070c'; g.fillRect(0, 0, 20, 14);
  g.fillStyle = '#FF4D5E'; g.fillRect(1, 1, 18, 12);
  g.fillStyle = '#b3243a'; for (let i = 0; i < 9; i++) { g.fillRect(1 + i, 1 + i * 0.6, 1, 1); g.fillRect(18 - i, 1 + i * 0.6, 1, 1); }
  drawGlyphs(g, '!', 10, 8, '#FFD34D');
  return c;
}
// 분대 얼굴 (코드 그림 대체용): 모자·헤드셋 색으로 구분
const SQUAD_LOOK = [
  { key: 'dot', hair: '#2a2f28', cap: '#C6F432', skin: '#f2c9a0', acc: '#C6F432' },
  { key: 'rex', hair: '#7a3210', cap: '#FFD34D', skin: '#e8b48a', acc: '#FFD34D' },
  { key: 'pin', hair: '#1d2f6e', cap: '#6fe7ff', skin: '#f6d2b0', acc: '#6fe7ff' },
  { key: 'ada', hair: '#3a2418', cap: '#FF5FA2', skin: '#f4cba6', acc: '#FF5FA2' },
];
function portraitCanvas(s) {
  const c = document.createElement('canvas'); c.width = c.height = 24; const g = c.getContext('2d');
  const P = (x, y, w, h, col) => { g.fillStyle = col; g.fillRect(x, y, w, h); };
  P(0, 0, 24, 24, '#151913');
  P(5, 18, 14, 6, '#3a4037'); P(6, 18, 12, 1, s.acc); // 어깨
  P(7, 7, 10, 11, s.skin); P(6, 5, 12, 4, s.hair); P(6, 4, 12, 2, s.cap); P(5, 6, 3, 2, s.cap); // 얼굴·머리·모자
  P(9, 11, 2, 2, '#10140c'); P(13, 11, 2, 2, '#10140c'); P(10, 15, 4, 1, '#7a3a2a'); // 눈·입
  P(4, 9, 2, 6, '#2a2f28'); P(18, 9, 2, 6, '#2a2f28'); P(4, 14, 4, 1, s.acc); // 헤드셋
  return c;
}

// 엄폐 중인 캐릭터 뒷모습 (웅크림). 그림이 오기 전 대체용 32×48 픽셀
function charCanvas(s, i) {
  const c = document.createElement('canvas'); c.width = 32; c.height = 48; const g = c.getContext('2d');
  const P = (x, y, w, h, col) => { g.fillStyle = col; g.fillRect(x, y, w, h); };
  const O = '#0a0c09';
  // 외곽선 덩어리
  P(9, 8, 14, 13, O); P(6, 19, 21, 18, O); P(5, 35, 23, 12, O);
  // 다리 (웅크림)
  P(7, 37, 8, 9, '#2a2f28'); P(17, 37, 9, 9, '#2a2f28'); P(6, 44, 10, 3, '#1a1d19'); P(17, 44, 10, 3, '#1a1d19');
  // 몸통·배낭
  P(7, 20, 19, 17, '#3a4037'); P(10, 22, 13, 11, '#4a5046'); P(10, 22, 13, 2, s.acc); P(15, 24, 3, 8, '#2a2f28');
  // 팔
  P(5, 23, 4, 10, '#3a4037'); P(24, 23, 4, 9, '#3a4037'); P(25, 31, 3, 3, '#1d2f6e');
  // 머리 (뒤통수)·모자·헤드셋
  P(10, 9, 12, 11, s.hair); P(10, 8, 12, 4, s.cap); P(9, 10, 2, 3, s.cap); P(9, 13, 2, 5, '#2a2f28'); P(21, 13, 2, 5, '#2a2f28');
  P(12, 18, 8, 2, s.skin);
  // 총 (오른쪽 위로 비스듬히)
  const gc = ['#C6F432', '#FFD34D', '#6fe7ff', '#FF5FA2'][i] || '#C6F432';
  for (let k = 0; k < (i === 2 ? 14 : 10); k++) P(25 + Math.floor(k * 0.4), 30 - k, 2, 2, k > (i === 2 ? 11 : 7) ? gc : '#3a4037');
  return c;
}
