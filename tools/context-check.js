// 游戏内右键、键盘菜单和触屏长按的回归检查。先运行 node tools/build.js。
// Playwright 应位于 NODE_PATH；可用 UI_CHECK_BROWSER 指定 Chromium 可执行文件。
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium, webkit } = require('playwright');
const root = path.join(__dirname, '..');
const release = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
assert(release.includes('return { add, boot, lang };'), '请先构建正式版');
// 调试接口仅注入测试页面，不写入正式版，也不读取玩家存档。
const html = release.replace('return { add, boot, lang };', 'return { add, boot, lang, debug };');

async function game(context) {
  await context.route('http://wyjm.test/game', route => route.fulfill({ contentType: 'text/html', body: html }));
  const p = await context.newPage(); p.setDefaultTimeout(8000);
  const errors = []; p.on('pageerror', e => errors.push(e.message));
  await p.goto('http://wyjm.test/game');
  await p.getByRole('button', { name: '新的调查', exact: true }).click();
  await p.getByRole('button', { name: '开始', exact: true }).click(); await p.locator('.card').click();
  await p.evaluate(() => {
    const d = Y2K.debug; d.flush(); d.state.stage = 'win';
    Object.assign(d.state.flags, { ch1: true, ch2: true, ch5: true, solved_c0_bios: true, solved_c0_login: true });
    d.D.dialogues.forEach(x => { d.state.dlg[x.id] = { done: 1 }; }); d.state.dlgQ = {};
    localStorage.setItem('y2k_auto', JSON.stringify(d.state));
  });
  await p.reload(); await p.getByRole('button', { name: '继续调查', exact: true }).click();
  await p.evaluate(() => {
    window.contextEvents = [];
    document.addEventListener('contextmenu', e => {
      const target = e.target.tagName; setTimeout(() => window.contextEvents.push({ target, prevented: e.defaultPrevented }), 0);
    }, true);
  });
  return { p, errors };
}
const menu = page => page.getByRole('menu');
const item = (page, label) => menu(page).getByRole('menuitem', { name: label, exact: true });
async function lastPrevented(page) { await page.waitForFunction(() => window.contextEvents.length > 0); return page.evaluate(() => window.contextEvents.at(-1).prevented); }
async function right(page, target) { const count = await page.evaluate(() => window.contextEvents.length); await target.click({ button: 'right' }); await page.waitForFunction(n => window.contextEvents.length > n, count); }
async function closeDialog(p) { await p.locator('#modal').getByRole('button', { name: '确定', exact: true }).click(); }

async function desktopTest(browser, name) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 950 } });
  // 本测试从已读作者说明的状态开始；弹窗生命周期由 title-panel-check 覆盖。
  await context.addInitScript(() => sessionStorage.setItem('y2k_author_note_seen', '1'));
  const { p, errors } = await game(context);
  const docs = p.locator('#icons .icon').filter({ hasText: '我的文档' });
  await right(p, docs); assert.equal(await lastPrevented(p), true);
  assert(await item(p, '打开').isVisible()); assert(await item(p, '属性').isVisible());
  assert(await docs.evaluate(el => el.classList.contains('sel')));
  await item(p, '打开').click();
  const explorer = p.locator('.win').filter({ has: p.locator('.addr input') });
  const address = explorer.locator('.addr input');
  await right(p, address); assert.equal(await lastPrevented(p), false, '输入框应保留浏览器复制粘贴菜单');
  const folder = explorer.locator('.flist .icon').filter({ hasText: '照片' });
  await right(p, folder); assert.equal(await lastPrevented(p), true); await item(p, '打开').click();
  const tower = explorer.locator('.flist .icon').filter({ hasText: '水塔.jpg' });
  await right(p, tower); assert.equal(await lastPrevented(p), true);
  assert(await tower.evaluate(el => el.classList.contains('sel')), '右键应选中文件');
  await item(p, '属性').click();
  assert((await p.locator('#modal').innerText()).includes('背面铅笔字'));
  assert(await p.evaluate(() => Y2K.debug.state.flags.props_c2_tower && Y2K.debug.state.collected.includes('poem6')));
  await closeDialog(p);
  await tower.dblclick();
  const image = p.locator('.win').filter({ has: p.locator('.imgview') });
  await right(p, image.locator('.canvas svg')); assert.equal(await lastPrevented(p), true);
  await item(p, '属性').click(); assert((await p.locator('#modal').innerText()).includes('背面铅笔字')); await closeDialog(p);
  await image.locator('.toolbar98').getByRole('button', { name: '属性', exact: true }).click();
  assert((await p.locator('#modal').innerText()).includes('背面铅笔字')); await closeDialog(p);
  await image.locator('.toolbar98').getByRole('button', { name: '全屏查看', exact: true }).click();
  await right(p, p.locator('.viewer-canvas svg')); assert.equal(await lastPrevented(p), true);
  assert(await p.locator('#overlay .ctx').isVisible()); await item(p, '属性').click();
  assert(await p.locator('#modal .dlg98.raised').isVisible());
  assert((await p.locator('#modal').innerText()).includes('背面铅笔字'));
  await closeDialog(p); assert(await p.locator('.viewer').isVisible()); await p.keyboard.press('Escape');
  await image.getByRole('button', { name: '关闭', exact: true }).click();
  await explorer.locator('.menubar').getByText('查看(V)', { exact: true }).click();
  await explorer.locator('.dropdown').getByText('详细资料', { exact: true }).click();
  const row = explorer.locator('tr').filter({ hasText: '水塔.jpg' });
  await row.focus(); await p.keyboard.press('Shift+F10');
  assert(await item(p, '属性').isVisible()); await p.keyboard.press('ArrowDown');
  assert.equal(await p.evaluate(() => document.activeElement.textContent), '属性'); await p.keyboard.press('Enter');
  assert((await p.locator('#modal').innerText()).includes('背面铅笔字')); await closeDialog(p);
  await right(p, row); assert.equal(await lastPrevented(p), true); assert(await row.evaluate(el => el.classList.contains('sel')));
  await p.keyboard.press('Escape'); assert.equal(await menu(p).count(), 0);
  await p.evaluate(() => Y2K.debug.openFile('c5_f_letter'));
  const note = p.locator('.win').filter({ has: p.locator('.wordpad') });
  await right(p, note.locator('.page')); assert.equal(await lastPrevented(p), true); await item(p, '属性').click();
  assert((await p.locator('#modal').innerText()).includes('2000-04-04 22:47')); await closeDialog(p);
  await p.evaluate(() => Y2K.debug.closeAllWins());
  await p.evaluate(() => Y2K.debug.openApp('display'));
  await p.getByRole('button', { name: '预览', exact: true }).click();
  const saver = p.locator('#saver'), subtitle = saver.locator('.mq');
  assert(await saver.isVisible()); assert((await subtitle.innerText()).includes('你说每个字都能拆开'));
  const sr = await saver.boundingBox(), tr = await subtitle.boundingBox();
  assert(tr.x >= sr.x && tr.x < sr.x + sr.width && tr.y >= sr.y && tr.y < sr.y + sr.height, '屏保字幕应立刻出现在游戏屏幕内');
  await p.waitForFunction(() => Y2K.debug.state.collected.includes('poem5'), null, { timeout: 5000 });
  await p.keyboard.press('Escape'); assert.equal(await saver.count(), 0);
  await p.evaluate(() => Y2K.debug.closeAllWins());
  const dk = p.locator('#desktop'), dr = await dk.boundingBox();
  await dk.click({ button: 'right', position: { x: dr.width - 2, y: dr.height - 2 } });
  assert.equal(await lastPrevented(p), true); assert(await item(p, '刷新').isVisible());
  const mr = await menu(p).boundingBox(); assert(mr.x + mr.width <= dr.x + dr.width + 1 && mr.y + mr.height <= dr.y + dr.height + 1 && mr.x >= dr.x && mr.y >= dr.y);
  await p.keyboard.press('Escape'); assert.equal(await menu(p).count(), 0);
  assert.deepEqual(errors, []); await context.close();
  console.log(`${name}: 桌面、文件、图片、全屏、键盘菜单、屏保字幕和线索通过`);
}

async function touchTest(browser, name) {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
  // 本测试从已读作者说明的状态开始；弹窗生命周期由 title-panel-check 覆盖。
  await context.addInitScript(() => sessionStorage.setItem('y2k_author_note_seen', '1'));
  const { p, errors } = await game(context);
  await p.evaluate(() => Y2K.debug.openApp('mydocs'));
  await p.locator('.win.active .flist .icon').filter({ hasText: '照片' }).tap();
  const tower = p.locator('.win.active .flist .icon').filter({ hasText: '水塔.jpg' });
  await tower.waitFor({ state: 'visible' }); await p.waitForTimeout(120);
  const prevented = await tower.evaluate(async el => {
    const r = el.getBoundingClientRect();
    const t = { clientX: r.x + r.width / 2, clientY: r.y + r.height / 2 };
    const start = new Event('touchstart', { bubbles: true, cancelable: true });
    Object.defineProperty(start, 'touches', { value: [t] }); el.dispatchEvent(start);
    await new Promise(resolve => setTimeout(resolve, 650));
    const end = new Event('touchend', { bubbles: true, cancelable: true });
    el.dispatchEvent(end); return end.defaultPrevented;
  });
  assert(prevented, '长按后不应触发普通点击'); assert(await item(p, '属性').isVisible());
  assert.equal(await p.locator('.imgview').count(), 0); await item(p, '属性').click();
  assert((await p.locator('#modal').innerText()).includes('背面铅笔字')); await closeDialog(p);
  assert.deepEqual(errors, []); await context.close();
  console.log(`${name}: 手机长按属性及避免误打开文件通过`);
}

(async () => {
  const edge = process.env.UI_CHECK_BROWSER || path.join(process.env['ProgramFiles(x86)'] || 'C:/Program Files (x86)', 'Microsoft/Edge/Application/msedge.exe');
  const runs = [['chromium', chromium, fs.existsSync(edge) ? { executablePath: edge } : {}]];
  if (process.argv.includes('--webkit')) runs.push(['webkit', webkit, {}]);
  for (const [name, type, options] of runs) {
    const browser = await type.launch({ headless: true, ...options });
    try { await desktopTest(browser, name); await touchTest(browser, name); } finally { await browser.close(); }
  }
})().catch(e => { console.error(e); process.exitCode = 1; });
