// Fitmates · Instagram v2 · composants. Construit UNE slide d'un carrousel décrit en JSON (voir ../README.md).
// render.js injecte window.__CFG__ = { carrousel, index, donnees, photo } avant le chargement.
(function () {
  const W = 1080, H = 1350, M = 72;
  const ORANGE = '#F57C00', PAPIER = '#F4EEE3', ENCRE = '#1A1714', FORET = '#24382C', MOUSSE = '#A8B88A';
  const LOGO = 'logo.png';  // logo de l'app détouré (fond blanc retiré)

  // Typographie française : espace insécable avant ? ! : ; » et après « (jamais de « ? » seul en début de ligne)
  const nbsp = s => String(s ?? '').replace(/ ([?!:;»])/g, '\u00a0$1').replace(/« /g, '«\u00a0');
  const esc = s => nbsp(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  // Mise en forme minimale : **mot** = gras, *mot* = accent orange, ~mot~ = Mousse, | = retour à la ligne voulu
  const md = s => esc(s).replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>').replace(/\*([^*]+)\*/g, '<em>$1</em>').replace(/~([^~]+)~/g, '<span class="doux">$1</span>').replace(/\s*\|\s*/g, '<br>');
  // "10,5 km" → <span class=n>10,5</span><span class=u>km</span>
  const nombre = s => String(s).split(/\s+/).map(t => /^[+\-−]?\d/.test(t) ? `<span class="n">${esc(t)}</span>` : `<span class="u">${esc(t)}</span>`).join('');

  // Les noms composés (Sucy-en-Brie) ne se coupent pas au trait d'union
  const insecable = s => esc(s).replace(/(\S+-\S+)/g, '<span class="nw">$1</span>');

  // Générateur pseudo-aléatoire déterministe (mêmes courbes à chaque rendu)
  function rng(seed) { let a = seed >>> 0; return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function hash(s) { let h = 2166136261; for (const c of String(s)) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; }

  // ---------- Courbes de niveau génératives ----------
  // Champ continu sur toute la largeur du carrousel (x global = index × 1080 + x) : la texture se prolonge d'une slide à l'autre.
  function champ(seed, nSlides) {
    const r = rng(seed), bosses = [];
    const larg = nSlides * W;
    const nb = Math.round(9 * nSlides) + 6;
    for (let i = 0; i < nb; i++) bosses.push({ x: -300 + r() * (larg + 600), y: -300 + r() * (H + 600), s: 170 + r() * 380, a: (r() < .5 ? -1 : 1) * (.5 + r() * .8) });
    return (x, y) => { let v = 0; for (const b of bosses) { const dx = x - b.x, dy = y - b.y; v += b.a * Math.exp(-(dx * dx + dy * dy) / (2 * b.s * b.s)); } return v; };
  }
  function courbes(f, x0, pas, niveaux) {
    // Marching squares sur une grille de `pas` px ; renvoie un chemin SVG
    const nx = Math.ceil(W / pas) + 1, ny = Math.ceil(H / pas) + 1, g = new Float32Array(nx * ny);
    for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) g[j * nx + i] = f(x0 + i * pas, j * pas);
    let d = '';
    const lerp = (a, b, va, vb, l) => a + (b - a) * ((l - va) / (vb - va || 1e-9));
    for (const l of niveaux) {
      for (let j = 0; j < ny - 1; j++) for (let i = 0; i < nx - 1; i++) {
        const a = g[j * nx + i], b = g[j * nx + i + 1], c = g[(j + 1) * nx + i + 1], e = g[(j + 1) * nx + i];
        const k = (a > l) | (b > l) << 1 | (c > l) << 2 | (e > l) << 3;
        if (k === 0 || k === 15) continue;
        const X = i * pas, Y = j * pas;
        const T = [lerp(X, X + pas, a, b, l), Y], R = [X + pas, lerp(Y, Y + pas, b, c, l)], B = [lerp(X, X + pas, e, c, l), Y + pas], L = [X, lerp(Y, Y + pas, a, e, l)];
        const seg = { 1: [L, T], 2: [T, R], 3: [L, R], 4: [R, B], 5: [L, T, R, B], 6: [T, B], 7: [L, B], 8: [L, B], 9: [T, B], 10: [T, R, L, B], 11: [R, B], 12: [L, R], 13: [T, R], 14: [L, T] }[k];
        for (let s = 0; s < seg.length; s += 2) d += `M${seg[s][0].toFixed(1)} ${seg[s][1].toFixed(1)}L${seg[s + 1][0].toFixed(1)} ${seg[s + 1][1].toFixed(1)}`;
      }
    }
    return d;
  }

  // ---------- Tracé : polyligne à coins arrondis ----------
  function arrondi(pts, R) {
    // Points consécutifs confondus retirés (sinon un coin serait sauté et le tracé dévierait au bord)
    pts = pts.filter((p, i) => i === 0 || Math.hypot(p[0] - pts[i - 1][0], p[1] - pts[i - 1][1]) > 0.5);
    let d = `M${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
    for (let i = 1; i < pts.length - 1; i++) {
      const [px, py] = pts[i - 1], [x, y, rmax] = pts[i], [nx, ny] = pts[i + 1];
      const li = Math.hypot(x - px, y - py), lo = Math.hypot(nx - x, ny - y);
      if (li < 1e-6 || lo < 1e-6) continue;
      const r = Math.min(R, li / 2, lo / 2, rmax ?? Infinity);
      const a = [x - (x - px) / li * r, y - (y - py) / li * r], b = [x + (nx - x) / lo * r, y + (ny - y) / lo * r];
      d += `L${a[0].toFixed(1)} ${a[1].toFixed(1)}Q${x.toFixed(1)} ${y.toFixed(1)} ${b[0].toFixed(1)} ${b[1].toFixed(1)}`;
    }
    const z = pts[pts.length - 1];
    return d + `L${z[0].toFixed(1)} ${z[1].toFixed(1)}`;
  }

  // ---------- Composants ----------
  function billet(b) {
    const champs = (b.champs || []).map(([l, v]) => `<div><div class="lab">${esc(l)}</div><div class="v">${esc(v)}</div></div>`).join('');
    const code = (() => { const r = rng(hash(b.numero || b.depart?.gare)); let x = 0, s = ''; while (x < 168) { const w = 1 + Math.floor(r() * 4); if (r() > .35) s += `<rect x="${x}" y="0" width="${w}" height="40"/>`; x += w + 1 + Math.floor(r() * 3); } return `<svg class="code" viewBox="0 0 170 40" preserveAspectRatio="none" fill="${ENCRE}">${s}</svg>`; })();
    return `<div class="billet bloc">
      <div class="corps">
        <div class="ent"><span>${esc(b.entete || 'Billet · sortie à emporter')}</span><span class="num">${esc(b.numero || '')}</span></div>
        <div class="trajet">
          <div><div class="lab">Départ</div><div class="gare">${esc(b.depart.gare)}<small>${esc(b.depart.detail || '')}</small></div></div>
          <svg class="fleche" viewBox="0 0 56 20"><path d="M2 10H50M41 2l9 8-9 8" fill="none" stroke="${ORANGE}" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
          <div><div class="lab">Arrivée</div><div class="gare">${esc(b.arrivee.gare)}<small>${esc(b.arrivee.detail || '')}</small></div></div>
        </div>
        <div class="champs">${champs}</div>
      </div>
      <div class="talon">
        <div class="ligne"><small>${esc(b.ligne_lab || 'Ligne')}</small>${esc(b.ligne)}</div>
        <div class="valid">${esc(b.validite || '')}</div>
        ${code}
      </div>
    </div>`;
  }

  function chiffres(list) {
    return `<div class="chiffres bloc">${list.map(c => c.filet ? '<div class="filet"></div>' : `<div class="chiffre">
      <div class="etiquette">${esc(c.etiquette)}</div>
      ${c.mot ? `<div class="mot">${esc(c.mot)}</div>` : `<div class="val">${nombre(c.valeur)}</div>`}</div>`).join('')}</div>`;
  }

  function profil(p, D) {
    const h = p.hauteur || 260, w = W - 2 * M;
    const z = D.profil, zmin = Math.min(...z), zmax = Math.max(...z);
    const pts = z.map((v, i) => [i / (z.length - 1) * w, h - (v - zmin) / (zmax - zmin || 1) * h]);
    const area = `M0 ${h}` + pts.map(([x, y]) => `L${x.toFixed(1)} ${y.toFixed(1)}`).join('') + `L${w} ${h}Z`;
    // Annotations : une ligne d'étiquettes au-dessus du profil, reliées au point par un filet
    const ann = (p.annotations || []).map(a => {
      const i = Math.round(a.a * (z.length - 1)); const [x, y] = pts[i]; const g = a.cote === 'gauche';
      return `<g><line x1="${x}" y1="-22" x2="${x}" y2="${y - 14}" stroke="currentColor" stroke-opacity=".35" stroke-width="2"/><circle cx="${x}" cy="${y}" r="7" fill="currentColor"/><text x="${x + (g ? 10 : -10)}" y="-32" text-anchor="${g ? 'end' : 'start'}" font-size="22" font-weight="600" fill="currentColor" fill-opacity=".75" transform="translate(${g ? -10 : 10} 0)">${esc(a.texte)}</text></g>`;
    }).join('');
    const dist = D.fiche && D.fiche.longueur ? D.fiche.longueur.replace(/(\d)km/, '$1 km') : (D.calcule.distance_m / 1000).toFixed(1).replace('.', ',') + ' km';  // chiffre affiché par la fiche
    return `<div class="profil bloc" data-ancre="profil" style="color:var(--fg)">
      <svg viewBox="0 0 ${w} ${h}" height="${h}" data-w="${w}" data-h="${h}"><path d="${area}" fill="currentColor" fill-opacity=".07"/>
        <line x1="0" y1="${h}" x2="${w}" y2="${h}" stroke="currentColor" stroke-opacity=".25" stroke-width="2"/>${ann}</svg>
      <div class="bornes"><span>0 km</span><span>altitude de ${zmin} à ${zmax} m</span><span>${esc(dist)}</span></div>
    </div>`;
  }

  function carte(c, D) {
    const w = c.largeur || (W - 2 * M), h = c.hauteur || 700;
    const s = Math.min(w / D.largeur_m, h / D.hauteur_m);
    const ox = c.aligne === 'droite' ? w - D.largeur_m * s : 0;
    const pos = p => [ox + p.x * s, p.y * s];
    const lbl = (p, nom, sous) => { const [x, y] = pos(p); const dx = p.dx ?? 18, dy = p.dy ?? -14;
      const tr = p.align === 'droite' ? 'translate(-100%,0)' : ''; return `<div class="lbl" style="left:${(x + dx).toFixed(0)}px;top:${(y + dy).toFixed(0)}px;transform:${tr};${p.align === 'droite' ? 'text-align:right' : ''}">${esc(nom)}${sous ? `<small>${esc(sous)}</small>` : ''}</div>`; };
    const pois = (c.pois || []).map(p => { const d = D.pois.find(q => q.nom === p.ref); if (!d) throw new Error(`point d'intérêt absent des données : ${p.ref}`); return lbl({ ...d, ...p }, p.nom, p.sous); }).join('');
    const g = c.gare ? lbl({ x: D.trace[0][0], y: D.trace[0][1], ...c.gare }, c.gare.nom, c.gare.sous) : '';
    const km = 1000 * s;
    return `<div class="carte bloc" data-ancre="carte" data-s="${s}" data-ox="${ox}" style="height:${Math.max(D.hauteur_m * s, 60) + 60}px">
      ${g}${pois}
      <div class="echelle num"><i style="width:${km.toFixed(0)}px"></i>1 km</div>
      <div class="nord"><svg width="22" height="30" viewBox="0 0 22 30"><path d="M11 2 20 28 11 21 2 28Z" fill="currentColor"/></svg><br>N</div>
    </div>`;
  }

  function etapes(list) {
    return `<div class="etapes bloc" data-ancre="etapes">${list.map(e => `<div class="etape"><div class="rang">${esc(e.rang || '')}</div><h3>${md(e.nom)}</h3>${e.texte ? `<p>${md(e.texte)}</p>` : ''}</div>`).join('')}</div>`;
  }

  function chat(c) {
    return `<div class="chat bloc">${c.entete ? `<div class="entete">${esc(c.entete)}</div>` : ''}${c.bulles.map(b => `<div class="bulle ${b.qui === 'moi' ? 'moi' : 'eux'}">${esc(b.texte)}</div>`).join('')}</div>`;
  }

  function tableau(t) {
    const rangs = t.lignes.map(l => `<div class="rang">
      <div class="h">${esc(l.heure)}<small>${esc(l.jour)}</small></div>
      <div class="dest" data-fit="2">${insecable(l.dest)}${l.lieu ? `<small>${esc(l.lieu)}</small>` : ''}</div>
      <div class="cote">${esc(l.niveau || '')}${l.prix ? `<small>${esc(l.prix)}</small>` : ''}</div></div>`).join('');
    return `<div class="tableau bloc ${t.compact ? 'compact' : ''}">
      <div class="tete"><span class="t">${md(t.titre || 'Départs')}</span><span class="d">${esc(t.date || '')}</span></div>
      <div class="cols"><span>Départ</span><span>Destination</span><span>Niveau</span></div>
      ${rangs}
      ${t.pied ? `<div class="pied">${esc(t.pied)}</div>` : ''}
    </div>`;
  }

  function palettes(list) {
    return `<div class="palettes bloc">${list.map(p => `<div class="palette"><div class="h"><small>${esc(p.jour)}</small>${esc(p.heure)}</div><div class="v">${esc(p.v)}</div></div>`).join('')}</div>`;
  }

  function bloc(b, D) {
    const cls = b.classe ? ' ' + b.classe : '';
    if (b.titre != null) return `<h1 class="titre ${b.taille || 'l'} bloc${cls}">${md(b.titre)}</h1>`;
    if (b.texte != null) return `<p class="texte bloc${cls}">${md(b.texte)}</p>`;
    if (b.note != null) return `<p class="note bloc${cls}">${md(b.note)}</p>`;
    if (b.source != null) return `<p class="source bloc${cls}">${md(b.source)}</p>`;
    if (b.etiquette != null) return `<div class="etiquette bloc${cls}">${md(b.etiquette)}</div>`;
    if (b.billet) return billet(b.billet);
    if (b.chiffres) return chiffres(b.chiffres);
    if (b.profil) return profil(b.profil, D);
    if (b.carte) return carte(b.carte, D);
    if (b.etapes) return etapes(b.etapes);
    if (b.chat) return chat(b.chat);
    if (b.tableau) return tableau(b.tableau);
    if (b.palettes) return palettes(b.palettes);
    if (b.espace != null) return `<div style="height:${+b.espace}px;flex:none"></div>`;
    throw new Error('bloc inconnu : ' + JSON.stringify(b).slice(0, 80));
  }

  // ---------- Ancres du tracé (calculées après mise en page) ----------
  function ancre(nom, root, D) {
    const el = root.querySelector(`[data-ancre="${nom}"]`);
    if (!el) throw new Error(`ancre « ${nom} » : aucun bloc ${nom} sur cette slide`);
    const r = el.getBoundingClientRect();
    if (nom === 'carte') { const s = +el.dataset.s, ox = +el.dataset.ox; return D.trace.map(([x, y]) => [r.left + ox + x * s, r.top + y * s]); }
    if (nom === 'profil') { const svg = el.querySelector('svg').getBoundingClientRect(); const z = D.profil, zmin = Math.min(...z), zmax = Math.max(...z);
      return z.map((v, i) => [svg.left + i / (z.length - 1) * svg.width, svg.top + svg.height - (v - zmin) / (zmax - zmin || 1) * svg.height]); }
    if (nom === 'etapes') { return [...el.querySelectorAll('.etape')].map(e => { const h = e.querySelector('h3').getBoundingClientRect(); return [r.left + 34, h.top + h.height / 2, 0]; }); }
    throw new Error('ancre inconnue : ' + nom);
  }

  function build(cfg) {
    const C = cfg.carrousel, k = cfg.index, S = C.slides[k], n = C.slides.length, D = cfg.donnees || {};
    const derniere = k === n - 1;
    const photo = cfg.photo;            // URL résolue par render.js, ou null (fichier absent → aplat Forêt)
    const fond = photo ? 'photo' : (S.fond || 'foret');
    const haut = S.haut || [], bas = S.bas || [];
    const logo = S.logo ?? ((k === 0 || derniere) && C.logo !== false);
    const root = document.createElement('div');
    root.className = `slide ${fond}`;
    root.innerHTML = `
      ${photo ? `<img class="photo-img" src="${esc(photo)}">${bas.length ? '<div class="degrade bas"></div>' : ''}${haut.length ? '<div class="degrade haut"></div>' : ''}` : ''}
      <svg class="couche courbes" viewBox="0 0 ${W} ${H}"></svg>
      <svg class="couche trace" viewBox="0 0 ${W} ${H}"></svg>
      <div class="bandeau"><span>${esc(S.rubrique ?? C.rubrique ?? '')}</span><span class="page">${S.page ? esc(S.page).replace(/^(\d+)/, '<b>$1</b>') : `<b>${k + 1}</b>/${n}`}</span></div>
      ${haut.length ? `<div class="zone haut" style="${S.haut_top ? `top:${S.haut_top}px` : ''}">${haut.map(b => bloc(b, D)).join('')}</div>` : ''}
      ${bas.length ? `<div class="zone bas ${logo ? 'avec-logo' : ''}" style="${S.bas_bas ? `bottom:${S.bas_bas}px` : ''}">${bas.map(b => bloc(b, D)).join('')}</div>` : ''}
      ${(S.libre || []).map(b => `<div class="libre" style="left:${+b.x}px;top:${+b.y}px;${b.largeur ? `width:${+b.largeur}px` : ''}">${bloc(b, D)}</div>`).join('')}
      ${logo ? `<div class="logo"><img src="${LOGO}" alt="">Fitmates</div>${S.logo_droite ? `<div class="logo-droite">${esc(S.logo_droite)}</div>` : ''}` : ''}`;
    document.body.appendChild(root);
    return document.fonts.ready.then(() => Promise.all([...root.querySelectorAll('img')].map(i => i.complete ? 0 : new Promise(r => { i.onload = i.onerror = r; })))).then(() => {
      // Ajustement des titres du tableau : on réduit jusqu'à tenir sur N lignes (le contrôle échoue sinon)
      for (const el of root.querySelectorAll('[data-fit]')) {
        const max = +el.dataset.fit; let fs = parseFloat(getComputedStyle(el).fontSize);
        const lignes = () => { const sm = el.querySelector('small'); const h = el.getBoundingClientRect().height - (sm ? sm.getBoundingClientRect().height + parseFloat(getComputedStyle(sm).marginTop) : 0); return Math.round(h / (fs * 1.04)); };
        while (lignes() > max && fs > 28) { fs -= 2; el.style.fontSize = fs + 'px'; }
        if (lignes() > max) el.dataset.trop = '1';
      }
      // Courbes de niveau (pas sur une vraie photo)
      if (!photo && S.courbes !== false) {
        const f = champ(hash(C.id || 'fitmates'), n);
        const op = S.courbes_opacite ?? { foret: .22, papier: .5, encre: .14 }[fond] ?? .2;
        const lv = []; for (let l = -2.4; l <= 2.4; l += .12) lv.push(+l.toFixed(2));
        root.querySelector('.courbes').innerHTML = `<path d="${courbes(f, k * W, 9, lv)}" fill="none" stroke="${MOUSSE}" stroke-opacity="${op}" stroke-width="1.6" stroke-linecap="round"/>`;
      }
      // Tracé orange
      const prev = k > 0 && !C.independantes ? C.slides[k - 1].trace : null;
      const T = S.trace;
      const info = { entree: null, sortie: null };
      if (T) {
        const R = T.rayon || 90, pts = [], gares = [];
        for (const p of T.points || []) {
          if (typeof p === 'string') { const a = ancre(p, root, D); if (p === 'etapes') gares.push(...a); if (p === 'carte') gares.push(a[0]); pts.push(...a); }
          else pts.push(p.slice());
        }
        const entree = cfg.entree != null ? cfg.entree : (prev && typeof prev.sortie === 'number' ? prev.sortie : null);
        if (entree != null) { const e = Math.min(100, pts.length ? pts[0][0] : 100); pts.unshift([-240, entree], [e, entree, e]); info.entree = entree; }
        if (T.sortie != null) { const last = pts[pts.length - 1] || [980, 0]; const y = T.sortie === 'auto' ? last[1] : T.sortie; const x = Math.min(1060, Math.max(980, last[0])); pts.push([x, y, W - x], [W + 240, y]); info.sortie = Math.round(y * 10) / 10; }
        let svg = `<path d="${arrondi(pts, R)}" fill="none" stroke="${ORANGE}" stroke-width="${T.epaisseur || 7}" stroke-linecap="round" stroke-linejoin="round"/>`;
        const bg = { foret: FORET, papier: PAPIER, encre: ENCRE, photo: ENCRE }[fond];
        const rond = ([x, y], r = 13) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${bg}" stroke="${ORANGE}" stroke-width="6"/>`;
        if (entree == null && pts.length) svg += rond(pts[0], 15);
        if (T.sortie == null && pts.length) svg += rond(pts[pts.length - 1], 15);
        for (const g of gares) svg += rond(g);
        for (const p of T.reperes || []) svg += rond(p);
        root.querySelector('.trace').innerHTML = svg;
      }
      window.__TRACE__ = info;
      document.body.dataset.ready = '1';
    }).catch(e => { window.__ERREUR__ = String(e && e.stack || e); document.body.dataset.ready = '1'; });
  }

  function lancer(cfg) {
    try { return build(cfg); }
    catch (e) { window.__ERREUR__ = String(e && e.stack || e); document.body.dataset.ready = '1'; }
  }
  window.FM = { build: lancer };
  if (window.__CFG__) lancer(window.__CFG__);
})();
