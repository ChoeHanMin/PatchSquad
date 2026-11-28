// 타이틀(메인 화면) 음악을 게임 음악 코드(MUS) 그대로 렌더링 → WAV
// 사용: node steam/render_title_bgm.js <출력.wav> [반복 횟수=3]
// 3번 반복을 렌더링해서 (1) 가운데 한 바퀴만 잘라 이음새 없는 반복용, (2) 처음부터 2바퀴 + 페이드아웃 감상용을 ffmpeg로 만듦
const { chromium } = require('playwright');
const fs = require('fs');
(async () => {
  const out = process.argv[2], loops = +(process.argv[3] || 3);
  const b = await chromium.launch(); const p = await b.newPage();
  await p.addInitScript(() => { localStorage.setItem('patchsquad_settings', JSON.stringify({ sound: true, sfx: 0.8, music: 1, quality: 'low' })); localStorage.setItem('patchsquad_introSeen', 'true'); });
  await p.goto('file:///home/user/bughunter-steam/dist/index.dev.html'); await p.waitForTimeout(1500);
  const r = await p.evaluate(async (loops) => {
    const SND = window.__BH.SND, MUS = window.__BH.MUS, SR = 48000;
    const sp = 60 / 74 / 4, steps = 128 * loops, len = steps * sp + 4;
    const off = new OfflineAudioContext(2, Math.round(SR * len), SR);
    const Real = window.AudioContext; window.AudioContext = function () { return off; };
    MUS.stop(); SND.ctx = null; SND.init(); window.AudioContext = Real;
    SND.master.gain.cancelScheduledValues(0); SND.master.gain.setValueAtTime(0.9, 0);
    SND.musG.gain.cancelScheduledValues(0); SND.musG.gain.setValueAtTime(0.75, 0);
    // 타이틀 설정 그대로 (MUS.startTitle과 같음)
    Object.assign(MUS, { mode: 'title', keyRoot: 146.83, tempo: 74, prog: [0, 5, 2, 6, 0, 5, 3, 4], theme: MUS.THEME_A, layer: 4, crash: false, tempoMul: 1, pitchMul: 1, slow: false });
    let t = 0.05; for (let s = 0; s < steps; s++) { MUS.playStep(s, t); t += sp; }
    const buf = await off.startRendering();
    const ch = [buf.getChannelData(0), buf.getChannelData(1)];
    let pk = 0; for (const c of ch) for (let i = 0; i < c.length; i++) pk = Math.max(pk, Math.abs(c[i]));
    const g = pk > 0 ? 0.89 / pk : 1, n = buf.length, pcm = new Int16Array(n * 2);
    for (let i = 0; i < n; i++) for (let c = 0; c < 2; c++) pcm[i * 2 + c] = Math.max(-32767, Math.min(32767, Math.round(ch[c][i] * g * 32767)));
    const bytes = new Uint8Array(pcm.buffer); let bin = '';
    for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
    return { b64: btoa(bin), loopSec: 128 * sp, start: 0.05, peak: pk };
  }, loops);
  const data = Buffer.from(r.b64, 'base64'), h = Buffer.alloc(44), SR = 48000;
  h.write('RIFF', 0); h.writeUInt32LE(36 + data.length, 4); h.write('WAVE', 8); h.write('fmt ', 12); h.writeUInt32LE(16, 16); h.writeUInt16LE(1, 20); h.writeUInt16LE(2, 22); h.writeUInt32LE(SR, 24); h.writeUInt32LE(SR * 4, 28); h.writeUInt16LE(4, 32); h.writeUInt16LE(16, 34); h.write('data', 36); h.writeUInt32LE(data.length, 40);
  fs.writeFileSync(out, Buffer.concat([h, data]));
  console.log(JSON.stringify({ loopSec: r.loopSec, start: r.start, peak: r.peak }));
  await b.close();
})();
