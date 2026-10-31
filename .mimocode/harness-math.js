/* 闯关页自测：灯泡抽屉 + 已完成步骤胶囊压缩 */
var out = [];
var ok = function (name, cond, extra) {
  out.push((cond ? 'PASS ' : 'FAIL ') + name + (extra !== undefined ? ' :: ' + extra : ''));
};
var info = function (s) { out.push('INFO ' + s); };
var q = function (s) { return document.querySelector(s); };
var errs = [];
window.addEventListener('error', function (e) { errs.push('JSERROR ' + e.message); });

try {
  ok('只有 3 个 Tab', document.querySelectorAll('.tab-btn').length === 3,
     document.querySelectorAll('.tab-btn').length);
  ok('竖式 Tab 已移除', !document.querySelector('.tab-btn[data-tab="vertical"]'));

  q('#unitAll').click();     /* 全选单元，生成题目 */

  var fab = q('#factsFab');
  ok('灯泡悬浮按钮出现', fab.classList.contains('show'));
  ok('灯泡角标 0/N', /^0\/\d+$/.test(q('#factsFabBadge').textContent), q('#factsFabBadge').textContent);
  ok('已知信息默认收起', !q('#factsBox').classList.contains('open'));
  var fb = q('#factsBox').getBoundingClientRect();
  info('抽屉初始位置 top=' + Math.round(fb.top) + ' 高=' + Math.round(fb.height) +
       ' 视口高=' + window.innerHeight);
  ok('抽屉默认在视口外', fb.top >= window.innerHeight - 2, Math.round(fb.top));

  fab.click();
  ok('点灯泡打开抽屉', q('#factsBox').classList.contains('open') && q('#factsMask').classList.contains('on'));
  ok('抽屉里先提示还没找到条件', q('#factsList').textContent.indexOf('还没有找到已知条件') >= 0);
  q('#factsClose').click();
  ok('点关闭收起', !q('#factsBox').classList.contains('open'));

  var st = questions[current];
  ok('初始没有已完成胶囊', document.querySelectorAll('#steps .done-strip').length === 0);
  ok('未解锁步骤合并成一行', document.querySelectorAll('#steps .step-locked-line').length === 1);
  ok('当前步骤只有一张卡', document.querySelectorAll('#steps .step').length === 1);
  ok('当前步骤是 active', q('#steps .step').classList.contains('active'));

  /* 答对第一步 */
  var s0 = st.problem.steps[0];
  var guard = 0;
  while (st.state.stepIdx === 0 && guard++ < 20) {
    var btn = document.querySelector('#steps .step.active .opt[data-opt="' + s0.answer + '"]');
    if (!btn || btn.disabled) break;
    btn.click();
  }
  ok('第一步答对 stepIdx=1', st.state.stepIdx === 1, st.state.stepIdx);
  ok('出现已完成胶囊行', document.querySelectorAll('#steps .done-strip').length === 1);
  ok('胶囊只有 1 个', document.querySelectorAll('#steps .done-chip').length === 1);
  ok('已完成步骤不再占大卡片', document.querySelectorAll('#steps .step.done').length === 0);
  var sh = q('#steps .done-strip').getBoundingClientRect().height;
  ok('胶囊行高 < 50px', sh > 0 && sh < 50, Math.round(sh));

  q('#steps .done-chip').click();
  ok('点胶囊展开解析', document.querySelectorAll('#steps .done-panel').length === 1);
  ok('展开后胶囊变实心', q('#steps .done-chip').classList.contains('on'));
  q('#steps .done-chip').click();
  ok('再点收起解析', document.querySelectorAll('#steps .done-panel').length === 0);

  ok('灯泡角标变 1/N', /^1\/\d+$/.test(q('#factsFabBadge').textContent), q('#factsFabBadge').textContent);
  fab.click();
  ok('抽屉出现第 1 个条件', document.querySelectorAll('#factsList .fact').length >= 1,
     document.querySelectorAll('#factsList .fact').length);
  q('#factsMask').click();
  ok('点遮罩也收起', !q('#factsBox').classList.contains('open'));

  /* 全部答完 */
  var g2 = 0;
  while (st.state.stepIdx < st.problem.steps.length && g2++ < 30) {
    var cur = st.problem.steps[st.state.stepIdx];
    var b2 = document.querySelector('#steps .step.active .opt[data-opt="' + cur.answer + '"]');
    if (!b2 || b2.disabled) break;
    b2.click();
  }
  ok('全部步骤做完', st.state.stepIdx === st.problem.steps.length, st.state.stepIdx);
  ok('胶囊数 = 步骤数', document.querySelectorAll('#steps .done-chip').length === st.problem.steps.length,
     document.querySelectorAll('#steps .done-chip').length + '/' + st.problem.steps.length);
  ok('做完后没有锁定行', document.querySelectorAll('#steps .step-locked-line').length === 0);
  ok('答题区解锁', !q('#answerCard').classList.contains('locked'));

  /* 题目卡 + 当前步骤是否同屏 */
  var prob = q('.problem').getBoundingClientRect();
  info('题目卡高 ' + Math.round(prob.height) + ' / 步骤区顶部 ' +
       Math.round(q('#steps').getBoundingClientRect().top) + ' / 视口高 ' + window.innerHeight);
  ok('题目与步骤都可见', prob.height > 0 && q('#steps').getBoundingClientRect().height > 0);
} catch (e) {
  out.push('FAIL 自测抛异常: ' + e.message);
  out.push('STACK ' + String(e.stack || '').split('\n').slice(0, 4).join(' | '));
}
if (errs.length) out = out.concat(errs);

/* 抽屉是 .32s 过渡。headless + virtual-time 下动画时钟不推进，
   computed transform 会一直停在起始值，所以量位置前先把过渡摘掉（只影响测量，不改页面）。 */
setTimeout(function () {
  try {
    q('#factsFab').click();
    var box = q('#factsBox');
    box.style.transition = 'none';
    void box.offsetHeight;
    setTimeout(function () {
      try {
        var r = box.getBoundingClientRect();
        ok('抽屉滑出后完整在视口内', r.top >= 0 && r.bottom <= window.innerHeight + 2,
           'top=' + Math.round(r.top) + ' bottom=' + Math.round(r.bottom) +
           ' vh=' + window.innerHeight);
        ok('抽屉高度不超过 76vh', r.height <= window.innerHeight * 0.77, Math.round(r.height));
        ok('遮罩盖住全屏', q('#factsMask').classList.contains('on') &&
           q('#factsMask').getBoundingClientRect().height >= window.innerHeight - 1);

        var facts = document.querySelectorAll('#factsList .fact');
        if (facts.length) {
          /* 用 offsetWidth：getBoundingClientRect 会带 factPop 的 scale(.8)，
             headless 里动画时钟不推进，量出来永远是缩放后的值 */
          var w = facts[0].offsetWidth;
          var lw = q('#factsList').clientWidth;
          info('条件条宽 ' + Math.round(w) + ' / 列表宽 ' + Math.round(lw));
          ok('条件条是整行长条（不再挤成小方块）', w > lw * 0.8, Math.round(w) + '/' + Math.round(lw));
        }
      } catch (e) {
        out.push('FAIL 抽屉延迟检查异常: ' + e.message);
      }
      document.getElementById('__out').textContent = out.join('\n');
      document.title = out.filter(function (l) { return l.indexOf('FAIL') === 0; }).length +
                       ' fails / ' + out.length;
    }, 60);
  } catch (e) {
    out.push('FAIL 抽屉延迟检查异常: ' + e.message);
  }
}, 30);
