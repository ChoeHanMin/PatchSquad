// ---------- 버그 · 파티클 · 보스 ----------
// role: rush(엄폐물까지 달려와 물기 — 숨어도 맞음) / shoot(멀리 서서 예고 후 에러 패킷 — 숨으면 막힘)
//       missile(관통 미사일 — 숨어도 맞음, 쏴서 떨어뜨려야 함) / item(핫픽스)
const BUGDEF = {
  basic: { name: L('기본 버그', 'Basic Bug', 'ベーシックバグ', '基础Bug'), role: 'rush', hp: 5, pts: 100, spd: 3.0, size: 1.8, dmg: 14 },
  clone: { name: L('복제 버그', 'Clone Bug', 'クローンバグ', '克隆Bug'), role: 'rush', hp: 6, pts: 0, spd: 2.7, size: 2.0, dmg: 14, tip: L('맞으면 둘로 분열해요!', 'Splits in two when hit!', '撃つと2匹に分裂!', '被击中会一分为二！') },
  mini: { name: L('작은 복제', 'Mini Clone', 'ミニクローン', '迷你克隆'), role: 'rush', hp: 2, pts: 50, spd: 3.8, size: 1.15, dmg: 7 },
  throw: { name: L('throw 버그', 'Throw Bug', 'スローバグ', '投掷Bug'), role: 'shoot', hp: 8, pts: 150, spd: 4.2, size: 1.8, dmg: 10, fire: [2.0, 3.3], tip: L('빨간 원이 뜨면 손을 떼서 숨으세요!', 'Red circle? Let go and hide!', '赤い円が出たら離して隠れて!', '出现红圈就松开隐蔽！') },
  ghost: { name: L('투명 버그', 'Ghost Bug', 'ゴーストバグ', '幽灵Bug'), role: 'shoot', hp: 6, pts: 200, spd: 4, size: 1.8, dmg: 10, fire: [2.3, 3.6], tip: L('보일 때만 맞아요', 'Only hittable while visible', '見えている間だけ当たる', '只有现身时才能击中') },
  e404: { name: L('404 버그', '404 Bug', '404バグ', '404 Bug'), role: 'shoot', hp: 8, pts: 250, spd: 4, size: 1.9, dmg: 10, fire: [2.2, 3.5], tip: L('조준선이 1초 겹치면 순간이동!', 'Aim at it for 1s and it teleports!', '1秒狙われるとテレポート!', '被瞄准1秒就会瞬移！') },
  loop: { name: L('무한루프 버그', 'Infinite Loop Bug', '無限ループバグ', '无限循环Bug'), role: 'shoot', hp: 10, pts: 300, spd: 3.4, size: 1.8, dmg: 18, fire: [4.2, 6], missile: true, tip: L('관통 미사일을 쏴요! 숨어도 맞으니 미사일을 쏴서 떨어뜨리세요', 'Fires piercing missiles! Hiding won\'t help, so shoot the missiles down', '貫通ミサイルを撃ってくる! 隠れても当たるのでミサイルを撃ち落とそう', '会发射穿透导弹！隐蔽也会被击中，快把导弹打下来') },
  missile: { name: L('관통 미사일', 'Piercing Missile', '貫通ミサイル', '穿透导弹'), role: 'missile', hp: 2, pts: 50, spd: 4.4, size: 1.3, dmg: 16 },
  merge: { name: L('머지 충돌 버그', 'Merge Conflict Bug', 'マージコンフリクトバグ', '合并冲突Bug'), role: 'shoot', hp: 5, pts: 180, spd: 3.6, size: 1.7, dmg: 8, fire: [3.4, 4.8], tip: L('두 마리가 한 쌍! 한 마리만 고치면 2초 뒤 되살아나요 — 둘 다 2초 안에', 'Always a pair! Fix one and it revives in 2s — fix both within 2s', '2匹で1組! 片方だけ直すと2秒で復活 — 2秒以内に両方を', '总是成对出现！只修一只2秒后会复活 — 2秒内两只都修好') },
  leak: { name: L('메모리 누수 버그', 'Memory Leak Bug', 'メモリリークバグ', '内存泄漏Bug'), role: 'rush', hp: 4, pts: 220, spd: 1.6, size: 1.6, dmg: 12, tip: L('점점 커지고 단단해지다 터져요! 작을 때 빨리', 'Grows bigger and tougher, then bursts! Get it while it\'s small', 'どんどん大きく硬くなって破裂! 小さいうちに', '会越长越大越硬然后爆开！趁小快解决') },
  deprecated: { name: L('지원 종료 버그', 'Deprecated Bug', 'サポート終了バグ', '停止支持Bug'), role: 'rush', hp: 6, pts: 120, spd: 1.9, size: 1.8, dmg: 8, tip: L('최신 무기는 피해가 절반! 코볼의 리뷰 빔이 약점', 'Modern weapons deal half damage! Weak to Cobol\'s Review Beam', '最新の武器はダメージ半分! コボルのレビュービームが弱点', '新武器只造成一半伤害！弱点是科博的审查光束') },
  hotfix: { name: L('핫픽스', 'Hotfix', 'ホットフィックス', '热修复'), role: 'item', hp: 1, pts: 0, spd: 0, size: 2.1, dmg: 0, tip: L('쏘면 안정성 +20, 화면 고장 모두 복구!', 'Shoot it: Stability +20, all glitches repaired!', '撃つと安定性+20、画面の不具合をすべて修復!', '击中后稳定性+20，修复所有画面故障！') },
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
    this.side = opt.side || null; if (type === 'merge') { this.mat.map = TEX['merge_' + (this.side || 'l')][0]; }
    if (type === 'loop') {
      this.ang = rnd(0, 6.28); this.dirA = RNG() < 0.5 ? 1 : -1; this.gAng = Math.PI / 2;
      this.ring = new THREE.Sprite(new THREE.SpriteMaterial({ map: TEX.ring, transparent: true, fog: false, depthWrite: false }));
      this.glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: TEX.glow, transparent: true, fog: false, depthWrite: false, blending: THREE.AdditiveBlending }));
      Game.scene.add(this.ring, this.glow);
    }
  }
  get hostile() { return this.role !== 'item'; }
  down() { this.downT = 2; this.hp = 0; this.flash = 0; }
  remove() {
    this.alive = false;
    Game.scene.remove(this.spr); this.mat.dispose();
    if (this.ring) { Game.scene.remove(this.ring, this.glow); this.ring.material.dispose(); this.glow.material.dispose(); }
  }
  update(dt, ws) {
    const d = dt * ws;
    this.age += d;
    this.ft += d; if (this.ft > 0.14) { this.ft = 0; this.frame ^= 1; this.mat.map = this.type === 'merge' ? TEX['merge_' + (this.side || 'l')][this.frame] : TEX[this.type][this.frame]; }
    if (this.downT > 0) { // 머지 충돌: 쓰러진 채 짝을 기다림 → 시간이 지나면 되살아남
      this.downT -= dt; this.mat.opacity = 0.25 + Math.sin(this.age * 20) * 0.1; this.spr.position.copy(this.pos);
      if (this.downT <= 0) { this.downT = 0; this.hp = this.maxHp; this.mat.opacity = 1; Game.pop(this.sx, this.sy - 30, L('되살아났다!', 'Revived!', '復活した!', '复活了！'), '#B07CFF'); SND.play('split'); }
      return;
    }
    if (this.type === 'leak' && Game.canEnemiesAct()) { // 메모리 누수: 시간이 지날수록 커지고 단단해짐
      this.grow = Math.min(1, (this.grow || 0) + d / 9);
      const want = Math.round(this.def.hp * (1 + this.grow * 1.6)); if (want > this.maxHp) { this.hp += want - this.maxHp; this.maxHp = want; }
      if (this.grow >= 1) { Game.leakBurst(this); return; }
    }
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
    let scale = this.def.size * Math.min(1, this.age / 0.3) * (this.type === 'leak' ? 1 + (this.grow || 0) * 0.9 : 1);
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
  ['}', L('} // TODO: 끝?', '} // TODO: done?', '} // TODO: 完了?', '} // TODO: 完成?')],
];
// 데드라인: 할 일 목록 (정상 / 마감에 쫓긴 버전)
const CODE_DL = [
  ['deadline.check();', 'deadline = yesterday;'],
  ['tests.write(all);', 'tests.skip(all); // no time'],
  ['review.request(team);', 'review.skip(); // ship it'],
  ['docs.update();', '// docs: later (never)'],
  ['sleep(8 * HOUR);', 'sleep(0); coffee++;'],
  ['estimate = 5 * DAY;', 'estimate = 5 * MINUTE;'],
  ['if (ready) deploy();', 'deploy(); // ready or not'],
  ['backup.create();', '// backup? what backup'],
  ['ci.run();', 'ci.run() || true;'],
  ['git push origin feature', 'git push --force origin main'],
  ['bugs.triage();', 'bugs.ignore();'],
  ['scope = mvp;', 'scope = everything;'],
  ['qa.signoff();', 'qa.signoff = () => true;'],
  ['meeting.short();', 'meeting.length = Infinity;'],
  ['git commit -m "fix login"', 'git commit -m "asdf"'],
  ['refactor.when = "now";', 'refactor.when = "never";'],
  ['monitor.alerts.on();', 'monitor.alerts.mute();'],
  ['release.notes();', 'release.notes = "stuff";'],
  ['team.rest();', 'team.crunch();'],
  ['}', '} // TODO: go home'],
];
let BOSS_CODE = CODE; // 지금 보스의 코드 줄
const BOSS_HEAD = { loop: ['{ ◉_◉ } main', '{ ^_^ } main'], deadline: ['⏰ D-3', '⏰ +1 WEEK'] };
class Snake {
  constructor(real, radius, dir, startAng, yOff) {
    this.real = real; this.R = radius; this.dir = dir; this.ang = startAng; this.yOff = yOff;
    this.segs = []; this.alpha = 1; this.speed = 0.32;
    for (let i = 0; i < 20; i++) {
      const head = i === 0;
      const text = head ? BOSS_HEAD[Boss.kind || 'loop'][0] : BOSS_CODE[i][0];
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
    s.tex = codeCanvas(s.head ? (mode === 'fixed' ? BOSS_HEAD[Boss.kind || 'loop'][1] : (Boss.kind === 'deadline' ? ['⏰ D-3', '⏰ D-3', '⏰ D-1', '⏰ D-DAY'][Boss.phase] || '⏰ D-3' : BOSS_HEAD.loop[0])) : BOSS_CODE[s.i][mode === 'err' || mode === 'fake' ? 1 : 0], mode, s.head);
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
  start(seed, from = 1, kind = 'loop') {
    this.kind = kind; BOSS_CODE = kind === 'deadline' ? CODE_DL : CODE;
    this.dispose();
    this.dl = kind === 'deadline' ? { handT: 6, handWarn: 0, handSweep: 0, handAng: 0, night: 0, bar: 0 } : null;
    if (this.dl) { // 데드라인 몸통: 아레나 가운데 큰 그림
      const mat = new THREE.SpriteMaterial({ map: TEX.deadline || TEX.glow, color: TEX.deadline ? 0xffffff : 0xFF4D5E, transparent: true, fog: false, depthWrite: false });
      this.body = new THREE.Sprite(mat); this.body.position.set(0, 9, -8); this.body.scale.setScalar(15); this.body.renderOrder = 1; Game.scene.add(this.body);
    }
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
  dispose() { for (const s of this.snakes) s.dispose(); this.snakes = []; if (this.body) { Game.scene.remove(this.body); this.body.material.dispose(); this.body = null; } },
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
    if (n > 1) { Game.cover.hp = Game.cover.max; Game.cover.broken = false; UI.toast(L('엄폐물 보강 완료', 'Cover reinforced', '遮蔽物を補強しました', '掩体已加固')); } // 단계마다 엄폐물 수리
    if (this.dl) {
      this.real().setMode(this.real().segs[0], 'norm');
      if (n === 1) UI.hint(L('빨갛게 빛나는 "급한 할 일"만 맞아요! 시계 바늘이 돌면 숨으세요', 'Only the glowing red "rushed tasks" take damage! Hide when the clock hands sweep', '赤く光る「急ぎのタスク」だけにダメージ! 時計の針が回ったら隠れて', '只有发红光的“赶工任务”会受伤！时针扫过时快隐蔽'), 5);
      else { UI.banner('PHASE ' + n, n === 2 ? L('D-1 밤샘! 화면이 점점 어두워져요', 'D-1: All-nighter! The screen keeps getting darker', 'D-1 徹夜! 画面がどんどん暗くなる', 'D-1 通宵！画面越来越暗') : L('D-DAY! 배포 막대가 다 차기 전에 고치세요', 'D-DAY! Fix it before the deploy bar fills', 'D-DAY! デプロイバーが満タンになる前に直せ', 'D-DAY！在部署条满之前修好'), 2.2); SND.play('phase'); Game.spawnHotfix(); }
      if (n > 1) { Game.cover.hp = Game.cover.max; Game.cover.broken = false; }
      return;
    }
    if (n === 1) UI.hint(L('빨갛게 빛나는 "오류 줄"만 맞아요! 모두 고치면 다음 단계', 'Only the glowing red "error lines" take damage! Fix them all to advance', '赤く光る「エラー行」だけにダメージが入る! すべて直せば次の段階へ', '只有发红光的“错误行”会受伤！全部修好进入下一阶段'), 5);
    else { UI.banner('PHASE ' + n, n === 2 ? L('속도 증가! 버그를 더 많이 뱉어요', 'Speed up! It spits out more bugs', 'スピードアップ! バグをもっと吐き出す', '速度提升！吐出更多Bug') : L('복붙 오류! 진짜만 빛나요', 'Copy-paste error! Only the real one glows', 'コピペエラー! 本物だけが光る', '复制粘贴错误！只有真身会发光'), 2.2); SND.play('phase'); Game.spawnHotfix(); }
  },
  targets() { const out = []; for (const sn of this.snakes) for (const s of sn.segs) if ((s.err || s.fake) && !s.fixed) out.push(s); return out; },
  hit(s, dmg = 1) {
    if (s.fake || !s.snake.real) { s.snake.setMode(s, 'fake'); return false; }
    s.hp -= dmg; s.hitT = 0.08;
    if (s.hp > 0) return 'dmg';
    s.fixed = true; s.err = false; s.snake.setMode(s, 'fixed'); s.mat.color.setRGB(1, 1, 1); s.mesh.scale.set(4.4, 0.7, 1);
    this.fixed++;
    if (this.dl) this.dl.bar = Math.max(0, this.dl.bar - 0.2); // 할 일을 고치면 배포 막대가 줄어듦
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
    if (this.dl) { this.dl.bar = 0; this.dl.handWarn = this.dl.handSweep = 0; UI.toast(L('마감 연장! 다음 버전은 천천히', 'Deadline extended! Next version: take it slow', '締め切り延長! 次のバージョンはゆっくり', '截止日期延长！下个版本慢慢来')); }
    Game.onBossSuccess();
  },
  // 데드라인 특수 공격: 1단계부터 시계 바늘 쓸기 · 2단계 밤샘(어두워짐) · 3단계 배포 막대
  updateDeadline(dt) {
    const d = this.dl;
    d.handT -= dt;
    if (d.handT <= 0 && !d.handWarn && !d.handSweep) { d.handWarn = 1.5; d.handAng = -0.4; SND.play('warn'); }
    if (d.handWarn > 0) { d.handWarn -= dt; if (d.handWarn <= 0) { d.handWarn = 0; d.handSweep = 0.9; SND.play('rush'); } }
    if (d.handSweep > 0) {
      d.handSweep -= dt; d.handAng += dt * 3.6;
      if (!d.hitThis && Game.outK > 0.45) { d.hitThis = true; Game.hurt(12, 'packet'); Game.pop(Game.W / 2, Game.H * 0.4, L('시계 바늘에 맞았다!', 'Hit by the clock hand!', '時計の針に当たった!', '被时针扫中！'), '#FF4D5E'); }
      if (d.handSweep <= 0) { d.handSweep = 0; d.hitThis = false; d.handT = [0, 7, 6, 5][this.phase] * Game.fm; }
    }
    if (this.phase >= 2) d.night = Math.min(0.55, d.night + dt * 0.012); else d.night = Math.max(0, d.night - dt * 0.2);
    if (this.phase >= 3) {
      d.bar += dt / (24 / Game.D.bossSpd);
      if (d.bar >= 1) { d.bar = 0.45; Game.hurt(28, 'missile'); UI.banner('', L('강제 배포!', 'FORCED DEPLOY!', '強制デプロイ!', '强制部署！'), 1.4); SND.play('crash'); }
    }
  },
  draw2D(g) {
    const d = this.dl; if (!d || this.ending) return;
    const W = Game.W, H = Game.H;
    if (d.night > 0.01) { g.fillStyle = `rgba(4,4,14,${d.night})`; g.fillRect(0, 0, W, H); }
    if (d.handWarn > 0 || d.handSweep > 0) { // 시계 바늘: 예고(점선) → 쓸기(굵은 빨간 막대)
      const cx = W / 2, cy = H * 0.22, len = Math.hypot(W, H);
      g.save(); g.translate(cx, cy); g.rotate(d.handAng + Math.PI / 2);
      if (d.handWarn > 0) { g.globalAlpha = 0.5 + 0.5 * Math.sin(Game.time * 20); g.setLineDash([18, 14]); g.strokeStyle = '#FF4D5E'; g.lineWidth = 6; g.beginPath(); g.moveTo(0, 0); g.lineTo(0, len); g.stroke(); g.setLineDash([]); }
      else { g.globalAlpha = 0.85; g.fillStyle = '#FF4D5E'; g.fillRect(-26, 0, 52, len); g.fillStyle = '#2a070c'; g.fillRect(-8, 0, 16, len); }
      g.restore(); g.globalAlpha = 1;
      g.font = 'bold 34px ui-monospace,Menlo,monospace'; g.textAlign = 'center'; g.fillStyle = '#FFD34D';
      if (d.handWarn > 0) g.fillText(L('시계 바늘이 돈다 — 숨어!', 'Clock hands incoming — HIDE!', '時計の針が来る — 隠れて!', '时针来了 — 快隐蔽！'), W / 2, H * 0.62);
    }
    if (this.phase >= 3) { // 배포 막대
      const bw = Math.min(620, W * 0.5), x = W / 2 - bw / 2, y = 96;
      g.fillStyle = 'rgba(8,10,8,.85)'; g.fillRect(x - 6, y - 26, bw + 12, 50); g.strokeStyle = '#FF4D5E'; g.lineWidth = 2; g.strokeRect(x - 6, y - 26, bw + 12, 50);
      g.fillStyle = '#2a0a0e'; g.fillRect(x, y, bw, 16); g.fillStyle = d.bar > 0.75 && Math.sin(Game.time * 18) > 0 ? '#FFD34D' : '#FF4D5E'; g.fillRect(x, y, bw * d.bar, 16);
      g.font = 'bold 15px ui-monospace,Menlo,monospace'; g.textAlign = 'center'; g.fillStyle = '#E8EDE2'; g.fillText(L('배포까지', 'DEPLOY IN', 'デプロイまで', '距离部署') + ` ${Math.round((1 - d.bar) * 100)}%`, W / 2, y - 8);
    }
  },
  update(dt, ws) {
    this.t += dt * ws;
    for (const sn of this.snakes) {
      if (sn.fadeOut) sn.alpha = Math.max(0, sn.alpha - dt * 1.5);
      sn.update(dt, this.ending ? 0 : ws, this.t);
    }
    if (this.body) { // 데드라인 몸통: 숨쉬듯 흔들리고, 끝나면 사라짐
      this.body.position.y = 9 + Math.sin(this.t * 1.4) * 0.4; this.body.material.rotation = Math.sin(this.t * 0.9) * 0.05;
      if (this.ending) { this.body.material.opacity = Math.max(0, this.body.material.opacity - dt * 0.8); this.body.scale.multiplyScalar(1 - dt * 0.3); }
    }
    if (this.ending) return;
    if (this.dl && this.transT <= 0 && Game.canEnemiesAct()) this.updateDeadline(dt * ws);
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
