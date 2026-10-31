/* 用 CDP 做真实的移动端截图：node cdp-shot.js <url> <out.png> [w] [h] [setupJS文件] */
const fs = require('fs');
const http = require('http');
const path = require('path');
const { spawn } = require('child_process');

const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

function arg(i, dflt) { return process.argv[i] !== undefined ? process.argv[i] : dflt; }
const url = arg(2);
const out = arg(3);
const W = Number(arg(4, 390));
const H = Number(arg(5, 844));
const setupFile = arg(6, null);
const PORT = 9300 + Math.floor(Math.random() * 500);

if (!url || !out) { console.error('用法: node cdp-shot.js <url> <out.png> [w] [h] [setup.js]'); process.exit(1); }

const sleep = ms => new Promise(r => setTimeout(r, ms));

function getJSON(pathname) {
  return new Promise((resolve, reject) => {
    const req = http.get({ host: '127.0.0.1', port: PORT, path: pathname }, res => {
      let b = '';
      res.on('data', c => b += c);
      res.on('end', () => { try { resolve(JSON.parse(b)); } catch (e) { reject(e); } });
    });
    req.on('error', reject);
    req.setTimeout(4000, () => req.destroy(new Error('timeout')));
  });
}

(async () => {
  const profile = path.join(process.env.TEMP, 'cdp_' + PORT);
  const child = spawn(EDGE, [
    '--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check',
    '--remote-debugging-port=' + PORT,
    '--user-data-dir=' + profile,
    'about:blank'
  ], { stdio: 'ignore' });

  let list = null;
  for (let i = 0; i < 60 && !list; i++) {
    await sleep(200);
    try { list = await getJSON('/json/list'); } catch (e) {}
  }
  if (!list || !list.length) { child.kill(); throw new Error('连不上调试端口'); }

  const page = list.find(t => t.type === 'page') || list[0];
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  let id = 0;
  const pending = new Map();
  const events = [];
  ws.addEventListener('message', ev => {
    const msg = JSON.parse(ev.data);
    if (msg.id && pending.has(msg.id)) {
      const { resolve, reject } = pending.get(msg.id);
      pending.delete(msg.id);
      if (msg.error) reject(new Error(msg.error.message)); else resolve(msg.result);
    } else if (msg.method) {
      events.push(msg.method);
    }
  });
  const send = (method, params) => new Promise((resolve, reject) => {
    const myId = ++id;
    pending.set(myId, { resolve, reject });
    ws.send(JSON.stringify({ id: myId, method, params: params || {} }));
  });

  await new Promise((resolve, reject) => {
    ws.addEventListener('open', resolve);
    ws.addEventListener('error', reject);
  });

  await send('Page.enable');
  await send('Runtime.enable');
  /* 真正的移动端模拟：这一层是 --window-size 给不了的 */
  await send('Emulation.setDeviceMetricsOverride', {
    width: W, height: H, deviceScaleFactor: 2, mobile: true
  });
  await send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });

  await send('Page.navigate', { url });
  for (let i = 0; i < 80 && events.indexOf('Page.loadEventFired') < 0; i++) await sleep(100);
  await sleep(900);

  if (setupFile && fs.existsSync(setupFile)) {
    const code = fs.readFileSync(setupFile, 'utf8');
    try { await send('Runtime.evaluate', { expression: code, awaitPromise: false }); }
    catch (e) { console.error('setup 失败: ' + e.message); }
    await sleep(900);
  }

  const shot = await send('Page.captureScreenshot', { format: 'png', fromSurface: true });
  fs.writeFileSync(out, Buffer.from(shot.data, 'base64'));
  console.log('SHOT ' + out + '  ' + W + 'x' + H + '  ' + fs.statSync(out).size + ' bytes');

  ws.close();
  child.kill();
  await sleep(200);
  process.exit(0);
})().catch(e => { console.error('ERR ' + e.message); process.exit(1); });
