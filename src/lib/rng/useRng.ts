import { useCallback } from "react";

import { useRNGStore } from "@/managers/rngManager";
import { RNGContext } from "@/lib/rng/types";

export function useRNG(context: RNGContext) {
  const getRNG = useRNGStore((state) => state.getRNG);

  return useCallback(() => {
    return getRNG(context);
  }, [getRNG, context.category, context.subcategory]);
}
