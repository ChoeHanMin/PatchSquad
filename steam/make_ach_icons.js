// 스팀 도전 과제 아이콘 (256×256, 달성 = 컬러 / 미달성 = 흑백)
// 사용: node steam/make_ach_icons.js → steam/achievements/ACH_*.png, ACH_*_locked.png
// steam/achievements/src/<키>.png 가 있으면 (ChatGPT로 만든 아이콘) 그걸 쓰고, 없으면 게임 그림으로 임시 아이콘을 만듦
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const A = (n) => path.join(__dirname, '..', 'assets', n + '.png');
const OUT = path.join(__dirname, 'achievements');
const SRC = path.join(OUT, 'src');
fs.mkdirSync(OUT, { recursive: true });
const LIST = { // 키: [임시 아이콘에 쓸 게임 그림, 테두리 색]
  release: ['item_hotfix', '#C6F432'], nocrash: ['portrait_dot', '#C6F432'], norollback: [null, '#6fe7ff'],
  acc90: ['bug_404', '#FFD34D'], blast5: ['bug_clone', '#FFD34D'], boss90: ['bug_loop', '#FF4D5E'],
  hard: ['bug_throw', '#FF4D5E'], hardrelease: ['bug_ghost', '#FF4D5E'], tutorial: ['portrait_pin', '#6fe7ff'],
};
(async () => {
  for (const [k, [art, col]] of Object.entries(LIST)) {
    const name = 'ACH_' + k.toUpperCase();
    let img;
    const custom = path.join(SRC, k + '.png');
    if (fs.existsSync(custom)) {
      img = await sharp(custom).resize(256, 256, { fit: 'cover' }).png().toBuffer();
    } else {
      const bg = `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256"><rect width="256" height="256" fill="#0E100D"/><rect x="8" y="8" width="240" height="240" fill="#151913" stroke="${col}" stroke-width="10"/></svg>`;
      const comps = [];
      if (art) comps.push({ input: await sharp(A(art)).trim({ threshold: 1 }).resize(176, 176, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer(), left: 40, top: 40 });
      else comps.push({ input: Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256"><text x="128" y="160" font-family="JetBrains Mono" font-weight="800" font-size="110" fill="${col}" text-anchor="middle">◀◀</text></svg>`), left: 0, top: 0 });
      img = await sharp(Buffer.from(bg)).composite(comps).png().toBuffer();
    }
    await sharp(img).png().toFile(path.join(OUT, name + '.png'));
    await sharp(img).greyscale().modulate({ brightness: 0.55 }).png().toFile(path.join(OUT, name + '_locked.png'));
    console.log(name);
  }
})();
