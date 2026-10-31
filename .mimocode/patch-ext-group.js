/* 1) 拓展提高独立板块  2) 其余几何题型配图 */
const fs = require('fs');
const MOD = 'C:\\Users\\Administrator\\Desktop\\数学思维闯关\\数学思维闯关.html';
let s = fs.readFileSync(MOD, 'utf8');

function once(n, label) {
  const c = s.split(n).length - 1;
  if (c !== 1) throw new Error('锚点「' + label + '」出现 ' + c + ' 次');
  return s.indexOf(n);
}
function sub(a, b, label) {
  if (s.split(a).length - 1 !== 1) { console.log('  跳过 ' + label); return; }
  s = s.replace(a, b);
  console.log('OK  ' + label);
}

/* ================= 一、单元分组 ================= */
sub(`  { key: '拓展', name: '拓展学习 · 指南针与方向', short: '指南针', sub: '方向辨认 · 钟面方位 · 时间推算', icon: '🧭' },`,
    `  { key: '拓展', group: 'ext', name: '拓展学习 · 指南针与方向', short: '指南针', sub: '方向辨认 · 钟面方位 · 时间推算', icon: '🧭' },`,
    '拓展 标记为 ext');
sub(`  { key: '几何', name: '几何拓展 · 图形与周长专练', short: '几何拓展',`,
    `  { key: '几何', group: 'ext', name: '几何拓展 · 图形与周长专练', short: '几何拓展',`,
    '几何 标记为 ext');

sub(`const UNIT_MAP = {};
UNITS.forEach(u => { UNIT_MAP[u.key] = u; });`,
`const UNIT_MAP = {};
UNITS.forEach(u => { UNIT_MAP[u.key] = u; });

/* 单元分两组：课本单元 / 拓展提高。
   拓展那两块不是课本单元（指南针不在冀教版四上里，几何拓展是拔高），
   混在一起学生会分不清哪些必须会、哪些是加练。 */
function groupOf(u) { return u.group === 'ext' ? 'ext' : 'core'; }
const UNIT_GROUPS = [
  { key: 'core', name: '📚 课本单元', desc: '按课本单元练，考试就考这些' },
  { key: 'ext', name: '🚀 拓展提高', desc: '拔高题型，学有余力再加练' }
];
let unitGroup = 'core';
try {
  const g = localStorage.getItem('math4a.unitGroup');
  if (g === 'ext' || g === 'core') unitGroup = g;
} catch (e) {}`,
    '单元分组定义');

/* 单元面板加分组 Tab */
sub(`      <div class="unit-chips" id="unitChips"></div>`,
    `      <div class="ugrp" id="ugrp"></div>
      <div class="unit-chips" id="unitChips"></div>`,
    '分组 Tab 容器');

/* 分组 Tab 样式 */
sub(`.unit-chips{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:12px;}`,
`.ugrp{display:flex;gap:6px;padding:4px;margin-bottom:10px;border-radius:14px;
  background:#F4F0FF;border:1.5px solid #E6DEFB;}
.ugrp button{flex:1 1 0;min-height:44px;border:none;border-radius:11px;background:transparent;
  font-family:inherit;font-size:13.5px;font-weight:900;color:#8478BC;cursor:pointer;
  transition:background .18s,color .18s,box-shadow .18s;}
.ugrp button.on{background:#fff;color:#6B4CE6;box-shadow:0 2px 0 #D8CEFF;}
.ugrp button:active{transform:scale(.97);}
.unit-chips{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:12px;}`,
    '分组 Tab 样式');

/* renderUnitChips：只渲染当前分组 */
sub(`function renderUnitChips() {
  const wrap = $('unitChips');
  wrap.innerHTML = UNITS.map(u => {`,
`function renderUnitChips() {
  renderUnitGroupTabs();
  const wrap = $('unitChips');
  const list = UNITS.filter(u => groupOf(u) === unitGroup);
  wrap.innerHTML = list.map(u => {`,
    'renderUnitChips 按组过滤');

/* 分组 Tab 的渲染与点击 */
sub(`/* 三处状态一起同步：按钮文案 / 单元标签 / 练习区空状态 */`,
`function renderUnitGroupTabs() {
  const wrap = $('ugrp');
  if (!wrap) return;
  wrap.innerHTML = UNIT_GROUPS.map(g =>
    \`<button type="button" data-grp="\${g.key}" class="\${g.key === unitGroup ? 'on' : ''}"
       aria-pressed="\${g.key === unitGroup}">\${g.name}</button>\`).join('');
  wrap.querySelectorAll('[data-grp]').forEach(btn => {
    btn.addEventListener('click', () => {
      const k = btn.dataset.grp;
      if (k === unitGroup) return;
      unitGroup = k;
      try { localStorage.setItem('math4a.unitGroup', k); } catch (e) {}
      SFX.click();
      renderUnitChips();
      syncUnitUI();
    });
  });
}

/* 三处状态一起同步：按钮文案 / 单元标签 / 练习区空状态 */`,
    '分组 Tab 渲染');

/* 汇总里说清"这几题来自哪一组" */
sub(`    sum.innerHTML = \`已选 <b>\${total}</b> 个单元 · 共 <b>\${kinds}</b> 类题目\` +`,
    `    const grpNames = {};
    selectedUnits.forEach(k => { const g = groupOf(UNIT_MAP[k]); grpNames[g] = true; });
    const grpTag = grpNames.ext && grpNames.core ? '（课本 + 拓展）'
                 : (grpNames.ext ? '（拓展提高）' : '（课本单元）');
    sum.innerHTML = \`已选 <b>\${total}</b> 个单元 · 共 <b>\${kinds}</b> 类题目\` + grpTag +`,
    '汇总加组标签');

/* 站台点「拓展提高」进来：直接把单元切到拓展那组 */
sub(`loadUnits();
renderFormChips();`,
`loadUnits();

/* 站台首页点「拓展提高」进来时，先把单元定到拓展那两块 */
(function applyStationPreset() {
  let p = null;
  try { p = localStorage.getItem('math4a.preset'); } catch (e) {}
  if (p !== 'ext') return;
  try { localStorage.removeItem('math4a.preset'); } catch (e) {}
  unitGroup = 'ext';
  selectedUnits = UNITS.filter(u => groupOf(u) === 'ext').map(u => u.key);
  saveUnits();
  try { localStorage.setItem('math4a.unitGroup', 'ext'); } catch (e) {}
})();

renderFormChips();`,
    '站台预设');

/* ================= 二、补齐几何配图 ================= */
/* 2.1 画图库里再加四个 */
sub(`    /* 等腰三角形：两个底角各被平分，中间夹出 ∠5 */`,
`    /* 数图形：从顶点向对边引 n 条线段 */
    fan: function (n) {
      const W = 250, H = 176;
      const P = triPts(60, 60, 60);
      const M = mapper(P, W, H, 34);
      const A1 = M(P.A), B1 = M(P.B), C1 = M(P.C);
      let o = '<path d="' + ln(A1, B1) + ln(B1, C1) + ln(C1, A1) + '" fill="none" ' +
        'stroke="' + EDGE + '" stroke-width="1.8" stroke-linejoin="round"/>';
      for (let i = 1; i <= n; i++) {
        const t = i / (n + 1);
        const q = { x: B1.x + (C1.x - B1.x) * t, y: B1.y + (C1.y - B1.y) * t };
        o += '<path d="' + ln(A1, q) + '" fill="none" stroke="' + EDGE + '" stroke-width="1.3"/>';
        o += '<circle cx="' + q.x.toFixed(1) + '" cy="' + q.y.toFixed(1) + '" r="2.2" fill="' + EDGE + '"/>';
      }
      o += txt(A1.x, A1.y - 11, 'A', INK, 11);
      o += txt(B1.x - 11, B1.y + 14, 'B', INK, 11);
      o += txt(C1.x + 11, C1.y + 14, 'C', INK, 11);
      return svg(o, W, H);
    },

    /* 靠墙围栏：上边是墙（虚线 + 斜线阴影），另外三条边是篱笆 */
    wallPen: function (a, b) {
      const W = 262, H = 172, pad = 30;
      const bw = W - pad * 2, bh = 96;
      const x0 = pad, y0 = 44, x1 = x0 + bw, y1 = y0 + bh;
      let o = '';
      /* 墙 */
      o += '<path d="' + 'M' + x0 + ' ' + y0 + 'L' + x1 + ' ' + y0 + '" fill="none" ' +
        'stroke="' + MARK + '" stroke-width="3" stroke-dasharray="7 4"/>';
      for (let x = x0 + 6; x < x1 - 4; x += 14) {
        o += '<path d="M' + x + ' ' + y0 + 'L' + (x - 8) + ' ' + (y0 - 9) + '" ' +
          'stroke="' + MARK + '" stroke-width="1.1"/>';
      }
      o += txt((x0 + x1) / 2, y0 - 16, '院墙（不用围）', GIVEN, 11);
      /* 三条篱笆边 */
      o += '<path d="' + 'M' + x0 + ' ' + y0 + 'L' + x0 + ' ' + y1 +
        'L' + x1 + ' ' + y1 + 'L' + x1 + ' ' + y0 + '" fill="none" ' +
        'stroke="' + EDGE + '" stroke-width="2.2" stroke-linejoin="round"/>';
      o += txt((x0 + x1) / 2, y1 + 18, '长 ' + a + ' 米', GIVEN);
      o += '<text x="' + (x0 - 6) + '" y="' + ((y0 + y1) / 2) + '" text-anchor="end" ' +
        'style="font-size:12px;font-weight:800" fill="' + GIVEN + '" ' +
        'transform="rotate(-90 ' + (x0 - 6) + ' ' + ((y0 + y1) / 2) + ')">宽 ' + b + ' 米</text>';
      o += '<text x="' + (x1 + 6) + '" y="' + ((y0 + y1) / 2) + '" text-anchor="start" ' +
        'style="font-size:12px;font-weight:800" fill="' + GIVEN + '" ' +
        'transform="rotate(90 ' + (x1 + 6) + ' ' + ((y0 + y1) / 2) + ')">宽 ' + b + ' 米</text>';
      return svg(o, W, H);
    },

    /* 梯形：四条边都标出来 */
    trapezoid: function (top, bottom, l1, l2) {
      const W = 262, H = 176, pad = 34;
      const bw = W - pad * 2;
      const x0 = pad, y0 = 42, y1 = y0 + 92;
      const inset = bw * 0.24;
      const P = {
        A: { x: x0 + inset, y: y0 },
        B: { x: x0 + bw - inset, y: y0 },
        C: { x: x0 + bw, y: y1 },
        D: { x: x0, y: y1 }
      };
      let o = '<path d="' + ln(P.A, P.B) + ln(P.B, P.C) + ln(P.C, P.D) + ln(P.D, P.A) +
        '" fill="none" stroke="' + EDGE + '" stroke-width="2" stroke-linejoin="round"/>';
      o += txt((P.A.x + P.B.x) / 2, P.A.y - 10, '上底 ' + top, GIVEN, 11.5);
      o += txt((P.D.x + P.C.x) / 2, P.C.y + 18, '下底 ' + bottom, GIVEN, 11.5);
      o += '<text x="' + (P.A.x - 9) + '" y="' + ((P.A.y + P.D.y) / 2) + '" text-anchor="end" ' +
        'style="font-size:11.5px;font-weight:800" fill="' + GIVEN + '">腰 ' + l1 + '</text>';
      o += '<text x="' + (P.B.x + 9) + '" y="' + ((P.B.y + P.C.y) / 2) + '" text-anchor="start" ' +
        'style="font-size:11.5px;font-weight:800" fill="' + GIVEN + '">腰 ' + l2 + '</text>';
      return svg(o, W, H);
    },

    /* 钟面方位：把人面向的方向转到 12 点位置，看目标方向落在几点 */
    clockFace: function (facingIdx, targetIdx) {
      const W = 250, H = 210, cx = W / 2, cy = 108, r = 78;
      const DIRS = ['北', '东', '南', '西'];
      let o = '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="none" ' +
        'stroke="' + MARK + '" stroke-width="1.6"/>';
      o += '<circle cx="' + cx + '" cy="' + cy + '" r="3" fill="' + EDGE + '"/>';
      /* 12 / 3 / 6 / 9 的刻度 */
      for (let k = 0; k < 4; k++) {
        const ang = (-90 + k * 90) * Math.PI / 180;
        const ix = cx + (r - 9) * Math.cos(ang), iy = cy + (r - 9) * Math.sin(ang);
        const ox2 = cx + r * Math.cos(ang), oy2 = cy + r * Math.sin(ang);
        o += '<path d="' + ln({ x: ix, y: iy }, { x: ox2, y: oy2 }) + '" stroke="' +
          (k === (targetIdx - facingIdx + 4) % 4 ? ASK : MARK) + '" stroke-width="' +
          (k === (targetIdx - facingIdx + 4) % 4 ? 2.6 : 1.4) + '"/>';
        /* 钟点数字 */
        const nx = cx + (r - 22) * Math.cos(ang), ny = cy + (r - 22) * Math.sin(ang) + 4;
        o += txt(nx, ny, (k * 3 === 0 ? 12 : k * 3) + '', MARK, 10.5);
      }
      /* 四个方向：面向的那个放到 12 点 */
      DIRS.forEach(function (d, k) {
        const rel = (k - facingIdx + 4) % 4;
        const ang = (-90 + rel * 90) * Math.PI / 180;
        const lx = cx + (r + 20) * Math.cos(ang), ly = cy + (r + 20) * Math.sin(ang) + 5;
        const isTarget = k === targetIdx;
        o += txt(lx, ly, isTarget ? '?' : d, isTarget ? ASK : INK, isTarget ? 16 : 12.5);
      });
      o += txt(cx, cy + r + 44, '面向' + DIRS[facingIdx] + '方 = 12 点钟方向', GIVEN, 11);
      return svg(o, W, H);
    },

    /* 等腰三角形：两个底角各被平分，中间夹出 ∠5 */`,
    'FIG 新增 4 个画法');

/* 2.2 挂到模板上 */
sub(`      tag: '四上 · 数图形',\n      text:`,
    `      tag: '四上 · 数图形',\n      figure: FIG.fan(n),\n      text:`, '数图形配图');
sub(`      tag: '四上 · 靠墙围栏',\n      text:`,
    `      tag: '四上 · 靠墙围栏',\n      figure: FIG.wallPen(a, b),\n      text:`, '靠墙围栏配图');
sub(`      tag: '四上 · 梯形的周长',\n      text:`,
    `      tag: '四上 · 梯形的周长',\n      figure: FIG.trapezoid(a, b, c, d),\n      text:`, '梯形周长配图');
sub(`      tag: '四上 · 等腰梯形',\n      text: sc.t,`,
    `      tag: '四上 · 等腰梯形',\n      figure: FIG.trapezoid(up, low, w, w),\n      text: sc.t,`, '等腰梯形配图');
sub(`      tag: '四上 · 拓展学习',\n      text:`,
    `      tag: '四上 · 拓展学习',\n      figure: FIG.clockFace(iF, (iF + step) % 4),\n      text:`, '钟面方位配图');

fs.writeFileSync(MOD, s, 'utf8');
console.log('WROTE ' + MOD + '  (' + (fs.statSync(MOD).size / 1024).toFixed(0) + ' KB)');
