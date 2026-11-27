// ---------- 스테이지 월드: 회색 뼈대 → 색이 돌아오는 세상 ----------
const GRAY_FILL = new THREE.Color(0x1a1d19), GRAY_LINE = new THREE.Color(0x6B6F68), BG = new THREE.Color(0x0E100D);
const GEO = {};
const EDGE = new Map();
function edgesOf(geo) { let e = EDGE.get(geo); if (!e) { e = new THREE.EdgesGeometry(geo); EDGE.set(geo, e); } return e; }
function initGeo() {
  GEO.box = new THREE.BoxGeometry(1, 1, 1);
  GEO.pyr = new THREE.ConeGeometry(1, 1, 4, 1); GEO.pyr.rotateY(Math.PI / 4);
  GEO.cyl = new THREE.CylinderGeometry(0.5, 0.5, 1, 8, 1);
  GEO.ico = new THREE.IcosahedronGeometry(0.6, 0);
  GEO.plane = new THREE.PlaneGeometry(1, 1);
}
const _c = new THREE.Color();

const World = {
  scene: null, group: null, decor: [], curve: null, len: 1, def: null, ground: null, grid: null,
  hemi: null, dir: null, sky: new THREE.Color(), theme: new THREE.Color(), ratio: 0, shown: 0, samples: [],
  init(scene) {
    this.scene = scene;
    this.hemi = new THREE.HemisphereLight(0xffffff, 0x404040, 0.9); scene.add(this.hemi);
    this.dir = new THREE.DirectionalLight(0xffffff, 0.7); this.dir.position.set(6, 12, 4); scene.add(this.dir);
    scene.fog = new THREE.Fog(BG, 20, 110);
    scene.background = BG.clone();
  },
  clear() {
    if (this.group) {
      this.scene.remove(this.group);
      this.group.traverse((o) => { if (o.material) { (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => m.dispose()); } });
    }
    this.group = new THREE.Group(); this.scene.add(this.group);
    this.decor = []; this.ratio = 0; this.shown = 0;
  },
  piece(geo, color, opt = {}) {
    const mat = opt.basic ? new THREE.MeshBasicMaterial({ color: GRAY_FILL.clone() }) : new THREE.MeshLambertMaterial({ color: GRAY_FILL.clone(), map: opt.map || TEX.pix });
    const mesh = new THREE.Mesh(geo, mat);
    let lmat = null;
    if (!opt.noLine) { lmat = new THREE.LineBasicMaterial({ color: GRAY_LINE.clone() }); mesh.add(new THREE.LineSegments(edgesOf(geo), lmat)); }
    return { mesh, mat, lmat, col: new THREE.Color(color), grayFill: opt.grayFill ? new THREE.Color(opt.grayFill) : GRAY_FILL, lineCol: new THREE.Color(color).lerp(new THREE.Color(0xffffff), 0.35) };
  },
  addDecor(group, pieces, pos, apply = null, data = {}) {
    group.position.copy(pos);
    this.group.add(group);
    const d = { g: group, pieces, f: 0, target: 0, p: pos.clone(), apply, data };
    this.decor.push(d); this.paint(d);
    return d;
  },
  paint(d) {
    const f = smooth(d.f);
    for (const p of d.pieces) {
      p.mat.color.copy(p.grayFill).lerp(p.col, f);
      if (p.lmat) p.lmat.color.copy(GRAY_LINE).lerp(p.lineCol, f);
    }
    if (d.apply) d.apply(d, d.f);
  },
  // 고친 버그 근처 장식에 색 채우기
  colorizeNear(pos, k = 4) {
    const cand = this.decor.filter((d) => d.target < 1).map((d) => [d, d.p.distanceToSquared(pos)]).sort((a, b) => a[1] - b[1]);
    for (let i = 0; i < Math.min(k, cand.length); i++) if (cand[i][1] < 60 * 60) cand[i][0].target = 1;
  },
  fillAll() { for (const d of this.decor) d.target = 1; },
  update(dt, ratio) {
    this.ratio = ratio;
    this.shown += (ratio - this.shown) * Math.min(1, dt * 2.5);
    for (const d of this.decor) if (d.f < d.target) { d.f = Math.min(d.target, d.f + dt * 1.4); this.paint(d); }
    const r = this.shown;
    this.scene.background.copy(BG).lerp(this.sky, r * 0.85);
    this.scene.fog.color.copy(this.scene.background);
    if (this.ground) this.ground.material.color.copy(GRAY_FILL).lerp(_c.copy(this.theme).multiplyScalar(0.28), r);
    if (this.grid) this.grid.material.color.copy(GRAY_LINE).lerp(_c.copy(this.theme).multiplyScalar(0.75), r);
    const fg = this.def && this.def.fog;
    if (fg) { this.scene.fog.near = lerp(fg[0], fg[2], r); this.scene.fog.far = lerp(fg[1], fg[3], r); }
    const lt = this.def && this.def.light || [0.9, 0.9];
    this.hemi.intensity = lerp(lt[0], lt[1], r); this.dir.intensity = lerp(lt[0], lt[1], r) * 0.75;
  },
  build(def, seed) {
    this.clear();
    this.def = def;
    this.theme.set(def.theme); this.sky.set(def.sky);
    const r = mulberry32(seed + def.id * 977);
    this[def.key](r, def);
    if (this.curve) {
      this.len = this.curve.getLength();
      this.samples = this.curve.getSpacedPoints(200);
    }
    this.update(0, 0);
  },
  groundGrid(size, cx, cz, y = 0, div = 60) {
    const g = new THREE.Mesh(new THREE.PlaneGeometry(size, size), new THREE.MeshLambertMaterial({ color: GRAY_FILL.clone() }));
    g.rotation.x = -Math.PI / 2; g.position.set(cx, y - 0.01, cz); this.group.add(g); this.ground = g;
    const grid = new THREE.GridHelper(size, div, 0x6B6F68, 0x6B6F68);
    grid.material = new THREE.LineBasicMaterial({ color: GRAY_LINE.clone() });
    grid.position.set(cx, y, cz); this.group.add(grid); this.grid = grid;
  },
  makeCurve(pts) { this.curve = new THREE.CatmullRomCurve3(pts, false, 'catmullrom', 0.5); },
  tooClose(p, min) { for (const s of this.samples) { const dx = s.x - p.x, dz = s.z - p.z; if (dx * dx + dz * dz < min * min) return true; } return false; },
  along(r, count, latMin, latMax, fn) {
    this.samples = this.curve.getSpacedPoints(200);
    const T = new THREE.Vector3(), N = new THREE.Vector3();
    for (let i = 0; i < count; i++) {
      const s = clamp((i + r()) / count, 0, 1);
      const P = this.curve.getPointAt(s); this.curve.getTangentAt(s, T);
      N.set(-T.z, 0, T.x).normalize();
      const side = r() < 0.5 ? -1 : 1;
      const pos = P.clone().addScaledVector(N, side * lerp(latMin, latMax, r()));
      if (this.tooClose(pos, latMin * 0.85)) continue;
      fn(pos, s, side, N.clone(), T.clone());
    }
  },

  // 1. 텍스처 없는 숲
  forest(r) {
    const pts = []; for (let i = 0; i <= 12; i++) pts.push(new THREE.Vector3(Math.sin(i * 0.7) * 10 + (r() - 0.5) * 6, 0, -i * 26));
    this.makeCurve(pts);
    const mid = this.curve.getPointAt(0.5);
    this.groundGrid(520, mid.x, mid.z, 0, 80);
    const greens = [0x5BD66B, 0x7CE35A, 0x3FBF6A, 0x9BE86A];
    this.along(r, 95, 6.5, 22, (pos) => {
      const g = new THREE.Group(), h = 2 + r() * 2.5, s = 1 + r() * 0.8;
      const trunk = this.piece(GEO.box, 0x9a6a3a); trunk.mesh.scale.set(0.6, h, 0.6); trunk.mesh.position.y = h / 2;
      const c1 = this.piece(GEO.pyr, pick(greens, r)); c1.mesh.scale.set(2.2 * s, 3 * s, 2.2 * s); c1.mesh.position.y = h + 1.3 * s;
      const c2 = this.piece(GEO.pyr, pick(greens, r)); c2.mesh.scale.set(1.6 * s, 2.4 * s, 1.6 * s); c2.mesh.position.y = h + 2.9 * s;
      g.add(trunk.mesh, c1.mesh, c2.mesh); g.rotation.y = r() * 3;
      this.addDecor(g, [trunk, c1, c2], pos);
    });
    this.along(r, 45, 3, 14, (pos) => {
      const g = new THREE.Group(), b = this.piece(GEO.box, r() < 0.5 ? 0x4fbf5a : 0xF5D76E);
      const s = 0.6 + r() * 0.8; b.mesh.scale.set(s * 1.4, s, s * 1.2); b.mesh.position.y = s / 2; g.add(b.mesh);
      this.addDecor(g, [b], pos);
    });
  },
  // 2. 복붙 도시
  city(r) {
    const pts = []; for (let i = 0; i <= 12; i++) pts.push(new THREE.Vector3(Math.sin(i * 0.5) * 14, 0, -i * 27));
    this.makeCurve(pts);
    const mid = this.curve.getPointAt(0.5);
    this.groundGrid(520, mid.x, mid.z, 0, 52);
    const neon = [0xFF9E3D, 0xFF5FA2, 0x3DE0D0, 0xFFD34D, 0x9D7CFF, 0x6BD66B];
    const bcol = [0x7a6a8a, 0x8a6a5a, 0x5a6a8a, 0x8a8a6a, 0x6a5a7a];
    this.along(r, 88, 9, 13, (pos, s, side, N) => {
      const g = new THREE.Group();
      const H = 5 + r() * 20, W = 4 + r() * 3;
      const b = this.piece(GEO.box, pick(bcol, r), { map: TEX.win }); b.mesh.scale.set(6, 10, 6); b.mesh.position.y = 5;
      const roof = this.piece(GEO.box, 0x5a5a6a); roof.mesh.scale.set(2, 1, 2); roof.mesh.position.y = 10.5;
      const sign = this.piece(GEO.box, pick(neon, r), { basic: true, noLine: true }); sign.mesh.scale.set(0.001, 0.001, 0.001);
      g.add(b.mesh, roof.mesh, sign.mesh);
      g.rotation.y = Math.atan2(-N.x * side, -N.z * side);
      const signH = 2 + r() * Math.min(6, H - 3), signW = 2 + r() * 2.5;
      this.addDecor(g, [b, roof, sign], pos, (d, f) => {
        const e = smooth(f);
        const h = lerp(10, H, e), w = lerp(6, W, e);
        b.mesh.scale.set(w, h, lerp(6, W * 0.9 + 1, e)); b.mesh.position.y = h / 2;
        roof.mesh.position.y = h + 0.5; roof.mesh.scale.set(lerp(2, 1 + (H % 3), e), 1, 2);
        const sv = Math.max(0.001, e);
        sign.mesh.scale.set(signW * sv, 1.1 * sv, 0.3); sign.mesh.position.set(0, signH, w * 0.5 + 0.2);
      });
    });
    // 가로등
    this.along(r, 30, 5, 6, (pos) => {
      const g = new THREE.Group();
      const p = this.piece(GEO.box, 0x8a8a8a); p.mesh.scale.set(0.25, 4, 0.25); p.mesh.position.y = 2;
      const l = this.piece(GEO.box, 0xFFD34D, { basic: true }); l.mesh.scale.set(0.7, 0.35, 0.7); l.mesh.position.y = 4.1;
      g.add(p.mesh, l.mesh); this.addDecor(g, [p, l], pos);
    });
  },
  // 3. 렌더링 지하철
  subway(r) {
    const pts = []; for (let i = 0; i <= 12; i++) pts.push(new THREE.Vector3(Math.sin(i * 0.45) * 12 + (r() - 0.5) * 4, 0, -i * 27));
    this.makeCurve(pts);
    const mid = this.curve.getPointAt(0.5);
    this.groundGrid(520, mid.x, mid.z, 0, 90);
    const n = Math.floor(this.curve.getLength() / 6);
    const T = new THREE.Vector3();
    const tile = [0x3DE0D0, 0x2aa8c8, 0x5fd0e8];
    for (let i = 1; i < n; i++) {
      const s = i / n, P = this.curve.getPointAt(s); this.curve.getTangentAt(s, T);
      const g = new THREE.Group();
      const L = this.piece(GEO.box, pick(tile, r)); L.mesh.scale.set(0.7, 5.5, 0.7); L.mesh.position.set(-4, 2.75, 0);
      const R = this.piece(GEO.box, pick(tile, r)); R.mesh.scale.set(0.7, 5.5, 0.7); R.mesh.position.set(4, 2.75, 0);
      const B = this.piece(GEO.box, 0x2a6a7a); B.mesh.scale.set(8.7, 0.6, 0.7); B.mesh.position.set(0, 5.8, 0);
      const pieces = [L, R, B];
      g.add(L.mesh, R.mesh, B.mesh);
      let lamp = null, glow = null;
      if (i % 2 === 0) {
        lamp = this.piece(GEO.box, 0xfff6c0, { basic: true, noLine: true, grayFill: 0x111311 }); lamp.mesh.scale.set(1.6, 0.25, 0.5); lamp.mesh.position.set(0, 5.4, 0);
        glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: TEX.glow, color: 0xfff1b0, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending }));
        glow.scale.set(6, 3, 1); glow.position.set(0, 5, 0);
        g.add(lamp.mesh, glow); pieces.push(lamp);
      }
      if (r() < 0.35) { // 벽 광고판
        const ad = this.piece(GEO.box, pick([0xFF9E3D, 0xFF5FA2, 0xFFD34D, 0x9D7CFF], r), { basic: true }); ad.mesh.scale.set(0.15, 1.6, 2.4);
        ad.mesh.position.set(r() < 0.5 ? -3.6 : 3.6, 2.4, 2.5); g.add(ad.mesh); pieces.push(ad);
      }
      g.lookAt(P.clone().add(T)); // 프레임 방향
      g.rotation.x = 0; g.rotation.z = 0;
      g.rotation.y = Math.atan2(T.x, T.z);
      this.addDecor(g, pieces, P, glow ? (d, f) => { glow.material.opacity = smooth(f) * 0.85; } : null);
    }
  },
  // 4. 테스트 서버실 (에이다 합류)
  server(r) {
    const pts = []; for (let i = 0; i <= 12; i++) pts.push(new THREE.Vector3(Math.sin(i * 0.5) * 10 + (r() - 0.5) * 4, 0, -i * 27));
    this.makeCurve(pts);
    const mid = this.curve.getPointAt(0.5);
    this.groundGrid(520, mid.x, mid.z, 0, 80);
    const n = Math.floor(this.curve.getLength() / 7);
    const T = new THREE.Vector3();
    const led = [0xFF5FA2, 0xC6F432, 0x6fe7ff, 0xFFD34D];
    for (let i = 1; i < n; i++) {
      const s = i / n, P = this.curve.getPointAt(s); this.curve.getTangentAt(s, T);
      const g = new THREE.Group(), pieces = [], lights = [];
      for (const side of [-1, 1]) {
        const off = side * (5.2 + r() * 1.2), h = 3.2 + r() * 2.2;
        const rack = this.piece(GEO.box, 0x2c2f3a); rack.mesh.scale.set(1.4, h, 2.6); rack.mesh.position.set(off, h / 2, 0);
        g.add(rack.mesh); pieces.push(rack);
        for (let k = 0; k < 4; k++) { // 깜빡이는 LED 줄
          const l = this.piece(GEO.box, pick(led, r), { basic: true, noLine: true, grayFill: 0x1a1c18 });
          l.mesh.scale.set(0.08, 0.12, 2.0); l.mesh.position.set(off - side * 0.72, 0.6 + k * (h - 0.9) / 4, 0);
          g.add(l.mesh); pieces.push(l); lights.push(l.mesh);
        }
      }
      if (i % 3 === 0) { // 머리 위 케이블 다리
        const B = this.piece(GEO.box, 0x4a3046); B.mesh.scale.set(11, 0.35, 0.8); B.mesh.position.set(0, 6.4, 0); g.add(B.mesh); pieces.push(B);
      }
      g.position.copy(P); g.rotation.y = Math.atan2(T.x, T.z);
      const ph = r() * 6;
      this.addDecor(g, pieces, P, (d, f) => { lights.forEach((m, k) => { m.visible = f < 0.05 ? false : Math.sin(Game.time * 3 + ph + k) > -0.6; }); });
    }
  },
  // 5. 물리 고장 구역
  physics(r) {
    const pts = []; for (let i = 0; i <= 12; i++) pts.push(new THREE.Vector3(Math.sin(i * 0.6) * 11 + (r() - 0.5) * 5, 0, -i * 28));
    this.makeCurve(pts);
    const mid = this.curve.getPointAt(0.5);
    this.groundGrid(520, mid.x, mid.z, 0, 70);
    const ceil = new THREE.GridHelper(520, 70); ceil.material = new THREE.LineBasicMaterial({ color: 0x3a3d38 }); ceil.position.set(mid.x, 12, mid.z); this.group.add(ceil);
    const cols = [0xB07CFF, 0x8a5cff, 0xd09cff, 0xFF9E3D, 0x3DE0D0, 0xFFD34D];
    this.along(r, 110, 3, 15, (pos) => {
      const g = new THREE.Group();
      const kind = Math.floor(r() * 4);
      let p, half;
      if (kind === 0) { p = this.piece(GEO.box, pick(cols, r)); const s = 0.8 + r() * 1.4; p.mesh.scale.set(s, s, s); half = s / 2; }
      else if (kind === 1) { p = this.piece(GEO.cyl, pick(cols, r)); const s = 0.8 + r(); p.mesh.scale.set(s, s * 1.6, s); half = s * 0.8; }
      else if (kind === 2) { p = this.piece(GEO.ico, pick(cols, r)); const s = 0.8 + r() * 1.2; p.mesh.scale.set(s, s, s); half = s * 0.55; }
      else { p = this.piece(GEO.box, pick(cols, r)); p.mesh.scale.set(2.4, 0.3, 1.2); half = 0.15; }
      g.add(p.mesh);
      const top = 12 - half, rs = Math.PI + (r() - 0.5) * 0.8, ry = r() * 6;
      const delay = r() * 0.25;
      this.addDecor(g, [p], pos, (d, f) => {
        const t = clamp((f - delay) / (1 - delay), 0, 1);
        g.position.y = lerp(top, half, bounceOut(t));
        g.rotation.set(lerp(rs, 0, easeOut(t)), ry, lerp(0.4, 0, t));
      });
    });
  },
  // ---- 2장 ----
  // 7. 지원 종료 보관소: 쌓인 브라운관·베이지 본체·플로피 탑
  archive(r) {
    const pts = []; for (let i = 0; i <= 12; i++) pts.push(new THREE.Vector3(Math.sin(i * 0.55) * 10 + (r() - 0.5) * 4, 0, -i * 27));
    this.makeCurve(pts);
    const mid = this.curve.getPointAt(0.5); this.groundGrid(520, mid.x, mid.z, 0, 70);
    const beige = [0xD8CBB0, 0xC9B990, 0xBFAF8A], amber = 0xFFB347;
    this.along(r, 90, 4, 14, (pos) => {
      const g = new THREE.Group(), pieces = [];
      const tall = r() < 0.3, n = tall ? 4 + Math.floor(r() * 4) : 1 + Math.floor(r() * 3);
      for (let k = 0; k < n; k++) {
        const s = tall ? 0.9 : 1.2 + r() * 0.5;
        const b = this.piece(GEO.box, pick(beige, r)); b.mesh.scale.set(s * 1.3, s, s); b.mesh.position.y = s / 2 + k * s; g.add(b.mesh); pieces.push(b);
        if (!tall) { const sc = this.piece(GEO.box, r() < 0.6 ? amber : 0x3a3a34, { basic: true, noLine: true }); sc.mesh.scale.set(s * 0.9, s * 0.6, 0.05); sc.mesh.position.set(0, s / 2 + k * s, s / 2 + 0.03); g.add(sc.mesh); pieces.push(sc); }
      }
      g.rotation.y = r() * 6;
      this.addDecor(g, pieces, pos);
    });
  },
  // 8. 브랜치 분기점: 보라/청록 두 갈래 기둥과 갈라진 아치
  fork(r) {
    const pts = []; for (let i = 0; i <= 12; i++) pts.push(new THREE.Vector3(Math.sin(i * 0.4) * 13 + (r() - 0.5) * 3, 0, -i * 28));
    this.makeCurve(pts);
    const mid = this.curve.getPointAt(0.5); this.groundGrid(520, mid.x, mid.z, 0, 70);
    const n = Math.floor(this.curve.getLength() / 8), T = new THREE.Vector3();
    for (let i = 1; i < n; i++) {
      const s = i / n, P = this.curve.getPointAt(s); this.curve.getTangentAt(s, T);
      const g = new THREE.Group(), pieces = [];
      for (const side of [-1, 1]) {
        const h = 4 + r() * 3, p = this.piece(GEO.box, side < 0 ? 0xB07CFF : 0x3DE0D0); p.mesh.scale.set(1, h, 1); p.mesh.position.set(side * 6, h / 2, 0); g.add(p.mesh); pieces.push(p);
        const tip = this.piece(GEO.ico, side < 0 ? 0xd9b8ff : 0x9ff5ea, { basic: true }); tip.mesh.scale.setScalar(0.7); tip.mesh.position.set(side * 6, h + 0.6, 0); g.add(tip.mesh); pieces.push(tip);
      }
      if (i % 3 === 0) { // 갈라진 아치: 가운데서 두 갈래
        for (const side of [-1, 1]) { const a = this.piece(GEO.box, side < 0 ? 0x8a5cff : 0x2aa8a0); a.mesh.scale.set(6.4, 0.4, 0.6); a.mesh.position.set(side * 3, 7.2 + side * 0.4, 0); a.mesh.rotation.z = side * 0.18; g.add(a.mesh); pieces.push(a); }
      }
      g.position.copy(P); g.rotation.y = Math.atan2(T.x, T.z);
      this.addDecor(g, pieces, P);
    }
  },
  // 9. 운영 서버 — 금요일 18:00: 검은 서버 랙 + 빨간 경보등
  prod(r) {
    const pts = []; for (let i = 0; i <= 12; i++) pts.push(new THREE.Vector3(Math.sin(i * 0.5) * 9 + (r() - 0.5) * 4, 0, -i * 27));
    this.makeCurve(pts);
    const mid = this.curve.getPointAt(0.5); this.groundGrid(520, mid.x, mid.z, 0, 80);
    const n = Math.floor(this.curve.getLength() / 7), T = new THREE.Vector3();
    for (let i = 1; i < n; i++) {
      const s = i / n, P = this.curve.getPointAt(s); this.curve.getTangentAt(s, T);
      const g = new THREE.Group(), pieces = [], alarms = [];
      for (const side of [-1, 1]) {
        const off = side * (5.4 + r()), h = 3.4 + r() * 2;
        const rack = this.piece(GEO.box, 0x1a1c22); rack.mesh.scale.set(1.4, h, 2.6); rack.mesh.position.set(off, h / 2, 0); g.add(rack.mesh); pieces.push(rack);
        const al = this.piece(GEO.box, 0xFF4D5E, { basic: true, noLine: true, grayFill: 0x2a1416 }); al.mesh.scale.set(0.5, 0.35, 0.5); al.mesh.position.set(off, h + 0.2, 0); g.add(al.mesh); pieces.push(al); alarms.push(al.mesh);
      }
      if (i % 4 === 0) { const note = this.piece(GEO.box, 0xFFD34D, { basic: true }); note.mesh.scale.set(0.5, 0.5, 0.05); note.mesh.position.set(r() < 0.5 ? -4.6 : 4.6, 2 + r() * 2, 1.4); g.add(note.mesh); pieces.push(note); }
      g.position.copy(P); g.rotation.y = Math.atan2(T.x, T.z);
      const ph = r() * 6;
      this.addDecor(g, pieces, P, (d, f) => { alarms.forEach((m) => { m.visible = Math.sin(Game.time * 6 + ph) > -0.2; }); });
    }
  },
  // 10. 최종 보스 아레나: 거대한 달력 종이와 시계 기둥
  deadline(r) {
    this.curve = null;
    this.groundGrid(200, 0, 0, 0, 50);
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2, R = 36 + r() * 6;
      const g = new THREE.Group(), h = 7 + r() * 10;
      const p = this.piece(GEO.box, i % 2 ? 0xE8DCC0 : 0xFF4D5E); p.mesh.scale.set(4, h, 0.4); p.mesh.position.y = h / 2;
      const c = this.piece(GEO.cyl, 0xffffff); c.mesh.scale.set(1.4, 0.3, 1.4); c.mesh.rotation.x = Math.PI / 2; c.mesh.position.set(0, h + 1.6, 0);
      g.add(p.mesh, c.mesh); g.rotation.y = -a + Math.PI / 2;
      this.addDecor(g, [p, c], new THREE.Vector3(Math.cos(a) * R, 0, Math.sin(a) * R), (d, f) => { c.mesh.rotation.z = Game.time * (i % 2 ? 1 : -1); });
    }
  },
  // 6. 중간 보스 아레나
  boss(r) {
    this.curve = null;
    this.groundGrid(200, 0, 0, 0, 50);
    const cols = [0xC6F432, 0x8CFF7A, 0x5BD66B];
    for (let i = 0; i < 18; i++) {
      const a = (i / 18) * Math.PI * 2, R = 36 + r() * 6;
      const g = new THREE.Group(), h = 6 + r() * 12;
      const p = this.piece(GEO.box, pick(cols, r)); p.mesh.scale.set(2, h, 2); p.mesh.position.y = h / 2;
      const c = this.piece(GEO.box, 0xffffff); c.mesh.scale.set(1.2, 1.2, 1.2); c.mesh.position.y = h + 2;
      g.add(p.mesh, c.mesh);
      const base = h + 2;
      this.addDecor(g, [p, c], new THREE.Vector3(Math.cos(a) * R, 0, Math.sin(a) * R), (d, f) => { c.mesh.rotation.y = f * 3; c.mesh.position.y = base + smooth(f) * 2; });
    }
  },
};
