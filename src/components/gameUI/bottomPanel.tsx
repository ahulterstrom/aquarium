import { Button } from "@/components/ui/button";
import { Expand, Hammer, Paintbrush } from "lucide-react";

import { animated, useSpring } from "@react-spring/web";
import { ENTRANCE_COST, TANK_COST } from "@/lib/constants";
import { useGameStore } from "../../stores/gameStore";
import { useUIStore } from "../../stores/uiStore";

export const BottomPanel = () => {
  const money = useGameStore.use.money();
  const activeObjectives = useGameStore.use.activeObjectives();
  const showTileExpansion = useUIStore.use.showTileExpansion();
  const setShowTileExpansion = useUIStore.use.setShowTileExpansion();
  const showCustomization = useUIStore.use.showCustomization();
  const setShowCustomization = useUIStore.use.setShowCustomization();
  const showBuild = useUIStore.use.showBuild();
  const setShowBuild = useUIStore.use.setShowBuild();
  const placementMode = useUIStore.use.placementMode();
  const isInPlacementMode = placementMode !== "none";

  const isPhotoMode = useUIStore.use.isPhotoMode();

  const shouldShowMenus =
    !showTileExpansion &&
    !isInPlacementMode &&
    !showCustomization &&
    !showBuild &&
    !isPhotoMode;

  const springStyles = useSpring({
    transform: shouldShowMenus ? 'translateY(0%)' : 'translateY(100%)',
    config: { tension: 300, friction: 30 }
  });

  return (
    <animated.div
      style={springStyles}
      className="fixed inset-x-0 bottom-0 z-50 pointer-events-none"
    >
      <div className="flex w-full justify-center gap-4 p-4">
        {/* Build Button */}
        <Button
          onClick={() => setShowBuild(true)}
          className="pointer-events-auto flex size-16 flex-col"
          variant={
            activeObjectives.some(
              (obj) =>
                (obj.type === "place_entrance" ||
                  obj.type === "build_first_tank") &&
                !obj.completed,
            )
              ? "glow"
              : "sidePanel"
          }
          size="default"
        >
          <Hammer className="size-5" />
          <p className="text-xs">Build</p>
        </Button>

        {/* Tile Expansion Button */}
        <Button
          onClick={() => setShowTileExpansion(true)}
          className="pointer-events-auto flex size-16 flex-col"
          variant="sidePanel"
          size="default"
        >
          <Expand className="size-5" />
          <p className="text-xs">Expand</p>
        </Button>

        {/* Customization Button */}
        <Button
          onClick={() => setShowCustomization(true)}
          className="pointer-events-auto flex size-16 flex-col"
          variant="sidePanel"
          size="default"
        >
          <Paintbrush className="size-5" />
          <p className="text-xs">Style</p>
        </Button>

        {/* Placement Instructions */}
        {placementMode === "tank" && money >= TANK_COST && (
          <div className="pointer-events-auto rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
            Click on a grid cell to place a tank
          </div>
        )}
        {placementMode === "entrance" && money >= ENTRANCE_COST && (
          <div className="pointer-events-auto rounded-lg border border-purple-200 bg-purple-50 p-3 text-sm text-purple-700">
            Click on a grid cell to place an entrance
          </div>
        )}
      </div>
    </animated.div>
  );
};
