"""Extrait le tracé, le profil et les chiffres d'une fiche rando.pnr-idf.fr (Geotrek) vers un JSON pour les carrousels.

    python canaux/social/v2/donnees/extraire_trace.py https://rando.pnr-idf.fr/trek/26551-Entre-Vallee-et-Chateaux \
        canaux/social/v2/donnees/entre-vallee-et-chateaux.json "Ferme de Coubertin" "Eglise de Chevreuse"

Tout vient de la page officielle (le GeoJSON du tracé est intégré à la page) : rien n'est saisi à la main.
Points d'intérêt : seulement ceux nommés en argument (liste blanche). Les fiches citent aussi des artisans sous leur
nom propre : ils ne doivent jamais entrer dans le dépôt (aucune donnée personnelle).
Le fichier garde aussi les chiffres affichés par la fiche (distance, dénivelé, durée, difficulté) pour comparaison.
"""
import html
import json
import math
import re
import sys
from datetime import date

import requests


def _dseg(p, a, b):
    """Distance du point p au segment [a, b] (et non à la droite : indispensable pour une boucle)."""
    dx, dy = b[0] - a[0], b[1] - a[1]
    l2 = dx * dx + dy * dy
    t = 0 if l2 == 0 else max(0, min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / l2))
    return math.hypot(p[0] - a[0] - t * dx, p[1] - a[1] - t * dy)


def _dp(pts, eps):
    """Douglas-Peucker sur des points (x, y, ...) en mètres."""
    if len(pts) < 3:
        return pts
    i, dmax = 0, -1.0
    for k in range(1, len(pts) - 1):
        d = _dseg(pts[k], pts[0], pts[-1])
        if d > dmax:
            i, dmax = k, d
    if dmax <= eps:
        return [pts[0], pts[-1]]
    return _dp(pts[: i + 1], eps)[:-1] + _dp(pts[i:], eps)


def _champ(texte, libelle):
    m = re.search(r"\n([^\n]+)\n" + re.escape(libelle) + r"\n", texte)
    return m.group(1).strip() if m else None


def main(url, out, *gardes):
    page = requests.get(url, timeout=60).text
    m = re.search(r'"trekGeoJSON":"((?:[^"\\]|\\.)*)"', page)
    if not m:
        sys.exit("GeoJSON du tracé introuvable dans la page")
    geo = json.loads(json.loads('"' + m.group(1) + '"'))
    coords = geo["features"][0]["geometry"]["coordinates"]
    lat0 = sum(c[1] for c in coords) / len(coords)
    kx, ky = 111320 * math.cos(math.radians(lat0)), 110540
    lon0 = min(c[0] for c in coords)
    latmax = max(c[1] for c in coords)
    # Mètres, y vers le bas (repère écran)
    pts = [((c[0] - lon0) * kx, (latmax - c[1]) * ky, c[2] if len(c) > 2 else 0) for c in coords]
    dist, cum = 0.0, [0.0]
    for a, b in zip(pts, pts[1:]):
        dist += math.hypot(b[0] - a[0], b[1] - a[1])
        cum.append(dist)
    montee = sum(max(0, b[2] - a[2]) for a, b in zip(pts, pts[1:]))
    simple = _dp(list(pts), 6)
    # Profil : altitude tous les 1 % de la distance
    profil, j = [], 0
    for s in range(101):
        d = dist * s / 100
        while j < len(cum) - 2 and cum[j + 1] < d:
            j += 1
        profil.append(round(pts[j][2]))
    texte = html.unescape(re.sub(r"<[^>]+>", "\n", re.sub(r"<script.*?</script>|<style.*?</style>", "", page, flags=re.S)))
    texte = "\n".join(l.strip() for l in texte.split("\n") if l.strip())
    # Points d'intérêt géolocalisés par la fiche (nom placé juste avant la géométrie)
    pois = []
    for g in re.finditer(r'"geometry":\{"x":([\d.]+),"y":([\d.]+)', page):
        noms = re.findall(r'"name":"([^"]{3,90})"', page[max(0, g.start() - 3000): g.start()])
        if noms and noms[-1] in gardes:
            x, y = (float(g.group(1)) - lon0) * kx, (latmax - float(g.group(2))) * ky
            pois.append({"nom": noms[-1], "x": round(x, 1), "y": round(y, 1)})
    data = {
        "source": url,
        "releve_le": date.today().isoformat(),
        "fiche": {"titre": (re.search(r"<title>([^<-]+)", page) or [None, ""])[1].strip(),
                  "difficulte": _champ("\n" + texte + "\n", "Difficulté"), "duree": _champ("\n" + texte + "\n", "Durée"),
                  "longueur": _champ("\n" + texte + "\n", "Longueur"),
                  "denivele_positif": _champ("\n" + texte + "\n", "Dénivelé positif")},
        "calcule": {"distance_m": round(dist), "montee_m": round(montee),
                    "alt_min": min(p[2] for p in pts), "alt_max": max(p[2] for p in pts)},
        "largeur_m": round(max(p[0] for p in pts)), "hauteur_m": round(max(p[1] for p in pts)),
        "trace": [[round(p[0], 1), round(p[1], 1)] for p in simple],
        "profil": profil,
        "pois": pois,
    }
    with open(out, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=1)
    print(f"{out} : {len(simple)} points (sur {len(coords)}), {dist / 1000:.2f} km, +{montee:.0f} m, fiche {data['fiche']}")


if __name__ == "__main__":
    main(*sys.argv[1:])
