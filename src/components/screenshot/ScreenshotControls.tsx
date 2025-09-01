import { Camera, Download, Copy, X } from "lucide-react";
import { useCallback } from "react";
import { useSpring, animated, useChain, useSpringRef } from "@react-spring/web";
import { screenshotService } from "@/services/ScreenshotService";
import { useUIStore } from "@/stores/uiStore";
import { useCanvasStore } from "@/stores/canvasStore";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

/**
 * Screenshot controls component that provides photo mode functionality.
 *
 * Features:
 * - Toggle between normal view and photo mode
 * - Animated viewfinder with grid lines, corner brackets, and focus reticle
 * - Screenshot capture with download and clipboard options
 * - Smooth spring animations for UI transitions
 *
 * @returns JSX element containing camera button and photo mode overlay UI
 */
export const ScreenshotControls = () => {
  const canvas = useCanvasStore.use.canvas();
  const isPhotoMode = useUIStore.use.isPhotoMode();
  const togglePhotoMode = useUIStore.use.togglePhotoMode();
  const exitPhotoMode = useUIStore.use.exitPhotoMode();

  // Create refs for all animations
  const focusRef = useSpringRef();
  const viewfinderRef = useSpringRef();
  const topLabelRef = useSpringRef();
  const bottomControlsRef = useSpringRef();

  // Viewfinder element refs for separate animations
  const gridLinesRef = useSpringRef();
  const cornerBracketsRef = useSpringRef();
  const centerReticleRef = useSpringRef();
  const exposureScaleRef = useSpringRef();

  // Photo mode animations (only active when in photo mode)
  const focusSpring = useSpring({
    ref: focusRef,
    from: { backdropFilter: "blur(0px)" },
    to: async (next) => {
      if (isPhotoMode) {
        await next({ backdropFilter: "blur(8px)" });
        await next({ backdropFilter: "blur(0px)" });
      } else {
        await next({ backdropFilter: "blur(0px)" });
      }
    },
    config: { tension: 200, friction: 25 },
  });

  const viewfinderSpring = useSpring({
    ref: viewfinderRef,
    opacity: isPhotoMode ? 1 : 0,
    transform: isPhotoMode ? "scale(1)" : "scale(0.95)",
    config: { tension: 300, friction: 30 },
  });

  const topLabelSpring = useSpring({
    ref: topLabelRef,
    opacity: isPhotoMode ? 1 : 0,
    transform: isPhotoMode ? "translateY(0px)" : "translateY(-20px)",
    config: { tension: 280, friction: 25 },
  });

  const bottomControlsSpring = useSpring({
    ref: bottomControlsRef,
    opacity: isPhotoMode ? 1 : 0,
    transform: isPhotoMode ? "translateY(0px)" : "translateY(20px)",
    config: { tension: 280, friction: 25 },
  });

  // Individual viewfinder element animations
  const gridLinesSpring = useSpring({
    ref: gridLinesRef,
    opacity: isPhotoMode ? 0.4 : 0,
    transform: isPhotoMode ? "scale(1)" : "scale(0.9)",
    config: { tension: 250, friction: 20 },
  });

  const cornerBracketsSpring = useSpring({
    ref: cornerBracketsRef,
    opacity: isPhotoMode ? 0.7 : 0,
    transform: isPhotoMode ? "scale(1)" : "scale(1.2)",
    config: { tension: 200, friction: 25 },
  });

  const centerReticleSpring = useSpring({
    ref: centerReticleRef,
    opacity: isPhotoMode ? 0.7 : 0,
    transform: isPhotoMode ? "scale(1)" : "scale(0.8)",
    config: { tension: 300, friction: 30 },
  });

  const exposureScaleSpring = useSpring({
    ref: exposureScaleRef,
    opacity: isPhotoMode ? 0.8 : 0,
    transform: isPhotoMode ? "translateY(0px)" : "translateY(10px)",
    config: { tension: 250, friction: 25 },
  });

  // Chain main UI animations in sequence
  useChain(
    isPhotoMode
      ? [focusRef, viewfinderRef, topLabelRef, bottomControlsRef]
      : [bottomControlsRef, topLabelRef, viewfinderRef, focusRef],
    isPhotoMode ? [0, 0.1, 0.4, 0.7] : [0, 0.1, 0.2, 0.3],
  );

  // Chain viewfinder element animations separately
  useChain(
    isPhotoMode
      ? [gridLinesRef, cornerBracketsRef, centerReticleRef, exposureScaleRef]
      : [exposureScaleRef, centerReticleRef, cornerBracketsRef, gridLinesRef],
    isPhotoMode
      ? [0.4, 0.6, 0.9, 1.0] // Start after viewfinder appears
      : [0, 0.05, 0.1, 0.15], // Quick exit
  );

  const handleScreenshot = useCallback(
    async (options?: { toClipboard?: boolean }) => {
      if (!canvas) {
        console.warn("Canvas not available for screenshot");
        return;
      }

      console.log("Taking screenshot, canvas:", canvas);
      console.log("Canvas dimensions:", canvas.width, "x", canvas.height);

      // Trigger flash effect
      screenshotService.triggerFlash();

      // Actually capture the screenshot
      await screenshotService.captureCanvas(canvas, {
        toClipboard: options?.toClipboard,
      });
    },
    [canvas],
  );

  // Always render both UIs, control visibility with animations
  return (
    <>
      {/* Camera Button */}
      <div className="pointer-events-auto fixed top-4 right-4 z-60">
        <Tooltip>
          <TooltipTrigger asChild>
            <div>
              <Button
                variant="glass"
                onClick={togglePhotoMode}
                className="size-[3.125rem]"
              >
                {isPhotoMode ? (
                  <X className="size-4" />
                ) : (
                  <Camera className="size-4" />
                )}
              </Button>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            {isPhotoMode ? <p>Exit Photo Mode</p> : <p>Photo Mode</p>}
          </TooltipContent>
        </Tooltip>
      </div>

      {/* Photo Mode UI */}
      <div className="pointer-events-none fixed inset-0 z-50">
        {/* Backdrop blur for focusing effect */}
        <animated.div
          style={focusSpring}
          className="pointer-events-none absolute inset-0"
        />

        {/* Bottom Controls */}
        <animated.div
          style={bottomControlsSpring}
          className="pointer-events-auto absolute bottom-28 left-1/2 -translate-x-1/2 transform"
        >
          <div className="glass flex items-center gap-2 p-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <Button
                    variant="default"
                    onClick={() => handleScreenshot()}
                    className="size-10 bg-transparent text-foreground hover:bg-white/20 hover:shadow-lg"
                  >
                    <Download className="size-4" />
                  </Button>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Download</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <Button
                    variant="default"
                    onClick={() => handleScreenshot({ toClipboard: true })}
                    className="size-10 bg-transparent text-foreground hover:bg-white/20 hover:shadow-lg"
                  >
                    <Copy className="size-4" />
                  </Button>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Copy to Clipboard</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <Button
                    variant="default"
                    onClick={exitPhotoMode}
                    className="size-10 bg-transparent text-foreground hover:bg-white/20 hover:shadow-lg"
                  >
                    <X className="size-4" />
                  </Button>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Exit Photo Mode</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </animated.div>

        {/* Top Label - Photo Mode */}
        <animated.div
          style={topLabelSpring}
          className="pointer-events-none absolute top-4 right-0 left-0 mx-auto w-60"
        >
          <div className="glass p-3 text-sm">
            <div className="font-medium">Photo Mode</div>
          </div>
        </animated.div>

        <div className="relative mx-auto h-screen w-full text-white">
          {/* Viewfinder Overlay */}
          <animated.div
            style={viewfinderSpring}
            className="pointer-events-none absolute inset-2 rounded-sm border-2 border-white/50"
            aria-hidden="true"
          >
            {/* 3x3 grid lines */}
            <animated.div style={gridLinesSpring} className="absolute inset-0">
              <div className="absolute top-0 bottom-0 left-[33.333%] w-px bg-white/40"></div>
              <div className="absolute top-0 bottom-0 left-[66.666%] w-px bg-white/40"></div>
              <div className="absolute top-[33.333%] right-0 left-0 h-px bg-white/40"></div>
              <div className="absolute top-[66.666%] right-0 left-0 h-px bg-white/40"></div>
            </animated.div>

            {/* Corner brackets */}
            <animated.div className="size-full" style={cornerBracketsSpring}>
              <div className="absolute top-20 left-20 h-9 w-9 rounded-tl-xs border-t-2 border-l-2 border-white/70"></div>
              <div className="absolute top-20 right-20 h-9 w-9 rounded-tr-xs border-t-2 border-r-2 border-white/70"></div>
              <div className="absolute bottom-20 left-20 h-9 w-9 rounded-bl-xs border-b-2 border-l-2 border-white/70"></div>
              <div className="absolute right-20 bottom-20 h-9 w-9 rounded-br-xs border-r-2 border-b-2 border-white/70"></div>
            </animated.div>

            {/* Center focus reticle */}
            <animated.div
              style={centerReticleSpring}
              className="absolute inset-0 grid place-items-center"
            >
              <div className="relative h-16 w-16 rounded-full border-2 border-white/70">
                <div className="absolute top-1/2 left-1/2 h-6 w-px -translate-x-1/2 -translate-y-1/2 bg-white/80"></div>
                <div className="absolute top-1/2 left-1/2 h-px w-6 -translate-x-1/2 -translate-y-1/2 bg-white/80"></div>
              </div>
            </animated.div>

            {/* Exposure scale (bottom center) */}
            <animated.div
              style={exposureScaleSpring}
              className="absolute bottom-3 left-1/2 -translate-x-1/2 text-xs text-white/80"
            >
              <div className="flex items-center gap-2 font-mono tracking-wider">
                <span>-3</span>
                <span>2</span>
                <span>1</span>
                <span className="mx-1 inline-block h-3 w-2 bg-white"></span>
                <span>1</span>
                <span>2</span>
                <span>+3</span>
              </div>
            </animated.div>
          </animated.div>
        </div>
      </div>
    </>
  );
};
