"""App Store Connect : fiche (nom, sous-titre, mots-clés, description, promo), avis et App Analytics.

Accès : clé API (https://appstoreconnect.apple.com/access/integrations/api).
- Rôle App Manager : fiche et avis.
- Rôle Admin : nécessaire pour les rapports App Analytics (impressions, pages vues, téléchargements, source).
"""
import base64
import gzip
import io
import csv
import time

import jwt
import requests

from ..config import IOS_APP_ID, env

API = "https://api.appstoreconnect.apple.com/v1"
HOW = "clé API App Store Connect (ASC_ISSUER_ID, ASC_KEY_ID, ASC_PRIVATE_KEY_B64) : https://appstoreconnect.apple.com/access/integrations/api"


def _token() -> str:
    raw = env("ASC_PRIVATE_KEY_B64", HOW)
    key = base64.b64decode(raw).decode()
    if "BEGIN" not in key:
        key = f"-----BEGIN PRIVATE KEY-----\n{raw}\n-----END PRIVATE KEY-----\n"
    now = int(time.time())
    return jwt.encode({"iss": env("ASC_ISSUER_ID", HOW), "iat": now, "exp": now + 1100, "aud": "appstoreconnect-v1"},
                      key, algorithm="ES256", headers={"kid": env("ASC_KEY_ID", HOW), "typ": "JWT"})


def call(method: str, path: str, **kw) -> dict:
    url = path if path.startswith("http") else API + path
    r = requests.request(method, url, headers={"Authorization": f"Bearer {_token()}"}, timeout=60, **kw)
    if not r.ok:
        raise RuntimeError(f"{method} {path.split('?')[0]} : {r.status_code} {r.text[:300]}")
    return r.json() if r.content else {}


def app() -> dict:
    return call("GET", f"/apps/{IOS_APP_ID}")["data"]["attributes"]


def versions() -> list[dict]:
    return call("GET", f"/apps/{IOS_APP_ID}/appStoreVersions", params={"limit": 20})["data"]


def version_localizations(version_id: str) -> dict[str, dict]:
    return {l["attributes"]["locale"]: l for l in call("GET", f"/appStoreVersions/{version_id}/appStoreVersionLocalizations")["data"]}


def app_infos() -> list[dict]:
    return call("GET", f"/apps/{IOS_APP_ID}/appInfos")["data"]


def app_info_localizations(info_id: str) -> dict[str, dict]:
    return {l["attributes"]["locale"]: l for l in call("GET", f"/appInfos/{info_id}/appInfoLocalizations")["data"]}


def reviews(limit: int = 200) -> list[dict]:
    """Avis clients, pseudo retiré."""
    d = call("GET", f"/apps/{IOS_APP_ID}/customerReviews", params={"limit": limit, "sort": "-createdDate"})["data"]
    return [{"id": x["id"], "rating": x["attributes"]["rating"], "title": x["attributes"].get("title"),
             "text": x["attributes"].get("body"), "territory": x["attributes"].get("territory"),
             "date": x["attributes"].get("createdDate")} for x in d]


# ---------- App Analytics (clé Admin) ----------

def ensure_analytics_request() -> str:
    """Crée (une fois) la demande de rapports ONGOING ; Apple produit ensuite les rapports chaque jour."""
    existing = call("GET", f"/apps/{IOS_APP_ID}/analyticsReportRequests")["data"]
    for r in existing:
        if r["attributes"]["accessType"] == "ONGOING" and not r["attributes"].get("stoppedDueToInactivity"):
            return r["id"]
    body = {"data": {"type": "analyticsReportRequests", "attributes": {"accessType": "ONGOING"},
                     "relationships": {"app": {"data": {"type": "apps", "id": IOS_APP_ID}}}}}
    return call("POST", "/analyticsReportRequests", json=body)["data"]["id"]


def analytics_reports(request_id: str, category: str = "APP_STORE_ENGAGEMENT") -> list[dict]:
    return call("GET", f"/analyticsReportRequests/{request_id}/reports", params={"filter[category]": category})["data"]


def analytics_rows(report_id: str, granularity: str = "DAILY", limit_instances: int = 31) -> list[dict]:
    rows: list[dict] = []
    inst = call("GET", f"/analyticsReports/{report_id}/instances",
                params={"filter[granularity]": granularity, "limit": limit_instances})["data"]
    for i in inst:
        for seg in call("GET", f"/analyticsReportInstances/{i['id']}/segments")["data"]:
            raw = requests.get(seg["attributes"]["url"], timeout=120).content
            rows += list(csv.DictReader(io.StringIO(gzip.decompress(raw).decode()), delimiter="\t"))
    return rows
