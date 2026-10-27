// 抽取所有需要翻译的文字：node tools/i18n-extract.js
// 每个内容文件生成一份 src/i18n/zh/<文件名>.js，格式和译文文件相同：
//   Y2K.lang('zh', { "键": "中文原文", ... });
// 键的写法见 docs/i18n.md。引擎（src/engine.js 的 applyLang）按同样的规则把译文写回数据。
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const root = path.join(__dirname, '..');
const dir = path.join(root, 'src', 'content');
const outDir = path.join(root, 'src', 'i18n', 'zh');
const order = ['base', 'ch0', 'ch1', 'ch2', 'ch3', 'ch4', 'ch5', 'ch6', 'story'];

const TEXT_KEYS = new Set(['num', 'name', 'intro', 'sub', 'avatar', 'desc', 'nick', 'title', 'sig', 'gender', 'text', 'html', 'caption', 'comment',
  'label', 'prompt', 'placeholder', 'solvedText', 'wrongText', 'npc', 'me', 'sys', 'subject', 'body', 'source', 'toast', 'where', 'homeNotice', 'homeSource', 'group']);
const LIST_KEYS = new Set(['hints', 'reply', 'options', 'entries']);
const MAP_KEYS = new Set(['words', 'speeds']);
const SKIP = new Set(['id', 'answers', 'answer', 'answerSet', 'near', 'slots', 'requires', 'trigger', 'set', 'unset', 'collect', 'mail', 'ending', 'note', 'clock',
  'wait', 'puzzle', 'delay', 'lock', 'path', 'date', 'ip', 'host', 'url', 'user', 'author', 'to', 'contact', 'board', 'app', 'extractTo', 'kind', 'type', 'time',
  'who', 'mod', 'reg', 'lastLogin', 'deletedAt', 'created', 'size', 'number', 'views']);
const CJK = /[　-鿿＀-￯]/;

function walk(obj, base, out, inList) {
  if (Array.isArray(obj)) { obj.forEach((v, i) => visit(String(i), v, base, out, inList)); return; }
  for (const [k, v] of Object.entries(obj)) visit(k, v, base, out, false);
}
function visit(k, v, base, out, textByContainer) {
  if (SKIP.has(k) && !textByContainer) return;
  const key = base + '.' + k;
  if (typeof v === 'string') { if ((textByContainer || TEXT_KEYS.has(k)) && CJK.test(v)) out[key] = v; return; }
  if (!v || typeof v !== 'object') return;
  if (k === 'props') { if (CJK.test(JSON.stringify(v))) out[key] = v; return; }
  if (LIST_KEYS.has(k) || MAP_KEYS.has(k)) { for (const [kk, vv] of Object.entries(v)) if (typeof vv === 'string' && CJK.test(vv)) out[key + '.' + kk] = vv; return; }
  walk(v, key, out, false);
}

// 和引擎里 applyLang 一一对应：每类实体的键前缀
function extract(o, out, saverBase) {
  const each = (arr, kind, idKey = 'id') => (arr || []).forEach(x => walk(x, `${kind}.${x[idKey]}`, out));
  const eachObj = (obj, kind) => Object.entries(obj || {}).forEach(([id, x]) => walk(x, `${kind}.${id}`, out));
  each(o.chapters, 'chapter');
  eachObj(o.apps, 'app');
  eachObj(o.contacts2026, 'contact');
  each(o.files, 'file');
  each(o.dialogues, 'dlg');
  each(o.mails2026, 'mail26');
  each(o.items2026, 'item');
  each(o.userExtras, 'ux');
  eachObj(o.puzzles, 'puzzle');
  eachObj(o.boards, 'board');
  eachObj(o.notes, 'note');
  eachObj(o.collectibles, 'col');
  eachObj(o.endings, 'ending');
  (o.screensaver || []).forEach((x, i) => walk(x, `saver.${saverBase + i}`, out));
  if (o.mails2026) o.mails2026.forEach(m => { if (CJK.test(m.from || '')) out[`mail26.${m.id}.from`] = m.from; });
  if (o.bbs) {
    for (const k of ['name', 'homeNotice', 'homeSource']) if (o.bbs[k] && CJK.test(o.bbs[k])) out['bbs.' + k] = o.bbs[k];
    each(o.bbs.boards, 'bboard'); each(o.bbs.users, 'user'); each(o.bbs.threads, 'thread'); each(o.bbs.mails, 'bmail'); each(o.bbs.pages, 'page');
  }
  if (o.gexun) {
    if (o.gexun.account) walk(o.gexun.account, 'gxacc.me', out);
    each(o.gexun.contacts, 'gxc'); each(o.gexun.logs, 'gx');
  }
  // 路径里的中文段（文件夹名、文件名），只影响显示
  const segs = new Set();
  const addPath = (p) => String(p || '').split('/').forEach(s => { if (CJK.test(s)) segs.add(s); });
  (o.files || []).forEach(f => { addPath(f.path); if (f.zip) { addPath(f.zip.extractTo); (f.zip.entries || []).forEach(addPath); } });
  Object.values(o.apps || {}).forEach(a => addPath(a.path));
  [...segs].sort().forEach(s => { out['seg|' + s] = s; });
}

fs.mkdirSync(outDir, { recursive: true });
let saverBase = 0;
const report = [];
for (const name of order) {
  const p = path.join(dir, name + '.js');
  if (!fs.existsSync(p)) continue;
  const chunks = [];
  vm.runInNewContext(fs.readFileSync(p, 'utf8'), { Y2K: { add: (o) => chunks.push(o) } }, { filename: name });
  const out = {};
  chunks.forEach(o => { extract(o, out, saverBase); saverBase += (o.screensaver || []).length; });
  const body = Object.entries(out).map(([k, v]) => `  ${JSON.stringify(k)}: ${JSON.stringify(v)},`).join('\n');
  fs.writeFileSync(path.join(outDir, name + '.js'), `// 自动生成（node tools/i18n-extract.js），中文原文，供翻译对照。不要手改。\nY2K.lang('zh', {\n${body}\n});\n`);
  const chars = Object.values(out).reduce((n, v) => n + (typeof v === 'string' ? v : JSON.stringify(v)).length, 0);
  report.push(`${name}: ${Object.keys(out).length} 条，${chars} 字符`);
}
console.log(report.join('\n'));
