"""Publie des posts préparés sur la Page Facebook et sur Instagram, et les note dans canaux/social/publications.json.

    python -m scripts.social_publish canaux/social/lancement.json              # aperçu, ne publie rien
    python -m scripts.social_publish canaux/social/lancement.json --publish --max 1

Ne publie que les posts que Driss a explicitement acceptés (canaux/social/accords.json).
Le fichier source est une liste de posts {"id", "fichier", "legende", "hashtags", "lien_utm"} ; "fichier" est relatif au
fichier source. Un post qui a un champ "fichiers" de plus d'une image (2 à 10, relatifs au fichier source) part en
carrousel : photos déposées sans publication puis un seul post Facebook, et un carrousel Instagram. Un post déjà noté dans publications.json n'est jamais republié. L'image passe d'abord par la Page
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


def images(src: Path, post: dict) -> list[Path]:
    """Images du post, dans l'ordre : "fichiers" s'il en compte plus d'une (carrousel), sinon "fichier"."""
    fichiers = post.get("fichiers") or []
    noms = fichiers if len(fichiers) > 1 else [post.get("fichier") or fichiers[0]]
    chemins = [(src.parent / f).resolve() for f in noms]
    manquants = [str(c) for c in chemins if not c.is_file()]
    if manquants:
        raise SystemExit(f"Image introuvable pour {post['id']} : {', '.join(manquants)}")
    if len(chemins) > social.CARROUSEL_MAX:
        raise SystemExit(f"{post['id']} : {len(chemins)} images, un carrousel en accepte {social.CARROUSEL_MAX} au plus")
    return chemins


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
        imgs = images(src, p)
        fb_cap, ig_cap = captions(p)
        if not a.publish:
            forme = f"carrousel de {len(imgs)} images" if len(imgs) > 1 else imgs[0].name
            print(f"APERÇU  {p['id']} ({forme}, {len(ig_cap)} caractères)")
            continue
        if len(imgs) > 1:
            fb = social.facebook_carrousel([str(i) for i in imgs], fb_cap)
            ig_id = social.instagram_carrousel(fb["image_urls"], ig_cap)
            fb_post = fb["post_id"]
        else:
            fb = social.facebook_photo(str(imgs[0]), fb_cap)
            ig_id = social.instagram_photo(fb["image_url"], ig_cap)
            fb_post = fb["post_id"] or fb["id"]
        log.append({"id": p["id"], "source": str(src.relative_to(ROOT)) if src.is_absolute() else str(src),
                    "date": dt.datetime.now(dt.timezone.utc).isoformat(timespec="seconds"),
                    "facebook_post": fb_post, "instagram_media": ig_id, "images": len(imgs)})
        LOG.write_text(json.dumps(log, ensure_ascii=False, indent=1) + "\n")
        print(f"PUBLIÉ  {p['id']} : Facebook et Instagram" + (f" (carrousel de {len(imgs)})" if len(imgs) > 1 else ""))


if __name__ == "__main__":
    main()
