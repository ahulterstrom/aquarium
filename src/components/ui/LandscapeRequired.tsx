"use client";

import { useState, useEffect } from "react";
import { RotateCcw, Smartphone } from "lucide-react";

export const LandscapeRequired = () => {
  const [isPortrait, setIsPortrait] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkOrientation = () => {
      const isMobileDevice =
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent,
        );
      const isPortraitMode = window.innerHeight > window.innerWidth;

      setIsMobile(isMobileDevice);
      setIsPortrait(isPortraitMode);
    };

    // Check on mount
    checkOrientation();

    // Listen for orientation changes
    window.addEventListener("resize", checkOrientation);
    window.addEventListener("orientationchange", checkOrientation);

    return () => {
      window.removeEventListener("resize", checkOrientation);
      window.removeEventListener("orientationchange", checkOrientation);
    };
  }, []);

  // Only show on mobile in portrait mode
  if (!isMobile || !isPortrait) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black text-white">
      <div className="flex flex-col items-center space-y-6 px-8 text-center">
        <Smartphone className="h-16 w-16 text-blue-400" />

        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Rotate Your Device</h1>
          <p className="text-lg text-gray-300">
            This game is best experienced in landscape mode
          </p>
        </div>

        <div className="flex items-center space-x-2 rounded-lg bg-gray-800 px-4 py-3">
          <RotateCcw className="h-5 w-5 text-blue-400" />
          <span className="text-sm">Turn your phone sideways</span>
        </div>
      </div>
    </div>
  );
};
