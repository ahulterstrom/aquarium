import { Box, Html, Loader, PerspectiveCamera, Stage } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Leva } from "leva";
import { Suspense } from "react";

import { CustomButton } from "@/components/customButton";
import { CustomCameraControls } from "@/components/customCameraControls";
import { DebugControls } from "@/components/debugControls";
import { MenuManager } from "@/managers/menuManager";
import { SoundProvider } from "@/contexts/sound/soundContextProvider";
import { useGame } from "@/stores/useGame";

import "./App.css";
import { MenuProvider } from "@/contexts/menu/menuContextProvider";
import { SceneManager } from "@/managers/sceneManager";
import { SceneProvider } from "@/contexts/scene/sceneContextProvider";
import { UIManager } from "@/managers/uiManager";
import { useGridStore } from "@/stores/gridStore";
import { useUIStore } from "@/stores/uiStore";

function App() {
  const isDebugging = useGame.use.isDebugging();
  const score = useGame.use.score();
  const increaseScore = useGame.use.increaseScore();
  const { placementMode, selectedTankId, selectTank, setPlacementMode } =
    useUIStore();

  return (
    <>
      <SoundProvider>
        <SceneProvider>
          <MenuProvider>
            <UIManager />
            <MenuManager />
            <Canvas
              shadows
              onPointerMissed={() => {
                console.log("Canvas pointer missed");
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
            <Leva hidden={!isDebugging} collapsed flat />
          </MenuProvider>
        </SceneProvider>
      </SoundProvider>
    </>
  );
}

export default App;
