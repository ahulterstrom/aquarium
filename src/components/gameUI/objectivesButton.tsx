import { Button } from "@/components/ui/button";
import { Trophy, CheckCircle2 } from "lucide-react";
import { Objective } from "@/types/game.types";
import { cn } from "@/lib/utils";

interface ObjectivesButtonProps {
  objectives: Objective[];
  onClick: () => void;
  className?: string;
}

export const ObjectivesButton = ({ objectives, onClick, className }: ObjectivesButtonProps) => {
  if (objectives.length === 0) return null;

  // Find the first incomplete objective (current objective)
  const currentObjective = objectives.find(obj => !obj.completed);
  
  // Count completed objectives ready for collection
  const completedCount = objectives.filter(obj => obj.completed && !obj.rewarded).length;

  // If no current objective, show completed count
  const displayText = currentObjective 
    ? `${currentObjective.progress}/${currentObjective.target} ${currentObjective.title}`
    : completedCount > 0 
      ? `${completedCount} reward${completedCount !== 1 ? 's' : ''} ready`
      : "All objectives complete";

  return (
    <Button
      onClick={onClick}
      variant="outline"
      size="sm"
      className={cn(
        "flex items-center gap-2 bg-white/10 border-white/20 text-white hover:bg-white/20 max-w-64",
        completedCount > 0 && "bg-green-500/20 border-green-500/40 hover:bg-green-500/30",
        className
      )}
    >
      {completedCount > 0 ? (
        <CheckCircle2 className="h-4 w-4 text-green-400 animate-pulse" />
      ) : (
        <Trophy className="h-4 w-4 text-yellow-500" />
      )}
      <span className="truncate text-sm">{displayText}</span>
      {completedCount > 0 && (
        <div className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-green-500 text-xs font-bold text-white">
          {completedCount}
        </div>
      )}
    </Button>
  );
};