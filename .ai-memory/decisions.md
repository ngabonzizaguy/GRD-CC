# Decisions Log

Dated decisions for CCo and GRD-CC. Append new entries at the top. Do not delete history—strike through if reversed.

---

## 2025-06-04 — Isolated Vercel theme for CCo only

- **Decision:** CCo UI uses `data-theme="cco-vercel"` + `cco-theme.css` + Geist via `cco-fonts.ts`; main admin keeps GreenRide/ElevenLabs `globals.css`.
- **Rationale:** User requires Vercel look inside CCo without green buttons/sidebar inheriting on the overlay.
- **Applies to:** All CCo UI; Phase 0 shell.

---

## 2025-06-04 — CCo entry via full-screen overlay

- **Decision:** `Ctrl+Shift+Alt+M` opens `CcoOverlay` (portal) instead of navigating to `/control`; `/control` retained for proto-control until RBAC migration.
- **Rationale:** Audit plan recommends overlay; distinguishes superuser mode visually from main dashboard.
- **Applies to:** Feature 1 — Shortcut access; `layout.tsx`, `cco-store.ts`.

---

## 2025-06-04 — Service layer wrapping mandatory

- **Decision:** All CCo features must call `services/cco/*` before `api-client.ts`; UI must not import api-client for CCo flows.
- **Rationale:** Audit found monolithic api-client; duplication risk and inconsistent audit hooks without a single orchestration layer.
- **Alternatives rejected:** Direct api-client from components (faster but unmaintainable); separate micro-app for CCo (rejected—CCo is embedded).
- **Applies to:** All nine features.

---

## 2026-06-04 — GRD-CC is the CCo repo (canonical brief)

- **Decision:** CCo is **built in GRD-CC** and **embedded in** greenride-admin-v.2-1. GRD-CC is not a standalone app and not docs-only.
- **Rationale:** User Senior Staff Engineer brief: dedicated repo + strict sync with admin logic, no duplication.
- **Correction:** Interim work placed runtime files in admin `src/components/cco` — migrate module source into GRD-CC and consume from admin.
- **Applies to:** All agents; integration docs; future commits (GRD-CC vs admin split).

---

## 2025-06-04 — CCo is embedded, not standalone

- **Decision:** CCo ships inside greenride-admin-v.2-1; GRD-CC is the agent/spec workspace only.
- **Rationale:** Superuser layer must share auth, sidebar, and Zustand session with admin shell.
- **Applies to:** Architecture, deployment, agent scope.

---

## 2025-06-04 — Evolve proto-control at `/control`

- **Decision:** Extend existing `/control` route and `main-admin-shortcut.ts` (Ctrl+Shift+Alt+M) rather than new entry mechanism.
- **Rationale:** Audit confirmed working precursor; reduces operator retraining.
- **Applies to:** Feature 1 — Shortcut access; routing namespace.

---

## 2025-06-04 — GRD-CC sync strategy

- **Decision:** Specs and ADRs in GRD-CC; code in admin repo; update `.ai-memory/` when implementation diverges from context.
- **Rationale:** Single source of runtime truth (admin repo), single source of agent truth (GRD-CC).
- **Applies to:** All agents; documentation-writer skill.

---

## 2025-06-04 — Vercel design system via getdesign

- **Decision:** Use root `DESIGN.md` from `npx getdesign@latest add vercel` plus static images in `public/Vercel-UI-reference-images/`.
- **Rationale:** Align CCo UI with Vercel design language; reference images remain local and unmoved.
- **Applies to:** frontend-engineer; feature-builder UI steps.

---

## 2026-06-04 — Parallel UI workstreams

- **Decision:** Main admin ElevenLabs redesign (`feature/design-elevenlabs-redesign`, separate agent) and CCo Vercel overlay (this track) proceed **in parallel** with strict file ownership.
- **Rationale:** Different design systems; CCo must remain visually isolated; main admin can change freely under ElevenLabs without breaking superuser mode.
- **CCo-owned paths (prefer exclusive):** `src/components/cco/**`, `src/stores/cco-store.ts`, CCo-specific CSS, overlay mount in `layout.tsx` (minimal diff).
- **ElevenLabs-owned paths (other agent):** `globals.css`, dashboard pages, `sidebar.tsx`, `header.tsx`, `public/UI-references/`, etc.
- **Applies to:** All agents; see `agent-notes.md` for merge guidance.

---

## Template (copy for new entries)

```markdown
## YYYY-MM-DD — <title>
- **Decision:** ...
- **Rationale:** ...
- **Alternatives rejected:** ...
- **Applies to:** Feature N — <name>
```
