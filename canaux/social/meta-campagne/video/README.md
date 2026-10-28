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
