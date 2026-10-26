# E-mails automatiques

Décision de Driss (26/10) : pas de domaine vérifié dans Resend, qui ne sert qu'aux notifications envoyées à Driss.
Conséquences : pas d'e-mail de confirmation automatique (le site affiche déjà la confirmation, le rang et le lien de
parrainage après l'inscription) ; l'e-mail d'ouverture d'un secteur est préparé par Claude en **brouillons Gmail**
(un par inscrit, adresses lues dans le Blob des leads, jamais écrites dans le dépôt) et envoyé par Driss. Les formulaires du site (`api/` du dépôt `fitmate-landing-page`) enregistrent les leads
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
