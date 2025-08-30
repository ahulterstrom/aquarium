import { GridCell } from './GridCell';
import { useGridStore } from '../../stores/gridStore';
import { useUIStore } from '../../stores/uiStore';
import { GridPosition } from '../../types/game.types';
import { TANK_SPECS } from '../../lib/constants';
import { getRotatedDimensions } from '../../lib/utils/placement';

interface GridProps {
  hoveredCell: GridPosition | null;
  onCellClick: (x: number, z: number) => void;
}

export const Grid = ({ hoveredCell, onCellClick }: GridProps) => {
  const cells = useGridStore.use.cells();
  const canPlaceAt = useGridStore.use.canPlaceAt();
  const canPlaceEntranceAt = useGridStore.use.canPlaceEntranceAt();
  const placementMode = useUIStore.use.placementMode();
  const placementPreview = useUIStore.use.placementPreview();
  const placementRotation = useUIStore.use.placementRotation();

  return (
    <>
      {Array.from(cells.values()).map((cell) => {
        const { x, y, z } = cell;
        
        // Skip if not on ground level (y !== 0)
        if (y !== 0) return null;
        
        // Multi-cell placement preview logic
        let isHighlighted = false;
        let isValidPlacement = true;

        if (hoveredCell && (placementMode === "tank" || placementMode === "entrance")) {
          if (placementMode === "tank" && placementPreview) {
            // Get tank dimensions from preview
            const tankSize = placementPreview.size || "medium";
            const specs = TANK_SPECS[tankSize];
            
            // Get rotated dimensions for preview
            const { width: rotatedWidth, depth: rotatedDepth } = getRotatedDimensions(
              specs.gridWidth,
              specs.gridDepth,
              placementRotation
            );
            
            // Check if this cell is part of the multi-cell preview
            const inXRange = x >= hoveredCell.x && x < hoveredCell.x + rotatedWidth;
            const inZRange = z >= hoveredCell.z && z < hoveredCell.z + rotatedDepth;
            
            if (inXRange && inZRange) {
              isHighlighted = true;
              // Validate the entire placement from the origin cell
              isValidPlacement = canPlaceAt(hoveredCell, rotatedWidth, rotatedDepth);
            }
          } else if (placementMode === "entrance") {
            isHighlighted = hoveredCell.x === x && hoveredCell.z === z;
            if (isHighlighted) {
              isValidPlacement = canPlaceEntranceAt({ x, y, z });
            }
          }
        }

        return (
          <GridCell
            key={`${x}-${y}-${z}`}
            x={x}
            z={z}
            onClick={onCellClick}
            isHighlighted={isHighlighted}
            isValidPlacement={isValidPlacement}
          />
        );
      })}
    </>
  );
};