// ---------- 화면 · HUD ----------
const SCREENS = ['#scrTitle', '#scrAskTut', '#scrDiff', '#scrDex', '#scrPause', '#scrSettings', '#scrRecords', '#scrClear', '#scrCrash', '#scrResult', '#scrLang', '#scrDev', '#scrKeys'];
const CHALLENGES = [
  ['release', L('정식 출시 등급 받기', 'Get the Released grade', '「正式リリース」評価を獲得', '获得“正式发布”评价')],
  ['nocrash', L('무사고 (크래시 0회로 클리어)', 'Zero Crashes (clear with no crashes)', 'ノークラッシュ (クラッシュ0回でクリア)', '零崩溃（无崩溃通关）')],
  ['norollback', L('롤백 없이 클리어', 'Clear without Rollback', 'ロールバックなしでクリア', '不使用回滚通关')],
  ['acc90', L('정확도 90% 이상으로 클리어', 'Clear with 90%+ accuracy', '命中率90%以上でクリア', '命中率90%以上通关')],
  ['blast5', L('리팩터 한 방에 복제 버그 5마리', '5 clone bugs with one Refactor shot', 'リファクタ1発でクローンバグ5匹', '一发重构命中5只克隆Bug')],
  ['boss90', L('보스를 1분 30초 안에 정상화', 'Fix the boss within 1:30', 'ボスを1分30秒以内に修復', '1分30秒内修好Boss')],
  ['hard', L('난이도 상 클리어', 'Clear on Hard', 'ハードをクリア', '通关困难难度')],
  ['hardrelease', L('난이도 상에서 정식 출시', 'Released grade on Hard', 'ハードで「正式リリース」評価', '困难难度获得“正式发布”评价')],
  ['tutorial', L('훈련 수료 (튜토리얼 완료)', 'Training Complete (finish the tutorial)', '訓練修了 (チュートリアル完了)', '训练结业（完成教程）')],
];
// ---------- 도감 · 안내 카드 내용 ----------
const DEX = [
  { t: 'basic', role: L('돌격', 'Rusher', '突撃', '突击'), hp: 5, desc: L('엄폐물까지 곧장 달려와 물어요. 숨어도 막을 수 없어요.', 'Runs straight to your cover and bites. Hiding won\'t stop it.', '遮蔽物までまっすぐ走ってきて噛みつく。隠れても防げない。', '会直冲到掩体前咬人。隐蔽也挡不住。'), tip: L('가까이 오기 전에 쏘세요. 산탄이 약점이고 맞으면 뒤로 밀려나요.', 'Shoot it before it gets close. Weak to Spread, which knocks it back.', '近づく前に撃とう。散弾が弱点で、当たると後ろに押し返される。', '在它靠近前开火。弱点是散弹，被击中会被击退。') },
  { t: 'throw', role: L('사격', 'Shooter', '射撃', '射击'), hp: 8, desc: L('멀리 서서 빨간 예고 원을 띄운 뒤 에러 패킷을 던져요.', 'Stands far away, flashes a red warning circle, then throws an error packet.', '遠くから赤い予告円を出し、エラーパケットを投げてくる。', '站在远处显示红色预警圈，然后投掷错误数据包。'), tip: L('예고 원이 보이면 손을 떼서 숨으세요. 예고 초반에 잡으면 공격이 취소돼요. 저격이 약점.', 'When you see the circle, let go and hide. Kill it early in the warning to cancel the attack. Weak to Sniper.', '円が見えたら離して隠れよう。予告の序盤に倒せば攻撃はキャンセル。狙撃が弱点。', '看到红圈就松开隐蔽。在预警初期击倒它可取消攻击。弱点是狙击。') },
  { t: 'clone', role: L('돌격', 'Rusher', '突撃', '突击'), hp: 6, desc: L('쓰러뜨리면 작은 복제 버그 2마리로 갈라져요.', 'Splits into 2 mini clones when defeated.', '倒すとミニクローン2匹に分裂する。', '被击倒后会分裂成2只迷你克隆。'), tip: L('산탄 한 방에 여러 마리를 정리하세요. 분열한 뒤가 더 위험해요.', 'Clear several at once with one Spread shot. It gets worse after splitting.', '散弾1発でまとめて片付けよう。分裂後のほうが危険。', '用一发散弹一起解决。分裂后更危险。') },
  { t: 'mini', role: L('돌격', 'Rusher', '突撃', '突击'), hp: 2, desc: L('복제 버그가 갈라져 나온 작고 빠른 버그.', 'A small, fast bug that split off a Clone Bug.', 'クローンバグから分裂した小さくて速いバグ。', '从克隆Bug分裂出来的小而快的Bug。'), tip: L('빠르니 가까이 오기 전에 산탄으로.', 'It\'s fast — use Spread before it gets close.', '速いので、近づく前に散弾で。', '它很快，趁靠近前用散弹。') },
  { t: 'ghost', role: L('사격', 'Shooter', '射撃', '射击'), hp: 6, desc: L('1.5초마다 0.5초만 보여요. 안 보일 땐 맞지 않아요.', 'Visible for 0.5s every 1.5s. Can\'t be hit while invisible.', '1.5秒ごとに0.5秒だけ姿を見せる。見えない間は当たらない。', '每1.5秒只现身0.5秒。隐身时打不中。'), tip: L('보이는 순간을 노리세요. 저격을 충전해 뒀다가 보일 때 발사하면 한 방이에요.', 'Time it for when it appears. Charge the Sniper and fire when it shows for a one-shot.', '現れた瞬間を狙おう。狙撃をチャージしておき、見えたら撃てば一撃。', '瞄准它现身的瞬间。先蓄力狙击，现身时开火即可一击解决。') },
  { t: 'e404', role: L('사격', 'Shooter', '射撃', '射击'), hp: 8, desc: L('조준선이 1초 이상 겹치면 근처로 순간이동해요.', 'Teleports nearby if your crosshair stays on it for over 1 second.', '照準を1秒以上合わせると近くにテレポートする。', '准星停留超过1秒就会瞬移到附近。'), tip: L('오래 겨누지 말고 연사로 빠르게 끝내세요. 연사가 약점.', 'Don\'t aim too long — finish it fast with Rapid. Weak to Rapid.', '長く狙わず、連射で素早く倒そう。連射が弱点。', '别瞄太久，用连射快速解决。弱点是连射。') },
  { t: 'loop', role: L('사격 · 미사일', 'Shooter · Missile', '射撃 · ミサイル', '射击 · 导弹'), hp: 10, desc: L('빙글빙글 돌며 관통 미사일을 쏴요. 껍질 때문에 빛나는 지점에서만 맞아요.', 'Spins around firing piercing missiles. Its shell means only the glowing spot takes damage.', 'ぐるぐる回りながら貫通ミサイルを撃つ。殻のせいで光る部分にしか当たらない。', '一边转圈一边发射穿透导弹。因为外壳，只有发光的部位能被击中。'), tip: L('저격은 껍질을 뚫어서 언제든 맞아요. 미사일은 숨어도 맞으니 쏴서 떨어뜨리세요.', 'Sniper pierces the shell and always hits. Missiles hit you even in cover, so shoot them down.', '狙撃は殻を貫通していつでも当たる。ミサイルは隠れても当たるので撃ち落とそう。', '狙击能穿透外壳随时命中。导弹隐蔽也会被击中，要把它打下来。') },
  { t: 'missile', role: L('관통탄', 'Piercing round', '貫通弾', '穿透弹'), hp: 2, desc: L('무한루프 버그와 보스가 쏘는 미사일. 엄폐물을 뚫어요.', 'Missiles fired by Infinite Loop Bugs and the boss. They go through cover.', '無限ループバグとボスが撃つミサイル。遮蔽物を貫通する。', '无限循环Bug和Boss发射的导弹。会穿透掩体。'), tip: L('숨지 말고 연사로 격추하세요. 보라색 "관통!" 표시가 경고예요.', 'Don\'t hide — shoot it down with Rapid. The purple "PIERCE!" mark is your warning.', '隠れずに連射で撃ち落とそう。紫の「貫通!」表示が警告だ。', '别躲，用连射把它击落。紫色“穿透！”标记就是警告。') },
  { t: 'merge', role: L('사격 · 한 쌍', 'Shooter · Pair', '射撃 · ペア', '射击 · 成对'), hp: 5, desc: L('항상 두 마리가 한 쌍으로 와요. 한 마리만 고치면 2초 뒤 되살아나요.', 'Always comes as a pair. Fix only one and it revives after 2 seconds.', 'いつも2匹1組で来る。片方だけ直すと2秒後に復活する。', '总是成对出现。只修好一只，2秒后会复活。'), tip: L('둘 다 2초 안에! 코볼의 연쇄 빔이면 한 번에', 'Both within 2s! Cobol\'s chain beam hits both', '2秒以内に両方! コボルの連鎖ビームなら一度に', '2秒内两只都修！科博的连锁光束能一次命中') },
  { t: 'leak', role: L('돌격 · 성장', 'Rusher · Grows', '突撃 · 成長', '突击 · 成长'), hp: 4, desc: L('천천히 다가오면서 점점 커지고 단단해져요. 다 크면 터져서 작은 버그 3마리가 나와요.', 'Creeps closer while growing bigger and tougher. At full size it bursts into 3 mini bugs.', 'ゆっくり近づきながらどんどん大きく硬くなる。最大になると破裂して小さいバグが3匹出る。', '慢慢靠近，越长越大越硬。长到最大会爆开，变成3只小Bug。'), tip: L('작을 때 빨리. 에이다의 런처가 약점', 'Get it while small. Weak to Ada\'s launcher', '小さいうちに。エイダのランチャーが弱点', '趁小快打。弱点是艾达的发射器') },
  { t: 'deprecated', role: L('돌격 · 떼', 'Rusher · Swarm', '突撃 · 群れ', '突击 · 成群'), hp: 6, desc: L('느릿느릿 떼로 오는 낡은 버그. 최신 무기에는 피해가 절반만 들어가요.', 'Old, slow bugs that come in swarms. Modern weapons deal only half damage.', 'のろのろと群れで来る古いバグ。最新の武器はダメージが半分しか入らない。', '慢吞吞成群而来的老旧Bug。新武器只能造成一半伤害。'), tip: L('코볼의 리뷰 빔은 정상 피해 + 연쇄', 'Cobol\'s Review Beam deals full damage and chains', 'コボルのレビュービームは通常ダメージ+連鎖', '科博的审查光束造成正常伤害并连锁') },
  { t: 'hotfix', role: L('아이템', 'Item', 'アイテム', '道具'), hp: 1, desc: L('가끔 둥실 떠다니는 긴급 패치 꾸러미.', 'An emergency patch pack that sometimes floats by.', 'ときどき漂ってくる緊急パッチパック。', '偶尔飘过来的紧急补丁包。'), tip: L('쏘면 안정성 +20, 화면 고장 복구, 엄폐물 보강. 상 난이도에선 가짜(붉게 깜빡임)도 있어요.', 'Shoot it: Stability +20, glitches repaired, cover reinforced. On Hard some are fakes (flashing red).', '撃つと安定性+20、画面の不具合を修復、遮蔽物を補強。ハードでは偽物(赤く点滅)もある。', '击中后稳定性+20、修复画面故障、加固掩体。困难难度下也有假货（红色闪烁）。') },
];
const SQUAD_INFO = [
  { name: L('도트', 'Dot', 'ドット', '多特'), role: L('디버거 · 연사', 'Debugger · Rapid', 'デバッガー · 連射', '调试器 · 连射'), desc: L('빠르게 연속 사격. 어떤 상황에도 무난하고 미사일 격추에 좋아요.', 'Fast continuous fire. Reliable in any situation and great for shooting down missiles.', '素早い連続射撃。どんな状況でも安定していて、ミサイルの撃墜に強い。', '快速连续射击。任何情况下都很稳，擅长击落导弹。'), weak: L('404 버그 · 관통 미사일', '404 Bug · Piercing Missile', '404バグ · 貫通ミサイル', '404 Bug · 穿透导弹') },
  { name: L('렉스', 'Rex', 'レックス', '雷克斯'), role: L('리팩터 · 산탄', 'Refactor · Spread', 'リファクタ · 散弾', '重构 · 散弹'), desc: L('한 번에 7발을 넓게 퍼뜨리고, 달려오는 버그를 뒤로 밀어내요.', 'Fires 7 pellets in a wide spread and knocks charging bugs back.', '7発を広く撃ち、突っ込んでくるバグを押し返す。', '一次散射7发，把冲过来的Bug击退。'), weak: L('기본 · 복제 · 작은 복제 버그', 'Basic · Clone · Mini Clone', 'ベーシック · クローン · ミニクローン', '基础 · 克隆 · 迷你克隆') },
  { name: L('핀', 'Pin', 'ピン', '平'), role: L('프로파일러 · 저격', 'Profiler · Sniper', 'プロファイラ · 狙撃', '分析器 · 狙击'), desc: L('누르고 있으면 충전, 떼거나 다 차면 발사. 멀리 있는 적과 겹쳐 있는 적을 한 번에 꿰뚫어요.', 'Hold to charge, release (or wait for full) to fire. Pierces distant and lined-up enemies in one shot.', '押してチャージ、離すか満タンで発射。遠くの敵や重なった敵を一撃で貫く。', '按住蓄力，松开或蓄满时发射。一发贯穿远处和重叠的敌人。'), weak: L('throw · 투명 · 무한루프 버그 · 보스 오류 줄', 'Throw · Ghost · Infinite Loop · Boss error lines', 'スロー · ゴースト · 無限ループ · ボスのエラー行', '投掷 · 幽灵 · 无限循环 · Boss错误行') },
  { name: L('에이다', 'Ada', 'エイダ', '艾达'), role: L('테스터 · 런처', 'Tester · Launcher', 'テスター · ランチャー', '测试员 · 发射器'), desc: L('테스트 캡슐을 쏘면 조준한 자리에서 터져 주변 버그를 한꺼번에 고쳐요. 탄창은 작지만 한 방이 넓어요.', 'Fires test capsules that burst where you aim, fixing every bug around it. Small magazine, big blast.', 'テストカプセルを撃つと狙った場所で弾け、周りのバグをまとめて直す。弾倉は小さいが一発が広い。', '发射测试胶囊，在瞄准处爆开，一次修复周围所有Bug。弹匣小，但范围大。'), weak: L('작은 복제 버그 · 몰려 있는 버그', 'Mini Clones · clustered bugs', 'ミニクローン · 群れたバグ', '迷你克隆 · 聚集的Bug') },
  { name: L('코볼', 'Cobol', 'コボル', '科博'), role: L('레거시 장인 · 리뷰 빔', 'Legacy Veteran · Review Beam', 'レガシー職人 · レビュービーム', '遗留代码匠人 · 审查光束'), desc: L('누르고 있는 동안 나가는 연속 광선. 맞은 버그에서 가까운 버그 2마리로 연쇄로 튀어요. 2장에서 합류.', 'A continuous beam while you hold. Chains from the target to 2 nearby bugs. Joins in Chapter 2.', '押している間出続ける光線。当たったバグから近くの2匹へ連鎖する。第2章で合流。', '按住时持续发射的光束，会从目标连锁到附近2只Bug。第2章加入。'), weak: L('머지 충돌 · 지원 종료 버그', 'Merge Conflict · Deprecated', 'マージコンフリクト · サポート終了', '合并冲突 · 停止支持') },
];
function dexPic(t) {
  if (t === 'hotfix') return ASSETS.item_hotfix ? Object.assign(new Image(), { src: ASSETS.item_hotfix }) : hotfixCanvas(0);
  if (t === 'missile') return ASSETS.proj_missile ? Object.assign(new Image(), { src: ASSETS.proj_missile }) : missileCanvas(0);
  return bugImgCanvas(t);
}
const weakTag = (t) => { const k = WEAK[t]; return k ? L(`<span class="chip" style="color:${KIND_INFO[k].color}">약점: ${KIND_INFO[k].name}</span>`, `<span class="chip" style="color:${KIND_INFO[k].color}">Weak: ${KIND_INFO[k].name}</span>`, `<span class="chip" style="color:${KIND_INFO[k].color}">弱点: ${KIND_INFO[k].name}</span>`, `<span class="chip" style="color:${KIND_INFO[k].color}">弱点：${KIND_INFO[k].name}</span>`) : ''; };
const TUT = {
  basics: { tag: L('조작', 'Controls', '操作', '操作'), title: L('누르면 나가서 쏘고, 떼면 숨어요', 'Hold to pop up and shoot, release to hide', '押して出て撃つ、離して隠れる', '按住探身射击，松开隐蔽'), body: IS_TOUCH ? L('화면을 누르고 있으면 엄폐물 위로 나와 자동 사격해요. 누른 채로 손가락을 끌면 조준점이 움직여요.<br>손을 떼면 숨고, 숨어 있는 동안 재장전돼요.', 'Touch and hold to pop up from cover and auto-fire. Drag while holding to move the crosshair.<br>Let go to hide; you reload while hidden.', '画面を長押しすると遮蔽物から出て自動射撃。押したままドラッグで照準が動く。<br>指を離すと隠れ、隠れている間にリロード。', '按住屏幕即可探出掩体自动射击。按住拖动可移动准星。<br>松手即隐蔽，隐蔽时自动换弹。') : L('마우스 왼쪽 버튼을 누르고 있으면 엄폐물 위로 나와 자동 사격해요. 조준점은 마우스를 따라가요.<br>버튼을 떼면 숨고, 숨어 있는 동안 재장전돼요.', 'Hold the left mouse button to pop up from cover and auto-fire. The crosshair follows your mouse.<br>Release to hide; you reload while hidden.', 'マウスの左ボタンを押している間、遮蔽物から出て自動射撃。照準はマウスに付いてくる。<br>ボタンを離すと隠れ、隠れている間にリロード。', '按住鼠标左键即可探出掩体自动射击。准星跟随鼠标。<br>松开即隐蔽，隐蔽时自动换弹。') },
  hide: { tag: L('공격 예고', 'Incoming attack', '攻撃予告', '攻击预警'), title: L('빨간 원이 보이면 숨으세요!', 'Red circle? Hide!', '赤い円が見えたら隠れて!', '看到红圈就隐蔽！'), body: L('멀리 있는 버그가 에러 패킷을 던지기 직전이에요. 원이 다 채워지기 전에 <b>손을 떼면</b> 엄폐물이 대신 맞아요.<br>그 전에 던진 버그를 잡으면 공격이 취소돼요.', 'A distant bug is about to throw an error packet. <b>Let go</b> before the circle fills and your cover takes the hit.<br>Kill the thrower first and the attack is cancelled.', '遠くのバグがエラーパケットを投げる直前だ。円が埋まる前に<b>離せば</b>遮蔽物が代わりに受ける。<br>先に投げるバグを倒せば攻撃はキャンセル。', '远处的Bug即将投掷错误数据包。在圆圈填满前<b>松开</b>，掩体会替你挡下。<br>先击倒投掷者，攻击就会取消。') },
  weak: { tag: L('약점 무기', 'Weak weapon', '弱点武器', '弱点武器'), title: L('버그 옆 동그라미 = 약점 무기', 'Circle next to a bug = its weak weapon', 'バグの横の丸 = 弱点武器', 'Bug旁边的圆圈 = 弱点武器'), body: L('<b style="color:#C6F432">연</b> 연사 · <b style="color:#FFD34D">산</b> 산탄 · <b style="color:#6fe7ff">저</b> 저격 · <b style="color:#FF5FA2">캡</b> 런처. 약점 무기로 쏘면 피해가 <b>2배</b>예요.<br>지금 상황에 맞는 캐릭터 버튼이 반짝이면 눌러서 바꾸세요.', '<b style="color:#C6F432">D</b> Rapid · <b style="color:#FFD34D">R</b> Spread · <b style="color:#6fe7ff">P</b> Sniper · <b style="color:#FF5FA2">A</b> Launcher. Hitting with the weak weapon deals <b>2×</b> damage.<br>When a squad button flashes, click it to switch to the right member.', '<b style="color:#C6F432">D</b> 連射 · <b style="color:#FFD34D">R</b> 散弾 · <b style="color:#6fe7ff">P</b> 狙撃 · <b style="color:#FF5FA2">A</b> ランチャー。弱点武器で撃つとダメージ<b>2倍</b>。<br>状況に合ったメンバーのボタンが光ったら、クリックして切り替えよう。', '<b style="color:#C6F432">D</b> 连射 · <b style="color:#FFD34D">R</b> 散弹 · <b style="color:#6fe7ff">P</b> 狙击 · <b style="color:#FF5FA2">A</b> 发射器。用弱点武器攻击伤害<b>×2</b>。<br>合适的队员按钮闪烁时，点击切换。') },
  join_rex: { tag: L('분대 합류', 'Squad joined', '分隊合流', '队员加入'), title: L('렉스 합류 — 산탄', 'Rex joins — Spread', 'レックス合流 — 散弾', '雷克斯加入 — 散弹'), body: L('한 번에 7발이 넓게 퍼지고, 달려오는 버그를 <b>뒤로 밀어내요</b>. 기본·복제 버그의 약점이에요.<br>아래 렉스 아이콘을 누르세요', 'Fires 7 pellets in a wide spread and <b>knocks charging bugs back</b>. Basic and Clone bugs are weak to it.<br>Click the Rex icon below', '7発が広がり、突っ込んでくるバグを<b>押し返す</b>。ベーシック・クローンバグの弱点だ。<br>下のレックスのアイコンをクリック', '一次散射7发，把冲过来的Bug<b>击退</b>。是基础和克隆Bug的弱点。<br>点击下方雷克斯图标') + (IS_TOUCH ? '.' : L(' (2번 키).', ' (key 2).', ' (2キー)。', '（按键2）。')) + L(' 조작하지 않는 동료는 옆에서 알아서 쏴요.', ' Squad members you don\'t control shoot on their own.', ' 操作していない仲間は自分で撃ってくれる。', ' 未操控的队友会自己开火。'), pics: [1] },
  join_pin: { tag: L('분대 합류', 'Squad joined', '分隊合流', '队员加入'), title: L('핀 합류 — 저격', 'Pin joins — Sniper', 'ピン合流 — 狙撃', '平加入 — 狙击'), body: L('<b>누르고 있으면 충전</b>되고, 떼거나 다 차면 발사돼요. 겹친 적을 꿰뚫고, 무한루프 버그의 껍질도 뚫어요.<br>멀리서 던지는 버그와 보스 오류 줄의 약점이에요', '<b>Hold to charge</b>, release or wait for full to fire. Pierces lined-up enemies and Infinite Loop shells.<br>Throwers and boss error lines are weak to it', '<b>押してチャージ</b>、離すか満タンで発射。重なった敵や無限ループの殻を貫く。<br>遠くから投げるバグとボスのエラー行の弱点だ', '<b>按住蓄力</b>，松开或蓄满时发射。可贯穿重叠的敌人和无限循环的外壳。<br>是远程投掷Bug和Boss错误行的弱点') + (IS_TOUCH ? '.' : L(' (3번 키).', ' (key 3).', ' (3キー)。', '（按键3）。')), pics: [2] },
  join_ada: { tag: L('분대 합류', 'Squad joined', '分隊合流', '队员加入'), title: L('에이다 합류 — 런처', 'Ada joins — Launcher', 'エイダ合流 — ランチャー', '艾达加入 — 发射器'), body: L('테스트 캡슐이 조준한 자리에서 <b>터져서</b> 주변 버그를 한꺼번에 고쳐요. 작은 복제 버그 떼의 약점이에요.<br>아래 에이다 아이콘을 누르세요', 'Test capsules <b>burst</b> where you aim and fix every bug nearby. Mini Clone swarms are weak to it.<br>Click the Ada icon below', 'テストカプセルが狙った場所で<b>弾けて</b>、周りのバグをまとめて直す。ミニクローンの群れの弱点だ。<br>下のエイダのアイコンをクリック', '测试胶囊会在瞄准处<b>爆开</b>，一次修复周围的Bug。是迷你克隆群的弱点。<br>点击下方艾达图标') + (IS_TOUCH ? '.' : L(' (4번 키).', ' (key 4).', ' (4キー)。', '（按键4）。')), pics: [3] },
  join_cobol: { tag: L('분대 합류', 'Squad joined', '分隊合流', '队员加入'), title: L('코볼 합류 — 리뷰 빔', 'Cobol joins — Review Beam', 'コボル合流 — レビュービーム', '科博加入 — 审查光束'), body: L('누르고 있는 동안 광선이 나가고, 맞은 버그에서 가까운 버그로 <b>연쇄</b>로 튀어요. 머지 충돌·지원 종료 버그의 약점이에요.<br>아래 코볼 아이콘을 누르세요', 'Hold to fire a beam that <b>chains</b> from the target to nearby bugs. Strong against Merge Conflict and Deprecated bugs.<br>Click the Cobol icon below', '押している間ビームが出て、当たったバグから近くのバグへ<b>連鎖</b>する。マージコンフリクト・サポート終了バグの弱点だ。<br>下のコボルのアイコンをクリック', '按住发射光束，会从目标<b>连锁</b>到附近的Bug。是合并冲突和停止支持Bug的弱点。<br>点击下方科博图标') + (IS_TOUCH ? '.' : L(' (5번 키).', ' (key 5).', ' (5キー)。', '（按键5）。')), pics: [4] },
  rollback: { tag: L('분대 스킬', 'Squad skill', '分隊スキル', '小队技能'), title: L('롤백 — 3초 슬로우', 'Rollback — 3s slow-mo', 'ロールバック — 3秒スロー', '回滚 — 3秒慢动作'), body: L('누르면 3초 동안 세상이 30% 속도로 느려지고, 날아오던 공격은 되감기고, 화면 고장 하나가 바로 고쳐져요.<br>스테이지마다 정해진 횟수만 쓸 수 있어요. 위급할 때 버튼이 반짝여요', 'Slows the world to 30% for 3 seconds, rewinds incoming attacks and instantly repairs one glitch.<br>Limited uses per stage. The button flashes when you are in danger', '3秒間、世界の速度が30%になり、飛んでくる攻撃は巻き戻され、画面の不具合が1つすぐ直る。<br>ステージごとに使える回数が決まっている。ピンチになるとボタンが光る', '3秒内世界速度降至30%，飞来的攻击被倒带，并立即修复一个画面故障。<br>每关使用次数有限。危急时按钮会闪烁') + (IS_TOUCH ? '.' : L(' (스페이스).', ' (Space).', ' (スペース)。', '（空格）。')) },
  cover_broken: { tag: L('위험', 'Danger', '危険', '危险'), title: L('엄폐물이 부서졌어요', 'Your cover is destroyed', '遮蔽物が壊れた', '掩体被摧毁了'), body: L('이제 숨어도 에러 패킷에 맞아요. 던지는 버그부터 빨리 잡으세요.<br>다음 엄폐 지점에 가면 새 엄폐물이 생기고, 핫픽스를 쏘면 보강돼요.', 'Error packets now hit you even while hiding. Take out the throwers fast.<br>The next cover point gives you new cover, and a Hotfix reinforces it.', '隠れていてもエラーパケットが当たるようになった。投げるバグから素早く倒そう。<br>次の遮蔽ポイントで新しい遮蔽物が手に入り、ホットフィックスで補強できる。', '现在隐蔽也会被错误数据包击中。快先解决投掷的Bug。<br>到下一个掩体点会有新掩体，热修复可以加固掩体。') },
};

const UI = {
  pendingDaily: false, setReturn: null, _hud: {},
  init() {
    $('#verBadge').textContent = DAILY_VER;
    if (ASSETS.logo) $('#logo').innerHTML = `<img class="logoimg" src="${ASSETS.logo}" alt="PATCH SQUAD">`;
    $('#crashBug').append(bugImgCanvas('basic'));
    const click = (id, fn) => $(id).addEventListener('click', (e) => { SND.init(); SND.play('click'); fn(e); });
    click('#btnStart', () => this.start(false));
    click('#btnFree', () => this.startFree());
    Free.bind();
    click('#btnDaily', () => this.start(true));
    click('#btnRecords', () => this.showRecords());
    click('#btnDex', () => this.showDex('#scrTitle'));
    click('#btnPauseDex', () => this.showDex('#scrPause'));
    click('#btnDexBack', () => this.only(this.dexReturn || '#scrTitle'));
    click('#btnIntro', () => { const back = this.setReturn || '#scrTitle'; this.only(); Story.intro(() => this.only(back)); });
    Story.bind();
    click('#btnTutReset', () => { Store.set('tut', []); this.tutSeen = []; this.toast(L('안내 카드를 처음부터 다시 보여 줄게요', 'Tip cards will be shown again from the start', 'ヒントカードを最初からもう一度表示します', '提示卡将从头重新显示')); });
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
    // 언어/Language: 고르면 저장하고 다시 불러옴 (모든 글자가 그 언어로)
    click('#btnLang', () => { $$('#scrLang [data-lang]').forEach((b) => b.classList.toggle('pri', b.dataset.lang === LANG)); this.only('#scrLang'); });
    click('#btnLangBack', () => this.only('#scrTitle'));
    $$('#scrLang [data-lang]').forEach((b) => b.addEventListener('click', () => {
      SND.init(); SND.play('click');
      if (b.dataset.lang === LANG) { this.only('#scrTitle'); return; }
      Store.set('lang', b.dataset.lang); Store.flush(); location.reload();
    }));
    // 개발자
    click('#btnDev', () => this.only('#scrDev'));
    click('#btnDevBack', () => this.only('#scrTitle'));
    click('#btnAskTutYes', () => { Store.set('tutAsked', true); this.only(); Game.newRun(false, 'tutorial'); });
    click('#btnAskTutNo', () => { Store.set('tutAsked', true); this.showDiff(); });
    click('#btnDiffBack', () => this.only('#scrTitle'));
    $$('.chcard').forEach((b) => b.addEventListener('click', () => {
      SND.init(); const c = +b.dataset.ch;
      if (c === 2 && !this.ch2Open()) { SND.play('jam'); this.toast(L('1장을 끝까지 깨면 열려요', 'Clear Chapter 1 to unlock', '第1章をクリアすると解放', '通关第1章后解锁')); return; }
      SND.play('click'); this.pendingCh = c; Store.set('lastCh', c); this.syncCh();
    }));
    $$('.dcard').forEach((b) => b.addEventListener('click', () => {
      SND.init();
      if (b.dataset.d === 'tutorial') { SND.play('click'); this.only(); Game.newRun(false, 'tutorial'); return; }
      if (b.dataset.d === 'hard' && !this.hardOpen()) { SND.play('jam'); this.toast(L('난이도 중을 한 번 깨면 열려요', 'Clear Normal once to unlock', 'ノーマルを一度クリアすると解放', '通关一次普通难度后解锁')); return; }
      SND.play('click'); Store.set('diff', b.dataset.d); this.only();
      if (this.pendingMode === 'free') return Free.start(b.dataset.d, false, this.pendingCh);
      Game.newRun(this.pendingDaily, b.dataset.d, this.pendingCh);
    }));
    click('#btnResume', () => this.resume());
    click('#btnPauseSet', () => this.showSettings('#scrPause'));
    click('#btnRestartStage', () => { if (Free.active) { this.only(); if (SND.ctx) SND.ctx.resume(); return Free.rebuild(); } this.only(); Game.state = 'play'; if (SND.ctx) SND.ctx.resume(); Game.restoreSnapshot(); Game.startStage(Game.run.stage); });
    click('#btnToTitle', () => { if (SND.ctx) SND.ctx.resume(); Game.toTitle(); });
    click('#btnSetBack', () => { this.only(this.setReturn || '#scrTitle'); });
    click('#btnRecBack', () => this.only('#scrTitle'));
    click('#btnNext', () => { this.only(); if (Free.active) return Free.nextStage(); Game.nextStage(); });
    click('#btnRebuild', () => { this.only(); if (Free.active) return Free.rebuild(); Game.rebuild(); });
    click('#btnCrashTitle', () => Game.toTitle());
    click('#btnCopy', () => this.copyNote());
    click('#btnAgain', () => { if (Free.active) { this.only(); return Free.start(Free.run.diff, Free.run.daily, Free.run.ch); } this.pendingDaily = !!(Game.run && Game.run.daily); this.only(); Game.newRun(this.pendingDaily, Game.run ? Game.run.diff : 'normal', Game.run ? Game.run.ch : 1); });
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
    const sensTxt = () => { $('#setSensV').textContent = (s.sens || 1).toFixed(2); };
    $('#setSens').value = Math.round((s.sens || 1) * 100); sensTxt();
    $('#setSens').addEventListener('input', (e) => { s.sens = e.target.value / 100; sensTxt(); saveSettings(); });
    $('#setCb').checked = !!s.cb;
    $('#setCb').addEventListener('change', (e) => { s.cb = e.target.checked; saveSettings(); });
    $('#setQuality').addEventListener('change', (e) => { s.quality = e.target.value; FX.setQuality(); saveSettings(); });
    // 화면 흔들림
    const shTxt = () => { $('#setShakeV').textContent = Math.round((s.shake == null ? 1 : s.shake) * 100) + '%'; };
    $('#setShake').value = Math.round((s.shake == null ? 1 : s.shake) * 100); shTxt();
    $('#setShake').addEventListener('input', (e) => { s.shake = e.target.value / 100; shTxt(); saveSettings(); });
    $('#setShake').addEventListener('change', () => { Game.shake = 0.5; });
    // 키 설정
    click('#btnKeys', () => { this.only('#scrKeys'); this.renderKeys(); });
    click('#btnKeysBack', () => { this.keyWait = null; this.only('#scrSettings'); });
    click('#btnKeysReset', () => { s.keys = {}; saveSettings(); this.keyWait = null; this.renderKeys(); });
    window.addEventListener('keydown', (e) => {
      if (!this.keyWait) return;
      e.preventDefault(); e.stopImmediatePropagation();
      const act = this.keyWait; this.keyWait = null;
      if (e.code === 'Escape' || /^Digit[1-9]$/.test(e.code)) { this.renderKeys(); return; }
      // 같은 키를 쓰던 다른 동작은 서로 맞바꿈 (레일·자유 작전은 따로라서 롤백(레일)은 겹쳐도 됨)
      const old = KB(act);
      for (const [a] of KEY_DEFS) if (a !== act && a !== 'rbRail' && act !== 'rbRail' && KB(a) === e.code) s.keys[a] = old;
      s.keys[act] = e.code; saveSettings(); SND.play('click'); this.renderKeys();
    }, true);
    // 스팀판(데스크톱 앱): 게임 종료 버튼, 전체 화면 설정. 브라우저에서 열면 숨김
    const D = window.bhDesktop;
    if (D) {
      $('#btnQuit').classList.remove('hidden'); $('#optFull').classList.remove('hidden');
      click('#btnQuit', () => D.quit());
      const sync = () => D.isFullscreen().then((v) => { $('#setFull').checked = !!v; });
      sync(); D.onFullscreen((v) => { $('#setFull').checked = !!v; });
      $('#setFull').addEventListener('change', (e) => D.setFullscreen(e.target.checked));
      if (D.setWindowSize) {
        $('#optWin').classList.remove('hidden');
        const syncWin = () => D.isFullscreen().then((v) => { if (v) $('#setWin').value = 'full'; else if (s.win && s.win !== 'full') $('#setWin').value = s.win; });
        syncWin(); D.onFullscreen(() => syncWin());
        $('#setWin').addEventListener('change', (e) => { const v = e.target.value; s.win = v; saveSettings(); if (v === 'full') D.setFullscreen(true); else { const [w, h] = v.split('x').map(Number); D.setWindowSize(w, h); } });
      }
    }
  },
  renderKeys() {
    const box = $('#keyList'); box.innerHTML = '';
    for (const [act, , name] of KEY_DEFS) {
      const row = document.createElement('div'); row.className = 'keyrow' + (this.keyWait === act ? ' wait' : '');
      row.innerHTML = `<span>${name}</span><b>${this.keyWait === act ? L('키를 누르세요…', 'Press a key…', 'キーを押して…', '请按键…') : keyName(KB(act))}</b>`;
      row.addEventListener('click', () => { this.keyWait = act; SND.play('click'); this.renderKeys(); });
      box.appendChild(row);
    }
  },
  syncCh() {
    const open = this.ch2Open(); if (!open) this.pendingCh = 1;
    $$('.chcard').forEach((b) => { b.classList.toggle('sel', +b.dataset.ch === this.pendingCh); b.classList.toggle('locked', +b.dataset.ch === 2 && !open); });
    $('.dcard.tut').classList.toggle('hidden', this.pendingMode === 'free' || this.pendingCh === 2);
  },
  only(id) { for (const s of SCREENS) $(s).classList.toggle('hidden', s !== id); },
  showTitle() { this.only('#scrTitle'); $('#hud').classList.add('hidden'); this.hint(''); $('#banner').classList.add('hidden'); },
  showHUD() {
    this.only(); $('#hud').classList.remove('hidden');
    $$('.mem[data-m="4"]').forEach((b) => b.classList.toggle('hidden', !Game.run || Game.isTut() || chOf(Game.run.stage) !== 2)); // 코볼 버튼은 2장에서만
    // 분대 얼굴 그리기
    $$('.mem').forEach((b, i) => { const c = b.querySelector('.pt'), im = IMG.portrait && IMG.portrait[i]; if (!im) return;
      const draw = () => { const g = c.getContext('2d'); const big = im instanceof HTMLImageElement; g.imageSmoothingEnabled = big; g.imageSmoothingQuality = 'high'; g.clearRect(0, 0, 64, 64); g.drawImage(im, 0, 0, 64, 64); };
      if (im instanceof HTMLImageElement && !im.complete) im.onload = draw; else draw(); });
    $('#stageLbl').innerHTML = (Game.S.def.tutorial ? 'TUTORIAL' : 'STAGE ' + Game.S.def.id) + ' · ' + Game.S.def.name + `<span class="diffchip" style="color:${Game.D.key === 'hard' ? '#FF4D5E' : '#aab2a3'}">${Game.D.name}</span>`;
    $('#helpBadge').classList.toggle('hidden', !Game.run.help[Game.run.stage]);
    this._hud = {};
  },
  pendingCh: 1,
  ch2Open() { return this.ch2OpenMem || !!Store.get('records', {}).ch1Clear; },
  startFree() {
    this.pendingDaily = false; this.pendingMode = 'free';
    if (!Store.get('introSeen', false) && !this.introMem) { this.introMem = true; this.only(); return Story.intro(() => this.startFree()); }
    this.showDiff();
  },
  start(daily) {
    this.pendingMode = 'rail';
    this.pendingDaily = daily;
    // 처음 한 번만: 스토리 인트로
    if (!Store.get('introSeen', false) && !this.introMem) { this.introMem = true; this.only(); return Story.intro(() => this.start(daily)); }
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
    const h1 = document.createElement('div'); h1.className = 'dexh'; h1.textContent = L('분대', 'Squad', '分隊', '小队'); body.append(h1);
    const sq = document.createElement('div'); sq.className = 'dex'; body.append(sq);
    SQUAD_INFO.forEach((m, i) => {
      const el = document.createElement('div'); el.className = 'dx';
      const c = document.createElement('canvas'); c.width = c.height = 64;
      const im = IMG.portrait[i], dr = () => { const g = c.getContext('2d'); g.imageSmoothingEnabled = im instanceof HTMLImageElement; g.drawImage(im, 0, 0, 64, 64); };
      if (im instanceof HTMLImageElement && !im.complete) im.onload = dr; else dr();
      el.append(c);
      el.insertAdjacentHTML('beforeend', L(`<div class="dn">${m.name}</div><div class="dr">${m.role}</div><div class="dd">${m.desc}</div><div class="dt">약점 대상: ${m.weak}</div>`, `<div class="dn">${m.name}</div><div class="dr">${m.role}</div><div class="dd">${m.desc}</div><div class="dt">Strong against: ${m.weak}</div>`, `<div class="dn">${m.name}</div><div class="dr">${m.role}</div><div class="dd">${m.desc}</div><div class="dt">得意な相手: ${m.weak}</div>`, `<div class="dn">${m.name}</div><div class="dr">${m.role}</div><div class="dd">${m.desc}</div><div class="dt">克制：${m.weak}</div>`));
      sq.append(el);
    });
    const rbx = document.createElement('div'); rbx.className = 'dx';
    rbx.innerHTML = L(`<div style="grid-row:1/5;width:64px;height:64px;display:flex;align-items:center;justify-content:center;font-size:26px;color:#6fe7ff">◀◀</div><div class="dn">롤백</div><div class="dr">분대 스킬 · 스테이지 3부터</div><div class="dd">3초 동안 세상이 30% 속도로 느려지고, 날아오던 공격은 되감기고, 화면 고장 하나가 바로 고쳐져요.</div><div class="dt">위급할 때 버튼이 반짝여요.</div>`, `<div style="grid-row:1/5;width:64px;height:64px;display:flex;align-items:center;justify-content:center;font-size:26px;color:#6fe7ff">◀◀</div><div class="dn">Rollback</div><div class="dr">Squad skill · from Stage 3</div><div class="dd">Slows the world to 30% for 3 seconds, rewinds incoming attacks and instantly repairs one glitch.</div><div class="dt">The button flashes when you are in danger.</div>`, `<div style="grid-row:1/5;width:64px;height:64px;display:flex;align-items:center;justify-content:center;font-size:26px;color:#6fe7ff">◀◀</div><div class="dn">ロールバック</div><div class="dr">分隊スキル · ステージ3から</div><div class="dd">3秒間、世界の速度が30%になり、飛んでくる攻撃は巻き戻され、画面の不具合が1つすぐ直る。</div><div class="dt">ピンチになるとボタンが光る。</div>`, `<div style="grid-row:1/5;width:64px;height:64px;display:flex;align-items:center;justify-content:center;font-size:26px;color:#6fe7ff">◀◀</div><div class="dn">回滚</div><div class="dr">小队技能 · 关卡3解锁</div><div class="dd">3秒内世界速度降至30%，飞来的攻击被倒带，并立即修复一个画面故障。</div><div class="dt">危急时按钮会闪烁。</div>`);
    sq.append(rbx);
    const h2 = document.createElement('div'); h2.className = 'dexh'; h2.textContent = L(`버그 (${DEX.filter((x) => seen.has(x.t)).length}/${DEX.length})`, `Bugs (${DEX.filter((x) => seen.has(x.t)).length}/${DEX.length})`, `バグ (${DEX.filter((x) => seen.has(x.t)).length}/${DEX.length})`, `Bug（${DEX.filter((x) => seen.has(x.t)).length}/${DEX.length}）`); body.append(h2);
    const grid = document.createElement('div'); grid.className = 'dex'; body.append(grid);
    for (const e of DEX) {
      const ok = seen.has(e.t), el = document.createElement('div'); el.className = 'dx' + (ok ? '' : ' locked');
      el.append(dexPic(e.t));
      const name = BUGDEF[e.t].name;
      el.insertAdjacentHTML('beforeend', ok
        ? L(`<div class="dn">${name}${weakTag(e.t)}</div><div class="dr">${e.role} · 체력 ${e.hp}</div><div class="dd">${e.desc}</div><div class="dt">공략: ${e.tip}</div>`, `<div class="dn">${name}${weakTag(e.t)}</div><div class="dr">${e.role} · HP ${e.hp}</div><div class="dd">${e.desc}</div><div class="dt">Tip: ${e.tip}</div>`, `<div class="dn">${name}${weakTag(e.t)}</div><div class="dr">${e.role} · HP ${e.hp}</div><div class="dd">${e.desc}</div><div class="dt">攻略: ${e.tip}</div>`, `<div class="dn">${name}${weakTag(e.t)}</div><div class="dr">${e.role} · HP ${e.hp}</div><div class="dd">${e.desc}</div><div class="dt">攻略：${e.tip}</div>`)
        : L(`<div class="dn">???</div><div class="dr">아직 만나지 않았어요</div><div class="dd">게임에서 처음 만나면 기록돼요.</div>`, `<div class="dn">???</div><div class="dr">Not encountered yet</div><div class="dd">It is recorded the first time you meet it in game.</div>`, `<div class="dn">???</div><div class="dr">まだ出会っていない</div><div class="dd">ゲームで初めて出会うと記録される。</div>`, `<div class="dn">???</div><div class="dr">尚未遇到</div><div class="dd">在游戏中第一次遇到时会被记录。</div>`));
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
      card = { tag: L('새로운 버그 · ', 'New bug · ', '新しいバグ · ', '新Bug ·') + e.role, title: BUGDEF[t].name, body: e.desc, weak: L(`공략: ${e.tip}`, `Tip: ${e.tip}`, `攻略: ${e.tip}`, `攻略：${e.tip}`), pic: t };
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
    const fm = this.pendingMode === 'free';
    $('.dcard.tut').classList.toggle('hidden', fm);
    this.pendingCh = this.ch2Open() ? (Store.get('lastCh', 1) || 1) : 1; this.syncCh();
    const open = this.hardOpen(), hc = $('.dcard.hard');
    hc.classList.toggle('locked', !open);
    hc.setAttribute('aria-disabled', String(!open));
    hc.querySelector('.dd').textContent = open
      ? L('버그가 끝없이 몰려오고 갑자기 돌진해요. 복제 버그는 엉뚱한 곳으로 튀고, 패치 건이 과열돼요. 가짜 핫픽스도 섞여 있어요.', 'Bugs pour in endlessly and suddenly charge. Clones split to odd places, your patch gun overheats, and some hotfixes are fakes.', 'バグが絶え間なく押し寄せ、突然突進してくる。クローンは思わぬ場所に飛び散り、パッチガンはオーバーヒートし、偽のホットフィックスも混ざっている。', 'Bug源源不断地涌来，还会突然冲锋。克隆会分裂到意想不到的地方，补丁枪会过热，还混有假的热修复。')
      : L('🔒 난이도 중을 한 번 깨면 열려요.', '🔒 Clear Normal once to unlock.', '🔒 ノーマルを一度クリアすると解放。', '🔒 通关一次普通难度后解锁。');
    if (!open && Store.get('diff', 'normal') === 'hard') Store.set('diff', 'normal');
    $('#diffMode').textContent = fm ? L('자유 작전 (NEW)', 'Free Ops (NEW)', 'フリー作戦 (NEW)', '自由作战 (NEW)') : this.pendingDaily ? L('오늘의 빌드 ', 'Daily Build ', '今日のビルド ', '今日构建') + DAILY_VER : L('정식 빌드', 'Release Build', '正式ビルド', '正式构建');
    const last = Store.get('diff', 'normal');
    $$('.dcard').forEach((b) => b.classList.toggle('last', b.dataset.d === last));
    this.only('#scrDiff');
  },
  pause() {
    if (Free.active) return Free.pause();
    if (Game.state !== 'play') return;
    Game.state = 'paused'; Game.ptr.down = false;
    if (SND.ctx) SND.ctx.suspend();
    this.only('#scrPause');
  },
  resume() {
    if (Free.active) return Free.resume();
    this.only(); Game.state = 'play'; Game.last = performance.now();
    if (SND.ctx) SND.ctx.resume();
  },
  showSettings(ret) { this.setReturn = ret; this.only('#scrSettings'); },
  showRecords() {
    const rec = Store.get('records', {});
    const st = rec.stages || {};
    let h = L('<table><tr><th>스테이지</th><th>최고 점수</th><th>최고 정확도</th></tr>', '<table><tr><th>Stage</th><th>Best score</th><th>Best accuracy</th></tr>', '<table><tr><th>ステージ</th><th>最高スコア</th><th>最高命中率</th></tr>', '<table><tr><th>关卡</th><th>最高分</th><th>最高命中率</th></tr>');
    STAGES.forEach((d, i) => { const s = st[i]; if (i === chFirst(2)) h += `<tr><td colspan="3" style="color:#FFB347;padding-top:10px">${L('2장: 레거시 코드', 'Chapter 2: Legacy Code', '第2章: レガシーコード', '第2章：遗留代码')}${rec.ch1Clear ? '' : ' 🔒'}</td></tr>`; h += `<tr><td>${d.id}. ${d.name}</td><td>${s ? s.score.toLocaleString() : '-'}</td><td>${s ? Math.round(s.acc * 100) + '%' : '-'}</td></tr>`; });
    h += '</table>';
    const daily = rec.daily && rec.daily.date === TODAY_KEY ? gradeName(rec.daily.grade) : '-';
    h += L(`<p style="font-size:13px">오늘의 빌드 <b style="color:var(--lime)">${DAILY_VER}</b> 최고 등급: <b>${daily}</b>`, `<p style="font-size:13px">Daily Build <b style="color:var(--lime)">${DAILY_VER}</b> best grade: <b>${daily}</b>`, `<p style="font-size:13px">今日のビルド <b style="color:var(--lime)">${DAILY_VER}</b> 最高評価: <b>${daily}</b>`, `<p style="font-size:13px">今日构建 <b style="color:var(--lime)">${DAILY_VER}</b> 最高评价：<b>${daily}</b>`) + (rec.best ? L(` · 전체 최고 점수 <b>${rec.best.toLocaleString()}</b>`, ` · All-time best score <b>${rec.best.toLocaleString()}</b>`, ` · 通算最高スコア <b>${rec.best.toLocaleString()}</b>`, ` · 历史最高分 <b>${rec.best.toLocaleString()}</b>`) : '') + '</p>';
    if (rec.freeBest) h += `<p style="font-size:13px">${L('자유 작전 최고 점수', 'Free Ops best score', 'フリー作戦 最高スコア', '自由作战 最高分')} <b style="color:var(--lime)">${rec.freeBest.toLocaleString()}</b></p>`;
    const ch = rec.ch || {};
    h += L('<div class="ch"><b>도전 과제</b>', '<div class="ch"><b>Challenges</b>', '<div class="ch"><b>チャレンジ</b>', '<div class="ch"><b>挑战</b>') + CHALLENGES.map(([k, n]) => `<span class="${ch[k] ? 'ok' : 'no'}">${ch[k] ? '✔' : '□'} ${n}</span>`).join('') + '</div>';
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
    set('prog', Math.round((S.ratio || 0) * 100), (v) => { $('#progFill').style.width = v + '%'; $('#progTxt').textContent = (S.def.boss ? L(`오류 줄 ${Boss.fixed}/16 · `, `Error lines ${Boss.fixed}/16 · `, `エラー行 ${Boss.fixed}/16 · `, `错误行 ${Boss.fixed}/16 ·`) : L('고친 비율 ', 'Fixed ', '修復率 ', '修复率')) + v + '%'; });
    set('score', r.score, (v) => { $('#scoreTxt').textContent = v.toLocaleString(); });
    set('mult', Game.mult().toFixed(1), (v) => { const el = $('#comboTxt'); el.textContent = L('연속 ×', 'Streak ×', '連続 ×', '连击 ×') + v; el.style.color = v === '2.0' ? '#FFD34D' : ''; });
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
    this.clPush([['cmd', `$ build stage${def.id}.${def.key} --watch`], ['trace', L(`  ${def.key === 'deadline' ? 'deadline()' : def.boss ? 'mainLoop()' : 'world'} 로딩 중…`, `  ${def.key === 'deadline' ? 'deadline()' : def.boss ? 'mainLoop()' : 'world'} loading…`, `  ${def.key === 'deadline' ? 'deadline()' : def.boss ? 'mainLoop()' : 'world'} 読み込み中…`, `  ${def.key === 'deadline' ? 'deadline()' : def.boss ? 'mainLoop()' : 'world'} 加载中…`)], ['ok', L('  ready. 버그 감시 시작', '  ready. Watching for bugs', '  ready. バグ監視開始', '  ready. 开始监视Bug')]]);
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
      mini: [[`- ${v}s.push(${v});`, `+ if (!${v}s.has(${v})) ${v}s.add(${v});`], [`- dup(${v});`, L(`+ // 중복 호출 제거`, `+ // removed duplicate call`, `+ // 重複呼び出しを削除`, `+ // 删除重复调用`)]],
      ghost: [[`- ${v}.alpha = undefined;`, `+ ${v}.alpha = 1.0;`], [`- ${v}.visible = Math.random() > .5;`, `+ ${v}.visible = true;`]],
      e404: [[`- fetch("/${v}.json")`, `+ fetch("/assets/${v}.json")`], [`- load("${v}_final_v2.png")`, `+ load("${v}.png")`]],
      loop: [[`- while (true) ${m}();`, `+ while (running) ${m}();`], [`- function ${m}() { ${m}(); }`, `+ function ${m}() { if (done) return; }`]],
      hotfix: [[`+ stability += 20;`, `+ glitches.clear();`]],
      merge: [[`- <<<<<<< HEAD`, `+ ${v}.${m}(merged);`], [`- >>>>>>> feature/${v}`, `+ // conflict resolved`]],
      leak: [[`- ${v}s.push(new Array(1e9));`, `+ ${v}s.length = 0;`], [`- setInterval(${m}, 1);`, `+ clearInterval(${m}Timer);`]],
      deprecated: [[`- ${v}.${m}Legacy();  // @deprecated`, `+ ${v}.${m}();`], [`- import ${v} from 'old-${v}@0.1';`, `+ import ${v} from '${v}';`]],
    };
    let pair = seg ? [`- ${BOSS_CODE[seg.i][1].trim()}`, `+ ${BOSS_CODE[seg.i][0].trim()}`] : P(T[type] || T.basic);
    const file = seg ? (Boss.kind === 'deadline' ? 'deadline' : 'mainLoop') : type === 'hotfix' ? 'hotfix' : v;
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
      basic: `TypeError: ${v}.update is not a function`, clone: L(`RangeError: ${v} 복제가 너무 많음`, `RangeError: too many ${v} clones`, `RangeError: ${v} のクローンが多すぎる`, `RangeError: ${v} 克隆过多`), mini: L(`Warning: 중복된 ${v} 발견`, `Warning: duplicate ${v} found`, `Warning: 重複した ${v} を発見`, `Warning: 发现重复的 ${v}`),
      trojan: L(`SecurityError: hotfix.exe 는 핫픽스가 아닙니다`, `SecurityError: hotfix.exe is not a hotfix`, `SecurityError: hotfix.exe はホットフィックスではありません`, `SecurityError: hotfix.exe 不是热修复`),
      ghost: `ReferenceError: ${v} is not defined`, e404: `404 Not Found: /${v}.json`, loop: `RangeError: Maximum call stack size exceeded`,
      merge: `CONFLICT (content): Merge conflict in ${v}.js`, leak: `FATAL ERROR: JavaScript heap out of memory`, deprecated: `DeprecationWarning: ${v}.update() is deprecated`,
      packet: `UncaughtException: throw new Error("${v}")`, missile: L(`FatalError: infiniteLoop() 관통 — 엄폐 무시`, `FatalError: infiniteLoop() pierced — cover ignored`, `FatalError: infiniteLoop() 貫通 — 遮蔽無視`, `FatalError: infiniteLoop() 穿透 — 无视掩体`),
    }[type] || L(`Error: ${v} 붕괴`, `Error: ${v} collapsed`, `Error: ${v} が崩壊`, `Error: ${v} 崩溃`);
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
    const cp = chPos(i);
    $('#clrTitle').textContent = L(`패치 완료 ${cp.n}/${cp.total}`, `Patch applied ${cp.n}/${cp.total}`, `パッチ完了 ${cp.n}/${cp.total}`, `补丁完成 ${cp.n}/${cp.total}`);
    $('#clrStats').innerHTML = [
      [L('스테이지', 'Stage', 'ステージ', '关卡'), STAGES[i].name], [L('고친 버그', 'Bugs fixed', '修復したバグ', '修复的Bug'), res.fixed + L('마리', '', '', '')], [L('정확도', 'Accuracy', '命中率', '命中率'), Math.round(res.acc * 100) + '%'],
      [L('걸린 시간', 'Time', 'かかった時間', '用时'), fmtTime(res.time)], [L('시간 보너스', 'Time bonus', 'タイムボーナス', '时间奖励'), '+' + res.timeBonus.toLocaleString()], [L('안정성 회복', 'Stability restored', '安定性回復', '稳定性恢复'), '+30% → ' + Math.round(r.stab) + '%'],
    ].map(([k, v]) => `<span class="k">${k}</span><span class="v">${v}</span>`).join('') + L(`<span class="k full">총점</span><span class="v full">${r.score.toLocaleString()}</span>`, `<span class="k full">Total</span><span class="v full">${r.score.toLocaleString()}</span>`, `<span class="k full">合計</span><span class="v full">${r.score.toLocaleString()}</span>`, `<span class="k full">总分</span><span class="v full">${r.score.toLocaleString()}</span>`);
    $('#btnNext').textContent = STAGES[i + 1] && STAGES[i + 1].boss ? STAGES[i + 1].name + ' ▶' : L('다음 스테이지 ▶', 'Next stage ▶', '次のステージ ▶', '下一关 ▶');
    this.only('#scrClear');
  },
  showCrash() {
    $('#hud').classList.add('hidden'); this.hint('');
    const msgs = [
      L('패치 스쿼드가 버그에게 졌습니다. 아이러니하네요.', 'The Patch Squad lost to the bugs. How ironic.', 'パッチ・スクワッドはバグに負けた。皮肉な話だ。', '补丁小队输给了Bug。真是讽刺。'),
      L('안정성이 0%가 되어 세상이 잠시 멈췄습니다.', 'Stability hit 0% and the world froze for a moment.', '安定性が0%になり、世界が一瞬止まった。', '稳定性降到0%，世界暂停了一瞬。'),
      L('버그를 잡으러 왔다가 버그가 되었습니다.', 'Came to catch bugs, became a bug.', 'バグを退治しに来て、バグになった。', '来抓Bug，结果自己成了Bug。'),
      L('Ctrl+Z를 눌렀지만 아무 일도 일어나지 않았습니다.', 'Pressed Ctrl+Z. Nothing happened.', 'Ctrl+Zを押したが、何も起きなかった。', '按了Ctrl+Z，什么都没发生。'),
      L('이 오류는 개발자도 처음 봅니다. (진짜예요)', 'Even the developer has never seen this error. (Really.)', 'このエラーは開発者も初めて見る。(本当に)', '这个错误连开发者都是第一次见。（真的）'),
      L('버그들이 축하 파티를 열고 있습니다.', 'The bugs are throwing a party.', 'バグたちがお祝いパーティーを開いている。', 'Bug们正在开庆祝派对。'),
    ];
    $('#crashMsg').textContent = pick(msgs, Math.random);
    const r = Game.run, help = r.help[r.stage];
    $('#crashCode').textContent =
      `ERR_TOO_MANY_BUGS  (0xB06${r.stage + 1}${r.st.crashes % 10})\n` +
      `at stage${r.stage + 1}.${STAGES[r.stage].key}()\n` +
      `at patchSquad.patch(stability = 0%)\n\n` +
      (STAGES[r.stage].boss && (r.bossCk || 1) > 1 ? L(`> 체크포인트: 보스 ${r.bossCk}단계부터 다시 빌드합니다.`, `> Checkpoint: rebuilding from boss phase ${r.bossCk}.`, `> チェックポイント: ボス フェーズ${r.bossCk}から再ビルドします。`, `> 检查点：从 Boss 第${r.bossCk}阶段重新构建。`) : L(`> 이 스테이지 처음부터 다시 빌드합니다. 판 전체는 유지돼요.`, `> Rebuilding this stage from the start. The rest of your run is kept.`, `> このステージを最初から再ビルドします。それまでの進行は保持されます。`, `> 从头重新构建本关。之前的进度会保留。`)) +
      (help ? L(`\n> 도움 모드 ON: 버그 속도 -20% · 적 공격 느리게 · 피해 -20% · 엄폐물 +40%`, `\n> Assist mode ON: bugs -20% speed · slower attacks · -20% damage · +40% cover`, `\n> アシストモード ON: バグ速度 -20% · 攻撃が遅く · ダメージ -20% · 遮蔽物 +40%`, `\n> 辅助模式开启：Bug速度 -20% · 攻击变慢 · 伤害 -20% · 掩体 +40%`) : '');
    this.only('#scrCrash');
  },
  grade() {
    const r = Game.run, acc = r.st.shots ? r.st.hits / r.st.shots : 0;
    if (r.help.some((x) => x)) return L('출시 연기', 'Delayed', 'リリース延期', '延期发布');
    if (acc >= 0.7 && r.st.crashes === 0 && r.stab >= 50) return L('정식 출시', 'Released', '正式リリース', '正式发布');
    if (acc >= 0.5 && r.st.crashes <= 2) return L('베타', 'Beta', 'ベータ', '测试版');
    return L('알파', 'Alpha', 'アルファ', '内测版');
  },
  showResult() {
    const r = Game.run;
    MUS.startTitle();
    $('#hud').classList.add('hidden'); this.hint('');
    const stabBonus = Math.round(r.stab) * 10;
    if (!r.finalized) { r.score += stabBonus; r.finalized = true; r.stabBonus = stabBonus; }
    const acc = r.st.shots ? r.st.hits / r.st.shots : 0;
    const grade = this.grade(); r.grade = grade;
    $('#resMode').textContent = (r.daily ? L('오늘의 빌드 ', 'Daily Build ', '今日のビルド ', '今日构建') + DAILY_VER : L('정식 빌드', 'Release Build', '正式ビルド', '正式构建')) + L(' · 난이도 ', ' · Difficulty ', ' · 難易度 ', ' · 难度') + Game.D.name;
    $('#resGrade').textContent = grade;
    const f = r.st.fixed;
    $('#resStats').innerHTML = [
      [L('총점', 'Total', '合計', '总分'), r.score.toLocaleString()], [L('정확도', 'Accuracy', '命中率', '命中率'), Math.round(acc * 100) + '%'], [L('크래시', 'Crashes', 'クラッシュ', '崩溃次数'), r.st.crashes + L('회', '', '', '')], [L('남은 안정성', 'Stability left', '残り安定性', '剩余稳定性'), Math.round(r.stab) + '% (+' + r.stabBonus.toLocaleString() + ')'],
      [L('기본 / 복제 / 작은 복제', 'Basic / Clone / Mini', 'ベーシック / クローン / ミニ', '基础 / 克隆 / 迷你'), `${f.basic} / ${f.clone} / ${f.mini}`], [L('throw / 투명 / 404 / 무한루프', 'Throw / Ghost / 404 / Loop', 'スロー / ゴースト / 404 / ループ', '投掷 / 幽灵 / 404 / 循环'), `${f.throw || 0} / ${f.ghost} / ${f.e404} / ${f.loop}`],
      [L('엄폐물로 막은 공격 / 미사일 격추', 'Attacks blocked / Missiles shot down', '防いだ攻撃 / 撃墜したミサイル', '挡下的攻击 / 击落的导弹'), `${r.st.blocked} / ${r.st.missiles}`],
      [L('보스 오류 줄', 'Boss error lines', 'ボスのエラー行', 'Boss错误行'), f.boss + '/16 · ' + fmtTime(r.st.bossTime)], [L('최대 연속 패치', 'Best patch streak', '最大連続パッチ', '最高连续补丁'), r.maxStreak + L('회', '', '', '')], [L('PERFECT / 핫픽스', 'PERFECT / Hotfix', 'PERFECT / ホットフィックス', 'PERFECT / 热修复'), `${r.st.perfect} / ${r.st.hotfix}`],
    ].map(([k, v]) => `<span class="k">${k}</span><span class="v">${v}</span>`).join('');
    const note = this.patchNote(grade, acc);
    $('#resNote').textContent = note; $('#resNoteTa').value = note;
    $('#resNoteTa').classList.add('hidden'); $('#resNote').classList.remove('hidden');
    $('#btnCopy').textContent = L('패치 노트 복사', 'Copy patch notes', 'パッチノートをコピー', '复制补丁说明');
    // 기록 · 도전 과제
    const rec = Store.get('records', {});
    rec.best = Math.max(rec.best || 0, r.score);
    if (r.daily) {
      const cur = rec.daily && rec.daily.date === TODAY_KEY ? rec.daily.grade : null;
      if (!cur || gradeIdx(grade) < gradeIdx(cur)) rec.daily = { date: TODAY_KEY, grade };
    }
    rec.ch = rec.ch || {};
    const got = [];
    const earn = (k, ok) => { if (ok && !rec.ch[k]) { rec.ch[k] = true; steamAch(k); got.push(CHALLENGES.find((c) => c[0] === k)[1]); } };
    earn('release', grade === L('정식 출시', 'Released', '正式リリース', '正式发布'));
    earn('nocrash', r.st.crashes === 0);
    earn('norollback', r.st.rollbacks === 0);
    earn('acc90', acc >= 0.9);
    earn('blast5', r.st.blastMax >= 5);
    earn('boss90', r.st.bossTime > 0 && r.st.bossTime <= 90);
    earn('hard', r.diff === 'hard');
    earn('hardrelease', r.diff === 'hard' && grade === L('정식 출시', 'Released', '正式リリース', '正式发布'));
    let unlocked = false;
    if ((r.diff === 'normal' || r.diff === 'hard') && !this.hardOpen()) { rec.hardOpen = true; this.hardOpenMem = true; unlocked = true; }
    Store.set('records', rec);
    $('#resChal').textContent = (unlocked ? L('🔓 난이도 상이 열렸어요! ', '🔓 Hard difficulty unlocked! ', '🔓 ハードが解放された! ', '🔓 困难难度已解锁！') : '') + (got.length ? L('🏆 새 도전 과제: ', '🏆 New challenge: ', '🏆 新しいチャレンジ: ', '🏆 新挑战：') + got.join(', ') : '');
    if (unlocked) SND.play('unlock');
    this.only('#scrResult');
  },
  patchNote(grade, acc) {
    const r = Game.run, st = r.st, f = st.fixed;
    const rr = mulberry32(r.score + st.shots);
    const ver = r.daily ? DAILY_VER : 'v1.0.' + st.crashes;
    const kinds = [[L('기본', 'Basic', 'ベーシック', '基础'), f.basic], [L('복제', 'Clone', 'クローン', '克隆'), f.clone + f.mini], ['throw', f.throw || 0], [L('투명', 'Ghost', 'ゴースト', '幽灵'), f.ghost], ['404', f.e404], [L('무한루프', 'Infinite Loop', '無限ループ', '无限循环'), f.loop]].sort((a, b) => b[1] - a[1]);
    const lines = [L(`${kinds[0][0]} 버그 ${kinds[0][1]}마리 수정`, `Fixed ${kinds[0][1]} ${kinds[0][0]} bugs`, `${kinds[0][0]}バグ ${kinds[0][1]}匹を修正`, `修复了 ${kinds[0][1]} 只${kinds[0][0]}Bug`)];
    const glName = { tear: L('화면 찢어짐', 'Screen Tear', '画面の裂け目', '画面撕裂'), inv: L('색 반전', 'Color Invert', '色反転', '颜色反转'), flip: L('화면 뒤집힘', 'Screen Flip', '画面反転', '画面翻转'), slip: L('조준 미끄러짐', 'Aim Slip', '照準ずれ', '准星漂移'), pix: L('픽셀화', 'Pixelate', 'ピクセル化', '像素化') };
    const topG = Object.entries(st.glitch).sort((a, b) => b[1] - a[1])[0];
    const total = Object.values(f).reduce((a, b) => a + b, 0);
    const miss = st.shots - st.hits;
    const pool = [];
    const add = (cond, txt, w = 1) => { if (cond) pool.push([txt, w + rr()]); };
    add(topG[1] > 0, L(`${glName[topG[0]]} 버그를 ${topG[1]}회 경험했습니다 (죄송합니다)`, `Experienced the ${glName[topG[0]]} bug ${topG[1]} times (sorry)`, `${glName[topG[0]]}バグを${topG[1]}回体験しました (すみません)`, `体验了${topG[1]}次${glName[topG[0]]}Bug（抱歉）`), 3);
    add(st.bossTime > 0, L(`메인 루프를 ${Math.floor(st.bossTime / 60)}분 ${Math.round(st.bossTime % 60)}초 만에 정상화`, `Fixed the Main Loop in ${Math.floor(st.bossTime / 60)}m ${Math.round(st.bossTime % 60)}s`, `メインループを${Math.floor(st.bossTime / 60)}分${Math.round(st.bossTime % 60)}秒で修復`, `用${Math.floor(st.bossTime / 60)}分${Math.round(st.bossTime % 60)}秒修好主循环`), 4);
    add(st.crashes > 0, L(`크래시 ${st.crashes}회 후 재빌드 성공 (끈기 +1)`, `Rebuilt successfully after ${st.crashes} crashes (Persistence +1)`, `クラッシュ${st.crashes}回の後、再ビルド成功 (根性 +1)`, `崩溃${st.crashes}次后重新构建成功（毅力 +1）`), 2);
    add(st.crashes === 0, L('크래시 0회 — 이번 빌드는 놀랍도록 안정적입니다', '0 crashes — this build is surprisingly stable', 'クラッシュ0回 — 今回のビルドは驚くほど安定', '零崩溃 — 本次构建稳定得惊人'), 2);
    add(true, L(`정확도 ${Math.round(acc * 100)}% — 손 떨림 패치 ${acc >= 0.9 ? '불필요' : '예정'}`, `Accuracy ${Math.round(acc * 100)}% — shaky-hands patch ${acc >= 0.9 ? 'not needed' : 'scheduled'}`, `命中率 ${Math.round(acc * 100)}% — 手ぶれパッチ ${acc >= 0.9 ? '不要' : '予定'}`, `命中率 ${Math.round(acc * 100)}% — 手抖补丁 ${acc >= 0.9 ? '无需' : '计划中'}`), 1);
    add(st.rollbacks > 0, L(`롤백으로 시간을 ${st.rollbacks}번 되감음`, `Rewound time ${st.rollbacks} times with Rollback`, `ロールバックで時間を${st.rollbacks}回巻き戻した`, `用回滚倒带了${st.rollbacks}次时间`), 1);
    add(st.rollbacks === 0, L('롤백 없이 출시 (용감함)', 'Shipped without Rollback (brave)', 'ロールバックなしでリリース (勇敢)', '不用回滚就发布（真勇敢）'), 1.5);
    add(r.maxStreak >= 10, L(`최대 연속 패치 ${r.maxStreak}회 달성`, `Reached a ${r.maxStreak}-patch streak`, `最大${r.maxStreak}連続パッチ達成`, `达成最高${r.maxStreak}连续补丁`), 1.5);
    add(f.ghost > 0, L(`투명 버그 ${f.ghost}마리를 눈치로 잡음`, `Caught ${f.ghost} Ghost Bugs by instinct`, `ゴーストバグ${f.ghost}匹を勘で退治`, `凭直觉抓到${f.ghost}只幽灵Bug`), 1);
    add(f.loop > 0, L(`무한루프 ${f.loop}개 탈출 성공`, `Escaped ${f.loop} infinite loops`, `無限ループ${f.loop}個から脱出成功`, `成功逃出${f.loop}个无限循环`), 1);
    add(f.mini > 0, L(`작은 복제 버그 ${f.mini}마리 정리 (복붙 금지)`, `Cleaned up ${f.mini} mini clones (no copy-pasting)`, `ミニクローン${f.mini}匹を整理 (コピペ禁止)`, `清理了${f.mini}只迷你克隆（禁止复制粘贴）`), 1);
    add(r.help.some((x) => x), L('도움 모드로 버그 속도 15% 하향 조정', 'Bug speed lowered 15% by Assist mode', 'アシストモードでバグ速度を15%下方修正', '辅助模式将Bug速度下调15%'), 2);
    add(true, L(`안정성 ${Math.round(r.stab)}%로 출시`, `Shipped at ${Math.round(r.stab)}% stability`, `安定性${Math.round(r.stab)}%でリリース`, `以${Math.round(r.stab)}%稳定性发布`), 0.5);
    add(miss > 0, L(`헛발질 ${miss}발 — 탄약이 무제한이라 다행`, `${miss} shots missed — good thing ammo is unlimited`, `空振り${miss}発 — 弾が無限でよかった`, `打空${miss}发 — 还好弹药无限`), 1);
    add(st.blastMax >= 3, L(`한 방에 복제 버그 ${st.blastMax}마리 동시 수정`, `Fixed ${st.blastMax} clone bugs in one shot`, `1発でクローンバグ${st.blastMax}匹を同時修正`, `一发同时修复${st.blastMax}只克隆Bug`), 1.5);
    add(true, L(`총 ${total}개의 버그가 세상에서 사라졌습니다`, `${total} bugs have vanished from the world`, `合計${total}匹のバグが世界から消えた`, `共有${total}只Bug从世界上消失`), 0.8);
    add(st.perfect >= 5, L(`PERFECT 패치 ${st.perfect}회 — 정밀 디버깅 장인`, `${st.perfect} PERFECT patches — master debugger`, `PERFECTパッチ${st.perfect}回 — 精密デバッグの達人`, `PERFECT补丁${st.perfect}次 — 精密调试大师`), 2);
    add(st.hotfix > 0, L(`핫픽스 ${st.hotfix}개 긴급 배포`, `Deployed ${st.hotfix} emergency hotfixes`, `ホットフィックス${st.hotfix}個を緊急配信`, `紧急发布了${st.hotfix}个热修复`), 1.2);
    add((st.pair || 0) >= 3, L(`페어 프로그래밍 ${st.pair}회 — 혼자 짠 코드보다 버그가 적습니다`, `Pair programming ×${st.pair} — fewer bugs than solo code`, `ペアプロ ${st.pair}回 — ひとりで書いたコードよりバグが少ない`, `结对编程${st.pair}次 — 比单人写的代码Bug更少`), 2);
    add(st.weak >= 8, L(`약점 무기로 ${st.weak}마리 공략 — 분대 운용 만점`, `Took down ${st.weak} bugs with weak weapons — squad tactics: perfect`, `弱点武器で${st.weak}匹を攻略 — 分隊運用は満点`, `用弱点武器攻略${st.weak}只 — 小队配合满分`), 2);
    add(st.blocked >= 10, L(`엄폐물로 에러 패킷 ${st.blocked}개 방어 — 숨기 장인`, `Blocked ${st.blocked} error packets with cover — master of hiding`, `遮蔽物でエラーパケット${st.blocked}個を防御 — 隠れ名人`, `用掩体挡下${st.blocked}个错误数据包 — 隐蔽大师`), 2.2);
    add(st.missiles > 0, L(`관통 미사일 ${st.missiles}발 격추`, `Shot down ${st.missiles} piercing missiles`, `貫通ミサイル${st.missiles}発を撃墜`, `击落${st.missiles}发穿透导弹`), 1.8);
    add(st.overheat > 0, L(`패치 건 과열 ${st.overheat}회 — 냉각 팬 교체 예정`, `Patch gun overheated ${st.overheat} times — cooling fan replacement scheduled`, `パッチガンのオーバーヒート${st.overheat}回 — 冷却ファン交換予定`, `补丁枪过热${st.overheat}次 — 计划更换散热风扇`), 2.5);
    add(st.trojan > 0, L(`트로이 목마 핫픽스 ${st.trojan}개에 속음 (보안팀 호출)`, `Fell for ${st.trojan} trojan hotfixes (security team notified)`, `トロイの木馬ホットフィックス${st.trojan}個にだまされた (セキュリティチーム呼び出し)`, `被${st.trojan}个特洛伊木马热修复骗了（已呼叫安全团队）`), 3);
    add(st.dash >= 5, L(`돌진 버그 ${st.dash}마리와 정면 승부`, `Faced ${st.dash} charging bugs head-on`, `突進バグ${st.dash}匹と正面勝負`, `与${st.dash}只冲锋Bug正面对决`), 1.5);
    pool.sort((a, b) => b[1] - a[1]);
    for (const p of pool.slice(0, 2)) lines.push(p[0]);
    const known = [];
    if (st.tele > 0) known.push(L(`알려진 문제: 플레이어가 404 버그를 ${st.tele}번 놓침`, `Known issue: player missed the 404 Bug ${st.tele} times`, `既知の問題: プレイヤーが404バグを${st.tele}回見失った`, `已知问题：玩家跟丢404 Bug ${st.tele}次`));
    if (st.contacts > 0) known.push(L(`알려진 문제: 버그와 ${st.contacts}번 부딪힘 (안전모 지급 예정)`, `Known issue: bumped into bugs ${st.contacts} times (helmets on order)`, `既知の問題: バグと${st.contacts}回ぶつかった (ヘルメット支給予定)`, `已知问题：与Bug相撞${st.contacts}次（计划配发安全帽）`));
    known.push(L('알려진 문제: 정상화된 메인 루프가 가끔 웃음', 'Known issue: the fixed Main Loop sometimes smiles', '既知の問題: 修復されたメインループがときどき笑う', '已知问题：修好的主循环有时会笑'));
    known.push(L('알려진 문제: 텍스처 없는 숲이 너무 예뻐짐', 'Known issue: the Textureless Forest got too pretty', '既知の問題: テクスチャのない森がきれいになりすぎた', '已知问题：无贴图森林变得太漂亮了'));
    lines.push(known[0]);
    return L(`🐛 Patch Squad ${ver} 패치 노트 — 등급: ${grade} · 난이도 ${Game.D.name}\n`, `🐛 Patch Squad ${ver} patch notes — Grade: ${grade} · Difficulty ${Game.D.name}\n`, `🐛 Patch Squad ${ver} パッチノート — 評価: ${grade} · 難易度 ${Game.D.name}\n`, `🐛 Patch Squad ${ver} 补丁说明 — 评价：${grade} · 难度 ${Game.D.name}\n`) + lines.map((l) => '• ' + l).join('\n') + L(`\n점수 ${r.score.toLocaleString()} · #패치스쿼드`, `\nScore ${r.score.toLocaleString()} · #PatchSquad`, `\nスコア ${r.score.toLocaleString()} · #PatchSquad`, `\n分数 ${r.score.toLocaleString()} · #PatchSquad`);
  },
  copyNote() {
    const text = $('#resNote').textContent;
    const done = () => { $('#btnCopy').textContent = L('복사됨 ✔', 'Copied ✔', 'コピーしました ✔', '已复制 ✔'); this.toast(L('패치 노트를 복사했어요', 'Patch notes copied', 'パッチノートをコピーしました', '补丁说明已复制')); };
    const fallback = () => {
      const ta = $('#resNoteTa');
      ta.classList.remove('hidden'); $('#resNote').classList.add('hidden');
      ta.focus(); ta.select();
      let ok = false; try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
      if (ok) done(); else { $('#btnCopy').textContent = L('글자를 선택해 Ctrl+C', 'Select the text and press Ctrl+C', '文字を選択してCtrl+C', '选中文字后按Ctrl+C'); this.toast(L('복사가 막혀 있어요 — 글자를 선택해 Ctrl+C로 복사하세요', 'Copy is blocked — select the text and press Ctrl+C', 'コピーがブロックされています — 文字を選択してCtrl+Cでコピーしてください', '复制被阻止 — 请选中文字后按Ctrl+C复制')); }
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
    console.error('init failed', e && e.stack || e);
    document.body.innerHTML = L('<div style="padding:24px;color:#eee;font-family:sans-serif">이 기기에서 3D(WebGL)를 시작할 수 없어요.<br>다른 브라우저로 열어 주세요.<br><small style="color:#888">', '<div style="padding:24px;color:#eee;font-family:sans-serif">3D (WebGL) could not start on this device.<br>Please update your graphics driver.<br><small style="color:#888">', '<div style="padding:24px;color:#eee;font-family:sans-serif">このデバイスでは3D(WebGL)を開始できませんでした。<br>グラフィックドライバーを更新してください。<br><small style="color:#888">', '<div style="padding:24px;color:#eee;font-family:sans-serif">此设备无法启动3D（WebGL）。<br>请更新显卡驱动。<br><small style="color:#888">') + String(e && e.message || e) + '</small></div>';
  }
});
