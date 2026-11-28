// 분대원 5명 장전 모션 영상 (소리는 rsfx_render.js의 WAV와 같은 시간표: 분대원마다 장전 시간 + 1.3초)
const { chromium } = require('playwright');
const fs = require('fs');
const OUT = __dirname + '/rec_rsfx/';
(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const p = await b.newPage({ viewport: { width: 1280, height: 720 } });
  const errs = []; p.on('pageerror', (e) => errs.push(e.message));
  await p.addInitScript(() => { let v = 0, c = []; window.requestAnimationFrame = (cb) => { c.push(cb); return c.length; }; performance.now = () => v; window.__step = (ms) => { v += ms; const l = c; c = []; for (const f of l) f(v); }; localStorage.setItem('patchsquad_lang', JSON.stringify('ko')); localStorage.setItem('patchsquad_introSeen', 'true'); localStorage.setItem('patchsquad_ch2IntroSeen', 'true'); localStorage.setItem('patchsquad_cobolSeen', 'true'); localStorage.setItem('patchsquad_settings', JSON.stringify({ sound: false, quality: 'high' })); localStorage.setItem('patchsquad_tut', JSON.stringify(['basics', 'weak', 'bug_basic', 'bug_throw', 'bug_clone', 'bug_ghost', 'bug_e404', 'bug_deprecated', 'bug_merge', 'bug_leak', 'join_cobol', 'hide'])); });
  await p.goto('file:///home/user/bughunter-steam/dist/index.dev.html'); await p.waitForTimeout(1200);
  await p.evaluate(() => { for (let i = 0; i < 10; i++) window.__step(33); const B = window.__BH, F = B.Free; F.start('normal', false, 2); B.Story.finish(); F.intro = false; document.getElementById('freeIntro').classList.add('hidden'); B.Game.state = 'free'; B.World.fillAll(); F.p.yaw += 0.3; F.p.pitch = -0.05; });
  await p.evaluate(() => { for (let i = 0; i < 30; i++) window.__step(1000 / 30); });
  const durs = [1.1, 1.5, 1.6, 1.6, 1.5];
  let n = 0;
  for (let m = 0; m < 5; m++) {
    const frames = Math.round((durs[m] + 1.3) * 30);
    await p.evaluate((m) => { const F = window.__BH.Free; F.member = -1; F.select(m); const c = F.cur(); c.ammo = 0; c.reloadT = 0; F.reload(); F.mouse = false; F.recoil = 0; document.getElementById('toast').classList.add('hidden'); }, m);
    for (let f = 0; f < frames; f++) {
      await p.evaluate(() => { const F = window.__BH.Free; F.p.hp = 100; for (const bb of F.bugs) bb.remove(); F.bugs = []; window.__step(1000 / 30); });
      await p.screenshot({ path: OUT + String(n++).padStart(4, '0') + '.jpg', type: 'jpeg', quality: 92 });
    }
  }
  console.log('frames', n, errs.slice(0, 3)); await b.close();
})();
