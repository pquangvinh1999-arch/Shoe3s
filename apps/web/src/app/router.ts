export type RouteName = 'booking' | 'admin' | 'unknown';

export function resolveRoute(search: string, pathname: string): RouteName {
  const params = new URLSearchParams(search);
  if (params.get('page') === 'order') return 'booking';
  if (params.get('page') === 'admin') return 'admin';
  if (pathname === '/booking/' || pathname === '/booking') return 'booking';
  if (pathname === '/' || pathname === '') return 'booking';
  return 'unknown';
}

export function isBookingSearch(search: string): boolean {
  return new URLSearchParams(search).get('page') === 'order';
}
