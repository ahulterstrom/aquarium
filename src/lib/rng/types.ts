export interface RNGState {
  seed: string;
  state: [number, number, number, number];
  sequenceId: number;
}

export interface RNGContext {
  category: string;
  subcategory?: string;
}
