import { useGame } from "@/stores/useGame";
import { useFrame, useThree } from "@react-three/fiber";
import { button, folder, useControls } from "leva";
import { Perf } from "r3f-perf";
import { useEffect, useState } from "react";

const DebugControlsUser = ({
  showPerf,
  setShowPerf,
}: {
  showPerf: boolean;
  setShowPerf: (showPerf: boolean) => void;
}) => {
  const score = useGame.use.score();
  const increaseScore = useGame.use.increaseScore();

  const controls = useControls(() => ({
    Score: folder(
      {
        Score: score,
        "Increase Score": button(increaseScore),
      },
      {
        collapsed: true,
      },
    ),
    Misc: folder(
      {
        "Show Performance": {
          value: showPerf,
          onChange: setShowPerf,
        },
      },
      {
        collapsed: true,
      },
    ),
  }));

  useFrame(() => {
    const [, set] = controls;

    set({
      Score: score,
    });
  });

  return null;
};

export const DebugControls = () => {
  const isDebugging = useGame.use.isDebugging();
  const setIsDebugging = useGame.use.setIsDebugging();
  const [showPerf, setShowPerf] = useState(false);
  const { width } = useThree((s) => s.size);

  useEffect(() => {
    const checkHash = () => setIsDebugging(window.location.hash === "#debug");
    
    // Check the hash on mount
    checkHash();
    
    // Listen for hash changes
    window.addEventListener("hashchange", checkHash);
    return () => window.removeEventListener("hashchange", checkHash);
  }, [setIsDebugging]);

  if (isDebugging) {
    return (
      <>
        {showPerf && (
          <Perf
            position="top-left"
            minimal={width < 712}
            matrixUpdate
            deepAnalyze
            overClock
          />
        )}
        <DebugControlsUser showPerf={showPerf} setShowPerf={setShowPerf} />
      </>
    );
  }

  return null;
};
