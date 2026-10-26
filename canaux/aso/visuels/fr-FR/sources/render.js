// Génère les PNG des captures ASO depuis les sources HTML.
// Usage : node render.js            (depuis n'importe quel dossier, Playwright préinstallé)
const path = require('path');
const fs = require('fs');
const { chromium } = require('playwright');

const SRC = __dirname;
const OUT = path.resolve(SRC, '..');
const VISUELS = [
  '01-randos-groupe',
  '02-rejoindre-un-clic',
  '03-chat-de-groupe',
  '04-creer-en-une-phrase',
  '05-partenaires-niveau',
  '06-tous-les-sports',
];
const FORMATS = [
  { dir: 'app-store-6.9', w: 1320, h: 2868 },
  { dir: 'google-play-telephone', w: 1080, h: 1920 },
];

(async () => {
  const only = process.argv.slice(2);
  const browser = await chromium.launch();
  const shoot = async (file, w, h, out, query) => {
    const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
    await page.goto('file://' + path.join(SRC, file) + '?' + query);
    await page.waitForSelector('body[data-ready="1"]');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(300);
    fs.mkdirSync(path.dirname(out), { recursive: true });
    await page.screenshot({ path: out, clip: { x: 0, y: 0, width: w, height: h } });
    await page.close();
    console.log('ok', path.relative(OUT, out));
  };
  for (const v of VISUELS) {
    if (only.length && !only.some(o => v.startsWith(o))) continue;
    for (const f of FORMATS) await shoot(v + '.html', f.w, f.h, path.join(OUT, f.dir, v + '.png'), `w=${f.w}&h=${f.h}`);
  }
  if (!only.length || only.includes('presentation'))
    await shoot('presentation-google-play.html', 1024, 500, path.join(OUT, 'google-play-presentation-1024x500.png'), '');
  await browser.close();
})();
