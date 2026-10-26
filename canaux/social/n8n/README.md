# Workflow n8n : diffusion des sorties

Fichier : `diffusion-sorties.json` (n8n → Workflows → Import from file). Contrat des événements : `dlahlou/fitmate-landing-page` : `docs/acces-donnees.md`, section 4.

## Ce qu'il fait

1. Reçoit `POST /webhook/fitmates-events` du backend et vérifie l'en-tête `X-Fitmates-Signature` (HMAC SHA-256 du corps brut). Un appel mal signé est rejeté.
2. Pour `event.published`, `event.updated` et `event.cancelled` : relance le build Vercel, puis attend 4 minutes que la page `/evenements/<slug>` soit en ligne.
3. Si `event.published` **et** `share_consent: true` **et** `square_image_url` est renseigné : publie en parallèle sur la Page Facebook (lien vers la page de la sortie), sur Instagram (image avec légende) et sur Threads (image, légende et lien).

## Variables d'environnement n8n

| Variable | Valeur |
|---|---|
| `FITMATES_WEBHOOK_SECRET` | secret partagé avec le backend pour la signature |
| `VERCEL_DEPLOY_HOOK_URL` | Vercel → projet → Settings → Git → Deploy Hooks (branche `main`) |
| `META_GRAPH_VERSION` | version de l'API Graph, ex. `v24.0` |
| `FB_PAGE_ID` | identifiant de la Page Facebook |
| `FB_PAGE_TOKEN` | jeton de Page longue durée (`pages_manage_posts`, `instagram_content_publish`) |
| `IG_USER_ID` | identifiant du compte Instagram professionnel relié à la Page |
| `THREADS_USER_ID`, `THREADS_TOKEN` | compte Threads et jeton (`threads_content_publish`) |

Prérequis n8n : `N8N_BLOCK_ENV_ACCESS_IN_NODE=false` (les nœuds lisent ces variables) et `NODE_FUNCTION_ALLOW_BUILTIN=crypto` (vérification de signature).

## Limites connues

- Pas de regroupement des builds : dix sorties publiées dans la même minute déclenchent dix builds Vercel. À ajouter si le volume le justifie.
- `event.almost_full`, `event.cancelled` (correction du post) et `event.completed` ne publient rien pour l'instant.
- Instagram n'accepte pas de lien cliquable dans la légende : la légende renvoie vers la bio.
