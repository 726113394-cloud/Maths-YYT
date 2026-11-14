/* 截图用：切到「编学号·数字编码」 */
(function () {
  var t = problemTemplates.filter(function (x) { return x.kp === '编学号·数字编码'; })[0];
  selectedUnits = ['大数'];
  formSel = ['base', 'choice', 'judge'];
  syncUnitUI();
  var one = newQuestion(t);
  questions = [one]; current = 0;
  render();
  window.scrollTo(0, 0);
})();
