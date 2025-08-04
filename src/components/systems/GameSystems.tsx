import { processDayEnd } from "@/components/systems/daySystem";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import { useGameStore } from "../../stores/gameStore";
import { processTick } from "./tickSystem";
import { spawnVisitors, updateVisitors } from "./visitorSystem";
import { updateWaterQuality } from "./waterSystem";
import { TICK_RATES } from "@/lib/constants";

export function GameSystems() {
  const accumulator = useRef({
    tick: 0,
    water: 0,
    visitors: 0,
    daily: 0,
  });

  const { gameSpeed, isPaused, updateGameTime } = useGameStore();

  useFrame((state, delta) => {
    if (isPaused) return;

    // Convert delta to milliseconds and apply game speed
    const dt = delta * 1000 * gameSpeed;

    // Update total game time
    updateGameTime(dt);

    // Update visitors every frame
    updateVisitors(dt);

    // Fast tick (1s) - Money and UI updates
    accumulator.current.tick += dt;
    if (accumulator.current.tick >= TICK_RATES.tick) {
      console.log("Processing fast tick...");
      processTick();
      accumulator.current.tick %= TICK_RATES.tick;
    }

    // Water quality (5s)
    accumulator.current.water += dt;
    if (accumulator.current.water >= TICK_RATES.water) {
      console.log("Updating water quality...");
      updateWaterQuality();
      accumulator.current.water %= TICK_RATES.water;
    }

    // Visitor spawning (10s)
    accumulator.current.visitors += dt;
    if (accumulator.current.visitors >= TICK_RATES.visitors) {
      console.log("Spawning visitors...");
      spawnVisitors();
      accumulator.current.visitors %= TICK_RATES.visitors;
    }

    // Day end (60s)
    accumulator.current.daily += dt;
    if (accumulator.current.daily >= TICK_RATES.daily) {
      console.log("Processing day end...");
      processDayEnd();
      accumulator.current.daily %= TICK_RATES.daily;
    }
  });

  return null;
}
