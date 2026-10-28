'use strict';
// 只传递随机标识与游玩状态；与剧情、昵称和存档无关。
window.Y2KStats = (() => {
  const words = {
    zh: ['累计访问', '在线游玩', '统计从启用时开始；在线人数按正在前台游玩的浏览器计算，约每 30 秒更新。', '正在读取统计', '统计暂时不可用', '离线模式', '本地预览不计入统计'],
    en: ['Total visits', 'Playing now', 'Counted since tracking began. Active browsers playing in the foreground are updated about every 30 seconds.', 'Loading statistics', 'Statistics temporarily unavailable', 'Offline mode', 'Local previews are not counted'],
    ja: ['累計アクセス', 'プレイ中', '集計開始以降のアクセス数です。前面でプレイ中のブラウザー数を約30秒ごとに更新します。', '統計を読み込み中', '統計を取得できません', 'オフラインモード', 'ローカルプレビューは集計対象外です'],
  };
  let started = false, playing = false, pageId, sessionId, visitorId, registered = false;
  let flight = false, queued = false, seq = 0, lastApplied = 0, values = null, mode = 'loading';
  let endpoint = '', enabled = false;
  const panels = new Map();
  const uuid = () => crypto.randomUUID();
  function paint() {
    for (const [el, lang] of panels) {
      if (!el.isConnected) { panels.delete(el); continue; }
      const w = words[lang] || words.zh;
      const format = value => new Intl.NumberFormat(lang === 'zh' ? 'zh-CN' : lang).format(value);
      const ready = mode === 'ready' && values;
      el.querySelector('[data-stat="visits"]').textContent = ready ? format(values.visits) : '—';
      el.querySelector('[data-stat="online"]').textContent = ready ? format(values.online) : '—';
      el.querySelector('.stats-state').textContent = ready ? '' : w[{ loading: 3, error: 4, offline: 5, preview: 6 }[mode] || 4];
      el.dataset.state = mode;
    }
  }
  function mount(lang) {
    const w = words[lang] || words.zh, el = document.createElement('div');
    el.className = 'site-stats'; el.setAttribute('role', 'group'); el.title = w[2];
    for (const [label, key] of [[w[0], 'visits'], [w[1], 'online']]) {
      const item = document.createElement('span'), text = document.createElement('span'), value = document.createElement('strong');
      item.className = 'stat-item'; text.textContent = label; value.dataset.stat = key; value.textContent = '—';
      item.append(text, value); el.append(item);
    }
    const state = document.createElement('span'); state.className = 'stats-state'; state.setAttribute('role', 'status'); el.append(state);
    panels.set(el, lang); queueMicrotask(paint); return el;
  }
  function active() { return playing && document.visibilityState === 'visible'; }
  function payload(event) { return { event, pageId, sessionId, visitorId, seq: ++seq, playing: event === 'leave' ? false : active() }; }
  function leave() {
    if (!enabled) return;
    const body = JSON.stringify(payload('leave'));
    // 递增序号避免迟到的心跳把已离开的玩家重新记为在线。
    fetch(endpoint, { method: 'POST', body, headers: { 'Content-Type': 'text/plain;charset=UTF-8' }, keepalive: true, credentials: 'omit' }).catch(() => {
      try { navigator.sendBeacon?.(endpoint, new Blob([body], { type: 'text/plain;charset=UTF-8' })); } catch (_) {}
    });
  }
  async function send() {
    if (!enabled || document.visibilityState !== 'visible') return;
    if (flight) { queued = true; return; }
    flight = true;
    const message = payload(registered ? 'heartbeat' : 'visit'), controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    try {
      const response = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=UTF-8' }, body: JSON.stringify(message), credentials: 'omit', cache: 'no-store', signal: controller.signal });
      if (!response.ok) throw new Error('stats unavailable');
      const result = await response.json();
      if (![result.visits, result.online].every(n => Number.isSafeInteger(n) && n >= 0)) throw new Error('invalid statistics');
      if (message.event === 'visit') registered = true;
      if (message.seq >= lastApplied && document.visibilityState === 'visible') { lastApplied = message.seq; values = result; mode = 'ready'; paint(); }
    } catch (_) { mode = 'error'; paint(); }
    finally { clearTimeout(timeout); flight = false; if (queued) { queued = false; void send(); } }
  }
  function setPlaying(value) { const changed = playing !== value; playing = value; if (started && changed) void send(); }
  function start() {
    if (started) return; started = true;
    const config = window.Y2K_STATS_CONFIG || {};
    if (location.protocol === 'file:') { mode = 'offline'; paint(); return; }
    if (!(config.allowedOrigins || []).includes(location.origin)) { mode = 'preview'; paint(); return; }
    try {
      const url = new URL(config.endpoint); if (url.protocol !== 'https:') throw new Error('HTTPS required');
      endpoint = url.href; pageId = uuid(); sessionId = uuid();
      try {
        visitorId = localStorage.getItem('y2k_stats_visitor');
        if (!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(visitorId || '')) { visitorId = uuid(); localStorage.setItem('y2k_stats_visitor', visitorId); }
      } catch (_) { visitorId = uuid(); }
      enabled = true;
    } catch (_) { mode = 'error'; paint(); return; }
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') void send(); else leave(); });
    window.addEventListener('pagehide', leave);
    window.addEventListener('pageshow', e => { if (e.persisted) void send(); });
    window.addEventListener('online', () => void send());
    setInterval(() => void send(), 30000); void send();
  }
  return { mount, setPlaying, start };
})();
