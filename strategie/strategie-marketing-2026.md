# Fitmates — Stratégie marketing, SEO et visibilité IA (octobre 2026)

> Mise à jour 2026-10-26 : Bing est désormais ignoré (stratégie 100 % digitale, focus organique Google et stores). Les mentions de Bing ci-dessous sont historiques.

Document de travail pour l'équipe Fitmates. Chiffres sourcés en fin de document ; ceux marqués ⚠ n'ont pas pu être recoupés sur la source primaire.

## 0. Les dix décisions

1. **Attaquer chaque sport là où il se pratique, partout en France, sans calendrier d'ouverture** : une page par sport × lieu (`/randonnee/fontainebleau`, `/escalade/fontainebleau`, `/padel/lyon`…), ciblée sur la requête réelle « <sport> <lieu> », avec les sorties du flux à proximité. Ordre de production = volume de recherche mesuré, rien d'autre.
2. **Priorités mesurées (Ubersuggest, France, octobre 2026)** : randonnée Annecy, Vosges et Fontainebleau (5 400/mois chacun), padel Lyon et Marseille (4 400), randonnée Chamonix (2 900), escalade Fontainebleau, randonnée gorges du Verdon, padel Bordeaux et randonnée Paris (2 400), randonnée Marseille (1 900), run club Paris, randonnée Nice et Grenoble (1 600), randonnée Lyon, Toulouse et Calanques (1 300).
3. **Cœur de cible : 25–39 ans, Paris et petite couronne, pratiquant seul**, qui cherche d'abord de la régularité et des gens, pas de la performance. Segment secondaire : 40–59 ans pour la randonnée (le gros des pratiquants actuels).
4. **Le canal numéro un est l'organisateur**, pas le participant : un organisateur vaut 20 à 100 participants. Ils arrivent **par le digital** : pages d'intention « créer un run club », « organiser une randonnée », « coach : remplir ses séances » (livrées), Google Ads sur ces requêtes, séquences email automatiques, preuve sociale sur les pages sport × zone. Aucun démarchage manuel.
5. **600 €/mois de tests payants dès maintenant** (Apple Search Ads sur l'intention participants, Google Ads sur l'intention organisateurs), Meta/TikTok à partir de mars quand les créas UGC existent. Tout le reste est organique et automatisé.
6. **SEO programmatique sport × zone + pages événement** (livré dans ce dépôt), avec données structurées et flux publics : c'est le seul canal gratuit, cumulatif et défendable face à Frimake, qui vient de lever 10 M€ pour du marketing.
7. **Visibilité IA** : rendre chaque événement lisible par ChatGPT, Claude, Perplexity et Google AI Mode (HTML statique, JSON-LD, llms.txt, flux JSON/iCal, Bing/IndexNow), puis un serveur MCP public en 2027.
8. **Chiffres honnêtes et datés partout** : remplacer les « 10 000+ utilisateurs » de la landing par les vrais chiffres. C'est à la fois une question de crédibilité, de citation par les IA et de conformité (pratiques commerciales trompeuses).
9. **Un seul outil de leads** (livré : `leads-service/`), un pipeline en 5 statuts et une règle : tout lead organisateur est rappelé sous 48 h.
10. **Mesurer trois choses** : participations réelles par semaine et par zone, organisateurs actifs, taux de présence. Pas le temps d'écran.

## 1. Le marché en chiffres

**La pratique explose, le lien non.** 61 % des 15 ans et plus pratiquent régulièrement en 2025 (54 % en 2018), record historique, et 17,4 M de licences, record aussi, avec des fédérations qui refusent des inscriptions faute de créneaux [S1][S2]. En même temps, la pratique en club recule (24 % → 20 %) et la pratique totalement autonome recule aussi (61 % → 53 %) : l'espace « entre le club et le solo » grandit, et 16 % des pratiquants utilisent déjà une appli ou un tuto pour s'organiser [S3]. La moitié des pratiquants font leur activité principale seuls ; 17 % des non-pratiquants citent « ne connaître personne avec qui pratiquer » ⚠ [S4].

**La solitude touche d'abord notre cible.** 37 % des moins de 25 ans et 36 % des 25–39 ans se sentent seuls, contre 16 % des 60–69 ans ; 28 % dans les villes de plus de 100 000 habitants [S5]. Paris cumule la plus forte densité de sportifs et la plus forte solitude ressentie.

**Île-de-France.** 12,6 M d'habitants ; 27,5 % ont 20–39 ans (21,3 % ailleurs), soit environ 3,4 M de personnes dans le cœur de cible [S6]. 65 % des Franciliens font au moins une heure de sport par semaine, 7 sportifs réguliers sur 10 hors club, 79 % pratiquent près de chez eux, pics le matin et le soir en semaine [S7]. La région a deux fois moins d'équipements par habitant que le reste de la France [S8] : avantage structurel aux sports sans infrastructure (marche, course, vélo, plein air).

**Par sport (France).**

| Sport | Pratiquants | Part « sociale » | Tendance | Signal pour Fitmates |
|---|---|---|---|---|
| Marche / randonnée | 62 % des adultes, ~30 M ; 237 k licenciés (0,8 % des pratiquants) | forte, mais 99 % hors fédération | ↑ 56 % → 62 % (2021–25), plus forte hausse chez les 18–49 | marché le plus large, totalement informel [S9] |
| Course à pied | 13,2 M (2026) ; 63 % des néo-coureurs sont des femmes, 80 % ont moins de 35 ans | 9 % courent en club ; 1 run sur 4 enregistré à plusieurs sur Strava ; run clubs × 6,5 en 2025 | ↑↑ | la plus forte dynamique sociale et la plus jeune [S10][S11] |
| Fitness / musculation | ~18 M, 6 900 salles | faible (individuel) | ↑ +7,7 % fréquentation | Hyrox Paris : 2 960 → 20 600 athlètes en 2 ans [S12] |
| Padel | 850 k, 4 520 pistes (+41 % en un an) | très forte (jeu à 4, il manque toujours un joueur) | ↑↑↑ | IDF sous-équipée (333 pistes) : le besoin de partenaires y est maximal [S13] |
| Vélo | ~9 M | moyenne | → | sorties groupe route/gravel, saisonnier |
| Escalade | ~2 M ⚠, 119 k licenciés, ligue IDF 2ᵉ de France | forte (assureur obligatoire) | ↑ | Arkose, Climb Up : flux captifs |
| Foot à 5 / basket | Urban Soccer 100 k joueurs/semaine ; basket 750 k licenciés | très forte | → | « il manque un joueur » mais dépend des terrains |
| Tennis | 1,17 M licenciés | forte (partenaire obligatoire) | → | niveau = clé |
| Yoga / pilates | pas de chiffre fiable | moyenne (cours) | ↑ pilates | pratique en studio, concurrence ClassPass/Urban Sports |

**Saisonnalité (proxys publiés, Google Trends non interrogeable depuis cet environnement).** Randonnée : fréquentation des sentiers max en août (13 %), mai et juillet (11 %) ; équipement recherché dès février [S9]. Running : pic de recherches en avril, creux en janvier, +109 % de volume en 10 ans [S14]. Padel : pic historique en septembre 2025 [S15]. Fitness : janvier et septembre. Conséquence éditoriale : les pages rando doivent être en ligne et indexées **avant mars**, les pages running **avant janvier et avant septembre**, les pages padel **en septembre**.

Pour obtenir les courbes exactes : `python scripts/google-trends.py` en local, ou les liens de `docs/google-trends/README.md`.

## 2. Priorisation des sports

Score sur 5 critères (1–5) : taille du marché, besoin structurel de partenaires, proximité avec la rando (même public, mêmes zones, zéro infrastructure), dynamique 2024–26, facilité de recrutement d'organisateurs.

| Rang | Sport | Marché | Besoin partenaire | Proximité rando | Dynamique | Organisateurs | Total | Quand |
|---|---|---|---|---|---|---|---|---|
| 1 | Randonnée (en cours) | 5 | 3 | 5 | 4 | 4 | 21 | maintenant, densifier |
| 2 | Course à pied / run clubs | 5 | 3 | 5 | 5 | 5 | 23 | janvier 2027 |
| 3 | Padel | 3 | 5 | 2 | 5 | 4 (clubs) | 19 | avril 2027 |
| 4 | Trail | 2 | 4 | 5 | 4 | 3 | 18 | avec la course à pied |
| 5 | Vélo (route, gravel) | 4 | 3 | 4 | 3 | 3 | 17 | avril 2027 (saison) |
| 6 | Escalade | 2 | 5 | 3 | 4 | 3 (salles) | 17 | automne 2027 |
| 7 | Marche nordique | 2 | 3 | 5 | 2 | 3 | 15 | opportuniste (coachs) |
| 8 | Foot à 5 / basket | 4 | 5 | 1 | 3 | 2 | 15 | 2028, via centres |
| 9 | Fitness / Hyrox | 5 | 2 | 1 | 5 | 2 | 15 | via coachs partenaires |
| 10 | Yoga / pilates / natation / tennis | 3 | 2–4 | 1–2 | 2–4 | 2 | ≤ 14 | plus tard |

La course à pied passe devant le padel parce qu'elle partage tout avec la rando : mêmes 25–39 ans, mêmes parcs et forêts, aucun équipement, et des centaines de run clubs déjà organisés à Paris qu'il suffit d'outiller. Le padel vient ensuite parce que le besoin (« compléter une partie ») est le plus net du marché, mais il impose de passer par les clubs.

## 3. Zones : ordre d'ouverture et règle de densité

**Règle (inspirée de Nextdoor et ClassPass)** : une zone est « ouverte » quand elle a 3 organisateurs actifs et 30 participants ayant fait au moins une sortie. Avant ce seuil, pas de communication locale : un fil vide tue la rétention à J+1.

| Phase | Zone | Pourquoi | Levier d'amorçage |
|---|---|---|---|
| Maintenant | Seine-et-Marne (Fontainebleau), Yvelines (Chevreuse, Rambouillet), Paris (départs en gare) | déjà le cœur de l'activité rando | organisateurs existants, pages SEO livrées, posts automatiques par sortie |
| T4 2026 | Hauts-de-Seine, Val-de-Marne | petite couronne dense, 25–39 ans, bords de Seine et de Marne | guides organisateurs + Google Ads géociblés, emails participants redirigés vers les sorties 77/78 en attendant |
| T1 2027 | Paris running (par arrondissement : 11ᵉ, 10ᵉ, 19ᵉ, 15ᵉ, 13ᵉ) | run clubs existants, quais, Buttes-Chaumont | guide « créer un run club » + Google/LinkedIn Ads + annuaires en ligne |
| T2 2027 | Seine-Saint-Denis, Essonne, Val-d'Oise | population jeune (93), espaces peu saturés | Paris Sport Dimanche, universités, Decathlon |
| T3 2027 | Lyon (Parc de la Tête d'Or, Monts du Lyonnais), Marseille / Aix (calanques, Sainte-Victoire) | villes où le trail/rando est identitaire | pages sport × zone publiées 3 mois avant, Ads organisateurs géociblées, séquences email |

Pour chaque nouvelle zone, le site génère automatiquement les pages sport × zone dès qu'on ajoute la zone dans `src/data/zones.ts` avec ses spots.

## 4. Profils clients idéaux (ICP)

### Participant prioritaire : « Inès, 31 ans, Paris 11ᵉ »
Cadre ou salariée du tertiaire, arrivée à Paris pour le travail, pratique seule (course, marche, salle) 1 à 2 fois par semaine, a déjà abandonné une salle. Cherche de la régularité et des gens « normaux », pas une compétition. Déclencheurs : rentrée, janvier, rupture, déménagement, nouvel emploi. Objections : sécurité (sortir avec des inconnus), niveau (« je vais ralentir le groupe »), engagement (« je ne veux pas être obligée »). Message : « Des sorties avec des gens de ton niveau, près de chez toi, sans abonnement ni obligation. » Canaux : Instagram/TikTok (run clubs, « Tinder IRL »), Google (« randonnée groupe île de france »), bouche-à-oreille, Le Bonbon / Time Out.

### Participant secondaire : « Marc, 47 ans, Val-de-Marne »
Randonneur régulier, non licencié, en couple ou séparé, organise déjà ses week-ends autour de la marche. Cherche des itinéraires nouveaux et de la compagnie pour les sorties longues. Canaux : Facebook (groupes rando IDF), Google, FFRandonnée, Visorando. Message : « Les plus belles sorties d'Île-de-France, en groupe, accessibles en train. »

### Organisateur : « Clara, 29 ans, Capitaine »
Déjà leader d'un groupe (run club Instagram, groupe WhatsApp de rando, BDS, Meetup). Diplômée, motivée d'abord par la convivialité et la reconnaissance (INJEP : la convivialité est la motivation n°1 des bénévoles sportifs, profil plus jeune et plus masculin que le reste de l'associatif, 56 % diplômés du supérieur) [S16]. Douleur : WhatsApp qui déborde, inscrits fantômes, Meetup payant. Offre : outils gratuits, badge, mise en avant, page publique de ses sorties. Où la toucher en digital : requêtes « créer un run club » / « organiser une randonnée » (guides livrés), Google Ads, LinkedIn, audiences Meta par intérêts (Meetup, Strava, FFRandonnée), annuaires de run clubs.

### Coach indépendant : « Yanis, 34 ans »
20 à 35 k coachs en France, majoritairement indépendants, acquisition par Superprof et Instagram. Veut remplir des séances collectives et se faire connaître localement. Offre : visibilité gratuite, séances payantes affichées, puis abonnement organisateur (revenu 1 du modèle).

### Partenaire B2B : clubs, salles, collectivités, marques
Arkose, Climb Up, Urban Soccer, clubs de padel, Decathlon, mairies (Paris Sport Dimanche), FFRandonnée IDF, marques running. Offre : flux de participants et sponsoring d'activités réelles (revenu 2).

**Tranches d'âge à prioriser** : 25–39 ans (cœur, le plus seul, le plus mobile, 27,5 % de l'IDF) ; 18–24 ans en second (75 % de pratique régulière, run clubs, universités, mais budget faible) ; 40–59 ans pour la rando (volume actuel, fidèles, bons organisateurs). **Secteurs** : tertiaire parisien (QCA, La Défense, Saint-Lazare, Bercy), étudiants (Sorbonne, Paris 8, Paris Cité, Saclay), nouveaux arrivants (expatriés, mutations), parents séparés le week-end.

## 5. Positionnement et messages

**Catégorie** : l'app du sport social. Ni Strava (performance individuelle), ni Meetup (sport noyé, organisateur payant), ni Frimake (sorties généralistes, paywall sur les participants), ni Komoot/AllTrails (itinéraires sans personne pour les faire).

**Promesse** : « Fais du sport avec des gens de ton niveau, près de chez toi, cette semaine. »

**Preuves** (à afficher, datées) : nombre de sorties cette semaine en IDF, participations validées, organisateurs actifs, taux de présence. Pas de compteur de « membres ».

**Trois messages par cible** :
- Participants : régularité (« une sortie par semaine, sans y penser »), sécurité (organisateur identifié, point de rendez-vous public, chat de groupe), niveau (« débutant accepté » visible sur chaque sortie).
- Organisateurs : « On remplit tes sorties, tu gardes ta communauté. » Gratuit, sans commission la première année.
- Presse : « Les run clubs sont le nouveau Tinder ; la rando est l'activité n°1 des Français ; personne n'avait d'outil pour ça. »

## 6. Analyse de la compétition et comment faire mieux

### Ce que font les apps similaires

| Acteur | Positionnement | Chiffres publics | Ce qu'il fait bien | Ce qu'il rate |
|---|---|---|---|---|
| Frimake | sorties entre inconnus, toutes activités | 820 k utilisateurs, 10 M€ levés (nov. 2025) pour le marketing [S17] | notation post-sortie, volume Paris/Lyon, pages sorties indexées | sport noyé, paywall sur l'accès aux participants (avis 1★), aucun niveau |
| Meetup | groupes d'intérêt | Les Joyeux Marcheurs 2 700 membres, Power Hiking Paris | RSVP, liste d'attente, no-show marqué, SEO massif (pages ville × activité en anglais) | organisateur payant, UX datée, pas de filtre niveau/allure |
| Timeleft | dîners à 6 inconnus le mercredi | 25 k dîneurs/semaine, 10 M€ MRR | rituel fixe, prépaiement = quasi zéro no-show | pas sportif, payant |
| Strava Clubs | performance + clubs | 1 M de clubs, clubs rando × 5,8 et running × 3,5 en 2025 [S11] | standard des run clubs, feed | pas de découverte locale, événements de club invisibles, paywall |
| Heylo / Luma | outils organisateur / pages événement | Heylo : 3–4 M$ reversés aux leaders | récurrence, waitlist, rappels, pages publiques | pas de matching ni de niveau, US-centré / pas sportif |
| Playtomic | padel : terrains + matchs ouverts | 7 M joueurs | niveau calculé par résultats, matchs toujours pleins | mono-sport |
| Hellorunner | annuaire des run clubs | référence FR | SEO pages club/ville | pas de RSVP, infos obsolètes |
| Sportyfriends, Atclub, PoteSport, Jokosun, Wesport | matching 1-1 « partenaire sport » | faibles | concept simple | « personne autour de moi », chats morts, zéro SEO |
| Komoot / AllTrails / Decathlon Outdoor | itinéraires | Komoot 45 M, Decathlon 25 k itinéraires | contenu parcours, SEO itinéraire/commune | aucun social de groupe → partenaires, pas rivaux |

**Constat** : personne ne combine (a) sport comme objet central, (b) communauté locale par niveau, (c) outils organisateur gratuits, (d) mécanique anti-no-show, (e) suivi d'objectif collectif. Les apps de matching sportif françaises meurent du cold start ; les outils d'événement n'ont pas de matching ; les apps outdoor n'ont pas de « avec qui ».

### Faire mieux : dix mouvements

| # | Mouvement | Faiblesse exploitée | Effort | Impact |
|---|---|---|---|---|
| 1 | Score de fiabilité visible (check-in géolocalisé + validation organisateur) | no-shows non traités par tous les acteurs FR | M | présence, confiance organisateurs |
| 2 | Caution optionnelle « j'y serai » (2–5 €) remboursée au check-in, activable par l'organisateur | Timeleft prouve l'effet ; personne ne le fait sur du gratuit | M | taux de présence |
| 3 | Pages événement et sport × zone indexées, régénérées chaque jour (livré) | Sportyfriends/Atclub invisibles ; Meetup en anglais | S | acquisition gratuite, cumulative |
| 4 | Niveau calculé à partir des sorties réellement faites (distance, D+, allure), import Strava/Apple Santé | Playtomic l'a pour le padel, personne pour la rando/course | M | groupes homogènes qui reviennent |
| 5 | Création IA + « remplissage intelligent » : l'IA propose créneau, lieu, parcours, et invite les 10 profils compatibles | aucun concurrent | M | résout le cold start côté organisateur |
| 6 | Objectif hebdo collectif (« 1 sortie/semaine ») avec streak de groupe et binôme | aucune app sociale ne fait de goal tracking ; Strava est individuel | S | rétention D30 |
| 7 | Rituel fixe par territoire (« Les Randos du dimanche IDF », 9h, lieu tournant), « sortie maintenue dès 4 inscrits » | Timeleft (mercredi), cold start des apps FR | S | résout « personne autour de moi » |
| 8 | Programme Capitaines : outils gratuits, récurrence, co-hosts, export, aucune commission la 1ʳᵉ année | Heylo et Meetup font payer l'organisateur | M | chaque organisateur = 20–100 membres |
| 9 | Chat attaché aux événements, auto-archivé, « photo de groupe » post-sortie dans le feed | chats 1-1 morts ; feed Strava = perf | S | preuve sociale réelle |
| 10 | Statistiques honnêtes sur la home (« 37 sorties ce week-end, 212 présences validées ») | compteurs gonflés de Frimake/Wesport | S | confiance, angle presse |

Monétisation cohérente avec les avis 1★ des concurrents : ne jamais faire payer pour voir les gens ni pour rejoindre. Premium sur le confort (filtres avancés, stats, parcours), abonnement organisateurs/coachs, sponsoring d'activités.

## 7. Acquisition et notoriété : 100 % digital

Le détail opérationnel (specs de campagnes, séquences email, calendrier de contenu, automatisations, conventions de mesure) est dans `strategie/playbook-digital.md`. Résumé.

### Six portes d'entrée

| Porte | Participants | Organisateurs | État |
|---|---|---|---|
| Google / Bing organique | pages sport × zone, événements (régénérées chaque jour) | guides `/organiser/run-club`, `/organiser/groupe-randonnee`, `/organiser/coach-sportif`, `/organiser/club-association` (HowTo + FAQ) | livré |
| Assistants IA | mêmes pages + llms.txt + flux JSON/iCal | mêmes guides | livré, MCP à venir |
| Stores (ASO + Apple Search Ads) | « partenaire sport », « run club paris », concurrents | | fiches à réécrire, 300 €/mois |
| Google Ads Search | | « créer un run club », « organiser une randonnée », « coach sportif trouver des clients » → guides, conversion GA4 `generate_lead` | 300 €/mois, événement livré |
| Social organique automatisé | post par sortie depuis le flux, « on y était », portraits | LinkedIn coachs/assos, réponses automatiques aux DM | n8n à installer |
| Email et parrainage | hebdo « sorties de ta zone », « invite ton groupe » | séquence 5 emails + kit, newsletter Capitaines | Brevo + webhook livré |

### Les deux boucles qui doivent tourner seules

- **Participants** : sortie publiée → page indexée + post automatique → inscriptions → photo de groupe et chiffres → nouveau contenu → nouvelles inscriptions.
- **Organisateurs** : requête « créer un run club » → guide → formulaire → séquence email + mise en avant 30 jours → première sortie → ses participants deviennent la preuve sociale qui attire le prochain organisateur.

### Règle de densité, version digitale

Une zone est « ouverte » quand elle a 3 organisateurs actifs et 30 participants. En dessous, on ne dépense pas en publicité locale : on laisse le SEO et les séquences travailler, et on redirige les leads participants vers la zone active la plus proche.

### Calendrier

**90 jours (oct. → déc. 2026)** : site déployé, flux et leads branchés, fiches stores réécrites, Search Console + Bing + IndexNow, Apple Search Ads et Google Ads lancés, Brevo et n8n installés, 12 semaines de contenu produites depuis les sorties réelles, guides organisateurs indexés, chiffres honnêtes sur la landing.

**12 mois** : janvier, course à pied à Paris (pré-inscriptions run clubs par les guides et LinkedIn) ; février–mars, saison rando (pages prêtes, budget Ads doublé), tests Meta/TikTok avec les premières UGC ; avril, padel et vélo ; mai–juin, 93/91/95 ; septembre, rentrée (universités en ligne, run clubs, padel) ; octobre 2027, Lyon via les mêmes pages, préremplies 3 mois avant.

## 8. SEO

### Ce qui est livré dans ce dépôt

- **Prérendu statique** de toutes les pages publiques (Vite SSR + script `scripts/prerender.mjs`) : Google, Bing et les crawlers IA (qui n'exécutent pas le JavaScript) lisent du HTML complet. L'app reste une SPA pour la navigation.
- **44 pages** générées aujourd'hui : accueil, `/sports`, `/evenements`, `/organiser`, 14 pages sport, 25 pages sport × zone (uniquement là où il existe du contenu unique : spots, accès, FAQ), et une page par événement dès que le flux est branché.
- **Données structurées** : Organization, SoftwareApplication/MobileApplication, WebSite, BreadcrumbList, FAQPage par sport, SportsEvent par événement (éligible aux rich results Événements de Google).
- `robots.txt`, `sitemap.xml` (index pages + événements avec `lastmod`), `llms.txt`, `llms-full.txt`, `api/public/events.json`, `events.ics`, balises Open Graph corrigées (l'ancienne image bolt.new est supprimée), canonical par page, `apple-itunes-app`.
- Formulaires de capture de leads sur chaque page, reliés au service de leads.

### Mots-clés : ce que les gens tapent vraiment

Volumes mensuels France (Ubersuggest, octobre 2026). La demande est **sport + lieu** ; les requêtes génériques (« réseau social sportif » 90, « application sport à plusieurs » ≈ 0, « créer un run club » ≈ 0) ne ramènent quasiment personne.

| Requête | Volume | Page |
|---|---|---|
| randonnée annecy / vosges / fontainebleau | 5 400 chacune | `/randonnee/annecy`, `/randonnee/vosges`, `/randonnee/fontainebleau` |
| padel lyon / marseille / bordeaux | 4 400 / 4 400 / 2 400 | `/padel/lyon`, `/padel/marseille`, `/padel/bordeaux` |
| padel paris (et 15, 16, 20) | 9 900 (590, 480, 390) | `/sport/padel/paris`, `/padel/paris-15`, `-16`, `-20` |
| randonnée chamonix | 2 900 | `/randonnee/chamonix` |
| escalade fontainebleau | 2 400 | `/escalade/fontainebleau` |
| randonnée gorges du verdon | 2 400 | `/randonnee/gorges-du-verdon` |
| randonnée paris | 2 400 | `/sport/randonnee/paris` |
| randonnée marseille / calanques | 1 900 / 1 300 | `/randonnee/calanques-marseille` |
| run club paris | 1 600 | `/run-clubs-paris` |
| randonnée nice / grenoble | 1 600 chacune | `/randonnee/nice`, `/randonnee/grenoble` |
| randonnée lyon / toulouse | 1 300 chacune | `/randonnee/lyon`, `/randonnee/toulouse` |
| randonnée ce week-end (+ autour de moi) | 480 + 1 000 | `/randonnees-week-end-ile-de-france` |
| trail fontainebleau, randonnée vexin, escalade calanques | 590 chacune | `/trail/fontainebleau`, `/randonnee/vexin`, `/escalade/calanques` |
| randonnée vallée de chevreuse / forêt de rambouillet | 480 / 170 | `/randonnee/vallee-de-chevreuse`, `/randonnee/foret-de-rambouillet` |

Les pages lieu sont décrites dans `src/data/places.ts` : ajouter un lieu = ajouter une entrée.

### Prochaines étapes SEO (par ordre)

1. Déployer, soumettre le sitemap dans Google Search Console **et** Bing Webmaster Tools (ChatGPT s'appuie sur Bing), activer IndexNow.
2. Brancher le flux événements (chaque sortie = une page, un `SportsEvent`, une ligne de sitemap).
3. Remplacer les chiffres de la landing par `stats.json` (§ `docs/acces-donnees.md` du dépôt du site).
4. Annuaire des run clubs d'Île-de-France (pages club : jour, heure, lieu, allure) : le modèle Hellorunner/Urban Sports Club, qui ranke sur « run club paris » avec une simple page entité.
5. 10 guides éditoriaux liés aux pages zone (« Les 25 Bosses en groupe : guide », « Randonner en RER depuis Paris »), avec citations ONF/IGN/FFRandonnée.
6. Miroir des sorties publiques sur Meetup (groupe Fitmates Randonnée IDF), Eventbrite/AllEvents et agendas de mairies, avec lien canonique vers fitmates.net : les IA citent les agrégateurs pour « rando ce week-end ».
7. Liens entrants : presse locale, Reddit (r/paris, r/randonnee), forums Visorando, blogs rando, Product Hunt, Crunchbase, Wikidata (entité Fitmates).
8. Version anglaise (`/en/`) seulement quand la demande anglophone est mesurée (Power Hiking Paris montre qu'elle existe).

## 9. Visibilité dans les assistants IA (llms.txt et au-delà)

Ce que disent les études 2025–26 : les crawlers IA n'exécutent pas le JavaScript (d'où le prérendu) ; pour être cité, une page doit contenir des **définitions nettes, des statistiques datées, des citations de sources, une FAQ et un `dateModified` réel** (gain de visibilité mesuré jusqu'à +40 % dans l'étude GEO de Princeton) ; les **domaines référents** sont le premier prédicteur des citations ChatGPT ; les fiches App Store représentent 6,6 % des pages citées par ChatGPT ; Google ne demande rien de plus que l'indexation classique pour AI Overviews/AI Mode ; `llms.txt` n'est officiellement utilisé par aucun acteur, mais coûte dix minutes [S21][S22][S23]. Le trafic direct depuis les IA restera marginal (ratio crawl/referral OpenAI 251:1) : l'objectif réaliste est la **recommandation de marque** (« essaie Fitmates ») et la **citation d'événements précis**.

Livré : HTML statique, JSON-LD, `llms.txt` (défini, chiffré, daté), `llms-full.txt` régénéré, flux JSON/iCal, robots.txt ouvert à tous les crawlers IA (sauf Bytespider), FAQ par sport.

À faire :
1. Bing Webmaster Tools + IndexNow (2 h) ; rapport « AI Performance » de Bing pour suivre Copilot.
2. Fiches stores réécrites avec une phrase définitionnelle (« Fitmates est une application gratuite pour… »).
3. Entité : Wikidata, Crunchbase, Product Hunt, LinkedIn, `sameAs` cohérents (déjà dans le JSON-LD Organization).
4. Serveur MCP public « Fitmates events » (`search_events`, `get_event`, `list_zones`) sur l'endpoint de recherche du backend, soumission au Plugin Directory ChatGPT ; App Intents iOS côté app. 1–2 semaines de dev.
5. Mesure : 30 prompts fixes (« appli pour trouver des partenaires de randonnée en Île-de-France », « randonnée ce week-end près de Paris », « alternative à Meetup pour le sport »…) lancés chaque semaine via les API Perplexity, OpenAI, Anthropic et Gemini, en notant mention, citation et concurrents cités. Coût < 10 €/mois. Plus GA4 : segment referrer `chatgpt.com|perplexity.ai|claude.ai|gemini.google.com|copilot.microsoft.com`.

## 10. Génération et gestion des leads

**Trois types de leads**, capturés par le même formulaire (présent sur toutes les pages) : participant (« préviens-moi des sorties de ma zone »), organisateur (« je veux organiser »), partenaire (club, coach, marque). Chaque lead porte la source (page), le sport, la zone et les UTM.

**Outil livré** : `leads-service/` — service Node sans dépendance, SQLite, Docker, interface admin (filtres, statut, responsable, prochaine relance, notes, export CSV, suppression RGPD), webhook de notification (Slack/Discord/n8n). Gratuit, hébergé sur ton VPS. Si tu veux plus tard de l'emailing, branche le webhook sur Brevo (gratuit jusqu'à 300 emails/jour, français, RGPD) ; HubSpot Free est l'alternative.

**Pipeline** : `nouveau → contacté → qualifié → converti | perdu`.

**Règles de traitement (automatisées, séquences dans `strategie/playbook-digital.md`)** :
- Organisateur : email J0 avec kit et guide, J+2 témoignage, J+7 et J+21 relances conditionnelles (sortie publiée ou non), mise en avant 30 jours des premières sorties ; conversion = 2 sorties publiées. Seule action humaine : répondre aux réponses.
- Participant : email hebdo « sorties de ta zone » généré depuis le flux, tant que pas d'installation ; conversion = 1 participation.
- Partenaire : accusé avec 3 formats et lien de rendez-vous, relances J+3 et J+10.

**Où les organisateurs existent déjà (pour le ciblage publicitaire et le contenu, pas pour du démarchage)** : run clubs parisiens (Paname, Collision, Kiin, Team Trail Paris, Marais Running Club, food run clubs), groupes Meetup rando (Les Joyeux Marcheurs, Power Hiking Paris, Intrepid Hikers), clubs listés sur paris.fr, Campus Coach IDF, coachs Superprof/Protrainer, BDS et SUAPS, salles (Arkose, Climb Up), centres (Urban Soccer), clubs de padel. Ces audiences se ciblent par intérêts et titres sur Meta, LinkedIn et Google, et se touchent par les guides organisateurs et les annuaires en ligne.

## 11. KPIs et tableau de bord

| Indicateur | Cible 3 mois | Cible 12 mois | Source |
|---|---|---|---|
| Participations réelles / semaine (IDF) | 200 | 1 500 | backend (`stats.json`) |
| Organisateurs actifs (≥ 1 sortie / 30 j) | 30 | 150 | backend |
| Taux de présence (check-in / inscrits) | 75 % | 85 % | backend |
| Rétention : 2ᵉ participation dans les 30 j | 40 % | 55 % | backend |
| Zones ouvertes (seuil 3 orga / 30 participants) | 5 | 12 | backend |
| Sessions organiques Google + Bing / mois | 2 000 | 20 000 | Search Console, Bing |
| Pages indexées | 50 | 1 000 (événements) | Search Console |
| Mentions Fitmates dans les 30 prompts IA | 3/30 | 15/30 | script hebdo |
| Leads organisateurs / mois, taux de conversion | 20, 30 % | 60, 40 % | leads-service |
| K-factor parrainage | 0,15 | 0,3 | backend |
| Coût d'acquisition (hors salaires) | 0 € | < 1 € par membre actif | compta |

## 12. Ce qui est livré, ce qui reste

**Livré (dépôt du site `dlahlou/fitmate-landing-page`)** : prérendu statique, pages sports / sport × zone / événements / organiser, quatre guides d'acquisition organisateurs (HowTo + FAQ), événement GA4 `generate_lead`, données structurées, robots, sitemaps, llms.txt, flux JSON et iCal, formulaires de leads, service de leads auto-hébergé, workflow de rebuild quotidien, script Google Trends, contrat de données backend (`docs/acces-donnees.md`).

**À faire par toi (tout est digital, rien n'est du démarchage)** :
1. Backend : exposer `/public/events.json` (et `stats.json`) au format documenté ; donner l'URL (variable `EVENTS_FEED_URL`).
2. Formulaires : reçus par la fonction Vercel `api/leads.ts` et stockés dans le Blob privé `fitmates-leads` (Vercel → Storage), aucun email envoyé. `leads-service/` (VPS) reste une alternative via `VITE_LEADS_API_URL`.
3. Vercel : rebuild quotidien par `.github/workflows/daily-rebuild.yml` (commit vide sur main, aucun secret).
4. Search Console, Bing Webmaster, IndexNow ; comptes Apple Search Ads et Google Ads avec les specs du playbook.
5. **Remplacer les chiffres fictifs de la landing** (10 000+ utilisateurs, 50 000+ événements, 500 000+ messages, « top contributeurs ») par les chiffres réels : ils contredisent `llms.txt`, le pitch (1 200 utilisateurs) et exposent à une qualification de pratique commerciale trompeuse. Je ne les ai pas modifiés sans ton accord ; c'est un changement de 15 minutes dans `src/components/Hero.tsx` et `src/components/Stats.tsx`.
6. Uniformiser le domaine : le site est sur fitmates.net, le support sur fitmates.app ; choisir une adresse (`contact@fitmates.net`) et rediriger l'autre.

## Sources

- [S1] Ministère des Sports / INJEP, pratique régulière 2025 : https://www.sports.gouv.fr/sport-en-france-une-progression-continue-depuis-2018-boostee-par-les-jeux-de-paris-2024-10055
- [S2] INJEP, licences 2024–2025 : https://patrickbayeux.com/wp-content/uploads/2026/08/2608-Licences-sportives.pdf ; https://www.sports.gouv.fr/les-jeux-de-paris-2024-un-tremplin-pour-la-pratique-sportive-des-femmes-et-des-seniors-3197
- [S3] CRÉDOC, Baromètre national des pratiques sportives 2025 : https://www.credoc.fr/publications/barometre-national-des-pratiques-sportives-2025
- [S4] INJEP, Chiffres clés du sport 2023 (freins) : https://injep.fr/wp-content/uploads/2024/03/Chiffres-cles-sport-2023.pdf ; rapport 2022 (pratique seul/amis) : https://injep.fr/wp-content/uploads/2023/04/rapport-2023-02-Barometre-pratiques-sportives-2022.pdf
- [S5] Fondation de France, Solitudes 2025/2026 : https://www.fondationdefrance.org/images/pdf/2026/etude-solitudes.pdf ; https://www.fondationdefrance.org/images/pdf/2026/CP_Solitudes_2025.pdf
- [S6] INSEE Flash IDF 2026 : https://www.insee.fr/fr/statistiques/8970303 ; Institut Paris Région (20–39 ans) : https://data.iau-idf.fr/fileadmin/DataStorage/SavoirFaire/NosTravaux/emploi_formation/rdvmetiers2030/Philippe_Louchart_IPR_Dynamique_demographique_IDF.pdf
- [S7] Institut Paris Région / IRDS, Chiffres clés du sport 2025 : https://www.institutparisregion.fr/fileadmin/DataStorageKit/IRDS/Publications/chiffres_cles/chiffresClesSport2025.pdf
- [S8] Banque des Territoires, équipements IDF : https://www.banquedesterritoires.fr/le-sport-en-ile-de-france-beaucoup-de-pratiquants-peu-dequipements
- [S9] FFRandonnée 2025 : https://www.ffrandonnee.fr/la-randonnee-activite-preferee-des-francais-en-2025 ; chiffres clés : https://www.ffrandonnee.fr/s-informer/actualites/les-chiffres-cles-sur-la-randonnee-en-france ; objectif 500 000 : https://www.ffrandonnee.fr/en-chemin-vers-les-500-000-licencies-en-2028-faisons-le-point-sur-l-adhesion
- [S10] Union Sport & Cycle, Observatoire du running 2026 : https://www.unionsportcycle.com/medias/documents/observatoire-du-running-2026-uesc_1492181052.pdf ; RunMotion 2025 : https://run-motion.com/wp-content/uploads/2025/06/Edition-2025-Barometre-du-Running-by-RunMotion.pdf
- [S11] Strava, bilan 2025 (clubs) : https://www.bike-magazin.de/en/training/fitness/strava-s-2025-annual-report-specialized-is-the-number-1-biker/ ; run clubs × 6,5 : https://www.presse-citron.net/apple-watch-hoka-club-running-strava/
- [S12] Hyrox Paris : https://fr.rox-coach.com/upcoming-races/hyrox-paris-grand-palais ; fitness USC : https://www.toute-la-franchise.com/article-salles-sport-france-perspectives
- [S13] Padel : https://padelmagazine.fr/padel-en-france-850-000-pratiquants-4-520-pistes-la-croissance-change-dechelle/ ; FFT guide pistes IDF : https://guidedudirigeant.fft.fr/wp-content/uploads/2025/10/FF25-120_PADEL_Guide_Pratique_Constructions_FINAL-1.pdf
- [S14] Ahrefs, recherches running France : https://ahrefs.com/fr/blog/running-etudes-recherches/
- [S15] SGI Europe, intérêt padel : https://www.sgieurope.com/consumer/padel-hits-all-time-high-in-global-search-interest/120682.article
- [S16] INJEP, engagement bénévole dans les associations sportives : https://patrickbayeux.com/wp-content/uploads/2023/10/2310-IAS71_engagement_benevole_associations_sportives.pdf
- [S17] Frimake, levée de 10 M€ : https://france3-regions.franceinfo.fr/occitanie/haute-garonne/toulouse/c-est-le-reseau-social-de-la-vraie-vie-concue-pour-briser-la-solitude-frimake-leve-10-millions-et-part-a-la-conquete-du-monde-3242734.html ; Timeleft : https://dailymax.substack.com/p/timeleft-de-0-a-1-million-deuros
- [S18] Benchmarks parrainage : https://www.referralcandy.com/blog/referral-program-benchmarks-whats-a-good-conversion-rate-in-2025 ; https://kurve.co.uk/blog/app-referral-marketing-k-factor-viral-retention ; Nextdoor cold start : https://www.alexanderjarvis.com/nextdoor-doing-things-that-dont-scale
- [S19] Apple Search Ads benchmarks : https://www.apptweak.com/en/aso-blog/apple-ads-benchmarks ; CPI : https://www.businessofapps.com/ads/cpi/research/cost-per-install/
- [S20] Tarifs influence FR : https://www.kolsquare.com/fr/blog/quels-sont-les-tarifs-dinfluenceurs-sur-tiktok ; https://www.lafabriquedunet.fr/agences/tendances/combien-coute-le-marketing-dinfluence
- [S21] Crawlers IA et JavaScript : https://vercel.com/blog/the-rise-of-the-ai-crawler ; Google AI features : https://developers.google.com/search/docs/appearance/ai-features ; llms.txt : https://llmstxt.org/ ; Mueller : https://www.seroundtable.com/google-ai-llms-txt-39607.html
- [S22] GEO (Princeton) : https://arxiv.org/html/2311.09735v3 ; Kevin Indig : https://www.growth-memo.com/p/the-science-of-how-ai-picks-its-sources ; Ahrefs pages citées : https://ahrefs.com/blog/chatgpts-most-cited-pages/ ; Semrush AI Visibility Index 2026 : https://www.semrush.com/news/463141-semrush-releases-expanded-2026-ai-visibility-index-analyzing-126-million-ai-search-prompts/
- [S23] Cloudflare Radar crawl/referral : https://ppc.land/crawl-to-referral-ratio/ ; Plugin Directory ChatGPT : https://help.openai.com/en/articles/20001040-submitting-apps-to-the-chatgpt-app-directory ; Event structured data : https://developers.google.com/search/docs/appearance/structured-data/event
- Run clubs Paris : https://en.lebonbon.fr/paris/lifestyle/best-running-clubs-in/ ; https://www.timeout.fr/paris/sport/a-paris-lappetit-pour-les-food-running-clubs-se-confirme ; clubs rando Paris : https://www.paris.fr/pages/on-a-liste-tous-les-clubs-de-randonnee-de-paris-29475 ; Paris Sport Dimanche : https://www.paris.fr/pages/des-cours-collectifs-gratuits-avec-paris-sport-dimanche-6759 ; Région IDF Ambassadeurs du sport : https://www.iledefrance.fr/aides-et-appels-a-projets/rencontre-avec-les-ambassadeurs-du-sport-de-la-region-ile-de-france
