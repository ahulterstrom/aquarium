"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import {
  AlertTriangle,
  DollarSign,
  Expand,
  Fish,
  Hammer,
  Lock,
  Paintbrush,
  Pause,
  Play,
  Trash2,
} from "lucide-react";
import { useState } from "react";

// Import game stores and types
import { AllObjectivesModal } from "@/components/gameUI/allObjectivesModal";
import { BuildPanel } from "@/components/gameUI/buildPanel";
import { CompletedObjectiveNotification } from "@/components/gameUI/completedObjectiveNotification";
import { CustomizationPanel } from "@/components/gameUI/customizationPanel";
import { EntityInfoPanel } from "@/components/gameUI/entityInfoPanel";
import { GameTimeDisplay } from "@/components/gameUI/gameTimeDisplay";
import { MoneyDisplay } from "@/components/gameUI/moneyDisplay";
import { ObjectivesButton } from "@/components/gameUI/objectivesButton";
import { ObjectivesPanel } from "@/components/gameUI/objectivesPanel";
import { TileExpansionPanel } from "@/components/gameUI/tileExpansionPanel";
import { spawnVisitor } from "@/components/systems/visitorSystem";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { ENTRANCE_COST, TANK_COST } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { useGame } from "@/stores/useGame";
import * as THREE from "three";
import { useGameStore } from "../../stores/gameStore";
import { useGridStore } from "../../stores/gridStore";
import { useUIStore } from "../../stores/uiStore";
import { FishSpecies, Fish as FishType } from "../../types/game.types";
import { VisitorCountDisplay } from "@/components/gameUI/visitorCountDisplay";
import { DateTimeDisplay } from "@/components/gameUI/dateTimeDisplay";
import { toast } from "@/components/ui/sonner";
import { AnimatedObjectivesPanel } from "@/components/gameUI/animatedObjectivesPanel";

// Fish species available for purchase
const FISH_SPECIES: FishSpecies[] = [
  {
    id: "goldfish",
    name: "Goldfish",
    price: 2,
    rarity: "common",
    preferredTemperature: { min: 18, max: 26 },
    size: "medium",
    schooling: false,
    aggressiveness: 0.2,
    feedingInterval: 8,
  },
  {
    id: "neon_tetra",
    name: "Neon Tetra",
    price: 3,
    rarity: "common",
    preferredTemperature: { min: 20, max: 26 },
    size: "medium",
    schooling: true,
    aggressiveness: 0.1,
    feedingInterval: 6,
  },
  {
    id: "angelfish",
    name: "Angelfish",
    price: 5,
    rarity: "uncommon",
    preferredTemperature: { min: 24, max: 30 },
    size: "medium",
    schooling: false,
    aggressiveness: 0.4,
    feedingInterval: 12,
  },
  {
    id: "clownfish",
    name: "Clownfish",
    price: 4,
    rarity: "uncommon",
    preferredTemperature: { min: 24, max: 27 },
    size: "medium",
    schooling: false,
    aggressiveness: 0.3,
    feedingInterval: 8,
  },
];

export const SandboxUI = () => {
  const [contextMessage, setContextMessage] = useState("");

  const setShowAllObjectives = useUIStore.use.setShowAllObjectives();
  const isDebugging = useGame.use.isDebugging();
  const tanks = useGameStore.use.tanks();
  const money = useGameStore.use.money();
  const spendMoney = useGameStore.use.spendMoney();
  const addFish = useGameStore.use.addFish();
  const updateTank = useGameStore.use.updateTank();
  const removeTank = useGameStore.use.removeTank();
  const gameSpeed = useGameStore.use.gameSpeed();
  const setGameSpeed = useGameStore.use.setGameSpeed();
  const isPaused = useGameStore.use.isPaused();
  const setPaused = useGameStore.use.setPaused();
  const day = useGameStore.use.day();
  const entrances = useGameStore.use.entrances();
  const activeObjectives = useGameStore.use.activeObjectives();
  const collectObjectiveReward = useGameStore.use.collectObjectiveReward();
  const isUnlocked = useGameStore.use.isUnlocked();
  const getUnlockablesByCategory = useGameStore.use.getUnlockablesByCategory();

  const removeObject = useGridStore.use.removeObject();
  const showFishShop = useUIStore.use.showFishShop();
  const setShowFishShop = useUIStore.use.setShowFishShop();
  const showSellConfirmation = useUIStore.use.showSellConfirmation();
  const setShowSellConfirmation = useUIStore.use.setShowSellConfirmation();
  const showTileExpansion = useUIStore.use.showTileExpansion();
  const setShowTileExpansion = useUIStore.use.setShowTileExpansion();
  const showCustomization = useUIStore.use.showCustomization();
  const setShowCustomization = useUIStore.use.setShowCustomization();
  const showBuild = useUIStore.use.showBuild();
  const setShowBuild = useUIStore.use.setShowBuild();
  const showObjectives = useUIStore.use.showObjectives();
  const setShowObjectives = useUIStore.use.setShowObjectives();
  const placementMode = useUIStore.use.placementMode();
  const isInPlacementMode = placementMode !== "none";
  const selectedTankId = useUIStore.use.selectedTankId();
  const selectTank = useUIStore.use.selectTank();

  // Get the selected entities from the store
  const selectedTank = selectedTankId ? tanks.get(selectedTankId) : null;

  const handleSellTank = () => {
    if (!selectedTank) return;

    // Remove from grid
    removeObject(selectedTank.position, 1, 1);

    // Remove tank (this also removes fish and adds refund money)
    removeTank(selectedTank.id);

    // Clear selection
    selectTank(null);

    // Close confirmation dialog
    setShowSellConfirmation(false);
  };

  const handleBuyFishClick = (species: FishSpecies) => {
    if (!selectedTank) return;

    // Check if tank has capacity
    if (selectedTank.fishIds.length >= selectedTank.capacity) {
      setContextMessage("Tank is at maximum capacity!");
      setTimeout(() => setContextMessage(""), 3000);
      return;
    }

    // Check if player has enough money
    if (!spendMoney(species.price)) {
      setContextMessage("Not enough money to buy this fish!");
      setTimeout(() => setContextMessage(""), 3000);
      return;
    }

    // Create new fish
    const fishId = `fish_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;

    // Calculate spawn position within tank bounds (same logic as FishSystem)
    const baseX = selectedTank.position.x * 2;
    const baseZ = selectedTank.position.z * 2;
    const gridWidth = selectedTank.gridWidth || 1;
    const gridDepth = selectedTank.gridDepth || 1;

    // Calculate the center of the tank (same logic as visual positioning)
    const tankCenterX = baseX + (gridWidth > 1 ? gridWidth - 1 : 0);
    const tankCenterZ = baseZ + (gridDepth > 1 ? gridDepth - 1 : 0);

    const xRange = gridWidth * 1.4;
    const zRange = gridDepth * 1.4;

    const newFish: FishType = {
      id: fishId,
      species: species,
      tankId: selectedTank.id,
      health: 1,
      happiness: 0.8,
      age: 0,
      position: new THREE.Vector3(
        tankCenterX + (Math.random() - 0.5) * xRange,
        selectedTank.position.y + 0.5 + Math.random() * 0.5,
        tankCenterZ + (Math.random() - 0.5) * zRange,
      ),
      velocity: new THREE.Vector3(0, 0, 0),
      hunger: 0.3,

      // Initialize behavior properties
      targetPosition: null,
      behaviorState: "swimming",
      behaviorTimer: 0,
      swimSpeed:
        species.id === "neon_tetra"
          ? 0.8
          : species.id === "angelfish"
            ? 0.6
            : 0.5,
      schoolingTarget: null,
      lastFedTime: Date.now(),
    };

    // Add fish to game store
    addFish(newFish);

    // Update tank to include this fish
    const updatedFishIds = [...selectedTank.fishIds, fishId];
    updateTank(selectedTank.id, { fishIds: updatedFishIds });

    // Close shop if tank is now full
    if (updatedFishIds.length >= selectedTank.capacity) {
      setShowFishShop(false);
    }
  };

  const canBuyFish = (species: FishSpecies) => {
    if (!selectedTank) return false;
    if (money < species.price) return false;
    if (selectedTank.fishIds.length >= selectedTank.capacity) return false;
    // Check if species is unlocked
    const isSpeciesUnlocked =
      species.id === "goldfish" ||
      species.id === "neon_tetra" ||
      isUnlocked(`fish_${species.id}`);
    if (!isSpeciesUnlocked) return false;
    return true;
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "common":
        return "bg-gray-500 text-white";
      case "uncommon":
        return "bg-blue-500 text-white";
      case "rare":
        return "bg-purple-500 text-white";
      case "legendary":
        return "bg-yellow-500 text-black";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const shouldShowMenus =
    !showTileExpansion &&
    !isInPlacementMode &&
    !showCustomization &&
    !showBuild;

  return (
    <div className="fixed inset-0">
      {/* Main UI Overlay */}
      <div className="relative h-full p-4">
        {/* Top Center Panel */}
        <Card className="pointer-events-auto absolute top-4 left-1/2 -translate-x-1/2 p-2">
          <CardContent className="flex h-8 items-center justify-center gap-4">
            <MoneyDisplay />
            <Separator orientation="vertical" />
            <DateTimeDisplay />
            <Separator orientation="vertical" />
            <VisitorCountDisplay />
            <Separator orientation="vertical" />

            <Button
              size="sm"
              variant={isPaused ? "default" : "outline"}
              onClick={() => setPaused(!isPaused)}
            >
              {isPaused ? (
                <Play className="h-4 w-4" />
              ) : (
                <Pause className="h-4 w-4" />
              )}
            </Button>

            <div className="flex gap-1">
              <Button
                size="sm"
                variant={gameSpeed === 1 ? "default" : "outline"}
                onClick={() => setGameSpeed(1)}
                disabled={isPaused}
              >
                1x
              </Button>
              <Button
                size="sm"
                variant={gameSpeed === 2 ? "default" : "outline"}
                onClick={() => setGameSpeed(2)}
                disabled={isPaused}
              >
                2x
              </Button>
              <Button
                size="sm"
                variant={gameSpeed === 3 ? "default" : "outline"}
                onClick={() => setGameSpeed(3)}
                disabled={isPaused}
              >
                3x
              </Button>
            </div>
          </CardContent>
        </Card>

        <Sheet open={shouldShowMenus} onOpenChange={setShowTileExpansion}>
          <SheetContent
            withOverlay={false}
            withCloseButton={false}
            side="bottom"
            style={{
              pointerEvents: "none",
            }}
            className="border-none bg-transparent shadow-none"
          >
            <SheetTitle className="sr-only">Game UI</SheetTitle>
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

              {/* Context Message Area */}
              {contextMessage && (
                <div
                  className={`rounded-lg p-3 text-sm ${
                    contextMessage.includes("Not enough") ||
                    contextMessage.includes("maximum")
                      ? "border border-red-200 bg-red-50 text-red-700"
                      : contextMessage.includes("Click on")
                        ? "border border-yellow-200 bg-yellow-50 text-yellow-700"
                        : "border border-green-200 bg-green-50 text-green-700"
                  }`}
                >
                  {(contextMessage.includes("Not enough") ||
                    contextMessage.includes("maximum")) && (
                    <AlertTriangle className="mr-2 inline h-4 w-4" />
                  )}
                  {contextMessage}
                </div>
              )}

              {/* Placement Instructions */}
              {placementMode === "tank" &&
                money >= TANK_COST &&
                !contextMessage && (
                  <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
                    Click on a grid cell to place a tank
                  </div>
                )}
              {placementMode === "entrance" &&
                money >= ENTRANCE_COST &&
                !contextMessage && (
                  <div className="rounded-lg border border-purple-200 bg-purple-50 p-3 text-sm text-purple-700">
                    Click on a grid cell to place an entrance
                  </div>
                )}
            </div>
          </SheetContent>
        </Sheet>

        {isDebugging && (
          <div className="pointer-events-auto absolute top-0 left-0 w-30 space-y-2 bg-orange-400/50 p-2">
            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs whitespace-break-spaces"
              onClick={() => spawnVisitor()}
            >
              1 Visitor
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs whitespace-break-spaces"
              onClick={() => {
                for (let i = 0; i < 10; i++) {
                  spawnVisitor();
                }
              }}
            >
              10 Visitors
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs whitespace-break-spaces"
              onClick={() => {
                const cells = useGridStore.getState().cells;
                console.log("Grid Cells:", Array.from(cells.entries()));
              }}
            >
              Log Cells
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs whitespace-break-spaces"
              onClick={() => {
                toast({
                  title: "This is a test test toast",
                  description: "This is a test description for the toast.",
                });
              }}
            >
              Toast test
            </Button>
          </div>
        )}

        <Sheet open={shouldShowMenus}>
          <SheetContent
            side="top"
            withOverlay={false}
            withCloseButton={false}
            style={{
              pointerEvents: "none",
            }}
            className={cn(
              "top-20 mx-auto w-80 border-none bg-transparent shadow-none",
            )}
          >
            <ObjectivesButton />
          </SheetContent>
        </Sheet>

        <AnimatedObjectivesPanel />

        {/* Collapsible Objectives Panel */}

        <Sheet open={showObjectives}>
          <SheetContent
            side="bottom"
            withOverlay={false}
            withCloseButton={false}
            style={{
              pointerEvents: "none",
            }}
            className={cn(
              "pointer-events-auto z-10 mx-auto mb-20 w-80 border-none bg-transparent shadow-none data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            )}
          >
            <ObjectivesPanel
              objectives={activeObjectives}
              onCollectReward={collectObjectiveReward}
              onViewAll={() => setShowAllObjectives(true)}
            />
          </SheetContent>
        </Sheet>

        {/* Reward Collection */}
        <div className="pointer-events-none absolute top-[50%] right-4 flex flex-col gap-2">
          {activeObjectives
            .filter((obj) => obj.completed && !obj.rewarded)
            .map((objective) => (
              <CompletedObjectiveNotification
                key={objective.id}
                objective={objective}
                onCollectReward={collectObjectiveReward}
              />
            ))}
        </div>

        {/* Entity Info Panel - Right Side */}
        <EntityInfoPanel />

        {/* Fish Shop Modal */}
        <Dialog open={showFishShop} onOpenChange={setShowFishShop}>
          <DialogContent className="max-h-[80vh] max-w-4xl overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-xl">
                <Fish className="h-6 w-6 text-blue-600" />
                Fish Shop
              </DialogTitle>
            </DialogHeader>

            {/* Selected Tank */}
            {selectedTank && (
              <Card className="border-blue-200 bg-blue-50">
                <CardContent>
                  <h3 className="mb-2 font-semibold">Selected Tank</h3>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Size:</span>
                      <span className="ml-2 font-medium capitalize">
                        {selectedTank.size}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Capacity:</span>
                      <span className="ml-2 font-medium">
                        {selectedTank.fishIds.length}/{selectedTank.capacity}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Space Left:</span>
                      <span className="ml-2 font-medium">
                        {selectedTank.capacity - selectedTank.fishIds.length}
                      </span>
                    </div>
                  </div>
                  {selectedTank.fishIds.length >= selectedTank.capacity && (
                    <div className="mt-2 flex items-center gap-2 rounded border border-red-200 bg-red-100 p-2 text-sm text-red-700">
                      <AlertTriangle className="h-4 w-4" />
                      Tank is full! Cannot add more fish.
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            <Separator />

            {/* Fish List */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Available Fish</h3>
              <div className="grid gap-4">
                {FISH_SPECIES.map((species) => {
                  const isSpeciesUnlocked =
                    species.id === "goldfish" ||
                    species.id === "neon_tetra" ||
                    isUnlocked(`fish_${species.id}`);

                  return (
                    <Card
                      key={species.id}
                      className={`p-4 ${!isSpeciesUnlocked ? "opacity-60" : ""}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="mb-2 flex items-center gap-3">
                            <h4 className="text-lg font-semibold">
                              {species.name}
                            </h4>
                            <Badge className={getRarityColor(species.rarity)}>
                              {species.rarity}
                            </Badge>
                          </div>

                          <div className="mb-3 grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-gray-600">Size:</span>
                              <span className="ml-2 font-medium capitalize">
                                {species.size}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-600">Price:</span>
                              <span className="ml-2 font-medium text-green-600">
                                ${species.price}
                              </span>
                            </div>
                          </div>

                          <div className="mb-2">
                            <span className="text-sm text-gray-600">
                              Temperature Range:
                            </span>
                            <span className="ml-2 text-sm font-medium">
                              {species.preferredTemperature.min}°C -{" "}
                              {species.preferredTemperature.max}°C
                            </span>
                          </div>

                          <div className="flex flex-wrap gap-1">
                            <Badge variant="outline" className="text-xs">
                              {species.schooling ? "Schooling" : "Solitary"}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {species.size} size
                            </Badge>
                          </div>
                        </div>

                        <div className="ml-4">
                          {!isSpeciesUnlocked ? (
                            <Badge variant="outline" className="text-gray-500">
                              <Lock className="mr-1 h-3 w-3" />
                              Locked
                            </Badge>
                          ) : (
                            <Button
                              onClick={() => handleBuyFishClick(species)}
                              disabled={!canBuyFish(species)}
                              className={
                                canBuyFish(species) ? "" : "opacity-50"
                              }
                            >
                              {money < species.price
                                ? "Too Expensive"
                                : selectedTank &&
                                    selectedTank.fishIds.length >=
                                      selectedTank.capacity
                                  ? "Tank Full"
                                  : "Buy Fish"}
                            </Button>
                          )}
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>

            <Separator />

            {/* Bottom Section */}
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                <span className="text-lg font-semibold text-green-700">
                  Current Money: ${money}
                </span>
              </div>
              <Button variant="outline" onClick={() => setShowFishShop(false)}>
                Close Shop
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Sell Tank Confirmation Dialog */}
        <Dialog
          open={showSellConfirmation}
          onOpenChange={setShowSellConfirmation}
        >
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-xl">
                <Trash2 className="h-6 w-6 text-red-600" />
                Sell Tank
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600" />
                  <div>
                    <h3 className="font-semibold text-red-800">Warning</h3>
                    <p className="mt-1 text-sm text-red-700">
                      Selling this tank will permanently remove all fish inside
                      it. You cannot recover the fish or their value.
                    </p>
                  </div>
                </div>
              </div>

              {selectedTank && (
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    <strong>Tank Info:</strong>
                  </p>
                  <ul className="space-y-1 text-sm">
                    <li>• Size: {selectedTank.size}</li>
                    <li>• Fish count: {selectedTank.fishIds.length}</li>
                    <li>• Refund amount: ${tanks.size === 1 ? "6" : "3"}</li>
                  </ul>
                  {tanks.size === 1 && (
                    <p className="mt-2 rounded bg-green-50 p-2 text-sm text-green-700">
                      <strong>Note:</strong> Since this is your last tank,
                      you'll receive a full refund to help you rebuild.
                    </p>
                  )}
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowSellConfirmation(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={handleSellTank}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Sell Tank
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Tile Expansion Panel */}
        <TileExpansionPanel />

        {/* Customization Panel */}
        <CustomizationPanel />

        {/* Build Panel */}
        <BuildPanel />

        {/* All Objectives Modal */}
        <AllObjectivesModal />
      </div>
    </div>
  );
};
