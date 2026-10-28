# Vérifie l'intelligibilité avec faster-whisper : transcription, score de ressemblance avec la phrase attendue,
# probabilité « français » de la détection de langue (indice d'accent étranger).
# Usage : python whisper_check.py lignes.json fichier_<ligne>_*.wav ...   (la ligne est lue dans le nom : x_<ligne>_<graine>.wav)
#         python whisper_check.py lignes.json voix.wav --complet
import difflib, json, re, sys, unicodedata
from faster_whisper import WhisperModel

def norm(s):
    s = unicodedata.normalize("NFD", s.lower()); s = "".join(c for c in s if unicodedata.category(c) != "Mn")
    return re.sub(r"[^a-z0-9 ]", " ", s.replace("-", " ").replace("'", " ")).split()

L = json.load(open(sys.argv[1])); fs = [f for f in sys.argv[2:] if not f.startswith("--")]
m = WhisperModel("large-v3", device="cpu", compute_type="int8")
for f in fs:
    seg, info = m.transcribe(f, beam_size=5, language=None, word_timestamps="--complet" in sys.argv)
    seg = list(seg); txt = " ".join(x.text.strip() for x in seg)
    if "--complet" in sys.argv:
        print(f"langue {info.language} p={info.language_probability:.2f}\n{txt}")
        for x in seg: print(f"  {x.start:6.2f}-{x.end:6.2f} {x.text.strip()}")
        for i, l in enumerate(L): print(i, round(difflib.SequenceMatcher(None, norm(l), norm(txt)).find_longest_match().size / len(norm(l)), 2), l)
        continue
    i = int(re.findall(r"_(\d+)_\d+\.wav$", f)[0])
    r = difflib.SequenceMatcher(None, norm(L[i]), norm(txt)).ratio()
    print(f"{f.split('/')[-1]}\t{info.language}:{info.language_probability:.2f}\tsim={r:.2f}\t{txt}", flush=True)
