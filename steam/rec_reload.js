// 에이다 장전 모션 영상: 자유 작전 1인칭으로 쏘기 → R 장전 → 다시 쏘기 (게임 시간을 1/30초씩 진행하며 프레임 녹화)
const { chromium } = require('playwright');
const fs = require('fs');
const OUT = __dirname + '/rec_reload/';
(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const p = await b.newPage({ viewport: { width: 1280, height: 720 } });
  const errs = []; p.on('pageerror', (e) => errs.push(e.message));
  await p.addInitScript(() => { let v = 0, c = []; window.requestAnimationFrame = (cb) => { c.push(cb); return c.length; }; performance.now = () => v; window.__step = (ms) => { v += ms; const l = c; c = []; for (const f of l) f(v); }; localStorage.setItem('patchsquad_lang', JSON.stringify('ko')); localStorage.setItem('patchsquad_introSeen', 'true'); localStorage.setItem('patchsquad_settings', JSON.stringify({ sound: false, quality: 'high' })); localStorage.setItem('patchsquad_tut', JSON.stringify(['basics', 'weak', 'bug_basic', 'bug_throw', 'bug_clone', 'bug_ghost', 'bug_e404', 'hide'])); });
  await p.goto('file:///home/user/bughunter-steam/dist/index.dev.html'); await p.waitForTimeout(1200);
  await p.evaluate(() => { for (let i = 0; i < 10; i++) window.__step(33); const B = window.__BH, F = B.Free; F.start('normal'); F.startStage(3); F.intro = false; document.getElementById('freeIntro').classList.add('hidden'); B.Game.state = 'free'; F.select(3); B.World.fillAll(); const z = F.zones[0]; F.p.pos.set(z.c.x, 0, z.c.z + 7); F.enterZone(); });
  // 버그가 나올 때까지 잠깐 진행 (녹화 안 함)
  await p.evaluate(() => { for (let i = 0; i < 90; i++) { window.__BH.Free.p.hp = 100; window.__step(1000 / 30); } });
  const TOTAL = 30 * 7; // 7초 (장전 2번)
  for (let f = 0; f < TOTAL; f++) {
    await p.evaluate((f) => {
      const B = window.__BH, F = B.Free, G = B.Game, m = F.cur();
      F.p.hp = 100; if (G.state === 'tutor') B.UI.tutorClose();
      for (const bb of F.bugs) if (bb.alive && bb.role !== 'item') { if (bb.pos.distanceTo(F.p.pos) < 9) bb.remove(); else if (bb.role === 'rush') bb.freezeT = 1; bb.fireT = 9; bb.aimT = 0; }
      F.bugs = F.bugs.filter((x) => x.alive); for (const s of F.shots) s.remove(); F.shots = [];
      // 가장 가까운 버그 조준
      let best = null, bd = 1e9; for (const bb of F.bugs) if (bb.alive && bb.role !== 'item' && bb.hittable()) { const d = bb.pos.distanceTo(F.p.pos); if (d < bd) { bd = d; best = bb.hitPos(); } }
      if (best) { const c = G.camera.position, dx = best.x - c.x, dy = best.y - c.y, dz = best.z - c.z; const ty = Math.atan2(-dx, -dz), tp = Math.atan2(dy, Math.hypot(dx, dz)); F.p.yaw += (ty - F.p.yaw) * 0.25; F.p.pitch += (tp - F.p.pitch) * 0.25; }
      // 0~1.3초 쏘기 → 1.3초에 R 장전 → 장전 끝나면 다시 쏘기
      if (f === 40 || f === 135) { F.mouse = false; m.ammo = 0; F.reload(); }
      F.mouse = m.reloadT <= 0 && !(f >= 40 && f < 100) && !(f >= 135 && f < 195);
      window.__step(1000 / 30);
    }, f);
    await p.screenshot({ path: OUT + String(f).padStart(4, '0') + '.jpg', type: 'jpeg', quality: 92 });
  }
  console.log('frames', TOTAL, errs.slice(0, 3)); await b.close();
})();
