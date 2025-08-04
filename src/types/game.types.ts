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

export interface Visitor {
  id: string;
  position: Vector3;
  targetTankId: string | null;
  happiness: number;
  patience: number;
  moneySpent: number;
  favoriteSpecies: string[];
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
  type: 'empty' | 'tank' | 'path' | 'decoration' | 'facility';
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