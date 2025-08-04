import { ENTRANCE_COST, TANK_COST } from "@/lib/constants";
import { MapControls, OrthographicCamera } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GameSystems } from "../components/systems/GameSystems";
import { useGameStore } from "../stores/gameStore";
import { useGridStore } from "../stores/gridStore";
import { useUIStore } from "../stores/uiStore";
import { Entrance, Tank as TankType, Visitor } from "../types/game.types";

const GridCell = ({
  x,
  z,
  onClick,
  isHighlighted,
  isValidPlacement = true,
}: {
  x: number;
  z: number;
  onClick: (x: number, z: number) => void;
  isHighlighted: boolean;
  isValidPlacement?: boolean;
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
        color={
          isHighlighted ? (isValidPlacement ? 0x33aa33 : 0xaa3333) : 0x666666
        }
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

const EntranceMesh = ({
  entrance,
  onClick,
}: {
  entrance: Entrance;
  onClick: (entrance: Entrance) => void;
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
        rotationY = Math.PI;
        break;
      case "east": // Right edge, door faces west
        offsetX = 1; // Move to east edge of tile
        rotationY = Math.PI / 2;
        break;
      case "west": // Left edge, door faces east
        offsetX = -1; // Move to west edge of tile
        rotationY = -Math.PI / 2;
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
        <boxGeometry args={[2, 3, 0.2]} />
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
    </group>
  );
};

const VisitorMesh = ({
  visitor,
  onClick,
}: {
  visitor: Visitor;
  onClick: (visitor: Visitor) => void;
}) => {
  const meshRef = useRef<THREE.Mesh>(null);

  // Get color based on visitor state
  const getVisitorColor = () => {
    switch (visitor.state) {
      case "entering":
        return 0x00ff00; // Green - just arrived
      case "exploring":
        return 0xffff00; // Yellow - looking around
      case "viewing":
        return 0x0000ff; // Blue - engaged with content
      case "satisfied":
        return 0xff8000; // Orange - happy, ready to leave
      case "leaving":
        return 0xff0000; // Red - leaving
      default:
        return 0x888888; // Gray - default
    }
  };

  // Add gentle bobbing animation
  useFrame((state) => {
    if (meshRef.current) {
      const time = state.clock.getElapsedTime();
      meshRef.current.position.y =
        visitor.position.y + Math.sin(time * 2 + visitor.position.x) * 0.1;
    }
  });

  return (
    <mesh
      ref={meshRef}
      position={[visitor.position.x, visitor.position.y, visitor.position.z]}
      onClick={(e) => {
        e.stopPropagation();
        onClick(visitor);
      }}
      onPointerEnter={(e) => {
        e.stopPropagation();
        document.body.style.cursor = "pointer";
      }}
      onPointerLeave={() => {
        document.body.style.cursor = "default";
      }}
    >
      <boxGeometry args={[0.3, 0.6, 0.3]} />
      <meshLambertMaterial color={getVisitorColor()} />

      {/* Add a simple "head" indicator */}
      <mesh position={[0, 0.4, 0]}>
        <sphereGeometry args={[0.12, 8, 8]} />
        <meshLambertMaterial color={0xfdbcb4} />
      </mesh>

      {/* State indicator (small floating orb) */}
      <mesh position={[0, 0.8, 0]}>
        <sphereGeometry args={[0.05, 6, 6]} />
        <meshBasicMaterial
          color={getVisitorColor()}
          transparent
          opacity={0.7}
        />
      </mesh>
    </mesh>
  );
};

export const SandboxScene = () => {
  const [hoveredCell, setHoveredCell] = useState<{
    x: number;
    z: number;
  } | null>(null);

  const { tanks, entrances, visitors, addTank, addEntrance, spendMoney } =
    useGameStore();
  const {
    initializeGrid,
    canPlaceAt,
    canPlaceEntranceAt,
    placeObject,
    getEdgeForPosition,
  } = useGridStore();
  const { placementMode, selectedTankId, selectTank, setPlacementMode } =
    useUIStore();

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
    } else if (placementMode === "entrance") {
      if (canPlaceEntranceAt({ x, y: 0, z })) {
        if (spendMoney(ENTRANCE_COST)) {
          const entranceId = `entrance_${Date.now()}`;
          const edge = getEdgeForPosition({ x, y: 0, z });
          const newEntrance: Entrance = {
            id: entranceId,
            position: { x, y: 0, z },
            isMainEntrance: entrances.size === 0, // First entrance is main entrance
            edge: edge || "north", // Fallback to north if edge detection fails
          };

          addEntrance(newEntrance);
          placeObject({ x, y: 0, z }, 1, 1, "entrance", entranceId);
          setPlacementMode("none");
        }
      } else {
        // Invalid placement - entrance must be on perimeter
        console.log("Entrance can only be placed on the edge of the map");
      }
    } else {
      // Clear tank selection when clicking on empty space
      selectTank(null);
    }
  };

  const handleTankClick = (tank: TankType) => {
    selectTank(tank.id);
  };

  const handleEntranceClick = (entrance: Entrance) => {
    // For now, just log the entrance click
    console.log("Entrance clicked:", entrance.id);
  };

  const handleVisitorClick = (visitor: Visitor) => {
    console.log(`Visitor ${visitor.id} clicked:`, {
      state: visitor.state,
      satisfaction: `${visitor.satisfaction}/${visitor.maxSatisfaction}`,
      interests: visitor.interests,
      tanksVisited: visitor.tanksVisited.length,
    });
  };

  const renderGrid = () => {
    const cells = [];
    for (let x = 0; x < 3; x++) {
      for (let z = 0; z < 3; z++) {
        const isHighlighted =
          hoveredCell?.x === x &&
          hoveredCell?.z === z &&
          (placementMode === "tank" || placementMode === "entrance");

        // Check if this is a valid placement position
        let isValidPlacement = true;
        if (isHighlighted) {
          if (placementMode === "tank") {
            isValidPlacement = canPlaceAt({ x, y: 0, z }, 1, 1);
          } else if (placementMode === "entrance") {
            isValidPlacement = canPlaceEntranceAt({ x, y: 0, z });
          }
        }

        cells.push(
          <GridCell
            key={`${x}-${z}`}
            x={x}
            z={z}
            onClick={handleCellClick}
            isHighlighted={isHighlighted}
            isValidPlacement={isValidPlacement}
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
          if (placementMode !== "tank" && placementMode !== "entrance") {
            selectTank(null);
          }
        }}
      >
        <planeGeometry args={[8, 8]} />
        <meshStandardMaterial color={0x8b4513} />
      </mesh>

      {/* Grid */}
      {(placementMode === "tank" || placementMode === "entrance") && (
        <group
          onPointerMove={(e) => {
            if (placementMode === "tank" || placementMode === "entrance") {
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

      {/* Entrances */}
      {Array.from(entrances.values()).map((entrance) => (
        <EntranceMesh
          key={entrance.id}
          entrance={entrance}
          onClick={handleEntranceClick}
        />
      ))}

      {/* Visitors */}
      {Array.from(visitors.values()).map((visitor) => (
        <VisitorMesh
          key={visitor.id}
          visitor={visitor}
          onClick={handleVisitorClick}
        />
      ))}
    </>
  );
};
