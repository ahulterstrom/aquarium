import { MenuContext } from "@/contexts/menu/menuContext";
import { useContext } from "react";

export function useMenu() {
  const ctx = useContext(MenuContext);
  if (!ctx) throw new Error("useMenu must be used within a <MenuProvider>");
  return ctx;
}
