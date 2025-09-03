import { useRef } from "react";
import * as THREE from "three";
import { useGameStore } from "../stores/gameStore";
import { useUIStore } from "../stores/uiStore";
import { Tank as TankType } from "../types/game.types";
import { TankMedium, TankLarge, TankHuge } from "./tankModels";
import { Arrow } from "./arrow";
import {
  getTankModelRotation,
  getRotatedDimensions,
  getIsPlacing,
} from "../lib/utils/placement";

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

  // Calculate position offset for multi-cell tanks
  const getPosition = (): [number, number, number] => {
    const baseX = tank.position.x * 2;
    const baseZ = tank.position.z * 2;

    // Handle legacy tanks that don't have grid dimensions
    const gridWidth = tank.gridWidth || 1;
    const gridDepth = tank.gridDepth || 1;

    // Get rotated dimensions for proper positioning
    const { width: rotatedWidth, depth: rotatedDepth } = getRotatedDimensions(
      gridWidth,
      gridDepth,
      tank.rotation || 0,
    );

    // Center the tank on all occupied grid cells using rotated dimensions
    const offsetX = rotatedWidth > 1 ? rotatedWidth - 1 : 0;
    const offsetZ = rotatedDepth > 1 ? rotatedDepth - 1 : 0;

    return [baseX + offsetX, 0, baseZ + offsetZ];
  };

  // Select the appropriate tank component based on size
  const TankComponent = {
    medium: TankMedium,
    large: TankLarge,
    huge: TankHuge,
  }[tank.size];

  if (!TankComponent) {
    console.error(`Unknown tank size: ${tank.size}`);
    return null;
  }

  return (
    <group
      ref={groupRef}
      position={getPosition()}
      rotation={[0, getTankModelRotation(tank.rotation || 0), 0]}
      onClick={(e) => {
        if (getIsPlacing()) {
          return;
        }
        e.stopPropagation();
        console.log("Tank clicked:", tank.id);
        onClick(tank);
      }}
      onPointerEnter={(e) => {
        if (getIsPlacing()) {
          return;
        }
        e.stopPropagation();
        document.body.style.cursor = "pointer";
      }}
      onPointerLeave={() => {
        if (getIsPlacing()) {
          return;
        }
        document.body.style.cursor = "default";
      }}
    >
      <TankComponent />

      {/* Selection Highlight */}
      {isSelected && <Arrow />}
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
