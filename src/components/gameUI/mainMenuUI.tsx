import { useMenu } from "@/contexts/menu/useMenu";
import { useSceneMachine } from "@/contexts/scene/useScene";

export const MainMenuUI = () => {
  const { openMenu } = useMenu();
  const sceneMachineRef = useSceneMachine();

  const handleStartGame = () => {
    sceneMachineRef.send({
      type: "GO_TO_CHARACTER_SELECTION",
    });
  };

  const handleStartSandbox = () => {
    sceneMachineRef.send({
      type: "GO_TO_SANDBOX",
    });
  };

  return (
    <div className="pointer-events-auto flex size-full flex-col items-center gap-16 py-16">
      <div className="flex h-2/3 flex-1 items-center justify-center">
        <img
          src="/titleLogo.webp"
          alt="Title Logo"
          className="mx-auto max-h-full max-w-full object-contain"
          draggable="false"
        />
      </div>
      <div className="flex flex-row items-center justify-center gap-4">
        <button
          className="min-w-32 rounded-md bg-gradient-to-r from-purple-600 to-pink-500 px-8 py-4 text-lg font-bold whitespace-nowrap text-white shadow-lg shadow-purple-500/20 transition-all hover:translate-y-[-2px] hover:shadow-purple-500/40"
          onClick={handleStartGame}
        >
          Start Game
        </button>
        <button
          className="min-w-32 rounded-md border border-purple-500/30 bg-black/50 px-8 py-4 text-lg font-bold whitespace-nowrap text-purple-400 backdrop-blur-sm transition-all hover:bg-purple-500/10 hover:text-purple-300"
          onClick={handleStartSandbox}
        >
          Sandbox
        </button>
        <button
          className="min-w-32 rounded-md border border-purple-500/30 bg-black/50 px-8 py-4 text-lg font-bold whitespace-nowrap text-purple-400 backdrop-blur-sm transition-all hover:bg-purple-500/10 hover:text-purple-300"
          onClick={() => openMenu("settings")}
        >
          Options
        </button>
        <button
          className="min-w-32 rounded-md border border-purple-500/30 bg-black/50 px-8 py-4 text-lg font-bold whitespace-nowrap text-purple-400 backdrop-blur-sm transition-all hover:bg-purple-500/10 hover:text-purple-300"
          onClick={() => openMenu("stats")}
        >
          Stats
        </button>
        <button
          className="min-w-32 rounded-md border border-purple-500/30 bg-black/50 px-8 py-4 text-lg font-bold whitespace-nowrap text-purple-400 backdrop-blur-sm transition-all hover:bg-purple-500/10 hover:text-purple-300"
          onClick={() => openMenu("credits")}
        >
          Credits
        </button>
      </div>
    </div>
  );
};
