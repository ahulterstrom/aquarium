import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Circle, Trophy, Gift, List, XIcon } from "lucide-react";
import { Objective } from "@/types/game.types";
import { cn } from "@/lib/utils";
import { SheetClose } from "@/components/ui/sheet";
import { Close } from "@radix-ui/react-dialog";
import { useUIStore } from "@/stores/uiStore";

interface ObjectivesPanelProps {
  objectives: Objective[];
  onCollectReward: (objectiveId: string) => void;
  onViewAll: () => void;
  className?: string;
}

export const ObjectivesPanel = ({
  objectives,
  onCollectReward,
  onViewAll,
  className,
}: ObjectivesPanelProps) => {
  if (objectives.length === 0) return null;
  const setShowObjectives = useUIStore.use.setShowObjectives();
  const setShowAllObjectives = useUIStore.use.setShowAllObjectives();

  return (
    <div className={cn("pointer-events-auto", className)}>
      <div className="glass p-4">
        <div className="mb-3 flex items-center justify-start gap-2">
          <div className="flex items-center gap-2">
            <Trophy className="size-5 text-yellow-500" />
            <h3 className="font-semibold text-gray-900">Objectives</h3>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="ml-auto h-6 px-2 text-xs"
            onClick={() => setShowAllObjectives(true)}
          >
            <List className="mr-1 h-3 w-3" />
            View All
          </Button>

          <Close onClick={() => setShowObjectives(false)}>
            <>
              <XIcon className="size-4" />
              <span className="sr-only">Close</span>
            </>
          </Close>
        </div>

        <div className="space-y-3">
          {objectives.map((objective) => (
            <div
              key={objective.id}
              className={cn(
                "rounded-lg border p-3 transition-all duration-300",
                objective.completed
                  ? "border-green-500/50 bg-green-500/10"
                  : "border-gray-300 bg-white/50",
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
                    <h4
                      className={cn(
                        "text-sm font-medium",
                        objective.completed
                          ? "text-green-700"
                          : "text-gray-800",
                      )}
                    >
                      {objective.title}
                    </h4>
                  </div>
                  <p
                    className={cn(
                      "mt-1 ml-6 text-xs",
                      objective.completed ? "text-green-600" : "text-gray-600",
                    )}
                  >
                    {objective.description}
                  </p>
                </div>
                <div className="ml-2 flex items-center gap-1">
                  {objective.completed ? (
                    <Button
                      size="sm"
                      className="h-6 bg-green-600 px-2 text-xs hover:bg-green-700"
                      onClick={() => onCollectReward(objective.id)}
                    >
                      <Gift className="mr-1 h-3 w-3" />
                      +${objective.moneyReward}
                    </Button>
                  ) : (
                    <span className="text-sm font-medium text-green-600">
                      +${objective.moneyReward}
                    </span>
                  )}
                </div>
              </div>

              {/* Progress bar */}
              {!objective.completed && (
                <div className="mt-2 ml-6">
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="text-gray-500">Progress</span>
                    <span className="font-medium text-gray-700">
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
      </div>
    </div>
  );
};
