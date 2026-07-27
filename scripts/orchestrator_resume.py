#!/usr/bin/env python3
from __future__ import annotations
import json, subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
state = json.loads((ROOT / "orchestrator/STATE.json").read_text(encoding="utf-8"))
tasks_doc = json.loads((ROOT / "orchestrator/TASKS.json").read_text(encoding="utf-8"))
tasks = {t["id"]: t for t in tasks_doc["tasks"]}
active = tasks.get(state["active_task"])

def git(*args: str) -> str:
    try:
        return subprocess.check_output(["git", *args], cwd=ROOT, text=True, stderr=subprocess.DEVNULL).strip()
    except Exception:
        return "unavailable"

print(f"Project      : {state['project']}")
print(f"Phase/task   : {state['current_phase']} / {state['active_task']}")
print(f"Task title   : {active['title'] if active else 'UNKNOWN'}")
print(f"State        : {state['status']}")
print(f"Branch       : {git('branch', '--show-current')}")
print(f"HEAD         : {git('rev-parse', '--short', 'HEAD')}")
print(f"Completed    : {len(state.get('completed_tasks', []))}/{len(tasks)}")
print(f"Next action  : {state.get('next_action', '')}")
if state.get("blocked_tasks"):
    print("Blocked      : " + ", ".join(state["blocked_tasks"]))
print("\nRead only:")
read_paths = ["AGENTS.md", "orchestrator/STATE.json", "orchestrator/NEXT.md"]
if active:
    read_paths.extend(active.get("read", []))
for path in dict.fromkeys(read_paths):
    print(f"  - {path}")
print("\nAcceptance:")
if active:
    for item in active.get("acceptance", []):
        print(f"  - {item}")
print("\nWorking tree:")
print(git("status", "--short") or "  clean")
