import { getVisitorSystem } from "@/components/systems/visitorSystem";
import { useGameStore } from "@/stores/gameStore";
import { Users } from "lucide-react";

export const VisitorCountDisplay = () => {
  const visitorCount = useGameStore.use.visitorCount();

  return (
    <span className="flex items-center gap-1 text-sm font-medium">
      <Users className="size-4" /> {visitorCount}
    </span>
  );
};
