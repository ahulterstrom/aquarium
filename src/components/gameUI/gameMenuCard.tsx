import { Button } from "@/components/ui/button";
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
    <Card className={cn(`w-xl gap-0 shadow-lg`, className)}>
      <CardHeader className={cn(`relative gap-0 pb-4`, headerClassName)}>
        {showBackButton && (
          <Button
            variant="onGlass"
            onClick={closeMenu}
            className="absolute top-0 left-4 flex items-center gap-1"
            aria-label="Back to main menu"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="text-sm">Back</span>
          </Button>
        )}
        <CardTitle
          className={cn("text-center text-2xl font-bold", titleClassName)}
        >
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className={cn(`space-y-4 p-6`, contentClassName)}>
        {children}
        <Button
          onClick={closeMenu}
          variant="glass"
          className="h-12 w-full rounded-md border"
        >
          CLOSE
        </Button>
      </CardContent>
    </Card>
  );
}
