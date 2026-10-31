/* 给站台外壳打补丁：动效 + 分级渲染。只改外壳，不碰 <template> 里的模块。 */
const fs = require('fs');
const path = require('path');

const FILE = 'C:\\Users\\Administrator\\Desktop\\数学思维闯关\\数学思维站台.html';
let s = fs.readFileSync(FILE, 'utf8');

function once(needle, label) {
  const n = s.split(needle).length - 1;
  if (n !== 1) throw new Error(`锚点「${label}」出现 ${n} 次，应为 1 次`);
  return s.indexOf(needle);
}

/* ---------- 1. 追加 CSS（插在站台自己的第一个 </style> 之前） ---------- */
const CSS = `
/* ============================================================
   动效 + 分级渲染（沿用「来自太空的英语站台」那一套）
   · 装饰动画全部包在 prefers-reduced-motion: no-preference 里
   · 低配走 html[data-perf="low"]，只留必要过渡
   · html[data-motion="off"] 是「减少动效」偏好的等价开关
   ============================================================ */
html[data-motion="off"] *,
html[data-motion="off"] *::before,
html[data-motion="off"] *::after{
  animation-duration:.001ms !important;animation-iteration-count:1 !important;
  transition-duration:.001ms !important;
}

/* ---- 首屏遮罩：脚本一起来就淡出，避免先看到裸骨架 ---- */
#bootMask{position:fixed;inset:0;z-index:9998;display:flex;align-items:center;justify-content:center;
  background:linear-gradient(160deg,#ffe7bd 0%,#ffd8e7 40%,#ddd6ff 72%,#ffffff 100%);
  transition:opacity .26s ease;}
#bootMask.off{opacity:0;pointer-events:none;}

/* ---- 目录页入场 ---- */
@keyframes cardIn{from{opacity:0;transform:translate3d(0,16px,0) scale(.97);}to{opacity:1;transform:none;}}
@keyframes headIn{from{opacity:0;transform:translate3d(0,10px,0);}to{opacity:1;transform:none;}}
@media(prefers-reduced-motion:no-preference){
  html[data-perf="high"]:not([data-motion="off"]) #home.in .home-h{animation:headIn .44s cubic-bezier(.22,1.12,.34,1) both;}
  html[data-perf="high"]:not([data-motion="off"]) #home.in .lead{animation:headIn .44s cubic-bezier(.22,1.12,.34,1) .06s both;}
  html[data-perf="high"]:not([data-motion="off"]) #home.in .sublead{animation:headIn .44s cubic-bezier(.22,1.12,.34,1) .1s both;}
  html[data-perf="high"]:not([data-motion="off"]) #home.in .card{
    animation:cardIn .52s cubic-bezier(.22,1.12,.34,1) both;
    animation-delay:calc(var(--i,0) * 92ms + .14s);
  }
  html[data-perf="mid"]:not([data-motion="off"]) #home.in .card{animation:cardIn .26s ease both;}
}
html[data-perf="low"] .card,html[data-perf="low"] .home-h{animation:none !important;}

/* ---- 抽屉条目依次滑入（跟英语站台同一条曲线） ---- */
@keyframes pIn{0%{opacity:0;transform:translate3d(-26px,0,0) scale(.955);}
  60%{opacity:1;}100%{opacity:1;transform:none;}}
@media(prefers-reduced-motion:no-preference){
  html[data-perf="high"]:not([data-motion="off"]) .panel.open .anim-in{
    animation:pIn .62s cubic-bezier(.2,1.14,.32,1) both;
    animation-delay:calc(var(--i,0) * 46ms);
  }
}
html[data-perf="low"] .panel.open .anim-in{animation:none !important;}

/* ---- 工具 iframe：淡入 / 淡出 + 加载遮罩 ---- */
.tool-frame{opacity:1;transition:opacity .22s ease;}
.tool-frame.pending,.tool-frame.out{opacity:0;}
html[data-perf="low"] .tool-frame{transition:none;}

.view-loading{position:absolute;inset:0;z-index:40;display:flex;align-items:center;justify-content:center;
  background:rgba(255,251,242,.92);opacity:0;pointer-events:none;transition:opacity .24s ease;}
.view-loading.on{opacity:1;pointer-events:auto;}
.tl-card{display:flex;flex-direction:column;align-items:center;gap:10px;padding:20px 26px;border-radius:18px;
  max-width:78%;background:#fff;border:1px solid rgba(120,90,180,.10);
  box-shadow:0 18px 40px -18px rgba(90,60,150,.35);color:#4B3A6B;text-align:center;}
.tl-card b{font-size:15px;font-weight:900;}
.tl-card small{font-size:12px;color:#8B7FD0;line-height:1.55;font-weight:700;}
.tl-dot{width:32px;height:32px;border-radius:50%;border:3px solid rgba(107,76,230,.18);
  border-top-color:#6B4CE6;animation:tlSpin .9s linear infinite;}
.tl-bar{position:relative;display:block;width:190px;height:6px;border-radius:99px;
  background:rgba(107,76,230,.14);overflow:hidden;}
.tl-bar em{position:absolute;top:0;left:-40%;width:40%;height:100%;border-radius:99px;
  background:linear-gradient(90deg,#8B6BFF,#FF6B9D);animation:tlSlide 1.15s ease-in-out infinite;}
@keyframes tlSpin{to{transform:rotate(360deg);}}
@keyframes tlSlide{0%{left:-40%;}60%{left:60%;}100%{left:100%;}}
@media(prefers-reduced-motion:reduce){
  .tl-dot{animation:none;}
  .tl-bar em{animation:none;left:0;width:100%;opacity:.6;}
}
html[data-perf="low"] .tl-dot,html[data-perf="low"] .tl-bar em{animation:none;}
html[data-perf="low"] .tl-dot{border-top-color:rgba(107,76,230,.55);}
html[data-perf="low"] .tl-bar em{left:0;width:100%;opacity:.6;}

/* ---- 🎯 浮标轻呼吸（只在高配且没关动效时；抽屉开着不呼吸） ---- */
@keyframes fabBreath{0%,100%{box-shadow:0 4px 16px rgba(120,80,180,.36);}
  50%{box-shadow:0 7px 24px rgba(120,80,180,.55);}}
@media(prefers-reduced-motion:no-preference){
  html[data-perf="high"]:not([data-motion="off"]) body:not(.panel-open) .menu-fab{
    animation:fabBreath 4.4s ease-in-out infinite;
  }
}
html[data-perf="low"] .menu-fab{animation:none !important;}

/* 按下去的手感 */
.card:active,.pitem:active,.menu-fab:active{transform:scale(.975);}

/* ---- 抽屉底部的渲染档位 / 动效开关 ---- */
.pmeta{margin:8px 10px 0;font-size:11px;font-weight:800;color:#B4A9D2;line-height:1.9;}
.pmeta b{color:#6B4CE6;}
.pmeta button{border:none;background:#F3EEFF;color:#6B4CE6;font-family:inherit;
  font-size:11px;font-weight:900;border-radius:99px;padding:3px 11px;margin:0 2px;cursor:pointer;}
.pmeta button.on{background:linear-gradient(135deg,#8B6BFF,#6B4CE6);color:#fff;}
`;

const styleEnd = s.indexOf('</style>');
if (styleEnd < 0 || styleEnd > 30000) throw new Error('找不到站台自己的 </style>');
s = s.slice(0, styleEnd) + CSS + s.slice(styleEnd);
console.log('CSS  +' + CSS.length + ' chars');

/* ---------- 2. 首屏遮罩 + 抽屉底部那行 ---------- */
/* 站台的 <body> 是文档里第一个（模板里的模块也有 <body>，不能误伤） */
const bodyAt = s.indexOf('<body>');
if (bodyAt < 0 || bodyAt > 60000) throw new Error('找不到站台的 <body>');
s = s.slice(0, bodyAt + '<body>'.length) + '\n<div id="bootMask"></div>' + s.slice(bodyAt + '<body>'.length);

const pfootAnchor = `<div class="pfoot">点左上角 🎯 随时切换练习，不用记网址、不用刷新。</div>`;
if (s.split(pfootAnchor).length - 1 !== 1) throw new Error('.pfoot 锚点不唯一');
s = s.replace(pfootAnchor, pfootAnchor + `
  <div class="pmeta" id="pmeta">渲染 <b id="perfName">流畅</b> · 动效
    <button id="motionBtn" aria-pressed="true">开</button>
  </div>`);
console.log('HTML +bootMask +pmeta');

/* ---------- 3. 换掉站台脚本 ---------- */
const JS = `<script>
/* =========================================================
   站台：目录 ⇄ 工具
   动效与分级渲染沿用「来自太空的英语站台」：
   · 弱机判定只认 ≤2 核 / ≤2G / 省流量（≤4 会把好机器一起降级）
   · 「减少动效」是偏好，单独走 data-motion，不影响画质判断
   ========================================================= */
(function () {
  var stage = document.getElementById('stage');
  var home = document.getElementById('home');
  var panel = document.getElementById('panel');
  var mask = document.getElementById('panelMask');
  var menuBtn = document.getElementById('menuBtn');
  var NAMES = { math: '数学思维闯关', vert: '竖式练习台' };
  var PERF_NAME = { low: '精简', mid: '标准', high: '流畅' };

  /* ---------- 分级渲染 ---------- */
  var PERF = 'high', MOTION = 'on';
  try {
    var cores = navigator.hardwareConcurrency;
    var mem = navigator.deviceMemory;
    var conn = navigator.connection || {};
    var verySmall = (typeof cores === 'number' && cores <= 2) ||
                    (typeof mem === 'number' && mem <= 2) ||
                    conn.saveData === true ||
                    /^(slow-)?2g$/.test(String(conn.effectiveType || ''));
    var small = (typeof cores === 'number' && cores <= 4) ||
                (typeof mem === 'number' && mem <= 4);
    PERF = verySmall ? 'low' : (small ? 'mid' : 'high');
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) MOTION = 'off';
  } catch (e) {}
  try {
    var saved = localStorage.getItem('math4a.motion');
    if (saved === 'off' || saved === '"off"') MOTION = 'off';
    if (saved === 'on' || saved === '"on"') MOTION = 'on';
  } catch (e) {}
  var root = document.documentElement;
  root.dataset.perf = PERF;
  root.dataset.motion = MOTION;
  window.__perf = PERF;

  function paintPerf() {
    var tag = document.getElementById('perfName');
    if (tag) tag.textContent = PERF_NAME[PERF] || PERF;
    var btn = document.getElementById('motionBtn');
    if (btn) {
      btn.textContent = MOTION === 'off' ? '关' : '开';
      btn.classList.toggle('on', MOTION === 'off');
      btn.setAttribute('aria-pressed', MOTION === 'off' ? 'true' : 'false');
    }
  }

  /* 把动效偏好同步进工具页，两边保持一致 */
  function syncMotionIn(el, tries) {
    try {
      var d = el.contentDocument;
      if (d && d.documentElement) {
        d.documentElement.dataset.motion = MOTION;
        return;
      }
    } catch (e) {}
    if ((tries || 0) < 8) setTimeout(function () { syncMotionIn(el, (tries || 0) + 1); }, 180);
  }

  /* ---------- 目录 / 抽屉 ---------- */
  function setMenu(on) {
    panel.classList.toggle('open', on);
    mask.classList.toggle('on', on);
    menuBtn.classList.toggle('open', on);
    menuBtn.setAttribute('aria-expanded', on ? 'true' : 'false');
    document.body.classList.toggle('panel-open', on);
  }

  function markItems(key) {
    var all = panel.querySelectorAll('.pitem[data-tool]');
    for (var i = 0; i < all.length; i++) {
      all[i].classList.toggle('on', all[i].dataset.tool === key);
    }
  }

  /* ---------- 工具切换 ---------- */
  var frame = null;
  var current = null;
  var veil = null;

  function veilOn() {
    if (!veil) {
      veil = document.createElement('div');
      veil.className = 'view-loading';
      veil.setAttribute('role', 'status');
      veil.setAttribute('aria-live', 'polite');
      veil.innerHTML = '<div class="tl-card"><span class="tl-dot"></span>' +
        '<b>正在准备工具…</b><i class="tl-bar"><em></em></i>' +
        '<small>第一次进入要解析整份代码，稍等一下</small></div>';
      stage.appendChild(veil);
    }
    veil.classList.add('on');
    clearTimeout(veil._t);
    veil._t = setTimeout(veilOff, 6000);     /* 兜底：load 一直不来也不能挡死 */
  }
  function veilOff() {
    if (!veil) return;
    clearTimeout(veil._t);
    veil.classList.remove('on');
  }

  function showTool(key) {
    var tpl = document.getElementById('tpl-' + key);
    if (!tpl) return;
    if (current === key) { setMenu(false); return; }

    if (frame) {                              /* 旧的先淡出，再拆 */
      var old = frame;
      old.classList.add('out');
      setTimeout(function () { if (old.parentNode) old.parentNode.removeChild(old); }, 230);
      frame = null;
    }

    veilOn();
    var el = document.createElement('iframe');
    el.className = 'tool-frame pending';
    el.setAttribute('title', NAMES[key] || key);
    /* 整份源码写进 srcdoc：两个练习各自独立，样式和变量不会互相踩 */
    el.srcdoc = tpl.innerHTML;
    stage.appendChild(el);

    var shown = false;
    var put = function () {
      if (shown) return;
      shown = true;
      el.classList.remove('pending');
      veilOff();
      syncMotionIn(el, 0);
    };
    el.addEventListener('load', function () { setTimeout(put, 40); });
    setTimeout(put, 1800);                   /* 兜底：load 没触发也不能空着 */

    home.classList.remove('in');
    home.style.display = 'none';
    document.body.classList.add('tool-open');
    current = key;
    markItems(key);
    setMenu(false);
  }

  function goHome() {
    if (frame && frame.parentNode) frame.parentNode.removeChild(frame);
    frame = null;
    current = null;
    veilOff();
    home.style.display = '';
    /* 重新触发一次入场动画 */
    home.classList.remove('in');
    void home.offsetWidth;
    home.classList.add('in');
    document.body.classList.remove('tool-open');
    markItems(null);
    setMenu(false);
    home.scrollTop = 0;
  }

  /* ---------- 绑定 ---------- */
  menuBtn.addEventListener('click', function () {
    setMenu(!panel.classList.contains('open'));
  });
  mask.addEventListener('click', function () { setMenu(false); });
  document.getElementById('homeItem').addEventListener('click', goHome);

  var items = panel.querySelectorAll('.pitem[data-tool]');
  for (var i = 0; i < items.length; i++) {
    (function (b, idx) {
      b.style.setProperty('--i', idx);
      b.classList.add('anim-in');
      b.addEventListener('click', function () { showTool(b.dataset.tool); });
    })(items[i], i);
  }
  var brand = panel.querySelector('.brand');
  if (brand) brand.classList.add('anim-in');

  var cards = home.querySelectorAll('.card[data-tool]');
  for (var j = 0; j < cards.length; j++) {
    (function (b, idx) {
      b.style.setProperty('--i', idx);
      b.addEventListener('click', function () { showTool(b.dataset.tool); });
    })(cards[j], j);
  }

  var mBtn = document.getElementById('motionBtn');
  if (mBtn) mBtn.addEventListener('click', function () {
    MOTION = MOTION === 'off' ? 'on' : 'off';
    root.dataset.motion = MOTION;
    try { localStorage.setItem('math4a.motion', MOTION); } catch (e) {}
    paintPerf();
    if (frame) syncMotionIn(frame, 0);
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') setMenu(false);
  });

  /* ---------- 启动 ---------- */
  paintPerf();
  requestAnimationFrame(function () {
    home.classList.add('in');
    var bm = document.getElementById('bootMask');
    if (bm) {
      bm.classList.add('off');
      setTimeout(function () { if (bm.parentNode) bm.parentNode.removeChild(bm); }, 320);
    }
  });
})();
</` + `script>`;

const lastOpen = s.lastIndexOf('<script>');
const lastClose = s.lastIndexOf('</' + 'script>');
if (lastOpen < 0 || lastClose < lastOpen) throw new Error('找不到站台脚本块');
if (s.slice(lastOpen, lastClose).indexOf('目录') < 0 && s.slice(lastOpen, lastClose).indexOf('showTool') < 0) {
  throw new Error('最后那个 script 不像站台脚本，停手');
}
s = s.slice(0, lastOpen) + JS + '\n</body>\n</html>\n';
console.log('JS    swapped');

fs.writeFileSync(FILE, s, 'utf8');
console.log('WROTE ' + FILE + '  (' + (fs.statSync(FILE).size / 1024).toFixed(0) + ' KB)');
