// 通关可达性模拟：node tools/simulate.js
// 假设玩家会打开所有能看到的东西、解开所有能接触到的谜题，检查能否从开局一路走到各个结局，
// 并列出永远到不了的章节、谜题、推理板、文件、对话。
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const dir = path.join(__dirname, '..', 'src', 'content');
const order = ['base.js', 'ch0.js', 'ch1.js', 'ch2.js', 'ch3.js', 'ch4.js', 'ch5.js', 'ch6.js', 'story.js'];
const chunks = [];
for (const f of order) {
  const p = path.join(dir, f);
  if (!fs.existsSync(p)) continue;
  vm.runInNewContext(fs.readFileSync(p, 'utf8'), { Y2K: { add: (o) => chunks.push(o) } }, { filename: f });
}
const D = { chapters: [], files: [], threads: [], mails: [], pages: [], userExtras: [], gx: [], puzzles: {}, boards: {}, dialogues: [], mails2026: [], items2026: [], collectibles: {}, endings: {}, screensaver: [], apps: {}, admin: {}, boot: {} };
for (const o of chunks) {
  D.chapters.push(...(o.chapters || [])); D.files.push(...(o.files || [])); D.dialogues.push(...(o.dialogues || []));
  D.mails2026.push(...(o.mails2026 || [])); D.items2026.push(...(o.items2026 || [])); D.userExtras.push(...(o.userExtras || [])); D.screensaver.push(...(o.screensaver || []));
  Object.assign(D.puzzles, o.puzzles || {}); Object.assign(D.boards, o.boards || {}); Object.assign(D.collectibles, o.collectibles || {}); Object.assign(D.endings, o.endings || {});
  Object.assign(D.apps, o.apps || {}); Object.assign(D.boot, o.boot || {});
  if (o.bbs) { D.threads.push(...(o.bbs.threads || [])); D.mails.push(...(o.bbs.mails || [])); D.pages.push(...(o.bbs.pages || [])); Object.assign(D.admin, o.bbs.adminSections || {}); }
  if (o.gexun) D.gx.push(...(o.gexun.logs || []));
}

function simulate(choicePolicy) {
  const F = { start: true };
  const test = (e) => {
    if (!e) return true;
    const toks = e.match(/[A-Za-z0-9_]+|[()&|!]/g) || []; let i = 0;
    const or = () => { let a = and(); while (toks[i] === '|') { i++; const b = and(); a = a || b; } return a; };
    const and = () => { let a = not(); while (toks[i] === '&') { i++; const b = not(); a = a && b; } return a; };
    const not = () => { if (toks[i] === '!') { i++; return !not(); } return atom(); };
    const atom = () => { const t = toks[i++]; if (t === '(') { const a = or(); i++; return a; } return !!F[t]; };
    return or();
  };
  const collected = new Set(); const endings = []; const log = [];
  const act = (a, where) => {
    if (!a) return;
    (a.set || []).forEach(f => F[f] = true);
    (a.unset || []).forEach(f => delete F[f]);
    if (a.collect) { collected.add(a.collect); F['col_' + a.collect] = true; if (collected.size >= Object.keys(D.collectibles).length) F.collected_all = true; }
    if (a.mail) F['__mail_' + a.mail] = true;
    if (a.ending) { endings.push(a.ending); F['ending_' + a.ending] = true; log.push(`结局 ${a.ending} ← ${where}`); }
  };
  const reachable = new Set();
  const solve = (id, where) => { if (F['solved_' + id] || !D.puzzles[id]) return false; F['solved_' + id] = true; act(D.puzzles[id].onSolve, 'puzzle ' + id); log.push(`解谜 ${id}（${where}）`); return true; };
  const tryLock = (lock, where) => { if (!lock) return true; reachable.add(lock); if (!F['solved_' + lock]) solve(lock, where); return !!F['solved_' + lock]; };
  const once = new Set();
  const openOnce = (key, flag, a, where) => { if (once.has(key)) return; once.add(key); if (flag) F[flag] = true; act(a, where); };
  const dlgState = {};
  const queues = {};
  let changed = true, rounds = 0;
  while (changed && rounds++ < 500) {
    const before = JSON.stringify(F);
    D.chapters.forEach(c => { if (!F[c.id] && test(c.trigger)) { F[c.id] = true; log.push(`== 进入 ${c.id} ${c.name}`); } });
    if (D.boot.biosLock) tryLock(D.boot.biosLock, 'boot');
    if (D.boot.loginLock && F['solved_' + D.boot.biosLock]) tryLock(D.boot.loginLock, 'boot');
    const desktop = !!F['solved_' + D.boot.loginLock];
    if (desktop) {
      D.files.forEach(f => {
        if (!test(f.requires)) return;
        if (f.deleted) F['restored_' + f.id] = true;
        if (!tryLock(f.type === 'zip' ? f.lock : f.lock, 'file ' + f.id)) { if (f.type !== 'zip') return; }
        openOnce('f' + f.id, 'seen_' + f.id, f.onOpen, 'file ' + f.id);
        openOnce('p' + f.id, 'props_' + f.id, f.onProps, 'props ' + f.id);
        if (f.tape) Object.keys(f.tape.speeds || {}).concat(['0.5', '0.75', '1', '1.25', '1.5', '2']).forEach(s => { F[`speed_${f.id}_${String(s).replace('.', '_')}`] = true; if (f.tape.onSpeed && f.tape.onSpeed[s]) openOnce('s' + f.id + s, null, f.tape.onSpeed[s], 'tape ' + f.id); });
      });
      const bbsOK = test((D.apps.bbs || {}).requires);
      if (bbsOK) {
        if (D.puzzles.c1_admin && test('ch1')) tryLock('c1_admin', 'bbs admin');
        D.threads.forEach(t => { if (!test(t.requires)) return; if (t.deleted && !F.solved_c1_admin && !t.__url) { /* 地址栏也能打开 */ } if (!tryLock(t.lock, 'thread ' + t.id)) return; openOnce('t' + t.id, 'seen_t' + t.id, t.onOpen, 'thread ' + t.id); openOnce('st' + t.id, 'source_t' + t.id, t.onSource, 'source ' + t.id); });
        D.pages.forEach(p => { if (!test(p.requires) || !tryLock(p.lock, 'page ' + p.id)) return; openOnce('pg' + p.id, 'seen_' + p.id, p.onOpen, 'page ' + p.id); openOnce('sp' + p.id, 'source_' + p.id, p.onSource, 'source ' + p.id); });
        if (F.solved_c1_admin && test(D.admin.mails)) D.mails.forEach(m => { if (test(m.requires)) openOnce('m' + m.id, 'seen_' + m.id, m.onOpen, 'mail ' + m.id); });
        D.userExtras.forEach(x => { if (test(x.requires) && tryLock(x.lock, 'ux ' + x.id)) openOnce('ux' + x.id, 'seen_' + x.id, x.onOpen, 'ux ' + x.id); });
      }
      const gx = D.apps.gexun || {};
      if (test(gx.requires) && tryLock(gx.lock, 'gexun')) D.gx.forEach(l => { if (test(l.requires)) openOnce('g' + l.id, 'seen_' + l.id, l.onOpen, 'gx ' + l.id); });
      D.screensaver.forEach((s, i) => { if (test(s.requires)) openOnce('ss' + i, null, s.onShow, 'screensaver'); });
    }
    D.mails2026.forEach(m => { if ((m.requires && test(m.requires)) || F['__mail_' + m.id]) openOnce('M' + m.id, 'seen_' + m.id, m.onOpen, 'mail26 ' + m.id); });
    D.items2026.forEach(it => { if (test(it.requires)) openOnce('I' + it.id, 'seen_' + it.id, it.onOpen, 'item ' + it.id); });
    Object.entries(D.puzzles).forEach(([id, p]) => { if (p.ask && test(p.requires)) tryLock(id, 'ask'); });
    Object.entries(D.boards).forEach(([id, b]) => { if (!F['board_' + id] && test(b.requires)) { F['board_' + id] = true; act(b.onSolve, 'board ' + id); log.push(`推理板 ${id}`); } });
    // 对话
    D.dialogues.forEach(d => { if (!dlgState[d.id] && test(d.trigger)) { dlgState[d.id] = { i: 0 }; (queues[d.contact] = queues[d.contact] || []).push(d.id); } });
    for (const c of Object.keys(queues)) {
      while (queues[c].length) {
        const d = D.dialogues.find(x => x.id === queues[c][0]); const st = dlgState[d.id];
        let blocked = false;
        while (st.i < d.steps.length) {
          const s = d.steps[st.i];
          if (s.action) act(s.action, 'dialogue ' + d.id);
          if (s.needs && !test(s.needs)) { blocked = true; break; }
          if (s.wait && !test(s.wait)) { blocked = true; break; }
          if (s.puzzle) { tryLock(s.puzzle, 'dialogue ' + d.id); if (!F['solved_' + s.puzzle]) { blocked = true; break; } }
          if (s.choice) {
            s.choice.forEach((o, k) => { if (o.action && o.action.ending) log.push(`  （可选结局 ${o.action.ending}：${d.id} 的选项"${o.text}"）`); });
            const pick = choicePolicy(d, s.choice);
            act(s.choice[pick].action, `dialogue ${d.id} 选项"${s.choice[pick].text}"`);
          }
          st.i++;
        }
        if (blocked) break;
        F['dlg_' + d.id] = true; queues[c].shift();
      }
    }
    changed = JSON.stringify(F) !== before;
  }
  return { F, endings, log, collected, reachable, dlgState };
}

// 默认策略：优先不触发结局的选项
const avoidEnding = (d, choices) => { const i = choices.findIndex(o => !(o.action && o.action.ending)); return i < 0 ? 0 : i; };
const prefer = process.argv.filter(a => a.startsWith('--prefer=')).map(a => a.slice(9));
const policy = (d, choices) => { for (const k of prefer) { const i = choices.findIndex(o => o.text.includes(k)); if (i >= 0) return i; } return avoidEnding(d, choices); };
const r = simulate(policy);
const verbose = process.argv.includes('-v');
if (verbose) r.log.forEach(l => console.log(l));
console.log('\n到达的章节：', D.chapters.filter(c => r.F[c.id]).map(c => c.id).join(' '));
console.log('到达的结局：', r.endings.join(' ') || '（无）');
const optEnd = r.log.filter(l => l.includes('可选结局'));
console.log('路上可选的结局：'); [...new Set(optEnd)].forEach(l => console.log(l));
console.log(`收集品：${r.collected.size}/${Object.keys(D.collectibles).length}`);
const unsolved = Object.keys(D.puzzles).filter(id => !r.F['solved_' + id]);
if (unsolved.length) console.log('从未解开的谜题：', unsolved.join(', '));
const noBoard = Object.keys(D.boards).filter(id => !r.F['board_' + id]);
if (noBoard.length) console.log('从未完成的推理板：', noBoard.join(', '));
const noFile = D.files.filter(f => f.id && !r.F['seen_' + f.id] && f.type !== 'folder').map(f => f.id);
if (noFile.length) console.log('从未打开的文件：', noFile.join(', '));
const noThread = D.threads.filter(t => !r.F['seen_t' + t.id]).map(t => t.id);
if (noThread.length) console.log('从未打开的帖子：', noThread.join(', '));
const noDlg = D.dialogues.filter(d => !r.F['dlg_' + d.id]).map(d => `${d.id}${r.dlgState[d.id] ? '(卡在第' + (r.dlgState[d.id].i + 1) + '步)' : '(未触发)'}`);
if (noDlg.length) console.log('没有播完的对话：', noDlg.join(', '));
const noMail = D.mails2026.filter(m => !r.F['seen_' + m.id]).map(m => m.id);
if (noMail.length) console.log('没有送达的邮件：', noMail.join(', '));
const noItem = D.items2026.filter(m => !r.F['seen_' + m.id]).map(m => m.id);
if (noItem.length) console.log('没有出现的物品：', noItem.join(', '));
