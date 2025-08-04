import { createMachine, assign } from 'xstate';

export type FishEvent =
  | { type: 'SWIM' }
  | { type: 'FEED' }
  | { type: 'STARVE' }
  | { type: 'INTERACT' }
  | { type: 'SLEEP' }
  | { type: 'WAKE' }
  | { type: 'DIE' };

export type FishContext = {
  hunger: number;
  happiness: number;
  health: number;
  energy: number;
  isSchooling: boolean;
};

export const fishMachine = createMachine({
  id: 'fish',
  initial: 'swimming',
  context: {
    hunger: 0.5,
    happiness: 0.8,
    health: 1,
    energy: 1,
    isSchooling: false,
  } as FishContext,
  states: {
    swimming: {
      entry: 'startSwimming',
      on: {
        FEED: {
          target: 'eating',
          actions: assign({
            hunger: 0,
            happiness: (context) => Math.min(context.happiness + 0.2, 1),
          }),
        },
        INTERACT: {
          actions: assign({
            happiness: (context) => Math.min(context.happiness + 0.1, 1),
          }),
        },
        SLEEP: {
          target: 'sleeping',
          cond: 'isNightTime',
        },
        STARVE: {
          target: 'starving',
          cond: 'isStarving',
        },
      },
      invoke: {
        id: 'swimBehavior',
        src: 'swimService',
      },
    },
    eating: {
      entry: 'startEating',
      after: {
        2000: 'swimming',
      },
    },
    sleeping: {
      entry: assign({ energy: 1 }),
      on: {
        WAKE: 'swimming',
      },
    },
    starving: {
      entry: assign({
        health: (context) => Math.max(context.health - 0.1, 0),
        happiness: (context) => Math.max(context.happiness - 0.2, 0),
      }),
      on: {
        FEED: {
          target: 'eating',
          actions: assign({
            hunger: 0,
            health: (context) => Math.min(context.health + 0.1, 1),
          }),
        },
        DIE: {
          target: 'dead',
          cond: 'isDying',
        },
      },
      after: {
        10000: [
          {
            target: 'dead',
            cond: 'isDying',
          },
          {
            target: 'swimming',
          },
        ],
      },
    },
    dead: {
      type: 'final',
      entry: 'handleDeath',
    },
  },
},
{
  guards: {
    isNightTime: (context, event, { state }) => {
      // Check if it's night time (after 8 PM)
      return false; // Placeholder
    },
    isStarving: (context) => context.hunger > 0.8,
    isDying: (context) => context.health <= 0,
  },
});