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
state["active_task"] = args.task_id
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
    lines.append(f"- [{'x' if complete else ' '}] Bước {phase['step']}: {phase['name']}")
CHECKLIST_PATH.write_text("\n".join(lines) + "\n", encoding="utf-8")

next_action = args.next_action or args.note or "Review the active task and resolve its blockers."
evidence = args.evidence or f".agent/evidence/{args.task_id}/"
CURRENT_TASK_PATH.write_text(
    "\n".join(
        [
            "# Current Task",
            "",
            f"- Task ID: `{args.task_id}`",
            f"- Owner: {task['owner']}",
            f"- Status: `{args.status}`",
            f"- Goal: {task['title']}.",
            "- Allowed changes: agent/orchestrator documentation, state, evidence only.",
            "- Forbidden changes: application code, database, Cloudflare production config.",
            f"- Required evidence: `{evidence}`",
            f"- Next action: {next_action}",
        ]
    )
    + "\n",
    encoding="utf-8",
)
print(f"Checkpointed {args.task_id} as {args.status} in canonical .agent state.")
