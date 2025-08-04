import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';

interface AssetManifest {
  models: {
    [key: string]: string;
  };
  textures: {
    [key: string]: string;
  };
  sounds: {
    [key: string]: string;
  };
}

export class AssetLoader {
  private static instance: AssetLoader;
  private gltfLoader: GLTFLoader;
  private textureLoader: THREE.TextureLoader;
  private audioLoader: THREE.AudioLoader;
  private loadedAssets: Map<string, any>;
  private loadingPromises: Map<string, Promise<any>>;
  
  private constructor() {
    this.gltfLoader = new GLTFLoader();
    
    // Setup Draco loader for compressed models
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/');
    this.gltfLoader.setDRACOLoader(dracoLoader);
    
    this.textureLoader = new THREE.TextureLoader();
    this.audioLoader = new THREE.AudioLoader();
    this.loadedAssets = new Map();
    this.loadingPromises = new Map();
  }
  
  static getInstance(): AssetLoader {
    if (!AssetLoader.instance) {
      AssetLoader.instance = new AssetLoader();
    }
    return AssetLoader.instance;
  }
  
  async loadModel(path: string): Promise<THREE.Group> {
    const cached = this.loadedAssets.get(path);
    if (cached) {
      return cached.clone();
    }
    
    const loading = this.loadingPromises.get(path);
    if (loading) {
      return loading;
    }
    
    const promise = new Promise<THREE.Group>((resolve, reject) => {
      this.gltfLoader.load(
        path,
        (gltf) => {
          this.loadedAssets.set(path, gltf.scene);
          this.loadingPromises.delete(path);
          resolve(gltf.scene.clone());
        },
        (progress) => {
          // Progress callback
        },
        (error) => {
          this.loadingPromises.delete(path);
          reject(error);
        }
      );
    });
    
    this.loadingPromises.set(path, promise);
    return promise;
  }
  
  async loadTexture(path: string): Promise<THREE.Texture> {
    const cached = this.loadedAssets.get(path);
    if (cached) {
      return cached;
    }
    
    const loading = this.loadingPromises.get(path);
    if (loading) {
      return loading;
    }
    
    const promise = new Promise<THREE.Texture>((resolve, reject) => {
      this.textureLoader.load(
        path,
        (texture) => {
          texture.encoding = THREE.sRGBEncoding;
          this.loadedAssets.set(path, texture);
          this.loadingPromises.delete(path);
          resolve(texture);
        },
        (progress) => {
          // Progress callback
        },
        (error) => {
          this.loadingPromises.delete(path);
          reject(error);
        }
      );
    });
    
    this.loadingPromises.set(path, promise);
    return promise;
  }
  
  async loadAudio(path: string): Promise<AudioBuffer> {
    const cached = this.loadedAssets.get(path);
    if (cached) {
      return cached;
    }
    
    const loading = this.loadingPromises.get(path);
    if (loading) {
      return loading;
    }
    
    const promise = new Promise<AudioBuffer>((resolve, reject) => {
      this.audioLoader.load(
        path,
        (buffer) => {
          this.loadedAssets.set(path, buffer);
          this.loadingPromises.delete(path);
          resolve(buffer);
        },
        (progress) => {
          // Progress callback
        },
        (error) => {
          this.loadingPromises.delete(path);
          reject(error);
        }
      );
    });
    
    this.loadingPromises.set(path, promise);
    return promise;
  }
  
  async preloadAssets(manifest: AssetManifest): Promise<void> {
    const promises: Promise<any>[] = [];
    
    // Preload models
    for (const [key, path] of Object.entries(manifest.models)) {
      promises.push(this.loadModel(path));
    }
    
    // Preload textures
    for (const [key, path] of Object.entries(manifest.textures)) {
      promises.push(this.loadTexture(path));
    }
    
    // Preload sounds
    for (const [key, path] of Object.entries(manifest.sounds)) {
      promises.push(this.loadAudio(path));
    }
    
    await Promise.all(promises);
  }
  
  getAsset(key: string): any {
    return this.loadedAssets.get(key);
  }
  
  clearCache(): void {
    this.loadedAssets.forEach((asset) => {
      if (asset instanceof THREE.Texture) {
        asset.dispose();
      } else if (asset instanceof THREE.Group) {
        asset.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.geometry.dispose();
            if (child.material instanceof THREE.Material) {
              child.material.dispose();
            }
          }
        });
      }
    });
    
    this.loadedAssets.clear();
    this.loadingPromises.clear();
  }
}