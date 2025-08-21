import { CharacterModel } from "@/types/character.types";

export const CHARACTER_MODELS: Record<string, CharacterModel> = {
  cowboy_hair: {
    id: "cowboy_hair",
    name: "Cowboy with Hair",
    path: "/visitors/Cowboy_Hair.gltf",
    gender: "male",
    tags: ["western", "casual", "adventurer"],
    animations: {
      idle: "Idle",
      walk: "Walk",
      run: "Run",
      viewing: "Idle",
    },
  },
  casual_female: {
    id: "casual_female",
    name: "Casual Female",
    path: "/visitors/Casual_Female.gltf",
    gender: "female",
    tags: ["casual", "modern"],
    animations: {
      idle: "Idle",
      walk: "Walk",
      run: "Run",
      viewing: "Idle",
    },
  },
  casual_male: {
    id: "casual_male",
    name: "Casual Male",
    path: "/visitors/Casual_Male.gltf",
    gender: "male",
    tags: ["casual", "modern"],
    animations: {
      idle: "Idle",
      walk: "Walk",
      run: "Run",
      viewing: "Idle",
    },
  },
  suit_female: {
    id: "suit_female",
    name: "Business Woman",
    path: "/visitors/Suit_Female.gltf",
    gender: "female",
    tags: ["formal", "business", "professional"],
    animations: {
      idle: "Idle",
      walk: "Walk",
      run: "Run",
      viewing: "Idle",
    },
  },
  suit_male: {
    id: "suit_male",
    name: "Business Man",
    path: "/visitors/Suit_Male.gltf",
    gender: "male",
    tags: ["formal", "business", "professional"],
    animations: {
      idle: "Idle",
      walk: "Walk",
      run: "Run",
      viewing: "Idle",
    },
  },
  doctor_female_young: {
    id: "doctor_female_young",
    name: "Young Doctor (Female)",
    path: "/visitors/Doctor_Female_Young.gltf",
    gender: "female",
    tags: ["medical", "professional", "young"],
    animations: {
      idle: "Idle",
      walk: "Walk",
      run: "Run",
      viewing: "Idle",
    },
  },
  doctor_male_young: {
    id: "doctor_male_young",
    name: "Young Doctor (Male)",
    path: "/visitors/Doctor_Male_Young.gltf",
    gender: "male",
    tags: ["medical", "professional", "young"],
    animations: {
      idle: "Idle",
      walk: "Walk",
      run: "Run",
      viewing: "Idle",
    },
  },
  chef_female: {
    id: "chef_female",
    name: "Female Chef",
    path: "/visitors/Chef_Female.gltf",
    gender: "female",
    tags: ["culinary", "worker", "casual"],
    animations: {
      idle: "Idle",
      walk: "Walk",
      run: "Run",
      viewing: "Idle",
    },
  },
  chef_male: {
    id: "chef_male",
    name: "Male Chef",
    path: "/visitors/Chef_Male.gltf",
    gender: "male",
    tags: ["culinary", "worker", "casual"],
    animations: {
      idle: "Idle",
      walk: "Walk",
      run: "Run",
      viewing: "Idle",
    },
  },
  ninja_male: {
    id: "ninja_male",
    name: "Male Ninja",
    path: "/visitors/Ninja_Male.gltf",
    gender: "male",
    tags: ["warrior", "stealth", "fantasy"],
    animations: {
      idle: "Idle",
      walk: "Walk",
      run: "Run",
      viewing: "Idle",
    },
  },
  ninja_female: {
    id: "ninja_female",
    name: "Female Ninja",
    path: "/visitors/Ninja_Female.gltf",
    gender: "female",
    tags: ["warrior", "stealth", "fantasy"],
    animations: {
      idle: "Idle",
      walk: "Walk",
      run: "Run",
      viewing: "Idle",
    },
  },
  old_classy_female: {
    id: "old_classy_female",
    name: "Elegant Elder (Female)",
    path: "/visitors/OldClassy_Female.gltf",
    gender: "female",
    tags: ["elegant", "elderly", "formal"],
    animations: {
      idle: "Idle",
      walk: "Walk",
      run: "Run",
      viewing: "Idle",
    },
  },
  old_classy_male: {
    id: "old_classy_male",
    name: "Distinguished Gentleman",
    path: "/visitors/OldClassy_Male.gltf",
    gender: "male",
    tags: ["elegant", "elderly", "formal"],
    animations: {
      idle: "Idle",
      walk: "Walk",
      run: "Run",
      viewing: "Idle",
    },
  },
  worker_female: {
    id: "worker_female",
    name: "Female Worker",
    path: "/visitors/Worker_Female.gltf",
    gender: "female",
    tags: ["worker", "blue_collar", "casual"],
    animations: {
      idle: "Idle",
      walk: "Walk",
      run: "Run",
      viewing: "Idle",
    },
  },
  worker_male: {
    id: "worker_male",
    name: "Male Worker",
    path: "/visitors/Worker_Male.gltf",
    gender: "male",
    tags: ["worker", "blue_collar", "casual"],
    animations: {
      idle: "Idle",
      walk: "Walk",
      run: "Run",
      viewing: "Idle",
    },
  },
  casual2_female: {
    id: "casual2_female",
    name: "Casual Female 2",
    path: "/visitors/Casual2_Female.gltf",
    gender: "female",
    tags: ["casual", "modern", "young"],
    animations: {
      idle: "Idle",
      walk: "Walk",
      run: "Run",
      viewing: "Idle",
    },
  },
  casual2_male: {
    id: "casual2_male",
    name: "Casual Male 2",
    path: "/visitors/Casual2_Male.gltf",
    gender: "male",
    tags: ["casual", "modern", "young"],
    animations: {
      idle: "Idle",
      walk: "Walk",
      run: "Run",
      viewing: "Idle",
    },
  },
  casual3_female: {
    id: "casual3_female",
    name: "Casual Female 3",
    path: "/visitors/Casual3_Female.gltf",
    gender: "female",
    tags: ["casual", "modern", "sporty"],
    animations: {
      idle: "Idle",
      walk: "Walk",
      run: "Run",
      viewing: "Idle",
    },
  },
  casual3_male: {
    id: "casual3_male",
    name: "Casual Male 3",
    path: "/visitors/Casual3_Male.gltf",
    gender: "male",
    tags: ["casual", "modern", "sporty"],
    animations: {
      idle: "Idle",
      walk: "Walk",
      run: "Run",
      viewing: "Idle",
    },
  },
  kimono_female: {
    id: "kimono_female",
    name: "Traditional Female",
    path: "/visitors/Kimono_Female.gltf",
    gender: "female",
    tags: ["traditional", "cultural", "elegant"],
    animations: {
      idle: "Idle",
      walk: "Walk",
      run: "Run",
      viewing: "Idle",
    },
  },
  kimono_male: {
    id: "kimono_male",
    name: "Traditional Male",
    path: "/visitors/Kimono_Male.gltf",
    gender: "male",
    tags: ["traditional", "cultural", "elegant"],
    animations: {
      idle: "Idle",
      walk: "Walk",
      run: "Run",
      viewing: "Idle",
    },
  },
  // pirate_female: {
  //   id: "pirate_female",
  //   name: "Female Pirate",
  //   path: "/visitors/Pirate_Female.gltf",
  //   gender: "female",
  //   tags: ["pirate", "adventurer", "costume"],
  //   animations: {
  //     idle: "Idle",
  //     walk: "Walk",
  //     run: "Run",
  //     viewing: "Idle",
  //   },
  // },
  // pirate_male: {
  //   id: "pirate_male",
  //   name: "Male Pirate",
  //   path: "/visitors/Pirate_Male.gltf",
  //   gender: "male",
  //   tags: ["pirate", "adventurer", "costume"],
  //   animations: {
  //     idle: "Idle",
  //     walk: "Walk",
  //     run: "Run",
  //     viewing: "Idle",
  //   },
  // },
  // knight_golden_male: {
  //   id: "knight_golden_male",
  //   name: "Golden Knight (Male)",
  //   path: "/visitors/Knight_Golden_Male.gltf",
  //   gender: "male",
  //   tags: ["knight", "warrior", "armored", "fantasy"],
  //   animations: {
  //     idle: "Idle",
  //     walk: "Walk",
  //     run: "Run",
  //     viewing: "Idle",
  //   },
  // },
  // knight_golden_female: {
  //   id: "knight_golden_female",
  //   name: "Golden Knight (Female)",
  //   path: "/visitors/Knight_Golden_Female.gltf",
  //   gender: "female",
  //   tags: ["knight", "warrior", "armored", "fantasy"],
  //   animations: {
  //     idle: "Idle",
  //     walk: "Walk",
  //     run: "Run",
  //     viewing: "Idle",
  //   },
  // },
  // knight_male: {
  //   id: "knight_male",
  //   name: "Knight",
  //   path: "/visitors/Knight_Male.gltf",
  //   gender: "male",
  //   tags: ["knight", "warrior", "armored", "fantasy"],
  //   animations: {
  //     idle: "Idle",
  //     walk: "Walk",
  //     run: "Run",
  //     viewing: "Idle",
  //   },
  // },
  viking_female: {
    id: "viking_female",
    name: "Female Viking",
    path: "/visitors/Viking_Female.gltf",
    gender: "female",
    tags: ["viking", "warrior", "nordic", "fantasy"],
    animations: {
      idle: "Idle",
      walk: "Walk",
      run: "Run",
      viewing: "Idle",
    },
  },
  viking_male: {
    id: "viking_male",
    name: "Male Viking",
    path: "/visitors/Viking_Male.gltf",
    gender: "male",
    tags: ["viking", "warrior", "nordic", "fantasy"],
    animations: {
      idle: "Idle",
      walk: "Walk",
      run: "Run",
      viewing: "Idle",
    },
  },
  // viking_helmet: {
  //   id: "viking_helmet",
  //   name: "Viking with Helmet",
  //   path: "/visitors/VikingHelmet.gltf",
  //   gender: "neutral",
  //   tags: ["viking", "warrior", "nordic", "fantasy"],
  //   animations: {
  //     idle: "Idle",
  //     walk: "Walk",
  //     run: "Run",
  //     viewing: "Idle",
  //   },
  // },
  soldier_female: {
    id: "soldier_female",
    name: "Female Soldier",
    path: "/visitors/Soldier_Female.gltf",
    gender: "female",
    tags: ["military", "soldier", "uniform"],
    animations: {
      idle: "Idle",
      walk: "Walk",
      run: "Run",
      viewing: "Idle",
    },
  },
  soldier_male: {
    id: "soldier_male",
    name: "Male Soldier",
    path: "/visitors/Soldier_Male.gltf",
    gender: "male",
    tags: ["military", "soldier", "uniform"],
    animations: {
      idle: "Idle",
      walk: "Walk",
      run: "Run",
      viewing: "Idle",
    },
  },
  blue_soldier_female: {
    id: "blue_soldier_female",
    name: "Blue Soldier (Female)",
    path: "/visitors/BlueSoldier_Female.gltf",
    gender: "female",
    tags: ["military", "soldier", "uniform", "blue"],
    animations: {
      idle: "Idle",
      walk: "Walk",
      run: "Run",
      viewing: "Idle",
    },
  },
  blue_soldier_male: {
    id: "blue_soldier_male",
    name: "Blue Soldier (Male)",
    path: "/visitors/BlueSoldier_Male.gltf",
    gender: "male",
    tags: ["military", "soldier", "uniform", "blue"],
    animations: {
      idle: "Idle",
      walk: "Walk",
      run: "Run",
      viewing: "Idle",
    },
  },
  doctor_female_old: {
    id: "doctor_female_old",
    name: "Senior Doctor (Female)",
    path: "/visitors/Doctor_Female_Old.gltf",
    gender: "female",
    tags: ["medical", "professional", "elderly"],
    animations: {
      idle: "Idle",
      walk: "Walk",
      run: "Run",
      viewing: "Idle",
    },
  },
  doctor_male_old: {
    id: "doctor_male_old",
    name: "Senior Doctor (Male)",
    path: "/visitors/Doctor_Male_Old.gltf",
    gender: "male",
    tags: ["medical", "professional", "elderly"],
    animations: {
      idle: "Idle",
      walk: "Walk",
      run: "Run",
      viewing: "Idle",
    },
  },
  chef_hat: {
    id: "chef_hat",
    name: "Chef with Hat",
    path: "/visitors/Chef_Hat.gltf",
    gender: "neutral",
    tags: ["culinary", "worker", "casual"],
    animations: {
      idle: "Idle",
      walk: "Walk",
      run: "Run",
      viewing: "Idle",
    },
  },
  casual_bald: {
    id: "casual_bald",
    name: "Casual Bald",
    path: "/visitors/Casual_Bald.gltf",
    gender: "neutral",
    tags: ["casual", "modern"],
    animations: {
      idle: "Idle",
      walk: "Walk",
      run: "Run",
      viewing: "Idle",
    },
  },
  // elf: {
  //   id: "elf",
  //   name: "Elf",
  //   path: "/visitors/Elf.gltf",
  //   gender: "neutral",
  //   tags: ["fantasy", "magical", "elf"],
  //   animations: {
  //     idle: "Idle",
  //     walk: "Walk",
  //     run: "Run",
  //     viewing: "Idle",
  //   },
  // },
  // wizard: {
  //   id: "wizard",
  //   name: "Wizard",
  //   path: "/visitors/Wizard.gltf",
  //   gender: "neutral",
  //   tags: ["fantasy", "magical", "wizard"],
  //   animations: {
  //     idle: "Idle",
  //     walk: "Walk",
  //     run: "Run",
  //     viewing: "Idle",
  //   },
  // },
  // witch: {
  //   id: "witch",
  //   name: "Witch",
  //   path: "/visitors/Witch.gltf",
  //   gender: "female",
  //   tags: ["fantasy", "magical", "witch"],
  //   animations: {
  //     idle: "Idle",
  //     walk: "Walk",
  //     run: "Run",
  //     viewing: "Idle",
  //   },
  // },
  // goblin_female: {
  //   id: "goblin_female",
  //   name: "Female Goblin",
  //   path: "/visitors/Goblin_Female.gltf",
  //   gender: "female",
  //   tags: ["fantasy", "creature", "goblin"],
  //   animations: {
  //     idle: "Idle",
  //     walk: "Walk",
  //     run: "Run",
  //     viewing: "Idle",
  //   },
  // },
  // goblin_male: {
  //   id: "goblin_male",
  //   name: "Male Goblin",
  //   path: "/visitors/Goblin_Male.gltf",
  //   gender: "male",
  //   tags: ["fantasy", "creature", "goblin"],
  //   animations: {
  //     idle: "Idle",
  //     walk: "Walk",
  //     run: "Run",
  //     viewing: "Idle",
  //   },
  // },
  // zombie_female: {
  //   id: 'zombie_female',
  //   name: 'Female Zombie',
  //   path: '/visitors/Zombie_Female.gltf',
  //   gender: 'female',
  //   tags: ['fantasy', 'undead', 'zombie'],
  //   animations: {
  //     idle: 'Idle',
  //     walk: 'Walk',
  //     run: 'Run',
  //     viewing: 'Idle',
  //   }
  // },
  // zombie_male: {
  //   id: 'zombie_male',
  //   name: 'Male Zombie',
  //   path: '/visitors/Zombie_Male.gltf',
  //   gender: 'male',
  //   tags: ['fantasy', 'undead', 'zombie'],
  //   animations: {
  //     idle: 'Idle',
  //     walk: 'Walk',
  //     run: 'Run',
  //     viewing: 'Idle',
  //   }
  // }
};

// Helper functions for character selection
export const getCharactersByGender = (
  gender: "male" | "female" | "neutral",
): CharacterModel[] => {
  return Object.values(CHARACTER_MODELS).filter(
    (model) => model.gender === gender || model.gender === "neutral",
  );
};

export const getCharactersByTag = (tag: string): CharacterModel[] => {
  return Object.values(CHARACTER_MODELS).filter((model) =>
    model.tags?.includes(tag),
  );
};

export const getRandomCharacter = (filter?: {
  gender?: "male" | "female" | "neutral";
  tags?: string[];
}): CharacterModel | null => {
  let candidates = Object.values(CHARACTER_MODELS);

  if (filter?.gender) {
    candidates = candidates.filter(
      (model) => model.gender === filter.gender || model.gender === "neutral",
    );
  }

  if (filter?.tags && filter.tags.length > 0) {
    candidates = candidates.filter((model) =>
      model.tags?.some((tag) => filter.tags!.includes(tag)),
    );
  }

  if (candidates.length === 0) return null;

  return candidates[Math.floor(Math.random() * candidates.length)];
};

// Preload list - models to load on game start
export const PRELOAD_CHARACTERS = [
  "cowboy_hair",
  "casual_female",
  "casual_male",
  "suit_female",
  "suit_male",
  "casual2_female",
  "casual2_male",
  "worker_female",
  "worker_male",
];
