import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { useMenu } from "@/contexts/menu/useMenu";
import { useSceneMachine } from "@/contexts/scene/useScene";
import { ArrowLeft } from "lucide-react";

const BorderShower = ({ children }: { children?: React.ReactNode }) => {
  return (
    <div className="size-full rounded-md border-2 border-purple-500">
      {children}
    </div>
  );
};

export const CharacterSelectUI = () => {
  const { openMenu } = useMenu();
  const sceneMachineRef = useSceneMachine();

  const handleStartGame = async () => {
    sceneMachineRef.send({
      type: "GO_TO_MAP",
    });
  };

  return (
    <div className="relative flex size-full">
      <button
        className="pointer-events-auto absolute top-4 left-4 rounded-md border border-purple-500/30 bg-black/50 px-4 py-2 text-lg font-bold text-purple-400 backdrop-blur-sm transition-all hover:bg-purple-500/10 hover:text-purple-300"
        onClick={() => sceneMachineRef.send({ type: "BACK" })}
      >
        <ArrowLeft />
      </button>
      <div className="grid size-full grid-cols-4 grid-rows-5 gap-4 p-4">
        {/* <!-- div1: row 1, spans all 4 cols --> */}
        <div className="col-span-4 col-start-1 row-start-1 flex items-center justify-center">
          <div className="text-6xl font-bold text-purple-700">
            Astral Knight
          </div>
        </div>

        {/* <!-- div2: row 2, cols 3–4 --> */}
        <div className="pointer-events-auto col-span-2 col-start-3 row-start-2 flex">
          <BorderShower>
            <div className="flex size-full gap-2 overflow-x-auto p-2">
              {Array.from({ length: 20 }).map((_, index) => (
                <div key={index} className="aspect-[1024/1536]">
                  <img
                    src={"/exampleCard.webp"}
                    className="size-full rounded-sm bg-purple-900/30"
                  ></img>
                </div>
              ))}
            </div>
          </BorderShower>
        </div>

        {/* <!-- div5: rows 3–4, col 3 --> */}
        <div className="col-span-1 col-start-3 row-span-2 row-start-3">
          <BorderShower>
            <div className="flex size-full flex-col items-center justify-center gap-2 rounded-sm bg-slate-800 p-2">
              <div className="text-lg font-bold text-purple-200">
                Twisted Spoon
              </div>
              <img src="/exampleRelic.webp" className="size-[50%]"></img>
              <div className="px-2 text-center text-sm text-purple-200/80">
                Psychic type cards deal{" "}
                <span className="font-medium text-yellow-300">2x damage</span>
              </div>
            </div>
          </BorderShower>
        </div>

        {/* <!-- div6: rows 3–4, col 4 --> */}
        <div className="col-span-1 col-start-4 row-span-2 row-start-3">
          <BorderShower>
            <div className="flex size-full items-center justify-center rounded-sm bg-slate-800 px-6 text-center italic">
              <p className="relative mx-2 px-2 text-purple-200/90">
                <span className="absolute -top-2 -left-2 text-2xl text-purple-400">
                  "
                </span>
                Blade and mind in near perfect harmony – where the steel
                strikes, the psyche shatters.
                <span className="absolute -right-1 -bottom-1 text-2xl text-purple-400">
                  "
                </span>
              </p>
            </div>
          </BorderShower>
        </div>

        {/* <!-- div3: row 5, cols 3–4 --> */}
        <div className="col-span-1 col-start-4 row-start-5">
          <button
            className="pointer-events-auto w-full rounded-md bg-gradient-to-r from-purple-600 to-pink-500 px-8 py-4 text-lg font-bold whitespace-nowrap text-white shadow-lg shadow-purple-500/20 transition-all hover:translate-y-[-2px] hover:shadow-purple-500/40"
            onClick={handleStartGame}
          >
            Start
          </button>
        </div>

        {/* <!-- div4: rows 2–4, cols 1–2 --> */}
        <div className="col-span-2 col-start-1 row-span-3 row-start-2">
          <BorderShower></BorderShower>
        </div>
      </div>
    </div>
  );
};
