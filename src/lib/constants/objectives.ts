import { Objective, ObjectiveType } from "../../types/game.types";

// Define all objectives with their properties
export const OBJECTIVE_DEFINITIONS: Record<
  ObjectiveType,
  Omit<Objective, "id" | "progress" | "completed" | "rewarded">
> = {
  place_entrance: {
    type: "place_entrance",
    title: "Welcome to Aquatopia!",
    description: "Place your aquarium entrance",
    target: 1,
    moneyReward: 10,
    prerequisites: [],
  },
  build_first_tank: {
    type: "build_first_tank",
    title: "Build Your First Tank",
    description: "Place a tank to house your fish",
    target: 1,
    moneyReward: 15,
    prerequisites: ["place_entrance"],
  },
  buy_fish: {
    type: "buy_fish",
    title: "Stock Your Aquarium",
    description: "Buy 2 fish for your tanks",
    target: 2,
    moneyReward: 20,
    prerequisites: ["build_first_tank"],
  },
  earn_money: {
    type: "earn_money",
    title: "First Profits",
    description: "Earn a total of $50",
    target: 50,
    moneyReward: 25,
    prerequisites: ["buy_fish"],
  },
  attract_visitors: {
    type: "attract_visitors",
    title: "Growing Popularity",
    description: "Attract 10 visitors to your aquarium",
    target: 10,
    moneyReward: 30,
    prerequisites: ["buy_fish"],
  },
  satisfy_visitors: {
    type: "satisfy_visitors",
    title: "Happy Customers",
    description: "Have 5 visitors leave satisfied",
    target: 5,
    moneyReward: 35,
    prerequisites: ["attract_visitors"],
  },
  build_multiple_tanks: {
    type: "build_multiple_tanks",
    title: "Expanding the Aquarium",
    description: "Build a total of 3 tanks",
    target: 3,
    moneyReward: 40,
    prerequisites: ["earn_money"],
  },
  expand_aquarium: {
    type: "expand_aquarium",
    title: "More Space",
    description: "Expand your aquarium with 5 new tiles",
    target: 5,
    moneyReward: 50,
    prerequisites: ["build_multiple_tanks"],
  },
};