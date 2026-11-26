// ---------- 버그 · 파티클 · 보스 ----------
// role: rush(엄폐물까지 달려와 물기 — 숨어도 맞음) / shoot(멀리 서서 예고 후 에러 패킷 — 숨으면 막힘)
//       missile(관통 미사일 — 숨어도 맞음, 쏴서 떨어뜨려야 함) / item(핫픽스)
const BUGDEF = {
  basic: { name: L('기본 버그', 'Basic Bug'), role: 'rush', hp: 5, pts: 100, spd: 3.0, size: 1.8, dmg: 14 },
  clone: { name: L('복제 버그', 'Clone Bug'), role: 'rush', hp: 6, pts: 0, spd: 2.7, size: 2.0, dmg: 14, tip: L('맞으면 둘로 분열해요!', 'Splits in two when hit!') },
  mini: { name: L('작은 복제', 'Mini Clone'), role: 'rush', hp: 2, pts: 50, spd: 3.8, size: 1.15, dmg: 7 },
  throw: { name: L('throw 버그', 'Throw Bug'), role: 'shoot', hp: 8, pts: 150, spd: 4.2, size: 1.8, dmg: 10, fire: [2.0, 3.3], tip: L('빨간 원이 뜨면 손을 떼서 숨으세요!', 'Red circle? Let go and hide!') },
  ghost: { name: L('투명 버그', 'Ghost Bug'), role: 'shoot', hp: 6, pts: 200, spd: 4, size: 1.8, dmg: 10, fire: [2.3, 3.6], tip: L('보일 때만 맞아요', 'Only hittable while visible') },
  e404: { name: L('404 버그', '404 Bug'), role: 'shoot', hp: 8, pts: 250, spd: 4, size: 1.9, dmg: 10, fire: [2.2, 3.5], tip: L('조준선이 1초 겹치면 순간이동!', 'Aim at it for 1s and it teleports!') },
  loop: { name: L('무한루프 버그', 'Infinite Loop Bug'), role: 'shoot', hp: 10, pts: 300, spd: 3.4, size: 1.8, dmg: 18, fire: [4.2, 6], missile: true, tip: L('관통 미사일을 쏴요! 숨어도 맞으니 미사일을 쏴서 떨어뜨리세요', 'Fires piercing missiles! Hiding won\'t help, so shoot the missiles down') },
  missile: { name: L('관통 미사일', 'Piercing Missile'), role: 'missile', hp: 2, pts: 50, spd: 4.4, size: 1.3, dmg: 16 },
  hotfix: { name: L('핫픽스', 'Hotfix'), role: 'item', hp: 1, pts: 0, spd: 0, size: 2.1, dmg: 0, tip: L('쏘면 안정성 +20, 화면 고장 모두 복구!', 'Shoot it: Stability +20, all glitches repaired!') },
};
const V1 = new THREE.Vector3(), V2 = new THREE.Vector3(), V3 = new THREE.Vector3();

class Bug {
  constructor(type, pos, opt = {}) {
    this.type = type; this.def = BUGDEF[type]; this.role = this.def.role;
    this.pos = pos.clone(); this.center = pos.clone();
    this.anchor = opt.anchor ? opt.anchor.clone() : null; this.arrived = false;
    this.hp = this.maxHp = Math.max(1, Math.round(this.def.hp * (opt.hpMul || 1)));
    this.age = 0; this.alive = true; this.frame = 0; this.ft = 0;
    this.intro = !!opt.intro; this.spdMul = (opt.spdMul || 1) * (this.intro ? 0.7 : 1);
    this.ox = opt.ox != null ? opt.ox : rnd(-1.4, 1.4); this.oy = opt.oy != null ? opt.oy : rnd(-0.6, 0.6);
    this.wf = rnd(1.2, 2.4); this.wa = rnd(0.6, 1.4); this.ph = rnd(0, 6.28);
    this.sep = opt.sep ? opt.sep.clone() : null;
    this.fireT = this.def.fire ? rnd(0.25, 0.75) : 0; // 자리 잡자마자 곧 공격
    this.hover = 0; this.vis = true; this.vuln = true; this.flash = 0;
    this.sx = -999; this.sy = -999; this.sr = 0; this.onScreen = false;
    this.mat = new THREE.SpriteMaterial({ map: TEX[type][0], transparent: true, fog: false });
    this.spr = new THREE.Sprite(this.mat);
    this.spr.scale.setScalar(0.01);
    Game.scene.add(this.spr);
    if (type === 'loop') {
      this.ang = rnd(0, 6.28); this.dirA = RNG() < 0.5 ? 1 : -1; this.gAng = Math.PI / 2;
      this.ring = new THREE.Sprite(new THREE.SpriteMaterial({ map: TEX.ring, transparent: true, fog: false, depthWrite: false }));
      this.glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: TEX.glow, transparent: true, fog: false, depthWrite: false, blending: THREE.AdditiveBlending }));
      Game.scene.add(this.ring, this.glow);
    }
  }
  get hostile() { return this.role !== 'item'; }
  remove() {
    this.alive = false;
    Game.scene.remove(this.spr); this.mat.dispose();
    if (this.ring) { Game.scene.remove(this.ring, this.glow); this.ring.material.dispose(); this.glow.material.dispose(); }
  }
  update(dt, ws) {
    const d = dt * ws;
    this.age += d;
    this.ft += d; if (this.ft > 0.14) { this.ft = 0; this.frame ^= 1; this.mat.map = TEX[this.type][this.frame]; }
    const cam = Game.camera, R = Game.camR, U = Game.camU;
    if (this.role === 'item') { this.updateItem(dt, d); return; }
    const tgt = this.type === 'loop' ? this.center : this.pos;
    let sp = this.def.spd * this.spdMul * Game.bugSpeedMul;
    if (this.role === 'shoot') {
      // 자리 잡기 → 둥실둥실 떠 있다가 예고 후 공격
      if (!this.arrived) {
        V2.subVectors(this.anchor, tgt); const dist = V2.length();
        if (dist < 0.4) this.arrived = true; else tgt.addScaledVector(V2.divideScalar(dist), Math.min(dist, sp * 1.5 * d));
      } else {
        V1.copy(this.anchor).addScaledVector(R, Math.sin(this.age * 0.7 + this.ph) * 1.3).addScaledVector(U, Math.sin(this.age * 1.1 + this.ph) * 0.35);
        tgt.lerp(V1, Math.min(1, d * 2));
        if (Game.canEnemiesAct()) {
          this.fireT -= d;
          if (this.fireT <= 0) { this.fireT = rnd(this.def.fire[0], this.def.fire[1]) * Game.fm; Game.enemyAttack(this); }
        }
      }
    } else {
      // 돌격형·미사일: 카메라(엄폐물)를 향해 곧장
      V1.copy(cam.position).addScaledVector(R, this.role === 'missile' ? this.ox * 0.3 : this.ox).addScaledVector(U, this.role === 'missile' ? 0 : this.oy);
      V2.subVectors(V1, tgt); const dist = V2.length(); V2.divideScalar(dist || 1);
      // 돌진 (상): 0.5초 예고 후 빨라짐
      if (this.role === 'rush' && Game.D.dash && !this.dashRolled && this.age > 0.6) {
        if (this.pos.distanceTo(cam.position) < 16) { this.dashRolled = true; if (RNG() < Game.D.dash) { this.windT = 0.5; this.dashT = 0; Game.run.st.dash++; SND.play('warn'); } }
      }
      if (this.windT > 0) { this.windT -= dt; sp *= 0.1; this.dashT = this.windT <= 0 ? 0.8 : 0.001; this.pos.addScaledVector(R, (Math.random() - 0.5) * 0.12); }
      else if (this.dashT > 0) { this.dashT -= dt; sp *= 1.9; }
      tgt.addScaledVector(V2, sp * d);
      const wa = this.role === 'missile' ? 0.25 : this.wa;
      tgt.addScaledVector(R, Math.cos(this.age * this.wf + this.ph) * wa * d);
      tgt.addScaledVector(U, Math.sin(this.age * this.wf * 1.3 + this.ph) * wa * 0.5 * d);
      if (this.sep) { tgt.addScaledVector(this.sep, d); this.sep.multiplyScalar(Math.max(0, 1 - d * 2.5)); }
    }
    let scale = this.def.size * Math.min(1, this.age / 0.3);
    this.flash = Math.max(0, this.flash - dt * 6);
    if (this.type === 'ghost') {
      const cyc = (this.age + this.ph) % 1.5;
      const target = cyc < 0.5 ? 1 : 0.07;
      this.mat.opacity += (target - this.mat.opacity) * Math.min(1, dt * 18);
      this.vis = this.mat.opacity > 0.55;
    }
    if (this.type === 'loop') {
      this.ang += this.dirA * 2.3 * d;
      const rr = 1.7;
      this.pos.copy(this.center).addScaledVector(R, Math.cos(this.ang) * rr).addScaledVector(U, Math.sin(this.ang) * rr);
      let diff = Math.abs(((this.ang - this.gAng) % 6.2832 + 6.2832) % 6.2832); if (diff > Math.PI) diff = 6.2832 - diff;
      this.vuln = diff < 0.55;
      this.ring.position.copy(this.center); this.ring.scale.setScalar(rr * 2.5 * Math.min(1, this.age / 0.3));
      this.ring.material.rotation += d * 0.6;
      this.glow.position.copy(this.center).addScaledVector(R, Math.cos(this.gAng) * rr).addScaledVector(U, Math.sin(this.gAng) * rr);
      this.glow.scale.setScalar(1.2 + Math.sin(Game.time * 10) * 0.25 + (this.vuln ? 0.8 : 0));
      this.mat.color.setRGB(1, 1, 1).multiplyScalar(this.vuln ? 1.25 : 0.55);
      this.ring.material.opacity = this.vuln ? 0.35 : 1;
    }
    if (this.role === 'missile') { this.mat.rotation += d * 6; scale *= 1 + Math.sin(this.age * 20) * 0.06; }
    if (this.dashT > 0) this.mat.color.setRGB(1.7, 0.55, 0.55);
    else if (this.flash > 0) this.mat.color.setRGB(1 + this.flash * 2, 1 + this.flash * 2, 1 + this.flash * 2);
    else if (this.type !== 'loop') this.mat.color.setRGB(1, 1, 1);
    this.spr.position.copy(this.pos);
    if (this.role !== 'missile') {
      const sq = Math.sin(this.age * 14) * 0.07; // 꿈틀거림
      this.spr.scale.set(scale * (1 + sq), scale * (1 - sq), 1);
      this.mat.rotation = Math.sin(this.age * 5) * 0.12;
    } else this.spr.scale.set(scale, scale, 1);
    // 엄폐물까지 도착 → 물기 / 미사일 명중
    if (this.role !== 'shoot') {
      const cd = this.pos.distanceTo(cam.position);
      V3.subVectors(this.pos, cam.position);
      if (cd < 1.9 || V3.dot(Game.camF) < -0.5) Game.contact(this);
    }
  }
  // 핫픽스: 둥실둥실, 6초 뒤 사라짐
  updateItem(dt, d) {
    if (this.vx == null) this.vx = (RNG() < 0.5 ? -1 : 1) * rnd(0.6, 1.2);
    this.pos.addScaledVector(Game.camR, this.vx * d);
    this.pos.y += Math.sin(this.age * 2.5) * 0.4 * d;
    this.spr.position.copy(this.pos);
    const s = this.def.size * Math.min(1, this.age / 0.3) * (1 + Math.sin(this.age * 6) * 0.08);
    this.spr.scale.set(s, s, 1);
    this.mat.rotation = Math.sin(this.age * 3) * 0.25;
    this.mat.opacity = this.age > 4.8 ? (Math.floor(this.age * 10) % 2 ? 0.3 : 1) : 1;
    if (this.trojan) { const k = Math.sin(this.age * 9) > 0.6; this.mat.color.setRGB(1, k ? 0.55 : 1, k ? 0.55 : 1); } // 트로이 목마: 가끔 붉게
    V3.subVectors(this.pos, Game.camera.position);
    if (this.age > 6.5 || V3.length() < 2 || V3.dot(Game.camF) < 0) this.remove();
  }
}

// 파티클: 픽셀이 흩어졌다가 초록 체크(✔)로 모여 사라짐
const PFX = {
  N: 900, pts: null, pos: null, col: null, list: [], free: [],
  init(scene) {
    const g = new THREE.BufferGeometry();
    this.pos = new Float32Array(this.N * 3); this.col = new Float32Array(this.N * 3);
    for (let i = 0; i < this.N; i++) { this.pos[i * 3 + 1] = -9999; this.free.push(i); }
    g.setAttribute('position', new THREE.BufferAttribute(this.pos, 3));
    g.setAttribute('color', new THREE.BufferAttribute(this.col, 3));
    this.pts = new THREE.Points(g, new THREE.PointsMaterial({ size: 0.2, vertexColors: true, sizeAttenuation: true, fog: false }));
    this.pts.frustumCulled = false;
    scene.add(this.pts);
  },
  spawn(p) { const i = this.free.pop(); if (i == null) return; p.i = i; this.list.push(p); },
  CHECK: [[-3, 0], [-2, -1], [-1, -2], [0, -1], [1, 0], [2, 1], [3, 2], [4, 3], [-3, 1], [-2, 0], [-1, -1], [0, 0], [1, 1], [2, 2], [3, 3], [4, 4]],
  fix(at, color = [1, 0.3, 0.37], scale = 1) {
    const R = Game.camR, U = Game.camU;
    for (const [x, y] of this.CHECK) {
      const tgt = at.clone().addScaledVector(R, x * 0.2 * scale).addScaledVector(U, y * 0.2 * scale - 0.2);
      this.spawn({ p: at.clone(), v: new THREE.Vector3(rnd(-1, 1), rnd(-1, 1), rnd(-1, 1)).normalize().multiplyScalar(rnd(3, 7)), t: 0, life: 0.95, tgt, c0: color, mode: 'check' });
    }
    for (let k = 0; k < 10; k++) this.spawn({ p: at.clone(), v: new THREE.Vector3(rnd(-1, 1), rnd(-1, 1), rnd(-1, 1)).multiplyScalar(6), t: 0, life: 0.35, c0: color, mode: 'spark' });
  },
  spark(at, color = [1, 0.83, 0.3], n = 8, sp = 5) {
    for (let k = 0; k < n; k++) this.spawn({ p: at.clone(), v: new THREE.Vector3(rnd(-1, 1), rnd(-1, 1), rnd(-1, 1)).multiplyScalar(sp), t: 0, life: 0.3, c0: color, mode: 'spark' });
  },
  update(dt) {
    const P = this.pos, C = this.col;
    for (let k = this.list.length - 1; k >= 0; k--) {
      const q = this.list[k]; q.t += dt;
      const i = q.i * 3;
      if (q.t >= q.life) { P[i + 1] = -9999; this.free.push(q.i); this.list.splice(k, 1); continue; }
      let c = q.c0;
      if (q.mode === 'check' && q.t > 0.2) {
        q.p.lerp(q.tgt, Math.min(1, dt * 12));
        const m = Math.min(1, (q.t - 0.2) / 0.25);
        c = [lerp(q.c0[0], 0.55, m), lerp(q.c0[1], 1, m), lerp(q.c0[2], 0.45, m)];
      } else { q.p.addScaledVector(q.v, dt); q.v.multiplyScalar(1 - dt * 4); }
      P[i] = q.p.x; P[i + 1] = q.p.y; P[i + 2] = q.p.z;
      C[i] = c[0]; C[i + 1] = c[1]; C[i + 2] = c[2];
    }
    this.pts.geometry.attributes.position.needsUpdate = true;
    this.pts.geometry.attributes.color.needsUpdate = true;
  },
  clear() { for (const q of this.list) { this.pos[q.i * 3 + 1] = -9999; this.free.push(q.i); } this.list = []; this.pts.geometry.attributes.position.needsUpdate = true; },
};

// ---------- 보스 "메인 루프" ----------
const CODE = [
  ['function mainLoop() {', 'function mainLoop() { mainLoop();'],
  ['  while (game.running) {', '  while (true) { while (true) {'],
  ['    const dt = clock.tick();', '    const dt = undefined;'],
  ['    input.poll();', '    input.poll(input.poll());'],
  ['    world.update(dt);', '    world.update(NaN);'],
  ['    bugs.forEach(b => b.move(dt));', '    bugs.forEach(b => bugs.push(b));'],
  ['    if (hp <= 0) crash();', '    if (hp = 0) crash();'],
  ['    physics.step(dt * 0.5);', '    physics.step(-9.8 * Infinity);'],
  ['    camera.follow(player);', '    camera.follow(camera);'],
  ['    render(scene, camera);', '    render(scene, scene);'],
  ['    audio.mix(layers);', '    audio.mix(audio.mix);'],
  ['    ui.draw(score);', '    ui.draw(undefined.score);'],
  ['    save(state);', '    save(save(save(state)));'],
  ['    frame++;', '    frame += frame;'],
  ['    gc.collect();', '    gc.collect(gc);'],
  ['    net.sync(t);', '    net.sync(404);'],
  ['    fps.limit(60);', '    fps.limit(-1);'],
  ['    log("ok");', '    log(log(log("ok")));'],
  ['  }', '  } }'],
  ['}', L('} // TODO: 끝?', '} // TODO: done?')],
];
class Snake {
  constructor(real, radius, dir, startAng, yOff) {
    this.real = real; this.R = radius; this.dir = dir; this.ang = startAng; this.yOff = yOff;
    this.segs = []; this.alpha = 1; this.speed = 0.32;
    for (let i = 0; i < 20; i++) {
      const head = i === 0;
      const text = head ? '{ ◉_◉ } main' : CODE[i][0];
      const tex = codeCanvas(text, 'norm', head);
      const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, fog: false, side: THREE.DoubleSide, depthWrite: false });
      const mesh = new THREE.Mesh(GEO.plane, mat);
      mesh.scale.set(head ? 5 : 4.4, head ? 1.25 : 0.7, 1);
      mesh.renderOrder = 2;
      Game.scene.add(mesh);
      this.segs.push({ i, mesh, mat, tex, err: false, fake: false, fixed: false, snake: this, head, pos: new THREE.Vector3(), sx: 0, sy: 0, sr: 0, onScreen: false, pulse: 0, end: null });
    }
  }
  setMode(s, mode) {
    s.tex.dispose();
    s.tex = codeCanvas(s.head ? '{ ^_^ } main' : CODE[s.i][mode === 'err' || mode === 'fake' ? 1 : 0], mode, s.head);
    s.mat.map = s.tex; s.mat.needsUpdate = true;
  }
  update(dt, ws, t) {
    this.ang += this.dir * this.speed * dt * ws;
    for (const s of this.segs) {
      if (s.end) { s.pos.lerp(s.end, Math.min(1, dt * 3)); }
      else {
        const a = this.ang - this.dir * s.i * 0.2;
        const x = Math.cos(a) * this.R, z = Math.sin(a) * this.R;
        // 카메라 반대편이 높아지도록 기울인 원 → 플레이어 주위를 감고 도는 고리
        const cp = Game.camera.position, cl = Math.hypot(cp.x, cp.z) || 1;
        const tilt = -(x * cp.x + z * cp.z) / cl * 0.42;
        s.pos.set(x, 6.4 + this.yOff + tilt + Math.sin(a * 2 + t * 1.6 - s.i * 0.35) * 1.1, z);
      }
      s.mesh.position.copy(s.pos);
      s.mesh.quaternion.copy(Game.camera.quaternion);
      s.mat.opacity = this.alpha;
      if (s.err && !s.fixed && this.real) {
        s.pulse += dt * 6;
        const k = 1 + Math.sin(s.pulse) * 0.35 + 0.35;
        s.mat.color.setRGB(k, k * 0.85, k * 0.85);
        const pop = s.hitT > 0 ? 1.15 : 1; s.hitT = (s.hitT || 0) - dt;
        s.mesh.scale.set(4.4 * (1 + Math.sin(s.pulse) * 0.06) * pop, 0.76 * pop, 1);
        if (s.hitT > 0) s.mat.color.setRGB(3, 3, 3);
      } else if (!s.head) { s.mat.color.setRGB(1, 1, 1); }
    }
  }
  dispose() { for (const s of this.segs) { Game.scene.remove(s.mesh); s.mat.dispose(); s.tex.dispose(); } }
}
const Boss = {
  snakes: [], phase: 0, fixed: 0, total: 16, spawnT: 0, ending: false, endT: 0, transT: 0, t: 0, r: null,
  start(seed, from = 1) {
    this.dispose();
    this.r = mulberry32(seed + 555);
    this.phase = 0; this.fixed = 0; this.ending = false; this.endT = 0; this.t = 0; this.spawnT = 2; this.atkT = 3; this.misT = 7;
    this.realDir = this.r() < 0.5 ? 1 : -1;
    this.snakes = [new Snake(true, 11, this.realDir, 0, 0)];
    // 체크포인트: 이미 깬 단계의 오류 줄은 고쳐진 상태로 시작
    for (let p = 1; p < from; p++) {
      const real = this.real(), cnt = p === 3 ? 6 : 5;
      for (const s of shuffle(real.segs.filter((x) => !x.head && !x.fixed), this.r).slice(0, cnt)) { s.fixed = true; real.setMode(s, 'fixed'); }
      this.fixed += cnt;
    }
    this.startPhase(from);
  },
  dispose() { for (const s of this.snakes) s.dispose(); this.snakes = []; },
  real() { return this.snakes[0]; },
  startPhase(n) {
    this.phase = n;
    const real = this.real();
    const cnt = n === 3 ? 6 : 5;
    const cand = shuffle(real.segs.filter((s) => !s.head && !s.err && !s.fixed), this.r).slice(0, cnt);
    for (const s of cand) { s.err = true; s.hp = s.maxHp = Math.max(4, Math.round(([0, 3, 4, 5][n] + Game.D.bossHp) * Game.D.bossK)); real.setMode(s, 'err'); }
    real.speed = [0, 0.3, 0.48, 0.6][n] * Game.D.bossSpd;
    if (n === 3) { // 몸이 두 마리로 복제 — 진짜만 오류 줄이 빛남
      const swap = this.r() < 0.5;
      const fake = new Snake(false, swap ? 15 : 7.5, -this.realDir, Math.PI, swap ? 1.6 : -0.6);
      real.R = swap ? 8 : 13;
      fake.speed = 0.66 * Game.D.bossSpd;
      for (const s of shuffle(fake.segs.filter((x) => !x.head), this.r).slice(0, 6)) { s.fake = true; fake.setMode(s, 'fake'); }
      this.snakes.push(fake);
    }
    if (n > 1) { Game.cover.hp = Game.cover.max; Game.cover.broken = false; UI.toast(L('엄폐물 보강 완료', 'Cover reinforced')); } // 단계마다 엄폐물 수리
    if (n === 1) UI.hint(L('빨갛게 빛나는 "오류 줄"만 맞아요! 모두 고치면 다음 단계', 'Only the glowing red "error lines" take damage! Fix them all to advance'), 5);
    else { UI.banner('PHASE ' + n, n === 2 ? L('속도 증가! 버그를 더 많이 뱉어요', 'Speed up! It spits out more bugs') : L('복붙 오류! 진짜만 빛나요', 'Copy-paste error! Only the real one glows'), 2.2); SND.play('phase'); Game.spawnHotfix(); }
  },
  targets() { const out = []; for (const sn of this.snakes) for (const s of sn.segs) if ((s.err || s.fake) && !s.fixed) out.push(s); return out; },
  hit(s, dmg = 1) {
    if (s.fake || !s.snake.real) { s.snake.setMode(s, 'fake'); return false; }
    s.hp -= dmg; s.hitT = 0.08;
    if (s.hp > 0) return 'dmg';
    s.fixed = true; s.err = false; s.snake.setMode(s, 'fixed'); s.mat.color.setRGB(1, 1, 1); s.mesh.scale.set(4.4, 0.7, 1);
    this.fixed++;
    const left = this.real().segs.filter((x) => x.err && !x.fixed).length;
    if (left === 0) {
      if (this.phase < 3) this.transT = 1.2;
      else this.finish();
    }
    return true;
  },
  finish() { // 처치가 아니라 "정상화"
    this.ending = true; this.endT = 0;
    const real = this.real();
    for (const s of real.segs) { if (!s.fixed) real.setMode(s, 'fixed'); s.fixed = true; s.mat.color.setRGB(1, 1, 1); }
    const cam = Game.camera, R = Game.camR, U = Game.camU;
    const base = cam.position.clone().addScaledVector(Game.camF, 16);
    real.segs.forEach((s, i) => { s.end = base.clone().addScaledVector(U, 4.6 - i * 0.48).addScaledVector(R, s.head ? -0.3 : 0); s.mesh.scale.set(s.head ? 3.2 : 3.6, s.head ? 0.8 : 0.45, 1); });
    this.endBase = base;
    for (let k = 1; k < this.snakes.length; k++) this.snakes[k].fadeOut = true;
    Game.onBossSuccess();
  },
  update(dt, ws) {
    this.t += dt * ws;
    for (const sn of this.snakes) {
      if (sn.fadeOut) sn.alpha = Math.max(0, sn.alpha - dt * 1.5);
      sn.update(dt, this.ending ? 0 : ws, this.t);
    }
    if (this.ending) return;
    if (this.transT > 0) { this.transT -= dt; if (this.transT <= 0) this.startPhase(this.phase + 1); return; }
    // 머리에서 에러 패킷(예고 후, 숨으면 막힘) · 2단계부터 관통 미사일
    if (Game.canEnemiesAct()) {
      this.atkT -= dt * ws;
      if (this.atkT <= 0) { this.atkT = [0, 3.6, 2.9, 2.4][this.phase] * Game.fm; Game.enemyAttack(this.real().segs[0]); }
      if (this.phase >= 2) {
        this.misT -= dt * ws;
        if (this.misT <= 0 && Game.bugs.length < Game.maxOn()) { this.misT = (this.phase === 2 ? 8 : 6.5) * Game.fm; Game.spawnMissile(this.real().segs[0].pos.clone()); }
      }
    }
    if (this.phase >= 1) {
      this.spawnT -= dt * ws;
      if (this.spawnT <= 0 && Game.bugs.length < Game.maxOn()) {
        this.spawnT = [0, 5.5, 3.4, 3.6][this.phase] * Game.D.bossSpawn;
        const head = this.real().segs[0].pos;
        const type = this.phase === 3 && this.r() < 0.4 ? 'clone' : 'basic';
        Game.spawnBugAt(type, head.clone(), {});
      }
    }
  },
};
