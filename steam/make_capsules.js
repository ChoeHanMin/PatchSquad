// 스팀 캡슐·라이브러리 이미지 만들기: node steam/make_capsules.js
// 원본: steam/art_src/keyart_wide.webp (16:9), keyart_tall.webp (2:3), keyart_hero.webp (3:1) — 모두 ChatGPT, 로고는 assets/logo.png
const sharp = require('sharp');
const path = require('path');
const R = (...p) => path.join(__dirname, ...p);
const OUT = R('capsules');
(async () => {
  const logo = await sharp(R('..', 'assets', 'logo.png')).trim({ threshold: 1 }).png().toBuffer();
  const lm = await sharp(logo).metadata();
  const logoW = (w) => sharp(logo).resize({ width: Math.round(w) }).png().toBuffer();
  // crop: [left, top, width, height] in source px, logo: width ratio + top ratio
  async function make(name, src, W, H, crop, logoRatio, logoTop) {
    let img = sharp(R('art_src', src)).extract({ left: crop[0], top: crop[1], width: crop[2], height: crop[3] }).resize(W, H, { kernel: 'lanczos3' });
    const comps = [];
    if (logoRatio) {
      const lw = Math.round(W * logoRatio), lh = Math.round(lw * lm.height / lm.width);
      comps.push({ input: await logoW(lw), left: Math.round((W - lw) / 2), top: Math.round(H * logoTop) });
      // 로고 뒤 살짝 어둡게 (가독성)
      const shade = Buffer.from(`<svg width="${W}" height="${H}"><defs><radialGradient id="g" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#000" stop-opacity=".55"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient></defs><ellipse cx="${W / 2}" cy="${H * logoTop + lh / 2}" rx="${lw * 0.62}" ry="${lh * 1.1}" fill="url(#g)"/></svg>`);
      comps.unshift({ input: shade, left: 0, top: 0 });
    }
    const out = path.join(OUT, name);
    await img.composite(comps).png().toFile(out);
    console.log(name, W + 'x' + H);
  }
  // 가로 원본 1672x941, 세로 원본 1024x1536
  await make('header_capsule_920x430.png', 'keyart_wide.webp', 920, 430, [0, 160, 1672, 781], 0.62, 0.07);
  await make('small_capsule_462x174.png', 'keyart_wide.webp', 462, 174, [0, 110, 1672, 629], 0.84, 0.07);
  await make('main_capsule_1232x706.png', 'keyart_wide.webp', 1232, 706, [15, 0, 1642, 941], 0.6, 0.08);
  await make('vertical_capsule_748x896.png', 'keyart_tall.webp', 748, 896, [0, 230, 1024, 1226], 0.86, 0.05);
  await make('library_capsule_600x900.png', 'keyart_tall.webp', 600, 900, [0, 0, 1024, 1536], 0.86, 0.07);
  await make('library_header_920x430.png', 'keyart_wide.webp', 920, 430, [0, 160, 1672, 781], 0.62, 0.07);
  await make('library_hero_3840x1240.png', 'keyart_hero.webp', 3840, 1240, [0, 10, 2000, 646], 0, 0); // 로고·글자 없음, 원본 keyart_hero.webp (3:1, 분대가 가운데)
  await sharp(logo).resize({ width: 1280 }).png().toFile(path.join(OUT, 'library_logo_1280.png'));
  console.log('library_logo_1280.png');
})();
