/* 语法自检：把页面里每段 <script> 抠出来单独 node --check，报错带上行号。
   改完大文件先跑这个，比开浏览器快得多。 */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const file = process.argv[2];
const src = fs.readFileSync(file, 'utf8');
const re = /<script\b[^>]*>([\s\S]*?)<\/script>/gi;
let m, idx = 0, bad = 0;

while ((m = re.exec(src))) {
  idx++;
  const code = m[1];
  if (!code.trim()) continue;
  const line = src.slice(0, m.index).split('\n').length;
  try {
    new vm.Script(code, { filename: path.basename(file) + '#script' + idx });
    console.log('OK   script' + idx + '  起始行 ' + line + '  ' + code.length + ' 字符');
  } catch (e) {
    bad++;
    console.log('FAIL script' + idx + '  起始行 ' + line + '  ' + e.message);
    const mm = /script\d+:(\d+)/.exec(e.stack || '');
    if (mm) console.log('     页面第 ' + (line + Number(mm[1]) - 1) + ' 行附近');
  }
}
process.exit(bad ? 1 : 0);
