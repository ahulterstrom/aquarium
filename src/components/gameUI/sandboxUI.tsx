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
import { AlertTriangle, DollarSign, Fish, Lock, Trash2 } from "lucide-react";
import { useState } from "react";

// Import game stores and types
import { AllObjectivesModal } from "@/components/gameUI/allObjectivesModal";
import { AnimatedObjectivesPanel } from "@/components/gameUI/animatedObjectivesPanel";
import { BottomPanel } from "@/components/gameUI/bottomPanel";
import { BuildPanel } from "@/components/gameUI/buildPanel";
import { CustomizationPanel } from "@/components/gameUI/customizationPanel";
import { EntityInfoPanel } from "@/components/gameUI/entityInfoPanel";
import { PlacementControls } from "@/components/gameUI/placementControls";
import { SettingsModal } from "@/components/gameUI/settingsModal";
import { StatisticsModal } from "@/components/gameUI/statisticsModal";
import { TileExpansionPanel } from "@/components/gameUI/tileExpansionPanel";
import { TopPanel } from "@/components/gameUI/topPanel";
import { ScreenshotControls } from "@/components/screenshot/ScreenshotControls";
import { spawnVisitor } from "@/components/systems/visitorSystem";
import { useSound } from "@/contexts/sound/useSound";
import { useGame } from "@/stores/useGame";
import * as THREE from "three";
import { useGameStore } from "../../stores/gameStore";
import { useGridStore } from "../../stores/gridStore";
import { useUIStore } from "../../stores/uiStore";
import { FishSpecies, Fish as FishType } from "../../types/game.types";

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

  const isDebugging = useGame.use.isDebugging();
  const { soundController } = useSound();
  const tanks = useGameStore.use.tanks();
  const money = useGameStore.use.money();
  const spendMoney = useGameStore.use.spendMoney();
  const addFish = useGameStore.use.addFish();
  const updateTank = useGameStore.use.updateTank();
  const removeTank = useGameStore.use.removeTank();
  const isUnlocked = useGameStore.use.isUnlocked();

  const removeObject = useGridStore.use.removeObject();
  const showFishShop = useUIStore.use.showFishShop();
  const setShowFishShop = useUIStore.use.setShowFishShop();
  const showSellConfirmation = useUIStore.use.showSellConfirmation();
  const setShowSellConfirmation = useUIStore.use.setShowSellConfirmation();

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

  return (
    <div className="fixed inset-0">
      {/* Main UI Overlay */}
      <div className="relative h-full p-4">
        <TopPanel />

        <BottomPanel />

        {isDebugging && (
          <div className="pointer-events-auto absolute top-0 left-0 w-30 space-y-2 bg-orange-400/50 p-2">
            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs whitespace-break-spaces"
              onClick={() => spawnVisitor(undefined, soundController)}
            >
              1 Visitor
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs whitespace-break-spaces"
              onClick={() => {
                for (let i = 0; i < 10; i++) {
                  spawnVisitor(undefined, soundController);
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
                const fish = useGameStore.getState().fish;
                console.log("Fish:", Array.from(fish.entries()));
              }}
            >
              Log Fish
            </Button>
            {/* <Button
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
            </Button> */}

            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs whitespace-break-spaces"
              onClick={() => {
                const state = useGameStore.getState();
                const objectiveSystem = state.objectiveSystem;
                console.log("Active Objectives:", state.activeObjectives);
                console.log(
                  "All Objectives:",
                  objectiveSystem.getAllObjectives(),
                );
                console.log("All objectives", state.allObjectives);
                console.log(
                  "Get active objectives:",
                  objectiveSystem.getActiveObjectives(),
                );
              }}
            >
              Log objectives
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs whitespace-break-spaces"
              onClick={() => {
                const tanks = useGameStore.getState().tanks;
                console.log("Tanks:", Array.from(tanks.entries()));
              }}
            >
              Log POIs
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs whitespace-break-spaces"
              onClick={() => {
                const state = useGameStore.getState();
                state.addMoney(100);
              }}
            >
              Give $100
            </Button>
          </div>
        )}

        <AnimatedObjectivesPanel />

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

        {/* Screenshot Controls */}
        <ScreenshotControls />

        {/* PlacementMode Controls */}
        <PlacementControls />

        {/* Statistics Modal */}
        <StatisticsModal />

        {/* Settings Modal */}
        <SettingsModal />
      </div>
    </div>
  );
};
