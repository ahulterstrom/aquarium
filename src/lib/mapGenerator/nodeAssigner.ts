import { MapGraph, NodeType } from "@/lib/mapGenerator/types";
import { XorShift128Plus } from "@/lib/rng/xorshift123plus";

interface NodeTypeWeight {
  type: NodeType;
  weight: number;
}

export class NodeAssigner {
  private rng: XorShift128Plus;

  constructor(rng: XorShift128Plus) {
    this.rng = rng;
  }

  private random(): number {
    return this.rng.next();
  }

  assign(graph: MapGraph): void {
    const { nodes, layers } = graph;
    const totalLayers = layers.length - 1; // Excluding boss layer

    // Track last positions for spacing constraints
    let lastShopLayer = -3;
    let lastRestLayer = -3;
    const eliteLayers = new Set<number>();

    // Assign types layer by layer
    for (let layer = 1; layer < totalLayers; layer++) {
      const layerNodes = layers[layer];
      const weights = this.getLayerWeights(layer, totalLayers);

      for (const nodeId of layerNodes) {
        const node = nodes.get(nodeId)!;
        let assigned = false;

        // Apply constraints and assign types
        for (let attempts = 0; attempts < 10 && !assigned; attempts++) {
          const type = this.weightedRandom(weights);

          if (type === "shop" && layer - lastShopLayer < 3) continue;
          if (type === "rest" && layer - lastRestLayer < 2) continue;
          if (
            type === "elite" &&
            eliteLayers.has(layer) &&
            layerNodes.length > 1
          )
            continue;

          node.type = type;
          assigned = true;

          if (type === "shop") lastShopLayer = layer;
          if (type === "rest") lastRestLayer = layer;
          if (type === "elite") eliteLayers.add(layer);
        }

        // Fallback to combat if constraints couldn't be satisfied
        if (!assigned) {
          node.type = "combat";
        }
      }
    }

    // Ensure at least one shop and two rest sites exist
    this.ensureMinimumNodes(graph);
  }

  private getLayerWeights(
    layer: number,
    totalLayers: number,
  ): NodeTypeWeight[] {
    const isEliteZone = (layer >= 6 && layer <= 8) || layer >= totalLayers - 3;

    if (isEliteZone) {
      return [
        { type: "combat", weight: 50 },
        { type: "elite", weight: 20 },
        { type: "event", weight: 15 },
        { type: "rest", weight: 8 },
        { type: "shop", weight: 5 },
        { type: "treasure", weight: 2 },
      ];
    }

    return [
      { type: "combat", weight: 60 },
      { type: "event", weight: 20 },
      { type: "rest", weight: 10 },
      { type: "shop", weight: 7 },
      { type: "treasure", weight: 3 },
    ];
  }

  private weightedRandom(weights: NodeTypeWeight[]): NodeType {
    const totalWeight = weights.reduce((sum, w) => sum + w.weight, 0);
    let random = this.random() * totalWeight;

    for (const { type, weight } of weights) {
      random -= weight;
      if (random <= 0) return type;
    }

    return weights[weights.length - 1].type;
  }

  private ensureMinimumNodes(graph: MapGraph): void {
    const { nodes, layers } = graph;
    const nodeList = Array.from(nodes.values()).filter(
      (n) => n.type !== "start" && n.type !== "boss",
    );

    const shopCount = nodeList.filter((n) => n.type === "shop").length;
    const restCount = nodeList.filter((n) => n.type === "rest").length;

    // Add shops if needed
    if (shopCount < 1) {
      const candidate = nodeList.find(
        (n) => n.type === "combat" && n.layer >= 3 && n.layer <= 12,
      );
      if (candidate) candidate.type = "shop";
    }

    // Add rest sites if needed
    let restsToAdd = Math.max(0, 2 - restCount);
    for (const node of nodeList) {
      if (restsToAdd === 0) break;
      if (node.type === "combat" && node.layer >= 4) {
        node.type = "rest";
        restsToAdd--;
      }
    }
  }
}
