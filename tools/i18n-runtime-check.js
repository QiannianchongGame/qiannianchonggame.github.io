// 验证正式包中的英日译文；调试入口只注入隔离测试页，不接触玩家存档。
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { chromium, webkit } = require('playwright');
const root = path.join(__dirname, '..');
const uiKeys = JSON.parse(fs.readFileSync(path.join(root, 'src', 'i18n', 'ui-keys.json'), 'utf8'));
const uiContext = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(root, 'src', 'i18n', 'ui.js'), 'utf8'), uiContext);
for (const lang of ['en', 'ja']) for (const key of uiKeys) {
  const value = uiContext.window.Y2K_UI[lang][key];
  assert.equal(typeof value, 'string', `${lang}: missing interface text ${key}`);
  assert(value.trim() && !value.includes('ZXQSEP991ZXQ'), `${lang}: invalid interface text ${key}`);
  assert.deepEqual(value.match(/<[^>]+>/g) || [], key.match(/<[^>]+>/g) || [], `${lang}: interface markup ${key}`);
}
const original = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
assert(original.includes('window.Y2K_LANGS=["zh","en","ja"]'), '完整译文必须打包并开放入口语言切换');
assert(original.includes('return { add, boot, lang };'), '正式版不应公开调试接口');
const html = original.replace('return { add, boot, lang };', 'return { add, boot, lang, debug };');
const output = process.env.I18N_CHECK_OUTPUT || path.join(require('node:os').tmpdir(), 'wyjm-i18n-check');
fs.mkdirSync(output, { recursive: true });
const chapterFiles = ['base', 'ch0', 'ch1', 'ch2', 'ch3', 'ch4', 'ch5', 'ch6', 'story'];
const maps = {};
for (const lang of ['en', 'ja']) {
  maps[lang] = {};
  for (const ch of chapterFiles) vm.runInNewContext(fs.readFileSync(path.join(root, 'src/i18n', lang, ch + '.js'), 'utf8'), { Y2K: { lang: (_, m) => Object.assign(maps[lang], m) } });
}
const source = { files: [], puzzles: {}, boards: {} };
for (const ch of chapterFiles) vm.runInNewContext(fs.readFileSync(path.join(root, 'src/content', ch + '.js'), 'utf8'), { Y2K: { add: o => { source.files.push(...o.files || []); Object.assign(source.puzzles, o.puzzles || {}); Object.assign(source.boards, o.boards || {}); } } });
async function run(browser, lang) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  // 本测试从已读作者说明的状态开始；弹窗生命周期由 title-panel-check 覆盖。
  await ctx.addInitScript(() => sessionStorage.setItem('y2k_author_note_seen', '1'));
  await ctx.addInitScript(code => localStorage.setItem('y2k_meta', JSON.stringify({ lang: code })), lang);
  await ctx.route('http://wyjm.test/i18n', route => route.fulfill({ contentType: 'text/html', body: html }));
  const page = await ctx.newPage(), errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto('http://wyjm.test/i18n');
  const audit = await page.evaluate(({ map, source }) => {
    const d = Y2K.debug, D = d.D, bad = [];
    const byId = list => Object.fromEntries(list.map(x => [x.id, x]));
    const roots = {
      chapter: byId(D.chapters), app: D.apps, contact: D.contacts2026, file: byId(D.files), dlg: byId(D.dialogues),
      mail26: byId(D.mails2026), item: byId(D.items2026), reading: byId(D.readings), journal: D.journal, ux: byId(D.userExtras),
      puzzle: D.puzzles, board: D.boards, note: D.notes, col: D.collectibles, ending: D.endings, saver: D.screensaver,
      bboard: byId(D.bbsBoards), user: byId(D.users), thread: byId(D.threads), bmail: byId(D.mails), page: byId(D.pages),
      gxc: byId(D.gxContacts), gx: byId(D.gxLogs), gxacc: { me: D.gxAccount },
    };
    function lookup(obj, parts) {
      if (!parts.length) return obj;
      if (!obj || typeof obj !== 'object') return undefined;
      for (let n = parts.length; n > 0; n--) {
        const key = parts.slice(0, n).join('.');
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          const found = lookup(obj[key], parts.slice(n)); if (found !== undefined) return found;
        }
      }
    }
    for (const [key, value] of Object.entries(map)) {
      if (key.startsWith('seg|')) continue;
      const parts = key.replace(/\+$/, '').split('.');
      const actual = key.startsWith('bbs.') ? D.bbsMeta[key.slice(4)] : lookup(roots[parts[0]]?.[parts[1]], parts.slice(2));
      if (key.endsWith('+')) {
        if (Array.isArray(value) && value.some(v => !actual?.includes(v))) bad.push(key + ': alias missing');
        continue;
      }
      // Photographic SVGs are replaced at boot; the translated readout after the SVG must survive.
      if (typeof value === 'string' && value.includes('<svg') && typeof actual === 'string' && actual.includes('data-photo=')) {
        const suffix = value.slice(value.indexOf('</svg>') + 6);
        if (!actual.endsWith(suffix)) bad.push(key + ': photo transcript missing');
      } else if (JSON.stringify(actual) !== JSON.stringify(value)) bad.push(key + ': translation not applied');
    }
    for (const f of source.files) if (D.files.find(v => v.id === f.id)?.path !== f.path) bad.push(f.id + ': physical file path changed');
    for (const [id, p] of Object.entries(source.puzzles)) {
      const q = D.puzzles[id];
      if (p.kind === 'choice') {
        const correct = p.options.indexOf(p.answer);
        q.options.forEach((_, i) => { if (d.checkPuzzle(q, i) !== (i === correct)) bad.push(id + ': choice index ' + i); });
      } else if (p.kind === 'pick') {
        const correct = p.answerSet.map(x => p.options.indexOf(x));
        if (!d.checkPuzzle(q, correct)) bad.push(id + ': correct evidence rejected');
        if (d.checkPuzzle(q, correct.slice(1))) bad.push(id + ': incomplete evidence accepted');
      } else if (p.kind === 'multi') {
        const values = p.fields.map(f => f.answers[0]);
        if (!d.checkPuzzle(q, values)) bad.push(id + ': Chinese multi answer rejected');
        const translated = q.fields.map(f => f.answers.at(-1));
        if (!d.checkPuzzle(q, translated)) bad.push(id + ': localized multi answer rejected');
      } else if (q.answers?.length) {
        for (const answer of q.answers) if (!d.checkPuzzle(q, answer)) bad.push(id + ': answer rejected ' + answer);
      }
    }
    for (const [id, b] of Object.entries(source.boards)) {
      const q = D.boards[id];
      const slots = s => [...s.matchAll(/\{([^}]+)\}/g)].map(x => x[1]).sort();
      if (JSON.stringify(slots(q.text)) !== JSON.stringify(slots(b.text))) bad.push(id + ': deduction blanks changed');
      if (JSON.stringify(q.slots) !== JSON.stringify(b.slots)) bad.push(id + ': deduction answers changed');
    }
    return { bad, fields: Object.keys(map).length, puzzles: Object.keys(source.puzzles).length };
  }, { map: maps[lang], source });
  assert.deepEqual(audit.bad, [], `${lang}: formal bundle field/puzzle audit`);
  console.log(`${lang}: ${audit.fields} 个译文字段、${audit.puzzles} 个谜题及路径/照片译注通过`);
  const actual = await page.evaluate(() => {
    const d = Y2K.debug, D = d.D;
    return {
      title: D.chapters.find(c => c.id === 'ch0').name,
      question: D.journal.ch1.question,
      reading: D.readings.find(r => r.id === 'r1_deskmates').html,
      letter: D.items2026.find(i => i.id === 'c0_it_letter').html,
      typo: D.dialogues.find(x => x.id === 'c0_d_hello').steps[8].npc,
      password: d.checkPuzzle(D.puzzles.c0_login, 'SSJQ'),
      poem: D.threads.find(t => t.id === 1168).posts[0].html,
      zipChinese: d.checkPuzzle(D.puzzles.c6_p_zip, '晚风明天见'),
      zipPinyin: d.checkPuzzle(D.puzzles.c6_p_zip, 'wanfengmingtianjian'),
      zipLocalized: d.checkPuzzle(D.puzzles.c6_p_zip, document.documentElement.lang === 'en' ? 'evening breeze see you tomorrow' : '晩風また明日'),
      lastPoem: d.checkPuzzle(D.puzzles.c6_p_lastpoem, document.documentElement.lang === 'en' ? 'summer solstice' : '夏至'),
      evidenceCorrect: d.checkPuzzle(D.puzzles.c6_p_evidence, [0, 2, 4]),
      evidenceWrong: d.checkPuzzle(D.puzzles.c6_p_evidence, [0, 1, 2]),
      typoEvidence: D.puzzles.c6_p_evidence.options[0],
      ending: D.endings.C.html,
      noteOriginal: D.files.find(f => f.id === 'c5_f_letter').html,
      typoAnswer: d.checkPuzzle(D.puzzles.c5_p_typo, '以经 在也') && d.checkPuzzle(D.puzzles.c5_p_typo, 'yijingzaiye'),
      typistAnswer: d.checkPuzzle(D.puzzles.c5_p_typist, document.documentElement.lang === 'en' ? 'He Man' : '何蔓'),
      imeAnswer: d.checkPuzzle(D.puzzles.c5_p_ime, 2) && !d.checkPuzzle(D.puzzles.c5_p_ime, 0),
      zipNear: D.puzzles.c6_p_zip.near['3132636459'],
      typoNear: D.puzzles.c5_p_typo.near['已经再也'],
    };
  });
  if (lang === 'en') {
    assert.equal(actual.title, 'Power On');
    assert(actual.question.includes('Lin Wan'));
    assert(actual.reading.includes('fraction problem'));
    assert(actual.letter.includes('He liked Lin Wan'));
  } else {
    assert.equal(actual.title, '起動');
    assert(actual.question.includes('林晚'));
    assert(actual.reading.includes('分数の問題'));
    assert(actual.letter.includes('彼は林晩が好き'));
  }
  assert(/〔在[^〕]*〕/.test(actual.typo), '保留作为线索的中文错字');
  assert.equal(actual.password, true, '五笔密码必须仍能使用');
  assert(actual.poem.includes('3. 晚风从操场那边吹过来') && actual.poem.includes('6. 可是明天会有人站出来'), '保留取字所需中文原文');
  assert(['wǎn', 'fēng', 'míng', 'tiān'].every(s => actual.poem.includes(s)), '逐行提供中文读音');
  assert(actual.zipChinese && actual.zipPinyin && actual.zipLocalized && actual.lastPoem, '中文、拼音和译名答案均应可用');
  assert(actual.evidenceCorrect && !actual.evidenceWrong, '翻译选项不能改变终章的正确证据');
  assert(actual.typoEvidence.includes('〔以经〕') && actual.typoEvidence.includes('〔在也〕'), '保留遗书中的中文错字');
  assert(actual.ending.includes('晚风明天见'), '真结局保留原文');
  assert(actual.noteOriginal.includes('现在一切都以经结束了') && actual.noteOriginal.includes('〔在也〕'), '遗书保留原文和译注');
  assert(actual.typoAnswer && actual.typistAnswer && actual.imeAnswer, '输入习惯线索在两种语言中仍可作答');
  assert(lang === 'en' ? actual.zipNear.includes('key, not the password') : actual.zipNear.includes('鍵であってパスワードではない'), '近似答案的反馈应使用当前语言');
  assert(lang === 'en' ? actual.typoNear.includes('correct spellings') : actual.typoNear.includes('正しい表記'), '原有中文答案的纠错反馈应翻译');
  const ui = uiContext.window.Y2K_UI[lang];
  await page.getByRole('button', { name: ui['新的调查'], exact: true }).tap();
  await page.getByRole('button', { name: ui['开始'], exact: true }).tap();
  await page.locator('.card').tap();
  await page.evaluate(() => {
    const d = Y2K.debug; d.flush(); d.state.stage = 'win'; d.state.chapter = 'ch1';
    Object.assign(d.state.flags, { ch0: true, ch1: true, solved_c0_bios: true, solved_c0_login: true, solved_c1_gexun: true });
    for (const x of d.D.dialogues) d.state.dlg[x.id] = { done: 1 };
    d.state.dlgQ = {}; localStorage.setItem('y2k_auto', JSON.stringify(d.state));
  });
  await page.reload();
  await page.getByRole('button', { name: ui['继续调查'], exact: true }).tap();
  await page.locator('#icons .icon').filter({ hasText: ui['梧桐树下'] }).tap();
  const ie = page.locator('.win').filter({ has: page.locator('#ieaddr') });
  await ie.locator('.bbs a[href="/board.asp?id=wenxue"]').tap();
  await ie.locator('.bbs a[href="/thread.asp?id=1168"]').tap();
  assert((await ie.locator('.post .content').first().innerText()).includes('3. 晚风从操场那边吹过来'));
  await page.screenshot({ path: path.join(output, lang + '-mobile-poem.png') });
  await ie.locator('.bbs .nav a[href="/search.asp"]').tap();
  await ie.locator('#bbsq').fill(lang === 'en' ? 'Summer Solstice' : '夏至');
  await ie.locator('.bbs').getByRole('button', { name: ui['搜索'], exact: true }).tap();
  await ie.locator('.bbs a[href="/thread.asp?id=1168"]').tap();
  await ie.locator('.bbs .nav a[href="/admin/"]').tap();
  await ie.locator('#pz_c1_admin').fill('ly1103');
  await ie.locator('.bbs').getByRole('button', { name: ui['登录'], exact: true }).tap();
  await page.waitForFunction(() => Y2K.debug.state.flags.solved_c1_admin);
  await ie.locator('.bbs a[href="/admin/recycle.asp"]').tap();
  await ie.locator('.bbs a[href="/thread.asp?id=1137"]').tap();
  assert((await ie.locator('#ieaddr').inputValue()).includes('thread.asp?id=1137'));
  await ie.locator('.titlebar').getByRole('button', { name: ui['关闭'], exact: true }).tap();
  await page.locator('#phoneFab').tap();
  await page.locator('#phTabs button').nth(3).tap();
  assert(await page.locator('.ph-journal').isVisible());
  await page.screenshot({ path: path.join(output, lang + '-mobile-journal.png') });
  await page.locator('.ph-note-tabs button').nth(2).tap();
  await page.locator('.ph-reading-tile').tap();
  assert(await page.locator('.ph-reading svg[data-photo="deskmates"]').isVisible());
  await page.screenshot({ path: path.join(output, lang + '-mobile-reading.png') });
  assert.equal(page.url(), 'http://wyjm.test/i18n');
  assert.deepEqual(errors, []);
  await ctx.close();
  console.log(`${lang}: 序章、旧事、章节引导、中文错字和五笔密码通过`);
}
async function switching(browser) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  // 本测试从已读作者说明的状态开始；弹窗生命周期由 title-panel-check 覆盖。
  await ctx.addInitScript(() => sessionStorage.setItem('y2k_author_note_seen', '1'));
  await ctx.route('http://wyjm.test/i18n', route => route.fulfill({ contentType: 'text/html', body: html }));
  const page = await ctx.newPage(), errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto('http://wyjm.test/i18n');
  await page.getByRole('button', { name: '新的调查', exact: true }).tap();
  await page.getByRole('button', { name: '开始', exact: true }).tap();
  await page.locator('.card').tap();
  await page.evaluate(() => {
    Y2K.debug.flush();
    const value = JSON.stringify(Y2K.debug.state);
    localStorage.setItem('y2k_auto', value);
  });
  await page.reload();
  // The first unload normally updates play time; compare the settled save on the title screen.
  const save = await page.evaluate(() => localStorage.getItem('y2k_auto'));
  for (const [label, language, continueLabel] of [['English', 'en', 'Continue investigation'], ['日本語', 'ja', '調査を続ける'], ['中文', 'zh-CN', '继续调查']]) {
    await Promise.all([page.waitForEvent('load'), page.getByRole('button', { name: label, exact: true }).tap()]);
    assert.equal(await page.evaluate(() => document.documentElement.lang), language);
    assert(await page.getByRole('button', { name: continueLabel, exact: true }).isVisible());
    assert.equal(await page.evaluate(() => localStorage.getItem('y2k_auto')), save, '语言切换不得覆盖存档');
  }
  assert.deepEqual(errors, []);
  await ctx.close();
  console.log('入口中英日切换及存档保留通过（测试页面）');
}
(async () => {
  const edge = process.env.UI_CHECK_BROWSER || 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
  const engines = [['Edge', chromium, fs.existsSync(edge) ? { executablePath: edge } : {}]];
  if (process.argv.includes('--webkit')) engines.push(['WebKit', webkit, {}]);
  for (const [name, type, options] of engines) {
    const browser = await type.launch({ headless: true, ...options });
    try { for (const lang of ['en', 'ja']) { await run(browser, lang); console.log(name + ': OK'); } await switching(browser); }
    finally { await browser.close(); }
  }
})().catch(e => { console.error(e); process.exitCode = 1; });
