#!/usr/bin/env python3
from __future__ import annotations
import argparse, json, re, shutil, subprocess, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser()
parser.add_argument("--release", action="store_true")
args = parser.parse_args()

failures = []
required = [
    "AGENTS.md", "orchestrator/STATE.json", "orchestrator/TASKS.json",
    "orchestrator/NEXT.md", "orchestrator/CHECKLIST.md"
]
for rel in required:
    if not (ROOT / rel).exists():
        failures.append(f"missing {rel}")

secret_patterns = [
    re.compile(r"(?m)^SUPABASE_SERVICE_ROLE_KEY[ \t]*=[ \t]*[^ \t\r\n#]+"),
    re.compile(r"(?m)^TELEGRAM_BOT_TOKEN[ \t]*=[ \t]*[^ \t\r\n#]+"),
    re.compile(r"-----BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY-----"),
]
for path in ROOT.rglob("*"):
    if not path.is_file() or ".git" in path.parts or path.suffix.lower() in {".png",".jpg",".jpeg",".webp",".avif",".glb",".zip"}:
        continue
    if path.stat().st_size > 2_000_000:
        continue
    try:
        text = path.read_text(encoding="utf-8")
    except Exception:
        continue
    for pat in secret_patterns:
        if pat.search(text):
            failures.append(f"possible secret in {path.relative_to(ROOT)}: {pat.pattern}")

def run_if_script(name: str):
    pkg = ROOT / "package.json"
    if not pkg.exists():
        return
    data = json.loads(pkg.read_text(encoding="utf-8"))
    if name not in data.get("scripts", {}):
        return
    runner = "pnpm" if shutil.which("pnpm") else "npm"
    cmd = [runner, "run", name] if runner == "npm" else [runner, name]
    result = subprocess.run(cmd, cwd=ROOT)
    if result.returncode:
        failures.append(f"{' '.join(cmd)} failed")

for script in ["lint", "typecheck", "test", "build"]:
    run_if_script(script)
if args.release:
    for script in ["test:e2e", "test:a11y", "test:performance"]:
        run_if_script(script)

if failures:
    print("VERIFY FAILED")
    for f in failures:
        print(" -", f)
    sys.exit(1)
print("VERIFY PASSED")
