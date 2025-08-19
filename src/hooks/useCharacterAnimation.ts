import { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { CharacterAnimations } from "@/types/character.types";
import { VisitorState } from "@/types/game.types";

interface UseCharacterAnimationProps {
  animations: Map<string, THREE.AnimationClip> | null;
  animationNames: CharacterAnimations;
}

// Map visitor states to animation names
const getAnimationForState = (
  state: VisitorState,
  isMoving: boolean,
  animationNames: CharacterAnimations,
): string => {
  // Map states to animations based on behavior
  switch (state) {
    case "entering":
    case "exploring":
    case "travelingToPoi":
    case "satisfied":
    case "leaving":
      // These states should use walking animation
      return animationNames.walk;

    case "thinking":
    case "viewing":
      // These states should use idle animation
      return animationNames.viewing || animationNames.idle;

    default:
      // Fallback to idle
      return animationNames.idle;
  }
};

export const useCharacterAnimation = ({
  animations,
  animationNames,
}: UseCharacterAnimationProps) => {
  const mixerRef = useRef<THREE.AnimationMixer | null>(null);
  const actionsRef = useRef<Map<string, THREE.AnimationAction>>(new Map());
  const currentActionRef = useRef<THREE.AnimationAction | null>(null);
  const [isAnimationReady, setIsAnimationReady] = useState(false);

  // Initialize animation mixer
  const initializeMixer = useCallback(
    (model: THREE.Group) => {
      if (!animations || animations.size === 0) {
        console.warn("No animations available for model");
        return;
      }

      // Create mixer
      mixerRef.current = new THREE.AnimationMixer(model);

      // Create actions for all animations
      animations.forEach((clip, name) => {
        const action = mixerRef.current!.clipAction(clip);
        actionsRef.current.set(name, action);
      });

      setIsAnimationReady(true);

      // Start with idle animation or first available animation
      const idleAnimation = animationNames.idle;
      if (actionsRef.current.has(idleAnimation)) {
        const idleAction = actionsRef.current.get(idleAnimation)!;
        idleAction.reset();
        idleAction.play();
        currentActionRef.current = idleAction;
        console.log(`Started idle animation: ${idleAnimation}`);
      } else {
        // Fallback to first available animation
        const availableAnimations = Array.from(actionsRef.current.keys());
        if (availableAnimations.length > 0) {
          console.warn(
            `Idle animation "${idleAnimation}" not found, starting with: ${availableAnimations[0]}`,
          );
          const fallbackAction = actionsRef.current.get(
            availableAnimations[0],
          )!;
          fallbackAction.reset();
          fallbackAction.play();
          currentActionRef.current = fallbackAction;
        } else {
          console.error("No animations available to start");
        }
      }
    },
    [animations, animationNames],
  );

  // Play animation with transition
  const playAnimation = useCallback((animationName: string, fadeTime = 0.3) => {
    if (!mixerRef.current) {
      console.warn("No mixer available for animation");
      return;
    }

    if (!actionsRef.current.has(animationName)) {
      console.warn(
        `Animation "${animationName}" not found. Available animations:`,
        Array.from(actionsRef.current.keys()),
      );
      return;
    }

    const newAction = actionsRef.current.get(animationName)!;

    // If same animation is already playing, do nothing
    if (currentActionRef.current === newAction && newAction.isRunning()) {
      return;
    }

    // Reset and play new animation
    newAction.reset();
    newAction.play();

    // Crossfade if there's a current animation
    if (currentActionRef.current && currentActionRef.current !== newAction) {
      currentActionRef.current.crossFadeTo(newAction, fadeTime, true);
    } else {
      newAction.fadeIn(fadeTime);
    }

    currentActionRef.current = newAction;
  }, []);

  // Imperative function to update animation based on current state
  const updateAnimation = useCallback((visitorState: VisitorState, isMoving: boolean) => {
    if (!isAnimationReady) return;

    const targetAnimation = getAnimationForState(
      visitorState,
      isMoving,
      animationNames,
    );

    // Try the target animation first, then fallback to any available animation
    if (actionsRef.current.has(targetAnimation)) {
      playAnimation(targetAnimation);
    } else {
      // Fallback to first available animation
      const availableAnimations = Array.from(actionsRef.current.keys());
      if (availableAnimations.length > 0) {
        console.warn(
          `Animation "${targetAnimation}" not found, using fallback: ${availableAnimations[0]}`,
        );
        playAnimation(availableAnimations[0]);
      }
    }
  }, [isAnimationReady, animationNames, playAnimation]);

  // Update mixer every frame
  useFrame((_, delta) => {
    if (mixerRef.current) {
      mixerRef.current.update(delta);
    }
  });

  // Cleanup
  useEffect(() => {
    return () => {
      if (mixerRef.current) {
        mixerRef.current.stopAllAction();

        // Clear all actions
        actionsRef.current.forEach((action) => {
          action.stop();
        });
        actionsRef.current.clear();
      }
    };
  }, []);

  return {
    initializeMixer,
    updateAnimation,
    mixer: mixerRef.current,
    isAnimationReady,
  };
};
