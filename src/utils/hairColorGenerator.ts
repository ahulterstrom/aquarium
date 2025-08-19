// Hair color generator with weighted distribution and age-based modifiers

import { HairColor, HairColorCategory, HairColorGenerationOptions } from '@/types/hairColor.types';
import { seededRandom, hslToRgb, rgbToHex } from '@/utils/colorUtils';
import { HAIR_COLOR_PALETTE } from '@/data/hairColorPalette';

export class HairColorGenerator {
  private palette: HairColor[];
  private cumulativeWeights: Map<HairColor, number> = new Map();
  
  constructor(palette: HairColor[] = HAIR_COLOR_PALETTE) {
    this.palette = palette;
    this.updateWeights();
  }
  
  private updateWeights(options?: HairColorGenerationOptions): void {
    this.cumulativeWeights.clear();
    let cumulative = 0;
    
    for (const color of this.palette) {
      // Skip fantasy colors unless explicitly allowed
      if (color.category === HairColorCategory.Fantasy && !options?.allowFantasy) {
        continue;
      }
      
      // Filter by category if specified
      if (options?.category && color.category !== options.category) {
        continue;
      }
      
      let weight = color.rarity;
      
      // Apply age modifier if age is provided
      if (options?.age && color.ageModifier) {
        weight = color.ageModifier(options.age);
      }
      
      cumulative += weight;
      this.cumulativeWeights.set(color, cumulative);
    }
  }
  
  generate(options?: HairColorGenerationOptions): HairColor {
    this.updateWeights(options);
    
    const entries = Array.from(this.cumulativeWeights.entries());
    if (entries.length === 0) {
      throw new Error("No valid colors available with current options");
    }
    
    const totalWeight = entries[entries.length - 1][1];
    const randomFn = options?.seed 
      ? seededRandom(options.seed) 
      : Math.random;
    
    const random = randomFn() * totalWeight;
    
    for (const [color, weight] of entries) {
      if (random <= weight) {
        return options?.variation 
          ? this.addVariation(color, randomFn) 
          : color;
      }
    }
    
    return entries[0][0]; // Fallback
  }
  
  private addVariation(color: HairColor, randomFn: () => number = Math.random): HairColor {
    // Add subtle variations to make colors more natural
    const hsl = { ...color.hsl };
    
    // Vary lightness by ±5%
    hsl.l = Math.max(0, Math.min(100, hsl.l + (randomFn() - 0.5) * 10));
    
    // Vary saturation by ±3%
    hsl.s = Math.max(0, Math.min(100, hsl.s + (randomFn() - 0.5) * 6));
    
    // Vary hue by ±2 degrees
    hsl.h = (hsl.h + (randomFn() - 0.5) * 4 + 360) % 360;
    
    const rgb = hslToRgb(hsl);
    const hex = rgbToHex(rgb);
    
    return {
      ...color,
      id: `${color.id}_variant`,
      name: `${color.name} (Variant)`,
      hex,
      rgb,
      hsl,
    };
  }
  
  generateMultiple(count: number, options?: HairColorGenerationOptions): HairColor[] {
    return Array.from({ length: count }, () => this.generate(options));
  }
  
  getColorsByCategory(category: HairColorCategory): HairColor[] {
    return this.palette.filter(c => c.category === category);
  }
  
  getColorById(id: string): HairColor | undefined {
    return this.palette.find(c => c.id === id);
  }
}

// Export singleton instance for convenience
export const hairColorGenerator = new HairColorGenerator();