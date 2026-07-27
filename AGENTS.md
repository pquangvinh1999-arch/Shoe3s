# AGENTS.md — Codex Repository Instructions

Codex phải đọc file này và các file được dẫn chiếu trước khi chỉnh sửa repository.

## Canonical sources

- `.agent/MASTER_CONTEXT.md`
- `.agent/state/STATE.json`
- `.agent/state/CURRENT_TASK.md`
- `.agent/state/DECISIONS.md`
- `.agent/workflows/`

## Mandatory start sequence

```bash
python scripts/agent_sync.py --check
python scripts/context_audit.py
python scripts/handoff.py status
python scripts/orchestrator_resume.py
```

- Không code khi `context_gate`, `research_gate`, hoặc `plan_gate` chưa đạt theo task hiện tại.
- Chỉ làm task ID đang active; không tự mở rộng scope.
- Dùng subagent trong `.agent/agents/` theo ma trận ở `.agent/AGENT_ROUTING.md`.
- Load skill theo `when_to_use`; không nạp toàn bộ để tránh lãng phí context.
- Sau mỗi module: review → test → evidence → checkpoint → report.
- Trước chuyển Work/Codex: `python scripts/handoff.py prepare --from <work|codex> --to <work|codex>` rồi commit.
- Không deploy production trước Step 13 release-candidate gate.

Bắt đầu bằng `CODEX_START.md`.
