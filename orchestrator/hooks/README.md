# Hooks

Các script này là guardrail deterministic. Runtime agent/Codex có thể không tự
động gọi hook theo tên; hãy tích hợp vào command wrapper hoặc chạy thủ công.

- `sessionstart.sh`: resume.
- `pretooluse.sh "<command>"`: chặn lệnh phá hủy/secret/deploy.
- `posttooluse.sh`: ghi branch/head/diff stat.

Hook không thay thế review hoặc permission của GitHub/Cloudflare/Supabase.
