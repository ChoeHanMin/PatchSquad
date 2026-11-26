// ---------- 화면 · HUD ----------
const SCREENS = ['#scrTitle', '#scrAskTut', '#scrDiff', '#scrDex', '#scrPause', '#scrSettings', '#scrRecords', '#scrClear', '#scrCrash', '#scrResult'];
const CHALLENGES = [
  ['release', '정식 출시 등급 받기'],
  ['nocrash', '무사고 (크래시 0회로 클리어)'],
  ['norollback', '롤백 없이 클리어'],
  ['acc90', '정확도 90% 이상으로 클리어'],
  ['blast5', '리팩터 한 방에 복제 버그 5마리'],
  ['boss90', '보스를 1분 30초 안에 정상화'],
  ['hard', '난이도 상 클리어'],
  ['hardrelease', '난이도 상에서 정식 출시'],
  ['tutorial', '훈련 수료 (튜토리얼 완료)'],
];
// ---------- 도감 · 안내 카드 내용 ----------
const DEX = [
  { t: 'basic', role: '돌격', hp: 5, desc: '엄폐물까지 곧장 달려와 물어요. 숨어도 막을 수 없어요.', tip: '가까이 오기 전에 쏘세요. 산탄이 약점이고 맞으면 뒤로 밀려나요.' },
  { t: 'throw', role: '사격', hp: 8, desc: '멀리 서서 빨간 예고 원을 띄운 뒤 에러 패킷을 던져요.', tip: '예고 원이 보이면 손을 떼서 숨으세요. 예고 초반에 잡으면 공격이 취소돼요. 저격이 약점.' },
  { t: 'clone', role: '돌격', hp: 6, desc: '쓰러뜨리면 작은 복제 버그 2마리로 갈라져요.', tip: '산탄 한 방에 여러 마리를 정리하세요. 분열한 뒤가 더 위험해요.' },
  { t: 'mini', role: '돌격', hp: 2, desc: '복제 버그가 갈라져 나온 작고 빠른 버그.', tip: '빠르니 가까이 오기 전에 산탄으로.' },
  { t: 'ghost', role: '사격', hp: 6, desc: '1.5초마다 0.5초만 보여요. 안 보일 땐 맞지 않아요.', tip: '보이는 순간을 노리세요. 저격을 충전해 뒀다가 보일 때 발사하면 한 방이에요.' },
  { t: 'e404', role: '사격', hp: 8, desc: '조준선이 1초 이상 겹치면 근처로 순간이동해요.', tip: '오래 겨누지 말고 연사로 빠르게 끝내세요. 연사가 약점.' },
  { t: 'loop', role: '사격 · 미사일', hp: 10, desc: '빙글빙글 돌며 관통 미사일을 쏴요. 껍질 때문에 빛나는 지점에서만 맞아요.', tip: '저격은 껍질을 뚫어서 언제든 맞아요. 미사일은 숨어도 맞으니 쏴서 떨어뜨리세요.' },
  { t: 'missile', role: '관통탄', hp: 2, desc: '무한루프 버그와 보스가 쏘는 미사일. 엄폐물을 뚫어요.', tip: '숨지 말고 연사로 격추하세요. 보라색 "관통!" 표시가 경고예요.' },
  { t: 'hotfix', role: '아이템', hp: 1, desc: '가끔 둥실 떠다니는 긴급 패치 꾸러미.', tip: '쏘면 안정성 +20, 화면 고장 복구, 엄폐물 보강. 상 난이도에선 가짜(붉게 깜빡임)도 있어요.' },
];
const SQUAD_INFO = [
  { name: '도트', role: '디버거 · 연사', desc: '빠르게 연속 사격. 어떤 상황에도 무난하고 미사일 격추에 좋아요.', weak: '404 버그 · 관통 미사일' },
  { name: '렉스', role: '리팩터 · 산탄', desc: '한 번에 7발을 넓게 퍼뜨리고, 달려오는 버그를 뒤로 밀어내요.', weak: '기본 · 복제 · 작은 복제 버그' },
  { name: '핀', role: '프로파일러 · 저격', desc: '누르고 있으면 충전, 떼거나 다 차면 발사. 멀리 있는 적과 겹쳐 있는 적을 한 번에 꿰뚫어요.', weak: 'throw · 투명 · 무한루프 버그 · 보스 오류 줄' },
];
function dexPic(t) {
  if (t === 'hotfix') return ASSETS.item_hotfix ? Object.assign(new Image(), { src: ASSETS.item_hotfix }) : hotfixCanvas(0);
  if (t === 'missile') return ASSETS.proj_missile ? Object.assign(new Image(), { src: ASSETS.proj_missile }) : missileCanvas(0);
  return bugImgCanvas(t);
}
const weakTag = (t) => { const k = WEAK[t]; return k ? `<span class="chip" style="color:${KIND_INFO[k].color}">약점: ${KIND_INFO[k].name}</span>` : ''; };
const TUT = {
  basics: { tag: '조작', title: '누르면 나가서 쏘고, 떼면 숨어요', body: IS_TOUCH ? '화면을 누르고 있으면 엄폐물 위로 나와 자동 사격해요. 누른 채로 손가락을 끌면 조준점이 움직여요.<br>손을 떼면 숨고, 숨어 있는 동안 재장전돼요.' : '마우스 왼쪽 버튼을 누르고 있으면 엄폐물 위로 나와 자동 사격해요. 조준점은 마우스를 따라가요.<br>버튼을 떼면 숨고, 숨어 있는 동안 재장전돼요.' },
  hide: { tag: '공격 예고', title: '빨간 원이 보이면 숨으세요!', body: '멀리 있는 버그가 에러 패킷을 던지기 직전이에요. 원이 다 채워지기 전에 <b>손을 떼면</b> 엄폐물이 대신 맞아요.<br>그 전에 던진 버그를 잡으면 공격이 취소돼요.' },
  weak: { tag: '약점 무기', title: '버그 옆 동그라미 = 약점 무기', body: '<b style="color:#C6F432">연</b> 연사 · <b style="color:#FFD34D">산</b> 산탄 · <b style="color:#6fe7ff">저</b> 저격. 약점 무기로 쏘면 피해가 <b>2배</b>예요.<br>지금 상황에 맞는 캐릭터 버튼이 반짝이면 눌러서 바꾸세요.' },
  join_rex: { tag: '분대 합류', title: '렉스 합류 — 산탄', body: '한 번에 7발이 넓게 퍼지고, 달려오는 버그를 <b>뒤로 밀어내요</b>. 기본·복제 버그의 약점이에요.<br>아래 렉스 아이콘을 누르세요' + (IS_TOUCH ? '.' : ' (2번 키).') + ' 조작하지 않는 동료는 옆에서 알아서 쏴요.', pics: [1] },
  join_pin: { tag: '분대 합류', title: '핀 합류 — 저격', body: '<b>누르고 있으면 충전</b>되고, 떼거나 다 차면 발사돼요. 겹친 적을 꿰뚫고, 무한루프 버그의 껍질도 뚫어요.<br>멀리서 던지는 버그와 보스 오류 줄의 약점이에요' + (IS_TOUCH ? '.' : ' (3번 키).'), pics: [2] },
  rollback: { tag: '분대 스킬', title: '롤백 — 3초 슬로우', body: '누르면 3초 동안 세상이 30% 속도로 느려지고, 날아오던 공격은 되감기고, 화면 고장 하나가 바로 고쳐져요.<br>스테이지마다 정해진 횟수만 쓸 수 있어요. 위급할 때 버튼이 반짝여요' + (IS_TOUCH ? '.' : ' (스페이스).') },
  cover_broken: { tag: '위험', title: '엄폐물이 부서졌어요', body: '이제 숨어도 에러 패킷에 맞아요. 던지는 버그부터 빨리 잡으세요.<br>다음 엄폐 지점에 가면 새 엄폐물이 생기고, 핫픽스를 쏘면 보강돼요.' },
};

const UI = {
  pendingDaily: false, setReturn: null, _hud: {},
  init() {
    $('#verBadge').textContent = DAILY_VER;
    if (ASSETS.logo) $('#logo').innerHTML = `<img class="logoimg" src="${ASSETS.logo}" alt="PATCH SQUAD">`;
    $('#crashBug').append(bugImgCanvas('basic'));
    const click = (id, fn) => $(id).addEventListener('click', (e) => { SND.init(); SND.play('click'); fn(e); });
    click('#btnStart', () => this.start(false));
    click('#btnDaily', () => this.start(true));
    click('#btnRecords', () => this.showRecords());
    click('#btnDex', () => this.showDex('#scrTitle'));
    click('#btnPauseDex', () => this.showDex('#scrPause'));
    click('#btnDexBack', () => this.only(this.dexReturn || '#scrTitle'));
    click('#btnTutReset', () => { Store.set('tut', []); this.tutSeen = []; this.toast('안내 카드를 처음부터 다시 보여 줄게요'); });
    $('#tutor').addEventListener('pointerdown', (e) => { e.preventDefault(); e.stopPropagation(); this.tutorClose(); });
    window.addEventListener('keydown', (e) => {
      if (!(e.code === 'Space' || e.key === 'Enter')) { if (!(Game.state === 'tutor' && e.key === 'Escape')) return; }
      if (Tut.active && !$('#spotCatch').classList.contains('hidden')) { e.preventDefault(); e.stopPropagation(); Tut.tap(); return; }
      if (Game.state === 'tutor' && !Tut.active) { e.preventDefault(); this.tutorClose(); }
    }, true);
    const tutTap = (e) => { e.preventDefault(); e.stopPropagation(); Tut.tap(); };
    $('#spotCatch').addEventListener('pointerdown', tutTap);
    $('#spotCard').addEventListener('pointerdown', tutTap);
    click('#btnSettings', () => this.showSettings('#scrTitle'));
    click('#btnAskTutYes', () => { Store.set('tutAsked', true); this.only(); Game.newRun(false, 'tutorial'); });
    click('#btnAskTutNo', () => { Store.set('tutAsked', true); this.showDiff(); });
    click('#btnDiffBack', () => this.only('#scrTitle'));
    $$('.dcard').forEach((b) => b.addEventListener('click', () => {
      SND.init();
      if (b.dataset.d === 'tutorial') { SND.play('click'); this.only(); Game.newRun(false, 'tutorial'); return; }
      if (b.dataset.d === 'hard' && !this.hardOpen()) { SND.play('jam'); this.toast('난이도 중을 한 번 깨면 열려요'); return; }
      SND.play('click'); Store.set('diff', b.dataset.d); this.only(); Game.newRun(this.pendingDaily, b.dataset.d);
    }));
    click('#btnResume', () => this.resume());
    click('#btnPauseSet', () => this.showSettings('#scrPause'));
    click('#btnRestartStage', () => { this.only(); Game.state = 'play'; if (SND.ctx) SND.ctx.resume(); Game.restoreSnapshot(); Game.startStage(Game.run.stage); });
    click('#btnToTitle', () => { if (SND.ctx) SND.ctx.resume(); Game.toTitle(); });
    click('#btnSetBack', () => { this.only(this.setReturn || '#scrTitle'); });
    click('#btnRecBack', () => this.only('#scrTitle'));
    click('#btnNext', () => { this.only(); Game.nextStage(); });
    click('#btnRebuild', () => { this.only(); Game.rebuild(); });
    click('#btnCrashTitle', () => Game.toTitle());
    click('#btnCopy', () => this.copyNote());
    click('#btnAgain', () => { this.pendingDaily = !!(Game.run && Game.run.daily); this.only(); Game.newRun(this.pendingDaily, Game.run ? Game.run.diff : 'normal'); });
    click('#btnResTitle', () => Game.toTitle());
    $('#pauseBtn').addEventListener('pointerdown', (e) => { e.stopPropagation(); e.preventDefault(); SND.init(); this.pause(); });
    // 설정
    const s = settings;
    $('#setSound').checked = s.sound; $('#setSfx').value = s.sfx * 100; $('#setMusic').value = s.music * 100;
    $('#setFlash').checked = s.reduceFlash; $('#setQuality').value = s.quality;
    $('#setSound').addEventListener('change', (e) => { s.sound = e.target.checked; SND.apply(); saveSettings(); this.soundHint(); });
    $('#setSfx').addEventListener('input', (e) => { s.sfx = e.target.value / 100; SND.apply(); saveSettings(); });
    $('#setSfx').addEventListener('change', () => SND.play('hit'));
    $('#setMusic').addEventListener('input', (e) => { s.music = e.target.value / 100; SND.apply(); saveSettings(); });
    $('#setFlash').addEventListener('change', (e) => { s.reduceFlash = e.target.checked; saveSettings(); });
    $('#setQuality').addEventListener('change', (e) => { s.quality = e.target.value; FX.setQuality(); saveSettings(); });
    // 스팀판(데스크톱 앱): 게임 종료 버튼, 전체 화면 설정. 브라우저에서 열면 숨김
    const D = window.bhDesktop;
    if (D) {
      $('#btnQuit').classList.remove('hidden'); $('#optFull').classList.remove('hidden');
      click('#btnQuit', () => D.quit());
      const sync = () => D.isFullscreen().then((v) => { $('#setFull').checked = !!v; });
      sync(); D.onFullscreen((v) => { $('#setFull').checked = !!v; });
      $('#setFull').addEventListener('change', (e) => D.setFullscreen(e.target.checked));
    }
  },
  only(id) { for (const s of SCREENS) $(s).classList.toggle('hidden', s !== id); },
  showTitle() { this.only('#scrTitle'); $('#hud').classList.add('hidden'); this.hint(''); $('#banner').classList.add('hidden'); },
  showHUD() {
    this.only(); $('#hud').classList.remove('hidden');
    // 분대 얼굴 그리기
    $$('.mem').forEach((b, i) => { const c = b.querySelector('.pt'), im = IMG.portrait && IMG.portrait[i]; if (!im) return;
      const draw = () => { const g = c.getContext('2d'); const big = im instanceof HTMLImageElement; g.imageSmoothingEnabled = big; g.imageSmoothingQuality = 'high'; g.clearRect(0, 0, 64, 64); g.drawImage(im, 0, 0, 64, 64); };
      if (im instanceof HTMLImageElement && !im.complete) im.onload = draw; else draw(); });
    $('#stageLbl').innerHTML = (Game.S.def.tutorial ? 'TUTORIAL' : 'STAGE ' + Game.S.def.id) + ' · ' + Game.S.def.name + `<span class="diffchip" style="color:${Game.D.key === 'hard' ? '#FF4D5E' : '#aab2a3'}">${Game.D.name}</span>`;
    $('#helpBadge').classList.toggle('hidden', !Game.run.help[Game.run.stage]);
    this._hud = {};
  },
  start(daily) {
    this.pendingDaily = daily;
    // 처음 한 번만: 튜토리얼을 먼저 할지 물어봄
    if (!Store.get('tutAsked', false) && !Store.get('tutDone', false) && !this.askedMem) { this.askedMem = true; this.only('#scrAskTut'); return; }
    this.showDiff();
  },
  // 상 난이도 잠금: 중(또는 상)을 한 번 깨면 열림. 저장이 막힌 환경에서는 이번 접속 동안만 기억
  hardOpenMem: false,
  hardOpen() { return this.hardOpenMem || !!Store.get('records', {}).hardOpen; },
  // 소리가 브라우저에 막혀 있는 동안만 안내 (설정에서 소리를 끈 경우는 안내 안 함)
  soundHint() {
    const el = $('#sndHint'); if (!el) return;
    el.classList.toggle('hidden', !settings.sound || SND.running());
  },
  // ----- 도감 -----
  dexSeen(t) {
    const d = Store.get('dex', []);
    if (!d.includes(t)) { d.push(t); Store.set('dex', d); }
    this._dexMem = this._dexMem || new Set(); this._dexMem.add(t);
  },
  showDex(ret) {
    this.dexReturn = ret;
    const seen = new Set([...(Store.get('dex', [])), ...(this._dexMem || [])]);
    const body = $('#dexBody'); body.innerHTML = '';
    const h1 = document.createElement('div'); h1.className = 'dexh'; h1.textContent = '분대'; body.append(h1);
    const sq = document.createElement('div'); sq.className = 'dex'; body.append(sq);
    SQUAD_INFO.forEach((m, i) => {
      const el = document.createElement('div'); el.className = 'dx';
      const c = document.createElement('canvas'); c.width = c.height = 64;
      const im = IMG.portrait[i], dr = () => { const g = c.getContext('2d'); g.imageSmoothingEnabled = im instanceof HTMLImageElement; g.drawImage(im, 0, 0, 64, 64); };
      if (im instanceof HTMLImageElement && !im.complete) im.onload = dr; else dr();
      el.append(c);
      el.insertAdjacentHTML('beforeend', `<div class="dn">${m.name}</div><div class="dr">${m.role}</div><div class="dd">${m.desc}</div><div class="dt">약점 대상: ${m.weak}</div>`);
      sq.append(el);
    });
    const rbx = document.createElement('div'); rbx.className = 'dx';
    rbx.innerHTML = `<div style="grid-row:1/5;width:64px;height:64px;display:flex;align-items:center;justify-content:center;font-size:26px;color:#6fe7ff">◀◀</div><div class="dn">롤백</div><div class="dr">분대 스킬 · 스테이지 3부터</div><div class="dd">3초 동안 세상이 30% 속도로 느려지고, 날아오던 공격은 되감기고, 화면 고장 하나가 바로 고쳐져요.</div><div class="dt">위급할 때 버튼이 반짝여요.</div>`;
    sq.append(rbx);
    const h2 = document.createElement('div'); h2.className = 'dexh'; h2.textContent = `버그 (${DEX.filter((x) => seen.has(x.t)).length}/${DEX.length})`; body.append(h2);
    const grid = document.createElement('div'); grid.className = 'dex'; body.append(grid);
    for (const e of DEX) {
      const ok = seen.has(e.t), el = document.createElement('div'); el.className = 'dx' + (ok ? '' : ' locked');
      el.append(dexPic(e.t));
      const name = BUGDEF[e.t].name;
      el.insertAdjacentHTML('beforeend', ok
        ? `<div class="dn">${name}${weakTag(e.t)}</div><div class="dr">${e.role} · 체력 ${e.hp}</div><div class="dd">${e.desc}</div><div class="dt">공략: ${e.tip}</div>`
        : `<div class="dn">???</div><div class="dr">아직 만나지 않았어요</div><div class="dd">게임에서 처음 만나면 기록돼요.</div>`);
      grid.append(el);
    }
    this.only('#scrDex');
  },
  // ----- 안내 카드: 처음 한 번, 전투를 멈추고 설명 -----
  tutSeen: null, tutQ: [],
  tutor(key, target) {
    if (Game.isTut()) return; // 튜토리얼 모드는 자체 안내 사용
    if (!this.tutSeen) this.tutSeen = Store.get('tut', []);
    if (this.tutSeen.includes(key) || this.tutQ.some((q) => q.key === key)) return;
    let card;
    if (key.startsWith('bug_')) {
      const t = key.slice(4), e = DEX.find((x) => x.t === t); if (!e) return;
      card = { tag: '새로운 버그 · ' + e.role, title: BUGDEF[t].name, body: e.desc, weak: `공략: ${e.tip}`, pic: t };
    } else card = TUT[key];
    if (!card) return;
    this.tutQ.push({ key, card, target });
    if (Game.state === 'play') this.tutorShow();
  },
  tutorShow() {
    const q = this.tutQ[0]; if (!q) return;
    const c = q.card, el = $('#tutor');
    const pic = el.querySelector('.tpic'); pic.innerHTML = '';
    if (c.pic) pic.append(dexPic(c.pic));
    if (c.pics) c.pics.forEach((i) => { const cv = document.createElement('canvas'); cv.width = cv.height = 64; const im = IMG.portrait[i]; const g = cv.getContext('2d'); g.imageSmoothingEnabled = im instanceof HTMLImageElement; try { g.drawImage(im, 0, 0, 64, 64); } catch (e) {} pic.append(cv); });
    el.querySelector('.ttag').textContent = c.tag;
    el.querySelector('.tt').textContent = c.title;
    el.querySelector('.tb').innerHTML = c.body;
    el.querySelector('.tw').innerHTML = c.weak ? c.weak + (c.pic ? ' ' + weakTag(c.pic) : '') : '';
    el.classList.remove('hidden');
    Game.state = 'tutor'; Game.ptr.down = false; Game.tutorTarget = q.target || null;
    this.tutOpenT = performance.now();
    SND.play('click');
  },
  tutorClose() {
    if (Game.state !== 'tutor' || performance.now() - this.tutOpenT < 350) return; // 실수로 바로 닫히지 않게
    const q = this.tutQ.shift();
    if (q) { this.tutSeen.push(q.key); Store.set('tut', this.tutSeen); }
    $('#tutor').classList.add('hidden');
    Game.state = 'play'; Game.last = performance.now(); Game.tutorTarget = null;
    if (this.tutQ.length) setTimeout(() => { if (Game.state === 'play') this.tutorShow(); }, 120);
  },
  showDiff() {
    const open = this.hardOpen(), hc = $('.dcard.hard');
    hc.classList.toggle('locked', !open);
    hc.setAttribute('aria-disabled', String(!open));
    hc.querySelector('.dd').textContent = open
      ? '버그가 끝없이 몰려오고 갑자기 돌진해요. 복제 버그는 엉뚱한 곳으로 튀고, 패치 건이 과열돼요. 가짜 핫픽스도 섞여 있어요.'
      : '🔒 난이도 중을 한 번 깨면 열려요.';
    if (!open && Store.get('diff', 'normal') === 'hard') Store.set('diff', 'normal');
    $('#diffMode').textContent = this.pendingDaily ? '오늘의 빌드 ' + DAILY_VER : '정식 빌드';
    const last = Store.get('diff', 'normal');
    $$('.dcard').forEach((b) => b.classList.toggle('last', b.dataset.d === last));
    this.only('#scrDiff');
  },
  pause() {
    if (Game.state !== 'play') return;
    Game.state = 'paused'; Game.ptr.down = false;
    if (SND.ctx) SND.ctx.suspend();
    this.only('#scrPause');
  },
  resume() {
    this.only(); Game.state = 'play'; Game.last = performance.now();
    if (SND.ctx) SND.ctx.resume();
  },
  showSettings(ret) { this.setReturn = ret; this.only('#scrSettings'); },
  showRecords() {
    const rec = Store.get('records', {});
    const st = rec.stages || {};
    let h = '<table><tr><th>스테이지</th><th>최고 점수</th><th>최고 정확도</th></tr>';
    STAGES.forEach((d, i) => { const s = st[i]; h += `<tr><td>${d.id}. ${d.name}</td><td>${s ? s.score.toLocaleString() : '-'}</td><td>${s ? Math.round(s.acc * 100) + '%' : '-'}</td></tr>`; });
    h += '</table>';
    const daily = rec.daily && rec.daily.date === TODAY_KEY ? rec.daily.grade : '-';
    h += `<p style="font-size:13px">오늘의 빌드 <b style="color:var(--lime)">${DAILY_VER}</b> 최고 등급: <b>${daily}</b>` + (rec.best ? ` · 전체 최고 점수 <b>${rec.best.toLocaleString()}</b>` : '') + '</p>';
    const ch = rec.ch || {};
    h += '<div class="ch"><b>도전 과제</b>' + CHALLENGES.map(([k, n]) => `<span class="${ch[k] ? 'ok' : 'no'}">${ch[k] ? '✔' : '□'} ${n}</span>`).join('') + '</div>';
    $('#recBody').innerHTML = h;
    this.only('#scrRecords');
  },
  banner(a, b, dur, big) {
    const el = $('#banner'); el.querySelector('.b1').textContent = a; el.querySelector('.b2').textContent = b;
    el.classList.remove('hidden'); el.classList.toggle('big', !!big); Game.bannerT = dur;
  },
  hint(txt, dur = 0) {
    const el = $('#hint');
    if (!txt) { el.classList.add('hidden'); Game.hintT = 0; return; }
    el.textContent = txt; el.classList.remove('hidden'); Game.hintT = dur || 9999;
  },
  toast(txt) { const el = $('#toast'); el.textContent = txt; el.classList.remove('hidden'); Game.toastT = 1.8; },
  tick(dt) {
    if (Game.bannerT > 0) { Game.bannerT -= dt; if (Game.bannerT <= 0) $('#banner').classList.add('hidden'); }
    if (Game.hintT > 0 && Game.hintT < 9000) { Game.hintT -= dt; if (Game.hintT <= 0) $('#hint').classList.add('hidden'); }
    if (Game.toastT > 0) { Game.toastT -= dt; if (Game.toastT <= 0) $('#toast').classList.add('hidden'); }
    if (!Game.run || !Game.S || $('#hud').classList.contains('hidden')) return;
    this.clTick(dt);
    const r = Game.run, S = Game.S, H = this._hud;
    const set = (k, v, fn) => { if (H[k] !== v) { H[k] = v; fn(v); } };
    set('stab', Math.round(r.stab), (v) => { $('#stabFill').style.width = v + '%'; $('#stabFill').classList.toggle('low', v <= 30); $('#stabTxt').textContent = v + '%'; });
    set('prog', Math.round((S.ratio || 0) * 100), (v) => { $('#progFill').style.width = v + '%'; $('#progTxt').textContent = (S.def.boss ? `오류 줄 ${Boss.fixed}/16 · ` : '고친 비율 ') + v + '%'; });
    set('score', r.score, (v) => { $('#scoreTxt').textContent = v.toLocaleString(); });
    set('mult', Game.mult().toFixed(1), (v) => { const el = $('#comboTxt'); el.textContent = '연속 ×' + v; el.style.color = v === '2.0' ? '#FFD34D' : ''; });
    set('gl', Game.glitches.map((g) => g.type + Math.ceil(g.t)).join(), () => {
      $('#glitchList').innerHTML = Game.glitches.map((g) => `<div>⚠ ${GLITCH[g.type].name} ${Math.ceil(g.t)}s</div>`).join('');
    });
    set('w', Game.weapon + '|' + Game.unlocked(1) + Game.unlocked(2) + '|' + S.rb + '|' + (Game.rollT > 0), () => {
      $$('.mem').forEach((b) => { const i = +b.dataset.m; b.classList.toggle('sel', i === Game.weapon); b.classList.toggle('locked', !Game.memberUnlocked(i)); });
      const rb = $('.wpn.rb');
      rb.classList.toggle('locked', !Game.unlocked(2));
      $('#rbCount').textContent = '×' + S.rb;
      rb.classList.toggle('empty', S.rb <= 0);
      rb.classList.toggle('on', Game.rollT > 0);
    });
    set('sug', Game.suggest + '|' + !!Game.suggestRb, () => {
      $$('.mem').forEach((b) => b.classList.toggle('suggest', +b.dataset.m === Game.suggest));
      $('.wpn.rb').classList.toggle('suggest', !!Game.suggestRb);
    });
    // 탄약 막대
    Game.squad.forEach((q, i) => {
      const v = q.reloadT > 0 ? Math.round((1 - q.reloadT / q.d.reload) * 100) : Math.round(q.ammo / q.d.mag * 100);
      set('am' + i, v + (q.reloadT > 0 ? 'r' : ''), () => { const b = $$('.mem')[i]; b.querySelector('.am i').style.width = v + '%'; b.classList.toggle('rel', q.reloadT > 0); });
    });
  },
  // ----- 패치 로그 (왼쪽 코드 창) -----
  clQ: [], clT: 0,
  codeStart(def) {
    $('#codeLogBody').innerHTML = ''; this.clQ = [];
    this.clPush([['cmd', `$ build stage${def.id}.${def.key} --watch`], ['trace', `  ${def.boss ? 'mainLoop()' : 'world'} 로딩 중…`], ['ok', '  ready. 버그 감시 시작']]);
  },
  clPush(lines) {
    this.clQ.push(...lines);
    if (this.clQ.length > 18) this.clQ.splice(0, this.clQ.length - 18); // 너무 밀리면 오래된 줄 건너뛰기
  },
  codeFix(type, seg) {
    const r = Math.random, P = (a) => a[Math.floor(r() * a.length)];
    const v = P(['player', 'enemy', 'tree', 'texture', 'camera', 'score', 'sound', 'saveData', 'mesh', 'input', 'npc', 'shader']);
    const m = P(['update', 'render', 'load', 'spawn', 'move', 'draw', 'sync', 'init', 'apply', 'reset']);
    const n = Math.floor(r() * 900 + 100);
    const T = {
      basic: [[`- ${v}.${m}(${v}.data);`, `+ ${v}?.${m}(${v}.data ?? {});`], [`- if (${v} = null) return;`, `+ if (${v} === null) return;`], [`- ${m}(${v}, undefinde);`, `+ ${m}(${v}, undefined);`]],
      clone: [[`- for (i = 0; i <= ${v}s.length; i++)`, `+ for (i = 0; i < ${v}s.length; i++)`], [`- copy(copy(${v}));`, `+ copy(${v});`]],
      mini: [[`- ${v}s.push(${v});`, `+ if (!${v}s.has(${v})) ${v}s.add(${v});`], [`- dup(${v});`, `+ // 중복 호출 제거`]],
      ghost: [[`- ${v}.alpha = undefined;`, `+ ${v}.alpha = 1.0;`], [`- ${v}.visible = Math.random() > .5;`, `+ ${v}.visible = true;`]],
      e404: [[`- fetch("/${v}.json")`, `+ fetch("/assets/${v}.json")`], [`- load("${v}_final_v2.png")`, `+ load("${v}.png")`]],
      loop: [[`- while (true) ${m}();`, `+ while (running) ${m}();`], [`- function ${m}() { ${m}(); }`, `+ function ${m}() { if (done) return; }`]],
      hotfix: [[`+ stability += 20;`, `+ glitches.clear();`]],
    };
    let pair = seg ? [`- ${CODE[seg.i][1].trim()}`, `+ ${CODE[seg.i][0].trim()}`] : P(T[type] || T.basic);
    const file = seg ? 'mainLoop' : type === 'hotfix' ? 'hotfix' : v;
    const lines = type === 'hotfix'
      ? [['cmd', '$ deploy hotfix --now'], ['add', '  ' + pair[0]], ['add', '  ' + pair[1]]]
      : [['cmd', `@@ ${file}.js:${n} @@`], ['del', pair[0]], ['add', pair[1]], ['cmd', `$ run ${file}.js`]];
    lines.push(['ok', `✔ Run Successfully (${Math.floor(r() * 40 + 3)}ms)`]);
    this.clPush(lines);
  },
  codeError(type) {
    const r = Math.random, P = (a) => a[Math.floor(r() * a.length)];
    const v = P(['player', 'world', 'camera', 'ui', 'physics', 'audio', 'render']);
    const msg = {
      basic: `TypeError: ${v}.update is not a function`, clone: `RangeError: ${v} 복제가 너무 많음`, mini: `Warning: 중복된 ${v} 발견`,
      trojan: `SecurityError: hotfix.exe 는 핫픽스가 아닙니다`,
      ghost: `ReferenceError: ${v} is not defined`, e404: `404 Not Found: /${v}.json`, loop: `RangeError: Maximum call stack size exceeded`,
      packet: `UncaughtException: throw new Error("${v}")`, missile: `FatalError: infiniteLoop() 관통 — 엄폐 무시`,
    }[type] || `Error: ${v} 붕괴`;
    const code = String(Math.floor(r() * 1e6)).padStart(6, '0');
    this.clPush([['cmd', `$ run ${v}.js`], ['del', msg], ['trace', `    at ${v}.tick (${v}.js:${Math.floor(r() * 900 + 10)}:${Math.floor(r() * 80 + 1)})`], ['err', `✖ Run Error(0x${code})`]]);
  },
  clTick(dt) {
    if (!this.clQ.length) return;
    this.clT -= dt;
    let n = this.clQ.length > 8 ? 3 : 1; // 밀리면 빨리 찍기
    if (this.clT > 0) return;
    this.clT = 0.035;
    const body = $('#codeLogBody');
    while (n-- > 0 && this.clQ.length) {
      const [cls, txt] = this.clQ.shift();
      const d = document.createElement('div'); d.className = cls; d.textContent = txt;
      body.appendChild(d);
      while (body.children.length > 14) body.removeChild(body.firstChild);
    }
  },
  showClear() {
    const r = Game.run, i = Game.S.idx, res = r.stageRes[i];
    $('#clrTitle').textContent = `패치 완료 ${i + 1}/5`;
    $('#clrStats').innerHTML = [
      ['스테이지', STAGES[i].name], ['고친 버그', res.fixed + '마리'], ['정확도', Math.round(res.acc * 100) + '%'],
      ['걸린 시간', fmtTime(res.time)], ['시간 보너스', '+' + res.timeBonus.toLocaleString()], ['안정성 회복', '+30% → ' + Math.round(r.stab) + '%'],
    ].map(([k, v]) => `<span class="k">${k}</span><span class="v">${v}</span>`).join('') + `<span class="k full">총점</span><span class="v full">${r.score.toLocaleString()}</span>`;
    $('#btnNext').textContent = i === 3 ? '보스 "메인 루프" ▶' : '다음 스테이지 ▶';
    this.only('#scrClear');
  },
  showCrash() {
    $('#hud').classList.add('hidden'); this.hint('');
    const msgs = [
      '패치 스쿼드가 버그에게 졌습니다. 아이러니하네요.',
      '안정성이 0%가 되어 세상이 잠시 멈췄습니다.',
      '버그를 잡으러 왔다가 버그가 되었습니다.',
      'Ctrl+Z를 눌렀지만 아무 일도 일어나지 않았습니다.',
      '이 오류는 개발자도 처음 봅니다. (진짜예요)',
      '버그들이 축하 파티를 열고 있습니다.',
    ];
    $('#crashMsg').textContent = pick(msgs, Math.random);
    const r = Game.run, help = r.help[r.stage];
    $('#crashCode').textContent =
      `ERR_TOO_MANY_BUGS  (0xB06${r.stage + 1}${r.st.crashes % 10})\n` +
      `at stage${r.stage + 1}.${STAGES[r.stage].key}()\n` +
      `at patchSquad.patch(stability = 0%)\n\n` +
      (STAGES[r.stage].boss && (r.bossCk || 1) > 1 ? `> 체크포인트: 보스 ${r.bossCk}단계부터 다시 빌드합니다.` : `> 이 스테이지 처음부터 다시 빌드합니다. 판 전체는 유지돼요.`) +
      (help ? `\n> 도움 모드 ON: 버그 속도 -20% · 적 공격 느리게 · 피해 -20% · 엄폐물 +40%` : '');
    this.only('#scrCrash');
  },
  grade() {
    const r = Game.run, acc = r.st.shots ? r.st.hits / r.st.shots : 0;
    if (r.help.some((x) => x)) return '출시 연기';
    if (acc >= 0.7 && r.st.crashes === 0 && r.stab >= 50) return '정식 출시';
    if (acc >= 0.5 && r.st.crashes <= 2) return '베타';
    return '알파';
  },
  showResult() {
    const r = Game.run;
    MUS.startTitle();
    $('#hud').classList.add('hidden'); this.hint('');
    const stabBonus = Math.round(r.stab) * 10;
    if (!r.finalized) { r.score += stabBonus; r.finalized = true; r.stabBonus = stabBonus; }
    const acc = r.st.shots ? r.st.hits / r.st.shots : 0;
    const grade = this.grade(); r.grade = grade;
    $('#resMode').textContent = (r.daily ? '오늘의 빌드 ' + DAILY_VER : '정식 빌드') + ' · 난이도 ' + Game.D.name;
    $('#resGrade').textContent = grade;
    const f = r.st.fixed;
    $('#resStats').innerHTML = [
      ['총점', r.score.toLocaleString()], ['정확도', Math.round(acc * 100) + '%'], ['크래시', r.st.crashes + '회'], ['남은 안정성', Math.round(r.stab) + '% (+' + r.stabBonus.toLocaleString() + ')'],
      ['기본 / 복제 / 작은 복제', `${f.basic} / ${f.clone} / ${f.mini}`], ['throw / 투명 / 404 / 무한루프', `${f.throw || 0} / ${f.ghost} / ${f.e404} / ${f.loop}`],
      ['엄폐물로 막은 공격 / 미사일 격추', `${r.st.blocked} / ${r.st.missiles}`],
      ['보스 오류 줄', f.boss + '/16 · ' + fmtTime(r.st.bossTime)], ['최대 연속 패치', r.maxStreak + '회'], ['PERFECT / 핫픽스', `${r.st.perfect} / ${r.st.hotfix}`],
    ].map(([k, v]) => `<span class="k">${k}</span><span class="v">${v}</span>`).join('');
    const note = this.patchNote(grade, acc);
    $('#resNote').textContent = note; $('#resNoteTa').value = note;
    $('#resNoteTa').classList.add('hidden'); $('#resNote').classList.remove('hidden');
    $('#btnCopy').textContent = '패치 노트 복사';
    // 기록 · 도전 과제
    const rec = Store.get('records', {});
    rec.best = Math.max(rec.best || 0, r.score);
    if (r.daily) {
      const cur = rec.daily && rec.daily.date === TODAY_KEY ? rec.daily.grade : null;
      if (!cur || GRADES.indexOf(grade) < GRADES.indexOf(cur)) rec.daily = { date: TODAY_KEY, grade };
    }
    rec.ch = rec.ch || {};
    const got = [];
    const earn = (k, ok) => { if (ok && !rec.ch[k]) { rec.ch[k] = true; got.push(CHALLENGES.find((c) => c[0] === k)[1]); } };
    earn('release', grade === '정식 출시');
    earn('nocrash', r.st.crashes === 0);
    earn('norollback', r.st.rollbacks === 0);
    earn('acc90', acc >= 0.9);
    earn('blast5', r.st.blastMax >= 5);
    earn('boss90', r.st.bossTime > 0 && r.st.bossTime <= 90);
    earn('hard', r.diff === 'hard');
    earn('hardrelease', r.diff === 'hard' && grade === '정식 출시');
    let unlocked = false;
    if ((r.diff === 'normal' || r.diff === 'hard') && !this.hardOpen()) { rec.hardOpen = true; this.hardOpenMem = true; unlocked = true; }
    Store.set('records', rec);
    $('#resChal').textContent = (unlocked ? '🔓 난이도 상이 열렸어요! ' : '') + (got.length ? '🏆 새 도전 과제: ' + got.join(', ') : '');
    if (unlocked) SND.play('unlock');
    this.only('#scrResult');
  },
  patchNote(grade, acc) {
    const r = Game.run, st = r.st, f = st.fixed;
    const rr = mulberry32(r.score + st.shots);
    const ver = r.daily ? DAILY_VER : 'v1.0.' + st.crashes;
    const kinds = [['기본', f.basic], ['복제', f.clone + f.mini], ['throw', f.throw || 0], ['투명', f.ghost], ['404', f.e404], ['무한루프', f.loop]].sort((a, b) => b[1] - a[1]);
    const lines = [`${kinds[0][0]} 버그 ${kinds[0][1]}마리 수정`];
    const glName = { tear: '화면 찢어짐', inv: '색 반전', flip: '화면 뒤집힘', slip: '조준 미끄러짐', pix: '픽셀화' };
    const topG = Object.entries(st.glitch).sort((a, b) => b[1] - a[1])[0];
    const total = Object.values(f).reduce((a, b) => a + b, 0);
    const miss = st.shots - st.hits;
    const pool = [];
    const add = (cond, txt, w = 1) => { if (cond) pool.push([txt, w + rr()]); };
    add(topG[1] > 0, `${glName[topG[0]]} 버그를 ${topG[1]}회 경험했습니다 (죄송합니다)`, 3);
    add(st.bossTime > 0, `메인 루프를 ${Math.floor(st.bossTime / 60)}분 ${Math.round(st.bossTime % 60)}초 만에 정상화`, 4);
    add(st.crashes > 0, `크래시 ${st.crashes}회 후 재빌드 성공 (끈기 +1)`, 2);
    add(st.crashes === 0, '크래시 0회 — 이번 빌드는 놀랍도록 안정적입니다', 2);
    add(true, `정확도 ${Math.round(acc * 100)}% — 손 떨림 패치 ${acc >= 0.9 ? '불필요' : '예정'}`, 1);
    add(st.rollbacks > 0, `롤백으로 시간을 ${st.rollbacks}번 되감음`, 1);
    add(st.rollbacks === 0, '롤백 없이 출시 (용감함)', 1.5);
    add(r.maxStreak >= 10, `최대 연속 패치 ${r.maxStreak}회 달성`, 1.5);
    add(f.ghost > 0, `투명 버그 ${f.ghost}마리를 눈치로 잡음`, 1);
    add(f.loop > 0, `무한루프 ${f.loop}개 탈출 성공`, 1);
    add(f.mini > 0, `작은 복제 버그 ${f.mini}마리 정리 (복붙 금지)`, 1);
    add(r.help.some((x) => x), '도움 모드로 버그 속도 15% 하향 조정', 2);
    add(true, `안정성 ${Math.round(r.stab)}%로 출시`, 0.5);
    add(miss > 0, `헛발질 ${miss}발 — 탄약이 무제한이라 다행`, 1);
    add(st.blastMax >= 3, `한 방에 복제 버그 ${st.blastMax}마리 동시 수정`, 1.5);
    add(true, `총 ${total}개의 버그가 세상에서 사라졌습니다`, 0.8);
    add(st.perfect >= 5, `PERFECT 패치 ${st.perfect}회 — 정밀 디버깅 장인`, 2);
    add(st.hotfix > 0, `핫픽스 ${st.hotfix}개 긴급 배포`, 1.2);
    add(st.weak >= 8, `약점 무기로 ${st.weak}마리 공략 — 분대 운용 만점`, 2);
    add(st.blocked >= 10, `엄폐물로 에러 패킷 ${st.blocked}개 방어 — 숨기 장인`, 2.2);
    add(st.missiles > 0, `관통 미사일 ${st.missiles}발 격추`, 1.8);
    add(st.overheat > 0, `패치 건 과열 ${st.overheat}회 — 냉각 팬 교체 예정`, 2.5);
    add(st.trojan > 0, `트로이 목마 핫픽스 ${st.trojan}개에 속음 (보안팀 호출)`, 3);
    add(st.dash >= 5, `돌진 버그 ${st.dash}마리와 정면 승부`, 1.5);
    pool.sort((a, b) => b[1] - a[1]);
    for (const p of pool.slice(0, 2)) lines.push(p[0]);
    const known = [];
    if (st.tele > 0) known.push(`알려진 문제: 플레이어가 404 버그를 ${st.tele}번 놓침`);
    if (st.contacts > 0) known.push(`알려진 문제: 버그와 ${st.contacts}번 부딪힘 (안전모 지급 예정)`);
    known.push('알려진 문제: 정상화된 메인 루프가 가끔 웃음');
    known.push('알려진 문제: 텍스처 없는 숲이 너무 예뻐짐');
    lines.push(known[0]);
    return `🐛 Patch Squad ${ver} 패치 노트 — 등급: ${grade} · 난이도 ${Game.D.name}\n` + lines.map((l) => '• ' + l).join('\n') + `\n점수 ${r.score.toLocaleString()} · #패치스쿼드`;
  },
  copyNote() {
    const text = $('#resNote').textContent;
    const done = () => { $('#btnCopy').textContent = '복사됨 ✔'; this.toast('패치 노트를 복사했어요'); };
    const fallback = () => {
      const ta = $('#resNoteTa');
      ta.classList.remove('hidden'); $('#resNote').classList.add('hidden');
      ta.focus(); ta.select();
      let ok = false; try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
      if (ok) done(); else { $('#btnCopy').textContent = '글자를 선택해 Ctrl+C'; this.toast('복사가 막혀 있어요 — 글자를 선택해 Ctrl+C로 복사하세요'); }
    };
    try {
      if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(text).then(done, fallback);
      else fallback();
    } catch (e) { fallback(); }
  },
};
function fmtTime(s) { s = Math.max(0, s || 0); return Math.floor(s / 60) + ':' + String(Math.floor(s % 60)).padStart(2, '0'); }

// 시작
window.addEventListener('load', () => {
  try { UI.init(); Game.init(); }
  catch (e) {
    document.body.innerHTML = '<div style="padding:24px;color:#eee;font-family:sans-serif">이 기기에서 3D(WebGL)를 시작할 수 없어요.<br>다른 브라우저로 열어 주세요.<br><small style="color:#888">' + String(e && e.message || e) + '</small></div>';
  }
});
