import { SoundController } from "@/controllers/soundController";
import { createContext } from "react";

interface SoundContextType {
  soundController: SoundController;
}

export const SoundContext = createContext<SoundContextType | null>(null);
