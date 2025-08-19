import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { CharacterModel, CharacterModelCache } from '@/types/character.types';
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils.js';

// Type for GLTF result
interface GLTF {
  scene: THREE.Group;
  animations: THREE.AnimationClip[];
  asset?: any;
  parser?: any;
}

export class CharacterModelManager {
  private static instance: CharacterModelManager;
  private loader: GLTFLoader;
  private modelCache: Map<string, CharacterModelCache>;
  private loadingPromises: Map<string, Promise<CharacterModelCache>>;

  private constructor() {
    this.loader = new GLTFLoader();
    this.modelCache = new Map();
    this.loadingPromises = new Map();
  }

  static getInstance(): CharacterModelManager {
    if (!CharacterModelManager.instance) {
      CharacterModelManager.instance = new CharacterModelManager();
    }
    return CharacterModelManager.instance;
  }

  async loadModel(characterModel: CharacterModel): Promise<CharacterModelCache> {
    // Check if already cached
    if (this.modelCache.has(characterModel.id)) {
      return this.modelCache.get(characterModel.id)!;
    }

    // Check if already loading
    if (this.loadingPromises.has(characterModel.id)) {
      return this.loadingPromises.get(characterModel.id)!;
    }

    // Start loading
    const loadingPromise = this.loadGLTF(characterModel);
    this.loadingPromises.set(characterModel.id, loadingPromise);

    try {
      const cache = await loadingPromise;
      this.modelCache.set(characterModel.id, cache);
      this.loadingPromises.delete(characterModel.id);
      return cache;
    } catch (error) {
      this.loadingPromises.delete(characterModel.id);
      throw error;
    }
  }

  private async loadGLTF(characterModel: CharacterModel): Promise<CharacterModelCache> {
    return new Promise((resolve, reject) => {
      this.loader.load(
        characterModel.path,
        (gltf: GLTF) => {
          // Process animations
          const animations = new Map<string, THREE.AnimationClip>();
          console.log(`Found ${gltf.animations.length} animations in ${characterModel.name}:`, gltf.animations.map(clip => clip.name));
          gltf.animations.forEach((clip) => {
            animations.set(clip.name, clip);
          });

          // Process materials for future customization
          const materials = new Map<string, THREE.Material>();
          gltf.scene.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
              const mesh = child as THREE.Mesh;
              if (mesh.material) {
                const mat = mesh.material as THREE.Material;
                if (mat.name) {
                  materials.set(mat.name, mat);
                }
              }
            }
          });

          // Scale the model appropriately
          gltf.scene.scale.set(0.5, 0.5, 0.5); // Adjust based on your needs

          resolve({
            scene: gltf.scene,
            animations,
            materials,
          });
        },
        // Progress callback
        (progress) => {
          console.log(`Loading ${characterModel.name}: ${(progress.loaded / progress.total * 100).toFixed(0)}%`);
        },
        // Error callback
        (error) => {
          console.error(`Failed to load ${characterModel.name}:`, error);
          reject(error);
        }
      );
    });
  }

  // Create a cloned instance of a character model
  createInstance(modelId: string): THREE.Group | null {
    const cache = this.modelCache.get(modelId);
    if (!cache) {
      console.warn(`Model ${modelId} not loaded`);
      return null;
    }

    // Use SkeletonUtils to properly clone animated models
    const clonedScene = SkeletonUtils.clone(cache.scene);
    
    // Ensure shadows are enabled on all meshes
    clonedScene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    return clonedScene;
  }

  // Get animations for a model
  getAnimations(modelId: string): Map<string, THREE.AnimationClip> | null {
    const cache = this.modelCache.get(modelId);
    return cache ? cache.animations : null;
  }

  // Preload a list of models
  async preloadModels(characterModels: CharacterModel[]): Promise<void> {
    const promises = characterModels.map(model => this.loadModel(model));
    await Promise.all(promises);
  }

  // Check if a model is loaded
  isModelLoaded(modelId: string): boolean {
    return this.modelCache.has(modelId);
  }

  // Clear cache for a specific model
  clearModel(modelId: string): void {
    const cache = this.modelCache.get(modelId);
    if (cache) {
      // Dispose of geometries and materials
      cache.scene.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          if (mesh.geometry) mesh.geometry.dispose();
          if (mesh.material) {
            if (Array.isArray(mesh.material)) {
              mesh.material.forEach(mat => mat.dispose());
            } else {
              mesh.material.dispose();
            }
          }
        }
      });
      this.modelCache.delete(modelId);
    }
  }

  // Clear all cached models
  clearAllModels(): void {
    this.modelCache.forEach((_, modelId) => {
      this.clearModel(modelId);
    });
  }

  // Get cache size
  getCacheSize(): number {
    return this.modelCache.size;
  }
}