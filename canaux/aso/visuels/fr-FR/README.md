# Captures ASO fr-FR

Captures d'écran des fiches App Store et Google Play, en français. **Pas encore envoyées sur les stores** : envoi uniquement avec l'accord de Driss (et la mise à jour de la fiche Play repasse en revue Google).

## Fichiers

| Dossier | Taille | Usage |
|---|---|---|
| `app-store-6.9/` | 1320 × 2868 | iPhone 6,9" (obligatoire App Store) |
| `google-play-telephone/` | 1080 × 1920 | Captures téléphone Google Play |
| `google-play-presentation-1024x500.png` | 1024 × 500 | Image de présentation Google Play |

PNG en RVB, sans transparence.

## Ordre et message

| # | Fichier | Titre | Message |
|---|---|---|---|
| 1 | `01-randos-groupe.png` | Randos en groupe chaque week-end | La communauté rando d'Île-de-France, départs en gare, en train |
| 2 | `02-rejoindre-un-clic.png` | Rejoins une sortie en un clic | Fiche claire (date, rendez-vous, niveau, prix), un bouton pour participer |
| 3 | `03-chat-de-groupe.png` | Un chat pour chaque sortie | Rendez-vous, train, covoiturage dans le chat du groupe |
| 4 | `04-creer-en-une-phrase.png` | Crée ta sortie en une phrase | On écrit une phrase, l'IA remplit la fiche |
| 5 | `05-partenaires-niveau.png` | Des partenaires de ton niveau | Filtre par niveau, suivre ses partenaires |
| 6 | `06-tous-les-sports.png` | Rando, running, padel, trail… | Multisport ; certaines sorties sont payantes (prix affiché) |

Présentation Google Play : « Le sport, à plusieurs. » avec les écrans 1 et 3.

## Choix

- Écrans de l'app reconstruits en HTML d'après les captures de l'app : aucun nom, visage ni pseudo de membre
  (avatars en silhouette, illustrations vectorielles à la place des photos).
- Couleurs de la marque (dégradé #f57c00 → #ef4444), police Bricolage Grotesque (titres) et Inter, comme le site.
- Les prix restent visibles (« Gratuit », « 8 € / pers. ») : on n'écrit jamais que tout est gratuit.

## Regénérer

`node sources/render.js` (Playwright requis) ; `node sources/render.js 03` pour un seul visuel,
`node sources/render.js presentation` pour l'image 1024 × 500. Textes à modifier dans `sources/0X-*.html`,
mise en page commune dans `sources/common.css` et `sources/common.js`.
