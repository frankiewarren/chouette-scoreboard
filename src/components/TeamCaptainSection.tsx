import { useState } from 'react';

type GameMode = 'setup' | 'game';

interface Player {
  name: string;
  score: number;
  sittingOut: boolean;
}

interface TeamCaptainSectionProps {
  className?: string;
  gameMode?: GameMode;
  player?: Player | null;
  onPlayerAdd?: (playerName: string) => void;
  onToggleSittingOut?: () => void;
}

export const TeamCaptainSection = ({ 
  className = "", 
  gameMode = 'setup', 
  player, 
  onPlayerAdd, 
  onToggleSittingOut 
}: TeamCaptainSectionProps) => {
  const [teamCaptainPlayer, setTeamCaptainPlayer] = useState<string>("");
  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState("");

  const handleAddPlayer = () => {
    setIsEditing(true);
    setTempName("");
  };

  const handleSavePlayer = () => {
    if (tempName.trim()) {
      setTeamCaptainPlayer(tempName.trim());
      onPlayerAdd?.(tempName.trim());
      setIsEditing(false);
      setTempName("");
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setTempName("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSavePlayer();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  // Game mode display
  if (gameMode === 'game' && player) {
    return (
      <div className={`bg-white rounded-lg shadow-lg p-6 h-full flex flex-col justify-center ${className}`}>
        <div className="text-center">
          <h2 className="text-sm font-medium text-gray-400 mb-3">TEAM CAPTAIN</h2>
          
          <div 
            onClick={onToggleSittingOut}
            className={`w-full rounded-lg p-8 text-2xl font-bold cursor-pointer transition-colors touch-manipulation ${
              player.sittingOut 
                ? "bg-gray-400 text-gray-600" 
                : "bg-emerald-700 text-white hover:bg-emerald-800"
            }`}
          >
            <div>{player.name}</div>
            <div className="text-lg font-medium mt-2">
              Score: <span className={
                player.score > 0 ? "text-emerald-200" :
                player.score < 0 ? "text-red-200" :
                "text-gray-300"
              }>{player.score}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Setup mode display (original functionality)
  return (
    <div className={`bg-white rounded-lg shadow-lg p-6 h-full flex flex-col justify-center ${className}`}>
      <div className="text-center">
        <h2 className="text-sm font-medium text-gray-400 mb-3">TEAM CAPTAIN</h2>
        
        {!teamCaptainPlayer && !isEditing ? (
          <button
            onClick={handleAddPlayer}
            className="w-full border-2 border-dashed border-gray-300 rounded-lg p-8 text-gray-500 hover:border-emerald-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors text-xl font-medium touch-manipulation"
          >
            Add Player
          </button>
        ) : isEditing ? (
          <div className="space-y-4">
            <input
              type="text"
              value={tempName}
              onChange={(e) => setTempName(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Enter player name"
              className="w-full p-4 text-xl text-center border-2 border-emerald-400 rounded-lg focus:outline-none focus:border-emerald-600"
              autoFocus
            />
            <div className="flex gap-3 justify-center">
              <button
                onClick={handleSavePlayer}
                className="px-6 py-2 bg-emerald-700 text-white rounded-lg hover:bg-emerald-800 transition-colors touch-manipulation"
              >
                Save
              </button>
              <button
                onClick={handleCancel}
                className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors touch-manipulation"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div 
            onClick={() => setIsEditing(true)}
            className="w-full bg-emerald-700 text-white rounded-lg p-8 text-2xl font-bold cursor-pointer hover:bg-emerald-800 transition-colors touch-manipulation"
          >
            {teamCaptainPlayer}
          </div>
        )}
      </div>
    </div>
  );
};