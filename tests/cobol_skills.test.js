// 코볼 (2장): 자유 작전 리뷰 빔 연쇄 + 스킬 3개, 레일 머지 충돌·지원 종료·메모리 누수 규칙
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const p = await b.newPage({ viewport: { width: 1280, height: 720 } });
  const errs = []; p.on('pageerror', (e) => errs.push(e.message + (e.stack || '').split('\n')[1]));
  await p.addInitScript(() => { let v = 0, c = []; window.requestAnimationFrame = (cb) => { c.push(cb); return c.length; }; performance.now = () => v; window.__step = (ms) => { v += ms; const l = c; c = []; for (const f of l) f(v); }; localStorage.setItem('patchsquad_introSeen', 'true'); localStorage.setItem('patchsquad_ch2IntroSeen', 'true'); localStorage.setItem('patchsquad_cobolSeen', 'true'); localStorage.setItem('patchsquad_settings', JSON.stringify({ sound: false, quality: 'low' })); });
  await p.goto('file:///home/user/bughunter-steam/dist/index.dev.html'); await p.waitForTimeout(800);
  const out = await p.evaluate(() => {
    const B = window.__BH, F = B.Free, G = B.Game; let god = true;
    const step = (n) => { for (let i = 0; i < n; i++) { if (G.state === 'tutor') B.UI.tutorClose(); if (god && F.p) F.p.hp = 100; window.__step(1000 / 30); } };
    const res = [];
    // ---- 레일 규칙 ----
    step(5); G.newRun(false, 'normal', 2); B.Story.finish(); step(200); for (let i = 0; i < 5; i++) if (G.state === 'tutor') B.UI.tutorClose(); G.state = 'play';
    const at = (k) => G.camera.position.clone().addScaledVector(G.camF, 9).addScaledVector(G.camR, k);
    G.spawnEntry('merge'); step(2); const pair = G.bugs.filter((x) => x.type === 'merge');
    const st = () => pair.map((x) => `${x.side} alive=${x.alive} down=${(x.downT || 0).toFixed(1)} hp=${x.hp}`).join(' | ');
    res.push(['  쌍 생성', st() + ' state ' + G.state]);
    const m0 = G.S.fixed; G.damage(pair[0], 99, false, false, 'rifle'); res.push(['  한 마리 고친 직후', st()]); step(120); res.push(['  4초 뒤', st() + ' tutQ ' + B.UI.tutQ.length]);
    res.push(['머지: 한 마리만 고치면 2초 뒤 부활', `${pair[0].alive && !pair[0].downT && pair[0].hp > 0}`]);
    G.damage(pair[0], 99, false, false, 'rifle'); step(10); G.damage(pair[1], 99, false, false, 'beam');
    res.push(['머지: 2초 안에 둘 다 → 둘 다 고침', `${!pair[0].alive && !pair[1].alive} fixed +${G.S.fixed - m0}`]);
    const dep = G.spawnBugAt('deprecated', at(0), {}); dep.hp = 100; G.damage(dep, 10, false, false, 'rifle'); const a1 = 100 - dep.hp; G.damage(dep, 10, false, false, 'beam'); const a2 = 100 - dep.hp - a1;
    res.push(['지원 종료: 연사 10 → / 빔 10 →', `${a1} / ${a2}`]);
    const lk = G.spawnBugAt('leak', G.camera.position.clone().addScaledVector(G.camF, 40), {}); const hp0 = lk.maxHp; const n0 = G.bugs.length; step(30 * 6);
    res.push(['메모리 누수: 6초 뒤 최대 체력', `${hp0} → ${lk.maxHp} (크기 ${(lk.grow || 0).toFixed(2)}, started ${G.S.started}, alive ${lk.alive})`]);
    step(30 * 4); res.push(['  10초 뒤 터짐', `alive ${lk.alive}, 작은 버그 +${G.bugs.filter((x) => x.type === 'mini' && x.alive).length}`]);
    // ---- 자유 작전 ----
    G.toTitle(); F.start('normal', false, 2); B.Story.finish(); F.intro = false; document.getElementById('freeIntro').classList.add('hidden'); G.state = 'free';
    const z = F.zones[0]; F.p.pos.set(z.c.x, 0, z.c.z); F.enterZone(); F.S.waveQ = []; step(5);
    F.select(4); const m = F.cur(); res.push(['분대원 5', m.d.key + ' ' + m.d.kind + ' / squadN ' + F.squadN()]);
    const setup = (n, dist, spread) => { for (const bb of F.bugs) bb.remove(); F.bugs = []; F.p.pitch = 0; const fw = F.ray().clone(); fw.y = 0; fw.normalize(); const rt = new THREE.Vector3(-fw.z, 0, fw.x); const l = []; for (let i = 0; i < n; i++) { const bb = F.spawnBug('basic', F.p.pos.clone().addScaledVector(fw, dist).addScaledVector(rt, (i - (n - 1) / 2) * spread)); bb.age = 1; bb.hp = bb.maxHp = 60; l.push(bb); } return l; };
    let bugs = setup(3, 8, 2.5); const h0 = bugs.map((x) => x.hp); F.p.pitch = -0.03; F.mouse = true; step(15); F.mouse = false;
    res.push(['빔 0.5초: 피해 받은 버그 (연쇄)', `${bugs.filter((x, i) => x.hp < h0[i]).length}/3`]);
    m.cd.shift = 0; m.cd.e = 0; m.ult = 100;
    const start = F.p.pos.clone(); step(70); F.keys.KeyW = true; step(30); F.keys.KeyW = false; F.p.hp = 40; god = false; const moved = start.distanceTo(F.p.pos);
    F.skill('shift'); step(2); god = true;
    res.push(['⇧ 롤백 스텝', `걸은 거리 ${moved.toFixed(1)}m → 되돌아온 뒤 ${start.distanceTo(F.p.pos).toFixed(1)}m · 안정성 ${Math.round(F.p.hp)}`]);
    bugs = setup(4, 10, 1.5); F.skill('e'); step(2);
    res.push(['E 코드 리뷰', `표시 ${bugs.filter((x) => x.reviewT > 0).length}/4`]);
    const rv = bugs[0]; const before = rv.hp; rv.damage(10, false, 'rifle', null); res.push(['  리뷰된 버그 피해 10 →', `${(before - rv.hp).toFixed(1)}`]);
    bugs = setup(4, 6, 1.5); F.skill('q'); step(2);
    res.push(['Q 레거시 마이그레이션', `정지 ${bugs.filter((x) => x.freezeT > 4).length}/4`]);
    return res;
  });
  for (const [k, v] of out) console.log(String(k).padEnd(30), v);
  console.log('errors', errs.slice(0, 4)); await b.close();
})();
