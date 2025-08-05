import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { GridCell, GridPosition } from "../types/game.types";
import { createSelectors } from "@/stores/utils";

interface GridStore {
  gridSize: { width: number; height: number; depth: number };
  cells: Map<string, GridCell>;

  // Grid operations
  initializeGrid: (width: number, height: number, depth: number) => void;
  getCell: (x: number, y: number, z: number) => GridCell | undefined;
  setCell: (cell: GridCell) => void;

  // Placement validation
  canPlaceAt: (position: GridPosition, width: number, depth: number) => boolean;
  canPlaceEntranceAt: (position: GridPosition) => boolean;
  placeObject: (
    position: GridPosition,
    width: number,
    depth: number,
    type: GridCell["type"],
    id?: string,
  ) => boolean;
  removeObject: (position: GridPosition, width: number, depth: number) => void;

  // Pathfinding helpers
  getNeighbors: (position: GridPosition) => GridCell[];
  isWalkable: (x: number, y: number, z: number) => boolean;
  findPath: (start: GridPosition, end: GridPosition) => GridPosition[] | null;

  // Utilities
  getCellKey: (x: number, y: number, z: number) => string;
  parseCellKey: (key: string) => GridPosition;
  getEdgeForPosition: (
    position: GridPosition,
  ) => "north" | "south" | "east" | "west" | null;
  reset: () => void;
}

export const useGridStore = createSelectors(
  create<GridStore>()(
    devtools((set, get) => ({
      gridSize: { width: 3, height: 1, depth: 3 },
      cells: new Map(),

      initializeGrid: (width, height, depth) => {
        const cells = new Map<string, GridCell>();

        for (let x = 0; x < width; x++) {
          for (let y = 0; y < height; y++) {
            for (let z = 0; z < depth; z++) {
              const key = `${x},${y},${z}`;
              cells.set(key, {
                x,
                y,
                z,
                occupied: false,
                type: "empty",
              });
            }
          }
        }

        set({
          gridSize: { width, height, depth },
          cells,
        });
      },

      getCell: (x, y, z) => {
        return get().cells.get(`${x},${y},${z}`);
      },

      setCell: (cell) =>
        set((state) => {
          const cells = new Map(state.cells);
          cells.set(`${cell.x},${cell.y},${cell.z}`, cell);
          return { cells };
        }),

      canPlaceAt: (position, width, depth) => {
        const state = get();

        for (let x = position.x; x < position.x + width; x++) {
          for (let z = position.z; z < position.z + depth; z++) {
            const cell = state.getCell(x, position.y, z);
            if (!cell || cell.occupied) {
              return false;
            }
          }
        }

        return true;
      },

      canPlaceEntranceAt: (position) => {
        const state = get();

        // First check if the position is valid and not occupied
        if (!state.canPlaceAt(position, 1, 1)) {
          return false;
        }

        // Check if position is on the exterior (perimeter) of the grid
        const { width, depth } = state.gridSize;
        const { x, z } = position;

        // Position must be on the edge of the grid
        const isOnPerimeter =
          x === 0 || x === width - 1 || z === 0 || z === depth - 1;

        return isOnPerimeter;
      },

      placeObject: (position, width, depth, type, id) => {
        const state = get();

        if (!state.canPlaceAt(position, width, depth)) {
          return false;
        }

        const cells = new Map(state.cells);

        for (let x = position.x; x < position.x + width; x++) {
          for (let z = position.z; z < position.z + depth; z++) {
            const key = `${x},${position.y},${z}`;
            const cell = cells.get(key);
            if (cell) {
              cells.set(key, {
                ...cell,
                occupied: true,
                type,
                tankId: type === "tank" ? id : undefined,
                entranceId: type === "entrance" ? id : undefined,
              });
            }
          }
        }

        set({ cells });
        return true;
      },

      removeObject: (position, width, depth) =>
        set((state) => {
          const cells = new Map(state.cells);

          for (let x = position.x; x < position.x + width; x++) {
            for (let z = position.z; z < position.z + depth; z++) {
              const key = `${x},${position.y},${z}`;
              const cell = cells.get(key);
              if (cell) {
                cells.set(key, {
                  ...cell,
                  occupied: false,
                  type: "empty",
                  tankId: undefined,
                  entranceId: undefined,
                });
              }
            }
          }

          return { cells };
        }),

      getNeighbors: (position) => {
        const state = get();
        const neighbors: GridCell[] = [];

        const directions = [
          { x: 0, z: 1 }, // North
          { x: 1, z: 0 }, // East
          { x: 0, z: -1 }, // South
          { x: -1, z: 0 }, // West
        ];

        for (const dir of directions) {
          const cell = state.getCell(
            position.x + dir.x,
            position.y,
            position.z + dir.z,
          );
          if (cell) {
            neighbors.push(cell);
          }
        }

        return neighbors;
      },

      isWalkable: (x, y, z) => {
        const cell = get().getCell(x, y, z);
        return cell ? cell.type === "path" || cell.type === "empty" : false;
      },

      getCellKey: (x, y, z) => `${x},${y},${z}`,

      parseCellKey: (key) => {
        const [x, y, z] = key.split(",").map(Number);
        return { x, y, z };
      },

      getEdgeForPosition: (position) => {
        const { width, depth } = get().gridSize;
        const { x, z } = position;

        // Determine which edge this position is on
        if (z === 0) return "north"; // Top edge
        if (z === depth - 1) return "south"; // Bottom edge
        if (x === 0) return "west"; // Left edge
        if (x === width - 1) return "east"; // Right edge

        return null; // Not on an edge
      },

      reset: () =>
        set({
          cells: new Map(),
        }),
    })),
  ),
);
