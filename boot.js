'use strict';
/* Turath — démarrage (chargé en dernier, après tous les modules) */
NORMALIZERS.forEach(fn => fn(data));
applyTheme();
render();
if ('serviceWorker' in navigator && location.protocol === 'https:') {
  navigator.serviceWorker.register('sw.js').catch(() => { /* hors GitHub Pages : pas grave */ });
}
