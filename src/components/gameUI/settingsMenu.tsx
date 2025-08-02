import { GameMenuCard } from "@/components/gameUI/gameMenuCard";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { useGame } from "@/stores/useGame";
import { Volume, Volume1, Volume2, VolumeX } from "lucide-react";

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

  return (
    <GameMenuCard title="Settings" className="w-md">
      {/* Mute All Toggle */}
      <div className="flex items-center justify-between rounded-lg bg-gray-900/60 p-4 transition-colors hover:bg-gray-900/80">
        <div className="space-y-1">
          <Label
            htmlFor="mute-toggle"
            className="text-lg font-medium text-white"
          >
            Mute All Sound
          </Label>
          <p className="text-sm text-gray-400">Disable all game audio</p>
        </div>
        <Switch
          id="mute-toggle"
          checked={isMuted}
          onCheckedChange={toggleMute}
          className="data-[state=checked]:bg-purple-600"
        />
      </div>

      {/* Master Volume */}
      <div className="space-y-3 rounded-lg bg-gray-900/60 p-4 transition-colors hover:bg-gray-900/80">
        <div className="flex items-center justify-between">
          <Label
            htmlFor="master-volume"
            className="text-lg font-medium text-white"
          >
            Master Volume
          </Label>
          <div className="flex items-center gap-2">
            {getVolumeIcon(masterVolume, isMuted)}
            <span className="min-w-10 text-right text-sm text-gray-300">
              {Math.round(masterVolume * 100)}%
            </span>
          </div>
        </div>
        <Slider
          id="master-volume"
          disabled={isMuted}
          value={[masterVolume]}
          onValueChange={(value) => setMasterVolume(value[0])}
          max={1}
          step={0.01}
          className={`${isMuted ? "opacity-50" : ""}`}
        />
      </div>

      {/* Music Volume */}
      <div className="space-y-3 rounded-lg bg-gray-900/60 p-4 transition-colors hover:bg-gray-900/80">
        <div className="flex items-center justify-between">
          <Label
            htmlFor="music-volume"
            className="text-lg font-medium text-white"
          >
            Music Volume
          </Label>
          <div className="flex items-center gap-2">
            {getVolumeIcon(musicVolume, isMuted)}
            <span className="min-w-10 text-right text-sm text-gray-300">
              {Math.round(musicVolume * 100)}%
            </span>
          </div>
        </div>
        <Slider
          id="music-volume"
          disabled={isMuted}
          value={[musicVolume]}
          onValueChange={(value) => setMusicVolume(value[0])}
          max={1}
          step={0.01}
          className={`${isMuted ? "opacity-50" : ""}`}
        />
      </div>

      {/* Sound Effects Volume */}
      <div className="space-y-3 rounded-lg bg-gray-900/60 p-4 transition-colors hover:bg-gray-900/80">
        <div className="flex items-center justify-between">
          <Label
            htmlFor="sfx-volume"
            className="text-lg font-medium text-white"
          >
            Sound Effects
          </Label>
          <div className="flex items-center gap-2">
            {getVolumeIcon(sfxVolume, isMuted)}
            <span className="min-w-10 text-right text-sm text-gray-300">
              {Math.round(sfxVolume * 100)}%
            </span>
          </div>
        </div>
        <Slider
          id="sfx-volume"
          disabled={isMuted}
          value={[sfxVolume]}
          onValueChange={(value) => setSfxVolume(value[0])}
          max={1}
          step={0.01}
          className={`${isMuted ? "opacity-50" : ""}`}
        />
      </div>
    </GameMenuCard>
  );
};
