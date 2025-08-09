import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Circle, Trophy, Gift, List } from "lucide-react";
import { Objective } from "@/types/game.types";
import { cn } from "@/lib/utils";

interface ObjectivesPanelProps {
  objectives: Objective[];
  onCollectReward: (objectiveId: string) => void;
  onViewAll: () => void;
  className?: string;
}

export const ObjectivesPanel = ({ objectives, onCollectReward, onViewAll, className }: ObjectivesPanelProps) => {
  if (objectives.length === 0) return null;

  return (
    <Card className={cn(
      "pointer-events-auto absolute top-20 right-4 w-80 border-white/20 bg-white/10 backdrop-blur-md",
      className
    )}>
      <CardContent className="p-4">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            <h3 className="font-semibold text-white">Objectives</h3>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="h-6 px-2 text-xs"
            onClick={onViewAll}
          >
            <List className="mr-1 h-3 w-3" />
            View All
          </Button>
        </div>
        
        <div className="space-y-3">
          {objectives.map((objective) => (
            <div
              key={objective.id}
              className={cn(
                "rounded-lg border p-3 transition-all duration-300",
                objective.completed 
                  ? "border-green-500/50 bg-green-500/10" 
                  : "border-white/20 bg-white/5"
              )}
            >
                <div className="mb-2 flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      {objective.completed ? (
                        <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-green-500" />
                      ) : (
                        <Circle className="h-4 w-4 flex-shrink-0 text-gray-400" />
                      )}
                      <h4 className={cn(
                        "text-sm font-medium",
                        objective.completed ? "text-green-200" : "text-white"
                      )}>
                        {objective.title}
                      </h4>
                    </div>
                    <p className={cn(
                      "ml-6 mt-1 text-xs",
                      objective.completed ? "text-green-300" : "text-gray-300"
                    )}>
                      {objective.description}
                    </p>
                  </div>
                  <div className="ml-2 flex items-center gap-1">
                    {objective.completed ? (
                      <Button
                        size="sm"
                        className="h-6 px-2 text-xs bg-green-600 hover:bg-green-700"
                        onClick={() => onCollectReward(objective.id)}
                      >
                        <Gift className="mr-1 h-3 w-3" />
                        +${objective.moneyReward}
                      </Button>
                    ) : (
                      <span className="text-sm font-medium text-green-400">
                        +${objective.moneyReward}
                      </span>
                    )}
                  </div>
                </div>

                {/* Progress bar */}
                {!objective.completed && (
                  <div className="ml-6 mt-2">
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <span className="text-gray-400">Progress</span>
                      <span className="text-white">
                        {objective.progress}/{objective.target}
                      </span>
                    </div>
                    <Progress 
                      value={(objective.progress / objective.target) * 100} 
                      className="h-2"
                    />
                  </div>
                )}

              </div>
            ))}
          </div>
      </CardContent>
    </Card>
  );
};