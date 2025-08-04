import * as THREE from 'three';
import { Tank as TankType, GridPosition } from '../../types/game.types';

export class Tank {
  private mesh: THREE.Group;
  private waterMesh: THREE.Mesh;
  private glassMesh: THREE.Mesh;
  private data: TankType;
  
  constructor(data: TankType) {
    this.data = data;
    this.mesh = new THREE.Group();
    this.mesh.userData = { id: data.id, type: 'tank' };
    
    const dimensions = this.getDimensions();
    this.glassMesh = this.createGlass(dimensions);
    this.waterMesh = this.createWater(dimensions);
    
    this.mesh.add(this.glassMesh);
    this.mesh.add(this.waterMesh);
    
    this.updatePosition();
  }
  
  private getDimensions(): THREE.Vector3 {
    switch (this.data.size) {
      case 'small':
        return new THREE.Vector3(4, 3, 4);
      case 'medium':
        return new THREE.Vector3(6, 4, 6);
      case 'large':
        return new THREE.Vector3(10, 5, 8);
      default:
        return new THREE.Vector3(4, 3, 4);
    }
  }
  
  private createGlass(dimensions: THREE.Vector3): THREE.Mesh {
    const geometry = new THREE.BoxGeometry(
      dimensions.x,
      dimensions.y,
      dimensions.z
    );
    
    const material = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      metalness: 0,
      roughness: 0,
      transmission: 0.95,
      thickness: 0.1,
      transparent: true,
      opacity: 0.3,
      ior: 1.33,
      side: THREE.DoubleSide
    });
    
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.y = dimensions.y / 2;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    
    return mesh;
  }
  
  private createWater(dimensions: THREE.Vector3): THREE.Mesh {
    const waterGeometry = new THREE.BoxGeometry(
      dimensions.x - 0.2,
      dimensions.y - 0.3,
      dimensions.z - 0.2
    );
    
    const waterMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x006994,
      metalness: 0,
      roughness: 0.1,
      transmission: 0.9,
      thickness: 1,
      transparent: true,
      opacity: 0.7,
      ior: 1.33
    });
    
    const mesh = new THREE.Mesh(waterGeometry, waterMaterial);
    mesh.position.y = (dimensions.y - 0.3) / 2;
    
    return mesh;
  }
  
  updatePosition(): void {
    this.mesh.position.set(
      this.data.position.x * 2,
      0,
      this.data.position.z * 2
    );
  }
  
  updateWaterQuality(quality: number): void {
    this.data.waterQuality = quality;
    const color = new THREE.Color();
    
    if (quality > 0.8) {
      color.setHex(0x006994);
    } else if (quality > 0.5) {
      color.setHex(0x4a8ca8);
    } else {
      color.setHex(0x7a9ca8);
    }
    
    (this.waterMesh.material as THREE.MeshPhysicalMaterial).color = color;
  }
  
  addFish(fishId: string): void {
    if (!this.data.fishIds.includes(fishId)) {
      this.data.fishIds.push(fishId);
    }
  }
  
  removeFish(fishId: string): void {
    const index = this.data.fishIds.indexOf(fishId);
    if (index > -1) {
      this.data.fishIds.splice(index, 1);
    }
  }
  
  getMesh(): THREE.Group {
    return this.mesh;
  }
  
  getData(): TankType {
    return this.data;
  }
  
  getWorldPosition(): THREE.Vector3 {
    const worldPos = new THREE.Vector3();
    this.mesh.getWorldPosition(worldPos);
    return worldPos;
  }
  
  getBounds(): THREE.Box3 {
    const box = new THREE.Box3();
    box.setFromObject(this.mesh);
    return box;
  }
  
  dispose(): void {
    this.glassMesh.geometry.dispose();
    (this.glassMesh.material as THREE.Material).dispose();
    this.waterMesh.geometry.dispose();
    (this.waterMesh.material as THREE.Material).dispose();
  }
}