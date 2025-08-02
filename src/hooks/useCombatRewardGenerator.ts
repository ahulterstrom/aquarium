export function useCardRewardGenerator() {
  const characterClass = useRunStore((state) => state.characterClass);
  const seenCards = useUnlockStore((state) => state.seenCards[characterClass]);
  const currentAct = useRunStore((state) => state.currentAct);
  const getRNG = useRNG({ category: "rewards", subcategory: "cards" });

  const generateCardReward = useCallback(
    (rarity: "common" | "uncommon" | "rare") => {
      const rng = getRNG();
      const availableCards = getCardPool(characterClass, rarity, seenCards);

      // Higher acts have better upgraded chance
      const upgradeChance = 0.1 + (currentAct - 1) * 0.15;

      const options: Card[] = [];
      for (let i = 0; i < 3; i++) {
        const card = rng.pick(availableCards);
        const upgraded = rng.nextBoolean(upgradeChance);

        options.push({
          ...card,
          upgraded,
        });
      }

      return options;
    },
    [characterClass, seenCards, currentAct, getRNG],
  );

  return generateCardReward;
}
