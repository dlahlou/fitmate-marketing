// Cockpit Fitmates : écran d'action (à faire + canaux) et panneaux de détail au clic.
// Données : data/*.json, réécrits chaque jour par scripts/cockpit_export.py.
(function () {
  const FILES = ['meta', 'ga4_jour', 'ga4_canaux', 'ga4_pages', 'ga4_evenements', 'gsc_jour', 'gsc_requetes', 'gsc_pages',
    'stores', 'app_store_stats', 'play_stats', 'reseaux', 'publications', 'sorties', 'listes_attente', 'acces', 'actions', 'a_faire', 'kpis'];
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
  const TITLES = { google: 'Google', site: 'Site fitmates.net', leads: 'Leads', stores: 'Stores', app: "Offre dans l'app", social: 'Réseaux sociaux', actions: 'Actions, sources et journal', strategie: 'Stratégie et KPIs' };
  const WHO = { Driss: 'Toi', Claude: 'Claude', Google: 'En attente de Google' };
  let D = {};

  async function load() {
    await Promise.all([...FILES.map((f) => `data/${f}`), 'strategie'].map(async (f) => {
      const k = f.replace('data/', '');
      try { const r = await fetch(`${f}.json`, { cache: 'no-cache' }); D[k] = r.ok ? await r.json() : null; } catch { D[k] = null; }
    }));
    await loadEtat();
  }

  // ---------- « Fait » : déclaré par Driss (api/etat, stockage Vercel Blob), vérifié ensuite par Claude ----------
  async function loadEtat() {
    try { const r = await fetch('api/etat', { cache: 'no-store' }); D.etat = r.ok ? await r.json() : {}; } catch { D.etat = {}; }
    (D.a_faire || []).forEach((t) => {
      const e = D.etat[t.id]; const v = t.verification;
      t.declare = e && e.statut === 'déclaré fait' && (!v || v.date < e.date || v.resultat === 'en attente') ? e : null;
      t.echec = !t.declare && v && v.resultat === 'échec' && (!e || v.date > e.date) ? v : null;
    });
  }
  async function setEtat(t, statut) {
    const r = await fetch('api/etat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: t.id, statut }) });
    if (!r.ok) throw new Error(`enregistrement refusé (${r.status})`);
    await loadEtat(); renderTodo('all');
  }
  const fmtDate = (iso) => new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Paris' }).format(new Date(iso));
  function etatBlock(t) {
    const box = el('div', 'etat');
    const msg = el('p', 'etat-msg');
    if (t.declare) msg.textContent = `Marqué fait le ${fmtDate(t.declare.date)}. Claude vérifie au prochain passage (chaque jour à 6 h 47 et 12 h 13).`;
    else if (t.echec) { msg.classList.add('bad'); msg.textContent = `Claude n'a pas pu vérifier (${fmtDate(t.echec.date)}) : ${t.echec.raison}.`; }
    else if (t.verification?.resultat === 'en attente') msg.textContent = `En attente : ${t.verification.raison}.`;
    const b = el('button', `etat-btn${t.declare ? ' undo' : ''}`, t.declare ? 'Annuler : ce n\'est pas fait' : '✓ Marquer comme fait');
    b.type = 'button';
    b.addEventListener('click', async () => {
      b.disabled = true; b.textContent = 'Enregistrement…';
      try { await setEtat(t, t.declare ? 'à faire' : 'déclaré fait'); openAction(t, false); } catch (e) { b.disabled = false; b.textContent = `Erreur : ${e.message}`; }
    });
    if (t.qui === 'Driss') box.append(b);
    if (msg.textContent) box.append(msg);
    return box;
  }

  // ---------- Stratégie et KPIs ----------
  const el = (tag, cls, txt) => { const e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; };
  function kpiList() {
    const vals = Object.fromEntries((D.kpis || []).map((r) => [r.id, r.valeur]));
    return (D.strategie?.kpis || []).map((k) => ({ ...k, valeur: vals[k.id] ?? null }));
  }
  const fmtK = (k, v) => (v == null ? '—' : k.unite === '%' ? `${nf1.format(v)} %` : k.unite === '★' ? `${nf1.format(v)} ★` : k.unite === '/30' ? `${v}/30` : nf1.format(v));
  function progress(k) {
    const box = el('div', 'kbar');
    if (k.valeur == null || !k.cible_3m) return box;
    const r = Math.min(1, k.valeur / k.cible_3m);
    const fill = el('span', r >= 1 ? 'ok' : r >= 0.5 ? 'mid' : 'low'); fill.style.width = `${Math.max(2, r * 100)}%`; box.append(fill);
    return box;
  }
  function missing(k) {
    const t = (D.a_faire || []).find((a) => a.id === k.acces);
    if (t) { const s = el('span', 'kmiss'); s.append('à brancher : ', actionLine({ ...t, action: 'ouvrir l\'action' })); return s; }
    return el('span', 'kmiss', k.source && k.source.includes('construire') ? 'pas encore mesuré' : 'pas encore de donnée');
  }
  function renderCap() {
    const box = $('#cap-tiles'); if (!box) return; box.replaceChildren();
    const ks = kpiList(); const byId = Object.fromEntries(ks.map((k) => [k.id, k]));
    ['participations_semaine', 'organisateurs_actifs', 'sessions_organiques_28j', 'installs_28j', 'abonnes_reseaux', 'posts_7j'].forEach((id) => {
      const k = byId[id]; if (!k) return;
      const t = el('button', `kt${k.etoile ? ' star' : ''}`); t.type = 'button'; t.dataset.open = 'strategie';
      t.append(el('span', 'kt-name', k.etoile ? `★ ${k.nom}` : k.nom), el('span', 'kt-val', fmtK(k, k.valeur)));
      if (k.valeur == null) t.append(missing(k));
      else t.append(el('span', 'kt-sub', k.cible_3m != null ? `cible ${D.strategie.echeances['3m']} : ${fmtK(k, k.cible_3m)}` : (k.cible_note || '')), progress(k));
      box.append(t);
    });
  }
  function renderStrategie(root) {
    const S = D.strategie; if (!S) { root.append(el('p', 'd-note', 'strategie.json introuvable')); return; }
    const ks = kpiList(); const byId = Object.fromEntries(ks.map((k) => [k.id, k]));
    const card = (title, sub) => { const c = el('article', 'card'); c.append(el('h3', null, title)); if (sub) c.append(el('p', 'sub', sub)); root.append(c); return c; };
    const p1 = card('Cap', `Mis à jour le ${S.maj} · sources : ${S.source}`);
    p1.append(el('p', 'promesse', `« ${S.promesse} »`), el('p', 'd-note', S.positionnement));

    const c2 = card('Arbre des KPIs', `Cibles : à 3 mois (${S.echeances['3m']}) et à 12 mois (${S.echeances['12m']}). Valeur actuelle tirée de l'export du jour.`);
    const tbl = el('table', 'tbl ktree'); const th = el('thead'); const hr = el('tr');
    ['KPI', 'Valeur', 'Cible 3 mois', 'Cible 12 mois', 'Progression', 'Source'].forEach((h, i) => hr.append(el('th', i && i < 4 ? 'n' : null, h))); th.append(hr);
    const tb = el('tbody');
    const row = (k, lvl) => {
      const tr = el('tr', `lvl${lvl}`);
      tr.append(el('td', null, `${k.etoile ? '★ ' : ''}${k.nom}`), el('td', 'n', fmtK(k, k.valeur)), el('td', 'n', k.cible_3m != null ? fmtK(k, k.cible_3m) : (k.cible_note ? 'à fixer' : '—')),
        el('td', 'n', k.cible_12m != null ? fmtK(k, k.cible_12m) : '—'));
      const pc = el('td'); pc.append(k.valeur == null ? missing(k) : progress(k)); tr.append(pc, el('td', 'src', k.source || ''));
      tb.append(tr);
    };
    const star = ks.find((k) => k.etoile); if (star) row(star, 0);
    const groups = [...new Set(ks.filter((k) => k.groupe).map((k) => k.groupe))];
    groups.forEach((g) => {
      const gr = el('tr', 'grp'); const gd = el('td', null, g); gd.colSpan = 6; gr.append(gd); tb.append(gr);
      const inG = ks.filter((k) => k.groupe === g);
      const children = new Set(inG.flatMap((k) => k.sous || []));
      inG.filter((k) => !children.has(k.id)).forEach((k) => { row(k, 1); (k.sous || []).map((id) => byId[id]).filter((c) => c && c.groupe === g).forEach((c) => row(c, 2)); });
    });
    tbl.append(th, tb); const sc = el('div', 'scroll'); sc.append(tbl); c2.append(sc);

    const c3 = card('Canaux', 'Rôle, KPIs suivis, état et prochaine étape. Les actions ouvertes sont dans « À faire ».');
    const t3 = el('table', 'tbl'); const h3 = el('tr'); ['Canal', 'Rôle', 'KPIs', 'État', 'Prochaine étape'].forEach((h) => h3.append(el('th', null, h)));
    const th3 = el('thead'); th3.append(h3); const tb3 = el('tbody');
    S.canaux.forEach((c) => {
      const tr = el('tr'); tr.append(el('td', null, c.canal), el('td', null, c.role),
        el('td', null, c.kpis.map((id) => byId[id]).filter(Boolean).map((k) => `${k.nom} : ${fmtK(k, k.valeur)}`).join(' · ')));
      const st = el('td'); st.append(statutPill(c.etat)); tr.append(st, el('td', null, c.prochain)); tb3.append(tr);
    });
    t3.append(th3, tb3); const s3 = el('div', 'scroll'); s3.append(t3); c3.append(s3);

    const c4 = card('Cibles');
    const ul = el('ul', 'plain'); S.cibles.forEach((c) => { const li = el('li'); li.append(el('strong', null, `${c.nom} : `), c.detail); ul.append(li); }); c4.append(ul);
    const c5 = card('Décisions'); const ol = el('ol', 'plain'); S.decisions.forEach((d) => ol.append(el('li', null, d))); c5.append(ol);
    const c6 = card('Les deux boucles à faire tourner');
    S.boucles.forEach((b) => { const p = el('p', 'loop'); p.append(el('strong', null, `${b.nom} : `), b.etapes.join(' → ')); c6.append(p); });
    const c7 = card('Calendrier');
    const t7 = el('table', 'tbl'); const tb7 = el('tbody');
    S.calendrier.forEach((c) => { const tr = el('tr'); const st = el('td'); st.append(statutPill(c.etat)); tr.append(el('td', null, c.quand), el('td', null, c.quoi), st); tb7.append(tr); });
    t7.append(tb7); c7.append(t7);
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
      installs: D.app_store_stats || D.play_stats
        ? `${num(sum(D.app_store_stats, 'telechargements') + sum((D.play_stats || []).filter((r) => !r.source.startsWith('France')), 'acquisitions'))} installations sur 28 j`
        : 'installations : en attente des rapports',
      abonnes: D.reseaux ? sum(D.reseaux, 'abonnes') : null,
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
    renderCap();
  }

  function actionLine(t, withLink = true) {
    const a = document.createElement('span'); a.className = 't-action';
    if ((t.etapes?.length || t.qui === 'Driss') && withLink) {
      const b = document.createElement('a'); b.href = `#action-${t.id}`; b.textContent = t.action;
      b.addEventListener('click', (e) => { e.preventDefault(); openAction(t); }); a.append(b);
    } else if (t.lien && withLink) { const l = document.createElement('a'); l.href = t.lien; l.target = '_blank'; l.rel = 'noopener'; l.textContent = t.action; a.append(l); }
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
      if (t.declare) w.append(pill('ok', 'fait · Claude vérifie'));
      else if (t.echec) w.append(pill('bad', 'à reprendre'));
      else w.append(pill(t.qui === 'Driss' ? 'warn' : t.qui === 'Claude' ? 'ok' : 'neutral', `${WHO[t.qui] || t.qui}${t.statut && t.statut !== 'à faire' ? ` · ${t.statut}` : ''}`));
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

  const statutPill = (s) => pill(/en ligne|fait|livr|en cours/.test(s) ? 'ok' : /revue|attend|valider|prévu|prêt/.test(s) ? 'warn' : /refus|pause/.test(s) ? 'bad' : 'neutral', s);
  const TABLES = {
    requetes: () => [D.gsc_requetes, [{ k: 'requete', label: 'Requête' }, { k: 'impressions', label: 'Appar.', n: true, bar: true }, { k: 'clics', label: 'Clics', n: true }, { k: 'position', label: 'Pos.', n: true, fmt: (v) => (v == null ? '—' : nf1.format(v)) }], { sort: 'impressions' }],
    gscpages: () => [D.gsc_pages, [{ k: 'page', label: 'Page' }, { k: 'impressions', label: 'Appar.', n: true, bar: true }, { k: 'clics', label: 'Clics', n: true }, { k: 'position', label: 'Pos.', n: true, fmt: (v) => (v == null ? '—' : nf1.format(v)) }], { sort: 'impressions' }],
    canaux: () => [D.ga4_canaux, [{ k: 'canal', label: 'Canal', fmt: (v) => CHANNELS[v] || v }, { k: 'sessions', label: 'Visites', n: true, bar: true }, { k: 'sessions_avant', label: 'Avant', n: true }, { k: 'conversions', label: 'Conv.', n: true }], { sort: 'sessions' }],
    pages: () => [D.ga4_pages, [{ k: 'page', label: 'Page' }, { k: 'sessions', label: 'Visites', n: true, bar: true }, { k: 'conversions', label: 'Conv.', n: true }], { sort: 'sessions' }],
    evenements: () => [D.ga4_evenements, [{ k: 'libelle', label: 'Événement' }, { k: 'nombre', label: '28 j', n: true }, { k: 'nombre_avant', label: 'Avant', n: true },
      { k: 'nombre', label: 'Évolution', n: true, render: (td, r) => { const [t, c] = deltaText(r.nombre, r.nombre_avant); td.textContent = t || '—'; td.classList.add(c); } }]],
    attente: () => [D.listes_attente, [{ k: 'sport', label: 'Sport', fmt: (v) => SPORTS[v] || v }, { k: 'secteur', label: 'Secteur' }, { k: 'inscrits', label: 'Inscrits', n: true, bar: true }], { sort: 'inscrits' }],
    stores: () => [D.stores, [{ k: 'store', label: 'Store' }, { k: 'avis_ecrits', label: 'Avis écrits', n: true }, { k: 'note_moyenne', label: 'Note', n: true, fmt: (v) => (v == null ? '—' : `${nf1.format(v)} ★`) }, { k: 'avis_7j', label: '7 j', n: true }]],
    iosstats: () => [D.app_store_stats, [{ k: 'source', label: 'Source' }, { k: 'impressions', label: 'Impr.', n: true, bar: true }, { k: 'pages_vues', label: 'Fiche vue', n: true }, { k: 'telechargements', label: 'Téléch.', n: true }, { k: 'conversion', label: 'Conv.', n: true, fmt: (v) => (v == null ? '—' : pct.format(v)) }], { sort: 'impressions' }],
    playstats: () => [D.play_stats, [{ k: 'source', label: 'Source' }, { k: 'visiteurs', label: 'Visiteurs', n: true, bar: true }, { k: 'acquisitions', label: 'Installs', n: true }, { k: 'conversion', label: 'Conv.', n: true, fmt: (v) => (v == null ? '—' : pct.format(v)) }]],
    reseaux: () => [D.reseaux, [{ k: 'reseau', label: 'Réseau' }, { k: 'abonnes', label: 'Abonnés', n: true }, { k: 'publications', label: 'Publications', n: true }, { k: 'portee_28j', label: 'Portée 28 j', n: true }, { k: 'vues_profil_28j', label: 'Vues profil', n: true }, { k: 'clics_site_28j', label: 'Clics site', n: true }]],
    publications: () => [D.publications, [{ k: 'date', label: 'Date' }, { k: 'post', label: 'Post', render: (td, r) => { if (r.lien) { const a = document.createElement('a'); a.href = r.lien; a.target = '_blank'; a.rel = 'noopener'; a.textContent = r.post; td.append(a); } else td.textContent = r.post; } }, { k: 'likes', label: 'Likes', n: true }, { k: 'commentaires', label: 'Comm.', n: true }], { sort: 'date' }],
    sorties: () => [D.sorties, [{ k: 'sport', label: 'Sport', fmt: (v) => SPORTS[v] || v }, { k: 'zone', label: 'Zone' }, { k: 'prix', label: 'Prix' }, { k: 'sorties', label: 'Sorties', n: true }], { sort: 'sorties' }],
    acces: () => [D.acces, [{ k: 'source', label: 'Source' },
      { k: 'etat', label: 'État', render: (td, r) => td.append(pill({ ok: 'ok', 'en attente': 'neutral', manquant: 'warn', 'bloqué': 'bad' }[r.etat] || 'neutral', r.etat)) },
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
    const strat = $('#strat', body); if (strat) renderStrategie(strat);
    $$('[data-table]', body).forEach((el) => {
      const [rows, cols, opts = {}] = TABLES[el.dataset.table]();
      const search = $(`[data-search="${el.dataset.table}"]`, body);
      table(el, rows, cols, { ...opts, search });
    });
    scrim.hidden = false; drawer.classList.add('open'); drawer.setAttribute('aria-hidden', 'false');
    requestAnimationFrame(() => { drawCharts(); drawer.focus(); });
    if (push) history.replaceState(null, '', `#${id}`);
  }
  // Une action : étapes numérotées, un bouton par lien, un bouton « Copier » par texte à coller.
  function openAction(t, push = true) {
    lastFocus = document.activeElement; current = `action-${t.id}`;
    $('#d-title').textContent = t.action;
    const body = $('#d-body'); body.replaceChildren();
    const why = document.createElement('p'); why.className = 'd-note';
    why.textContent = [t.impact && `Pourquoi : ${t.impact}.`, t.duree && `Temps : ${t.duree}.`].filter(Boolean).join(' ');
    const ol = document.createElement('ol'); ol.className = 'steps';
    const etapes = t.etapes?.length ? t.etapes : (t.lien ? [{ texte: t.action, lien: t.lien }] : [{ texte: t.action }]);
    etapes.forEach((e) => {
      const li = document.createElement('li');
      const p = document.createElement('div'); p.textContent = e.texte; li.append(p);
      if (e.lien) {
        const a = document.createElement('a'); a.className = 'step-link'; a.href = e.lien; a.target = '_blank'; a.rel = 'noopener';
        a.textContent = e.libelle_lien || 'Ouvrir ↗'; li.append(a);
      }
      if (e.copier) {
        const box = document.createElement('div'); box.className = 'copy';
        const pre = document.createElement('pre'); pre.textContent = e.copier;
        const b = document.createElement('button'); b.type = 'button'; b.textContent = 'Copier';
        b.addEventListener('click', async () => {
          try { await navigator.clipboard.writeText(e.copier); b.textContent = 'Copié ✓'; } catch { b.textContent = 'Sélectionne le texte'; }
          setTimeout(() => { b.textContent = 'Copier'; }, 1800);
        });
        box.append(pre, b); li.append(box);
      }
      ol.append(li);
    });
    body.append(why, ol, etatBlock(t));
    scrim.hidden = false; drawer.classList.add('open'); drawer.setAttribute('aria-hidden', 'false');
    requestAnimationFrame(() => drawer.focus());
    if (push) history.replaceState(null, '', `#action-${t.id}`);
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
    const id = decodeURIComponent(location.hash.slice(1)); if (TITLES[id]) open(id, false);
    const act = (D.a_faire || []).find((t) => `action-${t.id}` === id); if (act) openAction(act, false);
  });
})();
