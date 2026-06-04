# Backend Gaps — APIs Required Before Full CCo UI

Items marked **Phase 0** need no backend (shell only). Others block live data wiring.

| Feature | Existing backend | Gap | Priority |
|---------|------------------|-----|----------|
| 1 Shortcut | JWT + `super_admin` role on `/info` | Persist shortcut prefs server-side (optional) | Low |
| 2 Dashboard override | None for main-admin prefs | `GET/POST /admin/cco/dashboard-overrides` or extend system config | Medium |
| 3 Environment CRUD | `GET/POST /system/config` (runtime keys) | `.env` registry: list keys, update with audit, no secret echo | High |
| 4 RBAC | `/admins/search`, `/admins/update-role-permissions`, `/admins/create` | None for MVP; tighten middleware | Low |
| 5 Sidebar CRUD | ✅ `GET/PUT /admin/cco/navigation` | Server sync + local fallback | Done (MVP) |
| 6 IP / secrets | Partial via system config | IP allowlist CRUD; secrets metadata (fingerprint only) | High |
| 7 Connection control | Health implicit in deploy | `GET /admin/integrations/health`, toggle flags | Medium |
| 8 Logs | ✅ `POST /admin/cco/logs/search` | Audit table `t_admin_audit_log` | Done (MVP) |
| 9 Activity log | ✅ `POST /admin/cco/activity/search` + `append` | Same audit table | Done (MVP) |

## Confirmed existing (wrap only)

- `backend/greenride-api-clean/internal/handlers/admin.rbac.go` — admin search, role/permission updates, create admin
- `api-client.ts` — `getAdmins`, `updateAdminRolePermissions`, `createAdmin`, `getSystemConfig`, `updateSystemConfig`

## Implemented CCo admin routes (2026-06-04)

| Method | Path | Access |
|--------|------|--------|
| POST | `/admin/cco/activity/search` | super_admin or `audit_logs` |
| POST | `/admin/cco/activity/append` | super_admin |
| POST | `/admin/cco/logs/search` | super_admin or `audit_logs` |
| GET | `/admin/cco/navigation` | super_admin or `audit_logs` |
| PUT | `/admin/cco/navigation` | super_admin |

Tables: `t_admin_audit_log`, `t_admin_cco_nav` (auto-migrate on API start).

## Still open

1. Env registry (extends system config) — list/update keys with audit, no secret echo
2. IP allowlist + connection health endpoints
3. Dashboard override server persistence (`/admin/cco/dashboard-overrides`)
4. Shortcut prefs server persistence (optional)
