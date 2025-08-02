import { PerspectiveCamera } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

export const CharacterSelectScene = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  const { viewport } = useThree();

  useFrame((_, unboundedDelta) => {
    const delta = Math.min(unboundedDelta, 0.1);

    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.5;
      meshRef.current.rotation.x += delta * 0.5;
    }
  });

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 20]} fov={50} />
      <mesh ref={meshRef} position={[-viewport.width / 4, 0, 0]}>
        <torusGeometry args={[2, 1, 16]} />
        <meshMatcapMaterial color="orange" />
      </mesh>
    </>
  );
};
