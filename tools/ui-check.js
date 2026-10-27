// 浏览器回归检查。先运行 node tools/build.js，再运行 node tools/ui-check.js [--webkit]。
// 需要可通过 NODE_PATH 找到 Playwright；可用 UI_CHECK_BROWSER 指定 Chromium 的路径。
// 调试接口和测试对话仅注入内存中的测试页面，不写入正式 HTML，也不接触玩家存档。
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const pw = require('playwright');
const root = path.join(__dirname, '..');
const file = path.join(root, '千年虫.html');
const release = fs.readFileSync(file, 'utf8');
assert(release.includes('return { add, boot, lang };'), '请先生成正式版 HTML');
const fixture = {
  contacts2026: { tester: { name: '交互测试', sub: '仅用于自动验证', requires: 'start' } },
  dialogues: [{ id: 'ui_test', contact: 'tester', trigger: 'ui_test', steps: [
    { me: '第一条手动回复' }, { npc: '收到。' }, { me: '第二条手动回复' },
    { choice: [{ text: '确认第一步' }] }, { choice: [{ text: '确认第二步' }] },
  ] }],
};
const debugHTML = release.replace('return { add, boot, lang };', 'return { add, boot, lang, debug };')
  .replace('Y2K.boot();', `Y2K.add(${JSON.stringify(fixture)});Y2K.boot();`);
const output = process.env.UI_CHECK_OUTPUT || path.join(os.tmpdir(), 'wyjm-ui-check');
fs.mkdirSync(output, { recursive: true });

async function start(page, debug = false) {
  await page.getByRole('button', { name: '新的调查', exact: true }).click();
  if (debug) await page.evaluate(() => Y2K.debug.fast(true));
  await page.getByRole('button', { name: '开始', exact: true }).click();
  await page.locator('.card').click();
}
async function rect(locator) { return locator.boundingBox(); }
async function run(browser, name) {
  const errors = [];
  const context = await browser.newContext({ viewport: { width: 1440, height: 950 } });
  context.on('page', p => { p.setDefaultTimeout(7000); p.on('pageerror', e => errors.push(e.message)); });
  const p = await context.newPage();
  await p.goto(pathToFileURL(file).href);
  assert.equal(await p.evaluate(() => typeof Y2K.debug), 'undefined');
  await start(p);
  await p.locator('#phTabs button').nth(2).click();
  await p.locator('.ph-tile').filter({ hasText: '信封里的旧照片' }).click();
  const photo = p.locator('.ph-view svg');
  assert((await rect(photo)).width > 200 && (await rect(photo)).height > 100);
  await p.screenshot({ path: path.join(output, `${name}-photo.png`) });
  await photo.click();
  const canvas = p.locator('.viewer-canvas');
  const initial = (await rect(canvas)).width;
  await p.locator('.viewer').getByRole('button', { name: '放大 +', exact: true }).click();
  assert((await rect(canvas)).width > initial * 1.2);
  await canvas.click({ position: { x: 40, y: 40 } });
  assert(await p.locator('.viewer').isVisible(), '点击图片不应关闭查看器');
  await p.locator('.viewer').getByRole('button', { name: '原始大小', exact: true }).click();
  assert.equal(await p.locator('.viewer output').innerText(), '100%');
  await p.keyboard.press('Escape');
  assert.equal(await p.locator('.viewer').count(), 0);
  await photo.focus(); await p.keyboard.press('Enter');
  assert(await p.locator('.viewer').isVisible());
  await p.locator('.viewer').getByRole('button', { name: '关闭', exact: true }).click();
  console.log(`${name}: 正式 HTML 的照片、缩放、关闭和键盘操作通过`);

  await p.setViewportSize({ width: 390, height: 844 });
  await p.locator('#phoneFab').click();
  assert(await p.locator('.ph-close').isVisible());
  assert((await rect(photo)).width > 200);
  await photo.click();
  const fit = await p.locator('.viewer-scroll').evaluate(el => ({
    width: el.clientWidth, height: el.clientHeight,
    image: el.querySelector('.viewer-canvas').getBoundingClientRect().toJSON(),
  }));
  assert(fit.image.width <= fit.width && fit.image.height <= fit.height);
  await p.screenshot({ path: path.join(output, `${name}-mobile-viewer.png`) });
  await p.locator('.viewer').getByRole('button', { name: '关闭', exact: true }).click();
  await p.locator('.ph-close').click();
  assert(await p.locator('#phoneFab').isVisible());
  assert.equal(await p.locator('#phone').evaluate(el => el.classList.contains('open')), false);
  await p.setViewportSize({ width: 844, height: 390 });
  await p.locator('#phoneFab').click(); await photo.click();
  assert(await p.locator('.viewer-close').isVisible());
  assert(await p.locator('.viewer-scroll').evaluate(el => el.clientHeight > 80));
  await p.keyboard.press('Escape');
  console.log(`${name}: 手机竖屏、横屏、图片适配及收起操作通过`);
  await p.close();

  await context.route('http://wyjm.test/game', route => route.fulfill({ contentType: 'text/html', body: debugHTML }));
  const q = await context.newPage();
  await q.goto('http://wyjm.test/game'); await start(q, true);
  await q.evaluate(() => {
    const d = Y2K.debug; d.setFlag('ui_test'); d.ui.chat = 'tester'; d.renderPhone();
  });
  await q.waitForFunction(() => Y2K.debug.state.wait.tester?.type === 'reply');
  await q.waitForTimeout(150);
  assert.equal(await q.evaluate(() => (Y2K.debug.state.chat.tester || []).length), 0);
  await q.locator('#phFoot button').evaluate(el => { el.click(); el.click(); });
  await q.waitForFunction(() => Y2K.debug.state.wait.tester?.type === 'reply');
  assert.equal(await q.evaluate(() => Y2K.debug.state.chat.tester.filter(m => m.from === 'me').length), 1);
  await q.evaluate(() => localStorage.setItem('y2k_auto', JSON.stringify(Y2K.debug.state)));
  await q.reload();
  await q.getByRole('button', { name: '继续调查', exact: true }).click();
  await q.evaluate(() => { Y2K.debug.fast(true); Y2K.debug.ui.chat = 'tester'; Y2K.debug.renderPhone(); });
  await q.waitForTimeout(150);
  assert.equal(await q.locator('#phFoot button').innerText(), '第二条手动回复');
  assert.equal(await q.evaluate(() => Y2K.debug.state.chat.tester.filter(m => m.from === 'me').length), 1);
  await q.locator('#phFoot button').click();
  await q.locator('#phFoot button').evaluate(el => { el.click(); el.click(); });
  assert.equal(await q.locator('#phFoot button').innerText(), '确认第二步');
  assert.equal(await q.evaluate(() => Y2K.debug.state.chat.tester.filter(m => m.text === '确认第一步').length), 1);
  console.log(`${name}: 单条回复等待发送、快速连点及读档续聊通过`);

  // 在真实的序章对话中输入答案，检查聊天记录只出现一次。
  await q.evaluate(() => { Y2K.debug.ui.chat = 'heman'; Y2K.debug.renderPhone(); });
  await q.waitForFunction(() => Y2K.debug.state.wait.heman?.type === 'choice');
  await q.locator('#phFoot button').first().click();
  await q.waitForFunction(() => Y2K.debug.state.wait.heman?.type === 'puzzle');
  await q.locator('#phFoot button').click();
  await q.locator('#pz_c0_tag').fill('192.168.1.103');
  await q.locator('.dlg98').getByRole('button', { name: '确定', exact: true }).evaluate(el => { el.click(); el.click(); });
  await q.waitForFunction(() => Y2K.debug.state.flags.solved_c0_tag);
  assert.equal(await q.evaluate(() => Y2K.debug.state.chat.heman.filter(m => m.text === '192.168.1.103').length), 1);
  await q.waitForFunction(() => !document.querySelector('#modal .dlg98'));
  console.log(`${name}: 序章实际作答、重复提交保护通过`);

  await q.evaluate(() => {
    const d = Y2K.debug; d.flush(); d.ui.chat = 'tester';
    d.state.chat.tester = Array.from({ length: 45 }, (_, i) => ({ from: 'npc', text: `第 ${i + 1} 条消息。这是一段用于检查阅读位置的长消息。` }));
    d.renderPhone(); document.querySelector('#phBody').scrollTop = 0; d.renderPhone();
  });
  assert.equal(await q.locator('#phBody').evaluate(el => el.scrollTop), 0);
  assert(await q.locator('.chat-latest').isVisible());
  await q.evaluate(() => { Y2K.debug.state.chat.tester.push({ from: 'npc', text: '新消息' }); Y2K.debug.renderPhone(); });
  assert.equal(await q.locator('#phBody').evaluate(el => el.scrollTop), 0);
  await q.locator('.chat-latest').click();
  assert(await q.locator('#phBody').evaluate(el => el.scrollHeight - el.scrollTop - el.clientHeight < 2));
  await q.locator('#phBody').evaluate(el => { el.scrollTop = 65; });
  await q.locator('#phTabs button').nth(2).click();
  await q.locator('#phTabs button').nth(0).click();
  await q.locator('.ph-item').filter({ hasText: '交互测试' }).click();
  assert(Math.abs(await q.locator('#phBody').evaluate(el => el.scrollTop) - 65) < 2);
  await q.locator('#phTabs button').nth(5).click();
  await q.getByRole('button', { name: '存档码（复制 / 粘贴）', exact: true }).click();
  await q.locator('#loadCode').fill('正在输入的内容');
  await q.evaluate(() => Y2K.debug.renderPhone());
  assert.equal(await q.locator('#loadCode').inputValue(), '正在输入的内容');
  assert.equal(await q.locator('#loadCode').evaluate(el => el === document.activeElement), true);
  console.log(`${name}: 阅读位置、回到最新消息、切换页面和表单输入保留通过`);

  // 检查全部手机实物图片，而不只检查用户截图中的一张。
  const badImages = await q.evaluate(() => {
    document.activeElement.blur(); const d = Y2K.debug, bad = [];
    d.ui.tab = 'items'; d.ui.chat = null;
    for (const item of d.D.items2026) {
      d.ui.item = item.id; d.renderPhone();
      for (const svg of document.querySelectorAll('.ph-view svg')) {
        const r = svg.getBoundingClientRect(), vb = svg.viewBox.baseVal;
        // 表格中的小签名是刻意绘制的局部图，按其原始大小判断。
        if (r.width < Math.min(100, vb.width / 2) || r.height < Math.min(40, vb.height / 2)) bad.push(item.id);
      }
    }
    return bad;
  });
  assert.deepEqual(badImages, []);

  // 切换到桌面存档，不绕过图片和窗口的实际按钮。
  await q.evaluate(() => { const d = Y2K.debug; d.flush(); d.state.stage = 'win'; localStorage.setItem('y2k_auto', JSON.stringify(d.state)); });
  await q.reload(); await q.getByRole('button', { name: '继续调查', exact: true }).click();
  await q.evaluate(() => { Y2K.debug.fast(true); Y2K.debug.openFile('c1_photo_open'); });
  const win = q.locator('.win').filter({ has: q.locator('.imgview') });
  const svg = win.locator('.canvas svg');
  const before = (await rect(svg)).width;
  await win.getByRole('button', { name: '放大 +', exact: true }).click();
  assert((await rect(svg)).width > before * 1.1);
  for (let i = 0; i < 8; i++) await win.getByRole('button', { name: '放大 +', exact: true }).click();
  assert(await win.locator('.wbody').evaluate(el => el.scrollWidth > el.clientWidth));
  const edges = await win.locator('.wbody').evaluate(el => ({ body: el.getBoundingClientRect().left, image: el.querySelector('.canvas').getBoundingClientRect().left + el.scrollLeft }));
  assert(edges.image >= edges.body, '放大后左边缘应可滚动到达');
  await win.getByRole('button', { name: '适应窗口', exact: true }).click();
  assert(await win.locator('.wbody').evaluate(el => el.scrollHeight <= el.clientHeight + 4), '适应窗口时应能同时看到照片和说明');
  await win.getByRole('button', { name: '最大化', exact: true }).click();
  const desktop = await rect(q.locator('#desktop')), maximized = await rect(win);
  assert(Math.abs(maximized.height - desktop.height) < 2, '最大化应填满桌面，不能多减一次任务栏');
  assert(await win.getByRole('button', { name: '还原', exact: true }).isVisible());
  await win.getByRole('button', { name: '还原', exact: true }).click();
  await win.getByRole('button', { name: '最小化', exact: true }).click();
  assert.equal(await win.isVisible(), false);
  await q.locator('#tasks button').filter({ hasText: '开站_981008' }).click();
  assert(await win.isVisible());
  await win.locator('.titlebar .t').dblclick();
  assert(await win.getByRole('button', { name: '还原', exact: true }).isVisible());
  await win.locator('.titlebar .t').dblclick();
  await q.screenshot({ path: path.join(output, `${name}-desktop.png`) });
  await q.setViewportSize({ width: 390, height: 844 });
  await q.waitForFunction(() => document.querySelector('.win.active').getBoundingClientRect().right <= document.querySelector('#desktop').getBoundingClientRect().right + 1);
  await q.setViewportSize({ width: 1440, height: 950 });
  const badFiles = await q.evaluate(() => {
    const d = Y2K.debug, bad = [];
    for (const f of d.D.files.filter(f => f.type === 'img' && !f.lock)) {
      d.openFile(f.id); const w = d.wins().find(w => w.key === 'img_' + f.id);
      // 一些扫描件由文字和表格排版组成，不含 SVG。
      const r = w.body.querySelector('.canvas').getBoundingClientRect();
      const art = w.body.querySelector('.canvas svg')?.getBoundingClientRect();
      if (r.width < 100 || r.height < 30 || (art && (art.width < 100 || art.height < 30))) bad.push(f.id);
    }
    d.closeAllWins(); return bad;
  });
  assert.deepEqual(badFiles, []);
  console.log(`${name}: 全部手机图片、桌面照片及缩放、窗口按钮通过`);

  await q.setViewportSize({ width: 390, height: 844 });
  await q.evaluate(() => { const d = Y2K.debug; d.ui.tab = 'msg'; d.ui.chat = 'tester'; d.ui.phoneOpen = false; d.state.unread.tester = 3; d.renderPhone(); });
  assert.equal(await q.evaluate(() => Y2K.debug.state.unread.tester), 3);
  await q.locator('#phoneFab').click();
  assert.equal(await q.evaluate(() => Y2K.debug.state.unread.tester), 0);
  await q.locator('#phTabs button').nth(5).click();
  await q.getByRole('button', { name: '返回标题画面', exact: true }).click();
  const saved = await q.evaluate(() => JSON.stringify(Y2K.debug.state));
  await q.waitForTimeout(200);
  assert.equal(await q.evaluate(() => JSON.stringify(Y2K.debug.state)), saved, '标题画面不应继续播放对话');
  assert.deepEqual(errors, []);
  console.log(`${name}: 手机未读状态及返回标题后暂停通过；无页面错误`);
  await context.close();
}

(async () => {
  const edge = process.env.UI_CHECK_BROWSER || path.join(process.env['ProgramFiles(x86)'] || 'C:/Program Files (x86)', 'Microsoft/Edge/Application/msedge.exe');
  const chromium = await pw.chromium.launch({ headless: true, ...(fs.existsSync(edge) ? { executablePath: edge } : {}) });
  try { await run(chromium, 'chromium'); } finally { await chromium.close(); }
  if (process.argv.includes('--webkit')) {
    const webkit = await pw.webkit.launch({ headless: true });
    try { await run(webkit, 'webkit'); } finally { await webkit.close(); }
  }
  console.log(`全部通过。截图：${output}`);
})().catch(e => { console.error(e); process.exitCode = 1; });
