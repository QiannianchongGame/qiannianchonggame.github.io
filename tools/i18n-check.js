// 检查译文：node tools/i18n-check.js <en|ja> [章...]   （不写章就检查全部）
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const root = path.join(__dirname, '..');
const [lang, ...chs] = process.argv.slice(2);
if (!lang) { console.log('用法：node tools/i18n-check.js <en|ja> [base ch0 ch1 ...]'); process.exit(1); }
const all = ['base', 'ch0', 'ch1', 'ch2', 'ch3', 'ch4', 'ch5', 'ch6', 'story'];
const list = chs.length ? chs : all;
const load = (file) => {
  let data = null;
  vm.runInNewContext(fs.readFileSync(file, 'utf8'), { Y2K: { lang: (l, o) => { data = o; } } }, { filename: file });
  return data;
};
let errors = 0, warnings = 0;
const E = (m) => { errors++; console.log('ERROR   ' + m); };
const W = (m) => { warnings++; console.log('WARNING ' + m); };
const tags = (s) => (String(s).match(/<\/?[a-zA-Z][a-zA-Z0-9]*/g) || []).map(t => t.toLowerCase()).sort().join(',');
const holes = (s) => (String(s).match(/\{[A-Za-z0-9_]+\}/g) || []).sort().join(',');
const CJK = /[一-鿿]/;
for (const ch of list) {
  const src = path.join(root, 'src', 'i18n', 'zh', ch + '.js');
  const dst = path.join(root, 'src', 'i18n', lang, ch + '.js');
  if (!fs.existsSync(src)) { E(`${ch}: 没有原文对照表，先运行 node tools/i18n-extract.js`); continue; }
  if (!fs.existsSync(dst)) { E(`${ch}: 译文文件不存在：${dst}`); continue; }
  let zh, tr;
  try { zh = load(src); } catch (e) { E(`${ch}: 原文加载失败 ${e.message}`); continue; }
  try { tr = load(dst); } catch (e) { E(`${ch}: 译文不是合法 JS：${e.message}`); continue; }
  if (!tr) { E(`${ch}: 译文没有调用 Y2K.lang`); continue; }
  let missing = 0, untranslated = 0;
  for (const [k, v] of Object.entries(zh)) {
    if (!(k in tr)) { missing++; if (missing <= 15) E(`${ch}: 缺少键 ${k}`); continue; }
    const t = tr[k];
    if (typeof v === 'string') {
      if (typeof t !== 'string') { E(`${ch}: ${k} 应该是字符串`); continue; }
      if (holes(v) !== holes(t)) E(`${ch}: ${k} 的占位符不一致：原文 [${holes(v)}] 译文 [${holes(t)}]`);
      if (tags(v) !== tags(t)) W(`${ch}: ${k} 的 HTML 标签和原文不一致`);
      if (!k.startsWith('seg|') && t === v && lang !== 'ja') { untranslated++; if (untranslated <= 10) W(`${ch}: ${k} 和原文完全相同（没翻译？）`); }
      if (!t.trim()) E(`${ch}: ${k} 是空的`);
    } else if (typeof t !== 'object' || !t) E(`${ch}: ${k} 应该是对象`);
  }
  if (missing > 15) E(`${ch}: 共缺少 ${missing} 个键`);
  for (const [k, t] of Object.entries(tr)) {
    if (k in zh) continue;
    if (/^puzzle\.[^.]+\.answers\+$/.test(k) || /^puzzle\.[^.]+\.fields\.\d+\.answers\+$/.test(k)) { if (!Array.isArray(t) || !t.every(x => typeof x === 'string')) E(`${ch}: ${k} 必须是字符串数组`); continue; }
    if (/^puzzle\.[^.]+\.near\+$/.test(k)) { if (typeof t !== 'object' || Array.isArray(t)) E(`${ch}: ${k} 必须是对象`); continue; }
    E(`${ch}: 多出了原文里没有的键 ${k}`);
  }
  // 〔〕标记数量提示：原文里有"在见/在说/在也/以经"等的地方
  const typoKeys = Object.entries(zh).filter(([k, v]) => typeof v === 'string' && /在见|在说|在也|在来|在想|以经|不会在|在给|在跟|在装|没人在|在问|在找/.test(v)).map(([k]) => k);
  typoKeys.forEach(k => { if (tr[k] && typeof tr[k] === 'string' && !tr[k].includes('〔')) W(`${ch}: ${k} 原文可能有关键错字（在/再、以经），译文里没有〔〕原文标记，请确认`); });
  console.log(`${ch}: 原文 ${Object.keys(zh).length} 键，译文 ${Object.keys(tr).length} 键`);
}
console.log(errors ? `\n${errors} 个 ERROR，${warnings} 个 WARNING` : `\n通过（${warnings} 个 WARNING）`);
process.exit(errors ? 1 : 0);
