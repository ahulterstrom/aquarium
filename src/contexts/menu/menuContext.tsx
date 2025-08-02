import { createContext } from "react";

export type MenuName = "none" | "pause" | "settings" | "stats" | "credits";

export interface MenuContextType {
  openMenu: (menu: MenuName) => void;
  closeMenu: () => void;
  currentMenu: MenuName | null;
}

export const MenuContext = createContext<MenuContextType | undefined>(
  undefined,
);
