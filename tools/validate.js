// 校验所有内容文件：node tools/validate.js
// 检查 id 重复、引用缺失、条件里用到但没有任何地方产生的标记、帖子号段、提示数量等。
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.join(__dirname, '..');
const dir = path.join(root, 'src', 'content');
const order = ['base.js', 'ch0.js', 'ch1.js', 'ch2.js', 'ch3.js', 'ch4.js', 'ch5.js', 'ch6.js', 'story.js'];
const files = order.filter(f => fs.existsSync(path.join(dir, f)))
  .concat(fs.readdirSync(dir).filter(f => f.endsWith('.js') && !order.includes(f)));

const errors = [], warnings = [];
const allChapters = files.length >= 8;
const E = (m) => errors.push(m), W = (m) => warnings.push(m);

const chunks = [];
for (const f of files) {
  const src = fs.readFileSync(path.join(dir, f), 'utf8');
  const sandbox = { Y2K: { add: (o) => chunks.push({ file: f, data: o }) }, console };
  try { vm.runInNewContext(src, sandbox, { filename: f }); }
  catch (e) { E(`${f}: 脚本执行失败：${e.message}`); }
}

const D = { files: [], threads: [], loginLog: [], mails: [], pages: [], userExtras: [], gxlogs: [], puzzles: {}, boards: {},
  dialogues: [], mails2026: [], items2026: [], notes: {}, collectibles: {}, endings: {}, screensaver: [], users: [], boardsBBS: [],
  chapters: [], contacts: [], apps: {}, contacts2026: {}, boot: {}, adminSections: {} };
const owner = {};
function own(kind, id, file) {
  const k = kind + ':' + id;
  if (owner[k]) E(`${kind} id 重复：${id}（${owner[k]} 和 ${file}）`);
  owner[k] = file;
}
for (const { file, data: d } of chunks) {
  const tag = (o) => Object.assign(o, { __file: file });
  (d.files || []).forEach(x => { D.files.push(tag(x)); if (x.id) own('file', x.id, file); });
  if (d.bbs) {
    (d.bbs.threads || []).forEach(x => { D.threads.push(tag(x)); own('thread', x.id, file); });
    (d.bbs.loginLog || []).forEach(x => D.loginLog.push(tag(x)));
    (d.bbs.mails || []).forEach(x => { D.mails.push(tag(x)); own('mail', x.id, file); });
    (d.bbs.pages || []).forEach(x => { D.pages.push(tag(x)); own('page', x.id, file); own('url', (x.url || '').toLowerCase(), file); });
    (d.bbs.users || []).forEach(x => { D.users.push(tag(x)); own('user', x.id, file); });
    (d.bbs.boards || []).forEach(x => { D.boardsBBS.push(tag(x)); own('bbsboard', x.id, file); });
    Object.assign(D.adminSections, d.bbs.adminSections || {});
  }
  (d.userExtras || []).forEach(x => { D.userExtras.push(tag(x)); own('ux', x.id, file); });
  if (d.gexun) {
    (d.gexun.logs || []).forEach(x => { D.gxlogs.push(tag(x)); own('gx', x.id, file); });
    (d.gexun.contacts || []).forEach(x => D.contacts.push(x));
  }
  for (const k of ['puzzles', 'boards', 'notes', 'collectibles', 'endings']) {
    for (const [id, v] of Object.entries(d[k] || {})) { own(k, id, file); D[k][id] = tag(v); }
  }
  (d.dialogues || []).forEach(x => { D.dialogues.push(tag(x)); own('dlg', x.id, file); });
  (d.mails2026 || []).forEach(x => { D.mails2026.push(tag(x)); own('mail26', x.id, file); });
  (d.items2026 || []).forEach(x => { D.items2026.push(tag(x)); own('item', x.id, file); });
  (d.screensaver || []).forEach(x => D.screensaver.push(tag(x)));
  (d.chapters || []).forEach(x => D.chapters.push(x));
  Object.assign(D.apps, d.apps || {});
  Object.assign(D.contacts2026, d.contacts2026 || {});
  Object.assign(D.boot, d.boot || {});
}

// ---- 产生的标记 ----
const produced = new Set(['start']);
D.chapters.forEach(c => produced.add(c.id));
const idsSeen = [];
D.files.forEach(f => f.id && (produced.add('seen_' + f.id), produced.add('restored_' + f.id), produced.add('props_' + f.id)));
D.threads.forEach(t => produced.add('source_t' + t.id));
D.pages.forEach(p => produced.add('source_' + p.id));
D.threads.forEach(t => produced.add('seen_t' + t.id));
D.mails.forEach(m => produced.add('seen_' + m.id));
D.pages.forEach(p => produced.add('seen_' + p.id));
D.userExtras.forEach(p => produced.add('seen_' + p.id));
D.gxlogs.forEach(p => produced.add('seen_' + p.id));
D.mails2026.forEach(p => produced.add('seen_' + p.id));
D.items2026.forEach(p => produced.add('seen_' + p.id));
Object.keys(D.puzzles).forEach(id => produced.add('solved_' + id));
Object.keys(D.boards).forEach(id => produced.add('board_' + id));
Object.keys(D.collectibles).forEach(id => produced.add('col_' + id));
produced.add('collected_all');
D.dialogues.forEach(d => produced.add('dlg_' + d.id));
Object.keys(D.endings).forEach(id => produced.add('ending_' + id));
const speedKey = (s) => String(s).replace('.', '_');
D.files.filter(f => f.tape).forEach(f => ['0.5', '0.75', '1', '1.25', '1.5', '2'].forEach(s => produced.add(`speed_${f.id}_${speedKey(s)}`)));

const actions = [];
function collectAction(a, where) { if (a) actions.push({ a, where }); }
D.files.forEach(f => { collectAction(f.onOpen, 'file ' + f.id); collectAction(f.onProps, 'file props ' + f.id); if (f.tape && f.tape.onSpeed) Object.values(f.tape.onSpeed).forEach(a => collectAction(a, 'tape ' + f.id)); });
D.threads.forEach(t => { collectAction(t.onOpen, 'thread ' + t.id); collectAction(t.onSource, 'thread source ' + t.id); });
D.mails.forEach(m => collectAction(m.onOpen, 'mail ' + m.id));
D.pages.forEach(m => { collectAction(m.onOpen, 'page ' + m.id); collectAction(m.onSource, 'page source ' + m.id); });
D.userExtras.forEach(m => collectAction(m.onOpen, 'ux ' + m.id));
D.gxlogs.forEach(m => collectAction(m.onOpen, 'gx ' + m.id));
D.mails2026.forEach(m => collectAction(m.onOpen, 'mail26 ' + m.id));
D.items2026.forEach(m => collectAction(m.onOpen, 'item ' + m.id));
D.screensaver.forEach(m => collectAction(m.onShow, 'screensaver'));
Object.entries(D.puzzles).forEach(([id, p]) => collectAction(p.onSolve, 'puzzle ' + id));
Object.entries(D.boards).forEach(([id, p]) => collectAction(p.onSolve, 'board ' + id));
function walkSteps(steps, dlg) {
  (steps || []).forEach(s => {
    if (s.action) collectAction(s.action, 'dialogue ' + dlg);
    if (s.choice) s.choice.forEach(c => collectAction(c.action, 'dialogue ' + dlg));
  });
}
D.dialogues.forEach(d => walkSteps(d.steps, d.id));
actions.forEach(({ a }) => (a.set || []).forEach(f => produced.add(f)));

// ---- 检查动作引用 ----
actions.forEach(({ a, where }) => {
  [].concat(a.note || []).forEach(n => { if (!D.notes[n]) E(`${where}: note 引用不存在：${n}`); });
  if (a.collect && !D.collectibles[a.collect]) E(`${where}: collect 引用不存在：${a.collect}`);
  if (a.mail && !D.mails2026.find(m => m.id === a.mail)) E(`${where}: mail 引用不存在：${a.mail}`);
  if (a.ending && !D.endings[a.ending]) E(`${where}: ending 引用不存在：${a.ending}`);
  (a.set || []).concat(a.unset || []).forEach(f => { if (!/^[A-Za-z0-9_]+$/.test(f)) E(`${where}: 非法标记名 ${f}`); });
});

// ---- 条件表达式 ----
const used = [];
function exprFlags(expr, where) {
  if (!expr) return;
  if (typeof expr !== 'string') { E(`${where}: 条件必须是字符串`); return; }
  const cleaned = expr.replace(/[()&|!\s]/g, ' ');
  if (/[^A-Za-z0-9_ ]/.test(cleaned)) E(`${where}: 条件里有非法字符：${expr}`);
  cleaned.split(/\s+/).filter(Boolean).forEach(f => used.push({ f, where }));
}
const reqOf = (arr, label) => arr.forEach(x => exprFlags(x.requires, `${label} ${x.id || x.url || x.user || ''} (${x.__file || ''})`));
reqOf(D.files, 'file'); reqOf(D.threads, 'thread'); reqOf(D.loginLog, 'loginLog'); reqOf(D.mails, 'mail'); reqOf(D.pages, 'page');
reqOf(D.userExtras, 'ux'); reqOf(D.gxlogs, 'gx'); reqOf(D.mails2026, 'mail26'); reqOf(D.items2026, 'item'); reqOf(D.screensaver, 'screensaver');
reqOf(D.users, 'user');
Object.entries(D.puzzles).forEach(([id, p]) => exprFlags(p.requires, 'puzzle ' + id));
Object.entries(D.boards).forEach(([id, p]) => exprFlags(p.requires, 'board ' + id));
D.dialogues.forEach(d => { exprFlags(d.trigger, 'dialogue ' + d.id); (d.steps || []).forEach(s => {
  if (s.wait) exprFlags(s.wait, 'dialogue wait ' + d.id);
  if (s.needs) {
    exprFlags(s.needs, 'dialogue evidence ' + d.id);
    const sources = { item: D.items2026, file: D.files, mail: D.mails2026 };
    if (!s.source || !sources[s.source.type]?.some(x => x.id === s.source.id)) E('dialogue ' + d.id + ': 缺少可打开的前置资料');
  }
}); });
D.chapters.forEach(c => exprFlags(c.trigger, 'chapter ' + c.id));
Object.entries(D.apps).forEach(([id, a]) => exprFlags(a.requires, 'app ' + id));
Object.entries(D.adminSections).forEach(([id, a]) => exprFlags(a, 'admin ' + id));
Object.entries(D.contacts2026).forEach(([id, a]) => exprFlags(a.requires, 'contact ' + id));
// 还没写完所有章节时，引用别章标记只算 WARNING
const presentCh = new Set(files.map(f => (f.match(/^ch(\d)\.js$/) || [])[1]).filter(Boolean));
const flagChapter = (f) => (f.match(/(?:^|_)c(\d)_/) || [])[1];
used.forEach(({ f, where }) => {
  if (produced.has(f)) return;
  const c = flagChapter(f);
  const foreign = !allChapters && (c === undefined ? /c\d_/.test(f) === false && /^(solved_|board_)/.test(f) : !presentCh.has(c));
  (foreign ? W : E)(`${where}: 条件用到的标记没有任何地方产生：${f}${foreign ? '（属于还没写的章节，暂时忽略）' : ''}`);
});

// ---- 锁 ----
const lockRefs = [];
D.files.forEach(f => f.lock && lockRefs.push([f.lock, 'file ' + f.id]));
D.threads.forEach(f => f.lock && lockRefs.push([f.lock, 'thread ' + f.id]));
D.pages.forEach(f => f.lock && lockRefs.push([f.lock, 'page ' + f.id]));
D.userExtras.forEach(f => f.lock && lockRefs.push([f.lock, 'ux ' + f.id]));
Object.entries(D.apps).forEach(([id, a]) => a.lock && lockRefs.push([a.lock, 'app ' + id]));
if (D.boot.biosLock) lockRefs.push([D.boot.biosLock, 'boot']);
if (D.boot.loginLock) lockRefs.push([D.boot.loginLock, 'boot']);
lockRefs.push(['c1_admin', 'bbs admin']);
lockRefs.forEach(([p, w]) => { if (!D.puzzles[p]) (allChapters ? E : W)(`${w}: lock 引用的谜题不存在：${p}`); });
D.dialogues.forEach(d => (d.steps || []).forEach(s => { if (s.puzzle && !D.puzzles[s.puzzle]) E(`dialogue ${d.id}: puzzle 不存在：${s.puzzle}`); }));

// ---- 谜题 ----
const lockedSet = new Set(lockRefs.map(x => x[0]));
D.dialogues.forEach(d => (d.steps || []).forEach(s => s.puzzle && lockedSet.add(s.puzzle)));
for (const [id, p] of Object.entries(D.puzzles)) {
  const w = `puzzle ${id} (${p.__file})`;
  if (!Array.isArray(p.hints) || p.hints.length !== 3) E(`${w}: hints 必须正好 3 条`);
  const kind = p.kind || 'text';
  if (kind === 'text' && !(p.answers && p.answers.length)) E(`${w}: 缺 answers`);
  if (kind === 'choice' && !(p.options && p.options.includes(p.answer))) E(`${w}: choice 的 answer 必须是 options 之一`);
  if (kind === 'pick' && !(p.answerSet && p.answerSet.every(a => (p.options || []).includes(a)))) E(`${w}: pick 的 answerSet 必须都在 options 里`);
  if (kind === 'multi' && !(p.fields && p.fields.every(f => f.answers && f.answers.length))) E(`${w}: multi 每个 field 都要 answers`);
  if (!['text', 'choice', 'pick', 'multi'].includes(kind)) E(`${w}: 未知 kind ${kind}`);
  if (!p.ask && !lockedSet.has(id)) W(`${w}: 既不是 ask，也没有被任何东西当锁或在对话里引用，玩家无法作答`);
  if (!p.title) W(`${w}: 缺 title`);
}
for (const [id, b] of Object.entries(D.boards)) {
  const w = `board ${id} (${b.__file})`;
  if (!b.text || !b.slots || !b.words) { E(`${w}: 缺 text/slots/words`); continue; }
  const inText = [...b.text.matchAll(/\{([A-Za-z0-9_]+)\}/g)].map(m => m[1]).filter(s => s !== 'player');
  inText.forEach(s => { if (!b.slots[s]) E(`${w}: 文本里的空 {${s}} 没有在 slots 里定义`); });
  Object.entries(b.slots).forEach(([s, v]) => {
    if (!inText.includes(s)) E(`${w}: slots.${s} 没出现在文本里`);
    [].concat(v).forEach(wid => { if (!b.words[wid]) E(`${w}: slots.${s} 引用的词不存在：${wid}`); });
  });
  if (!Array.isArray(b.hints) || b.hints.length !== 3) W(`${w}: hints 建议正好 3 条`);
}

// ---- BBS ----
const userIds = new Set(D.users.map(u => u.id));
const boardIds = new Set(D.boardsBBS.map(b => b.id));
const ranges = { 'ch1.js': [1001, 1399], 'ch2.js': [1400, 1599], 'ch3.js': [1600, 1699], 'ch4.js': [1700, 1799], 'ch5.js': [1800, 1899], 'ch6.js': [1800, 1899] };
D.threads.forEach(t => {
  const w = `thread ${t.id} (${t.__file})`;
  if (typeof t.id !== 'number') E(`${w}: id 必须是数字`);
  const r = ranges[t.__file];
  if (r && (t.id < r[0] || t.id > r[1])) E(`${w}: 帖子号不在本章号段 ${r[0]}-${r[1]}`);
  if (!boardIds.has(t.board)) E(`${w}: 板块不存在 ${t.board}`);
  if (!userIds.has(t.author)) E(`${w}: 作者不存在 ${t.author}`);
  (t.posts || []).forEach((p, i) => { if (!userIds.has(p.author)) E(`${w}: 第 ${i + 1} 楼作者不存在 ${p.author}`); });
  if (!(t.posts && t.posts.length)) E(`${w}: 没有 posts`);
});
D.loginLog.forEach(l => { if (!userIds.has(l.user)) E(`loginLog: 用户不存在 ${l.user}`); });
D.mails.forEach(m => { if (!userIds.has(m.from)) E(`mail ${m.id}: 发信人不存在 ${m.from}`); if (!userIds.has(m.to)) E(`mail ${m.id}: 收信人不存在 ${m.to}`); });
D.userExtras.forEach(m => { if (!userIds.has(m.user)) E(`ux ${m.id}: 用户不存在 ${m.user}`); });
const gxContacts = new Set(D.contacts.map(c => c.id));
D.gxlogs.forEach(l => { if (!gxContacts.has(l.contact)) E(`gx ${l.id}: 联系人不存在 ${l.contact}`); (l.lines || []).forEach(x => { if (!['me', 'them'].includes(x.who)) E(`gx ${l.id}: who 必须是 me/them`); }); });
D.dialogues.forEach(d => { if (!D.contacts2026[d.contact]) E(`dialogue ${d.id}: 联系人不存在 ${d.contact}`); if (!d.trigger) W(`dialogue ${d.id}: 没有 trigger，会在游戏一开始就播放`); });

// ---- 文件 ----
const paths = {};
D.files.forEach(f => {
  if (!f.path) { E(`file ${f.id}: 缺 path`); return; }
  if (!/^(A:|C:)(\/|$)/.test(f.path)) E(`file ${f.id}: 路径必须以 A: 或 C:/ 开头：${f.path}`);
  if (paths[f.path] && !f.deleted && !paths[f.path].deleted && !(f.requires || paths[f.path].requires)) W(`文件路径重复：${f.path}`);
  paths[f.path] = f;
  if (!f.type) E(`file ${f.id}: 缺 type`);
  if (f.type === 'audio' && !(f.tape && f.tape.speeds)) E(`file ${f.id}: audio 缺 tape.speeds`);
  if (f.type === 'zip' && !f.zip) E(`file ${f.id}: zip 缺 zip 字段`);
});

// ---- 何蔓不能写"再" ----
D.dialogues.filter(d => d.contact === 'heman').forEach(d => (d.steps || []).forEach(s => {
  const texts = [s.npc].concat(s.choice ? s.choice.flatMap(c => c.reply || []) : []).filter(Boolean);
  texts.forEach(t => { if (t.includes('再')) E(`dialogue ${d.id}: 何蔓的台词出现了"再"字：${t}`); });
}));
D.threads.forEach(t => (t.posts || []).forEach(p => { if (p.author === 'qingman' && p.html.includes('再')) E(`thread ${t.id}: 青蔓的发帖出现了"再"字`); if (p.author === 'jia' && /以经|在也|在见/.test(p.html)) E(`thread ${t.id}: 许嘉不能有同音错字`); }));
D.gxlogs.filter(l => l.contact === 'qingman').forEach(l => l.lines.forEach(x => { if (x.who === 'them' && x.text.includes('再')) E(`gx ${l.id}: 青蔓的聊天出现了"再"字`); }));
D.gxlogs.forEach(l => l.lines.forEach(x => { if (x.who === 'me' && /以经|在也|在见/.test(x.text)) E(`gx ${l.id}: 许嘉不能有同音错字：${x.text}`); }));

// ---- 收集品 ----
const cols = Object.keys(D.collectibles);
if (files.length >= 8 && cols.length !== 12) W(`收集品数量是 ${cols.length}，应为 12`);
const colGiven = new Set(actions.filter(x => x.a.collect).map(x => x.a.collect));
cols.forEach(c => { if (!colGiven.has(c)) E(`收集品 ${c} 没有任何动作会给出`); });

// ---- 输出 ----
const stat = `文件 ${D.files.length}，帖子 ${D.threads.length}，鸽讯记录 ${D.gxlogs.length}，站内信 ${D.mails.length}，谜题 ${Object.keys(D.puzzles).length}，推理板 ${Object.keys(D.boards).length}，对话 ${D.dialogues.length}，收集品 ${cols.length}`;
console.log('已加载：' + files.join(', '));
console.log(stat);
warnings.forEach(w => console.log('WARNING ' + w));
errors.forEach(e => console.log('ERROR   ' + e));
console.log(errors.length ? `\n${errors.length} 个 ERROR，${warnings.length} 个 WARNING` : `\n通过（${warnings.length} 个 WARNING）`);
process.exit(errors.length ? 1 : 0);
