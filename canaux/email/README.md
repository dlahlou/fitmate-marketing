# E-mails automatiques

Envoi : Resend, expéditeur `Fitmates <contact@fitmates.net>` (après vérification du domaine fitmates.net dans Resend :
action de Driss dans le cockpit). Les formulaires du site (`api/` du dépôt `fitmate-landing-page`) enregistrent les leads
dans Vercel Blob `fitmates-leads` et préviennent `NOTIFY_EMAIL` ; ces modèles s'ajoutent à cet envoi.

Variables disponibles dans un lead de liste d'attente : `sport` (slug), `area` (secteur), `email`. Aucune autre donnée.
Libellés lisibles : `randonnee` → « randonnée », `course-a-pied` → « course à pied », `padel` → « padel »… et le secteur
tel qu'affiché sur la page d'où vient l'inscription.

| Fichier | Quand | Pour qui |
|---|---|---|
| `liste-attente-confirmation.md` | à l'inscription | inscrit en liste d'attente (hors rando Île-de-France) |
| `liste-attente-ouverture.md` | quand la zone ouvre (3 organisateurs, 30 participants) | tous les inscrits du sport × secteur |
| `organisateur-bienvenue.md` | formulaire organisateur | lead organisateur |

Règles : pas de chiffre inventé, jamais « toutes les sorties sont gratuites », lien de désinscription en pied de chaque
message (obligatoire), UTM `utm_source=email&utm_medium=email&utm_campaign=<fichier>`.
