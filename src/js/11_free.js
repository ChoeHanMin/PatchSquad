// ---------- 자유 작전 (Free Ops): 1인칭 자유 이동 모드 ----------
// WASD 이동 · 마우스 시점(포인터 잠금) · 좌클릭 사격 · R 재장전 · Z 엄폐(웅크리기) · Shift/E/Q 분대원 스킬 · F 롤백 · 1/2/3·휠 분대원 교체
// 스테이지마다 구역 3곳: 구역에 들어가면 장벽이 닫히고 웨이브 2개 → 다 고치면 장벽이 열리고 다음 구역으로. 마지막은 보스 "메인 루프"
const FV = { a: new THREE.Vector3(), b: new THREE.Vector3(), c: new THREE.Vector3(), d: new THREE.Vector3(), e: new THREE.Vector3() };

// 분대원 스킬: [이동기 Shift, 보조기 E, 궁극기 Q]
const FREE_SKILLS = [
  { // 도트 · 디버거
    shift: { name: L('스텝 오버', 'Step Over', 'ステップオーバー', '单步跳过'), cd: 5, desc: L('앞으로 순간 이동 (잠깐 무적)', 'Blink forward (brief invulnerability)', '前方へ瞬間移動(一瞬無敵)', '向前瞬移（短暂无敌）') },
    e: { name: L('브레이크포인트', 'Breakpoint', 'ブレークポイント', '断点'), cd: 10, desc: L('조준한 곳 주변 버그를 2.5초 정지', 'Freeze bugs around the aimed spot for 2.5s', '狙った場所の周りのバグを2.5秒停止', '冻结瞄准点周围的Bug 2.5秒') },
    q: { name: L('디버그 모드', 'Debug Mode', 'デバッグモード', '调试模式'), desc: L('6초 동안 탄약 무한 · 약점 노출 · 피해 +50%', '6s: infinite ammo, weak spots exposed, +50% damage', '6秒間 弾無限・弱点むき出し・ダメージ+50%', '6秒内弹药无限·暴露弱点·伤害+50%') },
  },
  { // 렉스 · 리팩터
    shift: { name: L('리베이스 돌진', 'Rebase Rush', 'リベース突進', '变基冲锋'), cd: 6, desc: L('앞으로 돌진하며 버그를 밀어냄', 'Charge forward, knocking bugs back', '突進してバグを押し返す', '向前冲锋击退Bug') },
    e: { name: L('방화벽', 'Firewall', 'ファイアウォール', '防火墙'), cd: 12, desc: L('앞에 엄폐벽을 세움 (에러 패킷을 막음)', 'Raise a cover wall that blocks error packets', '前方に遮蔽壁を立てる(エラーパケットを防ぐ)', '在前方竖起掩体墙（挡住错误数据包）') },
    q: { name: L('전면 리팩터', 'Full Refactor', '全面リファクタ', '全面重构'), desc: L('충격파로 주변 버그를 한꺼번에 고침', 'A shockwave that fixes nearby bugs all at once', '衝撃波で周りのバグをまとめて修復', '冲击波一次修复周围的Bug') },
  },
  { // 핀 · 프로파일러
    shift: { name: L('비동기 점프', 'Async Jump', '非同期ジャンプ', '异步跳跃'), cd: 7, desc: L('높이 뛰어올라 잠깐 떠 있음', 'Leap high and hover briefly', '高く跳んで少し浮く', '高高跃起并短暂悬停') },
    e: { name: L('프로파일 스캔', 'Profile Scan', 'プロファイルスキャン', '性能扫描'), cd: 12, desc: L('주변 버그를 표시 (받는 피해 +50%, 투명 버그도 보임)', 'Mark nearby bugs (+50% damage taken, ghosts revealed)', '周りのバグをマーク(被ダメージ+50%、ゴーストも見える)', '标记周围Bug（受到伤害+50%，幽灵现形）') },
    q: { name: L('가비지 컬렉터', 'Garbage Collector', 'ガベージコレクタ', '垃圾回收'), desc: L('표시된 버그를 모두 지우는 광선', 'A beam that erases every marked bug', 'マークしたバグをすべて消すビーム', '清除所有被标记Bug的光束') },
  },
  { // 에이다 · 테스터
    shift: { name: L('캐시 대시', 'Cache Dash', 'キャッシュダッシュ', '缓存冲刺'), cd: 6, desc: L('미끄러지며 이동하고 지나간 자리에 회복 패치를 남김', 'Slide forward, leaving a healing patch behind', '滑って移動し、通った場所に回復パッチを残す', '滑行前进，在身后留下回复补丁') },
    e: { name: L('테스트 드론', 'Test Drone', 'テストドローン', '测试无人机'), cd: 14, desc: L('8초 동안 버그를 자동으로 쏘는 드론', 'A drone that auto-fires at bugs for 8s', '8秒間バグを自動で撃つドローン', '8秒内自动射击Bug的无人机') },
    q: { name: L('회귀 테스트', 'Regression Test', '回帰テスト', '回归测试'), desc: L('조준한 구역에 테스트 캡슐 비가 쏟아짐', 'A rain of test capsules on the aimed area', '狙ったエリアにテストカプセルの雨', '测试胶囊如雨般落向瞄准区域') },
  },
];
const FREE_ZONES = [0.2, 0.52, 0.84];
const FREE_HALFW = { forest: 6, city: 7.2, subway: 3.3, server: 4.2, physics: 6.5 };

const Free = {
  active: false, S: null, run: null, D: null, keys: {}, locked: false,
  bugs: [], shots: [], walls: [], covers: [], pops: [], hitDirs: [], marks: [],
  bind() {
    window.addEventListener('keydown', (e) => {
      if (!this.active) return;
      const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      if (Game.state !== 'free') return;
      if (Story.active) return;
      if (e.key === 'Escape') { if (this.intro) return; this.pause(); return; }
      if (this.intro) return;
      this.keys[e.code] = true;
      if (e.repeat) return;
      if (e.code === 'KeyR') this.reload();
      else if (e.code === 'KeyZ') this.toggleCrouch();
      else if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') this.skill('shift');
      else if (e.code === 'KeyE') this.skill('e');
      else if (e.code === 'KeyQ') this.skill('q');
      else if (e.code === 'KeyF') this.rollback();
      else if (k >= '1' && k <= String(SQUAD.length)) this.select(+k - 1);
      if (['Space', 'Tab'].includes(e.code)) e.preventDefault();
    });
    window.addEventListener('keyup', (e) => { this.keys[e.code] = false; });
    window.addEventListener('blur', () => { this.keys = {}; this.mouse = false; });
    window.addEventListener('mousemove', (e) => {
      if (!this.active || Game.state !== 'free' || this.intro) return;
      if (!this.locked && !e.buttons) return; // 잠금이 안 되면 버튼을 누른 채로 끌어서 시점 이동
      const s = 0.0023 * (settings.sens || 1);
      this.p.yaw -= e.movementX * s; this.p.pitch = clamp(this.p.pitch - e.movementY * s, -1.35, 1.35);
    });
    const cv = $('#gl');
    cv.addEventListener('mousedown', (e) => {
      if (!this.active || e.button !== 0) return;
      if (this.intro) return;
      if (Game.state === 'free' && !this.locked) this.lock();
      this.mouse = true;
    });
    window.addEventListener('mouseup', (e) => { if (e.button === 0 && this.active) { this.mouse = false; this.release(); } });
    window.addEventListener('wheel', (e) => { if (this.active && Game.state === 'free') this.cycle(e.deltaY > 0 ? 1 : -1); }, { passive: true });
    document.addEventListener('pointerlockchange', () => {
      this.locked = document.pointerLockElement === cv;
      if (!this.locked && this.active && Game.state === 'free' && !this.intro && !this.busy) this.pause(); // Esc로 잠금이 풀리면 일시정지
    });
    $('#freeIntro').addEventListener('click', () => { if (!this.intro) return; SND.init(); SND.play('click'); this.intro = false; $('#freeIntro').classList.add('hidden'); this.lock(); });
  },
  lock() { try { const r = $('#gl').requestPointerLock(); if (r && r.catch) r.catch(() => {}); } catch (e) { /* 잠금 없이 진행 */ } },
  unlock() { this.busy = true; try { if (document.pointerLockElement) document.exitPointerLock(); } catch (e) { /* 없음 */ } setTimeout(() => { this.busy = false; }, 50); },

  // ----- 시작 / 스테이지 -----
  start(diff, daily) {
    if (Tut.active) Tut.stop();
    Game.clearEntities(); Game.coverMesh.visible = false; if (Game.sideWall) Game.sideWall.visible = false;
    this.active = true; this.D = DIFF[diff] || DIFF.normal;
    this.run = { diff, daily: !!daily, seed: daily ? DAILY_SEED : 12345, stage: 0, score: 0, crashes: 0, shots: 0, hits: 0, fixed: 0, blocked: 0, dmgBy: {}, t0: Game.time, best: 0, streak: 0, maxStreak: 0 };
    this.mem = SQUAD.map((d) => ({ d, ammo: d.mag, reloadT: 0, cd: { shift: 0, e: 0 }, ult: 0 }));
    this.member = 0;
    $('#hud').classList.add('hidden'); UI.only(); UI.hint('');
    document.body.classList.add('freeops');
    this.startStage(0);
  },
  stop() {
    if (!this.active) return;
    this.clearStage(); this.active = false; this.unlock();
    document.body.classList.remove('freeops');
    $('#freeIntro').classList.add('hidden');
    FX.u.hit = FX.u.tear = FX.u.inv = FX.u.pix = FX.u.slow = 0;
  },
  clearStage() {
    for (const b of this.bugs) b.remove(); this.bugs = [];
    for (const s of this.shots) s.remove(); this.shots = [];
    for (const w of this.walls) w.remove(); this.walls = [];
    this.covers = []; this.pops = []; this.hitDirs = []; this.marks = []; this.blasts = []; this.heals = []; for (const c of this.caps || []) Game.scene.remove(c.spr); this.caps = []; if (this.drone) { Game.scene.remove(this.drone.spr); this.drone = null; }
    if (this.barrier) { World.group.remove(this.barrier); this.barrier = null; }
    if (this.beacon) { World.group.remove(this.beacon); this.beacon = null; }
    if (this.bossObj) { this.bossObj.remove(); this.bossObj = null; }
    PFX.clear();
  },
  startStage(idx) {
    this.clearStage();
    const r = this.run; r.stage = idx;
    const def = STAGES[idx];
    RNG = mulberry32(r.seed + idx * 101 + r.crashes * 13);
    World.build(def, r.seed);
    this.S = { def, idx, zi: -1, phase: 'travel', wave: 0, waveQ: [], waveT: 0, fixed: 0, expected: 1, rb: this.D.rb, t: 0, slowT: 0, crashT: 0, help: r.crashes >= 2 };
    this.p = { pos: new THREE.Vector3(), vy: 0, yaw: 0, pitch: 0, hp: 100, crouch: false, crouchK: 0, iT: 0, dashT: 0, dashV: new THREE.Vector3(), hover: 0, bob: 0 };
    this.tracers = []; this.recoil = 0; this.charge = 0; this.mouse = false; this.dmgUp = 0; this.debugT = 0; this.flashT = 0;
    for (const m of this.mem) { m.ammo = m.d.mag; m.reloadT = 0; }
    if (def.boss) {
      this.zones = [{ c: new THREE.Vector3(0, 0, 0), R: 24 }];
      this.p.pos.set(0, 0, 19); this.p.yaw = 0;
      this.S.expected = 16;
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * 6.283 + 0.26, R = i % 2 ? 13 : 16.5, pos = new THREE.Vector3(Math.cos(a) * R, 0, Math.sin(a) * R);
        const g = new THREE.Group(), pc = World.piece(GEO.box, def.cover || 0x3a4a3a); pc.mesh.scale.set(2.8, 1.15, 0.6); pc.mesh.position.y = 0.575; g.add(pc.mesh);
        const yaw = -a + Math.PI / 2; g.rotation.y = yaw; World.addDecor(g, [pc], pos);
        this.covers.push({ pos, yaw, w: 2.8, h: 1.15, d: 0.6, hp: 120, max: 120, g, alive: true });
      }
    } else {
      this.halfW = FREE_HALFW[def.key] || 6;
      this.zones = FREE_ZONES.map((u) => ({ u, c: World.curve.getPointAt(u), R: def.key === 'subway' ? 13 : 15 }));
      const p0 = World.curve.getPointAt(0.03), t0 = World.curve.getTangentAt(0.03);
      this.p.pos.set(p0.x, 0, p0.z); this.p.yaw = Math.atan2(-t0.x, -t0.z);
      // 구역마다 엄폐물(낮은 벽) 배치
      for (const z of this.zones) this.placeCovers(z, def);
      let e = 0; for (let zi = 0; zi < 3; zi++) for (let w = 0; w < 2; w++) e += this.waveSize(idx, zi, w);
      this.S.expected = e;
    }
    this.makeBeacon();
    MUS.start(idx, r.seed); MUS.layer = 0;
    UI.banner(L('자유 작전', 'FREE OPS', 'フリー作戦', '自由作战') + ' · STAGE ' + def.id, def.name, 2.4);
    setTimeout(() => { if (this.active && this.S && this.S.def === def) Story.say(idx); }, 2600);
    Game.state = 'free';
    // 처음엔 조작 안내 (클릭하면 시작 — 마우스 잠금에 클릭이 필요해서)
    this.intro = true; this.showIntro();
  },
  waveSize(idx, zi, w) { return Math.round((4 + idx * 1.1 + zi * 0.8 + w * 1.5) * this.D.count); },
  showIntro() {
    const el = $('#freeIntro'); el.classList.remove('hidden');
    const sk = FREE_SKILLS.map((s, i) => `<div class="fi-m" style="--c:${SQUAD[i].color}"><b>${SQUAD[i].name}</b> <span>${SQUAD[i].label}</span><div>⇧ ${s.shift.name} · E ${s.e.name} · Q ${s.q.name}</div></div>`).join('');
    el.querySelector('.fi-sk').innerHTML = sk;
    this.unlock();
  },
  placeCovers(z, def) {
    const T = World.curve.getTangentAt(z.u), N = FV.a.set(-T.z, 0, T.x).normalize().clone();
    const spots = def.key === 'subway' ? [[-7, -1.7], [-1, 1.7], [5, -1.7], [10, 1.7]] : [[-7, -3], [-3, 3.5], [1, -2.5], [5, 3], [8, -4], [2, 0.5]];
    for (const [along, lat] of spots) {
      const pos = z.c.clone().addScaledVector(T, along).addScaledVector(N, lat);
      const narrow = def.key === 'subway';
      const yaw = Math.atan2(T.x, T.z) + Math.PI / 2 + (RNG() - 0.5) * (narrow ? 0.2 : 0.6) + (!narrow && RNG() < 0.3 ? Math.PI / 2 : 0);
      const w = narrow ? 1.7 : 2.4, h = 1.15, dep = 0.6;
      const g = new THREE.Group();
      const pc = World.piece(GEO.box, def.cover || 0x8a6a3a); pc.mesh.scale.set(w, h, dep); pc.mesh.position.y = h / 2;
      g.add(pc.mesh); g.rotation.y = yaw;
      World.addDecor(g, [pc], pos);
      this.covers.push({ pos, yaw, w, h, d: dep, hp: 100, max: 100, g, alive: true });
    }
  },
  makeBeacon() {
    const g = new THREE.Group();
    const col = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.6, 30, 12, 1, true), new THREE.MeshBasicMaterial({ color: 0xC6F432, transparent: true, opacity: 0.18, depthWrite: false, side: THREE.DoubleSide, fog: false }));
    col.position.y = 15; g.add(col);
    const ring = new THREE.Mesh(new THREE.RingGeometry(1.6, 2.2, 32), new THREE.MeshBasicMaterial({ color: 0xC6F432, transparent: true, opacity: 0.7, side: THREE.DoubleSide, fog: false }));
    ring.rotation.x = -Math.PI / 2; ring.position.y = 0.05; g.add(ring);
    this.beacon = g; World.group.add(g);
    this.nextZone();
  },
  nextZone() {
    const S = this.S; S.zi++;
    if (S.zi >= this.zones.length) return;
    const z = this.zones[S.zi];
    this.beacon.visible = true; this.beacon.position.set(z.c.x, 0, z.c.z);
    S.phase = 'travel';
    if (S.def.boss) this.enterZone(); // 보스: 바로 시작
  },
  enterZone() {
    const S = this.S, z = this.zones[S.zi];
    S.phase = 'fight'; S.wave = 0; this.beacon.visible = false;
    // 붉은 장벽 (구역 밖으로 못 나감)
    const m = new THREE.Mesh(new THREE.CylinderGeometry(z.R, z.R, 7, 48, 1, true), new THREE.MeshBasicMaterial({ color: 0xFF4D5E, transparent: true, opacity: 0.16, side: THREE.DoubleSide, depthWrite: false, fog: false, wireframe: true }));
    m.position.set(z.c.x, 3.5, z.c.z); this.barrier = m; World.group.add(m);
    SND.play('rush');
    if (S.def.boss) { this.bossObj = new FreeBoss(this); UI.banner('BOSS', S.def.name, 2.2); return; }
    UI.banner('', L(`구역 ${S.zi + 1}/3 — 버그 출현!`, `Zone ${S.zi + 1}/3 — bugs incoming!`, `エリア ${S.zi + 1}/3 — バグ出現!`, `区域 ${S.zi + 1}/3 — Bug来袭！`), 1.6);
    this.loadWave();
  },
  loadWave() {
    const S = this.S, def = S.def;
    const n = this.waveSize(S.idx, S.zi, S.wave);
    const mix = Object.entries(def.mix), tot = mix.reduce((a, [, w]) => a + w, 0);
    S.waveQ = [];
    for (let i = 0; i < n; i++) { let x = RNG() * tot, t = mix[0][0]; for (const [k, w] of mix) { if ((x -= w) <= 0) { t = k; break; } } S.waveQ.push(t); }
    S.waveT = 0.6;
    if (S.wave === 1 && RNG() < 0.7 + this.D.hotfix * 0.2) setTimeout(() => this.spawnHotfix(), 2500);
  },
  spawnPos(minD = 11, maxD = 16) {
    const z = this.zones[this.S.zi];
    for (let k = 0; k < 20; k++) {
      const a = RNG() * 6.283, d = rnd(minD, maxD);
      const p = new THREE.Vector3(this.p.pos.x + Math.cos(a) * d, 0, this.p.pos.z + Math.sin(a) * d);
      if (p.distanceTo(z.c) < z.R - 1.5 && this.inCorridor(p, -0.5)) return p;
    }
    return z.c.clone().add(new THREE.Vector3(rnd(-3, 3), 0, rnd(-3, 3)));
  },
  spawnBug(type, pos, opt) { const b = new FreeBug(this, type, pos || this.spawnPos(), opt); this.bugs.push(b); return b; },
  spawnHotfix() { if (!this.active || !this.S || this.S.phase !== 'fight') return; const p = this.spawnPos(5, 9); p.y = 1.6; this.spawnBug('hotfix', p, { trojan: this.D.trojan && RNG() < this.D.trojan }); },

  // ----- 이동 범위 -----
  nearestCurve(p) {
    let best = null, bd = 1e9;
    for (const s of World.samples) { const dx = s.x - p.x, dz = s.z - p.z, d = dx * dx + dz * dz; if (d < bd) { bd = d; best = s; } }
    return { s: best, d: Math.sqrt(bd) };
  },
  inCorridor(p, pad = 0) { if (!World.curve) return true; return this.nearestCurve(p).d < this.halfW + pad; },
  constrain(p) {
    const S = this.S;
    if (World.curve) {
      const n = this.nearestCurve(p);
      if (n.d > this.halfW) { FV.a.set(p.x - n.s.x, 0, p.z - n.s.z).normalize(); p.x = n.s.x + FV.a.x * this.halfW; p.z = n.s.z + FV.a.z * this.halfW; }
    }
    if (S.phase === 'fight' || S.def.boss) {
      const z = this.zones[S.zi], dx = p.x - z.c.x, dz = p.z - z.c.z, d = Math.hypot(dx, dz), R = z.R - 0.8;
      if (d > R) { p.x = z.c.x + dx / d * R; p.z = z.c.z + dz / d * R; }
    }
    // 엄폐물·방화벽과 겹치지 않게 밀어냄
    for (const c of this.allCovers()) this.pushOut(p, c, 0.45);
  },
  allCovers() { return this.covers.filter((c) => c.alive).concat(this.walls.filter((w) => w.alive)); },
  toLocal(c, p, out) { const dx = p.x - c.pos.x, dz = p.z - c.pos.z, cs = Math.cos(-c.yaw), sn = Math.sin(-c.yaw); out.set(dx * cs + dz * sn, p.y - (c.y0 || 0), -dx * sn + dz * cs); return out; },
  pushOut(p, c, r) {
    const l = this.toLocal(c, p, FV.b), hx = c.w / 2 + r, hz = c.d / 2 + r;
    if (Math.abs(l.x) >= hx || Math.abs(l.z) >= hz) return;
    const ox = hx - Math.abs(l.x), oz = hz - Math.abs(l.z);
    if (ox < oz) l.x = Math.sign(l.x || 1) * hx; else l.z = Math.sign(l.z || 1) * hz;
    const cs = Math.cos(c.yaw), sn = Math.sin(c.yaw);
    p.x = c.pos.x + l.x * cs + l.z * sn; p.z = c.pos.z - l.x * sn + l.z * cs;
  },
  // 선분이 엄폐물을 지나가는지 (에러 패킷·총알 막기)
  segHitsCover(a, b, c) {
    const la = this.toLocal(c, a, FV.c).clone(), lb = this.toLocal(c, b, FV.d);
    const lo = [-c.w / 2, 0, -c.d / 2], hi = [c.w / 2, c.h, c.d / 2];
    let t0 = 0, t1 = 1; const A = [la.x, la.y, la.z], B = [lb.x, lb.y, lb.z];
    for (let i = 0; i < 3; i++) {
      const d = B[i] - A[i];
      if (Math.abs(d) < 1e-9) { if (A[i] < lo[i] || A[i] > hi[i]) return -1; continue; }
      let ta = (lo[i] - A[i]) / d, tb = (hi[i] - A[i]) / d; if (ta > tb) [ta, tb] = [tb, ta];
      t0 = Math.max(t0, ta); t1 = Math.min(t1, tb); if (t0 > t1) return -1;
    }
    return t0;
  },
  nearCover() { for (const c of this.allCovers()) { const l = this.toLocal(c, this.p.pos, FV.b); if (Math.abs(l.x) < c.w / 2 + 1.4 && Math.abs(l.z) < c.d / 2 + 1.4) return c; } return null; },

  // ----- 분대원 · 무기 -----
  cur() { return this.mem[this.member]; },
  select(i) {
    if (i === this.member || i < 0 || i >= SQUAD.length) return;
    if (this.charge > 0) this.charge = 0;
    this.member = i; SND.play('click');
    UI.toast(`${SQUAD[i].name} · ${SQUAD[i].label}`);
  },
  cycle(dir) { const N = SQUAD.length; this.select((this.member + dir + N) % N); },
  reload() { const m = this.cur(); if (m.reloadT > 0 || m.ammo >= m.d.mag || this.debugT > 0) return; m.reloadT = m.d.reload * (this.p.crouch ? 0.6 : 1); SND.play('reload'); },
  toggleCrouch() { this.p.crouch = !this.p.crouch; SND.play(this.p.crouch ? 'block' : 'move'); },
  eye() { return lerp(1.62, 0.92, this.p.crouchK) + this.p.pos.y; },
  ray() { // 카메라 앞 방향
    const cp = Math.cos(this.p.pitch);
    return FV.e.set(-Math.sin(this.p.yaw) * cp, Math.sin(this.p.pitch), -Math.cos(this.p.yaw) * cp).normalize();
  },
  release() {
    const m = this.cur();
    if (m.d.kind === 'sniper' && this.charge > 0.05 && Game.state === 'free') this.fireSniper(this.charge);
    this.charge = 0;
  },
  updateWeapon(dt) {
    const m = this.cur();
    for (const x of this.mem) { if (x.reloadT > 0) { x.reloadT -= dt; if (x.reloadT <= 0) { x.reloadT = 0; x.ammo = x.d.mag; } } }
    this.fireCd = Math.max(0, (this.fireCd || 0) - dt);
    if (m.reloadT > 0 || !this.mouse || this.intro) return;
    if (m.ammo <= 0 && this.debugT <= 0) { this.reload(); return; }
    if (m.d.kind === 'sniper') { this.charge = Math.min(1, this.charge + dt / m.d.charge); if (this.charge >= 1) { this.fireSniper(1); this.charge = 0; } return; }
    if (this.fireCd > 0) return;
    if (m.d.kind === 'rifle') { this.fireCd = 1 / m.d.rate; this.fireRay(m, m.d.dmg, 0.012, 'rifle'); SND.play('rifle'); }
    else if (m.d.kind === 'launcher') { this.fireCd = 1 / m.d.rate; this.fireLauncher(m); }
    else { this.fireCd = 1 / m.d.rate; for (let i = 0; i < m.d.pellets; i++) this.fireRay(m, m.d.dmg, 0.065, 'shotgun', i > 0); SND.play('spread'); }
    if (this.debugT <= 0) m.ammo--;
    this.recoil = 1; this.run.shots += m.d.kind === 'shotgun' ? m.d.pellets : 1;
  },
  fireSniper(k) {
    const m = this.cur(); if (m.reloadT > 0 || (m.ammo <= 0 && this.debugT <= 0)) return;
    this.fireRay(m, m.d.dmg * (0.35 + 0.65 * k), 0.002, 'sniper', false, true);
    if (this.debugT <= 0) m.ammo--;
    SND.play('snipe'); this.recoil = 1.6; this.run.shots++;
    if (k >= 1) this.pop(Game.W / 2, Game.H / 2 - 60, L('풀차지!', 'Full charge!', 'フルチャージ!', '满蓄力！'), '#6fe7ff');
  },
  // 에이다: 조준한 첫 지점(버그·엄폐물·바닥)에서 캡슐이 터짐
  aimPoint(maxT = 40) {
    const o = Game.camera.position, dir = this.ray().clone();
    let t = maxT; if (dir.y < -0.02) t = Math.min(t, -o.y / dir.y);
    const hits = this.rayTargets(o, dir, maxT); if (hits.length) t = Math.min(t, hits[0].t);
    for (const c of this.allCovers()) { const k = this.segHitsCover(o, FV.b.copy(o).addScaledVector(dir, maxT), c); if (k >= 0) t = Math.min(t, k * maxT); }
    return o.clone().addScaledVector(dir, t);
  },
  capsule(from, to, dur) { // 날아가는 테스트 캡슐 (그림만)
    if (!TEX.capsule) return;
    const spr = new THREE.Sprite(new THREE.SpriteMaterial({ map: TEX.capsule, transparent: true, fog: false, depthWrite: false })); spr.scale.setScalar(0.7); Game.scene.add(spr);
    (this.caps = this.caps || []).push({ a: from.clone(), b: to.clone(), t: 0, dur, spr });
  },
  updateCaps(dt) {
    this.caps = (this.caps || []).filter((c) => { c.t += dt; const k = Math.min(1, c.t / c.dur); c.spr.position.lerpVectors(c.a, c.b, k); if (k >= 1) { Game.scene.remove(c.spr); c.spr.material.dispose(); return false; } return true; });
  },
  blast(at, R, dmg, kind = 'launcher') {
    let any = false;
    for (const b of this.bugs.slice()) if (b.alive && b.hittable() && b.hitPos().distanceTo(at) < R + b.radius()) { if (this.hitTarget(b, dmg, false, kind, FV.d.subVectors(b.pos, at).normalize().clone())) any = true; }
    for (const s of this.shots) if (s.alive && s.kind === 'missile' && s.pos.distanceTo(at) < R) { this.hitTarget(s, dmg, false, kind); any = true; }
    if (this.bossObj) for (const n of this.bossObj.nodes) if (n.alive && n.pos.distanceTo(at) < R + 1.1) { this.bossObj.hit(n, dmg * 0.6); any = true; }
    this.marks.push({ pos: at.clone(), t: 0, dur: 0.45, kind: 'blast', R: 0 });
    PFX.spark(at, [1, 0.37, 0.64], 12, 6);
    return any;
  },
  fireLauncher(m) {
    const at = this.aimPoint();
    this.tracers.push({ a: Game.camera.position.clone().add(FV.d.set(0, -0.3, 0)), b: at.clone(), t: 0, c: m.d.color, w: 5 });
    this.capsule(Game.camera.position.clone().add(FV.d.set(0, -0.3, 0)), at, 0.12);
    if (this.blast(at, 2.4, m.d.dmg)) { this.run.hits++; this.hitMark = 0.15; }
    SND.play('boom'); Game.shake = Math.max(Game.shake || 0, 0.12);
  },
  // 히트스캔: 카메라에서 조준 방향으로
  fireRay(m, dmg, spread, kind, silent, pierce) {
    const o = FV.a.copy(Game.camera.position), dir = this.ray().clone();
    dir.x += (Math.random() - 0.5) * spread * 2; dir.y += (Math.random() - 0.5) * spread * 2; dir.z += (Math.random() - 0.5) * spread * 2; dir.normalize();
    const hits = this.rayTargets(o, dir, 70);
    let block = 70;
    if (!pierce) for (const c of this.allCovers()) { const t = this.segHitsCover(o, FV.b.copy(o).addScaledVector(dir, 70), c); if (t >= 0) block = Math.min(block, t * 70); }
    const end = FV.c.copy(o).addScaledVector(dir, hits.length && !pierce ? Math.min(hits[0].t, block) : block);
    this.tracers.push({ a: o.clone().addScaledVector(dir, 1.2).add(FV.d.set(0, -0.25, 0)), b: end.clone(), t: 0, c: m.d.color, w: kind === 'sniper' ? 4 : 2 });
    let any = false;
    for (const h of hits) {
      if (!pierce && h.t > block) break;
      if (this.hitTarget(h.o, dmg * (h.crit ? 2 : 1), h.crit, kind, dir)) any = true;
      if (!pierce) break;
    }
    if (any) { this.run.hits++; this.hitMark = 0.15; }
  },
  rayTargets(o, dir, maxT) {
    const out = [];
    const test = (obj, pos, r) => {
      FV.d.subVectors(pos, o); const t = FV.d.dot(dir); if (t < 0 || t > maxT) return;
      const perp = Math.sqrt(Math.max(0, FV.d.lengthSq() - t * t)); if (perp > r) return;
      out.push({ o: obj, t, crit: perp < r * 0.32 });
    };
    for (const b of this.bugs) if (b.alive && b.hittable()) test(b, b.hitPos(), b.radius());
    for (const s of this.shots) if (s.alive && s.kind === 'missile') test(s, s.pos, 0.7);
    if (this.bossObj) for (const n of this.bossObj.nodes) if (n.alive) test(n, n.pos, 1.1);
    return out.sort((a, b) => a.t - b.t);
  },
  hitTarget(o, dmg, crit, kind, dir) {
    if (o instanceof FreeShot) { o.hp -= dmg; if (o.hp <= 0) { o.kill(true); this.pop2(o.pos, L('격추!', 'Shot down!', '撃墜!', '击落！'), '#d9c2ff'); SND.play('deflect'); } return true; }
    if (this.bossObj && o.isNode) return this.bossObj.hit(o, dmg * (kind === 'sniper' ? 2 : 1) * (this.debugT > 0 ? 1.5 : 1));
    return o.damage(dmg, crit, kind, dir);
  },
  pop(x, y, t, c) { this.pops.push({ x, y, t, c, a: 0 }); },
  pop2(pos, t, c) { const s = this.project(pos); if (s) this.pop(s.x, s.y - 30, t, c); },
  project(pos) { FV.d.copy(pos).project(Game.camera); if (FV.d.z > 1) return null; return { x: (FV.d.x + 1) / 2 * Game.W, y: (1 - FV.d.y) / 2 * Game.H }; },

  // ----- 버그를 고쳤을 때 -----
  onFix(b) {
    const r = this.run, S = this.S;
    r.fixed++; S.fixed++; r.streak++; r.maxStreak = Math.max(r.maxStreak, r.streak);
    const mult = Math.min(2, 1 + 0.1 * r.streak);
    r.score += Math.round((b.def.pts || 100) * mult * (this.debugT > 0 ? 1.2 : 1));
    const m = this.cur(); m.ult = Math.min(100, m.ult + 7 + (b.def.pts || 100) / 50);
    const fk = ['rifle', 'shotgun', 'sniper', 'launcher'].includes(b.lastKind) ? b.lastKind : null; // 페어 프로그래밍 (분대원 바꿔 이어서 고치기)
    if (fk && this.pairK && this.pairK !== fk && S.t - this.pairT < 1.5) {
      r.pair = (r.pair || 0) + 1; r.score += 200; this.p.hp = Math.min(100, this.p.hp + 3); this.pairK = null;
      this.pop(Game.W / 2, Game.H * 0.3, L('페어 프로그래밍! +200', 'PAIR PROGRAMMING! +200', 'ペアプロ! +200', '结对编程！+200'), '#FF9EC8'); SND.play('combo');
    } else if (fk) { this.pairK = fk; this.pairT = S.t; }
    PFX.fix(b.pos, [1, 0.3, 0.37]); SND.play('hit', r.streak);
    World.colorizeNear(b.pos, 4);
    MUS.layer = Math.min(4, Math.floor(S.fixed / Math.max(1, S.expected) * 4 + 0.0001));
  },
  // ----- 플레이어 피해 -----
  hurt(dmg, from, kind = 'rush') {
    const p = this.p; if (p.iT > 0 || this.S.phase === 'clear') return;
    this.run.dmgBy[kind] = (this.run.dmgBy[kind] || 0) + dmg;
    const k = this.S.help ? 0.75 : 1;
    p.hp = Math.max(0, p.hp - dmg * this.D.dmg * k * 0.7); // 자유 작전은 직접 피할 수 있어서 레일보다 조금 낮게
    this.run.streak = 0;
    FX.u.hit = 1; Game.shake = Math.max(Game.shake || 0, 0.25); SND.play('glitch');
    if (Math.random() < 0.35 && !settings.reduceFlash) { FX.u.tear = 0.6; setTimeout(() => { FX.u.tear = 0; }, 300); }
    if (from) { FV.d.subVectors(from, p.pos); this.hitDirs.push({ ang: Math.atan2(FV.d.x, FV.d.z), t: 0 }); }
    if (p.hp <= 0) this.crash();
  },
  crash() {
    const S = this.S; if (S.phase === 'crash') return;
    S.phase = 'crash'; this.run.crashes++; this.unlock();
    MUS.crashStop(); SND.play('crash');
    setTimeout(() => {
      if (!this.active) return; Game.state = 'paused'; UI.hint('');
      $('#crashMsg').textContent = L('안정성이 0%가 되었습니다. 이 스테이지를 다시 빌드할까요?', 'Stability hit 0%. Rebuild this stage?', '安定性が0%になった。このステージを再ビルドする?', '稳定性降到0%。要重新构建本关吗？');
      $('#crashCode').textContent = `ERR_TOO_MANY_BUGS  (0xF0${this.S.idx + 1}${this.run.crashes % 10})\nat freeOps.stage${this.S.idx + 1}.${this.S.def.key}()\nat patchSquad.patch(stability = 0%)\n\n` +
        L('> 이 스테이지를 처음부터 다시 빌드합니다.', '> Rebuilding this stage from the start.', '> このステージを最初から再ビルドします。', '> 从头重新构建本关。') +
        (this.run.crashes >= 2 ? L('\n> 도움 모드 ON: 받는 피해 -25% · 버그 속도 -20%', '\n> Assist mode ON: -25% damage taken · bugs -20% speed', '\n> アシストモード ON: 被ダメージ -25% · バグ速度 -20%', '\n> 辅助模式开启：受到伤害 -25% · Bug速度 -20%') : '');
      UI.only('#scrCrash');
    }, 1200);
  },
  rebuild() { this.startStage(this.run.stage); },
  stageClear() {
    const S = this.S; S.phase = 'clear';
    for (const b of this.bugs) b.remove(); this.bugs = [];
    for (const s of this.shots) s.remove(); this.shots = [];
    World.fillAll(); MUS.layer = 4; SND.play('clear');
    const bonus = Math.round(this.p.hp * 20); this.run.score += bonus;
    UI.banner('PATCH APPLIED', S.def.name, 2.6, true);
    setTimeout(() => {
      if (!this.active) return;
      if (S.def.boss) { this.unlock(); Game.state = 'paused'; Story.ending(() => this.showResult()); return; }
      this.unlock(); Game.state = 'paused';
      $('#clrTitle').textContent = L(`패치 완료 ${S.idx + 1}/${STAGES.length}`, `Patch applied ${S.idx + 1}/${STAGES.length}`, `パッチ完了 ${S.idx + 1}/${STAGES.length}`, `补丁完成 ${S.idx + 1}/${STAGES.length}`);
      const acc = this.run.shots ? this.run.hits / this.run.shots : 0;
      $('#clrStats').innerHTML = [[L('스테이지', 'Stage', 'ステージ', '关卡'), S.def.name], [L('고친 버그', 'Bugs fixed', '修復したバグ', '修复的Bug'), S.fixed], [L('남은 안정성', 'Stability left', '残り安定性', '剩余稳定性'), Math.round(this.p.hp) + '% (+' + bonus.toLocaleString() + ')'], [L('명중률', 'Accuracy', '命中率', '命中率'), Math.round(acc * 100) + '%']]
        .map(([k, v]) => `<span class="k">${k}</span><span class="v">${v}</span>`).join('') + `<span class="k full">${L('총점', 'Total', '合計', '总分')}</span><span class="v full">${this.run.score.toLocaleString()}</span>`;
      $('#btnNext').textContent = STAGES[S.idx + 1] && STAGES[S.idx + 1].boss ? L('중간 보스 "메인 루프" ▶', 'Mid-boss "Main Loop" ▶', '中ボス「メインループ」 ▶', '中Boss“主循环” ▶') : L('다음 스테이지 ▶', 'Next stage ▶', '次のステージ ▶', '下一关 ▶');
      UI.only('#scrClear');
    }, 2700);
  },
  nextStage() { const n = this.run.stage + 1; Story.beforeStage(n, () => this.startStage(n)); },
  showResult() {
    const r = this.run, acc = r.shots ? r.hits / r.shots : 0;
    const gi = r.crashes === 0 && acc >= 0.45 ? 0 : r.crashes <= 2 ? 1 : 2;
    const grade = GRADES[gi];
    const rec = Store.get('records', {}); const best = Math.max(rec.freeBest || 0, r.score); rec.freeBest = best; Store.set('records', rec);
    $('#resMode').textContent = L('자유 작전', 'Free Ops', 'フリー作戦', '自由作战') + ' · ' + L('난이도 ', 'Difficulty ', '難易度 ', '难度 ') + this.D.name;
    $('#resGrade').textContent = grade;
    $('#resStats').innerHTML = [[L('총점', 'Total', '合計', '总分'), r.score.toLocaleString()], [L('최고 점수', 'Best score', '最高スコア', '最高分'), best.toLocaleString()], [L('고친 버그', 'Bugs fixed', '修復したバグ', '修复的Bug'), r.fixed], [L('명중률', 'Accuracy', '命中率', '命中率'), Math.round(acc * 100) + '%'], [L('크래시', 'Crashes', 'クラッシュ', '崩溃次数'), r.crashes], [L('최대 연속 패치', 'Best patch streak', '最大連続パッチ', '最高连续补丁'), r.maxStreak]]
      .map(([k, v]) => `<span class="k">${k}</span><span class="v">${v}</span>`).join('');
    $('#resNote').textContent = `🐛 Patch Squad · ${L('자유 작전', 'Free Ops', 'フリー作戦', '自由作战')} — ${grade}\n• ${L(`버그 ${r.fixed}마리를 직접 걸어 다니며 고침`, `Walked the broken world and fixed ${r.fixed} bugs`, `壊れた世界を歩き回り、バグ${r.fixed}匹を修正`, `走遍崩坏的世界，修复了${r.fixed}只Bug`)}\n• ${L(`최대 연속 패치 ${r.maxStreak}회`, `Best patch streak: ${r.maxStreak}`, `最大連続パッチ ${r.maxStreak}回`, `最高连续补丁 ${r.maxStreak}次`)}\n${L('점수', 'Score', 'スコア', '分数')} ${r.score.toLocaleString()} · #PatchSquad`;
    $('#resNoteTa').value = $('#resNote').textContent; $('#resChal').textContent = '';
    $('#btnCopy').textContent = L('패치 노트 복사', 'Copy patch notes', 'パッチノートをコピー', '复制补丁说明');
    Game.state = 'paused'; UI.only('#scrResult');
  },
  pause() { if (Game.state !== 'free') return; Game.state = 'paused'; this.mouse = false; this.keys = {}; if (SND.ctx) SND.ctx.suspend(); UI.only('#scrPause'); },
  resume() { UI.only(); Game.state = 'free'; Game.last = performance.now(); if (SND.ctx) SND.ctx.resume(); this.lock(); },

  // ----- 스킬 -----
  skill(slot) {
    const i = this.member, m = this.cur(), S = this.S;
    if (S.phase === 'crash' || S.phase === 'clear') return;
    if (slot === 'q') {
      if (m.ult < 100) { SND.play('jam'); this.pop(Game.W / 2, Game.H * 0.62, L('궁극기 충전 중', 'Ultimate charging', 'アルティメット充填中', '终极技能充能中') + ` ${Math.floor(m.ult)}%`, '#aab2a3'); return; }
      m.ult = 0;
    } else {
      if (m.cd[slot] > 0) { SND.play('jam'); return; }
      m.cd[slot] = FREE_SKILLS[i][slot].cd;
    }
    const name = FREE_SKILLS[i][slot].name; UI.toast(name);
    const p = this.p, fw = this.ray().clone(); fw.y = 0; fw.normalize();
    if (i === 0) {
      if (slot === 'shift') { p.dashV.copy(fw).multiplyScalar(42); p.dashT = 0.16; p.iT = 0.35; SND.play('tele'); }
      if (slot === 'e') { // 조준한 바닥 지점
        const dir = this.ray(), o = Game.camera.position; let t = 18; if (dir.y < -0.05) t = Math.min(18, -o.y / dir.y);
        const at = o.clone().addScaledVector(dir, t); at.y = 0;
        for (const b of this.bugs) if (b.alive && b.pos.distanceTo(at) < 5.5) b.freezeT = 2.5;
        this.marks.push({ pos: at, t: 0, dur: 0.6, kind: 'bp' }); PFX.spark(at, [0.78, 0.96, 0.2], 14, 6); SND.play('aim');
      }
      if (slot === 'q') { this.debugT = 6; SND.play('unlock'); UI.banner('', 'DEBUG MODE', 1.4); }
    } else if (i === 1) {
      if (slot === 'shift') { p.dashV.copy(fw).multiplyScalar(24); p.dashT = 0.38; p.iT = 0.3; this.rushHit = new Set(); SND.play('rush'); }
      if (slot === 'e') { const at = p.pos.clone().addScaledVector(fw, 2.4); this.walls.push(new FreeWall(at, Math.atan2(fw.x, fw.z))); SND.play('block'); }
      if (slot === 'q') {
        SND.play('boom'); Game.shake = 0.6; FX.u.hit = 0.4;
        this.marks.push({ pos: p.pos.clone(), t: 0, dur: 0.7, kind: 'wave', R: 10 });
        for (const b of this.bugs.slice()) if (b.alive && b.role !== 'item' && b.pos.distanceTo(p.pos) < 10) { b.noSplit = true; b.damage(14, false, 'shotgun', FV.d.subVectors(b.pos, p.pos).normalize().clone()); if (b.alive) b.push(FV.d.clone(), 7); }
        for (const s of this.shots) if (s.alive && s.pos.distanceTo(p.pos) < 10) s.kill(true);
      }
    } else if (i === 2) {
      if (slot === 'shift') { p.vy = 11; p.hover = 1.3; SND.play('move'); }
      if (slot === 'e') {
        let n = 0; for (const b of this.bugs) if (b.alive && b.role !== 'item' && b.pos.distanceTo(p.pos) < 32) { b.markT = 6; n++; }
        this.marks.push({ pos: p.pos.clone(), t: 0, dur: 0.9, kind: 'scan', R: 32 }); SND.play('aim');
        this.pop(Game.W / 2, Game.H * 0.36, L(`${n}마리 표시`, `${n} marked`, `${n}匹マーク`, `已标记${n}只`), '#6fe7ff');
      }
      if (slot === 'q') {
        SND.play('snipe'); Game.shake = 0.4;
        let n = 0;
        for (const b of this.bugs.slice()) if (b.alive && b.role !== 'item' && (b.markT > 0 || b.onScreen)) { this.tracers.push({ a: Game.camera.position.clone().add(FV.d.set(0, -0.3, 0)), b: b.hitPos().clone(), t: 0, c: '#6fe7ff', w: 5 }); b.damage(b.markT > 0 ? 40 : 18, true, 'sniper', null); n++; }
        if (this.bossObj) for (const nd of this.bossObj.nodes) if (nd.alive) { this.bossObj.hit(nd, 12); }
        UI.banner('', 'GARBAGE COLLECTED ×' + n, 1.4);
      }
    } else {
      if (slot === 'shift') { p.dashV.copy(fw).multiplyScalar(26); p.dashT = 0.3; p.iT = 0.25; this.heals.push({ pos: p.pos.clone(), t: 5 }); SND.play('rush'); }
      if (slot === 'e') {
        if (this.drone) Game.scene.remove(this.drone.spr);
        const spr = new THREE.Sprite(new THREE.SpriteMaterial({ map: TEX.drone || TEX.glow, color: TEX.drone ? 0xffffff : 0xFF5FA2, transparent: true, fog: false }));
        spr.scale.setScalar(0.9); Game.scene.add(spr);
        this.drone = { t: 8, fireT: 0.3, spr, pos: p.pos.clone().add(FV.d.set(0, 2.4, 0)) }; SND.play('unlock');
      }
      if (slot === 'q') {
        const at = this.aimPoint(34); at.y = 0;
        for (let k = 0; k < 10; k++) { const b = { at: at.clone().add(FV.d.set(rnd(-4.5, 4.5), 0.6, rnd(-4.5, 4.5))), t: 0.25 + k * 0.16 }; this.blasts.push(b); this.capsule(b.at.clone().add(FV.d.set(rnd(-1, 1), 9, rnd(-1, 1))), b.at, b.t); }
        this.marks.push({ pos: at, t: 0, dur: 1.9, kind: 'rain', R: 6 }); SND.play('aim'); UI.banner('', 'REGRESSION TEST', 1.4);
      }
    }
  },
  updateAda(dt) {
    const p = this.p;
    if (this.member === 3 && p.dashT > 0 && Math.random() < 0.5) this.heals.push({ pos: p.pos.clone(), t: 5 });
    this.heals = this.heals.filter((h) => (h.t -= dt) > 0);
    if (this.heals.some((h) => Math.hypot(h.pos.x - p.pos.x, h.pos.z - p.pos.z) < 2.2)) p.hp = Math.min(100, p.hp + 6 * dt);
    this.blasts = this.blasts.filter((b) => { b.t -= dt; if (b.t > 0) return true; this.blast(b.at, 2.6, 6, 'launcher'); SND.play('boom'); return false; });
    const d = this.drone; if (!d) return;
    d.t -= dt; d.fireT -= dt;
    const want = FV.d.copy(p.pos).add(FV.a.set(Math.cos(Game.time * 1.3) * 1.6, 2.4, Math.sin(Game.time * 1.3) * 1.6));
    d.pos.lerp(want, Math.min(1, dt * 4)); d.spr.position.copy(d.pos);
    if (d.fireT <= 0) {
      d.fireT = 0.45;
      let best = null, bd = 22; for (const b of this.bugs) if (b.alive && b.role !== 'item' && b.hittable()) { const k = b.pos.distanceTo(d.pos); if (k < bd) { bd = k; best = b; } }
      if (best) { this.tracers.push({ a: d.pos.clone(), b: best.hitPos().clone(), t: 0, c: '#FF5FA2', w: 2 }); best.damage(1.6, false, 'drone', null); SND.play('tick'); }
    }
    if (d.t <= 0) { Game.scene.remove(d.spr); d.spr.material.dispose(); this.drone = null; }
  },
  rollback() {
    const S = this.S; if (S.phase !== 'fight') return;
    if (S.rb <= 0) { SND.play('jam'); UI.toast(L('이번 스테이지 롤백을 다 썼어요', 'No Rollbacks left this stage', 'このステージのロールバックは使い切った', '本关回滚次数已用完')); return; }
    S.rb--; S.slowT = 3; SND.play('rollback'); FX.u.slow = 1;
    for (const s of this.shots) if (s.alive && s.kind !== 'missile') s.kill(false);
    this.p.hp = Math.min(100, this.p.hp + 10);
    UI.banner('', L('롤백', 'ROLLBACK', 'ロールバック', '回滚') + ` (${S.rb})`, 1.2);
  },

  // ----- 매 프레임 -----
  frame(dt) {
    const paused = Game.state !== 'free';
    if (!paused) this.update(dt);
    PFX.update(paused ? 0 : dt);
    Game.camera.position.set(this.p.pos.x, this.eye(), this.p.pos.z);
    const sh = (Game.shake || 0) * (settings.reduceFlash ? 0.4 : 1);
    Game.camera.rotation.set(this.p.pitch + (Math.random() - 0.5) * sh * 0.05, this.p.yaw + (Math.random() - 0.5) * sh * 0.05, 0, 'YXZ');
    Game.camera.updateMatrixWorld();
    FX.render(Game.scene, Game.camera, Game.time);
    this.draw2D(paused ? 0 : dt);
    UI.tick(paused ? 0 : dt);
  },
  update(dt) {
    const S = this.S, p = this.p;
    if (this.intro) { World.update(dt, 0); return; }
    if (S.phase === 'crash') { FX.u.hit = Math.max(FX.u.hit, 0.6); World.update(dt, S.fixed / Math.max(1, S.expected)); return; }
    S.t += dt;
    Game.shake = Math.max(0, (Game.shake || 0) - dt * 2);
    FX.u.hit = Math.max(0, FX.u.hit - dt * 2.5);
    if (S.slowT > 0) { S.slowT -= dt; if (S.slowT <= 0) FX.u.slow = 0; }
    const ws = S.slowT > 0 ? 0.3 : 1;
    this.debugT = Math.max(0, this.debugT - dt);
    for (const m of this.mem) { m.cd.shift = Math.max(0, m.cd.shift - dt); m.cd.e = Math.max(0, m.cd.e - dt); m.ult = Math.min(100, m.ult + dt * 0.8); }
    // 이동
    const k = this.keys, fw = FV.a.set(-Math.sin(p.yaw), 0, -Math.cos(p.yaw)), rt = FV.b.set(Math.cos(p.yaw), 0, -Math.sin(p.yaw));
    const mv = FV.c.set(0, 0, 0);
    if (k.KeyW) mv.add(fw); if (k.KeyS) mv.sub(fw); if (k.KeyD) mv.add(rt); if (k.KeyA) mv.sub(rt);
    p.crouchK += ((p.crouch ? 1 : 0) - p.crouchK) * Math.min(1, dt * 12);
    const spd = p.crouch ? 3.2 : 7;
    if (mv.lengthSq() > 0) { mv.normalize(); p.pos.addScaledVector(mv, spd * dt); p.bob += dt * (p.crouch ? 6 : 10); }
    if (p.dashT > 0) {
      p.dashT -= dt; p.pos.addScaledVector(p.dashV, dt);
      if (this.member === 1 && this.rushHit) for (const b of this.bugs) if (b.alive && b.role !== 'item' && !this.rushHit.has(b) && b.pos.distanceTo(p.pos) < 2.4) { this.rushHit.add(b); b.damage(3, false, 'shotgun', p.dashV.clone().normalize()); if (b.alive) b.push(p.dashV.clone().normalize(), 9); }
    }
    // 핀 점프 · 중력
    if (p.pos.y > 0 || p.vy !== 0) {
      const g = p.hover > 0 && p.vy < 0 ? 4 : 26; if (p.vy < 0 && p.hover > 0) p.hover -= dt;
      p.vy -= g * dt; p.pos.y += p.vy * dt; if (p.pos.y <= 0) { p.pos.y = 0; p.vy = 0; p.hover = 0; }
    }
    this.constrain(p.pos);
    p.iT = Math.max(0, p.iT - dt);
    this.recoil = Math.max(0, this.recoil - dt * 8);
    this.hitMark = Math.max(0, (this.hitMark || 0) - dt);
    this.updateWeapon(dt);
    this.updateAda(dt * ws);
    this.updateCaps(dt * ws);
    // 구역 진행
    if (S.phase === 'travel' && !S.def.boss) {
      const z = this.zones[S.zi];
      if (z && Math.hypot(p.pos.x - z.c.x, p.pos.z - z.c.z) < 6) this.enterZone();
    } else if (S.phase === 'fight' && !S.def.boss) {
      if (S.waveQ.length) {
        S.waveT -= dt;
        const on = this.bugs.filter((b) => b.alive && b.role !== 'item').length;
        if (S.waveT <= 0 && on < this.D.maxOn) { this.spawnBug(S.waveQ.shift()); S.waveT = rnd(0.45, 1.0); }
      } else if (!this.bugs.some((b) => b.alive && b.role !== 'item') && !this.shots.some((s) => s.alive)) {
        if (S.wave === 0) { S.wave = 1; this.loadWave(); UI.toast(L('웨이브 2/2', 'Wave 2/2', 'ウェーブ 2/2', '波次 2/2')); }
        else if (S.zi < 2) {
          S.phase = 'travel'; if (this.barrier) { World.group.remove(this.barrier); this.barrier = null; }
          SND.play('unlock'); UI.banner('', L('구역 정화! 다음 구역으로 이동', 'Zone cleared! Move to the next zone', 'エリア浄化! 次のエリアへ', '区域已净化！前往下一个区域'), 1.8);
          this.nextZone();
        } else this.stageClear();
      }
    }
    if (this.bossObj) this.bossObj.update(dt * ws);
    for (const b of this.bugs) if (b.alive) b.update(dt * ws, dt);
    this.bugs = this.bugs.filter((b) => b.alive);
    for (const s of this.shots) if (s.alive) s.update(dt * ws);
    this.shots = this.shots.filter((s) => s.alive);
    for (const w of this.walls) if (w.alive) w.update(dt);
    this.walls = this.walls.filter((w) => w.alive);
    for (const c of this.covers) if (c.alive && c.hp <= 0) { c.alive = false; c.g.visible = false; PFX.spark(c.pos, [0.8, 0.6, 0.4], 14, 5); SND.play('crash'); }
    World.update(dt, Math.min(1, S.fixed / Math.max(1, S.expected)));
    if (this.beacon) { this.beacon.rotation.y += dt; this.beacon.children[1].scale.setScalar(1 + Math.sin(Game.time * 4) * 0.08); }
    if (this.barrier) this.barrier.material.opacity = 0.12 + Math.sin(Game.time * 6) * 0.05;
  },

  // ----- 화면 (2D) -----
  draw2D(dt) {
    const g = Game.g2, W = Game.W, H = Game.H, S = this.S, p = this.p, mono = 'ui-monospace,Consolas,monospace';
    g.clearRect(0, 0, W, H);
    if (!S) return;
    // 3D 선 (총알 궤적)
    this.tracers = (this.tracers || []).filter((t) => (t.t += dt) < 0.08);
    for (const t of this.tracers) { const a = this.project(t.a), b = this.project(t.b); if (!a || !b) continue; g.globalAlpha = 1 - t.t / 0.08; g.strokeStyle = t.c; g.lineWidth = t.w; g.beginPath(); g.moveTo(a.x, a.y); g.lineTo(b.x, b.y); g.stroke(); }
    g.globalAlpha = 1;
    // 스킬 표시 (원·파동)
    for (const m of this.marks) {
      m.t += dt; const k = m.t / m.dur; const c = this.project(m.pos); if (!c) continue;
      g.globalAlpha = Math.max(0, 1 - k);
      g.strokeStyle = m.kind === 'scan' ? '#6fe7ff' : m.kind === 'wave' ? '#FFD34D' : m.kind === 'blast' || m.kind === 'rain' ? '#FF5FA2' : '#C6F432'; g.lineWidth = 4;
      const big = m.R && m.kind !== 'rain';
      g.beginPath(); g.ellipse(c.x, c.y, 40 + k * (big ? 500 : 120), 12 + k * (big ? 140 : 36), 0, 0, 6.283); g.stroke();
    }
    this.marks = this.marks.filter((m) => m.t < m.dur); g.globalAlpha = 1;
    for (const h of this.heals || []) { const c = this.project(h.pos); if (!c) continue; g.globalAlpha = Math.min(1, h.t) * 0.7; g.fillStyle = 'rgba(198,244,50,.25)'; g.strokeStyle = '#C6F432'; g.lineWidth = 2; g.beginPath(); g.ellipse(c.x, c.y, 46, 14, 0, 0, 6.283); g.fill(); g.stroke(); }
    g.globalAlpha = 1;
    // 버그 표시: 체력, 예고, 표시(마크), 정지
    const fwd = this.ray();
    for (const b of this.bugs) {
      if (!b.alive) continue;
      const s = this.project(b.hitPos()); b.onScreen = !!s && s.x > -50 && s.x < W + 50 && s.y > -50 && s.y < H + 50;
      FV.d.subVectors(b.pos, Game.camera.position); const dist = FV.d.length();
      if (!s) { if (b.role !== 'item' && dist < 14) this.edgeArrow(g, b.pos, b.markT > 0 ? '#6fe7ff' : `rgb(${WARN()})`); continue; }
      const r = Math.max(10, b.radius() / Math.max(0.5, dist) * H * 0.9);
      if (b.role !== 'item' && b.hp < b.maxHp) { const w = Math.max(26, r * 1.4); g.fillStyle = '#000'; g.fillRect(s.x - w / 2 - 1, s.y - r - 13, w + 2, 6); g.fillStyle = '#FF4D5E'; g.fillRect(s.x - w / 2, s.y - r - 12, w * b.hp / b.maxHp, 4); }
      if (b.markT > 0) { g.strokeStyle = '#6fe7ff'; g.lineWidth = 2; g.setLineDash([5, 4]); g.strokeRect(s.x - r, s.y - r, r * 2, r * 2); g.setLineDash([]); }
      if (b.freezeT > 0) { g.fillStyle = 'rgba(198,244,50,.25)'; g.beginPath(); g.arc(s.x, s.y, r * 1.1, 0, 6.283); g.fill(); g.font = `bold 14px ${mono}`; g.fillStyle = '#C6F432'; g.textAlign = 'center'; g.fillText('BREAK', s.x, s.y - r - 18); }
      if (b.aimT > 0) { // 발사 예고
        const k = 1 - b.aimT / b.aimDur, wc = WARN();
        if (settings.cb) { g.strokeStyle = '#000'; g.lineWidth = 7; g.beginPath(); g.arc(s.x, s.y, r + 18 - k * 10, 0, 6.283); g.stroke(); }
        g.strokeStyle = `rgba(${wc},.95)`; g.lineWidth = 3; g.beginPath(); g.arc(s.x, s.y, r + 18 - k * 10, 0, 6.283); g.stroke();
        g.beginPath(); g.arc(s.x, s.y, r + 6, -Math.PI / 2, -Math.PI / 2 + k * 6.283); g.stroke();
        g.font = `bold 22px ${mono}`; g.fillStyle = `rgb(${wc})`; g.textAlign = 'center'; g.fillText('!', s.x, s.y - r - 22);
      }
      if (b.role === 'rush' && dist < 6) { g.font = `bold 20px ${mono}`; g.fillStyle = `rgb(${WARN()})`; g.textAlign = 'center'; g.fillText('!!', s.x, s.y - r - 20); }
    }
    for (const sh of this.shots) { if (!sh.alive) continue; const s = this.project(sh.pos); if (!s) { if (sh.pos.distanceTo(Game.camera.position) < 12) this.edgeArrow(g, sh.pos, sh.kind === 'missile' ? '#e05bff' : `rgb(${WARN()})`); continue; } if (sh.kind === 'missile') { g.font = `bold 13px ${mono}`; g.fillStyle = '#e05bff'; g.textAlign = 'center'; g.fillText(L('관통!', 'PIERCE!', '貫通!', '穿透！'), s.x, s.y - 26); } }
    if (this.bossObj) this.bossObj.draw2D(g);
    // 맞은 방향
    this.hitDirs = this.hitDirs.filter((h) => (h.t += dt) < 0.9);
    for (const h of this.hitDirs) { const a = h.ang - p.yaw + Math.PI; g.save(); g.translate(W / 2, H / 2); g.rotate(-a); g.globalAlpha = 1 - h.t / 0.9; g.strokeStyle = '#FF4D5E'; g.lineWidth = 10; g.beginPath(); g.arc(0, 0, 180, -Math.PI / 2 - 0.35, -Math.PI / 2 + 0.35); g.stroke(); g.restore(); }
    g.globalAlpha = 1;
    // 총
    this.drawGun(g);
    // 조준선
    const m = this.cur(), cx = W / 2, cy = H / 2, col = this.debugT > 0 ? '#FFD34D' : m.d.color;
    g.strokeStyle = this.hitMark > 0 ? '#fff' : col; g.lineWidth = 2.5;
    const gap = m.d.kind === 'shotgun' ? 26 : 10, len = 10;
    g.beginPath(); g.moveTo(cx - gap - len, cy); g.lineTo(cx - gap, cy); g.moveTo(cx + gap, cy); g.lineTo(cx + gap + len, cy); g.moveTo(cx, cy - gap - len); g.lineTo(cx, cy - gap); g.moveTo(cx, cy + gap); g.lineTo(cx, cy + gap + len); g.stroke();
    g.fillStyle = col; g.fillRect(cx - 1.5, cy - 1.5, 3, 3);
    if (this.charge > 0) { g.strokeStyle = '#6fe7ff'; g.lineWidth = 4; g.beginPath(); g.arc(cx, cy, 34, -Math.PI / 2, -Math.PI / 2 + this.charge * 6.283); g.stroke(); }
    if (m.reloadT > 0) { g.font = `bold 16px ${mono}`; g.fillStyle = '#FFD34D'; g.textAlign = 'center'; g.fillText(L('재장전', 'Reloading', 'リロード', '换弹') + ` ${m.reloadT.toFixed(1)}s`, cx, cy + 56); }
    // 떠오르는 글자
    this.pops = this.pops.filter((q) => (q.a += dt) < 0.9);
    for (const q of this.pops) { g.globalAlpha = 1 - q.a / 0.9; g.font = `bold 20px ${mono}`; g.textAlign = 'center'; g.fillStyle = '#000'; g.fillText(q.t, q.x + 2, q.y - q.a * 40 + 2); g.fillStyle = q.c; g.fillText(q.t, q.x, q.y - q.a * 40); }
    g.globalAlpha = 1;
    this.drawHUD(g, mono);
  },
  edgeArrow(g, pos, color) {
    const W = Game.W, H = Game.H; FV.d.subVectors(pos, Game.camera.position);
    const a = Math.atan2(FV.d.x, FV.d.z) - this.p.yaw + Math.PI; // 0 = 앞
    const x = W / 2 + Math.sin(-a) * Math.min(W, H) * 0.38, y = H / 2 - Math.cos(a) * Math.min(W, H) * 0.38;
    g.save(); g.translate(x, y); g.rotate(-a - Math.PI / 2 + Math.PI); g.fillStyle = color; g.beginPath(); g.moveTo(16, 0); g.lineTo(-8, -11); g.lineTo(-8, 11); g.closePath(); g.fill(); g.strokeStyle = '#000'; g.lineWidth = 2; g.stroke(); g.restore();
  },
  drawGun(g) {
    Game.loadGunAssets();
    const W = Game.W, H = Game.H, im = Game.fpImgs && Game.fpImgs[this.member];
    const low = this.p.crouchK * 0.15 + (this.cur().reloadT > 0 ? 0.35 : 0);
    const bob = Math.sin(this.p.bob) * 6;
    if (im && im.complete && im.naturalWidth) {
      const w = Math.min(W * 0.4, H * 0.56), h = w * im.naturalHeight / im.naturalWidth;
      const x = W - w * 0.95 + this.recoil * 14, y = H - h * 0.86 + this.recoil * 18 + bob + low * h;
      g.save(); g.imageSmoothingEnabled = true; g.drawImage(im, x, y, w, h);
      if (this.recoil > 0.5 && im.muzzle) { const mx = x + im.muzzle.x * w, my = y + im.muzzle.y * h, r = w * 0.07; const gr = g.createRadialGradient(mx, my, 0, mx, my, r); gr.addColorStop(0, 'rgba(255,255,230,.95)'); gr.addColorStop(0.4, this.cur().d.color); gr.addColorStop(1, 'rgba(198,244,50,0)'); g.fillStyle = gr; g.beginPath(); g.arc(mx, my, r, 0, 6.283); g.fill(); }
      g.restore();
    } else if (Game.gunImgs && Game.gunImgs[this.member]) { // 그림이 아직 없으면 코드로 그린 총
      const c = Game.gunImgs[this.member], w = Math.min(W * 0.34, H * 0.5), h = w * c.height / c.width;
      g.save(); g.imageSmoothingEnabled = false; g.drawImage(c, W - w * 1.3 + this.recoil * 14, H - h * 1.45 + this.recoil * 18 + bob + low * h, w, h); g.restore();
    }
  },
  drawHUD(g, mono) {
    const W = Game.W, H = Game.H, S = this.S, p = this.p;
    const box = (x, y, w, h) => { g.fillStyle = 'rgba(8,10,8,.82)'; g.fillRect(x, y, w, h); g.strokeStyle = '#2f342c'; g.lineWidth = 2; g.strokeRect(x, y, w, h); };
    // 안정성 (왼쪽 아래)
    box(28, H - 112, 360, 84);
    g.font = `bold 15px ${mono}`; g.fillStyle = '#aab2a3'; g.textAlign = 'left'; g.fillText(L('안정성', 'STABILITY', '安定性', '稳定性'), 44, H - 86);
    g.fillStyle = '#1b1f19'; g.fillRect(44, H - 76, 328, 18);
    g.fillStyle = p.hp > 50 ? '#C6F432' : p.hp > 25 ? '#FFD34D' : '#FF4D5E'; g.fillRect(44, H - 76, 328 * p.hp / 100, 18);
    g.font = `bold 22px ${mono}`; g.fillStyle = '#E8EDE2'; g.textAlign = 'right'; g.fillText(Math.ceil(p.hp) + '%', 372, H - 86);
    g.font = `14px ${mono}`; g.textAlign = 'left'; g.fillStyle = p.crouch ? '#C6F432' : '#7d8478';
    const nc = this.nearCover();
    g.fillText(p.crouch ? L('Z · 엄폐 중 (낮은 벽 뒤면 에러 패킷을 막음)', 'Z · IN COVER (low walls block packets)', 'Z · 遮蔽中 (低い壁の後ろならパケットを防ぐ)', 'Z · 隐蔽中（矮墙后可挡数据包）') : nc ? L('Z · 엄폐하기', 'Z · Take cover', 'Z · 遮蔽する', 'Z · 进入隐蔽') : L('R 재장전 · F 롤백', 'R Reload · F Rollback', 'R リロード · F ロールバック', 'R 换弹 · F 回滚') + ` (${S.rb})`, 44, H - 40);
    // 점수 (오른쪽 위)
    g.font = `bold 34px ${mono}`; g.textAlign = 'right'; g.fillStyle = '#C6F432'; g.fillText(this.run.score.toLocaleString(), W - 32, 52);
    g.font = `16px ${mono}`; g.fillStyle = '#aab2a3'; g.fillText(L('연속', 'Streak', '連続', '连击') + ' ×' + Math.min(2, 1 + 0.1 * this.run.streak).toFixed(1), W - 32, 78);
    // 목표 (위 가운데)
    g.textAlign = 'center'; g.font = `bold 17px ${mono}`; g.fillStyle = '#aab2a3';
    g.fillText(`${L('자유 작전', 'FREE OPS', 'フリー作戦', '自由作战')} · STAGE ${S.def.id} · ${S.def.name}`, W / 2, 34);
    let obj = '';
    if (S.def.boss) obj = this.bossObj ? L(`오류 줄 ${this.bossObj.fixed}/16 · 단계 ${this.bossObj.phase}/3`, `Error lines ${this.bossObj.fixed}/16 · Phase ${this.bossObj.phase}/3`, `エラー行 ${this.bossObj.fixed}/16 · フェーズ ${this.bossObj.phase}/3`, `错误行 ${this.bossObj.fixed}/16 · 阶段 ${this.bossObj.phase}/3`) : '';
    else if (S.phase === 'travel') {
      const z = this.zones[S.zi]; const d = z ? Math.round(Math.hypot(p.pos.x - z.c.x, p.pos.z - z.c.z)) : 0;
      obj = L(`▶ 구역 ${S.zi + 1}/3 으로 이동 · ${d}m`, `▶ Move to zone ${S.zi + 1}/3 · ${d}m`, `▶ エリア ${S.zi + 1}/3 へ移動 · ${d}m`, `▶ 前往区域 ${S.zi + 1}/3 · ${d}m`);
      if (z) { const sp = this.project(FV.d.set(z.c.x, 2, z.c.z)); if (!sp) this.edgeArrow(g, z.c, '#C6F432'); }
    } else if (S.phase === 'fight') { const left = S.waveQ.length + this.bugs.filter((b) => b.alive && b.role !== 'item').length; obj = L(`구역 ${S.zi + 1}/3 · 웨이브 ${S.wave + 1}/2 · 남은 버그 ${left}`, `Zone ${S.zi + 1}/3 · Wave ${S.wave + 1}/2 · Bugs left ${left}`, `エリア ${S.zi + 1}/3 · ウェーブ ${S.wave + 1}/2 · 残りバグ ${left}`, `区域 ${S.zi + 1}/3 · 波次 ${S.wave + 1}/2 · 剩余Bug ${left}`); }
    g.font = `bold 22px ${mono}`; g.fillStyle = '#E8EDE2'; g.fillText(obj, W / 2, 64);
    if (this.debugT > 0) { g.fillStyle = '#FFD34D'; g.font = `bold 18px ${mono}`; g.fillText(`DEBUG MODE ${this.debugT.toFixed(1)}s`, W / 2, 92); }
    // 분대원 (아래 가운데)
    const NM = this.mem.length, bw = NM > 3 ? 128 : 150, bh = 74, bx = W / 2 - (bw * NM + 10 * (NM - 1)) / 2, by = H - bh - 26;
    for (let i = 0; i < NM; i++) {
      const x = bx + i * (bw + 10), m = this.mem[i], sel = i === this.member;
      box(x, by, bw, bh); if (sel) { g.strokeStyle = m.d.color; g.lineWidth = 3; g.strokeRect(x, by, bw, bh); }
      const im = IMG.portrait && IMG.portrait[i]; if (im) { g.imageSmoothingEnabled = im instanceof HTMLImageElement; g.drawImage(im, x + 6, by + 6, 44, 44); }
      g.textAlign = 'left'; g.font = `bold 15px ${mono}`; g.fillStyle = m.d.color; g.fillText(`${i + 1} ${SQUAD[i].name}`, x + 56, by + 22);
      g.font = `13px ${mono}`; g.fillStyle = '#cfd6c8'; g.fillText(m.reloadT > 0 ? L('재장전…', 'Reloading…', 'リロード…', '换弹…') : this.debugT > 0 && sel ? '∞' : `${m.ammo}/${m.d.mag}`, x + 56, by + 42);
      g.fillStyle = '#1b1f19'; g.fillRect(x + 6, by + 58, bw - 12, 8); g.fillStyle = m.ult >= 100 ? '#FFD34D' : '#6b6f68'; g.fillRect(x + 6, by + 58, (bw - 12) * m.ult / 100, 8);
    }
    // 스킬 (오른쪽 아래)
    const sk = FREE_SKILLS[this.member], m = this.cur();
    const items = [['⇧', sk.shift, m.cd.shift / sk.shift.cd], ['E', sk.e, m.cd.e / sk.e.cd], ['Q', sk.q, m.ult >= 100 ? 0 : 1 - m.ult / 100], ['F', { name: L('롤백', 'Rollback', 'ロールバック', '回滚') }, S.rb > 0 ? 0 : 1]];
    const sw = 112, sx0 = W - (sw + 10) * 4 - 22, sy = H - 102;
    items.forEach(([key, s, cdk], i) => {
      const x = sx0 + i * (sw + 10);
      box(x, sy, sw, 78);
      if (cdk > 0) { g.fillStyle = 'rgba(0,0,0,.55)'; g.fillRect(x, sy, sw, 78 * cdk); }
      const ready = cdk <= 0;
      g.textAlign = 'center'; g.font = `bold 26px ${mono}`; g.fillStyle = ready ? (key === 'Q' ? '#FFD34D' : m.d.color) : '#6b6f68'; g.fillText(key, x + sw / 2, sy + 34);
      g.font = `bold 12px ${mono}`; g.fillStyle = ready ? '#E8EDE2' : '#7d8478'; g.fillText(s.name, x + sw / 2, sy + 58);
      if (!ready && key !== 'Q' && key !== 'F') { g.font = `bold 13px ${mono}`; g.fillStyle = '#FFD34D'; g.fillText((key === '⇧' ? m.cd.shift : m.cd.e).toFixed(1) + 's', x + sw / 2, sy + 73); }
      if (key === 'Q') { g.font = `bold 13px ${mono}`; g.fillStyle = m.ult >= 100 ? '#FFD34D' : '#aab2a3'; g.fillText(Math.floor(m.ult) + '%', x + sw / 2, sy + 73); }
    });
  },
};

// ---------- 자유 작전의 버그 ----------
class FreeBug {
  constructor(F, type, pos, opt = {}) {
    this.F = F; this.type = type; this.def = BUGDEF[type]; this.role = this.def.role;
    this.pos = pos.clone(); this.pos.y = this.role === 'shoot' ? rnd(2, 3.2) : this.def.size * 0.5 + 0.2;
    if (this.role === 'item') this.pos.y = 1.6;
    this.hp = this.maxHp = Math.max(1, Math.round(this.def.hp * (F.S.idx >= 2 ? 1.15 : 1)));
    this.alive = true; this.age = 0; this.frame = 0; this.ft = 0; this.flash = 0; this.ph = rnd(0, 6.28);
    this.vel = new THREE.Vector3(); this.fireT = this.def.fire ? rnd(1.0, 2.2) : 0; this.biteT = 0; this.aimT = 0; this.aimDur = 0.9;
    this.freezeT = 0; this.markT = 0; this.vis = true; this.vuln = true; this.trojan = !!opt.trojan; this.lookT = 0;
    this.anchor = null;
    this.mat = new THREE.SpriteMaterial({ map: (TEX[type] || TEX.basic)[0], transparent: true, fog: false });
    this.spr = new THREE.Sprite(this.mat); this.spr.scale.setScalar(0.01); Game.scene.add(this.spr);
    if (type === 'loop') { this.ang = rnd(0, 6.28); this.ring = new THREE.Sprite(new THREE.SpriteMaterial({ map: TEX.ring, transparent: true, fog: false, depthWrite: false })); Game.scene.add(this.ring); }
    SND.play('spawn');
  }
  remove() { this.alive = false; Game.scene.remove(this.spr); this.mat.dispose(); if (this.ring) { Game.scene.remove(this.ring); this.ring.material.dispose(); } }
  radius() { return this.def.size * 0.48; }
  hitPos() { return this.pos; }
  hittable() { return this.vis || this.markT > 0 || this.F.debugT > 0; }
  push(dir, f) { this.vel.addScaledVector(dir, f); }
  damage(dmg, crit, kind, dir) {
    if (!this.alive) return false;
    const F = this.F;
    if (this.role === 'item') { this.collect(); return true; }
    if (this.type === 'loop' && !this.vuln && kind !== 'sniper' && F.debugT <= 0) { if (Math.random() < 0.3) SND.play('deflect'); PFX.spark(this.pos, [0.85, 0.7, 1], 3, 3); return false; }
    if (kind && WEAK[this.type] === kind) { dmg *= 2; if (!this.weakShown) { this.weakShown = true; F.pop2(this.pos, L('약점! ×2', 'Weak spot! ×2', '弱点! ×2', '弱点！×2'), KIND_INFO[kind].color); } }
    if (this.markT > 0) dmg *= 1.5;
    if (F.debugT > 0) dmg *= 1.5;
    if (kind === 'shotgun' && this.role === 'rush' && dir) this.push(FV.d.set(dir.x, 0, dir.z).normalize(), 2.2);
    this.hp -= dmg; this.flash = 1;
    if (crit && kind === 'rifle' && Math.random() < 0.4) F.pop2(this.pos, 'PERFECT', '#FFD34D');
    PFX.spark(this.pos, [1, 0.85, 0.5], 2, 3);
    if (Math.random() < 0.5) SND.play('tick');
    if (this.hp <= 0) { this.lastKind = kind; this.die(); }
    return true;
  }
  die() {
    const F = this.F;
    if (this.type === 'clone' && !this.noSplit) {
      SND.play('split'); F.pop2(this.pos, L('분열!', 'Split!', '分裂!', '分裂！'), '#FFD34D');
      for (let i = 0; i < 2; i++) { const p = this.pos.clone().add(FV.d.set(rnd(-1.5, 1.5), 0, rnd(-1.5, 1.5))); const m = F.spawnBug('mini', p); m.vel.set(rnd(-4, 4), 0, rnd(-4, 4)); }
      F.S.expected += 2;
    }
    F.onFix(this); this.remove();
  }
  collect() {
    const F = this.F; this.remove();
    if (this.trojan) { SND.play('jam'); F.pop2(this.pos, L('트로이 목마!', 'Trojan horse!', 'トロイの木馬!', '特洛伊木马！'), '#FF4D5E'); for (let i = 0; i < 3; i++) F.spawnBug('basic', this.pos.clone().add(FV.d.set(rnd(-2, 2), 0, rnd(-2, 2)))); F.S.expected += 3; return; }
    F.p.hp = Math.min(100, F.p.hp + 20); for (const c of F.covers) if (c.alive) c.hp = Math.min(c.max, c.hp + 40);
    SND.play('pickup'); F.pop2(this.pos, L('핫픽스! 안정성 +20', 'Hotfix! Stability +20', 'ホットフィックス! 安定性 +20', '热修复！稳定性 +20'), '#E6FF7A');
  }
  update(dt, rdt) {
    const F = this.F, P = F.p.pos, d = this.freezeT > 0 ? 0 : dt;
    this.age += rdt; this.freezeT = Math.max(0, this.freezeT - rdt); this.markT = Math.max(0, this.markT - rdt);
    this.ft += d; if (this.ft > 0.14) { this.ft = 0; this.frame ^= 1; this.mat.map = (TEX[this.type] || TEX.basic)[this.frame]; }
    this.flash = Math.max(0, this.flash - rdt * 6);
    const sp = this.def.spd * F.D.spd * (F.S.help ? 0.8 : 1);
    FV.a.set(P.x - this.pos.x, 0, P.z - this.pos.z); const dist = FV.a.length(); FV.a.divideScalar(dist || 1);
    if (this.role === 'item') { this.pos.y = 1.6 + Math.sin(this.age * 2.5) * 0.3; if (dist < 1.3) this.collect(); else if (this.age > 9) this.remove(); }
    else if (this.role === 'rush') {
      if (this.biteT > 0) this.biteT -= d;
      if (dist > 1.25) this.pos.addScaledVector(FV.a, sp * d);
      else if (this.biteT <= 0 && this.freezeT <= 0) { this.biteT = 0.9; F.hurt(this.def.dmg, this.pos); this.push(FV.a.clone().negate(), 6); SND.play('hit'); }
      FV.b.set(-FV.a.z, 0, FV.a.x); this.pos.addScaledVector(FV.b, Math.sin(this.age * 3 + this.ph) * 1.2 * d);
    } else if (this.role === 'shoot') {
      if (!this.anchor || this.pos.distanceTo(this.anchor) < 0.6 && Math.random() < d * 0.25) {
        const z = F.zones[F.S.zi] || { c: P, R: 12 };
        for (let k = 0; k < 10; k++) { const a = rnd(0, 6.283), r = rnd(9, 14); const q = new THREE.Vector3(P.x + Math.cos(a) * r, this.pos.y, P.z + Math.sin(a) * r); if (q.distanceTo(z.c) < z.R - 1 && F.inCorridor(q, 1)) { this.anchor = q; break; } }
        if (!this.anchor) this.anchor = this.pos.clone();
      }
      FV.b.subVectors(this.anchor, this.pos); FV.b.y = 0; const ad = FV.b.length(); if (ad > 0.3) this.pos.addScaledVector(FV.b.divideScalar(ad), Math.min(ad, sp * 0.9 * d));
      this.pos.y += Math.sin(this.age * 1.6 + this.ph) * 0.3 * d;
      if (this.type === 'ghost') { const cyc = (this.age + this.ph) % 1.5; const tg = cyc < 0.5 || F.debugT > 0 || this.markT > 0 ? 1 : 0.08; this.mat.opacity += (tg - this.mat.opacity) * Math.min(1, rdt * 18); this.vis = this.mat.opacity > 0.55; }
      if (this.type === 'e404' && F.debugT <= 0) { // 조준선이 1초 겹치면 순간이동
        FV.c.subVectors(this.pos, Game.camera.position); const t = FV.c.dot(F.ray()); const perp = Math.sqrt(Math.max(0, FV.c.lengthSq() - t * t));
        if (t > 0 && perp < 1.2) this.lookT += rdt; else this.lookT = Math.max(0, this.lookT - rdt);
        if (this.lookT > 1) { this.lookT = 0; PFX.spark(this.pos, [1, 0.6, 0.3], 8, 4); SND.play('tele'); this.pos.copy(F.spawnPos(8, 13)); this.pos.y = rnd(2, 3); this.anchor = null; }
      }
      if (this.type === 'loop') { this.ang += 2.3 * d; let diff = Math.abs(((this.ang - Math.PI / 2) % 6.283 + 6.283) % 6.283); if (diff > Math.PI) diff = 6.283 - diff; this.vuln = diff < 0.6 || F.debugT > 0; this.mat.color.setScalar(this.vuln ? 1.25 : 0.55); }
      if (this.freezeT <= 0) {
        if (this.aimT > 0) { this.aimT -= d; if (this.aimT <= 0) this.fire(); }
        else { this.fireT -= d; if (this.fireT <= 0 && dist < 26) { this.fireT = rnd(this.def.fire[0], this.def.fire[1]) * 1.3; this.aimT = this.aimDur; SND.play('warn'); } }
      }
    }
    this.vel.multiplyScalar(Math.max(0, 1 - rdt * 5)); this.pos.addScaledVector(this.vel, d);
    if (this.role !== 'item') { // 서로 겹치지 않게
      for (const o of F.bugs) if (o !== this && o.alive && o.role === this.role) { FV.c.subVectors(this.pos, o.pos); FV.c.y = 0; const l = FV.c.length(); if (l > 0 && l < 1.4) this.pos.addScaledVector(FV.c.divideScalar(l), (1.4 - l) * 0.5); }
      if (F.zones[F.S.zi]) { const z = F.zones[F.S.zi], dx = this.pos.x - z.c.x, dz = this.pos.z - z.c.z, dd = Math.hypot(dx, dz); if (dd > z.R - 0.6) { this.pos.x = z.c.x + dx / dd * (z.R - 0.6); this.pos.z = z.c.z + dz / dd * (z.R - 0.6); } }
      for (const c of F.allCovers()) { const y = this.pos.y; F.pushOut(this.pos, c, this.radius() * 0.8); this.pos.y = y; }
    }
    const scale = this.def.size * Math.min(1, this.age / 0.3), sq = Math.sin(this.age * 14) * 0.07;
    this.spr.position.copy(this.pos); this.spr.scale.set(scale * (1 + sq), scale * (1 - sq), 1);
    this.mat.rotation = Math.sin(this.age * 5) * 0.12;
    if (this.type !== 'loop') { if (this.freezeT > 0) this.mat.color.setRGB(0.75, 1.2, 0.5); else if (this.flash > 0) this.mat.color.setScalar(1 + this.flash * 2); else if (this.trojan && Math.sin(this.age * 9) > 0.6) this.mat.color.setRGB(1, 0.55, 0.55); else this.mat.color.setScalar(1); }
    if (this.ring) { this.ring.position.copy(this.pos); this.ring.scale.setScalar(scale * 2.2); this.ring.material.rotation += d; this.ring.material.opacity = this.vuln ? 0.35 : 1; }
  }
  fire() {
    const F = this.F; if (!this.alive) return;
    const to = F.p.pos.clone(); to.y = F.p.crouch ? 0.65 : 1.3;
    if (this.def.missile) F.shots.push(new FreeShot(F, 'missile', this.pos, to, this.def.dmg));
    else F.shots.push(new FreeShot(F, 'packet', this.pos, to, this.def.dmg));
  }
}

// 에러 패킷 (엄폐물이 막음) · 관통 미사일 (엄폐물을 뚫음, 쏴서 격추)
class FreeShot {
  constructor(F, kind, from, to, dmg) {
    this.F = F; this.kind = kind; this.pos = from.clone(); this.dmg = dmg; this.alive = true; this.hp = 2; this.age = 0;
    this.vel = to.clone().sub(from).normalize().multiplyScalar(kind === 'missile' ? 7 : 13);
    if (!Free.packetTex && IMG.packet) { Free.packetTex = new THREE.CanvasTexture(IMG.packet); }
    const tex = kind === 'missile' ? TEX.missile[0] : (Free.packetTex || TEX.glow);
    this.mat = new THREE.SpriteMaterial({ map: tex, transparent: true, fog: false }); this.spr = new THREE.Sprite(this.mat);
    this.spr.scale.setScalar(kind === 'missile' ? 1.3 : 0.9); Game.scene.add(this.spr);
    SND.play(kind === 'missile' ? 'missile' : 'shot');
  }
  remove() { this.alive = false; Game.scene.remove(this.spr); this.mat.dispose(); }
  kill(fx) { if (fx) PFX.spark(this.pos, [0.9, 0.5, 1], 8, 4); this.remove(); }
  update(dt) {
    const F = this.F; this.age += dt;
    if (this.kind === 'missile') { // 천천히 따라옴
      FV.a.copy(F.p.pos); FV.a.y = F.eye() - 0.4; FV.a.sub(this.pos).normalize().multiplyScalar(7);
      this.vel.lerp(FV.a, Math.min(1, dt * 1.2)); this.mat.rotation += dt * 6;
    }
    const prev = FV.b.copy(this.pos); this.pos.addScaledVector(this.vel, dt);
    if (this.kind === 'packet') for (const c of F.allCovers()) { const t = F.segHitsCover(prev, this.pos, c); if (t >= 0) { F.run.blocked++; c.hp -= this.dmg * 1.2; PFX.spark(this.pos, [1, 0.5, 0.4], 6, 3); SND.play('block'); F.pop2(this.pos, L('막음!', 'Blocked!', '防いだ!', '挡住了！'), '#cfd6c8'); this.remove(); return; } }
    FV.c.copy(F.p.pos); FV.c.y = (F.eye() + F.p.pos.y) / 2;
    if (this.pos.distanceTo(FV.c) < (F.p.crouch ? 0.7 : 0.95)) { F.hurt(this.dmg, this.pos, this.kind); this.remove(); return; }
    if (this.age > 6 || this.pos.y < -1) this.remove();
    this.spr.position.copy(this.pos);
  }
}

// 렉스의 방화벽 (10초 동안 서 있는 엄폐벽)
class FreeWall {
  constructor(pos, yaw) {
    this.pos = pos.clone(); this.pos.y = 0; this.yaw = yaw; this.w = 3.2; this.h = 1.5; this.d = 0.4; this.hp = this.max = 140; this.t = 10; this.alive = true;
    this.mesh = new THREE.Mesh(new THREE.BoxGeometry(this.w, this.h, this.d), new THREE.MeshBasicMaterial({ color: 0xFFD34D, transparent: true, opacity: 0.22, fog: false, depthWrite: false }));
    this.mesh.add(new THREE.LineSegments(new THREE.EdgesGeometry(this.mesh.geometry), new THREE.LineBasicMaterial({ color: 0xfff1a0 })));
    this.mesh.position.set(this.pos.x, this.h / 2, this.pos.z); this.mesh.rotation.y = yaw; Game.scene.add(this.mesh);
  }
  update(dt) { this.t -= dt; this.mesh.material.opacity = 0.12 + 0.12 * (this.hp / this.max) + (this.t < 2 ? Math.sin(this.t * 20) * 0.1 : 0); if (this.t <= 0 || this.hp <= 0) this.remove(); }
  remove() { this.alive = false; Game.scene.remove(this.mesh); this.mesh.geometry.dispose(); this.mesh.material.dispose(); }
}

// 보스 "메인 루프" (자유 작전): 가운데 떠 있는 거대한 심장 + 빛나는 오류 줄 16개 (4 · 6 · 6)
class FreeBoss {
  constructor(F) {
    this.F = F; this.phase = 1; this.fixed = 0; this.t = 0; this.atkT = 3; this.spawnT = 5; this.nodes = [];
    this.mat = new THREE.SpriteMaterial({ map: TEX.loop[0], transparent: true, fog: false }); this.spr = new THREE.Sprite(this.mat); this.spr.scale.setScalar(9); this.spr.position.set(0, 7, 0); Game.scene.add(this.spr);
    this.ring = new THREE.Sprite(new THREE.SpriteMaterial({ map: TEX.ring, transparent: true, fog: false, depthWrite: false })); this.ring.scale.setScalar(16); this.ring.position.copy(this.spr.position); Game.scene.add(this.ring);
    const c = document.createElement('canvas'); c.width = 128; c.height = 40; const g = c.getContext('2d');
    g.fillStyle = '#3a0a10'; g.fillRect(0, 0, 128, 40); g.strokeStyle = '#FF4D5E'; g.lineWidth = 4; g.strokeRect(2, 2, 124, 36); g.fillStyle = '#FF8A95'; g.font = 'bold 20px monospace'; g.textAlign = 'center'; g.fillText('ERR();', 64, 27);
    this.nodeTex = new THREE.CanvasTexture(c);
    this.makeNodes();
  }
  makeNodes() {
    const n = [4, 6, 6][this.phase - 1], hp = Math.round([22, 28, 34][this.phase - 1] * this.F.D.spd * (this.F.S.help ? 0.8 : 1));
    for (let i = 0; i < n; i++) {
      const mat = new THREE.SpriteMaterial({ map: this.nodeTex, transparent: true, fog: false }), spr = new THREE.Sprite(mat); spr.scale.set(2.6, 0.8, 1); Game.scene.add(spr);
      this.nodes.push({ isNode: true, alive: true, hp, max: hp, a: (i / n) * 6.283, h: rnd(3, 10), r: rnd(6.5, 9), spr, mat, pos: new THREE.Vector3() });
    }
    UI.banner('PHASE ' + this.phase, [L('오류 줄을 고쳐라!', 'Fix the error lines!', 'エラー行を直せ!', '修好错误行！'), L('속도 증가! 버그를 더 뱉어요', 'Speed up! More bugs', 'スピードアップ! バグが増える', '速度提升！吐出更多Bug'), L('마지막 단계! 미사일 폭풍', 'Final phase! Missile storm', '最終フェーズ! ミサイルの嵐', '最终阶段！导弹风暴')][this.phase - 1], 2);
    SND.play('phase');
  }
  hit(n, dmg) {
    if (!n.alive) return false;
    n.hp -= dmg; n.mat.color.setScalar(2); PFX.spark(n.pos, [1, 0.5, 0.5], 3, 3); if (Math.random() < 0.4) SND.play('tick');
    if (n.hp <= 0) {
      n.alive = false; Game.scene.remove(n.spr); n.mat.dispose(); this.fixed++; this.F.S.fixed++; this.F.run.score += 400; this.F.run.fixed++;
      this.F.cur().ult = Math.min(100, this.F.cur().ult + 10);
      PFX.fix(n.pos, [1, 0.3, 0.37], 1.6); SND.play('hit', this.fixed); World.colorizeNear(n.pos, 3);
      if (!this.nodes.some((x) => x.alive)) {
        this.nodes = [];
        if (this.phase < 3) { this.phase++; this.makeNodes(); this.F.spawnHotfix(); }
        else this.win();
      }
    }
    return true;
  }
  win() {
    this.dead = true; UI.banner('', 'BUILD SUCCESS', 3, true); SND.play('success');
    const F = this.F; F.S.phase = 'clear'; // 이긴 뒤 1.5초 동안 맞아서 크래시 나지 않게
    for (const b of F.bugs) { PFX.fix(b.pos, [1, 0.3, 0.37]); b.remove(); } F.bugs = []; for (const s of F.shots) s.remove(); F.shots = []; F.S.waveQ = [];
    PFX.fix(this.spr.position, [0.78, 0.96, 0.2], 3);
    setTimeout(() => { if (this.F.active) this.F.stageClear(); }, 1500);
  }
  remove() { Game.scene.remove(this.spr, this.ring); this.mat.dispose(); this.ring.material.dispose(); for (const n of this.nodes) { Game.scene.remove(n.spr); n.mat.dispose(); } this.nodeTex.dispose(); }
  update(dt) {
    if (this.dead) return;
    const F = this.F, sp = [1, 1.4, 1.8][this.phase - 1] * F.D.spd;
    this.t += dt; this.spr.position.y = 7 + Math.sin(this.t * 1.5) * 0.6; this.ring.position.copy(this.spr.position); this.ring.material.rotation += dt * sp;
    const s = 9 * (1 + Math.sin(this.t * 6) * 0.04); this.spr.scale.setScalar(s);
    for (const n of this.nodes) { if (!n.alive) continue; n.a += dt * 0.5 * sp; n.pos.set(Math.cos(n.a) * n.r, n.h + Math.sin(this.t + n.a) * 0.8, Math.sin(n.a) * n.r); n.spr.position.copy(n.pos); n.mat.color.lerp(FV.a.set(1, 1, 1), Math.min(1, dt * 6)); }
    this.atkT -= dt; this.spawnT -= dt;
    if (this.atkT <= 0) {
      this.atkT = [5.2, 4.4, 3.6][this.phase - 1] / (this.F.S.help ? 0.8 : 1);
      const to = F.p.pos.clone(); to.y = 1.2;
      F.shots.push(new FreeShot(F, 'missile', this.spr.position.clone().add(FV.b.set(rnd(-3, 3), -2, rnd(-3, 3))), to, 12));
      if (this.phase === 3) for (let i = 0; i < 2; i++) F.shots.push(new FreeShot(F, 'packet', this.spr.position.clone().add(FV.b.set(rnd(-4, 4), -3, rnd(-4, 4))), to.clone().add(FV.c.set(rnd(-1, 1), 0, rnd(-1, 1))), 8));
    }
    if (this.spawnT <= 0) {
      this.spawnT = [8, 6.5, 5.5][this.phase - 1];
      const n = this.phase + 1, types = ['basic', 'clone', 'throw', 'ghost', 'e404'];
      const on = F.bugs.filter((b) => b.alive && b.role !== 'item').length;
      for (let i = 0; i < n && on + i < F.D.maxOn; i++) F.spawnBug(types[Math.floor(RNG() * Math.min(types.length, 2 + this.phase))]);
    }
  }
  draw2D(g) {
    for (const n of this.nodes) { if (!n.alive) continue; const s = this.F.project(n.pos); if (!s) continue; const w = 54; g.fillStyle = '#000'; g.fillRect(s.x - w / 2 - 1, s.y - 30, w + 2, 6); g.fillStyle = '#FF4D5E'; g.fillRect(s.x - w / 2, s.y - 29, w * n.hp / n.max, 4); }
  }
}
