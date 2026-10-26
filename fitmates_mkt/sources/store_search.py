"""Positions de Fitmates dans la recherche des stores, sur les requêtes cibles.

Approximation publique : iTunes Search API (App Store) et page de recherche Play. Hôtes à autoriser dans le réseau :
itunes.apple.com, play.google.com.
"""
import re
import time

import requests

from ..config import IOS_APP_ID, PLAY_PACKAGE

UA = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124 Safari/537.36",
      "Accept-Language": "fr-FR,fr;q=0.9"}

KEYWORDS_FR = ["randonnée", "randonnée groupe", "rando", "application randonnée", "sortie randonnée", "partenaire sport",
               "sport à plusieurs", "sortie sport", "sport entre amis", "faire des amis", "se faire des amis",
               "rencontrer des gens", "padel", "partenaire padel", "running", "run club", "course à pied", "trail",
               "marche", "groupe de marche", "escalade", "vélo", "meetup", "fitmates"]


def ios_rank(term: str, country: str = "fr") -> int | None:
    r = requests.get("https://itunes.apple.com/search", timeout=30,
                     params={"term": term, "country": country, "entity": "software", "limit": 200})
    r.raise_for_status()
    ids = [x["trackId"] for x in r.json().get("results", [])]
    return ids.index(int(IOS_APP_ID)) + 1 if int(IOS_APP_ID) in ids else None


def play_rank(term: str, gl: str = "FR", hl: str = "fr") -> int | None:
    r = requests.get("https://play.google.com/store/search", headers=UA, timeout=30,
                     params={"q": term, "c": "apps", "hl": hl, "gl": gl})
    r.raise_for_status()
    seen: list[str] = []
    for m in re.findall(r"details\?id=([A-Za-z0-9._]+)", r.text):
        if m not in seen:
            seen.append(m)
    return seen.index(PLAY_PACKAGE) + 1 if PLAY_PACKAGE in seen else None


def ranks(keywords=KEYWORDS_FR, pause: float = 1.0) -> dict:
    out = {"ios": {}, "android": {}}
    for k in keywords:
        out["ios"][k] = ios_rank(k)
        out["android"][k] = play_rank(k)
        time.sleep(pause)
    return out


def ios_public_rating(country: str = "fr") -> dict:
    r = requests.get("https://itunes.apple.com/lookup", params={"id": IOS_APP_ID, "country": country}, timeout=30)
    r.raise_for_status()
    res = r.json().get("results") or [{}]
    return {"avg": res[0].get("averageUserRating"), "count": res[0].get("userRatingCount")}
