# 04 — Domain và API contracts

## Service catalog

Một nguồn sự thật:

```ts
type Service = {
  id: string;
  name: string;
  description: string;
  pricingMode: "fixed" | "contact";
  priceVnd: number | null;
  active: boolean;
  sortOrder: number;
  visualTarget?: "upper" | "sole" | "stitch" | "bag";
};
```

ID không đổi khi đổi tên hiển thị.

Catalog ban đầu phải được trích từ code hiện tại, không tự bịa giá:
- vệ sinh toàn diện;
- xử lý keo;
- khâu đế;
- tẩy ố vàng đế;
- dán sole;
- thay/đắp đế;
- vệ sinh túi/balo.

## Order state machine

```text
new public booking
  -> Chờ thanh toán
  -> checkout/POS
  -> Đã hoàn thành

legacy/manual path may use:
  -> Chờ nhận đơn
  -> Đã hoàn thành
```

Không đổi text status trong phase đầu. Tạo internal constants/adapters để loại
bỏ magic string nhưng persist text cũ.

## POST /api/orders

### Request

```ts
{
  customer_name: string;       // 2..80
  phone: string;               // normalized VN phone
  service_ids: string[];       // 1..10
  pickup_address?: string;     // <= 240
  note?: string;               // <= 500
  turnstile_token: string;
  idempotency_key: string;     // UUID
}
```

### Server-derived

- `services`
- `service_items`
- `total`
- `status = "Chờ thanh toán"`
- `created_at`
- `pricing_version`
- `source = "web-3d-booking"`

### Response

```ts
{
  ok: true;
  order_id: string;
  status: "Chờ thanh toán";
  quote: {
    total_vnd: number;
    items: Array<{ service_id: string; name: string; qty: number; unit_price_vnd: number | null }>;
  };
}
```

Không trả secret, policy detail hoặc stack trace.

## Error envelope

```ts
{
  ok: false;
  code: "VALIDATION_ERROR" | "BOT_CHECK_FAILED" | "RATE_LIMITED" | "INTERNAL_ERROR";
  message: string;
  request_id: string;
}
```

## Idempotency

- Unique key + payload hash.
- Cùng key/cùng payload trả lại order cũ.
- Cùng key/khác payload trả conflict.
- Client giữ key đến khi có response rõ ràng.
- Retry network không tạo đơn trùng.

## Compatibility adapter

Trong migration phase:
- `services` string được format từ structured items.
- Admin cũ vẫn parse được `(xN)`.
- `total` vẫn là integer VND.
- Không đổi schema bắt buộc trước khi baseline tests tồn tại.
