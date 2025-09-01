import * as THREE from "three";
import { Tank, GridPosition } from "../types/game.types";
import { GridStore } from "../stores/gridStore";
import { FLOOR_HEIGHT } from "@/systems/VisitorSystem";

export interface POI {
  id: string;
  type: "tank";
  position: THREE.Vector3;
  object: Tank;
}

export class POISystem {
  private pois: Map<string, POI>;
  private gridStore: GridStore;

  constructor(gridStore: GridStore) {
    this.pois = new Map();
    this.gridStore = gridStore;
  }

  /**
   * Update POIs based on current game state
   */
  updatePOIs(tanks: Map<string, Tank>) {
    // Clear existing POIs
    this.pois.clear();

    // Add tank POIs
    for (const tank of tanks.values()) {
      // For multi-cell tanks, create POI at center of all occupied cells
      const gridWidth = tank.gridWidth || 1;
      const gridDepth = tank.gridDepth || 1;

      // Calculate center position for multi-cell tanks
      const centerX = tank.position.x + (gridWidth - 1) * 0.5;
      const centerZ = tank.position.z + (gridDepth - 1) * 0.5;

      const poi: POI = {
        id: tank.id,
        type: "tank",
        position: new THREE.Vector3(centerX * 2, FLOOR_HEIGHT, centerZ * 2),
        object: tank,
      };
      this.pois.set(poi.id, poi);
    }
  }

  /**
   * Get all POIs of a specific type
   */
  getPOIs(type?: "tank"): POI[] {
    if (type) {
      return Array.from(this.pois.values()).filter((poi) => poi.type === type);
    }
    return Array.from(this.pois.values());
  }

  /**
   * Get a random POI
   */
  getRandomPOI(): POI | null {
    const allPOIs = this.getPOIs();
    if (allPOIs.length === 0) return null;
    return allPOIs[Math.floor(Math.random() * allPOIs.length)];
  }

  /**
   * Calculate a viewing position around a POI (tank)
   * Returns a position within viewing distance in one of the 4 cardinal directions
   * For multi-cell tanks, considers all occupied cells when finding viewing positions
   */
  calculateViewingPosition(poi: POI): THREE.Vector3 | null {
    if (poi.type !== "tank") return null;

    const tank = poi.object;
    const gridWidth = tank.gridWidth || 1;
    const gridDepth = tank.gridDepth || 1;

    // Get all potential viewing positions around the multi-cell tank
    const viewingCandidates: Array<{
      position: GridPosition;
      direction: { x: number; z: number };
    }> = [];

    // Generate viewing positions around the tank's perimeter
    for (let x = tank.position.x; x < tank.position.x + gridWidth; x++) {
      for (let z = tank.position.z; z < tank.position.z + gridDepth; z++) {
        // 4 cardinal directions for each occupied cell
        const directions = [
          { x: 0, z: -1 }, // North
          { x: 1, z: 0 }, // East
          { x: 0, z: 1 }, // South
          { x: -1, z: 0 }, // West
        ];

        for (const direction of directions) {
          const viewingGridPos: GridPosition = {
            x: x + direction.x,
            y: FLOOR_HEIGHT,
            z: z + direction.z,
          };

          // Only add positions that are outside the tank's footprint
          const isOutsideTank =
            viewingGridPos.x < tank.position.x ||
            viewingGridPos.x >= tank.position.x + gridWidth ||
            viewingGridPos.z < tank.position.z ||
            viewingGridPos.z >= tank.position.z + gridDepth;

          if (isOutsideTank) {
            viewingCandidates.push({ position: viewingGridPos, direction });
          }
        }
      }
    }

    // Shuffle candidates to get random viewing positions
    const shuffledCandidates = [...viewingCandidates].sort(
      () => Math.random() - 0.5,
    );

    for (const candidate of shuffledCandidates) {
      const { position: viewingGridPos, direction } = candidate;

      // Check if position is walkable
      if (
        this.gridStore.isWalkable(
          viewingGridPos.x,
          viewingGridPos.y,
          viewingGridPos.z,
        )
      ) {
        const randomDistance = 0.2 + Math.random() * 0.6; // Random offset for viewing position
        const randomSideOffset = Math.random() * 1.8 - 0.9;
        // Convert back to world position and position on the half of tile closer to POI
        const offsetX =
          direction.x > 0
            ? -randomDistance
            : direction.x < 0
              ? randomDistance
              : randomSideOffset;
        const offsetZ =
          direction.z > 0
            ? -randomDistance
            : direction.z < 0
              ? randomDistance
              : randomSideOffset;

        const worldPos = new THREE.Vector3(
          viewingGridPos.x * 2 + offsetX,
          FLOOR_HEIGHT,
          viewingGridPos.z * 2 + offsetZ,
        );

        // console.log(
        //   `Found valid viewing position at grid (${viewingGridPos.x}, ${viewingGridPos.z}), world (${worldPos.x}, ${worldPos.z})`,
        // );
        return worldPos;
      }
    }

    // console.error(
    //   `No valid viewing position found for tank at grid (${tank.position.x}, ${tank.position.z})`,
    // );
    return null;
  }

  /**
   * Get a random walkable exploration position
   */
  getRandomExplorationPosition(): THREE.Vector3 | null {
    const { width, depth } = this.gridStore.gridSize;
    const maxAttempts = 50;

    for (let i = 0; i < maxAttempts; i++) {
      const gridX = Math.floor(Math.random() * width);
      const gridZ = Math.floor(Math.random() * depth);

      const tileX = gridX * 2;
      const tileZ = gridZ * 2;

      if (this.gridStore.isWalkable(gridX, 0, gridZ)) {
        return new THREE.Vector3(
          tileX + Math.random() * 0.5 - 0.25,
          FLOOR_HEIGHT,
          tileZ + Math.random() * 0.5 - 0.25,
        );
      }
    }

    // Fallback to center if no random position found
    console.error(
      "No valid exploration position found, returning center in getRandomExplorationPosition",
    );
    const centerX = Math.floor(width / 2);
    const centerZ = Math.floor(depth / 2);
    return new THREE.Vector3(centerX * 2, FLOOR_HEIGHT, centerZ * 2);
  }

  /**
   * Check if a visitor is close enough to view a POI
   */
  isWithinViewingDistance(visitorPos: THREE.Vector3, poi: POI): boolean {
    const distance = visitorPos.distanceTo(poi.position);
    return distance <= 2.5; // Allow viewing from adjacent tiles (2 units) plus some buffer
  }
}
