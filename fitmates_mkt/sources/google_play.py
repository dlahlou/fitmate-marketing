"""Google Play : fiche (API Android Publisher), avis, qualité (Reporting API) et statistiques de fiche (rapports groupés).

Accès : compte de service invité dans Play Console (https://play.google.com/console/users-and-permissions).
"""
import csv
import io

import requests

from .. import google_auth
from ..config import PLAY_PACKAGE, opt

PUB = "https://www.googleapis.com/auth/androidpublisher"
REP = "https://www.googleapis.com/auth/playdeveloperreporting"
GCS = "https://www.googleapis.com/auth/devstorage.read_only"
BASE = f"https://androidpublisher.googleapis.com/androidpublisher/v3/applications/{PLAY_PACKAGE}"
HOW_BUCKET = ("URI des rapports groupés : Play Console → Télécharger des rapports → Statistiques → "
              "« Copier l'URI Cloud Storage » (gs://pubsite_prod_rev_…), à mettre dans PLAY_REPORTS_BUCKET")


class Edit:
    """Contexte d'édition : sans commit explicite, l'édition est supprimée (rien n'est publié)."""

    def __init__(self, commit: bool = False):
        self.commit = commit

    def __enter__(self):
        self.h = google_auth.headers(PUB)
        r = requests.post(f"{BASE}/edits", headers=self.h, timeout=30)
        r.raise_for_status()
        self.id = r.json()["id"]
        return self

    def get(self, path: str):
        r = requests.get(f"{BASE}/edits/{self.id}/{path}", headers=self.h, timeout=30)
        r.raise_for_status()
        return r.json()

    def put(self, path: str, body: dict):
        r = requests.put(f"{BASE}/edits/{self.id}/{path}", headers=self.h, json=body, timeout=30)
        if not r.ok:
            raise RuntimeError(f"PUT {path} : {r.status_code} {r.text[:300]}")
        return r.json()

    def patch(self, path: str, body: dict):
        r = requests.patch(f"{BASE}/edits/{self.id}/{path}", headers=self.h, json=body, timeout=30)
        if not r.ok:
            raise RuntimeError(f"PATCH {path} : {r.status_code} {r.text[:300]}")
        return r.json()

    def __exit__(self, exc_type, *_):
        if self.commit and exc_type is None:
            v = requests.post(f"{BASE}/edits/{self.id}:validate", headers=self.h, timeout=30)
            if not v.ok:
                raise RuntimeError(f"validation refusée : {v.text[:300]}")
            c = requests.post(f"{BASE}/edits/{self.id}:commit", headers=self.h, timeout=60)
            if not c.ok:
                raise RuntimeError(f"commit refusé : {c.text[:300]}")
        else:
            requests.delete(f"{BASE}/edits/{self.id}", headers=self.h, timeout=30)


def listings() -> dict:
    with Edit() as e:
        out = {l["language"]: l for l in e.get("listings").get("listings", [])}
        for lang in out:
            out[lang]["images"] = {t: len(e.get(f"listings/{lang}/{t}").get("images", []))
                                   for t in ("phoneScreenshots", "tenInchScreenshots", "featureGraphic")}
        return out


def reviews() -> list[dict]:
    """Avis des 7 derniers jours (limite de l'API). Nom de l'auteur retiré."""
    r = requests.get(f"{BASE}/reviews", headers=google_auth.headers(PUB), params={"maxResults": 100}, timeout=30)
    r.raise_for_status()
    out = []
    for rv in r.json().get("reviews", []):
        c = rv["comments"][0].get("userComment", {})
        out.append({"id": rv["reviewId"], "rating": c.get("starRating"), "text": c.get("text", "").strip(),
                    "lang": c.get("reviewerLanguage"), "date": c.get("lastModified", {}).get("seconds")})
    return out


def reporting(metric_set: str = "crashRateMetricSet") -> dict:
    r = requests.get(f"https://playdeveloperreporting.googleapis.com/v1beta1/apps/{PLAY_PACKAGE}/{metric_set}",
                     headers=google_auth.headers(REP), timeout=30)
    r.raise_for_status()
    return r.json()


def _bucket() -> str:
    # Adresse du dossier des rapports groupés de la Play Console (pas un secret), surchargeable par PLAY_REPORTS_BUCKET
    return (opt("PLAY_REPORTS_BUCKET") or "gs://pubsite_prod_7410630646260977899").removeprefix("gs://").split("/")[0]


def bulk_report_files(prefix: str = "stats/store_performance/") -> list[str]:
    r = requests.get(f"https://storage.googleapis.com/storage/v1/b/{_bucket()}/o", headers=google_auth.headers(GCS),
                     params={"prefix": prefix}, timeout=30)
    if not r.ok:
        raise RuntimeError(f"lecture du bucket refusée ({r.status_code}) : {r.text[:200]}")
    return [o["name"] for o in r.json().get("items", []) if PLAY_PACKAGE in o["name"]]


def bulk_report(name: str) -> list[dict]:
    """Rapports CSV mensuels (UTF-16) : store_performance (visiteurs, acquisitions par pays et par source de trafic),
    installs, ratings…"""
    r = requests.get(f"https://storage.googleapis.com/storage/v1/b/{_bucket()}/o/{requests.utils.quote(name, safe='')}",
                     headers=google_auth.headers(GCS), params={"alt": "media"}, timeout=60)
    r.raise_for_status()
    return list(csv.DictReader(io.StringIO(r.content.decode("utf-16"))))
