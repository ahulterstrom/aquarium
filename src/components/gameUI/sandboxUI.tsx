"use client";

import { useState, useEffect, useMemo, forwardRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Fish,
  DollarSign,
  Plus,
  X,
  Thermometer,
  Droplets,
  Wrench,
  MapPin,
  ShoppingCart,
  Home,
  AlertTriangle,
  Trash2,
  Pause,
  Play,
  FastForward,
} from "lucide-react";

// Import game stores and types
import * as THREE from "three";
import { useGameStore } from "../../stores/gameStore";
import { useGridStore } from "../../stores/gridStore";
import { useUIStore } from "../../stores/uiStore";
import { useSceneMachine } from "../../contexts/scene/useScene";
import {
  Tank as TankType,
  FishSpecies,
  Fish as FishType,
} from "../../types/game.types";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { GameTimeDisplay } from "@/components/gameUI/gameTimeDisplay";

// Fish species available for purchase
const FISH_SPECIES: FishSpecies[] = [
  {
    id: "goldfish",
    name: "Goldfish",
    price: 2,
    rarity: "common",
    preferredTemperature: { min: 18, max: 26 },
    size: "small",
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
    size: "small",
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
    size: "small",
    schooling: false,
    aggressiveness: 0.3,
    feedingInterval: 8,
  },
];

export const SandboxUI = () => {
  const [showFishShop, setShowFishShop] = useState(false);
  const [showSellConfirmation, setShowSellConfirmation] = useState(false);
  const [contextMessage, setContextMessage] = useState("");

  const {
    tanks,
    money,
    spendMoney,
    addFish,
    updateTank,
    removeTank,
    gameSpeed,
    setGameSpeed,
    isPaused,
    setPaused,
    day,
  } = useGameStore();
  const { removeObject } = useGridStore();
  const { placementMode, setPlacementMode, selectedTankId, selectTank } =
    useUIStore();

  // Get the selected tank from the store
  const selectedTank = selectedTankId ? tanks.get(selectedTankId) : null;

  // This is so we can still have the tank info during the exit transition
  const displaySelectedTank = useMemo(() => {
    return (
      selectedTank || {
        id: "",
        position: { x: 0, y: 0, z: 0 },
        size: "medium",
        waterQuality: 1,
        temperature: 25,
        capacity: 5,
        fishIds: [],
        decorations: [],
        maintenanceLevel: 1,
      }
    );
  }, [selectedTank]);

  const TANK_COST = 6;

  const handlePlaceTank = () => {
    if (money < TANK_COST) {
      setContextMessage("Not enough money to place a tank.");
      setTimeout(() => setContextMessage(""), 3000);
      return;
    }

    if (placementMode === "tank") {
      setPlacementMode("none");
      setContextMessage("");
    } else {
      setPlacementMode("tank");
      setContextMessage("");
    }
  };

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
    const fishId = `fish_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newFish: FishType = {
      id: fishId,
      species: species,
      tankId: selectedTank.id,
      health: 1,
      happiness: 0.8,
      age: 0,
      position: new THREE.Vector3(
        selectedTank.position.x * 2 + (Math.random() - 0.5) * 1.5,
        selectedTank.position.y + 0.5 + Math.random() * 0.5,
        selectedTank.position.z * 2 + (Math.random() - 0.5) * 1.5,
      ),
      velocity: new THREE.Vector3(0, 0, 0),
      hunger: 0.3,
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
        {/* Game Speed Controls - Top Center */}
        <Card className="pointer-events-auto absolute top-4 left-1/2 -translate-x-1/2 border-white/20 bg-white/20 p-2 shadow-sm backdrop-blur-sm">
          <CardContent className="flex items-center justify-center gap-2">
            <div className="flex items-center gap-1">
              <DollarSign className="h-4 w-4 text-green-600" />
              <span className="font-semibold text-green-700">{money}</span>
            </div>
            <Separator orientation="vertical" className="h-10" />
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Day {day}</span>
              <GameTimeDisplay />
            </div>
            <Separator orientation="vertical" className="h-10" />

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

        <Sheet open={true}>
          <SheetContent
            withOverlay={false}
            withCloseButton={false}
            side="left"
            className="pointer-events-auto w-50 bg-white/50 shadow-lg backdrop-blur-sm"
          >
            <SheetTitle className="sr-only">Game UI</SheetTitle>
            <div className="space-y-4 p-2">
              {/* Place Tank Button */}
              <TooltipProvider>
                <Tooltip delayDuration={200}>
                  <TooltipTrigger asChild>
                    <span className="block w-full">
                      <Button
                        onClick={handlePlaceTank}
                        className={`w-full ${placementMode === "tank" ? "bg-orange-500 hover:bg-orange-600" : ""}`}
                        disabled={money < TANK_COST && placementMode !== "tank"}
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        {placementMode === "tank"
                          ? "Cancel Placement"
                          : `Place Tank ($${TANK_COST})`}
                      </Button>
                    </span>
                  </TooltipTrigger>
                  {money < TANK_COST && placementMode !== "tank" && (
                    <TooltipContent>
                      <p>You need ${TANK_COST - money} more to place a tank</p>
                    </TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>

              {/* Tank Count */}
              <div className="flex items-center justify-between rounded-lg bg-blue-50 p-2">
                <span className="text-sm font-medium text-blue-700">
                  Tanks Placed:
                </span>
                <Badge
                  variant="secondary"
                  className="bg-blue-100 text-blue-800"
                >
                  {tanks.size}/9
                </Badge>
              </div>

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
            </div>
          </SheetContent>
        </Sheet>

        {/* Tank Info Panel - Right Side */}
        {
          <Sheet open={!!selectedTank}>
            <SheetContent
              withOverlay={false}
              withCloseButton={false}
              side="right"
              className="pointer-events-auto w-80 bg-white/50 p-2 shadow-lg backdrop-blur-sm"
            >
              <SheetHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <SheetTitle className="flex items-center gap-2 text-lg">
                    <Droplets className="h-5 w-5 text-blue-600" />
                    Tank Info
                  </SheetTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => selectTank(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </SheetHeader>
              <div className="space-y-4">
                {/* Tank Size & Capacity */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Tank Size
                    </label>
                    <p className="text-lg font-semibold capitalize">
                      {displaySelectedTank.size}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Capacity
                    </label>
                    <p className="text-lg font-semibold">
                      {displaySelectedTank.capacity} fish
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
                      {Math.round(displaySelectedTank.waterQuality * 100)}%
                    </span>
                  </div>
                  <Progress
                    value={displaySelectedTank.waterQuality * 100}
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
                      {displaySelectedTank.temperature}°C
                    </p>
                  </div>
                </div>

                {/* Maintenance Level */}
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label className="flex items-center gap-1 text-sm font-medium text-gray-600">
                      <Wrench className="h-4 w-4" />
                      Maintenance Level
                    </label>
                    <span className="text-sm font-semibold">
                      {Math.round(displaySelectedTank.maintenanceLevel * 100)}%
                    </span>
                  </div>
                  <Progress
                    value={displaySelectedTank.maintenanceLevel * 100}
                    className="h-2"
                  />
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
                    {displaySelectedTank.fishIds.length} /{" "}
                    {displaySelectedTank.capacity}
                  </Badge>
                </div>

                {/* Tank Position */}
                <div className="flex items-center gap-2 rounded-lg bg-gray-50 p-2">
                  <MapPin className="h-4 w-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-600">
                    Position: Grid ({displaySelectedTank.position.x},{" "}
                    {displaySelectedTank.position.z})
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2">
                  <Button
                    onClick={() => setShowFishShop(true)}
                    className="w-full"
                    disabled={
                      displaySelectedTank.fishIds.length >=
                      displaySelectedTank.capacity
                    }
                  >
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    {displaySelectedTank.fishIds.length >=
                    displaySelectedTank.capacity
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
            </SheetContent>
          </Sheet>
        }

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
                {FISH_SPECIES.map((species) => (
                  <Card key={species.id} className="p-4">
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
                        <Button
                          onClick={() => handleBuyFishClick(species)}
                          disabled={!canBuyFish(species)}
                          className={canBuyFish(species) ? "" : "opacity-50"}
                        >
                          {money < species.price
                            ? "Too Expensive"
                            : selectedTank &&
                                selectedTank.fishIds.length >=
                                  selectedTank.capacity
                              ? "Tank Full"
                              : "Buy Fish"}
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
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
      </div>
    </div>
  );
};
