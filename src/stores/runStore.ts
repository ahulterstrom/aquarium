interface RunStore {
  // Run metadata
  runId: string;
  characterClass: "ironclad" | "silent" | "defect" | "watcher";
  ascensionLevel: number;
  seed: string;
  startTime: number;

  // Run progress
  currentAct: 1 | 2 | 3 | 4;
  currentFloor: number;
  currentRoom: RoomType;

  // Run statistics
  floorReached: number;
  elitesKilled: number;
  enemiesKilled: number;
  cardsAdded: number;
  cardsRemoved: number;
  cardsPurged: number;

  // Actions
  startNewRun: (character: string, ascension: number, seed?: string) => void;
  endRun: (victory: boolean) => void;
  abandonRun: () => void;
}
