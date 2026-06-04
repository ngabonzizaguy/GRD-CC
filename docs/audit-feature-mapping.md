# CCo Feature × Implementation Mapping

Audit date: 2025-06-04. Source of truth: `greenride-admin-v.2-1`.

| # | Feature | Reuse (existing) | Wrap (service layer) | Net-new | Key file paths |
|---|---------|------------------|----------------------|---------|----------------|
| 1 | Shortcut access | `main-admin-shortcut.ts`, `isMainAdminShortcut`, dashboard `layout.tsx` keydown | `cco-shortcut.service.ts` — eligibility, configurable shortcut persistence | CCo overlay open/close store; shortcut settings UI in CCo | `src/config/main-admin-shortcut.ts`, `src/app/(dashboard)/layout.tsx`, `src/stores/cco-store.ts`, `src/components/cco/cco-overlay.tsx` |
| 2 | Dashboard override | `main-admin-prefs.ts`, `main-admin-prefs-store.ts`, sidebar `filterNavByFeatureToggles` | `cco-dashboard-override.service.ts` — sync prefs server-side (future) | Server-backed override API; incident override panels | `src/config/main-admin-prefs.ts`, `src/stores/main-admin-prefs-store.ts`, `src/components/layout/sidebar.tsx` |
| 3 | Environment CRUD | `getSystemConfig`, `updateSystemConfig` in `api-client.ts` | `cco-env.service.ts` | `.env` file registry API; build-time `NEXT_PUBLIC_*` admin API | `src/lib/api-client.ts` (L1980–2050), `src/stores/system-config-store.ts`, `src/app/(dashboard)/settings/page.tsx`, `.env.local.example` |
| 4 | RBAC | `/control/page.tsx`, `getAdmins`, `updateAdminRolePermissions`, `createAdmin` | `cco-rbac.service.ts` | Stronger route guards; server-synced main-admin prefs | `src/app/(dashboard)/control/page.tsx`, `src/lib/api-client.ts` (L688–720), `src/config/permissions.ts`, `backend/.../internal/handlers/admin.rbac.go`, `backend/.../internal/models/admins.go` |
| 5 | Sidebar CRUD | `sidebar.tsx`, `mobile-sidebar.tsx`, `filterNavByPermission`, `sidebar-store.ts` | `cco-sidebar.service.ts` | Nav config API + shared nav module (desktop/mobile) | `src/components/layout/sidebar.tsx`, `src/components/layout/mobile-sidebar.tsx`, `src/stores/sidebar-store.ts` |
| 6 | IP / secrets | `AdminUser.last_login_ip` type; system config keys in `SystemConfigResponse` | `cco-secrets.service.ts` | IP allowlist API; secrets metadata API (no raw values in UI) | `src/types/index.ts`, `src/lib/api-client.ts`, `backend/.../internal/config/` |
| 7 | Connection control | `NEXT_PUBLIC_API_URL`, `api-client` base URL, `deploy.sh`, `.github/workflows/deploy.yml` | `cco-connection.service.ts` | Health dashboard; connection policy API | `src/lib/api-client.ts`, `deploy.sh`, `README.md` |
| 8 | Logs | `audit_logs` permission constant | `cco-logs.service.ts` | Admin log ingest + list API; log viewer UI | `src/config/permissions.ts`, `backend/.../internal/models/admins.go` (permission only) |
| 9 | Activity log | Dashboard “recent activity” (orders only) | `cco-activity.service.ts` | Admin audit trail API + real-time feed | `src/app/(dashboard)/page.tsx`, `src/app/(dashboard)/drivers/[id]/page.tsx` (empty activity tab) |

## Phase 0 (implemented in admin repo)

| Deliverable | Path |
|-------------|------|
| Full-screen overlay + shortcut | `src/components/cco/cco-overlay.tsx`, `src/stores/cco-store.ts` |
| Isolated Vercel theme | `src/components/cco/cco-theme.css` (`data-theme="cco-vercel"`) |
| Shell layout (nav + top bar + placeholders) | `src/components/cco/cco-shell.tsx`, `cco-sidebar.tsx`, `cco-top-bar.tsx` |
| Geist fonts (CCo only) | `src/components/cco/cco-fonts.ts` |
| Proto-control route preserved | `src/app/(dashboard)/control/page.tsx` (unchanged; overlay is primary entry) |

## Service layer convention

```
src/services/cco/<feature>.service.ts  →  apiClient.*  →  Go handlers
```

CCo UI must not import `@/lib/api-client` directly.
