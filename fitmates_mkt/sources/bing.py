"""Bing Webmaster Tools : requêtes et pages qui font apparaître le site dans Bing.

Bing compte (décision du 02/11/2026) : la recherche web de ChatGPT et d'autres assistants s'appuie sur son index.
Accès : clé d'API Bing Webmaster (Paramètres ⚙ → API Access → API Key), dans BING_WEBMASTER_API_KEY.
La clé ne s'affiche jamais : les erreurs ne citent que le nom de la variable.
"""
import requests

from ..config import env, opt

API = "https://ssl.bing.com/webmaster/api.svc/json/"
HOW = ("clé d'API Bing Webmaster Tools (bing.com/webmasters → Paramètres → API Access → API Key) "
       "dans la variable BING_WEBMASTER_API_KEY")


def site_url() -> str:
    return opt("BING_SITE_URL", "https://www.fitmates.net/")


def _get(method: str) -> list[dict]:
    key = env("BING_WEBMASTER_API_KEY", HOW)
    r = requests.get(API + method, params={"apikey": key, "siteUrl": site_url()}, timeout=60)
    if r.status_code >= 400:  # ne jamais renvoyer l'URL complète : elle contient la clé
        raise RuntimeError(f"Bing Webmaster {method} : HTTP {r.status_code}")
    data = r.json()
    return data.get("d", data) if isinstance(data, dict) else data


def query_stats() -> list[dict]:
    """Requêtes Bing (fenêtre glissante fournie par Bing, par semaine)."""
    return _get("GetQueryStats")


def page_stats() -> list[dict]:
    return _get("GetPageStats")
