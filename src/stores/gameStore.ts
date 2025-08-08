import { create } from "zustand";
import { devtools, subscribeWithSelector } from "zustand/middleware";
import { GameState, Tank, Fish, Entrance, Coin } from "../types/game.types";
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

interface GameStore extends GameState {
  tanks: Map<string, Tank>;
  fish: Map<string, Fish>;
  entrances: Map<string, Entrance>;
  coins: Map<string, Coin>;

  // Expansion system
  expansionTiles: number; // Available tiles in inventory

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
  getAvailableExpansionPositions: (includingSelected?: Set<string>) => { x: number; z: number }[];
  isValidExpansionPosition: (x: number, z: number, includingSelected?: Set<string>) => boolean;

  // Queries
  getTank: (id: string) => Tank | undefined;
  getFish: (id: string) => Fish | undefined;
  getEntrance: (id: string) => Entrance | undefined;
  getCoin: (id: string) => Coin | undefined;
  getFishInTank: (tankId: string) => Fish[];

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

export const useGameStore = createSelectors(
  create<GameStore>()(
    devtools((set, get) => ({
      ...initialState,
      tanks: new Map(),
      fish: new Map(),
      entrances: new Map(),
      coins: new Map(),
      expansionTiles: 0,
      gameTime: 0,
      accumulators: {
        tick: 0,
        water: 0,
        visitors: 0,
        daily: 0,
      },

      setPaused: (paused) => set({ isPaused: paused }),

      setGameSpeed: (speed) => set({ gameSpeed: speed }),

      addMoney: (amount) =>
        set((state) => ({
          money: state.money + amount,
        })),

      spendMoney: (amount) => {
        const state = get();
        if (state.money >= amount) {
          set({ money: state.money - amount });
          return true;
        }
        return false;
      },

      updateReputation: (delta) =>
        set((state) => ({
          reputation: Math.max(0, Math.min(100, state.reputation + delta)),
        })),

      nextDay: () =>
        set((state) => ({
          day: state.day + 1,
          visitorCount: 0,
        })),

      addTank: (tank) =>
        set((state) => {
          const tanks = new Map(state.tanks);
          tanks.set(tank.id, tank);
          return { tanks };
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

          return { fish: fishMap };
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
          return { entrances };
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
      },

      getAvailableExpansionPositions: (includingSelected) => {
        const state = get();
        const gridState = useGridStore.getState();
        const validPositions: { x: number; z: number }[] = [];

        // Calculate dynamic bounds based on existing cells and selected tiles
        let minX = 0, maxX = 2, minZ = 0, maxZ = 2; // Start with original 3x3 bounds
        
        // Expand bounds based on existing grid cells
        for (const cell of gridState.cells.values()) {
          if (cell.y === 0) { // Only consider ground level cells
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

      reset: () =>
        set({
          ...initialState,
          tanks: new Map(),
          fish: new Map(),
          entrances: new Map(),
          coins: new Map(),
          expansionTiles: 0,
          gameTime: 0,
          accumulators: {
            tick: 0,
            water: 0,
            visitors: 0,
            daily: 0,
          },
        }),
    })),
  ),
);
