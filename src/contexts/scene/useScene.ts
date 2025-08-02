import { SceneMachineContext } from "@/contexts/scene/sceneContext";
import { useContext } from "react";

export const useSceneMachine = () => {
  const context = useContext(SceneMachineContext);
  if (!context) {
    throw new Error(
      "useSceneMachine must be used within a SceneMachineProvider",
    );
  }
  return context;
};
