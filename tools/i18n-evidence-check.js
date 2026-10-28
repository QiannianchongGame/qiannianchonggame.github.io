// 核对译文中不能改变的证据数字、机器名、文件扩展名与谜题原文。
'use strict';
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm'), assert = require('node:assert/strict');
const root = path.join(__dirname, '..'), chapters = ['base', 'ch0', 'ch1', 'ch2', 'ch3', 'ch4', 'ch5', 'ch6', 'story'];
function load(lang, chapter) {
  let map; vm.runInNewContext(fs.readFileSync(path.join(root, 'src/i18n', lang, chapter + '.js'), 'utf8'), { Y2K: { lang: (_, value) => { map = value; } } });
  return map;
}
function visible(s) { return s.replace(/<[^>]*>/g, ' '); }
function numericCells(s) { return [...s.matchAll(/<(?:td|th)\b[^>]*>([^<>]*)<\/(?:td|th)>/g)].map(m => m[1].trim()).filter(t => /^\d[\d\s.:/—–~+-]*$/.test(t)); }
function containsToken(text, token, key) {
  if (text.toLowerCase().includes(token.toLowerCase())) return true;
  const clock = token.match(/^(\d{1,2}):(\d{2})$/);
  if (clock && text.includes(`${Number(clock[1])}時${Number(clock[2])}分`)) return true;
  // This source explicitly says 7:40 in the evening; the reviewed translations use 24-hour time.
  return key === 'note.c1_n_official.text' && token === '7:40' && text.includes('19:40');
}
const bad = [];
for (const lang of ['en', 'ja']) {
  let count = 0;
  for (const chapter of chapters) {
    const original = load('zh', chapter), translated = load(lang, chapter);
    for (const [key, val] of Object.entries(original)) {
      const text = translated[key];
      if (typeof val !== 'string' || typeof text !== 'string') continue;
      count++;
      const a = visible(val), b = visible(text);
      const tokens = [...a.matchAll(/\b(?:\d{1,3}(?:\.\d{1,3}){3}|(?:19|20)\d{2}(?:[-./]\d{1,2}){2}|\d{1,2}:\d{2}(?::\d{2})?|JF-\d{2}|JYS-486|TSG-01|XZS-01|SSJQ|SSSG|SGKG|SMGK|SCFY|GHI)\b/g)].map(m => m[0]);
      for (const token of new Set(tokens)) if (!containsToken(b, token, key)) bad.push(`${lang} ${key}: missing ${token}`);
      const cells = numericCells(val), translatedCells = numericCells(text);
      if (cells.length && JSON.stringify(cells) !== JSON.stringify(translatedCells)) bad.push(`${lang} ${key}: numeric table cells changed`);
      if (key.startsWith('seg|')) {
        const ext = key.slice(4).match(/\.[A-Za-z0-9]+$/)?.[0];
        if (ext && !text.endsWith(ext)) bad.push(`${lang} ${key}: extension changed`);
      }
    }
    // Numbered Chinese poem bodies must retain each original line in order.
    for (const key of ['thread.1069.posts.0.html', 'thread.1168.posts.0.html', 'file.c3_card_yf.html']) {
      if (!original[key]) continue;
      const lines = original[key].replace(/<br\s*\/?\s*>/g, '\n').replace(/<[^>]*>/g, '\n').split('\n').map(x => x.trim()).filter(Boolean);
      const sourceLines = key.includes('card_yf') ? lines.slice(lines.indexOf('千禧年的第一场雪'), lines.indexOf('千禧年的第一场雪') + 12) : lines.slice(1);
      assert.equal(sourceLines.length, key.includes('card_yf') ? 12 : key.includes('1069') ? 4 : 8, key + ': source lines');
      let position = -1;
      for (const line of sourceLines) {
        const next = translated[key].indexOf(line, position + 1);
        if (next < 0) bad.push(`${lang} ${key}: Chinese puzzle line changed: ${line}`);
        position = next;
      }
    }
  }
  console.log(`${lang}: checked ${count} text fields for evidence tokens and extensions`);
}
assert.deepEqual(bad, [], '译文不得改变证据');
console.log('通过：证据数字、表格、机器编码、文件扩展名与中文取字原文。');
