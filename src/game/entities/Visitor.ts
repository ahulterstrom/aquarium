import * as THREE from 'three';
import { Visitor as VisitorType } from '../../types/game.types';

export class Visitor {
  private mesh: THREE.Group;
  private bodyMesh: THREE.Mesh;
  private headMesh: THREE.Mesh;
  private data: VisitorType;
  private walkCycle: number;
  private targetPosition: THREE.Vector3;
  
  constructor(data: VisitorType) {
    this.data = data;
    this.mesh = new THREE.Group();
    this.mesh.userData = { id: data.id, type: 'visitor' };
    
    this.walkCycle = 0;
    this.targetPosition = data.position.clone();
    
    this.bodyMesh = this.createBody();
    this.headMesh = this.createHead();
    
    this.mesh.add(this.bodyMesh);
    this.mesh.add(this.headMesh);
    
    this.updatePosition();
  }
  
  private createBody(): THREE.Mesh {
    const geometry = new THREE.CylinderGeometry(0.3, 0.4, 1.2, 8);
    const color = new THREE.Color().setHSL(Math.random(), 0.5, 0.6);
    
    const material = new THREE.MeshPhongMaterial({
      color,
      shininess: 30
    });
    
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.y = 0.6;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    
    return mesh;
  }
  
  private createHead(): THREE.Mesh {
    const geometry = new THREE.SphereGeometry(0.25, 8, 6);
    const material = new THREE.MeshPhongMaterial({
      color: 0xffdbac,
      shininess: 30
    });
    
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.y = 1.45;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    
    return mesh;
  }
  
  update(deltaTime: number): void {
    const speed = 2;
    const direction = new THREE.Vector3();
    direction.subVectors(this.targetPosition, this.data.position);
    
    const distance = direction.length();
    
    if (distance > 0.1) {
      direction.normalize();
      
      const movement = direction.multiplyScalar(speed * deltaTime);
      this.data.position.add(movement);
      
      this.mesh.lookAt(this.targetPosition);
      
      this.walkCycle += deltaTime * 5;
      const bobAmount = Math.sin(this.walkCycle) * 0.05;
      this.mesh.position.y = bobAmount;
      
      const swayAmount = Math.sin(this.walkCycle * 0.5) * 0.1;
      this.mesh.rotation.z = swayAmount;
    } else {
      this.walkCycle = 0;
      this.mesh.position.y = 0;
      this.mesh.rotation.z = 0;
    }
    
    this.updatePosition();
    this.updatePatience(deltaTime);
  }
  
  private updatePosition(): void {
    this.mesh.position.x = this.data.position.x;
    this.mesh.position.z = this.data.position.z;
  }
  
  private updatePatience(deltaTime: number): void {
    if (this.data.targetTankId && this.data.happiness < 0.5) {
      this.data.patience -= deltaTime * 0.1;
      this.data.patience = Math.max(this.data.patience, 0);
    }
  }
  
  setTarget(position: THREE.Vector3): void {
    this.targetPosition.copy(position);
  }
  
  viewTank(tankId: string): void {
    this.data.targetTankId = tankId;
    this.data.happiness += 0.1;
    this.data.happiness = Math.min(this.data.happiness, 1);
  }
  
  spendMoney(amount: number): void {
    this.data.moneySpent += amount;
  }
  
  getMesh(): THREE.Group {
    return this.mesh;
  }
  
  getData(): VisitorType {
    return this.data;
  }
  
  isAtTarget(): boolean {
    const distance = this.data.position.distanceTo(this.targetPosition);
    return distance < 0.1;
  }
  
  dispose(): void {
    this.bodyMesh.geometry.dispose();
    (this.bodyMesh.material as THREE.Material).dispose();
    this.headMesh.geometry.dispose();
    (this.headMesh.material as THREE.Material).dispose();
  }
}