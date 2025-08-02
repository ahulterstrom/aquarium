interface SettingsStore {
  // Gameplay
  fastMode: boolean;
  confirmEndTurn: boolean;
  biggerText: boolean;

  // Display
  screenShake: boolean;
  particleEffects: boolean;
  damageNumbers: boolean;

  // Audio
  masterVolume: number;
  sfxVolume: number;
  musicVolume: number;

  // Controls
  keyBindings: Record<string, string>;

  // Actions
  updateSetting: <K extends keyof SettingsStore>(
    key: K,
    value: SettingsStore[K],
  ) => void;
  resetToDefaults: () => void;
}
