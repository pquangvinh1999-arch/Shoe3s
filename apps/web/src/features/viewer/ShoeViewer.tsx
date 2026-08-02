import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import {
  applyDirtToParts,
  buildProceduralShoe,
  createDirtTexture,
  resolveAdapter,
  type ShoePart,
  type ViewerAdapter,
} from './scene.ts';
import { drawPoster, supportsWebGL } from './poster.ts';

type Props = {
  initialDirt?: number;
  onDirtChange?: (factor: number) => void;
};

type Mode = '3d' | 'poster';

export function ShoeViewer({ initialDirt = 0.4, onDirtChange }: Props) {
  return <ShoeViewerInner initialDirt={initialDirt} onDirtChange={onDirtChange} />;
}

function ShoeViewerInner({ initialDirt = 0.4, onDirtChange }: Props) {
  const mountRef = useRef<HTMLDivElement>(null);
  const posterCanvasRef = useRef<HTMLCanvasElement>(null);
  const [dirt, setDirt] = useState(initialDirt);
  const [interactive, setInteractive] = useState(true);
  const [mode, setMode] = useState<Mode>(() => (supportsWebGL() ? '3d' : 'poster'));

  const stateRef = useRef<{
    parts: ShoePart[];
    texture: THREE.CanvasTexture | null;
    render: () => void;
    adapter: ViewerAdapter | null;
  }>({ parts: [], texture: null, render: () => undefined, adapter: null });

  useEffect(() => {
    const mount = mountRef.current;
    if (mode !== '3d' || !mount) return;

    let adapter: ViewerAdapter;
    try {
      adapter = resolveAdapter({
        reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
        hardwareConcurrency: navigator.hardwareConcurrency,
        coarsePointer: window.matchMedia('(pointer: coarse)').matches,
        pixelRatio: window.devicePixelRatio,
      });
    } catch {
      setMode('poster');
      return;
    }
    setInteractive(adapter.autoRotate);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#0B2B46');

    const camera = new THREE.PerspectiveCamera(45, mount.clientWidth / mount.clientHeight, 0.1, 100);
    camera.position.set(3, 1.8, 3.6);
    camera.lookAt(0, 0.4, 0);

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: adapter.pixelRatio > 1 });
    } catch {
      setMode('poster');
      return;
    }
    renderer.setPixelRatio(adapter.pixelRatio);
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    mount.appendChild(renderer.domElement);

    scene.add(new THREE.HemisphereLight(0xffffff, 0x0b2b46, 1.1));
    const keyLight = new THREE.DirectionalLight(0xffffff, 1.6);
    keyLight.position.set(4, 6, 3);
    scene.add(keyLight);

    const group = new THREE.Group();
    group.position.y = -0.4;
    scene.add(group);

    const parts = buildProceduralShoe(adapter.segments);
    parts.forEach((part) => group.add(part.mesh));

    const render = () => renderer.render(scene, camera);

    stateRef.current.parts = parts;
    stateRef.current.adapter = adapter;
    stateRef.current.render = render;

    let raf = 0;
    let disposed = false;
    const loop = () => {
      if (disposed) return;
      if (adapter.autoRotate) {
        group.rotation.y += 0.006;
        render();
      }
      raf = requestAnimationFrame(loop);
    };
    if (adapter.autoRotate) {
      loop();
    } else {
      render();
    }

    const handleResize = () => {
      if (disposed) return;
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
      render();
    };
    window.addEventListener('resize', handleResize);

    const handlePointer = () => {
      if (disposed || !adapter.autoRotate) return;
      group.rotation.y += 0.2;
      render();
    };
    renderer.domElement.addEventListener('pointerdown', handlePointer);

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('pointerdown', handlePointer);
      stateRef.current.texture?.dispose();
      parts.forEach((part) => {
        part.mesh.geometry.dispose();
        (part.mesh.material as THREE.Material).dispose();
      });
      renderer.dispose();
      if (renderer.domElement.parentElement === mount) {
        mount.removeChild(renderer.domElement);
      }
      stateRef.current.parts = [];
      stateRef.current.texture = null;
      stateRef.current.adapter = null;
    };
  }, [mode]);

  useEffect(() => {
    onDirtChange?.(dirt);

    if (mode === 'poster') {
      const canvas = posterCanvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      drawPoster(ctx, dirt, canvas.width, 7);
      return;
    }

    const { parts, adapter, render } = stateRef.current;
    if (!parts.length || !adapter) return;

    stateRef.current.texture?.dispose();
    const texture = createDirtTexture(adapter.dirtTextureSize, dirt);
    stateRef.current.texture = texture;
    parts.forEach((part) => {
      const material = part.mesh.material as THREE.MeshStandardMaterial;
      material.map = texture;
      material.needsUpdate = true;
    });
    applyDirtToParts(parts, dirt);
    render();
  }, [dirt, mode, onDirtChange]);

  return (
    <div className="viewer-wrap">
      {mode === '3d' ? (
        <div
          ref={mountRef}
          className="viewer-canvas"
          aria-label="Mô hình 3D giày"
          role="img"
        />
      ) : (
        <canvas
          ref={posterCanvasRef}
          width={512}
          height={512}
          className="viewer-canvas"
          aria-label="Mô hình giày (chế độ 2D)"
          role="img"
        />
      )}
      <label className="dirt-slider">
        Mức độ bẩn: <strong>{Math.round(dirt * 100)}%</strong>
        <input
          type="range"
          min={0}
          max={1}
          step={0.05}
          value={dirt}
          aria-label="Mức độ bẩn của giày"
          onChange={(event) => setDirt(Number(event.target.value))}
        />
      </label>
      {mode === 'poster' ? (
        <p className="viewer-note">Trình duyệt không hỗ trợ WebGL — hiển thị chế độ 2D.</p>
      ) : !interactive && (
        <p className="viewer-note">Chế độ tiết kiệm năng lượng: ảnh tĩnh.</p>
      )}
      <style>{`
        .viewer-wrap { display: grid; gap: 0.75rem; }
        .viewer-canvas {
          border-radius: 0.75rem; overflow: hidden;
          width: 100%; height: 300px; display: block;
          background: #0b2b46;
        }
        .dirt-slider { display: grid; gap: 0.375rem; font-weight: 600; }
        .dirt-slider input { min-height: 44px; accent-color: #19b8e6; }
        .viewer-note { margin: 0; font-size: 0.8rem; color: #5b6b7c; }
      `}</style>
    </div>
  );
}

export default ShoeViewer;
