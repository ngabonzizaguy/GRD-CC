# GRD Command Center (standalone)

Full-screen **Command Center** (`@grd/cco`) outside the main admin dashboard. Deploy this app on Vercel; it shares the same API and P0–P9 controls as the embedded overlay.

## Requirements

- Monorepo folders on disk (Vercel **Root Directory**: `cco-web`):
  - `cco-web/` (this app)
  - `GRD-CC/` (module)
  - `greenride-admin-v.2-1/` (API client + auth store)

## Environment variables (Vercel)

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Admin API base URL |
| `NEXT_PUBLIC_API_PREFIX` | Usually `/admin` |
| `NEXT_PUBLIC_DEMO_MODE` | `false` in production |

Optional: maps keys if P3 env registry references them.

## Local dev

```bash
cd cco-web
npm install
npm run dev
```

Open http://localhost:3700 — login requires **super_admin** (demo mode accepts any user as super_admin).

## Vercel deploy

1. Import the repository.
2. Set **Root Directory** to `cco-web`.
3. Add env vars above (match production admin API).
4. Deploy.

The build resolves `@grd/cco` from `../GRD-CC` and `@admin/*` from `../greenride-admin-v.2-1/src` via `externalDir` + webpack aliases.

## Features

- All P0–P9 panes
- P2 operations modules (Rides, Drivers, Vehicles, KYC) + incoming rides toggle
- KYC approve/reject queue in P2
- Same `/cco/*` backend APIs as the main admin host
