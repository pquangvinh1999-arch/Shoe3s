# Bước 13 — Release candidate và rollback rehearsal

## Goal
Freeze SHA, test preview, backup/migration dry-run, smoke/E2E, diễn tập rollback trước production.

## Required actions
1. Read canonical context and current state.
2. Work only on the active task IDs for this step.
3. Invoke assigned subagents and load only relevant skills.
4. Save evidence under `.agent/evidence/<TASK-ID>/`.
5. Update state, current task, risk and progress report.
6. Do not advance until exit criteria pass.

## Exit criteria
See STATE.json and task definition.

## Report fields
- Completed
- Remaining
- Decisions needed
- Architecture changes
- Risks
- Tests/evidence
- Exact next task
