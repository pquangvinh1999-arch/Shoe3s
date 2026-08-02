import { lazy, Suspense, useState } from 'react';
import { getServiceCatalog } from '../../../../../js/service-catalog';
import { tokens } from '../../design/tokens.ts';
import { createIdempotencyKey, validPhone, computeQuote, submitOrder, type SubmitResult } from './api.ts';

const ShoeViewer = lazy(() => import('../viewer/ShoeViewer.tsx'));

type Step = 1 | 2 | 3 | 4;

const STEP_LABELS: Record<Step, string> = {
  1: 'Chọn dịch vụ',
  2: 'Thông tin của bạn',
  3: 'Nhận / trả giày',
  4: 'Xác nhận & gửi',
};

export function BookingWizard() {
  const services = getServiceCatalog().filter((service) => service.active);
  const [step, setStep] = useState<Step>(1);
  const [selected, setSelected] = useState<string[]>([]);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [pickupAddress, setPickupAddress] = useState('');
  const [note, setNote] = useState('');
  const [idempotencyKey, setIdempotencyKey] = useState(() => createIdempotencyKey());
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SubmitResult | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [previewDirt, setPreviewDirt] = useState(0.4);

  const quote = computeQuote(services.filter((service) => selected.includes(service.id)));

  function toggleService(id: string) {
    setSelected((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]));
  }

  function goTo(next: Step) {
    setError(null);
    setStep(next);
  }

  async function handleSubmit() {
    if (submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await submitOrder({
        customer_name: name,
        phone,
        service_ids: selected,
        pickup_address: pickupAddress.trim() || undefined,
        note: note.trim() || undefined,
        turnstile_token: 'local-demo-token',
        idempotency_key: idempotencyKey,
      });
      setResult(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi gửi đơn hàng');
      setIdempotencyKey(createIdempotencyKey());
    } finally {
      setSubmitting(false);
    }
  }

  if (result) {
    return (
      <section className="wizard-card" role="status" aria-live="polite">
        <h2>Đặt lịch thành công!</h2>
        <p>
          Mã đơn: <strong>{result.order_id}</strong>
        </p>
        <p className="muted">
          Tổng tạm tính: <strong>{result.quote.total_vnd.toLocaleString('vi-VN')} ₫</strong>
        </p>
        <p className="muted">3S Shoe Care sẽ liên hệ bạn để xác nhận.</p>
        <a className="cta" href="/?page=order">
          Đặt thêm lịch khác
        </a>
      </section>
    );
  }

  return (
    <form
      className="wizard-card"
      aria-label="Đặt lịch chăm sóc giày"
      onSubmit={(event) => {
        event.preventDefault();
        if (step === 4) void handleSubmit();
      }}
    >
      <div className="wizard-header">
        <h2>Đặt lịch chăm sóc giày</h2>
        <p className="muted">
          Bước {step} / 4 — {STEP_LABELS[step]}
        </p>
      </div>

      {error && (
        <p className="error-box" role="alert">
          {error}
        </p>
      )}

      {step === 1 && (
        <fieldset className="service-list">
          <legend>Chọn dịch vụ (bắt buộc)</legend>
          {services.map((service) => {
            const checked = selected.includes(service.id);
            return (
              <label key={service.id} className={`service-option${checked ? ' selected' : ''}`}>
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleService(service.id)}
                />
                <span className="service-name">{service.name}</span>
                <span className="service-price">
                  {service.priceVnd && service.priceVnd > 0
                    ? `${service.priceVnd.toLocaleString('vi-VN')} ₫`
                    : 'Liên hệ báo giá'}
                </span>
              </label>
            );
          })}
        </fieldset>
      )}

      {step === 2 && (
        <fieldset className="form-fields">
          <legend>Thông tin của bạn</legend>
          <label htmlFor="wiz-name">
            Họ tên
            <input
              id="wiz-name"
              type="text"
              autoComplete="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              minLength={2}
              maxLength={80}
              required
            />
          </label>
          <label htmlFor="wiz-phone">
            Số điện thoại
            <input
              id="wiz-phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              pattern="0[0-9]{9,10}|(\+?84[0-9]{9})"
              required
            />
          </label>
        </fieldset>
      )}

      {step === 3 && (
        <fieldset className="form-fields">
          <legend>Nhận / trả giày</legend>
          <label htmlFor="wiz-address">
            Địa chỉ nhận / trả (không bắt buộc)
            <input
              id="wiz-address"
              type="text"
              value={pickupAddress}
              onChange={(event) => setPickupAddress(event.target.value)}
              maxLength={240}
            />
          </label>
          <label htmlFor="wiz-note">
            Ghi chú (không bắt buộc)
            <textarea
              id="wiz-note"
              rows={3}
              value={note}
              onChange={(event) => setNote(event.target.value)}
              maxLength={500}
            />
          </label>
        </fieldset>
      )}

      {step === 4 && (
        <div className="review">
          <h3>Xác nhận báo giá</h3>
          <ul className="review-items">
            {quote.items.map((item) => (
              <li key={item.service_id}>
                <span>{item.name}</span>
                <span>
                  {item.unit_price_vnd && item.unit_price_vnd > 0
                    ? `${item.unit_price_vnd.toLocaleString('vi-VN')} ₫`
                    : 'Liên hệ báo giá'}
                </span>
              </li>
            ))}
          </ul>
          <p className="review-total">
            Tổng tạm tính: <strong>{quote.totalVnd.toLocaleString('vi-VN')} ₫</strong>
          </p>
          <p className="muted small">
            Khách: {name} — {phone}
            {pickupAddress ? ` — ${pickupAddress}` : ''}
          </p>

          <div className="preview">
            <button
              type="button"
              className="btn-secondary"
              aria-expanded={showPreview}
              aria-controls="shoe-preview"
              onClick={() => setShowPreview((value) => !value)}
            >
              {showPreview ? 'Ẩn mô hình 3D' : 'Xem mô hình 3D'}
            </button>
            {showPreview && (
              <Suspense fallback={<p className="muted small">Đang tải mô hình 3D…</p>}>
                <div id="shoe-preview">
                  <ShoeViewer initialDirt={previewDirt} onDirtChange={setPreviewDirt} />
                </div>
              </Suspense>
            )}
          </div>
        </div>
      )}

      <div className="wizard-actions">
        {step > 1 && (
          <button type="button" className="btn-secondary" onClick={() => goTo((step - 1) as Step)}>
            Quay lại
          </button>
        )}
        {step < 4 ? (
          <button
            type="button"
            className="cta"
            disabled={step === 1 ? selected.length === 0 : step === 2 ? !name.trim() || !validPhone(phone) : false}
            onClick={() => goTo((step + 1) as Step)}
          >
            Tiếp tục
          </button>
        ) : (
          <button type="submit" className="cta" disabled={submitting}>
            {submitting ? 'Đang gửi…' : 'Xác nhận đặt lịch'}
          </button>
        )}
      </div>

      <style>{`
        .wizard-card {
          background: #fff;
          border-radius: 1rem;
          box-shadow: 0 8px 24px rgba(7, 17, 31, 0.08);
          padding: 2rem 1.5rem;
          max-width: 640px;
          margin: 2rem auto;
          color: ${tokens.ink950};
        }
        .wizard-card h2 { margin: 0 0 0.25rem; color: ${tokens.navy800}; }
        .muted { color: #5b6b7c; }
        .small { font-size: 0.875rem; }
        .service-list { border: 0; padding: 0; margin: 1rem 0; display: grid; gap: 0.625rem; }
        .service-list legend, .form-fields legend { font-weight: 700; margin-bottom: 0.5rem; color: ${tokens.navy800}; }
        .service-option {
          display: flex; align-items: center; gap: 0.75rem;
          border: 1px solid rgba(11, 43, 70, 0.15); border-radius: 0.75rem;
          padding: 0.875rem 1rem; min-height: ${tokens.minTouch}; cursor: pointer;
        }
        .service-option.selected { border-color: ${tokens.cyan500}; background: rgba(25, 184, 230, 0.08); }
        .service-name { font-weight: 600; flex: 1; }
        .service-price { color: ${tokens.navy800}; font-weight: 800; }
        .form-fields { border: 0; padding: 0; margin: 1rem 0; display: grid; gap: 1rem; }
        .form-fields label { display: grid; gap: 0.375rem; font-weight: 600; }
        .form-fields input, .form-fields textarea {
          font: inherit; padding: 0.75rem 0.875rem; border-radius: 0.625rem;
          border: 1px solid rgba(11, 43, 70, 0.25); min-height: ${tokens.minTouch};
        }
        .error-box { background: rgba(214, 69, 69, 0.1); color: ${tokens.danger500}; padding: 0.75rem 1rem; border-radius: 0.625rem; font-weight: 600; }
        .review-items { list-style: none; padding: 0; margin: 1rem 0; display: grid; gap: 0.5rem; }
        .review-items li { display: flex; justify-content: space-between; gap: 1rem; }
        .review-total { border-top: 1px dashed rgba(11, 43, 70, 0.25); padding-top: 0.75rem; display: flex; justify-content: space-between; }
        .wizard-actions { display: flex; gap: 0.75rem; justify-content: flex-end; margin-top: 1.5rem; }
        .btn-secondary {
          min-height: ${tokens.minTouch}; padding: 0.875rem 1.5rem; border-radius: 0.75rem;
          border: 1px solid rgba(11, 43, 70, 0.3); background: #fff; font-weight: 700; cursor: pointer;
        }
        .cta {
          min-height: ${tokens.minTouch}; display: inline-flex; align-items: center; justify-content: center;
          background: ${tokens.cyan500}; color: ${tokens.ink950}; font-weight: 800;
          padding: 0.875rem 1.75rem; border: 0; border-radius: 0.75rem; text-decoration: none; cursor: pointer;
        }
        .cta:disabled { opacity: 0.5; cursor: not-allowed; }
        @media (prefers-reduced-motion: reduce) { .wizard-card, .service-option { transition: none; } }
      `}</style>
    </form>
  );
}
