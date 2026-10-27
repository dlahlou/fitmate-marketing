"""Publie des posts préparés sur la Page Facebook et sur Instagram, et les note dans canaux/social/publications.json.

    python -m scripts.social_publish canaux/social/lancement.json              # aperçu, ne publie rien
    python -m scripts.social_publish canaux/social/lancement.json --publish --max 1

Ne publie que les posts que Driss a explicitement acceptés (canaux/social/accords.json).
Le fichier source est une liste de posts {"id", "fichier", "legende", "hashtags", "lien_utm"} ; "fichier" est relatif au
fichier source. Un post déjà noté dans publications.json n'est jamais republié. L'image passe d'abord par la Page
Facebook (qui la publie avec le lien cliquable), puis Instagram la reprend depuis l'adresse de l'image Facebook.
"""
import argparse
import datetime as dt
import json
from pathlib import Path

from fitmates_mkt.config import ROOT
from fitmates_mkt.sources import social

LOG = ROOT / "canaux" / "social" / "publications.json"
# Accords de Driss, post par post : {"<id>": {"date": "...", "message": "<ses mots>"}}. Sans accord, aucune publication.
ACCORDS = ROOT / "canaux" / "social" / "accords.json"


def captions(post: dict) -> tuple[str, str]:
    tags = " ".join(post.get("hashtags") or [])
    lien = post.get("lien_utm") or ""
    fb = f"{post['legende']}\n\n{lien.replace('utm_source=instagram', 'utm_source=facebook')}".strip()
    ig = f"{post['legende']}\n\n{tags}".strip()
    return fb, ig


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("source")
    ap.add_argument("--publish", action="store_true", help="publier pour de vrai (sinon aperçu)")
    ap.add_argument("--max", type=int, default=1, help="nombre de posts à publier dans ce lancement")
    ap.add_argument("--ids", nargs="*", help="publier seulement ces posts")
    a = ap.parse_args()

    src = Path(a.source)
    posts = json.loads(src.read_text())
    log = json.loads(LOG.read_text()) if LOG.exists() else []
    done = {p["id"] for p in log}
    todo = [p for p in posts if p["id"] not in done and (not a.ids or p["id"] in a.ids)][: a.max]
    if not todo:
        print("Rien à publier.")
    accords = json.loads(ACCORDS.read_text()) if ACCORDS.exists() else {}
    if a.publish:
        sans = [p["id"] for p in todo if p["id"] not in accords]
        if sans:
            raise SystemExit(f"Publication refusée : pas d'accord de Driss pour {', '.join(sans)} (canaux/social/accords.json)")
    for p in todo:
        img = (src.parent / p["fichier"]).resolve()
        fb_cap, ig_cap = captions(p)
        if not a.publish:
            print(f"APERÇU  {p['id']} ({img.name}, {len(ig_cap)} caractères)")
            continue
        fb = social.facebook_photo(str(img), fb_cap)
        ig_id = social.instagram_photo(fb["image_url"], ig_cap)
        log.append({"id": p["id"], "source": str(src.relative_to(ROOT)) if src.is_absolute() else str(src),
                    "date": dt.datetime.now(dt.timezone.utc).isoformat(timespec="seconds"),
                    "facebook_post": fb["post_id"] or fb["id"], "instagram_media": ig_id})
        LOG.write_text(json.dumps(log, ensure_ascii=False, indent=1) + "\n")
        print(f"PUBLIÉ  {p['id']} : Facebook et Instagram")


if __name__ == "__main__":
    main()
