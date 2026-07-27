$ErrorActionPreference = "Stop"
python scripts/agent_sync.py --check
python scripts/context_audit.py
python scripts/secret_scan.py --non-blocking
python scripts/handoff.py status
