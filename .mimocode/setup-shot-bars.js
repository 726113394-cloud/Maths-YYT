/* 截图用：切到「条形统计图制图」，走完前两步，画上两根条形，滚到图那里 */
(function () {
  var t = problemTemplates.filter(function (x) { return x.kp === '条形统计图制图'; })[0];
  selectedUnits = ['平均数'];
  formSel = ['base', 'choice', 'judge'];
  syncUnitUI();
  var one = newQuestion(t);
  questions = [one]; current = 0;
  render();
  for (var s = 0; s < 2; s++) {
    var stp = one.problem.steps[s], guard = 0;
    while (one.state.stepIdx === s && guard++ < 12) {
      var b = document.querySelector('#steps .step.active .opt[data-opt="' + stp.answer + '"]');
      if (!b || b.disabled) break;
      b.click();
    }
  }
  var bs = one.problem.steps[2];
  var plot = document.querySelector('#steps .bchart-plot');
  if (plot) {
    var r = plot.getBoundingClientRect();
    [0, 1].forEach(function (k) {
      var col = document.querySelector('#steps .bcol[data-k="' + k + '"]');
      var cr = col.getBoundingClientRect();
      col.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, cancelable: true,
        clientX: cr.left + cr.width / 2,
        clientY: r.bottom - bs.need[k] / bs.max * r.height }));
      document.dispatchEvent(new PointerEvent('pointerup', { bubbles: true }));
    });
  }
  var target = document.querySelector('#steps .bchart');
  if (target) window.scrollTo(0, target.getBoundingClientRect().top + window.scrollY - 120);
})();
