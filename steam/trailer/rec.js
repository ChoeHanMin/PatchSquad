// 트레일러 프레임 녹화: 게임 시간을 1/30초씩 직접 진행시키며 한 장씩 찍음
// 사용: node rec.js <장면이름> <스테이지 0~4 또는 title> <초> [시작 전 건너뛸 초]
const { chromium } = require('playwright');
const fs = require('fs');
const [name, stageArg, secArg, skipArg, memArg] = process.argv.slice(2);
const FORCE = memArg == null ? -1 : +memArg; // 분대원 고정 (예: 3 = 에이다)
const FPS = 30, SEC = +secArg, SKIP = +(skipArg || 0);
const OUT = __dirname + '/frames/' + name + '/';
(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  const errs = []; p.on('pageerror', (e) => errs.push(e.message));
  await p.addInitScript(() => {
    let vnow = 0; let cbs = [];
    window.requestAnimationFrame = (cb) => { cbs.push(cb); return cbs.length; };
    performance.now = () => vnow;
    window.__step = (ms) => { vnow += ms; const list = cbs; cbs = []; for (const cb of list) { try { cb(vnow); } catch (e) { console.error(e); } } };
    try {
      localStorage.setItem('patchsquad_lang', JSON.stringify('en'));
      localStorage.setItem('patchsquad_settings', JSON.stringify({ sound: false, sfx: .8, music: .6, reduceFlash: false, quality: 'high' }));
      localStorage.setItem('patchsquad_tutAsked', 'true'); localStorage.setItem('patchsquad_introSeen', 'true'); localStorage.setItem('patchsquad_adaSeen', 'true');
    } catch (e) {}
  });
  await p.goto('file:///home/user/bughunter-steam/dist/index.dev.html');
  await p.waitForTimeout(800);
  const step = (n = 1) => p.evaluate((n) => { for (let i = 0; i < n; i++) window.__step(1000 / 30); }, n);
  await step(10);
  if (stageArg !== 'title') {
    await p.evaluate((s) => { const G = window.__BH.Game; G.newRun(false, 'normal'); if (s > 0) { G.run.stage = s; G.startStage(s); } }, +stageArg);
  }
  const log = []; let lastSt = null;
  let mx = 960, my = 520, down = false, f = 0, total = Math.round(SEC * FPS), skip = Math.round(SKIP * FPS), t = 0;
  while (f < total) {
    // 안내 카드는 닫고 그 프레임은 안 찍음
    if (stageArg !== 'title' && await p.evaluate(() => !document.getElementById('tutor').classList.contains('hidden') || window.__BH.Game.state === 'tutor')) {
      await p.evaluate(() => { const UI = window.__BH.UI; UI.tutOpenT = -1e9; UI.tutorClose(); });
      await step(1); continue;
    }
    if (stageArg !== 'title') {
      const st = await p.evaluate(() => {
        const G = window.__BH.Game; if (G.state !== 'play' || !G.S) return null;
        G.run.stab = Math.max(G.run.stab, 70); // 트레일러용: 크래시 방지
        let best = null, bd = 1e9;
        for (const x of G.bugs) if (x.alive && x.hostile && x.onScreen && isFinite(x.sx) && isFinite(x.sy)) { const d = x.dist; if (d < bd) { bd = d; best = x; } }
        if (G.S.def.boss && window.__BH.Boss.snakes) for (const sn of window.__BH.Boss.snakes) for (const s of sn.segs) if (s.onScreen && s.glow && isFinite(s.sx) && (!best || Math.random() < 0.3)) best = s;
        return { n: G.bugs.filter((x) => x.alive && x.hostile && x.onScreen).length, out: G.out, x: best ? best.sx : 960, y: best ? best.sy : 500, has: !!best, phase: G.S.phase, ws: [0, 1, 2, 3].map((i) => G.memberUnlocked(i)), nU: [0, 1, 2, 3].filter((i) => G.memberUnlocked(i)).length };
      });
      lastSt = st;
      if (st) {
        mx += (st.x - mx) * 0.35; my += (st.y - my) * 0.35;
        await p.mouse.move(mx, my);
        const cyc = t % 75; // 2.5초 주기: 2초 쏘고 0.5초 숨기
        const want = st.phase === 'fight' && cyc < 64;
        if (want && !down) { await p.mouse.down(); down = true; }
        if (!want && down) { await p.mouse.up(); down = false; }
        if (FORCE >= 0) { if (t % 30 === 0) await p.keyboard.press(String(FORCE + 1)); }
        else if (t % 150 === 75 && st.ws[1]) await p.keyboard.press(String(1 + (Math.floor(t / 150) % st.nU)));
      }
    }
    await step(1); t++;
    if (t > skip) { await p.screenshot({ path: OUT + String(f).padStart(5, '0') + '.jpg', type: 'jpeg', quality: 92 }); log.push(lastSt ? { n: lastSt.n, out: lastSt.out, ph: lastSt.phase } : null); f++; }
  }
  fs.writeFileSync(OUT + 'log.json', JSON.stringify(log));
  console.log(name, 'frames', f, 'errors', errs.slice(0, 3));
  await b.close();
})();
