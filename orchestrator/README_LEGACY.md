# Legacy Orchestrator Framework

The `orchestrator/` directory is a legacy framework retained for reference and compatibility only.
It is **not canonical state** and its state, task, checklist, next-action, and evidence files must not be read or updated as orchestration state.

Every Work, Codex, and specialist agent must use the canonical `.agent/` system:

- `.agent/PLAN.json`
- `.agent/state/STATE.json`
- `.agent/state/CURRENT_TASK.md`
- `.agent/CHECKLIST.md`
- `.agent/evidence/`
