# Instagram v2 : gabarits de la nouvelle charte

Applique `../direction-artistique.md` (§ 5) : grands titres Bricolage alignés à gauche, Inter pour le texte,
chiffres en `tabular-nums`, fonds Encre / Papier / Forêt, orange réservé au tracé et à un mot (≤ 10 % de la surface,
mesuré à chaque rendu). Rien ici ne publie.

```
gabarits/fitmates.css      variables de la charte et styles des composants
gabarits/fitmates.js       construit une slide à partir du JSON (composants, tracé, courbes de niveau)
gabarits/slide.html        page chargée par render.js
gabarits/logo.png          logo de l'app détouré (fond blanc retiré)
render.js                  carrousel JSON → PNG 1080×1350 numérotés (01.png, 02.png…)
donnees/                   tracés extraits des fiches officielles, lieux reconnus dans les titres
prototype-chevreuse.json   prototype A « Sortie à emporter » (7 slides) + légende
planches/variantes.json    couvertures de simulation pour la grille du profil (non publiables telles quelles)
sortie/                    PNG rendus (chevreuse/, weekend/, variantes/)
apercu.png                 les 7 slides du prototype A bord à bord (continuité du tracé)
grille-profil.png          simulation de la grille 3×3 du profil (vignettes 3:4)
```

## Produire un carrousel

```bash
node canaux/social/v2/render.js canaux/social/v2/prototype-chevreuse.json --apercu canaux/social/v2/apercu.png
python -m scripts.social_weekly_v2 --out /tmp/weekend      # prototype B, flux réel des sorties, ne publie rien
```

Le rendu échoue (code 1, message en français) si un texte déborde ou est coupé, si un bloc sort des marges de 72 px,
si les zones haut et bas se chevauchent, si des étiquettes de carte se superposent, si l'orange dépasse 10 %, ou si
le tracé ne repart pas à la même hauteur sur la slide suivante (contrôle sur le JSON et sur les pixels rendus).
Ouvrir ensuite les PNG et `--apercu` pour la relecture visuelle.

### Format du JSON

```json
{
 "id": "mon-carrousel", "rubrique": "Sortie à emporter",
 "donnees": "donnees/mon-itineraire.json",    // tracé + profil (cartes, profils d'altitude)
 "sortie": "sortie/mon-carrousel",            // dossier des PNG (ou --out)
 "slides": [ { "fond": "foret", "haut": [ … blocs … ], "bas": [ … blocs … ], "trace": { … } } ],
 "legende": "…", "hashtags": ["…"], "lien_utm": "…"
}
```

Slide : `fond` = `foret` | `papier` | `encre` ; `photo` (voir plus bas) ; `haut` (pile en haut, sous la pagination),
`bas` (pile en bas, au-dessus du logo sur la 1re et la dernière slide) ; `libre` (blocs posés en `x`, `y`) ;
options `haut_top`, `bas_bas` (px), `courbes: false`, `courbes_opacite`, `rubrique`, `page` et `logo` (forcer).
La pagination « 2/7 » et le logo (1re et dernière slide seulement) sont automatiques.

Blocs (un objet = un bloc) :

| Bloc | Exemple |
|---|---|
| titre | `{"titre": "La *forêt* commence ici.", "taille": "xl|l|m|s"}` : `*mot*` orange, `~mot~` Mousse, `\|` retour à la ligne |
| texte, note, source, etiquette | `{"texte": "…"}` ; `**gras**` dans `source` |
| billet | `{"billet": {"depart": {"gare", "detail"}, "arrivee": {…}, "champs": [["Distance", "10,5 km"], …], "ligne": "B", "ligne_lab": "RER", "validite": "…", "numero": "…"}}` |
| chiffres | `{"chiffres": [{"etiquette": "Distance", "valeur": "10,5 km"}, {"filet": true}, {"etiquette": "Niveau", "mot": "Facile"}]}` |
| profil | `{"profil": {"hauteur": 270, "annotations": [{"a": 0.19, "texte": "le chemin creux"}]}}` (`a` = part de la distance) |
| carte | `{"carte": {"largeur": 908, "hauteur": 700, "gare": {"nom", "sous", "dx", "dy", "align"}, "pois": [{"ref": "Ferme de Coubertin", "nom": "…"}]}}` |
| etapes | `{"etapes": [{"rang": "01", "nom": "…", "texte": "…"}]}` : le tracé devient une ligne de gares |
| chat | `{"chat": {"entete": "Chat de la sortie", "bulles": [{"qui": "eux|moi", "texte": "…"}]}}` (jamais de nom) |
| tableau | `{"tableau": {"titre": "*Départs*", "date": "…", "lignes": [{"heure", "jour", "dest", "lieu", "niveau", "prix"}], "pied": "…"}}` |
| palettes | `{"palettes": [{"jour": "sam. 31", "heure": "09:20", "v": "Étréchy"}]}` (afficheur façon gare) |
| espace | `{"espace": 60}` |

### Le tracé orange

`"trace": {"points": [[x, y], …], "sortie": y}`. Les points sont en px de la slide ; on peut y insérer une ancre :
`"carte"` (le tracé réel de l'itinéraire, de la gare à la gare), `"profil"` (le profil d'altitude) ou `"etapes"`
(la ligne verticale des étapes). `sortie` = hauteur à laquelle le tracé sort par le bord droit (`"auto"` = hauteur du
dernier point) ; la slide suivante le reprend automatiquement par le bord gauche, à la même hauteur. Sans `sortie`,
le tracé s'arrête sur un rond (fin de la boucle) ; sur la 1re slide il part d'un rond. Les coins sont arrondis
(`rayon`, 90 px par défaut). Placer les points dans les zones vides : le tracé passe derrière le texte et le billet.
Pour des couvertures indépendantes (pas un carrousel), mettre `"independantes": true` au niveau du carrousel.

### Les courbes de niveau

Générées à chaque rendu (champ pseudo-aléatoire déterministe, graine = `id`), continues d'une slide à l'autre,
en Mousse : 22 % sur Forêt, 50 % sur Papier (le Mousse sur Papier a peu de contraste), 14 % sur Encre. Ce sont une
texture, pas une carte : les vrais reliefs sont dans le profil d'altitude.

### Un nouvel itinéraire « à emporter »

1. Extraire le tracé de la fiche officielle (les chiffres et le GeoJSON viennent de la page, rien à la main) :
   ```bash
   python canaux/social/v2/donnees/extraire_trace.py https://rando.pnr-idf.fr/trek/<id>-<nom> \
       canaux/social/v2/donnees/<nom>.json "Nom exact d'un point d'intérêt" …
   ```
   Seuls les points d'intérêt nommés en argument sont gardés : les fiches citent aussi des artisans sous leur nom
   propre, qui ne doivent jamais entrer dans le dépôt. Vérifier que `fiche` (chiffres affichés) et `calcule`
   (recalculés sur le tracé) concordent.
2. Copier `prototype-chevreuse.json`, remplacer les textes (uniquement des faits de la fiche, source citée sur la
   dernière slide et dans la légende), ajuster les hauteurs du tracé, rendre avec `--apercu`, relire.

## Ajouter une photo

Mettre le fichier dans `canaux/social/v2/photos/` (JPEG ou PNG, au moins 1080×1350, cadrage vertical) et le
référencer dans la slide : `"photo": "photos/chevreuse-quai.jpg"` (chemin relatif au JSON). La photo est posée plein
cadre (`object-fit: cover`) avec un dégradé Encre 0 → 70 % sous la zone qui porte du texte (haut et/ou bas) ; pas
de courbes de niveau sur une photo. Tant que le fichier n'existe pas, la slide garde l'aplat Forêt avec courbes de
niveau (render.js le signale) : on peut donc préparer le carrousel avant d'avoir la photo.

Règles (charte § 6) : vraies sorties uniquement, pas de banque d'images, aucun visage reconnaissable sans accord écrit
de la personne ; même traitement pour toutes les photos. Ne pas commiter une photo sans cet accord.

## Prototype B : « Ce week-end on sort »

`scripts/social_weekly_v2.py --out DIR [--depuis AAAA-MM-JJ] [--feed sorties.json]` lit le flux public
(`fitmates_mkt.sources.backend.public_events()`), garde les sorties du vendredi au dimanche qui viennent, et écrit
`carrousel.json`, `01.png…` (accroche + 1 à 3 tableaux de 5 départs + appel à l'action, soit 3 à 5 slides) et
`post.json` (`id`, `fichier`, `legende`, `hashtags`, `lien_utm`, plus `fichiers` : toutes les slides).
Champs utilisés : title, start_at, location.city, level, price_eur, slug ; jamais image_url ; prix affiché
seulement s'il est > 0. Un titre dont un mot à majuscule n'est ni courant, ni la ville, ni dans
`donnees/lieux.txt` (prénom, nom de personne…) est remplacé par « Randonnée à <ville> ».

`scripts/social_publish.py` ne publie aujourd'hui qu'une image par post (`fichier`) : la publication d'un carrousel
(`fichiers`) n'est pas encore branchée.
