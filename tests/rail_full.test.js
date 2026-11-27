// 레일 모드 전체 플레이 (스테이지 1 → 중간 보스 → 결과): 봇이 약점 무기로 바꿔 가며 쏨, 크래시는 다시 빌드
// 사용: node tests/rail_full.test.js [난이도 easy|normal|hard] [언어] [god 1이면 안정성 고정]
const { chromium } = require('playwright');
const diff = process.argv[2] || 'normal', lang = process.argv[3] || 'ko', god = process.argv[4] === '1';
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const p = await b.newPage({ viewport: { width: 960, height: 540 } });
  const errs = []; p.on('pageerror', (e) => errs.push(e.message + ' @ ' + (e.stack || '').split('\n').slice(1, 3).join(' | ')));
  await p.addInitScript((lang) => { let v = 0, c = []; window.requestAnimationFrame = (cb) => { c.push(cb); return c.length; }; performance.now = () => v; window.__step = (ms) => { v += ms; const l = c; c = []; for (const f of l) f(v); }; localStorage.setItem('patchsquad_lang', JSON.stringify(lang)); localStorage.setItem('patchsquad_introSeen', 'true'); localStorage.setItem('patchsquad_settings', JSON.stringify({ sound: false, quality: 'low' })); }, lang);
  await p.goto('file:///home/user/bughunter-steam/dist/index.dev.html'); await p.waitForTimeout(800);
  await p.evaluate(([diff]) => { for (let i = 0; i < 10; i++) window.__step(33); window.__BH.Game.newRun(false, diff); window.__f = 0; window.__bad = []; }, [diff]);
  const t0 = Date.now();
  for (let chunk = 0; chunk < 200; chunk++) {
    const r = await p.evaluate(async ([god]) => {
      const B = window.__BH, G = B.Game, UI = B.UI, log = [];
      const vis = (id) => { const e = document.getElementById(id); return e && !e.classList.contains('hidden'); };
      const WK = { basic: 1, clone: 1, mini: 3, throw: 2, ghost: 2, loop: 2, e404: 0, missile: 0 };
      for (let n = 0; n < 600; n++) {
        const f = ++window.__f;
        if (G.state === 'tutor') UI.tutorClose();
        if (B.Story.active) { B.Story.finish(); log.push('story'); }
        if (G.state === 'play') {
          const tg = G.bugs.filter((x) => x.alive && x.onScreen && x.hostile && (x.type !== 'ghost' || x.vis)).sort((a, c) => c.sr - a.sr)[0] || (G.S.def.boss && B.Boss.targets().find((s) => s.onScreen));
          if (tg) { G.ret.x = tg.sx; G.ret.y = tg.sy; const want = tg.type && WK[tg.type] != null ? WK[tg.type] : (G.S.def.boss ? 2 : 0); if (f % 20 === 0 && G.memberUnlocked(want)) G.selectMember(want); }
          const m = G.squad[G.weapon], atk = G.attacks && G.attacks.length;
          G.ptr.down = !!tg && !(atk && f % 40 < 15) && !(m.d.kind === 'sniper' && G.charge >= 0.8 && f % 2);
          if (f % 300 === 150 && G.run.stab < 60) G.rollback();
          if (god) G.run.stab = 100;
          if (!isFinite(G.run.stab) || !isFinite(G.run.score)) window.__bad.push('NaN at ' + f);
        } else if (vis('scrClear')) { log.push(`CLEAR ${G.run.stage + 1} ${G.S.def.key} t=${(f / 30).toFixed(0)}s score=${G.run.score} stab=${Math.round(G.run.stab)} crashes=${G.run.st.crashes} pair=${G.run.st.pair} fixed=${G.S.fixed}/${G.S.expected}`); document.getElementById('btnNext').click(); }
        else if (vis('scrCrash')) { log.push(`CRASH stage ${G.run.stage + 1} t=${(f / 30).toFixed(0)}s`); document.getElementById('btnRebuild').click(); }
        else if (vis('scrResult')) { log.push('RESULT ' + document.getElementById('resGrade').textContent + ' | ' + document.getElementById('resStats').textContent.replace(/\s+/g, ' ').slice(0, 160)); return { log, done: true }; }
        else if (f % 300 === 0) log.push(`?? state=${G.state} t=${(f / 30).toFixed(0)}`);
        window.__step(1000 / 30);
      }
      await new Promise((r) => setTimeout(r, 5));
      return { log, done: false, st: G.state + ':' + (G.S ? G.S.def.key + ':' + G.S.phase : '') };
    }, [god]);
    if (r.log.length) console.log(r.log.join('\n'));
    if (r.done) break;
    if (chunk % 10 === 9) console.log(`  … ${(chunk + 1) * 20}s game time, ${(Date.now() - t0) / 1000 | 0}s real, ${r.st}`);
  }
  console.log('bad', await p.evaluate(() => window.__bad.slice(0, 3)), 'challenges', await p.evaluate(() => localStorage.getItem('patchsquad_records')));
  console.log('errors', errs.slice(0, 5));
  await b.close();
})();
