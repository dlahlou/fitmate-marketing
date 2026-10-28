#!/bin/bash
# Ajoute la musique de fond sous la voix d'un Reel déjà assemblé (vidéo copiée telle quelle, seul l'audio change).
# Musique : « Just Keep Walking », Michael Ramir C., Mixkit (Mixkit Stock Music Free License) :
#   https://assets.mixkit.co/music/963/963.mp3
# Usage : musique.sh reel.mp4 963.mp3 sortie.mp4   (VOL : niveau de la musique en LUFS avant compression, défaut -24)
set -e
IN=$1; MUS=$2; OUT=$3
FIN=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$IN")
# Musique : niveau fixé, fondu d'entrée 0,8 s et de sortie 2 s ; abaissée automatiquement quand la voix parle (sidechain).
ffmpeg -v error -y -i "$IN" -i "$MUS" -filter_complex "\
[0:a]aresample=48000,asplit=2[v][sc];\
[1:a]aresample=48000,atrim=0:$FIN,loudnorm=I=${VOL:--24}:TP=-3,aresample=48000,afade=t=in:d=0.8,afade=t=out:st=$(echo "$FIN-2" | bc):d=2[m];\
[m][sc]sidechaincompress=threshold=0.05:ratio=3:attack=20:release=400[md];\
[v][md]amix=inputs=2:normalize=0,loudnorm=I=-14:TP=-1.5,aresample=48000[a]" \
  -map 0:v -map "[a]" -c:v copy -c:a aac -b:a 192k -t "$FIN" -movflags +faststart "$OUT"
