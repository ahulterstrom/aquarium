import { OrthographicCamera, useTexture, Html } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import { Flex, Box } from "@react-three/flex";
import { useSceneMachine } from "@/contexts/scene/useScene";

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// 4) Fragment shader with your effect()
const fragmentShader = `
  precision highp float;
  uniform float iTime;
  uniform vec2  iResolution;
  varying vec2  vUv;

  // Bring in your defines via Three.js’s defines{} object,
  // so you don’t have to copy all of them here by hand.

  vec4 effect(vec2 screenSize, vec2 screen_coords) {
      float pixel_size = length(screenSize.xy) / PIXEL_FILTER;
      vec2 uv = (floor(screen_coords.xy*(1./pixel_size))*pixel_size
                 - 0.5*screenSize.xy)/length(screenSize.xy) - OFFSET;
      float uv_len = length(uv);

      float speed = (SPIN_ROTATION*SPIN_EASE*0.2);
      if(IS_ROTATE){
         speed = iTime * speed;
      }
      speed += 302.2;
      float new_pixel_angle = atan(uv.y, uv.x) + speed
                              - SPIN_EASE*20.*(1.*SPIN_AMOUNT*uv_len
                              + (1. - 1.*SPIN_AMOUNT));
      vec2 mid = (screenSize.xy/length(screenSize.xy))/2.;
      uv = (vec2((uv_len * cos(new_pixel_angle) + mid.x),
                 (uv_len * sin(new_pixel_angle) + mid.y)) - mid);

      uv *= 30.;
      speed = iTime*(SPIN_SPEED);
      vec2 uv2 = vec2(uv.x+uv.y);

      for(int i=0; i < 5; i++) {
          uv2 += sin(max(uv.x, uv.y)) + uv;
          uv  += 0.5*vec2(
                   cos(5.1123314 + 0.353*uv2.y + speed*0.131121),
                   sin(uv2.x - 0.113*speed)
                 );
          uv  -= 1.0*cos(uv.x + uv.y) - 1.0*sin(uv.x*0.711 - uv.y);
      }

      float contrast_mod = (0.25*CONTRAST + 0.5*SPIN_AMOUNT + 1.2);
      float paint_res    = min(2.0, max(0.0, length(uv)*(0.035)*contrast_mod));
      float c1p = max(0.0,1.0 - contrast_mod*abs(1.0-paint_res));
      float c2p = max(0.0,1.0 - contrast_mod*abs(paint_res));
      float c3p = 1.0 - min(1.0, c1p + c2p);
      float light = (LIGTHING - 0.2)*max(c1p*5.0 - 4.0, 0.0)
                    + LIGTHING*max(c2p*5.0 - 4.0, 0.0);

      return (0.3/CONTRAST)*COLOUR_1
             + (1.0 - 0.3/CONTRAST)*(COLOUR_1*c1p + COLOUR_2*c2p
             + vec4(c3p*COLOUR_3.rgb, c3p*COLOUR_1.a)) + light;
  }

  void main() {
    // convert vUv (0→1) to pixel coords then call effect()
    vec2 fragCoord = vUv * iResolution;
    gl_FragColor = effect(iResolution, fragCoord);
  }
`;

function ShaderPlane() {
  const materialRef = useRef(null);
  const { viewport, size } = useThree();
  // initialize uniforms once
  const uniforms = useRef({
    iTime: { value: 0.0 },
    iResolution: {
      value: new THREE.Vector2(size.width, size.height),
    },
  }).current;

  // update each frame
  useFrame(({ clock, size: newSize }) => {
    uniforms.iTime.value = clock.getElapsedTime();
    uniforms.iResolution.value.set(newSize.width, newSize.height);
  });

  return (
    <mesh position={[0, 0, -60]}>
      {/* a 2×2 plane in clip‐space with no matrix transforms */}
      <planeGeometry args={[size.width, size.height]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        defines={{
          SPIN_ROTATION: "-2.0",
          SPIN_SPEED: "7.0",
          OFFSET: "vec2(0.0)",
          COLOUR_1: "vec4(0.871, 0.267, 0.231, 1.0)",
          COLOUR_2: "vec4(0.0,   0.42,  0.706, 1.0)",
          COLOUR_3: "vec4(0.086, 0.137, 0.145, 1.0)",
          CONTRAST: "3.5",
          LIGTHING: "0.4",
          SPIN_AMOUNT: "0.25",
          PIXEL_FILTER: "745.0",
          SPIN_EASE: "1.0",
          PI: "3.14159265359",
          IS_ROTATE: "false",
        }}
      />
    </mesh>
  );
}

export const MainMenuScene = () => {
  const sceneActor = useSceneMachine();
  
  return (
    <>
      <OrthographicCamera makeDefault position={[0, 0, 10]} zoom={1} />
      <ShaderPlane />
      
      {/* Menu UI */}
      <Html position={[0, 0, 0]} transform center>
        <div className="flex flex-col items-center space-y-4">
          <h1 className="text-4xl font-bold text-white mb-8">Aquarium Tycoon</h1>
          <div className="space-y-3">
            <button
              onClick={() => sceneActor.send({ type: "GO_TO_SANDBOX" })}
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors min-w-[200px]"
            >
              Sandbox Mode
            </button>
            <button
              onClick={() => sceneActor.send({ type: "GO_TO_CHARACTER_SELECTION" })}
              className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors min-w-[200px]"
            >
              Career Mode
            </button>
          </div>
        </div>
      </Html>
    </>
  );
};
