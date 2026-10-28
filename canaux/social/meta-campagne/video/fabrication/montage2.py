# Montage de la voix Chatterbox : place les 7 phrases, écrit tl.json et voix.wav, affiche les durées D1…D5 et FIN
# à passer à assembler.sh. Les points de coupe des sous-titres viennent des horodatages de mots de faster-whisper.
# Usage (venv avec faster-whisper) : python montage2.py choix.json DOSSIER_SORTIE
#   choix.json : ["phrase0.wav", …, "phrase6.wav"] dans l'ordre de lignes.json
import json, os, subprocess, sys
import soundfile as sf
from faster_whisper import WhisperModel

ICI = os.path.dirname(os.path.abspath(__file__))
L = json.load(open(os.path.join(ICI, "lignes.json"))); W = json.load(open(sys.argv[1])); OUT = sys.argv[2]
D = [sf.info(f).duration for f in W]
wm = WhisperModel("large-v3", device="cpu", compute_type="int8")

def debut_mot(f, mot):
    "Instant où commence le mot `mot` dans le fichier f (début du segment de sous-titre suivant)."
    seg, _ = wm.transcribe(f, language="fr", word_timestamps=True, beam_size=5)
    for s in seg:
        for w in s.words:
            if w.word.strip().lower().startswith(mot): return w.start
    raise SystemExit(f"mot « {mot} » introuvable dans {f}")

c0 = debut_mot(W[0], "elle"); c4 = debut_mot(W[4], "il"); c5 = debut_mot(W[5], "repar")   # « Tu repars » : 2e moitié de la promesse

S = [0.3]; S.append(S[0] + D[0] + 0.25)
assert S[1] + D[1] <= 7.0, f"les deux premières phrases finissent à {S[1] + D[1]:.2f} s, après la coupure de la fourmi (7,1 s)"
S.append(7.25); f2 = S[2] + D[2] + 0.2                      # fin scène 2 (le canapé)
S.append(f2 + 0.1); S.append(S[3] + D[3] + 0.2); f3 = S[4] + D[4] + 0.15   # scène 3 : carte et villes
S.append(f3 + 0.1); p = [S[5] + 0.05, S[5] + c5 - 0.15]; f4 = S[5] + D[5] + 0.3   # scène 4 : la promesse
S.append(f4 + 0.15); FIN = round(S[6] + D[6] + 1.2, 2)
r = lambda x: round(x, 2)
e = lambda i: r(S[i] + D[i] + 0.15)
st = [[r(S[0]), r(S[0] + c0), "Quand une fourmi te mord,"], [r(S[0] + c0), e(0), "elle attrape ta peau avec ses pinces."],
      [r(S[1]), e(1), L[1]], [r(S[2]), e(2), L[2]], [r(S[3]), e(3), L[3]],
      [r(S[4]), r(S[4] + c4), "Poissy, Palaiseau, Yerres, Sucy-en-Brie…"], [r(S[4] + c4), e(4), "il y en a sûrement un près de chez toi."],
      [r(S[6]), e(6), L[6]]]                                 # pas de sous-titre sur « Tu viens seul… », déjà écrit à l'écran
tl = {"fin": FIN, "scenes": [["s1", 0, 7.1], ["s2", 7.1, r(f2)], ["s3", r(f2), r(f3)], ["s4", r(f3), r(f4)], ["s5", r(f4), FIN]],
      "st": st, "ev": {"points": [r(S[3] + 0.9 + 0.22 * i) for i in range(8)], "promesse": [r(x) for x in p]}}
os.makedirs(OUT, exist_ok=True)
json.dump(tl, open(os.path.join(ICI, "tl.json"), "w"), ensure_ascii=False)
inp, flt = [], []
for i, f in enumerate(W):
    ms = int(S[i] * 1000); inp += ["-i", f]; flt.append(f"[{i}]aresample=48000,adelay={ms}|{ms}[a{i}]")
subprocess.run(["ffmpeg", "-v", "error", "-y", *inp, "-filter_complex", ";".join(flt) + ";" + "".join(f"[a{i}]" for i in range(7))
                + f"amix=inputs=7:normalize=0,apad,atrim=0:{FIN},loudnorm=I=-14:TP=-1.5[o]", "-map", "[o]", "-ar", "48000",
                os.path.join(OUT, "voix.wav")], check=True)
print("débuts", [r(x) for x in S], "durées", [r(x) for x in D])
print(f"D1={r(f2 - 7.1)} D2={r(f3 - f2)} D3={r(p[1] - f3)} D4={r(f4 - p[1])} D5={r(FIN - f4)} FIN={FIN}")
