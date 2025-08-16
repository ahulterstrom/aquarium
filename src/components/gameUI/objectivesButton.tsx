import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useGameStore } from "@/stores/gameStore";
import { useUIStore } from "@/stores/uiStore";
import { CheckCircle2, Trophy } from "lucide-react";

interface ObjectivesButtonProps {
  className?: string;
}

export const ObjectivesButton = ({ className }: ObjectivesButtonProps) => {
  const activeObjectives = useGameStore.use.activeObjectives();
  const showObjectives = useUIStore.use.showObjectives();
  const setShowObjectives = useUIStore.use.setShowObjectives();

  if (activeObjectives.length === 0) return null;

  // Find the first incomplete objective (current objective)
  const currentObjective = activeObjectives.find((obj) => !obj.completed);

  // Count completed objectives ready for collection
  const completedCount = activeObjectives.filter(
    (obj) => obj.completed && !obj.rewarded,
  ).length;

  // If no current objective, show completed count
  const displayText = currentObjective
    ? `${currentObjective.progress}/${currentObjective.target} ${currentObjective.title}`
    : completedCount > 0
      ? `${completedCount} reward${completedCount !== 1 ? "s" : ""} ready`
      : "All objectives complete";

  return (
    <div
      onClick={() => setShowObjectives(!showObjectives)}
      className={cn(
        "glass pointer-events-auto mb-4 flex cursor-pointer items-center gap-2 border-white/20 bg-white/10 p-4 text-foreground hover:bg-white/20",
        completedCount > 0 &&
          "border-green-500/40 bg-green-500/20 hover:bg-green-500/30",
        className,
      )}
    >
      {completedCount > 0 ? (
        <CheckCircle2 className="h-4 w-4 animate-pulse text-green-400" />
      ) : (
        <Trophy className="h-4 w-4 text-yellow-500" />
      )}
      <div className="mx-auto truncate text-sm">{displayText}</div>
      {completedCount > 0 && (
        <div className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-green-500 text-xs font-bold text-white">
          {completedCount}
        </div>
      )}
    </div>
  );
};
