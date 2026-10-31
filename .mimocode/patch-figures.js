/* 题目配图：内联 SVG，按题目数字现算 */
const fs = require('fs');
const FILE = 'C:\\Users\\Administrator\\Desktop\\数学思维闯关\\数学思维闯关.html';
let s = fs.readFileSync(FILE, 'utf8');

const MARK = '/* ===== 题目配图：内联 SVG 现算现画 ===== */';
if (s.indexOf(MARK) >= 0) { console.log('已打过，跳过'); process.exit(0); }

function once(n, label) {
  const c = s.split(n).length - 1;
  if (c !== 1) throw new Error('锚点「' + label + '」出现 ' + c + ' 次');
  return s.indexOf(n);
}

/* ---------- 1. CSS ---------- */
const cssAnchor = `.qtext b{color:#5B3FD9;font-weight:800;`;
once(cssAnchor, 'qtext b');
s = s.replace(cssAnchor, `/* 题目配图：SVG 现算，随题号走，不引外链、不占额外请求 */
.qfig{display:block;margin:2px auto 14px;width:100%;max-width:300px;height:auto;
  overflow:visible;}
html[data-perf="low"] .qfig{max-width:250px;}
.qfig text{font-family:-apple-system,"PingFang SC","Microsoft YaHei",sans-serif;}
` + cssAnchor);
console.log('OK  CSS');

/* ---------- 2. 画图库 ---------- */
const LIB = `${MARK}
/* 为什么不放位图：题目里的数字/字母必须和题干完全一致，位图一旦画错就是错的；
   SVG 按同一组数字现算，形状也和"多少度"吻合（钝角看上去就是钝角）。
   ⚠️ 坐标一律先按数学坐标算，最后一步翻 y（SVG 的 y 朝下）。 */
const FIG = (function () {
  const INK = '#3a3355', GIVEN = '#2F6FD0', ASK = '#E07B2A', EDGE = '#6B5FA8', MARK = '#B9AEDD';
  const FONT = 'font-weight:800';

  /* 由三个角反推顶点位置：远边 = 对角的正弦，B 在左下、C 在右下 */
  function triPts(A, B, C) {
    const R = Math.PI / 180;
    const a = Math.sin(A * R);      /* BC */
    const c = Math.sin(C * R);      /* AB */
    return {
      A: { x: c * Math.cos(B * R), y: c * Math.sin(B * R) },
      B: { x: 0, y: 0 },
      C: { x: a, y: 0 }
    };
  }
  /* 把数学坐标装进 w×h 的画布 */
  function mapper(pts, w, h, pad) {
    const ks = Object.keys(pts);
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    ks.forEach(function (k) {
      const p = pts[k];
      minX = Math.min(minX, p.x); maxX = Math.max(maxX, p.x);
      minY = Math.min(minY, p.y); maxY = Math.max(maxY, p.y);
    });
    const bw = Math.max(1e-6, maxX - minX), bh = Math.max(1e-6, maxY - minY);
    const sc = Math.min((w - 2 * pad) / bw, (h - 2 * pad) / bh);
    const ox = (w - bw * sc) / 2 - minX * sc;
    const oy = (h - bh * sc) / 2 + maxY * sc;
    return function (p) { return { x: ox + p.x * sc, y: oy - p.y * sc }; };
  }
  /* 顶点处的角弧 + 标注位置 */
  function angleAt(V, P1, P2, r) {
    const a1 = Math.atan2(P1.y - V.y, P1.x - V.x);
    const a2 = Math.atan2(P2.y - V.y, P2.x - V.x);
    let d = a2 - a1;
    while (d <= -Math.PI) d += 2 * Math.PI;
    while (d > Math.PI) d -= 2 * Math.PI;
    const s1 = { x: V.x + r * Math.cos(a1), y: V.y + r * Math.sin(a1) };
    const s2 = { x: V.x + r * Math.cos(a1 + d), y: V.y + r * Math.sin(a1 + d) };
    const path = 'M' + s1.x.toFixed(1) + ' ' + s1.y.toFixed(1) +
      'A' + r + ' ' + r + ' 0 0 ' + (d > 0 ? 1 : 0) + ' ' + s2.x.toFixed(1) + ' ' + s2.y.toFixed(1);
    const mid = a1 + d / 2, rr = r + 14;
    return { path: path, x: V.x + rr * Math.cos(mid), y: V.y + rr * Math.sin(mid) + 4 };
  }
  const ln = (p, q) => 'M' + p.x.toFixed(1) + ' ' + p.y.toFixed(1) +
    'L' + q.x.toFixed(1) + ' ' + q.y.toFixed(1);
  const txt = (x, y, t, color, size) =>
    '<text x="' + x.toFixed(1) + '" y="' + y.toFixed(1) + '" text-anchor="middle" ' +
    'style="font-size:' + (size || 12) + 'px;' + FONT + '" fill="' + color + '">' + t + '</text>';

  function svg(inner, w, h) {
    return '<svg class="qfig" viewBox="0 0 ' + w + ' ' + h + '" role="img" ' +
      'aria-label="题目配图" xmlns="http://www.w3.org/2000/svg">' + inner + '</svg>';
  }

  return {
    /* 普通三角形：给两个角，求第三个 */
    triAngle: function (A, B) {
      const W = 260, H = 176;
      const C = 180 - A - B;
      if (!(C > 0)) return '';
      const M = mapper(triPts(A, B, C), W, H, 34);
      const A1 = M(triPts(A, B, C).A), B1 = M(triPts(A, B, C).B), C1 = M(triPts(A, B, C).C);
      let o = '<path d="' + ln(A1, B1) + ln(B1, C1) + ln(C1, A1) + '" fill="none" ' +
        'stroke="' + EDGE + '" stroke-width="1.8" stroke-linejoin="round"/>';
      const g1 = angleAt(A1, B1, C1, 16), g2 = angleAt(B1, A1, C1, 16), g3 = angleAt(C1, A1, B1, 16);
      o += '<path d="' + g1.path + '" fill="none" stroke="' + GIVEN + '" stroke-width="1.4"/>';
      o += '<path d="' + g2.path + '" fill="none" stroke="' + GIVEN + '" stroke-width="1.4"/>';
      o += '<path d="' + g3.path + '" fill="none" stroke="' + ASK + '" stroke-width="1.4" stroke-dasharray="3 2"/>';
      o += txt(g1.x, g1.y, A + '°', GIVEN);
      o += txt(g2.x, g2.y, B + '°', GIVEN);
      o += txt(g3.x, g3.y, '?', ASK, 15);
      return svg(o, W, H);
    },

    /* 外角：BC 延长到 D，问 ∠ACD */
    triExterior: function (A, B) {
      const W = 268, H = 176;
      const C = 180 - A - B;
      if (!(C > 0)) return '';
      const raw = triPts(A, B, C);
      const P = { A: raw.A, B: raw.B, C: raw.C };
      /* BC 方向再延长 55%，得到 D */
      P.D = { x: raw.C.x + (raw.C.x - raw.B.x) * 0.62, y: 0 };
      const M = mapper(P, W, H, 32);
      const A1 = M(P.A), B1 = M(P.B), C1 = M(P.C), D1 = M(P.D);
      let o = '<path d="' + ln(A1, B1) + ln(B1, D1) + ln(D1, A1) + '" fill="none" ' +
        'stroke="' + EDGE + '" stroke-width="1.8" stroke-linejoin="round"/>';
      o += '<path d="' + ln(C1, A1) + '" fill="none" stroke="' + EDGE + '" stroke-width="1.8"/>';
      const gA = angleAt(A1, B1, C1, 15), gB = angleAt(B1, A1, C1, 15);
      const gX = angleAt(C1, D1, A1, 15);
      o += '<path d="' + gA.path + '" fill="none" stroke="' + GIVEN + '" stroke-width="1.4"/>';
      o += '<path d="' + gB.path + '" fill="none" stroke="' + GIVEN + '" stroke-width="1.4"/>';
      o += '<path d="' + gX.path + '" fill="none" stroke="' + ASK + '" stroke-width="1.4" stroke-dasharray="3 2"/>';
      o += txt(gA.x, gA.y, A + '°', GIVEN);
      o += txt(gB.x, gB.y, B + '°', GIVEN);
      o += txt(gX.x + 4, gX.y, '?', ASK, 15);
      o += txt(A1.x, A1.y - 12, 'A', INK, 11);
      o += txt(B1.x - 11, B1.y + 14, 'B', INK, 11);
      o += txt(C1.x, C1.y + 15, 'C', INK, 11);
      o += txt(D1.x + 8, D1.y + 15, 'D', INK, 11);
      return svg(o, W, H);
    },

    /* 等腰三角形：给顶角，问底角 */
    isoApex: function (apex) {
      const W = 240, H = 178;
      const b = (180 - apex) / 2;
      const P = triPts(apex, b, b);
      const M = mapper(P, W, H, 34);
      const A1 = M(P.A), B1 = M(P.B), C1 = M(P.C);
      let o = '<path d="' + ln(A1, B1) + ln(B1, C1) + ln(C1, A1) + '" fill="none" ' +
        'stroke="' + EDGE + '" stroke-width="1.8" stroke-linejoin="round"/>';
      /* 两条腰等长的刻度 */
      const mAB = { x: (A1.x + B1.x) / 2, y: (A1.y + B1.y) / 2 };
      const mAC = { x: (A1.x + C1.x) / 2, y: (A1.y + C1.y) / 2 };
      o += '<circle cx="' + mAB.x.toFixed(1) + '" cy="' + mAB.y.toFixed(1) + '" r="2.6" fill="' + EDGE + '"/>';
      o += '<circle cx="' + mAC.x.toFixed(1) + '" cy="' + mAC.y.toFixed(1) + '" r="2.6" fill="' + EDGE + '"/>';
      const gA = angleAt(A1, B1, C1, 16), gB = angleAt(B1, A1, C1, 16);
      o += '<path d="' + gA.path + '" fill="none" stroke="' + GIVEN + '" stroke-width="1.4"/>';
      o += '<path d="' + gB.path + '" fill="none" stroke="' + ASK + '" stroke-width="1.4" stroke-dasharray="3 2"/>';
      o += txt(gA.x, gA.y, apex + '°', GIVEN);
      o += txt(gB.x, gB.y, '?', ASK, 15);
      return svg(o, W, H);
    },

    /* 等腰三角形：给底角，问顶角 */
    isoBase: function (base) {
      const W = 240, H = 178;
      const apex = 180 - base * 2;
      if (!(apex > 0)) return '';
      const P = triPts(apex, base, base);
      const M = mapper(P, W, H, 34);
      const A1 = M(P.A), B1 = M(P.B), C1 = M(P.C);
      let o = '<path d="' + ln(A1, B1) + ln(B1, C1) + ln(C1, A1) + '" fill="none" ' +
        'stroke="' + EDGE + '" stroke-width="1.8" stroke-linejoin="round"/>';
      const gA = angleAt(A1, B1, C1, 16), gB = angleAt(B1, A1, C1, 16);
      o += '<path d="' + gA.path + '" fill="none" stroke="' + ASK + '" stroke-width="1.4" stroke-dasharray="3 2"/>';
      o += '<path d="' + gB.path + '" fill="none" stroke="' + GIVEN + '" stroke-width="1.4"/>';
      o += txt(gA.x, gA.y, '?', ASK, 15);
      o += txt(gB.x, gB.y, base + '°', GIVEN);
      return svg(o, W, H);
    },

    /* 直角三角形：给一个锐角，问另一个 */
    rightTri: function (a) {
      const W = 250, H = 168;
      const b = 90 - a;
      const P = triPts(a, b, 90);     /* C 处是直角 */
      const M = mapper(P, W, H, 34);
      const A1 = M(P.A), B1 = M(P.B), C1 = M(P.C);
      let o = '<path d="' + ln(A1, B1) + ln(B1, C1) + ln(C1, A1) + '" fill="none" ' +
        'stroke="' + EDGE + '" stroke-width="1.8" stroke-linejoin="round"/>';
      /* 直角小方块 */
      const ux = (B1.x - C1.x) / Math.hypot(B1.x - C1.x, B1.y - C1.y);
      const uy = (B1.y - C1.y) / Math.hypot(B1.x - C1.x, B1.y - C1.y);
      const vx = (A1.x - C1.x) / Math.hypot(A1.x - C1.x, A1.y - C1.y);
      const vy = (A1.y - C1.y) / Math.hypot(A1.x - C1.x, A1.y - C1.y);
      const k = 11;
      o += '<path d="M' + (C1.x + ux * k).toFixed(1) + ' ' + (C1.y + uy * k).toFixed(1) +
        'L' + (C1.x + (ux + vx) * k).toFixed(1) + ' ' + (C1.y + (uy + vy) * k).toFixed(1) +
        'L' + (C1.x + vx * k).toFixed(1) + ' ' + (C1.y + vy * k).toFixed(1) +
        '" fill="none" stroke="' + MARK + '" stroke-width="1.3"/>';
      const gA = angleAt(A1, B1, C1, 15), gB = angleAt(B1, A1, C1, 15);
      o += '<path d="' + gA.path + '" fill="none" stroke="' + GIVEN + '" stroke-width="1.4"/>';
      o += '<path d="' + gB.path + '" fill="none" stroke="' + ASK + '" stroke-width="1.4" stroke-dasharray="3 2"/>';
      o += txt(gA.x, gA.y, a + '°', GIVEN);
      o += txt(gB.x, gB.y, '?', ASK, 15);
      return svg(o, W, H);
    },

    /* 等边三角形 + 一条连线（D 在 BC 延长线上），∠1 在 A，∠2 在 D */
    equiCevian: function (x) {
      const W = 280, H = 178;
      const P = triPts(60, 60, 60);
      /* D 在 BC 延长线上 */
      P.D = { x: P.C.x + (P.C.x - P.B.x) * 0.78, y: 0 };
      const M = mapper(P, W, H, 32);
      const A1 = M(P.A), B1 = M(P.B), C1 = M(P.C), D1 = M(P.D);
      let o = '<path d="' + ln(A1, B1) + ln(B1, D1) + ln(D1, A1) + '" fill="none" ' +
        'stroke="' + EDGE + '" stroke-width="1.8" stroke-linejoin="round"/>';
      o += '<path d="' + ln(C1, A1) + '" fill="none" stroke="' + EDGE + '" stroke-width="1.8"/>';
      const gA = angleAt(A1, B1, D1, 15), gD = angleAt(D1, A1, C1, 15);
      o += '<path d="' + gA.path + '" fill="none" stroke="' + GIVEN + '" stroke-width="1.4"/>';
      o += '<path d="' + gD.path + '" fill="none" stroke="' + ASK + '" stroke-width="1.4" stroke-dasharray="3 2"/>';
      o += txt(gA.x, gA.y, x + '°', GIVEN);
      o += txt(gD.x, gD.y, '?', ASK, 15);
      o += txt(A1.x, A1.y - 12, 'A', INK, 11);
      o += txt(B1.x - 10, B1.y + 14, 'B', INK, 11);
      o += txt(C1.x, C1.y + 15, 'C', INK, 11);
      o += txt(D1.x + 8, D1.y + 14, 'D', INK, 11);
      return svg(o, W, H);
    },

    /* 等腰三角形：两个底角各被平分，中间夹出 ∠5 */
    isoBisectors: function (apex) {
      const W = 268, H = 190;
      const b = (180 - apex) / 2;
      const P = triPts(apex, b, b);
      const M = mapper(P, W, H, 36);
      const A1 = M(P.A), B1 = M(P.B), C1 = M(P.C);
      /* 从 B 和 C 各引一条角平分线，交于点 P5 */
      function bisector(V, P1, P2) {
        const d1 = Math.hypot(P1.x - V.x, P1.y - V.y), d2 = Math.hypot(P2.x - V.x, P2.y - V.y);
        const u1 = { x: (P1.x - V.x) / d1, y: (P1.y - V.y) / d1 };
        const u2 = { x: (P2.x - V.x) / d2, y: (P2.y - V.y) / d2 };
        return { x: u1.x + u2.x, y: u1.y + u2.y };
      }
      function rayHit(V, dir, Q, R) {
        /* 射线 V+t*dir 与线段 QR 的交点 */
        const ex = R.x - Q.x, ey = R.y - Q.y;
        const den = dir.x * ey - dir.y * ex;
        if (Math.abs(den) < 1e-9) return null;
        const t = ((Q.x - V.x) * ey - (Q.y - V.y) * ex) / den;
        const u = ((Q.x - V.x) * dir.y - (Q.y - V.y) * dir.x) / den;
        if (t <= 0 || u < 0 || u > 1) return null;
        return { x: V.x + dir.x * t, y: V.y + dir.y * t };
      }
      const db = bisector(B1, A1, C1), dc = bisector(C1, A1, B1);
      const hitB = rayHit(B1, db, A1, C1);
      const hitC = rayHit(C1, dc, A1, B1);
      let o = '<path d="' + ln(A1, B1) + ln(B1, C1) + ln(C1, A1) + '" fill="none" ' +
        'stroke="' + EDGE + '" stroke-width="1.8" stroke-linejoin="round"/>';
      let P5 = null;
      if (hitB && hitC) {
        o += '<path d="' + ln(B1, hitB) + '" fill="none" stroke="' + EDGE + '" stroke-width="1.3"/>';
        o += '<path d="' + ln(C1, hitC) + '" fill="none" stroke="' + EDGE + '" stroke-width="1.3"/>';
        /* 两条线的交点 = 中间那个顶点 */
        const d1 = { x: hitB.x - B1.x, y: hitB.y - B1.y };
        const d2 = { x: hitC.x - C1.x, y: hitC.y - C1.y };
        const den = d1.x * d2.y - d1.y * d2.x;
        if (Math.abs(den) > 1e-9) {
          const t = ((C1.x - B1.x) * d2.y - (C1.y - B1.y) * d2.x) / den;
          P5 = { x: B1.x + d1.x * t, y: B1.y + d1.y * t };
        }
      }
      const gA = angleAt(A1, B1, C1, 15);
      o += '<path d="' + gA.path + '" fill="none" stroke="' + GIVEN + '" stroke-width="1.4"/>';
      o += txt(gA.x, gA.y, apex + '°', GIVEN);
      if (P5) {
        o += '<circle cx="' + P5.x.toFixed(1) + '" cy="' + P5.y.toFixed(1) + '" r="2.6" fill="' + ASK + '"/>';
        o += txt(P5.x + 13, P5.y + 4, '?', ASK, 15);
        /* 四个被平分的小角标上 1..4 */
        const gB = angleAt(B1, A1, P5, 13), gC = angleAt(C1, P5, A1, 13);
        o += txt(gB.x - 8, gB.y, '1', INK, 10);
        o += txt(gC.x + 8, gC.y, '3', INK, 10);
      }
      return svg(o, W, H);
    }
  };
})();
`;

const libAnchor = `const hl = t => String(t).replace(/(\\d+(?:\\.\\d+)?)/g, '<b>$1</b>');`;
once(libAnchor, 'hl');
s = s.replace(libAnchor, libAnchor + '\n\n' + LIB);
console.log('OK  FIG 库');

/* ---------- 3. render 里插配图 ---------- */
const rAnchor = `  $('qtext').innerHTML = hl(p.text) +`;
once(rAnchor, 'render qtext');
s = s.replace(rAnchor, `  /* 配图放在题干上面：先看图再看字，符合读题习惯 */
  $('qtext').innerHTML = (p.figure ? p.figure : '') + hl(p.text) +`);
console.log('OK  render 插配图');

/* ---------- 4. 给几何模板挂上配图 ---------- */
const subs = [
  [`      tag: '四上 · 三角形内角和',\n      text: sc,`,
   `      tag: '四上 · 三角形内角和',\n      figure: FIG.triAngle(a, b),\n      text: sc,`],
  [`      tag: '四上 · 三角形的外角',\n      text,`,
   `      tag: '四上 · 三角形的外角',\n      figure: FIG.triExterior(a, b),\n      text,`],
  [`      tag: '四上 · 等边三角形',\n      text: pick([`,
   `      tag: '四上 · 等边三角形',\n      figure: FIG.equiCevian(x),\n      text: pick([`],
  [`      tag: '四上 · 求角并分类',\n      text: pick([`,
   `      tag: '四上 · 求角并分类',\n      figure: FIG.triAngle(a, b),\n      text: pick([`],
  [`      tag: '四上 · 等腰三角形',\n      text: pick([`,
   `      tag: '四上 · 等腰三角形',\n      figure: FIG.isoBisectors(a),\n      text: pick([`],
  [`      tag: '四上 · 直角三角形',\n      text:`,
   `      tag: '四上 · 直角三角形',\n      figure: FIG.rightTri(a),\n      text:`]
];
subs.forEach(function (pair, i) {
  const c = s.split(pair[0]).length - 1;
  if (c !== 1) { console.log('  ! 锚点 ' + (i + 1) + ' 出现 ' + c + ' 次，跳过'); return; }
  s = s.replace(pair[0], pair[1]);
  console.log('OK  模板配图 ' + (i + 1));
});

fs.writeFileSync(FILE, s, 'utf8');
console.log('WROTE ' + FILE + '  (' + (fs.statSync(FILE).size / 1024).toFixed(0) + ' KB)');
