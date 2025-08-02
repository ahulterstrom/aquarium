import { MeshButton } from "@/components/MeshButton";
import { useSound } from "@/contexts/sound/useSound";

export const CustomButton = ({ onClick }: { onClick: () => void }) => {
  const soundController = useSound();

  const handleClick = () => {
    soundController.soundController.play("punch");
    onClick();
  };

  return (
    <MeshButton
      position={[0, 2, 0]}
      onClick={handleClick}
      label="Increase Score"
    />
  );
};
