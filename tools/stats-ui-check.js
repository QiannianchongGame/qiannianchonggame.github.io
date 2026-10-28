// 正式游戏页面与实际统计 SQL 的浏览器集成；全部使用隔离内存数据库。
'use strict';
const assert = require('node:assert/strict'), fs = require('node:fs'), path = require('node:path');
const { pathToFileURL } = require('node:url');
const { chromium, webkit } = require('playwright');
const root = path.join(__dirname, '..');
const release = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const config = JSON.parse(fs.readFileSync(path.join(root, 'src/stats-config.json'), 'utf8'));
const game = 'https://qiannianchonggame.github.io/';
async function run(browser, name, api, fixtures) {
  const db = fixtures.testDatabase(), errors = [], messages = [];
  let fail = false, loseResponse = false;
  const contexts = [];
  async function context(mobile = false) {
    const c = await browser.newContext({ viewport: mobile ? { width: 390, height: 844 } : { width: 1440, height: 950 }, hasTouch: mobile, isMobile: mobile }); contexts.push(c);
    await c.route(game, r => r.fulfill({ contentType: 'text/html', body: release }));
    await c.route(config.endpoint, async route => {
      if (fail) return route.fulfill({ status: 503, headers: { 'Access-Control-Allow-Origin': new URL(game).origin }, body: '{}' });
      const req = route.request(); messages.push(JSON.parse(req.postData()));
      const response = await api.handleStats(new Request(config.endpoint, { method: req.method(), headers: { Origin: new URL(game).origin }, body: req.postData() }), db);
      if (loseResponse) { loseResponse = false; return route.abort(); }
      await route.fulfill({ status: response.status, headers: Object.fromEntries(response.headers), body: await response.text() });
    });
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
  const tab = await c.newPage(); await tab.goto(game); await tab.locator('.site-stats[data-state="ready"]').waitFor(); await start(tab); await count(1, 2);
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
  await start(phone); await count(2, 3);
  await title(p); await count(2, 3); await title(tab); await count(1, 3);
  await phone.evaluate(() => { Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => 'hidden' }); document.dispatchEvent(new Event('visibilitychange')); });
  await count(0, 3);
  fail = true; await p.evaluate(() => window.dispatchEvent(new Event('online'))); await p.locator('.site-stats[data-state="error"]').waitFor();
  assert.equal(await p.locator('[data-stat="visits"]').innerText(), '—', '失败不能伪装为零或旧实时数字');
  fail = false; await p.evaluate(() => window.dispatchEvent(new Event('online'))); await p.locator('.site-stats[data-state="ready"]').waitFor();
  await p.reload(); await p.locator('.site-stats[data-state="ready"]').waitFor(); await count(0, 4);
  const retry = await c.newPage(); loseResponse = true; await retry.goto(game); await retry.locator('.site-stats[data-state="error"]').waitFor();
  await retry.evaluate(() => window.dispatchEvent(new Event('online'))); await retry.locator('.site-stats[data-state="ready"]').waitFor(); await count(0, 5);
  await Promise.all([p.waitForEvent('load'), p.locator('.lbtn[lang="en"]').click()]); await p.locator('.site-stats[data-state="ready"]').waitFor(); assert((await p.locator('.site-stats').innerText()).includes('Total visits'));
  await Promise.all([p.waitForEvent('load'), p.locator('.lbtn[lang="ja"]').click()]); await p.locator('.site-stats[data-state="ready"]').waitFor(); assert((await p.locator('.site-stats').innerText()).includes('累計アクセス'));
  const offline = await other.newPage(); let calls = 0; offline.on('request', r => { if (r.url() === config.endpoint) calls++; });
  await offline.goto(pathToFileURL(path.join(root, '千年虫.html')).href); assert((await offline.locator('.site-stats').innerText()).includes('离线模式')); assert.equal(calls, 0);
  assert.deepEqual(errors, []); for (const item of contexts) await item.close(); db.close();
  console.log(name + ': 累计访问、实际开局与返回标题、多标签去重、两位玩家、后台离线、失败恢复、重试去重、中英日及手机布局通过');
}
(async () => {
  const api = await import(pathToFileURL(path.join(root, 'services/qiannianchong-stats/lib/stats.mjs')));
  const fixtures = await import(pathToFileURL(path.join(root, 'services/qiannianchong-stats/scripts/stats-test.mjs')));
  const edge = process.env.UI_CHECK_BROWSER || 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
  const runs = [['edge', chromium, fs.existsSync(edge) ? { executablePath: edge } : {}]];
  if (process.argv.includes('--webkit')) runs.push(['webkit', webkit, {}]);
  for (const [name, type, opts] of runs) { const browser = await type.launch({ headless: true, ...opts }); try { await run(browser, name, api, fixtures); } finally { await browser.close(); } }
})().catch(error => { console.error(error); process.exitCode = 1; });
