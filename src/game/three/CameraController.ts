import * as THREE from 'three';
import { OrbitControls } from '@react-three/drei';

export class CameraController {
  private camera: THREE.PerspectiveCamera;
  private target: THREE.Vector3;
  private isLocked: boolean = false;
  
  constructor(aspect: number) {
    this.camera = new THREE.PerspectiveCamera(
      45,
      aspect,
      0.1,
      1000
    );
    
    this.camera.position.set(20, 15, 20);
    this.target = new THREE.Vector3(0, 0, 0);
    this.camera.lookAt(this.target);
  }
  
  getCamera(): THREE.PerspectiveCamera {
    return this.camera;
  }
  
  setAspect(aspect: number): void {
    this.camera.aspect = aspect;
    this.camera.updateProjectionMatrix();
  }
  
  moveTo(position: THREE.Vector3, duration: number = 1000): void {
    if (this.isLocked) return;
    
    const startPosition = this.camera.position.clone();
    const startTime = Date.now();
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      const easeProgress = this.easeInOutCubic(progress);
      
      this.camera.position.lerpVectors(
        startPosition,
        position,
        easeProgress
      );
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    animate();
  }
  
  lookAt(target: THREE.Vector3, duration: number = 1000): void {
    const startTarget = this.target.clone();
    const startTime = Date.now();
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      const easeProgress = this.easeInOutCubic(progress);
      
      this.target.lerpVectors(
        startTarget,
        target,
        easeProgress
      );
      
      this.camera.lookAt(this.target);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    animate();
  }
  
  setLocked(locked: boolean): void {
    this.isLocked = locked;
  }
  
  zoomIn(factor: number = 0.8): void {
    const newPosition = this.camera.position.clone();
    newPosition.multiplyScalar(factor);
    this.moveTo(newPosition);
  }
  
  zoomOut(factor: number = 1.2): void {
    const newPosition = this.camera.position.clone();
    newPosition.multiplyScalar(factor);
    this.moveTo(newPosition);
  }
  
  private easeInOutCubic(t: number): number {
    return t < 0.5
      ? 4 * t * t * t
      : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }
  
  dispose(): void {
    // Clean up any resources if needed
  }
}