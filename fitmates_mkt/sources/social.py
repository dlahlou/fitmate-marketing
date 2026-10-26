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


# ---------- Publication (jeton de Page : pages_manage_posts, instagram_content_publish) ----------

def _check(r: requests.Response) -> dict:
    if not r.ok:
        # Le message d'erreur Meta ne contient jamais le jeton ; on ne renvoie pas l'URL de la requête
        raise RuntimeError(f"Meta {r.status_code} : {r.text[:300]}")
    return r.json()


def facebook_photo(path: str, caption: str, published: bool = True) -> dict:
    """Publie (ou dépose sans publier) une image sur la Page. Renvoie {"id", "post_id", "image_url"}."""
    with open(path, "rb") as f:
        d = _check(requests.post(f"{_graph()}/{env('FB_PAGE_ID', HOW)}/photos", timeout=120, files={"source": f},
                                 data={"caption": caption, "published": str(published).lower(),
                                       "access_token": env("FB_PAGE_TOKEN", HOW)}))
    img = _check(requests.get(f"{_graph()}/{d['id']}", timeout=30,
                              params={"fields": "images", "access_token": env("FB_PAGE_TOKEN", HOW)}))
    return {"id": d["id"], "post_id": d.get("post_id"), "image_url": max(img["images"], key=lambda i: i["width"])["source"]}


def instagram_photo(image_url: str, caption: str) -> str:
    """Publie une image (URL publique) sur Instagram ; renvoie l'identifiant du média publié."""
    import time
    tok = env("FB_PAGE_TOKEN", HOW)
    ig = env("IG_USER_ID", HOW)
    c = _check(requests.post(f"{_graph()}/{ig}/media", timeout=60,
                             data={"image_url": image_url, "caption": caption, "access_token": tok}))["id"]
    for _ in range(30):
        st = _check(requests.get(f"{_graph()}/{c}", timeout=30, params={"fields": "status_code", "access_token": tok}))
        if st.get("status_code") == "FINISHED":
            break
        if st.get("status_code") == "ERROR":
            raise RuntimeError(f"Instagram a refusé l'image : {st}")
        time.sleep(4)
    return _check(requests.post(f"{_graph()}/{ig}/media_publish", timeout=60,
                                data={"creation_id": c, "access_token": tok}))["id"]


def instagram_media(limit: int = 25) -> list[dict]:
    """Dernières publications Instagram avec leurs compteurs (likes, commentaires)."""
    r = requests.get(f"{_graph()}/{env('IG_USER_ID', HOW)}/media", timeout=30, params={
        "fields": "id,timestamp,like_count,comments_count,permalink", "limit": limit,
        "access_token": env("FB_PAGE_TOKEN", HOW)})
    r.raise_for_status()
    return r.json().get("data", [])
