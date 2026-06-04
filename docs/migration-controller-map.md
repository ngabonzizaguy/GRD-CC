# Migration controller map (private — GRD-CC only)

Operator runbook: validate infrastructure cutover through the **ultimate admin controller** (privileged overlay + `CcoHostAdapter`). Do not paste this doc or its internal names into public admin commit messages.

## Access

| Requirement | Detail |
|-------------|--------|
| Role | `super_admin` only (`canAccessCco()` / server `/admin/cco/*`) |
| Entry | Keyboard shortcut (see `cco-shortcut-config.ts` in this repo) |
| Host bridge | `greenride-admin-v.2-1/src/lib/admin-shell/host-bridge.ts` → `createAdminShellHost()` |
| Legacy URL | `/control` on host redirects to `/` — use shortcut only |

## Feature → migration dependency matrix

| Migration area | Controller feature (`CcoFeatureId`) | What to verify | Host / backend hook |
|----------------|-----------------------------------|----------------|---------------------|
| Admin API URL / DNS / TLS | `overview`, `connection` | API healthy; correct base URL; demo off | `NEXT_PUBLIC_API_URL`, `getAdminInfo` / health probe |
| Reverse-proxy API prefix | `connection` | Prefix matches gateway | `NEXT_PUBLIC_API_PREFIX` |
| Demo vs live data | `connection` | Demo mode off in production | `NEXT_PUBLIC_DEMO_MODE` |
| Build-time map keys | `env` (build-time rows) | Google / Mapbox keys present | `readHostEnv()` in host bridge |
| Runtime map / AI keys | `env`, `secrets` | Fingerprints show configured | `GET/POST /system/config` |
| JWT / session | `connection`, `overview` | Login works; `/info` responds | Server `GREENRIDE_SERVER_ADMIN_JWT_SECRET` |
| MySQL | `overview`, `activity`, `logs` | Audit search/append succeeds | `GREENRIDE_DATABASE_DSN`; tables `t_admin_audit_log`, `t_admin_cco_nav` |
| Redis / Asynq | `connection` (indirect) | API stable under load | `GREENRIDE_REDIS_DSN` |
| RBAC / admin accounts | `rbac` | Expected admins; permissions | `getAdmins`, `updateAdminRolePermissions`, `createAdmin` |
| Sidebar structure | `sidebar` | Nav matches policy | `GET/PUT /admin/cco/navigation` |
| Firebase / FCM | `secrets`, `env` | Flags + metadata | `firebase.*` / `GREENRIDE_FIREBASE_*` |
| SMS / OTP (Twilio, InnoPaaS) | `secrets` | Provider configured on server | `prod.yaml` + server `.env` |
| Payments (Stripe, KPay, MoMo) | `secrets` | Webhooks point at `api.greenrideafrica.com` | `payment.*`, webhook paths |
| AWS S3 / uploads | `secrets` (partial) | Bucket/region on server | `aws.s3_*`; IAM on EC2 |
| Grafana Loki | `logs` (partial) | Logs shipping if enabled | `log.loki.*` in server `prod.yaml` |
| GitHub Actions / SSH deploy | *Gap* | Manual: workflow + `SSH_PRIVATE_KEY` | See `backend-gaps.md` → integration health |
| EC2 / Docker | `connection` | Containers up after deploy | Host paths in `host-opacity.md` |
| Third-party webhooks | *Gap* | Re-register URLs after DNS move | Future `getIntegrationHealth` on host API |

## Post-cutover sequence (super_admin)

1. Log in on new admin origin.
2. Open privileged shell (shortcut) → **Overview**: API healthy, admin count sane, recent activity.
3. **Connections**: production API URL, demo off, latency acceptable.
4. **Environment**: build-time + runtime config rows look correct.
5. **IP & secrets**: fingerprints for OpenAI, Mapbox, Google keys (no full secret echo).
6. **RBAC**: required accounts and permissions.
7. **Sidebar menu**: structure saved and reflected in host nav.
8. **Activity log** / **System logs**: search returns rows; append test entry if policy allows.

## Gaps (extend controller, not public admin UI)

From `backend-gaps.md`:

- Env registry with audit (beyond `/system/config`)
- IP allowlist CRUD
- `GET /admin/integrations/health` (Stripe, InnoPaaS, Redis, deploy, etc.)
- Dashboard override server persistence
- Shortcut prefs server persistence (optional)

Implement new surfaces only on **`CcoHostApi`** + private package — never duplicate in host `api-client` for normal admins.

## Repos and deploy notes

| Repo | Remote (typical) | Deploy |
|------|------------------|--------|
| `GRD-CC` | Private `GRD-CC` (stays with original owner) | `/home/ubuntu/GRD-CC` synced each deploy — see admin `docs/DEPLOY-EMBEDDED-MODULE.md` |
| `greenride-admin-v.2-1` | `greenride-admin-v.2` (may transfer owner) | EC2 Docker on push to `main`; preserve server `.env.local` + `/home/ubuntu/greenride-api/*` |

CI and `deploy.sh` run `sync-embedded-module.sh` then build from `/home/ubuntu` so `file:../GRD-CC` resolves inside Docker.

## Related docs

- `host-opacity.md` — public vs private naming and commit wording
- `grd-cc-integration.md` — host bridge paths and sync contract
- `backend-gaps.md` — API work still open
