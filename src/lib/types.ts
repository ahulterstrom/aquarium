export interface Card {
  id: string;
  name: string;
  cost: number;
  type: "attack" | "skill" | "power" | "status" | "curse";
  rarity: "starter" | "common" | "uncommon" | "rare" | "special";
  upgraded: boolean;
  keywords: string[]; // exhaust, innate, ethereal, etc.
  metadata?: Record<string, any>; // for runtime modifications
}

export interface Relic {
  id: string;
  name: string;
  rarity: "common" | "uncommon" | "rare" | "boss" | "shop" | "event";
  counter?: number; // for relics that track things
}

export interface Enemy {
  id: string;
  name: string;
  hp: number;
  maxHp: number;
  block: number;
  powers: Power[];
  intent: Intent;
  moveHistory: string[];
}

export interface Power {
  id: string;
  amount: number;
  turnBased: boolean;
  justApplied?: boolean;
}
