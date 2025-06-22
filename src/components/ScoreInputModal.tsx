import { useState, useEffect } from 'react';

interface Player {
  name: string;
  score: number;
  sittingOut: boolean;
}

interface QueuePlayer {
  id: number;
  name: string;
  score: number;
  sittingOut: boolean;
}

interface ScoreInputModalProps {
  isOpen: boolean;
  boxPlayer: Player | null;
  captainPlayer: Player | null;
  queuePlayers: QueuePlayer[];
  onCancel: () => void;
  onSubmit: (scores: { [playerName: string]: number }) => void;
}

// Doubling cube progression values including gammons (2x) and backgammons (3x)
const CUBE_VALUES = [
  -192, -128, -96, -64, -48, -32, -24, -16, -12, -8, -6, -4, -3, -2, -1,
  1, 2, 3, 4, 6, 8, 12, 16, 24, 32, 48, 64, 96, 128, 192
];
const DEFAULT_VALUE = 1;

export const ScoreInputModal = ({
  isOpen,
  boxPlayer,
  captainPlayer,
  queuePlayers,
  onCancel,
  onSubmit
}: ScoreInputModalProps) => {
  const [scores, setScores] = useState<{ [playerName: string]: number }>({});

  // Get team players (captain + queue players) excluding Box player
  const getTeamPlayers = () => {
    const players = [];
    
    // Team Captain first
    if (captainPlayer && !captainPlayer.sittingOut) {
      players.push({ name: captainPlayer.name, role: 'Team Captain' });
    }
    
    // Team players in queue order
    queuePlayers
      .filter(player => !player.sittingOut)
      .sort((a, b) => a.id - b.id) // Ensure queue order
      .forEach(player => {
        players.push({ name: player.name, role: `Team #${player.id}` });
      });
    
    return players;
  };

  const teamPlayers = getTeamPlayers();

  // Initialize scores when modal opens
  useEffect(() => {
    if (isOpen) {
      const initialScores: { [playerName: string]: number } = {};
      teamPlayers.forEach(player => {
        initialScores[player.name] = DEFAULT_VALUE;
      });
      setScores(initialScores);
    }
  }, [isOpen, teamPlayers.length]);

  // Calculate Box score (negative sum of all team scores)
  const teamScoreSum = Object.values(scores).reduce((sum, score) => sum + score, 0);
  const boxScore = -teamScoreSum;

  // Doubling cube navigation functions
  const moveToNextHigherValue = (currentValue: number): number => {
    const currentIndex = CUBE_VALUES.indexOf(currentValue);
    if (currentIndex === -1) return DEFAULT_VALUE;
    return currentIndex < CUBE_VALUES.length - 1 ? CUBE_VALUES[currentIndex + 1] : currentValue;
  };

  const moveToNextLowerValue = (currentValue: number): number => {
    const currentIndex = CUBE_VALUES.indexOf(currentValue);
    if (currentIndex === -1) return DEFAULT_VALUE;
    return currentIndex > 0 ? CUBE_VALUES[currentIndex - 1] : currentValue;
  };

  const incrementScore = (playerName: string) => {
    setScores(prev => ({
      ...prev,
      [playerName]: moveToNextHigherValue(prev[playerName] || DEFAULT_VALUE)
    }));
  };

  const decrementScore = (playerName: string) => {
    setScores(prev => ({
      ...prev,
      [playerName]: moveToNextLowerValue(prev[playerName] || DEFAULT_VALUE)
    }));
  };

  const canIncrement = (score: number) => score < 192;
  const canDecrement = (score: number) => score > -192;

  const handleSubmit = () => {
    if (teamPlayers.length > 0 && boxPlayer) {
      // Include Box player score in submission
      const allScores = {
        ...scores,
        [boxPlayer.name]: boxScore
      };
      onSubmit(allScores);
    }
  };

  const handleCancel = () => {
    setScores({});
    onCancel();
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.75)' }}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="p-6 pb-4 flex-shrink-0">
          <h2 className="text-2xl font-bold text-center">Enter Game Score</h2>
        </div>
        
        {/* Scrollable content area */}
        <div className="flex-1 overflow-y-auto px-6 pt-2">
          {teamPlayers.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              No active team players to score
            </div>
          ) : (
            <>
              {/* Team Players Scoring Section */}
              <div className="space-y-6 mb-8">
                {teamPlayers.map((player) => {
                  const playerScore = scores[player.name] || DEFAULT_VALUE;
                  return (
                    <div key={player.name} className="flex items-center justify-between">
                      <div className="flex-1 pr-4">
                        <div className="font-semibold text-lg">{player.name}</div>
                        <div className="text-sm text-gray-500">{player.role}</div>
                      </div>
                      
                      {/* Doubling cube controls */}
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => decrementScore(player.name)}
                          disabled={!canDecrement(playerScore)}
                          className="w-12 h-12 bg-red-500 hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg font-bold text-xl flex items-center justify-center touch-manipulation transition-colors"
                          type="button"
                        >
                          −
                        </button>
                        
                        <div className="w-20 text-center">
                          <div className="text-2xl font-bold text-gray-800">
                            {playerScore > 0 ? `+${playerScore}` : playerScore}
                          </div>
                        </div>
                        
                        <button
                          onClick={() => incrementScore(player.name)}
                          disabled={!canIncrement(playerScore)}
                          className="w-12 h-12 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg font-bold text-xl flex items-center justify-center touch-manipulation transition-colors"
                          type="button"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Box Player Auto-calculated Score Display */}
              {boxPlayer && (
                <div className="mb-6">
                  <div className="flex items-center justify-between bg-slate-50 p-4 rounded-lg">
                    <div className="flex-1">
                      <div className="font-semibold text-lg">{boxPlayer.name}</div>
                      <div className="text-sm text-gray-500">Box</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-slate-700">
                        {boxScore > 0 ? `+${boxScore}` : boxScore}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Fixed action buttons at bottom */}
        <div className="p-6 pt-4 flex-shrink-0">
          <div className="flex gap-4">
            <button
              onClick={handleCancel}
              className="flex-1 py-4 px-4 bg-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-400 transition-colors touch-manipulation text-lg"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={teamPlayers.length === 0 || !boxPlayer}
              className="flex-1 py-4 px-4 bg-slate-600 text-white rounded-lg font-semibold hover:bg-slate-700 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors touch-manipulation text-lg"
            >
              Submit Score
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};