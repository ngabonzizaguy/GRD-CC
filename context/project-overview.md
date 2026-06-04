# GRD-CC / CCo Project Overview

## What is CCo?

**CCo** (Control Center Operations) is an embedded **superuser control layer** inside **greenride-admin-v.2-1**. It is not a standalone application. Operators with elevated privileges use CCo to override dashboards, manage environment configuration, adjust RBAC and navigation, inspect connectivity, and audit system behavior without forking the main admin codebase.

The **GRD-CC** workspace (`GRD-CC/`) is the dedicated agent and documentation hub for designing, implementing, and maintaining CCo. It stays synchronized with the production admin repo so agents never treat CCo as an isolated greenfield project.

## Relationship to greenride-admin-v.2-1

| Aspect | greenride-admin-v.2-1 | GRD-CC |
|--------|------------------------|--------|
| Role | **Host app** — auth, API, existing admin UI (ElevenLabs), backend | **CCo module repo** — build UI + service wrappers here |
| CCo delivery | Thin integration: mount overlay, shortcut, import module | All CCo components, services, Vercel theme, feature panels |
| Data/API | Source of truth (`api-client`, config, handlers) | **Wrap only** — no duplicate HTTP or business rules |
| Precursor | Proto-control at `/control`, `main-admin-shortcut.ts` | Evolves into full CCo overlay + nine features |

**Sync rule:** Architect and implement CCo **in GRD-CC**. Wire into greenride-admin-v.2-1 so it runs inside the dashboard. One logical product, two repos: **module** vs **host**.

**Not standalone:** CCo does not deploy as its own app; it requires the admin host at runtime.

## Existing Precursor (Audit Finding)

Before full CCo rollout, the admin app already exposes **proto-control**:

- Route: `/control`
- Global shortcut: **Ctrl+Shift+Alt+M** (see `main-admin-shortcut.ts`)

CCo extends this pattern with richer UX (Vercel-aligned design per `DESIGN.md`), broader permissions, and the nine features below—not a replacement shortcut system.

## Design System Scope (Critical)

| Surface | Design system | Assets |
|---------|---------------|--------|
| **CCo** (overlay / `/control` namespace) | **Vercel** — `GRD-CC/DESIGN.md`, `public/Vercel-UI-reference-images/` | getdesign contract + reference screenshots |
| **greenride-admin-v.2-1** (main dashboard) | **ElevenLabs / GreenRide** — existing `globals.css`, shadcn theme | Do **not** apply Vercel tokens to main admin chrome |

CCo UI must be **visually and thematically isolated** from the main admin so operators can distinguish superuser mode from standard admin.

## Full Feature Scope (9 Capabilities)

1. **Shortcut access** — Secure entry to CCo (keyboard + gated UI), building on `main-admin-shortcut.ts`.
2. **Dashboard override** — Superuser views that supersede or augment standard dashboard data for incident response.
3. **Environment CRUD** — Create/read/update/delete environment-scoped settings without redeploying unrelated modules.
4. **RBAC** — Role and permission management for admin users; must respect existing auth boundaries.
5. **Sidebar CRUD** — Dynamic navigation structure for admin sections (ordering, visibility, labels).
6. **IP / secrets** — Allowlists, secret rotation visibility, and related security configuration (no secret values in logs).
7. **Connection control** — Enable/disable or diagnose integrations (APIs, websockets, third-party hooks).
8. **Logs** — Operational log surfacing for support and engineering (read-heavy, filterable).
9. **Activity log** — Immutable-leaning audit trail of privileged actions (who, what, when).

## UI Reference Assets

Static reference screenshots live at:

`public/Vercel-UI-reference-images/`

Do not relocate these assets. Use them alongside root `DESIGN.md` (from Vercel design system install) when implementing CCo surfaces.

## Standing Rules (All Agents)

1. **Load context first** — Read all four files in `context/` before any task.
2. **Plan before coding** — Outline service touchpoints, routes, and verification steps.
3. **No duplication** — Never reimplement logic that already exists in greenride-admin-v.2-1; wrap it.
4. **Self-document** — After each feature slice, update `.ai-memory/` and relevant `context/` notes.
5. **Structured commits** — One concern per commit; conventional, descriptive messages.

## Success Criteria for CCo

- Superuser flows are discoverable only to authorized roles.
- Every mutating action is traceable in the activity log.
- Service layer is the only path from UI to `api-client.ts` for CCo features.
- Visual language matches Vercel-inspired tokens in `DESIGN.md` and reference images.
- GRD-CC documentation stays accurate as greenride-admin-v.2-1 ships code.
