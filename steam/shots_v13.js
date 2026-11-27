// 스토어 스크린샷 v1.3: 에이다·엄폐 종류·자유 작전·인트로 (1920×1080, 영어)
// 사용: node steam/shots_v13.js  → steam/screenshots_v13/
const { chromium } = require('playwright');
const fs = require('fs');
const OUT = __dirname + '/screenshots_v13/';
(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  const errs = []; p.on('pageerror', (e) => errs.push(e.message));
  await p.addInitScript(() => {
    let v = 0, c = []; window.requestAnimationFrame = (cb) => { c.push(cb); return c.length; }; performance.now = () => v;
    window.__step = (ms) => { v += ms; const l = c; c = []; for (const f of l) { try { f(v); } catch (e) { console.error(e); } } };
    localStorage.setItem('patchsquad_lang', JSON.stringify('en')); localStorage.setItem('patchsquad_introSeen', 'true'); localStorage.setItem('patchsquad_adaSeen', 'true');
    localStorage.setItem('patchsquad_tutAsked', 'true'); localStorage.setItem('patchsquad_pairTip', 'true');
    localStorage.setItem('patchsquad_settings', JSON.stringify({ sound: false, quality: 'high' }));
  });
  await p.goto('file:///home/user/bughunter-steam/dist/index.dev.html'); await p.waitForTimeout(1000);
  const step = (n) => p.evaluate((n) => { for (let i = 0; i < n; i++) window.__step(1000 / 30); }, n);
  await step(10);
  // 레일: 스테이지 st, 엄폐 지점 ci 로 가서 봇이 싸우다가, 조건을 만족하는 가장 바쁜 순간을 찍음
  const rail = async (file, st, ci, member, want, maxF = 900) => {
    await p.evaluate(([st]) => { const G = window.__BH.Game; window.__BH.UI.only(); G.newRun(false, 'normal'); G.run.stage = st; G.startStage(st); }, [st]);
    let best = -1;
    for (let f = 0; f < maxF; f++) {
      const r = await p.evaluate(([ci, member, want, f]) => {
        const B = window.__BH, G = B.Game, UI = B.UI, S = G.S;
        if (G.state === 'tutor') UI.tutorClose();
        if (B.Story.active) B.Story.finish();
        if (S && S.phase === 'fight' && S.ci < ci) { S.ci = ci; S.u = S.covers[ci].u; G.loadWave(); }
        G.run.stab = Math.max(G.run.stab, 80); if (G.cover) G.cover.hp = G.cover.max; if (f === 60) B.World.fillAll();
        if (G.memberUnlocked(member)) G.weapon = member;
        const tg = G.bugs.filter((x) => x.alive && x.onScreen && x.hostile && (x.type !== 'ghost' || x.vis)).sort((a, c) => c.sr - a.sr)[0];
        if (tg) { G.ret.x = tg.sx; G.ret.y = tg.sy; }
        const cyc = f % 70, shoot = want === 'out' ? cyc < 60 : cyc < 25;
        G.ptr.down = !!tg && shoot && S.phase === 'fight';
        window.__step(1000 / 30);
        const n = G.bugs.filter((x) => x.alive && x.onScreen && x.hostile).length;
        const okState = G.state === 'play' && S.phase === 'fight' && S.ci === ci && (want === 'out' ? G.outK > 0.9 : G.outK < 0.05) && f > 120;
        const sayOn = !document.getElementById('say').classList.contains('hidden');
        return { score: okState && !sayOn ? n + (G.attacks.length ? 2 : 0) + (G.blastFx ? 2 : 0) : -1, done: G.state !== 'play' && G.state !== 'tutor' };
      }, [ci, member, want, f]);
      if (r.score > best && r.score >= 3) { best = r.score; await p.screenshot({ path: OUT + file, type: 'png' }); }
      if (r.done) break;
    }
    console.log(file, 'best', best);
  };
  await rail('01_ada_launcher_lowwall.png', 3, 1, 3, 'out');
  await rail('02_ada_crouch_lowwall.png', 3, 1, 3, 'in');
  await rail('03_pillar_lean.png', 1, 0, 1, 'out');
  await rail('04_pillar_hide.png', 2, 2, 2, 'in');
  // 자유 작전: 에이다 드론 + 회귀 테스트
  await p.evaluate(() => { const B = window.__BH, F = B.Free; B.Game.toTitle(); B.UI.only(); F.start('normal'); F.startStage(3); F.intro = false; document.getElementById('freeIntro').classList.add('hidden'); B.Game.state = 'free'; F.select(3); const z = F.zones[0]; F.p.pos.set(z.c.x, 0, z.c.z + 6); });
  let fb = -1;
  for (let f = 0; f < 700; f++) {
    const r = await p.evaluate((f) => {
      const B = window.__BH, F = B.Free, G = B.Game;
      if (F.intro) { F.intro = false; document.getElementById('freeIntro').classList.add('hidden'); }
      if (G.state !== 'free') return { s: -1 };
      F.p.hp = 100; const m = F.cur();
      let best = null, bd = 1e9; for (const bb of F.bugs) if (bb.alive && bb.role !== 'item' && bb.hittable()) { const d = bb.pos.distanceTo(F.p.pos); if (d < bd) { bd = d; best = bb.hitPos(); } }
      if (F.S.phase === 'travel') { const z = F.zones[F.S.zi]; if (z) { const dx = z.c.x - F.p.pos.x, dz = z.c.z - F.p.pos.z; F.p.yaw = Math.atan2(-dx, -dz); F.p.pitch = 0; F.keys.KeyW = true; } }
      else F.keys.KeyW = false;
      if (best) { const c = G.camera.position, dx = best.x - c.x, dy = best.y - c.y, dz = best.z - c.z; F.p.yaw = Math.atan2(-dx, -dz); F.p.pitch = Math.atan2(dy, Math.hypot(dx, dz)) - 0.03; F.mouse = true; } else F.mouse = false;
      if (F.S.phase === 'fight' && f % 90 === 30) { m.cd.e = 0; F.skill('e'); }
      if (F.S.phase === 'fight' && f % 150 === 100) { m.ult = 100; F.skill('q'); }
      window.__step(1000 / 30);
      const n = F.bugs.filter((x) => x.alive && x.role !== 'item').length;
      return { s: F.S.phase === 'fight' && F.drone && F.caps && F.caps.length ? n + F.caps.length : -1 };
    }, f);
    if (r.s > fb && r.s >= 5) { fb = r.s; await p.screenshot({ path: OUT + '05_freeops_ada_drone.png' }); }
  }
  console.log('free best', fb);
  // 인트로: 안정성 CRASH 카드, 분대 소개 카드
  await p.evaluate(() => { const B = window.__BH; B.Free.stop && B.Free.stop(); B.Game.toTitle(); B.Story.intro(() => {}); });
  const goCard = async (k) => { await p.evaluate((k) => { const S = window.__BH.Story; S.i = k - 1; S.readyT = 0; S.typing = null; S.next(); if (S.typing) S.typing(); }, k); };
  await goCard(4); await step(90); await p.screenshot({ path: OUT + '06_intro_crash.png' });
  await goCard(5); await step(60); await p.screenshot({ path: OUT + '07_intro_squad.png' });
  await p.evaluate(() => window.__BH.Story.finish());
  await p.evaluate(() => { const B = window.__BH; B.Story.play(B.STORY.adaJoin, () => {}); });
  await step(40); await p.evaluate(() => { const S = window.__BH.Story; if (S.typing) S.typing(); }); await step(5);
  await p.screenshot({ path: OUT + '08_ada_joins.png' });
  console.log('errors', errs.slice(0, 5));
  await b.close();
})();
