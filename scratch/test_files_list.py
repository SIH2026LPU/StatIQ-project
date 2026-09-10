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

dataset_ids_to_test = ["IND-CSO-ASI-1983-84", "304"]

for ds_id in dataset_ids_to_test:
    url = f"{NADA_BASE}/datasets/{ds_id}/fileslist"
    headers = {"X-API-KEY": api_key}
    t0 = time.time()
    try:
        res = requests.get(url, headers=headers, verify=False, timeout=15)
        elapsed = (time.time() - t0) * 1000
        print(f"\n[list_files for {ds_id}] -> Status: {res.status_code} in {elapsed:.1f}ms", flush=True)
        print(f"Body: {res.text[:300]}", flush=True)
        try:
            data = res.json()
            if "files" in data:
                print(f"Files count: {len(data['files'])}", flush=True)
                for f in data['files'][:3]:
                    print(f"   File: name={f.get('name')}, size={f.get('size')}, base64={f.get('base64')[:20] if f.get('base64') else 'N/A'}", flush=True)
        except Exception as je:
            print(f"JSON info: {je}", flush=True)
    except Exception as e:
        elapsed = (time.time() - t0) * 1000
        print(f"\n[list_files for {ds_id}] -> FAILED in {elapsed:.1f}ms: {e}", flush=True)
