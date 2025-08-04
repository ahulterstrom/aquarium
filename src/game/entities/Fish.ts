import * as THREE from 'three';
import { Fish as FishType, FishSpecies } from '../../types/game.types';

export class Fish {
  private mesh: THREE.Group;
  private bodyMesh: THREE.Mesh;
  private finMesh: THREE.Mesh;
  private data: FishType;
  private species: FishSpecies;
  private swimOffset: number;
  private swimSpeed: number;
  
  constructor(data: FishType, species: FishSpecies) {
    this.data = data;
    this.species = species;
    this.mesh = new THREE.Group();
    this.mesh.userData = { id: data.id, type: 'fish' };
    
    this.swimOffset = Math.random() * Math.PI * 2;
    this.swimSpeed = 0.5 + Math.random() * 0.5;
    
    this.bodyMesh = this.createBody();
    this.finMesh = this.createFins();
    
    this.mesh.add(this.bodyMesh);
    this.mesh.add(this.finMesh);
    
    this.updatePosition();
    this.updateScale();
  }
  
  private createBody(): THREE.Mesh {
    const geometry = new THREE.SphereGeometry(0.2, 16, 12);
    geometry.scale(1.5, 1, 1);
    
    const color = this.getColorByRarity();
    const material = new THREE.MeshPhongMaterial({
      color,
      emissive: color,
      emissiveIntensity: 0.1,
      shininess: 100
    });
    
    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    
    return mesh;
  }
  
  private createFins(): THREE.Mesh {
    const finGeometry = new THREE.ConeGeometry(0.15, 0.3, 4);
    finGeometry.rotateZ(Math.PI);
    
    const finMaterial = new THREE.MeshPhongMaterial({
      color: this.getColorByRarity(),
      opacity: 0.8,
      transparent: true
    });
    
    const fins = new THREE.Mesh(finGeometry, finMaterial);
    fins.position.x = -0.25;
    fins.rotation.z = Math.PI / 2;
    
    return fins;
  }
  
  private getColorByRarity(): number {
    switch (this.species.rarity) {
      case 'common':
        return 0xff8c00;
      case 'uncommon':
        return 0x4169e1;
      case 'rare':
        return 0x9370db;
      case 'legendary':
        return 0xffd700;
      default:
        return 0xff8c00;
    }
  }
  
  private updateScale(): void {
    const scale = this.species.size === 'small' ? 0.5 :
                  this.species.size === 'medium' ? 0.75 : 1;
    this.mesh.scale.setScalar(scale);
  }
  
  update(deltaTime: number, tankBounds: THREE.Box3): void {
    const time = Date.now() * 0.001;
    
    this.bodyMesh.rotation.y = Math.sin(time * this.swimSpeed + this.swimOffset) * 0.3;
    this.finMesh.rotation.x = Math.sin(time * this.swimSpeed * 2) * 0.2;
    
    const targetVelocity = new THREE.Vector3();
    
    if (this.species.schooling) {
      // TODO: Implement schooling behavior
    }
    
    const boundsPadding = 0.5;
    const min = tankBounds.min.clone().addScalar(boundsPadding);
    const max = tankBounds.max.clone().subScalar(boundsPadding);
    
    if (this.data.position.x <= min.x || this.data.position.x >= max.x) {
      this.data.velocity.x *= -1;
    }
    if (this.data.position.y <= min.y || this.data.position.y >= max.y) {
      this.data.velocity.y *= -1;
    }
    if (this.data.position.z <= min.z || this.data.position.z >= max.z) {
      this.data.velocity.z *= -1;
    }
    
    this.data.velocity.add(targetVelocity.multiplyScalar(0.02));
    this.data.velocity.clampLength(0, 1 * this.swimSpeed);
    
    this.data.position.add(
      this.data.velocity.clone().multiplyScalar(deltaTime * 0.5)
    );
    
    this.data.position.clamp(min, max);
    
    if (this.data.velocity.length() > 0.01) {
      const direction = this.data.velocity.clone().normalize();
      this.mesh.lookAt(
        this.data.position.clone().add(direction)
      );
    }
    
    this.updatePosition();
    this.updateHunger(deltaTime);
  }
  
  private updatePosition(): void {
    this.mesh.position.copy(this.data.position);
  }
  
  private updateHunger(deltaTime: number): void {
    this.data.hunger += deltaTime * 0.01;
    this.data.hunger = Math.min(this.data.hunger, 1);
    
    if (this.data.hunger > 0.8) {
      this.data.happiness -= deltaTime * 0.02;
    }
  }
  
  feed(): void {
    this.data.hunger = 0;
    this.data.happiness = Math.min(this.data.happiness + 0.2, 1);
  }
  
  getMesh(): THREE.Group {
    return this.mesh;
  }
  
  getData(): FishType {
    return this.data;
  }
  
  getSpecies(): FishSpecies {
    return this.species;
  }
  
  dispose(): void {
    this.bodyMesh.geometry.dispose();
    (this.bodyMesh.material as THREE.Material).dispose();
    this.finMesh.geometry.dispose();
    (this.finMesh.material as THREE.Material).dispose();
  }
}