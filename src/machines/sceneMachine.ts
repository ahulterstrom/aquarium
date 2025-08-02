import { setup } from "xstate";

type SceneMachineContext = object;

export const sceneMachine = setup({
  types: {
    context: {} as SceneMachineContext,
    events: {} as
      | { type: "GO_TO_CHARACTER_SELECTION" }
      | { type: "BACK" }
      | { type: "GO_TO_MAP" }
      | { type: "GO_TO_BATTLE" }
      | { type: "GO_TO_BATTLE_RESULTS" },
  },
  actions: {},
}).createMachine({
  id: "game",
  initial: "mainMenu",
  context: {},
  states: {
    mainMenu: {
      on: {
        GO_TO_CHARACTER_SELECTION: "characterSelection",
      },
    },
    characterSelection: {
      on: {
        BACK: "mainMenu",
        GO_TO_MAP: "map",
      },
    },
    map: {
      on: {
        GO_TO_BATTLE: "battle",
      },
    },
    battle: {
      on: {
        GO_TO_BATTLE_RESULTS: "battleResults",
      },
    },
    battleResults: {
      on: {
        GO_TO_MAP: "map",
      },
    },
  },
});
