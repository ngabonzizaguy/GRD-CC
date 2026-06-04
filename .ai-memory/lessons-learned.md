# Lessons Learned

Operational and engineering lessons from CCo work. Search before debugging similar issues.

---

## 2025-06-04 — getdesign CLI flags

- **Symptom:** `npx getdesign@latest add vercel --yes` fails with unknown option.
- **Cause:** getdesign does not support `--yes` in current CLI.
- **Fix:** Run `npx getdesign@latest add vercel` without extra flags; installs `DESIGN.md` non-interactively when defaults apply.

---

## 2025-06-04 — api-client monolith coupling

- **Symptom:** Temptation to copy-paste HTTP for one CCo screen.
- **Cause:** Large `api-client.ts` hard to navigate.
- **Fix:** repository-analyzer skill maps methods first; api-integration skill extends client only when contract missing.

---

## 2025-06-04 — Proto-control shortcut dependency

- **Symptom:** Breaking Ctrl+Shift+Alt+M blocks operator access during migration.
- **Cause:** `main-admin-shortcut.ts` is single registration point.
- **Fix:** Extend shortcut handler; feature-flag new routes; testing-agent verifies both old and new paths until cutover.

---

## Template

```markdown
## YYYY-MM-DD — <title>
- **Symptom:** ...
- **Cause:** ...
- **Fix:** ...
```
