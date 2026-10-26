#!/usr/bin/env python3
"""
Extraction Google Trends (France) pour prioriser les sports et les zones.
À lancer en local (Google Trends est inaccessible depuis l'environnement de build) :

    pip install pytrends pandas
    python scripts/google_trends.py

Produit canaux/seo/google-trends/*.csv : intérêt dans le temps (5 ans), intérêt par région,
requêtes associées en hausse. Google limite à 5 termes par comparaison : on utilise
« randonnée » comme ancre commune pour rendre les groupes comparables.
"""
import time
from pathlib import Path

from pytrends.request import TrendReq

OUT = Path(__file__).resolve().parent.parent / "canaux" / "seo" / "google-trends"
OUT.mkdir(parents=True, exist_ok=True)

ANCHOR = "randonnée"
GROUPS = {
    "endurance": [ANCHOR, "course à pied", "run club", "trail", "marche nordique"],
    "outdoor": [ANCHOR, "vélo", "gravel", "escalade", "natation"],
    "tendances": [ANCHOR, "padel", "hyrox", "pilates", "yoga"],
    "collectifs": [ANCHOR, "foot à 5", "basket", "tennis", "fitness"],
    "intentions": ["partenaire sport", "faire du sport à plusieurs", "groupe randonnée", "club running", "sport entre amis"],
    "local_idf": ["randonnée île de france", "randonnée fontainebleau", "run club paris", "padel paris", "escalade paris"],
}

pt = TrendReq(hl="fr-FR", tz=-60, timeout=(10, 30), retries=3, backoff_factor=2)

for name, kw in GROUPS.items():
    print(f"== {name}: {kw}")
    pt.build_payload(kw, timeframe="today 5-y", geo="FR")
    iot = pt.interest_over_time()
    if "isPartial" in iot:
        iot = iot.drop(columns=["isPartial"])
    iot.to_csv(OUT / f"{name}_interet_5ans.csv")
    # saisonnalité : moyenne par mois
    iot.groupby(iot.index.month).mean().round(1).to_csv(OUT / f"{name}_saisonnalite_mois.csv")
    time.sleep(5)
    reg = pt.interest_by_region(resolution="REGION", inc_low_vol=True)
    reg.sort_values(kw[0], ascending=False).to_csv(OUT / f"{name}_regions.csv")
    time.sleep(5)
    try:
        rel = pt.related_queries()
        for k, v in rel.items():
            if v and v.get("rising") is not None:
                v["rising"].to_csv(OUT / f"{name}_{k.replace(' ', '_')}_rising.csv", index=False)
    except Exception as e:  # noqa: BLE001
        print("related_queries indisponible:", e)
    time.sleep(8)

print(f"Terminé : fichiers dans {OUT}")
print("Lecture : comparer les colonnes au sein d'un même groupe ; « randonnée » sert d'étalon entre groupes.")
