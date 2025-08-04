import { createMachine, assign } from 'xstate';

export type GameEvent =
  | { type: 'START' }
  | { type: 'PAUSE' }
  | { type: 'RESUME' }
  | { type: 'END_DAY' }
  | { type: 'GAME_OVER' }
  | { type: 'RESTART' };

export type GameContext = {
  isPaused: boolean;
  timeOfDay: number; // 0-24
  dayDuration: number; // in seconds
};

export const gameMachine = createMachine({
  id: 'game',
  initial: 'menu',
  context: {
    isPaused: false,
    timeOfDay: 8, // Start at 8 AM
    dayDuration: 300, // 5 minutes per day
  } as GameContext,
  states: {
    menu: {
      on: {
        START: {
          target: 'playing',
          actions: assign({
            isPaused: false,
            timeOfDay: 8,
          }),
        },
      },
    },
    playing: {
      initial: 'running',
      states: {
        running: {
          on: {
            PAUSE: {
              target: 'paused',
              actions: assign({ isPaused: true }),
            },
            END_DAY: {
              target: 'dayEnd',
            },
          },
          invoke: {
            id: 'gameLoop',
            src: 'gameLoopService',
          },
        },
        paused: {
          on: {
            RESUME: {
              target: 'running',
              actions: assign({ isPaused: false }),
            },
          },
        },
        dayEnd: {
          entry: 'processDayEnd',
          after: {
            2000: {
              target: 'running',
              actions: assign({ timeOfDay: 8 }),
            },
          },
        },
      },
      on: {
        GAME_OVER: 'gameOver',
      },
    },
    gameOver: {
      entry: 'showGameOverScreen',
      on: {
        RESTART: {
          target: 'menu',
          actions: 'resetGame',
        },
      },
    },
  },
});