// Hair color type definitions

export interface RGB {
  r: number;
  g: number;
  b: number;
}

export interface HSL {
  h: number;
  s: number;
  l: number;
}

export interface HairColor {
  id: string;
  name: string;
  hex: string;
  rgb: RGB;
  hsl: HSL;
  category: HairColorCategory;
  rarity: number; // Weight for random generation (higher = more common)
  ageModifier?: (age: number) => number; // Optional age-based weight modifier
}

export enum HairColorCategory {
  Black = "black",
  Brown = "brown",
  Blonde = "blonde",
  Red = "red",
  Gray = "gray",
  Fantasy = "fantasy", // For game-specific colors
}

export interface HairColorGenerationOptions {
  age?: number;
  category?: HairColorCategory;
  allowFantasy?: boolean;
  variation?: boolean; // Add slight color variations
  seed?: string; // For deterministic generation
}