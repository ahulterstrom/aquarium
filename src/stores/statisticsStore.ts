import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { createSelectors } from "@/stores/utils";

// Daily snapshot for historical tracking
interface DailySnapshot {
  day: number;
  date: string; // ISO date string
  money: number;
  tankCount: number;
  fishCount: number;
  visitorCount: number;
  reputation: number;
  dailyProfit: number;
  gridSize: number;
}

// Lifetime statistics
interface LifetimeStats {
  // Totals
  totalMoneyEarned: number;
  totalMoneySpent: number;
  totalTanksBuilt: number;
  totalFishPurchased: number;
  totalVisitorsServed: number;
  totalCoinsCollected: number;
  totalExpansionTilesPlaced: number;

  // Records
  highestDailyProfit: number;
  mostVisitorsInOneDay: number;
  highestReputation: number;
  largestGridSize: number;
  mostFishInTank: number;
  longestPlaySession: number; // in minutes

  // Efficiency metrics
  averageProfitPerVisitor: number;
  averageFishHappiness: number;
  averageWaterQuality: number;

  // Milestones
  firstTankDate: string | null;
  first100DollarsDate: string | null;
  firstExpansionDate: string | null;
  maxGridReachedDate: string | null;
}

// Daily tracking for current day (resets each day)
interface CurrentDayStats {
  moneyEarnedToday: number;
  visitorsToday: number;
  coinsCollectedToday: number;
  actionsToday: number;
}

interface StatisticsStore {
  // Core data
  lifetimeStats: LifetimeStats;
  dailySnapshots: DailySnapshot[];
  currentDay: CurrentDayStats;

  // Lifetime stat updates
  recordMoneyEarned: (amount: number) => void;
  recordMoneySpent: (amount: number) => void;
  recordTankBuilt: () => void;
  recordFishPurchased: () => void;
  recordVisitorServed: () => void;
  recordCoinCollected: (value: number) => void;
  recordExpansionTile: () => void;

  // Record updates
  updateDailyProfit: (profit: number) => void;
  updateVisitorCount: (count: number) => void;
  updateReputation: (reputation: number) => void;
  updateGridSize: (size: number) => void;
  updateFishInTank: (count: number) => void;

  // Efficiency updates
  updateAverageProfitPerVisitor: () => void;
  updateFishHappiness: (happiness: number) => void;
  updateWaterQuality: (quality: number) => void;

  // Milestone tracking
  recordFirstTank: () => void;
  recordFirst100Dollars: () => void;
  recordFirstExpansion: () => void;
  recordMaxGrid: () => void;

  // Daily operations
  createDailySnapshot: (gameState: {
    day: number;
    money: number;
    tankCount: number;
    fishCount: number;
    visitorCount: number;
    reputation: number;
    dailyProfit: number;
    gridSize: number;
  }) => void;

  // Daily management
  recordAction: () => void;
  resetDailyStats: () => void;

  // Analytics
  getTotalPlaytime: () => number;
  getAverageSessionLength: () => number;
  getDailyGrowthRate: () => number;
  getBestDay: () => DailySnapshot | null;
  getRecentTrend: (days: number) => DailySnapshot[];

  // Reset
  reset: () => void;
}

const createEmptyLifetimeStats = (): LifetimeStats => ({
  totalMoneyEarned: 0,
  totalMoneySpent: 0,
  totalTanksBuilt: 0,
  totalFishPurchased: 0,
  totalVisitorsServed: 0,
  totalCoinsCollected: 0,
  totalExpansionTilesPlaced: 0,

  highestDailyProfit: 0,
  mostVisitorsInOneDay: 0,
  highestReputation: 50,
  largestGridSize: 9,
  mostFishInTank: 0,
  longestPlaySession: 0,

  averageProfitPerVisitor: 0,
  averageFishHappiness: 1,
  averageWaterQuality: 1,

  firstTankDate: null,
  first100DollarsDate: null,
  firstExpansionDate: null,
  maxGridReachedDate: null,
});

const createEmptyDayStats = (): CurrentDayStats => ({
  moneyEarnedToday: 0,
  visitorsToday: 0,
  coinsCollectedToday: 0,
  actionsToday: 0,
});

export const useStatisticsStore = createSelectors(
  create<StatisticsStore>()(
    devtools(
      persist(
        (set, get, store) => ({
          lifetimeStats: createEmptyLifetimeStats(),
          dailySnapshots: [],
          currentDay: createEmptyDayStats(),

          recordMoneyEarned: (amount) =>
            set((state) => ({
              lifetimeStats: {
                ...state.lifetimeStats,
                totalMoneyEarned: state.lifetimeStats.totalMoneyEarned + amount,
              },
              currentDay: {
                ...state.currentDay,
                moneyEarnedToday: state.currentDay.moneyEarnedToday + amount,
              },
            })),

          recordMoneySpent: (amount) =>
            set((state) => ({
              lifetimeStats: {
                ...state.lifetimeStats,
                totalMoneySpent: state.lifetimeStats.totalMoneySpent + amount,
              },
            })),

          recordTankBuilt: () =>
            set((state) => {
              const newStats = { ...state.lifetimeStats };
              newStats.totalTanksBuilt += 1;

              // Record first tank milestone
              if (newStats.totalTanksBuilt === 1 && !newStats.firstTankDate) {
                newStats.firstTankDate = new Date().toISOString();
              }

              return { lifetimeStats: newStats };
            }),

          recordFishPurchased: () =>
            set((state) => ({
              lifetimeStats: {
                ...state.lifetimeStats,
                totalFishPurchased: state.lifetimeStats.totalFishPurchased + 1,
              },
            })),

          recordVisitorServed: () =>
            set((state) => ({
              lifetimeStats: {
                ...state.lifetimeStats,
                totalVisitorsServed:
                  state.lifetimeStats.totalVisitorsServed + 1,
              },
              currentDay: {
                ...state.currentDay,
                visitorsToday: state.currentDay.visitorsToday + 1,
              },
            })),

          recordCoinCollected: (value) =>
            set((state) => ({
              lifetimeStats: {
                ...state.lifetimeStats,
                totalCoinsCollected:
                  state.lifetimeStats.totalCoinsCollected + 1,
              },
              currentDay: {
                ...state.currentDay,
                coinsCollectedToday: state.currentDay.coinsCollectedToday + 1,
              },
            })),

          recordExpansionTile: () =>
            set((state) => {
              const newStats = { ...state.lifetimeStats };
              newStats.totalExpansionTilesPlaced += 1;

              // Record first expansion milestone
              if (
                newStats.totalExpansionTilesPlaced === 1 &&
                !newStats.firstExpansionDate
              ) {
                newStats.firstExpansionDate = new Date().toISOString();
              }

              return { lifetimeStats: newStats };
            }),

          updateDailyProfit: (profit) =>
            set((state) => ({
              lifetimeStats: {
                ...state.lifetimeStats,
                highestDailyProfit: Math.max(
                  state.lifetimeStats.highestDailyProfit,
                  profit,
                ),
              },
            })),

          updateVisitorCount: (count) =>
            set((state) => ({
              lifetimeStats: {
                ...state.lifetimeStats,
                mostVisitorsInOneDay: Math.max(
                  state.lifetimeStats.mostVisitorsInOneDay,
                  count,
                ),
              },
            })),

          updateReputation: (reputation) =>
            set((state) => ({
              lifetimeStats: {
                ...state.lifetimeStats,
                highestReputation: Math.max(
                  state.lifetimeStats.highestReputation,
                  reputation,
                ),
              },
            })),

          updateGridSize: (size) =>
            set((state) => {
              const newStats = { ...state.lifetimeStats };

              if (size > newStats.largestGridSize) {
                newStats.largestGridSize = size;
                newStats.maxGridReachedDate = new Date().toISOString();
              }

              return { lifetimeStats: newStats };
            }),

          updateFishInTank: (count) =>
            set((state) => ({
              lifetimeStats: {
                ...state.lifetimeStats,
                mostFishInTank: Math.max(
                  state.lifetimeStats.mostFishInTank,
                  count,
                ),
              },
            })),

          updateAverageProfitPerVisitor: () => {
            const state = get();
            if (state.lifetimeStats.totalVisitorsServed > 0) {
              const avgProfit =
                state.lifetimeStats.totalMoneyEarned /
                state.lifetimeStats.totalVisitorsServed;
              set((state) => ({
                lifetimeStats: {
                  ...state.lifetimeStats,
                  averageProfitPerVisitor: avgProfit,
                },
              }));
            }
          },

          updateFishHappiness: (happiness) => {
            // Implement rolling average calculation
            const state = get();
            const currentAvg = state.lifetimeStats.averageFishHappiness;
            const newAvg = (currentAvg + happiness) / 2; // Simple moving average
            set((state) => ({
              lifetimeStats: {
                ...state.lifetimeStats,
                averageFishHappiness: newAvg,
              },
            }));
          },

          updateWaterQuality: (quality) => {
            // Implement rolling average calculation
            const state = get();
            const currentAvg = state.lifetimeStats.averageWaterQuality;
            const newAvg = (currentAvg + quality) / 2;
            set((state) => ({
              lifetimeStats: {
                ...state.lifetimeStats,
                averageWaterQuality: newAvg,
              },
            }));
          },

          recordFirstTank: () => {
            const state = get();
            if (!state.lifetimeStats.firstTankDate) {
              set((state) => ({
                lifetimeStats: {
                  ...state.lifetimeStats,
                  firstTankDate: new Date().toISOString(),
                },
              }));
            }
          },

          recordFirst100Dollars: () => {
            const state = get();
            if (!state.lifetimeStats.first100DollarsDate) {
              set((state) => ({
                lifetimeStats: {
                  ...state.lifetimeStats,
                  first100DollarsDate: new Date().toISOString(),
                },
              }));
            }
          },

          recordFirstExpansion: () => {
            const state = get();
            if (!state.lifetimeStats.firstExpansionDate) {
              set((state) => ({
                lifetimeStats: {
                  ...state.lifetimeStats,
                  firstExpansionDate: new Date().toISOString(),
                },
              }));
            }
          },

          recordMaxGrid: () => {
            const state = get();
            set((state) => ({
              lifetimeStats: {
                ...state.lifetimeStats,
                maxGridReachedDate: new Date().toISOString(),
              },
            }));
          },

          createDailySnapshot: (gameState) => {
            const snapshot: DailySnapshot = {
              day: gameState.day,
              date: new Date().toISOString(),
              money: gameState.money,
              tankCount: gameState.tankCount,
              fishCount: gameState.fishCount,
              visitorCount: gameState.visitorCount,
              reputation: gameState.reputation,
              dailyProfit: gameState.dailyProfit,
              gridSize: gameState.gridSize,
            };

            set((state) => ({
              dailySnapshots: [...state.dailySnapshots, snapshot],
            }));
          },

          recordAction: () =>
            set((state) => ({
              currentDay: {
                ...state.currentDay,
                actionsToday: state.currentDay.actionsToday + 1,
              },
            })),

          resetDailyStats: () =>
            set({
              currentDay: createEmptyDayStats(),
            }),

          getTotalPlaytime: () => {
            const state = get();
            return state.lifetimeStats.longestPlaySession;
          },

          getAverageSessionLength: () => {
            const state = get();
            if (state.dailySnapshots.length === 0) return 0;
            return (
              state.lifetimeStats.longestPlaySession /
              state.dailySnapshots.length
            );
          },

          getDailyGrowthRate: () => {
            const state = get();
            const snapshots = state.dailySnapshots;
            if (snapshots.length < 2) return 0;

            const latest = snapshots[snapshots.length - 1];
            const previous = snapshots[snapshots.length - 2];

            return ((latest.money - previous.money) / previous.money) * 100;
          },

          getBestDay: () => {
            const state = get();
            if (state.dailySnapshots.length === 0) return null;

            return state.dailySnapshots.reduce((best, current) =>
              current.dailyProfit > best.dailyProfit ? current : best,
            );
          },

          getRecentTrend: (days) => {
            const state = get();
            return state.dailySnapshots.slice(-days);
          },

          reset: () => set(store.getInitialState()),
        }),
        {
          name: "aquarium-statistics",
          partialize: (state) => ({
            lifetimeStats: state.lifetimeStats,
            dailySnapshots: state.dailySnapshots,
          }),
        },
      ),
    ),
  ),
);
