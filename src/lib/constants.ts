// Tick rates in milliseconds
export const TICK_RATES = {
  tick: 1000, // 1 second - money updates
  water: 5000, // 5 seconds - water quality
  visitors: 10000, // 10 seconds - spawn visitors
  daily: 60000 * 5, // 5 minutes - day end
};

export const TANK_COST = 6; // 1x1 tank cost
export const LARGE_TANK_COST = 12; // 2x1 tank cost
export const ENTRANCE_COST = 0;
export const EXPANSION_PACK_COST = 15;
export const TILES_PER_EXPANSION_PACK = 9;

// Tank specifications by size
export const TANK_SPECS = {
  small: { gridWidth: 1, gridDepth: 1, capacity: 3, cost: 6, visualDimensions: [1.5, 1.2, 1.5] },
  medium: { gridWidth: 1, gridDepth: 1, capacity: 5, cost: 6, visualDimensions: [1.8, 1.5, 1.8] },
  large: { gridWidth: 2, gridDepth: 1, capacity: 8, cost: 12, visualDimensions: [3.6, 1.5, 1.8] },
} as const;
