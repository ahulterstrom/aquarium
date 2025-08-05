import * as THREE from "three";
import { GridPosition } from "../types/game.types";
import { GridStore } from "../stores/gridStore";

export class PathSmoother {
  private gridStore: GridStore;

  constructor(gridStore: GridStore) {
    this.gridStore = gridStore;
  }

  /**
   * Smooth a grid-based path using Catmull-Rom splines
   * @param gridPath Array of grid positions from A*
   * @returns Array of smooth world positions
   */
  smoothPath(gridPath: GridPosition[]): THREE.Vector3[] {
    if (gridPath.length <= 2) {
      // Too few points to smooth, just convert to world positions
      return gridPath.map((pos) => this.gridToWorld(pos));
    }

    // Convert grid positions to world positions
    const worldPoints = gridPath.map((pos) => this.gridToWorld(pos));

    // Apply line-of-sight optimization first
    const optimizedPoints = this.lineOfSightOptimization(worldPoints);

    // If we have very few points after optimization, return them
    if (optimizedPoints.length < 3) {
      return optimizedPoints;
    }

    // Apply Catmull-Rom spline smoothing
    return this.applyCatmullRomSmoothing(optimizedPoints);
  }

  /**
   * Remove unnecessary waypoints if there's a clear line of sight
   */
  private lineOfSightOptimization(points: THREE.Vector3[]): THREE.Vector3[] {
    if (points.length <= 2) return points;

    const optimized: THREE.Vector3[] = [points[0]];
    let currentIndex = 0;

    while (currentIndex < points.length - 1) {
      let furthestVisible = currentIndex + 1;

      // Find the furthest point we can see directly from current position
      for (let i = currentIndex + 2; i < points.length; i++) {
        if (this.hasLineOfSight(points[currentIndex], points[i])) {
          furthestVisible = i;
        } else {
          break;
        }
      }

      optimized.push(points[furthestVisible]);
      currentIndex = furthestVisible;
    }

    return optimized;
  }

  /**
   * Check if there's a clear line of sight between two points
   */
  private hasLineOfSight(start: THREE.Vector3, end: THREE.Vector3): boolean {
    const steps = 10; // Number of points to check along the line
    const direction = end.clone().sub(start);
    const distance = direction.length();
    direction.normalize();

    for (let i = 1; i < steps; i++) {
      const t = i / steps;
      const checkPoint = start
        .clone()
        .add(direction.clone().multiplyScalar(distance * t));

      // Convert to grid coordinates and check if walkable
      const gridPos = this.worldToGrid(checkPoint);
      if (!this.gridStore.isWalkable(gridPos.x, gridPos.y, gridPos.z)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Apply Catmull-Rom spline smoothing to create curved paths
   */
  private applyCatmullRomSmoothing(points: THREE.Vector3[]): THREE.Vector3[] {
    const smoothed: THREE.Vector3[] = [];
    const numSegments = 5; // Points per segment

    // Add the first point
    smoothed.push(points[0].clone());

    for (let i = 0; i < points.length - 1; i++) {
      // Get control points for Catmull-Rom spline
      const p0 = i > 0 ? points[i - 1] : points[0];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 =
        i < points.length - 2 ? points[i + 2] : points[points.length - 1];

      // Generate intermediate points along the curve
      for (let j = 1; j <= numSegments; j++) {
        const t = j / numSegments;
        const point = this.catmullRomInterpolate(p0, p1, p2, p3, t);

        // Validate the point is in a walkable area
        const gridPos = this.worldToGrid(point);
        if (this.gridStore.isWalkable(gridPos.x, gridPos.y, gridPos.z)) {
          smoothed.push(point);
        } else {
          // If the smoothed point is invalid, fall back to linear interpolation
          const linear = p1.clone().lerp(p2, t);
          smoothed.push(linear);
        }
      }
    }

    return smoothed;
  }

  /**
   * Catmull-Rom spline interpolation
   */
  private catmullRomInterpolate(
    p0: THREE.Vector3,
    p1: THREE.Vector3,
    p2: THREE.Vector3,
    p3: THREE.Vector3,
    t: number,
  ): THREE.Vector3 {
    const t2 = t * t;
    const t3 = t2 * t;

    const v0 = p2.clone().sub(p0).multiplyScalar(0.5);
    const v1 = p3.clone().sub(p1).multiplyScalar(0.5);

    const a = p1
      .clone()
      .multiplyScalar(2)
      .sub(p2.clone().multiplyScalar(2))
      .add(v0)
      .add(v1);
    const b = p1
      .clone()
      .multiplyScalar(-3)
      .add(p2.clone().multiplyScalar(3))
      .sub(v0.clone().multiplyScalar(2))
      .sub(v1);
    const c = v0;
    const d = p1;

    return new THREE.Vector3(
      a.x * t3 + b.x * t2 + c.x * t + d.x,
      a.y * t3 + b.y * t2 + c.y * t + d.y,
      a.z * t3 + b.z * t2 + c.z * t + d.z,
    );
  }

  private gridToWorld(gridPos: GridPosition): THREE.Vector3 {
    return new THREE.Vector3(gridPos.x * 2, 0.5, gridPos.z * 2);
  }

  private worldToGrid(worldPos: THREE.Vector3): GridPosition {
    return {
      x: Math.round(worldPos.x / 2),
      y: 0,
      z: Math.round(worldPos.z / 2),
    };
  }
}
