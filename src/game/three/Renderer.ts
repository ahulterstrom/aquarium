import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';
import { SceneManager } from './SceneManager';
import { CameraController } from './CameraController';

export class Renderer {
  private renderer: THREE.WebGLRenderer;
  private composer: EffectComposer;
  private renderPass: RenderPass;
  private bloomPass: UnrealBloomPass;
  
  constructor(
    canvas: HTMLCanvasElement,
    sceneManager: SceneManager,
    cameraController: CameraController
  ) {
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true
    });
    
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.2;
    
    this.composer = new EffectComposer(this.renderer);
    
    this.renderPass = new RenderPass(
      sceneManager.getScene(),
      cameraController.getCamera()
    );
    this.composer.addPass(this.renderPass);
    
    this.bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      0.3,
      0.4,
      0.85
    );
    this.composer.addPass(this.bloomPass);
    
    this.updateSize();
  }
  
  render(): void {
    this.composer.render();
  }
  
  updateSize(): void {
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    this.renderer.setSize(width, height);
    this.composer.setSize(width, height);
    
    this.bloomPass.resolution.set(width, height);
  }
  
  setQuality(quality: 'low' | 'medium' | 'high'): void {
    switch (quality) {
      case 'low':
        this.renderer.setPixelRatio(1);
        this.renderer.shadowMap.enabled = false;
        this.bloomPass.enabled = false;
        break;
      case 'medium':
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
        this.renderer.shadowMap.enabled = true;
        this.bloomPass.enabled = false;
        break;
      case 'high':
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.bloomPass.enabled = true;
        break;
    }
  }
  
  getRenderer(): THREE.WebGLRenderer {
    return this.renderer;
  }
  
  dispose(): void {
    this.renderer.dispose();
    this.composer.dispose();
  }
}