interface PlayerRunStore {
  // Resources
  hp: number;
  maxHp: number;
  gold: number;

  // Potions
  potions: (Potion | null)[];
  maxPotions: number;

  // Run modifiers
  bonusStrength: number; // from events/relics
  bonusDexterity: number;
  bonusMaxHp: number;

  // Actions
  heal: (amount: number) => void;
  takeDamage: (amount: number) => void;
  spendGold: (amount: number) => boolean;
  addPotion: (potion: Potion) => boolean;
  usePotion: (slotIndex: number, targetId?: string) => void;
}
