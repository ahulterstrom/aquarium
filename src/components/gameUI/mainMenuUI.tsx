import { Button } from "@/components/ui/button";
import { useMenu } from "@/contexts/menu/useMenu";
import { useSceneMachine } from "@/contexts/scene/useScene";
import { Play, Settings, BarChart3, Users } from "lucide-react";

export const MainMenuUI = () => {
  const { openMenu } = useMenu();
  const sceneMachineRef = useSceneMachine();

  const handleStartSandbox = () => {
    sceneMachineRef.send({
      type: "GO_TO_SANDBOX",
    });
  };

  return (
    <div className="pointer-events-none flex size-full flex-col items-center justify-end gap-16 py-16">
      <div className="glass flex flex-row items-center justify-center gap-4 px-4 py-2">
        <Button
          variant="onGlass"
          className="pointer-events-auto flex size-20 flex-col items-center justify-center gap-1"
          onClick={handleStartSandbox}
        >
          <Play className="size-6" />
          <span className="text-xs">Start</span>
        </Button>
        <Button
          variant="onGlass"
          className="pointer-events-auto flex size-20 flex-col items-center justify-center gap-1"
          onClick={() => openMenu("settings")}
        >
          <Settings className="size-6" />
          <span className="text-xs">Options</span>
        </Button>
        <Button
          variant="onGlass"
          className="pointer-events-auto flex size-20 flex-col items-center justify-center gap-1"
          onClick={() => openMenu("stats")}
        >
          <BarChart3 className="size-6" />
          <span className="text-xs">Stats</span>
        </Button>
        <Button
          variant="onGlass"
          className="pointer-events-auto flex size-20 flex-col items-center justify-center gap-1"
          onClick={() => openMenu("credits")}
        >
          <Users className="size-6" />
          <span className="text-xs">Credits</span>
        </Button>
      </div>
    </div>
  );
};
