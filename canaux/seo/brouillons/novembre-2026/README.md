# Brouillons SEO de novembre 2026 : itinéraires sourcés Chevreuse, Rambouillet, Vexin

Calendrier éditorial (`docs/passation.md`, section « Google (SEO) ») : « novembre : Rambouillet après le 15/11,
itinéraires sourcés Chevreuse / Rambouillet / Vexin ; pas de fait non sourcé ». Ces brouillons sont prêts à intégrer
dans le site (dépôt `dlahlou/fitmate-landing-page`, non accessible depuis ce dépôt). Rien n'est publié.

| Fichier | Page à enrichir | Requête principale (volume FR/mois) | Publication |
|---|---|---|---|
| `chevreuse.md` | `/randonnee/vallee-de-chevreuse` | randonnée vallée de chevreuse (480) | dès validation |
| `vexin.md` | `/randonnee/vexin` | randonnée vexin (590) | dès validation |
| `rambouillet.md` | `/randonnee/foret-de-rambouillet` | randonnée forêt de rambouillet (170) | **après le 15/11/2026** |

Chaque fichier contient : requêtes cibles, title et meta, 3 itinéraires (chaque chiffre avec sa source), paragraphe
« en groupe avec Fitmates », FAQ de 4 questions sourcées, données structurées, liens internes, et une section
**« À vérifier avant publication »** à traiter en premier.

## Avant d'intégrer : vérifier les sources

Depuis l'environnement de rédaction, les sites sources (visorando.com, rando.pnr-idf.fr, parc-naturel-chevreuse.fr,
rambouillet-tourisme.fr, transilien.com, yvelines.gouv.fr…) étaient bloqués par le proxy réseau. Les chiffres viennent
des extraits que le moteur de recherche donne de ces pages. Il faut donc :

1. ouvrir chaque URL de la section « Sources » de chaque fichier et confirmer distance, dénivelé, durée, difficulté,
   départ et arrivée ;
2. corriger ou retirer tout chiffre qui ne figure pas sur la fiche (règle « pas de fait non sourcé ») ;
3. pour Rambouillet, vérifier le 16/11 sur le site de la préfecture des Yvelines que l'interdiction autour des étangs
   de Hollande n'a pas été prolongée, et mettre à jour la FAQ correspondante (texte **et** JSON-LD).

## Où mettre le contenu dans le site

Les pages zone sont générées à partir des données de zones (`src/data/zones.ts`, d'après
`strategie/strategie-marketing-2026.md` §3) ; la page `/randonnee/autour-de-paris` affiche déjà des cartes
« itinéraires » numérotées avec niveau et départ. Intégration proposée, sans nouvelle URL (éviter la cannibalisation
entre la page zone et une page « itinéraires ») :

1. **Itinéraires** : ajouter les 3 itinéraires de chaque fichier dans la structure de données de la zone (même format
   que les cartes de `/randonnee/autour-de-paris` : titre, niveau, départ, texte court), plus les champs distance,
   dénivelé, durée, arrivée, points d'intérêt et URL source. Le compteur « Itinéraires 0 » affiché aujourd'hui sur les
   trois pages passera à 3.
2. **Sources** : ajouter les URL de chaque fichier au bloc « Sources · mis à jour le … » en bas de page, et mettre à jour
   la date.
3. **Title / meta** : remplacer ceux de la page (les titles actuels font 80 à 90 caractères, au-delà de la limite de
   60). Si le gabarit ajoute « | Fitmates » automatiquement, ne pas le doubler : les titles proposés l'incluent déjà.
4. **Paragraphe « en groupe »** : sous la liste des sorties à venir, à la place ou en complément du bloc « Envie d'y
   aller à plusieurs ? ». Il mentionne que l'app est gratuite et que certaines sorties sont payantes si l'organisateur
   le décide : ne pas raccourcir en « gratuit ».
5. **FAQ** : fusionner avec la FAQ existante (5 questions par page) en supprimant les doublons ; mettre à jour le
   `FAQPage` JSON-LD en même temps que le texte.
6. **Données structurées** : ajouter l'`ItemList` de `TouristTrip` proposée (exemple JSON-LD dans chaque fichier). La
   générer depuis les mêmes données que l'affichage, pour que texte et JSON-LD ne divergent jamais.
7. **Liens internes** : appliquer la section 7 de chaque fichier, y compris les liens **vers** les pages zone depuis
   `/randonnee/autour-de-paris` et les pages département (`/sport/randonnee/yvelines`, `/essonne`, `/val-d-oise`).

## Après la mise en ligne

- Valider le JSON-LD (Rich Results Test / validateur schema.org) et vérifier le rendu sur mobile.
- Demander l'indexation des trois URL dans la Search Console (action Driss) :
  https://search.google.com/search-console
- Mesure (règle du dépôt) : faire un relevé Search Console des trois pages **avant** la mise en ligne (apparitions,
  clics, position sur les requêtes du tableau ci-dessus), puis comparer 3 à 4 semaines après. Consigner la date de mise
  en ligne dans le journal du canal SEO.

## Ce qui n'a pas pu être vérifié

- **Volumes** : Ubersuggest (France, locId 2250, fr) a donné les volumes des 3 requêtes principales et de quelques
  variantes, puis le quota quotidien gratuit (3 rapports) a été atteint : les autres secondaires ne sont pas mesurées.
  Relancer demain ou passer à une offre payante (https://ubersuggest.com/en/pricing) pour compléter.
- **Pages sources non ouvertes** (proxy) : voir ci-dessus.
- **Temps de trajet et fréquences** : pas de source SNCF / Île-de-France Mobilités consultée directement ; seules des
  sources tierces ou un article Transilien de 2024.
