# Instagram Fitmates : direction artistique, intention et stratégie

Version 3, 27/10/2026, après le retour de Driss : contenu centré sur les personnes, tous sports.

Journal :
- 01/11/2026 : charte (section 5) remplacée par celle du site www.fitmates.net, référence unique (ink, cream, brand, lime ; Bricolage + Inter ; arrondis, halo orange). Carrousels v3 et visuels Meta refaits.
- 27/10/2026 : version 3, contenu centré sur les personnes ; charte Forêt / Papier / Mousse conservée (abandonnée le 01/11).

## 0. Règle

Rien n'est publié sans l'accord explicite de Driss pour ce post précis (CLAUDE.md). Les sujets et les textes se
valident **avant** toute fabrication de visuel.

## 1. Ce qui n'allait pas (retour de Driss, 27/10)

Le sujet, les textes, le lien avec l'app et la cible. Les posts v1 expliquaient des fonctionnalités, les prototypes v2
étaient des fiches d'itinéraire (le métier de Visorando ou Komoot) avec des phrases artificielles. Ni l'un ni l'autre ne
dit ce qu'est Fitmates, à qui il sert ni pourquoi l'ouvrir.

## 2. Ce que le compte doit faire comprendre et ressentir

1. **Tu n'as plus à faire du sport seul·e.** Il y a un groupe à ton niveau près de chez toi, pour tous les sports.
2. **Ton groupe vient vraiment.** Pour un organisateur : des gens qui s'inscrivent, viennent et reviennent (l'outil qui le permet passe au second plan).
3. **La communauté est réelle.** De vraies sorties, de vrais membres (avec leur accord), de vrais chiffres datés.
4. **Tu progresses et tu tiens dans la durée.** La régularité vient du groupe, pas de la volonté.
5. **Tu rencontres des gens.** Le sport est la façon la plus simple de se faire des amis dans une ville.

Test de chaque post avant de le proposer : **qui** est visé, **quelle situation** vécue il reconnaît, **ce que Fitmates
change** concrètement, **quoi faire** ensuite. Si une réponse manque, le post ne part pas.

## 3. Pour qui

| Cible | Situation vécue | Ce que Fitmates lui apporte |
|---|---|---|
| Seul·e et motivé·e | « J'aimerais courir / randonner / jouer, mais pas seul·e » | Des sorties à son niveau, près de chez soi, un chat pour se présenter avant |
| Nouveau dans une ville | « Je ne connais personne ici » | Une sortie par semaine = des têtes connues en un mois |
| Les potes qui annulent | « On devait jouer, ils se sont désistés » | Compléter un groupe, trouver un 4ᵉ au padel |
| Débutant ou en reprise | « J'ai peur de ralentir les autres » | Le niveau affiché sur chaque sortie |
| Organisateur (club, coach, leader de groupe) | « Je passe ma vie sur WhatsApp à relancer » | Créer en une phrase, inscriptions, chat de la sortie, sortie gratuite ou payante |

## 4. Les piliers

| Pilier | Part | Exemple |
|---|---|---|
| **La situation qu'on reconnaît** | 3/10 | Humour et vérité : les potes qui annulent, le groupe WhatsApp à 63 messages pour 2 venus. Fait partager |
| **Comment ça marche, en vrai** | 2/10 | Un scénario par post, avec les vrais écrans de l'app (compte de démonstration, sans nom de membre) |
| **La communauté** | 2/10 | Une vraie sortie, un vrai membre ou organisateur et son histoire (avec accord), un chiffre réel daté |
| **Organisateurs** | 2/10 | « Ton groupe mérite mieux qu'un fil WhatsApp » |
| **Tous les sports** | 1/10 | Rando, course, padel, vélo… : montrer que ce n'est pas qu'une app de rando |

## 5. Charte graphique

**La référence unique est le site www.fitmates.net** (`fitmate-landing-page/tailwind.config.js` et `src/index.css`).
Instagram, Facebook et les publicités Meta reprennent sa palette, sa typographie et ses formes ; en cas de doute, on
ouvre une page `/sport/...` du site et on s'aligne dessus. L'ancienne charte « Forêt / Papier / Mousse » est abandonnée
(01/11/2026).

### Couleurs

| Nom (site) | Hex | Usage |
|---|---|---|
| `ink` | `#0B0B0D` | fond sombre principal (comme les héros du site), textes sur fond clair |
| `ink 800` | `#141418` | fond sombre secondaire, pour varier deux slides sombres qui se suivent |
| `ink 700` / `ink 600` | `#1E1E24` / `#2A2A33` | cartes et blocs posés sur un fond `ink` (liste des sorties, bulles de chat), filets |
| `cream` | `#F6F3EE` | fond clair (chaud, pas blanc) ; le blanc `#FFFFFF` sert aux cartes posées sur `cream` |
| `brand` | `#FF5A1F` | accent : mots clés des titres, tracé, pastilles, bouton principal ; **fond plein rare** |
| `brand 400` / `brand 600` | `#FF7A45` / `#E8460D` | reflet du fond `brand` ; étiquettes orange sur fond `cream` (meilleur contraste) |
| `lime` | `#D4FF4F` | accent ponctuel sur fond sombre seulement : point des pastilles, étiquettes (jours, rubriques) |

Usages :

- **Fonds** : `ink` avec un **halo orange discret** (dégradé radial `brand` à 20-30 % d'opacité, comme la classe
  `.glow` du site), `cream`, et `brand` en aplat **au plus une slide forte par carrousel** (la phrase qui porte le
  message). Les gabarits refusent un carrousel qui en a deux.
- **Accent** : les mots en `*accent*` passent en `brand` sur `ink` et `cream`, en `ink` sur `brand`. Le texte est blanc
  sur `ink` et sur `brand`, `ink` sur `cream`.
- **Orange** : sur les slides `ink` et `cream`, l'orange (mots, tracé, pastilles) reste sous 10 % de la surface ;
  `render.js` le mesure à chaque rendu (les carrousels v3 sont à 3 % au plus). La slide `brand` est exemptée.
- **Lime** : jamais en fond, jamais pour un titre ; seulement de petits éléments sur fond sombre.
- Correspondance des anciens noms de fonds dans les JSON : `foret` → `ink`, `encre` → `ink 800`, `papier` → `cream`.

### Typographie

- **Titres** : Bricolage Grotesque ExtraBold (800), serrée (interlettrage −2 %), très grande (76 à 172 px sur 1080), en
  minuscules avec majuscule initiale, deux tons (blanc ou `ink` + quelques mots en accent), comme les titres du site.
  **Alignée à gauche**, en haut ou en bas.
- **Texte** : Inter Medium 30 à 42 px, 1 à 3 lignes par slide, en blanc atténué (66 %) sur fond sombre.
- **Étiquettes** : Inter SemiBold 20-22 px, capitales espacées (+12 %), en `lime` sur fond sombre, `brand 600` sur `cream`.
- **Données** (heures, km) : Inter en chasse fixe (`tabular-nums`).

### Formes et mise en page

- **Arrondis généreux** : cartes 32 px, boutons et pastilles en pilule (999 px), bulles de chat 30-38 px.
- **Pastille de rubrique** en haut à gauche (contour fin, point `lime` sur fond sombre, `brand` sur `cream`), comme le
  badge « Nouvelles sorties chaque semaine » du site ; pagination « 2/7 » en haut à droite.
- Marges 72 px ; zone de texte dans le tiers haut ou bas.
- Logo (`v2/gabarits/logo.png`, détouré) seulement sur la première et la dernière slide, petit, en bas à gauche ; sur
  fond `brand`, il est posé sur une pastille `cream` arrondie.
- Boutons des stores (visuels Meta) : App Store en pilule blanche, Google Play en pilule à contour, comme sur le site.
- Sur photo : dégradé `ink` 0 → 72 % sur le tiers où se trouve le texte.

### Signatures visuelles

1. **Le tracé** : une ligne continue (6 px, coins arrondis) qui traverse les slides d'un carrousel ; `brand` sur `ink`
   et `cream`, `ink` sur la slide `brand`. Elle part et finit sur un rond.
2. **Le halo orange** des fonds sombres, repris du site.
3. **Les courbes de niveau** (optionnelles, désactivées en v3) : texture ton sur ton à 8-10 %, sans couleur propre.
4. **Le billet** et **le tableau des départs** (gabarits v2) gardent leur forme, aux couleurs du site.

## 6. Direction photo

- **Vraie vie uniquement** : sorties Fitmates, repérages, photos de membres avec leur accord écrit. Pas de banque
  d'images, pas de visage reconnaissable sans accord explicite de la personne ; de préférence : groupes de dos ou de
  loin, petits dans le paysage.
- **Lumière** : matin et fin d'après-midi, brume, sous-bois ; éviter le plein midi.
- **Cadrages** : large (le groupe minuscule dans la forêt), vue subjective (le sentier devant soi), détails (lacets,
  thermos, billet, carte, chaussures boueuses), le quai de gare au départ.
- **Traitement** : léger réchauffement, contraste doux, grain fin ; même préréglage pour toutes les photos (cohérence
  de grille).
- **Matière à collecter à chaque sortie** (10 photos suffisent) : le quai, le groupe de dos au départ, 3 paysages, 2
  détails, la pause, le retour.

## 7. Banque d'accroches (v3, centrées sur les personnes)

Règle : une situation réelle, dite simplement, comme on la dirait à un ami. Pas de jeu de mots, pas de métaphore.

**La situation qu'on reconnaît**
1. « Tes potes ont encore annulé le footing de dimanche ? »
2. « Groupe WhatsApp "Rando dimanche" : 63 messages, 2 personnes au rendez-vous. »
3. « Il te manque un 4ᵉ pour le padel. Encore. »
4. « Tu t'es inscrit·e à la salle en janvier. On est en octobre. »
5. « Courir seul·e, c'est bien. Jusqu'au jour où tu n'y vas plus. »

**Seul·e, nouveau, débutant**
6. « Nouveau dans ta ville et personne avec qui faire du sport ? »
7. « Tu viens seul·e ? Comme la moitié du groupe. »
8. « Peur d'être le plus lent ? Le niveau est écrit sur chaque sortie. »
9. « Le plus dur, ce n'est pas le sport. C'est de trouver avec qui. »

**Comment ça marche**
10. « Tu cherches un groupe pour courir ce week-end. Voilà ce que tu fais, en 3 écrans. »
11. « Une phrase, et ta sortie de dimanche existe. »
12. « Avant la sortie, tu sais qui vient : il y a un chat pour se présenter. »

**Organisateurs**
13. « Tu organises déjà des sorties ? Arrête de relancer tout le monde sur WhatsApp. »
14. « Tu es coach : remplis tes séances sans démarcher. »
15. « Ton club a des places libres le dimanche ? Dis-le aux gens qui cherchent. »

**Communauté (dès qu'on a de vraies photos et de vrais témoignages)**
16. « Elle est venue seule à sa première sortie. Aujourd'hui, c'est elle qui organise. » (vraie histoire, avec accord)
17. « Dimanche dernier, [N] sorties en Île-de-France. » (chiffre réel du backend)
18. « POV : ta première sortie avec des inconnus. » (photo réelle, vue subjective)

## 8. Légendes

- Ligne 1 = l'accroche reformulée (125 caractères maximum, c'est ce qui s'affiche).
- 3 à 5 lignes utiles (concret, sourcé), puis **un seul** appel à l'action.
- Mots-clés naturels plutôt que des hashtags (« randonnée Île-de-France », « vallée de Chevreuse », « rando en
  train ») : Instagram indexe le texte. 3 à 5 hashtags maximum, précis.
- Crédit de la source quand il y a des chiffres (« Fiche du Parc naturel régional »).

## 9. Rythme et mesure

- 3 posts par semaine (mardi carrousel « à emporter », jeudi « ce week-end on sort », samedi « on y était » ou
  « savoir-faire »), stories 3 fois par semaine, 2 Reels par mois.
- Indicateurs : taux d'enregistrement (enregistrements / portée), partages, visites du profil, clics vers le site
  (GA4, `utm_source=instagram`). Bilan à 2 semaines puis chaque mois ; on garde les formats qui font le plus
  d'enregistrements et de partages.

## 10. Ce qu'il faut pour réussir

- **Des photos réelles** : un dossier partagé où Driss et les organisateurs déposent les photos de sorties (avec l'accord
  des personnes visibles). Sans elles, deux piliers sur cinq restent vides.
- **Un texte d'accord** à faire signer (message ou case dans l'app) : « J'accepte que Fitmates publie cette photo sur
  ses réseaux. »
- Les autres piliers (sortie à emporter, ce week-end on sort, savoir-faire) se produisent dès maintenant avec les
  signatures graphiques (billet, tracé, courbes de niveau, tableau des départs).
