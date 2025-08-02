// src/rng/pcg.ts
// ──────────────────────────

const PCG_MULT = 6364136223846793005n;
const PCG_INC = 1442695040888963407n; // must be odd

/**
 * Pure step: given a 64-bit state, returns { value, nextState }.
 *  - value is a 32-bit unsigned int
 *  - nextState is the new 64-bit state
 */
export function pcg32Step(state: bigint): { value: number; nextState: bigint } {
  const old = state;
  const nextState = old * PCG_MULT + PCG_INC;
  const xorshifted = Number(((old >> 18n) ^ old) >> 27n) >>> 0;
  const rot = Number(old >> 59n) & 31;
  const value = (xorshifted >>> rot) | (xorshifted << ((32 - rot) & 31));
  return { value: value >>> 0, nextState };
}

/**
 * Helper: produce a float in [0,1).
 */
export function pcg32Float(state: bigint): {
  value: number;
  nextState: bigint;
} {
  const { value: u32, nextState } = pcg32Step(state);
  return { value: u32 / 0x100000000, nextState };
}

/**
 * Helper: uniform integer in [min,max], unbiased for small spans.
 */
export function pcg32IntBetween(
  state: bigint,
  min: number,
  max: number,
): { value: number; nextState: bigint } {
  const { value: f, nextState } = pcg32Float(state);
  const span = max - min + 1;
  return { value: min + Math.floor(f * span), nextState };
}
