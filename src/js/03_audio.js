// ---------- 소리 (Web Audio 직접 합성) ----------
const SND = {
  ctx: null, master: null, sfxG: null, musG: null, noise: null,
  running() { return !!this.ctx && this.ctx.state === 'running'; },
  init() {
    if (this.ctx) { if (this.ctx.state !== 'running') { const p = this.ctx.resume(); if (p && p.catch) p.catch(() => {}); } return; }
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      this.ctx = new AC();
      // 출력: 마스터 → 컴프레서(소리를 한데 뭉쳐 단단하게) → 스피커
      this.comp = this.ctx.createDynamicsCompressor();
      this.comp.threshold.value = -16; this.comp.knee.value = 10; this.comp.ratio.value = 4; this.comp.attack.value = 0.004; this.comp.release.value = 0.18;
      this.master = this.ctx.createGain(); this.master.connect(this.comp); this.comp.connect(this.ctx.destination);
      // 효과음: 저음 보강(로우셸프) → 살짝 찌그러뜨리기(웨이브셰이퍼) → 마스터 — 총소리·폭발이 굵고 묵직하게
      this.sfxG = this.ctx.createGain();
      const low = this.ctx.createBiquadFilter(); low.type = 'lowshelf'; low.frequency.value = 140; low.gain.value = 5;
      const drive = this.ctx.createWaveShaper(), cv = new Float32Array(1024);
      for (let i = 0; i < 1024; i++) { const x = i / 511.5 - 1; cv[i] = Math.tanh(x * 1.8) / Math.tanh(1.8); }
      drive.curve = cv; drive.oversample = '2x';
      this.sfxG.connect(low); low.connect(drive); drive.connect(this.master);
      this.musG = this.ctx.createGain();
      const mlow = this.ctx.createBiquadFilter(); mlow.type = 'lowshelf'; mlow.frequency.value = 160; mlow.gain.value = 3.5; // 음악 저음도 조금 더 두껍게
      this.musG.connect(mlow); mlow.connect(this.master);
      const len = this.ctx.sampleRate;
      this.noise = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
      const d = this.noise.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
      this.apply();
      this.loadSamples();
    } catch (e) { this.ctx = null; }
  },
  apply() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    this.master.gain.setTargetAtTime(settings.sound ? 0.9 : 0, t, 0.02);
    this.sfxG.gain.setTargetAtTime(settings.sfx * 0.55, t, 0.02);
    this.musG.gain.setTargetAtTime(settings.music * 0.7, t, 0.02);
  },
  tone(f, dur, type = 'square', vol = 0.3, f2 = null, when = 0, dest = null, attack = 0.004) {
    if (!this.ctx) return;
    const t = (when || this.ctx.currentTime);
    const o = this.ctx.createOscillator(), g = this.ctx.createGain();
    o.type = type; o.frequency.setValueAtTime(f, t);
    if (f2) o.frequency.exponentialRampToValueAtTime(Math.max(20, f2), t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(dest || this.sfxG);
    o.start(t); o.stop(t + dur + 0.02);
  },
  noiseHit(dur, vol = 0.3, ftype = 'highpass', freq = 2000, when = 0, dest = null) {
    if (!this.ctx) return;
    const t = when || this.ctx.currentTime;
    const s = this.ctx.createBufferSource(); s.buffer = this.noise;
    const f = this.ctx.createBiquadFilter(); f.type = ftype; f.frequency.value = freq;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(f); f.connect(g); g.connect(dest || this.sfxG);
    s.start(t, Math.random() * 0.5); s.stop(t + dur + 0.02);
  },
  // 묵직한 저음 한 방: 사인파가 빠르게 떨어지는 킥 + 낮은 잡음 몸통
  thump(f0 = 140, f1 = 42, dur = 0.16, vol = 0.45, when = 0, body = 0.18) {
    if (!this.ctx) return;
    const t = when || this.ctx.currentTime;
    const o = this.ctx.createOscillator(), g = this.ctx.createGain();
    o.type = 'sine'; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f1, t + dur * 0.6);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.003); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(this.sfxG); o.start(t); o.stop(t + dur + 0.02);
    if (body > 0) this.noiseHit(dur * 0.7, body, 'lowpass', 380, t);
  },
  // ---- 분대원별 장전 소리: 장전 그림 3장(시작 → 중간 → 마무리)에 맞춰 차례로 ----
  // key: 분대원(dot/rex/pin/ada/cobol), dur: 장전 시간(초). 시작 0, 중간 34%, 마무리 72% 지점에서 소리가 남
  reloadSeq(key, dur = 1.5) {
    if (!this.ctx || !settings.sound) return;
    this.stopReload();
    const t0 = this.ctx.currentTime, a = t0, b = t0 + dur * 0.34, c = t0 + dur * 0.72;
    const nodes = []; this._rl = nodes;
    const T = (f, d, type, v, f2, w) => { this.tone(f, d, type, v, f2, w); };
    const N = (d, v, ft, fq, w) => { this.noiseHit(d, v, ft, fq, w); };
    const K = (f0, f1, d, v, w, body) => { this.thump(f0, f1, d, v, w, body); };
    const click = (w, f = 2400, v = 0.09) => { N(0.012, v * 2, 'highpass', 3500, w); T(f, 0.02, 'square', v, f * 0.7, w); };
    switch (key) {
      case 'dot': // 빠르고 깔끔: 철컥(빠짐) → 탁!(밀어 넣기) → 딸깍 + 저장 완료 삐빅
        click(a, 1800); N(0.05, 0.12, 'bandpass', 1400, a + 0.02); K(200, 90, 0.06, 0.18, a + 0.16, 0.05); // 카트리지가 툭 떨어짐
        K(160, 60, 0.09, 0.4, b, 0.2); click(b + 0.01, 2600, 0.11); // 손바닥으로 탁
        click(c, 3000, 0.1); click(c + 0.06, 2200, 0.08); T(1318, 0.07, 'triangle', 0.1, null, c + 0.13); T(1976, 0.12, 'triangle', 0.09, null, c + 0.2); // 레버 + 삐빅
        break;
      case 'rex': // 통째로: 철커덩(꺾어 열기) → 촤르르(탄 쏟기) → 쾅! 철컥(닫기)
        K(140, 50, 0.16, 0.5, a, 0.3); N(0.09, 0.22, 'bandpass', 900, a); click(a + 0.05, 1200, 0.12);
        for (let i = 0; i < 3; i++) T(2600 + i * 300, 0.03, 'triangle', 0.06, 1800, a + 0.12 + i * 0.07); // 빈 껍데기 튕김
        for (let i = 0; i < 9; i++) { const w = b + i * 0.035 + Math.random() * 0.02; T(1800 + Math.random() * 1400, 0.025, 'triangle', 0.05, null, w); N(0.02, 0.05, 'highpass', 4000, w); } // 촤르르
        K(120, 40, 0.22, 0.7, c, 0.4); N(0.12, 0.3, 'lowpass', 1200, c); click(c + 0.03, 1500, 0.14); N(0.18, 0.08, 'bandpass', 600, c + 0.08); // 쾅 + 먼지
        break;
      case 'pin': // 정밀: 스르륵(노리쇠 당김) → 팅(셀 끼움) → 톡 + 조준선 웅~
        N(0.22, 0.09, 'bandpass', 700, a); T(220, 0.22, 'sawtooth', 0.04, 440, a); click(a + 0.22, 2000, 0.08);
        T(3520, 0.18, 'sine', 0.1, null, b); T(5274, 0.12, 'sine', 0.05, null, b + 0.01); click(b + 0.04, 3200, 0.06); // 유리 팅
        click(c, 3600, 0.07); T(660, 0.28, 'sine', 0.06, 1320, c + 0.05); T(1320, 0.22, 'triangle', 0.04, 2640, c + 0.1); // 홀로그램
        break;
      case 'ada': // 장난스럽게: 뽁(뚜껑) → 퐁퐁퐁(캡슐) → 통! + 띵띵띵(체크)
        T(900, 0.08, 'sine', 0.16, 300, a); N(0.03, 0.08, 'highpass', 3000, a); T(700, 0.1, 'triangle', 0.08, 1400, a + 0.08); // 뽁 + 빈 캡슐 통통
        for (let i = 0; i < 3; i++) { const w = b + i * 0.09; T(520 + i * 120, 0.09, 'sine', 0.12, 1040 + i * 240, w); T(200, 0.04, 'sine', 0.06, 120, w + 0.05); } // 퐁퐁퐁
        K(180, 70, 0.08, 0.3, c, 0.1); [0, 4, 7].forEach((s, i) => T(988 * Math.pow(2, s / 12), 0.1, 'triangle', 0.09, null, c + 0.08 + i * 0.07)); // 통 + 띵띵띵
        break;
      case 'cobol': // 옛날 기계: 끼익(패널) + 스윽(카드) → 착착(밀어 넣기) → 쿵! 지잉~(화면 켜짐)
        T(320, 0.18, 'sawtooth', 0.04, 260, a); N(0.16, 0.06, 'bandpass', 2400, a + 0.04); // 끼익 + 스윽
        for (let i = 0; i < 2; i++) { N(0.03, 0.14, 'bandpass', 1800, b + i * 0.08); K(190, 110, 0.04, 0.16, b + i * 0.08, 0.06); } // 착착
        K(110, 45, 0.18, 0.6, c, 0.35); N(0.06, 0.2, 'lowpass', 900, c); // 쿵
        T(60, 0.35, 'square', 0.035, 60, c + 0.1); T(7800, 0.25, 'sine', 0.025, 15000, c + 0.12); T(440, 0.2, 'triangle', 0.05, 880, c + 0.18); // 브라운관이 지잉~ 켜짐
        break;
      default: this.play('reload'); return;
    }
  },
  stopReload() { this._rl = null; }, // (예약한 소리는 짧아서 그대로 둠)
  // assets/sfx_*.mp3|ogg|wav 가 있으면 그 소리를 씀
  bufs: {},
  loadSamples() {
    for (const k of ['sfx_shot', 'sfx_spread', 'sfx_snipe', 'bgm_title']) {
      const url = ASSETS[k]; if (!url || this.bufs[k]) continue;
      this.bufs[k] = 'loading';
      try {
        const bin = atob(url.split(',')[1]); const arr = new Uint8Array(bin.length);
        for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
        this.ctx.decodeAudioData(arr.buffer, (b) => { this.bufs[k] = b; if (k === 'bgm_title' && MUS.mode === 'title' && MUS.on && !MUS.fileSrc) { MUS.on = false; MUS.startTitle(); } }, () => { this.bufs[k] = null; if (k === 'bgm_title' && MUS.mode === 'title' && MUS.on && !MUS.fileSrc) { MUS.on = false; MUS.startTitle(); } }); // 타이틀 곡이 풀리면 재생, 실패하면 코드 연주로
      } catch (e) { this.bufs[k] = null; if (k === 'bgm_title' && MUS.mode === 'title' && MUS.on && !MUS.fileSrc) { MUS.on = false; MUS.startTitle(); } }
    }
  },
  sample(k, vol) {
    const b = this.bufs[k]; if (!b || b === 'loading') return false;
    const s = this.ctx.createBufferSource(), g = this.ctx.createGain();
    s.buffer = b; s.playbackRate.value = 0.96 + Math.random() * 0.08; g.gain.value = vol;
    s.connect(g); g.connect(this.sfxG); s.start(); return true;
  },
  play(name, p = 0) {
    if (!this.ctx || !settings.sound) return;
    const now = this.ctx.currentTime;
    switch (name) {
      case 'shot': // 패치 탄: 딸깍 + 뿅 하강 + 낮은 쿵 + 디지털 꼬리
        this.thump(150, 48, 0.12, 0.42, 0, 0.12);
        if (this.sample('sfx_shot', 0.9)) break;
        this.noiseHit(0.025, 0.22, 'highpass', 4500);
        this.tone(1900, 0.075, 'square', 0.11, 420);
        this.tone(190, 0.09, 'sine', 0.3, 55);
        this.tone(2637, 0.05, 'triangle', 0.05, 2093, now + 0.035);
        break;
      case 'spread': // 리팩터: 묵직한 확산음 + 7발 틱
        this.thump(120, 36, 0.24, 0.6, 0, 0.3); this.noiseHit(0.09, 0.22, 'bandpass', 600, now + 0.01);
        if (this.sample('sfx_spread', 0.95)) break;
        this.noiseHit(0.16, 0.32, 'bandpass', 1400);
        this.tone(760, 0.16, 'sawtooth', 0.13, 150);
        this.tone(130, 0.18, 'sine', 0.4, 42);
        for (let i = 0; i < 7; i++) this.tone(2200 + i * 180, 0.03, 'square', 0.04, null, now + 0.02 + i * 0.012);
        break;
      case 'hit': { const m = 1 + Math.min(p, 20) * 0.035; this.tone(1568 * m, 0.18, 'triangle', 0.26); this.tone(2093 * m, 0.22, 'sine', 0.16, null, now + 0.05); break; } // 맑은 띵 (연속일수록 음이 올라감)
      case 'perfect': this.tone(3136, 0.16, 'sine', 0.14, null, now + 0.04); this.tone(4186, 0.2, 'sine', 0.1, null, now + 0.1); break;
      case 'warn': this.tone(880, 0.06, 'square', 0.07); this.tone(660, 0.06, 'square', 0.07, null, now + 0.08); break;
      case 'pickup': [0, 4, 7, 12, 16, 19].forEach((s, i) => this.tone(659 * Math.pow(2, s / 12), 0.1, 'triangle', 0.14, null, now + i * 0.045)); break;
      case 'rush': this.thump(90, 40, 0.35, 0.45, 0, 0.25); this.tone(220, 0.25, 'sawtooth', 0.2, 440); this.tone(330, 0.25, 'sawtooth', 0.15, 660, now + 0.25); this.noiseHit(0.3, 0.15, 'bandpass', 900, now + 0.1); break;
      case 'split': for (let i = 0; i < 3; i++) this.noiseHit(0.05, 0.25, 'bandpass', 2500 + i * 900, now + i * 0.04); this.tone(600, 0.1, 'square', 0.1, 1200); break; // 지직
      case 'tele': this.tone(300, 0.14, 'sine', 0.3, 1800); this.tone(1800, 0.08, 'sine', 0.12, 2600, now + 0.12); break; // 뿅
      case 'glitch': this.thump(100, 40, 0.25, 0.35, 0, 0.15); this.noiseHit(0.35, 0.35, 'bandpass', 1200); this.tone(120, 0.3, 'sawtooth', 0.18, 60); break; // 잡음
      case 'combo': [0, 4, 7, 12].forEach((s, i) => this.tone(523 * Math.pow(2, s / 12), 0.12, 'square', 0.12, null, now + i * 0.06)); break; // 올라가는 음
      case 'deflect': this.tone(2400, 0.05, 'square', 0.1, 1800); this.noiseHit(0.04, 0.12, 'highpass', 5000); break;
      case 'rollback': this.tone(900, 0.5, 'sawtooth', 0.12, 220); this.tone(1200, 0.5, 'sine', 0.1, 300); break;
      case 'unlock': [0, 7, 12, 16, 19].forEach((s, i) => this.tone(440 * Math.pow(2, s / 12), 0.16, 'triangle', 0.16, null, now + i * 0.07)); break;
      case 'click': this.tone(660, 0.04, 'square', 0.08); break;
      case 'crash': this.thump(90, 22, 1.1, 0.8, 0, 0.5); this.noiseHit(0.9, 0.45, 'lowpass', 900); this.tone(220, 0.9, 'sawtooth', 0.25, 30); break;
      case 'clear': [0, 4, 7, 12, 16].forEach((s, i) => this.tone(523 * Math.pow(2, s / 12), 0.22, 'square', 0.12, null, now + i * 0.09)); break;
      case 'success': [0, 4, 7, 12, 7, 12, 16, 19, 24].forEach((s, i) => this.tone(392 * Math.pow(2, s / 12), 0.2, i % 2 ? 'triangle' : 'square', 0.13, null, now + i * 0.1)); break;
      case 'phase': this.thump(80, 25, 0.9, 0.7, 0, 0.35); this.tone(110, 0.6, 'sawtooth', 0.25, 55); this.noiseHit(0.5, 0.2, 'lowpass', 600); break;
      case 'overheat': this.noiseHit(1.2, 0.3, 'highpass', 3000); this.tone(900, 0.5, 'sawtooth', 0.12, 120); this.tone(1200, 0.08, 'square', 0.1, null, now + 0.02); break; // 치이익
      case 'cool': this.tone(1318, 0.1, 'triangle', 0.14); this.tone(1976, 0.18, 'triangle', 0.12, null, now + 0.08); break;
      case 'jam': this.tone(180, 0.04, 'square', 0.12, 90); this.noiseHit(0.03, 0.1, 'bandpass', 1200); break; // 딸깍(헛방)
      case 'rifle': this.thump(170, 60, 0.07, 0.26, 0, 0.06); if (this.sample('sfx_shot', 0.42)) break; this.noiseHit(0.018, 0.14, 'highpass', 5000); this.tone(1500, 0.045, 'square', 0.06, 600); this.tone(160, 0.05, 'sine', 0.14, 60); break; // 연사 한 발
      case 'snipe': this.thump(110, 30, 0.42, 0.7, 0, 0.32); this.tone(55, 0.6, 'sine', 0.22, 38, now + 0.02); if (this.sample('sfx_snipe', 1)) break; this.noiseHit(0.05, 0.35, 'highpass', 3000); this.tone(2200, 0.25, 'sawtooth', 0.12, 300); this.tone(110, 0.3, 'sine', 0.45, 35); break; // 저격
      case 'tick': this.tone(2600, 0.025, 'square', 0.035); break; // 맞힘
      case 'boom': this.thump(110, 28, 0.5, 0.75, 0, 0.45); this.noiseHit(0.55, 0.35, 'lowpass', 900, now + 0.01); this.noiseHit(0.12, 0.18, 'highpass', 2500); break; // 미사일 격추
      case 'aim': this.tone(660, 0.09, 'sawtooth', 0.06, 880); break; // 적이 조준
      case 'missile': this.tone(300, 0.6, 'sawtooth', 0.07, 900); this.noiseHit(0.5, 0.08, 'bandpass', 1600); break;
      case 'block': this.thump(130, 50, 0.14, 0.4, 0, 0.25); this.noiseHit(0.08, 0.3, 'lowpass', 900); this.tone(140, 0.1, 'square', 0.12, 70); break; // 엄폐물에 막힘
      case 'reload': this.tone(900, 0.03, 'square', 0.06); this.tone(1300, 0.04, 'square', 0.06, null, now + 0.07); break;
      case 'move': [0, 2, 4].forEach((s, i) => this.tone(330 * Math.pow(2, s / 12), 0.08, 'square', 0.07, null, now + i * 0.06)); break;
      case 'spawn': this.tone(200 + p * 40, 0.05, 'square', 0.05, 400); break;
    }
  },
};

// ---------- 음악: 단조 오케스트라풍 합성 ----------
// 타이틀: 느리고 웅장한 테마 / 스테이지: 비장한 행진 (고칠수록 악기가 쌓임) / 보스: 빠르고 긴박
const MUS = {
  on: false, step: 0, next: 0, timer: null, tempo: 100, layer: 0, mode: 'stage', crash: false,
  tempoMul: 1, pitchMul: 1, slow: false, keyRoot: 146.83, prog: [0, 5, 2, 6], theme: null,
  SCALE: [0, 2, 3, 5, 7, 8, 10], // 자연 단음계
  // 영웅 테마: [시작 16분음표 위치, 음계 도수, 길이] — 8마디
  THEME_A: [[0, 0, 6], [6, 4, 2], [8, 7, 8], [16, 5, 12], [28, 4, 4], [32, 2, 6], [38, 4, 2], [40, 2, 8], [48, 1, 8], [56, -1, 8],
    [64, 0, 4], [68, 4, 4], [72, 7, 8], [80, 8, 8], [88, 7, 4], [92, 5, 4], [96, 7, 12], [108, 9, 4], [112, 8, 8], [120, 6, 8]],
  THEME_B: [[0, 4, 4], [4, 4, 2], [6, 4, 2], [8, 7, 8], [16, 5, 4], [20, 4, 4], [24, 5, 8], [32, 4, 4], [36, 2, 4], [40, 4, 8], [48, 3, 8], [56, 1, 8],
    [64, 4, 4], [68, 4, 2], [70, 4, 2], [72, 9, 8], [80, 8, 4], [84, 7, 4], [88, 8, 8], [96, 7, 6], [102, 6, 2], [104, 4, 8], [112, 6, 8], [120, 7, 8]],
  _go() {
    this.crash = false; this.tempoMul = 1; this.pitchMul = 1; this.slow = false;
    this.step = 0; this.next = SND.ctx.currentTime + 0.08; this.on = true;
    SND.musG.gain.cancelScheduledValues(SND.ctx.currentTime);
    SND.apply();
    this.timer = setInterval(() => this.tick(), 25);
  },
  startTitle() {
    if (!SND.ctx) return;
    if (this.on && this.mode === 'title') return;
    this.stop();
    // 타이틀 곡 파일(assets/bgm_title.mp3)이 있으면 그 곡을 반복 재생, 아직 안 풀렸거나 없으면 코드로 연주
    const bgm = SND.bufs.bgm_title;
    if (bgm === 'loading') { this.mode = 'title'; this.on = true; return; } // 곡 파일을 푸는 중: 잠깐 조용히 기다렸다가 풀리면 바로 재생
    if (bgm) {
      this.mode = 'title'; this.on = true; this.crash = false;
      const t = SND.ctx.currentTime, src = SND.ctx.createBufferSource(), g = SND.ctx.createGain();
      src.buffer = bgm; src.loop = true; g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(1.0, t + 1.2);
      src.connect(g); g.connect(SND.musG); src.start(t);
      SND.musG.gain.cancelScheduledValues(t); SND.apply();
      this.fileSrc = src; this.fileG = g;
      return;
    }
    this.mode = 'title'; this.keyRoot = 146.83; this.tempo = 74; this.prog = [0, 5, 2, 6, 0, 5, 3, 4];
    this.theme = this.THEME_A; this.layer = 4;
    this._go();
  },
  start(stageIdx, seed) {
    if (!SND.ctx) return;
    this.stop();
    const roots = [146.83, 130.81, 164.81, 155.56, 138.59, 123.47]; // D, C, E, C#, B
    this.keyRoot = roots[stageIdx % roots.length];
    this.mode = STAGES[stageIdx] && STAGES[stageIdx].boss ? 'boss' : 'stage';
    this.tempo = this.mode === 'boss' ? 146 : 96 + stageIdx * 6;
    const progs = [[0, 5, 2, 6, 0, 5, 6, 0], [0, 3, 5, 4, 0, 3, 6, 4], [0, 5, 6, 0, 3, 5, 6, 4], [0, 6, 5, 4, 0, 6, 5, 6], [0, 0, 5, 6, 0, 0, 3, 4], [0, 4, 5, 3, 0, 4, 6, 5]];
    this.prog = progs[stageIdx % progs.length];
    this.theme = (seed + stageIdx) % 2 ? this.THEME_B : this.THEME_A;
    this.layer = 0;
    this._go();
  },
  stop() {
    this.on = false; if (this.timer) clearInterval(this.timer); this.timer = null;
    if (this.fileSrc) { // 타이틀 곡: 0.4초 동안 줄이며 끝냄
      const t = SND.ctx.currentTime, s = this.fileSrc, g = this.fileG; g.gain.cancelScheduledValues(t); g.gain.setValueAtTime(g.gain.value, t); g.gain.linearRampToValueAtTime(0, t + 0.4); try { s.stop(t + 0.45); } catch (e) { /* 이미 멈춤 */ }
      this.fileSrc = this.fileG = null;
    }
  },
  crashStop() { // 늘어지며 멈춤
    if (!this.on || !SND.ctx) return;
    this.crash = true;
    const t = SND.ctx.currentTime;
    SND.musG.gain.setTargetAtTime(0, t + 0.3, 0.45);
    setTimeout(() => { this.stop(); SND.apply(); }, 2200);
  },
  note(deg, oct) {
    const o = Math.floor(deg / 7), d = ((deg % 7) + 7) % 7;
    let semi = this.SCALE[d];
    if (d === 6 && this.lead) semi = 11; // 이끎음
    return this.keyRoot * Math.pow(2, (semi + 12 * (o + oct)) / 12) * this.pitchMul;
  },
  // 필터 거친 목소리 (현악·금관·합창 공용)
  voice(f, t, dur, { type = 'sawtooth', vol = 0.05, cut = 1400, atk = 0.02, rel = 0.15, det = 0, q = 0.7 } = {}) {
    const c = SND.ctx, o = c.createOscillator(), fl = c.createBiquadFilter(), g = c.createGain();
    o.type = type; o.frequency.setValueAtTime(f, t); if (det) o.detune.setValueAtTime(det, t);
    fl.type = 'lowpass'; fl.frequency.setValueAtTime(cut, t); fl.Q.value = q;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(vol, t + atk);
    g.gain.setValueAtTime(vol, t + Math.max(atk, dur - rel));
    g.gain.linearRampToValueAtTime(0.0001, t + dur);
    o.connect(fl); fl.connect(g); g.connect(SND.musG);
    o.start(t); o.stop(t + dur + 0.05);
  },
  timpani(t, vol = 0.6, f = 73) {
    SND.tone(f * this.pitchMul, 0.9, 'sine', vol, f * 0.62, t, SND.musG, 0.003);
    SND.noiseHit(0.25, vol * 0.35, 'lowpass', 380, t, SND.musG);
  },
  tick() {
    if (!this.on || !SND.ctx) return;
    while (this.next < SND.ctx.currentTime + 0.15) {
      this.playStep(this.step, this.next);
      const dt = 60 / this.tempo / 4 * this.tempoMul * (this.slow ? 1.7 : 1);
      if (this.crash) { this.tempoMul *= 1.09; this.pitchMul *= 0.965; }
      this.next += dt; this.step++;
    }
  },
  playStep(s, t) {
    const st = s % 16, bar = Math.floor(s / 16) % 8, chord = this.prog[bar];
    const sp = 60 / this.tempo / 4 * this.tempoMul * (this.slow ? 1.7 : 1); // 16분음표 길이(초)
    const barLen = sp * 16;
    const D = SND.musG, title = this.mode === 'title', boss = this.mode === 'boss';
    const L = this.layer;
    const fin = bar === 7; // 8마디째: 필인

    // ── 타악기 ──
    if (title) {
      if (st === 0) this.timpani(t, 0.7);
      if (st === 8 && bar % 2) this.timpani(t, 0.45, 98);
      if (fin && st >= 8 && st % 2 === 0) this.timpani(t, 0.25 + st * 0.02, 73); // 팀파니 롤
      if (st === 0 && bar % 4 === 0) SND.noiseHit(1.6, 0.12, 'highpass', 5000, t, D); // 심벌 스웰
    } else {
      // 행진 북: 쿵 · 딱 · 롤
      const kick = boss ? st % 4 === 0 : (st === 0 || st === 8 || st === 10);
      if (kick) SND.tone(120 * this.pitchMul, 0.2, 'sine', 0.55, 38, t, D, 0.002);
      if (st === 4 || st === 12) SND.noiseHit(0.14, 0.24, 'bandpass', 1700, t, D);
      if (L >= 1 && (st === 14 || st === 15)) SND.noiseHit(0.06, 0.1, 'bandpass', 2000, t, D); // 스네어 장식
      if (st % 2 === 1) SND.noiseHit(0.025, 0.05, 'highpass', 8000, t, D);
      if (st === 0) this.timpani(t, boss ? 0.5 : 0.38);
      if (fin && st >= 12) this.timpani(t, 0.3, [73, 82, 92, 110][st - 12]); // 탐 필인
    }
    // ── 베이스: 비장한 8분음표 오스티나토 ──
    if (title ? st % 8 === 0 : L >= 1 && st % 2 === 0) {
      const f = this.note(chord, -2);
      this.voice(f, t, title ? barLen * 0.5 : sp * 1.8, { vol: title ? 0.11 : 0.1, cut: 420, atk: 0.01, rel: 0.06 });
      if (!title && st % 4 === 0) this.voice(f * 2, t, sp * 1.6, { vol: 0.05, cut: 700, atk: 0.01, rel: 0.05 });
    }
    // ── 현악 패드 (한 마디 지속) ──
    if ((title || L >= 2) && st === 0) {
      for (const k of [0, 2, 4]) for (const dt of [-7, 7]) this.voice(this.note(chord + k, 0), t, barLen * 1.02, { vol: 0.022, cut: 1300, atk: title ? 0.45 : 0.12, rel: 0.3, det: dt });
    }
    // ── 금관 스타브 (스테이지: 화음 층에서 엇박 강세) ──
    if (!title && L >= 2 && (st === 0 || st === 6 || st === 10)) {
      for (const k of [0, 4]) this.voice(this.note(chord + k, 0), t, sp * 1.5, { type: 'square', vol: 0.03, cut: 1800, atk: 0.01, rel: 0.08 });
    }
    // ── 영웅 테마 (금관 멜로디) ──
    const melOn = title ? s >= 64 : L >= 3;
    if (melOn && this.theme) {
      const pos = s % 128;
      for (const [p, deg, len] of this.theme) if (p === pos) {
        this.lead = true;
        const f = this.note(deg, 1); this.lead = false;
        const d = sp * len * 0.95;
        this.voice(f, t, d, { vol: 0.07, cut: 2200, atk: 0.04, rel: 0.12 });
        this.voice(f / 2, t, d, { type: 'square', vol: 0.03, cut: 1200, atk: 0.04, rel: 0.12 });
      }
    }
    // ── 합창 (높은 사인 패드) ──
    if ((title ? s >= 32 : L >= 4) && st === 0) {
      for (const k of [0, 2, 4]) this.voice(this.note(chord + k, 2), t, barLen * 1.02, { type: 'sine', vol: 0.018, cut: 4000, atk: 0.6, rel: 0.4 });
    }
    // ── 전체 합주 (현악 아르페지오) ──
    if (!title && L >= 4 && st % 2 === 1) this.voice(this.note(chord + [0, 2, 4, 7][(st >> 1) % 4], 1), t, sp * 0.9, { type: 'triangle', vol: 0.04, cut: 3000, atk: 0.005, rel: 0.05 });
  },
};
