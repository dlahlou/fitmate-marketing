#!/usr/bin/env python3
"""
Validation des mots-clés de la stratégie Fitmates avec des données réelles.

Deux sources, par ordre de fiabilité :
  1. Google Trends (pytrends)  : intérêt relatif sur 5 ans (France), saisonnalité, régions, requêtes associées en hausse
  2. Google Autocomplete        : une suggestion n'existe que si la requête est réellement tapée → preuve d'usage

Sortie : canaux/seo/google-trends/rapport-mots-cles.md + CSV bruts dans canaux/seo/google-trends/

Usage :
    pip install pytrends pandas requests
    python scripts/validate_keywords.py            # tout
    python scripts/validate_keywords.py --no-trends   # autocomplete seulement (rapide, sans quota)

Hôtes à autoriser (réseau) : trends.google.com, trends.google.fr, suggestqueries.google.com
"""
import argparse
import csv
import json
import sys
import time
from datetime import datetime
from pathlib import Path
from urllib.parse import quote

import requests

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "canaux" / "seo" / "google-trends"
OUT.mkdir(parents=True, exist_ok=True)

ANCHOR = "randonnée"  # étalon commun à tous les groupes Trends (max 5 termes par requête)

# Mots-clés de la stratégie, par cluster. Le verdict est donné cluster par cluster.
CLUSTERS = {
    "Sports (volume)": ["randonnée", "course à pied", "running", "vélo", "padel", "escalade", "yoga", "pilates", "natation", "trail", "marche nordique", "hyrox", "foot à 5", "basket", "tennis"],
    "Intention partenaire": ["partenaire sport", "partenaire de sport", "faire du sport à plusieurs", "application pour faire du sport à plusieurs", "sport entre amis", "trouver des gens pour faire du sport", "sport social", "rencontre sportive"],
    "Rando groupe IDF": ["groupe randonnée", "groupe randonnée île de france", "randonnée groupe paris", "randonnée ce week-end", "club randonnée paris", "randonnée fontainebleau", "randonnée vallée de chevreuse", "randonnée en train depuis paris"],
    "Run clubs": ["run club", "run club paris", "club running paris", "courir en groupe", "courir en groupe paris", "club de course à pied"],
    "Raquettes": ["partenaire padel", "partenaire tennis", "trouver un partenaire de padel", "padel paris", "padel débutant"],
    "Agenda": ["événements sportifs paris", "sport gratuit paris", "sortie sportive paris", "que faire ce week-end paris sport"],
    "Organisateurs": ["créer un run club", "organiser une randonnée", "créer un groupe de randonnée", "coach sportif trouver des clients", "remplir ses cours collectifs", "application run club", "organiser une sortie running"],
    "Concurrents (marque)": ["frimake", "meetup", "sportyfriends", "atclub", "strava club", "hellorunner", "timeleft"],
}

SEEDS_AUTOCOMPLETE = ["run club", "randonnée groupe", "randonnée ile de france", "partenaire sport", "faire du sport à plusieurs", "créer un run club", "organiser une randonnée", "padel partenaire", "courir en groupe", "sport entre amis", "application sport", "rando paris", "coach sportif", "groupe de marche"]

UA = {"User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125 Safari/537.36"}


def google_autocomplete(q: str) -> list[str]:
    r = requests.get(f"https://suggestqueries.google.com/complete/search?client=firefox&hl=fr&gl=fr&q={quote(q)}", headers=UA, timeout=15)
    r.raise_for_status()
    return r.json()[1]


def run_autocomplete(report: list[str]) -> dict[str, list[str]]:
    found: dict[str, list[str]] = {}
    rows = []
    report.append("## 2. Preuve d'usage : autocomplétion Google (France)\n")
    report.append("Une suggestion n'apparaît que pour des requêtes réellement tapées par des utilisateurs. Les suggestions longues (« run club paris débutant ») sont les plus précieuses : ce sont des pages à créer.\n")
    report.append("| Amorce | Google suggère |\n|---|---|")
    for seed in SEEDS_AUTOCOMPLETE:
        g = []
        try:
            g = google_autocomplete(seed)
        except Exception as e:  # noqa: BLE001
            g = [f"(erreur: {e.__class__.__name__})"]
        found[seed] = g
        rows.append({"seed": seed, "google": " | ".join(g)})
        report.append(f"| {seed} | {', '.join(g) or '–'} |")
        time.sleep(1.2)
    with open(OUT / "autocomplete.csv", "w", newline="") as f:
        w = csv.DictWriter(f, fieldnames=["seed", "google"])
        w.writeheader()
        w.writerows(rows)
    report.append("")
    return found


def run_trends(report: list[str]) -> dict[str, dict]:
    from pytrends.request import TrendReq  # import tardif : optionnel

    pt = TrendReq(hl="fr-FR", tz=-60, timeout=(10, 30), retries=3, backoff_factor=2)
    results: dict[str, dict] = {}
    report.append("## 1. Google Trends (France, 5 ans)\n")
    report.append(f"Indice relatif 0–100 par rapport à l'étalon « {ANCHOR} » (= 100 à son pic). Moyenne 12 derniers mois, pente = moyenne des 12 derniers mois / moyenne des 12 mois précédents. Pic/creux = mois moyens sur 5 ans.\n")
    report.append("| Cluster | Mot-clé | Moy. 12 mois (vs rando) | Pente an/an | Mois pic | Mois creux | Région n°1 | Verdict |\n|---|---|---|---|---|---|---|---|")
    mois = ["jan", "fév", "mar", "avr", "mai", "juin", "juil", "août", "sep", "oct", "nov", "déc"]
    for cluster, kws in CLUSTERS.items():
        others = [k for k in kws if k != ANCHOR]
        for i in range(0, len(others), 4):
            batch = [ANCHOR] + others[i : i + 4]
            try:
                pt.build_payload(batch, timeframe="today 5-y", geo="FR")
                iot = pt.interest_over_time()
                if "isPartial" in iot:
                    iot = iot.drop(columns=["isPartial"])
                iot.to_csv(OUT / f"trends_{cluster[:12].replace(' ', '_')}_{i}.csv")
                time.sleep(4)
                reg = pt.interest_by_region(resolution="REGION", inc_low_vol=True)
                time.sleep(4)
                try:
                    rel = pt.related_queries()
                except Exception:  # noqa: BLE001
                    rel = {}
                for kw in batch:
                    if kw == ANCHOR and cluster != "Sports (volume)":
                        continue
                    s = iot[kw]
                    last12, prev12 = s.iloc[-52:].mean(), s.iloc[-104:-52].mean()
                    slope = (last12 / prev12) if prev12 > 0 else float("nan")
                    bym = s.groupby(s.index.month).mean()
                    peak, low = (mois[int(bym.idxmax()) - 1], mois[int(bym.idxmin()) - 1]) if bym.max() > 0 else ("–", "–")
                    top_region = reg[kw].idxmax() if kw in reg and reg[kw].max() > 0 else "–"
                    rising = []
                    try:
                        rq = rel.get(kw, {}).get("rising")
                        if rq is not None and len(rq):
                            rising = rq["query"].head(5).tolist()
                            rq.to_csv(OUT / f"rising_{kw.replace(' ', '_')}.csv", index=False)
                    except Exception:  # noqa: BLE001
                        pass
                    if last12 == 0:
                        verdict = "✖ trop faible pour Trends (vérifier autocomplete)"
                    elif slope >= 1.15:
                        verdict = "↑ en croissance"
                    elif slope <= 0.85:
                        verdict = "↓ en recul"
                    else:
                        verdict = "→ stable"
                    results[kw] = {"mean12": round(float(last12), 1), "slope": round(float(slope), 2) if slope == slope else None, "peak": peak, "low": low, "region": top_region, "rising": rising}
                    report.append(f"| {cluster} | {kw} | {last12:.1f} | {slope:.2f} | {peak} | {low} | {top_region} | {verdict} |")
            except Exception as e:  # noqa: BLE001
                report.append(f"| {cluster} | {', '.join(batch)} | erreur | | | | | {e.__class__.__name__}: {str(e)[:60]} |")
                time.sleep(20)
            time.sleep(6)
    report.append("")
    rising_lines = [f"- **{kw}** : {', '.join(r['rising'])}" for kw, r in results.items() if r["rising"]]
    if rising_lines:
        report.append("### Requêtes associées en hausse (à transformer en pages)\n")
        report.extend(rising_lines)
        report.append("")
    return results


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--no-trends", action="store_true", help="autocomplete seulement")
    args = ap.parse_args()
    report = [f"# Validation des mots-clés — {datetime.now():%Y-%m-%d}\n", "Généré par `scripts/validate_keywords.py`. Sources : Google Trends (France, 5 ans), autocomplétion Google (fr-FR).\n"]
    trends = {}
    if not args.no_trends:
        try:
            trends = run_trends(report)
        except ModuleNotFoundError:
            report.append("## 1. Google Trends\n\npytrends non installé : `pip install pytrends pandas`.\n")
        except Exception as e:  # noqa: BLE001
            report.append(f"## 1. Google Trends\n\nIndisponible : {e.__class__.__name__}: {e}\n")
    auto = run_autocomplete(report)

    # Synthèse : un mot-clé est « validé » s'il a un indice Trends > 0 ou s'il apparaît dans une suggestion
    report.append("## 3. Synthèse par mot-clé de la stratégie\n")
    report.append("| Mot-clé | Trends (moy. 12 mois) | Vu en autocomplétion | Statut |\n|---|---|---|---|")
    all_suggestions = {s.lower() for lst in auto.values() for s in lst}
    for cluster, kws in CLUSTERS.items():
        for kw in kws:
            t = trends.get(kw)
            seen = any(kw.lower() in s for s in all_suggestions)
            if t and t["mean12"] > 0 and seen:
                status = "✔ validé (Trends + usage)"
            elif t and t["mean12"] > 0:
                status = "✔ validé (Trends)"
            elif seen:
                status = "◐ usage prouvé, volume sous le seuil Trends (longue traîne)"
            elif t is None:
                status = "? Trends non interrogé"
            else:
                status = "✖ aucun signal : reformuler ou abandonner"
            report.append(f"| {kw} | {t['mean12'] if t else '–'} | {'oui' if seen else 'non'} | {status} |")
    report.append("")
    (OUT / "rapport-mots-cles.md").write_text("\n".join(report), encoding="utf-8")
    json.dump({"trends": trends, "autocomplete": auto}, open(OUT / "validation.json", "w"), ensure_ascii=False, indent=1)
    print(f"Rapport : {OUT / 'rapport-mots-cles.md'}")


if __name__ == "__main__":
    sys.exit(main())
