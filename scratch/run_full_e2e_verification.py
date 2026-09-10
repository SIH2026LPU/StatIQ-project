import inspect
import json
import os
import sys
import time
import requests
from pathlib import Path

print("================================================================")
print("STATIQ AI — MOSPI UNITDATA FULL END-TO-END VERIFICATION")
print("================================================================")

# TEST 1 & 2: Package & Import
print("\n[TEST 1 & 2: Package Info & Import]")
import MospiUnitdata
print(f"-> Package Module: {MospiUnitdata.__name__}")
print(f"-> Module Location: {MospiUnitdata.__file__}")

# TEST 3: Function Signatures
print("\n[TEST 3: Function Signatures]")
for fn_name in ["list_datasets", "list_files", "download_file", "download_dataset"]:
    fn = getattr(MospiUnitdata, fn_name)
    print(f"-> {fn_name}: {inspect.signature(fn)}")

# TEST 4: API Key verification
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
print("\n[TEST 4: API Key Configured]")
print(f"-> MOSPI_UNITDATA_API_KEY configured: {bool(api_key and len(api_key) > 5)} (length: {len(api_key) if api_key else 0})")

# Patch SSL for microdata.gov.in cert chain
_orig_request = requests.Session.request
def _custom_req(self, method, url, *args, **kwargs):
    if "microdata.gov.in" in str(url):
        kwargs["verify"] = False
    return _orig_request(self, method, url, *args, **kwargs)
requests.Session.request = _custom_req
requests.get = lambda url, **kwargs: _custom_req(requests.Session(), "GET", url, **kwargs)

# TEST 5: Direct list_datasets page 1
print("\n[TEST 5: MospiUnitdata.list_datasets(api_key, page=1)]")
t0 = time.time()
ds_page1 = MospiUnitdata.list_datasets(api_key, page=1)
print(f"-> Status: SUCCESS in {(time.time() - t0)*1000:.1f}ms | Count: {len(ds_page1) if ds_page1 else 0}")
if ds_page1:
    print(f"   Sample 1: {ds_page1[0].get('idno')} | {ds_page1[0].get('title')}")

# TEST 6: PLFS search
print("\n[TEST 6: MospiUnitdata.list_datasets(api_key, query='PLFS')]")
t0 = time.time()
plfs = MospiUnitdata.list_datasets(api_key, query="PLFS")
print(f"-> Status: SUCCESS in {(time.time() - t0)*1000:.1f}ms | PLFS Count: {len(plfs) if plfs else 0}")
if plfs:
    for idx, d in enumerate(plfs[:3]):
        print(f"   [{idx+1}] {d.get('idno')} | {d.get('title')}")

# TEST 7: ASI search
print("\n[TEST 7: MospiUnitdata.list_datasets(api_key, query='ASI')]")
t0 = time.time()
asi = MospiUnitdata.list_datasets(api_key, query="ASI")
print(f"-> Status: SUCCESS in {(time.time() - t0)*1000:.1f}ms | ASI Count: {len(asi) if asi else 0}")
if asi:
    for idx, d in enumerate(asi[:3]):
        print(f"   [{idx+1}] {d.get('idno')} | {d.get('title')}")

# TEST 8: HCES search
print("\n[TEST 8: MospiUnitdata.list_datasets(api_key, query='HCES')]")
t0 = time.time()
hces = MospiUnitdata.list_datasets(api_key, query="HCES")
print(f"-> Status: SUCCESS in {(time.time() - t0)*1000:.1f}ms | HCES Count: {len(hces) if hces else 0}")
if hces:
    for idx, d in enumerate(hces[:3]):
        print(f"   [{idx+1}] {d.get('idno')} | {d.get('title')}")

# TEST 9: list_files
print("\n[TEST 9: MospiUnitdata.list_files(dataset_id, api_key)]")
sample_id = plfs[0].get("idno") if plfs else "IND-CSO-ASI-1983-84"
t0 = time.time()
files = MospiUnitdata.list_files(sample_id, api_key)
print(f"-> Status: SUCCESS in {(time.time() - t0)*1000:.1f}ms | Files for {sample_id}: {len(files) if files else 0}")
if files:
    for idx, f in enumerate(files[:3]):
        print(f"   [{idx+1}] {f.get('name')} ({f.get('size')})")

# TEST 10: StatIQ Backend Route
print("\n[TEST 10: Backend GET /api/microdata/datasets?q=PLFS&page=1]")
t0 = time.time()
r = requests.get("http://localhost:4000/api/microdata/datasets?q=PLFS&page=1", timeout=15)
print(f"-> Status: HTTP {r.status_code} in {(time.time() - t0)*1000:.1f}ms")
data10 = r.json()
print(f"-> Mode: {data10.get('mode')}, Count: {len(data10.get('datasets', []))}")

# TEST 11 & 12: Frontend Proxy Route
print("\n[TEST 11 & 12: Frontend Proxy GET /api/v1/microdata/datasets?q=PLFS&page=1]")
t0 = time.time()
r = requests.get("http://localhost:3000/api/v1/microdata/datasets?q=PLFS&page=1", timeout=15)
print(f"-> Status: HTTP {r.status_code} in {(time.time() - t0)*1000:.1f}ms")
data12 = r.json()
print(f"-> Mode: {data12.get('mode')}, Count: {len(data12.get('datasets', []))}")

# TEST 13 & 14: Security / API Key Exposure Check
print("\n[TEST 13 & 14: Security Audit — Verify API Key is NEVER Leaked]")
raw_resp10 = json.dumps(data10)
raw_resp12 = json.dumps(data12)
leaked_backend = api_key in raw_resp10
leaked_frontend = api_key in raw_resp12

# Check frontend HTML
html_catalogue = requests.get("http://localhost:3000/catalogue").text
leaked_html = api_key in html_catalogue

print(f"-> Backend response contains secret key: {leaked_backend} (PASS: {not leaked_backend})")
print(f"-> Frontend proxy response contains secret key: {leaked_frontend} (PASS: {not leaked_frontend})")
print(f"-> Catalogue HTML contains secret key: {leaked_html} (PASS: {not leaked_html})")

# Verify WPI is still intact
print("\n[VERIFICATION: WPI Status Check]")
t0 = time.time()
r_wpi = requests.get("http://localhost:4000/api/mospi/wpi?Format=JSON&limit=5&page=1", timeout=15)
print(f"-> WPI Status: HTTP {r_wpi.status_code} in {(time.time() - t0)*1000:.1f}ms")
data_wpi = r_wpi.json()
print(f"-> WPI Status Code: {data_wpi.get('statusCode')}, Records: {len(data_wpi.get('data', []))}")
print("================================================================")
