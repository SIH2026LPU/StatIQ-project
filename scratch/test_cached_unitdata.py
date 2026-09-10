import json
import math
import os
import re
import tempfile
import time
import urllib3
import requests

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

# Load key from statiq-ai-backend/.env
from pathlib import Path
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
print("API Key configured:", bool(api_key))

NADA_BASE = "https://microdata.gov.in/NADA/index.php/api"
PAGE_SIZE = 15

CACHE_FILE = os.path.join(tempfile.gettempdir(), "statiq_nada_catalog.json")
CACHE_TTL = 3600  # 1 hour

def get_cached_catalog():
    if os.path.exists(CACHE_FILE):
        try:
            with open(CACHE_FILE, "r", encoding="utf-8") as f:
                data = json.load(f)
            if time.time() - data.get("timestamp", 0) < CACHE_TTL:
                return data.get("rows", [])
        except Exception:
            pass
    return None

def save_catalog_cache(rows):
    try:
        with open(CACHE_FILE, "w", encoding="utf-8") as f:
            json.dump({"timestamp": time.time(), "rows": rows}, f)
    except Exception:
        pass

def fetch_full_catalog():
    cached = get_cached_catalog()
    if cached:
        return cached

    r = requests.get(f"{NADA_BASE}/listdatasets?page=1", verify=False, timeout=20)
    if r.status_code != 200:
        if cached:
            return cached
        raise RuntimeError(f"NADA status {r.status_code}")

    res = r.json()["result"]
    total = int(res.get("total", 0))
    limit = int(res.get("limit", 15))
    pages = math.ceil(total / limit) if limit else 1
    rows = list(res.get("rows", []))

    for p in range(2, pages + 1):
        time.sleep(0.3)
        rp = requests.get(f"{NADA_BASE}/listdatasets?page={p}", verify=False, timeout=20)
        if rp.status_code == 200:
            b = rp.json()
            rows.extend(b.get("result", {}).get("rows", []))
        elif rp.status_code == 429:
            break

    if len(rows) > 0:
        save_catalog_cache(rows)
    return rows

print("\n--- Test fetch full catalog ---")
t0 = time.time()
catalog = fetch_full_catalog()
print(f"Catalog fetched: {len(catalog)} rows in {(time.time() - t0)*1000:.1f}ms")

# Test search queries
for q in ["PLFS", "ASI", "HCES", "ASUSE", "NSS"]:
    t0 = time.time()
    q_low = q.lower()
    matches = [
        d for d in catalog
        if q_low in str(d.get("title", "")).lower()
        or q_low in str(d.get("idno", "")).lower()
        or q_low in str(d.get("repo_title", "")).lower()
    ]
    print(f"Search '{q}': {len(matches)} matches in {(time.time() - t0)*1000:.2f}ms")
    if matches:
        print(f"   Top match: {matches[0].get('idno')} | {matches[0].get('title')}")
