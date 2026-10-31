/* 站台教学动画：聚光灯高亮真实控件 + 一步一步边讲边演示 */
const fs = require('fs');
const FILE = 'C:\\Users\\Administrator\\Desktop\\数学思维闯关\\index.html';
let s = fs.readFileSync(FILE, 'utf8');

const MARK = '/* ===== 教学动画（新手导览）===== */';
if (s.indexOf(MARK) >= 0) { console.log('已存在，跳过'); process.exit(0); }
function once(n, label) {
  const c = s.split(n).length - 1;
  if (c !== 1) throw new Error('锚点「' + label + '」出现 ' + c + ' 次');
  return s.indexOf(n);
}

/* ---------------- 1. CSS ---------------- */
const cssAnchor = `#stToast.on{opacity:1;transform:translate(-50%,0);}`;
once(cssAnchor, 'toast css');
s = s.replace(cssAnchor, cssAnchor + `

${MARK}
/* 聚光灯用 box-shadow 的 9999px 外扩做"挖洞"：
   不需要四块遮罩拼，也不会在圆角处露缝。 */
.tour{position:fixed;inset:0;z-index:990;display:none;}
.tour.on{display:block;}
.tour-ring{
  position:fixed;z-index:991;pointer-events:none;border-radius:16px;
  box-shadow:0 0 0 9999px rgba(28,18,48,.66), 0 0 0 2.5px rgba(255,255,255,.92);
  transition:top .34s cubic-bezier(.22,1,.36,1), left .34s cubic-bezier(.22,1,.36,1),
             width .34s cubic-bezier(.22,1,.36,1), height .34s cubic-bezier(.22,1,.36,1);
}
.tour-ring::after{
  content:'';position:absolute;inset:-6px;border-radius:20px;
  border:2px solid rgba(255,214,120,.85);
  animation:tourPulse 1.8s ease-in-out infinite;
}
@keyframes tourPulse{0%,100%{opacity:.35;transform:scale(1);}50%{opacity:1;transform:scale(1.04);}}
html[data-motion="off"] .tour-ring::after{animation:none;opacity:.7;}

.tour-card{
  position:fixed;z-index:992;left:50%;transform:translateX(-50%);
  width:min(430px, calc(100vw - 28px));
  background:#fff;border-radius:20px;padding:16px 18px 13px;
  box-shadow:0 18px 48px rgba(30,18,60,.34);
  border:2px solid rgba(255,255,255,.9);
  transition:top .3s cubic-bezier(.22,1,.36,1), opacity .2s ease;
}
.tour-ico{font-size:24px;line-height:1;display:block;margin-bottom:6px;}
.tour-h{margin:0 0 6px;font-size:16px;font-weight:900;color:#3a3355;letter-spacing:.3px;}
.tour-p{margin:0 0 12px;font-size:13px;line-height:1.85;font-weight:700;color:#5E5580;}
.tour-p b{color:#6B4CE6;font-weight:900;}
.tour-foot{display:flex;align-items:center;gap:8px;}
.tour-dots{display:flex;gap:5px;flex:1;flex-wrap:wrap;}
.tour-dots i{width:6px;height:6px;border-radius:50%;background:#DED6F5;display:block;}
.tour-dots i.on{background:#6B4CE6;transform:scale(1.35);}
.tour-btn{
  border:none;border-radius:12px;font-family:inherit;font-size:13px;font-weight:900;
  min-height:42px;padding:0 16px;cursor:pointer;
  background:#F3EFFF;color:#6B4CE6;
}
.tour-btn:active{transform:scale(.96);}
.tour-btn.main{background:linear-gradient(135deg,#8B6BFF,#6B4CE6);color:#fff;
  box-shadow:0 3px 0 #4E35C4;min-width:92px;}
.tour-btn:disabled{opacity:.4;}
.tour-skip{
  position:fixed;z-index:992;right:14px;top:14px;border:none;border-radius:99px;
  background:rgba(255,255,255,.18);color:#fff;font-family:inherit;
  font-size:12.5px;font-weight:900;padding:8px 14px;cursor:pointer;
}
`);
console.log('OK  CSS');

/* ---------------- 2. 节点 ---------------- */
once('<div id="stToast" role="status" aria-live="polite"></div>', 'toast node');
s = s.replace('<div id="stToast" role="status" aria-live="polite"></div>',
`<div id="stToast" role="status" aria-live="polite"></div>
<div class="tour" id="tour" aria-hidden="true">
  <div class="tour-ring" id="tourRing"></div>
  <div class="tour-card" id="tourCard" role="dialog" aria-live="polite">
    <span class="tour-ico" id="tourIco">🎯</span>
    <h3 class="tour-h" id="tourH"></h3>
    <p class="tour-p" id="tourP"></p>
    <div class="tour-foot">
      <span class="tour-dots" id="tourDots"></span>
      <button class="tour-btn" id="tourPrev" type="button">上一步</button>
      <button class="tour-btn main" id="tourNext" type="button">下一步</button>
    </div>
  </div>
  <button class="tour-skip" id="tourSkip" type="button">跳过</button>
</div>`);
console.log('OK  节点');

/* ---------------- 3. 抽屉里的"再看一遍" ---------------- */
once(`  <div class="pset">`, 'pset');
s = s.replace(`  <div class="pset">`,
`  <button class="pitem" id="tourBtn">
    <span class="pico">🎬</span><span class="plb">看教学动画</span><span class="pgo">›</span>
  </button>

  <div class="pset">`);
console.log('OK  再看一遍入口');

/* ---------------- 4. JS ---------------- */
const jsAnchor = `  /* ---------- 全文检索结束 ---------- */`;
/* 挂在启动段前面 */
const bootAnchor = `  /* ---------- 启动 ---------- */`;
once(bootAnchor, 'boot');

const TOUR = `  /* =========================================================
     教学动画（新手导览）
     讲的是"这个按钮在哪、点了会怎样"，所以每一步都去真的操作界面：
     该开抽屉就开抽屉，该收就收，聚光灯始终罩在真实控件上。
     ========================================================= */
  var TOUR_KEY = 'math4a.tourShown';
  var tourEl = document.getElementById('tour');
  var tourRing = document.getElementById('tourRing');
  var tourCard = document.getElementById('tourCard');
  var tourIdx = 0;
  var tourSteps = [
    { ico: '🎯', h: '欢迎来到数学思维站台',
      p: '这里一共 <b>3 个板块</b>：数学思维闯关、竖式练习台、拓展提高。点哪个就进哪个，不用记网址。' },
    { ico: '🎯', h: '左上角这个靶子，管着一切',
      p: '切换练习、渲染画质、动画、全屏、横屏都收在它里面。它平时是<b>半透明</b>的，不会挡住练习内容。',
      target: '#menuBtn', act: 'menu-off' },
    { ico: '📂', h: '点它，抽屉就滑出来了',
      p: '我现在<b>真的把它点开了</b> —— 看左边。上面是目录和练习，最下面是站台设置。',
      target: '#panel', act: 'menu-on' },
    { ico: '📚', h: '数学思维闯关',
      p: '每个知识点拆成几步，<b>一步一步想清楚</b>再填答案。答完一步，右下角的灯泡会亮出新的已知条件。',
      target: '.card[data-tool="math"]', act: 'menu-off' },
    { ico: '✏️', h: '竖式练习台',
      p: '试商 → 乘 → 减 → 落下，<b>一格一格</b>把除法竖式填出来。有入门、熟练、挑战三档。',
      target: '.card[data-tool="vert"]', act: 'menu-off' },
    { ico: '🚀', h: '拓展提高',
      p: '指南针与方向、几何图形与周长专练。这两块是<b>拔高</b>，学有余力再加练，课本单元那边不受影响。',
      target: '.card[data-preset="ext"]', act: 'menu-off' },
    { ico: '🎚️', h: '画质和动画都能调',
      p: '渲染分 <b>高级 / 默认 / 流畅</b>，动画分 <b>全量 / 默认 / 关闭</b>。默认档会看手机性能自动调；嫌晃或者手机卡，就往下调一档。',
      target: '#segRender', act: 'menu-on' },
    { ico: '⛶', h: '上课投屏用这两个',
      p: '<b>全屏</b>去浏览器边框；<b>横屏</b>把练习区转 90°，竖着拿手机也能用宽屏。',
      target: '#landBtn', act: 'menu-on' },
    { ico: '🚀', h: '可以开始了',
      p: '随时点左上角靶子回来换练习。这个引导在抽屉里点 <b>🎬 看教学动画</b> 还能再看一遍。',
      act: 'menu-off' }
  ];

  function tourTarget(i) {
    var t = tourSteps[i] && tourSteps[i].target;
    if (!t) return null;
    return document.querySelector(t);
  }

  function tourPaint() {
    var st = tourSteps[tourIdx];
    document.getElementById('tourIco').textContent = st.ico || '🎯';
    document.getElementById('tourH').textContent = st.h || '';
    document.getElementById('tourP').innerHTML = st.p || '';
    var dots = document.getElementById('tourDots');
    dots.innerHTML = tourSteps.map(function (_, i) {
      return '<i class="' + (i === tourIdx ? 'on' : '') + '"></i>';
    }).join('');
    document.getElementById('tourPrev').disabled = tourIdx === 0;
    document.getElementById('tourNext').textContent =
      tourIdx === tourSteps.length - 1 ? '开始使用 🚀' : '下一步';

    var el = tourTarget(tourIdx);
    requestAnimationFrame(function () {
      var vw = window.innerWidth, vh = window.innerHeight;
      var cardW = Math.min(430, vw - 28);
      if (!el) {
        /* 没有目标：聚光灯缩成一个点，卡片居中 */
        tourRing.style.top = '46%';
        tourRing.style.left = '50%';
        tourRing.style.width = '1px';
        tourRing.style.height = '1px';
        tourCard.style.top = Math.max(90, vh * 0.32) + 'px';
        return;
      }
      var r = el.getBoundingClientRect();
      var pad = 6;
      tourRing.style.top = (r.top - pad) + 'px';
      tourRing.style.left = (r.left - pad) + 'px';
      tourRing.style.width = (r.width + pad * 2) + 'px';
      tourRing.style.height = (r.height + pad * 2) + 'px';

      /* 卡片放目标下面；下面放不下就放上面 */
      var cardH = tourCard.offsetHeight || 200;
      var below = r.bottom + 16;
      var top;
      if (below + cardH < vh - 12) top = below;
      else if (r.top - cardH - 16 > 12) top = r.top - cardH - 16;
      else top = Math.max(12, (vh - cardH) / 2);
      tourCard.style.top = top + 'px';
    });
  }

  function tourGo(i) {
    if (i < 0 || i >= tourSteps.length) return tourEnd();
    tourIdx = i;
    var act = tourSteps[i].act;
    if (act === 'menu-on') setMenu(true);
    else if (act === 'menu-off') setMenu(false);
    tourPaint();
  }

  function tourStart() {
    if (!tourEl) return;
    tourEl.classList.add('on');
    tourEl.setAttribute('aria-hidden', 'false');
    s_setTourFlag();
    tourGo(0);
  }

  function tourEnd() {
    if (!tourEl) return;
    tourEl.classList.remove('on');
    tourEl.setAttribute('aria-hidden', 'true');
    setMenu(false);
  }

  function s_setTourFlag() {
    try { localStorage.setItem(TOUR_KEY, '1'); } catch (e) {}
  }
  function s_tourShown() {
    try { return localStorage.getItem(TOUR_KEY) === '1'; } catch (e) { return true; }
  }

  document.getElementById('tourNext').addEventListener('click', function () {
    if (tourIdx >= tourSteps.length - 1) return tourEnd();
    tourGo(tourIdx + 1);
  });
  document.getElementById('tourPrev').addEventListener('click', function () {
    tourGo(tourIdx - 1);
  });
  document.getElementById('tourSkip').addEventListener('click', tourEnd);
  var tourBtn = document.getElementById('tourBtn');
  if (tourBtn) tourBtn.addEventListener('click', function () {
    setMenu(false);
    tourStart();
  });
  window.addEventListener('resize', function () {
    if (tourEl && tourEl.classList.contains('on')) tourPaint();
  });
  document.addEventListener('keydown', function (e) {
    if (!tourEl || !tourEl.classList.contains('on')) return;
    if (e.key === 'Escape') tourEnd();
    else if (e.key === 'ArrowRight' || e.key === 'Enter') {
      if (tourIdx >= tourSteps.length - 1) tourEnd(); else tourGo(tourIdx + 1);
    } else if (e.key === 'ArrowLeft') tourGo(tourIdx - 1);
  });
  window.__tour = { start: tourStart, go: tourGo, idx: function () { return tourIdx; },
                    on: function () { return tourEl.classList.contains('on'); } };

  /* 第一次进来自动放一遍（放过就不再自动弹，抽屉里可以手动重看） */
  if (!s_tourShown()) {
    setTimeout(function () {
      if (!tourEl.classList.contains('on')) tourStart();
    }, 700);
  }

  /* ---------- 启动 ---------- */`;

s = s.replace(bootAnchor, TOUR);
console.log('OK  导览脚本');

fs.writeFileSync(FILE, s, 'utf8');
console.log('WROTE ' + FILE + '  (' + (fs.statSync(FILE).size / 1024).toFixed(0) + ' KB)');
