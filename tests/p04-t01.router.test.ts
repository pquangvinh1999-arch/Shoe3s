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

  it('keeps / mapped to admin', () => {
    expect(resolveRoute('', '/')).toBe('admin');
    expect(resolveRoute('', '')).toBe('admin');
  });

  it('returns unknown for other paths but treats non-order page params as admin on /', () => {
    expect(resolveRoute('', '/other')).toBe('unknown');
    expect(resolveRoute('?page=other', '/')).toBe('admin');
  });
});
