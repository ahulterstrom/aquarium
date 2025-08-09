import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Circle, Lock, Trophy, Gift } from "lucide-react";
import { Objective, ObjectiveType } from "@/types/game.types";
import { cn } from "@/lib/utils";

// Define the full objective progression for preview
const OBJECTIVE_PREVIEW: Record<ObjectiveType, { title: string; description: string; moneyReward: number; prerequisites?: ObjectiveType[] }> = {
  place_entrance: {
    title: "Welcome to Aquarium Tycoon!",
    description: "Place your aquarium entrance",
    moneyReward: 10,
    prerequisites: [],
  },
  build_first_tank: {
    title: "Build Your First Tank",
    description: "Place a tank to house your fish",
    moneyReward: 15,
    prerequisites: ["place_entrance"],
  },
  buy_fish: {
    title: "Stock Your Aquarium",
    description: "Buy 2 fish for your tanks",
    moneyReward: 20,
    prerequisites: ["build_first_tank"],
  },
  earn_money: {
    title: "First Profits",
    description: "Earn a total of $50",
    moneyReward: 25,
    prerequisites: ["buy_fish"],
  },
  attract_visitors: {
    title: "Growing Popularity",
    description: "Attract 10 visitors to your aquarium",
    moneyReward: 30,
    prerequisites: ["buy_fish"],
  },
  satisfy_visitors: {
    title: "Happy Customers",
    description: "Have 5 visitors leave satisfied",
    moneyReward: 35,
    prerequisites: ["attract_visitors"],
  },
  build_multiple_tanks: {
    title: "Expanding the Aquarium",
    description: "Build a total of 3 tanks",
    moneyReward: 40,
    prerequisites: ["earn_money"],
  },
  expand_aquarium: {
    title: "More Space",
    description: "Expand your aquarium with 5 new tiles",
    moneyReward: 50,
    prerequisites: ["build_multiple_tanks"],
  },
};

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

interface AllObjectivesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  allObjectives: Objective[];
  onCollectReward: (objectiveId: string) => void;
}

export const AllObjectivesModal = ({ 
  open, 
  onOpenChange, 
  allObjectives,
  onCollectReward 
}: AllObjectivesModalProps) => {
  // Create a map of actual objectives by type for easy lookup
  const objectiveMap = new Map<ObjectiveType, Objective>();
  allObjectives.forEach(obj => objectiveMap.set(obj.type, obj));

  // Determine objective states
  const getObjectiveState = (type: ObjectiveType) => {
    const objective = objectiveMap.get(type);
    if (objective) {
      if (objective.rewarded) return "completed";
      if (objective.completed) return "ready_to_collect";
      return "active";
    }

    // Check if prerequisites are met for locked objectives
    const preview = OBJECTIVE_PREVIEW[type];
    if (preview.prerequisites && preview.prerequisites.length > 0) {
      const prereqsMet = preview.prerequisites.every(prereq => {
        const prereqObj = objectiveMap.get(prereq);
        return prereqObj && prereqObj.completed;
      });
      return prereqsMet ? "available" : "locked";
    }
    
    return "available";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] max-w-4xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Trophy className="h-6 w-6 text-yellow-500" />
            All Objectives
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="text-sm text-gray-600">
            Track your progress through all aquarium objectives. Complete objectives to unlock new challenges!
          </div>

          <div className="space-y-3">
            {OBJECTIVE_ORDER.map((type, index) => {
              const preview = OBJECTIVE_PREVIEW[type];
              const objective = objectiveMap.get(type);
              const state = getObjectiveState(type);
              
              return (
                <div
                  key={type}
                  className={cn(
                    "rounded-lg border p-4 transition-all duration-300",
                    state === "completed" && "border-green-500/50 bg-green-500/5",
                    state === "ready_to_collect" && "border-green-500/50 bg-green-500/10",
                    state === "active" && "border-blue-500/50 bg-blue-500/5",
                    state === "available" && "border-white/20 bg-white/5",
                    state === "locked" && "border-gray-500/30 bg-gray-500/5 opacity-60"
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-700 text-white text-sm font-bold flex-shrink-0 mt-1">
                        {index + 1}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {state === "completed" && (
                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                          )}
                          {state === "ready_to_collect" && (
                            <CheckCircle2 className="h-5 w-5 text-green-500 animate-pulse" />
                          )}
                          {(state === "active" || state === "available") && (
                            <Circle className="h-5 w-5 text-blue-400" />
                          )}
                          {state === "locked" && (
                            <Lock className="h-5 w-5 text-gray-400" />
                          )}
                          
                          <h3 className={cn(
                            "font-semibold",
                            state === "completed" && "text-green-200",
                            state === "ready_to_collect" && "text-green-200",
                            state === "active" && "text-blue-200",
                            (state === "available" || state === "locked") && "text-gray-300"
                          )}>
                            {preview.title}
                          </h3>
                        </div>

                        <p className={cn(
                          "text-sm mb-2",
                          state === "completed" && "text-green-300",
                          state === "ready_to_collect" && "text-green-300",
                          state === "active" && "text-blue-300", 
                          (state === "available" || state === "locked") && "text-gray-400"
                        )}>
                          {preview.description}
                        </p>

                        {/* Progress bar for active objectives */}
                        {objective && state === "active" && (
                          <div className="mb-2">
                            <div className="flex items-center justify-between text-xs mb-1">
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

                        {/* Prerequisites for locked objectives */}
                        {state === "locked" && preview.prerequisites && (
                          <div className="text-xs text-gray-500">
                            <span>Requires: </span>
                            {preview.prerequisites.map(prereq => OBJECTIVE_PREVIEW[prereq].title).join(", ")}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="ml-4 flex items-center gap-2 flex-shrink-0">
                      <div className="text-sm font-medium text-green-400">
                        +${preview.moneyReward}
                      </div>
                      
                      {state === "ready_to_collect" && objective && (
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => onCollectReward(objective.id)}
                        >
                          <Gift className="mr-1 h-3 w-3" />
                          Collect
                        </Button>
                      )}

                      {state === "completed" && (
                        <div className="flex items-center gap-1 text-green-500 text-sm">
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

          {/* Summary Stats */}
          <div className="border-t pt-4 mt-6">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-green-500">
                  {allObjectives.filter(obj => obj.rewarded).length}
                </div>
                <div className="text-sm text-gray-600">Completed</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-500">
                  {allObjectives.filter(obj => obj.completed && !obj.rewarded).length}
                </div>
                <div className="text-sm text-gray-600">Ready to Collect</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-500">
                  {allObjectives.filter(obj => !obj.completed).length}
                </div>
                <div className="text-sm text-gray-600">In Progress</div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};