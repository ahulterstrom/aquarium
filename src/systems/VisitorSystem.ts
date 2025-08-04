import * as THREE from "three";
import {
  Visitor,
  VisitorState,
  Tank,
  Entrance,
  GridPosition,
  VisitorInterests,
  VisitorPreferences,
} from "../types/game.types";
import { generateVisitorName } from "../utils/nameGenerator";

export class VisitorSystem {
  private visitors: Map<string, Visitor>;
  private tanks: Map<string, Tank>;
  private entrances: Map<string, Entrance>;
  private gridSize: { width: number; depth: number };

  constructor() {
    this.visitors = new Map();
    this.tanks = new Map();
    this.entrances = new Map();
    this.gridSize = { width: 3, depth: 3 };
  }

  // Update references from game state
  updateReferences(tanks: Map<string, Tank>, entrances: Map<string, Entrance>) {
    this.tanks = tanks;
    this.entrances = entrances;
  }

  // Create a new visitor with random interests
  createVisitor(entryEntranceId: string): Visitor {
    const entrance = this.entrances.get(entryEntranceId);
    if (!entrance) {
      throw new Error(`Entrance ${entryEntranceId} not found`);
    }

    const visitorId = `visitor_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;

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
      viewingTime: { min: 2000, max: 5000 }, // 2-5 seconds viewing time
      walkingSpeed: 0.5 + Math.random() * 0.5, // 0.5-1.0 speed
      satisfactionThreshold: 60 + Math.random() * 40, // 60-100 satisfaction needed
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
      // Find a central position to move to
      visitor.targetPosition = new THREE.Vector3(
        ((this.gridSize.width - 1) * 2) / 2,
        0.5,
        ((this.gridSize.depth - 1) * 2) / 2,
      );
    }

    this.moveTowardsTarget(visitor, deltaTime);

    // Check if close to target or enough time has passed
    if (this.isAtTarget(visitor) || visitor.stateTimer > 3000) {
      this.transitionToState(visitor, "exploring");
    }
  }

  private handleExploringState(visitor: Visitor, deltaTime: number) {
    // Look for interesting tanks or wander randomly
    if (!visitor.targetPosition) {
      const interestingTank = this.findInterestingTank(visitor);

      if (interestingTank) {
        // Go view this tank
        visitor.targetTankId = interestingTank.id;
        visitor.targetPosition = new THREE.Vector3(
          interestingTank.position.x * 2,
          0.5,
          interestingTank.position.z * 2 + 1.5, // Stand in front of tank
        );
        this.transitionToState(visitor, "viewing");
      } else {
        // Wander randomly
        visitor.targetPosition = this.getRandomWalkablePosition();
      }
    }

    this.moveTowardsTarget(visitor, deltaTime);

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

    this.moveTowardsTarget(visitor, deltaTime);
    this.transitionToState(visitor, "leaving");
  }

  private handleLeavingState(visitor: Visitor, deltaTime: number) {
    this.moveTowardsTarget(visitor, deltaTime);

    // Remove visitor when they reach the exit
    if (this.isAtTarget(visitor) || visitor.stateTimer > 10000) {
      this.removeVisitor(visitor.id);
    }
  }

  private moveTowardsTarget(visitor: Visitor, deltaTime: number) {
    if (!visitor.targetPosition) return;

    const direction = visitor.targetPosition.clone().sub(visitor.position);
    const distance = direction.length();

    if (distance > 0.1) {
      direction.normalize();
      visitor.velocity = direction.multiplyScalar(
        visitor.preferences.walkingSpeed,
      );
    } else {
      visitor.velocity.set(0, 0, 0);
    }
  }

  private isAtTarget(visitor: Visitor): boolean {
    if (!visitor.targetPosition) return false;
    return visitor.position.distanceTo(visitor.targetPosition) < 0.5;
  }

  private transitionToState(visitor: Visitor, newState: VisitorState) {
    visitor.state = newState;
    visitor.stateTimer = 0;
    visitor.targetPosition = null;
    visitor.targetTankId = null;
  }

  private findInterestingTank(visitor: Visitor): Tank | null {
    let bestTank: Tank | null = null;
    let bestInterestScore = 0;

    for (const tank of Array.from(this.tanks.values())) {
      // Skip tanks already visited
      if (visitor.tanksVisited.includes(tank.id)) continue;

      // Calculate interest score
      let interestScore = 0;

      // Size preference
      if (visitor.interests.tankSizes.includes(tank.size)) {
        interestScore += 30;
      }

      // Fish species interest (would need fish data)
      interestScore += Math.random() * 20; // Random factor for now

      // Water quality bonus
      interestScore += tank.waterQuality * 10;

      if (interestScore > bestInterestScore) {
        bestInterestScore = interestScore;
        bestTank = tank;
      }
    }

    return bestInterestScore > 25 ? bestTank : null; // Minimum interest threshold
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

  private getRandomWalkablePosition(): THREE.Vector3 {
    // Generate random position avoiding tanks
    const attempts = 10;
    while (attempts > 0) {
      const x = Math.random() * (this.gridSize.width - 1) * 2;
      const z = Math.random() * (this.gridSize.depth - 1) * 2;

      // Simple check - avoid tank positions (would need proper collision detection)
      const position = new THREE.Vector3(x, 0.5, z);
      return position; // For now, return any position
    }

    return new THREE.Vector3(2, 0.5, 2); // Fallback to center
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
  }

  getVisitors(): Visitor[] {
    return Array.from(this.visitors.values());
  }

  getVisitorCount(): number {
    return this.visitors.size;
  }
}
