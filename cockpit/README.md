# Cockpit Fitmates

Application statique déployée sur Vercel (projet `fitmate-cockpit`, racine `cockpit/`), réservée aux membres de
l'équipe Vercel (Vercel Authentication).

- `index.html`, `style.css`, `app.js` : la page. Écran unique sans défilement : « À faire » (actions priorisées, qui s'en charge) et une carte par canal ; le détail s'ouvre au clic dans un panneau (lien direct : `#google`, `#site`, `#leads`, `#stores`, `#app`, `#social`, `#actions`).
- `todo.json` : la liste d'actions tenue à la main (qui, canal, priorité 1 à 3, lien, statut ; passer `statut` à `fait` pour la retirer). Les accès de données manquants y sont ajoutés automatiquement par l'export. `vendor/` : d3 inclus (aucun CDN).
- `data/*.json` : agrégats réécrits chaque jour par `python -m scripts.cockpit_export` depuis la racine du dépôt, puis
  commités : chaque push redéploie le cockpit. Aucune clé n'est stockée sur Vercel.
- Ajouter un indicateur : une fonction dans `scripts/cockpit_export.py` (entrée de `JOBS`), puis sa carte dans
  `index.html` et son rendu dans `app.js`.
