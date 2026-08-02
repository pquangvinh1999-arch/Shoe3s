# Current Task

- Task ID: `P04-T01`
- Owner: `domain-architect`
- Status: `active`
- Goal: Create React/Vite shell and route split.
- Allowed changes: new `apps/` workspace scaffolding, Vite/React/TS config, routing adapter, tests, evidence.
- Forbidden changes: break `?page=order` or `/` compatibility, modify admin behavior, deployment.
- Required evidence:
  - `.agent/evidence/P04-T01/`
- Gate state: `implementation_gate = pending`; code allowed for this task only.
- Next action: Scaffold React/Vite/TypeScript app with route adapter keeping `?page=order` + `/`; verify public shell bundle excludes admin/chart/xlsx/3D chunks (ADR-007 spike).
