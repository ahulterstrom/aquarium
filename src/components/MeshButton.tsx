import React, { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import * as THREE from "three";

interface MeshButtonProps {
  // Basic geometry props
  width?: number;
  height?: number;
  color?: string;
  hoverColor?: string;

  // For customizing hover scale
  hoverScale?: number;

  // For positioning in the scene
  position?: [x: number, y: number, z: number];
  rotation?: [x: number, y: number, z: number];

  // Callback events
  onClick?: (e: THREE.Event) => void;
  onPointerOver?: (e: THREE.Event) => void;
  onPointerOut?: (e: THREE.Event) => void;

  // Optional text label
  label?: string;
  fontSize?: number;
  textColor?: string;
}

/**
 * A reusable clickable 3D "button" mesh with an optional text label.
 */
export const MeshButton: React.FC<MeshButtonProps> = ({
  width = 1,
  height = 0.5,
  color = "hotpink",
  hoverColor = "orange",
  hoverScale = 1.1,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  onClick,
  onPointerOver,
  onPointerOut,
  label = "",
  fontSize = 0.1,
  textColor = "#000",
}) => {
  const meshRef = useRef<THREE.Mesh>(null!);
  const [isHovered, setIsHovered] = useState(false);

  // Optionally useFrame to do any animations (e.g., subtle rotations)
  useFrame(() => {
    // For example, you could animate your button
    // meshRef.current.rotation.y += 0.01;
  });

  return (
    <group position={position} rotation={rotation}>
      {/* The plane/box geometry that acts as the "button" */}
      <mesh
        ref={meshRef}
        scale={isHovered ? [hoverScale, hoverScale, 1] : [1, 1, 1]}
        onPointerOver={(e) => {
          setIsHovered(true);
          onPointerOver?.(e);
        }}
        onPointerOut={(e) => {
          setIsHovered(false);
          onPointerOut?.(e);
        }}
        onPointerDown={onClick}
      >
        <planeGeometry args={[width, height]} />
        <meshStandardMaterial
          color={isHovered ? hoverColor : color}
          transparent={true}
        />
      </mesh>

      {/* Optional text label in the center of the plane. 
          The Text component is from @react-three/drei. 
      */}
      {label && (
        <Text
          fontSize={fontSize}
          color={textColor}
          anchorX="center"
          anchorY="middle"
          position={[0, 0, 0.01]} // Slightly in front of the plane
        >
          {label}
        </Text>
      )}
    </group>
  );
};
