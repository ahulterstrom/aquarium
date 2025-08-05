import { useRef } from "react";
import * as THREE from "three";
import { useGameStore } from "../stores/gameStore";
import { useUIStore } from "../stores/uiStore";
import { Tank as TankType } from "../types/game.types";

const TankMesh = ({
  tank,
  isSelected,
  onClick,
}: {
  tank: TankType;
  isSelected: boolean;
  onClick: (tank: TankType) => void;
}) => {
  const groupRef = useRef<THREE.Group>(null);

  const getDimensions = () => {
    switch (tank.size) {
      case "small":
        return [1.5, 1.2, 1.5];
      case "medium":
        return [1.8, 1.5, 1.8];
      case "large":
        return [2, 2, 2];
      default:
        return [1.5, 1.2, 1.5];
    }
  };

  const [width, height, depth] = getDimensions();

  return (
    <group
      ref={groupRef}
      position={[tank.position.x * 2, height / 2, tank.position.z * 2]}
      onClick={(e) => {
        e.stopPropagation();
        console.log("Tank clicked:", tank.id);
        onClick(tank);
      }}
      onPointerEnter={(e) => {
        e.stopPropagation();
        document.body.style.cursor = "pointer";
      }}
      onPointerLeave={() => {
        document.body.style.cursor = "default";
      }}
    >
      {/* Glass */}
      <mesh>
        <boxGeometry args={[width, height, depth]} />
        <meshPhysicalMaterial
          color={0xffffff}
          metalness={0}
          roughness={0}
          transmission={0.95}
          thickness={0.1}
          transparent
          opacity={0.3}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Water */}
      <mesh position={[0, -0.1, 0]}>
        <boxGeometry args={[width - 0.1, height - 0.2, depth - 0.1]} />
        <meshPhysicalMaterial
          color={0x006994}
          metalness={0}
          roughness={0.1}
          transmission={0.9}
          thickness={1}
          transparent
          opacity={0.7}
        />
      </mesh>

      {/* Selection Highlight */}
      {isSelected && (
        <mesh position={[0, -0.5, 0]}>
          <ringGeometry args={[width * 0.7, width * 0.8, 16]} />
          <meshBasicMaterial
            color={0x00ff00}
            transparent
            opacity={0.8}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}
    </group>
  );
};

export const Tanks = () => {
  const tanks = useGameStore.use.tanks();

  const selectedTankId = useUIStore.use.selectedTankId();
  const selectTank = useUIStore.use.selectTank();

  const handleTankClick = (tank: TankType) => {
    selectTank(tank.id);
  };

  return (
    <>
      {Array.from(tanks.values()).map((tank) => (
        <TankMesh
          key={tank.id}
          tank={tank}
          isSelected={selectedTankId === tank.id}
          onClick={handleTankClick}
        />
      ))}
    </>
  );
};
