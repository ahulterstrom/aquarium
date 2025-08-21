import React, { useRef, useEffect, useState, useMemo } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { CharacterModel } from "@/types/character.types";
import { CharacterModelManager } from "@/systems/CharacterModelManager";
import { useCharacterAnimation } from "@/hooks/useCharacterAnimation";
import { getVisitorSystem } from "@/components/systems/visitorSystem";

interface AnimatedCharacterProps {
  visitorId: string;
  characterModel: CharacterModel;
  onClick: (visitorId: string) => void;
}

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

export const AnimatedCharacter: React.FC<AnimatedCharacterProps> = ({
  visitorId,
  characterModel,
  onClick,
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const [modelLoaded, setModelLoaded] = useState(false);
  const modelManager = useMemo(() => CharacterModelManager.getInstance(), []);
  const skinToneRef = useRef<string | undefined>();
  const hairColorRef = useRef<string | undefined>();

  // Get animations for this model
  const animations = useMemo(() => {
    if (!modelLoaded) return null;
    return modelManager.getAnimations(characterModel.id);
  }, [modelLoaded, characterModel.id, modelManager]);

  // Animation hook
  const { initializeMixer, updateAnimation } = useCharacterAnimation({
    animations,
    animationNames: characterModel.animations,
  });

  // Load and setup model
  useEffect(() => {
    let mounted = true;

    const loadModel = async () => {
      try {
        // Get visitor's appearance
        const visitorSystem = getVisitorSystem();
        const visitor = visitorSystem
          .getVisitors()
          .find((v) => v.id === visitorId);
        skinToneRef.current = visitor?.skinTone;
        hairColorRef.current = visitor?.hairColor;

        // Ensure model is loaded
        await modelManager.loadModel(characterModel);

        if (!mounted) return;

        // Create instance with appearance customizations
        const instance = modelManager.createInstance(
          characterModel.id,
          skinToneRef.current,
          hairColorRef.current,
        );
        if (instance && groupRef.current) {
          // Clear existing children
          while (groupRef.current.children.length > 0) {
            groupRef.current.remove(groupRef.current.children[0]);
          }

          // Add the model with a vertical offset to prevent floating
          instance.position.y = 0.12; // Adjust this value to lower/raise the character
          groupRef.current.add(instance);

          setModelLoaded(true);
        }
      } catch (error) {
        console.error(`Failed to load character ${characterModel.id}:`, error);
      }
    };

    loadModel();

    return () => {
      mounted = false;
    };
  }, [characterModel, modelManager, visitorId]);

  // Initialize animations when model is loaded
  useEffect(() => {
    if (
      modelLoaded &&
      groupRef.current &&
      groupRef.current.children.length > 0
    ) {
      const modelInstance = groupRef.current.children[0] as THREE.Group;
      initializeMixer(modelInstance);
    }
  }, [modelLoaded, initializeMixer]);

  // Update visitor data and position every frame
  useFrame(() => {
    if (!groupRef.current) return;

    const visitorSystem = getVisitorSystem();
    const currentVisitor = visitorSystem
      .getVisitors()
      .find((v) => v.id === visitorId);

    if (!currentVisitor) return;

    // Update animation imperatively (no React re-renders)
    const isMoving = currentVisitor.velocity.length() > 0.01;
    updateAnimation(currentVisitor.state, isMoving);

    // Update position
    groupRef.current.position.set(
      currentVisitor.position.x,
      currentVisitor.position.y,
      currentVisitor.position.z,
    );

    // Update rotation to face movement direction or POI
    let targetAngle: number | null = null;

    if (currentVisitor.state === "viewing" && currentVisitor.targetPOIId) {
      // Face the POI when viewing
      const poi = visitorSystem.getPOI(currentVisitor.targetPOIId);
      if (poi) {
        const direction = poi.position.clone().sub(currentVisitor.position);
        if (direction.length() > 0.01) {
          targetAngle = Math.atan2(direction.x, direction.z);
        }
      }
    } else if (currentVisitor.velocity.length() > 0.01) {
      // Face movement direction when moving
      targetAngle = Math.atan2(
        currentVisitor.velocity.x,
        currentVisitor.velocity.z,
      );
    }

    if (targetAngle !== null) {
      const currentAngle = groupRef.current.rotation.y;
      const rotationSpeed =
        currentVisitor.velocity.length() <= 0.05 ? 3.3 : 6.6;
      const factor = Math.min(1.0, rotationSpeed * (1 / 60));
      groupRef.current.rotation.y = lerpAngle(
        currentAngle,
        targetAngle,
        factor,
      );
    }
  });

  // Show loading placeholder if model not ready
  if (!modelLoaded) {
    return (
      <group ref={groupRef}>
        {/* Simple loading indicator - could be a spinner or placeholder mesh */}
        <mesh>
          <boxGeometry args={[0.3, 0.6, 0.2]} />
          <meshBasicMaterial color={0xcccccc} opacity={0.5} transparent />
        </mesh>
      </group>
    );
  }

  return (
    <group
      ref={groupRef}
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
    />
  );
};
