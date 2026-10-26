"""Export des données du cockpit marketing : un fichier JSON (tableau de lignes) par jeu de données.

    python -m scripts.cockpit_export            # → cockpit/data/*.json (lu par l'app Vercel)

Chaque source qui échoue est notée dans acces.json, sans bloquer les autres. Aucune donnée personnelle n'est exportée.
"""
import datetime as dt
import json
from collections import Counter

from fitmates_mkt.config import ROOT, MissingAccess
from fitmates_mkt.sources import app_store, backend, google_play, google_web, store_search

OUT = ROOT / "cockpit" / "data"
TODAY = dt.date.today()


def d(days: int) -> str:
    return (TODAY - dt.timedelta(days=days)).isoformat()


def iso_date(yyyymmdd: str) -> str:
    return f"{yyyymmdd[:4]}-{yyyymmdd[4:6]}-{yyyymmdd[6:]}"


# ---------- Site (GA4) ----------

def ga4_daily() -> list[dict]:
    rows = google_web.ga4_report(d(90), d(1), ["date"], ["sessions", "activeUsers", "keyEvents"])
    return sorted(({"jour": iso_date(r["date"]), "sessions": int(r["sessions"]), "utilisateurs": int(r["activeUsers"]),
                    "conversions": int(r["keyEvents"])} for r in rows), key=lambda r: r["jour"])


def ga4_channels() -> list[dict]:
    cur = {r["sessionDefaultChannelGroup"]: r for r in google_web.ga4_report(d(28), d(1), ["sessionDefaultChannelGroup"], ["sessions", "keyEvents"])}
    prev = {r["sessionDefaultChannelGroup"]: r for r in google_web.ga4_report(d(56), d(29), ["sessionDefaultChannelGroup"], ["sessions"])}
    out = [{"canal": c, "sessions": int(cur.get(c, {}).get("sessions", 0)), "sessions_avant": int(prev.get(c, {}).get("sessions", 0)),
            "conversions": int(cur.get(c, {}).get("keyEvents", 0))} for c in set(cur) | set(prev)]
    return sorted(out, key=lambda r: -r["sessions"])


def ga4_pages() -> list[dict]:
    rows = google_web.ga4_report(d(28), d(1), ["landingPage"], ["sessions", "keyEvents"])
    rows = [{"page": r["landingPage"] or "(inconnue)", "sessions": int(r["sessions"]), "conversions": int(r["keyEvents"])} for r in rows]
    return sorted(rows, key=lambda r: -r["sessions"])[:30]


def ga4_events() -> list[dict]:
    wanted = {"generate_lead": "Formulaire envoyé (lead)", "app_download_click": "Clic vers un store",
              "page_view": "Pages vues", "session_start": "Sessions"}
    cur = {r["eventName"]: r["eventCount"] for r in google_web.ga4_report(d(28), d(1), ["eventName"], ["eventCount"])}
    prev = {r["eventName"]: r["eventCount"] for r in google_web.ga4_report(d(56), d(29), ["eventName"], ["eventCount"])}
    return [{"evenement": k, "libelle": v, "nombre": int(cur.get(k, 0)), "nombre_avant": int(prev.get(k, 0))} for k, v in wanted.items()]


# ---------- Google (Search Console) ----------

def gsc_daily() -> list[dict]:
    rows = google_web.search_analytics(d(92), d(2), ("date",), 500)
    return sorted(({"jour": r["date"], "clics": int(r["clicks"]), "impressions": int(r["impressions"]),
                    "position": round(r["position"], 1)} for r in rows), key=lambda r: r["jour"])


def gsc_queries() -> list[dict]:
    rows = google_web.search_analytics(d(30), d(2), ("query",), 500)
    return [{"requete": r["query"], "clics": int(r["clicks"]), "impressions": int(r["impressions"]),
             "ctr": round(r["ctr"], 4), "position": round(r["position"], 1)}
            for r in sorted(rows, key=lambda r: (-r["impressions"], -r["clicks"]))[:300]]


def gsc_pages() -> list[dict]:
    rows = google_web.search_analytics(d(30), d(2), ("page",), 1000)
    agg: dict[str, dict] = {}
    for r in rows:
        path = r["page"].split("fitmates.net", 1)[-1] or "/"
        if "/cs/news/" in path:  # URL de spam externe (404 sur le site)
            continue
        a = agg.setdefault(path, {"page": path, "clics": 0, "impressions": 0, "_pos": 0.0})
        a["clics"] += int(r["clicks"]); a["impressions"] += int(r["impressions"]); a["_pos"] += r["position"] * r["impressions"]
    out = [{"page": a["page"], "clics": a["clics"], "impressions": a["impressions"],
            "position": round(a["_pos"] / a["impressions"], 1) if a["impressions"] else None} for a in agg.values()]
    return sorted(out, key=lambda r: -r["impressions"])[:300]


# ---------- Stores ----------

def stores() -> list[dict]:
    out = []
    try:
        ios = app_store.reviews()
        out.append({"store": "App Store", "avis_ecrits": len(ios),
                    "note_moyenne": round(sum(r["rating"] for r in ios) / len(ios), 2) if ios else None,
                    "avis_30j": sum(1 for r in ios if (r["date"] or "")[:10] >= d(30))})
    except Exception:  # noqa: BLE001
        pass
    try:
        play = google_play.reviews()
        out.append({"store": "Google Play", "avis_ecrits": None,
                    "note_moyenne": round(sum(r["rating"] for r in play) / len(play), 2) if play else None,
                    "avis_30j": None, "avis_7j": len(play)})
    except Exception:  # noqa: BLE001
        pass
    return out


# ---------- Backend ----------

ZONES = {"75": "Paris", "77": "Seine-et-Marne", "78": "Yvelines", "91": "Essonne", "92": "Hauts-de-Seine",
         "93": "Seine-Saint-Denis", "94": "Val-de-Marne", "95": "Val-d'Oise"}


def sorties() -> list[dict]:
    evs = [e for e in backend.public_events() if (e.get("start_at") or "")[:10] >= TODAY.isoformat()]
    c = Counter((e.get("sport") or "autre", ZONES.get(((e.get("location") or {}).get("postal_code") or "")[:2], "Hors Île-de-France"),
                 "payante" if (e.get("price_eur") or 0) > 0 else "gratuite") for e in evs)
    return [{"sport": s, "zone": z, "prix": p, "sorties": n} for (s, z, p), n in sorted(c.items(), key=lambda x: -x[1])]


# ---------- Listes d'attente (site) ----------

def listes_attente() -> list[dict]:
    """Inscrits par sport et secteur, via le compteur public du site (/api/waitlist, qui ne renvoie qu'un nombre).
    Couvre les secteurs des pages sport × zone et des pages lieu ; une ville tapée librement n'est pas comptée ici."""
    import re
    import requests
    xml = requests.get("https://www.fitmates.net/sitemap-pages.xml", timeout=30).text
    paths = [p.rstrip("/") for p in re.findall(r"<loc>https://www\.fitmates\.net(/[^<]*)</loc>", xml)]
    sports = {p.split("/")[2] for p in paths if p.startswith("/sport/") and p.count("/") == 2}
    pairs = set()
    for p in paths:
        parts = p.strip("/").split("/")
        if len(parts) == 3 and parts[0] == "sport":
            pairs.add((parts[1], parts[2]))
        elif len(parts) == 2 and parts[0] in sports:
            pairs.add((parts[0], parts[1]))
    pairs.add(("course-a-pied", "paris"))  # page run clubs
    out = []
    for sport, area in sorted(pairs):
        r = requests.get("https://www.fitmates.net/api/waitlist", params={"sport": sport, "area": area}, timeout=20)
        n = (r.json() or {}).get("count") if r.ok else None
        if n:
            out.append({"sport": sport, "secteur": area, "inscrits": int(n)})
    return sorted(out, key=lambda r: -r["inscrits"])


# ---------- Accès ----------

ACCESS = [
    ("Site : trafic (GA4)", lambda: google_web.ga4_property_id(), "", ""),
    ("Google : recherche (Search Console)", lambda: google_web.search_analytics(d(9), d(2), ("date",), 1), "", ""),
    ("Google Play : fiche et avis", lambda: google_play.reviews(), "", ""),
    ("Google Play : installations et visites de fiche", lambda: google_play.bulk_report_files(),
     "Copier l'URI Cloud Storage des rapports (gs://pubsite_prod_rev_…)", "https://play.google.com/console"),
    ("App Store : fiche et avis", lambda: app_store.app(), "", ""),
    ("App Store : impressions et téléchargements", lambda: app_store.ensure_analytics_request(),
     "Créer une clé API au rôle Admin", "https://appstoreconnect.apple.com/access/integrations/api"),
    ("Stores : positions dans la recherche", lambda: store_search.ios_rank("fitmates"),
     "Autoriser itunes.apple.com et play.google.com dans le réseau de l'environnement", "https://code.claude.com/docs/en/cloud-environments#network-access"),
    ("Backend : sorties publiques", lambda: backend.public_events(), "", ""),
    ("Backend : inscriptions, actifs, participations", lambda: backend.metrics(d(2), d(1)),
     "Interface backend à préparer (agrégats, aucune donnée personnelle)", ""),
    ("Réseaux sociaux (Meta)", lambda: __import__("fitmates_mkt.sources.social", fromlist=["x"]).instagram_account(),
     "Jetons Meta en variables d'environnement", "https://developers.facebook.com/tools/explorer/"),
]


def acces() -> list[dict]:
    out = []
    for name, fn, todo, link in ACCESS:
        try:
            fn()
            out.append({"source": name, "etat": "ok", "a_faire": "", "lien": ""})
        except MissingAccess:
            out.append({"source": name, "etat": "manquant", "a_faire": todo, "lien": link})
        except Exception:  # noqa: BLE001
            out.append({"source": name, "etat": "bloqué", "a_faire": todo or "Voir docs/sources-de-donnees.md", "lien": link})
    return out


def actions() -> list[dict]:
    return json.loads((ROOT / "cockpit" / "actions.json").read_text())


JOBS = {"ga4_jour": ga4_daily, "ga4_canaux": ga4_channels, "ga4_pages": ga4_pages, "ga4_evenements": ga4_events,
        "gsc_jour": gsc_daily, "gsc_requetes": gsc_queries, "gsc_pages": gsc_pages,
        "stores": stores, "sorties": sorties, "listes_attente": listes_attente, "acces": acces, "actions": actions}


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    (OUT / "meta.json").write_text(json.dumps({"genere_le": dt.datetime.now(dt.timezone.utc).isoformat(timespec="seconds")}))
    for name, fn in JOBS.items():
        try:
            rows = fn()
            (OUT / f"{name}.json").write_text(json.dumps(rows, ensure_ascii=False))
            print(f"OK      {name} ({len(rows)} lignes)")
        except Exception as e:  # noqa: BLE001
            print(f"ÉCHEC   {name} : {str(e)[:150]}")


if __name__ == "__main__":
    main()
