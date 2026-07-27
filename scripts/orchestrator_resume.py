#!/usr/bin/env python3
from __future__ import annotations

import json
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
AGENT_ROOT = ROOT / ".agent"

state = json.loads((AGENT_ROOT / "state/STATE.json").read_text(encoding="utf-8"))
plan = json.loads((AGENT_ROOT / "PLAN.json").read_text(encoding="utf-8"))
tasks = {task["id"]: task for task in plan["tasks"]}
active = tasks.get(state["active_task"])
phase = next(
    (phase for phase in plan["phases"] if active and phase["step"] == active["step"]),
    None,
)


def git(*args: str) -> str:
    try:
        return subprocess.check_output(
            ["git", *args], cwd=ROOT, text=True, stderr=subprocess.DEVNULL
        ).strip()
    except (OSError, subprocess.CalledProcessError):
        return "unavailable"


print(f"Project      : {state['project']}")
print(f"Phase/task   : {phase['id'] if phase else 'UNKNOWN'} / {state['active_task']}")
print(f"Task title   : {active['title'] if active else 'UNKNOWN'}")
print(f"Task state   : {active['status'] if active else 'UNKNOWN'}")
print(f"Context gate : {state['gates']['context_gate']}")
print(f"Branch       : {git('branch', '--show-current')}")
print(f"HEAD         : {git('rev-parse', '--short', 'HEAD')}")
print("\nCanonical state:")
for path in (
    ".agent/PLAN.json",
    ".agent/state/STATE.json",
    ".agent/state/CURRENT_TASK.md",
    ".agent/CHECKLIST.md",
    ".agent/evidence/",
):
    print(f"  - {path}")
print("\nCurrent task:")
print((AGENT_ROOT / "state/CURRENT_TASK.md").read_text(encoding="utf-8").rstrip())
print("\nWorking tree:")
print(git("status", "--short") or "  clean")
