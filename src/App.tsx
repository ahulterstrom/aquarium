import { Loader } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Leva } from "leva";
import { Suspense } from "react";

import { DebugControls } from "@/components/debugControls";
import { SoundProvider } from "@/contexts/sound/soundContextProvider";
import { MenuManager } from "@/managers/menuManager";
import { useGame } from "@/stores/useGame";

import { MenuProvider } from "@/contexts/menu/menuContextProvider";
import { SceneProvider } from "@/contexts/scene/sceneContextProvider";
import { SceneManager } from "@/managers/sceneManager";
import { UIManager } from "@/managers/uiManager";
import { useUIStore } from "@/stores/uiStore";
import "./App.css";

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
    </>
  );
}

export default App;
