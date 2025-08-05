import * as THREE from "three";
import {
  Tank,
  VisitorInterests,
  GridCell,
  GridPosition,
} from "../types/game.types";
import { GridStore as GridStoreInterface } from "../stores/gridStore";
export interface Waypoint {
  id: string;
  position: THREE.Vector3;
  type: "exploration" | "viewing" | "rest";
  associatedTankId?: string;
  interest: number; // Base interest level
  lastVisited: number; // Timestamp of last visitor
  viewingSpots?: THREE.Vector3[]; // Multiple positions for viewing a tank
}

export class WaypointSystem {
  private waypoints: Map<string, Waypoint> = new Map();
  private gridSize: { width: number; depth: number };
  private gridStore: GridStoreInterface;

  constructor(
    gridSize: { width: number; depth: number },
    gridStore: GridStoreInterface,
  ) {
    this.gridSize = gridSize;
    this.gridStore = gridStore;
  }

  /**
   * Generate waypoints for the current aquarium layout
   */
  generateWaypoints(tanks: Map<string, Tank>): void {
    this.waypoints.clear();

    // Generate viewing waypoints for each tank
    for (const tank of Array.from(tanks.values())) {
      this.generateTankViewingWaypoints(tank);
    }

    // Generate exploration waypoints in open areas
    this.generateExplorationWaypoints(tanks);

    // Generate rest waypoints (quiet spots)
    this.generateRestWaypoints(tanks);
  }

  /**
   * Generate viewing positions around a tank
   */
  private generateTankViewingWaypoints(tank: Tank): void {
    const tankPos = new THREE.Vector3(
      tank.position.x * 2,
      0.5,
      tank.position.z * 2,
    );
    const viewingDistance = 1.8; // Distance to stand from tank
    const positions: THREE.Vector3[] = [];

    // Generate positions in front of each side of the tank
    const directions = [
      new THREE.Vector3(0, 0, 1), // South (front)
      new THREE.Vector3(0, 0, -1), // North (back)
      new THREE.Vector3(1, 0, 0), // East (right)
      new THREE.Vector3(-1, 0, 0), // West (left)
    ];

    for (let i = 0; i < directions.length; i++) {
      const direction = directions[i];
      const viewingPos = tankPos
        .clone()
        .add(direction.clone().multiplyScalar(viewingDistance));

      // Check if position is within bounds
      if (this.isPositionValid(viewingPos)) {
        positions.push(viewingPos);

        // Create individual waypoint for each viewing position
        const waypointId = `viewing_${tank.id}_${i}`;
        const waypoint: Waypoint = {
          id: waypointId,
          position: viewingPos,
          type: "viewing",
          associatedTankId: tank.id,
          interest: this.calculateTankInterest(tank),
          lastVisited: 0,
          viewingSpots: [viewingPos],
        };

        this.waypoints.set(waypointId, waypoint);
      }
    }
  }

  /**
   * Generate exploration waypoints in open areas
   */
  private generateExplorationWaypoints(tanks: Map<string, Tank>): void {
    const spacing = 1.5;
    const maxX = (this.gridSize.width - 1) * 2;
    const maxZ = (this.gridSize.depth - 1) * 2;

    for (let x = spacing; x < maxX; x += spacing) {
      for (let z = spacing; z < maxZ; z += spacing) {
        const position = new THREE.Vector3(x, 0.5, z);

        // Check if position is far enough from tanks
        if (this.isPositionValidForExploration(position, tanks)) {
          const waypointId = `exploration_${Math.round(x)}_${Math.round(z)}`;
          const waypoint: Waypoint = {
            id: waypointId,
            position: position,
            type: "exploration",
            interest: 0.3, // Base exploration interest
            lastVisited: 0,
          };

          this.waypoints.set(waypointId, waypoint);
        }
      }
    }
  }

  /**
   * Generate rest waypoints (quiet spots away from tanks)
   */
  private generateRestWaypoints(tanks: Map<string, Tank>): void {
    const corners = [
      new THREE.Vector3(0.5, 0.5, 0.5),
      new THREE.Vector3((this.gridSize.width - 1) * 2 - 0.5, 0.5, 0.5),
      new THREE.Vector3(0.5, 0.5, (this.gridSize.depth - 1) * 2 - 0.5),
      new THREE.Vector3(
        (this.gridSize.width - 1) * 2 - 0.5,
        0.5,
        (this.gridSize.depth - 1) * 2 - 0.5,
      ),
    ];

    for (let i = 0; i < corners.length; i++) {
      const position = corners[i];

      if (this.isPositionValidForExploration(position, tanks, 2.5)) {
        const waypointId = `rest_corner_${i}`;
        const waypoint: Waypoint = {
          id: waypointId,
          position: position,
          type: "rest",
          interest: 0.1, // Low interest, used when tired
          lastVisited: 0,
        };

        this.waypoints.set(waypointId, waypoint);
      }
    }
  }

  /**
   * Find the best waypoint for a visitor based on their interests and current state
   */
  findBestWaypoint(
    currentPosition: THREE.Vector3,
    interests: VisitorInterests,
    visitedTankIds: string[],
    preferredType?: "exploration" | "viewing" | "rest",
  ): Waypoint | null {
    let bestWaypoint: Waypoint | null = null;
    let bestScore = -1;

    for (const waypoint of Array.from(this.waypoints.values())) {
      // Filter by preferred type if specified
      if (preferredType && waypoint.type !== preferredType) continue;

      // Skip if associated tank was already visited
      if (
        waypoint.associatedTankId &&
        visitedTankIds.includes(waypoint.associatedTankId)
      ) {
        continue;
      }

      const score = this.calculateWaypointScore(
        waypoint,
        currentPosition,
        interests,
      );

      if (score > bestScore) {
        bestScore = score;
        bestWaypoint = waypoint;
      }
    }

    return bestWaypoint;
  }

  /**
   * Calculate interest score for a waypoint
   */
  private calculateWaypointScore(
    waypoint: Waypoint,
    currentPosition: THREE.Vector3,
    interests: VisitorInterests,
  ): number {
    let score = waypoint.interest;

    // Distance penalty (closer is better, but not too close)
    const distance = currentPosition.distanceTo(waypoint.position);
    const optimalDistance = 2.0;
    const distancePenalty = Math.abs(distance - optimalDistance) * 0.1;
    score -= distancePenalty;

    // Time since last visited bonus
    const timeSinceVisited = Date.now() - waypoint.lastVisited;
    const freshnesBonus = Math.min(timeSinceVisited / 10000, 0.5); // Max 0.5 bonus after 10 seconds
    score += freshnesBonus;

    // Interest-based bonus for viewing waypoints
    if (waypoint.type === "viewing" && waypoint.associatedTankId) {
      // This would need tank data to check fish species, for now use base interest
      score += 0.3;
    }

    return Math.max(0, score);
  }

  /**
   * Mark a waypoint as visited
   */
  markWaypointVisited(waypointId: string): void {
    const waypoint = this.waypoints.get(waypointId);
    if (waypoint) {
      waypoint.lastVisited = Date.now();
    }
  }

  /**
   * Get all waypoints of a specific type
   */
  getWaypointsByType(type: "exploration" | "viewing" | "rest"): Waypoint[] {
    return Array.from(this.waypoints.values()).filter((wp) => wp.type === type);
  }

  /**
   * Check if a position is within bounds and walkable according to grid
   */
  private isPositionValid(position: THREE.Vector3): boolean {
    // Convert world position to grid position
    const gridX = Math.round(position.x / 2);
    const gridZ = Math.round(position.z / 2);

    // Check bounds
    if (
      gridX < 0 ||
      gridX >= this.gridSize.width ||
      gridZ < 0 ||
      gridZ >= this.gridSize.depth
    ) {
      return false;
    }

    // Check if the grid cell is walkable
    return this.gridStore.isWalkable(gridX, 0, gridZ);
  }

  /**
   * Check if a position is valid for exploration using grid-based logic
   */
  private isPositionValidForExploration(
    position: THREE.Vector3,
    tanks: Map<string, Tank>,
    minDistance: number = 1.3,
  ): boolean {
    // First check if position is walkable according to grid
    if (!this.isPositionValid(position)) return false;

    // Convert to grid coordinates
    const gridX = Math.round(position.x / 2);
    const gridZ = Math.round(position.z / 2);

    // Check surrounding cells to ensure enough space
    const checkRadius = Math.ceil(minDistance / 2); // Convert world distance to grid cells

    for (let dx = -checkRadius; dx <= checkRadius; dx++) {
      for (let dz = -checkRadius; dz <= checkRadius; dz++) {
        const checkX = gridX + dx;
        const checkZ = gridZ + dz;

        // Skip if out of bounds
        if (
          checkX < 0 ||
          checkX >= this.gridSize.width ||
          checkZ < 0 ||
          checkZ >= this.gridSize.depth
        ) {
          continue;
        }

        const cell = this.gridStore.getCell(checkX, 0, checkZ);
        if (cell && (cell.type === "tank" || cell.type === "facility")) {
          const distance = Math.sqrt(dx * dx + dz * dz) * 2; // Convert back to world units
          if (distance < minDistance) {
            return false;
          }
        }
      }
    }

    return true;
  }

  /**
   * Calculate base interest level for a tank
   */
  private calculateTankInterest(tank: Tank): number {
    let interest = 0.5; // Base interest

    // More fish = more interesting
    interest += tank.fishIds.length * 0.1;

    // Better water quality = more interesting
    interest += tank.waterQuality * 0.3;

    // Larger tanks are more impressive
    const sizeMultiplier = { small: 1.0, medium: 1.2, large: 1.5 };
    interest *= sizeMultiplier[tank.size];

    return Math.min(interest, 1.0); // Cap at 1.0
  }

  /**
   * Get waypoint by ID
   */
  getWaypoint(id: string): Waypoint | undefined {
    return this.waypoints.get(id);
  }

  /**
   * Get all waypoints
   */
  getAllWaypoints(): Waypoint[] {
    return Array.from(this.waypoints.values());
  }
}
