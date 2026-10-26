"""Post Instagram « Sorties de la semaine » : visuel 1080x1350 + légende, à partir du flux public des sorties.

    python -m scripts.social_weekly --dry-run                    # dossier temporaire créé et affiché
    python -m scripts.social_weekly --dry-run --out /tmp/semaine # dossier choisi
    python -m scripts.social_weekly --dry-run --depuis 2026-11-02 --feed sorties.json

Ce script NE PUBLIE RIEN : il écrit semaine.png, legende.txt et semaine.json dans le dossier de sortie, à relire
puis à publier à la main (ou plus tard par n8n après accord). Il garde les sorties qui commencent dans les 7 jours
suivant le point de départ (maintenant, ou --depuis à minuit, heure de Paris), et en affiche 5 au plus.

Données : seulement titre, sport, date, ville, niveau, prix et slug. Jamais image_url (photos d'organisateurs),
jamais de nom d'organisateur ni de participant. Pas de mention « gratuite » : le prix n'apparaît que s'il est > 0.
"""
import argparse
import json
import re
import subprocess
import sys
import tempfile
from datetime import datetime, timedelta
from pathlib import Path
from urllib.parse import quote, urlencode
from zoneinfo import ZoneInfo

from fitmates_mkt.config import ROOT
from fitmates_mkt.sources import backend

PARIS = ZoneInfo("Europe/Paris")
RENDER = ROOT / "canaux" / "social" / "visuels" / "render.js"
SITE = "https://www.fitmates.net"
MAX_VISUEL = 5

JOURS = ["lun.", "mar.", "mer.", "jeu.", "ven.", "sam.", "dim."]
JOURS_LONGS = ["lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi", "dimanche"]
MOIS = ["janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."]
MOIS_LONGS = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre",
              "novembre", "décembre"]
MOIS_UTM = ["jan", "fev", "mar", "avr", "mai", "jun", "jul", "aou", "sep", "oct", "nov", "dec"]

# Valeurs du flux → libellé affiché et classe de couleur (l1 vert, l2 orange, l3 rouge)
NIVEAUX = {
    "debutant": ("Débutant", "l1"), "facile": ("Débutant", "l1"), "tous_niveaux": ("Tous niveaux", "l1"),
    "intermediaire": ("Intermédiaire", "l2"), "moyen": ("Intermédiaire", "l2"),
    "avance": ("Avancé", "l3"), "difficile": ("Avancé", "l3"), "expert": ("Avancé", "l3"),
}
SPORTS = {"randonnee": "Randonnée", "course": "Course à pied", "running": "Course à pied", "velo": "Vélo",
          "trail": "Trail", "padel": "Padel", "escalade": "Escalade", "natation": "Natation", "yoga": "Yoga"}
HASHTAGS = ["#Fitmates", "#StrongerTogether", "#sortiesdelasemaine", "#sportentreamis"]
HASHTAGS_SPORT = {"randonnee": ["#randonnee", "#randoIDF"], "course": ["#running", "#courseapied"],
                  "running": ["#running", "#courseapied"], "velo": ["#velo"], "trail": ["#trail"]}


def _num(d: datetime) -> str:
    return "1er" if d.day == 1 else str(d.day)


def _heure(d: datetime) -> str:
    return f"{d.hour}h{d.minute:02d}"


def _prix(p) -> str:
    try:
        v = float(p or 0)
    except (TypeError, ValueError):
        return ""
    if v <= 0:
        return ""
    return (f"{v:.0f}" if v.is_integer() else f"{v:.2f}".replace(".", ",")) + " €"


def _propre(s) -> str:
    return re.sub(r"\s+", " ", str(s or "")).strip()


def utm(url: str, campagne: str, contenu: str) -> str:
    q = urlencode({"utm_source": "instagram", "utm_medium": "organic", "utm_campaign": campagne, "utm_content": contenu})
    return f"{url}?{q}"


def selection(events: list[dict], debut: datetime) -> list[dict]:
    fin = debut + timedelta(days=7)
    out = []
    for e in events:
        try:
            d = datetime.fromisoformat(str(e["start_at"]).replace("Z", "+00:00")).astimezone(PARIS)
        except (KeyError, ValueError):
            continue
        if debut <= d < fin and e.get("slug") and e.get("title"):
            loc = e.get("location") or {}
            niveau, cls = NIVEAUX.get(str(e.get("level") or "").lower(), ("", ""))
            # Liste blanche : rien d'autre ne sort du flux (pas d'image_url, pas de nom)
            out.append({
                "date": d, "titre": _propre(e["title"]), "slug": str(e["slug"]),
                "sport_id": str(e.get("sport") or ""),
                "sport": SPORTS.get(str(e.get("sport") or ""), _propre(e.get("sport")).capitalize()),
                "ville": _propre(loc.get("city") or loc.get("name")), "cp": _propre(loc.get("postal_code")),
                "niveau": niveau, "niveau_cls": cls, "prix": _prix(e.get("price_eur")),
            })
    return sorted(out, key=lambda s: s["date"])


def periode(debut: datetime) -> str:
    fin = debut + timedelta(days=6)
    a = f"{JOURS_LONGS[debut.weekday()]} {_num(debut)}"
    if debut.month != fin.month:
        a += f" {MOIS_LONGS[debut.month - 1]}"
    return f"du {a} au {JOURS_LONGS[fin.weekday()]} {_num(fin)} {MOIS_LONGS[fin.month - 1]}"


def donnees_visuel(sorties: list[dict], debut: datetime) -> dict:
    return {
        "periode": periode(debut),
        "sorties": [{"jour": JOURS[s["date"].weekday()], "num": str(s["date"].day), "mois": MOIS[s["date"].month - 1],
                     "heure": _heure(s["date"]), "titre": s["titre"], "ville": s["ville"], "niveau": s["niveau"],
                     "niveau_cls": s["niveau_cls"], "prix": s["prix"]} for s in sorties[:MAX_VISUEL]],
        "autres": max(0, len(sorties) - MAX_VISUEL),
    }


def legende(sorties: list[dict], debut: datetime) -> str:
    campagne = f"sorties-semaine-{MOIS_UTM[debut.month - 1]}{debut:%y}"
    contenu = f"semaine-{debut:%Y%m%d}"
    lignes = [f"Les sorties de la semaine, {periode(debut)} 👇", ""]
    for s in sorties:
        d = s["date"]
        info = " · ".join(x for x in (s["ville"], s["niveau"], s["prix"]) if x)
        lignes.append(f"▸ {JOURS[d.weekday()].capitalize()} {_num(d)} {MOIS[d.month - 1]}, {_heure(d)} : {s['titre']} ({info})")
        lien = utm(SITE + "/evenements/" + quote(s["slug"]), campagne, contenu)
        lignes.append(f"   {lien}")
    lignes += ["", "Tu viens seul(e) ? C'est fait pour ça : chaque sortie a son chat de groupe pour s'organiser "
               "avant le départ. Le niveau est indiqué sur chaque fiche.",
               "", "Toutes les sorties et l'app : lien en bio."]
    tags = list(HASHTAGS)
    for s in sorties:
        tags += [t for t in HASHTAGS_SPORT.get(s["sport_id"], []) if t not in tags]
    lignes += ["", " ".join(tags)]
    return "\n".join(lignes)


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    ap.add_argument("--dry-run", action="store_true", help="génère sans rien publier (ce script ne publie jamais)")
    ap.add_argument("--out", help="dossier de sortie (défaut : nouveau dossier temporaire)")
    ap.add_argument("--depuis", help="AAAA-MM-JJ : début de la fenêtre de 7 jours (défaut : maintenant)")
    ap.add_argument("--feed", help="fichier JSON local au format du flux public, au lieu de l'appel réseau")
    a = ap.parse_args()

    debut = (datetime.fromisoformat(a.depuis).replace(tzinfo=PARIS) if a.depuis else datetime.now(PARIS))
    if a.feed:
        data = json.loads(Path(a.feed).read_text())
        events = data.get("events", data) if isinstance(data, dict) else data
        events = [{k: v for k, v in e.items() if k not in backend.PERSONAL_FIELDS} for e in events]
    else:
        try:
            events = backend.public_events()
        except Exception as exc:  # flux injoignable : dire quoi et où, sans inventer
            print(f"Flux public des sorties injoignable ({backend.EVENTS_FEED_URL}) : {exc}", file=sys.stderr)
            return 2

    sorties = selection(events, debut)
    if not sorties:
        print(f"Aucune sortie {periode(debut)} dans le flux ({len(events)} sorties lues) : rien à générer.")
        return 0

    out = Path(a.out) if a.out else Path(tempfile.mkdtemp(prefix="fitmates-semaine-"))
    out.mkdir(parents=True, exist_ok=True)
    visuel = donnees_visuel(sorties, debut)
    texte = legende(sorties, debut)
    assert "gratuit" not in (texte + json.dumps(visuel, ensure_ascii=False)).lower(), "« gratuit » interdit"
    assert "image_url" not in json.dumps(visuel), "image_url interdite"

    (out / "semaine.json").write_text(json.dumps(visuel, ensure_ascii=False, indent=2))
    (out / "legende.txt").write_text(texte + "\n")
    # Même format que lancement.json, pour scripts.social_publish (après relecture des titres)
    (out / "post.json").write_text(json.dumps([{"id": f"semaine-{debut:%Y-%m-%d}", "fichier": "semaine.png",
                                                "legende": texte, "hashtags": [], "lien_utm": ""}],
                                              ensure_ascii=False, indent=1))
    r = subprocess.run(["node", str(RENDER), "--semaine", str(out / "semaine.json"), str(out / "semaine.png")])
    if r.returncode:
        print("Rendu du visuel en échec (voir ci-dessus). Playwright doit être disponible pour node.", file=sys.stderr)
        return r.returncode

    print(f"\n{len(sorties)} sortie(s) retenue(s), {len(visuel['sorties'])} sur le visuel. Rien n'a été publié.")
    print(f"Dossier : {out}\n  semaine.png\n  legende.txt\n  post.json\n\n--- légende ---\n{texte}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
