import {
  PerspectiveCamera,
  MapControls,
  OrthographicCamera,
  Stars,
} from "@react-three/drei";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { useGameStore } from "../stores/gameStore";
import { useGridStore } from "../stores/gridStore";
import { useUIStore } from "../stores/uiStore";
import { Tank as TankType } from "../types/game.types";
import { GameSystems } from "../components/systems/GameSystems";
import { OrthoStars } from "@/components/orthoStars";

const GridCell = ({
  x,
  z,
  onClick,
  isHighlighted,
}: {
  x: number;
  z: number;
  onClick: (x: number, z: number) => void;
  isHighlighted: boolean;
}) => {
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
        color={isHighlighted ? 0x33aa33 : 0x666666}
        transparent
        opacity={0.8}
      />
    </mesh>
  );
};

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

export const SandboxScene = () => {
  const [hoveredCell, setHoveredCell] = useState<{
    x: number;
    z: number;
  } | null>(null);

  const { tanks, addTank, spendMoney } = useGameStore();
  const { initializeGrid, canPlaceAt, placeObject } = useGridStore();
  const { placementMode, selectedTankId, selectTank, setPlacementMode } =
    useUIStore();

  const TANK_COST = 6;

  useEffect(() => {
    initializeGrid(3, 1, 3);
  }, [initializeGrid]);

  const handleCellClick = (x: number, z: number) => {
    if (placementMode === "tank") {
      if (canPlaceAt({ x, y: 0, z }, 1, 1)) {
        if (spendMoney(TANK_COST)) {
          const tankId = `tank_${Date.now()}`;
          const newTank: TankType = {
            id: tankId,
            position: { x, y: 0, z },
            size: "medium",
            waterQuality: 1,
            temperature: 25,
            capacity: 5,
            fishIds: [],
            decorations: [],
            maintenanceLevel: 1,
          };

          addTank(newTank);
          placeObject({ x, y: 0, z }, 1, 1, "tank", tankId);
          setPlacementMode("none");
        }
      }
    } else {
      // Clear tank selection when clicking on empty space
      selectTank(null);
    }
  };

  const handleTankClick = (tank: TankType) => {
    selectTank(tank.id);
  };

  const renderGrid = () => {
    const cells = [];
    for (let x = 0; x < 3; x++) {
      for (let z = 0; z < 3; z++) {
        const isHighlighted =
          hoveredCell?.x === x &&
          hoveredCell?.z === z &&
          placementMode === "tank";
        cells.push(
          <GridCell
            key={`${x}-${z}`}
            x={x}
            z={z}
            onClick={handleCellClick}
            isHighlighted={isHighlighted}
          />,
        );
      }
    }
    return cells;
  };

  return (
    <>
      {/* Game tick system */}
      <GameSystems />

      <OrthographicCamera
        makeDefault
        position={[10, 10, 10]}
        zoom={50}
        near={0.1}
        far={1000}
      />

      {/* <OrthoStars layers={3} count={1000} area={[20, 20]} /> */}
      {/* <OrbitControls
        target={[2, 0, 2]}
        maxPolarAngle={Math.PI / 2.2}
        minDistance={5}
        maxDistance={15}
      /> */}
      <MapControls makeDefault enableZoom={false} />

      {/* Lighting */}
      <ambientLight intensity={0.6} />
      <directionalLight
        position={[10, 10, 5]}
        intensity={0.8}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />

      {/* Ground */}
      <mesh
        position={[2, -0.01, 2]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
        onClick={(e) => {
          e.stopPropagation();
          if (placementMode !== "tank") {
            selectTank(null);
          }
        }}
      >
        <planeGeometry args={[8, 8]} />
        <meshStandardMaterial color={0x8b4513} />
      </mesh>

      {/* Grid */}
      {placementMode === "tank" && (
        <group
          onPointerMove={(e) => {
            if (placementMode === "tank") {
              const point = e.point;
              const gridX = Math.floor((point.x + 1) / 2);
              const gridZ = Math.floor((point.z + 1) / 2);
              if (gridX >= 0 && gridX < 3 && gridZ >= 0 && gridZ < 3) {
                setHoveredCell({ x: gridX, z: gridZ });
              }
            }
          }}
          onPointerLeave={() => setHoveredCell(null)}
        >
          {renderGrid()}
        </group>
      )}

      {/* Tanks */}
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
