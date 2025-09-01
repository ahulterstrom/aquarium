import { GameMenuCard } from "@/components/gameUI/gameMenuCard";
import { SoundMenu } from "@/components/gameUI/soundMenu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useEconomyStore } from "@/stores/economyStore";
import { useGameStore } from "@/stores/gameStore";
import { useGridStore } from "@/stores/gridStore";
import { useStatisticsStore } from "@/stores/statisticsStore";
import { RotateCcw } from "lucide-react";

export const SettingsMenu = () => {
  const handleGameReset = () => {
    localStorage.removeItem("aquarium-game-state");
    localStorage.removeItem("aquarium-grid-state");
    localStorage.removeItem("aquarium-economy-state");
    localStorage.removeItem("aquarium-statistics");
    localStorage.removeItem("aquarium-ui-state");
    localStorage.removeItem("game-storage");

    useGameStore.getState().reset();
    useGridStore.getState().reset();
    useEconomyStore.getState().reset();
    useStatisticsStore.getState().reset();

    useGridStore.getState().initializeGrid(3, 1, 3);

    window.location.reload();
  };

  return (
    <GameMenuCard title="Settings" className="w-md">
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="glass" className="h-12 w-full">
            <RotateCcw />
            Reset Game Progress
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent className="z-999">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will completely reset your Aquarium and cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleGameReset}>
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <SoundMenu />
    </GameMenuCard>
  );
};
