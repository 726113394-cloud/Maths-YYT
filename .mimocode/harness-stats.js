/* 自测：竖式填空（图的每一格和答案是否一致）+ 统计表填空 + 条形统计图制图（拖拽）
   原则：一切从题目自身的数据重算，不维护第二张"标准答案表"。
   竖式那张图不是抽查几个数，而是把每个 <text> 按坐标还原成"第几行第几列"，
   再和手写竖式的规矩逐格比对 —— 图错一格就会被抓到。 */
var out = [];
var ok = function (name, cond, extra) {
  out.push((cond ? 'PASS ' : 'FAIL ') + name + (extra !== undefined ? ' :: ' + extra : ''));
};
var info = function (s) { out.push('INFO ' + s); };
var q = function (s) { return document.querySelector(s); };
var errs = [];
window.addEventListener('error', function (e) {
  errs.push('JSERROR ' + e.message + ' @' + e.filename + ':' + e.lineno + ':' + e.colno +
    (e.error && e.error.stack ? '\n' + e.error.stack : ''));
});

try {
  var byKp = function (kp) {
    return problemTemplates.filter(function (t) { return t.kp === kp; })[0];
  };

  /* ================= 1. 竖式填空 ================= */
  var tVer = byKp('竖式填空');
  ok('有「竖式填空」模板', !!tVer);

  /* 把 SVG 里的 <text> 按坐标还原成 cells["行,列"]，行列按坐标排序得到 */
  function readCells(svgSrc) {
    var re = /<text x="([\d.]+)" y="([\d.]+)"[^>]*>([\s\S]*?)<\/text>/g, m;
    var xs = {}, ys = [];
    while ((m = re.exec(svgSrc))) { xs[m[1]] = 1; }
    re.lastIndex = 0;
    var XS = Object.keys(xs).map(Number).sort(function (a, b) { return a - b; });
    var cells = {}, rowSet = {};
    while ((m = re.exec(svgSrc))) {
      var ci = XS.indexOf(Number(m[1]));
      cells[m[2] + ',' + ci] = m[3];
      rowSet[m[2]] = 1;
    }
    var YS = Object.keys(rowSet).map(Number).sort(function (a, b) { return a - b; });
    var grid = {};
    Object.keys(cells).forEach(function (k) {
      var p = k.split(',');
      grid[YS.indexOf(Number(p[0])) + ',' + p[1]] = cells[k];
    });
    return { grid: grid, XS: XS, YS: YS };
  }

  var vBad = [], vWhich = [0, 0];
  for (var i = 0; i < 300; i++) {
    var p = tVer.gen();
    var mm = /在计算 (\d+) ÷ (\d+)/.exec(p.text);
    if (!mm) { vBad.push('题干里读不出被除数和除数'); continue; }
    var a = +mm[1], b = +mm[2], ds = String(a).split('').map(Number), bStr = String(b);
    if (ds.length !== 3 || bStr.length !== 2) { vBad.push(a + '÷' + b + ' 不是「两位除三位」'); continue; }
    /* 独立重算两轮长除法 */
    var cur1 = ds[0] * 10 + ds[1];
    var q1 = Math.floor(cur1 / b), p1 = q1 * b, r1 = cur1 - p1;
    var cur2 = r1 * 10 + ds[2];
    var q2 = Math.floor(cur2 / b), p2 = q2 * b, r2 = cur2 - p2;
    if (!(q1 >= 1 && q1 <= 9 && q2 >= 1 && q2 <= 9 && r1 > 0)) {
      vBad.push(a + '÷' + b + ' 商里有 0 或首轮余数为 0'); continue;
    }

    var rc = readCells(p.figure);
    if (rc.XS.length !== 5) { vBad.push(a + '÷' + b + ' 列数不是 5（=2 位除数 + 括号 + 3 位被除数）：' + rc.XS.length); continue; }
    if (rc.YS.length !== 6) { vBad.push(a + '÷' + b + ' 行数不是 6：' + rc.YS.length); continue; }
    var g = rc.grid;
    /* 行 1(商) 行 2(被除数/除数) 行 3(第一次乘积) 行 4(落下后的数) 行 5(第二次乘积) 行 6(余数) */
    var exp = {};
    exp['1,0'] = bStr[0];
    exp['1,1'] = bStr[1];
    ds.forEach(function (d, k) { exp['1,' + (2 + k)] = String(d); });
    var put = function (key, val) {
      var s = String(val), endCol = +key.split(',')[1], row = key.split(',')[0];
      for (var n = 0; n < s.length; n++) exp[row + ',' + (endCol - s.length + 1 + n)] = s[n];
    };
    put('2,3', p1);      /* 第一次乘积，右端对齐商的第一位（第 2 列） */
    put('3,4', cur2);    /* 余数连着落下的那一位 */
    put('4,4', p2);
    put('5,4', r2);
    /* 商的两格：一格是真数字，一格是 □。商的第 k 位画在被除数第 k+1 位上面，
       而被除数第 1 位是第 3 列（前两列是 2 位除数，括号那一列没有字） */
    var qCol = [3, 4];
    var boxAt = [];
    if (g['0,' + qCol[0]] === '□') boxAt.push(0);
    if (g['0,' + qCol[1]] === '□') boxAt.push(1);
    if (boxAt.length !== 1) {
      vBad.push(a + '÷' + b + ' 商的两位里 □ 有 ' + boxAt.length + ' 个（' +
                g['0,' + qCol[0]] + '/' + g['0,' + qCol[1]] + '）');
      continue;
    }
    var which = boxAt[0];                  /* 0 = 商第一位，1 = 商第二位 */
    vWhich[which]++;
    var trueQ = [q1, q2];
    exp['0,' + qCol[which]] = '□';
    exp['0,' + qCol[1 - which]] = String(trueQ[1 - which]);

    var badKey = '';
    Object.keys(exp).forEach(function (k) {
      if (badKey) return;
      if (g[k] !== exp[k]) badKey = '第 ' + (Number(k.split(',')[0]) + 1) + ' 行第 ' +
        (Number(k.split(',')[1]) + 1) + ' 列应为 ' + exp[k] + '，画的是 ' + (g[k] === undefined ? '空' : g[k]);
    });
    var extra = Object.keys(g).filter(function (k) { return exp[k] === undefined; });
    if (badKey) { vBad.push(a + '÷' + b + '：' + badKey); continue; }
    if (extra.length) { vBad.push(a + '÷' + b + ' 多画了格子：' + extra.join('/')); continue; }
    if (p.answer !== trueQ[which]) {
      vBad.push(a + '÷' + b + '：□ 挖在商第 ' + (which + 1) + ' 位，应填 ' + trueQ[which] + '，答案是 ' + p.answer);
    }
  }
  ok('竖式填空 300 题：每格位置、每个数字、□ 与答案全部一致', vBad.length === 0,
     vBad.length ? vBad.slice(0, 3).join(' ｜ ') : '全部通过');
  info('□ 挖在商第一位 ' + vWhich[0] + ' 次、第二位 ' + vWhich[1] + ' 次');

  /* ================= 2. 统计表填空 ================= */
  var tTab = byKp('统计表填空');
  ok('有「统计表填空」模板', !!tTab);
  var tBad = [], tSumOnly = 0;
  for (var j = 0; j < 300; j++) {
    var pt = tTab.gen();
    if (!pt.after) { tBad.push('没有统计表'); continue; }
    var box = document.createElement('div');
    box.innerHTML = pt.after;
    var tds = Array.prototype.slice.call(box.querySelectorAll('tbody td'));
    if (tds.length !== 4) { tBad.push('表的列数不对：' + tds.length); continue; }
    var blankAt = -1;
    tds.forEach(function (td, k) { if (td.querySelector('.tblank')) blankAt = k; });
    if (blankAt < 0) { tBad.push('表里没有 □'); continue; }
    var num = function (td) { return Number(String(td.textContent).trim()); };
    var shown = [0, 1, 2].map(function (k) { return k === blankAt ? 0 : num(tds[k]); });
    var parts = shown[0] + shown[1] + shown[2];
    var want = blankAt === 3 ? parts : num(tds[3]) - parts;
    if (pt.answer !== want) {
      tBad.push('挖第 ' + blankAt + ' 格，按表算应为 ' + want + '，答案是 ' + pt.answer); continue;
    }
    if (!(pt.answer > 0 && pt.answer < 200)) { tBad.push('答案不合理：' + pt.answer); continue; }
    /* 每一步都要是 4 个互不相同的选项，且正确项下标合法 */
    pt.steps.forEach(function (s, si) {
      if (!s.options || s.options.length !== 4) tBad.push('第 ' + (si + 1) + ' 步不是 4 个选项');
      else {
        var seen = {}, dup = '';
        s.options.forEach(function (o) { if (seen[o]) dup = o; seen[o] = 1; });
        if (dup) tBad.push('第 ' + (si + 1) + ' 步选项重复：' + dup);
        if (!(s.answer >= 0 && s.answer < 4)) tBad.push('第 ' + (si + 1) + ' 步正确项下标越界');
        if (/\？/.test(s.options.join(''))) tBad.push('第 ' + (si + 1) + ' 步出现补位「？」');
      }
    });
    /* 合计那一格是留给最后答案框填的，不要求出现在步骤选项里 */
    if (blankAt === 3 && !pt.steps.some(function (s) {
      return (s.options || []).indexOf(String(pt.answer)) >= 0;
    })) tSumOnly++;
  }
  ok('统计表填空 300 题：□ 处的数算得对、选项干净', tBad.length === 0,
     tBad.length ? tBad.slice(0, 3).join(' ｜ ') : '全部通过');
  info('其中「合计」题型 ' + tSumOnly + ' 道：答案由最后那个答案框填写');

  /* ================= 3. 条形统计图制图 ================= */
  var tBar = byKp('条形统计图制图');
  ok('有「条形统计图制图」模板', !!tBar);
  var bBad = [];
  for (var k3 = 0; k3 < 300; k3++) {
    var pb = tBar.gen();
    var box2 = document.createElement('div');
    box2.innerHTML = pb.after || '';
    var cells = Array.prototype.slice.call(box2.querySelectorAll('tbody td'));
    if (cells.length !== 5) { bBad.push('表的列数不对：' + cells.length); continue; }
    if (box2.querySelector('.tblank')) { bBad.push('制图题的统计表不该有 □'); continue; }
    var vals = [0, 1, 2, 3].map(function (n) { return Number(cells[n].textContent.trim()); });
    var total = Number(cells[4].textContent.trim());
    var sum = vals.reduce(function (x, y) { return x + y; }, 0);
    var mx = Math.max.apply(null, vals);
    var bs = pb.steps[pb.steps.length - 1];
    if (!bs.bars) { bBad.push('最后一步不是拖拽制图'); continue; }
    if (JSON.stringify(bs.need) !== JSON.stringify(vals)) {
      bBad.push('要画的高度 ' + bs.need.join('/') + ' 和表里 ' + vals.join('/') + ' 不一致'); continue;
    }
    if (total !== sum) bBad.push('表里合计 ' + total + ' ≠ ' + sum);
    if (vals.some(function (v) { return !(v >= 1 && v <= bs.max); })) bBad.push('有人数超出刻度：' + vals.join('/'));
    if (bs.max !== 12) bBad.push('刻度上限不是 12：' + bs.max);
    if (bs.labels.length !== 4) bBad.push('标签不是 4 个');
    /* 前两步的正确选项必须就是算出来的数 */
    var s1 = pb.steps[0], s2 = pb.steps[1];
    if (s1.options[s1.answer] !== String(mx)) bBad.push('第 1 步「最多」应为 ' + mx + '，选项却是 ' + s1.options[s1.answer]);
    if (s2.options[s2.answer] !== String(sum)) bBad.push('第 2 步「一共」应为 ' + sum + '，选项却是 ' + s2.options[s2.answer]);
    if (pb.answer !== sum) bBad.push('题目答案字段不是总人数');
  }
  ok('制图 300 题：要画的高度、合计、最多都对得上', bBad.length === 0,
     bBad.length ? bBad.slice(0, 3).join(' ｜ ') : '全部通过');

  /* ================= 4. 制图题的界面：拖拽 / 微调 / 检验 ================= */
  /* 练习区默认是收起的（没选单元就不显示），量位置前必须先把单元选上 */
  selectedUnits = ['平均数'];
  formSel = ['base', 'choice', 'judge'];
  buildSession();
  syncUnitUI();               /* 练习区显隐由它管：没选单元时 #practiceBody 是 display:none */
  var one = newQuestion(tBar);
  questions = [one]; current = 0;
  render();
  var bs2 = one.problem.steps[2];

  for (var s = 0; s < 2; s++) {
    var stp = one.problem.steps[s], guard0 = 0;
    while (one.state.stepIdx === s && guard0++ < 20) {
      var btnPrev = q('#steps .step.active .opt[data-opt="' + stp.answer + '"]');
      if (!btnPrev || btnPrev.disabled) break;
      btnPrev.click();
    }
  }
  ok('制图题前两步能走通', one.state.stepIdx === 2, one.state.stepIdx);
  ok('统计表出现在题干下面', !!q('#qtext .qtable'));
  ok('条形图渲染出 4 根条形', document.querySelectorAll('#steps .bcol').length === 4,
     document.querySelectorAll('#steps .bcol').length);
  ok('坐标线 0~12 共 13 条', document.querySelectorAll('#steps .bchart-ln').length === 13,
     document.querySelectorAll('#steps .bchart-ln').length);
  var chkB = q('#steps .chk-btn');
  ok('一根都没画时「检验」是灰的', !!chkB && chkB.disabled);
  var plot = q('#steps .bchart-plot');
  var pr = plot.getBoundingClientRect();
  /* 量到 0 的时候要能一眼看出是哪个祖先把它藏了 */
  if (!pr.height) {
    var chain = [], el = plot;
    while (el && el !== document.documentElement) {
      var cs = getComputedStyle(el);
      chain.push((el.id ? '#' + el.id : el.className || el.tagName) + '=' + cs.display);
      el = el.parentElement;
    }
    info('祖先链：' + chain.join(' < '));
  }
  info('条形图绘图区 ' + Math.round(pr.width) + '×' + Math.round(pr.height) +
       ' （视口 ' + window.innerWidth + '×' + window.innerHeight + '）');
  ok('绘图区有真实高度（没被隐藏容器压成 0）', pr.height > 100, Math.round(pr.height));
  var labels = Array.prototype.map.call(document.querySelectorAll('#steps .bcol .bfill'), function (f) {
    return f.textContent;
  }).join('');
  ok('条形顶上不显示数字（否则读刻度就白练了）', !/\d/.test(labels));

  /* 微调按钮 */
  document.querySelector('#steps .bstep[data-k="0"][data-d="1"]').click();
  ok('点 + 加一格', barGet(one.state.picked[2], 0) === 1, barGet(one.state.picked[2], 0));
  ok('画了之后「检验」可点', !q('#steps .chk-btn').disabled);
  document.querySelector('#steps .bstep[data-k="0"][data-d="-1"]').click();
  ok('点 − 减一格', barGet(one.state.picked[2], 0) === 0);
  document.querySelector('#steps .bstep[data-k="0"][data-d="1"]').click();
  for (var z = 0; z < 20; z++) document.querySelector('#steps .bstep[data-k="0"][data-d="1"]').click();
  ok('加不过刻度上限', barGet(one.state.picked[2], 0) === bs2.max, barGet(one.state.picked[2], 0));

  /* 拖拽：按住第一根，手指移到目标高度 */
  function dragTo(k, v) {
    var plotNow = q('#steps .bchart-plot');
    var r = plotNow.getBoundingClientRect();
    var col = document.querySelector('#steps .bcol[data-k="' + k + '"]');
    var cr = col.getBoundingClientRect();
    col.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, cancelable: true,
      clientX: cr.left + cr.width / 2, clientY: r.bottom - v / bs2.max * r.height }));
    document.dispatchEvent(new PointerEvent('pointerup', { bubbles: true }));
    return barGet(questions[current].state.picked[2], k);
  }
  ok('拖到第 ' + bs2.need[0] + ' 格', dragTo(0, bs2.need[0]) === bs2.need[0], dragTo(0, bs2.need[0]));
  ok('拖到 0 就是空的', dragTo(0, 0) === 0, dragTo(0, 0));

  /* 故意画错一根，检验必须判错 */
  dragTo(0, bs2.need[0]);
  dragTo(1, bs2.need[1] === bs2.max ? bs2.max - 1 : bs2.need[1] + 1);
  q('#steps .chk-btn').click();
  ok('画错了不放过', one.state.stepIdx === 2, one.state.stepIdx);
  ok('画错了有提示', !!q('#steps .fb-inline.no'));

  /* 四根全部拖对，检验通过 */
  for (var kk = 0; kk < 4; kk++) dragTo(kk, bs2.need[kk]);
  var dragged = [0, 1, 2, 3].map(function (n) { return barGet(one.state.picked[2], n); });
  ok('四根都拖到位', JSON.stringify(dragged) === JSON.stringify(bs2.need), dragged.join('/'));
  var chk2 = q('#steps .chk-btn');
  if (chk2) chk2.click();
  ok('全对了就进阶', one.state.stepIdx === 3, one.state.stepIdx);
  ok('制图题最后是自动判定（noAnswer）', one.problem.noAnswer === true &&
     (one.state.solved === true || one.state.stepIdx === one.problem.steps.length));

  /* 超时那一条也要能扛住画图题（最后一步没有 options） */
  var one3 = newQuestion(tBar);
  questions = [one3]; current = 0;
  render();
  var timeoutOk = true, timeoutMsg = '';
  try { handleTimeout(); } catch (e) { timeoutOk = false; timeoutMsg = e.message; }
  ok('画图题超时不会报错', timeoutOk, timeoutMsg);
  ok('超时也进了错题本', wrongBook.length > 0 && !!wrongBook[0].correctChoice,
     wrongBook.length ? wrongBook[0].correctChoice : '空');

  /* ================= 5. 统计表填空整条流程 ================= */
  var one2 = newQuestion(tTab);
  questions = [one2]; current = 0;
  render();
  ok('填表题没有条形图', !q('#steps .bcol'));
  ok('填表题有统计表', !!q('#qtext .qtable'));
  ok('填表题最后要填答案框（答案能落进去）', one2.problem.noAnswer !== true);
  var guard1 = 0;
  while (one2.state.stepIdx < one2.problem.steps.length && guard1++ < 30) {
    var sp2 = one2.problem.steps[one2.state.stepIdx];
    var b2 = q('#steps .step.active .opt[data-opt="' + sp2.answer + '"]');
    if (!b2 || b2.disabled) break;
    b2.click();
  }
  ok('填表题步骤能全部答对', one2.state.stepIdx === one2.problem.steps.length, one2.state.stepIdx);
  var inp = q('#ansInput');
  ok('出现答案输入框', !!inp);
  if (inp) {
    inp.value = String(one2.problem.answer);
    var ck3 = q('#checkBtn');
    if (ck3) ck3.click();
    ok('填对答案就判定正确', one2.state.solved === true, String(one2.state.solved));
  }
} catch (e) {
  out.push('FAIL 脚本异常 :: ' + (e && e.message) + ' @ ' + (e && e.stack ? e.stack.split('\n')[1] : ''));
}

if (errs.length) out.push.apply(out, errs);
document.getElementById('__out').textContent = out.join('\n');
