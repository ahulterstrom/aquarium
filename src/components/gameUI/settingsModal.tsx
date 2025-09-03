import { ResetProgressDialog } from "@/components/gameUI/resetProgressDialog";
import { SoundMenu } from "@/components/gameUI/soundMenu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useUIStore } from "@/stores/uiStore";

export const SettingsModal = () => {
  const showSettingsModal = useUIStore.use.showSettingsModal();
  const setShowSettingsModal = useUIStore.use.setShowSettingsModal();

  return (
    <Dialog open={showSettingsModal} onOpenChange={setShowSettingsModal}>
      <DialogContent className="max-w-2xl" showOverlay>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            Settings
          </DialogTitle>
          <DialogDescription className="sr-only">
            View and adjust the settings.
          </DialogDescription>
        </DialogHeader>
        <ResetProgressDialog />
        <SoundMenu />
      </DialogContent>
    </Dialog>
  );
};
