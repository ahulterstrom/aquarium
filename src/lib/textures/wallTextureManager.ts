import * as THREE from "three";
import { WallTextureConfig } from "../constants/walls";

export interface WallTextures {
  baseColor: THREE.Texture;
  normal: THREE.Texture;
  aorm: THREE.Texture; // Ambient Occlusion + Roughness + Metalness
}

export class WallTextureManager {
  private static instance: WallTextureManager;
  private textureCache = new Map<string, WallTextures>();
  private loader = new THREE.TextureLoader();
  private loadingPromises = new Map<string, Promise<WallTextures>>();

  static getInstance(): WallTextureManager {
    if (!WallTextureManager.instance) {
      WallTextureManager.instance = new WallTextureManager();
    }
    return WallTextureManager.instance;
  }

  private constructor() {}

  private configureTexture(texture: THREE.Texture, isBaseColor = false): void {
    // Walls typically need different repeat values than floors
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(2, 2); // Adjust based on wall height/width
    
    if (isBaseColor) {
      texture.colorSpace = THREE.SRGBColorSpace;
    }
    
    // Set anisotropy for better quality
    texture.anisotropy = Math.min(8, texture.anisotropy || 1);
  }

  async loadWallTextures(styleId: string, config: WallTextureConfig): Promise<WallTextures> {
    // Check cache first
    if (this.textureCache.has(styleId)) {
      return this.textureCache.get(styleId)!;
    }

    // Check if already loading
    if (this.loadingPromises.has(styleId)) {
      return this.loadingPromises.get(styleId)!;
    }

    // Start loading
    const loadingPromise = this.doLoadTextures(config);
    this.loadingPromises.set(styleId, loadingPromise);

    try {
      const textures = await loadingPromise;
      this.textureCache.set(styleId, textures);
      this.loadingPromises.delete(styleId);
      return textures;
    } catch (error) {
      this.loadingPromises.delete(styleId);
      throw error;
    }
  }

  private async doLoadTextures(config: WallTextureConfig): Promise<WallTextures> {
    const [baseColor, normal, aorm] = await Promise.all([
      this.loadSingleTexture(config.baseColor, true),
      this.loadSingleTexture(config.normal, false),
      this.loadSingleTexture(config.aorm, false),
    ]);

    return { baseColor, normal, aorm };
  }

  private loadSingleTexture(url: string, isBaseColor: boolean): Promise<THREE.Texture> {
    return new Promise((resolve, reject) => {
      this.loader.load(
        url,
        (texture) => {
          this.configureTexture(texture, isBaseColor);
          resolve(texture);
        },
        undefined,
        reject
      );
    });
  }

  getWallTextures(styleId: string): WallTextures | null {
    return this.textureCache.get(styleId) || null;
  }

  preloadWallStyles(styles: Record<string, WallTextureConfig>): Promise<void[]> {
    const promises = Object.entries(styles).map(([styleId, config]) =>
      this.loadWallTextures(styleId, config).catch(console.error)
    );
    return Promise.all(promises);
  }

  dispose(styleId?: string): void {
    if (styleId) {
      const textures = this.textureCache.get(styleId);
      if (textures) {
        Object.values(textures).forEach(texture => texture.dispose());
        this.textureCache.delete(styleId);
      }
    } else {
      // Dispose all
      this.textureCache.forEach(textures => {
        Object.values(textures).forEach(texture => texture.dispose());
      });
      this.textureCache.clear();
    }
  }

  getCacheSize(): number {
    return this.textureCache.size;
  }
}