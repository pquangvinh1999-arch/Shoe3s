# Current Task

- Task ID: `P04-T02`
- Owner: `ux-director`
- Status: `active`
- Goal: Implement design system and booking funnel.
- Allowed changes: `apps/web/src` (design tokens, booking UI), tests, evidence.
- Forbidden changes: legacy `index.html`/`js/app.js` public flow, admin behavior, route compatibility, deployment.
- Required evidence:
  - `.agent/evidence/P04-T02/`
- Gate state: `implementation_gate = pending`; code allowed for this task only.
- Next action: Build booking funnel in React shell: wizard (chọn dịch vụ → thông tin → nhận/trả → review → submit qua /api/orders) with design tokens from MASTER_CONTEXT §6, a11y (keyboard, 44px touch), retry-safe idempotency.
