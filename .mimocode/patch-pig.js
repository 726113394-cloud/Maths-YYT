/* 吊猪搬到目录页；模块练习里不再展示；左上角靶标换成像素猪 */
const fs = require('fs');
const path = require('path');

const DIR = 'C:\\Users\\Administrator\\Desktop\\数学思维闯关';
const MOD = path.join(DIR, '数学思维闯关.html');
const ST = path.join(DIR, 'index.html');
const PIG = 'C:\\Users\\Administrator\\Downloads\\像素猪.gif';

/* ---------- 1. 先把吊猪的大图取出来（改模块之前） ---------- */
let m = fs.readFileSync(MOD, 'utf8');
const re = /<img class="mascot" id="mascotImg" src="(data:image\/gif;base64,[^"]+)"[^>]*>/;
const hit = m.match(re);
if (!hit) throw new Error('没找到吊猪 img');
const PIG_HANG = hit[1];
console.log('取到吊猪 ' + Math.round(PIG_HANG.length / 1024) + 'KB');

/* ---------- 2. 模块：删掉练习页的吊猪 ---------- */
m = m.replace(re, '<!-- 吊猪已经搬到目录页（站台首页），练习页不再展示 -->');
/* pigSet 里对 null 要有兜底，不然 mascotImg 没了会报错 */
if (m.indexOf("const el = $('mascotImg');") >= 0) {
  m = m.split("const el = $('mascotImg');").join("const el = $('mascotImg');\n  if (!el) return;");
  console.log('OK  pigSet 加空值兜底');
}
fs.writeFileSync(MOD, m, 'utf8');
console.log('OK  模块去掉吊猪  ' + Math.round(fs.statSync(MOD).size / 1024) + 'KB');

/* ---------- 3. 像素猪 base64 ---------- */
const pigBuf = fs.readFileSync(PIG);
const PIG_PIXEL = 'data:image/gif;base64,' + pigBuf.toString('base64');
console.log('像素猪 ' + Math.round(pigBuf.length / 1024) + 'KB -> base64 ' +
            Math.round(PIG_PIXEL.length / 1024) + 'KB');

/* ---------- 4. 站台：首页放吊猪 + 靶标换像素猪 ---------- */
let s = fs.readFileSync(ST, 'utf8');
function sub(a, b, l) {
  const n = s.split(a).length - 1;
  if (n !== 1) throw new Error('锚点「' + l + '」出现 ' + n + ' 次');
  s = s.replace(a, b); console.log('OK  ' + l);
}

/* 4.1 吊猪放到首页标题上方 */
sub(`    <h1 class="home-h">数学思维站台</h1>`,
`    <div class="home-pig"><img src="${PIG_HANG}" alt="吊猪"></div>
    <h1 class="home-h">数学思维站台</h1>`, '首页吊猪');

/* 4.2 CSS：首页吊猪 + 像素猪图标 */
sub(`/* ===== 目录页 ===== */`,
`/* ===== 首页吊猪：从练习页搬过来的那只 ===== */
.home-pig{display:flex;justify-content:center;margin:2px 0 8px;}
.home-pig img{width:92px;height:auto;filter:drop-shadow(0 6px 12px rgba(150,110,200,.28));}
html[data-perf="low"] .home-pig img{filter:none;}
@media (max-width:380px){ .home-pig img{width:76px;} }

/* ===== 像素猪：左上角那个按钮的图标 ===== */
.pig-ico{
  display:block;flex:none;
  background-image:url(${PIG_PIXEL});
  background-size:contain;background-repeat:no-repeat;background-position:center;
  image-rendering:pixelated;
}
.menu-fab .pig-ico{width:34px;height:34px;}
.brand-ico.pig-ico{width:34px;height:34px;font-size:0;}

/* ===== 目录页 ===== */`, '吊猪与像素猪 CSS');

/* 4.3 靶标 -> 像素猪 */
sub(`  <span class="fab-ico">🎯</span>`, `  <span class="pig-ico"></span>`, '按钮换像素猪');
sub(`    <span class="brand-ico">🎯</span>`, `    <span class="brand-ico pig-ico"></span>`, '抽屉品牌图标');

/* 4.4 文案里的 🎯 改成小猪 */
sub(`<p class="sublead">点左上角 🎯 可以随时切换</p>`,
    `<p class="sublead">点左上角的小猪可以随时切换</p>`, '副标题文案');
sub(`<div class="pfoot">点左上角 🎯 随时切换练习，不用记网址、不用刷新。</div>`,
    `<div class="pfoot">点左上角的小猪随时切换练习，不用记网址、不用刷新。</div>`, '抽屉脚注');
sub(`      <p>🎯 点左上角随时换练习，不用重开页面、不用记网址。</p>`,
    `      <p>🐷 点左上角的小猪随时换练习，不用重开页面、不用记网址。</p>`, '怎么用文案');
sub(`    { ico: '🎯', h: '左上角这个靶子，管着一切',`,
    `    { ico: '🐷', h: '左上角这只小猪，管着一切',`, '导览标题');
sub(`  var name = '🎯 '`, `  var name = '🐷 '`, 'op-noop');

fs.writeFileSync(ST, s, 'utf8');
console.log('OK  站台改完  ' + Math.round(fs.statSync(ST).size / 1024) + 'KB');
