import { GridCell } from './GridCell';
import { useGridStore } from '../../stores/gridStore';
import { useUIStore } from '../../stores/uiStore';
import { GridPosition } from '../../types/game.types';

interface GridProps {
  hoveredCell: GridPosition | null;
  onCellClick: (x: number, z: number) => void;
  expansionTiles?: Set<string>;
}

export const Grid = ({ hoveredCell, onCellClick, expansionTiles = new Set() }: GridProps) => {
  const cells = useGridStore.use.cells();
  const canPlaceAt = useGridStore.use.canPlaceAt();
  const canPlaceEntranceAt = useGridStore.use.canPlaceEntranceAt();
  const placementMode = useUIStore.use.placementMode();

  // Combine original cells and expansion tiles
  const allPositions = new Set<string>();
  
  // Add original grid cells
  Array.from(cells.values()).forEach(cell => {
    if (cell.y === 0) { // Only ground level
      allPositions.add(`${cell.x},${cell.z}`);
    }
  });
  
  // Add expansion tiles
  expansionTiles.forEach(posKey => {
    allPositions.add(posKey);
  });

  return (
    <>
      {Array.from(allPositions).map((posKey) => {
        const [x, z] = posKey.split(',').map(Number);
        const y = 0; // Always ground level
        
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
            key={`grid-${x}-${z}`}
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