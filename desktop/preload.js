// 게임(index.html)에서 쓸 수 있는 데스크톱 기능만 열어 줌
const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('bhDesktop', {
  quit: () => ipcRenderer.send('bh-quit'),
  isFullscreen: () => ipcRenderer.invoke('bh-is-fullscreen'),
  setFullscreen: (v) => ipcRenderer.send('bh-set-fullscreen', !!v),
  onFullscreen: (fn) => ipcRenderer.on('bh-fullscreen', (e, v) => fn(v)),
});
