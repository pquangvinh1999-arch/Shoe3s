#!/usr/bin/env bash
set -euo pipefail
# Keep this hook fast. It records drift signals, not full test suites.
python scripts/agent_sync.py --check
python scripts/secret_scan.py --changed --non-blocking
