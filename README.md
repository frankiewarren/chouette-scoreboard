# Backgammon Chouette Scoreboard

A production-ready web application for managing backgammon chouette games with persistent player management and localStorage integration. Optimized for iPad landscape orientation with touch-friendly controls and automatic player rotation.

## Project Overview

This is a **Backgammon Chouette Scoreboard** designed for live play during tournaments and casual games. A chouette is a multiplayer backgammon format where multiple players take turns playing against a single "box" player, with spectators backing the current player.

### Key Design Goals
- **Production-ready**: Full session persistence with localStorage integration
- **Player-centric architecture**: Players maintain identity across sessions and position rotations
- **iPad-optimized**: Touch-friendly interface designed for iPad landscape orientation
- **Live tournament use**: Real-time score tracking and comprehensive player management
- **Automatic rotation**: Implements official backgammon chouette rules
- **Professional UI**: Clean, modern interface suitable for competitive play

## Technical Stack

- **Frontend**: React 18 with TypeScript
- **Styling**: Tailwind CSS v4 with custom iPad breakpoints
- **Build Tool**: Vite for fast development and optimized builds
- **State Management**: React useState hooks with service layer architecture
- **Data Persistence**: localStorage with auto-save/auto-resume functionality
- **Architecture**: Player entity system with UUID-based identification
- **Responsive Design**: Custom breakpoints for iPad landscape (1024px+)

## Features Implemented

### ✅ Player Persistence System
- **Player entities**: UUID-based players with unique names and persistent identity
- **localStorage integration**: Auto-save and auto-resume functionality for seamless session management
- **Session persistence**: Game state survives browser refresh without user intervention
- **Unique name enforcement**: Real-time validation with clear error messaging
- **Total score tracking**: Players maintain cumulative scores across completed chouettes

### ✅ Game Setup Phase
- **Player selection interface**: Dropdown selection of existing players with "Add New Player" option
- **Progressive player addition**: Add Box, Captain, and Queue players using existing or newly created players
- **Touch-friendly inputs**: Large, easy-to-tap controls for player entry
- **Queue management**: Progressive display showing only filled positions + next empty slot
- **Validation**: Requires Box + Captain minimum to begin game

### ✅ Session Management
- **Hamburger menu**: Touch-friendly menu (☰) in top-right corner during game mode
- **End Chouette functionality**: Transfers current chouette scores to player totals and returns to setup
- **Current vs Total scores**: Shows only current chouette scores during gameplay
- **Score transfer workflow**: Seamless transition from game completion to player total updates
- **Auto-save behavior**: Every user action automatically persists to localStorage

### ✅ Game Mode
- **Score input modal**: Professional modal with +/- button controls for score entry
- **Zero-sum validation**: Ensures all scores balance to zero before submission
- **Touch optimization**: 48px+ touch targets, no tiny input controls
- **Semi-transparent overlay**: Game state visible behind modal for context
- **Player name display**: Shows current chouette scores only (e.g., "Alice: +3")

### ✅ Player Rotation System
- **Box wins**: Box stays, Captain moves to back of queue, next player becomes Captain
- **Captain wins**: Captain becomes Box, old Box moves to back of queue, next player becomes Captain
- **No winner**: No rotation occurs when neither player has positive score
- **Sitting out support**: Players can be marked as sitting out (tap to gray out)
- **Player ID tracking**: Rotation logic works with persistent player entities instead of positions

### ✅ Score Management
- **Current chouette scores**: Running totals within current game session
- **Total player scores**: Cumulative scores across all completed chouettes
- **Color coding**: Green (positive), Red (negative), Gray (zero) score display
- **Real-time updates**: All player scores update immediately after each round
- **Score separation**: Current chouette scores separate from player totals until game completion

### ✅ Layout & UI
- **Horizontal split**: 50% left (Box/Captain), 50% right (Queue)
- **2-column queue**: Automatically switches to 2 columns for 7+ players
- **iPad landscape optimization**: Custom breakpoints and touch targets
- **Professional styling**: Clean, tournament-ready appearance
- **Debug tools**: Development "Clear Storage" link for testing localStorage functionality

## Architecture

### Player-Centric Design
The application is built around persistent **Player entities** rather than position-based data:

- **Player Entity**: `{ id: UUID, name: string, totalScore: number, gamesPlayed: number, createdAt: Date }`
- **Session Entity**: `{ gameMode, players, currentScores, sittingOutStatus, ... }`
- **Separation of Concerns**: Current chouette scores vs. player career totals

### Service Layer
- **PlayerService**: CRUD operations, unique name validation, localStorage persistence
- **SessionService**: Game state management, auto-save, auto-resume, session lifecycle

### localStorage Integration
- **Auto-save**: Every user action triggers localStorage update
- **Auto-resume**: Silent restoration on browser refresh
- **Data Structure**: Separate storage for players (`chouette_players`) and sessions (`chouette_session`)
- **Error Handling**: Graceful fallback if localStorage unavailable

### Session Lifecycle
1. **Setup Phase**: Select existing players or create new ones
2. **Game Phase**: Current chouette scores tracked, auto-saved after each round  
3. **End Chouette**: Transfer current scores to player totals, create new session
4. **Browser Refresh**: Silent auto-resume at exact same state

## Game Rules Implemented

The app follows standard backgammon chouette rotation rules:

1. **Box Player Wins** (positive score):
   - Box stays in position
   - Captain moves to back of spectator queue
   - Next queue player becomes Captain

2. **Captain Player Wins** (positive score):
   - Captain becomes new Box
   - Old Box moves to back of spectator queue  
   - Next queue player becomes Captain

3. **No Winner** (both have zero or negative scores):
   - No rotation occurs
   - Same players continue next round

4. **Sitting Out**:
   - Players marked as "sitting out" are skipped during rotation
   - Sitting out players remain in queue but don't participate

## Development Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# TypeScript type checking
npx tsc --noEmit
```

## Project Structure

```
src/
├── services/
│   ├── PlayerService.ts        # Player CRUD operations and persistence
│   └── SessionService.ts       # Game session state management
├── components/
│   ├── BoxSection.tsx          # Box player component
│   ├── CaptainSection.tsx      # Captain player component  
│   ├── QueueSection.tsx        # Spectator queue component
│   ├── ScoreInputModal.tsx     # Score entry modal
│   ├── MenuComponent.tsx       # Hamburger menu with game actions
│   ├── PlayerSelector.tsx     # Player selection/creation interface
│   └── index.ts               # Component exports
├── types/
│   └── index.ts               # TypeScript interfaces and types
├── App.tsx                    # Main application component
├── index.css                  # Tailwind CSS imports
└── main.tsx                   # React entry point
```

## Technical Implementation Details

### Player Entity Structure
```typescript
interface Player {
  id: string;           // Auto-generated UUID
  name: string;         // User-chosen, unique
  totalScore: number;   // Cumulative across completed chouettes
  gamesPlayed: number;  // Number of completed chouettes
  createdAt: Date;
}
```

### Session Management
```typescript
interface GameSession {
  id: string;
  gameMode: 'setup' | 'game';
  boxPlayerId: string | null;
  captainPlayerId: string | null;
  queuePlayerIds: string[];
  currentChouetteScores: { [playerId: string]: number };
  playersSittingOut: { [playerId: string]: boolean };
}
```

### localStorage Data Flow
- **Write Operations**: After every user action (player selection, score submission, rotation)
- **Read Operations**: On app startup and component initialization
- **Data Keys**: `chouette_players` (Player[]), `chouette_session` (GameSession)
- **Auto-save Behavior**: Transparent to user, no loading indicators needed

## Responsive Design

The application uses custom Tailwind breakpoints optimized for iPad:

- **ipad**: 768px+ (iPad portrait)
- **ipad-landscape**: 1024px+ (iPad landscape)

Key responsive behaviors:
- Queue switches to 2-column layout at 7+ players
- Touch targets sized for finger interaction (44px+ minimum)
- Horizontal layout optimized for landscape orientation

## Next Features to Implement

### High Priority
- **Edit/delete players**: Manage player list with name changes and removal
- **Game history view**: Display previous rounds and completed chouettes
- **Player statistics**: Enhanced stats (win rate, average score, games played)
- **Undo functionality**: Reverse last round or last game completion

### Medium Priority  
- **Multiple concurrent sessions**: Support for running multiple chouette games
- **Export/import data**: Backup and restore player data and game history
- **Game log**: Detailed history of all rounds and rotations
- **Player search/filter**: Quick player lookup in selection dropdowns

### Low Priority
- **Advanced analytics**: Player performance trends and insights
- **Tournament mode**: Multi-chouette tournament brackets
- **Custom scoring rules**: Support for different point values and game variants
- **Dark mode**: Alternative color scheme for different lighting conditions

## Contributing

This project is ready for further development. Key areas for contribution:

1. **Feature additions** from the roadmap above
2. **Performance optimizations** for larger player counts and data sets
3. **Accessibility improvements** for screen readers and keyboard navigation
4. **Testing** - unit tests for services, integration tests for user flows
5. **Documentation** improvements and code comments

## License

This project is for educational and personal use. See LICENSE file for details.

---

**Built for the backgammon community** 🎲