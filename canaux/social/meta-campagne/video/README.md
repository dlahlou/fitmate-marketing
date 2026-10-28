# Reel « Tes potes annulent » : sorties du week-end (30 oct. – 1er nov.)

Format 1080×1920, 24,5 s, voix off française (Kokoro 82M, voix `ff_siwis`, licence Apache 2.0, générée en local),
sous-titres incrustés. Structure inspirée de l'accroche « ce n'est pas X qui fait mal » : la situation (les potes qui
annulent), le vrai problème (le week-end seul), la preuve (8 groupes autour de Paris, positions réelles), la promesse,
l'app en dernier.

Fabrication (dans `fabrication/`) : `kokoro_gen.py` génère les phrases de `lignes.json` (prononciations corrigées :
Fitmates, Sucy-en-Brie, liaisons), `montage.py` place les voix et écrit `tl.json`, `frames.js` rend `reel.html` image par
image avec Playwright, puis ffmpeg assemble. Modèle : https://github.com/thewh1teagle/kokoro-onnx (fichiers v1.0).

Pas de musique : en ajouter une depuis la bibliothèque d'Instagram ou de Meta au moment de publier (droits inclus).
Non publié : accord de Driss requis (CLAUDE.md).

## Version « fourmi » : `sorties-semaine-reel-fourmi.mp4` (27,4 s)

Demandée par Driss le 28/10 : mêmes 7 premières secondes que la vidéo de référence qu'il a fournie (la fourmi qui mord,
sous-titres anglais d'origine floutés), voix off française, puis bascule « Ce qui fait vraiment mal, c'est de passer
encore un week-end seul sur ton canapé » et la suite du Reel. Attention : le plan de la fourmi vient d'une vidéo
tierce ; à vérifier avant de l'utiliser en publicité payante (droits).

## Version « fourmi » animée : `sorties-semaine-reel-fourmi-video.mp4`

Même montage, avec des plans vidéo à la place des fonds unis. Clips Mixkit (licence gratuite Mixkit : usage commercial
autorisé, sans attribution ; pas de revente du clip seul), recadrés en 9:16 depuis du 720p ou 1080p :
- canapé : https://mixkit.co/free-stock-video/young-woman-watching-her-phone-in-the-couch-32045/
- carte des sorties : https://mixkit.co/free-stock-video/friends-walking-through-the-woods-21435/
- « Tu viens seul·e » : https://mixkit.co/free-stock-video/young-hiker-woman-walking-through-the-forest-24999/
- « Tu repars à plusieurs » : https://mixkit.co/free-stock-video/a-group-of-friends-hugging-and-walking-on-a-path-23567/
- fin : https://mixkit.co/free-stock-video/slow-aerial-tour-through-a-mist-covered-forest-28342/
