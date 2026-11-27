// ---------- 게임 본체: 쏘고 숨는 엄폐 사격 ----------
// 누르고 있으면 엄폐물 위로 나와 사격, 떼면 숨어서 재장전.
// 스테이지마다 엄폐 지점 3곳 → 웨이브를 다 처리하면 다음 엄폐물로 이동.
const STAGES = [
  { id: 1, key: 'forest', name: L('텍스처 없는 숲', 'Textureless Forest', 'テクスチャのない森', '无贴图森林'), theme: 0x6BD66B, sky: 0x173a26, count: 18, mix: { basic: 5, throw: 6 }, intro: ['basic', 'throw'], fog: [18, 95, 30, 150], light: [0.8, 1.1], cover: 0x8a6a3a },
  { id: 2, key: 'city', name: L('복붙 도시', 'Copy-Paste City', 'コピペシティ', '复制粘贴之城'), theme: 0xFF9E3D, sky: 0x2a1838, count: 22, mix: { basic: 5, throw: 4, clone: 6 }, intro: ['clone'], join: 1, fog: [22, 110, 30, 160], light: [0.8, 1.1], cover: 0x8a8a92 },
  { id: 3, key: 'subway', name: L('렌더링 지하철', 'Render Subway', 'レンダリング地下鉄', '渲染地铁'), theme: 0x3DE0D0, sky: 0x0b2a30, count: 26, mix: { basic: 5, throw: 3, clone: 4, ghost: 6 }, intro: ['ghost'], join: 2, fog: [6, 34, 18, 95], light: [0.25, 1.05], cover: 0x2a6a7a },
  { id: 4, key: 'server', name: L('테스트 서버실', 'Test Server Room', 'テストサーバールーム', '测试服务器机房'), theme: 0xFF5FA2, sky: 0x2a0f24, count: 27, mix: { basic: 4, throw: 3, clone: 4, ghost: 3, e404: 5 }, intro: ['e404'], join: 3, fog: [14, 80, 26, 130], light: [0.6, 1.05], cover: 0x5a3a52 },
  { id: 5, key: 'physics', name: L('물리 고장 구역', 'Broken Physics Zone', '物理崩壊エリア', '物理故障区'), theme: 0xB07CFF, sky: 0x22163a, count: 30, mix: { basic: 4, throw: 3, clone: 4, ghost: 3, e404: 5, loop: 4 }, intro: ['loop'], fog: [18, 100, 30, 150], light: [0.75, 1.1], cover: 0x6a4a9a },
  { id: 6, key: 'boss', name: L('중간 보스 "메인 루프"', 'Mid-boss "Main Loop"', '中ボス「メインループ」', '中Boss“主循环”'), theme: 0xC6F432, sky: 0x0f2a12, boss: true, fog: [30, 120, 40, 170], light: [0.7, 1.1], cover: 0x3a4a3a },
];
// 엄폐 종류: low = 낮은 벽 (웅크렸다가 일어나 벽 위로 쏨), side = 세로 기둥 (기대 서 있다가 오른쪽으로 몸을 빼서 쏨)
const COVER_KINDS = [['low', 'side', 'low'], ['side', 'low', 'side'], ['low', 'low', 'side'], ['side', 'low', 'low'], ['low', 'side', 'side']];
const COVER_U = [0.1, 0.45, 0.8]; // 엄폐 지점 (레일 위치)
// 분대: 직접 조작 1명 + 나머지 자동 사격
const SQUAD = [
  { key: 'dot', name: L('도트', 'Dot', 'ドット', '多特'), role: L('디버거', 'Debugger', 'デバッガー', '调试器'), kind: 'rifle', label: L('연사', 'Rapid', '連射', '连射'), color: '#C6F432', rate: 9, dmg: 1, mag: 36, reload: 1.1, heat: 2.4, aiRate: 1.0, aiDmg: 1 },
  { key: 'rex', name: L('렉스', 'Rex', 'レックス', '雷克斯'), role: L('리팩터', 'Refactor', 'リファクタ', '重构'), kind: 'shotgun', label: L('산탄', 'Spread', '散弾', '散弹'), color: '#FFD34D', rate: 1.6, dmg: 1, pellets: 7, mag: 8, reload: 1.5, heat: 13, aiRate: 0.4, aiDmg: 2 },
  { key: 'pin', name: L('핀', 'Pin', 'ピン', '平'), role: L('프로파일러', 'Profiler', 'プロファイラ', '分析器'), kind: 'sniper', label: L('저격', 'Sniper', '狙撃', '狙击'), color: '#6fe7ff', charge: 0.85, dmg: 8, mag: 5, reload: 1.6, heat: 22, aiRate: 0.22, aiDmg: 4 },
  { key: 'ada', name: L('에이다', 'Ada', 'エイダ', '艾达'), role: L('테스터', 'Tester', 'テスター', '测试员'), kind: 'launcher', label: L('런처', 'Launcher', 'ランチャー', '发射器'), color: '#FF5FA2', rate: 1.25, dmg: 3, splash: 1, mag: 6, reload: 1.6, heat: 16, aiRate: 0.33, aiDmg: 3 },
];
const GLITCH = {
  tear: { name: L('화면 찢어짐', 'Screen Tear', '画面の裂け目', '画面撕裂'), dur: 4 },
  inv: { name: L('색 반전', 'Color Invert', '色反転', '颜色反转'), dur: 3 },
  flip: { name: L('UI 뒤집힘', 'UI Flip', 'UI反転', 'UI翻转'), dur: 5 },
  slip: { name: L('조준 미끄러짐', 'Aim Slip', '照準ずれ', '准星漂移'), dur: 4 },
  pix: { name: L('픽셀화', 'Pixelate', 'ピクセル化', '像素化'), dur: 2 },
};
const NORMAL_SEED = 20261125;
// 난이도: 하 / 중 / 상
const DIFF = {
  easy: { key: 'easy', name: L('하', 'Easy', 'イージー', '简单'), label: L('쉬움', 'Easy', 'イージー', '简单'), spd: 0.82, dmg: 0.55, count: 0.9, maxOn: 7, glDur: 0.6, maxGl: 1, assist: 12, rb: 3, hotfix: 1, combo: 4,
    tele: 1.5, fireMul: 1.7, coverHp: 180, trickle: 0, scatter: false, dash: 0, heat: false, trojan: 0, bossHp: -1, bossSpd: 0.75, bossSpawn: 1.6, bossK: 2.2, helpAt: 1 },
  normal: { key: 'normal', name: L('중', 'Normal', 'ノーマル', '普通'), label: L('보통', 'Normal', 'ノーマル', '普通'), spd: 1.02, dmg: 0.85, count: 1.15, maxOn: 9, glDur: 0.85, maxGl: 2, assist: 4, rb: 2, hotfix: 0, combo: 5,
    tele: 1.15, fireMul: 1.08, coverHp: 130, trickle: 0, scatter: false, dash: 0, heat: false, trojan: 0, bossHp: 0, bossSpd: 0.9, bossSpawn: 1.25, bossK: 3.5, helpAt: 2 },
  hard: { key: 'hard', name: L('상', 'Hard', 'ハード', '困难'), label: L('어려움', 'Hard', 'ハード', '困难'), spd: 1.25, dmg: 1.15, count: 1.35, maxOn: 11, glDur: 1.3, maxGl: 3, assist: -6, rb: 1, hotfix: -1, combo: 8,
    tele: 0.75, fireMul: 0.72, coverHp: 70, trickle: 4.0, scatter: true, dash: 0.28, heat: true, trojan: 0.4, bossHp: 1, bossSpd: 1.3, bossSpawn: 0.6, bossK: 4, helpAt: 2 },
};
DIFF.tutorial = Object.assign({}, DIFF.easy, { key: 'tutorial', name: L('튜토리얼', 'Tutorial', 'チュートリアル', '教程'), label: L('튜토리얼', 'Tutorial', 'チュートリアル', '教程'), maxOn: 4, count: 1 });
// 약점 무기: 맞는 무기로 쏘면 피해 2배 (산탄은 돌격형을 밀어내고, 저격은 무한루프 껍질을 뚫음)
const WEAK = { basic: 'shotgun', clone: 'shotgun', mini: 'launcher', throw: 'sniper', ghost: 'sniper', loop: 'sniper', e404: 'rifle', missile: 'rifle' };
const KIND_INFO = {
  rifle: { member: 0, glyph: L('연', 'D', 'D', 'D'), color: '#C6F432', name: L('연사(도트)', 'Rapid (Dot)', '連射(ドット)', '连射（多特）') },
  shotgun: { member: 1, glyph: L('산', 'R', 'R', 'R'), color: '#FFD34D', name: L('산탄(렉스)', 'Spread (Rex)', '散弾(レックス)', '散弹（雷克斯）') },
  sniper: { member: 2, glyph: L('저', 'P', 'P', 'P'), color: '#6fe7ff', name: L('저격(핀)', 'Sniper (Pin)', '狙撃(ピン)', '狙击（平）') },
  launcher: { member: 3, glyph: L('캡', 'A', 'A', 'A'), color: '#FF5FA2', name: L('런처(에이다)', 'Launcher (Ada)', 'ランチャー(エイダ)', '发射器（艾达）') },
};
const _proj = new THREE.Vector3();

const Game = {
  scene: null, camera: null, camR: new THREE.Vector3(1, 0, 0), camU: new THREE.Vector3(0, 1, 0), camF: new THREE.Vector3(0, 0, -1),
  look: new THREE.Vector3(), time: 0, state: 'title', run: null, S: null, bugs: [], bugSpeedMul: 1, ws: 1, rollT: 0,
  weapon: 0, refT: 0, lastShot: -9, ptr: { x: -100, y: -100, down: false, id: null, has: false, lx: 0, ly: 0 },
  ret: { x: 0, y: 0 }, out: false, outK: 0, squad: [], attacks: [], allyFx: [], cover: { hp: 100, max: 100, broken: false },
  glitches: [], slip: { x: 0, y: 0 }, tracers: [], pops: [], taps: [], W: 1, H: 1, tanHalf: 1,
  hintT: 0, bannerT: 0, toastT: 0, fpsAcc: 0, fpsN: 0, titleBugs: [], titleU: 0, camSpeed: 0, seen: {},

  init() {
    buildTextures(); initGeo();
    FX.init($('#gl'));
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(70, 1, 0.1, 400);
    this.scene.add(this.camera);
    World.init(this.scene);
    PFX.init(this.scene);
    this.buildCover();
    this.ov = $('#ov'); this.g2 = this.ov.getContext('2d');
    this.resize();
    window.addEventListener('resize', () => this.resize());
    this.bindInput();
    this.toTitle();
    // 열자마자 소리 켜기 시도 (예전에 이 사이트에서 소리를 들은 적이 있으면 바로 나올 수 있음)
    try { SND.init(); if (SND.ctx) { MUS.startTitle(); SND.ctx.onstatechange = () => UI.soundHint(); } } catch (e) { /* 소리 없이 진행 */ }
    UI.soundHint();
    this.last = performance.now();
    const loop = (t) => { requestAnimationFrame(loop); this.frame(t); };
    requestAnimationFrame(loop);
  },
  resize() {
    VIEW.fit();
    this.W = VIEW.w; this.H = VIEW.h;
    const a = this.W / this.H;
    this.camera.aspect = a;
    // 세로 화면이면 시야각을 넓혀 보정
    this.camera.fov = a < 1 ? clamp(2 * Math.atan(Math.tan((74 * Math.PI) / 360) / a) * 180 / Math.PI, 70, 100) : 70;
    this.camera.updateProjectionMatrix();
    this.tanHalf = Math.tan((this.camera.fov * Math.PI) / 360);
    FX.resize();
    const pr = VIEW.pc ? VIEW.pr() : Math.min(window.devicePixelRatio || 1, 2);
    this.ov.width = this.W * pr; this.ov.height = this.H * pr; this.g2.setTransform(pr, 0, 0, pr, 0, 0);
    if (!this.ret.x) { this.ret.x = this.W / 2; this.ret.y = this.H * 0.42; }
    this.ret.x = clamp(this.ret.x, 0, this.W); this.ret.y = clamp(this.ret.y, 0, this.H);
  },

  // ----- 엄폐물 (카메라에 붙은 낮은 벽) -----
  buildCover() {
    const g = new THREE.Group();
    this.coverMat = new THREE.MeshLambertMaterial({ color: 0x8a6a3a, map: TEX.pix, fog: false });
    this.coverTopMat = new THREE.MeshBasicMaterial({ color: 0xC6F432, fog: false });
    const body = new THREE.Mesh(GEO.box, this.coverMat); body.scale.set(4.2, 1, 0.35);
    const top = new THREE.Mesh(GEO.box, this.coverTopMat); top.scale.set(4.2, 0.05, 0.37); top.position.y = 0.5;
    const lines = new THREE.LineSegments(edgesOf(GEO.box), new THREE.LineBasicMaterial({ color: 0x10140c, fog: false })); lines.scale.copy(body.scale);
    // 블록 이음새
    for (let i = -3; i <= 3; i++) { const s = new THREE.Mesh(GEO.box, new THREE.MeshBasicMaterial({ color: 0x10140c, fog: false })); s.scale.set(0.02, 1, 0.36); s.position.x = i * 0.6 + (i % 2 ? 0.15 : 0); g.add(s); }
    g.add(body, top, lines);
    g.position.set(0, -0.6, -1.35);
    g.renderOrder = 5;
    this.coverMesh = g; this.camera.add(g);
    g.visible = false;
    // 3인칭 엄폐: 캐릭터가 등을 기대는 키 큰 벽 (화면 왼쪽)
    const w = new THREE.Group();
    const wb = new THREE.Mesh(GEO.box, this.coverMat); wb.scale.set(1.3, 5, 0.6);
    const wl = new THREE.LineSegments(edgesOf(GEO.box), new THREE.LineBasicMaterial({ color: 0x10140c, fog: false })); wl.scale.copy(wb.scale);
    const we = new THREE.Mesh(GEO.box, this.coverTopMat); we.scale.set(0.06, 5, 0.62); we.position.x = 0.65; // 모서리 빛
    for (let k = -2; k <= 2; k++) { const sl = new THREE.Mesh(GEO.box, new THREE.MeshBasicMaterial({ color: 0x10140c, fog: false })); sl.scale.set(1.31, 0.03, 0.61); sl.position.y = k * 0.9; w.add(sl); }
    w.add(wb, wl, we); w.position.set(-1.6, 0.2, -2.1); w.visible = false;
    this.sideWall = w; this.camera.add(w);
  },

  // ----- 입력 -----
  bindInput() {
    const cv = $('#gl');
    cv.addEventListener('pointerdown', (e) => {
      SND.init();
      if (this.ptr.id != null && this.ptr.down && e.pointerType === 'touch') return;
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      this.ptr.id = e.pointerId; this.ptr.down = true; this.ptr.has = true; this.ptr.mouse = e.pointerType === 'mouse';
      const ex = VIEW.x(e.clientX), ey = VIEW.y(e.clientY);
      this.ptr.lx = ex; this.ptr.ly = ey;
      if (this.ptr.mouse) { const q = this.sensMap(ex, ey); this.ret.x = q.x; this.ret.y = q.y; }
      else this.taps.push({ x: ex, y: ey, t: 0 });
      e.preventDefault();
    });
    window.addEventListener('pointermove', (e) => {
      const ex = VIEW.x(e.clientX), ey = VIEW.y(e.clientY);
      if (e.pointerType === 'mouse') { const q = this.sensMap(ex, ey); this.ret.x = q.x; this.ret.y = q.y; this.ptr.has = true; this.ptr.mouse = true; return; }
      if (e.pointerId !== this.ptr.id) return;
      // 터치: 손가락이 조준점을 가리지 않게, 끈 만큼 조준점이 움직임
      const k = 1.35;
      this.ret.x = clamp(this.ret.x + (ex - this.ptr.lx) * k, 8, this.W - 8);
      this.ret.y = clamp(this.ret.y + (ey - this.ptr.ly) * k, 8, this.H - 8);
      this.ptr.lx = ex; this.ptr.ly = ey;
    });
    const up = (e) => { if (e.pointerId === this.ptr.id) { this.ptr.down = false; this.ptr.id = null; this.release(); } };
    window.addEventListener('pointerup', up); window.addEventListener('pointercancel', up);
    window.addEventListener('contextmenu', (e) => e.preventDefault());
    document.addEventListener('gesturestart', (e) => e.preventDefault());
    window.addEventListener('wheel', (e) => { if (this.state === 'play') this.cycleMember(e.deltaY > 0 ? 1 : -1); }, { passive: true });
    window.addEventListener('keydown', (e) => {
      if (e.repeat) return;
      if (e.key === 'Escape') { if (this.state === 'play') UI.pause(); else if (this.state === 'paused') UI.resume(); return; }
      if (this.state !== 'play') return;
      if (e.key >= '1' && e.key <= String(SQUAD.length)) this.selectMember(+e.key - 1);
      else if (e.code === 'Space' || e.key === 'q' || e.key === 'Q') { this.rollback(); e.preventDefault(); }
    });
    $$('.mem').forEach((b) => b.addEventListener('pointerdown', (e) => { e.stopPropagation(); e.preventDefault(); SND.init(); this.selectMember(+b.dataset.m); }));
    $$('.wpn.rb').forEach((b) => b.addEventListener('pointerdown', (e) => { e.stopPropagation(); e.preventDefault(); SND.init(); this.rollback(); }));
    // 타이틀 음악은 첫 터치·클릭 뒤에 시작 (브라우저 정책)
    // 브라우저는 사용자의 첫 입력 전엔 소리를 막음. 폰 터치는 손을 '뗄 때' 허락되므로 여러 이벤트에서 모두 시도
    const unlock = () => {
      SND.init();
      if (this.state === 'title' && SND.ctx) MUS.startTitle();
      UI.soundHint();
    };
    for (const ev of ['pointerdown', 'pointerup', 'touchstart', 'touchend', 'mousedown', 'click', 'keydown']) window.addEventListener(ev, unlock, { capture: true, passive: true });
    document.addEventListener('visibilitychange', () => { if (document.hidden && this.state === 'play') UI.pause(); });
    window.addEventListener('blur', () => { if (this.state === 'play') UI.pause(); });
  },
  get D() { return DIFF[(this.run && this.run.diff) || 'normal']; },
  // 마우스 감도 (설정 0.6~1.6). 1이면 마우스 위치 = 조준점
  sensMap(ex, ey) { const s = settings.sens || 1, cx = this.W / 2, cy = this.H / 2; return { x: clamp(cx + (ex - cx) * s, 0, this.W), y: clamp(cy + (ey - cy) * s, 0, this.H) }; },
  maxOn() { return this.D.maxOn; },

  // ----- 분대 -----
  isTut() { return !!(this.run && this.run.diff === 'tutorial'); },
  memberUnlocked(i) { if (this.isTut()) return true; const s = this.run ? this.run.stage : 0; return i === 0 || (i === 1 && s >= 1) || (i === 2 && s >= 2) || (i === 3 && s >= 3); },
  unlocked(w) { if (this.isTut()) return true; return w === 2 ? (this.run ? this.run.stage >= 2 : false) : this.memberUnlocked(w); }, // 2 = 롤백
  get cur() { return this.weapon; },
  member() { return this.squad[this.weapon]; },
  selectMember(i) {
    if (!this.memberUnlocked(i)) { UI.toast(SQUAD[i].name + '(' + SQUAD[i].role + L(')는 스테이지 ', ') joins at Stage ', ') 解放: ステージ ', ') 解锁于关卡') + (i + 1) + L('부터 합류해요', '', '', '')); return; }
    if (this.weapon === i) return;
    SND.play('click');
    this.weapon = i; this.charge = 0;
    UI.toast(SQUAD[i].name + ' · ' + SQUAD[i].role + ' (' + SQUAD[i].label + ')');
  },
  cycleMember(dir) { const N = SQUAD.length; for (let k = 1; k < N; k++) { const i = (this.weapon + dir * k + N * 3) % N; if (this.memberUnlocked(i)) { this.selectMember(i); return; } } },
  resetSquad() { this.squad = SQUAD.map((d) => ({ d, ammo: d.mag, reloadT: 0, cd: 0, aiT: rnd(0.5, 1.5) })); this.charge = 0; },
  refReady() { return true; },

  // ----- 사격 -----
  canFight() { return this.state === 'play' && this.S && this.S.started && !this.S.ending && this.S.phase === 'fight'; },
  canEnemiesAct() { return this.canFight(); },
  aim() { // 실제 조준점 (조준 미끄러짐 고장 반영)
    let x = this.ret.x, y = this.ret.y;
    if (this.hasGlitch('slip')) { x += this.slip.x; y += this.slip.y; }
    return { x, y };
  },
  retR() { return Math.max(14, (IS_TOUCH ? 30 : 22) + this.D.assist); }, // 조준 원 반지름
  updateFiring(dt) {
    const m = this.member(); if (!m) return;
    // 재장전: 숨어 있거나 탄이 비면 진행
    for (const q of this.squad) {
      if (q.reloadT > 0) { q.reloadT -= dt * (this.rollT > 0 ? 1.6 : 1); if (q.reloadT <= 0) { q.reloadT = 0; q.ammo = q.d.mag; if (q === m) SND.play('reload'); } }
    }
    if (!this.out && m.ammo < m.d.mag && m.reloadT <= 0) m.reloadT = m.d.reload * (1 - m.ammo / m.d.mag * 0.5);
    if (!this.canFight()) return;
    const ready = this.out && this.outK > 0.6 && m.reloadT <= 0 && m.ammo > 0 && !(this.overT > 0);
    if (this.out && this.overT > 0 && Math.random() < dt * 3) this.pop(this.ret.x, this.ret.y - 30, L('과열!', 'Overheat!', 'オーバーヒート!', '过热！'), '#FF8A3D');
    if (m.d.kind === 'sniper') {
      if (ready) { this.charge = Math.min(1, this.charge + dt / m.d.charge); if (this.charge >= 1) this.fireSniper(1); }
      else if (!this.out) this.charge = 0;
    } else if (ready) {
      m.cd -= dt;
      while (m.cd <= 0 && m.ammo > 0) {
        m.cd += 1 / m.d.rate;
        m.d.kind === 'rifle' ? this.fireRifle(m) : m.d.kind === 'launcher' ? this.fireLauncher(m) : this.fireShotgun(m);
      }
    } else m.cd = Math.max(m.cd, 0);
    if (this.out && m.ammo <= 0 && m.reloadT <= 0) {
      m.reloadT = m.d.reload;
      if (!this.seen.empty) { this.seen.empty = true; UI.hint(L('탄창이 비었어요! 손을 떼고 숨으면 재장전이 빨라요', 'Out of ammo! Let go and hide to reload faster', '弾切れ! 離して隠れるとリロードが速くなる', '弹匣空了！松开隐蔽可以更快换弹'), 3); }
    }
  },
  release() { // 손을 뗌 → 저격은 충전된 만큼 발사, 그리고 숨기
    const m = this.member();
    if (m && m.d.kind === 'sniper' && this.charge >= 0.35 && this.canFight() && m.ammo > 0 && m.reloadT <= 0) this.fireSniper(this.charge);
    this.charge = 0;
  },
  shotCommon(m, heat) {
    m.ammo--; this.recoil = Math.max(this.recoil, m.d.kind === 'rifle' ? 0.7 : 1.5);
    this.lastShot = this.time;
    if (this.D.heat) this.addHeat(heat);
  },
  fireRifle(m) {
    this.shotCommon(m, m.d.heat);
    this.run.st.shots++; this.S.shots++;
    SND.play('rifle');
    const a = this.aim(), r = this.retR();
    const x = a.x + rnd(-r, r) * 0.35, y = a.y + rnd(-r, r) * 0.35;
    const g = this.gunPos();
    this.tracers.push({ x0: g.x, y0: g.y, x1: x, y1: y, t: 0, w: 3, c: m.d.color });
    const t = this.findTarget(a.x, a.y, r);
    if (t) { const crit = t instanceof Bug && Math.hypot(t.sx - a.x, t.sy - a.y) < Math.max(8, t.sr * 0.35); if (this.damage(t, m.d.dmg * (crit ? 2 : 1), crit, false, 'rifle')) { this.run.st.hits++; this.S.hits++; } }
  },
  fireShotgun(m) {
    this.shotCommon(m, m.d.heat);
    this.run.st.shots++; this.S.shots++;
    SND.play('spread'); this.shake = Math.max(this.shake, 0.1);
    const a = this.aim(), r = this.retR() * 2.2, g = this.gunPos();
    let any = false, cloneFix = 0; const hitSet = new Set();
    for (let i = 0; i < m.d.pellets; i++) {
      const ang = rnd(0, 6.283), rr = Math.sqrt(RNG()) * r;
      const px = a.x + Math.cos(ang) * rr, py = a.y + Math.sin(ang) * rr;
      this.tracers.push({ x0: g.x, y0: g.y, x1: px, y1: py, t: 0, w: 2, c: m.d.color });
      const t = this.findTarget(px, py, 14);
      if (t) {
        const wasClone = t.type === 'clone' || t.type === 'mini';
        if (this.damage(t, m.d.dmg, false, false, 'shotgun')) { any = true; if (wasClone && !t.alive && !hitSet.has(t)) cloneFix++; hitSet.add(t); }
      }
    }
    if (any) { this.run.st.hits++; this.S.hits++; }
    this.run.st.blastMax = Math.max(this.run.st.blastMax, cloneFix);
  },
  fireLauncher(m) { // 에이다: 테스트 캡슐 — 조준점에서 터져 주변을 한꺼번에
    this.shotCommon(m, m.d.heat);
    this.run.st.shots++; this.S.shots++;
    SND.play('boom'); this.shake = Math.max(this.shake, 0.14); this.recoil = 1.8;
    const a = this.aim(), g = this.gunPos(), R = this.retR() * 3.2;
    this.tracers.push({ x0: g.x, y0: g.y, x1: a.x, y1: a.y, t: 0, w: 6, c: m.d.color });
    this.blastFx = { x: a.x, y: a.y, r: R, t: 0, x0: g.x, y0: g.y };
    let any = false;
    for (const t of this.targetsNear(a.x, a.y, R)) { if (this.damage(t, m.d.dmg, false, false, 'launcher')) any = true; }
    if (any) { this.run.st.hits++; this.S.hits++; }
  },
  fireSniper(k) {
    const m = this.member();
    this.shotCommon(m, m.d.heat); this.charge = 0;
    this.run.st.shots++; this.S.shots++;
    SND.play('snipe'); this.shake = Math.max(this.shake, 0.15); this.recoil = 2;
    const a = this.aim(), g = this.gunPos();
    this.tracers.push({ x0: g.x, y0: g.y, x1: a.x, y1: a.y, t: 0, w: 5, c: m.d.color });
    const full = k >= 0.999;
    const dmg = Math.max(1, Math.round(m.d.dmg * k));
    // 관통: 조준선 근처의 모든 대상
    const hits = this.targetsNear(a.x, a.y, this.retR() * 0.6);
    let any = false;
    for (const t of hits) { if (this.damage(t, dmg, full, false, 'sniper')) any = true; }
    if (any) { this.run.st.hits++; this.S.hits++; }
    if (full && any) this.pop(a.x, a.y - 40, L('풀차지!', 'Full charge!', 'フルチャージ!', '满蓄力！'), '#6fe7ff');
  },
  allyFire(dt) { // 조작하지 않는 분대원 자동 사격 — 플레이어가 나와서 쏠 때만 같이 나와서 쏨
    if (!this.canFight() || !this.out || this.outK < 0.6) return;
    const cand = this.bugs.filter((b) => b.alive && b.onScreen && b.hostile && (b.type !== 'ghost' || b.vis) && (b.type !== 'loop' || b.vuln));
    if (this.S.def.boss) for (const s of Boss.targets()) if (s.onScreen && s.snake.real) cand.push(s);
    this.squad.forEach((q, i) => {
      if (i === this.weapon || !this.memberUnlocked(i)) return;
      q.aiT -= dt * (this.ws);
      if (q.aiT > 0 || !cand.length) return;
      q.aiT = (1 / q.d.aiRate) * rnd(0.8, 1.25);
      const t = pick(cand, Math.random);
      const side = this.allySlot(i);
      const hit = Math.random() < 0.72;
      const tx = t.sx + (hit ? 0 : rnd(-40, 40)), ty = t.sy + (hit ? 0 : rnd(-40, 40));
      this.tracers.push({ x0: side.x, y0: side.y, x1: tx, y1: ty, t: 0, w: 2, c: q.d.color, a: 0.55 });
      if (hit) this.damage(t, q.d.aiDmg, false, true);
    });
  },
  allySlot(i) { // 동료가 쏘는 위치 (화면 아래 양옆)
    const others = SQUAD.map((d, k) => k).filter((k) => k !== this.weapon && this.memberUnlocked(k));
    const n = others.indexOf(i);
    return { x: this.W * [0.06, 0.94, 0.12][n] || this.W * 0.5, y: this.H * (n === 2 ? 0.7 : 0.78) };
  },
  findTarget(x, y, r) {
    let best = null, bd = 1e9;
    for (const b of this.bugs) {
      if (!b.alive || !b.onScreen) continue;
      if (b.type === 'ghost' && !b.vis) continue;
      const d = Math.hypot(b.sx - x, b.sy - y);
      if (d <= b.sr * 0.9 + r) { const sc = d - b.sr - (b.role === 'missile' ? 20 : 0); if (sc < bd) { bd = sc; best = b; } }
    }
    if (this.S && this.S.def.boss) {
      for (const s of Boss.targets()) {
        if (!s.onScreen) continue;
        const dx = Math.abs(s.sx - x), dy = Math.abs(s.sy - y);
        if (dx <= s.sw + r * 0.6 && dy <= s.sh + r * 0.6) {
          const sc = Math.hypot(dx, dy) - s.sh - (s.snake.real ? 30 : 0);
          if (sc < bd) { bd = sc; best = s; }
        }
      }
    }
    return best;
  },
  targetsNear(x, y, r) {
    const out = [];
    for (const b of this.bugs) if (b.alive && b.onScreen && (b.type !== 'ghost' || b.vis) && Math.hypot(b.sx - x, b.sy - y) <= b.sr * 0.9 + r) out.push(b);
    if (this.S && this.S.def.boss) for (const s of Boss.targets()) if (s.onScreen && Math.abs(s.sx - x) <= s.sw + r && Math.abs(s.sy - y) <= s.sh + r) out.push(s);
    return out;
  },
  // 대상에 피해. 맞았으면 true
  damage(t, dmg, crit, ally, kind) {
    if (t instanceof Bug) {
      if (!t.alive) return false;
      if (t.role === 'item') { this.collectHotfix(t); return true; }
      if (kind && WEAK[t.type] === kind) { // 약점 무기
        dmg *= 2;
        if (!t.weakShown) { t.weakShown = true; this.pop(t.sx, t.sy - t.sr - 40, L('약점! ×2', 'Weak spot! ×2', '弱点! ×2', '弱点！×2'), KIND_INFO[kind].color); this.run.st.weak++; }
      }
      if (kind === 'shotgun' && t.role === 'rush') t.pos.addScaledVector(this.camF, 0.45); // 산탄: 밀어냄
      if (t.type === 'loop' && !t.vuln && kind !== 'sniper') {
        if (!ally) { if (Math.random() < 0.3) SND.play('deflect'); PFX.spark(t.pos, [0.85, 0.7, 1], 3, 3); if (Math.random() < 0.25) this.pop(t.sx, t.sy - 20, L('튕김!', 'Deflect!', '弾かれた!', '被弹开！'), '#d9c2ff'); }
        return false;
      }
      t.hp -= dmg; t.flash = 1;
      if (!ally && Math.random() < 0.5) SND.play('tick');
      PFX.spark(t.pos, t.role === 'missile' ? [0.9, 0.5, 1] : [1, 0.85, 0.5], 2, 3);
      if (t.hp <= 0) {
        if (t.role === 'missile') this.killMissile(t);
        else if (t.type === 'clone') this.split(t);
        else { this.perfectShot = !!crit; this.fixKind = ally ? null : kind; this.fixBug(t); this.perfectShot = false; this.fixKind = null; }
      }
      return true;
    }
    // 보스 코드 줄 (저격이 약점)
    if (kind === 'sniper') dmg *= 2;
    const res = Boss.hit(t, dmg);
    if (res === 'dmg') { if (!ally && Math.random() < 0.4) SND.play('tick'); PFX.spark(t.pos, [1, 0.5, 0.5], 2, 3); this.run.score += 5; return true; }
    if (res) {
      PFX.fix(t.pos, [1, 0.3, 0.37], 1.6); SND.play('hit', this.run.streak);
      this.shake = Math.max(this.shake, 0.18); this.hitStop = 0.06;
      this.addScore(400, t.sx, t.sy); this.run.st.fixed.boss++; this.S.fixed++; this.streakUp();
      UI.codeFix('boss', t);
      World.colorizeNear(t.pos, 3);
      return true;
    }
    if (!ally) { SND.play('deflect'); this.pop(t.sx, t.sy - 16, L('가짜 줄!', 'Fake line!', '偽の行!', '假的错误行！'), '#b0505a'); PFX.spark(t.pos, [0.7, 0.3, 0.35], 4, 3); }
    return false;
  },
  killMissile(b) {
    SND.play('boom'); PFX.spark(b.pos, [0.9, 0.5, 1], 16, 6); PFX.spark(b.pos, [1, 0.83, 0.3], 10, 4);
    this.addScore(b.def.pts, b.sx, b.sy); this.run.st.missiles++;
    this.pop(b.sx, b.sy - 30, L('격추!', 'Shot down!', '撃墜!', '击落！'), '#d9c2ff');
    b.remove();
  },
  split(b) {
    SND.play('split');
    PFX.spark(b.pos, [1, 0.83, 0.3], 14, 6);
    for (const s of [-1, 1]) {
      if (this.D.scatter) { // 화면 안이지만 엉뚱한 곳: 멀리 반대편, 높은 곳, 화면 가장자리
        const c = this.camera.position, k = RNG(), f = rnd(15, 22);
        const p = c.clone().addScaledVector(this.camF, f)
          .addScaledVector(this.camR, (k < 0.5 ? s : -s) * f * rnd(0.2, 0.45))
          .addScaledVector(this.camU, k < 0.35 ? f * rnd(0.15, 0.26) : rnd(-0.5, 1.5));
        PFX.spark(p, [1, 0.83, 0.3], 10, 4);
        this.bugs.push(new Bug('mini', p, { spdMul: b.spdMul * 0.75, ox: rnd(-1.2, 1.2), oy: rnd(-0.4, 0.4) }));
      } else {
        const p = b.pos.clone().addScaledVector(this.camR, s * 0.5);
        this.bugs.push(new Bug('mini', p, { sep: this.camR.clone().multiplyScalar(s * 4), spdMul: b.spdMul, ox: b.ox + s * 0.8, oy: b.oy }));
      }
    }
    if (this.D.scatter) SND.play('tele');
    this.run.st.fixed.clone++;
    if (!this.S.def.boss) this.S.fixed++; // 보스전 진행률은 오류 줄만
    this.pop(b.sx, b.sy - 20, this.D.scatter ? L('분열… 어디로?!', 'Split… where to?!', '分裂…どこへ?!', '分裂……去哪了？！') : L('분열!', 'Split!', '分裂!', '分裂！'), '#FFD34D');
    UI.codeFix('clone');
    b.remove();
  },
  addScore(base, x, y) {
    const v = Math.round(base * this.mult());
    this.run.score += v;
    if (v > 0) this.pop(x, y - 24, '+' + v, '#C6F432');
  },
  mult() { return Math.min(2, 1 + 0.1 * this.run.streak); },
  streakUp() {
    this.run.streak++;
    this.run.maxStreak = Math.max(this.run.maxStreak, this.run.streak);
    if (this.run.streak % this.D.combo === 0) {
      SND.play('combo');
      if (this.glitches.length) { const g = this.glitches.shift(); UI.toast(L('연속 패치! ', 'Patch streak! ', '連続パッチ! ', '连续补丁！') + GLITCH[g.type].name + L(' 복구', ' repaired', ' 修復', ' 已修复')); }
      else UI.toast(L('연속 패치 ×', 'Patch streak ×', '連続パッチ ×', '连续补丁 ×') + this.run.streak);
    }
  },
  collectHotfix(b) {
    if (b.trojan) { // 가짜 핫픽스: 버그 3마리가 튀어나옴
      SND.play('glitch'); PFX.spark(b.pos, [1, 0.3, 0.37], 18, 7);
      this.pop(b.sx, b.sy - 40, L('트로이 목마!', 'Trojan horse!', 'トロイの木馬!', '特洛伊木马！'), '#FF4D5E');
      this.run.st.trojan++;
      for (let i = 0; i < 3; i++) {
        const p = b.pos.clone().addScaledVector(this.camR, (i - 1) * 1.6).addScaledVector(this.camU, rnd(-0.5, 0.8)).addScaledVector(this.camF, 4);
        this.bugs.push(new Bug('basic', p, { spdMul: 1.1, sep: this.camR.clone().multiplyScalar((i - 1) * 3) }));
        if (!this.S.def.boss) this.S.expected++;
      }
      UI.codeError('trojan');
      b.remove(); return;
    }
    const r = this.run, before = r.stab;
    r.stab = Math.min(100, r.stab + 20);
    const fixedGl = this.glitches.length;
    this.glitches = [];
    // 엄폐물도 보강
    this.cover.hp = Math.min(this.cover.max, this.cover.hp + this.cover.max * 0.35); if (this.cover.hp > 0) this.cover.broken = false;
    SND.play('pickup');
    PFX.fix(b.pos, [0.78, 0.96, 0.2], 1.3);
    r.st.hotfix++;
    if (r.stab - before < 5) this.addScore(500, b.sx, b.sy);
    this.pop(b.sx, b.sy - 46, r.stab > before ? L(`핫픽스! 안정성 +${Math.round(r.stab - before)}`, `Hotfix! Stability +${Math.round(r.stab - before)}`, `ホットフィックス! 安定性 +${Math.round(r.stab - before)}`, `热修复！稳定性 +${Math.round(r.stab - before)}`) : L('핫픽스! 보너스', 'Hotfix! Bonus', 'ホットフィックス! ボーナス', '热修复！奖励'), '#E6FF7A');
    UI.toast(L('핫픽스 적용 — ', 'Hotfix applied — ', 'ホットフィックス適用 — ', '热修复已应用 —') + (fixedGl ? L('화면 고장 복구 · ', 'glitches repaired · ', '画面の不具合を修復 · ', '画面故障已修复 ·') : '') + L('엄폐물 보강', 'cover reinforced', '遮蔽物を補強', '掩体已加固'));
    UI.codeFix('hotfix');
    b.remove();
  },
  spawnHotfix() {
    const pos = this.camera.position.clone().addScaledVector(this.camF, 13).addScaledVector(this.camR, (RNG() < 0.5 ? -1 : 1) * rnd(1.5, 3.5)).addScaledVector(this.camU, rnd(1, 2.4));
    const b = this.spawnBugAt('hotfix', pos, {});
    if (this.D.trojan && this.run.seenHotfix && RNG() < this.D.trojan) b.trojan = true;
    if (!this.run.seenHotfix) { this.run.seenHotfix = true; b.label = L('핫픽스', 'Hotfix', 'ホットフィックス', '热修复'); }
  },
  fixBug(b) {
    const perfect = this.perfectShot;
    SND.play('hit', this.run.streak);
    if (perfect) { SND.play('perfect'); this.run.st.perfect++; this.pop(b.sx, b.sy - b.sr - 28, 'PERFECT', '#FFD34D'); this.hitStop = 0.05; }
    this.shake = Math.max(this.shake, perfect ? 0.1 : 0.05);
    PFX.fix(b.pos, b.type === 'ghost' ? [0.75, 0.96, 1] : b.type === 'clone' || b.type === 'mini' ? [1, 0.83, 0.3] : [1, 0.3, 0.37], b.type === 'mini' ? 0.7 : 1);
    this.addScore(b.def.pts * (perfect ? 1.5 : 1), b.sx, b.sy);
    // 페어 프로그래밍: 다른 분대원으로 1.5초 안에 이어서 고치면 보너스
    const fk = this.fixKind;
    if (fk && this.pairK && this.pairK !== fk && this.time - this.pairT < 1.5 && !this.isTut()) {
      this.run.st.pair = (this.run.st.pair || 0) + 1; this.addScore(200, b.sx, b.sy - 30);
      this.run.stab = Math.min(100, this.run.stab + 2);
      this.pop(b.sx, b.sy - b.sr - 60, L('페어 프로그래밍! +200', 'PAIR PROGRAMMING! +200', 'ペアプロ! +200', '结对编程！+200'), '#FF9EC8'); SND.play('combo');
      this.pairK = null;
    } else if (fk) { this.pairK = fk; this.pairT = this.time; }
    this.run.st.fixed[b.type] = (this.run.st.fixed[b.type] || 0) + 1;
    if (!this.S.def.boss) this.S.fixed++;
    this.streakUp();
    World.colorizeNear(b.pos, b.type === 'mini' ? 2 : 4);
    if (this.S.tutorial && b.type === 'basic') { this.S.tutorial = false; UI.hint(''); }
    UI.codeFix(b.type);
    b.remove();
  },

  // ----- 적의 공격 -----
  enemyAttack(src) {
    if (src.def && src.def.missile) { this.spawnMissile(src.pos.clone()); return; }
    // 에러 패킷: 화면 가운데쯤에 예고 원 → 시간이 다 되면 명중. 숨어 있으면 엄폐물이 대신 맞음
    const dur = 1.05 * this.D.tele;
    this.attacks.push({ x: this.W * rnd(0.3, 0.7), y: this.H * rnd(0.36, 0.62), t: 0, dur, src, dmg: (src.def ? src.def.dmg : 11) });
    Tut.event('packet', this.attacks[this.attacks.length - 1]);
    SND.play('aim');
    UI.tutor('hide');
  },
  spawnMissile(pos) {
    const b = this.spawnBugAt('missile', pos, { ox: rnd(-1, 1) });
    SND.play('missile');
    Tut.event('missile', b);
    if (!this.seen.missile) { this.seen.missile = true; b.label = L('관통 미사일', 'Piercing Missile', '貫通ミサイル', '穿透导弹'); }
    return b;
  },
  updateAttacks(dt, ws) {
    for (const a of this.attacks) {
      a.t += dt * ws;
      if (a.src && a.src.alive === false && a.t < a.dur * 0.4) { a.done = true; this.pop(a.x, a.y, L('취소!', 'Cancelled!', 'キャンセル!', '已取消！'), '#9CFF7A'); continue; } // 쏘기 전에 잡으면 취소
      if (a.t >= a.dur) {
        a.done = true;
        const exposed = this.outK > 0.45 || this.cover.broken;
        if (exposed) this.hurt(a.dmg, 'packet');
        else this.coverHit(a.dmg);
      }
    }
    this.attacks = this.attacks.filter((a) => !a.done);
  },
  coverHit(dmg) {
    const c = this.cover;
    c.hp -= dmg; this.run.st.blocked++;
    SND.play('block'); this.shake = Math.max(this.shake, 0.12);
    this.pop(this.W / 2 + rnd(-60, 60), this.H * 0.72, L('막음!', 'Blocked!', '防いだ!', '挡住了！'), '#cfd6c8');
    if (c.hp <= 0 && !c.broken) {
      c.hp = 0; c.broken = true; SND.play('crash');
      UI.toast(L('엄폐물 파괴! 이제 숨어도 맞아요', 'Cover destroyed! Hiding no longer protects you', '遮蔽物が壊れた! もう隠れても守られない', '掩体被摧毁！隐蔽也挡不住了')); UI.tutor('cover_broken');
      UI.clPush([['del', 'Error: cover.integrity = 0'], ['err', '✖ Run Error(0x' + String(Math.floor(Math.random() * 1e6)).padStart(6, '0') + ')']]);
    }
  },
  contact(b) { // 돌격 버그가 물거나 관통 미사일이 명중 (숨어도 맞음)
    if (!b.alive) return;
    b.remove();
    if (this.state !== 'play') return;
    if (b.role === 'missile') PFX.spark(this.camera.position.clone().addScaledVector(this.camF, 2), [0.9, 0.5, 1], 20, 6);
    this.hurt(b.def.dmg, b.role === 'missile' ? 'missile' : 'bite', b.type);
  },
  hurt(dmg, kind, type) {
    if (this.state !== 'play') return;
    this.hurtT = 0.55; // 3인칭 캐릭터 고통 자세
    this.run.stab = Math.max(0, this.run.stab - Math.round(dmg * this.dmgK));
    this.run.streak = 0; this.run.st.contacts++;
    FX.u.hit = 1; this.shake = kind === 'packet' ? 0.3 : 0.45;
    SND.play('glitch');
    this.addGlitch();
    UI.codeError(kind === 'packet' ? 'packet' : kind === 'missile' ? 'missile' : type);
    if (!this.S.warned && this.run.stage === 0) { this.S.warned = true; UI.hint(L('맞으면 안정성이 깎이고 화면이 고장 나요!', 'Getting hit lowers Stability and glitches the screen!', '被弾すると安定性が下がり、画面が壊れる!', '被击中会降低稳定性，画面也会出故障！'), 3); }
    if (this.isTut()) this.run.stab = Math.max(30, this.run.stab); // 훈련장: 크래시 없음
    if (this.run.stab <= 0) this.crash();
  },
  hasGlitch(t) { return this.glitches.some((g) => g.type === t); },
  addGlitch() {
    const w = this.run.gw;
    let tot = 0; for (const k in w) tot += w[k];
    let x = RNG() * tot, type = 'tear';
    for (const k in w) { x -= w[k]; if (x <= 0) { type = k; break; } }
    if (this.glitches.length >= this.D.maxGl) this.glitches.shift();
    this.glitches = this.glitches.filter((g) => g.type !== type);
    this.glitches.push({ type, t: GLITCH[type].dur * this.D.glDur });
    this.run.st.glitch[type]++;
    if (type === 'slip') { this.slip.x = (RNG() < 0.5 ? -1 : 1) * rnd(32, 46); this.slip.y = (RNG() < 0.5 ? -1 : 1) * rnd(10, 22); }
  },
  rollback() {
    if (this.state !== 'play' || !this.S || !this.S.started || this.S.ending) return;
    if (!this.unlocked(2)) { UI.toast(L('롤백은 스테이지 3부터!', 'Rollback unlocks at Stage 3!', 'ロールバックはステージ3から!', '回滚从关卡3开始解锁！')); return; }
    if (this.rollT > 0) return;
    if (this.S.rb <= 0) { UI.toast(L('이번 스테이지 롤백을 다 썼어요', 'No Rollbacks left this stage', 'このステージのロールバックは使い切った', '本关回滚次数已用完')); return; }
    this.S.rb--; this.rollT = 3; this.run.st.rollbacks++;
    if (this.glitches.length) this.glitches.shift(); // 화면 고장 하나 즉시 복구
    for (const a of this.attacks) a.t = Math.max(0, a.t - a.dur * 0.5); // 날아오던 공격도 되감기
    SND.play('rollback'); MUS.slow = true;
  },
  addHeat(v) {
    if (!this.D.heat) return;
    this.heat = Math.min(100, this.heat + v);
    if (this.heat >= 100) this.overheat(L('과열! 2초 냉각', 'Overheat! Cooling 2s', 'オーバーヒート! 2秒冷却', '过热！冷却2秒'));
  },
  overheat(msg) {
    if (this.overT > 0) return;
    this.overT = 2; this.heat = 100;
    this.run.st.overheat++;
    SND.play('overheat'); UI.toast('🔥 ' + msg);
    UI.clPush([['del', 'Warning: patchGun.temperature > 100°C'], ['err', '✖ Run Error(0x' + String(Math.floor(Math.random() * 1e6)).padStart(6, '0') + ')']]);
  },
  crash() {
    this.state = 'crashing'; this.crashT = 0;
    this.run.st.crashes++;
    const i = this.run.stage;
    this.run.crashStreak[i]++;
    const boss = this.S && this.S.def.boss;
    if (this.run.crashStreak[i] >= (boss ? 1 : this.D.helpAt)) this.run.help[i] = true; // 보스방은 1번만 크래시해도 도움 모드
    if (boss) this.run.bossCk = Math.max(this.run.bossCk || 1, Boss.phase); // 보스 체크포인트
    MUS.crashStop(); SND.play('crash');
    this.ptr.down = false; this.out = false;
  },

  // ----- 진행 -----
  newRun(daily, diff) {
    const seed = daily ? DAILY_SEED : NORMAL_SEED;
    const r = mulberry32(seed ^ 0x9e3779b9);
    const gw = {}; for (const k of Object.keys(GLITCH)) gw[k] = daily ? 0.5 + r() : 1;
    this.run = {
      daily, seed, diff: diff || 'normal', stage: 0, score: 0, stab: 100, streak: 0, maxStreak: 0, gw,
      st: { fixed: { basic: 0, clone: 0, mini: 0, ghost: 0, e404: 0, loop: 0, throw: 0, boss: 0 }, shots: 0, hits: 0, crashes: 0, contacts: 0,
        glitch: { tear: 0, inv: 0, flip: 0, slip: 0, pix: 0 }, pair: 0, rollbacks: 0, tele: 0, bossTime: 0, blastMax: 0, perfect: 0, hotfix: 0, overheat: 0, trojan: 0, dash: 0, blocked: 0, missiles: 0, weak: 0 },
      crashStreak: [0, 0, 0, 0, 0], help: [false, false, false, false, false], stageRes: [], snap: null,
    };
    this.weapon = 0; this.seen = {};
    this.startStage(0);
  },
  snapshot() { const r = this.run; r.snap = { score: r.score, stab: r.stab, streak: r.streak, maxStreak: r.maxStreak, st: JSON.parse(JSON.stringify(r.st)) }; },
  restoreSnapshot() {
    const r = this.run, s = r.snap;
    const keep = { crashes: r.st.crashes, glitch: r.st.glitch, tele: r.st.tele, contacts: r.st.contacts };
    r.score = s.score; r.stab = 100; r.streak = 0; r.maxStreak = s.maxStreak;
    r.st = Object.assign(JSON.parse(JSON.stringify(s.st)), keep);
  },
  // 엄폐 지점 3곳 × 웨이브 2개
  buildCovers(def, seed) {
    const r = mulberry32(seed + def.id * 7919);
    let n = Math.round(def.count * (def.key === 'physics' ? Math.min(1, this.D.count) : this.D.count));
    const pool = [];
    const tot = Object.values(def.mix).reduce((a, b) => a + b, 0);
    for (const k in def.mix) for (let i = 0; i < Math.round((def.mix[k] / tot) * n); i++) pool.push(k);
    while (pool.length < n) pool.push('basic');
    pool.length = n;
    shuffle(pool, r); // 오늘의 빌드 시드로 순서만 섞음
    const share = [0.27, 0.31, 0.42], counts = share.map((s) => Math.round(n * s)); counts[2] = n - counts[0] - counts[1];
    const covers = []; let k = 0;
    for (let c = 0; c < 3; c++) {
      const items = pool.slice(k, k + counts[c]); k += counts[c];
      const half = Math.ceil(items.length / 2);
      const waves = [items.slice(0, half), items.slice(half)].map((w) => w.map((type) => ({ type })));
      covers.push({ u: COVER_U[c], waves, kind: COVER_KINDS[(def.id - 1) % COVER_KINDS.length][c] });
    }
    // 새 버그 소개: 첫 엄폐 지점 맨 앞에 혼자, 천천히
    const intro = def.intro.slice();
    if (def.id === 1) { covers[0].waves[0] = [{ type: 'basic', intro: true }, { type: 'basic' }, { type: 'basic' }]; covers[0].waves[1] = [{ type: 'throw', intro: true }, { type: 'throw' }, { type: 'basic' }]; }
    else for (const t of intro.reverse()) covers[0].waves[0].unshift({ type: t, intro: true });
    // 웨이브 안에서 시간차
    for (const c of covers) for (const w of c.waves) { let at = 0.6; for (const e of w) { e.at = at; at += e.intro ? 2.6 : rnd(0.45, 1.0); } }
    // 핫픽스
    covers[1].waves[0].push({ type: 'hotfix', at: 3.5 });
    if (this.D.hotfix > 0) covers[2].waves[0].push({ type: 'hotfix', at: 4 });
    if (this.D.hotfix >= 0 && def.id >= 2) covers[2].waves[1].push({ type: 'hotfix', at: 2.5 });
    for (const c of covers) for (const w of c.waves) w.sort((a, b) => a.at - b.at);
    return covers;
  },
  startStage(idx) {
    const r = this.run; r.stage = idx;
    const def = this.isTut() ? TUT_STAGE : STAGES[idx];
    if (!r.snap || r.snapStage !== idx) { this.snapshot(); r.snapStage = idx; }
    RNG = mulberry32(r.seed + idx * 101 + r.st.crashes * 13);
    this.clearEntities();
    World.build(def, r.seed);
    const covers = def.boss ? [{ u: 0, waves: [] }] : def.tutorial ? [{ u: 0.12, waves: [[]] }] : this.buildCovers(def, r.seed);
    this.S = {
      def, idx, u: covers[0].u, t: 0, covers, ci: 0, wi: 0, waveT: 0, waveQ: [], waveIdle: 0, phase: 'fight', moveT: 0,
      fixed: 0, shots: 0, hits: 0, expected: 1, started: false, introT: 2.2, ending: false, rb: this.D.rb, rush: false,
      trickT: 5, jamT: rnd(16, 26), score0: r.score, tutorial: idx === 0, warned: false,
    };
    if (!def.boss) {
      let e = 0; for (const c of covers) for (const w of c.waves) for (const q of w) if (q.type !== 'hotfix') e += q.type === 'clone' ? 3 : 1;
      this.S.expected = e;
      this.loadWave();
    } else this.S.expected = 16;
    const help = r.help[idx];
    // 뒤 스테이지일수록 빠르게 (+8%/스테이지), 엄폐 지점을 지날수록 또 빠르게 (loadWave)
    this.baseSpd = (1 + idx * 0.08) * (help ? 0.8 : 1) * this.D.spd;
    this.bugSpeedMul = this.baseSpd;
    this.fm = this.D.fireMul * (help ? 1.35 : 1); // 적 공격 간격
    this.dmgK = this.D.dmg * (help ? 0.8 : 1);
    this.heat = 0; this.overT = 0; this.smoke = [];
    this.glitches = []; this.rollT = 0; this.ws = 1; this.tracers = []; this.pops = []; this.attacks = [];
    this.shake = 0; this.hitStop = 0; this.recoil = 0; this.out = false; this.outK = 0;
    const cmax = Math.round(this.D.coverHp * (help ? 1.4 : 1));
    this.cover = { hp: cmax, max: cmax, broken: false };
    this.coverMat.color.set(def.cover); this.coverTopMat.color.set(def.theme).multiplyScalar(0.55);
    this.resetSquad();
    if (!this.memberUnlocked(this.weapon)) this.weapon = 0;
    this.ret.x = this.W / 2; this.ret.y = this.H * 0.42;
    FX.u.tear = FX.u.inv = FX.u.pix = FX.u.hit = FX.u.slow = 0; FX.u.wipeOn = 0;
    if (def.boss) { this.camera.position.set(0, 1.2, 24); this.look.set(0, 5, 0); Boss.start(r.seed, r.bossCk || 1); this.S.fixed = Boss.fixed; if ((r.bossCk || 1) > 1) UI.toast(L('체크포인트: 보스 ', 'Checkpoint: from boss phase ', 'チェックポイント: ボス フェーズ ', '检查点：从 Boss 阶段') + r.bossCk + L('단계부터', '', '', '')); }
    else { const P = World.curve.getPointAt(this.S.u), T = World.curve.getTangentAt(this.S.u); this.camera.position.set(P.x, 1.1, P.z); this.look.copy(P).addScaledVector(T, 10); this.look.y = 1.9; }
    this.camera.lookAt(this.look);
    this.state = 'play';
    UI.showHUD();
    UI.codeStart(def);
    UI.banner(def.tutorial ? 'TUTORIAL' : 'STAGE ' + def.id, def.name, 2.2);
    MUS.start(idx, r.seed);
    if (def.join) {
      const m = SQUAD[def.join];
      setTimeout(() => { SND.play('unlock'); UI.toast(L(`${m.name}(${m.role}) 합류! ${m.label}`, `${m.name} (${m.role}) joined! ${m.label}`, `${m.name}(${m.role})が合流! ${m.label}`, `${m.name}（${m.role}）加入！${m.label}`) + (def.join === 2 ? L(' · 롤백 해금', ' · Rollback unlocked', ' · ロールバック解放', ' · 回滚已解锁') : '')); }, 900);
    }
    if (help) UI.hint(L('도움 모드: 버그 속도 -20% · 적 공격 느리게 · 피해 -20% · 엄폐물 +40%', 'Assist mode: bugs -20% speed · slower attacks · -20% damage · +40% cover', 'アシストモード: バグ速度 -20% · 攻撃が遅く · ダメージ -20% · 遮蔽物 +40%', '辅助模式：Bug速度 -20% · 攻击变慢 · 伤害 -20% · 掩体 +40%'), 4);
  },
  stageTutor() {
    const def = this.S.def;
    if (this.S.idx === 0) UI.tutor('basics');
    if (def.join === 1) UI.tutor('join_rex');
    if (def.join === 2) { UI.tutor('join_pin'); UI.tutor('rollback'); }
    if (def.join === 3) UI.tutor('join_ada');
    if (def.join === 1 && !Store.get('pairTip', false)) { Store.set('pairTip', true); setTimeout(() => { if (this.state === 'play' && this.S && this.S.def === def) UI.hint(L('팁: 한 분대원으로 고치고 1.5초 안에 다른 분대원으로 또 고치면 페어 프로그래밍 보너스!', 'Tip: fix a bug, then fix another with a different member within 1.5s for a Pair Programming bonus!', 'ヒント: 1人で直したあと1.5秒以内に別のメンバーでも直すとペアプロボーナス!', '提示：修好一只Bug后，1.5秒内换另一名队员再修一只，可获得结对编程奖励！'), 5); }, 9000); }
    if (this.S.idx === 0 || def.join) UI.tutor('weak');
  },
  loadWave() {
    const S = this.S, c = S.covers[S.ci];
    this.bugSpeedMul = this.baseSpd * (1 + S.ci * 0.06 + S.wi * 0.02); // 지점·웨이브가 넘어갈수록 빨라짐
    S.waveQ = (c.waves[S.wi] || []).map((q) => Object.assign({}, q));
    S.trickN = 0; // 상: 웨이브마다 추가 버그는 최대 4마리 (느리게 잡으면 웨이브가 끝나지 않던 문제)
    S.waveT = 0; S.waveIdle = 0;
    if (S.ci === S.covers.length - 1 && S.wi === 0 && !S.rush && !S.def.boss) {
      S.rush = true; setTimeout(() => { if (this.S === S && this.state === 'play') { UI.banner('BUG RUSH', L('마지막 엄폐 지점! 버그가 몰려와요', 'Last cover point! Here they come', '最後の遮蔽ポイント! 押し寄せてくる', '最后的掩体点！它们冲过来了'), 1.8); SND.play('rush'); MUS.tempoMul = 0.82; } }, 300);
    }
  },
  rebuild() { this.restoreSnapshot(); this.startStage(this.run.stage); },
  clearEntities() {
    for (const b of this.bugs) b.remove();
    this.bugs = []; PFX.clear(); Boss.dispose(); this.attacks = [];
    for (const b of this.titleBugs) this.scene.remove(b.spr);
    this.titleBugs = [];
  },
  spawnBugAt(type, pos, opt) {
    const b = new Bug(type, pos, Object.assign({ spdMul: 1 }, opt));
    this.bugs.push(b);
    if (opt.intro) b.label = BUGDEF[type].name;
    UI.dexSeen(type);
    UI.tutor('bug_' + type, b); // 처음 만나는 버그: 화면 멈추고 설명
    if (type !== 'missile') SND.play('spawn', this.bugs.length);
    return b;
  },
  coverBasis() { // 현재 엄폐 지점의 땅 위치, 앞, 옆
    const P = World.curve.getPointAt(this.S.u), T = World.curve.getTangentAt(this.S.u);
    return { P, T, N: new THREE.Vector3(-T.z, 0, T.x).normalize() };
  },
  spawnEntry(type, intro) {
    if (type === 'hotfix') { this.spawnHotfix(); return; }
    const { P, T, N } = this.coverBasis();
    const phys = this.S.def.key === 'physics';
    const far = rnd(26, 34), lat = rnd(-7, 7);
    const pos = P.clone().addScaledVector(T, far).addScaledVector(N, lat); pos.y = phys ? rnd(9, 11) : rnd(1, 3.5);
    const opt = { intro };
    if (BUGDEF[type].role === 'shoot') {
      const dist = intro ? 15 : rnd(13, 23), side = (dist * 0.42) * rnd(-1, 1);
      opt.anchor = P.clone().addScaledVector(T, dist).addScaledVector(N, side);
      opt.anchor.y = phys ? rnd(3, 6) : rnd(1.6, 4.4);
    }
    this.spawnBugAt(type, pos, opt);
  },
  hostiles() { return this.bugs.filter((b) => b.alive && b.hostile).length; },
  updateWaves(dt, ws) {
    const S = this.S;
    if (S.phase === 'move') {
      S.moveT += dt;
      const k = smooth(clamp(S.moveT / 2.6, 0, 1));
      S.u = lerp(S.covers[S.ci - 1].u, S.covers[S.ci].u, k);
      if (S.moveT >= 2.6) { S.phase = 'fight'; this.loadWave(); UI.toast(L(`엄폐 지점 ${S.ci + 1}/3`, `Cover point ${S.ci + 1}/3`, `遮蔽ポイント ${S.ci + 1}/3`, `掩体点 ${S.ci + 1}/3`) + ' · ' + (this.coverKind() === 'side' ? L('기둥 — 오른쪽으로 몸을 빼서 쏴요', 'Pillar — lean out right to shoot', '柱 — 右に身を乗り出して撃つ', '柱子 — 向右探身射击') : L('낮은 벽 — 일어나서 쏴요', 'Low wall — stand up to shoot', '低い壁 — 立ち上がって撃つ', '矮墙 — 起身射击'))); }
      return;
    }
    if (S.def.boss || S.def.tutorial) return;
    S.waveT += dt * ws;
    while (S.waveQ.length && S.waveQ[0].at <= S.waveT && this.hostiles() < this.maxOn()) { const q = S.waveQ.shift(); this.spawnEntry(q.type, q.intro); }
    // 상: 웨이브 중에도 계속 추가
    if (this.D.trickle && S.waveQ.length + this.hostiles() > 0 && (S.trickN || 0) < 4) {
      S.trickT -= dt * ws;
      if (S.trickT <= 0 && this.hostiles() < this.maxOn()) {
        S.trickT = this.D.trickle * rnd(0.7, 1.3);
        const t = pick(Object.keys(S.def.mix).filter((x) => x !== 'loop'));
        this.spawnEntry(t, false); S.expected += t === 'clone' ? 3 : 1; S.trickN = (S.trickN || 0) + 1;
      }
    }
    if (!S.waveQ.length && this.hostiles() === 0 && !this.attacks.length) {
      S.waveIdle += dt;
      if (S.waveIdle > 0.9) {
        const c = S.covers[S.ci];
        if (S.wi < c.waves.length - 1) { S.wi++; this.loadWave(); }
        else if (S.ci < S.covers.length - 1) { // 다음 엄폐물로 이동
          S.ci++; S.wi = 0; S.phase = 'move'; S.moveT = 0;
          for (const b of this.bugs) if (b.alive) b.remove();
          this.cover.hp = Math.min(this.cover.max, Math.max(this.cover.hp, this.cover.max * 0.6)); this.cover.broken = false; // 새 엄폐물
          UI.banner('', L('다음 엄폐물로 이동!', 'Moving to the next cover!', '次の遮蔽物へ移動!', '前往下一个掩体！'), 1.4); SND.play('move');
        } else this.stageClear();
      }
    } else S.waveIdle = 0;
  },
  stageClear() {
    const S = this.S, r = this.run;
    S.ending = true; this.state = 'clearing'; this.clearT = 0; this.out = false;
    World.fillAll();
    MUS.layer = 4;
    SND.play('clear');
    r.stab = Math.min(100, r.stab + 30);
    r.crashStreak[S.idx] = 0;
    const acc = S.shots ? S.hits / S.shots : 0;
    const par = S.def.boss ? 150 : 95 + S.idx * 12;
    const timeBonus = Math.max(0, Math.round((par - S.t) * 20)) + Math.round(this.cover.hp) * 5;
    r.score += timeBonus;
    r.stageRes[S.idx] = { fixed: S.fixed, acc, time: S.t, score: r.score - S.score0, timeBonus };
    this.glitches = []; this.attacks = [];
    UI.hint('');
    this.saveStageRecord(S.idx, r.score - S.score0, acc);
  },
  saveStageRecord(i, score, acc) {
    const rec = Store.get('records', {});
    rec.stages = rec.stages || {};
    const s = rec.stages[i] || { score: 0, acc: 0 };
    s.score = Math.max(s.score, score); s.acc = Math.max(s.acc, acc);
    rec.stages[i] = s; Store.set('records', rec);
  },
  onBossSuccess() {
    this.run.st.bossTime = this.S.t;
    UI.banner('', 'BUILD SUCCESS', 3, true);
    SND.play('success');
    for (const b of this.bugs) { PFX.fix(b.pos, [1, 0.3, 0.37]); b.remove(); }
    this.bugs = []; this.attacks = [];
    this.S.bossEndT = 0;
  },
  nextStage() {
    if (STAGES[this.run.stage].boss) return Story.ending(() => UI.showResult());
    const n = this.run.stage + 1; Story.beforeStage(n, () => this.startStage(n));
  },

  // ----- 타이틀 배경 (회색 세상 + 기어 다니는 버그) -----
  toTitle() {
    if (Tut.active) Tut.stop();
    Free.stop();
    this.state = 'title';
    MUS.startTitle();
    this.clearEntities();
    this.coverMesh.visible = false;
    RNG = mulberry32(3);
    World.build(STAGES[0], 4);
    this.titleU = 0.05;
    ['basic', 'clone', 'ghost', 'e404', 'loop', 'throw'].forEach((t, i) => {
      const m = new THREE.SpriteMaterial({ map: TEX[t][0], transparent: true, fog: false });
      const spr = new THREE.Sprite(m); spr.scale.setScalar(1.6);
      this.scene.add(spr);
      this.titleBugs.push({ spr, t, ph: i * 1.1, side: i % 2 ? 1 : -1, d: 9 + i * 3 });
    });
    FX.u.tear = FX.u.inv = FX.u.pix = FX.u.hit = FX.u.slow = 0; FX.u.wipeOn = 0;
    UI.showTitle();
  },
  updateTitle(dt) {
    this.titleU += dt * 0.004; if (this.titleU > 0.6) this.titleU = 0.05;
    const P = World.curve.getPointAt(this.titleU), T = World.curve.getTangentAt(this.titleU);
    this.camera.position.set(P.x, 2.2, P.z);
    this.look.copy(P).addScaledVector(T, 8); this.look.y = 1.8;
    this.camera.lookAt(this.look);
    this.updateCamBasis();
    const N = new THREE.Vector3(-T.z, 0, T.x);
    for (const b of this.titleBugs) {
      const k = this.time * 0.7 + b.ph;
      b.spr.position.copy(P).addScaledVector(T, b.d + Math.sin(k) * 1.5).addScaledVector(N, b.side * (5.2 + Math.sin(k * 1.7) * 1.2));
      b.spr.position.y = 0.7 + Math.abs(Math.sin(k * 3)) * 0.3;
      b.spr.material.map = TEX[b.t][Math.floor(this.time * 7 + b.ph) % 2];
      b.spr.material.rotation = Math.sin(k * 4) * 0.2;
    }
  },
  updateCamBasis() {
    this.camera.updateMatrixWorld();
    const m = this.camera.matrixWorld;
    this.camR.setFromMatrixColumn(m, 0); this.camU.setFromMatrixColumn(m, 1); this.camF.setFromMatrixColumn(m, 2).negate();
  },

  // ----- 메인 루프 -----
  frame(now) {
    let dt = (now - this.last) / 1000; this.last = now;
    if (dt > 0.05) dt = 0.05;
    if (dt < 0) dt = 0;
    if (this.state !== 'paused') this.time += dt;
    const pl = this.state === 'play' || this.state === 'free'; if (pl !== this._pl) { this._pl = pl; document.body.classList.toggle('playing', pl); } // 플레이 중엔 시스템 커서 숨김
    if (Free.active) { Free.frame(dt); return; } // 자유 작전 모드
    if (this.state === 'play') {
      this.fpsAcc += dt; this.fpsN++;
      if (this.fpsAcc > 2.5) { if (this.fpsAcc / this.fpsN > 1 / 40) FX.stepDown(); this.fpsAcc = 0; this.fpsN = 0; }
    }
    if (this.state === 'tutor') { FX.render(this.scene, this.camera, this.time); this.draw2D(0); Tut.tick(0); return; }
    if (this.state === 'title') { this.updateTitle(dt); World.update(dt, 0); }
    else if (this.state === 'play' || this.state === 'crashing' || this.state === 'clearing') this.update(dt);
    if (Tut.active && this.state === 'play') Tut.tick(dt);
    if (this.state !== 'paused') {
      PFX.update(dt);
      this.updateFX(dt);
      FX.render(this.scene, this.camera, this.time);
      this.draw2D(dt);
      UI.tick(dt);
    }
  },
  update(dt) {
    const S = this.S;
    if (this.rollT > 0) { this.rollT -= dt; if (this.rollT <= 0) { this.rollT = 0; MUS.slow = false; } }
    const wsT = this.rollT > 0 ? 0.3 : 1;
    this.ws += (wsT - this.ws) * Math.min(1, dt * 8);
    let ws = this.state === 'crashing' ? 0.15 : this.ws;
    if (Tut.active) ws *= Tut.slow; // 튜토리얼: 새 버그 소개 중 슬로우
    if (this.hitStop > 0) { this.hitStop -= dt; ws *= 0.12; }
    this.recoil = Math.max(0, this.recoil - dt * 8);
    if (this.hurtT > 0) this.hurtT -= dt;

    // 엄폐 ↔ 사격 자세
    this.out = this.state === 'play' && this.ptr.down && S.started && S.phase === 'fight' && !Tut.block;
    this.outK += ((this.out ? 1 : 0) - this.outK) * Math.min(1, dt * 14);

    if (this.state === 'play') {
      if (!S.started) { S.introT -= dt; if (S.introT <= 0) { S.started = true; if (S.def.tutorial) Tut.start(); else { this.stageTutor(); Story.say(S.idx); } } }
      else {
        S.t += dt;
        this.updateWaves(dt, ws);
        this.hardUpdate(dt, ws);
      }
      this.updateFiring(dt);
      this.allyFire(dt);
      this.sugT = (this.sugT || 0) - dt;
      if (this.sugT <= 0) { this.sugT = 0.4; this.updateSuggest(); }
      this.updateAttacks(dt, ws);
      // 보스전: 숨어 있으면 엄폐물이 천천히 복구
      if (S.def.boss && !this.out && !this.cover.broken) this.cover.hp = Math.min(this.cover.max, this.cover.hp + dt * 2.5);
      for (const g of this.glitches) g.t -= dt;
      this.glitches = this.glitches.filter((g) => g.t > 0);
    }
    // 카메라: 숨으면 낮게, 나오면 엄폐물 위로
    const sideK = this.coverKind() === 'side' ? 1 : 0;
    const eye = sideK ? lerp(1.5, 1.62, this.outK) : lerp(1.08, 1.78, this.outK);
    const tp = this.tpK(); // 3인칭 정도 (숨으면 1)
    if (S.def.boss) {
      this.camera.position.set(Math.sin(this.time * 0.15) * 0.6 + tp * 0.8, eye + 0.4 + tp * 0.5, 24 + tp * 2.6);
      this.look.set(0, 5, 0);
    } else {
      const { P, T, N } = this.coverBasis();
      const moving = S.phase === 'move';
      const bob = moving ? Math.abs(Math.sin(S.moveT * 9)) * 0.12 : 0;
      this.camera.position.set(P.x, (moving ? 1.55 : eye) + bob + tp * 0.55, P.z);
      this.camera.position.addScaledVector(T, -2.3 * tp).addScaledVector(N, 0.75 * tp + (moving ? 0 : sideK * 1.1 * this.outK));
      const tgt = V1.copy(P).addScaledVector(T, 10).addScaledVector(N, moving ? 0 : sideK * 1.1 * this.outK); tgt.y = moving ? 1.6 : lerp(1.9, 2.3, this.outK);
      this.look.lerp(tgt, Math.min(1, dt * (moving ? 3 : 8)));
    }
    this.camera.lookAt(this.look);
    if (S.phase === 'move') this.camera.rotation.z += Math.sin(S.moveT * 9) * 0.012 * (settings.reduceFlash ? 0.4 : 1); // 달릴 때 좌우로 살짝 기울어짐
    if (this.shake > 0.002) {
      const k = this.shake * (settings.reduceFlash ? 0.4 : 1);
      this.camera.position.x += (Math.random() - 0.5) * k; this.camera.position.y += (Math.random() - 0.5) * k;
      this.camera.rotation.z += (Math.random() - 0.5) * k * 0.05;
      this.shake *= Math.exp(-dt * 12);
    }
    this.updateCamBasis();
    // 엄폐물 위치 (카메라 기준)
    const cm = this.coverMesh;
    cm.visible = S.phase !== 'move' && this.state !== 'clearing' && !this.coverImg() && this.coverKind() === 'low';
    cm.position.y = lerp(-0.74, -1.2, this.outK) + (this.cover.broken ? -0.25 : 0);
    cm.rotation.z = this.cover.broken ? 0.12 : 0;
    this.coverMat.color.set(S.def.cover); if (this.cover.broken) this.coverMat.color.multiplyScalar(0.45);
    // 기댈 벽: 화면 왼쪽 26% 지점에 오른쪽 모서리가 오게, 3인칭일 때만
    const tpk = this.tpK(), sw = this.sideWall;
    sw.visible = tpk > 0.15 && this.state !== 'clearing' && S.phase !== 'move' && !this.sideUrl() && this.coverKind() === 'side'; // 그림이 있으면 2D로 그림
    if (sw.visible) {
      const hw = 2.1 * this.tanHalf * this.camera.aspect, right = (0.26 * 2 - 1) * hw;
      sw.position.set(right - 0.65 - (1 - tpk) * 1.6, 0.2, -2.1);
    }

    // 엔티티
    if (S.def.boss && S.started) Boss.update(dt, ws);
    else if (S.def.boss) Boss.update(0, 0);
    for (const b of this.bugs) if (b.alive) b.update(dt, ws);
    this.bugs = this.bugs.filter((b) => b.alive);
    this.project();
    if (this.state === 'play') this.check404(dt);

    const ratio = clamp(S.fixed / S.expected, 0, 1);
    S.ratio = ratio;
    World.update(dt, this.state === 'clearing' ? 1 : ratio);
    if (this.state === 'play') MUS.layer = ratio >= 0.999 ? 4 : Math.floor(ratio * 4 + 0.0001);

    if (S.def.boss && Boss.ending && this.state === 'play') {
      S.bossEndT = (S.bossEndT || 0) + dt;
      if (S.bossEndT > 3.2) this.stageClear();
    }
    if (this.state === 'crashing') {
      this.crashT += dt;
      FX.u.tear = Math.min(1, FX.u.tear + dt * 3);
      if (this.crashT > 1.3) { this.state = 'crashed'; this.clearEntities(); UI.showCrash(); }
    }
    if (this.state === 'clearing') {
      this.clearT += dt;
      FX.u.wipeOn = 1; FX.u.wipe = clamp((this.clearT - 0.3) / 1.6, 0, 1);
      if (this.clearT > 2.4) { FX.u.wipeOn = 0; this.state = 'cleared'; S.def.boss ? Story.ending(() => UI.showResult()) : UI.showClear(); }
    }
  },
  sideUrl() { return this.S && (ASSETS['cover_side_' + this.S.def.key] || ASSETS.cover_side); }, // 스테이지별 옆 벽 → 없으면 공용
  coverKind() { const S = this.S; if (!S) return 'low'; if (S.def.boss || S.def.tutorial) return 'low'; const c = S.covers && S.covers[S.ci]; return (c && c.kind) || 'low'; },
  tpK() { return this.S && this.S.phase === 'move' ? 1 : clamp(1 - this.outK, 0, 1); },
  // 엄폐 중 3인칭: 조작 중인 캐릭터 전신 (assets/char_*.png 또는 코드 그림)
  drawChar(g) {
    const a = clamp(1 - this.outK * 2.2, 0, 1); if (!IMG.char) return;
    const P = (IMG.pose && IMG.pose[this.weapon]) || { base: IMG.char[this.weapon] || IMG.char[0] };
    const incoming = this.attacks.some((q) => q.t > q.dur * 0.45) || this.bugs.some((b) => b.alive && b.role !== 'shoot' && b.hostile && b.dist < 6);
    const moving = this.S.phase === 'move';
    // 이동 중: 달리는 뒷모습 (run/run2를 번갈아). 그림이 없으면 기본 자세가 통통 튀며 대신함
    const runIm = P.run && (P.run2 && Math.floor(this.S.moveT * 6) % 2 ? P.run2 : P.run);
    const low = !moving && this.coverKind() === 'low', crouch = low && P.crouch;
    const im = moving && runIm ? runIm : crouch ? (this.hurtT > 0 ? (P.crouchHurt || P.crouch) : incoming ? (P.crouchFlinch || P.crouch) : P.crouch) : this.hurtT > 0 ? (P.hurt || P.base) : incoming ? (P.flinch || P.base) : P.base;
    const iw = im.naturalWidth || im.width, ih = im.naturalHeight || im.height; if (!iw) return;
    const W = this.W, H = this.H, S = this.S;
    const h = W < H ? H * 0.5 : H * 0.72, w = h * iw / ih;
    let cx = W * (W < H ? 0.36 : 0.27), y = H - h * 0.97;
    if (this.hurtT > 0) cx += Math.sin(this.hurtT * 40) * 5; // 맞으면 흔들림
    if (moving) {
      if (runIm) cx = W * 0.5; // 뒷모습은 화면 가운데에서 앞으로 달려감
      y -= Math.abs(Math.sin(S.moveT * 9)) * h * 0.05; cx += Math.sin(S.moveT * 4.5) * w * 0.04;
    }
    if (low && !crouch) y += h * 0.3; // 웅크린 그림이 아직 없으면 서 있는 그림을 낮춰 벽 뒤에 숨은 것처럼
    if (low) cx -= W * 0.03;
    if (crouch) y -= h * 0.05; // 웅크린 그림: 무릎이 화면 아래에 잘리지 않게 살짝 올림
    y += this.outK * h * 0.35; // 일어서며 화면 밖으로
    if (this.attacks.some((q) => q.t > q.dur * 0.6)) cx += (Math.random() - 0.5) * 4; // 움찔
    const br = 1 + Math.sin(this.time * 2.2) * 0.012; // 숨쉬기
    // 기댈 벽 그림 (assets/cover_side.png): 오른쪽 모서리가 캐릭터 왼쪽 어깨쯤
    const sideUrl = this.sideUrl();
    if (sideUrl && S.phase !== 'move' && this.coverKind() === 'side') {
      this._sideImgs = this._sideImgs || {};
      let si = this._sideImgs[sideUrl]; if (!si) { si = this._sideImgs[sideUrl] = new Image(); si.src = sideUrl; }
      if (si.complete && si.naturalWidth) {
        const sh = H * 1.04, swd = sh * si.naturalWidth / si.naturalHeight;
        const right = lerp(cx - w * 0.16, W * 0.09, clamp(this.outK, 0, 1)); // 나오면 몸을 오른쪽으로 빼서, 기둥 가장자리가 화면 왼쪽에 남음
        g.save(); g.globalAlpha = 1; g.imageSmoothingEnabled = false;
        if (this.hudFlipped) { g.translate(W, 0); g.scale(-1, 1); } // UI 뒤집힘 고장: 오른쪽으로
        g.drawImage(si, right - swd, H - sh, swd, sh);
        g.restore();
      }
    }
    if (a <= 0.01) return;
    if (this.hudFlipped) cx = W - cx;
    g.save(); g.globalAlpha = a; g.imageSmoothingEnabled = im instanceof HTMLImageElement;
    g.translate(cx, y + h); g.scale(this.hudFlipped ? -1 : 1, br); g.drawImage(im, -w / 2, -h, w, h);
    if (FX.u.hit > 0.3) { g.globalAlpha = a * FX.u.hit * 0.5; g.globalCompositeOperation = 'source-atop'; g.fillStyle = '#FF4D5E'; g.fillRect(-w / 2, -h, w, h); }
    g.restore();
  },
  // 지금 화면의 버그에 맞는 캐릭터 버튼을 깜빡여 알려 줌
  updateSuggest() {
    const w = { rifle: 0, shotgun: 0, sniper: 0, launcher: 0 };
    for (const b of this.bugs) {
      if (!b.alive || !b.hostile || !b.onScreen) continue;
      const k = WEAK[b.type]; if (!k) continue;
      w[k] += b.role === 'missile' ? 3 : b.role === 'rush' ? (b.dist < 12 ? 2 : 1) : b.type === 'loop' ? 3 : 1.5;
    }
    if (this.S.def.boss) w.sniper += 3;
    let best = 'rifle'; for (const k in w) if (w[k] > w[best]) best = k;
    const mi = KIND_INFO[best].member, cur = this.member().d.kind;
    this.suggest = (w[best] >= 3 && mi !== this.weapon && this.memberUnlocked(mi) && w[best] > w[cur] * 1.5) ? mi : -1;
    this.suggestRb = this.unlocked(2) && this.S.rb > 0 && this.rollT <= 0 && (this.run.stab < 45 || this.cover.broken || this.attacks.length >= 2);
  },
  hardUpdate(dt) {
    if (!this.D.heat) return;
    const S = this.S;
    if (this.overT > 0) {
      this.overT -= dt;
      if (Math.random() < dt * 30) this.smoke.push({ t: 0, x: rnd(-6, 6), vx: rnd(-10, 10), vy: rnd(-50, -30), s: rnd(6, 12) });
      if (this.overT <= 0) { this.overT = 0; this.heat = 35; SND.play('cool'); UI.toast(L('냉각 완료!', 'Cooled down!', '冷却完了!', '冷却完成！')); }
    } else this.heat = Math.max(0, this.heat - (this.out ? 14 : 40) * dt); // 숨으면 빨리 식음
    if (S.phase === 'fight') { S.jamT -= dt; if (S.jamT <= 0) { S.jamT = rnd(18, 30); this.overheat(L('갑자기 과열! 2초 냉각', 'Sudden overheat! Cooling 2s', '突然のオーバーヒート! 2秒冷却', '突然过热！冷却2秒')); } }
  },
  project() {
    const cam = this.camera, W = this.W, H = this.H, k = H / 2 / this.tanHalf;
    for (const b of this.bugs) {
      _proj.copy(b.pos).project(cam);
      b.behind = _proj.z > 1;
      b.onScreen = _proj.z < 1 && Math.abs(_proj.x) < 1.3 && Math.abs(_proj.y) < 1.3;
      b.dist = b.pos.distanceTo(cam.position);
      b.sx = (_proj.x + 1) / 2 * W; b.sy = (1 - _proj.y) / 2 * H;
      b.sr = (b.spr.scale.x / 2) / Math.max(0.5, b.dist) * k;
    }
    if (this.S.def.boss) for (const sn of Boss.snakes) for (const s of sn.segs) {
      _proj.copy(s.pos).project(cam);
      s.onScreen = _proj.z < 1;
      s.sx = (_proj.x + 1) / 2 * W; s.sy = (1 - _proj.y) / 2 * H;
      const d = Math.max(0.5, s.pos.distanceTo(cam.position));
      s.sw = (s.mesh.scale.x / 2) / d * k; s.sh = (s.mesh.scale.y / 2) / d * k;
    }
  },
  check404(dt) {
    const a = this.aim();
    for (const b of this.bugs) {
      if (b.type !== 'e404' || !b.alive) continue;
      const over = this.out && Math.hypot(b.sx - a.x, b.sy - a.y) < b.sr + this.retR();
      b.hover = over ? b.hover + dt : Math.max(0, b.hover - dt * 0.5);
      if (b.hover >= 1) { // 근처로 순간이동
        b.hover = 0;
        PFX.spark(b.pos, [1, 0.54, 0.24], 10, 4);
        const off = this.camR.clone().multiplyScalar((RNG() < 0.5 ? -1 : 1) * rnd(3, 5)).addScaledVector(this.camU, rnd(-1, 1.5));
        b.pos.add(off); if (b.anchor) b.anchor.add(off);
        this.run.st.tele++;
        SND.play('tele');
        this.pop(b.sx, b.sy, '404!', '#FF8A3D');
      }
    }
  },
  updateFX(dt) {
    const k = Math.min(1, dt * 10);
    const play = this.state === 'play';
    if (this.state !== 'crashing') FX.u.tear += ((play && this.hasGlitch('tear') ? 1 : 0) - FX.u.tear) * k;
    FX.u.inv += ((play && this.hasGlitch('inv') ? 1 : 0) - FX.u.inv) * k;
    FX.u.pix += ((play && this.hasGlitch('pix') ? 1 : 0) - FX.u.pix) * k;
    FX.u.slow += ((this.rollT > 0 ? 1 : 0) - FX.u.slow) * k;
    FX.u.hit = Math.max(0, FX.u.hit - dt * 2.2);
    const flip = play && this.hasGlitch('flip');
    if (flip !== this.hudFlipped) { this.hudFlipped = flip; $('#hud').classList.toggle('flipped', flip); }
  },

  // ----- 총 그리기 (1인칭, 숨으면 내려감) -----
  aimPoint() { return { x: this.ret.x, y: this.ret.y }; },
  loadGunAssets() {
    if (this.gunImgs) return;
    this.gunImgs = SQUAD.map((s) => gunCanvas(s.color));
    this.fpImgs = [];
    [ASSETS.gun, ASSETS.gun_refactor, ASSETS.gun_sniper, ASSETS.gun_ada].forEach((url, i) => {
      if (!url) return;
      const im = new Image();
      im.onload = () => { im.muzzle = findMuzzle(im); };
      im.src = url; this.fpImgs[i] = im;
    });
  },
  fpImage() {
    this.loadGunAssets();
    const im = this.fpImgs[this.weapon];
    return im && im.complete && im.naturalWidth && im.muzzle ? im : null;
  },
  lowered() { return (1 - this.outK) * (this.S && this.S.phase === 'move' ? 1.2 : 1); },
  fpLayout() {
    const im = this.fpImage(); if (!im) return null;
    const W = this.W, H = this.H, a = this.aimPoint();
    const w = W < H ? W * 0.62 : Math.min(W * 0.46, H * 0.62), h = w * im.naturalHeight / im.naturalWidth;
    const ax = (a.x - W / 2) / W, ay = (a.y - H / 2) / H;
    const bob = Math.sin(this.time * 3.2) * h * 0.012;
    const flip = this.hudFlipped, low = this.lowered();
    let x = W - w * 0.92 + ax * w * 0.14 + this.recoil * w * 0.03 + low * w * 0.1;
    const y = H - h * 0.9 + ay * h * 0.1 + this.recoil * h * 0.05 + bob + low * h * 0.5;
    if (flip) x = W - x - w;
    const mx = flip ? x + w - im.muzzle.x * w : x + im.muzzle.x * w;
    return { im, x, y, w, h, flip, muzzle: { x: mx, y: y + im.muzzle.y * h } };
  },
  gunPivot() { return { x: this.W * (this.hudFlipped ? 0.2 : 0.8), y: this.H + Math.min(this.W, this.H) * (0.04 + this.lowered() * 0.2) }; },
  gunLen() { return Math.min(Math.max(this.W, this.H) * 0.2, Math.min(this.W, this.H) * 0.42); },
  gunPos() {
    const fp = this.fpLayout();
    if (fp) return fp.muzzle;
    const p = this.gunPivot(), a = this.aimPoint();
    const ang = Math.atan2(a.y - p.y, a.x - p.x), L = this.gunLen() * (0.72 - this.recoil * 0.05);
    return { x: p.x + Math.cos(ang) * L, y: p.y + Math.sin(ang) * L };
  },
  drawGun(g) {
    this.loadGunAssets();
    const ga = clamp((this.outK - 0.15) * 1.8, 0, 1); if (ga <= 0.01) return; // 숨어 있을 땐 3인칭 캐릭터가 대신 보임
    g.save(); g.globalAlpha = ga; this._drawGun(g); g.restore();
  },
  _drawGun(g) {
    const m = this.member(), col = m ? m.d.color : '#C6F432';
    const fp = this.fpLayout();
    if (fp) {
      g.save(); g.imageSmoothingEnabled = true;
      if (fp.flip) { g.translate(fp.x + fp.w, fp.y); g.scale(-1, 1); } else g.translate(fp.x, fp.y);
      const jit = this.overT > 0 ? (Math.random() - 0.5) * 3 : 0;
      g.drawImage(fp.im, jit, 0, fp.w, fp.h);
      const hk = this.D.heat ? (this.overT > 0 ? 0.75 : Math.max(0, this.heat - 40) / 60 * 0.5) : 0;
      if (hk > 0.01) { g.globalAlpha = hk; g.drawImage(hotTint(fp.im), jit, 0, fp.w, fp.h); g.globalAlpha = 1; }
      g.restore();
      if (this.recoil > 0.5) {
        const mm = fp.muzzle, r = fp.w * 0.07 * Math.min(1.6, this.recoil);
        const gr = g.createRadialGradient(mm.x, mm.y, 0, mm.x, mm.y, r);
        gr.addColorStop(0, 'rgba(255,255,230,.95)'); gr.addColorStop(0.4, col); gr.addColorStop(1, 'rgba(198,244,50,0)');
        g.fillStyle = gr; g.beginPath(); g.arc(mm.x, mm.y, r, 0, 6.283); g.fill();
      }
      return;
    }
    const p = this.gunPivot(), a = this.aimPoint(), L = this.gunLen();
    const ang = Math.atan2(a.y - p.y, a.x - p.x);
    const img = this.gunImgs[this.weapon] || this.gunImgs[0];
    const h = L * img.height / img.width;
    g.save(); g.translate(p.x, p.y); g.rotate(ang);
    if (Math.cos(ang) < 0) g.scale(1, -1);
    g.imageSmoothingEnabled = false;
    const back = this.recoil * L * 0.05;
    g.drawImage(img, -L * 0.2 - back, -h * 0.55, L, h);
    g.restore();
  },
  drawHeat(g, dt) {
    if (!this.D.heat) return;
    const m = this.gunPos();
    for (const p of this.smoke) {
      p.t += dt; const a = 0.55 * (1 - p.t / 1.2); if (a <= 0) continue;
      g.fillStyle = `rgba(170,175,165,${a})`;
      const s = p.s * (1 + p.t * 2.5);
      g.fillRect(m.x + p.x + p.vx * p.t - s / 2, m.y + p.vy * p.t * 1.6 - s / 2, s, s);
    }
    this.smoke = this.smoke.filter((p) => p.t < 1.2);
    if (this.heat < 4 && this.overT <= 0) return;
    const w = 70, h = 7, x = m.x - w / 2, y = m.y - 46;
    g.fillStyle = 'rgba(10,12,9,.8)'; g.fillRect(x - 2, y - 14, w + 4, h + 18);
    g.fillStyle = '#2a2f28'; g.fillRect(x, y, w, h);
    const k = this.heat / 100;
    g.fillStyle = this.overT > 0 ? (Math.floor(this.time * 8) % 2 ? '#FF4D5E' : '#FF8A3D') : k > 0.7 ? '#FF8A3D' : '#FFD34D';
    g.fillRect(x, y, w * k, h);
    g.font = 'bold 10px ui-monospace,Menlo,monospace'; g.textAlign = 'center';
    g.fillStyle = this.overT > 0 ? '#FF8A3D' : '#cfd6c8';
    g.fillText(this.overT > 0 ? L(`과열 ${this.overT.toFixed(1)}s`, `Overheat ${this.overT.toFixed(1)}s`, `オーバーヒート ${this.overT.toFixed(1)}s`, `过热 ${this.overT.toFixed(1)}s`) : 'HEAT', m.x, y - 3);
  },
  pop(x, y, txt, col) { this.pops.push({ x, y, txt, col, t: 0 }); },

  // ----- 2D 오버레이 -----
  draw2D(dt) {
    const g = this.g2, W = this.W, H = this.H;
    g.clearRect(0, 0, W, H);
    const inGame = this.state === 'play' || this.state === 'crashing' || this.state === 'clearing' || this.state === 'tutor';
    if (!inGame) { this.tracers = []; this.pops = []; return; }
    const mono = 'ui-monospace,Menlo,monospace';
    this.drawCoverImg(g);
    if (this.S && this.S.phase === 'move') this.drawMoveEdges(g);
    if (this.blastFx) { const b = this.blastFx; b.t += dt; const k = b.t / 0.35; if (k >= 1) this.blastFx = null; else { if (IMG.capsule && k < 0.3) { const q = k / 0.3, cs = 46 * (1 - q * 0.5); g.save(); g.translate(lerp(b.x0, b.x, q), lerp(b.y0, b.y, q)); g.rotate(Math.atan2(b.y - b.y0, b.x - b.x0) + 0.45); g.drawImage(IMG.capsule, -cs / 2, -cs / 2, cs, cs); g.restore(); } g.globalAlpha = 1 - k; g.strokeStyle = '#FF5FA2'; g.lineWidth = 6; g.beginPath(); g.arc(b.x, b.y, b.r * (0.4 + k * 0.6), 0, 6.283); g.stroke(); g.fillStyle = 'rgba(255,95,162,.18)'; g.fill(); g.globalAlpha = 1; } }
    // 적 공격 예고 (빨간 원 → 패킷이 날아옴)
    for (const a of this.attacks) {
      const k = clamp(a.t / a.dur, 0, 1), pulse = 0.5 + 0.5 * Math.sin(this.time * 24);
      const r = lerp(70, 24, k);
      const wc = WARN();
      if (settings.cb) { // 색약 모드: 검은 테두리 + 돌아가는 점선 고리 (색이 안 보여도 모양으로 알 수 있게)
        g.strokeStyle = '#000'; g.lineWidth = 7; g.beginPath(); g.arc(a.x, a.y, r, 0, 6.283); g.stroke();
        g.save(); g.setLineDash([10, 8]); g.lineDashOffset = -this.time * 40; g.strokeStyle = `rgba(${wc},.95)`; g.lineWidth = 4; g.beginPath(); g.arc(a.x, a.y, r + 12, 0, 6.283); g.stroke(); g.restore();
      }
      g.strokeStyle = `rgba(${wc},${0.55 + pulse * 0.45})`; g.lineWidth = 3;
      g.beginPath(); g.arc(a.x, a.y, r, 0, 6.283); g.stroke();
      g.fillStyle = `rgba(${wc},${0.08 + k * 0.25})`; g.beginPath(); g.arc(a.x, a.y, 24, 0, 6.283); g.fill();
      g.strokeStyle = `rgba(${wc},.9)`; g.beginPath(); g.arc(a.x, a.y, 24, -Math.PI / 2, -Math.PI / 2 + k * 6.283); g.stroke();
      g.font = `bold ${settings.cb ? 26 : 20}px ${mono}`; g.textAlign = 'center';
      if (settings.cb) { g.fillStyle = '#000'; g.fillText('!', a.x + 2, a.y + 9); }
      g.fillStyle = `rgb(${wc})`; g.fillText('!', a.x, a.y + 7);
      if (a.src && a.src.sx > -500) { g.setLineDash([6, 6]); g.strokeStyle = `rgba(${wc},.35)`; g.lineWidth = 1.5; g.beginPath(); g.moveTo(a.src.sx, a.src.sy); g.lineTo(a.x, a.y); g.stroke(); g.setLineDash([]); }
      if (k > 0.7 && a.src) { // 날아오는 패킷
        const q = (k - 0.7) / 0.3, px = lerp(a.src.sx, a.x, q), py = lerp(a.src.sy, a.y, q), s = lerp(14, 46, q);
        g.imageSmoothingEnabled = false; g.drawImage(IMG.packet, px - s / 2, py - s * 0.35, s, s * 0.7);
      }
    }
    // 탄 궤적
    for (const t of this.tracers) {
      t.t += dt;
      const a = (1 - t.t / 0.1) * (t.a || 1);
      if (a <= 0) continue;
      g.globalAlpha = a; g.strokeStyle = t.c || '#C6F432'; g.lineWidth = t.w;
      g.beginPath(); g.moveTo(t.x0, t.y0); g.lineTo(t.x1, t.y1); g.stroke();
      g.fillStyle = '#ffffff'; g.fillRect(t.x1 - 3, t.y1 - 3, 6, 6); g.globalAlpha = 1;
    }
    this.tracers = this.tracers.filter((t) => t.t < 0.1);
    if (this.state === 'play' || this.state === 'clearing' || this.state === 'tutor') { this.drawChar(g); this.drawGun(g); this.drawHeat(g, dt); }
    // 404 게이지, 이름표, 체력
    for (const b of this.bugs) {
      if (!b.onScreen) continue;
      if (b.type === 'e404' && b.hover > 0.05) {
        g.strokeStyle = '#FF8A3D'; g.lineWidth = 3; g.beginPath();
        g.arc(b.sx, b.sy, b.sr + 10, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * Math.min(1, b.hover)); g.stroke();
      }
      if (b.hostile && WEAK[b.type] && (b.type !== 'ghost' || b.vis)) { // 약점 무기 표시
        const ki = KIND_INFO[WEAK[b.type]], x = b.sx + b.sr * 0.75, y = b.sy - b.sr * 0.75;
        g.fillStyle = '#10140c'; g.beginPath(); g.arc(x, y, 9, 0, 6.283); g.fill();
        g.strokeStyle = ki.color; g.lineWidth = 2; g.stroke();
        g.font = 'bold 10px sans-serif'; g.textAlign = 'center'; g.fillStyle = ki.color; g.fillText(ki.glyph, x, y + 3.5);
      }
      if (b.hostile && b.maxHp > 1 && b.hp < b.maxHp && (b.type !== 'ghost' || b.vis)) {
        const w = Math.max(24, b.sr * 1.4); g.fillStyle = 'rgba(0,0,0,.6)'; g.fillRect(b.sx - w / 2, b.sy - b.sr - 10, w, 4);
        g.fillStyle = '#FF4D5E'; g.fillRect(b.sx - w / 2, b.sy - b.sr - 10, w * b.hp / b.maxHp, 4);
      }
      if (b.label) {
        g.font = `bold 13px ${mono}`; g.textAlign = 'center';
        const tw = g.measureText('NEW · ' + b.label).width + 14;
        g.fillStyle = 'rgba(14,16,13,.85)'; g.fillRect(b.sx - tw / 2, b.sy - b.sr - 34, tw, 20);
        g.fillStyle = '#FFD34D'; g.fillText('NEW · ' + b.label, b.sx, b.sy - b.sr - 19);
      }
    }
    // 가까운 돌격 버그·미사일 경고 + 화면 밖 화살표
    for (const b of this.bugs) {
      if (!b.alive || !b.hostile || b.role === 'shoot' || b.dist == null) continue;
      const inView = !b.behind && b.sx > 0 && b.sx < W && b.sy > 0 && b.sy < H;
      if (inView && b.dashT > 0) {
        g.font = `bold 20px ${mono}`; g.textAlign = 'center';
        g.fillStyle = '#000'; g.fillText('!!', b.sx + 2, b.sy - b.sr - 6); g.fillStyle = `rgb(${WARN()})`; g.fillText('!!', b.sx, b.sy - b.sr - 8);
      }
      const near = b.role === 'missile' ? 14 : 7;
      if (inView && b.dist < near) {
        if (!b.warned && this.state === 'play') { b.warned = true; SND.play('warn'); }
        const pulse = 0.5 + 0.5 * Math.sin(this.time * 22), col = b.role === 'missile' ? '224,91,255' : WARN();
        g.strokeStyle = `rgba(${col},${0.5 + pulse * 0.5})`; g.lineWidth = 3;
        g.beginPath(); g.arc(b.sx, b.sy, b.sr + 6 + pulse * 4, 0, 6.283); g.stroke();
        g.font = `bold ${b.role === 'missile' ? 12 : 22}px ${mono}`; g.textAlign = 'center';
        const txt = b.role === 'missile' ? L('관통!', 'PIERCE!', '貫通!', '穿透！') : '!';
        g.fillStyle = '#000'; g.fillText(txt, b.sx + 2, b.sy - b.sr - 8); g.fillStyle = `rgb(${col})`; g.fillText(txt, b.sx, b.sy - b.sr - 10);
      } else if (!inView && b.dist < 24 && this.state === 'play') {
        let dx = b.sx - W / 2, dy = b.sy - H / 2;
        if (b.behind) { dx = -dx; dy = -dy; }
        const len = Math.hypot(dx, dy) || 1; dx /= len; dy /= len;
        const m = 34, sc = Math.min((W / 2 - m) / Math.max(1e-3, Math.abs(dx)), (H / 2 - m) / Math.max(1e-3, Math.abs(dy)));
        const x = W / 2 + dx * sc, y = H / 2 + dy * sc, ang = Math.atan2(dy, dx);
        g.save(); g.translate(x, y); g.rotate(ang);
        g.fillStyle = `rgba(${WARN()},${clamp(1.3 - b.dist / 24, 0.35, 1)})`; g.beginPath(); g.moveTo(16, 0); g.lineTo(-8, -11); g.lineTo(-8, 11); g.closePath(); g.fill();
        g.strokeStyle = '#000'; g.lineWidth = 2; g.stroke(); g.restore();
      }
    }
    // 보스 오류 줄 체력
    if (this.S && this.S.def.boss && !Boss.ending) for (const s of Boss.targets()) {
      if (!s.onScreen || !s.snake.real || !s.maxHp) continue;
      const w = Math.max(40, s.sw * 1.4);
      g.fillStyle = 'rgba(0,0,0,.6)'; g.fillRect(s.sx - w / 2, s.sy - s.sh - 10, w, 5);
      g.fillStyle = '#FF4D5E'; g.fillRect(s.sx - w / 2, s.sy - s.sh - 10, w * Math.max(0, s.hp) / s.maxHp, 5);
    }
    // 점수 팝업
    g.textAlign = 'center';
    for (const p of this.pops) {
      p.t += dt;
      const a = 1 - p.t / 0.8;
      if (a <= 0) continue;
      g.font = `bold 16px ${mono}`;
      g.globalAlpha = a; g.fillStyle = '#000'; g.fillText(p.txt, p.x + 2, p.y - p.t * 40 + 2);
      g.fillStyle = p.col; g.fillText(p.txt, p.x, p.y - p.t * 40); g.globalAlpha = 1;
    }
    this.pops = this.pops.filter((p) => p.t < 0.8);
    if (this.state === 'play') this.drawReticle(g);
    if (this.tutorTarget && this.tutorTarget.alive && this.tutorTarget.onScreen) { // 안내 중인 버그 강조
      const b = this.tutorTarget; g.strokeStyle = '#FFD34D'; g.lineWidth = 3; g.setLineDash([6, 5]);
      g.beginPath(); g.arc(b.sx, b.sy, b.sr + 14, 0, 6.283); g.stroke(); g.setLineDash([]);
    }
    this.drawCoverBar(g);
    if (this.rollT > 0) {
      g.font = `bold 18px ${mono}`; g.textAlign = 'center'; g.fillStyle = '#6fe7ff';
      g.fillText('◀◀ ROLLBACK ' + this.rollT.toFixed(1), W / 2, H * 0.22);
    }
  },
  drawReticle(g) {
    const m = this.member(); if (!m || this.S.phase === 'move') return; // 이동 중엔 조준선 숨김
    const a = this.aim(), r = this.retR(), mono = 'ui-monospace,Menlo,monospace';
    const moving = this.S.phase === 'move';
    const slip = this.hasGlitch('slip');
    const col = slip ? '#FF4D5E' : m.d.color;
    const live = this.out && !moving;
    g.globalAlpha = live ? 1 : 0.5;
    g.strokeStyle = col; g.lineWidth = 2;
    const rr = m.d.kind === 'shotgun' ? r * 2.2 : r;
    g.beginPath(); g.arc(a.x, a.y, rr, 0, 6.283); g.stroke();
    g.beginPath(); g.moveTo(a.x - rr - 8, a.y); g.lineTo(a.x - rr + 6, a.y); g.moveTo(a.x + rr - 6, a.y); g.lineTo(a.x + rr + 8, a.y);
    g.moveTo(a.x, a.y - rr - 8); g.lineTo(a.x, a.y - rr + 6); g.moveTo(a.x, a.y + rr - 6); g.lineTo(a.x, a.y + rr + 8); g.stroke();
    g.fillStyle = col; g.fillRect(a.x - 1.5, a.y - 1.5, 3, 3);
    // 탄약 고리
    const k = m.reloadT > 0 ? 1 - m.reloadT / m.d.reload : m.ammo / m.d.mag;
    g.lineWidth = 4; g.strokeStyle = m.reloadT > 0 ? '#FFD34D' : col;
    g.beginPath(); g.arc(a.x, a.y, rr + 12, -Math.PI / 2, -Math.PI / 2 + 6.283 * k); g.stroke();
    if (m.d.kind === 'sniper' && this.charge > 0) {
      g.lineWidth = 3; g.strokeStyle = '#ffffff';
      g.beginPath(); g.arc(a.x, a.y, rr * (1.6 - this.charge * 0.6), 0, 6.283); g.stroke();
    }
    g.globalAlpha = 1;
    g.font = `bold 12px ${mono}`; g.textAlign = 'center';
    const txt = moving ? L('이동 중…', 'Moving…', '移動中…', '移动中…') : m.reloadT > 0 ? L(`재장전 ${m.reloadT.toFixed(1)}s`, `Reloading ${m.reloadT.toFixed(1)}s`, `リロード ${m.reloadT.toFixed(1)}s`, `换弹 ${m.reloadT.toFixed(1)}s`) : this.out ? `${m.ammo}/${m.d.mag}` : L('엄폐 중', 'In cover', '遮蔽中', '隐蔽中');
    g.fillStyle = '#000'; g.fillText(txt, a.x + 1, a.y + rr + 31); g.fillStyle = m.reloadT > 0 ? '#FFD34D' : '#E8EDE2'; g.fillText(txt, a.x, a.y + rr + 30);
    for (const t of this.taps) {
      t.t += 1 / 60; const al = 1 - t.t / 0.35; if (al <= 0) continue;
      g.strokeStyle = `rgba(198,244,50,${al * 0.6})`; g.lineWidth = 2;
      g.beginPath(); g.arc(t.x, t.y, 10 + t.t * 70, 0, 6.283); g.stroke();
    }
    this.taps = this.taps.filter((t) => t.t < 0.35);
  },
  // 엄폐물 그림 (assets/cover_<스테이지>.png 또는 cover.png 가 있으면 3D 블록 대신 사용)
  coverImg() {
    if (!this.S) return null;
    const key = 'cover_' + this.S.def.key, url = ASSETS[key] || ASSETS.cover;
    if (!url) return null;
    this._covImgs = this._covImgs || {};
    let im = this._covImgs[url]; if (!im) { im = this._covImgs[url] = new Image(); im.src = url; }
    return im.complete && im.naturalWidth ? im : null;
  },
  drawCoverImg(g) {
    const im = this.coverImg(); if (!im || this.S.phase === 'move' || this.state === 'clearing' || this.coverKind() !== 'low') return;
    const W = this.W, H = this.H;
    // 가로 폭에 맞추고, 세로가 모자라면 아래로 쌓아서 채움 (세로 폰에서 크게 확대되지 않게)
    const w = Math.max(W * 1.08, 520), h = w * im.naturalHeight / im.naturalWidth;
    const y = lerp(H * 0.55, H * 0.8, this.outK) + (this.cover.broken ? H * 0.06 : 0) + Math.sin(this.time * 3) * 1.5;
    g.save(); g.imageSmoothingEnabled = false;
    if (this.cover.broken) { g.translate(W / 2, y); g.rotate(0.05); g.translate(-W / 2, -y); g.globalAlpha = 0.85; }
    for (let yy = y, k = 0; yy < H + 20 && k < 6; yy += h * 0.9, k++) {
      const off = k % 2 ? w * 0.18 : 0; // 줄마다 살짝 엇갈리게
      g.drawImage(im, (W - w) / 2 - off, yy, w, h);
      if (off) g.drawImage(im, (W - w) / 2 - off + w, yy, w, h);
      if (k > 0) { g.fillStyle = 'rgba(0,0,0,.25)'; g.fillRect(0, yy, W, h); } // 아래 줄은 약간 어둡게
    }
    if (this.cover.broken) { g.fillStyle = 'rgba(0,0,0,.45)'; g.fillRect(0, y, W, H - y); }
    g.restore();
  },
  // 이동 중: 화면 가장자리가 어둡게 일렁이고 속도선이 스침
  drawMoveEdges(g) {
    const W = this.W, H = this.H, k = settings.reduceFlash ? 0.4 : 1, t = this.S.moveT;
    const jx = (Math.random() - 0.5) * 7 * k, jy = (Math.random() - 0.5) * 5 * k, p = 0.5 + 0.5 * Math.sin(t * 18);
    const gr = g.createRadialGradient(W / 2 + jx, H * 0.45 + jy, Math.min(W, H) * (0.32 + p * 0.03), W / 2, H * 0.45, Math.max(W, H) * 0.78);
    gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, `rgba(0,0,0,${(0.5 + p * 0.12) * k + 0.1})`);
    g.fillStyle = gr; g.fillRect(0, 0, W, H);
    g.strokeStyle = 'rgba(220,230,210,.22)'; g.lineWidth = 2;
    const n = Math.round(10 * k);
    for (let i = 0; i < n; i++) {
      const left = i % 2 === 0, x = left ? Math.random() * W * 0.12 : W - Math.random() * W * 0.12;
      const y = Math.random() * H, len = 40 + Math.random() * 60;
      g.beginPath(); g.moveTo(x, y); g.lineTo(x + (left ? -1 : 1) * len * 0.25, y + len); g.stroke();
    }
  },
  drawCoverBar(g) {
    if (!this.S || this.S.phase === 'move' || this.state === 'clearing') return;
    const c = this.cover, W = this.W, H = this.H;
    const w = Math.min(220, W * 0.5), x = (W - w) / 2, y = H - (W < H ? 150 : 96);
    g.fillStyle = 'rgba(10,12,9,.75)'; g.fillRect(x - 3, y - 15, w + 6, 24);
    g.fillStyle = '#2a2f28'; g.fillRect(x, y, w, 6);
    g.fillStyle = c.broken ? '#FF4D5E' : c.hp / c.max < 0.35 ? '#FF8A3D' : '#cfd6c8';
    g.fillRect(x, y, w * c.hp / c.max, 6);
    g.font = 'bold 10px ui-monospace,Menlo,monospace'; g.textAlign = 'left'; g.fillStyle = '#aab2a3';
    g.fillText(c.broken ? L('엄폐물 파괴됨!', 'Cover destroyed!', '遮蔽物破壊!', '掩体已摧毁！') : L(`엄폐물 ${Math.ceil(c.hp)}`, `Cover ${Math.ceil(c.hp)}`, `遮蔽物 ${Math.ceil(c.hp)}`, `掩体 ${Math.ceil(c.hp)}`), x, y - 4);
    g.textAlign = 'right'; g.fillText(this.S.def.boss ? L('보스전', 'Boss fight', 'ボス戦', 'Boss战') : L(`지점 ${this.S.ci + 1}/3 · 웨이브 ${this.S.wi + 1}/2`, `Point ${this.S.ci + 1}/3 · Wave ${this.S.wi + 1}/2`, `ポイント ${this.S.ci + 1}/3 · ウェーブ ${this.S.wi + 1}/2`, `掩体点 ${this.S.ci + 1}/3 · 波次 ${this.S.wi + 1}/2`), x + w, y - 4);
  },
};
