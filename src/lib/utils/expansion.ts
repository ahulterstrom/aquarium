/**
 * Utility functions for progressive expansion pack system
 * Based on square grid progression: 3×3 → 4×4 → 5×5 → 6×6...
 */

/**
 * Calculate the current expansion level based on total tiles owned
 * Level 0 = 3×3 (9 tiles), Level 1 = 4×4 (16 tiles), Level 2 = 5×5 (25 tiles), etc.
 */
export function getCurrentExpansionLevel(totalTiles: number): number {
  // Find the largest square that fits within totalTiles
  const sideLength = Math.floor(Math.sqrt(totalTiles));

  // Convert side length to expansion level (3×3 = level 0, 4×4 = level 1, etc.)
  return Math.max(0, sideLength - 3);
}

/**
 * Calculate how many tiles are needed for the next expansion level
 * Formula: 2k + 5 (where k is the next level)
 */
export function getNextExpansionPackSize(currentTiles: number): number {
  const currentLevel = getCurrentExpansionLevel(currentTiles);
  const nextLevel = currentLevel + 1;

  // Calculate tiles needed: difference between (nextLevel+3)² and current tiles
  const nextSquareSize = Math.pow(nextLevel + 3, 2);
  return nextSquareSize - currentTiles;
}

/**
 * Get information about the next expansion
 */
export function getNextExpansionInfo(currentTiles: number) {
  const currentLevel = getCurrentExpansionLevel(currentTiles);
  const nextLevel = currentLevel + 1;
  const tilesNeeded = getNextExpansionPackSize(currentTiles);
  const nextTotalTiles = currentTiles + tilesNeeded;
  const nextGridSize = Math.sqrt(nextTotalTiles);

  return {
    currentLevel,
    nextLevel,
    tilesNeeded,
    nextTotalTiles,
    currentGridSize: `${Math.floor(Math.sqrt(currentTiles))}×${Math.floor(Math.sqrt(currentTiles))}`,
    nextGridSize: `${nextGridSize}×${nextGridSize}`,
  };
}

/**
 * Calculate the cost for the next expansion
 * Progressive pricing: base cost × (level + 1)
 */
export function getNextExpansionCost(
  currentTiles: number,
  baseCost: number = 15,
): number {
  const nextLevel = getCurrentExpansionLevel(currentTiles) + 1;
  return baseCost * nextLevel;
}
