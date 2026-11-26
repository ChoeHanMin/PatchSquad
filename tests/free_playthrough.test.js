// 자유 작전 빠른 테스트: 게임 시간을 직접 진행하며 봇이 플레이
const { chromium } = require('playwright');
const stage = +(process.argv[2] || 0), maxSec = +(process.argv[3] || 240), lang = process.argv[4] || 'en', diff = process.argv[5] || 'normal';
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const p = await b.newPage({ viewport: { width: 1280, height: 720 } });
  const errs = []; p.on('pageerror', (e) => errs.push(e.message + ' @ ' + (e.stack || '').split('\n').slice(1, 3).join(' | ')));
  await p.addInitScript((lang) => {
    let vnow = 0, cbs = [];
    window.requestAnimationFrame = (cb) => { cbs.push(cb); return cbs.length; };
    performance.now = () => vnow;
    window.__step = (ms) => { vnow += ms; const l = cbs; cbs = []; for (const cb of l) cb(vnow); };
    localStorage.setItem('patchsquad_lang', JSON.stringify(lang)); localStorage.setItem('patchsquad_introSeen', 'true');
    localStorage.setItem('patchsquad_settings', JSON.stringify({ sound: false, quality: 'low' }));
  }, lang);
  await p.goto('file:///home/user/bughunter-steam/dist/index.dev.html'); await p.waitForTimeout(800);
  await p.evaluate(() => { for (let i = 0; i < 10; i++) window.__step(33); });
  await p.evaluate(([s, d]) => { const F = window.__BH.Free; F.start(d); if (s > 0) F.startStage(s); F.intro = false; document.getElementById('freeIntro').classList.add('hidden'); }, [stage, diff]);
  const res = await p.evaluate(async ([maxSec]) => {
    const F = window.__BH.Free, G = window.__BH.Game, log = [];
    let last = '', skillI = 0, frames = 0, lowHp = 100;
    const keys = ['shift', 'e', 'q'];
    // setTimeout 대기도 게임 시간에 맞추기 위해 실제로 잠깐씩 기다림
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
    for (let f = 0; f < maxSec * 30; f++) {
      if (!F.active) { log.push('inactive'); break; }
      if (G.state === 'free') {
        const P = F.p.pos;
        if (F.S.phase === 'travel' && F.zones[F.S.zi] && !F.S.def.boss) { // 다음 구역 쪽으로 걸어감
          const z = F.zones[F.S.zi], dx = z.c.x - P.x, dz = z.c.z - P.z; F.p.yaw = Math.atan2(-dx, -dz); F.p.pitch = 0; F.keys.KeyW = true; F.mouse = false;
        } else {
          F.keys.KeyW = false;
          const danger = F.bugs.some((bb) => bb.aimT > 0) || F.shots.some((sh) => sh.alive && sh.kind === 'packet');
          if (danger !== F.p.crouch && F.nearCover()) F.toggleCrouch(); else if (!danger && F.p.crouch) F.toggleCrouch();
          if (danger) F.stat_blockTry = (F.stat_blockTry || 0) + 1;
          let best = null, bd = 1e9;
          for (const bb of F.bugs) if (bb.alive && bb.role !== 'item' && bb.hittable()) { const d = bb.pos.distanceTo(P); if (d < bd) { bd = d; best = bb.hitPos(); } }
          for (const s of F.shots) if (s.alive && s.kind === 'missile' && s.pos.distanceTo(P) < 9) { best = s.pos; break; }
          if (F.bossObj) { for (const nd of F.bossObj.nodes) if (nd.alive) { if (!best || Math.random() < 0.6) best = nd.pos; break; } }
          if (best) { const c = G.camera.position, dx = best.x - c.x, dy = best.y - c.y, dz = best.z - c.z; F.p.yaw = Math.atan2(-dx, -dz); F.p.pitch = Math.atan2(dy, Math.hypot(dx, dz)); F.mouse = true; }
          else { if (F.mouse) F.release(); F.mouse = false; }
          // 분대원 바꾸기 + 스킬
          if (f % 150 === 75) F.select((F.member + 1) % 3);
          if (f % 60 === 30) F.skill(keys[skillI++ % 3]);
          if (f % 240 === 120) F.rollback();
          if (F.cur().d.kind === 'sniper' && F.charge >= 0.6) { F.release(); }
        }
        lowHp = Math.min(lowHp, F.p.hp);
      } else if (G.state === 'paused') {
        if (!document.getElementById('scrClear').classList.contains('hidden')) { log.push(`CLEAR stage ${F.S.idx + 1} t=${(f / 30).toFixed(0)}s score=${F.run.score} lowHp=${Math.round(lowHp)} dmgBy=${JSON.stringify(F.run.dmgBy)} blocked=${F.run.blocked}`); document.getElementById('btnNext').click(); lowHp = 100; }
        else if (!document.getElementById('story').classList.contains('hidden')) { window.__BH.Story.finish(); log.push('ending story'); }
        else if (!document.getElementById('scrResult').classList.contains('hidden')) { log.push('blocked=' + (F.statBlocked||0) + ' '); log.push('RESULT ' + document.getElementById('resGrade').textContent + ' ' + document.getElementById('resStats').textContent.slice(0, 120)); break; }
        else if (!document.getElementById('scrCrash').classList.contains('hidden')) { log.push(`CRASH stage ${F.S.idx + 1} t=${(f / 30).toFixed(0)}s dmgBy=${JSON.stringify(F.run.dmgBy)} blocked=${F.run.blocked} crouchTries=${F.stat_blockTry||0}`); document.getElementById('btnRebuild').click(); F.intro = false; document.getElementById('freeIntro').classList.add('hidden'); }
        else if (!document.getElementById('scrPause').classList.contains('hidden')) { log.push('PAUSED?'); F.resume(); }
      }
      if (F.intro) { F.intro = false; document.getElementById('freeIntro').classList.add('hidden'); }
      window.__step(1000 / 30); frames++;
      const tag = F.S ? `${F.S.idx}:${F.S.phase}:${F.S.zi}:${F.S.wave}${F.bossObj ? ':boss' + F.bossObj.phase + '/' + F.bossObj.fixed : ''}` : '';
      if (tag !== last) { log.push(`t=${(f / 30).toFixed(1)} ${tag} hp=${Math.round(F.p.hp)} bugs=${F.bugs.length} fixed=${F.S.fixed}/${F.S.expected}`); last = tag; }
      if (f % 15 === 0) await sleep(1); // setTimeout 처리
    }
    return log;
  }, [maxSec]);
  console.log(res.join('\n'));
  await p.screenshot({ path: __dirname + '/tf2_last.png' });
  console.log('errors', errs.slice(0, 5));
  await b.close();
})();
