import { useGameStore } from '../../stores/gameStore';
import { nanoid } from 'nanoid';
import { Vector3 } from 'three';
import { Visitor } from '../../types/game.types';

/**
 * Spawn visitors based on reputation
 */
export function spawnVisitors() {
  const state = useGameStore.getState();
  
  // Calculate how many visitors to spawn based on reputation
  const visitorCount = Math.floor(state.reputation / 20);
  
  if (visitorCount === 0) return;
  
  // Create new visitors
  for (let i = 0; i < visitorCount; i++) {
    const visitor: Visitor = {
      id: `visitor_${nanoid()}`,
      happiness: 0.5,
      position: new Vector3(
        Math.random() * 4 - 2,  // Random x between -2 and 2
        0,
        Math.random() * 4 - 2   // Random z between -2 and 2
      ),
      targetTankId: null,
      patience: 1,
      moneySpent: 0,
      favoriteSpecies: [],
    };
    
    state.addVisitor(visitor);
  }
}