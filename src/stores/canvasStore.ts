import { createSelectors } from "@/stores/utils";
import { create } from "zustand";

interface CanvasStore {
  canvas: HTMLCanvasElement | null;
  setCanvas: (canvas: HTMLCanvasElement | null) => void;
}

export const useCanvasStore = createSelectors(
  create<CanvasStore>()((set) => ({
    canvas: null,
    setCanvas: (canvas) => set({ canvas }),
  }))
);