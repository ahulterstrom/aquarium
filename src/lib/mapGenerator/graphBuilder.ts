import { GenerationConfig, MapGraph, MapNode } from "@/lib/mapGenerator/types";
import { XorShift128Plus } from "@/lib/rng/xorshift123plus";

export class GraphBuilder {
  private rng: XorShift128Plus;

  constructor(rng: XorShift128Plus) {
    this.rng = rng;
  }

  private random(): number {
    return this.rng.next();
  }

  build(config: GenerationConfig): MapGraph {
    const layerCount = config.layerCount;
    const minPathWidth = config.minPathWidth;
    const maxPathWidth = config.maxPathWidth;
    const nodes = new Map<string, MapNode>();
    const layers: string[][] = [];

    // Create start node
    const startNode: MapNode = {
      id: "start",
      type: "start",
      layer: 0,
      position: { x: 0.5, y: 0 },
      connections: [],
    };
    nodes.set(startNode.id, startNode);
    layers[0] = [startNode.id];

    // Generate middle layers
    const layerWidths = this.generateLayerWidths(
      layerCount,
      minPathWidth,
      maxPathWidth,
    );

    for (let layer = 1; layer < layerCount; layer++) {
      const width = layerWidths[layer];
      layers[layer] = [];

      for (let i = 0; i < width; i++) {
        const node: MapNode = {
          id: `node-${layer}-${i}`,
          type: "combat", // Temporary, will be assigned later
          layer,
          position: {
            x: (i + 1) / (width + 1),
            y: layer / layerCount,
          },
          connections: [],
        };
        nodes.set(node.id, node);
        layers[layer].push(node.id);
      }
    }

    // Create boss node
    const bossNode: MapNode = {
      id: "boss",
      type: "boss",
      layer: layerCount,
      position: { x: 0.5, y: 1 },
      connections: [],
    };
    nodes.set(bossNode.id, bossNode);
    layers[layerCount] = [bossNode.id];

    // Generate connections
    this.generateConnections(nodes, layers);

    // Add position randomization
    this.randomizePositions(nodes, layers);

    return {
      nodes,
      layers,
      startNodeId: startNode.id,
      bossNodeId: bossNode.id,
    };
  }

  private generateLayerWidths(
    layerCount: number,
    minWidth: number,
    maxWidth: number,
  ): number[] {
    const widths: number[] = new Array(layerCount + 1);
    widths[0] = 1; // Start
    widths[layerCount] = 1; // Boss

    // Create a diamond shape
    const midPoint = Math.floor(layerCount / 2);

    for (let i = 1; i < layerCount; i++) {
      // Calculate progress to/from midpoint
      const distanceFromMid = Math.abs(i - midPoint);
      const maxDistance = Math.max(midPoint, layerCount - midPoint - 1);

      // Use a quadratic curve for smoother diamond shape
      const progress = 1 - distanceFromMid / maxDistance;
      const curveProgress = progress * progress; // Quadratic curve

      // Calculate base width using the curve
      const baseWidth =
        minWidth + Math.floor((maxWidth - minWidth) * curveProgress);

      // Add slight randomization (±1) to prevent perfect symmetry
      const variance = Math.floor(this.random() * 3) - 1;
      widths[i] = Math.max(minWidth, Math.min(maxWidth, baseWidth + variance));
    }

    console.log("widths:", widths);

    return widths;
  }

  private generateConnections(nodes: Map<string, MapNode>, layers: string[][]) {
    // Track all existing connections to check for intersections
    const allConnections: Array<[string, string]> = [];

    for (let layer = 0; layer < layers.length - 1; layer++) {
      const currentLayer = layers[layer];
      const nextLayer = layers[layer + 1];

      // Sort nodes by x position for better connection patterns
      const sortedCurrentLayer = [...currentLayer].sort((a, b) => {
        const nodeA = nodes.get(a)!;
        const nodeB = nodes.get(b)!;
        return nodeA.position.x - nodeB.position.x;
      });

      const sortedNextLayer = [...nextLayer].sort((a, b) => {
        const nodeA = nodes.get(a)!;
        const nodeB = nodes.get(b)!;
        return nodeA.position.x - nodeB.position.x;
      });

      // Ensure each node connects to at least one node in the next layer
      for (const nodeId of sortedCurrentLayer) {
        const node = nodes.get(nodeId)!;
        const connectionCount = Math.min(
          nextLayer.length,
          1 + Math.floor(this.random() * 3), // 1-3 connections
        );

        // Try to connect to nearby nodes first to minimize crossing
        const targetCandidates = this.getTargetCandidates(
          node,
          sortedNextLayer,
          nodes,
        );

        let connectionsAdded = 0;
        for (const targetId of targetCandidates) {
          if (connectionsAdded >= connectionCount) break;

          // Check if this connection would intersect with existing ones
          if (!this.wouldIntersect(nodeId, targetId, allConnections, nodes)) {
            if (!node.connections.includes(targetId)) {
              node.connections.push(targetId);
              allConnections.push([nodeId, targetId]);
              connectionsAdded++;
            }
          }
        }

        // If we couldn't make enough connections without intersecting,
        // force at least one connection to the closest node
        if (connectionsAdded === 0) {
          const closestTarget = this.findClosestNode(
            node,
            sortedNextLayer,
            nodes,
          );
          if (closestTarget && !node.connections.includes(closestTarget)) {
            node.connections.push(closestTarget);
            allConnections.push([nodeId, closestTarget]);
          }
        }
      }

      // Ensure each node in next layer has at least one incoming connection
      for (const nextNodeId of nextLayer) {
        const hasIncoming = currentLayer.some((nodeId) =>
          nodes.get(nodeId)!.connections.includes(nextNodeId),
        );

        if (!hasIncoming) {
          // Connect from the closest node in current layer
          const nextNode = nodes.get(nextNodeId)!;
          const closestSource = this.findClosestNode(
            nextNode,
            sortedCurrentLayer,
            nodes,
          );

          if (closestSource) {
            const sourceNode = nodes.get(closestSource)!;
            sourceNode.connections.push(nextNodeId);
            allConnections.push([closestSource, nextNodeId]);
          }
        }
      }
    }
  }

  private getTargetCandidates(
    sourceNode: MapNode,
    targetLayer: string[],
    nodes: Map<string, MapNode>,
  ): string[] {
    // Sort targets by distance from source
    return [...targetLayer].sort((a, b) => {
      const nodeA = nodes.get(a)!;
      const nodeB = nodes.get(b)!;
      const distA = Math.abs(nodeA.position.x - sourceNode.position.x);
      const distB = Math.abs(nodeB.position.x - sourceNode.position.x);
      return distA - distB;
    });
  }

  private findClosestNode(
    node: MapNode,
    candidates: string[],
    nodes: Map<string, MapNode>,
  ): string | null {
    let closest: string | null = null;
    let minDistance = Infinity;

    for (const candidateId of candidates) {
      const candidate = nodes.get(candidateId)!;
      const distance = Math.abs(candidate.position.x - node.position.x);
      if (distance < minDistance) {
        minDistance = distance;
        closest = candidateId;
      }
    }

    return closest;
  }

  private wouldIntersect(
    sourceId: string,
    targetId: string,
    existingConnections: Array<[string, string]>,
    nodes: Map<string, MapNode>,
  ): boolean {
    const source = nodes.get(sourceId)!;
    const target = nodes.get(targetId)!;

    for (const [existingSourceId, existingTargetId] of existingConnections) {
      const existingSource = nodes.get(existingSourceId)!;
      const existingTarget = nodes.get(existingTargetId)!;

      // Only check connections between the same two layers
      if (
        source.layer !== existingSource.layer ||
        target.layer !== existingTarget.layer
      ) {
        continue;
      }

      // Check if the lines would cross
      if (
        this.linesIntersect(
          source.position.x,
          source.position.y,
          target.position.x,
          target.position.y,
          existingSource.position.x,
          existingSource.position.y,
          existingTarget.position.x,
          existingTarget.position.y,
        )
      ) {
        return true;
      }
    }

    return false;
  }

  private linesIntersect(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    x3: number,
    y3: number,
    x4: number,
    y4: number,
  ): boolean {
    // Calculate the direction of the lines
    const denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);

    // Lines are parallel
    if (Math.abs(denom) < 0.0001) {
      return false;
    }

    const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denom;
    const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / denom;

    // Check if intersection point is within both line segments
    return t > 0.01 && t < 0.99 && u > 0.01 && u < 0.99;
  }

  private randomizePositions(nodes: Map<string, MapNode>, layers: string[][]) {
    for (let layer = 1; layer < layers.length - 1; layer++) {
      for (const nodeId of layers[layer]) {
        const node = nodes.get(nodeId)!;
        // Add small random offset to x position
        const offset = (this.random() - 0.5) * 0.1;
        node.position.x = Math.max(
          0.1,
          Math.min(0.9, node.position.x + offset),
        );
      }
    }
  }
}
