import { animated, useTransition } from "@react-spring/web";
import { ReactNode, useEffect } from "react";

import { GameOverlay } from "@/components/gameUI/gameOverlay";
import PauseMenu from "@/components/gameUI/pauseMenu";
import { SettingsMenu } from "@/components/gameUI/settingsMenu";
import { MenuName } from "@/contexts/menu/menuContext";
import { useMenu } from "@/contexts/menu/useMenu";
import { cn } from "@/lib/utils";
import { StatsMenu } from "@/components/gameUI/statsMenu";
import { CreditsMenu } from "@/components/gameUI/creditsMenu";

const menus: Record<MenuName, ReactNode> = {
  none: null,
  pause: <PauseMenu />,
  settings: <SettingsMenu />,
  stats: <StatsMenu />,
  credits: <CreditsMenu />,
};

export const MenuManager = () => {
  const { currentMenu } = useMenu();

  const transitions = useTransition(currentMenu, {
    from: () => ({
      opacity: 0,
      transform: "scale(0.9) translateY(100px)",
      zIndex: 50,
      pointerEvents: "none" as const,
    }),
    enter: {
      opacity: 1,
      transform: "scale(1) translateY(0)",
      zIndex: 60,
      delay: 50,
      pointerEvents:
        currentMenu === "none" ? ("none" as const) : ("auto" as const),
    },
    leave: () => ({
      opacity: 0,
      transform: "scale(1) translateY(0)",
      zIndex: 40,
      pointerEvents: "none" as const,
    }),
    config: (_, __, phase) => ({
      tension: phase === "leave" ? 400 : 300,
      friction: phase === "leave" ? 30 : 30,
    }),
  });

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add("dark");
  }, []);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {transitions((style, menuKey) => {
        return menuKey ? (
          <animated.div
            style={style}
            className={cn("absolute inset-0 flex items-center justify-center")}
          >
            {menus[menuKey]}
          </animated.div>
        ) : null;
      })}
    </div>
  );
};
