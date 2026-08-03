import { lazy, Suspense, useState } from 'react';
import { BookingWizard } from '../features/booking/BookingWizard.tsx';
import { getServiceCatalog } from '../../../../js/service-catalog';

const ShoeViewer = lazy(() => import('../features/viewer/ShoeViewer.tsx'));
const BeforeAfter = lazy(() => import('../features/viewer/BeforeAfter.tsx'));

const DIRT_PRESETS = [
  { label: 'Trước', factor: 0.85 },
  { label: 'Vừa', factor: 0.4 },
  { label: 'Sau', factor: 0.05 },
] as const;

export default function BookingPage() {
  const services = getServiceCatalog().filter((service) => service.active);
  const [heroDirt, setHeroDirt] = useState(0.85);

  return (
    <main>
      <section className="booking-hero" aria-label="Trang chủ">
        <div className="hero-grid">
          <div className="hero-copy">
            <h1>3S Shoe Care</h1>
            <p>
              Giày bẩn → Xử lý → Sạch &amp; phục hồi. Kéo thanh bên cạnh để xem mô hình 3D
              đôi giày phục hồi dần qua quy trình chăm sóc chuyên sâu.
            </p>
            <a className="cta" href="#services">
              Đặt lịch chăm sóc
            </a>
          </div>
          <div className="hero-viewer">
            <Suspense fallback={<p className="viewer-note">Đang tải mô hình 3D…</p>}>
              <ShoeViewer dirt={heroDirt} onDirtChange={setHeroDirt} initialDirt={0.85} />
            </Suspense>
            <div className="preset-row" role="group" aria-label="Chọn trạng thái giày">
              {DIRT_PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  className={`preset-chip${heroDirt === preset.factor ? ' active' : ''}`}
                  onClick={() => setHeroDirt(preset.factor)}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="story-strip" aria-label="Quy trình chăm sóc giày">
        <h2>Câu chuyện phục hồi</h2>
        <div className="story-grid">
          <div className="story-card">
            <span className="story-step">1</span>
            <h3>Nhận giày bẩn</h3>
            <p>Chúng tôi nhận giày ở tình trạng hiện tại, đánh giá chất liệu và vùng bẩn.</p>
          </div>
          <div className="story-card">
            <span className="story-step">2</span>
            <h3>Chăm sóc chuyên sâu</h3>
            <p>Làm sạch, khử mùi, phục hồi màu và phủ bảo vệ theo từng chất liệu.</p>
          </div>
          <div className="story-card">
            <span className="story-step">3</span>
            <h3>Sạch &amp; phục hồi</h3>
            <p>Bàn giao giày sạch, phục hồi độ bóng và cảm giác như mới.</p>
          </div>
        </div>
      </section>

      <section id="services" className="service-grid" aria-label="Dịch vụ">
        <h2 className="section-title">Dịch vụ</h2>
        {services.map((service) => (
          <div key={service.id} className="service-card">
            <span className="name">{service.name}</span>
            {service.priceVnd && service.priceVnd > 0 ? (
              <span className="price">{service.priceVnd.toLocaleString('vi-VN')} ₫</span>
            ) : (
              <span className="contact">Liên hệ báo giá</span>
            )}
          </div>
        ))}
      </section>

      <Suspense fallback={null}>
        <BeforeAfter />
      </Suspense>

      <BookingWizard />
    </main>
  );
}
