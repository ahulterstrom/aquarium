import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMenu } from "@/contexts/menu/useMenu";
import { cn } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";
import React from "react";

interface GameMenuCardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
  headerClassName?: string;
  titleClassName?: string;
  contentClassName?: string;
  showBackButton?: boolean;
}

export function GameMenuCard({
  title,
  children,
  className = "",
  headerClassName = "",
  titleClassName = "",
  contentClassName = "",
  showBackButton = true,
}: GameMenuCardProps) {
  const { closeMenu } = useMenu();

  return (
    <Card
      className={cn(
        `w-xl gap-0 border-2 border-purple-500/20 bg-black/80 shadow-lg shadow-purple-500/10`,
        className,
      )}
    >
      <CardHeader
        className={cn(
          `relative gap-0 border-b border-purple-500/20 pb-4`,
          headerClassName,
        )}
      >
        {showBackButton && (
          <button
            onClick={closeMenu}
            className="absolute top-0 left-4 flex items-center gap-1 text-gray-400 transition-colors hover:text-white"
            aria-label="Back to main menu"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="text-sm">Back</span>
          </button>
        )}
        <CardTitle
          className={cn(
            "text-center text-2xl font-bold text-white",
            titleClassName,
          )}
        >
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className={cn(`space-y-4 p-6`, contentClassName)}>
        {children}
        <button
          onClick={closeMenu}
          className="w-full rounded-md border border-purple-500/30 bg-transparent py-3 text-lg font-bold text-purple-400 transition-all hover:bg-purple-500/10 hover:text-purple-300"
        >
          CLOSE
        </button>
      </CardContent>
    </Card>
  );
}
