import { Objective, ObjectiveType } from "../types/game.types";
import { nanoid } from "nanoid";
import { OBJECTIVE_DEFINITIONS } from "../lib/constants";

export class ObjectiveSystem {
  private objectives: Map<string, Objective> = new Map();
  private completedObjectiveTypes: Set<ObjectiveType> = new Set();
  private onRewardCallback?: (amount: number, objective: Objective) => void;
  private onObjectiveCompleteCallback?: (objective: Objective) => void;

  constructor() {
    // Create all objectives at initialization
    for (const type of Object.keys(OBJECTIVE_DEFINITIONS) as ObjectiveType[]) {
      this.addObjective(type);
    }
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
    }
  }

  // Increment progress by a certain amount
  incrementProgress(type: ObjectiveType, amount: number = 1): void {
    const objective = this.getObjectiveByType(type);
    if (!objective) return;

    this.updateProgress(type, objective.progress + amount);
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
    // Define the order of objectives
    const objectiveOrder: ObjectiveType[] = [
      "place_entrance",
      "build_first_tank",
      "buy_fish",
      "earn_money",
      "attract_visitors",
      "satisfy_visitors",
      "build_multiple_tanks",
      "expand_aquarium",
    ];

    // Get all objectives and sort by their defined order
    const allObjectives = Array.from(this.objectives.values());
    const sortedObjectives = allObjectives.sort((a, b) => {
      const aIndex = objectiveOrder.indexOf(a.type);
      const bIndex = objectiveOrder.indexOf(b.type);
      return aIndex - bIndex;
    });

    // Return first 5 non-rewarded objectives
    return sortedObjectives
      .filter((obj) => !obj.rewarded)
      .slice(0, 5);
  }

  // Get all objectives
  getAllObjectives(): Objective[] {
    return Array.from(this.objectives.values());
  }

  // Reset system (for new game)
  reset(): void {
    this.objectives.clear();
    this.completedObjectiveTypes.clear();
    // Re-create all objectives
    for (const type of Object.keys(OBJECTIVE_DEFINITIONS) as ObjectiveType[]) {
      this.addObjective(type);
    }
  }

  // Save/Load functionality
  serialize(): {
    objectives: [string, Objective][];
    completedObjectiveTypes: ObjectiveType[];
  } {
    return {
      objectives: Array.from(this.objectives.entries()),
      completedObjectiveTypes: Array.from(this.completedObjectiveTypes),
    };
  }

  deserialize(data: {
    objectives?: [string, Objective][];
    completedObjectiveTypes?: ObjectiveType[];
  }): void {
    if (data.objectives) {
      this.objectives = new Map(data.objectives);
    }
    if (data.completedObjectiveTypes) {
      this.completedObjectiveTypes = new Set(data.completedObjectiveTypes);
    }
  }
}
