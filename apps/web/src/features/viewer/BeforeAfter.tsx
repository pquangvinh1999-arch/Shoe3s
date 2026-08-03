import { useEffect, useRef } from 'react';
import { drawPoster } from './poster.ts';

const PRESETS = [
  { label: 'Trước (bẩn)', factor: 0.85, seed: 7 },
  { label: 'Sau (sạch)', factor: 0.04, seed: 1 },
] as const;

function Poster({
  factor,
  seed,
  label,
}: {
  factor: number;
  seed: number;
  label: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    drawPoster(ctx, factor, canvas.width, seed);
  }, [factor, seed]);

  return (
    <figure className="ba-figure">
      <canvas ref={canvasRef} width={256} height={256} className="ba-canvas" aria-hidden="true" />
      <figcaption>{label}</figcaption>
    </figure>
  );
}

export function BeforeAfter() {
  return (
    <section className="ba-section" id="before-after" aria-label="Trước và sau khi chăm sóc">
      <h2>Trước &amp; sau khi chăm sóc</h2>
      <p className="muted">Kéo thanh ở mô hình 3D phía trên để thấy đôi giày phục hồi dần.</p>
      <div className="ba-row">
        {PRESETS.map((preset) => (
          <Poster key={preset.label} factor={preset.factor} seed={preset.seed} label={preset.label} />
        ))}
      </div>
    </section>
  );
}

export default BeforeAfter;
