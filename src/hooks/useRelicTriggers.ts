import { useEffect } from "react";

export function useRelicTriggers() {
  const relics = useRelicStore((state) => state.relics);

  // Subscribe to combat events
  useEffect(() => {
    const unsubscribe = useCombatStore.subscribe(
      (state) => state.turn,
      (turn) => {
        // Trigger turn-based relics
        relics.forEach((relic) => {
          if (relic.id === "happy_flower" && turn % 3 === 0) {
            useCombatStore.getState().gainEnergy(1);
          }
        });
      },
    );

    return unsubscribe;
  }, [relics]);

  // Subscribe to card plays
  useEffect(() => {
    const unsubscribe = useDeckStore.subscribe(
      (state) => state.cardsPlayedThisTurn,
      (cards) => {
        const lastCard = cards[cards.length - 1];
        if (!lastCard) return;

        relics.forEach((relic) => {
          // Kunai - Every 3 attacks, gain 1 Dexterity
          if (relic.id === "kunai" && lastCard.type === "attack") {
            const newCounter = (relic.counter || 0) + 1;
            useRelicStore.getState().updateRelicCounter("kunai", newCounter);

            if (newCounter >= 3) {
              useCombatStore.getState().applyPower("dexterity", 1);
              useRelicStore.getState().updateRelicCounter("kunai", 0);
            }
          }
        });
      },
    );

    return unsubscribe;
  }, [relics]);
}
