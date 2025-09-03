import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { GridCell, GridPosition } from "../types/game.types";
import { createSelectors } from "@/stores/utils";

const getInitialGrid = () => {
  const cells = new Map<string, GridCell>();
  const width = 3;
  const height = 1;
  const depth = 3;

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

  return cells;
};

export interface GridStore {
  gridSize: { width: number; height: number; depth: number };
  cells: Map<string, GridCell>;

  // Grid operations
  getCell: (x: number, y: number, z: number) => GridCell | undefined;
  setCell: (cell: GridCell) => void;
  createExpansionCells: (positions: { x: number; z: number }[]) => void;

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
    devtools(
      persist(
        (set, get, store) => ({
          gridSize: { width: 3, height: 1, depth: 3 },
          cells: getInitialGrid(),

          getCell: (x, y, z) => {
            return get().cells.get(`${x},${y},${z}`);
          },

          setCell: (cell) =>
            set((state) => {
              const cells = new Map(state.cells);
              cells.set(`${cell.x},${cell.y},${cell.z}`, cell);
              return { cells };
            }),

          createExpansionCells: (positions) =>
            set((state) => {
              const cells = new Map(state.cells);

              for (const pos of positions) {
                const key = `${pos.x},0,${pos.z}`;
                const newCell = {
                  x: pos.x,
                  y: 0,
                  z: pos.z,
                  occupied: false,
                  type: "empty" as const,
                };
                cells.set(key, newCell);
              }

              return { cells };
            }),

          canPlaceAt: (position, width, depth) => {
            const state = get();

            for (let x = position.x; x < position.x + width; x++) {
              for (let z = position.z; z < position.z + depth; z++) {
                const cell = state.getCell(x, position.y, z);

                // Can place only if cell exists and is not occupied
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
                  // Update existing grid cell
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
              { x: 1, z: 1 }, // Northeast
              { x: 1, z: -1 }, // Southeast
              { x: -1, z: -1 }, // Southwest
              { x: -1, z: 1 }, // Northwest
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
            if (!cell) {
              // console.log(`No cell at ${x},${y},${z}`);
              return false;
            }

            // First check basic walkability
            if (
              (cell.occupied && cell.type !== "entrance") ||
              (cell.type !== "path" &&
                cell.type !== "empty" &&
                cell.type !== "entrance")
            ) {
              return false;
            }

            return true;
          },

          findPath: (start, end) => {
            // Simple A* pathfinding implementation
            const state = get();
            const openSet = new Set<string>();
            const closedSet = new Set<string>();
            const cameFrom = new Map<string, string>();
            const gScore = new Map<string, number>();
            const fScore = new Map<string, number>();

            const startKey = state.getCellKey(start.x, start.y, start.z);
            const endKey = state.getCellKey(end.x, end.y, end.z);

            openSet.add(startKey);
            gScore.set(startKey, 0);
            fScore.set(startKey, heuristic(start, end));

            let iterations = 0;
            const maxIterations = 1000; // Prevent infinite loops

            while (openSet.size > 0 && iterations < maxIterations) {
              iterations++;
              let current = "";
              let lowestF = Infinity;

              for (const key of openSet) {
                const f = fScore.get(key) || Infinity;
                if (f < lowestF) {
                  lowestF = f;
                  current = key;
                }
              }

              if (current === endKey) {
                return reconstructPath(cameFrom, current, state);
              }

              openSet.delete(current);
              closedSet.add(current);

              const currentPos = state.parseCellKey(current);
              const neighbors = state.getNeighbors(currentPos);

              for (const neighbor of neighbors) {
                const neighborKey = state.getCellKey(
                  neighbor.x,
                  neighbor.y,
                  neighbor.z,
                );

                if (
                  closedSet.has(neighborKey) ||
                  !state.isWalkable(neighbor.x, neighbor.y, neighbor.z)
                ) {
                  continue;
                }

                const tentativeG = (gScore.get(current) || 0) + 1;

                if (!openSet.has(neighborKey)) {
                  openSet.add(neighborKey);
                } else if (
                  tentativeG >= (gScore.get(neighborKey) || Infinity)
                ) {
                  continue;
                }

                cameFrom.set(neighborKey, current);
                gScore.set(neighborKey, tentativeG);
                fScore.set(neighborKey, tentativeG + heuristic(neighbor, end));
              }
            }

            if (iterations >= maxIterations) {
              console.warn(
                `A* pathfinding hit iteration limit (${maxIterations}) from ${JSON.stringify(start)} to ${JSON.stringify(end)}`,
              );
            }

            return null;
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

          reset: () => set(store.getInitialState()),
        }),
        {
          name: "aquarium-grid-state",
          partialize: (state) => ({
            gridSize: state.gridSize,
            cells: Array.from(state.cells.entries()),
          }),
          onRehydrateStorage: () => (state) => {
            if (state) {
              // Convert arrays back to Maps
              state.cells = new Map(state.cells);
            }
          },
        },
      ),
    ),
  ),
);

function heuristic(a: GridPosition, b: GridPosition): number {
  // Use Chebyshev distance for 8-directional movement (including diagonals)
  return Math.max(Math.abs(a.x - b.x), Math.abs(a.z - b.z));
}

function reconstructPath(
  cameFrom: Map<string, string>,
  current: string,
  state: ReturnType<typeof useGridStore.getState>,
): GridPosition[] {
  const path: GridPosition[] = [];
  let currentKey = current;

  while (cameFrom.has(currentKey)) {
    path.unshift(state.parseCellKey(currentKey));
    currentKey = cameFrom.get(currentKey)!;
  }

  path.unshift(state.parseCellKey(currentKey));
  return path;
}
