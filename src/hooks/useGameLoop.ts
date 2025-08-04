import { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGameStore } from '../stores/gameStore';
import { useEconomyStore } from '../stores/economyStore';
import { Fish } from '../game/entities/Fish';
import { Visitor } from '../game/entities/Visitor';
import { Tank } from '../game/entities/Tank';

export function useGameLoop() {
  const lastUpdateRef = useRef(Date.now());
  const dayProgressRef = useRef(0);
  
  const {
    isPaused,
    gameSpeed,
    fish,
    visitors,
    tanks,
    updateFish,
    updateVisitor,
    updateTank,
    nextDay,
  } = useGameStore();
  
  const { 
    resetDaily,
    addUtilitiesExpense,
    addStaffExpense,
  } = useEconomyStore();
  
  // Entity instances cache
  const fishInstancesRef = useRef<Map<string, Fish>>(new Map());
  const visitorInstancesRef = useRef<Map<string, Visitor>>(new Map());
  const tankInstancesRef = useRef<Map<string, Tank>>(new Map());
  
  // Main game loop
  useFrame((state, delta) => {
    if (isPaused) return;
    
    const now = Date.now();
    const deltaTime = (now - lastUpdateRef.current) / 1000 * gameSpeed;
    lastUpdateRef.current = now;
    
    // Update day progress
    dayProgressRef.current += deltaTime;
    const dayDurationInSeconds = 300; // 5 minutes per day
    
    if (dayProgressRef.current >= dayDurationInSeconds) {
      handleDayEnd();
      dayProgressRef.current = 0;
    }
    
    // Update fish
    fish.forEach((fishData) => {
      let fishInstance = fishInstancesRef.current.get(fishData.id);
      if (!fishInstance) {
        // Fish instance would be created by the scene
        return;
      }
      
      const tank = tanks.get(fishData.tankId);
      if (tank) {
        const tankInstance = tankInstancesRef.current.get(tank.id);
        if (tankInstance) {
          fishInstance.update(deltaTime, tankInstance.getBounds());
          updateFish(fishData.id, fishInstance.getData());
        }
      }
    });
    
    // Update visitors
    visitors.forEach((visitorData) => {
      let visitorInstance = visitorInstancesRef.current.get(visitorData.id);
      if (!visitorInstance) {
        // Visitor instance would be created by the scene
        return;
      }
      
      visitorInstance.update(deltaTime);
      updateVisitor(visitorData.id, visitorInstance.getData());
    });
    
    // Update tanks (water quality degradation)
    tanks.forEach((tankData) => {
      const degradationRate = 0.001 * tankData.fishIds.length;
      const newQuality = Math.max(0, tankData.waterQuality - degradationRate * deltaTime);
      updateTank(tankData.id, { waterQuality: newQuality });
      
      let tankInstance = tankInstancesRef.current.get(tankData.id);
      if (tankInstance) {
        tankInstance.updateWaterQuality(newQuality);
      }
    });
  });
  
  const handleDayEnd = () => {
    // Calculate daily expenses
    const tankCount = tanks.size;
    const fishCount = fish.size;
    
    addUtilitiesExpense(tankCount * 50); // $50 per tank per day
    addStaffExpense(100 + tankCount * 20); // Base $100 + $20 per tank
    
    // Move to next day
    nextDay();
    resetDaily();
  };
  
  // Cleanup
  useEffect(() => {
    return () => {
      fishInstancesRef.current.forEach(instance => instance.dispose());
      visitorInstancesRef.current.forEach(instance => instance.dispose());
      tankInstancesRef.current.forEach(instance => instance.dispose());
      
      fishInstancesRef.current.clear();
      visitorInstancesRef.current.clear();
      tankInstancesRef.current.clear();
    };
  }, []);
  
  return {
    fishInstances: fishInstancesRef.current,
    visitorInstances: visitorInstancesRef.current,
    tankInstances: tankInstancesRef.current,
    dayProgress: dayProgressRef.current / 300, // 0-1 progress through day
  };
}