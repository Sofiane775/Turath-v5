'use strict';
/* =========================================================
   Turath — Science : programmes d'étude, carnet de fawāʾid,
   et recherche globale.
   ========================================================= */

NORMALIZERS.push((d) => {
  if (!Array.isArray(d.programs)) d.programs = [];
  if (!Array.isArray(d.fawaid)) d.fawaid = [];
});
NORMALIZERS[NORMALIZERS.length - 1](data);

const LEITNER = [0, 1, 3, 7, 16, 35];
const progOf = (p) => { const done = p.lessons.filter(l => l.done).length; return { done, total: p.lessons.length, pct: p.lessons.length ? done / p.lessons.length : 0 }; };
const programById = (id) => data.programs.find(p => p.id === id);
const personById = (id) => data.scholars.find(s => s.id === id);
const dueFawaid = () => data.fawaid.filter(f => !f.next || f.next <= todayISO());
const addDays = (n) => { const d = new Date(); d.setDate(d.getDate() + n); return isoOf(d); };

/* ---------- Accueil Science ---------- */
function renderScience() {
  const cont = data.programs.map(p => ({ p, next: p.lessons.find(l => !l.done) })).find(x => x.next);
  const nDue = dueFawaid().length;
  const tiles = [
    { href: '#/programmes', icon: 'layers', t: "Programmes d'étude", d: plural(data.programs.length, 'programme'), ar: 'المتون' },
    { href: '#/fawaid', icon: 'bulb', t: 'Fawāʾid', d: `${plural(data.fawaid.length, 'bénéfice')}${nDue && data.fawaid.length ? ` · ${nDue} à revoir` : ''}`, ar: 'الفوائد' },
    { href: '#/hadiths', icon: 'hadith', t: 'Hadiths', d: plural(data.hadiths.length, 'hadith'), ar: 'الحديث' },
    { href: '#/savants', icon: 'scholars', t: 'Savants et étudiants', d: `${plural(data.scholars.length, 'profil')} · ${plural(allVideos().length, 'média')}`, ar: 'العلماء' },
    { href: '#/bibliotheque', icon: 'library', t: 'Bibliothèque', d: `${plural(data.books.length, 'livre')} · ${data.publishers.length} édition${data.publishers.length > 1 ? 's' : ''}`, ar: 'المكتبة' }
  ];
  return hero({ fr: 'Science', ar: 'العلم', sub: 'Étudier, retenir, garder ses sources' }) + content(`
    ${cont ? `<a class="card continue" href="#/programmes/${cont.p.id}">
      <div class="card-k">${ic('layers')}Continuer</div>
      <div class="t">${esc(cont.next.title)}</div><span class="m">${esc(cont.p.title)} · ${progOf(cont.p).done}/${progOf(cont.p).total} leçons</span>
      <span class="bar"><span style="width:${Math.round(progOf(cont.p).pct * 100)}%"></span></span></a>` : ''}
    ${nDue && data.fawaid.length ? `<button class="card continue soft-red" data-action="fa-review"><div class="card-k">${ic('bulb')}Révision</div><div class="t">${plural(nDue, 'faïda')} à revoir aujourd'hui</div><span class="m">Quelques minutes pour ancrer ce que tu as appris</span></button>` : ''}
    <div class="tiles">${tiles.map(x => `<a class="tile" href="${x.href}"><span class="row-ico">${ic(x.icon)}</span><span class="tile-ar" lang="ar">${x.ar}</span><span class="t">${x.t}</span><span class="m">${x.d}</span></a>`).join('')}</div>`);
}

/* ---------- Programmes ---------- */
function renderPrograms() {
  return hero({
    fr: "Programmes d'étude", ar: 'المتون', back: `<a class="hero-back" href="#/science">${ic('back')}Science</a>`,
    sub: 'Un texte, ses leçons, ta progression', actions: btnHero('pg-add', 'Programme')
  }) + content(data.programs.length ? `<ul class="group">${data.programs.map(p => {
    const pr = progOf(p), t = personById(p.teacherId);
    return `<li><a class="row plain" href="#/programmes/${p.id}">
      <span class="ring sm" style="--p:${pr.pct}"><span>${Math.round(pr.pct * 100)}%</span></span>
      <span class="grow"><span class="t">${esc(p.title)}</span><span class="m">${[p.author && esc(p.author), (t ? t.name : p.teacherName) && `expliqué par ${esc(t ? t.name : p.teacherName)}`].filter(Boolean).join(' · ')}</span><span class="m">${pr.done}/${pr.total} leçons</span></span>
      ${ic('chevron', 'chev')}</a></li>`;
  }).join('')}</ul>` : emptyBox("Aucun programme d'étude", "Exemple : Al-Uṣūl ath-Thalātha expliqué par un savant, en 12 leçons. Chaque leçon peut être liée à une vidéo ou un audio de son profil.", 'pg-add', 'Créer un programme'));
}
function renderProgram(id) {
  const p = programById(id);
  if (!p) return hero({ fr: 'Introuvable', ar: 'المتون', back: `<a class="hero-back" href="#/programmes">${ic('back')}Programmes</a>` }) + content(emptyBox('Ce programme n\'existe plus.'));
  const pr = progOf(p), t = personById(p.teacherId), next = p.lessons.find(l => !l.done);
  return hero({
    fr: esc(p.title), ar: 'المتن', back: `<a class="hero-back" href="#/programmes">${ic('back')}Programmes</a>`,
    sub: [p.author && esc(p.author), (t ? t.name : p.teacherName) && `expliqué par ${esc(t ? t.name : p.teacherName)}`].filter(Boolean).join(' · '),
    extra: `<div class="pg-progress"><span class="bar"><span style="width:${Math.round(pr.pct * 100)}%"></span></span><span>${pr.done}/${pr.total} leçons · ${Math.round(pr.pct * 100)} %</span></div>`,
    actions: (next ? `<button class="btn on-dark" data-action="ls-open" data-pid="${p.id}" data-id="${next.id}">${ic('play')}Leçon suivante</button>` : '') + btnHero('ls-add', 'Leçons', 'plus', `data-id="${p.id}"`) + btnHero('pg-edit', 'Modifier', 'edit', `data-id="${p.id}"`)
  }) + content(`
    ${p.description ? `<p class="lead">${linkify(p.description)}</p>` : ''}
    ${p.lessons.length ? `<ul class="group">${p.lessons.map((l, i) => {
      const media = lessonMedia(p, l);
      return `<li class="row lesson${l.done ? ' done' : ''}">
        <button class="checkbox-btn" data-action="ls-toggle" data-pid="${p.id}" data-id="${l.id}" aria-label="${l.done ? 'Marquer non suivie' : 'Marquer suivie'}"><span class="checkbox">${ic('check')}</span></button>
        <button class="grow plain" data-action="ls-open" data-pid="${p.id}" data-id="${l.id}"><span class="t">${esc(l.title || `Leçon ${i + 1}`)}</span>
          <span class="m">${[media ? PLATFORM_LABEL[media.kind] || 'Média' : '', l.done && l.doneAt ? `suivie le ${fmtDate(l.doneAt)}` : '', l.notes ? 'notes' : ''].filter(Boolean).join(' · ') || 'Touche pour ajouter la vidéo et tes notes'}</span></button>
        ${media ? `<button class="play-round" data-action="ls-play" data-pid="${p.id}" data-id="${l.id}" aria-label="Lire">${ic('play')}</button>` : ''}
      </li>`;
    }).join('')}</ul>` : emptyBox('Aucune leçon', 'Ajoute les leçons du programme : tu peux en créer plusieurs d\'un coup.', 'ls-add-here', 'Ajouter des leçons')}`);
}
function lessonMedia(p, l) {
  if (l.mediaOid && l.mediaId) {
    const { item } = findItem('scholar', l.mediaOid, l.mediaId);
    if (item) return { kind: mediaKind(item), item, oid: l.mediaOid };
  }
  if (l.url) return { kind: parseMedia(l.url).platform, url: l.url };
  return null;
}
function playLesson(p, l) {
  const m = lessonMedia(p, l);
  if (!m) { lessonForm(p.id, l.id); return; }
  if (m.item) { playItem('scholar', m.oid, m.item.id); return; }
  const pm = parseMedia(m.url);
  if (pm.platform === 'youtube' || pm.platform === 'instagram') {
    openModal(l.title || 'Leçon', `<div class="modal-media${pm.vertical || pm.platform === 'instagram' ? ' vertical' : ''}"><iframe src="${esc(embedSrc(pm))}" title="Leçon" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe></div>`);
  } else window.open(m.url, '_blank', 'noopener');
}
function programForm(id) {
  const p = id ? programById(id) : { title: '', author: '', teacherId: '', teacherName: '', description: '' };
  const people = data.scholars;
  openModal(id ? 'Modifier le programme' : "Nouveau programme d'étude", `
    <label class="field">Texte étudié <input name="title" required value="${esc(p.title)}" placeholder="Ex. Al-Uṣūl ath-Thalātha"></label>
    <label class="field">Auteur du texte <input name="author" value="${esc(p.author)}" placeholder="Ex. Muḥammad ibn ʿAbd al-Wahhāb"></label>
    <label class="field">Expliqué par <select name="teacherId"><option value="">— Autre / non précisé —</option>${people.map(s => `<option value="${s.id}" ${p.teacherId === s.id ? 'selected' : ''}>${esc(s.name)}</option>`).join('')}</select></label>
    <label class="field">Ou nom de celui qui explique (s'il n'est pas dans ton carnet) <input name="teacherName" value="${esc(p.teacherName || '')}"></label>
    ${id ? '' : `<label class="field">Nombre de leçons à créer <input type="number" name="count" min="0" max="200" value="10" inputmode="numeric"></label>`}
    <label class="field">Description (facultatif) <textarea name="description" rows="3">${esc(p.description || '')}</textarea></label>`,
    (fd) => {
      const obj = Object.fromEntries(['title', 'author', 'teacherId', 'teacherName', 'description'].map(k => [k, String(fd.get(k) || '').trim()]));
      if (!obj.title) return false;
      if (id) Object.assign(p, obj);
      else {
        const n = clamp(parseInt(fd.get('count'), 10) || 0, 0, 200);
        const np = { id: uid(), createdAt: todayISO(), ...obj, lessons: Array.from({ length: n }, (_, i) => ({ id: uid(), title: `Leçon ${i + 1}`, done: false, notes: '' })) };
        data.programs.push(np);
        setTimeout(() => { location.hash = `#/programmes/${np.id}`; }, 0);
      }
      save();
    }, { focus: !id, danger: id ? `<button type="button" class="btn danger" data-action="pg-del" data-id="${id}">Supprimer</button>` : '' });
}
function addLessonsForm(pid) {
  const p = programById(pid); if (!p) return;
  openModal('Ajouter des leçons', `
    <label class="field">Une leçon par ligne <textarea name="titles" rows="6" placeholder="Leçon ${p.lessons.length + 1}&#10;Leçon ${p.lessons.length + 2}"></textarea></label>
    <label class="field">Ou nombre de leçons numérotées à ajouter <input type="number" name="count" min="0" max="200" value="" inputmode="numeric"></label>`,
    (fd) => {
      let titles = String(fd.get('titles') || '').split('\n').map(x => x.trim()).filter(Boolean);
      const n = clamp(parseInt(fd.get('count'), 10) || 0, 0, 200);
      if (!titles.length && n) titles = Array.from({ length: n }, (_, i) => `Leçon ${p.lessons.length + i + 1}`);
      if (!titles.length) { toast('Écris au moins une leçon'); return false; }
      titles.forEach(t => p.lessons.push({ id: uid(), title: t, done: false, notes: '' }));
      save();
    }, { focus: true });
}
function lessonForm(pid, lid) {
  const p = programById(pid); if (!p) return;
  const l = p.lessons.find(x => x.id === lid); if (!l) return;
  const teacher = personById(p.teacherId);
  const vids = teacher ? teacher.videos : [];
  const others = data.scholars.filter(s => s !== teacher && s.videos.length);
  const opt = (s, v) => `<option value="${s.id}|${v.id}" ${l.mediaOid === s.id && l.mediaId === v.id ? 'selected' : ''}>${esc(v.title || 'Sans titre')}${v.theme ? ` · ${esc(v.theme)}` : ''}</option>`;
  openModal(l.title || 'Leçon', `
    <label class="field">Titre <input name="title" value="${esc(l.title)}"></label>
    <label class="field">Vidéo ou audio de la leçon
      <select name="media"><option value="">— Aucun / lien ci-dessous —</option>
        ${teacher && vids.length ? `<optgroup label="${esc(teacher.name)}">${vids.map(v => opt(teacher, v)).join('')}</optgroup>` : ''}
        ${others.map(s => `<optgroup label="${esc(s.name)}">${s.videos.map(v => opt(s, v)).join('')}</optgroup>`).join('')}
      </select></label>
    <label class="field">Ou lien (YouTube, Instagram…) <input name="url" type="url" value="${esc(l.url || '')}" placeholder="https://…"></label>
    <label class="field">Mes notes <textarea name="notes" rows="5">${esc(l.notes || '')}</textarea></label>
    <label class="check-line"><input type="checkbox" name="done" ${l.done ? 'checked' : ''}> Leçon suivie</label>
    <div class="row-actions">
      ${lessonMedia(p, l) ? `<button type="button" class="btn" data-action="ls-play" data-pid="${p.id}" data-id="${l.id}">${ic('play')}Lire</button>` : ''}
      <button type="button" class="btn" data-action="ls-faida" data-pid="${p.id}" data-id="${l.id}">${ic('bulb')}Noter une faïda</button>
    </div>`,
    (fd) => {
      const media = String(fd.get('media') || '');
      const [mOid, mId] = media ? media.split('|') : ['', ''];
      const done = !!fd.get('done');
      Object.assign(l, { title: fd.get('title').trim(), url: String(fd.get('url') || '').trim(), mediaOid: mOid, mediaId: mId, notes: fd.get('notes').trim() });
      if (done && !l.done) l.doneAt = todayISO();
      l.done = done;
      save();
    }, { danger: `<button type="button" class="btn danger" data-action="ls-del" data-pid="${p.id}" data-id="${l.id}">Supprimer</button>` });
}

/* ---------- Fawāʾid ---------- */
ui.faTheme = 'all'; ui.faQuery = '';
function renderFawaid() {
  const nDue = dueFawaid().length;
  return hero({
    fr: 'Fawāʾid', ar: 'الفوائد', back: `<a class="hero-back" href="#/science">${ic('back')}Science</a>`,
    sub: `${plural(data.fawaid.length, 'bénéfice')} noté${data.fawaid.length > 1 ? 's' : ''}${nDue && data.fawaid.length ? ` · ${nDue} à revoir` : ''}`,
    actions: btnHero('fa-add', 'Faïda') + (data.fawaid.length ? btnHero('fa-review', nDue ? `Réviser (${nDue})` : 'Réviser', 'repeat') : '')
  }) + content(data.fawaid.length ? `
    ${searchBox('fa-query', ui.faQuery, 'Chercher dans tes fawāʾid')}
    ${(() => { const th = [...new Set(data.fawaid.map(f => f.theme).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'fr')); if (ui.faTheme !== 'all' && !th.includes(ui.faTheme)) ui.faTheme = 'all'; return th.length ? chips([['all', 'Tous', data.fawaid.length], ...th.map(t => [t, t, data.fawaid.filter(f => f.theme === t).length])], ui.faTheme, 'fa-theme') : ''; })()}
    <div class="fawaid" id="fa-list">${fawaidListHTML()}</div>`
    : emptyBox('Ton carnet est vide', "Note ici ce que tu retiens d'un cours, d'un livre ou d'un hadith. Ajoute une question si tu veux t'en servir comme fiche de révision.", 'fa-add', 'Noter une faïda'));
}
function fawaidListHTML() {
  const q = norm(ui.faQuery);
  const list = data.fawaid.filter(f => (ui.faTheme === 'all' || f.theme === ui.faTheme) && (!q || norm(`${f.text} ${f.question} ${f.theme} ${f.source}`).includes(q)))
    .sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
  if (!list.length) return `<p class="m pad">Aucune faïda ne correspond.</p>`;
  return list.map(f => `<button class="faida" data-action="fa-edit" data-id="${f.id}">
    ${f.question ? `<span class="fa-q">${esc(f.question)}</span>` : ''}
    <span class="fa-t">${esc(f.text)}</span>
    <span class="fa-meta">${f.theme ? `<span class="tag">${esc(f.theme)}</span>` : ''}${f.source ? `<span class="m">${esc(f.source)}</span>` : ''}</span>
  </button>`).join('');
}
function faidaForm(id, preset = {}) {
  const f = id ? data.fawaid.find(x => x.id === id) : { text: '', question: '', theme: '', source: '', ...preset };
  const themes = [...new Set([...data.fawaid.map(x => x.theme).filter(Boolean), ...DEFAULT_THEMES])];
  const sources = [...data.books.map(b => `Livre : ${b.title}`), ...data.programs.map(p => `Cours : ${p.title}`)];
  openModal(id ? 'Modifier la faïda' : 'Nouvelle faïda', `
    <label class="field">Le bénéfice <textarea name="text" rows="5" required>${esc(f.text)}</textarea></label>
    <label class="field">Question pour te tester (facultatif) <input name="question" value="${esc(f.question || '')}" placeholder="Ex. Quelles sont les conditions du repentir ?"></label>
    <div class="two">
      <label class="field">Thème <input name="theme" list="fa-themes" value="${esc(f.theme)}"><datalist id="fa-themes">${themes.map(t => `<option value="${esc(t)}">`).join('')}</datalist></label>
      <label class="field">Source <input name="source" list="fa-sources" value="${esc(f.source)}" placeholder="Cours, livre, hadith…"><datalist id="fa-sources">${sources.map(t => `<option value="${esc(t)}">`).join('')}</datalist></label>
    </div>`,
    (fd) => {
      const obj = Object.fromEntries(['text', 'question', 'theme', 'source'].map(k => [k, String(fd.get(k) || '').trim()]));
      if (!obj.text) { toast('Écris la faïda'); return false; }
      if (id) Object.assign(f, obj); else data.fawaid.unshift({ id: uid(), createdAt: todayISO(), box: 0, next: todayISO(), ...obj });
      save();
      if (!id) toast('Faïda notée');
    }, { focus: true, danger: id ? `<button type="button" class="btn danger" data-action="fa-del" data-id="${id}">Supprimer</button>` : '' });
}
const review = { queue: [], i: 0, shown: false, good: 0 };
function startReview() {
  let q = dueFawaid();
  if (!q.length) q = [...data.fawaid];
  review.queue = q.sort(() => Math.random() - 0.5).slice(0, 20).map(f => f.id);
  Object.assign(review, { i: 0, shown: false, good: 0 });
  showReviewCard();
}
function showReviewCard() {
  const id = review.queue[review.i];
  const f = data.fawaid.find(x => x.id === id);
  if (!f) {
    openModal('Révision terminée', `<div class="review-end"><p class="sheet-ar" lang="ar">بارك الله فيك</p><p>${review.good} sur ${review.queue.length} retenues. Les autres reviendront demain.</p></div>`);
    return;
  }
  const front = f.question || [f.theme, f.source].filter(Boolean).join(' · ') || 'Te souviens-tu de cette faïda ?';
  openModal(`Révision ${review.i + 1}/${review.queue.length}`, `
    <div class="flash">
      <p class="flash-front">${esc(front)}</p>
      ${review.shown ? `<p class="flash-back">${linkify(f.text)}</p>${f.source ? `<p class="m">${esc(f.source)}</p>` : ''}
        <div class="row-actions flash-actions">
          <button type="button" class="btn" data-action="fa-answer" data-ok="0">À revoir</button>
          <button type="button" class="btn primary" data-action="fa-answer" data-ok="1">${ic('check')}Je savais</button></div>`
      : `<div class="row-actions flash-actions"><button type="button" class="btn primary" data-action="fa-show">Afficher la réponse</button></div>`}
    </div>`);
}

/* ---------- Recherche globale ---------- */
ui.searchQ = '';
function renderSearch() {
  return hero({ fr: 'Recherche', ar: 'البحث', sub: 'Sourates, hadiths, adhkār, fawāʾid, livres, vidéos…' }) + content(`
    ${searchBox('global-search', ui.searchQ, 'Que cherches-tu ?')}
    <div id="search-results">${searchResultsHTML()}</div>`);
}
function searchResultsHTML() {
  const raw = ui.searchQ.trim(), q = norm(raw);
  if (q.length < 2) return `<p class="m pad">Tape au moins deux lettres.</p>`;
  const hit = (...xs) => norm(xs.join(' ')).includes(q);
  const groups = [];
  const add = (title, items) => { if (items.length) groups.push({ title, items: items.slice(0, 8), more: Math.max(0, items.length - 8) }); };
  add('Sourates', SURAHS.map((s, i) => ({ n: i + 1, s })).filter(x => hit(x.s[0], x.s[1]) || String(x.n) === raw || (sState(x.n).notes && hit(sState(x.n).notes)))
    .map(x => `<a class="row plain" href="#/lire/${x.n}"><span class="num">${x.n}</span><span class="grow"><span class="t">${x.s[0]}</span>${sState(x.n).notes && hit(sState(x.n).notes) ? `<span class="m clamp1">${esc(sState(x.n).notes)}</span>` : ''}</span><span class="ar-name sm" lang="ar">${x.s[1]}</span></a>`));
  add('Hadiths', data.hadiths.filter(h => hit(h.ar, h.fr, h.narrator, h.source, h.theme, h.notes))
    .map(h => `<button class="row plain" data-action="open-hadith" data-id="${h.id}"><span class="row-ico">${ic('hadith')}</span><span class="grow"><span class="t clamp1">${esc(h.fr || h.ar)}</span><span class="m">${esc(h.source || '')}</span></span></button>`));
  add('Fawāʾid', data.fawaid.filter(f => hit(f.text, f.question, f.theme, f.source))
    .map(f => `<button class="row plain" data-action="fa-edit" data-id="${f.id}"><span class="row-ico">${ic('bulb')}</span><span class="grow"><span class="t clamp1">${esc(f.question || f.text)}</span><span class="m">${esc(f.source || f.theme || '')}</span></span></button>`));
  add('Adhkār et duʿāʾ', [...data.adhkar.map(a => ({ a, k: 'dh' })), ...data.duas.map(a => ({ a, k: 'dua' }))].filter(x => hit(x.a.title, x.a.ar, x.a.fr, x.a.source, x.a.theme, (x.a.quranRef || []).map(refLabel).join(' ')))
    .map(x => `<button class="row plain" data-action="${x.k === 'dh' ? 'dh-edit' : 'dua-edit'}" data-id="${x.a.id}"><span class="row-ico">${ic('hands')}</span><span class="grow"><span class="t clamp1">${esc(x.a.title || x.a.fr || x.a.ar || (x.a.quranRef || []).map(refLabel).join(', '))}</span><span class="m">${x.k === 'dh' ? 'Dhikr' : 'Duʿāʾ'}${x.a.source ? ' · ' + esc(x.a.source) : ''}</span></span></button>`));
  add("Programmes d'étude", data.programs.flatMap(p => [
    ...(hit(p.title, p.author, p.description, p.teacherName) ? [`<a class="row plain" href="#/programmes/${p.id}"><span class="row-ico">${ic('layers')}</span><span class="grow"><span class="t">${esc(p.title)}</span><span class="m">${esc(p.author || '')}</span></span></a>`] : []),
    ...p.lessons.filter(l => hit(l.title, l.notes)).map(l => `<button class="row plain" data-action="ls-open" data-pid="${p.id}" data-id="${l.id}"><span class="row-ico">${ic('layers')}</span><span class="grow"><span class="t">${esc(l.title)}</span><span class="m">${esc(p.title)}</span></span></button>`)
  ]));
  add('Savants, étudiants et récitateurs', [
    ...data.scholars.filter(s => hit(s.name, s.nameAr, s.bio, s.studies, s.teachers)).map(s => `<a class="row plain" href="#/savants/${s.id}"><span class="seal sm">${seal(s)}</span><span class="grow"><span class="t">${esc(s.name)}</span><span class="m">${catOf(s) === 'student' ? 'Étudiant en science' : 'Savant'}</span></span></a>`),
    ...data.reciters.filter(r => hit(r.name, r.nameAr, r.riwaya)).map(r => `<a class="row plain" href="#/recitateurs/${r.id}"><span class="seal sm">${seal(r)}</span><span class="grow"><span class="t">${esc(r.name)}</span><span class="m">Récitateur</span></span></a>`)
  ]);
  add('Vidéos et audios', [
    ...allVideos().filter(x => hit(x.v.title, x.v.theme, x.v.notes, x.v.source)).map(x => `<a class="row plain" href="#/savants/${x.sc.id}"><span class="row-ico">${ic('play')}</span><span class="grow"><span class="t">${esc(x.v.title || 'Sans titre')}</span><span class="m">${esc(x.sc.name)}${x.v.theme ? ' · ' + esc(x.v.theme) : ''}</span></span></a>`),
    ...data.reciters.flatMap(r => r.recitations.filter(x => hit(x.title, x.notes, x.source, x.surah ? S(+x.surah).fr : '')).map(x => `<a class="row plain" href="#/recitateurs/${r.id}"><span class="row-ico">${ic('headphones')}</span><span class="grow"><span class="t">${esc(recTitle(x))}</span><span class="m">${esc(r.name)}</span></span></a>`))
  ]);
  add('Livres et éditions', [
    ...data.books.filter(b => hit(b.title, b.author, b.publisher, b.summary, b.benefits)).map(b => `<button class="row plain" data-action="open-book" data-id="${b.id}"><span class="row-ico">${ic('library')}</span><span class="grow"><span class="t">${esc(b.title)}</span><span class="m">${esc(b.author || '')}</span></span></button>`),
    ...data.publishers.filter(p => hit(p.name, p.reason, p.sources)).map(p => `<button class="row plain" data-action="open-pub" data-id="${p.id}"><span class="v-dot v-${p.verdict}"></span><span class="grow"><span class="t">${esc(p.name)}</span><span class="m">${VERDICTS[p.verdict]}</span></span></button>`)
  ]);
  if (!groups.length) return `<div class="empty"><p class="empty-t">Aucun résultat</p><p class="empty-d">Essaie un autre mot, sans accents si besoin.</p></div>`;
  return groups.map(g => `<section class="block"><div class="block-head"><h2>${g.title}</h2>${g.more ? `<span class="m">+${g.more}</span>` : ''}</div><ul class="group">${g.items.map(x => `<li>${x}</li>`).join('')}</ul></section>`).join('');
}
INPUTS['global-search'] = (e) => { ui.searchQ = e.target.value; $('#search-results').innerHTML = searchResultsHTML(); };
INPUTS['fa-query'] = (e) => { ui.faQuery = e.target.value; $('#fa-list').innerHTML = fawaidListHTML(); };
AFTER_RENDER.push((page) => {
  if (page === 'recherche') { const i = $('#view input[type=search]'); if (i && window.matchMedia('(min-width: 900px)').matches) i.focus(); }
});

/* ---------- Actions ---------- */
Object.assign(actions, {
  'pg-add': () => programForm(),
  'pg-edit': (el) => programForm(el.dataset.id),
  'pg-del': (el) => {
    const p = programById(el.dataset.id);
    if (!p || !confirm(`Supprimer le programme « ${p.title} » ?`)) return;
    data.programs = data.programs.filter(x => x !== p); save(); closeModal(); location.hash = '#/programmes';
  },
  'ls-add': (el) => addLessonsForm(el.dataset.id),
  'ls-add-here': () => addLessonsForm(currentRoute.param),
  'ls-open': (el) => lessonForm(el.dataset.pid, el.dataset.id),
  'ls-toggle': (el) => {
    const p = programById(el.dataset.pid), l = p && p.lessons.find(x => x.id === el.dataset.id); if (!l) return;
    l.done = !l.done; if (l.done) l.doneAt = todayISO();
    save(); render();
    if (l.done && progOf(p).done === progOf(p).total) toast(`Programme terminé. Bārak Allāhu fīk !`);
  },
  'ls-play': (el) => { const p = programById(el.dataset.pid), l = p && p.lessons.find(x => x.id === el.dataset.id); if (l) { if (!$('#modal').hidden) closeModal(); playLesson(p, l); } },
  'ls-faida': (el) => { const p = programById(el.dataset.pid), l = p && p.lessons.find(x => x.id === el.dataset.id); if (l) faidaForm(null, { source: `Cours : ${p.title} · ${l.title}` }); },
  'ls-del': (el) => {
    const p = programById(el.dataset.pid); if (!p || !confirm('Supprimer cette leçon ?')) return;
    p.lessons = p.lessons.filter(x => x.id !== el.dataset.id); save(); closeModal(); render();
  },
  'fa-add': () => faidaForm(),
  'fa-edit': (el) => faidaForm(el.dataset.id),
  'fa-del': (el) => { if (!confirm('Supprimer cette faïda ?')) return; data.fawaid = data.fawaid.filter(x => x.id !== el.dataset.id); save(); closeModal(); render(); },
  'fa-theme': (el) => { ui.faTheme = el.dataset.key; render(); },
  'fa-review': () => startReview(),
  'fa-show': () => { review.shown = true; showReviewCard(); },
  'fa-answer': (el) => {
    const f = data.fawaid.find(x => x.id === review.queue[review.i]);
    if (f) {
      if (el.dataset.ok === '1') { f.box = Math.min((f.box || 0) + 1, LEITNER.length - 1); review.good++; }
      else f.box = 0;
      f.next = addDays(Math.max(1, LEITNER[f.box || 0]));
      save();
    }
    review.i++; review.shown = false;
    showReviewCard();
    if (review.i >= review.queue.length && currentRoute.page === 'fawaid') setTimeout(render, 0);
  }
});

VIEWS.science = renderScience;
VIEWS.programmes = renderPrograms;
PARAM_VIEWS.programmes = (p) => renderProgram(p);
VIEWS.fawaid = renderFawaid;
VIEWS.recherche = renderSearch;
