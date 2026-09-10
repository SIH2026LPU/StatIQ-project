import os
import time
import requests
import urllib3
from pathlib import Path

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

# Load MOSPI_UNITDATA_API_KEY from statiq-ai-backend/.env
backend_env = Path("statiq-ai-backend/.env")
if backend_env.exists():
    for line in backend_env.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if line.startswith("MOSPI_UNITDATA_API_KEY=") and not line.startswith("#"):
            k = line.split("=", 1)[1].strip()
            if k:
                os.environ["MOSPI_UNITDATA_API_KEY"] = k
                break

api_key = os.environ.get("MOSPI_UNITDATA_API_KEY")
print(f"[RAW NADA TEST] API Key configured: {bool(api_key and api_key.strip())}", flush=True)

NADA_BASE = "https://microdata.gov.in/NADA/index.php/api"

# 1. Raw NADA listdatasets (public or with key)
endpoints = [
    ("listdatasets page=1", f"{NADA_BASE}/listdatasets?page=1", {}),
    ("listdatasets with X-API-KEY", f"{NADA_BASE}/listdatasets?page=1", {"X-API-KEY": api_key}),
    ("listdatasets with Authorization", f"{NADA_BASE}/listdatasets?page=1", {"Authorization": f"Bearer {api_key}"}),
]

for name, url, headers in endpoints:
    t0 = time.time()
    try:
        res = requests.get(url, headers=headers, verify=False, timeout=15)
        elapsed = (time.time() - t0) * 1000
        print(f"\n[{name}] -> Status: {res.status_code} in {elapsed:.1f}ms", flush=True)
        print(f"Content-Type: {res.headers.get('Content-Type')}", flush=True)
        print(f"Body snippet (250 chars): {res.text[:250]}", flush=True)
        try:
            json_data = res.json()
            if isinstance(json_data, dict):
                print(f"JSON Keys: {list(json_data.keys())}", flush=True)
                if "result" in json_data:
                    r = json_data["result"]
                    print(f"Result keys: {list(r.keys()) if isinstance(r, dict) else type(r)}", flush=True)
                    if isinstance(r, dict) and "rows" in r:
                        rows = r["rows"]
                        print(f"Total Rows: {len(rows)}, Total in NADA: {r.get('total')}", flush=True)
                        if len(rows) > 0:
                            print(f"Sample dataset: IDNO={rows[0].get('idno')}, Title={rows[0].get('title')}", flush=True)
        except Exception as je:
            print(f"JSON parse info: {je}", flush=True)
    except Exception as e:
        elapsed = (time.time() - t0) * 1000
        print(f"\n[{name}] -> FAILED in {elapsed:.1f}ms: {type(e).__name__}: {e}", flush=True)
