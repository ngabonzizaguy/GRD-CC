# GRD-CC Agent Orchestration

Master guide for multi-agent work on **CCo** (Control Center Operations) in **greenride-admin-v.2-1**, coordinated from this **GRD-CC** workspace.

## Mission

Deliver nine embedded superuser capabilities without duplicating admin-repo logic. GRD-CC holds context, skills, memory, and agent roles; the admin application holds runtime code.

## Standing Rules (Embedded)

1. **Always load** all four `context/` files before any task: `project-overview.md`, `architecture.md`, `tech-stack.md`, `coding-standards.md`.
2. **Plan before coding** — routes, services, api-client touchpoints, verification, doc updates.
3. **Never duplicate** logic from greenride-admin-v.2-1 — wrap via service layer and existing `api-client.ts`.
4. **Self-document** after every feature — `.ai-memory/` + documentation-writer skill.
5. **Structured commits** — `type(scope): subject`, one concern per commit.

## Project Manager Delegation

The **project-manager** agent is the default orchestrator for any task touching more than one specialty or feature.

### Delegation flow

```
User request
    → PM loads context + memory
    → PM publishes slice brief (feature ID, owners, files, acceptance)
    → Parallel work with declared merge order:
         1) backend services + api-integration skill
         2) frontend UI (blocked until types exist)
         3) devops (IP/secrets, connection) when in slice
    → test-generator + testing-agent sign-off
    → documentation-writer + .ai-memory updates
    → PM close
```

### When PM is required

- Multi-feature PRs or unclear scope.
- New api-client methods or dependencies.
- Parallel subagents without file ownership.
- Production config or allowlist changes.

### When PM can defer

- Single-file doc fix in GRD-CC only.
- Read-only repository-analyzer run.

## Agent ↔ CCo Feature Ownership

| # | Feature | Primary | Support |
|---|---------|---------|---------|
| 1 | Shortcut access | frontend-engineer | backend-engineer, testing-agent |
| 2 | Dashboard override | frontend-engineer | backend-engineer, testing-agent |
| 3 | Environment CRUD | backend-engineer | frontend-engineer, devops-agent, testing-agent |
| 4 | RBAC | backend-engineer | frontend-engineer, documentation-agent, testing-agent |
| 5 | Sidebar CRUD | frontend-engineer | backend-engineer, testing-agent |
| 6 | IP / secrets | devops-agent | backend-engineer, testing-agent |
| 7 | Connection control | devops-agent | backend-engineer, frontend-engineer, testing-agent |
| 8 | Logs | backend-engineer | frontend-engineer, documentation-agent |
| 9 | Activity log | backend-engineer | documentation-agent, testing-agent |

Agent definitions: `agents/*.md`.

## Skills — Triggers and Usage

| Skill | Path | When it triggers |
|-------|------|------------------|
| repository-analyzer | `.cursor/skills/repository-analyzer/` | Workspace open, branch change, pre-epic audit |
| feature-builder | `.cursor/skills/feature-builder/` | Implementing one CCo feature slice |
| api-integration | `.cursor/skills/api-integration/` | api-client or service wiring |
| bug-investigator | `.cursor/skills/bug-investigator/` | Defects, failed sign-off, auth/audit issues |
| refactor-assistant | `.cursor/skills/refactor-assistant/` | Proto-control extraction, dedup refactors |
| test-generator | `.cursor/skills/test-generator/` | After services land; testing-agent request |
| documentation-writer | `.cursor/skills/documentation-writer/` | Post-feature self-doc; context drift |

Skills use `SKILL.md` with YAML frontmatter (`name`, `description`) for Cursor discovery.

### Recommended skill chain per slice

1. `repository-analyzer` (if repo state unknown)
2. `feature-builder` + `api-integration`
3. `test-generator` → testing-agent review
4. `documentation-writer`
5. `bug-investigator` only if failures appear

## Parallel Agent Coordination

### File ownership

- PM assigns **exclusive paths** per agent for the slice (e.g. `services/cco/env.service.ts` → backend only).
- Frontend does not edit service files except type imports; backend does not edit shadcn layout except via agreed props.

### Merge order

1. Service + types merged first.
2. UI PR rebased on service branch or same PR with backend commits first.
3. Devops runbook/docs can parallel UI after service contracts stable.

### Conflict avoidance

- No two agents on the same feature ID without PM brief.
- Cross-feature work is sequential unless PM explicitly parallelizes with non-overlapping files.

### Communication

- Handoffs use template in `agents/project-manager.md`.
- Tactical notes: `.ai-memory/agent-notes.md`.
- Decisions: `.ai-memory/decisions.md`.

## Design and UI Assets

- **DESIGN.md** (root): Vercel-inspired tokens from `npx getdesign@latest add vercel` — mandatory UI reference for agents.
- **Reference images:** `public/Vercel-UI-reference-images/` — do not relocate; use for layout fidelity.

## Sync with greenride-admin-v.2-1

| GRD-CC | Admin repo |
|--------|------------|
| Specs, ADRs, agent rules | Routes, components, services |
| Skills & orchestration | Runtime behavior |
| `.ai-memory/` | Implementation truth (update both when diverging) |

Implementation PRs target the admin repo; documentation PRs may target GRD-CC or the same PR cycle when paired.

## Proto-Control Baseline

Existing entry: `/control` + **Ctrl+Shift+Alt+M** (`main-admin-shortcut.ts`). CCo evolves this; do not remove shortcut until replacement is verified.

## Quick Start for Any Agent

1. Read `context/*` (all four).
2. Read **`.ai-memory/session-status.md`** for what is done vs next.
3. Read `.ai-memory/decisions.md` for recent ADRs.
4. Confirm role in table above or invoke PM.
5. Apply relevant skill from `.cursor/skills/`.
6. Plan → implement in admin repo → verify → self-document.

## Related Files

- `context/` — domain and architecture truth
- `agents/` — role definitions
- `.ai-memory/` — durable decisions and lessons
- `.cursor/skills/` — executable workflows
