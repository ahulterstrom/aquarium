import { useRef, useEffect, useCallback } from "react";
import { GridCell } from "./GridCell";
import { useGridStore } from "../../stores/gridStore";
import { useUIStore } from "../../stores/uiStore";
import { useGameStore } from "../../stores/gameStore";
import {
  GridPosition,
  Tank,
  Entrance,
  GridCell as GridCellType,
} from "../../types/game.types";
import { TANK_SPECS, ENTRANCE_COST } from "../../lib/constants";
import {
  getRotatedDimensions,
  getTankModelRotation,
} from "../../lib/utils/placement";
import * as THREE from "three";
import { ThreeEvent, useFrame } from "@react-three/fiber";
import { nanoid } from "nanoid";
import { useGLTF } from "@react-three/drei";
import { GLTF } from "three-stdlib";

const VALID_GRID_COLOR = 0x33aa33;
const INVALID_GRID_COLOR = 0xaa3333;
const VALID_TANK_COLOR = 0xffffff;
const INVALID_TANK_COLOR = 0xaa3333;

type GLTFResult = GLTF & {
  nodes: {
    Tank_Medium_1: THREE.Mesh;
    Tank_Medium_2: THREE.Mesh;
    Tank_Medium_3: THREE.Mesh;
    Tank_Medium_4: THREE.Mesh;
    Tank_Medium_5: THREE.Mesh;
    Tank_Medium_6: THREE.Mesh;
    Tank_Large_1: THREE.Mesh;
    Tank_Large_2: THREE.Mesh;
    Tank_Large_3: THREE.Mesh;
    Tank_Large_4: THREE.Mesh;
    Tank_Large_5: THREE.Mesh;
    Tank_Large_6: THREE.Mesh;
    Tank_Huge_1: THREE.Mesh;
    Tank_Huge_2: THREE.Mesh;
    Tank_Huge_3: THREE.Mesh;
    Tank_Huge_4: THREE.Mesh;
    Tank_Huge_5: THREE.Mesh;
    Tank_Huge_6: THREE.Mesh;
  };
  materials: never;
};

const previewTankMaterial = new THREE.MeshBasicMaterial({
  color: new THREE.Color(VALID_TANK_COLOR),
  transparent: true,
  opacity: 0.4,
});

// Wrapper component that handles conditional rendering
export const PlacementGridRenderer = () => {
  const placementMode = useUIStore.use.placementMode();
  
  const shouldShowGrid = 
    placementMode === "tank" || 
    placementMode === "entrance" || 
    placementMode === "moveTank";
    
  if (!shouldShowGrid) return null;
  
  return <PlacementGrid />;
};

const PlacementGrid = () => {
  const cells = useGridStore.use.cells();
  const canPlaceAt = useGridStore.use.canPlaceAt();
  const canPlaceEntranceAt = useGridStore.use.canPlaceEntranceAt();
  const placementMode = useUIStore.use.placementMode();
  const placementPreview = useUIStore.use.placementPreview();
  const placementRotation = useUIStore.use.placementRotation();
  const setPlacementMode = useUIStore.use.setPlacementMode();
  const movingTankId = useUIStore.use.movingTankId();
  const cancelMoveTank = useUIStore.use.cancelMoveTank();
  const addTank = useGameStore.use.addTank();
  const moveTankToPosition = useGameStore.use.moveTankToPosition();
  const addEntrance = useGameStore.use.addEntrance();
  const entrances = useGameStore.use.entrances();
  const tanks = useGameStore.use.tanks();
  const spendMoney = useGameStore.use.spendMoney();
  const placeObject = useGridStore.use.placeObject();
  const getEdgeForPosition = useGridStore.use.getEdgeForPosition();

  // Load GLTF at component level
  const { nodes } = useGLTF("/Models.glb") as GLTFResult;

  // Refs for imperative updates
  const hoveredCellRef = useRef<GridPosition | null>(null);
  const cellRefsMap = useRef<Map<string, THREE.Mesh>>(new Map());
  const groupRef = useRef<THREE.Group>(null);
  const planeRef = useRef<THREE.Mesh>(null);
  const lastValidationRef = useRef<{
    position: GridPosition | null;
    isValid: boolean;
  }>({
    position: null,
    isValid: true,
  });

  // Preview mesh refs
  const previewMeshRef = useRef<THREE.Group | null>(null);
  const lastPreviewStateRef = useRef<{
    position: GridPosition | null;
    size: string | null;
    rotation: number;
    mode: string | null;
  }>({
    position: null,
    size: null,
    rotation: 0,
    mode: null,
  });

  // Helper to get cell key
  const getCellKey = (x: number, y: number, z: number) => `${x}-${y}-${z}`;

  // Register cell mesh refs
  const registerCellRef = useCallback(
    (x: number, y: number, z: number, ref: THREE.Mesh | null) => {
      const key = getCellKey(x, y, z);
      if (ref) {
        cellRefsMap.current.set(key, ref);
      } else {
        cellRefsMap.current.delete(key);
      }
    },
    [],
  );

  // Update cell colors imperatively
  const updateCellHighlights = useCallback(() => {
    console.log("updateCellHighlights called");
    const hoveredCell = hoveredCellRef.current;

    // Reset all cells to default color first
    cellRefsMap.current.forEach((mesh) => {
      const material = mesh.material as THREE.MeshStandardMaterial;
      material.color.setHex(0x666666);
    });

    if (!hoveredCell || !placementMode) return;

    const cellsToHighlight: string[] = [];
    let isValidPlacement = true;

    if (
      (placementMode === "tank" || placementMode === "moveTank") &&
      placementPreview
    ) {
      // Get tank dimensions from preview
      const tankSize = placementPreview.size || "medium";
      const specs = TANK_SPECS[tankSize];

      // Get rotated dimensions for preview
      const { width: rotatedWidth, depth: rotatedDepth } = getRotatedDimensions(
        specs.gridWidth,
        specs.gridDepth,
        placementRotation,
      );

      // Check validation only if position changed
      if (
        !lastValidationRef.current.position ||
        lastValidationRef.current.position.x !== hoveredCell.x ||
        lastValidationRef.current.position.z !== hoveredCell.z
      ) {
        isValidPlacement = canPlaceAt(hoveredCell, rotatedWidth, rotatedDepth);
        lastValidationRef.current = {
          position: { ...hoveredCell },
          isValid: isValidPlacement,
        };
      } else {
        isValidPlacement = lastValidationRef.current.isValid;
      }

      // Collect cells to highlight
      for (let dx = 0; dx < rotatedWidth; dx++) {
        for (let dz = 0; dz < rotatedDepth; dz++) {
          cellsToHighlight.push(
            getCellKey(hoveredCell.x + dx, 0, hoveredCell.z + dz),
          );
        }
      }
    } else if (placementMode === "entrance") {
      cellsToHighlight.push(
        getCellKey(hoveredCell.x, hoveredCell.y, hoveredCell.z),
      );
      isValidPlacement = canPlaceEntranceAt(hoveredCell);
    }

    // Update highlighted cells
    cellsToHighlight.forEach((key) => {
      const mesh = cellRefsMap.current.get(key);
      if (mesh) {
        const material = mesh.material as THREE.MeshStandardMaterial;
        material.color.setHex(
          isValidPlacement ? VALID_GRID_COLOR : INVALID_GRID_COLOR,
        );
      }
    });

    // Update cursor
    document.body.style.cursor = isValidPlacement ? "pointer" : "not-allowed";
  }, [
    placementMode,
    placementPreview,
    placementRotation,
    canPlaceAt,
    canPlaceEntranceAt,
  ]);

  // Preview mesh management
  const createPreviewMesh = useCallback(
    (size: string, tankNodes: GLTFResult["nodes"]) => {
      if (!groupRef.current) return null;

      const group = new THREE.Group();

      // Create meshes based on size
      const nodePrefix = size.charAt(0).toUpperCase() + size.slice(1);
      const meshes = [
        {
          geometry:
            tankNodes[`Tank_${nodePrefix}_1` as keyof GLTFResult["nodes"]]
              ?.geometry,
          material: previewTankMaterial,
        },
        {
          geometry:
            tankNodes[`Tank_${nodePrefix}_2` as keyof GLTFResult["nodes"]]
              ?.geometry,
          material: previewTankMaterial,
        },
        {
          geometry:
            tankNodes[`Tank_${nodePrefix}_3` as keyof GLTFResult["nodes"]]
              ?.geometry,
          material: previewTankMaterial,
        },
        {
          geometry:
            tankNodes[`Tank_${nodePrefix}_4` as keyof GLTFResult["nodes"]]
              ?.geometry,
          material: previewTankMaterial,
        },
        {
          geometry:
            tankNodes[`Tank_${nodePrefix}_5` as keyof GLTFResult["nodes"]]
              ?.geometry,
          material: previewTankMaterial,
        },
        {
          geometry:
            tankNodes[`Tank_${nodePrefix}_6` as keyof GLTFResult["nodes"]]
              ?.geometry,
          material: previewTankMaterial,
        },
      ];

      meshes.forEach(({ geometry, material }) => {
        if (geometry) {
          const mesh = new THREE.Mesh(geometry, material);
          mesh.raycast = () => {}; // Disable raycasting for preview meshes
          mesh.renderOrder = 1;
          group.add(mesh);
        }
      });

      groupRef.current.add(group);
      return group;
    },
    [],
  );

  const updatePreviewMesh = useCallback(
    (time: number) => {
      const hoveredCell = hoveredCellRef.current;
      const shouldShowPreview =
        (placementMode === "tank" || placementMode === "moveTank") &&
        placementPreview &&
        hoveredCell;

      // Check if preview state changed
      const currentState = {
        position: hoveredCell,
        size: placementPreview?.size || null,
        rotation: placementRotation,
        mode: placementMode,
      };

      const lastState = lastPreviewStateRef.current;
      const stateChanged =
        !lastState.position ||
        lastState.position.x !== currentState.position?.x ||
        lastState.position.z !== currentState.position?.z ||
        lastState.size !== currentState.size ||
        lastState.rotation !== currentState.rotation ||
        lastState.mode !== currentState.mode;

      if (
        !stateChanged &&
        previewMeshRef.current?.visible === shouldShowPreview
      ) {
        return; // No changes needed
      }

      // Remove existing preview
      if (previewMeshRef.current) {
        previewMeshRef.current.parent?.remove(previewMeshRef.current);
        previewMeshRef.current = null;
      }

      // Create new preview if needed
      if (shouldShowPreview && hoveredCell && placementPreview) {
        const size = placementPreview.size || "medium";
        const previewMesh = createPreviewMesh(size, nodes);

        if (previewMesh) {
          // Calculate position
          const baseX = hoveredCell.x * 2;
          const baseZ = hoveredCell.z * 2;
          const specs = TANK_SPECS[size as keyof typeof TANK_SPECS];
          const { width: rotatedWidth, depth: rotatedDepth } =
            getRotatedDimensions(
              specs.gridWidth,
              specs.gridDepth,
              placementRotation,
            );
          const offsetX = rotatedWidth > 1 ? rotatedWidth - 1 : 0;
          const offsetZ = rotatedDepth > 1 ? rotatedDepth - 1 : 0;

          // Check placement validity and update material color
          const isValid = canPlaceAt(hoveredCell, rotatedWidth, rotatedDepth);
          previewTankMaterial.color.setHex(
            isValid ? VALID_TANK_COLOR : INVALID_TANK_COLOR,
          );

          // Add floating animation
          const bobAmount = Math.sin(time * 4) * 0.1; // Speed: 4, Amplitude: 0.1

          previewMesh.position.set(
            baseX + offsetX,
            0.5 + bobAmount,
            baseZ + offsetZ,
          );
          previewMesh.rotation.y = getTankModelRotation(placementRotation);
          previewMeshRef.current = previewMesh;
        }
      }

      // Update state tracking
      lastPreviewStateRef.current = currentState;
    },
    [
      placementMode,
      placementPreview,
      placementRotation,
      createPreviewMesh,
      nodes,
      canPlaceAt,
    ],
  );

  // Update preview mesh every frame
  useFrame(({ clock }) => {
    updatePreviewMesh(clock.elapsedTime);
  });

  // Handle pointer move
  const handlePointerMove = useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      if (!planeRef.current) return;

      e.stopPropagation();
      const point = e.point;

      const gridX = Math.floor((point.x + 1) / 2);
      const gridZ = Math.floor((point.z + 1) / 2);

      // Check if position is valid grid cell
      const cell = cells.get(`${gridX},0,${gridZ}`);

      if (cell) {
        const newHoveredCell = { x: gridX, y: 0, z: gridZ };

        // Only update if cell changed
        if (
          !hoveredCellRef.current ||
          hoveredCellRef.current.x !== gridX ||
          hoveredCellRef.current.z !== gridZ
        ) {
          hoveredCellRef.current = newHoveredCell;
          updateCellHighlights();
        }
      }
    },
    [cells, updateCellHighlights],
  );

  // Handle pointer leave
  const handlePointerLeave = useCallback(() => {
    hoveredCellRef.current = null;
    lastValidationRef.current = { position: null, isValid: true };
    updateCellHighlights();
    document.body.style.cursor = "default";
  }, [updateCellHighlights]);

  // Handle cell click
  const handleCellClick = useCallback(
    (e: ThreeEvent<MouseEvent>) => {
      e.stopPropagation();

      const hoveredCell = hoveredCellRef.current;
      if (!hoveredCell) return;

      const { x, z } = hoveredCell;

      if (placementMode === "tank" && placementPreview) {
        const tankSize = placementPreview.size || "medium";
        const specs = TANK_SPECS[tankSize];
        const { width: rotatedWidth, depth: rotatedDepth } =
          getRotatedDimensions(
            specs.gridWidth,
            specs.gridDepth,
            placementRotation,
          );

        if (canPlaceAt(hoveredCell, rotatedWidth, rotatedDepth)) {
          const tankId = `tank_${nanoid()}`;
          const newTank: Tank = {
            id: tankId,
            position: { x, y: 0, z },
            size: tankSize,
            waterQuality: 1,
            temperature: 24,
            capacity: specs.capacity,
            fishIds: [],
            decorations: [],
            gridWidth: specs.gridWidth,
            gridDepth: specs.gridDepth,
            rotation: placementRotation,
            maintenanceLevel: 1.0,
          };

          addTank(newTank);
          placeObject(
            { x, y: 0, z },
            rotatedWidth,
            rotatedDepth,
            "tank",
            tankId,
          );
          setPlacementMode("none");
        }
      } else if (placementMode === "moveTank" && movingTankId) {
        const tankToMove = tanks.get(movingTankId);
        if (tankToMove) {
          const success = moveTankToPosition(
            movingTankId,
            { x, y: 0, z },
            placementRotation,
          );
          if (success) {
            cancelMoveTank();
          }
        }
      } else if (placementMode === "entrance") {
        if (canPlaceEntranceAt(hoveredCell)) {
          if (spendMoney(ENTRANCE_COST)) {
            const entranceId = `entrance_${nanoid()}`;
            const edge = getEdgeForPosition({ x, y: 0, z });
            const newEntrance: Entrance = {
              id: entranceId,
              position: { x, y: 0, z },
              isMainEntrance: entrances.size === 0,
              edge: edge || "north",
            };

            addEntrance(newEntrance);
            placeObject({ x, y: 0, z }, 1, 1, "entrance", entranceId);
            setPlacementMode("none");
          }
        }
      }
    },
    [
      placementMode,
      placementPreview,
      placementRotation,
      canPlaceAt,
      canPlaceEntranceAt,
      addTank,
      moveTankToPosition,
      addEntrance,
      setPlacementMode,
      movingTankId,
      cancelMoveTank,
      entrances,
      tanks,
      spendMoney,
      placeObject,
      getEdgeForPosition,
    ],
  );

  // Update highlights when placement mode or rotation changes
  useEffect(() => {
    updateCellHighlights();
  }, [placementMode, placementRotation, updateCellHighlights]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      document.body.style.cursor = "default";
    };
  }, []);

  return (
    <group
      ref={groupRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      onClick={handleCellClick}
    >
      {/* Invisible plane for raycasting - covers entire grid area */}
      <mesh
        ref={planeRef}
        visible={false}
        position={[10, 0.05, 10]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[100, 100]} />
        <meshBasicMaterial />
      </mesh>

      {/* Render grid cells */}
      {Array.from(cells.values()).map((cell) => {
        const typedCell = cell as GridCellType;
        const { x, y, z } = typedCell;

        // Skip if not on ground level
        if (y !== 0) return null;

        return (
          <GridCell
            key={getCellKey(x, y, z)}
            x={x}
            y={y}
            z={z}
            registerRef={registerCellRef}
          />
        );
      })}
    </group>
  );
};
