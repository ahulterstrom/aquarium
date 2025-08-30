import { useMemo } from "react";
import * as THREE from "three";
import { useFloorStyle } from "./FloorTextureProvider";
import { FloorStyle } from "../../lib/constants/floors";

interface GroundTileProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
  floorStyleId: string;
  size?: [number, number]; // [width, height] for custom tile sizes
}

export const GroundTile = ({
  position,
  rotation,
  floorStyleId,
  size = [2, 2],
}: GroundTileProps) => {
  const { textures, style, isLoading, error } = useFloorStyle(floorStyleId);

  // Create geometry with UV2 for ambient occlusion
  const geometry = useMemo(() => {
    const [width, height] = size;
    const geo = new THREE.PlaneGeometry(width, height, 1, 1);
    const uv = geo.getAttribute("uv");
    geo.setAttribute("uv2", new THREE.BufferAttribute(uv.array, 2));
    return geo;
  }, [size]);

  // Show loading state or error
  if (isLoading) {
    return (
      <group position={position} rotation={[-Math.PI / 2, 0, 0]}>
        <mesh geometry={geometry} receiveShadow>
          <meshStandardMaterial color={0x666666} opacity={0.5} transparent />
        </mesh>
      </group>
    );
  }

  if (error || !textures || !style) {
    return (
      <group position={position} rotation={[-Math.PI / 2, 0, 0]}>
        <mesh geometry={geometry} receiveShadow>
          <meshStandardMaterial color={0xff0000} opacity={0.3} transparent />
        </mesh>
      </group>
    );
  }

  return (
    <group position={position} rotation={[-Math.PI / 2, 0, 0]}>
      <mesh geometry={geometry} rotation={rotation} receiveShadow>
        <meshToonMaterial
          map={textures.baseColor}
          // normalMap={textures.normal}
          // aoMap={textures.aorm}
          // roughnessMap={textures.aorm}
          // metalnessMap={textures.aorm}
          // // Apply material properties from floor style
          // roughness={style.material.roughness}
          // metalness={style.material.metalness}
          // color={0xffffff} // White multiplier to preserve texture colors
        />
      </mesh>
    </group>
  );
};
