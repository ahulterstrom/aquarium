import { GraphBuilder } from "@/lib/mapGenerator/graphBuilder";
import { NodeAssigner } from "@/lib/mapGenerator/nodeAssigner";
import { GenerationConfig, MapGraph } from "@/lib/mapGenerator/types";
import { XorShift128Plus } from "@/lib/rng/xorshift123plus";

export interface MapGeneratorOptions {
  config?: GenerationConfig;
  graphRng?: XorShift128Plus;
  nodeRng?: XorShift128Plus;
}

export class MapGenerator {
  private config: GenerationConfig;
  private graphBuilder: GraphBuilder;
  private nodeAssigner: NodeAssigner;
  private baseRng: XorShift128Plus;

  constructor(options: MapGeneratorOptions = {}) {
    this.config = options.config || {
      seed: Date.now(),
      layerCount: 4,
      minPathWidth: 2,
      maxPathWidth: 3,
    };
    
    // If RNG instances are provided, use them directly
    if (options.graphRng && options.nodeRng) {
      this.graphBuilder = new GraphBuilder(options.graphRng);
      this.nodeAssigner = new NodeAssigner(options.nodeRng);
      this.baseRng = options.graphRng; // Use graphRng as base
    } else {
      // Otherwise, create RNG instances from seed
      this.baseRng = new XorShift128Plus(String(this.config.seed));
      const graphRng = new XorShift128Plus(`${this.config.seed}:graph`);
      const nodeRng = new XorShift128Plus(`${this.config.seed}:nodes`);
      
      this.graphBuilder = new GraphBuilder(graphRng);
      this.nodeAssigner = new NodeAssigner(nodeRng);
    }
  }

  generate(): MapGraph {
    const graph = this.graphBuilder.build(this.config);
    this.nodeAssigner.assign(graph);
    return graph;
  }

  setSeed(seed: number): void {
    this.config.seed = seed;
    this.baseRng = new XorShift128Plus(String(seed));
    
    const graphRng = new XorShift128Plus(`${seed}:graph`);
    const nodeRng = new XorShift128Plus(`${seed}:nodes`);
    
    this.graphBuilder = new GraphBuilder(graphRng);
    this.nodeAssigner = new NodeAssigner(nodeRng);
  }
}

// Export everything from index
export type { MapGraph, MapNode, NodeType, GenerationConfig } from "./types";
export { MapRenderer } from "./renderer";

// Example usage:
/*
const canvas = document.getElementById('map-canvas') as HTMLCanvasElement;
const renderer = new MapRenderer(canvas);

const generator = new MapGenerator({ seed: 12345 });
const map = generator.generate();

renderer.render(map);
*/
