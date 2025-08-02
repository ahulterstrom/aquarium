import { MenuContext, MenuName } from "@/contexts/menu/menuContext";
import { useState, useEffect, ReactNode } from "react";

export const MenuProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  // Start with gameOverlay as the default menu
  const [menuStack, setMenuStack] = useState<MenuName[]>(["none"]);

  const openMenu = (menu: MenuName) =>
    setMenuStack((stack) => [...stack, menu]);

  const closeMenu = () =>
    setMenuStack((stack) => (stack.length > 1 ? stack.slice(0, -1) : ["none"]));

  const currentMenu =
    menuStack.length > 0 ? menuStack[menuStack.length - 1] : null;

  // Single Escape‐handler
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setMenuStack((stack) => {
        // If more than one menu on the stack, pop the top
        if (stack.length > 1) {
          return stack.slice(0, -1);
        }
        // Only the default overlay remains => open settings
        if (stack[0] === "none") {
          return ["none", "pause"];
        }
        // Fallback to default
        return ["none"];
      });
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <MenuContext.Provider value={{ openMenu, closeMenu, currentMenu }}>
      {children}
    </MenuContext.Provider>
  );
};
