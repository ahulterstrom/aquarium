import { AnimatedCharacter } from "@/components/characters/AnimatedCharacter";
import { getVisitorSystem } from "@/components/systems/visitorSystem";
import {
  CHARACTER_MODELS,
  getRandomCharacter,
  PRELOAD_CHARACTERS,
} from "@/lib/constants/characters";
import { useGameStore } from "@/stores/gameStore";
import { useUIStore } from "@/stores/uiStore";
import { CharacterModelManager } from "@/systems/CharacterModelManager";
import { CharacterModel } from "@/types/character.types";
import { useFrame } from "@react-three/fiber";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

// Configuration flag to use animated characters
const USE_ANIMATED_CHARACTERS = true; // Set to false to use simple box visitors

// Helper function to interpolate angles smoothly
function lerpAngle(from: number, to: number, factor: number): number {
  const normalizeAngle = (angle: number) => {
    while (angle > Math.PI) angle -= 2 * Math.PI;
    while (angle < -Math.PI) angle += 2 * Math.PI;
    return angle;
  };

  from = normalizeAngle(from);
  to = normalizeAngle(to);

  let diff = to - from;
  if (diff > Math.PI) diff -= 2 * Math.PI;
  if (diff < -Math.PI) diff += 2 * Math.PI;

  return from + diff * factor;
}

const VisitorMesh = ({
  visitorId,
  onClick,
}: {
  visitorId: string;
  onClick: (visitorId: string) => void;
}) => {
  const meshRef = useRef<THREE.Group>(null);
  const bodyMaterialRef = useRef<THREE.MeshLambertMaterial>(null);
  const leftArmMaterialRef = useRef<THREE.MeshLambertMaterial>(null);
  const rightArmMaterialRef = useRef<THREE.MeshLambertMaterial>(null);
  const orbMaterialRef = useRef<THREE.MeshBasicMaterial>(null);

  // Get color based on visitor state
  const getVisitorColor = (state: string) => {
    switch (state) {
      case "entering":
        return 0x00ff00; // Green - just arrived
      case "exploring":
        return 0xffff00; // Yellow - looking around
      case "thinking":
        return 0x800080; // Purple - deciding what to do
      case "travelingToPoi":
        return 0x00ffff; // Cyan - heading to a POI
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

  // Update position and color imperatively every frame
  useFrame(() => {
    if (!meshRef.current) return;

    const visitorSystem = getVisitorSystem();
    const visitor = visitorSystem.getVisitors().find((v) => v.id === visitorId);

    if (!visitor) return;

    // Update position directly
    meshRef.current.position.set(
      visitor.position.x,
      visitor.position.y,
      visitor.position.z,
    );

    // Update rotation to face movement direction or POI
    let targetAngle: number | null = null;

    if (visitor.state === "viewing" && visitor.targetPOIId) {
      // Face the POI when viewing
      const visitorSystem = getVisitorSystem();
      const poi = visitorSystem.getPOI(visitor.targetPOIId);
      if (poi) {
        const direction = poi.position.clone().sub(visitor.position);
        if (direction.length() > 0.01) {
          targetAngle = Math.atan2(direction.x, direction.z);
        }
      }
    } else if (visitor.velocity.length() > 0.01) {
      // Face movement direction when moving
      targetAngle = Math.atan2(visitor.velocity.x, visitor.velocity.z);
    }

    if (targetAngle !== null) {
      const currentAngle = meshRef.current.rotation.y;

      let rotationSpeed; // Default rotation speed
      if (visitor.velocity.length() <= 0.05) {
        // Smooth rotation when stationary
        rotationSpeed = 3.3; // Radians per second
      } else {
        rotationSpeed = 6.6; // Radians per second
      }
      const factor = Math.min(1.0, rotationSpeed * (1 / 60)); // Assuming 60fps
      meshRef.current.rotation.y = lerpAngle(currentAngle, targetAngle, factor);
    }

    // Update material colors based on state
    const color = getVisitorColor(visitor.state);
    if (bodyMaterialRef.current) {
      bodyMaterialRef.current.color.setHex(color);
    }
    if (leftArmMaterialRef.current) {
      leftArmMaterialRef.current.color.setHex(color);
    }
    if (rightArmMaterialRef.current) {
      rightArmMaterialRef.current.color.setHex(color);
    }
    if (orbMaterialRef.current) {
      orbMaterialRef.current.color.setHex(color);
    }
  });

  return (
    <group
      ref={meshRef}
      onClick={(e) => {
        e.stopPropagation();
        onClick(visitorId);
      }}
      onPointerEnter={(e) => {
        e.stopPropagation();
        document.body.style.cursor = "pointer";
      }}
      onPointerLeave={() => {
        document.body.style.cursor = "default";
      }}
    >
      {/* Body */}
      <mesh>
        <boxGeometry args={[0.3, 0.6, 0.2]} />
        <meshLambertMaterial ref={bodyMaterialRef} color={0x888888} />
      </mesh>

      {/* Head */}
      <mesh position={[0, 0.4, 0]}>
        <sphereGeometry args={[0.12, 8, 8]} />
        <meshLambertMaterial color={0xfdbcb4} />
      </mesh>

      {/* Eyes */}
      <mesh position={[-0.04, 0.45, 0.09]}>
        <sphereGeometry args={[0.03, 6, 6]} />
        <meshLambertMaterial color={0x000000} />
      </mesh>
      <mesh position={[0.04, 0.45, 0.09]}>
        <sphereGeometry args={[0.03, 6, 6]} />
        <meshLambertMaterial color={0x000000} />
      </mesh>

      {/* Arms */}
      <mesh position={[-0.18, 0.13, 0]} rotation={[0, 0, -Math.PI]}>
        <cylinderGeometry args={[0.04, 0.04, 0.25, 6]} />
        <meshLambertMaterial ref={leftArmMaterialRef} color={0x888888} />
      </mesh>
      <mesh position={[0.18, 0.13, 0]} rotation={[0, 0, Math.PI]}>
        <cylinderGeometry args={[0.04, 0.04, 0.25, 6]} />
        <meshLambertMaterial ref={rightArmMaterialRef} color={0x888888} />
      </mesh>

      {/* State indicator (small floating orb) */}
      <mesh position={[0, 0.8, 0]}>
        <sphereGeometry args={[0.05, 6, 6]} />
        <meshBasicMaterial ref={orbMaterialRef} color={0x888888} />
      </mesh>
    </group>
  );
};

interface VisitorWithModel {
  visitorId: string;
  characterModel: CharacterModel | null;
}

export const Visitors = () => {
  const selectVisitor = useUIStore.use.selectVisitor();
  const setVisitorCount = useGameStore.use.setVisitorCount();

  const [visitorsWithModels, setVisitorsWithModels] = useState<
    VisitorWithModel[]
  >([]);
  const modelManager = useMemo(() => CharacterModelManager.getInstance(), []);

  // Preload character models on mount
  useEffect(() => {
    if (USE_ANIMATED_CHARACTERS) {
      const preloadModels = async () => {
        const modelsToPreload = PRELOAD_CHARACTERS.map(
          (id) => CHARACTER_MODELS[id],
        ).filter(Boolean);

        if (modelsToPreload.length > 0) {
          try {
            await modelManager.preloadModels(modelsToPreload);
            console.log(`Preloaded ${modelsToPreload.length} character models`);
          } catch (error) {
            console.error("Failed to preload character models:", error);
          }
        }
      };
      preloadModels();
    }
  }, [modelManager]);

  const handleVisitorClick = useCallback(
    (visitorId: string) => {
      selectVisitor(visitorId);
    },
    [selectVisitor],
  );

  // Track visitor character assignments
  const visitorModelMap = useRef<Map<string, CharacterModel>>(new Map());

  // Only update the visitor list when visitors are added/removed (not every frame)
  useFrame((state, delta) => {
    const frameCount = state.clock.elapsedTime;
    if (frameCount % 1 < delta) {
      // Check for new/removed visitors every 1 second
      const visitorSystem = getVisitorSystem();
      const currentVisitors = visitorSystem.getVisitors();
      setVisitorCount(currentVisitors.length);

      // Build list of visitors with their models
      const newVisitorsWithModels: VisitorWithModel[] = [];
      let needsUpdate = false;

      currentVisitors.forEach((visitor) => {
        // Check if we already have a model assigned
        let model = visitorModelMap.current.get(visitor.id);

        if (!model && USE_ANIMATED_CHARACTERS) {
          // Assign a new character model based on visitor properties
          const randomModel = getRandomCharacter({ gender: visitor.gender });
          if (randomModel) {
            model = randomModel;
            visitorModelMap.current.set(visitor.id, model);
            needsUpdate = true;
          }
        }

        newVisitorsWithModels.push({
          visitorId: visitor.id,
          characterModel: USE_ANIMATED_CHARACTERS ? model || null : null,
        });
      });

      // Clean up removed visitors
      const currentIds = currentVisitors.map((v) => v.id);
      visitorModelMap.current.forEach((_, visitorId) => {
        if (!currentIds.includes(visitorId)) {
          visitorModelMap.current.delete(visitorId);
          needsUpdate = true;
        }
      });

      // Only update React state if the visitor list changed
      if (
        needsUpdate ||
        newVisitorsWithModels.length !== visitorsWithModels.length ||
        !newVisitorsWithModels.every(
          (v, i) => v.visitorId === visitorsWithModels[i]?.visitorId,
        )
      ) {
        setVisitorsWithModels(newVisitorsWithModels);
      }
    }
  });

  return (
    <>
      {visitorsWithModels.map(({ visitorId, characterModel }) =>
        characterModel ? (
          <AnimatedCharacter
            key={visitorId}
            visitorId={visitorId}
            characterModel={characterModel}
            onClick={handleVisitorClick}
          />
        ) : (
          <VisitorMesh
            key={visitorId}
            visitorId={visitorId}
            onClick={handleVisitorClick}
          />
        ),
      )}
    </>
  );
};
