export interface WallTextureConfig {
  baseColor: string;
  normal: string;
  aorm: string;
}

export interface WallStyle {
  id: string;
  name: string;
  description: string;
  textures: WallTextureConfig;
  material: {
    roughness: number;
    metalness: number;
  };
  unlockRequirement?: {
    type: "money" | "objective" | "reputation";
    value: string | number;
  };
}

export const WALL_STYLES: Record<string, WallStyle> = {
  // oldPaintedConcrete: {
  //   id: "oldPaintedConcrete",
  //   name: "Old Painted Concrete",
  //   description: "Probably needs a fresh coat of paint",
  //   textures: {
  //     baseColor:
  //       "/textures/walls/concrete_wall_05_1k/concrete_wall_05_color_1k.png",
  //     normal:
  //       "/textures/walls/concrete_wall_05_1k/concrete_wall_05_normal_gl_1k.png",
  //     aorm: "/textures/walls/concrete_wall_05_1k/aorm_rgb.png",
  //   },
  //   material: {
  //     roughness: 0.9,
  //     metalness: 0.0,
  //   },
  // },
  whiteBrick: {
    id: "whiteBrick",
    name: "White Bricks",
    description: "Clean white brick walls for a classic look",
    textures: {
      baseColor:
        "/textures/walls/white_bricks_wall_01_1k/white_bricks_wall_01_color_1k.png",
      normal:
        "/textures/walls/white_bricks_wall_01_1k/white_bricks_wall_01_normal_gl_1k.png",
      aorm: "/textures/walls/white_bricks_wall_01_1k/aorm_rgb.png",
    },
    material: {
      roughness: 0.7,
      metalness: 0.0,
    },
    unlockRequirement: {
      type: "money",
      value: 50,
    },
  },
  concrete: {
    id: "concrete",
    name: "Concrete",
    description: "Simple and effective concrete walls",
    textures: {
      baseColor:
        "/textures/walls/concrete_wall_04_1k/concrete_wall_04_color_1k.png",
      normal:
        "/textures/walls/concrete_wall_04_1k/concrete_wall_04_normal_gl_1k.png",
      aorm: "/textures/walls/concrete_wall_04_1k/aorm_rgb.png",
    },
    material: {
      roughness: 0.5,
      metalness: 0.0,
    },
  },
  tiles: {
    id: "tiles",
    name: "Tiles",
    description: "Colorful and vibrant tile walls",
    textures: {
      baseColor:
        "/textures/walls/concrete_tiles_01_1k/concrete_tiles_01_color_1k.png",
      normal:
        "/textures/walls/concrete_tiles_01_1k/concrete_tiles_01_normal_gl_1k.png",
      aorm: "/textures/walls/concrete_tiles_01_1k/aorm_rgb.png",
    },
    material: {
      roughness: 0.3,
      metalness: 0.0,
    },
  },
  bricks: {
    id: "bricks",
    name: "Bricks",
    description: "Classic red brick walls",
    textures: {
      baseColor:
        "/textures/walls/bricks_wall_05_1k/bricks_wall_05_color_1k.png",
      normal:
        "/textures/walls/bricks_wall_05_1k/bricks_wall_05_normal_gl_1k.png",
      aorm: "/textures/walls/bricks_wall_05_1k/aorm_rgb.png",
    },
    material: {
      roughness: 0.7,
      metalness: 0.0,
    },
  },
  metal: {
    id: "metal",
    name: "Metal",
    description: "A little rust never hurt anyone",
    textures: {
      baseColor: "/textures/walls/metal_03_1k/metal_03_color_1k.png",
      normal: "/textures/walls/metal_03_1k/metal_03_normal_gl_1k.png",
      aorm: "/textures/walls/metal_03_1k/aorm_rgb.png",
    },
    material: {
      roughness: 0.2,
      metalness: 1.0,
    },
  },
};

// Helper functions
export const getWallStyle = (id: string): WallStyle | undefined => {
  return WALL_STYLES[id];
};

export const getAvailableWallStyles = (): WallStyle[] => {
  return Object.values(WALL_STYLES);
};

export const getUnlockedWallStyles = (
  unlockedItems: Set<string>,
  playerMoney: number,
  playerReputation: number,
): WallStyle[] => {
  return getAvailableWallStyles().filter((style) => {
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
