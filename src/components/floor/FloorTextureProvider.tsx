import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { FloorTextureManager, FloorTextures } from "../../lib/textures/floorTextureManager";
import { FLOOR_STYLES, FloorStyle } from "../../lib/constants/floors";

interface FloorTextureContextValue {
  getTextures: (styleId: string) => FloorTextures | null;
  isLoading: (styleId: string) => boolean;
  preloadStyle: (styleId: string) => Promise<void>;
  loadedStyles: Set<string>;
}

const FloorTextureContext = createContext<FloorTextureContextValue | null>(null);

interface FloorTextureProviderProps {
  children: ReactNode;
  preloadStyles?: string[]; // Floor styles to preload on mount
}

export const FloorTextureProvider = ({ 
  children, 
  preloadStyles = ["wood"] // Default preload wood style
}: FloorTextureProviderProps) => {
  const [textureManager] = useState(() => FloorTextureManager.getInstance());
  const [loadedStyles, setLoadedStyles] = useState<Set<string>>(new Set());
  const [loadingStyles, setLoadingStyles] = useState<Set<string>>(new Set());

  // Preload specified styles on mount
  useEffect(() => {
    const preload = async () => {
      for (const styleId of preloadStyles) {
        const style = FLOOR_STYLES[styleId];
        if (style) {
          await preloadStyle(styleId);
        }
      }
    };
    preload();
  }, [preloadStyles]);

  const preloadStyle = async (styleId: string): Promise<void> => {
    if (loadedStyles.has(styleId) || loadingStyles.has(styleId)) {
      return;
    }

    const style = FLOOR_STYLES[styleId];
    if (!style) {
      console.warn(`Floor style '${styleId}' not found`);
      return;
    }

    setLoadingStyles(prev => new Set([...prev, styleId]));

    try {
      await textureManager.loadFloorTextures(styleId, style.textures);
      setLoadedStyles(prev => new Set([...prev, styleId]));
    } catch (error) {
      console.error(`Failed to load floor textures for style '${styleId}':`, error);
    } finally {
      setLoadingStyles(prev => {
        const newSet = new Set(prev);
        newSet.delete(styleId);
        return newSet;
      });
    }
  };

  const getTextures = (styleId: string): FloorTextures | null => {
    return textureManager.getFloorTextures(styleId);
  };

  const isLoading = (styleId: string): boolean => {
    return loadingStyles.has(styleId);
  };

  const value: FloorTextureContextValue = {
    getTextures,
    isLoading,
    preloadStyle,
    loadedStyles,
  };

  return (
    <FloorTextureContext.Provider value={value}>
      {children}
    </FloorTextureContext.Provider>
  );
};

export const useFloorTextures = (): FloorTextureContextValue => {
  const context = useContext(FloorTextureContext);
  if (!context) {
    throw new Error("useFloorTextures must be used within a FloorTextureProvider");
  }
  return context;
};

// Hook for getting textures for a specific style with automatic loading
export const useFloorStyle = (styleId: string): {
  textures: FloorTextures | null;
  style: FloorStyle | null;
  isLoading: boolean;
  error: string | null;
} => {
  const { getTextures, isLoading, preloadStyle } = useFloorTextures();
  const [error, setError] = useState<string | null>(null);

  const style = FLOOR_STYLES[styleId] || null;
  const textures = getTextures(styleId);
  const loading = isLoading(styleId);

  // Auto-load textures if not already loaded
  useEffect(() => {
    if (!style) {
      setError(`Floor style '${styleId}' not found`);
      return;
    }

    if (!textures && !loading) {
      setError(null);
      preloadStyle(styleId).catch((err) => {
        setError(`Failed to load textures: ${err.message}`);
      });
    }
  }, [styleId, style, textures, loading, preloadStyle]);

  return {
    textures,
    style,
    isLoading: loading,
    error,
  };
};