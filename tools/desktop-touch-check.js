// 模拟电脑的真实触屏回归；独立存档，不读取玩家进度。
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium, webkit } = require('playwright');
const release = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
assert(release.includes('return { add, boot, lang };'), '请先构建正式版');
const html = release.replace('return { add, boot, lang };', 'return { add, boot, lang, debug };');
if (process.env.DESKTOP_CHECK_SCREENSHOT) fs.mkdirSync(process.env.DESKTOP_CHECK_SCREENSHOT, { recursive: true });

async function run(browser, name, viewport, nativeClick) {
  const context = await browser.newContext({ viewport, hasTouch: true, isMobile: true });
  // 本测试从已读作者说明的状态开始；弹窗生命周期由 title-panel-check 覆盖。
  await context.addInitScript(() => sessionStorage.setItem('y2k_author_note_seen', '1'));
  await context.route('http://wyjm.test/desktop', r => r.fulfill({ contentType: 'text/html', body: html }));
  const p = await context.newPage(), errors = [];
  p.setDefaultTimeout(8000); p.on('pageerror', e => errors.push(e.message));
  await p.goto('http://wyjm.test/desktop');
  await p.getByRole('button', { name: '新的调查', exact: true }).click();
  await p.getByRole('button', { name: '开始', exact: true }).click(); await p.locator('.card').click();
  if (viewport.width === 390 && nativeClick) {
    await p.evaluate(() => document.addEventListener('touchend', e => { if (e.target.closest('#screen')) e.preventDefault(); }, { capture: true, passive: false }));
    await p.getByRole('button', { name: '开机', exact: true }).tap();
    await p.locator('#pz_c0_bios').fill(await p.evaluate(() => Y2K.debug.D.puzzles.c0_bios.answers[0]));
    await p.locator('#screen').getByRole('button', { name: 'Enter', exact: true }).tap();
    await p.locator('#pz_c0_login').fill(await p.evaluate(() => Y2K.debug.D.puzzles.c0_login.answers[0]));
    await p.locator('#screen').getByRole('button', { name: '确定', exact: true }).tap();
    await p.locator('#desktop').waitFor();
    console.log(`${name}: 不补发 click 的电源、BIOS 和 Windows 登录通过`);
  }
  await p.evaluate(() => {
    const d = Y2K.debug; d.flush(); d.state.stage = 'win'; d.state.chapter = 'ch1';
    Object.assign(d.state.flags, { ch0: true, ch1: true, solved_c0_bios: true, solved_c0_login: true });
    for (const x of d.D.dialogues) d.state.dlg[x.id] = { done: 1 };
    d.state.dlgQ = {}; localStorage.setItem('y2k_auto', JSON.stringify(d.state));
  });
  await p.reload(); await p.getByRole('button', { name: '继续调查', exact: true }).click();
  if (!nativeClick) await p.evaluate(() => document.addEventListener('touchend', e => {
    if (e.target.closest('#screen, #modal, .viewer')) e.preventDefault();
  }, { capture: true, passive: false }));
  const button = (host, label) => host.getByRole('button', { name: label, exact: true });
  const active = () => p.locator('.win.active');
  const close = async () => { await button(active().locator(':scope > .titlebar'), '关闭').tap(); };
  const openApp = id => p.evaluate(id => Y2K.debug.openApp(id), id);
  const rows = () => active().locator('table.det tr').filter({ has: p.locator('button') });

  // 还原必须更新标记、移除回收站行、出现在原目录，并写入存档。
  await p.locator('#icons .icon').filter({ hasText: '回收站' }).tap();
  if (process.env.DESKTOP_CHECK_SCREENSHOT && nativeClick) await p.screenshot({ path: path.join(process.env.DESKTOP_CHECK_SCREENSHOT, `${name}-${viewport.width}-recycle.png`) });
  const files = await p.evaluate(() => Y2K.debug.D.files.filter(f => f.deleted && f.requires === 'ch1').map(f => ({ id: f.id, path: f.path })));
  for (const f of files) {
    const row = rows().filter({ hasText: f.path.split('/').pop() });
    const hit = await button(row, '还原').evaluate(el => {
      const r = el.getBoundingClientRect(), top = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2);
      return r.height >= 36 && !!top && el.contains(top);
    });
    assert(hit, '手机端还原按钮应直接可见且有足够触摸面积');
    await button(row, '还原').tap();
    assert(await p.evaluate(id => !!Y2K.debug.state.flags['restored_' + id], f.id), '回收站还原按钮触屏无响应');
    await row.waitFor({ state: 'detached' });
  }
  assert.equal(await rows().count(), 0); await close();
  await openApp('mydocs');
  for (const f of files) assert(await active().locator('.flist .icon').filter({ hasText: f.path.split('/').pop() }).isVisible(), '还原文件未回到原目录');
  await p.waitForFunction(ids => ids.every(id => JSON.parse(localStorage.getItem('y2k_auto')).flags['restored_' + id]), files.map(f => f.id));
  await close();

  const menu = async (label, item) => {
    await active().locator('.menubar > div').filter({ hasText: label }).tap();
    await active().locator('.dropdown > div').getByText(item, { exact: true }).tap();
  };
  const dismiss = () => button(p.locator('#modal'), '确定').tap();
  const desktopIcon = label => p.locator('#icons .icon').filter({ hasText: label });
  // 资源管理器、菜单、隐藏文件、地址层级和消息框。
  await desktopIcon('我的电脑').tap();
  assert(await button(active(), '↑ 向上').isDisabled());
  await active().locator('.flist .icon').filter({ hasText: '(C:)' }).tap();
  assert((await active().locator('.addr input').inputValue()).startsWith('C:'));
  await button(active(), '↑ 向上').tap();
  assert(await button(active(), '↑ 向上').isDisabled());
  await active().locator('.flist .icon').filter({ hasText: '控制面板' }).tap();
  assert.equal(await active().locator(':scope > .titlebar .t').innerText(), '显示 属性', JSON.stringify(await p.evaluate(() => Y2K.debug.wins().map(w => ({ key: w.key, title: w.title })))));
  await button(active(), '设置…').tap(); assert((await p.locator('#modal').innerText()).includes('字幕设置')); await dismiss();
  await button(active(), '预览').tap(); assert(await p.locator('#saver').isVisible()); await p.locator('#saver').tap();
  assert.equal(await p.locator('#saver').count(), 0); await close(); await close();
  await desktopIcon('我的文档').tap();
  await button(active(), '属性').tap(); assert((await p.locator('#modal').innerText()).includes('请先单击')); await dismiss();
  await menu('查看(V)', '详细资料'); assert(await active().locator('table.det').isVisible());
  await menu('查看(V)', '显示所有文件（含隐藏文件）'); assert(await p.evaluate(() => Y2K.debug.state.showHidden));
  await menu('查看(V)', '显示所有文件（含隐藏文件）'); assert(!(await p.evaluate(() => Y2K.debug.state.showHidden)));
  await menu('查看(V)', '大图标'); assert(await active().locator('.flist').isVisible());
  await menu('帮助(H)', '关于 Windows'); assert((await p.locator('#modal').innerText()).includes('Windows 98')); await dismiss();
  // 长按选中后，属性和打开菜单均可操作；长按不能顺便打开文件。
  const fileIcon = active().locator('.flist .icon').filter({ hasText: '交接.txt' });
  await fileIcon.evaluate(async el => {
    const r = el.getBoundingClientRect(), t = { identifier: 31, clientX: r.x + 10, clientY: r.y + 10 };
    const send = type => { const e = new Event(type, { bubbles: true, cancelable: true }); Object.defineProperty(e, 'touches', { value: type === 'touchstart' ? [t] : [] }); Object.defineProperty(e, 'changedTouches', { value: [t] }); el.dispatchEvent(e); };
    send('touchstart'); await new Promise(resolve => setTimeout(resolve, 620)); send('touchend');
  });
  assert.equal(await p.locator('.win').count(), 1, '长按不应打开文件');
  await p.getByRole('menuitem', { name: '属性', exact: true }).tap(); assert((await p.locator('#modal').innerText()).includes('交接.txt')); await dismiss();
  await button(active(), '属性').tap(); assert((await p.locator('#modal').innerText()).includes('交接.txt')); await dismiss();
  await menu('文件(F)', '打开'); assert(await active().locator('pre.note').isVisible());
  await menu('编辑(E)', '全选'); assert((await p.evaluate(() => getSelection().toString())).length > 10);
  await menu('文件(F)', '属性'); await dismiss(); await menu('文件(F)', '关闭');
  await menu('查看(V)', '详细资料');
  await active().locator('tr').filter({ hasText: '交接.txt' }).tap(); assert(await active().locator('pre.note').isVisible()); await close();
  await menu('文件(F)', '关闭');

  // 开始菜单所有入口、任务栏切换、系统消息框的取消。
  for (const label of ['我的电脑', '梧桐树下', '鸽讯', '记事本', '显示属性', '帮助', '关闭系统...']) {
    await p.locator('#startbtn').tap(); assert(await p.locator('#startmenu').isVisible());
    await p.locator('#startmenu li').filter({ hasText: label }).tap();
    assert.equal(await p.locator('#startmenu').count(), 0);
    if (label === '帮助') { assert((await p.locator('#modal').innerText()).includes('帮助')); await dismiss(); }
    else if (label === '关闭系统...') { await button(p.locator('#modal'), '取消').tap(); assert(await p.locator('#desktop').isVisible()); }
    else if (label === '鸽讯') { assert(await p.locator('#modal .pz').isVisible()); await button(p.locator('#modal'), '取消').tap(); }
    else {
      const title = await active().locator(':scope > .titlebar .t').innerText();
      await button(active().locator(':scope > .titlebar'), '最小化').tap();
      await p.locator('#tasks .task').filter({ hasText: title }).tap(); assert(await active().isVisible());
      await p.locator('#tasks .task').filter({ hasText: title }).tap(); assert.equal(await p.locator('.win:visible').count(), 0);
      await p.locator('#tasks .task').filter({ hasText: title }).tap(); await close();
    }
  }

  // 鸽讯登录、联系人、日期、查找、结果跳转和关闭。
  await desktopIcon('鸽讯').tap();
  await button(p.locator('#modal'), '确定').tap(); assert((await p.locator('#modal .msg').innerText()).includes('请先作答'));
  await button(p.locator('#modal'), '提示（0/3）').tap(); assert(await p.evaluate(() => Y2K.debug.state.hints.c1_gexun === 1));
  await p.locator('#pz_c1_gexun').fill(await p.evaluate(() => Y2K.debug.D.puzzles.c1_gexun.answers[0]));
  await button(p.locator('#modal'), '确定').tap(); await active().locator('.gx').waitFor();
  const contacts = await p.evaluate(() => Y2K.debug.D.gxContacts.map(c => c.nick));
  for (const nick of contacts) {
    await active().locator('.gx .ct').filter({ hasText: nick }).tap();
    const dates = active().locator('.gx .dates button');
    for (let i = 0, count = await dates.count(); i < count; i++) {
      await dates.nth(i).tap(); assert(await active().locator('.gx .log .ln').count() > 0);
    }
  }
  await menu('系统', '查找聊天记录…');
  const query = await p.evaluate(() => Y2K.debug.D.gxLogs.find(l => Y2K.debug.test(l.requires)).lines[0].text.slice(0, 3));
  await p.locator('#gxq').fill(query); await button(p.locator('#modal'), '查找').tap();
  await p.locator('#modal .in > div').first().tap(); assert.equal(await p.locator('#modal .dlg98').count(), 0);
  assert(await active().locator('.gx .log .ln').count() > 0);
  await menu('系统', '查找聊天记录…'); await button(p.locator('#modal'), '关闭').tap(); await close();

  // 后续章节的播放器、转速滑块、解压和后台筛选按钮。
  await p.evaluate(() => Object.assign(Y2K.debug.state.flags, { ch2: true, ch3: true, ch4: true, ch5: true, ch6: true }));
  await p.evaluate(() => Y2K.debug.openFile('c4_wav0315'));
  const speeds = ['0.5', '0.75', '1', '1.25', '1.5', '2'];
  for (let i = 0; i < speeds.length; i++) {
    const slider = active().locator('input[type=range]');
    await slider.evaluate((el, value) => { el.value = value; el.dispatchEvent(new Event('input', { bubbles: true })); window.testSlider = el; }, i);
    assert(await p.evaluate(() => window.testSlider.isConnected), '调整转速不应移除正在拖动的滑块');
    assert.equal(await active().locator('.spd').innerText(), speeds[i] + '×');
    await button(active(), '▶ 播放').tap();
    assert(await p.evaluate(s => !!Y2K.debug.state.flags['speed_c4_wav0315_' + s.replace('.', '_')], speeds[i]));
    await button(active(), '■ 停止').tap(); assert.equal(await active().locator('.cassette.playing').count(), 0);
  }
  await close();
  const zip = await p.evaluate(() => { const f = Y2K.debug.D.files.find(f => f.type === 'zip' && f.lock); return { id: f.id, lock: f.lock, target: f.zip.extractTo }; });
  await p.evaluate(id => Y2K.debug.openFile(id), zip.id); await button(active(), '解压…').tap();
  await button(p.locator('#modal'), '取消').tap(); await button(active(), '解压…').tap();
  await p.locator('#pz_' + zip.lock).fill(await p.evaluate(id => Y2K.debug.D.puzzles[id].answers[0], zip.lock));
  await button(p.locator('#modal'), '确定').tap(); await button(active(), '打开解压目录').waitFor();
  await button(active(), '打开解压目录').tap();
  assert.equal(await p.evaluate(() => Y2K.debug.wins().find(w => w.key === 'explorer').state.path), zip.target.replace(/\\/g, '/'));
  await close(); await close();
  await p.evaluate(() => { Y2K.debug.state.flags.solved_c1_admin = true; Y2K.debug.openIE('/admin/log.asp'); });
  await active().locator('#lgu').fill('sysop'); await button(active(), '筛选').tap();
  assert((await active().locator('#ieaddr').inputValue()).includes('user=sysop'));
  await button(active(), '改为从旧到新').tap(); assert((await active().locator('#ieaddr').inputValue()).includes('order=asc'));
  await button(active(), '改为从新到旧').tap(); assert((await active().locator('#ieaddr').inputValue()).includes('order=desc'));
  await close();
  // 刷新后仍保留还原结果。
  await p.reload(); await button(p, '继续调查').click(); await openApp('recycle'); assert.equal(await rows().filter({ hasText: '交接.txt' }).count(), 0);
  assert.deepEqual(errors, []); await context.close();
  console.log(`${name} ${viewport.width}×${viewport.height} ${nativeClick ? '正常点击' : '不补发 click'}: 模拟电脑触屏检查通过`);
}
(async () => {
  const edge = process.env.UI_CHECK_BROWSER || 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
  const runs = [['edge', chromium, fs.existsSync(edge) ? { executablePath: edge } : {}]];
  if (process.argv.includes('--webkit')) runs.push(['webkit', webkit, {}]);
  for (const [name, type, opts] of runs) {
    const browser = await type.launch({ headless: true, ...opts });
    const sizes = process.argv.includes('--portrait') ? [{ width: 390, height: 844 }] : [{ width: 390, height: 844 }, { width: 844, height: 390 }];
    const clicks = process.argv.includes('--native') ? [true] : [true, false];
    try { for (const viewport of sizes) for (const nativeClick of clicks) await run(browser, name, viewport, nativeClick); }
    finally { await browser.close(); }
  }
})().catch(e => { console.error(e); process.exitCode = 1; });
