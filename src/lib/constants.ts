// Tick rates in milliseconds
export const TICK_RATES = {
  tick: 1000, // 1 second - money updates
  water: 5000, // 5 seconds - water quality
  visitors: 10000, // 10 seconds - spawn visitors
  daily: 60000 * 5, // 5 minutes - day end
};

export const TANK_COST = 6; // 1x1 tank cost
export const LARGE_TANK_COST = 12; // 2x1 tank cost
export const HUGE_TANK_COST = 24; // 2x2 tank cost
export const ENTRANCE_COST = 0;
export const EXPANSION_PACK_COST = 15;
export const TILES_PER_EXPANSION_PACK = 9;

// Tank specifications by size
// Economics: Larger tanks provide better efficiency but higher upfront cost
// Benefits: Larger tanks have bonus visitor appeal and fish happiness
export const TANK_SPECS = {
  medium: { 
    gridWidth: 1, gridDepth: 1, capacity: 5, cost: 6, 
    visualDimensions: [1.8, 1.5, 1.8],
    visitorAppealMultiplier: 1.0, // Base appeal
    fishHappinessBonus: 0.0, // No bonus
  },
  large: { 
    gridWidth: 2, gridDepth: 1, capacity: 12, cost: 15, 
    visualDimensions: [3.6, 1.5, 1.8],
    visitorAppealMultiplier: 1.25, // 25% more appeal
    fishHappinessBonus: 0.1, // +10% happiness
  },
  huge: { 
    gridWidth: 2, gridDepth: 2, capacity: 25, cost: 30, 
    visualDimensions: [3.6, 1.8, 3.6],
    visitorAppealMultiplier: 1.5, // 50% more appeal
    fishHappinessBonus: 0.15, // +15% happiness
  },
} as const;
