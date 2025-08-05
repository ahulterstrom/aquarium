import * as THREE from "three";
import { Tank, GridPosition } from "../types/game.types";
import { GridStore } from "../stores/gridStore";

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
      const poi: POI = {
        id: `tank_${tank.id}`,
        type: "tank",
        position: new THREE.Vector3(
          tank.position.x * 2,
          0.5,
          tank.position.z * 2,
        ),
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
   */
  calculateViewingPosition(poi: POI): THREE.Vector3 | null {
    if (poi.type !== "tank") return null;

    const tankPos = poi.position;
    const viewingDistance = 1; // Half a tile as specified

    // 4 cardinal directions: North, East, South, West
    const directions = [
      { x: 0, z: -viewingDistance }, // North
      { x: viewingDistance, z: 0 }, // East
      { x: 0, z: viewingDistance }, // South
      { x: -viewingDistance, z: 0 }, // West
    ];

    // Shuffle directions to get random viewing positions
    const shuffledDirections = [...directions].sort(() => Math.random() - 0.5);

    for (const direction of shuffledDirections) {
      const viewingPos = new THREE.Vector3(
        tankPos.x + direction.x,
        0.5,
        tankPos.z + direction.z,
      );

      // Convert to grid coordinates to check if walkable
      const gridPos: GridPosition = {
        x: Math.round(viewingPos.x / 2),
        y: 0,
        z: Math.round(viewingPos.z / 2),
      };

      // Check if position is walkable
      if (this.gridStore.isWalkable(gridPos.x, gridPos.y, gridPos.z)) {
        return viewingPos;
      }
    }

    // If no cardinal direction works, return null
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
          0.5,
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
    return new THREE.Vector3(centerX * 2, 0.5, centerZ * 2);
  }

  /**
   * Check if a visitor is close enough to view a POI
   */
  isWithinViewingDistance(visitorPos: THREE.Vector3, poi: POI): boolean {
    const distance = visitorPos.distanceTo(poi.position);
    return distance <= 1; // Half a tile as specified
  }
}
