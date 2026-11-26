'use strict';
/* =========================================================
   Turath — Adhkār du matin et du soir, duʿāʾ
   Les passages du Coran (Āyat al-Kursī, al-Muʿawwidhāt…) sont
   affichés depuis le texte du lecteur (référence sourate:verset),
   pour éviter toute faute de recopie.
   ========================================================= */

function defaultAdhkar() {
  return [
    { period: 'both', quranRef: ['2:255'], title: 'Āyat al-Kursī', count: 1,
      fr: '', source: "An-Nasāʾī (as-Sunan al-Kubrā) et al-Ḥākim, authentifié par al-Albānī." },
    { period: 'both', quranRef: ['112:1-4', '113:1-5', '114:1-6'], title: 'Al-Ikhlāṣ, al-Falaq, an-Nās', count: 3,
      fr: 'Trois fois chacune, matin et soir.', source: 'Abū Dāwūd (5082), at-Tirmidhī (3575).' },
    { period: 'matin', ar: 'أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَٰهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ، رَبِّ أَسْأَلُكَ خَيْرَ مَا فِي هَٰذَا الْيَوْمِ وَخَيْرَ مَا بَعْدَهُ، وَأَعُوذُ بِكَ مِنْ شَرِّ مَا فِي هَٰذَا الْيَوْمِ وَشَرِّ مَا بَعْدَهُ، رَبِّ أَعُوذُ بِكَ مِنَ الْكَسَلِ وَسُوءِ الْكِبَرِ، رَبِّ أَعُوذُ بِكَ مِنْ عَذَابٍ فِي النَّارِ وَعَذَابٍ فِي الْقَبْرِ', count: 1,
      fr: "Nous voici au matin, et la royauté appartient à Allah. Louange à Allah. Nul ne mérite d'être adoré sauf Allah, Seul, sans associé ; à Lui la royauté, à Lui la louange, et Il est capable de toute chose. Seigneur, je Te demande le bien de ce jour et de ce qui le suit, et je cherche refuge auprès de Toi contre le mal de ce jour et de ce qui le suit. Seigneur, je cherche refuge auprès de Toi contre la paresse et les maux de la vieillesse ; Seigneur, je cherche refuge auprès de Toi contre un châtiment dans le Feu et un châtiment dans la tombe.",
      source: 'Muslim (2723).' },
    { period: 'soir', ar: 'أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَٰهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ، رَبِّ أَسْأَلُكَ خَيْرَ مَا فِي هَٰذِهِ اللَّيْلَةِ وَخَيْرَ مَا بَعْدَهَا، وَأَعُوذُ بِكَ مِنْ شَرِّ مَا فِي هَٰذِهِ اللَّيْلَةِ وَشَرِّ مَا بَعْدَهَا، رَبِّ أَعُوذُ بِكَ مِنَ الْكَسَلِ وَسُوءِ الْكِبَرِ، رَبِّ أَعُوذُ بِكَ مِنْ عَذَابٍ فِي النَّارِ وَعَذَابٍ فِي الْقَبْرِ', count: 1,
      fr: "Nous voici au soir, et la royauté appartient à Allah. Louange à Allah. Nul ne mérite d'être adoré sauf Allah, Seul, sans associé ; à Lui la royauté, à Lui la louange, et Il est capable de toute chose. Seigneur, je Te demande le bien de cette nuit et de ce qui la suit, et je cherche refuge auprès de Toi contre le mal de cette nuit et de ce qui la suit. Seigneur, je cherche refuge auprès de Toi contre la paresse et les maux de la vieillesse ; Seigneur, je cherche refuge auprès de Toi contre un châtiment dans le Feu et un châtiment dans la tombe.",
      source: 'Muslim (2723).' },
    { period: 'matin', ar: 'اللَّهُمَّ بِكَ أَصْبَحْنَا، وَبِكَ أَمْسَيْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ، وَإِلَيْكَ النُّشُورُ', count: 1,
      fr: 'Ô Allah, c\'est par Toi que nous atteignons le matin et le soir, par Toi que nous vivons et mourons, et vers Toi est la résurrection.',
      source: 'At-Tirmidhī (3391), Abū Dāwūd (5068).' },
    { period: 'soir', ar: 'اللَّهُمَّ بِكَ أَمْسَيْنَا، وَبِكَ أَصْبَحْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ، وَإِلَيْكَ الْمَصِيرُ', count: 1,
      fr: 'Ô Allah, c\'est par Toi que nous atteignons le soir et le matin, par Toi que nous vivons et mourons, et vers Toi est le retour.',
      source: 'At-Tirmidhī (3391), Abū Dāwūd (5068).' },
    { period: 'both', title: 'Sayyid al-istighfār', ar: 'اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَٰهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَىٰ عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ لَكَ بِذَنْبِي، فَاغْفِرْ لِي، فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ', count: 1,
      fr: "Ô Allah, Tu es mon Seigneur, nul ne mérite d'être adoré sauf Toi. Tu m'as créé et je suis Ton serviteur. Je respecte Ton engagement et Ta promesse autant que je le peux. Je cherche refuge auprès de Toi contre le mal que j'ai commis. Je reconnais Ton bienfait envers moi et je reconnais mon péché : pardonne-moi, car nul ne pardonne les péchés sauf Toi.",
      source: 'Al-Bukhārī (6306). Celui qui le dit avec certitude le matin et meurt ce jour-là fait partie des gens du Paradis, et de même le soir.' },
    { period: 'both', ar: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَافِيَةَ فِي الدُّنْيَا وَالْآخِرَةِ، اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَفْوَ وَالْعَافِيَةَ فِي دِينِي وَدُنْيَايَ وَأَهْلِي وَمَالِي، اللَّهُمَّ اسْتُرْ عَوْرَاتِي وَآمِنْ رَوْعَاتِي، اللَّهُمَّ احْفَظْنِي مِنْ بَيْنِ يَدَيَّ وَمِنْ خَلْفِي وَعَنْ يَمِينِي وَعَنْ شِمَالِي وَمِنْ فَوْقِي، وَأَعُوذُ بِعَظَمَتِكَ أَنْ أُغْتَالَ مِنْ تَحْتِي', count: 1,
      fr: "Ô Allah, je Te demande le salut dans ce monde et dans l'au-delà. Ô Allah, je Te demande le pardon et le salut dans ma religion, ma vie, ma famille et mes biens. Ô Allah, couvre mes défauts et apaise mes craintes. Ô Allah, protège-moi par-devant, par-derrière, à ma droite, à ma gauche et par-dessus, et je cherche refuge par Ta grandeur contre le fait d'être pris par en dessous.",
      source: 'Abū Dāwūd (5074), Ibn Mājah (3871).' },
    { period: 'both', ar: 'بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ', count: 3,
      fr: "Au nom d'Allah, avec le nom de Qui rien ne peut nuire sur terre ni dans le ciel, et Il est Celui qui entend tout, Celui qui sait tout.",
      source: 'Abū Dāwūd (5088), at-Tirmidhī (3388).' },
    { period: 'both', ar: 'يَا حَيُّ يَا قَيُّومُ بِرَحْمَتِكَ أَسْتَغِيثُ، أَصْلِحْ لِي شَأْنِي كُلَّهُ، وَلَا تَكِلْنِي إِلَىٰ نَفْسِي طَرْفَةَ عَيْنٍ', count: 1,
      fr: "Ô Vivant, ô Celui qui subsiste par Lui-même, c'est Ta miséricorde que j'implore : améliore toutes mes affaires et ne me confie pas à moi-même, ne serait-ce que le temps d'un clin d'œil.",
      source: 'An-Nasāʾī (as-Sunan al-Kubrā) et al-Ḥākim, jugé ḥasan par al-Albānī.' },
    { period: 'soir', ar: 'أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ', count: 3,
      fr: "Je cherche refuge auprès des paroles parfaites d'Allah contre le mal de ce qu'Il a créé.",
      source: 'Muslim (2709) ; « trois fois le soir » : at-Tirmidhī.' },
    { period: 'both', ar: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ', count: 100,
      fr: 'Gloire et louange à Allah.', source: 'Muslim (2692).' },
    { period: 'matin', ar: 'لَا إِلَٰهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ، وَهُوَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ', count: 100,
      fr: "Nul ne mérite d'être adoré sauf Allah, Seul, sans associé. À Lui la royauté, à Lui la louange, et Il est capable de toute chose. (Cent fois dans la journée.)",
      source: 'Al-Bukhārī (3293), Muslim (2691).' }
  ].map(x => ({ id: uid(), builtin: true, note: '', title: '', ...x }));
}
function defaultDuas() {
  return [
    { kind: 'coran', theme: 'Repentir', quranRef: ['7:23'], title: 'Le repentir d\'Ādam et Ḥawwāʾ', source: 'Coran, al-Aʿrāf 7:23' },
    { kind: 'coran', theme: 'Détresse', quranRef: ['21:87'], title: 'L\'invocation de Yūnus', source: 'Coran, al-Anbiyāʾ 21:87' },
    { kind: 'coran', theme: 'Bien des deux mondes', quranRef: ['2:201'], title: 'Le bien ici-bas et dans l\'au-delà', source: 'Coran, al-Baqara 2:201' },
    { kind: 'coran', theme: 'Fermeté', quranRef: ['3:8'], title: 'Ne pas laisser dévier nos cœurs', source: 'Coran, Āl ʿImrān 3:8' }
  ].map(x => ({ id: uid(), ar: '', fr: '', note: '', fav: false, ...x }));
}
NORMALIZERS.push((d) => {
  if (!Array.isArray(d.adhkar)) d.adhkar = defaultAdhkar();
  if (!Array.isArray(d.duas)) d.duas = defaultDuas();
  if (!d.dhikrDay || typeof d.dhikrDay !== 'object') d.dhikrDay = { date: '', counts: {} };
});
NORMALIZERS[NORMALIZERS.length - 1](data);

const DUA_KIND = { coran: 'Coran', sunna: 'Sunna', perso: 'Personnelle' };
ui.dhikrTab = null;
ui.duaTheme = 'all';
function dhikrCounts() {
  if (data.dhikrDay.date !== todayISO()) data.dhikrDay = { date: todayISO(), counts: {} };
  return data.dhikrDay.counts;
}
function defaultDhikrTab() {
  try {
    if (typeof hasLocation === 'function' && hasLocation()) {
      const t = todayTimes();
      return new Date() >= t.asr ? 'soir' : 'matin';
    }
  } catch (e) { /* calcul indisponible */ }
  return new Date().getHours() >= 15 ? 'soir' : 'matin';
}
const adhkarOf = (period) => data.adhkar.filter(a => a.period === period || a.period === 'both');
const countKey = (a, period) => `${period}:${a.id}`;
function periodProgress(period) {
  const c = dhikrCounts(), list = adhkarOf(period);
  return { done: list.filter(a => (c[countKey(a, period)] || 0) >= (+a.count || 1)).length, total: list.length };
}

/* ---------- Vues ---------- */
function renderDhikr() {
  if (!ui.dhikrTab) ui.dhikrTab = defaultDhikrTab();
  const tab = ui.dhikrTab;
  const pm = periodProgress('matin'), ps = periodProgress('soir');
  return hero({
    fr: tab === 'dua' ? 'Duʿāʾ' : 'Adhkār', ar: tab === 'dua' ? 'الدعاء' : 'الأذكار',
    sub: tab === 'dua' ? plural(data.duas.length, 'invocation') : `Matin ${pm.done}/${pm.total} · Soir ${ps.done}/${ps.total}`,
    extra: seg([['matin', 'Matin'], ['soir', 'Soir'], ['dua', 'Duʿāʾ']], tab, 'dh-tab'),
    actions: tab === 'dua' ? btnHero('dua-add', 'Duʿāʾ') : btnHero('dh-add', 'Dhikr') + btnHero('dh-reset', 'Recommencer', 'repeat')
  }) + content(tab === 'dua' ? duasView() : adhkarView(tab));
}
function adhkarView(period) {
  const c = dhikrCounts(), list = adhkarOf(period), pr = periodProgress(period);
  return `<div class="dh-progress"><span class="bar"><span style="width:${pr.total ? Math.round(pr.done / pr.total * 100) : 0}%"></span></span><span class="m">${pr.done} sur ${pr.total}${pr.done === pr.total && pr.total ? ' · Bārak Allāhu fīk' : ''}</span></div>
  <div class="dhikrs">${list.map(a => {
    const n = c[countKey(a, period)] || 0, total = +a.count || 1, done = n >= total;
    return `<article class="dhikr${done ? ' done' : ''}">
      <div class="dh-head">${a.title ? `<span class="t">${esc(a.title)}</span>` : ''}<span class="spacer"></span>
        <button class="icon-btn" data-action="dh-edit" data-id="${a.id}" aria-label="Modifier">${ic('edit')}</button></div>
      ${a.quranRef && a.quranRef.length ? quranRefBlock(a.quranRef) : ''}
      ${a.ar ? `<p class="dh-ar" lang="ar" dir="rtl">${esc(a.ar)}</p>` : ''}
      ${a.fr ? `<p class="dh-fr">${esc(a.fr)}</p>` : ''}
      ${a.source ? `<p class="dh-src">${esc(a.source)}</p>` : ''}
      <button class="counter" data-action="dh-count" data-id="${a.id}" data-period="${period}" aria-label="Compter">
        <span class="ring" style="--p:${Math.min(1, n / total)}"><span>${done ? ic('check') : n}</span></span>
        <span class="counter-l">${done ? 'Terminé' : `Touche pour compter · ${n} / ${total}`}</span>
      </button>
    </article>`;
  }).join('') || emptyBox('Aucun dhikr', '', 'dh-add', 'Ajouter un dhikr')}</div>
  <p class="m center pad">Les textes en arabe et leurs sources sont modifiables. Compare-les avec ton Ḥiṣn al-Muslim si tu as un doute.</p>`;
}
function duasView() {
  const themes = [...new Set(data.duas.map(d => d.theme).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'fr'));
  if (ui.duaTheme !== 'all' && ui.duaTheme !== 'fav' && !themes.includes(ui.duaTheme)) ui.duaTheme = 'all';
  const list = data.duas.filter(d => ui.duaTheme === 'all' || (ui.duaTheme === 'fav' ? d.fav : d.theme === ui.duaTheme));
  return `${chips([['all', 'Toutes', data.duas.length], ['fav', 'Favorites', data.duas.filter(d => d.fav).length], ...themes.map(t => [t, t, data.duas.filter(d => d.theme === t).length])], ui.duaTheme, 'dua-theme')}
  <div class="dhikrs">${list.map(d => `<article class="dhikr dua">
      <div class="dh-head"><span class="pill">${DUA_KIND[d.kind] || 'Duʿāʾ'}</span>${d.theme ? `<span class="tag">${esc(d.theme)}</span>` : ''}<span class="spacer"></span>
        <button class="icon-btn star${d.fav ? ' on' : ''}" data-action="dua-fav" data-id="${d.id}" aria-label="Favori">${ic('star')}</button>
        <button class="icon-btn" data-action="dua-edit" data-id="${d.id}" aria-label="Modifier">${ic('edit')}</button></div>
      ${d.title ? `<p class="t">${esc(d.title)}</p>` : ''}
      ${d.quranRef && d.quranRef.length ? quranRefBlock(d.quranRef) : ''}
      ${d.ar ? `<p class="dh-ar" lang="ar" dir="rtl">${esc(d.ar)}</p>` : ''}
      ${d.fr ? `<p class="dh-fr">${linkify(d.fr)}</p>` : ''}
      ${d.note ? `<p class="m">${linkify(d.note)}</p>` : ''}
      ${d.source ? `<p class="dh-src">${esc(d.source)}</p>` : ''}
    </article>`).join('') || emptyBox('Aucune duʿāʾ ici', 'Ajoute les invocations du Coran, de la Sunna, ou les tiennes.', 'dua-add', 'Ajouter une duʿāʾ')}</div>`;
}
function refField(item) {
  return `<label class="field">Passage du Coran (facultatif) <input name="quranRef" value="${esc((item.quranRef || []).join(', '))}" placeholder="Ex. 2:255 ou 112:1-4"></label>`;
}
const readRefs = (v) => String(v || '').split(/[,;\s]+/).map(x => x.trim()).filter(x => parseRef(x));
function dhikrForm(id) {
  const a = id ? data.adhkar.find(x => x.id === id) : { period: ui.dhikrTab === 'soir' ? 'soir' : 'matin', title: '', ar: '', fr: '', count: 1, source: '', quranRef: [] };
  openModal(id ? 'Modifier le dhikr' : 'Nouveau dhikr', `
    <label class="field">Titre (facultatif) <input name="title" value="${esc(a.title)}"></label>
    <label class="field">Texte arabe <textarea name="ar" rows="3" lang="ar" dir="rtl">${esc(a.ar || '')}</textarea></label>
    ${refField(a)}
    <label class="field">Sens en français <textarea name="fr" rows="3">${esc(a.fr || '')}</textarea></label>
    <div class="two">
      <label class="field">Moment <select name="period">
        <option value="matin" ${a.period === 'matin' ? 'selected' : ''}>Matin</option>
        <option value="soir" ${a.period === 'soir' ? 'selected' : ''}>Soir</option>
        <option value="both" ${a.period === 'both' ? 'selected' : ''}>Matin et soir</option></select></label>
      <label class="field">Nombre de fois <input type="number" name="count" min="1" max="1000" value="${+a.count || 1}" inputmode="numeric"></label>
    </div>
    <label class="field">Source <input name="source" value="${esc(a.source || '')}" placeholder="Ex. Muslim (2723)"></label>`,
    (fd) => {
      const obj = { title: fd.get('title').trim(), ar: fd.get('ar').trim(), fr: fd.get('fr').trim(), period: fd.get('period'), count: clamp(parseInt(fd.get('count'), 10) || 1, 1, 1000), source: fd.get('source').trim(), quranRef: readRefs(fd.get('quranRef')) };
      if (!obj.ar && !obj.quranRef.length && !obj.fr) { toast('Écris le texte du dhikr'); return false; }
      if (id) Object.assign(a, obj); else data.adhkar.push({ id: uid(), note: '', ...obj });
      save();
    }, { focus: !id, danger: id ? `<button type="button" class="btn danger" data-action="dh-del" data-id="${id}">Supprimer</button>` : '' });
}
function duaForm(id) {
  const d = id ? data.duas.find(x => x.id === id) : { kind: 'sunna', theme: '', title: '', ar: '', fr: '', source: '', note: '', quranRef: [] };
  const themes = [...new Set([...data.duas.map(x => x.theme).filter(Boolean), 'Repentir', 'Pardon', 'Parents', 'Science', 'Guidée', 'Détresse', 'Santé', 'Famille'])];
  openModal(id ? 'Modifier la duʿāʾ' : 'Nouvelle duʿāʾ', `
    <div class="two">
      <label class="field">Origine <select name="kind">${Object.entries(DUA_KIND).map(([k, l]) => `<option value="${k}" ${d.kind === k ? 'selected' : ''}>${l}</option>`).join('')}</select></label>
      <label class="field">Thème <input name="theme" list="dua-themes" value="${esc(d.theme)}"><datalist id="dua-themes">${themes.map(t => `<option value="${esc(t)}">`).join('')}</datalist></label>
    </div>
    <label class="field">Titre (facultatif) <input name="title" value="${esc(d.title)}"></label>
    <label class="field">Texte arabe <textarea name="ar" rows="3" lang="ar" dir="rtl">${esc(d.ar)}</textarea></label>
    ${refField(d)}
    <label class="field">Sens ou texte en français <textarea name="fr" rows="3">${esc(d.fr)}</textarea></label>
    <label class="field">Source <input name="source" value="${esc(d.source)}" placeholder="Ex. al-Bukhārī (6368)"></label>
    <label class="field">Note <textarea name="note" rows="2">${esc(d.note)}</textarea></label>`,
    (fd) => {
      const obj = Object.fromEntries(['kind', 'theme', 'title', 'ar', 'fr', 'source', 'note'].map(k => [k, String(fd.get(k) || '').trim()]));
      obj.quranRef = readRefs(fd.get('quranRef'));
      if (!obj.ar && !obj.fr && !obj.quranRef.length) { toast('Écris le texte de la duʿāʾ'); return false; }
      if (id) Object.assign(d, obj); else data.duas.unshift({ id: uid(), fav: false, ...obj });
      save();
    }, { focus: !id, danger: id ? `<button type="button" class="btn danger" data-action="dua-del" data-id="${id}">Supprimer</button>` : '' });
}

Object.assign(actions, {
  'dh-tab': (el) => { ui.dhikrTab = el.dataset.key; render(); },
  'dh-count': (el) => {
    const a = data.adhkar.find(x => x.id === el.dataset.id); if (!a) return;
    const period = el.dataset.period, c = dhikrCounts(), key = countKey(a, period), total = +a.count || 1;
    if ((c[key] || 0) >= total) return;
    c[key] = (c[key] || 0) + 1;
    try { if (navigator.vibrate) navigator.vibrate(c[key] >= total ? 30 : 8); } catch (e) { /* facultatif */ }
    const pr = periodProgress(period);
    if (pr.done === pr.total && typeof markMuhasaba === 'function') markMuhasaba(period === 'matin' ? 'adhkar_matin' : 'adhkar_soir');
    save();
    const card = el.closest('.dhikr');
    const n = c[key], done = n >= total;
    card.classList.toggle('done', done);
    el.querySelector('.ring').style.setProperty('--p', Math.min(1, n / total));
    el.querySelector('.ring span').innerHTML = done ? ic('check') : n;
    el.querySelector('.counter-l').textContent = done ? 'Terminé' : `Touche pour compter · ${n} / ${total}`;
    const bar = $('.dh-progress .bar span'), lab = $('.dh-progress .m');
    if (bar) bar.style.width = `${pr.total ? Math.round(pr.done / pr.total * 100) : 0}%`;
    if (lab) lab.textContent = `${pr.done} sur ${pr.total}${pr.done === pr.total && pr.total ? ' · Bārak Allāhu fīk' : ''}`;
    if (done && pr.done === pr.total) toast(`Adhkār du ${period} terminés. Bārak Allāhu fīk`);
  },
  'dh-reset': () => {
    const c = dhikrCounts(), period = ui.dhikrTab;
    Object.keys(c).forEach(k => { if (k.startsWith(period + ':')) delete c[k]; });
    save(); render();
  },
  'dh-add': () => dhikrForm(),
  'dh-edit': (el) => dhikrForm(el.dataset.id),
  'dh-del': (el) => { if (!confirm('Supprimer ce dhikr ?')) return; data.adhkar = data.adhkar.filter(x => x.id !== el.dataset.id); save(); closeModal(); render(); },
  'dua-theme': (el) => { ui.duaTheme = el.dataset.key; render(); },
  'dua-add': () => duaForm(),
  'dua-edit': (el) => duaForm(el.dataset.id),
  'dua-fav': (el) => { const d = data.duas.find(x => x.id === el.dataset.id); if (d) { d.fav = !d.fav; save(); render(); } },
  'dua-del': (el) => { if (!confirm('Supprimer cette duʿāʾ ?')) return; data.duas = data.duas.filter(x => x.id !== el.dataset.id); save(); closeModal(); render(); }
});

VIEWS.dhikr = renderDhikr;

HOME_CARDS.push(() => {
  const period = defaultDhikrTab(), pr = periodProgress(period);
  return `<a class="card home-dhikr" href="#/dhikr" data-action="dh-open" data-key="${period}">
    <span class="row-ico ${pr.done === pr.total ? '' : 'ico-red'}">${ic(period === 'matin' ? 'sun' : 'moon')}</span>
    <span class="grow"><span class="t">Adhkār du ${period}</span><span class="m">${pr.done === pr.total ? 'Terminés aujourd\'hui. Bārak Allāhu fīk' : `${pr.done} sur ${pr.total} · continuer`}</span></span>
    ${ic('chevron', 'chev')}</a>`;
});
actions['dh-open'] = (el) => { ui.dhikrTab = el.dataset.key; };
