"""Vérifie les actions que Driss a marquées « fait » dans le cockpit.

    python -m scripts.verifier etat.json      # etat.json : réponse de GET https://fitmate-cockpit.vercel.app/api/etat

Pour chaque action déclarée faite depuis la dernière vérification, une preuve est cherchée dans la source concernée
(Instagram, Search Console, App Store, flux du backend…). Résultat dans cockpit/verifications.json :
- « ok » : l'action passe à « fait » dans cockpit/todo.json ;
- « en attente » : c'est fait de ton côté mais le résultat n'est pas encore visible (Google, Apple) : on revérifie ;
- « échec » : rien ne le montre, l'action reste ouverte avec la raison ;
- « déclaré » : aucune source ne permet de vérifier, l'action est close sur ta déclaration.
"""
import datetime as dt
import json
import sys

import requests

from fitmates_mkt.config import ROOT, env
from fitmates_mkt.sources import app_store, backend, google_web, social

TODO = ROOT / "cockpit" / "todo.json"
VERIF = ROOT / "cockpit" / "verifications.json"
DECISIONS = ROOT / "cockpit" / "decisions.json"  # actions écartées par Driss, relues par le pilotage avant de créer des tâches


def _ig_profile() -> dict:
    r = requests.get(f"{social._graph()}/{env('IG_USER_ID', social.HOW)}", timeout=30, params={
        "fields": "biography,website,profile_picture_url", "access_token": env("FB_PAGE_TOKEN", social.HOW)})
    r.raise_for_status()
    return r.json()


def ig_bio(_):
    p = _ig_profile()
    manque = [n for n, ok in (("la bio", p.get("biography")), ("le lien", "fitmates.net" in (p.get("website") or "")),
                              ("la photo", p.get("profile_picture_url"))) if not ok]
    return ("échec", f"il manque {', '.join(manque)} sur le profil Instagram") if manque else ("ok", "bio, lien et photo présents")


def gsc_index(_):
    out = []
    for u in ("https://www.fitmates.net/sport/randonnee", "https://www.fitmates.net/randonnee/autour-de-paris"):
        r = google_web.url_inspection(u)
        out.append((u.split("fitmates.net")[1], r.get("verdict") == "PASS", r.get("coverageState")))
    if all(ok for _, ok, _ in out):
        return "ok", " ; ".join(f"{p} : {c}" for p, _, c in out)
    return "en attente", " ; ".join(f"{p} : {c}" for p, _, c in out) + " (Google peut mettre quelques jours)"


def ios_build(_):
    v = next((x for x in app_store.versions() if x["attributes"]["versionString"] == "1.1.16"), None)
    if not v:
        return "échec", "aucune version 1.1.16 dans App Store Connect"
    st = v["attributes"].get("appStoreState") or v["attributes"].get("appVersionState")
    if st in ("PREPARE_FOR_SUBMISSION", "DEVELOPER_REJECTED"):
        return "échec", f"la version 1.1.16 est encore à l'état {st} (pas soumise)"
    if st in ("READY_FOR_SALE", "READY_FOR_DISTRIBUTION"):
        return "ok", "1.1.16 en ligne"
    return "en attente", f"1.1.16 soumise, état Apple : {st}"


def backend_prix(_):
    evs = backend.public_events()
    sans = sum(1 for e in evs if "price_eur" not in e)
    return ("ok", f"price_eur présent sur les {len(evs)} sorties du flux") if not sans else \
        ("échec", f"{sans} sortie(s) du flux sans price_eur")


def acces_backend(_):
    backend.metrics((dt.date.today() - dt.timedelta(days=2)).isoformat(), dt.date.today().isoformat())
    return "ok", "l'endpoint d'agrégats répond"


def reseau_sources(_):
    r = requests.get("https://rando.pnr-idf.fr/", timeout=20)
    return ("ok", "les sites de randonnée sont joignables") if r.ok else ("échec", f"rando.pnr-idf.fr répond {r.status_code}")


def site_acces(_):
    import subprocess
    r = subprocess.run(["git", "ls-remote", "--heads", "https://github.com/dlahlou/fitmate-landing-page", "main"],
                       capture_output=True, text=True, timeout=60)
    return ("ok", "dépôt du site accessible depuis la session") if r.returncode == 0 and r.stdout else \
        ("échec", "le dépôt du site n'est pas accessible depuis la session")


CHECKS = {"ig-bio": ig_bio, "gsc-index": gsc_index, "ios-build": ios_build, "backend-prix": backend_prix,
          "acces-Backend : inscriptions, actifs, participations": acces_backend, "reseau-sources": reseau_sources, "site-acces": site_acces}


def main() -> None:
    etat = json.loads(open(sys.argv[1]).read())
    todo = json.loads(TODO.read_text())
    verifs = json.loads(VERIF.read_text()) if VERIF.exists() else {}
    now = dt.datetime.now(dt.timezone.utc).isoformat(timespec="seconds")
    decisions = json.loads(DECISIONS.read_text()) if DECISIONS.exists() else []
    for aid, e in etat.items():
        if e.get("statut") == "non pertinent":
            t = next((x for x in todo if x["id"] == aid), None)
            if t and t.get("statut") != "écarté":
                t["statut"] = "écarté"
                decisions.append({"date": e["date"][:10], "id": aid, "canal": t.get("canal"), "action": t.get("action"),
                                  "raison": e.get("note") or "(sans raison donnée)"})
                print(f"ÉCARTÉ      {aid} : {e.get('note') or 'sans raison'}")
            elif not t and not any(d["id"] == aid for d in decisions):
                decisions.append({"date": e["date"][:10], "id": aid, "canal": None, "action": aid,
                                  "raison": e.get("note") or "(sans raison donnée)"})
                print(f"ÉCARTÉ      {aid} : {e.get('note') or 'sans raison'}")
            continue
        if e.get("statut") == "à faire":
            for t in todo:  # Driss a annulé un « pas pertinent »
                if t["id"] == aid and t.get("statut") == "écarté":
                    t["statut"] = "à faire"
                    decisions = [d for d in decisions if d["id"] != aid]
            continue
        v = verifs.get(aid)
        if e.get("statut") != "déclaré fait" or (v and v["date"] > e["date"] and v["resultat"] != "en attente"):
            continue  # pas déclaré, ou déjà vérifié depuis la déclaration (on ne revérifie que ce qui est en attente)
        fn = CHECKS.get(aid)
        try:
            res, why = fn(e) if fn else ("déclaré", "pas de source pour le vérifier : clos sur ta déclaration")
        except Exception as ex:  # noqa: BLE001
            res, why = "en attente", f"vérification impossible pour l'instant ({str(ex)[:120]})"
        verifs[aid] = {"date": now, "resultat": res, "raison": why}
        if res in ("ok", "déclaré"):
            for t in todo:
                if t["id"] == aid:
                    t["statut"] = "fait"
        print(f"{res.upper():11} {aid} : {why}")
    VERIF.write_text(json.dumps(verifs, ensure_ascii=False, indent=1) + "\n")
    DECISIONS.write_text(json.dumps(decisions, ensure_ascii=False, indent=1) + "\n")
    TODO.write_text("[\n" + ",\n".join(" " + json.dumps(x, ensure_ascii=False) for x in todo) + "\n]\n")


if __name__ == "__main__":
    main()
