# RULES

## Scope

- Only implement active task.
- New idea outside task → add backlog/decision, do not implement.
- No refactor “while here” without task/acceptance criteria.

## Git

- Dedicated feature branch.
- No force push.
- No direct commit to main.
- One logical task per commit/PR.
- Include task ID in commit.
- Never commit env files, downloaded credentials, DB dumps or private logs.

## Code

- TypeScript strict for new code.
- Server derives financial/security fields.
- Stable IDs, no business logic keyed only by display labels.
- No untrusted `innerHTML`.
- No silent catch for critical data writes.
- Explicit timeout/cancellation for network calls.
- Errors are user-safe and observable.
- Avoid duplicate libraries for same job.
- Dependencies pinned with lockfile.

## 3D

- No-WebGL route must pass.
- Poster before canvas.
- Lazy 3D chunk.
- Stop/pause offscreen and background.
- Quality tiers and adaptive downgrade.
- No continuous animation just for decoration.
- Asset license and budgets required.
- Never block booking behind animation.

## Data

- Backward-compatible migrations first.
- No destructive drop during cutover.
- RLS changes require matrix tests.
- Service role server-only.
- No raw PII in analytics/logs.
- Money integer VND.
- Status transition centralized.

## Verification

- Build/test/run, not visual assumption.
- Baseline known bugs remain explicit.
- Quality gate evidence saved under `orchestrator/evidence/`.
- Checkpoint before end of session.
