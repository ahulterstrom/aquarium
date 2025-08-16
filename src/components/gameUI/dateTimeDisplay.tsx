import { GameTimeDisplay } from "@/components/gameUI/gameTimeDisplay";
import { useGameStore } from "@/stores/gameStore";

export const DateTimeDisplay = () => {
  const day = useGameStore.use.day();

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium whitespace-nowrap">Day {day}</span>
      <GameTimeDisplay />
    </div>
  );
};
