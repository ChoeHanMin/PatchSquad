// 패치 스쿼드(Patch Squad) 스팀판 데스크톱 앱 (Electron)
// app/index.html = 루트의 node build.js 결과(dist/index.html)를 복사한 것
const { app, BrowserWindow, ipcMain, Menu, shell } = require('electron');
const path = require('path');
const fs = require('fs');

app.setName('PatchSquad'); // 저장 위치(%APPDATA%\PatchSquad)가 바뀌지 않게 고정
// 실행하자마자 소리가 나오게 (브라우저의 "첫 클릭 전 소리 막기"를 끔)
app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required');

if (!app.requestSingleInstanceLock()) { app.quit(); }

// 창 상태(전체 화면 여부, 창 크기) 기억
const stateFile = () => path.join(app.getPath('userData'), 'window.json');
function loadState() {
  try { return Object.assign({ fullscreen: true, width: 1280, height: 720 }, JSON.parse(fs.readFileSync(stateFile(), 'utf8'))); }
  catch (e) { return { fullscreen: true, width: 1280, height: 720 }; }
}
function saveState(win) {
  try {
    const st = loadState();
    st.fullscreen = win.isFullScreen();
    if (!st.fullscreen && !win.isMaximized()) { const [w, h] = win.getSize(); st.width = w; st.height = h; }
    fs.writeFileSync(stateFile(), JSON.stringify(st));
  } catch (e) { /* 저장 실패해도 진행 */ }
}

let win = null;
function createWindow() {
  const st = loadState();
  win = new BrowserWindow({
    title: 'Patch Squad',
    width: Math.max(1024, st.width), height: Math.max(576, st.height),
    minWidth: 1024, minHeight: 576,
    useContentSize: true,
    fullscreen: !!st.fullscreen,
    backgroundColor: '#000000',
    autoHideMenuBar: true,
    show: false,
    icon: path.join(__dirname, 'icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true, nodeIntegration: false, sandbox: true,
      devTools: !app.isPackaged,
      backgroundThrottling: false,
    },
  });
  Menu.setApplicationMenu(null);
  win.loadFile(path.join(__dirname, 'app', 'index.html'));
  win.once('ready-to-show', () => win.show());

  // F11 / Alt+Enter: 전체 화면 전환
  win.webContents.on('before-input-event', (e, input) => {
    if (input.type !== 'keyDown') return;
    if (input.key === 'F11' || (input.alt && input.key === 'Enter')) { win.setFullScreen(!win.isFullScreen()); e.preventDefault(); }
    if (!app.isPackaged && input.key === 'F12') win.webContents.toggleDevTools();
  });
  const notify = () => { if (!win.isDestroyed()) win.webContents.send('bh-fullscreen', win.isFullScreen()); };
  win.on('enter-full-screen', notify); win.on('leave-full-screen', notify);
  win.on('close', () => saveState(win));

  // 게임 밖으로 이동·새 창 막기 (링크는 기본 브라우저로)
  win.webContents.setWindowOpenHandler(({ url }) => { if (/^https?:/.test(url)) shell.openExternal(url); return { action: 'deny' }; });
  // 게임 밖으로 나가는 이동만 막음 (언어를 바꾸면 게임 파일을 다시 불러오는 건 허용)
  win.webContents.on('will-navigate', (e, url) => { if (url.split('#')[0] !== win.webContents.getURL().split('#')[0]) e.preventDefault(); });
}

ipcMain.handle('bh-is-fullscreen', () => (win ? win.isFullScreen() : false));
ipcMain.on('bh-set-fullscreen', (e, v) => { if (win) win.setFullScreen(!!v); });
ipcMain.on('bh-quit', () => app.quit());

app.on('second-instance', () => { if (win) { if (win.isMinimized()) win.restore(); win.focus(); } });
app.whenReady().then(createWindow);
app.on('window-all-closed', () => app.quit());
