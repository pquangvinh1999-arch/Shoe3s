# 01 — Kiến trúc mục tiêu

## Kiến trúc đề xuất

```text
Shoe3s/
├─ AGENTS.md
├─ apps/
│  └─ web/
│     ├─ index.html
│     ├─ src/
│     │  ├─ app/
│     │  │  ├─ router/
│     │  │  ├─ booking/
│     │  │  └─ admin/
│     │  ├─ features/
│     │  │  ├─ booking/
│     │  │  ├─ checkout/
│     │  │  ├─ dashboard/
│     │  │  ├─ finance/
│     │  │  └─ crm/
│     │  ├─ three/
│     │  │  ├─ ShoeExperience.tsx
│     │  │  ├─ quality/
│     │  │  ├─ materials/
│     │  │  └─ fallback/
│     │  ├─ shared/
│     │  └─ styles/
│     └─ public/
│        ├─ models/
│        ├─ textures/
│        └─ posters/
├─ functions/
│  └─ api/
│     ├─ orders/
│     │  ├─ index.ts
│     │  └─ status.ts
│     ├─ telegram.ts
│     └─ health.ts
├─ packages/
│  ├─ domain/
│  │  ├─ service-catalog.ts
│  │  ├─ order-schema.ts
│  │  ├─ money.ts
│  │  └─ statuses.ts
│  ├─ ui/
│  └─ config/
├─ supabase/
│  └─ migrations/
├─ tests/
│  ├─ contract/
│  ├─ e2e/
│  ├─ visual/
│  └─ performance/
└─ orchestrator/
```

## Vì sao chọn React + Vite + TypeScript

- Phù hợp Cloudflare Pages static build.
- Route/code splitting rõ ràng.
- React Three Fiber giúp quản lý scene theo component, cleanup lifecycle và
  adaptive performance.
- TypeScript + Zod giảm mismatch giữa form, API và Supabase.
- Không bắt buộc chuyển admin sang framework ngay trong một commit.

## Deployment topology

```text
Browser
  ├─ GET static app ─────────────── Cloudflare Pages
  ├─ POST /api/orders ───────────── Pages Function
  │    ├─ Turnstile verification
  │    ├─ schema validation
  │    ├─ server-side pricing
  │    ├─ Supabase insert
  │    └─ Telegram notification
  └─ Admin authenticated reads ──── Supabase Data API / secured Functions
```

## Route compatibility

- `/?page=order`: bắt buộc tiếp tục hoạt động.
- `/`: admin.
- Có thể thêm `/booking/` làm canonical alias sau, nhưng redirect không được
  áp dụng trước khi analytics và external links đã được kiểm tra.

## Data compatibility

### Giai đoạn chuyển tiếp

Giữ cột cũ:
- `customer_name`
- `phone`
- `services`
- `total`
- `status`
- `created_at`

Thêm dữ liệu có cấu trúc:
- `order_items` hoặc `orders.service_items jsonb`
- `idempotency_key`
- `source`
- `quoted_at`
- `pricing_version`
- `notes`
- `pickup_address`

`services` string được sinh từ item structured để admin cũ vẫn đọc được.

## Không chọn

### Gắn Three.js vào file hiện tại

Không chọn vì bundle chung, global state khó kiểm soát, cleanup WebGL khó,
test kém và rủi ro phá admin.

### Big-bang rewrite toàn repo

Không chọn vì hệ thống đang vận hành và logic POS/CRM/receipt có nhiều coupling.
Migration theo strangler pattern giảm rollback cost.

### Next.js

Không cần SSR phức tạp ở giai đoạn đầu; Vite + Cloudflare Pages/Functions đơn
giản hơn và giữ chi phí thấp. Chỉ xem xét framework SSR khi SEO/content động
thực sự cần.
