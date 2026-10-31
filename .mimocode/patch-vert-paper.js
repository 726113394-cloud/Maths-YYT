/* 竖式页两处小改：方格纸底纹 + 缩短题干（避免「来。」孤字成行） */
const fs = require('fs');
const FILE = 'C:\\Users\\Administrator\\Desktop\\数学思维闯关\\竖式练习台.html';
let s = fs.readFileSync(FILE, 'utf8');

function rep(from, to, label, mustOnce) {
  const n = s.split(from).length - 1;
  if (n === 0) { console.log('MISS ' + label); return false; }
  if (mustOnce !== false && n !== 1) { console.log('SKIP ' + label + ' (出现 ' + n + ' 次)'); return false; }
  s = s.split(from).join(to);
  console.log('OK   ' + label);
  return true;
}

rep(
`.vs{display:grid;justify-content:center;align-items:center;
  --vc:30px;--vb:16px;--vr:36px;grid-auto-rows:var(--vr);`,
`.vs{display:grid;justify-content:center;align-items:center;
  --vc:30px;--vb:16px;--vr:34px;grid-auto-rows:var(--vr);
  /* 淡横线当方格纸：空格子表示「等着填」，不是坏掉了 */
  background-image:repeating-linear-gradient(to bottom,
    transparent 0,transparent calc(var(--vr) - 1px),
    rgba(124,92,255,.075) calc(var(--vr) - 1px),rgba(124,92,255,.075) var(--vr));
  background-position:0 var(--vr);`,
  '方格纸底纹');

rep(
`    ? \`用竖式计算 <b>\${p.a} ÷ \${p.b}</b>，跟着步骤把竖式填出来。\`
    : '';`,
`    ? \`用竖式计算 <b>\${p.a} ÷ \${p.b}</b>。跟着步骤填竖式。\`
    : '';`,
  '缩短题干', false);

fs.writeFileSync(FILE, s, 'utf8');
console.log('WROTE ' + FILE);
