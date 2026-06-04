# CCo Architecture

## System Context

```
┌─────────────────────────────────────────────────────────────┐
│                  greenride-admin-v.2-1                      │
│  ┌──────────────┐   ┌─────────────────────────────────────┐   │
│  │ Admin shell  │   │ CCo (embedded superuser layer)      │   │
│  │ sidebar,     │   │ /control → CCo routes & components  │   │
│  │ dashboards   │   │ Ctrl+Shift+Alt+M shortcut gate      │   │
│  └──────┬───────┘   └──────────────┬──────────────────────┘   │
│         │                          │                          │
│         └──────────┬───────────────┘                          │
│                    ▼                                          │
│         ┌──────────────────────┐                              │
│         │   Service layer      │  ← mandatory for CCo         │
│         │   (feature services) │                              │
│         └──────────┬───────────┘                              │
│                    ▼                                          │
│         ┌──────────────────────┐                              │
│         │   api-client.ts      │  (existing monolith)        │
│         └──────────┬───────────┘                              │
│                    ▼                                          │
│              Backend APIs / WS                                │
└─────────────────────────────────────────────────────────────┘

┌──────────────────────┐         sync (specs, ADRs, PRs)
│ GRD-CC workspace     │ ─────────────────────────────────►
│ context/, agents/,   │
│ .ai-memory/, skills  │
└──────────────────────┘
```

## Module Boundaries

| Boundary | Owns | Must not own |
|----------|------|----------------|
| **CCo UI** | Superuser pages, modals, tables, forms, `DESIGN.md` tokens | Raw `fetch` to APIs; duplicate Zustand slices |
| **Service layer** | Orchestration, validation, error mapping, activity-log hooks | JSX, routing definitions |
| **api-client.ts** | HTTP contracts, auth headers, low-level retries | Business rules specific to CCo screens |
| **Zustand (admin)** | Shared session, tenant, global UI state | CCo-only state unless promoted deliberately |
| **GRD-CC docs** | Architecture, standards, agent workflows | Production runtime code (except experiments) |

## Service Layer Map (Target)

Each CCo feature gets a **thin service module** that delegates to existing api-client functions. Naming convention (in admin repo): `services/cco/<feature>.service.ts`.

| Feature | Service responsibility | Typical api-client dependencies |
|---------|------------------------|----------------------------------|
| Shortcut access | Session/eligibility checks before route mount | auth, user profile |
| Dashboard override | Aggregate override payloads, cache policy | dashboard, analytics endpoints |
| Environment CRUD | Env key validation, diff preview | config/env endpoints |
| RBAC | Role matrix reads/writes with guard rails | users, roles, permissions |
| Sidebar CRUD | Nav tree serialization, ordering | navigation/menu endpoints |
| IP / secrets | Metadata only in UI; redact values | security, secrets metadata |
| Connection control | Health probes, toggle flags | integrations, health |
| Logs | Paginated log queries, filters | logging endpoints |
| Activity log | Append audit records on mutations | audit/activity endpoints |

**Pattern (mandatory):**

```typescript
// UI / route → ccoFeatureService.method() → apiClient.existingMethod()
// Never: UI → apiClient directly for CCo
```

Wrap proto-control code paths first; extract shared helpers only when two features need identical shaping.

## Routing & Entry

- **Primary entry (Phase 0):** full-screen `CcoOverlay` opened by **Ctrl+Shift+Alt+M** from dashboard layout; `data-theme="cco-vercel"` scoped theme.
- **Legacy:** `/control` proto-control route remains until RBAC panel migrates into overlay.
- **Future:** optional nested routes under `/control/*` for deep links; overlay remains primary UX.
- **Shortcut:** `main-admin-shortcut.ts` is the single registration point.
- **Auth gate:** `super_admin` only; overlay returns null for other roles.

## Sync Strategy (GRD-CC ↔ greenride-admin-v.2-1)

1. **Spec in GRD-CC** — Update `context/` and `.ai-memory/decisions.md` when scope changes.
2. **Implement in admin repo** — Service + route + UI per feature; one PR per feature slice when possible.
3. **Verify** — Manual checklist + automated tests where they exist; document gaps in `.ai-memory/lessons-learned.md`.
4. **Back-propagate** — If implementation diverges from docs, fix GRD-CC context in the same PR cycle.

## Cross-Cutting Concerns

### Activity log

Every CCo **mutation** (POST/PUT/PATCH/DELETE) flows through a service method that records: actor, action key, resource id, timestamp, optional diff summary. Reads do not log by default unless required for compliance.

### Security

- Secrets: display fingerprints/labels only; never log raw values.
- IP allowlists: validate CIDR client-side for UX; authoritative check remains server-side.
- RBAC changes: require confirmation step and break-glass policy documented in `.ai-memory/`.

### Error handling

Services map api-client errors to typed results (`{ ok, data } | { ok: false, code, message }`). UI never parses raw HTTP bodies.

## Parallel Agent Coordination

- **Project Manager** assigns feature slices and declares file ownership to avoid merge conflicts.
- **Backend + Frontend** pair on the same feature ID; backend lands service contracts first.
- **Testing Agent** consumes acceptance criteria from PM brief before sign-off.
- **DevOps Agent** owns IP/secrets and connection-control operational runbooks.

## Design System Integration

- **DESIGN.md** (repo root): typography, color, spacing, component tone for all new CCo UI.
- **Reference images:** `public/Vercel-UI-reference-images/` for layout fidelity checks.

## Anti-Patterns

- Duplicating api-client methods under a CCo-specific client file.
- Large PRs touching multiple of the nine features at once.
- Standalone micro-app repo for CCo outside greenride-admin-v.2-1.
- Skipping activity log on “small” config toggles.
