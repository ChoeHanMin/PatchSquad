const { chromium } = require('playwright');
const lang = process.argv[2] || 'ko';
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const p = await b.newPage({ viewport: { width: 1280, height: 720 } });
  const errs = []; p.on('pageerror', (e) => errs.push(e.message + ' @ ' + (e.stack || '').split('\n')[1]));
  await p.addInitScript((lang) => { let v = 0, c = []; window.requestAnimationFrame = (cb) => { c.push(cb); return c.length; }; performance.now = () => v; window.__step = (ms) => { v += ms; const l = c; c = []; for (const f of l) f(v); }; localStorage.setItem('patchsquad_lang', JSON.stringify(lang)); localStorage.setItem('patchsquad_introSeen', 'true'); localStorage.setItem('patchsquad_settings', JSON.stringify({ sound: false, quality: 'low', story: false })); }, lang);
  await p.goto('file:///home/user/bughunter-steam/dist/index.dev.html'); await p.waitForTimeout(800);
  const out = await p.evaluate(async () => {
    const G = window.__BH.Game, UI = window.__BH.UI, step = (n) => { for (let i = 0; i < n; i++) window.__step(1000 / 30); };
    step(10); G.newRun(false, 'easy'); step(5);
    const log = [];
    const clickTut = () => { if (G.state === 'tutor') UI.tutorClose(); };
    for (let si = 3; si <= 5; si++) {
      G.run.stage = si; UI.only(); G.startStage(si); step(30);
      log.push(`stage ${si} ${G.S.def.key} "${G.S.def.name}" unlocked4=${G.memberUnlocked(3)} tutor=${document.getElementById('tutor') && !document.getElementById('tutor').classList.contains('hidden') && document.getElementById('tutor').innerText.slice(0, 40).replace(/\n/g, ' ')}`);
      let t = 0, shots0 = G.run.st.shots;
      while (t < 260 && G.state !== 'cleared' && !(G.state === 'paused' && G.S.ending)) {
        clickTut(); window.__BH.Tut && (window.__BH.Tut.block = false);
        if (si === 3) G.selectMember(3);
        const tg = G.bugs.filter((x) => x.alive && x.onScreen && x.hostile)[0] || (G.S.def.boss && window.__BH.Boss.targets().find((s) => s.onScreen));
        if (tg) { G.ret.x = tg.sx; G.ret.y = tg.sy; }
        G.ptr.down = !!tg; G.run.stab = 100; if (G.cover) G.cover.hp = G.cover.max;
        step(3); t += 0.1;
        if (G.state === 'crashed' || G.state === 'crash') { log.push('crash'); break; }
      }
      G.ptr.down = false; step(100);
      log.push(`  → t=${t.toFixed(0)} state=${G.state} weapon=${G.weapon} shots=${G.run.st.shots - shots0} clrTitle=${(document.getElementById('clrTitle') || {}).textContent} next=${(document.getElementById('btnNext') || {}).textContent} story=${window.__BH.Story.active}`);
    }
    return log;
  });
  console.log(out.join('\n')); console.log('errors', errs.slice(0, 5)); await b.close();
})();
