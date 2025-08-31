import { Button } from "@/components/ui/button";
import { useUIStore } from "@/stores/uiStore";
import { useSpring, animated } from "@react-spring/web";
import { RotateCcwSquare, RotateCwSquare, X } from "lucide-react";

export const PlacementControls = () => {
  const placementMode = useUIStore.use.placementMode();
  const cancelPlacement = useUIStore.use.cancelPlacement();
  const rotatePlacementCCW = useUIStore.use.rotatePlacementCCW();
  const rotatePlacementCW = useUIStore.use.rotatePlacementCW();

  const shouldShowMenu =
    placementMode !== "none" && placementMode !== "expansion";

  const bottomControlsSpring = useSpring({
    opacity: shouldShowMenu ? 1 : 0,
    transform: shouldShowMenu ? "translateY(0px)" : "translateY(20px)",
    config: { tension: 280, friction: 25 },
  });

  return (
    <div className="pointer-events-none fixed inset-0 z-50">
      <animated.div
        style={bottomControlsSpring}
        className="pointer-events-auto absolute bottom-28 left-1/2 -translate-x-1/2 transform"
      >
        {/* Cancel Placement Button */}

        <div className="glass flex flex-row items-center justify-center gap-4 px-4 py-2">
          <Button
            onClick={cancelPlacement}
            variant="destructive"
            className="pointer-events-auto flex size-20 flex-col items-center justify-center gap-1"
          >
            <X className="size-6" />
            <span className="text-xs">Cancel</span>
          </Button>

          {placementMode === "tank" && (
            <>
              <Button
                onClick={rotatePlacementCCW}
                variant="onGlass"
                className="pointer-events-auto flex size-20 flex-col items-center justify-center gap-1"
              >
                <RotateCcwSquare className="size-6" />
                <span className="text-xs">Left</span>
              </Button>
              <Button
                onClick={rotatePlacementCW}
                variant="onGlass"
                className="pointer-events-auto flex size-20 flex-col items-center justify-center gap-1"
              >
                <RotateCwSquare className="size-6" />
                <span className="text-xs">Right</span>
              </Button>
            </>
          )}
        </div>
      </animated.div>
    </div>
  );
};
