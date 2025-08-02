export type NodeType =
  | "start"
  | "combat"
  | "elite"
  | "rest"
  | "shop"
  | "event"
  | "treasure"
  | "boss";

export interface MapNode {
  id: string;
  type: NodeType;
  layer: number;
  position: { x: number; y: number };
  connections: string[]; // IDs of connected nodes in next layer
}

export interface MapGraph {
  nodes: Map<string, MapNode>;
  layers: string[][]; // Node IDs organized by layer
  startNodeId: string;
  bossNodeId: string;
}

export interface GenerationConfig {
  seed: number;
  layerCount: number;
  minPathWidth: number;
  maxPathWidth: number;
}
