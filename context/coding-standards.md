# Coding Standards

Derived from **AgenticWorkflows** practices and CCo audit constraints. All contributors and agents must follow these rules in greenride-admin-v.2-1 and when updating GRD-CC documentation.

## Pre-Task Checklist

1. Read **all four** `context/` files (`project-overview`, `architecture`, `tech-stack`, this file).
2. Read **`.ai-memory/session-status.md`** for cross-session progress.
3. Read relevant `.ai-memory/` entries for the feature area.
3. Produce a short plan: routes, services, api-client methods touched, tests, docs.
4. Confirm no duplicate logic will be introduced.

## Service Layer (Non-Negotiable)

- **Every** CCo feature calls a dedicated service module before `api-client.ts`.
- Services are **thin**: validate inputs, call existing client methods, map errors, emit activity-log events.
- **Forbidden:** UI components importing `api-client` directly for CCo flows.
- **Forbidden:** Copy-pasting api-client functions into `services/cco/` with renamed wrappers that duplicate HTTP.

```typescript
// Good
export async function updateEnvKey(input: EnvKeyInput) {
  const parsed = envKeySchema.parse(input);
  const result = await apiClient.config.updateEnv(parsed);
  await activityLog.record({ action: 'env.update', ... });
  return mapConfigResult(result);
}

// Bad — duplicates HTTP in service
export async function updateEnvKey(input: EnvKeyInput) {
  return fetch('/api/config', { method: 'POST', body: JSON.stringify(input) });
}
```

## No Duplication from greenride-admin-v.2-1

- Search the admin repo for existing helpers before writing new utilities.
- If behavior is 80% similar, **extend** the existing function with parameters rather than fork.
- Proto-control at `/control` is the baseline—refactor in place when possible.

## Planning & PR Size

- **Plan before coding:** bullet list of files, risks, rollback, verification steps in PR description or agent handoff.
- **Small PRs:** one CCo feature slice (or sub-slice) per PR when feasible.
- Max ~400 lines changed per PR unless PM approves exception.

## Verification Loops

1. **Static:** Typecheck and lint clean.
2. **Unit:** Service methods with mocked api-client.
3. **Manual:** Superuser path, shortcut, activity log entry for mutations.
4. **Regression:** Standard admin flows unaffected (non-superuser smoke).

Do not mark work complete without explicit verification notes in PR or `.ai-memory/agent-notes.md`.

## UI Standards

- Follow **`DESIGN.md`** (Vercel-inspired tokens, Geist/Inter, hairline borders, ink/canvas palette).
- Use **shadcn/ui** primitives; custom CSS only when tokens insufficient.
- Compare layouts to **`public/Vercel-UI-reference-images/`** before PM sign-off.
- Accessible: focus rings, labels, keyboard operability for shortcut-gated flows.

## State Management

- Prefer server-fetched data in RSC where possible.
- Zustand only for client-only CCo UI state (panel open, filters).
- Do not duplicate global session state.

## Security & Logging

- Never log secrets, tokens, or full env values.
- RBAC and IP changes require confirmation UI and activity-log record.
- Fail closed on auth errors (redirect or 403, not partial render).

## Self-Documentation (After Every Feature)

Update at minimum one of:

- `.ai-memory/decisions.md` — what was decided
- `.ai-memory/lessons-learned.md` — pitfalls discovered
- `context/` — only if architectural truth changed

Include: feature name, service file paths, api-client methods used, known limitations.

## Structured Commits

Format: `type(scope): subject`

Types: `feat`, `fix`, `refactor`, `docs`, `test`, `chore`

Examples:

- `feat(cco): add env CRUD service and control panel`
- `fix(cco): redact secret values in connection status view`

Body: why, not just what. Link issue/PR if applicable.

## Error Handling

- Services return discriminated unions or Result types—no thrown strings to UI.
- User-facing messages: calm, actionable; technical detail in logs only.

## Naming Conventions

| Artifact | Convention |
|----------|------------|
| CCo routes | `/control/...` namespace |
| Services | `cco-<feature>.service.ts` or `services/cco/<feature>.ts` per repo norm |
| Components | `Cco<Feature><Part>.tsx` PascalCase |
| Activity actions | `cco.<feature>.<verb>` kebab or dot separated, stable forever |

## Code Review Expectations

- Reviewer checks service-layer boundary and activity log on mutations.
- No approval if api-client bypass or duplicated HTTP found.
- Design drift called out against `DESIGN.md` and reference images.

## Agent-Specific Reminder

Agents must not skip context load or planning steps to save tokens. Quality and sync with greenride-admin-v.2-1 take precedence over speed.
