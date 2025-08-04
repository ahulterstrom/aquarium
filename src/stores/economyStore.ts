import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { Revenue, Expense } from '../types/game.types';

interface EconomyStore {
  dailyRevenue: Revenue;
  dailyExpense: Expense;
  ticketPrice: number;
  
  // Revenue tracking
  addTicketRevenue: (amount: number) => void;
  addGiftShopRevenue: (amount: number) => void;
  addConcessionRevenue: (amount: number) => void;
  
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

export const useEconomyStore = create<EconomyStore>()(
  devtools((set, get) => ({
    dailyRevenue: createEmptyRevenue(),
    dailyExpense: createEmptyExpense(),
    ticketPrice: 10,
    
    addTicketRevenue: (amount) => set((state) => {
      const ticketSales = state.dailyRevenue.ticketSales + amount;
      const total = ticketSales + state.dailyRevenue.giftShop + state.dailyRevenue.concessions;
      return {
        dailyRevenue: {
          ...state.dailyRevenue,
          ticketSales,
          total,
        },
      };
    }),
    
    addGiftShopRevenue: (amount) => set((state) => {
      const giftShop = state.dailyRevenue.giftShop + amount;
      const total = state.dailyRevenue.ticketSales + giftShop + state.dailyRevenue.concessions;
      return {
        dailyRevenue: {
          ...state.dailyRevenue,
          giftShop,
          total,
        },
      };
    }),
    
    addConcessionRevenue: (amount) => set((state) => {
      const concessions = state.dailyRevenue.concessions + amount;
      const total = state.dailyRevenue.ticketSales + state.dailyRevenue.giftShop + concessions;
      return {
        dailyRevenue: {
          ...state.dailyRevenue,
          concessions,
          total,
        },
      };
    }),
    
    addFishFoodExpense: (amount) => set((state) => {
      const fishFood = state.dailyExpense.fishFood + amount;
      const total = fishFood + state.dailyExpense.maintenance + 
                   state.dailyExpense.staff + state.dailyExpense.utilities;
      return {
        dailyExpense: {
          ...state.dailyExpense,
          fishFood,
          total,
        },
      };
    }),
    
    addMaintenanceExpense: (amount) => set((state) => {
      const maintenance = state.dailyExpense.maintenance + amount;
      const total = state.dailyExpense.fishFood + maintenance + 
                   state.dailyExpense.staff + state.dailyExpense.utilities;
      return {
        dailyExpense: {
          ...state.dailyExpense,
          maintenance,
          total,
        },
      };
    }),
    
    addStaffExpense: (amount) => set((state) => {
      const staff = state.dailyExpense.staff + amount;
      const total = state.dailyExpense.fishFood + state.dailyExpense.maintenance + 
                   staff + state.dailyExpense.utilities;
      return {
        dailyExpense: {
          ...state.dailyExpense,
          staff,
          total,
        },
      };
    }),
    
    addUtilitiesExpense: (amount) => set((state) => {
      const utilities = state.dailyExpense.utilities + amount;
      const total = state.dailyExpense.fishFood + state.dailyExpense.maintenance + 
                   state.dailyExpense.staff + utilities;
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
    
    resetDaily: () => set({
      dailyRevenue: createEmptyRevenue(),
      dailyExpense: createEmptyExpense(),
    }),
    
    getRevenueBreakdown: () => {
      const state = get();
      return [
        { label: 'Ticket Sales', value: state.dailyRevenue.ticketSales },
        { label: 'Gift Shop', value: state.dailyRevenue.giftShop },
        { label: 'Concessions', value: state.dailyRevenue.concessions },
      ];
    },
    
    getExpenseBreakdown: () => {
      const state = get();
      return [
        { label: 'Fish Food', value: state.dailyExpense.fishFood },
        { label: 'Maintenance', value: state.dailyExpense.maintenance },
        { label: 'Staff', value: state.dailyExpense.staff },
        { label: 'Utilities', value: state.dailyExpense.utilities },
      ];
    },
  }))
);