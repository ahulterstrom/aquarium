import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Circle, Lock, Trophy, Gift } from "lucide-react";
import { Objective, ObjectiveType } from "@/types/game.types";
import { cn } from "@/lib/utils";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { useUIStore } from "@/stores/uiStore";
import { useGameStore } from "@/stores/gameStore";

// Define the order of objectives for display
const OBJECTIVE_ORDER: ObjectiveType[] = [
  "place_entrance",
  "build_first_tank",
  "buy_fish",
  "earn_money",
  "attract_visitors",
  "satisfy_visitors",
  "build_multiple_tanks",
  "expand_aquarium",
];

export const AllObjectivesModal = () => {
  const showAllObjectives = useUIStore.use.showAllObjectives();
  const setShowAllObjectives = useUIStore.use.setShowAllObjectives();
  const allObjectives = useGameStore.use.allObjectives();
  const collectObjectiveReward = useGameStore.use.collectObjectiveReward();
  
  // Sort objectives by the defined order
  const sortedObjectives = [...allObjectives].sort((a, b) => {
    const aIndex = OBJECTIVE_ORDER.indexOf(a.type);
    const bIndex = OBJECTIVE_ORDER.indexOf(b.type);
    return aIndex - bIndex;
  });

  // Determine objective state
  const getObjectiveState = (objective: Objective) => {
    if (objective.rewarded) return "completed";
    if (objective.completed) return "ready_to_collect";
    return "active";
  };

  // Check if prerequisites are met for display purposes
  const arePrerequisitesMet = (objective: Objective) => {
    if (!objective.prerequisites || objective.prerequisites.length === 0) {
      return true;
    }
    return objective.prerequisites.every((prereq) => {
      const prereqObj = allObjectives.find((o) => o.type === prereq);
      return prereqObj && prereqObj.completed;
    });
  };

  return (
    <Dialog open={showAllObjectives} onOpenChange={setShowAllObjectives}>
      <DialogContent
        showOverlay={false}
        className="glass flex h-[80vh] min-h-0 max-w-4xl flex-col overflow-hidden"
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Trophy className="h-6 w-6 text-yellow-500" />
            All Objectives
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="min-h-0 w-full flex-1" type="always">
          <div className="px-4">
            <div className="mb-4 text-sm text-gray-700">
              Track your progress through all aquarium objectives. Complete
              objectives to unlock new challenges!
            </div>

            <div className="space-y-3">
              {sortedObjectives.map((objective) => {
                const state = getObjectiveState(objective);
                const prerequisitesMet = arePrerequisitesMet(objective);

                return (
                  <div
                    key={objective.id}
                    className={cn(
                      "rounded-lg border p-4 backdrop-blur-sm transition-all duration-300",
                      state === "completed" &&
                        "border-green-500/50 bg-green-50/50",
                      state === "ready_to_collect" &&
                        "border-green-500/50 bg-green-100/50",
                      state === "active" && prerequisitesMet && "border-blue-500/50 bg-blue-50/50",
                      state === "active" && !prerequisitesMet && "border-gray-300 bg-gray-50/50",
                    )}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex flex-1 items-start gap-3">
                        <div className="flex-1">
                          <div className="mb-1 flex items-center gap-2">
                            {state === "completed" && (
                              <CheckCircle2 className="h-5 w-5 text-green-500" />
                            )}
                            {state === "ready_to_collect" && (
                              <CheckCircle2 className="h-5 w-5 animate-pulse text-green-500" />
                            )}
                            {state === "active" && prerequisitesMet && (
                              <Circle className="h-5 w-5 text-blue-400" />
                            )}
                            {state === "active" && !prerequisitesMet && (
                              <Lock className="h-5 w-5 text-gray-400" />
                            )}

                            <h3
                              className={cn(
                                "font-semibold",
                                state === "completed" && "text-green-700",
                                state === "ready_to_collect" &&
                                  "text-green-700",
                                state === "active" && prerequisitesMet && "text-blue-700",
                                state === "active" && !prerequisitesMet && "text-gray-600",
                              )}
                            >
                              {objective.title}
                            </h3>
                          </div>

                          <p
                            className={cn(
                              "mb-2 text-sm",
                              state === "completed" && "text-green-600",
                              state === "ready_to_collect" && "text-green-600",
                              state === "active" && prerequisitesMet && "text-blue-600",
                              state === "active" && !prerequisitesMet && "text-gray-500",
                            )}
                          >
                            {objective.description}
                          </p>

                          {/* Progress bar for active objectives */}
                          {state === "active" && prerequisitesMet && (
                            <div className="mb-2">
                              <div className="mb-1 flex items-center justify-between text-xs">
                                <span className="text-gray-500">Progress</span>
                                <span className="font-medium text-gray-700">
                                  {objective.progress}/{objective.target}
                                </span>
                              </div>
                              <Progress
                                value={
                                  (objective.progress / objective.target) * 100
                                }
                                className="h-2"
                              />
                            </div>
                          )}

                          {/* Prerequisites for locked objectives */}
                          {state === "active" && !prerequisitesMet && objective.prerequisites && (
                            <div className="text-xs text-gray-600">
                              <span className="font-medium">Requires: </span>
                              {objective.prerequisites
                                .map((prereq) => {
                                  const prereqObj = allObjectives.find((o) => o.type === prereq);
                                  return prereqObj ? prereqObj.title : prereq;
                                })
                                .join(", ")}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="ml-4 flex flex-shrink-0 items-center gap-2">
                        <div className="text-sm font-medium text-green-600">
                          +${objective.moneyReward}
                        </div>

                        {state === "ready_to_collect" && (
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => collectObjectiveReward(objective.id)}
                          >
                            <Gift className="mr-1 h-3 w-3" />
                            Collect
                          </Button>
                        )}

                        {state === "completed" && (
                          <div className="flex items-center gap-1 text-sm text-green-500">
                            <CheckCircle2 className="h-4 w-4" />
                            Complete
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </ScrollArea>

        {/* Summary Stats */}
        <div className="border-t pt-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-green-500">
                {allObjectives.filter((obj) => obj.rewarded).length}
              </div>
              <div className="text-sm text-gray-700">Completed</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-yellow-500">
                {
                  allObjectives.filter((obj) => obj.completed && !obj.rewarded)
                    .length
                }
              </div>
              <div className="text-sm text-gray-700">Ready to Collect</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-500">
                {allObjectives.filter((obj) => !obj.completed).length}
              </div>
              <div className="text-sm text-gray-700">In Progress</div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
