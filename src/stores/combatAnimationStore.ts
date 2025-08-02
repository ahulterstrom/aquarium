interface CombatAnimationStore {
  // Animation queues
  animationQueue: Animation[];
  currentAnimation: Animation | null;

  // Visual effects
  floatingNumbers: FloatingNumber[];
  particles: Particle[];
  screenShake: number;

  // Card preview
  hoveredCard: Card | null;
  cardPreviewPosition: { x: number; y: number } | null;

  // Actions
  queueAnimation: (animation: Animation) => void;
  playNextAnimation: () => void;
  addFloatingNumber: (number: FloatingNumber) => void;
  shakeScreen: (intensity: number) => void;
}
