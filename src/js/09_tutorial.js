// ---------- 튜토리얼: 화면 설명 → 조작 → 분대·무기 → 버그 하나씩 ----------
// 설명하는 부분만 컬러, 나머지는 흑백. 새 버그가 나오면 슬로우 + 그 버그를 비춤.
const TUT_STAGE = { id: 0, key: 'forest', name: L('튜토리얼 훈련장', 'Tutorial Training Ground'), theme: 0x6BD66B, sky: 0x173a26, count: 0, mix: { basic: 1 }, intro: [], fog: [18, 95, 30, 150], light: [0.8, 1.1], cover: 0x8a6a3a, tutorial: true };

const Tut = {
  active: false, i: 0, steps: [], cur: null, t: 0, slow: 1, block: false, shown: {}, holdT: 0, wasOut: false, hideT: 0, ret0: null,
  start() {
    this.active = true; this.i = -1; this.shown = {}; this.slow = 1; this.block = false;
    this.steps = this.build();
    $('#spot').classList.remove('hidden');
    this.next();
  },
  stop() {
    this.active = false; this.cur = null; this.block = false; this.slow = 1;
    $('#spot').classList.add('hidden');
    if (Game.state === 'tutor') Game.state = 'play';
  },
  // ----- 화면 위치 -----
  el(sel, pad = 6) { const e = $(sel); if (!e) return null; const r = e.getBoundingClientRect(), s = VIEW.s; return { x: VIEW.x(r.left) - pad, y: VIEW.y(r.top) - pad, w: r.width / s + pad * 2, h: r.height / s + pad * 2 }; },
  coverBar() { const W = Game.W, H = Game.H, w = Math.min(220, W * 0.5); return { x: (W - w) / 2 - 8, y: H - (W < H ? 150 : 96) - 20, w: w + 16, h: 34 }; },
  around(x, y, r) { return { x: x - r, y: y - r, w: r * 2, h: r * 2 }; },
  bugRect(b) { return b && b.alive && b.onScreen ? this.around(b.sx, b.sy, Math.max(40, b.sr * 1.5)) : null; },
  // ----- 단계 -----
  build() {
    const T = IS_TOUCH, S = [];
    const tap = (title, body, spot, opt = {}) => S.push(Object.assign({ kind: 'tap', title, body, spot }, opt));
    const act = (title, body, spot, done, opt = {}) => S.push(Object.assign({ kind: 'act', title, body, spot, done }, opt));
    const bug = (type) => S.push({ kind: 'bug', type });
    tap(L('튜토리얼 훈련장', 'Tutorial Training Ground'), L('여기서는 크래시가 나지 않아요.<br>화면 구성 → 조작 → 분대와 무기 → 버그 순서로 하나씩 알려 줄게요.', 'You can\'t crash here.<br>We\'ll go through the screen → controls → squad and weapons → bugs, one at a time.'), null);
    // 화면 구성
    tap(L('안정성', 'Stability'), L('버그에게 맞으면 줄어들어요. <b>0%가 되면 크래시</b>, 그 스테이지를 처음부터 다시 해요.<br>아래 빨간 칸은 지금 걸린 화면 고장이에요.', 'Drops when bugs hit you. <b>At 0% you crash</b> and restart the stage.<br>The red tags below are the screen glitches you currently have.'), () => this.el('.hud-l .bar', 8));
    tap(L('진행률', 'Progress'), L('이 스테이지에서 고친 버그의 비율이에요. 고칠수록 회색 세상에 <b>색과 음악</b>이 돌아와요.', 'The share of bugs fixed in this stage. The more you fix, the more <b>color and music</b> return to the grey world.'), () => this.el('.hud-c'));
    tap(L('점수와 연속 배율', 'Score and streak'), L('안 맞고 연속으로 고치면 배율이 올라가요 (최대 <b>×2.0</b>). 맞으면 다시 ×1.0.', 'Fix bugs in a row without getting hit to raise the multiplier (up to <b>×2.0</b>). Getting hit resets it to ×1.0.'), () => this.el('.hud-r'));
    tap(L('패치 로그', 'Patch log'), L('버그를 고치면 고친 코드와 <b>Run Successfully</b>, 맞으면 <b>Run Error</b>가 찍혀요.', 'Fixing a bug prints the patched code and <b>Run Successfully</b>; getting hit prints <b>Run Error</b>.'), () => this.el('#codeLog'));
    tap(L('엄폐물 체력', 'Cover HP'), L('숨어 있을 때 공격을 <b>대신 맞아 주는</b> 엄폐물이에요. 0이 되면 부서져서 숨어도 맞아요.<br>다음 엄폐 지점에 가면 새로 생겨요.', 'Your cover <b>takes hits for you</b> while you hide. At 0 it breaks and hiding no longer protects you.<br>The next cover point gives you new cover.'), () => this.coverBar());
    tap(L('일시정지', 'Pause'), L('일시정지 메뉴에서 <b>도감</b>(버그 설명 다시 보기)과 설정을 열 수 있어요.', 'The pause menu opens the <b>Bug Dex</b> (bug info) and settings.'), () => this.el('#pauseBtn'));
    // 조작
    act(L('나와서 쏘기', 'Pop up and shoot'), T ? L('화면을 <b>누르고 있으면</b> 엄폐물 위로 나와 자동으로 쏴요.<br>1초 동안 누르고 있어 보세요.', '<b>Touch and hold</b> to pop up from cover and fire automatically.<br>Hold for 1 second.') : L('마우스 왼쪽을 <b>누르고 있으면</b> 엄폐물 위로 나와 자동으로 쏴요.<br>1초 동안 누르고 있어 보세요.', '<b>Hold</b> the left mouse button to pop up from cover and fire automatically.<br>Hold for 1 second.'),
      () => this.around(Game.ret.x, Game.ret.y, Game.retR() + 46), () => this.holdT > 1, { onStart: () => { this.holdT = 0; } });
    act(L('숨기', 'Hide'), L('<b>손을 떼면</b> 엄폐물 뒤로 숨고 재장전돼요. 떼 보세요.', '<b>Release</b> to duck behind cover and reload. Try letting go.'), null, () => this.hideT > 0.7, { onStart: () => { this.hideT = 0; } });
    act(L('조준', 'Aim'), T ? L('누른 채로 <b>손가락을 끌면</b> 조준점이 끈 방향으로 움직여요. 손가락이 조준점을 가리지 않게 돼 있어요.<br>조준점을 움직여 보세요.', '<b>Drag while holding</b> to move the crosshair. Your finger never covers the crosshair.<br>Move the crosshair.') : L('조준점은 <b>마우스</b>를 따라가요. 마우스를 움직여 보세요.', 'The crosshair follows your <b>mouse</b>. Move the mouse.'),
      () => this.around(Game.ret.x, Game.ret.y, Game.retR() + 46), () => this.ret0 && Math.hypot(Game.ret.x - this.ret0.x, Game.ret.y - this.ret0.y) > 90, { onStart: () => { this.ret0 = { x: Game.ret.x, y: Game.ret.y }; } });
    tap(L('탄약과 재장전', 'Ammo and reload'), L('조준점 둘레의 고리가 <b>남은 탄</b>이에요. 다 쓰면 재장전해야 하고, <b>숨어 있으면 더 빨리</b> 채워져요.', 'The ring around the crosshair shows your <b>remaining ammo</b>. When it runs out you reload — <b>faster while hiding</b>.'), () => this.around(Game.ret.x, Game.ret.y, Game.retR() + 46));
    // 분대·무기
    tap(L('도트 — 연사', 'Dot — Rapid'), L('빠르게 연속으로 쏴요. 어떤 상황에도 무난하고 <b>관통 미사일 격추</b>에 좋아요.<br>약점 대상: 404 버그 · 미사일', 'Fires fast and continuously. Reliable in any situation and great at <b>shooting down piercing missiles</b>.<br>Strong against: 404 Bug · missiles'), () => this.el('.mem[data-m="0"]'));
    tap(L('렉스 — 산탄', 'Rex — Spread'), L('한 번에 7발을 넓게 퍼뜨리고, 달려오는 버그를 <b>뒤로 밀어내요</b>.<br>약점 대상: 기본 · 복제 · 작은 복제 버그', 'Fires 7 pellets in a wide spread and <b>knocks charging bugs back</b>.<br>Strong against: Basic · Clone · Mini Clone'), () => this.el('.mem[data-m="1"]'));
    tap(L('핀 — 저격', 'Pin — Sniper'), L('<b>누르고 있으면 충전</b>, 떼거나 다 차면 발사. 겹친 적을 꿰뚫고 무한루프 버그의 껍질도 뚫어요.<br>약점 대상: throw · 투명 · 무한루프 버그 · 보스 오류 줄', '<b>Hold to charge</b>, release or wait for full to fire. Pierces lined-up enemies and Infinite Loop shells.<br>Strong against: Throw · Ghost · Infinite Loop · boss error lines'), () => this.el('.mem[data-m="2"]'));
    act(L('캐릭터 바꾸기', 'Switch members'), L('렉스 아이콘을 눌러 렉스로 바꿔 보세요', 'Click the Rex icon to switch to Rex') + (T ? '.' : L(' (2번 키).', ' (key 2).')) + L('<br>조작하지 않는 동료는 내가 나와서 쏠 때 같이 쏴요.', '<br>Squad members you don\'t control fire with you when you pop up.'), () => this.el('.mem[data-m="1"]'), () => Game.weapon === 1);
    tap(L('약점 무기', 'Weak weapon'), L('버그 옆 동그라미가 <b>약점 무기</b>예요: <b style="color:#C6F432">연</b> 연사 · <b style="color:#FFD34D">산</b> 산탄 · <b style="color:#6fe7ff">저</b> 저격.<br>약점 무기로 쏘면 피해가 <b>2배</b>. 맞는 캐릭터 버튼이 반짝이면 눌러서 바꾸세요.', 'The circle next to a bug is its <b>weak weapon</b>: <b style="color:#C6F432">D</b> Rapid · <b style="color:#FFD34D">R</b> Spread · <b style="color:#6fe7ff">P</b> Sniper.<br>The weak weapon deals <b>2×</b> damage. When a squad button flashes, click it to switch.'), () => this.el('#weapons'));
    tap(L('롤백 — 3초 슬로우', 'Rollback — 3s slow-mo'), L('누르면 3초 동안 세상이 느려지고, 날아오던 공격은 되감기고, 화면 고장 하나가 바로 고쳐져요.<br>스테이지마다 정해진 횟수만 쓸 수 있어요', 'Slows the world for 3 seconds, rewinds incoming attacks and instantly repairs one glitch.<br>Limited uses per stage') + (T ? '.' : L(' (스페이스).', ' (Space).')), () => this.el('.wpn.rb'));
    // 버그 실전
    tap(L('이제 실전!', 'Now for real!'), L('버그가 <b>한 마리씩</b> 나와요. 새 버그가 나오면 화면이 느려지고 설명이 떠요.<br>설명을 보고 직접 고쳐 보세요.', 'Bugs appear <b>one at a time</b>. When a new bug appears, time slows down and an explanation pops up.<br>Read it, then fix the bug yourself.'), null);
    for (const t of ['basic', 'throw', 'clone', 'ghost', 'e404', 'loop', 'hotfix']) bug(t);
    tap(L('훈련 완료!', 'Training complete!'), L('이제 난이도를 골라 실전으로 가요.<br>버그 설명은 언제든 <b>도감</b>에서 다시 볼 수 있어요.', 'Now pick a difficulty and head into battle.<br>You can check bug info anytime in the <b>Bug Dex</b>.'), null, { end: true });
    return S;
  },
  next() {
    this.i++;
    const s = this.steps[this.i];
    if (!s) return this.finish();
    this.cur = s; this.t = 0;
    if (s.onStart) s.onStart();
    if (s.kind === 'tap') { this.freeze(true); this.card(s.title, s.body, true); }
    else if (s.kind === 'act') { this.freeze(false); this.card(s.title, s.body, false); }
    else if (s.kind === 'bug') this.startBug(s);
  },
  freeze(on) { // 화면 멈춤 (설명을 읽는 동안)
    if (on) { Game.state = 'tutor'; Game.ptr.down = false; }
    else if (Game.state === 'tutor') { Game.state = 'play'; Game.last = performance.now(); }
  },
  card(title, body, tapToGo) {
    const c = $('#spotCard');
    c.querySelector('.tt').textContent = title;
    c.querySelector('.tb').innerHTML = body;
    c.querySelector('.tgo').textContent = tapToGo ? L('클릭해서 계속 ▶', 'Click to continue ▶') : L('직접 해 보세요', 'Try it yourself');
    c.classList.toggle('act', !tapToGo);
    $('#spotCatch').classList.toggle('hidden', !tapToGo);
    c.classList.remove('hidden');
    this.tapReadyT = performance.now() + 350; // 실수로 바로 넘어가지 않게
  },
  tap() {
    if (!this.cur || performance.now() < this.tapReadyT) return;
    SND.play('click');
    const s = this.cur;
    if (s.kind === 'tap') { if (s.end) return this.finish(); return this.next(); }
    if (s.kind === 'bug' && s.phase === 'intro') { s.phase = 'fight'; this.slow = 1; this.block = false; $('#spotCatch').classList.add('hidden'); this.card(s.title, s.tip, false); return; }
    if (s.kind === 'event') { this.slow = 1; this.block = false; this.cur = s.back; $('#spotCatch').classList.add('hidden'); if (s.back) this.card(s.back.title, s.back.kind === 'bug' ? s.back.tip : s.back.body, false); }
  },
  // 버그 소개: 나오는 순간 슬로우 + 그 버그만 컬러로
  startBug(s) {
    this.freeze(false);
    const e = DEX.find((x) => x.t === s.type);
    s.title = BUGDEF[s.type].name; s.tip = L('공략: ', 'Tip: ') + e.tip + ' ' + weakTag(s.type); s.phase = 'wait';
    $('#spotCard').classList.add('hidden'); $('#spotCatch').classList.add('hidden');
    Game.spawnEntry(s.type, true);
    s.bug = Game.bugs[Game.bugs.length - 1];
    s.waitT = 0;
  },
  // 첫 빨간 예고 원 · 첫 미사일: 슬로우 + 그 부분만 컬러
  event(kind, obj) {
    if (!this.active || this.shown[kind] || !this.cur || this.cur.kind === 'tap' || this.cur.kind === 'event' || (this.cur.kind === 'bug' && this.cur.phase === 'intro')) return;
    this.shown[kind] = true;
    const back = this.cur;
    const ev = kind === 'packet'
      ? { kind: 'event', back, title: L('빨간 원 = 공격 예고!', 'Red circle = incoming attack!'), body: L('멀리 있는 버그가 에러 패킷을 던지기 직전이에요. 원이 다 차기 전에 <b>손을 떼서 숨으면</b> 엄폐물이 대신 맞아요.<br>그 전에 던진 버그를 잡으면 공격이 취소돼요.', 'A distant bug is about to throw an error packet. <b>Let go and hide</b> before the circle fills and your cover takes the hit.<br>Kill the thrower first and the attack is cancelled.'), spot: () => this.around(obj.x, obj.y, 74) }
      : { kind: 'event', back, title: L('관통 미사일!', 'Piercing missile!'), body: L('보라색 미사일은 <b>엄폐물을 뚫어요</b>. 숨어도 맞으니 나와서 연사로 쏴서 떨어뜨리세요 (2발).', 'Purple missiles <b>go through cover</b>. Hiding won\'t help, so pop up and shoot them down with Rapid (2 hits).'), spot: () => this.bugRect(obj) };
    this.cur = ev; this.slow = 0.06; this.block = true; Game.ptr.down = false;
    this.card(ev.title, ev.body, true);
  },
  finish() {
    Store.set('tutDone', true);
    const rec = Store.get('records', {}); rec.ch = rec.ch || {};
    if (!rec.ch.tutorial) { rec.ch.tutorial = true; Store.set('records', rec); SND.play('unlock'); setTimeout(() => UI.toast(L('🏆 도전 과제 달성: 훈련 수료', '🏆 Challenge complete: Training Complete')), 300); }
    this.stop();
    Game.toTitle();
    UI.pendingDaily = false; UI.showDiff();
  },
  // 매 프레임: 진행 조건 확인 + 흑백 칸과 강조 테두리 위치
  tick(dt) {
    if (!this.active) return;
    const s = this.cur;
    if (Game.out) this.holdT += dt; else if (this.holdT > 0) this.hideT += dt;
    if (s && s.kind === 'act' && Game.state === 'play' && s.done()) this.next();
    else if (s && s.kind === 'bug') {
      const b = s.bug;
      if (s.phase === 'wait') { // 화면에 들어오면 슬로우 + 설명
        s.waitT += dt;
        if (b && b.alive && b.onScreen && b.age > 0.5 && (b.role !== 'shoot' || b.arrived || b.age > 2.5)) {
          s.phase = 'intro'; this.slow = 0.06; this.block = true; Game.ptr.down = false;
          const e = DEX.find((x) => x.t === s.type);
          this.card(L('새로운 버그 · ', 'New bug · ') + BUGDEF[s.type].name, `<span class="role">${e.role}</span> ${e.desc}`, true);
        } else if (s.waitT > 8 || (b && !b.alive)) { s.phase = 'fight'; }
      } else if (s.phase === 'fight') {
        const left = Game.bugs.some((x) => x.alive && (x.hostile || x.role === 'item'));
        if (!left && !Game.attacks.length) {
          if (s.type === 'hotfix' && b && !b.collected && Game.run.st.hotfix === 0 && !s.retried) { s.retried = true; s.phase = 'wait'; Game.spawnEntry('hotfix', true); s.bug = Game.bugs[Game.bugs.length - 1]; s.waitT = 0; }
          else this.next();
        }
      }
    }
    this.layout();
  },
  layout() {
    const s = this.cur, W = Game.W, H = Game.H;
    let r = null;
    if (s) {
      if (s.kind === 'bug') r = s.phase === 'intro' || s.phase === 'fight' ? this.bugRect(s.bug) : null;
      else if (s.spot) r = s.spot();
    }
    const panes = $$('#spot .spane'), hole = $('#spot .shole');
    if (!r) { // 강조 없음: 전체 흑백은 하지 않음
      panes[0].style.cssText = 'left:0;top:0;width:0;height:0'; for (let k = 1; k < 4; k++) panes[k].style.cssText = 'width:0;height:0';
      hole.style.display = 'none';
    } else {
      const x = clamp(r.x, 0, W), y = clamp(r.y, 0, H), x2 = clamp(r.x + r.w, 0, W), y2 = clamp(r.y + r.h, 0, H);
      panes[0].style.cssText = `left:0;top:0;width:${W}px;height:${y}px`;
      panes[1].style.cssText = `left:0;top:${y2}px;width:${W}px;height:${H - y2}px`;
      panes[2].style.cssText = `left:0;top:${y}px;width:${x}px;height:${y2 - y}px`;
      panes[3].style.cssText = `left:${x2}px;top:${y}px;width:${W - x2}px;height:${y2 - y}px`;
      hole.style.cssText = `display:block;left:${x}px;top:${y}px;width:${x2 - x}px;height:${y2 - y}px`;
    }
    // 설명 카드는 강조 부분과 겹치지 않게
    const c = $('#spotCard');
    const cy = r ? r.y + r.h / 2 : H * 0.5;
    c.style.top = cy > H * 0.5 ? '9%' : 'auto'; c.style.bottom = cy > H * 0.5 ? 'auto' : '20%';
  },
};
