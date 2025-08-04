
# Aquarium Tycoon - Game Design Document

## Core Concept

A mobile-friendly idle management game where players build and manage an aquarium empire, attracting visitors who drop money when they see appealing fish and decorations.

## Gameplay Loop

1. **Start** with small aquarium space (3x3 grid), one basic tank, and minimal starting capital
2. **Buy** fish and place them in tanks
3. **Visitors** walk around and drop coins when impressed
4. **Maintain** fish happiness through feeding/cleaning (or automation)
5. **Expand** by purchasing more space, tanks, fish, and automation
6. **Optimize** layout and fish combinations for maximum revenue

## Core Mechanics

### Economy System

- **Visitors**: Spawn at entrance, pathfind through aquarium
- **Money Drops**: Based on fish rarity, happiness, and tank aesthetics
- **Expenses**: Fish food, tank cleaning, new purchases

### Tank Management

- **Grid Placement**: Tanks occupy grid cells (1x1, 2x1, 2x2 sizes)
- **Fish Capacity**: Based on tank size
- **Happiness Factors**:
  - Feeding status (depletes over time)
  - Cleanliness (decreases over time)
  - Overcrowding penalty

### Progression

- **Space Expansion**: Buy adjacent grid sections (3x3 → 6x6 → 9x9)
- **Automation Unlocks**:
  - Auto-feeder ($500)
  - Filter system ($1000)
  - Premium fish food ($2000)
- **Fish Tiers**: Common → Uncommon → Rare → Exotic

## Technical Specifications

### View & Controls

- **Camera**: Isometric view (45° angle)
- **Controls**:
  - Touch/drag to pan
  - Pinch to zoom
  - Tap to select/place
  - UI buttons for all actions

### UI Layout (React/shadcn overlays)

- **Top Bar**: Money, visitor count, happiness average
- **Bottom Bar**: Shop, inventory, settings
- **Side Panel**: Selected tank/fish details
- **Context Menus**: Tank/fish interactions

## MVP Features Priority

1. ✅ Basic tank placement/removal
2. ✅ 3 fish types with simple movement
3. ✅ Visitor spawning with money drops
4. ✅ Feeding/cleaning mechanics
5. ✅ One automation upgrade
6. ✅ Save/load system
7. ✅ Mobile touch controls
8. ✅ One expansion option (3x3 to 6x6)

## Stretch Goals

- 🎯 Roguelike scenarios ("Win award in 7 days")
- 🎯 Visitor preferences/types
- 🎯 Special events (school trips = more visitors)
- 🎯 Achievements system

## Visual Style

- **Aesthetic**: Clean, colorful, slightly cartoonish
- **Performance**: Optimized for mobile (low poly models)
- **Effects**: Simple water shader, particle effects for money drops
