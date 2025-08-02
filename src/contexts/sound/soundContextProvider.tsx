// src/components/SoundProvider.tsx
import { useEffect, useRef } from "react";

import { useGame } from "@/stores/useGame";
import { SoundController } from "@/controllers/soundController";
import { SoundContext } from "@/contexts/sound/soundContext";

export const SoundProvider = ({ children }: { children: React.ReactNode }) => {
  const soundController = useRef(new SoundController());
  const isMuted = useGame.use.isMuted();
  const musicVolume = useGame.use.musicVolume();
  const sfxVolume = useGame.use.sfxVolume();
  const masterVolume = useGame.use.masterVolume();

  useEffect(() => {
    // register once
    soundController.current.register(
      "bgm",
      {
        src: "/rainy-day-in-a-recliner-piano.mp3",
        loop: true,
        volume: 0.4,
        allowMultiple: false,
      },
      "music",
    );
    soundController.current.register(
      "punch",
      { src: "/punch1.mp3", loop: false, volume: 0.4 },
      "sfx",
    );
    // …register other sounds…
  }, []);

  useEffect(() => {
    // seed master & channel settings
    soundController.current.setMasterMute(isMuted);
    soundController.current.setMasterVolume(masterVolume);
    soundController.current.setChannelVolume("music", musicVolume);
    soundController.current.setChannelVolume("sfx", sfxVolume);

    // kick off background music
    soundController.current.play("bgm");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // re-seed on any setting change
  useEffect(() => {
    soundController.current.setMasterMute(isMuted);
  }, [isMuted]);
  useEffect(() => {
    soundController.current.setMasterVolume(masterVolume);
  }, [masterVolume]);
  useEffect(() => {
    soundController.current.setChannelVolume("music", musicVolume);
  }, [musicVolume]);
  useEffect(() => {
    soundController.current.setChannelVolume("sfx", sfxVolume);
  }, [sfxVolume]);

  return (
    <SoundContext.Provider value={{ soundController: soundController.current }}>
      {children}
    </SoundContext.Provider>
  );
};
