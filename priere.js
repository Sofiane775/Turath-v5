'use strict';
/* =========================================================
   Turath — Horaires de prière (calcul local, sans internet)
   Algorithme astronomique classique (type PrayTimes) :
   position du soleil, angles de Fajr et ʿIshāʾ, ombre de ʿAṣr,
   règle des hautes latitudes, ajustements manuels.
   + Muḥāsaba : bilan du jour.
   ========================================================= */

const PRAYER_METHODS = {
  MWL: { name: 'Ligue islamique mondiale (18° / 17°)', fajr: 18, isha: 17 },
  UOIF: { name: 'UOIF, France (12° / 12°)', fajr: 12, isha: 12 },
  ISNA: { name: 'ISNA, Amérique du Nord (15° / 15°)', fajr: 15, isha: 15 },
  Egypt: { name: 'Égypte (19,5° / 17,5°)', fajr: 19.5, isha: 17.5 },
  Makkah: { name: 'Umm al-Qurā, La Mecque (18,5° / 90 min)', fajr: 18.5, ishaMin: 90 },
  Custom: { name: 'Personnalisée' }
};
const PRAYERS = [
  { id: 'fajr', fr: 'Fajr', ar: 'الفجر' },
  { id: 'sunrise', fr: 'Shurūq', ar: 'الشروق', info: true },
  { id: 'dhuhr', fr: 'Dhuhr', ar: 'الظهر' },
  { id: 'asr', fr: 'ʿAṣr', ar: 'العصر' },
  { id: 'maghrib', fr: 'Maghrib', ar: 'المغرب' },
  { id: 'isha', fr: 'ʿIshāʾ', ar: 'العشاء' }
];
const FIVE = PRAYERS.filter(p => !p.info);
const KAABA = { lat: 21.4225, lng: 39.8262 };

NORMALIZERS.push((d) => {
  d.prayer = { lat: null, lng: null, label: '', method: 'MWL', asr: 'standard', fajrAngle: 18, ishaAngle: 17, highLat: 'angle', adjust: { fajr: 0, sunrise: 0, dhuhr: 0, asr: 0, maghrib: 0, isha: 0 }, ...(d.prayer || {}) };
  d.prayer.adjust = { fajr: 0, sunrise: 0, dhuhr: 0, asr: 0, maghrib: 0, isha: 0, ...(d.prayer.adjust || {}) };
  d.muhasaba = d.muhasaba || {};
  if (!Array.isArray(d.muhasaba.items)) d.muhasaba.items = [
    { id: 'adhkar_matin', label: 'Adhkār du matin' },
    { id: 'adhkar_soir', label: 'Adhkār du soir' },
    { id: 'wird', label: 'Wird de Coran' },
    { id: 'rawatib', label: 'Sunan rawātib' },
    { id: 'witr', label: 'Witr' }
  ];
  d.muhasaba.days = d.muhasaba.days || {};
});
NORMALIZERS[NORMALIZERS.length - 1](data);

/* ---------- Calcul ---------- */
const DEG = Math.PI / 180;
const dsin = d => Math.sin(d * DEG), dcos = d => Math.cos(d * DEG), dtan = d => Math.tan(d * DEG);
const darcsin = x => Math.asin(x) / DEG, darccos = x => Math.acos(x) / DEG, darctan2 = (y, x) => Math.atan2(y, x) / DEG, darccot = x => Math.atan(1 / x) / DEG;
const fix = (a, b) => { a = a - b * Math.floor(a / b); return a < 0 ? a + b : a; };
const fixAngle = a => fix(a, 360), fixHour = a => fix(a, 24);
function julian(y, m, d) {
  if (m <= 2) { y -= 1; m += 12; }
  const A = Math.floor(y / 100), B = 2 - A + Math.floor(A / 4);
  return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + d + B - 1524.5;
}
function computePrayerTimes(date, cfg) {
  const lat = +cfg.lat, lng = +cfg.lng;
  const method = PRAYER_METHODS[cfg.method] || PRAYER_METHODS.MWL;
  const fajrA = cfg.method === 'Custom' ? +cfg.fajrAngle : method.fajr;
  const ishaA = cfg.method === 'Custom' ? +cfg.ishaAngle : method.isha;
  const ishaMin = cfg.method === 'Custom' ? null : method.ishaMin;
  const asrF = cfg.asr === 'hanafi' ? 2 : 1;
  const jDate = julian(date.getFullYear(), date.getMonth() + 1, date.getDate()) - lng / (15 * 24);
  const sunPos = (jd) => {
    const D = jd - 2451545.0;
    const g = fixAngle(357.529 + 0.98560028 * D), q = fixAngle(280.459 + 0.98564736 * D);
    const L = fixAngle(q + 1.915 * dsin(g) + 0.020 * dsin(2 * g));
    const e = 23.439 - 0.00000036 * D;
    const RA = darctan2(dcos(e) * dsin(L), dcos(L)) / 15;
    return { decl: darcsin(dsin(e) * dsin(L)), eqt: q / 15 - fixHour(RA) };
  };
  const midDay = (t) => fixHour(12 - sunPos(jDate + t).eqt);
  const sunAngleTime = (angle, t, ccw) => {
    const decl = sunPos(jDate + t).decl, noon = midDay(t);
    const v = darccos((-dsin(angle) - dsin(decl) * dsin(lat)) / (dcos(decl) * dcos(lat))) / 15;
    return noon + (ccw ? -v : v);
  };
  const asrTime = (f, t) => { const decl = sunPos(jDate + t).decl; return sunAngleTime(-darccot(f + dtan(Math.abs(lat - decl))), t); };
  let t = { fajr: 5, sunrise: 6, dhuhr: 12, asr: 13, sunset: 18, isha: 18 };
  for (const k in t) t[k] /= 24;
  t = {
    fajr: sunAngleTime(fajrA, t.fajr, true),
    sunrise: sunAngleTime(0.833, t.sunrise, true),
    dhuhr: midDay(t.dhuhr),
    asr: asrTime(asrF, t.asr),
    sunset: sunAngleTime(0.833, t.sunset),
    isha: ishaMin ? null : sunAngleTime(ishaA, t.isha)
  };
  const tz = -new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12).getTimezoneOffset() / 60;
  for (const k in t) if (t[k] !== null) t[k] += tz - lng / 15;
  t.maghrib = t.sunset;
  if (ishaMin) t.isha = t.maghrib + ishaMin / 60;
  // Hautes latitudes : méthode des angles (portion de la nuit)
  const night = fixHour(t.sunrise - t.sunset);
  const fajrPortion = fajrA / 60 * night;
  if (isNaN(t.fajr) || fixHour(t.sunrise - t.fajr) > fajrPortion) t.fajr = t.sunrise - fajrPortion;
  if (!ishaMin) {
    const ishaPortion = ishaA / 60 * night;
    if (isNaN(t.isha) || fixHour(t.isha - t.sunset) > ishaPortion) t.isha = t.sunset + ishaPortion;
  }
  const out = {};
  for (const p of PRAYERS) {
    const h = fixHour(t[p.id] + (+cfg.adjust[p.id] || 0) / 60);
    const d = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0);
    d.setMinutes(Math.round(h * 60));
    out[p.id] = d;
  }
  return out;
}
const hm = (d) => `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
const hasLocation = () => data.prayer.lat !== null && data.prayer.lat !== '' && data.prayer.lng !== null && !isNaN(+data.prayer.lat);
function todayTimes(offsetDays = 0) {
  const d = new Date(); d.setDate(d.getDate() + offsetDays);
  return computePrayerTimes(d, data.prayer);
}
function nextPrayer() {
  const now = new Date();
  const t = todayTimes();
  for (const p of FIVE) if (t[p.id] > now) return { p, at: t[p.id], times: t };
  const tm = todayTimes(1);
  return { p: FIVE[0], at: tm.fajr, times: t, tomorrow: true };
}
function currentPrayerId(times) {
  const now = new Date();
  let cur = null;
  for (const p of FIVE) if (times[p.id] <= now) cur = p.id;
  return cur;
}
function untilText(at) {
  const min = Math.max(0, Math.round((at - new Date()) / 60000));
  const h = Math.floor(min / 60), m = min % 60;
  return h ? `dans ${h} h ${String(m).padStart(2, '0')}` : `dans ${m} min`;
}
function qiblaBearing(lat, lng) {
  const b = darctan2(dsin(KAABA.lng - lng), dcos(lat) * dtan(KAABA.lat) - dsin(lat) * dcos(KAABA.lng - lng));
  return fixAngle(b);
}
const compassWord = (deg) => ['nord', 'nord-est', 'est', 'sud-est', 'sud', 'sud-ouest', 'ouest', 'nord-ouest'][Math.round(deg / 45) % 8];

/* ---------- Muḥāsaba ---------- */
function dayRec(iso = todayISO()) {
  const days = data.muhasaba.days;
  if (!days[iso]) days[iso] = { prayers: {}, done: {}, note: '' };
  return days[iso];
}
const PRAYED = { 0: 'À faire', 1: 'À l\'heure', 2: 'En retard' };
function dayScore(rec) {
  if (!rec) return 0;
  const total = 5 + data.muhasaba.items.length;
  const done = FIVE.filter(p => rec.prayers[p.id]).length + data.muhasaba.items.filter(i => rec.done[i.id]).length;
  return done / total;
}
function markMuhasaba(itemId) {
  const rec = dayRec();
  if (!rec.done[itemId]) { rec.done[itemId] = true; save(); }
}

/* ---------- Vues ---------- */
function prayerTimesHTML(times, compact) {
  const nx = nextPrayer();
  const cur = currentPrayerId(times);
  const rec = data.muhasaba.days[todayISO()] || { prayers: {} };
  if (compact) {
    return `<div class="pt-mini">${FIVE.map(p => `<div class="pt-cell${nx.p.id === p.id && !nx.tomorrow ? ' next' : ''}${rec.prayers[p.id] ? ' prayed' : ''}"><span>${p.fr}</span><strong>${hm(times[p.id])}</strong></div>`).join('')}</div>`;
  }
  return `<ul class="group pt-list">${PRAYERS.map(p => {
    const state = rec.prayers[p.id] || 0;
    return `<li class="row pt-row${nx.p.id === p.id && !nx.tomorrow ? ' next' : ''}${cur === p.id ? ' current' : ''}${p.info ? ' info' : ''}">
      <span class="grow"><span class="t">${p.fr} <span class="pt-ar" lang="ar">${p.ar}</span></span>${nx.p.id === p.id && !nx.tomorrow ? `<span class="m" data-countdown>${untilText(nx.at)}</span>` : ''}</span>
      <span class="pt-time">${hm(times[p.id])}</span>
      ${p.info ? '<span class="pt-toggle ghost"></span>' : `<button class="pt-toggle s${state}" data-action="pr-mark" data-id="${p.id}" aria-label="${p.fr} : ${PRAYED[state]}">${state === 1 ? ic('check') : state === 2 ? '<b>!</b>' : ''}</button>`}
    </li>`;
  }).join('')}</ul>`;
}
function renderPrayer() {
  if (!hasLocation()) {
    return hero({ fr: 'Prière', ar: 'الصلاة', sub: 'Horaires, qibla et bilan du jour' }) + content(`
      <div class="empty">
        <p class="empty-t">Où te trouves-tu ?</p>
        <p class="empty-d">Les horaires sont calculés sur ton téléphone, à partir de ta position. Elle reste enregistrée uniquement dans l'appli.</p>
        <div class="row-actions" style="justify-content:center">
          <button class="btn primary" data-action="pr-locate">${ic('location')}Utiliser ma position</button>
          <button class="btn" data-action="pr-settings">Saisir les coordonnées</button>
        </div>
      </div>
      ${muhasabaHTML()}`);
  }
  const t = todayTimes();
  const nx = nextPrayer();
  const q = qiblaBearing(+data.prayer.lat, +data.prayer.lng);
  const dateLong = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
  return `<section class="hero"><div class="hero-in">
      <div class="hero-title"><div class="hero-txt"><h1>Prière</h1><p class="hero-sub">${esc(dateLong)} · ${esc(data.prayer.label || 'Ma position')}</p></div><span class="hero-ar" lang="ar" aria-hidden="true">الصلاة</span></div>
      <div class="next-prayer">
        <span class="np-k">Prochaine prière${nx.tomorrow ? ' (demain)' : ''}</span>
        <div class="np-main"><strong>${nx.p.fr}</strong><span class="np-ar" lang="ar">${nx.p.ar}</span><span class="np-time">${hm(nx.at)}</span></div>
        <span class="np-until" data-countdown>${untilText(nx.at)}</span>
      </div>
      <div class="hero-actions">
        <button class="btn on-dark" data-action="pr-settings">${ic('gear')}Calcul et position</button>
        <button class="btn on-dark" data-action="pr-locate">${ic('location')}Actualiser</button>
      </div>
    </div></section>` + content(`
    <section class="block" style="margin-top:0">
      <div class="block-head"><h2>Aujourd'hui</h2><span class="m">Touche le rond une fois la prière accomplie</span></div>
      ${prayerTimesHTML(t)}
      <p class="m pad">${esc((PRAYER_METHODS[data.prayer.method] || {}).name || '')} · ʿAṣr ${data.prayer.asr === 'hanafi' ? 'ḥanafite' : 'majoritaire'}. Les horaires calculés peuvent différer de quelques minutes de ceux de ta mosquée : ajuste-les dans « Calcul et position ».</p>
    </section>
    <section class="card qibla">
      <div class="qibla-dial" style="--q:${q.toFixed(1)}deg"><span class="needle"></span><span class="n">N</span></div>
      <div><div class="card-k">${ic('compass')}Qibla</div><strong>${Math.round(q)}°</strong> depuis le nord, vers le ${compassWord(q)}.<p class="m">Oriente le haut de ton téléphone vers le nord avec une boussole, puis tourne-toi de ${Math.round(q)}° dans le sens des aiguilles d'une montre.</p></div>
    </section>
    ${muhasabaHTML()}`);
}
function muhasabaHTML() {
  const rec = data.muhasaba.days[todayISO()] || { prayers: {}, done: {}, note: '' };
  const last7 = Array.from({ length: 7 }, (_, i) => { const d = new Date(); d.setDate(d.getDate() - (6 - i)); return isoOf(d); });
  return `<section class="block">
    <div class="block-head"><h2>Muḥāsaba · bilan du jour</h2><button class="plain-link" data-action="mu-items">Modifier la liste</button></div>
    <ul class="group">${data.muhasaba.items.map(it => `<li><button class="row plain check-row${rec.done[it.id] ? ' done' : ''}" data-action="mu-toggle" data-id="${esc(it.id)}">
        <span class="checkbox">${ic('check')}</span><span class="grow"><span class="t">${esc(it.label)}</span></span></button></li>`).join('')}</ul>
    <label class="field">Une note pour toi (ce qui a été bien, ce que tu veux améliorer demain)
      <textarea rows="3" data-change="mu-note" placeholder="Écris librement, personne d'autre ne le lira.">${esc(rec.note || '')}</textarea></label>
    <div class="week">${last7.map(iso => {
      const r = data.muhasaba.days[iso]; const sc = dayScore(r);
      const d = new Date(iso + 'T12:00:00');
      return `<div class="day${iso === todayISO() ? ' today' : ''}"><span class="bar"><span style="height:${Math.round(sc * 100)}%"></span></span><span class="dl">${d.toLocaleDateString('fr-FR', { weekday: 'narrow' })}</span></div>`;
    }).join('')}</div>
    <p class="m center">Les 7 derniers jours. L'essentiel, c'est la régularité, même avec peu.</p>
  </section>`;
}
function prayerSettings() {
  const p = data.prayer;
  const adj = PRAYERS.map(x => `<label class="field adj">${x.fr}<input type="number" name="adj_${x.id}" value="${+p.adjust[x.id] || 0}" min="-60" max="60" inputmode="numeric"></label>`).join('');
  openModal('Calcul et position', `
    <div class="two">
      <label class="field">Latitude <input name="lat" inputmode="decimal" value="${p.lat ?? ''}" placeholder="48.8566"></label>
      <label class="field">Longitude <input name="lng" inputmode="decimal" value="${p.lng ?? ''}" placeholder="2.3522"></label>
    </div>
    <label class="field">Nom du lieu (facultatif) <input name="label" value="${esc(p.label)}" placeholder="Ex. Lyon"></label>
    <label class="field">Méthode de calcul <select name="method">${Object.entries(PRAYER_METHODS).map(([k, v]) => `<option value="${k}" ${p.method === k ? 'selected' : ''}>${v.name}</option>`).join('')}</select></label>
    <div class="two">
      <label class="field">Angle du Fajr (personnalisé) <input name="fajrAngle" inputmode="decimal" value="${p.fajrAngle}"></label>
      <label class="field">Angle du ʿIshāʾ (personnalisé) <input name="ishaAngle" inputmode="decimal" value="${p.ishaAngle}"></label>
    </div>
    <label class="field">Calcul de ʿAṣr <select name="asr">
      <option value="standard" ${p.asr !== 'hanafi' ? 'selected' : ''}>Majorité des savants (ombre = 1 fois l'objet)</option>
      <option value="hanafi" ${p.asr === 'hanafi' ? 'selected' : ''}>Ḥanafite (ombre = 2 fois l'objet)</option></select></label>
    <h3>Ajustements en minutes (pour coller à ta mosquée)</h3>
    <div class="adj-grid">${adj}</div>`,
    (fd) => {
      const lat = parseFloat(String(fd.get('lat')).replace(',', '.')), lng = parseFloat(String(fd.get('lng')).replace(',', '.'));
      if (isNaN(lat) || isNaN(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) { toast('Coordonnées invalides'); return false; }
      Object.assign(data.prayer, {
        lat, lng, label: fd.get('label').trim(), method: fd.get('method'), asr: fd.get('asr'),
        fajrAngle: parseFloat(String(fd.get('fajrAngle')).replace(',', '.')) || 18,
        ishaAngle: parseFloat(String(fd.get('ishaAngle')).replace(',', '.')) || 17
      });
      PRAYERS.forEach(x => { data.prayer.adjust[x.id] = clamp(parseInt(fd.get('adj_' + x.id), 10) || 0, -60, 60); });
      save();
    });
}
function muhasabaItemsForm() {
  openModal('Ta liste du jour', `
    <p class="m">Une action par ligne. Les adhkār du matin et du soir se cochent tout seuls quand tu les termines dans Dhikr.</p>
    <label class="field">Actions à suivre chaque jour
      <textarea name="items" rows="8">${esc(data.muhasaba.items.map(i => i.label).join('\n'))}</textarea></label>`,
    (fd) => {
      const labels = String(fd.get('items') || '').split('\n').map(l => l.trim()).filter(Boolean);
      const old = data.muhasaba.items;
      data.muhasaba.items = labels.map(l => old.find(o => o.label === l) || { id: 'i_' + uid(), label: l });
      save();
    });
}

Object.assign(actions, {
  'pr-locate': () => {
    if (!navigator.geolocation) { toast('Localisation indisponible : saisis tes coordonnées'); prayerSettings(); return; }
    toast('Recherche de ta position…');
    navigator.geolocation.getCurrentPosition((pos) => {
      data.prayer.lat = +pos.coords.latitude.toFixed(4);
      data.prayer.lng = +pos.coords.longitude.toFixed(4);
      if (!data.prayer.label) data.prayer.label = 'Ma position';
      save(); render(); toast('Position enregistrée');
    }, () => { toast("Position refusée ou indisponible : saisis tes coordonnées"); prayerSettings(); }, { enableHighAccuracy: false, timeout: 15000, maximumAge: 3600000 });
  },
  'pr-settings': () => prayerSettings(),
  'pr-mark': (el) => {
    const rec = dayRec();
    rec.prayers[el.dataset.id] = ((rec.prayers[el.dataset.id] || 0) + 1) % 3;
    save(); render();
  },
  'mu-toggle': (el) => { const rec = dayRec(); rec.done[el.dataset.id] = !rec.done[el.dataset.id]; save(); render(); },
  'mu-items': () => muhasabaItemsForm()
});
CHANGES['mu-note'] = (e) => { dayRec().note = e.target.value; save(); };

VIEWS.priere = renderPrayer;

HOME_CARDS.push(() => {
  if (!hasLocation()) return `<a class="card home-prayer empty-prayer" href="#/priere"><div class="card-k">${ic('mosque')}Horaires de prière</div><p class="m">Active ta position pour voir les horaires du jour et la qibla.</p></a>`;
  const t = todayTimes(), nx = nextPrayer();
  return `<a class="card home-prayer" href="#/priere">
    <div class="hp-top"><div class="card-k">${ic('mosque')}Prochaine prière</div><span class="m" data-countdown>${untilText(nx.at)}</span></div>
    <div class="hp-next"><strong>${nx.p.fr}</strong><span lang="ar">${nx.p.ar}</span><span class="hp-time">${hm(nx.at)}</span></div>
    ${prayerTimesHTML(t, true)}
  </a>`;
});

/* Mise à jour du compte à rebours chaque minute */
setInterval(() => {
  if (!hasLocation()) return;
  const els = document.querySelectorAll('[data-countdown]');
  if (!els.length) return;
  const nx = nextPrayer();
  els.forEach(el => { el.textContent = untilText(nx.at); });
}, 30000);
