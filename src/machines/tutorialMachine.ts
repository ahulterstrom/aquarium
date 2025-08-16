import { createMachine, assign } from "xstate";

export type TutorialEvent =
  | { type: "START" }
  | { type: "NEXT" }
  | { type: "PREVIOUS" }
  | { type: "SKIP" }
  | { type: "COMPLETE_STEP" };

export type TutorialContext = {
  currentStep: number;
  totalSteps: number;
  completedSteps: string[];
};

export const tutorialSteps = [
  {
    id: "welcome",
    title: "Welcome to Aquatopia!",
    description: "Build and manage your own aquarium empire.",
    target: null,
  },
  {
    id: "place_tank",
    title: "Place Your First Tank",
    description: "Click the tank button and place it on the grid.",
    target: "shop_button",
  },
  {
    id: "buy_fish",
    title: "Buy Your First Fish",
    description: "Select a tank and add fish from the shop.",
    target: "tank",
  },
  {
    id: "attract_visitors",
    title: "Attract Visitors",
    description: "Visitors will come to see your fish. Keep them happy!",
    target: "entrance",
  },
  {
    id: "manage_economy",
    title: "Manage Your Finances",
    description: "Balance income and expenses to grow your aquarium.",
    target: "stats_panel",
  },
];

export const tutorialMachine = createMachine(
  {
    id: "tutorial",
    initial: "inactive",
    context: {
      currentStep: 0,
      totalSteps: tutorialSteps.length,
      completedSteps: [],
    } as TutorialContext,
    states: {
      inactive: {
        on: {
          START: "active",
        },
      },
      active: {
        initial: "showingStep",
        states: {
          showingStep: {
            entry: "highlightTarget",
            on: {
              NEXT: {
                actions: assign({
                  currentStep: (context) =>
                    Math.min(context.currentStep + 1, context.totalSteps - 1),
                }),
              },
              PREVIOUS: {
                actions: assign({
                  currentStep: (context) =>
                    Math.max(context.currentStep - 1, 0),
                }),
              },
              COMPLETE_STEP: {
                actions: assign({
                  completedSteps: (context) => [
                    ...context.completedSteps,
                    tutorialSteps[context.currentStep].id,
                  ],
                }),
              },
            },
          },
        },
        on: {
          SKIP: "completed",
        },
        always: {
          target: "completed",
          cond: "allStepsCompleted",
        },
      },
      completed: {
        entry: "saveTutorialComplete",
        type: "final",
      },
    },
  },
  {
    guards: {
      allStepsCompleted: (context) =>
        context.completedSteps.length >= context.totalSteps,
    },
  },
);
