/* 从闯关页移除竖式模块（它已经独立成 竖式练习台.html） */
const fs = require('fs');
const MAIN = 'C:\\Users\\Administrator\\Desktop\\数学思维闯关\\数学思维闯关.html';
let s = fs.readFileSync(MAIN, 'utf8');
const before = s.length;

function cut(from, to, name) {
  const a = s.indexOf(from);
  if (a < 0) throw new Error('找不到起点: ' + name);
  const b = s.indexOf(to, a + from.length);
  if (b < 0) throw new Error('找不到终点: ' + name);
  s = s.slice(0, a) + s.slice(b);
  console.log('CUT ' + name + '  -' + (b - a) + ' chars');
}

function cutLine(needle, name) {
  const a = s.indexOf(needle);
  if (a < 0) throw new Error('找不到行: ' + name);
  const lineStart = s.lastIndexOf('\n', a) + 1;
  let lineEnd = s.indexOf('\n', a);
  if (lineEnd < 0) lineEnd = s.length;
  s = s.slice(0, lineStart) + s.slice(lineEnd + 1);
  console.log('CUTLINE ' + name);
}

/* 1. Tab 按钮 */
cutLine('data-tab="vertical"', 'tab-button');

/* 2. 竖式页面整块 */
cut('  <div id="page-vertical" style="display:none">', '  <div id="page-wrong" style="display:none">', 'page-vertical');

/* 3. 竖式样式 */
cut('/* ============ 竖式练习台 ============ */',
    '.page-head{display:flex;align-items:center;justify-content:space-between;', 'vertical-css');

/* 4. 竖式脚本 */
cut('/* =========================================================\n   竖式练习台\n',
    '/* =========================================================\n   启动\n', 'vertical-js');

/* 5. 切页里的两处 page-vertical */
cutLine("$('page-vertical').style.display = tab === 'vertical' ? 'block' : 'none';", 'tab-switch-vertical');
cutLine("$('page-vertical').style.display = 'none';", 'goPracticeTab-vertical');
cutLine("if (tab === 'vertical') vertEnter();", 'vertEnter-call');

fs.writeFileSync(MAIN, s, 'utf8');
console.log('DONE  ' + before + ' -> ' + s.length + ' bytes');
console.log('leftover "竖式": ' + (s.match(/竖式/g) || []).length);
console.log('leftover "page-vertical": ' + (s.match(/page-vertical/g) || []).length);
console.log('leftover "vertQ": ' + (s.match(/vertQ/g) || []).length);
