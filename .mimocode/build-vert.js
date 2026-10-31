/* 把竖式练习的 CSS / JS 从闯关页抽出来，填进独立页面，避免手抄出错 */
const fs = require('fs');

const MAIN = 'C:\\Users\\Administrator\\Desktop\\数学思维闯关\\数学思维闯关.html';
const VERT = 'C:\\Users\\Administrator\\Desktop\\数学思维闯关\\竖式练习台.html';

const src = fs.readFileSync(MAIN, 'utf8');

function slice(from, to, name) {
  const a = src.indexOf(from);
  const b = to === null ? src.length : src.indexOf(to, a + 1);
  if (a < 0 || b < 0 || b <= a) throw new Error('切不出 ' + name + ' from=' + a + ' to=' + b);
  return src.slice(a, b);
}

const cssStart = '/* ============ 竖式练习台 ============ */';
const cssEnd = '.page-head{display:flex;align-items:center;justify-content:space-between;';
let vertCss = slice(cssStart, cssEnd, 'VERT CSS');

// 独立页不再需要「手机端压扁」那段里跟闯关页有关的选择器，原样保留也无害
vertCss = vertCss.replace(cssStart, '/* ============ 竖式练习台 ============ */\n/* （样式与站台里的版本共用，改这里就等于改站台里的那份） */');

const jsStart = '/* =========================================================\n   竖式练习台\n';
const jsEnd = '/* =========================================================\n   启动\n';
const vertJs = slice(jsStart, jsEnd, 'VERT JS');

let shell = fs.readFileSync(VERT, 'utf8');
if (shell.indexOf('@@VERT_CSS@@') < 0 || shell.indexOf('@@VERT_JS@@') < 0) {
  throw new Error('模板占位符不在，可能已经填过了');
}
shell = shell.replace('@@VERT_CSS@@', vertCss.trimEnd() + '\n')
             .replace('@@VERT_JS@@', vertJs.trimEnd() + '\n');
fs.writeFileSync(VERT, shell, 'utf8');

console.log('VERT CSS ' + vertCss.length + ' chars');
console.log('VERT JS  ' + vertJs.length + ' chars');
console.log('WROTE ' + VERT + ' (' + fs.statSync(VERT).size + ' bytes)');
