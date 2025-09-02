import { useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { getCoinSystem } from "@/components/systems/coinSystem";
import { coinInteractionManager } from "@/lib/coinInteraction";
import { useUIStore } from "@/stores/uiStore";

const COIN_RADIUS = 0.16;

interface CoinMeshData {
  group: THREE.Group;
  hitbox: THREE.Mesh;
  visualMesh: THREE.Mesh;
  material: THREE.MeshLambertMaterial;
  animationState: {
    isCollected: boolean;
    progress: number;
    coinPosition: THREE.Vector3;
    currentPosition: THREE.Vector3;
    rotation: number;
    scale: number;
    opacity: number;
    initialized: boolean;
  };
}

export const Coins = () => {
  const groupRef = useRef<THREE.Group>(null);
  const { camera } = useThree();
  
  // Store coin mesh data imperatively
  const coinMeshes = useRef<Map<string, CoinMeshData>>(new Map());
  const geometryRef = useRef<THREE.CylinderGeometry | null>(null);
  const hitboxGeometryRef = useRef<THREE.BoxGeometry | null>(null);

  // Create shared geometries once
  if (!geometryRef.current) {
    geometryRef.current = new THREE.CylinderGeometry(COIN_RADIUS, COIN_RADIUS, 0.08, 12);
  }
  if (!hitboxGeometryRef.current) {
    hitboxGeometryRef.current = new THREE.BoxGeometry(
      COIN_RADIUS * 3, 
      COIN_RADIUS * 3, 
      COIN_RADIUS * 3
    );
  }

  const createCoinMesh = (coinId: string): CoinMeshData => {
    // Create group
    const group = new THREE.Group();
    
    // Create hitbox mesh
    const hitbox = new THREE.Mesh(
      hitboxGeometryRef.current!,
      new THREE.MeshBasicMaterial()
    );
    hitbox.position.set(0, COIN_RADIUS, 0);
    hitbox.visible = false;
    
    // Create visual mesh
    const material = new THREE.MeshLambertMaterial({ color: 0xffd700 });
    const visualMesh = new THREE.Mesh(geometryRef.current!, material);
    visualMesh.rotation.x = Math.PI / 2;
    visualMesh.position.set(0, COIN_RADIUS, 0);
    
    group.add(hitbox);
    group.add(visualMesh);
    
    const coinMeshData: CoinMeshData = {
      group,
      hitbox,
      visualMesh,
      material,
      animationState: {
        isCollected: false,
        progress: 0,
        coinPosition: new THREE.Vector3(),
        currentPosition: new THREE.Vector3(),
        rotation: 0,
        scale: 1,
        opacity: 1,
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

    const coinSystem = getCoinSystem();
    const currentCoins = coinSystem.getCoins();
    const currentCoinIds = new Set(currentCoins.map(c => c.id));
    const existingCoinIds = new Set(coinMeshes.current.keys());

    // Add new coins
    for (const coin of currentCoins) {
      if (!existingCoinIds.has(coin.id)) {
        const coinMeshData = createCoinMesh(coin.id);
        coinMeshes.current.set(coin.id, coinMeshData);
        groupRef.current.add(coinMeshData.group);
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
    for (const [coinId, coinMeshData] of coinMeshes.current.entries()) {
      const { group, material, animationState: anim } = coinMeshData;
      
      // Set visibility
      group.visible = visible;

      // Initialize coin position once
      if (!anim.initialized) {
        const coin = coinSystem.getCoin(coinId);
        if (!coin) continue;

        anim.coinPosition.set(coin.position.x, coin.position.y, coin.position.z);
        anim.currentPosition.copy(anim.coinPosition);
        anim.initialized = true;
        group.position.copy(anim.coinPosition);
      }

      // Update rotation
      const spinSpeed = anim.isCollected ? 0.15 : 0.02;
      anim.rotation += spinSpeed;
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
          const upDistance = viewHeight * 0.4;
          const leftOffset = viewWidth * 0.1;
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

        // Update scale and opacity
        anim.scale = 1 - anim.progress * 0.5;
        anim.opacity = 1 - Math.pow(anim.progress, 2);

        // Update mesh transforms
        group.position.copy(anim.currentPosition);
        group.scale.setScalar(anim.scale);
        material.opacity = anim.opacity;
        material.transparent = true;

        // Check if animation is complete
        if (anim.progress >= 1) {
          removeCoinMesh(coinId);
        }
      }
    }
  });

  return <group ref={groupRef} />;
};