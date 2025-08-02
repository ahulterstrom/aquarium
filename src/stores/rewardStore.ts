import { Card, Enemy, Relic } from "@/lib/types";

interface RewardStore {
  // Current rewards
  pendingRewards: Reward[];
  cardRewardOptions: Card[][];

  // Shop state
  shopCards: ShopItem<Card>[];
  shopRelics: ShopItem<Relic>[];
  shopPotions: ShopItem<Potion>[];
  shopRemoval: { price: number; used: boolean };

  // Actions
  generateCombatRewards: (enemy: Enemy) => void;
  generateEliteRewards: (enemy: Enemy) => void;
  generateBossRewards: (enemy: Enemy) => void;

  claimReward: (rewardIndex: number) => void;
  skipReward: (rewardIndex: number) => void;

  // Shop actions
  buyItem: (itemId: string) => boolean;
  refreshShop: () => void;
}

interface Reward {
  type: "gold" | "card" | "relic" | "potion" | "key";
  amount?: number;
  options?: any[];
}

interface ShopItem<T> {
  item: T;
  price: number;
  sold: boolean;
}
