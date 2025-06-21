import { useState } from 'react';
import type { Player, TeamPlayerData } from '../types';
import { PlayerSelector } from './PlayerSelector';

type GameMode = 'setup' | 'game';

interface TeamSectionProps {
  className?: string;
  gameMode?: GameMode;
  teamPlayers?: Array<{
    id: number;
    name: string;
    score: number;
    sittingOut: boolean;
  }>;
  onTeamPlayersChange?: (players: TeamPlayerData[]) => void;
  players?: Player[];
  onPlayersChanged?: () => void;
}

export const TeamSection = ({ 
  className = "", 
  gameMode = 'setup',
  teamPlayers = [],
  onTeamPlayersChange,
  players = [],
  onPlayersChanged
}: TeamSectionProps) => {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const maxTeamPositions = 12;

  const updateTeamPlayers = (newPlayers: TeamPlayerData[]) => {
    onTeamPlayersChange?.(newPlayers);
  };

  const handleAddPlayer = (index: number) => {
    if (gameMode === 'setup') {
      setEditingIndex(index);
    }
  };

  const handlePlayerSelect = (playerId: string) => {
    if (editingIndex !== null && playerId) {
      const newTeamData: TeamPlayerData = {
        id: editingIndex + 1,
        playerId,
        sittingOut: false
      };
      
      const currentTeamData: TeamPlayerData[] = teamPlayers.map(tp => {
        const player = players.find(p => p.name === tp.name);
        return {
          id: tp.id,
          playerId: player?.id || '',
          sittingOut: tp.sittingOut
        };
      });
      
      const existingIndex = currentTeamData.findIndex(q => q.id === editingIndex + 1);
      
      if (existingIndex >= 0) {
        currentTeamData[existingIndex] = newTeamData;
      } else {
        currentTeamData.push(newTeamData);
        currentTeamData.sort((a, b) => a.id - b.id);
      }
      
      updateTeamPlayers(currentTeamData);
      setEditingIndex(null);
    }
  };

  const toggleTeamPlayerSittingOut = (playerId: number) => {
    if (gameMode === 'game') {
      const currentTeamData: TeamPlayerData[] = teamPlayers.map(tp => {
        const player = players.find(p => p.name === tp.name);
        return {
          id: tp.id,
          playerId: player?.id || '',
          sittingOut: tp.id === playerId ? !tp.sittingOut : tp.sittingOut
        };
      });
      updateTeamPlayers(currentTeamData);
    }
  };

  const handleCancel = () => {
    setEditingIndex(null);
  };

  const getPlayerAtPosition = (position: number) => {
    return teamPlayers.find(p => p.id === position);
  };

  const renderTeamPosition = (position: number) => {
    const player = getPlayerAtPosition(position);
    const isEditing = editingIndex === position - 1;

    if (isEditing && gameMode === 'setup') {
      const availablePlayers = players.filter(p => 
        !teamPlayers.some(tp => tp.name === p.name)
      );

      return (
        <div key={position} className="space-y-2">
          <div className="text-sm font-semibold text-gray-600 mb-2">
            Position {position}:
          </div>
          <PlayerSelector
            players={availablePlayers}
            onPlayerSelect={(playerId) => {
              handlePlayerSelect(playerId);
              if (playerId) {
                onPlayersChanged?.();
              }
            }}
            placeholder="Select player for team"
          />
          <div className="flex justify-center">
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

    if (player) {
      if (gameMode === 'game') {
        return (
          <div
            key={position}
            onClick={() => toggleTeamPlayerSittingOut(player.id)}
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

    return null;
  };

  const getPositionsToShow = () => {
    const filledPositions = teamPlayers.sort((a, b) => a.id - b.id);
    const positions = [];
    
    for (const player of filledPositions) {
      positions.push(player.id);
    }
    
    if (gameMode === 'setup') {
      const nextEmptyPosition = filledPositions.length + 1;
      if (nextEmptyPosition <= maxTeamPositions) {
        positions.push(nextEmptyPosition);
      }
      
      if (positions.length === 0) {
        positions.push(1);
      }
    }
    
    return positions.sort((a, b) => a - b);
  };

  const positionsToShow = getPositionsToShow();
  const shouldUseColumns = positionsToShow.length >= 7;

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
      <h2 className="text-sm font-medium text-gray-400 mb-4 text-center">TEAM</h2>
      
      <div className="flex-1 overflow-y-auto">
        {shouldUseColumns ? (
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-3">
              {leftColumn.map(position => renderTeamPosition(position)).filter(Boolean)}
            </div>
            <div className="space-y-3">
              {rightColumn.map(position => renderTeamPosition(position)).filter(Boolean)}
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {positionsToShow.map(position => renderTeamPosition(position)).filter(Boolean)}
          </div>
        )}
      </div>
    </div>
  );
};