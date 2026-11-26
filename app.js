'use strict';

/* =========================================================
   Turath — تراث · version 5
   Carnet personnel : Coran, récitations, hadiths, savants, étudiants,
   livres, maisons d'édition.
   Toutes les données restent sur l'appareil (localStorage).
   ========================================================= */

/* ---------- Utilitaires ---------- */
const $ = (s, r = document) => r.querySelector(s);
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const isoOf = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const todayISO = () => isoOf(new Date());
const daysSince = (iso) => iso ? Math.round((new Date(todayISO() + 'T12:00:00') - new Date(iso + 'T12:00:00')) / 86400000) : Infinity;
const fmtDate = (iso) => iso ? new Date(iso + 'T12:00:00').toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const norm = (s) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9؀-ۿ]/g, '');
const linkify = (text) => esc(text)
  .replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" target="_blank" rel="noopener">$1</a>')
  .replace(/\n/g, '<br>');
const plural = (n, word) => `${n} ${word}${n > 1 ? 's' : ''}`;
function ago(iso) {
  if (!iso) return 'jamais révisé';
  const d = daysSince(iso);
  if (d <= 0) return "révisé aujourd'hui";
  if (d === 1) return 'révisé hier';
  return `révisé il y a ${d} j`;
}
const fmtTime = (s) => { s = Math.max(0, Math.floor(s || 0)); const m = Math.floor(s / 60); return `${m}:${String(s % 60).padStart(2, '0')}`; };

/* ---------- Icônes ---------- */
const ICONS = {
  home: '<path d="M4 10.5 12 4l8 6.5V19a1 1 0 0 1-1 1h-4.5v-5.5h-5V20H5a1 1 0 0 1-1-1z"/>',
  quran: '<path d="M12 7c-1.8-1.4-4.6-2-8-1.6v12.2c3.4-.4 6.2.2 8 1.6 1.8-1.4 4.6-2 8-1.6V5.4C16.6 5 13.8 5.6 12 7z"/><path d="M12 7v12.2"/>',
  hadith: '<rect x="5" y="3.5" width="14" height="17" rx="2.5"/><path d="M8.5 8.5h7M8.5 12h7M8.5 15.5h4"/>',
  scholars: '<circle cx="12" cy="8.5" r="3.5"/><path d="M5 20c.8-3.6 3.6-5.5 7-5.5s6.2 1.9 7 5.5"/>',
  library: '<path d="M4.5 4.5H8v15H4.5zM10 4.5h3.5v15H10z"/><path d="m15.4 5.4 3.2-.8 2.9 14.1-3.2.8z"/>',
  gear: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
  play: '<path d="M8 5.5v13l11-6.5z" fill="currentColor" stroke="none"/>',
  pause: '<path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z" fill="currentColor" stroke="none"/>',
  close: '<path d="M6 6l12 12M18 6 6 18"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  search: '<circle cx="11" cy="11" r="6.5"/><path d="m16 16 4 4"/>',
  chevron: '<path d="m9 6 6 6-6 6"/>',
  back: '<path d="m15 6-6 6 6 6"/>',
  headphones: '<path d="M4 15v-3a8 8 0 0 1 16 0v3"/><rect x="3.5" y="14" width="4" height="6" rx="1.5"/><rect x="16.5" y="14" width="4" height="6" rx="1.5"/>',
  bookmark: '<path d="M7 4h10v16l-5-3.5L7 20z"/>',
  external: '<path d="M14 4h6v6M20 4l-9 9"/><path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>',
  check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
  sort: '<path d="M8 4v16M4.5 7.5 8 4l3.5 3.5M16 20V4M12.5 16.5 16 20l3.5-3.5"/>',
  edit: '<path d="M4 20h4L19 9l-4-4L4 16z"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4"/>',
  moon: '<path d="M19.5 14.5A8 8 0 0 1 9.5 4.5a8 8 0 1 0 10 10z"/>',
  mosque: '<path d="M12 3c-3.3 2.4-5 4.6-5 7h10c0-2.4-1.7-4.6-5-7z"/><path d="M5 10h14v10H5zM10 20v-4a2 2 0 0 1 4 0v4"/>',
  hands: '<path d="M8 13V6.5a1.5 1.5 0 0 1 3 0V12M11 11V5a1.5 1.5 0 0 1 3 0v6M14 11V7a1.5 1.5 0 0 1 3 0v7a6 6 0 0 1-6 6h-.5A5.5 5.5 0 0 1 5 14.5V11a1.5 1.5 0 0 1 3 0"/>',
  star: '<path d="m12 3.5 2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8L3.5 9.7l5.9-.9z"/>',
  bulb: '<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2V16h5v-.1c0-.8.4-1.5 1-2A6 6 0 0 0 12 3z"/>',
  layers: '<path d="m12 3 9 5-9 5-9-5z"/><path d="m3 13 9 5 9-5"/>',
  compass: '<circle cx="12" cy="12" r="9"/><path d="m15.5 8.5-2 5-5 2 2-5z"/>',
  repeat: '<path d="M17 2.5 20.5 6 17 9.5"/><path d="M3.5 11V9a3 3 0 0 1 3-3h14M7 21.5 3.5 18 7 14.5"/><path d="M20.5 13v2a3 3 0 0 1-3 3h-14"/>',
  eye: '<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="3"/>',
  science: '<path d="M4 19.5V5a1.5 1.5 0 0 1 1.5-1.5H11v15H5.5A1.5 1.5 0 0 0 4 20z"/><path d="M20 19.5V5a1.5 1.5 0 0 0-1.5-1.5H13v15h5.5A1.5 1.5 0 0 1 20 20z"/>',
  minus: '<path d="M5 12h14"/>',
  location: '<path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0C18.5 15.4 12 21 12 21z"/><circle cx="12" cy="10" r="2.3"/>'
};
const ic = (name, cls = '') => `<svg class="ic ${cls}" viewBox="0 0 24 24" aria-hidden="true">${ICONS[name]}</svg>`;

/* ---------- Données ---------- */
const STORE_KEY = 'turath-data-v1';
const OLD_KEYS = ['talib-data-v1'];
const TOTAL_AYAHS = SURAHS.reduce((s, x) => s + x[2], 0);
const DEFAULT_THEMES = ['Tawḥīd', 'ʿAqīda', 'Repentir (tawba)', 'Prière', 'Manhaj', 'Tafsīr', 'Ḥadīth', 'Fiqh', 'Sīra', 'Comportement', "Purification de l'âme", 'Intention', 'Fitan'];

function defaultData() {
  return {
    version: 5,
    quran: { surahs: {}, bookmark: null, log: [] },
    reciters: [],
    hadiths: [{
      id: uid(), addedAt: todayISO(), status: 'none', lastRevision: null,
      ar: 'إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ، وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى',
      fr: "Les actes ne valent que par les intentions, et chacun n'aura que ce qu'il a eu l'intention de faire.",
      narrator: 'ʿUmar ibn al-Khaṭṭāb', source: 'Al-Bukhārī (1) et Muslim (1907)', grade: 'sahih',
      gradedBy: 'Muttafaq ʿalayh (rapporté par les deux)', theme: 'Intention', notes: ''
    }],
    scholars: [{ id: uid(), category: 'scholar', name: 'Shaykh Muḥammad Saʿīd Raslān', nameAr: 'الشيخ محمد سعيد رسلان', bio: '', studies: '', teachers: '', accounts: '', videos: [] }],
    books: [],
    publishers: [],
    settings: { revisionDays: 7, theme: 'auto', sortReverse: false, lastExport: null }
  };
}
const NORMALIZERS = [];
function normalize(d) {
  const def = defaultData();
  const out = {
    ...def, ...d, version: 5,
    quran: { ...def.quran, ...(d.quran || {}) },
    settings: { ...def.settings, ...(d.settings || {}) },
    reciters: Array.isArray(d.reciters) ? d.reciters.map(r => ({ recitations: [], ...r })) : [],
    hadiths: Array.isArray(d.hadiths) ? d.hadiths : def.hadiths,
    scholars: Array.isArray(d.scholars) ? d.scholars.map(s => ({ videos: [], category: 'scholar', ...s })) : def.scholars,
    books: Array.isArray(d.books) ? d.books : [],
    publishers: Array.isArray(d.publishers) ? d.publishers : []
  };
  NORMALIZERS.forEach(fn => fn(out));
  return out;
}
function load() {
  try {
    for (const key of [STORE_KEY, ...OLD_KEYS]) {
      const raw = localStorage.getItem(key);
      if (raw) return normalize(JSON.parse(raw));
    }
  } catch (e) { /* stockage indisponible */ }
  return defaultData();
}
let data = load();
function save() {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(data)); }
  catch (e) { toast("Impossible d'enregistrer sur cet appareil"); }
}

const ui = {
  quranTab: 'sourates', surahFilter: 'all', surahQuery: '', hadithFilter: 'all', hadithQuery: '',
  scholarTab: 'savants', theme: null, scholarTheme: 'all', lastScholar: null,
  libTab: 'livres', bookFilter: 'all', bookQuery: '', pubFilter: 'all'
};

/* ---------- Coran ---------- */
const S = (n) => ({ fr: SURAHS[n - 1][0], ar: SURAHS[n - 1][1], ayahs: SURAHS[n - 1][2] });
const sState = (n) => ({ status: 'none', ayah: 0, lastRevision: null, notes: '', ...(data.quran.surahs[n] || {}) });
function setS(n, patch) { data.quran.surahs[n] = { ...sState(n), ...patch }; save(); }
const isDue = (o) => o.status === 'memorized' && daysSince(o.lastRevision) >= data.settings.revisionDays;
const needsRevision = (n) => isDue(sState(n));
function memoAyahs(n) {
  const s = sState(n);
  if (s.status === 'memorized') return S(n).ayahs;
  if (s.status === 'learning') return Math.min(s.ayah, S(n).ayahs);
  return 0;
}
function quranStats() {
  let mem = 0, learning = 0, ayahs = 0, toRev = 0;
  for (let n = 1; n <= 114; n++) {
    const s = sState(n);
    if (s.status === 'memorized') mem++;
    if (s.status === 'learning') learning++;
    ayahs += memoAyahs(n);
    if (needsRevision(n)) toRev++;
  }
  return { mem, learning, ayahs, toRev, pct: ayahs / TOTAL_AYAHS * 100 };
}
const pctLabel = (p) => p < 10 ? p.toFixed(1) : String(Math.round(p));
function addLog(n, type) {
  data.quran.log.push({ date: todayISO(), n, type });
  if (data.quran.log.length > 3000) data.quran.log = data.quran.log.slice(-3000);
}
function streak() {
  const days = new Set(data.quran.log.map(l => l.date));
  const d = new Date();
  if (!days.has(isoOf(d))) d.setDate(d.getDate() - 1);
  let count = 0;
  while (days.has(isoOf(d))) { count++; d.setDate(d.getDate() - 1); }
  return count;
}
const markClass = (o) => isDue(o) ? 'due' : o.status === 'memorized' ? 'full' : o.status === 'learning' ? 'half' : 'empty';
const MARK_LABEL = { full: 'Mémorisé', half: 'En cours', due: 'À réviser', empty: 'Pas commencé' };
const mark = (o) => { const c = markClass(o); return `<span class="mk mk-${c}" title="${MARK_LABEL[c]}" aria-label="${MARK_LABEL[c]}"></span>`; };
const legend = (cls = '') => `<div class="legend ${cls}"><span><i class="mk mk-full"></i>Mémorisé</span><span><i class="mk mk-half"></i>En cours</span><span><i class="mk mk-due"></i>À réviser</span><span><i class="mk"></i>Pas commencé</span></div>`;

/* ---------- Médias (vidéos, audio) ---------- */
const AUDIO_RE = /\.(mp3|m4a|aac|ogg|oga|opus|wav|flac)(\?|#|$)/i;
const AUDIO_HOSTS = /(mp3quran\.net|quranicaudio\.com|everyayah\.com|islamic\.network|archive\.org\/download)/i;
function parseMedia(url) {
  url = String(url || '').trim();
  let m = url.match(/(?:youtube\.com\/(?:watch\?(?:.*&)?v=|shorts\/|embed\/|live\/)|youtu\.be\/)([\w-]{11})/i);
  if (m) return { platform: 'youtube', vid: m[1], vertical: /\/shorts\//i.test(url) };
  m = url.match(/instagram\.com\/(?:[\w.]+\/)?(p|reel|reels|tv)\/([\w-]+)/i);
  if (m) return { platform: 'instagram', vid: m[2], kind: /^(p|tv)$/i.test(m[1]) ? 'p' : 'reel' };
  if (AUDIO_RE.test(url) || AUDIO_HOSTS.test(url)) return { platform: 'audio' };
  return { platform: 'link' };
}
const PLATFORM_LABEL = { youtube: 'YouTube', instagram: 'Instagram', audio: 'Audio', link: 'Lien' };
function embedSrc(p) {
  if (p.platform === 'youtube') return `https://www.youtube-nocookie.com/embed/${p.vid}?autoplay=1&rel=0`;
  if (p.platform === 'instagram') return `https://www.instagram.com/${p.kind}/${p.vid}/embed/`;
  return '';
}
function mediaBlock(url) {
  const p = parseMedia(url);
  if (p.platform === 'youtube') {
    return `<button class="media${p.vertical ? ' vertical' : ''}" data-action="play" data-src="${esc(embedSrc(p))}" aria-label="Lire la vidéo">
      <img loading="lazy" src="https://i.ytimg.com/vi/${p.vid}/hqdefault.jpg" alt="" onerror="this.remove()"><span class="play-btn">${ic('play')}</span><span class="platform">YouTube</span></button>`;
  }
  if (p.platform === 'instagram') {
    return `<button class="media vertical ig" data-action="play" data-src="${esc(embedSrc(p))}" aria-label="Charger la vidéo Instagram">
      <span class="play-btn">${ic('play')}</span><span class="ig-label">Charger la vidéo</span><span class="platform">Instagram</span></button>`;
  }
  return `<a class="media link-media" href="${esc(url)}" target="_blank" rel="noopener">${ic('external')}<span>Ouvrir le lien</span></a>`;
}

/* ---------- Fichiers importés depuis le téléphone (IndexedDB) ----------
   Les vidéos et audios importés sont trop lourds pour localStorage :
   ils sont rangés dans la base IndexedDB du navigateur, sur l'appareil. */
const MediaDB = {
  _db: null,
  open() {
    if (this._db) return Promise.resolve(this._db);
    return new Promise((res, rej) => {
      const r = indexedDB.open('turath-media', 1);
      r.onupgradeneeded = () => r.result.createObjectStore('files');
      r.onsuccess = () => { this._db = r.result; res(r.result); };
      r.onerror = () => rej(r.error);
    });
  },
  async tx(mode, fn) {
    const db = await this.open();
    return new Promise((res, rej) => {
      const t = db.transaction('files', mode);
      const req = fn(t.objectStore('files'));
      t.oncomplete = () => res(req && req.result);
      t.onerror = () => rej(t.error);
      t.onabort = () => rej(t.error);
    });
  },
  put(id, blob) { return this.tx('readwrite', st => st.put(blob, id)); },
  get(id) { return this.tx('readonly', st => st.get(id)); },
  del(id) { return this.tx('readwrite', st => st.delete(id)).catch(() => {}); },
  clear() { return this.tx('readwrite', st => st.clear()).catch(() => {}); }
};
const urlCache = new Map();
async function fileURL(fid) {
  if (urlCache.has(fid)) return urlCache.get(fid);
  const b = await MediaDB.get(fid);
  if (!b) throw new Error('missing');
  const u = URL.createObjectURL(b);
  urlCache.set(fid, u);
  return u;
}
async function removeFiles(item) {
  for (const k of ['fileId', 'posterId']) {
    const id = item && item[k];
    if (!id) continue;
    await MediaDB.del(id);
    if (urlCache.has(id)) { URL.revokeObjectURL(urlCache.get(id)); urlCache.delete(id); }
  }
}
const fmtSize = (b) => b >= 1e9 ? `${(b / 1e9).toFixed(1)} Go` : b >= 1e6 ? `${Math.round(b / 1e6)} Mo` : `${Math.max(1, Math.round(b / 1e3))} Ko`;
const isVideoFile = (f) => /^video\//.test(f.type || '') || /\.(mov|mp4|m4v|webm|3gp)$/i.test(f.name || '');
const isAudioFile = (f) => /^audio\//.test(f.type || '') || /\.(mp3|m4a|aac|wav|ogg|opus|flac)$/i.test(f.name || '');
function makePoster(blob) {
  return new Promise((resolve) => {
    const v = document.createElement('video');
    const url = URL.createObjectURL(blob);
    let done = false;
    const finish = (poster) => {
      if (done) return; done = true;
      const vertical = v.videoHeight > v.videoWidth;
      URL.revokeObjectURL(url); v.removeAttribute('src');
      resolve({ poster, vertical });
    };
    v.muted = true; v.playsInline = true; v.preload = 'auto';
    v.addEventListener('loadeddata', () => { try { v.currentTime = Math.min(1, (v.duration || 2) / 3); } catch (e) { finish(null); } });
    v.addEventListener('seeked', () => {
      try {
        const w = 360, h = Math.round(w * (v.videoHeight / v.videoWidth)) || 200;
        const c = document.createElement('canvas'); c.width = w; c.height = h;
        c.getContext('2d').drawImage(v, 0, 0, w, h);
        c.toBlob(b => finish(b), 'image/jpeg', 0.72);
      } catch (e) { finish(null); }
    });
    v.addEventListener('error', () => finish(null));
    setTimeout(() => finish(null), 7000);
    v.src = url; v.load();
  });
}
async function storeUpload(file) {
  const type = file.type || (isAudioFile(file) ? 'audio/mpeg' : 'video/mp4');
  const blob = new Blob([file], { type });
  const fileId = 'f_' + uid();
  await MediaDB.put(fileId, blob);
  const out = { fileId, posterId: null, fileName: file.name || 'fichier', fileType: type, fileSize: file.size, vertical: false };
  if (isVideoFile(file)) {
    const { poster, vertical } = await makePoster(blob);
    out.vertical = vertical;
    if (poster) { out.posterId = 'p_' + uid(); await MediaDB.put(out.posterId, poster); }
  }
  try { if (navigator.storage && navigator.storage.persist) navigator.storage.persist(); } catch (e) { /* facultatif */ }
  return out;
}
function hydratePosters(root = document) {
  root.querySelectorAll('img[data-poster]').forEach(img => {
    fileURL(img.dataset.poster).then(u => { img.src = u; }).catch(() => img.remove());
  });
}
function mediaKind(item) {
  if (item.fileId) return /^audio\//.test(item.fileType || '') ? 'file-audio' : 'file-video';
  return parseMedia(item.url).platform;
}
PLATFORM_LABEL['file-audio'] = 'Audio importé';
PLATFORM_LABEL['file-video'] = 'Vidéo importée';
PLATFORM_LABEL.audio = 'Audio (lien)';
const allMediaItems = () => [...data.scholars.flatMap(s => s.videos), ...data.reciters.flatMap(r => r.recitations)];

/* Compte d'origine : « @compte » ou lien */
function sourceHTML(src) {
  if (!src) return '';
  const m = String(src).match(/https?:\/\/[^\s]+/);
  if (m) {
    let label = m[0].replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');
    const handle = label.match(/(?:instagram\.com|tiktok\.com|x\.com|twitter\.com|t\.me)\/@?([\w.]+)/i);
    if (handle) label = '@' + handle[1];
    return `<span class="src">Source : <a href="${esc(m[0])}" target="_blank" rel="noopener">${esc(label)}</a></span>`;
  }
  return `<span class="src">Source : <strong>${esc(src)}</strong></span>`;
}

/* Champs communs « fichier ou lien » des formulaires */
function mediaSourceFields(item) {
  return `<div class="src-box">
    <label class="field">Fichier de ton téléphone (vidéo ou audio)
      <input type="file" name="file" accept="video/*,audio/*,.mp3,.m4a,.mov,.mp4"></label>
    ${item.fileId ? `<p class="m current-file">${ic(/^audio/.test(item.fileType || '') ? 'headphones' : 'play')}Fichier actuel : ${esc(item.fileName || '')} · ${fmtSize(item.fileSize || 0)}<br>Choisis un autre fichier pour le remplacer.</p>` : ''}
    <div class="or"><span>ou</span></div>
    <label class="field">Lien (YouTube, Instagram, MP3…) <input name="url" type="url" value="${esc(item.url || '')}" placeholder="https://…"></label>
  </div>
  <label class="field">Compte d'origine <input name="source" value="${esc(item.source || '')}" placeholder="Ex. @nom_du_compte ou lien du compte"></label>`;
}
async function readMediaSource(fd, item) {
  const file = fd.get('file');
  const url = String(fd.get('url') || '').trim();
  const out = { source: String(fd.get('source') || '').trim() };
  if (file && file.size) {
    const stored = await storeUpload(file);
    if (item && item.fileId) await removeFiles(item);
    return { ...out, ...stored, url: '' };
  }
  if (url) {
    if (item && item.fileId) await removeFiles(item);
    return { ...out, url, fileId: null, posterId: null, fileName: '', fileType: '', fileSize: 0, vertical: false };
  }
  if (item && item.fileId) return out;
  return null;
}
async function saveMediaForm(fd, item, apply) {
  try {
    const src = await readMediaSource(fd, item);
    if (!src) { toast('Choisis un fichier ou colle un lien'); return false; }
    apply(src);
    save();
    return true;
  } catch (e) {
    toast(e && e.name === 'QuotaExceededError' ? "Plus assez d'espace sur le téléphone pour ce fichier" : "Impossible d'enregistrer ce fichier");
    return false;
  }
}

/* ---------- Récitateurs ---------- */
const reciterById = (id) => data.reciters.find(r => r.id === id);
function recitationsOfSurah(n) {
  return data.reciters.flatMap(r => r.recitations.filter(x => +x.surah === n).map(x => ({ rec: x, r })));
}
const recTitle = (x) => x.title || (x.surah ? `${x.surah}. ${S(+x.surah).fr}` : 'Récitation');

/* ---------- Hadiths ---------- */
const GRADES = { sahih: 'Ṣaḥīḥ', hasan: 'Ḥasan', daif: 'Ḍaʿīf', mawdu: 'Mawḍūʿ', unknown: 'À vérifier' };
const gradeClass = (g) => (g === 'sahih' || g === 'hasan') ? 'ok' : (g === 'daif' || g === 'mawdu') ? 'bad' : 'neutral';
const gradeBadge = (g) => `<span class="pill pill-${gradeClass(g || 'unknown')}">${GRADES[g] || GRADES.unknown}</span>`;
const hadithById = (id) => data.hadiths.find(h => h.id === id);

/* ---------- Savants ---------- */
const themeKey = (t) => String(t || '').trim().toLowerCase();
function themesOf(videos) {
  const map = new Map();
  videos.forEach(v => {
    const k = themeKey(v.theme); if (!k) return;
    if (!map.has(k)) map.set(k, { key: k, label: v.theme.trim(), count: 0 });
    map.get(k).count++;
  });
  return [...map.values()].sort((a, b) => a.label.localeCompare(b.label, 'fr'));
}
const allVideos = () => data.scholars.flatMap(sc => sc.videos.map(v => ({ v, sc })));
const allThemes = () => themesOf(allVideos().map(x => x.v));
function themeSuggestions(extra = []) {
  const set = new Map();
  [...extra, ...allThemes().map(t => t.label), ...DEFAULT_THEMES].forEach(t => { if (t && !set.has(themeKey(t))) set.set(themeKey(t), t); });
  return [...set.values()];
}
function seal(p) {
  if (p.nameAr) {
    const words = p.nameAr.trim().split(/\s+/).filter(w => !/^(الشيخ|العلامة|الإمام|القارئ|ابن|أبو|بن)$/.test(w));
    const last = words[words.length - 1] || p.nameAr;
    return `<span lang="ar">${esc(last.replace(/^ال/, '').charAt(0))}</span>`;
  }
  const words = String(p.name || '?').split(/\s+/).filter(w => !/^(shaykh|cheikh|sheikh|al|el|ibn|abu|abū)$/i.test(w));
  return esc((words[words.length - 1] || '?').charAt(0).toUpperCase());
}

/* ---------- Livres & éditions ---------- */
const BOOK_STATUS = { toread: 'À lire', reading: 'En cours', read: 'Lu' };
const BOOK_PILL = { toread: 'neutral', reading: 'accent', read: 'ok' };
const VERDICTS = { ok: 'Fiable', warn: 'Avec prudence', bad: 'À éviter' };
const VERDICT_PILL = { ok: 'ok', warn: 'warn', bad: 'bad' };
const findPublisher = (name) => { const k = norm(name); return k ? data.publishers.find(p => norm(p.name) === k) : null; };
function publisherLabel(name) {
  if (!name) return '';
  const p = findPublisher(name);
  return p ? `<span class="pill pill-${VERDICT_PILL[p.verdict]} pub-pill">${esc(p.name)}<i>·</i>${VERDICTS[p.verdict]}</span>` : `<span class="pill pub-pill">${esc(name)}</span>`;
}

/* =========================================================
   Gabarits
   ========================================================= */
function hero({ fr, ar, sub = '', actions = '', extra = '', back = '', arLine = '' }) {
  return `<section class="hero"><div class="hero-in">
    ${back}
    <div class="hero-title"><div class="hero-txt"><h1>${fr}</h1>${arLine ? `<p class="hero-name-ar" lang="ar" dir="rtl">${arLine}</p>` : ''}${sub ? `<p class="hero-sub">${sub}</p>` : ''}</div>
      <span class="hero-ar" lang="ar" aria-hidden="true">${ar}</span></div>
    ${extra}
    ${actions ? `<div class="hero-actions">${actions}</div>` : ''}
  </div></section>`;
}
const content = (html) => `<div class="content"><div class="content-in">${html}</div></div>`;
function chips(items, current, action) {
  return `<div class="chips" role="tablist">${items.map(([k, label, count]) =>
    `<button class="chip ${current === k ? 'on' : ''}" role="tab" aria-selected="${current === k}" data-action="${action}" data-key="${esc(k)}">${esc(label)}${count !== undefined ? `<span class="count">${count}</span>` : ''}</button>`).join('')}</div>`;
}
function seg(items, current, action) {
  return `<div class="seg" role="tablist">${items.map(([k, label]) =>
    `<button class="${current === k ? 'on' : ''}" role="tab" aria-selected="${current === k}" data-action="${action}" data-key="${esc(k)}">${esc(label)}</button>`).join('')}</div>`;
}
const searchBox = (key, value, ph) => `<label class="search">${ic('search')}<input type="search" data-input="${key}" value="${esc(value)}" placeholder="${ph}" aria-label="${ph}"></label>`;
const emptyBox = (title, text, action, label) => `<div class="empty"><p class="empty-t">${title}</p>${text ? `<p class="empty-d">${text}</p>` : ''}${action ? `<button class="btn primary" data-action="${action}">${ic('plus')}${label}</button>` : ''}</div>`;
const btnHero = (action, label, icon = 'plus', attrs = '') => `<button class="btn on-dark" data-action="${action}" ${attrs}>${ic(icon)}${label}</button>`;

/* =========================================================
   Accueil
   ========================================================= */
function renderHome() {
  const st = quranStats();
  const bm = data.quran.bookmark;
  const str = streak();
  const dueSurahs = [];
  for (let n = 1; n <= 114; n++) if (needsRevision(n)) dueSurahs.push(n);
  const age = (o) => { const d = daysSince(o.lastRevision); return d === Infinity ? 1e9 : d; };
  const due = [
    ...dueSurahs.map(n => ({ kind: 's', n, o: sState(n) })),
    ...data.hadiths.filter(isDue).map(h => ({ kind: 'h', h, o: h }))
  ].sort((a, b) => age(b.o) - age(a.o));

  const reading = data.books.filter(b => b.status === 'reading');
  const nbRead = data.books.filter(b => b.status === 'read').length;
  const nbHadiths = data.hadiths.filter(h => h.status === 'memorized').length;
  const nbRec = data.reciters.reduce((s, r) => s + r.recitations.length, 0);
  const hasData = Object.keys(data.quran.surahs).length || data.books.length || allVideos().length || data.publishers.length || data.hadiths.length > 1 || nbRec;
  const backupWarn = hasData && daysSince(data.settings.lastExport) > 30;

  const greg = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
  let hijri = '';
  try { hijri = new Intl.DateTimeFormat('ar-SA-u-ca-islamic-umalqura', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date()); } catch (e) { /* calendrier indisponible */ }

  const cells = Array.from({ length: 114 }, (_, i) => {
    const n = i + 1, c = markClass(sState(n));
    return `<button class="cell c-${c}" data-action="open-surah" data-n="${n}" title="${n}. ${S(n).fr}" aria-label="${n}. ${S(n).fr} — ${MARK_LABEL[c]}"></button>`;
  }).join('');

  const heroHTML = `<section class="hero home"><div class="hero-in">
    <div class="home-dates"><span>${esc(greg)}</span>${hijri ? `<span lang="ar" dir="rtl">${esc(hijri)}</span>` : ''}</div>
    <h1 class="home-greet">As-salāmu ʿalaykum</h1>
    <div class="map-wrap">
      <div class="map-head">
        <div class="map-pct">${pctLabel(st.pct)}<small>%</small></div>
        <div class="map-meta"><strong>du Coran mémorisé</strong><span>${st.ayahs} versets sur ${TOTAL_AYAHS} · ${plural(st.mem, 'sourate')}</span></div>
      </div>
      <div class="map" role="group" aria-label="Carte des 114 sourates">${cells}</div>
      ${legend('on-dark')}
    </div>
  </div></section>`;

  const dueHTML = due.length ? `<ul class="group">${due.slice(0, 6).map(x => x.kind === 's' ? `
      <li class="row"><span class="row-ico ico-red">${ic('quran')}</span>
        <button class="grow plain" data-action="open-surah" data-n="${x.n}"><span class="t">${x.n}. ${S(x.n).fr}</span><span class="m">${ago(x.o.lastRevision)}</span></button>
        <button class="btn small" data-action="revise" data-n="${x.n}">${ic('check')}Révisée</button></li>` : `
      <li class="row"><span class="row-ico ico-red">${ic('hadith')}</span>
        <button class="grow plain" data-action="open-hadith" data-id="${x.h.id}"><span class="t clamp1">${esc(x.h.fr || x.h.ar || 'Hadith')}</span><span class="m">Hadith · ${ago(x.o.lastRevision)}</span></button>
        <button class="btn small" data-action="revise-hadith" data-id="${x.h.id}">${ic('check')}Révisé</button></li>`).join('')}</ul>
      ${due.length > 6 ? `<p class="m pad">et ${due.length - 6} autre(s) à réviser</p>` : ''}`
    : `<div class="card soft"><p class="m">${st.mem || nbHadiths ? 'Tout est à jour. Bārak Allāhu fīk.' : 'Indique ce que tu as mémorisé dans Coran et Hadiths : tes révisions apparaîtront ici.'}</p></div>`;

  return heroHTML + content(`
    ${backupWarn ? `<a class="notice" href="#/reglages">Pense à sauvegarder tes données : Réglages → Exporter.</a>` : ''}
    ${HOME_CARDS.map(f => { try { return f(); } catch (e) { console.error(e); return ''; } }).join('')}
    <div class="home-grid">
      <div>
        <section class="card bm-card">
          <div class="card-k">${ic('bookmark')}Point d'arrêt</div>
          ${bm ? `<div class="bm">
              <span class="bm-ar" lang="ar">${S(bm.surah).ar}</span>
              <div class="bm-txt"><strong>${bm.surah}. ${S(bm.surah).fr}</strong><span class="m">Verset ${bm.ayah} sur ${S(bm.surah).ayahs} · ${fmtDate(bm.date)}</span></div>
            </div>
            <div class="row-actions">
              <a class="btn primary" href="#/lire/${bm.surah}/${bm.ayah}">${ic('quran')}Reprendre la lecture</a>
              <button class="btn" data-action="edit-bookmark">Modifier</button>
              ${recitationsOfSurah(bm.surah).length ? `<button class="btn" data-action="listen-surah" data-n="${bm.surah}">${ic('headphones')}Écouter</button>` : ''}
            </div>`
      : `<p class="m">Enregistre l'endroit où tu t'es arrêté pour le retrouver en un geste.</p><div class="row-actions"><button class="btn primary" data-action="edit-bookmark">Définir</button></div>`}
        </section>

        <section class="stats">
          <a class="stat" href="#/coran"><strong>${st.mem}</strong><span>sourates</span></a>
          <a class="stat" href="#/hadiths"><strong>${nbHadiths}</strong><span>hadiths appris</span></a>
          <a class="stat" href="#/bibliotheque"><strong>${nbRead}</strong><span>${nbRead > 1 ? 'livres lus' : 'livre lu'}</span></a>
          <div class="stat"><strong>${str}</strong><span>${str > 1 ? "jours d'affilée" : "jour d'affilée"}</span></div>
        </section>
      </div>
      <div>
        <section class="block">
          <div class="block-head"><h2>À réviser</h2><span class="m">tous les ${data.settings.revisionDays} jours</span></div>
          ${dueHTML}
        </section>
        ${reading.length ? `
        <section class="block">
          <div class="block-head"><h2>Lectures en cours</h2><a class="m" href="#/bibliotheque">Tout voir</a></div>
          <ul class="group">${reading.map(b => `<li><button class="row plain" data-action="open-book" data-id="${b.id}"><span class="row-ico">${ic('library')}</span><span class="grow"><span class="t">${esc(b.title)}</span>${b.author ? `<span class="m">${esc(b.author)}</span>` : ''}</span>${ic('chevron', 'chev')}</button></li>`).join('')}</ul>
        </section>` : ''}
      </div>
    </div>

    <section class="verse">
      <p class="verse-ar" lang="ar" dir="rtl">قُلْ يَا عِبَادِيَ الَّذِينَ أَسْرَفُوا عَلَىٰ أَنفُسِهِمْ لَا تَقْنَطُوا مِن رَّحْمَةِ اللَّهِ ۚ إِنَّ اللَّهَ يَغْفِرُ الذُّنُوبَ جَمِيعًا</p>
      <p class="verse-fr">Sens : « Dis : Ô Mes serviteurs qui avez commis des excès à votre propre détriment, ne désespérez pas de la miséricorde d'Allah. Allah pardonne tous les péchés. »</p>
      <p class="verse-ref">Az-Zumar · 39:53</p>
    </section>`);
}

/* =========================================================
   Coran : sourates + récitateurs
   ========================================================= */
function renderQuran() {
  const st = quranStats();
  const nbRec = data.reciters.reduce((s, r) => s + r.recitations.length, 0);
  const actions = ui.quranTab === 'sourates'
    ? btnHero('edit-bookmark', "Point d'arrêt", 'bookmark') + btnHero('toggle-sort', data.settings.sortReverse ? '114 → 1' : '1 → 114', 'sort')
    : btnHero('add-reciter', 'Récitateur');
  return hero({
    fr: 'Coran', ar: 'القرآن',
    sub: ui.quranTab === 'sourates' ? `${plural(st.mem, 'sourate')} · ${st.ayahs} versets sur ${TOTAL_AYAHS} · ${st.pct.toFixed(1)} %` : `${plural(data.reciters.length, 'récitateur')} · ${plural(nbRec, 'récitation')}`,
    extra: seg([['sourates', 'Sourates'], ['recitateurs', 'Récitateurs']], ui.quranTab, 'quran-tab'),
    actions
  }) + content(ui.quranTab === 'sourates' ? surahsView() : recitersView());
}
function surahsView() {
  const st = quranStats();
  const counts = { all: 114, memorized: 0, learning: 0, revision: st.toRev, none: 0 };
  for (let n = 1; n <= 114; n++) counts[sState(n).status]++;
  return `
    ${searchBox('surah-query', ui.surahQuery, 'Nom ou numéro de sourate')}
    ${chips([['all', 'Toutes', counts.all], ['memorized', 'Mémorisées', counts.memorized], ['learning', 'En cours', counts.learning], ['revision', 'À réviser', counts.revision], ['none', 'Pas commencées', counts.none]], ui.surahFilter, 'surah-filter')}
    <ul class="group cols" id="surah-list">${surahListHTML()}</ul>`;
}
function surahListHTML() {
  const q = norm(ui.surahQuery), raw = ui.surahQuery.trim();
  let ns = Array.from({ length: 114 }, (_, i) => i + 1);
  if (data.settings.sortReverse) ns.reverse();
  ns = ns.filter(n => {
    const s = sState(n), f = ui.surahFilter;
    const statusOk = f === 'all' || (f === 'revision' ? needsRevision(n) : s.status === f);
    const queryOk = !raw || norm(S(n).fr).includes(q) || S(n).ar.includes(raw) || String(n) === raw;
    return statusOk && queryOk;
  });
  if (!ns.length) return `<li class="row m">Aucune sourate ici.</li>`;
  return ns.map(n => {
    const s = sState(n), info = S(n);
    let meta = `${info.ayahs} versets`;
    if (s.status === 'learning') meta += ` · verset ${s.ayah}`;
    if (s.status === 'memorized') meta += ` · ${ago(s.lastRevision)}`;
    const hasRec = recitationsOfSurah(n).length;
    return `<li><a class="row plain" href="#/lire/${n}">
      <span class="num">${n}</span>
      <span class="grow"><span class="t">${info.fr}${hasRec ? ` <span class="rec-dot" title="Récitation disponible">${ic('headphones')}</span>` : ''}</span><span class="m">${meta}</span>
        ${s.status === 'learning' ? `<span class="mini"><span style="width:${Math.round(s.ayah / info.ayahs * 100)}%"></span></span>` : ''}</span>
      <span class="ar-name" lang="ar">${info.ar}</span>
      ${mark(s)}
    </a></li>`;
  }).join('');
}
function openSurah(n) {
  const s = sState(n), info = S(n);
  const recs = recitationsOfSurah(n);
  const opts = [['none', 'Pas commencée'], ['learning', 'En cours'], ['memorized', 'Mémorisée']]
    .map(([k, l]) => `<option value="${k}" ${s.status === k ? 'selected' : ''}>${l}</option>`).join('');
  openModal(`${n}. ${info.fr}`, `
    <div class="sheet-hero"><p class="sheet-ar" lang="ar">سورة ${info.ar}</p>
      <p class="m">${info.ayahs} versets · ${s.lastRevision ? `dernière révision le ${fmtDate(s.lastRevision)}` : 'jamais révisée'}</p></div>
    <div class="two">
      <label class="field">Statut <select name="status">${opts}</select></label>
      <label class="field">Jusqu'au verset <input type="number" name="ayah" min="0" max="${info.ayahs}" inputmode="numeric" value="${s.status === 'memorized' ? info.ayahs : s.ayah}"></label>
    </div>
    <label class="field">Notes : passages difficiles, confusions <textarea name="notes" rows="3">${esc(s.notes)}</textarea></label>
    <div class="row-actions">
      ${s.status !== 'none' ? `<button type="button" class="btn primary" data-action="revise" data-n="${n}" data-close="1">${ic('check')}Révisée aujourd'hui</button>` : ''}
      <button type="button" class="btn" data-action="bookmark-here" data-n="${n}">${ic('bookmark')}Point d'arrêt ici</button>
      <a class="btn" href="#/lire/${n}">${ic('quran')}Lire la sourate</a>
    </div>
    ${recs.length ? `<h3>Récitations</h3><ul class="group">${recs.map(({ rec, r }) => recRow(rec, r, true)).join('')}</ul>` : ''}`,
    (fd) => {
      let status = fd.get('status');
      let ayah = clamp(parseInt(fd.get('ayah'), 10) || 0, 0, info.ayahs);
      if (status === 'none' && ayah > 0) status = 'learning';
      if (status === 'learning' && ayah >= info.ayahs) status = 'memorized';
      if (status === 'memorized') ayah = info.ayahs;
      if (status === 'none') ayah = 0;
      const patch = { status, ayah, notes: fd.get('notes').trim() };
      if (status === 'memorized' && s.status !== 'memorized') {
        addLog(n, 'memo');
        if (!s.lastRevision) patch.lastRevision = todayISO();
        toast(`Bārak Allāhu fīk ! ${info.fr} mémorisée`);
      } else if (status === 'learning' && ayah > s.ayah) addLog(n, 'memo');
      setS(n, patch);
    });
}
function openBookmark() {
  const bm = data.quran.bookmark || { surah: 1, ayah: 1 };
  const opts = SURAHS.map((x, i) => `<option value="${i + 1}" ${bm.surah === i + 1 ? 'selected' : ''}>${i + 1}. ${x[0]} — ${x[1]}</option>`).join('');
  openModal("Point d'arrêt", `
    <p class="m">Là où tu t'es arrêté, en lecture ou en mémorisation.</p>
    <label class="field">Sourate <select name="surah" data-input="bm-surah">${opts}</select></label>
    <label class="field">Verset <input type="number" name="ayah" min="1" max="${S(bm.surah).ayahs}" value="${bm.ayah}" inputmode="numeric"></label>`,
    (fd) => {
      const surah = clamp(parseInt(fd.get('surah'), 10) || 1, 1, 114);
      const ayah = clamp(parseInt(fd.get('ayah'), 10) || 1, 1, S(surah).ayahs);
      data.quran.bookmark = { surah, ayah, date: todayISO() };
      save(); toast("Point d'arrêt enregistré");
    });
}
function revise(n) {
  setS(n, { lastRevision: todayISO() });
  addLog(n, 'revision'); save();
  toast(`${S(n).fr} révisée`);
}

/* ---------- Récitateurs ---------- */
function recitersView() {
  if (!data.reciters.length) return emptyBox('Aucun récitateur pour l\'instant',
    'Ajoute tes récitateurs, puis leurs récitations : une vidéo ou un audio de ton téléphone, ou un lien YouTube, Instagram ou MP3.',
    'add-reciter', 'Ajouter un récitateur');
  return `<ul class="group">${data.reciters.map(r => `<li><a class="row plain" href="#/recitateurs/${r.id}">
      <span class="seal">${seal(r)}</span>
      <span class="grow"><span class="t">${esc(r.name)}</span>
        ${r.nameAr ? `<span class="sub-ar" lang="ar">${esc(r.nameAr)}</span>` : ''}
        <span class="m">${plural(r.recitations.length, 'récitation')}${r.riwaya ? ` · ${esc(r.riwaya)}` : ''}</span></span>
      ${ic('chevron', 'chev')}
    </a></li>`).join('')}</ul>`;
}
function recRow(rec, r, showReciter) {
  const k = mediaKind(rec);
  const playing = player.current && player.current.id === rec.id && !player.audio.paused;
  const isVideo = k === 'file-video' || k === 'youtube' || k === 'instagram';
  return `<li class="row rec">
    <button class="play-round${playing ? ' is-playing' : ''}${isVideo ? ' is-video' : ''}" data-action="play-item" data-kind="reciter" data-oid="${r.id}" data-id="${rec.id}" aria-label="Lire">${ic(playing ? 'pause' : 'play')}</button>
    <span class="grow"><span class="t">${esc(recTitle(rec))}</span>
      <span class="m">${showReciter ? `${esc(r.name)} · ` : ''}${PLATFORM_LABEL[k]}${rec.notes ? ` · ${esc(rec.notes)}` : ''}</span>
      ${rec.source ? sourceHTML(rec.source) : ''}</span>
    ${rec.surah && !showReciter ? `<span class="ar-name sm" lang="ar">${S(+rec.surah).ar}</span>` : ''}
    <button class="icon-btn" data-action="edit-rec" data-rid="${r.id}" data-id="${rec.id}" aria-label="Modifier">${ic('edit')}</button>
  </li>`;
}
function renderReciter(id) {
  const r = reciterById(id);
  if (!r) return hero({ fr: 'Introuvable', ar: 'القارئ', back: `<a class="hero-back" href="#/coran" data-action="go-reciters">${ic('back')}Récitateurs</a>` }) + content(emptyBox('Ce récitateur n\'existe plus.'));
  const recs = [...r.recitations].sort((a, b) => (+a.surah || 999) - (+b.surah || 999));
  return hero({
    fr: esc(r.name), ar: 'القارئ', arLine: r.nameAr ? esc(r.nameAr) : '',
    sub: [plural(r.recitations.length, 'récitation'), r.riwaya && esc(r.riwaya)].filter(Boolean).join(' · '),
    back: `<a class="hero-back" href="#/coran" data-action="go-reciters">${ic('back')}Récitateurs</a>`,
    actions: btnHero('add-rec', 'Récitation', 'plus', `data-id="${r.id}"`) + btnHero('edit-reciter', 'Modifier', 'edit', `data-id="${r.id}"`)
  }) + content(`
    ${r.bio ? `<p class="lead">${linkify(r.bio)}</p>` : ''}
    ${recs.length ? `<ul class="group">${recs.map(x => recRow(x, r, false)).join('')}</ul>`
      : emptyBox('Aucune récitation', 'Importe une vidéo ou un audio de ton téléphone, ou colle un lien, et associe-le à une sourate.', 'add-rec-here', 'Ajouter une récitation')}`);
}
function reciterForm(id) {
  const r = id ? reciterById(id) : { name: '', nameAr: '', riwaya: '', bio: '' };
  openModal(id ? 'Modifier le récitateur' : 'Nouveau récitateur', `
    <label class="field">Nom <input name="name" required value="${esc(r.name)}" placeholder="Ex. Shaykh Muḥammad Ayyūb"></label>
    <label class="field">Nom en arabe <input name="nameAr" dir="rtl" lang="ar" value="${esc(r.nameAr)}"></label>
    <label class="field">Lecture (riwāya) <input name="riwaya" list="riwayat" value="${esc(r.riwaya || '')}" placeholder="Ex. Ḥafṣ ʿan ʿĀṣim">
      <datalist id="riwayat"><option value="Ḥafṣ ʿan ʿĀṣim"><option value="Warsh ʿan Nāfiʿ"><option value="Qālūn ʿan Nāfiʿ"><option value="Ad-Dūrī ʿan Abī ʿAmr"></datalist></label>
    <label class="field">Présentation et comptes <textarea name="bio" rows="3">${esc(r.bio)}</textarea></label>`,
    (fd) => {
      const obj = Object.fromEntries(['name', 'nameAr', 'riwaya', 'bio'].map(k => [k, String(fd.get(k) || '').trim()]));
      if (!obj.name) return false;
      if (id) Object.assign(r, obj);
      else { const nr = { id: uid(), recitations: [], ...obj }; data.reciters.push(nr); setTimeout(() => { location.hash = `#/recitateurs/${nr.id}`; }, 0); }
      save();
    }, { focus: true, danger: id ? `<button type="button" class="btn danger" data-action="del-reciter" data-id="${id}">Supprimer</button>` : '' });
}
function recForm(rid, recId) {
  const r = reciterById(rid); if (!r) return;
  const rec = recId ? r.recitations.find(x => x.id === recId) : { url: '', surah: '', title: '', notes: '', source: '' };
  const sOpts = `<option value="">— Plusieurs sourates / autre —</option>` + SURAHS.map((x, i) => `<option value="${i + 1}" ${+rec.surah === i + 1 ? 'selected' : ''}>${i + 1}. ${x[0]}</option>`).join('');
  openModal(recId ? 'Modifier la récitation' : 'Nouvelle récitation', `
    <p class="m">${esc(r.name)}</p>
    ${mediaSourceFields(rec)}
    <label class="field">Sourate <select name="surah">${sOpts}</select></label>
    <label class="field">Titre (facultatif) <input name="title" value="${esc(rec.title)}" placeholder="Par défaut : le nom de la sourate"></label>
    <label class="field">Note (facultatif) <input name="notes" value="${esc(rec.notes)}" placeholder="Ex. prière de tarāwīḥ 1445"></label>`,
    (fd) => saveMediaForm(fd, recId ? rec : null, (src) => {
      const obj = { ...src, surah: fd.get('surah') ? +fd.get('surah') : '', title: fd.get('title').trim(), notes: fd.get('notes').trim() };
      if (recId) Object.assign(rec, obj); else r.recitations.push({ id: uid(), addedAt: todayISO(), ...obj });
    }), { danger: recId ? `<button type="button" class="btn danger" data-action="del-rec" data-rid="${rid}" data-id="${recId}">Supprimer</button>` : '' });
}

/* ---------- Lecture (audio, vidéos importées, liens) ---------- */
const player = { audio: new Audio(), current: null };
player.audio.preload = 'none';
function findItem(kind, oid, id) {
  const owner = (kind === 'reciter' ? data.reciters : data.scholars).find(x => x.id === oid);
  if (!owner) return {};
  return { owner, item: (kind === 'reciter' ? owner.recitations : owner.videos).find(x => x.id === id) };
}
async function playItem(kind, oid, id) {
  const { owner, item } = findItem(kind, oid, id);
  if (!item) return;
  const k = mediaKind(item);
  const title = kind === 'reciter' ? recTitle(item) : (item.title || 'Sans titre');
  if (k === 'youtube' || k === 'instagram') {
    const p = parseMedia(item.url);
    if (!player.audio.paused) player.audio.pause();
    openModal(title, `<p class="m">${esc(owner.name)}</p><div class="modal-media${p.vertical || p.platform === 'instagram' ? ' vertical' : ''}"><iframe src="${esc(embedSrc(p))}" title="Vidéo" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe></div>
      ${item.source ? `<p>${sourceHTML(item.source)}</p>` : ''}
      <div class="row-actions"><a class="btn" href="${esc(item.url)}" target="_blank" rel="noopener">Ouvrir sur ${PLATFORM_LABEL[p.platform]} ${ic('external')}</a></div>`);
    return;
  }
  if (k === 'link') { window.open(item.url, '_blank', 'noopener'); return; }
  if (k === 'file-video') {
    let u;
    try { u = await fileURL(item.fileId); } catch (e) { toast('Fichier introuvable sur cet appareil'); return; }
    if (!player.audio.paused) player.audio.pause();
    openModal(title, `<p class="m">${esc(owner.name)}</p>
      <div class="modal-media file${item.vertical ? ' vertical' : ''}"><video src="${u}" controls playsinline autoplay></video></div>
      ${item.source ? `<p>${sourceHTML(item.source)}</p>` : ''}`);
    return;
  }
  if (player.current && player.current.id === id) { togglePlay(); return; }
  let src = item.url;
  if (k === 'file-audio') {
    try { src = await fileURL(item.fileId); } catch (e) { toast('Fichier introuvable sur cet appareil'); return; }
  }
  player.current = {
    id, oid, title, artist: owner.name,
    ar: kind === 'reciter' && item.surah ? S(+item.surah).ar : '',
    href: kind === 'reciter' ? `#/recitateurs/${owner.id}` : `#/savants/${owner.id}`
  };
  player.audio.src = src;
  player.audio.play().catch(() => toast('Lecture impossible : vérifie que le lien mène bien à un fichier audio'));
  try {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({ title, artist: owner.name, album: 'Turath', artwork: [{ src: 'icon-512.png', sizes: '512x512', type: 'image/png' }] });
      navigator.mediaSession.setActionHandler('play', () => player.audio.play());
      navigator.mediaSession.setActionHandler('pause', () => player.audio.pause());
    }
  } catch (e) { /* non pris en charge */ }
  renderPlayer();
}
function togglePlay() { if (!player.current) return; player.audio.paused ? player.audio.play() : player.audio.pause(); }
function renderPlayer() {
  const el = $('#player');
  if (!player.current) { el.hidden = true; document.body.classList.remove('has-player'); return; }
  const c = player.current;
  el.hidden = false; document.body.classList.add('has-player');
  el.innerHTML = `
    <div class="pl-bar"><span id="pl-progress"></span></div>
    <div class="pl-in">
      <button class="pl-btn" data-action="toggle-play" aria-label="${player.audio.paused ? 'Lecture' : 'Pause'}">${ic(player.audio.paused ? 'play' : 'pause')}</button>
      <a class="pl-txt" href="${c.href}"><span class="t">${esc(c.title)}</span><span class="m"><span id="pl-time">${fmtTime(player.audio.currentTime)}</span> · ${esc(c.artist)}</span></a>
      ${c.ar ? `<span class="pl-ar" lang="ar">${c.ar}</span>` : ''}
      <button class="pl-close" data-action="stop-player" aria-label="Fermer le lecteur">${ic('close')}</button>
    </div>`;
  updateProgress();
}
function updateProgress() {
  const a = player.audio, bar = $('#pl-progress'), t = $('#pl-time');
  if (bar) bar.style.width = a.duration ? `${(a.currentTime / a.duration) * 100}%` : '0';
  if (t) t.textContent = a.duration ? `${fmtTime(a.currentTime)} / ${fmtTime(a.duration)}` : fmtTime(a.currentTime);
}
player.audio.addEventListener('timeupdate', updateProgress);
['play', 'pause', 'ended'].forEach(ev => player.audio.addEventListener(ev, () => { renderPlayer(); refreshPlayButtons(); }));
player.audio.addEventListener('error', () => { if (player.current && !player.current.quran && player.audio.getAttribute('src')) toast('Ce fichier audio ne se charge pas'); });
function refreshPlayButtons() {
  document.querySelectorAll('.play-round').forEach(b => {
    const on = player.current && player.current.id === b.dataset.id && !player.audio.paused;
    b.classList.toggle('is-playing', !!on);
    b.innerHTML = ic(on ? 'pause' : 'play');
  });
}

/* =========================================================
   Hadiths
   ========================================================= */
function renderHadiths() {
  const c = { all: data.hadiths.length, memorized: 0, learning: 0, revision: data.hadiths.filter(isDue).length, none: 0 };
  data.hadiths.forEach(h => c[h.status || 'none']++);
  return hero({
    fr: 'Hadiths', ar: 'الحديث', back: `<a class="hero-back" href="#/science">${ic('back')}Science</a>`,
    sub: `${plural(c.all, 'hadith')} · ${c.memorized} appris`,
    actions: btnHero('add-hadith', 'Hadith')
  }) + content(`
    ${searchBox('hadith-query', ui.hadithQuery, 'Texte, rapporteur, source, thème')}
    ${chips([['all', 'Tous', c.all], ['memorized', 'Appris', c.memorized], ['learning', 'En cours', c.learning], ['revision', 'À réviser', c.revision], ['none', 'À apprendre', c.none]], ui.hadithFilter, 'hadith-filter')}
    <div id="hadith-list" class="hadiths">${hadithListHTML()}</div>`);
}
function hadithListHTML() {
  if (!data.hadiths.length) return emptyBox('Aucun hadith', 'Ajoute les hadiths que tu veux apprendre ou retenir, avec leur source et leur authenticité.', 'add-hadith', 'Ajouter un hadith');
  const q = norm(ui.hadithQuery);
  const list = data.hadiths.filter(h => {
    const f = ui.hadithFilter;
    const ok = f === 'all' || (f === 'revision' ? isDue(h) : (h.status || 'none') === f);
    return ok && (!q || norm(`${h.ar} ${h.fr} ${h.narrator} ${h.source} ${h.theme}`).includes(q));
  });
  if (!list.length) return `<p class="m pad">Aucun hadith ici.</p>`;
  return list.map(h => `<button class="h-card" data-action="open-hadith" data-id="${h.id}">
    <span class="h-top">${gradeBadge(h.grade)}${h.theme ? `<span class="tag">${esc(h.theme)}</span>` : ''}<span class="spacer"></span>${mark(h)}</span>
    ${h.ar ? `<span class="h-ar" lang="ar">${esc(h.ar)}</span>` : ''}
    ${h.fr ? `<span class="h-fr">${esc(h.fr)}</span>` : ''}
    <span class="m">${[h.narrator && `D'après ${esc(h.narrator)}`, h.source && esc(h.source)].filter(Boolean).join(' · ')}</span>
  </button>`).join('');
}
function openHadith(id) {
  const h = hadithById(id); if (!h) return;
  openModal('Hadith', `
    ${h.narrator ? `<p class="m">D'après ${esc(h.narrator)}</p>` : ''}
    ${h.ar ? `<p class="matn" lang="ar">${esc(h.ar)}</p>` : ''}
    ${h.fr ? `<p class="tarjama">${linkify(h.fr)}</p>` : ''}
    <h3>Source et authenticité</h3>
    <p>${gradeBadge(h.grade)} ${h.source ? esc(h.source) : '<span class="m">Source non renseignée</span>'}</p>
    ${h.gradedBy ? `<p class="m">${linkify(h.gradedBy)}</p>` : ''}
    ${h.theme ? `<p><span class="tag">${esc(h.theme)}</span></p>` : ''}
    ${h.notes ? `<h3>Explication et bénéfices</h3><p>${linkify(h.notes)}</p>` : ''}
    <p class="m" style="margin-top:16px">${MARK_LABEL[markClass(h)]} · ${h.lastRevision ? `dernière révision le ${fmtDate(h.lastRevision)}` : 'jamais révisé'}</p>
    <div class="row-actions">
      ${h.status !== 'memorized' ? `<button type="button" class="btn primary" data-action="learn-hadith" data-id="${h.id}">${ic('check')}Je l'ai appris</button>` : `<button type="button" class="btn primary" data-action="revise-hadith" data-id="${h.id}" data-close="1">${ic('check')}Révisé aujourd'hui</button>`}
      <button type="button" class="btn" data-action="edit-hadith" data-id="${h.id}">${ic('edit')}Modifier</button>
    </div>`);
}
function hadithForm(id) {
  const h = id ? hadithById(id) : { ar: '', fr: '', narrator: '', source: '', grade: 'unknown', gradedBy: '', theme: '', notes: '', status: 'none' };
  const gOpts = Object.entries(GRADES).map(([k, l]) => `<option value="${k}" ${h.grade === k ? 'selected' : ''}>${l}</option>`).join('');
  const sOpts = [['none', 'À apprendre'], ['learning', 'En cours'], ['memorized', 'Appris']].map(([k, l]) => `<option value="${k}" ${(h.status || 'none') === k ? 'selected' : ''}>${l}</option>`).join('');
  const themes = themeSuggestions(data.hadiths.map(x => x.theme));
  openModal(id ? 'Modifier le hadith' : 'Nouveau hadith', `
    <label class="field">Texte arabe <textarea name="ar" rows="3" lang="ar" dir="rtl">${esc(h.ar)}</textarea></label>
    <label class="field">Traduction du sens <textarea name="fr" rows="3">${esc(h.fr)}</textarea></label>
    <label class="field">Rapporteur (compagnon) <input name="narrator" value="${esc(h.narrator)}" placeholder="Ex. Abū Hurayra"></label>
    <label class="field">Source : recueil et numéro <input name="source" value="${esc(h.source)}" placeholder="Ex. Al-Bukhārī (6502)"></label>
    <div class="two">
      <label class="field">Authenticité <select name="grade">${gOpts}</select></label>
      <label class="field">Statut <select name="status">${sOpts}</select></label>
    </div>
    <label class="field">Authentifié par <input name="gradedBy" value="${esc(h.gradedBy)}" placeholder="Ex. Al-Albānī, Ṣaḥīḥ al-Jāmiʿ (…)"></label>
    <label class="field">Thème <input name="theme" list="h-themes" value="${esc(h.theme)}">
      <datalist id="h-themes">${themes.map(t => `<option value="${esc(t)}">`).join('')}</datalist></label>
    <label class="field">Explication et bénéfices <textarea name="notes" rows="4">${esc(h.notes)}</textarea></label>`,
    (fd) => {
      const obj = Object.fromEntries(['ar', 'fr', 'narrator', 'source', 'grade', 'gradedBy', 'theme', 'notes', 'status'].map(k => [k, String(fd.get(k) || '').trim()]));
      if (!obj.ar && !obj.fr) { toast('Écris au moins le texte arabe ou la traduction'); return false; }
      if (obj.status === 'memorized' && (!id || h.status !== 'memorized')) { obj.lastRevision = todayISO(); addLog(0, 'hadith'); }
      if (id) Object.assign(h, obj); else data.hadiths.unshift({ id: uid(), addedAt: todayISO(), lastRevision: obj.lastRevision || null, ...obj });
      save();
    }, { focus: !id, danger: id ? `<button type="button" class="btn danger" data-action="del-hadith" data-id="${id}">Supprimer</button>` : '' });
}

/* =========================================================
   Savants et étudiants en science
   ========================================================= */
const catOf = (p) => p.category === 'student' ? 'student' : 'scholar';
const lines = (t) => String(t || '').split('\n').map(l => l.trim()).filter(Boolean);
function findPersonByName(name) {
  const k = norm(name);
  return k ? data.scholars.find(p => norm(p.name) === k || (p.nameAr && norm(p.nameAr) === k)) : null;
}
function renderScholars() {
  const tab = ui.scholarTab;
  const nSch = data.scholars.filter(p => catOf(p) === 'scholar').length;
  const nStu = data.scholars.length - nSch;
  const isStu = tab === 'etudiants';
  return hero({
    back: `<a class="hero-back" href="#/science">${ic('back')}Science</a>`,
    fr: isStu ? 'Étudiants' : tab === 'themes' ? 'Par thème' : 'Savants',
    ar: isStu ? 'الطلبة' : 'العلماء',
    sub: `${plural(nSch, 'savant')} · ${plural(nStu, 'étudiant')} · ${plural(allVideos().length, 'média')}`,
    extra: seg([['savants', 'Savants'], ['etudiants', 'Étudiants'], ['themes', 'Thèmes']], tab, 'scholar-tab'),
    actions: isStu ? btnHero('add-student', 'Étudiant') : btnHero('add-scholar', 'Savant')
  }) + content(tab === 'themes' ? themesView() : peopleList(isStu ? 'student' : 'scholar'));
}
function peopleList(cat) {
  const list = data.scholars.filter(p => catOf(p) === cat);
  if (!list.length) return cat === 'student'
    ? emptyBox('Aucun étudiant en science', 'Ajoute les étudiants que tu suis : une mini-biographie, où ils ont étudié, auprès de qui, leurs comptes, leurs vidéos et audios.', 'add-student', 'Ajouter un étudiant')
    : emptyBox('Aucun savant', 'Ajoute les savants dont tu suis les cours.', 'add-scholar', 'Ajouter un savant');
  return `<ul class="group">${list.map(p => {
    const t = lines(p.teachers);
    const meta = cat === 'student' && t.length ? `A étudié auprès de ${esc(t.slice(0, 2).join(', '))}${t.length > 2 ? '…' : ''}` : `${plural(p.videos.length, 'média')} · ${plural(themesOf(p.videos).length, 'thème')}`;
    return `<li><a class="row plain" href="#/savants/${p.id}">
      <span class="seal${cat === 'student' ? ' student' : ''}">${seal(p)}</span>
      <span class="grow"><span class="t">${esc(p.name)}</span>
        ${p.nameAr ? `<span class="sub-ar" lang="ar">${esc(p.nameAr)}</span>` : ''}
        <span class="m clamp1">${meta}</span></span>
      ${ic('chevron', 'chev')}
    </a></li>`;
  }).join('')}</ul>`;
}
function themesView() {
  const themes = allThemes();
  if (!themes.length) return emptyBox('Pas encore de thème', 'Les thèmes apparaissent ici dès que tu ajoutes des vidéos ou audios avec un thème.');
  if (!ui.theme || !themes.find(t => t.key === ui.theme)) ui.theme = themes[0].key;
  const vids = allVideos().filter(x => themeKey(x.v.theme) === ui.theme);
  return `${chips(themes.map(t => [t.key, t.label, t.count]), ui.theme, 'pick-theme')}
  <div class="videos">${vids.map(x => videoCard(x.v, x.sc, true)).join('')}</div>`;
}
function accountHTML(line) {
  const m = line.match(/https?:\/\/[^\s]+/);
  if (!m) return `<li><span class="acc"><span class="acc-k">Compte</span><span class="acc-v">${esc(line)}</span></span></li>`;
  let host = '';
  try { host = new URL(m[0]).hostname.replace(/^www\./, ''); } catch (e) { /* lien mal formé */ }
  const label = /youtu/.test(host) ? 'YouTube' : /instagram/.test(host) ? 'Instagram' : /tiktok/.test(host) ? 'TikTok'
    : /^(t\.me|telegram\.me)$/.test(host) ? 'Telegram' : /^(twitter\.com|x\.com)$/.test(host) ? 'X' : /facebook/.test(host) ? 'Facebook'
    : /soundcloud/.test(host) ? 'SoundCloud' : (host || 'Lien');
  const text = line.replace(m[0], '').trim() || m[0].replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');
  return `<li><a class="acc" href="${esc(m[0])}" target="_blank" rel="noopener"><span class="acc-k">${esc(label)}</span><span class="acc-v">${esc(text)}</span>${ic('external')}</a></li>`;
}
function renderScholar(id) {
  const sc = data.scholars.find(s => s.id === id);
  if (!sc) return hero({ fr: 'Introuvable', ar: 'العلماء', back: `<a class="hero-back" href="#/savants">${ic('back')}Savants</a>` }) + content(emptyBox('Cette personne n\'existe plus.'));
  if (ui.lastScholar !== id) { ui.lastScholar = id; ui.scholarTheme = 'all'; }
  const isStu = catOf(sc) === 'student';
  const themes = themesOf(sc.videos);
  if (ui.scholarTheme !== 'all' && !themes.find(t => t.key === ui.scholarTheme)) ui.scholarTheme = 'all';
  const vids = sc.videos.filter(v => ui.scholarTheme === 'all' || themeKey(v.theme) === ui.scholarTheme);
  const teachers = lines(sc.teachers), accounts = lines(sc.accounts);
  const students = data.scholars.filter(p => p !== sc && lines(p.teachers).some(t => findPersonByName(t) === sc));
  const hasProfile = sc.bio || sc.studies || teachers.length || accounts.length || students.length;
  return hero({
    fr: esc(sc.name), ar: isStu ? 'الطالب' : 'العالم', arLine: sc.nameAr ? esc(sc.nameAr) : '',
    sub: `${isStu ? 'Étudiant en science' : 'Savant'} · ${plural(sc.videos.length, 'média')}`,
    back: `<a class="hero-back" href="#/savants" data-action="${isStu ? 'go-students' : 'go-scholars'}">${ic('back')}${isStu ? 'Étudiants' : 'Savants'}</a>`,
    actions: btnHero('add-video', 'Vidéo ou audio', 'plus', `data-id="${sc.id}"`) + btnHero('edit-scholar', 'Modifier', 'edit', `data-id="${sc.id}"`)
  }) + content(`
    ${hasProfile ? `<section class="card profile-card">
      ${sc.bio ? `<h3>Biographie</h3><p>${linkify(sc.bio)}</p>` : ''}
      ${sc.studies ? `<h3>Parcours et études</h3><p>${linkify(sc.studies)}</p>` : ''}
      ${teachers.length ? `<h3>A étudié auprès de</h3><div class="people-pills">${teachers.map(t => { const m = findPersonByName(t); return m ? `<a class="pill pill-link" href="#/savants/${m.id}">${esc(t)}${ic('chevron')}</a>` : `<span class="pill">${esc(t)}</span>`; }).join('')}</div>` : ''}
      ${students.length ? `<h3>Ses élèves dans ton carnet</h3><div class="people-pills">${students.map(p => `<a class="pill pill-link" href="#/savants/${p.id}">${esc(p.name)}${ic('chevron')}</a>`).join('')}</div>` : ''}
      ${accounts.length ? `<h3>Comptes</h3><ul class="accounts">${accounts.map(accountHTML).join('')}</ul>` : ''}
    </section>` : (isStu ? `<button class="card soft add-bio" data-action="edit-scholar" data-id="${sc.id}">${ic('edit')}Ajoute sa biographie, son parcours, ses enseignants et ses comptes</button>` : '')}
    ${themes.length ? chips([['all', 'Tout', sc.videos.length], ...themes.map(t => [t.key, t.label, t.count])], ui.scholarTheme, 'scholar-theme') : ''}
    ${vids.length ? `<div class="videos">${vids.map(v => videoCard(v, sc)).join('')}</div>`
      : emptyBox('Aucune vidéo ni audio', 'Importe une vidéo ou un audio de ton téléphone, ou colle un lien YouTube ou Instagram.', 'add-video-here', 'Ajouter')}`);
}
function videoCard(v, sc, showScholar) {
  const k = mediaKind(v);
  let media;
  if (k === 'file-video') {
    media = `<button class="media${v.vertical ? ' vertical' : ''}" data-action="play-file" data-fid="${v.fileId}" aria-label="Lire la vidéo">
      ${v.posterId ? `<img data-poster="${v.posterId}" alt="">` : ''}<span class="play-btn">${ic('play')}</span><span class="platform">Vidéo</span></button>`;
  } else if (k === 'file-audio' || k === 'audio') {
    const on = player.current && player.current.id === v.id && !player.audio.paused;
    media = `<div class="media audio-media"><button class="play-round big${on ? ' is-playing' : ''}" data-action="play-item" data-kind="scholar" data-oid="${sc.id}" data-id="${v.id}" aria-label="Écouter">${ic(on ? 'pause' : 'play')}</button><span class="platform">Audio</span></div>`;
  } else {
    media = mediaBlock(v.url);
  }
  return `<article class="video">${media}
    <div class="v-body">
      <div class="t">${esc(v.title || 'Sans titre')}</div>
      <div class="v-meta">${v.theme ? `<span class="tag">${esc(v.theme)}</span>` : ''}${showScholar ? `<a href="#/savants/${sc.id}">${esc(sc.name)}</a>` : ''}</div>
      ${v.source ? sourceHTML(v.source) : ''}
      ${v.notes ? `<p class="m">${linkify(v.notes)}</p>` : ''}
      <div class="v-actions">${v.url ? `<a href="${esc(v.url)}" target="_blank" rel="noopener">Ouvrir ${ic('external')}</a>` : `<span class="m">${PLATFORM_LABEL[k]} · ${fmtSize(v.fileSize || 0)}</span>`}
        <button class="plain-link" data-action="edit-video" data-sid="${sc.id}" data-vid="${v.id}">Modifier</button></div>
    </div></article>`;
}
function scholarForm(id, category) {
  const sc = id ? data.scholars.find(s => s.id === id) : { name: '', nameAr: '', bio: '', category: category || 'scholar', studies: '', teachers: '', accounts: '' };
  const cat = catOf(sc);
  openModal(id ? 'Modifier' : cat === 'student' ? 'Nouvel étudiant en science' : 'Nouveau savant', `
    <label class="field">Nom <input name="name" required value="${esc(sc.name)}" placeholder="${cat === 'student' ? 'Ex. Abū ʿAbdillāh …' : 'Ex. Shaykh Ibn ʿUthaymīn'}"></label>
    <div class="two">
      <label class="field">Nom en arabe <input name="nameAr" dir="rtl" lang="ar" value="${esc(sc.nameAr)}"></label>
      <label class="field">Catégorie <select name="category">
        <option value="scholar" ${cat === 'scholar' ? 'selected' : ''}>Savant</option>
        <option value="student" ${cat === 'student' ? 'selected' : ''}>Étudiant en science</option></select></label>
    </div>
    <label class="field">Biographie <textarea name="bio" rows="4" placeholder="Origine, ce qu'il enseigne, ses spécialités…">${esc(sc.bio)}</textarea></label>
    <label class="field">Parcours : où il a étudié <textarea name="studies" rows="3" placeholder="Ex. Université islamique de Médine, faculté de hadith…">${esc(sc.studies || '')}</textarea></label>
    <label class="field">Ses enseignants, un par ligne <textarea name="teachers" rows="3" placeholder="Shaykh …&#10;Shaykh …">${esc(sc.teachers || '')}</textarea></label>
    <label class="field">Ses comptes et liens, un par ligne <textarea name="accounts" rows="3" placeholder="https://www.instagram.com/…&#10;https://t.me/…&#10;https://www.youtube.com/@…">${esc(sc.accounts || '')}</textarea></label>
    <p class="m">Astuce : si un enseignant est aussi dans ton carnet, écris son nom exactement pareil, et son profil devient cliquable.</p>`,
    (fd) => {
      const obj = Object.fromEntries(['name', 'nameAr', 'bio', 'category', 'studies', 'teachers', 'accounts'].map(k => [k, String(fd.get(k) || '').trim()]));
      if (!obj.name) return false;
      if (id) Object.assign(sc, obj);
      else { const np = { id: uid(), videos: [], ...obj }; data.scholars.push(np); setTimeout(() => { location.hash = `#/savants/${np.id}`; }, 0); }
      ui.scholarTab = obj.category === 'student' ? 'etudiants' : 'savants';
      save();
    }, { focus: !id, danger: id ? `<button type="button" class="btn danger" data-action="del-scholar" data-id="${id}">Supprimer</button>` : '' });
}
function videoForm(sid, vidId) {
  const sc = data.scholars.find(s => s.id === sid); if (!sc) return;
  const v = vidId ? sc.videos.find(x => x.id === vidId) : { url: '', title: '', theme: '', notes: '', source: '' };
  openModal(vidId ? 'Modifier' : 'Nouvelle vidéo ou audio', `
    <p class="m">${esc(sc.name)}</p>
    ${mediaSourceFields(v)}
    <label class="field">Titre <input name="title" value="${esc(v.title)}" placeholder="Ex. Les conditions du repentir"></label>
    <label class="field">Thème <input name="theme" list="themes-list" value="${esc(v.theme)}" placeholder="Ex. Tawḥīd, Prière…">
      <datalist id="themes-list">${themeSuggestions().map(t => `<option value="${esc(t)}">`).join('')}</datalist></label>
    <label class="field">Notes et bénéfices <textarea name="notes" rows="3">${esc(v.notes || '')}</textarea></label>`,
    (fd) => saveMediaForm(fd, vidId ? v : null, (src) => {
      const obj = { ...src, title: fd.get('title').trim(), theme: fd.get('theme').trim(), notes: fd.get('notes').trim() };
      if (vidId) Object.assign(v, obj); else sc.videos.unshift({ id: uid(), addedAt: todayISO(), ...obj });
    }), { danger: vidId ? `<button type="button" class="btn danger" data-action="del-video" data-sid="${sid}" data-vid="${vidId}">Supprimer</button>` : '' });
}

/* =========================================================
   Bibliothèque
   ========================================================= */
function renderLibrary() {
  return hero({
    fr: 'Bibliothèque', ar: 'المكتبة', back: `<a class="hero-back" href="#/science">${ic('back')}Science</a>`,
    sub: `${plural(data.books.length, 'livre')} · ${data.publishers.length} maison${data.publishers.length > 1 ? 's' : ''} d'édition`,
    extra: seg([['livres', 'Livres'], ['editions', 'Éditions']], ui.libTab, 'lib-tab'),
    actions: ui.libTab === 'livres' ? btnHero('add-book', 'Livre') : btnHero('add-pub', 'Maison d\'édition')
  }) + content(ui.libTab === 'livres' ? booksView() : publishersView());
}
function booksView() {
  if (!data.books.length) return emptyBox('Ta bibliothèque est vide', 'Ajoute les livres que tu as lus, que tu lis ou que tu veux lire, avec un résumé.', 'add-book', 'Ajouter un livre');
  const c = { all: data.books.length, toread: 0, reading: 0, read: 0 };
  data.books.forEach(b => c[b.status]++);
  return `
    ${searchBox('book-query', ui.bookQuery, 'Titre, auteur, édition')}
    ${chips([['all', 'Tous', c.all], ['read', 'Lus', c.read], ['reading', 'En cours', c.reading], ['toread', 'À lire', c.toread]], ui.bookFilter, 'book-filter')}
    <ul class="group" id="book-list">${bookListHTML()}</ul>`;
}
function bookListHTML() {
  const q = norm(ui.bookQuery);
  const order = { reading: 0, toread: 1, read: 2 };
  const list = data.books
    .filter(b => (ui.bookFilter === 'all' || b.status === ui.bookFilter) && (!q || norm(`${b.title} ${b.author} ${b.publisher}`).includes(q)))
    .sort((a, b) => order[a.status] - order[b.status] || a.title.localeCompare(b.title, 'fr'));
  if (!list.length) return `<li class="row m">Aucun livre ne correspond.</li>`;
  return list.map(b => `<li><button class="row plain book" data-action="open-book" data-id="${b.id}">
    <span class="spine s-${b.status}"></span>
    <span class="grow">
      <span class="t">${esc(b.title)}</span>
      ${b.author ? `<span class="m">${esc(b.author)}</span>` : ''}
      ${b.publisher ? `<span class="b-pub">${publisherLabel(b.publisher)}</span>` : ''}
      ${b.summary ? `<span class="ex">${esc(b.summary)}</span>` : ''}
    </span>
    <span class="pill pill-${BOOK_PILL[b.status]}">${BOOK_STATUS[b.status]}</span>
  </button></li>`).join('');
}
function openBook(id) {
  const b = data.books.find(x => x.id === id); if (!b) return;
  openModal(b.title, `
    <p><span class="pill pill-${BOOK_PILL[b.status]}">${BOOK_STATUS[b.status]}</span>${b.finishedAt && b.status === 'read' ? ` <span class="m">terminé le ${fmtDate(b.finishedAt)}</span>` : ''}</p>
    <dl class="facts">
      ${b.author ? `<dt>Auteur</dt><dd>${esc(b.author)}</dd>` : ''}
      ${b.publisher ? `<dt>Édition</dt><dd>${publisherLabel(b.publisher)}</dd>` : ''}
      ${b.recommendedBy ? `<dt>Recommandé par</dt><dd>${esc(b.recommendedBy)}</dd>` : ''}
    </dl>
    <h3>Résumé</h3><p>${b.summary ? linkify(b.summary) : '<span class="m">Pas encore de résumé.</span>'}</p>
    ${b.benefits ? `<h3>Bénéfices (fawāʾid)</h3><p>${linkify(b.benefits)}</p>` : ''}
    <div class="row-actions"><button type="button" class="btn" data-action="edit-book" data-id="${b.id}">${ic('edit')}Modifier</button></div>`);
}
function bookForm(id) {
  const b = id ? data.books.find(x => x.id === id) : { title: '', author: '', publisher: '', status: 'toread', summary: '', benefits: '', recommendedBy: '' };
  const statusOpts = Object.entries(BOOK_STATUS).map(([k, l]) => `<option value="${k}" ${b.status === k ? 'selected' : ''}>${l}</option>`).join('');
  openModal(id ? 'Modifier le livre' : 'Nouveau livre', `
    <label class="field">Titre <input name="title" required value="${esc(b.title)}"></label>
    <label class="field">Auteur <input name="author" value="${esc(b.author)}"></label>
    <div class="two">
      <label class="field">Maison d'édition <input name="publisher" list="pub-list" value="${esc(b.publisher)}">
        <datalist id="pub-list">${data.publishers.map(p => `<option value="${esc(p.name)}">`).join('')}</datalist></label>
      <label class="field">Statut <select name="status">${statusOpts}</select></label>
    </div>
    <label class="field">Recommandé par <input name="recommendedBy" value="${esc(b.recommendedBy || '')}" placeholder="Ex. un savant, un cours"></label>
    <label class="field">Résumé : de quoi parle le livre <textarea name="summary" rows="5">${esc(b.summary)}</textarea></label>
    <label class="field">Bénéfices retenus (fawāʾid) <textarea name="benefits" rows="4">${esc(b.benefits || '')}</textarea></label>`,
    (fd) => {
      const obj = Object.fromEntries(['title', 'author', 'publisher', 'status', 'summary', 'benefits', 'recommendedBy'].map(k => [k, String(fd.get(k) || '').trim()]));
      if (!obj.title) return false;
      if (obj.status === 'read' && (!id || b.status !== 'read')) obj.finishedAt = todayISO();
      if (id) Object.assign(b, obj); else data.books.push({ id: uid(), addedAt: todayISO(), ...obj });
      save();
    }, { focus: !id, danger: id ? `<button type="button" class="btn danger" data-action="del-book" data-id="${id}">Supprimer</button>` : '' });
}
function publishersView() {
  const intro = `<p class="lead">Pour chaque maison d'édition, note ton avis avec ses preuves : propos de savants, erreurs relevées (livre, page, édition), liens. Vérifie et cite toujours tes sources.</p>`;
  if (!data.publishers.length) return intro + emptyBox("Aucune maison d'édition", '', 'add-pub', "Ajouter une maison d'édition");
  const c = { all: data.publishers.length, ok: 0, warn: 0, bad: 0 };
  data.publishers.forEach(p => c[p.verdict]++);
  const order = { ok: 0, warn: 1, bad: 2 };
  const list = data.publishers.filter(p => ui.pubFilter === 'all' || p.verdict === ui.pubFilter)
    .sort((a, b) => order[a.verdict] - order[b.verdict] || a.name.localeCompare(b.name, 'fr'));
  return `${intro}
    ${chips([['all', 'Toutes', c.all], ['ok', 'Fiables', c.ok], ['warn', 'Prudence', c.warn], ['bad', 'À éviter', c.bad]], ui.pubFilter, 'pub-filter')}
    <ul class="group">${list.length ? list.map(p => {
      const nSrc = (p.sources || '').split('\n').filter(l => l.trim()).length;
      const nBooks = data.books.filter(b => findPublisher(b.publisher) === p).length;
      return `<li><button class="row plain" data-action="open-pub" data-id="${p.id}">
        <span class="v-dot v-${p.verdict}"></span>
        <span class="grow"><span class="t">${esc(p.name)}</span>
          <span class="m">${[p.country && esc(p.country), plural(nSrc, 'source'), nBooks && plural(nBooks, 'livre')].filter(Boolean).join(' · ')}</span>
          ${p.reason ? `<span class="ex">${esc(p.reason)}</span>` : ''}</span>
        <span class="pill pill-${VERDICT_PILL[p.verdict]}">${VERDICTS[p.verdict]}</span>
      </button></li>`;
    }).join('') : `<li class="row m">Aucune maison d'édition ici.</li>`}</ul>`;
}
function openPub(id) {
  const p = data.publishers.find(x => x.id === id); if (!p) return;
  const sources = (p.sources || '').split('\n').map(l => l.trim()).filter(Boolean);
  const books = data.books.filter(b => findPublisher(b.publisher) === p);
  openModal(p.name, `
    <p><span class="pill pill-${VERDICT_PILL[p.verdict]}">${VERDICTS[p.verdict]}</span>${p.country ? ` <span class="m">${esc(p.country)}</span>` : ''}</p>
    <h3>Explication</h3><p>${p.reason ? linkify(p.reason) : '<span class="m">—</span>'}</p>
    <h3>Preuves et sources</h3>
    ${sources.length ? `<ol class="sources">${sources.map(s => `<li>${linkify(s)}</li>`).join('')}</ol>` : '<p class="m">Aucune source renseignée.</p>'}
    ${books.length ? `<h3>Dans ta bibliothèque</h3><ul class="group">${books.map(b => `<li><button type="button" class="row plain" data-action="open-book" data-id="${b.id}"><span class="grow"><span class="t">${esc(b.title)}</span></span>${ic('chevron', 'chev')}</button></li>`).join('')}</ul>` : ''}
    <div class="row-actions"><button type="button" class="btn" data-action="edit-pub" data-id="${p.id}">${ic('edit')}Modifier</button></div>`);
}
function pubForm(id) {
  const p = id ? data.publishers.find(x => x.id === id) : { name: '', country: '', verdict: 'ok', reason: '', sources: '' };
  const vOpts = Object.entries(VERDICTS).map(([k, l]) => `<option value="${k}" ${p.verdict === k ? 'selected' : ''}>${l}</option>`).join('');
  openModal(id ? "Modifier l'édition" : "Nouvelle maison d'édition", `
    <label class="field">Nom <input name="name" required value="${esc(p.name)}"></label>
    <div class="two">
      <label class="field">Pays ou ville <input name="country" value="${esc(p.country)}"></label>
      <label class="field">Avis <select name="verdict">${vOpts}</select></label>
    </div>
    <label class="field">Explication et raisons <textarea name="reason" rows="4">${esc(p.reason)}</textarea></label>
    <label class="field">Preuves et sources, une par ligne
      <textarea name="sources" rows="5" placeholder="Nom du savant, titre du cours, minute — https://…&#10;Erreur dans tel livre, page 45, édition de 2015">${esc(p.sources)}</textarea></label>`,
    (fd) => {
      const obj = Object.fromEntries(['name', 'country', 'verdict', 'reason', 'sources'].map(k => [k, String(fd.get(k) || '').trim()]));
      if (!obj.name) return false;
      if (id) Object.assign(p, obj); else data.publishers.push({ id: uid(), ...obj });
      save();
    }, { focus: !id, danger: id ? `<button type="button" class="btn danger" data-action="del-pub" data-id="${id}">Supprimer</button>` : '' });
}

/* =========================================================
   Réglages
   ========================================================= */
function renderSettings() {
  const t = data.settings.theme;
  return hero({ fr: 'Réglages', ar: 'الإعدادات', sub: 'Affichage, révision et sauvegarde' }) + content(`
    <section class="block">
      <div class="block-head"><h2>Affichage et révision</h2></div>
      <div class="card">
        <label class="field">Thème
          <select data-change="theme">
            <option value="auto" ${t === 'auto' ? 'selected' : ''}>Automatique (selon le téléphone)</option>
            <option value="light" ${t === 'light' ? 'selected' : ''}>Clair</option>
            <option value="dark" ${t === 'dark' ? 'selected' : ''}>Sombre</option>
          </select></label>
        <label class="field">Rappel de révision d'une sourate ou d'un hadith appris (jours)
          <input type="number" min="1" max="365" inputmode="numeric" value="${data.settings.revisionDays}" data-change="revdays"></label>
      </div>
    </section>
    <section class="block">
      <div class="block-head"><h2>Sauvegarde</h2><span class="m">Dernière : ${data.settings.lastExport ? fmtDate(data.settings.lastExport) : 'jamais'}</span></div>
      <div class="card">
        <p class="m">Tes données sont enregistrées uniquement sur cet appareil, dans ce navigateur. Exporte-les régulièrement pour ne rien perdre, ou pour les passer sur un autre appareil.</p>
        ${(() => { const f = allMediaItems().filter(x => x.fileId); return f.length ? `<p class="m"><strong>${plural(f.length, 'fichier')} importé${f.length > 1 ? 's' : ''} (${fmtSize(f.reduce((a, x) => a + (x.fileSize || 0), 0))})</strong> : les vidéos et audios importés restent sur ce téléphone et ne sont pas dans la sauvegarde, car ils sont trop lourds. Garde les originaux dans ta galerie.</p>` : ''; })()}
        <div class="row-actions">
          <button class="btn primary" data-action="export">Exporter (.json)</button>
          <label class="btn">Importer<input type="file" accept="application/json,.json" data-change="import" hidden></label>
        </div>
      </div>
    </section>
    ${SETTINGS_SECTIONS.map(f => f()).join('')}
    <section class="block">
      <div class="block-head"><h2>Zone sensible</h2></div>
      <div class="card"><button class="btn danger" data-action="reset">Tout effacer</button></div>
    </section>
    <p class="colophon"><span lang="ar">تراث</span>Turath · version 5.0</p>`);
}
function exportData() {
  data.settings.lastExport = todayISO(); save();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `turath-sauvegarde-${todayISO()}.json`;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  render();
}
function importData(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const d = JSON.parse(reader.result);
      if (!d || typeof d !== 'object' || !d.quran) throw new Error('format');
      if (!confirm('Remplacer toutes les données actuelles par celles du fichier ?')) return;
      data = normalize(d); save(); applyTheme(); render(); toast('Données importées');
    } catch (e) { toast("Fichier invalide : ce n'est pas une sauvegarde Turath"); }
  };
  reader.readAsText(file);
}

/* =========================================================
   Modale, toast, routeur, événements
   ========================================================= */
let modalSubmit = null;
function openModal(title, body, onSubmit, opts = {}) {
  const m = $('#modal');
  m.innerHTML = `<div class="modal-backdrop" data-action="close-modal"></div>
  <form class="sheet" id="modal-form" role="dialog" aria-modal="true" aria-label="${esc(title)}" novalidate>
    <div class="sheet-grip" aria-hidden="true"></div>
    <div class="sheet-head"><h2>${esc(title)}</h2><button type="button" class="icon-btn" data-action="close-modal" aria-label="Fermer">${ic('close')}</button></div>
    <div class="sheet-body">${body}</div>
    ${onSubmit ? `<div class="sheet-foot">${opts.danger || ''}<span class="spacer"></span>
      <button type="button" class="btn" data-action="close-modal">Annuler</button>
      <button type="submit" class="btn primary">Enregistrer</button></div>` : ''}
  </form>`;
  m.hidden = false;
  document.body.classList.add('no-scroll');
  modalSubmit = onSubmit || null;
  if (opts.focus) setTimeout(() => { const f = m.querySelector('.sheet-body input:not([type=hidden]), .sheet-body textarea'); if (f) f.focus(); }, 60);
}
function closeModal() {
  const m = $('#modal');
  m.hidden = true; m.innerHTML = '';
  document.body.classList.remove('no-scroll');
  modalSubmit = null;
}
let toastTimer;
function toast(msg) {
  const t = $('#toast');
  t.textContent = msg; t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2600);
}
function applyTheme() { document.documentElement.dataset.theme = data.settings.theme; }

const VIEWS = { accueil: renderHome, coran: renderQuran, hadiths: renderHadiths, savants: renderScholars, bibliotheque: renderLibrary, reglages: renderSettings };
const PARAM_VIEWS = { savants: (p) => renderScholar(p), recitateurs: (p) => renderReciter(p) };
const NAV_OF = { recitateurs: 'coran', lire: 'coran', hadiths: 'science', savants: 'science', bibliotheque: 'science', programmes: 'science', fawaid: 'science' };
const AFTER_RENDER = [];
const HOME_CARDS = [];
const SETTINGS_SECTIONS = [];
const INPUTS = {};
const CHANGES = {};
let currentRoute = { page: 'accueil', param: null, param2: null };
function render() {
  let [page = 'accueil', param, param2] = location.hash.replace(/^#\/?/, '').split('/');
  if (page === 'livres') { page = 'bibliotheque'; ui.libTab = 'livres'; }
  if (page === 'editions') { page = 'bibliotheque'; ui.libTab = 'editions'; }
  let html;
  if (param && PARAM_VIEWS[page]) html = PARAM_VIEWS[page](decodeURIComponent(param), param2 && decodeURIComponent(param2));
  else { if (!VIEWS[page]) page = 'accueil'; param = null; html = VIEWS[page](); }
  currentRoute = { page, param, param2 };
  const navPage = NAV_OF[page] || page;
  const view = $('#view');
  view.innerHTML = html;
  view.dataset.page = page;
  document.querySelectorAll('[data-page]').forEach(a => a.classList.toggle('active', a.dataset.page === navPage));
  hydratePosters(view);
  AFTER_RENDER.forEach(fn => { try { fn(page, param, param2); } catch (e) { console.error(e); } });
}

const routeId = () => location.hash.split('/')[2];
const actions = {
  'close-modal': () => closeModal(),
  'open-surah': (el) => openSurah(+el.dataset.n),
  'revise': (el) => { revise(+el.dataset.n); if (el.dataset.close) closeModal(); render(); },
  'bookmark-here': (el) => {
    const n = +el.dataset.n;
    const input = $('#modal [name=ayah]');
    const ayah = clamp(parseInt(input && input.value, 10) || 1, 1, S(n).ayahs);
    data.quran.bookmark = { surah: n, ayah, date: todayISO() };
    save(); toast(`Point d'arrêt : ${S(n).fr}, verset ${ayah}`);
  },
  'edit-bookmark': () => openBookmark(),
  'toggle-sort': () => { data.settings.sortReverse = !data.settings.sortReverse; save(); render(); },
  'surah-filter': (el) => { ui.surahFilter = el.dataset.key; render(); },
  'quran-tab': (el) => { ui.quranTab = el.dataset.key; render(); },
  'listen-surah': (el) => { const x = recitationsOfSurah(+el.dataset.n)[0]; if (x) playItem('reciter', x.r.id, x.rec.id); },

  'go-reciters': () => { ui.quranTab = 'recitateurs'; },
  'add-reciter': () => reciterForm(),
  'edit-reciter': (el) => reciterForm(el.dataset.id),
  'del-reciter': (el) => {
    const r = reciterById(el.dataset.id);
    if (!r || !confirm(`Supprimer ${r.name} et ses ${r.recitations.length} récitation(s) ?`)) return;
    if (player.current && player.current.oid === r.id) actions['stop-player']();
    r.recitations.forEach(removeFiles);
    data.reciters = data.reciters.filter(x => x !== r); save(); closeModal(); ui.quranTab = 'recitateurs'; location.hash = '#/coran'; render();
  },
  'add-rec': (el) => recForm(el.dataset.id),
  'add-rec-here': () => recForm(routeId()),
  'edit-rec': (el) => recForm(el.dataset.rid, el.dataset.id),
  'del-rec': (el) => {
    const r = reciterById(el.dataset.rid);
    if (!r || !confirm('Supprimer cette récitation ?')) return;
    if (player.current && player.current.id === el.dataset.id) actions['stop-player']();
    removeFiles(r.recitations.find(x => x.id === el.dataset.id));
    r.recitations = r.recitations.filter(x => x.id !== el.dataset.id); save(); closeModal(); render();
  },
  'play-item': (el) => playItem(el.dataset.kind, el.dataset.oid, el.dataset.id),
  'play-file': async (el) => {
    let u;
    try { u = await fileURL(el.dataset.fid); } catch (e) { toast('Fichier introuvable sur cet appareil'); return; }
    if (!player.audio.paused) player.audio.pause();
    const div = document.createElement('div');
    div.className = el.className + ' playing';
    div.innerHTML = `<video src="${u}" controls playsinline autoplay></video>`;
    el.replaceWith(div);
  },
  'toggle-play': () => togglePlay(),
  'stop-player': () => { player.current = null; player.audio.pause(); player.audio.removeAttribute('src'); player.audio.load(); renderPlayer(); refreshPlayButtons(); },

  'hadith-filter': (el) => { ui.hadithFilter = el.dataset.key; render(); },
  'add-hadith': () => hadithForm(),
  'open-hadith': (el) => openHadith(el.dataset.id),
  'edit-hadith': (el) => hadithForm(el.dataset.id),
  'learn-hadith': (el) => {
    const h = hadithById(el.dataset.id); if (!h) return;
    Object.assign(h, { status: 'memorized', lastRevision: todayISO() });
    addLog(0, 'hadith'); save(); closeModal(); render(); toast('Bārak Allāhu fīk ! Hadith appris');
  },
  'revise-hadith': (el) => {
    const h = hadithById(el.dataset.id); if (!h) return;
    h.lastRevision = todayISO(); addLog(0, 'hadith'); save();
    if (el.dataset.close) closeModal();
    render(); toast('Hadith révisé');
  },
  'del-hadith': (el) => {
    if (!confirm('Supprimer ce hadith ?')) return;
    data.hadiths = data.hadiths.filter(h => h.id !== el.dataset.id); save(); closeModal(); render();
  },

  'scholar-tab': (el) => { ui.scholarTab = el.dataset.key; render(); },
  'pick-theme': (el) => { ui.theme = el.dataset.key; render(); },
  'scholar-theme': (el) => { ui.scholarTheme = el.dataset.key; render(); },
  'add-scholar': () => scholarForm(null, 'scholar'),
  'add-student': () => scholarForm(null, 'student'),
  'go-students': () => { ui.scholarTab = 'etudiants'; },
  'go-scholars': () => { ui.scholarTab = 'savants'; },
  'edit-scholar': (el) => scholarForm(el.dataset.id),
  'del-scholar': (el) => {
    const sc = data.scholars.find(s => s.id === el.dataset.id);
    if (!sc || !confirm(`Supprimer ${sc.name} et ses ${sc.videos.length} média(s) ?`)) return;
    if (player.current && player.current.oid === sc.id) actions['stop-player']();
    sc.videos.forEach(removeFiles);
    data.scholars = data.scholars.filter(s => s !== sc); save(); closeModal(); location.hash = '#/savants'; render();
  },
  'add-video': (el) => videoForm(el.dataset.id),
  'add-video-here': () => videoForm(routeId()),
  'edit-video': (el) => videoForm(el.dataset.sid, el.dataset.vid),
  'del-video': (el) => {
    const sc = data.scholars.find(s => s.id === el.dataset.sid);
    if (!sc || !confirm('Supprimer ce média ?')) return;
    if (player.current && player.current.id === el.dataset.vid) actions['stop-player']();
    removeFiles(sc.videos.find(v => v.id === el.dataset.vid));
    sc.videos = sc.videos.filter(v => v.id !== el.dataset.vid); save(); closeModal(); render();
  },
  'play': (el) => {
    const div = document.createElement('div');
    div.className = el.className + ' playing';
    div.innerHTML = `<iframe src="${esc(el.dataset.src)}" title="Vidéo" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen loading="lazy"></iframe>`;
    el.replaceWith(div);
  },

  'lib-tab': (el) => { ui.libTab = el.dataset.key; render(); },
  'book-filter': (el) => { ui.bookFilter = el.dataset.key; render(); },
  'add-book': () => bookForm(),
  'open-book': (el) => openBook(el.dataset.id),
  'edit-book': (el) => bookForm(el.dataset.id),
  'del-book': (el) => {
    if (!confirm('Supprimer ce livre ?')) return;
    data.books = data.books.filter(b => b.id !== el.dataset.id); save(); closeModal(); render();
  },
  'pub-filter': (el) => { ui.pubFilter = el.dataset.key; render(); },
  'add-pub': () => pubForm(),
  'open-pub': (el) => openPub(el.dataset.id),
  'edit-pub': (el) => pubForm(el.dataset.id),
  'del-pub': (el) => {
    if (!confirm("Supprimer cette maison d'édition ?")) return;
    data.publishers = data.publishers.filter(p => p.id !== el.dataset.id); save(); closeModal(); render();
  },

  'export': () => exportData(),
  'reset': () => {
    if (!confirm('Effacer toutes tes données ? Pense à exporter une sauvegarde avant.')) return;
    if (!confirm('Dernière confirmation : tout effacer définitivement ?')) return;
    actions['stop-player']();
    MediaDB.clear();
    data = normalize(defaultData()); save(); applyTheme(); render(); toast('Données effacées');
  }
};

document.addEventListener('click', (e) => {
  const el = e.target.closest('[data-action]');
  if (!el || !actions[el.dataset.action]) return;
  if (el.tagName === 'BUTTON' || el.classList.contains('modal-backdrop')) e.preventDefault();
  actions[el.dataset.action](el, e);
});
document.addEventListener('input', (e) => {
  const k = e.target.dataset.input;
  if (k && INPUTS[k]) { INPUTS[k](e); return; }
  if (k === 'surah-query') { ui.surahQuery = e.target.value; $('#surah-list').innerHTML = surahListHTML(); }
  if (k === 'hadith-query') { ui.hadithQuery = e.target.value; $('#hadith-list').innerHTML = hadithListHTML(); }
  if (k === 'book-query') { ui.bookQuery = e.target.value; $('#book-list').innerHTML = bookListHTML(); }
  if (k === 'bm-surah') { const a = $('#modal [name=ayah]'); a.max = S(+e.target.value).ayahs; if (+a.value > +a.max) a.value = a.max; }
});
document.addEventListener('change', (e) => {
  const k = e.target.dataset.change;
  if (k && CHANGES[k]) { CHANGES[k](e); return; }
  if (k === 'theme') { data.settings.theme = e.target.value; save(); applyTheme(); }
  if (k === 'revdays') { data.settings.revisionDays = clamp(parseInt(e.target.value, 10) || 7, 1, 365); save(); }
  if (k === 'import' && e.target.files[0]) importData(e.target.files[0]);
});
document.addEventListener('submit', (e) => {
  if (e.target.id !== 'modal-form') return;
  e.preventDefault();
  if (!e.target.checkValidity()) { e.target.reportValidity(); return; }
  const result = modalSubmit ? modalSubmit(new FormData(e.target)) : undefined;
  if (result === false) return;
  if (result && typeof result.then === 'function') {
    const btn = e.target.querySelector('button[type=submit]');
    const label = btn.textContent;
    btn.disabled = true; btn.textContent = 'Enregistrement…';
    result.then(ok => {
      if (ok === false) { btn.disabled = false; btn.textContent = label; return; }
      closeModal(); render();
    });
    return;
  }
  closeModal(); render();
});
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !$('#modal').hidden) closeModal(); });
window.addEventListener('hashchange', () => { closeModal(); render(); window.scrollTo(0, 0); });

