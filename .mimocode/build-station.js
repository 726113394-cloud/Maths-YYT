/* 把两个模块整份内联进站台。可重复运行：只替换 <template> 里的内容。 */
const fs = require('fs');
const path = require('path');

const DIR = 'C:\\Users\\Administrator\\Desktop\\数学思维闯关';
const STATION = path.join(DIR, 'index.html');   /* 站台就是站点入口 */
const MAP = [
  ['tpl-math', path.join(DIR, '数学思维闯关.html')],
  ['tpl-vert', path.join(DIR, '竖式练习台.html')]
];

let shell = fs.readFileSync(STATION, 'utf8');

MAP.forEach(function (pair) {
  const id = pair[0];
  const file = pair[1];
  const body = fs.readFileSync(file, 'utf8').replace(/^\uFEFF/, '').trim();

  if (/<\/template/i.test(body)) throw new Error(file + ' 里出现了 </template>，不能内联');

  const open = '<template id="' + id + '">';
  const a = shell.indexOf(open);
  if (a < 0) throw new Error('站台里找不到 ' + open);
  const b = shell.indexOf('</template>', a + open.length);
  if (b < 0) throw new Error(id + ' 没有对应的 </template>');

  shell = shell.slice(0, a + open.length) + body + shell.slice(b);
  console.log('INLINE ' + id + '  ' + (body.length / 1024).toFixed(0) + ' KB');
});

fs.writeFileSync(STATION, shell, 'utf8');
console.log('WROTE ' + STATION + '  (' + (fs.statSync(STATION).size / 1024).toFixed(0) + ' KB)');
