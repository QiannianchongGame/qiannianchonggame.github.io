// 导出界面词表：node tools/i18n-ui-keys.js → src/i18n/ui-keys.json（engine.js 里所有 _t('…') 的原文）
const fs = require('fs');
const path = require('path');
const src = fs.readFileSync(path.join(__dirname, '..', 'src', 'engine.js'), 'utf8');
const keys = new Set();
const re = /\b_t\('((?:[^'\\]|\\.)*)'\)/g;
let m;
while ((m = re.exec(src))) keys.add(new Function("return '" + m[1] + "'")());
fs.writeFileSync(path.join(__dirname, '..', 'src', 'i18n', 'ui-keys.json'), JSON.stringify([...keys], null, 1));
console.log('界面词条', keys.size);
