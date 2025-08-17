import * as THREE from "three";

export interface FloorTextures {
  baseColor: THREE.Texture;
  normal: THREE.Texture;
  aorm: THREE.Texture; // Ambient Occlusion + Roughness + Metalness
}

export interface FloorTextureConfig {
  baseColor: string;
  normal: string;
  aorm: string;
}

export class FloorTextureManager {
  private static instance: FloorTextureManager;
  private textureCache = new Map<string, FloorTextures>();
  private loader = new THREE.TextureLoader();
  private loadingPromises = new Map<string, Promise<FloorTextures>>();

  static getInstance(): FloorTextureManager {
    if (!FloorTextureManager.instance) {
      FloorTextureManager.instance = new FloorTextureManager();
    }
    return FloorTextureManager.instance;
  }

  private constructor() {}

  private configureTexture(texture: THREE.Texture, isBaseColor = false): void {
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(1, 1);
    
    if (isBaseColor) {
      texture.colorSpace = THREE.SRGBColorSpace;
    }
    
    // Set anisotropy for better quality
    texture.anisotropy = Math.min(8, texture.anisotropy || 1);
  }

  async loadFloorTextures(styleId: string, config: FloorTextureConfig): Promise<FloorTextures> {
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

  private async doLoadTextures(config: FloorTextureConfig): Promise<FloorTextures> {
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

  getFloorTextures(styleId: string): FloorTextures | null {
    return this.textureCache.get(styleId) || null;
  }

  preloadFloorStyles(styles: Record<string, FloorTextureConfig>): Promise<void[]> {
    const promises = Object.entries(styles).map(([styleId, config]) =>
      this.loadFloorTextures(styleId, config).catch(console.error)
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