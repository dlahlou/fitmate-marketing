// Cockpit Fitmates : lit les fichiers de data/ (produits chaque jour par scripts/cockpit_export.py) et dessine la page.
(function () {
  const FILES = ['meta', 'ga4_jour', 'ga4_canaux', 'ga4_pages', 'ga4_evenements', 'gsc_jour', 'gsc_requetes', 'gsc_pages',
    'stores', 'sorties', 'listes_attente', 'acces', 'actions'];
  const nf = new Intl.NumberFormat('fr-FR');
  const nf1 = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 1 });
  const pct = new Intl.NumberFormat('fr-FR', { style: 'percent', maximumFractionDigits: 0 });
  const fmtDay = (d) => new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', timeZone: 'UTC' }).format(d);
  const num = (v) => (v === null || v === undefined || v === '' ? '—' : nf.format(v));
  const $ = (s) => document.querySelector(s);
  const CHANNELS = { 'Organic Search': 'Recherche Google', Direct: 'Accès direct', 'Organic Social': 'Réseaux sociaux', Referral: 'Sites référents',
    'AI Assistant': 'Assistants IA', Unassigned: 'Non attribué', 'Paid Search': 'Recherche payante', Email: 'E-mail', 'Paid Social': 'Réseaux payants' };
  const SPORTS = { randonnee: 'Randonnée', 'course-a-pied': 'Course à pied', running: 'Running', padel: 'Padel', trail: 'Trail', velo: 'Vélo', escalade: 'Escalade' };

  async function load() {
    const out = {};
    await Promise.all(FILES.map(async (f) => {
      try {
        const r = await fetch(`data/${f}.json`, { cache: 'no-cache' });
        out[f] = r.ok ? await r.json() : null;
      } catch { out[f] = null; }
    }));
    return out;
  }

  function setDelta(el, cur, prev) {
    el.className = 'delta';
    if (!prev) { el.textContent = cur ? 'nouveau sur la période' : ''; el.classList.add('flat'); return; }
    const p = (cur - prev) / prev;
    el.textContent = `${p > 0 ? '+' : ''}${pct.format(p)} vs 28 j avant`;
    el.classList.add(p > 0.02 ? 'up' : p < -0.02 ? 'down' : 'flat');
  }

  function tiles(D) {
    const ev = Object.fromEntries((D.ga4_evenements || []).map((r) => [r.evenement, r]));
    const sum = (rows, k) => (rows || []).reduce((s, r) => s + Number(r[k] || 0), 0);
    const k = {
      leads: ev.generate_lead?.nombre, storeclicks: ev.app_download_click?.nombre,
      sessions: D.ga4_canaux ? sum(D.ga4_canaux, 'sessions') : null,
      impressions: D.gsc_pages ? sum(D.gsc_pages, 'impressions') : null, clics: D.gsc_pages ? sum(D.gsc_pages, 'clics') : null,
      sorties: D.sorties ? sum(D.sorties, 'sorties') : null,
      sources: D.acces ? D.acces.filter((r) => r.etat === 'ok').length : null, sources_total: D.acces ? D.acces.length : null,
    };
    document.querySelectorAll('[data-k]').forEach((el) => { el.textContent = num(k[el.dataset.k]); });
    const dl = { leads: [ev.generate_lead?.nombre, ev.generate_lead?.nombre_avant], storeclicks: [ev.app_download_click?.nombre, ev.app_download_click?.nombre_avant],
      sessions: [k.sessions, D.ga4_canaux ? sum(D.ga4_canaux, 'sessions_avant') : null] };
    document.querySelectorAll('[data-d]').forEach((el) => { const [c, p] = dl[el.dataset.d] || []; if (c != null) setDelta(el, c, p); });

    const parts = [];
    if (k.sessions != null) {
      const prev = sum(D.ga4_canaux, 'sessions_avant');
      parts.push(`${num(k.sessions)} visites sur le site en 28 jours${prev ? ` (${k.sessions >= prev ? '+' : ''}${pct.format((k.sessions - prev) / prev)})` : ''}`);
    }
    if (k.leads != null) parts.push(`${num(k.leads)} lead${k.leads > 1 ? 's' : ''}`);
    if (k.impressions != null) parts.push(`${num(k.impressions)} apparitions dans Google en 30 jours`);
    const missing = (D.acces || []).filter((r) => r.etat !== 'ok').length;
    $('#take').textContent = parts.length ? `${parts.join(', ')}.${missing ? ` ${missing} source${missing > 1 ? 's' : ''} de données à ouvrir (voir Données).` : ''}` : 'Aucune donnée exportée pour le moment.';
    if (D.meta?.genere_le) {
      const d = new Date(D.meta.genere_le);
      $('#fresh').textContent = `Données du ${new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Paris' }).format(d)}`;
      if (Date.now() - d > 48 * 3600e3) $('#fresh').classList.add('down');
    }
  }

  // ---------- Tables ----------
  function table(el, rows, cols, opts = {}) {
    if (!rows) { el.innerHTML = '<tbody><tr><td class="empty">Source indisponible pour le moment</td></tr></tbody>'; return; }
    let sortKey = opts.sort || null; let dir = -1; let filter = '';
    const maxOf = {}; cols.filter((c) => c.bar).forEach((c) => { maxOf[c.k] = d3.max(rows, (r) => Number(r[c.k])) || 1; });
    function render() {
      let rs = rows.filter((r) => !filter || cols.some((c) => String(r[c.k] ?? '').toLowerCase().includes(filter)));
      if (sortKey) rs = [...rs].sort((a, b) => { const x = a[sortKey]; const y = b[sortKey]; return (typeof x === 'number' && typeof y === 'number' ? x - y : String(x).localeCompare(String(y), 'fr')) * dir; });
      const thead = document.createElement('thead'); const htr = document.createElement('tr');
      cols.forEach((c) => {
        const th = document.createElement('th'); if (c.n) th.className = 'n';
        const b = document.createElement('button'); b.textContent = c.label; b.type = 'button';
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
          else td.textContent = c.n ? (c.fmt || num)(r[c.k]) : (c.fmt ? c.fmt(r[c.k]) : (r[c.k] ?? '—'));
          tr.append(td);
        });
        tbody.append(tr);
      });
      el.replaceChildren(thead, tbody);
    }
    if (opts.search) opts.search.addEventListener('input', () => { filter = opts.search.value.trim().toLowerCase(); render(); });
    render();
  }

  const pill = (cls, txt) => { const s = document.createElement('span'); s.className = `pill ${cls}`; s.textContent = txt; return s; };

  function tables(D) {
    table($('#tb-canaux'), D.ga4_canaux, [
      { k: 'canal', label: 'Canal', fmt: (v) => CHANNELS[v] || v },
      { k: 'sessions', label: 'Visites', n: true, bar: true },
      { k: 'sessions_avant', label: 'Avant', n: true },
      { k: 'conversions', label: 'Conv.', n: true },
    ], { sort: 'sessions' });
    table($('#tb-attente'), D.listes_attente, [
      { k: 'sport', label: 'Sport', fmt: (v) => SPORTS[v] || v }, { k: 'secteur', label: 'Secteur' },
      { k: 'inscrits', label: 'Inscrits', n: true, bar: true },
    ], { sort: 'inscrits' });
    table($('#tb-pages'), D.ga4_pages, [
      { k: 'page', label: 'Page' }, { k: 'sessions', label: 'Visites', n: true, bar: true }, { k: 'conversions', label: 'Conv.', n: true },
    ], { sort: 'sessions' });
    table($('#tb-requetes'), D.gsc_requetes, [
      { k: 'requete', label: 'Requête' }, { k: 'impressions', label: 'Appar.', n: true, bar: true }, { k: 'clics', label: 'Clics', n: true },
      { k: 'position', label: 'Pos.', n: true, fmt: (v) => nf1.format(v) },
    ], { sort: 'impressions', search: $('#q-req') });
    table($('#tb-gscpages'), D.gsc_pages, [
      { k: 'page', label: 'Page' }, { k: 'impressions', label: 'Appar.', n: true, bar: true }, { k: 'clics', label: 'Clics', n: true },
      { k: 'position', label: 'Pos.', n: true, fmt: (v) => nf1.format(v) },
    ], { sort: 'impressions', search: $('#q-pages') });
    table($('#tb-stores'), D.stores, [
      { k: 'store', label: 'Store' }, { k: 'avis_ecrits', label: 'Avis écrits', n: true },
      { k: 'note_moyenne', label: 'Note', n: true, fmt: (v) => (v == null ? '—' : `${nf1.format(v)} ★`) },
      { k: 'avis_7j', label: '7 j', n: true },
    ]);
    table($('#tb-sorties'), D.sorties, [
      { k: 'sport', label: 'Sport', fmt: (v) => SPORTS[v] || v }, { k: 'zone', label: 'Zone' }, { k: 'prix', label: 'Prix' },
      { k: 'sorties', label: 'Sorties', n: true },
    ], { sort: 'sorties' });
    table($('#tb-acces'), D.acces, [
      { k: 'source', label: 'Source' },
      { k: 'etat', label: 'État', render: (td, r) => td.append(pill({ ok: 'ok', manquant: 'warn', 'bloqué': 'bad' }[r.etat] || 'neutral', r.etat)) },
      { k: 'a_faire', label: 'À faire', fmt: (v) => v || '' },
      { k: 'lien', label: 'Lien', render: (td, r) => { if (r.lien) { const a = document.createElement('a'); a.href = r.lien; a.target = '_blank'; a.rel = 'noopener'; a.textContent = 'Ouvrir'; td.append(a); } } },
    ]);
    table($('#tb-actions'), D.actions, [
      { k: 'date', label: 'Date' }, { k: 'canal', label: 'Canal' }, { k: 'action', label: 'Action' },
      { k: 'statut', label: 'Statut', render: (td, r) => td.append(pill(/en ligne|fait/.test(r.statut) ? 'ok' : /revue|attend/.test(r.statut) ? 'warn' : /refus/.test(r.statut) ? 'bad' : 'neutral', r.statut)) },
    ], { sort: 'date' });
  }

  // ---------- Graphiques ----------
  const css = (v) => getComputedStyle(document.documentElement).getPropertyValue(v).trim();

  function tipIn(box) { let t = box.querySelector('.tip'); if (!t) { t = document.createElement('div'); t.className = 'tip'; t.hidden = true; box.append(t); } return t; }
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

  function barsVisites(rows) {
    const box = $('#ch-visites'); box.replaceChildren();
    if (!rows || !rows.length) { box.innerHTML = '<div class="empty">Pas encore de visites enregistrées</div>'; return; }
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
    [[data[0].day, ml, 'start'], [data[data.length - 1].day, W, 'end']].forEach(([d, xx, a]) => svg.append('text').attr('x', xx).attr('y', H - 6).attr('text-anchor', a)
      .attr('font-size', 11).attr('fill', css('--muted')).text(fmtDay(d)));
    const tip = tipIn(box);
    bars.on('mouseenter', (e, d) => { bars.attr('opacity', (b) => (b === d ? 1 : 0.45)); showTip(box, tip, x(+d.day) + x.bandwidth() / 2, y(d.v), [['d', fmtDay(d.day)], ['', `${nf.format(d.v)} visites`], ['', `${nf.format(d.c)} conversion${d.c > 1 ? 's' : ''}`]]); })
      .on('mouseleave', () => { bars.attr('opacity', 1); tip.hidden = true; });
  }

  function linesGsc(rows) {
    const box = $('#ch-gsc'); box.replaceChildren();
    if (!rows || !rows.length) { box.innerHTML = '<div class="empty">Pas encore de données Search Console</div>'; return; }
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
      svg.append('path').datum(data).attr('fill', 'none').attr('stroke', col).attr('stroke-width', 2).attr('stroke-linejoin', 'round').attr('stroke-linecap', 'round')
        .attr('d', d3.line().x((d) => x(d.day)).y((d) => y(d[k])));
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

  load().then((D) => {
    tiles(D); tables(D);
    const draw = () => { barsVisites(D.ga4_jour); linesGsc(D.gsc_jour); };
    draw();
    let t; window.addEventListener('resize', () => { clearTimeout(t); t = setTimeout(draw, 150); });
    matchMedia('(prefers-color-scheme: dark)').addEventListener?.('change', draw);
  });
})();
