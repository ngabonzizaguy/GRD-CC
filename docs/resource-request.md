# Resource Request — Justified File List

## greenride-admin-v.2-1 (implementation)

### Phase 0 — required (have access)

| File | Why |
|------|-----|
| `src/app/(dashboard)/layout.tsx` | Mount CCo overlay; shortcut opens overlay |
| `src/config/main-admin-shortcut.ts` | Single shortcut registration |
| `src/stores/auth-store.ts` | `super_admin` gate |
| `src/components/cco/*` | Overlay, theme, shell (new) |
| `src/stores/cco-store.ts` | Overlay state (new) |

### Phase 1+ — RBAC slice

| File | Why |
|------|-----|
| `src/app/(dashboard)/control/page.tsx` | Extract panels into CCo RBAC feature |
| `src/lib/api-client.ts` | Wrap L688–720, 1980–2050 (read-only audit sections) |
| `src/config/permissions.ts`, `src/types/index.ts` | Role/permission types |
| `src/services/cco/cco-rbac.service.ts` | Service layer (new) |
| `backend/.../admin.rbac.go`, `models/admins.go` | Contract parity |

### Phase 2+ — Sidebar, env, ops

| File | Why |
|------|-----|
| `src/components/layout/sidebar.tsx`, `mobile-sidebar.tsx` | Sidebar CRUD target |
| `src/stores/system-config-store.ts`, `settings/page.tsx` | Env/system config patterns |
| `.env.local.example`, `deploy.sh`, `deploy.yml` | Connection/env ops |

### Not required yet

- All 18 dashboard feature pages
- Full `api-client.ts` (2.2k lines)
- Entire Go backend tree

## GRD-CC (specs & agents)

| Path | Why |
|------|-----|
| `context/*` (4 files) | Mandatory pre-task load |
| `DESIGN.md`, `public/Vercel-UI-reference-images/` | CCo Vercel UI only |
| `.cursor/skills/*`, `agents/*`, `AGENTS.md` | Orchestration |
| `.ai-memory/*` | Decisions and session notes |
| `docs/*.md` | Audit deliverables |

## AgenticWorkflows (process only)

| File | Phase | Why |
|------|-------|-----|
| `micky-podcast-agentic-engineering/skills/agentic-engineering-workflow/SKILL.md` | Always | Master workflow |
| `skills/code-structure/SKILL.md` | Service work | Actions vs service layer |
| `skills/source-code-context/SKILL.md` | Integration | Search admin source first |
| `skills/grep-loop-review-workflow/SKILL.md` | Pre-merge | Review loop |
| `skills/code-structure-cleanup/SKILL.md` | Post-slice | Dedup pass |

## Integration mechanism (decided)

**Recommended:** `src/cco/` inside greenride-admin-v.2-1 with path alias `@/cco/*` → `./src/cco/*` (or `@/*` already covers `src/components/cco`). GRD-CC remains docs/specs; code syncs via PRs copying patterns from GRD-CC `DESIGN.md`. Optional future: npm workspace `@grd/cco` when GRD-CC gains publishable package.
