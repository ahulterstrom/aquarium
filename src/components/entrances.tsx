import { useRef } from "react";
import * as THREE from "three";
import { useGameStore } from "../stores/gameStore";
import { useUIStore } from "../stores/uiStore";
import { Entrance } from "../types/game.types";
import { Arrow } from "./arrow";

const EntranceMesh = ({
  entrance,
  onClick,
  isSelected,
}: {
  entrance: Entrance;
  onClick: (entrance: Entrance) => void;
  isSelected: boolean;
}) => {
  const groupRef = useRef<THREE.Group>(null);

  // Calculate position offset and rotation based on edge
  const getPositionAndRotation = () => {
    const baseX = entrance.position.x * 2;
    const baseZ = entrance.position.z * 2;
    let offsetX = 0;
    let offsetZ = 0;
    let rotationY = 0;

    switch (entrance.edge) {
      case "north": // Top edge, door faces south
        offsetZ = -1; // Move to north edge of tile
        rotationY = 0;
        break;
      case "south": // Bottom edge, door faces north
        offsetZ = 1; // Move to south edge of tile
        rotationY = -Math.PI;
        break;
      case "east": // Right edge, door faces west
        offsetX = 1; // Move to east edge of tile
        rotationY = -Math.PI / 2;
        break;
      case "west": // Left edge, door faces east
        offsetX = -1; // Move to west edge of tile
        rotationY = Math.PI / 2;
        break;
    }

    return {
      position: [baseX + offsetX, 0, baseZ + offsetZ] as [
        number,
        number,
        number,
      ],
      rotation: [0, rotationY, 0] as [number, number, number],
    };
  };

  const { position, rotation } = getPositionAndRotation();

  return (
    <group
      ref={groupRef}
      position={position}
      rotation={rotation}
      onClick={(e) => {
        e.stopPropagation();
        onClick(entrance);
      }}
      onPointerEnter={(e) => {
        e.stopPropagation();
        document.body.style.cursor = "pointer";
      }}
      onPointerLeave={() => {
        document.body.style.cursor = "default";
      }}
    >
      {/* Door frame */}
      <mesh position={[0, 1.5, 0]}>
        <boxGeometry args={[2, 3, 0.3]} />
        <meshLambertMaterial color={0x8b4513} />
      </mesh>

      {/* Left door panel */}
      <mesh position={[-0.5, 1.25, 0.05]}>
        <boxGeometry args={[0.9, 2.5, 0.15]} />
        <meshLambertMaterial color={0x654321} />
      </mesh>

      {/* Right door panel */}
      <mesh position={[0.5, 1.25, 0.05]}>
        <boxGeometry args={[0.9, 2.5, 0.15]} />
        <meshLambertMaterial color={0x654321} />
      </mesh>

      {/* Left handle */}
      <mesh position={[-0.2, 1.25, 0.2]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.05, 0.05, 0.2]} />
        <meshLambertMaterial color={0xffd700} />
      </mesh>

      {/* Right handle */}
      <mesh position={[0.2, 1.25, 0.2]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.05, 0.05, 0.2]} />
        <meshLambertMaterial color={0xffd700} />
      </mesh>

      {/* Welcome sign (if main entrance) */}
      {entrance.isMainEntrance && (
        <>
          <mesh position={[0, 3.2, 0.1]}>
            <boxGeometry args={[1.5, 0.4, 0.1]} />
            <meshLambertMaterial color={0x4169e1} />
          </mesh>
          <mesh position={[0, 3.2, 0.16]}>
            <boxGeometry args={[1.2, 0.2, 0.02]} />
            <meshLambertMaterial color={0xffffff} />
          </mesh>
        </>
      )}

      {/* Selection Arrow */}
      {isSelected && <Arrow position={[0, 1.5, 0]} />}
    </group>
  );
};

export const Entrances = () => {
  const selectEntrance = useUIStore.use.selectEntrance();
  const selectedEntranceId = useUIStore.use.selectedEntranceId();
  const entrances = useGameStore.use.entrances();

  const handleEntranceClick = (entrance: Entrance) => {
    selectEntrance(entrance.id);
  };

  return (
    <>
      {Array.from(entrances.values()).map((entrance) => (
        <EntranceMesh
          key={entrance.id}
          entrance={entrance}
          onClick={handleEntranceClick}
          isSelected={selectedEntranceId === entrance.id}
        />
      ))}
    </>
  );
};
