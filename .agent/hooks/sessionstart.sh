#!/usr/bin/env bash
set -euo pipefail
python scripts/agent_sync.py --check
python scripts/context_audit.py --non-blocking
python scripts/handoff.py status
python scripts/orchestrator_resume.py
