import { GameMenuCard } from "@/components/gameUI/gameMenuCard";
import { useMenu } from "@/contexts/menu/useMenu";
import { Cog, Trophy, Users } from "lucide-react";

export default function PauseMenu() {
  const { openMenu } = useMenu();

  return (
    <GameMenuCard title="Menu" showBackButton={false}>
      <button
        onClick={() => openMenu("settings")}
        className="flex w-full items-center justify-between rounded-lg bg-gray-900/60 p-5 text-left text-lg font-medium text-white transition-all hover:translate-x-1 hover:bg-gray-900/80 hover:shadow-md hover:shadow-purple-500/10"
      >
        <span className="flex items-center gap-3">
          <Cog className="h-6 w-6 text-purple-400" />
          Settings
        </span>
        <span className="text-gray-400">→</span>
      </button>

      <button
        onClick={() => openMenu("stats")}
        className="flex w-full items-center justify-between rounded-lg bg-gray-900/60 p-5 text-left text-lg font-medium text-white transition-all hover:translate-x-1 hover:bg-gray-900/80 hover:shadow-md hover:shadow-purple-500/10"
      >
        <span className="flex items-center gap-3">
          <Trophy className="h-6 w-6 text-purple-400" />
          Stats
        </span>
        <span className="text-gray-400">→</span>
      </button>

      <button
        onClick={() => openMenu("credits")}
        className="flex w-full items-center justify-between rounded-lg bg-gray-900/60 p-5 text-left text-lg font-medium text-white transition-all hover:translate-x-1 hover:bg-gray-900/80 hover:shadow-md hover:shadow-purple-500/10"
      >
        <span className="flex items-center gap-3">
          <Users className="h-6 w-6 text-purple-400" />
          Credits
        </span>
        <span className="text-gray-400">→</span>
      </button>
    </GameMenuCard>
  );
}
