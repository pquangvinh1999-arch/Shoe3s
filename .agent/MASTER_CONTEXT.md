# Wed3s — Canonical Project Context

> Đây là nguồn context chuẩn duy nhất cho cả ChatGPT Work và Codex. Không bắt đầu code trước khi hoàn tất bước Context Gate.

## 1. Mục tiêu dự án

Nâng cấp trang booking công khai của 3S Shoe Care từ landing tĩnh thành trải nghiệm quảng cáo + đặt dịch vụ 3D production-ready, trong khi giữ nguyên và bảo vệ luồng quản lý báo cáo, thanh toán, CRM, POS-58L và dữ liệu Supabase đang vận hành.

## 2. Kết quả bắt buộc

- Public booking có câu chuyện “giày bẩn → xử lý → sạch/phục hồi”.
- Booking vẫn tương thích với bảng `orders`, trạng thái và POS hiện tại trong giai đoạn chuyển đổi.
- Giá và trạng thái đơn được xác thực phía server; trình duyệt không được là nguồn sự thật.
- Admin được tách bundle khỏi public route.
- 3D có progressive enhancement, fallback 2D và chất lượng thích nghi theo thiết bị.
- Lighthouse, accessibility, security, E2E và rollback đều có bằng chứng.
- Mọi phiên Work/Codex tiếp tục được từ checkpoint trong repo, không dựa vào trí nhớ chat.

## 3. Phạm vi tính năng

### Public 3D booking
1. Hero thương hiệu 3S với model giày hoặc poster fallback.
2. Before/after scrub: kéo đường chia để chuyển dirt mask → clean material.
3. Cleaning timeline: bụi, bọt, bàn chải, làm sạch, sấy, hoàn thiện.
4. Danh mục dịch vụ lấy từ một service catalog duy nhất.
5. Form khách hàng, chọn dịch vụ, tóm tắt, xác nhận.
6. Chống spam bằng Turnstile/rate limit/idempotency.
7. Trạng thái thành công, lỗi mạng, retry an toàn.

### Hệ thống nội bộ
- Giữ auth Supabase.
- Dashboard, bookings, orders, finance, CRM, POS, VietQR, hóa đơn POS-58L.
- Không đổi schema/status/route ngoài migration đã duyệt.
- Tách module dần, không big-bang rewrite.

## 4. Tech stack mục tiêu

- Frontend: React + TypeScript + Vite.
- Styling: Tailwind CSS build-time hoặc CSS modules/tokens; không dùng Tailwind CDN ở production.
- 3D: Three.js, React Three Fiber, Drei chọn lọc, GSAP timeline.
- State: Zustand cho UI/scene state; TanStack Query khi cần server state.
- Validation: Zod dùng chung client/server.
- Edge API: Cloudflare Pages Functions/Workers.
- Data/Auth: Supabase Postgres + Auth + RLS.
- Testing: Vitest, Testing Library, Playwright, axe-core, Lighthouse CI.
- Asset pipeline: glTF/GLB, glTF Transform, Meshopt, KTX2/Basis.
- Deploy: GitHub → Cloudflare Pages; preview deployment theo PR.

## 5. Coding style

- TypeScript strict; không `any` nếu chưa có lý do ghi trong code.
- Pure domain functions cho giá, status transition và mapping booking → POS.
- Không inline event handler trong HTML mới.
- Không nối dữ liệu người dùng vào `innerHTML`; dùng DOM-safe rendering/React escaping.
- API trả lỗi có mã ổn định, không lộ stack/secrets.
- File nhỏ, một trách nhiệm; ưu tiên composition.
- Public API/module phải có type và test.

## 6. Design System

### Brand direction
- `ink-950`: #07111F — nền premium.
- `navy-800`: #0B2B46 — màu thương hiệu chính.
- `cyan-500`: #19B8E6 — tương tác/làm sạch.
- `copper-500`: #C77A3D — điểm nhấn thủ công/phục hồi.
- `mist-50`: #F5FAFC — nền sáng.
- `success-500`: #16A36A; `danger-500`: #D64545.

### Typography
- Heading: condensed/strong nhưng phải có font fallback và không làm giảm khả năng đọc.
- Body/UI: Plus Jakarta Sans hoặc Inter-compatible.
- Minimum body 16px trên mobile; touch target tối thiểu 44px.

### Motion
- Motion có mục đích, không trang trí quá mức.
- Tôn trọng `prefers-reduced-motion`.
- Chỉ transform/opacity cho UI animation chính.
- 3D pause khi tab hidden hoặc canvas ngoài viewport.

## 7. UI/UX guideline

- Mobile-first; CTA booking luôn rõ nhưng không che nội dung.
- 3D không được chặn form hoặc làm người dùng chờ.
- Nội dung và form xuất hiện trước; canvas lazy-load sau interaction/idle.
- Mỗi bước booking có progress, back, error recovery và giữ dữ liệu.
- Không dùng dark patterns, countdown giả, review giả hoặc giá giả.
- Before/after phải hỗ trợ keyboard và fallback tĩnh.

## 8. Quy tắc đặt tên

- Component: `PascalCase.tsx`.
- Hook: `useCamelCase.ts`.
- Domain/service: `kebab-case.ts` hoặc theo convention hiện hữu, nhưng thống nhất trong module.
- Test: `*.test.ts(x)`; E2E: `*.spec.ts`.
- Branch: `feat/<task-id>-<slug>`, `fix/<task-id>-<slug>`, `chore/<task-id>-<slug>`.
- Commit: Conventional Commits + task ID, ví dụ `feat(P04-T02): add adaptive 3d quality tiers`.

## 9. Rule coding bắt buộc

1. Audit trước, code sau.
2. Không sửa production schema/RLS trực tiếp khi chưa có migration + rollback.
3. Không lưu token/key bí mật trong client, log, Markdown hay ảnh chụp.
4. Không tin `price`, `total`, `status`, `created_at` do client gửi.
5. Không thay đổi route `/?page=order` hoặc `/` nếu chưa có compatibility redirect/test.
6. Không thêm thư viện nếu chưa ghi rationale, license, bundle cost và phương án thay thế.
7. Không tuyên bố “done” nếu chưa chạy acceptance commands và lưu evidence.
8. Một task chỉ chuyển `done` sau review + test + checkpoint.
9. Không để Work và Codex cùng sửa một branch tại cùng thời điểm.
10. Mọi quyết định kiến trúc ghi vào `.agent/state/DECISIONS.md`.

## 10. Quy trình review

- Self-review sau mỗi module.
- Subagent review: code, security, performance, UX, test.
- Independent review ở phiên/chat khác bằng GPT-5.6 và reviewer thứ hai cấu hình được.
- Tổng hợp điểm đồng thuận, kiểm chứng điểm bất đồng, tạo fix roadmap.
- Release gate chỉ mở khi không còn Critical/High chưa chấp nhận.

## 11. Quy tắc commit và Git

- Luôn làm trên branch riêng.
- Commit nhỏ, có thể rollback, không trộn refactor và behavior change nếu tránh được.
- Trước commit: format, lint, typecheck, unit test, secret scan.
- Trước push: E2E phù hợp, build, migration dry-run, asset budget.
- Không force-push branch dùng chung nếu chưa được phép.
- Handoff Work ↔ Codex phải commit state/checkpoint trước khi đổi công cụ.

## 12. Tiêu chuẩn chất lượng

- Typecheck/lint/build: 100% pass.
- Unit/domain tests: các hàm giá/status/adapter phải được bao phủ.
- E2E: booking happy path, retry/idempotency, admin checkout compatibility.
- Security: RLS verified, server-side price, input limits, XSS-safe, secret scan pass.
- Accessibility: WCAG 2.2 AA mục tiêu; keyboard, focus, reduced motion.
- Performance mục tiêu: 60fps trên thiết bị tốt; adaptive 30–60fps trên thiết bị yếu; không bắt buộc 60fps bằng cách hy sinh usability.
- Public initial JS không chứa admin/chart/xlsx/3D chunk.
- 3D asset có budget và fallback.
- Release có rollback test và observability checklist.

## 13. Context Gate

Trước dòng code đầu tiên, agent phải:
1. Đọc `AGENTS.md`, `AGENT.md`, `.agent/MASTER_CONTEXT.md`.
2. Đọc `.agent/state/STATE.json`, `CURRENT_TASK.md`, `DECISIONS.md`.
3. Chạy `python scripts/context_audit.py`.
4. Ghi thiếu/sai vào `.agent/state/CONTEXT_REVIEW.md`.
5. Chỉ khi `context_gate = approved` mới được chuyển sang research và planning.
