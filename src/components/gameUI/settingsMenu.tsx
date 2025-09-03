import { GameMenuCard } from "@/components/gameUI/gameMenuCard";
import { ResetProgressDialog } from "@/components/gameUI/resetProgressDialog";
import { SoundMenu } from "@/components/gameUI/soundMenu";

export const SettingsMenu = () => {
  return (
    <GameMenuCard title="Settings" className="w-md">
      <ResetProgressDialog />
      <SoundMenu />
    </GameMenuCard>
  );
};
