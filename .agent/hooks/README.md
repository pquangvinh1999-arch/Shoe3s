# Hooks

Các hook là guardrails trong repo. Chúng không tự được Work/Codex hoặc Git kích hoạt chỉ vì tồn tại.

- Chạy thủ công: `bash .agent/hooks/sessionstart.sh`.
- Cài Git hooks: `bash scripts/install_git_hooks.sh`.
- Agent runtime nào hỗ trợ lifecycle hooks thì trỏ đến ba file này.
- Không bỏ qua hook bằng cách xóa file; thay đổi cần ADR.
