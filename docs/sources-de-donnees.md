# Sources de données

État vérifiable à tout moment : `python -m scripts.check_access`.

| Source | Module | Sert à | Variables | État (2026-10-26) |
|---|---|---|---|---|
| Backend : flux public des sorties | `sources/backend.py` | sorties par sport et zone, offre disponible | `EVENTS_FEED_URL` (défaut fourni), `EVENTS_FEED_TOKEN` (optionnel) | OK |
| Backend : agrégats marketing | `sources/backend.py` | inscriptions, actifs, sorties, participations, par source d'acquisition | `BACKEND_METRICS_URL`, `BACKEND_METRICS_TOKEN` | à créer côté backend (§ 1) |
| Backend : SQL lecture seule | `sources/backend.py` | analyses ad hoc | `BACKEND_PG_READONLY_URL` | à créer (§ 2) |
| Google Play : fiche, avis, qualité | `sources/google_play.py` | ASO Android | `GOOGLE_SERVICE_ACCOUNT_B64` (ou `PLAY_SERVICE_ACCOUNT_B64`) | OK |
| Google Play : statistiques de fiche | `sources/google_play.py` | visiteurs, installations, source de trafic | `PLAY_REPORTS_BUCKET` | URI à fournir (§ 3) |
| App Store Connect : fiche, avis | `sources/app_store.py` | ASO iOS | `ASC_ISSUER_ID`, `ASC_KEY_ID`, `ASC_PRIVATE_KEY_B64` | OK |
| App Store : App Analytics | `sources/app_store.py` | impressions, pages vues, téléchargements, recherche vs navigation | clé au rôle **Admin** | refusé avec la clé App Manager (§ 4) |
| Search Console | `sources/google_web.py` | requêtes Google, positions, clics du site | `GSC_SITE` (défaut `sc-domain:fitmates.net`) | API à activer + accès (§ 5) |
| GA4 | `sources/google_web.py` | trafic par canal, conversions | `GA4_PROPERTY_ID` (facultatif, détecté) | API activée ; accès Lecteur à donner (§ 5) |
| Positions dans les stores | `sources/store_search.py` | rang de Fitmates sur les requêtes cibles | aucune | hôtes `itunes.apple.com`, `play.google.com` à autoriser |
| Meta (Facebook, Instagram, Threads) | `sources/social.py` | abonnés, portée, clics | `FB_PAGE_ID`, `FB_PAGE_TOKEN`, `IG_USER_ID`, `THREADS_USER_ID`, `THREADS_TOKEN` | à fournir (§ 6) |
| Volumes de recherche | MCP Ubersuggest (session Claude) | volumes Google par requête | aucune | OK |
| Google Trends, autocomplétion | `scripts/google_trends.py`, `scripts/validate_keywords.py` | saisonnalité, preuve d'usage | aucune | hôtes Google Trends à autoriser |

## 1. Endpoint d'agrégats marketing (backend Spring Boot)

Proposition de contrat, à implémenter côté backend :

```
GET /api/v1/marketing/metrics?from=2026-10-01&to=2026-10-28&granularity=day
Authorization: Bearer <BACKEND_METRICS_TOKEN>   (jeton dédié, lecture seule)
```

Réponse : uniquement des **comptes** (aucun identifiant, nom, e-mail ni texte libre) :

```json
{
  "generated_at": "2026-10-28T06:00:00Z",
  "series": [
    {"date": "2026-10-01", "signups": 12, "signups_by_platform": {"ios": 5, "android": 4, "web": 3},
     "signups_by_source": {"organic_store": 6, "site": 4, "referral": 2},
     "active_users": 140, "events_created": 9, "events_by_sport": {"randonnee": 7, "running": 2},
     "events_by_zone": {"77": 4, "75": 3, "78": 2}, "participations": 63, "paid_events": 1}
  ],
  "totals": {"users": 1834, "organizers": 41}
}
```

`signups_by_source` suppose que l'app enregistre la source d'installation (referrer Play, attribution Apple Ads,
UTM du site) : à ajouter côté app si ce n'est pas encore le cas.

## 2. Accès SQL en lecture seule

Un rôle Postgres dédié, idéalement sur un réplica :

```sql
CREATE ROLE marketing_ro LOGIN PASSWORD '…';
GRANT CONNECT ON DATABASE fitmates TO marketing_ro;
GRANT USAGE ON SCHEMA public TO marketing_ro;
GRANT SELECT ON <tables utiles, ou des vues agrégées> TO marketing_ro;
ALTER ROLE marketing_ro SET default_transaction_read_only = on;
```

Préférer des **vues agrégées** aux tables brutes, pour ne jamais exposer de données personnelles.
La chaîne de connexion va dans `BACKEND_PG_READONLY_URL` (secret), jamais dans le dépôt. `pip install "psycopg[binary]"`.

## 3. Google Play : statistiques de fiche

Play Console → **Télécharger des rapports → Statistiques** → « Copier l'URI Cloud Storage » (`gs://pubsite_prod_rev_…`).
Ce n'est pas un secret : le mettre dans `PLAY_REPORTS_BUCKET`. Le compte de service `claude-aso@fitmate-9bdfa` doit avoir
« View app information and download bulk reports » : https://play.google.com/console/users-and-permissions

## 4. App Store : App Analytics

L'API Analytics Reports refuse les clés App Manager. Créer une clé au rôle **Admin** :
https://appstoreconnect.apple.com/access/integrations/api, puis remplacer `ASC_KEY_ID` et `ASC_PRIVATE_KEY_B64`.
Au premier passage, `scripts.snapshot` crée la demande de rapports ONGOING ; Apple produit les rapports sous 1 à 2 jours.

## 5. Search Console et GA4

Même compte de service (`claude-aso@fitmate-9bdfa.iam.gserviceaccount.com`) :
- Activer **Google Search Console API** et **Google Analytics Data API** dans fitmate-9bdfa :
  https://console.cloud.google.com/apis/library/searchconsole.googleapis.com?project=fitmate-9bdfa et
  https://console.cloud.google.com/apis/library/analyticsdata.googleapis.com?project=fitmate-9bdfa
- Search Console → Paramètres → Utilisateurs et autorisations → ajouter l'e-mail du compte de service (accès restreint) :
  https://search.google.com/search-console/users
- GA4 → Admin → Gestion des accès à la propriété → ajouter l’e-mail en **Lecteur** (propriété du flux G-M9H3VR0TF7) ; l’ID de propriété est détecté automatiquement.

## 6. Meta

Jeton de Page longue durée (Business Manager → utilisateur système de préférence) avec `pages_read_engagement`,
`instagram_manage_insights` ; jeton Threads avec `threads_manage_insights`. Les mêmes comptes servent à la publication
par n8n (`canaux/social/n8n/README.md`).
