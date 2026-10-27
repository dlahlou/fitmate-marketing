"""Carrousel Instagram « Ce week-end on sort » (charte v2, tableau des départs) à partir du flux public des sorties.

    python -m scripts.social_weekly_v2 --out /tmp/weekend                  # week-end qui vient
    python -m scripts.social_weekly_v2 --out /tmp/weekend --depuis 2026-11-05
    python -m scripts.social_weekly_v2 --out /tmp/weekend --feed sorties.json

Ce script NE PUBLIE RIEN. Il écrit dans --out : carrousel.json (description des slides), 01.png… (1080×1350) et
post.json au format de lancement.json ({id, fichier, legende, hashtags, lien_utm}, plus « fichiers » : toutes les
slides du carrousel). À relire, puis à publier à la main.

Fenêtre : du vendredi 0 h au dimanche 24 h du week-end qui vient (heure de Paris) ; si on est déjà vendredi, samedi
ou dimanche, à partir de maintenant.

Données : seulement title, start_at, location.city, level, price_eur, slug (et sport pour le libellé). Jamais
image_url, jamais de nom d'organisateur ni de participant. Le prix n'apparaît que s'il est > 0 ; jamais « gratuit ».
Titres : un titre n'est affiché que si chaque mot à majuscule est un mot courant, la ville de la sortie ou un lieu de
canaux/social/v2/donnees/lieux.txt. Sinon (prénom, nom de personne, mot inconnu) il est remplacé par
« Randonnée à <ville> » et le script le signale, sans recopier le mot suspect.
"""
import argparse
import json
import re
import subprocess
import sys
import unicodedata
from datetime import datetime, timedelta
from pathlib import Path
from urllib.parse import urlencode

from fitmates_mkt.config import ROOT
from fitmates_mkt.sources import backend

from .social_weekly import NIVEAUX, PARIS, SPORTS, _prix, _propre

V2 = ROOT / "canaux" / "social" / "v2"
RENDER = V2 / "render.js"
LIEUX = V2 / "donnees" / "lieux.txt"
SITE = "https://www.fitmates.net"
PAR_TABLEAU = 5          # lignes par slide « tableau des départs »
LIGNES_LEGENDE = 5       # légende : 3 à 5 lignes utiles (charte § 8)
MAX_TABLEAUX = 3         # 3 à 5 slides au total : accroche + 1 à 3 tableaux + fin

JOURS = ["lun.", "mar.", "mer.", "jeu.", "ven.", "sam.", "dim."]
MOIS = ["janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."]
MOIS_UTM = ["jan", "fev", "mar", "avr", "mai", "jun", "jul", "aou", "sep", "oct", "nov", "dec"]

# Mots courants admis avec une majuscule dans un titre (comparés sans accents, en minuscules)
VOCABULAIRE = {
    "randonnee", "rando", "randos", "balade", "boucle", "sortie", "marche", "nordique", "trail", "course", "footing",
    "running", "run", "velo", "vtt", "gravel", "foret", "bois", "vallee", "parc", "bord", "bords", "lac", "etang",
    "chateau", "gare", "depart", "arrivee", "tour", "coteaux", "plateau", "nocturne", "decouverte", "initiation",
    "week-end", "weekend", "dimanche", "samedi", "vendredi", "matin", "soir", "journee", "automne", "hiver",
    "printemps", "ete", "entre", "autour", "par", "via", "de", "du", "des", "la", "le", "les", "et", "a", "au", "aux",
    "en", "sur", "grande", "petite", "grand", "petit", "boucles", "crete", "cretes", "riviere", "canal", "berges",
    "sentier", "gr", "pr", "rer", "km", "yoga", "padel", "escalade", "natation", "debutant", "debutants",
    "intermediaire", "sportive", "douce", "express", "sud", "nord", "est", "ouest",
}


def _plat(s: str) -> str:
    return "".join(c for c in unicodedata.normalize("NFD", s.lower()) if unicodedata.category(c) != "Mn")


def lieux_connus() -> set[str]:
    out = set()
    for line in LIEUX.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if line and not line.startswith("#"):
            out.add(_plat(line))
            out.update(_plat(p) for p in re.split(r"[\s\-']+", line) if p)
    return out


def titre_sur(titre: str, ville: str, lieu: str, lieux: set[str]) -> bool:
    """Vrai si aucun mot à majuscule du titre n'est inconnu (prénom ou nom de personne possibles)."""
    admis = set(lieux) | VOCABULAIRE
    for x in (ville, lieu):
        if x:
            admis.add(_plat(x))
            admis.update(_plat(p) for p in re.split(r"[\s\-']+", x) if p)
    for mot in re.findall(r"[A-Za-zÀ-ÖØ-öø-ÿœŒ][\wÀ-ÖØ-öø-ÿœŒ\-]*", titre.replace("’", "'")):
        if not mot[0].isupper():
            continue
        m = _plat(mot)
        if m in admis:
            continue
        if all(p in admis for p in re.split(r"[\-']+", m) if p):
            continue
        return False
    return True


def fenetre(depuis: datetime) -> tuple[datetime, datetime]:
    jour = depuis.replace(hour=0, minute=0, second=0, microsecond=0)
    if depuis.weekday() >= 4:
        debut = depuis
        vendredi = jour - timedelta(days=depuis.weekday() - 4)
    else:
        vendredi = jour + timedelta(days=4 - depuis.weekday())
        debut = vendredi
    return debut, vendredi + timedelta(days=3)


def selection(events: list[dict], debut: datetime, fin: datetime, lieux: set[str]) -> tuple[list[dict], int]:
    out, masques = [], 0
    for e in events:
        try:
            d = datetime.fromisoformat(str(e["start_at"]).replace("Z", "+00:00")).astimezone(PARIS)
        except (KeyError, ValueError):
            continue
        if not (debut <= d < fin and e.get("slug") and e.get("title")):
            continue
        loc = e.get("location") or {}
        ville = _propre(loc.get("city"))
        sport = SPORTS.get(str(e.get("sport") or ""), "Sortie")
        titre = _propre(e["title"])
        if not titre_sur(titre, ville, _propre(loc.get("name")), lieux):
            masques += 1
            titre = f"{sport} à {ville}" if ville else sport
        niveau = NIVEAUX.get(str(e.get("level") or "").lower(), ("", ""))[0]
        # Liste blanche : rien d'autre ne sort du flux (pas d'image_url, pas de nom)
        out.append({"date": d, "titre": titre, "slug": str(e["slug"]), "ville": ville, "niveau": niveau,
                    "prix": _prix(e.get("price_eur")), "sport_id": str(e.get("sport") or "")})
    return sorted(out, key=lambda s: s["date"]), masques


def _num(d: datetime) -> str:
    return "1er" if d.day == 1 else str(d.day)


def periode(debut: datetime, fin: datetime) -> str:
    a, b = debut, fin - timedelta(days=1)
    if a.month == b.month:
        return f"{_num(a)}–{_num(b)} {MOIS[b.month - 1]}"
    return f"{_num(a)} {MOIS[a.month - 1]} – {_num(b)} {MOIS[b.month - 1]}"


def carrousel(sorties: list[dict], debut: datetime, fin: datetime) -> dict:
    ident = f"weekend-{debut:%Y%m%d}"
    lignes = [{"heure": f"{s['date']:%H:%M}", "jour": f"{JOURS[s['date'].weekday()]} {_num(s['date'])}",
               "dest": s["titre"], "lieu": s["ville"] if s["ville"] and _plat(s["ville"]) not in _plat(s["titre"]) else "",
               "niveau": s["niveau"], "prix": s["prix"]} for s in sorties]
    paquets = [lignes[i:i + PAR_TABLEAU] for i in range(0, len(lignes), PAR_TABLEAU)][:MAX_TABLEAUX]
    affichees = sum(len(p) for p in paquets)
    n = len(sorties)
    slides = [{
        "fond": "encre", "haut_top": 190,
        "haut": [{"titre": "Départs de ce week-end. ~Choisis ton quai.~", "taille": "l"}],
        "bas": [{"etiquette": f"{n} départ{'s' if n > 1 else ''} · {periode(debut, fin)}"},
                {"palettes": [{"jour": l["jour"], "heure": l["heure"], "v": s["ville"] or l["dest"]} for l, s in zip(lignes[:3], sorties)],
                 "classe": "serre"}],
        "trace": {"points": [[86, 128]], "sortie": 128},
    }]
    for i, p in enumerate(paquets):
        dernier = i == len(paquets) - 1
        pied = "Rendez-vous, prix et places : sur la fiche de chaque sortie."
        if dernier and n > affichees:
            pied = f"+ {n - affichees} autre{'s' if n - affichees > 1 else ''} sortie{'s' if n - affichees > 1 else ''} dans l'app. " + pied
        slides.append({"fond": "encre", "haut_top": 190,
                       "haut": [{"tableau": {"titre": "*Départs*", "date": periode(debut, fin), "lignes": p, "pied": pied,
                                             "compact": len(p) > PAR_TABLEAU}}],
                       "trace": {"points": [], "sortie": 128}})
    slides.append({
        "fond": "foret", "haut_top": 190,
        "haut": [{"titre": "Envoie ça à la personne qui dit toujours « on devrait faire une *rando* ».", "taille": "l"}],
        "bas": [{"texte": "Les fiches des sorties : lien en bio."},
                {"note": "L'app est gratuite. Certaines sorties sont payantes, si l'organisateur le décide.", "classe": "serre"}],
        "trace": {"points": [[900, 128]]},
    })
    return {"id": ident, "titre": f"Ce week-end on sort · {periode(debut, fin)}", "rubrique": "Ce week-end on sort",
            "slides": slides}


def legende(sorties: list[dict], debut: datetime, fin: datetime) -> str:
    n = len(sorties)
    lignes = [f"Départs de ce week-end ({periode(debut, fin)}) : {n} sortie{'s' if n > 1 else ''}, choisis ton quai.", ""]
    for s in sorties[:LIGNES_LEGENDE]:
        d = s["date"]
        info = " · ".join(x for x in (s["ville"] if _plat(s["ville"]) not in _plat(s["titre"]) else "", s["niveau"], s["prix"]) if x)
        lignes.append(f"▸ {JOURS[d.weekday()].capitalize()} {_num(d)} {MOIS[d.month - 1]}, {d:%H:%M} : {s['titre']}" + (f" ({info})" if info else ""))
    if n > LIGNES_LEGENDE:
        lignes.append(f"▸ et {n - LIGNES_LEGENDE} autre{'s' if n - LIGNES_LEGENDE > 1 else ''} sur le carrousel")
    lignes += ["", "Chaque sortie a son chat de groupe pour caler le train et le rendez-vous. Les fiches sont en lien en bio.",
               "", "Envoie ce post à la personne qui dit toujours « on devrait faire une rando »."]
    return "\n".join(lignes)


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    ap.add_argument("--out", required=True, help="dossier de sortie")
    ap.add_argument("--depuis", help="AAAA-MM-JJ : date de référence (défaut : maintenant)")
    ap.add_argument("--feed", help="fichier JSON local au format du flux public, au lieu de l'appel réseau")
    a = ap.parse_args()

    ref = datetime.fromisoformat(a.depuis).replace(tzinfo=PARIS) if a.depuis else datetime.now(PARIS)
    debut, fin = fenetre(ref)
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
    sorties, masques = selection(events, debut, fin, lieux_connus())
    if not sorties:
        print(f"Aucune sortie du {debut:%d/%m} au {fin - timedelta(days=1):%d/%m} dans le flux ({len(events)} lues) : rien à générer.")
        return 0

    out = Path(a.out).resolve()
    out.mkdir(parents=True, exist_ok=True)
    C = carrousel(sorties, debut, fin)
    texte = legende(sorties, debut, fin)
    tout = texte + json.dumps(C, ensure_ascii=False)
    assert "gratuit" not in texte.lower() and "gratuites" not in tout.lower(), "« gratuit » interdit dans la légende"
    assert "image_url" not in tout, "image_url interdite"
    (out / "carrousel.json").write_text(json.dumps(C, ensure_ascii=False, indent=1))
    r = subprocess.run(["node", str(RENDER), str(out / "carrousel.json"), "--out", str(out)])
    if r.returncode:
        print("Rendu en échec (voir ci-dessus). Playwright doit être disponible pour node.", file=sys.stderr)
        return r.returncode
    fichiers = [f"{i + 1:02d}.png" for i in range(len(C["slides"]))]
    utm = {"utm_source": "instagram", "utm_medium": "organic",
           "utm_campaign": f"ce-week-end-{MOIS_UTM[debut.month - 1]}{debut:%y}", "utm_content": C["id"]}
    post = [{"id": C["id"], "fichier": fichiers[0], "fichiers": fichiers, "legende": texte,
             "hashtags": ["#randonnee", "#sortiesduweekend", "#sportaplusieurs", "#Fitmates"],
             "lien_utm": f"{SITE}/evenements?{urlencode(utm)}"}]
    (out / "post.json").write_text(json.dumps(post, ensure_ascii=False, indent=1))
    print(f"\n{len(sorties)} sortie(s) retenue(s), {len(C['slides'])} slides. Rien n'a été publié.")
    if masques:
        print(f"{masques} titre(s) remplacé(s) par « <sport> à <ville> » : mot inconnu possible (prénom ou nom). "
              f"Si c'est un lieu, l'ajouter à {LIEUX.relative_to(ROOT)}.")
    print(f"Dossier : {out}\n--- légende ---\n{texte}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
