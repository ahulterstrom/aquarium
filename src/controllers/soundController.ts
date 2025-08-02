import { Howl } from "howler";

type SoundConfig = {
  src: string;
  loop?: boolean;
  volume?: number;
  allowMultiple?: boolean;
};

type ChannelName = "music" | "sfx" | "voice";

export class SoundController {
  private sounds = new Map<string, Howl>();
  private soundConfigs = new Map<string, SoundConfig>(); // Store configs for allowMultiple
  private playingInstances = new Map<string, number[]>(); // Track all playing sound IDs per key
  private channels: Record<
    ChannelName,
    { sounds: Set<string>; volume: number; muted: boolean }
  > = {
    music: { sounds: new Set(), volume: 1, muted: false },
    sfx: { sounds: new Set(), volume: 1, muted: false },
    voice: { sounds: new Set(), volume: 1, muted: false },
  };
  private masterVolume = 1;
  private masterMuted = false;

  /** Register a sound under a key, assign it to a channel */
  register(key: string, config: SoundConfig, channel: ChannelName) {
    // If a Howl already exists for this key, stop and unload it to prevent duplicates (HMR fix)
    const existing = this.sounds.get(key);
    if (existing) {
      existing.stop();
      existing.unload();
      this.playingInstances.delete(key); // Clean up instances on unload
    }
    const howl = new Howl({
      src: [config.src],
      loop: config.loop || false,
      volume: config.volume ?? 1,
    });
    this.sounds.set(key, howl);
    this.soundConfigs.set(key, config); // Store config
    this.channels[channel].sounds.add(key);
  }

  /** Play a sound once (or loop if configured) */
  play(key: string) {
    const s = this.sounds.get(key);
    if (!s) throw new Error(`Sound ${key} not registered`);
    const config = this.soundConfigs.get(key);
    const allowMultiple = config?.allowMultiple ?? false;

    if (!allowMultiple && s.playing()) {
      // If already playing, stop it first
      this.stop(key);
    }

    // Always play the sound, but adjust volume based on mute status
    if (this.masterMuted || this.isChannelMuted(key)) {
      s.volume(0);
    } else {
      s.volume(this.computedVolume(key));
    }
    const id = s.play();
    if (!this.playingInstances.has(key)) this.playingInstances.set(key, []);
    this.playingInstances.get(key)!.push(id);

    // Clean up instance when it ends or is stopped
    // Only add end event for non-looping sounds
    const instanceConfig = this.soundConfigs.get(key);
    if (!instanceConfig?.loop) {
      s.once(
        "end",
        () => {
          const arr = this.playingInstances.get(key);
          if (arr)
            this.playingInstances.set(
              key,
              arr.filter((i) => i !== id),
            );
        },
        id,
      );
    }
    s.once(
      "stop",
      () => {
        const arr = this.playingInstances.get(key);
        if (arr)
          this.playingInstances.set(
            key,
            arr.filter((i) => i !== id),
          );
      },
      id,
    );
  }

  /** Stop a playing sound */
  stop(key: string) {
    const s = this.sounds.get(key);
    if (!s) return;
    const ids = this.playingInstances.get(key) || [];
    ids.forEach((id) => s.stop(id));
    this.playingInstances.set(key, []);
  }

  /** Get all currently playing sound instance IDs for a key */
  getPlayingInstances(key: string): number[] {
    return this.playingInstances.get(key) || [];
  }

  /** Fade a single sound */
  fade(key: string, toVol: number, duration: number) {
    const s = this.sounds.get(key);
    if (!s) return;
    s.fade(s.volume(), toVol, duration);
  }

  /** Fade an entire channel */
  fadeChannel(channel: ChannelName, toVol: number, duration: number) {
    this.channels[channel].volume = toVol;
    for (const key of this.channels[channel].sounds) {
      const s = this.sounds.get(key)!;
      s.fade(s.volume(), this.computedVolume(key), duration);
    }
  }

  /** Set mute/volume on channels or master */
  setMasterVolume(v: number) {
    this.masterVolume = v;
    this.updateAllSoundVolumes();
  }

  setMasterMute(m: boolean) {
    if (m === this.masterMuted) return; // No change

    this.masterMuted = m;

    // Apply to all currently playing sounds
    // Iterate through all playing instances
    this.playingInstances.forEach((ids, key) => {
      if (ids.length > 0) {
        const sound = this.sounds.get(key)!;
        if (m) {
          // When muting, set volume to 0 but keep playing
          sound.volume(0, ids[0]);
        } else if (!this.isChannelMuted(key)) {
          // When unmuting, restore proper volume if channel isn't muted
          sound.volume(this.computedVolume(key), ids[0]);
        }
      }
    });
  }

  setChannelVolume(c: ChannelName, v: number) {
    this.channels[c].volume = v;
    this.updateChannelSoundVolumes(c);
  }

  setChannelMute(c: ChannelName, m: boolean) {
    if (m === this.channels[c].muted) return; // No change

    this.channels[c].muted = m;

    // Update all playing sounds in this channel
    if (!this.masterMuted) {
      // Only if master isn't muted
      for (const key of this.channels[c].sounds) {
        const sound = this.sounds.get(key)!;
        if (sound.playing()) {
          if (m) {
            // When muting channel, set volume to 0
            sound.volume(0);
          } else {
            // When unmuting channel, restore proper volume
            sound.volume(this.computedVolume(key));
          }
        }
      }
    }
  }

  private isChannelMuted(key: string) {
    for (const [, cfg] of Object.entries(this.channels) as [
      ChannelName,
      { sounds: Set<string>; volume: number; muted: boolean },
    ][]) {
      if (cfg.sounds.has(key) && cfg.muted) return true;
    }
    return false;
  }

  /** Combined volume = master × channel × sound default */
  private computedVolume(key: string) {
    const config = this.soundConfigs.get(key);
    const defVol = config?.volume ?? 1; // Use stored config volume
    let chanVol = 1;
    for (const [, cfg] of Object.entries(this.channels) as [
      ChannelName,
      { sounds: Set<string>; volume: number; muted: boolean },
    ][]) {
      if (cfg.sounds.has(key)) chanVol = cfg.volume;
    }
    const volume = this.masterVolume * chanVol * defVol;
    return volume;
  }

  /** Update volumes for all sounds */
  private updateAllSoundVolumes() {
    if (this.masterMuted) return;

    this.sounds.forEach((sound, key) => {
      if (sound.playing() && !this.isChannelMuted(key)) {
        sound.volume(this.computedVolume(key));
      }
    });
  }

  /** Update volumes for all sounds in a channel */
  private updateChannelSoundVolumes(channel: ChannelName) {
    if (this.masterMuted || this.channels[channel].muted) return;

    for (const key of this.channels[channel].sounds) {
      const sound = this.sounds.get(key)!;
      if (sound.playing()) {
        sound.volume(this.computedVolume(key));
      }
    }
  }

  public logAllPlayingInstances() {
    this.playingInstances.forEach((instances, key) => {
      console.log(`  ${key}: ${JSON.stringify(instances)}`);
    });
  }
}
