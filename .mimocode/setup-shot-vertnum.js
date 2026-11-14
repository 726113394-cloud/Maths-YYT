/* 截图用：切到「竖式里的数表示什么」 */
(function () {
  var t = problemTemplates.filter(function (x) { return x.kp === '竖式里的数表示什么'; })[0];
  selectedUnits = ['除法'];
  formSel = ['base', 'choice', 'judge'];
  syncUnitUI();
  var one = newQuestion(t);
  questions = [one]; current = 0;
  render();
  window.scrollTo(0, 0);
})();
