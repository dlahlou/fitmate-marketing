# Plateformes et agendas pour publier les sorties Fitmates

Relevé du 28/10/2026. Objectif : publier gratuitement chaque sortie (randonnées en Île-de-France d'abord) avec un lien
vers la page de la sortie dans l'app ou vers https://www.fitmates.net/app.

**Méthode et limite** : le réseau de la session bloque l'ouverture directe des sites (meetup.com, eventbrite.fr,
allevents.in, openagenda.com ont échoué en résolution DNS). Tout ce qui suit vient de la recherche web, à partir des
pages officielles (aide, CGU, tarifs) citées en source. Quand l'information n'a pas pu être lue sur une page
officielle, c'est écrit « non vérifié ». Les liens de création marqués « (à confirmer) » sont les adresses usuelles,
non ouvertes pendant ce relevé. À revérifier en direct avant toute publication.

**Rappels internes** :
- Facebook (et tout réseau social) : rien n'est publié sans l'accord explicite de Driss pour ce post précis
  (`canaux/social/accords.json`). Un événement Facebook compte comme une publication.
- Certaines sorties sont payantes si l'organisateur le décide : ne jamais les annoncer comme « gratuites » sur une
  plateforme ; indiquer le coût quand il existe (Facebook et Meetup l'exigent).
- Aucun nom d'organisateur ou de membre dans les fiches publiées.

## Tableau récapitulatif

| Plateforme | Gratuit ? | Lien externe autorisé ? | Restrictions | Audience | Automatisation | Lien de création | Sources |
|---|---|---|---|---|---|---|---|
| **OpenAgenda** (réseau d'agendas : villes, départements, Région IDF) | Oui : version gratuite, événements illimités selon la doc FR ; une page « réseaux » plus ancienne parle de 365 événements/an (à confirmer) | Oui : champ « Inscription » (`registration`) qui accepte un lien | Chaque agenda est modéré par son propriétaire (ville, département…) ; il faut trouver les agendas qui acceptent les contributions | Non vérifié. Un jeu de données data.gouv.fr agrège les événements publics IDF publiés via OpenAgenda | **API REST gratuite en lecture et écriture** (`POST /v2/agendas/{agendaUID}/events`, clé dans les paramètres du compte) ; export iCal/JSON ; import automatique possible | Bouton « Ajouter un événement » sur la page de chaque agenda | [Tarifs](https://doc.openagenda.com/fr/article/tarifs-openagenda-2lhr2f/), [Offres réseaux](https://openagenda.com/decouvrirbr/network-pricing), [API](https://developers.openagenda.com/), [Création d'événement API](https://developers.openagenda.com/evenements/creation/), [Structure (champ inscription)](https://developers.openagenda.com/evenements/structure/), [Ajouter un événement](https://doc.openagenda.com/fr/article/creer-un-compte-et-ajouter-un-evenement-sur-openagenda-qfzrcu/), [Dataset IDF](https://data.gouv.fr/en/datasets/evenements-publics-en-ile-de-france-via-open-agenda) |
| **Que faire à Paris** (Ville de Paris) | Oui : agenda participatif ouvert aux associations et aux particuliers | Non vérifié | Fiche relue et validée par l'équipe de la Ville ; compte Mon Paris ; règles sur les événements payants ou commerciaux non trouvées | Non vérifié | Pas d'import trouvé ; les données sont republiées en open data | https://quefaire.paris.fr (via « Annoncez vos événements ») | [Annoncez vos événements](https://www.paris.fr/pages/annoncez-vos-evenements-5327), [Open data](https://opendata.paris.fr/explore/dataset/que-faire-a-paris-/) |
| **AllEvents** | Oui : « pas de frais pour publier » ; 1 USD par billet vendu via sa billetterie, à la charge de l'acheteur | **Oui** : option « Link to other ticketing website » dans la section Billets | Non vérifié | Auto-déclaré : 4 M de personnes par mois sur la page France, 20 M/mois dans le monde (chiffres de la plateforme, non audités) | API de lecture (découverte) ; pas d'import iCal ni d'API d'écriture trouvés | https://allevents.in/pages/ai-event-upload.php | [Lien externe](https://support.allevents.in/article/193-how-do-i-add-an-external-ticketing-link), [Liens externes](https://support.allevents.in/article/208-external-ticket-links), [Publier](https://allevents.in/pages/publish-events), [France](https://allevents.in/location.php?country=France), [API](https://allevents.in/pages/events-api) |
| **Facebook Events** (page Fitmates) | Oui | Probable : Meta mentionne un « Ticket URL » et des clics sur le lien de billetterie ; emplacement du champ non vérifié | Afficher clairement tout coût pour participer ; invitations automatisées interdites ; **accord de Driss par post** | Non vérifié | API Events réservée après App Review depuis 2018 ; création via API non vérifiée | https://www.facebook.com/events/create/ (à confirmer) | [Règles Pages, groupes, événements](https://www.facebook.com/policies_center/pages_groups_events), [Événement de Page](https://www.facebook.com/help/116346471784004), [Events pour les entreprises](https://en-gb.facebook.com/business/help/307523053476429), [Breaking changes API](https://developers.facebook.com/docs/graph-api/changelog/breaking-changes?hc_location=ufi) |
| **Eventbrite** | Oui : publication d'événements gratuits sans frais, de toute taille (pages récentes) ; une ancienne page Flex facturait au-delà de 25 billets | Non vérifié pour un événement standard : la billetterie externe est réservée aux anciens créateurs Eventbrite Music ; un lien dans la description reste possible (non vérifié) | Non vérifié | Non vérifié | **API de création d'événements** (`POST /v3/organizations/{id}/events/`, séries récurrentes possibles) | Depuis le tableau de bord organisateur (à confirmer) | [Tarifs](https://www.eventbrite.com/organizer/pricing/), [Plans](https://www.eventbrite.com/help/en-us/articles/193833/eventbrites-new-pricing-plans/), [Blog « free to publish »](https://www.eventbrite.com/blog/free-to-publish-events/), [Billetterie externe](https://www.eventbrite.com/help/en-us/articles/712079/how-to-create-an-externally-ticketed-event-on-eventbrite-music/), [API](https://www.eventbrite.com/platform/docs/create-events) |
| **Meetup** | Seulement l'offre **Starter** gratuite pour un tout premier organisateur : 1 groupe, **2 événements par mois max**. Sinon Standard dès 29,99 USD/mois, Pro dès 55 USD/groupe/mois (prix variables selon le pays) | Oui sous conditions : liens externes acceptés s'ils restent secondaires ; une inscription hors Meetup doit être clairement annoncée | Interdit : groupe principalement promotionnel, messages promotionnels de masse, groupes créés pour faire de la promotion croisée ; affiliation commerciale et frais à déclarer | Page sujet « Paris » : 211 846 membres sur 94 groupes (instantané non daté, doublons possibles) | API GraphQL (création d'événements) **réservée aux abonnés Pro**, sur approbation | Créer un groupe, puis un événement dans le groupe (lien à confirmer) | [Starter gratuit](https://help.meetup.com/hc/en-us/articles/40507261509645-Can-I-organize-a-Meetup-group-for-free), [Prix](https://help.meetup.com/hc/en-us/articles/28677808413197-Organizer-Subscription-prices-overview), [Promotion et liens](https://help.meetup.com/hc/en-us/articles/42913436322189-Affiliations-partnerships-and-business-promotion-on-Meetup), [Standards organisateur](https://help.meetup.com/hc/en-us/articles/360002913291-Organizer-and-leadership-standards-Best-organizer-practices), [API](https://help.meetup.com/hc/en-us/articles/41453576628749-How-can-I-get-access-to-Meetup-s-API), [Paris](https://www.meetup.com/topics/paris/fr/) |
| **Komoot** (événements communautaires) | Oui, sur tous les comptes | Non vérifié | Au moins une activité enregistrée ; **5 événements actifs max** ; visibles seulement à environ 50-100 km du départ | Non vérifié | **Pas d'API publique** (partenaires matériels uniquement) | Dans l'app : planifier un itinéraire, l'enregistrer, choisir l'option publique | [Événements communautaires](https://support.komoot.com/hc/en-us/articles/11223899139994-Community-events), [Événements outdoor](https://support.komoot.com/hc/en-us/articles/10805147410586-Use-komoot-for-outdoor-events), [API](https://support.komoot.com/hc/en-us/articles/10331570510618-komoot-API) |
| **Strava** (club Fitmates) | Oui (création de club et d'événements par les admins) | Non vérifié : les posts de club documentent des liens vers événements, itinéraires et activités Strava | Seuls propriétaires et admins du club créent des événements | Non vérifié | API des événements de club en lecture seule ; aucune méthode de création | Page du club : « Add Club Event » (web) / « Create an event » (app) | [Événements de club](https://support.strava.com/hc/en-us/articles/216918607-Group-Events-for-Clubs), [Posts de club](https://support.strava.com/hc/en-us/articles/18288273144973-Club-Posts), [Forum API](https://communityhub.strava.com/developers-api-7/get-club-events-and-posts-from-the-api-1984), [Changelog API](https://developers.strava.com/docs/changelog/) |
| **Nextdoor** | Oui : page entreprise gratuite, événements mis en avant à environ 10 miles (source US) | Non vérifié | Promotion commerciale interdite depuis un compte personnel : passer par une page entreprise vérifiée ; disponibilité en France non vérifiée | Non vérifié | Non vérifié | Page entreprise Nextdoor (à confirmer) | [Auto-promotion](https://help.nextdoor.com/s/article/Self-Promotion-using-your-Personal-Account?language=en_US), [Outils gratuits](https://about.nextdoor.com/press-releases/nextdoor-launches-new-suite-of-free-marketing-tools-to-support-small-business-growth-in-neighborhoods) |
| **Luma** | Oui pour les événements gratuits ; 5 % de frais sur billets payants (offre gratuite) ; Luma Plus 59-69 USD/mois | **Défavorable** : un événement qui envoie l'inscription hors Luma n'est pas éligible à la découverte | Voir colonne précédente | Non vérifié | API réservée à Luma Plus | https://luma.com/create (à confirmer) | [Luma Plus](https://help.luma.com/p/luma-plus), [Mise en avant](https://help.luma.com/p/featuring-your-event-on-luma), [API](https://help.luma.com/p/luma-api) |
| **Partiful** | Non vérifié | Des fiches « non hébergées par Partiful » renvoient vers un lien externe | Découverte (Discover) limitée à New York, San Francisco, Boston, Washington, Los Angeles | Non vérifié | Non vérifié | Non vérifié | [Soumettre à Discover](https://help.partiful.com/hc/en-us/articles/36268960429211-How-can-I-submit-an-event-to-Discover), [Explore](https://partiful.com/explore) |
| **OnVaSortir (OVS)** | **Non** : Premium obligatoire pour les membres inscrits depuis le 13/07/2019 | Non vérifié | Usage publicitaire ou commercial interdit aux comptes particuliers (même Premium) : « compte pro » requis ; sorties de particuliers sans but lucratif ni publicitaire | Non vérifié | Non vérifié | Non vérifié | [CGU Paris](https://paris.onvasortir.com/cgu.php), [CGV Paris](https://paris.onvasortir.com/cgv.php) |
| **L'Officiel des spectacles** | Oui (publication simple), options payantes | Non vérifié | Rubriques culturelles (théâtre, expositions, concerts, jeune public), envoi par mail 3 semaines avant, publication non garantie | Non vérifié | Non | https://www.offi.fr/proposer-un-evenement.html | [Proposer un événement](https://www.offi.fr/proposer-un-evenement.html) |
| **Paris je t'aime** (office de tourisme) | Non vérifié | Non vérifié | Pas de formulaire public trouvé ; mise en avant réservée au Club adhérents (professionnels du tourisme) | Agenda Club adhérents : plus de 1 000 visites/semaine (source officielle, agenda B2B) | Non vérifié | Non trouvé | [Agenda sport](https://agenda.parisjetaime.com/que-faire-a-paris/sport/), [Club adhérents](https://parisjetaime.com/professionnels/article/proposer-un-eductour-des-invitations-a1163) |
| **Visit Paris Region / offices de tourisme** | Non vérifié | Non vérifié | Les fiches passent par la base Apidae saisie par les offices de tourisme ; pas de soumission directe trouvée | Non vérifié | Non vérifié | Contacter l'office de tourisme local | [Offre de la destination](https://pro.visitparisregion.com/offre-loisirs-et-affaires/offre-de-la-destination) |
| **Sortir à Paris** | Non vérifié | Non vérifié | Lien « Communiquez sur votre évènement » sur le site ; conditions non trouvées | Non vérifié | Non vérifié | Non trouvé | [Infosbar (ancien)](https://www.sortiraparis.com/hotel-restaurant/bar-cafes/articles/33382-publiez-vos-evenements-sur-l-agenda-infosbar) |
| **HelloAsso** | Oui, mais **réservé aux associations** | Non vérifié | Fitmates n'est pas une association : non éligible | Non vérifié | Non vérifié | — | [Billetterie](https://info.helloasso.com/solutions/billetterie) |
| **Billetweb** | Oui pour les événements gratuits ; 0,29 € + 1 % par billet payé | Non vérifié | Outil de billetterie, pas d'audience de découverte documentée | Non vérifié | Non vérifié | Non vérifié | [Tarifs](https://www.billetweb.fr/fr-fr/tarifs/) |
| **Weezevent** | Oui pour les billets gratuits ; 2,5 % (min. 0,99 €) par billet payant | Non vérifié | Outil de billetterie, pas d'audience de découverte documentée | Non vérifié | Non vérifié | Non vérifié | [Billetterie gratuite](https://weezevent.com/fr/billetterie-gratuite/), [Tarifs](https://weezevent.com/fr/nos-tarifs/) |
| **Yurplan** | Oui pour les événements gratuits ; 0,39 € + 1 % HT par billet payant | Non vérifié | Outil de billetterie, pas d'audience de découverte documentée | Non vérifié | Non vérifié | Non vérifié | [Commissions](https://aide-organisateur.yurplan.com/article/101-commissions-yurplan), [Tarifs](https://yurplan.com/tarifs) |
| **Visorando** | Sans objet | — | Pas d'agenda de sorties : seulement publication de circuits (modérée), dossiers partagés et widget | Non vérifié | Widget d'intégration | — | [Publier un circuit](https://www.visorando.com/article-marche-a-suivre-pour-que-ma-randonnee-so.html), [Partage de dossiers](https://www.visorando.com/actus/nouveaute-partagez-vos-dossiers-de-rando.html) |
| **Decathlon Activités** | Non vérifié (commission non trouvée) | Non vérifié | Organisateurs : coachs indépendants, salariés ou entreprises (magasins Decathlon) ; Decathlon se présente comme intermédiaire | Non vérifié | Non vérifié | Non trouvé | [CGV](https://activites.decathlon.fr/pages/conditions-generales-vente) |
| **Spond** | Oui (app de gestion de club) | Non vérifié | Outil interne de groupe, pas de découverte publique documentée | Non vérifié | Non vérifié | — | [Spond](https://www.spond.com/news-and-blog/spond-best-free-club-app-your-sports/) |
| **Timeleft** | Sans objet | — | Événements organisés par Timeleft (dîners, apéros, runs) avec des groupes formés par l'algorithme ; aucune publication par des tiers trouvée | Non vérifié | — | — | [Fonctionnement](https://help.timeleft.com/hc/en-150/articles/21421681409436-How-Timeleft-Works) |
| **Bumble BFF** | Sans objet | — | Aucune fonction de création d'événement public par des tiers trouvée | Non vérifié | — | — | Non vérifié |
| **Kiwi** | Non identifié | — | Aucune plateforme d'événements sportifs de ce nom identifiée avec certitude | — | — | — | — |

## Classement des meilleures options pour Fitmates

1. **OpenAgenda** : gratuit, champ d'inscription qui accepte un lien vers la sortie, et seule API d'écriture gratuite
   trouvée. Un seul format pour alimenter plusieurs agendas de villes et de départements d'Île-de-France. À faire :
   repérer les agendas IDF qui acceptent les contributions de sport et de plein air.
2. **Que faire à Paris** : agenda officiel de la Ville, ouvert aux particuliers et aux associations, gratuit. La
   saisie est manuelle et modérée ; à réserver aux sorties qui partent de Paris ou des portes de Paris.
3. **AllEvents** : publication gratuite, lien externe explicitement prévu, audience revendiquée en France (chiffre de
   la plateforme). Saisie manuelle.
4. **Facebook Events (page Fitmates)** : gratuit, mène vers un lien externe, audience locale. Chaque événement
   demande l'accord de Driss (règle réseaux sociaux), et le coût doit être affiché quand la sortie est payante.
5. **Komoot, événements communautaires** : gratuit, public randonnée ciblé, visibilité locale autour du point de
   départ. Limites : 5 événements actifs, pas d'API, lien externe non vérifié.
6. **Eventbrite** : publication gratuite des événements gratuits et API de création (automatisable). Le lien externe
   ne peut aller que dans la description (non vérifié) ; l'inscription se fait sur Eventbrite, ce qui doublonne
   avec l'app. Ne convient pas aux sorties payantes Fitmates.
7. **Meetup (offre Starter)** : la plus forte audience randonnée et sorties à Paris, liens externes acceptés s'ils
   sont secondaires. Mais 2 événements par mois seulement et un seul essai gratuit à vie : à réserver aux sorties
   phares (par exemple une sortie découverte par mois).
8. **Club Strava Fitmates** : gratuit, utile pour les sorties course ou trail plus que pour la rando ; pas d'API
   de création.

## Plateformes à éviter

- **OnVaSortir** : accès Premium obligatoire, et la promotion commerciale est interdite depuis un compte particulier
  (un « compte pro » est exigé). Publier des sorties Fitmates y ferait courir un risque de suppression du compte.
- **Luma** : un événement qui renvoie l'inscription ailleurs n'est pas éligible à la découverte, ce qui supprime son
  intérêt ; l'API est payante.
- **Partiful** : la découverte ne fonctionne que dans 5 villes américaines.
- **HelloAsso** : réservé aux associations.
- **Billetweb, Weezevent, Yurplan** : ce sont des billetteries. Elles n'apportent pas d'audience de découverte
  documentée et feraient doublon avec l'inscription dans l'app.
- **L'Officiel des spectacles** : rubriques uniquement culturelles, publication non garantie.
- **Paris je t'aime, Visit Paris Region** : pas de formulaire public ; les fiches passent par les professionnels du
  tourisme ou par les offices de tourisme.
- **Timeleft, Bumble BFF, Spond, Visorando** : aucune publication d'événements par des tiers vers un public
  (Timeleft organise lui-même ; Spond est un outil interne de club ; Visorando ne publie que des circuits).
- **Decathlon Activités, Nextdoor, Sortir à Paris** : à mettre de côté tant que les conditions (commission,
  disponibilité en France, procédure) ne sont pas vérifiées sur le site.

## À revérifier en direct (réseau bloqué pendant ce relevé)

- Eventbrite : le lien externe est-il toléré dans la description d'un événement gratuit ?
- Facebook : emplacement du champ « lien de billetterie » sur un événement de Page.
- OpenAgenda : plafond de la version gratuite (illimité ou 365 événements par an) et liste des agendas IDF ouverts
  aux contributions.
- Komoot et Que faire à Paris : présence d'un champ de lien externe.
- Meetup : prix Standard en euros en France (visibles seulement une fois connecté).
