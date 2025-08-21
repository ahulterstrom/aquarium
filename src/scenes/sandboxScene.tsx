import { Entrances } from "@/components/entrances";
import { Tanks } from "@/components/tanks";
import { Visitors } from "@/components/visitors";
import { Coins } from "@/components/coins";
import { FishRenderer } from "@/components/fish";
import { ExpansionGrid } from "@/components/game/ExpansionGrid";
import { WallSystem } from "@/components/walls/WallSystem";
import { WallTextureProvider } from "@/components/walls/WallTextureProvider";
import { FloorTextureProvider } from "@/components/floor/FloorTextureProvider";
import { FloorGrid } from "@/components/floor/FloorGrid";
import { CanvasCapture } from "@/components/screenshot/CanvasCapture";
import { ENTRANCE_COST, TANK_SPECS } from "@/lib/constants";
import {
  Environment,
  MapControls,
  OrthographicCamera,
} from "@react-three/drei";
import { useEffect, useState } from "react";
import { Grid } from "../components/game/Grid";
import { GameSystems } from "../components/systems/GameSystems";
import { initializeCoinSystem } from "../components/systems/coinSystem";
import { initializeFishSystem } from "../components/systems/fishSystem";
import { useGameStore } from "../stores/gameStore";
import { useGridStore } from "../stores/gridStore";
import { useUIStore } from "../stores/uiStore";
import { Entrance, Tank as TankType } from "../types/game.types";
import { nanoid } from "nanoid";
import { MaterialTest } from "@/components/MaterialTest";

export const SandboxScene = () => {
  console.log("Rendering SandboxScene");
  const [hoveredCell, setHoveredCell] = useState<{
    x: number;
    y: number;
    z: number;
  } | null>(null);

  const entrances = useGameStore.use.entrances();
  const addTank = useGameStore.use.addTank();
  const addEntrance = useGameStore.use.addEntrance();
  const spendMoney = useGameStore.use.spendMoney();
  const floorStyle = useGameStore.use.floorStyle();
  const wallStyle = useGameStore.use.wallStyle();

  const cells = useGridStore.use.cells();
  const initializeGrid = useGridStore.use.initializeGrid();
  const canPlaceAt = useGridStore.use.canPlaceAt();
  const canPlaceEntranceAt = useGridStore.use.canPlaceEntranceAt();
  const placeObject = useGridStore.use.placeObject();
  const getEdgeForPosition = useGridStore.use.getEdgeForPosition();

  const placementMode = useUIStore.use.placementMode();
  const placementPreview = useUIStore.use.placementPreview();
  const clearSelection = useUIStore.use.clearSelection();
  const setPlacementMode = useUIStore.use.setPlacementMode();
  const addMoney = useGameStore.use.addMoney();

  useEffect(() => {
    initializeGrid(3, 1, 3);

    initializeCoinSystem();
    initializeFishSystem();
  }, [initializeGrid, addMoney]);

  const handleCellClick = (x: number, z: number) => {
    if (placementMode === "tank" && placementPreview) {
      const tankSize = placementPreview.size || "medium";
      const specs = TANK_SPECS[tankSize];

      if (canPlaceAt({ x, y: 0, z }, specs.gridWidth, specs.gridDepth)) {
        if (spendMoney(specs.cost)) {
          const tankId = `tank_${nanoid()}`;
          const newTank: TankType = {
            id: tankId,
            position: { x, y: 0, z },
            size: tankSize,
            gridWidth: specs.gridWidth,
            gridDepth: specs.gridDepth,
            waterQuality: 1,
            temperature: 25,
            capacity: specs.capacity,
            fishIds: [],
            decorations: [],
            maintenanceLevel: 1,
          };

          addTank(newTank);
          placeObject(
            { x, y: 0, z },
            specs.gridWidth,
            specs.gridDepth,
            "tank",
            tankId,
          );
          setPlacementMode("none");
        }
      }
    } else if (placementMode === "entrance") {
      if (canPlaceEntranceAt({ x, y: 0, z })) {
        if (spendMoney(ENTRANCE_COST)) {
          const entranceId = `entrance_${nanoid()}`;
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
      // Clear all selections when clicking on empty space
      clearSelection();
    }
  };

  return (
    <>
      {/* Canvas capture for screenshots */}
      <CanvasCapture />

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
      <MapControls
        makeDefault
        enableZoom={process.env.NODE_ENV === "development"}
      />

      {/* Lighting */}
      <ambientLight intensity={0.6} />
      <directionalLight
        position={[10, 10, 5]}
        intensity={0.8}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />

      {/* Walls with dynamic textures */}
      <WallTextureProvider preloadStyles={[wallStyle]}>
        <WallSystem />
      </WallTextureProvider>

      {/* Grid - includes both original and expansion tiles */}
      {(placementMode === "tank" || placementMode === "entrance") && (
        <group
          onPointerMove={(e) => {
            if (placementMode === "tank" || placementMode === "entrance") {
              const point = e.point;
              const gridX = Math.floor((point.x + 1) / 2);
              const gridZ = Math.floor((point.z + 1) / 2);

              // Check if position is valid grid cell
              const cell = cells.get(`${gridX},0,${gridZ}`);

              if (cell) {
                setHoveredCell({ x: gridX, y: 0, z: gridZ });
              }
            }
          }}
          onPointerLeave={() => setHoveredCell(null)}
        >
          <Grid hoveredCell={hoveredCell} onCellClick={handleCellClick} />
        </group>
      )}

      {/* Expansion Grid - render when in expansion placement mode */}
      {placementMode === "expansion" && <ExpansionGrid />}

      <Tanks />
      <Entrances />
      <Visitors />
      <Coins />
      <FishRenderer />

      {/* Floor Grid with dynamic textures */}
      <FloorTextureProvider preloadStyles={[floorStyle]}>
        <FloorGrid />
      </FloorTextureProvider>

      <MaterialTest />

      <Environment
        environmentIntensity={1}
        files={"/rostock_laage_airport_1k.hdr"}
      />
    </>
  );
};
