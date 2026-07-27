#!/usr/bin/env python3
from __future__ import annotations

import argparse
import datetime as dt
import json
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
AGENT_ROOT = ROOT / ".agent"
STATE_PATH = AGENT_ROOT / "state/STATE.json"
PLAN_PATH = AGENT_ROOT / "PLAN.json"
CHECKLIST_PATH = AGENT_ROOT / "CHECKLIST.md"
CURRENT_TASK_PATH = AGENT_ROOT / "state/CURRENT_TASK.md"

parser = argparse.ArgumentParser()
parser.add_argument("task_id")
parser.add_argument("status", choices=["active", "blocked", "done"])
parser.add_argument("--evidence", default="")
parser.add_argument("--note", default="")
parser.add_argument("--next-action", default="")
args = parser.parse_args()

state = json.loads(STATE_PATH.read_text(encoding="utf-8"))
plan = json.loads(PLAN_PATH.read_text(encoding="utf-8"))
tasks = plan["tasks"]
index = {task["id"]: task for task in tasks}
if args.task_id not in index:
    raise SystemExit(f"Unknown task: {args.task_id}")

task = index[args.task_id]
missing = [dependency for dependency in task.get("depends_on", []) if index[dependency]["status"] != "done"]
if args.status == "done" and missing:
    raise SystemExit(f"Cannot complete; dependencies not done: {', '.join(missing)}")
if args.status == "done" and not args.evidence.strip():
    raise SystemExit("--evidence is required when marking done")

task["status"] = args.status
active_task = task
if args.status == "done":
    eligible = [
        candidate
        for candidate in tasks
        if candidate["status"] != "done"
        and all(index[dependency]["status"] == "done" for dependency in candidate.get("depends_on", []))
    ]
    if eligible:
        active_task = eligible[0]
        active_task["status"] = "active"

state["active_task"] = active_task["id"]
state["last_checkpoint"] = dt.datetime.now(dt.timezone.utc).isoformat()
try:
    state["last_commit"] = subprocess.check_output(
        ["git", "rev-parse", "HEAD"], cwd=ROOT, text=True
    ).strip()
except (OSError, subprocess.CalledProcessError):
    state["last_commit"] = None

PLAN_PATH.write_text(json.dumps(plan, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
STATE_PATH.write_text(json.dumps(state, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

lines = ["# Master Checklist", ""]
for phase in plan["phases"]:
    phase_tasks = [item for item in tasks if item["step"] == phase["step"]]
    complete = bool(phase_tasks) and all(item["status"] == "done" for item in phase_tasks)
    active = any(item["status"] == "active" for item in phase_tasks)
    suffix = " *(đang thực hiện)*" if active and not complete else ""
    lines.append(f"- [{'x' if complete else ' '}] Bước {phase['step']}: {phase['name']}{suffix}")
CHECKLIST_PATH.write_text("\n".join(lines) + "\n", encoding="utf-8")

task_stays_active = active_task["id"] == task["id"]
next_action = (
    (args.next_action or args.note if task_stays_active else "")
    or active_task.get("next_action")
    or "Review the active task and resolve its blockers."
)
evidence = (
    (args.evidence if task_stays_active else "")
    or active_task.get("required_evidence", [f".agent/evidence/{active_task['id']}/"])
)
evidence_paths = [evidence] if isinstance(evidence, str) else evidence


def render_scope(label: str, values: list[str]) -> list[str]:
    rendered = [f"- {label}:"]
    rendered.extend(f"  - {value};" for value in values)
    return rendered


gate_state = state.get("gates", {}).get("context_gate", "unknown")
current_task_lines = [
    "# Current Task",
    "",
    f"- Task ID: `{active_task['id']}`",
    f"- Owner: `{active_task['owner']}`",
    f"- Status: `{active_task['status']}`",
    f"- Goal: {active_task['title']}.",
]
current_task_lines.extend(render_scope("Allowed changes", active_task.get("allowed_changes", [])))
current_task_lines.extend(render_scope("Forbidden changes", active_task.get("forbidden_changes", [])))
current_task_lines.append("- Required evidence:")
current_task_lines.extend(f"  - `{path}`" for path in evidence_paths)
current_task_lines.extend(
    [
        f"- Gate state: `context_gate = {gate_state}`; implementation is prohibited.",
        f"- Next action: {next_action}",
    ]
)
CURRENT_TASK_PATH.write_text(
    "\n".join(current_task_lines) + "\n",
    encoding="utf-8",
)
print(
    f"Checkpointed {args.task_id} as {args.status}; "
    f"active task is {active_task['id']} in canonical .agent state."
)
