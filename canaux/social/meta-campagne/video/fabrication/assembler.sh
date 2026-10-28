#!/bin/bash
# Assemble le Reel « fourmi » : fond vidéo (fourmi + clips Mixkit) + images transparentes de reel.html (fr/) + voix.wav
# Usage : depuis un dossier de travail contenant fr/%04d.png, voix.wav et mk/<id>.mp4 (clips Mixkit 720p ou 1080p)
set -e
D=$(dirname "$0")
seg(){ echo "[$1:v]trim=start=$2:duration=$3,setpts=PTS-STARTPTS,crop=ih*9/16:ih:(iw-ih*9/16)*$4,scale=1080:1920,fps=30,setsar=1[$5]"; }
# Durées des segments = fins de scène de tl.json (s1 0–7.1, s2 7.1–11.9, s3 11.9–19.85, s4a 19.85–21.0, s4b 21.0–22.4, s5 22.4–fin)
F="[0:v]trim=0:7.1,setpts=PTS-STARTPTS,scale=1080:1920,setsar=1,fps=30,split[b0][b1];[b1]crop=960:200:60:1405,boxblur=22:3[bl];[b0][bl]overlay=60:1405[v0];\
$(seg 1 2.0 ${D1:-4.8} 0.62 v1);$(seg 2 0.0 ${D2:-7.95} 0.45 v2);$(seg 3 9.0 ${D3:-1.15} 0.3 v3);$(seg 4 4.0 ${D4:-1.4} 0.5 v4);$(seg 5 2.0 ${D5:-5.0} 0.5 v5);\
[v0][v1][v2][v3][v4][v5]concat=n=6:v=1:a=0[base];[base][6:v]overlay=0:0,format=yuv420p[v]"
ffmpeg -v error -y -i $D/fourmi-7s.mp4 -i mk/32045.mp4 -i mk/21435.mp4 -i mk/24999.mp4 -i mk/23567.mp4 -i mk/28342.mp4 \
  -framerate 30 -i fr/%04d.png -i voix.wav -filter_complex "$F" -map "[v]" -map 7:a \
  -c:v libx264 -crf 19 -preset slow -c:a aac -b:a 192k -t ${FIN:-27.4} -movflags +faststart ${OUT:-reel.mp4}
