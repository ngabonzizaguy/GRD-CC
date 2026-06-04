# GRD-CC Integration Mechanism

## Canonical model (from Senior Staff Engineer brief)

**GRD-CC** is the **dedicated repository where CCo is architected and built.**

**greenride-admin-v.2-1** is the **host app** (source of truth for auth, API, RBAC, sidebar, env). CCo is **embedded** there — not a second app.

| Repo | Role |
|------|------|
| **GRD-CC** | CCo module source: UI (Vercel), services that **wrap** admin logic, types, theme, agent workspace, specs |
| **greenride-admin-v.2-1** | Host: dashboard shell, `api-client`, backend, existing business logic; **thin integration** (mount overlay, shortcut, import CCo module) |

**Non-negotiable:** No duplicated logic. If it exists in greenride-admin, CCo services call it — they do not reimplement it.

## Implemented (2026-06-04)

**Mechanism:** local npm package `@grd/cco` (`GRD-CC/package.json`), consumed by admin via `"@grd/cco": "file:../GRD-CC"`.

| Piece | Location |
|-------|----------|
| Module source | `GRD-CC/src/` (components, services, store, theme, host registry) |
| Host API bridge | `greenride-admin-v.2-1/src/lib/admin-shell/host-bridge.ts` (`createAdminShellHost`) |
| Mount | `greenride-admin-v.2-1/src/components/shell-overlay.tsx` (`DashboardShellOverlay`) |
| Access gate | `greenride-admin-v.2-1/src/lib/admin-shell/access.ts` |
| Next | `transpilePackages: ['@grd/cco']` |
| Admin TS | `src/types/grd-cco.d.ts` path alias (runtime still resolves via `node_modules`) |
| Private ops docs | `GRD-CC/docs/migration-controller-map.md`, `GRD-CC/docs/host-opacity.md` |

Duplicate trees under `greenride-admin/src/components/cco` and `src/services/cco` were removed.

Admin always keeps: `(dashboard)/layout.tsx` shortcut + overlay mount, `super_admin` gate, ElevenLabs/main shell styling.

## Sync contract

1. **Build in GRD-CC** — features, services, Vercel UI
2. **Wire in admin** — import module; wrap existing `api-client` / config from host
3. **Specs & memory** — `GRD-CC/docs/`, `.ai-memory/` updated each slice
4. **Design** — `GRD-CC/DESIGN.md` + reference images; scoped theme in module
