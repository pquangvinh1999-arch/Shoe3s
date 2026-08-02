# Current Task

- Task ID: `P04-T04`
- Owner: `ux-director`
- Status: `active`
- Goal: Add 2D / reduced-motion / device fallbacks.
- Allowed changes: `apps/web/src` (viewer + wizard fallbacks), tests, evidence.
- Forbidden changes: legacy `index.html`/`js/app.js` public flow, admin behavior, route compatibility, deployment.
- Required evidence:
  - `.agent/evidence/P04-T04/`
- Gate state: `implementation_gate = pending`; code allowed for this task only.
- Next action: Implement fallbacks:
  1. No-WebGL / error → 2D static poster (canvas or SVG) với dirty-to-clean state;
  2. `prefers-reduced-motion` → không auto-rotate (đã có ở adapter) + không rAF liên tục (render-on-demand);
  3. Coarse pointer/low-power → poster thay vì 3D nếu quá yếu;
  4. Giữ slider mức độ bẩn hoạt động trên cả 2D lẫn 3D.
