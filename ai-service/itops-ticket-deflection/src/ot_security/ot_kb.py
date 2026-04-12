from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path

import pandas as pd


ROOT = Path(__file__).resolve().parents[2]
DATA_DIR = ROOT / "data"
KB_PATH = DATA_DIR / "ot_knowledge_base.csv"


@dataclass(frozen=True)
class KBArticle:
    title: str
    description: str
    resolution: str


DEFAULT_ARTICLES: list[KBArticle] = [
    KBArticle(
        title="Unauthorized access attack detected on OT device",
        description="Unauthorized login/access attempts detected on a PLC/RTU device or OT segment.",
        resolution="Isolate device, block suspicious source, rotate credentials, and review access logs.",
    ),
    KBArticle(
        title="Denial of service detected on OT network",
        description="Packet rate spike suggests DoS-like activity or broadcast storm affecting OT communications.",
        resolution="Apply rate limiting and network filtering; isolate segment if needed.",
    ),
    KBArticle(
        title="Command injection detected on OT device",
        description="Execute command attempts with high failures suggests command injection or unauthorized control.",
        resolution="Disable remote execute, isolate device, validate command sources, and review PLC logic changes.",
    ),
    KBArticle(
        title="Firmware tampering detected on OT device",
        description="Firmware change flag indicates possible unauthorized firmware modification.",
        resolution="Isolate device, rollback/verify firmware integrity, and audit change controls.",
    ),
]


def ensure_ot_kb(path: Path = KB_PATH) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    if path.exists():
        return
    df = pd.DataFrame(
        [
            {"kb_id": f"OT_KB{i:03d}", "title": a.title, "description": a.description, "resolution": a.resolution}
            for i, a in enumerate(DEFAULT_ARTICLES, start=1)
        ]
    )
    df.to_csv(path, index=False)


def load_ot_kb(path: Path = KB_PATH) -> tuple[pd.Series, list[str]]:
    ensure_ot_kb(path)
    df = pd.read_csv(path)
    texts = (df["title"].astype(str) + " " + df["description"].astype(str))
    resolutions = df["resolution"].astype(str).tolist()
    return texts, resolutions

