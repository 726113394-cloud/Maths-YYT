/* 站台设置收进二级界面 + 教学动画加主动按钮 + 首次默认改成 流畅/默认/倾斜关 */
const fs = require('fs');
const FILE = 'C:\\Users\\Administrator\\Desktop\\数学思维闯关\\index.html';
let s = fs.readFileSync(FILE, 'utf8');
function sub(a, b, l) {
  const n = s.split(a).length - 1;
  if (n !== 1) throw new Error('锚点「' + l + '」出现 ' + n + ' 次');
  s = s.replace(a, b); console.log('OK  ' + l);
}

/* ---------- 1. 把抽屉里的设置整块搬走，换成一个按钮 ---------- */
const psAt = s.indexOf('  <div class="pset">');
if (psAt < 0) throw new Error('找不到 .pset');
const asideAt = s.indexOf('</aside>', psAt);
if (asideAt < 0) throw new Error('找不到 </aside>');
const moved = s.slice(s.indexOf('<div class="pset">', psAt), asideAt);   /* 整块设置，稍后塞进二级界面 */
if (moved.indexOf('segRender') < 0) throw new Error('搬错东西了');
s = s.slice(0, psAt) +
    `  <button class="pitem" id="setBtn">
    <span class="pico">⚙️</span><span class="plb">站台设置</span><span class="pgo">›</span>
  </button>
` + s.slice(asideAt);
console.log('OK  抽屉换成设置按钮');

/* 把搬出来的内容改成二级界面的主体（去掉外边那层 .pset 包裹里的标题，改由界面自己给） */
let sheetBody = moved
  .replace(`<div class="pset-h">站台设置</div>`, '')
  .replace(/^\s*<div class="pset">/, '')
  .replace(/<\/div>\s*$/, '');

/* ---------- 2. 二级界面：节点 ---------- */
sub(`<main id="stage">`,
`<div class="setmask" id="setMask"></div>
<div class="setsheet" id="setSheet" role="dialog" aria-modal="true" aria-label="站台设置" aria-hidden="true">
  <div class="sethead">
    <b>⚙️ 站台设置</b>
    <button class="setclose" id="setClose" type="button" aria-label="关闭">✕</button>
  </div>
  <p class="setsub">改完立刻生效，也会一起带进两个练习里</p>
${sheetBody}
</div>

<main id="stage">`, '二级界面节点');

/* ---------- 3. CSS ---------- */
sub(`.pset-note{font-size:10.5px;font-weight:700;color:#B4A9D2;line-height:1.6;
  padding:0 8px;text-align:center;}`,
`.pset-note{font-size:10.5px;font-weight:700;color:#B4A9D2;line-height:1.6;
  padding:0 8px;text-align:center;}

/* ===== 站台设置：二级界面（抽屉里只留一个入口按钮） ===== */
.setmask{position:fixed;inset:0;z-index:900;background:rgba(28,18,48,.52);
  opacity:0;pointer-events:none;transition:opacity .24s;}
.setmask.on{opacity:1;pointer-events:auto;}
.setsheet{
  position:fixed;left:0;right:0;bottom:0;z-index:901;
  width:100%;max-width:520px;margin:0 auto;
  max-height:88vh;overflow-y:auto;-webkit-overflow-scrolling:touch;
  background:#fff;border-radius:26px 26px 0 0;
  padding:16px 16px calc(26px + env(safe-area-inset-bottom));
  box-shadow:0 -14px 44px rgba(40,24,70,.3);
  transform:translateY(104%);transition:transform .32s cubic-bezier(.3,1.1,.52,1);
}
.setsheet.on{transform:translateY(0);}
.sethead{display:flex;align-items:center;gap:8px;margin-bottom:3px;}
.sethead b{font-size:16.5px;font-weight:900;color:#3a3355;letter-spacing:.3px;}
.setclose{margin-left:auto;flex:none;width:38px;height:38px;border:none;border-radius:50%;
  background:#F3EFFF;color:#6B4CE6;font-family:inherit;font-size:15px;font-weight:900;
  cursor:pointer;transition:transform .15s;}
.setclose:active{transform:scale(.92);}
.setsub{margin:0 0 14px;font-size:11.5px;font-weight:700;color:#A79FC2;line-height:1.6;}

/* ===== 首页上的教学动画按钮（不再藏在抽屉里） ===== */
.home-tut{margin:0 0 12px;}
.home-tut button{
  width:100%;min-height:48px;border:1.5px dashed #C9B8F0;border-radius:14px;
  background:rgba(255,255,255,.72);color:#6B4CE6;
  font-family:inherit;font-size:13px;font-weight:900;letter-spacing:.3px;
  cursor:pointer;transition:transform .15s,background .18s;
}
.home-tut button:hover{background:#fff;}
.home-tut button:active{transform:scale(.98);}
html[data-perf="low"] .home-tut button{background:#fff;border-style:solid;}`, '二级界面 CSS');

/* ---------- 4. 首页教学按钮 ---------- */
sub(`    <p class="sublead">点左上角 🎯 可以随时切换</p>`,
`    <p class="sublead">点左上角 🎯 可以随时切换</p>
    <div class="home-tut"><button id="tourReplay" type="button">🎬 教学动画：30 秒学会用这个站台</button></div>`, '首页教学按钮');

/* ---------- 5. 默认档：渲染流畅 / 动画默认 / 倾斜关 ---------- */
sub(`  var RENDER_PREF = loadPref('render', ['high', 'auto', 'smooth'], 'auto');
  var MOTION_PREF = loadPref('motion', ['full', 'auto', 'off'], 'auto');
  var TILT_PREF = loadPref('tilt', ['on', 'off'], 'on');`,
`  /* 首次打开的默认：渲染「流畅」、动画「默认」、倾斜「关」。
     学生九成用手机，先给最省的一档；想要效果的在设置里往上调。 */
  var RENDER_PREF = loadPref('render', ['high', 'auto', 'smooth'], 'smooth');
  var MOTION_PREF = loadPref('motion', ['full', 'auto', 'off'], 'auto');
  var TILT_PREF = loadPref('tilt', ['on', 'off'], 'off');`, '默认档改流畅/关倾斜');

/* ---------- 6. JS：二级界面的开合 ---------- */
sub(`  document.getElementById('homeItem').addEventListener('click', goHome);`,
`  document.getElementById('homeItem').addEventListener('click', goHome);

  /* ---- 站台设置：一个按钮触发二级界面 ---- */
  var setSheet = document.getElementById('setSheet');
  var setMask = document.getElementById('setMask');
  function openSettings() {
    if (!setSheet) return;
    closeFactsLike();
    setSheet.classList.add('on');
    setMask.classList.add('on');
    setSheet.setAttribute('aria-hidden', 'false');
    setMenu(false);
  }
  function closeSettings() {
    if (!setSheet) return;
    setSheet.classList.remove('on');
    setMask.classList.remove('on');
    setSheet.setAttribute('aria-hidden', 'true');
  }
  /* 抽屉里的其它入口打开时先把设置收掉，别叠两层 */
  function closeFactsLike() { closeSettings(); }
  var setBtn = document.getElementById('setBtn');
  if (setBtn) setBtn.addEventListener('click', openSettings);
  var setClose = document.getElementById('setClose');
  if (setClose) setClose.addEventListener('click', closeSettings);
  if (setMask) setMask.addEventListener('click', closeSettings);`, '二级界面开合');

/* Esc 也要能关设置；钥匙顺序：设置 → 抽屉 */
sub(`  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') setMenu(false);
  });`,
`  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (setSheet && setSheet.classList.contains('on')) { closeSettings(); return; }
    setMenu(false);
  });`, 'Esc 关设置');

/* ---------- 7. 教学动画的主动按钮 + 更新那一句文案 ---------- */
sub(`  var tourBtn = document.getElementById('tourBtn');
  if (tourBtn) tourBtn.addEventListener('click', function () {
    setMenu(false);
    tourStart();
  });`,
`  function tourStartFromUi() { setMenu(false); closeSettings(); tourStart(); }
  var tourBtn = document.getElementById('tourBtn');
  if (tourBtn) tourBtn.addEventListener('click', tourStartFromUi);
  var tourReplay = document.getElementById('tourReplay');
  if (tourReplay) tourReplay.addEventListener('click', tourStartFromUi);`, '主动按钮');

sub(`      p: '抽屉里有 <b>目录</b>、两个练习、<b>拓展提高</b>，最下面是站台设置。点任意一条就切过去，不用刷新。',`,
    `      p: '抽屉里有 <b>目录</b>、两个练习、<b>拓展提高</b>，还有 <b>⚙️ 站台设置</b> 和 <b>🎬 看教学动画</b>。点任意一条就切过去，不用刷新。',`, '文案更新');

sub(`      p: '抽屉最下面：渲染分 <b>高级 / 默认 / 流畅</b>，动画分 <b>全量 / 默认 / 关闭</b>。默认档看手机性能自动调；手机卡就往下调一档。',`,
    `      p: '点抽屉里的 <b>⚙️ 站台设置</b>，会弹出一个设置页：渲染分 <b>高级 / 默认 / 流畅</b>，动画分 <b>全量 / 默认 / 关闭</b>。手机卡就往下调一档。',`, '设置文案');

fs.writeFileSync(FILE, s, 'utf8');
console.log('WROTE ' + FILE + '  (' + (fs.statSync(FILE).size / 1024).toFixed(0) + ' KB)');
