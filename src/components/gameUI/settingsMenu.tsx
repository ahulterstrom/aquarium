import { GameMenuCard } from "@/components/gameUI/gameMenuCard";
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
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { useGame } from "@/stores/useGame";
import { useGameStore } from "@/stores/gameStore";
import { useGridStore } from "@/stores/gridStore";
import { useEconomyStore } from "@/stores/economyStore";
import { useStatisticsStore } from "@/stores/statisticsStore";
import { Volume, Volume1, Volume2, VolumeX } from "lucide-react";
import { SoundMenu } from "@/components/gameUI/soundMenu";

export const SettingsMenu = () => {
  const isMuted = useGame.use.isMuted();
  const toggleMute = useGame.use.toggleMute();
  const masterVolume = useGame.use.masterVolume();
  const setMasterVolume = useGame.use.setMasterVolume();
  const musicVolume = useGame.use.musicVolume();
  const setMusicVolume = useGame.use.setMusicVolume();
  const sfxVolume = useGame.use.sfxVolume();
  const setSfxVolume = useGame.use.setSfxVolume();

  const getVolumeIcon = (level: number, isMuted: boolean) => {
    if (isMuted) return <VolumeX className="h-5 w-5" />;
    if (level === 0) return <VolumeX className="h-5 w-5" />;
    if (level < 0.33) return <Volume className="h-5 w-5" />;
    if (level < 0.66) return <Volume1 className="h-5 w-5" />;
    return <Volume2 className="h-5 w-5" />;
  };

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
      {/* Mute All Toggle */}

      <div>
        <AlertDialog>
          <AlertDialogTrigger>Reset Game Progress</AlertDialogTrigger>
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
      </div>
      <SoundMenu />
    </GameMenuCard>
  );
};
