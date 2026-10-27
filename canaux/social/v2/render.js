// Fitmates · Instagram v2 : carrousel JSON → PNG 1080×1350 numérotés (01.png, 02.png…).
//
//   node canaux/social/v2/render.js canaux/social/v2/prototype-chevreuse.json
//   node canaux/social/v2/render.js carrousel.json --out /tmp/sortie --apercu /tmp/apercu.png
//   node canaux/social/v2/render.js --grille sortie.png a.png b.png … (9 PNG : simulation de la grille du profil)
//
// Le rendu ÉCHOUE (code 1) si : un texte déborde (mot trop long, titre du tableau sur plus de lignes que prévu,
// texte coupé), un bloc sort des marges de 72 px, les zones haut et bas se chevauchent, le tracé orange s'arrête
// au bord d'une slide sans repartir sur la suivante, ou l'orange dépasse 10 % de la surface (charte § 5).
const path = require('path');
const fs = require('fs');
const { chromium } = require('playwright');

const W = 1080, H = 1350, M = 72;
const GABARIT = path.join(__dirname, 'gabarits', 'slide.html');
const ORANGE_MAX = 0.10;

async function verifier(page) {
  return page.evaluate(({ W, H, M }) => {
    const errs = [];
    if (window.__ERREUR__) return ['erreur JS : ' + window.__ERREUR__];
    const nom = el => `<${el.tagName.toLowerCase()}${el.className && typeof el.className === 'string' ? ' class="' + el.className + '"' : ''}> « ${(el.textContent || '').trim().slice(0, 40)} »`;
    for (const el of document.querySelectorAll('[data-trop]')) errs.push('texte trop long pour sa place : ' + nom(el));
    for (const el of document.querySelectorAll('.zone *, .libre *, .bandeau *, .logo, .logo-droite')) {
      if (el.closest('svg')) continue;
      const r = el.getBoundingClientRect();
      if (!r.width || !r.height) continue;
      if (r.left < M - 1 || r.right > W - M + 1 || r.top < 0 || r.bottom > H - 40)
        errs.push(`hors marges : ${nom(el)} (${Math.round(r.left)},${Math.round(r.top)} → ${Math.round(r.right)},${Math.round(r.bottom)})`);
      const cs = getComputedStyle(el);
      if (cs.display !== 'inline' && el.clientWidth && el.scrollWidth > el.clientWidth + 2) errs.push('texte qui déborde en largeur : ' + nom(el));
      if (cs.display !== 'inline' && cs.overflow === 'hidden' && el.scrollHeight > el.clientHeight + 2) errs.push('texte coupé en hauteur : ' + nom(el));
    }
    const zh = document.querySelector('.zone.haut'), zb = document.querySelector('.zone.bas');
    if (zh && zb && zh.getBoundingClientRect().bottom > zb.getBoundingClientRect().top - 24)
      errs.push(`les zones haut et bas se chevauchent (haut jusqu'à ${Math.round(zh.getBoundingClientRect().bottom)}, bas dès ${Math.round(zb.getBoundingClientRect().top)})`);
    if (zh && zh.getBoundingClientRect().bottom > H - M) errs.push('la zone haut dépasse le bas de la slide');
    const lbls = [...document.querySelectorAll('.carte .lbl')].map(e => [e, e.getBoundingClientRect()]);
    for (let i = 0; i < lbls.length; i++) for (let j = i + 1; j < lbls.length; j++) {
      const [a, ra] = lbls[i], [b, rb] = lbls[j];
      if (ra.left < rb.right && rb.left < ra.right && ra.top < rb.bottom && rb.top < ra.bottom) errs.push(`étiquettes de carte superposées : ${nom(a)} / ${nom(b)}`);
    }
    return errs;
  }, { W, H, M });
}

async function partOrange(browser, png) {
  const page = await browser.newPage();
  const r = await page.evaluate(async (src) => {
    const img = new Image(); img.src = src; await img.decode();
    const c = document.createElement('canvas'); c.width = img.width; c.height = img.height;
    const g = c.getContext('2d'); g.drawImage(img, 0, 0);
    const d = g.getImageData(0, 0, c.width, c.height).data; let n = 0;
    const est = i => { const R = d[i], G = d[i + 1], B = d[i + 2]; return R > 200 && G > 80 && G < 170 && B < 90 && R - G > 70; };
    for (let i = 0; i < d.length; i += 4) if (est(i)) n++;
    // Où le tracé touche les bords gauche et droit (milieu des pixels orange de la colonne)
    const bord = x => { const ys = []; for (let y = 0; y < c.height; y++) if (est((y * c.width + x) * 4)) ys.push(y); return ys.length ? (ys[0] + ys[ys.length - 1]) / 2 : null; };
    return { part: n / (c.width * c.height), gauche: bord(0), droite: bord(c.width - 1) };
  }, 'data:image/png;base64,' + png.toString('base64'));
  await page.close();
  return r;
}

async function rendre(browser, cfgPath, outDir) {
  const base = path.dirname(path.resolve(cfgPath));
  const C = JSON.parse(fs.readFileSync(cfgPath, 'utf8'));
  const donnees = C.donnees ? JSON.parse(fs.readFileSync(path.resolve(base, C.donnees), 'utf8')) : null;
  const out = path.resolve(outDir || path.resolve(base, C.sortie || 'sortie/' + C.id));
  fs.mkdirSync(out, { recursive: true });
  let ok = true; const fichiers = [], traces = [], bords = [];
  for (let k = 0; k < C.slides.length; k++) {
    const S = C.slides[k];
    let photo = null;
    if (S.photo) {
      const p = path.resolve(base, S.photo);
      if (fs.existsSync(p)) photo = 'file://' + p;
      else console.warn(`slide ${k + 1} : photo absente (${S.photo}) → aplat Forêt et courbes de niveau`);
    }
    const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
    const entree = !C.independantes && k > 0 && C.slides[k - 1].trace && C.slides[k - 1].trace.sortie != null ? traces[k - 1].sortie : null;
    await page.addInitScript(cfg => { window.__CFG__ = cfg; }, { carrousel: C, index: k, donnees, photo, entree });
    await page.goto('file://' + GABARIT);
    await page.waitForSelector('body[data-ready="1"]', { timeout: 20000, state: 'attached' });
    await page.waitForTimeout(150);
    const errs = await verifier(page);
    traces.push(await page.evaluate(() => window.__TRACE__ || {}));
    const file = path.join(out, String(k + 1).padStart(2, '0') + '.png');
    const png = await page.screenshot({ path: file, clip: { x: 0, y: 0, width: W, height: H } });
    await page.close();
    const po = await partOrange(browser, png), o = po.part;
    bords.push(po);
    if (o > ORANGE_MAX) errs.push(`orange sur ${(o * 100).toFixed(1)} % de la surface (max ${ORANGE_MAX * 100} %)`);
    if (errs.length) { ok = false; console.error(`ERREUR ${C.id} slide ${k + 1}\n  ` + errs.join('\n  ')); }
    else console.log(`ok ${file}  (orange ${(o * 100).toFixed(1)} %)`);
    fichiers.push(file);
  }
  // Continuité du tracé : ce qui sort par la droite d'une slide rentre par la gauche de la suivante, au même niveau
  for (let k = 0; k < traces.length - 1 && !C.independantes; k++) {
    if (traces[k].sortie != null && traces[k + 1].entree !== traces[k].sortie) {
      ok = false; console.error(`ERREUR tracé : sort de la slide ${k + 1} à y=${traces[k].sortie} mais ne rentre pas sur la slide ${k + 2}`);
    }
    // Contrôle sur les pixels rendus : même hauteur des deux côtés de la jointure (à 2 px près)
    const a = bords[k].droite, b = bords[k + 1].gauche;
    if (traces[k].sortie != null && (a == null || b == null || Math.abs(a - b) > 2)) {
      ok = false; console.error(`ERREUR tracé : jointure ${k + 1}→${k + 2} décalée (bord droit y=${a}, bord gauche suivant y=${b})`);
    }
  }
  return { ok, fichiers, C };
}

async function planche(browser, imgs, out, { cols, cellW, cellH, gap, crop, fond, legende }) {
  const rows = Math.ceil(imgs.length / cols);
  const pad = 48, top = legende ? 96 : pad;
  const w = pad * 2 + cols * cellW + (cols - 1) * gap, h = top + pad + rows * cellH + (rows - 1) * gap;
  const page = await browser.newPage({ viewport: { width: w, height: h } });
  const cells = imgs.map(f => `<div style="width:${cellW}px;height:${cellH}px;overflow:hidden;position:relative">
    <img src="data:image/png;base64,${fs.readFileSync(f).toString('base64')}" style="position:absolute;height:${cellH}px;left:50%;transform:translateX(-50%)"></div>`).join('');
  await page.setContent(`<body style="margin:0;background:${fond};font:600 22px/1 sans-serif;color:#8a8378">
    ${legende ? `<div style="position:absolute;left:${pad}px;top:40px;letter-spacing:.08em;text-transform:uppercase">${legende}</div>` : ''}
    <div style="position:absolute;left:${pad}px;top:${top}px;display:grid;grid-template-columns:repeat(${cols},${cellW}px);gap:${gap}px">${cells}</div></body>`);
  await page.waitForTimeout(300);
  await page.screenshot({ path: out });
  await page.close();
  console.log('planche', out);
}

(async () => {
  const args = process.argv.slice(2);
  const browser = await chromium.launch();
  let ok = true;
  try {
    if (args[0] === '--grille') {
      const [, out, ...imgs] = args;
      if (!out || imgs.length !== 9) throw new Error('usage : render.js --grille sortie.png 9 × fichier.png');
      // Le profil Instagram affiche des vignettes 3:4 recadrées au centre des posts 4:5
      await planche(browser, imgs, path.resolve(out), { cols: 3, cellW: 360, cellH: 480, gap: 4, fond: '#ffffff', legende: 'Simulation de la grille du profil · vignettes 3:4' });
    } else {
      const cfg = args[0];
      if (!cfg) throw new Error('usage : render.js carrousel.json [--out DIR] [--apercu planche.png]');
      const opt = k => { const i = args.indexOf(k); return i > 0 ? args[i + 1] : null; };
      const r = await rendre(browser, cfg, opt('--out'));
      ok = r.ok;
      if (opt('--apercu')) await planche(browser, r.fichiers, path.resolve(opt('--apercu')), { cols: r.fichiers.length, cellW: 432, cellH: 540, gap: 0, fond: '#0f0d0b', legende: `${r.C.titre || r.C.id} · ${r.fichiers.length} slides bord à bord (continuité du tracé)` });
    }
  } finally {
    await browser.close();
  }
  process.exit(ok ? 0 : 1);
})();
