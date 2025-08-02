interface StatisticsStore {
  // Global stats
  totalRuns: number;
  totalVictories: number;
  totalPlaytime: number;

  // Per character stats
  characterStats: Record<string, CharacterStats>;

  // Records
  highestAscension: Record<string, number>;
  fastestVictory: number | null;
  highestScore: number;

  // Achievements
  achievements: Set<string>;

  // Actions
  recordRunStats: (runData: RunData) => void;
  unlockAchievement: (achievementId: string) => void;
}

interface CharacterStats {
  runs: number;
  victories: number;
  bestScore: number;
  favoriteCard: string;
  favoriteRelic: string;
}
