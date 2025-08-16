import { 
  Unlockable, 
  UnlockCategory, 
  UnlockCondition,
  UnlockNotification,
  ObjectiveType,
  UnlockConditionType
} from "../types/game.types";

export class UnlockSystem {
  private unlockables: Map<string, Unlockable> = new Map();
  private unlockedItems: Set<string> = new Set();
  private unlockNotifications: UnlockNotification[] = [];
  private onUnlockCallback: ((unlockable: Unlockable) => void) | null = null;

  constructor() {
    this.initializeUnlockables();
  }

  private initializeUnlockables() {
    // Fish unlockables
    this.addUnlockable({
      id: "fish_angelfish",
      category: "fish",
      name: "Angelfish",
      description: "Unlock the majestic Angelfish for your aquarium",
      conditions: [
        {
          type: "objective",
          target: "buy_fish",
          description: "Complete 'Stock Your Aquarium' objective"
        }
      ]
    });

    this.addUnlockable({
      id: "fish_clownfish",
      category: "fish",
      name: "Clownfish",
      description: "Everyone's favorite orange fish!",
      conditions: [
        {
          type: "money",
          target: 100,
          description: "Earn $100"
        }
      ]
    });

    this.addUnlockable({
      id: "fish_beta",
      category: "fish",
      name: "Beta Fish",
      description: "Beautiful but solitary fighter fish",
      conditions: [
        {
          type: "objective",
          target: "build_multiple_tanks",
          description: "Complete 'Expanding the Aquarium' objective"
        }
      ],
      dependencies: ["fish_angelfish"]
    });

    // Tank unlockables
    this.addUnlockable({
      id: "tank_large",
      category: "tanks",
      name: "Large Tank",
      description: "A bigger tank that can hold more fish",
      conditions: [
        {
          type: "objective",
          target: "build_first_tank",
          description: "Complete 'Build Your First Tank' objective"
        }
      ]
    });

    this.addUnlockable({
      id: "tank_huge",
      category: "tanks",
      name: "Huge Tank",
      description: "A massive tank for your biggest fish",
      conditions: [
        {
          type: "count",
          target: 3,
          description: "Build 3 tanks"
        },
        {
          type: "money",
          target: 200,
          description: "Earn $200"
        }
      ],
      dependencies: ["tank_large"]
    });

    // Customization unlockables
    this.addUnlockable({
      id: "floor_marble",
      category: "customization",
      name: "Marble Floor",
      description: "Elegant marble flooring for your aquarium",
      conditions: [
        {
          type: "reputation",
          target: 60,
          description: "Reach 60 reputation"
        }
      ]
    });

    this.addUnlockable({
      id: "wall_glass",
      category: "customization",
      name: "Glass Walls",
      description: "Modern glass walls for a contemporary look",
      conditions: [
        {
          type: "money",
          target: 150,
          description: "Earn $150"
        }
      ]
    });

    // Building unlockables
    this.addUnlockable({
      id: "entrance_premium",
      category: "buildings",
      name: "Premium Entrance",
      description: "A fancy entrance that attracts more visitors",
      conditions: [
        {
          type: "objective",
          target: "attract_visitors",
          description: "Complete 'Growing Popularity' objective"
        }
      ]
    });

    // Mechanics unlockables
    this.addUnlockable({
      id: "auto_feeder",
      category: "mechanics",
      name: "Auto Feeder",
      description: "Automatically feeds your fish",
      conditions: [
        {
          type: "objective",
          target: "satisfy_visitors",
          description: "Complete 'Happy Customers' objective"
        }
      ],
      hidden: true // Only show after certain progress
    });

    // Expansion unlockables
    this.addUnlockable({
      id: "expansion_mega",
      category: "expansions",
      name: "Mega Expansion Pack",
      description: "10 tiles for massive expansion",
      conditions: [
        {
          type: "objective",
          target: "expand_aquarium",
          description: "Complete 'More Space' objective"
        }
      ]
    });
  }

  private addUnlockable(unlockable: Unlockable) {
    this.unlockables.set(unlockable.id, unlockable);
  }

  // Check if an item is unlocked
  isUnlocked(id: string): boolean {
    return this.unlockedItems.has(id);
  }

  // Get all unlockables by category
  getUnlockablesByCategory(category: UnlockCategory): Unlockable[] {
    const unlockables: Unlockable[] = [];
    
    for (const unlockable of this.unlockables.values()) {
      if (unlockable.category === category) {
        // Only include if not hidden, or if hidden and dependencies are met
        if (!unlockable.hidden || this.areDependenciesMet(unlockable)) {
          unlockables.push(unlockable);
        }
      }
    }
    
    return unlockables;
  }

  // Get all visible unlockables
  getVisibleUnlockables(): Unlockable[] {
    const visible: Unlockable[] = [];
    
    for (const unlockable of this.unlockables.values()) {
      if (!unlockable.hidden || this.areDependenciesMet(unlockable)) {
        visible.push(unlockable);
      }
    }
    
    return visible;
  }

  // Check if dependencies are met
  private areDependenciesMet(unlockable: Unlockable): boolean {
    if (!unlockable.dependencies || unlockable.dependencies.length === 0) {
      return true;
    }
    
    return unlockable.dependencies.every(depId => this.isUnlocked(depId));
  }

  // Check unlock conditions
  checkConditions(
    unlockable: Unlockable,
    gameState: {
      money?: number;
      reputation?: number;
      completedObjectives?: Set<ObjectiveType>;
      tankCount?: number;
      fishCount?: number;
      satisfiedVisitors?: number;
      gameTime?: number;
    }
  ): { met: boolean; progress: UnlockCondition[] } {
    const progressConditions = unlockable.conditions.map(condition => {
      const progress = { ...condition };
      
      switch (condition.type) {
        case "money":
          progress.current = gameState.money || 0;
          break;
        case "reputation":
          progress.current = gameState.reputation || 0;
          break;
        case "objective":
          const objectiveComplete = gameState.completedObjectives?.has(condition.target as ObjectiveType) || false;
          progress.current = objectiveComplete ? 1 : 0;
          progress.target = 1;
          break;
        case "count":
          // This would need to be more specific based on what we're counting
          progress.current = gameState.tankCount || 0;
          break;
        case "satisfaction":
          progress.current = gameState.satisfiedVisitors || 0;
          break;
        case "time":
          progress.current = gameState.gameTime || 0;
          break;
      }
      
      return progress;
    });

    const allMet = progressConditions.every(condition => {
      if (typeof condition.target === "number" && typeof condition.current === "number") {
        return condition.current >= condition.target;
      }
      return false;
    });

    return { met: allMet && this.areDependenciesMet(unlockable), progress: progressConditions };
  }

  // Process unlocks based on current game state
  processUnlocks(gameState: Parameters<typeof this.checkConditions>[1]): string[] {
    const newUnlocks: string[] = [];
    
    for (const unlockable of this.unlockables.values()) {
      if (!this.isUnlocked(unlockable.id)) {
        const { met } = this.checkConditions(unlockable, gameState);
        
        if (met) {
          this.unlockedItems.add(unlockable.id);
          newUnlocks.push(unlockable.id);
          
          // Create notification
          const notification: UnlockNotification = {
            id: `unlock_notif_${Date.now()}_${Math.random()}`,
            unlockId: unlockable.id,
            name: unlockable.name,
            category: unlockable.category,
            timestamp: Date.now(),
            collected: false
          };
          this.unlockNotifications.push(notification);
          
          // Trigger callback
          if (this.onUnlockCallback) {
            this.onUnlockCallback(unlockable);
          }
        }
      }
    }
    
    return newUnlocks;
  }

  // Get unlock progress for a specific item
  getUnlockProgress(
    id: string,
    gameState: Parameters<typeof this.checkConditions>[1]
  ): { unlockable: Unlockable; progress: UnlockCondition[]; isUnlocked: boolean } | null {
    const unlockable = this.unlockables.get(id);
    if (!unlockable) return null;
    
    const { progress } = this.checkConditions(unlockable, gameState);
    
    return {
      unlockable,
      progress,
      isUnlocked: this.isUnlocked(id)
    };
  }

  // Get pending notifications
  getPendingNotifications(): UnlockNotification[] {
    return this.unlockNotifications.filter(n => !n.collected);
  }

  // Mark notification as collected
  collectNotification(notificationId: string) {
    const notification = this.unlockNotifications.find(n => n.id === notificationId);
    if (notification) {
      notification.collected = true;
    }
  }

  // Set callback for when items are unlocked
  setOnUnlockCallback(callback: (unlockable: Unlockable) => void) {
    this.onUnlockCallback = callback;
  }

  // Get all unlocked items
  getUnlockedItems(): Set<string> {
    return new Set(this.unlockedItems);
  }

  // Load unlock state (for save/load)
  loadState(unlockedItems: string[]) {
    this.unlockedItems = new Set(unlockedItems);
  }

  // Get current state (for save)
  getState(): string[] {
    return Array.from(this.unlockedItems);
  }

  // Get specific unlockable
  getUnlockable(id: string): Unlockable | undefined {
    return this.unlockables.get(id);
  }
}