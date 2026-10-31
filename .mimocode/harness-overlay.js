/* 闯关页自测：浮层互斥（已知信息抽屉 / 单元面板 / 整卷 / PK 只能开一个） */
var out = [];
var ok = function (name, cond, extra) {
  out.push((cond ? 'PASS ' : 'FAIL ') + name + (extra !== undefined ? ' :: ' + extra : ''));
};
var info = function (s) { out.push('INFO ' + s); };
var q = function (s) { return document.querySelector(s); };
var errs = [];
window.addEventListener('error', function (e) { errs.push('JSERROR ' + e.message); });

var factsOpen = function () { return q('#factsBox').classList.contains('open'); };
var unitOpen = function () { return q('#unitPanel').classList.contains('open'); };
var paperOpen = function () { return q('#paperMask').classList.contains('on'); };
var paperResOpen = function () { return q('#paperResultMask').classList.contains('on'); };
var pkOpen = function () { return q('#pkModal').classList.contains('on'); };
var adminOpen = function () { return q('#adminModal').classList.contains('on'); };
function countOpen() {
  return [factsOpen(), unitOpen(), paperOpen(), paperResOpen(), pkOpen(), adminOpen()]
    .filter(Boolean).length;
}

try {
  q('#unitAll').click();          /* 生成题目 */

  /* --- 1. 灯泡 vs 单元面板 --- */
  q('#unitToggle').click();
  ok('单元面板能打开', unitOpen());
  q('#factsFab').click();
  ok('开已知信息时仍只开一个', countOpen() === 1, 'open=' + countOpen());
  ok('单元面板被顶掉', !unitOpen());
  ok('已知信息开着', factsOpen());

  q('#unitToggle').click();
  ok('开单元面板时把已知信息顶掉', unitOpen() && !factsOpen() && countOpen() === 1,
     'open=' + countOpen());

  /* --- 2. 单元面板 vs 整卷 --- */
  q('#paperBtn').click();
  ok('开整卷时把单元面板顶掉', paperOpen() && !unitOpen() && countOpen() === 1,
     'open=' + countOpen());
  q('#paperClose').click();
  ok('关掉整卷后没有残留浮层', countOpen() === 0, 'open=' + countOpen());

  /* --- 3. 整卷 vs 已知信息 --- */
  q('#factsFab').click();
  ok('已知信息重新打开', factsOpen());
  q('#paperBtn').click();
  ok('整卷打开时已知信息被顶掉', paperOpen() && !factsOpen() && countOpen() === 1,
     'open=' + countOpen());
  q('#paperMask').click();        /* 点遮罩关闭整卷 */
  ok('点遮罩关掉整卷', !paperOpen() && countOpen() === 0);

  /* --- 4. PK 弹窗 vs 其它 --- */
  q('#factsFab').click();
  ok('已知信息先开', factsOpen());
  if (typeof askAdmin === 'function') {
    askAdmin(null);
    ok('管理员弹窗打开时其它浮层全收', adminOpen() && !factsOpen() && countOpen() === 1,
       'open=' + countOpen());
    q('#adminCancel').click();
    ok('取消后清空', countOpen() === 0, 'open=' + countOpen());
  } else {
    out.push('SKIP 没有 askAdmin');
  }

  /* --- 5. 切 Tab 收浮层 --- */
  q('#factsFab').click();
  q('#unitToggle').click();
  ok('两个都开只能剩一个', countOpen() <= 1, 'open=' + countOpen());
  q('.tab-btn[data-tab="wrong"]').click();
  ok('切到错题本后浮层全收', countOpen() === 0, 'open=' + countOpen());
  q('.tab-btn[data-tab="practice"]').click();
  ok('切回练习页无残留', countOpen() === 0);

  /* --- 6. 灯泡自己开关仍正常（互斥不能把它弄坏） --- */
  q('#factsFab').click();
  ok('灯泡能打开抽屉', factsOpen());
  q('#factsFab').click();
  ok('再点灯泡能收起', !factsOpen());
  q('#factsFab').click();
  q('#factsClose').click();
  ok('关闭按钮仍有效', !factsOpen());
  q('#factsFab').click();
  q('#factsMask').click();
  ok('遮罩仍有效', !factsOpen());

  /* --- 7. 浮层层级：抽屉不会被半透明遮罩挡死 --- */
  q('#factsFab').click();
  var fz = getComputedStyle(q('#factsBox')).zIndex;
  var mz = getComputedStyle(q('#factsMask')).zIndex;
  ok('抽屉在遮罩之上', Number(fz) > Number(mz), fz + ' > ' + mz);
  var fbz = getComputedStyle(q('#factsFab')).zIndex;
  ok('灯泡在最上层', Number(fbz) > Number(fz), fbz + ' > ' + fz);
} catch (e) {
  out.push('FAIL 自测抛异常: ' + e.message);
  out.push('STACK ' + String(e.stack || '').split('\n').slice(0, 4).join(' | '));
}
if (errs.length) out = out.concat(errs);
document.getElementById('__out').textContent = out.join('\n');
document.title = out.filter(function (l) { return l.indexOf('FAIL') === 0; }).length +
                 ' fails / ' + out.length;
