/* 站台自测：渲染/动画双维度三级 + 全屏/横屏 + 按钮尺寸 */
var out = [];
var ok = function (n, c, x) { out.push((c ? 'PASS ' : 'FAIL ') + n + (x !== undefined ? ' :: ' + x : '')); };
var info = function (s) { out.push('INFO ' + s); };
var q = function (s) { return document.querySelector(s); };
var de = document.documentElement;
var errs = []; var done = false;
window.addEventListener('error', function (e) { errs.push('JSERROR ' + e.message); });
function dump() {
  if (done) return; done = true;
  if (errs.length) out = out.concat(errs);
  document.getElementById('__out').textContent = out.join('\n');
  document.title = out.filter(function (l) { return l.indexOf('FAIL') === 0; }).length + ' fails / ' + out.length;
}
setTimeout(dump, 12000);
function safe(tag, fn) {
  try { fn(); } catch (e) {
    out.push('FAIL ' + tag + ' 抛异常: ' + e.message);
    out.push('STACK ' + String(e.stack || '').split('\n').slice(0, 3).join(' | '));
    dump();
  }
}

safe('初始', function () {
  ok('data-render 默认是 auto', de.dataset.render === 'auto', de.dataset.render);
  ok('data-motionPref 默认是 auto', de.dataset.motionPref === 'auto', de.dataset.motionPref);
  ok('data-perf 已解析成三档之一', ['high', 'mid', 'low'].indexOf(de.dataset.perf) >= 0, de.dataset.perf);
  ok('data-motion 已解析成 on/off', de.dataset.motion === 'on' || de.dataset.motion === 'off', de.dataset.motion);
  info('设备压力档 = ' + (window.__st ? window.__st.sig.pressure : '?') +
       '（cores=' + (navigator.hardwareConcurrency || '?') + '）');
  ok('默认档文案说明了当前解析结果', q('#psetNote').textContent.indexOf('渲染') >= 0,
     q('#psetNote').textContent.slice(0, 40));

  /* 两个三段控件 */
  ok('渲染控件 3 个按钮', q('#segRender').querySelectorAll('button').length === 3);
  ok('动画控件 3 个按钮', q('#segMotion').querySelectorAll('button').length === 3);
  ok('渲染默认档高亮（默认=流畅）', q('#segRender button[data-v="smooth"]').classList.contains('on'));
  ok('动画默认档高亮', q('#segMotion button[data-v="auto"]').classList.contains('on'));

  /* 按钮尺寸：学生用手机，靶子要够大 */
  var segBtns = q('#segRender').querySelectorAll('button');
  var minSeg = 999;
  segBtns.forEach(function (b) { minSeg = Math.min(minSeg, b.getBoundingClientRect().height); });
  ok('三段按钮高度 ≥ 44px', minSeg >= 44, Math.round(minSeg));
  var sbs = document.querySelectorAll('.sbtn');
  var minSb = 999;
  sbs.forEach(function (b) { minSb = Math.min(minSb, b.getBoundingClientRect().height); });
  ok('全屏/横屏按钮高度 ≥ 52px', minSb >= 52, Math.round(minSb));
  ok('全屏按钮存在', !!q('#fsBtn'));
  ok('横屏按钮存在', !!q('#landBtn'));
  ok('全屏按钮有状态提示', !!q('#fsHint') && q('#fsHint').textContent.length > 0, q('#fsHint').textContent);

  /* 按钮离屏幕底部要有距离：抽屉底边到最后一个控件要有留白 */
  /* 全屏/横屏已经搬进二级设置界面，留白也在那边量 */
  q('#menuBtn').click();
  q('#setBtn').click();
  var pn = q('#setSheet');
  pn.scrollTop = pn.scrollHeight;
  var land = q('#landBtn').getBoundingClientRect();
  var pnR = pn.getBoundingClientRect();
  info('设置页可滚 ' + (pn.scrollHeight > pn.clientHeight) + '，滚到底后按钮 bottom=' +
       Math.round(land.bottom) + ' 抽屉内容底=' + Math.round(pnR.bottom));
  ok('滚到底后按钮离内容底边仍有留白', pnR.bottom - land.bottom >= 24,
     Math.round(pnR.bottom - land.bottom));

  /* 渲染：高级 → 强制 high */
  q('#segRender button[data-v="high"]').click();
  ok('选高级后 data-perf=high', de.dataset.perf === 'high', de.dataset.perf);
  ok('高级档高亮', q('#segRender button[data-v="high"]').classList.contains('on'));
  /* 高级档现在是 Gost 那套液态玻璃：blur + saturate，还带跟随光斑 */
  var bf = getComputedStyle(q('.card')).backdropFilter;
  ok('高级档给卡片开液态玻璃', /blur\(2[0-9]px\)/.test(bf) && /saturate/.test(bf), bf);
  ok('高级档卡片挂了跟随光斑', !!q('.card .glare'));

  /* 渲染：流畅 → 强制 low */
  q('#segRender button[data-v="smooth"]').click();
  ok('选流畅后 data-perf=low', de.dataset.perf === 'low', de.dataset.perf);
  ok('流畅档关掉毛玻璃', getComputedStyle(q('.card')).backdropFilter === 'none',
     getComputedStyle(q('.card')).backdropFilter);
  /* .card 的 box-shadow 带 .18s 过渡；headless 里动画时钟不推进，
     直接读会拿到过渡起点，所以先把过渡摘掉再量 */
  var c0 = q('.card');
  c0.style.transition = 'none';
  void c0.offsetHeight;
  ok('流畅档卡片改成描边', getComputedStyle(c0).boxShadow === 'none', getComputedStyle(c0).boxShadow);
  c0.style.transition = '';

  /* 动画：关闭 → off */
  q('#segMotion button[data-v="off"]').click();
  ok('选关闭后 data-motion=off', de.dataset.motion === 'off', de.dataset.motion);
  ok('关闭后入场动画被砍',
     getComputedStyle(q('.card')).animationName === 'none' ||
     getComputedStyle(q('.card')).animationDuration === '0.001ms',
     getComputedStyle(q('.card')).animationName + ' / ' + getComputedStyle(q('.card')).animationDuration);

  /* 动画：全量 → 强制 on（即使系统开了减少动效） */
  q('#segMotion button[data-v="full"]').click();
  ok('选全量后 data-motion=on（强制最高）', de.dataset.motion === 'on', de.dataset.motion);

  /* 落盘 */
  ok('渲染偏好写进了 localStorage',
     String(localStorage.getItem('math4a.render')).replace(/"/g, '') === 'smooth',
     localStorage.getItem('math4a.render'));
  ok('动画偏好写进了 localStorage',
     String(localStorage.getItem('math4a.motion')).replace(/"/g, '') === 'full',
     localStorage.getItem('math4a.motion'));

  /* 回到默认档 */
  q('#segRender button[data-v="auto"]').click();
  q('#segMotion button[data-v="auto"]').click();
  ok('回默认档能还原', de.dataset.render === 'auto' && de.dataset.motionPref === 'auto');
});

/* ---- 横屏 ---- */
safe('横屏', function () {
  ok('初始不在横屏', !document.body.classList.contains('land'));
  q('#landBtn').click();
  ok('点横屏后加 land 类', document.body.classList.contains('land'));
  var tf = getComputedStyle(q('#stage')).transform;
  ok('舞台被转了 90°', /matrix\(0,\s*1,\s*-1,\s*0/.test(tf.replace(/\s+/g, '')), tf);
  var fab = q('#menuBtn').getBoundingClientRect();
  ok('横屏后浮标挪到底部', fab.top > window.innerHeight / 2, Math.round(fab.top));
  ok('横屏按钮状态文字变了', q('#landHint').textContent === '横屏中', q('#landHint').textContent);
  q('#landBtn').click();
  ok('再点转回竖屏', !document.body.classList.contains('land'));
  var tf2 = getComputedStyle(q('#stage')).transform;
  ok('竖屏时没有旋转', tf2 === 'none', tf2);
});

/* ---- 进工具：设置要同步进去 ---- */
var f1 = null;
safe('进工具', function () {
  q('#segRender button[data-v="smooth"]').click();   /* 先用一个非默认值 */
  q('#segMotion button[data-v="off"]').click();
  q('#menuBtn').click();
  q('#panel .pitem[data-tool="vert"]').click();
  f1 = q('iframe.tool-frame');
  ok('iframe 已创建', !!f1);
  ok('切换工具有提示条', q('#stToast').classList.contains('on'), q('#stToast').textContent);
});

setTimeout(function () {
  safe('工具内部', function () {
    var d = null;
    try { d = f1.contentDocument; } catch (e) {}
    if (!d) { out.push('FAIL 拿不到 iframe 文档'); return dump(); }
    ok('竖式页 data-perf 与站台一致',
       d.documentElement.dataset.perf === de.dataset.perf,
       d.documentElement.dataset.perf + ' vs ' + de.dataset.perf);
    ok('竖式页 data-motion 与站台一致',
       d.documentElement.dataset.motion === de.dataset.motion,
       d.documentElement.dataset.motion + ' vs ' + de.dataset.motion);

    /* 在工具页里改设置，要实时同步进 iframe */
    q('#menuBtn').click();
    q('#segRender button[data-v="high"]').click();
    ok('改渲染后 iframe 立刻跟上',
       d.documentElement.dataset.perf === 'high', d.documentElement.dataset.perf);
    q('#segMotion button[data-v="full"]').click();
    ok('改动画后 iframe 立刻跟上',
       d.documentElement.dataset.motion === 'on', d.documentElement.dataset.motion);

    /* 收尾：回默认档 */
    q('#segRender button[data-v="auto"]').click();
    q('#segMotion button[data-v="auto"]').click();
    q('#menuBtn').click();
    q('#homeItem').click();
    ok('回目录后 iframe 移除', document.querySelectorAll('iframe.tool-frame').length === 0);
    dump();
  });
}, 1300);
