from pathlib import Path
import re

import pandas as pd

ROOT = Path(__file__).resolve().parents[1]


def clean_text(text):
    text = str(text).lower()
    text = re.sub(r"[^a-z0-9\s]", "", text)

    replacements = {
        "not able to": "cannot",
        "unable to": "cannot",
        "fails to": "cannot",
        "not getting": "not",
    }
    for source, target in replacements.items():
        text = text.replace(source, target)

    return " ".join(text.split())


def load_data():
    return pd.read_csv(ROOT / "data" / "tickets.csv")


def combine_text(df):
    return (df["title"].astype(str) + " " + df["description"].astype(str)).apply(clean_text)
