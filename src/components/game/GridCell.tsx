import { useRef } from 'react';
import * as THREE from 'three';

interface GridCellProps {
  x: number;
  z: number;
  onClick: (x: number, z: number) => void;
  isHighlighted: boolean;
  isValidPlacement?: boolean;
}

export const GridCell = ({
  x,
  z,
  onClick,
  isHighlighted,
  isValidPlacement = true,
}: GridCellProps) => {
  const meshRef = useRef<THREE.Mesh>(null);

  return (
    <mesh
      ref={meshRef}
      position={[x * 2, 0, z * 2]}
      rotation={[-Math.PI / 2, 0, 0]}
      onClick={(e) => {
        e.stopPropagation();
        onClick(x, z);
      }}
      onPointerEnter={() => {
        if (meshRef.current) {
          (
            meshRef.current.material as THREE.MeshStandardMaterial
          ).emissive.setHex(0x222222);
        }
      }}
      onPointerLeave={() => {
        if (meshRef.current) {
          (
            meshRef.current.material as THREE.MeshStandardMaterial
          ).emissive.setHex(0x000000);
        }
      }}
    >
      <planeGeometry args={[1.8, 1.8]} />
      <meshStandardMaterial
        color={
          isHighlighted ? (isValidPlacement ? 0x33aa33 : 0xaa3333) : 0x666666
        }
        transparent
        opacity={0.8}
      />
    </mesh>
  );
};