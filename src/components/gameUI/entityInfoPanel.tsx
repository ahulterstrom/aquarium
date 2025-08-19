import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useGameStore } from "@/stores/gameStore";
import { useUIStore } from "@/stores/uiStore";
import {
  DollarSign,
  DoorOpen,
  Droplets,
  Eye,
  Heart,
  MapPin,
  ShoppingCart,
  Smile,
  Thermometer,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

// Import game stores and types
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { VisitorInfo } from "@/components/gameUI/visitorInfo";

export const EntityInfoPanel = () => {
  const tanks = useGameStore.use.tanks();
  const entrances = useGameStore.use.entrances();

  const showFishShop = useUIStore.use.showFishShop();
  const setShowFishShop = useUIStore.use.setShowFishShop();
  const showSellConfirmation = useUIStore.use.showSellConfirmation();
  const setShowSellConfirmation = useUIStore.use.setShowSellConfirmation();
  const placementMode = useUIStore.use.placementMode();
  const setPlacementMode = useUIStore.use.setPlacementMode();
  const selectedTankId = useUIStore.use.selectedTankId();
  const selectedVisitorId = useUIStore.use.selectedVisitorId();
  const selectedEntranceId = useUIStore.use.selectedEntranceId();
  const selectedEntityType = useUIStore.use.selectedEntityType();
  const selectTank = useUIStore.use.selectTank();
  const clearSelection = useUIStore.use.clearSelection();

  // Get the selected entities from the store
  const selectedTank = selectedTankId ? tanks.get(selectedTankId) : null;
  const selectedEntrance = selectedEntranceId
    ? entrances.get(selectedEntranceId)
    : null;

  const [lastSelectedTank, setLastSelectedTank] = useState(
    selectedTank || null,
  );
  useEffect(() => {
    if (selectedTank) {
      setLastSelectedTank(selectedTank);
    }
  }, [selectedTank]);

  const [lastSelectedEntrance, setLastSelectedEntrance] = useState(
    selectedEntrance || null,
  );
  useEffect(() => {
    if (selectedEntrance) {
      setLastSelectedEntrance(selectedEntrance);
    }
  }, [selectedEntrance]);

  const [lastSelectedEntityType, setLastSelectedEntityType] = useState(
    selectedEntityType || null,
  );
  useEffect(() => {
    if (selectedEntityType) {
      setLastSelectedEntityType(selectedEntityType);
    }
  }, [selectedEntityType]);

  return (
    <Sheet open={!!selectedEntityType}>
      <SheetContent
        withOverlay={false}
        withCloseButton={false}
        side="right"
        className="pointer-events-auto w-80 bg-white/50 p-2 shadow-lg backdrop-blur-sm"
      >
        <SheetHeader className="pb-3">
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2 text-lg">
              {selectedEntityType === "tank" && (
                <>
                  <Droplets className="h-5 w-5 text-blue-600" />
                  Tank Info
                </>
              )}
              {selectedEntityType === "visitor" && (
                <>
                  <Users className="h-5 w-5 text-green-600" />
                  Visitor Info
                </>
              )}
              {selectedEntityType === "entrance" && (
                <>
                  <DoorOpen className="h-5 w-5 text-purple-600" />
                  Entrance Info
                </>
              )}
            </SheetTitle>
            <SheetDescription className="sr-only">
              Info about the selected entity
            </SheetDescription>
            <Button variant="ghost" size="sm" onClick={() => clearSelection()}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </SheetHeader>

        {/* Tank Panel */}
        {lastSelectedTank && lastSelectedEntityType === "tank" && (
          <div className="space-y-4">
            {/* Tank Size & Capacity */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">
                  Tank Size
                </label>
                <p className="text-lg font-semibold capitalize">
                  {lastSelectedTank.size}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">
                  Capacity
                </label>
                <p className="text-lg font-semibold">
                  {lastSelectedTank.capacity} fish
                </p>
              </div>
            </div>

            {/* Water Quality */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="text-sm font-medium text-gray-600">
                  Water Quality
                </label>
                <span className="text-sm font-semibold">
                  {Math.round(lastSelectedTank.waterQuality * 100)}%
                </span>
              </div>
              <Progress
                value={lastSelectedTank.waterQuality * 100}
                className="h-2"
              />
            </div>

            {/* Temperature */}
            <div className="flex items-center gap-3 rounded-lg bg-blue-50 p-2">
              <Thermometer className="h-4 w-4 text-blue-600" />
              <div>
                <label className="text-sm font-medium text-gray-600">
                  Temperature
                </label>
                <p className="text-lg font-semibold">
                  {lastSelectedTank.temperature}°C
                </p>
              </div>
            </div>

            {/* Fish Count */}
            <div className="flex items-center justify-between rounded-lg bg-green-50 p-2">
              <span className="text-sm font-medium text-green-700">
                Fish Count:
              </span>
              <Badge
                variant="secondary"
                className="bg-green-100 text-green-800"
              >
                {lastSelectedTank.fishIds.length} / {lastSelectedTank.capacity}
              </Badge>
            </div>

            {/* Tank Position */}
            <div className="flex items-center gap-2 rounded-lg bg-gray-50 p-2">
              <MapPin className="h-4 w-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-600">
                Position: Grid ({lastSelectedTank.position.x},{" "}
                {lastSelectedTank.position.z})
              </span>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2">
              <Button
                onClick={() => setShowFishShop(true)}
                className="w-full"
                disabled={
                  lastSelectedTank.fishIds.length >= lastSelectedTank.capacity
                }
              >
                <ShoppingCart className="mr-2 h-4 w-4" />
                {lastSelectedTank.fishIds.length >= lastSelectedTank.capacity
                  ? "Tank Full"
                  : "Buy Fish"}
              </Button>

              <Button
                onClick={() => setShowSellConfirmation(true)}
                variant="destructive"
                className="w-full"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Sell Tank (${tanks.size === 1 ? "6" : "3"})
              </Button>
            </div>
          </div>
        )}

        {/* Entrance Panel */}
        {lastSelectedEntrance && lastSelectedEntityType === "entrance" && (
          <div className="space-y-4">
            {/* Entrance Type */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">
                  Type
                </label>
                <p className="text-lg font-semibold">
                  {lastSelectedEntrance.isMainEntrance
                    ? "Main Entrance"
                    : "Side Entrance"}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">
                  Edge
                </label>
                <p className="text-lg font-semibold capitalize">
                  {lastSelectedEntrance.edge}
                </p>
              </div>
            </div>

            {/* Position */}
            <div className="flex items-center gap-2 rounded-lg bg-purple-50 p-2">
              <MapPin className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium text-gray-600">
                Position: Grid ({lastSelectedEntrance.position.x},{" "}
                {lastSelectedEntrance.position.z})
              </span>
            </div>

            {/* Status */}
            <div className="flex items-center gap-3 rounded-lg bg-green-50 p-2">
              <DoorOpen className="h-4 w-4 text-green-600" />
              <div>
                <label className="text-sm font-medium text-gray-600">
                  Status
                </label>
                <p className="text-lg font-semibold text-green-700">Open</p>
              </div>
            </div>

            {/* Visitor Traffic */}
            <div className="flex items-center justify-between rounded-lg bg-blue-50 p-2">
              <span className="flex items-center gap-1 text-sm font-medium text-blue-700">
                <Users className="h-4 w-4" />
                Visitor Traffic:
              </span>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                0 active
              </Badge>
            </div>
          </div>
        )}

        <VisitorInfo />
      </SheetContent>
    </Sheet>
  );
};
