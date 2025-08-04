import { useEffect, useRef } from 'react';
import { useThree } from '@react-three/fiber';
import { Vector2, Vector3, Raycaster } from 'three';
import { useUIStore } from '../stores/uiStore';

interface TouchState {
  startPos: Vector2;
  currentPos: Vector2;
  startTime: number;
  isPinching: boolean;
  pinchDistance: number;
}

export function useTouchControls() {
  const { camera, gl, scene } = useThree();
  const touchStateRef = useRef<TouchState>({
    startPos: new Vector2(),
    currentPos: new Vector2(),
    startTime: 0,
    isPinching: false,
    pinchDistance: 0,
  });
  
  const { setHoveredEntity, selectTank, selectFish } = useUIStore();
  const raycaster = new Raycaster();
  
  useEffect(() => {
    const domElement = gl.domElement;
    
    const handleTouchStart = (event: TouchEvent) => {
      event.preventDefault();
      const touch = event.touches[0];
      const rect = domElement.getBoundingClientRect();
      
      touchStateRef.current.startPos.set(
        ((touch.clientX - rect.left) / rect.width) * 2 - 1,
        -((touch.clientY - rect.top) / rect.height) * 2 + 1
      );
      touchStateRef.current.currentPos.copy(touchStateRef.current.startPos);
      touchStateRef.current.startTime = Date.now();
      
      if (event.touches.length === 2) {
        touchStateRef.current.isPinching = true;
        const dx = event.touches[0].clientX - event.touches[1].clientX;
        const dy = event.touches[0].clientY - event.touches[1].clientY;
        touchStateRef.current.pinchDistance = Math.sqrt(dx * dx + dy * dy);
      }
    };
    
    const handleTouchMove = (event: TouchEvent) => {
      event.preventDefault();
      
      if (touchStateRef.current.isPinching && event.touches.length === 2) {
        // Handle pinch zoom
        const dx = event.touches[0].clientX - event.touches[1].clientX;
        const dy = event.touches[0].clientY - event.touches[1].clientY;
        const newDistance = Math.sqrt(dx * dx + dy * dy);
        
        const scale = newDistance / touchStateRef.current.pinchDistance;
        // Apply zoom logic here
        
        touchStateRef.current.pinchDistance = newDistance;
      } else if (event.touches.length === 1) {
        // Handle single touch move
        const touch = event.touches[0];
        const rect = domElement.getBoundingClientRect();
        
        touchStateRef.current.currentPos.set(
          ((touch.clientX - rect.left) / rect.width) * 2 - 1,
          -((touch.clientY - rect.top) / rect.height) * 2 + 1
        );
        
        // Update hover state
        raycaster.setFromCamera(touchStateRef.current.currentPos, camera);
        const intersects = raycaster.intersectObjects(scene.children, true);
        
        if (intersects.length > 0) {
          const object = intersects[0].object;
          const userData = object.userData;
          if (userData.id) {
            setHoveredEntity(userData.id);
          }
        } else {
          setHoveredEntity(null);
        }
      }
    };
    
    const handleTouchEnd = (event: TouchEvent) => {
      event.preventDefault();
      
      if (event.touches.length === 0) {
        touchStateRef.current.isPinching = false;
        
        // Check if it was a tap
        const timeDiff = Date.now() - touchStateRef.current.startTime;
        const posDiff = touchStateRef.current.startPos.distanceTo(
          touchStateRef.current.currentPos
        );
        
        if (timeDiff < 300 && posDiff < 0.1) {
          // Handle tap
          raycaster.setFromCamera(touchStateRef.current.currentPos, camera);
          const intersects = raycaster.intersectObjects(scene.children, true);
          
          if (intersects.length > 0) {
            const object = intersects[0].object;
            const userData = object.userData;
            
            if (userData.type === 'tank') {
              selectTank(userData.id);
            } else if (userData.type === 'fish') {
              selectFish(userData.id);
            }
          } else {
            selectTank(null);
            selectFish(null);
          }
        }
      }
    };
    
    domElement.addEventListener('touchstart', handleTouchStart, { passive: false });
    domElement.addEventListener('touchmove', handleTouchMove, { passive: false });
    domElement.addEventListener('touchend', handleTouchEnd, { passive: false });
    
    return () => {
      domElement.removeEventListener('touchstart', handleTouchStart);
      domElement.removeEventListener('touchmove', handleTouchMove);
      domElement.removeEventListener('touchend', handleTouchEnd);
    };
  }, [camera, gl, scene, setHoveredEntity, selectTank, selectFish]);
  
  return {
    isTouching: touchStateRef.current.isPinching,
  };
}