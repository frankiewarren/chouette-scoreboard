import { useState } from 'react';

type GameMode = 'setup' | 'game';

interface QueueSectionProps {
  className?: string;
  gameMode?: GameMode;
  queuePlayers?: QueuePlayer[];
  onQueuePlayersChange?: (players: QueuePlayer[]) => void;
}

interface QueuePlayer {
  id: number;
  name: string;
  score: number;
  sittingOut: boolean;
}

export const QueueSection = ({ 
  className = "", 
  gameMode = 'setup',
  queuePlayers = [],
  onQueuePlayersChange
}: QueueSectionProps) => {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [tempName, setTempName] = useState("");

  const maxQueuePositions = 12;

  const updateQueuePlayers = (newPlayers: QueuePlayer[]) => {
    onQueuePlayersChange?.(newPlayers);
  };

  const handleAddPlayer = (index: number) => {
    if (gameMode === 'setup') {
      setEditingIndex(index);
      setTempName("");
    }
  };

  const handleSavePlayer = () => {
    if (tempName.trim() && editingIndex !== null) {
      const newPlayer: QueuePlayer = {
        id: editingIndex + 1,
        name: tempName.trim(),
        score: 0,
        sittingOut: false
      };
      
      const updatedPlayers = [...queuePlayers];
      const existingIndex = updatedPlayers.findIndex(p => p.id === editingIndex + 1);
      
      if (existingIndex >= 0) {
        updatedPlayers[existingIndex] = newPlayer;
      } else {
        updatedPlayers.push(newPlayer);
        updatedPlayers.sort((a, b) => a.id - b.id);
      }
      
      updateQueuePlayers(updatedPlayers);
      setEditingIndex(null);
      setTempName("");
    }
  };

  const toggleQueuePlayerSittingOut = (playerId: number) => {
    if (gameMode === 'game') {
      const updatedPlayers = queuePlayers.map(player => 
        player.id === playerId 
          ? { ...player, sittingOut: !player.sittingOut }
          : player
      );
      updateQueuePlayers(updatedPlayers);
    }
  };

  const handleCancel = () => {
    setEditingIndex(null);
    setTempName("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSavePlayer();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  const getPlayerAtPosition = (position: number) => {
    return queuePlayers.find(p => p.id === position);
  };

  const renderQueuePosition = (position: number) => {
    const player = getPlayerAtPosition(position);
    const isEditing = editingIndex === position - 1;

    // Editing state (setup mode only)
    if (isEditing && gameMode === 'setup') {
      return (
        <div key={position} className="space-y-2">
          <input
            type="text"
            value={tempName}
            onChange={(e) => setTempName(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Enter player name"
            className="w-full p-3 text-center border-2 border-purple-400 rounded-lg focus:outline-none focus:border-purple-600"
            autoFocus
          />
          <div className="flex gap-2 justify-center">
            <button
              onClick={handleSavePlayer}
              className="px-4 py-1 bg-purple-600 text-white rounded text-sm hover:bg-purple-700 transition-colors touch-manipulation"
            >
              Save
            </button>
            <button
              onClick={handleCancel}
              className="px-4 py-1 bg-gray-300 text-gray-700 rounded text-sm hover:bg-gray-400 transition-colors touch-manipulation"
            >
              Cancel
            </button>
          </div>
        </div>
      );
    }

    // Player exists
    if (player) {
      if (gameMode === 'game') {
        // Game mode: show player with score and sitting out toggle
        return (
          <div
            key={position}
            onClick={() => toggleQueuePlayerSittingOut(player.id)}
            className={`rounded-lg p-3 cursor-pointer transition-colors touch-manipulation ${
              player.sittingOut 
                ? "bg-gray-400 text-gray-600" 
                : "bg-purple-600 text-white hover:bg-purple-700"
            }`}
          >
            <div>
              <span className="font-semibold">{position}.</span> {player.name}
            </div>
            <div className="text-sm mt-1">
              Score: <span className={
                player.score > 0 ? "text-green-200" :
                player.score < 0 ? "text-red-200" :
                "text-gray-300"
              }>{player.score}</span>
            </div>
          </div>
        );
      } else {
        // Setup mode: editable player
        return (
          <div
            key={position}
            onClick={() => handleAddPlayer(position - 1)}
            className="bg-purple-600 text-white rounded-lg p-3 cursor-pointer hover:bg-purple-700 transition-colors touch-manipulation"
          >
            <span className="font-semibold">{position}.</span> {player.name}
          </div>
        );
      }
    }

    // Empty slot (setup mode only)
    if (gameMode === 'setup') {
      return (
        <button
          key={position}
          onClick={() => handleAddPlayer(position - 1)}
          className="border-2 border-dashed border-gray-300 rounded-lg p-3 text-gray-500 hover:border-purple-400 hover:text-purple-600 hover:bg-purple-50 transition-colors touch-manipulation text-left"
        >
          <span className="font-semibold">{position}.</span> Add Player
        </button>
      );
    }

    // Game mode with no player - don't render empty slots
    return null;
  };

  // Progressive queue display: show filled slots + one empty slot (setup mode)
  // In game mode, only show filled positions
  const getPositionsToShow = () => {
    const filledPositions = queuePlayers.sort((a, b) => a.id - b.id);
    const positions = [];
    
    // Add all filled positions
    for (const player of filledPositions) {
      positions.push(player.id);
    }
    
    if (gameMode === 'setup') {
      // Add the next empty position (if we haven't reached max)
      const nextEmptyPosition = filledPositions.length + 1;
      if (nextEmptyPosition <= maxQueuePositions) {
        positions.push(nextEmptyPosition);
      }
      
      // If no players yet, show position 1
      if (positions.length === 0) {
        positions.push(1);
      }
    }
    
    return positions.sort((a, b) => a - b);
  };

  const positionsToShow = getPositionsToShow();
  const shouldUseColumns = positionsToShow.length >= 7;

  // Split positions into two columns when there are 7+ positions
  const getColumnLayout = () => {
    if (!shouldUseColumns) {
      return { leftColumn: positionsToShow, rightColumn: [] };
    }
    
    const midPoint = Math.ceil(positionsToShow.length / 2);
    return {
      leftColumn: positionsToShow.slice(0, midPoint),
      rightColumn: positionsToShow.slice(midPoint)
    };
  };

  const { leftColumn, rightColumn } = getColumnLayout();

  return (
    <div className={`bg-white rounded-lg shadow-lg p-6 h-full flex flex-col ${className}`}>
      <h2 className="text-2xl font-bold mb-6 text-center">Spectator Queue</h2>
      
      <div className="flex-1 overflow-y-auto">
        {shouldUseColumns ? (
          // Two-column layout for 7+ players
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-3">
              {leftColumn.map(position => renderQueuePosition(position)).filter(Boolean)}
            </div>
            <div className="space-y-3">
              {rightColumn.map(position => renderQueuePosition(position)).filter(Boolean)}
            </div>
          </div>
        ) : (
          // Single column layout for 6 or fewer players
          <div className="space-y-3">
            {positionsToShow.map(position => renderQueuePosition(position)).filter(Boolean)}
          </div>
        )}
      </div>
    </div>
  );
};