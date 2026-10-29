// Real score/review SQL through isolated browser requests. No production writes.
const assert = require('node:assert/strict'), fs = require('node:fs'), path = require('node:path');
const { pathToFileURL } = require('node:url'), { randomUUID } = require('node:crypto');
const { chromium, webkit } = require('playwright');
const root = path.resolve(__dirname, '..'), config = JSON.parse(fs.readFileSync(path.join(root, 'src/stats-config.json')));
const url = config.allowedOrigins[0] + '/';
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8')
  .replace('const debug = {', 'const debug = { showEnding, showTitle, loadState, tickPlay,')
  .replace('return { add, boot, lang };', 'return { add, boot, lang, debug };');
(async () => {
  const api = await import(pathToFileURL(path.join(root, 'services/qiannianchong-stats/lib/leaderboard.mjs')));
  const { testDatabase } = await import(pathToFileURL(path.join(root, 'services/qiannianchong-stats/scripts/stats-test.mjs')));
  const kind = process.argv.includes('--webkit') ? 'webkit' : 'edge';
  const browser = await (kind === 'webkit' ? webkit.launch({ headless: true }) : chromium.launch({ headless: true, executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe' }));
  try {
    for (const lang of ['zh', 'en', 'ja']) {
      const db = testDatabase(), errors = [], submissions = [];
      const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
      await ctx.addInitScript(lang => { localStorage.setItem('y2k_meta', JSON.stringify({ lang })); sessionStorage.setItem('y2k_author_note_seen', '1'); }, lang);
      await ctx.route('**/*', async route => {
        const req = route.request();
        if (req.url() === url) return route.fulfill({ contentType: 'text/html', body: html });
        if (req.url() === config.leaderboardEndpoint) {
          if (req.method() === 'POST') submissions.push(JSON.parse(req.postData()));
          const result = await api.handleLeaderboard(new Request(req.url(), { method: req.method(), headers: req.headers(), ...(req.method() === 'POST' ? { body: req.postData() } : {}) }), db);
          return route.fulfill({ status: result.status, headers: Object.fromEntries(result.headers), body: await result.text() });
        }
        if (req.url() === config.endpoint) return route.fulfill({ contentType: 'application/json', body: '{"visits":0,"online":0}' });
        return route.abort();
      });
      const p = await ctx.newPage(); p.setDefaultTimeout(10000); p.on('pageerror', e => errors.push(e.message)); await p.goto(url);
      const labels = await p.evaluate(lang => Object.fromEntries(['新的调查', '开始', '继续调查', '返回标题画面', '排行榜'].map(x => [x, window.Y2K_UI?.[lang]?.[x] || x])), lang);
      await p.getByRole('button', { name: labels['新的调查'], exact: true }).tap();
      await p.getByRole('button', { name: labels['开始'], exact: true }).tap();
      await p.evaluate(() => { const d = Y2K.debug; d.flush(); d.state.playMs = 120000; d.state.hints = { a: 2, b: 3 }; d.showEnding('A'); });
      const snapshot = await p.evaluate(() => ({ ...Y2K.debug.state.finishRecords.A }));
      const review = ' 那些没有寄出的信。\n<svg onload="window.reviewXSS=1">🙂 English 日本語。 ';
      await p.locator('.finish-review textarea').fill(review);
      for (const [width, height] of [[390, 844], [320, 568], [844, 390]]) {
        await p.setViewportSize({ width, height });
        const rect = await p.locator('.finish-review').boundingBox();
        assert(rect.x >= 0 && rect.y >= 0 && rect.x + rect.width <= width + 1 && rect.y + rect.height <= height + 1, 'review dialog fits phone and landscape');
      }
      await p.setViewportSize({ width: 390, height: 844 });
      await p.reload(); await p.getByRole('button', { name: labels['继续调查'], exact: true }).tap();
      assert.equal(await p.locator('.finish-review textarea').inputValue(), review, 'draft survives refresh and continue');
      assert.equal(await p.evaluate(() => Y2K.debug.state.finishRecords.A.durationMs), snapshot.durationMs);
      assert.equal(await p.evaluate(() => Y2K.debug.state.finishRecords.A.hints), 5);
      // Save an older copy to exercise repeat ending/manual-save restoration.
      const oldSave = await p.evaluate(() => JSON.parse(JSON.stringify(Y2K.debug.state)));
      await p.locator('.finish-review-submit').tap();
      await p.waitForFunction(() => Object.keys(JSON.parse(localStorage.getItem('y2k1_leaderboard_pending') || '{}')).length === 0);
      const winner = (await api.readLeaderboard(db, '1')).endings.A[0];
      assert.equal(winner.review, review.trim()); assert.equal(winner.durationMs, snapshot.durationMs); assert.equal(winner.hints, 5);
      assert(submissions.some(x => x.review === review.trim()));
      await p.getByRole('button', { name: labels['返回标题画面'], exact: true }).tap();
      await p.getByRole('button', { name: labels['排行榜'], exact: true }).tap();
      const row = p.locator('[data-ending="A"] tbody tr').first(); await row.waitFor();
      for (let i = 0; i < 3; i++) {
        await row.locator('button').nth(i).tap();
        await p.locator('.leaderboard-review:not([hidden])').waitFor();
        assert.equal(await p.locator('.leaderboard-review-text').textContent(), review.trim());
        assert.equal(await p.evaluate(() => window.reviewXSS), undefined);
        if (i === 0 && process.env.LEADERBOARD_SCREENSHOTS) await p.screenshot({ path: path.join(process.env.LEADERBOARD_SCREENSHOTS, `${kind}-${lang}-tap-review.png`) });
        await row.locator('button').nth(i).tap();
        assert.equal(await p.locator('.leaderboard-review:not([hidden])').count(), 0, 'second tap dismisses review');
      }
      await p.locator('.title-panel-close').tap();
      await p.evaluate(save => { Y2K.debug.loadState(save); Y2K.debug.showEnding('A'); }, oldSave);
      assert.equal(await p.locator('.finish-review').count(), 0, 'old save cannot repeat an already submitted review');
      assert.equal(await p.evaluate(() => Y2K.debug.state.finishRecords.A.review), review.trim());
      // Blank review and Escape both let the player continue normally.
      await p.evaluate(() => Y2K.debug.showEnding('B')); await p.locator('.finish-review-submit').tap();
      await p.waitForFunction(() => Object.keys(JSON.parse(localStorage.getItem('y2k1_leaderboard_pending') || '{}')).length === 0);
      assert.equal((await api.readLeaderboard(db, '1')).endings.B[0].review, '');
      await p.evaluate(() => Y2K.debug.showEnding('H')); await p.keyboard.press('Escape');
      assert.equal(await p.locator('.finish-review').count(), 0);
      await p.waitForFunction(() => Object.keys(JSON.parse(localStorage.getItem('y2k1_leaderboard_pending') || '{}')).length === 0);
      assert.equal((await api.readLeaderboard(db, '1')).endings.H[0].review, '');
      // A long last-place review remains readable after horizontal and vertical scrolling.
      for (let i = 0; i < 20; i++) await api.recordScore(db, { game: '1', ending: 'C', playerId: randomUUID(), runId: randomUUID(), durationMs: 600000 + i, hints: i, review: i === 19 ? '最后那封信\n'.repeat(50) : '' });
      await p.evaluate(() => Y2K.debug.showTitle());
      await p.getByRole('button', { name: labels['排行榜'], exact: true }).tap();
      const last = p.locator('[data-ending="C"] tbody tr').last().locator('button').first(); await last.tap();
      const tip = p.locator('.leaderboard-review'); await tip.waitFor();
      const rect = await tip.boundingBox(); assert(rect.x >= 0 && rect.y >= 0 && rect.x + rect.width <= 390 && rect.y + rect.height <= 844);
      assert.equal(await p.locator('.leaderboard-review-text').textContent(), '最后那封信\n'.repeat(50).trim());
      await p.locator('.title-panel-close').tap(); assert.equal(await p.locator('.leaderboard-review').count(), 0);
      assert.deepEqual(errors, []); await ctx.close(); db.close();
      console.log(`PASS ${kind} ${lang}: phone taps, real SQL review association, blank/Escape, draft reload, immutable snapshot, old saves, long reviews and text safety`);
    }
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exit(1); });
