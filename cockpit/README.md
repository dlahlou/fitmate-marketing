# Cockpit Fitmates

Application statique déployée sur Vercel (projet `fitmate-cockpit`, racine `cockpit/`), réservée aux membres de
l'équipe Vercel (Vercel Authentication).

- `index.html`, `style.css`, `app.js` : la page. `vendor/` : d3 inclus (aucun CDN).
- `data/*.json` : agrégats réécrits chaque jour par `python -m scripts.cockpit_export` depuis la racine du dépôt, puis
  commités : chaque push redéploie le cockpit. Aucune clé n'est stockée sur Vercel.
- Ajouter un indicateur : une fonction dans `scripts/cockpit_export.py` (entrée de `JOBS`), puis sa carte dans
  `index.html` et son rendu dans `app.js`.
