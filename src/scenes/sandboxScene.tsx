import { Coins } from "@/components/coins";
import { Entrances } from "@/components/entrances";
import { FishRenderer } from "@/components/fish";
import { FloorGrid } from "@/components/floor/FloorGrid";
import { FloorTextureProvider } from "@/components/floor/FloorTextureProvider";
import { ExpansionGrid } from "@/components/game/ExpansionGrid";
import { CanvasCapture } from "@/components/screenshot/CanvasCapture";
import { Tanks } from "@/components/tanks";
import { Visitors } from "@/components/visitors";
import { WallSystem } from "@/components/walls/WallSystem";
import { WallTextureProvider } from "@/components/walls/WallTextureProvider";
import { ENTRANCE_COST, TANK_SPECS } from "@/lib/constants";
import { getRotatedDimensions } from "@/lib/utils/placement";
import {
  Environment,
  MapControls,
  OrthographicCamera,
} from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { nanoid } from "nanoid";
import { useCallback, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { Grid } from "../components/game/Grid";
import { GameSystems } from "../components/systems/GameSystems";
import {
  getCoinSystem,
  initializeCoinSystem,
} from "../components/systems/coinSystem";
import {
  addFishToSystem,
  initializeFishSystem,
  updateFishSystemReferences,
} from "../components/systems/fishSystem";
import { coinInteractionManager } from "../lib/coinInteraction";
import { useEconomyStore } from "../stores/economyStore";
import { useGameStore } from "../stores/gameStore";
import { useGridStore } from "../stores/gridStore";
import { useStatisticsStore } from "../stores/statisticsStore";
import { useUIStore } from "../stores/uiStore";
import { Entrance, Tank as TankType } from "../types/game.types";

export const SandboxScene = () => {
  console.log("Rendering SandboxScene");
  const [hoveredCell, setHoveredCell] = useState<{
    x: number;
    y: number;
    z: number;
  } | null>(null);

  const { camera, gl } = useThree();
  const raycaster = useRef(new THREE.Raycaster());

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
  const placementRotation = useUIStore.use.placementRotation();
  const clearSelection = useUIStore.use.clearSelection();
  const setPlacementMode = useUIStore.use.setPlacementMode();
  const addMoney = useGameStore.use.addMoney();

  // Global coin interaction handler
  const handleGlobalPointerMove = useCallback(
    (event: PointerEvent) => {
      if (placementMode !== "none") return; // Don't interfere with placement mode

      const pointer = new THREE.Vector2();
      const rect = gl.domElement.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.current.setFromCamera(pointer, camera);

      // Only raycast against coin meshes
      const coinObjects = coinInteractionManager.getCoinMeshes();
      const intersects = raycaster.current.intersectObjects(coinObjects, true);

      if (intersects.length > 0) {
        document.body.style.cursor = "pointer";
        // Collect coin on hover
        const coinId = coinInteractionManager.findCoinIdFromMesh(
          intersects[0].object,
        );
        if (coinId) {
          coinInteractionManager.handleCoinClick(coinId);
        }
      } else {
        document.body.style.cursor = "default";
      }
    },
    [camera, gl, placementMode],
  );

  const handleGlobalClick = useCallback(
    (event: MouseEvent) => {
      if (placementMode !== "none") return; // Don't interfere with placement mode

      const pointer = new THREE.Vector2();
      const rect = gl.domElement.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.current.setFromCamera(pointer, camera);

      // Only raycast against coin meshes
      const coinObjects = coinInteractionManager.getCoinMeshes();
      const intersects = raycaster.current.intersectObjects(coinObjects, true);

      if (intersects.length > 0) {
        const coinId = coinInteractionManager.findCoinIdFromMesh(
          intersects[0].object,
        );
        if (coinId) {
          coinInteractionManager.handleCoinClick(coinId);
        }
      }
    },
    [camera, gl, placementMode],
  );

  // Set up coin click handling for money/game logic
  useEffect(() => {
    const handleCoinLogic = (coinId: string) => {
      const coinSystem = getCoinSystem();
      const coin = coinSystem.collectCoin(coinId);
      if (coin) {
        addMoney(coin.value);
        // Track coin collection statistics
        useStatisticsStore.getState().recordCoinCollected(coin.value);
        // Track revenue in economy store
        useEconomyStore.getState().addTicketRevenue(coin.value);
        console.log(`Collected coin worth ${coin.value}`);
      }
    };

    coinInteractionManager.addClickCallback(handleCoinLogic);
    return () => {
      coinInteractionManager.removeClickCallback(handleCoinLogic);
    };
  }, [addMoney]);

  // Add global event listeners
  useEffect(() => {
    const canvas = gl.domElement;
    canvas.addEventListener("pointermove", handleGlobalPointerMove);
    canvas.addEventListener("click", handleGlobalClick);

    return () => {
      canvas.removeEventListener("pointermove", handleGlobalPointerMove);
      canvas.removeEventListener("click", handleGlobalClick);
    };
  }, [gl, handleGlobalPointerMove, handleGlobalClick]);

  useEffect(() => {
    // Only initialize grid if it's empty (first load)
    if (cells.size === 0) {
      initializeGrid(3, 1, 3);
    }

    initializeCoinSystem();
    initializeFishSystem();

    // Rehydrate fish into FishSystem after initialization
    const fishMap = useGameStore.getState().fish;
    if (fishMap.size > 0) {
      fishMap.forEach((fish) => {
        try {
          addFishToSystem(fish);
        } catch (error) {
          console.warn(
            "Failed to add fish to system during scene initialization:",
            error,
          );
        }
      });
      updateFishSystemReferences();
    }
  }, [initializeGrid, cells.size, addMoney]);

  const handleCellClick = (x: number, z: number) => {
    if (placementMode === "tank" && placementPreview) {
      const tankSize = placementPreview.size || "medium";
      const specs = TANK_SPECS[tankSize];
      const rotation = placementRotation;

      // Get rotated dimensions for placement validation
      const { width: rotatedWidth, depth: rotatedDepth } = getRotatedDimensions(
        specs.gridWidth,
        specs.gridDepth,
        rotation,
      );

      if (canPlaceAt({ x, y: 0, z }, rotatedWidth, rotatedDepth)) {
        if (spendMoney(specs.cost)) {
          const tankId = `tank_${nanoid()}`;
          const newTank: TankType = {
            id: tankId,
            position: { x, y: 0, z },
            size: tankSize,
            gridWidth: specs.gridWidth, // Store original dimensions
            gridDepth: specs.gridDepth,
            rotation: rotation, // Store rotation
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
            rotatedWidth, // Use rotated dimensions for grid placement
            rotatedDepth,
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

      <Environment
        environmentIntensity={1}
        files={"/rostock_laage_airport_1k.hdr"}
      />
    </>
  );
};
