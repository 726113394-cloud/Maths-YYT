/* 独立页自测：真实点击驱动竖式练习台 */
var out = [];
var ok = function (name, cond, extra) {
  out.push((cond ? 'PASS ' : 'FAIL ') + name + (extra !== undefined ? ' :: ' + extra : ''));
};
var info = function (s) { out.push('INFO ' + s); };
var q = function (s) { return document.querySelector(s); };
var errs = [];

window.addEventListener('error', function (e) { errs.push('JSERROR ' + e.message); });

try {
  ok('关卡按钮 3 个', document.querySelectorAll('.v-lv').length === 3);
  ok('当前关卡高亮', document.querySelectorAll('.v-lv.on').length === 1);
  ok('题目文字含被除数', q('#vText').textContent.indexOf(String(vertQ.a)) >= 0, q('#vText').textContent.slice(0, 40));
  ok('竖式格子已渲染', document.querySelectorAll('#vGrid .vs-cell').length > 6,
     document.querySelectorAll('#vGrid .vs-cell').length);
  ok('只有一个高亮空格', document.querySelectorAll('#vGrid .vs-cell.blank.lit').length === 1);
  ok('讲解区有题干', q('#vAsk').textContent.length > 4, q('#vAsk').textContent.slice(0, 30));
  ok('选项 4 个', document.querySelectorAll('#vOpts .v-opt').length === 4);
  ok('第 1 步标签', /第 1 \//.test(q('#vStepTag').textContent), q('#vStepTag').textContent);

  /* 先答错一次 */
  var s0 = vertQ.slots[0];
  var wi = s0.opts.findIndex(function (x) { return x !== s0.ans; });
  q('#vOpts .v-opt[data-vopt="' + wi + '"]').click();
  ok('答错标红且给提示', document.querySelectorAll('#vOpts .v-opt.wrong').length === 1 &&
     q('#vFb').classList.contains('no') && q('#vFb').textContent.length > 4);
  ok('答错后进度不动', vertQ.st.idx === 0);

  /* 一路走完 */
  var p0 = { a: vertQ.a, b: vertQ.b, q: vertQ.q, r: vertQ.r, slots: vertQ.slots.length };
  var guard = 0;
  while (vertQ && !vertQ.st.solved && guard++ < 400) {
    var s = vertQ.slots[vertQ.st.idx];
    var btn = q('#vOpts .v-opt[data-vopt="' + s.opts.indexOf(s.ans) + '"]');
    if (!btn) { out.push('FAIL 找不到正确选项 step ' + vertQ.st.idx); break; }
    btn.click();
  }
  ok('全部步骤走完', vertQ.st.solved === true, p0.slots + ' 步 / guard=' + guard);
  ok('答案卡出现', getComputedStyle(q('#vDone')).display !== 'none');
  ok('讲解区收起', getComputedStyle(q('#vPlaying')).display === 'none');
  ok('答案卡写了商和余数',
     q('#vDone').textContent.indexOf(String(p0.q)) >= 0 &&
     (p0.r === 0 || q('#vDone').textContent.indexOf(String(p0.r)) >= 0),
     q('#vDone').textContent.replace(/\s+/g, ' ').slice(0, 110));
  ok('竖式没有残留空格', document.querySelectorAll('#vGrid .vs-cell.blank').length === 0);

  /* 竖式里填出来的数必须和真算的一致 */
  var filled = {};
  document.querySelectorAll('#vGrid .vs-cell').forEach(function (c) {
    var r = c.style.gridRow || getComputedStyle(c).gridRowStart;
    var col = c.style.gridColumn || getComputedStyle(c).gridColumnStart;
    filled[r + ':' + col] = c.textContent;
  });
  var m = String(vertQ.b).length;
  var qStr = '';
  vertQ.model.rounds.forEach(function (rd) {
    qStr += filled['1:' + (m + 1 + rd.qCol)] || '';
  });
  ok('竖式里商拼出来等于答案', Number(qStr) === p0.q, qStr + ' vs ' + p0.q);

  /* 换一题 / 重做 */
  
  /* 三个关卡都能出题 */
  [1, 2, 3].forEach(function (lv) {
    q('.v-lv[data-vlv="' + lv + '"]').click();
    ok('关卡 ' + lv + ' 切换成功', vertLevel === lv && q('.v-lv[data-vlv="' + lv + '"]').classList.contains('on'));
    ok('关卡 ' + lv + ' 商位数正确', String(vertQ.q).length === lv, vertQ.q);
    ok('关卡 ' + lv + ' 验算成立', vertQ.b * vertQ.q + vertQ.r === vertQ.a,
       vertQ.a + '/' + vertQ.b + '=' + vertQ.q + '…' + vertQ.r);
    ok('关卡 ' + lv + ' 有高亮空格', document.querySelectorAll('#vGrid .vs-cell.blank.lit').length === 1);
  });

  /* 网格不溢出视口（手机宽度） */
  var grid = q('#vGrid').getBoundingClientRect();
  info('视口宽 ' + window.innerWidth + ' / 竖式宽 ' + Math.round(grid.width));
  ok('竖式不超出视口', grid.width <= window.innerWidth, Math.round(grid.width));
} catch (e) {
  out.push('FAIL 自测抛异常: ' + e.message);
  out.push('STACK ' + String(e.stack || '').split('\n').slice(0, 4).join(' | '));
}

if (errs.length) out = out.concat(errs);
document.getElementById('__out').textContent = out.join('\n');
document.title = out.filter(function (l) { return l.indexOf('FAIL') === 0; }).length + ' fails / ' + out.length;
