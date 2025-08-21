// WaterRippleMaterial.ts
import { shaderMaterial } from "@react-three/drei";
import { extend, useFrame } from "@react-three/fiber";
import { useRef, useMemo } from "react";
import * as THREE from "three";

export type WaterRippleUniforms = {
  uTime: number;
  uRippleFrequency: number;
  uRippleSpeed: number;
  uRippleAmplitude: number;
  uEdgeFalloffTexture: THREE.Texture | null;
  uLineThickness: number;
  uNoiseScale: number;
  uNoiseStrength: number;
  uColor: THREE.Color;
  uAlpha: number;
};

const vertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragment = /* glsl */ `
  precision highp float;
  varying vec2 vUv;

  uniform float uTime;
  uniform float uRippleFrequency;
  uniform float uRippleSpeed;
  uniform float uRippleAmplitude;
  uniform sampler2D uEdgeFalloffTexture;
  uniform float uLineThickness;
  uniform float uNoiseScale;
  uniform float uNoiseStrength;
  uniform vec3 uColor;
  uniform float uAlpha;

  // Simple 2D noise function
  float hash(vec2 p) {
    p = fract(p * vec2(234.34, 435.345));
    p += dot(p, p + 34.23);
    return fract(p.x * p.y);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    
    vec2 u = f * f * (3.0 - 2.0 * f);
    
    return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
  }

  float fbm(vec2 p) {
    float value = 0.0;
    float amplitude = 0.5;
    
    for(int i = 0; i < 3; i++) {
      value += amplitude * noise(p);
      p *= 2.0;
      amplitude *= 0.5;
    }
    
    return value;
  }

  void main() {
    // Sample the edge falloff texture
    float edgeDist = texture2D(uEdgeFalloffTexture, vUv).r;
    
    // Add noise to create irregular edge shape
    vec2 noiseCoord = vUv * uNoiseScale;
    float noiseValue = fbm(noiseCoord + uTime * 0.1) - 0.5;
    
    // Distort the edge distance with noise
    float distortedEdgeDist = edgeDist + noiseValue * uNoiseStrength;
    
    // Create ripples that follow the edge shape
    float rippleBase = distortedEdgeDist * uRippleFrequency - uTime * uRippleSpeed;
    
    // Add more noise to the ripple phase for irregularity
    float phaseNoise = noise(vUv * 8.0 + uTime * 0.3) * 2.0;
    rippleBase += phaseNoise;
    
    // Generate the ripple pattern
    float ripple = sin(rippleBase);
    
    // Add secondary ripple with different frequency
    float ripple2 = sin(rippleBase * 1.7 + phaseNoise * 0.5) * 0.3;
    ripple += ripple2;
    
    // Cartoon-style hard edge lines
    float line = 1.0 - smoothstep(0.0, uLineThickness, abs(ripple));
    
    // Use texture value as falloff (assuming texture is white at edges, black in center)
    float edgeFalloff = edgeDist;
    
    // Apply edge falloff and amplitude
    float finalRipple = line * edgeFalloff * uRippleAmplitude;
    
    // Only show ripple lines with single color, transparent background
    vec3 color = uColor;
    
    // Alpha based on ripple intensity - transparent where no ripples
    float alpha = finalRipple * uAlpha;
    
    // gl_FragColor = vec4(color, alpha);
    gl_FragColor = vec4(vec3(edgeFalloff), uAlpha);
  }
`;

export const WaterRippleMaterial = shaderMaterial(
  // default uniforms
  {
    uTime: 0,
    uRippleFrequency: 25.0,
    uRippleSpeed: 1.5,
    uRippleAmplitude: 1.0,
    uEdgeFalloffTexture: null,
    uLineThickness: 0.03,
    uNoiseScale: 4.0,
    uNoiseStrength: 0.15,
    uColor: new THREE.Color(0x0496ff),
    uAlpha: 0.9,
  } as WaterRippleUniforms,
  vertex,
  fragment,
);

// Make <waterRippleMaterial /> available as a JSX tag
extend({ WaterRippleMaterial });

declare global {
  namespace JSX {
    interface IntrinsicElements {
      waterRippleMaterial: ReactThreeFiber.Object3DNode<
        THREE.ShaderMaterial,
        typeof WaterRippleMaterial
      > &
        Partial<WaterRippleUniforms>;
    }
  }
}

// Helper function to create a default edge falloff texture
const createEdgeFalloffTexture = (
  shape: "circle" | "square" | "roundedRectangle" = "circle",
  size = 128,
) => {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;

  if (shape === "circle") {
    // Create radial gradient from center (black) to edges (white)
    const gradient = ctx.createRadialGradient(
      size / 2,
      size / 2,
      0,
      size / 2,
      size / 2,
      size / 2,
    );
    gradient.addColorStop(0.7, "black");
    gradient.addColorStop(1, "white");

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
  } else if (shape === "square") {
    // Create a distance field for square edges
    const imageData = ctx.createImageData(size, size);
    const data = imageData.data;

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        // Calculate normalized distance to nearest edge
        const dx = Math.min(x, size - 1 - x) / (size / 2);
        const dy = Math.min(y, size - 1 - y) / (size / 2);
        const dist = Math.min(dx, dy);

        // Invert and remap: 0 at center, 1 at edges
        const value = 1.0 - Math.min(Math.max(dist, 0), 1);

        // Apply smoothstep for nicer falloff
        const smooth = value * value * (3 - 2 * value);

        const idx = (y * size + x) * 4;
        const color = Math.floor(smooth * 255);
        data[idx] = color; // R
        data[idx + 1] = color; // G
        data[idx + 2] = color; // B
        data[idx + 3] = 255; // A
      }
    }

    ctx.putImageData(imageData, 0, 0);
  } else if (shape === "roundedRectangle") {
    // Create a distance field for rounded rectangle
    const imageData = ctx.createImageData(size, size);
    const data = imageData.data;
    const cornerRadius = size * 0.15; // 15% corner radius
    
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        // Calculate distance to edges
        const dx = Math.min(x, size - 1 - x);
        const dy = Math.min(y, size - 1 - y);
        
        let dist;
        
        // Check if we're in a corner region
        if (dx < cornerRadius && dy < cornerRadius) {
          // Calculate distance to corner circle
          const cornerX = dx < size / 2 ? cornerRadius : size - cornerRadius;
          const cornerY = dy < size / 2 ? cornerRadius : size - cornerRadius;
          const distToCorner = Math.sqrt(
            Math.pow(x - cornerX, 2) + Math.pow(y - cornerY, 2)
          );
          dist = Math.max(0, cornerRadius - distToCorner);
        } else {
          // Use regular rectangular distance
          dist = Math.min(dx, dy);
        }
        
        // Normalize distance
        const normalizedDist = dist / (size / 2);
        
        // Invert and remap: 0 at center, 1 at edges
        const value = 1.0 - Math.min(Math.max(normalizedDist, 0), 1);
        
        // Apply smoothstep for nicer falloff
        const smooth = value * value * (3 - 2 * value);
        
        const idx = (y * size + x) * 4;
        const color = Math.floor(smooth * 255);
        data[idx] = color;     // R
        data[idx + 1] = color; // G
        data[idx + 2] = color; // B
        data[idx + 3] = 255;   // A
      }
    }
    
    ctx.putImageData(imageData, 0, 0);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
};

export const MaterialTest = () => {
  const matRef = useRef<THREE.ShaderMaterial>(null!);
  const edgeFalloffTexture = useMemo(
    () => createEdgeFalloffTexture("roundedRectangle"),
    [],
  );

  useFrame(({ clock }) => {
    if (matRef.current) {
      matRef.current.uniforms.uTime.value = clock.getElapsedTime();
    }
  });

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[2, 1, 2]}>
      <planeGeometry args={[5, 5]} />
      <waterRippleMaterial
        key={Math.random()}
        ref={matRef}
        transparent={true}
        // depthWrite={false}
        uRippleFrequency={10}
        uRippleSpeed={-1.2}
        uRippleAmplitude={0.9}
        uEdgeFalloffTexture={edgeFalloffTexture}
        uLineThickness={0.8}
        uNoiseScale={5.0}
        uNoiseStrength={0.2}
        uColor={new THREE.Color(0xffffff)}
        uAlpha={0.8}
      />
    </mesh>
  );
};
