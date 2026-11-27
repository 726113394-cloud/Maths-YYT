/* 截图用：切到「判断题·图形特征」（新题池，选项是长句子） */
(function () {
  var t = problemTemplates.filter(function (x) { return x.kp === '判断题·图形特征'; })[0];
  selectedUnits = ['图形'];
  formSel = ['base', 'choice', 'judge'];
  syncUnitUI();
  var one = newQuestion(t);
  questions = [one]; current = 0;
  render();
  window.scrollTo(0, 0);
})();
