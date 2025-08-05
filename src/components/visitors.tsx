import { useUIStore } from "@/stores/uiStore";
import { useRef, useState, useCallback } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { getVisitorSystem } from "@/components/systems/visitorSystem";

const VisitorMesh = ({
  visitorId,
  onClick,
}: {
  visitorId: string;
  onClick: (visitorId: string) => void;
}) => {
  const meshRef = useRef<THREE.Group>(null);
  const bodyMaterialRef = useRef<THREE.MeshLambertMaterial>(null);
  const orbMaterialRef = useRef<THREE.MeshBasicMaterial>(null);

  // Get color based on visitor state
  const getVisitorColor = (state: string) => {
    switch (state) {
      case "entering":
        return 0x00ff00; // Green - just arrived
      case "exploring":
        return 0xffff00; // Yellow - looking around
      case "thinking":
        return 0x800080; // Purple - deciding what to do
      case "viewing":
        return 0x0000ff; // Blue - engaged with content
      case "satisfied":
        return 0xff8000; // Orange - happy, ready to leave
      case "leaving":
        return 0xff0000; // Red - leaving
      default:
        return 0x888888; // Gray - default
    }
  };

  // Update position and color imperatively every frame
  useFrame(() => {
    if (!meshRef.current) return;
    
    const visitorSystem = getVisitorSystem();
    const visitor = visitorSystem.getVisitors().find(v => v.id === visitorId);
    
    if (!visitor) return;

    // Update position directly
    meshRef.current.position.set(
      visitor.position.x,
      visitor.position.y,
      visitor.position.z
    );

    // Update material colors based on state
    const color = getVisitorColor(visitor.state);
    if (bodyMaterialRef.current) {
      bodyMaterialRef.current.color.setHex(color);
    }
    if (orbMaterialRef.current) {
      orbMaterialRef.current.color.setHex(color);
    }
  });

  return (
    <group
      ref={meshRef}
      onClick={(e) => {
        e.stopPropagation();
        onClick(visitorId);
      }}
      onPointerEnter={(e) => {
        e.stopPropagation();
        document.body.style.cursor = "pointer";
      }}
      onPointerLeave={() => {
        document.body.style.cursor = "default";
      }}
    >
      {/* Body */}
      <mesh>
        <boxGeometry args={[0.3, 0.6, 0.3]} />
        <meshLambertMaterial ref={bodyMaterialRef} color={0x888888} />
      </mesh>

      {/* Head */}
      <mesh position={[0, 0.4, 0]}>
        <sphereGeometry args={[0.12, 8, 8]} />
        <meshLambertMaterial color={0xfdbcb4} />
      </mesh>

      {/* State indicator (small floating orb) */}
      <mesh position={[0, 0.8, 0]}>
        <sphereGeometry args={[0.05, 6, 6]} />
        <meshBasicMaterial
          ref={orbMaterialRef}
          color={0x888888}
          transparent
          opacity={0.7}
        />
      </mesh>
    </group>
  );
};

export const Visitors = () => {
  const selectVisitor = useUIStore.use.selectVisitor();
  const [visitorIds, setVisitorIds] = useState<string[]>([]);
  
  const handleVisitorClick = useCallback((visitorId: string) => {
    selectVisitor(visitorId);
  }, [selectVisitor]);

  // Only update the visitor list when visitors are added/removed (not every frame)
  useFrame((state, delta) => {
    const frameCount = state.clock.elapsedTime;
    if (frameCount % 1 < delta) { // Check for new/removed visitors every 1 second
      const visitorSystem = getVisitorSystem();
      const currentVisitors = visitorSystem.getVisitors();
      const currentIds = currentVisitors.map(v => v.id);
      
      // Only update React state if the visitor list changed
      if (currentIds.length !== visitorIds.length || 
          !currentIds.every(id => visitorIds.includes(id))) {
        setVisitorIds(currentIds);
      }
    }
  });

  return (
    <>
      {visitorIds.map((visitorId) => (
        <VisitorMesh
          key={visitorId}
          visitorId={visitorId}
          onClick={handleVisitorClick}
        />
      ))}
    </>
  );
};
