import { useSceneMachine } from "@/contexts/scene/useScene";
import { MapRenderer } from "@/lib/mapGenerator";
import { useMapGenerator } from "@/hooks/useMapGenerator";
import { useMapStore } from "@/stores/mapStore";
import { ArrowLeft } from "lucide-react";
import { useCallback, useEffect, useRef } from "react";

function SlayTheSpireMap() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<MapRenderer | null>(null);
  const { generate } = useMapGenerator({
    layerCount: 15,
    minPathWidth: 2,
    maxPathWidth: 3,
  });

  // Use map store
  const currentMap = useMapStore((state) => state.currentMap);
  const hoveredNode = useMapStore((state) => state.hoveredNode);
  const selectedNode = useMapStore((state) => state.selectedNode);
  const setMap = useMapStore((state) => state.setMap);
  // const setHoveredNode = useMapStore((state) => state.setHoveredNode);
  const setSelectedNode = useMapStore((state) => state.setSelectedNode);
  const visitNode = useMapStore((state) => state.visitNode);
  const isNodeAccessible = useMapStore((state) => state.isNodeAccessible);

  // Generate initial map
  useEffect(() => {
    handleGenerateMap();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Setup canvas and renderer
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const renderer = new MapRenderer(canvas);
    rendererRef.current = renderer;

    // Handle resize
    const handleResize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      if (currentMap) {
        renderer.render(currentMap, hoveredNode, selectedNode);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      renderer.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-render when map or selection changes
  useEffect(() => {
    if (currentMap && rendererRef.current) {
      rendererRef.current.render(currentMap, hoveredNode, selectedNode);
    }
  }, [currentMap, hoveredNode, selectedNode]);

  const handleGenerateMap = useCallback(() => {
    const newMap = generate();
    console.log("Generated map:", newMap);
    setMap(newMap);
  }, [generate, setMap]);

  const handleCanvasMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!canvasRef.current || !rendererRef.current) return;

      const rect = canvasRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const nodeId = rendererRef.current.getNodeAt(x, y);
      // setHoveredNode(nodeId);
    },
    [],
  );

  const handleCanvasClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!canvasRef.current || !rendererRef.current) return;

      const rect = canvasRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const nodeId = rendererRef.current.getNodeAt(x, y);
      if (nodeId) {
        // Only allow selecting accessible nodes or already visited nodes
        if (isNodeAccessible(nodeId)) {
          setSelectedNode(nodeId);
          // Optionally visit the node if it's accessible
          visitNode(nodeId);
        } else {
          // Just select for viewing if not accessible
          setSelectedNode(nodeId);
        }
      }
    },
    [isNodeAccessible, setSelectedNode, visitNode],
  );

  const handleCanvasMouseLeave = useCallback(() => {
    // setHoveredNode(null);
  }, []);

  return (
    <div className="flex h-screen w-full flex-col">
      <div className="pointer-events-auto bg-gray-800 p-4 shadow-lg">
        <div className="mx-auto flex max-w-4xl items-center gap-4">
          <h1 className="text-2xl font-bold text-white">
            Slay the Spire Map Generator
          </h1>
          <div className="flex-1" />
          <button
            onClick={handleGenerateMap}
            className="rounded bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
          >
            Generate New Map
          </button>
        </div>
      </div>
    </div>
  );
}

export const MapUI = () => {
  const sceneMachineRef = useSceneMachine();

  return (
    <div className="relative flex size-full">
      <button
        className="pointer-events-auto absolute top-4 left-4 rounded-md border border-purple-500/30 bg-black/50 px-4 py-2 text-lg font-bold text-purple-400 backdrop-blur-sm transition-all hover:bg-purple-500/10 hover:text-purple-300"
        onClick={() => sceneMachineRef.send({ type: "BACK" })}
      >
        <ArrowLeft />
      </button>

      <SlayTheSpireMap />
    </div>
  );
};
