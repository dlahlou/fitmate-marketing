# Génère les 7 phrases de lignes.json avec Chatterbox Multilingual (Resemble AI, MIT), en français.
# Usage : python chatterbox_gen.py SORTIE [--ref voix_ref.wav] [--exag 0.5] [--cfg 0.5] [--temp 0.8] [--seeds 1,2,3] [--lignes 0,1]
# Écrit SORTIE/cb_<ligne>_<graine>.wav (24 kHz, silences de début et de fin coupés).
import argparse, json, os, re
import torch, torchaudio as ta
from chatterbox.mtl_tts import ChatterboxMultilingualTTS

# Orthographe « phonétique » donnée au modèle (le texte des sous-titres reste celui de lignes.json)
DIT = {"Fitmates": "Fitt-mèïtse", "Sucy-en-Brie": "Sucy-en-Brie", "L'appli": "L'appli"}

def dire(l):
    for a, b in DIT.items(): l = l.replace(a, b)
    return l.replace("…", ",")

def couper(w, sr, seuil=0.01, marge=0.05):
    e = w.abs().squeeze(0); i = (e > seuil).nonzero()
    if len(i) == 0: return w
    a = max(0, int(i[0]) - int(marge * sr)); b = min(len(e), int(i[-1]) + int(marge * sr))
    return w[:, a:b]

p = argparse.ArgumentParser(); p.add_argument("sortie"); p.add_argument("--ref"); p.add_argument("--exag", type=float, default=0.5)
p.add_argument("--cfg", type=float, default=0.5); p.add_argument("--temp", type=float, default=0.8)
p.add_argument("--seeds", default="1"); p.add_argument("--lignes"); p.add_argument("--textes")
a = p.parse_args(); os.makedirs(a.sortie, exist_ok=True)
L = json.load(open(a.textes or os.path.join(os.path.dirname(os.path.abspath(__file__)), "lignes.json")))
idx = [int(x) for x in a.lignes.split(",")] if a.lignes else range(len(L))
m = ChatterboxMultilingualTTS.from_pretrained(device="cpu")
for i in idx:
    for s in [int(x) for x in a.seeds.split(",")]:
        torch.manual_seed(s)
        w = m.generate(dire(L[i]), language_id="fr", audio_prompt_path=a.ref, exaggeration=a.exag, cfg_weight=a.cfg, temperature=a.temp)
        w = couper(w, m.sr); f = os.path.join(a.sortie, f"cb_{i}_{s}.wav"); ta.save(f, w, m.sr)
        print(i, s, round(w.shape[1] / m.sr, 2), f, flush=True)
