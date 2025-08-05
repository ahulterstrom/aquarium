import * as THREE from 'three';
import { Tank, Visitor } from '../types/game.types';

/**
 * Steering behaviors for natural visitor movement
 * Based on Craig Reynolds' steering behaviors for autonomous characters
 */

export interface SteeringForce {
  force: THREE.Vector3;
  weight: number;
}

export class SteeringBehaviors {
  private static readonly MAX_FORCE = 2.0;
  private static readonly MAX_SPEED = 1.5;
  
  /**
   * Seek behavior - steer towards a target position
   */
  static seek(position: THREE.Vector3, target: THREE.Vector3, currentVelocity: THREE.Vector3): THREE.Vector3 {
    const desired = target.clone().sub(position).normalize().multiplyScalar(this.MAX_SPEED);
    const steer = desired.sub(currentVelocity);
    return this.limitForce(steer);
  }

  /**
   * Arrive behavior - slow down when approaching target
   */
  static arrive(position: THREE.Vector3, target: THREE.Vector3, currentVelocity: THREE.Vector3, slowingRadius: number = 1.5): THREE.Vector3 {
    const desired = target.clone().sub(position);
    const distance = desired.length();
    
    if (distance === 0) return new THREE.Vector3(0, 0, 0);
    
    desired.normalize();
    
    // Scale speed based on distance to target
    if (distance < slowingRadius) {
      const speed = this.MAX_SPEED * (distance / slowingRadius);
      desired.multiplyScalar(speed);
    } else {
      desired.multiplyScalar(this.MAX_SPEED);
    }
    
    const steer = desired.sub(currentVelocity);
    return this.limitForce(steer);
  }

  /**
   * Avoid behavior - steer away from obstacles using grid-based detection
   */
  static avoid(position: THREE.Vector3, obstacles: Tank[], avoidDistance: number = 2.0): THREE.Vector3 {
    const steer = new THREE.Vector3(0, 0, 0);
    
    for (const tank of obstacles) {
      const obstaclePos = new THREE.Vector3(tank.position.x * 2, 0.5, tank.position.z * 2);
      const distance = position.distanceTo(obstaclePos);
      
      if (distance < avoidDistance && distance > 0) {
        // Calculate repulsion force
        const repulsion = position.clone().sub(obstaclePos);
        repulsion.normalize();
        // Stronger force when closer
        const strength = (avoidDistance - distance) / avoidDistance;
        repulsion.multiplyScalar(strength * 2.0);
        steer.add(repulsion);
      }
    }
    
    return this.limitForce(steer);
  }

  /**
   * Grid-based obstacle avoidance - uses grid cells to detect obstacles
   */
  static avoidGridObstacles(
    position: THREE.Vector3,
    gridStore: { isWalkable: (x: number, y: number, z: number) => boolean },
    avoidDistance: number = 1.5
  ): THREE.Vector3 {
    const steer = new THREE.Vector3(0, 0, 0);
    
    // Convert position to grid coordinates
    const gridX = Math.round(position.x / 2);
    const gridZ = Math.round(position.z / 2);
    
    // Check surrounding grid cells for obstacles
    const checkRadius = Math.ceil(avoidDistance / 2);
    
    for (let dx = -checkRadius; dx <= checkRadius; dx++) {
      for (let dz = -checkRadius; dz <= checkRadius; dz++) {
        if (dx === 0 && dz === 0) continue; // Skip current cell
        
        const checkX = gridX + dx;
        const checkZ = gridZ + dz;
        
        // Check if this cell is not walkable (obstacle)
        if (!gridStore.isWalkable(checkX, 0, checkZ)) {
          const obstacleWorldPos = new THREE.Vector3(checkX * 2, 0.5, checkZ * 2);
          const distance = position.distanceTo(obstacleWorldPos);
          
          if (distance < avoidDistance && distance > 0) {
            // Calculate repulsion force
            const repulsion = position.clone().sub(obstacleWorldPos);
            repulsion.normalize();
            const strength = (avoidDistance - distance) / avoidDistance;
            repulsion.multiplyScalar(strength * 1.5);
            steer.add(repulsion);
          }
        }
      }
    }
    
    return this.limitForce(steer);
  }

  /**
   * Separate behavior - maintain distance from other visitors
   */
  static separate(visitor: Visitor, otherVisitors: Visitor[], separationRadius: number = 1.0): THREE.Vector3 {
    const steer = new THREE.Vector3(0, 0, 0);
    let count = 0;
    
    for (const other of otherVisitors) {
      if (other.id === visitor.id) continue;
      
      const distance = visitor.position.distanceTo(other.position);
      
      if (distance < separationRadius && distance > 0) {
        // Calculate separation force
        const separation = visitor.position.clone().sub(other.position);
        separation.normalize();
        separation.divideScalar(distance); // Weight by distance
        steer.add(separation);
        count++;
      }
    }
    
    if (count > 0) {
      steer.divideScalar(count); // Average
      steer.normalize();
      steer.multiplyScalar(this.MAX_SPEED);
      steer.sub(visitor.velocity);
      return this.limitForce(steer);
    }
    
    return steer;
  }

  /**
   * Wander behavior - add random direction changes for natural movement
   */
  static wander(currentVelocity: THREE.Vector3, wanderStrength: number = 0.5): THREE.Vector3 {
    const wanderAngle = (Math.random() - 0.5) * Math.PI * 0.3; // Random angle change
    
    // Base the wander direction on current velocity for more natural movement
    let baseDirection = currentVelocity.clone().normalize();
    if (baseDirection.length() === 0) {
      baseDirection = new THREE.Vector3(1, 0, 0); // Default forward
    }
    
    const wanderForce = new THREE.Vector3(
      Math.cos(wanderAngle),
      0,
      Math.sin(wanderAngle)
    );
    wanderForce.multiplyScalar(wanderStrength);
    return wanderForce;
  }

  /**
   * Boundary avoidance - keep visitors within the aquarium bounds
   */
  static avoidBoundaries(position: THREE.Vector3, gridSize: { width: number; depth: number }, margin: number = 0.5): THREE.Vector3 {
    const steer = new THREE.Vector3(0, 0, 0);
    const maxX = (gridSize.width - 1) * 2;
    const maxZ = (gridSize.depth - 1) * 2;
    
    // Check boundaries and add repulsion forces
    if (position.x < margin) {
      steer.x += (margin - position.x) * 2;
    } else if (position.x > maxX - margin) {
      steer.x -= (position.x - (maxX - margin)) * 2;
    }
    
    if (position.z < margin) {
      steer.z += (margin - position.z) * 2;
    } else if (position.z > maxZ - margin) {
      steer.z -= (position.z - (maxZ - margin)) * 2;
    }
    
    return this.limitForce(steer);
  }

  /**
   * Combine multiple steering forces with weights
   */
  static combineSteering(behaviors: SteeringForce[]): THREE.Vector3 {
    const combined = new THREE.Vector3(0, 0, 0);
    
    for (const behavior of behaviors) {
      const weightedForce = behavior.force.clone().multiplyScalar(behavior.weight);
      combined.add(weightedForce);
    }
    
    return this.limitForce(combined);
  }

  /**
   * Limit force magnitude to prevent jerky movement
   */
  private static limitForce(force: THREE.Vector3): THREE.Vector3 {
    if (force.length() > this.MAX_FORCE) {
      force.normalize().multiplyScalar(this.MAX_FORCE);
    }
    return force;
  }

  /**
   * Check if there's a clear line of sight between two points (no tanks in the way)
   */
  static hasLineOfSight(from: THREE.Vector3, to: THREE.Vector3, obstacles: Tank[]): boolean {
    const direction = to.clone().sub(from);
    const distance = direction.length();
    direction.normalize();
    
    // Check for tank intersections along the path
    for (const tank of obstacles) {
      const tankPos = new THREE.Vector3(tank.position.x * 2, 0.5, tank.position.z * 2);
      const toTank = tankPos.clone().sub(from);
      
      // Project tank position onto the path
      const projection = toTank.dot(direction);
      
      // Skip if tank is behind us or beyond target
      if (projection < 0 || projection > distance) continue;
      
      // Find closest point on path to tank
      const closestPoint = from.clone().add(direction.clone().multiplyScalar(projection));
      const distanceToPath = closestPoint.distanceTo(tankPos);
      
      // If tank is too close to path, no line of sight
      if (distanceToPath < 1.2) { // Tank radius + margin
        return false;
      }
    }
    
    return true;
  }
}