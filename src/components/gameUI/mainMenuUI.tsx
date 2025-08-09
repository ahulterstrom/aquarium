import { useMenu } from "@/contexts/menu/useMenu";
import { useSceneMachine } from "@/contexts/scene/useScene";

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
      <div className="flex flex-row items-center justify-center gap-4">
        <button
          className="pointer-events-auto min-w-32 rounded-md bg-gradient-to-r from-purple-600 to-pink-500 px-8 py-4 text-lg font-bold whitespace-nowrap text-white shadow-lg shadow-purple-500/20 transition-all hover:translate-y-[-2px] hover:shadow-purple-500/40"
          onClick={handleStartSandbox}
        >
          Start
        </button>
        <button
          className="pointer-events-auto min-w-32 rounded-md border border-purple-500/30 bg-black/50 px-8 py-4 text-lg font-bold whitespace-nowrap text-purple-400 backdrop-blur-sm transition-all hover:bg-purple-500/10 hover:text-purple-300"
          onClick={() => openMenu("settings")}
        >
          Options
        </button>
        <button
          className="pointer-events-auto min-w-32 rounded-md border border-purple-500/30 bg-black/50 px-8 py-4 text-lg font-bold whitespace-nowrap text-purple-400 backdrop-blur-sm transition-all hover:bg-purple-500/10 hover:text-purple-300"
          onClick={() => openMenu("stats")}
        >
          Stats
        </button>
        <button
          className="pointer-events-auto min-w-32 rounded-md border border-purple-500/30 bg-black/50 px-8 py-4 text-lg font-bold whitespace-nowrap text-purple-400 backdrop-blur-sm transition-all hover:bg-purple-500/10 hover:text-purple-300"
          onClick={() => openMenu("credits")}
        >
          Credits
        </button>
      </div>
    </div>
  );
};
