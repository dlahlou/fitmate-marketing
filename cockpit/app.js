// Cockpit Fitmates : écran d'action (à faire + canaux) et panneaux de détail au clic.
// Données : data/*.json, réécrits chaque jour par scripts/cockpit_export.py.
(function () {
  const FILES = ['meta', 'ga4_jour', 'ga4_canaux', 'ga4_pages', 'ga4_evenements', 'gsc_jour', 'gsc_requetes', 'gsc_pages',
    'stores', 'sorties', 'listes_attente', 'acces', 'actions', 'a_faire'];
  const nf = new Intl.NumberFormat('fr-FR');
  const nf1 = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 1 });
  const pct = new Intl.NumberFormat('fr-FR', { style: 'percent', maximumFractionDigits: 0 });
  const fmtDay = (d) => new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', timeZone: 'UTC' }).format(d);
  const num = (v) => (v === null || v === undefined || v === '' ? '—' : nf.format(v));
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];
  const CHANNELS = { 'Organic Search': 'Recherche Google', Direct: 'Accès direct', 'Organic Social': 'Réseaux sociaux', Referral: 'Sites référents',
    'AI Assistant': 'Assistants IA', Unassigned: 'Non attribué', 'Paid Search': 'Recherche payante', Email: 'E-mail', 'Paid Social': 'Réseaux payants' };
  const SPORTS = { randonnee: 'Randonnée', 'course-a-pied': 'Course à pied', running: 'Running', padel: 'Padel', trail: 'Trail', velo: 'Vélo', escalade: 'Escalade' };
  const TITLES = { google: 'Google', site: 'Site fitmates.net', leads: 'Leads', stores: 'Stores', app: "Offre dans l'app", social: 'Réseaux sociaux', actions: 'Actions, sources et journal' };
  const WHO = { Driss: 'Toi', Claude: 'Claude', Google: 'En attente de Google' };
  let D = {};

  async function load() {
    await Promise.all(FILES.map(async (f) => {
      try { const r = await fetch(`data/${f}.json`, { cache: 'no-cache' }); D[f] = r.ok ? await r.json() : null; } catch { D[f] = null; }
    }));
  }

  const sum = (rows, k) => (rows || []).reduce((s, r) => s + Number(r[k] || 0), 0);
  function deltaText(cur, prev) {
    if (cur == null) return ['', 'flat'];
    if (!prev) return [cur ? 'nouveau' : '', 'flat'];
    const p = (cur - prev) / prev;
    return [`${p > 0 ? '+' : ''}${pct.format(p)}`, p > 0.02 ? 'up' : p < -0.02 ? 'down' : 'flat'];
  }

  // ---------- Écran principal ----------
  function kpis() {
    const ev = Object.fromEntries((D.ga4_evenements || []).map((r) => [r.evenement, r]));
    const ios = (D.stores || []).find((s) => s.store === 'App Store');
    const avis = sum(D.stores, 'avis_ecrits') + sum(D.stores, 'avis_7j');
    return {
      impressions: D.gsc_pages ? sum(D.gsc_pages, 'impressions') : null, clics: D.gsc_pages ? sum(D.gsc_pages, 'clics') : null,
      sessions: D.ga4_canaux ? sum(D.ga4_canaux, 'sessions') : null, sessions_avant: D.ga4_canaux ? sum(D.ga4_canaux, 'sessions_avant') : null,
      leads: ev.generate_lead?.nombre ?? null, leads_avant: ev.generate_lead?.nombre_avant ?? null,
      storeclicks: ev.app_download_click?.nombre ?? null,
      attente: D.listes_attente ? sum(D.listes_attente, 'inscrits') : null,
      note: ios?.note_moyenne != null ? `${nf1.format(ios.note_moyenne)}★` : null, avis: D.stores ? avis : null,
      sorties: D.sorties ? sum(D.sorties, 'sorties') : null,
      sources: D.acces ? D.acces.filter((r) => r.etat === 'ok').length : null, sources_total: D.acces ? D.acces.length : null,
    };
  }

  function renderBoard() {
    const k = kpis();
    $$('[data-k]').forEach((el) => { const v = k[el.dataset.k]; el.textContent = typeof v === 'string' ? v : num(v); });
    const [ds, cls] = deltaText(k.sessions, k.sessions_avant);
    $$('[data-d="sessions"]').forEach((el) => { el.textContent = ds ? `(${ds})` : ''; el.className = cls; });

    const todo = D.a_faire || [];
    $$('[data-flag]').forEach((el) => {
      const mine = todo.filter((t) => t.canal === el.dataset.flag && t.qui === 'Driss').length;
      const wait = todo.filter((t) => t.canal === el.dataset.flag && t.qui !== 'Driss').length;
      el.textContent = mine ? `${mine} action${mine > 1 ? 's' : ''} pour toi` : wait ? `${wait} en cours` : 'rien à faire';
      el.className = `ch-flag ${mine ? 'warn' : 'ok'}`;
    });

    const mine = todo.filter((t) => t.qui === 'Driss');
    const urgent = mine.filter((t) => t.priorite === 1).length;
    const parts = [];
    if (mine.length) parts.push(`${mine.length} action${mine.length > 1 ? 's' : ''} pour toi${urgent ? `, dont ${urgent} prioritaire${urgent > 1 ? 's' : ''}` : ''}`);
    if (k.sessions != null) parts.push(`${num(k.sessions)} visites (${ds || 'stable'})`);
    if (k.leads != null) parts.push(`${num(k.leads)} lead${k.leads > 1 ? 's' : ''}${k.attente ? ` et ${num(k.attente)} en liste d'attente` : ''}`);
    $('#take').textContent = parts.length ? `${parts.join(' · ')}.` : 'Aucune donnée exportée pour le moment.';
    if (D.meta?.genere_le) {
      const d = new Date(D.meta.genere_le);
      $('#fresh').textContent = `Données du ${new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Paris' }).format(d)}`;
      $('#fresh').classList.toggle('late', Date.now() - d > 48 * 3600e3);
    }
    renderTodo('all');
  }

  function actionLine(t, withLink = true) {
    const a = document.createElement('span'); a.className = 't-action';
    if (t.lien && withLink) { const l = document.createElement('a'); l.href = t.lien; l.target = '_blank'; l.rel = 'noopener'; l.textContent = t.action; a.append(l); }
    else a.textContent = t.action;
    return a;
  }

  function renderTodo(who) {
    const list = $('#todo-list'); list.replaceChildren();
    const rows = (D.a_faire || []).filter((t) => who === 'all' || t.qui === who);
    if (!rows.length) { const li = document.createElement('li'); li.className = 'empty'; li.textContent = 'Rien à faire ici.'; list.append(li); return; }
    const MAX = 7;
    rows.slice(0, MAX).forEach((t) => {
      const li = document.createElement('li');
      const dot = document.createElement('span'); dot.className = `prio p${t.priorite}`; dot.title = `Priorité ${t.priorite}`;
      const main = document.createElement('div'); main.className = 't-main';
      const meta = document.createElement('div'); meta.className = 't-meta'; meta.textContent = [t.canal, t.impact].filter(Boolean).join(' · ');
      main.append(actionLine(t), meta);
      const w = document.createElement('span'); w.className = 't-who';
      w.append(pill(t.qui === 'Driss' ? 'warn' : t.qui === 'Claude' ? 'ok' : 'neutral', `${WHO[t.qui] || t.qui}${t.statut && t.statut !== 'à faire' ? ` · ${t.statut}` : ''}`));
      li.append(dot, main, w); list.append(li);
    });
    $('#todo-more').textContent = rows.length > MAX ? `Voir les ${rows.length} actions, les sources et le journal` : 'Sources de données et journal des changements';
  }

  // ---------- Tables ----------
  const pill = (cls, txt) => { const s = document.createElement('span'); s.className = `pill ${cls}`; s.textContent = txt; return s; };

  function table(el, rows, cols, opts = {}) {
    if (!rows) { el.innerHTML = '<tbody><tr><td class="empty">Source indisponible pour le moment</td></tr></tbody>'; return; }
    let sortKey = opts.sort || null; let dir = opts.asc ? 1 : -1; let filter = '';
    const maxOf = {}; cols.filter((c) => c.bar).forEach((c) => { maxOf[c.k] = d3.max(rows, (r) => Number(r[c.k])) || 1; });
    function render() {
      let rs = rows.filter((r) => !filter || cols.some((c) => String(r[c.k] ?? '').toLowerCase().includes(filter)));
      if (sortKey) rs = [...rs].sort((a, b) => { const x = a[sortKey]; const y = b[sortKey]; return (typeof x === 'number' && typeof y === 'number' ? x - y : String(x ?? '').localeCompare(String(y ?? ''), 'fr')) * dir; });
      const thead = document.createElement('thead'); const htr = document.createElement('tr');
      cols.forEach((c) => {
        const th = document.createElement('th'); if (c.n) th.className = 'n';
        const b = document.createElement('button'); b.type = 'button'; b.textContent = c.label;
        if (sortKey === c.k) th.setAttribute('aria-sort', dir > 0 ? 'ascending' : 'descending');
        b.addEventListener('click', () => { dir = sortKey === c.k ? -dir : (c.n ? -1 : 1); sortKey = c.k; render(); });
        th.append(b); htr.append(th);
      });
      thead.append(htr);
      const tbody = document.createElement('tbody');
      if (!rs.length) { const tr = document.createElement('tr'); const td = document.createElement('td'); td.colSpan = cols.length; td.className = 'empty'; td.textContent = rows.length ? 'Aucune ligne ne correspond' : 'Rien pour le moment'; tr.append(td); tbody.append(tr); }
      rs.forEach((r) => {
        const tr = document.createElement('tr');
        cols.forEach((c) => {
          const td = document.createElement('td'); if (c.n) td.className = 'n';
          if (c.render) c.render(td, r);
          else if (c.bar) { const s = document.createElement('span'); s.className = 'bar'; s.style.width = `${Math.max(2, (Number(r[c.k]) / maxOf[c.k]) * 60)}px`; td.append(s, document.createTextNode(num(r[c.k]))); }
          else td.textContent = c.fmt ? c.fmt(r[c.k], r) : (c.n ? num(r[c.k]) : (r[c.k] ?? '—'));
          tr.append(td);
        });
        tbody.append(tr);
      });
      el.replaceChildren(thead, tbody);
    }
    if (opts.search) opts.search.addEventListener('input', () => { filter = opts.search.value.trim().toLowerCase(); render(); });
    render();
  }

  const statutPill = (s) => pill(/en ligne|fait/.test(s) ? 'ok' : /revue|attend|valider|prévu/.test(s) ? 'warn' : /refus/.test(s) ? 'bad' : 'neutral', s);
  const TABLES = {
    requetes: () => [D.gsc_requetes, [{ k: 'requete', label: 'Requête' }, { k: 'impressions', label: 'Appar.', n: true, bar: true }, { k: 'clics', label: 'Clics', n: true }, { k: 'position', label: 'Pos.', n: true, fmt: (v) => (v == null ? '—' : nf1.format(v)) }], { sort: 'impressions' }],
    gscpages: () => [D.gsc_pages, [{ k: 'page', label: 'Page' }, { k: 'impressions', label: 'Appar.', n: true, bar: true }, { k: 'clics', label: 'Clics', n: true }, { k: 'position', label: 'Pos.', n: true, fmt: (v) => (v == null ? '—' : nf1.format(v)) }], { sort: 'impressions' }],
    canaux: () => [D.ga4_canaux, [{ k: 'canal', label: 'Canal', fmt: (v) => CHANNELS[v] || v }, { k: 'sessions', label: 'Visites', n: true, bar: true }, { k: 'sessions_avant', label: 'Avant', n: true }, { k: 'conversions', label: 'Conv.', n: true }], { sort: 'sessions' }],
    pages: () => [D.ga4_pages, [{ k: 'page', label: 'Page' }, { k: 'sessions', label: 'Visites', n: true, bar: true }, { k: 'conversions', label: 'Conv.', n: true }], { sort: 'sessions' }],
    evenements: () => [D.ga4_evenements, [{ k: 'libelle', label: 'Événement' }, { k: 'nombre', label: '28 j', n: true }, { k: 'nombre_avant', label: 'Avant', n: true },
      { k: 'nombre', label: 'Évolution', n: true, render: (td, r) => { const [t, c] = deltaText(r.nombre, r.nombre_avant); td.textContent = t || '—'; td.classList.add(c); } }]],
    attente: () => [D.listes_attente, [{ k: 'sport', label: 'Sport', fmt: (v) => SPORTS[v] || v }, { k: 'secteur', label: 'Secteur' }, { k: 'inscrits', label: 'Inscrits', n: true, bar: true }], { sort: 'inscrits' }],
    stores: () => [D.stores, [{ k: 'store', label: 'Store' }, { k: 'avis_ecrits', label: 'Avis écrits', n: true }, { k: 'note_moyenne', label: 'Note', n: true, fmt: (v) => (v == null ? '—' : `${nf1.format(v)} ★`) }, { k: 'avis_7j', label: '7 j', n: true }]],
    sorties: () => [D.sorties, [{ k: 'sport', label: 'Sport', fmt: (v) => SPORTS[v] || v }, { k: 'zone', label: 'Zone' }, { k: 'prix', label: 'Prix' }, { k: 'sorties', label: 'Sorties', n: true }], { sort: 'sorties' }],
    acces: () => [D.acces, [{ k: 'source', label: 'Source' },
      { k: 'etat', label: 'État', render: (td, r) => td.append(pill({ ok: 'ok', manquant: 'warn', 'bloqué': 'bad' }[r.etat] || 'neutral', r.etat)) },
      { k: 'a_faire', label: 'À faire', fmt: (v) => v || '' },
      { k: 'lien', label: 'Lien', render: (td, r) => { if (r.lien) { const a = document.createElement('a'); a.href = r.lien; a.target = '_blank'; a.rel = 'noopener'; a.textContent = 'Ouvrir'; td.append(a); } } }]],
    afaire: () => [D.a_faire, [{ k: 'priorite', label: 'Prio.', n: true }, { k: 'qui', label: 'Qui', fmt: (v) => WHO[v] || v }, { k: 'canal', label: 'Canal' },
      { k: 'action', label: 'Action', render: (td, r) => td.append(actionLine(r)) }, { k: 'impact', label: 'Pourquoi' },
      { k: 'statut', label: 'Statut', render: (td, r) => td.append(statutPill(r.statut)) }], { sort: 'priorite', asc: true }],
    journal: () => [D.actions, [{ k: 'date', label: 'Date' }, { k: 'canal', label: 'Canal' }, { k: 'action', label: 'Action' }, { k: 'statut', label: 'Statut', render: (td, r) => td.append(statutPill(r.statut)) }], { sort: 'date' }],
  };

  // ---------- Graphiques ----------
  const css = (v) => getComputedStyle(document.documentElement).getPropertyValue(v).trim();
  function tipIn(box) { let t = $('.tip', box); if (!t) { t = document.createElement('div'); t.className = 'tip'; t.hidden = true; box.append(t); } return t; }
  function showTip(box, tip, x, y, lines) {
    tip.replaceChildren(...lines.map(([cls, txt]) => { const d = document.createElement('div'); if (cls) d.className = cls; d.textContent = txt; return d; }));
    tip.hidden = false;
    const tw = tip.offsetWidth; tip.style.left = `${Math.min(Math.max(0, x - tw / 2), box.clientWidth - tw)}px`;
    tip.style.top = `${Math.max(0, y - tip.offsetHeight - 10)}px`;
  }
  function textWidth(svg, s) { const t = svg.append('text').attr('font-size', 11).attr('font-family', css('--mono')).text(s); const w = t.node().getComputedTextLength(); t.remove(); return w; }
  function axisY(svg, y, ticks, x0, x1) {
    svg.append('g').selectAll('line').data(ticks).join('line').attr('x1', x0).attr('x2', x1).attr('y1', (t) => y(t)).attr('y2', (t) => y(t)).attr('stroke', css('--grid'));
    svg.append('g').selectAll('text').data(ticks).join('text').attr('x', x0 - 6).attr('y', (t) => y(t)).attr('dy', '0.32em').attr('text-anchor', 'end')
      .attr('font-size', 11).attr('font-family', css('--mono')).attr('fill', css('--muted')).text((t) => nf.format(t));
  }
  function empty(box, txt) { const d = document.createElement('div'); d.className = 'empty'; d.textContent = txt; box.append(d); }

  function barsVisites(box) {
    box.replaceChildren(); const rows = D.ga4_jour;
    if (!rows || !rows.length) return empty(box, 'Pas encore de visites enregistrées');
    const data = rows.map((d) => ({ day: new Date(`${d.jour}T00:00:00Z`), v: +d.sessions, c: +d.conversions }));
    const H = 230; const W = Math.max(300, box.clientWidth);
    const svg = d3.select(box).append('svg').attr('width', '100%').attr('height', H).attr('viewBox', `0 0 ${W} ${H}`);
    const y = d3.scaleLinear([0, d3.max(data, (d) => d.v) || 1], [H - 24, 8]).nice(); const ticks = y.ticks(4);
    const ml = textWidth(svg, nf.format(d3.max(ticks))) + 12;
    const x = d3.scaleBand(data.map((d) => +d.day), [ml, W]).padding(0.2);
    axisY(svg, y, ticks, ml, W);
    const bars = svg.append('g').selectAll('rect').data(data).join('rect').attr('x', (d) => x(+d.day)).attr('width', x.bandwidth())
      .attr('y', (d) => y(d.v)).attr('height', (d) => y(0) - y(d.v)).attr('rx', Math.min(3, x.bandwidth() / 2))
      .attr('fill', (d) => (d.c > 0 ? css('--accent') : css('--accent-2')));
    [[data[0].day, ml, 'start'], [data[data.length - 1].day, W, 'end']].forEach(([d, xx, a]) => svg.append('text').attr('x', xx).attr('y', H - 6).attr('text-anchor', a).attr('font-size', 11).attr('fill', css('--muted')).text(fmtDay(d)));
    const tip = tipIn(box);
    bars.on('mouseenter', (e, d) => { bars.attr('opacity', (b) => (b === d ? 1 : 0.45)); showTip(box, tip, x(+d.day) + x.bandwidth() / 2, y(d.v), [['d', fmtDay(d.day)], ['', `${nf.format(d.v)} visites`], ['', `${nf.format(d.c)} conversion${d.c > 1 ? 's' : ''}`]]); })
      .on('mouseleave', () => { bars.attr('opacity', 1); tip.hidden = true; });
  }

  function linesGsc(box) {
    box.replaceChildren(); const rows = D.gsc_jour;
    if (!rows || !rows.length) return empty(box, 'Pas encore de données Search Console');
    const data = rows.map((d) => ({ day: new Date(`${d.jour}T00:00:00Z`), imp: +d.impressions, clk: +d.clics }));
    const H = 230; const W = Math.max(300, box.clientWidth);
    const svg = d3.select(box).append('svg').attr('width', '100%').attr('height', H).attr('viewBox', `0 0 ${W} ${H}`);
    const y = d3.scaleLinear([0, d3.max(data, (d) => d.imp) || 1], [H - 24, 8]).nice(); const ticks = y.ticks(4);
    const ml = textWidth(svg, nf.format(d3.max(ticks))) + 12;
    const last = data[data.length - 1];
    const mr = Math.max(textWidth(svg, `Apparitions ${nf.format(last.imp)}`), textWidth(svg, `Clics ${nf.format(last.clk)}`)) + 10;
    const x = data.length > 1 ? d3.scaleUtc(d3.extent(data, (d) => d.day), [ml + 4, W - mr]) : () => (ml + W - mr) / 2;
    axisY(svg, y, ticks, ml, W - mr);
    const series = [['imp', 'Apparitions', css('--accent')], ['clk', 'Clics', css('--accent-2')]];
    series.forEach(([k, , col]) => {
      svg.append('path').datum(data).attr('fill', 'none').attr('stroke', col).attr('stroke-width', 2).attr('stroke-linejoin', 'round').attr('stroke-linecap', 'round').attr('d', d3.line().x((d) => x(d.day)).y((d) => y(d[k])));
      if (data.length < 40) svg.append('g').selectAll('circle').data(data).join('circle').attr('cx', (d) => x(d.day)).attr('cy', (d) => y(d[k])).attr('r', 2.5).attr('fill', col);
    });
    const ly = [y(last.imp), y(last.clk)]; if (Math.abs(ly[0] - ly[1]) < 14) ly[1] = ly[0] + 14;
    series.forEach(([k, name, col], i) => svg.append('text').attr('x', x(last.day) + 6).attr('y', ly[i]).attr('dy', '0.32em').attr('font-size', 11).attr('fill', col).text(`${name} ${nf.format(last[k])}`));
    svg.append('text').attr('x', ml).attr('y', H - 6).attr('font-size', 11).attr('fill', css('--muted')).text(fmtDay(data[0].day));
    if (data.length > 1) svg.append('text').attr('x', W - mr).attr('y', H - 6).attr('text-anchor', 'end').attr('font-size', 11).attr('fill', css('--muted')).text(fmtDay(last.day));
    const tip = tipIn(box);
    const step = data.length > 1 ? (x(last.day) - x(data[0].day)) / (data.length - 1) : 40;
    svg.append('g').selectAll('rect').data(data).join('rect').attr('x', (d) => x(d.day) - step / 2).attr('width', step).attr('y', 0).attr('height', H - 24).attr('fill', 'transparent')
      .on('mouseenter', (e, d) => showTip(box, tip, x(d.day), y(d.imp), [['d', fmtDay(d.day)], ['', `${nf.format(d.imp)} apparitions`], ['', `${nf.format(d.clk)} clics`]]))
      .on('mouseleave', () => { tip.hidden = true; });
  }
  const CHARTS = { visites: barsVisites, gsc: linesGsc };

  // ---------- Panneau de détail ----------
  const drawer = $('#drawer'); const scrim = $('#scrim'); let lastFocus = null; let current = null;
  function drawCharts() { $$('[data-chart]', drawer).forEach((b) => CHARTS[b.dataset.chart](b)); }
  function open(id, push = true) {
    const tpl = document.getElementById(`tpl-${id}`); if (!tpl) return;
    current = id; lastFocus = document.activeElement;
    $('#d-title').textContent = TITLES[id] || id;
    const body = $('#d-body'); body.replaceChildren(tpl.content.cloneNode(true));
    $$('.d-actions', body).forEach((box) => {
      (D.a_faire || []).filter((t) => t.canal === box.dataset.canal).forEach((t) => {
        const d = document.createElement('div'); d.className = `d-act p${t.priorite}`;
        const who = document.createElement('strong'); who.textContent = `${WHO[t.qui] || t.qui} : `;
        d.append(who, actionLine(t), document.createTextNode(t.impact ? ` (${t.impact})` : ''));
        box.append(d);
      });
    });
    $$('[data-table]', body).forEach((el) => {
      const [rows, cols, opts = {}] = TABLES[el.dataset.table]();
      const search = $(`[data-search="${el.dataset.table}"]`, body);
      table(el, rows, cols, { ...opts, search });
    });
    scrim.hidden = false; drawer.classList.add('open'); drawer.setAttribute('aria-hidden', 'false');
    requestAnimationFrame(() => { drawCharts(); drawer.focus(); });
    if (push) history.replaceState(null, '', `#${id}`);
  }
  function close() {
    drawer.classList.remove('open'); drawer.setAttribute('aria-hidden', 'true'); scrim.hidden = true; current = null;
    history.replaceState(null, '', location.pathname);
    if (lastFocus) lastFocus.focus();
  }
  document.addEventListener('click', (e) => { const b = e.target.closest('[data-open]'); if (b) open(b.dataset.open); });
  $('#d-close').addEventListener('click', close);
  scrim.addEventListener('click', close);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && current) close(); });
  $$('.chip').forEach((c) => c.addEventListener('click', () => { $$('.chip').forEach((x) => x.classList.toggle('on', x === c)); renderTodo(c.dataset.who); }));
  let rt; window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { if (current) drawCharts(); }, 150); });

  load().then(() => {
    renderBoard();
    const id = location.hash.slice(1); if (TITLES[id]) open(id, false);
  });
})();
