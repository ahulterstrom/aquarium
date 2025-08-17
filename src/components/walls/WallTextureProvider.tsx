import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { WallTextureManager, WallTextures } from "../../lib/textures/wallTextureManager";
import { WALL_STYLES, WallStyle } from "../../lib/constants/walls";

interface WallTextureContextValue {
  getTextures: (styleId: string) => WallTextures | null;
  isLoading: (styleId: string) => boolean;
  preloadStyle: (styleId: string) => Promise<void>;
  loadedStyles: Set<string>;
}

const WallTextureContext = createContext<WallTextureContextValue | null>(null);

interface WallTextureProviderProps {
  children: ReactNode;
  preloadStyles?: string[]; // Wall styles to preload on mount
}

export const WallTextureProvider = ({ 
  children, 
  preloadStyles = ["concrete"] // Default preload concrete style
}: WallTextureProviderProps) => {
  const [textureManager] = useState(() => WallTextureManager.getInstance());
  const [loadedStyles, setLoadedStyles] = useState<Set<string>>(new Set());
  const [loadingStyles, setLoadingStyles] = useState<Set<string>>(new Set());

  // Preload specified styles on mount
  useEffect(() => {
    const preload = async () => {
      for (const styleId of preloadStyles) {
        const style = WALL_STYLES[styleId];
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

    const style = WALL_STYLES[styleId];
    if (!style) {
      console.warn(`Wall style '${styleId}' not found`);
      return;
    }

    setLoadingStyles(prev => new Set([...prev, styleId]));

    try {
      await textureManager.loadWallTextures(styleId, style.textures);
      setLoadedStyles(prev => new Set([...prev, styleId]));
    } catch (error) {
      console.error(`Failed to load wall textures for style '${styleId}':`, error);
    } finally {
      setLoadingStyles(prev => {
        const newSet = new Set(prev);
        newSet.delete(styleId);
        return newSet;
      });
    }
  };

  const getTextures = (styleId: string): WallTextures | null => {
    return textureManager.getWallTextures(styleId);
  };

  const isLoading = (styleId: string): boolean => {
    return loadingStyles.has(styleId);
  };

  const value: WallTextureContextValue = {
    getTextures,
    isLoading,
    preloadStyle,
    loadedStyles,
  };

  return (
    <WallTextureContext.Provider value={value}>
      {children}
    </WallTextureContext.Provider>
  );
};

export const useWallTextures = (): WallTextureContextValue => {
  const context = useContext(WallTextureContext);
  if (!context) {
    throw new Error("useWallTextures must be used within a WallTextureProvider");
  }
  return context;
};

// Hook for getting textures for a specific style with automatic loading
export const useWallStyle = (styleId: string): {
  textures: WallTextures | null;
  style: WallStyle | null;
  isLoading: boolean;
  error: string | null;
} => {
  const { getTextures, isLoading, preloadStyle } = useWallTextures();
  const [error, setError] = useState<string | null>(null);

  const style = WALL_STYLES[styleId] || null;
  const textures = getTextures(styleId);
  const loading = isLoading(styleId);

  // Auto-load textures if not already loaded
  useEffect(() => {
    if (!style) {
      setError(`Wall style '${styleId}' not found`);
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