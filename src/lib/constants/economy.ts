// Economic constants and timing

// Tick rates in milliseconds
export const TICK_RATES = {
  tick: 1000, // 1 second - money updates
  water: 5000, // 5 seconds - water quality
  visitors: 10000, // 10 seconds - spawn visitors
  daily: 60000 * 5, // 5 minutes - day end
};

// Building costs
export const TANK_COST = 6; // 1x1 tank cost
export const LARGE_TANK_COST = 12; // 2x1 tank cost
export const HUGE_TANK_COST = 24; // 2x2 tank cost
export const ENTRANCE_COST = 0;
export const EXPANSION_BASE_COST = 15;
// TILES_PER_EXPANSION_PACK is now dynamic - see expansion.ts utils