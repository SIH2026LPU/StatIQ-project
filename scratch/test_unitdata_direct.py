import os
import sys
import time
from pathlib import Path

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
print(f"[TEST 1] API Key configured: {bool(api_key and api_key.strip())}", flush=True)

if not api_key:
    print("[ERROR] No MOSPI_UNITDATA_API_KEY found in statiq-ai-backend/.env", flush=True)
    sys.exit(1)

import MospiUnitdata
print(f"[TEST 2] MospiUnitdata module loaded: {MospiUnitdata}", flush=True)

# Test 1: list_datasets (browse page 1)
print("\n--- TEST 3: MospiUnitdata.list_datasets(api_key, page=1) ---", flush=True)
t0 = time.time()
try:
    datasets = MospiUnitdata.list_datasets(api_key, page=1)
    elapsed = (time.time() - t0) * 1000
    print(f"-> Status: SUCCESS in {elapsed:.1f}ms", flush=True)
    print(f"-> Returned type: {type(datasets)}", flush=True)
    if isinstance(datasets, list):
        print(f"-> Total datasets returned: {len(datasets)}", flush=True)
        if len(datasets) > 0:
            first = datasets[0]
            print(f"-> Sample dataset keys: {list(first.keys()) if isinstance(first, dict) else type(first)}", flush=True)
            print(f"-> Sample dataset title: {first.get('title') if isinstance(first, dict) else str(first)[:100]}", flush=True)
            print(f"-> Sample dataset id: {first.get('id') if isinstance(first, dict) else 'N/A'}", flush=True)
    else:
        print(f"-> Result value: {datasets}", flush=True)
except Exception as e:
    elapsed = (time.time() - t0) * 1000
    print(f"-> FAILED in {elapsed:.1f}ms: {type(e).__name__}: {e}", flush=True)

# Test 2: Search PLFS
print("\n--- TEST 4: MospiUnitdata.list_datasets(api_key, page=1, query='PLFS') ---", flush=True)
t0 = time.time()
try:
    plfs_results = MospiUnitdata.list_datasets(api_key, page=1, query="PLFS")
    elapsed = (time.time() - t0) * 1000
    print(f"-> PLFS Status: SUCCESS in {elapsed:.1f}ms", flush=True)
    print(f"-> PLFS Count: {len(plfs_results) if isinstance(plfs_results, list) else plfs_results}", flush=True)
    if isinstance(plfs_results, list) and len(plfs_results) > 0:
        for idx, ds in enumerate(plfs_results[:3]):
            if isinstance(ds, dict):
                print(f"   [{idx+1}] ID: {ds.get('id')} | Title: {ds.get('title')}", flush=True)
except Exception as e:
    elapsed = (time.time() - t0) * 1000
    print(f"-> PLFS FAILED in {elapsed:.1f}ms: {type(e).__name__}: {e}", flush=True)

# Test 3: Search ASI
print("\n--- TEST 5: MospiUnitdata.list_datasets(api_key, page=1, query='ASI') ---", flush=True)
t0 = time.time()
try:
    asi_results = MospiUnitdata.list_datasets(api_key, page=1, query="ASI")
    elapsed = (time.time() - t0) * 1000
    print(f"-> ASI Status: SUCCESS in {elapsed:.1f}ms", flush=True)
    print(f"-> ASI Count: {len(asi_results) if isinstance(asi_results, list) else asi_results}", flush=True)
    if isinstance(asi_results, list) and len(asi_results) > 0:
        for idx, ds in enumerate(asi_results[:3]):
            if isinstance(ds, dict):
                print(f"   [{idx+1}] ID: {ds.get('id')} | Title: {ds.get('title')}", flush=True)
except Exception as e:
    elapsed = (time.time() - t0) * 1000
    print(f"-> ASI FAILED in {elapsed:.1f}ms: {type(e).__name__}: {e}", flush=True)

# Test 4: Search HCES
print("\n--- TEST 6: MospiUnitdata.list_datasets(api_key, page=1, query='HCES') ---", flush=True)
t0 = time.time()
try:
    hces_results = MospiUnitdata.list_datasets(api_key, page=1, query="HCES")
    elapsed = (time.time() - t0) * 1000
    print(f"-> HCES Status: SUCCESS in {elapsed:.1f}ms", flush=True)
    print(f"-> HCES Count: {len(hces_results) if isinstance(hces_results, list) else hces_results}", flush=True)
    if isinstance(hces_results, list) and len(hces_results) > 0:
        for idx, ds in enumerate(hces_results[:3]):
            if isinstance(ds, dict):
                print(f"   [{idx+1}] ID: {ds.get('id')} | Title: {ds.get('title')}", flush=True)
except Exception as e:
    elapsed = (time.time() - t0) * 1000
    print(f"-> HCES FAILED in {elapsed:.1f}ms: {type(e).__name__}: {e}", flush=True)
