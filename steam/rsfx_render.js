// 분대원별 장전 소리를 각각 OfflineAudioContext로 렌더링 → WAV (도트 → 렉스 → 핀 → 에이다 → 코볼, 사이 0.6초)
const { chromium } = require('playwright');
const fs = require('fs');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage();
  await p.addInitScript(() => { localStorage.setItem('patchsquad_settings', JSON.stringify({ sound: true, sfx: 0.8, music: 0.6, quality: 'low' })); localStorage.setItem('patchsquad_introSeen', 'true'); });
  await p.goto('file:///home/user/bughunter-steam/dist/index.dev.html'); await p.waitForTimeout(1500);
  const out = await p.evaluate(async () => {
    const SND = window.__BH.SND, SR = 48000, res = [];
    const durs = { dot: 1.1, rex: 1.5, pin: 1.6, ada: 1.6, cobol: 1.5 };
    for (const k of Object.keys(durs)) {
      const off = new OfflineAudioContext(2, Math.round(SR * (durs[k] + 0.7)), SR);
      const Real = window.AudioContext; window.AudioContext = function () { return off; };
      SND.ctx = null; SND.bufs = {}; SND.init(); window.AudioContext = Real;
      SND.reloadSeq(k, durs[k]);
      const buf = await off.startRendering();
      const ch = [buf.getChannelData(0), buf.getChannelData(1)];
      let pk = 0; for (const c of ch) for (let i = 0; i < c.length; i++) pk = Math.max(pk, Math.abs(c[i]));
      res.push({ k, peak: pk, d0: Array.from(ch[0]), d1: Array.from(ch[1]) });
    }
    return res;
  });
  const SR = 48000, gap = Math.round(SR * 0.6);
  let total = 0; for (const r of out) total += r.d0.length + gap;
  const pcm = new Int16Array(total * 2); let o = 0;
  for (const r of out) { for (let i = 0; i < r.d0.length; i++) { pcm[(o + i) * 2] = Math.max(-32767, Math.min(32767, Math.round(r.d0[i] * 32767))); pcm[(o + i) * 2 + 1] = Math.max(-32767, Math.min(32767, Math.round(r.d1[i] * 32767))); } o += r.d0.length + gap; console.log(r.k, 'peak', r.peak.toFixed(2), 'len', (r.d0.length / SR).toFixed(2) + 's'); }
  const data = Buffer.from(pcm.buffer), h = Buffer.alloc(44);
  h.write('RIFF', 0); h.writeUInt32LE(36 + data.length, 4); h.write('WAVE', 8); h.write('fmt ', 12); h.writeUInt32LE(16, 16); h.writeUInt16LE(1, 20); h.writeUInt16LE(2, 22); h.writeUInt32LE(SR, 24); h.writeUInt32LE(SR * 4, 28); h.writeUInt16LE(4, 32); h.writeUInt16LE(16, 34); h.write('data', 36); h.writeUInt32LE(data.length, 40);
  fs.writeFileSync(process.argv[2], Buffer.concat([h, data]));
  await b.close();
})();
