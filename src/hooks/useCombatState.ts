import { useCallback } from "react";

export function useCombatState() {
  const energy = useCombatStore((state) => state.energy);
  const hand = useDeckStore((state) => state.hand);
  const enemies = useCombatStore((state) => state.enemies);
  const turn = useCombatStore((state) => state.turn);

  const canPlayCard = useCallback(
    (cardIndex: number) => {
      const card = hand[cardIndex];
      if (!card) return false;

      // Check energy
      if (card.cost > energy && card.cost !== -1) return false; // -1 = X cost

      // Check if card needs target
      if (card.keywords.includes("targetEnemy") && enemies.length === 0)
        return false;

      // Check special conditions (like Clash requiring no non-attacks)
      if (card.id === "clash") {
        return hand.every((c) => c === card || c.type === "attack");
      }

      return true;
    },
    [hand, energy, enemies],
  );

  return {
    energy,
    hand,
    enemies,
    turn,
    canPlayCard,
  };
}
