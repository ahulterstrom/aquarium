import { FloorTextureConfig } from "@/lib/textures/floorTextureManager";

export const FLOOR_THICKNESS = 0.2;
export interface FloorStyle {
  id: string;
  name: string;
  description: string;
  textures: FloorTextureConfig;
  material: {
    roughness: number;
    metalness: number;
  };
  unlockRequirement?: {
    type: "money" | "objective" | "reputation";
    value: string | number;
  };
}

export const FLOOR_STYLES: Record<string, FloorStyle> = {
  concrete: {
    id: "concrete",
    name: "Concrete",
    description: "Hey, at least it's not dirt!",
    textures: {
      baseColor:
        "/textures/floors/concrete_ground_01_1k/concrete_ground_01_color_1k.png",
      normal:
        "/textures/floors/concrete_ground_01_1k/concrete_ground_01_normal_gl_1k.png",
      aorm: "/textures/floors/concrete_ground_01_1k/aorm_rgb.png",
    },
    material: {
      roughness: 0.5,
      metalness: 0.0,
    },
  },
  wood: {
    id: "wood",
    name: "Wood Planks",
    description: "Classic wooden flooring with natural grain",
    textures: {
      baseColor:
        "/textures/floors/wood_planks_11_1k/wood_planks_11_baseColor_1k.png",
      normal:
        "/textures/floors/wood_planks_11_1k/wood_planks_11_normal_gl_1k.png",
      aorm: "/textures/floors/wood_planks_11_1k/wood_planks_11_ao_r_m_h_1k.png",
    },
    material: {
      roughness: 0.7,
      metalness: 0.0,
    },
  },
  industrialConcrete: {
    id: "industrialConcrete",
    name: "Premium Concrete",
    description: '"Premium" concrete slabbing',
    textures: {
      baseColor:
        "/textures/floors/concrete_slabs_04_1k/concrete_slabs_04_basecolor_1k.png",
      normal:
        "/textures/floors/concrete_slabs_04_1k/concrete_slabs_04_normal_gl_1k.png",
      aorm: "/textures/floors/concrete_slabs_04_1k/aorm_rgb.png",
    },
    material: {
      roughness: 0.8,
      metalness: 0.0,
    },
  },
  rusticWood: {
    id: "rusticWood",
    name: "Rustic Wood",
    description: "Weathered wooden planks with vintage charm",
    textures: {
      baseColor:
        "/textures/floors/wood_planks_05_1k/wood_planks_05_color_1k.png",
      normal:
        "/textures/floors/wood_planks_05_1k/wood_planks_05_normal_gl_1k.png",
      aorm: "/textures/floors/wood_planks_05_1k/aorm_rgb.png",
    },
    material: {
      roughness: 0.75,
      metalness: 0.0,
    },
  },
  ceramicTiles: {
    id: "ceramicTiles",
    name: "Ceramic Tiles",
    description: "Glossy ceramic tiles for a clean, professional look",
    textures: {
      baseColor:
        "/textures/floors/floor_tiles_03_1k/floor_tiles_03_Base_Color_1k.png",
      normal:
        "/textures/floors/floor_tiles_03_1k/floor_tiles_03_Normal_gl_1k.png",
      aorm: "/textures/floors/floor_tiles_03_1k/floor_tiles_03_ao_r_m_h_1k.png",
    },
    material: {
      roughness: 0.3,
      metalness: 0.0,
    },
  },
  mosaicTiles: {
    id: "mosaicTiles",
    name: "Mosaic Tiles",
    description: "Decorative mosaic pattern tiles with intricate designs",
    textures: {
      baseColor:
        "/textures/floors/floor_tiles_07_1k/floor_tiles_07_baseColor_1k.png",
      normal:
        "/textures/floors/floor_tiles_07_1k/floor_tiles_07_normal_gl_1k.png",
      aorm: "/textures/floors/floor_tiles_07_1k/aorm_rgb.png",
    },
    material: {
      roughness: 0.4,
      metalness: 0.0,
    },
    unlockRequirement: {
      type: "money",
      value: 5000,
    },
  },
  hexagonTiles: {
    id: "hexagonTiles",
    name: "Hexagon Tiles",
    description: "Modern hexagonal tiles for a contemporary aesthetic",
    textures: {
      baseColor:
        "/textures/floors/floor_tiles_13_1k/floor_tiles_13_basecolor_1k.png",
      normal:
        "/textures/floors/floor_tiles_13_1k/floor_tiles_13_normal_gl_1k.png",
      aorm: "/textures/floors/floor_tiles_13_1k/aorm_rgb.png",
    },
    material: {
      roughness: 0.5,
      metalness: 0.0,
    },
    unlockRequirement: {
      type: "money",
      value: 8000,
    },
  },
  patioStones: {
    id: "patioStones",
    name: "Patio Stones",
    description: "Natural stone tiles perfect for outdoor-themed areas",
    textures: {
      baseColor:
        "/textures/floors/ground_tiles_02_1k/ground_tiles_02_color_1k.png",
      normal:
        "/textures/floors/ground_tiles_02_1k/ground_tiles_02_normal_gl_1k.png",
      aorm: "/textures/floors/ground_tiles_02_1k/aorm_rgb.png",
    },
    material: {
      roughness: 0.85,
      metalness: 0.0,
    },
  },
  brickPavers: {
    id: "brickPavers",
    name: "Brick Pavers",
    description: "Classic brick pavement with timeless appeal",
    textures: {
      baseColor:
        "/textures/floors/ground_tiles_15_1k/ground_tiles_15_color_1k.png",
      normal:
        "/textures/floors/ground_tiles_15_1k/ground_tiles_15_normal_gl_1k.png",
      aorm: "/textures/floors/ground_tiles_15_1k/aorm_rgb.png",
    },
    material: {
      roughness: 0.4,
      metalness: 0.0,
    },
    unlockRequirement: {
      type: "money",
      value: 3000,
    },
  },
};

// Helper functions
export const getFloorStyle = (id: string): FloorStyle | undefined => {
  return FLOOR_STYLES[id];
};

export const getAvailableFloorStyles = (): FloorStyle[] => {
  return Object.values(FLOOR_STYLES);
};

export const getUnlockedFloorStyles = (
  unlockedItems: Set<string>,
  playerMoney: number,
  playerReputation: number,
): FloorStyle[] => {
  return getAvailableFloorStyles().filter((style) => {
    if (!style.unlockRequirement) return true; // Always available

    const { type, value } = style.unlockRequirement;

    switch (type) {
      case "money":
        return playerMoney >= (value as number);
      case "reputation":
        return playerReputation >= (value as number);
      case "objective":
        return unlockedItems.has(value as string);
      default:
        return false;
    }
  });
};
