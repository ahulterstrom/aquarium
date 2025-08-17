import { FloorTextureConfig } from "../textures/floors/floorTextureManager";

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
  concrete: {
    id: "concrete",
    name: "Concrete",
    description: "Modern industrial concrete flooring",
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
    // unlockRequirement: {
    //   type: "reputation",
    //   value: 50,
    // },
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
