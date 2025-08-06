import { CoinSystem } from "../../systems/CoinSystem";
import { Coin } from "../../types/game.types";
import { useGameStore } from "../../stores/gameStore";

let coinSystemInstance: CoinSystem | null = null;

export function initializeCoinSystem(
  onCoinCollected?: (coin: Coin) => void,
): CoinSystem {
  if (!coinSystemInstance) {
    coinSystemInstance = new CoinSystem(
      onCoinCollected,
      (coin: Coin) => useGameStore.getState().addCoin(coin),
      (id: string) => useGameStore.getState().removeCoin(id),
      () => useGameStore.getState().coins,
    );
  }
  return coinSystemInstance;
}

export function getCoinSystem(): CoinSystem {
  if (!coinSystemInstance) {
    throw new Error(
      "CoinSystem not initialized. Call initializeCoinSystem() first.",
    );
  }
  return coinSystemInstance;
}
