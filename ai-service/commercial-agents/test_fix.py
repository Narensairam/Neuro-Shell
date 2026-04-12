import requests
import json

def test_contract_audit():
    url = "http://127.0.0.1:5005/api/contract"
    payload = {
        "contract_id": "CTR-TEST-001",
        "counterparty": "Test Corp",
        "contract_text": "This is a test LNG contract with a take-or-pay clause of 85% and JCC pricing."
    }
    
    try:
        print(f"Testing {url}...")
        response = requests.post(url, json=payload, timeout=10)
        print(f"Status: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
    except Exception as e:
        print(f"FAILED: {e}")

if __name__ == "__main__":
    test_contract_audit()
