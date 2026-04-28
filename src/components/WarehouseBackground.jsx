import { useFrame, useThree } from '@react-three/fiber';
import { Environment } from '@react-three/drei';
import { useRef } from 'react';

export default function WarehouseBackground() {
  const { camera } = useThree();
  const mouse = useRef({ x: 0, y: 0 });

  useFrame((state) => {
    // Target camera rotation based on mouse coordinates
    const targetX = (state.mouse.x * Math.PI) / 12;
    const targetY = (state.mouse.y * Math.PI) / 12;

    // Smoothly interpolate current rotation to target rotation
    camera.rotation.y += (-targetX - camera.rotation.y) * 0.05;
    camera.rotation.x += (targetY - camera.rotation.x) * 0.05;
  });

  return (
    <>
      {/* 
        This provides a real 360-degree high-dynamic-range photo of a warehouse.
        Using background=true renders it behind everything else.
        blur=0.03 adds a slight depth-of-field blur. 
      */}
      <Environment preset="warehouse" background blur={0.03} />
      
      {/* Add some ambient lighting so the scene isn't completely dark if we add 3D objects later */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
    </>
  );
}
