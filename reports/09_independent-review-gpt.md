# Independent Review — Commit 9012984 (P03-T02 RLS Lockdown + Catalog Sync Remediation)

- Reviewer: GPT-5.6 (independent, read-only)
- Commit: `9012984` (`feat(P03-T02): apply RLS lockdown migration; fix catalog sync tests (ADR-011)`)
- Base: `c8f408a` · Date: 2026-08-03 · Task: P08-T01
- Scope: read-only review — no files modified, no commit created, no tests executed (tests pre-verified 70/70).

## Tổng điểm: 78 / 100 — CONDITIONAL APPROVE

| Mục | Trọng số | Điểm % | Điểm | Ghi chú |
|---|---|---|---|---|
| Correctness | 20 | 80% | 16.0 | Toán giá mới đúng (290000, 520000); 4 cards khớp catalog; nhưng lý do chính đáng cho policy authenticated không khớp code thực tế |
| Security | 20 | 70% | 14.0 | Anon bị chặn đúng (revoke + 42501); nhưng authenticated role quá rộng, không có admin check |
| Performance | 15 | 90% | 13.5 | Không có regression runtime; RLS overhead không đáng kể |
| Accessibility | 10 | 85% | 8.5 | Không regression từ commit này; card legacy vẫn div onclick (tiền tồn) |
| Maintainability | 15 | 72% | 10.8 | Migration có comment/transaction tốt; nhưng ADR-010/011 mâu thuẫn nhau |
| Tests quality | 10 | 75% | 7.5 | Sync đúng hướng; nhưng không có test cho migration SQL, fixture E2E stale (69000) |
| Evidence completeness | 10 | 75% | 7.5 | Probe/apply tables chi tiết; nhưng evidence mâu thuẫn catalog (7 vs 4 services); claim "70/70" so với 74 `it()` |
| **Tổng** | **100** | — | **78.0** | |

## Chi tiết từng mục

### Correctness (16/20)
- Giá/tên catalog sau sync nhất quán giữa `js/service-catalog.js:2-5`, `index.html` service cards, `tests/p03-t01.secure-order-api.test.ts:19,215-226` (CLEAN_STANDARD 90K + REPAIR_SOLE 200K = 290000 ✓), `tests/p03-t03.pos-service-catalog.test.ts` (tổng 520000 ✓).
- `js/order-schema.js:42` reject service_id không tồn tại — API sẽ chặn payload cũ (đúng intent ADR-011).
- Trừ điểm: lý do thiết kế policy "authenticated = admin dashboard + POS insert (js/app.js:614)" (migration comment dòng 22-23) không khớp code thực: `js/app.js:4-5` hardcode project `agcvsogtqxoqlhcubghy` + anon key của nó cho mọi luồng admin/POS (`js/app.js:200,335,610,614`), không phải project production `vmakonkiotjkxlhpjwny` đang được lockdown.

### Security (14/20)
- Đúng: anon bị REVOKE toàn bộ trên orders/order_items, services anon chỉ SELECT active (`supabase/migrations/20260803_rls_lockdown.sql:14-18,26-27,48`); verify 42501 cho anon (evidence rls-lockdown-applied.md).
- Đúng: API `/api/orders` dùng service_role bypass RLS (`functions/api/orders.js:167`) — không bị ảnh hưởng.
- Thiếu: `orders_authenticated_select USING (true)` / `_update` / `_insert` (`migration:31-41`) cấp cho **mọi** tài khoản authenticated — không có check admin (helper/table `is_admin`, `auth.jwt()`, hay email allowlist). Nếu signup mở, bất kỳ ai tạo tài khoản đều đọc được toàn bộ PII khách hàng và sửa status/total đơn.
- Anon key production từng paste chat, rotation trì hoãn (evidence rls-lockdown-applied.md:34) — không có cơ chế chặn trong state.

### Performance (13.5/15)
- Commit không đụng runtime path (chỉ migration + test + UI legacy); RLS filter overhead không đáng kể; UI giảm 7→4 cards.
- Informational (pre-existing, ngoài scope commit): `rateBuckets` Map tại `functions/api/orders.js:9,98-107` không bao giờ prune — leak nhẹ khi có nhiều IP lạ.

### Accessibility (8.5/10)
- Không regression: thay đổi chỉ là nội dung/nhãn card (`index.html`), giữ nguyên cấu trúc, font-weight, không đổi màu tương phản hay kích thước chạm.
- Ghi chú (pre-existing): service cards legacy vẫn là `div onclick` không có keyboard handler (`index.html:68-71`) — ngoài scope commit nhưng nên sửa khi cutover.

### Maintainability (10.8/15)
- Tốt: migration bọc `BEGIN/COMMIT`, comment rõ intent, có verify plan + rollback hướng dẫn; `DECISIONS.md` ADR-011 ghi rõ quyết định.
- Xấu: mâu thuẫn trực tiếp giữa ADR-010 (resolved: "catalog chuẩn = repo 7 services — DB sẽ được đồng bộ theo repo") và ADR-011 (accepted: catalog repo = 4 services DB) trong cùng file `DECISIONS.md:30-46`. `STATE.json:28` và `rls-probe-anon.md` cũng lặp claim 7 services. Người duy trì sau sẽ không biết đâu là nguồn sự thật.

### Tests quality (7.5/10)
- Đúng hướng: các kỳ vọng được sync đúng với catalog 4 services (service_ids, quote 290000, POS names/prices/total 520000, description field bổ sung cho toContainEqual).
- Thiếu: không có test cho migration SQL (không syntax-check, không policy assertion — không chạy được qua CI hiện tại).
- Fixture stale: `tests/p01-t01.service-catalog.spec.ts:30` mock quote `total_vnd: 69000` không khớp catalog mới (chưa assert nên không fail, nhưng gây hiểu nhầm).
- Đếm lệch: evidence claim "70/70 PASS" trong khi repo định nghĩa 74 `it()` (`tests/*.ts`, grep `it(`) — số liệu không tái tạo được từ repo.

### Evidence completeness (7.5/10)
- Tốt: `rls-probe-anon.md` (bảng probe từng thao tác REST) + `rls-lockdown-applied.md` (bảng verify post-apply, baseline policies, rollback, booking API impact).
- Thiếu/thiếu nhất quán: `rls-probe-anon.md` ghi "Catalog chuẩn: repo js/service-catalog.js (7 services) — DB (4 services) sẽ được đồng bộ theo repo" trong khi bảng probe của chính nó trả 4 rows và ADR-011 làm điều ngược lại; không đính kèm raw response/PAT scope; chưa ghi migration tracking id.

## Issues

### Critical (0)
Không có. Anon path thực sự bị khóa (revoke grant → 42501), API booking chạy qua service_role vẫn hoạt động, không thấy đường XSS/leak mới từ commit.

### High (3)
1. **H1 — Policy authenticated quá rộng, không có admin check** — `supabase/migrations/20260803_rls_lockdown.sql:31-41`: `orders_authenticated_select/insert/update` với `USING (true)`/`WITH CHECK (true)` cho **mọi** user authenticated. Nếu project production bật signup, bất kỳ tài khoản mới nào cũng đọc được toàn bộ PII (tên/SĐT/địa chỉ/ghi chú) và sửa status/total đơn qua REST. Cần: helper `is_admin()` (vd: `auth.jwt() ->> 'email'` trong allowlist hoặc bảng admins) làm điều kiện cho cả 3 policy, hoặc thu hẹp về service_role-only + admin qua API.
2. **H2 — ADR-010 vs ADR-011 mâu thuẫn nguồn sự thật catalog** — `.agent/state/DECISIONS.md:30-46`: ADR-011 accepted nói catalog chuẩn = 4 services production DB (repo đã sync theo DB); ADR-010 resolved cùng ngày nói "catalog chuẩn = repo 7 services — DB sẽ được đồng bộ theo repo". Hai quyết định đảo ngược nhau trong cùng file; kèm `STATE.json:28` và `rls-probe-anon.md` lặp claim 7 services. Phải sửa ADR-010 thành "superseded by ADR-011" kèm timestamp.
3. **H3 — Lockdown rationale disconnect với code admin/POS thật** — migration comment (dòng 22-23, 31-41) chứng minh grant authenticated bằng luồng "admin dashboard + POS insert js/app.js:614", nhưng `js/app.js:4-5` hardcode project `agcvsogtqxoqlhcubghy` (không phải production `vmakonkiotjkxlhpjwny`) cho mọi truy cập admin/POS (`js/app.js:200,335,610,614`). Kết quả: (a) grant authenticated trên production bảo vệ một path code không tồn tại; (b) admin/POS thật vẫn ghi vào project legacy với anon key, không được lockdown. Cần xác nhận owner sẽ chuyển `SUPABASE_URL`/key admin sang production trước khi dựa vào các policy này.

### Medium (3)
4. **M1 — Anon key production đã phơi trong chat, rotation chỉ ghi chú không có chặn** — `.agent/evidence/P03-T02/rls-lockdown-applied.md:34` nói "nên rotate" nhưng không có task/check chặn trước deploy; `js/app.js:5` vẫn hardcode anon key legacy. Nên thêm item bắt buộc trước Step 12/13.
5. **M2 — Evidence số liệu test không khớp repo** — claim "70/70 PASS" (evidence P05-T01 quality-gates.md, CURRENT_TASK.md) so với 74 `it()` trong `tests/`; và fixture `tests/p01-t01.service-catalog.spec.ts:30` còn mock `total_vnd: 69000` stale.
6. **M3 — Migration SQL không được verify tự động** — không có syntax-check hay assertion policy (pgTAP/`supabase test`); verification hoàn toàn thủ công (evidence rls-lockdown-applied.md). Migration chạy qua Management API nên không có tracking migration history.

### Low (2)
7. **L1 — `orders_authenticated_insert WITH CHECK (true)` cho phép forge trường** — `supabase/migrations/20260803_rls_lockdown.sql:36-37`: authenticated có thể ghi đè `total`, `status`, `source`, `idempotency_key` theo ý muốn — rủi ro toàn vẹn dữ liệu nếu đường authenticated được dùng thật.
8. **L2 — `rateBuckets` không prune** — `functions/api/orders.js:9,98-107`: Map giữ entry mỗi IP vĩnh viễn (pre-existing, ngoài scope commit; nêu để lưu trữ).

## Kết luận: CONDITIONAL APPROVE

Commit đúng hướng: anon path đã thực sự bị khóa, catalog/tests/UI sync nhất quán (toán giá chính xác), evidence ghi chép tử tế, API service_role không bị ảnh hưởng. Tuy nhiên **chưa nên cutover** khi còn 3 vấn đề High:
1. Thu hẹp policy authenticated với admin check thật (H1).
2. Giải quyết mâu thuẫn ADR-010/011 trước khi ai đó sync ngược DB về 7 services (H2).
3. Xác nhận/chuyển luồng admin-POS sang production project hoặc bỏ rationale "admin+POS" khỏi migration (H3).

Điều kiện chốt: sau khi 3 High được xử lý + anon key production được rotate (M1), mở checkpoint P05-T01 và tiến hành Bước 7.

## Files reviewed
- `git diff c8f408a 9012984` (16 files: migration, evidence P03-T02/P05-T01, DECISIONS/STATE/CURRENT_TASK/SESSION_LOG/CHECKLIST/PLAN.json, index.html, 6 test files)
- `functions/api/orders.js`, `functions/api/telegram.js`, `js/service-catalog.js`, `js/order-schema.js`, `js/app.js`
- `apps/web/src/features/booking/{BookingWizard.tsx,api.ts}`, `apps/web` shell structure
- `supabase/migrations/20260803_rls_lockdown.sql`, `tests/*` (9 files), `.agent/evidence/{P03-T02,P05-T01,P06-T01}`, `.agent/state/DECISIONS.md`
