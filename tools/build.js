// 打包：node tools/build.js [额外内容文件...]
// 把样式、引擎和全部内容文件合成一个可以双击打开的 千年虫.html
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const read = (p) => fs.readFileSync(path.isAbsolute(p) ? p : path.join(root, p), 'utf8').replace(/\r\n?/g, '\n');

const order = ['base.js', 'ch0.js', 'ch1.js', 'ch2.js', 'ch3.js', 'ch4.js', 'ch5.js', 'ch6.js', 'story.js'];
const dir = path.join(root, 'src', 'content');
const args = process.argv.slice(2);
const debugBuild = args.includes('--debug');
const files = order.filter(f => fs.existsSync(path.join(dir, f))).map(f => 'src/content/' + f).concat(args.filter(a => !a.startsWith('--')));
const safe = (s) => s.replace(/<\/script/gi, '<\\/script');

const css = read('src/style.css');
// 正式包不暴露调试入口；node tools/build.js --debug 才保留 Y2K.debug
let engine = read('src/engine.js');
if (!debugBuild) {
  if (!engine.includes('return { add, boot, lang, debug };')) throw new Error('找不到引擎的导出语句');
  engine = engine.replace('return { add, boot, lang, debug };', 'return { add, boot, lang };');
}
const wrap = (f) => `<script>/* ${f} */\ntry {\n${safe(read(f))}\n} catch (e) { console.error('加载失败：${f}', e); }\n</script>`;
const contents = files.map(wrap).join('\n');
// 译文：界面词表放在引擎前面（引擎初始化时就要用），内容译文放在内容后面
const uiFile = 'src/i18n/ui.js';
const ui = fs.existsSync(path.join(root, uiFile)) ? wrap(uiFile) : '';
// 只打包译完的语言：每个内容文件都有译文，且覆盖了原文对照表里的全部键，界面词表也有这门语言。
// 译到一半的语言不出现在标题画面上，避免玩家玩到中英混杂的版本。
const vm = require('vm');
const loadMap = (p) => { let m = null; try { vm.runInNewContext(read(p), { Y2K: { lang: (l, o) => { m = o; } } }); } catch (e) { m = null; } return m; };
const uiBundle = (() => { if (!ui) return {}; const box = {}; try { vm.runInNewContext(read(uiFile), { window: box }); } catch (e) { return {}; } return box; })();
const uiMaps = uiBundle.Y2K_UI || {}, uiReviewed = uiBundle.Y2K_UI_REVIEWED || [];
const uiKeys = [...new Set([...engine.matchAll(/\b_t\('((?:[^'\\]|\\.)*)'\)/g)].map(m => new Function("return '" + m[1] + "'")()))];
const readyLangs = ['zh'], langFiles = [], skipped = [];
for (const l of ['en', 'ja']) {
  const files = [], missing = [];
  for (const f of order) {
    const zhPath = `src/i18n/zh/${f}`, trPath = `src/i18n/${l}/${f}`;
    if (!fs.existsSync(path.join(root, zhPath))) continue;
    const zh = loadMap(zhPath), tr = fs.existsSync(path.join(root, trPath)) ? loadMap(trPath) : null;
    const lack = zh ? Object.keys(zh).filter(k => !tr || !(k in tr)).length : 0;
    if (!tr || lack) missing.push(`${f}${tr ? `（缺 ${lack} 条）` : '（无译文）'}`); else files.push(trPath);
  }
  const uiMap = uiMaps[l];
  if (!uiMap) missing.push('界面词表');
  else {
    const lack = uiKeys.filter(k => typeof uiMap[k] !== 'string' || !uiMap[k].trim()).length;
    if (lack) missing.push(`界面词表（缺 ${lack} 条）`);
    else if (!uiReviewed.includes(l)) missing.push('界面译文尚未校对完成');
  }
  if (missing.length) skipped.push(`${l}：${missing.join('、')}`); else { readyLangs.push(l); langFiles.push(...files); }
}
const langScript = `<script>window.Y2K_LANGS=${JSON.stringify(readyLangs)};</script>`;
const translations = langFiles.map(wrap).join('\n');
// 图片嵌入 HTML，使双击打开的离线版与网页使用完全相同的资源。
const photoManifest = JSON.parse(read('src/photo-manifest.json'));
const photoAssets = {};
for (const [id, photo] of Object.entries(photoManifest)) {
  const binary = fs.readFileSync(path.join(root, photo.file));
  photoAssets[id] = { data: 'data:image/webp;base64,' + binary.toString('base64'), overlay: photo.overlay, targets: photo.targets };
}
const photos = `<script>window.Y2K_PHOTOS=${safe(JSON.stringify(photoAssets))};</script>`;

const html = `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="description" content="《千年虫》：在旧电脑、校园 BBS 和手机消息之间寻找线索的悬疑解谜游戏。">
<title>千年虫</title>
<style>
${css}
</style>
</head>
<body>
<noscript>这个游戏需要启用 JavaScript。This game needs JavaScript. このゲームには JavaScript が必要です。</noscript>
${photos}
${langScript}
${ui}
<script>
${safe(engine)}
</script>
${contents}
${translations}
<script>Y2K.boot();</script>
</body>
</html>
`;
const out = path.join(root, '千年虫.html');
fs.writeFileSync(out, html);
// 网页版与单文件离线版始终由同一份源码生成。
fs.writeFileSync(path.join(root, 'index.html'), html);
console.log(`已生成${debugBuild ? '（调试版）' : ''} ${out}（${(Buffer.byteLength(html) / 1024).toFixed(0)} KB，内容文件 ${files.length} 个，译文文件 ${langFiles.length} 个${ui ? '，含界面词表' : ''}，可选语言 ${readyLangs.join('/')}）${skipped.length ? '\n未完成、未打包的译文：' + skipped.join('；') : ''}`);
