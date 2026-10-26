"""Jeton OAuth Google à partir d'un compte de service (JWT RS256), sans dépendance google-auth."""
import base64
import json
import time

import jwt
import requests

from .config import env

HOW = ("clé JSON du compte de service en base64 (Google Cloud fitmate-9bdfa → IAM → Comptes de service : "
       "https://console.cloud.google.com/iam-admin/serviceaccounts?project=fitmate-9bdfa)")

_cache: dict[str, tuple[str, float]] = {}


def service_account() -> dict:
    raw = env("GOOGLE_SERVICE_ACCOUNT_B64", HOW, "PLAY_SERVICE_ACCOUNT_B64")
    return json.loads(base64.b64decode(raw))


def token(*scopes: str) -> str:
    key = " ".join(sorted(scopes))
    hit = _cache.get(key)
    if hit and hit[1] > time.time() + 60:
        return hit[0]
    sa = service_account()
    now = int(time.time())
    assertion = jwt.encode(
        {"iss": sa["client_email"], "scope": " ".join(scopes), "aud": "https://oauth2.googleapis.com/token",
         "iat": now, "exp": now + 3600},
        sa["private_key"], algorithm="RS256")
    r = requests.post("https://oauth2.googleapis.com/token", timeout=30, data={
        "grant_type": "urn:ietf:params:oauth:grant-type:jwt-bearer", "assertion": assertion})
    if r.status_code != 200:
        raise RuntimeError(f"OAuth Google refusé ({r.status_code}) : {r.text[:200]}")
    tok = r.json()["access_token"]
    _cache[key] = (tok, now + 3600)
    return tok


def headers(*scopes: str) -> dict:
    return {"Authorization": f"Bearer {token(*scopes)}"}
