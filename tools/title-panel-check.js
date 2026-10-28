// 主页弹窗：关闭、居中、长内容滚动、手机横竖屏与键盘操作。
'use strict';
const assert = require('node:assert/strict'), fs = require('node:fs'), path = require('node:path');
const { pathToFileURL } = require('node:url');
const { chromium, webkit } = require('playwright');
const file = path.join(__dirname, '..', 'index.html');
async function run(browser, name) {
  for (const viewport of [{ width: 1440, height: 950 }, { width: 390, height: 844 }, { width: 844, height: 390 }]) {
    const mobile = viewport.width < 1000;
    for (const lang of ['zh', 'en', 'ja']) {
      const c = await browser.newContext({ viewport, isMobile: mobile, hasTouch: mobile });
      await c.addInitScript(lang => {
        localStorage.setItem('y2k_meta', JSON.stringify({ lang }));
        const saved = { v: 1, player: '弹窗布局验证', chapter: 'ch1', flags: { start: true, ch0: true, ch1: true }, stage: 'off', playMs: 5040000, saved: Date.now() };
        localStorage.setItem('y2k_auto', JSON.stringify(saved)); localStorage.setItem('y2k_slot1', JSON.stringify(saved));
      }, lang);
      const p = await c.newPage(), errors = []; p.on('pageerror', e => errors.push(e.message)); p.setDefaultTimeout(8000);
      await p.goto(pathToFileURL(file).href);
      const labels = await p.evaluate(lang => Object.fromEntries(['新的调查', '读取存档', '结局收集', '关闭', '读取存档码'].map(s => [s, window.Y2K_UI?.[lang]?.[s] || s])), lang);
      const saved = await p.evaluate(() => [localStorage.getItem('y2k_auto'), localStorage.getItem('y2k_slot1')]);
      for (const label of ['新的调查', '读取存档', '结局收集']) {
        const opener = p.locator('#title .menu').getByRole('button', { name: labels[label], exact: true });
        await opener.click(); const dialog = p.getByRole('dialog'); await dialog.waitFor();
        const r = await dialog.boundingBox();
        assert(r.x >= 15 && r.y >= 15 && r.x + r.width <= viewport.width - 15 && r.y + r.height <= viewport.height - 15, '弹窗必须完整位于屏幕内');
        assert(Math.abs(r.x + r.width / 2 - viewport.width / 2) < 2 && Math.abs(r.y + r.height / 2 - viewport.height / 2) < 2, '弹窗必须在屏幕居中');
        const close = dialog.getByRole('button', { name: labels['关闭'], exact: true });
        const hit = await close.evaluate(el => { const r = el.getBoundingClientRect(); return r.width >= 44 && r.height >= 44 && el.contains(document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2)); });
        assert(hit, '关闭按钮须保持可点且有足够触摸面积');
        if (label === '读取存档') {
          const before = await close.boundingBox(), last = dialog.getByRole('button', { name: labels['读取存档码'], exact: true });
          await last.scrollIntoViewIfNeeded();
          assert(await last.evaluate(el => { const r = el.getBoundingClientRect(); return el.contains(document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2)); }), '底部按钮不得被说明文字遮挡');
          assert.equal((await close.boundingBox()).y, before.y, '内部滚动不能移走关闭按钮');
          if (process.env.UI_CHECK_OUTPUT && lang === 'zh') { fs.mkdirSync(process.env.UI_CHECK_OUTPUT, { recursive: true }); await p.screenshot({ path: path.join(process.env.UI_CHECK_OUTPUT, `${name}-${viewport.width}-load-panel.png`) }); }
        }
        if (mobile) {
          await close.evaluate(el => el.addEventListener('touchend', e => e.preventDefault(), { capture: true, passive: false, once: true }));
          await close.tap();
        } else await close.click();
        assert.equal(await p.getByRole('dialog').count(), 0); assert(await opener.evaluate(el => document.activeElement === el));
        assert.deepEqual(await p.evaluate(() => [localStorage.getItem('y2k_auto'), localStorage.getItem('y2k_slot1')]), saved, '关闭面板不能改动存档');
      }
      await p.locator('#title .menu').getByRole('button', { name: labels['读取存档'], exact: true }).click();
      await p.getByRole('dialog').getByRole('button', { name: labels['关闭'], exact: true }).focus();
      await p.keyboard.press('Shift+Tab'); assert(await p.getByRole('dialog').evaluate(el => el.contains(document.activeElement)), '焦点不能离开弹窗');
      await p.keyboard.press('Tab'); assert.equal(await p.evaluate(() => document.activeElement.getAttribute('aria-label')), labels['关闭']);
      await p.keyboard.press('Escape'); assert.equal(await p.getByRole('dialog').count(), 0);
      assert.deepEqual(errors, []); await c.close();
    }
  }
  console.log(name + ': 三个主页弹窗、中英日、居中、手机横竖屏、底部无遮挡、触摸关闭、Esc、焦点及存档保留通过');
}
(async () => {
  const edge = process.env.UI_CHECK_BROWSER || 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
  const runs = [['edge', chromium, fs.existsSync(edge) ? { executablePath: edge } : {}]];
  if (process.argv.includes('--webkit')) runs.push(['webkit', webkit, {}]);
  for (const [name, type, opts] of runs) { const b = await type.launch({ headless: true, ...opts }); try { await run(b, name); } finally { await b.close(); } }
})().catch(e => { console.error(e); process.exitCode = 1; });
