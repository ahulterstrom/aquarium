import { Camera, Download, Copy, Sun, X } from "lucide-react";
import { useCallback, useEffect } from "react";
import { screenshotService } from "@/services/ScreenshotService";
import { useUIStore } from "@/stores/uiStore";
import { useCanvasStore } from "@/stores/canvasStore";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export const ScreenshotControls = () => {
  const canvas = useCanvasStore.use.canvas();
  const isPhotoMode = useUIStore.use.isPhotoMode();
  const togglePhotoMode = useUIStore.use.togglePhotoMode();
  const exitPhotoMode = useUIStore.use.exitPhotoMode();

  const handleScreenshot = useCallback(
    async (options?: { toClipboard?: boolean }) => {
      if (!canvas) {
        console.warn("Canvas not available for screenshot");
        return;
      }

      console.log("Taking screenshot, canvas:", canvas);
      console.log("Canvas dimensions:", canvas.width, "x", canvas.height);

      screenshotService.triggerFlash();
    },
    [canvas],
  );

  if (!isPhotoMode) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              onClick={togglePhotoMode}
              className="pointer-events-auto fixed top-4 right-4 z-50 size-10"
            >
              <Camera className="size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Photo Mode</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <div className="pointer-events-none fixed inset-0 z-50">
      {/* Photo mode overlay */}
      <div className="pointer-events-none absolute inset-0 border-4 border-white/20" />

      {/* Controls */}
      <div className="pointer-events-auto absolute bottom-28 left-1/2 -translate-x-1/2 transform">
        <div className="glass flex items-center gap-2 p-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="default"
                onClick={() => handleScreenshot()}
                className="size-10 bg-transparent text-foreground hover:bg-white/20 hover:shadow-lg"
              >
                <Download className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Download</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="default"
                onClick={() => handleScreenshot({ toClipboard: true })}
                className="size-10 bg-transparent text-foreground hover:bg-white/20 hover:shadow-lg"
              >
                <Copy className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Copy to Clipboard</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="default"
                onClick={exitPhotoMode}
                className="size-10 bg-transparent text-foreground hover:bg-white/20 hover:shadow-lg"
              >
                <X className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Exit Photo Mode</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            onClick={exitPhotoMode}
            className="pointer-events-auto absolute top-4 right-4 size-10 hover:bg-white/20"
          >
            <X className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Exit Photo Mode</p>
        </TooltipContent>
      </Tooltip>

      {/* Instructions */}
      <div className="pointer-events-none absolute top-4 right-0 left-0 mx-auto w-60">
        <div className="glass p-3 text-sm">
          <div className="font-medium">Photo Mode</div>
        </div>
      </div>

      <div className="relative mx-auto h-screen w-full text-white">
        {/* <!-- ===== Viewfinder Overlay ===== --> */}
        <div
          className="pointer-events-none absolute inset-0"
          aria-hidden="true"
        >
          {/* <!-- 3x3 grid lines --> */}
          <div className="absolute inset-0">
            {/* <!-- verticals --> */}
            <div className="absolute top-0 bottom-0 left-[33.333%] w-px bg-white/40"></div>
            <div className="absolute top-0 bottom-0 left-[66.666%] w-px bg-white/40"></div>
            {/* <!-- horizontals --> */}
            <div className="absolute top-[33.333%] right-0 left-0 h-px bg-white/40"></div>
            <div className="absolute top-[66.666%] right-0 left-0 h-px bg-white/40"></div>
          </div>

          {/* <!-- Corner brackets --> */}
          <div className="absolute top-20 left-20 h-9 w-9 border-t-2 border-l-2 border-white/70"></div>
          <div className="absolute top-20 right-20 h-9 w-9 border-t-2 border-r-2 border-white/70"></div>
          <div className="absolute bottom-20 left-20 h-9 w-9 border-b-2 border-l-2 border-white/70"></div>
          <div className="absolute right-20 bottom-20 h-9 w-9 border-r-2 border-b-2 border-white/70"></div>

          {/* <!-- Center focus reticle --> */}
          <div className="absolute inset-0 grid place-items-center">
            <div className="relative h-16 w-16 rounded-full border-2 border-white/70">
              <div className="absolute top-1/2 left-1/2 h-6 w-px -translate-x-1/2 -translate-y-1/2 bg-white/80"></div>
              <div className="absolute top-1/2 left-1/2 h-px w-6 -translate-x-1/2 -translate-y-1/2 bg-white/80"></div>
            </div>
          </div>

          {/* <!-- Exposure scale (bottom center) --> */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 text-xs text-white/80">
            <div className="flex items-center gap-2 font-mono tracking-wider">
              <span>-3</span>
              <span>2</span>
              <span>1</span>
              <span className="mx-1 inline-block h-3 w-2 bg-white"></span>
              <span>1</span>
              <span>2</span>
              <span>+3</span>
            </div>
          </div>
        </div>
        {/* <!-- ===== /Viewfinder Overlay ===== --> */}
      </div>
    </div>
  );
};
