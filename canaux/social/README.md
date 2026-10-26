# Réseaux sociaux

- Publication : n8n diffuse chaque sortie publiée (avec accord de l'organisateur) sur Facebook, Instagram et Threads.
  Workflow et variables : `n8n/README.md`. Contrat des événements envoyés par le backend : `n8n/README.md` et
  `dlahlou/fitmate-landing-page/docs/acces-donnees.md`.
- Mesure : `fitmates_mkt/sources/social.py` (abonnés, portée, clics), dans les relevés `data/snapshots/`.
- Jamais de photo ni de nom de membre : visuels génériques uniquement.

## Kit Instagram (@fitmates_strongertogether)

Rien ici ne publie : les fichiers sont à relire, puis à poster à la main depuis l'app Instagram (ou Meta Business Suite).

### Visuels (`visuels/`)

Générateur HTML → PNG 1080×1350 (portrait 4:5), même charte que les captures ASO : `sources/social.css` importe
`canaux/aso/visuels/fr-FR/sources/common.css` (couleurs, polices Bricolage Grotesque et Inter, composants de l'app)
et le logo de `assets/`. Trois fonds : orange (défaut), `ink` (noir), `cream`. Ni photo, ni stock, ni visage :
typographie, aplats, pictos SVG et faux écrans de l'app.

```bash
node canaux/social/visuels/render.js          # régénère les 9 posts → visuels/lancement/*.png
node canaux/social/visuels/render.js 04 07    # seulement certains posts
```

Le rendu échoue (code 1, message « hors cadre » ou « chevauche le titre ») si un bloc sort du cadre ou passe sous
le titre. Ouvrir ensuite les PNG pour une relecture visuelle. Pour un nouveau post : copier un `sources/NN-*.html`,
garder `<div class="canvas post [ink|cream]">`, un `.head` (kicker, h1 avec `<em>` pour l'accent, sub) et placer le
contenu dans un bloc `.zone` positionné sous le titre.

### Lot de lancement (`lancement.json`)

9 posts, la grille de départ du profil : `id`, `fichier` (relatif à ce dossier), `legende`, `hashtags`, `lien_utm`.
Publier dans l'ordre 01 → 09 : sur la grille, le 09 se retrouve en haut à gauche et les fonds orange / noir / crème
forment un motif sans répétition par ligne ni par colonne.

Instagram ne rend pas les liens cliquables : chaque légende renvoie au lien en bio. Mettre en bio le `lien_utm` du
post le plus récent (ou une page de liens qui les reprend). Convention UTM du playbook § 9 :
`utm_source=instagram&utm_medium=organic&utm_campaign=lancement-nov26&utm_content=<id>`.

Avant publication, relevé des abonnés et de la portée (`python -m scripts.snapshot`), puis comparaison 3 à 4 semaines
après ; noter la date de chaque publication dans le journal du canal.

### Lot de novembre (`lot-novembre.json`)

2ᵉ lot, à publier après le lancement : 9 posts, 3 par semaine, dans l'ordre 01 → 09. Même format que
`lancement.json` ; visuels dans `visuels/novembre/`, sources `visuels/sources/nov-NN-*.html`.

```bash
node canaux/social/visuels/render.js --lot novembre          # régénère les 9 posts → visuels/novembre/*.png
node canaux/social/visuels/render.js --lot novembre 03 07    # seulement certains posts
```

| Post | Thème | Fond | Page cible |
|---|---|---|---|
| 01-chevreuse | 2 boucles de la vallée de Chevreuse au départ du RER B | crème | `/randonnee/vallee-de-chevreuse` |
| 02-vexin | 2 boucles du Vexin depuis Auvers-sur-Oise et Chars | orange | `/randonnee/vexin` |
| 03-sac-novembre | Que mettre dans son sac en novembre | noir | `/randonnee/autour-de-paris` |
| 04-jours-courts | Les jours raccourcissent : partir tôt, frontale | orange | `/evenements` |
| 05-sortie-du-dimanche | Organise ta sortie du dimanche (création en une phrase) | noir | `/organiser` |
| 06-debutants | Rando de groupe pour débutants : choisir son niveau | crème | `/evenements` |
| 07-randos-week-end | Randonnées du week-end en Île-de-France | noir | `/randonnees-week-end-ile-de-france` |
| 08-run-clubs | Teaser course à pied à Paris (liste d'attente, sans date) | crème | `/run-clubs-paris` |
| 09-suivre-partenaires | Suivre ses partenaires après une sortie | orange | `/` |

Grille : une fois les 9 posts publiés, ils forment au-dessus du lot de lancement un bloc 3 × 3 sans répétition de fond
par ligne ni par colonne, y compris à la jonction avec la première ligne du lancement (09 orange, 08 crème, 07 noir).

Chiffres : les distances, dénivelés, niveaux et gares des posts 01 et 02 sont repris tels quels des pages
`/randonnee/vallee-de-chevreuse` et `/randonnee/vexin` (relevé du 26 octobre 2026) ; les repères de niveau du post 06
viennent de la FAQ de `/randonnees-week-end-ile-de-france`. Si ces pages changent avant publication, revérifier.
UTM : `utm_source=instagram&utm_medium=organic&utm_campaign=novembre-26&utm_content=<id>`.

### « Sorties de la semaine » (`scripts/social_weekly.py`)

```bash
python -m scripts.social_weekly --dry-run                       # dossier temporaire créé et affiché
python -m scripts.social_weekly --dry-run --out /tmp/semaine    # dossier choisi
python -m scripts.social_weekly --dry-run --depuis 2026-11-02   # fenêtre du lundi 2 au dimanche 8
python -m scripts.social_weekly --dry-run --feed sorties.json   # flux local (tests), au lieu du réseau
```

Lit le flux public (`fitmates_mkt.sources.backend.public_events()`), garde les sorties qui commencent dans les 7 jours,
et écrit dans le dossier de sortie : `semaine.png` (jusqu'à 5 sorties : jour, titre, ville, heure, niveau, prix si
> 0 €), `legende.txt` (une ligne par sortie avec le lien `https://www.fitmates.net/evenements/<slug>` tagué
`utm_campaign=sorties-semaine-<mois><aa>&utm_content=semaine-<AAAAMMJJ>`) et `semaine.json` (données du visuel).
Gabarit : `visuels/sources/semaine.html` (ouvert seul dans un navigateur, il affiche un exemple fictif).

Garde-fous : liste blanche des champs (jamais `image_url`, ce sont des photos d'organisateurs ; jamais de nom),
aucune mention « gratuite » (le prix ne s'affiche que s'il est > 0), aucune publication. Les titres viennent des
organisateurs : les relire avant de poster (un titre peut contenir un prénom).
