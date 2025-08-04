import * as THREE from "three";
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";

type OrthoStarsProps = {
  count?: number;
  layers?: number;
  twinkleSpeed?: number;
  maxSize?: number;
  minSize?: number;
  area?: [number, number]; // width, height
  color?: THREE.ColorRepresentation;
};

export function OrthoStars({
  count = 1000,
  layers = 3,
  twinkleSpeed = 2,
  minSize = 0.005,
  maxSize = 0.015,
  area = [2, 2],
  color = "white",
}: OrthoStarsProps) {
  const group = useRef<THREE.Group>(null);

  const starLayers = useMemo(() => {
    return Array.from({ length: layers }, (_, layerIndex) => {
      const stars = new Float32Array(count * 3);
      for (let i = 0; i < count; i++) {
        const x = (Math.random() - 0.5) * area[0];
        const y = (Math.random() - 0.5) * area[1];
        const z = -layerIndex * 0.001; // Very slight separation
        stars.set([x, y, z], i * 3);
      }
      return stars;
    });
  }, [count, layers, area]);

  const materials = useMemo(() => {
    return Array.from(
      { length: layers },
      () =>
        new THREE.PointsMaterial({
          color,
          size: maxSize,
          sizeAttenuation: false,
          transparent: true,
          depthWrite: false,
        }),
    );
  }, [layers, color, maxSize]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    materials.forEach((mat, i) => {
      const factor = 0.5 + 0.5 * Math.sin(t * twinkleSpeed + i);
      mat.size = THREE.MathUtils.lerp(minSize, maxSize, factor);
      mat.opacity = 0.5 + 0.5 * Math.sin(t * twinkleSpeed + i * 1.7);
    });
  });

  return (
    <group ref={group}>
      {starLayers.map((positions, i) => (
        <points key={i} material={materials[i]}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={positions.length / 3}
              array={positions}
              itemSize={3}
            />
          </bufferGeometry>
        </points>
      ))}
    </group>
  );
}
