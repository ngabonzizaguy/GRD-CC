# Agent Notes

Ephemeral, session-to-session tactical notes. Prefer dated bullets; archive stale items into `lessons-learned.md`.

---

## 2025-06-04 — Phase 0 implemented

- **Admin:** `src/components/cco/*`, `src/stores/cco-store.ts`, dashboard `layout.tsx` opens overlay on Ctrl+Shift+Alt+M.
- **Theme:** Isolated Vercel tokens; user confirmed understanding: CCo = Vercel, main admin = ElevenLabs/GreenRide.
- **Docs:** `GRD-CC/docs/audit-feature-mapping.md`, `backend-gaps.md`, `resource-request.md`, `execution-plan.md`, `grd-cc-integration.md`, `agentic-workflows-loading.md`.
- **Test:** `npm run dev` → login super_admin → Ctrl+Shift+Alt+M → black/white CCo shell; Escape or Exit to close.

---

## 2025-06-04 — Workspace bootstrap

- GRD-CC agent infrastructure created: `context/`, `agents/`, `.cursor/skills/`, `.ai-memory/`, `AGENTS.md`.
- **getdesign install:** SUCCESS — `npx getdesign@latest add vercel` wrote root `DESIGN.md` (Vercel design analysis: colors, typography Geist/Inter, components guidance). No separate font/icon binary packages observed in GRD-CC; design contract is agent-readable markdown.
- **UI references:** `public/Vercel-UI-reference-images/` — **11 JPEG screenshots** present (Vercel dashboard UI). Do not relocate.
- **Admin repo:** greenride-admin-v.2-1 is implementation target; link path in workspace when available for repository-analyzer runs.
- **Precursor confirmed by audit:** `/control`, `main-admin-shortcut.ts`, Ctrl+Shift+Alt+M.
- **Next recommended slice:** Extract proto-control handlers into `services/cco/` (refactor-assistant) before Feature 3 Environment CRUD UI.

---

## Design system boundary (verified)

- **CCo only:** Vercel design via `DESIGN.md` + `public/Vercel-UI-reference-images/`. Do not restyle the main admin shell with Vercel tokens.
- **greenride-admin-v.2-1:** ElevenLabs / GreenRide design (e.g. `globals.css` green brand, shadcn). CCo overlay must be **scoped** so it does not override admin theme variables.

## Open items

- **Shortcut spec** — Brief says Ctrl+Alt+Shift+M; implemented as Ctrl+Shift+Alt+M; align with PM before changing.
- **ElevenLabs issues** — User to document known regressions in `session-status.md` → `lessons-learned.md`.
- **Phase 1** — RBAC service + panel (see `session-status.md`).

## 2026-06-04 — ElevenLabs redesign finished; CCo coexists

- **Branch:** `feature/design-elevenlabs-redesign` is active in admin repo; redesign **complete** (user: a few issues remain — log in `session-status.md`).
- **CCo Phase 0** still present on that branch (`CcoOverlay` + shortcut in `layout.tsx`).
- **Handoff file:** `.ai-memory/session-status.md` — **read every new session**.
- **Phase 1 RBAC done:** `cco-rbac.service.ts`, `cco-rbac-panel.tsx`, `cco-content-panel.tsx`; `/control` thin wrapper.
- **Next CCo slice:** Phase 2 shortcut + dashboard override service.

## 2026-06-04 — CCo Phases 2–6 service layer

- **Services:** `cco-shortcut`, `cco-dashboard-override`, `cco-env`, `cco-sidebar`, `cco-connection`, `cco-secrets`, `cco-logs`, `cco-activity` + `cco-activity-log.ts`; barrel `src/services/cco/index.ts`.
- **Config:** `cco-shortcut-config.ts` (`gr_cco_shortcut`), `admin-nav-config.ts` (`gr_cco_nav`); `main-admin-shortcut.ts` delegates to `isCcoShortcut`.
- **RBAC:** `recordCcoActivity` on create/update admin success.
- **Panels agent:** wire UI to `@/services/cco` exports only (no api-client in panels).

---

## Template

```markdown
## YYYY-MM-DD — <session topic>
- ...
```
