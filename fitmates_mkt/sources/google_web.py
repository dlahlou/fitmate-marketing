"""Google Search Console et Google Analytics 4 pour le site (canal SEO).

Accès, avec le même compte de service que les stores :
- Search Console : ajouter l'e-mail du compte de service comme utilisateur (lecture) de la propriété
  https://search.google.com/search-console/users ; API « Google Search Console API » activée dans fitmate-9bdfa.
- GA4 : ajouter l'e-mail comme « Lecteur » de la propriété (Admin → Gestion des accès à la propriété) ;
  API « Google Analytics Data API » activée ; renseigner GA4_PROPERTY_ID (numérique).
"""
import requests

from .. import google_auth
from ..config import env, opt

GSC = "https://www.googleapis.com/auth/webmasters.readonly"
GA = "https://www.googleapis.com/auth/analytics.readonly"
HOW_GA4 = "identifiant numérique de la propriété GA4 (Admin → Détails de la propriété), dans GA4_PROPERTY_ID"


def gsc_site() -> str:
    return opt("GSC_SITE", "sc-domain:fitmates.net")


def search_analytics(start: str, end: str, dimensions=("query",), row_limit: int = 1000, filters: list | None = None) -> list[dict]:
    body = {"startDate": start, "endDate": end, "dimensions": list(dimensions), "rowLimit": row_limit}
    if filters:
        body["dimensionFilterGroups"] = [{"filters": filters}]
    site = requests.utils.quote(gsc_site(), safe="")
    r = requests.post(f"https://www.googleapis.com/webmasters/v3/sites/{site}/searchAnalytics/query",
                      headers=google_auth.headers(GSC), json=body, timeout=60)
    if not r.ok:
        raise RuntimeError(f"Search Console : {r.status_code} {r.text[:200]}")
    return [{**dict(zip(dimensions, x["keys"])), **{k: x[k] for k in ("clicks", "impressions", "ctr", "position")}}
            for x in r.json().get("rows", [])]


def ga4_report(start: str, end: str, dimensions: list[str], metrics: list[str], limit: int = 10000) -> list[dict]:
    prop = env("GA4_PROPERTY_ID", HOW_GA4)
    body = {"dateRanges": [{"startDate": start, "endDate": end}], "limit": limit,
            "dimensions": [{"name": d} for d in dimensions], "metrics": [{"name": m} for m in metrics]}
    r = requests.post(f"https://analyticsdata.googleapis.com/v1beta/properties/{prop}:runReport",
                      headers=google_auth.headers(GA), json=body, timeout=60)
    if not r.ok:
        raise RuntimeError(f"GA4 : {r.status_code} {r.text[:200]}")
    return [{**{d: v["value"] for d, v in zip(dimensions, row["dimensionValues"])},
             **{m: float(v["value"]) for m, v in zip(metrics, row["metricValues"])}}
            for row in r.json().get("rows", [])]
