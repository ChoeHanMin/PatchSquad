// ---------- 스토리: 인트로 · 스테이지 대사 · 엔딩 ----------
// 그림: assets/story_intro1~5.png, story_end1~4.png 가 있으면 그 그림, 없으면 게임 그림으로 장면을 꾸밈
const STORY = {
  intro: [
    { pic: 'intro1', t: L('IN A WORLD CALLED A GAME...', 'IN A WORLD CALLED A GAME...', 'IN A WORLD CALLED A GAME...', 'IN A WORLD CALLED A GAME...'), b: L('게임이라는 세계가 있었습니다.<br>그 심장 <b>메인 루프</b>는 1초에 60번, 세상을 그리고 움직이고 기억합니다.', 'There is a world called a game.<br>Its heart, the <b>Main Loop</b>, draws, moves and remembers the world 60 times a second.', 'ゲームという世界があった。<br>その心臓<b>メインループ</b>は1秒に60回、世界を描き、動かし、記憶する。', '有一个名为“游戏”的世界。<br>它的心脏<b>主循环</b>每秒60次描绘、驱动并记住这个世界。'), art: 'loop' },
    { pic: 'intro2', t: L('누군가 서둘러 만들다 망가뜨렸습니다', 'Someone built it in a hurry... and broke it', '誰かが急いで作り、壊してしまった', '有人匆忙制作，却把它弄坏了'), b: L('텍스처는 사라지고, 건물은 복붙되고, 물리 법칙은 고장 났습니다.', 'The textures vanished, the buildings got copy-pasted, and the laws of physics stopped working.', 'テクスチャは消え、建物はコピペされ、物理法則は壊れた。', '贴图消失了，建筑被复制粘贴，物理法则也坏掉了。'), art: 'broken' },
    { pic: 'intro3', t: L('깨진 코드 틈에서 버그가 기어 나왔습니다', 'Bugs crawled out of the broken code', '壊れたコードのすき間からバグが這い出してきた', 'Bug从破损代码的缝隙中爬了出来'), b: L('버그가 늘어날수록 세상의 <b>안정성</b>이 떨어집니다.<br>0%가 되면 모든 것이 멈춥니다. <b>CRASH.</b>', 'The more bugs there are, the lower the world\'s <b>Stability</b> falls.<br>At 0%, everything stops. <b>CRASH.</b>', 'バグが増えるほど、世界の<b>安定性</b>が下がっていく。<br>0%になれば、すべてが止まる。<b>CRASH.</b>', 'Bug越多，世界的<b>稳定性</b>就越低。<br>降到0%时，一切都会停止。<b>CRASH.</b>'), art: 'bugs' },
    { pic: 'intro4', t: L('그래서 그들이 출동했습니다', 'So they were deployed', 'そして彼らが出動した', '于是，他们出动了'), b: L('버그를 죽이지 않고 <b>고치는</b> 패치 건을 든 버그 수리 분대.<br><b>패치 스쿼드.</b>', 'A bug-repair squad armed with patch guns that don\'t kill bugs — they <b>fix</b> them.<br><b>The Patch Squad.</b>', 'バグを倒すのではなく<b>直す</b>パッチガンを持ったバグ修理分隊。<br><b>パッチ・スクワッド。</b>', '手持补丁枪、不消灭Bug而是<b>修复</b>它们的Bug维修小队。<br><b>补丁小队。</b>'), art: 'squad' },
    { pic: 'intro5', t: L('도트', 'Dot', 'ドット', '多特'), b: L('"버그는 재현만 되면 잡을 수 있어.<br>회색 숲부터 고치자. 가자!"', '"If a bug can be reproduced, it can be fixed.<br>Let\'s start with the grey forest. Move out!"', '「再現できるバグなら、必ず直せる。<br>まずは灰色の森からだ。行くぞ!」', '“只要能复现的Bug，就一定能修好。<br>先从灰色森林开始。出发！”'), art: 'dot' },
  ],
  ending: [
    { pic: 'end1', t: 'BUILD SUCCESS', b: L('폭주하던 메인 루프가 다시 박자를 찾았습니다.', 'The runaway Main Loop found its rhythm again.', '暴走していたメインループが、再びリズムを取り戻した。', '失控的主循环重新找回了节奏。'), art: 'loop' },
    { pic: 'end2', t: L('색과 음악이 돌아왔습니다', 'Color and music returned', '色と音楽が戻ってきた', '色彩和音乐回来了'), b: L('회색 선뿐이던 숲에도, 복붙 도시에도, 지하철에도.<br>세상 전체에 색이 차올랐습니다.', 'To the grey forest, the copy-paste city, the subway.<br>Color flooded back into the whole world.', '灰色の森にも、コピペシティにも、地下鉄にも。<br>世界中に色が満ちていった。', '无论是灰色森林、复制粘贴之城，还是地铁。<br>整个世界都重新充满了色彩。'), art: 'world' },
    { pic: 'end3', t: L('패치 스쿼드', 'The Patch Squad', 'パッチ・スクワッド', '补丁小队'), b: L('도트: "수고했어, 다들."<br>렉스: "다음 버그는 어디야? 다 갈아엎어 주지!"<br>핀: "…방금 메인 루프가 웃은 것 같은데."<br>에이다: "회귀 테스트까지 통과! 완벽해."', 'Dot: "Good work, everyone."<br>Rex: "Where\'s the next bug? I\'ll refactor it all!"<br>Pin: "...Did the Main Loop just smile?"<br>Ada: "Regression tests passed! Perfect."', 'ドット:「おつかれ、みんな。」<br>レックス:「次のバグはどこだ? 全部リファクタしてやる!」<br>ピン:「…今、メインループが笑った気がする。」<br>エイダ:「回帰テストもパス! 完璧!」', '多特：“辛苦了，大家。”<br>雷克斯：“下一个Bug在哪？我全给它重构了！”<br>平：“……刚才主循环好像笑了。”<br>艾达：“回归测试也通过了！完美。”'), art: 'squad' },
    { pic: 'end4', t: L('그런데…', 'But...', 'でも…', '可是……'), b: L('이 세계를 처음 망가뜨린 건<br>누구였을까?<br><br><b>— 1장 끝 · 다음 임무 준비 중 —</b>', 'who broke this world<br>in the first place?<br><br><b>— END OF CHAPTER 1 · NEXT MISSION IN PREPARATION —</b>', 'この世界を最初に壊したのは<br>誰だったのだろう?<br><br><b>— 第1章 完 · 次の任務 準備中 —</b>', '最初把这个世界弄坏的<br>到底是谁？<br><br><b>— 第1章 完 · 下一个任务准备中 —</b>'), art: 'mystery' },
  ],
  adaJoin: [
    { pic: 'ada_join', t: L('새 분대원 합류', 'A new squad member', '新メンバー合流', '新队员加入'), b: L('에이다: "안녕! 오늘부터 QA 담당 에이다야.<br>테스트 안 한 코드는 고장 난 코드라고~ 서버실은 내가 맡을게!"', 'Ada: "Hi! I\'m Ada, your new QA tester.<br>Untested code is broken code~ Leave the server room to me!"', 'エイダ:「やっほー! 今日からQA担当のエイダだよ。<br>テストしてないコードは壊れたコード~ サーバールームは任せて!」', '艾达：“嗨！我是今天起负责QA的艾达。<br>没测过的代码就是坏代码~ 服务器机房交给我吧！”') },
  ],
  // 스테이지 시작 대사: [분대원 번호(0 도트·1 렉스·2 핀), 대사]
  lines: [
    [0, L('회색 숲이네. 고치는 만큼 색이 돌아올 거야.', 'A grey forest. Every bug we fix brings the color back.', '灰色の森か。直すたびに色が戻ってくるはずだ。', '灰色的森林啊。每修好一个，色彩就会回来。')],
    [1, L('복붙엔 산탄이지! 한꺼번에 갈아엎자!', 'Copy-paste? That calls for a Spread shot! Let\'s refactor them all!', 'コピペには散弾だろ! まとめてリファクタだ!', '复制粘贴就得用散弹！一起重构掉！')],
    [2, L('…보이지 않는 버그가 있어. 그건 내가 맡을게.', '...There are bugs you can\'t see. Leave those to me.', '…見えないバグがいる。それは私が引き受ける。', '……有看不见的Bug。那些交给我。')],
    [3, L('안녕, 신입 테스터 에이다야! 테스트 안 한 코드는 고장 난 코드라고~', 'Hi, I\'m Ada, your new tester! Untested code is broken code~', 'やっほー、新人テスターのエイダだよ! テストしてないコードは壊れたコードだからね~', '嗨，我是新来的测试员艾达！没测过的代码就是坏代码哦~')],
    [0, L('중력이 제멋대로야. 미사일은 숨어도 맞으니까 쏴서 떨어뜨려!', 'Gravity\'s gone haywire. Missiles hit you even in cover — shoot them down!', '重力がめちゃくちゃだ。ミサイルは隠れても当たるから撃ち落とせ!', '重力乱套了。导弹隐蔽也会被击中，把它们打下来！')],
    [1, L('저게 메인 루프야? 세상의 심장이 폭주하고 있어!', 'That\'s the Main Loop? The heart of the world is running wild!', 'あれがメインループ? 世界の心臓が暴走してる!', '那就是主循环？世界的心脏正在失控！')],
  ],
};

const Story = {
  active: false, list: null, i: 0, done: null, readyT: 0,
  // 장면 그림: ChatGPT 그림이 있으면 그것, 없으면 게임 그림으로 꾸밈
  art(p) {
    const big = ASSETS['story_' + p.pic];
    if (big) return `<img class="stbig" src="${big}" alt="">`;
    const im = (k, cls = '') => (ASSETS[k] ? `<img class="${cls}" src="${ASSETS[k]}" alt="">` : '');
    const S = ['dot', 'rex', 'pin'];
    switch (p.art) {
      case 'loop': return `<div class="stc">${im('bug_loop', 'sthero')}</div>`;
      case 'broken': return `<div class="stc stgrey">${im('cover_side_city', 'stwall')}${im('cover_city', 'stcover')}</div>`;
      case 'bugs': return `<div class="stc strow">${['bug_basic', 'bug_clone', 'bug_throw', 'bug_ghost', 'bug_404'].map((k) => im(k, 'stbug')).join('')}</div>`;
      case 'squad': return `<div class="stc strow">${SQUAD.map((d) => im('char_' + d.key, 'stchar')).join('')}</div>`;
      case 'dot': return `<div class="stc">${im('char_dot', 'stchar big')}</div>`;
      case 'world': return `<div class="stc strow">${['cover_forest', 'cover_city', 'cover_subway'].map((k) => im(k, 'stcov')).join('')}</div>`;
      case 'mystery': return `<div class="stc"><div class="stq">?</div></div>`;
      default: return '';
    }
  },
  play(list, done) {
    this.active = true; this.list = list; this.i = -1; this.done = done;
    $('#story').classList.remove('hidden');
    this.next();
  },
  next() {
    if (!this.active || performance.now() < this.readyT) return;
    this.i++;
    if (this.i >= this.list.length) return this.finish();
    const p = this.list[this.i];
    const el = $('#story');
    el.querySelector('.stpic').innerHTML = this.art(p);
    el.querySelector('.stt').textContent = p.t;
    el.querySelector('.stb').innerHTML = p.b;
    el.querySelector('.stn').textContent = `${this.i + 1} / ${this.list.length}`;
    el.classList.remove('stin'); void el.offsetWidth; el.classList.add('stin');
    SND.play(this.i === 0 ? 'phase' : 'click');
    this.readyT = performance.now() + 450; // 실수로 바로 넘어가지 않게
  },
  finish() {
    this.active = false; $('#story').classList.add('hidden');
    const d = this.done; this.done = null; if (d) d();
  },
  intro(done) { this.play(STORY.intro, () => { Store.set('introSeen', true); if (done) done(); }); },
  ending(done) { this.play(STORY.ending, done); },
  // 에이다가 합류하는 스테이지 직전 (처음 한 번)
  beforeStage(idx, go) { if (STAGES[idx] && STAGES[idx].join === 3 && !Store.get('adaSeen', false)) { Store.set('adaSeen', true); return this.play(STORY.adaJoin, go); } go(); },
  // 스테이지 시작 한마디 (화면 왼쪽 아래, 얼굴 + 이름 + 대사)
  say(stageIdx) {
    const ln = STORY.lines[stageIdx]; if (!ln) return;
    const [m, text] = ln, el = $('#say');
    const c = el.querySelector('canvas'), g = c.getContext('2d'), im = IMG.portrait && IMG.portrait[m];
    g.clearRect(0, 0, 64, 64); if (im) { g.imageSmoothingEnabled = im instanceof HTMLImageElement; g.drawImage(im, 0, 0, 64, 64); }
    el.querySelector('.sayn').textContent = SQUAD[m].name;
    el.querySelector('.sayn').style.color = SQUAD[m].color;
    el.querySelector('.sayt').textContent = text;
    el.classList.remove('hidden', 'sayout'); void el.offsetWidth; el.classList.add('sayin');
    clearTimeout(this.sayT); clearTimeout(this.sayT2);
    this.sayT = setTimeout(() => el.classList.add('sayout'), 4200);
    this.sayT2 = setTimeout(() => el.classList.add('hidden'), 4700);
  },
  bind() {
    const el = $('#story');
    el.addEventListener('pointerdown', (e) => { if (e.target.closest('.stskip')) return; e.preventDefault(); this.next(); });
    el.querySelector('.stskip').addEventListener('click', (e) => { e.stopPropagation(); SND.play('click'); this.finish(); });
    window.addEventListener('keydown', (e) => {
      if (!this.active) return;
      if (e.key === 'Escape') { e.preventDefault(); e.stopImmediatePropagation(); this.finish(); return; }
      if (e.code === 'Space' || e.key === 'Enter') { e.preventDefault(); e.stopImmediatePropagation(); this.next(); }
    }, true);
  },
};
