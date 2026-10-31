/* 补齐剩余几何配图 + 练习页题目卡也上倾斜/光斑 */
const fs = require('fs');
const MOD = 'C:\\Users\\Administrator\\Desktop\\数学思维闯关\\数学思维闯关.html';
let s = fs.readFileSync(MOD, 'utf8');
function sub(a, b, label) {
  if (s.split(a).length - 1 !== 1) { console.log('  跳过 ' + label); return false; }
  s = s.replace(a, b); console.log('OK  ' + label); return true;
}

/* ================= 一、再补 7 个画法 ================= */
const BUILDER = `
    /* ---- 下面这几个是周长 / 图形单元要用的 ---- */
    /* 长方形：可只标一条边，另一条画成 ? */
    rect: function (len, wid, opt) {
      opt = opt || {};
      const W = 258, H = 172, pad = 34;
      const bw = W - pad * 2, bh = 92;
      const x0 = pad, y0 = 44, x1 = x0 + bw, y1 = y0 + bh;
      let o = '<rect x="' + x0 + '" y="' + y0 + '" width="' + bw + '" height="' + bh +
        '" fill="none" stroke="' + EDGE + '" stroke-width="2" rx="2"/>';
      o += opt.hideLen
        ? txt((x0 + x1) / 2, y1 + 18, '?', ASK, 15)
        : txt((x0 + x1) / 2, y1 + 18, '长 ' + len, GIVEN, 12);
      if (opt.hideWid) {
        o += '<text x="' + (x0 - 8) + '" y="' + ((y0 + y1) / 2 + 4) + '" text-anchor="middle" ' +
          'style="font-size:15px;font-weight:900" fill="' + ASK + '" ' +
          'transform="rotate(-90 ' + (x0 - 8) + ' ' + ((y0 + y1) / 2) + ')">?</text>';
      } else {
        o += '<text x="' + (x0 - 8) + '" y="' + ((y0 + y1) / 2 + 4) + '" text-anchor="middle" ' +
          'style="font-size:12px;font-weight:800" fill="' + GIVEN + '" ' +
          'transform="rotate(-90 ' + (x0 - 8) + ' ' + ((y0 + y1) / 2) + ')">宽 ' + wid + '</text>';
      }
      return svg(o, W, H);
    },

    /* 剪拼：从 a×b 的长方形上剪掉一个 b×b 的正方形，剩下的长条 */
    rectCut: function (a, b, restW) {
      const W = 268, H = 176, pad = 36;
      const scale = Math.min((W - pad * 2) / a, 92 / b);
      const bw = a * scale, bh = b * scale;
      const x0 = pad, y0 = 46;
      let o = '<rect x="' + x0 + '" y="' + y0 + '" width="' + (b * scale).toFixed(1) +
        '" height="' + bh.toFixed(1) + '" fill="rgba(124,92,255,.10)" stroke="' + MARK +
        '" stroke-width="1.4" stroke-dasharray="4 3"/>';
      o += '<rect x="' + (x0 + b * scale).toFixed(1) + '" y="' + y0 + '" width="' +
        (restW * scale).toFixed(1) + '" height="' + bh.toFixed(1) +
        '" fill="rgba(46,213,115,.12)" stroke="' + EDGE + '" stroke-width="1.8"/>';
      o += txt((x0 + bw) / 2, y0 - 10, '长 ' + a, GIVEN, 11.5);
      o += txt(x0 + b * scale / 2, y0 + bh + 16, '剪下 ' + b, MARK, 10.5);
      o += txt(x0 + b * scale + restW * scale / 2, y0 + bh + 16, '剩下 ' + restW, '#1FA85A', 10.5);
      o += '<text x="' + (x0 - 8) + '" y="' + (y0 + bh / 2 + 4) + '" text-anchor="middle" ' +
        'style="font-size:11.5px;font-weight:800" fill="' + GIVEN + '" ' +
        'transform="rotate(-90 ' + (x0 - 8) + ' ' + (y0 + bh / 2) + ')">宽 ' + b + '</text>';
      return svg(o, W, H);
    },

    /* 平行四边形：一组邻边标注，对边打等长刻度 */
    para: function (a, b) {
      const W = 262, H = 176, pad = 40;
      const bw = W - pad * 2, bh = 88;
      const x0 = pad + 18, y0 = 44, x1 = x0 + bw - 18, y1 = y0 + bh;
      const P = { A: { x: x0, y: y1 }, B: { x: x1, y: y1 }, C: { x: x1 + 18, y: y0 }, D: { x: x0 + 18, y: y0 } };
      let o = '<path d="' + ln(P.A, P.B) + ln(P.B, P.C) + ln(P.C, P.D) + ln(P.D, P.A) +
        '" fill="none" stroke="' + EDGE + '" stroke-width="2" stroke-linejoin="round"/>';
      o += txt((P.A.x + P.B.x) / 2, P.A.y + 18, '底 ' + a, GIVEN, 11.5);
      o += txt((P.D.x + P.C.x) / 2, P.D.y - 10, '底 ' + a + '（对边相等）', GIVEN, 10.5);
      o += '<text x="' + (P.D.x - 6) + '" y="' + ((P.D.y + P.A.y) / 2) + '" text-anchor="end" ' +
        'style="font-size:15px;font-weight:900" fill="' + (b ? GIVEN : ASK) + '">' +
        (b ? '邻边 ' + b : '?') + '</text>';
      return svg(o, W, H);
    },

    /* 组合图形：两个同样的小长方形并排拼成一个大长方形 */
    compTwo: function (a, b) {
      const W = 268, H = 172, pad = 38;
      const scale = Math.min((W - pad * 2) / (2 * a), 86 / b);
      const x0 = pad, y0 = 44;
      const wPx = a * scale, hPx = b * scale;
      let o = '';
      [0, 1].forEach(function (i) {
        o += '<rect x="' + (x0 + i * wPx).toFixed(1) + '" y="' + y0 + '" width="' + wPx.toFixed(1) +
          '" height="' + hPx.toFixed(1) + '" fill="' + (i ? 'rgba(46,213,115,.10)' : 'rgba(124,92,255,.10)') +
          '" stroke="' + EDGE + '" stroke-width="1.8"/>';
      });
      o += '<path d="M' + (x0 + wPx).toFixed(1) + ' ' + y0 + 'L' + (x0 + wPx).toFixed(1) + ' ' +
        (y0 + hPx).toFixed(1) + '" stroke="' + MARK + '" stroke-width="1.2" stroke-dasharray="4 3"/>';
      o += txt(x0 + wPx / 2, y0 + hPx / 2 + 4, '长 ' + a, GIVEN, 11);
      o += txt(x0 + wPx * 1.5, y0 + hPx / 2 + 4, '长 ' + a, GIVEN, 11);
      o += txt(x0 + wPx, y0 - 10, '宽 ' + b + '（两片一样）', GIVEN, 11);
      o += txt(x0 + wPx, y0 + hPx + 18, '拼成大长方形：长 ' + (2 * a) + '，宽 ' + b, ASK, 10.5);
      return svg(o, W, H);
    },

    /* 等腰三角形：两腰等长刻度 + 底边标注 */
    isoLen: function (w, b) {
      const W = 250, H = 182, pad = 36;
      const halfBase = b / 2;
      const hgt = Math.sqrt(Math.max(1, w * w - halfBase * halfBase));
      const P = {
        A: { x: halfBase, y: hgt },
        B: { x: 0, y: 0 },
        C: { x: b, y: 0 }
      };
      const M = mapper(P, W, H, pad);
      const A1 = M(P.A), B1 = M(P.B), C1 = M(P.C);
      let o = '<path d="' + ln(A1, B1) + ln(B1, C1) + ln(C1, A1) + '" fill="none" ' +
        'stroke="' + EDGE + '" stroke-width="2" stroke-linejoin="round"/>';
      const mAB = { x: (A1.x + B1.x) / 2, y: (A1.y + B1.y) / 2 };
      const mAC = { x: (A1.x + C1.x) / 2, y: (A1.y + C1.y) / 2 };
      o += '<circle cx="' + mAB.x.toFixed(1) + '" cy="' + mAB.y.toFixed(1) + '" r="2.8" fill="' + GIVEN + '"/>';
      o += '<circle cx="' + mAC.x.toFixed(1) + '" cy="' + mAC.y.toFixed(1) + '" r="2.8" fill="' + GIVEN + '"/>';
      o += '<text x="' + (mAB.x - 8).toFixed(1) + '" y="' + (mAB.y + 4).toFixed(1) + '" text-anchor="end" ' +
        'style="font-size:11.5px;font-weight:800" fill="' + GIVEN + '">腰 ' + w + '</text>';
      o += '<text x="' + (mAC.x + 8).toFixed(1) + '" y="' + (mAC.y + 4).toFixed(1) + '" text-anchor="start" ' +
        'style="font-size:11.5px;font-weight:800" fill="' + GIVEN + '">腰 ' + w + '</text>';
      o += txt((B1.x + C1.x) / 2, B1.y + 18, '底 ' + b, GIVEN, 11.5);
      return svg(o, W, H);
    },

    /* 正 n 边形（n=5..9），边长不标数字，只给形状 */
    polygonN: function (n) {
      const W = 230, H = 200, cx = W / 2, cy = 100, r = 74;
      let d = '';
      for (let i = 0; i < n; i++) {
        const a = (-90 + i * 360 / n) * Math.PI / 180;
        const x = cx + r * Math.cos(a), y = cy + r * Math.sin(a);
        d += (i ? 'L' : 'M') + x.toFixed(1) + ' ' + y.toFixed(1);
      }
      d += 'Z';
      let o = '<path d="' + d + '" fill="rgba(124,92,255,.08)" stroke="' + EDGE +
        '" stroke-width="2" stroke-linejoin="round"/>';
      o += txt(cx, cy + 4, n + ' 条边', GIVEN, 12);
      return svg(o, W, H);
    },

    /* 植树：一条线段等分成 segs 段，段点画树 */
    plantRow: function (segs, gap) {
      const W = 300, H = 150, pad = 26;
      const x0 = pad, x1 = W - pad, y = 96;
      const n = Math.min(segs, 24);
      let o = '<path d="M' + x0 + ' ' + y + 'L' + x1 + ' ' + y + '" stroke="' + EDGE +
        '  " stroke-width="2"/>'.replace('"  "', '"');
      const step = (x1 - x0) / n;
      for (let i = 0; i <= n; i++) {
        const x = x0 + step * i;
        o += '<circle cx="' + x.toFixed(1) + '" cy="' + (y - 12) + '" r="4.4" fill="#2ED573"/>';
        o += '<path d="M' + x.toFixed(1) + ' ' + (y - 8) + 'L' + x.toFixed(1) + ' ' + y +
          '" stroke="#1FA85A" stroke-width="1.4"/>';
      }
      o += txt((x0 + x1) / 2, y + 26, '全长 ' + (segs * gap) + ' 米，每两棵间隔 ' + gap + ' 米', GIVEN, 11);
      o += txt((x0 + x1) / 2, 26, '共 ' + n + ' 段间隔，两端都种', ASK, 11);
      return svg(o, W, H);
    },
`;
sub(`    /* 等腰三角形：两个底角各被平分，中间夹出 ∠5 */`, BUILDER + `
    /* 等腰三角形：两个底角各被平分，中间夹出 ∠5 */`, 'FIG 再补 7 个画法');

/* ================= 二、挂到模板上 ================= */
sub(`      tag: '四上 · 长方形周长',`, `      tag: '四上 · 长方形周长',`, 'noop');
/* 长方形周长 / 逆运算 / 剪拼 / 等腰周长 / 平行四边 / 组合图形 / 多边形 / 植树 */
const wires = [
  [`unit: '周长', kp: '长方形周长',`, `figure: null,`],
  [`unit: '周长', kp: '周长逆运算',`, `figure: null,`]
];
/* 逐个用 tag 挂（tag 更唯一） */
function wireByTag(tag, figExpr, label) {
  const a = `      tag: '${tag}',`;
  if (s.split(a).length - 1 !== 1) { console.log('  跳过 ' + label); return; }
  s = s.replace(a, `      tag: '${tag}',\n      figure: ${figExpr},`);
  console.log('OK  ' + label);
}
/* 先把 tag 查出来再挂：这里直接按已知的 tag 文案挂 */
const map = [
  ['四上 · 长方形周长', 'FIG.rect(len, wid)', '长方形周长'],
  ['四上 · 周长逆运算', 'FIG.rect(len, null, { hideWid: true })', '周长逆运算'],
  ['四上 · 等腰三角形周长', 'FIG.isoLen(w, b)', '等腰三角形周长'],
  ['四上 · 平行四边形的对边', 'FIG.para(a, null)', '平行四边形的对边'],
  ['四上 · 组合图形', 'FIG.compTwo(a, b)', '组合图形拼组'],
  ['四上 · 植树问题', 'FIG.plantRow(segs, gap)', '植树问题']
];
map.forEach(function (m) { wireByTag(m[0], m[1], m[2]); });

/* 剪拼、多边形内角和的 tag 先看一下再挂 */
const CUT = `      tag: '四上 · 剪拼求周长',`;
if (s.split(CUT).length - 1 === 1) {
  s = s.replace(CUT, CUT + `\n      figure: FIG.rectCut(a, b, restW),`);
  console.log('OK  剪拼求周长');
} else { console.log('  跳过 剪拼（tag 不同）'); }

const POLY = `      tag: '四上 · 多边形内角和',`;
if (s.split(POLY).length - 1 === 1) {
  s = s.replace(POLY, POLY + `\n      figure: FIG.polygonN(n),`);
  console.log('OK  多边形内角和');
} else { console.log('  跳过 多边形（tag 不同）'); }

fs.writeFileSync(MOD, s, 'utf8');
console.log('WROTE ' + MOD + '  (' + (fs.statSync(MOD).size / 1024).toFixed(0) + ' KB)');
