export class XorShift128Plus {
  private state: [number, number, number, number];

  constructor(seed: string | [number, number, number, number]) {
    if (typeof seed === "string") {
      this.state = this.seedFromString(seed);
    } else {
      this.state = [...seed];
    }
  }

  private seedFromString(seed: string): [number, number, number, number] {
    // Simple hash function to convert string to 4 32-bit integers
    let h1 = 0x9e3779b9;
    let h2 = 0x9e3779b9;
    let h3 = 0x9e3779b9;
    let h4 = 0x9e3779b9;

    for (let i = 0; i < seed.length; i++) {
      const ch = seed.charCodeAt(i);
      h1 = Math.imul(h1 ^ ch, 0x85ebca6b);
      h2 = Math.imul(h2 ^ ch, 0xc2b2ae35);
      h3 = Math.imul(h3 ^ ch, 0x27d4eb2f);
      h4 = Math.imul(h4 ^ ch, 0x165667b1);
    }

    return [h1 >>> 0, h2 >>> 0, h3 >>> 0, h4 >>> 0];
  }

  next(): number {
    let [s0, s1, s2, s3] = this.state;

    const t = (s0 + s3) >>> 0;
    const result = (t + s1) >>> 0;

    s3 = s2;
    s2 = s1;
    s1 = s0;

    s0 = t;
    s0 ^= s0 << 11;
    s0 ^= s0 >>> 8;
    s0 ^= s3;
    s0 ^= s3 >>> 19;

    this.state = [s0 >>> 0, s1, s2, s3];

    return result / 0x100000000; // Convert to [0, 1)
  }

  // Utility methods
  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  nextFloat(min: number = 0, max: number = 1): number {
    return this.next() * (max - min) + min;
  }

  nextBoolean(probability: number = 0.5): boolean {
    return this.next() < probability;
  }

  pick<T>(array: T[]): T {
    return array[this.nextInt(0, array.length - 1)];
  }

  shuffle<T>(array: T[]): T[] {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
      const j = this.nextInt(0, i);
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }

  // Get current state for saving
  getState(): [number, number, number, number] {
    return [...this.state];
  }

  // Set state for loading
  setState(state: [number, number, number, number]): void {
    this.state = [...state];
  }
}
