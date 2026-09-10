# StatIQ AI — Working Backend Slice

This folder is the **API process** for the Next.js frontend in the repo root.

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:4000`
- Frontend proxies `/api/v1/*` → `http://127.0.0.1:4000/api/*`

## Quick start (from repo root)

```bash
docker compose up -d
cd statiq-ai-backend
npm install
cp .env.example .env   # already has docker DATABASE_URL
npm run db:push
npm run db:seed
npm run dev
```

In another terminal (repo root):

```bash
npm run dev
```

Sign in with `learner@statiq.demo` / `demo123`. Login tries PostgreSQL first, then the in-memory demo store.

## Health

http://localhost:4000/api/health

## Live vs mock

See `BACKEND_ARCHITECTURE.md`. data.gov.in is the live public API; iGOT/NSSTA stay mock until authorized credentials exist.
