import { describe, expect, it } from 'vitest';
import { drawPoster, posterPalette, supportsWebGL } from '../apps/web/src/features/viewer/poster.ts';

describe('P04-T04 poster — WebGL support', () => {
  it('assumes WebGL available when no DOM (server/tests)', () => {
    expect(supportsWebGL()).toBe(true);
  });
});

describe('P04-T04 poster — palette', () => {
  it('follows clean → dirty interpolation', () => {
    expect(posterPalette(0).fill).toBe('#f2efe9');
    expect(posterPalette(1).fill).toBe('#6b5a4a');
  });

  it('clamps out-of-range factors', () => {
    expect(posterPalette(-0.5).fill).toBe('#f2efe9');
    expect(posterPalette(1.5).fill).toBe('#6b5a4a');
  });
});

describe('P04-T04 poster — drawPoster', () => {
  function fakeCtx() {
    const calls: string[] = [];
    const ctx = {
      fillStyle: '',
      strokeStyle: '',
      lineWidth: 0,
      clearRect: () => calls.push('clear'),
      beginPath: () => calls.push('begin'),
      fill: () => calls.push('fill'),
      stroke: () => calls.push('stroke'),
      rect: () => calls.push('rect'),
      ellipse: () => calls.push('ellipse'),
      arc: () => calls.push('arc'),
      moveTo: () => calls.push('move'),
      lineTo: () => calls.push('line'),
    };
    return { ctx: ctx as unknown as CanvasRenderingContext2D, calls };
  }

  it('draws body, sole and laces without throwing', () => {
    const { ctx, calls } = fakeCtx();
    drawPoster(ctx, 0, 512, 1);
    expect(calls).toContain('clear');
    expect(calls).toContain('fill');
    expect(calls).toContain('stroke');
    expect(calls.filter((call) => call === 'line').length).toBeGreaterThanOrEqual(4);
  });

  it('adds dirt spots proportional to factor', () => {
    const clean = fakeCtx();
    drawPoster(clean.ctx, 0, 512, 1);
    const dirty = fakeCtx();
    drawPoster(dirty.ctx, 1, 512, 1);
    const countArc = (calls: string[]) => calls.filter((call) => call === 'arc').length;
    expect(countArc(dirty.calls)).toBeGreaterThan(countArc(clean.calls));
  });

  it('is deterministic for a fixed seed', () => {
    const a = fakeCtx();
    const b = fakeCtx();
    drawPoster(a.ctx, 0.7, 256, 42);
    drawPoster(b.ctx, 0.7, 256, 42);
    expect(a.calls).toEqual(b.calls);
  });
});
