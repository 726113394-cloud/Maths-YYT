/* 模块侧：读同样的 math4a.render / math4a.motion（各三级），落到 data-perf / data-motion */
const fs = require('fs');

const FILES = [
  'C:\\Users\\Administrator\\Desktop\\数学思维闯关\\数学思维闯关.html',
  'C:\\Users\\Administrator\\Desktop\\数学思维闯关\\竖式练习台.html'
];

const MARK = '/* ===== 渲染与动画两个维度，各三级 ===== */';

function block(isVert) {
  return `${MARK}
/* 站台会把同样的偏好写进 localStorage；直接双击打开这个文件时也照样生效。
   渲染 高级/默认/流畅 → html[data-perf]=high/mid/low
   动画 全量/默认/关闭 → html[data-motion]=on/off
   ⚠️ 只读一次静态线索（核心数/内存/省流量），不起定时器、不跑 rAF 循环。
   ⚠️ 判弱机只认 ≤2：iOS Safari 恒报 4 核、Chrome 的 deviceMemory 封顶 8，
      按 ≤4 判会把好机器一起降级。 */
(function detectPerf() {
  var PERF_BY = ['high', 'mid', 'low'];
  var pressure = 0, reduced = false;
  try {
    var cores = navigator.hardwareConcurrency || 4;
    var mem = navigator.deviceMemory || 4;
    var conn = navigator.connection || {};
    var saveData = conn.saveData === true;
    var slowNet = /^(slow-)?2g$/.test(String(conn.effectiveType || ''));
    pressure = (cores <= 2 || mem <= 2 || saveData || slowNet) ? 2 : ((cores <= 4 || mem <= 4) ? 1 : 0);
    reduced = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  } catch (e) {}

  function pref(key, allowed, dflt) {
    try {
      var v = localStorage.getItem('math4a.' + key);
      if (v === null) return dflt;
      v = String(v).replace(/^"|"$/g, '');
      if (allowed.indexOf(v) >= 0) return v;
      if (key === 'motion') {                 /* 旧版本只存 on/off */
        if (v === 'on') return 'full';
        if (v === 'off') return 'off';
      }
    } catch (e) {}
    return dflt;
  }

  var rPref = pref('render', ['high', 'auto', 'smooth'], 'auto');
  var mPref = pref('motion', ['full', 'auto', 'off'], 'auto');

  var perf = rPref === 'high' ? 'high' : (rPref === 'smooth' ? 'low' : PERF_BY[pressure]);
  var motion = mPref === 'full' ? 'on'
             : (mPref === 'off' ? 'off' : (reduced || pressure >= 2 ? 'off' : 'on'));

  var root = document.documentElement;
  root.dataset.render = rPref;
  root.dataset.motionPref = mPref;      /* 注意：data-motion 是解析后的结果 */
  root.dataset.perf = perf;
  root.dataset.motion = motion;
  document.body.dataset.perf = perf;
  document.body.dataset.motion = motion;
  window.__perf = perf;
  window.__motion = motion;
})();
`;
}

FILES.forEach(function (f) {
  let s = fs.readFileSync(f, 'utf8');
  if (s.indexOf(MARK) >= 0) { console.log('SKIP 已打过 ' + f); return; }

  /* 找到旧的那段 detectPerf（到它的 IIFE 结束），整段换掉 */
  const at = s.indexOf('(function detectPerf() {');
  if (at < 0) throw new Error('找不到 detectPerf: ' + f);
  /* 从 IIFE 起点做括号配平 */
  let i = s.indexOf('{', at), depth = 0, inStr = null, esc = false;
  for (; i < s.length; i++) {
    const ch = s[i];
    if (inStr) {
      if (esc) { esc = false; continue; }
      if (ch === '\\') { esc = true; continue; }
      if (ch === inStr) inStr = null;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === '`') { inStr = ch; continue; }
    if (ch === '{') depth++;
    else if (ch === '}') { depth--; if (depth === 0) { i++; break; } }
  }
  if (s.slice(i, i + 4) !== ')();') throw new Error('IIFE 结尾不像 )(); : ' + f);
  const end = i + 4;

  /* 往前吃掉旧注释行（同一行开始的那条） */
  let start = at;
  const lineStart = s.lastIndexOf('\n', at) + 1;
  if (s.slice(lineStart, at).trim() === '') start = lineStart;

  s = s.slice(0, start) + block(false) + s.slice(end);
  fs.writeFileSync(f, s, 'utf8');
  console.log('PATCH ' + f + '  (' + (fs.statSync(f).size / 1024).toFixed(0) + ' KB)');
});
