import { toast } from "@/components/ui/sonner";
import { createSelectors } from "@/stores/utils";
import * as THREE from "three";
import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import {
  addFishToSystem,
  removeFishFromSystem,
  updateFishSystemReferences,
} from "../components/systems/fishSystem";
import { EXPANSION_BASE_COST } from "../lib/constants";
import {
  getCurrentExpansionLevel,
  getNextExpansionCost,
  getNextExpansionPackSize,
} from "../lib/utils/expansion";
import { getRotatedDimensions } from "../lib/utils/placement";
import { ObjectiveSystem } from "../systems/ObjectiveSystem";
import { UnlockSystem } from "../systems/UnlockSystem";
import {
  Coin,
  Entrance,
  Fish,
  GameState,
  GridPosition,
  Objective,
  Tank,
  Unlockable,
  UnlockCategory,
} from "../types/game.types";
import { useEconomyStore } from "./economyStore";
import { useGridStore } from "./gridStore";
import { useStatisticsStore } from "./statisticsStore";

interface GameStore extends GameState {
  tanks: Map<string, Tank>;
  fish: Map<string, Fish>;
  entrances: Map<string, Entrance>;
  coins: Map<string, Coin>;

  // Objective system
  objectiveSystem: ObjectiveSystem;
  activeObjectives: Objective[];
  allObjectives: Objective[];
  collectObjectiveReward: (objectiveId: string) => void;

  // Unlock system
  unlockSystem: UnlockSystem;
  unlockedItems: Set<string>;
  isUnlocked: (id: string) => boolean;
  getUnlockablesByCategory: (category: UnlockCategory) => Unlockable[];
  checkAndProcessUnlocks: () => void;

  // Expansion system
  expansionTiles: number; // Available tiles in inventory
  purchasedExpansionLevels: Set<number>; // Track which expansion packs have been bought

  // Customization
  wallStyle: string;
  floorStyle: string;

  // Time tracking
  gameTime: number; // Total game time in ms
  accumulators: {
    tick: number; // 1 second - money, UI updates
    water: number; // 5 seconds - water quality
    visitors: number; // 10 seconds - visitor spawning
    daily: number; // 60 seconds - daily revenue
  };

  // Actions
  setPaused: (paused: boolean) => void;
  setGameSpeed: (speed: 1 | 2 | 3) => void;
  setVisitorCount: (count: number) => void;
  addMoney: (amount: number) => void;
  spendMoney: (amount: number) => boolean;
  updateReputation: (delta: number) => void;
  nextDay: () => void;

  // Tick system actions
  updateGameTime: (delta: number) => void;

  // Entity management
  addTank: (tank: Tank) => void;
  removeTank: (id: string) => void;
  updateTank: (id: string, updates: Partial<Tank>) => void;
  moveTankToPosition: (
    tankId: string,
    newPosition: GridPosition,
    newRotation: number,
  ) => boolean;

  addFish: (fish: Fish) => void;
  removeFish: (id: string) => void;
  updateFish: (id: string, updates: Partial<Fish>) => void;

  addEntrance: (entrance: Entrance) => void;
  removeEntrance: (id: string) => void;
  updateEntrance: (id: string, updates: Partial<Entrance>) => void;

  addCoin: (coin: Coin) => void;
  removeCoin: (id: string) => void;

  // Expansion actions
  buyExpansionPack: () => boolean;
  placeExpansionTiles: (positions: { x: number; z: number }[]) => void;
  getAvailableExpansionPositions: (
    includingSelected?: Set<string>,
  ) => { x: number; z: number }[];
  isValidExpansionPosition: (
    x: number,
    z: number,
    includingSelected?: Set<string>,
  ) => boolean;
  canBuyExpansion: () => boolean;

  // Queries
  getTank: (id: string) => Tank | undefined;
  getFish: (id: string) => Fish | undefined;
  getEntrance: (id: string) => Entrance | undefined;
  getCoin: (id: string) => Coin | undefined;
  getFishInTank: (tankId: string) => Fish[];

  // Customization actions
  setWallStyle: (style: string) => void;
  setFloorStyle: (style: string) => void;

  // Game state
  reset: () => void;
}

const initialState: GameState = {
  money: 20,
  reputation: 50,
  visitorCount: 0,
  day: 1,
  isPaused: false,
  gameSpeed: 1,
};

// Create objective system instance
const objectiveSystem = new ObjectiveSystem();

// Create unlock system instance
const unlockSystem = new UnlockSystem();

export const useGameStore = createSelectors(
  create<GameStore>()(
    devtools(
      persist(
        (set, get) => {
          // Set up objective system callbacks
          objectiveSystem.setRewardCallback((amount, objective) => {
            get().addMoney(amount);
            // Update active objectives after reward
            set({ activeObjectives: objectiveSystem.getActiveObjectives() });
          });

          objectiveSystem.setObjectiveCompleteCallback((objective) => {
            // Update active objectives when one completes
            set({ activeObjectives: objectiveSystem.getActiveObjectives() });
            // Check for new unlocks when objectives complete
            get().checkAndProcessUnlocks();
          });

          // Set up unlock system callbacks
          unlockSystem.setOnUnlockCallback((unlockable) => {
            // Show toast notification for unlock
            toast({
              title: `🎉 New Unlock: ${unlockable.name}`,
              description: unlockable.description,
              button: {
                label: "View",
                onClick: () => {
                  // Could open a modal or scroll to the item
                  console.log("View unlock:", unlockable.id);
                },
              },
            });

            // Update unlocked items
            set({
              unlockedItems: unlockSystem.getUnlockedItems(),
            });
          });

          return {
            ...initialState,
            tanks: new Map(),
            fish: new Map(),
            entrances: new Map(),
            coins: new Map(),
            objectiveSystem,
            activeObjectives: objectiveSystem.getActiveObjectives(),
            allObjectives: objectiveSystem.getAllObjectives(),
            unlockSystem,
            unlockedItems: unlockSystem.getUnlockedItems(),
            expansionTiles: 0,
            purchasedExpansionLevels: new Set(),
            wallStyle: "metal",
            floorStyle: "concrete",
            gameTime: 0,
            accumulators: {
              tick: 0,
              water: 0,
              visitors: 0,
              daily: 0,
            },

            setPaused: (paused) => set({ isPaused: paused }),

            setGameSpeed: (speed) => set({ gameSpeed: speed }),

            setVisitorCount: (count) => {
              const state = get();
              // Track statistics when visitor count increases
              if (count > state.visitorCount) {
                const newVisitors = count - state.visitorCount;
                for (let i = 0; i < newVisitors; i++) {
                  useStatisticsStore.getState().recordVisitorServed();
                  useEconomyStore.getState().recordVisitorEntry();
                }
                useStatisticsStore.getState().updateVisitorCount(count);
              }

              set({ visitorCount: count });
            },

            addMoney: (amount) =>
              set((state) => {
                const newMoney = state.money + amount;

                // Track statistics
                useStatisticsStore.getState().recordMoneyEarned(amount);
                useStatisticsStore.getState().recordAction();
                useStatisticsStore.getState().updateAverageProfitPerVisitor();
                useEconomyStore.getState().updateVisitorSpending(amount);

                // Check for milestone
                if (state.money < 100 && newMoney >= 100) {
                  useStatisticsStore.getState().recordFirst100Dollars();
                }

                // Update objectives
                state.objectiveSystem.updateProgress("earn_money", newMoney);

                // Check for unlocks after money change
                setTimeout(() => get().checkAndProcessUnlocks(), 0);

                return {
                  money: newMoney,
                  activeObjectives: state.objectiveSystem.getActiveObjectives(),
                };
              }),

            spendMoney: (amount) => {
              const state = get();
              if (state.money >= amount) {
                // Track statistics
                useStatisticsStore.getState().recordMoneySpent(amount);
                useStatisticsStore.getState().recordAction();

                set({ money: state.money - amount });
                return true;
              }
              return false;
            },

            updateReputation: (delta) =>
              set((state) => {
                const newReputation = Math.max(
                  0,
                  Math.min(100, state.reputation + delta),
                );

                // Track statistics
                useStatisticsStore.getState().updateReputation(newReputation);

                // Check for unlocks after reputation change
                setTimeout(() => get().checkAndProcessUnlocks(), 0);

                return { reputation: newReputation };
              }),

            nextDay: () =>
              set((state) => {
                // Calculate daily profit from economy store
                const economyState = useEconomyStore.getState();
                const dailyProfit = economyState.calculateDailyProfit();

                // Track statistics
                useStatisticsStore.getState().updateDailyProfit(dailyProfit);

                // Create daily snapshot
                const gridState = useGridStore.getState();
                useStatisticsStore.getState().createDailySnapshot({
                  day: state.day,
                  money: state.money,
                  tankCount: state.tanks.size,
                  fishCount: state.fish.size,
                  visitorCount: state.visitorCount,
                  reputation: state.reputation,
                  dailyProfit,
                  gridSize: gridState.cells.size,
                });

                // Reset daily statistics for new day
                useStatisticsStore.getState().resetDailyStats();
                economyState.resetDaily();

                return { day: state.day + 1 };
              }),

            addTank: (tank) =>
              set((state) => {
                const tanks = new Map(state.tanks);
                tanks.set(tank.id, tank);

                // Track statistics
                useStatisticsStore.getState().recordTankBuilt();
                useStatisticsStore.getState().recordAction();
                useEconomyStore.getState().updateTankCount(tanks.size);

                // Update objectives
                if (tanks.size === 1) {
                  state.objectiveSystem.updateProgress("build_first_tank", 1);
                }
                state.objectiveSystem.updateProgress(
                  "build_multiple_tanks",
                  tanks.size,
                );

                // Check for unlocks after tank is added
                setTimeout(() => get().checkAndProcessUnlocks(), 0);

                return {
                  tanks,
                  activeObjectives: state.objectiveSystem.getActiveObjectives(),
                };
              }),

            removeTank: (id) =>
              set((state) => {
                const tank = state.tanks.get(id);
                if (!tank) return state;

                const tanks = new Map(state.tanks);
                const fishMap = new Map(state.fish);

                // Remove tank
                tanks.delete(id);

                // Remove all fish in this tank
                tank.fishIds.forEach((fishId) => {
                  // Remove from visual system first
                  try {
                    removeFishFromSystem(fishId);
                  } catch (error) {
                    console.warn(
                      "Fish system not initialized when removing fish from tank:",
                      error,
                    );
                  }
                  // Then remove from state
                  fishMap.delete(fishId);
                });

                // If this was the last tank, give full refund to prevent softlock
                // Otherwise give half refund
                const isLastTank = state.tanks.size === 1;
                const refund = isLastTank ? 6 : 3;

                // Check for unlocks after tank is removed
                setTimeout(() => get().checkAndProcessUnlocks(), 0);

                return {
                  tanks,
                  fish: fishMap,
                  money: state.money + refund,
                };
              }),

            updateTank: (id, updates) =>
              set((state) => {
                const tanks = new Map(state.tanks);
                const tank = tanks.get(id);
                if (tank) {
                  const updatedTank = { ...tank, ...updates };
                  tanks.set(id, updatedTank);

                  // Track water quality if updated
                  if (updates.waterQuality !== undefined) {
                    useStatisticsStore
                      .getState()
                      .updateWaterQuality(updates.waterQuality);
                  }

                  // Track fish count in tank if fish IDs changed
                  if (updates.fishIds !== undefined) {
                    useStatisticsStore
                      .getState()
                      .updateFishInTank(updates.fishIds.length);
                  }
                }
                return { tanks };
              }),

            addFish: (fish) =>
              set((state) => {
                const fishMap = new Map(state.fish);
                fishMap.set(fish.id, fish);

                // Track statistics
                useStatisticsStore.getState().recordFishPurchased();
                useStatisticsStore.getState().recordAction();
                useEconomyStore
                  .getState()
                  .updateFishCount(fishMap.size, state.tanks.size);

                // Also add to fish system
                try {
                  addFishToSystem(fish);
                } catch (error) {
                  console.warn(
                    "Fish system not initialized when adding fish:",
                    error,
                  );
                }

                // Update objectives
                state.objectiveSystem.updateProgress("buy_fish", fishMap.size);

                return {
                  fish: fishMap,
                  activeObjectives: state.objectiveSystem.getActiveObjectives(),
                };
              }),

            removeFish: (id) =>
              set((state) => {
                const fishMap = new Map(state.fish);
                fishMap.delete(id);

                // Also remove from fish system
                try {
                  removeFishFromSystem(id);
                } catch (error) {
                  console.warn(
                    "Fish system not initialized when removing fish:",
                    error,
                  );
                }

                return { fish: fishMap };
              }),

            updateFish: (id, updates) =>
              set((state) => {
                const fishMap = new Map(state.fish);
                const fish = fishMap.get(id);
                if (fish) {
                  const updatedFish = { ...fish, ...updates };
                  fishMap.set(id, updatedFish);

                  // Track fish happiness if updated
                  if (updates.happiness !== undefined) {
                    useStatisticsStore
                      .getState()
                      .updateFishHappiness(updates.happiness);
                  }
                }
                return { fish: fishMap };
              }),

            getTank: (id) => get().tanks.get(id),

            getFish: (id) => get().fish.get(id),

            addEntrance: (entrance) =>
              set((state) => {
                const entrances = new Map(state.entrances);
                entrances.set(entrance.id, entrance);

                // Update objectives
                state.objectiveSystem.updateProgress(
                  "place_entrance",
                  entrances.size,
                );

                return {
                  entrances,
                  activeObjectives: state.objectiveSystem.getActiveObjectives(),
                };
              }),

            removeEntrance: (id) =>
              set((state) => {
                const entrances = new Map(state.entrances);
                entrances.delete(id);
                return { entrances };
              }),

            updateEntrance: (id, updates) =>
              set((state) => {
                const entrances = new Map(state.entrances);
                const entrance = entrances.get(id);
                if (entrance) {
                  entrances.set(id, { ...entrance, ...updates });
                }
                return { entrances };
              }),

            addCoin: (coin) =>
              set((state) => {
                const coins = new Map(state.coins);
                coins.set(coin.id, coin);
                return { coins };
              }),

            removeCoin: (id) =>
              set((state) => {
                const coins = new Map(state.coins);
                coins.delete(id);
                return { coins };
              }),

            getEntrance: (id) => get().entrances.get(id),
            getCoin: (id) => get().coins.get(id),

            getFishInTank: (tankId) => {
              const state = get();
              return Array.from(state.fish.values()).filter(
                (fish) => fish.tankId === tankId,
              );
            },

            // Expansion system implementations
            buyExpansionPack: () => {
              const state = get();

              // Calculate total purchased tiles based on expansion levels purchased
              // Level 0: 3x3 = 9 tiles (initial)
              // Level 1: 4x4 = 16 tiles total
              // Level 2: 5x5 = 25 tiles total
              // Level 3: 6x6 = 36 tiles total, etc.
              const INITIAL_GRID_SIZE = 9; // 3x3 starting grid

              // Find the highest purchased level
              const maxPurchasedLevel =
                state.purchasedExpansionLevels.size > 0
                  ? Math.max(...Array.from(state.purchasedExpansionLevels))
                  : 0;

              // Calculate total tiles for the highest purchased level
              // Formula: (level + 3)² gives total tiles at that level
              const totalPurchasedTiles = Math.pow(maxPurchasedLevel + 3, 2);

              const currentLevel =
                getCurrentExpansionLevel(totalPurchasedTiles);
              const nextLevel = currentLevel + 1;

              // Check if this level has already been purchased
              if (state.purchasedExpansionLevels.has(nextLevel)) {
                return false; // Already purchased this level
              }

              const packCost = getNextExpansionCost(
                totalPurchasedTiles,
                EXPANSION_BASE_COST,
              );
              const packSize = getNextExpansionPackSize(totalPurchasedTiles);

              if (state.money >= packCost) {
                set((state) => ({
                  money: state.money - packCost,
                  expansionTiles: state.expansionTiles + packSize,
                  purchasedExpansionLevels: new Set([
                    ...state.purchasedExpansionLevels,
                    nextLevel,
                  ]),
                }));
                return true;
              }
              return false;
            },

            canBuyExpansion: () => {
              const state = get();

              // Find the highest purchased level
              const maxPurchasedLevel =
                state.purchasedExpansionLevels.size > 0
                  ? Math.max(...Array.from(state.purchasedExpansionLevels))
                  : 0;

              // Calculate total tiles for the highest purchased level
              // Formula: (level + 3)² gives total tiles at that level
              const totalPurchasedTiles = Math.pow(maxPurchasedLevel + 3, 2);

              const currentLevel =
                getCurrentExpansionLevel(totalPurchasedTiles);
              const nextLevel = currentLevel + 1;

              // Check if this level has already been purchased
              if (state.purchasedExpansionLevels.has(nextLevel)) {
                return false; // Already purchased this level
              }

              // For levels 1-3, check unlock requirements
              if (nextLevel <= 3) {
                const nextLevelUnlockId = `expansion_level_${nextLevel}`;
                return state.unlockSystem.isUnlocked(nextLevelUnlockId);
              }

              // For levels 4+, always allow purchase (no unlock requirements)
              return true;
            },

            placeExpansionTiles: (positions) => {
              const state = get();

              // Create expansion cells in gridStore
              useGridStore.getState().createExpansionCells(positions);

              // Track statistics
              positions.forEach(() => {
                useStatisticsStore.getState().recordExpansionTile();
                useStatisticsStore.getState().recordAction();
              });

              // Update grid size tracking
              const gridState = useGridStore.getState();
              const totalGridSize = gridState.cells.size + positions.length;
              useStatisticsStore.getState().updateGridSize(totalGridSize);

              // Update available tiles count
              set({
                expansionTiles: state.expansionTiles - positions.length,
              });

              // Update objectives - count total expansion cells
              const expansionCellCount = Array.from(
                gridState.cells.values(),
              ).filter((cell) => cell.type === "expansion").length;
              state.objectiveSystem.updateProgress(
                "expand_aquarium",
                expansionCellCount,
              );

              // Update active objectives after progress
              set({
                activeObjectives: state.objectiveSystem.getActiveObjectives(),
              });
            },

            getAvailableExpansionPositions: (includingSelected) => {
              const gridState = useGridStore.getState();
              const validPositions: { x: number; z: number }[] = [];

              // Calculate dynamic bounds based on existing cells and selected tiles
              let minX = 0,
                maxX = 2,
                minZ = 0,
                maxZ = 2; // Start with original 3x3 bounds

              // Expand bounds based on existing grid cells
              for (const cell of gridState.cells.values()) {
                if (cell.y === 0) {
                  // Only consider ground level cells
                  minX = Math.min(minX, cell.x);
                  maxX = Math.max(maxX, cell.x);
                  minZ = Math.min(minZ, cell.z);
                  maxZ = Math.max(maxZ, cell.z);
                }
              }

              // Also expand bounds based on selected tiles during placement
              if (includingSelected) {
                for (const posKey of includingSelected) {
                  const [x, z] = posKey.split(",").map(Number);
                  minX = Math.min(minX, x);
                  maxX = Math.max(maxX, x);
                  minZ = Math.min(minZ, z);
                  maxZ = Math.max(maxZ, z);
                }
              }

              // Expand search area by 1 in each direction to find adjacent positions
              minX -= 1;
              maxX += 1;
              minZ -= 1;
              maxZ += 1;

              for (let x = minX; x <= maxX; x++) {
                for (let z = minZ; z <= maxZ; z++) {
                  if (get().isValidExpansionPosition(x, z, includingSelected)) {
                    validPositions.push({ x, z });
                  }
                }
              }

              return validPositions;
            },

            isValidExpansionPosition: (x, z, includingSelected) => {
              const state = get();
              const gridState = useGridStore.getState();
              const posKey = `${x},${z}`;

              // Can't place on existing cells (already part of grid)
              const existingCell = gridState.getCell(x, 0, z);
              if (existingCell) return false;

              // Can't place on selected tiles (during placement mode)
              if (includingSelected && includingSelected.has(posKey))
                return false;

              // Rule A: Must share a side with existing tile (grid cell or selected)
              const adjacentPositions = [
                { x: x - 1, z },
                { x: x + 1, z },
                { x, z: z - 1 },
                { x, z: z + 1 },
              ];

              let hasAdjacentTile = false;
              for (const adj of adjacentPositions) {
                const adjKey = `${adj.x},${adj.z}`;

                // Check if adjacent to existing grid cell
                const adjCell = gridState.getCell(adj.x, 0, adj.z);
                if (adjCell) {
                  hasAdjacentTile = true;
                  break;
                }

                // Check if adjacent to selected tile (during placement)
                if (includingSelected && includingSelected.has(adjKey)) {
                  hasAdjacentTile = true;
                  break;
                }
              }

              if (!hasAdjacentTile) return false;

              // Rule B: Cannot border a tile that contains an entrance
              for (const adj of adjacentPositions) {
                // Check if adjacent position has an entrance
                for (const entrance of state.entrances.values()) {
                  if (
                    entrance.position.x === adj.x &&
                    entrance.position.z === adj.z
                  ) {
                    return false;
                  }
                }
              }

              return true;
            },

            // Tick system implementations
            updateGameTime: (delta) =>
              set((state) => ({
                gameTime: state.gameTime + delta,
              })),

            // Objective system implementations
            collectObjectiveReward: (objectiveId) => {
              const state = get();
              const collected =
                state.objectiveSystem.collectReward(objectiveId);
              if (collected) {
                set({
                  activeObjectives: state.objectiveSystem.getActiveObjectives(),
                });
              }
            },

            // Unlock system implementations
            isUnlocked: (id) => {
              const state = get();
              return state.unlockSystem.isUnlocked(id);
            },

            getUnlockablesByCategory: (category) => {
              const state = get();
              return state.unlockSystem.getUnlockablesByCategory(category);
            },

            checkAndProcessUnlocks: () => {
              const state = get();
              const completedObjectives = new Set(
                state.allObjectives
                  .filter((obj) => obj.completed)
                  .map((obj) => obj.type),
              );

              const gameState = {
                money: state.money,
                reputation: state.reputation,
                completedObjectives,
                tankCount: state.tanks.size,
                fishCount: state.fish.size,
                gameTime: state.gameTime,
              };

              const newUnlocks = state.unlockSystem.processUnlocks(gameState);

              if (newUnlocks.length > 0) {
                set({
                  unlockedItems: state.unlockSystem.getUnlockedItems(),
                });
              }
            },

            // Customization implementations
            setWallStyle: (style) => set({ wallStyle: style }),
            setFloorStyle: (style) => set({ floorStyle: style }),

            moveTankToPosition: (tankId, newPosition, newRotation) => {
              const state = get();
              const tank = state.tanks.get(tankId);
              if (!tank) return false;

              const gridState = useGridStore.getState();

              // Get rotated dimensions for the new position
              const { width: rotatedWidth, depth: rotatedDepth } =
                getRotatedDimensions(
                  tank.gridWidth,
                  tank.gridDepth,
                  newRotation,
                );

              // Check if new position is valid
              if (
                !gridState.canPlaceAt(newPosition, rotatedWidth, rotatedDepth)
              ) {
                return false;
              }

              // Remove tank from old position
              const oldRotatedDims = getRotatedDimensions(
                tank.gridWidth,
                tank.gridDepth,
                tank.rotation,
              );
              gridState.removeObject(
                tank.position,
                oldRotatedDims.width,
                oldRotatedDims.depth,
              );

              // Place tank at new position
              gridState.placeObject(
                newPosition,
                rotatedWidth,
                rotatedDepth,
                "tank",
                tankId,
              );

              // Update tank position and rotation
              const tanks = new Map(state.tanks);
              const updatedTank = {
                ...tank,
                position: newPosition,
                rotation: newRotation,
              };
              tanks.set(tankId, updatedTank);

              // Generate random positions for fish within the moved tank
              const fishMap = new Map(state.fish);
              tank.fishIds.forEach((fishId) => {
                const fish = fishMap.get(fishId);
                if (fish) {
                  // Generate random position within the new tank bounds
                  const baseX = newPosition.x * 2;
                  const baseZ = newPosition.z * 2;

                  const gridWidth = tank.gridWidth || 1;
                  const gridDepth = tank.gridDepth || 1;

                  const tankCenterX =
                    baseX + (gridWidth > 1 ? gridWidth - 1 : 0);
                  const tankCenterZ =
                    baseZ + (gridDepth > 1 ? gridDepth - 1 : 0);

                  const xRange = gridWidth * 1.4;
                  const zRange = gridDepth * 1.4;

                  fish.position = new THREE.Vector3(
                    tankCenterX + (Math.random() - 0.5) * xRange,
                    newPosition.y + 0.3 + Math.random() * 0.6,
                    tankCenterZ + (Math.random() - 0.5) * zRange,
                  );

                  fishMap.set(fishId, fish);
                }
              });

              set({ tanks, fish: fishMap });

              // Sync FishSystem with updated fish positions
              tank.fishIds.forEach((fishId) => {
                const updatedFish = fishMap.get(fishId);
                if (updatedFish) {
                  try {
                    // Remove fish from FishSystem
                    removeFishFromSystem(fishId);
                    // Re-add fish with new position
                    addFishToSystem(updatedFish);
                  } catch (error) {
                    console.warn(
                      "Failed to sync fish system during tank move:",
                      error,
                    );
                  }
                }
              });

              // Update tank references in FishSystem
              updateFishSystemReferences();

              return true;
            },

            reset: () => {
              // Reset the systems
              objectiveSystem.reset();
              unlockSystem.reset();

              return set({
                ...initialState,
                tanks: new Map(),
                fish: new Map(),
                entrances: new Map(),
                coins: new Map(),
                objectiveSystem: objectiveSystem,
                activeObjectives: objectiveSystem.getActiveObjectives(),
                allObjectives: objectiveSystem.getAllObjectives(),
                unlockSystem: unlockSystem,
                unlockedItems: unlockSystem.getUnlockedItems(),
                expansionTiles: 0,
                purchasedExpansionLevels: new Set(),
                wallStyle: "concrete",
                floorStyle: "wood",
                gameTime: 0,
                accumulators: {
                  tick: 0,
                  water: 0,
                  visitors: 0,
                  daily: 0,
                },
              });
            },
          };
        },
        {
          name: "aquarium-game-state",
          partialize: (state) => ({
            money: state.money,
            reputation: state.reputation,
            visitorCount: state.visitorCount,
            day: state.day,
            tanks: Array.from(state.tanks.entries()),
            fish: Array.from(state.fish.entries()).map(([id, fish]) => [
              id,
              {
                ...fish,
                position: {
                  x: fish.position.x,
                  y: fish.position.y,
                  z: fish.position.z,
                },
                velocity: {
                  x: fish.velocity.x,
                  y: fish.velocity.y,
                  z: fish.velocity.z,
                },
              },
            ]),
            entrances: Array.from(state.entrances.entries()),
            expansionTiles: state.expansionTiles,
            purchasedExpansionLevels: Array.from(
              state.purchasedExpansionLevels,
            ),
            wallStyle: state.wallStyle,
            floorStyle: state.floorStyle,
            objectiveSystemData: state.objectiveSystem.serialize(),
            unlockSystemData: state.unlockSystem.getState(),
          }),
          onRehydrateStorage: () => (state, error) => {
            if (error) {
              console.error("Failed to rehydrate gameStore:", error);
              return;
            }

            if (state) {
              // Convert arrays back to Maps
              state.tanks = new Map(state.tanks);
              state.fish = new Map(state.fish);
              state.entrances = new Map(state.entrances);
              state.purchasedExpansionLevels = new Set(
                state.purchasedExpansionLevels,
              );

              // Convert plain objects back to Vector3 instances for fish
              state.fish.forEach((fish) => {
                if (
                  fish.position &&
                  !(fish.position instanceof THREE.Vector3)
                ) {
                  fish.position = new THREE.Vector3(
                    fish.position.x,
                    fish.position.y,
                    fish.position.z,
                  );
                }
                if (
                  fish.velocity &&
                  !(fish.velocity instanceof THREE.Vector3)
                ) {
                  fish.velocity = new THREE.Vector3(
                    fish.velocity.x,
                    fish.velocity.y,
                    fish.velocity.z,
                  );
                }
              });

              // Deserialize objective system if data exists
              if (state.objectiveSystemData) {
                objectiveSystem.deserialize(state.objectiveSystemData);
                state.objectiveSystem = objectiveSystem;
                state.activeObjectives = objectiveSystem.getActiveObjectives();
                state.allObjectives = objectiveSystem.getAllObjectives();
              }

              // Load unlock system state if data exists
              if (state.unlockSystemData) {
                unlockSystem.loadState(state.unlockSystemData);
                state.unlockSystem = unlockSystem;
                state.unlockedItems = unlockSystem.getUnlockedItems();
              }
            }
          },
        },
      ),
    ),
  ),
);
