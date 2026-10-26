// Posts Instagram Fitmates : mise en page commune (1080x1350).
// Pictos, illustrations et barre d'état repris des captures ASO (canaux/aso/visuels/fr-FR/sources/common.js) ;
// pas de photo, pas de visage, pas de nom.

const LOGO = '../../../aso/visuels/fr-FR/sources/assets/logo.png';

const ICONS = {
  person: '<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="8" r="4.2"/><path d="M3.8 21c.6-4.4 4-7 8.2-7s7.6 2.6 8.2 7z"/></svg>',
  chat: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M4 12a8 8 0 1 1 3.4 6.5L4 20l1.2-3.6A8 8 0 0 1 4 12z"/></svg>',
  send: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M21 3 3 10.5l7 2.5 2.5 7z"/><path d="m10 13 11-10"/></svg>',
  pin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M12 21s-6.5-6.2-6.5-11a6.5 6.5 0 0 1 13 0C18.5 14.8 12 21 12 21z"/><circle cx="12" cy="10" r="2.4"/></svg>',
  cal: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><rect x="3.5" y="5" width="17" height="15.5" rx="3"/><path d="M3.5 10h17M8 3v4M16 3v4"/></svg>',
  back: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M15 5l-7 7 7 7"/></svg>',
  check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>',
  spark: '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M12 2l1.9 5.6L19.5 9.5l-5.6 1.9L12 17l-1.9-5.6L4.5 9.5l5.6-1.9zM19 15l.9 2.6 2.6.9-2.6.9L19 22l-.9-2.6-2.6-.9 2.6-.9z"/></svg>',
  users: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.6-3.6 3.2-5.5 6.5-5.5s5.9 1.9 6.5 5.5"/><circle cx="17" cy="9" r="2.8"/><path d="M17 14.5c2.6 0 4.2 1.6 4.6 4.5"/></svg>',
  train: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><rect x="5" y="3" width="14" height="14" rx="3"/><path d="M5 11h14M8 21l2-4M16 21l-2-4"/></svg>',
  phone: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><rect x="6" y="2.5" width="12" height="19" rx="3"/><path d="M10.5 18.5h3"/></svg>',
  globe: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.6 2.8 3.8 5.8 3.8 9s-1.2 6.2-3.8 9c-2.6-2.8-3.8-5.8-3.8-9S9.4 5.8 12 3z"/></svg>',
  euro: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M17.5 6.5A7 7 0 1 0 17.5 17.5M4.5 10.5h9M4.5 13.5h9"/></svg>',
  gauge: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M4 18a8 8 0 1 1 16 0"/><path d="m12 18 4-6"/></svg>',
};

const AV_COLORS = ['#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6', '#ef4444', '#64748b'];
function avatar(i, size) {
  const s = size || 40;
  return `<div class="av" style="width:${s}px;height:${s}px;background:${AV_COLORS[i % AV_COLORS.length]}">${ICONS.person}</div>`;
}

// Illustrations vectorielles (aucune photo).
function scene(kind) {
  const S = {
    hike: `<svg viewBox="0 0 400 220" preserveAspectRatio="xMidYMid slice">
      <rect width="400" height="220" fill="#ffe7c7"/><circle cx="300" cy="70" r="30" fill="#ffb15e"/>
      <path d="M0 130 Q80 80 160 115 T320 100 T400 110 V220 H0z" fill="#9cc58f"/>
      <path d="M0 160 Q90 120 200 150 T400 140 V220 H0z" fill="#6aa66b"/>
      <path d="M0 190 Q120 160 230 185 T400 175 V220 H0z" fill="#3f7f4f"/>
      <path d="M170 220 C190 200 215 195 205 180 S235 160 250 150" stroke="#e9d3a8" stroke-width="9" fill="none" stroke-linecap="round"/></svg>`,
    forest: `<svg viewBox="0 0 400 220" preserveAspectRatio="xMidYMid slice">
      <rect width="400" height="220" fill="#e6f2df"/><circle cx="90" cy="60" r="26" fill="#ffd08a"/>
      ${Array.from({ length: 11 }, (_, i) => { const x = i * 38 - 10, h = 90 + (i * 37) % 60; return `<path d="M${x} 200 l22 -${h} l22 ${h}z" fill="${i % 2 ? '#4c8a5a' : '#36704a'}"/>`; }).join('')}
      <path d="M0 195 Q200 175 400 195 V220 H0z" fill="#2d5e3d"/></svg>`,
    autumn: `<svg viewBox="0 0 400 220" preserveAspectRatio="xMidYMid slice">
      <rect width="400" height="220" fill="#fde3c4"/>
      ${Array.from({ length: 9 }, (_, i) => { const x = i * 48 - 10, r = 34 + (i * 13) % 18, c = ['#d9480f', '#f59f00', '#c2410c', '#e8590c'][i % 4]; return `<rect x="${x + 22}" y="120" width="8" height="90" fill="#6b4226"/><circle cx="${x + 26}" cy="${118 - (i % 3) * 8}" r="${r}" fill="${c}"/>`; }).join('')}
      <path d="M0 195 Q200 178 400 195 V220 H0z" fill="#9a5b2c"/></svg>`,
    rocks: `<svg viewBox="0 0 400 220" preserveAspectRatio="xMidYMid slice">
      <rect width="400" height="220" fill="#e0f0ff"/>
      ${[20, 90, 300, 360].map((x, i) => `<path d="M${x} 170 l26 -${90 + i * 12} l26 ${90 + i * 12}z" fill="${i % 2 ? '#3f7f4f' : '#2f6b3f'}"/>`).join('')}
      <path d="M0 175 Q200 160 400 175 V220 H0z" fill="#e8d4a8"/>
      <path d="M90 200 Q100 120 170 112 Q230 108 250 150 Q262 190 240 205z" fill="#b9a68a"/>
      <path d="M220 205 Q235 150 290 146 Q340 150 345 205z" fill="#a8957a"/>
      <path d="M40 210 Q55 170 95 172 Q125 178 120 212z" fill="#c4b294"/></svg>`,
  };
  return S[kind] || S.hike;
}

const STATUS = `<div class="island"></div><div class="status"><span>9:41</span><span class="icons">
  <svg viewBox="0 0 18 12"><rect x="0" y="8" width="3" height="4" rx="1"/><rect x="5" y="5" width="3" height="7" rx="1"/><rect x="10" y="2.5" width="3" height="9.5" rx="1"/><rect x="15" y="0" width="3" height="12" rx="1"/></svg>
  <svg viewBox="0 0 16 12"><path d="M8 11.5 5.6 9a3.4 3.4 0 0 1 4.8 0zM3.4 6.8a6.6 6.6 0 0 1 9.2 0l-1.4 1.4a4.6 4.6 0 0 0-6.4 0zM1 4.4a10 10 0 0 1 14 0l-1.4 1.4a8 8 0 0 0-11.2 0z"/></svg>
  <svg viewBox="0 0 27 13"><rect x=".5" y=".5" width="23" height="12" rx="3.5" fill="none" stroke="currentColor" opacity=".4"/><rect x="2" y="2" width="19" height="9" rx="2"/><rect x="24.5" y="4.5" width="2" height="4" rx="1" opacity=".4"/></svg>
</span></div>`;

function esc(s) { return String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }

function hydrate(root) {
  root.querySelectorAll('[data-scene]').forEach(el => { el.innerHTML = scene(el.dataset.scene); });
  root.querySelectorAll('[data-av]').forEach(el => {
    const extra = el.getAttribute('style') || '';
    el.outerHTML = avatar(+el.dataset.av, +el.dataset.size || 40).replace('style="', `style="${extra};`);
  });
  root.querySelectorAll('[data-icon]').forEach(el => { el.innerHTML = ICONS[el.dataset.icon]; });
}

// Typographie française : espace insécable avant ? ! : ; » et après «, pour qu'aucun signe ne parte seul à la ligne.
function nbsp(root) {
  const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  for (let n; (n = w.nextNode());) {
    if (n.parentElement.closest('script, style')) continue;
    n.nodeValue = n.nodeValue.replace(/ ([?!:;»])/g, ' $1').replace(/« /g, '« ');
  }
}

function layout() {
  const post = document.querySelector('.post');
  if (typeof window.build === 'function') window.build(post);   // gabarits alimentés par des données (semaine.html)
  post.insertAdjacentHTML('afterbegin', `<div class="brand"><img src="${LOGO}" alt=""><b>Fitmates</b><span>Stronger Together</span></div>`);
  hydrate(document);
  nbsp(post);
  const scr = document.querySelector('.screen');
  if (scr) scr.insertAdjacentHTML('afterbegin', STATUS);
  const imgs = [...document.images].map(i => i.complete ? null : new Promise(r => { i.onload = i.onerror = r; }));
  Promise.all(imgs).then(() => { document.body.dataset.ready = '1'; });
}
document.fonts.ready.then(layout);
