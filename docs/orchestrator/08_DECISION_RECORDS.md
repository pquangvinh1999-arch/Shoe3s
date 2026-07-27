# 08 — Architecture Decision Records

## ADR-001 — Incremental migration

**Status:** accepted  
**Decision:** strangler migration, giữ app cũ tới khi route mới pass regression.  
**Reason:** giảm rủi ro hệ thống POS/report đang chạy.

## ADR-002 — Secure API before 3D

**Status:** accepted  
**Decision:** P02 phải hoàn thành trước P05.  
**Reason:** visual traffic có thể làm tăng abuse; không mở rộng bề mặt public
trước khi server kiểm soát price/status/insert.

## ADR-003 — 3D is progressive enhancement

**Status:** accepted  
**Decision:** poster/CSS fallback là first-class path.  
**Reason:** thiết bị yếu, WebGL context loss, reduce motion, SEO và conversion.

## ADR-004 — One service catalog

**Status:** accepted  
**Decision:** stable service IDs + typed catalog dùng chung client/server/admin.  
**Reason:** hiện có nhiều bản giá lặp.

## ADR-005 — Keep status strings initially

**Status:** accepted  
**Decision:** internal constants nhưng persist text cũ trong migration.  
**Reason:** tránh phá dashboard/filter/admin hiện tại.

## ADR-006 — Cloudflare Pages Functions + Supabase

**Status:** accepted  
**Decision:** giữ platform hiện tại trong MVP.  
**Reason:** giảm migration cost và phù hợp hệ thống đang deploy.

## ADR-007 — React/Vite/TypeScript for new shell

**Status:** proposed until P03 spike evidence  
**Decision:** validate bằng spike trước full migration.  
**Fallback:** modular Vanilla/TypeScript nếu build/deploy constraints không đạt.
