#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import re
import shutil
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser()
parser.add_argument("--release", action="store_true")
args = parser.parse_args()

failures = []
required = [
    "AGENTS.md",
    ".agent/PLAN.json",
    ".agent/state/STATE.json",
    ".agent/state/CURRENT_TASK.md",
    ".agent/CHECKLIST.md",
    ".agent/evidence",
]
for rel in required:
    if not (ROOT / rel).exists():
        failures.append(f"missing {rel}")

for rel in (".agent/PLAN.json", ".agent/state/STATE.json"):
    try:
        json.loads((ROOT / rel).read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        failures.append(f"invalid {rel}: {exc}")

secret_patterns = [
    re.compile(r"(?m)^SUPABASE_SERVICE_ROLE_KEY[ \t]*=[ \t]*[^ \t\r\n#]+"),
    re.compile(r"(?m)^TELEGRAM_BOT_TOKEN[ \t]*=[ \t]*[^ \t\r\n#]+"),
    re.compile(r"-----BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY-----"),
]
for path in ROOT.rglob("*"):
    if not path.is_file() or ".git" in path.parts or path.suffix.lower() in {".png", ".jpg", ".jpeg", ".webp", ".avif", ".glb", ".zip"}:
        continue
    if path.stat().st_size > 2_000_000:
        continue
    try:
        text = path.read_text(encoding="utf-8")
    except (OSError, UnicodeDecodeError):
        continue
    for pattern in secret_patterns:
        if pattern.search(text):
            failures.append(f"possible secret in {path.relative_to(ROOT)}: {pattern.pattern}")


def run_if_script(name: str) -> None:
    package = ROOT / "package.json"
    if not package.exists():
        return
    data = json.loads(package.read_text(encoding="utf-8"))
    if name not in data.get("scripts", {}):
        return
    runner = "pnpm" if shutil.which("pnpm") else "npm"
    command = [runner, name] if runner == "pnpm" else [runner, "run", name]
    result = subprocess.run(command, cwd=ROOT, check=False)
    if result.returncode:
        failures.append(f"{' '.join(command)} failed")


for script in ["lint", "typecheck", "test", "build"]:
    run_if_script(script)
if args.release:
    for script in ["test:e2e", "test:a11y", "test:performance"]:
        run_if_script(script)

if failures:
    print("VERIFY FAILED")
    for failure in failures:
        print(" -", failure)
    sys.exit(1)
print("VERIFY PASSED")
