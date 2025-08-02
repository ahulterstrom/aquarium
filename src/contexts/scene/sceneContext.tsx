import { createContext, useContext } from "react";
import { ActorRefFrom } from "xstate";
import { sceneMachine } from "@/machines/sceneMachine";

export const SceneMachineContext = createContext<ActorRefFrom<
  typeof sceneMachine
> | null>(null);
