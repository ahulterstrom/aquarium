import { Lock } from "lucide-react";
import { ReactNode } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Base lock overlay component
interface LockOverlayProps {
  isVisible: boolean;
  reason?: string;
  intensity?: "light" | "medium" | "heavy";
  icon?: ReactNode;
  showIcon?: boolean;
}

export const LockOverlay = ({
  isVisible,
  reason,
  intensity = "light",
  icon = <Lock className="size-6" />,
  showIcon = true,
}: LockOverlayProps) => {
  if (!isVisible) return null;

  const intensityClasses = {
    light: "bg-gray-200/50 backdrop-blur-[1px]",
    medium: "bg-gray-200/80 backdrop-blur-sm",
    heavy: "bg-gray-300/90 backdrop-blur-md",
  };

  const overlay = (
    <div
      className={cn(
        "absolute inset-0 z-10 flex flex-col items-center justify-center rounded-md text-slate-100/80 transition-all",
        intensityClasses[intensity],
      )}
      style={{ cursor: "not-allowed" }}
    >
      {showIcon && (
        <div className="rounded-full bg-slate-700/80 p-2 opacity-80">
          {icon}
        </div>
      )}
      {reason && (
        <div className="text-center text-sm font-medium">{reason}</div>
      )}
    </div>
  );

  // If there's a reason, wrap with tooltip
  if (reason) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>{overlay}</TooltipTrigger>
          <TooltipContent>
            <p>{reason}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return overlay;
};

// Locked card wrapper component
interface LockedCardProps {
  children: ReactNode;
  isLocked: boolean;
  lockReason?: string;
  lockIcon?: ReactNode;
  intensity?: "light" | "medium" | "heavy";
  className?: string;
}

export const LockedCard = ({
  children,
  isLocked,
  lockReason,
  lockIcon,
  intensity = "light",
  className,
}: LockedCardProps) => {
  return (
    <div className={cn("relative", className)}>
      {children}
      <LockOverlay
        isVisible={isLocked}
        reason={lockReason}
        intensity={intensity}
        icon={lockIcon}
      />
    </div>
  );
};

// Locked button component
interface LockedButtonProps extends React.ComponentProps<typeof Button> {
  isLocked?: boolean;
  lockReason?: string;
  children: ReactNode;
}

export const LockedButton = ({
  isLocked = false,
  lockReason,
  disabled,
  className,
  children,
  onClick,
  ...props
}: LockedButtonProps) => {
  const isDisabled = disabled || isLocked;

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (isLocked) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    onClick?.(e);
  };

  const button = (
    <Button
      {...props}
      disabled={isDisabled}
      className={cn(isLocked && "cursor-not-allowed opacity-50", className)}
      onClick={handleClick}
    >
      {isLocked && <Lock className="mr-2 h-4 w-4" />}
      {children}
    </Button>
  );

  // If locked and has reason, wrap with tooltip
  if (isLocked && lockReason) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>{button}</TooltipTrigger>
          <TooltipContent>
            <p>{lockReason}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return button;
};

// Locked section wrapper component
interface LockedSectionProps {
  children: ReactNode;
  isLocked: boolean;
  lockReason?: string;
  lockIcon?: ReactNode;
  intensity?: "light" | "medium" | "heavy";
  className?: string;
}

export const LockedSection = ({
  children,
  isLocked,
  lockReason,
  lockIcon,
  intensity = "light",
  className,
}: LockedSectionProps) => {
  return (
    <div className={cn("relative", className)}>
      {children}
      <LockOverlay
        isVisible={isLocked}
        reason={lockReason}
        intensity={intensity}
        icon={lockIcon}
        showIcon={false} // Sections don't need the lock icon by default
      />
    </div>
  );
};
