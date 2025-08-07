import { GridCell } from './GridCell';
import { useGridStore } from '../../stores/gridStore';
import { useUIStore } from '../../stores/uiStore';
import { GridPosition } from '../../types/game.types';

interface GridProps {
  hoveredCell: GridPosition | null;
  onCellClick: (x: number, z: number) => void;
}

export const Grid = ({ hoveredCell, onCellClick }: GridProps) => {
  const cells = useGridStore.use.cells();
  const canPlaceAt = useGridStore.use.canPlaceAt();
  const canPlaceEntranceAt = useGridStore.use.canPlaceEntranceAt();
  const placementMode = useUIStore.use.placementMode();

  return (
    <>
      {Array.from(cells.values()).map((cell) => {
        const { x, y, z } = cell;
        
        // Skip if not on ground level (y !== 0)
        if (y !== 0) return null;
        
        const isHighlighted =
          hoveredCell?.x === x &&
          hoveredCell?.z === z &&
          (placementMode === "tank" || placementMode === "entrance");

        // Check if this is a valid placement position
        let isValidPlacement = true;
        if (isHighlighted) {
          if (placementMode === "tank") {
            isValidPlacement = canPlaceAt({ x, y, z }, 1, 1);
          } else if (placementMode === "entrance") {
            isValidPlacement = canPlaceEntranceAt({ x, y, z });
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