import { Loader } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Leva } from "leva";
import { Suspense, useRef } from "react";

import { DebugControls } from "@/components/debugControls";
import { SoundProvider } from "@/contexts/sound/soundContextProvider";
import { MenuManager } from "@/managers/menuManager";

import { MenuProvider } from "@/contexts/menu/menuContextProvider";
import { SceneProvider } from "@/contexts/scene/sceneContextProvider";
import { SceneManager } from "@/managers/sceneManager";
import { UIManager } from "@/managers/uiManager";
import { useUIStore } from "@/stores/uiStore";
import { Toaster } from "@/components/ui/sonner";
import "./App.css";

function App() {
  const { placementMode, selectTank } = useUIStore();

  return (
    <>
      <SoundProvider>
        <SceneProvider>
          <MenuProvider>
            <UIManager />
            <MenuManager />
            <Canvas
              shadows
              gl={{ preserveDrawingBuffer: true }}
              onPointerMissed={(event) => {
                // Ignore all right mouse button events (button === 2)
                if (event.button === 2) {
                  return;
                }

                if (placementMode !== "tank") {
                  selectTank(null);
                }
              }}
            >
              <color attach="background" args={["skyblue"]} />
              <Suspense fallback={null}>
                <DebugControls />
                {/* <PerspectiveCamera makeDefault position={[0, 0, 5]} />
                  <CustomCameraControls /> */}
                <SceneManager />
              </Suspense>
            </Canvas>
            <Loader />
            <Leva hidden={true} collapsed flat />
          </MenuProvider>
        </SceneProvider>
      </SoundProvider>
      <Toaster position="bottom-right" />
    </>
  );
}

export default App;
