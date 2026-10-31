/* 高级渲染：照 Gost 的液态玻璃卡片 + 跟随光斑 + 卡片倾斜 */
const fs = require('fs');
const FILE = 'C:\\Users\\Administrator\\Desktop\\数学思维闯关\\index.html';
let s = fs.readFileSync(FILE, 'utf8');

function once(n, label) {
  const c = s.split(n).length - 1;
  if (c !== 1) throw new Error('锚点「' + label + '」出现 ' + c + ' 次');
  return s.indexOf(n);
}

/* ---------- 1. CSS ---------- */
const cssAnchor = `html[data-perf="low"] .menu-fab{box-shadow:0 3px 10px rgba(120,80,180,.3);}`;
once(cssAnchor, 'low menu-fab');

const GLASS = `
/* ============================================================
   高级渲染：液态玻璃卡片 / 跟随光斑 / 卡片倾斜
   做法照 https://726113394-cloud.github.io/Gost/ ：
     · 玻璃面  rgba(255,255,255,.5x) + backdrop-filter blur+saturate
                 + 顶部 1px 高光 + inset 阴影（Gost 的 .card）
     · 光斑    radial-gradient 跟着指针走，mix-blend-mode:screen（Gost 的 .tilt-glare）
     · 倾斜    pointermove 里写 rotateX/rotateY，只写 transform，不进布局
   配色不照抄暗色底：这是给四年级用的，保持原来的暖色，
   玻璃只是把它"变透、变亮、有厚度"。
   ⚠️ 只在「高级」+ 有精确指针（鼠标/触控板）时开启：
      手机上做倾斜既没意义又费电，光斑也跟着手指乱跳。
   ⚠️ 关掉动效（data-motion=off）时全部不出现。
   ============================================================ */
@media (hover:hover) and (pointer:fine){
  html[data-perf="high"]:not([data-motion="off"]) .card{
    position:relative;overflow:hidden;
    background:rgba(255,255,255,.52);
    -webkit-backdrop-filter:blur(22px) saturate(1.28);
    backdrop-filter:blur(22px) saturate(1.28);
    border:1px solid rgba(255,255,255,.85);
    box-shadow:0 10px 34px rgba(120,80,180,.16), inset 0 1px 0 rgba(255,255,255,.75);
    transform-style:preserve-3d;
    transition:box-shadow .42s ease, background .42s ease, border-color .42s ease;
    will-change:transform;
  }
  /* 顶部那道 1px 高光（Gost 的 .card::before） */
  html[data-perf="high"]:not([data-motion="off"]) .card::before{
    content:'';position:absolute;left:0;right:0;top:0;height:1px;z-index:2;
    background:linear-gradient(90deg,transparent,rgba(255,255,255,.95),transparent);
    opacity:.75;pointer-events:none;
  }
  /* 跟随指针的光斑 */
  html[data-perf="high"]:not([data-motion="off"]) .card .glare{
    position:absolute;inset:0;border-radius:inherit;pointer-events:none;z-index:2;
    opacity:0;transition:opacity .42s cubic-bezier(.22,1,.36,1);
    background:radial-gradient(circle at var(--gx,50%) var(--gy,50%),
      rgba(255,255,255,.62) 0%,
      rgba(255,255,255,.22) 26%,
      rgba(255,255,255,0) 62%);
    mix-blend-mode:screen;
  }
  html[data-perf="high"]:not([data-motion="off"]) .card.tilting .glare{opacity:1;}
  html[data-perf="high"]:not([data-motion="off"]) .card.tilting{
    background:rgba(255,255,255,.66);
    border-color:#fff;
    box-shadow:0 18px 48px rgba(120,80,180,.26), inset 0 1px 0 rgba(255,255,255,.9);
  }
  /* 倾斜时不要跟 hover 的位移打架 */
  html[data-perf="high"]:not([data-motion="off"]) .card:hover{transform:none;}
}

/* 背景呼吸光：高级 + 开动效时才出现（Gost 的 .bg-glow） */
#bgGlow{position:fixed;inset:-10%;z-index:0;pointer-events:none;display:none;}
html[data-perf="high"]:not([data-motion="off"]) #bgGlow{display:block;}
#bgGlow::before,#bgGlow::after{
  content:'';position:absolute;border-radius:50%;filter:blur(46px);opacity:.5;
}
#bgGlow::before{
  width:64%;height:64%;left:-8%;top:-6%;
  background:radial-gradient(circle,rgba(255,214,140,.55),rgba(255,214,140,0) 68%);
  animation:glowA 15s ease-in-out infinite alternate;
}
#bgGlow::after{
  width:60%;height:60%;right:-8%;bottom:-6%;
  background:radial-gradient(circle,rgba(198,180,255,.55),rgba(198,180,255,0) 68%);
  animation:glowB 18s ease-in-out infinite alternate;
}
@keyframes glowA{0%{transform:translate3d(0,0,0) scale(1);}100%{transform:translate3d(6%,4%,0) scale(1.18);}}
@keyframes glowB{0%{transform:translate3d(0,0,0) scale(.94);}100%{transform:translate3d(-5%,-6%,0) scale(1.14);}}
@media (prefers-reduced-motion:reduce){
  #bgGlow::before,#bgGlow::after{animation:none;}
}
`;
s = s.replace(cssAnchor, cssAnchor + GLASS);
console.log('OK  玻璃/光斑/倾斜 CSS');

/* ---------- 2. 背景光层节点 ---------- */
once('<div id="bootMask"></div>', 'bootMask');
s = s.replace('<div id="bootMask"></div>', '<div id="bootMask"></div>\n<div id="bgGlow" aria-hidden="true"></div>');
console.log('OK  背景光层');

/* ---------- 3. JS：给卡片挂光斑 + 倾斜 ---------- */
const jsAnchor = `  /* ---------- 启动 ---------- */
  renderStats();`;
once(jsAnchor, 'boot js');

const TILT = `  /* ---------- 高级渲染：玻璃光斑 + 卡片倾斜 ---------- */
  function finePointer() {
    try {
      return !!(window.matchMedia && window.matchMedia('(hover:hover) and (pointer:fine)').matches);
    } catch (e) { return false; }
  }
  function tiltEnabled() {
    return de.dataset.perf === 'high' && de.dataset.motion === 'on' && finePointer();
  }

  function mountCardFx() {
    var list = home.querySelectorAll('.card[data-tool]');
    Array.prototype.forEach.call(list, function (card) {
      if (card.dataset.fx === '1') return;
      card.dataset.fx = '1';

      var glare = document.createElement('span');
      glare.className = 'glare';
      card.appendChild(glare);

      var raf = 0, gx = 50, gy = 50;

      function paint() {
        raf = 0;
        card.style.setProperty('--gx', gx.toFixed(1) + '%');
        card.style.setProperty('--gy', gy.toFixed(1) + '%');
        var rx = (0.5 - gy / 100) * 7.5;
        var ry = (gx / 100 - 0.5) * 9.5;
        card.style.transform =
          'perspective(820px) rotateX(' + rx.toFixed(2) + 'deg) rotateY(' + ry.toFixed(2) + 'deg)';
      }

      function onMove(e) {
        if (!tiltEnabled()) return;
        var r = card.getBoundingClientRect();
        if (!r.width || !r.height) return;
        gx = Math.max(0, Math.min(100, (e.clientX - r.left) / r.width * 100));
        gy = Math.max(0, Math.min(100, (e.clientY - r.top) / r.height * 100));
        if (!card.classList.contains('tilting')) card.classList.add('tilting');
        if (!raf) raf = requestAnimationFrame(paint);
      }
      function onLeave() {
        card.classList.remove('tilting');
        card.style.transform = '';
      }

      card.addEventListener('pointermove', onMove);
      card.addEventListener('pointerleave', onLeave);
      card.addEventListener('pointercancel', onLeave);
      /* 关掉高级渲染 / 关掉动效时立刻复位，别留一个歪着的卡 */
      card.__resetFx = onLeave;
    });
  }

  function resetCardFx() {
    if (tiltEnabled()) return;
    var list = home.querySelectorAll('.card[data-tool]');
    Array.prototype.forEach.call(list, function (card) {
      if (card.__resetFx) card.__resetFx();
    });
  }

  /* ---------- 启动 ---------- */
  renderStats();
  mountCardFx();`;

s = s.replace(jsAnchor, TILT);
console.log('OK  倾斜与光斑脚本');

/* applySettings 里顺手复位 */
const applyAnchor = `    paintSettings();
    if (frame) syncSettingsIn(frame, 0);`;
once(applyAnchor, 'applySettings');
s = s.replace(applyAnchor, `    paintSettings();
    if (typeof resetCardFx === 'function') resetCardFx();
    if (frame) syncSettingsIn(frame, 0);`);

fs.writeFileSync(FILE, s, 'utf8');
console.log('WROTE ' + FILE + '  (' + (fs.statSync(FILE).size / 1024).toFixed(0) + ' KB)');
