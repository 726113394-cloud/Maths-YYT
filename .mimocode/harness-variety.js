/* 变体统计 v2：用「整题指纹」量（题干 + 统计表 + 配图 + 所有选项 + 答案），
   因为选择题/判断题的题干是固定的，变体藏在选项里，只看 text 会低估。
   另外模拟一次真实练习（单单元 30 题），数一数同一道题重复出现几次。 */
var out = [];
var info = function (s) { out.push('INFO ' + s); };
var errs = [];
window.addEventListener('error', function (e) { errs.push('JSERROR ' + e.message); });

var N = 800;

function fp(p) {
  var s = String(p.text);
  if (p.after) s += '#' + p.after;
  if (p.figure) s += '#' + p.figure;
  (p.steps || []).forEach(function (st) {
    /* 选项顺序每次都被打乱，必须排序，否则同一道题会被算成新题 */
    s += '#' + (st.options ? st.options.slice().sort().join('~') : (st.q || ''));
  });
  s += '#' + p.answer;
  return s;
}

/* 内容指纹：把人名去掉。判断题/选择题常写「小明说……」，人名一换就 18 种，
   但学生看到的是同一句判断——那正是老师说的「同款题目」。 */
function fpContent(p) {
  var s = fp(p);
  /* SC_NAME 是 script 顶层的 const，不挂在 window 上，得直接引用 */
  try {
    SC_NAME.forEach(function (n) { s = s.split(n).join('○'); });
  } catch (e) {}
  return s;
}

try {
  var rows = [], crash = [];
  problemTemplates.forEach(function (t) {
    var seen = {}, n = 0, seenC = {}, nc = 0;
    for (var i = 0; i < N; i++) {
      var p;
      try { p = t.gen(); } catch (e) { crash.push(t.kp + ' :: ' + e.message); break; }
      if (!p || !p.text) { crash.push(t.kp + ' :: 生成不完整'); break; }
      var k = fp(p);
      if (!seen[k]) { seen[k] = 1; n++; }
      var kc = fpContent(p);
      if (!seenC[kc]) { seenC[kc] = 1; nc++; }
    }
    rows.push({ kp: t.kp, unit: t.unit, n: n, nc: nc });
  });
  rows.sort(function (a, b) { return a.nc - b.nc; });

  info('题库 ' + problemTemplates.length + ' 个模板，每个采 ' + N + ' 次');
  info('「内容变体」= 去掉人名后的整题指纹（判断题/选择题看这一列）');
  info('—— 内容变体最少的 30 个 ——');
  rows.slice(0, 30).forEach(function (r, i) {
    out.push('LOW ' + (i + 1) + '. ' + r.kp + ' [' + r.unit + ']  内容 ' + r.nc +
      ' 种 / 含人名 ' + r.n + ' 种');
  });
  var few = rows.filter(function (r) { return r.nc < 40; });
  info('内容变体 < 40 的模板 ' + few.length + ' 个：' +
    few.map(function (r) { return r.kp + '(' + r.nc + ')'; }).join('、'));

  /* ---------- 模拟真实练习：单单元连做 30 题，数重复 ---------- */
  function resetRecent() {
    recentProblems = []; recentSet = new Set();
    Object.keys(perTplRecent).forEach(function (k) { delete perTplRecent[k]; });
  }
  function simulate(unitKey, count, keepRecent) {
    selectedUnits = [unitKey];
    formSel = ['base', 'choice', 'judge'];
    if (!keepRecent) resetRecent();
    tplQueue = [];
    questions = []; current = 0;
    buildSession();
    while (questions.length < count) { if (!appendQuestion()) break; }
    var cnt = {}, dup = 0, list = questions.map(function (q) { return fp(q.problem); });
    list.forEach(function (k) {
      cnt[k] = (cnt[k] || 0) + 1;
      if (cnt[k] > 1) dup++;
    });
    return { total: list.length, distinct: Object.keys(cnt).length, dup: dup };
  }

  var units = ['除法', '大数', '图形', '周长', '平均数', '探索', '度量衡', '几何', '比大小'];
  info('—— 单单元连做 30 题：重复题数（每次都是新的空去重表，模拟老师开新一次练习）——');
  var totalDup = 0, totalQ = 0;
  units.forEach(function (u) {
    var r = simulate(u, 30);
    totalDup += r.dup; totalQ += r.total;
    out.push('SIM ' + u + '：30 题里去重后 ' + r.distinct + ' 种，重复出现 ' + r.dup + ' 次');
  });
  info('合计重复率 ' + Math.round(totalDup / totalQ * 100) + '%（' + totalDup + '/' + totalQ + '）');

  /* ---------- 模拟：连开 5 次练习，跨次重复（不清去重表 = 真实使用） ---------- */
  info('—— 连开 5 次「除法」练习（刷新页面也算连着用），跨次撞题数 ——');
  resetRecent();
  var all = {}, crossDup = 0, n5 = 0;
  for (var s = 0; s < 5; s++) {
    selectedUnits = ['除法']; formSel = ['base', 'choice', 'judge'];
    tplQueue = []; questions = []; current = 0;
    buildSession();
    while (questions.length < 12) { if (!appendQuestion()) break; }
    questions.forEach(function (q) {
      var k = fp(q.problem);
      n5++;
      if (all[k]) crossDup++; else all[k] = 1;
    });
  }
  out.push('SIM 5×12 题：共 ' + n5 + ' 题，跨次撞题 ' + crossDup + ' 次（' +
    Math.round(crossDup / n5 * 100) + '%）');

  /* ---------- 同一题型连出 12 次，看还剩多少种配数 ---------- */
  info('—— 单个题型连出 12 道，去重后能剩几种（变体 < 12 的题型会露馅）——');
  var thin = [];
  ['顶角与底角的倍数', '方格纸画图形', '单位换算陷阱', '统计表填空', '间隔与数量',
   '数三角形·组合图形', '数长方形', '多边形内角和', '古代度量衡', '周长相等',
   '统计图读图', '判断题·周长'].forEach(function (kp) {
    var t = problemTemplates.filter(function (x) { return x.kp === kp; })[0];
    if (!t) return;
    resetRecent();
    var seen = {}, n = 0;
    for (var i = 0; i < 12; i++) {
      var p = makeProblem(t);
      var k = fp(p);
      if (!seen[k]) { seen[k] = 1; n++; }
    }
    thin.push(kp + ' ' + n + '/12');
  });
  out.push('THIN ' + thin.join('、'));

  /* ---------- 全题库选项体检 ---------- */
  var optBad = [];
  problemTemplates.forEach(function (t) {
    for (var i = 0; i < 200; i++) {
      var p;
      try { p = t.gen(); } catch (e) { break; }
      (p.steps || []).forEach(function (s, si) {
        if (!s.options) return;
        /* 多选题（勾条件）、方格纸、条形图本来就不是四选一，不按四选一体检 */
        if (s.multi || s.grid || s.bars) return;
        var tag = t.kp + ' 第' + (si + 1) + ' 步';
        /* 比较大小用的是 S3（>, <, = 只有三个答案），是设计如此，不算问题 */
        var isS3 = s.options.length === 3 && s.options.every(function (o) {
          return o === '>' || o === '<' || o === '=';
        });
        if (s.options.length !== 4 && !isS3) { optBad.push(tag + ' 选项数 ' + s.options.length); return; }
        var seen = {}, dup = '';
        s.options.forEach(function (o) { if (seen[o]) dup = o; seen[o] = 1; });
        if (dup) optBad.push(tag + ' 选项重复：' + dup);
        if (s.options.join('').indexOf('？') >= 0) optBad.push(tag + ' 出现补位「？」');
        if (!(s.answer >= 0 && s.answer < s.options.length)) optBad.push(tag + ' 正确项下标越界');
      });
    }
  });
  out.push((optBad.length ? 'FAIL' : 'PASS') + ' 全题库选项体检（每题采 200 次）' +
    (optBad.length ? '：' + optBad.slice(0, 8).join(' ｜ ') : ''));

  if (crash.length) out.push('FAIL 生成异常：' + crash.slice(0, 5).join(' ｜ '));
} catch (e) {
  out.push('FAIL 脚本异常 :: ' + (e && e.message) + ' @ ' + (e.stack ? e.stack.split('\n')[1] : ''));
}
if (errs.length) out.push.apply(out, errs);
document.getElementById('__out').textContent = out.join('\n');
