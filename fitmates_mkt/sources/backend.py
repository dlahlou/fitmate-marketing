"""Backend Fitmates (Spring Boot + PostgreSQL) : données internes pour les analyses.

Trois niveaux d'accès, du plus simple au plus riche (contrat détaillé : docs/sources-de-donnees.md) :
1. Flux public des sorties (existe déjà, aucun secret) : celui qu'utilise le site.
2. Endpoint d'agrégats marketing, protégé par jeton (à créer côté backend) : inscriptions, actifs, sorties,
   participations, par jour, sport, zone et source d'acquisition. Uniquement des comptes, jamais de données personnelles.
3. Accès SQL en lecture seule (rôle Postgres dédié, idéalement sur un réplica) pour les analyses ad hoc.
"""
import requests

from ..config import env, opt

EVENTS_FEED_URL = opt("EVENTS_FEED_URL", "https://backend.fitmates.net/api/v1/events/public/events.json")
HOW_METRICS = ("URL et jeton de l'endpoint d'agrégats marketing (BACKEND_METRICS_URL, BACKEND_METRICS_TOKEN), "
               "à créer côté backend : voir docs/sources-de-donnees.md")
HOW_SQL = "chaîne de connexion d'un rôle Postgres en lecture seule (BACKEND_PG_READONLY_URL) : voir docs/sources-de-donnees.md"

# Champs qu'on ne garde jamais, même si le backend les envoie
PERSONAL_FIELDS = {"organizer", "organizer_name", "participants", "members", "email", "phone", "description", "photos"}


def public_events() -> list[dict]:
    h = {}
    if t := opt("EVENTS_FEED_TOKEN"):
        h["Authorization"] = f"Bearer {t}"
    r = requests.get(EVENTS_FEED_URL, headers=h, timeout=30)
    r.raise_for_status()
    data = r.json()
    events = data.get("events", data) if isinstance(data, dict) else data
    return [{k: v for k, v in e.items() if k not in PERSONAL_FIELDS} for e in events]


def metrics(date_from: str, date_to: str, granularity: str = "day") -> dict:
    url = env("BACKEND_METRICS_URL", HOW_METRICS)
    tok = env("BACKEND_METRICS_TOKEN", HOW_METRICS)
    r = requests.get(url, headers={"Authorization": f"Bearer {tok}"}, timeout=60,
                     params={"from": date_from, "to": date_to, "granularity": granularity})
    r.raise_for_status()
    return r.json()


def sql(query: str, params: tuple = ()) -> list[dict]:
    """Requête en lecture seule. Le rôle Postgres doit être en lecture seule ; on refuse aussi tout ce qui n'est pas un SELECT."""
    if not query.lstrip().lower().startswith(("select", "with")):
        raise ValueError("lecture seule : SELECT ou WITH uniquement")
    import psycopg  # optionnel : pip install "psycopg[binary]"
    with psycopg.connect(env("BACKEND_PG_READONLY_URL", HOW_SQL), autocommit=False) as conn:
        conn.execute("SET TRANSACTION READ ONLY")
        cur = conn.execute(query, params)
        cols = [c.name for c in cur.description]
        return [dict(zip(cols, row)) for row in cur.fetchall()]
