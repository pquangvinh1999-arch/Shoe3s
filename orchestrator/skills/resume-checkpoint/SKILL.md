---
name: resume-checkpoint
description: Resume and stop sessions without rereading the whole repo.
when_to_use: Start/end of every Codex session.
allowed-tools: Read, Bash, Edit, Write
---

# Start

1. Read AGENTS.
2. Run resume script.
3. Read STATE/NEXT/active task only.
4. Validate evidence/branch.
5. Continue exact next action.

# Stop

1. Run tests relevant to active task.
2. Checkpoint status/evidence/note.
3. Update NEXT and max-12-line HANDOFF.
4. Record decision/blocker.
5. Ensure working tree status is explicit.
