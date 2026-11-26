# Turath — تراث

Carnet personnel de l'étudiant : mémorisation du Coran, hadiths, vidéos de savants classées par thème, bibliothèque avec résumés, et maisons d'édition avec leurs preuves.

Le design s'inspire de la reliure d'un livre ancien : un cadre d'encre sombre autour de pages claires, avec une seule encre rouge pour les titres.

Application web **responsive** (téléphone, tablette, ordinateur), **installable** sur l'écran d'accueil et utilisable **hors ligne**. Aucun serveur ni compte : tout est en HTML, CSS et JavaScript.

## Fonctionnalités

- **Coran** : les 114 sourates avec un statut (non commencée, en cours, mémorisée), le dernier verset mémorisé, des notes, et la date de dernière révision. Les sourates sont signalées « à réviser » après X jours (réglable). Tu peux aussi enregistrer ton point d'arrêt, filtrer, chercher, et afficher dans l'ordre 114 → 1 (en commençant par Juz ʿAmma).
- **Récitations** (dans Coran → Récitateurs) : un profil par récitateur, avec sa lecture (riwāya), et ses récitations associées à une sourate. Les liens MP3 se lisent dans le lecteur intégré, qui continue de jouer quand tu changes de page et s'affiche sur l'écran verrouillé. Les liens YouTube et Instagram s'ouvrent dans l'appli. Une sourate qui a une récitation affiche un petit casque.
- **Hadiths** : le texte arabe, la traduction du sens, le rapporteur, la source (recueil et numéro), l'authenticité (ṣaḥīḥ, ḥasan, ḍaʿīf, mawḍūʿ, à vérifier) et qui l'a authentifié, avec un thème et une explication. Tu peux aussi suivre ceux que tu as appris et ceux qu'il faut réviser.
- **Étudiants en science** (dans Savants → Étudiants) : une mini-biographie, son parcours, ses enseignants (cliquables s'ils sont aussi dans ton carnet), ses comptes, et ses vidéos et audios.
- **Vidéos et audios importés** : pour les savants, les étudiants et les récitateurs, tu peux importer une vidéo ou un audio enregistré sur ton téléphone au lieu d'un lien, et noter le compte d'où tu l'as pris. Ces fichiers restent sur le téléphone et ne sont pas inclus dans la sauvegarde .json.
- **Savants** : un profil par savant avec ses vidéos **YouTube** (vidéos et Shorts) et **Instagram** (reels et posts), lisibles directement dans l'appli et classées par thème. Une vue « Par thème » regroupe les vidéos de tous les savants.
- **Bibliothèque → Livres** : livres lus, en cours ou à lire, avec résumé, bénéfices (fawāʾid), maison d'édition et la personne qui te l'a recommandé.
- **Bibliothèque → Maisons d'édition** : fiable, avec prudence ou à éviter, avec une explication et la liste des preuves et sources. Le badge de l'édition s'affiche automatiquement sur tes livres.
- **Accueil** : les dates grégorienne et hégirienne, ton point d'arrêt, la carte du Coran (114 cases qui se remplissent au fil de ta mémorisation), ce qu'il faut réviser (sourates et hadiths), ta série de jours d'affilée et tes lectures en cours.
- **Sauvegarde** : export et import en fichier `.json`, thème clair ou sombre.

## Nouveautés de la version 5

- **Lecture du Coran dans l'appli** : texte avec les couleurs du tajwid (et sa légende), traduction française (Muḥammad Ḥamīdullāh), récitation verset par verset avec le verset en cours surligné, répétition de chaque verset (pour mémoriser), mode test (versets floutés à réciter de mémoire), point d'arrêt et mémorisation verset par verset. Chaque sourate ouverte reste disponible hors ligne ; Réglages permet de télécharger tout le Coran.
- **Prière** : horaires calculés sur le téléphone à partir de ta position (plusieurs méthodes, ʿAṣr majoritaire ou ḥanafite, ajustements à la minute), prochaine prière avec compte à rebours, direction de la qibla.
- **Muḥāsaba** : chaque prière cochée (à l'heure ou en retard), ta liste d'actions du jour, une note personnelle, et tes 7 derniers jours.
- **Dhikr** : adhkār du matin et du soir avec leurs sources et un compteur (remis à zéro chaque jour), et un carnet de duʿāʾ (Coran, Sunna, personnelles) par thème, avec favoris.
- **Science** : programmes d'étude leçon par leçon (liées aux vidéos des savants), carnet de fawāʾid avec révision espacée, et accès aux hadiths, savants et à la bibliothèque.
- **Recherche globale** : la loupe en haut de l'écran cherche partout.

Sources des données en ligne : texte, tajwid et traduction via [alquran.cloud](https://alquran.cloud) ; récitations via le CDN d'Islamic Network.

## Mettre en ligne avec GitHub Pages (gratuit)

1. Crée un compte sur [github.com](https://github.com), puis un nouveau dépôt (**New repository**), par exemple `turath`.
2. Dans le dépôt, clique sur **Add file → Upload files** et dépose tous les fichiers du dossier (17). Valide avec **Commit changes**.
3. Va dans **Settings → Pages**. Sous *Build and deployment*, choisis **Deploy from a branch**, la branche **main** et le dossier **/ (root)**, puis **Save**.
4. Après une ou deux minutes, ton appli est en ligne à l'adresse `https://ton-pseudo.github.io/turath/`.

**L'installer sur ton téléphone :**
- Sur iPhone, ouvre le lien dans Safari, puis **Partager → Sur l'écran d'accueil**.
- Sur Android, ouvre le lien dans Chrome, puis **⋮ → Installer l'application**.

## Où sont mes données ?

Tes données sont enregistrées **uniquement dans le navigateur de ton appareil** (`localStorage`). Elles ne sont pas sur GitHub et personne d'autre ne les voit, même si le dépôt est public.

Ça veut aussi dire que :
- si tu vides les données du navigateur, elles sont perdues. **Exporte régulièrement** une sauvegarde depuis Réglages ;
- pour passer d'un appareil à un autre, exporte le fichier sur le premier et importe-le sur le second.

## Modifier l'appli

| Fichier | Rôle |
|---|---|
| `index.html` | Structure de la page et menu |
| `style.css` | Apparence : couleurs (variables en haut du fichier), mise en page responsive |
| `app.js` | Cœur de l'appli : accueil, sourates, hadiths, savants, récitateurs, bibliothèque, lecteur audio, sauvegarde |
| `lecture.js` | Lecteur du Coran (tajwid, traduction, récitation verset par verset) |
| `priere.js` | Horaires de prière, qibla, muḥāsaba |
| `dhikr.js` | Adhkār du matin et du soir, duʿāʾ |
| `science.js` | Programmes d'étude, fawāʾid, recherche |
| `boot.js` | Démarrage de l'appli |
| `quran-data.js` | Noms des 114 sourates et nombre de versets |
| `sw.js` | Fonctionnement hors ligne |
| `icon…` | Icônes de l'appli |

Après une mise à jour, change le numéro dans `turath-v5` (par exemple `turath-v6`) dans `sw.js` pour que les téléphones récupèrent bien la nouvelle version.

## Idées pour la suite

- Révision espacée intelligente : intervalles qui s'allongent quand une sourate est bien maîtrisée, et raccourcissent après des erreurs
- Suivi par juzʾ et par ḥizb, et programme de khatma (lecture complète) avec objectif quotidien
- Texte du Coran et récitation audio intégrés, avec un mode « cache-verset » pour s'auto-tester
- Recherche dans toutes les notes, résumés et vidéos
- Liste de lecture « à étudier » par savant, avec un ordre d'étude recommandé (mutūn)
- Synchronisation entre appareils et partage public, au moment où tu voudras ouvrir l'appli à d'autres
