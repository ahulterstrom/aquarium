// Hair color generator with weighted distribution and age-based modifiers

import { HairColor, HairColorCategory, HairColorGenerationOptions } from '@/types/hairColor.types';
import { seededRandom, hslToRgb, rgbToHex } from '@/utils/colorUtils';
import { HAIR_COLOR_PALETTE } from '@/data/hairColorPalette';

export class HairColorGenerator {
  private palette: HairColor[];
  private cumulativeWeights: Map<HairColor, number> = new Map();
  private generatedColors: Map<string, HairColor> = new Map(); // Cache for variant colors
  
  constructor(palette: HairColor[] = HAIR_COLOR_PALETTE) {
    this.palette = palette;
    this.updateWeights();
    
    // Pre-populate cache with base palette colors
    palette.forEach(color => {
      this.generatedColors.set(color.id, color);
    });
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
        const finalColor = options?.variation 
          ? this.addVariation(color, randomFn) 
          : color;
        
        // Cache the generated color for later lookup
        this.generatedColors.set(finalColor.id, finalColor);
        return finalColor;
      }
    }
    
    // Fallback - cache and return first color
    const fallbackColor = entries[0][0];
    this.generatedColors.set(fallbackColor.id, fallbackColor);
    return fallbackColor;
  }
  
  private addVariation(color: HairColor, randomFn: () => number = Math.random): HairColor {
    // Add subtle variations to make colors more natural
    const hsl = { ...color.hsl };
    
    // Vary lightness by ±5%
    const lightnessDelta = (randomFn() - 0.5) * 10;
    hsl.l = Math.max(0, Math.min(100, hsl.l + lightnessDelta));
    
    // Vary saturation by ±3%
    const saturationDelta = (randomFn() - 0.5) * 6;
    hsl.s = Math.max(0, Math.min(100, hsl.s + saturationDelta));
    
    // Vary hue by ±2 degrees
    const hueDelta = (randomFn() - 0.5) * 4;
    hsl.h = (hsl.h + hueDelta + 360) % 360;
    
    const rgb = hslToRgb(hsl);
    const hex = rgbToHex(rgb);
    
    // Create a unique ID based on the variations
    const variantHash = Math.abs(Math.round(lightnessDelta * 100 + saturationDelta * 100 + hueDelta * 100));
    
    return {
      ...color,
      id: `${color.id}_v${variantHash}`,
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
    return this.generatedColors.get(id);
  }
}

// Export singleton instance for convenience
export const hairColorGenerator = new HairColorGenerator();