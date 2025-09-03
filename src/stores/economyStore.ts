import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { Revenue, Expense } from "../types/game.types";
import { createSelectors } from "./utils";

interface EconomyStore {
  dailyRevenue: Revenue;
  dailyExpense: Expense;
  ticketPrice: number;

  // Revenue tracking
  addTicketRevenue: (amount: number) => void;
  addGiftShopRevenue: (amount: number) => void;
  addConcessionRevenue: (amount: number) => void;

  // Visitor and tank metrics
  visitorMetrics: {
    totalVisitorsToday: number;
    averageSpendingPerVisitor: number;
    revenuePerVisitor: number;
  };
  tankMetrics: {
    totalTanks: number;
    revenuePerTank: number;
    averageFishPerTank: number;
  };

  // Visitor tracking
  recordVisitorEntry: () => void;
  updateVisitorSpending: (amount: number) => void;

  // Tank tracking
  updateTankCount: (count: number) => void;
  updateFishCount: (totalFish: number, tankCount: number) => void;

  // Expense tracking
  addFishFoodExpense: (amount: number) => void;
  addMaintenanceExpense: (amount: number) => void;
  addStaffExpense: (amount: number) => void;
  addUtilitiesExpense: (amount: number) => void;

  // Price management
  setTicketPrice: (price: number) => void;

  // Daily operations
  calculateDailyProfit: () => number;
  resetDaily: () => void;

  // Analytics
  getRevenueBreakdown: () => { label: string; value: number }[];
  getExpenseBreakdown: () => { label: string; value: number }[];

  // Reset
  reset: () => void;
}

const createEmptyRevenue = (): Revenue => ({
  ticketSales: 0,
  giftShop: 0,
  concessions: 0,
  total: 0,
});

const createEmptyExpense = (): Expense => ({
  fishFood: 0,
  maintenance: 0,
  staff: 0,
  utilities: 0,
  total: 0,
});

export const useEconomyStore = createSelectors(
  create<EconomyStore>()(
    devtools(
      persist(
        (set, get, store) => ({
          dailyRevenue: createEmptyRevenue(),
          dailyExpense: createEmptyExpense(),
          ticketPrice: 10,

          visitorMetrics: {
            totalVisitorsToday: 0,
            averageSpendingPerVisitor: 0,
            revenuePerVisitor: 0,
          },
          tankMetrics: {
            totalTanks: 0,
            revenuePerTank: 0,
            averageFishPerTank: 0,
          },

          addTicketRevenue: (amount) =>
            set((state) => {
              const ticketSales = state.dailyRevenue.ticketSales + amount;
              const total =
                ticketSales +
                state.dailyRevenue.giftShop +
                state.dailyRevenue.concessions;
              return {
                dailyRevenue: {
                  ...state.dailyRevenue,
                  ticketSales,
                  total,
                },
              };
            }),

          addGiftShopRevenue: (amount) =>
            set((state) => {
              const giftShop = state.dailyRevenue.giftShop + amount;
              const total =
                state.dailyRevenue.ticketSales +
                giftShop +
                state.dailyRevenue.concessions;
              return {
                dailyRevenue: {
                  ...state.dailyRevenue,
                  giftShop,
                  total,
                },
              };
            }),

          addConcessionRevenue: (amount) =>
            set((state) => {
              const concessions = state.dailyRevenue.concessions + amount;
              const total =
                state.dailyRevenue.ticketSales +
                state.dailyRevenue.giftShop +
                concessions;
              return {
                dailyRevenue: {
                  ...state.dailyRevenue,
                  concessions,
                  total,
                },
              };
            }),

          addFishFoodExpense: (amount) =>
            set((state) => {
              const fishFood = state.dailyExpense.fishFood + amount;
              const total =
                fishFood +
                state.dailyExpense.maintenance +
                state.dailyExpense.staff +
                state.dailyExpense.utilities;
              return {
                dailyExpense: {
                  ...state.dailyExpense,
                  fishFood,
                  total,
                },
              };
            }),

          addMaintenanceExpense: (amount) =>
            set((state) => {
              const maintenance = state.dailyExpense.maintenance + amount;
              const total =
                state.dailyExpense.fishFood +
                maintenance +
                state.dailyExpense.staff +
                state.dailyExpense.utilities;
              return {
                dailyExpense: {
                  ...state.dailyExpense,
                  maintenance,
                  total,
                },
              };
            }),

          addStaffExpense: (amount) =>
            set((state) => {
              const staff = state.dailyExpense.staff + amount;
              const total =
                state.dailyExpense.fishFood +
                state.dailyExpense.maintenance +
                staff +
                state.dailyExpense.utilities;
              return {
                dailyExpense: {
                  ...state.dailyExpense,
                  staff,
                  total,
                },
              };
            }),

          addUtilitiesExpense: (amount) =>
            set((state) => {
              const utilities = state.dailyExpense.utilities + amount;
              const total =
                state.dailyExpense.fishFood +
                state.dailyExpense.maintenance +
                state.dailyExpense.staff +
                utilities;
              return {
                dailyExpense: {
                  ...state.dailyExpense,
                  utilities,
                  total,
                },
              };
            }),

          setTicketPrice: (price) => set({ ticketPrice: Math.max(0, price) }),

          calculateDailyProfit: () => {
            const state = get();
            return state.dailyRevenue.total - state.dailyExpense.total;
          },

          resetDaily: () =>
            set({
              dailyRevenue: createEmptyRevenue(),
              dailyExpense: createEmptyExpense(),
              visitorMetrics: {
                totalVisitorsToday: 0,
                averageSpendingPerVisitor: 0,
                revenuePerVisitor: 0,
              },
            }),

          recordVisitorEntry: () =>
            set((state) => ({
              visitorMetrics: {
                ...state.visitorMetrics,
                totalVisitorsToday: state.visitorMetrics.totalVisitorsToday + 1,
                revenuePerVisitor:
                  state.visitorMetrics.totalVisitorsToday > 0
                    ? state.dailyRevenue.total /
                      state.visitorMetrics.totalVisitorsToday
                    : 0,
              },
            })),

          updateVisitorSpending: (amount) =>
            set((state) => {
              const newAverageSpending =
                state.visitorMetrics.totalVisitorsToday > 0
                  ? (state.visitorMetrics.averageSpendingPerVisitor *
                      state.visitorMetrics.totalVisitorsToday +
                      amount) /
                    state.visitorMetrics.totalVisitorsToday
                  : amount;

              return {
                visitorMetrics: {
                  ...state.visitorMetrics,
                  averageSpendingPerVisitor: newAverageSpending,
                  revenuePerVisitor:
                    state.visitorMetrics.totalVisitorsToday > 0
                      ? state.dailyRevenue.total /
                        state.visitorMetrics.totalVisitorsToday
                      : 0,
                },
              };
            }),

          updateTankCount: (count) =>
            set((state) => ({
              tankMetrics: {
                ...state.tankMetrics,
                totalTanks: count,
                revenuePerTank:
                  count > 0 ? state.dailyRevenue.total / count : 0,
              },
            })),

          updateFishCount: (totalFish, tankCount) =>
            set((state) => ({
              tankMetrics: {
                ...state.tankMetrics,
                averageFishPerTank: tankCount > 0 ? totalFish / tankCount : 0,
              },
            })),

          getRevenueBreakdown: () => {
            const state = get();
            return [
              { label: "Ticket Sales", value: state.dailyRevenue.ticketSales },
              { label: "Gift Shop", value: state.dailyRevenue.giftShop },
              { label: "Concessions", value: state.dailyRevenue.concessions },
            ];
          },

          getExpenseBreakdown: () => {
            const state = get();
            return [
              { label: "Fish Food", value: state.dailyExpense.fishFood },
              { label: "Maintenance", value: state.dailyExpense.maintenance },
              { label: "Staff", value: state.dailyExpense.staff },
              { label: "Utilities", value: state.dailyExpense.utilities },
            ];
          },

          reset: () => set(store.getInitialState()),
        }),
        {
          name: "aquarium-economy-state",
          partialize: (state) => ({
            dailyRevenue: state.dailyRevenue,
            dailyExpense: state.dailyExpense,
            ticketPrice: state.ticketPrice,
            visitorMetrics: state.visitorMetrics,
            tankMetrics: state.tankMetrics,
          }),
        },
      ),
    ),
  ),
);
