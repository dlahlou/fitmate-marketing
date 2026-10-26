# Règles du dépôt marketing Fitmates

Répondre à Driss (propriétaire) en français, court, avec les liens cliquables vers les consoles quand une action lui revient.

## Produit et messages
- Fitmates : application pour faire du sport à plusieurs (sorties, chat de groupe par sortie, suivre ses partenaires,
  création d'une sortie en une phrase par IA). iOS, Android, web (app.fitmates.net). Site : https://www.fitmates.net.
- Fitmates est mondial : ne jamais écrire « application française ».
- Communauté la plus active aujourd'hui : randonnée en Île-de-France. Hors rando Île-de-France, le site est en mode liste d'attente.
- L'app est gratuite, mais certaines sorties sont payantes si l'organisateur le décide : ne jamais écrire que toutes les sorties sont gratuites.
- Aucune donnée personnelle dans les textes publics ni dans `data/` (ni nom d'organisateur, ni de membre, ni pseudo d'avis).
- Stratégie 100 % digitale, focus organique ; ignorer Bing.

## Stores
- Android : `com.dlahlou.fitmate`, projet Google Cloud / Firebase de production `fitmate-9bdfa`.
- iOS : App Store id `6756283890`. **6759652749 est l'app de staging : ne jamais y toucher.**
- Aucune modification sur les stores sans l'accord explicite de Driss. Apple : nom, sous-titre et mots-clés ne changent
  qu'avec une nouvelle version ; le texte promotionnel change à tout moment.
- Limites : Apple nom 30, sous-titre 30, mots-clés 100, promo 170 ; Google titre 30, courte 80, description 4000.
  `scripts/aso_listings.py` les vérifie.

## Secrets
- Ne jamais demander de clé, jeton ou mot de passe dans le chat ; ne jamais afficher un secret dans une sortie de commande.
- Les secrets viennent des variables d'environnement (liste : `.env.example`). Décoder une clé uniquement dans un
  dossier temporaire hors dépôt, jamais dans le dépôt. `.env` est ignoré par git.

## Mesure
- Relevé avant chaque changement, comparaison 3 à 4 semaines après. Journal des changements par canal.
- Si une source échoue, dire précisément ce qui manque et comment le corriger (avec le lien), sans inventer de chiffres.
