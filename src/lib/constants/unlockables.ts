import { Unlockable } from "../../types/game.types";

// Unlockables data
export const UNLOCKABLES: Unlockable[] = [
  // Fish unlockables
  {
    id: "fish_angelfish",
    category: "fish",
    name: "Angelfish",
    description: "Unlock the majestic Angelfish for your aquarium",
    conditions: [
      {
        type: "objective",
        target: "buy_fish",
        description: "Complete 'Stock Your Aquarium' objective",
      },
    ],
  },
  {
    id: "fish_clownfish",
    category: "fish",
    name: "Clownfish",
    description: "Everyone's favorite orange fish!",
    conditions: [
      {
        type: "money",
        target: 100,
        description: "Earn $100",
      },
    ],
  },
  {
    id: "fish_beta",
    category: "fish",
    name: "Beta Fish",
    description: "Beautiful but solitary fighter fish",
    conditions: [
      {
        type: "objective",
        target: "build_multiple_tanks",
        description: "Complete 'Expanding the Aquarium' objective",
      },
    ],
    dependencies: ["fish_angelfish"],
  },
  // Tank unlockables
  {
    id: "tank_large",
    category: "tanks",
    name: "Large Tank",
    description: "A bigger tank that can hold more fish",
    conditions: [
      {
        type: "objective",
        target: "build_first_tank",
        description: "Complete 'Build Your First Tank' objective",
      },
    ],
  },
  {
    id: "tank_huge",
    category: "tanks",
    name: "Huge Tank",
    description: "A massive tank for your biggest fish",
    conditions: [
      {
        type: "count",
        target: 3,
        description: "Build 3 tanks",
      },
      {
        type: "money",
        target: 200,
        description: "Earn $200",
      },
    ],
    dependencies: ["tank_large"],
  },
  // Customization unlockables
  {
    id: "floor_marble",
    category: "customization",
    name: "Marble Floor",
    description: "Elegant marble flooring for your aquarium",
    conditions: [
      {
        type: "reputation",
        target: 60,
        description: "Reach 60 reputation",
      },
    ],
  },
  {
    id: "wall_glass",
    category: "customization",
    name: "Glass Walls",
    description: "Modern glass walls for a contemporary look",
    conditions: [
      {
        type: "money",
        target: 150,
        description: "Earn $150",
      },
    ],
  },
  // Building unlockables
  {
    id: "entrance_premium",
    category: "buildings",
    name: "Premium Entrance",
    description: "A fancy entrance that attracts more visitors",
    conditions: [
      {
        type: "objective",
        target: "attract_visitors",
        description: "Complete 'Growing Popularity' objective",
      },
    ],
  },
  // Mechanics unlockables
  {
    id: "auto_feeder",
    category: "mechanics",
    name: "Auto Feeder",
    description: "Automatically feeds your fish",
    conditions: [
      {
        type: "objective",
        target: "satisfy_visitors",
        description: "Complete 'Happy Customers' objective",
      },
    ],
    hidden: true,
  },
  // Expansion unlockables
  {
    id: "expansion_mega",
    category: "expansions",
    name: "Mega Expansion Pack",
    description: "10 tiles for massive expansion",
    conditions: [
      {
        type: "objective",
        target: "expand_aquarium",
        description: "Complete 'More Space' objective",
      },
    ],
  },
];