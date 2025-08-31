import { setup } from "xstate";

type SceneMachineContext = object;

export const sceneMachine = setup({
  types: {
    context: {} as SceneMachineContext,
    events: {} as { type: "GO_TO_SANDBOX" } | { type: "BACK" },
  },
  actions: {},
}).createMachine({
  id: "game",
  initial: "mainMenu",
  context: {},
  states: {
    mainMenu: {
      on: {
        GO_TO_SANDBOX: "sandbox",
      },
    },
    sandbox: {
      on: {
        BACK: "mainMenu",
      },
    },
  },
});
