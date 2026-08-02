import { getServiceCatalog } from '../../../../js/service-catalog';

export default function BookingPage() {
  const services = getServiceCatalog().filter((service) => service.active);

  return (
    <main>
      <section className="booking-hero">
        <h1>3S Shoe Care</h1>
        <p>Giày bẩn → Xử lý → Sạch & phục hồi. Đặt lịch chăm sóc giày chuyên sâu.</p>
        <a className="cta" href="#services">
          Đặt lịch chăm sóc
        </a>
      </section>

      <section id="services" className="service-grid" aria-label="Dịch vụ">
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
    </main>
  );
}
