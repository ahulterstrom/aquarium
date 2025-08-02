import { Card, Enemy, Power } from "@/lib/types";

interface CombatStore {
  // Combat state
  inCombat: boolean;
  turn: number;

  // Energy
  energy: number;
  maxEnergy: number;

  // Player combat state
  block: number;
  powers: Power[];
  orbs: Orb[]; // for Defect
  stance: "neutral" | "wrath" | "calm" | "divinity"; // for Watcher

  // Enemies
  enemies: Enemy[];
  targetedEnemy: string | null;

  // Combat history
  combatLog: CombatLogEntry[];
  cardsPlayedThisTurn: Card[];
  cardsPlayedThisCombat: Card[];

  // Actions
  startCombat: (enemies: Enemy[]) => void;
  endTurn: () => void;
  endCombat: (victory: boolean) => void;

  // Energy management
  gainEnergy: (amount: number) => void;
  spendEnergy: (amount: number) => boolean;

  // Block and damage
  gainBlock: (amount: number) => void;
  loseBlock: (amount: number) => void;

  // Power management
  applyPower: (powerId: string, amount: number, targetId?: string) => void;
  removePower: (powerId: string, targetId?: string) => void;

  // Targeting
  setTarget: (enemyId: string | null) => void;
  getValidTargets: (targetType: TargetType) => string[];
}
