import json,soundfile as sf
from kokoro_onnx import Kokoro
from kokoro_onnx.tokenizer import Tokenizer
k=Kokoro("models/kokoro-v1.0.onnx","models/voices-v1.0.bin"); t=Tokenizer()
fix={"fitmˈat":"fˈitmɛjts","(en)sˈʌsi(fr)ɑ̃bʁˈi":"sysˈi ɑ̃ bʁˈi","(en)wˈiːkˈɛnd(fr)":"wikˈɛnd","pˈotz":"pˈɔt","yˈi ɡʁˈup":"ɥˈi ɡʁˈup","ʁəpˈaʁz a":"ʁəpˈaʁ a","mɛz ɑ̃":"mɛ ɑ̃"}
for i,l in enumerate(json.load(open("lignes.json"))):
    p=t.phonemize(l,"fr-fr")
    for a,b in fix.items(): p=p.replace(a,b)
    print(i,p)
    a,sr=k.create(p,voice="ff_siwis",speed=1.05,is_phonemes=True); sf.write(f"ko_{i}.wav",a,sr); print(round(len(a)/sr,2))
