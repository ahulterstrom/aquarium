import { useGridStore } from "@/stores/gridStore";
import { useGameStore } from "@/stores/gameStore";
import { useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

// Define wall style configurations
const WALL_STYLES = {
  concrete: { color: 0x666666 },
  glass: { color: 0x87ceeb, opacity: 0.7, transparent: true },
  brick: { color: 0x8b4513 },
  metal: { color: 0x808080, metalness: 0.8 },
  wood: { color: 0x654321 },
};

const WallSegment = ({ position, args, side, wallStyle }: { 
  position: [number, number, number]; 
  args: [number, number, number]; 
  side: string;
  wallStyle: string;
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
  
  const style = WALL_STYLES[wallStyle as keyof typeof WALL_STYLES] || WALL_STYLES.concrete;
  
  return (
    <mesh ref={meshRef} position={position} castShadow receiveShadow>
      <boxGeometry args={args} />
      <meshStandardMaterial 
        color={style.color} 
        transparent={style.transparent}
        opacity={style.opacity}
        metalness={style.metalness}
      />
    </mesh>
  );
};

export const Walls = () => {
  const cells = useGridStore.use.cells();
  const wallStyle = useGameStore.use.wallStyle();

  // Memoize wall segments to avoid recalculating on every render
  const wallSegments = useMemo(() => {
    const segments: Array<{ key: string; position: [number, number, number]; args: [number, number, number]; side: string }> = [];
    const wallHeight = 1;
    const wallThickness = 0.1;

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
              position = [x * 2, wallHeight / 2, (z - 0.5) * 2];
              args = [2, wallHeight, wallThickness];
              break;
            case "south":
              position = [x * 2, wallHeight / 2, (z + 0.5) * 2];
              args = [2, wallHeight, wallThickness];
              break;
            case "west":
              position = [(x - 0.5) * 2, wallHeight / 2, z * 2];
              args = [wallThickness, wallHeight, 2];
              break;
            case "east":
              position = [(x + 0.5) * 2, wallHeight / 2, z * 2];
              args = [wallThickness, wallHeight, 2];
              break;
            default:
              continue;
          }

          segments.push({
            key: wallKey,
            position,
            args,
            side: dir.side
          });
        }
      }
    }

    return segments;
  }, [cells]); // wallStyle is passed as prop to WallSegment, so no need to include it here

  return (
    <>
      {wallSegments.map(segment => (
        <WallSegment
          key={segment.key}
          position={segment.position}
          args={segment.args}
          side={segment.side}
          wallStyle={wallStyle}
        />
      ))}
    </>
  );
};
