// 어그로 버전 카드: 오프닝 글리치 문구, 로고 슬램, 새 자막
const sharp = require('/home/user/bughunter-steam/node_modules/sharp');
const fs = require('fs');
const D = __dirname + '/cards/';
fs.mkdirSync(D, { recursive: true });
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/'/g, '&#39;');
const glitchText = (lines, size, accent) => {
  // 글자를 빨강/연두로 어긋나게 겹쳐 그려 글리치 느낌
  const ys = lines.map((_, i) => 540 + (i - (lines.length - 1) / 2) * size * 1.25 + size * 0.35);
  const layer = (dx, dy, col, op) => lines.map((l, i) => `<text x="${960 + dx}" y="${ys[i] + dy}" font-family="JetBrains Mono" font-weight="800" font-size="${size}" fill="${col}" fill-opacity="${op}" text-anchor="middle">${esc(l)}</text>`).join('');
  const bars = Array.from({ length: 7 }, (_, k) => `<rect x="${(k * 263) % 1500}" y="${300 + ((k * 137) % 480)}" width="${180 + (k * 71) % 340}" height="${4 + (k % 3) * 3}" fill="${k % 2 ? '#FF4D5E' : '#C6F432'}" opacity=".75"/>`).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1920" height="1080"><rect width="1920" height="1080" fill="#050605"/>${bars}${layer(-7, 0, '#FF4D5E', 0.85)}${layer(7, 0, '#33f0ff', 0.7)}${layer(0, 0, '#F2F5EE', 1)}${accent || ''}</svg>`;
};
(async () => {
  await sharp(Buffer.from(glitchText(['AN AI MADE THIS GAME.'], 92))).png().toFile(D + 'open1.png');
  await sharp(Buffer.from(glitchText(['IT WENT', 'HORRIBLY WRONG.'], 118))).png().toFile(D + 'open2.png');
  // 로고 슬램 카드 (검은 배경 + 큰 로고 + COMING SOON)
  const logo = await sharp('/home/user/bughunter-steam/assets/logo.png').trim({ threshold: 1 }).resize({ width: 1500 }).png().toBuffer();
  const lm = await sharp(logo).metadata();
  const under = `<svg xmlns="http://www.w3.org/2000/svg" width="1920" height="1080">
    <rect width="1920" height="1080" fill="#070807"/>
    <rect x="0" y="${470 - lm.height / 2 - 30}" width="1920" height="${lm.height + 60}" fill="#C6F432" opacity=".06"/>
    <text x="960" y="${560 + lm.height / 2 + 40}" font-family="JetBrains Mono" font-weight="800" font-size="64" fill="#C6F432" text-anchor="middle" letter-spacing="14">COMING SOON</text></svg>`;
  await sharp(Buffer.from(under)).composite([{ input: logo, left: Math.round((1920 - lm.width) / 2), top: Math.round(470 - lm.height / 2) }]).png().toFile(D + 'slam.png');
  // 새 자막 (더 세게)
  const caps = { s1: 'HOLD TO SHOOT. LET GO TO HIDE.', s2: '3 SQUADMATES. 3 WEAPONS.', s3: 'THE WORLD IS GLITCHING', s4: "DON'T LET IT CRASH", boss: 'FIX THE MAIN LOOP' };
  for (const [k, txt] of Object.entries(caps)) {
    const fsz = 62, w = Math.round(txt.length * fsz * 0.62 + 90), h = 108;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w + 12}" height="${h + 12}">
      <rect x="12" y="12" width="${w}" height="${h}" fill="#000"/>
      <rect x="0" y="0" width="${w}" height="${h}" fill="#C6F432"/>
      <text x="${w / 2}" y="${h / 2 + fsz * 0.36}" font-family="JetBrains Mono" font-weight="800" font-size="${fsz}" fill="#11140c" text-anchor="middle">${esc(txt)}</text></svg>`;
    await sharp(Buffer.from(svg)).png().toFile(D + 'cap_' + k + '.png');
  }
  // 엔드 카드 문구: WISHLIST NOW
  const bg = await sharp('/home/user/bughunter-steam/steam/art_src/keyart_wide.webp').resize(1920, 1080, { fit: 'cover' }).modulate({ brightness: 0.42, saturation: 0.95 }).blur(2).png().toBuffer();
  const logo2 = await sharp(logo).resize({ width: 1240 }).png().toBuffer(); const l2 = await sharp(logo2).metadata();
  const txt = `<svg xmlns="http://www.w3.org/2000/svg" width="1920" height="1080">
    <rect x="${960 - 470 + 12}" y="${640 + 12}" width="940" height="116" fill="#000"/>
    <rect x="${960 - 470}" y="640" width="940" height="116" fill="#C6F432"/>
    <text x="960" y="718" font-family="JetBrains Mono" font-weight="800" font-size="60" fill="#11140c" text-anchor="middle">WISHLIST NOW ON STEAM</text>
    <text x="960" y="850" font-family="JetBrains Mono" font-weight="700" font-size="34" fill="#E8EDE2" text-anchor="middle">Soodal Games</text>
    <text x="960" y="900" font-family="JetBrains Mono" font-size="26" fill="#9aa096" text-anchor="middle">English · 한국어 · Windows</text></svg>`;
  await sharp(bg).composite([{ input: logo2, left: Math.round((1920 - l2.width) / 2), top: 360 - Math.round(l2.height / 2) }, { input: Buffer.from(txt), left: 0, top: 0 }]).png().toFile(D + 'endcard.png');
  console.log('ok');
})();
