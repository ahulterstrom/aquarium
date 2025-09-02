"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ChartLine, Pause, Play, Settings } from "lucide-react";

import { DateTimeDisplay } from "@/components/gameUI/dateTimeDisplay";
import { MoneyDisplay } from "@/components/gameUI/moneyDisplay";
import { VisitorCountDisplay } from "@/components/gameUI/visitorCountDisplay";
import { animated, useSpring } from "@react-spring/web";
import { useGameStore } from "../../stores/gameStore";
import { useUIStore } from "../../stores/uiStore";

export const TopPanel = () => {
  const isPaused = useGameStore.use.isPaused();
  const setPaused = useGameStore.use.setPaused();
  const showStatistics = useUIStore.use.showStatistics();
  const setShowStatistics = useUIStore.use.setShowStatistics();
  const showSettingsModal = useUIStore.use.showSettingsModal();
  const setShowSettingsModal = useUIStore.use.setShowSettingsModal();
  const isPhotoMode = useUIStore.use.isPhotoMode();

  const shouldShowTopPanel = !isPhotoMode;

  const springStyles = useSpring({
    transform: shouldShowTopPanel ? 'translateY(0%)' : 'translateY(-100%)',
    config: { tension: 300, friction: 30 }
  });

  return (
    <animated.div
      style={springStyles}
      className="fixed inset-x-0 top-0 z-50 pointer-events-none"
    >
      <div className="flex w-full justify-center p-4">
        <Card className="pointer-events-auto p-2">
          <CardContent className="flex h-8 items-center justify-center gap-4">
            <MoneyDisplay />
            <Separator orientation="vertical" />
            <DateTimeDisplay />
            <Separator orientation="vertical" />
            <VisitorCountDisplay />
            <Separator orientation="vertical" />
            <Button
              variant="onGlass"
              onClick={() => setShowStatistics(!showStatistics)}
            >
              <ChartLine />
            </Button>
            <Button
              variant="onGlass"
              onClick={() => setShowSettingsModal(!showSettingsModal)}
            >
              <Settings />
            </Button>

            <Button
              variant={isPaused ? "default" : "onGlass"}
              onClick={() => setPaused(!isPaused)}
            >
              {isPaused ? (
                <Play className="h-4 w-4" />
              ) : (
                <Pause className="h-4 w-4" />
              )}
            </Button>
            {/* 
            DO NOT DELETE
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant={gameSpeed === 1 ? "default" : "outline"}
                    onClick={() => setGameSpeed(1)}
                    disabled={isPaused}
                  >
                    1x
                  </Button>
                  <Button
                    size="sm"
                    variant={gameSpeed === 2 ? "default" : "outline"}
                    onClick={() => setGameSpeed(2)}
                    disabled={isPaused}
                  >
                    2x
                  </Button>
                  <Button
                    size="sm"
                    variant={gameSpeed === 3 ? "default" : "outline"}
                    onClick={() => setGameSpeed(3)}
                    disabled={isPaused}
                  >
                    3x
                  </Button>
                </div> */}
          </CardContent>
        </Card>
      </div>
    </animated.div>
  );
};
