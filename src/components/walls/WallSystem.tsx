import { useGridStore } from "@/stores/gridStore";
import { useGameStore } from "@/stores/gameStore";
import { useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useWallStyle } from "./WallTextureProvider";

const WallSegment = ({
  position,
  args,
  side,
  wallStyle,
  sharedMaterial,
}: {
  position: [number, number, number];
  args: [number, number, number];
  side: string;
  wallStyle: string;
  sharedMaterial: THREE.MeshStandardMaterial | null;
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const { camera } = useThree();
  const directionRef = useRef(new THREE.Vector3());

  // Check visibility in render loop without causing React rerenders
  useFrame(() => {
    if (!meshRef.current) return;

    camera.getWorldDirection(directionRef.current);
    let shouldRender = true;

    switch (side) {
      case "north":
        shouldRender = directionRef.current.z < 0;
        break;
      case "south":
        shouldRender = directionRef.current.z > 0;
        break;
      case "west":
        shouldRender = directionRef.current.x < 0;
        break;
      case "east":
        shouldRender = directionRef.current.x > 0;
        break;
    }

    meshRef.current.visible = shouldRender;
  });

  // Create geometry with UV2 for ambient occlusion
  const geometry = useMemo(() => {
    const geo = new THREE.BoxGeometry(...args);
    const uv = geo.getAttribute("uv");
    geo.setAttribute(
      "uv2",
      new THREE.BufferAttribute(uv.array as Float32Array, 2),
    );
    return geo;
  }, [args]);

  return (
    <mesh
      ref={meshRef}
      position={position}
      geometry={geometry}
      material={sharedMaterial || undefined}
      castShadow
      receiveShadow
    />
  );
};

export const WallSystem = () => {
  const cells = useGridStore.use.cells();
  const wallStyle = useGameStore.use.wallStyle();
  const { textures, style } = useWallStyle(wallStyle);

  // Create shared material for all wall segments
  const wallMaterial = useMemo(() => {
    if (!textures || !style) return null;

    const material = new THREE.MeshStandardMaterial({
      map: textures.baseColor,
      normalMap: textures.normal,
      aoMap: textures.aorm,
      roughnessMap: textures.aorm,
      metalnessMap: textures.aorm,
      roughness: style.material.roughness,
      metalness: style.material.metalness,
    });

    return material;
  }, [textures, style]);

  // Memoize wall segments to avoid recalculating on every render
  const wallSegments = useMemo(() => {
    const segments: Array<{
      key: string;
      position: [number, number, number];
      args: [number, number, number];
      side: string;
    }> = [];
    const wallHeight = 2; // Taller walls for better visibility
    const wallThickness = 0.1;
    const verticalOffset = 0.1;
    const horizontalOffset = 0.025;

    // For each ground cell, check if it needs walls on any of its 4 edges
    for (const cell of cells.values()) {
      if (cell.y !== 0) continue; // Only process ground level cells

      const { x, z } = cell;

      // Check each direction for neighboring cells
      const directions = [
        { dx: 0, dz: -1, side: "north" }, // North (-Z)
        { dx: 0, dz: 1, side: "south" }, // South (+Z)
        { dx: -1, dz: 0, side: "west" }, // West (-X)
        { dx: 1, dz: 0, side: "east" }, // East (+X)
      ];

      for (const dir of directions) {
        const neighborKey = `${x + dir.dx},0,${z + dir.dz}`;
        const hasNeighbor = cells.has(neighborKey);

        // If no neighbor cell, we need a wall
        if (!hasNeighbor) {
          const wallKey = `wall-${x}-${z}-${dir.side}`;

          // Calculate wall position and dimensions based on side
          let position: [number, number, number];
          let args: [number, number, number];

          switch (dir.side) {
            case "north":
              position = [
                x * 2,
                wallHeight / 2 + verticalOffset,
                (z - 0.5 + horizontalOffset) * 2,
              ];
              args = [2, wallHeight, wallThickness];
              break;
            case "south":
              position = [
                x * 2,
                wallHeight / 2 + verticalOffset,
                (z + 0.5 - horizontalOffset) * 2,
              ];
              args = [2, wallHeight, wallThickness];
              break;
            case "west":
              position = [
                (x - 0.5 + horizontalOffset) * 2,
                wallHeight / 2 + verticalOffset,
                z * 2,
              ];
              args = [wallThickness, wallHeight, 2];
              break;
            case "east":
              position = [
                (x + 0.5 - horizontalOffset) * 2,
                wallHeight / 2 + verticalOffset,
                z * 2,
              ];
              args = [wallThickness, wallHeight, 2];
              break;
            default:
              continue;
          }

          segments.push({
            key: wallKey,
            position,
            args,
            side: dir.side,
          });
        }
      }
    }

    return segments;
  }, [cells]);

  // If material isn't ready, don't render walls yet
  if (!wallMaterial) {
    return null;
  }

  return (
    <>
      {wallSegments.map((segment) => (
        <WallSegment
          key={segment.key}
          position={segment.position}
          args={segment.args}
          side={segment.side}
          wallStyle={wallStyle}
          sharedMaterial={wallMaterial}
        />
      ))}
    </>
  );
};
