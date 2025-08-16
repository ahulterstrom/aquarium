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