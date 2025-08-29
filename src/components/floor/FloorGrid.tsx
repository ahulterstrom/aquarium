import { useMemo } from "react";
import * as THREE from "three";
import { useGridStore } from "../../stores/gridStore";
import { useGameStore } from "../../stores/gameStore";
import { useUIStore } from "../../stores/uiStore";
import { useFloorStyle } from "./FloorTextureProvider";
import { FLOOR_THICKNESS } from "@/lib/constants";

// Extract dominant color from texture using canvas
const extractColorFromTexture = (texture: THREE.Texture): THREE.Color => {
  try {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    if (!context || !texture.image) {
      return new THREE.Color(0x666666); // Fallback gray
    }

    // Small size for performance
    canvas.width = 32;
    canvas.height = 32;

    // Draw texture to canvas
    context.drawImage(texture.image, 0, 0, 32, 32);

    // Get pixel data and calculate average color
    const imageData = context.getImageData(0, 0, 32, 32);
    let r = 0,
      g = 0,
      b = 0;

    for (let i = 0; i < imageData.data.length; i += 4) {
      r += imageData.data[i];
      g += imageData.data[i + 1];
      b += imageData.data[i + 2];
    }

    const pixels = imageData.data.length / 4;
    return new THREE.Color(
      r / pixels / 255,
      g / pixels / 255,
      b / pixels / 255,
    );
  } catch (error) {
    console.warn("Failed to extract color from texture:", error);
    return new THREE.Color(0x666666); // Fallback gray
  }
};

export const FloorGrid = () => {
  const cells = useGridStore.use.cells();
  const floorStyle = useGameStore.use.floorStyle();
  const placementMode = useUIStore.use.placementMode();
  const clearSelection = useUIStore.use.clearSelection();
  const { textures, style } = useFloorStyle(floorStyle);

  // Create shared top material for all tiles
  const topMaterial = useMemo(() => {
    if (!textures || !style) return null;

    const material = new THREE.MeshStandardMaterial({
      map: textures.baseColor,
      normalMap: textures.normal,
      aoMap: textures.aorm,
      roughnessMap: textures.aorm,
      metalnessMap: textures.aorm,
      roughness: style.material.roughness,
      metalness: style.material.metalness,
    });

    return material;
  }, [textures, style]);

  // Extract color from texture for sides
  const sideColor = useMemo(() => {
    if (!textures?.baseColor?.image) return new THREE.Color(0x444444);
    const color = extractColorFromTexture(textures.baseColor);
    // Darken the color slightly for the sides
    color.multiplyScalar(0.7);
    return color;
  }, [textures]);

  // Create side material
  const sideMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: sideColor,
      roughness: 0.9,
      metalness: 0.0,
    });
  }, [sideColor]);

  // Create materials array for box faces
  const materials = useMemo(() => {
    if (!topMaterial) return null;
    // Order: right, left, top, bottom, front, back
    return [
      sideMaterial,
      sideMaterial,
      topMaterial,
      sideMaterial,
      sideMaterial,
      sideMaterial,
    ];
  }, [topMaterial, sideMaterial]);

  // Filter ground level cells
  const groundCells = useMemo(() => {
    return Array.from(cells.values()).filter((cell) => cell.y === 0);
  }, [cells]);

  const handleTileClick = () => {
    if (placementMode !== "tank" && placementMode !== "entrance") {
      clearSelection();
    }
  };

  // If materials aren't ready, show loading state
  if (!materials) {
    return null; // Or a loading placeholder
  }

  // Render tiles with box geometry
  return (
    <>
      {groundCells.map((cell) => {
        // Create box geometry with small height
        const geometry = new THREE.BoxGeometry(2, FLOOR_THICKNESS, 2);

        // Set up UV2 for ambient occlusion on top face
        const uv = geometry.getAttribute("uv");
        const uv2Array = new Float32Array(uv.count * 2);

        // Copy UVs for top face (indices 16-23 in the UV array for box geometry)
        for (let i = 16; i < 24; i++) {
          uv2Array[i * 2] = uv.array[i * 2];
          uv2Array[i * 2 + 1] = uv.array[i * 2 + 1];
        }

        geometry.setAttribute("uv2", new THREE.BufferAttribute(uv2Array, 2));

        return (
          <group
            key={`floor-${cell.x}-${cell.z}`}
            position={[cell.x * 2, -FLOOR_THICKNESS / 2, cell.z * 2]} // Adjust Y to center the box
            onClick={(e) => {
              e.stopPropagation();
              handleTileClick();
            }}
          >
            <mesh
              geometry={geometry}
              material={materials}
              receiveShadow
              castShadow
            />
          </group>
        );
      })}
    </>
  );
};
