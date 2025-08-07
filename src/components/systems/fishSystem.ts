import { FishSystem } from "../../systems/FishSystem";
import { Fish } from "../../types/game.types";
import { useGameStore } from "../../stores/gameStore";

let fishSystemInstance: FishSystem | null = null;

export function initializeFishSystem(): FishSystem {
  if (!fishSystemInstance) {
    fishSystemInstance = new FishSystem();
  }
  return fishSystemInstance;
}

export function getFishSystem(): FishSystem {
  if (!fishSystemInstance) {
    throw new Error("FishSystem not initialized. Call initializeFishSystem() first.");
  }
  return fishSystemInstance;
}

export function updateFishSystemReferences(): void {
  if (fishSystemInstance) {
    const tanks = useGameStore.getState().tanks;
    fishSystemInstance.updateReferences(tanks);
  }
}

export function addFishToSystem(fish: Fish): void {
  if (fishSystemInstance) {
    fishSystemInstance.addFish(fish);
  }
}

export function removeFishFromSystem(fishId: string): void {
  if (fishSystemInstance) {
    fishSystemInstance.removeFish(fishId);
  }
}