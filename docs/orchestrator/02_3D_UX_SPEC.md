# 02 — Đặc tả UX/UI và trải nghiệm 3D

## Creative direction

**Concept:** “Sole Revival — From Worn to Renewed”

Phong cách:
- Editorial typography lớn, mạnh.
- Cobalt/ink/foam-white, accent xanh vệ sinh.
- Glass chỉ dùng có chủ đích, không phủ toàn giao diện.
- Bento cards cho dịch vụ/quy trình.
- Motion có ý nghĩa: bẩn → phân tích → làm sạch → phục hồi → đặt lịch.
- CTA booking luôn rõ hơn hiệu ứng.

## Storyboard

1. **Arrival:** giày bẩn ở góc 3/4, ánh sáng thấp, poster xuất hiện tức thì.
2. **Scan:** đường quét mỏng cho thấy vùng bẩn; không dùng bloom nặng mobile.
3. **Deep clean:** mask vật liệu chuyển dần dirty → clean.
4. **Foam/detail:** particle/foam chỉ tier cao.
5. **Dry/restore:** roughness, color và sole brightness chuyển có kiểm soát.
6. **Before/after:** drag slider hoặc scroll-controlled reveal.
7. **Service match:** camera focus vùng tương ứng với card dịch vụ.
8. **Booking:** camera ổn định, form nổi rõ, animation dừng để nhập liệu.
9. **Success:** một micro-animation ngắn, không giữ WebGL chạy vô hạn.

## Kỹ thuật chuyển dirty → clean

Ưu tiên một GLB tối ưu với:
- mesh ổn định;
- UV hợp lệ;
- dirty mask texture;
- clean base textures;
- shader uniform `uCleanProgress`;
- blend albedo/roughness/normal có giới hạn;
- optional decal dirt cho tier cao.

Không tải hai model full-size nếu chỉ khác vật liệu.

Pseudo logic:

```ts
cleanProgress = clamp(scrollOrTimelineProgress, 0, 1)
baseColor = mix(dirtyColor, cleanColor, smoothstep(edge0, edge1, mask + cleanProgress))
roughness = mix(dirtyRoughness, cleanRoughness, cleanProgress)
```

## Progressive enhancement tiers

### Tier 0 — No WebGL / reduced motion / data saver

- Poster AVIF/WebP.
- CSS before-after slider.
- Không canvas.
- Form đầy đủ.
- Đây là trải nghiệm bắt buộc phải pass E2E.

### Tier 1 — Low

- 1 model low-poly.
- 1K textures.
- Không postprocessing, không particle.
- DPR tối đa 1.25.
- Render on-demand.

### Tier 2 — Medium

- 1–2K textures.
- Dirt shader + camera timeline.
- DPR tối đa 1.5.
- Particle tối thiểu, tắt khi rời viewport.

### Tier 3 — High

- 2K textures.
- Foam/detail particles giới hạn.
- Selective postprocessing.
- DPR tối đa 2.
- Tự hạ tier khi frame budget vượt ngưỡng.

## 60 FPS strategy

“60 FPS” là target trên thiết bị đủ khả năng, không phải lời hứa cho mọi máy.

Bắt buộc:
- canvas lazy-load sau HTML hero;
- poster trước canvas;
- `frameloop="demand"` khi scene tĩnh;
- pause khi `document.hidden` hoặc canvas ngoài viewport;
- adaptive DPR/quality;
- precompile/warmup sau idle;
- dispose geometry/material/texture;
- shared materials/geometries;
- meshopt/Draco khi phù hợp;
- KTX2/Basis textures;
- không dùng shadow realtime trên tier thấp;
- cap particles;
- không animation loop trong form booking;
- `prefers-reduced-motion`;
- WebGL context loss recovery.

## UX sections

1. Sticky minimal header.
2. 3D hero + CTA “Đặt lịch chăm sóc”.
3. Trust strip.
4. Before/after.
5. Dịch vụ với giá từ catalog.
6. Quy trình nhận giày → chăm sóc → bàn giao.
7. Booking wizard.
8. FAQ.
9. Contact/map.
10. Mobile sticky CTA.

## Booking wizard

1. Chọn dịch vụ.
2. Thông tin khách.
3. Nhận/trả giày hoặc địa chỉ.
4. Review báo giá.
5. Turnstile.
6. Submit với idempotency key.
7. Success có mã đơn.

Không để người dùng phải hoàn thành animation mới mở form.
