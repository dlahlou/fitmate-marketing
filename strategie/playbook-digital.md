# Playbook d'acquisition 100 % digital

Principe : **personne ne démarche à la main**. Les participants et les organisateurs arrivent par six portes digitales, atterrissent sur une page qui répond à leur intention, laissent leur email ou installent l'app, puis sont accompagnés par des séquences automatiques. Le seul travail humain récurrent est de valider des contenus et de répondre aux leads qualifiés.

## 1. Le funnel

```
Portes d'entrée (6)                      Atterrissage                    Conversion              Accompagnement automatique
─────────────────────                    ────────────                    ──────────              ──────────────────────────
Google / Bing (SEO + Ads)        →   pages sport × zone, événements  →  install app         →  notifications sorties de ma zone
Assistants IA (ChatGPT, etc.)    →   pages organisateur (guides)     →  formulaire lead     →  séquences email (3 profils)
App Store / Play (ASO + ASA)     →   fiche store                     →  install             →  onboarding in-app
Instagram / TikTok / YouTube     →   page de la sortie partagée      →  inscription sortie  →  parrainage « invite ton groupe »
Meta / TikTok Ads (à partir de mars)                                                                 
Parrainage in-app + emails de participants
```

Deux boucles doivent tourner seules :

- **Boucle participants** : une sortie publiée → page publique indexée + post social automatique → inscriptions → photo de groupe et stats post-sortie → nouveau contenu → nouvelles inscriptions.
- **Boucle organisateurs** : requête « créer un run club » ou « organiser une randonnée » → guide → formulaire → séquence email de 5 messages + kit → première sortie créée → ses participants deviennent la preuve sociale de la page sport × zone → d'autres organisateurs la voient.

## 2. D'où viennent les organisateurs, en digital

| Porte | Mécanisme | Ce qui est en place | Reste à faire |
|---|---|---|---|
| SEO intention organisateur | Pages `/organiser/run-club`, `/organiser/groupe-randonnee`, `/organiser/coach-sportif`, `/organiser/club-association` avec balisage HowTo + FAQ | livré | 1 article invité par mois sur blogs rando/running avec lien vers ces pages |
| Google Ads Search | mots-clés : créer un run club, organiser une randonnée, coach sportif trouver des clients, remplir ses cours collectifs, application run club | specs § 4 | compte, 10 €/jour |
| LinkedIn (coachs, assos, BDS) | contenu organique du compte Fitmates + 1 campagne « Sponsored Content » ciblée titres « coach sportif », « éducateur sportif », « président association sportive », zone IDF | specs § 4 | 5 €/jour en test |
| Meta Ads | audiences par intérêts : Meetup, Strava, run clubs, FFRandonnée, Hyrox, Decathlon ; créas « tu organises déjà, on remplit tes sorties » | specs § 4 | à partir de mars |
| Instagram organique | réponses automatiques aux DM contenant « organiser », « run club », « coach » (Meta Business Suite, règle automatisée) → lien guide | règle à créer | 15 min |
| Email sortant automatisé | newsletter mensuelle « Capitaines » aux leads organisateurs ; relance automatique à J+7 et J+21 sans sortie publiée | séquences § 5 | Brevo (gratuit) branché au webhook |
| Preuve sociale sur les pages sport × zone | « 6 organisateurs actifs en Seine-et-Marne » et portraits d'organisateurs : les organisateurs se recrutent entre eux | nécessite `stats.json` | backend |
| Partenariats digitaux | fiche Fitmates dans les annuaires (Hellorunner, run-clubs.eu, Product Hunt, AlternativeTo, mwm.ai), échange de liens avec Visorando/Komoot (itinéraire → « faire cette rando en groupe ») | liste § 7 | soumissions en ligne, 2 h |

## 3. Participants : canaux et messages

| Canal | Message | Format | Mesure |
|---|---|---|---|
| SEO sport × zone, événements | « Randonnée en Yvelines : 9 sorties à venir » | pages livrées, régénérées chaque jour | Search Console, clics → store |
| Apple Search Ads | « partenaire sport », « run club paris », « randonnée groupe », « application sport social », concurrents (Frimake, Meetup, Sportyfriends) | 300 €/mois, CPI cible ≤ 2,5 € | installs, J7 rétention |
| Instagram / TikTok organique | « on y était » (photo de groupe + distance + nb de participants), « sortie de dimanche » le jeudi, portrait d'organisateur | 3 posts/semaine générés à partir des données de sortie + photos des participants (consentement dans l'app) | clics lien bio (UTM), installs |
| YouTube Shorts / Pinterest | itinéraires IDF en 30 s, « 5 randos accessibles en RER » ; Pinterest indexe les épingles itinéraires pendant des mois | 1 par semaine, réutilisation des Reels | trafic référent |
| Reddit / forums | réponses utiles sur r/paris, r/randonnee, r/running (« où courir en groupe à Paris ? ») avec lien vers la page zone, 2 par semaine, sans spam | manuel mais digital, 20 min/semaine | referral, citations IA |
| Meta / TikTok Ads (mars 2027) | « Dimanche, 15 km à Fontainebleau, 12 personnes, il reste 3 places » : annonce dynamique par sortie | créas UGC, ciblage 25–39 IDF intérêts rando/running, 15 €/jour | CPI, coût par participation |
| Parrainage in-app | « invite ton groupe » à la création d'une sortie, « amène un ami » après la 1ʳᵉ participation, badge « a amené X personnes » | produit (backend) | K-factor |
| Email participants | « 4 sorties de ton niveau cette semaine dans ta zone » (hebdo, jeudi 18h), générée depuis le flux | Brevo, segment sport × zone × niveau | ouverture, clics, participations |

## 4. Campagnes payantes : specs prêtes à copier

Budget total test : **600 €/mois** jusqu'en février, puis décision sur les données.

**Apple Search Ads (300 €/mois, dès maintenant).** Campagne « Intention » : partenaire sport, partenaire de sport, faire du sport à plusieurs, sport social, run club paris, courir en groupe, randonnée groupe, rando ile de france, groupe de randonnée. Campagne « Concurrents » : frimake, meetup, sportyfriends, atclub, strava clubs. Enchère au CPT 0,80 €, CPI cible 2,5 €. Exclure les mots-clés « salle de sport », « musculation ». Rapports : installs et J7 par mot-clé ; couper tout mot-clé sans install J7 après 30 €.

**Google Ads Search organisateurs (300 €/mois, dès maintenant).** Groupe 1 « run club » : créer un run club, lancer un run club, organiser une sortie running, application run club. Groupe 2 « rando » : organiser une randonnée, créer un groupe de randonnée, application organiser randonnée. Groupe 3 « coach » : coach sportif trouver des clients, remplir ses cours collectifs, coach sportif visibilité. Landing = le guide correspondant. Conversion = événement GA4 `generate_lead` (déjà émis par le formulaire). Zone IDF, français, enchère maximiser les conversions après 30 conversions, CPC max 1,50 €.

**LinkedIn (test 150 €, janvier).** Sponsored Content, cible : titres coach sportif / éducateur sportif / préparateur physique / président ou secrétaire d'association sportive, IDF. Créa : « 7 sportifs sur 10 en Île-de-France pratiquent hors club. Vos séances ouvertes peuvent les toucher. » → guide club/coach.

**Meta et TikTok Ads (mars 2027, 15 €/jour chacun).** Objectif installs puis « participation ». Audiences : 25–39 ans, IDF, intérêts randonnée, trail, running, Strava, Decathlon, Hyrox, Meetup ; lookalike 1 % des participants actifs quand le pixel/SDK aura 1 000 événements. Créas : 3 vidéos UGC 15 s verticales par sport (« je suis venue seule, on était 14 »), 1 carrousel « 5 sorties cette semaine », annonces dynamiques alimentées par le flux `events.json` via catalogue. Exclure les installés.

**Retargeting (dès que le pixel est posé).** Visiteurs des pages événement sans install → annonce de la sortie vue ; visiteurs des guides organisateur sans lead → témoignage d'organisateur.

## 5. Séquences email automatiques (Brevo, gratuit jusqu'à 300 emails/jour)

Déclenchées par le webhook du service de leads (`LEAD_WEBHOOK_URL` → n8n ou Make → Brevo, ou directement l'API Brevo). Expéditeur : prénom du fondateur, pas « noreply ».

**Organisateur (type = organisateur).**
- J0, immédiat : « Ton kit organisateur Fitmates ». Lien vers l'app, le guide correspondant au sport, la check-list en 5 points, et une question : « Quel est ton prochain créneau ? Réponds à cet email, je te crée la sortie avec toi. »
- J+2 : « Comment Clara remplit ses randos du dimanche ». Témoignage (vrai) + capture de la page publique d'une sortie + « crée ta première sortie en une phrase ».
- J+7 (si aucune sortie publiée) : « Trois raisons pour lesquelles les premières sorties se remplissent ». Les sorties des nouveaux organisateurs sont mises en avant 30 jours.
- J+14 (si sortie publiée) : « Ta sortie est en ligne : voilà comment la partager ». Lien de parrainage, visuel auto-généré pour Instagram, texte prêt à coller.
- J+21 (si aucune sortie) : « On arrête de t'écrire, sauf si… ». Dernier message, une question ouverte. Statut lead → perdu si pas de réponse.

**Participant (type = participant).**
- J0 : « Les sorties de ta zone cette semaine » (liste dynamique depuis le flux, filtrée sport × zone) + lien install.
- Hebdo, jeudi 18h : même format, tant que pas d'installation (détection via UTM/param de lien).
- Après 1ʳᵉ participation (événement backend) : « Comment c'était ? » + « amène quelqu'un la prochaine fois » (lien de parrainage).

**Partenaire (type = partenaire).**
- J0 : accusé + 3 formats (visibilité gratuite, sorties sponsorisées, séances encadrées) + lien de prise de rendez-vous (Cal.com gratuit).
- J+3 : étude de cas (quand elle existera) ou chiffres de la zone.
- J+10 : relance courte.

Mesures : taux d'ouverture > 45 %, clic > 8 %, organisateur → 1ʳᵉ sortie publiée sous 14 jours > 30 %.

## 6. Contenu : calendrier 90 jours, produit sans tournage dédié

Source des visuels : photos de groupe envoyées par les participants dans le chat de la sortie (case « j'autorise Fitmates à réutiliser cette photo » dans l'app), captures de l'app, cartes des itinéraires. Montage et sous-titres : CapCut ou Canva, 20 minutes par post. Une personne, 3 h par semaine.

| Semaine | Instagram / TikTok (3 posts) | YouTube Shorts / Pinterest (1) | Blog / guide (1 toutes les 2 semaines) | Email |
|---|---|---|---|---|
| 1–2 | « On y était » ×2 (Fontainebleau, Chevreuse), portrait organisateur | « 5 randos accessibles en RER depuis Paris » | Guide « Les 25 Bosses en groupe » | lancement newsletter participants |
| 3–4 | Sortie de dimanche (jeudi), stats de la semaine (« 7 sorties, 86 participants »), « je suis venue seule » | « Randonner en train : mode d'emploi » | Guide « Randonner en RER : les 8 gares » | séquences organisateurs actives |
| 5–6 | Carrousel « débutant : par où commencer », on y était ×2 | Pinterest : 10 épingles itinéraires IDF | « Organiser une randonnée : les erreurs des premières fois » | newsletter Capitaines n°1 |
| 7–8 | Portrait organisateur, sortie de dimanche, « ce qu'il faut dans le sac » | Short « vallée de Chevreuse en 30 s » | Comparatif « Meetup, Frimake, Fitmates : pour le sport » (page SEO « meilleure appli ») | |
| 9–10 | Annonce course à pied (janvier), « run club : comment ça marche », on y était | « 3 parcours de run club à Paris » | Guide « Créer un run club » (déjà en ligne) relayé | pré-inscriptions run clubs |
| 11–12 | Bilan trimestre en chiffres, témoignages, sortie de dimanche | Short bilan | Page « Run clubs d'Île-de-France » (annuaire) | newsletter Capitaines n°2 |

Règles : jamais de stock photo ; chaque post renvoie vers une page du site avec UTM ; les chiffres sont réels et datés.

## 7. Présence digitale à installer une fois (2 heures)

Product Hunt, AlternativeTo, Crunchbase, Wikidata (entité Fitmates), LinkedIn page entreprise, Hellorunner et run-clubs.eu (dès la course à pied), annuaires d'apps FR (mwm.ai, app-sorties), Google Business Profile (si adresse), Bing Webmaster Tools + IndexNow, Pinterest Business, YouTube chaîne. Tous avec la même phrase de définition (« Fitmates est une application gratuite pour… ») et les mêmes liens : c'est la cohérence d'entité que les IA et Google utilisent.

## 8. Automatisations (n8n auto-hébergé sur le VPS, gratuit)

1. **Flux → réseaux** : chaque nouvelle sortie publique → post Instagram/Facebook « Dimanche : 25 Bosses, niveau sportif, 15 places » avec visuel généré (template Canva ou image HTML → PNG) et lien UTM. Un post par jour maximum, sélection de la sortie la plus remplie.
2. **Lead → Brevo** : webhook du service de leads → contact Brevo + liste selon le type → séquence.
3. **Sortie terminée → preuve sociale** : photo de groupe autorisée + stats → brouillon de post « on y était » à valider en un clic.
4. **Hebdo** : rapport Search Console + Bing + installs + leads + participations dans un message Slack/Telegram le lundi.
5. **IA** : les 30 prompts de mesure envoyés aux API Perplexity, OpenAI, Anthropic, Gemini chaque lundi, résultat dans un Google Sheet.

## 9. Conventions de mesure

- UTM : `utm_source` = instagram | tiktok | youtube | pinterest | reddit | brevo | asa | google | meta | linkedin ; `utm_medium` = organic | paid | email | referral ; `utm_campaign` = sport-zone-mois (ex. `randonnee-77-nov26`) ; `utm_content` = format.
- GA4 : `generate_lead` (déjà émis, avec `lead_type`, `sport`, `zone`, `source`), `click_store` (à ajouter sur les boutons store), `view_event` (pages événement). Conversions Google Ads importées depuis GA4.
- Stores : liens d'attribution Apple (campaign tokens) et Google Play (UTM `referrer`), lus dans Firebase ou AppsFlyer gratuit.
- Backend : participations réelles par sortie et par source d'inscription (UTM de la page qui a amené l'install) ; c'est la seule mesure qui compte.

## 10. Ce qui reste manuel, et pourquoi

Répondre aux leads organisateurs qualifiés (5 à 10 par semaine au début, 10 minutes chacun), valider les posts générés, tourner ou collecter les 3 vidéos UGC par sport pour les publicités. Tout le reste est automatisable avec les outils ci-dessus.
