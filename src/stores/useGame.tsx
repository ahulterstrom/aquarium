import { create, StateCreator, StoreApi, UseBoundStore } from "zustand";
import { devtools, persist } from "zustand/middleware";

import { pcg32Float, pcg32IntBetween } from "@/lib/pcg";
import { SetStateFunction } from "@/stores/types";
import { createSelectors } from "@/stores/utils";

type GameState = {
  isMuted: boolean;
  toggleMute: () => void;
  musicVolume: number;
  setMusicVolume: (volume: number) => void;
  sfxVolume: number;
  setSfxVolume: (volume: number) => void;
  masterVolume: number;
  setMasterVolume: (volume: number) => void;

  /** the only piece of RNG state we persist */
  rngState: string; // bigint serialized as decimal string

  /** Initialize a fresh run (or reload): set seed */
  initRun: (seed: bigint) => void;

  /** Next uniform [0,1) draw */
  next: () => number;

  /** Next integer in [min,max] */
  intBetween: (min: number, max: number) => number;

  isDebugging: boolean;
  setIsDebugging: (isDebugging: boolean) => void;

  score: number;
  increaseScore: () => void;
  setScore: (scoreState: number | SetStateFunction<number>) => void;
};

const createGameState: StateCreator<
  GameState,
  [["zustand/devtools", never]],
  [],
  GameState
> = (set, get) => ({
  isMuted: false,
  toggleMute: () => set((state) => ({ isMuted: !state.isMuted })),
  musicVolume: 1,
  setMusicVolume: (volume) =>
    set(() => ({ musicVolume: volume }), undefined, {
      type: "setMusicVolume",
      volume,
    }),
  sfxVolume: 1,
  setSfxVolume: (volume) =>
    set(() => ({ sfxVolume: volume }), undefined, {
      type: "setSfxVolume",
      volume,
    }),
  masterVolume: 1,
  setMasterVolume: (volume) =>
    set(() => ({ masterVolume: volume }), undefined, {
      type: "setMasterVolume",
      volume,
    }),

  rngState: "0",

  initRun: (seed) => {
    // store bigint as string for JSON
    set({ rngState: seed.toString() });
  },

  next: () => {
    const rs = BigInt(get().rngState);
    const { value, nextState } = pcg32Float(rs);
    set({ rngState: nextState.toString() });
    return value;
  },

  intBetween: (min, max) => {
    const rs = BigInt(get().rngState);
    const { value, nextState } = pcg32IntBetween(rs, min, max);
    set({ rngState: nextState.toString() });
    return value;
  },

  isDebugging: window.location.hash === "#debug",
  setIsDebugging: (isDebugging) =>
    set(() => ({ isDebugging }), undefined, {
      type: "setIsDebugging",
      isDebugging,
    }),

  score: 0,
  increaseScore: () => set((state) => ({ score: state.score + 1 })),
  setScore: (scoreState) =>
    set(
      (state) => ({
        score:
          typeof scoreState === "function"
            ? scoreState(state.score)
            : scoreState,
      }),
      undefined,
      { type: "setScore", scoreState },
    ),
});

export const useGame = createSelectors(
  create<GameState>()(
    devtools(
      persist(
        (...a) => ({
          ...createGameState(...a),
        }),
        {
          name: "game-storage",
          partialize: (state) => ({
            isMuted: state.isMuted,
            isDebugging: state.isDebugging,
            musicVolume: state.musicVolume,
            sfxVolume: state.sfxVolume,
            masterVolume: state.masterVolume,
            rngState: state.rngState,
          }),
        },
      ),
      { enabled: process.env.NODE_ENV === "development" },
    ),
  ),
);
