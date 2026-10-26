"""Vérifie chaque source de données, en lecture seule, sans afficher de secret.

    python -m scripts.check_access
"""
from fitmates_mkt.config import MissingAccess
from fitmates_mkt.sources import app_store, backend, google_play, google_web, social, store_search

CHECKS = {
    "Backend : flux public des sorties": lambda: f"{len(backend.public_events())} sorties",
    "Backend : agrégats marketing": lambda: list(backend.metrics("2026-01-01", "2026-01-02"))[:5],
    "Backend : SQL lecture seule": lambda: backend.sql("select 1 as ok"),
    "Google Play : fiche": lambda: sorted(google_play.listings()),
    "Google Play : avis (7 j)": lambda: f"{len(google_play.reviews())} avis",
    "Google Play : Reporting API": lambda: google_play.reporting().get("freshnessInfo", {}).get("freshnesses", [{}])[0],
    "Google Play : rapports groupés": lambda: f"{len(google_play.bulk_report_files())} fichiers",
    "App Store : app": lambda: app_store.app()["name"],
    "App Store : avis": lambda: f"{len(app_store.reviews())} avis",
    "App Store : App Analytics": lambda: app_store.ensure_analytics_request(),
    "Search Console": lambda: f"{len(google_web.search_analytics('2026-01-01', '2026-01-07'))} requêtes",
    "GA4": lambda: google_web.ga4_report("7daysAgo", "yesterday", ["date"], ["sessions"])[:1],
    "Recherche stores (positions)": lambda: {"ios": store_search.ios_rank("fitmates"), "play": store_search.play_rank("fitmates")},
    "Instagram": lambda: social.instagram_account(),
}


def main() -> None:
    for name, fn in CHECKS.items():
        try:
            print(f"OK       {name} : {fn()}")
        except MissingAccess as e:
            print(f"MANQUE   {name} : {e}")
        except Exception as e:  # noqa: BLE001
            msg = str(e)
            if "Tunnel connection failed: 403" in msg:
                msg = "hôte refusé par le réseau de l'environnement (à ajouter aux domaines autorisés)"
            print(f"ERREUR   {name} : {msg[:250]}")


if __name__ == "__main__":
    main()
