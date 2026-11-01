// Public feedback has its own anonymous ID and drafts; it never reads game saves.
(() => {
  'use strict';
  const config = window.Y2K_STATS_CONFIG || {}, endpoint = config.feedbackEndpoint;
  const enabled = !!endpoint && (config.allowedOrigins || []).includes(location.origin);
  const prefix = 'y2k_feedback_';
  const read = (key, fallback) => { try { return JSON.parse(localStorage.getItem(prefix + key)) ?? fallback; } catch { return fallback; } };
  const write = (key, value) => { try { localStorage.setItem(prefix + key, JSON.stringify(value)); } catch {} };
  const uuid = () => crypto.randomUUID ? crypto.randomUUID() : '10000000-1000-4000-8000-100000000000'.replace(/[018]/g, c => (Number(c) ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> Number(c) / 4).toString(16));
  let visitor = read('visitor', null);
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(visitor || '')) { visitor = uuid(); write('visitor', visitor); }
  let draft = read('draft', {}), pending = read('pending', null);
  if (!draft || typeof draft !== 'object') draft = {};
  const words = {
    zh: { title: '评分与留言', help: '匿名发布，所有人都可以看到。评分为 1–10 分，留言选填，最多 500 字。', rating: '你的评分', message: '留言（选填）', placeholder: '聊聊你的感受，也欢迎提出建议……', publish: '匿名发布', sending: '正在发布…', sent: '已发布，谢谢你的分享。', choose: '请先选择 1–10 分。', failed: '发布未确认，请保留内容并重试。', limited: '发布太频繁，请稍后再试。', retry: '重试发布', loading: '正在读取…', loadError: '暂时无法读取，请点击刷新重试。', refresh: '刷新', empty: '还没有评分或留言，欢迎留下第一条。', anonymous: '匿名玩家', ratingOnly: '这位玩家只留下了评分。', previous: '上一页', next: '下一页', pages: (p, n) => `第 ${p} / ${n} 页`, summary: (average, count, total) => `平均评分 ${average === null ? '—' : average.toFixed(1)} / 10 · ${count} 人评分 · ${total} 条反馈`, offline: '评分与留言仅在在线版开放。', online: '打开在线版', list: '玩家评分与留言', pageNav: '留言翻页' },
    en: { title: 'Ratings & messages', help: 'Post anonymously for everyone to read. Rate from 1 to 10; an optional message can contain up to 500 characters.', rating: 'Your rating', message: 'Message (optional)', placeholder: 'Share your thoughts or suggestions…', publish: 'Post anonymously', sending: 'Posting…', sent: 'Posted. Thank you for sharing.', choose: 'Choose a rating from 1 to 10 first.', failed: 'Posting was not confirmed. Your text is saved; try again.', limited: 'You are posting too quickly. Please try again shortly.', retry: 'Retry posting', loading: 'Loading…', loadError: 'Unable to load feedback. Select Refresh to try again.', refresh: 'Refresh', empty: 'No ratings or messages yet. Be the first to share.', anonymous: 'Anonymous player', ratingOnly: 'This player left a rating only.', previous: 'Previous', next: 'Next', pages: (p, n) => `Page ${p} of ${n}`, summary: (average, count, total) => `Average ${average === null ? '—' : average.toFixed(1)} / 10 · ${count} rated · ${total} posts`, offline: 'Ratings and messages are available in the online edition.', online: 'Open online edition', list: 'Player ratings and messages', pageNav: 'Message pages' },
    ja: { title: '評価とメッセージ', help: '匿名で投稿し、誰でも閲覧できます。評価は1〜10点、メッセージは任意で500文字までです。', rating: 'あなたの評価', message: 'メッセージ（任意）', placeholder: '感想や改善してほしいことなど……', publish: '匿名で投稿', sending: '投稿中…', sent: '投稿しました。ありがとうございます。', choose: '先に1〜10点の評価を選んでください。', failed: '投稿を確認できませんでした。内容を残して再試行してください。', limited: '投稿の間隔を空けて、もう一度お試しください。', retry: '投稿を再試行', loading: '読込中…', loadError: '読み込めませんでした。「更新」で再試行してください。', refresh: '更新', empty: 'まだ評価やメッセージはありません。最初の感想をどうぞ。', anonymous: '匿名プレイヤー', ratingOnly: '評価のみの投稿です。', previous: '前のページ', next: '次のページ', pages: (p, n) => `${p} / ${n} ページ`, summary: (average, count, total) => `平均 ${average === null ? '—' : average.toFixed(1)} / 10 · ${count}人が評価 · ${total}件`, offline: '評価とメッセージはオンライン版で利用できます。', online: 'オンライン版を開く', list: 'プレイヤーの評価とメッセージ', pageNav: 'ページ切り替え' },
  };
  function el(tag, cls, text) { const node = document.createElement(tag); if (cls) node.className = cls; if (text !== undefined) node.textContent = text; return node; }
  async function request(url, options = {}) {
    const controller = new AbortController(), timer = setTimeout(() => controller.abort(), 12000);
    try {
      const response = await fetch(url, { ...options, credentials: 'omit', cache: 'no-store', signal: controller.signal });
      const data = await response.json();
      if (!response.ok) { const error = new Error(data.error || 'request_failed'); error.status = response.status; throw error; }
      return data;
    } finally { clearTimeout(timer); }
  }
  function mount(body, language = 'zh') {
    const t = words[language] || words.zh;
    body.parentElement.classList.add('feedback-panel');
    if (!enabled) {
      const link = el('a', 'tbtn feedback-online', t.online); link.href = 'https://qiannianchonggame.github.io/'; link.target = '_blank'; link.rel = 'noopener';
      body.append(el('p', 'feedback-help', t.offline), link); return;
    }
    const summary = el('p', 'feedback-summary', t.loading), help = el('p', 'feedback-help', t.help);
    const layout = el('div', 'feedback-layout'), form = el('form', 'feedback-form');
    const fieldset = el('fieldset', 'feedback-ratings'), legend = el('legend', '', t.rating), scores = el('div', 'feedback-scores');
    fieldset.append(legend, scores);
    let selected = Number.isInteger(draft.rating) && draft.rating >= 1 && draft.rating <= 10 ? draft.rating : 0;
    for (let n = 1; n <= 10; n++) {
      const label = el('label', 'feedback-score'), radio = document.createElement('input');
      radio.type = 'radio'; radio.name = 'feedback-rating'; radio.value = String(n); radio.checked = selected === n;
      radio.setAttribute('aria-label', `${n} / 10`);
      label.append(radio, el('span', '', String(n))); scores.append(label);
    }
    const label = el('label', 'feedback-label', t.message); label.htmlFor = 'feedback-message';
    const input = el('textarea'); input.id = 'feedback-message'; input.rows = 5; input.maxLength = 500; input.placeholder = t.placeholder;
    input.value = typeof draft.message === 'string' ? draft.message.slice(0, 500) : '';
    const count = el('p', 'feedback-count', `${input.value.length} / 500`), postStatus = el('p', 'feedback-post-status');
    count.id = 'feedback-count'; input.setAttribute('aria-describedby', count.id); postStatus.setAttribute('role', 'status');
    const publish = el('button', 'tbtn feedback-publish', t.publish); publish.type = 'submit';
    form.append(fieldset, label, input, count, publish, postStatus);
    const section = el('section', 'feedback-list-section'), toolbar = el('div', 'feedback-toolbar');
    section.setAttribute('aria-label', t.list);
    const listStatus = el('p', 'feedback-list-status', t.loading); listStatus.setAttribute('role', 'status');
    const refresh = el('button', 'tbtn', t.refresh); refresh.type = 'button'; toolbar.append(listStatus, refresh);
    const nav = el('nav', 'feedback-pagination'); nav.setAttribute('aria-label', t.pageNav);
    const previous = el('button', 'tbtn', t.previous), pageLabel = el('span', 'feedback-page', t.pages(1, 1)), next = el('button', 'tbtn', t.next);
    previous.type = next.type = 'button'; previous.disabled = next.disabled = true;
    pageLabel.setAttribute('aria-live', 'polite'); nav.append(previous, pageLabel, next);
    const list = el('div', 'feedback-list'); section.append(toolbar, nav, list); layout.append(form, section); body.append(summary, help, layout);
    let page = 1, pages = 1, generation = 0, loading = false, sending = false;
    const buttons = () => { previous.disabled = loading || page <= 1; next.disabled = loading || page >= pages; };
    const remember = () => { draft = { rating: selected, message: input.value }; write('draft', draft); };
    form.oninput = () => { selected = Number(form.querySelector('input:checked')?.value || 0); count.textContent = `${input.value.length} / 500`; remember(); };
    async function load(target, scroll = false) {
      const token = ++generation; loading = true; buttons(); listStatus.textContent = t.loading; list.setAttribute('aria-busy', 'true');
      try {
        const url = new URL(endpoint); url.searchParams.set('page', String(target));
        const data = await request(url.href);
        if (!body.isConnected || token !== generation) return;
        if (!Array.isArray(data.items) || !Number.isSafeInteger(data.page) || !Number.isSafeInteger(data.pages) || data.page < 1 || data.pages < data.page) throw Error('invalid_response');
        page = data.page; pages = data.pages;
        summary.textContent = t.summary(data.averageRating, data.ratingCount, data.total); pageLabel.textContent = t.pages(page, pages);
        list.replaceChildren();
        for (const entry of data.items) {
          const article = el('article', 'feedback-entry'), head = el('div', 'feedback-entry-head'), date = new Date(entry.createdAt);
          const time = el('time', ''); if (Number.isFinite(date.getTime())) { time.dateTime = date.toISOString(); time.textContent = date.toLocaleString({ zh: 'zh-CN', en: 'en-US', ja: 'ja-JP' }[language] || 'zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }); }
          head.append(el('strong', '', t.anonymous), el('span', 'feedback-entry-rating', `${entry.rating} / 10`), time);
          article.append(head, el('p', 'feedback-entry-message', entry.message || t.ratingOnly)); list.append(article);
        }
        if (!data.items.length) list.append(el('p', 'feedback-empty', t.empty));
        listStatus.textContent = '';
        if (scroll) section.scrollIntoView({ block: 'start', behavior: 'smooth' });
      } catch {
        if (body.isConnected && token === generation) listStatus.textContent = t.loadError;
      } finally {
        if (token === generation) { loading = false; buttons(); list.removeAttribute('aria-busy'); }
      }
    }
    previous.onclick = () => load(page - 1, true); next.onclick = () => load(page + 1, true); refresh.onclick = () => load(page);
    form.onsubmit = async event => {
      event.preventDefault(); if (sending) return;
      selected = Number(form.querySelector('input:checked')?.value || 0);
      if (selected < 1 || selected > 10) { postStatus.textContent = t.choose; return; }
      const message = input.value.trim();
      const reuse = pending && pending.visitorId === visitor && pending.rating === selected && pending.message === message;
      const submission = reuse ? pending : { game: '1', submissionId: uuid(), visitorId: visitor, rating: selected, message };
      pending = submission; write('pending', pending); remember();
      sending = true; publish.disabled = true; publish.textContent = t.sending; postStatus.textContent = '';
      try {
        const result = await request(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(submission) });
        if (!result.accepted) throw Error('not_accepted');
        if (pending?.submissionId === submission.submissionId) { pending = null; write('pending', null); draft = { rating: selected, message: '' }; write('draft', draft); }
        if (!body.isConnected) return;
        input.value = ''; count.textContent = '0 / 500'; postStatus.textContent = t.sent;
        publish.textContent = t.publish; void load(1);
      } catch (error) {
        if (!body.isConnected) return;
        postStatus.textContent = error.status === 429 ? t.limited : t.failed; publish.textContent = t.retry;
      } finally { sending = false; publish.disabled = false; }
    };
    void load(1);
  }
  window.Y2KFeedback = { mount };
})();
