// ExoMind DevLog · Report Rendering Engine
// Extracted from report-template.html
// Requires: global `REPORT` object defined before this script loads

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

// Auto-resolve daypart title from time
function resolveDaypart(meta) {
  // Priority: URL filename HHmmss > meta.time > HH:mm in coverage
  let hour = NaN;
  const urlMatch = location.pathname.match(/\d{4}-\d{2}-\d{2}-(\d{2})/);
  if (urlMatch) hour = parseInt(urlMatch[1], 10);
  if (isNaN(hour) && meta.time) hour = parseInt(String(meta.time).substring(0, 2), 10);
  if (isNaN(hour) && meta.coverage) {
    const cm = meta.coverage.match(/(\d{2}):\d{2}/);
    if (cm) hour = parseInt(cm[1], 10);
  }
  if (isNaN(hour)) return;
  meta.title = hour < 6 ? '开发夜报' : hour < 12 ? '开发早报' : hour < 18 ? '开发午报' : '开发晚报';
}

function render() {
  const R = REPORT;
  resolveDaypart(R.meta);
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

  // ── DevLog Nav ──
  html += `<div class="devlog-nav"><a href="../">← DevLog 归档</a></div>`;

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
