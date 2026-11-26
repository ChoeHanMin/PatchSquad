// 스팀판 Windows 앱 만들기 (Wine 필요 없음)
// 사용: node build-desktop.js   → desktop-out/PatchSquad-win32-x64/ + PatchSquad_win64_v<버전>.zip
// 1) node build.js 로 dist/index.html 만들기  2) desktop/app 에 복사  3) Electron으로 포장
// 4) exe에 아이콘·버전 정보 넣기(resedit, 순수 JS)  5) zip
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const R = (...p) => path.join(__dirname, ...p);
const pkg = require('./desktop/package.json');
const VER = pkg.version; // 버전은 desktop/package.json 하나만 고치면 됨
const VER4 = (VER + '.0.0.0').split('.').slice(0, 4).map(Number);

(async () => {
  // 0) 데스크톱 앱 의존성 (steamworks.js) — 없으면 설치
  if (!fs.existsSync(R('desktop', 'node_modules', 'steamworks.js'))) execFileSync('npm', ['install', '--no-audit', '--no-fund'], { cwd: R('desktop'), stdio: 'inherit' });
  // 1~2) 게임 빌드 + 복사
  execFileSync(process.execPath, [R('build.js')], { stdio: 'inherit' });
  fs.mkdirSync(R('desktop', 'app'), { recursive: true });
  fs.copyFileSync(R('dist', 'index.html'), R('desktop', 'app', 'index.html'));

  // 아이콘: desktop/icon_src.png(정사각형)가 있으면 그것, 없으면 기본 버그 그림
  const sharp = require('sharp');
  const src = fs.existsSync(R('desktop', 'icon_src.png')) ? R('desktop', 'icon_src.png') : R('assets', 'bug_basic.png');
  const sq = (n) => sharp(src).trim({ threshold: 1 }).resize(n, n, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer();
  fs.writeFileSync(R('desktop', 'icon.png'), await sq(512));
  const pngToIco = require('png-to-ico');
  const ico = await pngToIco(await Promise.all([256, 128, 64, 48, 32, 16].map(sq)));
  fs.writeFileSync(R('desktop', 'icon.ico'), ico);

  // 3) 포장
  const { packager } = require('@electron/packager');
  const electronVersion = require('electron/package.json').version;
  fs.rmSync(R('desktop-out'), { recursive: true, force: true });
  const [outDir] = await packager({
    dir: R('desktop'), out: R('desktop-out'), name: 'PatchSquad', executableName: 'PatchSquad',
    platform: 'win32', arch: 'x64', electronVersion, asar: { unpack: '**/*.{node,dll}' }, overwrite: true, prune: false,
    ignore: [/icon_src\.png$/, /icon\.ico$/, /steamworks\.js\/dist\/(linux64|osx)/, /\.lib$/, /steam_appid\.txt$/],
    // win32metadata/icon은 Wine이 필요해서 쓰지 않고 아래 resedit으로 넣음
  });

  // 4) exe 아이콘·버전 정보
  const ResEdit = require('resedit');
  const exePath = path.join(outDir, 'PatchSquad.exe');
  const exe = ResEdit.NtExecutable.from(fs.readFileSync(exePath));
  const res = ResEdit.NtExecutableResource.from(exe);
  const iconFile = ResEdit.Data.IconFile.from(ico);
  const groups = ResEdit.Resource.IconGroupEntry.fromEntries(res.entries);
  const gid = groups.length ? groups[0].id : 1, glang = groups.length ? groups[0].lang : 1033;
  ResEdit.Resource.IconGroupEntry.replaceIconsForResource(res.entries, gid, glang, iconFile.icons.map((i) => i.data));
  const vis = ResEdit.Resource.VersionInfo.fromEntries(res.entries);
  const vi = vis[0];
  vi.setFileVersion(...VER4); vi.setProductVersion(...VER4);
  for (const lang of vi.getAllLanguagesForStringValues()) {
    vi.setStringValues(lang, {
      FileDescription: 'Patch Squad', ProductName: 'Patch Squad', InternalName: 'PatchSquad',
      OriginalFilename: 'PatchSquad.exe', CompanyName: 'Soodal Games (Choi Hanmin)', LegalCopyright: '© 2026 Soodal Games (Choi Hanmin)',
      FileVersion: VER4.join('.'), ProductVersion: VER4.join('.'),
    });
  }
  vi.outputToResourceEntries(res.entries);
  res.outputResource(exe);
  fs.writeFileSync(exePath, Buffer.from(exe.generate()));
  console.log('exe 아이콘·버전 정보:', VER4.join('.'));

  // 5) zip
  const zipName = `PatchSquad_win64_v${VER4.join('.')}.zip`;
  fs.rmSync(R('desktop-out', zipName), { force: true });
  execFileSync('zip', ['-r', '-q', '-9', zipName, path.basename(outDir)], { cwd: R('desktop-out') });
  console.log('완료:', path.join('desktop-out', zipName), (fs.statSync(R('desktop-out', zipName)).size / 1048576).toFixed(1) + ' MB');
})().catch((e) => { console.error(e); process.exit(1); });
