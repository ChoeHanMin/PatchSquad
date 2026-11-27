// src/ 여러 파일 + assets/ 그림 → dist/index.html 하나로 합치기
// 스팀판 빌드 (saaskr 제출본과 따로 관리)
// 사용: node build.js        (스팀판)
//       node build.js --dev  (테스트용 window.__BH 노출)
const fs = require('fs');
const path = require('path');
const dev = process.argv.includes('--dev');
const src = (p) => fs.readFileSync(path.join(__dirname, 'src', p), 'utf8');

// 게임 안에 넣는 그림 목록: assets/<이름>.png 가 있으면 줄여서 넣고, 없으면 코드로 그린 그림 사용
// (assets/README.md 참고)
// 스팀판: 4MB 제한이 없으니 1920×1080 화면(고해상도 모니터 ×2까지)에 맞춰 크게 넣음
const B = 256, C = 460; // 버그·아이템 정사각형 / 캐릭터 가로
const ASSET_SPEC = {
  bug_basic: { size: B }, bug_clone: { size: B }, bug_mini: { size: B },
  bug_ghost: { size: B }, bug_404: { size: B }, bug_loop: { size: B },
  logo: { width: 1600 }, item_hotfix: { size: B }, gun: { width: 1448 }, gun_refactor: { width: 1448 }, gun_sniper: { width: 1448 },
  bug_throw: { size: B }, proj_missile: { size: 192 }, proj_packet: { size: 192 },
  portrait_dot: { size: 192 }, portrait_rex: { size: 192 }, portrait_pin: { size: 192 },
  // 캐릭터 자세 그림: 여백을 자르지 않음 (기본·움찔·고통의 위치가 어긋나지 않게)
  char_dot: { width: C, keep: true }, char_dot_flinch: { width: C, keep: true }, char_dot_hurt: { width: C, keep: true },
  char_rex: { width: C, keep: true }, char_rex_flinch: { width: C, keep: true }, char_rex_hurt: { width: C, keep: true },
  char_pin: { width: C, keep: true }, char_pin_flinch: { width: C, keep: true }, char_pin_hurt: { width: C, keep: true },
  // 이동 중 달리는 뒷모습 (2장을 번갈아 보여 줌, 2번째는 선택)
  char_dot_run: { width: C, keep: true }, char_dot_run2: { width: C, keep: true },
  char_rex_run: { width: C, keep: true }, char_rex_run2: { width: C, keep: true },
  char_pin_run: { width: C, keep: true }, char_pin_run2: { width: C, keep: true },
  // 낮은 벽 뒤 웅크린 자세 (기본·움찔·피격, 캔버스는 서 있는 그림과 같은 크기)
  char_dot_crouch: { width: C, keep: true }, char_dot_crouch_flinch: { width: C, keep: true }, char_dot_crouch_hurt: { width: C, keep: true },
  char_rex_crouch: { width: C, keep: true }, char_rex_crouch_flinch: { width: C, keep: true }, char_rex_crouch_hurt: { width: C, keep: true },
  char_pin_crouch: { width: C, keep: true }, char_pin_crouch_flinch: { width: C, keep: true }, char_pin_crouch_hurt: { width: C, keep: true },
  char_ada_crouch: { width: C, keep: true }, char_ada_crouch_flinch: { width: C, keep: true }, char_ada_crouch_hurt: { width: C, keep: true },
  cover: { width: 2172 }, cover_side: { height: 1500 },
  cover_side_forest: { height: 1500 }, cover_side_city: { height: 1500 }, cover_side_subway: { height: 1500 }, cover_side_physics: { height: 1500 }, cover_side_boss: { height: 1500 }, cover_forest: { width: 2172 }, cover_city: { width: 2172 }, cover_subway: { width: 2172 }, cover_physics: { width: 2172 }, cover_boss: { width: 2172 },
  // 스토리 그림 (선택, 16:9) — 없으면 게임 그림으로 장면을 꾸밈
  story_intro1: { width: 1600 }, story_intro2: { width: 1600 }, story_intro3: { width: 1600 }, story_intro4: { width: 1600 }, story_intro5: { width: 1600 },
  // 새 분대원 에이다 + 테스트 서버실
  portrait_ada: { size: 192 }, char_ada: { width: C, keep: true }, char_ada_flinch: { width: C, keep: true }, char_ada_hurt: { width: C, keep: true },
  char_ada_run: { width: C, keep: true }, char_ada_run2: { width: C, keep: true }, gun_ada: { width: 1448 }, proj_capsule: { size: 192 }, drone_ada: { size: 256 },
  cover_server: { width: 2172 }, cover_side_server: { height: 1500 }, story_ada_join: { width: 1600 },
  story_end1: { width: 1600 }, story_end2: { width: 1600 }, story_end3: { width: 1600 }, story_end4: { width: 1600 },
};

async function loadAssets() {
  const dir = path.join(__dirname, 'assets');
  const out = {};
  let sharp = null;
  try { sharp = require('sharp'); } catch (e) { console.warn('sharp 없음: 그림을 줄이지 않고 그대로 넣습니다 (npm install 필요)'); }
  for (const [name, spec] of Object.entries(ASSET_SPEC)) {
    const f = ['png', 'webp'].map((x) => path.join(dir, `${name}.${x}`)).find((p) => fs.existsSync(p));
    if (!f) continue;
    let buf = fs.readFileSync(f), mime = f.endsWith('.webp') ? 'image/webp' : 'image/png';
    if (sharp) {
      let img = spec.keep ? sharp(buf) : sharp(buf).trim({ threshold: 1 }); // 투명 여백 잘라내기
      img = spec.size
        ? img.resize(spec.size, spec.size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
        : spec.height ? img.resize({ height: spec.height, withoutEnlargement: true })
        : img.resize({ width: spec.width, withoutEnlargement: true });
      buf = await img.webp({ quality: 92, alphaQuality: 100, effort: 5 }).toBuffer(); // 스팀판: 색 줄이지 않음
      mime = 'image/webp';
    }
    out[name] = `data:${mime};base64,${buf.toString('base64')}`;
    console.log(`  그림 ${name}: ${(buf.length / 1024).toFixed(1)} KB`);
  }
  // 효과음 파일 (그대로 넣음, 짧게!)
  for (const name of ['sfx_shot', 'sfx_spread', 'sfx_snipe']) {
    for (const [ext, mime] of [['mp3', 'audio/mpeg'], ['ogg', 'audio/ogg'], ['wav', 'audio/wav']]) {
      const f = path.join(dir, `${name}.${ext}`);
      if (!fs.existsSync(f)) continue;
      const buf = fs.readFileSync(f);
      out[name] = `data:${mime};base64,${buf.toString('base64')}`;
      console.log(`  소리 ${name}: ${(buf.length / 1024).toFixed(1)} KB` + (buf.length > 150 * 1024 ? '  ← 너무 큼, 1초 이하로 잘라 주세요' : ''));
      break;
    }
  }
  return out;
}

(async () => {
  const assets = await loadAssets();
  const three = fs.readFileSync(path.join(__dirname, 'node_modules/three/build/three.min.js'), 'utf8')
    .replace(/console\.warn\('Scripts "build\/three\.js"[^)]*\)/, 'void 0'); // r150+ 안내 경고 제거
  const jsDir = path.join(__dirname, 'src', 'js');
  const parts = fs.readdirSync(jsDir).filter((f) => f.endsWith('.js')).sort().map((f) => `// ==== ${f} ====\n` + fs.readFileSync(path.join(jsDir, f), 'utf8'));
  const game = `(function(){'use strict';\nconst ASSETS=${JSON.stringify(assets)};\n${parts.join('\n')}\n${dev ? 'window.__BH={Game,Boss,World,UI,FX,SND,MUS,Tut,Story,Store,Free};' : ''}\n})();`;
  const css = src('style.css').replace(/\s*\n\s*/g, '\n');

  // </script> 가 문자열 안에 있으면 HTML이 깨지므로 방지
  const safe = (s) => s.replace(/<\/script/gi, '<\\/script');
  const html = src('index.html')
    .replace('/*__CSS__*/', () => css)
    .replace('/*__THREE__*/', () => safe(three))
    .replace('/*__GAME__*/', () => safe(game));

  fs.mkdirSync(path.join(__dirname, 'dist'), { recursive: true });
  const out = path.join(__dirname, 'dist', dev ? 'index.dev.html' : 'index.html');
  fs.writeFileSync(out, html);
  const kb = Buffer.byteLength(html) / 1024;
  console.log(`${path.relative(__dirname, out)}  ${kb.toFixed(0)} KB  (스팀판)`);
  if (/(src|href)=["']https?:/i.test(html.replace(three, ''))) console.warn('경고: 외부 URL 참조 발견');
})();
