import { Vector3 } from "three";

export interface GridPosition {
  x: number;
  y: number;
  z: number;
}

export interface Tank {
  id: string;
  position: GridPosition;
  size: "medium" | "large" | "huge";
  gridWidth: number; // Number of grid cells wide (X-axis)
  gridDepth: number; // Number of grid cells deep (Z-axis)
  waterQuality: number;
  temperature: number;
  capacity: number;
  fishIds: string[];
  decorations: TankDecoration[];
  maintenanceLevel: number;
}

export interface Entrance {
  id: string;
  position: GridPosition;
  isMainEntrance: boolean;
  edge: "north" | "south" | "east" | "west";
}

export interface Fish {
  id: string;
  species: FishSpecies;
  tankId: string;
  health: number;
  happiness: number;
  age: number;
  position: Vector3;
  velocity: Vector3;
  hunger: number;
  
  // Movement and behavior properties
  targetPosition: Vector3 | null;
  behaviorState: FishBehaviorState;
  behaviorTimer: number;
  swimSpeed: number;
  schoolingTarget: string | null; // ID of fish to follow for schooling
  lastFedTime: number;
}

export type FishBehaviorState = 
  | "idle"
  | "swimming"
  | "feeding" 
  | "schooling"
  | "resting";

export interface FishSpecies {
  id: string;
  name: string;
  price: number;
  rarity: "common" | "uncommon" | "rare" | "legendary";
  preferredTemperature: { min: number; max: number };
  size: "small" | "medium" | "large";
  schooling: boolean;
  aggressiveness: number;
  feedingInterval: number;
}

export type VisitorState =
  | "entering"
  | "exploring"
  | "thinking"
  | "travelingToPoi"
  | "viewing"
  | "satisfied"
  | "leaving";

export interface VisitorInterests {
  fishTypes: string[]; // Preferred fish species
  tankSizes: ("medium" | "large" | "huge")[];
  decorationTypes: string[]; // Future: coral, plants, etc.
}

export interface VisitorPreferences {
  viewingTime: { min: number; max: number }; // How long they look at tanks
  walkingSpeed: number;
  satisfactionThreshold: number;
}

export interface Visitor {
  id: string;
  name: string;
  gender: "male" | "female";
  position: Vector3;
  velocity: Vector3;

  // State management
  state: VisitorState;
  targetPosition: Vector3 | null;
  targetPOIId: string | null; // Which POI they're heading to
  currentPath: GridPosition[] | null;
  smoothPath: Vector3[] | null; // Smoothed world positions for movement
  pathIndex?: number; // Current index in the smoothed path array

  // Interest & satisfaction system
  interests: VisitorInterests;
  satisfaction: number;
  maxSatisfaction: number;

  // Timing & behavior
  preferences: VisitorPreferences;
  stateTimer: number; // Time in current state
  totalVisitTime: number;
  thinkingDuration?: number; // Duration for current thinking state

  // Future extensibility (ready to use)
  money: number;
  happiness: number;
  patience: number;
  moneySpent: number;

  // Analytics & future features
  tanksVisited: string[];
  thoughts: string[];
  entryEntranceId: string;
}

export interface TankDecoration {
  id: string;
  type: "plant" | "rock" | "coral" | "castle" | "treasure";
  position: Vector3;
  scale: number;
}

export interface Coin {
  id: string;
  position: Vector3;
  value: number;
  createdAt: number; // Timestamp for auto-despawn
  droppedByVisitorId: string;
}

export interface GameState {
  money: number;
  reputation: number;
  visitorCount: number;
  day: number;
  isPaused: boolean;
  gameSpeed: 1 | 2 | 3;
}

export interface GridCell {
  x: number;
  y: number;
  z: number;
  occupied: boolean;
  tankId?: string;
  entranceId?: string;
  type: "empty" | "tank" | "path" | "decoration" | "facility" | "entrance" | "expansion";
}

export interface Revenue {
  ticketSales: number;
  giftShop: number;
  concessions: number;
  total: number;
}

export interface Expense {
  fishFood: number;
  maintenance: number;
  staff: number;
  utilities: number;
  total: number;
}

export type ObjectiveType = 
  | "place_entrance"
  | "build_first_tank"
  | "buy_fish"
  | "earn_money"
  | "attract_visitors"
  | "satisfy_visitors"
  | "expand_aquarium"
  | "build_multiple_tanks";

export interface Objective {
  id: string;
  type: ObjectiveType;
  title: string;
  description: string;
  progress: number;
  target: number;
  completed: boolean;
  rewarded: boolean;
  moneyReward: number;
  // For conditional objectives
  prerequisites?: ObjectiveType[];
}
