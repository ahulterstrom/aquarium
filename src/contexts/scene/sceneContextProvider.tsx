import { SceneMachineContext } from "@/contexts/scene/sceneContext";
import { sceneMachine } from "@/machines/sceneMachine";
import { useActorRef } from "@xstate/react";
import React from "react";

export const SceneProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const actorRef = useActorRef(sceneMachine);

  return (
    <SceneMachineContext.Provider value={actorRef}>
      {children}
    </SceneMachineContext.Provider>
  );
};
