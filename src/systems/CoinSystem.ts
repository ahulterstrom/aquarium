import * as THREE from "three";
import { Coin } from "../types/game.types";
import { nanoid } from "nanoid";

export class CoinSystem {
  private onCoinCollected?: (coin: Coin) => void;
  private addCoinToStore?: (coin: Coin) => void;
  private removeCoinFromStore?: (id: string) => void;
  private getCoinsFromStore?: () => Map<string, Coin>;

  constructor(
    onCoinCollected?: (coin: Coin) => void,
    addCoinToStore?: (coin: Coin) => void,
    removeCoinFromStore?: (id: string) => void,
    getCoinsFromStore?: () => Map<string, Coin>
  ) {
    this.onCoinCollected = onCoinCollected;
    this.addCoinToStore = addCoinToStore;
    this.removeCoinFromStore = removeCoinFromStore;
    this.getCoinsFromStore = getCoinsFromStore;
  }

  /**
   * Drop a coin at the specified position
   */
  dropCoin(position: THREE.Vector3, value: number = 1, droppedByVisitorId: string): Coin {
    const coin: Coin = {
      id: `coin_${nanoid()}`,
      position: position.clone(),
      value,
      createdAt: Date.now(),
      droppedByVisitorId,
    };

    if (this.addCoinToStore) {
      this.addCoinToStore(coin);
    }
    console.log(`Coin dropped at (${position.x.toFixed(2)}, ${position.z.toFixed(2)}) by visitor ${droppedByVisitorId}`);
    return coin;
  }

  /**
   * Collect a coin by its ID
   */
  collectCoin(coinId: string): Coin | null {
    const coins = this.getCoinsFromStore ? this.getCoinsFromStore() : new Map();
    const coin = coins.get(coinId);
    if (!coin) return null;

    if (this.removeCoinFromStore) {
      this.removeCoinFromStore(coinId);
    }
    console.log(`Coin collected: +${coin.value} money`);
    
    if (this.onCoinCollected) {
      this.onCoinCollected(coin);
    }

    return coin;
  }

  /**
   * Update the coin system - handle auto-despawn
   */
  update(currentTime: number) {
    const despawnTime = 30000; // 30 seconds in milliseconds
    const coins = this.getCoinsFromStore ? this.getCoinsFromStore() : new Map();

    for (const [coinId, coin] of coins.entries()) {
      if (currentTime - coin.createdAt > despawnTime) {
        console.log(`Coin ${coinId} despawned after 30 seconds`);
        if (this.removeCoinFromStore) {
          this.removeCoinFromStore(coinId);
        }
      }
    }
  }

  /**
   * Get all active coins
   */
  getCoins(): Coin[] {
    const coins = this.getCoinsFromStore ? this.getCoinsFromStore() : new Map();
    return Array.from(coins.values());
  }

  /**
   * Get a specific coin by ID
   */
  getCoin(coinId: string): Coin | null {
    const coins = this.getCoinsFromStore ? this.getCoinsFromStore() : new Map();
    return coins.get(coinId) || null;
  }

  /**
   * Clear all coins (for reset/cleanup)
   */
  clearAllCoins() {
    const coins = this.getCoinsFromStore ? this.getCoinsFromStore() : new Map();
    for (const coinId of coins.keys()) {
      if (this.removeCoinFromStore) {
        this.removeCoinFromStore(coinId);
      }
    }
  }

  /**
   * Get total number of active coins
   */
  getCoinCount(): number {
    const coins = this.getCoinsFromStore ? this.getCoinsFromStore() : new Map();
    return coins.size;
  }
}