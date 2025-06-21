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

export const ScoreInputModal = ({
  isOpen,
  boxPlayer,
  captainPlayer,
  queuePlayers,
  onCancel,
  onSubmit
}: ScoreInputModalProps) => {
  const [scores, setScores] = useState<{ [playerName: string]: number }>({});

  // Get all active players (not sitting out)
  const getActivePlayers = () => {
    const players = [];
    
    if (boxPlayer && !boxPlayer.sittingOut) {
      players.push({ name: boxPlayer.name, role: 'Box' });
    }
    
    if (captainPlayer && !captainPlayer.sittingOut) {
      players.push({ name: captainPlayer.name, role: 'Captain' });
    }
    
    queuePlayers
      .filter(player => !player.sittingOut)
      .forEach(player => {
        players.push({ name: player.name, role: `Queue #${player.id}` });
      });
    
    return players;
  };

  const activePlayers = getActivePlayers();

  // Initialize scores when modal opens
  useEffect(() => {
    if (isOpen) {
      const initialScores: { [playerName: string]: number } = {};
      activePlayers.forEach(player => {
        initialScores[player.name] = 0;
      });
      setScores(initialScores);
    }
  }, [isOpen, activePlayers.length]);

  // Calculate sum of all scores
  const totalSum = Object.values(scores).reduce((sum, score) => sum + score, 0);
  const isValidSum = totalSum === 0;
  const hasAllPlayers = activePlayers.length > 0;

  const incrementScore = (playerName: string) => {
    setScores(prev => ({
      ...prev,
      [playerName]: (prev[playerName] || 0) + 1
    }));
  };

  const decrementScore = (playerName: string) => {
    setScores(prev => ({
      ...prev,
      [playerName]: (prev[playerName] || 0) - 1
    }));
  };

  const handleSubmit = () => {
    if (isValidSum && hasAllPlayers) {
      onSubmit(scores);
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
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[80vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-center mb-6">Enter Round Scores</h2>
          
          {activePlayers.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              No active players to score
            </div>
          ) : (
            <>
              <div className="space-y-6 mb-6">
                {activePlayers.map((player) => (
                  <div key={player.name} className="flex items-center justify-between">
                    <div className="flex-1 pr-4">
                      <div className="font-semibold text-lg">{player.name}</div>
                      <div className="text-sm text-gray-500">{player.role}</div>
                    </div>
                    
                    {/* Touch-friendly score controls */}
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => decrementScore(player.name)}
                        className="w-12 h-12 bg-red-500 hover:bg-red-600 text-white rounded-lg font-bold text-xl flex items-center justify-center touch-manipulation transition-colors"
                        type="button"
                      >
                        −
                      </button>
                      
                      <div className="w-16 text-center">
                        <div className="text-2xl font-bold text-gray-800">
                          {scores[player.name] || 0}
                        </div>
                      </div>
                      
                      <button
                        onClick={() => incrementScore(player.name)}
                        className="w-12 h-12 bg-green-500 hover:bg-green-600 text-white rounded-lg font-bold text-xl flex items-center justify-center touch-manipulation transition-colors"
                        type="button"
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Score validation */}
              <div className="mb-6 p-4 rounded-lg bg-gray-50 border">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Total Sum:</span>
                  <span className={`font-bold ${isValidSum ? 'text-green-600' : 'text-red-600'}`}>
                    {totalSum}
                  </span>
                </div>
                {!isValidSum && (
                  <div className="text-sm text-red-600 mt-2">
                    Scores must sum to zero to continue
                  </div>
                )}
              </div>
            </>
          )}

          {/* Action buttons */}
          <div className="flex gap-4">
            <button
              onClick={handleCancel}
              className="flex-1 py-4 px-4 bg-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-400 transition-colors touch-manipulation text-lg"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!isValidSum || !hasAllPlayers}
              className="flex-1 py-4 px-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors touch-manipulation text-lg"
            >
              Submit Scores
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};