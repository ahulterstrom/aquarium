import { FirstPersonControls, OrbitControls } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { folder, useControls } from "leva";
import { useEffect } from "react";
import * as THREE from "three";

export const CustomCameraControls = ({
  initialCameraPosition = new THREE.Vector3(0, 0, 5),
}: {
  initialCameraPosition?: THREE.Vector3;
}) => {
  const { camera } = useThree();

  const controls = useControls({
    Misc: folder(
      {
        "Free cam": false,
      },
      {
        collapsed: true,
      },
    ),
  });

  useEffect(() => {
    if (!controls["Free cam"]) {
      camera.position.copy(initialCameraPosition);
      camera.lookAt(0, 0, 0);
    }
  }, []);

  if (controls["Free cam"]) {
    return <FirstPersonControls makeDefault />;
  } else {
    return <OrbitControls makeDefault />;
  }
};
