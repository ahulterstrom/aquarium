import {
  OrthographicCamera,
  useTexture,
  Html,
  Environment,
} from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import { Flex, Box } from "@react-three/flex";
import { useSceneMachine } from "@/contexts/scene/useScene";
import { Logo } from "@/components/logo";

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// Water shader adapted from k-mouse (2016-11-23) on Shadertoy
const fragmentShader = `
  precision highp float;
  uniform float iTime;
  uniform vec2  iResolution;
  varying vec2  vUv;

  #define TAU 6.28318530718
  #define TILING_FACTOR 1.0
  #define MAX_ITER 8

  float waterHighlight(vec2 p, float time, float foaminess) {
    vec2 i = vec2(p);
    float c = 0.0;
    float foaminess_factor = mix(1.0, 6.0, foaminess);
    float inten = 0.005 * foaminess_factor;

    for (int n = 0; n < MAX_ITER; n++) {
      float t = time * (1.0 - (3.5 / float(n+1)));
      i = p + vec2(cos(t - i.x) + sin(t + i.y), sin(t - i.y) + cos(t + i.x));
      c += 1.0/length(vec2(p.x / (sin(i.x+t)), p.y / (cos(i.y+t))));
    }
    c = 0.2 + c / (inten * float(MAX_ITER));
    c = 1.17 - pow(c, 1.4);
    c = pow(abs(c), 8.0);
    return c / sqrt(foaminess_factor);
  }

  void main() {
    float time = iTime * 0.1 + 23.0;
    vec2 uv = vUv;
    vec2 uv_square = vec2(uv.x * iResolution.x / iResolution.y, uv.y);
    float dist_center = pow(2.0 * length(uv - 0.5), 2.0);
    
    float foaminess = smoothstep(0.4, 1.8, dist_center);
    float clearness = 0.1 + 0.9 * smoothstep(0.1, 0.5, dist_center);
    
    vec2 p = mod(uv_square * TAU * TILING_FACTOR, TAU) - 250.0;
    
    float c = waterHighlight(p, time, foaminess);
    
    vec3 water_color = vec3(0.0, 0.35, 0.5);
    vec3 color = vec3(c);
    color = clamp(color + water_color, 0.0, 1.0);
    
    color = mix(water_color, color, clearness);

    gl_FragColor = vec4(color, 1.0);
  }
`;

function ShaderPlane() {
  const materialRef = useRef(null);
  const { size } = useThree();
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
      <planeGeometry args={[size.width / 10, size.height / 10]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
      />
    </mesh>
  );
}

export const MainMenuScene = () => {
  return (
    <>
      <Logo />
      <OrthographicCamera makeDefault position={[0, 0, 10]} zoom={10} />

      {/* Basic lighting setup */}
      <ambientLight intensity={0.9} color="#ffffff" />
      <pointLight
        position={[-30, 3, 30]}
        intensity={40}
        color="#ffffff"
        castShadow={true}
      />
      <pointLight
        position={[30, 15, 30]}
        intensity={50}
        color="#ffffff"
        castShadow={true}
      />
      <pointLight
        position={[10, 35, 50]}
        intensity={300}
        color="#ffffff"
        castShadow={true}
      />

      <ShaderPlane />
    </>
  );
};
