import { DollarSign } from "lucide-react";
import { useGameStore } from "../../stores/gameStore";
import { useEffect, useRef } from "react";

interface MoneyGainAnimation {
  id: number;
  amount: number;
  element: HTMLDivElement;
  startTime: number;
}

export const MoneyDisplay = () => {
  const money = useGameStore.use.money();
  const containerRef = useRef<HTMLDivElement>(null);
  const animationsRef = useRef<Map<number, MoneyGainAnimation>>(new Map());
  const nextIdRef = useRef(0);

  const createMoneyGainAnimation = (amount: number) => {
    // Delay the animation by 300ms
    setTimeout(() => {
      if (!containerRef.current) return;

      const id = nextIdRef.current++;
      const element = document.createElement("div");

      // Add keyframes to document if not already present
      let styleSheet = document.getElementById("money-animations");
      if (!styleSheet) {
        styleSheet = document.createElement("style");
        styleSheet.id = "money-animations";
        document.head.appendChild(styleSheet);
      }

      // Style the element with inline styles
      element.textContent = `+$${amount}`;
      element.style.position = "absolute";
      element.style.fontSize = "14px";
      element.style.fontWeight = "bold";
      element.style.color = "#10b981"; // text-green-500
      element.style.pointerEvents = "none";
      element.style.userSelect = "none";
      element.style.zIndex = "1000";

      // Random offset position
      const randomX = -10 + Math.random() * 60; // -20px to 40px
      const randomY = 20 - Math.random() * 20; // -20px to -40px
      element.style.left = `${randomX}px`;
      element.style.top = `${randomY}px`;

      // Apply animation
      element.style.animation = `moneyGain 1.5s ease-out forwards`;

      // Add to container
      containerRef.current.appendChild(element);

      // Store animation data
      const animation: MoneyGainAnimation = {
        id,
        amount,
        element,
        startTime: Date.now(),
      };
      animationsRef.current.set(id, animation);

      // Clean up after animation
      setTimeout(() => {
        if (element.parentNode) {
          element.parentNode.removeChild(element);
        }
        animationsRef.current.delete(id);
      }, 1500);
    }, 150);
  };

  useEffect(() => {
    let previousMoney = useGameStore.getState().money;

    // Subscribe to money changes
    const unsubscribe = useGameStore.subscribe((state) => {
      const currentMoney = state.money;
      if (currentMoney > previousMoney) {
        const gain = currentMoney - previousMoney;
        createMoneyGainAnimation(gain);
      }
      previousMoney = currentMoney;
    });

    return unsubscribe;
  }, []);

  // Clean up animations on unmount
  useEffect(() => {
    const animations = animationsRef.current;
    return () => {
      animations.forEach((animation) => {
        if (animation.element.parentNode) {
          animation.element.parentNode.removeChild(animation.element);
        }
      });
      animations.clear();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative flex w-[4rem] items-center gap-1"
    >
      <DollarSign className="h-4 w-4 text-green-600" />
      <span className="font-semibold text-green-700">{money}</span>
    </div>
  );
};
