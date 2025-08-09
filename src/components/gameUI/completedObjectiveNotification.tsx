import { Button } from "@/components/ui/button";
import { Gift, X } from "lucide-react";
import { Objective } from "@/types/game.types";
import { cn } from "@/lib/utils";

interface CompletedObjectiveNotificationProps {
  objective: Objective;
  onCollectReward: (objectiveId: string) => void;
  className?: string;
}

export const CompletedObjectiveNotification = ({ 
  objective, 
  onCollectReward, 
  className 
}: CompletedObjectiveNotificationProps) => {
  return (
    <div className={cn(
      "pointer-events-auto rounded-lg border border-green-500/50 bg-green-500/10 p-3 backdrop-blur-md",
      "animate-in slide-in-from-right-4 duration-300",
      className
    )}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-green-200 truncate">
            {objective.title}
          </h4>
          <p className="text-xs text-green-300 mt-0.5">
            Objective complete!
          </p>
        </div>
        <Button
          size="sm"
          className="h-8 px-3 text-xs bg-green-600 hover:bg-green-700 flex-shrink-0"
          onClick={() => onCollectReward(objective.id)}
        >
          <Gift className="mr-1 h-3 w-3" />
          +${objective.moneyReward}
        </Button>
      </div>
    </div>
  );
};