"""Fiches agenda (OpenAgenda, AllEvents) des prochaines sorties, depuis le flux public.

Usage : python -m scripts.fiches_agenda [--jours 10]
Écrit canaux/presence/fiches-agenda/<date>.md (à relire) et .csv (import). Rien n'est publié : la publication
attend les comptes de Driss et son accord (CLAUDE.md, réseaux et plateformes tierces).
"""
import argparse
import csv
import datetime as dt

from fitmates_mkt.config import ROOT
from fitmates_mkt.sources import backend

OUT = ROOT / "canaux" / "presence" / "fiches-agenda"
SPORTS = {"randonnee": "Randonnée", "course-a-pied": "Course à pied", "velo": "Vélo", "trail": "Trail", "padel": "Padel"}
NIVEAUX = {"debutant": "débutant", "intermediaire": "intermédiaire", "avance": "avancé", "tous": "tous niveaux"}
JOURS = ["lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi", "dimanche"]


IDF = ("75", "77", "78", "91", "92", "93", "94", "95")


def de(ville: str) -> str:
    return f"d’{ville}" if ville[:1].lower() in "aeiouyéèêîôh" else f"de {ville}"


def fiche(e: dict) -> dict:
    d = dt.datetime.fromisoformat(e["start_at"])
    loc = e.get("location") or {}
    ville = loc.get("city") or loc.get("name") or ""
    sport = SPORTS.get(e.get("sport", ""), (e.get("sport") or "Sortie").capitalize())
    niveau = NIVEAUX.get(e.get("level", ""), e.get("level") or "")
    prix = float(e.get("price_eur") or 0)
    lien = (f"https://www.fitmates.net/evenements/{e['slug']}"
            "?utm_source=openagenda&utm_medium=agenda&utm_campaign=sorties")
    quand = f"{JOURS[d.weekday()]} {d.day:02d}/{d.month:02d} à {d:%H}h{d:%M}"
    courte = f"{sport} en groupe au départ {de(ville)}, {quand}. Niveau {niveau}. Viens seul·e, tu repars à plusieurs."
    longue = (f"Envie de {sport.lower()} mais personne avec qui y aller ? Un groupe part {de(ville)} {quand}.\n\n"
              f"Niveau : {niveau}. " + ("Participation gratuite. " if prix == 0 else f"Participation : {prix:g} € (fixée par l'organisateur). ") +
              "Le point de rendez-vous et le détail sont sur la page de la sortie ; tu peux dire bonjour au groupe "
              "dans le chat avant de venir.\n\nInscription gratuite sur Fitmates, l'app pour faire du sport à plusieurs : " + lien)
    return {"titre": e["title"], "debut": e["start_at"], "ville": ville, "code_postal": loc.get("postal_code", ""),
            "lieu": loc.get("name", ""), "description_courte": courte[:200], "description_longue": longue,
            "conditions": "Gratuit" if prix == 0 else f"{prix:g} €", "inscription": lien, "image": e.get("image_url", ""),
            "mots_cles": f"{sport.lower()}, sortie en groupe, {ville}, Île-de-France"}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--jours", type=int, default=10)
    a = ap.parse_args()
    now = dt.datetime.now(dt.timezone.utc)
    evts = [e for e in backend.public_events()
            if now <= dt.datetime.fromisoformat(e["start_at"]) <= now + dt.timedelta(days=a.jours)]
    # Agendas d'Île-de-France : on écarte les sorties hors région (et celles au code postal erroné, à corriger côté app)
    evts = [e for e in evts if str((e.get("location") or {}).get("postal_code", ""))[:2] in IDF]
    fiches = [fiche(e) for e in sorted(evts, key=lambda e: e["start_at"])]
    OUT.mkdir(parents=True, exist_ok=True)
    jour = now.date().isoformat()
    with open(OUT / f"{jour}.csv", "w", newline="") as f:
        w = csv.DictWriter(f, fieldnames=list(fiches[0]) if fiches else ["titre"])
        w.writeheader(); w.writerows(fiches)
    md = [f"# Fiches agenda du {jour} ({len(fiches)} sorties, non publiées)\n"]
    for x in fiches:
        md += [f"## {x['titre']}", f"- Début : {x['debut']} · {x['lieu']} ({x['code_postal']}) · {x['conditions']}",
               f"- Courte : {x['description_courte']}", f"- Inscription : {x['inscription']}", "", x["description_longue"], ""]
    (OUT / f"{jour}.md").write_text("\n".join(md))
    print(f"{len(fiches)} fiches → {OUT}/{jour}.md")


if __name__ == "__main__":
    main()
