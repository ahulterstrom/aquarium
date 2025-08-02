import { RNGContext, RNGState } from "@/lib/rng/types";
import { XorShift128Plus } from "@/lib/rng/xorshift123plus";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface RNGInstance {
  rng: XorShift128Plus;
  sequenceId: number;
}

interface RNGStore {
  mainSeed: string;
  instances: Map<string, RNGInstance>;
  savedStates: Map<string, RNGState>;

  // Actions
  initialize: (seed: string) => void;
  getRNG: (context: RNGContext) => XorShift128Plus;
  saveState: () => void;
  loadState: (savedStates: Map<string, RNGState>) => void;
  reset: () => void;
}

export const useRNGStore = create<RNGStore>()(
  persist(
    (set, get) => ({
      mainSeed: "",
      instances: new Map(),
      savedStates: new Map(),

      initialize: (seed: string) => {
        set({
          mainSeed: seed,
          instances: new Map(),
          savedStates: new Map(),
        });
      },

      getRNG: (context: RNGContext) => {
        const state = get();
        const key = `${context.category}${context.subcategory ? `:${context.subcategory}` : ""}`;

        let instance = state.instances.get(key);

        if (!instance) {
          // Create deterministic seed based on main seed and context
          const contextSeed = `${state.mainSeed}:${key}`;
          const rng = new XorShift128Plus(contextSeed);
          instance = { rng, sequenceId: 0 };

          // Check if we have a saved state for this context
          const savedState = state.savedStates.get(key);
          if (savedState) {
            rng.setState(savedState.state);
            instance.sequenceId = savedState.sequenceId;
          }

          state.instances.set(key, instance);
        }

        instance.sequenceId++;
        return instance.rng;
      },

      saveState: () => {
        const state = get();
        const newSavedStates = new Map<string, RNGState>();

        state.instances.forEach((instance, key) => {
          newSavedStates.set(key, {
            seed: state.mainSeed,
            state: instance.rng.getState(),
            sequenceId: instance.sequenceId,
          });
        });

        set({ savedStates: newSavedStates });
      },

      loadState: (savedStates: Map<string, RNGState>) => {
        set({ savedStates });
      },

      reset: () => {
        set({
          instances: new Map(),
          savedStates: new Map(),
        });
      },
    }),
    {
      name: "game-rng-state",
      partialize: (state) => ({
        mainSeed: state.mainSeed,
        savedStates: Array.from(state.savedStates.entries()),
      }),
      onRehydrateStorage: () => (state) => {
        if (state && Array.isArray(state.savedStates)) {
          state.savedStates = new Map(state.savedStates);
        }
      },
    },
  ),
);
