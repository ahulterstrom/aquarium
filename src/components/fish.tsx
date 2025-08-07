import { useGameStore } from "@/stores/gameStore";
import { useRef, useState, useCallback } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { getFishSystem } from "@/components/systems/fishSystem";
import { Fish } from "@/types/game.types";

const FishMesh = ({ fishId }: { fishId: string }) => {
  const meshRef = useRef<THREE.Group>(null);
  const bodyMaterialRef = useRef<THREE.MeshLambertMaterial>(null);

  // Get fish color based on species
  const getFishColor = (speciesId: string) => {
    switch (speciesId) {
      case "goldfish":
        return 0xffd700; // Gold
      case "neon_tetra":
        return 0x00bfff; // Blue with neon-like color
      case "angelfish":
        return 0xc0c0c0; // Silver
      case "clownfish":
        return 0xff4500; // Orange-red
      default:
        return 0x888888; // Gray
    }
  };

  // Get fish scale based on size
  const getFishScale = (size: string) => {
    switch (size) {
      case "small":
        return 0.8;
      case "medium":
        return 1.0;
      case "large":
        return 1.3;
      default:
        return 1.0;
    }
  };

  // Update fish position and appearance imperatively every frame
  useFrame(() => {
    if (!meshRef.current) return;

    const fishSystem = getFishSystem();
    const fish = fishSystem.getFish(fishId);

    if (!fish) {
      // Fish doesn't exist, hide the mesh
      meshRef.current.visible = false;
      return;
    }

    // Show the mesh
    meshRef.current.visible = true;

    // Update position
    meshRef.current.position.copy(fish.position);

    // Update rotation to face movement direction
    if (fish.velocity.length() > 0.01) {
      const direction = fish.velocity.clone().normalize();
      // Fish model faces +X by default, so we calculate rotation accordingly
      const targetRotation = Math.atan2(direction.z, direction.x);

      // Smooth rotation interpolation
      const currentRotation = meshRef.current.rotation.y;
      let rotationDiff = targetRotation - currentRotation;

      // Handle rotation wrapping
      if (rotationDiff > Math.PI) rotationDiff -= 2 * Math.PI;
      if (rotationDiff < -Math.PI) rotationDiff += 2 * Math.PI;

      meshRef.current.rotation.y += rotationDiff * 0.1; // Smooth rotation
    }

    // Update material color based on species
    if (bodyMaterialRef.current) {
      const baseColor = getFishColor(fish.species.id);
      bodyMaterialRef.current.color.setHex(baseColor);

      // Modify color based on fish state
      let opacity = 1.0;
      if (fish.behaviorState === "resting") {
        opacity = 0.8; // Slightly transparent when resting
      }
      if (fish.health < 0.5) {
        // Desaturate color when unhealthy
        bodyMaterialRef.current.color.lerp(new THREE.Color(0x666666), 0.3);
      }
      bodyMaterialRef.current.opacity = opacity;
      bodyMaterialRef.current.transparent = opacity < 1.0;
    }

    // Scale based on species size and health
    const baseScale = getFishScale(fish.species.size);
    const healthScale = 0.7 + fish.health * 0.3; // Scale from 0.7 to 1.0 based on health
    const finalScale = baseScale * healthScale;
    meshRef.current.scale.setScalar(finalScale);

    // Add subtle animation based on behavior
    const time = Date.now() * 0.001;
    let animationOffset = 0;

    if (fish.behaviorState === "feeding") {
      // Bob up and down while feeding
      animationOffset = Math.sin(time * 4) * 0.05;
    } else if (fish.behaviorState === "schooling") {
      // Slight side-to-side movement when schooling
      animationOffset = Math.sin(time * 3) * 0.02;
    }

    meshRef.current.position.y += animationOffset;
  });

  return (
    <group ref={meshRef} rotation={[0, 0, 0]}>
      {/* Fish body */}
      <mesh>
        <sphereGeometry args={[0.15, 8, 6]} />
        <meshLambertMaterial ref={bodyMaterialRef} color={0x888888} />
      </mesh>

      {/* Fish tail */}
      <mesh position={[-0.2, 0, 0]} rotation={[0, 0, Math.PI / 6]}>
        <coneGeometry args={[0.08, 0.15, 4]} />
        <meshLambertMaterial color={0x666666} />
      </mesh>

      {/* Fish fins */}
      <mesh position={[0, -0.08, 0]} rotation={[0, 0, Math.PI / 2]}>
        <coneGeometry args={[0.04, 0.1, 3]} />
        <meshLambertMaterial color={0x666666} />
      </mesh>
      <mesh position={[0, 0.08, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <coneGeometry args={[0.04, 0.1, 3]} />
        <meshLambertMaterial color={0x666666} />
      </mesh>

      {/* Eyes */}
      <mesh position={[0.1, 0.05, 0.08]}>
        <sphereGeometry args={[0.02, 6, 6]} />
        <meshLambertMaterial color={0x000000} />
      </mesh>
      <mesh position={[0.1, 0.05, -0.08]}>
        <sphereGeometry args={[0.02, 6, 6]} />
        <meshLambertMaterial color={0x000000} />
      </mesh>
    </group>
  );
};

export const FishRenderer = () => {
  const [fishIds, setFishIds] = useState<string[]>([]);

  // Update fish list periodically
  useFrame((state, delta) => {
    const frameCount = state.clock.elapsedTime;
    if (frameCount % 0.5 < delta) {
      // Check for new/removed fish every 0.5 seconds
      const fishSystem = getFishSystem();
      const currentFish = fishSystem.getAllFish();
      const currentIds = currentFish.map((f) => f.id);

      // Only update React state if the fish list changed
      if (
        currentIds.length !== fishIds.length ||
        !currentIds.every((id) => fishIds.includes(id))
      ) {
        setFishIds(currentIds);
      }
    }
  });

  return (
    <>
      {fishIds.map((fishId) => (
        <FishMesh key={fishId} fishId={fishId} />
      ))}
    </>
  );
};
