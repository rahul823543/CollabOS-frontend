import { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`;

// Industrial workshop atmosphere shader — cineshader inspired
const fragmentShader = `
  precision highp float;
  varying vec2 vUv;
  uniform float uTime;
  uniform vec2 uMouse;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash(i), hash(i + vec2(1,0)), f.x),
      mix(hash(i + vec2(0,1)), hash(i + vec2(1,1)), f.x),
      f.y
    );
  }

  float fbm(vec2 p) {
    float v = 0.0, a = 0.5;
    for (int i = 0; i < 5; i++) {
      v += a * noise(p);
      p = p * 2.0 + vec2(0.3, 0.7);
      a *= 0.5;
    }
    return v;
  }

  // Smooth horizontal lines — corrugated walls
  float wallLines(vec2 uv, float time) {
    float lines = 0.0;
    float y = uv.y * 40.0;
    lines += smoothstep(0.45, 0.5, fract(y)) * smoothstep(0.55, 0.5, fract(y));
    lines *= 0.15;
    // Only on the edges
    float edgeMask = smoothstep(0.3, 0.0, uv.x) + smoothstep(0.7, 1.0, uv.x);
    return lines * edgeMask * 0.5;
  }

  // Volumetric light cone from center-top
  float volumetricLight(vec2 uv, float time) {
    // Light source at center-top, slightly affected by mouse
    vec2 lightPos = vec2(0.5 + uMouse.x * 0.05, 0.95);
    vec2 delta = uv - lightPos;
    
    // Cone shape — wider at bottom
    float coneWidth = 0.3 + (1.0 - uv.y) * 0.4;
    float inCone = smoothstep(coneWidth, coneWidth * 0.3, abs(delta.x));
    
    // Fade from top to bottom
    float depthFade = smoothstep(0.0, 0.95, uv.y) * 0.8;
    
    // Add noise for volumetric feel
    float fog = fbm(uv * 3.0 + vec2(time * 0.02, time * 0.01));
    float fog2 = fbm(uv * 5.0 - vec2(time * 0.015, time * 0.02));
    float volumetric = inCone * depthFade * (0.6 + fog * 0.4) * (0.7 + fog2 * 0.3);
    
    return volumetric * 0.18;
  }

  // Reflective floor
  float floorReflection(vec2 uv) {
    if (uv.y > 0.25) return 0.0;
    float reflectStrength = (0.25 - uv.y) / 0.25;
    reflectStrength = pow(reflectStrength, 1.5);
    
    // Mirror the volumetric light on the floor
    vec2 mirrorUv = vec2(uv.x, 0.5 - uv.y);
    float coneWidth = 0.3 + (1.0 - mirrorUv.y) * 0.3;
    float inCone = smoothstep(coneWidth, coneWidth * 0.3, abs(mirrorUv.x - 0.5));
    
    return inCone * reflectStrength * 0.08;
  }

  // Subtle floating dust
  float dustParticles(vec2 uv, float time) {
    float dust = 0.0;
    for (int i = 0; i < 4; i++) {
      vec2 p = uv * (2.0 + float(i) * 1.5);
      p.y += time * (0.01 + float(i) * 0.005);
      p.x += sin(time * 0.1 + float(i) * 1.7) * 0.2;
      float d = noise(p);
      d = smoothstep(0.72, 0.76, d);
      dust += d * 0.04;
    }
    return dust;
  }

  void main() {
    vec2 uv = vUv;
    float time = uTime;

    // === DEEP DARK BASE — industrial charcoal ===
    vec3 darkBase = vec3(0.03, 0.035, 0.04);    // #0A090A
    vec3 wallColor = vec3(0.06, 0.075, 0.09);   // #1B2128 desaturated blue-grey
    
    // Gradient: darker at edges, slightly lighter in center
    float centerDist = length((uv - vec2(0.5, 0.5)) * vec2(1.4, 1.0));
    vec3 base = mix(wallColor, darkBase, smoothstep(0.0, 0.8, centerDist));

    // === WALL TEXTURE (subtle corrugated lines on sides) ===
    float walls = wallLines(uv, time);
    base += vec3(0.04, 0.05, 0.055) * walls;

    // === VOLUMETRIC LIGHT CONE ===
    float vol = volumetricLight(uv, time);
    vec3 lightColor = vec3(0.18, 0.72, 0.82); // Electric teal #2FB9D4
    base += lightColor * vol;

    // === AMBIENT TEAL FOG ===
    float fog = fbm(uv * 2.0 + time * 0.015);
    float fog2 = fbm(uv * 3.5 - time * 0.01);
    float fogMask = fog * fog2;
    vec3 fogColor = vec3(0.08, 0.14, 0.16); // Desaturated teal
    base += fogColor * fogMask * 0.25;

    // === FLOOR REFLECTION ===
    float reflection = floorReflection(uv);
    base += lightColor * reflection;

    // === FLOATING DUST ===
    float dust = dustParticles(uv, time);
    base += vec3(0.2, 0.5, 0.55) * dust;

    // === AMBIENT EDGE LIGHT (subtle rim on walls) ===
    float leftEdge = smoothstep(0.15, 0.0, uv.x) * 0.03;
    float rightEdge = smoothstep(0.85, 1.0, uv.x) * 0.02;
    base += vec3(0.1, 0.2, 0.22) * (leftEdge + rightEdge);

    // === VIGNETTE ===
    float vig = 1.0 - centerDist * 0.9;
    base *= clamp(vig, 0.0, 1.0);

    // === SUBTLE FILM GRAIN ===
    float grain = hash(uv * 500.0 + time) * 0.015;
    base += grain;

    gl_FragColor = vec4(base, 1.0);
  }
`;

export default function CineshaderBackground() {
  const meshRef = useRef();

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uMouse: { value: new THREE.Vector2(0, 0) },
  }), []);

  useFrame((state) => {
    if (!meshRef.current) return;
    meshRef.current.material.uniforms.uTime.value = state.clock.elapsedTime;
    meshRef.current.material.uniforms.uMouse.value.set(state.mouse.x, state.mouse.y);
  });

  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        depthWrite={false}
        depthTest={false}
      />
    </mesh>
  );
}
