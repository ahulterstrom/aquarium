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
import { POISystem } from "../utils/poiSystem";
import { PathSmoother } from "../utils/pathSmoothing";
import { nanoid } from "nanoid";
import { GridStore as GridStoreInterface } from "../stores/gridStore";
import { CoinSystem } from "./CoinSystem";
import { generateWeightedSkinTone } from "../utils/skinTones";
import { hairColorGenerator } from "../utils/hairColorGenerator";

// Consistent floor height for all visitor positions
export const FLOOR_HEIGHT = 0;

export class VisitorSystem {
  private visitors: Map<string, Visitor>;
  private tanks: Map<string, Tank>;
  private entrances: Map<string, Entrance>;
  private gridStore: GridStoreInterface;
  private poiSystem: POISystem;
  private pathSmoother: PathSmoother;
  private coinSystem: CoinSystem;
  private totalVisitorsCreated: number = 0;
  private satisfiedVisitors: number = 0;

  constructor(gridStore: GridStoreInterface, coinSystem: CoinSystem) {
    this.visitors = new Map();
    this.tanks = new Map();
    this.entrances = new Map();
    this.gridStore = gridStore;
    this.poiSystem = new POISystem(gridStore);
    this.pathSmoother = new PathSmoother(gridStore);
    this.coinSystem = coinSystem;
  }

  // Update references from game state
  updateReferences(tanks: Map<string, Tank>, entrances: Map<string, Entrance>) {
    this.tanks = tanks;
    this.entrances = entrances;

    // Update POIs when tanks change
    this.poiSystem.updatePOIs(tanks);
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

    // Generate age first as it affects hair color generation
    const age = Math.floor(Math.random() * 60) + 18; // Random age between 18 and 77

    // Generate skin tone and hair color with age consideration
    const skinTone = generateWeightedSkinTone();
    const hairColor = hairColorGenerator.generate({
      age,
      variation: true,
      seed: visitorId, // Use visitor ID for deterministic hair color
    });

    const visitor: Visitor = {
      id: visitorId,
      name: generateVisitorName(gender),
      gender,
      age,
      skinTone: skinTone.id,
      hairColor: hairColor.id,
      position: new THREE.Vector3(
        entrance.position.x * 2,
        FLOOR_HEIGHT,
        entrance.position.z * 2,
      ),
      velocity: new THREE.Vector3(0, 0, 0),

      state: "entering",
      targetPosition: null,
      targetPOIId: null,
      currentPath: null,
      smoothPath: null,
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
    this.totalVisitorsCreated++;
    return visitor;
  }

  // Main update loop - call this every frame
  update(deltaTime: number) {
    for (const visitor of Array.from(this.visitors.values())) {
      this.updateVisitor(visitor, deltaTime);
    }

    // Update coin system for auto-despawn
    this.coinSystem.update(Date.now());
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
      case "thinking":
        this.handleThinkingState(visitor, deltaTime);
        break;
      case "travelingToPoi":
        this.handleTravelingToPoiState(visitor, deltaTime);
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
      // Get a random exploration position to move to
      visitor.targetPosition = this.poiSystem.getRandomExplorationPosition();
    }

    this.updateVisitorMovement(visitor, deltaTime);

    // Check if close to target or enough time has passed
    if (this.isAtTarget(visitor) || visitor.stateTimer > 3000) {
      this.transitionToState(visitor, "thinking");
    }
  }

  private handleExploringState(visitor: Visitor, deltaTime: number) {
    // Navigate to target position
    if (!visitor.targetPosition) {
      // Get a random exploration position
      visitor.targetPosition = this.poiSystem.getRandomExplorationPosition();
    }

    this.updateVisitorMovement(visitor, deltaTime);

    // Check if we've reached our target
    if (this.isAtTarget(visitor)) {
      // Enter thinking state to decide what to do next
      this.transitionToState(visitor, "thinking");
    }

    // If we've been exploring too long or reached satisfaction, time to leave
    if (
      visitor.satisfaction >= visitor.maxSatisfaction ||
      visitor.stateTimer > 15000
    ) {
      this.transitionToState(visitor, "satisfied");
    }
  }

  private handleThinkingState(visitor: Visitor, deltaTime: number) {
    // Stop moving and think for 1-2 seconds
    visitor.velocity.set(0, 0, 0);

    // Set thinking duration when first entering this state
    if (!visitor.thinkingDuration) {
      visitor.thinkingDuration = 1000 + Math.random() * 1000; // 1-2 seconds
    }

    // After thinking time, decide what to do next
    if (visitor.stateTimer > visitor.thinkingDuration) {
      console.log("Done thinking");
      // Random choice between exploring and viewing a POI
      if (Math.random() < 0.3) {
        console.log("Choosing to explore");
        // Choose to explore
        this.transitionToState(visitor, "exploring");
      } else {
        // console.log("Choosing to view a POI");
        // Choose to visit a POI
        const poi = this.poiSystem.getRandomPOI();
        if (poi) {
          // Calculate viewing position for this POI
          const viewingPosition = this.poiSystem.calculateViewingPosition(poi);
          if (viewingPosition) {
            visitor.targetPosition = viewingPosition;
            visitor.targetPOIId = poi.id;
            this.transitionToState(visitor, "travelingToPoi");
          } else {
            // If no valid viewing position, go explore instead
            console.warn(
              "No valid viewing position for POI, switching to exploring",
            );
            this.transitionToState(visitor, "exploring");
          }
        } else {
          // No POIs available, go explore
          // console.warn("No POIs available, switching to exploring");
          this.transitionToState(visitor, "exploring");
        }
      }
    }
  }

  private handleTravelingToPoiState(visitor: Visitor, deltaTime: number) {
    // Navigate to the POI viewing position
    if (!visitor.targetPosition) {
      // No target position, go back to thinking
      console.error(
        "No target position for traveling to POI, switching to thinking",
      );
      this.transitionToState(visitor, "thinking");
      return;
    }

    this.updateVisitorMovement(visitor, deltaTime);

    // Check if we've reached our viewing position
    if (this.isAtTarget(visitor)) {
      // Now check if we're close enough to the POI to view it
      if (visitor.targetPOIId) {
        const poi = this.poiSystem
          .getPOIs()
          .find((p) => p.id === visitor.targetPOIId);
        if (
          poi &&
          this.poiSystem.isWithinViewingDistance(visitor.position, poi)
        ) {
          // We're at the viewing position and close enough to the POI
          this.transitionToState(visitor, "viewing");
        } else {
          console.error(
            `POI ${visitor.targetPOIId} not found or not close enough to view`,
          );
          // Something went wrong, go back to thinking
          this.transitionToState(visitor, "thinking");
        }
      } else {
        console.error(
          "No target POI ID set when transitioning to viewing state",
        );
        // No POI target, go back to thinking
        this.transitionToState(visitor, "thinking");
      }
    }

    // Timeout protection - if we've been traveling too long, give up
    if (visitor.stateTimer > 10000) {
      // 10 seconds
      this.transitionToState(visitor, "thinking");
    }
  }

  private handleViewingState(visitor: Visitor, deltaTime: number) {
    // We should already be at the viewing position and have a POI
    if (!visitor.targetPOIId) {
      // No POI to view, go back to thinking
      this.transitionToState(visitor, "thinking");
      return;
    }

    // Stop moving and look at the POI
    visitor.velocity.set(0, 0, 0);

    const poi = this.poiSystem
      .getPOIs()
      .find((p) => p.id === visitor.targetPOIId);
    if (!poi) {
      // POI doesn't exist anymore, go back to thinking
      this.transitionToState(visitor, "thinking");
      return;
    }

    if (poi.type === "tank") {
      const tank = poi.object as Tank;
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

    // After viewing for a while, go back to thinking
    const viewingTime = visitor.preferences.viewingTime;
    const minViewTime =
      viewingTime.min + Math.random() * (viewingTime.max - viewingTime.min);

    if (visitor.stateTimer > minViewTime) {
      if (visitor.satisfaction >= visitor.maxSatisfaction) {
        this.transitionToState(visitor, "satisfied");
      } else {
        this.transitionToState(visitor, "thinking");
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
          FLOOR_HEIGHT,
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
          FLOOR_HEIGHT,
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

    // Check if we're already at the target grid position - no pathfinding needed
    if (
      currentGridPos.x === targetGridPos.x &&
      currentGridPos.z === targetGridPos.z
    ) {
      // Move directly to the exact target position
      this.moveDirectlyToTarget(visitor, deltaTime);
      return;
    }

    // Check if we need to calculate or recalculate the path
    const needsNewPath =
      !visitor.smoothPath ||
      visitor.smoothPath.length === 0 ||
      visitor.pathIndex === undefined ||
      visitor.pathIndex >= visitor.smoothPath.length;

    if (needsNewPath) {
      // Check if both positions are valid before pathfinding
      const startWalkable = this.gridStore.isWalkable(
        currentGridPos.x,
        currentGridPos.y,
        currentGridPos.z,
      );
      const endWalkable = this.gridStore.isWalkable(
        targetGridPos.x,
        targetGridPos.y,
        targetGridPos.z,
      );

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
          // Generate smoothed path from grid path
          visitor.smoothPath = this.pathSmoother.smoothPath(path);
          visitor.pathIndex = 0;
          // console.log(
          //   `Generated path: ${path.length} grid nodes, ${visitor.smoothPath.length} smooth points`,
          // );
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
    if (!visitor.smoothPath || visitor.smoothPath.length === 0) return;

    // Initialize path index if needed
    if (visitor.pathIndex === undefined) visitor.pathIndex = 0;

    // Get current target point from smoothed path
    const currentTargetPoint = visitor.smoothPath[visitor.pathIndex];
    if (!currentTargetPoint) return;

    const distance = visitor.position.distanceTo(currentTargetPoint);

    // Check if we've reached the current point (smaller threshold for smoother movement)
    if (distance < 0.2) {
      visitor.pathIndex++;

      // Check if we've reached the end of the path
      if (visitor.pathIndex >= visitor.smoothPath.length) {
        visitor.smoothPath = null;
        visitor.currentPath = null;
        visitor.pathIndex = 0;

        // Gradually stop instead of instant stop
        const deceleration = 4.0; // Units per second²
        const maxVelocityChange = deceleration * (deltaTime / 1000);

        if (visitor.velocity.length() > maxVelocityChange) {
          const stopDirection = visitor.velocity
            .clone()
            .normalize()
            .multiplyScalar(-maxVelocityChange);
          visitor.velocity.add(stopDirection);
        } else {
          visitor.velocity.set(0, 0, 0);
        }
        return;
      }
    }

    // Move toward current target point
    const direction = currentTargetPoint
      .clone()
      .sub(visitor.position)
      .normalize();
    const targetVelocity = direction.multiplyScalar(
      visitor.preferences.walkingSpeed,
    );

    // Smooth acceleration/deceleration
    const acceleration = 3.0; // Units per second²
    const maxVelocityChange = acceleration * (deltaTime / 1000);

    const velocityDiff = targetVelocity.clone().sub(visitor.velocity);
    if (velocityDiff.length() > maxVelocityChange) {
      velocityDiff.normalize().multiplyScalar(maxVelocityChange);
    }

    visitor.velocity.add(velocityDiff);

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
      const targetVelocity = direction.multiplyScalar(
        visitor.preferences.walkingSpeed,
      );

      // Smooth acceleration/deceleration
      const acceleration = 3.0; // Units per second²
      const maxVelocityChange = acceleration * (deltaTime / 1000);

      const velocityDiff = targetVelocity.clone().sub(visitor.velocity);
      if (velocityDiff.length() > maxVelocityChange) {
        velocityDiff.normalize().multiplyScalar(maxVelocityChange);
      }

      visitor.velocity.add(velocityDiff);

      visitor.position.add(
        visitor.velocity.clone().multiplyScalar(deltaTime / 1000),
      );
    } else {
      // Gradually stop when close to target
      const deceleration = 4.0; // Units per second² (faster deceleration)
      const maxVelocityChange = deceleration * (deltaTime / 1000);

      if (visitor.velocity.length() > maxVelocityChange) {
        const stopDirection = visitor.velocity
          .clone()
          .normalize()
          .multiplyScalar(-maxVelocityChange);
        visitor.velocity.add(stopDirection);
      } else {
        visitor.velocity.set(0, 0, 0);
      }
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
    return new THREE.Vector3(gridPos.x * 2, FLOOR_HEIGHT, gridPos.z * 2);
  }

  private isAtTarget(visitor: Visitor): boolean {
    if (!visitor.targetPosition) return false;
    return visitor.position.distanceTo(visitor.targetPosition) < 0.1;
  }

  private transitionToState(visitor: Visitor, newState: VisitorState) {
    const previousState = visitor.state;
    const previousTarget = visitor.targetPosition;

    // Drop coin when leaving viewing state
    if (previousState === "viewing" && newState !== "viewing") {
      this.coinSystem.dropCoin(visitor.position, 1, visitor.id);
    }

    // Track satisfied visitors
    if (newState === "satisfied" && previousState !== "satisfied") {
      this.satisfiedVisitors++;
    }

    visitor.state = newState;
    visitor.stateTimer = 0;

    // For leaving and travelingToPoi states, preserve the target position
    if (newState !== "leaving" && newState !== "travelingToPoi") {
      visitor.targetPosition = null;
    } else {
      // Keep the current target for leaving state (entrance) and travelingToPoi state (viewing position)
      visitor.targetPosition = previousTarget;
    }

    // Clear POI reference unless transitioning to viewing or travelingToPoi state
    if (newState !== "viewing" && newState !== "travelingToPoi") {
      visitor.targetPOIId = null;
    }

    // Clear thinking duration when leaving thinking state
    if (visitor.state === "thinking") {
      visitor.thinkingDuration = undefined;
    }

    // Clear pathfinding data when changing states
    visitor.currentPath = null;
    visitor.smoothPath = null;
    visitor.pathIndex = 0;
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
        FLOOR_HEIGHT,
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

  private generateRandomSizePreferences(): ("medium" | "large" | "huge")[] {
    const sizes: ("medium" | "large" | "huge")[] = ["medium", "large", "huge"];
    const preferenceCount = 1 + Math.floor(Math.random() * 2); // 1-2 size preferences

    const result: ("medium" | "large" | "huge")[] = [];
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
  }

  getVisitors(): Visitor[] {
    return Array.from(this.visitors.values());
  }

  getVisitorCount(): number {
    return this.visitors.size;
  }

  getPOI(id: string) {
    return this.poiSystem.getPOIs().find((poi) => poi.id === id);
  }

  getTotalVisitorsCreated(): number {
    return this.totalVisitorsCreated;
  }

  getSatisfiedVisitorCount(): number {
    return this.satisfiedVisitors;
  }
}
