// 게임(index.html)에서 쓸 수 있는 데스크톱 기능만 열어 줌
const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('bhDesktop', {
  quit: () => ipcRenderer.send('bh-quit'),
  isFullscreen: () => ipcRenderer.invoke('bh-is-fullscreen'),
  setFullscreen: (v) => ipcRenderer.send('bh-set-fullscreen', !!v),
  onFullscreen: (fn) => ipcRenderer.on('bh-fullscreen', (e, v) => fn(v)),
  // 저장 파일 (save.json): 시작할 때 한 번 동기로 읽고, 바뀔 때마다 씀
  saveLoad: () => ipcRenderer.sendSync('bh-save-load'),
  saveWrite: (json) => ipcRenderer.send('bh-save-write', String(json)),
  // 스팀 도전 과제 달성 (예: 'ACH_RELEASE')
  achieve: (name) => ipcRenderer.send('bh-ach', String(name)),
});
