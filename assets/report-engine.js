const REPORT_REPO = REPORT.meta?.repo || 'exomind-team/exomind';
const GH_BASE = `https://github.com/${REPORT_REPO}/issues/`;
const GH_PR = `https://github.com/${REPORT_REPO}/pull/`;
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

function normalizeMetricTrend(trend) {
  if (typeof trend !== 'string') return 'neutral';
  const normalized = trend.trim().toLowerCase();
  if (normalized === 'flat') return 'neutral';
  return ['up', 'down', 'neutral'].includes(normalized) ? normalized : 'neutral';
}

function normalizeScoreResult(result) {
  if (typeof result !== 'string') return 'partial';
  const normalized = result.trim().toLowerCase();
  if (['pass', 'hit', 'done'].includes(normalized)) return 'pass';
  if (['fail', 'miss'].includes(normalized)) return 'fail';
  return 'partial';
}

function normalizePrStatus(status) {
  if (typeof status !== 'string') return 'open';
  const normalized = status.trim().toLowerCase();
  return ['open', 'review', 'docs', 'locked', 'merged'].includes(normalized) ? normalized : 'open';
}

function normalizePriority(priority) {
  return typeof priority === 'string' && priority.trim() ? priority : 'P2';
}

function normalizeInsight(insight, publisher) {
  if (typeof insight === 'string') {
    return { text: insight, author: publisher?.identity || 'ExoMind' };
  }
  if (!insight || typeof insight !== 'object' || Array.isArray(insight)) {
    return { text: '', author: publisher?.identity || 'ExoMind' };
  }
  return {
    ...insight,
    text: typeof insight.text === 'string' ? insight.text : '',
    author: typeof insight.author === 'string' && insight.author.trim() ? insight.author : (publisher?.identity || 'ExoMind'),
  };
}

function normalizeTruthItem(item, group) {
  if (!item || typeof item !== 'object' || Array.isArray(item) || !Number.isFinite(item.num)) return null;
  const title = typeof item.title === 'string' ? item.title : '';
  if (!title.trim()) return null;
  return {
    ...item,
    title,
    gh: typeof item.gh === 'string' && item.gh.trim()
      ? item.gh.trim().toUpperCase()
      : group === 'closed' || typeof item.closedAt === 'string'
        ? 'CLOSED'
        : 'OPEN',
    code: typeof item.code === 'string' && item.code.trim()
      ? item.code.trim().toUpperCase()
      : group === 'closed'
        ? 'FIXED'
        : 'NONE',
    mismatch: Boolean(item.mismatch),
  };
}

function normalizeTruthItems(items, group) {
  return Array.isArray(items)
    ? items.map(item => normalizeTruthItem(item, group)).filter(Boolean)
    : [];
}

function normalizeStaleItems(items) {
  return Array.isArray(items)
    ? items
        .filter(item => item && typeof item === 'object' && !Array.isArray(item) && Number.isFinite(item.num))
        .map(item => ({
          ...item,
          priority: normalizePriority(item.priority),
          staleDays: Number.isFinite(item.staleDays) ? item.staleDays : (Number.isFinite(item.ageDays) ? item.ageDays : 0),
        }))
    : [];
}

function normalizeAgingSamples(samples) {
  return Array.isArray(samples)
    ? samples
        .filter(item => item && typeof item === 'object' && !Array.isArray(item) && Number.isFinite(item.num))
        .map(item => ({
          ...item,
          priority: normalizePriority(item.priority),
          ageDays: Number.isFinite(item.ageDays) ? item.ageDays : (Number.isFinite(item.staleDays) ? item.staleDays : 0),
        }))
    : [];
}

function normalizePoolHealth(poolHealth) {
  if (!poolHealth || typeof poolHealth !== 'object' || Array.isArray(poolHealth)) return null;
  const aging = poolHealth.aging && typeof poolHealth.aging === 'object' && !Array.isArray(poolHealth.aging)
    ? poolHealth.aging
    : {};
  const total = Number.isFinite(aging.total) ? aging.total : 0;
  const pct = Number.isFinite(aging.pct) ? aging.pct : 0;
  const oldCount = Number.isFinite(aging.oldCount)
    ? aging.oldCount
    : total > 0 && pct > 0
      ? Math.round(total * pct / 100)
      : 0;

  return {
    prIssueMismatch: Array.isArray(poolHealth.prIssueMismatch) ? poolHealth.prIssueMismatch : [],
    staleHighPriority: normalizeStaleItems(poolHealth.staleHighPriority || poolHealth.stalePriority),
    noPriority: {
      current: Number.isFinite(poolHealth.noPriority?.current) ? poolHealth.noPriority.current : 0,
      previous: Number.isFinite(poolHealth.noPriority?.previous) ? poolHealth.noPriority.previous : 0,
    },
    aging: {
      oldCount,
      total,
      pct,
      samples: normalizeAgingSamples(aging.samples),
    },
  };
}

function normalizeReportForRender(report) {
  const meta = report?.meta || {};
  const weather = report?.weather || {};
  const prs = report?.prs || {};
  const truth = report?.truth || {};

  return {
    ...report,
    meta: {
      ...meta,
      title: typeof meta.title === 'string' && meta.title.trim() ? meta.title : '开发日志',
      coverage: typeof meta.coverage === 'string' ? meta.coverage : '',
      repo: typeof meta.repo === 'string' && meta.repo.trim() ? meta.repo : REPORT_REPO,
    },
    weather: {
      ...weather,
      ups: Array.isArray(weather.ups) ? weather.ups : [],
      downs: Array.isArray(weather.downs) ? weather.downs : [],
    },
    metrics: Array.isArray(report?.metrics)
      ? report.metrics.map(metric => ({
          ...metric,
          trend: normalizeMetricTrend(metric?.trend),
          tooltip: typeof metric?.tooltip === 'string' ? metric.tooltip : (typeof metric?.note === 'string' ? metric.note : ''),
        }))
      : [],
    headlines: Array.isArray(report?.headlines)
      ? report.headlines.map(headline => ({
          ...headline,
          emoji: typeof headline?.emoji === 'string' && headline.emoji.trim() ? headline.emoji : '-',
        }))
      : [],
    mainlines: Array.isArray(report?.mainlines)
      ? report.mainlines.map(mainline => ({
          ...mainline,
          subtasks: Array.isArray(mainline?.subtasks)
            ? mainline.subtasks.map(subtask => typeof subtask === 'string' ? { text: subtask, done: false } : subtask)
            : [],
        }))
      : [],
    scorecard: Array.isArray(report?.scorecard)
      ? report.scorecard.map(item => ({
          ...item,
          result: normalizeScoreResult(item?.result),
        }))
      : [],
    prs: {
      open: Array.isArray(prs.open)
        ? prs.open.map(pr => ({
            ...pr,
            status: normalizePrStatus(pr?.status),
          }))
        : [],
      merged: Array.isArray(prs.merged) ? prs.merged : [],
    },
    truth: {
      closed: normalizeTruthItems(truth.closed, 'closed'),
      stillOpen: normalizeTruthItems(truth.stillOpen, 'stillOpen'),
    },
    poolHealth: normalizePoolHealth(report?.poolHealth),
    actions: Array.isArray(report?.actions)
      ? report.actions.map(action => typeof action === 'string' ? { text: action, detail: '' } : action)
      : Array.isArray(weather.actions)
        ? weather.actions.map(action => typeof action === 'string' ? { text: action, detail: '' } : action)
        : [],
    insight: normalizeInsight(report?.insight, report?.publisher),
    terrain: report?.terrain && Array.isArray(report.terrain.labels) ? report.terrain : null,
  };
}

function render() {
  const R = normalizeReportForRender(REPORT);
  const app = document.getElementById('app');
  document.title = `ExoMind ${R.meta.title} · ${R.meta.date}`;

  let html = '';
  const coverageMeta = R.meta.coverage ? ` · 覆盖 ${R.meta.coverage}` : '';

  // ── Header ──
  html += `<header class="header animate">
    <div class="logo">EXOMIND</div>
    <h1>${R.meta.title}</h1>
    <div class="meta">${R.meta.date}${coverageMeta} · 基线 <span class="mono">${R.meta.baseline || '-'}</span></div>
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
  const hasTerrain = Array.isArray(R.terrain?.labels) && R.terrain.labels.length > 0;
  html += renderCollapsible('🏔️ Issue 地形图', '', 'd5', () => {
    return hasTerrain
      ? '<div class="chart-wrap"><canvas id="terrainChart"></canvas></div>'
      : '<div style="font-size:.82rem;color:var(--text-dim)">本期未提供地形图数据</div>';
  }, hasTerrain);

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
    <p>${autoLink(R.insight.text || '本期未提供额外洞察。')}</p>
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
    const normalized = normalizeTruthItem(t, title.includes('已关闭') ? 'closed' : 'stillOpen');
    if (!normalized) return;
    const cls = normalized.mismatch ? ' truth-mismatch' : '';
    h += `<div class="truth-row${cls}">
      <div class="truth-num"><a href="${GH_BASE}${normalized.num}">#${normalized.num}</a></div>
      <div style="color:var(--text-dim)">${normalized.title}</div>
      <div><span class="truth-badge ${normalized.gh.toLowerCase()}">${normalized.gh}</span></div>
      <div><span class="truth-badge ${normalized.code.toLowerCase()}">${normalized.code}</span></div>
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
  const d = normalizeReportForRender(REPORT).terrain;
  if (!d || !Array.isArray(d.labels) || !d.labels.length) return;
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
