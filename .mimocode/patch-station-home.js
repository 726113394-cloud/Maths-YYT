/* 站台首页：加练习统计条 + 让内容垂直居中，消除底部大片空白 */
const fs = require('fs');
const FILE = 'C:\\Users\\Administrator\\Desktop\\数学思维闯关\\数学思维站台.html';
let s = fs.readFileSync(FILE, 'utf8');

function once(n, label) {
  const c = s.split(n).length - 1;
  if (c !== 1) throw new Error('锚点「' + label + '」出现 ' + c + ' 次');
  return s.indexOf(n);
}

/* ---- CSS：接到站台样式表末尾（用 .pmeta 那段做锚，位置确定） ---- */
const cssAnchor = `.pmeta button.on{background:linear-gradient(135deg,#8B6BFF,#6B4CE6);color:#fff;}`;
once(cssAnchor, 'pmeta css');
s = s.replace(cssAnchor, cssAnchor + `

/* ---- 首页：内容垂直居中 + 练习统计条（把底部那片空白用掉） ---- */
#home{display:flex;flex-direction:column;}
#home .home-h,#home .lead,#home .sublead{flex:none;}
#home .cards{margin:auto 0;flex:none;}
#home .hstats{flex:none;}
#home .foot-hint{margin-top:18px;flex:none;}

.hstats{display:flex;flex-wrap:wrap;gap:8px;margin:16px 2px 0;}
.hstats span{display:inline-flex;align-items:center;gap:5px;
  background:rgba(255,255,255,.8);border-radius:99px;padding:7px 13px;
  font-size:12px;font-weight:800;color:#6B5FA8;
  box-shadow:0 2px 0 rgba(150,120,220,.10);}
.hstats b{color:#6B4CE6;font-weight:900;font-size:13px;}
.hstats .empty{background:transparent;box-shadow:none;color:#A79FC2;padding-left:2px;font-weight:700;}`);

/* ---- HTML：统计条放在卡片和脚注之间 ---- */
const htmlAnchor = `    <p class="foot-hint">这个文件已经把两个练习都装在里面了，可以单独拷走使用。<br>`;
once(htmlAnchor, 'foot-hint');
s = s.replace(htmlAnchor, `    <div class="hstats" id="hstats"></div>\n` + htmlAnchor);

/* ---- JS：读同域 localStorage 里的练习记录 ---- */
const jsAnchor = `  /* ---------- 启动 ---------- */
  paintPerf();`;
once(jsAnchor, 'boot');
s = s.replace(jsAnchor, `  /* ---------- 首页统计（同域，能直接读两个模块的小账本） ---------- */
  function renderStats() {
    var box = document.getElementById('hstats');
    if (!box) return;
    var bits = [];
    function grab(key) {
      try { return JSON.parse(localStorage.getItem('math4a.' + key)); } catch (e) { return null; }
    }
    var wb = grab('wrongBook');
    if (wb && wb.length) bits.push('<span>📕 待重做错题 <b>' + wb.length + '</b> 道</span>');
    var vs = grab('vertStat');
    if (vs && vs.done) bits.push('<span>✏️ 竖式已完成 <b>' + vs.done + '</b> 题</span>');
    var hs = grab('history');
    if (hs && hs.length) bits.push('<span>📊 累计练习 <b>' + hs.length + '</b> 题</span>');
    if (bits.length) {
      box.innerHTML = bits.join('');
    } else {
      box.innerHTML = '<span class="empty">还没有练习记录，选一个开始吧</span>';
    }
  }

  /* ---------- 启动 ---------- */
  renderStats();
  paintPerf();`);

/* 回目录时刷新一次统计（刚练完回来能看到变化） */
const homeAnchor = `  function goHome() {`;
once(homeAnchor, 'goHome');
s = s.replace(homeAnchor, `  function goHome() {
    renderStats();`);

fs.writeFileSync(FILE, s, 'utf8');
console.log('STATION home stats added, ' + (fs.statSync(FILE).size / 1024).toFixed(0) + ' KB');
