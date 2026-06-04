# GRD-CC — embedded layout module (`@grd/cco`)

Private npm package consumed by **greenride-admin-v.2-1** as `file:../GRD-CC`. Runtime code uses abstract **Lmx** symbols; this README describes the real **CCo (Control Center Operations)** behavior.

> Full symbol map, comments, and pre-obfuscation notes: **`.cco-canonical.md`** (gitignored, local only).

## What CCo is

A full-screen **superuser overlay** inside the GreenRide admin dashboard. It does not replace normal admin routes; it adds a privileged control surface for `super_admin` only.

- **Entry:** keyboard chord (default Ctrl+Alt+Shift+M), configurable in pane P1
- **Theme:** isolated CSS skin (`lmx-v1`), does not override main GreenRide `:root` tokens
- **Host:** admin app registers a bridge (`host-bridge.ts`) so the module never imports `api-client` directly

## Feature panes

| Id | Feature | What it does |
|----|---------|----------------|
| P0 | Overview | Module home / status |
| P1 | Shortcut | Configure open chord; synced server + localStorage |
| P2 | Dashboard override | Toggles for settings tab, verify-codes, system-config visibility; server + `gr_lmx_m_*` prefs |
| P3 | Environment | Runtime system config fields + env registry (`/admin/cco/env-registry`) |
| P4 | Policy (RBAC) | List/create admins; set role + **permissions** (persisted to DB) |
| P5 | Nav layout | Reorder/hide main sidebar items; `GET/PUT /admin/cco/navigation` |
| P6 | Vault | Secret keys (fingerprints on read, PUT to update); global **IP allowlist** |
| P7 | Link status | Integration health (DB, maps, OpenAI) + connection flags |
| P8 | Stream | Audit log search (`/admin/cco/logs/search`) |
| P9 | Trace | Privileged activity feed + append on mutations |

## Architecture

```text
greenride-admin (host)
  DashboardShellOverlay → LmxBindProvider + LmxPortal
  host-bridge → LmxBridgeApi → api-client (/admin/cco/*, /admins/*)
GRD-CC (module)
  components/lmx/   UI panes
  services/lmx/     Host-only service layer
  stores/lmx-store  Overlay open state + active pane
```

## Backend APIs (unchanged paths)

| Method | Path |
|--------|------|
| GET/PUT | `/admin/cco/dashboard-overrides` |
| GET/PUT | `/admin/cco/shortcut` |
| GET/PUT | `/admin/cco/secrets` |
| GET/PUT | `/admin/cco/env-registry` |
| GET/PUT | `/admin/cco/ip-allowlist` |
| GET/PUT | `/admin/cco/connection` |
| GET | `/admin/integrations/health` |
| GET/PUT | `/admin/cco/navigation` |
| POST | `/admin/cco/logs/search`, `/admin/cco/activity/search`, `/admin/cco/activity/append` |
| POST | `/admins/search`, `/admins/create`, `/admins/update-role-permissions` |

Tables: `t_admin_audit_log`, `t_admin_cco_nav`, `t_admin_cco_settings`.

## Development

```bash
cd GRD-CC
npm install
npm run typecheck
```

Run inside admin:

```bash
cd ../greenride-admin-v.2-1
npm install
npm run dev
```

## Docs

- `docs/backend-gaps.md` — API completion status
- `docs/grd-cc-integration.md` — host embed contract
- `docs/host-opacity.md` — public vs private commit wording

## Access control

- Client: `canOpenLmx()` requires host user `role === 'super_admin'`
- Server: CCo write routes use `RequireSuperAdmin`; reads allow `audit_logs` where documented
- Global IP allowlist enforced in `CheckLoginPermission` when enabled
