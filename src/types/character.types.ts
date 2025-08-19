export interface CharacterModel {
  id: string;
  name: string;
  path: string;
  gender?: 'male' | 'female' | 'neutral';
  tags?: string[]; // e.g., 'casual', 'formal', 'young', 'old', 'western'
  animations: CharacterAnimations;
}

export interface CharacterAnimations {
  idle: string;
  walk: string;
  run?: string;
  viewing?: string;
  death?: string;
  victory?: string;
  defeat?: string;
  jump?: string;
  pickUp?: string;
  punch?: string;
  receiveHit?: string;
  roll?: string;
  shoot?: string;
  sitDown?: string;
  standUp?: string;
  swordSlash?: string;
  carry?: string;
}

export interface CharacterInstance {
  modelId: string;
  visitorId: string;
  meshRef?: any; // THREE.Group
  animationMixer?: any; // THREE.AnimationMixer
  currentAnimation?: string;
}

export interface CharacterModelCache {
  scene: any; // THREE.Group
  animations: Map<string, any>; // THREE.AnimationClip
  materials: Map<string, any>; // THREE.Material
}