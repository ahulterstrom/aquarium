import { Objective, ObjectiveType } from "../types/game.types";
import { nanoid } from "nanoid";

// Define all objectives with their properties
const OBJECTIVE_DEFINITIONS: Record<
  ObjectiveType,
  Omit<Objective, "id" | "progress" | "completed" | "rewarded">
> = {
  place_entrance: {
    type: "place_entrance",
    title: "Welcome to Aquatopia!",
    description: "Place your aquarium entrance",
    target: 1,
    moneyReward: 10,
    prerequisites: [],
  },
  build_first_tank: {
    type: "build_first_tank",
    title: "Build Your First Tank",
    description: "Place a tank to house your fish",
    target: 1,
    moneyReward: 15,
    prerequisites: ["place_entrance"],
  },
  buy_fish: {
    type: "buy_fish",
    title: "Stock Your Aquarium",
    description: "Buy 2 fish for your tanks",
    target: 2,
    moneyReward: 20,
    prerequisites: ["build_first_tank"],
  },
  earn_money: {
    type: "earn_money",
    title: "First Profits",
    description: "Earn a total of $50",
    target: 50,
    moneyReward: 25,
    prerequisites: ["buy_fish"],
  },
  attract_visitors: {
    type: "attract_visitors",
    title: "Growing Popularity",
    description: "Attract 10 visitors to your aquarium",
    target: 10,
    moneyReward: 30,
    prerequisites: ["buy_fish"],
  },
  satisfy_visitors: {
    type: "satisfy_visitors",
    title: "Happy Customers",
    description: "Have 5 visitors leave satisfied",
    target: 5,
    moneyReward: 35,
    prerequisites: ["attract_visitors"],
  },
  build_multiple_tanks: {
    type: "build_multiple_tanks",
    title: "Expanding the Aquarium",
    description: "Build a total of 3 tanks",
    target: 3,
    moneyReward: 40,
    prerequisites: ["earn_money"],
  },
  expand_aquarium: {
    type: "expand_aquarium",
    title: "More Space",
    description: "Expand your aquarium with 5 new tiles",
    target: 5,
    moneyReward: 50,
    prerequisites: ["build_multiple_tanks"],
  },
};

export class ObjectiveSystem {
  private objectives: Map<string, Objective> = new Map();
  private activeObjectives: string[] = [];
  private completedObjectiveTypes: Set<ObjectiveType> = new Set();
  private onRewardCallback?: (amount: number, objective: Objective) => void;
  private onObjectiveCompleteCallback?: (objective: Objective) => void;

  constructor() {
    // Start with the first objective
    this.addObjective("place_entrance");
  }

  // Set callback for when rewards should be given
  setRewardCallback(callback: (amount: number, objective: Objective) => void) {
    this.onRewardCallback = callback;
  }

  // Set callback for when objectives are completed
  setObjectiveCompleteCallback(callback: (objective: Objective) => void) {
    this.onObjectiveCompleteCallback = callback;
  }

  private addObjective(type: ObjectiveType): void {
    const definition = OBJECTIVE_DEFINITIONS[type];
    if (!definition) return;

    // Check prerequisites
    if (definition.prerequisites && definition.prerequisites.length > 0) {
      const allPrereqsMet = definition.prerequisites.every((prereq) =>
        this.completedObjectiveTypes.has(prereq),
      );
      if (!allPrereqsMet) return;
    }

    // Don't add if already exists
    const existingObjective = Array.from(this.objectives.values()).find(
      (obj) => obj.type === type,
    );
    if (existingObjective) return;

    const objective: Objective = {
      id: `obj_${nanoid()}`,
      ...definition,
      progress: 0,
      completed: false,
      rewarded: false,
    };

    this.objectives.set(objective.id, objective);
    this.activeObjectives.push(objective.id);
  }

  // Update progress for a specific objective type
  updateProgress(type: ObjectiveType, progress: number): void {
    const objective = this.getObjectiveByType(type);
    if (!objective || objective.completed) return;

    objective.progress = Math.min(progress, objective.target);

    // Check if completed
    if (objective.progress >= objective.target && !objective.completed) {
      objective.completed = true;
      this.completedObjectiveTypes.add(objective.type);

      // Trigger completion callback
      if (this.onObjectiveCompleteCallback) {
        this.onObjectiveCompleteCallback(objective);
      }

      // Don't automatically give reward - wait for manual collection

      // Check for new objectives to unlock
      this.checkForNewObjectives();
    }
  }

  // Increment progress by a certain amount
  incrementProgress(type: ObjectiveType, amount: number = 1): void {
    const objective = this.getObjectiveByType(type);
    if (!objective) return;

    this.updateProgress(type, objective.progress + amount);
  }

  private checkForNewObjectives(): void {
    // Check all objective types to see if any new ones can be added
    for (const type of Object.keys(OBJECTIVE_DEFINITIONS) as ObjectiveType[]) {
      this.addObjective(type);
    }
  }

  private getObjectiveByType(type: ObjectiveType): Objective | undefined {
    return Array.from(this.objectives.values()).find(
      (obj) => obj.type === type,
    );
  }

  // Collect reward for a completed objective
  collectReward(objectiveId: string): boolean {
    const objective = this.objectives.get(objectiveId);
    if (!objective || !objective.completed || objective.rewarded) {
      return false;
    }

    objective.rewarded = true;

    // Give reward
    if (this.onRewardCallback) {
      this.onRewardCallback(objective.moneyReward, objective);
    }

    return true;
  }

  // Get all active objectives (not rewarded yet)
  getActiveObjectives(): Objective[] {
    return this.activeObjectives
      .map((id) => this.objectives.get(id))
      .filter((obj): obj is Objective => obj !== undefined)
      .filter((obj) => !obj.rewarded) // Show until rewarded
      .slice(-3); // Show only the 3 most recent
  }

  // Get all objectives
  getAllObjectives(): Objective[] {
    return Array.from(this.objectives.values());
  }

  // Reset system (for new game)
  reset(): void {
    this.objectives.clear();
    this.activeObjectives = [];
    this.completedObjectiveTypes.clear();
    this.addObjective("place_entrance");
  }

  // Save/Load functionality
  serialize(): any {
    return {
      objectives: Array.from(this.objectives.entries()),
      activeObjectives: this.activeObjectives,
      completedObjectiveTypes: Array.from(this.completedObjectiveTypes),
    };
  }

  deserialize(data: any): void {
    if (data.objectives) {
      this.objectives = new Map(data.objectives);
    }
    if (data.activeObjectives) {
      this.activeObjectives = data.activeObjectives;
    }
    if (data.completedObjectiveTypes) {
      this.completedObjectiveTypes = new Set(data.completedObjectiveTypes);
    }
  }
}
