import { useGameStore } from "../../stores/gameStore";
import { useGridStore } from "../../stores/gridStore";
import { VisitorSystem } from "../../systems/VisitorSystem";
import { getCoinSystem } from "./coinSystem";
import { SoundController } from "../../controllers/soundController";

// Global visitor system instance
let visitorSystem: VisitorSystem | null = null;

export function getVisitorSystem(
  soundController?: SoundController,
): VisitorSystem {
  if (!visitorSystem) {
    const gridStore = useGridStore.getState();
    const coinSystem = getCoinSystem();
    visitorSystem = new VisitorSystem(gridStore, coinSystem, soundController);
  }
  return visitorSystem;
}

/**
 * Update all visitors (called every frame)
 */
export function updateVisitors(
  deltaTime: number,
  soundController: SoundController,
) {
  const state = useGameStore.getState();
  const system = getVisitorSystem(soundController);

  // Update system with current game state
  system.updateReferences(state.tanks, state.entrances);

  // Update all visitors (no syncing back to store)
  system.update(deltaTime);

  // Update visitor objectives
  state.objectiveSystem.updateProgress(
    "attract_visitors",
    system.getTotalVisitorsCreated(),
  );
  state.objectiveSystem.updateProgress(
    "satisfy_visitors",
    system.getSatisfiedVisitorCount(),
  );
}

/**
 * Spawn a visitor at a specific entrance (guaranteed spawn)
 */
export function spawnVisitor(
  entranceId?: string,
  soundController: SoundController,
) {
  const state = useGameStore.getState();
  const system = getVisitorSystem(soundController);

  // Update system with current game state
  system.updateReferences(state.tanks, state.entrances);

  // Need at least one entrance to spawn visitors
  if (state.entrances.size === 0) {
    return null;
  }

  // Choose entrance (use provided ID or select one)
  let selectedEntrance;
  if (entranceId) {
    selectedEntrance = state.entrances.get(entranceId);
    if (!selectedEntrance) {
      console.warn(`Entrance ${entranceId} not found`);
      return null;
    }
  } else {
    // Choose random entrance (prefer main entrance)
    const entrances = Array.from(state.entrances.values());
    const mainEntrance = entrances.find((e) => e.isMainEntrance);
    selectedEntrance = mainEntrance
      ? mainEntrance
      : entrances[Math.floor(Math.random() * entrances.length)];
  }

  // Spawn visitor
  const visitor = system.spawnVisitor(selectedEntrance.id);
  if (visitor) {
    console.log(
      `Spawned visitor ${visitor.id} at entrance ${selectedEntrance.id}`,
    );
  }
  return visitor;
}

/**
 * Attempt to spawn visitors based on reputation and available entrances
 */
export function attemptSpawnVisitors(soundController: SoundController) {
  const state = useGameStore.getState();
  const system = getVisitorSystem(soundController);

  // Update system with current game state
  system.updateReferences(state.tanks, state.entrances);

  // Need at least one entrance to spawn visitors
  if (state.entrances.size === 0) {
    return;
  }

  const cells = useGridStore.getState().cells;
  const currentGridSize = cells.size;
  // Limit concurrent visitors
  const maxVisitors = currentGridSize;
  const currentVisitorCount = system.getVisitorCount();

  if (currentVisitorCount >= maxVisitors) {
    return;
  }

  // Calculate spawn rate based on reputation and tank count
  const baseSpawnChance = Math.min(state.reputation / 100, 0.8); // Max 80% chance
  const tankBonus = state.tanks.size * 0.1; // More tanks = more visitors
  const finalSpawnChance = Math.min(baseSpawnChance + tankBonus, 0.9);

  // Random chance to spawn
  if (Math.random() < finalSpawnChance) {
    spawnVisitor(undefined, soundController); // Spawn at random entrance
  }
}
