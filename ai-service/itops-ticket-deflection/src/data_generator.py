import random
from pathlib import Path

import pandas as pd
from faker import Faker

fake = Faker()

ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = ROOT / "data"

ISSUES = [
    ("VPN not connecting", "Restart VPN client and check internet", "Network"),
    ("Outlook not opening", "Restart Outlook and clear cache", "Software"),
    ("Password reset required", "Use self-service password reset portal", "Access"),
    ("WiFi not working", "Reconnect to network or restart router", "Network"),
    ("Printer not printing", "Restart printer spooler service", "Hardware"),
]

VARIATIONS = [
    "unable to",
    "not able to",
    "fails to",
    "cannot",
    "issue with",
]


def generate_ticket(issue, solution, category):
    variation = random.choice(VARIATIONS)
    title = f"{variation} {issue.lower()}"
    description = f"User reports they are {variation} {issue.lower()} from their system."

    return {
        "ticket_id": f"INC{random.randint(100000, 999999)}",
        "title": title,
        "description": description,
        "category": category,
        "resolution": solution,
    }


def write_knowledge_base():
    """Canonical KB articles derived from known issue templates (scales separately from tickets)."""
    rows = []
    for i, (issue, solution, category) in enumerate(ISSUES, start=1):
        rows.append(
            {
                "kb_id": f"KB{i:04d}",
                "title": issue,
                "summary": f"How to resolve: {issue.lower()}",
                "resolution": solution,
                "category": category,
            }
        )
    pd.DataFrame(rows).to_csv(DATA_DIR / "knowledge_base.csv", index=False)


def create_dataset(num_tickets: int = 1000, repeat_ratio: float = 0.45):
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    data = []

    repeat_count = int(num_tickets * repeat_ratio)

    for _ in range(repeat_count):
        issue = random.choice(ISSUES)
        data.append(generate_ticket(*issue))

    for _ in range(num_tickets - repeat_count):
        title = fake.sentence()
        description = fake.paragraph()
        data.append(
            {
                "ticket_id": f"INC{random.randint(100000, 999999)}",
                "title": title,
                "description": description,
                "category": "Other",
                "resolution": "Manual investigation required",
            }
        )

    df = pd.DataFrame(data)
    df.to_csv(DATA_DIR / "tickets.csv", index=False)
    write_knowledge_base()
    print("Dataset generated!")
    print(f"  - {DATA_DIR / 'tickets.csv'}")
    print(f"  - {DATA_DIR / 'knowledge_base.csv'}")


if __name__ == "__main__":
    create_dataset(2000)
