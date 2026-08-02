import { describe, expect, it } from 'vitest';
import {
  applyDirtToParts,
  buildProceduralShoe,
  dirtVisual,
  resolveAdapter,
} from '../apps/web/src/features/viewer/scene.ts';

describe('P04-T03 viewer — adapter', () => {
  it('defaults to full quality on capable devices', () => {
    const adapter = resolveAdapter({
      reducedMotion: false,
      hardwareConcurrency: 8,
      coarsePointer: false,
      pixelRatio: 2,
    });
    expect(adapter).toEqual({
      pixelRatio: 2,
      autoRotate: true,
      segments: 24,
      dirtTextureSize: 512,
    });
  });

  it('degrades on low-power devices', () => {
    const adapter = resolveAdapter({
      reducedMotion: true,
      hardwareConcurrency: 2,
      coarsePointer: true,
      pixelRatio: 3,
    });
    expect(adapter).toEqual({
      pixelRatio: 1,
      autoRotate: false,
      segments: 8,
      dirtTextureSize: 128,
    });
  });

  it('treats ≤4 cores as low power', () => {
    const adapter = resolveAdapter({ hardwareConcurrency: 4, pixelRatio: 1 });
    expect(adapter.autoRotate).toBe(false);
    expect(adapter.segments).toBe(8);
  });
});

describe('P04-T03 viewer — dirt visuals', () => {
  it('interpolates color clean → dirty', () => {
    const clean = dirtVisual(0);
    const dirty = dirtVisual(1);
    expect(clean.color.getHexString()).toBe('f2efe9');
    expect(clean.roughness).toBe(0.55);
    expect(dirty.roughness).toBeCloseTo(0.95, 5);
    expect(dirty.color.getHexString()).toBe('6b5a4a');
  });

  it('clamps factor outside [0,1]', () => {
    expect(dirtVisual(-1).color.getHexString()).toBe('f2efe9');
    expect(dirtVisual(2).color.getHexString()).toBe('6b5a4a');
  });
});

describe('P04-T03 viewer — procedural shoe', () => {
  it('builds body, toe, sole, collar and laces', () => {
    const parts = buildProceduralShoe(8);
    expect(parts.length).toBeGreaterThanOrEqual(8);
    expect(parts.every((part) => part.baseColor.getHexString() === 'f2efe9')).toBe(true);
  });

  it('low-power segments produce same part count', () => {
    expect(buildProceduralShoe(8).length).toBe(buildProceduralShoe(24).length);
  });

  it('applyDirtToParts sets materials without error', () => {
    const parts = buildProceduralShoe(8);
    applyDirtToParts(parts, 0.7);
    parts.forEach((part) => {
      expect(part.mesh.material).toHaveProperty('roughness');
    });
  });
});
