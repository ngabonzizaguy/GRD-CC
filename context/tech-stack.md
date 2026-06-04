# Tech Stack

## Primary Application (greenride-admin-v.2-1)

CCo ships inside the admin application. GRD-CC agents implement there; this document defines the stack agents must assume.

| Layer | Technology | Notes for CCo |
|-------|------------|---------------|
| Framework | **Next.js 16** (App Router) | Server Components where safe; client components for interactive CCo panels |
| UI library | **React 19** | Prefer composition; avoid legacy class components |
| Language | **TypeScript** (strict) | Shared types between services and UI props |
| Styling | **Tailwind CSS 4** | Align tokens with `DESIGN.md` CSS variables where added |
| Components | **shadcn/ui** | Extend primitives; do not fork vendor files without reason |
| State | **Zustand** | CCo-local stores only when not available globally |
| API access | **`api-client.ts` monolith** | All network I/O; CCo uses services on top |
| Design reference (CCo only) | **getdesign / Vercel** | `GRD-CC/DESIGN.md` + `public/Vercel-UI-reference-images/` (11 refs) |
| Main admin design | **ElevenLabs / GreenRide** | `greenride-admin-v.2-1/src/app/globals.css` — not Vercel |

## GRD-CC Workspace (This Repo Folder)

| Layer | Technology | Purpose |
|-------|------------|---------|
| Documentation | Markdown | `context/`, `agents/`, `AGENTS.md`, `.ai-memory/` |
| Agent skills | Cursor `SKILL.md` | `.cursor/skills/*/SKILL.md` |
| UI references | Static images | `public/Vercel-UI-reference-images/` |
| Design tokens | YAML-frontmatter `DESIGN.md` | Agent-readable design contract |

## Tooling & Workflow

| Tool | Usage |
|------|--------|
| **Cursor agents** | Multi-agent orchestration per `AGENTS.md` |
| **npm / npx** | Admin repo scripts; `npx getdesign@latest add vercel` for design install |
| **Git** | Structured commits; small PRs per feature |
| **Vercel** (deployment) | Admin app hosting; preview envs for CCo QA |

## Key Files (Admin Repo — Audit References)

| File / area | Relevance |
|-------------|-----------|
| `main-admin-shortcut.ts` | Global CCo entry shortcut |
| `/control` route | Proto-control precursor |
| `api-client.ts` | Underlying HTTP; never bypass from CCo UI |
| App Router `app/` tree | CCo layouts and nested routes |
| shadcn `components/ui/` | Base widgets for CCo tables/forms |

## Environment & Configuration

- Environment variables for CCo should be managed through the **Environment CRUD** feature’s service paths, not ad-hoc `.env` edits in production.
- Local dev: use admin repo `.env.local`; document new keys in `.ai-memory/decisions.md`.

## Testing Stack (Expected in Admin Repo)

| Type | Typical stack |
|------|----------------|
| Unit | Vitest or Jest (match repo convention) |
| Component | React Testing Library |
| E2E | Playwright (if present—confirm in repo before adding tests) |

GRD-CC **test-generator** skill proposes tests; **testing-agent** validates against real project config.

## Version Policy

- Stay on repo-pinned versions (Next 16, React 19, Tailwind 4).
- Do not downgrade for convenience.
- Major upgrades: document in `.ai-memory/architecture-decisions.md` before implementation.

## External Dependencies Policy

- Prefer existing admin dependencies.
- New packages require PM approval and ADR entry (bundle size, security, maintenance).
