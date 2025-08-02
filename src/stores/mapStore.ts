import { create, StateCreator } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { MapGraph, MapNode } from "@/lib/mapGenerator/types";
import { createSelectors } from "@/stores/utils";

interface MapStore {
  // Current map data
  currentMap: MapGraph | null;

  // Map state
  visitedNodes: Set<string>;
  currentNodeId: string | null; // Player's current position

  // Actions
  setMap: (map: MapGraph) => void;
  visitNode: (nodeId: string) => void;
  clearMap: () => void;

  // Queries
  getNode: (nodeId: string) => MapNode | undefined;
  isNodeAccessible: (nodeId: string) => boolean;
  getAccessibleNodes: () => string[];
}

const createMapStore: StateCreator<
  MapStore,
  [["zustand/devtools", never]],
  [],
  MapStore
> = (set, get) => ({
  currentMap: null,
  visitedNodes: new Set<string>(),
  currentNodeId: null,

  // Actions
  setMap: (map) =>
    set({
      currentMap: map,
      visitedNodes: new Set([map.startNodeId]),
      currentNodeId: map.startNodeId,
    }),

  visitNode: (nodeId) =>
    set((state) => {
      const newVisited = new Set(state.visitedNodes);
      newVisited.add(nodeId);
      return {
        visitedNodes: newVisited,
      };
    }),

  clearMap: () =>
    set({
      currentMap: null,
      visitedNodes: new Set(),
    }),

  // Queries
  getNode: (nodeId) => {
    const map = get().currentMap;
    return map?.nodes.get(nodeId);
  },

  isNodeAccessible: (nodeId) => {
    const state = get();
    const { currentMap, currentNodeId, visitedNodes } = state;

    if (!currentMap || !currentNodeId) return false;
    if (visitedNodes.has(nodeId)) return false;

    // Check if node is connected to current position
    const currentNode = currentMap.nodes.get(currentNodeId);
    if (!currentNode) return false;

    return currentNode.connections.includes(nodeId);
  },

  getAccessibleNodes: () => {
    const state = get();
    const { currentMap, currentNodeId } = state;

    if (!currentMap || !currentNodeId) return [];

    const currentNode = currentMap.nodes.get(currentNodeId);
    if (!currentNode) return [];

    return currentNode.connections.filter((nodeId) =>
      get().isNodeAccessible(nodeId),
    );
  },
});

export const useMapStore = createSelectors(
  create<MapStore>()(
    devtools(
      persist(
        (...a) => ({
          ...createMapStore(...a),
        }),
        {
          name: "map-storage",
          partialize: (state) => ({
            currentMap: state.currentMap,
            visitedNodes: Array.from(state.visitedNodes),
            currentNodeId: state.currentNodeId,
          }),
        },
      ),
      { enabled: process.env.NODE_ENV === "development" },
    ),
  ),
);
