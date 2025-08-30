# Aquarium Tycoon

A 3D aquarium management game built with React Three Fiber where players build and manage their own aquarium business.

## Features

- **3D Aquarium Building**: Place tanks, decorations, and entrances in a 3D environment
- **Grid-Based Placement**: Strategic placement system with rotation support for tanks
- **Expansion System**: Progressive aquarium growth through purchasable expansion packs
- **Visitor Management**: Attract visitors who generate revenue and interact with your aquarium
- **Fish Care**: Manage water quality, temperature, and fish happiness
- **Objective System**: Guided progression through achievements and milestones
- **Unlock System**: New content unlocked through gameplay progression

## Technology Stack

- **React 18** with TypeScript
- **React Three Fiber** for 3D rendering
- **Three.js** for 3D graphics and custom shaders
- **Zustand** for state management
- **Tailwind CSS** + **shadcn/ui** for UI components
- **Vite** for development and building

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run linter
npm run lint
```

## Project Structure

- `/src/components/` - 3D React Three Fiber components
- `/src/components/gameUI/` - 2D UI components using Tailwind
- `/src/stores/` - Zustand state management
- `/src/systems/` - Core game logic classes
- `/src/scenes/` - Main 3D scenes
- `/public/` - 3D assets (.glb models, textures)
