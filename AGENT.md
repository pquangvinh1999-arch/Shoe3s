# AGENT.md — Work Compatibility Entry

ChatGPT Work phải đọc file này trước khi bắt đầu.

1. Nguồn context chuẩn: `.agent/MASTER_CONTEXT.md`.
2. Trạng thái chuẩn: `.agent/state/STATE.json` và `.agent/state/CURRENT_TASK.md`.
3. Quy trình chuẩn: `.agent/workflows/`.
4. Không code nếu Context Gate hoặc Research Gate chưa được duyệt.
5. Trước khi kết thúc phiên, chạy checkpoint và ghi handoff.
6. Khi chuyển sang Codex, commit toàn bộ state + evidence; không chuyển bằng mô tả trong chat בלבד.

Bắt đầu bằng `WORK_START.md`.
