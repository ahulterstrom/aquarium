import { Coins } from "@/components/coins";
import { Entrances } from "@/components/entrances";
import { FishRenderer } from "@/components/fish";
import { FloorGrid } from "@/components/floor/FloorGrid";
import { FloorTextureProvider } from "@/components/floor/FloorTextureProvider";
import { ExpansionGridRenderer } from "@/components/game/ExpansionGrid";
import { CanvasCapture } from "@/components/screenshot/CanvasCapture";
import { Tanks } from "@/components/tanks";
import { Visitors } from "@/components/visitors";
import { WallSystem } from "@/components/walls/WallSystem";
import { WallTextureProvider } from "@/components/walls/WallTextureProvider";
import { useSound } from "@/contexts/sound/useSound";
import {
  Environment,
  MapControls,
  OrthographicCamera,
} from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { useCallback, useEffect, useRef } from "react";
import * as THREE from "three";
import { PlacementGridRenderer } from "../components/game/placementGrid";
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
import { useStatisticsStore } from "../stores/statisticsStore";
import { useUIStore } from "../stores/uiStore";

export const SandboxScene = () => {
  console.log("Rendering SandboxScene");
  const { camera, gl } = useThree();
  const raycaster = useRef(new THREE.Raycaster());

  const floorStyle = useGameStore.use.floorStyle();
  const wallStyle = useGameStore.use.wallStyle();
  const addMoney = useGameStore.use.addMoney();

  const placementMode = useUIStore.use.placementMode();

  const { soundController } = useSound();

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
        soundController.play("coinpickup");
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
  }, [addMoney, soundController]);

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
  }, [addMoney]);

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

      <MapControls makeDefault />

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

      {/* Grid */}
      <PlacementGridRenderer />

      {/* Expansion Grid */}
      <ExpansionGridRenderer />

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
