import { dirtVisual } from './scene.ts';

export function supportsWebGL(): boolean {
  if (typeof document === 'undefined') return true;
  try {
    const canvas = document.createElement('canvas');
    return Boolean(
      canvas.getContext('webgl2') || canvas.getContext('webgl') || canvas.getContext('experimental-webgl'),
    );
  } catch {
    return false;
  }
}

export function posterPalette(factor: number): { fill: string; spot: string } {
  const clamped = Math.max(0, Math.min(1, factor));
  const visual = dirtVisual(clamped);
  return {
    fill: `#${visual.color.getHexString()}`,
    spot: 'rgba(60, 45, 30, 0.85)',
  };
}

function roundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
): void {
  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(x, y, w, h, r);
  } else {
    ctx.rect(x, y, w, h);
  }
}

export function drawPoster(
  ctx: CanvasRenderingContext2D,
  dirt: number,
  size = 512,
  seed = 1,
): void {
  const clamped = Math.max(0, Math.min(1, dirt));
  const palette = posterPalette(clamped);

  ctx.clearRect(0, 0, size, size);
  ctx.fillStyle = palette.fill;

  ctx.beginPath();
  roundedRect(ctx, size * 0.18, size * 0.3, size * 0.64, size * 0.34, size * 0.06);
  ctx.fill();

  ctx.beginPath();
  ctx.ellipse(size * 0.76, size * 0.44, size * 0.16, size * 0.13, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  roundedRect(ctx, size * 0.16, size * 0.62, size * 0.68, size * 0.07, size * 0.02);
  ctx.fill();

  ctx.strokeStyle = 'rgba(11, 43, 70, 0.35)';
  ctx.lineWidth = size / 128;
  for (let i = 0; i < 4; i++) {
    ctx.beginPath();
    ctx.moveTo(size * 0.34, size * 0.34 + i * size * 0.055);
    ctx.lineTo(size * 0.66, size * 0.34 + i * size * 0.055);
    ctx.stroke();
  }

  if (clamped > 0) {
    ctx.fillStyle = palette.spot;
    let state = seed;
    const rnd = () => {
      state = (state * 9301 + 49297) % 233280;
      return state / 233280;
    };
    const spots = Math.round(clamped * 160);
    for (let i = 0; i < spots; i++) {
      const x = size * (0.18 + rnd() * 0.64);
      const y = size * (0.3 + rnd() * 0.32);
      const r = (1 + rnd() * clamped * 12) * (size / 512);
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}
