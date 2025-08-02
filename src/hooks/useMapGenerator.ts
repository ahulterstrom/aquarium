import { useCallback } from "react";
import { MapGenerator, GenerationConfig } from "@/lib/mapGenerator";
import { useRNG } from "@/lib/rng/useRng";

export function useMapGenerator(config?: Partial<GenerationConfig>) {
  // Get RNG generators from the React context
  const getGraphRNG = useRNG({ category: "map", subcategory: "graph" });
  const getNodeRNG = useRNG({ category: "map", subcategory: "nodes" });

  const generate = useCallback(() => {
    // Get fresh RNG instances for this generation
    const graphRng = getGraphRNG();
    const nodeRng = getNodeRNG();
    
    // Create a MapGenerator with the RNG instances from the React context
    const generator = new MapGenerator({
      config: {
        seed: Date.now(), // This is ignored when RNG instances are provided
        layerCount: config?.layerCount ?? 4,
        minPathWidth: config?.minPathWidth ?? 2,
        maxPathWidth: config?.maxPathWidth ?? 3,
      },
      graphRng,
      nodeRng
    });
    
    return generator.generate();
  }, [getGraphRNG, getNodeRNG, config?.layerCount, config?.minPathWidth, config?.maxPathWidth]);

  return { generate };
}