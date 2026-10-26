// Captures ASO Fitmates : mise en page commune.
// Paramètres d'URL : ?w=1320&h=2868 (taille du PNG) ; ?screen=1 (écran de l'app seul, 393x852, pour l'image de présentation).

const ICONS = {
  person: '<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="8" r="4.2"/><path d="M3.8 21c.6-4.4 4-7 8.2-7s7.6 2.6 8.2 7z"/></svg>',
  heart: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20s-7.5-4.6-7.5-10A4.3 4.3 0 0 1 12 7.4 4.3 4.3 0 0 1 19.5 10c0 5.4-7.5 10-7.5 10z"/></svg>',
  chat: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 12a8 8 0 1 1 3.4 6.5L4 20l1.2-3.6A8 8 0 0 1 4 12z"/></svg>',
  send: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M21 3 3 10.5l7 2.5 2.5 7z"/><path d="m10 13 11-10"/></svg>',
  pin: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M12 21s-6.5-6.2-6.5-11a6.5 6.5 0 0 1 13 0C18.5 14.8 12 21 12 21z"/><circle cx="12" cy="10" r="2.4"/></svg>',
  cal: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2"><rect x="3.5" y="5" width="17" height="15.5" rx="3"/><path d="M3.5 10h17M8 3v4M16 3v4"/></svg>',
  back: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M15 5l-7 7 7 7"/></svg>',
  check: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>',
  spark: '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M12 2l1.9 5.6L19.5 9.5l-5.6 1.9L12 17l-1.9-5.6L4.5 9.5l5.6-1.9zM19 15l.9 2.6 2.6.9-2.6.9L19 22l-.9-2.6-2.6-.9 2.6-.9z"/></svg>',
  home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 11 12 4l8 7v9H4z"/></svg>',
  search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="6.5"/><path d="m16 16 4.5 4.5"/></svg>',
  plus: '<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
  bubble: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 12a8 8 0 1 1 3.4 6.5L4 20l1.2-3.6A8 8 0 0 1 4 12z"/></svg>',
  user: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="4"/><path d="M4.5 20.5c.8-4 3.8-6 7.5-6s6.7 2 7.5 6"/></svg>',
  train: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2"><rect x="5" y="3" width="14" height="14" rx="3"/><path d="M5 11h14M8 21l2-4M16 21l-2-4"/></svg>',
};

// Avatars génériques : silhouette sur fond de couleur, jamais de visage ni de nom.
const AV_COLORS = ['#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6', '#ef4444', '#64748b'];
function avatar(i, size) {
  const s = size || 40;
  return `<div class="av" style="width:${s}px;height:${s}px;background:${AV_COLORS[i % AV_COLORS.length]}">${ICONS.person}</div>`;
}

// Illustrations vectorielles des sorties (pas de photo de personne).
function scene(kind) {
  const S = {
    hike: `<svg viewBox="0 0 400 220" preserveAspectRatio="xMidYMid slice">
      <defs><linearGradient id="sk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffd8a8"/><stop offset="1" stop-color="#fff3e0"/></linearGradient></defs>
      <rect width="400" height="220" fill="url(#sk)"/><circle cx="300" cy="70" r="30" fill="#ffb15e"/>
      <path d="M0 130 Q80 80 160 115 T320 100 T400 110 V220 H0z" fill="#9cc58f"/>
      <path d="M0 160 Q90 120 200 150 T400 140 V220 H0z" fill="#6aa66b"/>
      <path d="M0 190 Q120 160 230 185 T400 175 V220 H0z" fill="#3f7f4f"/>
      <path d="M170 220 C190 200 215 195 205 180 S235 160 250 150" stroke="#e9d3a8" stroke-width="9" fill="none" stroke-linecap="round"/>
      ${[20, 55, 330, 365, 300].map((x, i) => `<path d="M${x} ${178 + (i % 2) * 8} l14 -46 l14 46z" fill="#2f6b3f"/><rect x="${x + 12}" y="${176 + (i % 2) * 8}" width="4" height="10" fill="#5b4330"/>`).join('')}
    </svg>`,
    forest: `<svg viewBox="0 0 400 220" preserveAspectRatio="xMidYMid slice">
      <rect width="400" height="220" fill="#e6f2df"/><circle cx="90" cy="60" r="26" fill="#ffd08a"/>
      ${Array.from({ length: 11 }, (_, i) => { const x = i * 38 - 10, h = 90 + (i * 37) % 60; return `<path d="M${x} 200 l22 -${h} l22 ${h}z" fill="${i % 2 ? '#4c8a5a' : '#36704a'}"/>`; }).join('')}
      <path d="M0 195 Q200 175 400 195 V220 H0z" fill="#2d5e3d"/>
      <path d="M150 220 Q190 200 230 205 T300 195" stroke="#e9d3a8" stroke-width="8" fill="none" stroke-linecap="round"/>
    </svg>`,
    trail: `<svg viewBox="0 0 400 220" preserveAspectRatio="xMidYMid slice">
      <rect width="400" height="220" fill="#dbeafe"/>
      <path d="M-10 190 L110 50 L170 120 L240 30 L410 200z" fill="#7c8aa5"/>
      <path d="M110 50 L132 76 L118 74 L100 62z M240 30 L268 64 L250 60 L228 46z" fill="#fff"/>
      <path d="M0 200 Q100 150 200 180 T400 170 V220 H0z" fill="#8bb174"/>
      <path d="M120 220 Q170 190 210 180 T300 120" stroke="#f3e2c0" stroke-width="7" fill="none" stroke-linecap="round" stroke-dasharray="2 0"/>
    </svg>`,
    run: `<svg viewBox="0 0 400 220" preserveAspectRatio="xMidYMid slice">
      <rect width="400" height="220" fill="#fde2cf"/><circle cx="320" cy="60" r="34" fill="#fb923c" opacity=".8"/>
      ${[30, 80, 120, 260, 300, 350].map((x, i) => `<rect x="${x}" y="${70 + (i * 23) % 50}" width="34" height="${150 - (i * 23) % 50}" fill="${i % 2 ? '#e9b49a' : '#dca085'}"/>`).join('')}
      <path d="M0 165 H400 V220 H0z" fill="#7fb77e"/>
      <path d="M-20 220 Q200 150 420 200" stroke="#ef7d4c" stroke-width="22" fill="none"/>
      <path d="M-20 220 Q200 150 420 200" stroke="#fff" stroke-width="2" stroke-dasharray="10 8" fill="none"/>
    </svg>`,
    padel: `<svg viewBox="0 0 400 220" preserveAspectRatio="xMidYMid slice">
      <rect width="400" height="220" fill="#1e3a8a"/><rect x="40" y="30" width="320" height="170" fill="#2563eb" stroke="#fff" stroke-width="4"/>
      <path d="M200 30 V200 M40 115 H360" stroke="#fff" stroke-width="3"/><path d="M40 112 H360" stroke="#0f172a" stroke-width="7" opacity=".6"/>
      <circle cx="275" cy="72" r="11" fill="#d4ff4f"/>
    </svg>`,
    velo: `<svg viewBox="0 0 400 220" preserveAspectRatio="xMidYMid slice">
      <rect width="400" height="220" fill="#fef3c7"/>
      <path d="M0 140 Q100 100 200 130 T400 120 V220 H0z" fill="#c7d98f"/>
      <path d="M0 220 L180 120 L220 120 L400 220z" fill="#6b7280"/><path d="M200 125 V220" stroke="#fff" stroke-width="4" stroke-dasharray="14 12"/>
    </svg>`,
    climb: `<svg viewBox="0 0 400 220" preserveAspectRatio="xMidYMid slice">
      <rect width="400" height="220" fill="#ffe4d6"/><path d="M60 220 L120 20 L300 10 L350 220z" fill="#c2856a"/>
      ${[[150, 60, '#ef4444'], [200, 100, '#3b82f6'], [170, 140, '#10b981'], [240, 70, '#f59e0b'], [260, 150, '#8b5cf6'], [130, 180, '#f59e0b']].map(([x, y, c]) => `<circle cx="${x}" cy="${y}" r="8" fill="${c}"/>`).join('')}
    </svg>`,
  };
  return S[kind] || S.hike;
}

const STATUS = `<div class="island"></div><div class="status"><span>9:41</span><span class="icons">
  <svg viewBox="0 0 18 12"><rect x="0" y="8" width="3" height="4" rx="1"/><rect x="5" y="5" width="3" height="7" rx="1"/><rect x="10" y="2.5" width="3" height="9.5" rx="1"/><rect x="15" y="0" width="3" height="12" rx="1"/></svg>
  <svg viewBox="0 0 16 12"><path d="M8 11.5 5.6 9a3.4 3.4 0 0 1 4.8 0zM3.4 6.8a6.6 6.6 0 0 1 9.2 0l-1.4 1.4a4.6 4.6 0 0 0-6.4 0zM1 4.4a10 10 0 0 1 14 0l-1.4 1.4a8 8 0 0 0-11.2 0z"/></svg>
  <svg viewBox="0 0 27 13"><rect x=".5" y=".5" width="23" height="12" rx="3.5" fill="none" stroke="currentColor" opacity=".4"/><rect x="2" y="2" width="19" height="9" rx="2"/><rect x="24.5" y="4.5" width="2" height="4" rx="1" opacity=".4"/></svg>
</span></div>`;

function tabbar(active) {
  const t = [['home', 'Sorties'], ['search', 'Explorer'], ['plus', ''], ['bubble', 'Discussions'], ['user', 'Profil']];
  return `<div class="tabbar">${t.map(([ic, l], i) => ic === 'plus'
    ? `<div><span class="plus">${ICONS.plus}</span></div>`
    : `<div class="${i === active ? 'on' : ''}">${ICONS[ic]}${l}</div>`).join('')}</div>`;
}

function layout() {
  const p = new URLSearchParams(location.search);
  const W = +p.get('w') || 1320, H = +p.get('h') || 2868;
  document.querySelectorAll('[data-scene]').forEach(el => { el.innerHTML = scene(el.dataset.scene); });
  document.querySelectorAll('[data-av]').forEach(el => { el.outerHTML = avatar(+el.dataset.av, +el.dataset.size || 40); });
  document.querySelectorAll('[data-icon]').forEach(el => { el.innerHTML = ICONS[el.dataset.icon]; });
  const scr = document.querySelector('.screen');
  scr.insertAdjacentHTML('afterbegin', STATUS);
  if (scr.dataset.tab !== undefined) scr.insertAdjacentHTML('beforeend', tabbar(+scr.dataset.tab));

  if (p.get('screen')) { document.body.classList.add('screen-only'); const c = document.querySelector('.canvas'); c.style.width = '393px'; c.style.height = '852px'; document.body.dataset.ready = '1'; if (parent !== window) parent.postMessage('fitmates-ready', '*'); return; }

  const c = document.querySelector('.canvas');
  c.style.width = W + 'px'; c.style.height = H + 'px';
  const tall = H / W > 2;               // iPhone 6,9" (1320x2868) contre Play (1080x1920)
  const head = document.querySelector('.head');
  head.style.top = (tall ? 0.072 : 0.045) * H + 'px';
  head.querySelector('.kicker').style.fontSize = W * (tall ? 0.03 : 0.032) + 'px';
  head.querySelector('h1').style.fontSize = W * (tall ? 0.103 : 0.092) + 'px';
  head.querySelector('h1').style.marginTop = W * 0.035 + 'px';
  const sub = head.querySelector('.sub');
  sub.style.fontSize = W * (tall ? 0.04 : 0.038) + 'px';
  sub.style.marginTop = W * 0.026 + 'px';

  const phone = document.querySelector('.phone');
  const top = head.offsetTop + head.offsetHeight + W * (tall ? 0.07 : 0.05);
  const pw = W * (tall ? 0.80 : 0.76);
  const s = pw / 417;
  phone.style.top = top + 'px';
  phone.style.transform = `translateX(-50%) scale(${s})`;
  document.body.dataset.ready = '1';
}
document.fonts.ready.then(layout);
