import { create } from "zustand";
import { devtools, subscribeWithSelector } from "zustand/middleware";
import { GameState, Tank, Fish, Visitor } from "../types/game.types";

interface GameStore extends GameState {
  tanks: Map<string, Tank>;
  fish: Map<string, Fish>;
  visitors: Map<string, Visitor>;

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

  addVisitor: (visitor: Visitor) => void;
  removeVisitor: (id: string) => void;
  updateVisitor: (id: string, updates: Partial<Visitor>) => void;

  // Queries
  getTank: (id: string) => Tank | undefined;
  getFish: (id: string) => Fish | undefined;
  getVisitor: (id: string) => Visitor | undefined;
  getFishInTank: (tankId: string) => Fish[];

  // Game state
  reset: () => void;
}

const initialState: GameState = {
  money: 10,
  reputation: 50,
  visitorCount: 0,
  day: 1,
  isPaused: false,
  gameSpeed: 1,
};

export const useGameStore = create<GameStore>()(
  devtools(
    subscribeWithSelector((set, get) => ({
      ...initialState,
      tanks: new Map(),
      fish: new Map(),
      visitors: new Map(),
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
          return { fish: fishMap };
        }),

      removeFish: (id) =>
        set((state) => {
          const fishMap = new Map(state.fish);
          fishMap.delete(id);
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

      addVisitor: (visitor) =>
        set((state) => {
          const visitors = new Map(state.visitors);
          visitors.set(visitor.id, visitor);
          return {
            visitors,
            visitorCount: state.visitorCount + 1,
          };
        }),

      removeVisitor: (id) =>
        set((state) => {
          const visitors = new Map(state.visitors);
          visitors.delete(id);
          return { visitors };
        }),

      updateVisitor: (id, updates) =>
        set((state) => {
          const visitors = new Map(state.visitors);
          const visitor = visitors.get(id);
          if (visitor) {
            visitors.set(id, { ...visitor, ...updates });
          }
          return { visitors };
        }),

      getTank: (id) => get().tanks.get(id),

      getFish: (id) => get().fish.get(id),

      getVisitor: (id) => get().visitors.get(id),

      getFishInTank: (tankId) => {
        const state = get();
        return Array.from(state.fish.values()).filter(
          (fish) => fish.tankId === tankId,
        );
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
          visitors: new Map(),
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
