// Verify hint usage through actual controls and independent save snapshots.
'use strict';
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const { chromium, webkit } = require('playwright');
const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8')
  .replace('return { add, boot, lang };', 'return { add, boot, lang, debug };')
  .replace('const debug = {', 'const debug = { askPuzzle,');
async function run(browser, name, mobile) {
  const c = await browser.newContext({ viewport: mobile ? { width: 390, height: 844 } : { width: 1440, height: 950 }, isMobile: mobile, hasTouch: mobile, acceptDownloads: true });
  // 本测试从已读作者说明的状态开始；弹窗生命周期由 title-panel-check 覆盖。
  await c.addInitScript(() => sessionStorage.setItem('y2k_author_note_seen', '1'));
  await c.route('http://wyjm.test/hints', r => r.fulfill({ contentType: 'text/html', body: html }));
  const p = await c.newPage(), errors = []; p.on('pageerror', e => errors.push(e.message));
  await p.goto('http://wyjm.test/hints');
  await p.getByRole('button', { name: '新的调查', exact: true }).click();
  await p.locator('#title').getByRole('button', { name: '开始', exact: true }).click(); await p.locator('.card').click();
  await p.evaluate(() => {
    const d = Y2K.debug; d.flush(); d.fast(true); d.state.stage = 'win'; d.state.chapter = 'ch2';
    Object.assign(d.state.flags, { ch0: true, ch1: true, ch2: true });
    for (const x of d.D.dialogues) d.state.dlg[x.id] = { done: 1 };
    d.state.dlgQ = {}; d.state.wait = {};
  });
  const menu = async () => {
    if (mobile && !await p.locator('#phone').evaluate(el => el.classList.contains('open'))) await p.locator('#phoneFab').click();
    await p.locator('#phTabs button').nth(5).click();
  };
  const count = async n => { await menu(); assert.equal(await p.locator('#phBody > .ph-card').first().innerText(), '提示次数：' + n); };
  await count(0);
  for (let n = 1; n <= 3; n++) {
    await p.evaluate(() => Y2K.debug.askPuzzle('c2_pager', null, true));
    await p.locator('.pz .row button').first().click();
    if (n === 3) assert(await p.locator('.pz .row button').first().isDisabled(), '答案计入后应禁用提示');
    await p.locator('.dlgph .titlebar button').click(); await count(n);
  }
  await p.locator('.slot-card').nth(1).getByRole('button', { name: '保存', exact: true }).click();
  await p.evaluate(() => Y2K.debug.openBoard('c1_final'));
  for (let i = 0; i < 3; i++) await p.locator('.board').getByRole('button', { name: '提示', exact: true }).click();
  assert(await p.locator('.board').getByRole('button', { name: '提示', exact: true }).isDisabled());
  await p.locator('.board').getByRole('button', { name: '关闭', exact: true }).click(); await count(6);
  await p.locator('.slot-card').nth(2).getByRole('button', { name: '保存', exact: true }).click();
  assert((await p.locator('.slot-card').nth(1).innerText()).includes('提示次数：3'));
  assert((await p.locator('.slot-card').nth(2).innerText()).includes('提示次数：6'));
  await p.locator('.slot-card').nth(1).getByRole('button', { name: '读取', exact: true }).click(); await count(3);
  const downloadEvent = p.waitForEvent('download');
  await p.getByRole('button', { name: '导出存档文件', exact: true }).click();
  const download = await downloadEvent, exported = JSON.parse(fs.readFileSync(await download.path(), 'utf8'));
  assert.equal(exported.hints.c2_pager, 3); assert(!exported.hints.board_c1_final, '读档不能混入另一存档的提示');
  await p.reload(); await p.getByRole('button', { name: '继续调查', exact: true }).click(); await count(3);
  await p.locator('.slot-card').nth(2).getByRole('button', { name: '读取', exact: true }).click(); await count(6);
  await p.getByRole('button', { name: '返回标题画面', exact: true }).click();
  await p.getByRole('button', { name: '新的调查', exact: true }).click();
  await p.locator('#title').getByRole('button', { name: '开始', exact: true }).click(); await p.locator('.card').click(); await count(0);
  assert((await p.locator('.slot-card').nth(1).innerText()).includes('提示次数：3'));
  assert((await p.locator('.slot-card').nth(2).innerText()).includes('提示次数：6'));
  assert.deepEqual(errors, []); await c.close();
  console.log(name + (mobile ? ' mobile' : ' desktop') + ': 提示/答案/推理板计数、存档独立、读档回退、刷新、导出和新游戏归零通过');
}
(async () => {
  const edge = process.env.UI_CHECK_BROWSER || 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
  const runs = [['edge', chromium, fs.existsSync(edge) ? { executablePath: edge } : {}]];
  if (process.argv.includes('--webkit')) runs.push(['webkit', webkit, {}]);
  for (const [name, type, options] of runs) { const b = await type.launch({ headless: true, ...options }); try { await run(b, name, false); await run(b, name, true); } finally { await b.close(); } }
})().catch(e => { console.error(e); process.exitCode = 1; });
