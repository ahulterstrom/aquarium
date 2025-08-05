import { animated, useTransition } from "@react-spring/web";
import { ReactNode, useEffect } from "react";

import { GameOverlay } from "@/components/gameUI/gameOverlay";
import { useSceneMachine } from "@/contexts/scene/useScene";
import { cn } from "@/lib/utils";
import { sceneMachine } from "@/machines/sceneMachine";
import { useSelector } from "@xstate/react";
import { SnapshotFrom } from "xstate";
import { MainMenuUI } from "@/components/gameUI/mainMenuUI";
import { CharacterSelectUI } from "@/components/gameUI/characterSelectUI";
import { MapUI } from "@/components/gameUI/mapUI";
import { SandboxUI } from "@/components/gameUI/sandboxUI";

const uis: Record<SnapshotFrom<typeof sceneMachine>["value"], ReactNode> = {
  mainMenu: <MainMenuUI />,
  characterSelection: <CharacterSelectUI />,
  map: <div>Map</div>,
  battle: <div>Battle</div>,
  battleResults: <div>Battle Results</div>,
  sandbox: <SandboxUI />,
};

export const UIManager = () => {
  const actorRef = useSceneMachine();
  const state = useSelector(actorRef, (state) => state);

  const transitions = useTransition(state.value, {
    from: () => ({
      opacity: 0,
      transform: "scale(0.9) translateY(100px)",
      zIndex: 30,
    }),
    enter: {
      opacity: 1,
      transform: "scale(1) translateY(0)",
      zIndex: 35,
      delay: 50,
    },
    leave: () => ({
      opacity: 0,
      transform: "scale(1) translateY(0)",
      zIndex: 25,
    }),
    config: (_, __, phase) => ({
      tension: phase === "leave" ? 400 : 300,
      friction: phase === "leave" ? 30 : 30,
    }),
  });

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <GameOverlay />
      {transitions((style, sceneKey) =>
        sceneKey ? (
          <animated.div
            style={style}
            className={cn(
              "pointer-events-none absolute inset-0 flex items-center justify-center",
            )}
          >
            {uis[sceneKey]}
          </animated.div>
        ) : null,
      )}
    </div>
  );
};
