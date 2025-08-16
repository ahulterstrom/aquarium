import { createSelectors } from "@/stores/utils";
import { create } from "zustand";
import { devtools, subscribeWithSelector } from "zustand/middleware";

type UIModal =
  | "none"
  | "tankDetails"
  | "shop"
  | "stats"
  | "settings"
  | "tutorial";
type PlacementMode =
  | "none"
  | "tank"
  | "decoration"
  | "path"
  | "entrance"
  | "expansion";

type SelectedEntityType = "tank" | "visitor" | "entrance" | null;

interface UIStore {
  // Selection
  selectedTankId: string | null;
  selectedVisitorId: string | null;
  selectedEntranceId: string | null;
  selectedFishId: string | null;
  hoveredEntityId: string | null;
  selectedEntityType: SelectedEntityType;

  // Modals
  activeModal: UIModal;
  modalData: any;

  // Placement mode
  placementMode: PlacementMode;
  placementPreview: {
    type: string;
    size?: "medium" | "large" | "huge";
  } | null;

  // Expansion placement
  expansionSelectedTiles: Set<string>;

  // UI state
  showGrid: boolean;
  showStats: boolean;
  showNotifications: boolean;
  notifications: Notification[];

  showFishShop: boolean;
  showSellConfirmation: boolean;
  showTileExpansion: boolean;
  showCustomization: boolean;
  showBuild: boolean;
  showObjectives: boolean;
  showAllObjectives: boolean;

  // Actions
  selectTank: (id: string | null) => void;
  selectVisitor: (id: string | null) => void;
  selectEntrance: (id: string | null) => void;
  selectFish: (id: string | null) => void;
  clearSelection: () => void;
  setHoveredEntity: (id: string | null) => void;

  openModal: (modal: UIModal, data?: any) => void;
  closeModal: () => void;

  setShowFishShop: (show: boolean) => void;
  setShowSellConfirmation: (show: boolean) => void;
  setShowTileExpansion: (show: boolean) => void;
  setShowCustomization: (show: boolean) => void;
  setShowBuild: (show: boolean) => void;
  setShowObjectives: (value: boolean | ((prev: boolean) => boolean)) => void;
  setShowAllObjectives: (value: boolean | ((prev: boolean) => boolean)) => void;

  setPlacementMode: (mode: PlacementMode, preview?: any) => void;
  cancelPlacement: () => void;

  // Expansion tile selection actions
  setExpansionSelectedTiles: (tiles: Set<string>) => void;
  toggleExpansionTileSelection: (
    x: number,
    z: number,
    maxTiles: number,
  ) => void;
  clearExpansionSelection: () => void;

  toggleGrid: () => void;
  toggleStats: () => void;
  toggleNotifications: () => void;

  addNotification: (
    notification: Omit<Notification, "id" | "timestamp">,
  ) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}

interface Notification {
  id: string;
  type: "info" | "success" | "warning" | "error";
  title: string;
  message?: string;
  timestamp: number;
  duration?: number;
}

export const useUIStore = createSelectors(
  create<UIStore>()(
    devtools((set, get) => ({
      selectedTankId: null,
      selectedVisitorId: null,
      selectedEntranceId: null,
      selectedFishId: null,
      hoveredEntityId: null,
      selectedEntityType: null,

      showFishShop: false,
      showSellConfirmation: false,
      showTileExpansion: false,
      showCustomization: false,
      showBuild: false,
      showObjectives: false,
      showAllObjectives: false,

      activeModal: "none",
      modalData: null,

      placementMode: "none",
      placementPreview: null,
      expansionSelectedTiles: new Set(),

      showGrid: true,
      showStats: false,
      showNotifications: true,
      notifications: [],

      selectTank: (id) =>
        set({
          selectedTankId: id,
          selectedVisitorId: null,
          selectedEntranceId: null,
          selectedFishId: null,
          selectedEntityType: id ? "tank" : null,
        }),

      selectVisitor: (id) =>
        set({
          selectedVisitorId: id,
          selectedTankId: null,
          selectedEntranceId: null,
          selectedFishId: null,
          selectedEntityType: id ? "visitor" : null,
        }),

      selectEntrance: (id) =>
        set({
          selectedEntranceId: id,
          selectedTankId: null,
          selectedVisitorId: null,
          selectedFishId: null,
          selectedEntityType: id ? "entrance" : null,
        }),

      selectFish: (id) =>
        set({
          selectedFishId: id,
          selectedTankId: null,
          selectedVisitorId: null,
          selectedEntranceId: null,
          selectedEntityType: id ? "tank" : null, // Fish selection still shows tank panel
        }),

      clearSelection: () =>
        set({
          selectedTankId: null,
          selectedVisitorId: null,
          selectedEntranceId: null,
          selectedFishId: null,
          selectedEntityType: null,
        }),

      setHoveredEntity: (id) => set({ hoveredEntityId: id }),

      openModal: (modal, data) =>
        set({
          activeModal: modal,
          modalData: data,
        }),

      closeModal: () =>
        set({
          activeModal: "none",
          modalData: null,
        }),

      setShowFishShop: (show) => set({ showFishShop: show }),
      setShowSellConfirmation: (show) => set({ showSellConfirmation: show }),
      setShowTileExpansion: (show) => set({ showTileExpansion: show }),
      setShowCustomization: (show) => set({ showCustomization: show }),
      setShowBuild: (show) => set({ showBuild: show }),
      setShowObjectives: (show) =>
        set((state) => ({
          showObjectives:
            typeof show === "function" ? show(state.showObjectives) : show,
        })),
      setShowAllObjectives: (show) =>
        set((state) => ({
          showAllObjectives:
            typeof show === "function" ? show(state.showAllObjectives) : show,
        })),
      setPlacementMode: (mode, preview) =>
        set((state) => ({
          placementMode: mode,
          placementPreview: preview,
          // Clear expansion selection when exiting expansion mode
          ...(state.placementMode === "expansion" && mode !== "expansion"
            ? { expansionSelectedTiles: new Set() }
            : {}),
          // Only clear selections when entering placement mode, not when exiting
          ...(mode !== "none"
            ? {
                selectedTankId: null,
                selectedVisitorId: null,
                selectedEntranceId: null,
                selectedFishId: null,
                selectedEntityType: null,
              }
            : {}),
        })),

      cancelPlacement: () =>
        set({
          placementMode: "none",
          placementPreview: null,
          expansionSelectedTiles: new Set(),
        }),

      setExpansionSelectedTiles: (tiles) =>
        set({ expansionSelectedTiles: tiles }),

      toggleExpansionTileSelection: (x, z, maxTiles) =>
        set((state) => {
          const posKey = `${x},${z}`;
          const newSelection = new Set(state.expansionSelectedTiles);

          if (newSelection.has(posKey)) {
            newSelection.delete(posKey);
          } else if (newSelection.size < maxTiles) {
            newSelection.add(posKey);
          }

          return { expansionSelectedTiles: newSelection };
        }),

      clearExpansionSelection: () => set({ expansionSelectedTiles: new Set() }),

      toggleGrid: () => set((state) => ({ showGrid: !state.showGrid })),
      toggleStats: () => set((state) => ({ showStats: !state.showStats })),
      toggleNotifications: () =>
        set((state) => ({ showNotifications: !state.showNotifications })),

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

      removeNotification: (id) =>
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        })),

      clearNotifications: () => set({ notifications: [] }),
    })),
  ),
);
