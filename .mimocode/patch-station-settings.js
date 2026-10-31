/* 站台：渲染/动画 双维度三级设置 + 全屏/横屏 + 动效照抄英语站台 */
const fs = require('fs');
const FILE = 'C:\\Users\\Administrator\\Desktop\\数学思维闯关\\数学思维站台.html';
let s = fs.readFileSync(FILE, 'utf8');

function once(n, label) {
  const c = s.split(n).length - 1;
  if (c !== 1) throw new Error('锚点「' + label + '」出现 ' + c + ' 次');
  return s.indexOf(n);
}

/* ================= 1. 抽屉里的设置区（换掉原来那个小 pmeta） ================= */
const oldMeta = `<div class="pmeta" id="pmeta">渲染 <b id="perfName">流畅</b> · 动效
    <button id="motionBtn" aria-pressed="true">开</button>
  </div>
</aside>`;
once(oldMeta, 'pmeta');

const newSet = `  <div class="pfoot">点左上角 🎯 随时切换练习，不用记网址、不用刷新。</div>

  <div class="pset">
    <div class="pset-h">站台设置</div>

    <div class="pset-row">
      <span class="pset-k">渲染</span>
      <div class="seg" id="segRender" role="group" aria-label="渲染质量">
        <button type="button" data-v="high">高级</button>
        <button type="button" data-v="auto">默认</button>
        <button type="button" data-v="smooth">流畅</button>
      </div>
    </div>

    <div class="pset-row">
      <span class="pset-k">动画</span>
      <div class="seg" id="segMotion" role="group" aria-label="动画强度">
        <button type="button" data-v="full">全量</button>
        <button type="button" data-v="auto">默认</button>
        <button type="button" data-v="off">关闭</button>
      </div>
    </div>

    <div class="pset-btns">
      <button class="sbtn" id="fsBtn" type="button">
        <span class="sico">⛶</span><span class="slb">全屏</span><span class="shint" id="fsHint">未开启</span>
      </button>
      <button class="sbtn off" id="landBtn" type="button">
        <span class="sico">🔄</span><span class="slb">横屏</span><span class="shint" id="landHint">竖屏</span>
      </button>
    </div>

    <div class="pset-note" id="psetNote">默认：按设备压力自动调节</div>
  </div>
</aside>`;
s = s.replace(oldMeta, newSet);
console.log('OK  抽屉设置区');

/* ================= 2. CSS ================= */
const cssAnchor = once(`#home .foot-hint{margin-top:16px;flex:none;}`, 'home foot-hint css');
s = s.replace(`#home .foot-hint{margin-top:16px;flex:none;}`, `#home .foot-hint{margin-top:16px;flex:none;}

/* ============================================================
   站台设置：渲染 / 动画 两个维度，各三级
   · 渲染  高级 / 默认 / 流畅   → html[data-perf] = high / mid / low
   · 动画  全量 / 默认 / 关闭   → html[data-motion] = on / off
   · 默认档按设备压力自动落档；高级/全量是强制最高，不留余地
   ============================================================ */
.pset{
  margin-top:auto;                     /* 贴底，但下面留了安全距离 */
  padding:12px 2px 2px;
  border-top:1.5px dashed #EADFF8;
}
.pset-h{font-size:11px;font-weight:900;color:#B4A9D2;letter-spacing:2px;padding:2px 8px 8px;}
.pset-row{display:flex;align-items:center;gap:8px;margin-bottom:9px;}
.pset-k{flex:none;width:38px;font-size:12.5px;font-weight:900;color:#6B5FA8;}

/* 三段选择：足够大的手指靶（学生都是手机） */
.seg{flex:1;display:flex;gap:4px;padding:4px;border-radius:14px;
  background:#F4F0FF;border:1.5px solid #E6DEFB;}
.seg button{
  flex:1 1 0;min-width:0;min-height:46px;padding:6px 2px;
  border:none;border-radius:11px;background:transparent;cursor:pointer;
  font-family:inherit;font-size:13px;font-weight:900;color:#8478BC;
  transition:background .18s,color .18s,transform .14s,box-shadow .18s;
  -webkit-tap-highlight-color:transparent;
}
.seg button:active{transform:scale(.96);}
.seg button.on{
  background:#fff;color:#6B4CE6;
  box-shadow:0 2px 0 #D8CEFF,0 4px 10px rgba(124,92,255,.18);
}
.seg button:focus-visible{outline:2px solid #8B6BFF;outline-offset:2px;}

.pset-btns{display:flex;gap:8px;margin:2px 0 9px;}
.sbtn{
  flex:1 1 0;min-width:0;min-height:58px;padding:7px 4px;
  display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1px;
  border-radius:14px;cursor:pointer;font-family:inherit;text-align:center;
  background:rgba(124,92,255,.07);border:1.5px solid rgba(124,92,255,.20);color:#4B3A6B;
  transition:transform .16s,background .2s,border-color .2s;
  -webkit-tap-highlight-color:transparent;
}
.sbtn:not(.off){background:rgba(124,92,255,.13);border-color:rgba(124,92,255,.46);}
.sbtn:active{transform:scale(.95);}
.sbtn .sico{width:24px;height:24px;border-radius:8px;font-size:14px;line-height:1;
  display:flex;align-items:center;justify-content:center;color:#fff;
  background:linear-gradient(135deg,#8B6BFF,#6B4CE6);
  transition:background .22s,transform .3s cubic-bezier(.34,1.56,.64,1);}
.sbtn.off .sico{background:rgba(124,92,255,.22);color:#6B5FA8;transform:scale(.92);}
.sbtn .slb{font-size:12.5px;font-weight:900;line-height:1.2;}
.sbtn .shint{font-size:10.5px;font-weight:700;color:#8B7FD0;line-height:1.2;}
.sbtn[hidden]{display:none;}

.pset-note{font-size:10.5px;font-weight:700;color:#B4A9D2;line-height:1.6;
  padding:0 8px;text-align:center;}

/* ===== 横屏：把 #stage 整体转 90°（手机浏览器没有强制转屏的 API） =====
   ⚠️ 用 svh/svw：100vh 在手机上含地址栏占位，转 90° 后会露出一半
   ⚠️ rotate(90deg) 把 (x,y) 映到 (-y,x)，所以要再 translateY(-100%) 才落回可见区 */
body.land #stage{
  position:fixed;left:0;top:0;
  width:100vh;height:100vw;
  width:100svh;height:100svw;
  transform:rotate(90deg) translateY(-100%);
  transform-origin:0 0;
}
/* 转过来以后浮标挪到底部，别压住旋转后内容的左上角 */
body.land .menu-fab{top:auto;bottom:12px;left:12px;}
@media (min-width:901px){ #landBtn{display:none !important;} }

/* ===== 切换工具的提示条（跟英语站台一样：进哪个说一声） ===== */
#stToast{position:fixed;left:50%;top:14px;z-index:900;
  transform:translate(-50%,-18px);opacity:0;pointer-events:none;
  padding:9px 16px;border-radius:99px;max-width:86vw;
  background:rgba(58,44,88,.92);color:#fff;
  font-size:12.5px;font-weight:800;letter-spacing:.3px;text-align:center;
  box-shadow:0 10px 24px rgba(58,44,88,.28);
  transition:opacity .22s ease,transform .22s cubic-bezier(.34,1.4,.64,1);}
#stToast.on{opacity:1;transform:translate(-50%,0);}
`);
console.log('OK  设置/横屏/提示 CSS');

/* ================= 3. 抽屉底部留白（按钮别贴边） ================= */
const panelPad = `padding:18px 14px calc(16px + env(safe-area-inset-bottom));`;
once(panelPad, 'panel padding');
s = s.replace(panelPad, `padding:18px 14px calc(30px + env(safe-area-inset-bottom));`);
console.log('OK  抽屉底部留白');

/* ================= 4. 高配才开毛玻璃 ================= */
const cardBlur = `.card{display:grid;grid-template-columns:44px 1fr;grid-template-rows:auto auto;`;
if (s.split(cardBlur).length - 1 === 1) {
  s = s.replace(cardBlur, `.card{display:grid;grid-template-columns:44px 1fr;grid-template-rows:auto auto;`);
}
/* .card 原来就带 backdrop-filter:blur(6px)；改成只有「高级」渲染才给 */
s = s.replace('backdrop-filter:blur(6px);}', 'backdrop-filter:none;}');
const afterCard = `.card:hover{transform:translateY(-3px);background:#fff;`;
if (s.split(afterCard).length - 1 === 1) {
  s = s.replace(afterCard, `html[data-perf="high"] .card{-webkit-backdrop-filter:blur(7px);backdrop-filter:blur(7px);}
.card:hover{transform:translateY(-3px);background:#fff;`);
}
console.log('OK  毛玻璃只在高级档');

/* ================= 5. toast 节点 ================= */
once(`<div id="bootMask"></div>`, 'bootMask');
s = s.replace(`<div id="bootMask"></div>`, `<div id="bootMask"></div>\n<div id="stToast" role="status" aria-live="polite"></div>`);
console.log('OK  toast 节点');

/* ================= 6. 换掉站台脚本 ================= */
const JS = `<script>
/* =========================================================
   站台：目录 ⇄ 工具
   设置分两个维度，各三级（学生大多用手机，默认档自己看设备压力）：
     · 渲染  高级 / 默认 / 流畅   → html[data-perf] = high / mid / low
     · 动画  全量 / 默认 / 关闭   → html[data-motion] = on / off
   高级 / 全量 是强制最高，不看设备；默认档才做自动判断。
   ⚠️ 判弱机只认 ≤2 核 / ≤2G / 省流量：iOS Safari 恒报 4 核、
      Chrome 的 deviceMemory 封顶 8，按 ≤4 判会把好机器一起降级。
   ⚠️ 检测只读一次静态线索，不起定时器、不跑 rAF 循环 —— 监测本身不能占用资源。
   ========================================================= */
(function () {
  var stage = document.getElementById('stage');
  var home = document.getElementById('home');
  var panel = document.getElementById('panel');
  var mask = document.getElementById('panelMask');
  var menuBtn = document.getElementById('menuBtn');
  var toastEl = document.getElementById('stToast');
  var NAMES = { math: '数学思维闯关', vert: '竖式练习台' };

  /* ---------- 设备压力：读一次就走 ---------- */
  var SIG = (function () {
    var cores = navigator.hardwareConcurrency || 4;
    var mem = navigator.deviceMemory || 4;
    var conn = navigator.connection || {};
    var saveData = conn.saveData === true;
    var slowNet = /^(slow-)?2g$/.test(String(conn.effectiveType || ''));
    var reduced = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    var pressure = (cores <= 2 || mem <= 2 || saveData || slowNet) ? 2
                 : ((cores <= 4 || mem <= 4) ? 1 : 0);   /* 2=吃紧 1=一般 0=宽裕 */
    return { cores: cores, mem: mem, pressure: pressure, reduced: reduced };
  })();
  var PERF_BY_PRESSURE = ['high', 'mid', 'low'];

  function loadPref(key, allowed, dflt) {
    try {
      var v = localStorage.getItem('math4a.' + key);
      if (v !== null) {
        v = String(v).replace(/^"|"$/g, '');
        if (allowed.indexOf(v) >= 0) return v;
        /* 旧版本只存过 on/off，迁一下 */
        if (key === 'motion') {
          if (v === 'on') return 'full';
          if (v === 'off') return 'off';
        }
      }
    } catch (e) {}
    return dflt;
  }
  var RENDER_PREF = loadPref('render', ['high', 'auto', 'smooth'], 'auto');
  var MOTION_PREF = loadPref('motion', ['full', 'auto', 'off'], 'auto');

  function resolvedRender() {
    if (RENDER_PREF === 'high') return 'high';
    if (RENDER_PREF === 'smooth') return 'low';
    return PERF_BY_PRESSURE[SIG.pressure];
  }
  function resolvedMotion() {
    if (MOTION_PREF === 'full') return 'on';
    if (MOTION_PREF === 'off') return 'off';
    if (SIG.reduced) return 'off';                 /* 系统偏好优先 */
    return SIG.pressure >= 2 ? 'off' : 'on';
  }

  function applySettings() {
    var de = document.documentElement;
    de.dataset.render = RENDER_PREF;
    de.dataset.motionPref = MOTION_PREF;
    de.dataset.perf = resolvedRender();
    de.dataset.motion = resolvedMotion();
    paintSettings();
    if (frame) syncSettingsIn(frame, 0);
  }

  function paintSettings() {
    var sr = document.getElementById('segRender');
    var sm = document.getElementById('segMotion');
    if (sr) Array.prototype.forEach.call(sr.children, function (b) {
      b.classList.toggle('on', b.dataset.v === RENDER_PREF);
      b.setAttribute('aria-pressed', b.dataset.v === RENDER_PREF ? 'true' : 'false');
    });
    if (sm) Array.prototype.forEach.call(sm.children, function (b) {
      b.classList.toggle('on', b.dataset.v === MOTION_PREF);
      b.setAttribute('aria-pressed', b.dataset.v === MOTION_PREF ? 'true' : 'false');
    });
    var note = document.getElementById('psetNote');
    if (note) {
      var pr = SIG.pressure >= 2 ? '设备吃紧' : (SIG.pressure === 1 ? '设备一般' : '设备宽裕');
      note.textContent = '默认档：按设备压力自动调节（当前' + pr + '）→ 渲染 ' +
        ({ high: '高级', mid: '中', low: '流畅' })[resolvedRender()] +
        ' · 动画 ' + (resolvedMotion() === 'on' ? '开' : '关');
    }
  }

  /* 把结果推进 iframe，两个模块与站台保持一致 */
  function syncSettingsIn(el, tries) {
    try {
      var d = el.contentDocument;
      if (d && d.documentElement) {
        d.documentElement.dataset.render = RENDER_PREF;
        d.documentElement.dataset.perf = resolvedRender();
        d.documentElement.dataset.motion = resolvedMotion();
        return;
      }
    } catch (e) {}
    if ((tries || 0) < 8) setTimeout(function () { syncSettingsIn(el, (tries || 0) + 1); }, 180);
  }

  /* ---------- 提示条 ---------- */
  var toastTimer = null;
  function toast(text, ms) {
    if (!toastEl) return;
    toastEl.textContent = text;
    toastEl.classList.add('on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove('on'); }, ms || 1600);
  }

  /* ---------- 抽屉 ---------- */
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
    veil._t = setTimeout(veilOff, 6000);
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

    if (frame) {
      var old = frame;
      old.classList.add('out');
      setTimeout(function () { if (old.parentNode) old.parentNode.removeChild(old); }, 230);
      frame = null;
    }

    veilOn();
    var el = document.createElement('iframe');
    el.className = 'tool-frame pending';
    el.setAttribute('title', NAMES[key] || key);
    el.srcdoc = tpl.innerHTML;
    stage.appendChild(el);
    frame = el;

    var shown = false;
    var put = function () {
      if (shown) return;
      shown = true;
      el.classList.remove('pending');
      veilOff();
      syncSettingsIn(el, 0);
    };
    el.addEventListener('load', function () { setTimeout(put, 40); });
    setTimeout(put, 1800);

    home.classList.remove('in');
    home.style.display = 'none';
    document.body.classList.add('tool-open');
    current = key;
    markItems(key);
    setMenu(false);
    toast('🎯 ' + (NAMES[key] || key));
  }

  function goHome() {
    renderStats();
    if (frame && frame.parentNode) frame.parentNode.removeChild(frame);
    frame = null;
    current = null;
    veilOff();
    home.style.display = '';
    home.classList.remove('in');
    void home.offsetWidth;
    home.classList.add('in');
    document.body.classList.remove('tool-open');
    markItems(null);
    setMenu(false);
    home.scrollTop = 0;
    toast('🏠 目录', 1200);
  }

  /* ---------- 首页统计 ---------- */
  function renderStats() {
    var box = document.getElementById('hstats');
    if (!box) return;
    var bits = [];
    function grab(k) { try { return JSON.parse(localStorage.getItem('math4a.' + k)); } catch (e) { return null; } }
    var wb = grab('wrongBook');
    if (wb && wb.length) bits.push('<span>📕 待重做错题 <b>' + wb.length + '</b> 道</span>');
    var vs = grab('vertStat');
    if (vs && vs.done) bits.push('<span>✏️ 竖式已完成 <b>' + vs.done + '</b> 题</span>');
    var hs = grab('history');
    if (hs && hs.length) bits.push('<span>📊 累计练习 <b>' + hs.length + '</b> 题</span>');
    box.innerHTML = bits.length ? bits.join('')
      : '<span class="empty">还没有练习记录，选一个开始吧</span>';
  }

  /* ---------- 全屏 ---------- */
  var fsEl = function () {
    return document.fullscreenElement || document.webkitFullscreenElement || null;
  };
  function fsSupported() {
    return !!(document.fullscreenEnabled || document.webkitFullscreenEnabled);
  }
  function paintFs() {
    var btn = document.getElementById('fsBtn');
    if (!btn) return;
    var on = !!fsEl();
    btn.classList.toggle('off', !on);
    var hint = document.getElementById('fsHint');
    if (hint) hint.textContent = on ? '已开启' : '未开启';
    btn.title = on ? '退出全屏' : '全屏显示';
  }
  function toggleFs() {
    var el = document.documentElement;
    if (fsEl()) {
      (document.exitFullscreen || document.webkitExitFullscreen).call(document);
    } else {
      var r = el.requestFullscreen ? el.requestFullscreen()
            : (el.webkitRequestFullscreen ? el.webkitRequestFullscreen() : null);
      if (r && r.catch) r.catch(function () { toast('这台设备不让全屏'); });
    }
  }

  /* ---------- 横屏（把舞台转 90°） ---------- */
  function paintLand() {
    var btn = document.getElementById('landBtn');
    if (!btn) return;
    var on = document.body.classList.contains('land');
    btn.classList.toggle('off', !on);
    var hint = document.getElementById('landHint');
    if (hint) hint.textContent = on ? '横屏中' : '竖屏';
    btn.title = on ? '转回竖屏' : '把练习区转 90°，横过来用';
  }
  function toggleLand() {
    var on = !document.body.classList.contains('land');
    document.body.classList.toggle('land', on);
    paintLand();
    toast(on ? '🔄 已横屏（竖着拿手机用）' : '📱 已转回竖屏', 1600);
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

  /* 渲染 / 动画 两个三段控件 */
  function bindSeg(id, onChange) {
    var seg = document.getElementById(id);
    if (!seg) return;
    seg.addEventListener('click', function (e) {
      var b = e.target.closest('button[data-v]');
      if (!b || b.classList.contains('on')) return;
      onChange(b.dataset.v);
    });
  }
  bindSeg('segRender', function (v) {
    RENDER_PREF = v;
    try { localStorage.setItem('math4a.render', v); } catch (e) {}
    applySettings();
  });
  bindSeg('segMotion', function (v) {
    MOTION_PREF = v;
    try { localStorage.setItem('math4a.motion', v); } catch (e) {}
    applySettings();
  });

  var fsBtn = document.getElementById('fsBtn');
  if (!fsSupported()) {
    if (fsBtn) fsBtn.hidden = true;      /* 不支持就别留一个点了没反应的按钮 */
  } else {
    fsBtn.addEventListener('click', toggleFs);
    document.addEventListener('fullscreenchange', paintFs);
    document.addEventListener('webkitfullscreenchange', paintFs);
  }
  var landBtn = document.getElementById('landBtn');
  if (landBtn) landBtn.addEventListener('click', toggleLand);

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') setMenu(false);
  });

  /* ---------- 启动 ---------- */
  renderStats();
  applySettings();
  paintFs();
  paintLand();
  requestAnimationFrame(function () {
    home.classList.add('in');
    var bm = document.getElementById('bootMask');
    if (bm) {
      bm.classList.add('off');
      setTimeout(function () { if (bm.parentNode) bm.parentNode.removeChild(bm); }, 320);
    }
  });

  window.__st = {
    perf: function () { return document.documentElement.dataset.perf; },
    motion: function () { return document.documentElement.dataset.motion; },
    sig: SIG
  };
})();
</` + `script>`;

const lastOpen = s.lastIndexOf('<script>');
s = s.slice(0, lastOpen) + JS + '\n</body>\n</html>\n';
console.log('OK  站台脚本');

fs.writeFileSync(FILE, s, 'utf8');
console.log('WROTE ' + FILE + '  (' + (fs.statSync(FILE).size / 1024).toFixed(0) + ' KB)');
