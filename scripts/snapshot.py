"""Relevé daté de tous les indicateurs disponibles → data/snapshots/<date>.json.

Sert de référence avant un changement, puis de point de comparaison 3 à 4 semaines après.
Chaque source qui échoue est notée avec la raison, sans bloquer les autres. Aucune donnée personnelle n'est écrite.

    python -m scripts.snapshot                 # tout
    python -m scripts.snapshot --days 28       # fenêtre des métriques (défaut 28 jours)
"""
import argparse
import datetime as dt
import json
from collections import Counter

from fitmates_mkt.config import ROOT
from fitmates_mkt.sources import app_store, backend, google_play, google_web, store_search


def _play_store_performance(month: str) -> dict:
    files = [f for f in google_play.bulk_report_files() if month.replace("-", "") in f]
    out = {}
    for f in files:
        rows = google_play.bulk_report(f)
        key = "par_source" if "traffic_source" in f else "par_pays" if "country" in f else f.rsplit("/", 1)[-1]
        out[key] = rows
    return out


def collect(days: int) -> dict:
    today = dt.date.today()
    start = (today - dt.timedelta(days=days)).isoformat()
    end = (today - dt.timedelta(days=1)).isoformat()
    jobs = {
        "play_fiche": lambda: {k: {f: v.get(f) for f in ("title", "shortDescription", "images")} for k, v in google_play.listings().items()},
        "play_avis_7j": lambda: Counter(r["rating"] for r in google_play.reviews()),
        "play_store_performance": lambda: _play_store_performance(today.replace(day=1).isoformat()[:7]),
        "ios_avis": lambda: {"total": len(r := app_store.reviews()), "par_note": Counter(x["rating"] for x in r)},
        "ios_note_publique_fr": lambda: store_search.ios_public_rating("fr"),
        "ios_analytics": lambda: [x["attributes"]["name"] for x in app_store.analytics_reports(app_store.ensure_analytics_request())],
        "positions_stores_fr": lambda: store_search.ranks(),
        "search_console_requetes": lambda: google_web.search_analytics(start, end, ("query",), 200),
        "search_console_pages": lambda: google_web.search_analytics(start, end, ("page",), 200),
        "ga4_sources": lambda: google_web.ga4_report(start, end, ["sessionDefaultChannelGroup"], ["sessions", "conversions"]),
        "backend_sorties_publiques": lambda: Counter(e.get("sport") for e in backend.public_events()),
        "backend_agregats": lambda: backend.metrics(start, end),
    }
    snap = {"date": today.isoformat(), "fenetre": [start, end], "donnees": {}, "erreurs": {}}
    for name, fn in jobs.items():
        try:
            snap["donnees"][name] = fn()
            print(f"OK      {name}")
        except Exception as e:  # noqa: BLE001
            snap["erreurs"][name] = str(e)[:300]
            print(f"ÉCHEC   {name} : {str(e)[:150]}")
    return snap


def main() -> None:
    p = argparse.ArgumentParser()
    p.add_argument("--days", type=int, default=28)
    a = p.parse_args()
    snap = collect(a.days)
    out = ROOT / "data" / "snapshots" / f"{snap['date']}.json"
    out.write_text(json.dumps(snap, ensure_ascii=False, indent=1, default=str))
    print(f"→ {out.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
