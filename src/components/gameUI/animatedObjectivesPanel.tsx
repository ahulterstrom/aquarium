import * as React from "react";
import {
  animated as a,
  useSpring,
  useSpringRef,
  useChain,
} from "@react-spring/web";
import { cn } from "@/lib/utils";
import { List, Target, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUIStore } from "@/stores/uiStore";

export const AnimatedObjectivesPanel = () => {
  return (
    <div className="pointer-events-auto absolute bottom-0 left-0 z-50 flex justify-center p-4">
      <ChainedBox />
    </div>
  );
};

const CLOSED_WIDTH = 48;
const OPEN_WIDTH = 260;
const CLOSED_HEIGHT = 48;
const OPEN_HEIGHT = 260;

const BUTTON_SIZE = 16; // Size of the button when closed
const OPEN_BUTTON_SIZE = 32; // Size of the button when open

const SPRING_FRICTION = 28;
const SPRING_TENSION = 180;

export function ChainedBox() {
  const showObjectives = useUIStore.use.showObjectives();
  const setShowObjectives = useUIStore.use.setShowObjectives();
  const setShowAllObjectives = useUIStore.use.setShowAllObjectives();

  const open = showObjectives;

  // 1) EXPAND via width (no text scaling)
  const expandRef = useSpringRef();
  const expand = useSpring({
    ref: expandRef,
    from: { width: CLOSED_WIDTH },
    to: { width: open ? OPEN_WIDTH : CLOSED_WIDTH },
    config: { tension: SPRING_TENSION, friction: SPRING_FRICTION },
  });

  // 2) ICON SIZE via width/height
  const iconSizeRef = useSpringRef();
  const iconSize = useSpring({
    ref: iconSizeRef,
    from: { width: BUTTON_SIZE, height: BUTTON_SIZE },
    to: {
      width: open ? OPEN_BUTTON_SIZE : BUTTON_SIZE,
      height: open ? OPEN_BUTTON_SIZE : BUTTON_SIZE,
    },
    config: { tension: SPRING_TENSION, friction: SPRING_FRICTION },
  });

  // 3) LIFT via translateY (does not distort text)
  const heightRef = useSpringRef();
  const height = useSpring({
    ref: heightRef,
    from: { y: CLOSED_HEIGHT },
    to: { y: open ? OPEN_HEIGHT : CLOSED_HEIGHT },
    config: { tension: SPRING_TENSION, friction: SPRING_FRICTION },
  });

  // 4) title REVEAL via opacity
  const titleRevealRef = useSpringRef();
  const titleReveal = useSpring({
    ref: titleRevealRef,
    from: {
      opacity: 0,
    },
    to: {
      opacity: open ? 1 : 0,
    },
    config: { tension: SPRING_TENSION, friction: SPRING_FRICTION },
  });

  // 5) content REVEAL via opacity
  const contentRevealRef = useSpringRef();
  const contentReveal = useSpring({
    ref: contentRevealRef,
    from: {
      opacity: 0,
      clipPath: "inset(0% 0% 100% 0%)",
    },
    to: {
      opacity: open ? 1 : 0,
      clipPath: open ? "inset(0% 0% 0% 0%)" : "inset(0% 0% 100% 0%)",
    },
    config: { tension: SPRING_TENSION, friction: SPRING_FRICTION },
  });

  // Orchestrate
  useChain(
    open
      ? [expandRef, iconSizeRef, heightRef, titleRevealRef, contentRevealRef]
      : [contentRevealRef, titleRevealRef, heightRef, iconSizeRef, expandRef],
    open ? [0, 0.1, 0.52, 0.3, 0.7] : [0, 0.1, 0.1, 0.12, 0.84],
    500,
  );

  return (
    <a.div
      style={{ width: expand.width, height: height.y }}
      className="glass relative overflow-hidden"
    >
      {/* Clickable box — width animates, text stays crisp */}
      <a.button
        type="button"
        aria-expanded={open}
        onClick={() => setShowObjectives((v) => !v)}
        style={
          {
            // width: expand.width,
            // y: lift.y,
            // transformOrigin: "left",
            // willChange: "width, transform",
          }
        }
        className={cn(
          "absolute top-0 right-0 left-0 z-100",
          "inline-flex items-center gap-2 px-4 py-3",
          "border-b transition-[box-shadow] duration-200",
        )}
      >
        <a.span
          style={{
            width: iconSize.width,
            height: iconSize.height,
            willChange: "width, height",
          }}
          className="shrink-0"
        >
          <Target className="size-full" />
        </a.span>
        <a.div
          style={{
            opacity: titleReveal.opacity,
            willChange: "opacity",
          }}
          className="flex w-full items-center justify-between font-medium"
        >
          <span>Objectives</span>
          <Button
            size="sm"
            variant="outline"
            className="ml-auto h-6 px-2 text-xs"
            onClick={(e) => {
              e.stopPropagation();
              setShowAllObjectives(true);
            }}
          >
            <List className="mr-1 h-3 w-3" />
            View All
          </Button>
        </a.div>
      </a.button>

      {/* Revealed panel under original position */}
      <a.div
        aria-hidden={!open}
        style={{
          width: expand.width,
          willChange: "width",
        }}
        className={cn("absolute top-0 right-0 bottom-0 left-0 z-99 mt-12 p-4")}
      >
        <a.div
          style={{
            opacity: contentReveal.opacity,
          }}
          className="text-sm will-change-[opacity]"
        >
          Hello from the revealed panel 👋
        </a.div>
      </a.div>
    </a.div>
  );
}
