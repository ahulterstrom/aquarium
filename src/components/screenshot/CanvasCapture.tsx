import { useThree } from "@react-three/fiber";
import { useEffect } from "react";
import { useCanvasStore } from "@/stores/canvasStore";

/**
 * Component that runs inside the R3F Canvas to capture the GL context
 */
export const CanvasCapture = () => {
  const { gl } = useThree();
  const setCanvas = useCanvasStore.use.setCanvas();

  useEffect(() => {
    // Store the actual canvas element from the WebGL renderer
    if (gl?.domElement) {
      setCanvas(gl.domElement);
    }
    
    return () => {
      setCanvas(null);
    };
  }, [gl, setCanvas]);

  return null;
};