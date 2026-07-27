# Chuyển đổi Work ↔ Codex an toàn

Work và Codex có lịch sử phiên riêng, vì vậy repo/Git là bộ nhớ chung. Không dựa vào nội dung chat để bàn giao.

## Trước khi rời công cụ hiện tại

```bash
python scripts/handoff.py prepare --from work --to codex
# hoặc --from codex --to work
git add .agent reports docs application-files
git commit -m "chore(handoff): Work to Codex <TASK-ID>"
git push
```

## Khi nhận việc ở công cụ mới

```bash
git pull --ff-only
python scripts/agent_sync.py --check
python scripts/handoff.py accept --actor codex
python scripts/orchestrator_resume.py
```

## Quy tắc khóa phiên

- Một branch chỉ có một actor đang active.
- Nếu chạy song song, tạo branch/worktree khác và phân chia path không giao nhau.
- Mọi thay đổi trạng thái phải commit cùng code/evidence liên quan.
- `ACTIVE_SESSION.json` không chứa token hoặc thông tin cá nhân.
