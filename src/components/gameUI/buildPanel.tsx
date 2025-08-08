import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { LockedCard } from "@/components/ui/locked";
import { Hammer, Fish, DoorOpen } from "lucide-react";
import { useUIStore } from "../../stores/uiStore";
import { useGameStore } from "../../stores/gameStore";
import { TANK_COST, ENTRANCE_COST } from "../../lib/constants";

export const BuildPanel = () => {
  const showBuild = useUIStore.use.showBuild();
  const setShowBuild = useUIStore.use.setShowBuild();
  const placementMode = useUIStore.use.placementMode();
  const setPlacementMode = useUIStore.use.setPlacementMode();

  const money = useGameStore.use.money();
  const tanks = useGameStore.use.tanks();
  const entrances = useGameStore.use.entrances();

  const canAffordTank = money >= TANK_COST;
  const canAffordEntrance = money >= ENTRANCE_COST;

  const handlePlaceTank = () => {
    if (placementMode === "tank") {
      setPlacementMode("none");
    } else {
      setPlacementMode("tank", { type: "tank", size: "medium" });
      setShowBuild(false); // Close panel when entering placement mode
    }
  };

  const handlePlaceEntrance = () => {
    if (placementMode === "entrance") {
      setPlacementMode("none");
    } else {
      setPlacementMode("entrance");
      setShowBuild(false); // Close panel when entering placement mode
    }
  };

  return (
    <Sheet open={showBuild} onOpenChange={setShowBuild}>
      <SheetContent side="left" className="mx-auto max-w-2xl">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Hammer className="h-6 w-6 text-orange-600" />
            Build Mode
          </SheetTitle>
        </SheetHeader>

        <div className="space-y-6 p-4">
          <div className="mb-4 text-sm text-gray-600">
            Place new structures in your aquarium.
          </div>

          {/* Place Entrance - Only show if no entrance exists */}
          {entrances.size === 0 && (
            <div className="rounded-lg border p-4">
              <div className="mb-3">
                <h3 className="flex items-center gap-2 font-semibold">
                  <DoorOpen className="h-4 w-4 text-purple-600" />
                  Entrance
                </h3>
                <p className="mt-1 text-sm text-gray-600">
                  Place your main entrance (visitors spawn here)
                </p>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-sm">
                  <span className="font-medium text-green-600">
                    ${ENTRANCE_COST}
                  </span>
                  {!canAffordEntrance && (
                    <span className="ml-2 text-red-600">
                      (Need ${ENTRANCE_COST - money} more)
                    </span>
                  )}
                </div>
                <Button
                  onClick={handlePlaceEntrance}
                  variant={entrances.size === 0 ? "glow" : "outline"}
                  disabled={!canAffordEntrance && placementMode !== "entrance"}
                >
                  <DoorOpen className="mr-2 h-4 w-4" />
                  Place Entrance
                </Button>
              </div>
            </div>
          )}

          {/* Place Tank */}
          <LockedCard
            isLocked={entrances.size === 0}
            // lockReason="You must place an entrance first before adding tanks"
            // intensity="light"
          >
            <div className="rounded-lg border p-4">
              <div className="mb-3">
                <h3 className="flex items-center gap-2 font-semibold">
                  <Fish className="h-4 w-4 text-blue-600" />
                  Fish Tank
                </h3>
                <p className="mt-1 text-sm text-gray-600">
                  A medium-sized tank for your fish
                </p>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-sm">
                  <span className="font-medium text-green-600">
                    ${TANK_COST}
                  </span>
                  {!canAffordTank && (
                    <span className="ml-2 text-red-600">
                      (Need ${TANK_COST - money} more)
                    </span>
                  )}
                </div>
                <Button
                  onClick={handlePlaceTank}
                  variant={
                    entrances.size > 0 && tanks.size === 0 ? "glow" : "outline"
                  }
                  disabled={!canAffordTank || entrances.size === 0}
                >
                  <Fish className="mr-2 h-4 w-4" />
                  Place Tank
                </Button>
              </div>
              <div className="mt-2 text-xs text-gray-500">
                You have {tanks.size} tank{tanks.size !== 1 ? "s" : ""}
              </div>
            </div>
          </LockedCard>
        </div>
      </SheetContent>
    </Sheet>
  );
};
