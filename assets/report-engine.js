// ╔══════════════════════════════════════════════════════════════════╗
// ║  ExoMind 开发日报 · 数据模板                                    ║
// ║                                                                  ║
// ║  使用方法:                                                       ║
// ║  1. 修改下方 REPORT 对象中的数据                                 ║
// ║  2. 在浏览器中打开此文件即可                                     ║
// ║  3. 所有 HTML 由 JS 从 REPORT 数据自动渲染                       ║
// ║                                                                  ║
// ║  天气等级:                                                       ║
// ║    sun    = ☀️ 晴        (无阻塞)                                ║
// ║    cloudy = ⛅ 晴转多云  (有关注项)                               ║
// ║    overcast = 🌥️ 多云   (多项阻塞)                               ║
// ║    rain   = 🌧️ 阵雨     (关键路径受阻)                           ║
// ║    storm  = ⛈️ 雷暴      (生产事故)                               ║
// ╚══════════════════════════════════════════════════════════════════╝

const REPORT = {

  // ── 元信息 ──────────────────────────────────────────────────────
  meta: {
    title: '开发午报',
    date: '2026-04-01',
    coverage: '03-25 早 ~ 04-01 午',
    baseline: 'ed3f1fa9',
    repo: 'exomind-team/exomind',
  },

  // ── 发布者 ────────────────────────────────────────────────────────
  publisher: {
    identity: '外心史官',
    os: 'Android',
    model: 'Claude',
    version: 'Sonnet 4.6 (1M context)',
  },

  // ── 天气 ────────────────────────────────────────────────────────
  weather: {
    level: 'cloudy',
    emoji: '⛅',
    label: '晴转多云',
    ups: [
      '1 PR 今日合并 — #798 图标打磨',
      '6 Issue 今日关闭 — 含 #792 安全修复 · #769 增量刷新 · #761 时间块 Bug',
      '上期 9 PR 合并潮 — 七天交付量创纪录',
      'P0 大清理 — 4 个降级为 P1，P0 从 6 降至 2',
      '今日计划器落地 — 15 分钟时间线规划器',
    ],
    downs: [
      'Open Issues 暴涨 +41 — 从 248 升至 291（新增 49，关闭 25）',
      'P1 暴涨 +21 — 从 40 升至 61',
      '大量架构研究 issue 涌入 — #799 Agent 文件系统 · #797 Agent 调度 · #796 iroh-docs 评估',
      '2 P0 连续 17 天零代码 — #532 #527',
      '2 战果未清 — PR #781 #798 已合并但 issue 仍 OPEN',
    ],
  },

  // ── 数据指标卡 ──────────────────────────────────────────────────
  metrics: [
    { label: 'Open Issues', value: '291',  delta: '↑ 43', trend: 'up',   note: '再破纪录',     tooltip: '上期 248 → 本期 291（新增 49，关闭 25）' },
    { label: 'P0 / P1',    value: '2 / 61',delta: 'P0 -4, P1 +21',trend: 'neutral',   note: 'P0 大清理', tooltip: 'P0: 6→2 (-4) · P1: 40→61 (+21)' },
    { label: '关闭 Issue',  value: '25',     delta: '3.6x 上期',trend: 'down', note: '质量高',    tooltip: '上期 7 → 本期 25（含今日 6）' },
    { label: '合并 PR',     value: '10',     delta: '10x 上期', trend: 'down', note: '交付潮',  tooltip: '上期 1 → 本期 10（含今日 1）' },
  ],

  // ── 主线追踪 ────────────────────────────────────────────────────
  mainlines: [
    { name: '今日计划器 #751', pct: 100, stall: false, subtasks: [
      { text: '#751 计划窗口一等对象', done: true, issue: 751 },
      { text: '#752 计划时间块模型', done: true, issue: 752 },
      { text: '#753 /act/today-planner API', done: true, issue: 753 },
      { text: '#754 Today 页升级为可编辑计划器', done: true, issue: 754 },
      { text: 'PR #755 合并', done: true, issue: 755 },
    ]},
    { name: '网络节点优先 #773', pct: 100, stall: false, subtasks: [
      { text: '切换到 node-first embedded RT mesh', done: true },
      { text: '链路验证循环（link proof）', done: true },
      { text: 'Windows mDNS 多宿主稳定性', done: true },
      { text: 'PR #774 合并', done: true, issue: 774 },
    ]},
    { name: '安全修复 #768', pct: 100, stall: false, subtasks: [
      { text: '停止向前端暴露 auth_secret', done: true },
      { text: '清理 localStorage 缓存凭据', done: true },
      { text: '强化 embedded runtime auth/CORS', done: true },
      { text: 'PR #778 合并', done: true, issue: 778 },
    ]},
    { name: 'RT 配置迁移 #758', pct: 100, stall: false, subtasks: [
      { text: 'localStorage → SQLite 迁移', done: true },
      { text: 'External runtime 修复', done: true },
      { text: 'PR #784 合并（review）', done: true, issue: 784 },
    ]},
    { name: '2 P0 MVP', tag: 'stall', pct: 0, stall: true, subtasks: [
      { text: '#532 RT+ECS 跨端同步（17 天）', done: false, issue: 532 },
      { text: '#527 手机↔电脑互通（17 天）', done: false, issue: 527 },
    ]},
  ],

  // ── 头条 ────────────────────────────────────────────────────────
  headlines: [
    { emoji: '🚀', title: '9 PR 合并潮 — 七天交付量创纪录',
      color: 'var(--green)',
      body: '#798 图标打磨 · #784 配置迁移 · #781 工作台运行时 · #779 Windows 隔离 · #778 安全修复 · #774 网络节点 · #772 增量刷新 · #755 今日计划器 · #727 移除首页。覆盖网络、安全、计划器、配置等核心领域。' },
    { emoji: '🔥', title: 'P0 大清理 — 4 个降级为 P1',
      color: 'var(--accent)',
      body: '#511 语音输入归一化 · #480 语音驱动任务 · #452 Android 导入失败 · #326 ASR→分类链路。P0 从 6 降至 2，只剩 #532 和 #527。' },
    { emoji: '📈', title: 'Issue 暴涨 +43 — 新增 49，关闭 25',
      color: 'var(--orange)',
      body: 'Open Issues 从 248 升至 291。新增大量架构研究与 RT 迁移 issue（#799 Agent 文件系统 · #797 Agent 调度 · #796 iroh-docs 评估 · #794 移除 Pouch · #793 无头外心）。' },
    { emoji: '🏗️', title: '今日计划器落地 — 15 分钟时间线规划器',
      color: 'var(--purple)',
      body: 'PR #755 合并，关闭 #751 #752 #753 #754。支持拖选创建窗口、工作段任务链接、开始执行、当前窗口 reflow。' },
  ],

  // ── 上期建议记分卡 ──────────────────────────────────────────────
  scorecard: [
    { text: '关闭 #777 #795', result: 'fail', note: 'PR #781 #798 已合并但 issue 仍 OPEN' },
    { text: '推进 #532 #527 两个 P0', result: 'fail', note: '连续 17 天零代码' },
    { text: '控制新 issue 涌入速度', result: 'fail', note: '新增 49，Open Issues 暴涨 +43' },
  ],

  // ── PR 看板 ─────────────────────────────────────────────────────
  prs: {
    open: [
      { num: 790, title: 'session-runtime federation', status: 'docs' },
    ],
    merged: [
      { num: 798, title: '图标打磨', date: '04-01' },
      { num: 784, title: 'RT 配置迁移', date: '03-31' },
      { num: 781, title: '工作台运行时', date: '03-31' },
      { num: 779, title: 'Windows 隔离', date: '03-31' },
      { num: 778, title: '安全修复', date: '03-30' },
      { num: 774, title: '网络节点', date: '03-31' },
      { num: 772, title: '增量刷新', date: '03-30' },
      { num: 755, title: '今日计划器', date: '03-30' },
      { num: 727, title: '移除首页', date: '03-25' },
    ],
  },

  // ── Issue 地形图 (Chart.js 水平条形图) ─────────────────────────
  terrain: {
    labels: ['P2','UI','Tauri','Web','enhancement','架构','P1','移动端','Agent','research','事件日志','时间块','P0'],
    data:   [187,  92,  82,    66,   66,          62,   61,   36,     27,    24,      20,      19,     2],
    deltas: [null,null,null,  null, null,         null, '+21',null,  null,  null,    null,    null,  '-4'],
    highlights: { 'P0': '#532 #527', 'P1': '61 issues (+21 net)' },
  },

  // ── 代码 vs GitHub 真相表 ──────────────────────────────────────
  truth: {
    closed: [
      { num: 792, title: '/config 路由缺少认证', gh: 'CLOSED', code: 'FIXED' },
      { num: 769, title: 'ChatPage 全量拉取', gh: 'CLOSED', code: 'FIXED' },
      { num: 761, title: '时间块追加任务误替换', gh: 'CLOSED', code: 'FIXED' },
      { num: 747, title: '目标页渲染稳定性', gh: 'CLOSED', code: 'FIXED' },
      { num: 432, title: 'Android 键盘卡住闪退', gh: 'CLOSED', code: 'FIXED' },
      { num: 326, title: 'ASR→分类链路', gh: 'CLOSED', code: 'FIXED' },
    ],
    stillOpen: [
      { num: 777, title: '工作台运行时', gh: 'OPEN', code: 'FIXED', mismatch: true },
      { num: 795, title: '图标矢量化', gh: 'OPEN', code: 'FIXED', mismatch: true },
    ],
  },

  // ── 战场清点 ──────────────────────────────────────────────────
  poolHealth: {
    prIssueMismatch: [
      { pr: 781, issue: 777, prTitle: 'feat(workbench): wire runtime-fed pane handoff', issueTitle: '工作台运行时' },
      { pr: 798, issue: 795, prTitle: 'chore(icon): polish SVG mascot', issueTitle: '图标矢量化' },
    ],
    staleHighPriority: [
      { num: 532, title: 'RT+ECS 跨端同步', priority: 'P0', staleDays: 17 },
      { num: 527, title: '手机↔电脑互通', priority: 'P0', staleDays: 17 },
      { num: 789, title: 'session-runtime federation', priority: 'P1', staleDays: 1 },
      { num: 788, title: 'device metadata SQLite', priority: 'P1', staleDays: 2 },
      { num: 771, title: 'WeFlow 轮询失败', priority: 'P1', staleDays: 2 },
      { num: 770, title: 'useSignalStream SSE 重连泄漏', priority: 'P1', staleDays: 2 },
      { num: 765, title: 'PC 悬浮窗透明命中区域过大', priority: 'P1', staleDays: 4 },
      { num: 760, title: 'RT 挂后台无法保持运行', priority: 'P1', staleDays: 5 },
    ],
    noPriority: { current: 0, previous: 0 },
    aging: { oldCount: 61, total: 291, pct: 21, samples: [
      { num: 25, title: 'v4架构统一', ageDays: 50, priority: 'P1' },
      { num: 36, title: '三级运行体系', ageDays: 49, priority: 'P2' },
      { num: 37, title: '通知拦截转发', ageDays: 49, priority: 'P2' },
      { num: 38, title: '微信聊天转发', ageDays: 49, priority: 'P2' },
      { num: 43, title: '本地语音识别', ageDays: 49, priority: 'P2' },
      { num: 44, title: '本地大语言模型', ageDays: 49, priority: 'P2' },
      { num: 45, title: '更多外观主题', ageDays: 49, priority: 'P2' },
      { num: 47, title: '云端语音合成', ageDays: 49, priority: 'P2' },
    ] },
  },

  // ── 建议行动 (可勾选, localStorage 持久化) ────────────────────
  actions: [
    { text: '关闭 #777 #795', detail: 'PR #781 #798 已合并，对应 issue 应关闭' },
    { text: '推进 #532 #527 两个 P0', detail: '连续 17 天零代码，需要突破' },
    { text: '控制新 issue 涌入速度', detail: '新增 49，Open Issues 暴涨 +43，需要冻结新开题' },
    { text: '清理陈年阵地', detail: '21% >30d (61/291)，需要定期清理' },
  ],

  // ── 底部洞察 ────────────────────────────────────────────────────
  insight: {
    text: '「交付潮与涌入潮的双重奏」— 七天 9 PR 合并创纪录，覆盖网络、安全、计划器、配置等核心领域，展现出强劲的交付能力。但同时 Open Issues 暴涨 +43，P1 暴涨 +21，大量架构研究与 RT 迁移 issue 涌入（#799 Agent 文件系统 · #797 Agent 调度 · #796 iroh-docs 评估 · #794 移除 Pouch · #793 无头外心）。这是典型的"交付后扩散"信号：一个功能落地后，团队立即看到更多可能性，开出大量后续 issue。建议：先消化已有 P0/P1，再展开新架构研究。',
    author: 'ExoMind 编年史官',
  },
};

// ╔══════════════════════════════════════════════════════════════════╗
// ║  以下为渲染引擎 · 修改数据请改上方 REPORT，无需改动下方代码      ║
// ╚══════════════════════════════════════════════════════════════════╝

const GH_BASE = `https://github.com/${REPORT.meta.repo}/issues/`;
const GH_PR = `https://github.com/${REPORT.meta.repo}/pull/`;
const STORAGE_KEY = `exomind-actions-${REPORT.meta.date}`;

function ghLink(num) { return `<a class="gh-link" href="${GH_BASE}${num}">#${num}</a>`; }
function prLink(num) { return `<a class="gh-link" href="${GH_PR}${num}">#${num}</a>`; }

// Auto-linkify #xxx in plain text
function autoLink(text) {
  return text.replace(/#(\d+)/g, (_, n) => ghLink(n));
}

// Weather gradient map
const WEATHER_GRADIENTS = {
  sun:      'linear-gradient(135deg, #f0a500, #ff6b00)',
  cloudy:   'linear-gradient(135deg, #58a6ff, #8957e5)',
  overcast: 'linear-gradient(135deg, #6e7681, #484f58)',
  rain:     'linear-gradient(135deg, #6e40c9, #f85149)',
  storm:    'linear-gradient(135deg, #f85149, #da3633)',
};

const HEADLINE_COLORS = ['var(--green)', 'var(--accent)', 'var(--purple)', 'var(--orange)', 'var(--p0)', 'var(--text-dim)'];

function render() {
  const R = REPORT;
  const app = document.getElementById('app');
  document.title = `ExoMind ${R.meta.title} · ${R.meta.date}`;

  let html = '';

  // ── Header ──
  html += `<header class="header animate">
    <div class="logo">EXOMIND</div>
    <h1>${R.meta.title}</h1>
    <div class="meta">${R.meta.date} · 覆盖 ${R.meta.coverage} · 基线 <span class="mono">${R.meta.baseline}</span></div>
  </header>`;

  // ── Weather + Metrics ──
  const wGrad = WEATHER_GRADIENTS[R.weather.level] || WEATHER_GRADIENTS.cloudy;
  html += `<div class="top-row">
    <div class="weather-card animate d1" style="background:${wGrad}" onclick="toggleWeather()">
      <div class="weather-emoji">${R.weather.emoji}</div>
      <div class="weather-label">${R.weather.label}</div>
      <div class="weather-sub">点击查看详情 ▾</div>
      <div class="weather-details" id="weatherDetails">
        <div class="up"><ul>${R.weather.ups.map(t => `<li>${autoLink(t)}</li>`).join('')}</ul></div>
        <div class="down"><ul>${R.weather.downs.map(t => `<li>${autoLink(t)}</li>`).join('')}</ul></div>
      </div>
    </div>
    <div class="metrics-grid">
      ${R.metrics.map((m, i) => `<div class="metric-card animate d${i+2}">
        <div class="tooltip">${m.tooltip}</div>
        <div class="label">${m.label}</div>
        <div class="value">${m.value}</div>
        <div class="delta ${m.trend}">${m.delta}</div>
        <div class="note">${m.note}</div>
      </div>`).join('')}
    </div>
  </div>`;

  // ── Mainlines ──
  html += `<div class="section-title animate d3">主线追踪</div>`;
  R.mainlines.forEach((m, i) => {
    const tag = m.tag === 'new' ? '<span class="tag new">NEW</span>'
      : m.tag === 'stall' ? '<span class="tag stall">STALL</span>' : '';
    const subs = m.subtasks.map(s => {
      const icon = s.done ? '<span class="done">✓</span>' : '<span class="pending">○</span>';
      const link = s.issue ? ` ${ghLink(s.issue)}` : '';
      return `<li>${icon} ${s.text}${link}</li>`;
    }).join('');
    html += `<div class="mainline animate d${Math.min(i+2,6)}">
      <div class="mainline-header" onclick="toggleMainline(this)">
        <span class="mainline-name">${m.name} ${tag}</span>
        <span style="display:flex;align-items:center;gap:.6rem">
          <span class="mainline-pct">${m.pct}%</span>
          <span class="mainline-chevron">▶</span>
        </span>
      </div>
      <div class="mainline-bar"><div class="mainline-fill${m.stall?' stall':''}" style="width:${m.pct}%"></div></div>
      <div class="mainline-subtasks"><ul>${subs}</ul></div>
    </div>`;
  });

  // ── Headlines ──
  html += `<div class="section-title animate d4">头条</div>`;
  R.headlines.forEach((h, i) => {
    const color = h.color || HEADLINE_COLORS[i] || 'var(--accent)';
    html += `<div class="headline animate d${Math.min(i+4,6)}" style="border-left-color:${color}">
      <div class="headline-title">${h.emoji} ${h.title}</div>
      <div class="headline-body">${autoLink(h.body)}</div>
    </div>`;
  });

  // ── Scorecard (collapsible) ──
  html += renderCollapsible('📋 上期建议执行记分卡', '', 'd5', () => {
    return R.scorecard.map(s => {
      const icon = s.result === 'pass' ? '✓' : s.result === 'fail' ? '✗' : '△';
      return `<div class="score-row"><div class="score-badge ${s.result}">${icon}</div><div class="score-text">${autoLink(s.text)}<div class="score-note">${autoLink(s.note)}</div></div></div>`;
    }).join('');
  });

  // ── PR Board (collapsible) ──
  const prSummary = `· Open ${R.prs.open.length} · Merged ${R.prs.merged.length}`;
  html += renderCollapsible('🚦 PR 看板', prSummary, 'd5', () => {
    let t = '<table class="pr-table"><tr><th>#</th><th>标题</th><th>状态</th></tr>';
    R.prs.open.forEach(p => {
      const extra = p.extra ? ` ${p.extra}` : '';
      t += `<tr><td class="num"><a href="${GH_BASE}${p.num}">#${p.num}</a></td><td>${p.title}</td><td><span class="pr-status ${p.status}">${p.status}${extra}</span></td></tr>`;
    });
    t += '</table>';
    if (R.prs.merged.length) {
      t += '<div style="margin-top:.8rem;font-size:.85rem;color:var(--text-dim)">合并: ';
      t += R.prs.merged.map(p => `${prLink(p.num)} ${p.title} (${p.date})`).join(' · ');
      t += '</div>';
    }
    return t;
  });

  // ── Terrain (collapsible with chart) ──
  html += renderCollapsible('🏔️ Issue 地形图', '', 'd5', () => {
    return '<div class="chart-wrap"><canvas id="terrainChart"></canvas></div>';
  }, true);

  // ── Truth Table (collapsible) ──
  html += renderCollapsible('🔬 代码 vs GitHub 真相表', '', 'd6', () => {
    let t = '<div class="truth-row" style="font-size:.8rem;color:var(--text-faint);font-weight:700;border-bottom:1px solid var(--border)"><div></div><div>ISSUE</div><div>GITHUB</div><div>CODE</div></div>';
    if (R.truth.closed.length) t += renderTruthGroup('已关闭 · 代码验证通过', R.truth.closed);
    if (R.truth.stillOpen.length) t += renderTruthGroup('仍 OPEN · 代码已修复 ⚠️', R.truth.stillOpen);
    return t;
  });

  // ── Pool Health (Issue 时效清点) ──
  if (R.poolHealth) {
    const ph = R.poolHealth;
    // Build summary chips for collapsible header (like PR board)
    const phChips = [];
    if (ph.prIssueMismatch.length > 0) phChips.push(`<span style="color:var(--p1)">${ph.prIssueMismatch.length} 战果未清</span>`);
    if (ph.staleHighPriority.length > 0) phChips.push(`<span style="color:var(--p0)">${ph.staleHighPriority.length} 僵持</span>`);
    if (ph.noPriority.current > 0) phChips.push(`<span style="color:var(--p1)">${ph.noPriority.current} 未编入</span>`);
    else phChips.push(`<span style="color:var(--green)">全编入</span>`);
    if (ph.aging.pct > 0) phChips.push(`<span style="color:${ph.aging.pct > 40 ? 'var(--p0)' : ph.aging.pct > 25 ? 'var(--p1)' : 'var(--text-faint)'}">${ph.aging.pct}% 陈年</span>`);
    const phSummary = phChips.length ? ' · ' + phChips.join(' · ') : '';
    html += renderCollapsible('🕒 Issue 时效清点', phSummary, 'd6', () => {
      let c = '';
      // PR→Issue 断裂
      if (ph.prIssueMismatch.length > 0) {
        c += '<div style="margin-bottom:.8rem"><div style="font-size:.85rem;font-weight:700;color:var(--p1);margin-bottom:.3rem">🚩 战果未清</div>';
        ph.prIssueMismatch.forEach(m => {
          c += `<div style="font-size:.82rem;color:var(--text-dim);padding:.2rem 0">PR ${prLink(m.pr)} 已合并 → ${ghLink(m.issue)} 仍 OPEN</div>`;
        });
        c += '</div>';
      }
      // P0/P1 停滞
      if (ph.staleHighPriority.length > 0) {
        c += '<div style="margin-bottom:.8rem"><div style="font-size:.85rem;font-weight:700;color:var(--p0);margin-bottom:.3rem">⏳ 僵持线</div>';
        ph.staleHighPriority.forEach(s => {
          const barLen = Math.min(Math.round(s.staleDays / 2), 15);
          const bar = '█'.repeat(barLen) + '░'.repeat(Math.max(15 - barLen, 0));
          const cls = s.priority === 'P0' ? 'color:var(--p0)' : 'color:var(--p1)';
          c += `<div style="font-size:.82rem;color:var(--text-dim);padding:.2rem 0;font-family:'JetBrains Mono',monospace">${ghLink(s.num)} <span style="${cls}">${s.priority}</span> <span style="color:var(--text-faint)">${bar}</span> ${s.staleDays}d ${s.title}</div>`;
        });
        c += '</div>';
      }
      // 无优先级
      const npText = ph.noPriority.current === 0
        ? `<span style="color:var(--green)">全部编入 ✅</span>`
        : `<span style="color:var(--p1)">${ph.noPriority.current}</span>`;
      const npDelta = ph.noPriority.previous !== ph.noPriority.current
        ? ` <span style="color:var(--text-faint)">(上期 ${ph.noPriority.previous})</span>` : '';
      c += `<div style="font-size:.82rem;color:var(--text-dim);margin-top:.5rem">🏷 未编入 ${npText}${npDelta}</div>`;
      // 陈年阵地 — 总览 + 具体 issue 列表
      const agePct = ph.aging.pct;
      const ageColor = agePct > 40 ? 'var(--p0)' : agePct > 25 ? 'var(--p1)' : 'var(--text-dim)';
      c += `<div style="margin-top:.8rem"><div style="font-size:.85rem;font-weight:700;color:${ageColor};margin-bottom:.3rem">📦 陈年阵地 ${agePct}% &gt;30d (${ph.aging.oldCount}/${ph.aging.total})</div>`;
      if (ph.aging.samples && ph.aging.samples.length > 0) {
        ph.aging.samples.forEach(s => {
          const pColor = s.priority === 'P0' ? 'var(--p0)' : s.priority === 'P1' ? 'var(--p1)' : 'var(--text-faint)';
          c += `<div style="font-size:.82rem;color:var(--text-dim);padding:.15rem 0">${ghLink(s.num)} <span style="color:${pColor}">${s.priority}</span> <span style="color:var(--text-faint)">${s.ageDays}d</span> ${s.title}</div>`;
        });
      }
      c += '</div>';
      return c;
    });
  }

  // ── Actions ──
  html += `<div class="section-title animate d6">建议行动</div>`;
  const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  html += `<div id="actions" style="background:var(--card);border:1px solid var(--border);border-radius:var(--radius);padding:1rem 1.2rem">`;
  R.actions.forEach((a, i) => {
    const checked = stored[i] ? 'checked' : '';
    html += `<div class="action-item">
      <input type="checkbox" class="action-check" ${checked} onchange="saveAction(${i}, this.checked)">
      <div><div class="action-text">${autoLink(a.text)}</div><div class="action-detail">${autoLink(a.detail)}</div></div>
    </div>`;
  });
  html += '</div>';

  // ── Insight ──
  html += `<div class="insight animate d6">
    <p>${autoLink(R.insight.text)}</p>
    <div class="author">— ${R.insight.author} · ${R.meta.date}</div>
  </div>`;

  // ── Footer ──
  const pub = R.publisher;
  const pubStr = pub ? `${pub.identity}·${pub.os} [${pub.model} ${pub.version}]` : 'ExoMind dev-daily agent';
  html += `<div class="footer">${pubStr}</div>`;

  app.innerHTML = html;
}

function renderCollapsible(title, subtitle, delay, contentFn, hasChart) {
  const sub = subtitle ? ` <span style="color:var(--text-faint);font-size:.75rem">${subtitle}</span>` : '';
  return `<div class="collapsible animate ${delay}">
    <div class="collapsible-header" onclick="toggleCollapsible(this${hasChart ? ',true' : ''})">
      <span>${title}${sub}</span><span class="chevron">▶</span>
    </div>
    <div class="collapsible-body"><div class="collapsible-content">${contentFn()}</div></div>
  </div>`;
}

function renderTruthGroup(title, items) {
  let h = `<div class="truth-group-title">${title}</div>`;
  items.forEach(t => {
    const cls = t.mismatch ? ' truth-mismatch' : '';
    h += `<div class="truth-row${cls}">
      <div class="truth-num"><a href="${GH_BASE}${t.num}">#${t.num}</a></div>
      <div style="color:var(--text-dim)">${t.title}</div>
      <div><span class="truth-badge ${t.gh.toLowerCase()}">${t.gh}</span></div>
      <div><span class="truth-badge ${t.code.toLowerCase()}">${t.code}</span></div>
    </div>`;
  });
  return h;
}

// ── Interactions ──
function toggleWeather() { document.getElementById('weatherDetails').classList.toggle('open'); }
function toggleMainline(header) {
  const card = header.closest('.mainline');
  card.querySelector('.mainline-subtasks').classList.toggle('open');
  card.querySelector('.mainline-chevron').classList.toggle('open');
}
let chartInstance = null;
function toggleCollapsible(header, hasChart) {
  const body = header.nextElementSibling;
  const chevron = header.querySelector('.chevron');
  body.classList.toggle('open');
  chevron.classList.toggle('open');
  if (hasChart && body.classList.contains('open')) setTimeout(renderChart, 50);
}
function saveAction(i, checked) {
  const s = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  s[i] = checked;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
}

function renderChart() {
  const ctx = document.getElementById('terrainChart');
  if (!ctx) return;
  if (chartInstance) chartInstance.destroy();
  const d = REPORT.terrain;
  chartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: d.labels,
      datasets: [{
        data: d.data,
        backgroundColor: d.labels.map(l => l === 'P0' ? 'rgba(248,81,73,.7)' : l === 'P1' ? 'rgba(210,153,34,.7)' : 'rgba(88,166,255,.4)'),
        borderColor: d.labels.map(l => l === 'P0' ? '#f85149' : l === 'P1' ? '#d29922' : '#58a6ff'),
        borderWidth: 1, borderRadius: 3,
      }],
    },
    options: {
      indexAxis: 'y', responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            afterLabel: (ctx) => {
              const label = ctx.label;
              const delta = d.deltas[d.labels.indexOf(label)];
              const hl = d.highlights[label];
              let r = delta ? `变化: ${delta}` : '';
              if (hl) r += (r ? '\n' : '') + hl;
              return r;
            }
          },
          backgroundColor: '#1c2128', borderColor: '#30363d', borderWidth: 1,
          titleColor: '#e6edf3', bodyColor: '#8b949e',
          titleFont: { family: 'JetBrains Mono' },
        },
      },
      scales: {
        x: { grid: { color: 'rgba(48,54,61,.5)' }, ticks: { color: '#8b949e', font: { family: 'JetBrains Mono', size: 11 } } },
        y: { grid: { display: false }, ticks: { color: '#e6edf3', font: { family: 'Outfit', size: 12 } } },
      },
    },
  });
}

// Boot
render();
