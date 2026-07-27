#!/usr/bin/env bash
set -euo pipefail
echo "=== Wed3s Orchestrator Session ==="
python scripts/orchestrator_resume.py
echo
echo "Rules: active task only; secure data path before 3D; checkpoint before stop."
