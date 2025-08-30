import * as THREE from "three";

class CoinInteractionManager {
  private coinMeshes = new Map<string, THREE.Object3D>();
  private coinCallbacks = new Map<string, () => void>();
  private clickCallbacks = new Set<(coinId: string) => void>();

  registerMesh(coinId: string, mesh: THREE.Object3D) {
    this.coinMeshes.set(coinId, mesh);
  }

  unregisterMesh(coinId: string) {
    this.coinMeshes.delete(coinId);
  }

  registerCallback(coinId: string, callback: () => void) {
    this.coinCallbacks.set(coinId, callback);
  }

  unregisterCallback(coinId: string) {
    this.coinCallbacks.delete(coinId);
  }

  getCoinMeshes() {
    return Array.from(this.coinMeshes.values());
  }

  findCoinIdFromMesh(intersectedObject: THREE.Object3D): string | null {
    for (const [coinId, hitboxMesh] of this.coinMeshes) {
      if (intersectedObject === hitboxMesh) {
        return coinId;
      }
    }
    return null;
  }

  addClickCallback(callback: (coinId: string) => void) {
    this.clickCallbacks.add(callback);
  }

  removeClickCallback(callback: (coinId: string) => void) {
    this.clickCallbacks.delete(callback);
  }

  handleCoinClick(coinId: string) {
    // Trigger the coin's animation
    const coinCallback = this.coinCallbacks.get(coinId);
    if (coinCallback) {
      coinCallback();
    }
    
    // Notify click handlers (for money/game logic)
    this.clickCallbacks.forEach(callback => callback(coinId));
  }
}

export const coinInteractionManager = new CoinInteractionManager();