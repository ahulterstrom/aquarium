import { useGameStore } from "@/stores/gameStore";
import { useUIStore } from "@/stores/uiStore";
import { Torus } from "@react-three/drei";
import { useState } from "react";

interface ExpansionGridProps {
  onTileClick: (x: number, z: number) => void;
  selectedTiles: Set<string>;
}

export const ExpansionGrid = ({
  onTileClick,
  selectedTiles,
}: ExpansionGridProps) => {
  const [hoveredTile, setHoveredTile] = useState<string | null>(null);

  const getAvailableExpansionPositions =
    useGameStore.use.getAvailableExpansionPositions();
  const placedExpansionTiles = useGameStore.use.placedExpansionTiles();
  const expansionTiles = useGameStore.use.expansionTiles();

  // Recalculate available positions considering selected tiles
  const availablePositions = getAvailableExpansionPositions(selectedTiles);

  return (
    <group>
      {/* Render placed expansion tiles */}
      {Array.from(placedExpansionTiles).map((posKey) => {
        const [x, z] = posKey.split(",").map(Number);
        return (
          <>
            <mesh key={`placed-${posKey}`} position={[x * 2, 0.01, z * 2]}>
              <planeGeometry args={[1.95, 1.95]} />
              <meshStandardMaterial color="#4ade80" transparent opacity={0.7} />
            </mesh>
            <Torus position={[x * 2, 0.01, z * 2]} args={[0.5, 0.2, 16, 100]}>
              <meshStandardMaterial color="#4ade80" transparent opacity={0.7} />
            </Torus>
          </>
        );
      })}

      {/* Render available positions for placement */}
      {availablePositions.map((pos) => {
        const posKey = `${pos.x},${pos.z}`;
        const isSelected = selectedTiles.has(posKey);
        const isHovered = hoveredTile === posKey;
        const canSelect = selectedTiles.size < expansionTiles;

        // Color based on state
        let color = "#6b7280"; // Default gray
        let opacity = 0.5;

        if (isSelected) {
          color = "#3b82f6"; // Blue when selected
          opacity = 0.8;
        } else if (isHovered && canSelect) {
          color = "#60a5fa"; // Light blue when hovered
          opacity = 0.6;
        } else if (!canSelect) {
          color = "#9ca3af"; // Darker gray when can't select more
          opacity = 0.3;
        }

        return (
          <mesh
            key={`available-${posKey}`}
            rotation={[-Math.PI / 2, 0, 0]}
            position={[pos.x * 2, 0.005, pos.z * 2]}
            onClick={(e) => {
              e.stopPropagation();
              onTileClick(pos.x, pos.z);
            }}
            onPointerEnter={(e) => {
              e.stopPropagation();
              setHoveredTile(posKey);
              document.body.style.cursor = canSelect
                ? "pointer"
                : "not-allowed";
            }}
            onPointerLeave={(e) => {
              e.stopPropagation();
              setHoveredTile(null);
              document.body.style.cursor = "default";
            }}
          >
            <planeGeometry args={[1.9, 1.9]} />
            <meshStandardMaterial color={color} transparent opacity={opacity} />
          </mesh>
        );
      })}

      {/* Render selection indicators */}
      {Array.from(selectedTiles).map((posKey) => {
        const [x, z] = posKey.split(",").map(Number);
        return (
          <mesh
            key={`indicator-${posKey}`}
            position={[x * 2, 0.02, z * 2]}
            rotation={[-Math.PI / 2, 0, 0]}
          >
            <planeGeometry args={[1.8, 1.8]} />
            <meshStandardMaterial color="#3b82f6" transparent opacity={0.9} />
          </mesh>
        );
      })}
    </group>
  );
};
