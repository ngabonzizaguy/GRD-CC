# Backend Gaps — APIs Required Before Full CCo UI

**Completed 2026-06-04** — CCo admin routes implemented in `greenride-api-clean`. `go build ./...` passes.

| # | Feature | Status | API paths |
|---|---------|--------|-----------|
| 1 | Shortcut prefs | Done | `GET/PUT /admin/cco/shortcut` |
| 2 | Dashboard override | Done | `GET/PUT /admin/cco/dashboard-overrides` |
| 3 | Environment registry | Done | `GET/PUT /admin/cco/env-registry` (audit via `t_admin_audit_log`; no secret echo) |
| 4 | RBAC | Done | `POST /admin/admins/search`, `/admins/update-role-permissions`, `/admins/create` (`Permissions` on create; `*permissions` pointer on update) |
| 5 | Sidebar CRUD | Done | `GET/PUT /admin/cco/navigation` |
| 6 | IP / secrets | Done | `GET/PUT /admin/cco/ip-allowlist`, `GET/PUT /admin/cco/secrets` (fingerprint only) |
| 7 | Connection control | Done | `GET/PUT /admin/cco/connection`, `GET /admin/integrations/health` |
| 8 | Logs | Done | `POST /admin/cco/logs/search` |
| 9 | Activity log | Done | `POST /admin/cco/activity/search`, `POST /admin/cco/activity/append` |

## Access

- **Read** (search, GET): `super_admin` or `audit_logs` permission (`RequireSuperAdminOrAudit`)
- **Write** (append, PUT): `super_admin` only (`RequireSuperAdmin`)
- **Login IP gate**: `CheckLoginPermission` → `models.IsGlobalCcoIPAllowed`

## Implementation map

| Area | Location |
|------|----------|
| DTOs | `internal/protocol/cco.go`, `response.admin_cco.go` |
| Settings model | `internal/models/admin_cco_settings.go` (`t_admin_cco_settings`, row id `1`) |
| Handlers | `internal/handlers/admin.cco.go`, `admin.cco_settings.go` |
| Routes | `internal/handlers/admin.go` under `/admin/cco/*` and `GET /admin/integrations/health` |
| Migrate | `internal/models/database.go` → `AdminCcoSettings` |
| Nav | `internal/models/admin_cco_nav.go` (`t_admin_cco_nav`) |
| Audit | `internal/models/admin_audit_log.go` (`t_admin_audit_log`) |

## Full route table

| Method | Path | Access |
|--------|------|--------|
| POST | `/admin/cco/activity/search` | super_admin or `audit_logs` |
| POST | `/admin/cco/activity/append` | super_admin |
| POST | `/admin/cco/logs/search` | super_admin or `audit_logs` |
| GET | `/admin/cco/navigation` | super_admin or `audit_logs` |
| PUT | `/admin/cco/navigation` | super_admin |
| GET | `/admin/cco/dashboard-overrides` | super_admin or `audit_logs` |
| PUT | `/admin/cco/dashboard-overrides` | super_admin |
| GET | `/admin/cco/shortcut` | super_admin or `audit_logs` |
| PUT | `/admin/cco/shortcut` | super_admin |
| GET | `/admin/cco/env-registry` | super_admin or `audit_logs` |
| PUT | `/admin/cco/env-registry` | super_admin |
| GET | `/admin/cco/ip-allowlist` | super_admin or `audit_logs` |
| PUT | `/admin/cco/ip-allowlist` | super_admin |
| GET | `/admin/cco/secrets` | super_admin or `audit_logs` |
| PUT | `/admin/cco/secrets` | super_admin |
| GET | `/admin/cco/connection` | super_admin or `audit_logs` |
| PUT | `/admin/cco/connection` | super_admin |
| GET | `/admin/integrations/health` | super_admin or `audit_logs` |

## Frontend wrap (existing)

- `api-client.ts` — `getAdmins`, `updateAdminRolePermissions`, `createAdmin`, `getSystemConfig`, `updateSystemConfig`
- `internal/handlers/admin.rbac.go` — admin search, role/permission updates, create admin
