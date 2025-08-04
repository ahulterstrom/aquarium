import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

type UIModal = 'none' | 'tankDetails' | 'shop' | 'stats' | 'settings' | 'tutorial';
type PlacementMode = 'none' | 'tank' | 'decoration' | 'path';

interface UIStore {
  // Selection
  selectedTankId: string | null;
  selectedFishId: string | null;
  hoveredEntityId: string | null;
  
  // Modals
  activeModal: UIModal;
  modalData: any;
  
  // Placement mode
  placementMode: PlacementMode;
  placementPreview: {
    type: string;
    size?: 'small' | 'medium' | 'large';
  } | null;
  
  // UI state
  showGrid: boolean;
  showStats: boolean;
  showNotifications: boolean;
  notifications: Notification[];
  
  // Actions
  selectTank: (id: string | null) => void;
  selectFish: (id: string | null) => void;
  setHoveredEntity: (id: string | null) => void;
  
  openModal: (modal: UIModal, data?: any) => void;
  closeModal: () => void;
  
  setPlacementMode: (mode: PlacementMode, preview?: any) => void;
  cancelPlacement: () => void;
  
  toggleGrid: () => void;
  toggleStats: () => void;
  toggleNotifications: () => void;
  
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}

interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message?: string;
  timestamp: number;
  duration?: number;
}

export const useUIStore = create<UIStore>()(
  devtools((set, get) => ({
    selectedTankId: null,
    selectedFishId: null,
    hoveredEntityId: null,
    
    activeModal: 'none',
    modalData: null,
    
    placementMode: 'none',
    placementPreview: null,
    
    showGrid: true,
    showStats: false,
    showNotifications: true,
    notifications: [],
    
    selectTank: (id) => set({
      selectedTankId: id,
      selectedFishId: null,
    }),
    
    selectFish: (id) => set({
      selectedFishId: id,
      selectedTankId: null,
    }),
    
    setHoveredEntity: (id) => set({ hoveredEntityId: id }),
    
    openModal: (modal, data) => set({
      activeModal: modal,
      modalData: data,
    }),
    
    closeModal: () => set({
      activeModal: 'none',
      modalData: null,
    }),
    
    setPlacementMode: (mode, preview) => set((state) => ({
      placementMode: mode,
      placementPreview: preview,
      // Only clear selections when entering placement mode, not when exiting
      ...(mode !== 'none' ? {
        selectedTankId: null,
        selectedFishId: null,
      } : {}),
    })),
    
    cancelPlacement: () => set({
      placementMode: 'none',
      placementPreview: null,
    }),
    
    toggleGrid: () => set((state) => ({ showGrid: !state.showGrid })),
    toggleStats: () => set((state) => ({ showStats: !state.showStats })),
    toggleNotifications: () => set((state) => ({ showNotifications: !state.showNotifications })),
    
    addNotification: (notification) => {
      const id = Date.now().toString();
      const newNotification: Notification = {
        ...notification,
        id,
        timestamp: Date.now(),
        duration: notification.duration || 5000,
      };
      
      set((state) => ({
        notifications: [...state.notifications, newNotification],
      }));
      
      if (newNotification.duration && newNotification.duration > 0) {
        setTimeout(() => {
          get().removeNotification(id);
        }, newNotification.duration);
      }
    },
    
    removeNotification: (id) => set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),
    
    clearNotifications: () => set({ notifications: [] }),
  }))
);