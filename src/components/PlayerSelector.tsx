import { useState } from 'react';
import type { Player } from '../types';
import { playerService } from '../services/PlayerService';

interface PlayerSelectorProps {
  players: Player[];
  selectedPlayerId?: string;
  onPlayerSelect: (playerId: string) => void;
  placeholder?: string;
  className?: string;
  colorScheme?: 'slate' | 'emerald';
  size?: 'large' | 'small';
}

export const PlayerSelector = ({ 
  players, 
  selectedPlayerId, 
  onPlayerSelect, 
  placeholder = "Select a player",
  className = "",
  colorScheme = "slate",
  size = "large"
}: PlayerSelectorProps) => {
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newPlayerName, setNewPlayerName] = useState("");
  const [error, setError] = useState("");

  // Color scheme mappings
  const colors = {
    slate: {
      border: 'border-slate-400',
      focusBorder: 'focus:border-slate-600',
      bg: 'bg-slate-600',
      hover: 'hover:bg-slate-700',
      hoverBorder: 'hover:border-slate-400',
      hoverText: 'hover:text-slate-600',
      hoverBg: 'hover:bg-slate-50'
    },
    emerald: {
      border: 'border-emerald-400',
      focusBorder: 'focus:border-emerald-600',
      bg: 'bg-emerald-700',
      hover: 'hover:bg-emerald-800',
      hoverBorder: 'hover:border-emerald-400',
      hoverText: 'hover:text-emerald-600',
      hoverBg: 'hover:bg-emerald-50'
    }
  };

  // Size mappings
  const sizes = {
    large: {
      padding: 'p-8',
      textSize: 'text-2xl',
      fontWeight: 'font-bold',
      addButtonBg: colors[colorScheme].bg,
      addButtonHover: colors[colorScheme].hover
    },
    small: {
      padding: 'p-3',
      textSize: 'text-base',
      fontWeight: 'font-semibold',
      addButtonBg: 'bg-emerald-600',
      addButtonHover: 'hover:bg-emerald-700'
    }
  };

  const currentColors = colors[colorScheme];
  const currentSize = sizes[size];

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


  const selectedPlayer = players.find(p => p.id === selectedPlayerId);

  return (
    <div className={className}>
      {!selectedPlayer ? (
        <div className="space-y-2">
          {/* Main content area */}
          <div>
            {isAddingNew ? (
              <input
                type="text"
                value={newPlayerName}
                onChange={(e) => setNewPlayerName(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Enter player name"
                className={`w-full p-4 text-xl text-center border-2 rounded-lg focus:outline-none ${
                  colorScheme === 'emerald' 
                    ? 'border-emerald-400 focus:border-emerald-600'
                    : 'border-slate-400 focus:border-slate-600'
                }`}
                autoFocus
              />
            ) : (
              <div className="space-y-3">
                {players.length > 0 && (
                  <select
                    value={selectedPlayerId || ""}
                    onChange={(e) => e.target.value && onPlayerSelect(e.target.value)}
                    className={`w-full p-4 text-xl text-center border-2 border-gray-300 rounded-lg focus:outline-none ${currentColors.focusBorder} bg-white`}
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
                  className={`w-full border-2 border-dashed border-gray-300 rounded-lg ${currentSize.padding} text-gray-500 ${currentColors.hoverBorder} ${currentColors.hoverText} ${currentColors.hoverBg} transition-colors ${currentSize.textSize} ${currentSize.fontWeight} touch-manipulation`}
                >
                  Add New Player
                </button>
              </div>
            )}
          </div>
          
          {/* Error message area - consistent height */}
          <div className="min-h-[1.25rem]">
            {error && (
              <div className="text-red-600 text-sm text-center">{error}</div>
            )}
          </div>
          
          {/* Button area - always present to prevent layout shift */}
          <div className="flex gap-3 justify-center min-h-[2.5rem] items-center">
            {isAddingNew ? (
              <>
                <button
                  onClick={handleSaveNewPlayer}
                  className={`px-6 py-2 ${currentColors.bg} text-white rounded-lg ${currentColors.hover} transition-colors touch-manipulation`}
                >
                  Save
                </button>
                <button
                  onClick={handleCancelNewPlayer}
                  className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors touch-manipulation"
                >
                  Cancel
                </button>
              </>
            ) : (
              <div className="invisible flex gap-3">
                <button className="px-6 py-2 rounded-lg opacity-0">Save</button>
                <button className="px-6 py-2 rounded-lg opacity-0">Cancel</button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div 
          onClick={() => onPlayerSelect("")}
          className={`w-full ${currentSize.addButtonBg} text-white rounded-lg ${currentSize.padding} ${currentSize.textSize} ${currentSize.fontWeight} cursor-pointer ${currentSize.addButtonHover} transition-colors touch-manipulation text-center`}
        >
          {selectedPlayer.name}
        </div>
      )}
    </div>
  );
};