// Skin tone utilities for generating diverse character appearances

// Predefined skin tone palette based on realistic human skin tones
export const SKIN_TONE_PALETTE = [
  // Light tones
  { id: "light1", hex: "#FDE6D5", rgb: { r: 253, g: 230, b: 213 } },
  { id: "light2", hex: "#F9DCC4", rgb: { r: 249, g: 220, b: 196 } },
  { id: "light3", hex: "#F6CBA9", rgb: { r: 246, g: 203, b: 169 } },

  // Medium light tones
  { id: "mediumLight1", hex: "#EFC199", rgb: { r: 239, g: 193, b: 153 } },
  { id: "mediumLight2", hex: "#E2AE82", rgb: { r: 226, g: 174, b: 130 } },
  { id: "mediumLight3", hex: "#D9A066", rgb: { r: 217, g: 160, b: 102 } },

  // Medium tones
  { id: "medium1", hex: "#C88E5A", rgb: { r: 200, g: 142, b: 90 } },
  { id: "medium2", hex: "#B97B4E", rgb: { r: 185, g: 123, b: 78 } },
  { id: "medium3", hex: "#A5693F", rgb: { r: 165, g: 105, b: 63 } },

  // Medium dark tones
  { id: "mediumDark1", hex: "#925634", rgb: { r: 146, g: 86, b: 52 } },
  { id: "mediumDark2", hex: "#80472A", rgb: { r: 128, g: 71, b: 42 } },
  { id: "mediumDark3", hex: "#6D3A22", rgb: { r: 109, g: 58, b: 34 } },

  // Dark tones
  { id: "dark1", hex: "#5A2F1A", rgb: { r: 90, g: 47, b: 26 } },
  { id: "dark2", hex: "#442215", rgb: { r: 68, g: 34, b: 21 } },
  { id: "dark3", hex: "#2E1810", rgb: { r: 46, g: 24, b: 16 } },
];

export interface SkinTone {
  id: string;
  hex: string;
  rgb: { r: number; g: number; b: number };
}

// Generate a random skin tone
export function generateRandomSkinTone(): SkinTone {
  return SKIN_TONE_PALETTE[
    Math.floor(Math.random() * SKIN_TONE_PALETTE.length)
  ];
}

// Generate a skin tone with weighted distribution (more common tones appear more often)
export function generateWeightedSkinTone(): SkinTone {
  // Create weighted distribution (bell curve centered on medium tones)
  const weights = [
    1,
    2,
    3, // light
    4,
    5,
    6, // medium light
    7,
    8,
    7, // medium (peak)
    6,
    5,
    4, // medium dark
    3,
    2,
    1, // dark
  ];

  const totalWeight = weights.reduce((a, b) => a + b, 0);
  let random = Math.random() * totalWeight;

  for (let i = 0; i < weights.length; i++) {
    random -= weights[i];
    if (random <= 0) {
      return SKIN_TONE_PALETTE[i];
    }
  }

  return SKIN_TONE_PALETTE[Math.floor(SKIN_TONE_PALETTE.length / 2)];
}

// Get skin tone by ID
export function getSkinToneById(id: string): SkinTone | null {
  return SKIN_TONE_PALETTE.find((tone) => tone.id === id) || null;
}

// Material names that typically represent skin in 3D models
export const SKIN_MATERIAL_NAMES = ["skin"];

// Check if a material name likely represents skin
export function isSkinMaterial(materialName: string): boolean {
  const lowerName = materialName.toLowerCase();
  return SKIN_MATERIAL_NAMES.some((skinName) =>
    lowerName.includes(skinName.toLowerCase()),
  );
}
