from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path

import pandas as pd


ROOT = Path(__file__).resolve().parents[2]
DATA_DIR = ROOT / "data"
KB_PATH = DATA_DIR / "infra_knowledge_base.csv"


@dataclass(frozen=True)
class KBArticle:
    title: str
    description: str
    resolution: str


DEFAULT_ARTICLES: list[KBArticle] = [
    KBArticle(
        title="High CPU usage detected",
        description="CPU usage is consistently high and may cause performance degradation or service instability.",
        resolution="Scale up/out resources or restart the top CPU-consuming service after validation.",
    ),
    KBArticle(
        title="High memory usage detected",
        description="Memory usage is high; possible leak or insufficient capacity.",
        resolution="Restart the leaking process/service and investigate memory leaks; scale memory if needed.",
    ),
    KBArticle(
        title="High network latency detected",
        description="Network latency is above normal and may impact dependent services.",
        resolution="Check network path (DNS, routing, firewall) and upstream dependencies; fail over if possible.",
    ),
    KBArticle(
        title="High error count detected",
        description="Application/service error rate is elevated.",
        resolution="Inspect logs and recent deployments; consider rollback or targeted restart.",
    ),
]


def ensure_infra_kb(path: Path = KB_PATH) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    if path.exists():
        return
    df = pd.DataFrame(
        [
            {"kb_id": f"INFRA_KB{i:03d}", "title": a.title, "description": a.description, "resolution": a.resolution}
            for i, a in enumerate(DEFAULT_ARTICLES, start=1)
        ]
    )
    df.to_csv(path, index=False)


def load_infra_kb(path: Path = KB_PATH) -> tuple[pd.Series, list[str]]:
    ensure_infra_kb(path)
    df = pd.read_csv(path)
    texts = (df["title"].astype(str) + " " + df["description"].astype(str))
    resolutions = df["resolution"].astype(str).tolist()
    return texts, resolutions

