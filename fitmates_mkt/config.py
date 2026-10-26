"""Lecture de la configuration : variables d'environnement, avec un fichier .env local en secours.

Aucun secret n'est jamais affiché : les erreurs nomment la variable manquante et où l'obtenir.
"""
import os
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent


def _load_dotenv() -> None:
    f = ROOT / ".env"
    if not f.exists():
        return
    for line in f.read_text().splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        k, v = line.split("=", 1)
        os.environ.setdefault(k.strip(), v.strip().strip('"').strip("'"))


_load_dotenv()


class MissingAccess(RuntimeError):
    """Un accès manque : le message dit quoi et où le corriger."""


def env(name: str, how: str = "", *fallbacks: str) -> str:
    for n in (name, *fallbacks):
        v = os.environ.get(n)
        if v:
            return v
    raise MissingAccess(f"variable {name} absente" + (f" : {how}" if how else ""))


def opt(name: str, default: str | None = None) -> str | None:
    return os.environ.get(name) or default


# Identifiants publics (pas des secrets)
PLAY_PACKAGE = "com.dlahlou.fitmate"
IOS_APP_ID = "6756283890"  # production ; 6759652749 = staging, ne pas toucher
SITE_URL = "https://www.fitmates.net"
