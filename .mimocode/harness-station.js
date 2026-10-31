/* 站台自测：分级渲染 / 动效 / 加载遮罩 / 两个工具 */
var out = [];
var ok = function (n, c, x) { out.push((c ? 'PASS ' : 'FAIL ') + n + (x !== undefined ? ' :: ' + x : '')); };
var info = function (s) { out.push('INFO ' + s); };
var q = function (s) { return document.querySelector(s); };
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

/* ---- 1. 分级渲染 ---- */
safe('分级', function () {
  var de = document.documentElement;
  ok('html 上有 data-perf', !!de.dataset.perf, de.dataset.perf);
  ok('perf 是三档之一', ['low', 'mid', 'high'].indexOf(de.dataset.perf) >= 0, de.dataset.perf);
  ok('html 上有 data-motion', de.dataset.motion === 'on' || de.dataset.motion === 'off', de.dataset.motion);
  ok('核心数不被 ≤4 误判',
     !((navigator.hardwareConcurrency || 8) > 2 && de.dataset.perf === 'low'),
     'cores=' + navigator.hardwareConcurrency + ' perf=' + de.dataset.perf);
  ok('抽屉里显示渲染档位', q('#perfName') && q('#perfName').textContent.length > 0,
     q('#perfName') && q('#perfName').textContent);
  ok('动效切换按钮存在', !!q('#motionBtn'));

  /* 首屏遮罩：脚本跑完就该淡出并移除 */
  setTimeout(function () {
    ok('首屏遮罩已移除', !document.getElementById('bootMask'));
  }, 500);
});

/* ---- 2. 目录页 + 入场动效 ---- */
safe('目录', function () {
  var cards = document.querySelectorAll('.card[data-tool]');
  ok('目录 2 张卡', cards.length === 2, cards.length);
  setTimeout(function(){ ok('home 带 in 类（触发入场动画）', q('#home').classList.contains('in')); }, 120);
  ok('卡片带 --i 序号', cards[0].style.getPropertyValue('--i') === '0' &&
     cards[1].style.getPropertyValue('--i') === '1',
     cards[0].style.getPropertyValue('--i') + '/' + cards[1].style.getPropertyValue('--i'));
  var items = q('#panel').querySelectorAll('.pitem[data-tool]');
  ok('抽屉条目带 anim-in', items[0].classList.contains('anim-in'));
  ok('抽屉条目带 --i', items[1].style.getPropertyValue('--i') === '1',
     items[1].style.getPropertyValue('--i'));
});

/* ---- 3. 抽屉 ---- */
safe('抽屉', function () {
  q('#menuBtn').click();
  ok('🎯 打开抽屉', q('#panel').classList.contains('open') && q('#panelMask').classList.contains('on'));
  q('#panelMask').click();
  ok('遮罩收起抽屉', !q('#panel').classList.contains('open'));
});

/* ---- 4. 打开工具：加载遮罩 + pending 淡入 ---- */
var f1 = null;
safe('打开竖式', function () {
  q('.card[data-tool="vert"]').click();
  f1 = q('iframe.tool-frame');
  ok('iframe 已创建', !!f1);
  ok('iframe 初始 pending（淡入）', f1.classList.contains('pending'));
  ok('加载遮罩已显示', !!q('.view-loading') && q('.view-loading').classList.contains('on'));
  ok('遮罩里有进度条', !!q('.tl-bar em') && !!q('.tl-dot'));
  ok('目录页隐藏', getComputedStyle(q('#home')).display === 'none');
});

setTimeout(function () {
  safe('竖式内部', function () {
    if (!f1) { out.push('FAIL 没有 iframe'); return dump(); }
    ok('iframe 已淡入（pending 去掉）', !f1.classList.contains('pending'));
    var veil = q('.view-loading');
    ok('加载遮罩已撤', !veil || !veil.classList.contains('on'));

    var doc = null;
    try { doc = f1.contentDocument; } catch (e) {}
    if (!doc) { out.push('FAIL 拿不到 iframe 文档'); return dump(); }

    ok('竖式页能渲染', doc.querySelectorAll('#vGrid .vs-cell').length > 6,
       doc.querySelectorAll('#vGrid .vs-cell').length);
    var vde = doc.documentElement;
    ok('竖式页有自己的 data-perf', ['low', 'mid', 'high'].indexOf(vde.dataset.perf) >= 0,
       vde.dataset.perf);
    ok('竖式页动效偏好已同步', vde.dataset.motion === document.documentElement.dataset.motion,
       vde.dataset.motion + ' vs ' + document.documentElement.dataset.motion);
    ok('竖式选项带 --i', doc.querySelector('#vOpts .v-opt').style.getPropertyValue('--i') === '0',
       doc.querySelector('#vOpts .v-opt').style.getPropertyValue('--i'));

    /* 动画规则确实存在（分级渲染的 CSS 生效） */
    var hasAnimRule = false;
    for (var i = 0; i < doc.styleSheets.length && !hasAnimRule; i++) {
      var rs = doc.styleSheets[i].cssRules;
      for (var j = 0; j < rs.length; j++) {
        var tx = rs[j].cssText || '';
        if (tx.indexOf('data-perf') >= 0) { hasAnimRule = true; break; }
      }
    }
    ok('竖式页有分级渲染规则', hasAnimRule);

    /* 答一步，检查格子填上 */
    var blanks = doc.querySelectorAll('#vGrid .vs-cell.blank').length;
    for (var k = 0; k < 6; k++) {
      var b = doc.querySelector('#vOpts .v-opt:not([disabled])');
      if (!b) break;
      b.click();
      if (doc.querySelectorAll('#vGrid .vs-cell.blank').length < blanks) break;
    }
    ok('答对后竖式填上了数', doc.querySelectorAll('#vGrid .vs-cell.blank').length < blanks,
       blanks + ' -> ' + doc.querySelectorAll('#vGrid .vs-cell.blank').length);
  });

  /* ---- 5. 动效开关：要同步进 iframe ---- */
  safe('动效开关', function () {
    var before = document.documentElement.dataset.motion;
    q('#motionBtn').click();
    var after = document.documentElement.dataset.motion;
    ok('点动效开关能切换', before !== after, before + ' -> ' + after);
    ok('按钮文字跟着变', q('#motionBtn').textContent === (after === 'off' ? '关' : '开'),
       q('#motionBtn').textContent);
    var doc = null;
    try { doc = f1.contentDocument; } catch (e) {}
    ok('iframe 里的动效偏好也变了',
       !!doc && doc.documentElement.dataset.motion === after,
       doc && doc.documentElement.dataset.motion);
    /* 切回来 */
    q('#motionBtn').click();
    ok('再点切回来', document.documentElement.dataset.motion === before);
  });

  /* ---- 6. 切工具 + 回目录 ---- */
  safe('切工具', function () {
    q('#menuBtn').click();
    ok('工具页里 🎯 能开抽屉', q('#panel').classList.contains('open'));
    ok('标出当前工具', q('#panel .pitem[data-tool="vert"]').classList.contains('on'));
    q('#panel .pitem[data-tool="math"]').click();
  });

  setTimeout(function () {
    safe('闯关内部', function () {
      var f2 = q('iframe.tool-frame');
      ok('只剩一个 iframe', document.querySelectorAll('iframe.tool-frame').length === 1,
         document.querySelectorAll('iframe.tool-frame').length);
      var d2 = null;
      try { d2 = f2.contentDocument; } catch (e) {}
      if (!d2) { out.push('FAIL 第二个 iframe 无文档'); return dump(); }
      ok('闯关页 3 个 Tab', d2.querySelectorAll('.tab-btn').length === 3);
      ok('闯关页有分级渲染属性', ['low', 'mid', 'high'].indexOf(d2.documentElement.dataset.perf) >= 0,
         d2.documentElement.dataset.perf);

      d2.querySelector('#unitAll').click();
      ok('闯关页灯泡出现', d2.querySelector('#factsFab').classList.contains('show'));
      ok('选项带 --i 序号',
         !!d2.querySelector('#steps .step.active .opt') &&
         d2.querySelector('#steps .step.active .opt').style.getPropertyValue('--i') === '0',
         d2.querySelector('#steps .step.active .opt') &&
         d2.querySelector('#steps .step.active .opt').style.getPropertyValue('--i'));

      /* 浮层互斥 */
      d2.querySelector('#factsFab').click();
      d2.querySelector('#unitToggle').click();
      ok('闯关页浮层互斥仍生效',
         !d2.querySelector('#factsBox').classList.contains('open') &&
         d2.querySelector('#unitPanel').classList.contains('open'));

      q('#menuBtn').click();
      q('#homeItem').click();
      ok('回目录 iframe 已移除', document.querySelectorAll('iframe.tool-frame').length === 0);
      ok('回目录重新触发了入场动画', q('#home').classList.contains('in'));
      ok('回目录 tool-open 清掉', !document.body.classList.contains('tool-open'));
      dump();
    });
  }, 1100);
}, 1100);

