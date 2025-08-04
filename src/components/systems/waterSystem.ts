import { useGameStore } from '../../stores/gameStore';

/**
 * Update water quality for all tanks
 * Decreases water quality over time
 */
export function updateWaterQuality() {
  const state = useGameStore.getState();
  
  // Decrease water quality for each tank
  state.tanks.forEach((tank) => {
    const newQuality = Math.max(0, tank.waterQuality - 0.02);
    state.updateTank(tank.id, { waterQuality: newQuality });
  });
}