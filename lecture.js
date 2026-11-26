'use strict';
/* =========================================================
   Turath — Lecteur du Coran
   Texte avec couleurs du tajwid + traduction : api.alquran.cloud
   (éditions « quran-tajweed » et « fr.hamidullah »).
   Récitation verset par verset : cdn.islamic.network.
   Chaque sourate lue est gardée sur l'appareil (lecture hors ligne).
   ========================================================= */

const QURAN_API = 'https://api.alquran.cloud/v1';
const QURAN_AUDIO = 'https://cdn.islamic.network/quran/audio';
const QURAN_RECITERS = [
  { id: 'ar.alafasy', name: 'Mishārī al-ʿAfāsī' },
  { id: 'ar.husary', name: 'Maḥmūd Khalīl al-Ḥuṣarī' },
  { id: 'ar.minshawi', name: 'Muḥammad Ṣiddīq al-Minshāwī' },
  { id: 'ar.mahermuaiqly', name: 'Māhir al-Muʿayqilī' }
];
const AUDIO_BITRATES = [128, 64, 192];
const BASMALA = 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ';

/* Codes du tajwid renvoyés par l'API → classes CSS */
const TAJWID = {
  h: ['ham_wasl', 'Hamzat al-waṣl'], s: ['silent', 'Lettre muette'], l: ['lam_sh', 'Lām shamsiyya'],
  n: ['madd_n', 'Madd naturel (2)'], p: ['madd_p', 'Madd permis (2, 4, 6)'], m: ['madd_m', 'Madd nécessaire (6)'],
  o: ['madd_o', 'Madd obligatoire (4-5)'], q: ['qalqala', 'Qalqala'], c: ['ikhfa_sh', 'Ikhfāʾ shafawī'],
  f: ['ikhfa', 'Ikhfāʾ'], w: ['idgham_sh', 'Idghām shafawī'], i: ['iqlab', 'Iqlāb'],
  a: ['idgham_g', 'Idghām avec ghunna'], u: ['idgham_ng', 'Idghām sans ghunna'],
  d: ['idgham_mj', 'Idghām mutajānisayn'], b: ['idgham_mq', 'Idghām mutaqāribayn'], g: ['ghunna', 'Ghunna']
};
const TJ_LEGEND = ['g', 'f', 'a', 'u', 'i', 'q', 'n', 'p', 'o', 'm', 'h'];
function tajwidHTML(raw, colored) {
  return esc(raw).replace(/\[([a-z])(?::\d+)?\[([^\]]*)\]/g, (_, c, t) =>
    colored && TAJWID[c] ? `<span class="tj tj-${TAJWID[c][0]}">${t}</span>` : t);
}
const arNum = (n) => String(n).replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[d]);

/* ---------- Réglages du lecteur (dans les données) ---------- */
NORMALIZERS.push((d) => {
  d.reader = { edition: 'ar.alafasy', translation: true, tajwid: true, hide: false, repeat: 1, size: 30, ...(d.reader || {}) };
});
NORMALIZERS[NORMALIZERS.length - 1](data);
const R = () => data.reader;

/* ---------- Cache des sourates (IndexedDB, base séparée) ---------- */
const QuranCache = {
  _db: null,
  open() {
    if (this._db) return Promise.resolve(this._db);
    return new Promise((res, rej) => {
      const r = indexedDB.open('turath-quran', 1);
      r.onupgradeneeded = () => r.result.createObjectStore('surahs');
      r.onsuccess = () => { this._db = r.result; res(r.result); };
      r.onerror = () => rej(r.error);
    });
  },
  async tx(mode, fn) {
    const db = await this.open();
    return new Promise((res, rej) => {
      const t = db.transaction('surahs', mode);
      const req = fn(t.objectStore('surahs'));
      t.oncomplete = () => res(req && req.result);
      t.onerror = () => rej(t.error);
    });
  },
  get(n) { return this.tx('readonly', st => st.get(n)).catch(() => null); },
  put(n, v) { return this.tx('readwrite', st => st.put(v, n)); },
  keys() { return this.tx('readonly', st => st.getAllKeys()).catch(() => []); },
  clear() { return this.tx('readwrite', st => st.clear()).catch(() => {}); }
};
const surahMem = new Map();
function shapeSurah(n, tjAyahs, frAyahs) {
  return {
    n,
    ayahs: tjAyahs.map((a, i) => {
      let t = a.text;
      if (n !== 1 && i === 0 && t.startsWith('بِسْمِ')) t = t.replace(/^بِسْمِ\s+\S+\s+\S+\s+\S+\s*/, '');
      return { k: a.numberInSurah, g: a.number, t, fr: frAyahs && frAyahs[i] ? frAyahs[i].text : '', juz: a.juz, page: a.page, sajda: !!a.sajda };
    })
  };
}
async function getSurah(n) {
  n = +n;
  if (surahMem.has(n)) return surahMem.get(n);
  const cached = await QuranCache.get(n);
  if (cached) { surahMem.set(n, cached); return cached; }
  const r = await fetch(`${QURAN_API}/surah/${n}/editions/quran-tajweed,fr.hamidullah`);
  if (!r.ok) throw new Error('net');
  const j = await r.json();
  const [tj, fr] = j.data;
  const out = shapeSurah(n, tj.ayahs, fr && fr.ayahs);
  surahMem.set(n, out);
  QuranCache.put(n, out).catch(() => {});
  return out;
}
async function downloadWholeQuran(onProgress) {
  onProgress('Téléchargement du texte…');
  const [a, b] = await Promise.all([
    fetch(`${QURAN_API}/quran/quran-tajweed`).then(r => { if (!r.ok) throw new Error('net'); return r.json(); }),
    fetch(`${QURAN_API}/quran/fr.hamidullah`).then(r => { if (!r.ok) throw new Error('net'); return r.json(); })
  ]);
  const tjS = a.data.surahs, frS = b.data.surahs;
  for (let i = 0; i < tjS.length; i++) {
    const n = tjS[i].number;
    const out = shapeSurah(n, tjS[i].ayahs, frS[i] && frS[i].ayahs);
    surahMem.set(n, out);
    await QuranCache.put(n, out);
    if (i % 10 === 0) onProgress(`Enregistrement… ${i + 1}/114`);
  }
}

/* ---------- Passages du Coran dans les adhkār et duʿāʾ ----------
   ref : « 2:255 » ou « 112:1-4 » */
function parseRef(ref) {
  const m = String(ref).match(/^(\d+):(\d+)(?:-(\d+))?$/);
  return m ? { n: +m[1], from: +m[2], to: +(m[3] || m[2]) } : null;
}
const refLabel = (ref) => { const p = parseRef(ref); return p ? `${S(p.n).fr} ${p.n}:${p.from}${p.to !== p.from ? '-' + p.to : ''}` : ref; };
function quranRefBlock(refs) {
  return `<div class="qref" data-refs="${esc([].concat(refs).join(','))}"><p class="m">Chargement du passage…</p></div>`;
}
async function hydrateQuranRefs(root = document) {
  for (const el of root.querySelectorAll('.qref[data-refs]')) {
    const refs = el.dataset.refs.split(',').map(parseRef).filter(Boolean);
    try {
      const parts = [];
      for (const p of refs) {
        const s = await getSurah(p.n);
        const ays = s.ayahs.filter(a => a.k >= p.from && a.k <= p.to);
        const wholeSurah = p.from === 1 && p.to === S(p.n).ayahs && p.n !== 1 && p.n !== 9;
        parts.push(`${wholeSurah && refs.length > 1 ? `<p class="qref-basmala" lang="ar">${BASMALA}</p>` : ''}<p class="qref-ar" lang="ar" dir="rtl">${ays.map(a => `${tajwidHTML(a.t, R().tajwid)} <span class="ayah-n">${arNum(a.k)}</span>`).join(' ')}</p>`);
      }
      el.innerHTML = parts.join('');
      el.removeAttribute('data-refs');
    } catch (e) {
      el.innerHTML = `<p class="m">Connexion nécessaire pour afficher ce passage la première fois (${esc(refs.map(r => `${r.n}:${r.from}`).join(', '))}).</p>`;
    }
  }
}
AFTER_RENDER.push(() => hydrateQuranRefs($('#view')));

/* ---------- Écran de lecture ---------- */
const reader = { n: null, data: null, target: null };
function renderReader(nParam, ayahParam) {
  const n = clamp(parseInt(nParam, 10) || 1, 1, 114);
  const info = S(n), st = sState(n);
  reader.n = n; reader.target = ayahParam ? +ayahParam : null;
  if (!reader.data || reader.data.n !== n) reader.data = surahMem.get(n) || null;
  const prev = n > 1 ? `<a class="btn on-dark small" href="#/lire/${n - 1}">${ic('back')}${n - 1}</a>` : '';
  const next = n < 114 ? `<a class="btn on-dark small" href="#/lire/${n + 1}">${n + 1}${ic('chevron')}</a>` : '';
  return `<section class="hero reader-hero"><div class="hero-in">
      <a class="hero-back" href="#/coran">${ic('back')}Coran</a>
      <div class="reader-title">
        <p class="reader-ar" lang="ar">سُورَةُ ${info.ar}</p>
        <h1>${n}. ${info.fr}</h1>
        <p class="hero-sub">${info.ayahs} versets · ${MARK_LABEL[markClass(st)]}${st.status === 'learning' ? ` jusqu'au verset ${st.ayah}` : ''}</p>
      </div>
      <div class="reader-bar">
        <button class="btn on-dark" data-action="q-play" data-k="${reader.target || 1}">${ic('play')}Écouter</button>
        <button class="btn on-dark" data-action="open-surah" data-n="${n}">${ic('check')}Mémorisation</button>
        <button class="icon-btn on-dark" data-action="q-settings" aria-label="Réglages de lecture">${ic('gear')}</button>
      </div>
      <div class="reader-nav">${prev}<span class="spacer"></span>${next}</div>
    </div></section>` + content(`
    <div class="reader-tools">
      <button class="tool ${R().tajwid ? 'on' : ''}" data-action="q-toggle" data-key="tajwid">Tajwid</button>
      <button class="tool ${R().translation ? 'on' : ''}" data-action="q-toggle" data-key="translation">Traduction</button>
      <button class="tool ${R().hide ? 'on' : ''}" data-action="q-toggle" data-key="hide">${ic('eye')}Mode test</button>
      <span class="spacer"></span>
      <button class="tool" data-action="q-size" data-d="-2" aria-label="Texte plus petit">A−</button>
      <button class="tool" data-action="q-size" data-d="2" aria-label="Texte plus grand">A+</button>
    </div>
    ${R().hide ? `<p class="hint">Mode test : récite de mémoire, puis touche un verset pour le révéler. <button class="plain-link" data-action="q-reveal-all">Tout révéler</button></p>` : ''}
    <div id="reader" class="reader${R().hide ? ' hide' : ''}" style="--q-size:${R().size}px">${reader.data ? readerBody(reader.data) : `<div class="loading"><span class="spinner"></span>Chargement de la sourate…</div>`}</div>
    ${R().tajwid ? `<details class="tj-legend"><summary>Légende des couleurs du tajwid</summary><div>${TJ_LEGEND.map(c => `<span><i class="tj-dot tj-${TAJWID[c][0]}"></i>${TAJWID[c][1]}</span>`).join('')}<span><i class="tj-dot tj-silent"></i>Muet, hamzat al-waṣl, lām shamsiyya</span></div></details>` : ''}
    <p class="credit">Texte et traduction (Muḥammad Ḥamīdullāh) : alquran.cloud · Récitation : Islamic Network CDN</p>`);
}
function readerBody(d) {
  const n = d.n, st = sState(n), bm = data.quran.bookmark;
  const memoTo = st.status === 'memorized' ? S(n).ayahs : st.status === 'learning' ? st.ayah : 0;
  return `${n !== 1 && n !== 9 ? `<p class="basmala" lang="ar">${BASMALA}</p>` : ''}
    ${d.ayahs.map(a => `<article class="ayah${a.k <= memoTo ? ' memo' : ''}${bm && bm.surah === n && bm.ayah === a.k ? ' bm' : ''}" id="ayah-${a.k}" data-k="${a.k}">
      <div class="ayah-head">
        <span class="ayah-badge">${a.k}</span>
        ${bm && bm.surah === n && bm.ayah === a.k ? `<span class="pill pill-bad">${ic('bookmark')}Point d'arrêt</span>` : ''}
        ${a.sajda ? '<span class="pill">Sajda</span>' : ''}
        <span class="spacer"></span>
        <button class="icon-btn" data-action="q-play" data-k="${a.k}" aria-label="Écouter ce verset">${ic('play')}</button>
        <button class="icon-btn" data-action="q-ayah-menu" data-k="${a.k}" aria-label="Options">${ic('layers')}</button>
      </div>
      <p class="ayah-ar" lang="ar" dir="rtl" data-action="q-reveal" data-k="${a.k}">${tajwidHTML(a.t, R().tajwid)} <span class="ayah-n">${arNum(a.k)}</span></p>
      ${R().translation && a.fr ? `<p class="ayah-fr">${esc(a.fr)}</p>` : ''}
    </article>`).join('')}`;
}
async function loadReader(n) {
  try {
    const d = await getSurah(n);
    if (reader.n !== n || currentRoute.page !== 'lire') return;
    reader.data = d;
    const box = $('#reader'); if (!box) return;
    box.innerHTML = readerBody(d);
    afterReaderPaint();
  } catch (e) {
    const box = $('#reader');
    if (box && reader.n === n) box.innerHTML = `<div class="empty"><p class="empty-t">Impossible de charger la sourate</p><p class="empty-d">Il faut une connexion internet la première fois. Ensuite, la sourate reste disponible hors ligne.</p><button class="btn primary" data-action="q-retry">Réessayer</button></div>`;
  }
}
function afterReaderPaint() {
  markPlayingAyah();
  if (reader.target) {
    const el = document.getElementById(`ayah-${reader.target}`);
    if (el) setTimeout(() => el.scrollIntoView({ block: 'center' }), 60);
    reader.target = null;
  }
}
AFTER_RENDER.push((page, param) => {
  if (page !== 'lire') return;
  if (reader.data && reader.data.n === reader.n) afterReaderPaint();
  else loadReader(reader.n);
});

/* ---------- Récitation verset par verset ---------- */
const qp = { on: false, n: null, k: null, left: 0, brIdx: 0, ayahs: null };
function ayahAudioURL(g) { return `${QURAN_AUDIO}/${AUDIO_BITRATES[qp.brIdx]}/${R().edition}/${g}.mp3`; }
async function quranPlay(n, k) {
  let d;
  try { d = await getSurah(n); } catch (e) { toast('Connexion nécessaire pour écouter'); return; }
  const a = d.ayahs.find(x => x.k === k) || d.ayahs[0];
  Object.assign(qp, { on: true, n, k: a.k, left: R().repeat, brIdx: 0, ayahs: d.ayahs });
  startAyah(a);
}
function startAyah(a) {
  const rec = QURAN_RECITERS.find(r => r.id === R().edition) || QURAN_RECITERS[0];
  player.current = { id: `q-${qp.n}-${a.k}`, oid: 'quran', title: `${S(qp.n).fr} · verset ${a.k}`, artist: rec.name, ar: S(qp.n).ar, href: `#/lire/${qp.n}/${a.k}`, quran: true };
  player.audio.src = ayahAudioURL(a.g);
  player.audio.play().catch(() => {});
  try {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({ title: player.current.title, artist: rec.name, album: 'Turath', artwork: [{ src: 'icon-512.png', sizes: '512x512', type: 'image/png' }] });
      navigator.mediaSession.setActionHandler('nexttrack', () => quranStep(1));
      navigator.mediaSession.setActionHandler('previoustrack', () => quranStep(-1));
    }
  } catch (e) { /* facultatif */ }
  renderPlayer();
  markPlayingAyah(true);
}
function quranStep(dir) {
  if (!qp.on || !qp.ayahs) return;
  const i = qp.ayahs.findIndex(x => x.k === qp.k) + dir;
  if (i < 0 || i >= qp.ayahs.length) { qp.on = false; markPlayingAyah(); return; }
  qp.k = qp.ayahs[i].k; qp.left = R().repeat; qp.brIdx = 0;
  startAyah(qp.ayahs[i]);
}
player.audio.addEventListener('ended', () => {
  if (!qp.on || !player.current || !player.current.quran) return;
  qp.left--;
  if (qp.left > 0) { player.audio.currentTime = 0; player.audio.play().catch(() => {}); return; }
  quranStep(1);
});
player.audio.addEventListener('error', () => {
  if (!qp.on || !player.current || !player.current.quran) return;
  if (qp.brIdx < AUDIO_BITRATES.length - 1) {
    qp.brIdx++;
    const a = qp.ayahs.find(x => x.k === qp.k);
    if (a) { player.audio.src = ayahAudioURL(a.g); player.audio.play().catch(() => {}); }
  } else { qp.on = false; toast('Récitation indisponible pour ce récitateur, essaie-en un autre'); }
});
function markPlayingAyah(scroll) {
  document.querySelectorAll('.ayah.playing').forEach(el => el.classList.remove('playing'));
  if (!qp.on || currentRoute.page !== 'lire' || reader.n !== qp.n) return;
  const el = document.getElementById(`ayah-${qp.k}`);
  if (!el) return;
  el.classList.add('playing');
  if (scroll) el.scrollIntoView({ block: 'center', behavior: 'smooth' });
}
const _stopPlayer = actions['stop-player'];
actions['stop-player'] = () => { qp.on = false; _stopPlayer(); markPlayingAyah(); };

function readerSettings() {
  openModal('Réglages de lecture', `
    <label class="field">Récitateur (verset par verset)
      <select name="edition">${QURAN_RECITERS.map(r => `<option value="${r.id}" ${R().edition === r.id ? 'selected' : ''}>${r.name}</option>`).join('')}</select></label>
    <label class="field">Répéter chaque verset (pour mémoriser)
      <select name="repeat">${[1, 2, 3, 5, 7, 10].map(x => `<option value="${x}" ${+R().repeat === x ? 'selected' : ''}>${x === 1 ? 'Une fois' : `${x} fois`}</option>`).join('')}</select></label>
    <label class="field">Taille du texte arabe
      <input type="range" name="size" min="22" max="46" step="2" value="${R().size}"></label>`,
    (fd) => {
      Object.assign(data.reader, { edition: fd.get('edition'), repeat: +fd.get('repeat') || 1, size: +fd.get('size') || 30 });
      save();
    });
}
function ayahMenu(k) {
  const n = reader.n, info = S(n);
  openModal(`${info.fr} · verset ${k}`, `
    <div class="menu-list">
      <button type="button" class="row plain" data-action="q-bookmark" data-k="${k}"><span class="row-ico">${ic('bookmark')}</span><span class="grow"><span class="t">Mettre mon point d'arrêt ici</span></span></button>
      <button type="button" class="row plain" data-action="q-memo" data-k="${k}"><span class="row-ico">${ic('check')}</span><span class="grow"><span class="t">Mémorisé jusqu'à ce verset</span><span class="m">${k === info.ayahs ? 'La sourate sera marquée comme mémorisée' : `Statut : en cours, jusqu'au verset ${k}`}</span></span></button>
      <button type="button" class="row plain" data-action="q-play" data-k="${k}"><span class="row-ico">${ic('play')}</span><span class="grow"><span class="t">Écouter à partir d'ici</span></span></button>
      <button type="button" class="row plain" data-action="q-faida" data-k="${k}"><span class="row-ico">${ic('bulb')}</span><span class="grow"><span class="t">Noter une faïda sur ce verset</span></span></button>
    </div>`);
}

Object.assign(actions, {
  'q-play': (el) => { closeModal(); quranPlay(reader.n || 1, +el.dataset.k || 1); },
  'q-toggle': (el) => { const k = el.dataset.key; data.reader[k] = !data.reader[k]; save(); render(); },
  'q-size': (el) => { data.reader.size = clamp(R().size + +el.dataset.d, 22, 46); save(); const b = $('#reader'); if (b) b.style.setProperty('--q-size', `${R().size}px`); },
  'q-reveal': (el) => { if (R().hide) el.closest('.ayah').classList.toggle('revealed'); },
  'q-reveal-all': () => document.querySelectorAll('.ayah').forEach(a => a.classList.add('revealed')),
  'q-settings': () => readerSettings(),
  'q-ayah-menu': (el) => ayahMenu(+el.dataset.k),
  'q-retry': () => loadReader(reader.n),
  'q-bookmark': (el) => {
    data.quran.bookmark = { surah: reader.n, ayah: +el.dataset.k, date: todayISO() };
    save(); closeModal(); toast(`Point d'arrêt : ${S(reader.n).fr}, verset ${el.dataset.k}`);
    const b = $('#reader'); if (b && reader.data) { b.innerHTML = readerBody(reader.data); markPlayingAyah(); }
  },
  'q-memo': (el) => {
    const n = reader.n, k = +el.dataset.k, info = S(n), s = sState(n);
    if (k >= info.ayahs) { setS(n, { status: 'memorized', ayah: info.ayahs, lastRevision: s.lastRevision || todayISO() }); toast(`Bārak Allāhu fīk ! ${info.fr} mémorisée`); }
    else setS(n, { status: 'learning', ayah: k });
    addLog(n, 'memo'); save(); closeModal(); render();
  },
  'q-faida': (el) => { closeModal(); if (typeof faidaForm === 'function') faidaForm(null, { source: `Coran : ${S(reader.n).fr} ${reader.n}:${el.dataset.k}` }); }
});

/* ---------- Routes et réglages ---------- */
PARAM_VIEWS.lire = (p, p2) => renderReader(p, p2);
VIEWS.lire = () => { location.replace('#/lire/1'); return ''; };

SETTINGS_SECTIONS.push(() => `
  <section class="block">
    <div class="block-head"><h2>Coran hors ligne</h2></div>
    <div class="card">
      <p class="m">Chaque sourate que tu ouvres est gardée sur ton téléphone. Tu peux aussi enregistrer tout le Coran d'un coup (texte avec tajwid et traduction, quelques Mo) pour le lire sans connexion. Les récitations audio, elles, demandent une connexion.</p>
      <p class="m" id="q-offline-state">Vérification…</p>
      <div class="row-actions"><button class="btn primary" data-action="q-download-all">Télécharger tout le Coran</button></div>
    </div>
  </section>`);
AFTER_RENDER.push(async (page) => {
  if (page !== 'reglages') return;
  const keys = await QuranCache.keys();
  const el = $('#q-offline-state');
  if (el) el.textContent = keys.length >= 114 ? 'Tout le Coran est disponible hors ligne.' : `${keys.length} sourate${keys.length > 1 ? 's' : ''} sur 114 disponible${keys.length > 1 ? 's' : ''} hors ligne.`;
});
actions['q-download-all'] = async (el) => {
  el.disabled = true;
  const st = $('#q-offline-state');
  try {
    await downloadWholeQuran((msg) => { if (st) st.textContent = msg; });
    if (st) st.textContent = 'Tout le Coran est disponible hors ligne.';
    toast('Coran enregistré sur ton téléphone');
  } catch (e) {
    if (st) st.textContent = 'Échec du téléchargement : vérifie ta connexion et réessaie.';
  }
  el.disabled = false;
};
