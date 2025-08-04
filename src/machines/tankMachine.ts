import { createMachine, assign } from 'xstate';

export type TankEvent =
  | { type: 'CLEAN' }
  | { type: 'FEED_FISH' }
  | { type: 'ADD_FISH'; fishId: string }
  | { type: 'REMOVE_FISH'; fishId: string }
  | { type: 'DETERIORATE' }
  | { type: 'MAINTENANCE' }
  | { type: 'EMERGENCY' };

export type TankContext = {
  waterQuality: number;
  temperature: number;
  maintenanceLevel: number;
  capacity: number;
  currentFishCount: number;
  lastCleaned: number;
  lastFed: number;
};

export const tankMachine = createMachine({
  id: 'tank',
  initial: 'normal',
  context: {
    waterQuality: 1,
    temperature: 25,
    maintenanceLevel: 1,
    capacity: 10,
    currentFishCount: 0,
    lastCleaned: Date.now(),
    lastFed: Date.now(),
  } as TankContext,
  states: {
    normal: {
      on: {
        CLEAN: {
          target: 'cleaning',
          actions: assign({
            waterQuality: 1,
            lastCleaned: () => Date.now(),
          }),
        },
        FEED_FISH: {
          actions: assign({
            lastFed: () => Date.now(),
          }),
        },
        ADD_FISH: {
          actions: assign({
            currentFishCount: (context) => 
              Math.min(context.currentFishCount + 1, context.capacity),
          }),
          cond: 'hasCapacity',
        },
        REMOVE_FISH: {
          actions: assign({
            currentFishCount: (context) => 
              Math.max(context.currentFishCount - 1, 0),
          }),
        },
        DETERIORATE: [
          {
            target: 'dirty',
            cond: 'isDirty',
          },
          {
            actions: assign({
              waterQuality: (context) => Math.max(context.waterQuality - 0.01, 0),
            }),
          },
        ],
      },
      invoke: {
        id: 'tankMonitor',
        src: 'monitorTankService',
      },
    },
    cleaning: {
      entry: 'startCleaning',
      after: {
        3000: {
          target: 'normal',
          actions: 'finishCleaning',
        },
      },
    },
    dirty: {
      entry: assign({
        maintenanceLevel: (context) => Math.max(context.maintenanceLevel - 0.1, 0),
      }),
      on: {
        CLEAN: {
          target: 'cleaning',
          actions: assign({
            waterQuality: 0.8,
            maintenanceLevel: 0.9,
          }),
        },
        DETERIORATE: [
          {
            target: 'critical',
            cond: 'isCritical',
          },
          {
            actions: assign({
              waterQuality: (context) => Math.max(context.waterQuality - 0.02, 0),
            }),
          },
        ],
      },
    },
    critical: {
      entry: [
        'alertCriticalState',
        assign({
          maintenanceLevel: 0.2,
        }),
      ],
      on: {
        EMERGENCY: {
          target: 'maintenance',
        },
        DETERIORATE: {
          actions: assign({
            waterQuality: (context) => Math.max(context.waterQuality - 0.05, 0),
          }),
        },
      },
    },
    maintenance: {
      entry: 'startMaintenance',
      after: {
        10000: {
          target: 'normal',
          actions: assign({
            waterQuality: 1,
            maintenanceLevel: 1,
            lastCleaned: () => Date.now(),
          }),
        },
      },
    },
  },
},
{
  guards: {
    hasCapacity: (context) => context.currentFishCount < context.capacity,
    isDirty: (context) => context.waterQuality < 0.6,
    isCritical: (context) => context.waterQuality < 0.3,
  },
});