# CONTEXT — Shoe3s

## Business context

3S Shoe Care có một repo chung cho:
- landing booking khách hàng;
- quản lý đơn;
- dashboard;
- thu chi;
- CRM;
- POS/thanh toán QR;
- in bill 58 mm.

Trang booking hiện dùng `/?page=order`; admin dùng `/`.

## Technical context

- Static HTML/CSS/JS.
- Cloudflare Pages + Pages Function.
- Supabase Auth/Data.
- Telegram notification.
- Current app has no root package build manifest at review time.
- Existing `.agents/` is generic and lớn; do not duplicate/load all skills.

## Current critical constraints

- Preserve live business logic.
- No-cost/low-cost stack preferred.
- Mobile-first.
- 3D must degrade safely.
- Security before traffic/visual expansion.
- Resume across sessions with minimal context reads.

## Source of truth order

1. Running tests and production/preview behavior.
2. Current repo code.
3. Supabase schema/policies and Cloudflare config.
4. `orchestrator/DECISIONS.md`.
5. This context.
6. Old plans/audits.

When conflict occurs, record it; do not silently choose.
