import * as THREE from 'three';

export class EffectsSystem {
  private scene: THREE.Scene;
  private bubbleParticles: THREE.Points[] = [];
  private splashEffects: THREE.Group[] = [];
  
  constructor(scene: THREE.Scene) {
    this.scene = scene;
  }
  
  createBubbleEffect(position: THREE.Vector3, count: number = 20): void {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      positions[i3] = position.x + (Math.random() - 0.5) * 0.5;
      positions[i3 + 1] = position.y;
      positions[i3 + 2] = position.z + (Math.random() - 0.5) * 0.5;
      
      velocities[i3] = (Math.random() - 0.5) * 0.1;
      velocities[i3 + 1] = 0.5 + Math.random() * 0.5;
      velocities[i3 + 2] = (Math.random() - 0.5) * 0.1;
      
      sizes[i] = 0.05 + Math.random() * 0.1;
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    
    const material = new THREE.PointsMaterial({
      size: 0.1,
      map: this.createBubbleTexture(),
      transparent: true,
      opacity: 0.6,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    
    const particles = new THREE.Points(geometry, material);
    particles.userData = {
      lifeTime: 0,
      maxLifeTime: 3,
    };
    
    this.scene.add(particles);
    this.bubbleParticles.push(particles);
  }
  
  private createBubbleTexture(): THREE.Texture {
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    
    const context = canvas.getContext('2d')!;
    const gradient = context.createRadialGradient(16, 16, 0, 16, 16, 16);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.5)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    
    context.fillStyle = gradient;
    context.fillRect(0, 0, 32, 32);
    
    const texture = new THREE.Texture(canvas);
    texture.needsUpdate = true;
    
    return texture;
  }
  
  createSplashEffect(position: THREE.Vector3): void {
    const group = new THREE.Group();
    
    // Create ripple rings
    for (let i = 0; i < 3; i++) {
      const ringGeometry = new THREE.TorusGeometry(0.5 + i * 0.3, 0.05, 8, 32);
      const ringMaterial = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.6 - i * 0.2,
      });
      
      const ring = new THREE.Mesh(ringGeometry, ringMaterial);
      ring.rotation.x = -Math.PI / 2;
      ring.position.copy(position);
      ring.position.y = 0.1;
      ring.userData = {
        expansionSpeed: 1 + i * 0.5,
        fadeSpeed: 0.5,
      };
      
      group.add(ring);
    }
    
    group.userData = {
      lifeTime: 0,
      maxLifeTime: 2,
    };
    
    this.scene.add(group);
    this.splashEffects.push(group);
  }
  
  createWaterShader(): THREE.ShaderMaterial {
    const waterShader = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        waterColor: { value: new THREE.Color(0x006994) },
        transparency: { value: 0.8 },
      },
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vNormal;
        uniform float time;
        
        void main() {
          vUv = uv;
          vNormal = normal;
          
          vec3 pos = position;
          float wave = sin(pos.x * 5.0 + time) * 0.02;
          wave += sin(pos.z * 5.0 + time * 0.8) * 0.02;
          pos.y += wave;
          
          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 waterColor;
        uniform float transparency;
        uniform float time;
        varying vec2 vUv;
        varying vec3 vNormal;
        
        void main() {
          vec3 color = waterColor;
          
          // Add some variation based on UV
          color += vec3(sin(vUv.x * 10.0 + time) * 0.05);
          
          // Fresnel effect for rim lighting
          vec3 viewDirection = normalize(cameraPosition);
          float fresnel = pow(1.0 - dot(vNormal, viewDirection), 2.0);
          color += vec3(0.1, 0.2, 0.3) * fresnel;
          
          gl_FragColor = vec4(color, transparency);
        }
      `,
      transparent: true,
      side: THREE.DoubleSide,
    });
    
    return waterShader;
  }
  
  update(deltaTime: number): void {
    // Update bubbles
    this.bubbleParticles = this.bubbleParticles.filter((particles) => {
      const positions = particles.geometry.attributes.position.array as Float32Array;
      const velocities = particles.geometry.attributes.velocity.array as Float32Array;
      
      for (let i = 0; i < positions.length; i += 3) {
        positions[i] += velocities[i] * deltaTime;
        positions[i + 1] += velocities[i + 1] * deltaTime;
        positions[i + 2] += velocities[i + 2] * deltaTime;
      }
      
      particles.geometry.attributes.position.needsUpdate = true;
      
      particles.userData.lifeTime += deltaTime;
      const lifeRatio = particles.userData.lifeTime / particles.userData.maxLifeTime;
      (particles.material as THREE.PointsMaterial).opacity = 0.6 * (1 - lifeRatio);
      
      if (particles.userData.lifeTime >= particles.userData.maxLifeTime) {
        this.scene.remove(particles);
        particles.geometry.dispose();
        (particles.material as THREE.Material).dispose();
        return false;
      }
      
      return true;
    });
    
    // Update splash effects
    this.splashEffects = this.splashEffects.filter((group) => {
      group.children.forEach((child) => {
        if (child instanceof THREE.Mesh) {
          const scale = 1 + child.userData.expansionSpeed * deltaTime;
          child.scale.multiplyScalar(scale);
          
          const material = child.material as THREE.MeshBasicMaterial;
          material.opacity -= child.userData.fadeSpeed * deltaTime;
        }
      });
      
      group.userData.lifeTime += deltaTime;
      
      if (group.userData.lifeTime >= group.userData.maxLifeTime) {
        group.children.forEach((child) => {
          if (child instanceof THREE.Mesh) {
            child.geometry.dispose();
            (child.material as THREE.Material).dispose();
          }
        });
        this.scene.remove(group);
        return false;
      }
      
      return true;
    });
  }
  
  dispose(): void {
    this.bubbleParticles.forEach((particles) => {
      this.scene.remove(particles);
      particles.geometry.dispose();
      (particles.material as THREE.Material).dispose();
    });
    
    this.splashEffects.forEach((group) => {
      group.children.forEach((child) => {
        if (child instanceof THREE.Mesh) {
          child.geometry.dispose();
          (child.material as THREE.Material).dispose();
        }
      });
      this.scene.remove(group);
    });
    
    this.bubbleParticles = [];
    this.splashEffects = [];
  }
}