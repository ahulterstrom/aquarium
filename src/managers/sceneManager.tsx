import React from "react";
import { useMachine, useSelector } from "@xstate/react";
import { useTransition, animated } from "@react-spring/three";
import { useSceneMachine } from "@/contexts/scene/useScene";
import { MainMenuScene } from "@/scenes/mainMenuScene";
import { CharacterSelectScene } from "@/scenes/characterSelectScene";
import { MapScene } from "@/scenes/mapScene";

const sceneMap: Record<string, React.FC> = {
  mainMenu: MainMenuScene,
  characterSelection: CharacterSelectScene,
  map: MapScene,
  battle: MainMenuScene,
  battleResults: MainMenuScene,
};

export const SceneManager: React.FC = () => {
  const actorRef = useSceneMachine();
  const state = useSelector(actorRef, (state) => state);

  const transitions = useTransition(state.value, {
    exitBeforeEnter: true,
  });

  return (
    <>
      {transitions((style, item) => {
        const SceneComponent = sceneMap[item as string];
        return (
          <animated.group>
            <SceneComponent />
          </animated.group>
        );
      })}
    </>
  );
};
