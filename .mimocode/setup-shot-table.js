/* 截图用：切到「统计表填空」 */
(function () {
  var t = problemTemplates.filter(function (x) { return x.kp === '统计表填空'; })[0];
  selectedUnits = ['平均数'];
  formSel = ['base', 'choice', 'judge'];
  syncUnitUI();
  var one = newQuestion(t);
  questions = [one]; current = 0;
  render();
  window.scrollTo(0, 0);
})();
