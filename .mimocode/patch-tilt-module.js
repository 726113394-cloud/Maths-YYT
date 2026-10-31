/* 练习页题目卡也上玻璃/光斑/倾斜（独立开关，默认跟高级渲染走） */
const fs = require('fs');

/* ============ 一、模块：读 tilt 偏好 + 挂效果 ============ */
const MOD = 'C:\\Users\\Administrator\\Desktop\\数学思维闯关\\数学思维闯关.html';
let s = fs.readFileSync(MOD, 'utf8');
function sub(a, b, label) {
  if (s.split(a).length - 1 !== 1) { console.log('  跳过 ' + label); return; }
  s = s.replace(a, b); console.log('OK  ' + label);
}

/* 1. 偏好：tilt = on/off，默认 on（真正生效还要看 perf/motion/指针） */
sub(`  var rPref = pref('render', ['high', 'auto', 'smooth'], 'auto');
  var mPref = pref('motion', ['full', 'auto', 'off'], 'auto');`,
`  var rPref = pref('render', ['high', 'auto', 'smooth'], 'auto');
  var mPref = pref('motion', ['full', 'auto', 'off'], 'auto');
  /* 卡片倾斜/光斑单独一个开关：有人就喜欢安安静静做题 */
  var tPref = pref('tilt', ['on', 'off'], 'on');`, 'tilt 偏好');

sub(`  root.dataset.perf = perf;
  root.dataset.motion = motion;`,
`  root.dataset.perf = perf;
  root.dataset.motion = motion;
  root.dataset.tilt = tPref;`, 'tilt 落到 data-tilt');

/* 2. CSS */
sub(`/* 按下去的手感：所有可点控件统一给一点压缩，比 hover 更适合手机 */`,
`/* ---- 题目卡 / 当前步骤卡：高级渲染下的玻璃 + 跟随光斑 + 轻微倾斜 ----
   只在有精确指针、开了动效、并且没把「倾斜」关掉时出现。
   练习卡倾斜幅度比站台小（7.5°/9.5° → 4°/5°），答题时不该晃眼。 */
@media (hover:hover) and (pointer:fine){
  html[data-perf="high"][data-motion="on"][data-tilt="on"] .problem,
  html[data-perf="high"][data-motion="on"][data-tilt="on"] .step.active{
    position:relative;
    transform-style:preserve-3d;
    transition:box-shadow .4s ease;
    will-change:transform;
  }
  html[data-perf="high"][data-motion="on"][data-tilt="on"] .problem::after,
  html[data-perf="high"][data-motion="on"][data-tilt="on"] .step.active::after{
    content:'';position:absolute;inset:0;border-radius:inherit;pointer-events:none;z-index:3;
    opacity:0;transition:opacity .4s cubic-bezier(.22,1,.36,1);
    background:radial-gradient(circle at var(--gx,50%) var(--gy,50%),
      rgba(255,255,255,.55) 0%,rgba(255,255,255,.18) 26%,rgba(255,255,255,0) 62%);
    mix-blend-mode:screen;
  }
  html[data-perf="high"][data-motion="on"][data-tilt="on"] .problem.tilting::after,
  html[data-perf="high"][data-motion="on"][data-tilt="on"] .step.active.tilting::after{
    opacity:1;
  }
  html[data-perf="high"][data-motion="on"][data-tilt="on"] .problem.tilting,
  html[data-perf="high"][data-motion="on"][data-tilt="on"] .step.active.tilting{
    box-shadow:0 18px 48px rgba(120,80,180,.22);
  }
}

/* 按下去的手感：所有可点控件统一给一点压缩，比 hover 更适合手机 */`, '练习卡倾斜 CSS');

/* 3. JS：一个通用的挂载器 */
sub(`/* ================= 工具 end ================= */`, `/* noop */`, 'noop-skip');

sub(`function render() {
  const q = questions[current];
  if (!q) return;`,
`/* ---- 题目卡上的倾斜 / 光斑 ---- */
let tiltBound = false;
function finePointer() {
  try { return !!(window.matchMedia && window.matchMedia('(hover:hover) and (pointer:fine)').matches); }
  catch (e) { return false; }
}
function tiltOn() {
  const de = document.documentElement;
  return de.dataset.perf === 'high' && de.dataset.motion === 'on' &&
         de.dataset.tilt === 'on' && finePointer();
}
function mountTilt(el, maxDeg) {
  if (!el || el.dataset.tiltBound === '1') return;
  el.dataset.tiltBound = '1';
  const deg = maxDeg || 5;
  let raf = 0, gx = 50, gy = 50;
  function paint() {
    raf = 0;
    el.style.setProperty('--gx', gx.toFixed(1) + '%');
    el.style.setProperty('--gy', gy.toFixed(1) + '%');
    const rx = (0.5 - gy / 100) * deg;
    const ry = (gx / 100 - 0.5) * deg * 1.25;
    el.style.transform = 'perspective(900px) rotateX(' + rx.toFixed(2) +
      'deg) rotateY(' + ry.toFixed(2) + 'deg)';
  }
  function onMove(e) {
    if (!tiltOn()) { if (el.classList.contains('tilting')) onLeave(); return; }
    const r = el.getBoundingClientRect();
    if (!r.width || !r.height) return;
    gx = Math.max(0, Math.min(100, (e.clientX - r.left) / r.width * 100));
    gy = Math.max(0, Math.min(100, (e.clientY - r.top) / r.height * 100));
    el.classList.add('tilting');
    if (!raf) raf = requestAnimationFrame(paint);
  }
  function onLeave() {
    el.classList.remove('tilting');
    el.style.transform = '';
  }
  el.addEventListener('pointermove', onMove);
  el.addEventListener('pointerleave', onLeave);
  el.addEventListener('pointercancel', onLeave);
}
/* 每次重渲染后，给题目卡和当前步骤卡补挂一次（元素会被换掉） */
function mountCardTilt() {
  const p = document.querySelector('.problem');
  if (p) mountTilt(p, 4);
  const st = document.querySelector('#steps .step.active');
  if (st) mountTilt(st, 4);
}

function render() {
  const q = questions[current];
  if (!q) return;`, '挂载器');

/* 4. render 结尾调一次 */
sub(`  renderSteps();
  renderAnswer();
  renderNav();
  renderGoal();
  updateBackBtn();
  startTimer();`,
`  renderSteps();
  renderAnswer();
  renderNav();
  renderGoal();
  updateBackBtn();
  mountCardTilt();
  startTimer();`, 'render 调用');

/* 5. 关掉倾斜时把卡片扶正 */
sub(`function renderSteps() {`,
`function unTilt() {
  if (tiltOn()) return;
  document.querySelectorAll('.problem.tilting, #steps .step.active.tilting').forEach(el => {
    el.classList.remove('tilting');
    el.style.transform = '';
  });
}

function renderSteps() {`, 'unTilt');

fs.writeFileSync(MOD, s, 'utf8');
console.log('WROTE ' + MOD + '  (' + (fs.statSync(MOD).size / 1024).toFixed(0) + ' KB)');
