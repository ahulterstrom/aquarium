import { create } from "zustand";
import { devtools, subscribeWithSelector } from "zustand/middleware";
import {
  GameState,
  Tank,
  Fish,
  Entrance,
  Coin,
  Objective,
  Unlockable,
  UnlockCategory,
} from "../types/game.types";
import { createSelectors } from "@/stores/utils";
import {
  addFishToSystem,
  removeFishFromSystem,
} from "../components/systems/fishSystem";
import {
  EXPANSION_PACK_COST,
  TILES_PER_EXPANSION_PACK,
} from "../lib/constants";
import { useGridStore } from "./gridStore";
import { ObjectiveSystem } from "../systems/ObjectiveSystem";
import { UnlockSystem } from "../systems/UnlockSystem";
import { toast } from "@/components/ui/sonner";

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
  money: 100,
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
    devtools((set, get) => {
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
        wallStyle: "concrete",
        floorStyle: "wood",
        gameTime: 0,
        accumulators: {
          tick: 0,
          water: 0,
          visitors: 0,
          daily: 0,
        },

        setPaused: (paused) => set({ isPaused: paused }),

        setGameSpeed: (speed) => set({ gameSpeed: speed }),

        setVisitorCount: (count) => set({ visitorCount: count }),

        addMoney: (amount) =>
          set((state) => {
            const newMoney = state.money + amount;

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

            // Check for unlocks after reputation change
            setTimeout(() => get().checkAndProcessUnlocks(), 0);

            return { reputation: newReputation };
          }),

        nextDay: () =>
          set((state) => ({
            day: state.day + 1,
          })),

        addTank: (tank) =>
          set((state) => {
            const tanks = new Map(state.tanks);
            tanks.set(tank.id, tank);

            // Update objectives
            if (tanks.size === 1) {
              state.objectiveSystem.updateProgress("build_first_tank", 1);
            }
            state.objectiveSystem.updateProgress(
              "build_multiple_tanks",
              tanks.size,
            );

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
              fishMap.delete(fishId);
            });

            // If this was the last tank, give full refund to prevent softlock
            // Otherwise give half refund
            const isLastTank = state.tanks.size === 1;
            const refund = isLastTank ? 6 : 3;

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
              tanks.set(id, { ...tank, ...updates });
            }
            return { tanks };
          }),

        addFish: (fish) =>
          set((state) => {
            const fishMap = new Map(state.fish);
            fishMap.set(fish.id, fish);

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
              fishMap.set(id, { ...fish, ...updates });
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
          if (state.money >= EXPANSION_PACK_COST) {
            set((state) => ({
              money: state.money - EXPANSION_PACK_COST,
              expansionTiles: state.expansionTiles + TILES_PER_EXPANSION_PACK,
            }));
            return true;
          }
          return false;
        },

        placeExpansionTiles: (positions) => {
          const state = get();

          // Create expansion cells in gridStore
          useGridStore.getState().createExpansionCells(positions);

          // Update available tiles count
          set({
            expansionTiles: state.expansionTiles - positions.length,
          });

          // Update objectives - count total expansion cells
          const gridState = useGridStore.getState();
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
          const state = get();
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
          if (includingSelected && includingSelected.has(posKey)) return false;

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
          const collected = state.objectiveSystem.collectReward(objectiveId);
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

        reset: () => {
          const newObjectiveSystem = new ObjectiveSystem();
          return set({
            ...initialState,
            tanks: new Map(),
            fish: new Map(),
            entrances: new Map(),
            coins: new Map(),
            objectiveSystem: newObjectiveSystem,
            activeObjectives: newObjectiveSystem.getActiveObjectives(),
            expansionTiles: 0,
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
    }),
  ),
);
