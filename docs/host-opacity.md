# Host opacity guidelines (private — GRD-CC only)

How to keep the ultimate admin controller private while the **greenride-admin** repo stays a normal dashboard redesign in git history.

## Commit messages on this repo

Use bland subjects only — see **`docs/commit-messages.md`**. Example: `chore: layout module v0.1.0`. Avoid “privileged”, “embed”, codenames, or `GRD-CC` purpose in subjects.

## Two-repo split

| Repo | Visibility | Commit narrative |
|------|------------|------------------|
| **GRD-CC** (this repo) | Private team | Full detail OK: features, controller, migration |
| **greenride-admin-v.2-1** | Public / wider team | **Design only**: layout, sidebar, spacing, shell tokens, map UX — no controller name, no vendor layout name in messages |

## Neutral host paths (admin repo)

These are the only host-side integration files. Names are intentionally generic:

| Path | Purpose |
|------|---------|
| `src/lib/admin-shell/host-bridge.ts` | `createAdminShellHost()` — API + env bridge |
| `src/lib/admin-shell/access.ts` | `super_admin` gate, open/close overlay |
| `src/lib/admin-shell/theme-host.ts` | Scoped theme CSS import |
| `src/lib/admin-shell/fonts-host.ts` | Overlay fonts |
| `src/lib/admin-shell/merge-host-nav.ts` | Nav merge from module config |
| `src/lib/admin-shell/use-host-nav.ts` | Nav revision hook |
| `src/components/shell-overlay.tsx` | `DashboardShellOverlay` mount |

**Removed / avoided in host:**

- `src/lib/cco/*` (renamed)
- `src/components/cco-integration.tsx` (renamed)
- `/control` standalone RBAC page → redirects to `/`

Package import `@grd/cco` remains in `package.json` until you publish under a neutral private package name; that is a separate hardening step.

## Suggested public commit subjects (admin repo)

- `refine dashboard sidebar density and section labels`
- `adjust header and main content spacing`
- `update shell layout tokens and scroll behavior`
- `improve live map panel layout`

Avoid in admin commits: controller codename, overlay product name, third-party layout vendor name, `cco`, `control center`, private module name.

## Server layout (production)

Document for operators only:

| Path | Contents |
|------|----------|
| `/home/ubuntu/greenride-admin-v.2` | Admin git clone (owner may change after transfer) |
| `/home/ubuntu/GRD-CC` | **This repo** — synced every deploy; separate GitHub owner |
| `/home/ubuntu/greenride-api` | Live `config.yaml`, `prod.yaml`, `.env`, logs |

Deploy: `scripts/sync-embedded-module.sh` + `scripts/docker-build-frontend.sh` (parent context `/home/ubuntu`).

GitHub secrets:

- `SSH_PRIVATE_KEY` — EC2 deploy
- `GRD_CC_REPO_URL` (optional) — SSH clone URL for this repo; default `git@github.com:ngabonzizaguy/GRD-CC.git`

After admin transfer: update admin `origin` on server only; keep pulling GRD-CC from the original private remote.

## Event / CSS hooks

| Hook | Location |
|------|----------|
| `host-nav-updated` | Dispatched when nav override saves (GRD-CC `admin-nav-config.ts`) |
| `body.shell-overlay-active` | Hides main sidebar under overlay (`globals.css`) |

## What you may need to provide by hand

Nothing required for docs or host renames. For a full production hardening pass, optionally supply:

1. **Private npm/registry** coordinates if replacing `file:../GRD-CC`
2. **Confirmation** that EC2 has sibling `GRD-CC` at build time (or agree to vendor into admin CI)
3. **New obscure shortcut** if you want to rotate away from the default in `cco-shortcut-config.ts`
4. **List of integration health endpoints** you want added next (Stripe, InnoPaaS, etc.) for `backend-gaps.md` implementation
