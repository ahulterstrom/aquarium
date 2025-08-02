import { Relic } from "@/lib/types";

interface RelicStore {
  relics: Relic[];

  // Actions
  addRelic: (relic: Relic) => void;
  removeRelic: (relicId: string) => void;
  updateRelicCounter: (relicId: string, value: number) => void;

  // Relic triggers
  triggerRelics: (trigger: RelicTrigger) => void;

  // Queries
  hasRelic: (relicId: string) => boolean;
  getRelicValue: (relicId: string) => number | undefined;
}
