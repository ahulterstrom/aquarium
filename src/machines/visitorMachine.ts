import { createMachine, assign } from 'xstate';

export type VisitorEvent =
  | { type: 'ENTER' }
  | { type: 'FIND_TANK' }
  | { type: 'VIEW_TANK'; tankId: string }
  | { type: 'LEAVE_TANK' }
  | { type: 'BUY_TICKET' }
  | { type: 'BUY_FOOD' }
  | { type: 'LEAVE' }
  | { type: 'GET_BORED' };

export type VisitorContext = {
  patience: number;
  happiness: number;
  moneySpent: number;
  targetTankId: string | null;
  viewedTanks: string[];
  hasTicket: boolean;
};

export const visitorMachine = createMachine({
  id: 'visitor',
  initial: 'entering',
  context: {
    patience: 1,
    happiness: 0.5,
    moneySpent: 0,
    targetTankId: null,
    viewedTanks: [],
    hasTicket: false,
  } as VisitorContext,
  states: {
    entering: {
      on: {
        BUY_TICKET: {
          target: 'exploring',
          actions: [
            assign({
              hasTicket: true,
              moneySpent: (context, event) => context.moneySpent + 10,
            }),
            'chargeTicketPrice',
          ],
        },
      },
    },
    exploring: {
      entry: 'startExploring',
      on: {
        FIND_TANK: {
          target: 'walkingToTank',
          actions: assign({
            targetTankId: (context, event) => event.tankId,
          }),
        },
        LEAVE: 'leaving',
        GET_BORED: {
          target: 'leaving',
          cond: 'isBored',
        },
      },
      invoke: {
        id: 'findTankService',
        src: 'findTankService',
      },
    },
    walkingToTank: {
      entry: 'startWalking',
      on: {
        VIEW_TANK: {
          target: 'viewingTank',
          actions: assign({
            viewedTanks: (context) => 
              context.targetTankId 
                ? [...context.viewedTanks, context.targetTankId]
                : context.viewedTanks,
          }),
        },
      },
    },
    viewingTank: {
      entry: [
        'startViewing',
        assign({
          happiness: (context) => Math.min(context.happiness + 0.2, 1),
        }),
      ],
      after: {
        10000: 'deciding',
      },
      on: {
        LEAVE_TANK: 'deciding',
      },
    },
    deciding: {
      entry: assign({
        patience: (context) => Math.max(context.patience - 0.1, 0),
      }),
      always: [
        {
          target: 'shopping',
          cond: 'wantsToShop',
        },
        {
          target: 'exploring',
          cond: 'wantsToExplore',
        },
        {
          target: 'leaving',
        },
      ],
    },
    shopping: {
      on: {
        BUY_FOOD: {
          target: 'exploring',
          actions: [
            assign({
              moneySpent: (context) => context.moneySpent + 5,
              happiness: (context) => Math.min(context.happiness + 0.1, 1),
            }),
            'chargeFoodPrice',
          ],
        },
        LEAVE: 'exploring',
      },
      after: {
        5000: 'exploring',
      },
    },
    leaving: {
      entry: 'handleLeaving',
      type: 'final',
    },
  },
},
{
  guards: {
    isBored: (context) => context.patience <= 0 || context.happiness < 0.2,
    wantsToShop: (context) => context.happiness > 0.7 && Math.random() > 0.5,
    wantsToExplore: (context) => context.patience > 0.3 && context.viewedTanks.length < 3,
  },
});