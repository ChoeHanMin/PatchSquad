// 트레일러 음악: 게임의 음악 코드(MUS)를 OfflineAudioContext로 정확히 렌더링 → WAV
const { chromium } = require('playwright');
const fs = require('fs');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage();
  const errs = []; p.on('pageerror', (e) => errs.push(e.message)); p.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
  await p.addInitScript(() => {
    const SR = 48000, LEN = 52;
    window.__off = null;
    window.AudioContext = function () { window.__off = new OfflineAudioContext(2, SR * LEN, SR); return window.__off; };
    try { localStorage.setItem('patchsquad_settings', JSON.stringify({ sound: true, sfx: .8, music: 1, reduceFlash: false, quality: 'low' })); } catch (e) {}
  });
  await p.goto('file:///home/user/bughunter-steam/dist/index.dev.html');
  await p.waitForTimeout(1500);
  const out = await p.evaluate(async () => {
    const SND = window.__BH.SND, MUS = window.__BH.MUS;
    if (!SND.ctx) SND.init();
    MUS.stop();
    const ctx = SND.ctx;
    SND.musG.gain.cancelScheduledValues(0); SND.musG.gain.setValueAtTime(0.75, 0);
    SND.master.gain.cancelScheduledValues(0); SND.master.gain.setValueAtTime(0.9, 0);
    const marks = [];
    let t = 0.05;
    const seg = (cfg, bars, stepStart = 0) => {
      Object.assign(MUS, { crash: false, tempoMul: 1, pitchMul: 1, slow: false }, cfg);
      const sp = 60 / MUS.tempo / 4;
      marks.push({ name: cfg.name, t });
      for (let s = stepStart; s < stepStart + bars * 16; s++) { MUS.playStep(s, t); t += sp; }
    };
    const stage = { mode: 'stage', keyRoot: 164.81, tempo: 108, prog: [0, 5, 6, 0, 3, 5, 6, 4], theme: MUS.THEME_A };
    seg({ name: 'intro', mode: 'title', keyRoot: 146.83, tempo: 74, prog: [0, 5, 2, 6, 0, 5, 3, 4], theme: MUS.THEME_A, layer: 4 }, 1, 0);
    seg(Object.assign({ name: 's1', layer: 1 }, stage), 3, 0);
    seg(Object.assign({ name: 's2', layer: 2 }, stage), 3, 48);
    seg(Object.assign({ name: 's3', layer: 3 }, stage), 3, 96);
    seg(Object.assign({ name: 's4', layer: 4 }, stage), 3, 144);
    seg({ name: 'boss', mode: 'boss', keyRoot: 123.47, tempo: 146, prog: [0, 0, 5, 6, 0, 0, 3, 4], theme: MUS.THEME_B, layer: 4 }, 5, 0);
    seg({ name: 'end', mode: 'title', keyRoot: 146.83, tempo: 74, prog: [0, 5, 2, 6, 0, 5, 3, 4], theme: MUS.THEME_A, layer: 4 }, 1, 64);
    seg({ name: 'end2', mode: 'title', keyRoot: 146.83, tempo: 74, prog: [0, 5, 2, 6, 0, 5, 3, 4], theme: MUS.THEME_A, layer: 4 }, 1, 80);
    marks.push({ name: 'stop', t });
    const buf = await ctx.startRendering();
    const ch = [buf.getChannelData(0), buf.getChannelData(1)];
    let peak = 0; for (const c of ch) for (let i = 0; i < c.length; i++) peak = Math.max(peak, Math.abs(c[i]));
    const n = buf.length, g = peak > 0 ? 0.89 / peak : 1;
    const pcm = new Int16Array(n * 2);
    for (let i = 0; i < n; i++) for (let c = 0; c < 2; c++) pcm[i * 2 + c] = Math.max(-32767, Math.min(32767, Math.round(ch[c][i] * g * 32767)));
    const bytes = new Uint8Array(pcm.buffer); let bin = '';
    for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
    return { marks, sr: buf.sampleRate, peak, b64: btoa(bin) };
  });
  const pcm = Buffer.from(out.b64, 'base64');
  const h = Buffer.alloc(44);
  h.write('RIFF', 0); h.writeUInt32LE(36 + pcm.length, 4); h.write('WAVE', 8); h.write('fmt ', 12); h.writeUInt32LE(16, 16);
  h.writeUInt16LE(1, 20); h.writeUInt16LE(2, 22); h.writeUInt32LE(out.sr, 24); h.writeUInt32LE(out.sr * 4, 28); h.writeUInt16LE(4, 32); h.writeUInt16LE(16, 34);
  h.write('data', 36); h.writeUInt32LE(pcm.length, 40);
  fs.writeFileSync(__dirname + '/music.wav', Buffer.concat([h, pcm]));
  fs.writeFileSync(__dirname + '/marks.json', JSON.stringify(out.marks, null, 1));
  console.log('peak', out.peak, out.marks.map((m) => m.name + '@' + m.t.toFixed(2)).join(' '), errs.slice(0, 3));
  await b.close();
})();
