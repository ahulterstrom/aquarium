import * as THREE from 'three';

export class SceneManager {
  private scene: THREE.Scene;
  private ambientLight: THREE.AmbientLight;
  private directionalLight: THREE.DirectionalLight;
  
  constructor() {
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.Fog(0x2a4858, 10, 100);
    this.scene.background = new THREE.Color(0x1a2838);
    
    this.ambientLight = new THREE.AmbientLight(0x4a6878, 0.6);
    this.scene.add(this.ambientLight);
    
    this.directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    this.directionalLight.position.set(10, 20, 10);
    this.directionalLight.castShadow = true;
    this.directionalLight.shadow.camera.left = -50;
    this.directionalLight.shadow.camera.right = 50;
    this.directionalLight.shadow.camera.top = 50;
    this.directionalLight.shadow.camera.bottom = -50;
    this.directionalLight.shadow.camera.near = 0.1;
    this.directionalLight.shadow.camera.far = 100;
    this.directionalLight.shadow.mapSize.width = 2048;
    this.directionalLight.shadow.mapSize.height = 2048;
    
    this.scene.add(this.directionalLight);
    
    this.setupGrid();
  }
  
  private setupGrid() {
    const gridHelper = new THREE.GridHelper(100, 50, 0x444444, 0x222222);
    gridHelper.position.y = -0.01;
    this.scene.add(gridHelper);
  }
  
  getScene(): THREE.Scene {
    return this.scene;
  }
  
  add(object: THREE.Object3D): void {
    this.scene.add(object);
  }
  
  remove(object: THREE.Object3D): void {
    this.scene.remove(object);
  }
  
  updateLighting(intensity: number): void {
    this.ambientLight.intensity = intensity * 0.6;
    this.directionalLight.intensity = intensity * 0.8;
  }
  
  dispose(): void {
    this.scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose();
        if (child.material instanceof THREE.Material) {
          child.material.dispose();
        }
      }
    });
    
    this.scene.clear();
  }
}