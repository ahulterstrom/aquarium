// Visitor name generation system for aquarium tycoon

interface NamePool {
  maleFirstNames: string[];
  femaleFirstNames: string[];
  lastNames: string[];
  aquariumThemed?: string[];
}

// Curated name lists - easily expandable
const NAME_POOLS: NamePool = {
  // Male first names
  maleFirstNames: [
    'James', 'John', 'Robert', 'Michael', 'William', 'David', 'Richard', 'Joseph',
    'Thomas', 'Christopher', 'Daniel', 'Matthew', 'Andrew', 'Paul', 'Mark', 'George',
    'Steven', 'Brian', 'Edward', 'Ronald', 'Anthony', 'Kevin', 'Jason', 'Jeff',
    'Frank', 'Scott', 'Eric', 'Stephen', 'Ryan', 'Justin', 'Nicholas', 'Samuel',
    'Benjamin', 'Nathan', 'Alexander', 'Tyler', 'Dylan', 'Ethan', 'Aaron', 'Jack'
  ],
  
  // Female first names
  femaleFirstNames: [
    'Mary', 'Patricia', 'Jennifer', 'Linda', 'Elizabeth', 'Barbara', 'Susan', 'Jessica',
    'Sarah', 'Karen', 'Nancy', 'Betty', 'Helen', 'Sandra', 'Donna', 'Carol',
    'Ruth', 'Sharon', 'Michelle', 'Laura', 'Emily', 'Kimberly', 'Deborah', 'Amy',
    'Angela', 'Ashley', 'Emma', 'Olivia', 'Sophia', 'Isabella', 'Charlotte', 'Mia',
    'Harper', 'Evelyn', 'Abigail', 'Ella', 'Scarlett', 'Grace', 'Victoria', 'Riley'
  ],
  
  // Common surnames
  lastNames: [
    'Johnson', 'Smith', 'Brown', 'Davis', 'Wilson', 'Garcia', 'Martinez',
    'Anderson', 'Taylor', 'Thomas', 'Jackson', 'White', 'Harris', 'Martin',
    'Thompson', 'Moore', 'Young', 'Allen', 'King', 'Wright', 'Lopez',
    'Hill', 'Scott', 'Green', 'Adams', 'Baker', 'Nelson', 'Carter', 'Mitchell'
  ],
  
  // Optional: Aquarium-themed names for special visitors
  aquariumThemed: [
    'Captain Nemo', 'Pearl Diver', 'Sea Explorer', 'Wave Rider', 'Coral Hunter',
    'Deep Blue', 'Marina Star', 'Ocean Dreamer', 'Reef Walker', 'Tide Turner',
    'Shell Seeker', 'Aqua Adventurer', 'Marine Biologist', 'Fish Whisperer',
    'Saltwater Sam', 'Kelp Forest Kate', 'Submarine Sue', 'Dolphin Dan'
  ]
};

// Track used names to avoid immediate duplicates
const recentNames = new Set<string>();
const MAX_RECENT_NAMES = 100; // Remember last 100 names

/**
 * Generate a unique visitor name based on gender
 * @param gender - 'male' or 'female'
 * @param preferThemed - 10% chance to use aquarium-themed names
 */
export function generateVisitorName(gender: 'male' | 'female', preferThemed: boolean = false): string {
  let attempts = 0;
  const maxAttempts = 50;
  
  while (attempts < maxAttempts) {
    let name: string;
    
    // 10% chance for themed names (or if explicitly requested)
    if ((preferThemed || Math.random() < 0.1) && NAME_POOLS.aquariumThemed && NAME_POOLS.aquariumThemed.length > 0) {
      name = getRandomFromArray(NAME_POOLS.aquariumThemed);
    } else {
      // Standard first + last name combination based on gender
      const firstNamePool = gender === 'male' ? NAME_POOLS.maleFirstNames : NAME_POOLS.femaleFirstNames;
      const firstName = getRandomFromArray(firstNamePool);
      const lastName = getRandomFromArray(NAME_POOLS.lastNames);
      name = `${firstName} ${lastName}`;
    }
    
    // Check if we've used this name recently
    if (!recentNames.has(name)) {
      // Add to recent names and manage size
      recentNames.add(name);
      if (recentNames.size > MAX_RECENT_NAMES) {
        const firstEntry = recentNames.values().next().value;
        recentNames.delete(firstEntry);
      }
      return name;
    }
    
    attempts++;
  }
  
  // Fallback: add a number to ensure uniqueness
  const firstNamePool = gender === 'male' ? NAME_POOLS.maleFirstNames : NAME_POOLS.femaleFirstNames;
  const baseName = `${getRandomFromArray(firstNamePool)} ${getRandomFromArray(NAME_POOLS.lastNames)}`;
  const uniqueId = Math.floor(Math.random() * 9999) + 1;
  return `${baseName} #${uniqueId}`;
}

/**
 * Generate a short, friendly visitor nickname (for UI space constraints)
 */
export function generateVisitorNickname(): string {
  const nicknames = [
    'Aqua Fan', 'Fish Lover', 'Sea Visitor', 'Marine Guest', 'Ocean Explorer',
    'Reef Enthusiast', 'Water Watcher', 'Bubble Seeker', 'Tank Inspector',
    'Fin Friend', 'Scale Spotter', 'Current Rider', 'Depth Diver', 'Tide Tourist'
  ];
  
  return getRandomFromArray(nicknames);
}

/**
 * Generate names with personality hints
 */
export function generateVisitorNameWithPersonality(): { name: string; trait: string } {
  const traits = [
    'Curious', 'Excited', 'Calm', 'Enthusiastic', 'Observant', 'Cheerful',
    'Studious', 'Adventurous', 'Peaceful', 'Amazed', 'Thoughtful', 'Joyful'
  ];
  
  return {
    name: generateVisitorName('male'), // Default to male for personality generation
    trait: getRandomFromArray(traits)
  };
}

/**
 * Utility to get random element from array
 */
function getRandomFromArray<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * Add new names to the pool (for future expansion)
 */
export function addNamesToPool(newMaleFirstNames?: string[], newFemaleFirstNames?: string[], newLastNames?: string[], newThemed?: string[]) {
  if (newMaleFirstNames) NAME_POOLS.maleFirstNames.push(...newMaleFirstNames);
  if (newFemaleFirstNames) NAME_POOLS.femaleFirstNames.push(...newFemaleFirstNames);
  if (newLastNames) NAME_POOLS.lastNames.push(...newLastNames);
  if (newThemed && NAME_POOLS.aquariumThemed) NAME_POOLS.aquariumThemed.push(...newThemed);
}

/**
 * Get name pool statistics (for debugging/balancing)
 */
export function getNamePoolStats() {
  return {
    totalMaleFirstNames: NAME_POOLS.maleFirstNames.length,
    totalFemaleFirstNames: NAME_POOLS.femaleFirstNames.length,
    totalLastNames: NAME_POOLS.lastNames.length,
    totalThemedNames: NAME_POOLS.aquariumThemed?.length || 0,
    possibleCombinations: (NAME_POOLS.maleFirstNames.length + NAME_POOLS.femaleFirstNames.length) * NAME_POOLS.lastNames.length,
    recentlyUsedNames: recentNames.size
  };
}