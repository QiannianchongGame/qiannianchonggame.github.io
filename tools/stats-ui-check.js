// 正式游戏页面与实际统计 SQL 的浏览器集成；全部使用隔离内存数据库。
'use strict';
const assert = require('node:assert/strict'), fs = require('node:fs'), path = require('node:path');
const { pathToFileURL } = require('node:url');
const { createServer } = require('node:https'), { execFileSync } = require('node:child_process'), os = require('node:os');
const { chromium, webkit } = require('playwright');
const root = path.join(__dirname, '..');
const release = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const config = JSON.parse(fs.readFileSync(path.join(root, 'src/stats-config.json'), 'utf8'));
const servers = new Set();
async function run(browser, name, api, fixtures) {
  const db = fixtures.testDatabase(), errors = [], messages = [];
  let fail = false, loseResponse = false;
  // 使用真实 HTTPS 请求验证刷新与退出；浏览器拦截路由可能丢弃卸载期间的 keepalive 请求。
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'wyjm-stats-tls-'));
  const key = path.join(temp, 'key.pem'), cert = path.join(temp, 'cert.pem');
  execFileSync(process.env.STATS_CHECK_OPENSSL || (fs.existsSync('D:/Git/usr/bin/openssl.exe') ? 'D:/Git/usr/bin/openssl.exe' : 'openssl'), ['req', '-x509', '-newkey', 'ec', '-pkeyopt', 'ec_paramgen_curve:prime256v1', '-nodes', '-days', '1', '-subj', '/CN=localhost', '-keyout', key, '-out', cert], { stdio: 'ignore' });
  let game, endpoint, html;
  const server = createServer({ key: fs.readFileSync(key), cert: fs.readFileSync(cert) }, async (req, res) => {
    try {
      if (req.url.split('?')[0] !== '/api/stats') { res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' }); return res.end(html); }
      if (fail) { res.writeHead(503); return res.end('{}'); }
      let body = ''; for await (const chunk of req) body += chunk;
      if (body) messages.push(JSON.parse(body));
      const response = await api.handleStats(new Request(endpoint, { method: req.method, headers: req.headers, ...(body ? { body } : {}) }), db);
      if (loseResponse) { loseResponse = false; return req.socket.destroy(); }
      res.writeHead(response.status, Object.fromEntries(response.headers)); res.end(await response.text());
    } catch (error) { res.writeHead(500); res.end(String(error)); }
  });
  servers.add(server); await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  game = `https://127.0.0.1:${server.address().port}/`; endpoint = game + 'api/stats';
  html = release.replace(config.endpoint, endpoint).replace('"https://qiannianchonggame.github.io"', JSON.stringify(new URL(game).origin));
  fs.unlinkSync(key); fs.unlinkSync(cert); fs.rmdirSync(temp);
  const contexts = [];
  async function context(mobile = false) {
    const c = await browser.newContext({ viewport: mobile ? { width: 390, height: 844 } : { width: 1440, height: 950 }, hasTouch: mobile, isMobile: mobile, ignoreHTTPSErrors: true }); contexts.push(c);
    c.on('page', p => { p.setDefaultTimeout(10000); p.on('pageerror', e => errors.push(e.message)); }); return c;
  }
  const button = (p, label) => p.getByRole('button', { name: label, exact: true });
  const count = async (online, visits) => {
    await new Promise(async (resolve, reject) => {
      const end = Date.now() + 6000;
      while (Date.now() < end) { const s = await api.snapshot(db); if (s.online === online && s.visits === visits) return resolve(); await new Promise(r => setTimeout(r, 25)); }
      reject(new Error(`统计不符：期望 ${visits}/${online}，实际 ${JSON.stringify(await api.snapshot(db))}；最近事件 ${JSON.stringify(messages.slice(-6))}`));
    });
  };
  async function start(p) { await button(p, '新的调查').click(); await button(p, '开始').click(); await p.locator('.card').click(); }
  async function title(p) { if (await p.locator('#phoneFab').isVisible()) await p.locator('#phoneFab').click(); await p.locator('#phTabs button').nth(5).click(); await button(p, '返回标题画面').click(); }
  const c = await context(), p = await c.newPage(); await p.goto(game);
  await p.locator('.site-stats[data-state="ready"]').waitFor(); await count(0, 1);
  assert.equal(await p.locator('[data-stat="visits"]').innerText(), '1'); assert.equal(await p.locator('[data-stat="online"]').innerText(), '0');
  await start(p); await count(1, 1);
  const tab = await c.newPage(); await tab.goto(game); await tab.locator('.site-stats[data-state="ready"]').waitFor(); await start(tab); await count(1, 1);
  assert.equal(messages.filter(x => x.event === 'visit')[0].visitorId, messages.filter(x => x.event === 'visit')[1].visitorId);
  const other = await context(true), phone = await other.newPage(); await phone.goto(game); await phone.locator('.site-stats[data-state="ready"]').waitFor();
  if (process.env.UI_CHECK_OUTPUT) { fs.mkdirSync(process.env.UI_CHECK_OUTPUT, { recursive: true }); await phone.screenshot({ path: path.join(process.env.UI_CHECK_OUTPUT, name + '-stats-mobile.png') }); }
  assert(await phone.locator('.site-stats').evaluate(el => el.getBoundingClientRect().right <= innerWidth));
  await phone.setViewportSize({ width: 844, height: 390 });
  assert((await phone.locator('.title h1').boundingBox()).y >= 0);
  await phone.locator('.site-stats').scrollIntoViewIfNeeded();
  const statsRect = await phone.locator('.site-stats').boundingBox(), footRect = await phone.locator('.title .foot').boundingBox();
  assert(statsRect.y >= 0 && statsRect.y + statsRect.height <= 390 && footRect.y >= statsRect.y + statsRect.height, '横屏统计应可滚动到达且不与页脚重叠');
  if (process.env.UI_CHECK_OUTPUT) await phone.screenshot({ path: path.join(process.env.UI_CHECK_OUTPUT, name + '-stats-landscape.png') });
  await phone.setViewportSize({ width: 390, height: 844 });
  await start(phone); await count(2, 2);
  await title(p); await count(2, 2); await title(tab); await count(1, 2);
  await phone.evaluate(() => { Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => 'hidden' }); document.dispatchEvent(new Event('visibilitychange')); });
  await count(0, 2);
  fail = true; await p.evaluate(() => window.dispatchEvent(new Event('online'))); await p.locator('.site-stats[data-state="error"]').waitFor();
  assert.equal(await p.locator('[data-stat="visits"]').innerText(), '—', '失败不能伪装为零或旧实时数字');
  fail = false; await p.evaluate(() => window.dispatchEvent(new Event('online'))); await p.locator('.site-stats[data-state="ready"]').waitFor();
  const visitId = await p.evaluate(() => sessionStorage.getItem('y2k_stats_visit'));
  for (let i = 0; i < 3; i++) {
    await p.reload(); await p.locator('.site-stats[data-state="ready"]').waitFor(); await count(0, 2);
    assert.equal(await p.evaluate(() => sessionStorage.getItem('y2k_stats_visit')), visitId, '刷新应沿用原访问标识');
  }
  const retryContext = await context(), retry = await retryContext.newPage(); loseResponse = true; await retry.goto(game); await retry.locator('.site-stats[data-state="error"]').waitFor();
  await retry.evaluate(() => window.dispatchEvent(new Event('online'))); await retry.locator('.site-stats[data-state="ready"]').waitFor(); await count(0, 3);
  await Promise.all([p.waitForEvent('load'), p.locator('.lbtn[lang="en"]').click()]); await p.locator('.site-stats[data-state="ready"]').waitFor(); assert((await p.locator('.site-stats').innerText()).includes('Total visits'));
  await Promise.all([p.waitForEvent('load'), p.locator('.lbtn[lang="ja"]').click()]); await p.locator('.site-stats[data-state="ready"]').waitFor(); assert((await p.locator('.site-stats').innerText()).includes('累計アクセス'));
  await count(0, 3);
  // 退出其中一页再进入，另一页仍打开，不应增加。
  await p.goto('about:blank'); await p.goto(game); await p.locator('.site-stats[data-state="ready"]').waitFor(); await count(0, 3);
  // 所有页面都退出后，同一个浏览器重新进入才新增一次。
  const visitor = await p.evaluate(() => localStorage.getItem('y2k_stats_visitor'));
  await Promise.all([p.goto('about:blank'), tab.goto('about:blank')]);
  const deadline = Date.now() + 6000;
  while ((await db.prepare('SELECT COUNT(*) AS n FROM presence WHERE visitor_id = ? AND present = 1').bind(visitor).first()).n) {
    if (Date.now() > deadline) throw new Error('退出没有结束访问：' + JSON.stringify(messages.filter(m => m.visitorId === visitor).slice(-12)));
    await new Promise(resolve => setTimeout(resolve, 25));
  }
  await p.goto(game); await p.locator('.site-stats[data-state="ready"]').waitFor(); await count(0, 4);
  assert.notEqual(await p.evaluate(() => sessionStorage.getItem('y2k_stats_visit')), visitId);
  await p.reload(); await p.locator('.site-stats[data-state="ready"]').waitFor(); await count(0, 4);
  const offline = await other.newPage(); let calls = 0; offline.on('request', r => { if (r.url() === config.endpoint) calls++; });
  await offline.goto(pathToFileURL(path.join(root, '千年虫.html')).href); assert((await offline.locator('.site-stats').innerText()).includes('离线模式')); assert.equal(calls, 0);
  assert.deepEqual(errors, []); for (const item of contexts) await item.close(); server.closeAllConnections(); await new Promise(resolve => server.close(resolve)); servers.delete(server); db.close();
  console.log(name + ': 多次刷新、多标签、切换语言、后台访问、请求重试均不重复累计，全部退出再进入才新增；在线人数和手机布局通过');
}
(async () => {
  const api = await import(pathToFileURL(path.join(root, 'services/qiannianchong-stats/lib/stats.mjs')));
  const fixtures = await import(pathToFileURL(path.join(root, 'services/qiannianchong-stats/scripts/stats-test.mjs')));
  const edge = process.env.UI_CHECK_BROWSER || 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
  const runs = [['edge', chromium, fs.existsSync(edge) ? { executablePath: edge } : {}]];
  if (process.argv.includes('--webkit')) runs.push(['webkit', webkit, {}]);
  for (const [name, type, opts] of runs) { const browser = await type.launch({ headless: true, ...opts }); try { await run(browser, name, api, fixtures); } finally { await browser.close(); } }
})().catch(error => { for (const server of servers) { server.closeAllConnections(); server.close(); } console.error(error); process.exitCode = 1; });
