# Fitmates – marketing digital

Tout le marketing digital de Fitmates au même endroit : stratégie, canaux (SEO Google, ASO App Store et Google Play,
réseaux sociaux, publicité) et **mesure**, avec des connecteurs vers le backend Fitmates et vers les sources externes.

Le site [fitmates.net](https://www.fitmates.net) est un canal parmi d'autres : son code reste dans
`dlahlou/fitmate-landing-page`. L'app est dans `dlahlou/fitmate`.

## Organisation

| Dossier | Contenu |
|---|---|
| `strategie/` | stratégie marketing 2026, playbook digital |
| `canaux/seo/` | SEO Google : mots-clés, Google Trends, suivi Search Console |
| `canaux/aso/` | fiches App Store et Google Play (`fiches/*.json` = source de vérité), journal des changements |
| `canaux/social/` | réseaux sociaux : diffusion automatique des sorties (n8n), mesure |
| `canaux/ads/` | Google Ads, Apple Search Ads |
| `fitmates_mkt/` | connecteurs de données (Python) : backend, Google Play, App Store Connect, Search Console, GA4, Meta, recherche stores |
| `scripts/` | commandes : vérification des accès, relevés, fiches stores, mots-clés |
| `data/snapshots/` | relevés datés (agrégats, aucune donnée personnelle) pour comparer avant / après |
| `docs/sources-de-donnees.md` | chaque source : à quoi elle sert, variable, comment ouvrir l'accès |

## Démarrage

```bash
pip install -r requirements.txt
cp .env.example .env            # ou variables d'environnement de la session / des secrets GitHub
python -m scripts.check_access  # état de chaque source, sans afficher de secret
python -m scripts.snapshot      # relevé daté → data/snapshots/<date>.json
python -m scripts.aso_listings  # écart entre les fiches en ligne et canaux/aso/fiches (lecture seule)
```

## Boucle d'amélioration continue

1. Relevé de référence (`scripts.snapshot`) **avant** chaque changement.
2. Changement, consigné dans le journal du canal (ex. `canaux/aso/journal.md`).
3. Nouveau relevé 3 à 4 semaines après, comparaison, décision.
4. Bilan mensuel automatique (`.github/workflows/bilan-mensuel.yml`).

Règles permanentes : voir `CLAUDE.md`.
