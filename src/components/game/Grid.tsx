import { GridCell } from './GridCell';
import { useGridStore } from '../../stores/gridStore';
import { useUIStore } from '../../stores/uiStore';
import { GridPosition } from '../../types/game.types';
import { TANK_SPECS } from '../../lib/constants';

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
            
            // Check if this cell is part of the multi-cell preview
            const inXRange = x >= hoveredCell.x && x < hoveredCell.x + specs.gridWidth;
            const inZRange = z >= hoveredCell.z && z < hoveredCell.z + specs.gridDepth;
            
            if (inXRange && inZRange) {
              isHighlighted = true;
              // Validate the entire placement from the origin cell
              isValidPlacement = canPlaceAt(hoveredCell, specs.gridWidth, specs.gridDepth);
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