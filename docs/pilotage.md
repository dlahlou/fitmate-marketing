# Pilotage autonome du marketing

Claude n'attend pas Driss : une tâche planifiée le relance plusieurs fois par jour, et chaque passage fait avancer la
liste de tâches. Driss intervient seulement pour ce qui lui revient (actions « Toi » du cockpit, avec leurs étapes).

## À chaque passage

1. `git pull origin main` dans `fitmate-marketing` (et dans `fitmate-landing-page` s'il est cloné ; sinon le cloner).
2. Relire `docs/passation.md` et `CLAUDE.md` si la session a été recompactée.
3. Lire les actions marquées faites (`/api/etat` via l'outil Vercel `web_fetch_vercel_url`) et lancer
   `python -m scripts.verifier <fichier>`.
   Les actions marquées « pas pertinent » passent à « écarté » et leur raison s'ajoute à `cockpit/decisions.json`.
   **Relire ce fichier** : c'est la voix de Driss sur la stratégie. Adapter le plan en conséquence (ne pas recréer
   d'action semblable, retirer un canal ou un format refusé, le noter dans `strategie/` et `cockpit/strategie.json`
   si la décision change un canal), et le dire en une ligne dans le compte rendu du passage.
4. Choisir dans `cockpit/todo.json` la tâche `qui: "Claude"` non bloquée de plus haute priorité (1 avant 2 avant 3 ;
   à priorité égale, la plus ancienne). Passer son `statut` à « en cours ».
5. La mener au bout dans ce passage : relevé avant si c'est un changement mesurable, travail (sous-agents sur une
   branche pour les gros morceaux), vérification (build, tests, relecture du diff, page en ligne), push sur main.
6. Clore : `statut: "fait"`, une ligne dans `cockpit/actions.json` (date, canal, quoi, chiffre de référence),
   `docs/passation.md` si l'état d'un canal change.
7. Alimenter la liste : ajouter les tâches découvertes en route ; s'il reste moins de 5 tâches Claude non bloquées,
   en créer de nouvelles à partir de `strategie/` (calendrier éditorial, KPIs en retard sur leur cible, canaux en pause).
   Une tâche qui demande Driss devient une action « Toi » avec `etapes` et `duree`.
8. `python -m scripts.cockpit_export`, commit, push. Fin du passage : une ligne de compte rendu.

## Garde-fous (ne jamais les franchir sans l'accord explicite de Driss)

- Stores : aucune modification de fiche ; jamais le nom, le sous-titre, l'icône, la catégorie.
- Pas de dépense (publicité, abonnement), pas de nouveau compte à son nom, pas de message envoyé à un tiers.
- Réseaux sociaux : publier seulement ce qui suit un format déjà validé (lot de lancement, sorties de la semaine) ;
  un nouveau format de post se fait valider (action « Toi »).
- Aucune donnée personnelle dans le dépôt ni dans les contenus publics ; aucun secret affiché.
- Une tâche qui échoue deux passages de suite passe en « bloqué : <raison> » avec, si besoin, une action « Toi ».
