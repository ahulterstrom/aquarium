import { SquareMenu, Volume2, VolumeX } from "lucide-react";

import { useMenu } from "@/contexts/menu/useMenu";
import { useGame } from "@/stores/useGame";

export const GameOverlay = () => {
  const isMuted = useGame.use.isMuted();
  const toggleMute = useGame.use.toggleMute();
  const { openMenu, closeMenu, currentMenu } = useMenu();

  const handleMenuClick = () => {
    if (currentMenu === "pause") {
      closeMenu();
    } else if (currentMenu === "none") {
      openMenu("pause");
    }
  };

  return (
    <div className="pointer-events-none absolute top-0 left-0 z-999 flex h-full w-full flex-col items-center justify-center select-none">
      <div className="absolute right-0 bottom-0 m-4 flex gap-4">
        <button
          className="pointer-events-auto text-white opacity-60 hover:opacity-80"
          onClick={toggleMute}
        >
          {isMuted ? <VolumeX /> : <Volume2 />}
        </button>
        <button
          className="pointer-events-auto text-white opacity-60 hover:opacity-80"
          onClick={handleMenuClick}
        >
          {<SquareMenu />}
        </button>
      </div>
    </div>
  );
};
