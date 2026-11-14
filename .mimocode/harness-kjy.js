/* 自测：按课件包新加的 9 类题型
   原则同 harness-stats：从题干本身重算，不维护第二张答案表。
   另加两条通用体检：选项 4 个互不相同、最终答案不能直接躺在选项里。 */
var out = [];
var ok = function (name, cond, extra) {
  out.push((cond ? 'PASS ' : 'FAIL ') + name + (extra !== undefined ? ' :: ' + extra : ''));
};
var info = function (s) { out.push('INFO ' + s); };
var errs = [];
window.addEventListener('error', function (e) {
  errs.push('JSERROR ' + e.message + ' @' + e.filename + ':' + e.lineno);
});

var N = 300;
var byKp = function (kp) {
  return problemTemplates.filter(function (t) { return t.kp === kp; })[0];
};
var pad2 = function (v) { return String(v).padStart(2, '0'); };

/* 通用体检：把一道题按 300 次跑一遍，逐题过 checkFn，顺便统一检查选项 */
function sweep(kp, checkFn) {
  var tpl = byKp(kp);
  if (!tpl) { ok('有「' + kp + '」模板', false); return null; }
  ok('有「' + kp + '」模板', true);
  var bad = [], leak = 0, optBad = 0;
  for (var i = 0; i < N; i++) {
    var p = tpl.gen();
    var msg = checkFn(p);
    if (msg) bad.push(msg);
    /* 选项体检 */
    (p.steps || []).forEach(function (s, si) {
      if (!s.options) return;
      if (s.options.length !== 4) { optBad++; bad.push(kp + ' 第 ' + (si + 1) + ' 步不是 4 个选项'); return; }
      var seen = {}, dup = '';
      s.options.forEach(function (o) { if (seen[o]) dup = o; seen[o] = 1; });
      if (dup) { optBad++; bad.push(kp + ' 第 ' + (si + 1) + ' 步选项重复：' + dup); }
      if (s.options.join('').indexOf('？') >= 0) { optBad++; bad.push(kp + ' 第 ' + (si + 1) + ' 步出现补位？'); }
      if (!(s.answer >= 0 && s.answer < 4)) { optBad++; bad.push(kp + ' 第 ' + (si + 1) + ' 步正确项越界'); }
    });
    /* 最终答案不能直接作为某个选项存在（不然学生一眼就看到了） */
    if (p.noAnswer !== true && p.steps) {
      var hit = p.steps.some(function (s) {
        return s.options && s.options.indexOf(String(p.answer)) >= 0;
      });
      if (hit) { leak++; bad.push(kp + ' 最终答案 ' + p.answer + ' 出现在步骤选项里'); }
    }
  }
  ok(kp + ' ' + N + ' 题：数值/逻辑都对、选项干净、不泄答案', bad.length === 0,
     bad.length ? bad.slice(0, 3).join(' ｜ ') + '（共 ' + bad.length + ' 处）' : '全部通过');
  return tpl;
}

try {
  /* ================= 1. 编学号 / 门牌号 ================= */
  sweep('编学号·数字编码', function (p) {
    var t = p.text;
    var mXue = /学号是 <b>(\d+)<\/b>/.exec(t);
    var mRule = /前 4 位表示入学年份/;
    if (/哪一年入学/.test(t)) {
      if (!mXue || !mRule) return '缺学号或规则';
      var code = mXue[1];
      if (code.length !== 9) return '学号不是 9 位：' + code;
      if (String(p.answer) !== code.slice(0, 4)) return '年份读错：' + code + ' → ' + p.answer;
      if (!(p.answer >= 2019 && p.answer <= 2025)) return '年份不合理：' + p.answer;
      return '';
    }
    if (/的学号应该是多少/.test(t)) {
      var m = /(\d{4}) 年入学、(\d+) 班、学号 (\d+) 的(男|女)生/.exec(t);
      if (!m) return '写码题干读不出来：' + t.slice(-60);
      var want = m[1] + pad2(m[2]) + pad2(m[3]) + (m[4] === '男' ? '1' : '2');
      if (String(p.answer) !== want) return '学号写错：应为 ' + want + '，答案 ' + p.answer;
      return '';
    }
    if (/住在第几层/.test(t)) {
      var mf = /门牌号是 <b>(\d+)<\/b>/.exec(t);
      if (!mf) return '缺门牌号';
      var c = mf[1];
      if (c.length !== 6) return '门牌号不是 6 位：' + c;
      if (String(p.answer) !== String(Number(c.slice(3, 5)))) return '楼层读错：' + c + ' → ' + p.answer;
      return '';
    }
    if (/门牌号是多少/.test(t)) {
      var mm = /住在 (\d+) 号楼 (\d+) 单元 (\d+) 层 (\d+) 室/.exec(t);
      if (!mm) return '写门牌题干读不出来：' + t.slice(-60);
      var want2 = mm[1] + mm[2] + pad2(mm[3]) + mm[4];
      if (String(p.answer) !== want2) return '门牌号写错：应为 ' + want2 + '，答案 ' + p.answer;
      if (want2.length !== 6) return '写出来的门牌号不是 6 位：' + want2;
      return '';
    }
    return '认不出是哪一问：' + t.slice(0, 40);
  });

  /* ================= 2. 读数里的零 ================= */
  /* 课文原题当基准：读法必须一字不差 */
  var CN = [
    [108154907, '一亿零八百一十五万四千九百零七', 2],
    [80050500, '八千零五万零五百', 2],
    [90000089, '九千万零八十九', 1],
    [139000000, '一亿三千九百万', 0],
    [605010000, '六亿零五百零一万', 2],
    [860000000, '八亿六千万', 0],
    [30050900, '三千零五万零九百', 2],
    [100000000, '一亿', 0],
    [999999999, '九亿九千九百九十九万九千九百九十九', 0]
  ];
  var cnBad = [];
  CN.forEach(function (c) {
    var got = cnRead(c[0]);
    if (got !== c[1]) cnBad.push(c[0] + ' 读作「' + got + '」，应为「' + c[1] + '」');
    var nz = (got.match(/零/g) || []).length;
    if (nz !== c[2]) cnBad.push(c[0] + ' 读零个数 ' + nz + '，应为 ' + c[2]);
  });
  ok('读数函数对上课本原题（9 个基准数）', cnBad.length === 0, cnBad.slice(0, 3).join(' ｜ '));

  sweep('读数里的零', function (p) {
    var t = p.text;
    if (/读 <b>(\d+)<\/b>/.test(t)) {
      var n = Number(/读 <b>(\d+)<\/b>/.exec(t)[1]);
      var r = cnRead(n);
      var nz = (r.match(/零/g) || []).length;
      if (!(nz >= 1 && nz <= 3)) return n + ' 读零个数 ' + nz + ' 不合理';
      if (p.answer !== nz) return n + '：读法「' + r + '」有 ' + nz + ' 个零，答案却是 ' + p.answer;
      if (p.wrongTip.indexOf(r) < 0) return n + ' 的 wrongTip 没带上读法';
      if (/零零/.test(r) || /零$/.test(r) || /^零/.test(r)) return n + ' 的读法格式不对：' + r;
      return '';
    }
    var mr = /读作「<b>(.+?)<\/b>」/.exec(t);
    if (!mr) return '写数题干读不出来';
    var readStr = mr[1];
    /* 从读法倒推：答案必须等于这个读法对应那个数里 0 的个数 */
    var hit = null;
    CN.forEach(function (c) { if (c[1] === readStr) hit = c[0]; });
    var m2 = /「(.+?)」写作 (\d+)/.exec(p.wrongTip);
    if (!m2) return '写数题的 wrongTip 里没有数字';
    var num = m2[2];
    if (String(p.answer) !== String((num.match(/0/g) || []).length)) {
      return readStr + ' → ' + num + '：0 的个数应为 ' + (num.match(/0/g) || []).length + '，答案是 ' + p.answer;
    }
    if (hit !== null && cnRead(hit) !== readStr) return '读法对不上原文';
    return '';
  });

  /* ================= 3. 分类讨论·商的位数 ================= */
  sweep('分类讨论·商的位数', function (p) {
    var m = /□(\d+) ÷ (\d+)/.exec(p.text);
    if (!m) return '题干读不出算式';
    var tail = Number(m[1]), d = Number(m[2]);
    var first = Math.floor(tail / 10);
    var two = function (k) { return (k * 10 + first) >= d; };
    var wantTwo = /商是<b>两位数<\/b>/.test(p.text);
    var wantMin = /最小能填几/.test(p.text);
    var okSet = [];
    for (var k = 1; k <= 9; k++) if (two(k) === wantTwo) okSet.push(k);
    if (!okSet.length) return '没有可填的数';
    var want = wantMin ? Math.min.apply(null, okSet) : Math.max.apply(null, okSet);
    if (p.answer !== want) {
      return '□' + tail + ' ÷ ' + d + ' 商' + (wantTwo ? '两' : '一') + '位数，' +
        (wantMin ? '最小' : '最大') + '应填 ' + want + '，答案 ' + p.answer;
    }
    if (want < 1 || want > 9) return '答案不是一位数：' + want;
    /* 边界检查：再往「不该成立」的方向挪一格，就必须不成立 */
    var other = wantMin ? want - 1 : want + 1;
    if (other >= 1 && other <= 9 && two(other) === wantTwo) return '答案不是边界（' + other + ' 也成立）';
    return '';
  });

  /* ================= 4. 竖式里的数表示什么 ================= */
  sweep('竖式里的数表示什么', function (p) {
    var m = /要把 (\d+) (\S+)每 (\d+) \S+ ?(?:分成|装成) 1 (\S+)/.exec(p.text);
    if (!m) return '题干读不出总量和每份：' + p.text.slice(0, 50);
    var a = Number(m[1]), b = Number(m[3]);
    var ds = String(a).split('').map(Number);
    if (ds.length !== 3) return '被除数不是三位：' + a;
    var cur1 = ds[0] * 10 + ds[1];
    var q1 = Math.floor(cur1 / b), p1 = q1 * b, r1 = cur1 - q1 * b;
    if (q1 < 1 || r1 === 0) return a + '÷' + b + ' 不适合这道题（q1=' + q1 + ' r1=' + r1 + '）';
    var right = p.steps[0].options[p.steps[0].answer];
    var wantPrefix = (q1 * 10) + ' ';
    var wantNum = String(p1 * 10);
    if (right.indexOf(wantPrefix) !== 0) return '正确选项没以「' + q1 * 10 + ' 」开头：' + right;
    if (right.indexOf(wantNum) < 0) return '正确选项里没有 ' + wantNum + '：' + right;
    /* 图：必须圈出第一次的积（第 3 行） */
    var fig = p.figure || '';
    var rects = fig.match(/<rect[^>]*>/g) || [];
    if (rects.length !== 1) return '图里圈出的方框有 ' + rects.length + ' 个';
    var ry = Number(/y="([\d.]+)"/.exec(rects[0])[1]);
    var rw = Number(/width="([\d.]+)"/.exec(rects[0])[1]);
    if (Math.abs(ry - 74) > 1) return '圈错了行（y=' + ry + '，第 3 行应为 74）';
    if (Math.abs(rw - (String(p1).length * 27 - 2)) > 1) return '圈的范围和 ' + p1 + ' 的位数对不上：宽 ' + rw;
    return '';
  });

  /* ================= 5. 上楼梯 ================= */
  sweep('上楼梯', function (p) {
    var t = p.text;
    var ms = /每上一层楼要走 (\d+) 级台阶/.exec(t);
    if (ms) {
      var step = Number(ms[1]);
      var mt = /往上走了 (\d+) 级台阶/.exec(t);
      if (!mt) return '读不出走的总级数';
      var total = Number(mt[1]);
      if (total % step) return '总级数除不尽：' + total + '/' + step;
      var fl = total / step;
      if (p.answer !== fl + 1) return '走了 ' + total + '/' + step + '=' + fl + ' 层，应住 ' + (fl + 1) + ' 楼，答案 ' + p.answer;
      return '';
    }
    var ml = /每上一层要走 (\d+) 级台阶/.exec(t);
    if (ml) {
      var st2 = Number(ml[1]);
      var mf = /家住 (\d+) 楼/.exec(t);
      if (mf) {
        var want = (Number(mf[1]) - 1) * st2;
        if (p.answer !== want) return '住 ' + mf[1] + ' 楼，应走 ' + want + ' 级，答案 ' + p.answer;
        return '';
      }
      var mb = /从 (\d+) 楼走到 (\d+) 楼/.exec(t);
      if (mb) {
        var want2 = (Number(mb[2]) - Number(mb[1])) * st2;
        if (p.answer !== want2) return mb[1] + '→' + mb[2] + ' 楼，应走 ' + want2 + ' 级，答案 ' + p.answer;
        return '';
      }
      return '认不出是哪一问：' + t.slice(0, 40);
    }
    return '题干里没有「每上一层」：' + t.slice(0, 40);
  });

  /* ================= 6. 跨栏跑 ================= */
  sweep('跨栏跑·两头都算', function (p) {
    var m = /第 1 个栏是 (\d+) 米，一共有 (\d+) 个栏，每相邻两个栏之间相隔 (\d+) 米，最后一个栏到终点是 (\d+) 米/.exec(p.text);
    if (!m) return '题干读不出来：' + p.text.slice(0, 50);
    var first = Number(m[1]), n = Number(m[2]), gap = Number(m[3]), last = Number(m[4]);
    var want = first + (n - 1) * gap + last;
    if (p.answer !== want) return n + ' 栏：应 ' + want + ' 米，答案 ' + p.answer;
    if (p.facts.length !== 3) return '条件条数不对';
    return '';
  });

  /* ================= 7. 两旁都算 ================= */
  sweep('两旁都算', function (p) {
    var m = /长 (\d+) 米，在.*?两旁每隔 (\d+) 米/.exec(p.text);
    if (!m) return '题干读不出来：' + p.text.slice(0, 50);
    var L = Number(m[1]), gap = Number(m[2]);
    if (L % gap) return '全长除不尽：' + L + '/' + gap;
    var want = (L / gap + 1) * 2;
    if (p.answer !== want) return L + ' 米每隔 ' + gap + ' 米两旁：应 ' + want + '，答案 ' + p.answer;
    return '';
  });

  /* ================= 8. 往返平均速度 ================= */
  sweep('往返平均速度', function (p) {
    var m = /每分钟骑 (\d+) 米，用了 (\d+) 分钟；原路返回用了 (\d+) 分钟/.exec(p.text);
    if (!m) return '题干读不出来：' + p.text.slice(0, 60);
    var goV = Number(m[1]), t1 = Number(m[2]), t2 = Number(m[3]);
    var dist = goV * t1, total = dist * 2, T = t1 + t2;
    if (total % T) return '总路程除不尽：' + total + '/' + T;
    var mean = total / T;
    if (p.answer !== mean) return '应 ' + mean + ' 米/分，答案 ' + p.answer;
    var backV = dist / t2;
    if (!Number.isInteger(backV)) return '返回速度不是整数：' + backV;
    if ((goV + backV) / 2 === mean) return '两个速度的平均正好等于答案，坑没挖成';
    if (mean === goV) return '平均速度等于去时速度，没有意义';
    return '';
  });

  /* ================= 9. 平均数·改一个数 ================= */
  sweep('平均数·改一个数', function (p) {
    var m = /有 (\d+) 个数，平均数是 (\d+)。如果把其中一个数改成 (\d+)，这 \d+ 个数的平均数就变成了 (\d+)/.exec(p.text);
    if (!m) return '题干读不出来：' + p.text.slice(0, 60);
    var n = Number(m[1]), avg = Number(m[2]), x = Number(m[3]), avg2 = Number(m[4]);
    var want = x - (avg2 - avg) * n;
    if (p.answer !== want) return '应 ' + want + '，答案 ' + p.answer;
    if (want <= 0) return '原来那个数不是正数：' + want;
    if (want === x) return '原来那个数没变化';
    return '';
  });

  /* ================= 10. 新题型能被单元/大题筛出来 ================= */
  var NEW = ['编学号·数字编码', '读数里的零', '分类讨论·商的位数', '竖式里的数表示什么',
             '上楼梯', '跨栏跑·两头都算', '两旁都算', '往返平均速度', '平均数·改一个数'];
  var miss = NEW.filter(function (kp) {
    var t = byKp(kp);
    return !t || ['大数', '除法', '探索', '平均数'].indexOf(t.unit) < 0;
  });
  ok('9 个新模板都挂在已有单元下', miss.length === 0, miss.join('、'));
  var poolHit = miss.length === 0 && NEW.every(function (kp) {
    var t = byKp(kp);
    return problemTemplates.indexOf(t) >= 0 && (t.form || 'base') === (t.form || 'base');
  });
  ok('9 个新模板都在题库数组里', poolHit);

  /* 选中单元 + 全大题时，这些题真能出出来 */
  selectedUnits = ['大数', '除法', '探索', '平均数'];
  formSel = ['base', 'choice', 'judge'];
  var pool = poolTemplates();
  var poolKps = pool.map(function (t) { return t.kp; });
  var notInPool = NEW.filter(function (kp) { return poolKps.indexOf(kp) < 0; });
  ok('选中这 4 个单元后，9 个新题型都在题源里', notInPool.length === 0, notInPool.join('、'));
} catch (e) {
  out.push('FAIL 脚本异常 :: ' + (e && e.message) + ' @ ' + (e && e.stack ? e.stack.split('\n')[1] : ''));
}

if (errs.length) out.push.apply(out, errs);
document.getElementById('__out').textContent = out.join('\n');
