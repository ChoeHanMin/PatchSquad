// 스킬 9개 + 롤백: 실제로 효과가 나는지 하나씩 측정
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const p = await b.newPage({ viewport: { width: 1280, height: 720 } });
  const errs = []; p.on('pageerror', (e) => errs.push(e.message));
  await p.addInitScript(() => { let v = 0, c = []; window.requestAnimationFrame = (cb) => { c.push(cb); return c.length; }; performance.now = () => v; window.__step = (ms) => { v += ms; const l = c; c = []; for (const f of l) f(v); }; localStorage.setItem('patchsquad_introSeen', 'true'); localStorage.setItem('patchsquad_settings', JSON.stringify({ sound: false, quality: 'low' })); });
  await p.goto('file:///home/user/bughunter-steam/dist/index.dev.html'); await p.waitForTimeout(800);
  const out = await p.evaluate(() => {
    const F = window.__BH.Free, G = window.__BH.Game, step = (n) => { for (let i = 0; i < n; i++) window.__step(1000 / 30); };
    step(10); F.start('normal'); F.startStage(1); F.intro = false;
    const z = F.zones[0]; F.p.pos.set(z.c.x, 0, z.c.z); F.enterZone(); F.S.waveQ = []; step(5);
    const res = [];
    // 앞(조준 방향)에 버그 몇 마리 세우기
    const setup = (n = 4, dist = 6, type = 'basic') => {
      for (const bb of F.bugs) bb.remove(); F.bugs = [];
      F.p.pitch = 0; const fw = F.ray().clone(); fw.y = 0; fw.normalize();
      const list = [];
      for (let i = 0; i < n; i++) { const pos = F.p.pos.clone().addScaledVector(fw, dist).add(new THREE.Vector3((i - n / 2) * 0.9, 0, 0)); const bb = F.spawnBug(type, pos); bb.age = 1; bb.hp = bb.maxHp = 60; list.push(bb); }
      return list;
    };
    const ready = (m) => { m.cd.shift = 0; m.cd.e = 0; m.ult = 100; };
    // 도트
    F.select(0); let m = F.cur(); ready(m);
    let p0 = F.p.pos.clone(); F.skill('shift'); step(8);
    res.push(['도트 Shift 스텝 오버', `이동 ${p0.distanceTo(F.p.pos).toFixed(1)}m · 쿨 ${m.cd.shift.toFixed(1)}s`]);
    let bugs = setup(3, 7); F.p.pitch = -0.2; F.skill('e'); step(2);
    res.push(['도트 E 브레이크포인트', `정지된 버그 ${bugs.filter((x) => x.freezeT > 0).length}/3`]);
    F.skill('q'); step(1);
    res.push(['도트 Q 디버그 모드', `남은 시간 ${F.debugT.toFixed(1)}s · 궁극기 ${Math.floor(m.ult)}%`]);
    const ammo0 = m.ammo; F.mouse = true; step(20); F.mouse = false;
    res.push(['  (디버그 모드 중 탄약)', `${ammo0} → ${m.ammo} (줄지 않아야 함)`]);
    F.debugT = 0;
    // 렉스
    F.select(1); m = F.cur(); ready(m);
    bugs = setup(3, 5); const hp0 = bugs.map((x) => x.hp); p0 = F.p.pos.clone();
    F.skill('shift'); step(14);
    res.push(['렉스 Shift 리베이스 돌진', `이동 ${p0.distanceTo(F.p.pos).toFixed(1)}m · 피해 받은 버그 ${bugs.filter((x, i) => !x.alive || x.hp < hp0[i]).length}/3`]);
    const w0 = F.walls.length; F.skill('e'); step(2);
    res.push(['렉스 E 방화벽', `벽 ${w0} → ${F.walls.length} · 높이 ${F.walls[0] && F.walls[0].h}m`]);
    bugs = setup(4, 6); const hp1 = bugs.map((x) => x.hp); F.skill('q'); step(2);
    res.push(['렉스 Q 전면 리팩터', `피해 받은 버그 ${bugs.filter((x, i) => !x.alive || x.hp < hp1[i]).length}/4 · 분열 막음 ${bugs.every((x) => x.noSplit)}`]);
    // 핀
    F.select(2); m = F.cur(); ready(m);
    F.skill('shift'); step(10);
    res.push(['핀 Shift 비동기 점프', `높이 ${F.p.pos.y.toFixed(1)}m (체공 ${F.p.hover.toFixed(1)}s)`]);
    step(90);
    res.push(['  (착지)', `높이 ${F.p.pos.y.toFixed(1)}m`]);
    bugs = setup(3, 10, 'ghost'); F.skill('e'); step(2);
    res.push(['핀 E 프로파일 스캔', `표시된 버그 ${bugs.filter((x) => x.markT > 0).length}/3 · 투명 버그 맞힐 수 있음 ${bugs.every((x) => x.hittable())}`]);
    const hp2 = bugs.map((x) => x.hp); F.skill('q'); step(2);
    res.push(['핀 Q 가비지 컬렉터', `피해 받은 표시 버그 ${bugs.filter((x, i) => !x.alive || x.hp < hp2[i]).length}/3`]);
    // 롤백
    const rb0 = F.S.rb; F.p.hp = 50; F.rollback(); step(2);
    res.push(['F 롤백', `남은 횟수 ${rb0} → ${F.S.rb} · 슬로우 ${F.S.slowT.toFixed(1)}s · 안정성 50 → ${Math.round(F.p.hp)}`]);
    // 쿨다운 중 다시 쓰면 막힘
    F.select(0); const cdBefore = F.cur().cd.shift; F.cur().cd.shift = 3; const pos1 = F.p.pos.clone(); F.skill('shift'); step(5);
    res.push(['쿨다운 중 재사용', `막힘 ${pos1.distanceTo(F.p.pos) < 0.5}`]);
    F.cur().ult = 30; const dbg = F.debugT; F.skill('q');
    res.push(['궁극기 30%일 때 Q', `막힘 ${F.debugT === dbg}`]);
    return res;
  });
  for (const [k, v] of out) console.log(k.padEnd(22), v);
  console.log('errors', errs);
  await b.close();
})();
