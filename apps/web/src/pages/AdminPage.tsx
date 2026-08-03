export default function AdminPage() {
  return (
    <main className="admin-gate">
      <meta httpEquiv="refresh" content="0; url=/admin/" />
      <h1>3S Shoe Care — Admin</h1>
      <p>Khu vực quản trị đã chuyển về <a href="/admin/">/admin/</a>. Đang chuyển hướng…</p>
      <a className="cta" href="/admin/">
        Vào khu vực quản trị
      </a>
    </main>
  );
}
