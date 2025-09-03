"use client";

import { Button } from "@/components/ui/button";

// Import game stores and types
import { spawnVisitor } from "@/components/systems/visitorSystem";
import { useSound } from "@/contexts/sound/useSound";
import { useGameStore } from "../../stores/gameStore";
import { useGridStore } from "../../stores/gridStore";
import { getCoinSystem } from "@/components/systems/coinSystem";
import { Vector3 } from "three";
import { useEffect, useRef } from "react";
import { CoinSystem } from "@/systems/CoinSystem";

export const DebugPanel = () => {
  const { soundController } = useSound();
  const coinSystemRef = useRef<CoinSystem>();

  const initialize = async () => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    coinSystemRef.current = getCoinSystem();
  };

  useEffect(() => {
    initialize();
  }, []);

  return (
    <div className="pointer-events-auto absolute top-0 left-0 w-30 space-y-2 bg-orange-400/50 p-2">
      <Button
        variant="outline"
        size="sm"
        className="w-full text-xs whitespace-break-spaces"
        onClick={() => spawnVisitor(undefined, soundController)}
      >
        1 Visitor
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="w-full text-xs whitespace-break-spaces"
        onClick={() => {
          for (let i = 0; i < 10; i++) {
            spawnVisitor(undefined, soundController);
          }
        }}
      >
        10 Visitors
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="w-full text-xs whitespace-break-spaces"
        onClick={() => {
          const cells = useGridStore.getState().cells;
          console.log("Grid Cells:", Array.from(cells.entries()));
        }}
      >
        Log Cells
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="w-full text-xs whitespace-break-spaces"
        onClick={() => {
          const fish = useGameStore.getState().fish;
          console.log("Fish:", Array.from(fish.entries()));
        }}
      >
        Log Fish
      </Button>

      <Button
        variant="outline"
        size="sm"
        className="w-full text-xs whitespace-break-spaces"
        onClick={() => {
          const state = useGameStore.getState();
          const objectiveSystem = state.objectiveSystem;
          console.log("Active Objectives:", state.activeObjectives);
          console.log("All Objectives:", objectiveSystem.getAllObjectives());
          console.log("All objectives", state.allObjectives);
          console.log(
            "Get active objectives:",
            objectiveSystem.getActiveObjectives(),
          );
        }}
      >
        Log objectives
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="w-full text-xs whitespace-break-spaces"
        onClick={() => {
          const tanks = useGameStore.getState().tanks;
          console.log("Tanks:", Array.from(tanks.entries()));
        }}
      >
        Log POIs
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="w-full text-xs whitespace-break-spaces"
        onClick={() => {
          const state = useGameStore.getState();
          state.addMoney(100);
        }}
      >
        Give $100
      </Button>

      <div className="group relative w-full max-w-xs">
        {/* Main button */}
        <Button
          variant="outline"
          className="py-3transition-all hover/90 relative flex w-full items-center justify-center gap-2 rounded-lg px-6 duration-300"
          onClick={() =>
            coinSystemRef.current?.dropCoin(
              new Vector3(Math.random() * 5, 0, 0),
              1,
              "me",
            )
          }
        >
          <span className="transform text-xs transition-all duration-300 group-hover:-translate-x-12 group-hover:opacity-0">
            Drop Coins
          </span>
        </Button>

        {/* Quantity buttons that appear on hover */}
        <div className="absolute top-0 right-0 left-0 flex h-full translate-x-full transform items-center overflow-hidden rounded-lg opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100">
          <button
            className="h-full grow text-xs transition-all hover:bg-black/20"
            onClick={(e) => {
              e.stopPropagation();
              coinSystemRef.current?.dropCoin(
                new Vector3(Math.random() * 5, 0, 0),
                1,
                "me",
              );
            }}
          >
            +1
          </button>
          <button
            className="h-full grow border-l border-gray-700 text-xs transition-all hover:bg-black/20"
            onClick={(e) => {
              e.stopPropagation();
              coinSystemRef.current?.dropCoin(
                new Vector3(Math.random() * 5, 0, 0),
                5,
                "me",
              );
            }}
          >
            +5
          </button>
          <button
            className="h-full grow border-l border-gray-700 text-xs transition-all hover:bg-black/20"
            onClick={(e) => {
              e.stopPropagation();
              coinSystemRef.current?.dropCoin(
                new Vector3(Math.random() * 5, 0, 0),
                25,
                "me",
              );
            }}
          >
            +25
          </button>
          <button
            className="h-full grow border-l border-gray-700 text-xs transition-all hover:bg-black/20"
            onClick={(e) => {
              e.stopPropagation();
              coinSystemRef.current?.dropCoin(
                new Vector3(Math.random() * 5, 0, 0),
                100,
                "me",
              );
            }}
          >
            +100
          </button>
        </div>
      </div>
    </div>
  );
};
