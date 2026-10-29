// Anonymous results are separate from story saves; only completed runs are submitted.
(() => {
  'use strict';
  const config = window.Y2K_STATS_CONFIG || {}, game = config.game;
  const endpoint = config.leaderboardEndpoint;
  const enabled = !!endpoint && location.protocol === 'https:' && (config.allowedOrigins || []).includes(location.origin);
  const prefix = `y2k${game}_leaderboard_`, endings = ['A', 'B', 'C', 'H'];
  const words = {
    zh: { rule: '每个结局前 20 名 · 用时优先，用时相同则提示少者优先', privacy: '匿名记录，同一浏览器每个结局保留最好成绩。', clock: '用时按存档累计；首页、后台及结局阅读不计时。', swipe: '左右滑动查看四个结局', ending: '结局 ', hidden: '隐藏结局', rank: '名次', time: '通关用时', hints: '提示', empty: '暂无通关记录', loading: '正在读取排行榜…', error: '暂时无法读取排行榜，请稍后重试。', offline: '排行榜仅在在线版开放。', retry: '刷新榜单' },
    en: { rule: 'Top 20 per ending · Fastest time first; fewer hints break ties', privacy: 'Anonymous results. Each browser keeps its best result per ending.', clock: 'Time follows the save. Home, background tabs and ending screens are paused.', swipe: 'Swipe to see all four endings', ending: 'Ending ', hidden: 'Hidden ending', rank: 'Rank', time: 'Clear time', hints: 'Hints', empty: 'No completed runs yet', loading: 'Loading leaderboard…', error: 'Unable to load the leaderboard. Please try again.', offline: 'Leaderboards are available in the online edition.', retry: 'Refresh' },
    ja: { rule: '各結末の上位20件 · クリア時間順、同タイムならヒント回数順', privacy: '匿名で記録。同じブラウザでは各結末の最高記録を残します。', clock: '時間はセーブごとに累計。タイトル・バックグラウンド・結末閲覧中は停止。', swipe: '横にスワイプして4つの結末を表示', ending: '結末 ', hidden: '隠しエンド', rank: '順位', time: 'クリア時間', hints: 'ヒント', empty: 'まだ記録がありません', loading: 'ランキングを読込中…', error: 'ランキングを読み込めません。時間をおいて再試行してください。', offline: 'ランキングはオンライン版で利用できます。', retry: '更新' }
  };
  Object.assign(words.zh, { reviewTitle: '故事结束了，想留下几句话吗？', reviewLabel: '你的感受或评价（选填）', reviewHelp: '最多 500 字。评价会随本次成绩公开展示，可留空。', reviewOffline: '最多 500 字。离线版评价仅保存在本机。', reviewPlaceholder: '哪一刻让你停留，或有哪些地方希望改进……', reviewSubmit: '保存并继续', reviewSkip: '不留评价，继续', reviewHint: '悬停或点按名次、用时、提示次数，查看该次通关的评价。', reviewRead: '查看通关评价', reviewEmpty: '这位玩家没有留下评价。' });
  Object.assign(words.en, { reviewTitle: 'The story has ended. Would you like to leave a few words?', reviewLabel: 'Your thoughts or review (optional)', reviewHelp: 'Up to 500 characters. Your review will be public alongside this result. You may leave it blank.', reviewOffline: 'Up to 500 characters. Offline reviews are saved only on this device.', reviewPlaceholder: 'A moment that stayed with you, or something that could be improved…', reviewSubmit: 'Save and continue', reviewSkip: 'Continue without a review', reviewHint: 'Hover over or tap a rank, clear time or hint count to read the review for that run.', reviewRead: 'Read this run’s review', reviewEmpty: 'This player did not leave a review.' });
  Object.assign(words.ja, { reviewTitle: '物語を読み終えて、ひと言残しませんか？', reviewLabel: '感想・評価（任意）', reviewHelp: '500文字以内。感想は今回の記録とともに公開されます。空欄でも構いません。', reviewOffline: '500文字以内。オフライン版の感想はこの端末にのみ保存されます。', reviewPlaceholder: '心に残った場面や、改善してほしいことなど……', reviewSubmit: '保存して続ける', reviewSkip: '感想を残さず続ける', reviewHint: '順位・クリア時間・ヒント回数にカーソルを合わせるか、タップすると、その記録の感想が読めます。', reviewRead: 'この記録の感想を読む', reviewEmpty: 'このプレイヤーは感想を残していません。' });
  function get(key, fallback) { try { return JSON.parse(localStorage.getItem(prefix + key)) ?? fallback; } catch { return fallback; } }
  function put(key, value) { try { localStorage.setItem(prefix + key, JSON.stringify(value)); } catch {} }
  function newRun() {
    if (crypto.randomUUID) return crypto.randomUUID();
    return '10000000-1000-4000-8000-100000000000'.replace(/[018]/g, c => (Number(c) ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> Number(c) / 4).toString(16));
  }
  let playerId = get('player', null);
  if (typeof playerId !== 'string' || !/^[0-9a-f-]{36}$/i.test(playerId)) { playerId = newRun(); put('player', playerId); }
  const savedQueue = get('pending', {});
  const pending = savedQueue && typeof savedQueue === 'object' && !Array.isArray(savedQueue) ? savedQueue : {};
  let sending = false;
  async function flush() {
    if (!enabled || sending) return;
    sending = true;
    try {
      while (Object.keys(pending).length) {
        const [key, score] = Object.entries(pending)[0];
        let response;
        try { response = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(score), signal: AbortSignal.timeout(10000) }); } catch { break; }
        if (response.ok || response.status === 400) { if (pending[key] === score) delete pending[key]; put('pending', pending); }
        else break;
      }
    } finally { sending = false; }
  }
  function capture(state, ending) {
    if (!endings.includes(ending)) return;
    state.finishRecords ||= {};
    // Legacy saves do not know when an already-unlocked ending was first reached.
    if (!state.finishRecords[ending] && !(state.ends || []).includes(ending)) {
      const durationMs = Math.round(state.playMs || 0);
      const hints = Object.values(state.hints || {}).reduce((n, x) => n + (Number.isSafeInteger(x) && x > 0 ? x : 0), 0);
      if (durationMs < 1000 || durationMs > 31536000000 || hints > 10000) return;
      state.runId ||= newRun();
      state.finishRecords[ending] = { durationMs, hints, review: null };
    }
    const result = state.finishRecords[ending];
    // A pre-ending/manual save may predate a submitted review. Restore only an
    // exact completion's receipt, never a different run's (or ending's) comment.
    if (result && state.runId) {
      const receipt = get(reviewKey(state, ending), null);
      if (typeof receipt === 'string') { result.review = receipt; delete result.reviewDraft; }
    }
    if (!enabled || !result || !state.runId) return;
    pending[`${state.runId}:${ending}`] = { game, ending, playerId, runId: state.runId, durationMs: result.durationMs, hints: result.hints,
      ...(typeof result.review === 'string' ? { review: result.review } : {}) };
    put('pending', pending); void flush();
  }
  function resume(state) {
    for (const ending of endings) if (state.finishRecords?.[ending]) capture(state, ending);
  }
  function time(ms) {
    const seconds = Math.floor(ms / 1000), pad = n => String(n).padStart(2, '0');
    return `${pad(Math.floor(seconds / 3600))}:${pad(Math.floor(seconds / 60) % 60)}:${pad(seconds % 60)}.${String(ms % 1000).padStart(3, '0')}`;
  }
  function el(tag, className, text) { const node = document.createElement(tag); if (className) node.className = className; if (text !== undefined) node.textContent = text; return node; }
  function reviewKey(state, ending) {
    const result = state.finishRecords[ending];
    return `review:${state.runId}:${ending}:${result.durationMs}:${result.hints}`;
  }
  function requestReview(host, state, ending, language, save) {
    const result = state.finishRecords?.[ending];
    // Older completed saves are not prompted retroactively.
    if (!result || result.review !== null) return;
    const t = words[language] || words.zh;
    const dialog = el('dialog', 'finish-review'); dialog.setAttribute('aria-labelledby', 'finish-review-title');
    const heading = el('h2', '', t.reviewTitle); heading.id = 'finish-review-title'; heading.tabIndex = -1;
    const summary = el('p', 'finish-review-summary', `${ending === 'H' ? t.hidden : t.ending + ending} · ${t.time} ${time(result.durationMs)} · ${t.hints} ${result.hints}`);
    const label = el('label', '', t.reviewLabel); label.htmlFor = 'finish-review-input';
    const input = el('textarea'); input.id = 'finish-review-input'; input.maxLength = 500; input.rows = 5; input.placeholder = t.reviewPlaceholder;
    input.value = typeof result.reviewDraft === 'string' ? result.reviewDraft.slice(0, 500) : '';
    input.setAttribute('aria-describedby', 'finish-review-help finish-review-count');
    const help = el('p', 'leaderboard-note', enabled ? t.reviewHelp : t.reviewOffline); help.id = 'finish-review-help';
    const count = el('p', 'finish-review-count', `${input.value.length} / 500`); count.id = 'finish-review-count';
    input.oninput = () => { result.reviewDraft = input.value.slice(0, 500); count.textContent = `${input.value.length} / 500`; save(); };
    let done = false;
    const finish = text => {
      if (done) return; done = true;
      result.review = text.trim().slice(0, 500); delete result.reviewDraft;
      put(reviewKey(state, ending), result.review); save(); capture(state, ending);
      dialog.close(); dialog.remove(); host.tabIndex = -1; host.focus({ preventScroll: true });
    };
    const actions = el('div', 'finish-review-actions');
    const submit = el('button', 'tbtn finish-review-submit', t.reviewSubmit); submit.type = 'button'; submit.onclick = () => finish(input.value);
    const skip = el('button', 'tbtn finish-review-skip', t.reviewSkip); skip.type = 'button'; skip.onclick = () => finish('');
    actions.append(submit, skip); dialog.append(heading, summary, label, input, count, help, actions); host.append(dialog);
    dialog.addEventListener('cancel', e => { e.preventDefault(); finish(''); });
    dialog.addEventListener('keydown', e => e.stopPropagation());
    dialog.showModal(); heading.focus({ preventScroll: true });
  }
  function mount(body, language) {
    const t = words[language] || words.zh;
    body.closest('.title-panel').classList.add('leaderboard-panel');
    const status = el('p', 'leaderboard-status'); status.setAttribute('role', 'status');
    const refresh = el('button', 'tbtn', t.retry); refresh.type = 'button';
    const toolbar = el('div', 'leaderboard-toolbar'); toolbar.append(status, refresh);
    const scroll = el('div', 'leaderboard-scroll'); scroll.tabIndex = 0; scroll.setAttribute('aria-label', t.swipe);
    const grid = el('div', 'leaderboard-grid'); scroll.append(grid);
    body.append(el('p', 'leaderboard-rule', t.rule), el('p', 'leaderboard-note', t.privacy), el('p', 'leaderboard-note', t.clock), el('p', 'leaderboard-note', t.reviewHint), toolbar, el('p', 'leaderboard-swipe', t.swipe), scroll);
    const layer = body.closest('.title-panel-layer');
    const tip = el('div', 'leaderboard-review'); tip.id = 'leaderboard-review'; tip.setAttribute('role', 'tooltip'); tip.hidden = true;
    layer.append(tip);
    let current = null, pinned = false, hideTimer;
    function hideReview() {
      clearTimeout(hideTimer); current?.removeAttribute('aria-describedby'); current = null; pinned = false; tip.hidden = true;
    }
    function showReview(button, score, ending, rank) {
      clearTimeout(hideTimer); current?.removeAttribute('aria-describedby'); current = button;
      button.setAttribute('aria-describedby', tip.id);
      tip.replaceChildren(el('strong', '', `${ending === 'H' ? t.hidden : t.ending + ending} · ${t.rank} ${rank}`),
        el('p', 'leaderboard-review-score', `${t.time} ${time(score.durationMs)} · ${t.hints} ${score.hints}`),
        el('p', 'leaderboard-review-text', typeof score.review === 'string' && score.review.trim() ? score.review : t.reviewEmpty));
      tip.hidden = false;
      const r = button.getBoundingClientRect(), rect = tip.getBoundingClientRect();
      tip.style.left = `${Math.max(8, Math.min(innerWidth - rect.width - 8, r.x + r.width / 2 - rect.width / 2))}px`;
      tip.style.top = `${Math.max(8, r.bottom + rect.height + 12 <= innerHeight ? r.bottom + 6 : r.top - rect.height - 6)}px`;
    }
    const deferHide = () => { if (!pinned) hideTimer = setTimeout(hideReview, 180); };
    tip.onpointerenter = () => clearTimeout(hideTimer); tip.onpointerleave = deferHide;
    layer.addEventListener('pointerdown', e => { if (!e.target.closest('.leaderboard-number, .leaderboard-review')) hideReview(); });
    layer.addEventListener('keydown', e => { if (e.key === 'Escape' && current) { e.preventDefault(); e.stopImmediatePropagation(); hideReview(); } }, true);
    body.addEventListener('scroll', e => { if (!tip.contains(e.target)) hideReview(); }, true);
    function render(data) {
      hideReview();
      grid.replaceChildren();
      for (const ending of endings) {
        const column = el('section', 'leaderboard-column'); column.dataset.ending = ending;
        column.append(el('h4', '', ending === 'H' ? t.hidden : t.ending + ending));
        const table = el('table'); const head = el('thead'), tr = el('tr');
        [t.rank, t.time, t.hints].forEach(label => { const th = el('th', '', label); th.scope = 'col'; tr.append(th); });
        head.append(tr); const rows = el('tbody');
        (data?.[ending] || []).slice(0, 20).forEach((score, i) => {
          const row = el('tr');
          [i + 1, time(score.durationMs), score.hints].forEach((value, columnIndex) => {
            const cell = el('td'), button = el('button', 'leaderboard-number', value); button.type = 'button';
            button.setAttribute('aria-label', `${[t.rank, t.time, t.hints][columnIndex]} ${value} · ${t.reviewRead}`);
            button.onpointerenter = e => { if (e.pointerType === 'mouse' && !pinned) showReview(button, score, ending, i + 1); };
            button.onpointerleave = deferHide;
            button.onfocus = () => { if (!pinned) showReview(button, score, ending, i + 1); };
            button.onblur = hideReview;
            button.onclick = () => { if (pinned && current === button) hideReview(); else { showReview(button, score, ending, i + 1); pinned = true; } };
            cell.append(button); row.append(cell);
          });
          rows.append(row);
        });
        table.append(head, rows); column.append(table);
        if (!rows.children.length) column.append(el('p', 'leaderboard-empty', t.empty));
        grid.append(column);
      }
    }
    async function refreshBoard() {
      if (!enabled) { status.textContent = t.offline; refresh.hidden = true; render(); return; }
      refresh.disabled = true; status.textContent = t.loading;
      try {
        await flush();
        const response = await fetch(endpoint, { cache: 'no-store', signal: AbortSignal.timeout(10000) });
        if (!response.ok) throw new Error('unavailable');
        const data = await response.json();
        if (data.game !== game || !endings.every(id => Array.isArray(data.endings?.[id]) && data.endings[id].every(s => Number.isSafeInteger(s.durationMs) && s.durationMs >= 1000 && Number.isSafeInteger(s.hints) && s.hints >= 0))) throw new Error('invalid response');
        if (!body.isConnected) return;
        render(data.endings); status.textContent = '';
      } catch { if (body.isConnected) status.textContent = t.error; }
      finally { refresh.disabled = false; }
    }
    render();
    refresh.onclick = () => refreshBoard().finally(() => { if (body.isConnected) refresh.focus(); });
    void refreshBoard();
  }
  window.Y2KLeaderboard = { newRun, capture, resume, mount, requestReview };
  window.addEventListener('online', flush);
  setInterval(flush, 60000);
  void flush();
})();
