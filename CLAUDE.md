# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start development server
- `npm run build` - Build for production (runs TypeScript check + Vite build)
- `npm run lint` - Run ESLint

## Architecture Overview

**Aquarium Tycoon** is a 3D aquarium management game built with React Three Fiber. The game follows a modular architecture with clear separation between game logic, 3D rendering, and UI.

### Core Architecture Patterns

**State Management (Zustand)**:

- `gameStore.ts` - Core game state (money, tanks, fish, objectives, expansions)
- `uiStore.ts` - UI state (selected entities, placement mode, panel visibility)  
- `gridStore.ts` - Grid/spatial state (cell occupancy, placement validation)
- All stores use `createSelectors` utility for granular subscriptions

**3D Rendering (React Three Fiber)**:

- Scene files in `/scenes/` (sandboxScene, mainMenuScene, etc.)
- Component files in `/components/` for 3D objects (tanks, visitors, coins)
- Custom materials in `/components/` (waterSurfaceMaterial.tsx)
- Global interaction systems (coin collection, tank placement)

**Game Systems**:

- `/systems/` - Core game logic (ObjectiveSystem, UnlockSystem, CoinSystem, etc.)
- `/components/systems/` - React components that manage systems (GameSystems.tsx)
- Tick-based updates with different frequencies (1s, 5s, 10s, daily)

### Key Gameplay Systems

**Placement System**:

- Grid-based placement with multi-cell object support
- Rotation support for rectangular objects (tanks)
- Real-time placement preview with validation
- Located in `/lib/utils/placement.ts` and integrated in `sandboxScene.tsx`

**Expansion System**:

- Progressive square grid growth (3×3 → 4×4 → 5×5...)
- Dynamic pack sizing using formula: `2k + 5` tiles per level
- One-time purchase per expansion level
- Unlock-gated progression tied to milestones
- Manual tile placement with adjacency rules

**3D Asset Integration**:

- GLTF models in `/public/` (Models.glb)
- Custom shader materials with Three.js
- Animated components using `useFrame` hook
- Asset optimization for web delivery

### Important Conventions

**Component Organization**:

- 3D components in `/components/` export JSX for Three.js objects
- UI components in `/components/gameUI/` use Tailwind + shadcn/ui
- Game systems in `/systems/` are pure TypeScript classes
- Utils in `/lib/utils/` are pure functions

**Interaction Patterns**:

- Global interaction managers for complex 3D interactions (coinInteraction.ts)
- Event handling through Three.js onPointer events
- Custom raycasting for occluded object interaction

## Coding Guidelines

- Avoid barrel files
- Zustand data should usually not be passed as props (since it is available everywhere)
- Use named exports over default exports
- 3D interactions should use global managers when objects need to be clickable through occlusion
- Always validate grid placement operations before applying changes
