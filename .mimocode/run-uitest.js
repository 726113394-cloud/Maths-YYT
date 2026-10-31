/* 用法: node run-uitest.js <目标html> <harness.js> <输出名> */
const fs = require('fs');
const path = require('path');

const target = process.argv[2];
const harnessFile = process.argv[3];
const outName = process.argv[4] || 'mimo_ui_test.html';

const src = fs.readFileSync(target, 'utf8');
const harness = fs.readFileSync(harnessFile, 'utf8');
const injected =
  '<div id="__out" style="white-space:pre-wrap;font-size:12px;padding:8px;background:#fff;color:#111"></div>\n' +
  '<script>\n' + harness + '\n</scr' + 'ipt>\n';

const outPath = path.join(process.env.TEMP, outName);
/* 站台里有 <template>，模板内容里也有 </body> —— 必须插在最后一个，
   否则自测脚本会被塞进模板里，跑到 iframe 里面去 */
const at = src.lastIndexOf('</body>');
if (at < 0) throw new Error('找不到 </body>');
fs.writeFileSync(outPath, src.slice(0, at) + injected + src.slice(at), 'utf8');
console.log('WROTE ' + outPath + ' (' + fs.statSync(outPath).size + ' bytes)');
