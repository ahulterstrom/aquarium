import { Card, Relic } from "@/lib/types";

interface UnlockStore {
  // Character unlocks
  unlockedCharacters: Set<string>;

  // Card unlocks per character
  unlockedCards: Record<string, Set<string>>;
  seenCards: Record<string, Set<string>>;

  // Relic unlocks
  unlockedRelics: Set<string>;
  seenRelics: Set<string>;

  // Ascension levels
  ascensionLevels: Record<string, number>;

  // Actions
  unlockCharacter: (character: string) => void;
  unlockCard: (character: string, cardId: string) => void;
  unlockRelic: (relicId: string) => void;
  increaseAscension: (character: string) => void;

  // Queries
  getAvailableCards: (character: string, rarity: string) => Card[];
  getAvailableRelics: (rarity: string) => Relic[];
}
