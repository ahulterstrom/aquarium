import { useGameStore } from "../../stores/gameStore";
import { useGridStore } from "../../stores/gridStore";
import { VisitorSystem } from "../../systems/VisitorSystem";

// Global visitor system instance
let visitorSystem: VisitorSystem | null = null;

function getVisitorSystem(): VisitorSystem {
  if (!visitorSystem) {
    const gridStore = useGridStore.getState();
    visitorSystem = new VisitorSystem(gridStore);
  }
  return visitorSystem;
}

/**
 * Update all visitors (called every frame)
 */
export function updateVisitors(deltaTime: number) {
  const state = useGameStore.getState();
  const system = getVisitorSystem();

  // Update system with current game state
  system.updateReferences(state.tanks, state.entrances);

  // Update all visitors
  system.update(deltaTime);

  // Sync visitors back to game store
  const currentVisitors = system.getVisitors();
  const storeVisitors = state.visitors;

  // Remove visitors that no longer exist in the system
  for (const [visitorId] of storeVisitors) {
    if (!currentVisitors.find((v) => v.id === visitorId)) {
      state.removeVisitor(visitorId);
    }
  }

  // Update existing visitors in store
  for (const visitor of currentVisitors) {
    if (storeVisitors.has(visitor.id)) {
      state.updateVisitor(visitor.id, visitor);
    } else {
      state.addVisitor(visitor);
    }
  }
}

/**
 * Spawn visitors based on reputation and available entrances
 */
export function spawnVisitors() {
  const state = useGameStore.getState();
  const system = getVisitorSystem();

  // Update system with current game state
  system.updateReferences(state.tanks, state.entrances);

  // Need at least one entrance to spawn visitors
  if (state.entrances.size === 0) {
    return;
  }

  // Calculate spawn rate based on reputation and tank count
  const baseSpawnChance = Math.min(state.reputation / 100, 0.8); // Max 80% chance
  const tankBonus = state.tanks.size * 0.1; // More tanks = more visitors
  const finalSpawnChance = Math.min(baseSpawnChance + tankBonus, 0.9);

  // Limit concurrent visitors
  const maxVisitors = Math.max(2, Math.floor(state.tanks.size * 1.5));
  const currentVisitorCount = system.getVisitorCount();

  if (currentVisitorCount >= maxVisitors) {
    return;
  }

  // Random chance to spawn
  // TODO: remove true
  if (true || Math.random() < finalSpawnChance) {
    // Choose random entrance (prefer main entrance)
    const entrances = Array.from(state.entrances.values());
    const mainEntrance = entrances.find((e) => e.isMainEntrance);
    const selectedEntrance =
      mainEntrance && Math.random() < 0.7
        ? mainEntrance
        : entrances[Math.floor(Math.random() * entrances.length)];

    // Spawn visitor
    const visitor = system.spawnVisitor(selectedEntrance.id);
    if (visitor) {
      state.addVisitor(visitor);
      console.log(
        `Spawned visitor ${visitor.id} at entrance ${selectedEntrance.id}`,
      );
    }
  }
}
