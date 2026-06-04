# Architecture Decision Records (ADR)

Structural choices with long-lived impact. For tactical decisions see `decisions.md`.

---

## ADR-001 — Service layer as sole CCo integration boundary

**Status:** Accepted (2025-06-04)

**Context:** greenride-admin-v.2-1 exposes a monolithic `api-client.ts`. CCo adds nine privileged features without forking HTTP.

**Decision:** Introduce `services/cco/<feature>` modules that wrap api-client methods, map errors, and emit activity-log events on mutations.

**Consequences:**

- Positive: Testable orchestration; consistent audit; clear module map in `context/architecture.md`.
- Negative: Initial refactor cost for proto-control code at `/control`.
- Compliance: coding-standards.md enforcement in review.

---

## ADR-002 — Route namespace under `/control`

**Status:** Accepted (2025-06-04)

**Context:** Proto-control already mounts at `/control`.

**Decision:** Nested CCo routes remain under `/control/*` with superuser layout loader.

**Consequences:**

- Positive: Predictable URLs for operators and docs.
- Negative: `/control` layout must stay backward compatible during migration.
- Migration: refactor-assistant skill extracts logic into services without renaming public URLs until PM approves.

---

## ADR-003 — Activity log action key stability

**Status:** Accepted (2025-06-04)

**Context:** Audit and compliance need immutable action identifiers.

**Decision:** Use `cco.<feature>.<verb>` keys; never rename without alias period.

**Consequences:**

- Positive: Searchable audit trail across releases.
- Negative: Renaming requires dual-write or mapping table in activity log consumer.

---

## ADR-004 — GRD-CC vs admin repo separation

**Status:** Accepted (2025-06-04)

**Context:** Agent workspace setup at `GRD-CC/`.

**Decision:** GRD-CC holds context, agents, skills, memory, DESIGN.md, UI reference images; greenride-admin-v.2-1 holds executable app code.

**Consequences:**

- Positive: Agents load consistent docs; implementation PRs stay in admin repo.
- Negative: Requires discipline to update both when architecture changes.

---

## ADR-005 — No standalone CCo deployment

**Status:** Accepted (2025-06-04)

**Context:** Temptation to spin a separate admin for superusers.

**Decision:** CCo deploys with main admin Vercel project; feature flags optional per devops-agent.

**Consequences:**

- Positive: Shared auth and session; simpler ops.
- Negative: CCo bugs can affect admin shell—isolation via RBAC and route guards required.

---

## ADR-006 — CCo overlay + scoped Vercel theme

**Status:** Accepted (2025-06-04)

**Context:** CCo must look like Vercel (reference images, `DESIGN.md`); main admin uses ElevenLabs/GreenRide tokens.

**Decision:** Full-screen `CcoOverlay` portaled to `document.body` with `data-theme="cco-vercel"`. CSS variables and Geist fonts apply only inside the overlay. Shortcut opens overlay; `/control` unchanged for migration.

**Consequences:**

- Positive: Clear operator mental model; no `globals.css` edits.
- Negative: Two entry paths until `/control` is fully embedded in overlay panels.

---

## Template

```markdown
## ADR-NNN — <title>
**Status:** Proposed | Accepted | Deprecated
**Context:** ...
**Decision:** ...
**Consequences:** ...
```
