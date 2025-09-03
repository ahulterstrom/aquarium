import { useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { GLTF } from "three-stdlib";
import { getCoinSystem } from "@/components/systems/coinSystem";
import { coinInteractionManager } from "@/lib/coinInteraction";
import { useUIStore } from "@/stores/uiStore";
import { MAX_FRAME_DELTA } from "@/lib/constants/misc";

const COIN_RADIUS = 0.369;

const COIN_SCALES = {
  1: 0.5, // Penny - smallest
  5: 0.6, // Silver - slightly larger
  25: 0.75, // Star - medium large
  100: 0.65, // Diamond - largest
} as const;

type GLTFResult = GLTF & {
  nodes: {
    Coin_1: THREE.Mesh;
    Coin_2: THREE.Mesh;
    Coin_Star_1: THREE.Mesh;
    Coin_Star_2: THREE.Mesh;
    Diamond: THREE.Mesh;
  };
  materials: never;
};

interface CoinMeshData {
  group: THREE.Group;
  hitbox: THREE.Mesh;
  visualMeshes: THREE.Mesh[];
  animationState: {
    isCollected: boolean;
    progress: number;
    coinPosition: THREE.Vector3;
    currentPosition: THREE.Vector3;
    rotation: number;
    scale: number;
    baseScale: number;
    initialized: boolean;
  };
}

const copperMaterial = new THREE.MeshStandardMaterial({
  color: 0x7c4a4a,
  roughness: 0.4,
});
const copperAccentMaterial = new THREE.MeshStandardMaterial({
  color: 0x5c3a3a,
  roughness: 0.4,
});

const silverMaterial = new THREE.MeshStandardMaterial({
  color: 0xc0c0c0,
  roughness: 0.2,
});
const silverAccentMaterial = new THREE.MeshStandardMaterial({
  color: 0xa0a0a0,
  roughness: 0.2,
});

const goldMaterial = new THREE.MeshStandardMaterial({
  color: 0xffdc5b,
  roughness: 0.3,
});
const goldAccentMaterial = new THREE.MeshStandardMaterial({
  color: 0xeebe3c,
  roughness: 0.3,
});

const diamondMaterial = new THREE.MeshStandardMaterial({
  color: 0x00ffff,
  roughness: 0.1,
});

export const Coins = () => {
  const groupRef = useRef<THREE.Group>(null);
  const { camera } = useThree();

  // Load coin model
  const { nodes } = useGLTF("/Models.glb") as GLTFResult;

  // Store coin mesh data imperatively
  const coinMeshes = useRef<Map<string, CoinMeshData>>(new Map());
  const hitboxGeometryRef = useRef<THREE.BoxGeometry | null>(null);

  // Create shared hitbox geometry once
  if (!hitboxGeometryRef.current) {
    hitboxGeometryRef.current = new THREE.BoxGeometry(
      COIN_RADIUS * 3,
      COIN_RADIUS * 3,
      COIN_RADIUS * 3,
    );
  }

  const createCoinMesh = (coinId: string): CoinMeshData | null => {
    // Get coin data to determine type
    const coinSystem = getCoinSystem();
    const coin = coinSystem.getCoin(coinId);
    if (!coin) return null;

    // Get scale for this coin type
    const coinScale =
      COIN_SCALES[coin.value as keyof typeof COIN_SCALES] || 1.0;
    const coinHeight = COIN_RADIUS;

    // Create group
    const group = new THREE.Group();

    // Create hitbox mesh with fixed size (group scaling will handle final size)
    const hitboxGeometry = new THREE.BoxGeometry(
      COIN_RADIUS * 2,
      COIN_RADIUS * 2,
      COIN_RADIUS * 2,
    );
    const hitbox = new THREE.Mesh(
      hitboxGeometry,
      new THREE.MeshBasicMaterial(),
    );
    hitbox.position.set(0, coinHeight, 0);
    hitbox.visible = false;

    // Create visual meshes based on coin value
    const visualMeshes: THREE.Mesh[] = [];

    if (coin.value === 100) {
      // Diamond coin
      const diamondMesh = new THREE.Mesh(
        nodes.Diamond.geometry,
        diamondMaterial,
      );
      diamondMesh.position.set(0, coinHeight, 0);
      visualMeshes.push(diamondMesh);
    } else if (coin.value === 25) {
      // Star coin
      const star1 = new THREE.Mesh(nodes.Coin_Star_1.geometry, goldMaterial);
      const star2 = new THREE.Mesh(
        nodes.Coin_Star_2.geometry,
        goldAccentMaterial,
      );
      star1.position.set(0, coinHeight, 0);
      star2.position.set(0, coinHeight, 0);
      visualMeshes.push(star1, star2);
    } else if (coin.value === 5) {
      // Silver coin - uses same geometry as penny but with silver material
      const mesh1 = new THREE.Mesh(nodes.Coin_1.geometry, silverMaterial);
      const mesh2 = new THREE.Mesh(nodes.Coin_2.geometry, silverAccentMaterial);
      mesh1.position.set(0, coinHeight, 0);
      mesh2.position.set(0, coinHeight, 0);
      visualMeshes.push(mesh1, mesh2);
    } else {
      // Regular penny coin (value 1)
      const mesh1 = new THREE.Mesh(nodes.Coin_1.geometry, copperMaterial);
      const mesh2 = new THREE.Mesh(nodes.Coin_2.geometry, copperAccentMaterial);
      mesh1.position.set(0, coinHeight, 0);
      mesh2.position.set(0, coinHeight, 0);
      visualMeshes.push(mesh1, mesh2);
    }

    // Apply scale to entire group
    group.scale.setScalar(coinScale);

    // Add meshes to group
    group.add(hitbox);
    visualMeshes.forEach((mesh) => group.add(mesh));

    const coinMeshData: CoinMeshData = {
      group,
      hitbox,
      visualMeshes,
      animationState: {
        isCollected: false,
        progress: 0,
        coinPosition: new THREE.Vector3(),
        currentPosition: new THREE.Vector3(),
        rotation: 0,
        scale: 1,
        baseScale: coinScale,
        initialized: false,
      },
    };

    // Register for interaction
    coinInteractionManager.registerMesh(coinId, hitbox);
    coinInteractionManager.registerCallback(coinId, () => {
      if (!coinMeshData.animationState.isCollected) {
        coinMeshData.animationState.isCollected = true;
      }
    });

    return coinMeshData;
  };

  const removeCoinMesh = (coinId: string) => {
    const coinMeshData = coinMeshes.current.get(coinId);
    if (coinMeshData && groupRef.current) {
      groupRef.current.remove(coinMeshData.group);
      coinInteractionManager.unregisterMesh(coinId);
      coinInteractionManager.unregisterCallback(coinId);
      coinMeshes.current.delete(coinId);
    }
  };

  useFrame((_, delta) => {
    if (!groupRef.current) return;

    // Don't create coins until model is loaded
    if (
      !nodes ||
      !nodes.Coin_1 ||
      !nodes.Coin_2 ||
      !nodes.Coin_Star_1 ||
      !nodes.Coin_Star_2 ||
      !nodes.Diamond
    )
      return;

    const coinSystem = getCoinSystem();
    const currentCoins = coinSystem.getCoins();
    const currentCoinIds = new Set(currentCoins.map((c) => c.id));
    const existingCoinIds = new Set(coinMeshes.current.keys());

    // Add new coins
    for (const coin of currentCoins) {
      if (!existingCoinIds.has(coin.id)) {
        const coinMeshData = createCoinMesh(coin.id);
        if (coinMeshData) {
          coinMeshes.current.set(coin.id, coinMeshData);
          groupRef.current.add(coinMeshData.group);
        }
      }
    }

    // Remove old coins
    for (const coinId of existingCoinIds) {
      if (!currentCoinIds.has(coinId)) {
        const coinMeshData = coinMeshes.current.get(coinId);
        if (coinMeshData && !coinMeshData.animationState.isCollected) {
          removeCoinMesh(coinId);
        }
      }
    }

    // Update visibility based on placement mode
    const placementMode = useUIStore.getState().placementMode;
    const visible = placementMode !== "moveTank" && placementMode !== "tank";

    // Update all coin animations
    const clampedDelta = Math.min(delta, MAX_FRAME_DELTA);
    for (const [coinId, coinMeshData] of coinMeshes.current.entries()) {
      const { group, animationState: anim } = coinMeshData;

      // Set visibility
      group.visible = visible;

      // Initialize coin position once
      if (!anim.initialized) {
        const coin = coinSystem.getCoin(coinId);
        if (!coin) continue;

        anim.coinPosition.set(
          coin.position.x,
          coin.position.y,
          coin.position.z,
        );
        anim.currentPosition.copy(anim.coinPosition);
        anim.initialized = true;
        group.position.copy(anim.coinPosition);
      }

      // Update rotation with delta time - vary speed based on coin value
      const coin = coinSystem.getCoin(coinId);
      const baseSpinSpeed =
        coin?.value === 100
          ? 2.5 // Diamond - fastest
          : coin?.value === 25
            ? 2.0 // Star
            : coin?.value === 5
              ? 1.5 // Silver
              : 1.2; // Penny
      const spinSpeed = anim.isCollected ? 9.0 : baseSpinSpeed; // Radians per second
      anim.rotation += spinSpeed * clampedDelta;
      group.rotation.y = anim.rotation;

      // Handle collection animation
      if (anim.isCollected) {
        anim.progress = Math.min(anim.progress + delta * 1.5, 1);

        // Calculate target position dynamically based on current camera
        if ("isOrthographicCamera" in camera && camera.isOrthographicCamera) {
          const orthoCam = camera as THREE.OrthographicCamera;

          // Get camera basis vectors
          const cameraUp = new THREE.Vector3();
          const cameraRight = new THREE.Vector3();
          const cameraForward = new THREE.Vector3();
          camera.matrixWorld.extractBasis(cameraRight, cameraUp, cameraForward);

          // Calculate view size
          const viewHeight = (orthoCam.top - orthoCam.bottom) / orthoCam.zoom;
          const viewWidth = (orthoCam.right - orthoCam.left) / orthoCam.zoom;
          const cameraWorldPos = new THREE.Vector3();
          camera.getWorldPosition(cameraWorldPos);

          // Calculate target
          const upDistance = viewHeight * 0.45;
          const leftOffset = viewWidth * 0.15;
          const targetPosition = cameraWorldPos.clone();
          targetPosition.addScaledVector(cameraUp, upDistance);
          targetPosition.addScaledVector(cameraRight, -leftOffset);

          // Interpolate position with easing
          const easedProgress = 1 - Math.pow(1 - anim.progress, 3);
          anim.currentPosition.lerpVectors(
            anim.coinPosition,
            targetPosition,
            easedProgress,
          );
        }

        // Update scale
        anim.scale = 1 - anim.progress * 0.7;

        // Update mesh transforms
        group.position.copy(anim.currentPosition);
        group.scale.setScalar(anim.baseScale * anim.scale);

        // Check if animation is complete
        if (anim.progress >= 1) {
          removeCoinMesh(coinId);
        }
      }
    }
  });

  return <group ref={groupRef} />;
};

// Preload the model
useGLTF.preload("/Models.glb");
