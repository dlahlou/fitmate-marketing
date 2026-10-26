"""Réseaux sociaux : statistiques (lecture) de la Page Facebook, d'Instagram et de Threads.

La publication passe par n8n (canaux/social/n8n). Ici, uniquement la mesure.
Accès : jeton de Page longue durée avec pages_read_engagement, instagram_manage_insights, threads_manage_insights
(https://developers.facebook.com/tools/explorer/).
"""
import requests

from ..config import env, opt

HOW = "jetons et identifiants Meta (FB_PAGE_ID, FB_PAGE_TOKEN, IG_USER_ID, THREADS_USER_ID, THREADS_TOKEN) : voir docs/sources-de-donnees.md"


def _graph() -> str:
    return f"https://graph.facebook.com/{opt('META_GRAPH_VERSION', 'v24.0')}"


def instagram_account() -> dict:
    r = requests.get(f"{_graph()}/{env('IG_USER_ID', HOW)}", timeout=30,
                     params={"fields": "followers_count,media_count", "access_token": env("FB_PAGE_TOKEN", HOW)})
    r.raise_for_status()
    return r.json()


def instagram_insights(since: int, until: int, metrics=("reach", "profile_views", "website_clicks")) -> dict:
    r = requests.get(f"{_graph()}/{env('IG_USER_ID', HOW)}/insights", timeout=30, params={
        "metric": ",".join(metrics), "period": "day", "metric_type": "total_value", "since": since, "until": until,
        "access_token": env("FB_PAGE_TOKEN", HOW)})
    r.raise_for_status()
    return {m["name"]: m.get("total_value", {}).get("value") for m in r.json().get("data", [])}


def page_followers() -> dict:
    r = requests.get(f"{_graph()}/{env('FB_PAGE_ID', HOW)}", timeout=30,
                     params={"fields": "followers_count,fan_count", "access_token": env("FB_PAGE_TOKEN", HOW)})
    r.raise_for_status()
    return r.json()


def threads_insights(since: int, until: int) -> dict:
    r = requests.get(f"https://graph.threads.net/v1.0/{env('THREADS_USER_ID', HOW)}/threads_insights", timeout=30, params={
        "metric": "views,likes,followers_count", "since": since, "until": until, "access_token": env("THREADS_TOKEN", HOW)})
    r.raise_for_status()
    return {m["name"]: m.get("total_value", {}).get("value", m.get("values")) for m in r.json().get("data", [])}
