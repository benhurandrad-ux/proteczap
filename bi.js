/* ProtecZap · BI: formatadores, faixas e gráficos em SVG inline (sem biblioteca).
   Regras da skill dataviz: marcas finas (barras até 24px, linhas 2px, marcadores 8px com anel da superfície),
   gap de 2px entre células, um só eixo, sequencial de um matiz, status com ícone e rótulo, texto nunca na cor da série,
   tooltip que complementa (a tabela gêmea existe) e legenda só com 2 ou mais séries.
   Carregado como script clássico depois de core.js; expõe window.pzBI. */
(function () {
  'use strict';
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const isNum = v => v !== null && v !== undefined && v !== '' && !Number.isNaN(Number(v));
  const N = v => (isNum(v) ? Number(v) : null);
  const ptBR = new Intl.NumberFormat('pt-BR');
  const brl0 = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });

  /* ---------- formatadores ---------- */
  const fmt = {
    int: v => (isNum(v) ? ptBR.format(Math.round(Number(v))) : 'sem dado'),
    num1: v => (isNum(v) ? Number(v).toLocaleString('pt-BR', { maximumFractionDigits: 1 }) : 'sem dado'),
    pct: (v, d = 0) => (isNum(v) ? (Number(v) * 100).toLocaleString('pt-BR', { maximumFractionDigits: d, minimumFractionDigits: d }) + '%' : 'sem dado'),
    pp: v => (isNum(v) ? (Number(v) * 100).toLocaleString('pt-BR', { maximumFractionDigits: 1, signDisplay: 'always' }) + ' pp' : ''),
    brl: v => (isNum(v) ? brl0.format(Number(v)) : 'sem dado'),
    brlk: v => { if (!isNum(v)) return 'sem dado'; v = Number(v); if (Math.abs(v) >= 1e6) return 'R$ ' + (v / 1e6).toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + ' mi'; if (Math.abs(v) >= 1e4) return 'R$ ' + (v / 1e3).toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + ' mil'; return brl0.format(v); },
    secs: v => {
      if (!isNum(v)) return 'sem dado'; v = Number(v);
      if (v < 60) return Math.round(v) + ' s';
      if (v < 600) return (v / 60).toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + ' min';
      if (v < 3600) return Math.round(v / 60) + ' min';
      if (v < 86400) return (v / 3600).toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + ' h';
      return (v / 86400).toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + ' d';
    },
    mins: v => (isNum(v) ? (Number(v) / 60).toLocaleString('pt-BR', { maximumFractionDigits: Number(v) < 600 ? 1 : 0 }) : ''),
    days: v => (isNum(v) ? Number(v).toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + (Number(v) === 1 ? ' dia' : ' dias') : 'sem dado'),
    ratio: v => (isNum(v) ? Number(v).toLocaleString('pt-BR', { maximumFractionDigits: 2 }) : 'sem dado'),
    date: iso => { if (!iso) return ''; const d = new Date(iso + (iso.length === 10 ? 'T12:00:00' : '')); return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }).replace('.', ''); },
    dateLong: iso => { if (!iso) return ''; const d = new Date(iso + (iso.length === 10 ? 'T12:00:00' : '')); return d.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' }).replace(/\./g, ''); },
    range: (a, b) => `${fmt.date(a)} a ${fmt.date(b)}`,
    by: (kind, v) => kind === 'pct' ? fmt.pct(v, 0) : kind === 'brl' ? fmt.brl(v) : kind === 'sec' ? fmt.secs(v) : kind === 'days' ? fmt.days(v) : kind === 'ratio' ? fmt.ratio(v) : fmt.int(v),
    wait: s => { if (!isNum(s)) return ''; s = Number(s); if (s < 60) return 'agora'; if (s < 3600) return Math.floor(s / 60) + ' min'; if (s < 86400) return Math.floor(s / 3600) + ' h'; return Math.floor(s / 86400) + ' d'; }
  };

  /* ---------- delta pela regra "subir é bom?" ---------- */
  function delta(cur, prev, kind, upIsGood, prevLabel) {
    cur = N(cur); prev = N(prev);
    if (cur === null || prev === null) return { cls: 'flat', text: prev === null && cur !== null ? 'sem base anterior' : '', icon: '' };
    let diff = cur - prev; let txt;
    if (kind === 'pct') txt = fmt.pp(diff);
    else if (kind === 'sec') txt = (diff >= 0 ? '+' : '-') + fmt.secs(Math.abs(diff));
    else if (kind === 'brl') txt = (diff >= 0 ? '+' : '-') + fmt.brl(Math.abs(diff));
    else if (kind === 'days') txt = (diff >= 0 ? '+' : '-') + fmt.num1(Math.abs(diff)) + ' d';
    else txt = (diff >= 0 ? '+' : '-') + fmt.int(Math.abs(diff));
    const tol = kind === 'pct' ? 0.0005 : kind === 'sec' ? 1 : 0.0001;
    if (Math.abs(diff) <= tol) return { cls: 'flat', text: 'igual ' + (prevLabel ? 'à ' + prevLabel : 'ao anterior'), icon: '' };
    const good = upIsGood ? diff > 0 : diff < 0;
    return { cls: good ? 'up' : 'down', text: txt + (prevLabel ? ' vs ' + prevLabel : ''), icon: diff > 0 ? 'i-up' : 'i-down' };
  }
  const bandMeta = b => ({ ok: { cls: 'ok', icon: 'i-check', label: 'na faixa' }, warn: { cls: 'warn', icon: 'i-alert', label: 'atenção' }, bad: { cls: 'bad', icon: 'i-alert-tri', label: 'fora da faixa' }, none: { cls: '', icon: '', label: 'sem dado' } }[b || 'ok'] || { cls: '', icon: '', label: '' });
  const ico = (name, cls = 'ic') => `<svg class="${cls}" aria-hidden="true"><use href="#${name}"/></svg>`;

  /* ---------- escala "nice" ---------- */
  function niceMax(v, steps = 4) {
    if (!isNum(v) || v <= 0) return 1;
    const raw = v / steps; const p = Math.pow(10, Math.floor(Math.log10(raw)));
    const m = raw / p; const s = m <= 1 ? 1 : m <= 2 ? 2 : m <= 2.5 ? 2.5 : m <= 5 ? 5 : 10;
    return s * p * steps;
  }

  /* ---------- sparkline (12 pontos): cinza, último trecho e ponto no acento ---------- */
  function sparkline(values, opts = {}) {
    const w = opts.w || 400, h = opts.h || 56, p = 6; const vals = values.map(N);
    if (!vals.length) return '';
    const max = Math.max(...vals.map(v => v || 0), 1), min = 0;
    const x = i => p + i * (w - 2 * p) / Math.max(vals.length - 1, 1);
    const y = v => h - p - ((v || 0) - min) / (max - min || 1) * (h - 2 * p);
    const pts = vals.map((v, i) => [x(i), y(v)]);
    const d = pts.map((pt, i) => (i ? 'L' : 'M') + pt[0].toFixed(1) + ' ' + pt[1].toFixed(1)).join(' ');
    const last = pts[pts.length - 1], prev = pts[pts.length - 2] || last;
    return `<path d="${d}" fill="none" stroke="var(--line-strong)" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" vector-effect="non-scaling-stroke"/>
      <path d="M${prev[0].toFixed(1)} ${prev[1].toFixed(1)} L${last[0].toFixed(1)} ${last[1].toFixed(1)}" fill="none" stroke="var(--accent)" stroke-width="2" stroke-linecap="round" vector-effect="non-scaling-stroke"/>
      <circle cx="${last[0].toFixed(1)}" cy="${last[1].toFixed(1)}" r="4" fill="var(--accent)" stroke="var(--surface)" stroke-width="2"/>`;
  }

  /* ---------- linha do tempo (mediana + faixa P50 a P90 + período anterior + meta), um só eixo em minutos ---------- */
  function lineChart(series, opts = {}) {
    const W = opts.w || 520, H = opts.h || 220, L = 40, R = 16, T = 14, B = 30;
    const target = opts.target != null ? opts.target : 300; // segundos
    const rows = (series || []).map(r => ({ day: r.day, p50: N(r.p50), p90: N(r.p90), prev: N(r.prev_p50), n: N(r.n) || 0, prevN: N(r.prev_n) || 0 }));
    const n = rows.length;
    if (!n || !rows.some(r => r.p50 !== null)) return { svg: '', empty: true };
    const p50max = Math.max(...rows.map(r => r.p50 || 0)), p90max = Math.max(...rows.map(r => r.p90 || 0)), prevmax = Math.max(...rows.map(r => r.prev || 0));
    let top = Math.max(p50max, prevmax, target * 1.3);
    top = Math.max(top, Math.min(p90max, p50max * 3 || p90max)); // não deixa um P90 isolado esmagar a mediana
    const hours = top / 60 >= 180; const unitDiv = hours ? 3600 : 60; const unitLbl = hours ? 'h' : 'min';
    const yMaxMin = niceMax(top / unitDiv, 4); // em minutos ou horas
    const x = i => L + (n === 1 ? (W - L - R) / 2 : i * (W - L - R) / (n - 1));
    const y = s => T + (H - T - B) * (1 - Math.min(s / unitDiv, yMaxMin) / yMaxMin);
    const seg = (key) => { let d = '', open = false; rows.forEach((r, i) => { const v = r[key]; if (v === null) { open = false; return; } d += (open ? 'L' : 'M') + x(i).toFixed(1) + ' ' + y(v).toFixed(1) + ' '; open = true; }); return d; };
    // área P50..P90 por trechos contínuos
    let area = ''; let run = [];
    const flush = () => { if (run.length >= 1) { const up = run.map(i => `${x(i).toFixed(1)} ${y(rows[i].p90 != null ? rows[i].p90 : rows[i].p50).toFixed(1)}`); const dn = run.slice().reverse().map(i => `${x(i).toFixed(1)} ${y(rows[i].p50).toFixed(1)}`); area += `M${up.join(' L')} L${dn.join(' L')} Z `; } run = []; };
    rows.forEach((r, i) => { if (r.p50 === null) flush(); else run.push(i); }); flush();
    const ticks = []; for (let k = 0; k <= 4; k++) ticks.push(yMaxMin * k / 4);
    const labelEvery = n <= 8 ? 1 : n <= 16 ? 2 : n <= 31 ? 5 : n <= 60 ? 10 : 15;
    const showDots = n <= 31;
    const uid = 'lc' + Math.random().toString(36).slice(2, 7);
    let last = null; for (let i = n - 1; i >= 0; i--) if (rows[i].p50 !== null) { last = i; break; }
    const hit = rows.map((r, i) => { const x0 = i === 0 ? L : (x(i - 1) + x(i)) / 2, x1 = i === n - 1 ? W - R : (x(i) + x(i + 1)) / 2; return `<rect class="hit" x="${x0.toFixed(1)}" y="${T}" width="${(x1 - x0).toFixed(1)}" height="${H - T - B}" fill="transparent" data-i="${i}" tabindex="${r.p50 !== null ? 0 : -1}" role="img" aria-label="${esc(fmt.dateLong(r.day))}: mediana ${esc(fmt.secs(r.p50))}, P90 ${esc(fmt.secs(r.p90))}, ${r.n} conversas${r.prev !== null ? ', anterior ' + esc(fmt.secs(r.prev)) : ''}"><title>${esc(fmt.dateLong(r.day))} · mediana ${esc(fmt.secs(r.p50))} · P90 ${esc(fmt.secs(r.p90))} · ${r.n} conversas</title></rect>`; }).join('');
    const svg = `<svg class="chart" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" style="max-width:100%" role="img" aria-label="Mediana do tempo de primeira resposta por dia, com faixa até o P90, período anterior e meta de ${esc(fmt.secs(target))}" data-chart="line">
      <defs><clipPath id="${uid}"><rect x="${L}" y="${T}" width="${W - L - R}" height="${H - T - B}"/></clipPath></defs>
      ${ticks.map((t, k) => `<line class="grid" x1="${L}" x2="${W - R}" y1="${y(t * unitDiv).toFixed(1)}" y2="${y(t * unitDiv).toFixed(1)}"/><text class="tick" x="${L - 6}" y="${(y(t * unitDiv) + 3).toFixed(1)}" text-anchor="end">${t.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}${k === ticks.length - 1 ? ' ' + unitLbl : ''}</text>`).join('')}
      <g clip-path="url(#${uid})"><path d="${area}" fill="var(--accent)" opacity=".12"/>
      <path d="${seg('prev')}" fill="none" stroke="var(--line-strong)" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/></g>
      <line class="ref" x1="${L}" x2="${W - R}" y1="${y(target).toFixed(1)}" y2="${y(target).toFixed(1)}"/><text class="lbl" x="${L + 4}" y="${(y(target) - 5).toFixed(1)}" text-anchor="start">meta ${esc(fmt.secs(target))}</text>
      <g clip-path="url(#${uid})"><path d="${seg('p50')}" fill="none" stroke="var(--accent)" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>
      ${showDots ? rows.map((r, i) => r.p50 === null ? '' : `<circle cx="${x(i).toFixed(1)}" cy="${y(r.p50).toFixed(1)}" r="4" fill="var(--accent)" stroke="var(--surface)" stroke-width="2"/>`).join('') : ''}</g>
      ${last !== null ? `<text class="lbl-strong" x="${(x(last) + (last === n - 1 ? -8 : 8)).toFixed(1)}" y="${(y(rows[last].p50) - 9).toFixed(1)}" text-anchor="${last === n - 1 ? 'end' : 'start'}">${esc(fmt.secs(rows[last].p50))}</text>` : ''}
      <line class="base" x1="${L}" x2="${W - R}" y1="${H - B}" y2="${H - B}"/>
      ${rows.map((r, i) => (i % labelEvery === 0 || i === n - 1) && !(i === n - 1 && n > 8 && (n - 1) % labelEvery !== 0 && (n - 1) % labelEvery < labelEvery / 2 && n > 10) ? `<text class="tick" x="${x(i).toFixed(1)}" y="${H - B + 16}" text-anchor="middle">${esc(n <= 8 ? fmt.dateLong(r.day).split(',')[0] : fmt.date(r.day))}</text>` : '').join('')}
      <line class="cross hide" x1="0" x2="0" y1="${T}" y2="${H - B}" stroke="var(--ink-4)" stroke-width="1"/>
      ${hit}
    </svg>`;
    return { svg, rows, x, y, empty: false, unit: unitLbl };
  }

  /* ---------- barra horizontal fina em SVG (funil, ranking, origem): ponta arredondada 4px, base quadrada ---------- */
  function hbar(ratio, opts = {}) {
    const h = opts.h || 16, fill = opts.fill || 'var(--line-strong)'; const w = Math.max(0, Math.min(1, ratio || 0)) * 100;
    const r = Math.min(4, h / 2);
    const marker = opts.marker != null ? `<line x1="${(opts.marker * 100).toFixed(2)}%" x2="${(opts.marker * 100).toFixed(2)}%" y1="-5" y2="${h + 5}" stroke="var(--ink-2)" stroke-width="1"/>` : '';
    // ponta direita arredondada (rx) e base quadrada: um quadrado cobre os cantos esquerdos
    return `<svg class="hb" style="height:${h}px" aria-hidden="true" overflow="visible" focusable="false">
      ${w > 0 ? `<rect x="0" y="0" width="${w.toFixed(2)}%" height="${h}" fill="${fill}" rx="${r}" ry="${r}"/><rect x="0" y="0" width="${Math.min(w, 1).toFixed(2)}%" height="${h}" fill="${fill}"/>` : ''}
      ${marker}
    </svg>`;
  }

  /* ---------- heatmap 7 x 24 em SVG: uma cor sequencial, gap 2px, hachura 45° para "ninguém na escala" ---------- */
  const RAMP = ['var(--ramp-100)', 'var(--ramp-200)', 'var(--ramp-300)', 'var(--ramp-400)', 'var(--ramp-500)', 'var(--ramp-600)', 'var(--ramp-700)'];
  const DOWS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
  function heatmap(cells, layer, opts = {}) {
    const cw = 22, ch = 18, gap = 2, W = 24 * cw - gap, H = 7 * ch - gap;
    const byKey = {}; (cells || []).forEach(c => { byKey[c.dow + ':' + c.hour] = c; });
    const vals = (cells || []).map(c => layer === 'time' ? N(c.p50) : N(c.leads)).filter(v => v !== null && v > 0);
    const max = vals.length ? Math.max(...vals) : 0;
    const uid = 'hm' + Math.random().toString(36).slice(2, 7);
    let rects = '';
    for (let d = 1; d <= 7; d++) for (let h = 0; h < 24; h++) {
      const c = byKey[d + ':' + h] || { dow: d, hour: h, leads: 0, p50: null, available: false };
      const v = layer === 'time' ? N(c.p50) : N(c.leads);
      const idx = v === null || !max || v <= 0 ? 0 : Math.min(6, 1 + Math.floor((v / max) * 5.999));
      const na = opts.hatch && c.available === false && opts.hasSchedule;
      const tip = `${DOWS[d - 1]} ${String(h).padStart(2, '0')}h · ${c.leads || 0} lead${(c.leads || 0) === 1 ? '' : 's'} · mediana ${fmt.secs(c.p50)}${na ? ' · ninguém na escala' : ''}`;
      rects += `<rect x="${h * cw}" y="${(d - 1) * ch}" width="${cw - gap}" height="${ch - gap}" rx="2" fill="${v === null || v <= 0 ? 'var(--surface-2)' : RAMP[idx]}" data-tip="${esc(tip)}" ${opts.focusable ? 'tabindex="0" role="img"' : ''} aria-label="${esc(tip)}"><title>${esc(tip)}</title></rect>`;
      if (na) rects += `<rect x="${h * cw}" y="${(d - 1) * ch}" width="${cw - gap}" height="${ch - gap}" rx="2" fill="url(#${uid})" pointer-events="none"/>`;
    }
    const svg = `<svg class="heat-svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" role="img" aria-label="${layer === 'time' ? 'Mediana de primeira resposta' : 'Leads recebidos'} por hora e dia da semana">
      <defs><pattern id="${uid}" patternUnits="userSpaceOnUse" width="6" height="6" patternTransform="rotate(45)"><rect width="1.4" height="6" fill="var(--ink-3)" opacity=".45"/></pattern></defs>${rects}</svg>`;
    return { svg, max };
  }

  /* ---------- tooltip único, acessível (hover e foco) ---------- */
  let tip;
  function ensureTip() { if (tip) return tip; tip = document.createElement('div'); tip.id = 'viz-tip'; tip.className = 'viz-tip hide'; tip.setAttribute('role', 'tooltip'); document.body.appendChild(tip); return tip; }
  function showTip(html, x, y) { const t = ensureTip(); t.innerHTML = html; t.classList.remove('hide'); const r = t.getBoundingClientRect(); let left = x + 12, top = y + 14; if (left + r.width > window.innerWidth - 8) left = x - r.width - 12; if (top + r.height > window.innerHeight - 8) top = y - r.height - 12; t.style.left = Math.max(8, left) + 'px'; t.style.top = Math.max(8, top) + 'px'; }
  function hideTip() { if (tip) tip.classList.add('hide'); }
  function attachTips(root) {
    if (!root || root.dataset.tipsBound) return; root.dataset.tipsBound = '1';
    const over = e => { const el = e.target.closest && e.target.closest('[data-tip]'); if (!el) return; const b = el.getBoundingClientRect(); showTip(esc(el.dataset.tip).replace(/ · /g, '<br>'), e.clientX || b.left + b.width / 2, e.clientY || b.top); };
    root.addEventListener('pointermove', over); root.addEventListener('pointerleave', hideTip); root.addEventListener('pointerdown', over);
    root.addEventListener('focusin', e => { const el = e.target.closest && e.target.closest('[data-tip]'); if (!el) return; const b = el.getBoundingClientRect(); showTip(esc(el.dataset.tip).replace(/ · /g, '<br>'), b.left + b.width / 2, b.bottom); });
    root.addEventListener('focusout', hideTip);
  }
  /* crosshair da linha: tooltip lista todas as séries no X */
  function bindLine(svgEl, chart, extra) {
    if (!svgEl || !chart || chart.empty) return;
    const cross = svgEl.querySelector('.cross');
    const show = (i, ev) => { const r = chart.rows[i]; if (!r || r.p50 === null) return; cross.setAttribute('x1', chart.x(i)); cross.setAttribute('x2', chart.x(i)); cross.classList.remove('hide');
      const html = `<b>${esc(fmt.dateLong(r.day))}</b><div class="tl"><i class="acc"></i><b>${esc(fmt.secs(r.p50))}</b> mediana</div><div class="tl"><i class="area"></i><b>${esc(fmt.secs(r.p90))}</b> P90</div>${r.prev !== null ? `<div class="tl"><i></i><b>${esc(fmt.secs(r.prev))}</b> ${esc(extra && extra.prevLabel || 'período anterior')}</div>` : ''}<div class="tl"><i class="none"></i><b>${r.n}</b> conversa${r.n === 1 ? '' : 's'}</div>`;
      const b = ev.target.getBoundingClientRect(); showTip(html, ev.clientX || b.left + b.width / 2, ev.clientY || b.top + 20); };
    svgEl.addEventListener('pointermove', e => { const h = e.target.closest('.hit'); if (h) show(+h.dataset.i, e); });
    svgEl.addEventListener('pointerleave', () => { cross.classList.add('hide'); hideTip(); });
    svgEl.addEventListener('focusin', e => { const h = e.target.closest('.hit'); if (h) show(+h.dataset.i, e); });
    svgEl.addEventListener('focusout', () => { cross.classList.add('hide'); hideTip(); });
  }

  /* ---------- CSV ---------- */
  function downloadCsv(lines, filename) {
    const blob = new Blob(['﻿' + (lines || []).join('\r\n')], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = filename; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }
  /* tabela gêmea genérica */
  function table(cols, rows, cls = 'tbl dense') {
    return `<table class="${cls}"><thead><tr>${cols.map(c => `<th${c.r ? ' class="r"' : ''}>${esc(c.h)}</th>`).join('')}</tr></thead><tbody>${rows.map(r => `<tr>${cols.map(c => `<td${c.r ? ' class="r"' : ''}>${c.raw ? c.f(r) : esc(c.f(r))}</td>`).join('')}</tr>`).join('') || `<tr><td colspan="${cols.length}"><div class="empty-inline" style="padding:14px"><b>Sem dados no período.</b></div></td></tr>`}</tbody></table>`;
  }

  window.pzBI = { fmt, N, isNum, delta, bandMeta, ico, niceMax, sparkline, lineChart, hbar, heatmap, DOWS, RAMP, attachTips, bindLine, showTip, hideTip, downloadCsv, table, esc };
})();
