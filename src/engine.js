'use strict';
// 《千年虫》引擎：数据合并、标记与条件、动作、存档、2026 手机、Win98 桌面与各个应用。
const Y2K = (() => {
  // ============================================================
  // 语言：界面文字走 _t()（词表在 window.Y2K_UI），内容译文用 Y2K.lang() 注册、启动时按键写回数据
  // ============================================================
  const LANGS = { zh: '中文', en: 'English', ja: '日本語' };
  let LANG = 'zh';
  try { LANG = JSON.parse(localStorage.getItem('y2k_meta') || '{}').lang || 'zh'; } catch (e) { }
  // 只有打包进来、译完的语言才可选（tools/build.js 写入 Y2K_LANGS）
  const READY = (typeof window !== 'undefined' && Array.isArray(window.Y2K_LANGS) && window.Y2K_LANGS.length) ? window.Y2K_LANGS : ['zh'];
  if (!LANGS[LANG] || !READY.includes(LANG)) LANG = 'zh';
  const UI = (typeof window !== 'undefined' && window.Y2K_UI) || {};
  function _t(s) { const d = UI[LANG]; return d && d[s] != null ? d[s] : s; }
  const LANGMAP = {};
  function lang(code, map) { LANGMAP[code] = Object.assign(LANGMAP[code] || {}, map); }
  const SEG = {};   // 路径段（文件夹名、文件名）的显示译名

  // ============================================================
  // 数据
  // ============================================================
  const D = {
    chapters: [], apps: {}, contacts2026: {}, boot: {}, files: [], threads: [], loginLog: [], mails: [], pages: [],
    users: [], bbsBoards: [], adminSections: {}, bbsMeta: {}, userExtras: [], gxAccount: {}, gxContacts: [], gxLogs: [],
    puzzles: {}, boards: {}, dialogues: [], mails2026: [], items2026: [], notes: {}, collectibles: {}, endings: {}, screensaver: [], journal: {}, readings: [],
  };
  function add(o) {
    const push = (k, arr) => { if (arr) D[k].push(...arr); };
    push('chapters', o.chapters); push('files', o.files); push('dialogues', o.dialogues); push('mails2026', o.mails2026);
    push('items2026', o.items2026); push('screensaver', o.screensaver); push('userExtras', o.userExtras);
    push('readings', o.readings); Object.assign(D.journal, o.journal || {});
    Object.assign(D.apps, o.apps || {}); Object.assign(D.contacts2026, o.contacts2026 || {}); Object.assign(D.boot, o.boot || {});
    for (const k of ['puzzles', 'boards', 'notes', 'collectibles', 'endings']) Object.assign(D[k], o[k] || {});
    if (o.bbs) {
      const b = o.bbs;
      push('threads', b.threads); push('loginLog', b.loginLog); push('mails', b.mails); push('pages', b.pages);
      push('users', b.users); push('bbsBoards', b.boards); Object.assign(D.adminSections, b.adminSections || {});
      for (const k of ['name', 'host', 'homeNotice', 'homeSource']) if (b[k]) D.bbsMeta[k] = b[k];
    }
    if (o.gexun) {
      if (o.gexun.account) D.gxAccount = o.gexun.account;
      push('gxContacts', o.gexun.contacts); push('gxLogs', o.gexun.logs);
    }
  }
  // 选择题/多选题按选项位置判定，所以要在译文覆盖选项文字之前记下正确答案的位置
  function prepAnswers() {
    for (const p of Object.values(D.puzzles)) {
      if (p.kind === 'choice') p._ai = (p.options || []).indexOf(p.answer);
      if (p.kind === 'pick') p._as = (p.answerSet || []).map(a => (p.options || []).indexOf(a));
    }
  }
  // 把译文按键写回数据。键的规则和 tools/i18n-extract.js 一一对应：
  //   <类别>.<id>.<路径…>；路径末尾带 + 表示追加（answers+、near+）；seg|<名字> 是路径段显示名；bbs.<字段> 是 BBS 站点信息
  function translationTarget(obj, parts, append) {
    if (!obj || typeof obj !== 'object') return null;
    // 字典键本身可能含小数点（如 speeds['1.5']），优先匹配完整的现有键。
    for (let n = parts.length; n > 0; n--) {
      const key = parts.slice(0, n).join('.');
      if (!Object.prototype.hasOwnProperty.call(obj, key)) continue;
      if (n === parts.length) return { obj, key };
      const target = translationTarget(obj[key], parts.slice(n), append);
      if (target) return target;
    }
    // answers+ / near+ 可以在已存在的父对象中新增末级字段。
    return append && parts.length === 1 ? { obj, key: parts[0] } : null;
  }
  function applyLang(map) {
    if (!map) return;
    const byId = (arr) => { const o = {}; arr.forEach(x => { o[x.id] = x; }); return o; };
    const roots = {
      chapter: byId(D.chapters), app: D.apps, contact: D.contacts2026, file: byId(D.files), dlg: byId(D.dialogues),
      mail26: byId(D.mails2026), item: byId(D.items2026), reading: byId(D.readings), journal: D.journal, ux: byId(D.userExtras), puzzle: D.puzzles, board: D.boards,
      note: D.notes, col: D.collectibles, ending: D.endings, saver: D.screensaver, bboard: byId(D.bbsBoards), user: byId(D.users),
      thread: byId(D.threads), bmail: byId(D.mails), page: byId(D.pages), gxc: byId(D.gxContacts), gx: byId(D.gxLogs), gxacc: { me: D.gxAccount },
    };
    for (const [key, val] of Object.entries(map)) {
      if (key.startsWith('seg|')) { SEG[key.slice(4)] = val; continue; }
      if (key.startsWith('bbs.')) { D.bbsMeta[key.slice(4)] = val; continue; }
      const append = key.endsWith('+');
      const parts = (append ? key.slice(0, -1) : key).split('.');
      const root = roots[parts[0]];
      const target = translationTarget(root && root[parts[1]], parts.slice(2), append);
      if (!target) continue;
      const { obj, key: last } = target;
      // 未完成译文中的占位符不应覆盖原照片，保留可读的中文原件。
      if (typeof val === 'string' && /^__SVG_[A-Z0-9_]+__$/.test(val) && typeof obj[last] === 'string' && obj[last].includes('<svg')) continue;
      if (append) {
        if (Array.isArray(val)) obj[last] = (obj[last] || []).concat(val);
        else if (val && typeof val === 'object') obj[last] = Object.assign({}, obj[last] || {}, val);
      } else obj[last] = val;
    }
  }
  let DLG = {}, USER = {}, THREAD = {}, MAIL26 = {}, ITEM = {};
  function index() {
    DLG = {}; D.dialogues.forEach(d => DLG[d.id] = d);
    USER = {}; D.users.forEach(u => USER[u.id] = u);
    THREAD = {}; D.threads.forEach(t => THREAD[t.id] = t);
    MAIL26 = {}; D.mails2026.forEach(m => MAIL26[m.id] = m);
    ITEM = {}; D.items2026.forEach(m => ITEM[m.id] = m);
    D.threads.sort((a, b) => a.id - b.id);
  }

  // 将原图替换为写实照片。原 SVG 的证据文字作为独立图层保留，
  // 防止生成图中的日期、编号或笔迹失真，影响玩家推理。
  function applyPhotos() {
    const photos = window.Y2K_PHOTOS || {};
    const svgNS = 'http://www.w3.org/2000/svg';
    const overlayHTML = {
      group: '<rect x="260" y="25" width="140" height="55" rx="2" fill="#101010" stroke="#555" stroke-width="2"/>',
      ice: '<rect x="499" y="82" width="60" height="27" rx="1" fill="#6b4d30" stroke="#49351f" stroke-width="1"/><rect x="597" y="96" width="24" height="12" rx="1" fill="#a21c1c"/>',
    };
    for (const [name, photo] of Object.entries(photos)) {
      for (const target of photo.targets) {
        const entity = (D[target.collection] || []).find(x => x.id === target.id);
        if (!entity || !entity.html) continue;
        const box = document.createElement('div'); box.innerHTML = entity.html;
        const svg = box.querySelector('svg'); if (!svg) continue;
        const vb = svg.viewBox.baseVal;
        const width = vb.width || 640, height = vb.height || 420;
        const texts = [...svg.querySelectorAll('text')];
        if (photo.overlay === 'portrait') {
          texts.filter(node => /[（(]照片[）)]|[（(]photo[）)]|[（(]写真[）)]/i.test(node.textContent)).forEach(node => node.remove());
          const portrait = document.createElementNS(svgNS, 'image');
          portrait.setAttribute('x', '470'); portrait.setAttribute('y', '120'); portrait.setAttribute('width', '110'); portrait.setAttribute('height', '140');
          portrait.setAttribute('preserveAspectRatio', 'xMidYMid slice'); portrait.setAttribute('href', photo.data);
          svg.append(portrait); svg.setAttribute('data-photo', name); entity.html = box.innerHTML; continue;
        }
        if (photo.overlay === 'group') {
          // 与真实合影中的站位一一对应：前排六人，后排七人，右侧主持老师。
          const positions = { 1:[64,78], 2:[153,169], 3:[248,169], 4:[339,165], 5:[405,176], 6:[495,185], 7:[159,78], 8:[298,90], 9:[228,94], 10:[66,177], 11:[383,84], 12:[455,95], 13:[526,78], 14:[582,110] };
          texts.forEach(node => {
            const value = node.textContent.trim();
            if (positions[value]) { node.setAttribute('x', positions[value][0]); node.setAttribute('y', positions[value][1]); }
            else if (value === '距 2000 年') { node.setAttribute('x', '330'); node.setAttribute('y', '44'); node.setAttribute('font-size', '11'); }
            else if (value === '00:01:47') { node.setAttribute('x', '330'); node.setAttribute('y', '69'); node.setAttribute('font-size', '23'); }
          });
        }
        if (photo.overlay === 'ice' && texts.length >= 4) {
          [[529,94,9], [529,105,9], [609,105,8]].forEach(([x, y, size], i) => { texts[i].setAttribute('x', x); texts[i].setAttribute('y', y); texts[i].setAttribute('font-size', size); });
        }
        if (name === 'key_half' && texts.length) {
          texts[0].setAttribute('fill', '#46566c'); texts[texts.length - 1].setAttribute('fill', '#46566c');
        }
        if (photo.overlay === 'date') texts.slice(0, -1).forEach(node => node.remove());
        if (name === 'photo_back') texts.filter(node => node.textContent.includes('梧城彩扩')).forEach(node => node.remove());
        svg.querySelectorAll('defs, rect, path, circle, ellipse, line, polygon, polyline, image').forEach(node => node.remove());
        const raster = document.createElementNS(svgNS, 'image');
        raster.setAttribute('x', '0'); raster.setAttribute('y', '0');
        raster.setAttribute('width', width); raster.setAttribute('height', height);
        raster.setAttribute('preserveAspectRatio', 'xMidYMid slice'); raster.setAttribute('href', photo.data);
        svg.insertBefore(raster, svg.firstChild);
        if (overlayHTML[photo.overlay]) {
          const layer = document.createElementNS(svgNS, 'g'); layer.innerHTML = overlayHTML[photo.overlay];
          raster.after(layer);
        }
        if (name === 'photo_back') {
          const stains = document.createElementNS(svgNS, 'g');
          stains.innerHTML = '<ellipse cx="112" cy="180" rx="48" ry="16" fill="#bfa877" opacity=".3"/><path d="M76 182 q10 -8 20 0 t20 0 t20 0" stroke="#6c7bb0" stroke-width="4" fill="none" opacity=".35"/><ellipse cx="325" cy="288" rx="34" ry="14" fill="#bfa877" opacity=".3"/><path d="M303 290 q9 -7 18 0 t18 0" stroke="#6c7bb0" stroke-width="4" fill="none" opacity=".35"/>';
          svg.append(stains);
        }
        svg.setAttribute('data-photo', name);
        entity.html = box.innerHTML;
      }
    }
  }

  // ============================================================
  // 工具
  // ============================================================
  const $ = (s, r = document) => r.querySelector(s);
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const strip = (h) => String(h || '').replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
  function fmt(s) { return String(s == null ? '' : s).replace(/\{player\}/g, esc(S ? S.player : '')); }
  function h(tag, attrs, ...kids) {
    const el = document.createElement(tag);
    if (attrs) for (const [k, v] of Object.entries(attrs)) {
      if (v == null || v === false) continue;
      if (k === 'class') el.className = v;
      else if (k === 'html') el.innerHTML = v;
      else if (k === 'text') el.textContent = v;
      else if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
      else if (k === 'style' && typeof v === 'object') Object.assign(el.style, v);
      else el.setAttribute(k, v === true ? '' : v);
    }
    for (const k of kids.flat()) if (k != null && k !== false) el.append(k.nodeType ? k : document.createTextNode(k));
    return el;
  }
  function norm(s) {
    return String(s == null ? '' : s).normalize('NFKC').toLowerCase()
      .replace(/[\s，。、！？,.!?;:：；'"“”‘’()（）\[\]【】\-—_·\/\\《》<>~～…「」『』|]/g, '');
  }
  // 在触屏松手时直接执行操作；兼容没有补发 click 的浏览器，并去掉同次触摸的重复点击。
  function controlButton(attrs, action, ...children) {
    const button = h('button', Object.assign({ type: 'button' }, attrs), ...children);
    return bindControl(button, action);
  }
  const controlCancels = new WeakMap();
  function bindControl(button, action, targetOf = () => button) {
    let press = null, suppressClickUntil = 0;
    const reset = () => { press = null; button.classList.remove('pressed-control'); };
    const start = (kind, id, x, y, target) => { reset(); press = { kind, id, x, y, moved: false, target }; if (target === button) button.classList.add('pressed-control'); };
    const move = (x, y) => { if (press && Math.hypot(x - press.x, y - press.y) > 12) { press.moved = true; button.classList.remove('pressed-control'); } };
    const cancel = () => { if (press) suppressClickUntil = Date.now() + 800; reset(); };
    controlCancels.set(button, cancel);
    const finish = (event, x, y) => {
      if (!press) return;
      const current = press, r = current.target.getBoundingClientRect(); move(x, y); reset();
      suppressClickUntil = Date.now() + 800;
      if (event.cancelable) event.preventDefault(); event.stopPropagation();
      if (!current.target.disabled && !current.moved && x >= r.left - 6 && x <= r.right + 6 && y >= r.top - 6 && y <= r.bottom + 6) action(event, current.target);
    };
    button.addEventListener('pointerdown', e => {
      const target = targetOf(e); if (!target) return;
      if (e.pointerType === 'mouse') { suppressClickUntil = 0; return; }
      if (!['touch', 'pen'].includes(e.pointerType)) return;
      if (!e.isPrimary) return cancel();
      start('pointer', e.pointerId, e.clientX, e.clientY, target);
    });
    button.addEventListener('pointermove', e => { if (press && press.kind === 'pointer' && press.id === e.pointerId) move(e.clientX, e.clientY); });
    button.addEventListener('pointerup', e => { if (press && press.kind === 'pointer' && press.id === e.pointerId) finish(e, e.clientX, e.clientY); });
    button.addEventListener('pointercancel', cancel);
    button.addEventListener('touchstart', e => {
      const target = targetOf(e); if (!target) return;
      if (e.touches.length !== 1) return cancel();
      if (!press) { const t = e.touches[0]; start('touch', t.identifier, t.clientX, t.clientY, target); }
    }, { passive: true });
    button.addEventListener('touchmove', e => { if (press && press.kind === 'touch') { const t = [...e.touches].find(t => t.identifier === press.id); if (t) move(t.clientX, t.clientY); } }, { passive: true });
    button.addEventListener('touchend', e => {
      // Delegated link handlers must leave unrelated input/selection gestures native.
      if (!targetOf(e)) return;
      const t = press && [...e.changedTouches].find(t => press.kind === 'pointer' || t.identifier === press.id);
      if (t) finish(e, t.clientX, t.clientY);
      else if (Date.now() < suppressClickUntil) { if (e.cancelable) e.preventDefault(); e.stopPropagation(); }
    }, { passive: false });
    button.addEventListener('touchcancel', cancel, { passive: true });
    button.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') suppressClickUntil = 0; });
    button.addEventListener('click', e => {
      const target = targetOf(e); if (!target) return;
      e.stopPropagation();
      if (target.disabled || Date.now() < suppressClickUntil) { e.preventDefault(); return; }
      action(e, target);
    });
    return button;
  }
  const pad = (n) => String(n).padStart(2, '0');
  const timers = new Set();
  function later(fn, ms) { const t = setTimeout(() => { timers.delete(t); fn(); }, ms); timers.add(t); return t; }
  function clearTimers() { timers.forEach(clearTimeout); timers.clear(); }
  const coarse = () => window.matchMedia && matchMedia('(pointer: coarse)').matches;
  const narrow = () => window.innerWidth <= 960;
  const touchKeyboard = () => navigator.maxTouchPoints > 0 || coarse();
  const confirmInput = e => e.key === 'Enter' && !e.isComposing && e.keyCode !== 229;
  const textInputTarget = target => {
    const input = target?.closest?.('input, textarea, [contenteditable="true"]');
    if (!input || input.disabled || input.readOnly) return null;
    return input.isContentEditable || input.tagName === 'TEXTAREA' || ['text', 'search', 'password', 'email', 'url', 'tel', 'number'].includes(input.type) ? input : null;
  };
  // iPad can omit the compatibility click after a touch. Focus the actual field
  // synchronously inside the trusted gesture so WebKit may show its keyboard.
  // Leave scrolling, selection, paste and native click behavior untouched.
  function bindTextInputs() {
    let touch = null, pen = null;
    const begin = (input, id, x, y) => input && ({ input, id, x, y, moved: false });
    const move = (press, x, y) => { if (press && Math.hypot(x - press.x, y - press.y) > 12) press.moved = true; };
    const finish = (press, e, x, y) => {
      if (!press || !e.isTrusted || press.moved || !press.input.isConnected || textInputTarget(e.target) !== press.input) return;
      const r = press.input.getBoundingClientRect();
      if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) press.input.focus();
    };
    document.addEventListener('touchstart', e => { const t = e.touches[0]; touch = e.touches.length === 1 ? begin(textInputTarget(e.target), t.identifier, t.clientX, t.clientY) : null; }, { capture: true, passive: true });
    document.addEventListener('touchmove', e => { const t = touch && [...e.touches].find(t => t.identifier === touch.id); if (t) move(touch, t.clientX, t.clientY); }, { capture: true, passive: true });
    document.addEventListener('touchend', e => { const t = touch && [...e.changedTouches].find(t => t.identifier === touch.id); if (t) { move(touch, t.clientX, t.clientY); finish(touch, e, t.clientX, t.clientY); } touch = null; }, { capture: true, passive: true });
    document.addEventListener('touchcancel', () => { touch = null; }, { capture: true, passive: true });
    document.addEventListener('pointerdown', e => { if (e.pointerType === 'pen') pen = begin(textInputTarget(e.target), e.pointerId, e.clientX, e.clientY); }, true);
    document.addEventListener('pointermove', e => { if (pen && pen.id === e.pointerId) move(pen, e.clientX, e.clientY); }, true);
    document.addEventListener('pointerup', e => { if (pen && pen.id === e.pointerId) { move(pen, e.clientX, e.clientY); finish(pen, e, e.clientX, e.clientY); pen = null; } }, true);
    document.addEventListener('pointercancel', () => { pen = null; }, true);
  }

  // ============================================================
  // 状态、条件、动作
  // ============================================================
  const VER = 1;
  let S = null;
  let flagVer = 0;
  function fresh(player) {
    return {
      v: VER, player: player || _t('老K'), flags: { start: true }, opened: {}, hints: {}, notes: [], noteCh: {}, collected: [],
      dlg: {}, dlgQ: {}, chat: {}, unread: {}, wait: {}, mails: [], mailRead: {}, items: [], itemSeen: {}, boardFill: {},
      seenBoards: {}, seenAsk: {}, chapter: null, chTime: null, stage: 'off', clock: '1900-01-01 00:00', clockAt: Date.now(),
      showHidden: false, playMs: 0, runId: window.Y2KLeaderboard?.newRun(), finishRecords: {}, created: Date.now(), newNotes: 0, newBoards: 0, sound: true, readingSeen: {},
    };
  }
  const compiled = {};
  // Existing saves already retain each revealed hint; derive the total from that snapshot.
  function hintCount(state = S) {
    return Object.values(state && state.hints || {}).reduce((sum, n) => sum + (Number.isSafeInteger(n) && n > 0 ? n : 0), 0);
  }
  function compile(expr) {
    const toks = expr.match(/[A-Za-z0-9_]+|[()&|!]/g) || [];
    let i = 0;
    const or = () => { let a = and(); while (toks[i] === '|') { i++; const b = and(), x = a; a = (f) => x(f) || b(f); } return a; };
    const and = () => { let a = not(); while (toks[i] === '&') { i++; const b = not(), x = a; a = (f) => x(f) && b(f); } return a; };
    const not = () => { if (toks[i] === '!') { i++; const a = not(); return (f) => !a(f); } return atom(); };
    const atom = () => { const t = toks[i++]; if (t === '(') { const a = or(); i++; return a; } if (!t) return () => true; return (f) => !!f[t]; };
    return or();
  }
  function test(expr) {
    if (!expr) return true;
    const fn = compiled[expr] || (compiled[expr] = compile(expr));
    return fn(S.flags);
  }
  function setFlag(f) { if (!S.flags[f]) { S.flags[f] = true; flagVer++; } }

  let preEndSnap = null, pendingEnding = null;
  function markInteraction() { try { preEndSnap = JSON.stringify(S); } catch (e) { preEndSnap = null; } }

  function act(a, once) {
    if (!a) return;
    (a.set || []).forEach(setFlag);
    (a.unset || []).forEach(f => { if (S.flags[f]) { delete S.flags[f]; flagVer++; } });
    [].concat(a.note || []).forEach(addNote);
    if (a.collect) collect(a.collect);
    if (a.mail) deliverMail(a.mail);
    if (a.toast && once !== false) toast(fmt(a.toast));
    if (a.clock) { S.clock = a.clock; S.clockAt = Date.now(); }
    if (a.ending) pendingEnding = a.ending;
    dirty();
  }
  function addNote(id) {
    if (!D.notes[id] || S.notes.includes(id)) return;
    S.notes.push(id); S.noteCh[id] = S.chapter; S.newNotes++;
    toast(_t('笔记 · ') + strip(fmt(D.notes[id].text)).slice(0, 34));
  }
  function collect(id) {
    const c = D.collectibles[id];
    if (!c || S.collected.includes(id)) return;
    S.collected.push(id); setFlag('col_' + id);
    const total = Object.keys(D.collectibles).length;
    if (S.collected.length >= total) setFlag('collected_all');
    S.newNotes++;
    toast(`${_t('拾得林晚的诗稿')} ${c.title}（${S.collected.length}/${total}）`, 'good');
    sfx('ok');
  }
  function deliverMail(id) {
    if (S.mails.includes(id) || !MAIL26[id]) return;
    S.mails.push(id); toast(_t('新邮件 · ') + strip(fmt(MAIL26[id].subject))); sfx('msg');
  }
  // 第一次打开某个东西
  function opened(id, onOpen) {
    if (id) { if (S.opened[id]) return; setFlag('seen_' + id); S.opened[id] = 1; }
    act(onOpen);
    dirty();
  }
  function onceFlag(flag, action) { if (S.flags[flag]) return; setFlag(flag); act(action); }

  // ============================================================
  // 主循环
  // ============================================================
  let dirtyT = 0;
  function dirty() { if (!dirtyT) dirtyT = setTimeout(update, 0); }
  const cardQ = [];
  function update() {
    dirtyT = 0;
    if (!S || titleOn) return;
    for (let pass = 0; pass < 4; pass++) {
      const before = flagVer;
      for (const c of D.chapters) {
        if (!S.flags[c.id] && test(c.trigger)) {
          setFlag(c.id); S.chapter = c.id; S.chTime = { date: c.date, time: c.time || '09:00', at: Date.now() };
          cardQ.push(c);
        }
      }
      D.mails2026.forEach(m => { if (m.requires && !S.mails.includes(m.id) && test(m.requires)) deliverMail(m.id); });
      D.dialogues.forEach(d => {
        if (!S.dlg[d.id] && test(d.trigger)) { S.dlg[d.id] = { i: 0 }; (S.dlgQ[d.contact] = S.dlgQ[d.contact] || []).push(d.id); }
      });
      if (flagVer === before) break;
    }
    for (const [id, b] of Object.entries(D.boards)) {
      if (!S.seenBoards[id] && test(b.requires)) { S.seenBoards[id] = 1; S.newBoards++; toast(_t('推理板解锁 · ') + b.title, 'good'); sfx('ok'); }
    }
    for (const [id, p] of Object.entries(D.puzzles)) {
      if (p.ask && !S.seenAsk[id] && test(p.requires) && !S.flags['solved_' + id]) { S.seenAsk[id] = 1; S.newNotes++; }
    }
    D.items2026.forEach(it => { if (!S.items.includes(it.id) && test(it.requires)) { S.items.push(it.id); } });
    runDialogues();
    if (pendingEnding) { const e = pendingEnding; pendingEnding = null; showEnding(e); }
    showCards();
    renderAll();
    save('auto');
  }

  // ============================================================
  // 存档
  // ============================================================
  const LS = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); return true; } catch (e) { return false; } },
    del(k) { try { localStorage.removeItem(k); } catch (e) { } },
  };
  const KEY = { auto: 'y2k_auto', s1: 'y2k_slot1', s2: 'y2k_slot2', s3: 'y2k_slot3', pre: 'y2k_preend', meta: 'y2k_meta' };
  let saveT = 0, storageOK = true;
  function save(slot) {
    if (!S) return;
    if (slot === 'auto') { if (saveT) return; saveT = setTimeout(() => { saveT = 0; writeSave('auto'); }, 400); return; }
    return writeSave(slot);
  }
  function tickPlay() {
    const now = Date.now();
    if (S && playClockRunning && lastTick) S.playMs = Math.max(0, Number(S.playMs) || 0) + Math.max(0, now - lastTick);
    lastTick = now;
  }
  let lastTick = 0, playClockRunning = false;
  function syncPlayClock() {
    tickPlay();
    playClockRunning = !titleOn && document.visibilityState === 'visible' && !document.querySelector('.ending');
  }
  function writeSave(slot) {
    tickPlay();
    S.saved = Date.now();
    const ok = LS.set(KEY[slot], JSON.stringify(S));
    if (!ok && storageOK) { storageOK = false; toast(_t('浏览器不允许本地存储。请用"菜单 → 导出存档"手动保存进度。')); }
    return ok;
  }
  function readSave(slot) { const t = LS.get(KEY[slot]); if (!t) return null; try { const o = JSON.parse(t); return o && o.v ? o : null; } catch (e) { return null; } }
  function meta() { try { return JSON.parse(LS.get(KEY.meta) || '{}'); } catch (e) { return {}; } }
  function setMeta(m) { LS.set(KEY.meta, JSON.stringify(m)); }
  function describe(s) {
    if (!s) return _t('空');
    const c = D.chapters.find(x => x.id === s.chapter);
    const d = new Date(s.saved || s.created);
    const pt = Math.round((s.playMs || 0) / 60000);
    return `${c ? c.num + ' ' + c.name : _t('序章')} ${_t('· 游玩')} ${Math.floor(pt / 60)}${_t('小时')}${pt % 60}${_t('分 ·')} ${d.getMonth() + 1}/${d.getDate()} ${pad(d.getHours())}:${pad(d.getMinutes())} · ${_t('提示次数')}：${hintCount(s)}`;
  }
  function loadState(o) {
    clearTimers(); running = {}; typing = {};
    clearTimeout(dirtyT); dirtyT = 0; clearTimeout(saveT); saveT = 0;
    closeAllWins(); closeOverlay(); closeModal();
    S = Object.assign(fresh(o.player), o);
    flagVer++; cardQ.length = 0; cardOn = false; pendingEnding = null;
    lastTick = Date.now(); playClockRunning = false;
    window.Y2KLeaderboard?.resume(S);
    ui.tab = 'msg'; ui.chat = null; ui.mail = null; ui.item = null;
    ui._viewKey = null; ui.scroll = {}; ui.menuView = null;
    ui.noteTab = 'questions'; ui.noteQuery = ''; ui.itemQuery = '';
    ui.reading = null; ui.clueScope = 'current'; ui.clueGroups = {};
    hideTitle();
    renderScreen(); renderAll(); dirty();
    const unfinishedReview = Object.keys(S.finishRecords || {}).find(id => S.finishRecords[id]?.review === null);
    if (unfinishedReview) showEnding(unfinishedReview);
  }
  function exportSave() {
    tickPlay();
    const blob = new Blob([JSON.stringify(S, null, 1)], { type: 'application/json' });
    const a = h('a', { href: URL.createObjectURL(blob), download: `${_t('千年虫存档_')}${new Date().toISOString().slice(0, 10)}.json` });
    document.body.append(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
    toast(_t('已导出存档文件'));
  }
  function importFile(cb) {
    const inp = h('input', { type: 'file', accept: '.json,application/json', style: { display: 'none' } });
    inp.onchange = () => {
      const f = inp.files[0]; if (!f) return;
      const r = new FileReader();
      r.onload = () => { try { const o = JSON.parse(r.result); if (!o.v || !o.flags) throw 0; loadState(o); toast(_t('存档已读取')); cb && cb(); } catch (e) { toast(_t('这个文件不是《千年虫》的存档')); } };
      r.readAsText(f);
    };
    document.body.append(inp); inp.click(); setTimeout(() => inp.remove(), 60000);
  }
  const b64e = (s) => btoa(unescape(encodeURIComponent(s)));
  const b64d = (s) => decodeURIComponent(escape(atob(s.trim())));

  // ============================================================
  // 声音（WebAudio 合成，可关闭）
  // ============================================================
  let actx = null;
  function sfx(kind) {
    if (!S || !S.sound) return;
    try {
      actx = actx || new (window.AudioContext || window.webkitAudioContext)();
      if (actx.state === 'suspended') actx.resume();
      const t = actx.currentTime;
      const tone = (f, d, at = 0, type = 'sine', vol = .06) => {
        const o = actx.createOscillator(), g = actx.createGain();
        o.type = type; o.frequency.value = f; g.gain.setValueAtTime(vol, t + at); g.gain.exponentialRampToValueAtTime(.0001, t + at + d);
        o.connect(g).connect(actx.destination); o.start(t + at); o.stop(t + at + d + .02);
      };
      if (kind === 'msg') { tone(880, .12); tone(1320, .18, .1); }
      else if (kind === 'ok') { tone(660, .12); tone(880, .12, .1); tone(1175, .25, .2); }
      else if (kind === 'err') { tone(220, .25, 0, 'square', .04); }
      else if (kind === 'boot') { [523, 659, 784, 1047].forEach((f, i) => tone(f, 1.6 - i * .2, i * .22, 'triangle', .05)); }
      else if (kind === 'click') { tone(1800, .03, 0, 'square', .02); }
    } catch (e) { }
  }

  // ============================================================
  // 提示条
  // ============================================================
  function toast(text, kind) {
    const box = $('#toast'); if (!box) return;
    const el = h('div', { class: 'tst' + (kind ? ' ' + kind : ''), html: text });
    box.append(el);
    while (box.children.length > 3) box.firstChild.remove();
    setTimeout(() => el.remove(), 3800);
  }

  // ============================================================
  // 图标（像素风小 SVG）
  // ============================================================
  const ICONS = {
    computer: '<rect x="4" y="4" width="24" height="17" fill="#c0c0c0" stroke="#000"/><rect x="7" y="7" width="18" height="11" fill="#008080"/><rect x="10" y="22" width="12" height="3" fill="#c0c0c0" stroke="#000"/><rect x="5" y="25" width="22" height="4" fill="#c0c0c0" stroke="#000"/>',
    folder: '<path d="M2 8h10l2 3h16v16H2z" fill="#f6d36b" stroke="#7a5c00"/><path d="M2 12h28v15H2z" fill="#ffe28a" stroke="#7a5c00"/>',
    drive: '<rect x="3" y="11" width="26" height="12" fill="#c0c0c0" stroke="#000"/><rect x="6" y="16" width="12" height="2" fill="#404040"/><rect x="23" y="15" width="3" height="3" fill="#0c0"/>',
    floppy: '<rect x="5" y="4" width="22" height="24" fill="#2b2b7a" stroke="#000"/><rect x="10" y="4" width="12" height="8" fill="#c0c0c0"/><rect x="18" y="5" width="3" height="6" fill="#2b2b7a"/><rect x="9" y="17" width="14" height="10" fill="#fff"/>',
    txt: '<path d="M7 3h13l5 5v21H7z" fill="#fff" stroke="#000"/><path d="M20 3v5h5" fill="none" stroke="#000"/><path d="M10 12h12M10 15h12M10 18h12M10 21h9" stroke="#000080"/>',
    doc: '<path d="M7 3h13l5 5v21H7z" fill="#fff" stroke="#000"/><path d="M20 3v5h5" fill="none" stroke="#000"/><rect x="10" y="11" width="12" height="9" fill="#1d55c4"/><text x="12" y="19" font-size="8" fill="#fff" font-family="Arial" font-weight="bold">W</text><path d="M10 23h12" stroke="#000"/>',
    img: '<rect x="4" y="6" width="24" height="20" fill="#fff" stroke="#000"/><rect x="6" y="8" width="20" height="14" fill="#7ec0ff"/><path d="M6 22l7-8 5 5 3-3 5 6z" fill="#2f8a2f"/><circle cx="21" cy="12" r="2" fill="#ff0"/>',
    audio: '<rect x="3" y="8" width="26" height="17" rx="2" fill="#333" stroke="#000"/><rect x="6" y="10" width="20" height="5" fill="#f3edd8"/><circle cx="11" cy="20" r="3" fill="#ddd"/><circle cx="21" cy="20" r="3" fill="#ddd"/>',
    zip: '<rect x="6" y="4" width="20" height="24" fill="#f2c94c" stroke="#000"/><path d="M16 4v24" stroke="#000" stroke-dasharray="2 2"/><rect x="13" y="16" width="6" height="6" fill="#c0c0c0" stroke="#000"/>',
    exe: '<rect x="4" y="6" width="24" height="20" fill="#c0c0c0" stroke="#000"/><rect x="4" y="6" width="24" height="4" fill="#000080"/><rect x="8" y="14" width="16" height="2" fill="#000"/><rect x="8" y="18" width="10" height="2" fill="#000"/>',
    sys: '<path d="M7 3h13l5 5v21H7z" fill="#fff" stroke="#000"/><circle cx="16" cy="18" r="5" fill="#c0c0c0" stroke="#000"/><circle cx="16" cy="18" r="2" fill="#fff" stroke="#000"/>',
    htm: '<path d="M7 3h13l5 5v21H7z" fill="#fff" stroke="#000"/><circle cx="16" cy="18" r="6" fill="#3a7bd5"/><path d="M10 18h12M16 12v12" stroke="#fff"/>',
    ie: '<circle cx="16" cy="16" r="11" fill="#3a7bd5" stroke="#0b2a6b"/><text x="10" y="22" font-size="17" font-family="Georgia" font-style="italic" font-weight="bold" fill="#fff">e</text><path d="M4 20c6-10 18-14 25-12" stroke="#f2c94c" stroke-width="2" fill="none"/>',
    pigeon: '<path d="M5 20c2-8 10-12 17-10l5-3-1 6c2 4 0 9-6 11H9z" fill="#e8eef7" stroke="#2b4a7a"/><circle cx="22" cy="12" r="1.3" fill="#000"/><path d="M27 12l3 1-3 1" fill="#f2a33a"/>',
    recycle: '<path d="M8 9h16l-2 19H10z" fill="#d9e6ef" stroke="#3a4a5a"/><rect x="6" y="6" width="20" height="3" fill="#b9c9d6" stroke="#3a4a5a"/><path d="M13 13v12M16 13v12M19 13v12" stroke="#7b8c9a"/>',
    recyclefull: '<path d="M8 9h16l-2 19H10z" fill="#d9e6ef" stroke="#3a4a5a"/><rect x="6" y="6" width="20" height="3" fill="#b9c9d6" stroke="#3a4a5a"/><path d="M11 9l3-5 4 3 4-4 1 6" fill="#fff" stroke="#555"/>',
    display: '<rect x="4" y="5" width="24" height="17" fill="#c0c0c0" stroke="#000"/><rect x="7" y="8" width="18" height="11" fill="#000"/><text x="9" y="16" font-size="6" fill="#ff0" font-family="Arial">abc</text><rect x="12" y="23" width="8" height="4" fill="#c0c0c0" stroke="#000"/>',
    help: '<circle cx="16" cy="16" r="11" fill="#fff" stroke="#000"/><text x="11" y="22" font-size="16" font-weight="bold" font-family="Arial" fill="#000080">?</text>',
    win: '<rect x="4" y="5" width="11" height="10" fill="#e33"/><rect x="17" y="5" width="11" height="10" fill="#3b3"/><rect x="4" y="17" width="11" height="10" fill="#36f"/><rect x="17" y="17" width="11" height="10" fill="#fc3"/>',
    lock: '<rect x="18" y="20" width="12" height="10" fill="#f2c94c" stroke="#000"/><path d="M20 20v-3a4 4 0 0 1 8 0v3" fill="none" stroke="#000" stroke-width="2"/>',
    shutdown: '<rect x="5" y="6" width="22" height="16" fill="#c0c0c0" stroke="#000"/><rect x="8" y="9" width="16" height="10" fill="#000080"/><rect x="11" y="23" width="10" height="4" fill="#c0c0c0" stroke="#000"/>',
    notepad: '<rect x="6" y="4" width="20" height="25" fill="#fff" stroke="#000"/><path d="M6 4h20v4H6z" fill="#7aa7e0"/><path d="M9 12h14M9 15h14M9 18h14M9 21h10" stroke="#555"/>',
  };
  const TYPEICON = { folder: 'folder', txt: 'txt', log: 'txt', ini: 'sys', bat: 'sys', bak: 'sys', dat: 'sys', sys: 'sys', doc: 'doc', htm: 'htm', img: 'img', audio: 'audio', zip: 'zip', exe: 'exe', lnk: 'exe' };
  const TYPENAME = { folder: _t('文件夹'), txt: _t('文本文档'), log: _t('日志文件'), ini: _t('配置设置'), bat: _t('MS-DOS 批处理程序'), bak: _t('BAK 文件'), dat: _t('DAT 文件'), sys: _t('系统文件'), doc: _t('写字板文档'), htm: _t('HTML 文档'), img: _t('位图图像'), audio: _t('波形声音'), zip: _t('ZIP 压缩文件'), exe: _t('应用程序'), lnk: _t('快捷方式') };
  function icon(name, locked) {
    return `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges">${ICONS[name] || ICONS.txt}${locked ? ICONS.lock : ''}</svg>`;
  }
  const PHICON = {
    msg: '<path d="M4 5h16v11H9l-5 4z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="2" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M3 7l9 6 9-6" fill="none" stroke="currentColor" stroke-width="1.8"/>',
    items: '<path d="M4 8l8-4 8 4v9l-8 4-8-4z M4 8l8 4 8-4 M12 12v9" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>',
    notes: '<rect x="5" y="3" width="14" height="18" rx="2" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M8 8h8M8 12h8M8 16h5" stroke="currentColor" stroke-width="1.8"/>',
    boards: '<rect x="3" y="4" width="18" height="16" rx="2" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="8" cy="9" r="1.6" fill="currentColor"/><circle cx="16" cy="14" r="1.6" fill="currentColor"/><path d="M8 9l8 5" stroke="currentColor" stroke-width="1.5"/>',
    menu: '<path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>',
    phone: '<rect x="7" y="2" width="10" height="20" rx="2" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M11 18h2" stroke="currentColor" stroke-width="1.8"/>',
  };
  const phIcon = (k) => `<svg viewBox="0 0 24 24">${PHICON[k]}</svg>`;

  // ============================================================
  // 时间
  // ============================================================
  function machineNow() {
    const m = /^(\d{4})-(\d\d)-(\d\d) (\d\d):(\d\d)/.exec(S.clock || '1900-01-01 00:00');
    const base = new Date(+m[1] < 1970 ? 2000 : +m[1], +m[2] - 1, +m[3], +m[4], +m[5]);
    const d = new Date(base.getTime() + (Date.now() - S.clockAt));
    const y = +m[1] < 1970 ? +m[1] + (d.getFullYear() - 2000) : d.getFullYear();
    return { y, mo: d.getMonth() + 1, d: d.getDate(), hm: `${pad(d.getHours())}:${pad(d.getMinutes())}` };
  }
  function phoneNow() {
    const t = S.chTime || { date: '2026-10-27', time: '21:40', at: Date.now() };
    const [hh, mm] = t.time.split(':').map(Number);
    const mins = hh * 60 + mm + Math.floor((Date.now() - t.at) / 60000);
    const dd = Math.floor(mins / 1440);
    const [y, mo, d] = t.date.split('-').map(Number);
    const day = new Date(y, mo - 1, d + dd);
    const M = day.getMonth() + 1, Dd = day.getDate(), w = day.getDay();
    const date = LANG === 'en' ? `${'Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec'.split(' ')[M - 1]} ${Dd}` : `${M}月${Dd}日`;
    const wk = LANG === 'en' ? 'Sun Mon Tue Wed Thu Fri Sat'.split(' ')[w] : LANG === 'ja' ? '(' + '日月火水木金土'[w] + ')' : '周' + '日一二三四五六'[w];
    return { date, hm: `${pad(Math.floor(mins / 60) % 24)}:${pad(mins % 60)}`, wk };
  }

  // ============================================================
  // 全局浮层：章节卡、结局、推理板、看图
  // ============================================================
  function overlay() { return $('#overlay'); }
  let overlayCleanup = null;
  function openOverlay(el, cleanup) { closeOverlay(); const o = overlay(); o.append(el); o.classList.add('on'); overlayCleanup = cleanup || null; }
  function closeOverlay() {
    const cleanup = overlayCleanup; overlayCleanup = null;
    const o = overlay(); if (o) { o.classList.remove('on'); o.innerHTML = ''; }
    if (cleanup) cleanup();
  }
  let cardOn = false;
  function showCards() {
    if (cardOn || !cardQ.length || titleOn || overlay().classList.contains('on')) return;
    const c = cardQ.shift(); cardOn = true;
    const el = h('div', { class: 'card', tabindex: 0 },
      h('div', { class: 'num', text: c.num }),
      h('h1', { text: c.name }),
      h('div', { class: 'date', text: c.date.replace(/-/g, ' . ') }),
      c.intro ? h('div', { class: 'intro', html: fmt(c.intro) }) : null,
      h('div', { class: 'go', text: _t('点击继续') }));
    const go = () => { cardOn = false; closeOverlay(); showCards(); renderAll(); if (!cardOn) nudgeReplies(); };
    el.onclick = go; el.onkeydown = (e) => { if (e.key === 'Enter' || e.key === ' ') go(); };
    openOverlay(el); el.focus();
  }
  function nudgeReplies() {
    const who = Object.keys(S.wait || {}).filter(c => S.wait[c] && S.wait[c].type !== 'wait' && D.contacts2026[c]).map(c => D.contacts2026[c].name);
    if (who.length) toast(who.join('、') + _t(' 在等你回复。打开手机「消息」，点底部的回复发送。'));
  }
  function showEnding(id) {
    const e = D.endings[id]; if (!e) return;
    tickPlay(); playClockRunning = false;
    window.Y2KLeaderboard?.capture(S, id);
    if (preEndSnap) LS.set(KEY.pre, preEndSnap);
    setFlag('ending_' + id);
    if (!S.ends) S.ends = [];
    if (!S.ends.includes(id)) S.ends.push(id);
    const m = meta(); m.endings = m.endings || {}; if (!m.endings[id]) m.endings[id] = Date.now(); setMeta(m);
    writeSave('auto');
    const names = { A: _t('结局 A'), B: _t('结局 B'), C: _t('结局 C · 真结局'), H: _t('隐藏结局') };
    const el = h('div', { class: 'ending' }, h('div', { class: 'in2' },
      h('div', { class: 'num', text: names[id] || _t('结局') }),
      h('h1', { text: e.title }),
      h('div', { class: 'body', html: fmt(e.html) }),
      h('div', { class: 'acts' },
        ['C', 'H'].includes(id) ? h('button', { class: 'tbtn', text: _t('回到 3 号机'), onclick: () => { closeOverlay(); syncPlayClock(); renderAll(); showCards(); } }) : null,
        LS.get(KEY.pre) ? h('button', { class: 'tbtn', text: _t('回到结局前继续'), onclick: () => { const o = readSave('pre'); if (o) loadState(o); } }) : null,
        h('button', { class: 'tbtn', text: _t('返回标题画面'), onclick: () => { closeOverlay(); showTitle(); } }))));
    sfx('boot');
    openOverlay(el);
    window.Y2KLeaderboard?.requestReview(el, S, id, LANG, () => writeSave('auto'));
  }
  function imageSize(root) {
    const svg = root.querySelector('svg'), img = root.querySelector('img');
    const vb = svg && svg.viewBox.baseVal;
    const w = (vb && vb.width) || (img && (img.naturalWidth || img.width)) || 640;
    const hh = (vb && vb.height) || (img && (img.naturalHeight || img.height)) || 480;
    return root.querySelector('.photo') ? { w: w + 20, h: hh + 38 } : { w, h: hh };
  }
  function bindImageZoom(root) {
    root.querySelectorAll('table').forEach(table => {
      const scroll = h('div', { class: 'table-scroll', tabindex: 0, 'aria-label': _t('表格，可左右滚动查看') });
      table.before(h('div', { class: 'table-hint', text: _t('可左右滑动查看表格') }), scroll); scroll.append(table);
    });
    root.querySelectorAll('svg, img').forEach(img => {
      img.style.cursor = 'zoom-in'; img.setAttribute('role', 'button'); img.setAttribute('tabindex', '0'); img.setAttribute('aria-label', _t('放大图片'));
      const open = () => viewImage(img.outerHTML);
      img.onclick = open;
      img.onkeydown = e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } };
    });
  }
  function viewImage(html, file) {
    const previousFocus = document.activeElement;
    const canvas = h('div', { class: 'viewer-canvas', html });
    canvas.querySelectorAll('[tabindex]').forEach(el => { el.removeAttribute('tabindex'); el.removeAttribute('role'); el.removeAttribute('aria-label'); el.style.cursor = ''; });
    const size = imageSize(canvas);
    const area = h('div', { class: 'viewer-scroll', tabindex: 0, 'aria-label': _t('图片，可滚动查看') }, canvas);
    const value = h('output', { 'aria-live': 'polite' });
    let scale = 1, fitMode = true;
    const resize = (z, center = true) => {
      const oldW = canvas.offsetWidth || size.w, oldH = canvas.offsetHeight || size.h;
      const cx = (area.scrollLeft + area.clientWidth / 2) / oldW, cy = (area.scrollTop + area.clientHeight / 2) / oldH;
      scale = Math.max(.05, Math.min(4, z));
      canvas.style.width = Math.round(size.w * scale) + 'px';
      value.textContent = Math.round(scale * 100) + '%';
      minus.disabled = scale <= .05; plus.disabled = scale >= 4;
      area.classList.toggle('pannable', canvas.offsetWidth > area.clientWidth - 32 || canvas.offsetHeight > area.clientHeight - 32);
      area.scrollLeft = center ? cx * canvas.offsetWidth - area.clientWidth / 2 : 0;
      area.scrollTop = center ? cy * canvas.offsetHeight - area.clientHeight / 2 : 0;
    };
    const fit = () => { fitMode = true; resize(Math.min(1, Math.max(1, area.clientWidth - 32) / size.w, Math.max(1, area.clientHeight - 32) / size.h), false); };
    const zoom = factor => { fitMode = false; resize(scale * factor); };
    const minus = controlButton({ class: 'ph-btn', text: _t('缩小 −') }, () => zoom(1 / 1.25));
    const plus = controlButton({ class: 'ph-btn', text: _t('放大 +') }, () => zoom(1.25));
    const close = () => { closeOverlay(); showCards(); };
    const closeBtn = controlButton({ class: 'ph-btn viewer-close', text: _t('关闭'), title: 'Esc' }, close);
    const toolbar = h('div', { class: 'viewer-toolbar' }, minus, plus, value,
      controlButton({ class: 'ph-btn', text: _t('适应窗口') }, fit),
      controlButton({ class: 'ph-btn', text: _t('原始大小') }, () => { fitMode = false; resize(1); }),
      file ? controlButton({ class: 'ph-btn', text: _t('属性') }, () => showProps(file, true)) : null, closeBtn);
    const panel = h('div', { class: 'viewer-panel', role: 'dialog', 'aria-modal': 'true', 'aria-label': _t('图像查看器') }, toolbar, area);
    const el = h('div', { class: 'viewer', onclick: e => { if (e.target === el) close(); } }, panel);
    if (file) bindCtx(area, () => [[_t('属性'), () => showProps(file, true)]], null, overlay());
    panel.onkeydown = e => {
      if (e.key === '+' || e.key === '=') { e.preventDefault(); zoom(1.25); }
      if (e.key === '-') { e.preventDefault(); zoom(1 / 1.25); }
      if (e.key === '0') { e.preventDefault(); fit(); }
      if (e.key === 'Tab') {
        const stops = [...panel.querySelectorAll('button:not(:disabled), [tabindex="0"]')];
        if (e.shiftKey && document.activeElement === stops[0]) { e.preventDefault(); stops[stops.length - 1].focus(); }
        else if (!e.shiftKey && document.activeElement === stops[stops.length - 1]) { e.preventDefault(); stops[0].focus(); }
      }
    };
    area.addEventListener('wheel', e => { if (e.ctrlKey) { e.preventDefault(); zoom(e.deltaY < 0 ? 1.15 : 1 / 1.15); } }, { passive: false });
    area.addEventListener('pointerdown', e => {
      if (e.pointerType !== 'mouse' || e.button !== 0 || !area.classList.contains('pannable')) return;
      e.preventDefault(); area.setPointerCapture(e.pointerId); area.classList.add('dragging');
      const x = e.clientX, y = e.clientY, left = area.scrollLeft, top = area.scrollTop;
      const move = ev => { area.scrollLeft = left + x - ev.clientX; area.scrollTop = top + y - ev.clientY; };
      const stop = () => { area.classList.remove('dragging'); area.removeEventListener('pointermove', move); area.removeEventListener('pointerup', stop); area.removeEventListener('pointercancel', stop); };
      area.addEventListener('pointermove', move); area.addEventListener('pointerup', stop); area.addEventListener('pointercancel', stop);
    });
    const observer = new ResizeObserver(() => { if (fitMode) fit(); });
    openOverlay(el, () => { observer.disconnect(); if (previousFocus && previousFocus.isConnected) previousFocus.focus({ preventScroll: true }); });
    fit(); observer.observe(area); closeBtn.focus({ preventScroll: true });
  }

  // ============================================================
  // 谜题
  // ============================================================
  function solved(id) { return !!S.flags['solved_' + id]; }
  function checkPuzzle(p, val) {
    const kind = p.kind || 'text';
    if (kind === 'text') return (p.answers || []).some(a => norm(a) === norm(val));
    if (kind === 'choice') return val === p._ai;
    if (kind === 'pick') { const set = new Set(val); return set.size === p._as.length && p._as.every(a => set.has(a)); }
    if (kind === 'multi') return p.fields.every((f, i) => (f.answers || []).some(a => norm(a) === norm(val[i])));
    return false;
  }
  function solvePuzzle(id) {
    const p = D.puzzles[id];
    if (solved(id)) return;
    setFlag('solved_' + id);
    act(p.onSolve);
    sfx('ok');
    dirty();
  }
  // 返回一个谜题表单元素。opts: {style:'w98'|'bios'|'login'|'bbs', onSolved, submitLabel}
  function puzzleForm(id, opts = {}) {
    const p = D.puzzles[id];
    if (!p) return h('div', { text: _t('（缺少谜题 ') + id + '）' });
    const kind = p.kind || 'text';
    const box = h('div', { class: 'pz' });
    const prompt = h('div', { class: 'prompt', html: fmt(p.prompt || '') });
    const msg = h('div', { class: 'msg' });
    let getVal, focusEl;
    const inputs = h('div');
    if (kind === 'text') {
      const inp = h('input', { class: opts.style === 'bios' ? '' : 'f98', type: 'text', id: 'pz_' + id, placeholder: opts.placeholder || p.placeholder || '', autocomplete: 'off', spellcheck: 'false', style: { width: '100%' } });
      inp.onkeydown = (e) => { if (confirmInput(e)) submit(); };
      inputs.append(inp); getVal = () => inp.value; focusEl = inp;
    } else if (kind === 'choice' || kind === 'pick') {
      const wrap = h('div', { class: 'opts' });
      p.options.forEach((o, i) => wrap.append(h('label', {}, h('input', { type: kind === 'choice' ? 'radio' : 'checkbox', name: 'pz_' + id, value: i, id: `pz_${id}_${i}` }), h('span', { html: fmt(o) }))));
      if (kind === 'pick') wrap.append(h('div', { style: { color: '#555' }, text: `${_t('（选择')} ${p.answerSet.length} ${_t('项）')}` }));
      inputs.append(wrap);
      getVal = () => { const sel = [...wrap.querySelectorAll('input:checked')].map(x => +x.value); return kind === 'choice' ? sel[0] : sel; };
    } else if (kind === 'multi') {
      const g = h('div', { class: 'fields' });
      const ins = p.fields.map((f, i) => { const inp = h('input', { class: 'f98', type: 'text', id: `pz_${id}_${i}`, autocomplete: 'off', placeholder: f.placeholder || '' }); inp.onkeydown = (e) => { if (confirmInput(e)) submit(); }; g.append(h('label', { for: `pz_${id}_${i}`, html: fmt(f.label) }), inp); return inp; });
      inputs.append(g); getVal = () => ins.map(x => x.value); focusEl = ins[0];
    }
    const hintBox = h('div', { class: 'hints' });
    const used = () => S.hints[id] || 0;
    function drawHints() { hintBox.innerHTML = ''; (p.hints || []).slice(0, used()).forEach((t, i) => hintBox.append(h('div', { html: `<b>${_t('提示')} ${i + 1}：</b>` + fmt(t) }))); hintBtn.textContent = used() >= 3 ? _t('提示已用完') : used() === 2 ? _t('看答案') : `${_t('提示（')}${used()}/3）`; hintBtn.disabled = used() >= 3; }
    const hintBtn = controlButton({ class: opts.style === 'bios' ? '' : 'b98' }, () => { if (used() < 3) { S.hints[id] = used() + 1; drawHints(); dirty(); } });
    // 锁的谜题属于还没开始的章节：拒绝任何答案，也不给提示（避免提示提前泄露答案）
    const early = !!(p.requires && (p.requires.match(/\bch\d\b/g) || []).some(c => !S.flags[c]));
    if (early) hintBtn.hidden = true;
    const okBtn = controlButton({ class: opts.style === 'bios' ? '' : 'b98', text: opts.submitLabel || _t('确定') }, submit);
    let submitted = false;
    function submit() {
      if (submitted) return;
      markInteraction();
      const v = getVal();
      if (v == null || (Array.isArray(v) ? !v.length || v.every(x => !String(x).trim()) : !String(v).trim())) { msg.textContent = _t('请先作答。'); return; }
      if (!early && checkPuzzle(p, v)) {
        submitted = true; okBtn.disabled = true;
        msg.className = 'msg ok'; msg.innerHTML = fmt(p.solvedText || _t('正确。'));
        if (opts.onAnswer) opts.onAnswer(v);
        solvePuzzle(id);
        later(() => opts.onSolved && opts.onSolved(), p.solvedText ? 900 : 350);
      } else {
        sfx('err');
        let t = early ? (opts.wrongText || _t('密码错误。')) : (p.wrongText || opts.wrongText || _t('不对。'));
        if (p.near) { const vals = kind === 'multi' ? v : kind === 'text' ? [v] : []; for (const [k, tx] of Object.entries(p.near)) if (vals.some(x => norm(k) === norm(x))) t = tx; }
        msg.className = 'msg'; msg.innerHTML = fmt(t);
        opts.onWrong && opts.onWrong();
      }
    }
    drawHints();
    if (!opts.hidePrompt) box.append(prompt);
    box.append(inputs, msg, hintBox, h('div', { class: 'row' }, hintBtn, opts.extraBtn || null, okBtn));
    box.focusFirst = () => { if (focusEl && !touchKeyboard()) focusEl.focus(); };
    return box;
  }
  function modalRoot() { return $('#modal'); }
  function closeModal() { const m = modalRoot(); if (m) m.innerHTML = ''; }
  function askPuzzle(id, onSolved, phoneStyle, contact) {
    const p = D.puzzles[id];
    if (!p) return toast(_t('缺少谜题 ') + id);
    if (solved(id)) { onSolved && onSolved(); return; }
    const m = modalRoot(); m.innerHTML = '';
    const shade = h('div', { class: 'shade', onclick: () => closeModal() });
    const dlg = h('div', { class: phoneStyle ? 'dlg98 dlgph' : 'dlg98 out', role: 'dialog' });
    const form = puzzleForm(id, { onSolved: () => { if (form.isConnected) closeModal(); onSolved && onSolved(); }, onAnswer: value => {
      const cur = contact && curDlg(contact);
      if (!cur || !S.wait[contact] || S.wait[contact].id !== id) return;
      const text = p.kind === 'choice' ? p.options[value] : p.kind === 'pick' ? value.map(i => p.options[i]).join('、') : Array.isArray(value) ? value.join('，') : String(value).trim();
      pushChat(contact, { from: 'me', text });
    }, onWrong: () => { dlg.classList.remove('shake'); void dlg.offsetWidth; dlg.classList.add('shake'); }, extraBtn: controlButton({ class: 'b98', text: _t('取消') }, closeModal) });
    dlg.append(h('div', { class: 'titlebar' }, h('span', { html: icon('lock') }), h('span', { class: 't', text: p.title || _t('需要密码') }), controlButton({ class: 'b98 tbb', 'aria-label': _t('关闭'), title: _t('关闭'), text: '×' }, closeModal)), h('div', { class: 'wbody' }, form));
    m.append(shade, dlg);
    form.focusFirst();
  }
  function msgBox(title, html, buttons, aboveOverlay) {
    const m = modalRoot(); m.innerHTML = '';
    const dlg = h('div', { class: 'dlg98 out' + (aboveOverlay ? ' raised' : ''), role: 'dialog' });
    const row = h('div', { class: 'row' });
    (buttons || [{ text: _t('确定') }]).forEach(b => row.append(controlButton({ class: 'b98', text: b.text }, () => { closeModal(); b.fn && b.fn(); })));
    dlg.append(h('div', { class: 'titlebar' }, h('span', { class: 't', text: title }), controlButton({ class: 'b98 tbb', 'aria-label': _t('关闭'), title: _t('关闭'), text: '×' }, closeModal)), h('div', { class: 'wbody' }, h('div', { class: 'prompt', html }), row));
    m.append(h('div', { class: 'shade' + (aboveOverlay ? ' raised' : ''), onclick: () => closeModal() }), dlg);
  }
  // 带锁的东西：先解谜再执行
  function withLock(lock, fn) { if (!lock || solved(lock)) return fn(); askPuzzle(lock, fn); }

  // ============================================================
  // 推理板
  // ============================================================
  function openBoard(id) {
    const b = D.boards[id];
    const fill = S.boardFill[id] = S.boardFill[id] || {};
    let active = null;
    const done = () => !!S.flags['board_' + id];
    const wrap = h('div', { class: 'board' });
    const sheet = h('div', { class: 'sheet' });
    wrap.append(sheet);
    const close = () => { closeOverlay(); showCards(); renderAll(); };
    wrap.addEventListener('click', (e) => { if (e.target === wrap) close(); });
    function draw() {
      sheet.innerHTML = '';
      const slotsInText = [...b.text.matchAll(/\{([A-Za-z0-9_]+)\}/g)].map(m => m[1]).filter(s => s !== 'player');
      const html = fmt(b.text).replace(/\{([A-Za-z0-9_]+)\}/g, (m, s) => b.slots[s] ? `<button class="slot" data-s="${s}"></button>` : m);
      const txt = h('div', { class: 'txt', html });
      txt.querySelectorAll('.slot').forEach(el => {
        const s = el.dataset.s; const w = fill[s] || (done() ? [].concat(b.slots[s])[0] : null);
        el.textContent = w ? b.words[w] : '＿＿＿＿';
        el.classList.toggle('empty', !w);
        el.classList.toggle('act', active === s);
        el.onclick = () => { if (done()) return; active = active === s ? null : s; draw(); };
        el.oncontextmenu = (e) => { e.preventDefault(); if (done()) return; delete fill[s]; draw(); };
        el.ondragover = (e) => { e.preventDefault(); el.classList.add('drop'); };
        el.ondragleave = () => el.classList.remove('drop');
        el.ondrop = (e) => { e.preventDefault(); const w2 = e.dataTransfer.getData('text/plain'); if (b.words[w2] && !done()) { fill[s] = w2; active = null; draw(); dirty(); } };
      });
      const res = h('div', { class: 'res' });
      const bar = h('div', { class: 'bar' }, res);
      if (!done()) {
        bar.append(
          h('button', { class: 'bbtn', text: _t('提示'), disabled: (S.hints['board_' + id] || 0) >= (b.hints || []).length, onclick: () => { const n = S.hints['board_' + id] || 0; if (n < (b.hints || []).length) { S.hints['board_' + id] = n + 1; draw(); dirty(); } } }),
          h('button', { class: 'bbtn', text: _t('清空'), onclick: () => { for (const k in fill) delete fill[k]; active = null; draw(); dirty(); } }),
          h('button', { class: 'bbtn pri', text: _t('检查'), onclick: () => check(res) }));
      }
      bar.append(h('button', { class: 'bbtn', text: _t('关闭'), onclick: close }));
      sheet.append(h('h2', { text: b.title }), h('div', { class: 'intro', html: fmt(b.intro || _t('先点一个空格，再点下方的词语填进去；也可以直接把词语拖进空格。右键（或再点一次空格后点"清空"）可以清除。全部填对才算通过。')) }));
      const hn = S.hints['board_' + id] || 0;
      (b.hints || []).slice(0, hn).forEach((t, i) => sheet.append(h('div', { class: 'hintbox', html: `<b>${_t('提示')} ${i + 1}：</b>` + fmt(t) })));
      if (done()) sheet.append(h('div', { class: 'solved', html: (['c2_final', 'c4_final', 'c5_final'].includes(id) ? _t('已整理，仍待核验。') : _t('✔ 推理成立。')) + (b.solvedText ? '<br>' + fmt(b.solvedText) : '') }));
      sheet.append(bar, txt);
      if (!done()) {
        const bank = h('div', { class: 'bank' });
        const used = new Set(Object.values(fill));
        Object.entries(b.words).forEach(([wid, label]) => {
          const chip = h('button', { class: 'chip', draggable: 'true', text: label, style: used.has(wid) ? { opacity: .55 } : null });
          chip.ondragstart = (e) => e.dataTransfer.setData('text/plain', wid);
          chip.onclick = () => {
            let s = active;
            if (!s) s = slotsInText.find(x => !fill[x]);
            if (!s) return;
            fill[s] = wid;
            const nextEmpty = slotsInText.slice(slotsInText.indexOf(s) + 1).find(x => !fill[x]);
            active = nextEmpty || null;
            draw(); dirty();
          };
          bank.append(chip);
        });
        sheet.append(bank);
      }
      if (lastRes) { res.className = 'res ' + lastRes.cls; res.textContent = lastRes.text; }
    }
    let lastRes = null;
    function check() {
      markInteraction();
      const keys = Object.keys(b.slots);
      let ok = 0;
      keys.forEach(s => { if ([].concat(b.slots[s]).includes(fill[s])) ok++; });
      if (ok === keys.length) {
        lastRes = { cls: 'ok', text: _t('全部正确。') };
        setFlag('board_' + id); act(b.onSolve); sfx('ok');
        S.newBoards = Math.max(0, S.newBoards - 1);
        draw(); dirty();
      } else {
        const filled = keys.filter(s => fill[s]).length;
        lastRes = { cls: 'bad', text: `${ok} / ${keys.length} ${_t('处正确')}` + (filled < keys.length ? `${_t('（还有')} ${keys.length - filled} ${_t('处没填）')}` : '') };
        sfx('err'); draw();
      }
    }
    draw();
    openOverlay(wrap);
  }

  // ============================================================
  // 2026 手机
  // ============================================================
  const ui = { tab: 'msg', chat: null, mail: null, item: null, phoneOpen: false, menuView: null, scroll: {}, noteTab: 'questions', noteQuery: '', itemQuery: '', reading: null, clueScope: 'current', clueGroups: {} };
  let running = {}, typing = {}, FAST = false;
  function pushChat(c, m) {
    const t = phoneNow();
    (S.chat[c] = S.chat[c] || []).push(Object.assign({ at: `${t.date} ${t.hm}` }, m));
    const viewing = ui.tab === 'msg' && ui.chat === c && (!narrow() || ui.phoneOpen);
    if (m.from === 'npc' && !viewing) { S.unread[c] = (S.unread[c] || 0) + 1; sfx('msg'); }
    renderPhone();
  }
  // 聊天消息的文字：有引用就按当前语言从对话数据里取，没有就用保存时的文字
  function msgText(m) {
    const R = m.ref, d = R && DLG[R.d], s = d && d.steps[R.i];
    if (!s) return m.text;
    if (R.o != null) { const o = s.choice && s.choice[R.o]; if (!o) return m.text; return R.r != null ? ((o.reply || [])[R.r] ?? m.text) : o.text; }
    const v = m.from === 'npc' ? s.npc : m.from === 'me' ? s.me : s.sys;
    return v != null ? v : m.text;
  }
  function msgHtml(m) { const R = m.ref, d = R && DLG[R.d], s = d && d.steps[R.i]; return s && R.o == null && s.html ? s.html : m.html; }
  function runDialogues() { Object.keys(S.dlgQ).forEach(stepDlg); }
  function curDlg(c) {
    const q = S.dlgQ[c];
    while (q && q.length) { const id = q[0]; const st = S.dlg[id]; if (!DLG[id] || st.done) { q.shift(); continue; } return [DLG[id], st]; }
    return null;
  }
  function typeDelay(text) { return Math.min(2600, 650 + String(text || '').length * 40); }
  // 过期对话：属于更早章节、玩家一直没回复的对话。调查已经推进到后面的章节时，
  // 这些对话快速补播完（回复自动发出、旧选择取不触发结局的选项、旧的等待和问答跳过），
  // 不再挡住本章的消息。本章的对话仍然需要玩家自己发送和选择。
  function isStale(d) {
    const m = /^c(\d)_/.exec(d.id), cur = S.chapter ? +String(S.chapter).replace('ch', '') : 0;
    return !!m && +m[1] < cur;
  }
  function stepDlg(c) {
    if (running[c] || titleOn) return;
    const cur = curDlg(c);
    if (!cur) { delete S.wait[c]; return; }
    const [d, st] = cur;
    const stale = isStale(d);
    const next = () => { st.i++; stepDlg(c); };
    const timed = (ms, fn, showTyping) => {
      if (stale) { ms = 60; showTyping = false; }
      if (FAST) ms = 15;
      running[c] = true; if (showTyping) { typing[c] = true; renderPhone(); }
      later(() => { running[c] = false; typing[c] = false; fn(); save('auto'); }, ms);
    };
    if (Array.isArray(st.rep) && st.rep.length) { const line = st.rep[0]; return timed(typeDelay(line), () => { st.rep.shift(); pushChat(c, { from: 'npc', text: line }); stepDlg(c); }, true); }
    if (st.rep && !Array.isArray(st.rep)) {
      const R = st.rep, o = (d.steps[R.i].choice || [])[R.o], line = o && (o.reply || [])[R.r];
      if (line == null) { delete st.rep; return stepDlg(c); }
      return timed(typeDelay(line), () => { pushChat(c, { from: 'npc', text: line, ref: { d: d.id, i: R.i, o: R.o, r: R.r } }); R.r++; stepDlg(c); }, true);
    }
    const s = d.steps[st.i];
    if (!s) { st.done = 1; setFlag('dlg_' + d.id); S.dlgQ[c].shift(); delete S.wait[c]; dirty(); return stepDlg(c); }
    // Keep existing step indexes for old saves, but do not offer replies about unread evidence.
    if (s.needs && !test(s.needs)) { S.wait[c] = { type: 'evidence', source: s.source }; renderPhone(); return; }
    if (S.wait[c] && S.wait[c].type === 'evidence') delete S.wait[c];
    if (s.npc !== undefined || (s.html && s.me === undefined)) return timed(typeDelay(s.npc), () => { pushChat(c, { from: 'npc', text: s.npc || '', html: s.html, ref: { d: d.id, i: st.i } }); next(); }, true);
    if (s.me !== undefined) {
      if (stale) { delete S.wait[c]; const ref = { d: d.id, i: st.i }; return timed(60, () => { pushChat(c, { from: 'me', text: s.me, html: s.html, ref }); next(); }); }
      S.wait[c] = { type: 'reply' }; renderPhone(); return;
    }
    if (s.sys !== undefined) return timed(400, () => { pushChat(c, { from: 'sys', text: s.sys, ref: { d: d.id, i: st.i } }); next(); });
    if (s.action) { act(s.action); return next(); }
    if (s.delay) return timed(s.delay, next);
    if (s.wait) { if (stale || test(s.wait)) { delete S.wait[c]; return next(); } S.wait[c] = { type: 'wait' }; return; }
    if (s.puzzle) { if (stale || solved(s.puzzle)) { delete S.wait[c]; return next(); } S.wait[c] = { type: 'puzzle', id: s.puzzle }; renderPhone(); return; }
    if (s.choice) {
      if (stale) {
        let k = s.choice.findIndex(o => !(o.action && o.action.ending)); if (k < 0) k = 0;
        const opt = s.choice[k]; delete S.wait[c];
        pushChat(c, { from: 'me', text: opt.text, ref: { d: d.id, i: st.i, o: k } });
        st.rep = (opt.reply || []).length ? { i: st.i, o: k, r: 0 } : null; st.i++;
        act(opt.action); dirty(); return stepDlg(c);
      }
      S.wait[c] = { type: 'choice' }; renderPhone(); return;
    }
    next();
  }
  function sendReply(c, dialogue, step) {
    const cur = curDlg(c); if (!cur || running[c] || titleOn) return;
    const [d, st] = cur, s = d.steps[st.i];
    if (d.id !== dialogue || st.i !== step || !s || s.me === undefined || !S.wait[c] || S.wait[c].type !== 'reply') return;
    markInteraction(); delete S.wait[c];
    const ref = { d: d.id, i: st.i }; st.i++;
    pushChat(c, { from: 'me', text: s.me, html: s.html, ref });
    sfx('click'); dirty(); stepDlg(c);
  }
  function choose(c, idx, dialogue, step) {
    const cur = curDlg(c); if (!cur) return;
    const [d, st] = cur; const s = d.steps[st.i];
    if (running[c] || titleOn || !s || !s.choice || !s.choice[idx] || !S.wait[c] || S.wait[c].type !== 'choice') return;
    if (dialogue != null && (d.id !== dialogue || st.i !== step)) return;
    markInteraction();
    const opt = s.choice[idx];
    delete S.wait[c];
    pushChat(c, { from: 'me', text: opt.text, ref: { d: d.id, i: st.i, o: idx } });
    st.rep = (opt.reply || []).length ? { i: st.i, o: idx, r: 0 } : null; st.i++;
    act(opt.action);
    sfx('click');
    dirty(); stepDlg(c);
  }
  function contactVisible(id) { const c = D.contacts2026[id]; return c && test(c.requires) && ((S.chat[id] && S.chat[id].length) || S.dlgQ[id]); }

  function phoneSearch(label, key, onSearch) {
    const input = h('input', { class: 'ph-search-input', type: 'search', 'aria-label': label, placeholder: label, autocomplete: 'off', value: ui[key] });
    const clear = h('button', { class: 'ph-search-clear', type: 'button', 'aria-label': _t('清空'), text: '×', onclick: () => { input.value = ''; ui[key] = ''; clear.hidden = true; onSearch(''); input.focus(); } });
    clear.hidden = !ui[key];
    input.addEventListener('input', () => { ui[key] = input.value; clear.hidden = !input.value; onSearch(input.value); });
    return h('div', { class: 'ph-search' }, h('span', { class: 'ph-search-icon', 'aria-hidden': 'true', text: '⌕' }), input, clear);
  }
  function searchText(value) { return strip(fmt(value)).normalize('NFKC').toLocaleLowerCase(); }


  // 只导航到已经开放的资料，仍走原有的文件锁、后台登录和谜题入口。
  function goEvidence(source) {
    if (!source) return;
    if (['item', 'mail'].includes(source.type)) {
      const list = source.type === 'item' ? S.items : S.mails;
      if (!list.includes(source.id)) return toast(_t('这份资料尚未收到。'));
      ui.tab = source.type === 'item' ? 'items' : 'mail'; ui.chat = null; ui.reading = null;
      ui.item = source.type === 'item' ? source.id : null; ui.mail = source.type === 'mail' ? source.id : null;
      renderPhone(); return;
    }
    if (source.type === 'chat') { ui.tab = 'msg'; ui.chat = source.id; ui.reading = null; ui.item = null; ui.mail = null; renderPhone(); return; }
    if (source.type === 'board') { if (D.boards[source.id] && test(D.boards[source.id].requires)) openBoard(source.id); return; }
    if (S.stage !== 'win') return;
    if (source.type === 'file') {
      const f = D.files.find(f => f.id === source.id); if (!f || !test(f.requires)) return;
      if (narrow()) togglePhone(false);
      if (f.deleted && !S.flags['restored_' + f.id]) openRecycle(); else openFile(f);
    } else if (source.type === 'props') {
      const f = D.files.find(f => f.id === source.id); if (f && test(f.requires)) showProps(f);
    } else if (source.type === 'url') {
      if (narrow()) togglePhone(false); openIE(source.value);
    } else if (source.type === 'gx') {
      if (narrow()) togglePhone(false); withLock((D.apps.gexun || {}).lock, openGexun);
    }
  }
  function sourceButton(source, label) { return h('button', { class: 'ph-source', type: 'button', text: label || _t('查看原件'), onclick: () => goEvidence(source) }); }
  function noteChapter(id) { const m = /^c([0-6])_/.exec(id); return m ? 'ch' + m[1] : (S.noteCh[id] || S.chapter); }
  function noteSource(id) {
    const has = a => a && [].concat(a.note || []).includes(id);
    for (const f of D.files) { if (has(f.onOpen)) return { type: 'file', id: f.id }; if (has(f.onProps)) return { type: 'props', id: f.id }; }
    for (const t of D.threads) if (has(t.onOpen) || has(t.onSource)) return { type: 'url', value: '/thread.asp?id=' + t.id };
    for (const m of D.mails2026) if (has(m.onOpen)) return { type: 'mail', id: m.id };
    for (const it of D.items2026) if (has(it.onOpen)) return { type: 'item', id: it.id };
    for (const l of D.gxLogs) if (has(l.onOpen)) return { type: 'gx', id: l.id };
    return null;
  }
  function renderJournal(body) {
    const journal = D.journal[S.chapter]; if (!journal) return;
    const next = (journal.steps || []).find(s => !test(s.until));
    body.append(h('section', { class: 'ph-journal' },
      h('div', { class: 'k', text: _t('本章调查') }), h('h3', { text: journal.question }),
      h('p', { text: next ? next.text : _t('这一章已经整理完。可以回看原件，或继续手机里的对话。') }),
      next && next.source ? sourceButton(next.source, _t('前往资料')) : null));
    const facts = (journal.facts || []).filter(f => test(f.requires));
    if (facts.length) body.append(h('details', { class: 'ph-facts', open: true },
      h('summary', { text: _t('目前能确认的事') + ' · ' + facts.length }),
      h('ul', {}, facts.map(f => h('li', { text: f.text })))));
  }
  function renderClues(body, controls) {
    const results = h('div', { class: 'ph-search-results' });
    const scope = h('select', { class: 'ph-scope', 'aria-label': _t('线索范围') },
      h('option', { value: 'current', text: _t('本章线索') }), h('option', { value: 'all', text: _t('全部已发现线索') }));
    D.chapters.filter(c => S.notes.some(id => noteChapter(id) === c.id)).forEach(c => scope.append(h('option', { value: c.id, text: c.num + ' · ' + c.name })));
    scope.value = ui.clueScope;
    const show = query => {
      results.innerHTML = ''; const q = searchText(query).trim();
      const ids = S.notes.slice().reverse().filter(id => {
        if (!D.notes[id]) return false;
        const ch = noteChapter(id), c = D.chapters.find(c => c.id === ch);
        return (ui.clueScope === 'all' || ch === (ui.clueScope === 'current' ? S.chapter : ui.clueScope))
          && (!q || searchText((c ? c.num + ' ' + c.name : '') + ' ' + D.notes[id].text).includes(q));
      });
      for (const c of D.chapters.slice().reverse()) {
        const group = ids.filter(id => noteChapter(id) === c.id); if (!group.length) continue;
        const opened = !!q || ui.clueScope !== 'all' || c.id === S.chapter || !!ui.clueGroups[c.id];
        const section = h('details', { class: 'ph-clue-group', open: opened },
          h('summary', { text: c.num + ' · ' + c.name + ' · ' + group.length }));
        section.addEventListener('toggle', () => { ui.clueGroups[c.id] = section.open; });
        group.forEach(id => {
          const source = noteSource(id);
          section.append(h('div', { class: 'ph-card', 'data-note': id },
            h('div', { class: 'k', text: c.num }), h('div', { html: fmt(D.notes[id].text) }), source ? sourceButton(source) : null));
        });
        results.append(section);
      }
      if (!ids.length) results.append(h('div', { class: 'ph-card done', text: q ? _t('没有找到。') : _t('这里还没有线索。可以切换范围回看之前的记录。') }));
      body.scrollTop = 0;
    };
    scope.onchange = () => { ui.clueScope = scope.value; show(ui.noteQuery); };
    controls.append(scope, phoneSearch(_t('搜索') + ' ' + _t('线索'), 'noteQuery', show)); body.append(results); show(ui.noteQuery);
  }
  function renderReadings(body) {
    const readings = D.readings.filter(r => test(r.requires));
    if (ui.reading) {
      const r = readings.find(r => r.id === ui.reading);
      if (!r) { ui.reading = null; return; }
      S.readingSeen = S.readingSeen || {}; S.readingSeen[r.id] = true;
      const f = r.file && D.files.find(f => f.id === r.file && test(f.requires));
      const article = h('article', { class: 'ph-reading' },
        h('div', { class: 'ph-reading-source', text: r.date + ' · ' + r.source }),
        f ? h('div', { class: 'ph-reading-original', html: fmt(f.html || '<pre>' + esc(f.text || '') + '</pre>') }) : null,
        h('div', { html: fmt(r.html) }));
      body.append(article); bindImageZoom(article); save('auto'); return;
    }
    body.append(h('div', { class: 'ph-reading-hint', text: _t('这些是资料里的日常片段。读过的会留在这里，可以随时回来。') }));
    D.chapters.forEach(c => {
      const rows = readings.filter(r => r.chapter === c.id); if (!rows.length) return;
      body.append(h('div', { class: 'ph-sec', text: c.num + ' · ' + c.name }));
      rows.forEach(r => body.append(h('button', { class: 'ph-reading-tile', type: 'button', onclick: () => { ui.reading = r.id; renderPhone(); } },
        h('span', { text: r.title }), h('small', { text: (S.readingSeen || {})[r.id] ? _t('已读') : _t('未读') }),
        r.intro ? h('p', { text: r.intro }) : null)));
    });
    if (!readings.length) body.append(h('div', { class: 'ph-empty', text: _t('读到相应的原始资料以后，旧事会慢慢出现。') }));
  }

  function renderPhone() {
    const ph = $('#phone'); if (!ph || !S) return;
    const t = phoneNow();
    $('#phStatus').innerHTML = `<span><b>${t.hm}</b>　${t.date} ${t.wk}</span><span>5G　86%</span>`;
    if (ui.tab === 'msg' && ui.chat && (!narrow() || ui.phoneOpen)) S.unread[ui.chat] = 0;
    const unreadMsg = Object.values(S.unread).reduce((a, b) => a + b, 0);
    const unreadMail = S.mails.filter(m => !S.mailRead[m]).length;
    const newItems = S.items.filter(i => !S.itemSeen[i]).length;
    const waiting = Object.keys(S.wait).filter(c => S.wait[c] && S.wait[c].type !== 'wait').length;
    const badges = { msg: unreadMsg || (waiting ? '!' : 0), mail: unreadMail, items: newItems, notes: S.newNotes, boards: S.newBoards, menu: 0 };
    const tabs = $('#phTabs'); tabs.innerHTML = '';
    [['msg', _t('消息')], ['mail', _t('邮件')], ['items', _t('物品')], ['notes', _t('笔记')], ['boards', _t('推理')], ['menu', _t('菜单')]].forEach(([k, n]) => {
      const b = h('button', { class: ui.tab === k ? 'on' : '', html: phIcon(k) + `<span>${n}</span>`, onclick: () => { ui.tab = k; ui.chat = null; ui.mail = null; ui.item = null; ui.menuView = null; ui.reading = null; if (k === 'notes') S.newNotes = 0; if (k === 'boards') S.newBoards = 0; renderPhone(); } });
      if (badges[k]) b.append(h('span', { class: 'badge', text: String(badges[k]) }));
      tabs.append(b);
    });
    const fab = $('#phoneFab'); if (fab) { fab.hidden = narrow() && ui.phoneOpen; fab.innerHTML = phIcon('phone'); const n = unreadMsg + unreadMail + (waiting ? 1 : 0); if (n) fab.append(h('span', { class: 'badge', text: String(n) })); }
    const head = $('#phHead'), body = $('#phBody'), foot = $('#phFoot');
    const viewKey = ui.tab + ':' + (ui.chat || ui.mail || ui.item || ui.menuView || (ui.tab === 'notes' ? ui.noteTab + ':' + (ui.reading || '') : ''));
    const sameView = ui._viewKey === viewKey;
    const keepBottom = body.scrollHeight - body.scrollTop - body.clientHeight < 40;
    const prevScroll = body.scrollTop;
    if (ui._viewKey) ui.scroll[ui._viewKey] = prevScroll;
    // 来消息时保留正在输入的存档码等表单；切换页面时照常刷新。
    if (sameView && body.contains(document.activeElement) && /INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) return;
    body.onscroll = null;
    head.innerHTML = ''; body.innerHTML = ''; foot.innerHTML = ''; foot.hidden = true;
    const closeBtn = h('button', { class: 'ph-close', text: _t('收起'), onclick: () => togglePhone(false) });
    const title = (txt, sub, back) => { if (back) head.append(h('button', { class: 'ph-back', text: '‹', 'aria-label': _t('返回'), onclick: back })); head.append(h('h2', {}, txt, sub ? h('small', { text: sub }) : null), closeBtn); };
    let stick = false;
    if (ui.tab === 'msg') {
      if (ui.chat) {
        const c = ui.chat, info = D.contacts2026[c];
        title(info.name, typing[c] ? _t('对方正在输入…') : info.sub, () => { ui.chat = null; renderPhone(); });
        const box = h('div', { class: 'chat' });
        let lastDay = '';
        (S.chat[c] || []).forEach(m => {
          const day = (m.at || '').split(' ')[0];
          if (day && day !== lastDay) { box.append(h('div', { class: 'chat-day', text: day })); lastDay = day; }
          const b = h('div', { class: 'bub ' + m.from, title: m.at || '' });
          const mt = msgText(m), mh = msgHtml(m);
          if (mt) b.append(h('span', { html: fmt(esc(mt)).replace(/&lt;br&gt;/g, '\n') }));
          if (mh) {
            b.classList.add('media');
            const pic = h('div', { class: 'pic', html: fmt(mh), role: 'button', tabindex: 0, 'aria-label': _t('放大图片') });
            const open = () => viewImage(fmt(mh)); pic.onclick = open;
            pic.onkeydown = e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } };
            b.append(pic);
          }
          box.append(b);
        });
        if (typing[c]) box.append(h('div', { class: 'bub npc typing', html: '<i></i><i></i><i></i>' }));
        body.append(box);
        const w = S.wait[c];
        if (w && (w.type === 'choice' || w.type === 'reply')) {
          const [d, st] = curDlg(c) || [];
          if (d) {
            const step = st.i;
            foot.hidden = false; foot.append(h('div', { class: 'ph-reply-label', text: _t('点击发送回复') }));
            if (w.type === 'reply') foot.append(h('button', { class: 'ph-btn', html: fmt(esc(d.steps[step].me)), onclick: () => sendReply(c, d.id, step) }));
            else d.steps[step].choice.forEach((o, i) => foot.append(h('button', { class: 'ph-btn', html: fmt(esc(o.text)), onclick: () => choose(c, i, d.id, step) })));
          }
        } else if (w && w.type === 'evidence') {
          foot.hidden = false; foot.append(sourceButton(w.source));
        } else if (w && w.type === 'puzzle') {
          const p = D.puzzles[w.id];
          foot.hidden = false; foot.append(h('button', { class: 'ph-btn pri', text: _t('回答：') + (p ? p.title : ''), onclick: () => askPuzzle(w.id, null, true, c) }));
        }
        stick = true;
      } else {
        title(_t('消息'));
        const list = h('div', { class: 'ph-list' });
        Object.keys(D.contacts2026).filter(contactVisible).forEach(id => {
          const info = D.contacts2026[id]; const log = S.chat[id] || []; const last = log[log.length - 1];
          const w = S.wait[id] && S.wait[id].type !== 'wait';
          list.append(h('button', { class: 'ph-item', onclick: () => { ui.chat = id; renderPhone(); } },
            h('div', { class: 'av', text: info.avatar || info.name[0] }),
            h('div', { class: 'mid' }, h('b', { text: info.name }), h('span', { text: typing[id] ? _t('对方正在输入…') : w ? _t('【等你回复】') : last ? (last.from === 'me' ? _t('我：') : '') + (msgText(last) || _t('[图片]')) : '' })),
            h('div', { class: 'rt' }, h('span', { text: last ? (last.at || '').split(' ')[1] || '' : '' }), S.unread[id] ? h('span', { class: 'cnt', text: String(S.unread[id]) }) : null)));
        });
        if (!list.children.length) list.append(h('div', { class: 'ph-empty', text: _t('暂无消息') }));
        body.append(list);
      }
    } else if (ui.tab === 'mail') {
      if (ui.mail) {
        const m = MAIL26[ui.mail]; S.mailRead[ui.mail] = 1; opened(m.id, m.onOpen);
        title(strip(fmt(m.subject)), '', () => { ui.mail = null; renderPhone(); });
        body.append(h('div', { class: 'ph-mail' }, h('div', { class: 'mh', html: `${_t('发件人：')}${esc(m.from)}<br>${_t('时间：')}${esc(m.date || '')}<br>${_t('主题：')}${fmt(m.subject)}` }), h('div', { html: fmt(m.html) })));
        bindImageZoom(body.querySelector('.ph-mail'));
      } else {
        title(_t('邮件'), `${_t('收件箱')} ${S.mails.length}`);
        const list = h('div', { class: 'ph-list' });
        S.mails.slice().reverse().forEach(id => {
          const m = MAIL26[id]; if (!m) return;
          list.append(h('button', { class: 'ph-item', onclick: () => { ui.mail = id; renderPhone(); } },
            h('div', { class: 'av', text: '✉' }),
            h('div', { class: 'mid' }, h('b', { text: strip(fmt(m.subject)), style: S.mailRead[id] ? { fontWeight: 400 } : null }), h('span', { text: m.from })),
            h('div', { class: 'rt' }, h('span', { text: (m.date || '').slice(5, 16) }), !S.mailRead[id] ? h('span', { class: 'cnt', text: _t('新') }) : null)));
        });
        if (!list.children.length) list.append(h('div', { class: 'ph-empty', text: _t('收件箱是空的') }));
        body.append(list);
      }
    } else if (ui.tab === 'items') {
      if (ui.item) {
        const it = ITEM[ui.item]; S.itemSeen[it.id] = 1; opened(it.id, it.onOpen);
        title(strip(fmt(it.name)), '', () => { ui.item = null; renderPhone(); });
        const v = h('div', { class: 'ph-view', html: fmt(it.html) });
        bindImageZoom(v);
        body.append(v);
      } else {
        title(_t('物品'), _t('手边的实物和照片'));
        const results = h('div', { class: 'ph-search-results' });
        const showItems = query => {
          results.innerHTML = ''; const g = h('div', { class: 'ph-grid' }), q = searchText(query).trim();
          S.items.forEach(id => { const it = ITEM[id]; if (!it || (q && !searchText(it.name + ' ' + it.html).includes(q))) return; g.append(h('button', { class: 'ph-tile' + (S.itemSeen[id] ? '' : ' new'), onclick: () => { ui.item = id; renderPhone(); } }, h('span', { html: fmt(it.name) }), h('small', { text: S.itemSeen[id] ? _t('已查看') : _t('未查看') }))); });
          results.append(g.children.length ? g : h('div', { class: 'ph-empty', text: S.items.length ? _t('没有找到。') : _t('还没有东西') }));
        };
        body.append(h('div', { class: 'ph-search-bar' }, phoneSearch(_t('搜索') + ' ' + _t('物品'), 'itemQuery', showItems)), results);
        showItems(ui.itemQuery);
      }
    } else if (ui.tab === 'notes') {
      const reading = D.readings.find(r => r.id === ui.reading && test(r.requires));
      title(reading ? reading.title : _t('笔记'), currentChapterLabel(), reading ? () => { ui.reading = null; renderPhone(); } : null);
      const asks = Object.entries(D.puzzles).filter(([id, p]) => p.ask && test(p.requires) && !solved(id));
      const total = Object.keys(D.collectibles).length;
      const controls = h('div', { class: 'ph-note-controls' });
      const pages = h('div', { class: 'ph-note-tabs', 'aria-label': _t('笔记') });
      [['questions', _t('待解决的问题'), asks.length], ['clues', _t('线索'), S.notes.length], ['readings', _t('旧事'), D.readings.filter(r => test(r.requires)).length], ['poems', _t('林晚的诗稿'), S.collected.length + ' / ' + total]].forEach(([key, label, count]) => {
        pages.append(h('button', { type: 'button', class: key === ui.noteTab ? 'on' : '', 'aria-pressed': key === ui.noteTab ? 'true' : 'false', onclick: () => { ui.noteTab = key; ui.reading = null; renderPhone(); } }, h('span', { text: label }), h('small', { text: count })));
      });
      controls.append(pages); body.append(controls);
      if (ui.noteTab === 'questions') {
        renderJournal(body);
        if (!asks.length) body.append(h('div', { class: 'ph-card done', text: _t('暂时没有。去 3 号机里找找线索，或者看看推理板。') }));
        const addQuestions = (list, host) => list.forEach(([id, p]) => host.append(h('div', { class: 'ph-card q', role: 'button', tabindex: 0, onclick: () => askPuzzle(id, null, true), onkeydown: (e) => { if (e.key === 'Enter') askPuzzle(id, null, true); } }, h('div', { class: 'k', text: _t('点击作答') }), h('div', { html: fmt(p.title) }))));
        addQuestions(asks.filter(([id]) => noteChapter(id) === S.chapter), body);
        const old = asks.filter(([id]) => noteChapter(id) !== S.chapter);
        if (old.length) { const fold = h('details', { class: 'ph-facts' }, h('summary', { text: _t('之前未解的问题') + ' · ' + old.length })); addQuestions(old, fold); body.append(fold); }
      } else if (ui.noteTab === 'clues') {
        renderClues(body, controls);
      } else if (ui.noteTab === 'readings') {
        renderReadings(body);
      } else {
        S.collected.forEach(cid => { const c = D.collectibles[cid]; if (!c) return; body.append(h('div', { class: 'ph-card' }, h('div', { class: 'k', text: c.where || '' }), h('div', { style: { fontWeight: 600 }, html: fmt(c.title) }), h('div', { style: { whiteSpace: 'pre-wrap', fontFamily: 'var(--font-hand)', fontSize: '15px', marginTop: '4px' }, html: fmt(c.text || '') }))); });
        if (!S.collected.length) body.append(h('div', { class: 'ph-card done', text: _t('林晚的诗散落在 3 号机的各个角落。有的藏得很深。') }));
      }
    } else if (ui.tab === 'boards') {
      title(_t('推理'), _t('把线索拼成结论'));
      const list = Object.entries(D.boards).filter(([id, b]) => test(b.requires));
      if (!list.length) body.append(h('div', { class: 'ph-empty', html: _t('每章收集到足够线索后，<br>这里会出现推理板。') }));
      list.reverse().forEach(([id, b]) => {
        const ok = S.flags['board_' + id];
        body.append(h('div', { class: 'ph-card q' + (ok ? ' done' : ''), role: 'button', tabindex: 0, style: ok ? { borderLeftColor: 'var(--ph-good)' } : null, onclick: () => openBoard(id), onkeydown: (e) => { if (e.key === 'Enter') openBoard(id); } },
          h('div', { class: 'k', text: ok ? _t('已完成') : _t('进行中 · 点击打开') }), h('div', { style: { fontWeight: 600 }, text: b.title })));
      });
    } else if (ui.tab === 'menu') {
      renderMenu(title, body);
    }
    if (stick) {
      if (sameView) body.scrollTop = keepBottom ? body.scrollHeight : prevScroll;
      else body.scrollTop = ui.scroll[viewKey] == null ? body.scrollHeight : ui.scroll[viewKey];
      const latest = h('button', { class: 'chat-latest', text: _t('最新 ↓'), onclick: () => { body.scrollTop = body.scrollHeight; } });
      head.append(latest);
      body.onscroll = () => { latest.hidden = body.scrollHeight - body.scrollTop - body.clientHeight < 40; ui.scroll[viewKey] = body.scrollTop; };
      body.onscroll();
    } else body.scrollTop = sameView ? prevScroll : (ui.scroll[viewKey] || 0);
    ui._viewKey = viewKey;
  }
  function currentChapterLabel() { const c = D.chapters.find(x => x.id === S.chapter); return c ? `${c.num} · ${c.name}` : ''; }
  function renderMenu(title, body) {
    title(_t('菜单'), currentChapterLabel());
    const sec = (t) => body.append(h('div', { class: 'ph-sec', html: `<span>${t}</span>` }));
    sec(_t('存档'));
    body.append(h('div', { class: 'ph-card', text: _t('提示次数') + '：' + hintCount() }));
    const auto = readSave('auto');
    body.append(h('div', { class: 'ph-card slot-card' }, h('div', {}, h('div', { class: 'k', text: _t('自动存档（每一步都会自动保存）') }), h('div', { text: describe(auto) }))));
    ['s1', 's2', 's3'].forEach((k, i) => {
      const s = readSave(k);
      body.append(h('div', { class: 'ph-card slot-card' },
        h('div', { style: { minWidth: 0 } }, h('div', { class: 'k', text: `${_t('存档位')} ${i + 1}` }), h('div', { text: describe(s) })),
        h('div', { class: 'ph-row' },
          h('button', { class: 'ph-btn sm', text: _t('保存'), onclick: () => { if (writeSave(k)) { toast(`${_t('已保存到存档位')} ${i + 1}`, 'good'); renderPhone(); } } }),
          s ? h('button', { class: 'ph-btn sm', text: _t('读取'), onclick: () => { const o = readSave(k); if (o) { loadState(o); toast(_t('已读取存档位 ') + (i + 1)); } } }) : null)));
    });
    body.append(h('div', { class: 'ph-row', style: { marginBottom: '8px' } },
      h('button', { class: 'ph-btn sm', text: _t('导出存档文件'), onclick: exportSave }),
      h('button', { class: 'ph-btn sm', text: _t('导入存档文件'), onclick: () => importFile() })));
    if (ui.menuView === 'code') {
      tickPlay();
      const ta = h('textarea', { class: 'ph-input', id: 'saveCode', rows: 4, readonly: true }); ta.value = b64e(JSON.stringify(S));
      const tb = h('textarea', { class: 'ph-input', id: 'loadCode', rows: 3, placeholder: _t('把存档码粘贴到这里') });
      body.append(h('div', { class: 'ph-card' }, h('div', { class: 'k', text: _t('当前存档码（复制保存到任何地方）') }), ta,
        h('div', { class: 'ph-row', style: { margin: '6px 0 10px' } }, h('button', { class: 'ph-btn sm', text: _t('复制'), onclick: () => { ta.select(); (navigator.clipboard ? navigator.clipboard.writeText(ta.value) : Promise.reject()).then(() => toast(_t('已复制')), () => { document.execCommand && document.execCommand('copy'); toast(_t('已选中，请手动复制')); }); } })),
        h('div', { class: 'k', text: _t('读取存档码') }), tb,
        h('div', { class: 'ph-row', style: { marginTop: '6px' } }, h('button', { class: 'ph-btn sm', text: _t('读取'), onclick: () => { try { const o = JSON.parse(b64d(tb.value)); if (!o.v) throw 0; loadState(o); toast(_t('存档码已读取')); } catch (e) { toast(_t('存档码无效')); } } }))));
    } else body.append(h('button', { class: 'ph-btn sm', style: { width: '100%', marginBottom: '8px' }, text: _t('存档码（复制 / 粘贴）'), onclick: () => { ui.menuView = 'code'; renderPhone(); } }));
    sec(_t('设置'));
    body.append(h('div', { class: 'ph-card slot-card' }, h('div', { text: _t('音效') }), h('button', { class: 'ph-btn sm', text: S.sound ? _t('开') : _t('关'), onclick: () => { S.sound = !S.sound; renderPhone(); save('auto'); } })));
    sec(_t('结局收集'));
    body.append(endingList());
    sec(_t('其他'));
    body.append(h('div', { class: 'ph-card', html: helpText() }));
    body.append(h('button', { class: 'ph-btn sm', style: { width: '100%' }, text: _t('返回标题画面'), onclick: () => { writeSave('auto'); showTitle(); } }));
  }
  function helpText() {
    return _t('<b>怎么玩</b><br>左边是 3 号机（Win98）：双击图标打开，窗口可以拖动。右键（手机上长按）文件可以看"属性"。IE 的地址栏可以手动输入网址，菜单"查看→源文件"能看网页源代码。资源管理器"查看"菜单里可以显示隐藏文件。<br>右边是你的手机：委托人会在"消息"里联系你；"笔记"里有待解决的问题和自动记录的线索；"推理"里是每章的推理板。<br>卡住时，每道题都有三级提示。');
  }
  function endingList() {
    const m = meta(); const got = (m && m.endings) || {};
    const g = h('div', { class: 'endgrid' });
    [['A', _t('结局 A')], ['B', _t('结局 B')], ['C', _t('结局 C')], ['H', _t('隐藏结局')]].forEach(([k, n]) => {
      const e = D.endings[k];
      g.append(h('div', { class: got[k] ? '' : 'no' }, h('span', { text: n }), h('span', { text: got[k] && e ? (LANG === 'en' ? '“' + e.title + '”' : '「' + e.title + '」') : _t('未达成') })));
    });
    return g;
  }
  function togglePhone(on) { ui.phoneOpen = on == null ? !ui.phoneOpen : on; $('#phone').classList.toggle('open', ui.phoneOpen); renderPhone(); }

  // ============================================================
  // 标题画面
  // ============================================================
  let titleOn = false;
  function showTitle() {
    if (S && !titleOn && lastTick) writeSave('auto');
    tickPlay(); playClockRunning = false;
    window.Y2KStats?.setPlaying(false);
    titleOn = true; closeOverlay(); closeModal();
    clearTimers(); running = {}; typing = {};
    clearTimeout(dirtyT); dirtyT = 0;
    clearTimeout(saveT); saveT = 0;
    const tl = $('#title'); tl.hidden = false; tl.innerHTML = ''; tl.classList.remove('panel-open');
    tl.style.backgroundImage = window.Y2K_PHOTOS?.title_cover ? 'linear-gradient(90deg, rgba(5,7,9,.82), rgba(5,7,9,.60)), url("' + window.Y2K_PHOTOS.title_cover.data + '")' : '';
    const titleStart = Date.parse('2026-10-27T21:40:00Z'), titleOpened = Date.now();
    const titleTime = () => new Date(titleStart + Date.now() - titleOpened).toISOString().slice(0, 19).replace('T', ' ');
    const clk = h('div', { class: 'clock', text: titleTime() });
    const iv = setInterval(() => { if (!titleOn || !clk.isConnected) return clearInterval(iv); clk.textContent = titleTime(); }, 1000);
    const auto = readSave('auto');
    const menu = h('div', { class: 'menu' });
    const panel = h('div');
    menu.append(
      h('button', { class: 'tbtn', text: _t('继续调查'), disabled: !auto, onclick: () => { const o = readSave('auto'); if (o) loadState(o); } }),
      h('button', { class: 'tbtn', text: _t('新的调查'), onclick: e => newGamePanel(panel, !!auto, e.currentTarget) }),
      h('button', { class: 'tbtn', text: _t('读取存档'), onclick: e => loadPanel(panel, e.currentTarget) }),
      h('button', { class: 'tbtn', text: _t('结局收集'), onclick: e => titlePanel(panel, _t('结局收集'), e.currentTarget).append(endingList()) }));
    const leaderboard = h('button', { class: 'tbtn leaderboard-entry', text: _t('排行榜'), onclick: e => window.Y2KLeaderboard?.mount(titlePanel(panel, _t('排行榜'), e.currentTarget), LANG) });
    // 语言切换：存进 meta，然后重新载入（译文在启动时写回数据）
    const langs = h('div', { class: 'langs', role: 'group', 'aria-label': 'Language' });
    langs.hidden = READY.length < 2;
    Object.entries(LANGS).filter(([code]) => READY.includes(code)).forEach(([code, label]) => langs.append(h('button', { class: 'lbtn' + (code === LANG ? ' on' : ''), lang: code, 'aria-pressed': code === LANG ? 'true' : 'false', text: label, onclick: () => { if (code === LANG) return; const m = meta(); m.lang = code; setMeta(m); location.reload(); } })));
    tl.append(h('div', { class: 'title-topbar' }, leaderboard, langs), h('div', { class: 'title-content' }, clk, h('h1', { html: _t('千年<span>虫</span> 1') }), h('div', { class: 'sub', text: _t('梧城七中 · 1999—2000') }), menu, panel, window.Y2KStats?.mount(LANG),
      h('div', { class: 'foot' },
        h('div', { class: 'community', text: _t('QQ群') + '：1130040971' }),
        h('div', { text: _t('本作纯属虚构 · 建议用电脑上的 Chrome / Edge 打开 · 进度自动保存在本浏览器') }))));
    return panel;
  }
  function showAuthorNote(panel, onClose) {
    // 只在本标签页第一次打开时展示；不写入玩家存档，也不在返回标题时调用。
    try {
      if (sessionStorage.getItem('y2k_author_note_seen')) return false;
      sessionStorage.setItem('y2k_author_note_seen', '1');
    } catch (e) {
      // 禁用会话存储时仍允许游玩，并避免刷新或浏览器后退时重复提示。
      const navigation = performance.getEntriesByType?.('navigation')[0];
      if (navigation && navigation.type !== 'navigate') return false;
    }
    const body = titlePanel(panel, _t('作者的话'), $('#title .menu button:not(:disabled)'), onClose);
    body.parentElement.classList.add('author-note');
    body.append(
      h('p', { text: _t('大家好，我是《千年虫》的作者 shark，目前是北京大学的一名在校生。') }),
      h('p', { text: _t('谢谢大家的支持，也很高兴有这么多人喜欢这个题材。这个故事和剧本花了很长时间打磨，但仍有不少可以改进的地方。无论是剧情中没讲清楚的细节、谜题的难度，还是游玩时遇到的问题，我都很想听听大家的真实感受。') }),
      h('p', { text: _t('《千年虫》计划做成三部曲，目前第二部还在制作中。希望能把后面的故事认真写好，也期待和大家一起讨论它接下来的样子。') }),
      h('p', {}, _t('欢迎加入 QQ 交流群：'), h('strong', { class: 'author-note-qq', text: '1130040971' }), h('br'), _t('聊聊剧情，交流解谜心得，也欢迎直接提意见。')),
      h('p', { text: _t('感谢你愿意花时间走进这个故事。') }),
      h('div', { class: 'author-note-signature' }, h('div', { text: '—— shark🦈' }), h('time', { datetime: '2026-10', text: _t('2026年10月') })));
    return true;
  }
  function hideTitle() { titleOn = false; syncPlayClock(); const tl = $('#title'); tl.hidden = true; tl.innerHTML = ''; tl.classList.remove('panel-open'); window.Y2KStats?.setPlaying(true); showCards(); }
  function titlePanel(host, title, opener, onClose) {
    host.innerHTML = '';
    const tl = $('#title'); tl.classList.add('panel-open');
    const close = () => { host.innerHTML = ''; tl.classList.remove('panel-open'); if (opener?.isConnected) opener.focus(); onClose?.(); };
    const closeBtn = controlButton({ class: 'tbtn title-panel-close', text: '×', 'aria-label': _t('关闭'), title: _t('关闭') }, close);
    const body = h('div', { class: 'title-panel-body' });
    const dlg = h('div', { class: 'panel title-panel', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'title-panel-heading' },
      h('div', { class: 'title-panel-head' }, h('h3', { id: 'title-panel-heading', text: title }), closeBtn), body);
    const layer = h('div', { class: 'title-panel-layer' }, dlg);
    layer.addEventListener('keydown', e => {
      if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); close(); }
      if (e.key === 'Tab') {
        const stops = [...dlg.querySelectorAll('button:not(:disabled), input:not(:disabled), textarea:not(:disabled), select:not(:disabled), a[href], [tabindex="0"]')];
        const first = stops[0], last = stops[stops.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
    host.append(layer); closeBtn.focus(); return body;
  }
  function newGamePanel(panel, hasSave, opener) {
    const inp = h('input', { type: 'text', id: 'nick', maxlength: 12, placeholder: _t('老K'), value: '' });
    const go = () => {
      const name = inp.value.trim() || _t('老K');
      LS.del(KEY.pre);
      loadState(fresh(name));
    };
    inp.onkeydown = (e) => { if (confirmInput(e)) go(); };
    titlePanel(panel, _t('你的昵称'), opener).append(
      h('div', { class: 'muted', text: _t('你是一个做"老电脑考古"视频的 UP 主。委托人会这样称呼你。') }), h('div', { style: { height: '8px' } }), inp,
      ...(hasSave ? [h('div', { class: 'muted', style: { marginTop: '8px' }, text: _t('注意：开始新调查会覆盖自动存档（手动存档位不受影响）。') })] : []),
      h('div', { class: 'row' }, h('button', { class: 'tbtn', text: _t('开始'), onclick: go })));
    if (!touchKeyboard()) inp.focus();
  }
  function loadPanel(panel, opener) {
    const p = titlePanel(panel, _t('读取存档'), opener);
    [['auto', _t('自动存档')], ['s1', _t('存档位 1')], ['s2', _t('存档位 2')], ['s3', _t('存档位 3')]].forEach(([k, n]) => {
      const s = readSave(k);
      p.append(h('div', { class: 'endgrid' }, h('div', { class: s ? '' : 'no' }, h('span', { text: n + '　' + describe(s) }), s ? h('button', { class: 'tbtn', style: { padding: '4px 10px' }, text: _t('读取'), onclick: () => loadState(readSave(k)) }) : null)));
    });
    const tb = h('textarea', { class: 'ph-input', rows: 3, placeholder: _t('或者粘贴存档码'), id: 'titleCode' });
    p.append(h('div', { class: 'row', style: { justifyContent: 'flex-start' } }, h('button', { class: 'tbtn', text: _t('导入存档文件'), onclick: () => importFile() })), h('div', { style: { height: '8px' } }), tb,
      h('div', { class: 'row' }, h('button', { class: 'tbtn', text: _t('读取存档码'), onclick: () => { try { const o = JSON.parse(b64d(tb.value)); if (!o.v) throw 0; loadState(o); } catch (e) { toast(_t('存档码无效')); } } })));
  }

  // ============================================================
  // 3 号机：屏幕阶段
  // ============================================================
  function screen() { return $('#screen'); }
  function renderScreen() {
    const sc = screen(); sc.innerHTML = '';
    $('#led').classList.toggle('on', S.stage !== 'off');
    if (S.stage === 'off') {
      sc.append(h('div', { class: 'off' },
        controlButton({ class: 'power', 'aria-label': _t('开机'), html: '⏻' }, powerOn),
        h('div', { html: _t('3 号机已接好电源和显示器。<br>按下电源键开机。') })));
    } else if (S.stage === 'win') {
      buildDesktop();
    } else {
      S.stage = 'off'; renderScreen();
    }
  }
  function powerOn() {
    markInteraction();
    S.stage = 'boot'; $('#led').classList.add('on');
    const sc = screen(); sc.innerHTML = '';
    const bios = h('div', { class: 'bios' }); sc.append(bios);
    const lines = [
      '<span class="hl">KITE Modular BIOS v4.51PG</span>', 'Copyright (C) 1994-98, KITE Software, Inc.', '',
      'Main Processor : Pentium-MMX 200MHz', 'Memory Testing :  32768K OK', '',
      'Primary Master : ST34321A  (4.3GB)', 'Primary Slave  : None', 'Floppy Drive A : 1.44M, 3.5 in.', '',
      '<span class="hl">CMOS Battery Low!</span>', 'Real Time Clock stopped at : Wed Apr 05 2000  07:40', '',
    ];
    let i = 0;
    const tick = () => {
      if (i < lines.length) { bios.innerHTML += lines[i++] + '\n'; later(tick, 180); return; }
      if (D.boot.biosLock && !solved(D.boot.biosLock)) showBiosPass(bios); else afterBios(bios);
    };
    tick();
  }
  function showBiosPass(bios) {
    const id = D.boot.biosLock;
    const box = h('div', { class: 'bios-pass' });
    const form = puzzleForm(id, { style: 'bios', hidePrompt: true, submitLabel: 'Enter', wrongText: _t('Password incorrect. 密码错误。'), onSolved: () => { box.remove(); afterBios(bios); } });
    box.append(h('div', { text: _t('══ Enter Password 开机密码 ══') }), form);
    screen().append(box); form.focusFirst();
  }
  function afterBios(bios) {
    bios.innerHTML += '\nVerifying DMI Pool Data ........\nBoot from Hard Disk...\nStarting Windows 98...\n';
    later(() => {
      const sc = screen(); sc.innerHTML = '';
      sc.append(h('div', { class: 'splash' }, h('div', { class: 'logo', html: 'Windows<b>98</b>' }), h('div', { class: 'bar', html: '<i></i>' })));
      later(showLogin, 2200);
    }, 900);
  }
  function showLogin() {
    const id = D.boot.loginLock;
    if (!id || solved(id)) return enterDesktop();
    const sc = screen(); sc.innerHTML = '';
    const lg = h('div', { class: 'login98' });
    const dlg = h('div', { class: 'dlg98 out', style: { position: 'relative', left: 'auto', top: 'auto', transform: 'none', width: 'min(440px, 94%)' } });
    const form = puzzleForm(id, { hidePrompt: true, placeholder: _t('密码'), submitLabel: _t('确定'), wrongText: _t('密码不正确。'), onSolved: enterDesktop, onWrong: () => sfx('err') });
    dlg.append(h('div', { class: 'titlebar' }, h('span', { class: 't', text: _t('欢迎使用 Windows') })),
      h('div', { class: 'wbody' },
        h('div', { style: { display: 'flex', gap: '10px', alignItems: 'center' } }, h('span', { html: icon('computer'), style: { width: '32px' } }), h('div', { text: _t('键入用户名和密码以登录到 Windows。') })),
        h('div', { class: 'fields', style: { display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '6px 8px', alignItems: 'center' } }, h('label', { text: _t('用户名(U)：') }), h('input', { class: 'f98', value: D.boot.loginUser || 'user', readonly: true })),
        form));
    lg.append(dlg); sc.append(lg); form.focusFirst();
  }
  function enterDesktop() {
    S.stage = 'win';
    sfx('boot');
    later(() => toast(coarse() ? _t('轻点图标打开；长按文件可以查看属性。') : _t('双击桌面图标打开程序；右键文件可以查看属性。')), 2500);
    dirty();
    renderScreen();
  }

  // ============================================================
  // 桌面与窗口
  // ============================================================
  let wins = [], zTop = 100, renderedFlagVer = -1;
  function desktop() { return $('#desktop'); }
  function buildDesktop() {
    closeCtx();
    const sc = screen(); sc.innerHTML = '';
    const dk = h('div', { id: 'desktop' }, h('div', { id: 'icons' }));
    const tb = h('div', { id: 'taskbar', class: 'out' },
      controlButton({ id: 'startbtn', class: 'b98', html: icon('win') + _t('<span>开始</span>') }, toggleStart),
      h('div', { id: 'tasks' }), h('div', { id: 'tray', class: 'in', style: { background: 'transparent' } }));
    sc.append(dk, tb);
    dk.addEventListener('pointerdown', (e) => { if (e.target === dk || e.target.id === 'icons') { selectIcon(null); closeStart(); closeCtx(); } });
    // 游戏桌面使用自己的菜单；输入框保留浏览器的复制、粘贴菜单。
    dk.addEventListener('contextmenu', e => {
      if (e.defaultPrevented || e.target.closest('input, textarea, select, [contenteditable="true"]')) return;
      e.preventDefault();
      const win = wins.find(w => w.el.contains(e.target));
      const items = win ? [[_t('刷新'), () => win.refresh(true)]] : [[_t('刷新'), () => { renderIcons(); refreshWins(true); }], [_t('显示 属性'), openDisplay]];
      showCtx(items, e.clientX, e.clientY);
    });
    wins = [];
    renderIcons(); renderTray(); renderTasks();
  }
  let selIcon = null;
  function selectIcon(el) { document.querySelectorAll('#icons .icon.sel').forEach(x => x.classList.remove('sel')); selIcon = el; if (el) el.classList.add('sel'); }
  function desktopEntries() {
    const out = [];
    const appNew = (id, a) => id === 'mycomputer' ? newUnder('C:') || newUnder('A:') : id === 'recycle' ? recycleHasNew() : a.path ? newUnder(a.path) : false;
    for (const [id, a] of Object.entries(D.apps)) if (test(a.requires)) out.push({ fresh: appNew(id, a), key: 'app_' + id, name: a.name, icon: id === 'recycle' ? (recycleItems().length ? 'recyclefull' : 'recycle') : a.icon, open: () => openApp(id), file: a.path ? D.files.find(f => f.path === a.path && f.type === 'folder') : null });
    D.files.filter(f => f.desktop && fileVisible(f)).forEach(f => out.push({ fresh: isNewFile(f), key: 'f_' + f.id, name: nameOf(f.path), icon: TYPEICON[f.type], locked: f.lock && !solved(f.lock), open: () => openFile(f), file: f }));
    return out;
  }
  function renderIcons() {
    const box = $('#icons'); if (!box) return;
    box.innerHTML = '';
    desktopEntries().forEach(en => {
      const el = h('div', { class: 'icon', tabindex: 0, html: icon(en.icon, en.locked) + (en.fresh ? NEWDOT : '') + `<span>${esc(en.name)}</span>` });
      bindControl(el, () => { selectIcon(el); if (coarse()) en.open(); });
      el.ondblclick = () => { if (!coarse()) en.open(); };
      el.onkeydown = (e) => { if (e.key === 'Enter') en.open(); };
      bindCtx(el, () => [[_t('打开'), en.open], ...(en.file ? [[_t('属性'), () => showProps(en.file)]] : [])], () => selectIcon(el));
      box.append(el);
    });
  }
  function renderTray() {
    const t = $('#tray'); if (!t || !S) return;
    const m = machineNow();
    t.textContent = m.hm; t.title = LANG === 'en' ? `${m.y}-${pad(m.mo)}-${pad(m.d)}` : `${m.y}${_t('年')}${m.mo}${_t('月')}${m.d}${_t('日')}`;
  }
  function renderTasks() {
    const box = $('#tasks'); if (!box) return;
    box.innerHTML = '';
    const top = wins.filter(w => !w.min).sort((a, b) => b.z - a.z)[0];
    wins.forEach(w => w.el.classList.toggle('active', w === top));
    wins.forEach(w => box.append(controlButton({ class: 'b98 task' + (w === top ? ' on down' : ''), html: icon(w.o.icon || 'exe') + `<span>${esc(w.title)}</span>` }, () => { if (w === top && !w.min) { w.min = true; w.el.hidden = true; renderTasks(); } else focusWin(w); })));
  }
  // 后台状态更新不得替换手指或鼠标正在操作的内容；松手后留出兼容 click 的时间。
  function guardWinInteraction(win) {
    const el = win.el, pointers = new Set();
    let touches = 0, settling = false, timer = null;
    const active = () => pointers.size > 0 || touches > 0;
    win.isInteracting = () => active() || settling;
    const begin = () => { clearTimeout(timer); settling = false; };
    const release = () => {
      if (active()) return;
      clearTimeout(timer); settling = true;
      timer = setTimeout(() => {
        settling = false;
        if (el.isConnected && !active() && win.refreshPending) win.refresh();
      }, 400);
    };
    const pointerDown = e => { if (e.button === 0) { begin(); pointers.add(e.pointerId); } };
    const pointerEnd = e => { if (pointers.delete(e.pointerId)) release(); };
    const touchStart = e => { begin(); touches = e.touches.length; };
    const touchEnd = e => { if (touches) { touches = e.touches ? e.touches.length : 0; release(); } };
    // 主动翻页会移除原触摸目标，浏览器可能不再把 touchend 派发到 document。
    win.resetInteraction = () => { clearTimeout(timer); pointers.clear(); touches = 0; settling = false; };
    el.addEventListener('pointerdown', pointerDown, true);
    el.addEventListener('touchstart', touchStart, { capture: true, passive: true });
    document.addEventListener('pointerup', pointerEnd, true);
    document.addEventListener('pointercancel', pointerEnd, true);
    document.addEventListener('touchend', touchEnd, { capture: true, passive: true });
    document.addEventListener('touchcancel', touchEnd, { capture: true, passive: true });
    win.interactionCleanup = () => {
      win.resetInteraction();
      el.removeEventListener('pointerdown', pointerDown, true);
      el.removeEventListener('touchstart', touchStart, true);
      document.removeEventListener('pointerup', pointerEnd, true);
      document.removeEventListener('pointercancel', pointerEnd, true);
      document.removeEventListener('touchend', touchEnd, true);
      document.removeEventListener('touchcancel', touchEnd, true);
    };
  }
  function openWin(o) {
    if (o.key) { const ex = wins.find(w => w.key === o.key); if (ex) { if (o.state) Object.assign(ex.state, o.state); focusWin(ex); ex.refresh(true); return ex; } }
    const dk = desktop(); if (!dk) return null;
    const W = dk.clientWidth, H = dk.clientHeight;
    const w = Math.min(o.w || 560, W - 10), hh = Math.min(o.h || 400, H - 10);
    const n = wins.length;
    const x = Math.max(0, Math.min(W - w, 40 + n * 24 + Math.random() * 20)), y = Math.max(0, Math.min(H - hh, 20 + n * 22));
    const win = { key: o.key, o, title: o.title, state: Object.assign({}, o.state || {}), z: ++zTop, min: false };
    const el = h('div', { class: 'win out', style: { left: x + 'px', top: y + 'px', width: w + 'px', height: hh + 'px', zIndex: win.z } });
    const tt = h('span', { class: 't', text: o.title });
    const symbol = kind => h('span', { class: 'window-symbol ' + kind, 'aria-hidden': 'true' });
    const maxSymbol = symbol('max');
    const maxBtn = controlButton({ class: 'b98 tbb', 'aria-label': _t('最大化'), title: _t('最大化') }, () => { focusWin(win); win.toggleMax(); }, maxSymbol);
    win.toggleMax = force => {
      const max = typeof force === 'boolean' ? force : !el.classList.contains('max');
      el.classList.toggle('max', max); maxSymbol.className = 'window-symbol ' + (max ? 'restore' : 'max');
      maxBtn.setAttribute('aria-label', _t(max ? '还原' : '最大化')); maxBtn.title = _t(max ? '还原' : '最大化');
    };
    const bar = h('div', { class: 'titlebar' }, h('span', { html: icon(o.icon || 'exe') }), tt,
      controlButton({ class: 'b98 tbb', 'aria-label': _t('最小化'), title: _t('最小化') }, () => { win.min = true; el.hidden = true; renderTasks(); }, symbol('min')),
      maxBtn,
      controlButton({ class: 'b98 tbb', 'aria-label': _t('关闭'), title: _t('关闭') }, () => closeWin(win), symbol('close')));
    const menu = h('div', { class: 'menubar' });
    const top = h('div');
    const body = h('div', { class: 'wbody ' + (o.bodyClass || 'in') });
    if (o.file) bindCtx(body, () => [[_t('属性'), () => showProps(o.file)]]);
    const status = h('div', { class: 'status98' });
    el.append(bar, menu, top, body, status, h('div', { class: 'grip' }));
    win.el = el; win.body = body; win.menu = menu; win.top = top; win.status = status; win.tt = tt;
    guardWinInteraction(win);
    win.setTitle = (t) => { win.title = t; tt.textContent = t; renderTasks(); };
    win.refresh = (force) => {
      if (!force && win.isInteracting()) { win.refreshPending = true; return; }
      if (!force && el.contains(document.activeElement) && /INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) return;
      if (force) win.resetInteraction();
      win.refreshPending = false;
      const st = body.scrollTop;
      const sl = body.scrollLeft;
      menu.innerHTML = ''; top.innerHTML = ''; status.innerHTML = ''; body.innerHTML = '';
      o.render(win);
      menu.hidden = !menu.children.length; top.hidden = !top.children.length; status.hidden = !status.children.length;
      if (!win.resetScroll) { body.scrollTop = st; body.scrollLeft = sl; } else { body.scrollTop = 0; body.scrollLeft = 0; win.resetScroll = false; }
    };
    el.addEventListener('pointerdown', e => { if (!e.target.closest('.tbb')) focusWin(win); }, true);
    dragify(el, bar, win);
    resizify(el, el.querySelector('.grip'));
    dk.append(el);
    wins.push(win);
    if (narrow() || o.max) win.toggleMax(true);
    focusWin(win);
    win.refresh(true);
    return win;
  }
  function focusWin(w) {
    w.z = ++zTop; w.el.style.zIndex = w.z; w.min = false; w.el.hidden = false;
    wins.forEach(x => x.el.classList.toggle('active', x === w));
    renderTasks(); closeStart();
  }
  function closeWin(w) { w.interactionCleanup(); w.el.remove(); wins = wins.filter(x => x !== w); w.o.onClose && w.o.onClose(w); renderTasks(); }
  function closeAllWins() { wins.forEach(w => { w.interactionCleanup(); w.el.remove(); w.o.onClose && w.o.onClose(w); }); wins = []; }
  function dragify(el, handle, win) {
    handle.addEventListener('pointerdown', (e) => {
      if (e.target.closest('button') || el.classList.contains('max') || (e.pointerType === 'mouse' && e.button !== 0)) return;
      const dk = desktop(); const r = el.getBoundingClientRect(), dr = dk.getBoundingClientRect();
      const ox = e.clientX - r.left, oy = e.clientY - r.top;
      handle.setPointerCapture(e.pointerId);
      const mv = (ev) => { el.style.left = Math.max(0, Math.min(Math.max(0, dr.width - r.width), ev.clientX - dr.left - ox)) + 'px'; el.style.top = Math.max(0, Math.min(dr.height - 24, ev.clientY - dr.top - oy)) + 'px'; };
      const up = () => { handle.removeEventListener('pointermove', mv); handle.removeEventListener('pointerup', up); handle.removeEventListener('pointercancel', up); };
      handle.addEventListener('pointermove', mv); handle.addEventListener('pointerup', up); handle.addEventListener('pointercancel', up);
    });
    handle.addEventListener('dblclick', (e) => { if (!e.target.closest('button')) win.toggleMax(); });
  }
  function resizify(el, grip) {
    grip.addEventListener('pointerdown', (e) => {
      e.stopPropagation(); const r = el.getBoundingClientRect(); const sx = e.clientX, sy = e.clientY;
      grip.setPointerCapture(e.pointerId);
      const dr = desktop().getBoundingClientRect();
      const mv = (ev) => { el.style.width = Math.max(220, Math.min(dr.right - r.left, r.width + ev.clientX - sx)) + 'px'; el.style.height = Math.max(140, Math.min(dr.bottom - r.top, r.height + ev.clientY - sy)) + 'px'; };
      const up = () => { grip.removeEventListener('pointermove', mv); grip.removeEventListener('pointerup', up); grip.removeEventListener('pointercancel', up); };
      grip.addEventListener('pointermove', mv); grip.addEventListener('pointerup', up); grip.addEventListener('pointercancel', up);
    });
  }
  function menus(win, defs) {
    // defs: [[label, [[itemLabel, fn, checked], ...]], ...]
    defs.forEach(([label, items]) => {
      const m = h('div', { text: label });
      bindControl(m, (e) => {
        e.stopPropagation();
        const was = m.classList.contains('open');
        win.menu.querySelectorAll('.open').forEach(x => { x.classList.remove('open'); x.querySelector('.dropdown') && x.querySelector('.dropdown').remove(); });
        if (was) return;
        m.classList.add('open');
        const dd = h('div', { class: 'dropdown out' });
        items.forEach(it => { if (it === '-') return dd.append(h('div', { class: 'sep98', style: { padding: 0 } })); dd.append(bindControl(h('div', { class: it[2] ? 'chk' : '', text: it[0] }), () => { m.classList.remove('open'); dd.remove(); it[1](); })); });
        m.append(dd);
        const off = (ev) => { if (!m.contains(ev.target)) { m.classList.remove('open'); dd.remove(); document.removeEventListener('pointerdown', off, true); } };
        document.addEventListener('pointerdown', off, true);
      }, e => e.target.closest('.dropdown') ? null : m);
      win.menu.append(m);
    });
  }
  // 右键菜单（触屏长按）
  let ctxEl = null, ctxOutside = null;
  function closeCtx() {
    if (ctxOutside) { document.removeEventListener('pointerdown', ctxOutside, true); ctxOutside = null; }
    if (ctxEl) { ctxEl.remove(); ctxEl = null; }
  }
  function showCtx(items, x, y, keyboard, host) {
    closeCtx(); const dk = host || desktop(); if (!dk || !items.length) return;
    const dr = dk.getBoundingClientRect();
    ctxEl = h('div', { class: 'ctx out', role: 'menu', style: { zIndex: Math.max(7100, zTop + 1) } });
    items.forEach(([t, fn]) => ctxEl.append(controlButton({ class: 'ctx-item', role: 'menuitem', text: t }, () => { closeCtx(); fn(); })));
    ctxEl.onkeydown = e => {
      if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(e.key)) return;
      e.preventDefault(); const buttons = [...ctxEl.querySelectorAll('button')], i = buttons.indexOf(document.activeElement);
      const n = e.key === 'Home' ? 0 : e.key === 'End' ? buttons.length - 1 : (i + (e.key === 'ArrowDown' ? 1 : -1) + buttons.length) % buttons.length;
      buttons[n].focus();
    };
    dk.append(ctxEl);
    ctxEl.style.left = Math.max(0, Math.min(x - dr.left, dr.width - ctxEl.offsetWidth)) + 'px';
    ctxEl.style.top = Math.max(0, Math.min(y - dr.top, dr.height - ctxEl.offsetHeight)) + 'px';
    ctxOutside = e => { if (ctxEl && !ctxEl.contains(e.target)) closeCtx(); };
    document.addEventListener('pointerdown', ctxOutside, true);
    if (keyboard) ctxEl.querySelector('button')?.focus();
  }
  function bindCtx(el, items, select, host) {
    const show = (x, y, keyboard) => {
      controlCancels.get(el)?.();
      el.querySelectorAll('.pressed-control').forEach(control => controlCancels.get(control)?.());
      if (select) select(); showCtx(items(), x, y, keyboard, host);
    };
    el.addEventListener('contextmenu', e => {
      if (e.target.closest('input, textarea, select, [contenteditable="true"]')) return;
      e.preventDefault(); e.stopPropagation();
      if (!touching && Date.now() < suppressContextUntil) return;
      if (touching) { cancel(); touchOpened = true; suppressContextUntil = Date.now() + 1000; }
      if (!ctxEl || !touchOpened) show(e.clientX, e.clientY);
    });
    el.addEventListener('keydown', e => {
      if (e.target.closest('input, textarea, select, [contenteditable="true"]')) return;
      if (e.key !== 'ContextMenu' && !(e.shiftKey && e.key === 'F10')) return;
      e.preventDefault(); e.stopPropagation(); const r = el.getBoundingClientRect(); show(r.left + r.width / 2, r.top + r.height / 2, true);
    });
    let lp = 0, touchOpened = false, touching = false, suppressContextUntil = 0;
    const cancel = () => { clearTimeout(lp); lp = 0; };
    el.addEventListener('touchstart', e => {
      cancel(); touchOpened = false; touching = e.touches.length === 1 && !e.target.closest('input, textarea, select, [contenteditable="true"]'); suppressContextUntil = 0; if (!touching) return;
      const { clientX, clientY } = e.touches[0];
      lp = setTimeout(() => { if (el.isConnected) { touchOpened = true; suppressContextUntil = Date.now() + 1000; show(clientX, clientY); } }, 550);
    }, { passive: true });
    // 子按钮会在松手时执行并停止冒泡；提前取消长按计时，避免稍后误弹属性菜单。
    el.addEventListener('pointerup', cancel, true);
    el.addEventListener('pointercancel', cancel, true);
    el.addEventListener('touchend', e => { cancel(); touching = false; if (touchOpened) { e.preventDefault(); touchOpened = false; } }, { capture: true, passive: false });
    el.addEventListener('touchmove', cancel, { passive: true });
    el.addEventListener('touchcancel', () => { cancel(); touching = false; touchOpened = false; }, { passive: true });
  }
  // 开始菜单
  function toggleStart() { if ($('#startmenu')) return closeStart(); openStart(); }
  function closeStart() { const m = $('#startmenu'); if (m) m.remove(); const b = $('#startbtn'); if (b) b.classList.remove('down'); }
  function openStart() {
    const dk = desktop(); if (!dk) return;
    const items = [];
    Object.entries(D.apps).forEach(([id, a]) => { if (test(a.requires) && id !== 'recycle' && id !== 'mydocs') items.push([a.icon, a.name, () => openApp(id)]); });
    items.push(['notepad', _t('记事本'), () => openNotepad({ id: null, path: _t('无标题'), text: '' })]);
    items.push(['display', _t('显示属性'), () => openDisplay()]);
    items.push(['help', _t('帮助'), () => msgBox(_t('帮助'), helpText())]);
    items.push(['shutdown', _t('关闭系统...'), () => msgBox(_t('关闭 Windows'), _t('机房 3 号机是 BBS 服务器，请勿关机！！！<br><span style="color:#666">—— 机箱上贴着的纸条</span>'), [{ text: _t('返回标题画面'), fn: () => { writeSave('auto'); showTitle(); } }, { text: _t('取消') }])]);
    const ul = h('ul');
    items.forEach(([ic, n, fn]) => ul.append(bindControl(h('li', { html: icon(ic) + `<span>${esc(n)}</span>` }), () => { closeStart(); fn(); })));
    const m = h('div', { id: 'startmenu', class: 'out' }, h('div', { class: 'side', html: '<b>Windows</b>98' }), ul);
    dk.parentNode.append(m);
    $('#startbtn').classList.add('down');
    setTimeout(() => document.addEventListener('pointerdown', function off(e) { if (!m.contains(e.target) && e.target.id !== 'startbtn' && !e.target.closest('#startbtn')) closeStart(); document.removeEventListener('pointerdown', off, true); }, true), 0);
  }

  // ============================================================
  // 文件系统
  // ============================================================
  const normPath = (p) => p.replace(/\\/g, '/').replace(/\/+$/, '').replace(/^([AC]:)$/i, '$1');
  function parentOf(p) { const i = p.lastIndexOf('/'); return i < 0 ? '' : p.slice(0, i); }
  const dispName = (n) => SEG[n] || n;
  const nameOf = (p) => { const i = p.lastIndexOf('/'); return dispName(i < 0 ? p : p.slice(i + 1)); };
  const dispPath = (p) => String(p || '').split('/').map(dispName).join(String.fromCharCode(92));
  let FS = null;
  function buildFS() {
    FS = { nodes: {}, kids: {} };
    const ensure = (p) => {
      if (FS.nodes[p] || !p) return;
      FS.nodes[p] = { path: p, folder: true, files: [] };
      const par = parentOf(p);
      if (par) { ensure(par); (FS.kids[par] = FS.kids[par] || new Set()).add(p); }
    };
    D.files.forEach(f => {
      f.path = normPath(f.path);
      ensure(f.path);
      const n = FS.nodes[f.path];
      n.files.push(f);
      if (f.type !== 'folder') n.folder = false;
    });
    ['A:', 'C:'].forEach(ensure);
  }
  function fileVisible(f) { return test(f.requires) && (!f.deleted || S.flags['restored_' + f.id]) && (!f.hidden || S.showHidden); }
  function nodeFile(p) { const n = FS.nodes[p]; if (!n) return null; return n.files.find(f => f.type !== 'folder' && fileVisible(f)) || null; }
  function folderEntry(p) { const n = FS.nodes[p]; return n && n.files.find(f => f.type === 'folder'); }
  function folderVisible(p, depth = 0) {
    if (p === 'A:' || p === 'C:') return true;
    const fe = folderEntry(p);
    if (fe) return test(fe.requires) && (!fe.hidden || S.showHidden);
    if (depth > 20) return false;
    return [...(FS.kids[p] || [])].some(k => (FS.nodes[k].folder && !nodeFile(k)) ? folderVisible(k, depth + 1) : !!nodeFile(k));
  }
  function listDir(p) {
    const out = [];
    [...(FS.kids[p] || [])].forEach(k => {
      const f = nodeFile(k);
      if (f) out.push({ path: k, file: f });
      else if (FS.nodes[k].folder && folderVisible(k)) out.push({ path: k, folder: true, entry: folderEntry(k) });
    });
    out.sort((a, b) => (b.folder ? 1 : 0) - (a.folder ? 1 : 0) || nameOf(a.path).localeCompare(nameOf(b.path), 'zh'));
    return out;
  }
  // 新恢复、还没打开过的文件：图标上加小圆点，所在的文件夹、盘符和桌面图标也跟着标出
  function isNewFile(f) { return !!(f && f.id && f.requires && f.type !== 'folder' && !S.opened[f.id] && fileVisible(f)); }
  function reachablePath(path) {
    for (let q = parentOf(path); q && q !== 'A:' && q !== 'C:'; q = parentOf(q)) if (!folderVisible(q)) return false;
    return true;
  }
  function newUnder(prefix) { return D.files.some(f => (f.path === prefix || f.path.startsWith(prefix + '/')) && isNewFile(f) && reachablePath(f.path)); }
  function recycleHasNew() { return recycleItems().some(f => !S.opened[f.id]); }
  const NEWDOT = `<i class="newdot" aria-label="${esc(_t('新'))}"></i>`;
  function recycleItems() { return D.files.filter(f => f.deleted && !S.flags['restored_' + f.id] && test(f.requires)); }
  function sizeOf(f) {
    if (f.size) return f.size;
    const n = (f.text || '').length * 2 + strip(f.html || '').length * 2 + 300;
    return Math.max(1, Math.round(n / 1024)) + ' KB';
  }

  // 打开文件
  function openFile(f) {
    markInteraction();
    const go = () => {
      opened(f.id, f.onOpen);
      const t = f.type;
      if (t === 'folder') return openExplorer(f.path);
      if (['txt', 'log', 'ini', 'bat', 'bak', 'dat', 'sys'].includes(t)) return f.text != null ? openNotepad(f) : msgBox(nameOf(f.path), _t('无法打开此文件。<br>Windows 不知道用什么程序打开它。'));
      if (t === 'doc') return openWordpad(f);
      if (t === 'htm') return openIE(null, f);
      if (t === 'img') return openImage(f);
      if (t === 'audio') return openMedia(f);
      if (t === 'zip') return openZip(f);
      if (t === 'lnk' || t === 'exe') { if (f.app) return openApp(f.app); return msgBox(nameOf(f.path), esc(f.text || _t('该程序无法在此系统上运行。')).replace(/\n/g, '<br>')); }
      if (f.text != null) return openNotepad(f);
      msgBox(nameOf(f.path), _t('无法打开此类型的文件。'));
    };
    if (f.type === 'zip') return go();
    withLock(f.lock, go);
  }
  function showProps(f, aboveOverlay) {
    if (f.id) { setFlag('props_' + f.id); if (!S.opened['props_' + f.id]) { S.opened['props_' + f.id] = 1; act(f.onProps); } dirty(); }
    const rows = [[_t('类型'), TYPENAME[f.type] || _t('文件')], [_t('位置'), dispPath(parentOf(f.path)) || f.path], [_t('大小'), f.type === 'folder' ? '-' : sizeOf(f)], [_t('修改时间'), f.date || '-']];
    if (f.created) rows.push([_t('创建时间'), f.created]);
    const attr = `<label><input type="checkbox" disabled ${f.hidden ? 'checked' : ''}${_t('> 隐藏')}</label>　<label><input type="checkbox" disabled> ${_t('只读')}</label>`;
    let html = `<div style="display:flex;gap:10px;align-items:center;margin-bottom:8px"><span style="width:32px">${icon(TYPEICON[f.type] || 'txt')}</span><b>${esc(nameOf(f.path))}</b></div><div class="sep98"></div><table style="border-collapse:collapse">`;
    rows.forEach(([k, v]) => html += `<tr><td style="padding:2px 12px 2px 0;color:#333;white-space:nowrap;vertical-align:top">${k}：</td><td style="padding:2px 0">${esc(v)}</td></tr>`);
    html += `<tr><td style="padding:2px 12px 2px 0;color:#333">${_t('属性：')}</td><td>${attr}</td></tr>`;
    if (f.props) { html += '</table><div class="sep98"></div><table style="border-collapse:collapse">'; Object.entries(f.props).forEach(([k, v]) => html += `<tr><td style="padding:2px 12px 2px 0;color:#333;white-space:nowrap;vertical-align:top">${esc(k)}：</td><td style="padding:2px 0;white-space:pre-wrap">${fmt(esc(v))}</td></tr>`); }
    html += '</table>';
    msgBox(nameOf(f.path) + _t(' 属性'), html, null, aboveOverlay);
  }

  // ============================================================
  // 应用
  // ============================================================
  function openApp(id) {
    const a = D.apps[id] || {};
    const go = () => {
      if (id === 'mycomputer') return openExplorer('');
      if (id === 'mydocs') return openExplorer(a.path || 'C:/我的文档');
      if (id === 'recycle') return openRecycle();
      if (id === 'bbs') return openIE('/');
      if (id === 'gexun') return openGexun();
      if (id === 'explorer') return openExplorer('C:');
      if (id === 'display') return openDisplay();
      msgBox(a.name || id, _t('无法启动程序。'));
    };
    withLock(a.lock, go);
  }

  // ---- 资源管理器 ----
  function openExplorer(path) {
    const win = openWin({ key: 'explorer', title: _t('资源管理器'), icon: 'folder', w: 600, h: 400, live: true, state: { path, sel: null }, render: renderExplorer });
    if (win) { win.state.path = path; win.resetScroll = true; win.refresh(true); }
  }
  function renderExplorer(win) {
    const st = win.state; st.view = st.view || 'icons';
    const p = st.path;
    const title = p === '' ? _t('我的电脑') : p === 'A:' ? _t('3.5 软盘 (A:)') : p === 'C:' ? '(C:)' : nameOf(p);
    win.setTitle(title);
    win.o.icon = p === '' ? 'computer' : 'folder';
    const go = (np) => { st.path = np; st.sel = null; win.resetScroll = true; win.refresh(true); };
    const sel = () => st.sel && items.find(x => x.path === st.sel);
    menus(win, [
      [_t('文件(F)'), [[_t('打开'), () => { const s = sel(); s && openEntry(s); }], [_t('属性'), () => { const s = sel(); s && showProps(s.file || s.entry || { path: s.path, type: 'folder' }); }], '-', [_t('关闭'), () => closeWin(win)]]],
      [_t('查看(V)'), [[_t('大图标'), () => { st.view = 'icons'; win.refresh(true); }, st.view === 'icons'], [_t('详细资料'), () => { st.view = 'details'; win.refresh(true); }, st.view === 'details'], '-',
        [_t('显示所有文件（含隐藏文件）'), () => { S.showHidden = !S.showHidden; flagVer++; refreshWins(true); renderIcons(); save('auto'); toast(S.showHidden ? _t('已显示隐藏文件') : _t('已不显示隐藏文件')); }, S.showHidden]]],
      [_t('帮助(H)'), [[_t('关于 Windows'), () => msgBox(_t('关于 Windows'), _t('Microsoft Windows 98<br>本机已授权给：梧城市第七中学 微机室'))]]],
    ]);
    win.top.append(h('div', { class: 'toolbar98' },
      controlButton({ class: 'b98', text: _t('↑ 向上'), disabled: p === '' }, () => go(p === 'A:' || p === 'C:' ? '' : parentOf(p))),
      controlButton({ class: 'b98', text: _t('属性') }, () => { const s = sel(); if (s) showProps(s.file || s.entry || { path: s.path, type: 'folder' }); else msgBox(_t('属性'), _t('请先单击选中一个文件。')); })),
      h('div', { class: 'addr' }, h('span', { text: _t('地址') }), h('input', { class: 'f98', value: p === '' ? _t('我的电脑') : dispPath(p) + (p.length === 2 ? '\\' : ''), readonly: true })));
    const body = win.body;
    body.innerHTML = '';
    let items;
    if (p === '') {
      items = [{ path: 'A:', folder: true, drive: 'floppy', label: _t('3.5 软盘 (A:)') }, { path: 'C:', folder: true, drive: 'drive', label: '(C:)' }, { path: '#display', label: _t('控制面板'), drive: 'display' }];
    } else items = listDir(p);
    const openEntry = (it) => {
      if (it.path === '#display') return openDisplay();
      if (it.folder) { const fe = it.entry; if (fe) { opened(fe.id, fe.onOpen); return withLock(fe.lock, () => go(it.path)); } return go(it.path); }
      openFile(it.file);
    };
    if (!items.length) { body.append(h('div', { class: 'empty98', text: _t('此文件夹为空。') })); }
    else if (st.view === 'icons' || p === '') {
      const fl = h('div', { class: 'flist' });
      items.forEach(it => {
        const f = it.file; const locked = (f && f.lock && !solved(f.lock)) || (it.entry && it.entry.lock && !solved(it.entry.lock));
        const ic = it.drive || (it.folder ? 'folder' : TYPEICON[f.type]);
        const hid = (f && f.hidden) || (it.entry && it.entry.hidden);
        const el = h('div', { class: 'icon' + (st.sel === it.path ? ' sel' : '') + (hid ? ' hid' : ''), tabindex: 0, html: icon(ic, locked) + ((it.folder ? it.path !== '#display' && newUnder(it.path) : isNewFile(f)) ? NEWDOT : '') + `<span>${esc(it.label || nameOf(it.path))}</span>` });
        const select = () => { st.sel = it.path; fl.querySelectorAll('.sel').forEach(x => x.classList.remove('sel')); el.classList.add('sel'); win.status.firstChild && (win.status.firstChild.textContent = statusText(it)); };
        bindControl(el, () => { select(); if (coarse()) openEntry(it); });
        el.ondblclick = () => { if (!coarse()) openEntry(it); };
        el.onkeydown = (e) => { if (e.key === 'Enter') openEntry(it); };
        bindCtx(el, () => [[_t('打开'), () => openEntry(it)], [_t('属性'), () => showProps(f || it.entry || { path: it.path, type: 'folder' })]], select);
        fl.append(el);
      });
      body.append(fl);
    } else {
      const tb = h('table', { class: 'det' });
      tb.append(h('tr', {}, h('th', { class: 'out', text: _t('名称') }), h('th', { class: 'out', text: _t('大小') }), h('th', { class: 'out', text: _t('类型') }), h('th', { class: 'out', text: _t('修改时间') })));
      items.forEach(it => {
        const f = it.file; const locked = f && f.lock && !solved(f.lock);
        const tr = h('tr', { class: st.sel === it.path ? 'sel' : '' },
          h('td', { class: 'nm', html: icon(it.folder ? 'folder' : TYPEICON[f.type], locked) + esc(nameOf(it.path)) + ((it.folder ? newUnder(it.path) : isNewFile(f)) ? `<span class="newtag">${_t('新')}</span>` : '') }),
          h('td', { text: it.folder ? '' : sizeOf(f) }), h('td', { text: it.folder ? _t('文件夹') : TYPENAME[f.type] || '' }), h('td', { text: (f || it.entry || {}).date || '' }));
        const select = () => { st.sel = it.path; tb.querySelectorAll('.sel').forEach(x => x.classList.remove('sel')); tr.classList.add('sel'); win.status.firstChild && (win.status.firstChild.textContent = statusText(it)); };
        bindControl(tr, () => { select(); if (coarse()) openEntry(it); });
        tr.ondblclick = () => { if (!coarse()) openEntry(it); };
        tr.tabIndex = 0;
        tr.onkeydown = e => { if (e.key === 'Enter') openEntry(it); };
        bindCtx(tr, () => [[_t('打开'), () => openEntry(it)], [_t('属性'), () => showProps(f || it.entry || { path: it.path, type: 'folder' })]], select);
        tb.append(tr);
      });
      body.append(tb);
    }
    const statusText = (it) => it ? (it.folder || it.drive ? it.label || nameOf(it.path) : `${nameOf(it.path)}　${sizeOf(it.file)}　${it.file.date || ''}`) : `${items.length} ${_t('个对象')}` + (S.showHidden ? '' : _t('（隐藏文件未显示）'));
    win.status.append(h('div', { text: statusText(sel()) }));
  }

  // ---- 回收站 ----
  function openRecycle() { openWin({ key: 'recycle', title: _t('回收站'), icon: 'recycle', w: 520, h: 320, live: true, render: renderRecycle }); }
  function renderRecycle(win) {
    const items = recycleItems();
    win.o.icon = items.length ? 'recyclefull' : 'recycle';
    win.top.append(h('div', { class: 'toolbar98' }, h('span', { text: _t('选中文件后点"还原"，文件会回到原来的位置。') })));
    if (!items.length) { win.body.append(h('div', { class: 'empty98', text: _t('回收站是空的。') })); return; }
    const tb = h('table', { class: 'det recycle-table' });
    tb.append(h('tr', {}, ...[_t('名称'), _t('原位置'), _t('删除日期'), _t('大小'), ''].map(t => h('th', { class: 'out', text: t }))));
    items.forEach(f => {
      tb.append(h('tr', {}, h('td', { class: 'nm', html: icon(TYPEICON[f.type] || 'txt') + esc(nameOf(f.path)) + (S.opened[f.id] ? '' : `<span class="newtag">${_t('新')}</span>`) }), h('td', { text: dispPath(parentOf(f.path)) }), h('td', { text: f.deletedAt || f.date || '' }), h('td', { text: sizeOf(f) }),
        h('td', {}, controlButton({ class: 'b98', style: { minWidth: 0 }, text: _t('还原') }, () => { markInteraction(); setFlag('restored_' + f.id); toast(_t('已还原到 ') + dispPath(parentOf(f.path))); dirty(); win.refresh(true); }))));
    });
    win.body.append(tb);
    win.status.append(h('div', { text: `${items.length} ${_t('个对象')}` }));
  }

  // ---- 记事本 / 写字板 / 看图 ----
  function openNotepad(f) {
    openWin({ key: 'np_' + (f.id || Math.random()), title: nameOf(f.path) + _t(' - 记事本'), icon: 'notepad', file: f, w: 640, h: 520, render: (win) => {
      menus(win, [[_t('文件(F)'), [[_t('属性'), () => f.id && showProps(f)], [_t('关闭'), () => closeWin(win)]]], [_t('编辑(E)'), [[_t('全选'), () => { const r = document.createRange(); r.selectNodeContents(win.body.firstChild); const s = getSelection(); s.removeAllRanges(); s.addRange(r); }]]]]);
      win.body.append(h('pre', { class: 'note', text: fmt(f.text || '').replace(/&amp;/g, '&') }));
    } });
  }
  function openWordpad(f) {
    openWin({ key: 'wp_' + f.id, title: nameOf(f.path) + _t(' - 写字板'), icon: 'doc', file: f, w: 720, h: 620, bodyClass: '', render: (win) => {
      menus(win, [[_t('文件(F)'), [[_t('属性'), () => showProps(f)], [_t('关闭'), () => closeWin(win)]]]]);
      win.body.append(h('div', { class: 'wordpad' }, h('div', { class: 'page', html: fmt(f.html || '') })));
    } });
  }
  function openImage(f) {
    openWin({ key: 'img_' + f.id, title: nameOf(f.path) + _t(' - 图像查看器'), icon: 'img', file: f, w: 640, h: 500, bodyClass: '', state: { z: null }, onClose: win => win.imageResize && win.imageResize.disconnect(), render: (win) => {
      menus(win, [[_t('文件(F)'), [[_t('属性'), () => showProps(f)], [_t('关闭'), () => closeWin(win)]]]]);
      const canvas = h('div', { class: 'canvas', html: fmt(f.html || ''), tabindex: 0, role: 'button', 'aria-label': _t('全屏查看'), ondblclick: () => viewImage(fmt(f.html), f), onkeydown: e => { if (e.key === 'Enter') viewImage(fmt(f.html), f); } });
      const size = imageSize(canvas);
      const value = h('span');
      let scale = 1;
      const zoom = delta => { win.state.z = Math.max(.25, Math.min(4, scale + delta)); win.updateImageSize(); };
      win.top.append(h('div', { class: 'toolbar98' },
        controlButton({ class: 'b98', text: _t('放大 +') }, () => zoom(.25)),
        controlButton({ class: 'b98', text: _t('缩小 −') }, () => zoom(-.25)),
        controlButton({ class: 'b98', text: _t('适应窗口') }, () => { win.state.z = null; win.updateImageSize(); win.body.scrollLeft = 0; win.body.scrollTop = 0; }),
        controlButton({ class: 'b98', text: _t('原始大小') }, () => { win.state.z = 1; win.updateImageSize(); }),
        controlButton({ class: 'b98', text: _t('全屏查看') }, () => viewImage(fmt(f.html), f)),
        controlButton({ class: 'b98', text: _t('属性') }, () => showProps(f)),
        value));
      const caption = f.caption ? h('div', { class: 'cap', html: fmt(f.caption) }) : null;
      win.body.append(h('div', { class: 'imgview' }, canvas, caption));
      win.updateImageSize = () => {
        scale = win.state.z == null ? Math.min(1, Math.max(1, win.body.clientWidth - 24) / size.w) : win.state.z;
        canvas.style.width = Math.round(size.w * scale) + 'px';
        if (caption) caption.style.width = canvas.style.width;
        if (win.state.z == null && canvas.querySelector('svg, img')) {
          const available = Math.max(60, win.body.clientHeight - 24 - (caption ? caption.offsetHeight + 8 : 0));
          if (canvas.offsetHeight > available) {
            scale *= available / canvas.offsetHeight;
            canvas.style.width = Math.round(size.w * scale) + 'px';
            if (caption) caption.style.width = canvas.style.width;
          }
        }
        value.textContent = Math.round(scale * 100) + '%';
      };
      win.updateImageSize();
      if (!win.imageResize) { win.imageResize = new ResizeObserver(() => win.updateImageSize()); win.imageResize.observe(win.body); }
    } });
  }

  // ---- 磁带播放器 ----
  const SPEEDS = ['0.5', '0.75', '1', '1.25', '1.5', '2'];
  function openMedia(f) {
    openWin({ key: 'md_' + f.id, title: nameOf(f.path) + _t(' - 媒体播放器'), icon: 'audio', file: f, w: 520, h: 470, bodyClass: 'out', state: { si: 2, playing: false, shown: '' }, render: (win) => {
      const tape = f.tape || {}; const st = win.state;
      menus(win, [[_t('文件(F)'), [[_t('属性'), () => showProps(f)], [_t('关闭'), () => closeWin(win)]]]]);
      const spd = SPEEDS[st.si];
      const deck = h('div', { class: 'deck' });
      const cas = h('div', { class: 'cassette' + (st.playing ? ' playing' : ''), style: { '--spd': (1.6 / +spd) + 's' } }, h('div', { class: 'lbl', text: `${tape.side ? tape.side + _t(' 面　') : ''}${tape.label || nameOf(f.path)}` }), h('div', { class: 'reel' }), h('div', { class: 'reel' }));
      const range = h('input', { type: 'range', min: 0, max: SPEEDS.length - 1, step: 1, value: st.si, id: 'spd_' + f.id, 'aria-label': _t('转速') });
      const speedLabel = h('span', { class: 'spd', text: spd + '×' });
      range.oninput = () => {
        st.si = +range.value; st.playing = false; st.shown = '';
        cas.classList.remove('playing'); cas.style.setProperty('--spd', (1.6 / +SPEEDS[st.si]) + 's');
        speedLabel.textContent = SPEEDS[st.si] + '×'; tr.textContent = _t('（按"播放"开始）');
      };
      const tr = h('div', { class: 'tr in', text: st.shown || _t('（按"播放"开始）') });
      deck.append(cas,
        h('div', { class: 'ctrl' }, h('span', { text: _t('转速') }), range, speedLabel),
        h('div', { class: 'ticks', html: SPEEDS.map(s => `<span>${s}</span>`).join('') }),
        h('div', { class: 'ctrl' },
          controlButton({ class: 'b98', text: _t('▶ 播放') }, () => play()),
          controlButton({ class: 'b98', text: _t('■ 停止') }, () => { st.playing = false; win.refresh(true); })),
        h('div', { text: _t('听到的内容：') }), tr);
      win.body.append(deck);
      function textFor(s) {
        const sp = tape.speeds || {};
        if (sp[s] != null) return sp[s];
        const keys = Object.keys(sp).map(Number).sort((a, b) => Math.abs(a - +s) - Math.abs(b - +s));
        return keys.length ? sp[String(keys[0])] : _t('（一片沙沙声）');
      }
      function play() {
        markInteraction();
        const s = SPEEDS[st.si]; const full = fmt(textFor(s));
        st.playing = true; st.shown = '';
        setFlag(`speed_${f.id}_${s.replace('.', '_')}`);
        const onS = tape.onSpeed && tape.onSpeed[s];
        const once = 'spd_' + f.id + '_' + s;
        if (onS && !S.opened[once]) { S.opened[once] = 1; act(onS); }
        dirty();
        win.refresh(true);
        const box = win.body.querySelector('.tr'); let i = 0;
        const step = () => { if (!st.playing || !box.isConnected) return; i = Math.min(full.length, i + 2); st.shown = full.slice(0, i); box.textContent = st.shown; if (i < full.length) later(step, 45 / Math.max(.5, +s)); else { st.playing = false; win.body.querySelector('.cassette').classList.remove('playing'); } };
        step();
      }
    } });
  }

  // ---- 压缩包 ----
  function openZip(f) {
    openWin({ key: 'zip_' + f.id, title: nameOf(f.path) + _t(' - 解压缩'), icon: 'zip', file: f, w: 480, h: 380, bodyClass: 'out', live: true, render: (win) => {
      const z = f.zip || {}; const unlocked = !f.lock || solved(f.lock);
      const tb = h('table', { class: 'det in' });
      tb.append(h('tr', {}, h('th', { class: 'out', text: _t('名称') }), h('th', { class: 'out', text: _t('状态') })));
      (z.entries || []).forEach(n => tb.append(h('tr', {}, h('td', { class: 'nm', html: icon('txt') + esc(dispName(n)) + (unlocked ? '' : ' *') }), h('td', { text: unlocked ? _t('已解压') : _t('已加密') }))));
      win.body.append(h('div', { class: 'zipv' },
        h('div', { text: _t('压缩包注释：') }), h('div', { class: 'cmt in', html: fmt(esc(z.comment || _t('（无）'))).replace(/\n/g, '<br>') }),
        h('div', { style: { overflow: 'auto', maxHeight: '160px' } }, tb),
        h('div', { class: 'row', style: { display: 'flex', gap: '6px', flexWrap: 'wrap' } },
          unlocked ? controlButton({ class: 'b98', text: _t('打开解压目录') }, () => z.extractTo && openExplorer(normPath(z.extractTo)))
            : controlButton({ class: 'b98', text: _t('解压…') }, () => askPuzzle(f.lock, () => { toast(_t('已解压到 ') + dispPath(z.extractTo), 'good'); dirty(); })))));
      win.status.append(h('div', { text: unlocked ? _t('已解压到 ') + dispPath(z.extractTo) : _t('文件已加密，需要密码') }));
    } });
  }

  // ---- 显示属性 / 屏保 ----
  function openDisplay() {
    openWin({ key: 'display', title: _t('显示 属性'), icon: 'display', w: 400, h: 360, bodyClass: 'out', render: (win) => {
      const box = h('div', { style: { padding: '12px', display: 'flex', flexDirection: 'column', gap: '10px' } },
        h('div', { class: 'in', style: { height: '130px', background: '#000', display: 'flex', alignItems: 'center', overflow: 'hidden' } }, h('div', { style: { color: '#ffd84a', fontFamily: 'var(--font-hand)', fontSize: '18px', whiteSpace: 'nowrap', padding: '0 10px' }, text: saverText().slice(0, 18) + '…' })),
        h('div', {}, _t('屏幕保护程序：'), h('select', { class: 'f98', id: 'saverSel' }, h('option', { text: _t('字幕') }))),
        h('div', {}, _t('等待：1 分钟　'), controlButton({ class: 'b98', text: _t('设置…') }, () => msgBox(_t('字幕设置'), _t('文字：<br><div class="in" style="padding:4px;margin-top:4px">') + esc(saverText()) + '</div>')), ' ', controlButton({ class: 'b98', text: _t('预览') }, () => showSaver())));
      win.body.append(box);
    } });
  }
  // 满足条件的屏保轮流播放：还没触发过 onShow 的优先，其次按顺序轮换
  let saverIdx = -1, saverPick = null;
  function saverEntry() {
    const list = D.screensaver.filter(x => test(x.requires));
    if (!list.length) return { text: _t('梧桐树下') };
    const fresh = list.find(x => x.onShow && !S.opened['saver_' + D.screensaver.indexOf(x)]);
    if (fresh) return fresh;
    return list[((saverIdx % list.length) + list.length) % list.length];
  }
  function saverText() { return fmt(saverEntry().text); }
  let idleT = 0, saverOn = false;
  function resetIdle() {
    if (saverOn) hideSaver();
    clearTimeout(idleT);
    idleT = setTimeout(() => { if (S && S.stage === 'win' && !titleOn && !overlay().classList.contains('on')) showSaver(); }, 90000);
  }
  function showSaver() {
    if (!S || S.stage !== 'win') return;
    saverIdx++;
    const e = saverEntry();
    const sc = screen(); if (!sc || $('#saver')) return;
    saverOn = true;
    const el = h('div', { id: 'saver' }, h('div', { class: 'mq', text: strip(fmt(e.text)), style: { top: (20 + Math.random() * 60) + '%' } }));
    sc.append(el);
    if (e.onShow) { const k = 'saver_' + D.screensaver.indexOf(e); if (!S.opened[k]) { S.opened[k] = 1; later(() => act(e.onShow), 3000); } }
  }
  function hideSaver() { saverOn = false; const s = $('#saver'); if (s) s.remove(); }

  // ---- 鸽讯 ----
  function openGexun() { openWin({ key: 'gexun', title: _t('鸽讯 - 嘉（') + (D.gxAccount.number || '') + '）', icon: 'pigeon', w: 620, h: 440, bodyClass: '', live: true, state: { c: null, d: null }, render: renderGexun }); }
  function gxLogsFor(c) { return D.gxLogs.filter(l => l.contact === c && test(l.requires)).sort((a, b) => (a.date + (a.lines[0] ? a.lines[0].time : '')).localeCompare(b.date + (b.lines[0] ? b.lines[0].time : ''))); }
  function renderGexun(win) {
    const st = win.state;
    menus(win, [[_t('系统'), [[_t('查找聊天记录…'), () => gxSearch(win)], [_t('关闭'), () => closeWin(win)]]]]);
    const gx = h('div', { class: 'gx' });
    const left = h('div', { class: 'left' });
    const groups = {};
    D.gxContacts.filter(c => test(c.requires)).forEach(c => (groups[c.group || _t('好友')] = groups[c.group || _t('好友')] || []).push(c));
    Object.entries(groups).forEach(([g, cs]) => {
      left.append(h('div', { class: 'grp', text: `${g}（${cs.length}）` }));
      cs.forEach(c => {
        const n = gxLogsFor(c.id).length;
        left.append(bindControl(h('div', { class: 'ct' + (st.c === c.id ? ' sel' : '') + (n ? '' : ' none') },
          h('div', { class: 'av', text: c.nick[0] }), h('div', {}, h('div', { text: c.nick }), h('small', { text: `${c.number}　${n} ${_t('段记录')}` }))), () => { st.c = c.id; st.d = null; win.refresh(true); }));
      });
    });
    const right = h('div', { class: 'right' });
    if (!st.c) right.append(h('div', { class: 'empty98', html: _t('选择左边的好友，查看和 TA 的聊天记录。<br><br><span style="color:#888">本机保存的聊天记录：鸽讯号 ') + esc(D.gxAccount.number || '') + '（' + esc(D.gxAccount.nick || '') + '）</span>' }));
    else {
      const logs = gxLogsFor(st.c);
      const c = D.gxContacts.find(x => x.id === st.c);
      if (!logs.length) right.append(h('div', { class: 'empty98', text: _t('和 ') + c.nick + _t(' 没有本地聊天记录。') }));
      else {
        const dates = h('div', { class: 'dates' });
        logs.forEach((l, i) => dates.append(controlButton({ class: 'b98' + (st.d === l.id ? ' down' : ''), text: l.date + (logs.filter(x => x.date === l.date).length > 1 ? ' #' + (logs.filter(x => x.date === l.date).indexOf(l) + 1) : '') + (S.opened[l.id] ? '' : ' •') }, () => { st.d = l.id; win.resetScroll = true; win.refresh(true); })));
        right.append(dates);
        const log = h('div', { class: 'log' });
        const L = logs.find(x => x.id === st.d);
        if (!L) log.append(h('div', { class: 'empty98', text: _t('点上面的日期查看那一天的聊天记录。') }));
        else {
          opened(L.id, L.onOpen);
          log.append(h('div', { style: { color: '#888', marginBottom: '8px' }, text: `—— ${L.date}　${_t('与')} ${c.nick}（${c.number}${_t('）的聊天记录 ——')}` }));
          L.lines.forEach(x => log.append(h('div', { class: 'ln ' + x.who }, h('div', { class: 'h', text: `${x.who === 'me' ? D.gxAccount.nick : c.nick}　${x.time || ''}` }), h('div', { class: 'x', html: fmt(esc(x.text)) }))));
        }
        right.append(log);
      }
    }
    gx.append(left, right);
    win.body.append(gx);
  }
  function gxSearch(win) {
    const m = modalRoot(); m.innerHTML = '';
    const inp = h('input', { class: 'f98', id: 'gxq', style: { width: '100%' } });
    const res = h('div', { style: { maxHeight: '220px', overflow: 'auto', background: '#fff', padding: '4px' }, class: 'in' });
    const run = () => {
      res.innerHTML = ''; const q = inp.value.trim(); if (!q) return;
      D.gxLogs.filter(l => test(l.requires)).forEach(l => l.lines.forEach(x => { if (x.text.includes(q)) { const c = D.gxContacts.find(y => y.id === l.contact); res.append(bindControl(h('div', { style: { padding: '3px', cursor: 'pointer', borderBottom: '1px dotted #ccc' }, html: `<b>${esc(c ? c.nick : '')}</b> ${esc(l.date)} ${esc(x.time || '')}<br>${esc(x.text).replace(new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), '<span style="background:#ff0">$&</span>')}` }), () => { closeModal(); win.state.c = l.contact; win.state.d = l.id; win.refresh(true); })); } }));
      if (!res.children.length) res.append(h('div', { text: _t('没有找到。') }));
    };
    inp.onkeydown = (e) => { if (confirmInput(e)) run(); };
    const dlg = h('div', { class: 'dlg98 out' }, h('div', { class: 'titlebar' }, h('span', { class: 't', text: _t('查找聊天记录') }), controlButton({ class: 'b98 tbb', text: '×', 'aria-label': _t('关闭') }, closeModal)),
      h('div', { class: 'wbody' }, h('div', { text: _t('查找内容：') }), inp, h('div', { class: 'row' }, controlButton({ class: 'b98', text: _t('查找') }, run)), res));
    m.append(h('div', { class: 'shade', onclick: closeModal }), dlg); if (!touchKeyboard()) inp.focus();
  }

  // ---- IE + 梧桐树下 BBS ----
  function openIE(url, localFile) {
    const host = D.bbsMeta.host || '192.168.1.103';
    const start = localFile ? 'file:///' + localFile.path : 'http://' + host + (url || '/');
    const ex = wins.find(w => w.key === 'ie');
    if (ex) { ieGo(ex, start); focusWin(ex); return; }
    const win = openWin({ key: 'ie', title: 'Microsoft Internet Explorer', icon: 'ie', w: 960, h: 680, bodyClass: 'in ie-body', live: true, state: { hist: [start], hi: 0, local: localFile || null }, render: renderIE });
    return win;
  }
  function ieGo(win, url) { const st = win.state; st.hist = st.hist.slice(0, st.hi + 1); st.hist.push(url); st.hi = st.hist.length - 1; win.resetScroll = true; win.refresh(true); }
  function parseURL(u) {
    u = String(u || '').trim();
    const host = (D.bbsMeta.host || '192.168.1.103').toLowerCase();
    let s = u.replace(/^https?:\/\//i, '');
    if (s.toLowerCase().startsWith(host)) s = s.slice(host.length);
    else if (/^www\./i.test(s) || /^[a-z0-9-]+(\.[a-z0-9-]+)*\.(com|cn|net|org|edu|gov|info|biz)(:\d+)?(\/|$)/i.test(s) || /^\d+\.\d+\.\d+\.\d+/.test(s)) return { external: true, raw: u };
    if (!s.startsWith('/')) s = '/' + s;
    const [path, q] = s.split('?');
    const params = {}; (q || '').split('&').filter(Boolean).forEach(kv => { const [k, v] = kv.split('='); params[decodeURIComponent(k).toLowerCase()] = decodeURIComponent((v || '').replace(/\+/g, ' ')); });
    return { path: path.toLowerCase().replace(/\/index\.(asp|htm|html)$/, '/').replace(/\/+$/, '') || '/', params, raw: s };
  }
  function renderIE(win) {
    const st = win.state; const url = st.hist[st.hi];
    menus(win, [
      [_t('文件(F)'), [[_t('关闭'), () => closeWin(win)]]],
      [_t('查看(V)'), [[_t('源文件'), () => viewSource(win)], [_t('刷新'), () => win.refresh(true)]]],
      [_t('收藏(A)'), [[_t('梧桐树下 首页'), () => ieGo(win, 'http://' + (D.bbsMeta.host || '192.168.1.103') + '/')], [_t('站务管理'), () => ieGo(win, 'http://' + (D.bbsMeta.host || '192.168.1.103') + '/admin/')]]],
      [_t('帮助(H)'), [[_t('关于'), () => msgBox(_t('关于 Internet Explorer'), 'Microsoft Internet Explorer 5.0')]]],
    ]);
    const addr = h('input', { class: 'f98', id: 'ieaddr', value: url, spellcheck: 'false', autocomplete: 'off' });
    addr.onkeydown = (e) => { if (confirmInput(e)) { markInteraction(); ieGo(win, addr.value); } };
    addr.onfocus = () => addr.select();
    win.top.append(h('div', { class: 'toolbar98' },
      controlButton({ class: 'b98', text: _t('← 后退'), disabled: st.hi === 0 }, () => { st.hi--; win.resetScroll = true; win.refresh(true); }),
      controlButton({ class: 'b98', text: _t('前进 →'), disabled: st.hi >= st.hist.length - 1 }, () => { st.hi++; win.resetScroll = true; win.refresh(true); }),
      controlButton({ class: 'b98', text: _t('刷新') }, () => win.refresh(true)),
      controlButton({ class: 'b98', text: _t('主页') }, () => ieGo(win, 'http://' + (D.bbsMeta.host || '192.168.1.103') + '/')),
      controlButton({ class: 'b98', text: _t('源文件') }, () => viewSource(win))),
      h('div', { class: 'addr' }, h('span', { text: _t('地址(D)') }), addr, controlButton({ class: 'b98', style: { minWidth: 0 }, text: _t('转到') }, () => { markInteraction(); ieGo(win, addr.value); })));
    let page;
    if (url.startsWith('file:///')) {
      const f = st.local && ('file:///' + st.local.path) === url ? st.local : D.files.find(x => 'file:///' + x.path === url);
      page = f ? { title: nameOf(f.path), html: `<div style="padding:12px">${fmt(f.html || '')}</div>`, source: f.source || '' } : errPage(_t('无法找到文件'));
    } else page = bbsRoute(parseURL(url), win);
    win.page = page;
    win.setTitle((page.title ? strip(page.title) + ' - ' : '') + 'Microsoft Internet Explorer');
    const body = h('div', { class: 'bbs' });
    if (page.node) body.append(page.node); else body.innerHTML = page.html;
    bindControl(body, (e, a) => {
      e.preventDefault(); markInteraction();
      const href = a.getAttribute('href');
      if (/^(https?:)?\/\//i.test(href) && !href.includes(D.bbsMeta.host || '192.168.1.103')) return msgBox('Internet Explorer', _t('无法显示网页。<br>本机没有连接外网（拨号连接已断开）。'));
      ieGo(win, href.startsWith('http') ? href : 'http://' + (D.bbsMeta.host || '192.168.1.103') + (href.startsWith('/') ? href : '/' + href));
    }, e => e.target.closest && e.target.closest('a[href]'));
    win.body.append(body);
    win.status.append(h('div', { text: _t('完成') }), h('div', { style: { flex: 'none', width: '100px' }, text: _t('本地 Intranet') }));
    if (page.after) page.after(body);
  }
  function viewSource(win) {
    const p = win.page || {};
    if (p.srcFlag) { setFlag(p.srcFlag); if (!S.opened[p.srcFlag]) { S.opened[p.srcFlag] = 1; act(p.onSource); } dirty(); }
    const content = p.node ? p.node.innerHTML : (p.html || '');
    const src = `<html>\n<head>\n<meta http-equiv="Content-Type" content="text/html; charset=gb2312">\n<title>${strip(p.title || _t('梧桐树下'))}</title>\n<link rel="stylesheet" href="/style.css">\n</head>\n<body bgcolor="#FFFFFF">\n${p.source ? fmt(p.source) + '\n' : ''}${D.bbsMeta.homeSource || ''}\n${content.replace(/></g, '>\n<').slice(0, 20000)}\n</body>\n</html>`;
    openWin({ key: 'src_' + Math.random(), title: _t('源文件 - 记事本'), icon: 'notepad', w: 600, h: 440, render: (w) => w.body.append(h('pre', { class: 'note', text: src })) });
  }
  function errPage(msg) {
    return { title: _t('无法找到网页'), html: `<div class="err"><h1>${_t('无法找到该网页')}</h1><p>${msg || _t('您要查找的网页可能已被删除、已更名或暂时不可用。')}</p><hr><p>${_t('请尝试以下操作：')}<br>${_t('· 检查地址栏中的网址拼写是否正确。')}<br>${_t('· 打开')} <a href="/">${_t('梧桐树下首页')}</a>${_t('，然后查找需要的链接。')}</p><p style="color:#888">${_t('HTTP 404 - 文件未找到')}<br>Internet Explorer</p></div>` };
  }
  const uName = (id) => { const u = USER[id]; return u && test(u.requires) ? u : null; };
  const uLink = (id) => { const u = uName(id); return u ? `<a href="/user.asp?id=${encodeURIComponent(id)}">${esc(u.nick)}</a>` : esc(id); };
  const visibleThreads = () => D.threads.filter(t => !t.deleted && test(t.requires));
  const topBar = (crumb) => `<div class="top"><div class="logo">${_t('梧桐树下')}<small>${_t('梧城七中 BBS')}</small></div><div class="nav"><a href="/">${_t('首页')}</a><a href="/users.asp">${_t('成员列表')}</a><a href="/search.asp">${_t('搜索')}</a><a href="/admin/">${_t('站务管理')}</a></div></div>${crumb ? `<div class="crumb">${crumb}</div>` : ''}`;
  function bbsRoute(u, win) {
    if (u.external) return { title: _t('无法显示网页'), html: `<div class="err"><h1>${_t('无法显示网页')}</h1><p>${_t('本机没有连接外网（拨号连接已断开）。')}<br>${_t('只能访问校园网内的服务器')} ${esc(D.bbsMeta.host || '')}。</p></div>` };
    const path = u.path, P = u.params;
    // 自定义页面
    const custom = D.pages.find(p => parseURL(p.url).path === path && (!parseURL(p.url).params.id || parseURL(p.url).params.id === P.id) && test(p.requires));
    if (custom) {
      if (custom.lock && !solved(custom.lock)) return lockPage(custom.lock, win, custom.title);
      opened(custom.id, custom.onOpen);
      return { title: custom.title, html: topBar(esc(custom.title || '')) + `<div class="wrap">${fmt(custom.html)}</div>`, source: custom.source, srcFlag: 'source_' + custom.id, onSource: custom.onSource };
    }
    if (path === '/' || path === '/index.asp' || path === '') {
      const vt = visibleThreads();
      let rows = '';
      D.bbsBoards.filter(b => test(b.requires)).forEach(b => {
        const ts = vt.filter(t => t.board === b.id); const last = ts[ts.length - 1];
        rows += `<tr><td><a href="/board.asp?id=${b.id}"><b>${esc(b.name)}</b></a><br><span style="color:#666">${esc(b.desc || '')}</span></td><td>${uLink(b.mod)}</td><td style="text-align:center">${ts.length}</td><td>${last ? `<a href="/thread.asp?id=${last.id}">${esc(strip(last.title)).slice(0, 18)}</a><br><span style="color:#888">${esc(last.date)}</span>` : '-'}</td></tr>`;
      });
      const latest = vt.slice().sort((a, b) => b.date.localeCompare(a.date)).slice(0, 8).map(t => `<li><a href="/thread.asp?id=${t.id}">${esc(strip(t.title))}</a> <span style="color:#888">— ${uLink(t.author)} ${esc(t.date)}</span></li>`).join('');
      return { title: D.bbsMeta.name || _t('梧桐树下'), html: topBar('') + `<div class="notice">${fmt(D.bbsMeta.homeNotice || '')}</div><div class="wrap"><table class="t"><tr><th>${_t('版面')}</th><th>${_t('版主')}</th><th>${_t('主题数')}</th><th>${_t('最新主题')}</th></tr>${rows}</table><p style="color:#666">${_t('注册用户')} ${D.users.filter(x => test(x.requires)).length} ${_t('人　|　帖子')} ${vt.length} ${_t('篇（本机已恢复部分）　|　服务器：机房 3 号机')}</p><h2>${_t('最新帖子')}</h2><ul style="padding-left:18px;margin:0">${latest}</ul></div>`, source: '' };
    }
    if (path === '/board.asp') {
      const b = D.bbsBoards.find(x => x.id === P.id && test(x.requires));
      if (!b) return errPage(_t('版面不存在。'));
      const ts = visibleThreads().filter(t => t.board === b.id).sort((x, y) => (y.sticky ? 1 : 0) - (x.sticky ? 1 : 0) || y.date.localeCompare(x.date));
      let rows = ts.map(t => `<tr><td>${t.sticky ? _t('<b style="color:#c00">[置顶]</b> ') : ''}<a href="/thread.asp?id=${t.id}">${esc(strip(t.title))}</a>${S.opened['t' + t.id] ? '' : ' <span style="color:#c00">new</span>'}</td><td>${uLink(t.author)}</td><td style="text-align:center">${(t.posts || []).length - 1}</td><td style="text-align:center">${t.views || (37 + (t.id * 7) % 300)}</td><td>${esc(t.date)}</td></tr>`).join('');
      if (!rows) rows = _t('<tr><td colspan="5">本版暂无已恢复的帖子。</td></tr>');
      return { title: b.name, html: topBar(`<a href="/">${_t('首页')}</a> » ${esc(b.name)}　<span style="color:#666">${_t('版主：')}${uLink(b.mod)}</span>`) + `<div class="wrap"><table class="t"><tr><th>${_t('主题')}</th><th>${_t('作者')}</th><th>${_t('回复')}</th><th>${_t('人气')}</th><th>${_t('发表时间')}</th></tr>${rows}</table></div>`, source: b.source || '' };
    }
    if (path === '/thread.asp') {
      const id = parseInt(P.id, 10);
      const t = THREAD[id];
      if (!t || !test(t.requires)) return { title: _t('帖子不存在'), html: topBar(`<a href="/">${_t('首页')}</a>`) + `<div class="err"><h1>${_t('错误：帖子不存在')}</h1><p>${_t('编号为')} ${esc(P.id || '')} ${_t('的帖子不存在，或者数据尚未恢复。')}</p><p style="color:#888">WTBBS Error 1032</p></div>` };
      if (t.lock && !solved(t.lock)) return lockPage(t.lock, win, t.title);
      opened('t' + t.id, t.onOpen);
      const b = D.bbsBoards.find(x => x.id === t.board);
      const posts = (t.posts || []).map((p, i) => {
        const au = USER[p.author] || { nick: p.author };
        return `<div class="post"><div class="who"><b>${uLink(p.author)}</b><br><span style="color:#666">${esc(p.author)}</span>${au.title ? `<br><span class="tt">${esc(au.title)}</span>` : ''}<br>${_t('帖子：')}${au.posts || 0}<br>${_t('注册：')}${esc((au.reg || '').slice(0, 10))}</div><div class="body"><div class="meta"><span>${i === 0 ? _t('<b>楼主</b>') : i + _t(' 楼')}　${_t('发表于')} ${esc(p.date || t.date)}</span>${i === 0 && t.ip ? `<span>IP：${esc(t.ip)}</span>` : ''}</div><div class="content">${fmt(p.html)}</div>${au.sig ? `<div class="sig">${esc(au.sig)}</div>` : ''}</div></div>`;
      }).join('');
      return { title: t.title, html: topBar(`<a href="/">${_t('首页')}</a> » <a href="/board.asp?id=${t.board}">${esc(b ? b.name : t.board)}</a> ${_t('» 帖子 #')}${t.id}`) + `<div class="wrap">${t.deleted ? _t('<div class="delbar">【该帖已被站务删除，仅管理员可见】</div>') : ''}<h2>${esc(strip(t.title))}</h2>${posts}</div>`, source: t.source || '', srcFlag: 'source_t' + t.id, onSource: t.onSource };
    }
    if (path === '/user.asp') {
      const us = uName(P.id);
      if (!us) return errPage(_t('用户不存在。'));
      const ts = visibleThreads().filter(t => t.author === us.id);
      const node = h('div', { html: topBar(`<a href="/">${_t('首页')}</a> » <a href="/users.asp">${_t('成员列表')}</a> » ${esc(us.nick)}`) + `<div class="wrap"><table class="t"><tr><th colspan="2">${_t('用户资料：')}${esc(us.nick)}（${esc(us.id)}）</th></tr><tr><td width="90">${_t('昵称')}</td><td>${esc(us.nick)}</td></tr><tr><td>${_t('性别')}</td><td>${esc(us.gender || '-')}</td></tr><tr><td>${_t('头衔')}</td><td>${esc(us.title || '-')}</td></tr><tr><td>${_t('注册时间')}</td><td>${esc(us.reg || '')}</td></tr><tr><td>${_t('最后登录')}</td><td>${esc(us.lastLogin || '')}</td></tr><tr><td>${_t('发帖数')}</td><td>${us.posts || 0}</td></tr><tr><td>${_t('个人介绍')}</td><td>${esc(us.intro || '')}</td></tr><tr><td>${_t('签名档')}</td><td>${esc(us.sig || '')}</td></tr></table><h2>${_t('TA 的帖子（已恢复')} ${ts.length} ${_t('篇）')}</h2><ul style="padding-left:18px;margin:0">${ts.map(t => `<li><a href="/thread.asp?id=${t.id}">${esc(strip(t.title))}</a> <span style="color:#888">${esc(t.date)}</span></li>`).join('') || _t('<li>无</li>')}</ul></div>` });
      const extras = D.userExtras.filter(x => x.user === us.id && test(x.requires));
      if (extras.length) {
        const ux = h('div', { class: 'ux' }); const out = h('div');
        extras.forEach(x => ux.append(controlButton({ class: 'b98', text: x.label }, () => markInteraction() || withLock(x.lock, () => { opened(x.id, x.onOpen); out.innerHTML = ''; out.append(h('div', { class: 'uxbox', html: fmt(x.html) })); }))));
        node.querySelector('.wrap').append(ux, out);
      }
      return { title: _t('用户资料 - ') + us.nick, node };
    }
    if (path === '/users.asp') {
      const rows = D.users.filter(x => test(x.requires)).map(x => `<tr><td>${uLink(x.id)}</td><td>${esc(x.id)}</td><td>${esc(x.title || '')}</td><td>${x.posts || 0}</td><td>${esc((x.reg || '').slice(0, 10))}</td><td>${esc(x.lastLogin || '')}</td></tr>`).join('');
      return { title: _t('成员列表'), html: topBar(`<a href="/">${_t('首页')}</a> ${_t('» 成员列表')}`) + `<div class="wrap"><table class="t"><tr><th>${_t('昵称')}</th><th>ID</th><th>${_t('头衔')}</th><th>${_t('发帖')}</th><th>${_t('注册')}</th><th>${_t('最后登录')}</th></tr>${rows}</table></div>` };
    }
    if (path === '/search.asp') {
      const q = (P.q || '').trim();
      const node = h('div', { html: topBar(`<a href="/">${_t('首页')}</a> ${_t('» 搜索')}`) });
      const wrap = h('div', { class: 'wrap' });
      const inp = h('input', { id: 'bbsq', value: q, style: { font: 'inherit', padding: '2px 4px', width: '220px' } });
      const go = () => ieGo(win, 'http://' + (D.bbsMeta.host || '192.168.1.103') + '/search.asp?q=' + encodeURIComponent(inp.value.trim()));
      inp.onkeydown = (e) => { if (confirmInput(e)) go(); };
      wrap.append(h('div', { style: { margin: '6px 0 10px' } }, _t('搜索帖子标题和内容：'), inp, ' ', controlButton({ class: 'b98', text: _t('搜索') }, go)));
      if (q) {
        const res = [];
        visibleThreads().forEach(t => {
          const hitTitle = strip(t.title).includes(q);
          const p = (t.posts || []).find(x => strip(x.html).includes(q));
          if (hitTitle || p) res.push({ t, snip: p ? strip(p.html) : strip(t.title) });
        });
        const hl = (s) => esc(s).split(esc(q)).join(`<span class="hl">${esc(q)}</span>`);
        wrap.append(h('div', { html: `<p>${_t('找到')} ${res.length} ${_t('个结果：')}</p>` + res.map(({ t, snip }) => { const i = Math.max(0, snip.indexOf(q) - 20); return `<p><a href="/thread.asp?id=${t.id}"><b>${hl(strip(t.title))}</b></a> <span style="color:#888">${esc(t.date)} · ${esc(USER[t.author] ? USER[t.author].nick : t.author)}</span><br>…${hl(snip.slice(i, i + 70))}…</p>`; }).join('') }));
      }
      node.append(wrap);
      return { title: _t('搜索'), node };
    }
    if (path.startsWith('/admin')) return adminRoute(path, P, win);
    return errPage();
  }
  function lockPage(lock, win, title) {
    const node = h('div', { html: topBar('') });
    const f = h('div', { class: 'form' }, h('b', { text: _t('此页面需要密码') }), puzzleForm(lock, { onSolved: () => win.refresh(true) }));
    node.append(f);
    return { title: title || _t('需要密码'), node };
  }
  function adminRoute(path, P, win) {
    const id = 'c1_admin';
    const host = D.bbsMeta.host || '192.168.1.103';
    if (!D.puzzles[id] || !solved(id)) {
      const node = h('div', { html: topBar(`<a href="/">${_t('首页')}</a> ${_t('» 站务管理')}`) });
      node.append(h('div', { class: 'form' }, D.puzzles[id] ? puzzleForm(id, { submitLabel: _t('登录'), wrongText: _t('密码错误。'), onSolved: () => win.refresh(true) }) : h('div', { text: _t('（暂不可用）') })));
      return { title: _t('站务管理登录'), node };
    }
    const sec = D.adminSections;
    const nav = `<div class="crumb admin"><b>${_t('站务管理')}</b>　${test(sec.recycle) ? _t('<a href="/admin/recycle.asp">回收站</a>　') : ''}${test(sec.logs) ? _t('<a href="/admin/log.asp">登录日志</a>　') : ''}${test(sec.users) ? _t('<a href="/admin/users.asp">用户管理</a>　') : ''}${test(sec.mails) ? _t('<a href="/admin/mail.asp">站内信</a>　') : ''}<span style="color:#888">${_t('已登录：sysop')}</span></div>`;
    const head = topBar('') + nav;
    if (path === '/admin' || path === '/admin/' || path === '/admin/index.asp') return { title: _t('站务管理'), html: head + `<div class="wrap"><p>${_t('欢迎回来，站长。')}</p><p style="color:#666">${_t('WTBBS 1.3 管理后台。请从上方选择功能。')}</p></div>` };
    if (path === '/admin/recycle.asp' && test(sec.recycle)) {
      const ts = D.threads.filter(t => t.deleted && test(t.requires));
      const rows = ts.map(t => `<tr><td>${t.id}</td><td><a href="/thread.asp?id=${t.id}">${esc(strip(t.title))}</a></td><td>${esc(t.author)}</td><td>${esc(t.date)}</td><td>${esc(t.ip || '')}</td><td>${esc(t.deletedAt || '')}</td></tr>`).join('') || _t('<tr><td colspan="6">回收站为空。</td></tr>');
      return { title: _t('回收站'), html: head + `<div class="wrap"><table class="t"><tr><th>${_t('编号')}</th><th>${_t('标题')}</th><th>${_t('作者')}</th><th>${_t('发表时间')}</th><th>${_t('发帖 IP')}</th><th>${_t('删除时间')}</th></tr>${rows}</table></div>` };
    }
    if (path === '/admin/log.asp' && test(sec.logs)) {
      const all = D.loginLog.filter(l => test(l.requires));
      const fu = (P.user || '').trim(), fd = (P.date || '').trim(), order = P.order === 'asc' ? 'asc' : 'desc';
      let rows = all.filter(l => (!fu || l.user.toLowerCase() === fu.toLowerCase()) && (!fd || l.time.startsWith(fd)));
      rows.sort((a, b) => order === 'asc' ? a.time.localeCompare(b.time) : b.time.localeCompare(a.time));
      const node = h('div', { html: head });
      const wrap = h('div', { class: 'wrap' });
      const iu = h('input', { id: 'lgu', value: fu, placeholder: _t('用户 ID'), style: { width: '100px', font: 'inherit' } });
      const id2 = h('input', { id: 'lgd', value: fd, placeholder: _t('日期，如 2000-01-01'), style: { width: '150px', font: 'inherit' } });
      const go = (o) => ieGo(win, `http://${host}/admin/log.asp?user=${encodeURIComponent(iu.value.trim())}&date=${encodeURIComponent(id2.value.trim())}&order=${o || order}`);
      iu.onkeydown = id2.onkeydown = (e) => { if (confirmInput(e)) go(); };
      wrap.append(h('div', { style: { margin: '4px 0 8px', display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' } }, _t('筛选：'), iu, id2, controlButton({ class: 'b98', text: _t('筛选') }, () => go()), controlButton({ class: 'b98', text: order === 'desc' ? _t('改为从旧到新') : _t('改为从新到旧') }, () => go(order === 'desc' ? 'asc' : 'desc')), h('span', { style: { color: '#666' }, text: `${_t('共')} ${rows.length} ${_t('条（时间为服务器时间）')}` })));
      wrap.append(h('div', { html: `<table class="t"><tr><th>${_t('时间')}</th><th>${_t('用户')}</th><th>IP</th><th>${_t('机器名')}</th></tr>${rows.slice(0, 400).map(l => `<tr><td>${esc(l.time)}</td><td>${esc(l.user)}</td><td>${esc(l.ip || '')}</td><td>${esc(l.host || '')}</td></tr>`).join('') || _t('<tr><td colspan="4">没有记录。</td></tr>')}</table>` }));
      node.append(wrap);
      return { title: _t('登录日志'), node };
    }
    if (path === '/admin/users.asp' && test(sec.users)) {
      const rows = D.users.filter(x => test(x.requires)).map(x => `<tr><td>${esc(x.id)}</td><td>${esc(x.nick)}</td><td>******</td><td>${esc(x.reg || '')}</td><td>${esc(x.lastLogin || '')}</td><td>${x.posts || 0}</td></tr>`).join('');
      return { title: _t('用户管理'), html: head + `<div class="wrap"><p style="color:#666">${_t('WTBBS 1.3 起密码加密存储，后台不再显示明文。')}</p><table class="t"><tr><th>ID</th><th>${_t('昵称')}</th><th>${_t('密码')}</th><th>${_t('注册时间')}</th><th>${_t('最后登录')}</th><th>${_t('发帖')}</th></tr>${rows}</table></div>` };
    }
    if (path === '/admin/mail.asp' && test(sec.mails)) {
      const all = D.mails.filter(m => test(m.requires));
      if (P.id) {
        const m = all.find(x => x.id === P.id);
        if (!m) return errPage(_t('信件不存在。'));
        opened(m.id, m.onOpen);
        return { title: _t('站内信'), html: head + `<div class="wrap"><p><a href="/admin/mail.asp?sort=${esc(P.sort || '')}${_t('">« 返回站内信列表')}</a></p><table class="t"><tr><th colspan="2">${esc(strip(m.subject || _t('（无主题）')))}</th></tr><tr><td width="80">${_t('发信人')}</td><td>${esc(m.from)}（${esc(USER[m.from] ? USER[m.from].nick : '')}）</td></tr><tr><td>${_t('收信人')}</td><td>${esc(m.to)}（${esc(USER[m.to] ? USER[m.to].nick : '')}）</td></tr><tr><td>${_t('发信时间')}</td><td>${esc(m.date)}</td></tr><tr><td colspan="2" style="padding:12px;font-size:13px;line-height:1.9">${fmt(m.body)}</td></tr></table></div>` };
      }
      const sort = P.sort || 'date_desc';
      const [k, dir] = sort.split('_');
      const key = { date: (m) => m.date, from: (m) => m.from.toLowerCase(), to: (m) => m.to.toLowerCase() }[k] || ((m) => m.date);
      const rows = all.slice().sort((a, b) => { const r = key(a).localeCompare(key(b)) || a.date.localeCompare(b.date); return dir === 'asc' ? r : -r; });
      const th = (kk, label) => { const cur = k === kk; const nd = cur && dir === 'desc' ? 'asc' : 'desc'; return `<th class="s"><a style="color:#fff" href="/admin/mail.asp?sort=${kk}_${nd}">${label}${cur ? (dir === 'desc' ? ' ▼' : ' ▲') : ''}</a></th>`; };
      return { title: _t('站内信'), html: head + `<div class="wrap"><p style="color:#666">${_t('全站站内信')} ${rows.length} ${_t('封。点击表头可以排序。')}</p><table class="t"><tr>${th('from', _t('发信人'))}${th('to', _t('收信人'))}<th>${_t('主题')}</th>${th('date', _t('发信时间'))}</tr>${rows.map(m => `<tr><td>${esc(m.from)}</td><td>${esc(m.to)}</td><td><a href="/admin/mail.asp?id=${encodeURIComponent(m.id)}&sort=${sort}">${esc(strip(m.subject || _t('（无主题）')))}</a>${S.opened[m.id] ? '' : ' <span style="color:#c00">•</span>'}</td><td>${esc(m.date)}</td></tr>`).join('')}</table></div>` };
    }
    return errPage();
  }

  // ============================================================
  // 渲染总入口
  // ============================================================
  function refreshWins(force) { wins.forEach(w => { if (w.o.live || force) w.refresh(); }); }
  function renderAll() {
    if (!S) return;
    renderPhone();
    if (S.stage === 'win' && $('#desktop')) {
      if (renderedFlagVer !== flagVer) { renderedFlagVer = flagVer; renderIcons(); refreshWins(); }
      renderTray();
    }
  }

  // ============================================================
  // 启动
  // ============================================================
  function boot() {
    bindTextInputs();
    prepAnswers();
    if (LANG !== 'zh') applyLang(LANGMAP[LANG]);
    applyPhotos();
    document.documentElement.lang = { zh: 'zh-CN', en: 'en', ja: 'ja' }[LANG];
    document.title = _t('千年虫 1');
    index(); buildFS();
    document.body.innerHTML = '';
    document.body.append(
      h('div', { id: 'app' },
        h('div', { id: 'deskwrap' }, h('div', { id: 'monitor' }, h('div', { id: 'screen' }), h('div', { class: 'brand', text: _t('七中机房 · 3 号') }), h('div', { class: 'led', id: 'led' }))),
        h('div', { id: 'phone' }, h('div', { class: 'ph-status', id: 'phStatus' }), h('div', { class: 'ph-main' }, h('div', { class: 'ph-head', id: 'phHead' }), h('div', { class: 'ph-body', id: 'phBody' }), h('div', { class: 'ph-choices', id: 'phFoot', hidden: true })), h('div', { class: 'ph-tabs', id: 'phTabs' }))),
      controlButton({ id: 'phoneFab', 'aria-label': _t('手机') }, () => togglePhone()),
      h('div', { id: 'modal' }), h('div', { id: 'overlay' }), h('div', { id: 'title', class: 'title', hidden: true }), h('div', { id: 'toast' }));
    ['pointerdown', 'keydown', 'wheel', 'touchstart'].forEach(ev => document.addEventListener(ev, resetIdle, { passive: true }));
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') { if (ctxEl) closeCtx(); else if ($('#modal').children.length) closeModal(); else if (overlay().classList.contains('on') && overlay().querySelector('.board, .viewer')) { closeOverlay(); showCards(); renderAll(); } }
    });
    setInterval(() => { if (!S) return; renderTray(); const st = $('#phStatus'); if (st) { const t = phoneNow(); st.querySelector('b') && (st.querySelector('b').textContent = t.hm); } }, 15000);
    setInterval(() => { if (S && !titleOn) { tickPlay(); writeSave('auto'); } }, 30000);
    document.addEventListener('visibilitychange', () => { syncPlayClock(); if (S && !titleOn) writeSave('auto'); });
    window.addEventListener('pagehide', () => { if (S && !titleOn) writeSave('auto'); playClockRunning = false; });
    window.addEventListener('pageshow', syncPlayClock);
    window.addEventListener('beforeunload', () => { if (S && !titleOn) writeSave('auto'); });
    window.addEventListener('resize', () => {
      if (!narrow() && ui.phoneOpen) togglePhone(false);
      const dk = desktop(); if (!dk) return;
      wins.forEach(w => {
        if (w.el.classList.contains('max')) return;
        w.el.style.left = Math.max(0, Math.min(parseFloat(w.el.style.left) || 0, dk.clientWidth - w.el.offsetWidth)) + 'px';
        w.el.style.top = Math.max(0, Math.min(parseFloat(w.el.style.top) || 0, dk.clientHeight - w.el.offsetHeight)) + 'px';
      });
    });
    S = fresh(_t('老K'));
    const panel = showTitle();
    const openLinkedPanel = () => { if (location.hash === '#leaderboard') $('#title .leaderboard-entry')?.click(); };
    if (!showAuthorNote(panel, openLinkedPanel)) openLinkedPanel();
    window.Y2KStats?.start();
  }

  // 测试与调试用（浏览器控制台）
  const debug = { get state() { return S; }, get pre() { return preEndSnap; }, D, test, act, setFlag: (f) => { setFlag(f); dirty(); }, solve: (id) => { solvePuzzle(id); dirty(); }, board: (id) => { setFlag('board_' + id); act(D.boards[id].onSolve); dirty(); }, openBoard, openFile: (id) => openFile(D.files.find(f => f.id === id)), openIE, ieGo: (u) => { const w = wins.find(x => x.key === 'ie'); w ? ieGo(w, u) : openIE(u); }, choose, flush: () => { clearTimers(); running = {}; typing = {}; }, fast: (on) => { FAST = on !== false; }, update: () => update(), ui, checkPuzzle, norm, showProps, closeModal, closeAllWins, openGexun, openApp, renderPhone, wins: () => wins, closeOverlay, showCards };
  return { add, boot, lang, debug };
})();
