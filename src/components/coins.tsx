import { useGameStore } from "@/stores/gameStore";
import { useRef, useState, useCallback } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { getCoinSystem } from "@/components/systems/coinSystem";

const CoinMesh = ({
  coinId,
  onClick,
  onAnimationComplete,
}: {
  coinId: string;
  onClick: (coinId: string) => void;
  onAnimationComplete?: (coinId: string) => void;
}) => {
  const meshRef = useRef<THREE.Group>(null);
  const { camera } = useThree();

  // Animation state stored in refs for performance
  const animationState = useRef({
    isCollected: false,
    progress: 0,
    coinPosition: new THREE.Vector3(),
    currentPosition: new THREE.Vector3(),
    rotation: 0,
    scale: 1,
    opacity: 1,
    initialized: false,
  });

  const handleHover = useCallback(
    (e: THREE.Event<PointerEvent>) => {
      if (animationState.current.isCollected) return;
      e.stopPropagation();
      document.body.style.cursor = "default";
      animationState.current.isCollected = true;
      onClick(coinId);
    },
    [coinId, onClick],
  );

  useFrame((_, delta) => {
    if (!meshRef.current) return;

    const anim = animationState.current;

    // Initialize coin position once
    if (!anim.initialized) {
      const coinSystem = getCoinSystem();
      const coin = coinSystem.getCoin(coinId);
      if (!coin) return;

      anim.coinPosition.set(
        coin.position.x,
        coin.position.y + 0.1,
        coin.position.z,
      );
      anim.currentPosition.copy(anim.coinPosition);
      anim.initialized = true;

      // Set initial position
      meshRef.current.position.copy(anim.coinPosition);
    }

    // Update rotation
    const spinSpeed = anim.isCollected ? 0.15 : 0.02;
    anim.rotation += spinSpeed;
    meshRef.current.rotation.y = anim.rotation;

    // Handle collection animation
    if (anim.isCollected) {
      // Progress animation (0 to 1 over ~1 second)
      anim.progress = Math.min(anim.progress + delta * 1.5, 1);

      // Calculate target position dynamically based on current camera
      if ((camera as any).isOrthographicCamera) {
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
        const leftOffset = viewWidth * 0.1; // 10% of screen width to the left
        const targetPosition = cameraWorldPos.clone();
        targetPosition.addScaledVector(cameraUp, upDistance);
        targetPosition.addScaledVector(cameraRight, -leftOffset);

        // Interpolate position with easing
        const easedProgress = 1 - Math.pow(1 - anim.progress, 3); // Cubic ease out
        anim.currentPosition.lerpVectors(
          anim.coinPosition,
          targetPosition,
          easedProgress,
        );
      }

      // Update scale and opacity
      anim.scale = 1 - anim.progress * 0.5; // Scale down to 0.5
      anim.opacity = 1 - Math.pow(anim.progress, 2); // Fade out quadratically

      // Update mesh
      meshRef.current.position.copy(anim.currentPosition);
      meshRef.current.scale.setScalar(anim.scale);

      // Update material opacity
      const mesh = meshRef.current.children[0] as THREE.Mesh;
      if (mesh && mesh.material) {
        const material = mesh.material as THREE.MeshLambertMaterial;
        material.opacity = anim.opacity;
        material.transparent = true;
      }

      // Check if animation is complete
      if (anim.progress >= 1 && onAnimationComplete) {
        onAnimationComplete(coinId);
      }
    }
  });

  return (
    <>
      <group
        ref={meshRef}
        onPointerEnter={handleHover}
        onPointerLeave={() => {
          if (!animationState.current.isCollected) {
            document.body.style.cursor = "default";
          }
        }}
      >
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.16, 0.16, 0.08, 12]} />
          <meshLambertMaterial color={0xffd700} />
        </mesh>
      </group>
    </>
  );
};

export const Coins = () => {
  const [coinIds, setCoinIds] = useState<string[]>([]);
  const [animatingCoins, setAnimatingCoins] = useState<Set<string>>(new Set());
  const addMoney = useGameStore.use.addMoney();

  const handleCoinClick = useCallback(
    (coinId: string) => {
      const coinSystem = getCoinSystem();
      const coin = coinSystem.collectCoin(coinId);

      if (coin) {
        addMoney(coin.value);
        console.log(`Collected coin worth ${coin.value}`);
        // Add to animating set to keep it rendered during animation
        setAnimatingCoins((prev) => new Set(prev).add(coinId));
      }
    },
    [addMoney],
  );

  const handleAnimationComplete = useCallback((coinId: string) => {
    // Remove from both animating set and coinIds when animation completes
    setAnimatingCoins((prev) => {
      const next = new Set(prev);
      next.delete(coinId);
      return next;
    });
    setCoinIds((prev) => prev.filter((id) => id !== coinId));
  }, []);

  // Update coin list periodically
  useFrame((state, delta) => {
    const frameCount = state.clock.elapsedTime;
    if (frameCount % 0.5 < delta) {
      // Check for new/removed coins every 0.5 seconds
      const coinSystem = getCoinSystem();
      const currentCoins = coinSystem.getCoins();
      const currentIds = currentCoins.map((c) => c.id);

      // Only update React state if the coin list changed
      if (
        currentIds.length !== coinIds.length ||
        !currentIds.every((id) => coinIds.includes(id))
      ) {
        setCoinIds(currentIds);
      }
    }
  });

  // Combine coinIds with animatingCoins to keep coins visible during animation
  const allVisibleCoins = [
    ...new Set([...coinIds, ...Array.from(animatingCoins)]),
  ];

  return (
    <>
      {allVisibleCoins.map((coinId) => (
        <CoinMesh
          key={coinId}
          coinId={coinId}
          onClick={handleCoinClick}
          onAnimationComplete={handleAnimationComplete}
        />
      ))}
    </>
  );
};
