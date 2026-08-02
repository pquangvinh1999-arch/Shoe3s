# Current Task

- Task ID: `P04-T03`
- Owner: `domain-architect`
- Status: `active`
- Goal: Build adaptive 3D dirty-to-clean scene.
- Allowed changes: `apps/web/src` (3D feature), tests, evidence.
- Forbidden changes: legacy `index.html`/`js/app.js` public flow, admin behavior, route compatibility, deployment.
- Required evidence:
  - `.agent/evidence/P04-T03/`
- Gate state: `implementation_gate = pending`; code allowed for this task only.
- Blocker/Risk: R-009 — no licensed 3D shoe asset yet. Decision needed: procure licensed GLB or build procedural model (fallback default).
- Budget: 3D chunk ≤ 350KB gzip; lazy-loaded only when user reaches preview step.
- Next action: Decide asset strategy, then lazy-load three.js scene into wizard step (dirty-to-clean toggle or per-service preview).
