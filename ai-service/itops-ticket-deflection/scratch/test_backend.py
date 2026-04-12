import requests
import json

base_url = "http://127.0.0.1:8000"
endpoints = [
    "/api/tickets",
    "/api/metrics/summary",
    "/api/operational/ot",
    "/api/operational/infra",
    "/api/operational/shadow"
]

for ep in endpoints:
    try:
        print(f"Testing {ep}...", flush=True)
        r = requests.get(base_url + ep, timeout=5)
        print(f"  Status: {r.status_code}")
        if r.status_code == 200:
            data = r.json()
            print(f"  Data type: {type(data)}")
            if isinstance(data, list):
                print(f"  Count: {len(data)}")
                if len(data) > 0:
                    print(f"  Sample keys: {list(data[0].keys())}")
            elif isinstance(data, dict):
                print(f"  Keys: {list(data.keys())}")
        else:
            print(f"  Error: {r.text}")
    except requests.exceptions.Timeout:
        print(f"  TIMEOUT after 5s")
    except Exception as e:
        print(f"  FAILED - {e}")
