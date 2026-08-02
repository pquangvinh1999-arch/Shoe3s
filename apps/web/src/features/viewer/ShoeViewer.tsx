import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import {
  applyDirtToParts,
  buildProceduralShoe,
  createDirtTexture,
  resolveAdapter,
} from './scene.ts';

type Props = {
  initialDirt?: number;
  onDirtChange?: (factor: number) => void;
};

export function ShoeViewer({ initialDirt = 0.4, onDirtChange }: Props) {
  return <ShoeViewerInner initialDirt={initialDirt} onDirtChange={onDirtChange} />;
}

function ShoeViewerInner({ initialDirt = 0.4, onDirtChange }: Props) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [dirt, setDirt] = useState(initialDirt);
  const [interactive, setInteractive] = useState(true);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const adapter = resolveAdapter({
      reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
      hardwareConcurrency: navigator.hardwareConcurrency,
      coarsePointer: window.matchMedia('(pointer: coarse)').matches,
      pixelRatio: window.devicePixelRatio,
    });
    setInteractive(adapter.autoRotate);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#0B2B46');

    const camera = new THREE.PerspectiveCamera(45, mount.clientWidth / mount.clientHeight, 0.1, 100);
    camera.position.set(3, 1.8, 3.6);
    camera.lookAt(0, 0.4, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: adapter.pixelRatio > 1 });
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

    let texture = createDirtTexture(adapter.dirtTextureSize, dirt);
    parts.forEach((part) => {
      const material = part.mesh.material as THREE.MeshStandardMaterial;
      material.map = texture;
      material.needsUpdate = true;
    });
    applyDirtToParts(parts, dirt);

    let raf = 0;
    let disposed = false;
    const render = () => {
      if (disposed) return;
      if (adapter.autoRotate) group.rotation.y += 0.006;
      renderer.render(scene, camera);
      raf = requestAnimationFrame(render);
    };
    render();

    const handleResize = () => {
      if (disposed) return;
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    const handlePointer = () => {
      if (adapter.autoRotate) group.rotation.y += 0.2;
    };
    renderer.domElement.addEventListener('pointerdown', handlePointer);

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('pointerdown', handlePointer);
      texture.dispose();
      parts.forEach((part) => {
        part.mesh.geometry.dispose();
        (part.mesh.material as THREE.Material).dispose();
      });
      renderer.dispose();
      if (renderer.domElement.parentElement === mount) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, []);

  useEffect(() => {
    onDirtChange?.(dirt);
  }, [dirt, onDirtChange]);

  return (
    <div className="viewer-wrap">
      <div ref={mountRef} className="viewer-canvas" aria-label="Mô hình 3D giày" role="img" />
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
      {!interactive && <p className="viewer-note">Chế độ tiết kiệm năng lượng: ảnh tĩnh.</p>}
      <style>{`
        .viewer-wrap { display: grid; gap: 0.75rem; }
        .viewer-canvas {
          border-radius: 0.75rem; overflow: hidden;
          width: 100%; height: 300px;
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
