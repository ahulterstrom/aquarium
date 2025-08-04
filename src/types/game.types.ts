import { Vector3 } from 'three';

export interface GridPosition {
  x: number;
  y: number;
  z: number;
}

export interface Tank {
  id: string;
  position: GridPosition;
  size: 'small' | 'medium' | 'large';
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
  edge: 'north' | 'south' | 'east' | 'west';
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
}

export interface FishSpecies {
  id: string;
  name: string;
  price: number;
  rarity: 'common' | 'uncommon' | 'rare' | 'legendary';
  preferredTemperature: { min: number; max: number };
  size: 'small' | 'medium' | 'large';
  schooling: boolean;
  aggressiveness: number;
  feedingInterval: number;
}

export type VisitorState = 'entering' | 'exploring' | 'viewing' | 'satisfied' | 'leaving';

export interface VisitorInterests {
  fishTypes: string[];        // Preferred fish species
  tankSizes: ('small' | 'medium' | 'large')[];
  decorationTypes: string[];  // Future: coral, plants, etc.
}

export interface VisitorPreferences {
  viewingTime: { min: number; max: number };  // How long they look at tanks
  walkingSpeed: number;
  satisfactionThreshold: number;
}

export interface Visitor {
  id: string;
  name: string;
  gender: 'male' | 'female';
  position: Vector3;
  velocity: Vector3;
  
  // State management
  state: VisitorState;
  targetPosition: Vector3 | null;
  targetTankId: string | null;
  currentPath: GridPosition[] | null;
  
  // Interest & satisfaction system
  interests: VisitorInterests;
  satisfaction: number;
  maxSatisfaction: number;
  
  // Timing & behavior
  preferences: VisitorPreferences;
  stateTimer: number;  // Time in current state
  totalVisitTime: number;
  
  // Future extensibility (ready to use)
  money: number;
  happiness: number;
  patience: number;
  moneySpent: number;
  
  // Analytics & future features
  tanksVisited: string[];
  entryEntranceId: string;
}

export interface TankDecoration {
  id: string;
  type: 'plant' | 'rock' | 'coral' | 'castle' | 'treasure';
  position: Vector3;
  scale: number;
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
  type: 'empty' | 'tank' | 'path' | 'decoration' | 'facility' | 'entrance';
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