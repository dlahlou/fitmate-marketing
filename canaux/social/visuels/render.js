// Génère les PNG Instagram (1080x1350) depuis les sources HTML de sources/.
// Usage (Playwright préinstallé, depuis n'importe quel dossier) :
//   node canaux/social/visuels/render.js                      tous les posts du lot de lancement → lancement/*.png
//   node canaux/social/visuels/render.js 03 07                seulement les posts qui commencent par 03 et 07
//   node canaux/social/visuels/render.js --lot novembre [03 07]
//                                                             lot de novembre (sources/nov-NN-*.html) → novembre/NN-*.png
//   node canaux/social/visuels/render.js --semaine data.json out.png
//                                                             visuel « Sorties de la semaine » (appelé par scripts/social_weekly.py)
// Contrôle à chaque rendu : un bloc qui sort du cadre ou qui chevauche le titre fait échouer le rendu.
const path = require('path');
const fs = require('fs');
const { chromium } = require('playwright');

const SRC = path.join(__dirname, 'sources');
// Un lot = un préfixe de sources et un dossier de sortie (le préfixe est retiré du nom du PNG)
const LOTS = {
  lancement: { prefix: '', out: 'lancement' },
  novembre: { prefix: 'nov-', out: 'novembre' },
};
const W = 1080, H = 1350;

async function check(page) {
  return page.evaluate(() => {
    const errs = [];
    const post = document.querySelector('.post').getBoundingClientRect();
    const head = document.querySelector('.head').getBoundingClientRect();
    // Le téléphone et l'illustration pleine largeur sont volontairement recadrés par le bas
    const all = [...document.querySelectorAll('.post *')].filter(el => !el.closest('.phone') && !el.closest('.forest') && !el.closest('svg'));
    for (const el of all) {
      const r = el.getBoundingClientRect();
      if (!r.width || !r.height) continue;
      if (r.left < post.left - 1 || r.right > post.right + 1 || r.bottom > post.bottom + 1)
        errs.push(`hors cadre : <${el.tagName.toLowerCase()} class="${el.className}"> (${Math.round(r.left)},${Math.round(r.top)} → ${Math.round(r.right)},${Math.round(r.bottom)})`);
      if (el.scrollWidth > el.clientWidth + 1 && getComputedStyle(el).overflow === 'hidden' && getComputedStyle(el).textOverflow !== 'ellipsis' && !el.classList.contains('canvas'))
        errs.push(`texte coupé : <${el.tagName.toLowerCase()} class="${el.className}">`);
    }
    // Rien ne doit passer sous le titre (on compare les blocs principaux placés en absolu)
    for (const el of document.querySelectorAll('.zone, .map, .grp, .phone, .chips2')) {
      const r = el.getBoundingClientRect();
      if (r.top < head.bottom + 16) errs.push(`chevauche le titre : .${el.className.split(' ')[0]} (titre jusqu'à ${Math.round(head.bottom)}, bloc dès ${Math.round(r.top)})`);
    }
    return errs;
  });
}

async function shoot(browser, file, out, data) {
  const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
  if (data) await page.addInitScript(d => { window.__SEMAINE__ = d; }, data);
  await page.goto('file://' + path.join(SRC, file));
  await page.waitForSelector('body[data-ready="1"]', { timeout: 15000 });
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(200);
  const errs = await check(page);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  await page.screenshot({ path: out, clip: { x: 0, y: 0, width: W, height: H } });
  await page.close();
  if (errs.length) { console.error(`ERREUR ${file}\n  ` + errs.join('\n  ')); return false; }
  console.log('ok', out);
  return true;
}

(async () => {
  let args = process.argv.slice(2);
  let lot = LOTS.lancement;
  if (args[0] === '--lot') {
    lot = LOTS[args[1]];
    if (!lot) throw new Error(`lot inconnu : ${args[1]} (${Object.keys(LOTS).join(', ')})`);
    args = args.slice(2);
  }
  const browser = await chromium.launch();
  let ok = true;
  try {
    if (args[0] === '--semaine') {
      const [, dataFile, out] = args;
      if (!dataFile || !out) throw new Error('usage : render.js --semaine data.json out.png');
      ok = await shoot(browser, 'semaine.html', path.resolve(out), JSON.parse(fs.readFileSync(dataFile, 'utf8')));
    } else {
      const posts = fs.readdirSync(SRC).filter(f => f.startsWith(lot.prefix) && /^\d\d-.*\.html$/.test(f.slice(lot.prefix.length))).sort();
      for (const f of posts) {
        const name = f.slice(lot.prefix.length);
        if (args.length && !args.some(a => name.startsWith(a))) continue;
        ok = (await shoot(browser, f, path.join(__dirname, lot.out, name.replace(/\.html$/, '.png')))) && ok;
      }
    }
  } finally {
    await browser.close();
  }
  process.exit(ok ? 0 : 1);
})();
