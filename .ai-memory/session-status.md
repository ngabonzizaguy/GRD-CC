# Session Status — Read First in New Sessions

**Last updated:** 2026-06-04

---

## Current state

| Area | Status |
|------|--------|
| `@grd/cco` package | ✅ `GRD-CC/src/` |
| Admin embed | ✅ `file:../GRD-CC`, `admin-shell/host-bridge`, `DashboardShellOverlay` |
| Access control | ✅ `super_admin` only (shortcut, store, overlay, host) |
| Overlay isolation | ✅ `body.shell-overlay-active` hides main sidebar + header |
| Main nav ↔ CCo | ✅ `getAdminNavConfig()` drives desktop + mobile sidebar |
| Nav live sync | ✅ `host-nav-updated` event on save; host `useHostNavRevision` |
| Host opacity docs | ✅ `docs/migration-controller-map.md`, `docs/host-opacity.md` |

---

## CCo entry

- **Ctrl+Alt+Shift+M** (configurable in CCo → Shortcut)
- Requires logged-in **`super_admin`**
- Full-screen portal overlay (`z-index: 9999` in theme CSS)

---

## Sidebar menu panel (CCo)

- Persists to `localStorage` key `gr_cco_nav`
- Reorder / hide items → main admin sidebar updates without reload
- Defaults in `GRD-CC/src/config/admin-nav-config.ts` (includes Quick Booking, Shifts)

---

## Host files

| File | Role |
|------|------|
| `greenride-admin-v.2-1/src/lib/admin-shell/merge-host-nav.ts` | Nav override → Phosphor sections |
| `greenride-admin-v.2-1/src/lib/admin-shell/use-host-nav.ts` | Listen for nav updates |
| `greenride-admin-v.2-1/src/lib/admin-shell/access.ts` | `openPrivilegedShell` |
| `greenride-admin-v.2-1/src/components/shell-overlay.tsx` | Provider + overlay + body lock |

---

## Next work

- Backend gaps (`docs/backend-gaps.md`) — logs API, server nav, activity
- Smoke all CCo panels on mobile drawer
- Commit GRD-CC + admin integration branch
- Rebase safely with `feature/design-elevenlabs-redesign` (layout mount block)

---

## Coordination

- Do not change main `globals.css` theme tokens from CCo; overlay uses scoped theme CSS + `shell-overlay-active` lock
- Dashboard shell: avoid conflicting edits to `(dashboard)/layout.tsx` overlay mount
- Public admin commits: design-only wording per `docs/host-opacity.md`
