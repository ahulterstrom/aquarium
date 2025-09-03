// Utility functions for placement and rotation

import { useUIStore } from "@/stores/uiStore";

/**
 * Gets the rotated dimensions for a tank based on its rotation angle
 * @param gridWidth - Original width
 * @param gridDepth - Original depth
 * @param rotation - Rotation angle in degrees (0, 90, 180, 270)
 * @returns Rotated dimensions {width, depth}
 */
export function getRotatedDimensions(
  gridWidth: number,
  gridDepth: number,
  rotation: number,
): { width: number; depth: number } {
  // Normalize rotation to 0-270 range
  const normalizedRotation = ((rotation % 360) + 360) % 360;

  // For 90 and 270 degree rotations, swap width and depth
  if (normalizedRotation === 90 || normalizedRotation === 270) {
    return { width: gridDepth, depth: gridWidth };
  }

  // For 0 and 180 degree rotations, keep original dimensions
  return { width: gridWidth, depth: gridDepth };
}

/**
 * Converts rotation angle to Y-axis rotation for Three.js
 * @param rotation - Rotation angle in degrees
 * @returns Y-axis rotation in radians
 */
export function rotationToRadians(rotation: number): number {
  return (rotation * Math.PI) / 180;
}

/**
 * Gets the visual rotation for tank models
 * Tank models may need different rotation mapping than placement logic
 * @param rotation - Placement rotation in degrees
 * @returns Model rotation in radians
 */
export function getTankModelRotation(rotation: number): number {
  return rotationToRadians(rotation);
}

/**
 * Checks if the user is currently placing a tank
 * @returns True if placing a tank, false otherwise
 */
export function getIsPlacing() {
  const placementMode = useUIStore.getState().placementMode;
  return (
    placementMode === "moveTank" ||
    placementMode === "tank" ||
    placementMode === "entrance"
  );
}
