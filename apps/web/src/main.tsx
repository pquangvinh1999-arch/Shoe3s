import { StrictMode, lazy, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { resolveRoute } from './app/router.ts';
import './styles.css';

const BookingPage = lazy(() => import('./pages/BookingPage.tsx'));
const AdminPage = lazy(() => import('./pages/AdminPage.tsx'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage.tsx'));

function App() {
  const route = resolveRoute(window.location.search, window.location.pathname);

  if (route === 'booking') {
    return <BookingPage />;
  }
  if (route === 'admin') {
    return <AdminPage />;
  }
  return <NotFoundPage />;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Suspense fallback={<div className="shell-loading">3S Shoe Care</div>}>
      <App />
    </Suspense>
  </StrictMode>
);
