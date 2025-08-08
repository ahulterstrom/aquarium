import * as THREE from "three";
import { Fish, FishBehaviorState, Tank } from "../types/game.types";
import { nanoid } from "nanoid";

export class FishSystem {
  private fish: Map<string, Fish>;
  private tanks: Map<string, Tank>;
  private lastUpdate: number;

  constructor() {
    this.fish = new Map();
    this.tanks = new Map();
    this.lastUpdate = Date.now();
  }

  /**
   * Update references from game state
   */
  updateReferences(tanks: Map<string, Tank>) {
    this.tanks = tanks;
  }

  /**
   * Add a fish to the system
   */
  addFish(fish: Fish): void {
    // Initialize behavior properties if not present
    const fishWithBehavior: Fish = {
      ...fish,
      targetPosition: fish.targetPosition || null,
      behaviorState: fish.behaviorState || "swimming",
      behaviorTimer: fish.behaviorTimer || 0,
      swimSpeed: fish.swimSpeed || this.getSpeciesSwimSpeed(fish.species.id),
      schoolingTarget: fish.schoolingTarget || null,
      lastFedTime: fish.lastFedTime || Date.now(),
    };

    this.fish.set(fish.id, fishWithBehavior);
  }

  /**
   * Remove a fish from the system
   */
  removeFish(fishId: string): void {
    this.fish.delete(fishId);
  }

  /**
   * Get all fish
   */
  getAllFish(): Fish[] {
    return Array.from(this.fish.values());
  }

  /**
   * Get fish in a specific tank
   */
  getFishInTank(tankId: string): Fish[] {
    return Array.from(this.fish.values()).filter(fish => fish.tankId === tankId);
  }

  /**
   * Get a specific fish by ID
   */
  getFish(fishId: string): Fish | undefined {
    return this.fish.get(fishId);
  }

  /**
   * Main update loop - call this every frame
   */
  update(deltaTime: number): void {
    const currentTime = Date.now();
    
    for (const fish of this.fish.values()) {
      this.updateFish(fish, deltaTime, currentTime);
    }
    
    this.lastUpdate = currentTime;
  }

  /**
   * Update individual fish behavior and movement
   */
  private updateFish(fish: Fish, deltaTime: number, currentTime: number): void {
    const tank = this.tanks.get(fish.tankId);
    if (!tank) return;

    // Update behavior timer
    fish.behaviorTimer += deltaTime;

    // Update fish state based on current behavior
    switch (fish.behaviorState) {
      case "idle":
        this.handleIdleState(fish, deltaTime);
        break;
      case "swimming":
        this.handleSwimmingState(fish, deltaTime, tank);
        break;
      case "feeding":
        this.handleFeedingState(fish, deltaTime);
        break;
      case "schooling":
        this.handleSchoolingState(fish, deltaTime);
        break;
      case "resting":
        this.handleRestingState(fish, deltaTime);
        break;
    }

    // Apply movement
    this.updateMovement(fish, deltaTime, tank);

    // Update hunger over time
    this.updateHunger(fish, deltaTime, currentTime);
  }

  private handleIdleState(fish: Fish, deltaTime: number): void {
    // After some idle time, start swimming
    if (fish.behaviorTimer > 1000 + Math.random() * 2000) { // 1-3 seconds
      this.transitionToState(fish, "swimming");
    }
  }

  private handleSwimmingState(fish: Fish, deltaTime: number, tank: Tank): void {
    // Set random target if we don't have one or reached current target
    if (!fish.targetPosition || this.isNearTarget(fish, fish.targetPosition, 0.3)) {
      fish.targetPosition = this.getRandomPositionInTank(tank);
    }

    // Occasionally transition to other states
    if (fish.behaviorTimer > 3000 + Math.random() * 5000) { // 3-8 seconds
      const rand = Math.random();
      if (rand < 0.3 && fish.hunger > 0.7) {
        this.transitionToState(fish, "feeding");
      } else if (rand < 0.5 && fish.species.schooling) {
        this.transitionToState(fish, "schooling");
      } else if (rand < 0.7) {
        this.transitionToState(fish, "idle");
      } else {
        this.transitionToState(fish, "resting");
      }
    }
  }

  private handleFeedingState(fish: Fish, deltaTime: number): void {
    // Move to surface for feeding
    const tank = this.tanks.get(fish.tankId);
    if (tank && !fish.targetPosition) {
      fish.targetPosition = new THREE.Vector3(
        fish.position.x,
        tank.position.y + 0.8, // Near surface
        fish.position.z
      );
    }

    // Reduce hunger while feeding
    fish.hunger = Math.max(0, fish.hunger - deltaTime / 2000);

    // Stop feeding after a while or when full
    if (fish.behaviorTimer > 2000 || fish.hunger < 0.3) {
      this.transitionToState(fish, "swimming");
    }
  }

  private handleSchoolingState(fish: Fish, deltaTime: number): void {
    // Find other fish of same species to school with
    if (!fish.schoolingTarget) {
      const schoolmates = this.getFishInTank(fish.tankId).filter(f => 
        f.id !== fish.id && 
        f.species.id === fish.species.id &&
        f.species.schooling
      );
      
      if (schoolmates.length > 0) {
        fish.schoolingTarget = schoolmates[Math.floor(Math.random() * schoolmates.length)].id;
      }
    }

    if (fish.schoolingTarget) {
      const target = this.fish.get(fish.schoolingTarget);
      if (target) {
        // Follow the target fish with some offset
        const offset = new THREE.Vector3(
          (Math.random() - 0.5) * 0.5,
          (Math.random() - 0.5) * 0.3,
          (Math.random() - 0.5) * 0.5
        );
        fish.targetPosition = target.position.clone().add(offset);
      }
    }

    // Stop schooling after a while
    if (fish.behaviorTimer > 5000 + Math.random() * 5000) { // 5-10 seconds
      fish.schoolingTarget = null;
      this.transitionToState(fish, "swimming");
    }
  }

  private handleRestingState(fish: Fish, deltaTime: number): void {
    // Stay near bottom and move slowly
    const tank = this.tanks.get(fish.tankId);
    if (tank && !fish.targetPosition) {
      fish.targetPosition = new THREE.Vector3(
        tank.position.x * 2 + (Math.random() - 0.5) * 1.5,
        tank.position.y + 0.2, // Near bottom
        tank.position.z * 2 + (Math.random() - 0.5) * 1.5
      );
    }

    // Rest for a while
    if (fish.behaviorTimer > 3000 + Math.random() * 4000) { // 3-7 seconds
      this.transitionToState(fish, "swimming");
    }
  }

  private updateMovement(fish: Fish, deltaTime: number, tank: Tank): void {
    if (!fish.targetPosition) return;

    // Calculate direction to target
    const direction = fish.targetPosition.clone().sub(fish.position);
    const distance = direction.length();

    if (distance > 0.1) {
      direction.normalize();

      // Apply speed based on behavior
      let speed = fish.swimSpeed;
      if (fish.behaviorState === "resting") speed *= 0.3;
      if (fish.behaviorState === "feeding") speed *= 0.6;
      if (fish.behaviorState === "schooling") speed *= 1.2;

      // Update velocity with some smoothing
      const targetVelocity = direction.multiplyScalar(speed);
      fish.velocity.lerp(targetVelocity, 0.1);
    } else {
      // Slow down when near target
      fish.velocity.multiplyScalar(0.9);
    }

    // Apply movement
    fish.position.add(fish.velocity.clone().multiplyScalar(deltaTime / 1000));

    // Keep fish within tank bounds
    this.constrainToTank(fish, tank);
  }

  private updateHunger(fish: Fish, deltaTime: number, currentTime: number): void {
    // Increase hunger over time
    const hungerRate = 1.0 / (fish.species.feedingInterval * 1000); // Convert to per millisecond
    fish.hunger = Math.min(1, fish.hunger + hungerRate * deltaTime);
  }

  private transitionToState(fish: Fish, newState: FishBehaviorState): void {
    fish.behaviorState = newState;
    fish.behaviorTimer = 0;
    
    // Clear target when transitioning (except for feeding and schooling)
    if (newState !== "feeding" && newState !== "schooling") {
      fish.targetPosition = null;
    }
  }

  private isNearTarget(fish: Fish, target: THREE.Vector3, threshold: number): boolean {
    return fish.position.distanceTo(target) < threshold;
  }

  private getRandomPositionInTank(tank: Tank): THREE.Vector3 {
    // Calculate random position within tank bounds
    const baseX = tank.position.x * 2;
    const baseZ = tank.position.z * 2;
    
    // Scale random range based on tank grid dimensions
    // Handle legacy tanks that don't have grid dimensions
    const xRange = (tank.gridWidth || 1) * 1.4; // 1.4 units per grid cell
    const zRange = (tank.gridDepth || 1) * 1.4;
    
    return new THREE.Vector3(
      baseX + (Math.random() - 0.5) * xRange,
      tank.position.y + 0.3 + Math.random() * 0.6, // Mid-water
      baseZ + (Math.random() - 0.5) * zRange
    );
  }

  private constrainToTank(fish: Fish, tank: Tank): void {
    // Calculate bounds based on tank grid dimensions
    const baseX = tank.position.x * 2;
    const baseZ = tank.position.z * 2;
    
    // For multi-cell tanks, adjust bounds to cover all grid cells
    // Handle legacy tanks that don't have grid dimensions
    const gridWidth = tank.gridWidth || 1;
    const gridDepth = tank.gridDepth || 1;
    
    const tankBounds = {
      minX: baseX - 0.7,
      maxX: baseX + (gridWidth * 2) - 1.3, // Account for grid width
      minY: tank.position.y + 0.1,
      maxY: tank.position.y + 0.9,
      minZ: baseZ - 0.7,
      maxZ: baseZ + (gridDepth * 2) - 1.3, // Account for grid depth
    };

    // Constrain position
    fish.position.x = Math.max(tankBounds.minX, Math.min(tankBounds.maxX, fish.position.x));
    fish.position.y = Math.max(tankBounds.minY, Math.min(tankBounds.maxY, fish.position.y));
    fish.position.z = Math.max(tankBounds.minZ, Math.min(tankBounds.maxZ, fish.position.z));

    // Bounce velocity if hitting walls
    if (fish.position.x <= tankBounds.minX || fish.position.x >= tankBounds.maxX) {
      fish.velocity.x *= -0.5;
    }
    if (fish.position.y <= tankBounds.minY || fish.position.y >= tankBounds.maxY) {
      fish.velocity.y *= -0.5;
    }
    if (fish.position.z <= tankBounds.minZ || fish.position.z >= tankBounds.maxZ) {
      fish.velocity.z *= -0.5;
    }
  }

  private getSpeciesSwimSpeed(speciesId: string): number {
    // Different species have different swim speeds
    switch (speciesId) {
      case "neon_tetra": return 0.8;
      case "angelfish": return 0.6;
      case "goldfish": return 0.5;
      case "clownfish": return 0.7;
      default: return 0.6;
    }
  }

  /**
   * Feed fish in a specific tank
   */
  feedFish(tankId: string): void {
    const tankFish = this.getFishInTank(tankId);
    for (const fish of tankFish) {
      if (fish.hunger > 0.3) {
        this.transitionToState(fish, "feeding");
        fish.lastFedTime = Date.now();
      }
    }
  }

  /**
   * Get fish system statistics
   */
  getStats() {
    const totalFish = this.fish.size;
    const fishByTank = new Map<string, number>();
    
    for (const fish of this.fish.values()) {
      fishByTank.set(fish.tankId, (fishByTank.get(fish.tankId) || 0) + 1);
    }

    return {
      totalFish,
      fishByTank,
    };
  }
}