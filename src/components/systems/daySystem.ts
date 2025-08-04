import { useGameStore } from "@/stores/gameStore";

/**
 * Spawn visitors based on reputation
 */
export function processDayEnd() {
  const state = useGameStore.getState();

  // Increment day count
  state.nextDay();
  console.log(`Day ${state.day} has ended.`);
}
