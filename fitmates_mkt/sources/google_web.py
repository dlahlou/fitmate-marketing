"""Google Search Console et Google Analytics 4 pour le site (canal SEO).

Accès, avec le même compte de service que les stores :
- Search Console : ajouter l'e-mail du compte de service comme utilisateur (lecture) de la propriété
  https://search.google.com/search-console/users ; API « Google Search Console API » activée dans fitmate-9bdfa.
- GA4 : ajouter l'e-mail comme « Lecteur » de la propriété (Admin → Gestion des accès à la propriété) ;
  API « Google Analytics Data API » activée ; renseigner GA4_PROPERTY_ID (numérique).
"""
import requests

from .. import google_auth
from ..config import MissingAccess, opt

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


def ga4_property_id() -> str:
    """GA4_PROPERTY_ID s'il est défini, sinon la seule propriété à laquelle le compte de service a accès."""
    if p := opt("GA4_PROPERTY_ID"):
        return p
    r = requests.get("https://analyticsadmin.googleapis.com/v1beta/accountSummaries", headers=google_auth.headers(GA), timeout=30)
    r.raise_for_status()
    props = [p["property"].split("/")[1] for a in r.json().get("accountSummaries", []) for p in a.get("propertySummaries", [])]
    if len(props) == 1:
        return props[0]
    raise MissingAccess(f"{len(props)} propriété(s) GA4 visible(s) par le compte de service : " + (HOW_GA4 if props else
        "ajouter claude-aso@fitmate-9bdfa.iam.gserviceaccount.com en Lecteur de la propriété GA4 du site (flux G-M9H3VR0TF7)"))


def ga4_report(start: str, end: str, dimensions: list[str], metrics: list[str], limit: int = 10000) -> list[dict]:
    prop = ga4_property_id()
    body = {"dateRanges": [{"startDate": start, "endDate": end}], "limit": limit,
            "dimensions": [{"name": d} for d in dimensions], "metrics": [{"name": m} for m in metrics]}
    r = requests.post(f"https://analyticsdata.googleapis.com/v1beta/properties/{prop}:runReport",
                      headers=google_auth.headers(GA), json=body, timeout=60)
    if not r.ok:
        raise RuntimeError(f"GA4 : {r.status_code} {r.text[:200]}")
    return [{**{d: v["value"] for d, v in zip(dimensions, row["dimensionValues"])},
             **{m: float(v["value"]) for m, v in zip(metrics, row["metricValues"])}}
            for row in r.json().get("rows", [])]


def url_inspection(url: str) -> dict:
    """État d'indexation d'une URL (Search Console, inspection d'URL) : coverageState, lastCrawlTime…"""
    r = requests.post("https://searchconsole.googleapis.com/v1/urlInspection/index:inspect", headers=google_auth.headers(GSC),
                      json={"inspectionUrl": url, "siteUrl": gsc_site(), "languageCode": "fr-FR"}, timeout=60)
    if not r.ok:
        raise RuntimeError(f"Inspection d'URL : {r.status_code} {r.text[:200]}")
    return r.json().get("inspectionResult", {}).get("indexStatusResult", {})
