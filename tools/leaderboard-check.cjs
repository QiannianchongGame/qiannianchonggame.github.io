// Isolated browser checks: every network request is intercepted; no test scores reach production.
const assert = require('node:assert/strict'), fs = require('node:fs'), path = require('node:path');
const { chromium, webkit } = require('playwright');
const root = path.resolve(__dirname, '..'), config = JSON.parse(fs.readFileSync(path.join(root, 'src/stats-config.json')));
const game = config.game, url = config.allowedOrigins[0] + '/', key = game === '1' ? 'y2k_' : 'y2k2_';
let html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
html = html.replace('const debug = {', 'const debug = { showEnding, showTitle, loadState, tickPlay, syncPlayClock,');
html = html.replace(game === '1' ? 'return { add, boot, lang };' : 'return { add, boot, lang, patch };', game === '1' ? 'return { add, boot, lang, debug };' : 'return { add, boot, lang, patch, debug };');
(async () => {
  const kind = process.argv.includes('--webkit') ? 'webkit' : 'edge';
  const browser = await (kind === 'webkit' ? webkit.launch({ headless: true }) : chromium.launch({ headless: true, executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe' }));
  try {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 950 } });
    const errors = [], posts = []; let fail = false;
    const data = { game, limit: 20, endings: Object.fromEntries(['A', 'B', 'C', 'H'].map(id => [id, Array.from({ length: 20 }, (_, i) => ({ durationMs: 61000 + Math.floor(i / 2) * 1000, hints: i % 2, review: i === 0 ? `${id}：故事读完了，还是忘不掉。\n<script>window.reviewXSS=true</script>` : i === 19 ? '长评'.repeat(250) : null }))])) };
    await ctx.route('**/*', route => {
      const req = route.request();
      if (req.url().startsWith('file:')) return route.continue();
      if (req.url() === url) return route.fulfill({ contentType: 'text/html', body: html });
      if (req.url() === config.leaderboardEndpoint) {
        if (req.method() === 'POST') posts.push(JSON.parse(req.postData()));
        return route.fulfill({ status: fail ? 503 : 200, contentType: 'application/json', headers: { 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify(req.method() === 'POST' ? { accepted: true } : data) });
      }
      if (req.url() === config.endpoint) return route.fulfill({ contentType: 'application/json', body: '{"visits":0,"online":0}', headers: { 'Access-Control-Allow-Origin': '*' } });
      return route.abort();
    });
    const p = await ctx.newPage(); p.on('pageerror', e => errors.push(e.message)); await p.goto(url);
    if (game === '1') await p.locator('.author-note .title-panel-close').click();
    for (const [width, height] of [[1440, 950], [1366, 768], [390, 844], [375, 667], [320, 568], [844, 390], [568, 320]]) {
      await p.setViewportSize({ width, height });
      await p.locator('#title').evaluate(el => { el.scrollTop = 0; });
      const entry = p.getByRole('button', { name: '排行榜', exact: true });
      const bounds = await entry.boundingBox();
      assert(bounds.x >= 0 && bounds.y >= 0 && bounds.x + bounds.width <= width && bounds.y + bounds.height <= height, 'leaderboard entry is visible without scrolling');
      assert(await entry.evaluate(el => { const r = el.getBoundingClientRect(); return el.contains(document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2)); }), 'entry is not covered');
      if (process.env.LEADERBOARD_SCREENSHOTS) { fs.mkdirSync(process.env.LEADERBOARD_SCREENSHOTS, { recursive: true }); await p.screenshot({ path: path.join(process.env.LEADERBOARD_SCREENSHOTS, `game${game}-${kind}-entry-${width}.png`) }); }
      await entry.click();
      await p.waitForFunction(() => document.querySelectorAll('.leaderboard-column tbody tr').length === 80);
      assert.equal(await p.locator('.leaderboard-column').count(), 4);
      const b = await p.locator('.title-panel').boundingBox();
      assert(Math.abs(b.x + b.width / 2 - width / 2) < 2); assert(b.y >= 0 && b.y + b.height <= height + 1);
      const sizes = await p.locator('.leaderboard-scroll').evaluate(el => ({ width: el.clientWidth, scroll: el.scrollWidth }));
      if (width < 1000) assert(sizes.scroll > sizes.width);
      assert(!(await p.locator('.leaderboard-grid').innerText()).includes('nickname'));
      // Every number in a row exposes the same review; tooltip remains in the viewport.
      const numbers = p.locator('.leaderboard-column').first().locator('tbody tr').first().locator('button');
      for (let n = 0; n < 3; n++) {
        await numbers.nth(n).scrollIntoViewIfNeeded();
        await p.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
        await numbers.nth(n).hover();
        await p.locator('.leaderboard-review:not([hidden])').waitFor();
        assert.equal(await p.locator('.leaderboard-review-text').textContent(), data.endings.A[0].review);
        assert.equal(await p.locator('.leaderboard-review script').count(), 0);
        const tip = await p.locator('.leaderboard-review').boundingBox();
        assert(tip.x >= 0 && tip.y >= 0 && tip.x + tip.width <= width && tip.y + tip.height <= height + 1);
      }
      await p.keyboard.press('Escape'); assert.equal(await p.locator('.leaderboard-review:not([hidden])').count(), 0);
      if (process.env.LEADERBOARD_SCREENSHOTS) { fs.mkdirSync(process.env.LEADERBOARD_SCREENSHOTS, { recursive: true }); await p.screenshot({ path: path.join(process.env.LEADERBOARD_SCREENSHOTS, `game${game}-${kind}-${width}.png`) }); }
      await p.locator('.title-panel-close').click(); assert.equal(await p.locator('.title-panel').count(), 0);
      assert(await p.evaluate(() => document.querySelector('.site-stats').getBoundingClientRect().bottom <= document.querySelector('.foot').getBoundingClientRect().top), 'home footer stays below statistics');
    }
    fail = true; await p.getByRole('button', { name: '排行榜', exact: true }).click();
    await p.getByText('暂时无法读取排行榜，请稍后重试。', { exact: true }).waitFor();
    fail = false; await p.getByRole('button', { name: '刷新榜单', exact: true }).click();
    await p.waitForFunction(() => document.querySelectorAll('.leaderboard-column tbody tr').length === 80);
    await p.keyboard.press('Escape'); assert.equal(await p.locator('.title-panel').count(), 0);
    for (const [lang, label] of [['en', 'Leaderboard'], ['ja', 'ランキング']]) {
      await p.setViewportSize({ width: 320, height: 568 });
      await p.evaluate(({ key, lang }) => localStorage.setItem(key + 'meta', JSON.stringify({ lang })), { key, lang });
      await p.reload();
      assert(await p.evaluate(() => document.querySelector('.title-topbar').getBoundingClientRect().bottom <= document.querySelector('#title .clock').getBoundingClientRect().top), 'translated topbar does not cover title content');
      await p.getByRole('button', { name: label, exact: true }).click();
      await p.waitForFunction(() => document.querySelectorAll('.leaderboard-column tbody tr').length === 80);
      await p.locator('.leaderboard-number').first().focus();
      assert.equal(await p.locator('.leaderboard-review-text').textContent(), data.endings.A[0].review);
      await p.keyboard.press('Escape');
    }
    await p.evaluate(key => localStorage.setItem(key + 'meta', '{}'), key); await p.reload();
    const direct = await ctx.newPage(); await direct.goto(url + '#leaderboard');
    if (game === '1') await direct.locator('.author-note .title-panel-close').click();
    await direct.waitForFunction(() => document.querySelectorAll('.leaderboard-column tbody tr').length === 80);
    await direct.locator('.title-panel-close').click(); assert.equal(await direct.locator('.title-panel').count(), 0); await direct.close();
    await p.getByRole('button', { name: '新的调查', exact: true }).click(); await p.getByRole('button', { name: '开始', exact: true }).click();
    // Freeze wall time, then drive a real ending transition with a known save and hint total.
    await p.evaluate(() => { const d = Y2K.debug; d.flush(); d.state.playMs = 120000; d.state.hints = { puzzle: 2, board: 1 }; window.testNow = Date.now(); Date.now = () => window.testNow; d.tickPlay(); d.state.playMs = 120000; });
    for (const ending of ['A', 'B', 'C', 'H']) {
      await p.evaluate(ending => Y2K.debug.showEnding(ending), ending);
      const dialog = p.locator('.finish-review'); await dialog.waitFor();
      assert((await dialog.locator('.finish-review-summary').textContent()).includes('00:02:00.000'));
      assert((await dialog.locator('.finish-review-summary').textContent()).includes('3'));
      const review = ending === 'B' ? '' : `${ending}：仍然记得那个夏天。\nThank you. 🙂`;
      await dialog.locator('textarea').fill(review);
      await p.evaluate(() => { window.testNow += 10000; Y2K.debug.tickPlay(); });
      assert.equal(await p.evaluate(() => Y2K.debug.state.playMs), 120000, 'review writing is paused');
      if (process.env.LEADERBOARD_SCREENSHOTS) await p.screenshot({ path: path.join(process.env.LEADERBOARD_SCREENSHOTS, `game${game}-${kind}-review-${ending}.png`) });
      await dialog.locator('.finish-review-submit').click();
      await p.waitForFunction(() => Object.keys(JSON.parse(localStorage.getItem(`y2k${window.Y2K_STATS_CONFIG.game}_leaderboard_pending`) || '{}')).length === 0);
      const last = posts.at(-1); assert.equal(last.ending, ending); assert.equal(last.durationMs, 120000); assert.equal(last.hints, 3);
      assert.equal(last.review, review);
      assert.deepEqual(Object.keys(last).sort(), ['durationMs', 'ending', 'game', 'hints', 'playerId', 'runId', 'review'].sort());
      await p.evaluate(ending => Y2K.debug.showEnding(ending), ending);
      assert.equal(await p.locator('.finish-review').count(), 0, 'rereading does not repeat the prompt');
    }
    assert.equal(new Set(posts.map(x => x.playerId)).size, 1);
    await p.evaluate(() => { window.testNow += 600000; Y2K.debug.tickPlay(); });
    assert.equal(await p.evaluate(() => Y2K.debug.state.playMs), 120000, 'ending reading is paused');
    await p.evaluate(() => Y2K.debug.showTitle());
    await p.evaluate(() => { window.testNow += 600000; Y2K.debug.tickPlay(); });
    assert.equal(await p.evaluate(() => Y2K.debug.state.playMs), 120000, 'home is paused');
    await p.getByRole('button', { name: '继续调查', exact: true }).click();
    await p.evaluate(() => { window.testNow += 2000; Y2K.debug.tickPlay(); });
    assert.equal(await p.evaluate(() => Y2K.debug.state.playMs), 122000, 'continuing resumes timing');
    await p.evaluate(() => { Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'hidden' }); document.dispatchEvent(new Event('visibilitychange')); window.testNow += 600000; Y2K.debug.tickPlay(); });
    assert.equal(await p.evaluate(() => Y2K.debug.state.playMs), 122000, 'background is paused');
    await p.evaluate(() => { Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'visible' }); document.dispatchEvent(new Event('visibilitychange')); window.testNow += 1000; Y2K.debug.tickPlay(); });
    assert.equal(await p.evaluate(() => Y2K.debug.state.playMs), 123000);
    await p.evaluate(() => { dispatchEvent(new PageTransitionEvent('pagehide')); window.testNow += 600000; dispatchEvent(new PageTransitionEvent('pageshow')); Y2K.debug.tickPlay(); });
    assert.equal(await p.evaluate(() => Y2K.debug.state.playMs), 123000, 'page cache restore excludes the time away');
    await p.waitForFunction(() => Object.keys(JSON.parse(localStorage.getItem(`y2k${window.Y2K_STATS_CONFIG.game}_leaderboard_pending`) || '{}')).length === 0);
    const legacyPosts = posts.length;
    await p.evaluate(() => { const d = Y2K.debug; d.flush(); d.state.finishRecords = {}; d.state.ends = ['A']; d.showEnding('A'); });
    await p.waitForTimeout(150); assert.equal(posts.length, legacyPosts, 'legacy unlocked endings are not backfilled');
    fail = true;
    await p.evaluate(() => { const d = Y2K.debug; d.state.ends = []; d.showEnding('B'); });
    await p.locator('.finish-review textarea').fill('断网时的感受\n离开后仍然记得。');
    await p.locator('.finish-review-submit').click();
    await p.waitForTimeout(150);
    assert(Object.keys(await p.evaluate(() => JSON.parse(localStorage.getItem(`y2k${window.Y2K_STATS_CONFIG.game}_leaderboard_pending`)))).length > 0);
    const retry = posts.at(-1); fail = false; await p.reload();
    await p.waitForFunction(() => Object.keys(JSON.parse(localStorage.getItem(`y2k${window.Y2K_STATS_CONFIG.game}_leaderboard_pending`) || '{}')).length === 0);
    assert.deepEqual(posts.at(-1), retry, 'retry preserves completion snapshot across reload');
    const count = posts.length;
    const offline = await ctx.newPage(); await offline.goto(require('node:url').pathToFileURL(path.join(root, game === '1' ? '千年虫.html' : '千年虫2.html')).href);
    if (game === '1') await offline.locator('.author-note .title-panel-close').click();
    await offline.getByRole('button', { name: '排行榜', exact: true }).click(); await offline.getByText('排行榜仅在在线版开放。', { exact: true }).waitFor();
    assert.equal(posts.length, count); assert.deepEqual(errors, []);
    console.log(`PASS game ${game} ${kind}: four columns/top20, phone scroll/close, errors/retry, 3 languages, 4 ending snapshots, timing pauses, legacy saves, offline isolation`);
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exit(1); });
