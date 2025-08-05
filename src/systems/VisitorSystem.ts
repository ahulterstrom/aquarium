import * as THREE from "three";
import {
  Visitor,
  VisitorState,
  Tank,
  Entrance,
  GridPosition,
  VisitorInterests,
  VisitorPreferences,
  GridCell,
} from "../types/game.types";
import { generateVisitorName } from "../utils/nameGenerator";
import { WaypointSystem } from "../utils/waypointSystem";
import { nanoid } from "nanoid";
import { GridStore as GridStoreInterface } from "../stores/gridStore";

export class VisitorSystem {
  private visitors: Map<string, Visitor>;
  private tanks: Map<string, Tank>;
  private entrances: Map<string, Entrance>;
  private gridStore: GridStoreInterface;
  private waypointSystem: WaypointSystem;
  private currentWaypoints: Map<string, string> = new Map(); // visitorId -> waypointId

  constructor(gridStore: GridStoreInterface) {
    this.visitors = new Map();
    this.tanks = new Map();
    this.entrances = new Map();
    this.gridStore = gridStore;
    this.waypointSystem = new WaypointSystem(
      { width: gridStore.gridSize.width, depth: gridStore.gridSize.depth },
      gridStore,
    );
  }

  // Update references from game state
  updateReferences(tanks: Map<string, Tank>, entrances: Map<string, Entrance>) {
    this.tanks = tanks;
    this.entrances = entrances;

    // Regenerate waypoints when tanks change
    this.waypointSystem.generateWaypoints(tanks);
  }

  // Create a new visitor with random interests
  createVisitor(entryEntranceId: string): Visitor {
    const entrance = this.entrances.get(entryEntranceId);
    if (!entrance) {
      throw new Error(`Entrance ${entryEntranceId} not found`);
    }

    const visitorId = `visitor_${nanoid()}`;

    // Generate random gender
    const gender: "male" | "female" = Math.random() < 0.5 ? "male" : "female";

    // Generate random interests
    const interests: VisitorInterests = {
      fishTypes: this.generateRandomFishInterests(),
      tankSizes: this.generateRandomSizePreferences(),
      decorationTypes: [], // Future use
    };

    // Generate random preferences
    const preferences: VisitorPreferences = {
      viewingTime: { min: 4000, max: 8000 }, // 4-8 seconds viewing time
      walkingSpeed: 0.5 + Math.random() * 0.5, // 0.5-1.0 speed
      satisfactionThreshold: Math.floor(60 + Math.random() * 40), // 60-100 satisfaction needed
    };

    const visitor: Visitor = {
      id: visitorId,
      name: generateVisitorName(gender),
      gender,
      position: new THREE.Vector3(
        entrance.position.x * 2,
        0.5,
        entrance.position.z * 2,
      ),
      velocity: new THREE.Vector3(0, 0, 0),

      state: "entering",
      targetPosition: null,
      targetTankId: null,
      currentPath: null,
      pathIndex: 0,

      interests,
      satisfaction: 0,
      maxSatisfaction: preferences.satisfactionThreshold,

      preferences,
      stateTimer: 0,
      totalVisitTime: 0,

      // Future features (initialized)
      money: 10 + Math.random() * 20, // $10-30 spending money
      happiness: 50 + Math.random() * 30, // Start moderately happy
      patience: 30000 + Math.random() * 60000, // 30-90 seconds patience
      moneySpent: 0,

      thoughts: [],
      tanksVisited: [],
      entryEntranceId,
    };

    this.visitors.set(visitorId, visitor);
    return visitor;
  }

  // Main update loop - call this every frame
  update(deltaTime: number) {
    for (const visitor of Array.from(this.visitors.values())) {
      this.updateVisitor(visitor, deltaTime);
    }
  }

  private updateVisitor(visitor: Visitor, deltaTime: number) {
    visitor.stateTimer += deltaTime;
    visitor.totalVisitTime += deltaTime;

    // Update position based on velocity
    visitor.position.add(
      visitor.velocity.clone().multiplyScalar(deltaTime / 1000),
    );

    switch (visitor.state) {
      case "entering":
        this.handleEnteringState(visitor, deltaTime);
        break;
      case "exploring":
        this.handleExploringState(visitor, deltaTime);
        break;
      case "viewing":
        this.handleViewingState(visitor, deltaTime);
        break;
      case "satisfied":
        this.handleSatisfiedState(visitor, deltaTime);
        break;
      case "leaving":
        this.handleLeavingState(visitor, deltaTime);
        break;
    }
  }

  private handleEnteringState(visitor: Visitor, deltaTime: number) {
    // Move away from entrance into the aquarium
    if (!visitor.targetPosition) {
      // Find a central exploration waypoint to move to
      const waypoint = this.waypointSystem.findBestWaypoint(
        visitor.position,
        visitor.interests,
        visitor.tanksVisited,
        "exploration",
      );

      if (waypoint) {
        visitor.targetPosition = waypoint.position.clone();
        this.currentWaypoints.set(visitor.id, waypoint.id);
      } else {
        // Fallback to center
        visitor.targetPosition = new THREE.Vector3(
          ((this.gridStore.gridSize.width - 1) * 2) / 2,
          0.5,
          ((this.gridStore.gridSize.depth - 1) * 2) / 2,
        );
      }
    }

    this.updateVisitorMovement(visitor, deltaTime);

    // Check if close to target or enough time has passed
    if (this.isAtTarget(visitor) || visitor.stateTimer > 3000) {
      this.transitionToState(visitor, "exploring");
    }
  }

  private handleExploringState(visitor: Visitor, deltaTime: number) {
    // Look for interesting waypoints or continue to current target
    if (!visitor.targetPosition) {
      // First try to find a viewing waypoint for tanks we haven't seen
      let waypoint = this.waypointSystem.findBestWaypoint(
        visitor.position,
        visitor.interests,
        visitor.tanksVisited,
        "viewing",
      );

      // If no interesting viewing spots, find exploration waypoint
      if (!waypoint) {
        waypoint = this.waypointSystem.findBestWaypoint(
          visitor.position,
          visitor.interests,
          visitor.tanksVisited,
          "exploration",
        );
      }

      if (waypoint) {
        visitor.targetPosition = waypoint.position.clone();
        this.currentWaypoints.set(visitor.id, waypoint.id);

        // If it's a viewing waypoint, prepare to transition to viewing
        if (waypoint.type === "viewing" && waypoint.associatedTankId) {
          visitor.targetTankId = waypoint.associatedTankId;
        }
      } else {
        // Transition to leaving
        visitor.thoughts.push("I couldn't find anything interesting...");
        this.transitionToState(visitor, "leaving");
      }
    }

    // Use steering behaviors for movement
    this.updateVisitorMovement(visitor, deltaTime);

    // Check if we've reached our waypoint
    if (this.isAtTarget(visitor)) {
      const waypointId = this.currentWaypoints.get(visitor.id);
      if (waypointId) {
        const waypoint = this.waypointSystem.getWaypoint(waypointId);
        if (waypoint) {
          this.waypointSystem.markWaypointVisited(waypointId);

          // If this is a viewing waypoint, transition to viewing
          if (waypoint.type === "viewing" && waypoint.associatedTankId) {
            this.transitionToState(visitor, "viewing");
            return;
          }
        }
      }

      // Clear target to find a new one
      visitor.targetPosition = null;
      this.currentWaypoints.delete(visitor.id);
    }

    // If we've been exploring too long or reached satisfaction, time to leave
    if (
      visitor.satisfaction >= visitor.maxSatisfaction ||
      visitor.stateTimer > 15000
    ) {
      this.transitionToState(visitor, "satisfied");
    }
  }

  private handleViewingState(visitor: Visitor, deltaTime: number) {
    // Stop moving and look at the tank
    visitor.velocity.set(0, 0, 0);

    const tank = visitor.targetTankId
      ? this.tanks.get(visitor.targetTankId)
      : null;
    if (tank) {
      // Calculate satisfaction gain from this tank
      const satisfactionGain = this.calculateSatisfactionGain(
        visitor,
        tank,
        deltaTime,
      );
      visitor.satisfaction = Math.min(
        visitor.satisfaction + satisfactionGain,
        visitor.maxSatisfaction,
      );

      // Add to visited tanks
      if (!visitor.tanksVisited.includes(tank.id)) {
        visitor.tanksVisited.push(tank.id);
      }
    }

    // After viewing for a while, go back to exploring or leave if satisfied
    const viewingTime = visitor.preferences.viewingTime;
    const minViewTime =
      viewingTime.min + Math.random() * (viewingTime.max - viewingTime.min);

    if (visitor.stateTimer > minViewTime) {
      if (visitor.satisfaction >= visitor.maxSatisfaction) {
        this.transitionToState(visitor, "satisfied");
      } else {
        this.transitionToState(visitor, "exploring");
      }
    }
  }

  private handleSatisfiedState(visitor: Visitor, deltaTime: number) {
    // Head to the nearest entrance
    if (!visitor.targetPosition) {
      const nearestEntrance = this.findNearestEntrance(visitor);
      if (nearestEntrance) {
        visitor.targetPosition = new THREE.Vector3(
          nearestEntrance.position.x * 2,
          0.5,
          nearestEntrance.position.z * 2,
        );
      }
    }

    this.updateVisitorMovement(visitor, deltaTime);

    // Only transition to leaving when we're close to the entrance or timeout
    if (this.isAtTarget(visitor) || visitor.stateTimer > 10000) {
      this.transitionToState(visitor, "leaving");
    }
  }

  private handleLeavingState(visitor: Visitor, deltaTime: number) {
    // Make sure we still have a target (the entrance position)
    if (!visitor.targetPosition) {
      const nearestEntrance = this.findNearestEntrance(visitor);
      if (nearestEntrance) {
        // Move slightly beyond the entrance to simulate exiting
        const entrancePos = new THREE.Vector3(
          nearestEntrance.position.x * 2,
          0.5,
          nearestEntrance.position.z * 2,
        );

        // Determine exit direction based on entrance edge
        const exitOffset = new THREE.Vector3(0, 0, 0);
        switch (nearestEntrance.edge) {
          case "north":
            exitOffset.set(0, 0, -1.5); // Exit north
            break;
          case "south":
            exitOffset.set(0, 0, 1.5); // Exit south
            break;
          case "east":
            exitOffset.set(1.5, 0, 0); // Exit east
            break;
          case "west":
            exitOffset.set(-1.5, 0, 0); // Exit west
            break;
        }

        visitor.targetPosition = entrancePos.add(exitOffset);
      }
    }

    this.updateVisitorMovement(visitor, deltaTime);

    // Remove visitor when they reach the exit or timeout
    if (this.isAtTarget(visitor) || visitor.stateTimer > 15000) {
      this.removeVisitor(visitor.id);
    }
  }

  private updateVisitorMovement(visitor: Visitor, deltaTime: number) {
    if (!visitor.targetPosition) return;

    // Convert current position to grid coordinates
    const currentGridPos = this.worldToGrid(visitor.position);
    const targetGridPos = this.worldToGrid(visitor.targetPosition);

    // Check if we need to calculate or recalculate the path
    const needsNewPath =
      !visitor.currentPath ||
      visitor.currentPath.length === 0 ||
      visitor.pathIndex === undefined ||
      visitor.pathIndex >= visitor.currentPath.length;

    if (needsNewPath) {
      // Check if both positions are valid before pathfinding
      const startWalkable = this.gridStore.isWalkable(currentGridPos.x, currentGridPos.y, currentGridPos.z);
      const endWalkable = this.gridStore.isWalkable(targetGridPos.x, targetGridPos.y, targetGridPos.z);
      
      console.log(`Pathfinding for visitor ${visitor.id}:`);
      console.log(`  From: ${JSON.stringify(currentGridPos)} (walkable: ${startWalkable})`);
      console.log(`  To: ${JSON.stringify(targetGridPos)} (walkable: ${endWalkable})`);
      
      if (!startWalkable || !endWalkable) {
        console.warn(`Cannot pathfind - start or end position not walkable`);
        // Fall back to direct movement
        this.moveDirectlyToTarget(visitor, deltaTime);
        return;
      }
      
      // Calculate A* path to target with timeout protection
      try {
        const startTime = Date.now();
        const path = this.gridStore.findPath(currentGridPos, targetGridPos);
        const endTime = Date.now();
        
        if (endTime - startTime > 100) {
          console.warn(`Pathfinding took ${endTime - startTime}ms - too long!`);
        }
        
        if (path && path.length > 0) {
          visitor.currentPath = path;
          visitor.pathIndex = 0;
          console.log(`Generated path: ${path.length} nodes`);
        } else {
          console.warn(`No path found - using direct movement`);
          this.moveDirectlyToTarget(visitor, deltaTime);
          return;
        }
      } catch (error) {
        console.error(`Pathfinding error:`, error);
        this.moveDirectlyToTarget(visitor, deltaTime);
        return;
      }
    }

    // Follow the A* path
    this.followPath(visitor, deltaTime);
  }

  private followPath(visitor: Visitor, deltaTime: number) {
    if (!visitor.currentPath || visitor.currentPath.length === 0) return;

    // Initialize path index if needed
    if (visitor.pathIndex === undefined) visitor.pathIndex = 0;

    // Get current target node from path
    const currentTargetNode = visitor.currentPath[visitor.pathIndex];
    if (!currentTargetNode) return;

    // Convert grid position to world position
    const targetWorldPos = this.gridToWorld(currentTargetNode);
    const distance = visitor.position.distanceTo(targetWorldPos);

    // Check if we've reached the current node
    if (distance < 0.3) {
      visitor.pathIndex++;

      // Check if we've reached the end of the path
      if (visitor.pathIndex >= visitor.currentPath.length) {
        visitor.currentPath = null;
        visitor.pathIndex = 0;
        visitor.velocity.set(0, 0, 0);
        return;
      }

      // Move to next node
      const nextNode = visitor.currentPath[visitor.pathIndex];
      const nextWorldPos = this.gridToWorld(nextNode);
      const direction = nextWorldPos.clone().sub(visitor.position).normalize();
      visitor.velocity = direction.multiplyScalar(
        visitor.preferences.walkingSpeed,
      );
    } else {
      // Move toward current target node
      const direction = targetWorldPos
        .clone()
        .sub(visitor.position)
        .normalize();
      visitor.velocity = direction.multiplyScalar(
        visitor.preferences.walkingSpeed,
      );
    }

    // Apply movement
    visitor.position.add(
      visitor.velocity.clone().multiplyScalar(deltaTime / 1000),
    );
  }

  private moveDirectlyToTarget(visitor: Visitor, deltaTime: number) {
    if (!visitor.targetPosition) return;

    const direction = visitor.targetPosition.clone().sub(visitor.position);
    const distance = direction.length();

    if (distance > 0.1) {
      direction.normalize();
      visitor.velocity = direction.multiplyScalar(
        visitor.preferences.walkingSpeed,
      );
      visitor.position.add(
        visitor.velocity.clone().multiplyScalar(deltaTime / 1000),
      );
    } else {
      visitor.velocity.set(0, 0, 0);
    }
  }

  private worldToGrid(worldPos: THREE.Vector3): GridPosition {
    return {
      x: Math.round(worldPos.x / 2),
      y: 0, // Always ground level for now
      z: Math.round(worldPos.z / 2),
    };
  }

  private gridToWorld(gridPos: GridPosition): THREE.Vector3 {
    return new THREE.Vector3(gridPos.x * 2, 0.5, gridPos.z * 2);
  }

  private isAtTarget(visitor: Visitor): boolean {
    if (!visitor.targetPosition) return false;
    return visitor.position.distanceTo(visitor.targetPosition) < 0.1;
  }

  private transitionToState(visitor: Visitor, newState: VisitorState) {
    const previousTarget = visitor.targetPosition;

    visitor.state = newState;
    visitor.stateTimer = 0;

    // For leaving state, preserve the target position (entrance)
    if (newState !== "leaving") {
      visitor.targetPosition = null;
    } else {
      // Keep the current target (should be the entrance) for leaving state
      visitor.targetPosition = previousTarget;
    }

    visitor.targetTankId = null;

    // Clear pathfinding data when changing states
    visitor.currentPath = null;
    visitor.pathIndex = 0;

    // Clean up waypoint tracking
    this.currentWaypoints.delete(visitor.id);
  }

  private calculateSatisfactionGain(
    visitor: Visitor,
    tank: Tank,
    deltaTime: number,
  ): number {
    let satisfactionRate = 5; // Base satisfaction per second

    // Bonus for tank size preference
    if (visitor.interests.tankSizes.includes(tank.size)) {
      satisfactionRate *= 1.5;
    }

    // Bonus for water quality
    satisfactionRate *= tank.waterQuality;

    // Bonus for fish count (more interesting)
    satisfactionRate *= 1 + tank.fishIds.length * 0.1;

    return satisfactionRate * (deltaTime / 1000);
  }

  private findNearestEntrance(visitor: Visitor): Entrance | null {
    let nearestEntrance: Entrance | null = null;
    let nearestDistance = Infinity;

    for (const entrance of Array.from(this.entrances.values())) {
      const entrancePos = new THREE.Vector3(
        entrance.position.x * 2,
        0.5,
        entrance.position.z * 2,
      );
      const distance = visitor.position.distanceTo(entrancePos);

      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestEntrance = entrance;
      }
    }

    return nearestEntrance;
  }

  private generateRandomFishInterests(): string[] {
    const allSpecies = ["goldfish", "neon_tetra", "angelfish", "clownfish"];
    const interestCount = 1 + Math.floor(Math.random() * 3); // 1-3 interests

    const interests: string[] = [];
    for (let i = 0; i < interestCount; i++) {
      const species = allSpecies[Math.floor(Math.random() * allSpecies.length)];
      if (!interests.includes(species)) {
        interests.push(species);
      }
    }

    return interests;
  }

  private generateRandomSizePreferences(): ("small" | "medium" | "large")[] {
    const sizes: ("small" | "medium" | "large")[] = [
      "small",
      "medium",
      "large",
    ];
    const preferenceCount = 1 + Math.floor(Math.random() * 2); // 1-2 size preferences

    const result: ("small" | "medium" | "large")[] = [];
    for (let i = 0; i < preferenceCount; i++) {
      const size = sizes[Math.floor(Math.random() * sizes.length)];
      if (!result.includes(size)) {
        result.push(size);
      }
    }

    return result;
  }

  // Public interface methods
  spawnVisitor(entranceId: string): Visitor | null {
    if (!this.entrances.has(entranceId)) return null;
    return this.createVisitor(entranceId);
  }

  removeVisitor(visitorId: string) {
    this.visitors.delete(visitorId);
    this.currentWaypoints.delete(visitorId);
  }

  getVisitors(): Visitor[] {
    return Array.from(this.visitors.values());
  }

  getVisitorCount(): number {
    return this.visitors.size;
  }
}
