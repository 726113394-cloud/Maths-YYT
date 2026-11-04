/* 截图用：把页面切到「竖式填空」那道题 */
(function () {
  var t = problemTemplates.filter(function (x) { return x.kp === '竖式填空'; })[0];
  selectedUnits = ['除法'];
  formSel = ['base', 'choice', 'judge'];
  syncUnitUI();
  var one = newQuestion(t);
  questions = [one]; current = 0;
  render();
  window.scrollTo(0, 0);
})();
