import { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

// Soft glowing dot texture
function createDotTexture() {
  const size = 64;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  const center = size / 2;
  const radius = size / 2 - 1;

  const gradient = ctx.createRadialGradient(center, center, 0, center, center, radius);
  gradient.addColorStop(0, 'rgba(255,255,255,1)');
  gradient.addColorStop(0.15, 'rgba(255,255,255,0.8)');
  gradient.addColorStop(0.4, 'rgba(255,255,255,0.25)');
  gradient.addColorStop(0.7, 'rgba(255,255,255,0.05)');
  gradient.addColorStop(1, 'rgba(255,255,255,0)');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  return new THREE.CanvasTexture(canvas);
}

export default function AntigravityParticles({ count = 3000 }) {
  const pointsRef = useRef();
  const { viewport } = useThree();
  const dotTexture = useMemo(() => createDotTexture(), []);

  const mouseCurrent = useRef(new THREE.Vector2(0, 0));
  const mouseTarget = useRef(new THREE.Vector2(0, 0));
  const prevMouse = useRef(new THREE.Vector2(0, 0));

  const particleData = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 2);
    const homePositions = new Float32Array(count * 2);

    const palette = [
      new THREE.Color('#2dd4bf'),
      new THREE.Color('#22d3ee'),
      new THREE.Color('#38bdf8'),
      new THREE.Color('#818cf8'),
      new THREE.Color('#a78bfa'),
      new THREE.Color('#6ee7b7'),
      new THREE.Color('#5eead4'),
      new THREE.Color('#67e8f9'),
      new THREE.Color('#c4b5fd'),
      new THREE.Color('#99f6e4'),
    ];

    for (let i = 0; i < count; i++) {
      // Fill the entire viewport uniformly
      const x = (Math.random() - 0.5) * 20;
      const y = (Math.random() - 0.5) * 14;
      const z = (Math.random() - 0.5) * 4 - 1;

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      homePositions[i * 2] = x;
      homePositions[i * 2 + 1] = y;

      velocities[i * 2] = 0;
      velocities[i * 2 + 1] = 0;

      const c = palette[Math.floor(Math.random() * palette.length)].clone();
      const brightness = 0.5 + Math.random() * 0.5;
      colors[i * 3] = c.r * brightness;
      colors[i * 3 + 1] = c.g * brightness;
      colors[i * 3 + 2] = c.b * brightness;
    }

    return { positions, colors, velocities, homePositions };
  }, [count]);

  useFrame((state) => {
    if (!pointsRef.current) return;

    const pos = pointsRef.current.geometry.attributes.position.array;
    const { velocities, homePositions } = particleData;

    mouseTarget.current.set(
      state.mouse.x * viewport.width / 2,
      state.mouse.y * viewport.height / 2
    );
    mouseCurrent.current.lerp(mouseTarget.current, 0.06);

    const mvx = mouseCurrent.current.x - prevMouse.current.x;
    const mvy = mouseCurrent.current.y - prevMouse.current.y;
    prevMouse.current.copy(mouseCurrent.current);

    const mx = mouseCurrent.current.x;
    const my = mouseCurrent.current.y;
    const mouseSpeed = Math.sqrt(mvx * mvx + mvy * mvy);
    const time = state.clock.elapsedTime;

    for (let i = 0; i < count; i++) {
      const ix = i * 3;
      const iy = i * 3 + 1;
      const ivx = i * 2;
      const ivy = i * 2 + 1;

      const px = pos[ix];
      const py = pos[iy];
      const dx = px - mx;
      const dy = py - my;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Mouse repulsion — fluid-like push
      const radius = 1.8 + mouseSpeed * 4;
      if (dist < radius && dist > 0.01) {
        const force = (1 - dist / radius) * (0.08 + mouseSpeed * 0.5);
        const angle = Math.atan2(dy, dx);
        velocities[ivx] += Math.cos(angle) * force * 0.06;
        velocities[ivy] += Math.sin(angle) * force * 0.06;
      }

      // Gentle ambient drift
      const driftX = Math.sin(time * 0.15 + i * 0.01) * 0.0003;
      const driftY = Math.cos(time * 0.12 + i * 0.008) * 0.0003;
      velocities[ivx] += driftX;
      velocities[ivy] += driftY;

      // Spring back to home
      velocities[ivx] += (homePositions[ivx] - px) * 0.002;
      velocities[ivy] += (homePositions[ivy] - py) * 0.002;

      // Fluid friction
      velocities[ivx] *= 0.97;
      velocities[ivy] *= 0.97;

      pos[ix] += velocities[ivx];
      pos[iy] += velocities[ivy];
    }

    pointsRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={particleData.positions} itemSize={3} />
        <bufferAttribute attach="attributes-color" count={count} array={particleData.colors} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial
        map={dotTexture}
        size={0.08}
        vertexColors
        transparent
        opacity={0.75}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
