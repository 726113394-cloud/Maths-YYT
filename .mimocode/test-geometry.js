/* 校验新增的几何模板：数值是否自洽、选项是否互不相同、正确答案是否唯一 */
const fs = require('fs');

const src = fs.readFileSync(process.env.TEMP + '\\math_check4.js', 'utf8');

function grabFn(name) {
  const re = new RegExp('function ' + name + '\\s*\\([\\s\\S]*?\\n\\}');
  const m = src.match(re);
  if (!m) throw new Error('missing fn ' + name);
  return m[0];
}
function grabConst(name) {
  const re = new RegExp('(?:const|let) ' + name + '\\s*=\\s*[\\s\\S]*?\\n\\};');
  const m = src.match(re);
  if (!m) throw new Error('missing const ' + name);
  return m[0];
}

/* 取出要测的模板对象：以 kp 为锚，抓到该对象结束 */
function grabTemplate(kp) {
  const at = src.indexOf("kp: '" + kp + "'");
  if (at < 0) throw new Error('找不到模板 ' + kp);
  /* 从该行往前找最近的 '{' 作为对象起点（模板以 {\n  unit: 开头） */
  let start = src.lastIndexOf('\n{', at);
  if (start < 0) throw new Error('找不到对象起点 ' + kp);
  /* 从 kp 往后做括号配平，找到对象终点 */
  let i = src.indexOf('{', start);
  let depth = 0, inStr = null, esc = false;
  for (; i < src.length; i++) {
    const ch = src[i];
    if (inStr) {
      if (esc) { esc = false; continue; }
      if (ch === '\\') { esc = true; continue; }
      if (ch === inStr) inStr = null;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === '`') { inStr = ch; continue; }
    if (ch === '{') depth++;
    else if (ch === '}') { depth--; if (depth === 0) { i++; break; } }
  }
  return src.slice(src.indexOf('{', start), i);
}

const prelude = `
function randInt(a,b){return Math.floor(Math.random()*(b-a+1))+a;}
function pick(a){return a[Math.floor(Math.random()*a.length)];}
function shuffleAll(arr){const a=arr.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));const t=a[i];a[i]=a[j];a[j]=t;}return a;}
const SC_NAME = ['小明','小红','小刚','丽丽','琪琪','兵兵'];
function numWrongs(v, extra) {
  const cands = shuffleAll([v*10,v*2,v+10,v+100,v-10,v+1,Math.round(v/10),v*100].concat(extra||[]));
  const out=[];
  cands.forEach(x=>{ if(out.length>=3) return; if(!Number.isInteger(x)||x<=0||x===v||out.includes(x)) return; out.push(x); });
  let k=1;
  while(out.length<3){ const c=v+k*7; if(c!==v&&!out.includes(c)) out.push(c); k++; }
  return out;
}
function repairOption(str, used) {
  const nums = String(str).match(/\\d+(?:\\.\\d+)?/g) || [];
  for (let i=0;i<nums.length;i++){ const v=Number(nums[i]);
    for (const nv of [v+1,v-1,v+2,v-2]) { if(!isFinite(nv)||nv<=0) continue;
      const t=String(str).replace(nums[i], String(Math.round(nv*100)/100));
      if (used.indexOf(t)<0) return t; } }
  return String(str)+'？';
}
function textWrongs(correct, list) {
  const c=String(correct); const out=[]; const taken=[c];
  list.slice(0,3).map(String).forEach(x=>{ let cand=x;
    if(taken.indexOf(cand)>=0) cand=repairOption(cand,taken);
    if(taken.indexOf(cand)>=0) cand=cand+'？';
    taken.push(cand); out.push(cand); });
  let k=1;
  while(out.length<3){ const s=c+'？'.repeat(k); if(taken.indexOf(s)<0){taken.push(s);out.push(s);} k++; }
  return out;
}
function S(q, correct, wrongs, extra) {
  const c=String(correct); const used=[c];
  const fixed=wrongs.slice(0,3).map(String).map(w=>{ let cand=w;
    if(used.indexOf(cand)>=0) cand=repairOption(cand,used);
    if(used.indexOf(cand)>=0) cand=cand+'？';
    used.push(cand); return cand; });
  const pool=shuffleAll([c,...fixed]); const e=extra||{};
  return { q, options: pool, answer: pool.indexOf(c),
    correct: e.ok||'ok', wrong: e.no||'no', reveals: e.reveals||[] };
}
function S2(q, correct, wrongs, extra) { return S(q, correct, textWrongs(correct, wrongs), extra); }
`;

const kps = ['三角形的外角', '等边三角形求角', '求内角·按角分类', '选择题·内角和', '等腰三角形·等分角'];
const tplSrc = kps.map(k => {
  const t = grabTemplate(k);
  return 'const T_' + kps.indexOf(k) + ' = ' + t + ';';
}).join('\n');

const body = prelude + tplSrc +
  '\nmodule.exports = { list: [' + kps.map((k, i) => 'T_' + i).join(',') + '] };';
const mod = { exports: {} };
new Function('module', body)(mod);
const list = mod.exports.list;

let fail = 0;
const bad = m => { if (fail < 30) console.log('FAIL: ' + m); fail++; };
const num = s => Number(String(s).replace(/[^\d.\-]/g, ''));

list.forEach(function (tpl, ti) {
  const kp = kps[ti];
  const seenText = new Set();
  for (let i = 0; i < 1200; i++) {
    const p = tpl.gen();
    if (!p || !p.text || !p.steps || !p.steps.length) { bad(kp + ' 生成不完整'); continue; }
    seenText.add(p.text);

    /* 步骤自检 */
    p.steps.forEach((s, si) => {
      if (!s.q || !s.options) bad(kp + ' 第' + (si + 1) + '步结构不全');
      if (s.options.length !== 4) bad(kp + ' 第' + (si + 1) + '步选项不是4个: ' + s.options);
      if (new Set(s.options).size !== 4) bad(kp + ' 第' + (si + 1) + '步选项重复: ' + s.options);
      if (s.answer < 0 || s.answer > 3) bad(kp + ' 第' + (si + 1) + '步答案索引越界');
      if (/？\s*$/.test(String(s.options[s.answer]))) bad(kp + ' 第' + (si + 1) + '步正确项被加了问号');
      s.options.forEach(o => {
        if (o === undefined || o === null || String(o).trim() === '') bad(kp + ' 选项为空');
        if (String(o).indexOf('？') >= 0) bad(kp + ' 第' + (si + 1) + '步出现补问号的选项: ' + s.options);
        if (String(o).indexOf('undefined') >= 0 || String(o).indexOf('NaN') >= 0) bad(kp + ' 选项含 undefined/NaN: ' + s.options);
      });
    });

    if (tpl.noAnswer) continue;   /* 选择题不填数字，答案在最后一步 */

    /* 数值模板：答案必须和题面自洽 */
    if (typeof p.answer !== 'number' || !isFinite(p.answer)) { bad(kp + ' answer 不是数字: ' + p.answer); continue; }
    if (p.answer <= 0) bad(kp + ' answer 不为正: ' + p.answer + ' | ' + p.text);
    if (p.unit !== '°') bad(kp + ' 单位应为 °，实际 ' + p.unit);

    const t = p.text;
    const a = (t.match(/∠A = (\d+)°/) || [])[1];
    const b = (t.match(/∠B = (\d+)°/) || [])[1];
    const x = (t.match(/∠BAD = (\d+)°/) || t.match(/∠1 = (\d+)°/) || [])[1];
    const apex = (t.match(/顶角是? ?(\d+)°/) || t.match(/顶角 (\d+)°/) || [])[1];

    if (kp === '三角形的外角') {
      const A = Number(a), B = Number(b);
      if (p.answer !== A + B) bad(kp + ' 外角应为 A+B=' + (A + B) + '，实际 ' + p.answer + ' | ' + t);
      const c = 180 - A - B;
      if (c <= 0) bad(kp + ' 内角为负');
      if (A <= 0 || B <= 0) bad(kp + ' 题目数值解析失败 | ' + t);
    }
    if (kp === '等边三角形求角') {
      const X = Number(x);
      if (p.answer !== 180 - 60 - X) bad(kp + ' 应为 180-60-' + X + '=' + (120 - X) + '，实际 ' + p.answer + ' | ' + t);
    }
    if (kp === '求内角·按角分类') {
      /* 从题面拿两个角 */
      const m = t.match(/分别是 (\d+)° 和 (\d+)°/);
      const m2 = t.match(/两个角分别是 (\d+)° 和 (\d+)°/);
      const m3 = t.match(/两个角是 (\d+)° 和 (\d+)°/);
      const g = m || m2 || m3;
      if (!g) { bad(kp + ' 题面解析失败 | ' + t); }
      else {
        const A = Number(g[1]), B = Number(g[2]);
        if (p.answer !== 180 - A - B) bad(kp + ' 应为 180-' + A + '-' + B + '，实际 ' + p.answer);
        if (p.answer <= 0) bad(kp + ' 第三角为负');
      }
    }
    if (kp === '等腰三角形·等分角') {
      const A = Number(apex);
      if (!A) { bad(kp + ' 顶角解析失败 | ' + t); continue; }
      const base = (180 - A) / 2;
      if (!Number.isInteger(base)) bad(kp + ' 底角不是整数: ' + base);
      const half = base / 2;
      if (!Number.isInteger(half)) bad(kp + ' 半个底角不是整数: ' + half);
      if (p.answer !== 180 - base) bad(kp + ' ∠5 应为 180-' + base + '=' + (180 - base) + '，实际 ' + p.answer + ' | ' + t);
      if (A % 4 !== 0) bad(kp + ' 顶角不是 4 的倍数: ' + A);
    }
  }
  console.log(kp.padEnd(22) + ' 1200 题 OK, 题面变体 ' + seenText.size);
});

/* 题库整体：每个模板都要能出题，且池子不为空 */
console.log(fail === 0 ? 'ALL GEOMETRY TEMPLATE TESTS PASSED' : 'TOTAL FAILURES: ' + fail);


