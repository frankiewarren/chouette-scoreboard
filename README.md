# Backgammon Chouette Scoreboard

A modern web application for managing backgammon chouette games, optimized for iPad landscape orientation. Built for live tournament play with touch-friendly controls and automatic player rotation.

## Project Overview

This is a **Backgammon Chouette Scoreboard** designed for live play during tournaments and casual games. A chouette is a multiplayer backgammon format where multiple players take turns playing against a single "box" player, with spectators backing the current player.

### Key Design Goals
- **iPad-optimized**: Touch-friendly interface designed for iPad landscape orientation
- **Live tournament use**: Real-time score tracking and player management
- **Automatic rotation**: Implements official backgammon chouette rules
- **Professional UI**: Clean, modern interface suitable for competitive play

## Technical Stack

- **Frontend**: React 18 with TypeScript
- **Styling**: Tailwind CSS v4 with custom iPad breakpoints
- **Build Tool**: Vite for fast development and optimized builds
- **State Management**: Local state with React useState hooks
- **Responsive Design**: Custom breakpoints for iPad landscape (1024px+)

## Features Implemented

### ✅ Game Setup Phase
- **Progressive player addition**: Add Box, Captain, and Queue players one at a time
- **Touch-friendly inputs**: Large, easy-to-tap controls for player entry
- **Queue management**: Progressive display showing only filled positions + next empty slot
- **Validation**: Requires Box + Captain minimum to begin game

### ✅ Game Mode
- **Score input modal**: Professional modal with +/- button controls for score entry
- **Zero-sum validation**: Ensures all scores balance to zero before submission
- **Touch optimization**: 48px+ touch targets, no tiny input controls
- **Semi-transparent overlay**: Game state visible behind modal for context

### ✅ Player Rotation System
- **Box wins**: Box stays, Captain moves to back of queue, next player becomes Captain
- **Captain wins**: Captain becomes Box, old Box moves to back of queue, next player becomes Captain
- **No winner**: No rotation occurs when neither player has positive score
- **Sitting out support**: Players can be marked as sitting out (tap to gray out)

### ✅ Score Management
- **Running totals**: Scores accumulate across rounds
- **Color coding**: Green (positive), Red (negative), Gray (zero) score display
- **Real-time updates**: All player scores update immediately after each round

### ✅ Layout & UI
- **Horizontal split**: 50% left (Box/Captain), 50% right (Queue)
- **2-column queue**: Automatically switches to 2 columns for 7+ players
- **iPad landscape optimization**: Custom breakpoints and touch targets
- **Professional styling**: Clean, tournament-ready appearance

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
```

## Project Structure

```
src/
├── components/
│   ├── BoxSection.tsx          # Box player component
│   ├── CaptainSection.tsx      # Captain player component  
│   ├── QueueSection.tsx        # Spectator queue component
│   ├── ScoreInputModal.tsx     # Score entry modal
│   └── index.ts               # Component exports
├── App.tsx                    # Main application component
├── index.css                  # Tailwind CSS imports
└── main.tsx                   # React entry point
```

## Responsive Design

The application uses custom Tailwind breakpoints optimized for iPad:

- **ipad**: 768px+ (iPad portrait)
- **ipad-landscape**: 1024px+ (iPad landscape)

Key responsive behaviors:
- Queue switches to 2-column layout at 7+ players
- Touch targets sized for finger interaction (44px+ minimum)
- Horizontal layout optimized for landscape orientation

## State Management

The app uses React's built-in state management with the following key state:

- **Game mode**: 'setup' | 'game'
- **Players**: Box, Captain, and Queue arrays with scores and sitting out status
- **Modal state**: Score input modal open/closed state

## Next Features to Implement

### High Priority
- **Edit functionality**: Change player names mid-game
- **Game history**: View previous rounds and undo last round
- **Session persistence**: Save game state to localStorage

### Medium Priority  
- **Export capabilities**: Share/export final scores
- **Game timer**: Optional round timers
- **Player statistics**: Win/loss tracking across sessions

### Low Priority
- **Multiple chouettes**: Support for running multiple games
- **Custom scoring**: Support for different point values
- **Dark mode**: Alternative color scheme

## Contributing

This project is ready for further development. Key areas for contribution:

1. **Feature additions** from the roadmap above
2. **Performance optimizations** for larger player counts
3. **Accessibility improvements** for screen readers
4. **Testing** - unit tests and integration tests
5. **Documentation** improvements and code comments

## License

This project is for educational and personal use. See LICENSE file for details.

---

**Built for the backgammon community** 🎲