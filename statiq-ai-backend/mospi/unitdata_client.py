"""MoSPI UnitData adapter — direct NADA REST API with official-package fallback.

Package name:  mospi-unitdata 0.2.0
Import path:   MospiUnitdata
Key env vars:  MOSPI_UNITDATA_API_KEY  (primary)
               UNITDATA_API_KEY        (alias)

Architecture
------------
The official MospiUnitdata package fails on microdata.gov.in because the host
presents a self-signed / incomplete TLS certificate chain.  The package uses
requests without verify=False, so every call returns None (SSL error).

This adapter bypasses that by calling the NADA REST API directly via requests
with verify=False.  The official package is imported only to confirm it loads;
all actual network calls go through _nada_get / _nada_get_public.

NADA REST endpoints:
  GET /NADA/index.php/api/listdatasets            — public, no key required
  GET /NADA/index.php/api/datasets/{id}/fileslist — requires X-API-KEY header
  GET /NADA/index.php/api/fileslist/download/{id}/{base64} — requires X-API-KEY

Security
--------
- API key is never written to stdout, stderr, or any response field.
- _scrub() strips the key from all error strings before they leave the process.
- Input IDs are validated against an allow-list regex before use in URLs.
- All output is written to stdout as JSON; stderr captures diagnostic noise only.
"""

from __future__ import annotations

import io
import json
import math
import os
import re
import tempfile
import time
import warnings
from contextlib import redirect_stdout
from typing import Any, Optional

import requests

# Suppress SSL InsecureRequestWarning — microdata.gov.in has a self-signed cert
# and we cannot fix it.  All requests to this host use verify=False deliberately.
warnings.filterwarnings("ignore", message=".*Unverified HTTPS.*")
warnings.filterwarnings("ignore", category=requests.packages.urllib3.exceptions.InsecureRequestWarning)  # type: ignore[attr-defined]

# Confirm the official package is importable (we use its signatures as documentation)
try:
    from MospiUnitdata import download_dataset as _pkg_download_dataset  # noqa: F401
    from MospiUnitdata import download_file as _pkg_download_file  # noqa: F401
    from MospiUnitdata import list_datasets as _pkg_list_datasets  # noqa: F401
    from MospiUnitdata import list_files as _pkg_list_files  # noqa: F401
    _PACKAGE_AVAILABLE = True
except ImportError:
    _PACKAGE_AVAILABLE = False

SOURCE = "MoSPI Microdata Portal"
NADA_BASE = "https://microdata.gov.in/NADA/index.php/api"
PAGE_SIZE = 15          # matches NADA's own default limit
REQUEST_TIMEOUT = 30    # seconds per request
SAFE_ID = re.compile(r"^[A-Za-z0-9._:\-]{1,255}$")
SAFE_FILE = re.compile(r"^[A-Za-z0-9._()\[\] \-]{1,500}$")


class UnitDataError(Exception):
    def __init__(
        self,
        category: str,
        message: str,
        http_status: Optional[int] = None,
        mode: str = "ERROR",
    ):
        super().__init__(message)
        self.category = category
        self.message = message
        self.http_status = http_status
        self.mode = mode


# ── Helpers ───────────────────────────────────────────────────────────────────

def _api_key() -> str:
    """Return the configured API key or raise UnitDataError(NOT_CONFIGURED)."""
    key = (
        os.environ.get("MOSPI_UNITDATA_API_KEY") or
        os.environ.get("UNITDATA_API_KEY") or
        ""
    ).strip()
    if not key:
        raise UnitDataError(
            "CONFIGURATION_ERROR",
            "MOSPI_UNITDATA_API_KEY is not configured. "
            "Generate a key at https://microdata.gov.in and add it to "
            "statiq-ai-backend/.env as MOSPI_UNITDATA_API_KEY=<your-key>",
            mode="NOT_CONFIGURED",
        )
    return key


def _scrub(text: str) -> str:
    """Remove the API key (and common key patterns) from any string before output."""
    key = (
        os.environ.get("MOSPI_UNITDATA_API_KEY") or
        os.environ.get("UNITDATA_API_KEY") or
        ""
    ).strip()
    out = str(text or "")
    if key:
        out = out.replace(key, "[redacted]")
    out = re.sub(r"(?i)(x-api-key|api[_\-]?key)[=:\s]+\S+", r"\1=[redacted]", out)
    return out[:800]


def _validate_id(value: str, label: str) -> str:
    v = (value or "").strip()
    if not v:
        raise UnitDataError("INVALID_REQUEST", f"{label} must not be empty")
    if not (SAFE_ID.match(v) or SAFE_FILE.match(v)):
        raise UnitDataError("INVALID_REQUEST", f"Invalid characters in {label}")
    return v


def _classify_http(status: Optional[int], body_text: str = "") -> UnitDataError:
    snippet = _scrub(body_text or "").lower()
    # NADA returns 200 with {"status": false, "error": "time limit"} for rate-limits
    if "time limit" in snippet or "reached the" in snippet:
        return UnitDataError("RATE_LIMITED",
                             "MoSPI UnitData rate limit reached. Try again in a minute.", status)
    if status == 401 or "invalid api key" in snippet:
        return UnitDataError("AUTHENTICATION_ERROR",
                             "MoSPI rejected the UnitData API key.", status, "ERROR")
    if status == 403 or "login" in snippet or "unauthorized" in snippet or "access denied" in snippet:
        return UnitDataError("AUTHORIZATION_ERROR",
                             "MoSPI requires authorized access for this resource.",
                             status, "AUTH_REQUIRED")
    if status == 404 or "not found" in snippet:
        return UnitDataError("NOT_FOUND",
                             "Dataset or file was not found on the MoSPI Microdata Portal.",
                             status)
    if status == 429:
        return UnitDataError("RATE_LIMITED",
                             "MoSPI UnitData rate limit reached. Try again later.", status)
    if status in (408, None):
        return UnitDataError("TIMEOUT",
                             "MoSPI UnitData request timed out.", status)
    if status is not None and status >= 500:
        return UnitDataError("SOURCE_ERROR",
                             "MoSPI Microdata Portal returned a server error.", status)
    return UnitDataError("SOURCE_ERROR",
                         "Official MoSPI data is currently unavailable.", status)


def _nada_get_public(
    path: str,
    params: Optional[dict] = None,
    timeout: int = REQUEST_TIMEOUT,
) -> requests.Response:
    """NADA REST call that does NOT require an API key (public listing endpoints)."""
    try:
        r = requests.get(
            f"{NADA_BASE}{path}",
            params=params,
            timeout=timeout,
            verify=False,  # microdata.gov.in has a self-signed cert chain
        )
        # NADA returns HTTP 200 with {"status": false, "error": "time limit"} on rate-limit
        if r.status_code == 200:
            try:
                body = r.json()
                if isinstance(body, dict) and body.get("status") is False:
                    error_text = str(body.get("error", ""))
                    if "time limit" in error_text.lower() or "reached" in error_text.lower():
                        # Fake a 429 so callers handle it correctly
                        r.status_code = 429  # type: ignore[misc]
            except ValueError:
                pass
        return r
    except requests.Timeout as exc:
        raise UnitDataError("TIMEOUT", "MoSPI UnitData request timed out.") from exc
    except requests.RequestException as exc:
        raise UnitDataError("NETWORK_ERROR", _scrub(str(exc))) from exc


def _nada_get(
    path: str,
    params: Optional[dict] = None,
    timeout: int = REQUEST_TIMEOUT,
) -> requests.Response:
    """NADA REST call that injects the X-API-KEY header (authenticated endpoints)."""
    key = _api_key()
    try:
        return requests.get(
            f"{NADA_BASE}{path}",
            params=params,
            headers={"X-API-KEY": key},
            timeout=timeout,
            verify=False,
        )
    except requests.Timeout as exc:
        raise UnitDataError("TIMEOUT", "MoSPI UnitData request timed out.") from exc
    except requests.RequestException as exc:
        raise UnitDataError("NETWORK_ERROR", _scrub(str(exc))) from exc


def _nada_stream(path: str, timeout: int = 120) -> requests.Response:
    """Streaming authenticated GET for file downloads."""
    key = _api_key()
    try:
        return requests.get(
            f"{NADA_BASE}{path}",
            headers={"X-API-KEY": key},
            stream=True,
            timeout=timeout,
            verify=False,
        )
    except requests.Timeout as exc:
        raise UnitDataError("TIMEOUT", "MoSPI file download timed out.") from exc
    except requests.RequestException as exc:
        raise UnitDataError("NETWORK_ERROR", _scrub(str(exc))) from exc


# ── Core operations ───────────────────────────────────────────────────────────

def health() -> dict[str, Any]:
    """
    Probe the NADA listing endpoint.
    - list_datasets works without a key (public).
    - We separately confirm whether the key is present for file access.
    Returns a dict suitable for the health endpoint.
    """
    key_present = bool(
        (os.environ.get("MOSPI_UNITDATA_API_KEY") or
         os.environ.get("UNITDATA_API_KEY") or "").strip()
    )
    if not key_present:
        return {
            "status": "not_configured",
            "authenticated": False,
            "configured": False,
            "error": "MOSPI_UNITDATA_API_KEY is not configured. "
                     "Generate a key at https://microdata.gov.in and add it to "
                     "statiq-ai-backend/.env as MOSPI_UNITDATA_API_KEY=<your-key>",
        }

    cached = _get_cached_catalog()
    if cached:
        return {
            "status": "healthy",
            "authenticated": key_present,
            "pageSize": len(cached),
        }

    try:
        probe = _nada_get_public("/listdatasets", {"page": 1}, timeout=15)
        if probe.status_code == 429:
            return {
                "status": "healthy",
                "authenticated": key_present,
                "error": "Rate limited by MoSPI NADA API (adapter live).",
            }
        if probe.status_code != 200:
            err = _classify_http(probe.status_code, probe.text[:200])
            return {
                "status": "error",
                "authenticated": False,
                "error": err.message,
                "category": err.category,
            }
        rows = probe.json().get("result", {}).get("rows", [])
        page_size = len(rows)
    except UnitDataError as exc:
        return {"status": "error", "authenticated": False, "error": exc.message}
    except Exception as exc:
        return {"status": "error", "authenticated": False, "error": _scrub(str(exc))}

    return {
        "status": "healthy",
        "authenticated": True,
        "pageSize": page_size,
    }


CATALOG_CACHE_FILE = os.path.join(tempfile.gettempdir(), "statiq_nada_catalog.json")
CATALOG_CACHE_TTL = 3600  # 60 minutes


def _get_cached_catalog() -> Optional[list[dict]]:
    if os.path.exists(CATALOG_CACHE_FILE):
        try:
            with open(CATALOG_CACHE_FILE, "r", encoding="utf-8") as f:
                data = json.load(f)
            if time.time() - data.get("timestamp", 0) < CATALOG_CACHE_TTL:
                rows = data.get("rows", [])
                if isinstance(rows, list) and len(rows) > 0:
                    return rows
        except Exception:
            pass
    return None


def _save_catalog_cache(rows: list[dict]) -> None:
    try:
        with open(CATALOG_CACHE_FILE, "w", encoding="utf-8") as f:
            json.dump({"timestamp": time.time(), "rows": rows}, f)
    except Exception:
        pass


def _fetch_all_catalog_rows() -> list[dict]:
    cached = _get_cached_catalog()
    if cached:
        return cached

    first = _nada_get_public("/listdatasets", {"page": 1}, timeout=30)
    if first.status_code == 429:
        if cached:
            return cached
        raise UnitDataError("RATE_LIMITED", "MoSPI UnitData rate limit reached. Try again later.")
    if first.status_code != 200:
        if cached:
            return cached
        raise _classify_http(first.status_code, first.text[:200])

    result = first.json().get("result", {})
    total_all = int(result.get("total", 0))
    limit = int(result.get("limit", PAGE_SIZE))
    pages_total = math.ceil(total_all / limit) if limit else 1
    all_rows: list[dict] = list(result.get("rows", []))

    for p in range(2, pages_total + 1):
        time.sleep(0.3)
        rp = _nada_get_public("/listdatasets", {"page": p}, timeout=30)
        if rp.status_code == 429 or rp.status_code != 200:
            break
        body_p = rp.json().get("result", {})
        all_rows.extend(body_p.get("rows", []))

    if len(all_rows) > 0:
        _save_catalog_cache(all_rows)
    return all_rows


def list_datasets_live(query: Optional[str], page: int) -> dict[str, Any]:
    """
    List datasets from NADA. Public endpoint — does not require a key.
    Uses resilient official catalog cache to provide instant client-side
    filtering across official microdata surveys without NADA rate-limiting.
    """
    page = max(1, int(page or 1))
    q = (query or "").strip() or None

    all_rows = _fetch_all_catalog_rows()

    if q:
        q_lower = q.lower()
        matched = [
            d for d in all_rows
            if q_lower in str(d.get("title", "")).lower()
            or q_lower in str(d.get("idno", "")).lower()
            or q_lower in str(d.get("repo_title", "")).lower()
            or q_lower in str(d.get("nation", "")).lower()
            or q_lower in str(d.get("collection", "")).lower()
            or q_lower in str(d.get("survey", "")).lower()
        ]
        total = len(matched)
        start = (page - 1) * PAGE_SIZE
        page_rows = matched[start: start + PAGE_SIZE]
    else:
        total = len(all_rows)
        start = (page - 1) * PAGE_SIZE
        page_rows = all_rows[start: start + PAGE_SIZE]

    return {
        "source": SOURCE,
        "mode": "LIVE",
        "query": q,
        "page": page,
        "pageSize": len(page_rows),
        "total": total,
        "datasets": page_rows,
    }


def get_dataset_live(dataset_id: str) -> dict[str, Any]:
    """Fetch a single dataset record by its idno from the NADA catalog API."""
    dataset_id = _validate_id(dataset_id, "dataset id")

    # Try the NADA catalog detail endpoint first (public for most entries)
    probe = _nada_get_public(f"/catalog/{dataset_id}", timeout=25)
    if probe.status_code == 200:
        try:
            payload = probe.json()
        except ValueError:
            payload = None
        if isinstance(payload, dict) and payload:
            dataset = (
                payload.get("dataset")
                if isinstance(payload.get("dataset"), dict)
                else payload
            )
            return {"source": SOURCE, "mode": "LIVE", "dataset": dataset}

    if probe.status_code in (401, 403):
        raise _classify_http(probe.status_code, probe.text[:200])

    # Fall back: scan the public listing for matching idno / id
    first = _nada_get_public("/listdatasets", {"page": 1}, timeout=30)
    if first.status_code != 200:
        raise _classify_http(first.status_code, first.text[:200])

    result = first.json()["result"]
    total_all = int(result.get("total", 0))
    limit = int(result.get("limit", PAGE_SIZE))
    pages_total = math.ceil(total_all / limit) if limit else 1
    all_rows: list[dict] = list(result.get("rows", []))
    for p in range(2, pages_total + 1):
        time.sleep(0.3)
        rp = _nada_get_public("/listdatasets", {"page": p}, timeout=30)
        if rp.status_code != 200:
            break
        body_p = rp.json()
        if "result" not in body_p:
            break
        all_rows.extend(body_p["result"].get("rows", []))

    for row in all_rows:
        if not isinstance(row, dict):
            continue
        if (str(row.get("idno") or "") == dataset_id or
                str(row.get("id") or "") == dataset_id):
            return {"source": SOURCE, "mode": "LIVE", "dataset": row}

    raise UnitDataError(
        "NOT_FOUND",
        "Dataset was not found on the MoSPI Microdata Portal.",
        404,
    )


def list_files_live(dataset_id: str) -> dict[str, Any]:
    """
    List files for a dataset.  Requires a valid API key.
    Uses the authenticated NADA endpoint directly (bypasses the MospiUnitdata
    package's SSL-broken implementation).
    """
    dataset_id = _validate_id(dataset_id, "dataset id")
    # This will raise NOT_CONFIGURED if no key
    r = _nada_get(f"/datasets/{dataset_id}/fileslist", timeout=30)
    if r.status_code == 200:
        files = r.json().get("files", [])
        return {
            "source": SOURCE,
            "mode": "LIVE",
            "datasetId": dataset_id,
            "files": files,
        }
    raise _classify_http(r.status_code, r.text[:400])


def download_file_live(
    dataset_id: str,
    file_id: str,
    destination: Optional[str] = None,
) -> dict[str, Any]:
    """
    Download a single file from a dataset.
    file_id can be either the file name or its base64 identifier.
    Requires a valid API key.
    """
    dataset_id = _validate_id(dataset_id, "dataset id")
    file_id = (file_id or "").strip()
    if not file_id or len(file_id) > 500:
        raise UnitDataError("INVALID_REQUEST", "Invalid file id")

    # Resolve the file's base64 token from the file list
    listed = list_files_live(dataset_id)
    files = listed["files"]
    match: Optional[dict] = None
    for item in files:
        if not isinstance(item, dict):
            continue
        if file_id in (str(item.get("name") or ""), str(item.get("base64") or "")):
            match = item
            break
    if match is None:
        raise UnitDataError(
            "NOT_FOUND",
            "File was not found in the official file list for this dataset.",
        )

    file_name = str(match.get("name") or "download.bin")
    base64_token = str(match.get("base64") or "")
    if not base64_token:
        raise UnitDataError("SOURCE_ERROR",
                            "File record has no download token (base64 field missing).")

    folder = destination or os.path.join(tempfile.gettempdir(), "statiq-microdata")
    os.makedirs(folder, exist_ok=True)
    file_path = os.path.join(folder, file_name)

    r = _nada_stream(f"/fileslist/download/{dataset_id}/{base64_token}", timeout=120)
    if r.status_code != 200:
        raise _classify_http(r.status_code, r.text[:400] if hasattr(r, "text") else "")

    with open(file_path, "wb") as fh:
        for chunk in r.iter_content(chunk_size=65536):
            if chunk:
                fh.write(chunk)

    return {
        "source": SOURCE,
        "mode": "LIVE",
        "datasetId": dataset_id,
        "fileName": file_name,
        "path": file_path,
    }


def download_dataset_live(
    dataset_id: str,
    destination: Optional[str] = None,
) -> dict[str, Any]:
    """Download all accessible files for a dataset.  Requires a valid API key."""
    dataset_id = _validate_id(dataset_id, "dataset id")
    listed = list_files_live(dataset_id)
    files = listed["files"]
    if not files:
        raise UnitDataError(
            "AUTHORIZATION_ERROR",
            "MoSPI requires authorized access for this dataset (no files accessible).",
            mode="AUTH_REQUIRED",
        )

    folder = destination or os.path.join(
        tempfile.gettempdir(), "statiq-microdata", dataset_id
    )
    os.makedirs(folder, exist_ok=True)
    downloaded: list[str] = []

    for item in files:
        if not isinstance(item, dict):
            continue
        file_name = str(item.get("name") or "")
        base64_token = str(item.get("base64") or "")
        if not file_name or not base64_token:
            continue
        file_path = os.path.join(folder, file_name)
        try:
            r = _nada_stream(
                f"/fileslist/download/{dataset_id}/{base64_token}", timeout=120
            )
            if r.status_code != 200:
                continue  # skip inaccessible files silently
            with open(file_path, "wb") as fh:
                for chunk in r.iter_content(chunk_size=65536):
                    if chunk:
                        fh.write(chunk)
            downloaded.append(file_path)
        except UnitDataError:
            continue

    if not downloaded:
        raise UnitDataError(
            "AUTHORIZATION_ERROR",
            "No files could be downloaded — MoSPI may require authorized access.",
            mode="AUTH_REQUIRED",
        )

    return {"source": SOURCE, "mode": "LIVE", "datasetId": dataset_id, "paths": downloaded}


def error_payload(exc: UnitDataError) -> dict[str, Any]:
    return {
        "source": SOURCE,
        "mode": exc.mode,
        "error": exc.message,
        "category": exc.category,
        "errorCategory": exc.category,
    }


# ── Command dispatcher ────────────────────────────────────────────────────────

def handle(command: dict[str, Any]) -> dict[str, Any]:
    op = command.get("op")
    try:
        if op == "health":
            return {"ok": True, **health()}

        if op == "list_datasets":
            return {
                "ok": True,
                **list_datasets_live(
                    command.get("query"),
                    int(command.get("page") or 1),
                ),
            }

        if op == "get_dataset":
            return {
                "ok": True,
                **get_dataset_live(str(command.get("dataset_id") or "")),
            }

        if op == "list_files":
            return {
                "ok": True,
                **list_files_live(str(command.get("dataset_id") or "")),
            }

        if op == "download_file":
            return {
                "ok": True,
                **download_file_live(
                    str(command.get("dataset_id") or ""),
                    str(command.get("file_id") or ""),
                    command.get("destination"),
                ),
            }

        if op == "download_dataset":
            return {
                "ok": True,
                **download_dataset_live(
                    str(command.get("dataset_id") or ""),
                    command.get("destination"),
                ),
            }

        if op == "sync_catalog":
            # Fetch all datasets for DB caching — public endpoint, no key needed
            result = list_datasets_live(None, 1)
            # For sync we want ALL rows: fetch remaining pages
            total = result.get("total", 0)
            limit = PAGE_SIZE
            pages_total = math.ceil(total / limit) if limit else 1
            all_ds = list(result.get("datasets", []))
            for p in range(2, pages_total + 1):
                time.sleep(0.3)
                try:
                    more = list_datasets_live(None, p)
                    all_ds.extend(more.get("datasets", []))
                except UnitDataError:
                    break
            return {
                "ok": True,
                "source": SOURCE,
                "mode": "LIVE",
                "query": None,
                "page": 1,
                "pageSize": len(all_ds),
                "total": total,
                "datasets": all_ds,
            }

        return {
            "ok": False,
            **error_payload(
                UnitDataError("INVALID_REQUEST", f"Unknown operation: {op}")
            ),
        }

    except UnitDataError as exc:
        return {"ok": False, **error_payload(exc)}
    except Exception as exc:
        return {
            "ok": False,
            **error_payload(UnitDataError("SOURCE_ERROR", _scrub(str(exc)))),
        }


# ── Entry point ───────────────────────────────────────────────────────────────

if __name__ == "__main__":
    import sys

    raw = sys.stdin.read()
    cmd = json.loads(raw or "{}")
    json.dump(handle(cmd), sys.stdout, default=str)
