# Passation du projet marketing Fitmates (26/10/2026)

À lire en entier par toute session qui reprend le marketing. Les règles permanentes sont dans `CLAUDE.md` (à relire aussi).

## Mode de travail voulu par Driss

- **Autonomie complète** : avancer sans demander de validation, **sauf** pour les informations de fond de l'app
  (titre / nom, sous-titre iOS, icône, catégorie) : **ne jamais les modifier**. Descriptions, mots-clés iOS, texte
  promotionnel, site, contenus : on avance.
- Répondre en français, court, avec les liens cliquables vers les consoles quand une action revient à Driss.
- **Travailler avec des sous-agents** (outil Agent) pour les chantiers parallèles, chacun sur sa branche ; relire le
  diff, vérifier le build, puis fusionner soi-même.
- Toute mise à jour de fiche Google Play part en revue Google : le dire avant d'envoyer.
- Ne jamais demander de secret dans le chat. Driss met les clés en variables d'environnement de l'environnement cloud ;
  **une session ne lit ces variables qu'à son démarrage** (après un changement de clé, il faut une nouvelle session).
- Si Driss a besoin de données de l'app ou du backend : **ne pas cloner `dlahlou/fitmate`**, lui demander, il prépare
  une interface.

## Dépôts

| Dépôt | Rôle |
|---|---|
| `dlahlou/fitmate-marketing` (celui-ci) | Stratégie, canaux, connecteurs (`fitmates_mkt/`), scripts, **cockpit** (`cockpit/`) |
| `dlahlou/fitmate-landing-page` | Site www.fitmates.net (Vite + React, prérendu ; push sur main = déploiement Vercel). À ajouter avec `add_repo` (accès push) quand il faut y toucher |
| `dlahlou/fitmate` | App (Expo). Hors périmètre : ne pas y toucher |

## Cockpit (le tableau de bord de Driss)

- https://fitmate-cockpit.vercel.app : projet Vercel `fitmate-cockpit` (id `prj_IAMQlcjpWSdgm9q4cTILl7TZracf`,
  équipe `team_GuHZIYsuWwAvM3DLTs6foS7y`), racine `cockpit/`, protégé par Vercel Authentication.
- Exigence de Driss : **orienté action, tout l'essentiel sur un écran sans défiler, le détail au clic**, et pas centré
  sur le site (tous les canaux).
- Données : `python -m scripts.cockpit_export` réécrit `cockpit/data/*.json` ; commit + push sur main = redéploiement.
- `cockpit/todo.json` : la liste d'actions (qui, canal, priorité, lien, statut). **Toute action pour Driss a des `etapes`** (texte, `lien` + `libelle_lien`, `copier`) et une `duree` : un lien par étape, où cliquer, quoi coller. Le cockpit les affiche avec un bouton « Copier ». **Passer `statut` à `fait`** quand
  Driss dit qu'une action est faite. Les accès manquants s'y ajoutent automatiquement.
- `cockpit/actions.json` : journal des changements (à compléter à chaque action, pour comparer 3 à 4 semaines après).
- Export quotidien : tâche planifiée à 6 h 47 (Paris) dans la session dédiée. Une session lancée « à neuf » par une
  tâche planifiée **ne peut pas pousser** (dépôt non attaché) : la tâche doit revenir dans une session créée avec ce
  dépôt comme source.
- Le proxy de l'environnement bloque `*.vercel.app` en accès direct : vérifier un déploiement avec l'outil Vercel MCP
  `web_fetch_vercel_url` ou `list_deployments`.

## Accès aux données (état au 26/10)

| Source | État | Remarque |
|---|---|---|
| GA4 | OK | Compte de service lecteur ; ID de propriété détecté automatiquement |
| Search Console | OK | `sc-domain:fitmates.net`, le compte de service a l'accès complet (soumission de sitemap possible par API) |
| Google Play : fiche, avis, Reporting | OK | Compte de service `claude-aso@fitmate-9bdfa` |
| Google Play : rapports groupés (installations, visites de fiche) | **en attente** | Dossier `gs://pubsite_prod_7410630646260977899` (enregistré dans le code). Driss a donné la permission « rapports groupés » le 26/10 vers 14 h ; 403 encore à 14 h 20 (délai Google jusqu'à 24 h). Jeu `play_stats` déjà branché dans `scripts/cockpit_export.py` et le panneau Stores (visiteurs, installations, conversion par source et France, 28 j) : il se remplit tout seul quand le 403 disparaît. Noms de colonnes à vérifier sur le premier vrai fichier |
| App Store Connect | **OK, rapports en attente** | Nouvelle clé d'équipe Admin `H97FPGXK62` mise dans l'environnement le 26/10. Vérifier `app_store.app()` puis `ensure_analytics_request()` ; Clé OK le 26/10, demande de rapports créée ; aucun rapport produit à 15 h. Jeu `app_store_stats` déjà branché (impressions, fiche vue, premiers téléchargements par source, 28 j) : il se remplit tout seul. Noms de colonnes à vérifier sur le premier vrai rapport |
| Positions dans les stores | bloqué | Hôtes `itunes.apple.com` et `play.google.com` refusés par le réseau de l'environnement |
| Backend : flux public des sorties | OK | `https://backend.fitmates.net/api/v1/events/public/events.json` |
| Backend : agrégats (inscriptions, actifs…) | manquant | Interface à préparer par Driss (contrat proposé dans `docs/sources-de-donnees.md`) |
| Meta (Facebook, Instagram) | OK | App « Fitmates Marketing » (1908428910145090), `graph.facebook.com` autorisé le 26/10. Jeton de Page sans expiration, accès aux données jusqu'à fin janvier 2027 (rappel programmé le 15/01). Instagram lié : @fitmates_strongertogether (0 abonné, 0 publication au 26/10). Jeu `reseaux` dans le cockpit. Threads abandonné pour l'instant |
| Listes d'attente du site | OK | Compteur public `/api/waitlist`, agrégé dans le cockpit |
| Ubersuggest | OK | Outils MCP (volumes France : locId 2250, langue fr) |

## État des canaux

### Stores (ASO)
- **Google Play** : fiche fr-FR créée et en-GB réécrite (descriptions seulement ; titres revenus à « Fitmates »).
  1er envoi refusé pour un lien de suppression de compte cassé → page `/data-deletion.html` rétablie avec formulaire.
  **Renvoyée en revue par Driss le 26/10.** À suivre ; si refus, demander le motif à Driss.
- **App Store** : version **1.1.16 en brouillon** (descriptions et mots-clés fr-FR / en-US ; nom « Fitmates – Sports
  Social » et sous-titre « Stronger Together » inchangés). Attend un build de Driss. Texte promotionnel en-US mis à jour
  sur la version en ligne 1.1.3.
- Textes de référence : `canaux/aso/fiches/*.json` ; `python -m scripts.aso_listings` compare (lecture seule) ;
  `--apply` ne touche jamais au titre ni au sous-titre.
- **Captures fr-FR** prêtes dans `canaux/aso/visuels/fr-FR/` (écrans reconstruits, aucune donnée personnelle) :
  **à valider contre l'app réelle** avant tout envoi.
- Mesure ASO prévue à J+21 après publication (~16/11).

### Google (SEO)
- 26/10 : pied de page avec liens vers la randonnée IDF (8 départements), redirections 308 (`/index.html`,
  alias `fitmate-landing-page-amber.vercel.app`), suppression de `public/_redirects` (reste Netlify), nouvelle page
  `/randonnee/autour-de-paris`, FAQ propres à chaque département IDF, section rando sur l'accueil. Sitemap resoumis.
- Base : 249 apparitions / 13 clics en 30 jours (6 sur la marque). Doublon de `/` dû à une ancienne canonique sans www
  (corrigé depuis le 23/10, se résorbe à la prochaine exploration).
- Calendrier éditorial : novembre (Rambouillet après le 15/11, itinéraires sourcés Chevreuse / Rambouillet / Vexin),
  décembre (randonner l'hiver autour de Paris), janvier (gare à gare ligne par ligne, page « randonnée en groupe »),
  février (état des sentiers de Fontainebleau), mars (relevé Search Console vs base, réécrire les pages qui progressent
  le moins). Pas de fait non sourcé.
- **Bug à corriger dans le site (constaté le 26/10)** : un clic sur un lien interne change de page mais garde la position de défilement (accueil défilé à 3 613 px → /sports s'ouvre à 2 953 px). Correctif : un composant `ScrollToTop` monté dans le routeur (React Router) qui fait `window.scrollTo(0, 0)` à chaque changement de `pathname` quand le type de navigation n'est pas `POP` (retour arrière : laisser le navigateur restaurer), et qui défile vers l'élément visé quand l'URL a une ancre (`/#app`). En attente de l'accès au dépôt du site.
- Signalés, non traités (décision produit / backend, à remonter à Driss) : les pages des sorties passées passent en 404
  au rebuild quotidien ; une sortie sans `price_eur` dans le flux s'affiche « gratuite ».

### Site et leads
- Formulaires → Vercel Blob `fitmates-leads` + e-mail Resend à `NOTIFY_EMAIL` (expéditeur `onboarding@resend.dev`).
  Premier inscrit en liste d'attente le 26/10 (course à pied, Hauts-de-Seine).
- **À faire après vérification du domaine fitmates.net dans Resend (action Driss)** : e-mail de confirmation et de
  parrainage aux inscrits.
- Contact unique sur le site : `contact@fitmates.net`. Page `/data-deletion.html` : formulaire → `api/account-deletion.ts`.

### Réseaux sociaux
- Workflow n8n de diffusion des sorties prêt (`canaux/social/n8n/`), non branché : les jetons Meta existent désormais, reste à le brancher.

## Actions ouvertes pour Driss (aussi dans le cockpit)

Retrait de l'URL de spam `/cs/` dans la Search Console, demande d'indexation des pages rando, build iOS 1.1.16,
domaine Resend, validation des captures, prix dans le flux backend, accès Meta, interface backend.

## Ménage restant (demander à Driss avant de supprimer)

- Ancien cockpit en Claude Artifact : https://claude.ai/artifact/1REPuk56u7BudtjKvqPoLh (remplacé par l'app Vercel).
- Session inutile `session_01Bt3SMxDJh5ewnnpCNs1QEo` (ancienne session d'export, avant le changement de clé).
