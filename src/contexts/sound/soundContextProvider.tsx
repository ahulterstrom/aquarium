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
      "crowd",
      {
        src: "sounds/crowd.ogg",
        loop: true,
        volume: 0.4,
        allowMultiple: false,
      },
      "sfx",
    );
    soundController.current.register(
      "bgm1",
      {
        src: "sounds/floatinggarden.mp3",
        loop: false,
        volume: 0.4,
        allowMultiple: false,
      },
      "music",
    );
    soundController.current.register(
      "bgm2",
      {
        src: "sounds/hearty.mp3",
        loop: false,
        volume: 0.4,
        allowMultiple: false,
      },
      "music",
    );
    soundController.current.register(
      "bgm3",
      {
        src: "sounds/longnight.mp3",
        loop: false,
        volume: 0.4,
        allowMultiple: false,
      },
      "music",
    );
    soundController.current.register(
      "bgm4",
      {
        src: "sounds/yesterday.mp3",
        loop: false,
        volume: 0.4,
        allowMultiple: false,
      },
      "music",
    );
    soundController.current.register(
      "coinpickup",
      { src: "/sounds/coinpickup.mp3", loop: false, volume: 0.4 },
      "sfx",
    );
    soundController.current.register(
      "coinfall1",
      { src: "/sounds/coinfall1.wav", loop: false, volume: 0.1 },
      "sfx",
    );
    soundController.current.register(
      "coinfall2",
      { src: "/sounds/coinfall2.off", loop: false, volume: 0.1 },
      "sfx",
    );
    soundController.current.register(
      "coinfall3",
      { src: "/sounds/coinfall3.mp3", loop: false, volume: 0.1 },
      "sfx",
    );
    soundController.current.register(
      "coinfall4",
      { src: "/sounds/coinfall4.wav", loop: false, volume: 0.1 },
      "sfx",
    );
    soundController.current.register(
      "objectivecollect",
      { src: "/sounds/objectivecollect.wav", loop: false, volume: 0.4 },
      "sfx",
    );
  }, []);

  useEffect(() => {
    // seed master & channel settings
    soundController.current.setMasterMute(isMuted);
    soundController.current.setMasterVolume(masterVolume);
    soundController.current.setChannelVolume("music", musicVolume);
    soundController.current.setChannelVolume("sfx", sfxVolume);

    // create background music playlist and start playing
    soundController.current.createPlaylist("bgm", [
      "bgm1",
      "bgm2",
      "bgm3",
      "bgm4",
    ]);
    soundController.current.playPlaylist("bgm");
    soundController.current.play("crowd");
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
