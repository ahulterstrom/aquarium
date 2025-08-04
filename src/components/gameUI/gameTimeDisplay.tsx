import { TICK_RATES } from "@/lib/constants";
import { useGameStore } from "@/stores/gameStore";
import { useEffect, useRef, useState } from "react";

// Format game time as h:mm AM/PM based on day cycle
const formatTime = (timeMs: number) => {
  const dayLength = TICK_RATES.daily; // 60 seconds = 1 full day cycle (from TICK_RATES.daily)

  // Get time within the current day (modulo day length)
  const timeInCurrentDay = timeMs % dayLength;

  // Convert to 24-hour format (timeInCurrentDay / dayLength * 24 hours)
  const dayProgress = timeInCurrentDay / dayLength;
  const totalMinutesInDay = dayProgress * 24 * 60; // 24 hours * 60 minutes

  const hours24 = Math.floor(totalMinutesInDay / 60);
  const minutes = Math.floor(totalMinutesInDay % 60);

  // Convert to 12-hour format with AM/PM
  const ampm = hours24 >= 12 ? "PM" : "AM";
  const hours12 = hours24 === 0 ? 12 : hours24 > 12 ? hours24 - 12 : hours24;

  return `${hours12}:${minutes.toString().padStart(2, "0")} ${ampm}`;
};

export const GameTimeDisplay = () => {
  const spanRef = useRef<HTMLSpanElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Initialize with starting time
    if (spanRef.current) {
      spanRef.current.textContent = "12:00 AM";
    }

    // Update time display by directly manipulating DOM
    intervalRef.current = setInterval(() => {
      if (spanRef.current) {
        const currentGameTime = useGameStore.getState().gameTime;
        spanRef.current.textContent = formatTime(currentGameTime);
      }
    }, 100);

    // Cleanup interval on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return (
    <span
      ref={spanRef}
      className="w-[3.8rem] font-mono text-xs text-slate-500"
    />
  );
};
