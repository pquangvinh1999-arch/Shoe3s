#!/usr/bin/env python3
from __future__ import annotations
import argparse, datetime as dt, json, subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
STATE_PATH = ROOT / "orchestrator/STATE.json"
TASKS_PATH = ROOT / "orchestrator/TASKS.json"
CHECKLIST_PATH = ROOT / "orchestrator/CHECKLIST.md"
NEXT_PATH = ROOT / "orchestrator/NEXT.md"

parser = argparse.ArgumentParser()
parser.add_argument("task_id")
parser.add_argument("status", choices=["todo", "in_progress", "blocked", "done"])
parser.add_argument("--evidence", default="")
parser.add_argument("--note", default="")
args = parser.parse_args()

state = json.loads(STATE_PATH.read_text(encoding="utf-8"))
doc = json.loads(TASKS_PATH.read_text(encoding="utf-8"))
tasks = doc["tasks"]
index = {t["id"]: t for t in tasks}
if args.task_id not in index:
    raise SystemExit(f"Unknown task: {args.task_id}")

task = index[args.task_id]
missing = [d for d in task.get("depends_on", []) if index[d]["status"] != "done"]
if args.status == "done" and missing:
    raise SystemExit(f"Cannot complete; dependencies not done: {', '.join(missing)}")
if args.status == "done" and not args.evidence.strip():
    raise SystemExit("--evidence is required when marking done")

task["status"] = args.status
task["last_note"] = args.note
task["updated_utc"] = dt.datetime.now(dt.timezone.utc).isoformat()
if args.evidence:
    task["evidence"] = args.evidence
    state.setdefault("evidence", {})[args.task_id] = args.evidence

completed = [t["id"] for t in tasks if t["status"] == "done"]
blocked = [t["id"] for t in tasks if t["status"] == "blocked"]
state["completed_tasks"] = completed
state["blocked_tasks"] = blocked
state["last_checkpoint_utc"] = dt.datetime.now(dt.timezone.utc).isoformat()

if args.status == "done":
    next_task = next(
        (t for t in tasks
         if t["status"] == "todo"
         and all(index[d]["status"] == "done" for d in t.get("depends_on", []))),
        None
    )
    if next_task:
        state["active_task"] = next_task["id"]
        state["current_phase"] = next_task["phase"]
        state["status"] = "ready"
        state["next_action"] = next_task["actions"][0]
    else:
        state["status"] = "complete"
        state["next_action"] = "All tasks completed; perform handover verification."
elif args.status == "blocked":
    state["active_task"] = args.task_id
    state["current_phase"] = task["phase"]
    state["status"] = "blocked"
    state["next_action"] = args.note or "Resolve blocker."
else:
    state["active_task"] = args.task_id
    state["current_phase"] = task["phase"]
    state["status"] = args.status
    state["next_action"] = task["actions"][0]

try:
    state["active_branch"] = subprocess.check_output(
        ["git", "branch", "--show-current"], cwd=ROOT, text=True
    ).strip() or None
except Exception:
    pass

STATE_PATH.write_text(json.dumps(state, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
TASKS_PATH.write_text(json.dumps(doc, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

phases = []
for t in tasks:
    if t["phase"] not in phases:
        phases.append(t["phase"])
lines = ["# CHECKLIST", "", "Generated from `TASKS.json`.", ""]
for phase in phases:
    lines += [f"## {phase}", ""]
    for t in [x for x in tasks if x["phase"] == phase]:
        mark = "x" if t["status"] == "done" else " "
        suffix = f" — **{t['status']}**" if t["status"] in ("blocked", "in_progress") else ""
        lines.append(f"- [{mark}] {t['id']} {t['title']}{suffix}")
    lines.append("")
CHECKLIST_PATH.write_text("\n".join(lines), encoding="utf-8")

active = index.get(state["active_task"])
next_lines = [
    "# NEXT", "",
    f"## Active task", "",
    f"`{state['active_task']} — {active['title'] if active else 'complete'}`", "",
    "## Do now", ""
]
if active:
    next_lines.extend([f"{i+1}. {a}" for i, a in enumerate(active["actions"])])
else:
    next_lines.append("1. Final handover verification.")
next_lines += ["", "## Last checkpoint", "", f"- UTC: {state['last_checkpoint_utc']}", f"- Note: {args.note or 'n/a'}", ""]
NEXT_PATH.write_text("\n".join(next_lines), encoding="utf-8")
print(f"Checkpointed {args.task_id} as {args.status}. Active task: {state['active_task']}")
