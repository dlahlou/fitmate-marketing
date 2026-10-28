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

## Voix 2 : `sorties-semaine-reel-fourmi-voix2.mp4` (28,8 s)

Mêmes images que la version animée. Seule la voix change : Driss trouvait la voix Kokoro mécanique.
- **Modèle** : Chatterbox Multilingual de Resemble AI (https://huggingface.co/ResembleAI/chatterbox), **licence MIT**,
  `language_id="fr"`, CPU. Le modèle ajoute un filigrane audio inaudible (Perth).
- **Voix** : clonée sur 11 s de lecture d'un locuteur de Multilingual LibriSpeech, français, locuteur 9804
  (`facebook/multilingual_librispeech`, fichier `french/1_hours`, extrait `9804_9061_000344`).
  - Licence **CC BY 4.0**, usage commercial permis avec attribution ; enregistrements LibriVox du domaine public.
  - Extrait de référence : `fabrication/ref-voix-mls-9804.wav`.
  - Attribution à mettre si besoin : « Voix : Multilingual LibriSpeech (Pratap et al., 2020), CC BY 4.0 ».
- **Choix de la voix** : la voix par défaut de Chatterbox a été écartée, accent anglais (une phrase transcrite en anglais
  par Whisper). 6 voix MLS testées, 9804 retenue : les 7 phrases reconnues sur la majorité des tirages.
- **Prises retenues** : pour chaque phrase, le meilleur des 3 à 4 tirages d'après la transcription Whisper et la durée.
  - Réglages `exaggeration` 0,5 et `cfg_weight` 0,5, `temperature` 0,8 ;
  - phrase 5 (les villes) en `exaggeration` 0,65 ;
  - « Fitmates » écrit « Fitt-mèïtse » pour le modèle.
- **Débit** : `montage2.py` ramène les pauses internes de plus de 0,25 s à 0,2 s, pour que les deux premières phrases
  finissent avant la coupure de la fourmi (6,74 s).
- **Vérification Whisper** (faster-whisper large-v3) sur la piste finale :
  - langue détectée : français, probabilité 1,00 ;
  - les 7 phrases sont reconnues ; « Palaiso », « Yer » et « Sucy-en-Brie » sont transcrits comme ils se prononcent ;
  - aucune liaison parasite à « repars à » ;
  - non écouté par un humain : à écouter avant publication.

Refaire : `chatterbox_gen.py SORTIE --ref ref-voix-mls-9804.wav --seeds 2,3,4`, puis `whisper_check.py`, puis
`montage2.py choix.json SORTIE`. `montage2.py` écrit `tl.json` et `voix.wav`, et affiche D1…D5 et FIN. Ensuite
`frames.js` et `assembler.sh`, dont les valeurs par défaut sont celles de cette version.

## Voix 2 avec musique : `sorties-semaine-reel-fourmi-voix2-musique.mp4` (28,8 s)

Même vidéo que la voix 2, avec une musique de fond. La version sans musique reste disponible, si on préfère prendre un
morceau de la bibliothèque Instagram au moment de publier.
- **Morceau** : « Just Keep Walking », Michael Ramir C., indie pop. Fichier : https://assets.mixkit.co/music/963/963.mp3
- **Licence** : Mixkit Stock Music Free License, mentionnée dans la fiche du morceau. Mixkit indique qu'elle couvre
  l'usage commercial, les réseaux sociaux et la publicité en ligne, sans attribution. Ne pas déposer le morceau dans
  Content ID ni le revendre seul.
- **Mixage** (`fabrication/musique.sh`) :
  - musique à environ 10 dB sous la voix, abaissée automatiquement quand la voix parle ;
  - fondu d'entrée de 0,8 s, fondu de sortie de 2 s ;
  - ensemble à -15 LUFS intégrés (cible -14).
- **Vérification Whisper** : les 7 phrases sont reconnues. Whisper hésite entre « Poissy » et « Voici », avec ou sans
  musique : la consonne de « Poissy » est un peu douce. À écouter.
