import * as THREE from 'three';

export type ViewerAdapter = {
  pixelRatio: number;
  autoRotate: boolean;
  segments: number;
  dirtTextureSize: number;
};

export function resolveAdapter(env: {
  reducedMotion?: boolean;
  hardwareConcurrency?: number;
  coarsePointer?: boolean;
  pixelRatio?: number;
}): ViewerAdapter {
  const lowPower = Boolean(
    env.reducedMotion || (env.hardwareConcurrency ?? 8) <= 4 || env.coarsePointer,
  );
  return {
    pixelRatio: Math.min(env.pixelRatio ?? 1, lowPower ? 1 : 2),
    autoRotate: !lowPower,
    segments: lowPower ? 8 : 24,
    dirtTextureSize: lowPower ? 128 : 512,
  };
}

export type DirtVisual = {
  color: THREE.Color;
  roughness: number;
  metalness: number;
};

export function dirtVisual(factor: number): DirtVisual {
  const clamped = Math.max(0, Math.min(1, factor));
  const clean = new THREE.Color('#F2EFE9');
  const dirty = new THREE.Color('#6B5A4A');
  return {
    color: clean.clone().lerp(dirty, clamped),
    roughness: 0.55 + clamped * 0.4,
    metalness: 0.05 + clamped * 0.1,
  };
}

export function createDirtTexture(
  size: number,
  factor: number,
  canvas: HTMLCanvasElement = document.createElement('canvas'),
): THREE.CanvasTexture {
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);
  ctx.clearRect(0, 0, size, size);
  if (factor > 0) {
    const spots = Math.round(factor * 180);
    ctx.fillStyle = 'rgba(60, 45, 30, 1)';
    for (let i = 0; i < spots; i++) {
      const x = Math.random() * size;
      const y = Math.random() * size;
      const r = 1 + Math.random() * (factor * 14);
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  return new THREE.CanvasTexture(canvas);
}

export type ShoePart = {
  mesh: THREE.Mesh;
  baseColor: THREE.Color;
  baseRoughness: number;
};

export function buildProceduralShoe(segments: number): ShoePart[] {
  const shoeMaterial = new THREE.MeshStandardMaterial({
    color: '#F2EFE9',
    roughness: 0.55,
    metalness: 0.05,
  });

  const meshes: THREE.Mesh[] = [];

  const body = new THREE.Mesh(
    new THREE.BoxGeometry(1.1, 0.5, 2.6, segments, segments, segments),
    shoeMaterial,
  );
  body.position.y = 0.55;
  meshes.push(body);

  const toe = new THREE.Mesh(
    new THREE.SphereGeometry(0.45, segments, segments),
    shoeMaterial.clone(),
  );
  toe.position.set(0, 0.5, 1.35);
  toe.scale.set(1.05, 0.85, 0.95);
  meshes.push(toe);

  const sole = new THREE.Mesh(
    new THREE.BoxGeometry(1.2, 0.22, 2.8, segments, 1, segments),
    shoeMaterial.clone(),
  );
  sole.position.y = 0.11;
  meshes.push(sole);

  const collar = new THREE.Mesh(
    new THREE.CylinderGeometry(0.5, 0.52, 0.42, segments, 1),
    shoeMaterial.clone(),
  );
  collar.rotation.x = Math.PI / 2;
  collar.position.set(0, 0.72, -1.15);
  meshes.push(collar);

  const laceCount = 5;
  for (let i = 0; i < laceCount; i++) {
    const lace = new THREE.Mesh(
      new THREE.BoxGeometry(0.08, 0.08, 0.5),
      shoeMaterial.clone(),
    );
    lace.position.set(0, 0.82, 0.15 + i * 0.22);
    meshes.push(lace);
  }

  return meshes.map((mesh) => ({
    mesh,
    baseColor: new THREE.Color('#F2EFE9'),
    baseRoughness: 0.55,
  }));
}

export function applyDirtToParts(parts: ShoePart[], factor: number): void {
  const visual = dirtVisual(factor);
  parts.forEach((part) => {
    const material = part.mesh.material as THREE.MeshStandardMaterial;
    material.color.copy(visual.color);
    material.roughness = visual.roughness;
    material.metalness = visual.metalness;
  });
}
