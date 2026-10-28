import json,subprocess
L=json.load(open("lignes.json")); D=[2.15,1.81,3.54,3.46,3.9,2.03,3.65]
starts=[0.4,2.8,5.1,9.05,12.7,17.1,19.6]; FIN=24.5
assert all(starts[i]+D[i]<starts[i+1]-0.1 for i in range(6))
st=[[starts[i],starts[i]+D[i]+0.15,L[i]] for i in range(7)]
s4=st[4]; st[4:5]=[[s4[0],14.6,"Poissy, Palaiseau, Yerres, Sucy-en-Brie…"],[14.6,s4[1],"il y en a sûrement un près de chez toi."]]
tl={"fin":FIN,"scenes":[["s1",0,5.0],["s2",5.0,8.9],["s3",8.9,16.9],["s4",16.9,19.4],["s5",19.4,FIN]],"st":st,
    "ev":{"bulles":[0.05,0.6,1.3,2.0],"points":[10.0+0.22*i for i in range(8)],"promesse":[17.1,18.1]}}
json.dump(tl,open("tl.json","w"),ensure_ascii=False)
inp=[];flt=[]
for i in range(7):
    inp+=["-i",f"ko_{i}.wav"]; flt.append(f"[{i}]adelay={int(starts[i]*1000)}|{int(starts[i]*1000)}[a{i}]")
subprocess.run(["ffmpeg","-v","error","-y",*inp,"-filter_complex",";".join(flt)+";"+"".join(f"[a{i}]" for i in range(7))+f"amix=inputs=7:normalize=0,apad,atrim=0:{FIN},loudnorm=I=-14:TP=-1.5[o]","-map","[o]","-ar","48000","voix.wav"],check=True)
