import { describe, expect, it } from 'vitest';
import { resolveRoute } from '../apps/web/src/app/router.ts';

describe('P04-T01 route adapter', () => {
  it('keeps ?page=order mapped to booking', () => {
    expect(resolveRoute('?page=order', '/')).toBe('booking');
    expect(resolveRoute('?page=order', '/anything')).toBe('booking');
  });

  it('supports /booking/ canonical alias', () => {
    expect(resolveRoute('', '/booking/')).toBe('booking');
    expect(resolveRoute('', '/booking')).toBe('booking');
  });

  it('maps / (bare root) to public booking landing (goal 3D hero)', () => {
    expect(resolveRoute('', '/')).toBe('booking');
    expect(resolveRoute('', '')).toBe('booking');
  });

  it('keeps ?page=admin mapped to admin (legacy compatibility redirect)', () => {
    expect(resolveRoute('?page=admin', '/')).toBe('admin');
    expect(resolveRoute('?page=admin', '/anything')).toBe('admin');
  });

  it('returns unknown for other paths', () => {
    expect(resolveRoute('', '/other')).toBe('unknown');
  });
});
