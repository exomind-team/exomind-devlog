// ══════════════════════════════════════════════════════════════
// ExoMind 开发航线 · Render Engine
// ══════════════════════════════════════════════════════════════

const R = ROUTE;
const GH = `https://github.com/${R.meta.repo}/issues/`;
let selectedBatch = null;

function ghLink(num) {
  return `<a href="${GH}${num}" target="_blank" class="mono" style="color:var(--accent)">#${num}</a>`;
}

function renderHeader() {
  return `
    <div class="header animate d1">
      <div class="logo">EXOMIND</div>
      <h1>开 发 航 线</h1>
      <div class="meta">
        ${R.meta.date} · dev@<span class="mono">${R.meta.baseline}</span>
        · ${R.publisher.identity}·${R.publisher.os} [${R.publisher.model} ${R.publisher.version}]
      </div>
    </div>`;
}

function renderTopRow() {
  const metricsHtml = R.metrics.map(m => `
    <div class="metric-card">
      <div class="label">${m.label}</div>
      <div class="value">${m.value}</div>
      <div class="note">${m.note}</div>
    </div>`).join('');

  return `
    <div class="top-row animate d2">
      <div class="status-card">
        <div class="status-emoji">${R.status.emoji}</div>
        <div class="status-label">${R.status.label}</div>
        <div class="status-sub">${R.status.summary}</div>
      </div>
      <div class="metrics-grid">${metricsHtml}</div>
    </div>`;
}

function renderTrackLegend() {
  return `
    <div class="track-legend">
      ${R.tracks.map(t => `
        <div class="track-legend-item" title="${t.desc}">
          <div class="track-dot" style="background:${t.color}"></div>
          <span style="color:${t.color}">${t.name}</span>
        </div>`).join('')}
      <div class="track-legend-item">
        <div class="track-dot" style="background:var(--green)"></div> 已完成
      </div>
      <div class="track-legend-item">
        <div class="track-dot" style="background:var(--accent);box-shadow:0 0 6px var(--accent)"></div> 就绪
      </div>
      <div class="track-legend-item">
        <div class="track-dot" style="background:var(--text-faint)"></div> 待解锁
      </div>
    </div>`;
}

function getTrackColor(trackId) {
  const t = R.tracks.find(x => x.id === trackId);
  return t ? t.color : '#6e7681';
}

function getStatusColor(status) {
  switch(status) {
    case 'done': return 'var(--green)';
    case 'active': return 'var(--accent)';
    case 'ready': return 'var(--accent)';
    case 'blocked': return 'var(--text-faint)';
    default: return 'var(--text-faint)';
  }
}

function renderRouteMap() {
  // Build dagre graph
  const g = new dagre.graphlib.Graph();
  g.setGraph({ rankdir: 'LR', ranksep: 120, nodesep: 50, marginx: 50, marginy: 40 });
  g.setDefaultEdgeLabel(() => ({}));

  R.batches.forEach(b => {
    g.setNode(b.id, { label: b.id, width: 140, height: 70 });
  });
  R.batches.forEach(b => {
    b.deps.forEach(dep => {
      const depId = typeof dep === 'string' ? dep : dep.id;
      if (R.batches.find(x => x.id === depId)) {
        g.setEdge(depId, b.id);
      }
    });
  });

  dagre.layout(g);

  const nodes = [];
  const edges = [];
  g.nodes().forEach(id => {
    const n = g.node(id);
    if (n) nodes.push({ id, x: n.x, y: n.y, w: n.width, h: n.height });
  });
  g.edges().forEach(e => {
    const edge = g.edge(e);
    edges.push({ from: e.v, to: e.w, points: edge.points });
  });

  // Calculate canvas size
  const maxX = Math.max(...nodes.map(n => n.x + n.w / 2)) + 60;
  const maxY = Math.max(...nodes.map(n => n.y + n.h / 2)) + 60;
  const canvasW = Math.max(maxX, 600);
  const canvasH = Math.max(maxY, 200);

  // ExoMind TaskDag-inspired palette
  const PALETTE = {
    active:     { border: '#C75B3A', ring: 'rgba(199,91,58,.35)', bg: 'rgba(199,91,58,.08)', text: '#e6edf3' },
    ready:      { border: '#16A34A', ring: 'rgba(34,197,94,.20)', bg: 'rgba(240,253,244,.06)', text: '#e6edf3' },
    done:       { border: '#A8A29E', ring: 'rgba(214,211,209,.15)', bg: 'rgba(214,211,209,.06)', text: '#78716C' },
    blocked:    { border: '#EAB308', ring: 'rgba(234,179,8,.15)', bg: 'rgba(234,179,8,.04)', text: '#8b949e' },
  };
  const EDGE_CORNER_RADIUS = 20;

  function drawRoundedRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.arcTo(x + w, y, x + w, y + r, r);
    ctx.lineTo(x + w, y + h - r);
    ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
    ctx.lineTo(x + r, y + h);
    ctx.arcTo(x, y + h, x, y + h - r, r);
    ctx.lineTo(x, y + r);
    ctx.arcTo(x, y, x + r, y, r);
    ctx.closePath();
  }

  function drawBezierEdge(ctx, pts, color, dashed) {
    if (pts.length < 2) return;
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.25;
    ctx.setLineDash(dashed ? [7, 5] : []);

    if (pts.length === 2) {
      // Simple bezier
      const [p0, p1] = pts;
      const cpOffset = Math.abs(p1.x - p0.x) * 0.4;
      ctx.moveTo(p0.x, p0.y);
      ctx.bezierCurveTo(p0.x + cpOffset, p0.y, p1.x - cpOffset, p1.y, p1.x, p1.y);
    } else {
      // Multi-point with rounded corners
      ctx.moveTo(pts[0].x, pts[0].y);
      for (let i = 1; i < pts.length - 1; i++) {
        const prev = pts[i-1], cur = pts[i], next = pts[i+1];
        const r = Math.min(EDGE_CORNER_RADIUS,
          Math.hypot(cur.x-prev.x, cur.y-prev.y)/2,
          Math.hypot(next.x-cur.x, next.y-cur.y)/2);
        const d1 = Math.hypot(cur.x-prev.x, cur.y-prev.y);
        const d2 = Math.hypot(next.x-cur.x, next.y-cur.y);
        const cp1x = cur.x - (cur.x-prev.x)/d1*r;
        const cp1y = cur.y - (cur.y-prev.y)/d1*r;
        const cp2x = cur.x + (next.x-cur.x)/d2*r;
        const cp2y = cur.y + (next.y-cur.y)/d2*r;
        ctx.lineTo(cp1x, cp1y);
        ctx.quadraticCurveTo(cur.x, cur.y, cp2x, cp2y);
      }
      ctx.lineTo(pts[pts.length-1].x, pts[pts.length-1].y);
    }
    ctx.stroke();
    ctx.setLineDash([]);

    // Arrow head
    const last = pts[pts.length - 1];
    const prev = pts.length >= 2 ? pts[pts.length - 2] : pts[0];
    const angle = Math.atan2(last.y - prev.y, last.x - prev.x);
    ctx.beginPath();
    ctx.fillStyle = color;
    ctx.moveTo(last.x, last.y);
    ctx.lineTo(last.x - 10 * Math.cos(angle - .35), last.y - 10 * Math.sin(angle - .35));
    ctx.lineTo(last.x - 10 * Math.cos(angle + .35), last.y - 10 * Math.sin(angle + .35));
    ctx.closePath();
    ctx.fill();
  }

  setTimeout(() => {
    const canvas = document.getElementById('route-canvas');
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvasW * dpr;
    canvas.height = canvasH * dpr;
    canvas.style.width = canvasW + 'px';
    canvas.style.height = canvasH + 'px';
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);

    // Draw edges with bezier curves
    edges.forEach(e => {
      const toBatch = R.batches.find(b => b.id === e.to);
      const isBlocked = toBatch && toBatch.status === 'blocked';
      const color = isBlocked ? 'rgba(234,179,8,.35)' : '#C75B3A';
      drawBezierEdge(ctx, e.points, color, isBlocked);
    });

    // Draw nodes (ExoMind TaskDag card style)
    nodes.forEach(n => {
      const batch = R.batches.find(b => b.id === n.id);
      if (!batch) return;
      const trackColor = getTrackColor(batch.track);
      const isSelected = selectedBatch === batch.id;
      const p = PALETTE[batch.status] || PALETTE.blocked;
      const r = 12; // rounded-xl
      const x = n.x - n.w/2, y = n.y - n.h/2;

      // Outer ring (glow) for selected or active
      if (isSelected || batch.status === 'active') {
        ctx.save();
        ctx.shadowColor = p.border;
        ctx.shadowBlur = 12;
        drawRoundedRect(ctx, x - 2, y - 2, n.w + 4, n.h + 4, r + 2);
        ctx.strokeStyle = p.ring;
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.restore();
      }

      // Card background
      drawRoundedRect(ctx, x, y, n.w, n.h, r);
      ctx.fillStyle = batch.status === 'blocked' ? 'rgba(13,17,23,.85)' : 'rgba(13,17,23,.95)';
      ctx.fill();

      // Border (status-driven: blocked=yellow dim, ready=green, active=brown)
      ctx.strokeStyle = isSelected ? '#C75B3A' : p.border;
      ctx.lineWidth = isSelected ? 2.5 : 1.8;
      if (batch.status === 'blocked') { ctx.globalAlpha = 0.6; }
      ctx.stroke();
      ctx.globalAlpha = 1;

      // Left track color accent bar (always visible, dimmed if blocked)
      const barW = 4;
      ctx.globalAlpha = batch.status === 'blocked' ? 0.6 : 1;
      drawRoundedRect(ctx, x, y, barW, n.h, [r, 0, 0, r]);
      ctx.fillStyle = trackColor;
      ctx.fill();
      ctx.globalAlpha = 1;

      // Blocked overlay (subtle dim, preserves track color visibility)
      if (batch.status === 'blocked') {
        drawRoundedRect(ctx, x, y, n.w, n.h, r);
        ctx.fillStyle = 'rgba(6,8,13,.2)';
        ctx.fill();
      }

      // Batch ID (large, track-colored, dimmed if blocked)
      ctx.globalAlpha = batch.status === 'blocked' ? 0.6 : 1;
      ctx.fillStyle = trackColor;
      ctx.font = 'bold 18px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(batch.id, n.x, y + 8);

      // Batch name (small, track-colored, dimmed if blocked)
      ctx.font = '500 10px "Outfit", sans-serif';
      const nameText = batch.name.length > 14 ? batch.name.slice(0, 13) + '…' : batch.name;
      ctx.fillText(nameText, n.x, y + 30);

      // Issue count badge
      ctx.fillStyle = batch.status === 'blocked' ? '#6e7681' : '#8b949e';
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.fillText(`${batch.issues.length} issues`, n.x, y + 44);
      ctx.globalAlpha = 1;

      // Progress mini-bar (always show)
      const doneCount = batch.issues.filter(i => i.done).length;
      const pct = batch.issues.length > 0 ? doneCount / batch.issues.length : 0;
      if (true) {
        const barWid = n.w - 24;
        const barH = 3;
        const barX = x + 12;
        const barY = y + n.h - 10;
        ctx.fillStyle = 'rgba(110,118,129,.2)';
        ctx.fillRect(barX, barY, barWid, barH);
        if (pct > 0) {
          ctx.fillStyle = '#2ea043';
          ctx.fillRect(barX, barY, barWid * pct, barH);
        }
      }
    });

    // Click handler
    canvas.onclick = (e) => {
      const rect = canvas.getBoundingClientRect();
      const mx = (e.clientX - rect.left);
      const my = (e.clientY - rect.top);
      let clicked = null;
      nodes.forEach(n => {
        if (mx >= n.x - n.w/2 && mx <= n.x + n.w/2 && my >= n.y - n.h/2 && my <= n.y + n.h/2) {
          clicked = n.id;
        }
      });
      if (clicked) {
        selectedBatch = selectedBatch === clicked ? null : clicked;
        renderBatchPanel();
        // Re-render canvas for selection highlight
        renderRouteMap();
      }
    };

    // Hover cursor
    canvas.onmousemove = (e) => {
      const rect = canvas.getBoundingClientRect();
      const mx = (e.clientX - rect.left);
      const my = (e.clientY - rect.top);
      let hover = false;
      nodes.forEach(n => {
        if (mx >= n.x - n.w/2 && mx <= n.x + n.w/2 && my >= n.y - n.h/2 && my <= n.y + n.h/2) {
          hover = true;
        }
      });
      canvas.style.cursor = hover ? 'pointer' : 'default';
    };

  }, 50);

  return `
    <div class="section-title animate d3">🗺️ 航线地图</div>
    ${renderTrackLegend()}
    <div class="route-map-wrap animate d3">
      <canvas id="route-canvas" class="route-map-canvas"></canvas>
    </div>
    <div id="batch-panel-container"></div>`;
}

function renderBatchPanel() {
  const container = document.getElementById('batch-panel-container');
  if (!container) return;
  if (!selectedBatch) {
    container.innerHTML = '<div class="batch-panel"></div>';
    return;
  }
  const b = R.batches.find(x => x.id === selectedBatch);
  if (!b) return;

  const doneCount = b.issues.filter(i => i.done).length;
  const pct = b.issues.length > 0 ? Math.round(doneCount / b.issues.length * 100) : 0;

  const priClass = b.priority === 'P0' ? 'priority-p0' : b.priority === 'P1' ? 'priority-p1' : 'priority-p2';
  const statusClass = `status-${b.status}`;
  const statusLabel = { ready: '就绪', active: '进行中', done: '已完成', blocked: '待解锁' }[b.status] || b.status;

  const issuesHtml = b.issues.map(i => {
    const priCls = i.priority === 'P0' ? 'p0' : i.priority === 'P1' ? 'p1' : 'p2';
    const icon = i.done ? '✅' : '○';
    const sizeHtml = i.size ? `<span class="batch-issue-pri" style="background:rgba(137,87,229,.12);color:var(--purple)">${i.size}</span>` : '';
    return `
      <li class="batch-issue-item">
        <span>${icon}</span>
        <span class="batch-issue-num">${ghLink(i.num)}</span>
        <span class="batch-issue-pri ${priCls}">${i.priority}</span>
        ${sizeHtml}
        <span class="batch-issue-title">${i.title}</span>
      </li>`;
  }).join('');

  const depsHtml = b.deps.length > 0
    ? `<div class="batch-deps"><strong>前置依赖：</strong>${b.deps.map(d => {
        const depId = typeof d === 'string' ? d : d.id;
        const reason = typeof d === 'object' && d.reason ? ` <span style="color:var(--text-faint)">(${d.reason})</span>` : '';
        return `批次 ${depId}${reason}`;
      }).join(' · ')}</div>`
    : '';

  container.innerHTML = `
    <div class="batch-panel open">
      <div class="batch-panel-inner">
        <div class="batch-panel-header">
          <div class="batch-panel-title">批次 ${b.id}：${b.name}</div>
          <div class="batch-panel-close" onclick="selectedBatch=null;renderBatchPanel()">✕</div>
        </div>
        <div class="batch-meta-row">
          <span class="batch-meta-tag ${statusClass}">${statusLabel}</span>
          <span class="batch-meta-tag ${priClass}">${b.priority}</span>
          <span class="batch-meta-tag platform">${R.tracks.find(t=>t.id===b.track)?.name || b.track}</span>
          <span style="color:var(--text-faint);font-size:.78rem">📁 ${b.fileDomain}</span>
          <span style="color:var(--text-faint);font-size:.78rem">🌿 ${b.branch}</span>
        </div>
        <div class="batch-progress"><div class="batch-progress-fill" style="width:${pct}%"></div></div>
        <div style="font-size:.78rem;color:var(--text-dim);margin-bottom:.5rem">${doneCount}/${b.issues.length} 完成 (${pct}%)</div>
        ${depsHtml}
        <ul class="batch-issue-list">${issuesHtml}</ul>
      </div>
    </div>`;
}

function renderHeatmap() {
  const H = R.heatmap;
  const colCount = H.cols.length;
  let html = `<div class="heatmap-grid" style="grid-template-columns:100px repeat(${colCount},1fr)">`;
  // Header row
  html += '<div class="heatmap-header"></div>';
  H.cols.forEach(c => { html += `<div class="heatmap-header">${c}</div>`; });
  // Data rows
  H.rows.forEach((row, ri) => {
    html += `<div class="heatmap-label">${row}</div>`;
    H.cols.forEach((_, ci) => {
      const v = H.data[ri][ci];
      const heat = v === 0 ? 0 : v <= 2 ? 1 : v <= 5 ? 2 : v <= 10 ? 3 : 4;
      html += `<div class="heatmap-cell heat-${heat}">${v || '·'}</div>`;
    });
  });
  html += '</div>';
  return `
    <div class="section-title animate d5">🔥 优先级 × 平台 热力图</div>
    <div class="animate d5" style="background:var(--card);border:1px solid var(--border);border-radius:var(--radius);padding:1rem">
      ${html}
      <div style="font-size:.72rem;color:var(--text-faint);margin-top:.6rem;text-align:center">
        数字 = 该优先级在该平台轨道上的 open issue 数量。颜色越深 = 积压越多
      </div>
    </div>`;
}

function renderActions() {
  const items = R.actions.map((a, i) => {
    const key = `action-${i}`;
    const checked = localStorage.getItem(key) === 'true' ? 'checked' : '';
    return `
      <div class="action-item">
        <input type="checkbox" class="action-check" ${checked} onchange="localStorage.setItem('${key}',this.checked)">
        <div>
          <div class="action-text">${a.text}</div>
          <div class="action-detail">${a.detail}</div>
        </div>
      </div>`;
  }).join('');

  return `
    <div class="section-title animate d6">📌 建议航向</div>
    <div class="animate d6" style="background:var(--card);border:1px solid var(--border);border-radius:var(--radius);padding:1rem">
      ${items}
    </div>`;
}

function renderInsight() {
  return `
    <div class="insight animate d6">
      <p>${R.insight.text}</p>
      <div class="author">— ${R.insight.author}</div>
    </div>`;
}

function renderFooter() {
  return `
    <div class="footer">
      ExoMind 开发航线 · ${R.meta.date} · 数据驱动，航段变化时更新
    </div>
    <div class="devlog-nav"><a href="../">← DevLog 归档</a></div>`;
}

// Assemble
document.getElementById('app').innerHTML = [
  renderHeader(),
  renderTopRow(),
  renderRouteMap(),
  renderHeatmap(),
  renderActions(),
  renderInsight(),
  renderFooter(),
].join('');
