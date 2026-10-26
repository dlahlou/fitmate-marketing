"""Export des données du cockpit marketing : un fichier JSON (tableau de lignes) par jeu de données.

    python -m scripts.cockpit_export            # → cockpit/data/*.json (lu par l'app Vercel)

Chaque source qui échoue est notée dans acces.json, sans bloquer les autres. Aucune donnée personnelle n'est exportée.
"""
import datetime as dt
import json
from collections import Counter

from fitmates_mkt.config import ROOT, MissingAccess
from fitmates_mkt.sources import app_store, backend, google_play, google_web, social, store_search

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


# ---------- Stores : statistiques (rapports Apple App Analytics, rapports groupés Google Play) ----------

class Pending(Exception):
    """Accès ouvert, données pas encore produites : rien à faire pour Driss."""


def _once(fn):
    """Mémorise le résultat ou l'erreur : le jeu, acces() et a_faire() l'appellent chacun."""
    memo: list = []
    def wrapper():
        if not memo:
            try:
                memo.append((fn(), None))
            except Exception as e:  # noqa: BLE001
                memo.append((None, e))
        rows, err = memo[0]
        if err:
            raise err
        return rows
    wrapper.__wrapped__ = fn
    return wrapper


def _col(row: dict, *keys: str) -> str:
    """Valeur d'une colonne dont le nom contient l'un des mots donnés (les intitulés varient selon les rapports)."""
    exact = {(k or "").lower(): v for k, v in row.items()}
    for w in keys:
        if w in exact:
            return exact[w] or ""
    for k, v in row.items():
        if any(w in (k or "").lower() for w in keys):
            return v or ""
    return ""


def _n(v) -> float:
    try:
        return float(str(v).replace(",", "").replace("%", "") or 0)
    except ValueError:
        return 0.0


IOS_SOURCES = {"app store search": "Recherche App Store", "app store browse": "Navigation App Store",
               "web referrer": "Sites web", "app referrer": "Autres apps"}


PLAY_SOURCES = {"google play search": "Recherche Google Play", "google play explore": "Navigation Google Play",
                "third-party referrals": "Sites et apps tiers"}


@_once
def app_store_stats() -> list[dict]:
    """Impressions, pages vues et premiers téléchargements par source, sur les 28 derniers jours produits par Apple."""
    rid = app_store.ensure_analytics_request()
    reports = {r["attributes"]["name"]: r["id"] for cat in ("APP_STORE_ENGAGEMENT", "COMMERCE")
               for r in app_store.analytics_reports(rid, cat)}
    eng = app_store.analytics_rows(reports["App Store Discovery and Engagement Standard"])
    dl = app_store.analytics_rows(reports["App Downloads Standard"])
    if not eng and not dl:
        raise Pending("Apple n'a pas encore produit de rapport (1 à 2 jours après la demande)")
    last = max(_col(r, "date") for r in eng + dl)
    start = (dt.date.fromisoformat(last) - dt.timedelta(days=27)).isoformat()
    agg: dict[str, dict] = {}
    def row(src: str) -> dict:
        name = IOS_SOURCES.get(src.lower(), "Autres")
        return agg.setdefault(name, {"source": name, "impressions": 0, "pages_vues": 0, "telechargements": 0})
    for r in eng:
        if _col(r, "date") < start:
            continue
        ev = _col(r, "event").lower()
        k = "impressions" if ev.startswith("impression") else "pages_vues" if ev.startswith("page view") else None
        if k:
            row(_col(r, "source type"))[k] += int(_n(_col(r, "counts")))
    for r in dl:
        if _col(r, "date") >= start and _col(r, "download type").lower().startswith("first"):
            row(_col(r, "source type"))["telechargements"] += int(_n(_col(r, "counts")))
    out = sorted(agg.values(), key=lambda r: -r["impressions"])
    for r in out:
        r["conversion"] = round(r["telechargements"] / r["pages_vues"], 4) if r["pages_vues"] else None
        r["du"], r["au"] = start, last
    return out


@_once
def play_stats() -> list[dict]:
    """Visiteurs de la fiche, acquisitions et conversion, par source de trafic et pour la France, sur 28 jours."""
    try:
        files = google_play.bulk_report_files()
    except RuntimeError as e:
        # Permission donnée le 26/10 vers 14 h : Google peut mettre 24 h à l'appliquer
        if "(403)" in str(e) and dt.datetime.now(dt.timezone.utc) < dt.datetime(2026, 10, 27, 14, tzinfo=dt.timezone.utc):
            raise Pending("permission donnée le 26/10, Google l'applique sous 24 h") from e
        raise
    rows: list[tuple[str, dict]] = []
    for kind in ("traffic_source", "country"):
        for name in sorted(f for f in files if f.endswith(f"_{kind}.csv"))[-2:]:
            rows += [(kind, r) for r in google_play.bulk_report(name)]
    if not rows:
        raise RuntimeError("aucun rapport store_performance dans le dossier des rapports groupés")
    last = max(_col(r, "date") for _, r in rows)
    start = (dt.date.fromisoformat(last) - dt.timedelta(days=27)).isoformat()
    agg: dict[str, dict] = {}
    for kind, r in rows:
        if _col(r, "date") < start:
            continue
        if kind == "country":
            if _col(r, "country").upper() not in ("FR", "FRANCE"):
                continue
            name = "France (toutes sources)"
        else:
            src = _col(r, "traffic source") or "Autre"
            name = PLAY_SOURCES.get(src.lower(), src)
        a = agg.setdefault(name, {"source": name, "visiteurs": 0, "acquisitions": 0})
        a["visiteurs"] += int(_n(_col(r, "visitors")))
        a["acquisitions"] += int(_n(_col(r, "acquisitions")))
    out = sorted(agg.values(), key=lambda r: (r["source"].startswith("France"), -r["visiteurs"]))
    for r in out:
        r["conversion"] = round(r["acquisitions"] / r["visiteurs"], 4) if r["visiteurs"] else None
        r["du"], r["au"] = start, last
    return out



# ---------- Réseaux sociaux (Meta) ----------

def reseaux() -> list[dict]:
    """Abonnés de la Page Facebook et du compte Instagram ; portée, vues du profil et clics vers le site sur 28 jours."""
    now = int(dt.datetime.now(dt.timezone.utc).timestamp())
    fb = social.page_followers()
    ig = social.instagram_account()
    ins = social.instagram_insights(now - 28 * 86400, now)
    return [{"reseau": "Facebook", "abonnes": fb.get("followers_count"), "publications": None,
             "portee_28j": None, "vues_profil_28j": None, "clics_site_28j": None},
            {"reseau": "Instagram", "abonnes": ig.get("followers_count"), "publications": ig.get("media_count"),
             "portee_28j": ins.get("reach"), "vues_profil_28j": ins.get("profile_views"), "clics_site_28j": ins.get("website_clicks")}]

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
    ("Google Play : installations et visites de fiche", lambda: play_stats(),
     "Donner au compte claude-aso la permission « Voir les informations sur l'application et télécharger les rapports groupés » au niveau du compte (effet sous 24 h)", "https://play.google.com/console/u/0/developers/7410630646260977899/users-and-permissions"),
    ("App Store : fiche et avis", lambda: app_store.app(), "", ""),
    ("App Store : impressions et téléchargements", lambda: app_store_stats(),
     "Rien à faire : Apple produit les premiers rapports 1 à 2 jours après la demande (faite le 26/10)", "https://appstoreconnect.apple.com/access/integrations/api"),
    ("Stores : positions dans la recherche", lambda: store_search.ios_rank("fitmates"),
     "Autoriser itunes.apple.com et play.google.com dans le réseau de l'environnement", "https://code.claude.com/docs/en/cloud-environments#network-access"),
    ("Backend : sorties publiques", lambda: backend.public_events(), "", ""),
    ("Backend : inscriptions, actifs, participations", lambda: backend.metrics(d(2), d(1)),
     "Interface backend à préparer (agrégats, aucune donnée personnelle)", ""),
    ("Réseaux sociaux (Meta)", lambda: __import__("fitmates_mkt.sources.social", fromlist=["x"]).instagram_account(),
     "Autoriser graph.facebook.com dans le réseau de l'environnement (jetons déjà en place)", "https://code.claude.com/docs/en/cloud-environments#network-access"),
]


@_once
def acces() -> list[dict]:
    out = []
    for name, fn, todo, link in ACCESS:
        try:
            fn()
            out.append({"source": name, "etat": "ok", "a_faire": "", "lien": ""})
        except Pending as e:
            out.append({"source": name, "etat": "en attente", "a_faire": str(e), "lien": ""})
        except MissingAccess:
            out.append({"source": name, "etat": "manquant", "a_faire": todo, "lien": link})
        except Exception:  # noqa: BLE001
            out.append({"source": name, "etat": "bloqué", "a_faire": todo or "Voir docs/sources-de-donnees.md", "lien": link})
    return out


def actions() -> list[dict]:
    return json.loads((ROOT / "cockpit" / "actions.json").read_text())


CANAL_ACCES = {"Google Play": "Stores", "App Store": "Stores", "Stores": "Stores", "Backend": "App", "Réseaux": "Réseaux sociaux",
               "Site": "Site", "Google": "Google"}


def a_faire() -> list[dict]:
    """Actions ouvertes : la liste tenue dans cockpit/todo.json, plus un accès à ouvrir par source manquante."""
    items = [t for t in json.loads((ROOT / "cockpit" / "todo.json").read_text()) if t.get("statut") != "fait"]
    for r in acces():
        if r["etat"] not in ("ok", "en attente"):
            canal = next((v for k, v in CANAL_ACCES.items() if r["source"].startswith(k)), "Mesure")
            items.append({"id": "acces-" + r["source"], "qui": "Driss", "canal": canal, "priorite": 2,
                          "action": f"Ouvrir l'accès : {r['source']}", "impact": r["a_faire"], "lien": r["lien"], "statut": "à faire"})
    return sorted(items, key=lambda t: (t["priorite"], {"Driss": 0, "Google": 1, "Claude": 2}.get(t["qui"], 3)))


JOBS = {"ga4_jour": ga4_daily, "ga4_canaux": ga4_channels, "ga4_pages": ga4_pages, "ga4_evenements": ga4_events,
        "gsc_jour": gsc_daily, "gsc_requetes": gsc_queries, "gsc_pages": gsc_pages,
        "stores": stores, "app_store_stats": app_store_stats, "play_stats": play_stats, "reseaux": reseaux, "sorties": sorties, "listes_attente": listes_attente, "acces": acces, "actions": actions, "a_faire": a_faire}


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
