import os
import time
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

# Patch requests.get in MospiUnitdata or default session so verify=False is used for microdata.gov.in
import requests
_orig_request = requests.Session.request

def _custom_request(self, method, url, *args, **kwargs):
    if "microdata.gov.in" in str(url):
        kwargs["verify"] = False
    return _orig_request(self, method, url, *args, **kwargs)

requests.Session.request = _custom_request
requests.request = lambda method, url, **kwargs: _custom_request(requests.Session(), method, url, **kwargs)
requests.get = lambda url, **kwargs: _custom_request(requests.Session(), "GET", url, **kwargs)

import MospiUnitdata

print("=== 1. MospiUnitdata.list_datasets(api_key, page=1) ===")
t0 = time.time()
res1 = MospiUnitdata.list_datasets(api_key, page=1)
elapsed = (time.time() - t0) * 1000
print(f"Status: SUCCESS in {elapsed:.1f}ms | Count: {len(res1) if res1 else 0}")
if res1:
    print(f"Sample: IDNO={res1[0].get('idno')}, Title={res1[0].get('title')}")

print("\n=== 2. MospiUnitdata.list_datasets(api_key, query='PLFS') ===")
t0 = time.time()
plfs = MospiUnitdata.list_datasets(api_key, query="PLFS")
elapsed = (time.time() - t0) * 1000
print(f"Status: SUCCESS in {elapsed:.1f}ms | Count: {len(plfs) if plfs else 0}")
if plfs:
    for idx, ds in enumerate(plfs[:5]):
        print(f"  [{idx+1}] IDNO: {ds.get('idno')} | Title: {ds.get('title')}")

print("\n=== 3. MospiUnitdata.list_datasets(api_key, query='ASI') ===")
t0 = time.time()
asi = MospiUnitdata.list_datasets(api_key, query="ASI")
elapsed = (time.time() - t0) * 1000
print(f"Status: SUCCESS in {elapsed:.1f}ms | Count: {len(asi) if asi else 0}")
if asi:
    for idx, ds in enumerate(asi[:3]):
        print(f"  [{idx+1}] IDNO: {ds.get('idno')} | Title: {ds.get('title')}")

print("\n=== 4. MospiUnitdata.list_datasets(api_key, query='HCES') ===")
t0 = time.time()
hces = MospiUnitdata.list_datasets(api_key, query="HCES")
elapsed = (time.time() - t0) * 1000
print(f"Status: SUCCESS in {elapsed:.1f}ms | Count: {len(hces) if hces else 0}")
if hces:
    for idx, ds in enumerate(hces[:3]):
        print(f"  [{idx+1}] IDNO: {ds.get('idno')} | Title: {ds.get('title')}")

print("\n=== 5. MospiUnitdata.list_files(dataset_id, api_key) ===")
real_id = plfs[0].get("idno") if plfs else "IND-CSO-ASI-1983-84"
t0 = time.time()
files = MospiUnitdata.list_files(real_id, api_key)
elapsed = (time.time() - t0) * 1000
print(f"Status: SUCCESS in {elapsed:.1f}ms | Files for {real_id}: {len(files) if files else 0}")
if files:
    for idx, f in enumerate(files[:3]):
        print(f"  [{idx+1}] Name: {f.get('name')} | Size: {f.get('size')}")
