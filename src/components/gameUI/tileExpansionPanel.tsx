import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  DollarSign,
  Grid3X3,
  Plus,
  AlertTriangle,
  X,
  Check,
} from "lucide-react";
import { useGameStore } from "../../stores/gameStore";
import { useUIStore } from "../../stores/uiStore";
import { useGridStore } from "../../stores/gridStore";
import { EXPANSION_BASE_COST } from "../../lib/constants";
import {
  getNextExpansionPackSize,
  getNextExpansionCost,
  getNextExpansionInfo,
} from "../../lib/utils/expansion";
export const TileExpansionPanel = () => {
  // Game store
  const money = useGameStore.use.money();
  const expansionTiles = useGameStore.use.expansionTiles();
  const buyExpansionPack = useGameStore.use.buyExpansionPack();
  const placeExpansionTiles = useGameStore.use.placeExpansionTiles();
  const getAvailableExpansionPositions =
    useGameStore.use.getAvailableExpansionPositions();
  const canBuyExpansion = useGameStore.use.canBuyExpansion();
  const getUnlockablesByCategory = useGameStore.use.getUnlockablesByCategory();
  const purchasedExpansionLevels = useGameStore.use.purchasedExpansionLevels();

  console.log("canBuyExpansion:", canBuyExpansion());

  // Grid store
  const cells = useGridStore.use.cells();
  const currentGridSize = cells.size;

  // UI store
  const showTileExpansion = useUIStore.use.showTileExpansion();
  const setShowTileExpansion = useUIStore.use.setShowTileExpansion();
  const setPlacementMode = useUIStore.use.setPlacementMode();
  const placementMode = useUIStore.use.placementMode();
  const selectedTiles = useUIStore.use.expansionSelectedTiles();
  const clearExpansionSelection = useUIStore.use.clearExpansionSelection();

  const isInPlacementMode = placementMode === "expansion";

  // Recalculate available positions considering selected tiles during placement
  const availablePositions = getAvailableExpansionPositions(
    isInPlacementMode ? selectedTiles : undefined,
  );

  // Dynamic expansion pack info - based on total tiles owned (placed + inventory)
  const totalTilesOwned = cells.size + expansionTiles;
  const expansionInfo = getNextExpansionInfo(totalTilesOwned);
  const nextPackCost = getNextExpansionCost(
    totalTilesOwned,
    EXPANSION_BASE_COST,
  );
  const nextPackSize = getNextExpansionPackSize(totalTilesOwned);

  const canAffordExpansion = money >= nextPackCost;
  const hasAvailableTiles = expansionTiles > 0;
  const hasValidPositions = availablePositions.length > 0;
  const expansionUnlocked = canBuyExpansion();

  // Get unlock requirements for next expansion level
  const nextLevelUnlockId = `expansion_level_${expansionInfo.nextLevel}`;
  const expansionUnlockables = getUnlockablesByCategory("expansions");
  const nextExpansionUnlock = expansionUnlockables.find(
    (u) => u.id === nextLevelUnlockId,
  );

  const alreadyPurchased = purchasedExpansionLevels.has(
    expansionInfo.nextLevel,
  );

  const handleBuyExpansionPack = () => {
    if (buyExpansionPack()) {
      // Success feedback could be added here
    }
  };

  const handleStartPlacement = () => {
    if (hasAvailableTiles && hasValidPositions) {
      setPlacementMode("expansion");
      clearExpansionSelection();
      setShowTileExpansion(false); // Close panel during placement
    }
  };

  const handleConfirmPlacement = () => {
    if (selectedTiles.size > 0) {
      const positions = Array.from(selectedTiles).map((posKey) => {
        const [x, z] = posKey.split(",").map(Number);
        return { x, z };
      });

      placeExpansionTiles(positions);
      setPlacementMode("none");
    }
  };

  const handleCancelPlacement = () => {
    setPlacementMode("none");
    setShowTileExpansion(true);
  };

  return (
    <>
      {isInPlacementMode && (
        <div className="pointer-events-auto fixed bottom-4 left-1/2 z-50 -translate-x-1/2 transform">
          <div className="flex items-center gap-4 rounded-lg border bg-white p-4 shadow-lg">
            <div className="flex items-center gap-2">
              <Grid3X3 className="h-5 w-5 text-blue-600" />
              <span className="font-medium">
                Tiles selected:{" "}
                <span className="text-nowrap">
                  {selectedTiles.size} / {expansionTiles}
                </span>
              </span>
            </div>

            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={handleCancelPlacement}
              >
                <X className="mr-1 h-4 w-4" />
                Cancel
              </Button>

              <Button
                size="sm"
                onClick={handleConfirmPlacement}
                disabled={selectedTiles.size === 0}
              >
                <Check className="mr-1 h-4 w-4" />
                Confirm ({selectedTiles.size} tiles)
              </Button>
            </div>
          </div>
        </div>
      )}
      <Sheet open={showTileExpansion} onOpenChange={setShowTileExpansion}>
        <SheetContent side="left" className="mx-auto max-w-2xl">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Grid3X3 className="h-6 w-6 text-blue-600" />
              Aquarium Expansion
            </SheetTitle>
            <SheetDescription>
              Expand your aquarium by placing new tiles.
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-6 p-4">
            {/* Current Status */}
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg bg-blue-50 p-4">
                <div className="mb-2 flex items-center gap-2">
                  <Grid3X3 className="h-5 w-5 text-blue-600" />
                  <span className="font-medium text-blue-800">
                    Current Size
                  </span>
                </div>
                <div className="text-2xl font-bold text-blue-900">
                  {currentGridSize} tiles
                </div>
                <div className="text-sm text-blue-700">
                  {cells.size - 9} expansion tiles placed
                </div>
              </div>

              <div
                className="cursor-pointer rounded-lg bg-green-50 p-4"
                onClick={handleStartPlacement}
              >
                <div className="mb-2 flex items-center gap-2">
                  <Plus className="h-5 w-5 text-green-600" />
                  <span className="font-medium text-green-800">
                    Available Tiles
                  </span>
                </div>
                <div className="text-2xl font-bold text-green-900">
                  {expansionTiles}
                </div>
                <div className="text-sm text-green-700">Ready to place</div>
              </div>
            </div>

            {/* Buy Expansion Pack */}
            <div className="rounded-lg border p-4">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">
                    Expansion Pack #{expansionInfo.nextLevel}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Get {nextPackSize} tiles to expand your aquarium
                  </p>
                  {/* <p className="mt-1 text-xs text-gray-500">
                    Current: {expansionInfo.currentGridSize} • Target capacity:{" "}
                    {expansionInfo.nextGridSize}
                  </p> */}
                </div>
                <Badge
                  variant="outline"
                  className="border-green-600 text-green-600"
                >
                  +{nextPackSize} tiles
                </Badge>
              </div>

              {!expansionUnlocked && nextExpansionUnlock && (
                <div className="mb-3 flex items-center gap-2 text-amber-600">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="text-sm">
                    Unlock requirements:{" "}
                    {nextExpansionUnlock.conditions
                      .map((c) => c.description)
                      .join(", ")}
                  </span>
                </div>
              )}

              {alreadyPurchased && (
                <div className="mb-3 flex items-center gap-2 text-green-600">
                  <Check className="h-4 w-4" />
                  <span className="text-sm">
                    Already purchased - place your tiles to unlock the next pack
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <span className="font-semibold">{nextPackCost}</span>
                  {!canAffordExpansion && (
                    <span className="text-sm text-red-600">
                      (Need ${nextPackCost - money} more)
                    </span>
                  )}
                </div>

                <Button
                  onClick={handleBuyExpansionPack}
                  disabled={
                    !canAffordExpansion ||
                    !expansionUnlocked ||
                    alreadyPurchased
                  }
                  className={
                    canAffordExpansion && expansionUnlocked && !alreadyPurchased
                      ? ""
                      : "opacity-50"
                  }
                >
                  {alreadyPurchased ? (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Purchased
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      Buy Pack
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Place Tiles */}
            <div
              className={`rounded-lg border p-4 ${hasAvailableTiles ? "border-blue-300 bg-blue-50 shadow-sm" : ""}`}
            >
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">Place Available Tiles</h3>
                  <p className="text-sm text-gray-600">
                    Expand your aquarium by placing your purchased tiles
                  </p>
                </div>
              </div>

              {!hasAvailableTiles && expansionUnlocked && (
                <div className="mb-3 flex items-center gap-2 text-amber-600">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="text-sm">
                    No tiles available. Buy an expansion pack first.
                  </span>
                </div>
              )}

              {hasAvailableTiles && !hasValidPositions && (
                <div className="mb-3 flex items-center gap-2 text-amber-600">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="text-sm">
                    No valid positions available. Tiles must be adjacent to
                    existing tiles and not border entrances.
                  </span>
                </div>
              )}

              <Button
                onClick={handleStartPlacement}
                disabled={!hasAvailableTiles || !hasValidPositions}
                variant={
                  hasAvailableTiles && hasValidPositions ? "glow" : "default"
                }
                className="w-full"
              >
                <Grid3X3 className="mr-2 h-4 w-4" />
                Place Available Tiles
                {hasAvailableTiles && (
                  <Badge variant="secondary" className="ml-2">
                    {expansionTiles}
                  </Badge>
                )}
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};
