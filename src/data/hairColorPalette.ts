// Hair color palette with expanded colors and age-based generation

import { HairColor, HairColorCategory } from '@/types/hairColor.types';
import { hexToRgb, rgbToHsl } from '@/utils/colorUtils';

const createHairColor = (
  id: string,
  name: string,
  hex: string,
  category: HairColorCategory,
  rarity: number,
  ageModifier?: (age: number) => number
): HairColor => {
  const rgb = hexToRgb(hex);
  const hsl = rgbToHsl(rgb);
  
  return {
    id,
    name,
    hex,
    rgb,
    hsl,
    category,
    rarity,
    ageModifier,
  };
};

// Age modifier for gray/silver hair
const grayAgeModifier = (age: number): number => {
  if (age < 30) return 0.1; // Very rare in young people
  if (age < 50) return 1;    // Somewhat rare in middle age
  if (age < 65) return 5;    // Common in older adults
  return 10;                  // Very common in elderly
};

// Age modifier for fantasy colors (more common in younger people)
const fantasyAgeModifier = (age: number): number => {
  if (age < 25) return 1;     // More common in young adults
  if (age < 35) return 0.5;     // Somewhat common in adults
  if (age < 50) return 0.2;   // Less common in middle age
  return 0.1;                 // Very rare in older adults
};

export const HAIR_COLOR_PALETTE: HairColor[] = [
  // Black shades
  createHairColor("black", "Black", "#1c1c1c", HairColorCategory.Black, 15),
  createHairColor("jetBlack", "Jet Black", "#0a0a0a", HairColorCategory.Black, 10),
  createHairColor("softBlack", "Soft Black", "#2a2a2a", HairColorCategory.Black, 12),
  
  // Brown shades (most common)
  createHairColor("darkBrown", "Dark Brown", "#2c1810", HairColorCategory.Brown, 20),
  createHairColor("brown", "Brown", "#8b4513", HairColorCategory.Brown, 25),
  createHairColor("mediumBrown", "Medium Brown", "#6b3410", HairColorCategory.Brown, 22),
  createHairColor("lightBrown", "Light Brown", "#a0522d", HairColorCategory.Brown, 18),
  createHairColor("chestnut", "Chestnut", "#954535", HairColorCategory.Brown, 15),
  createHairColor("chocolate", "Chocolate", "#5d2f1e", HairColorCategory.Brown, 16),
  createHairColor("caramel", "Caramel", "#c87533", HairColorCategory.Brown, 14),
  
  // Blonde shades
  createHairColor("darkBlonde", "Dark Blonde", "#b8860b", HairColorCategory.Blonde, 10),
  createHairColor("goldenBlonde", "Golden Blonde", "#daa520", HairColorCategory.Blonde, 8),
  createHairColor("blonde", "Blonde", "#f0e68c", HairColorCategory.Blonde, 7),
  createHairColor("lightBlonde", "Light Blonde", "#f5deb3", HairColorCategory.Blonde, 5),
  createHairColor("platinumBlonde", "Platinum Blonde", "#faf0be", HairColorCategory.Blonde, 3),
  createHairColor("ashBlonde", "Ash Blonde", "#a8a075", HairColorCategory.Blonde, 6),
  createHairColor("honeyBlonde", "Honey Blonde", "#deb887", HairColorCategory.Blonde, 7),
  
  // Red/Auburn shades
  createHairColor("darkAuburn", "Dark Auburn", "#722f37", HairColorCategory.Red, 6),
  createHairColor("auburn", "Auburn", "#a52a2a", HairColorCategory.Red, 7),
  createHairColor("copper", "Copper", "#b87333", HairColorCategory.Red, 5),
  createHairColor("ginger", "Ginger", "#bc5f04", HairColorCategory.Red, 4),
  createHairColor("red", "Red", "#b22222", HairColorCategory.Red, 3),
  createHairColor("strawberryBlonde", "Strawberry Blonde", "#ff8c69", HairColorCategory.Red, 3),
  createHairColor("mahogany", "Mahogany", "#c04000", HairColorCategory.Red, 4),
  createHairColor("burgundy", "Burgundy", "#800020", HairColorCategory.Red, 2),
  
  // Gray/Silver (age-dependent)
  createHairColor("saltAndPepper", "Salt and Pepper", "#555555", HairColorCategory.Gray, 2, grayAgeModifier),
  createHairColor("darkGray", "Dark Gray", "#606060", HairColorCategory.Gray, 2, grayAgeModifier),
  createHairColor("gray", "Gray", "#808080", HairColorCategory.Gray, 2, grayAgeModifier),
  createHairColor("lightGray", "Light Gray", "#a0a0a0", HairColorCategory.Gray, 1, grayAgeModifier),
  createHairColor("silver", "Silver", "#c0c0c0", HairColorCategory.Gray, 1, grayAgeModifier),
  createHairColor("white", "White", "#e8e8e8", HairColorCategory.Gray, 1, grayAgeModifier),
  
  // Fantasy colors (optional for games)
  createHairColor("midnightBlue", "Midnight Blue", "#191970", HairColorCategory.Fantasy, 0, fantasyAgeModifier),
  createHairColor("forestGreen", "Forest Green", "#228b22", HairColorCategory.Fantasy, 0, fantasyAgeModifier),
  createHairColor("violet", "Violet", "#8b008b", HairColorCategory.Fantasy, 0, fantasyAgeModifier),
  createHairColor("crimson", "Crimson", "#dc143c", HairColorCategory.Fantasy, 0, fantasyAgeModifier),
  createHairColor("electricBlue", "Electric Blue", "#7df9ff", HairColorCategory.Fantasy, 0, fantasyAgeModifier),
  createHairColor("magenta", "Magenta", "#ff00ff", HairColorCategory.Fantasy, 0, fantasyAgeModifier),
  createHairColor("teal", "Teal", "#008080", HairColorCategory.Fantasy, 0, fantasyAgeModifier),
];

// All characters have their hair mesh named "hair"
export const HAIR_MATERIAL_NAMES = [
  'hair',
];

// Check if a material name likely represents hair
export function isHairMaterial(materialName: string): boolean {
  const lowerName = materialName.toLowerCase();
  return HAIR_MATERIAL_NAMES.some(hairName => 
    lowerName.includes(hairName.toLowerCase())
  );
}