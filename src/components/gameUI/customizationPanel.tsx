import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Paintbrush, Palette } from "lucide-react";
import { useState } from "react";
import { useUIStore } from "../../stores/uiStore";
import { useGameStore } from "../../stores/gameStore";

// Define available wall and floor styles
const WALL_STYLES = [
  { id: "concrete", name: "Concrete", color: 0x666666 },
  { id: "glass", name: "Glass", color: 0x87ceeb },
  { id: "brick", name: "Brick", color: 0x8b4513 },
  { id: "metal", name: "Metal", color: 0x808080 },
  { id: "wood", name: "Wood", color: 0x654321 },
];

const FLOOR_STYLES = [
  { id: "sand", name: "Sand", color: 0xf4e4c1 },
  { id: "tile", name: "Tile", color: 0xe0e0e0 },
  { id: "wood", name: "Wood", color: 0x8b4513 },
  { id: "marble", name: "Marble", color: 0xffffff },
  { id: "stone", name: "Stone", color: 0x696969 },
];

export const CustomizationPanel = () => {
  const showCustomization = useUIStore.use.showCustomization();
  const setShowCustomization = useUIStore.use.setShowCustomization();

  const [showWallModal, setShowWallModal] = useState(false);
  const [showFloorModal, setShowFloorModal] = useState(false);
  const [selectedWallStyle, setSelectedWallStyle] = useState("concrete");
  const [selectedFloorStyle, setSelectedFloorStyle] = useState("wood");

  // Get current styles from game store
  const wallStyle = useGameStore.use.wallStyle();
  const floorStyle = useGameStore.use.floorStyle();
  const setWallStyle = useGameStore.use.setWallStyle();
  const setFloorStyle = useGameStore.use.setFloorStyle();

  const handleWallStyleSelect = (styleId: string) => {
    setSelectedWallStyle(styleId);
  };

  const handleFloorStyleSelect = (styleId: string) => {
    setSelectedFloorStyle(styleId);
  };

  const applyWallStyle = () => {
    setWallStyle(selectedWallStyle);
    setShowCustomization(false);
    setShowWallModal(false);
  };

  const applyFloorStyle = () => {
    setFloorStyle(selectedFloorStyle);
    setShowCustomization(false);
    setShowFloorModal(false);
  };

  return (
    <>
      <Sheet open={showCustomization} onOpenChange={setShowCustomization}>
        <SheetContent side="left" className="mx-auto max-w-2xl">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Paintbrush className="h-6 w-6 text-purple-600" />
              Aquarium Customization
            </SheetTitle>
          </SheetHeader>

          <div className="space-y-6 p-4">
            <div className="mb-4 text-sm text-gray-600">
              Customize the look of your aquarium with different wall and floor
              styles.
            </div>

            {/* Wall Customization Button */}
            <div className="rounded-lg border p-4">
              <div className="mb-3">
                <h3 className="flex items-center gap-2 font-semibold">
                  <Palette className="h-4 w-4 text-gray-600" />
                  Wall Style
                </h3>
                <p className="mt-1 text-sm text-gray-600">
                  Change the appearance of your aquarium walls
                </p>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-sm">
                  Current:{" "}
                  <span className="font-medium">
                    {WALL_STYLES.find((s) => s.id === wallStyle)?.name ||
                      "Concrete"}
                  </span>
                </div>
                <Button
                  onClick={() => setShowWallModal(true)}
                  variant="outline"
                >
                  <Paintbrush className="mr-2 h-4 w-4" />
                  Customize Walls
                </Button>
              </div>
            </div>

            {/* Floor Customization Button */}
            <div className="rounded-lg border p-4">
              <div className="mb-3">
                <h3 className="flex items-center gap-2 font-semibold">
                  <Palette className="h-4 w-4 text-gray-600" />
                  Floor Style
                </h3>
                <p className="mt-1 text-sm text-gray-600">
                  Change the appearance of your aquarium floor
                </p>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-sm">
                  Current:{" "}
                  <span className="font-medium">
                    {FLOOR_STYLES.find((s) => s.id === floorStyle)?.name ||
                      "Wood"}
                  </span>
                </div>
                <Button
                  onClick={() => setShowFloorModal(true)}
                  variant="outline"
                >
                  <Paintbrush className="mr-2 h-4 w-4" />
                  Customize Floor
                </Button>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Wall Style Modal */}
      <Dialog open={showWallModal} onOpenChange={setShowWallModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Select Wall Style</DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-3 py-4">
            {WALL_STYLES.map((style) => (
              <button
                key={style.id}
                onClick={() => handleWallStyleSelect(style.id)}
                className={`rounded-lg border-2 p-4 transition-all ${
                  selectedWallStyle === style.id
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div
                  className="mb-2 h-16 w-full rounded"
                  style={{
                    backgroundColor: `#${style.color.toString(16).padStart(6, "0")}`,
                  }}
                />
                <div className="text-sm font-medium">{style.name}</div>
              </button>
            ))}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowWallModal(false)}>
              Cancel
            </Button>
            <Button onClick={applyWallStyle}>Apply</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Floor Style Modal */}
      <Dialog open={showFloorModal} onOpenChange={setShowFloorModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Select Floor Style</DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-3 py-4">
            {FLOOR_STYLES.map((style) => (
              <button
                key={style.id}
                onClick={() => handleFloorStyleSelect(style.id)}
                className={`rounded-lg border-2 p-4 transition-all ${
                  selectedFloorStyle === style.id
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div
                  className="mb-2 h-16 w-full rounded"
                  style={{
                    backgroundColor: `#${style.color.toString(16).padStart(6, "0")}`,
                  }}
                />
                <div className="text-sm font-medium">{style.name}</div>
              </button>
            ))}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowFloorModal(false)}>
              Cancel
            </Button>
            <Button onClick={applyFloorStyle}>Apply</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
