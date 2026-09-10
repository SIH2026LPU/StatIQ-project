import os
import time
import requests
import urllib3
from pathlib import Path

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

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
NADA_BASE = "https://microdata.gov.in/NADA/index.php/api"
headers = {"X-API-KEY": api_key}

queries = ["PLFS", "ASI", "HCES", "Annual Survey of Industries", "Periodic Labour Force Survey"]

for q in queries:
    # 1. Test with query param
    t0 = time.time()
    url = f"{NADA_BASE}/listdatasets?page=1&query={requests.utils.quote(q)}"
    res = requests.get(url, headers=headers, verify=False, timeout=15)
    elapsed = (time.time() - t0) * 1000
    try:
        data = res.json()
        total = data.get("result", {}).get("total", "N/A")
        rows = data.get("result", {}).get("rows", [])
        print(f"\n[QUERY '{q}'] Status {res.status_code} in {elapsed:.1f}ms | Total: {total} | Rows: {len(rows)}", flush=True)
        for idx, r in enumerate(rows[:2]):
            print(f"   [{idx+1}] IDNO: {r.get('idno')} | Title: {r.get('title')}", flush=True)
    except Exception as e:
        print(f"\n[QUERY '{q}'] Failed in {elapsed:.1f}ms: {e}", flush=True)
