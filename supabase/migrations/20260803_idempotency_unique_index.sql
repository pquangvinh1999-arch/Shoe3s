-- P10-T01 F4 — Idempotency unique index safeguard (TOCTOU prevention)
-- Project: vmakonkiotjkxlhpjwny (production)
-- Date: 2026-08-03
-- Note: unique partial index `orders_idempotency_key_uq` ĐÃ TỒN TẠI từ trước
--       (verify pg_indexes 2026-08-03). File này là idempotent safeguard cho
--       repo (không tạo trùng). Reviewer 2 báo "thiếu index" là nhầm;
--       nhưng API catch 23505 (orders.js) vẫn được thêm để replay race đúng.

BEGIN;

CREATE UNIQUE INDEX IF NOT EXISTS orders_idempotency_key_idx
  ON public.orders (idempotency_key)
  WHERE idempotency_key IS NOT NULL;

COMMIT;
