import { useRef, useEffect } from "react";
import * as THREE from "three";

interface GridCellProps {
  x: number;
  y: number;
  z: number;
  registerRef: (x: number, y: number, z: number, ref: THREE.Mesh | null) => void;
}

export const GridCell = ({ x, y, z, registerRef }: GridCellProps) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  // Register the mesh ref with the parent Grid
  useEffect(() => {
    if (meshRef.current) {
      registerRef(x, y, z, meshRef.current);
    }
    
    // Cleanup on unmount
    return () => {
      registerRef(x, y, z, null);
    };
  }, [x, y, z, registerRef]);

  return (
    <mesh
      ref={meshRef}
      position={[x * 2, 0.1, z * 2]}
      rotation={[-Math.PI / 2, 0, 0]}
    >
      <planeGeometry args={[1.8, 1.8]} />
      <meshStandardMaterial
        color={0x666666}
        transparent
        opacity={0.8}
      />
    </mesh>
  );
};