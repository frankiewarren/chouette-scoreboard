import { useState } from 'react';
import type { Player } from '../types';
import { playerService } from '../services/PlayerService';

interface PlayerSelectorProps {
  players: Player[];
  selectedPlayerId?: string;
  onPlayerSelect: (playerId: string) => void;
  placeholder?: string;
  className?: string;
}

export const PlayerSelector = ({ 
  players, 
  selectedPlayerId, 
  onPlayerSelect, 
  placeholder = "Select a player",
  className = ""
}: PlayerSelectorProps) => {
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newPlayerName, setNewPlayerName] = useState("");
  const [error, setError] = useState("");

  const handleAddNewPlayer = () => {
    setIsAddingNew(true);
    setNewPlayerName("");
    setError("");
  };

  const handleSaveNewPlayer = () => {
    if (!newPlayerName.trim()) {
      setError("Player name cannot be empty");
      return;
    }

    try {
      const newPlayer = playerService.createPlayer(newPlayerName.trim());
      if (newPlayer) {
        onPlayerSelect(newPlayer.id);
        setIsAddingNew(false);
        setNewPlayerName("");
        setError("");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create player");
    }
  };

  const handleCancelNewPlayer = () => {
    setIsAddingNew(false);
    setNewPlayerName("");
    setError("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveNewPlayer();
    } else if (e.key === 'Escape') {
      handleCancelNewPlayer();
    }
  };

  if (isAddingNew) {
    return (
      <div className={className}>
        <div className="space-y-4">
          <input
            type="text"
            value={newPlayerName}
            onChange={(e) => setNewPlayerName(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Enter player name"
            className="w-full p-4 text-xl text-center border-2 border-blue-400 rounded-lg focus:outline-none focus:border-blue-600"
            autoFocus
          />
          {error && (
            <div className="text-red-600 text-sm text-center">{error}</div>
          )}
          <div className="flex gap-3 justify-center">
            <button
              onClick={handleSaveNewPlayer}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors touch-manipulation"
            >
              Save
            </button>
            <button
              onClick={handleCancelNewPlayer}
              className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors touch-manipulation"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  const selectedPlayer = players.find(p => p.id === selectedPlayerId);

  return (
    <div className={className}>
      {!selectedPlayer ? (
        <div className="space-y-3">
          {players.length > 0 && (
            <select
              value={selectedPlayerId || ""}
              onChange={(e) => e.target.value && onPlayerSelect(e.target.value)}
              className="w-full p-4 text-xl text-center border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-600 bg-white"
            >
              <option value="">{placeholder}</option>
              {players.map((player) => (
                <option key={player.id} value={player.id}>
                  {player.name}
                </option>
              ))}
            </select>
          )}
          <button
            onClick={handleAddNewPlayer}
            className="w-full border-2 border-dashed border-gray-300 rounded-lg p-4 text-gray-500 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-colors text-xl font-medium touch-manipulation"
          >
            Add New Player
          </button>
        </div>
      ) : (
        <div 
          onClick={() => onPlayerSelect("")}
          className="w-full bg-blue-600 text-white rounded-lg p-8 text-2xl font-bold cursor-pointer hover:bg-blue-700 transition-colors touch-manipulation text-center"
        >
          {selectedPlayer.name}
        </div>
      )}
    </div>
  );
};