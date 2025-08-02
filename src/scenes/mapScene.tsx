import { useMapStore } from "@/stores/mapStore";
import { MapNode } from "@/lib/mapGenerator/types";
import { Line, Html, PerspectiveCamera, MapControls } from "@react-three/drei";
import { useMemo, useState } from "react";

// Node type colors
const NODE_COLORS = {
  start: "#4CAF50",
  combat: "#9E9E9E",
  elite: "#F44336",
  rest: "#2196F3",
  shop: "#FFC107",
  event: "#9C27B0",
  treasure: "#FF9800",
  boss: "#B71C1C",
};

const MapNode3D = ({
  node,
  isVisited,
  isAccessible,
  isCurrent,
  onClick,
}: {
  node: MapNode;
  isVisited: boolean;
  isAccessible: boolean;
  isCurrent: boolean;
  onClick: () => void;
}) => {
  const [hovered, setHovered] = useState(false);
  const color = NODE_COLORS[node.type];

  // Change cursor on hover, but only if the node is accessible
  const onPointerOver = () => {
    setHovered(true);
    if (isAccessible) {
      document.body.style.cursor = "pointer";
    }
  };

  const onPointerOut = () => {
    setHovered(false);
    document.body.style.cursor = "auto";
  };

  return (
    <group
      position={[
        node.position.x * POSITION_SCALE,
        0,
        -node.position.y * POSITION_SCALE,
      ]}
    >
      <mesh
        onClick={onClick}
        onPointerOver={onPointerOver}
        onPointerOut={onPointerOut}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <circleGeometry args={[isCurrent ? NODE_SIZE * 1.4 : NODE_SIZE, 32]} />
        <meshBasicMaterial
          color={color}
          opacity={isVisited ? 0.5 : isAccessible ? 1 : 0.3}
          transparent
        />
      </mesh>

      {/* Ring for current position */}
      {isCurrent && (
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[NODE_SIZE * 1.4, NODE_SIZE * 1.8, 32]} />
          <meshBasicMaterial color="#FFD700" />
        </mesh>
      )}

      {/* Icon or label */}
      {hovered && (
        <Html center className="pointer-events-none">
          <div
            style={{
              background: "rgba(0,0,0,0.8)",
              color: "white",
              padding: "4px 8px",
              borderRadius: "4px",
              fontSize: "12px",
              whiteSpace: "nowrap",
            }}
          >
            {node.type.charAt(0).toUpperCase() + node.type.slice(1)}
          </div>
        </Html>
      )}
    </group>
  );
};

// Scale factor to spread out the nodes
const POSITION_SCALE = 15;
const NODE_SIZE = 0.25; // Smaller node size

export const MapScene = () => {
  const map = useMapStore.use.currentMap();
  const visitedNodes = useMapStore.use.visitedNodes();
  const currentNodeId = useMapStore.use.currentNodeId();
  const visitNode = useMapStore.use.visitNode();
  const isNodeAccessible = useMapStore.use.isNodeAccessible();

  // Calculate map bounds - moved before conditional return
  const mapBounds = useMemo(() => {
    if (!map) return { width: 20, height: 20, centerX: 0, centerZ: 0 };

    let minX = Infinity,
      maxX = -Infinity;
    let minY = Infinity,
      maxY = -Infinity;

    map.nodes.forEach((node) => {
      const scaledX = node.position.x * POSITION_SCALE;
      const scaledY = node.position.y * POSITION_SCALE;
      minX = Math.min(minX, scaledX);
      maxX = Math.max(maxX, scaledX);
      minY = Math.min(minY, scaledY);
      maxY = Math.max(maxY, scaledY);
    });

    const width = Math.max(maxX - minX + 4, 20);
    const height = Math.max(maxY - minY + 4, 20);

    return {
      width,
      height,
      centerX: (minX + maxX) / 2,
      centerZ: -(minY + maxY) / 2,
    };
  }, [map]);

  // Generate connection lines
  const connectionLines = useMemo(() => {
    if (!map) return [];

    const lines: Array<{ from: MapNode; to: MapNode; key: string }> = [];

    map.nodes.forEach((node) => {
      node.connections.forEach((connectionId) => {
        const connectedNode = map.nodes.get(connectionId);
        if (connectedNode) {
          lines.push({
            from: node,
            to: connectedNode,
            key: `${node.id}-${connectionId}`,
          });
        }
      });
    });

    return lines;
  }, [map]);

  const handleNodeClick = (nodeId: string) => {
    if (isNodeAccessible(nodeId)) {
      // visitNode(nodeId);
    }
  };

  if (!map) {
    return (
      <Html center>
        <div style={{ color: "white" }}>No map generated</div>
      </Html>
    );
  }

  return (
    <>
      <PerspectiveCamera
        makeDefault
        position={[mapBounds.centerX, 15, mapBounds.centerZ + 10]}
        rotation={[-0.5, 0, 0]}
      />

      <MapControls
        makeDefault
        target={[mapBounds.centerX, 0, mapBounds.centerZ]}
        minPolarAngle={0}
        maxPolarAngle={Math.PI / 2}
        enableZoom={false}
      />

      {/* Lighting */}
      <ambientLight intensity={0.8} />
      <directionalLight position={[10, 10, 5]} intensity={0.5} />

      {/* Paper background */}
      <mesh
        position={[mapBounds.centerX, -0.1, mapBounds.centerZ]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[mapBounds.width, mapBounds.height]} />
        <meshBasicMaterial color="#f5f5dc" />
      </mesh>

      {/* Connection lines */}
      {connectionLines.map(({ from, to, key }) => {
        const isActive = visitedNodes.has(from.id) && !visitedNodes.has(to.id);
        const isVisited = visitedNodes.has(from.id) && visitedNodes.has(to.id);

        return (
          <Line
            key={key}
            points={[
              [
                from.position.x * POSITION_SCALE,
                0.01,
                -from.position.y * POSITION_SCALE,
              ],
              [
                to.position.x * POSITION_SCALE,
                0.01,
                -to.position.y * POSITION_SCALE,
              ],
            ]}
            color={isVisited ? "#888" : isActive ? "#00f" : "#333"}
            lineWidth={isActive ? 2 : 1}
            opacity={isVisited ? 0.3 : isActive ? 1 : 0.2}
            transparent
          />
        );
      })}

      {/* Nodes */}
      {Array.from(map.nodes.values()).map((node) => (
        <MapNode3D
          key={node.id}
          node={node}
          isVisited={visitedNodes.has(node.id)}
          isAccessible={isNodeAccessible(node.id)}
          isCurrent={node.id === currentNodeId}
          onClick={() => handleNodeClick(node.id)}
        />
      ))}
    </>
  );
};
