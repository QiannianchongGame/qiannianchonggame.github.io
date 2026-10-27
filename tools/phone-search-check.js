// 手机笔记分页、线索和物品搜索的浏览器回归检查。先运行 node tools/build.js。
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium, webkit } = require('playwright');
const release = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
assert(release.includes('return { add, boot, lang };'));
const html = release.replace('return { add, boot, lang };', 'return { add, boot, lang, debug };');

async function check(browser, name, mobile) {
  const context = await browser.newContext({ viewport: mobile ? { width: 390, height: 844 } : { width: 1440, height: 950 }, hasTouch: mobile, isMobile: mobile });
  const page = await context.newPage(); page.setDefaultTimeout(8000);
  const errors = []; page.on('pageerror', e => errors.push(e.message));
  await context.route('http://wyjm.test/game', r => r.fulfill({ contentType: 'text/html', body: html }));
  await page.goto('http://wyjm.test/game');
  await page.getByRole('button', { name: '新的调查', exact: true }).click();
  await page.getByRole('button', { name: '开始', exact: true }).click(); await page.locator('.card').click();
  await page.evaluate(() => {
    const d = Y2K.debug; d.flush();
    d.state.notes = ['c0_n_tag', 'c0_n_login', 'c2_n_photo'];
    d.state.noteCh = { c0_n_tag: 'ch0', c0_n_login: 'ch0', c2_n_photo: 'ch2' };
    d.state.collected = ['poem1'];
    d.state.items = ['c0_it_letter', 'c0_it_photo']; d.state.itemSeen = {};
    localStorage.setItem('y2k_auto', JSON.stringify(d.state));
  });
  await page.reload(); await page.getByRole('button', { name: '继续调查', exact: true }).click();
  if (mobile) await page.locator('#phoneFab').click();
  await page.locator('#phTabs button').nth(3).click();
  const nav = page.locator('.ph-note-tabs');
  const questions = nav.getByRole('button', { name: /待解决的问题/ });
  const clues = nav.getByRole('button', { name: /线索/ });
  const poems = nav.getByRole('button', { name: /林晚的诗稿/ });
  assert.equal(await questions.getAttribute('aria-pressed'), 'true');
  assert.equal(await page.getByRole('searchbox').count(), 0);
  await clues.click(); assert.equal(await clues.getAttribute('aria-pressed'), 'true');
  assert.equal(await page.locator('.ph-search-results .ph-card').count(), 3);
  const search = page.getByRole('searchbox', { name: '搜索 线索' });
  await search.fill('ssjq'); assert.equal(await page.locator('.ph-search-results .ph-card').count(), 1);
  assert((await page.locator('.ph-search-results').innerText()).includes('SSJQ'));
  await page.evaluate(() => Y2K.debug.renderPhone());
  assert.equal(await search.inputValue(), 'ssjq'); assert(await search.evaluate(el => el === document.activeElement));
  await search.fill('不存在的线索'); assert((await page.locator('.ph-search-results').innerText()).includes('没有找到'));
  await search.fill('铁皮饼干盒'); assert((await page.locator('.ph-search-results').innerText()).includes('没有找到'));
  await search.fill('<'); assert((await page.locator('.ph-search-results').innerText()).includes('没有找到'));
  await page.locator('.ph-search').getByRole('button', { name: '清空' }).click();
  assert.equal(await search.inputValue(), ''); assert.equal(await page.locator('.ph-search-results .ph-card').count(), 3);
  await search.fill('合影'); await poems.click();
  assert.equal(await poems.getAttribute('aria-pressed'), 'true');
  assert.equal(await page.getByRole('searchbox').count(), 0);
  assert((await page.locator('#phBody').innerText()).includes('1 / 12'));
  await clues.click(); assert.equal(await search.inputValue(), '合影');
  assert.equal(await page.locator('.ph-search-results .ph-card').count(), 1);
  if (mobile && process.env.PHONE_SEARCH_SCREENSHOT) await page.locator('#phone').screenshot({ path: path.join(process.env.PHONE_SEARCH_SCREENSHOT, name + '-notes.png') });
  await page.locator('#phTabs button').nth(2).click();
  const items = page.getByRole('searchbox', { name: '搜索 物品' });
  if (mobile && process.env.PHONE_SEARCH_SCREENSHOT) await page.locator('#phone').screenshot({ path: path.join(process.env.PHONE_SEARCH_SCREENSHOT, name + '-items.png') });
  const itemCount = await page.locator('.ph-tile').count(); assert(itemCount >= 2);
  await items.fill('信封里的旧照片'); assert.equal(await page.locator('.ph-tile').count(), 1);
  assert((await page.locator('.ph-tile').innerText()).includes('照片'));
  await page.locator('.ph-tile').click(); await page.getByRole('button', { name: '返回', exact: true }).click();
  assert.equal(await items.inputValue(), '信封里的旧照片'); assert.equal(await page.locator('.ph-tile').count(), 1);
  await items.fill('冒昧打扰'); assert.equal(await page.locator('.ph-tile').count(), 1);
  assert((await page.locator('.ph-tile').innerText()).includes('何蔓的信'));
  await items.fill('不存在的物品'); assert((await page.locator('.ph-search-results').innerText()).includes('没有找到'));
  await page.locator('.ph-search').getByRole('button', { name: '清空' }).click();
  assert.equal(await page.locator('.ph-tile').count(), itemCount);
  const colors = await items.evaluate(el => ({ bg: getComputedStyle(el.parentElement).backgroundColor, fg: getComputedStyle(el).color, width: el.getBoundingClientRect().width }));
  assert(colors.bg !== 'rgb(255, 255, 255)' && colors.fg !== 'rgb(0, 0, 0)' && colors.width > 100);
  assert.deepEqual(await page.evaluate(() => Y2K.debug.state.notes), ['c0_n_tag', 'c0_n_login', 'c2_n_photo']);
  assert.deepEqual(errors, []); await context.close();
  console.log(`${name} ${mobile ? '手机' : '桌面'}：分页、搜索、清空、旧存档和输入焦点通过`);
}
(async () => {
  const edge = process.env.UI_CHECK_BROWSER || path.join(process.env['ProgramFiles(x86)'] || 'C:/Program Files (x86)', 'Microsoft/Edge/Application/msedge.exe');
  const runs = [['chromium', chromium, fs.existsSync(edge) ? { executablePath: edge } : {}]];
  if (process.argv.includes('--webkit')) runs.push(['webkit', webkit, {}]);
  for (const [name, type, options] of runs) {
    const browser = await type.launch({ headless: true, ...options });
    try { await check(browser, name, false); await check(browser, name, true); } finally { await browser.close(); }
  }
})().catch(e => { console.error(e); process.exitCode = 1; });
