# Commit messages (private repo only)

This repo is **not** visible to junior devs on the public admin repo. Still keep history bland so clones, notifications, and screenshots do not leak capability names.

## Use

- `chore: refine dashboard shell spacing`
- `chore: layout module v0.1.1`
- `fix: sidebar overlay scroll on small viewports`
- `refactor: consolidate theme tokens`

## Avoid in subject lines

- Product codenames (CCo, control center, privileged, ultimate admin)
- `GRD-CC` / repo purpose callouts
- “embed”, “superuser”, “classified”, “Vercel UI” in commits
- Technical bridge terms (`CcoHostAdapter`, `@grd/cco`) unless necessary in private PR notes

## Public admin repo (separate)

Commits there stay **design-only** — see `host-opacity.md` in this repo.

## Rewriting history

If a subject was too explicit, amend on `main` and force-push **this private repo only**, then on EC2:

```bash
cd /home/ubuntu/GRD-CC && git fetch origin && git reset --hard origin/main
```
