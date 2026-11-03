'use strict';
const assert = require('node:assert/strict'), fs = require('node:fs'), path = require('node:path');
const { chromium, webkit } = require(require.resolve('playwright', { paths: [__dirname, 'D:/Users/shark/Desktop/千年虫2/tools'] }));
const root = path.resolve(__dirname, '..'), html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const live = process.env.ENDING_REPLAY_LIVE;
const url = live || 'https://qiannianchonggame.github.io/';
const output = path.join(root, 'test-results/ending-replay'); fs.mkdirSync(output, { recursive: true });
const report = [];
async function run(browser, name, viewport, lang) {
  const touch = name === 'webkit';
  const ctx = await browser.newContext({ viewport, hasTouch: touch, isMobile: touch });
  const errors = [], posts = [];
  await ctx.addInitScript(lang => {
    sessionStorage.setItem('y2k_author_note_seen', '1');
    if (!localStorage.getItem('y2k_meta')) localStorage.setItem('y2k_meta', JSON.stringify({ lang, endings: { C: 123456789 } }));
    if (!localStorage.getItem('y2k_auto')) {
      const save = JSON.stringify({ v: 1, player: '回看测试', chapter: 'ch1', flags: { start: true, ch0: true, ch1: true }, stage: 'off', playMs: 5040000, hints: { a: 2 }, saved: 123456789 });
      for (const key of ['y2k_auto', 'y2k_slot1', 'y2k_preend']) localStorage.setItem(key, save);
    }
  }, lang);
  await ctx.route('**/*', route => {
    const req = route.request();
    if (req.url() === url) return live ? route.continue() : route.fulfill({ contentType: 'text/html', body: html });
    if (req.method() === 'POST' && req.url().includes('/api/leaderboard')) posts.push(req.postData());
    return route.fulfill({ contentType: 'application/json', body: JSON.stringify({ visits: 1, online: 1, ok: true, endings: { A: [], B: [], C: [], H: [] } }) });
  });
  const p = await ctx.newPage(); p.on('pageerror', e => errors.push(e.message)); p.setDefaultTimeout(10000);
  const press = locator => touch ? locator.tap() : locator.click();
  try {
    await p.goto(url);
    const labels = await p.evaluate(lang => Object.fromEntries(['结局收集', '关闭', '返回', '继续调查', '回到 3 号机', '回到结局前继续'].map(s => [s, window.Y2K_UI?.[lang]?.[s] || s])), lang);
    await p.evaluate(() => {
      for (const method of ['capture', 'requestReview']) window.Y2KLeaderboard[method] = () => { throw new Error('Replay must never call ' + method); };
    });
    const snapshot = () => p.evaluate(() => Object.fromEntries(['y2k_auto', 'y2k_slot1', 'y2k_preend', 'y2k_meta', 'y2k1_leaderboard_pending'].map(k => [k, localStorage.getItem(k)])));
    const before = await snapshot();
    await press(p.locator('#title .menu').getByRole('button', { name: labels['结局收集'], exact: true }));
    assert.equal(await p.locator('.ending-entry').count(), 1, 'old C unlock record is sufficient');
    assert.equal(await p.locator('.endgrid .no').count(), 3, 'locked endings stay inaccessible');
    assert.equal(await p.locator('.endgrid .no').getByRole('button').count(), 0);
    const entry = p.locator('.ending-entry[data-ending="C"]');
    await press(entry);
    const replay = p.locator('.ending-replay'); await replay.waitFor();
    assert.equal(await replay.locator('h1').textContent(), lang === 'zh' ? '归零' : await entry.locator('span').nth(1).textContent().then(t => t.slice(1, -1)));
    const cBody = await replay.locator('.body').innerHTML(); assert(cBody.length > 500);
    assert.equal(await p.locator('.finish-review').count(), 0);
    assert.equal(await replay.getByRole('button', { name: labels['回到 3 号机'], exact: true }).count(), 0);
    assert.equal(await replay.getByRole('button', { name: labels['回到结局前继续'], exact: true }).count(), 0);
    const close = replay.getByRole('button', { name: labels['关闭'], exact: true });
    assert(await close.evaluate(el => { const r = el.getBoundingClientRect(); return r.width >= 44 && r.height >= 44 && el.contains(document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2)); }), 'close button above homepage and touchable');
    await p.keyboard.press('Shift+Tab'); assert(await replay.getByRole('button', { name: labels['返回'], exact: true }).evaluate(el => el === document.activeElement));
    await p.keyboard.press('Tab'); assert(await close.evaluate(el => el === document.activeElement));
    await replay.evaluate(el => { el.scrollTop = el.scrollHeight; });
    await press(replay.getByRole('button', { name: labels['返回'], exact: true }));
    assert.equal(await replay.count(), 0); assert(await entry.evaluate(el => el === document.activeElement));
    assert.deepEqual(await snapshot(), before, 'replay leaves all saves and unlock timestamps unchanged');
    await press(entry); await p.keyboard.press('Escape'); assert.equal(await replay.count(), 0);
    assert.equal(await p.locator('.title-panel').count(), 1, 'Escape returns to collection');
    await press(entry); await press(replay.getByRole('button', { name: labels['关闭'], exact: true }));
    await p.reload();
    await press(p.locator('#title .menu').getByRole('button', { name: labels['结局收集'], exact: true }));
    await press(p.locator('.ending-entry[data-ending="C"]')); assert.equal(await replay.locator('.body').innerHTML(), cBody);
    if (lang === 'zh') await p.screenshot({ path: path.join(output, `${live ? 'live-' : ''}${name}-${viewport.width}.png`) });
    await press(replay.getByRole('button', { name: labels['关闭'], exact: true }));
    assert.deepEqual(await snapshot(), before, 'refresh still preserves saves');
    // Exercise every ending through the same public entry, including metadata-only saves.
    await p.evaluate(() => {
      const m = JSON.parse(localStorage.getItem('y2k_meta')); m.endings = { A: 1, B: 2, C: 3, H: 4 };
      localStorage.setItem('y2k_meta', JSON.stringify(m));
    });
    await p.reload(); await press(p.locator('#title .menu').getByRole('button', { name: labels['结局收集'], exact: true }));
    for (const id of ['A', 'B', 'C', 'H']) {
      await press(p.locator(`.ending-entry[data-ending="${id}"]`));
      assert((await replay.locator('.body').textContent()).length > 100);
      await press(replay.getByRole('button', { name: labels['关闭'], exact: true }));
    }
    await press(p.locator('.title-panel-close'));
    await press(p.locator('#title .menu').getByRole('button', { name: labels['继续调查'], exact: true }));
    assert(await p.locator('#title').isHidden(), 'original save can still resume');
    assert.deepEqual(posts, [], 'replay never submits a completion score'); assert.deepEqual(errors, []);
    report.push({ browser: name, viewport, lang, live: !!live, result: 'passed' });
    console.log(`PASS ${name} ${viewport.width} ${lang}: old unlocks, four endings, touch/keyboard/back, scroll, refresh, save preservation and no score submissions`);
  } finally { await ctx.close(); }
}
async function normalCompletion(browser) {
  const ctx = await browser.newContext();
  const debugHtml = html.replace('const debug = {', 'const debug = { showEnding,').replace('return { add, boot, lang };', 'return { add, boot, lang, debug };');
  await ctx.addInitScript(() => sessionStorage.setItem('y2k_author_note_seen', '1'));
  await ctx.route('**/*', r => r.fulfill({ contentType: r.request().url() === url ? 'text/html' : 'application/json', body: r.request().url() === url ? debugHtml : '{"ok":true,"visits":1,"online":1}' }));
  const p = await ctx.newPage();
  try {
    await p.goto(url); await p.getByRole('button', { name: '新的调查', exact: true }).click(); await p.getByRole('button', { name: '开始', exact: true }).click();
    await p.evaluate(() => { Y2K.debug.flush(); Y2K.debug.state.playMs = 120000; Y2K.debug.showEnding('C'); });
    await p.locator('.finish-review').waitFor();
    const body = await p.locator('#overlay .ending .body').innerHTML();
    await p.locator('.finish-review-submit').click();
    await p.getByRole('button', { name: '返回标题画面', exact: true }).click();
    const saved = await p.evaluate(() => localStorage.getItem('y2k_auto'));
    assert(JSON.parse(saved).flags.ending_C, 'normal completion still records unlock');
    await p.locator('#title .menu').getByRole('button', { name: '结局收集', exact: true }).click();
    await p.locator('.ending-entry[data-ending="C"]').click();
    assert.equal(await p.locator('.ending-replay .body').innerHTML(), body, 'replay displays the exact actual ending');
    assert.equal(await p.locator('.finish-review').count(), 0);
    assert.equal(await p.evaluate(() => localStorage.getItem('y2k_auto')), saved);
    console.log('PASS normal C completion → title → collected C → identical ending, without save changes');
  } finally { await ctx.close(); }
}
(async () => {
  for (const [name, type, options, sizes] of [
    ['edge', chromium, { executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe' }, [{ width: 1440, height: 950 }]],
    ['webkit', webkit, {}, [{ width: 1366, height: 1024 }, { width: 390, height: 844 }, { width: 844, height: 390 }]],
  ]) {
    const browser = await type.launch({ headless: true, ...options });
    try {
      for (const viewport of sizes) for (const lang of (viewport.width === 844 ? ['zh'] : ['zh', 'en', 'ja'])) await run(browser, name, viewport, lang);
      if (!live) await normalCompletion(browser);
    } finally { await browser.close(); }
  }
  fs.writeFileSync(path.join(output, live ? 'live-result.json' : 'result.json'), JSON.stringify(report, null, 2));
})().catch(e => { console.error(e); process.exitCode = 1; });
