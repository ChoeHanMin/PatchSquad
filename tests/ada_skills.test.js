const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const p = await b.newPage({ viewport: { width: 1280, height: 720 } });
  const errs = []; p.on('pageerror', (e) => errs.push(e.message + (e.stack||'').split('\n')[1]));
  await p.addInitScript(() => { let v = 0, c = []; window.requestAnimationFrame = (cb) => { c.push(cb); return c.length; }; performance.now = () => v; window.__step = (ms) => { v += ms; const l = c; c = []; for (const f of l) f(v); }; localStorage.setItem('patchsquad_introSeen', 'true'); localStorage.setItem('patchsquad_settings', JSON.stringify({ sound: false, quality: 'low' })); });
  await p.goto('file:///home/user/bughunter-steam/dist/index.dev.html'); await p.waitForTimeout(800);
  const out = await p.evaluate(() => {
    const Game_state = () => window.__BH.Game.state + ' ' + F.S.phase + ' fireCd=' + (F.fireCd||0).toFixed(2) + ' dt? '; let god = false; const F = window.__BH.Free, step = (n) => { for (let i = 0; i < n; i++) { if (god) F.p.hp = 100; window.__step(1000 / 30); } };
    step(10); F.start('normal'); F.startStage(3); F.intro = false; document.getElementById('freeIntro').classList.add('hidden');
    const z = F.zones[0]; F.p.pos.set(z.c.x, 0, z.c.z); F.enterZone(); F.S.waveQ = []; step(5);
    const res = [['stage', F.S.def.key + ' ' + F.S.def.name]];
    const setup = (n = 4, dist = 6, type = 'basic', spread = 0.9) => {
      for (const bb of F.bugs) bb.remove(); F.bugs = [];
      F.p.pitch = 0; const fw = F.ray().clone(); fw.y = 0; fw.normalize(); const rt = new THREE.Vector3(-fw.z, 0, fw.x);
      const list = []; for (let i = 0; i < n; i++) { const pos = F.p.pos.clone().addScaledVector(fw, dist).addScaledVector(rt, (i - (n - 1) / 2) * spread); const bb = F.spawnBug(type, pos); bb.age = 1; bb.hp = bb.maxHp = 60; list.push(bb); } return list;
    };
    F.select(3); const m = F.cur(); res.push(['member', m.d.key + ' ' + m.d.kind]);
    let bugs = setup(4, 7, 'basic', 0.8); F.p.pitch = -0.08; const hp0 = bugs.map((x) => x.hp); const a0 = m.ammo;
    F.mouse = true; step(2); F.mouse = false; step(2);
    res.push(['런처 1발', `피해 ${bugs.filter((x, i) => x.hp < hp0[i]).length}/4 · 탄 ${a0}→${m.ammo}`]);
    m.cd.shift = 0; m.cd.e = 0; m.ult = 100; F.p.hp = 50;
    let p0 = F.p.pos.clone(); F.skill('shift'); step(10);
    res.push(['Shift 캐시 대시', `이동 ${p0.distanceTo(F.p.pos).toFixed(1)}m · 회복 장판 ${F.heals.length}`]);
    F.p.pos.copy(F.heals[0].pos); const h0 = F.p.hp; step(30); res.push(['  회복', `${h0.toFixed(0)} → ${F.p.hp.toFixed(0)}`]); god = true;
    bugs = setup(3, 8, 'basic', 2); const hp1 = bugs.map((x) => x.hp); F.skill('e'); step(90);
    res.push(['state', Game_state()]); res.push(['E 테스트 드론', `드론 ${!!F.drone} · 피해 ${bugs.filter((x, i) => !x.alive || x.hp < hp1[i]).length}/3`]);
    const dt0 = F.drone.t, st0 = F.S.t; step(30); res.push(['drone t', dt0.toFixed(2) + ' -> ' + (F.drone && F.drone.t.toFixed(2)) + ' S.t ' + st0.toFixed(2) + '->' + F.S.t.toFixed(2)]); step(200); res.push(['  8초 뒤', `드론 ${!!F.drone} ${F.drone && F.drone.t.toFixed(2)} ` + Game_state() + F.S.t.toFixed(2)]);
    bugs = setup(5, 10, 'basic', 1.6); F.p.pitch = -0.15; const hp2 = bugs.map((x) => x.hp); F.skill('q'); step(80);
    res.push(['Q 회귀 테스트', `피해 ${bugs.filter((x, i) => !x.alive || x.hp < hp2[i]).length}/5 · 남은 폭발 ${F.blasts.length}`]);
    bugs = setup(1, 6, 'mini'); F.cur().ammo = 6; F.p.pitch = -0.05; F.mouse = true; step(2); F.mouse = false;
    res.push(['약점: 미니 ← 런처', `${bugs[0].weakShown || !bugs[0].alive}`]);
    { const mm = F.cur(); mm.ammo = 6; mm.reloadT = 0; F.fireCd = 0; F.mouse = true; const tr = []; for (let k = 0; k < 20; k++) { step(1); tr.push(mm.ammo + ':' + F.fireCd.toFixed(2) + ':' + mm.reloadT.toFixed(1)); } F.mouse = false; res.push(['trace', tr.join(' ')]); } F.select(0); F.cycle(-1); res.push(['cycle -1 from 0', F.member]);
    return res;
  });
  for (const [k, v] of out) console.log(String(k).padEnd(20), v);
  console.log('errors', errs); await b.close();
})();
