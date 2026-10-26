"""Compare les fiches stores en ligne avec canaux/aso/fiches/*.json, et les applique sur demande explicite.

    python -m scripts.aso_listings                    # diff seulement (défaut, rien n'est modifié)
    python -m scripts.aso_listings --apply play       # publie les fiches Google Play (fr-FR, en-GB)
    python -m scripts.aso_listings --apply ios        # remplit la version iOS en préparation (description, mots-clés, promo)
    python -m scripts.aso_listings --apply ios-promo  # texte promotionnel de la version en ligne (effet immédiat)

Règle : aucune modification sans l'accord explicite de Driss. Le titre / nom de l'app et le sous-titre iOS ne sont
jamais modifiés par ce script. Côté Apple, nom, sous-titre et mots-clés ne changent
qu'avec une nouvelle version ; le texte promotionnel change à tout moment.
"""
import argparse
import json

from fitmates_mkt.config import ROOT
from fitmates_mkt.sources import app_store, google_play

FICHES = ROOT / "canaux" / "aso" / "fiches"
PLAY_LANGS = {"fr-FR": "fr-FR", "en-GB": "en"}
IOS_LANGS = {"fr-FR": "fr-FR", "en-US": "en"}
LIMITS = {"ios_subtitle": 30, "ios_keywords": 100, "ios_promotional_text": 170,
          "play_short_description": 80, "description": 4000}


def fiche(name: str) -> dict:
    f = json.loads((FICHES / f"{name}.json").read_text())
    for k, lim in LIMITS.items():
        assert len(f[k]) <= lim, f"{name}.{k} : {len(f[k])} > {lim}"
    return f


def show(label: str, live, want) -> None:
    mark = "=" if (live or "") == want else "≠"
    print(f"  {mark} {label}: {str(live)[:70]!r} → {want[:70]!r}" if mark == "≠" else f"  = {label}")


def diff() -> None:
    live = google_play.listings()
    for lang, name in PLAY_LANGS.items():
        f, l = fiche(name), live.get(lang, {})
        print(f"Play {lang}{' (absente)' if not l else ''}")
        show("courte", l.get("shortDescription"), f["play_short_description"])
        show("description", l.get("fullDescription"), f["description"])
    for v in app_store.versions():
        st = v["attributes"]["appStoreState"]
        locs = app_store.version_localizations(v["id"])
        print(f"iOS {v['attributes']['versionString']} ({st})")
        for loc, name in IOS_LANGS.items():
            f, l = fiche(name), locs.get(loc, {}).get("attributes", {})
            print(f" {loc}{' (absente)' if not l else ''}")
            show("mots-clés", l.get("keywords"), f["ios_keywords"])
            show("promo", l.get("promotionalText"), f["ios_promotional_text"])
            show("description", l.get("description"), f["description"])
        if st == "READY_FOR_SALE":
            break


def apply_play() -> None:
    with google_play.Edit(commit=True) as e:
        for lang, name in PLAY_LANGS.items():
            f = fiche(name)
            # Jamais le titre : PATCH limité aux descriptions (le titre existant est conservé)
            e.patch(f"listings/{lang}", {"shortDescription": f["play_short_description"], "fullDescription": f["description"]})
            print(f"Play {lang} : mis à jour")


def _patch_or_create(kind: str, existing: dict | None, attrs: dict, rel: str, parent_type: str, parent_id: str, locale: str) -> None:
    if existing:
        app_store.call("PATCH", f"/{kind}/{existing['id']}", json={"data": {"type": kind, "id": existing["id"], "attributes": attrs}})
    else:
        app_store.call("POST", f"/{kind}", json={"data": {"type": kind, "attributes": {"locale": locale, **attrs},
                                                          "relationships": {rel: {"data": {"type": parent_type, "id": parent_id}}}}})


def apply_ios() -> None:
    draft = [v for v in app_store.versions() if v["attributes"]["appStoreState"] in
             ("PREPARE_FOR_SUBMISSION", "DEVELOPER_REJECTED", "REJECTED", "METADATA_REJECTED")]
    if not draft:
        raise SystemExit("Aucune version iOS en préparation : en créer une (numéro du prochain build) avant d'appliquer.")
    vid = draft[0]["id"]
    locs = app_store.version_localizations(vid)
    support = next(iter(locs.values()))["attributes"].get("supportUrl")
    for loc, name in IOS_LANGS.items():
        f = fiche(name)
        attrs = {"description": f["description"], "keywords": f["ios_keywords"], "promotionalText": f["ios_promotional_text"],
                 "marketingUrl": "https://www.fitmates.net", "supportUrl": support}
        _patch_or_create("appStoreVersionLocalizations", locs.get(loc), attrs, "appStoreVersion", "appStoreVersions", vid, loc)
    print(f"iOS {draft[0]['attributes']['versionString']} : descriptions, mots-clés et promo remplis (nom et sous-titre inchangés)")


def apply_ios_promo() -> None:
    live = [v for v in app_store.versions() if v["attributes"]["appStoreState"] == "READY_FOR_SALE"][0]
    for loc, l in app_store.version_localizations(live["id"]).items():
        name = IOS_LANGS.get(loc)
        if name:
            app_store.call("PATCH", f"/appStoreVersionLocalizations/{l['id']}", json={"data": {
                "type": "appStoreVersionLocalizations", "id": l["id"], "attributes": {"promotionalText": fiche(name)["ios_promotional_text"]}}})
            print(f"iOS promo {loc} : en ligne")


def main() -> None:
    p = argparse.ArgumentParser()
    p.add_argument("--apply", choices=["play", "ios", "ios-promo"])
    a = p.parse_args()
    {"play": apply_play, "ios": apply_ios, "ios-promo": apply_ios_promo, None: diff}[a.apply]()


if __name__ == "__main__":
    main()
